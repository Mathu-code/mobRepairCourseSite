import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CourseCard } from '../components/CourseCard';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const courses = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp 2025',
    instructor: 'Sarah Johnson',
    rating: 4.8,
    students: 12500,
    price: 89.99,
    thumbnail: 'https://images.unsplash.com/photo-1759884248009-92c5e957708e?w=400',
  },
  {
    id: '2',
    title: 'Business Strategy Masterclass',
    instructor: 'Michael Chen',
    rating: 4.9,
    students: 8900,
    price: 79.99,
    thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400',
  },
  {
    id: '3',
    title: 'UI/UX Design Fundamentals',
    instructor: 'Emma Davis',
    rating: 4.7,
    students: 15300,
    price: 69.99,
    thumbnail: 'https://images.unsplash.com/photo-1716703435551-4326ab111ae2?w=400',
  },
  {
    id: '4',
    title: 'Digital Marketing Complete Guide',
    instructor: 'David Brown',
    rating: 4.6,
    students: 9200,
    price: 74.99,
    thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400',
  },
  {
    id: '5',
    title: 'Python Programming Mastery',
    instructor: 'Alex Kumar',
    rating: 4.9,
    students: 18700,
    price: 84.99,
    thumbnail: 'https://images.unsplash.com/photo-1759884248009-92c5e957708e?w=400',
  },
  {
    id: '6',
    title: 'Data Science and Machine Learning',
    instructor: 'Jennifer Lee',
    rating: 4.8,
    students: 14200,
    price: 94.99,
    thumbnail: 'https://images.unsplash.com/photo-1759884248009-92c5e957708e?w=400',
  },
];

export default function CourseMarketplace() {
  const [showFilters, setShowFilters] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="bg-white rounded-lg p-2 flex items-center gap-2 shadow-sm">
            <Search className="w-5 h-5 text-gray-400 ml-2" />
            <input
              type="text"
              placeholder="Search for courses..."
              className="flex-1 px-4 py-2 outline-none"
            />
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
              Search
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-64 flex-shrink-0">
              <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3>Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <h4 className="mb-3">Category</h4>
                    <div className="space-y-2">
                      {['Development', 'Business', 'Design', 'Marketing', 'IT & Software'].map((category) => (
                        <label key={category} className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                          <span className="text-gray-700 text-sm">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <h4 className="mb-3">Price</h4>
                    <div className="space-y-2">
                      {['Free', 'Paid', 'Under $50', '$50 - $100', 'Over $100'].map((price) => (
                        <label key={price} className="flex items-center gap-2">
                          <input type="radio" name="price" className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                          <span className="text-gray-700 text-sm">{price}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Level Filter */}
                  <div>
                    <h4 className="mb-3">Level</h4>
                    <div className="space-y-2">
                      {['All Levels', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
                        <label key={level} className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                          <span className="text-gray-700 text-sm">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <h4 className="mb-3">Rating</h4>
                    <div className="space-y-2">
                      {['4.5 & up', '4.0 & up', '3.5 & up', '3.0 & up'].map((rating) => (
                        <label key={rating} className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                          <span className="text-gray-700 text-sm">⭐ {rating}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="w-full mt-6 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                  Clear All Filters
                </button>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="mb-1">All Courses</h2>
                <p className="text-gray-600">{courses.length} courses found</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
                <select className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Most Popular</option>
                  <option>Highest Rated</option>
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {courses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">1</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
