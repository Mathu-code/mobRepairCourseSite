import { Link, Navigate } from 'react-router-dom';
import { Search, BookOpen, Smartphone, Wrench, Cpu, Zap, Star, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CourseCard } from '../components/CourseCard';
import { NoteCard } from '../components/NoteCard';
import { CategoryCard } from '../components/CategoryCard';
import { TestimonialCard } from '../components/TestimonialCard';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../lib/api';

const categories = [
  { icon: Smartphone, name: 'Smartphone Repair', courses: 4 },
  { icon: Wrench, name: 'Advanced Soldering', courses: 1 },
  { icon: Cpu, name: 'IT & Computer', courses: 1 },
  { icon: Zap, name: 'Cyber Security', courses: 1 },
];

const fallbackTrendingCourses = [
  {
    id: '1',
    title: 'Smartphone Master Technician Level 1-4',
    instructor: 'Kevin',
    rating: 5.0,
    students: 2500,
    price: 89.99,
    image: 'smartphone repair course'
  },
  {
    id: '2',
    title: 'Advanced Micro Soldering Expert Level 5',
    instructor: 'Kevin',
    rating: 5.0,
    students: 890,
    price: 149.99,
    image: 'microsoldering repair'
  },
  {
    id: '3',
    title: 'IT Expert Computer Specialist',
    instructor: 'Kevin',
    rating: 5.0,
    students: 1200,
    price: 129.99,
    image: 'computer repair'
  },
  {
    id: '4',
    title: 'AI Cyber Security Professional & Ethical Hacking',
    instructor: 'Kevin',
    rating: 5.0,
    students: 950,
    price: 179.99,
    image: 'cyber security'
  },
];

const fallbackPopularNotes = [
  {
    id: '1',
    title: 'Complete Smartphone Repair Manual',
    instructor: 'Kevin',
    rating: 5.0,
    pages: 200,
    price: 29.99,
  },
  {
    id: '2',
    title: 'Advanced Micro Soldering Guide',
    instructor: 'Kevin',
    rating: 5.0,
    pages: 150,
    price: 34.99,
  },
  {
    id: '3',
    title: 'Business Setup & Parts Supplier Directory',
    instructor: 'Kevin',
    rating: 5.0,
    pages: 85,
    price: 19.99,
  },
];

const testimonials = [
  {
    name: 'Sukhdeep Kaur',
    role: 'Certified Technician',
    content: 'Just finished my training for cellular phone technician. Kevin covered everything very precisely and clearly. Keep up the good work!',
    avatar: 'SK'
  },
  {
    name: 'Kimberly IH',
    role: 'Course Graduate',
    content: 'I highly recommend this thorough, practical course. Not only was it very hands-on, but much time was also devoted to sharing how to start your own repair service. Kevin is very knowledgeable, generous with his time, and patient.',
    avatar: 'KI'
  },
  {
    name: 'Kudzai Chivore',
    role: 'Business Owner',
    content: 'This was an amazing experience. When I came I had zero knowledge but I left with the knowledge required to start my business. Honestly the best experience. Kevin is hands on and will make sure that you understand the concepts.',
    avatar: 'KC'
  },
];

