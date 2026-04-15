import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Play, FileText, MessageSquare, Download, ChevronLeft, Check } from 'lucide-react';

const lessons = [
  { id: 1, title: 'Introduction to the Course', duration: '5:30', completed: true },
  { id: 2, title: 'Setting Up Your Environment', duration: '12:45', completed: true },
  { id: 3, title: 'Understanding the Basics', duration: '18:20', completed: false },
  { id: 4, title: 'Advanced Techniques', duration: '22:15', completed: false },
  { id: 5, title: 'Building Your First Project', duration: '45:30', completed: false },
  { id: 6, title: 'Advanced Implementation', duration: '38:45', completed: false },
];

const comments = [
  {
    id: 1,
    user: 'John Smith',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50',
    time: '2 hours ago',
    text: 'Great explanation! This really helped me understand the concept.',
  },
  {
    id: 2,
    user: 'Emily Davis',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50',
    time: '5 hours ago',
    text: 'Could you provide more examples on this topic?',
  },
];

export default function VideoPlayer() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'notes' | 'comments' | 'downloads'>('notes');
  const [currentLesson, setCurrentLesson] = useState(lessons[2]);

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Top Navigation */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/student/dashboard" className="text-gray-400 hover:text-white transition">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-white text-lg">Complete Web Development Bootcamp 2025</h1>
        </div>
        <div className="text-gray-400 text-sm">
          Lesson {currentLesson.id} of {lessons.length}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Playlist Sidebar */}
        <aside className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-white mb-4">Course Content</h2>
            <div className="space-y-2">
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => setCurrentLesson(lesson)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                    currentLesson.id === lesson.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {lesson.completed ? (
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <Play className="w-5 h-5 flex-shrink-0" />
                  )}
                  <div className="flex-1 text-left">
                    <div className="text-sm line-clamp-2">{lesson.title}</div>
                    <div className="text-xs opacity-75 mt-1">{lesson.duration}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="bg-black aspect-video">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-opacity-30 transition">
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
                <p className="text-white">{currentLesson.title}</p>
              </div>
            </div>
          </div>

          {/* Lesson Info */}
          <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
            <h2 className="text-white mb-2">{currentLesson.title}</h2>
            <p className="text-gray-400 text-sm">
              In this lesson, you'll learn the fundamental concepts and best practices for modern web development.
            </p>
          </div>

          {/* Content Tabs */}
          <div className="flex-1 flex flex-col bg-gray-800 overflow-hidden">
            <div className="border-b border-gray-700">
              <div className="flex px-6">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-4 py-3 border-b-2 transition ${
                    activeTab === 'notes'
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notes
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`px-4 py-3 border-b-2 transition ${
                    activeTab === 'comments'
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Comments ({comments.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('downloads')}
                  className={`px-4 py-3 border-b-2 transition ${
                    activeTab === 'downloads'
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Downloads
                  </div>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'notes' && (
                <div className="max-w-3xl">
                  <h3 className="text-white mb-4">Lesson Notes</h3>
                  <div className="text-gray-300 space-y-4">
                    <p>
                      Welcome to this comprehensive lesson on web development fundamentals. In this section, we'll cover:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Core concepts and terminology</li>
                      <li>Best practices for modern development</li>
                      <li>Common pitfalls to avoid</li>
                      <li>Practical examples and demonstrations</li>
                    </ul>
                    <p>
                      Make sure to follow along with the code examples and try implementing the concepts on your own.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="max-w-3xl">
                  <div className="mb-6">
                    <textarea
                      placeholder="Add a comment..."
                      className="w-full bg-gray-700 text-white rounded-lg p-4 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      rows={3}
                    />
                    <button className="mt-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                      Post Comment
                    </button>
                  </div>

                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <img
                          src={comment.avatar}
                          alt={comment.user}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white">{comment.user}</span>
                            <span className="text-gray-500 text-sm">{comment.time}</span>
                          </div>
                          <p className="text-gray-300">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'downloads' && (
                <div className="max-w-3xl">
                  <h3 className="text-white mb-4">Downloadable Resources</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Lesson_03_Code_Examples.zip', size: '2.4 MB' },
                      { name: 'Lesson_03_Slides.pdf', size: '1.8 MB' },
                      { name: 'Lesson_03_Resources.pdf', size: '850 KB' },
                    ].map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-white">{file.name}</div>
                            <div className="text-gray-400 text-sm">{file.size}</div>
                          </div>
                        </div>
                        <Download className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
