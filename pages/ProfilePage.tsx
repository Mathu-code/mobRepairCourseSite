import { Link } from 'react-router-dom';
import { User, Lock, CreditCard, Download } from 'lucide-react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';

const paymentHistory = [
  { id: '1', item: 'Complete iPhone Repair Mastery Course', amount: 89.99, date: 'Nov 20, 2025', status: 'Completed' },
  { id: '2', item: 'iPhone Repair Guide - All Models', amount: 24.99, date: 'Nov 15, 2025', status: 'Completed' },
  { id: '3', item: 'Screen Replacement Toolkit Guide', amount: 19.99, date: 'Nov 10, 2025', status: 'Completed' },
];

export function ProfilePage() {
  const { user } = useAuth();

  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || user?.name || 'User';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0) || (user?.email?.charAt(0) || '')}`.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Profile Settings</h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
                {initials}
              </div>
              <h3 className="text-center mb-6 font-bold text-slate-900">{fullName}</h3>
              <nav className="space-y-2">
                <a href="#personal" className="block px-4 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-600 rounded-xl border-2 border-cyan-200 font-semibold">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span>Personal Info</span>
                  </div>
                </a>
                <a href="#password" className="block px-4 py-2 hover:bg-slate-50 rounded-xl text-slate-700 transition-all font-medium">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    <span>Password</span>
                  </div>
                </a>
                <a href="#payment" className="block px-4 py-2 hover:bg-slate-50 rounded-xl text-slate-700 transition-all font-medium">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Payment History</span>
                  </div>
                </a>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Personal Information */}
            <div id="personal" className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Personal Information</h2>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 font-medium text-slate-700">First Name</label>
                    <input
                      type="text"
                      defaultValue={firstName}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-slate-700">Last Name</label>
                    <input
                      type="text"
                      defaultValue={lastName}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email || ''}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-slate-700">Bio</label>
                  <textarea
                    rows={4}
                    defaultValue="Passionate learner exploring mobile device repair and technology"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none transition-all"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105 transition-all font-bold"
                >
                  Save Changes
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div id="password" className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Change Password</h2>
              <form className="space-y-6">
                <div>
                  <label className="block mb-2 font-medium text-slate-700">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-slate-700">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105 transition-all font-bold"
                >
                  Update Password
                </button>
              </form>
            </div>

            {/* Payment History */}
            <div id="payment" className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Payment History</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b-2 border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Item</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-4 font-medium text-slate-900">{payment.item}</td>
                        <td className="px-4 py-4 font-semibold text-cyan-600">${payment.amount}</td>
                        <td className="px-4 py-4 text-slate-600">{payment.date}</td>
                        <td className="px-4 py-4">
                          <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-sm font-semibold">
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button className="text-cyan-600 hover:text-cyan-700 flex items-center gap-2 font-medium transition-colors">
                            <Download className="w-4 h-4" />
                            <span className="text-sm">Download</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Account Actions</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border-2 border-red-200 rounded-xl bg-red-50">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Delete Account</h3>
                    <p className="text-sm text-slate-600">Permanently delete your account and all data</p>
                  </div>
                  <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-bold">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
