import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, TrendingUp, Users, DollarSign } from 'lucide-react';

import { pageContentsAPI } from '../services/api';
import { PAGE_CONTENT_SLUGS, getDefaultPageContent } from '../utils/pageContentDefaults';

const Policies = () => {
  const [selectedScope, setSelectedScope] = useState('all');
  const [pageContent, setPageContent] = useState(() =>
    getDefaultPageContent(PAGE_CONTENT_SLUGS.POLICIES)
  );

  const slugify = (value) =>
    String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const getPolicySlug = (policy) => {
    if (!policy) return '';
    const raw = policy.slug || policy.id || policy.title;
    return slugify(raw);
  };

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      try {
        const response = await pageContentsAPI.getBySlug(PAGE_CONTENT_SLUGS.POLICIES);
        const payload = response?.data || {};
        const pageContentResponse = payload.pageContent || payload.data?.pageContent;
        const content = pageContentResponse?.content || getDefaultPageContent(PAGE_CONTENT_SLUGS.POLICIES);

        if (isMounted) {
          setPageContent(content);
        }
      } catch (error) {
        if (isMounted) {
          setPageContent(getDefaultPageContent(PAGE_CONTENT_SLUGS.POLICIES));
        }
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const policies = Array.isArray(pageContent?.policies) ? pageContent.policies : [];
  const stats = Array.isArray(pageContent?.stats) ? pageContent.stats : [];
  const scopeFilters = ['all', ...new Set(policies.map((policy) => policy.scope).filter(Boolean))];

  const filteredPolicies = selectedScope === 'all'
    ? policies
    : policies.filter((policy) => policy.scope === selectedScope);

  const iconMap = { FileText, Users, TrendingUp, DollarSign };

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
          {pageContent?.title || 'Policy Framework'}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {pageContent?.subtitle || 'Educational policies for scaling spatial audio training across Kenyan universities'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => {
          const StatIcon = typeof stat.icon === 'string' ? iconMap[stat.icon] : stat.icon;
          const IconComponent = StatIcon || FileText;
          const bgClass = stat.bg || 'bg-blue-100';
          const colorClass = stat.color || 'text-blue-600';

          return (
            <div key={stat.id || stat.label || index} className="bg-white rounded-lg shadow-md p-6">
              <div className={`${bgClass} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <IconComponent className={`h-6 w-6 ${colorClass}`} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
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
        {filteredPolicies.map((policy) => {
          const universitiesValue = Number(policy.universities);
          const studentsValue = Number(policy.studentsReached);
          const budgetValue = Number(policy.budget);
          const startDate = policy.startDate ? new Date(policy.startDate) : null;
          const startDateText = startDate && !Number.isNaN(startDate.getTime())
            ? startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : 'N/A';
          const formattedBudget = Number.isFinite(budgetValue)
            ? `${(budgetValue / 1000000).toFixed(1)}M`
            : policy.budget || 'N/A';

          return (
            <div key={policy.id || policy.title} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
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
                  <div className="text-lg font-semibold text-gray-900">
                    {Number.isFinite(universitiesValue) ? universitiesValue : (policy.universities || 'N/A')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Students Reached</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {Number.isFinite(studentsValue) ? studentsValue.toLocaleString() : (policy.studentsReached || 'N/A')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Budget (KES)</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formattedBudget}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Start Date</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {startDateText}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  to={`/policies/${getPolicySlug(policy)}`}
                  className="inline-flex items-center justify-center bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Policies;