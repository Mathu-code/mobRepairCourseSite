import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Upload, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UploadNotes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/instructor/dashboard" className="text-indigo-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="mb-2">Upload Notes</h1>
          <p className="text-gray-600">Share your study materials with students worldwide</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <form className="space-y-6">
            <div>
              <label htmlFor="title" className="block mb-2">
                Notes Title *
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g., Python Programming Complete Notes"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block mb-2">
                Description *
              </label>
              <textarea
                id="description"
                rows={6}
                placeholder="Describe what your notes cover and who they're for..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="subject" className="block mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Select a subject</option>
                  <option>Computer Science</option>
                  <option>Business</option>
                  <option>Mathematics</option>
                  <option>Science</option>
                  <option>Engineering</option>
                  <option>Languages</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="grade" className="block mb-2">
                  Grade/Level *
                </label>
                <select
                  id="grade"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Select level</option>
                  <option>High School</option>
                  <option>Undergraduate</option>
                  <option>Graduate</option>
                  <option>Professional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-2">
                Upload PDF *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-400 transition cursor-pointer">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-gray-500 text-sm mb-4">PDF files up to 100MB</p>
                <button
                  type="button"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Choose File
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-2">
                Preview (First Page)
              </label>
              <p className="text-gray-600 text-sm mb-4">
                The first page of your PDF will be shown as a preview to potential buyers
              </p>
              <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                <div className="text-center text-gray-400">
                  <FileText className="w-16 h-16 mx-auto mb-2" />
                  <p>Preview will appear here</p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="price" className="block mb-2">
                Price (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-gray-500 text-sm mt-2">
                Recommended: $15 - $50 based on content length and quality
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                <span>Make these notes free</span>
              </label>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-indigo-800 text-sm">
                Your notes will be reviewed for quality and plagiarism before being published. This usually takes 24-48 hours.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Link
                to="/instructor/dashboard"
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-center"
              >
                Cancel
              </Link>
              <button
                type="button"
                className="flex-1 px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Publish Notes
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
