import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CourseCard } from '../components/CourseCard';
import { NotesCard } from '../components/NotesCard';
import { Search, Smartphone, Wrench, Cpu, Zap, TrendingUp, Users, Award, ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const categories = [
  { icon: Smartphone, name: 'Smartphone Repair', count: 4 },
  { icon: Wrench, name: 'Advanced Soldering', count: 1 },
  { icon: Cpu, name: 'IT & Computer', count: 1 },
  { icon: Zap, name: 'Cyber Security', count: 1 },
];

const trendingCourses = [
  {
    id: '1',
    title: 'Smartphone Master Technician Level 1-4',
    instructor: 'Kevin',
    rating: 5.0,
    students: 2500,
    price: 89.99,
    thumbnail: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080'
  },
  {
    id: '2',
    title: 'Advanced Micro Soldering Expert Level 5',
    instructor: 'Kevin',
    rating: 5.0,
    students: 890,
    price: 149.99,
    thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080'
  },
  {
    id: '3',
    title: 'IT Expert Computer Specialist',
    instructor: 'Kevin',
    rating: 5.0,
    students: 1200,
    price: 129.99,
    thumbnail: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080'
  },
  {
    id: '4',
    title: 'AI Cyber Security Professional & Ethical Hacking',
    instructor: 'Kevin',
    rating: 5.0,
    students: 950,
    price: 179.99,
    thumbnail: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080'
  },
];

const popularNotes = [
  {
    id: '1',
    title: 'Complete Smartphone Repair Manual',
    author: 'Kevin',
    rating: 5.0,
    pages: 200,
    price: 29.99,
  },
  {
    id: '2',
    title: 'Advanced Micro Soldering Guide',
    author: 'Kevin',
    rating: 5.0,
    pages: 150,
    price: 34.99,
  },
  {
    id: '3',
    title: 'Business Setup & Parts Supplier Directory',
    author: 'Kevin',
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
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
  },
  {
    name: 'Kimberly IH',
    role: 'Course Graduate',
    content: 'I highly recommend this thorough, practical course. Kevin is very knowledgeable, generous with his time, and patient. He really cares about his students and wants us to succeed.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
  },
  {
    name: 'Kudzai Chivore',
    role: 'Business Owner',
    content: 'This was an amazing experience. When I came I had zero knowledge but I left with the knowledge required to start my business. Kevin is hands on and will make sure you understand.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
  },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const coursesPerPage = 4;
  const maxSlides = Math.ceil(trendingCourses.length / coursesPerPage);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % maxSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-200 rounded-full text-sm font-medium mb-6 border border-cyan-500/30">
              <Star className="w-4 h-4 fill-cyan-400 text-cyan-400" />
              <span>Training Students from All Over Canada</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">Smartphone Master Technician Training</h1>
            <p className="text-xl mb-10 text-cyan-100">
              Learn from Kevin, an expert instructor with years of experience. Hands-on training in smartphone repair, microsoldering, and advanced diagnostics. Weekends and evening classes available.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-2xl p-2 flex items-center gap-2 max-w-2xl mx-auto shadow-2xl shadow-cyan-500/20">
              <Search className="w-5 h-5 text-slate-400 ml-4" />
              <input
                type="text"
                placeholder="Search for smartphone repair, cyber security, IT courses..."
                className="flex-1 px-4 py-3 outline-none text-slate-900"
              />
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium">
                Search
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 mt-10">
              <Link to="/register" className="bg-white text-slate-900 px-10 py-4 rounded-xl hover:bg-cyan-50 hover:shadow-2xl hover:scale-105 transition-all font-bold">
                Start Learning Free
              </Link>
              <Link to="/instructor/dashboard" className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-xl hover:bg-white/10 hover:shadow-2xl transition-all font-bold">
                Teach Repair Skills
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Our Course Offerings</h2>
        <p className="text-center text-slate-600 mb-12 text-lg">Comprehensive hands-on training courses designed for practical learning</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.name}
                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl hover:shadow-cyan-500/10 transition-all cursor-pointer group border border-slate-100 hover:border-cyan-200 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:from-cyan-500 group-hover:to-blue-600 transition-all">
                  <Icon className="w-8 h-8 text-cyan-600 group-hover:text-white transition-all" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-900">{category.name}</h3>
                <p className="text-slate-600">{category.count} courses</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trending Courses Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Most Popular Repair Courses</h2>
            <p className="text-slate-600 text-lg">Top-rated mobile repair courses this month</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md hover:shadow-xl hover:bg-cyan-50 transition-all border border-slate-200 hover:border-cyan-300"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={nextSlide}
              className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md hover:shadow-xl hover:scale-105 transition-all"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingCourses.map((course) => (
            <CourseCard image={''} key={course.id} {...course} />
          ))}
        </div>
      </section>

      {/* Popular Notes */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Top Repair Guides & Manuals</h2>
            <p className="text-slate-600 text-lg">Comprehensive repair documentation and reference materials</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularNotes.map((note) => (
              <NotesCard key={note.id} {...note} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/notes" className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-4 rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all font-bold">
              View All Guides
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-4">
                <Users className="w-12 h-12" />
              </div>
              <div className="text-4xl font-bold mb-2">2500+</div>
              <p className="text-indigo-200">Students Trained Across Canada</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-4">
                <Smartphone className="w-12 h-12" />
              </div>
              <div className="text-4xl font-bold mb-2">7</div>
              <p className="text-indigo-200">Professional Courses</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-4">
                <Award className="w-12 h-12" />
              </div>
              <div className="text-4xl font-bold mb-2">5.0★</div>
              <p className="text-indigo-200">Google Reviews Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Success Stories from Our Students</h2>
          <p className="text-slate-600 text-lg">Verified Google reviews from students all over Canada</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10 transition-all border border-slate-100 hover:border-cyan-200 hover:-translate-y-1">
              <Quote className="w-10 h-10 text-cyan-200 mb-4" />
              <p className="text-slate-700 mb-6 leading-relaxed">{testimonial.content}</p>
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="text-slate-900 font-semibold">{testimonial.name}</div>
                  <div className="text-slate-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-200 rounded-full text-sm font-medium mb-6 border border-cyan-500/30">
            <Zap className="w-4 h-4" />
            <span>Special Offer: 30% Off All Courses This Week</span>
          </div>
          <h2 className="text-5xl font-bold mb-6">Ready to Start Your Repair Career?</h2>
          <p className="text-xl text-cyan-100 mb-10 max-w-2xl mx-auto">
            Join students from all over Canada who have taken our courses. Classes available in Mississauga, Toronto, Ottawa, Montreal, Calgary, Edmonton, Vancouver and other cities.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="bg-white text-slate-900 px-10 py-4 rounded-xl hover:bg-cyan-50 hover:shadow-2xl hover:scale-105 transition-all font-bold">
              Start Learning Free
            </Link>
            <Link to="/courses" className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-xl hover:bg-white/10 hover:shadow-2xl transition-all font-bold">
              Browse Repair Courses
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
