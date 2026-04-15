import { Link } from 'react-router-dom';
import { BookOpen, Mail, ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <Link to="/login" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Login</span>
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl mb-2">Forgot Password?</h1>
          <p className="text-gray-600">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="your.email@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Send Reset Link
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Remember your password?</p>
          <Link to="/login" className="text-blue-600 hover:text-blue-700">
            Sign in instead
          </Link>
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> If you don't receive an email within a few minutes, please check your spam folder.
          </p>
        </div>
      </div>
    </div>
  );
}
