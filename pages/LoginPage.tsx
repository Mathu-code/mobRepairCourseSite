import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Smartphone, GraduationCap, Users } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [loginType, setLoginType] = useState<'student' | 'instructor'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(email, password);

      if (loggedInUser?.role === 'student' && loginType === 'instructor') {
        throw new Error('This account is a student account. Please choose Student to sign in.');
      }

      if (loggedInUser?.role === 'instructor' && loginType === 'student') {
        throw new Error('This account is an instructor account. Please choose Instructor to sign in.');
      }

      if (loggedInUser?.role === 'instructor' || loggedInUser?.role === 'admin') {
        navigate('/instructor/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05]"></div>
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden relative">
        <div className="grid md:grid-cols-2">
          {/* Left - Form */}
          <div className="p-8 md:p-12">
            <Link to="/" className="flex items-center gap-2 mb-8 group">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">MobRepair</span>
            </Link>

            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Welcome Back</h1>
            <p className="text-slate-600 mb-6 text-lg">Sign in to continue your repair training journey</p>

            {/* Login Type Selection */}
            <div className="mb-8">
              <label className="block text-sm font-bold mb-3 text-slate-700">Login as</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLoginType('student')}
                  className={`py-4 px-4 rounded-xl border-2 transition-all font-semibold flex items-center justify-center gap-2 ${
                    loginType === 'student'
                      ? 'border-cyan-600 bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-600 shadow-lg'
                      : 'border-slate-300 hover:border-slate-400 text-slate-700'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType('instructor')}
                  className={`py-4 px-4 rounded-xl border-2 transition-all font-semibold flex items-center justify-center gap-2 ${
                    loginType === 'instructor'
                      ? 'border-cyan-600 bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-600 shadow-lg'
                      : 'border-slate-300 hover:border-slate-400 text-slate-700'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                  Instructor
                </button>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Choose the account type that matches your login details.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm mb-2">Email</label>
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-cyan-600 rounded" />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105 transition-all font-bold disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {loginType === 'student' && (
              <p className="text-center mt-8 text-slate-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-cyan-600 hover:text-cyan-700 font-semibold">
                  Create account
                </Link>
              </p>
            )}
          </div>

          {/* Right - Illustration */}
          <div className="hidden md:flex bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 p-12 items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.05]"></div>
            <div className="text-white text-center relative z-10">
              <div className="mb-6">
                <Smartphone className="w-32 h-32 mx-auto opacity-90" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Continue Your Repair Training</h2>
              <p className="text-cyan-100 text-lg leading-relaxed">
                Access your repair courses, track progress, and master advanced techniques with certified instructors
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
