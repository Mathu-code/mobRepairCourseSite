import { Link } from 'react-router-dom';
import { BookOpen, Users, DollarSign, TrendingUp, CheckCircle, XCircle, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 45200 },
  { month: 'Feb', revenue: 52100 },
  { month: 'Mar', revenue: 48800 },
  { month: 'Apr', revenue: 63300 },
  { month: 'May', revenue: 72200 },
  { month: 'Jun', revenue: 81500 },
];

const userGrowthData = [
  { month: 'Jan', users: 1200 },
  { month: 'Feb', users: 1850 },
  { month: 'Mar', users: 2340 },
  { month: 'Apr', users: 2980 },
  { month: 'May', users: 3720 },
  { month: 'Jun', users: 4500 },
];

const pendingInstructors = [
  { name: 'Sarah Wilson', email: 'sarah.w@email.com', applied: '2 days ago', courses: 3 },
  { name: 'Mike Johnson', email: 'mike.j@email.com', applied: '3 days ago', courses: 5 },
  { name: 'Emily Chen', email: 'emily.c@email.com', applied: '1 week ago', courses: 2 },
];

const recentTransactions = [
  { id: 'TXN-001', user: 'Alice Thompson', item: 'Web Development', amount: 49.99, date: '2 hours ago', status: 'Completed' },
  { id: 'TXN-002', user: 'Mark Williams', item: 'JavaScript Notes', amount: 14.99, date: '5 hours ago', status: 'Completed' },
  { id: 'TXN-003', user: 'Sarah Chen', item: 'React Course', amount: 59.99, date: '1 day ago', status: 'Pending' },
  { id: 'TXN-004', user: 'John Davis', item: 'Python Course', amount: 54.99, date: '1 day ago', status: 'Completed' },
];

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Admin</span>
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white">
              AD
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl mb-1">24,580</p>
            <p className="text-sm text-gray-600">Total Users</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+12% this month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl mb-1">1,245</p>
            <p className="text-sm text-gray-600">Total Instructors</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+8% this month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-2xl mb-1">$452,350</p>
            <p className="text-sm text-gray-600">Total Earnings</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+18% this month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl mb-1">3</p>
            <p className="text-sm text-gray-600">Pending Approvals</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl mb-6">Revenue Overview</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl mb-6">User Growth</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pending Instructor Approvals */}
        <div className="mb-8">
          <h2 className="text-2xl mb-6">Pending Instructor Approvals</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Name</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Email</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Applied</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Sample Courses</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingInstructors.map((instructor, index) => (
                  <tr key={index} className={index !== pendingInstructors.length - 1 ? 'border-b border-gray-200' : ''}>
                    <td className="px-6 py-4">{instructor.name}</td>
                    <td className="px-6 py-4 text-gray-600">{instructor.email}</td>
                    <td className="px-6 py-4 text-gray-600">{instructor.applied}</td>
                    <td className="px-6 py-4">{instructor.courses}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                          Approve
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Course Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl">Course Management</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm">View All</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="mb-1">Total Courses</p>
                  <p className="text-2xl">2,450</p>
                </div>
                <BookOpen className="w-10 h-10 text-blue-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="mb-1">Pending Review</p>
                  <p className="text-2xl">28</p>
                </div>
                <Eye className="w-10 h-10 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl">Notes Management</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm">View All</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="mb-1">Total Notes</p>
                  <p className="text-2xl">1,820</p>
                </div>
                <BookOpen className="w-10 h-10 text-purple-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="mb-1">Pending Review</p>
                  <p className="text-2xl">15</p>
                </div>
                <Eye className="w-10 h-10 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h2 className="text-2xl mb-6">Recent Transactions</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Transaction ID</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">User</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Item</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Amount</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Date</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction, index) => (
                  <tr key={transaction.id} className={index !== recentTransactions.length - 1 ? 'border-b border-gray-200' : ''}>
                    <td className="px-6 py-4 text-gray-600">{transaction.id}</td>
                    <td className="px-6 py-4">{transaction.user}</td>
                    <td className="px-6 py-4">{transaction.item}</td>
                    <td className="px-6 py-4">${transaction.amount}</td>
                    <td className="px-6 py-4 text-gray-600">{transaction.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          transaction.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
