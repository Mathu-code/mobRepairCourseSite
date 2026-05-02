import { Router, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';
import Course from '../models/Course';
import Note from '../models/Note';
import Purchase from '../models/Purchase';
import Enrollment, { EnrollmentStatus } from '../models/Enrollment';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || '').trim().replace(/^['\"]|['\"]$/g, '');
const paypalClientId = (process.env.PAYPAL_CLIENT_ID || '').trim();
const paypalClientSecret = (process.env.PAYPAL_CLIENT_SECRET || '').trim();
const paypalMode = (process.env.PAYPAL_MODE || 'sandbox').trim().toLowerCase();
const frontendUrl = (process.env.FRONTEND_URL || process.env.CORS_ORIGINS?.split(',')[0] || 'http://localhost:5173').trim().replace(/\/$/, '');
const platformFeePercent = Math.max(0, Math.min(100, Number(process.env.PLATFORM_FEE_PERCENT || 10)));
const paypalBaseUrl = paypalMode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey)
  : null;
const stripeReady = !!stripe && /^sk_/.test(stripeSecretKey);
const paypalReady = !!paypalClientId && !!paypalClientSecret;

const isValidCardNumber = (value: string) => /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/.test(value.trim());
const isValidExpiry = (value: string) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(value.trim());
const isValidCvv = (value: string) => /^\d{3,4}$/.test(value.trim());

const normalizeCouponCode = (code: string) => String(code || '').trim().toUpperCase();

const calculatePayoutSplit = (amount: number) => {
  const platformFee = Number((amount * (platformFeePercent / 100)).toFixed(2));
  const instructorEarnings = Number((amount - platformFee).toFixed(2));
  return { platformFee, instructorEarnings };
};

const generateCourseCoupon = (courseId: string) => {
  const normalizedId = String(courseId || '').toLowerCase();
  const hash = normalizedId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const discountPercent = 5 + (hash % 6); // 5% to 10%
  const suffix = normalizedId.slice(-4).toUpperCase();
  return {
    code: `REPAIR${discountPercent}${suffix}`,
    discountPercent
  };
};

const generateNoteCoupon = (noteId: string) => {
  const normalizedId = String(noteId || '').toLowerCase();
  const hash = normalizedId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const discountPercent = 5 + (hash % 6); // 5% to 10%
  const suffix = normalizedId.slice(-4).toUpperCase();
  return {
    code: `GUIDE${discountPercent}${suffix}`,
    discountPercent
  };
};

const resolveCourseDiscount = (itemType: 'course' | 'note', itemId: string, couponCode?: string) => {
  const suggestedCoupon = itemType === 'course' ? generateCourseCoupon(itemId) : generateNoteCoupon(itemId);

  if (!suggestedCoupon) {
    return { appliedCouponCode: '', discountPercent: 0, suggestedCoupon: null as any };
  }

  const normalizedInput = normalizeCouponCode(String(couponCode || ''));

  if (!normalizedInput) {
    return { appliedCouponCode: '', discountPercent: 0, suggestedCoupon };
  }

  if (normalizedInput !== suggestedCoupon.code) {
    throw new Error('Invalid coupon code for this course');
  }

  return {
    appliedCouponCode: suggestedCoupon.code,
    discountPercent: suggestedCoupon.discountPercent,
    suggestedCoupon
  };
};

router.get('/config', (_req, res: Response) => {
  res.json({
    success: true,
    data: {
      stripeEnabled: stripeReady,
      paypalEnabled: paypalReady
    }
  });
});

router.get('/paypal/config', (_req, res: Response) => {
  res.json({
    success: true,
    data: {
      paypalEnabled: paypalReady
    }
  });
});

const resolveItem = async (itemType: 'course' | 'note', itemId: string) => {
  if (itemType === 'course') {
    const course = await Course.findById(itemId);
    if (!course) throw new Error('Course not found');
    return {
      item: course,
      amount: Number(course.discountPrice ?? course.price ?? 0),
      title: course.title,
      instructorId: course.instructorId,
      duplicateQuery: { userId: undefined as any, courseId: itemId }
    };
  }

  const note = await Note.findById(itemId);
  if (!note) throw new Error('Note not found');
  return {
    item: note,
    amount: Number(note.discountPrice ?? note.price ?? 0),
    title: note.title,
    instructorId: note.instructorId,
    duplicateQuery: { userId: undefined as any, itemType: 'note', itemId }
  };
};

const getPayPalAccessToken = async () => {
  if (!paypalReady) {
    throw new Error('PayPal is not configured on the server');
  }

  const credentials = Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64');
  const response = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const json: any = await response.json().catch(() => ({}));
  if (!response.ok || !json?.access_token) {
    throw new Error(json?.error_description || 'Unable to authenticate with PayPal');
  }

  return String(json.access_token);
};

const getPayPalApproveLink = (links: Array<{ rel?: string; href?: string }> = []) => {
  return links.find((link) => link?.rel === 'approve')?.href || '';
};

const getPayPalOrderDetails = async (orderId: string, accessToken: string) => {
  const response = await fetch(`${paypalBaseUrl}/v2/checkout/orders/${String(orderId).trim()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  const json: any = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json?.message || json?.error?.message || 'Failed to read PayPal order');
  }

  return json;
};

const getPayPalCaptureInfo = (orderDetails: any) => {
  const capture = orderDetails?.purchase_units?.[0]?.payments?.captures?.[0] || null;
  const amountValue = capture?.amount?.value ?? orderDetails?.purchase_units?.[0]?.amount?.value ?? 0;

  return {
    status: String(orderDetails?.status || '').toUpperCase(),
    captureId: String(capture?.id || '').trim(),
    amount: Number(amountValue || 0)
  };
};

const buildPayPalCaptureResponse = ({
  purchase,
  itemType,
  itemId,
  resolvedTitle,
  amount,
  firstName,
  lastName,
  email,
  country,
  discountInfo,
  message
}: {
  purchase: any;
  itemType: 'course' | 'note';
  itemId: string;
  resolvedTitle: string;
  amount: number;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  discountInfo: { discountPercent: number; appliedCouponCode: string };
  message: string;
}) => {
  return {
    success: true,
    message,
    data: {
      purchaseId: purchase._id,
      transactionId: purchase.transactionId,
      orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      itemType,
      itemId,
      itemTitle: resolvedTitle,
      amount,
      paymentMethod: purchase.paymentMethod,
      customerName: `${String(firstName || '').trim()} ${String(lastName || '').trim()}`.trim(),
      email,
      country,
      courseId: itemType === 'course' ? itemId : '',
      noteId: itemType === 'note' ? itemId : '',
      discountPercent: discountInfo.discountPercent,
      couponCode: discountInfo.appliedCouponCode
    }
  };
};

router.post('/create-intent', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!stripeReady || !stripe) {
      return res.status(503).json({ success: false, message: 'Stripe card payment is not configured on the server' });
    }

    const { itemType, itemId, couponCode } = req.body || {};

    if (!['course', 'note'].includes(itemType)) {
      return res.status(400).json({ success: false, message: 'Invalid item type' });
    }

    if (!isValidObjectId(String(itemId || ''))) {
      return res.status(400).json({ success: false, message: 'Invalid item id' });
    }

    const resolved = await resolveItem(itemType, itemId);
    const discountInfo = resolveCourseDiscount(itemType, itemId, couponCode);
    const discountedAmount = Number((resolved.amount * (1 - discountInfo.discountPercent / 100)).toFixed(2));
    const amountInCents = Math.max(50, Math.round(discountedAmount * 100));

    if (itemType === 'course') {
      const existingEnrollment = await Enrollment.findOne({
        userId: req.user!.userId,
        courseId: itemId
      });

      if (existingEnrollment) {
        return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
      }
    } else {
      const existingPurchase = await Purchase.findOne({
        userId: req.user!.userId,
        itemType,
        itemId
      });

      if (existingPurchase) {
        return res.status(400).json({ success: false, message: 'You already purchased this item' });
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        itemType,
        itemId,
        userId: req.user!.userId,
        couponCode: discountInfo.appliedCouponCode,
        discountPercent: String(discountInfo.discountPercent)
      }
    });

    return res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: discountedAmount,
        currency: 'usd',
        discountPercent: discountInfo.discountPercent,
        couponCode: discountInfo.appliedCouponCode,
        suggestedCoupon: discountInfo.suggestedCoupon
      }
    });
  } catch (error: any) {
    console.error('Create intent error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create payment intent' });
  }
});

router.post('/paypal/create-order', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!paypalReady) {
      return res.status(503).json({ success: false, message: 'PayPal is not configured on the server' });
    }

    const { itemType, itemId, couponCode } = req.body || {};

    if (!['course', 'note'].includes(itemType)) {
      return res.status(400).json({ success: false, message: 'Invalid item type' });
    }

    if (!isValidObjectId(String(itemId || ''))) {
      return res.status(400).json({ success: false, message: 'Invalid item id' });
    }

    const resolved = await resolveItem(itemType, itemId);
    const discountInfo = resolveCourseDiscount(itemType, itemId, couponCode);
    const discountedAmount = Number((resolved.amount * (1 - discountInfo.discountPercent / 100)).toFixed(2));

    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: `${itemType}:${itemId}`,
            description: resolved.title,
            custom_id: String(req.user!.userId),
            amount: {
              currency_code: 'USD',
              value: discountedAmount.toFixed(2)
            }
          }
        ],
        application_context: {
          brand_name: 'MobRepairHouse',
          user_action: 'PAY_NOW',
          return_url: `${frontendUrl}/checkout/${itemType}/${itemId}`,
          cancel_url: `${frontendUrl}/checkout/${itemType}/${itemId}`
        }
      })
    });

    const json: any = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(json?.message || json?.error?.message || 'Failed to create PayPal order');
    }

    const approveUrl = getPayPalApproveLink(json?.links || []);
    if (!approveUrl) {
      throw new Error('PayPal approval link not found');
    }

    res.json({
      success: true,
      data: {
        orderId: json.id,
        approveUrl,
        amount: discountedAmount,
        currency: 'usd',
        discountPercent: discountInfo.discountPercent,
        couponCode: discountInfo.appliedCouponCode
      }
    });
  } catch (error: any) {
    console.error('PayPal create order error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create PayPal order' });
  }
});

router.post('/paypal/capture-order', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!paypalReady) {
      return res.status(503).json({ success: false, message: 'PayPal is not configured on the server' });
    }

    const { orderId, itemType, itemId, couponCode, firstName, lastName, email, country } = req.body || {};

    if (!String(orderId || '').trim()) {
      return res.status(400).json({ success: false, message: 'Missing PayPal order id' });
    }

    if (!['course', 'note'].includes(itemType)) {
      return res.status(400).json({ success: false, message: 'Invalid item type' });
    }

    if (!isValidObjectId(String(itemId || ''))) {
      return res.status(400).json({ success: false, message: 'Invalid item id' });
    }

    const resolved = await resolveItem(itemType, itemId);
    const discountInfo = resolveCourseDiscount(itemType, itemId, couponCode);
    const amount = Number((resolved.amount * (1 - discountInfo.discountPercent / 100)).toFixed(2));
    const orderIdValue = String(orderId).trim();
    const accessToken = await getPayPalAccessToken();
    const orderDetails = await getPayPalOrderDetails(orderIdValue, accessToken);
    const captureInfo = getPayPalCaptureInfo(orderDetails);

    const existingPurchase = await Purchase.findOne({
      userId: req.user!.userId,
      itemType,
      itemId,
      externalPaymentId: orderIdValue
    });

    if (existingPurchase) {
      return res.json(
        buildPayPalCaptureResponse({
          purchase: existingPurchase,
          itemType,
          itemId,
          resolvedTitle: resolved.title,
          amount: existingPurchase.amount,
          firstName,
          lastName,
          email,
          country,
          discountInfo,
          message: 'Payment already captured'
        })
      );
    }

    if (captureInfo.status === 'COMPLETED') {
      if (Math.abs(captureInfo.amount - amount) > 0.01) {
        return res.status(400).json({ success: false, message: 'Payment amount mismatch' });
      }

      const { platformFee, instructorEarnings } = calculatePayoutSplit(amount);
      const purchase = await Purchase.create({
        userId: req.user!.userId,
        instructorId: resolved.instructorId || null,
        itemType,
        itemId,
        amount,
        platformFee,
        instructorEarnings,
        paymentProvider: 'paypal',
        paymentStatus: 'paid',
        paymentMethod: `PayPal (${String(email || '').trim() || 'guest'})`,
        externalPaymentId: orderIdValue,
        transactionId: captureInfo.captureId || `paypal_${uuidv4().replace(/-/g, '').slice(0, 24)}`,
        payoutStatus: 'eligible'
      });

      return res.status(201).json(
        buildPayPalCaptureResponse({
          purchase,
          itemType,
          itemId,
          resolvedTitle: resolved.title,
          amount,
          firstName,
          lastName,
          email,
          country,
          discountInfo,
          message: 'PayPal payment completed successfully'
        })
      );
    }

    if (captureInfo.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: `PayPal order is not ready for capture (status: ${captureInfo.status || 'unknown'})`
      });
    }

    const response = await fetch(`${paypalBaseUrl}/v2/checkout/orders/${orderIdValue}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const json: any = await response.json().catch(() => ({}));
    const captureDetails = getPayPalCaptureInfo(json);

    if (!response.ok) {
      const latestOrderDetails = await getPayPalOrderDetails(orderIdValue, accessToken).catch(() => null);
      const latestCaptureInfo = latestOrderDetails ? getPayPalCaptureInfo(latestOrderDetails) : captureDetails;

      if (latestCaptureInfo.status === 'COMPLETED') {
        if (Math.abs(latestCaptureInfo.amount - amount) > 0.01) {
          return res.status(400).json({ success: false, message: 'Payment amount mismatch' });
        }

        const { platformFee, instructorEarnings } = calculatePayoutSplit(amount);
        const purchase = await Purchase.create({
          userId: req.user!.userId,
          instructorId: resolved.instructorId || null,
          itemType,
          itemId,
          amount,
          platformFee,
          instructorEarnings,
          paymentProvider: 'paypal',
          paymentStatus: 'paid',
          paymentMethod: `PayPal (${String(email || '').trim() || 'guest'})`,
          externalPaymentId: orderIdValue,
          transactionId: latestCaptureInfo.captureId || `paypal_${uuidv4().replace(/-/g, '').slice(0, 24)}`,
          payoutStatus: 'eligible'
        });

        return res.status(201).json(
          buildPayPalCaptureResponse({
            purchase,
            itemType,
            itemId,
            resolvedTitle: resolved.title,
            amount,
            firstName,
            lastName,
            email,
            country,
            discountInfo,
            message: 'PayPal payment completed successfully'
          })
        );
      }

      throw new Error(
        json?.details?.[0]?.description ||
          json?.details?.[0]?.issue ||
          json?.message ||
          json?.error?.message ||
          'Failed to capture PayPal order'
      );
    }

    const captureAmount = Number(json?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || captureDetails.amount || 0);
    if (Math.abs(captureAmount - amount) > 0.01) {
      return res.status(400).json({ success: false, message: 'Payment amount mismatch' });
    }

    const { platformFee, instructorEarnings } = calculatePayoutSplit(amount);

    const purchase = await Purchase.create({
      userId: req.user!.userId,
      instructorId: resolved.instructorId || null,
      itemType,
      itemId,
      amount,
      platformFee,
      instructorEarnings,
      paymentProvider: 'paypal',
      paymentStatus: 'paid',
      paymentMethod: `PayPal (${String(email || '').trim() || 'guest'})`,
      externalPaymentId: String(orderId).trim(),
      transactionId: json?.purchase_units?.[0]?.payments?.captures?.[0]?.id || `paypal_${uuidv4().replace(/-/g, '').slice(0, 24)}`,
      payoutStatus: 'eligible'
    });

    res.status(201).json(
      buildPayPalCaptureResponse({
        purchase,
        itemType,
        itemId,
        resolvedTitle: resolved.title,
        amount,
        firstName,
        lastName,
        email,
        country,
        discountInfo,
        message: 'PayPal payment completed successfully'
      })
    );
  } catch (error: any) {
    console.error('PayPal capture error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to capture PayPal payment' });
  }
});

