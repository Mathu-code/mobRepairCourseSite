import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { NoteCard } from '../components/NoteCard';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { apiUrl } from '../lib/api';

type NoteItem = {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  pages: number;
  price: number;
};

export function NotesPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadNotes = async () => {
      try {
        setLoading(true);
        setError(null);

        const query = new URLSearchParams({ limit: '50' });
        if (search.trim()) {
          query.set('search', search.trim());
        }

        const res = await fetch(apiUrl(`/api/notes?${query.toString()}`), {
          signal: controller.signal
        });
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.success) {
          throw new Error(json?.message || 'Failed to load notes');
        }

        const rows = (json?.data?.notes || []).map((n: any) => {
          const firstName = n?.instructorId?.firstName || '';
          const lastName = n?.instructorId?.lastName || '';
          return {
            id: String(n?._id || n?.id || ''),
            title: n?.title || 'Untitled note',
            instructor: `${firstName} ${lastName}`.trim() || 'Instructor',
            rating: 4.8,
            pages: Number(n?.pages || 0),
            price: Number(n?.discountPrice ?? n?.price ?? 0)
          } as NoteItem;
        });

        setNotes(rows);
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setError(err?.message || 'Could not load notes');
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(loadNotes, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search]);

  const resultLabel = useMemo(() => {
    if (loading) return 'Loading guides...';
    return `${notes.length} guides found`;
  }, [notes.length, loading]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Repair Guides & Manuals</h1>
          <p className="text-xl text-slate-600 mb-8">Comprehensive documentation and study materials from our instructors</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex gap-4 items-center">
            <div className="flex-1 bg-white rounded-2xl shadow-xl shadow-cyan-500/10 p-2 flex items-center border border-slate-200 hover:border-cyan-300 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search smartphone repair guides, manuals..."
                className="flex-1 px-4 py-3 outline-none text-slate-700"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-6 py-4 bg-white rounded-xl shadow-xl flex items-center gap-2 border border-slate-200 hover:border-cyan-300 transition-all"
            >
              <Filter className="w-5 h-5 text-cyan-600" />
              <span className="font-medium text-slate-700">Filters</span>
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-2xl shadow-xl shadow-cyan-500/10 p-6 sticky top-24 border border-slate-200 hover:border-cyan-200 transition-all">
              <h3 className="text-lg font-bold mb-4 flex items-center justify-between text-slate-900">
                Filters
                <button className="text-sm text-cyan-600 hover:text-cyan-700 font-medium" onClick={() => setSearch('')}>Clear all</button>
              </h3>

              <div className="space-y-6">
                <div>
                  <button className="w-full flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-700">Search</span>
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className="text-sm text-slate-500">
                    Search uses backend filtering in real-time.
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-600 font-medium">{resultLabel}</p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            {!loading && notes.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-600">
                No guides found.
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {notes.map((note) => (
                  <NoteCard key={note.id} {...note} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
