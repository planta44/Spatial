import { Users, GraduationCap, FileText, TrendingUp, Activity, LogOut } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = ({ onLogout }) => {
  const stats = [
    { icon: Users, label: 'Total Users', value: '1,234', change: '+12%', color: 'text-blue-600', bg: 'bg-blue-100' },
    { icon: GraduationCap, label: 'Active Courses', value: '45', change: '+8%', color: 'text-green-600', bg: 'bg-green-100' },
    { icon: FileText, label: 'Resources', value: '892', change: '+15%', color: 'text-purple-600', bg: 'bg-purple-100' },
    { icon: Activity, label: 'Engagement Rate', value: '87%', change: '+5%', color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  const monthlyData = [
    { month: 'Jan', users: 150, resources: 45 },
    { month: 'Feb', users: 230, resources: 62 },
    { month: 'Mar', users: 310, resources: 78 },
    { month: 'Apr', users: 420, resources: 95 },
    { month: 'May', users: 580, resources: 128 },
    { month: 'Jun', users: 720, resources: 156 },
  ];

  const universityData = [
    { name: 'University of Nairobi', value: 285 },
    { name: 'Kenyatta University', value: 245 },
    { name: 'Moi University', value: 180 },
    { name: 'Egerton University', value: 165 },
    { name: 'Others', value: 359 },
  ];

  const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const recentActivities = [
    { id: 1, user: 'Dr. Jane Mukami', action: 'Uploaded new resource', resource: 'Spatial Audio Basics', time: '2 hours ago' },
    { id: 2, user: 'Prof. John Kamau', action: 'Created policy', resource: 'Curriculum Framework', time: '5 hours ago' },
    { id: 3, user: 'Dr. Sarah Wanjiru', action: 'Updated training module', resource: 'Ambisonic Techniques', time: '1 day ago' },
    { id: 4, user: 'Admin', action: 'System maintenance', resource: 'Server update', time: '2 days ago' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with Spatial AI.</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Growth Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#0ea5e9" strokeWidth={2} name="Users" />
              <Line type="monotone" dataKey="resources" stroke="#8b5cf6" strokeWidth={2} name="Resources" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* University Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by University</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={universityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name.split(' ')[0]}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {universityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="bg-primary-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                <Activity className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  <span className="font-semibold">{activity.user}</span> {activity.action}
                </p>
                <p className="text-sm text-gray-600 truncate">{activity.resource}</p>
              </div>
              <span className="text-sm text-gray-500 whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow text-left">
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Manage Users</h4>
          <p className="text-sm text-gray-600">Add, edit, or remove user accounts</p>
        </button>

        <button className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow text-left">
          <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Add Resources</h4>
          <p className="text-sm text-gray-600">Upload new training materials</p>
        </button>

        <button className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow text-left">
          <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">View Reports</h4>
          <p className="text-sm text-gray-600">Generate analytics and reports</p>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;