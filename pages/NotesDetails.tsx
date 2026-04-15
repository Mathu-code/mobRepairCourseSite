import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Star, FileText, Download, Eye, Check } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const reviews = [
  {
    id: 1,
    name: 'Alex Thompson',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    rating: 5,
    date: '1 week ago',
    comment: 'These notes are incredibly detailed and well-organized. Helped me ace my exam!',
  },
  {
    id: 2,
    name: 'Maria Garcia',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Clear explanations and great examples. Worth every penny!',
  },
];

export default function NotesDetails() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Preview Section */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-600 mb-4">
                <FileText className="w-5 h-5" />
                <span className="text-sm">PDF Study Notes</span>
              </div>
              <h1 className="mb-4">Python Programming Complete Notes</h1>
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span>4.9</span>
                  <span className="text-gray-600">(450 ratings)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">3,200 students</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-8">
                <img
                  src="https://images.unsplash.com/photo-1556302132-40bb13638500?w=50&h=50&fit=crop"
                  alt="Instructor"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="text-gray-600 text-sm">Created by</p>
                  <Link to="/instructor/1" className="text-indigo-600 hover:underline">
                    Dr. Alex Kumar
                  </Link>
                </div>
              </div>

              {/* Preview Pages */}
              <div className="border-2 border-gray-200 rounded-lg p-8 bg-gradient-to-br from-gray-50 to-white">
                <div className="text-center mb-6">
                  <FileText className="w-20 h-20 text-indigo-300 mx-auto mb-4" />
                  <h3 className="mb-2">Preview Available</h3>
                  <p className="text-gray-600">View the first 3 pages to see the quality</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((page) => (
                    <div
                      key={page}
                      className="aspect-[3/4] bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-400 transition"
                    >
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">Page {page}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="mb-4">Description</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Comprehensive Python programming notes covering everything from basic syntax to advanced concepts.
                  Perfect for students, professionals, and anyone looking to master Python.
                </p>
                <p>
                  These notes include clear explanations, code examples, diagrams, and practice exercises. All content
                  has been carefully organized and formatted for easy learning and reference.
                </p>
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="mb-6">What's included</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  '156 pages of detailed content',
                  'Code examples and snippets',
                  'Visual diagrams and charts',
                  'Practice exercises',
                  'Quick reference guides',
                  'PDF format for easy access',
                  'Lifetime access',
                  'Regular updates',
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Topics Covered */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="mb-4">Topics Covered</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  'Python Basics',
                  'Data Types',
                  'Control Flow',
                  'Functions',
                  'OOP',
                  'File Handling',
                  'Error Handling',
                  'Modules',
                  'Data Structures',
                  'Algorithms',
                  'Best Practices',
                ].map((topic) => (
                  <span
                    key={topic}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
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

          {/* Sidebar - Buy Card */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <div className="aspect-[3/4] bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg flex items-center justify-center mb-6">
                <FileText className="w-24 h-24 text-indigo-300" />
              </div>
              <div className="text-gray-900 text-3xl mb-2">$29.99</div>
              <p className="text-gray-600 text-sm mb-6">156 pages • PDF format</p>
              <Link
                to="/checkout"
                className="block w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition mb-3 text-center"
              >
                Buy Now
              </Link>
              <button className="w-full border-2 border-gray-300 text-gray-900 py-3 rounded-lg hover:bg-gray-50 transition">
                Add to Cart
              </button>
              <p className="text-center text-gray-600 text-sm mt-4">
                30-Day Money-Back Guarantee
              </p>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="mb-4">Features</h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">Instant download</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">High-quality PDF</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">Lifetime access</span>
                  </div>
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
