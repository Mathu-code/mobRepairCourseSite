import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { CourseCard } from '../components/CourseCard';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { apiUrl } from '../lib/api';

type CourseItem = {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  students: number;
  price: number;
  image: string;
};

export function CoursesPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const query = new URLSearchParams({ limit: '50' });
        if (search.trim()) {
          query.set('search', search.trim());
        }

        const res = await fetch(apiUrl(`/api/courses?${query.toString()}`), {
          signal: controller.signal
        });
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.success) {
          throw new Error(json?.message || 'Failed to load courses');
        }

        const rows = (json?.data?.courses || []).map((c: any) => {
          const firstName = c?.instructorId?.firstName || '';
          const lastName = c?.instructorId?.lastName || '';
          return {
            id: String(c?._id || c?.id || ''),
            title: c?.title || 'Untitled course',
            instructor: `${firstName} ${lastName}`.trim() || 'Instructor',
            rating: 4.8,
            students: 0,
            price: Number(c?.discountPrice ?? c?.price ?? 0),
            image: c?.thumbnail || c?.title || 'mobile repair course'
          } as CourseItem;
        });

        setCourses(rows);
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setError(err?.message || 'Could not load courses');
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(loadCourses, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search]);

  const resultLabel = useMemo(() => {
    if (loading) return 'Loading courses...';
    return `${courses.length} courses found`;
  }, [courses.length, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Repair Courses</h1>
          <p className="text-xl text-slate-600 mb-8">Master mobile repair with expert-led courses</p>
        </div>

        <div className="mb-8">
          <div className="flex gap-4 items-center">
            <div className="flex-1 bg-white rounded-2xl shadow-lg shadow-cyan-500/10 p-2 flex items-center border border-slate-200 hover:border-cyan-300 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search repair courses..."
                className="flex-1 px-4 py-3 outline-none text-slate-700"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-6 py-4 bg-white rounded-xl shadow-lg flex items-center gap-2 border border-slate-200 hover:border-cyan-300 transition-all"
            >
              <Filter className="w-5 h-5 text-cyan-600" />
              <span className="font-medium">Filters</span>
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-2xl shadow-lg shadow-cyan-500/10 p-6 sticky top-24 border border-slate-200">
              <h3 className="text-lg font-bold mb-4 flex items-center justify-between text-slate-900">
                Filters
                <button className="text-sm text-cyan-600 hover:text-cyan-700 font-medium" onClick={() => setSearch('')}>Clear all</button>
              </h3>

              <div className="space-y-6">
                <div>
                  <button className="w-full flex items-center justify-between mb-3">
                    <span className="text-sm">Skill Level</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="space-y-2 text-sm text-slate-500">
                    Backend-driven filtering is enabled by search.
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">{resultLabel}</p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            {!loading && courses.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-600">
                No courses found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {courses.map((course) => (
                  <CourseCard key={course.id} {...course} />
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
