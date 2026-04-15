import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Download, FileText, Clock, User } from 'lucide-react';
import { Header } from '../components/Header';
import { apiUrl, resolveAssetUrl } from '../lib/api';

type NoteData = {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  pages?: number;
  fileSize?: number;
  instructorName: string;
  createdAt?: string;
};

export function NoteViewerPage() {
  const { noteId } = useParams();
  const [note, setNote] = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNote = async () => {
      if (!noteId || !/^[a-f\d]{24}$/i.test(noteId)) {
        setError('Invalid note ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(apiUrl(`/api/notes/${noteId}`));
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.success || !json?.data) {
          throw new Error(json?.message || 'Failed to load repair guide');
        }

        const n = json.data;
        const instructorName = `${n?.instructorId?.firstName || ''} ${n?.instructorId?.lastName || ''}`.trim() || 'Instructor';

        setNote({
          id: String(n?._id || noteId),
          title: n?.title || 'Repair Guide',
          description: n?.description || '',
          fileUrl: n?.fileUrl || '',
          pages: n?.pages,
          fileSize: n?.fileSize,
          instructorName,
          createdAt: n?.createdAt
        });
      } catch (err: any) {
        setError(err?.message || 'Could not load repair guide');
        console.error('Failed to load note viewer data', err);
      } finally {
        setLoading(false);
      }
    };

    loadNote();
  }, [noteId]);

  const resolvedFileUrl = note ? resolveAssetUrl(note.fileUrl) : '';
  const fileSizeLabel = note?.fileSize ? `${(note.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'N/A';
  const createdDate = note?.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'N/A';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-96">
            <p className="text-gray-600">Loading repair guide...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link
            to="/notes"
            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Guides
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error || 'Repair guide not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const isPdf = resolvedFileUrl?.toLowerCase().endsWith('.pdf');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/notes"
            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Guides
          </Link>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-4xl font-bold text-slate-900 flex-1">{note.title}</h1>
              <a
                href={resolvedFileUrl}
                download
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 flex items-center gap-2 font-bold transition-all flex-shrink-0 ml-4"
              >
                <Download className="w-5 h-5" />
                Download
              </a>
            </div>

            <p className="text-slate-600 text-lg mb-6">{note.description}</p>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Size</p>
                  <p className="text-slate-900 font-semibold">{fileSizeLabel}</p>
                </div>
              </div>

              {note.pages && (
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Pages</p>
                    <p className="text-slate-900 font-semibold">{note.pages}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Author</p>
                  <p className="text-slate-900 font-semibold">{note.instructorName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Created</p>
                  <p className="text-slate-900 font-semibold">{createdDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* File Viewer */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          {isPdf ? (
            // PDF Viewer
            <div className="bg-gray-100 p-8">
              <iframe
                src={`${resolvedFileUrl}#toolbar=1&embedded=true`}
                className="w-full h-screen rounded-lg border border-slate-200"
                title="Repair Guide"
                style={{ minHeight: '600px' }}
              />
            </div>
          ) : (
            // Generic File Viewer
            <div className="bg-gradient-to-br from-slate-50 to-cyan-50 p-12 flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6 border-2 border-cyan-100">
                  <FileText className="w-16 h-16 text-cyan-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Repair Guide Ready</h3>
                <p className="text-slate-600 mb-6 text-lg">
                  Your repair guide file is ready to download
                </p>
                <a
                  href={resolvedFileUrl}
                  download
                  className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 font-bold transition-all"
                >
                  <Download className="w-5 h-5 inline-block mr-2" />
                  Download File
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            How to Use This Repair Guide
          </h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">1.</span>
              <span>Review all sections of the guide carefully</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">2.</span>
              <span>Follow safety guidelines and precautions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">3.</span>
              <span>Download for offline access anytime</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">4.</span>
              <span>Refer back to specific sections as needed</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
