import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { NotesCard } from '../components/NotesCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

const notes = [
  {
    id: '1',
    title: 'Python Programming Complete Notes',
    author: 'Dr. Alex Kumar',
    rating: 4.9,
    pages: 156,
    price: 29.99,
  },
  {
    id: '2',
    title: 'Business Management Study Guide',
    author: 'Prof. Lisa Anderson',
    rating: 4.7,
    pages: 98,
    price: 24.99,
  },
  {
    id: '3',
    title: 'UI Design Principles & Patterns',
    author: 'James Wilson',
    rating: 4.8,
    pages: 120,
    price: 34.99,
  },
  {
    id: '4',
    title: 'Data Structures and Algorithms',
    author: 'Michael Zhang',
    rating: 4.9,
    pages: 180,
    price: 39.99,
  },
  {
    id: '5',
    title: 'Digital Marketing Fundamentals',
    author: 'Sarah Martinez',
    rating: 4.6,
    pages: 85,
    price: 19.99,
  },
  {
    id: '6',
    title: 'Machine Learning Study Notes',
    author: 'Dr. Robert Chen',
    rating: 4.8,
    pages: 145,
    price: 44.99,
  },
];

export default function NotesMarketplace() {
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
              placeholder="Search for notes and study materials..."
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
                  {/* Subject Filter */}
                  <div>
                    <h4 className="mb-3">Subject</h4>
                    <div className="space-y-2">
                      {['Computer Science', 'Business', 'Mathematics', 'Science', 'Engineering'].map((subject) => (
                        <label key={subject} className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                          <span className="text-gray-700 text-sm">{subject}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Grade Filter */}
                  <div>
                    <h4 className="mb-3">Grade/Level</h4>
                    <div className="space-y-2">
                      {['High School', 'Undergraduate', 'Graduate', 'Professional'].map((grade) => (
                        <label key={grade} className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                          <span className="text-gray-700 text-sm">{grade}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <h4 className="mb-3">Price</h4>
                    <div className="space-y-2">
                      {['Free', 'Under $20', '$20 - $40', 'Over $40'].map((price) => (
                        <label key={price} className="flex items-center gap-2">
                          <input type="radio" name="price" className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                          <span className="text-gray-700 text-sm">{price}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Format Filter */}
                  <div>
                    <h4 className="mb-3">Format</h4>
                    <div className="space-y-2">
                      {['PDF', 'Handwritten', 'Typed', 'Slides'].map((format) => (
                        <label key={format} className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                          <span className="text-gray-700 text-sm">{format}</span>
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
                <h2 className="mb-1">Study Notes & Materials</h2>
                <p className="text-gray-600">{notes.length} items found</p>
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

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {notes.map((note) => (
                <NotesCard key={note.id} {...note} />
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
