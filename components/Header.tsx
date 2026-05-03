import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, BookOpen, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../lib/api';
import { dispatchCartUpdated, readCartItems, removeCartItem as removeCartItemFromStorage, writeCartItems } from '../lib/cart';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartNotice, setCartNotice] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartPanelRef = useRef<HTMLDivElement | null>(null);

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0),
    [cartItems]
  );

  useEffect(() => {
    const readCart = () => {
      const nextItems = readCartItems(user?.id);
      setCartItems(nextItems);
      setCartCount(nextItems.length);
    };

    const onCartUpdated = (event: Event) => {
      readCart();
      const customEvent = event as CustomEvent<{ message?: string }>;
      if (customEvent?.detail?.message) {
        setCartNotice(customEvent.detail.message);
      }
    };

    readCart();
    window.addEventListener('storage', readCart);
    window.addEventListener('cart-updated', onCartUpdated as EventListener);

    return () => {
      window.removeEventListener('storage', readCart);
      window.removeEventListener('cart-updated', onCartUpdated as EventListener);
    };
  }, [user?.id]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!cartPanelRef.current) return;
      if (!cartPanelRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    };

    if (isCartOpen) {
      window.addEventListener('mousedown', closeOnOutsideClick);
    }

    return () => {
      window.removeEventListener('mousedown', closeOnOutsideClick);
    };
  }, [isCartOpen]);

  useEffect(() => {
    if (!cartNotice) return;
    const timer = window.setTimeout(() => setCartNotice(''), 2200);
    return () => window.clearTimeout(timer);
  }, [cartNotice]);

  useEffect(() => {
    const pruneOwnedItemsFromCart = async () => {
      try {
        const currentItems = readCartItems(user?.id);

        if (!user?.id || user.role === 'instructor' || currentItems.length === 0) {
          setCartItems(currentItems);
          setCartCount(currentItems.length);
          return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
          setCartItems(currentItems);
          setCartCount(currentItems.length);
          return;
        }

        const headers: any = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

        const [purchaseRes, enrollmentRes] = await Promise.all([
          fetch(apiUrl(`/api/users/${user.id}/purchases`), { headers }),
          fetch(apiUrl(`/api/users/${user.id}/enrollments`), { headers })
        ]);

        const purchaseJson = await purchaseRes.json().catch(() => ({}));
        const enrollmentJson = await enrollmentRes.json().catch(() => ({}));

        const purchases = purchaseRes.ok && purchaseJson?.success ? (purchaseJson?.data || []) : [];
        const enrollments = enrollmentRes.ok && enrollmentJson?.success ? (enrollmentJson?.data || []) : [];

        const ownedCourseIds = new Set<string>([
          ...purchases
            .filter((p: any) => p?.itemType === 'course')
            .map((p: any) => String(p?.itemId || '')),
          ...enrollments
            .map((en: any) => {
              const c = en?.courseId || en?.course || {};
              return String(c?._id || c?.id || en?.courseId || '');
            })
            .filter(Boolean)
        ]);

        const ownedNoteIds = new Set<string>(
          purchases
            .filter((p: any) => p?.itemType === 'note')
            .map((p: any) => String(p?.itemId || ''))
        );

        const filteredItems = currentItems.filter((item) => {
          if (item.itemType === 'course') return !ownedCourseIds.has(String(item.id));
          return !ownedNoteIds.has(String(item.id));
        });

        if (filteredItems.length !== currentItems.length) {
          writeCartItems(filteredItems, user?.id);
        }

        setCartItems(filteredItems);
        setCartCount(filteredItems.length);
      } catch {
        try {
          const raw = localStorage.getItem('shoppingCart');
          const parsed = raw ? JSON.parse(raw) : [];
          const currentItems: CartItem[] = Array.isArray(parsed) ? parsed : [];
          setCartItems(currentItems);
          setCartCount(currentItems.length);
        } catch {
          setCartItems([]);
          setCartCount(0);
        }
      }
    };

    pruneOwnedItemsFromCart();
  }, [user?.id, user?.role]);

  const removeCartItem = (itemId: string, itemType: 'course' | 'note') => {
    const nextItems = removeCartItemFromStorage(itemId, itemType, user?.id);
    setCartItems(nextItems);
    setCartCount(nextItems.length);
    dispatchCartUpdated('Removed from cart');
    setIsCartOpen(false);
    navigate('/student/dashboard');
  };
  
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">MobRepair</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            {(!user || user.role === 'student') && (
              <>
                <Link to="/courses" className="text-slate-700 hover:text-cyan-600 font-medium transition-colors">
                  Repair Courses
                </Link>
                <Link to="/notes" className="text-slate-700 hover:text-cyan-600 font-medium transition-colors">
                  Guides & Manuals
                </Link>
              </>
            )}
            {user && user.role === 'student' && (
              <Link to="/student/dashboard" className="text-slate-700 hover:text-cyan-600 font-medium transition-colors flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                My Learning
              </Link>
            )}
            {user && user.role === 'instructor' && (
              <Link to="/instructor/dashboard" className="text-slate-700 hover:text-cyan-600 font-medium transition-colors flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Instructor Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user?.role !== 'instructor' && (
              <div className="relative" ref={cartPanelRef}>
                <button
                  className="relative text-slate-700 hover:text-cyan-600 transition p-2 hover:bg-cyan-50 rounded-lg"
                  aria-label="Shopping cart"
                  onClick={() => setIsCartOpen((prev) => !prev)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-cyan-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>

                {isCartOpen && (
                  <div className="absolute right-0 mt-2 w-[330px] max-w-[90vw] bg-white border border-slate-200 rounded-xl shadow-2xl p-3 z-50">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="font-bold text-slate-900">Your Cart ({cartCount})</h3>
                      {cartCount > 0 && (
                        <span className="text-sm font-semibold text-cyan-700">${cartTotal.toFixed(2)}</span>
                      )}
                    </div>

                    {cartItems.length === 0 ? (
                      <p className="text-sm text-slate-500 px-1 py-3">Your cart is empty.</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {cartItems.map((item) => (
                          <div key={`${item.itemType}-${item.id}`} className="flex items-start justify-between gap-2 border border-slate-200 rounded-lg p-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 line-clamp-2">{item.title}</p>
                              <p className="text-xs text-slate-500">{item.itemType === 'note' ? 'Repair Guide' : 'Repair Course'}</p>
                              <p className="text-xs font-bold text-cyan-700">${Number(item.price || 0).toFixed(2)}</p>
                            </div>
                            <button
                              onClick={() => removeCartItem(item.id, item.itemType)}
                              className="p-1.5 rounded-md text-red-500 hover:bg-red-50"
                              aria-label="Remove item"
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {cartItems.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                        <button
                          onClick={() => {
                            const first = cartItems[0];
                            if (!first) return;
                            navigate(`/checkout/${first.itemType}/${first.id}`);
                            setIsCartOpen(false);
                          }}
                          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold"
                        >
                          Checkout First Item
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {cartNotice && user?.role !== 'instructor' && (
              <div className="hidden sm:block text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg px-2 py-1">
                {cartNotice}
              </div>
            )}
            {user ? (
              <>
                <Link to="/profile" className="text-slate-700 hover:text-cyan-600 transition p-2 hover:bg-cyan-50 rounded-lg">
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="px-5 py-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-5 py-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition font-medium">
                  Login
                </Link>
                <Link to="/signup" className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
