import { Link, useParams } from 'react-router-dom';
import { Star, FileText, Download } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { apiUrl } from '../lib/api';

type NoteDetails = {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  pages?: number;
  fileSize?: number;
  fileUrl?: string;
  createdAt?: string;
  downloads?: number;
  instructorName: string;
  instructorId: string;
};

export function NoteDetailsPage() {
  const { id } = useParams();
  const [note, setNote] = useState<NoteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isValidId = !!id && /^[a-f\d]{24}$/i.test(id);
    if (!isValidId) {
      setLoading(false);
      setError('Invalid note id');
      return;
    }

    const controller = new AbortController();

    const loadNote = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(apiUrl(`/api/notes/${id}`), { signal: controller.signal });
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.success || !json?.data) {
          throw new Error(json?.message || 'Failed to load note');
        }

        const n = json.data;
        const instructorName = `${n?.instructorId?.firstName || ''} ${n?.instructorId?.lastName || ''}`.trim() || 'Instructor';

        setNote({
          id: String(n?._id || n?.id || id),
          title: n?.title || 'Untitled note',
          description: n?.description || '',
          price: Number(n?.price || 0),
          discountPrice: n?.discountPrice != null ? Number(n.discountPrice) : undefined,
          pages: n?.pages,
          fileSize: n?.fileSize,
          fileUrl: n?.fileUrl,
          createdAt: n?.createdAt,
          downloads: n?.downloads,
          instructorName,
          instructorId: String(n?.instructorId?._id || n?.instructorId?.id || '')
        });
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setError(err?.message || 'Could not load note details');
      } finally {
        setLoading(false);
      }
    };

    loadNote();
    return () => controller.abort();
  }, [id]);

  const fileSizeLabel = useMemo(() => {
    if (!note?.fileSize) return '-';
    const mb = note.fileSize / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }, [note?.fileSize]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading note...</div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error || 'Note not found'}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const displayPrice = note.discountPrice ?? note.price;
  const handleAddToCart = () => {
    const cartItem = {
      id: note.id,
      itemType: 'note',
      title: note.title,
      price: Number(displayPrice || 0),
      image: '',
      addedAt: new Date().toISOString()
    };

    try {
      const raw = localStorage.getItem('shoppingCart');
      const current = raw ? JSON.parse(raw) : [];
      const existing = Array.isArray(current)
        ? current.find((item: any) => item?.id === note.id && item?.itemType === 'note')
        : null;

      if (existing) {
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: { message: 'Already in cart' } }));
        return;
      }

      const next = Array.isArray(current) ? [...current, cartItem] : [cartItem];
      localStorage.setItem('shoppingCart', JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: { message: 'Added to cart' } }));
    } catch {
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: { message: 'Cart update failed' } }));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-slate-100">
              <div className="bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 p-12 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6 border-2 border-cyan-100">
                    <FileText className="w-16 h-16 text-cyan-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900">Repair Guide</h3>
                  <p className="text-slate-600">Comprehensive repair documentation by certified technician</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-slate-100">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">{note.title}</h1>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-bold text-slate-900">4.8</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-cyan-600" />
                  <span className="text-slate-600 font-medium">{(note.downloads || 0).toLocaleString()} downloads</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-slate-700">
                  Created by{' '}
                  <Link to={`/instructor/${note.instructorId || note.id}`} className="text-cyan-600 hover:text-cyan-700 font-bold">
                    {note.instructorName}
                  </Link>
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-slate-100">
                <div>
                  <p className="text-sm text-slate-600 mb-1 font-semibold">Pages</p>
                  <p className="font-bold text-slate-900">{note.pages ?? '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1 font-semibold">Format</p>
                  <p className="font-bold text-slate-900">PDF</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1 font-semibold">Size</p>
                  <p className="font-bold text-slate-900">{fileSizeLabel}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1 font-semibold">Language</p>
                  <p className="font-bold text-slate-900">English</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-slate-100">
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Description</h2>
              <p className="text-slate-700 leading-relaxed">{note.description}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border-2 border-slate-100">
              <div className="text-4xl font-bold mb-6 text-slate-900">${displayPrice.toFixed(2)}</div>

              <Link
                to={`/checkout/note/${note.id}`}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 text-center block mb-3 font-bold transition-all"
              >
                Buy Now
              </Link>

              <button
                onClick={handleAddToCart}
                className="w-full py-3 border-2 border-cyan-600 text-cyan-600 rounded-xl hover:bg-cyan-50 mb-6 font-bold transition-all"
              >
                Add to Cart
              </button>

              <div className="space-y-4 text-sm mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Pages</span>
                  <span className="font-bold text-slate-900">{note.pages ?? '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Format</span>
                  <span className="font-bold text-slate-900">PDF</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">File Size</span>
                  <span className="font-bold text-slate-900">{fileSizeLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Lifetime Access</span>
                  <span className="text-green-600 font-bold">✓</span>
                </div>
              </div>

              <div className="border-t-2 border-slate-200 pt-6">
                <h3 className="mb-4 font-bold text-slate-900">Money-Back Guarantee</h3>
                <p className="text-sm text-slate-600">
                  If you're not satisfied with the content, request a refund within 30 days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
