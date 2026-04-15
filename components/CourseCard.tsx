import { Link } from 'react-router-dom';
import { Star, Users } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useUnsplashImage } from '../hooks/useUnsplashImage';
import { resolveAssetUrl } from '../lib/api';

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  students: number;
  price: number;
  image: string;
}

export function CourseCard({ id, title, instructor, rating, students, price, image }: CourseCardProps) {
  const fallbackImage = useUnsplashImage(image || title);
  const imageUrl = /^https?:\/\//i.test(image) || image.startsWith('data:')
    ? image
    : image.startsWith('/uploads') || image.startsWith('uploads/')
      ? resolveAssetUrl(image)
      : fallbackImage;

  return (
    <Link to={`/course/${id}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
        <div className="aspect-video bg-gray-200 overflow-hidden">
          <ImageWithFallback
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{title}</h3>
          <p className="text-sm text-gray-600 mb-3">{instructor}</p>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{rating}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{students.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-xl text-blue-600">${price}</div>
        </div>
      </div>
    </Link>
  );
}
