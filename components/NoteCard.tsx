import { Link } from 'react-router-dom';
import { FileText, Star } from 'lucide-react';

interface NoteCardProps {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  pages: number;
  price: number;
}

export function NoteCard({ id, title, instructor, rating, pages, price }: NoteCardProps) {
  return (
    <Link to={`/note/${id}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">{title}</h3>
            <p className="text-sm text-gray-600 mb-2">{instructor}</p>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{rating}</span>
              </div>
              <span className="text-gray-600">{pages} pages</span>
            </div>
          </div>
          <div className="text-lg text-blue-600">${price}</div>
        </div>
      </div>
    </Link>
  );
}