export function LandingPage() {
  const { user } = useAuth();
  const [trendingCourses, setTrendingCourses] = useState(fallbackTrendingCourses);
  const [popularNotes, setPopularNotes] = useState(fallbackPopularNotes);

  useEffect(() => {
    const controller = new AbortController();

    const loadHomeContent = async () => {
      try {
        const [courseRes, noteRes] = await Promise.all([
          fetch(apiUrl('/api/courses?limit=8'), { signal: controller.signal }),
          fetch(apiUrl('/api/notes?limit=8'), { signal: controller.signal })
        ]);

        const [courseJson, noteJson] = await Promise.all([
          courseRes.json().catch(() => ({})),
          noteRes.json().catch(() => ({}))
        ]);

        if (courseRes.ok && courseJson?.success) {
          const mappedCourses = (courseJson?.data?.courses || [])
            .slice(0, 4)
            .map((c: any, index: number) => {
              const firstName = c?.instructorId?.firstName || '';
              const lastName = c?.instructorId?.lastName || '';
              const fallback = fallbackTrendingCourses[index];
              return {
                id: String(c?._id || fallback?.id || index + 1),
                title: c?.title || fallback?.title || 'Untitled course',
                instructor: `${firstName} ${lastName}`.trim() || fallback?.instructor || 'Kevin',
                rating: Number(c?.rating || fallback?.rating || 5),
                students: Number(c?.students || c?.enrollmentsCount || fallback?.students || 0),
                price: Number(c?.discountPrice ?? c?.price ?? fallback?.price ?? 0),
                image: c?.thumbnail || fallback?.image || 'mobile repair course'
              };
            });

          if (mappedCourses.length > 0) {
            setTrendingCourses(mappedCourses);
          }
        }

        if (noteRes.ok && noteJson?.success) {
          const mappedNotes = (noteJson?.data?.notes || [])
            .slice(0, 3)
            .map((n: any, index: number) => {
              const firstName = n?.instructorId?.firstName || '';
              const lastName = n?.instructorId?.lastName || '';
              const fallback = fallbackPopularNotes[index];
              return {
                id: String(n?._id || fallback?.id || index + 1),
                title: n?.title || fallback?.title || 'Untitled guide',
                instructor: `${firstName} ${lastName}`.trim() || fallback?.instructor || 'Kevin',
                rating: Number(n?.rating || fallback?.rating || 5),
                pages: Number(n?.pages || fallback?.pages || 0),
                price: Number(n?.discountPrice ?? n?.price ?? fallback?.price ?? 0)
              };
            });

          if (mappedNotes.length > 0) {
            setPopularNotes(mappedNotes);
          }
        }
      } catch {
        // Keep fallback content when API is unavailable.
      }
    };

    loadHomeContent();
    return () => controller.abort();
  }, []);

  // Redirect instructors to their dashboard
  if (user && user.role === 'instructor') {
    return <Navigate to="/instructor/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4 fill-cyan-500 text-cyan-500" />
              <span>Training Students from All Over Canada</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-cyan-800 to-blue-900 bg-clip-text text-transparent leading-tight">
              Smartphone Master Technician Training
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Learn from Kevin, an expert instructor with years of experience. Hands-on training in smartphone repair, microsoldering, and advanced diagnostics. Weekends and evening classes available.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-xl shadow-cyan-500/10 p-2 flex items-center max-w-2xl mx-auto border border-slate-200 hover:border-cyan-300 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-4" />
              <input
                type="text"
                placeholder="Search for smartphone repair, cyber security, IT courses..."
                className="flex-1 px-4 py-3 outline-none text-slate-700"
              />
              <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium">
                Search
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-4">
              {!user && (
                <Link to="/signup" className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all font-semibold">
                  Get Started Free
                </Link>
              )}
              <Link to="/courses" className="px-8 py-4 border-2 border-cyan-600 text-cyan-600 rounded-xl hover:bg-cyan-50 hover:shadow-lg transition-all font-semibold">
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Our Course Offerings</h2>
        <p className="text-center text-slate-600 mb-12 text-lg">Comprehensive hands-on training courses designed for practical learning</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.name} {...category} />
          ))}
        </div>
      </section>

      {/* Trending Courses */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Most Popular Repair Courses</h2>
              <p className="text-slate-600 text-lg">Start learning with our top-rated courses</p>
            </div>
            <Link to="/courses" className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold group">
              View All <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Notes */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Top Repair Guides & Manuals</h2>
            <p className="text-slate-600 text-lg">Comprehensive documentation for every repair scenario</p>
          </div>
          <Link to="/notes" className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold group">
            View All <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularNotes.map((note) => (
            <NoteCard key={note.id} {...note} />
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Why Choose Us?</h2>
        <p className="text-center text-slate-600 mb-12 text-lg">Comprehensive training that sets you up for success</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Hands-On Training</h3>
            <p className="text-slate-600">Real phones, real repairs. Practice on actual devices with all tools and equipment provided in class.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Expert Instructor</h3>
            <p className="text-slate-600">Learn from Kevin, with years of industry experience and thousands of satisfied students across Canada.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Business Support</h3>
            <p className="text-slate-600">Learn how to start your own repair business, including parts suppliers, pricing strategies, and marketing.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Flexible Schedule</h3>
            <p className="text-slate-600">Weekend and evening classes available in Mississauga and other locations across Canada.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">24/7 Support</h3>
            <p className="text-slate-600">Join our support group with access to parts suppliers and ongoing assistance even after course completion.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Certification</h3>
            <p className="text-slate-600">Receive a certificate upon completion to showcase your skills and expertise to employers or customers.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Success Stories from Our Students</h2>
          <p className="text-center text-slate-600 mb-12 text-lg">Verified Google reviews from students all over Canada</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] -z-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-200 rounded-full text-sm font-medium mb-6 border border-cyan-500/30">
            <Zap className="w-4 h-4" />
            <span>Limited Time: Get 30% Off All Courses</span>
          </div>
          <h2 className="text-5xl font-bold mb-6">Ready to Start Your Repair Career?</h2>
          <p className="text-xl mb-10 text-cyan-100">
            Join students from all over Canada who have taken our courses. Classes available in Mississauga, Toronto, Ottawa, Montreal, Calgary, Edmonton, Vancouver and other cities.
          </p>
          <div className="flex items-center justify-center gap-4">
            {!user && (
              <Link to="/signup" className="px-10 py-4 bg-white text-slate-900 rounded-xl hover:bg-cyan-50 hover:shadow-2xl hover:scale-105 transition-all font-bold">
                Sign Up Now
              </Link>
            )}
            <Link to="/courses" className="px-10 py-4 border-2 border-white text-white rounded-xl hover:bg-white/10 hover:shadow-2xl transition-all font-bold">
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
