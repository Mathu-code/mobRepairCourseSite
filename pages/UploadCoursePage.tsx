import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, Plus, X, ChevronRight } from 'lucide-react';
import { Header } from '../components/Header';
import { apiUrl, resolveAssetUrl } from '../lib/api';

const steps = ['Basic Info', 'Content', 'Pricing', 'Review'];

type LessonItem = {
  title: string;
  video: string;
  videoName?: string;
  uploading?: boolean;
  error?: string;
};

type ResourceItem = {
  name: string;
  size: string;
  url?: string;
  status?: 'uploading' | 'uploaded' | 'error';
  error?: string;
};

type CategoryItem = {
  _id: string;
  name: string;
};

const fallbackCategories: CategoryItem[] = [
  { _id: 'fallback-screen-repair', name: 'Screen Repair' },
  { _id: 'fallback-battery-replacement', name: 'Battery Replacement' },
  { _id: 'fallback-motherboard-repair', name: 'Motherboard Repair' },
  { _id: 'fallback-microsoldering', name: 'Microsoldering' },
  { _id: 'fallback-water-damage', name: 'Water Damage' },
  { _id: 'fallback-hardware-components', name: 'Hardware Components' }
];

export function UploadCoursePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const isEditMode = !!courseId;
  const [currentStep, setCurrentStep] = useState(0);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSubtitle, setCourseSubtitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCategoryId, setCourseCategoryId] = useState('');
  const [loadedCategoryName, setLoadedCategoryName] = useState('');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [coursePrice, setCoursePrice] = useState('0');
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [files, setFiles] = useState<ResourceItem[]>([]);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const lessonInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const resourcesInputRef = useRef<HTMLInputElement | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState('');
  const [resourceUploadError, setResourceUploadError] = useState('');
  const [publishError, setPublishError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(false);

  const normalizeId = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return String(value);
    if (typeof value === 'object') {
      if (value._id) return normalizeId(value._id);
      if (value.id) return normalizeId(value.id);
      if (value.$oid) return String(value.$oid);
    }
    return String(value).trim();
  };

  const isMongoObjectId = (value: string) => /^[a-fA-F0-9]{24}$/.test((value || '').trim());

  useEffect(() => {
    const loadCategories = async () => {
      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      try {
        const response = await fetch(apiUrl('/api/admin/categories'), { headers });
        const json = await response.json().catch(() => ({}));
        if (!response.ok || !json?.success) {
          throw new Error(json?.message || 'Failed to load categories');
        }

        const rows = (json?.data || []).map((item: any) => ({
          _id: String(item?._id || ''),
          name: item?.name || 'Unnamed category'
        }));
        setCategories((prev) => {
          const merged = [...rows.filter((item: CategoryItem) => item._id), ...prev];
          const unique = new Map<string, CategoryItem>();
          merged.forEach((item) => {
            if (item?._id) {
              unique.set(item._id, item);
            }
          });
          const mergedValues = Array.from(unique.values());
          return mergedValues.length > 0 ? mergedValues : fallbackCategories;
        });
      } catch (error) {
        console.error('Failed loading categories', error);
        setCategories((prev) => (prev.length > 0 ? prev : fallbackCategories));
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (!courseId) return;

    if (!/^[a-fA-F0-9]{24}$/.test(courseId)) {
      setPublishError('Invalid course id for edit. Please open edit from a valid course row.');
      return;
    }

    const loadCourse = async () => {
      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      try {
        setLoadingCourse(true);
        const response = await fetch(apiUrl(`/api/courses/${courseId}`), { headers });
        const json = await response.json().catch(() => ({}));
        if (!response.ok || !json?.success) {
          throw new Error(json?.message || 'Failed to load course details');
        }

        const data = json.data;
        setCourseTitle(data?.title || '');
        setCourseSubtitle(data?.shortDescription || '');
        setCourseDescription(data?.description || '');
        const selectedCategoryId = normalizeId(data?.categoryId);
        const selectedCategoryName = data?.categoryId?.name || '';
        setCourseCategoryId(selectedCategoryId);
        setLoadedCategoryName(selectedCategoryName);
        if (selectedCategoryId) {
          setCategories((prev) => {
            if (prev.some((item) => item._id === selectedCategoryId)) {
              return prev;
            }
            return [{ _id: selectedCategoryId, name: selectedCategoryName || 'Current category' }, ...prev];
          });
        }
        setSkillLevel((data?.level as 'beginner' | 'intermediate' | 'advanced') || 'beginner');
        setCoursePrice(String(Number(data?.price ?? 0)));

        const mapLessonItems = (items: any[]) => (items || [])
          .map((lesson: any) => {
            const rawVideoUrl = lesson?.videoUrl || lesson?.video || lesson?.url || '';
            const videoUrl = resolveAssetUrl(rawVideoUrl);
            const fileNameFromUrl = (videoUrl.split('/').pop() || '').trim();
            return {
              title: (lesson?.title || '').trim(),
              video: videoUrl,
              videoName: lesson?.videoName || fileNameFromUrl,
              uploading: false,
              error: ''
            };
          })
          .filter((lesson: LessonItem) => !!lesson.video || !!lesson.title);

        const embeddedLessons = mapLessonItems(
          Array.isArray(data?.lessonVideos) ? data.lessonVideos : (Array.isArray(data?.lessons) ? data.lessons : [])
        );
        const linkedVideoLessons = mapLessonItems(Array.isArray(data?.videos) ? data.videos : []);

        const countCompleteLessons = (items: LessonItem[]) => items.filter((lesson) => lesson.title && lesson.video).length;
        const persistedLessons = countCompleteLessons(linkedVideoLessons) > countCompleteLessons(embeddedLessons)
          ? linkedVideoLessons
          : embeddedLessons;

        setLessons(persistedLessons);

        const resourceCandidates = Array.isArray(data?.resourceFiles) && data.resourceFiles.length > 0
          ? data.resourceFiles
          : (Array.isArray(data?.files) && data.files.length > 0
              ? data.files
              : (Array.isArray(data?.resources) ? data.resources : []));

        const persistedResources = resourceCandidates
          .map((resource: any) => {
            const resourceUrl = resolveAssetUrl(resource?.url || resource?.fileUrl || resource?.path || '');
            const fallbackName = (resourceUrl.split('/').pop() || '').trim() || 'Resource file';
            return {
              name: resource?.name || resource?.fileName || fallbackName,
              size: resource?.size || '-',
              url: resourceUrl,
              status: 'uploaded' as const,
              error: ''
            };
          })
          .filter((resource: ResourceItem) => !!resource.url || !!resource.name);
        setFiles(persistedResources);

        const resolvedThumbnail = resolveAssetUrl(data?.thumbnail || '');
        if (resolvedThumbnail) {
          setThumbnailUrl(resolvedThumbnail);
          setThumbnailPreview(resolvedThumbnail);
        }
      } catch (error: any) {
        setPublishError(error?.message || 'Failed to load course details');
      } finally {
        setLoadingCourse(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const addLesson = () => {
    setLessons([...lessons, { title: '', video: '' }]);
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const onPickThumbnail = async (file?: File) => {
    if (!file) return;

    setThumbnailError('');
    setThumbnailFile(file);

    const objectUrl = URL.createObjectURL(file);
    setThumbnailPreview(objectUrl);

    const token = localStorage.getItem('token');
    if (!token) {
      setThumbnailError('Please login again before uploading files.');
      return;
    }

    const formData = new FormData();
    formData.append('thumbnail', file);

    try {
      setThumbnailUploading(true);
      const response = await fetch(apiUrl('/api/upload/thumbnail'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json?.success) {
        throw new Error(json?.message || 'Thumbnail upload failed');
      }

      setThumbnailUrl(resolveAssetUrl(json?.data?.url || ''));
    } catch (error: any) {
      setThumbnailError(error?.message || 'Thumbnail upload failed');
      setThumbnailUrl('');
    } finally {
      setThumbnailUploading(false);
    }
  };

  const onPickLessonVideo = async (index: number, file?: File) => {
    if (!file) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setLessons((prev) => prev.map((lesson, i) => i === index ? { ...lesson, error: 'Please login again before uploading files.' } : lesson));
      return;
    }

    setLessons((prev) => prev.map((lesson, i) => i === index ? { ...lesson, error: '', uploading: true, videoName: file.name } : lesson));

    const formData = new FormData();
    formData.append('video', file);

    try {
      const response = await fetch(apiUrl('/api/upload/video'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json?.success) {
        throw new Error(json?.message || 'Video upload failed');
      }

      const uploadedUrl = resolveAssetUrl(json?.data?.url || '');
      setLessons((prev) => prev.map((lesson, i) => i === index ? {
        ...lesson,
        video: uploadedUrl,
        videoName: file.name,
        uploading: false,
        error: ''
      } : lesson));
    } catch (error: any) {
      setLessons((prev) => prev.map((lesson, i) => i === index ? {
        ...lesson,
        video: '',
        uploading: false,
        error: error?.message || 'Video upload failed'
      } : lesson));
    }
  };

  const onPickResources = async (pickedFiles?: FileList | null) => {
    if (!pickedFiles || pickedFiles.length === 0) return;

    setResourceUploadError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setResourceUploadError('Please login again before uploading files.');
      return;
    }

    const selected = Array.from(pickedFiles);
    const baseIndex = files.length;

    setFiles((prev) => [
      ...prev,
      ...selected.map((file) => ({
        name: file.name,
        size: formatFileSize(file.size),
        status: 'uploading' as const
      }))
    ]);

    for (let i = 0; i < selected.length; i += 1) {
      const file = selected[i];
      const currentIndex = baseIndex + i;

      try {
        const formData = new FormData();
        formData.append('note', file);

        const response = await fetch(apiUrl('/api/upload/note'), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        const json = await response.json().catch(() => ({}));
        if (!response.ok || !json?.success) {
          throw new Error(json?.message || `Failed to upload ${file.name}`);
        }

        const uploadedUrl = resolveAssetUrl(json?.data?.url || '');
        setFiles((prev) => prev.map((entry, idx) => idx === currentIndex
          ? { ...entry, url: uploadedUrl, status: 'uploaded', error: '' }
          : entry));
      } catch (error: any) {
        setFiles((prev) => prev.map((entry, idx) => idx === currentIndex
          ? { ...entry, status: 'error', error: error?.message || 'Upload failed' }
          : entry));
      }
    }
  };

  const onPublishCourse = async (status: 'draft' | 'published' = 'published') => {
    if (!courseTitle.trim() || !courseDescription.trim()) {
      setPublishError('Course title and description are required.');
      return;
    }

    const normalizedCategoryId = normalizeId(courseCategoryId);
    const validCategoryId = isMongoObjectId(normalizedCategoryId) ? normalizedCategoryId : '';

    const normalizedLessons = lessons.map((lesson) => ({
      title: (lesson.title || '').trim(),
      videoUrl: (lesson.video || '').trim(),
      videoName: (lesson.videoName || '').trim()
    }));
    const effectiveLessons = normalizedLessons.filter((lesson) => lesson.title || lesson.videoUrl);

    if (isEditMode) {
      if (!courseSubtitle.trim()) {
        setPublishError('Subtitle is required while editing a course.');
        return;
      }
      if (!thumbnailUrl) {
        setPublishError('Course thumbnail is required while editing a course.');
        return;
      }
      if (Number(coursePrice || 0) <= 0) {
        setPublishError('Course price must be greater than 0 while editing a course.');
        return;
      }

      const hasInvalidLesson = effectiveLessons.length === 0 || effectiveLessons.some((lesson) => !lesson.title || !lesson.videoUrl);
      if (hasInvalidLesson) {
        setPublishError('Each lesson must have a title and uploaded video while editing a course.');
        return;
      }

      const hasValidResources = files.length > 0 && files.every((file) => (file.url || '').trim());
      if (!hasValidResources) {
        setPublishError('At least one uploaded resource file is required while editing a course.');
        return;
      }
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setPublishError('Please login again before publishing.');
      return;
    }

    setPublishError('');

    try {
      setPublishing(true);

      const response = await fetch(apiUrl(isEditMode ? `/api/courses/${courseId}` : '/api/courses'), {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: courseTitle.trim(),
          description: courseDescription.trim(),
          shortDescription: courseSubtitle.trim() || undefined,
          thumbnail: thumbnailUrl || undefined,
          categoryId: isEditMode ? undefined : (validCategoryId || undefined),
          level: skillLevel,
          price: Number(coursePrice || 0),
          status,
          lessonVideos: effectiveLessons,
          resourceFiles: files
            .filter((file) => (file.url || '').trim())
            .map((file) => ({
              name: file.name,
              size: file.size,
              url: file.url
            }))
        })
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to publish course');
      }

      navigate('/instructor/dashboard');
    } catch (error: any) {
      setPublishError(error?.message || `Failed to ${isEditMode ? 'update' : 'publish'} course`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <Link to="/instructor/dashboard" className="text-cyan-600 hover:text-cyan-700 font-semibold mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">{isEditMode ? 'Edit Repair Course' : 'Create Repair Course'}</h1>
          <p className="text-slate-600 text-lg">{isEditMode ? 'Update your course details and content' : 'Share your mobile repair expertise with aspiring technicians'}</p>
        </div>

        {loadingCourse && (
          <div className="mb-6 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-cyan-700">
            Loading course details...
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-lg transition-all ${
                      index <= currentStep
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white scale-110'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className={`text-sm mt-2 font-semibold ${index <= currentStep ? 'text-slate-900' : 'text-slate-500'}`}>{step}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1.5 mx-4 rounded-full ${
                      index < currentStep ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-slate-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-bold text-slate-900">Course Title</label>
                <input
                  type="text"
                  placeholder="e.g., Complete iPhone 15 Repair Mastery"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
              </div>

              <div>
                <label className="block mb-2 font-bold text-slate-900">Subtitle</label>
                <input
                  type="text"
                  placeholder="Learn advanced repair techniques from certified technicians"
                  value={courseSubtitle}
                  onChange={(e) => setCourseSubtitle(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
              </div>

              <div>
                <label className="block mb-2 font-bold text-slate-900">Description</label>
                <textarea
                  rows={6}
                  placeholder="Detailed description of repair techniques, tools needed, and skills students will master"
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none transition-all"
                ></textarea>
              </div>

              {!isEditMode && (
                <div>
                  <label className="block mb-2 font-bold text-slate-900">Repair Category</label>
                  <select
                    value={courseCategoryId}
                    onChange={(e) => setCourseCategoryId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  >
                    <option value="">Select a category</option>
                    {courseCategoryId && !categories.some((category) => category._id === courseCategoryId) && (
                      <option value={courseCategoryId}>{loadedCategoryName || 'Current category (saved)'}</option>
                    )}
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block mb-2 font-bold text-slate-900">Skill Level</label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block mb-2">Course Thumbnail</label>
                <div className="border-2 border-dashed border-cyan-300 rounded-xl p-8 text-center bg-cyan-50/30 hover:border-cyan-500 transition-all">
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview}
                      alt="Course thumbnail preview"
                      className="w-full max-w-sm mx-auto rounded-lg border border-cyan-200 mb-4"
                    />
                  ) : (
                    <Upload className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
                  )}
                  <p className="text-slate-700 font-semibold mb-2">Upload course thumbnail</p>
                  <p className="text-sm text-slate-500">PNG, JPG, WEBP up to 10MB (1280x720 recommended)</p>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => onPickThumbnail(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 font-bold transition-all"
                  >
                    Choose File
                  </button>
                  {thumbnailUploading && <p className="text-sm text-cyan-700 mt-3">Uploading thumbnail...</p>}
                  {thumbnailFile && !thumbnailUploading && !thumbnailError && (
                    <p className="text-sm text-emerald-700 mt-3">Selected: {thumbnailFile.name}</p>
                  )}
                  {thumbnailUrl && !thumbnailUploading && !thumbnailError && (
                    <p className="text-xs text-slate-500 mt-1 break-all">Saved: {thumbnailUrl}</p>
                  )}
                  {thumbnailError && <p className="text-sm text-red-600 mt-3">{thumbnailError}</p>}
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Course Content</h3>
                <p className="text-slate-600 mb-6">Add video lessons demonstrating repair techniques</p>
                
                <div className="space-y-4 mb-6">
                  {lessons.map((lesson, index) => (
                    <div key={index} className="border-2 border-slate-200 rounded-xl p-4 hover:border-cyan-300 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-4">
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => {
                              const value = e.target.value;
                              setLessons((prev) => prev.map((item, i) => i === index ? { ...item, title: value } : item));
                            }}
                            placeholder="e.g., Screen Removal Technique"
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-semibold"
                          />
                          <div className="border-2 border-dashed border-cyan-300 rounded-xl p-6 text-center bg-cyan-50/30 hover:border-cyan-500 transition-all">
                            <Upload className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                            <p className="text-sm text-slate-700 font-semibold">Upload video</p>
                            <input
                              ref={(element) => { lessonInputRefs.current[index] = element; }}
                              type="file"
                              accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
                              className="hidden"
                              onChange={(e) => onPickLessonVideo(index, e.target.files?.[0])}
                            />
                            <button
                              type="button"
                              onClick={() => lessonInputRefs.current[index]?.click()}
                              className="mt-2 px-4 py-2 text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-md font-bold"
                            >
                              Choose File
                            </button>
                            {lesson.uploading && <p className="text-xs text-cyan-700 mt-2">Uploading video...</p>}
                            {lesson.videoName && !lesson.uploading && !lesson.error && (
                              <p className="text-xs text-emerald-700 mt-2">Selected: {lesson.videoName}</p>
                            )}
                            {lesson.video && !lesson.uploading && !lesson.error && (
                              <p className="text-xs text-slate-500 mt-1 break-all">Saved: {lesson.video}</p>
                            )}
                            {lesson.error && <p className="text-xs text-red-600 mt-2">{lesson.error}</p>}
                          </div>
                        </div>
                        <button
                          onClick={() => removeLesson(index)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addLesson}
                  className="w-full py-4 border-2 border-dashed border-cyan-300 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 flex items-center justify-center gap-2 text-cyan-600 hover:text-cyan-700 font-bold transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Lesson
                </button>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Repair Guides & Resources</h3>
                <p className="text-slate-600 mb-6">Add downloadable repair diagrams, schematics, and documentation</p>
                
                <div className="border-2 border-dashed border-cyan-300 rounded-xl p-8 text-center bg-cyan-50/30 hover:border-cyan-500 transition-all">
                  <Upload className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
                  <p className="text-slate-700 font-semibold mb-2">Upload repair materials</p>
                  <p className="text-sm text-slate-500">PDF, DOC, ZIP up to 50MB</p>
                  <input
                    ref={resourcesInputRef}
                    type="file"
                    multiple
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip,application/x-zip-compressed,.zip"
                    className="hidden"
                    onChange={(e) => onPickResources(e.target.files)}
                  />
                  <button
                    type="button"
                    onClick={() => resourcesInputRef.current?.click()}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 font-bold transition-all"
                  >
                    Choose Files
                  </button>
                  {resourceUploadError && <p className="text-sm text-red-600 mt-3">{resourceUploadError}</p>}
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-slate-700">{file.name}</p>
                          {file.url && <p className="text-xs text-slate-500 break-all">{file.url}</p>}
                          {file.error && <p className="text-xs text-red-600">{file.error}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{file.size}</p>
                          <p className={`text-xs font-semibold ${file.status === 'uploaded' ? 'text-emerald-700' : file.status === 'error' ? 'text-red-600' : 'text-cyan-700'}`}>
                            {file.status === 'uploaded' ? 'Uploaded' : file.status === 'error' ? 'Failed' : 'Uploading...'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-bold text-slate-900">Course Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold">$</span>
                  <input
                    type="number"
                    placeholder="89.99"
                    min="0"
                    step="0.01"
                    value={coursePrice}
                    onChange={(e) => setCoursePrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-lg font-bold transition-all"
                  />
                </div>
                <p className="text-sm text-slate-500 mt-2">Platform takes 20% commission</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border-2 border-cyan-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Pricing Recommendations</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                    <span className="text-slate-700">Beginner courses: $29.99 - $59.99</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                    <span className="text-slate-700">Intermediate courses: $59.99 - $99.99</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                    <span className="text-slate-700">Advanced/Microsoldering: $99.99 - $249.99</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-3">Review Your Course</h3>
                <p className="text-slate-600 text-lg">Make sure everything looks good before publishing</p>
              </div>

              <div className="border-2 border-slate-200 rounded-2xl p-6 space-y-4 bg-gradient-to-br from-slate-50 to-blue-50">
                <div>
                  <p className="text-sm text-slate-600 mb-1 font-semibold">Title</p>
                  <p className="text-lg font-bold text-slate-900">{courseTitle || '-'}</p>
                </div>
                {!isEditMode && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1 font-semibold">Category</p>
                    <p className="text-slate-800">{categories.find((category) => category._id === courseCategoryId)?.name || loadedCategoryName || '-'}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-600 mb-1 font-semibold">Price</p>
                  <p className="text-lg font-bold text-green-600">${Number(coursePrice || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1 font-semibold">Lessons</p>
                  <p className="text-slate-800">{lessons.length} lessons</p>
                </div>
              </div>
              {publishError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  {publishError}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-slate-200">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-8 py-3 border-2 border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all"
            >
              Previous
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={() => onPublishCourse('draft')}
                className="px-8 py-3 border-2 border-slate-300 rounded-xl hover:bg-slate-50 font-bold transition-all"
              >
                Save as Draft
              </button>
              
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 font-bold transition-all"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={() => onPublishCourse('published')}
                  disabled={publishing}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/30 font-bold transition-all"
                >
                  {publishing ? (isEditMode ? 'Updating...' : 'Publishing...') : (isEditMode ? 'Update Course' : 'Publish Course')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
