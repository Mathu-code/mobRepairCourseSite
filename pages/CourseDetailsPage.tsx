import { Link, useParams } from 'react-router-dom';
import { Star, Users, Clock, PlayCircle, FileText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useUnsplashImage } from '../hooks/useUnsplashImage';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { apiUrl, resolveAssetUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { addCartItem, dispatchCartUpdated } from '../lib/cart';

type CourseDetails = {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  level?: string;
  duration?: number;
  totalLessons?: number;
  requirements?: string;
  whatYouWillLearn?: string;
  thumbnail?: string;
  createdAt?: string;
  instructorName: string;
  instructorId: string;
  students: number;
};

export function CourseDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ownedCourseIds, setOwnedCourseIds] = useState<Set<string>>(new Set());

  const fallbackImage = useUnsplashImage(course?.title || 'mobile repair course');

  useEffect(() => {
    const isValidId = !!id && /^[a-f\d]{24}$/i.test(id);
    if (!isValidId) {
      setLoading(false);
      setError('Invalid course id');
      return;
    }

    const controller = new AbortController();

    const loadCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(apiUrl(`/api/courses/${id}`), { signal: controller.signal });
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.success || !json?.data) {
          throw new Error(json?.message || 'Failed to load course');
        }

        const c = json.data;
        const instructorName = `${c?.instructorId?.firstName || ''} ${c?.instructorId?.lastName || ''}`.trim() || 'Instructor';

        setCourse({
          id: String(c?._id || c?.id || id),
          title: c?.title || 'Untitled course',
          description: c?.description || '',
          shortDescription: c?.shortDescription || '',
          price: Number(c?.price || 0),
          discountPrice: c?.discountPrice != null ? Number(c.discountPrice) : undefined,
          level: c?.level,
          duration: c?.duration,
          totalLessons: c?.totalLessons,
          requirements: c?.requirements,
          whatYouWillLearn: c?.whatYouWillLearn,
          thumbnail: c?.thumbnail,
          createdAt: c?.createdAt,
          instructorName,
          instructorId: String(c?.instructorId?._id || c?.instructorId?.id || ''),
          students: 0
        });
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setError(err?.message || 'Could not load course details');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const loadOwnedCourses = async () => {
      if (!user?.id) {
        setOwnedCourseIds(new Set());
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setOwnedCourseIds(new Set());
        return;
      }

      const headers: any = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

      try {
        const [purchaseRes, enrollmentRes] = await Promise.all([
          fetch(apiUrl(`/api/users/${user.id}/purchases`), { headers }),
          fetch(apiUrl(`/api/users/${user.id}/enrollments`), { headers })
        ]);

        const purchaseJson = await purchaseRes.json().catch(() => ({}));
        const enrollmentJson = await enrollmentRes.json().catch(() => ({}));

        const purchasedIds = (purchaseJson?.data || [])
          .filter((p: any) => p?.itemType === 'course')
          .map((p: any) => String(p?.itemId || ''));

        const enrolledIds = (enrollmentJson?.data || [])
          .map((en: any) => {
            const c = en?.courseId || en?.course || {};
            return String(c?._id || c?.id || en?.courseId || '');
          })
          .filter(Boolean);

        setOwnedCourseIds(new Set([...purchasedIds, ...enrolledIds]));
      } catch {
        setOwnedCourseIds(new Set());
      }
    };

    loadOwnedCourses();
  }, [user?.id]);

  const learnList = useMemo(() => {
    if (!course?.whatYouWillLearn) return [];
    return course.whatYouWillLearn
      .split('\n')
      .map((item) => item.replace(/^[-*\s]+/, '').trim())
      .filter(Boolean);
  }, [course?.whatYouWillLearn]);

  const requirementList = useMemo(() => {
    if (!course?.requirements) return [];
    return course.requirements
      .split('\n')
      .map((item) => item.replace(/^[-*\s]+/, '').trim())
      .filter(Boolean);
  }, [course?.requirements]);

  const imageSrc = course?.thumbnail
    ? resolveAssetUrl(course.thumbnail)
    : fallbackImage;

  const isOwned = !!course && ownedCourseIds.has(course.id);

  const handleAddToCart = () => {
    if (!course || isOwned) return;

    const cartItem = {
      id: course.id,
      itemType: 'course',
      title: course.title,
      price: Number((course.discountPrice ?? course.price) || 0),
      image: course.thumbnail || '',
      addedAt: new Date().toISOString()
    };

    try {
      const added = addCartItem(cartItem, user?.id);

      if (!added) {
        dispatchCartUpdated('Already in cart');
        return;
      }

      dispatchCartUpdated('Added to cart');
    } catch {
      dispatchCartUpdated('Cart update failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading course...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error || 'Course not found'}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const displayPrice = course.discountPrice ?? course.price;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <div className="bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-cyan-100 mb-6">{course.shortDescription || 'Professional mobile repair training course'}</p>

            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-bold">4.8</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold">{course.students.toLocaleString()} students</span>
              </div>
            </div>

            <p>
              Created by{' '}
              <Link to={`/instructor/${course.instructorId || course.id}`} className="text-cyan-300 hover:text-cyan-200 font-semibold">
                {course.instructorName}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                <ImageWithFallback src={imageSrc} alt={course.title} className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <PlayCircle className="w-12 h-12 text-blue-600" />
                  </button>
                </div>
              </div>
            </div>

            {learnList.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <h2 className="text-3xl font-bold mb-6 text-slate-900">What you'll learn</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {learnList.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {requirementList.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <h2 className="text-3xl font-bold mb-6 text-slate-900">Requirements</h2>
                <ul className="space-y-2">
                  {requirementList.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                      <span className="text-sm text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
              <h2 className="text-3xl font-bold mb-6 text-slate-900">Description</h2>
              <p className="text-slate-700 leading-relaxed text-lg">{course.description}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-2xl p-8 sticky top-24 border border-slate-100">
              <div className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                ${displayPrice.toFixed(2)}
              </div>

              <Link
                to={`/checkout/course/${course.id}`}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105 transition-all text-center block mb-3 font-bold"
              >
                {isOwned ? 'Already Purchased' : 'Buy Now'}
              </Link>

              {!isOwned && (
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 border-2 border-cyan-600 text-cyan-600 rounded-xl hover:bg-cyan-50 transition-all font-bold mb-6"
                >
                  Add to Cart
                </button>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600 font-semibold">Duration</span>
                  <span className="font-bold text-slate-900">
                    {course.duration ? `${course.duration} min` : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600 font-semibold">Lessons</span>
                  <span className="font-bold text-slate-900">{course.totalLessons ?? '-'}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600 font-semibold">Level</span>
                  <span className="font-bold text-slate-900">{course.level || '-'}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600 font-semibold">Video Content</span>
                  <FileText className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-600 font-semibold">Lifetime Access</span>
                  <span className="text-green-600 font-bold text-xl">✓</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-600 font-semibold">Certificate</span>
                  <span className="text-green-600 font-bold text-xl">✓</span>
                </div>
              </div>

              <div className="mt-6 text-sm text-slate-500">
                {course.createdAt ? `Published ${new Date(course.createdAt).toLocaleDateString()}` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
