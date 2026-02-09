import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { pageContentsAPI } from '../services/api';
import { PAGE_CONTENT_OPTIONS, getDefaultPageContent } from '../utils/pageContentDefaults';

const AdminPageContent = () => {
  const navigate = useNavigate();
  const [selectedSlug, setSelectedSlug] = useState(PAGE_CONTENT_OPTIONS[0]?.slug || '');
  const [title, setTitle] = useState('');
  const [jsonValue, setJsonValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parseError, setParseError] = useState('');

  const isAdmin = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      return user?.role === 'admin' || user?.role === 'teacher';
    } catch (error) {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('token') || !isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const applyDefaults = (slug) => {
    const defaults = getDefaultPageContent(slug);
    setTitle(defaults.title || '');
    setJsonValue(JSON.stringify(defaults, null, 2));
  };

  const loadPageContent = async (slug) => {
    if (!slug) return;

    setLoading(true);
    setParseError('');

    try {
      const response = await pageContentsAPI.getBySlug(slug);
      const payload = response?.data || {};
      const pageContent = payload.pageContent || payload.data?.pageContent;
      const content = pageContent?.content || getDefaultPageContent(slug);

      setTitle(pageContent?.title || content.title || '');
      setJsonValue(JSON.stringify(content, null, 2));
    } catch (error) {
      applyDefaults(slug);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSlug) {
      loadPageContent(selectedSlug);
    }
  }, [selectedSlug]);

  const handleSave = async () => {
    if (!selectedSlug) return;

    let parsed;
    try {
      parsed = JSON.parse(jsonValue || '{}');
      setParseError('');
    } catch (error) {
      setParseError('Invalid JSON. Fix formatting before saving.');
      toast.error('Invalid JSON');
      return;
    }

    try {
      setSaving(true);
      await pageContentsAPI.upsert(selectedSlug, {
        title: title || parsed.title || null,
        content: parsed,
      });
      toast.success('Page content saved');
    } catch (error) {
      console.error('Failed to save page content:', error);
      toast.error('Failed to save page content');
    } finally {
      setSaving(false);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonValue || '{}');
      setJsonValue(JSON.stringify(parsed, null, 2));
      setParseError('');
    } catch (error) {
      setParseError('Invalid JSON. Fix formatting before saving.');
      toast.error('Invalid JSON');
    }
  };

  const selectedOption = PAGE_CONTENT_OPTIONS.find((option) => option.slug === selectedSlug);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Static Pages</h1>
          <p className="text-sm text-gray-600">Update page copy, cards, and metadata using JSON.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-5 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Pages</h2>
          {PAGE_CONTENT_OPTIONS.map((option) => (
            <button
              key={option.slug}
              onClick={() => setSelectedSlug(option.slug)}
              className={`w-full text-left border rounded-lg px-4 py-3 transition-colors ${
                selectedSlug === option.slug
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-gray-500 mt-1">{option.description}</div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{selectedOption?.label || 'Page Content'}</h2>
            <p className="text-sm text-gray-500">Content is stored as JSON and rendered on the public pages.</p>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading content...</p>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Optional title override"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content JSON</label>
                <textarea
                  rows={16}
                  value={jsonValue}
                  onChange={(event) => setJsonValue(event.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs"
                  placeholder={'{ "title": "..." }'}
                />
                {parseError && <p className="text-sm text-red-600 mt-2">{parseError}</p>}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleFormat}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Format JSON
                </button>
                <button
                  onClick={() => applyDefaults(selectedSlug)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Load defaults
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPageContent;
