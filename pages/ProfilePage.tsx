import { User, Lock, CreditCard, Download } from 'lucide-react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import { apiUrl } from '../lib/api';
import { jsPDF } from 'jspdf';

type PaymentHistoryEntry = {
  id: string;
  itemId: string;
  itemType: 'course' | 'note';
  itemTitle: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  createdAt?: string;
  invoiceNumber?: string;
};

export function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [deleteForm, setDeleteForm] = useState({
    currentPassword: ''
  });

  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryEntry[]>([]);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [submittingDelete, setSubmittingDelete] = useState(false);
  const [clearingPaymentIds, setClearingPaymentIds] = useState<Set<string>>(new Set());

  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id || !token) {
        setLoadingProfile(false);
        return;
      }

      try {
        const res = await fetch(apiUrl('/api/auth/me'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.success || !json?.data) {
          throw new Error(json?.message || 'Failed to load profile');
        }

        const profile = json.data;
        setProfileForm({
          firstName: String(profile?.firstName || ''),
          lastName: String(profile?.lastName || ''),
          email: String(profile?.email || ''),
          phone: String(profile?.phone || ''),
          bio: String(profile?.bio || '')
        });
      } catch (error: any) {
        setProfileError(error?.message || 'Failed to load profile');
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [token, user?.id]);

  useEffect(() => {
    const loadPayments = async () => {
      if (!user?.id || !token) {
        setLoadingPayments(false);
        return;
      }

      try {
        const res = await fetch(apiUrl(`/api/users/${user.id}/purchases`), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.success) {
          throw new Error(json?.message || 'Failed to load payment history');
        }

        const entries: PaymentHistoryEntry[] = (json?.data || []).map((entry: any) => ({
          id: String(entry?.id || entry?._id || ''),
          itemId: String(entry?.itemId || ''),
          itemType: String(entry?.itemType || 'course') === 'note' ? 'note' : 'course',
          itemTitle: String(entry?.itemTitle || 'Purchased item'),
          amount: Number(entry?.amount || 0),
          status: String(entry?.status || 'Completed'),
          paymentMethod: String(entry?.paymentMethod || ''),
          createdAt: entry?.createdAt,
          invoiceNumber: String(entry?.invoiceNumber || '')
        }));

        setPaymentHistory(entries);
      } catch (error: any) {
        setProfileError(error?.message || 'Failed to load payment history');
      } finally {
        setLoadingPayments(false);
      }
    };

    loadPayments();
  }, [token, user?.id]);

  const firstName = profileForm.firstName || user?.firstName || '';
  const lastName = profileForm.lastName || user?.lastName || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || user?.name || 'User';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0) || (user?.email?.charAt(0) || '')}`.toUpperCase() || 'U';

  const formattedPaymentHistory = useMemo(
    () => paymentHistory.map((payment) => ({
      ...payment,
      dateLabel: payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : '-'
    })),
    [paymentHistory]
  );

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileError('');
    setProfileMessage('');

    if (!token) {
      setProfileError('You are not logged in.');
      return;
    }

    if (!profileForm.firstName.trim() || !profileForm.email.trim()) {
      setProfileError('First name and email are required.');
      return;
    }

    try {
      setSubmittingProfile(true);
      const res = await fetch(apiUrl('/api/auth/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          email: profileForm.email,
          phone: profileForm.phone,
          bio: profileForm.bio
        })
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to update profile');
      }

      await refreshUser();
      setProfileMessage('Profile updated successfully.');
    } catch (error: any) {
      setProfileError(error?.message || 'Failed to update profile');
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (!token) {
      setPasswordError('You are not logged in.');
      return;
    }

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword) {
      setPasswordError('All password fields are required.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setSubmittingPassword(true);
      const res = await fetch(apiUrl('/api/auth/change-password'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to update password');
      }

      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setPasswordMessage('Password updated successfully.');
    } catch (error: any) {
      setPasswordError(error?.message || 'Failed to update password');
    } finally {
      setSubmittingPassword(false);
    }
  };

  const handleDeleteAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    setDeleteError('');
    setDeleteMessage('');

    if (!token) {
      setDeleteError('You are not logged in.');
      return;
    }

    if (!deleteForm.currentPassword.trim()) {
      setDeleteError('Current password is required to delete account.');
      return;
    }

    const confirmed = window.confirm('This will permanently deactivate your account. Do you want to continue?');
    if (!confirmed) {
      return;
    }

    try {
      setSubmittingDelete(true);
      const res = await fetch(apiUrl('/api/auth/account'), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: deleteForm.currentPassword
        })
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to delete account');
      }

      setDeleteMessage('Account deleted successfully. Logging out...');
      logout();
    } catch (error: any) {
      setDeleteError(error?.message || 'Failed to delete account');
    } finally {
      setSubmittingDelete(false);
    }
  };

  const downloadInvoice = (payment: PaymentHistoryEntry) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const invoiceId = payment.invoiceNumber || `INV-${payment.id.slice(-8).toUpperCase()}`;
    const purchaseDate = payment.createdAt ? new Date(payment.createdAt) : new Date();

    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setFillColor(8, 145, 178);
    doc.rect(0, 0, pageWidth, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('MobRepair Invoice', 16, 18);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Invoice Details', 16, 44);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Invoice No: ${invoiceId}`, 16, 54);
    doc.text(`Date: ${purchaseDate.toLocaleString()}`, 16, 61);
    doc.text(`Customer: ${fullName}`, 16, 68);
    doc.text(`Email: ${profileForm.email || user?.email || ''}`, 16, 75);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 86, pageWidth - 28, 56, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.text('Item', 20, 98);
    doc.text('Type', 110, 98);
    doc.text('Amount', pageWidth - 20, 98, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.text(payment.itemTitle, 20, 109, { maxWidth: 82 });
    doc.text(payment.itemType === 'note' ? 'Guide' : 'Course', 110, 109);
    doc.text(`$${Number(payment.amount || 0).toFixed(2)}`, pageWidth - 20, 109, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Total Paid', 20, 132);
    doc.text(`$${Number(payment.amount || 0).toFixed(2)}`, pageWidth - 20, 132, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Thank you for your purchase.', 14, pageHeight - 12);

    doc.save(`invoice-${invoiceId}.pdf`);
  };

  const handleClearPayment = async (paymentId: string) => {
    setProfileError('');
    setProfileMessage('');

    if (!user?.id || !token) {
      setProfileError('You are not logged in.');
      return;
    }

    const confirmed = window.confirm('Remove this payment entry from your history?');
    if (!confirmed) {
      return;
    }

    try {
      setClearingPaymentIds((current) => new Set([...current, paymentId]));

      const res = await fetch(apiUrl(`/api/users/${user.id}/purchases/${paymentId}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to clear payment entry');
      }

      setPaymentHistory((current) => current.filter((entry) => entry.id !== paymentId));
      setProfileMessage('Payment entry cleared.');
    } catch (error: any) {
      setProfileError(error?.message || 'Failed to clear payment entry');
    } finally {
      setClearingPaymentIds((current) => {
        const next = new Set(current);
        next.delete(paymentId);
        return next;
      });
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading profile...</div>
      </div>
    );
  }

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
              <form className="space-y-6" onSubmit={handleProfileSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 font-medium text-slate-700">First Name</label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(event) => setProfileForm((current) => ({ ...current, firstName: event.target.value }))}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-slate-700">Last Name</label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(event) => setProfileForm((current) => ({ ...current, lastName: event.target.value }))}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-slate-700">Bio</label>
                  <textarea
                    rows={4}
                    value={profileForm.bio}
                    onChange={(event) => setProfileForm((current) => ({ ...current, bio: event.target.value }))}
                    placeholder="Tell us about yourself"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none transition-all"
                  ></textarea>
                </div>

                {profileError && <p className="text-sm text-red-600">{profileError}</p>}
                {profileMessage && <p className="text-sm text-green-600">{profileMessage}</p>}

                <button
                  type="submit"
                  disabled={submittingProfile}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105 transition-all font-bold"
                >
                  {submittingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div id="password" className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Change Password</h2>
              <form className="space-y-6" onSubmit={handlePasswordSubmit}>
                <div>
                  <label className="block mb-2 font-medium text-slate-700">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-slate-700">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={passwordForm.newPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordForm.confirmNewPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, confirmNewPassword: event.target.value }))}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  />
                </div>

                {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                {passwordMessage && <p className="text-sm text-green-600">{passwordMessage}</p>}

                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105 transition-all font-bold"
                >
                  {submittingPassword ? 'Updating...' : 'Update Password'}
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
                    {!loadingPayments && formattedPaymentHistory.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No payment history yet.</td>
                      </tr>
                    )}
                    {formattedPaymentHistory.map((payment) => (
                      <tr key={payment.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-4 font-medium text-slate-900">{payment.itemTitle}</td>
                        <td className="px-4 py-4 font-semibold text-cyan-600">${Number(payment.amount).toFixed(2)}</td>
                        <td className="px-4 py-4 text-slate-600">{payment.dateLabel}</td>
                        <td className="px-4 py-4">
                          <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-sm font-semibold">
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => downloadInvoice(payment)}
                              className="text-cyan-600 hover:text-cyan-700 flex items-center gap-2 font-medium transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              <span className="text-sm">Download</span>
                            </button>
                            <button
                              onClick={() => handleClearPayment(payment.id)}
                              disabled={clearingPaymentIds.has(payment.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors disabled:opacity-60"
                            >
                              {clearingPaymentIds.has(payment.id) ? 'Clearing...' : 'Clear'}
                            </button>
                          </div>
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
                <form onSubmit={handleDeleteAccount} className="p-4 border-2 border-red-200 rounded-xl bg-red-50 space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Delete Account</h3>
                    <p className="text-sm text-slate-600">Permanently deactivate your account and logout from this device</p>
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-slate-700">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={deleteForm.currentPassword}
                      onChange={(event) => setDeleteForm({ currentPassword: event.target.value })}
                      className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    />
                  </div>

                  {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
                  {deleteMessage && <p className="text-sm text-green-700">{deleteMessage}</p>}

                  <button
                    type="submit"
                    disabled={submittingDelete}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-bold"
                  >
                    {submittingDelete ? 'Deleting...' : 'Delete Account'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
