import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  icon: LucideIcon;
  name: string;
  courses: number;
}

export function CategoryCard({ icon: Icon, name, courses }: CategoryCardProps) {
  return (
    <Link to="/courses" className="group">
      <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="mb-1">{name}</h3>
        <p className="text-sm text-gray-600">{courses} courses</p>
      </div>
    </Link>
  );
}
