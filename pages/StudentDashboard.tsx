import { Link } from 'react-router-dom';
import { Smartphone, PlayCircle, FileText, Clock, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Header } from '../components/Header';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../lib/api';

type CourseCard = {
  id: string;
  title: string;
  instructor: string;
  progress: number;
};

type NoteCard = {
  id: string;
  title: string;
  pages?: number;
  downloadDate?: string;
};

type AvailableCourse = {
  id: string;
  title: string;
  instructor: string;
  price: number;
};

export function StudentDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [notes, setNotes] = useState<NoteCard[]>([]);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [ownedCourseIds, setOwnedCourseIds] = useState<Set<string>>(new Set());
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const calculateProgressPercent = (enrollment: any, course: any): number => {
        const directProgress = Number(enrollment?.progress);
        if (Number.isFinite(directProgress)) {
          return Math.max(0, Math.min(100, Math.round(directProgress)));
        }

        const completedLessons = Number(enrollment?.completedLessons ?? enrollment?.watchedLessons ?? 0);
        const totalLessons = Number(course?.totalLessons ?? enrollment?.totalLessons ?? 0);
        if (totalLessons > 0) {
          return Math.max(0, Math.min(100, Math.round((completedLessons / totalLessons) * 100)));
        }

        return 0;
      };

      try {
        // purchases
        const purchaseRes = await fetch(apiUrl(`/api/users/${user.id}/purchases`), { headers });
        const purchaseJson = await purchaseRes.json().catch(() => ({}));
        const purchases = purchaseJson?.data || [];

        const purchasedCourseIds = new Set<string>(
          purchases
            .filter((p: any) => p.itemType === 'course')
            .map((p: any) => String(p?.itemId || ''))
            .filter((value: string) => /^[a-f\d]{24}$/i.test(value))
        );

        // enrollments -> courses
        const enrollRes = await fetch(apiUrl(`/api/users/${user.id}/enrollments`), { headers });
        const enrollJson = await enrollRes.json().catch(() => ({}));
        const enrollments = enrollJson?.data || [];

        const parsedCourses: CourseCard[] = enrollments
          .map((en: any) => {
            const course = en?.courseId || en?.course || {};
            const instructor = course?.instructorId || course?.instructor || {};
            const courseId = String(course?._id || course?.id || en?.courseId || '');
            if (!courseId || courseId === '[object Object]') {
              return null;
            }

            // My Repair Courses should display only purchased courses.
            if (!purchasedCourseIds.has(courseId)) {
              return null;
            }

            return {
              id: courseId,
              title: course?.title || en?.courseTitle || 'Untitled',
              instructor: `${instructor?.firstName || ''} ${instructor?.lastName || ''}`.trim() || 'Instructor',
              progress: calculateProgressPercent(en, course)
            } as CourseCard;
          })
          .filter(Boolean) as CourseCard[];

        setCourses(parsedCourses);
        setOwnedCourseIds(new Set([...purchasedCourseIds, ...parsedCourses.map((c) => c.id)]));

        const availableRes = await fetch(apiUrl('/api/courses?limit=6'), { headers });
        const availableJson = await availableRes.json().catch(() => ({}));
        const recentCourses = (availableJson?.data?.courses || []).map((course: any) => ({
          id: String(course?._id || course?.id || ''),
          title: course?.title || 'Untitled course',
          instructor: course?.instructorId ? `${course.instructorId.firstName || ''} ${course.instructorId.lastName || ''}`.trim() : 'Instructor',
          price: Number(course?.discountPrice ?? course?.price ?? 0)
        }));
        setAvailableCourses(recentCourses);

        const notePurchases = purchases.filter((p: any) => p.itemType === 'note');
        const purchasedNoteIds: string[] = Array.from(new Set<string>(
          notePurchases
            .map((p: any) => String(p?.itemId || ''))
            .filter((value: string) => /^[a-f\d]{24}$/i.test(value))
        ));

        // Single list request avoids repeated 404s when older purchases reference missing notes.
        const notesRes = await fetch(apiUrl('/api/notes?limit=200'), { headers });
        const notesJson = await notesRes.json().catch(() => ({}));
        const availableNotes = notesRes.ok && notesJson?.success ? (notesJson?.data?.notes || []) : [];
        const notesById = new Map<string, any>(
          availableNotes.map((n: any) => [String(n?._id || n?.id || ''), n])
        );

        const parsedNotes: NoteCard[] = purchasedNoteIds
          .map((noteId: string) => {
            const n = notesById.get(noteId);
            if (!n) {
              return null;
            }

            return {
              id: String(n?._id || n?.id || noteId),
              title: n?.title || 'Repair guide',
              pages: n?.pages,
              downloadDate: n?.createdAt ? new Date(n.createdAt).toLocaleDateString() : undefined
            } as NoteCard;
          })
          .filter(Boolean) as NoteCard[];

        setNotes(parsedNotes);

        // Build realistic weekly hours and keep active learners in a 10-15 hour band.
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        if (parsedCourses.length === 0) {
          setProgressData(days.map((name) => ({ name, hours: 0 })));
        } else {
          const avgProgress = parsedCourses.reduce((sum, c) => sum + Number(c.progress || 0), 0) / parsedCourses.length;
          const rawWeeklyHours = 10 + (avgProgress / 100) * 5;
          const weeklyHours = Math.max(10, Math.min(15, Number(rawWeeklyHours.toFixed(1))));

          const weights = [0.12, 0.13, 0.14, 0.14, 0.16, 0.16, 0.15];
          const generated = days.map((name, index) => ({
            name,
            hours: Number((weeklyHours * weights[index]).toFixed(1))
          }));

          const roundedTotal = Number(generated.reduce((sum, item) => sum + item.hours, 0).toFixed(1));
          const diff = Number((weeklyHours - roundedTotal).toFixed(1));
          generated[generated.length - 1].hours = Number((generated[generated.length - 1].hours + diff).toFixed(1));

          setProgressData(generated);
        }
      } catch (err) {
        console.error('Failed loading dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>
      </div>
    );
  }

  const enrolledCount = courses.length;
  const completedCount = courses.filter(c => c.progress >= 100).length;
  const notesCount = notes.length;

  const addCourseToCart = (course: AvailableCourse) => {
    if (ownedCourseIds.has(course.id)) {
      return;
    }

    const cartItem = {
      id: course.id,
      itemType: 'course',
      title: course.title,
      price: Number(course.price || 0),
      image: '',
      addedAt: new Date().toISOString()
    };

    try {
      const raw = localStorage.getItem('shoppingCart');
      const current = raw ? JSON.parse(raw) : [];
      const existing = Array.isArray(current)
        ? current.find((item: any) => item?.id === course.id && item?.itemType === 'course')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Welcome back, {user?.firstName || user?.name || 'Student'}!</h1>
          <p className="text-slate-600 text-lg">Continue your mobile repair training journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg shadow-cyan-500/10 hover:shadow-xl hover:shadow-cyan-500/20 transition-all p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1 text-slate-900">{enrolledCount}</p>
            <p className="text-sm text-slate-600">Enrolled Courses</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/20 transition-all p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1 text-slate-900">{completedCount}</p>
            <p className="text-sm text-slate-600">Completed Courses</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1 text-slate-900">{notesCount}</p>
            <p className="text-sm text-slate-600">Repair Guides</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transition-all p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1 text-slate-900">{progressData.reduce((s, p) => s + (p.hours || 0), 0)}h</p>
            <p className="text-sm text-slate-600">This Week</p>
          </div>
        </div>

        {/* Learning Progress Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-100">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">Weekly Training Progress</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke="#0ea5e9" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* My Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-slate-900">My Repair Courses</h2>
            <Link to="/courses" className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all font-bold">Browse All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all overflow-hidden border border-slate-100">
                <div className="aspect-video bg-gradient-to-br from-cyan-100 to-blue-200 flex items-center justify-center">
                  <PlayCircle className="w-20 h-20 text-cyan-600" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 line-clamp-2 text-slate-900">{course.title}</h3>
                  <p className="text-sm text-slate-600 mb-4">{course.instructor}</p>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600 font-semibold">Progress</span>
                      <span className="text-cyan-600 font-bold">{course.progress}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <Link
                    to={`/learn/${course.id}`}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 font-bold text-center block transition-all"
                  >
                    Continue Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-slate-900">New Courses from Instructors</h2>
            <Link to="/courses" className="text-cyan-600 hover:text-cyan-700 font-semibold">Browse All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availableCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all overflow-hidden border border-slate-100 p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{course.instructor}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-cyan-600">${course.price.toFixed(2)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addCourseToCart(course)}
                      disabled={ownedCourseIds.has(course.id)}
                      className="px-3 py-2 rounded-xl border border-cyan-500 text-cyan-600 hover:bg-cyan-50 font-semibold"
                    >
                      {ownedCourseIds.has(course.id) ? 'Purchased' : 'Add to Cart'}
                    </button>
                    <Link to={`/course/${course.id}`} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold">
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Notes */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">My Notes</h2>
            <Link to="/notes" className="text-blue-600 hover:text-blue-700">Browse All</Link>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {notes.map((note, index) => (
              <div
                key={note.id}
                  className={`p-6 flex items-center justify-between hover:bg-gray-50 ${
                    index !== notes.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="mb-1">{note.title}</h3>
                    <p className="text-sm text-gray-600">
                      {note.pages ?? '-'} pages{note.downloadDate ? ` • Downloaded ${note.downloadDate}` : ''}
                    </p>
                  </div>
                </div>
                <Link to={`/note/${note.id}`} className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
