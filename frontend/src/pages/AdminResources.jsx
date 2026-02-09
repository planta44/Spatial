import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Save, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { resourcesAPI } from '../services/api';
import { DIFFICULTY_LEVELS, RESOURCE_CATEGORIES, RESOURCE_TYPES } from '../utils/constants';

const createEmptyBlock = (type) => ({
  id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type,
  text: '',
  url: '',
  thumbnailUrl: '',
  caption: '',
  items: [],
});

const AdminResources = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: RESOURCE_TYPES.DOCUMENT,
    category: RESOURCE_CATEGORIES.K12_CHORAL,
    difficulty: DIFFICULTY_LEVELS.ALL_LEVELS,
    duration: 30,
    tags: '',
    thumbnailUrl: '',
    fileUrl: '',
    isPublished: false,
    contentBlocks: [],
  });

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

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      type: RESOURCE_TYPES.DOCUMENT,
      category: RESOURCE_CATEGORIES.K12_CHORAL,
      difficulty: DIFFICULTY_LEVELS.ALL_LEVELS,
      duration: 30,
      tags: '',
      thumbnailUrl: '',
      fileUrl: '',
      isPublished: false,
      contentBlocks: [],
    });
  };

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await resourcesAPI.getAdmin({ limit: 200 });
      const payload = response?.data || {};
      const data = payload.data || payload.resources || [];
      setResources(data);
    } catch (error) {
      console.error('Failed to load admin resources:', error);
      toast.error('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleEdit = (resource) => {
    setEditingId(resource.id);
    setForm({
      title: resource.title || '',
      description: resource.description || '',
      type: resource.type || RESOURCE_TYPES.DOCUMENT,
      category: resource.category || RESOURCE_CATEGORIES.K12_CHORAL,
      difficulty: resource.difficulty || DIFFICULTY_LEVELS.ALL_LEVELS,
      duration: resource.duration || 0,
      tags: (resource.tags || []).join(', '),
      thumbnailUrl: resource.thumbnailUrl || '',
      fileUrl: resource.fileUrl || '',
      isPublished: Boolean(resource.isPublished),
      contentBlocks: resource.contentBlocks || [],
    });
  };

  const handleBlockChange = (index, field, value) => {
    setForm((prev) => {
      const blocks = [...prev.contentBlocks];
      blocks[index] = { ...blocks[index], [field]: value };
      return { ...prev, contentBlocks: blocks };
    });
  };

  const moveBlock = (fromIndex, toIndex) => {
    setForm((prev) => {
      if (toIndex < 0 || toIndex >= prev.contentBlocks.length) {
        return prev;
      }
      const blocks = [...prev.contentBlocks];
      const [moved] = blocks.splice(fromIndex, 1);
      blocks.splice(toIndex, 0, moved);
      return { ...prev, contentBlocks: blocks };
    });
  };

  const updateResourceOrder = async (nextResources) => {
    try {
      setResources(nextResources);
      const orderedIds = nextResources.map((resource) => resource.id).filter(Boolean);
      if (orderedIds.length > 0) {
        await resourcesAPI.reorder(orderedIds);
      }
    } catch (error) {
      console.error('Failed to reorder resources:', error);
      toast.error('Failed to save order');
      await loadResources();
    }
  };

  const moveResourceCard = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= resources.length) {
      return;
    }
    const nextResources = [...resources];
    const [moved] = nextResources.splice(fromIndex, 1);
    nextResources.splice(toIndex, 0, moved);
    updateResourceOrder(nextResources);
  };

  const handleBlockUpload = async (index, file, options = {}) => {
    if (!file) return;
    try {
      const { urlField = 'url', captionField = 'caption', setCaption = true } = options;
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const response = await resourcesAPI.uploadAsset(formData);
      const payload = response?.data || {};
      const url = payload.url || payload.data?.url || '';
      if (!url) {
        throw new Error('Upload failed');
      }
      handleBlockChange(index, urlField, url);
      if (setCaption) {
        handleBlockChange(index, captionField, file.name);
      }
      toast.success('File uploaded');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailUpload = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const response = await resourcesAPI.uploadAsset(formData);
      const payload = response?.data || {};
      const url = payload.url || payload.data?.url || '';
      if (!url) {
        throw new Error('Upload failed');
      }
      setForm((prev) => ({ ...prev, thumbnailUrl: url }));
      toast.success('Thumbnail uploaded');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Thumbnail upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const response = await resourcesAPI.uploadAsset(formData);
      const payload = response?.data || {};
      const url = payload.url || payload.data?.url || '';
      if (!url) {
        throw new Error('Upload failed');
      }
      setForm((prev) => ({ ...prev, fileUrl: url }));
      toast.success('File uploaded');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.description) {
      toast.error('Title and description are required');
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      type: form.type,
      category: form.category,
      difficulty: form.difficulty,
      duration: Number(form.duration) || 0,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      thumbnailUrl: form.thumbnailUrl || null,
      fileUrl: form.fileUrl || null,
      isPublished: Boolean(form.isPublished),
      contentBlocks: form.contentBlocks,
    };

    try {
      setSaving(true);
      if (editingId) {
        await resourcesAPI.update(editingId, payload);
        toast.success('Resource updated');
      } else {
        await resourcesAPI.create(payload);
        toast.success('Resource created');
      }
      resetForm();
      await loadResources();
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save resource');
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Add & Edit Resources</h1>
          <p className="text-sm text-gray-600">Build resource cards with rich content, PDFs, images, and video links.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Existing Resources</h2>
            <button
              onClick={resetForm}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              New
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500">Loading resources...</p>
          ) : resources.length === 0 ? (
            <p className="text-sm text-gray-500">No resources yet.</p>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
              {resources.map((resource, index) => (
                <div key={resource.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{resource.title}</p>
                      <p className="text-xs text-gray-500">{resource.category} • {resource.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveResourceCard(index, index - 1)}
                        disabled={index === 0}
                        className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40"
                        title="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveResourceCard(index, index + 1)}
                        disabled={index === resources.length - 1}
                        className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40"
                        title="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(resource)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {resource.isPublished ? 'Published' : 'Draft'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Resource title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="0"
                value={form.duration}
                onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Short summary shown on the resource card"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                {Object.values(RESOURCE_TYPES).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                {Object.values(RESOURCE_CATEGORIES).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm((prev) => ({ ...prev, difficulty: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                {Object.values(DIFFICULTY_LEVELS).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="choral, warmups, sight-reading"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="block text-sm font-medium text-gray-700">Published</label>
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
                className="h-4 w-4"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={form.thumbnailUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Paste image URL or upload"
                />
                <label className="inline-flex items-center gap-2 text-xs bg-gray-100 px-3 py-2 rounded-lg cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleThumbnailUpload(e.target.files?.[0])}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary PDF (optional)</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={form.fileUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, fileUrl: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Paste PDF URL or upload"
                />
                <label className="inline-flex items-center gap-2 text-xs bg-gray-100 px-3 py-2 rounded-lg cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Upload
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileUpload(e.target.files?.[0])}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Content Blocks</h3>
              <div className="flex flex-wrap gap-2">
                {['heading', 'subheading', 'paragraph', 'list', 'link', 'image', 'video', 'pdf'].map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        contentBlocks: [...prev.contentBlocks, createEmptyBlock(type)],
                      }))
                    }
                    className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                  >
                    <Plus className="h-3 w-3" />
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {form.contentBlocks.length === 0 && (
                <p className="text-sm text-gray-500">Add content blocks to build the resource page.</p>
              )}
              {form.contentBlocks.map((block, index) => (
                <div key={block.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-800">{block.type.toUpperCase()}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveBlock(index, index - 1)}
                        disabled={index === 0}
                        className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(index, index + 1)}
                        disabled={index === form.contentBlocks.length - 1}
                        className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            contentBlocks: prev.contentBlocks.filter((_, idx) => idx !== index),
                          }))
                        }
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {['heading', 'subheading', 'paragraph'].includes(block.type) && (
                    <textarea
                      rows={block.type === 'paragraph' ? 3 : 2}
                      value={block.text}
                      onChange={(e) => handleBlockChange(index, 'text', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder={`Enter ${block.type} text`}
                    />
                  )}

                  {block.type === 'list' && (
                    <textarea
                      rows={4}
                      value={block.items?.join('\n') || ''}
                      onChange={(e) =>
                        handleBlockChange(
                          index,
                          'items',
                          e.target.value
                            .split('\n')
                            .map((item) => item.trim())
                            .filter(Boolean)
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="One list item per line"
                    />
                  )}

                  {block.type === 'link' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={block.url}
                        onChange={(e) => handleBlockChange(index, 'url', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Paste link URL (https://...)"
                      />
                      <input
                        type="text"
                        value={block.caption || ''}
                        onChange={(e) => handleBlockChange(index, 'caption', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Link text (optional)"
                      />
                      <textarea
                        rows={2}
                        value={block.text || ''}
                        onChange={(e) => handleBlockChange(index, 'text', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Description (optional)"
                      />
                    </div>
                  )}

                  {['image', 'pdf'].includes(block.type) && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={block.url}
                        onChange={(e) => handleBlockChange(index, 'url', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Paste a file URL or upload"
                      />
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={block.caption || ''}
                          onChange={(e) => handleBlockChange(index, 'caption', e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Caption (optional)"
                        />
                        <label className="inline-flex items-center gap-2 text-xs bg-gray-100 px-3 py-2 rounded-lg cursor-pointer">
                          <Upload className="h-4 w-4" />
                          Upload
                          <input
                            type="file"
                            accept={block.type === 'image' ? 'image/*' : 'application/pdf'}
                            onChange={(e) => handleBlockUpload(index, e.target.files?.[0])}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {block.type === 'video' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={block.url}
                        onChange={(e) => handleBlockChange(index, 'url', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Paste video link (YouTube, Vimeo, etc.)"
                      />
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={block.thumbnailUrl || ''}
                          onChange={(e) => handleBlockChange(index, 'thumbnailUrl', e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Video thumbnail URL (optional)"
                        />
                        <label className="inline-flex items-center gap-2 text-xs bg-gray-100 px-3 py-2 rounded-lg cursor-pointer">
                          <Upload className="h-4 w-4" />
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleBlockUpload(index, e.target.files?.[0], {
                                urlField: 'thumbnailUrl',
                                setCaption: false,
                              })
                            }
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={block.caption || ''}
                        onChange={(e) => handleBlockChange(index, 'caption', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Caption (optional)"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : editingId ? 'Update Resource' : 'Create Resource'}
            </button>
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <Trash2 className="h-4 w-4" />
              Clear Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminResources;
