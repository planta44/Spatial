import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, DollarSign, Tag, Users } from 'lucide-react';
import { pageContentsAPI } from '../services/api';
import { PAGE_CONTENT_SLUGS, getDefaultPageContent } from '../utils/pageContentDefaults';

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const formatInlineMarkdown = (value) =>
  String(value || '')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

const buildMarkdownBlocks = (content) => {
  const lines = String(content || '').split('\n');
  const blocks = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: 'list', items: listItems });
      listItems = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }
    if (trimmed.startsWith('- ')) {
      listItems.push(trimmed.replace(/^- /, ''));
      return;
    }
    flushList();

    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'heading', level: 3, text: trimmed.replace(/^### /, '') });
      return;
    }
    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'heading', level: 2, text: trimmed.replace(/^## /, '') });
      return;
    }
    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'heading', level: 1, text: trimmed.replace(/^# /, '') });
      return;
    }

    blocks.push({ type: 'paragraph', text: trimmed });
  });

  flushList();
  return blocks;
};

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

const PolicyDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [pageContent, setPageContent] = useState(() =>
    getDefaultPageContent(PAGE_CONTENT_SLUGS.POLICIES)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [slug]);

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
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const policy = useMemo(() => {
    const policies = Array.isArray(pageContent?.policies) ? pageContent.policies : [];
    const normalizedSlug = slugify(slug || '');

    return policies.find((entry) => {
      if (!entry) return false;
      const candidate = entry.slug || entry.id || entry.title;
      const candidateSlug = slugify(candidate);
      return candidateSlug === normalizedSlug || String(entry.id) === String(slug || '');
    });
  }, [pageContent, slug]);

  const keyPoints = Array.isArray(policy?.keyPoints) ? policy.keyPoints : [];
  const startDate = policy?.startDate ? new Date(policy.startDate) : null;
  const startDateText = startDate && !Number.isNaN(startDate.getTime())
    ? startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })
    : 'N/A';
  const universitiesValue = Number(policy?.universities);
  const studentsValue = Number(policy?.studentsReached);
  const budgetValue = Number(policy?.budget);
  const formattedBudget = Number.isFinite(budgetValue)
    ? `KES ${budgetValue.toLocaleString()}`
    : policy?.budget || 'N/A';

  const renderMarkdownContent = () => {
    if (!policy?.content) {
      return <p className="text-sm text-gray-500">No detailed policy content has been added yet.</p>;
    }

    const blocks = buildMarkdownBlocks(policy.content);
    if (!blocks.length) {
      return <p className="text-sm text-gray-500">No detailed policy content has been added yet.</p>;
    }

    return (
      <div className="space-y-4">
        {blocks.map((block, index) => {
          if (block.type === 'heading') {
            const HeadingTag = block.level === 1 ? 'h2' : block.level === 2 ? 'h3' : 'h4';
            const headingClass = block.level === 1
              ? 'text-2xl font-semibold text-gray-900'
              : block.level === 2
                ? 'text-xl font-semibold text-gray-900'
                : 'text-lg font-semibold text-gray-900';
            return (
              <HeadingTag
                key={`heading-${index}`}
                className={headingClass}
                dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.text) }}
              />
            );
          }
          if (block.type === 'list') {
            return (
              <ul key={`list-${index}`} className="list-disc list-inside space-y-1 text-gray-700">
                {block.items.map((listItem, listIndex) => (
                  <li
                    key={`list-${index}-item-${listIndex}`}
                    dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(listItem) }}
                  />
                ))}
              </ul>
            );
          }
          return (
            <p
              key={`paragraph-${index}`}
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.text) }}
            />
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-600">Loading policy details...</div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600">Policy not found or unavailable.</p>
          <button
            type="button"
            onClick={() => navigate('/policies')}
            className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Policies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <button
          type="button"
          onClick={() => navigate('/policies')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Policies
        </button>

        <div className="bg-white rounded-2xl shadow-lg mt-6 overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-600">
              {policy.scope && (
                <span className={`px-3 py-1 rounded-full ${getScopeColor(policy.scope)}`}>
                  {policy.scope}
                </span>
              )}
              {policy.status && (
                <span className={`px-3 py-1 rounded-full ${getStatusColor(policy.status)}`}>
                  {policy.status.replace('-', ' ')}
                </span>
              )}
              {policy.category && (
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 inline-flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {policy.category}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">{policy.title}</h1>
              <p className="mt-2 text-gray-600">{policy.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Building2 className="h-4 w-4" />
                  Universities
                </div>
                <div className="mt-2 text-xl font-semibold text-gray-900">
                  {Number.isFinite(universitiesValue) ? universitiesValue : policy.universities || 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  Students Reached
                </div>
                <div className="mt-2 text-xl font-semibold text-gray-900">
                  {Number.isFinite(studentsValue) ? studentsValue.toLocaleString() : policy.studentsReached || 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <DollarSign className="h-4 w-4" />
                  Budget (KES)
                </div>
                <div className="mt-2 text-xl font-semibold text-gray-900">{formattedBudget}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </div>
                <div className="mt-2 text-xl font-semibold text-gray-900">{startDateText}</div>
              </div>
            </div>

            {keyPoints.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Key Focus Areas</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {keyPoints.map((point, index) => (
                    <li key={`${point}-${index}`}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Policy Details</h2>
              {renderMarkdownContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyDetail;
