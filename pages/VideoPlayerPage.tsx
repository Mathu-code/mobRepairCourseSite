import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, PlayCircle, FileText, MessageSquare, Download, ChevronLeft, Menu, X } from 'lucide-react';
import { Header } from '../components/Header';
import { apiUrl, resolveAssetUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type CourseLesson = { id: string; title: string; videoUrl: string; completed?: boolean };
type CourseResource = { id: string; name: string; url: string; size?: string };

const comments = [
  { author: 'Alex', time: '2h ago', comment: 'Great explanation on micro-soldering.', avatar: 'A' },
  { author: 'Riya', time: '1h ago', comment: 'Please share more board-level troubleshooting tips.', avatar: 'R' }
];

export function VideoPlayerPage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'notes' | 'comments' | 'downloads'>('notes');
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [courseTitle, setCourseTitle] = useState('Course');
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState('');
  const [lessonDurations, setLessonDurations] = useState<Record<string, number>>({});
  const [maxWatchedByLesson, setMaxWatchedByLesson] = useState<Record<string, number>>({});
  const [progressPercent, setProgressPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastSentProgressRef = useRef<number>(-1);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(apiUrl(`/api/courses/${courseId}`));
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json?.success || !json?.data) {
          throw new Error(json?.message || 'Failed to load course content');
        }

        const course = json.data;
        const resolvedLessons = Array.isArray(course?.videos) ? course.videos.map((video: any, index: number) => ({
          id: String(video?._id || index + 1),
          title: video?.title || `Lesson ${index + 1}`,
          videoUrl: resolveAssetUrl(video?.videoUrl || ''),
          completed: index === 0
        })) : [];
        const resolvedResources = Array.isArray(course?.resourceFiles) ? course.resourceFiles.map((resource: any, index: number) => ({
          id: String(resource?._id || index + 1),
          name: resource?.name || `Resource ${index + 1}`,
          url: resolveAssetUrl(resource?.url || ''),
          size: resource?.size || ''
        })) : [];

        setCourseTitle(course?.title || 'Course');
        setLessons(resolvedLessons);
        setResources(resolvedResources);
        setCurrentLessonId(resolvedLessons[0]?.id || '');
        setLessonDurations({});
        setMaxWatchedByLesson({});
        setProgressPercent(0);
      } catch (error) {
        console.error('Failed to load course player data', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const currentLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === currentLessonId) || lessons[0] || null,
    [currentLessonId, lessons]
  );

  const watchedSeconds = useMemo(
    () => lessons.reduce((sum, lesson) => sum + Number(maxWatchedByLesson[lesson.id] || 0), 0),
    [lessons, maxWatchedByLesson]
  );

  const totalDurationSeconds = useMemo(
    () => lessons.reduce((sum, lesson) => sum + Number(lessonDurations[lesson.id] || 0), 0),
    [lessons, lessonDurations]
  );

  useEffect(() => {
    if (lessons.length === 0) {
      setProgressPercent(0);
      return;
    }

    // Weighted progress by actual watched seconds across course duration.
    const percent = totalDurationSeconds > 0
      ? Math.max(0, Math.min(100, Math.round((watchedSeconds / totalDurationSeconds) * 100)))
      : 0;
    setProgressPercent(percent);
  }, [lessons, watchedSeconds, totalDurationSeconds]);

  useEffect(() => {
    const saveProgress = async () => {
      if (!user?.id || !courseId || progressPercent < 0) return;
      if (progressPercent === lastSentProgressRef.current) return;

      lastSentProgressRef.current = progressPercent;

      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        await fetch(apiUrl(`/api/users/${user.id}/enrollments/${courseId}/progress`), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ progress: progressPercent })
        });
      } catch (error) {
        console.error('Failed to save learning progress', error);
      }
    };

    saveProgress();
  }, [courseId, progressPercent, user?.id]);

  const handleLoadedMetadata = () => {
    if (!currentLessonId || !videoRef.current) return;
    const duration = Number(videoRef.current.duration || 0);
    if (!duration || !Number.isFinite(duration)) return;

    setLessonDurations((prev) => ({
      ...prev,
      [currentLessonId]: Math.max(prev[currentLessonId] || 0, duration)
    }));
  };

  const handleTimeUpdate = () => {
    if (!currentLessonId || !videoRef.current) return;
    const currentTime = Number(videoRef.current.currentTime || 0);

    setMaxWatchedByLesson((prev) => ({
      ...prev,
      [currentLessonId]: Math.max(prev[currentLessonId] || 0, currentTime)
    }));
  };

  const formatDuration = (seconds: number) => {
    const safe = Math.max(0, Math.floor(seconds || 0));
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/90 text-white">
          Loading course player...
        </div>
      )}
      {/* Top Nav */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/student/dashboard" className="text-gray-400 hover:text-white">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-500" />
            <h1 className="text-white">{courseTitle}</h1>
          </div>
        </div>
        <button
          onClick={() => setShowPlaylist(!showPlaylist)}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          {showPlaylist ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Playlist Sidebar */}
        <aside
          className={`${
            showPlaylist ? 'block' : 'hidden'
          } lg:block w-full lg:w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto`}
        >
          <div className="p-4">
            <h2 className="text-white mb-4">Course Content</h2>
            <div className="space-y-2">
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => setCurrentLessonId(lesson.id)}
                  className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 ${
                    lesson.id === currentLessonId
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {lesson.completed ? (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <PlayCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{lesson.title}</p>
                    <p className="text-xs text-gray-400">Video lesson</p>
                  </div>
                </button>
              ))}
              {lessons.length === 0 && <div className="px-3 py-3 text-gray-400 text-sm">No lessons found</div>}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Video Player */}
          <div className="bg-black aspect-video flex items-center justify-center">
            {currentLesson?.videoUrl ? (
              <video
                key={currentLesson.id}
                ref={videoRef}
                className="w-full h-full object-contain"
                controls
                autoPlay
                src={currentLesson.videoUrl}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
              />
            ) : (
              <div className="text-center">
                <PlayCircle className="w-20 h-20 text-white mb-4 mx-auto" />
                <p className="text-white">Select a lesson to play</p>
              </div>
            )}
          </div>

          <div className="px-6 py-3 bg-gray-800 border-b border-gray-700 text-gray-200 text-sm flex items-center justify-between">
            <span>Course Progress</span>
            <span className="font-semibold text-blue-300">{progressPercent}%</span>
          </div>
          <div className="px-6 py-2 bg-gray-800 border-b border-gray-700 text-gray-400 text-xs flex items-center justify-end">
            Watched {formatDuration(watchedSeconds)} / {formatDuration(totalDurationSeconds || 0)}
          </div>

          {/* Tabs and Content */}
          <div className="flex-1 bg-gray-800 overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="border-b border-gray-700 flex px-6">
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-6 py-3 border-b-2 ${
                  activeTab === 'notes'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Notes
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`px-6 py-3 border-b-2 ${
                  activeTab === 'comments'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Comments
              </button>
              <button
                onClick={() => setActiveTab('downloads')}
                className={`px-6 py-3 border-b-2 ${
                  activeTab === 'downloads'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Downloads
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'notes' && (
                <div className="max-w-3xl">
                  <h3 className="text-white text-xl mb-4">Lesson Notes</h3>
                  <div className="bg-gray-700 rounded-lg p-6 text-gray-300">
                    <p className="mb-4">
                      Welcome to the course! In this lesson, we'll introduce you to the fundamentals of web development.
                    </p>
                    <h4 className="text-white mb-2">Key Points:</h4>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Understanding the web development landscape</li>
                      <li>Tools and technologies you'll learn</li>
                      <li>Course structure and learning path</li>
                      <li>How to make the most of this course</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="max-w-3xl">
                  <div className="mb-6">
                    <textarea
                      placeholder="Add a comment..."
                      className="w-full bg-gray-700 text-white rounded-lg p-4 outline-none resize-none"
                      rows={3}
                    ></textarea>
                    <button className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Post Comment
                    </button>
                  </div>
                  <div className="space-y-4">
                    {comments.map((comment, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                            {comment.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="text-white">{comment.author}</p>
                              <span className="text-sm text-gray-400">{comment.time}</span>
                            </div>
                            <p className="text-gray-300">{comment.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'downloads' && (
                <div className="max-w-3xl">
                  <h3 className="text-white text-xl mb-4">Downloadable Resources</h3>
                  <div className="space-y-3">
                    {resources.map((note) => (
                      <div
                        key={note.id}
                        className="bg-gray-700 rounded-lg p-4 flex items-center justify-between hover:bg-gray-600"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-blue-500" />
                          <div>
                            <p className="text-white">{note.name}</p>
                            <p className="text-sm text-gray-400">{note.size}</p>
                          </div>
                        </div>
                        <a href={note.url} download className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      </div>
                    ))}
                    {resources.length === 0 && <div className="text-gray-400 text-sm">No downloadable resources found</div>}
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
