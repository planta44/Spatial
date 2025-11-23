import { useState } from 'react';
import { FileText, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

const Policies = () => {
  const [selectedScope, setSelectedScope] = useState('all');

  const policies = [
    {
      id: 1,
      title: 'National Spatial Audio Integration Framework',
      category: 'curriculum',
      scope: 'national',
      status: 'active',
      universities: 15,
      studentsReached: 3500,
      budget: 5000000,
      startDate: '2023-01-15',
      description: 'Comprehensive framework for integrating spatial audio technology into music education curricula across Kenyan universities.',
    },
    {
      id: 2,
      title: 'Teacher Training Certification Standards',
      category: 'training',
      scope: 'national',
      status: 'active',
      universities: 12,
      studentsReached: 450,
      budget: 2500000,
      startDate: '2023-03-10',
      description: 'Standardized certification requirements for music educators specializing in spatial audio technology.',
    },
    {
      id: 3,
      title: 'Technology Infrastructure Guidelines',
      category: 'infrastructure',
      scope: 'institutional',
      status: 'under-review',
      universities: 8,
      studentsReached: 1200,
      budget: 8000000,
      startDate: '2023-06-01',
      description: 'Guidelines for setting up and maintaining spatial audio labs and equipment in university settings.',
    },
    {
      id: 4,
      title: 'Quality Assurance for Spatial Audio Programs',
      category: 'quality-assurance',
      scope: 'regional',
      status: 'active',
      universities: 6,
      studentsReached: 800,
      budget: 1500000,
      startDate: '2023-04-20',
      description: 'Quality standards and assessment criteria for spatial audio training programs.',
    },
  ];

  const scopeFilters = ['all', 'national', 'regional', 'institutional'];

  const filteredPolicies = selectedScope === 'all' 
    ? policies 
    : policies.filter(p => p.scope === selectedScope);

  const stats = [
    { icon: FileText, label: 'Total Policies', value: policies.length, color: 'text-blue-600', bg: 'bg-blue-100' },
    { icon: Users, label: 'Universities Involved', value: '20+', color: 'text-green-600', bg: 'bg-green-100' },
    { icon: TrendingUp, label: 'Students Reached', value: '6K+', color: 'text-purple-600', bg: 'bg-purple-100' },
    { icon: DollarSign, label: 'Total Budget (KES)', value: '17.5M', color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScopeColor = (scope) => {
    switch (scope) {
      case 'national':
        return 'bg-blue-100 text-blue-800';
      case 'regional':
        return 'bg-purple-100 text-purple-800';
      case 'institutional':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Policy Framework
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Educational policies for scaling spatial audio training across Kenyan universities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className={`${stat.bg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Scope</h3>
        <div className="flex flex-wrap gap-2">
          {scopeFilters.map((scope) => (
            <button
              key={scope}
              onClick={() => setSelectedScope(scope)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedScope === scope
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {scope.charAt(0).toUpperCase() + scope.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Policies List */}
      <div className="space-y-6">
        {filteredPolicies.map((policy) => (
          <div key={policy.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getScopeColor(policy.scope)}`}>
                    {policy.scope}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(policy.status)}`}>
                    {policy.status}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{policy.title}</h3>
                <p className="text-gray-600 mb-4">{policy.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div>
                <div className="text-sm text-gray-500 mb-1">Universities</div>
                <div className="text-lg font-semibold text-gray-900">{policy.universities}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Students Reached</div>
                <div className="text-lg font-semibold text-gray-900">{policy.studentsReached.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Budget (KES)</div>
                <div className="text-lg font-semibold text-gray-900">
                  {(policy.budget / 1000000).toFixed(1)}M
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Start Date</div>
                <div className="text-lg font-semibold text-gray-900">
                  {new Date(policy.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Policies;