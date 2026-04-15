import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, GraduationCap, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function SignupPage() {
  const [userType, setUserType] = useState<'student' | 'instructor'>('student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register(firstName, lastName, email, password, userType, phone, bio);
      // After creating an account, navigate to login for explicit sign-in
      navigate('/login');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
      console.error('Registration failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05]"></div>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative">
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center group">
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">MobRepair</span>
        </Link>

        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Create Account</h1>
        <p className="text-slate-600 mb-8 text-center text-lg">Join our mobile repair community today</p>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm mb-2">Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('student')}
                className={`py-3 px-4 rounded-xl border-2 transition-all font-semibold flex items-center justify-center gap-2 ${
                  userType === 'student'
                    ? 'border-cyan-600 bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-600'
                    : 'border-slate-300 hover:border-slate-400 text-slate-700'
                }`}
              >
                <Users className="w-5 h-5" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setUserType('instructor')}
                className={`py-3 px-4 rounded-xl border-2 transition-all font-semibold flex items-center justify-center gap-2 ${
                  userType === 'instructor'
                    ? 'border-cyan-600 bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-600'
                    : 'border-slate-300 hover:border-slate-400 text-slate-700'
                }`}
              >
                <GraduationCap className="w-5 h-5" />
                Instructor
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Last Name (optional)</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Phone (optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                placeholder="+1 555 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Bio (optional)</label>
            <textarea
              rows={3}
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105 transition-all font-bold"
          >
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-600 hover:text-cyan-700 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