router.post('/confirm', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      itemType,
      itemId,
      paymentMethod,
      firstName,
      lastName,
      email,
      country,
      paypalEmail,
      paymentIntentId,
      couponCode
    } = req.body || {};

    if (!['course', 'note'].includes(itemType)) {
      return res.status(400).json({ success: false, message: 'Invalid item type' });
    }

    if (!isValidObjectId(String(itemId || ''))) {
      return res.status(400).json({ success: false, message: 'Invalid item id' });
    }

    if (!['card', 'paypal'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }

    const customerName = `${String(firstName || '').trim()} ${String(lastName || '').trim()}`.trim();
    if (!customerName || !String(email || '').trim()) {
      return res.status(400).json({ success: false, message: 'Customer details are required' });
    }

    let paymentLabel = '';
    if (paymentMethod === 'card') {
      if (!stripeReady || !stripe) {
        return res.status(503).json({ success: false, message: 'Stripe card payment is not configured on the server' });
      }

      if (!String(paymentIntentId || '').trim()) {
        return res.status(400).json({ success: false, message: 'Missing payment intent id' });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(String(paymentIntentId));
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ success: false, message: 'Payment has not been completed' });
      }

      paymentLabel = 'Credit Card';
    } else {
      if (!String(paypalEmail || '').trim()) {
        return res.status(400).json({ success: false, message: 'PayPal email is required' });
      }
      paymentLabel = `PayPal (${String(paypalEmail).trim()})`;
    }

    let item: any = null;
    let baseAmount = 0;

    if (itemType === 'course') {
      item = await Course.findById(itemId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      baseAmount = Number(item.discountPrice ?? item.price ?? 0);

      const existingEnrollment = await Enrollment.findOne({
        userId: req.user!.userId,
        courseId: itemId
      });

      if (existingEnrollment) {
        return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
      }

      await Enrollment.create({
        userId: req.user!.userId,
        courseId: itemId,
        status: EnrollmentStatus.ACTIVE,
        progress: 0
      });
    } else {
      item = await Note.findById(itemId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Note not found' });
      }
      baseAmount = Number(item.discountPrice ?? item.price ?? 0);

      const existingPurchase = await Purchase.findOne({
        userId: req.user!.userId,
        itemType: 'note',
        itemId
      });

      if (existingPurchase) {
        return res.status(400).json({ success: false, message: 'You have already purchased this note' });
      }

      item.downloads = (item.downloads || 0) + 1;
      await item.save();
    }

    const discountInfo = resolveCourseDiscount(itemType, itemId, couponCode);
    const amount = Number((baseAmount * (1 - discountInfo.discountPercent / 100)).toFixed(2));
    const { platformFee, instructorEarnings } = calculatePayoutSplit(amount);

    if (paymentMethod === 'card' && stripe && paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(String(paymentIntentId));
      const intentAmount = Number(paymentIntent.amount || 0) / 100;
      if (Math.abs(intentAmount - amount) > 0.01) {
        return res.status(400).json({ success: false, message: 'Payment amount mismatch' });
      }
    }

    const purchase = await Purchase.create({
      userId: req.user!.userId,
      instructorId: item?.instructorId || null,
      itemType,
      itemId,
      amount,
      platformFee,
      instructorEarnings,
      paymentProvider: paymentMethod === 'card' ? 'stripe' : 'paypal',
      paymentStatus: 'paid',
      paymentMethod: paymentLabel,
      externalPaymentId: paymentMethod === 'card' ? String(paymentIntentId || '').trim() : String(paypalEmail || '').trim(),
      transactionId: `txn_${uuidv4().replace(/-/g, '').slice(0, 24)}`,
      payoutStatus: 'eligible'
    });

    res.status(201).json({
      success: true,
      message: 'Payment completed successfully',
      data: {
        purchaseId: purchase._id,
        transactionId: purchase.transactionId,
        orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
        itemType,
        itemId,
        itemTitle: item?.title || '',
        amount,
        paymentMethod: paymentLabel,
        customerName,
        email,
        country,
        courseId: itemType === 'course' ? itemId : '',
        noteId: itemType === 'note' ? itemId : '',
        discountPercent: discountInfo.discountPercent,
        couponCode: discountInfo.appliedCouponCode
      }
    });
  } catch (error: any) {
    console.error('Payment confirm error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process payment'
    });
  }
});

export default router;