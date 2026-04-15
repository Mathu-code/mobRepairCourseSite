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
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey)
  : null;
const stripeReady = !!stripe && /^sk_/.test(stripeSecretKey);

const isValidCardNumber = (value: string) => /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/.test(value.trim());
const isValidExpiry = (value: string) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(value.trim());
const isValidCvv = (value: string) => /^\d{3,4}$/.test(value.trim());

const normalizeCouponCode = (code: string) => String(code || '').trim().toUpperCase();

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
      stripeEnabled: stripeReady
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
      duplicateQuery: { userId: undefined as any, courseId: itemId }
    };
  }

  const note = await Note.findById(itemId);
  if (!note) throw new Error('Note not found');
  return {
    item: note,
    amount: Number(note.discountPrice ?? note.price ?? 0),
    title: note.title,
    duplicateQuery: { userId: undefined as any, itemType: 'note', itemId }
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

    if (paymentMethod === 'card' && stripe && paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(String(paymentIntentId));
      const intentAmount = Number(paymentIntent.amount || 0) / 100;
      if (Math.abs(intentAmount - amount) > 0.01) {
        return res.status(400).json({ success: false, message: 'Payment amount mismatch' });
      }
    }

    const purchase = await Purchase.create({
      userId: req.user!.userId,
      itemType,
      itemId,
      amount,
      paymentMethod: paymentLabel,
      transactionId: `txn_${uuidv4().replace(/-/g, '').slice(0, 24)}`
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