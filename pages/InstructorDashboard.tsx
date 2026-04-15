import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Smartphone, TrendingUp, DollarSign, Users, Plus, FileText, Eye, Edit, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Header } from '../components/Header';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../lib/api';

type CourseRow = {
  id: number | string;
  title: string;
  status?: string;
  totalLessons?: number;
};

type NoteRow = { id: number | string; title: string; };

export function InstructorDashboard() {
  const navigate = useNavigate();
  const { user, authLoading, isInstructor, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [publishedCoursesCount, setPublishedCoursesCount] = useState(0);
  const [publishedNotesCount, setPublishedNotesCount] = useState(0);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);
  const [actionError, setActionError] = useState('');
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [viewingCourse, setViewingCourse] = useState<any | null>(null);

  const isObjectId = (value: string | number) => /^[a-fA-F0-9]{24}$/.test(String(value));

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  const handleEditCourse = (courseId: string | number) => {
    if (!isObjectId(courseId)) {
      setActionError('This course uses a legacy ID and cannot be edited. Please create a new course entry.');
      return;
    }
    navigate(`/instructor/upload-course?courseId=${courseId}`);
  };

  const handleViewCourse = async (courseId: string | number) => {
    if (!isObjectId(courseId)) {
      setActionError('This course uses a legacy ID and full details are not available.');
      return;
    }

    setActionError('');
    try {
      const res = await fetch(apiUrl(`/api/courses/${courseId}`), { headers: getAuthHeaders() });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to load course details');
      }
      setViewingCourse(json.data);
    } catch (error: any) {
      setActionError(error?.message || 'Unable to view course details');
    }
  };

  const handleDeleteCourse = async (courseId: string | number) => {
    if (!isObjectId(courseId)) {
      setActionError('This course uses a legacy ID and cannot be deleted from this panel.');
      return;
    }

    const confirmed = window.confirm('Delete this course? This will archive it and remove it from student listings.');
    if (!confirmed) return;

    setActionError('');
    const id = String(courseId);
    setDeletingCourseId(id);
    try {
      const res = await fetch(apiUrl(`/api/courses/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to delete course');
      }

      setCourses((prev) => {
        const target = prev.find((course) => String(course.id) === id);
        if ((target?.status || '').toLowerCase() === 'published') {
          setPublishedCoursesCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((course) => String(course.id) !== id);
      });
    } catch (error: any) {
      setActionError(error?.message || 'Unable to delete course');
    } finally {
      setDeletingCourseId(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      try {
        const res = await fetch(apiUrl(`/api/instructor/${user.id}/dashboard`), { headers });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.success) {
          const d = json.data;
          setTotalEarnings(d.totalEarnings || 0);
          setTotalStudents(d.totalStudents || 0);
          setPublishedCoursesCount(d.totalPublishedCourses || 0);
          setPublishedNotesCount(d.totalPublishedNotes || 0);
          setCourses((d.courses || []).map((c: any) => ({ id: c.id || c._id, title: c.title, status: c.status, totalLessons: c.totalLessons })));
          setNotes((d.notes || []).map((n: any) => ({ id: n.id || n._id, title: n.title })));
          setRecentPurchases(d.recentPurchases || []);
        } else {
          console.error('Failed loading instructor dashboard', json);
        }
      } catch (err) {
        console.error('Error loading instructor dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Restoring session...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isInstructor) {
    return <Navigate to="/student/dashboard" replace />;
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Instructor Dashboard</h1>
          <p className="text-gray-600">Manage your courses and track your performance</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            to="/instructor/upload-course"
            className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl p-6 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02] transition-all flex items-center justify-between"
          >
            <div>
              <h3 className="text-xl font-bold mb-2">Create Repair Course</h3>
              <p className="text-cyan-100">Teach mobile repair skills to aspiring technicians</p>
            </div>
            <Plus className="w-12 h-12" />
          </Link>

          <Link
            to="/instructor/upload-notes"
            className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl p-6 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all flex items-center justify-between"
          >
            <div>
              <h3 className="text-xl font-bold mb-2">Upload Repair Guide</h3>
              <p className="text-blue-100">Share comprehensive repair documentation</p>
            </div>
            <Plus className="w-12 h-12" />
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/20 transition-all p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1 text-slate-900">${totalEarnings.toLocaleString()}</p>
            <p className="text-sm text-slate-600">Total Earnings</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>12% this month</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-cyan-500/10 hover:shadow-xl hover:shadow-cyan-500/20 transition-all p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1 text-slate-900">{totalStudents.toLocaleString()}</p>
            <p className="text-sm text-slate-600">Total Students</p>
            <div className="flex items-center gap-1 mt-2 text-cyan-600 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>73 new this week</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1 text-slate-900">{publishedCoursesCount}</p>
            <p className="text-sm text-slate-600">Published Courses</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transition-all p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1 text-slate-900">{publishedNotesCount}</p>
            <p className="text-sm text-slate-600">Published Guides</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Revenue Overview</h2>
            <div className="h-64 flex items-center justify-center text-slate-400">${totalEarnings.toFixed(2)}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Student Enrollment</h2>
            <div className="h-64 flex items-center justify-center text-slate-400">{totalStudents.toLocaleString()} students</div>
          </div>
        </div>

        {/* My Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-slate-900">My Repair Courses</h2>
            <Link to="/instructor/upload-course" className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all font-bold flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Course
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            {actionError && (
              <div className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {actionError}
              </div>
            )}
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-cyan-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Course</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Students</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Rating</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Revenue</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, index) => (
                  <tr key={String(course.id)} className={`hover:bg-cyan-50/50 transition-colors ${index !== courses.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <td className="px-6 py-5 font-semibold text-slate-800">{course.title}</td>
                    <td className="px-6 py-5 text-slate-600">-</td>
                    <td className="px-6 py-5 text-slate-600">-</td>
                    <td className="px-6 py-5 font-bold text-green-600">-</td>
                    <td className="px-6 py-5">
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                          (course.status || '').toLowerCase() === 'published'
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md'
                            : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md'
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewCourse(course.id)}
                          className="p-2 hover:bg-cyan-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-5 h-5 text-cyan-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditCourse(course.id)}
                          className="p-2 hover:bg-cyan-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-5 h-5 text-cyan-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(course.id)}
                          disabled={deletingCourseId === String(course.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-60"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {viewingCourse && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-slate-900">Course Details</h3>
                <button type="button" className="text-slate-500 hover:text-slate-700" onClick={() => setViewingCourse(null)}>Close</button>
              </div>
              <div className="space-y-3 text-slate-700">
                <p><span className="font-semibold">Title:</span> {viewingCourse.title}</p>
                <p><span className="font-semibold">Status:</span> {viewingCourse.status}</p>
                <p><span className="font-semibold">Level:</span> {viewingCourse.level}</p>
                <p><span className="font-semibold">Price:</span> ${Number(viewingCourse.price || 0).toFixed(2)}</p>
                <p><span className="font-semibold">Description:</span> {viewingCourse.description || '-'}</p>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setViewingCourse(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewingCourse(null);
                    handleEditCourse(viewingCourse._id || viewingCourse.id);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Purchases */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Recent Purchases</h2>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-cyan-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Item</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPurchases.map((purchase, index) => (
                  <tr key={String(purchase.id || index)} className={`hover:bg-cyan-50/50 transition-colors ${index !== recentPurchases.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <td className="px-6 py-5 font-semibold text-slate-800">{purchase.student}</td>
                    <td className="px-6 py-5 text-slate-600">{purchase.itemType === 'course' ? `Course #${purchase.itemId}` : `Note #${purchase.itemId}`}</td>
                    <td className="px-6 py-5 font-bold text-green-600">${(purchase.amount || 0).toFixed(2)}</td>
                    <td className="px-6 py-5 text-slate-500">{purchase.date ? new Date(purchase.date).toLocaleString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
