import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Smartphone, CreditCard, FileText, ShieldCheck, Lock } from 'lucide-react';
import { Header } from '../components/Header';
import { apiUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { readCartItems, writeCartItems } from '../lib/cart';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

type CheckoutItem = {
  title: string;
  price: number;
  courseId?: string;
  noteId?: string;
  itemType: 'course' | 'note';
};

type PaymentMethod = 'card' | 'paypal';

type PayPalCheckoutContext = {
  itemType: 'course' | 'note';
  itemId: string;
  couponCode: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  paypalEmail: string;
};

const PAYPAL_CHECKOUT_CONTEXT_KEY = 'paypalCheckoutContext';

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

type CheckoutPageProps = {
  itemData: CheckoutItem;
  loading?: boolean;
  id?: string;
  type?: string;
  stripeDisabled?: boolean;
};

export function CheckoutPage() {
  const { type, id } = useParams();
  const [itemData, setItemData] = useState<CheckoutItem>({
    title: type === 'course' ? 'Loading course...' : 'Loading guide...',
    price: 0,
    courseId: type === 'course' ? id : undefined,
    noteId: type === 'note' ? id : undefined,
    itemType: type === 'note' ? 'note' : 'course'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItem = async () => {
      try {
        setLoading(true);
        if (type === 'note' && id) {
          const res = await fetch(apiUrl(`/api/notes/${id}`));
          const json = await res.json().catch(() => ({}));
          if (res.ok && json?.success && json?.data) {
            setItemData({
              title: json.data.title || 'Repair Guide',
              price: Number(json.data.discountPrice ?? json.data.price ?? 24.99),
              noteId: String(json.data._id || id),
              itemType: 'note'
            });
            return;
          }
        }

        if (type === 'course' && id) {
          const res = await fetch(apiUrl(`/api/courses/${id}`));
          const json = await res.json().catch(() => ({}));
          if (res.ok && json?.success && json?.data) {
            setItemData({
              title: json.data.title || 'Repair Course',
              price: Number(json.data.discountPrice ?? json.data.price ?? 89.99),
              courseId: String(json.data._id || id),
              itemType: 'course'
            });
            return;
          }
        }
      } catch (error) {
        console.error('Failed to load checkout item', error);
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [id, type]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading checkout...</div>
      </div>
    );
  }

  if (!stripePromise) {
    return <CheckoutForm itemData={itemData} loading={loading} id={id} type={type} stripeDisabled />;
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm itemData={itemData} loading={loading} id={id} type={type} stripeDisabled={false} />
    </Elements>
  );
}

function CheckoutForm({ itemData, id, stripeDisabled = false }: CheckoutPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [creatingIntent, setCreatingIntent] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [serverStripeEnabled, setServerStripeEnabled] = useState<boolean | null>(null);
  const [serverPaypalEnabled, setServerPaypalEnabled] = useState<boolean | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [appliedCouponPercent, setAppliedCouponPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponMessageType, setCouponMessageType] = useState<'success' | 'error' | ''>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalRedirecting, setPaypalRedirecting] = useState(false);
  const [capturingPaypal, setCapturingPaypal] = useState(false);
  const paypalToken = searchParams.get('token') || searchParams.get('paypalOrderId') || '';

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PAYPAL_CHECKOUT_CONTEXT_KEY);
      if (!raw) {
        return;
      }

      const context = JSON.parse(raw) as Partial<PayPalCheckoutContext>;
      if (context?.firstName) setFirstName(String(context.firstName || ''));
      if (context?.lastName) setLastName(String(context.lastName || ''));
      if (context?.email) setEmail(String(context.email || ''));
      if (context?.country) setCountry(String(context.country || ''));
      if (context?.paypalEmail) setPaypalEmail(String(context.paypalEmail || ''));
      if (context?.couponCode) setCouponInput(String(context.couponCode || ''));
    } catch {
      sessionStorage.removeItem(PAYPAL_CHECKOUT_CONTEXT_KEY);
    }
  }, []);

  const generatedCoupon = useMemo(() => {
    if (itemData.itemType === 'course' && itemData.courseId) {
      return generateCourseCoupon(itemData.courseId);
    }
    if (itemData.itemType === 'note' && itemData.noteId) {
      return generateNoteCoupon(itemData.noteId);
    }
    return null;
  }, [itemData.courseId, itemData.itemType, itemData.noteId]);

  const discountAmount = useMemo(
    () => Number((itemData.price * (appliedCouponPercent / 100)).toFixed(2)),
    [appliedCouponPercent, itemData.price]
  );
  const discountedSubtotal = useMemo(
    () => Number((itemData.price - discountAmount).toFixed(2)),
    [discountAmount, itemData.price]
  );
  const tax = useMemo(() => Number((discountedSubtotal * 0.1).toFixed(2)), [discountedSubtotal]);
  const total = useMemo(() => Number((discountedSubtotal + tax).toFixed(2)), [discountedSubtotal, tax]);

  useEffect(() => {
    if (!generatedCoupon) {
      setCouponInput('');
      setAppliedCouponCode('');
      setAppliedCouponPercent(0);
      setCouponMessage('');
      setCouponMessageType('');
      return;
    }

    setCouponInput(generatedCoupon.code);
    setAppliedCouponCode(generatedCoupon.code);
    setAppliedCouponPercent(generatedCoupon.discountPercent);
    setCouponMessage(`Auto coupon applied: ${generatedCoupon.discountPercent}% off`);
    setCouponMessageType('success');
  }, [generatedCoupon?.code, generatedCoupon?.discountPercent]);

  const handleApplyCoupon = () => {
    if (!generatedCoupon) {
      setCouponMessage('Coupon is unavailable for this item.');
      setCouponMessageType('error');
      setAppliedCouponCode('');
      setAppliedCouponPercent(0);
      return;
    }

    if (!couponInput.trim()) {
      setAppliedCouponCode('');
      setAppliedCouponPercent(0);
      setCouponMessage('Coupon removed.');
      setCouponMessageType('success');
      return;
    }

    const normalizedInput = normalizeCouponCode(couponInput);
    if (normalizedInput !== generatedCoupon.code) {
      setAppliedCouponCode('');
      setAppliedCouponPercent(0);
      setCouponMessage('Invalid coupon code for this course.');
      setCouponMessageType('error');
      return;
    }

    setAppliedCouponCode(generatedCoupon.code);
    setAppliedCouponPercent(generatedCoupon.discountPercent);
    setCouponMessage(`${generatedCoupon.discountPercent}% discount applied.`);
    setCouponMessageType('success');
  };

  useEffect(() => {
    if (stripeDisabled) {
      setPaymentMethod('paypal');
    }
  }, [stripeDisabled]);

  useEffect(() => {
    const loadBillingProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoadingProfile(false);
        return;
      }

      try {
        const res = await fetch(apiUrl('/api/auth/me'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json().catch(() => ({}));
        const profile = json?.data || {};

        if (res.ok && json?.success) {
          setFirstName(String(profile?.firstName || ''));
          setLastName(String(profile?.lastName || ''));
          const profileEmail = String(profile?.email || '');
          setEmail(profileEmail);
          setPaypalEmail(profileEmail);
          setCountry(String(profile?.country || ''));
        }
      } catch (error) {
        console.error('Failed to load billing profile', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadBillingProfile();
  }, []);

  useEffect(() => {
    const checkStripeConfig = async () => {
      try {
        const res = await fetch(apiUrl('/api/payments/config'));
        const json = await res.json().catch(() => ({}));
        const enabled = !!json?.data?.stripeEnabled;
        const paypalEnabled = !!json?.data?.paypalEnabled;
        setServerStripeEnabled(enabled);
        setServerPaypalEnabled(paypalEnabled);
        if (!enabled && paypalEnabled) {
          setPaymentMethod('paypal');
        }
      } catch {
        setServerStripeEnabled(false);
        setServerPaypalEnabled(false);
        setPaymentMethod('paypal');
      }
    };

    checkStripeConfig();
  }, []);

  useEffect(() => {
    const capturePayPalOrder = async () => {
      if (!paypalToken || capturingPaypal || loadingProfile || serverPaypalEnabled === false) {
        return;
      }

      const requiredDetails = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        country: country.trim(),
        paypalEmail: paypalEmail.trim()
      };

      try {
        setCapturingPaypal(true);
        setPaymentMethod('paypal');
        setPaymentError('');

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Please sign in before completing payment.');
        }

        const res = await fetch(apiUrl('/api/payments/paypal/capture-order'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            orderId: paypalToken,
            itemType: itemData.itemType,
            itemId: itemData.courseId || itemData.noteId || id,
            couponCode: appliedCouponCode || undefined,
            ...requiredDetails
          })
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json?.success || !json?.data) {
          throw new Error(json?.message || 'Failed to capture PayPal payment');
        }

        const order = {
          orderNumber: json.data.orderNumber || `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
          date: new Date().toISOString(),
          paymentMethod: json.data.paymentMethod || 'PayPal',
          totalPaid: total,
          itemTitle: itemData.title,
          itemType: itemData.itemType,
          courseId: json.data.courseId || itemData.courseId || '',
          noteId: json.data.noteId || itemData.noteId || '',
          email: json.data.email || email,
          customerName: json.data.customerName || `${firstName} ${lastName}`.trim(),
          country: json.data.country || country,
          paymentProvider: 'paypal',
          transactionId: json.data.transactionId || paypalToken
        };

        localStorage.setItem('lastOrder', JSON.stringify(order));
        sessionStorage.removeItem(PAYPAL_CHECKOUT_CONTEXT_KEY);
        navigate('/order-success', { state: order, replace: true });
      } catch (error: any) {
        setPaymentError(error?.message || 'Failed to capture PayPal payment');
      } finally {
        setCapturingPaypal(false);
      }
    };

    capturePayPalOrder();
  }, [appliedCouponCode, capturingPaypal, country, email, firstName, id, itemData.courseId, itemData.itemType, itemData.noteId, itemData.title, lastName, navigate, paypalEmail, paypalToken, total]);

  useEffect(() => {
    const createIntent = async () => {
      if (paymentMethod !== 'card' || stripeDisabled || serverStripeEnabled !== true) {
        setClientSecret('');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setPaymentError('Please sign in before completing payment.');
        return;
      }

      try {
        setCreatingIntent(true);
        setPaymentError('');

        const res = await fetch(apiUrl('/api/payments/create-intent'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            itemType: itemData.itemType,
            itemId: itemData.courseId || itemData.noteId || id,
            couponCode: appliedCouponCode || undefined
          })
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json?.success || !json?.data?.clientSecret) {
          throw new Error(json?.message || 'Failed to initialize payment');
        }

        setClientSecret(json.data.clientSecret);
      } catch (error: any) {
        const message = error?.message || 'Failed to initialize payment';
        setPaymentError(message);
        if (/not configured|stripe card payment/i.test(message)) {
          setServerStripeEnabled(false);
          setPaymentMethod('paypal');
        }
      } finally {
        setCreatingIntent(false);
      }
    };

    createIntent();
  }, [id, itemData.courseId, itemData.itemType, itemData.noteId, paymentMethod, serverStripeEnabled, stripeDisabled, appliedCouponCode]);

  const startPayPalCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setPaymentError('Please sign in before completing payment.');
      return;
    }

    try {
      setSubmitting(true);
      setPaypalRedirecting(true);
      setPaymentError('');

      const res = await fetch(apiUrl('/api/payments/paypal/create-order'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          itemType: itemData.itemType,
          itemId: itemData.courseId || itemData.noteId || id,
          couponCode: appliedCouponCode || undefined
        })
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success || !json?.data?.approveUrl) {
        throw new Error(json?.message || 'Failed to start PayPal checkout');
      }

      window.location.href = json.data.approveUrl;
    } catch (error: any) {
      setPaymentError(error?.message || 'Failed to start PayPal checkout');
      setPaypalRedirecting(false);
      setSubmitting(false);
    }
  };

  const completePayment = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setPaymentError('Enter your billing details.');
      return;
    }

    if (!country.trim()) {
      setPaymentError('Please select your country.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setPaymentError('Please sign in before completing payment.');
      return;
    }

    if (paymentMethod === 'paypal') {
      sessionStorage.setItem(
        PAYPAL_CHECKOUT_CONTEXT_KEY,
        JSON.stringify({
          itemType: itemData.itemType,
          itemId: itemData.courseId || itemData.noteId || id || '',
          couponCode: appliedCouponCode || '',
          firstName,
          lastName,
          email,
          country,
          paypalEmail
        } satisfies PayPalCheckoutContext)
      );
      await startPayPalCheckout();
      return;
    }

    try {
      setSubmitting(true);
      setPaymentError('');

      let paymentIntentId = '';
      let paymentLabel = 'Credit Card';

      if (paymentMethod === 'card') {
        if (!stripe || !elements) {
          throw new Error('Stripe is still loading. Please try again.');
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error('Card form is not ready.');
        }

        if (!clientSecret) {
          throw new Error('Payment session is not ready.');
        }

        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${firstName} ${lastName}`.trim(),
              email,
              address: {
                country: country === 'United States' ? 'US' : country === 'United Kingdom' ? 'GB' : country === 'Canada' ? 'CA' : 'AU'
              }
            }
          }
        });

        if (result.error) {
          throw new Error(result.error.message || 'Card payment failed');
        }

        if (result.paymentIntent?.status !== 'succeeded') {
          throw new Error('Payment was not completed');
        }

        paymentIntentId = result.paymentIntent.id;
        paymentLabel = 'Credit Card';
      }

      const confirmResponse = await fetch(apiUrl('/api/payments/confirm'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          itemType: itemData.itemType,
          itemId: itemData.courseId || itemData.noteId || id,
          paymentMethod,
          paymentIntentId,
          couponCode: appliedCouponCode || undefined,
          firstName,
          lastName,
          email,
          country,
          paypalEmail
        })
      });

      const json = await confirmResponse.json().catch(() => ({}));
      if (!confirmResponse.ok || !json?.success || !json?.data) {
        throw new Error(json?.message || 'Payment failed');
      }

      const order = {
        orderNumber: json.data.orderNumber || `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
        date: new Date().toISOString(),
        paymentMethod: json.data.paymentMethod || paymentLabel,
        totalPaid: total,
        itemTitle: itemData.title,
        itemType: itemData.itemType,
        courseId: json.data.courseId || itemData.courseId || '',
        noteId: json.data.noteId || itemData.noteId || '',
        email: json.data.email || email,
        customerName: json.data.customerName || `${firstName} ${lastName}`.trim(),
        country: json.data.country || country,
        paymentProvider: paymentMethod,
        transactionId: json.data.transactionId || paymentIntentId || ''
      };

      try {
        const purchasedType = String(json.data.itemType || itemData.itemType || '').trim() as 'course' | 'note';
        const purchasedId = String(json.data.itemId || itemData.courseId || itemData.noteId || id || '').trim();
        const current = readCartItems(user?.id);
        const next = Array.isArray(current)
          ? current.filter((entry: any) => !(String(entry?.itemType) === purchasedType && String(entry?.id) === purchasedId))
          : [];

        writeCartItems(next, user?.id);
        window.dispatchEvent(new CustomEvent('cart-updated'));
      } catch {
        // Keep checkout success path resilient even if cart cleanup fails.
      }

      localStorage.setItem('lastOrder', JSON.stringify(order));
      navigate('/order-success', { state: order });
    } catch (error: any) {
      setPaymentError(error?.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Checkout</h1>
          <p className="text-slate-600 text-lg">Complete your purchase securely</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Billing Details</h2>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); completePayment(); }}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 font-semibold text-slate-700">First Name</label>
                    <input
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-slate-700">Last Name</label>
                    <input
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    placeholder="john.doe@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-slate-700">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  >
                      <option value="">Select country</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                    <option>Australia</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Payment Method</h2>

              <div className="space-y-4 mb-6">
                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-cyan-600 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-md' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'} ${(stripeDisabled || serverStripeEnabled === false) ? 'opacity-60' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    disabled={stripeDisabled || serverStripeEnabled === false}
                    onChange={() => setPaymentMethod('card')}
                    className="w-5 h-5 text-cyan-600"
                  />
                  <CreditCard className="w-6 h-6 text-cyan-600" />
                  <span className="font-semibold text-slate-900">Credit / Debit Card</span>
                </label>

                {(stripeDisabled || serverStripeEnabled === false) && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
                    Card payment is unavailable. Configure both VITE_STRIPE_PUBLISHABLE_KEY (frontend) and STRIPE_SECRET_KEY (server).
                  </div>
                )}

                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'border-cyan-600 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-md' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'} ${serverPaypalEnabled === false ? 'opacity-60' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'paypal'}
                    disabled={serverPaypalEnabled === false}
                    onChange={() => setPaymentMethod('paypal')}
                    className="w-5 h-5"
                  />
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#00457C" d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.19a.641.641 0 0 1 .633-.54h4.607a.641.641 0 0 1 .633.74L7.71 20.797a.641.641 0 0 1-.633.54z"/>
                    <path fill="#0079C1" d="M10.502 2.19L7.395 21.337h4.607a.641.641 0 0 0 .633-.54l3.106-18.607a.641.641 0 0 0-.633-.74h-4.607z"/>
                    <path fill="#00457C" d="M14.746 21.337h4.607a.641.641 0 0 0 .633-.74l-3.106-18.607a.641.641 0 0 0-.633-.54h-4.607a.641.641 0 0 0-.633.74l3.106 18.607a.641.641 0 0 0 .633.54z"/>
                  </svg>
                  <span>PayPal</span>
                </label>

                {serverPaypalEnabled === false && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
                    PayPal is unavailable until PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are configured on the server.
                  </div>
                )}
              </div>

              {paymentMethod === 'card' ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-5">
                    <CardElement
                      options={{
                        hidePostalCode: true,
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#0f172a',
                            '::placeholder': { color: '#94a3b8' }
                          },
                          invalid: {
                            color: '#dc2626'
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Lock className="w-4 h-4 text-cyan-600" />
                    <span>
                      {creatingIntent ? 'Preparing secure payment form...' : 'Your card details are processed securely by Stripe.'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-5 space-y-4">
                  <p className="text-sm text-slate-600">
                    You will be redirected to PayPal to approve the payment securely.
                  </p>
                  <p className="text-sm text-slate-600">
                    After approval, you will return here automatically and the order will complete.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-2xl p-8 sticky top-24 border border-slate-100">
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    {itemData.itemType === 'course' ? <Smartphone className="w-8 h-8 text-white" /> : <FileText className="w-8 h-8 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 line-clamp-2 font-bold text-slate-900">{itemData.title}</h3>
                    <p className="text-sm text-cyan-700 font-semibold">{itemData.itemType === 'course' ? 'Repair Course' : 'Repair Guide'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block mb-2 text-sm font-semibold text-slate-700">Coupon Code</label>
                {generatedCoupon && (
                  <div className="mb-2 text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg px-3 py-2">
                    Auto {itemData.itemType === 'course' ? 'Course' : 'Guide'} Coupon: {generatedCoupon.code} ({generatedCoupon.discountPercent}% OFF)
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    disabled={!generatedCoupon}
                    className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-6 py-3 border-2 border-cyan-600 text-cyan-600 rounded-xl hover:bg-cyan-50 font-bold transition-all"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className={`mt-2 text-xs font-semibold ${couponMessageType === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {couponMessage}
                  </p>
                )}
              </div>

              <div className="space-y-4 mb-6 pb-6 border-b-2 border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Subtotal</span>
                  <span className="font-bold text-slate-900">${itemData.price.toFixed(2)}</span>
                </div>
                {appliedCouponPercent > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-semibold">Coupon ({appliedCouponPercent}% OFF)</span>
                    <span className="font-bold text-emerald-600">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Tax</span>
                  <span className="font-bold text-slate-900">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl">
                <span className="text-xl font-bold text-slate-900">Total</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">${total.toFixed(2)}</span>
              </div>

              {paymentError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {paymentError}
                </div>
              )}

              <button
                onClick={completePayment}
                disabled={loadingProfile || submitting || creatingIntent || paypalRedirecting || capturingPaypal || (paymentMethod === 'card' && !clientSecret)}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105 transition-all text-center block mb-6 font-bold text-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingProfile ? 'Loading profile...' : paypalRedirecting ? 'Redirecting to PayPal...' : capturingPaypal ? 'Completing PayPal payment...' : submitting ? 'Processing...' : paymentMethod === 'paypal' ? 'Continue to PayPal' : 'Pay with Card'}
              </button>

              <div className="flex items-center justify-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span className="font-semibold">Stripe secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
