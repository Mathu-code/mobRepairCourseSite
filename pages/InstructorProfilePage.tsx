import { Link, useParams } from 'react-router-dom';
import { BookOpen, Star, Users, Award, Globe, Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';
import { CourseCard } from '../components/CourseCard';
import { NoteCard } from '../components/NoteCard';
import { Footer } from '../components/Footer';

const instructorData = {
  name: 'Sarah Johnson',
  avatar: 'SJ',
  title: 'Senior Software Engineer & Educator',
  bio: 'Passionate educator with 10+ years of experience in software development and teaching. I\'ve helped over 50,000 students learn web development, programming, and software engineering. My mission is to make complex topics simple and accessible to everyone.',
  stats: {
    students: 52340,
    courses: 12,
    rating: 4.8,
    reviews: 8450
  },
  social: {
    website: 'www.sarahjohnson.dev',
    linkedin: 'linkedin.com/in/sarahjohnson',
    twitter: '@sarahjohnson_dev',
    youtube: 'SarahJohnsonDev'
  },
  expertise: ['Web Development', 'JavaScript', 'React', 'Node.js', 'Software Architecture']
};

const courses = [
  { id: '1', title: 'Complete Web Development Bootcamp', instructor: 'Sarah Johnson', rating: 4.8, students: 12450, price: 49.99, image: 'web development' },
  { id: '2', title: 'Advanced JavaScript Masterclass', instructor: 'Sarah Johnson', rating: 4.9, students: 8930, price: 59.99, image: 'javascript programming' },
  { id: '3', title: 'React for Beginners', instructor: 'Sarah Johnson', rating: 4.7, students: 6750, price: 39.99, image: 'react framework' },
];

const notes = [
  { id: '1', title: 'Complete JavaScript ES6+ Notes', instructor: 'Sarah Johnson', rating: 4.6, pages: 145, price: 14.99 },
  { id: '2', title: 'React Hooks Reference Guide', instructor: 'Sarah Johnson', rating: 4.8, pages: 120, price: 16.99 },
];

export function InstructorProfilePage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span className="text-xl">LearnHub</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/courses" className="text-gray-700 hover:text-gray-900">Browse Courses</Link>
              <Link to="/login" className="px-4 py-2 text-gray-700 hover:text-gray-900">Login</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Instructor Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-blue-600 text-4xl flex-shrink-0">
              {instructorData.avatar}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl mb-2">{instructorData.name}</h1>
              <p className="text-xl text-blue-100 mb-6">{instructorData.title}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{instructorData.stats.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{instructorData.stats.courses} courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span>{instructorData.stats.rating} rating ({instructorData.stats.reviews.toLocaleString()} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* About */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl mb-6">About Me</h2>
              <p className="text-gray-700 leading-relaxed mb-6">{instructorData.bio}</p>
              
              <h3 className="text-xl mb-4">Areas of Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {instructorData.expertise.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Courses */}
            <div>
              <h2 className="text-2xl mb-6">Courses by {instructorData.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} {...course} />
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <h2 className="text-2xl mb-6">Study Notes by {instructorData.name}</h2>
              <div className="space-y-4">
                {notes.map((note) => (
                  <NoteCard key={note.id} {...note} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 space-y-6">
              {/* Social Links */}
              <div>
                <h3 className="mb-4">Connect with Me</h3>
                <div className="space-y-3">
                  <a
                    href="#"
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <Globe className="w-5 h-5 text-gray-600" />
                    <span className="text-sm">{instructorData.social.website}</span>
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <Linkedin className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">{instructorData.social.linkedin}</span>
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <Twitter className="w-5 h-5 text-blue-400" />
                    <span className="text-sm">{instructorData.social.twitter}</span>
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <Youtube className="w-5 h-5 text-red-600" />
                    <span className="text-sm">{instructorData.social.youtube}</span>
                  </a>
                </div>
              </div>

              {/* Achievements */}
              <div className="border-t pt-6">
                <h3 className="mb-4">Achievements</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm">Top Instructor</p>
                      <p className="text-xs text-gray-600">2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Star className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm">50K+ Students</p>
                      <p className="text-xs text-gray-600">Milestone</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm">Best Seller</p>
                      <p className="text-xs text-gray-600">3 Courses</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
