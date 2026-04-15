import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, FileText } from 'lucide-react';
import { Header } from '../components/Header';
import { apiUrl, resolveAssetUrl } from '../lib/api';

export function UploadNotesPage() {
  const navigate = useNavigate();
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deviceType, setDeviceType] = useState('Select device type');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [language, setLanguage] = useState('English');
  const [price, setPrice] = useState('0');
  const [allowPreview, setAllowPreview] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [publishError, setPublishError] = useState('');
  const [publishing, setPublishing] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const uploadPdf = async (file?: File) => {
    if (!file) return;

    setUploadError('');
    setPublishError('');
    setPdfFile(file);

    if (file.type !== 'application/pdf') {
      setUploadError('Please choose a PDF file.');
      setPdfUrl('');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadError('PDF must be 50MB or smaller.');
      setPdfUrl('');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setUploadError('Please login again before uploading files.');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      setUploading(true);
      const response = await fetch(apiUrl('/api/upload/pdf'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json?.success) {
        throw new Error(json?.message || 'PDF upload failed');
      }

      setPdfUrl(resolveAssetUrl(json?.data?.url || ''));
    } catch (error: any) {
      setUploadError(error?.message || 'PDF upload failed');
      setPdfUrl('');
    } finally {
      setUploading(false);
    }
  };

  const createGuide = async (status: 'draft' | 'published') => {
    if (!title.trim() || !description.trim()) {
      setPublishError('Guide title and description are required.');
      return;
    }

    if (!pdfUrl) {
      setPublishError('Upload a PDF before saving or publishing.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setPublishError('Please login again before publishing.');
      return;
    }

    setPublishError('');

    try {
      setPublishing(true);
      const response = await fetch(apiUrl('/api/notes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          description: `${description.trim()}\n\nDevice Type: ${deviceType}\nDifficulty: ${difficulty}\nLanguage: ${language}`,
          fileUrl: pdfUrl,
          price: Number(price || 0),
          pages: allowPreview ? 3 : undefined,
          fileSize: pdfFile?.size,
          status
        })
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to save guide');
      }

      navigate('/instructor/dashboard');
    } catch (error: any) {
      setPublishError(error?.message || 'Failed to save guide');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Upload Repair Guides</h1>
        <p className="text-slate-600 mb-8 text-lg">Share your repair guides and help technicians learn better</p>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          {publishError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {publishError}
            </div>
          )}

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block mb-2 font-medium text-slate-700">Guide Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Complete iPhone Screen Replacement Guide"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-slate-700">Description</label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what your repair guide covers and who it's for"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none transition-all"
              ></textarea>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-medium text-slate-700">Device Type</label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                >
                  <option>Select device type</option>
                  <option>iPhone</option>
                  <option>Samsung Galaxy</option>
                  <option>iPad</option>
                  <option>Android Tablets</option>
                  <option>Laptops</option>
                  <option>Other Devices</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium text-slate-700">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Professional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium text-slate-700">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
                <option>Chinese</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium text-slate-700">Upload PDF</label>
              <div className="border-2 border-dashed border-cyan-300 rounded-xl p-8 text-center bg-gradient-to-br from-cyan-50 to-blue-50">
                <FileText className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
                <p className="text-slate-700 font-medium mb-2">Upload your repair guide in PDF format</p>
                <p className="text-sm text-slate-500 mb-4">Maximum file size: 50MB</p>
                {pdfFile && (
                  <div className="mb-4 rounded-xl border border-cyan-200 bg-white px-4 py-3 text-left text-sm text-slate-700">
                    <div className="font-semibold">{pdfFile.name}</div>
                    <div className="text-slate-500">{formatSize(pdfFile.size)}</div>
                    {uploading && <div className="mt-1 text-cyan-600">Uploading...</div>}
                    {pdfUrl && !uploading && <div className="mt-1 text-emerald-600">Upload complete</div>}
                  </div>
                )}
                {uploadError && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-left">
                    {uploadError}
                  </div>
                )}
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => uploadPdf(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-bold"
                >
                  Choose PDF File
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium text-slate-700">Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-semibold">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="24.99"
                  className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
              </div>
              <p className="text-sm text-slate-500 mt-2">Platform takes 20% commission</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border-2 border-cyan-200">
              <h3 className="font-bold text-slate-900 mb-3">Preview Information</h3>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={allowPreview}
                  onChange={(e) => setAllowPreview(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded"
                />
                <label className="text-sm font-medium text-slate-700">Allow first 3 pages as preview</label>
              </div>
              <p className="text-sm text-slate-600">
                Letting students preview your guides can increase purchases
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
              <h3 className="font-bold text-slate-900 mb-3">Guidelines</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Ensure your repair guides are original or you have rights to share them</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Content must be clear, well-organized, and easy to follow</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>No plagiarized or copyrighted material</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Include step-by-step instructions with diagrams for complex repairs</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4 pt-6 border-t-2 border-slate-200">
              <Link
                to="/instructor/dashboard"
                className="flex-1 py-3 border-2 border-slate-300 rounded-xl hover:bg-slate-50 text-center font-semibold text-slate-700 transition-all"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={() => createGuide('draft')}
                disabled={publishing}
                className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 font-semibold transition-all disabled:opacity-70"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                onClick={() => createGuide('published')}
                disabled={publishing || uploading}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105 transition-all font-bold disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {publishing ? 'Saving...' : 'Publish Guide'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
