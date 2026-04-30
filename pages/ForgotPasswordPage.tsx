import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import { apiUrl } from '../lib/api';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendCode = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Enter the email address on your account.');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(apiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json.message || 'Failed to send verification code');
      }

      setSuccess(json.message || 'Verification code sent. Check your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setIsSending(false);
    }
  };

  const handleResetPassword = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !verificationCode.trim() || !newPassword || !confirmPassword) {
      setError('Fill in your email, verification code, and new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch(apiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: verificationCode.trim(),
          newPassword
        })
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json.message || 'Failed to reset password');
      }

      setSuccess(json.message || 'Password reset successfully. You can log in now.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_38%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_55%,_#eff6ff_100%)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white/90 backdrop-blur rounded-3xl shadow-[0_24px_90px_rgba(15,23,42,0.16)] border border-white p-8 md:p-12">
        <Link to="/login" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Login</span>
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl mb-2">Forgot Password?</h1>
          <p className="text-gray-600">
            Request a verification code, then use it to create a new password.
          </p>
        </div>

        {(error || success) && (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}
          >
            <div className="flex items-start gap-2">
              {error ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
              <p>{error || success}</p>
            </div>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleResetPassword}>
          <div>
            <label className="block mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendCode}
            disabled={isSending}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending code...' : 'Send Verification Code'}
          </button>

          <div className="pt-2 border-t border-gray-100 space-y-5">
            <div>
              <label className="block mb-2">Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-[0.35em] text-center text-lg"
              />
            </div>

            <div>
              <label className="block mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter a new password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm your new password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isResetting}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isResetting ? 'Resetting password...' : 'Reset Password'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Remember your password?</p>
          <Link to="/login" className="text-blue-600 hover:text-blue-700">
            Sign in instead
          </Link>
        </div>

        <div className="mt-8 bg-blue-50 rounded-2xl p-4">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> Check your inbox for the verification code, then paste it here to reset your password.
          </p>
        </div>
      </div>
    </div>
  );
}
