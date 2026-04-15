import { Quote } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  avatar: string;
}

export function TestimonialCard({ name, role, content, avatar }: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <Quote className="w-10 h-10 text-blue-200 mb-4" />
      <p className="text-gray-700 mb-6">{content}</p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
          {avatar}
        </div>
        <div>
          <p>{name}</p>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
    </div>
  );
}
