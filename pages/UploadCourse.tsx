import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Upload, Plus, X, Video, FileText } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function UploadCourse() {
  const [currentStep, setCurrentStep] = useState(1);
  const [lessons, setLessons] = useState([{ id: 1, title: '', video: null }]);

  const addLesson = () => {
    setLessons([...lessons, { id: lessons.length + 1, title: '', video: null }]);
  };

  const removeLesson = (id: number) => {
    setLessons(lessons.filter(lesson => lesson.id !== id));
  };

  const steps = [
    { number: 1, title: 'Basic Information' },
    { number: 2, title: 'Course Content' },
    { number: 3, title: 'Pricing & Publish' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/instructor/dashboard" className="text-indigo-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="mb-2">Upload New Course</h1>
          <p className="text-gray-600">Create and publish your course to reach thousands of students</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep >= step.number
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span className={`ml-3 ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${currentStep > step.number ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="mb-6">Basic Information</h2>
              
              <div>
                <label htmlFor="title" className="block mb-2">
                  Course Title *
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="e.g., Complete Web Development Bootcamp"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="subtitle" className="block mb-2">
                  Subtitle
                </label>
                <input
                  id="subtitle"
                  type="text"
                  placeholder="A brief description of your course"
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
                  placeholder="Describe what students will learn in your course..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Select a category</option>
                    <option>Development</option>
                    <option>Business</option>
                    <option>Design</option>
                    <option>Marketing</option>
                    <option>IT & Software</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="level" className="block mb-2">
                    Level *
                  </label>
                  <select
                    id="level"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Select a level</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>All Levels</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2">
                  Course Thumbnail *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                  <p className="text-gray-500 text-sm">PNG, JPG up to 10MB</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="mb-6">Course Content</h2>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block">
                    Lessons
                  </label>
                  <button
                    onClick={addLesson}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Lesson
                  </button>
                </div>

                <div className="space-y-4">
                  {lessons.map((lesson, index) => (
                    <div key={lesson.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-4">
                          <input
                            type="text"
                            placeholder={`Lesson ${index + 1} title`}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 text-sm">Upload video file</p>
                          </div>
                        </div>
                        {lessons.length > 1 && (
                          <button
                            onClick={() => removeLesson(lesson.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-2">
                  Course Materials (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition cursor-pointer">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload PDF notes and resources</p>
                  <p className="text-gray-500 text-sm">PDF files up to 50MB</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="mb-6">Pricing & Publish</h2>

              <div>
                <label htmlFor="price" className="block mb-2">
                  Course Price (USD) *
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
                  Recommended: $50 - $200 based on course length and content
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                  <span>Make this course free</span>
                </label>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="mb-4">Course Summary</h3>
                <div className="bg-gray-50 rounded-lg p-6 space-y-3 text-gray-700">
                  <p><strong>Status:</strong> Ready to publish</p>
                  <p><strong>Lessons:</strong> {lessons.length}</p>
                  <p><strong>Estimated Length:</strong> Based on uploaded content</p>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-indigo-800 text-sm">
                  Once published, your course will be reviewed by our team and made available to students within 24-48 hours.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Next
              </button>
            ) : (
              <div className="flex gap-3">
                <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Save as Draft
                </button>
                <Link
                  to="/instructor/dashboard"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Publish Course
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
