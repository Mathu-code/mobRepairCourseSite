import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Star, Users, Clock, Award, Check, Play, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';

const courseContent = [
  {
    title: 'Getting Started',
    lessons: [
      { id: 1, title: 'Introduction to the Course', duration: '5:30', type: 'video' },
      { id: 2, title: 'Setting Up Your Environment', duration: '12:45', type: 'video' },
      { id: 3, title: 'Course Materials', duration: '8 pages', type: 'notes' },
    ],
  },
  {
    title: 'Core Concepts',
    lessons: [
      { id: 4, title: 'Understanding the Basics', duration: '18:20', type: 'video' },
      { id: 5, title: 'Advanced Techniques', duration: '22:15', type: 'video' },
      { id: 6, title: 'Practice Exercises', duration: '15 pages', type: 'notes' },
    ],
  },
  {
    title: 'Real-World Projects',
    lessons: [
      { id: 7, title: 'Project 1: Building Your First App', duration: '45:30', type: 'video' },
      { id: 8, title: 'Project 2: Advanced Implementation', duration: '38:45', type: 'video' },
      { id: 9, title: 'Project Resources', duration: '20 pages', type: 'notes' },
    ],
  },
];

const reviews = [
  {
    id: 1,
    name: 'John Smith',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Excellent course! The instructor explains everything clearly and the projects are very practical.',
  },
  {
    id: 2,
    name: 'Emily Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    rating: 5,
    date: '1 month ago',
    comment: 'Best investment I made this year. Highly recommended for anyone looking to master this topic.',
  },
  {
    id: 3,
    name: 'Michael Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    rating: 4,
    date: '1 month ago',
    comment: 'Great content and well-structured. Would love to see more advanced topics covered.',
  },
];

export default function CourseDetails() {
  const { id } = useParams();
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);

  const toggleSection = (index: number) => {
    setExpandedSections(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Course Header */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="inline-block px-3 py-1 bg-yellow-500 text-gray-900 rounded text-sm mb-4">
                Bestseller
              </div>
              <h1 className="mb-4">Complete Web Development Bootcamp 2025</h1>
              <p className="text-xl text-gray-300 mb-6">
                Master modern web development from scratch. Build real-world projects and launch your career.
              </p>
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span>4.8</span>
                  <span className="text-gray-400">(2,450 ratings)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>12,500 students</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1556302132-40bb13638500?w=50&h=50&fit=crop"
                  alt="Instructor"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="text-gray-400 text-sm">Created by</p>
                  <Link to="/instructor/1" className="hover:text-indigo-400 transition">
                    Sarah Johnson
                  </Link>
                </div>
              </div>
            </div>

            {/* Video Preview (Desktop) */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
                <div className="aspect-video bg-gray-800 relative group cursor-pointer">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1759884248009-92c5e957708e?w=600"
                    alt="Course preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition">
                      <Play className="w-8 h-8 text-gray-900 ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-gray-900 text-3xl mb-4">$89.99</div>
                  <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition mb-3">
                    Buy Now
                  </button>
                  <button className="w-full border-2 border-gray-300 text-gray-900 py-3 rounded-lg hover:bg-gray-50 transition">
                    Add to Cart
                  </button>
                  <p className="text-center text-gray-600 text-sm mt-4">
                    30-Day Money-Back Guarantee
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="mb-6">What you'll learn</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Build 15+ real-world projects',
                  'Master HTML, CSS, and JavaScript',
                  'Learn React and modern frameworks',
                  'Backend development with Node.js',
                  'Database design and management',
                  'Deployment and hosting',
                  'Best practices and clean code',
                  'Portfolio-ready projects',
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="mb-2">Course Content</h2>
              <p className="text-gray-600 mb-6">
                {courseContent.length} sections • {courseContent.reduce((acc, section) => acc + section.lessons.length, 0)} lectures • 12h 30m total length
              </p>
              <div className="space-y-2">
                {courseContent.map((section, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection(index)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        {expandedSections.includes(index) ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                        <span>{section.title}</span>
                      </div>
                      <span className="text-gray-600 text-sm">{section.lessons.length} lectures</span>
                    </button>
                    {expandedSections.includes(index) && (
                      <div className="border-t border-gray-200">
                        {section.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              {lesson.type === 'video' ? (
                                <Play className="w-4 h-4 text-gray-400" />
                              ) : (
                                <FileText className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-gray-700">{lesson.title}</span>
                            </div>
                            <span className="text-gray-600 text-sm">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="mb-4">Requirements</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• A computer with internet connection</li>
                <li>• No prior programming experience required</li>
                <li>• Willingness to learn and practice</li>
              </ul>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="mb-4">Description</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Welcome to the most comprehensive web development course available online. This bootcamp will take you from complete beginner to job-ready developer.
                </p>
                <p>
                  You'll learn by building real-world projects, not just watching endless lectures. Each section includes hands-on coding exercises and challenges.
                </p>
                <p>
                  By the end of this course, you'll have a portfolio of projects to showcase to potential employers and the confidence to build your own web applications.
                </p>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="mb-6">Student Reviews</h2>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-start gap-4">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span>{review.name}</span>
                          <span className="text-gray-600 text-sm">{review.date}</span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar (Mobile Buy Section) */}
          <div className="lg:hidden">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <div className="text-gray-900 text-3xl mb-4">$89.99</div>
              <Link to="/checkout" className="block w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition mb-3 text-center">
                Buy Now
              </Link>
              <button className="w-full border-2 border-gray-300 text-gray-900 py-3 rounded-lg hover:bg-gray-50 transition">
                Add to Cart
              </button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="mb-4">This course includes:</h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span>12.5 hours on-demand video</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span>43 downloadable resources</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-gray-400" />
                  <span>Certificate of completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
