import { Link } from 'react-router-dom';
import { Star, FileText } from 'lucide-react';

interface NotesCardProps {
  id: string;
  title: string;
  author: string;
  rating: number;
  pages: number;
  price: number;
}

export function NotesCard({ id, title, author, rating, pages, price }: NotesCardProps) {
  return (
    <Link to={`/note/${id}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
        <div className="aspect-[3/4] bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
          <FileText className="w-20 h-20 text-indigo-300" />
        </div>
        <div className="p-4">
          <h3 className="text-gray-900 mb-2 line-clamp-2">{title}</h3>
          <p className="text-gray-600 text-sm mb-3">{author}</p>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{rating}</span>
            </div>
            <span className="text-gray-600 text-sm">{pages} pages</span>
          </div>
          <div className="text-indigo-600">${price}</div>
        </div>
      </div>
    </Link>
  );
}
