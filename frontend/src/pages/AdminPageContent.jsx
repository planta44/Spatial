import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Save, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { pageContentsAPI, resourcesAPI } from '../services/api';
import { PAGE_CONTENT_OPTIONS, PAGE_CONTENT_SLUGS, getDefaultPageContent } from '../utils/pageContentDefaults';

const AdminPageContent = () => {
  const navigate = useNavigate();
  const [selectedSlug, setSelectedSlug] = useState(PAGE_CONTENT_OPTIONS[0]?.slug || '');
  const [content, setContent] = useState(() =>
    getDefaultPageContent(PAGE_CONTENT_OPTIONS[0]?.slug || '')
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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
    setContent(defaults);
  };

  const loadPageContent = async (slug) => {
    if (!slug) return;

    setLoading(true);

    try {
      const response = await pageContentsAPI.getBySlug(slug);
      const payload = response?.data || {};
      const pageContent = payload.pageContent || payload.data?.pageContent;
      const defaults = getDefaultPageContent(slug);
      const nextContent = pageContent?.content
        ? { ...defaults, ...pageContent.content }
        : defaults;

      setContent(nextContent);
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

    try {
      setSaving(true);
      await pageContentsAPI.upsert(selectedSlug, {
        title: content.title || null,
        content,
      });
      toast.success('Page content saved');
    } catch (error) {
      console.error('Failed to save page content:', error);
      toast.error('Failed to save page content');
    } finally {
      setSaving(false);
    }
  };

  const updateContentField = (field, value) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const updateListItemField = (listKey, index, field, value) => {
    setContent((prev) => {
      const list = [...(prev[listKey] || [])];
      list[index] = { ...(list[index] || {}), [field]: value };
      return { ...prev, [listKey]: list };
    });
  };

  const addListItem = (listKey, item) => {
    setContent((prev) => ({
      ...prev,
      [listKey]: [...(prev[listKey] || []), item],
    }));
  };

  const removeListItem = (listKey, index) => {
    setContent((prev) => {
      const list = [...(prev[listKey] || [])];
      list.splice(index, 1);
      return { ...prev, [listKey]: list };
    });
  };

  const moveListItem = (listKey, index, direction) => {
    setContent((prev) => {
      const list = [...(prev[listKey] || [])];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= list.length) {
        return prev;
      }
      const [moved] = list.splice(index, 1);
      list.splice(nextIndex, 0, moved);
      return { ...prev, [listKey]: list };
    });
  };

  const updateNestedListItem = (listKey, index, nestedKey, nestedIndex, value) => {
    setContent((prev) => {
      const list = [...(prev[listKey] || [])];
      const current = list[index] || {};
      const nested = [...(current[nestedKey] || [])];
      nested[nestedIndex] = value;
      list[index] = { ...current, [nestedKey]: nested };
      return { ...prev, [listKey]: list };
    });
  };

  const addNestedListItem = (listKey, index, nestedKey, value = '') => {
    setContent((prev) => {
      const list = [...(prev[listKey] || [])];
      const current = list[index] || {};
      const nested = [...(current[nestedKey] || [])];
      nested.push(value);
      list[index] = { ...current, [nestedKey]: nested };
      return { ...prev, [listKey]: list };
    });
  };

  const removeNestedListItem = (listKey, index, nestedKey, nestedIndex) => {
    setContent((prev) => {
      const list = [...(prev[listKey] || [])];
      const current = list[index] || {};
      const nested = [...(current[nestedKey] || [])];
      nested.splice(nestedIndex, 1);
      list[index] = { ...current, [nestedKey]: nested };
      return { ...prev, [listKey]: list };
    });
  };

  const updateNestedObjectField = (listKey, index, nestedKey, nestedIndex, field, value) => {
    setContent((prev) => {
      const list = [...(prev[listKey] || [])];
      const current = list[index] || {};
      const nested = [...(current[nestedKey] || [])];
      const existing = nested[nestedIndex];
      const base = existing && typeof existing === 'object' ? existing : { title: existing || '' };
      nested[nestedIndex] = { ...base, [field]: value };
      list[index] = { ...current, [nestedKey]: nested };
      return { ...prev, [listKey]: list };
    });
  };

  const addNestedObjectItem = (listKey, index, nestedKey, item) => {
    setContent((prev) => {
      const list = [...(prev[listKey] || [])];
      const current = list[index] || {};
      const nested = [...(current[nestedKey] || [])];
      nested.push(item);
      list[index] = { ...current, [nestedKey]: nested };
      return { ...prev, [listKey]: list };
    });
  };

  const removeNestedObjectItem = (listKey, index, nestedKey, nestedIndex) => {
    setContent((prev) => {
      const list = [...(prev[listKey] || [])];
      const current = list[index] || {};
      const nested = [...(current[nestedKey] || [])];
      nested.splice(nestedIndex, 1);
      list[index] = { ...current, [nestedKey]: nested };
      return { ...prev, [listKey]: list };
    });
  };

  const parseCsv = (value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const formatCsv = (value) => (Array.isArray(value) ? value.join(', ') : '');

  const slugify = (value) =>
    String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const createEmptyBlock = (type) => ({
    id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    text: '',
    url: '',
    thumbnailUrl: '',
    caption: '',
    items: [],
  });

  const createResourceItem = () => ({
    id: `resource-${Date.now()}`,
    title: '',
    slug: '',
    subtitle: '',
    summary: '',
    type: '',
    duration: '',
    tags: [],
    thumbnailUrl: '',
    downloadUrl: '',
    externalUrl: '',
    content: '',
    contentBlocks: [],
  });

  const createModuleResource = () => ({
    id: `module-resource-${Date.now()}`,
    title: '',
    description: '',
    url: '',
    type: '',
  });

  const createQuizOption = () => ({
    id: `option-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: '',
    isCorrect: false,
  });

  const createQuizQuestion = () => ({
    id: `question-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: '',
    allowMultiple: false,
    options: [createQuizOption(), createQuizOption()],
  });

  const normalizeModuleQuiz = (quiz) => ({
    enabled: Boolean(quiz?.enabled),
    timeLimitMinutes: quiz?.timeLimitMinutes ?? '',
    passingScore: quiz?.passingScore ?? 70,
    questions: Array.isArray(quiz?.questions) ? quiz.questions : [],
  });

  const normalizeResourceItem = (item) => {
    if (item && typeof item === 'object') {
      return {
        ...createResourceItem(),
        ...item,
        tags: Array.isArray(item.tags) ? item.tags : [],
        contentBlocks: Array.isArray(item.contentBlocks) ? item.contentBlocks : [],
      };
    }
    const title = item || '';
    return {
      ...createResourceItem(),
      title,
      slug: slugify(title),
    };
  };

  const updateResourceItem = (categoryIndex, itemIndex, updater) => {
    setContent((prev) => {
      const categories = [...(prev.categories || [])];
      const category = { ...(categories[categoryIndex] || {}) };
      const items = [...(category.items || [])];
      const current = normalizeResourceItem(items[itemIndex]);
      items[itemIndex] = updater(current);
      category.items = items;
      categories[categoryIndex] = category;
      return { ...prev, categories };
    });
  };

  const updateResourceBlockField = (categoryIndex, itemIndex, blockIndex, field, value) => {
    updateResourceItem(categoryIndex, itemIndex, (current) => {
      const blocks = [...(current.contentBlocks || [])];
      blocks[blockIndex] = { ...blocks[blockIndex], [field]: value };
      return { ...current, contentBlocks: blocks };
    });
  };

  const moveResourceBlock = (categoryIndex, itemIndex, fromIndex, toIndex) => {
    updateResourceItem(categoryIndex, itemIndex, (current) => {
      const blocks = [...(current.contentBlocks || [])];
      if (toIndex < 0 || toIndex >= blocks.length) {
        return current;
      }
      const [moved] = blocks.splice(fromIndex, 1);
      blocks.splice(toIndex, 0, moved);
      return { ...current, contentBlocks: blocks };
    });
  };

  const addResourceBlock = (categoryIndex, itemIndex, type) => {
    updateResourceItem(categoryIndex, itemIndex, (current) => ({
      ...current,
      contentBlocks: [...(current.contentBlocks || []), createEmptyBlock(type)],
    }));
  };

  const removeResourceBlock = (categoryIndex, itemIndex, blockIndex) => {
    updateResourceItem(categoryIndex, itemIndex, (current) => {
      const blocks = [...(current.contentBlocks || [])];
      blocks.splice(blockIndex, 1);
      return { ...current, contentBlocks: blocks };
    });
  };

  const handleResourceItemUpload = async (categoryIndex, itemIndex, field, file) => {
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
      updateNestedObjectField('categories', categoryIndex, 'items', itemIndex, field, url);
      toast.success('File uploaded');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const updateModule = (courseIndex, moduleIndex, updater) => {
    setContent((prev) => {
      const courses = [...(prev.courses || [])];
      const course = { ...(courses[courseIndex] || {}) };
      const modules = [...(course.modules || [])];
      const current = modules[moduleIndex];
      const base = current && typeof current === 'object' ? current : { title: current || '' };
      modules[moduleIndex] = updater(base);
      course.modules = modules;
      courses[courseIndex] = course;
      return { ...prev, courses };
    });
  };

  const updateModuleField = (courseIndex, moduleIndex, field, value) =>
    updateModule(courseIndex, moduleIndex, (current) => ({ ...current, [field]: value }));

  const addModuleContentBlock = (courseIndex, moduleIndex, type) =>
    updateModule(courseIndex, moduleIndex, (current) => ({
      ...current,
      contentBlocks: [...(current.contentBlocks || []), createEmptyBlock(type)],
    }));

  const updateModuleContentBlockField = (courseIndex, moduleIndex, blockIndex, field, value) =>
    updateModule(courseIndex, moduleIndex, (current) => {
      const blocks = [...(current.contentBlocks || [])];
      blocks[blockIndex] = { ...blocks[blockIndex], [field]: value };
      return { ...current, contentBlocks: blocks };
    });

  const moveModuleContentBlock = (courseIndex, moduleIndex, fromIndex, toIndex) =>
    updateModule(courseIndex, moduleIndex, (current) => {
      const blocks = [...(current.contentBlocks || [])];
      if (toIndex < 0 || toIndex >= blocks.length) {
        return current;
      }
      const [moved] = blocks.splice(fromIndex, 1);
      blocks.splice(toIndex, 0, moved);
      return { ...current, contentBlocks: blocks };
    });

  const removeModuleContentBlock = (courseIndex, moduleIndex, blockIndex) =>
    updateModule(courseIndex, moduleIndex, (current) => {
      const blocks = [...(current.contentBlocks || [])];
      blocks.splice(blockIndex, 1);
      return { ...current, contentBlocks: blocks };
    });

  const addModuleResource = (courseIndex, moduleIndex) =>
    updateModule(courseIndex, moduleIndex, (current) => ({
      ...current,
      resources: [...(current.resources || []), createModuleResource()],
    }));

  const updateModuleResourceField = (courseIndex, moduleIndex, resourceIndex, field, value) =>
    updateModule(courseIndex, moduleIndex, (current) => {
      const resources = [...(current.resources || [])];
      const existing = resources[resourceIndex] || {};
      resources[resourceIndex] = { ...existing, [field]: value };
      return { ...current, resources };
    });

  const removeModuleResource = (courseIndex, moduleIndex, resourceIndex) =>
    updateModule(courseIndex, moduleIndex, (current) => {
      const resources = [...(current.resources || [])];
      resources.splice(resourceIndex, 1);
      return { ...current, resources };
    });

  const updateModuleQuizField = (courseIndex, moduleIndex, field, value) =>
    updateModule(courseIndex, moduleIndex, (current) => {
      const quiz = normalizeModuleQuiz(current.quiz);
      return { ...current, quiz: { ...quiz, [field]: value } };
    });

  const addModuleQuizQuestion = (courseIndex, moduleIndex) =>
    updateModule(courseIndex, moduleIndex, (current) => {
      const quiz = normalizeModuleQuiz(current.quiz);
      const questions = [...(quiz.questions || []), createQuizQuestion()];
      return { ...current, quiz: { ...quiz, questions } };
    });

  const removeModuleQuizQuestion = (courseIndex, moduleIndex, questionIndex) =>
    updateModule(courseIndex, moduleIndex, (current) => {
      const quiz = normalizeModuleQuiz(current.quiz);
      const questions = [...(quiz.questions || [])];
      questions.splice(questionIndex, 1);
      return { ...current, quiz: { ...quiz, questions } };
    });

  const updateModuleQuizQuestionField = (courseIndex, moduleIndex, questionIndex, field, value) =>
    updateModule(courseIndex, moduleIndex, (current) => {
      const quiz = normalizeModuleQuiz(current.quiz);
      const questions = [...(quiz.questions || [])];
      const existing = questions[questionIndex] || {};
      const question = {
        id: existing.id || `question-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        ...existing,
        [field]: value,
      };
      questions[questionIndex] = question;
      return { ...current, quiz: { ...quiz, questions } };
    });

  const addModuleQuizOption = (courseIndex, moduleIndex, questionIndex) =>
    updateModule(courseIndex, moduleIndex, (current) => {
      const quiz = normalizeModuleQuiz(current.quiz);
      const questions = [...(quiz.questions || [])];
      const existing = questions[questionIndex] || {};
      const options = [...(existing.options || []), createQuizOption()];
      questions[questionIndex] = {
        id: existing.id || `question-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        ...existing,
        options,
      };
      return { ...current, quiz: { ...quiz, questions } };
    });

  const removeModuleQuizOption = (courseIndex, moduleIndex, questionIndex, optionIndex) =>
    updateModule(courseIndex, moduleIndex, (current) => {
      const quiz = normalizeModuleQuiz(current.quiz);
      const questions = [...(quiz.questions || [])];
      const existing = questions[questionIndex] || {};
      const options = [...(existing.options || [])];
      options.splice(optionIndex, 1);
      questions[questionIndex] = { ...existing, options };
      return { ...current, quiz: { ...quiz, questions } };
    });

  const updateModuleQuizOptionField = (courseIndex, moduleIndex, questionIndex, optionIndex, field, value) =>
    updateModule(courseIndex, moduleIndex, (current) => {
      const quiz = normalizeModuleQuiz(current.quiz);
      const questions = [...(quiz.questions || [])];
      const existing = questions[questionIndex] || {};
      const options = [...(existing.options || [])];
      const currentOption = options[optionIndex] || {};
      options[optionIndex] = {
        id: currentOption.id || `option-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        ...currentOption,
        [field]: value,
      };
      questions[questionIndex] = { ...existing, options };
      return { ...current, quiz: { ...quiz, questions } };
    });

  const handleModuleResourceUpload = async (courseIndex, moduleIndex, resourceIndex, field, file) => {
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
      updateModuleResourceField(courseIndex, moduleIndex, resourceIndex, field, url);
      toast.success('File uploaded');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleModuleContentBlockUpload = async (courseIndex, moduleIndex, blockIndex, file, options = {}) => {
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
      updateModuleContentBlockField(courseIndex, moduleIndex, blockIndex, urlField, url);
      if (setCaption) {
        updateModuleContentBlockField(courseIndex, moduleIndex, blockIndex, captionField, file.name);
      }
      toast.success('File uploaded');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleResourceBlockUpload = async (categoryIndex, itemIndex, blockIndex, file, options = {}) => {
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
      updateResourceBlockField(categoryIndex, itemIndex, blockIndex, urlField, url);
      if (setCaption) {
        updateResourceBlockField(categoryIndex, itemIndex, blockIndex, captionField, file.name);
      }
      toast.success('File uploaded');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const stats = Array.isArray(content.stats) ? content.stats : [];
  const pathways = Array.isArray(content.pathways) ? content.pathways : [];
  const courses = Array.isArray(content.courses) ? content.courses : [];
  const resourceCategories = Array.isArray(content.categories) ? content.categories : [];
  const policyStats = Array.isArray(content.stats) ? content.stats : [];
  const policies = Array.isArray(content.policies) ? content.policies : [];

  const renderOverviewEditor = () => (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Hero Content</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
            <input
              type="text"
              value={content.title || ''}
              onChange={(event) => updateContentField('title', event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pathway Section Title</label>
            <input
              type="text"
              value={content.pathwayTitle || ''}
              onChange={(event) => updateContentField('pathwayTitle', event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Recommended Learning Pathways"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={3}
            value={content.description || ''}
            onChange={(event) => updateContentField('description', event.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Highlight Stats</h3>
          <button
            onClick={() => addListItem('stats', { label: '', value: '', icon: 'BookOpen' })}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add stat
          </button>
        </div>
        {stats.length === 0 ? (
          <p className="text-sm text-gray-500">No stats yet. Add one to highlight key numbers.</p>
        ) : (
          <div className="space-y-4">
            {stats.map((stat, index) => (
              <div key={stat.id || index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">Stat {index + 1}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveListItem('stats', index, -1)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveListItem('stats', index, 1)}
                      disabled={index === stats.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeListItem('stats', index)}
                      className="p-1 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={stat.label || ''}
                    onChange={(event) => updateListItemField('stats', index, 'label', event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Label"
                  />
                  <input
                    type="text"
                    value={stat.value || ''}
                    onChange={(event) => updateListItemField('stats', index, 'value', event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Value"
                  />
                  <input
                    type="text"
                    value={stat.icon || ''}
                    onChange={(event) => updateListItemField('stats', index, 'icon', event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Icon name"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Learning Pathways</h3>
          <button
            onClick={() =>
              addListItem('pathways', {
                id: `pathway-${Date.now()}`,
                title: '',
                emoji: '✨',
                description: '',
                steps: [],
                estimatedTime: '',
                theme: 'blue',
              })
            }
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add pathway
          </button>
        </div>
        {pathways.length === 0 ? (
          <p className="text-sm text-gray-500">Add pathways to guide teachers through your curriculum.</p>
        ) : (
          <div className="space-y-4">
            {pathways.map((pathway, index) => (
              <div key={pathway.id || index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">Pathway {index + 1}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveListItem('pathways', index, -1)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveListItem('pathways', index, 1)}
                      disabled={index === pathways.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeListItem('pathways', index)}
                      className="p-1 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={pathway.title || ''}
                    onChange={(event) => updateListItemField('pathways', index, 'title', event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Pathway title"
                  />
                  <input
                    type="text"
                    value={pathway.emoji || ''}
                    onChange={(event) => updateListItemField('pathways', index, 'emoji', event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Emoji or label"
                  />
                  <select
                    value={pathway.theme || 'blue'}
                    onChange={(event) => updateListItemField('pathways', index, 'theme', event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="green">Green</option>
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                    <option value="orange">Orange</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  value={pathway.description || ''}
                  onChange={(event) => updateListItemField('pathways', index, 'description', event.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Describe this pathway"
                />
                <input
                  type="text"
                  value={pathway.estimatedTime || ''}
                  onChange={(event) => updateListItemField('pathways', index, 'estimatedTime', event.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Estimated time"
                />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">Steps</p>
                    <button
                      type="button"
                      onClick={() => addNestedListItem('pathways', index, 'steps', '')}
                      className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-3 w-3" />
                      Add step
                    </button>
                  </div>
                  {(pathway.steps || []).map((step, stepIndex) => (
                    <div key={`${pathway.id || index}-step-${stepIndex}`} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={step}
                        onChange={(event) =>
                          updateNestedListItem('pathways', index, 'steps', stepIndex, event.target.value)
                        }
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                        placeholder={`Step ${stepIndex + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeNestedListItem('pathways', index, 'steps', stepIndex)}
                        className="p-1 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  const renderCoursesEditor = () => (
    <div className="space-y-8">
      <section className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Section Title</label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(event) => updateContentField('title', event.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Courses</h3>
          <button
            type="button"
            onClick={() =>
              addListItem('courses', {
                id: `course-${Date.now()}`,
                title: '',
                description: '',
                category: '',
                difficulty: 'beginner',
                estimatedHours: 1,
                prerequisites: [],
                modules: [],
                certificationRequired: false,
              })
            }
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add course
          </button>
        </div>
        {courses.length === 0 ? (
          <p className="text-sm text-gray-500">Add a course to populate the catalog.</p>
        ) : (
          <div className="space-y-4">
            {courses.map((course, index) => {
              const modules = Array.isArray(course.modules) ? course.modules : [];
              return (
                <div key={course.id || index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">Course {index + 1}</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveListItem('courses', index, -1)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveListItem('courses', index, 1)}
                        disabled={index === courses.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeListItem('courses', index)}
                        className="p-1 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={course.title || ''}
                      onChange={(event) => updateListItemField('courses', index, 'title', event.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Course title"
                    />
                    <input
                      type="text"
                      value={course.category || ''}
                      onChange={(event) => updateListItemField('courses', index, 'category', event.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Category"
                    />
                    <select
                      value={course.difficulty || 'beginner'}
                      onChange={(event) => updateListItemField('courses', index, 'difficulty', event.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={course.estimatedHours ?? ''}
                      onChange={(event) =>
                        updateListItemField('courses', index, 'estimatedHours', Number(event.target.value))
                      }
                      className="border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Estimated hours"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={course.description || ''}
                    onChange={(event) => updateListItemField('courses', index, 'description', event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Course description"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(course.certificationRequired)}
                      onChange={(event) =>
                        updateListItemField('courses', index, 'certificationRequired', event.target.checked)
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-gray-600">Certification required</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prerequisites (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formatCsv(course.prerequisites)}
                      onChange={(event) =>
                        updateListItemField('courses', index, 'prerequisites', parseCsv(event.target.value))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="spatial-audio-intro, ai-composition-basics"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600">Modules</p>
                      <button
                        type="button"
                        onClick={() =>
                          addNestedObjectItem('courses', index, 'modules', {
                            id: `module-${Date.now()}`,
                            title: '',
                            description: '',
                            duration: 30,
                            type: 'lesson',
                            content: '',
                            contentBlocks: [],
                            resources: [],
                            quiz: {
                              enabled: false,
                              timeLimitMinutes: '',
                              passingScore: 70,
                              questions: [],
                            },
                          })
                        }
                        className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="h-3 w-3" />
                        Add module
                      </button>
                    </div>
                    {modules.length === 0 ? (
                      <p className="text-xs text-gray-500">No modules added yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {modules.map((module, moduleIndex) => {
                          const moduleBlocks = Array.isArray(module.contentBlocks) ? module.contentBlocks : [];
                          const moduleResources = Array.isArray(module.resources) ? module.resources : [];
                          const moduleQuiz = normalizeModuleQuiz(module.quiz);

                          return (
                            <div
                              key={module.id || moduleIndex}
                              className="border border-gray-200 rounded-lg p-4 space-y-4"
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-gray-600">Module {moduleIndex + 1}</p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeNestedObjectItem('courses', index, 'modules', moduleIndex)
                                  }
                                  className="p-1 text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                  type="text"
                                  value={module.title || ''}
                                  onChange={(event) =>
                                    updateModuleField(index, moduleIndex, 'title', event.target.value)
                                  }
                                  className="border border-gray-300 rounded-lg px-3 py-2"
                                  placeholder="Module title"
                                />
                                <input
                                  type="number"
                                  min="1"
                                  value={module.duration ?? ''}
                                  onChange={(event) => {
                                    const nextValue = event.target.value;
                                    updateModuleField(
                                      index,
                                      moduleIndex,
                                      'duration',
                                      nextValue === '' ? '' : Number(nextValue)
                                    );
                                  }}
                                  className="border border-gray-300 rounded-lg px-3 py-2"
                                  placeholder="Minutes"
                                />
                                <select
                                  value={module.type || 'lesson'}
                                  onChange={(event) =>
                                    updateModuleField(index, moduleIndex, 'type', event.target.value)
                                  }
                                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                                >
                                  <option value="lesson">Lesson</option>
                                  <option value="practical">Practical</option>
                                  <option value="quiz">Quiz</option>
                                  <option value="assignment">Assignment</option>
                                </select>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={module.slug || ''}
                                  onChange={(event) =>
                                    updateModuleField(index, moduleIndex, 'slug', event.target.value)
                                  }
                                  className="border border-gray-300 rounded-lg px-3 py-2"
                                  placeholder="Slug (optional)"
                                />
                                <input
                                  type="text"
                                  value={module.description || ''}
                                  onChange={(event) =>
                                    updateModuleField(index, moduleIndex, 'description', event.target.value)
                                  }
                                  className="border border-gray-300 rounded-lg px-3 py-2"
                                  placeholder="Short description"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Module Content (Markdown)</label>
                                <textarea
                                  rows={4}
                                  value={module.content || ''}
                                  onChange={(event) =>
                                    updateModuleField(index, moduleIndex, 'content', event.target.value)
                                  }
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                  placeholder="Module content shown on the detail page"
                                />
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-600">Module Content Blocks</p>
                                  <div className="flex flex-wrap gap-2">
                                    {['heading', 'subheading', 'paragraph', 'list', 'link', 'image', 'video', 'pdf'].map((type) => (
                                      <button
                                        key={type}
                                        type="button"
                                        onClick={() => addModuleContentBlock(index, moduleIndex, type)}
                                        className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                                      >
                                        <Plus className="h-3 w-3" />
                                        {type}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                {moduleBlocks.length === 0 && (
                                  <p className="text-sm text-gray-500">Add content blocks to build this module.</p>
                                )}
                                {moduleBlocks.map((block, blockIndex) => (
                                  <div
                                    key={block.id || `${block.type}-${blockIndex}`}
                                    className="border border-gray-200 rounded-lg p-4"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-sm font-medium text-gray-800">{block.type.toUpperCase()}</span>
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            moveModuleContentBlock(index, moduleIndex, blockIndex, blockIndex - 1)
                                          }
                                          disabled={blockIndex === 0}
                                          className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40"
                                        >
                                          <ArrowUp className="h-4 w-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            moveModuleContentBlock(index, moduleIndex, blockIndex, blockIndex + 1)
                                          }
                                          disabled={blockIndex === moduleBlocks.length - 1}
                                          className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40"
                                        >
                                          <ArrowDown className="h-4 w-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => removeModuleContentBlock(index, moduleIndex, blockIndex)}
                                          className="text-xs text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>

                                    {['heading', 'subheading', 'paragraph'].includes(block.type) && (
                                      <textarea
                                        rows={block.type === 'paragraph' ? 3 : 2}
                                        value={block.text || ''}
                                        onChange={(event) =>
                                          updateModuleContentBlockField(
                                            index,
                                            moduleIndex,
                                            blockIndex,
                                            'text',
                                            event.target.value
                                          )
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder={`Enter ${block.type} text`}
                                      />
                                    )}

                                    {block.type === 'list' && (
                                      <textarea
                                        rows={4}
                                        value={Array.isArray(block.items) ? block.items.join('\n') : ''}
                                        onChange={(event) =>
                                          updateModuleContentBlockField(
                                            index,
                                            moduleIndex,
                                            blockIndex,
                                            'items',
                                            event.target.value
                                              .split('\n')
                                              .map((itemValue) => itemValue.trim())
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
                                          value={block.url || ''}
                                          onChange={(event) =>
                                            updateModuleContentBlockField(
                                              index,
                                              moduleIndex,
                                              blockIndex,
                                              'url',
                                              event.target.value
                                            )
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                          placeholder="Paste link URL (https://...)"
                                        />
                                        <input
                                          type="text"
                                          value={block.caption || ''}
                                          onChange={(event) =>
                                            updateModuleContentBlockField(
                                              index,
                                              moduleIndex,
                                              blockIndex,
                                              'caption',
                                              event.target.value
                                            )
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                          placeholder="Link text (optional)"
                                        />
                                        <textarea
                                          rows={2}
                                          value={block.text || ''}
                                          onChange={(event) =>
                                            updateModuleContentBlockField(
                                              index,
                                              moduleIndex,
                                              blockIndex,
                                              'text',
                                              event.target.value
                                            )
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                          placeholder="Short description"
                                        />
                                      </div>
                                    )}

                                    {['image', 'video', 'pdf'].includes(block.type) && (
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                          <input
                                            type="text"
                                            value={block.url || ''}
                                            onChange={(event) =>
                                              updateModuleContentBlockField(
                                                index,
                                                moduleIndex,
                                                blockIndex,
                                                'url',
                                                event.target.value
                                              )
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            placeholder={`Paste ${block.type} URL or upload`}
                                          />
                                          <label className="inline-flex items-center gap-2 text-xs bg-gray-100 px-3 py-2 rounded-lg cursor-pointer">
                                            <Upload className="h-4 w-4" />
                                            Upload
                                            <input
                                              type="file"
                                              accept={
                                                block.type === 'image'
                                                  ? 'image/*'
                                                  : block.type === 'video'
                                                    ? 'video/*'
                                                    : 'application/pdf'
                                              }
                                              onChange={(event) =>
                                                handleModuleContentBlockUpload(
                                                  index,
                                                  moduleIndex,
                                                  blockIndex,
                                                  event.target.files?.[0]
                                                )
                                              }
                                              className="hidden"
                                              disabled={uploading}
                                            />
                                          </label>
                                        </div>
                                        <input
                                          type="text"
                                          value={block.caption || ''}
                                          onChange={(event) =>
                                            updateModuleContentBlockField(
                                              index,
                                              moduleIndex,
                                              blockIndex,
                                              'caption',
                                              event.target.value
                                            )
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                          placeholder="Caption (optional)"
                                        />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-600">Module Resources</p>
                                  <button
                                    type="button"
                                    onClick={() => addModuleResource(index, moduleIndex)}
                                    className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700"
                                  >
                                    <Plus className="h-3 w-3" />
                                    Add resource
                                  </button>
                                </div>
                                {moduleResources.length === 0 ? (
                                  <p className="text-sm text-gray-500">No resources added yet.</p>
                                ) : (
                                  <div className="space-y-3">
                                    {moduleResources.map((resource, resourceIndex) => (
                                      <div
                                        key={resource.id || resourceIndex}
                                        className="border border-gray-200 rounded-lg p-3 space-y-3"
                                      >
                                        <div className="flex items-center justify-between">
                                          <p className="text-xs font-medium text-gray-500">
                                            Resource {resourceIndex + 1}
                                          </p>
                                          <button
                                            type="button"
                                            onClick={() => removeModuleResource(index, moduleIndex, resourceIndex)}
                                            className="p-1 text-red-500 hover:text-red-600"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <input
                                            type="text"
                                            value={resource.title || ''}
                                            onChange={(event) =>
                                              updateModuleResourceField(
                                                index,
                                                moduleIndex,
                                                resourceIndex,
                                                'title',
                                                event.target.value
                                              )
                                            }
                                            className="border border-gray-300 rounded-lg px-3 py-2"
                                            placeholder="Resource title"
                                          />
                                          <input
                                            type="text"
                                            value={resource.type || ''}
                                            onChange={(event) =>
                                              updateModuleResourceField(
                                                index,
                                                moduleIndex,
                                                resourceIndex,
                                                'type',
                                                event.target.value
                                              )
                                            }
                                            className="border border-gray-300 rounded-lg px-3 py-2"
                                            placeholder="Type (pdf, video, link)"
                                          />
                                        </div>
                                        <textarea
                                          rows={2}
                                          value={resource.description || ''}
                                          onChange={(event) =>
                                            updateModuleResourceField(
                                              index,
                                              moduleIndex,
                                              resourceIndex,
                                              'description',
                                              event.target.value
                                            )
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                          placeholder="Resource description"
                                        />
                                        <div className="flex items-center gap-3">
                                          <input
                                            type="text"
                                            value={resource.url || ''}
                                            onChange={(event) =>
                                              updateModuleResourceField(
                                                index,
                                                moduleIndex,
                                                resourceIndex,
                                                'url',
                                                event.target.value
                                              )
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            placeholder="Resource URL"
                                          />
                                          <label className="inline-flex items-center gap-2 text-xs bg-gray-100 px-3 py-2 rounded-lg cursor-pointer">
                                            <Upload className="h-4 w-4" />
                                            Upload
                                            <input
                                              type="file"
                                              accept="image/*,video/*,application/pdf"
                                              onChange={(event) =>
                                                handleModuleResourceUpload(
                                                  index,
                                                  moduleIndex,
                                                  resourceIndex,
                                                  'url',
                                                  event.target.files?.[0]
                                                )
                                              }
                                              className="hidden"
                                              disabled={uploading}
                                            />
                                          </label>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(moduleQuiz.enabled)}
                                      onChange={(event) =>
                                        updateModuleQuizField(index, moduleIndex, 'enabled', event.target.checked)
                                      }
                                      className="h-4 w-4"
                                    />
                                    <span className="text-sm font-medium text-gray-600">Enable quiz</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => addModuleQuizQuestion(index, moduleIndex)}
                                    className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700"
                                  >
                                    <Plus className="h-3 w-3" />
                                    Add question
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <input
                                    type="number"
                                    min="0"
                                    value={moduleQuiz.timeLimitMinutes ?? ''}
                                    onChange={(event) => {
                                      const nextValue = event.target.value;
                                      updateModuleQuizField(
                                        index,
                                        moduleIndex,
                                        'timeLimitMinutes',
                                        nextValue === '' ? '' : Number(nextValue)
                                      );
                                    }}
                                    className="border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder="Time limit (minutes)"
                                  />
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={moduleQuiz.passingScore ?? ''}
                                    onChange={(event) => {
                                      const nextValue = event.target.value;
                                      updateModuleQuizField(
                                        index,
                                        moduleIndex,
                                        'passingScore',
                                        nextValue === '' ? '' : Number(nextValue)
                                      );
                                    }}
                                    className="border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder="Passing score (%)"
                                  />
                                </div>
                                {moduleQuiz.questions.length === 0 ? (
                                  <p className="text-sm text-gray-500">Add quiz questions to enable grading.</p>
                                ) : (
                                  <div className="space-y-4">
                                    {moduleQuiz.questions.map((question, questionIndex) => (
                                      <div
                                        key={question.id || questionIndex}
                                        className="border border-gray-200 rounded-lg p-3 space-y-3"
                                      >
                                        <div className="flex items-center justify-between">
                                          <p className="text-xs font-medium text-gray-500">
                                            Question {questionIndex + 1}
                                          </p>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              removeModuleQuizQuestion(index, moduleIndex, questionIndex)
                                            }
                                            className="p-1 text-red-500 hover:text-red-600"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                        <textarea
                                          rows={2}
                                          value={question.text || ''}
                                          onChange={(event) =>
                                            updateModuleQuizQuestionField(
                                              index,
                                              moduleIndex,
                                              questionIndex,
                                              'text',
                                              event.target.value
                                            )
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                          placeholder="Question text"
                                        />
                                        <label className="flex items-center gap-2 text-xs text-gray-600">
                                          <input
                                            type="checkbox"
                                            checked={Boolean(question.allowMultiple)}
                                            onChange={(event) =>
                                              updateModuleQuizQuestionField(
                                                index,
                                                moduleIndex,
                                                questionIndex,
                                                'allowMultiple',
                                                event.target.checked
                                              )
                                            }
                                            className="h-4 w-4"
                                          />
                                          Allow multiple selections
                                        </label>
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <p className="text-xs font-medium text-gray-500">Options</p>
                                            <button
                                              type="button"
                                              onClick={() => addModuleQuizOption(index, moduleIndex, questionIndex)}
                                              className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700"
                                            >
                                              <Plus className="h-3 w-3" />
                                              Add option
                                            </button>
                                          </div>
                                          {(question.options || []).length === 0 ? (
                                            <p className="text-xs text-gray-500">Add options for this question.</p>
                                          ) : (
                                            <div className="space-y-2">
                                              {(question.options || []).map((option, optionIndex) => (
                                                <div
                                                  key={option.id || optionIndex}
                                                  className="border border-gray-200 rounded-lg p-3 space-y-2"
                                                >
                                                  <div className="flex items-center justify-between">
                                                    <p className="text-xs text-gray-500">Option {optionIndex + 1}</p>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        removeModuleQuizOption(
                                                          index,
                                                          moduleIndex,
                                                          questionIndex,
                                                          optionIndex
                                                        )
                                                      }
                                                      className="p-1 text-red-500 hover:text-red-600"
                                                    >
                                                      <Trash2 className="h-4 w-4" />
                                                    </button>
                                                  </div>
                                                  <input
                                                    type="text"
                                                    value={option.text || ''}
                                                    onChange={(event) =>
                                                      updateModuleQuizOptionField(
                                                        index,
                                                        moduleIndex,
                                                        questionIndex,
                                                        optionIndex,
                                                        'text',
                                                        event.target.value
                                                      )
                                                    }
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                                    placeholder="Option text"
                                                  />
                                                  <label className="flex items-center gap-2 text-xs text-gray-600">
                                                    <input
                                                      type="checkbox"
                                                      checked={Boolean(option.isCorrect)}
                                                      onChange={(event) =>
                                                        updateModuleQuizOptionField(
                                                          index,
                                                          moduleIndex,
                                                          questionIndex,
                                                          optionIndex,
                                                          'isCorrect',
                                                          event.target.checked
                                                        )
                                                      }
                                                      className="h-4 w-4"
                                                    />
                                                    Mark as correct
                                                  </label>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );

  const renderResourcesEditor = () => (
    <div className="space-y-8">
      <section className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Section Title</label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(event) => updateContentField('title', event.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Resource Categories</h3>
          <button
            type="button"
            onClick={() =>
              addListItem('categories', {
                id: `category-${Date.now()}`,
                title: '',
                description: '',
                icon: 'FileText',
                items: [],
              })
            }
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add category
          </button>
        </div>
        {resourceCategories.length === 0 ? (
          <p className="text-sm text-gray-500">Add categories to organize resources.</p>
        ) : (
          <div className="space-y-4">
            {resourceCategories.map((category, index) => (
              <div key={category.id || index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">Category {index + 1}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveListItem('categories', index, -1)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveListItem('categories', index, 1)}
                      disabled={index === resourceCategories.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeListItem('categories', index)}
                      className="p-1 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={category.title || ''}
                    onChange={(event) => updateListItemField('categories', index, 'title', event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Category title"
                  />
                  <input
                    type="text"
                    value={category.icon || ''}
                    onChange={(event) => updateListItemField('categories', index, 'icon', event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Icon name"
                  />
                </div>
                <textarea
                  rows={2}
                  value={category.description || ''}
                  onChange={(event) => updateListItemField('categories', index, 'description', event.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Describe this category"
                />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">Items</p>
                    <button
                      type="button"
                      onClick={() =>
                        addNestedObjectItem('categories', index, 'items', createResourceItem())
                      }
                      className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-3 w-3" />
                      Add item
                    </button>
                  </div>
                  {(category.items || []).length === 0 ? (
                    <p className="text-sm text-gray-500">No items yet. Add one to populate this category.</p>
                  ) : (
                    (category.items || []).map((item, itemIndex) => {
                      const normalizedItem = normalizeResourceItem(item);
                      const contentBlocks = normalizedItem.contentBlocks || [];

                      return (
                        <div
                          key={`${category.id || index}-item-${itemIndex}`}
                          className="border border-gray-200 rounded-lg p-3 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-500">Item {itemIndex + 1}</p>
                            <button
                              type="button"
                              onClick={() => removeNestedObjectItem('categories', index, 'items', itemIndex)}
                              className="p-1 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={normalizedItem.title || ''}
                              onChange={(event) =>
                                updateResourceItem(index, itemIndex, (current) => ({
                                  ...current,
                                  title: event.target.value,
                                }))
                              }
                              onBlur={(event) => {
                                if (!normalizedItem.slug && event.target.value) {
                                  updateResourceItem(index, itemIndex, (current) => ({
                                    ...current,
                                    slug: slugify(event.target.value),
                                  }));
                                }
                              }}
                              className="border border-gray-300 rounded-lg px-3 py-2"
                              placeholder="Item title"
                            />
                            <input
                              type="text"
                              value={normalizedItem.slug || ''}
                              onChange={(event) =>
                                updateResourceItem(index, itemIndex, (current) => ({
                                  ...current,
                                  slug: event.target.value,
                                }))
                              }
                              className="border border-gray-300 rounded-lg px-3 py-2"
                              placeholder="Slug (used in URL)"
                            />
                          </div>
                          <input
                            type="text"
                            value={normalizedItem.subtitle || ''}
                            onChange={(event) =>
                              updateResourceItem(index, itemIndex, (current) => ({
                                ...current,
                                subtitle: event.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="Subtitle (optional)"
                          />
                          <textarea
                            rows={2}
                            value={normalizedItem.summary || ''}
                            onChange={(event) =>
                              updateResourceItem(index, itemIndex, (current) => ({
                                ...current,
                                summary: event.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="Short summary"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                              type="text"
                              value={normalizedItem.type || ''}
                              onChange={(event) =>
                                updateResourceItem(index, itemIndex, (current) => ({
                                  ...current,
                                  type: event.target.value,
                                }))
                              }
                              className="border border-gray-300 rounded-lg px-3 py-2"
                              placeholder="Type (lesson, rubric)"
                            />
                            <input
                              type="number"
                              min="0"
                              value={normalizedItem.duration ?? ''}
                              onChange={(event) => {
                                const nextValue = event.target.value;
                                updateResourceItem(index, itemIndex, (current) => ({
                                  ...current,
                                  duration: nextValue === '' ? '' : Number(nextValue),
                                }));
                              }}
                              className="border border-gray-300 rounded-lg px-3 py-2"
                              placeholder="Minutes"
                            />
                            <input
                              type="text"
                              value={formatCsv(normalizedItem.tags)}
                              onChange={(event) =>
                                updateResourceItem(index, itemIndex, (current) => ({
                                  ...current,
                                  tags: parseCsv(event.target.value),
                                }))
                              }
                              className="border border-gray-300 rounded-lg px-3 py-2"
                              placeholder="Tags (comma separated)"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Download file</label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="text"
                                  value={normalizedItem.downloadUrl || ''}
                                  onChange={(event) =>
                                    updateResourceItem(index, itemIndex, (current) => ({
                                      ...current,
                                      downloadUrl: event.target.value,
                                    }))
                                  }
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                  placeholder="Download URL (PDF or file)"
                                />
                                <label className="inline-flex items-center gap-2 text-xs bg-gray-100 px-3 py-2 rounded-lg cursor-pointer">
                                  <Upload className="h-4 w-4" />
                                  Upload
                                  <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(event) =>
                                      handleResourceItemUpload(index, itemIndex, 'downloadUrl', event.target.files?.[0])
                                    }
                                    className="hidden"
                                    disabled={uploading}
                                  />
                                </label>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">External URL</label>
                              <input
                                type="text"
                                value={normalizedItem.externalUrl || ''}
                                onChange={(event) =>
                                  updateResourceItem(index, itemIndex, (current) => ({
                                    ...current,
                                    externalUrl: event.target.value,
                                  }))
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                placeholder="External URL"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Thumbnail Image</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="text"
                                value={normalizedItem.thumbnailUrl || ''}
                                onChange={(event) =>
                                  updateResourceItem(index, itemIndex, (current) => ({
                                    ...current,
                                    thumbnailUrl: event.target.value,
                                  }))
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                placeholder="Paste image URL or upload"
                              />
                              <label className="inline-flex items-center gap-2 text-xs bg-gray-100 px-3 py-2 rounded-lg cursor-pointer">
                                <Upload className="h-4 w-4" />
                                Upload
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(event) =>
                                    handleResourceItemUpload(index, itemIndex, 'thumbnailUrl', event.target.files?.[0])
                                  }
                                  className="hidden"
                                  disabled={uploading}
                                />
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Content (Markdown)</label>
                            <textarea
                              rows={4}
                              value={normalizedItem.content || ''}
                              onChange={(event) =>
                                updateResourceItem(index, itemIndex, (current) => ({
                                  ...current,
                                  content: event.target.value,
                                }))
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              placeholder="Markdown content shown on the detail page"
                            />
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-600">Content Blocks</p>
                              <div className="flex flex-wrap gap-2">
                                {['heading', 'subheading', 'paragraph', 'list', 'link', 'image', 'video', 'pdf'].map((type) => (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => addResourceBlock(index, itemIndex, type)}
                                    className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                                  >
                                    <Plus className="h-3 w-3" />
                                    {type}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {contentBlocks.length === 0 && (
                              <p className="text-sm text-gray-500">Add content blocks to build the resource page.</p>
                            )}
                            {contentBlocks.map((block, blockIndex) => (
                              <div
                                key={block.id || `${block.type}-${blockIndex}`}
                                className="border border-gray-200 rounded-lg p-4"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-medium text-gray-800">{block.type.toUpperCase()}</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => moveResourceBlock(index, itemIndex, blockIndex, blockIndex - 1)}
                                      disabled={blockIndex === 0}
                                      className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40"
                                    >
                                      <ArrowUp className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveResourceBlock(index, itemIndex, blockIndex, blockIndex + 1)}
                                      disabled={blockIndex === contentBlocks.length - 1}
                                      className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40"
                                    >
                                      <ArrowDown className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeResourceBlock(index, itemIndex, blockIndex)}
                                      className="text-xs text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>

                                {['heading', 'subheading', 'paragraph'].includes(block.type) && (
                                  <textarea
                                    rows={block.type === 'paragraph' ? 3 : 2}
                                    value={block.text || ''}
                                    onChange={(event) =>
                                      updateResourceBlockField(index, itemIndex, blockIndex, 'text', event.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder={`Enter ${block.type} text`}
                                  />
                                )}

                                {block.type === 'list' && (
                                  <textarea
                                    rows={4}
                                    value={Array.isArray(block.items) ? block.items.join('\n') : ''}
                                    onChange={(event) =>
                                      updateResourceBlockField(
                                        index,
                                        itemIndex,
                                        blockIndex,
                                        'items',
                                        event.target.value
                                          .split('\n')
                                          .map((itemValue) => itemValue.trim())
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
                                      value={block.url || ''}
                                      onChange={(event) =>
                                        updateResourceBlockField(index, itemIndex, blockIndex, 'url', event.target.value)
                                      }
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                      placeholder="Paste link URL (https://...)"
                                    />
                                    <input
                                      type="text"
                                      value={block.caption || ''}
                                      onChange={(event) =>
                                        updateResourceBlockField(index, itemIndex, blockIndex, 'caption', event.target.value)
                                      }
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                      placeholder="Link text (optional)"
                                    />
                                    <textarea
                                      rows={2}
                                      value={block.text || ''}
                                      onChange={(event) =>
                                        updateResourceBlockField(index, itemIndex, blockIndex, 'text', event.target.value)
                                      }
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                      placeholder="Description (optional)"
                                    />
                                  </div>
                                )}

                                {['image', 'pdf'].includes(block.type) && (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={block.url || ''}
                                      onChange={(event) =>
                                        updateResourceBlockField(index, itemIndex, blockIndex, 'url', event.target.value)
                                      }
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                      placeholder="Paste a file URL or upload"
                                    />
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="text"
                                        value={block.caption || ''}
                                        onChange={(event) =>
                                          updateResourceBlockField(index, itemIndex, blockIndex, 'caption', event.target.value)
                                        }
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="Caption (optional)"
                                      />
                                      <label className="inline-flex items-center gap-2 text-xs bg-gray-100 px-3 py-2 rounded-lg cursor-pointer">
                                        <Upload className="h-4 w-4" />
                                        Upload
                                        <input
                                          type="file"
                                          accept={block.type === 'image' ? 'image/*' : 'application/pdf'}
                                          onChange={(event) =>
                                            handleResourceBlockUpload(
                                              index,
                                              itemIndex,
                                              blockIndex,
                                              event.target.files?.[0]
                                            )
                                          }
                                          className="hidden"
                                          disabled={uploading}
                                        />
                                      </label>
                                    </div>
                                    {block.type === 'pdf' && (
                                      <div className="flex items-center gap-3">
                                        <input
                                          type="text"
                                          value={block.thumbnailUrl || ''}
                                          onChange={(event) =>
                                            updateResourceBlockField(
                                              index,
                                              itemIndex,
                                              blockIndex,
                                              'thumbnailUrl',
                                              event.target.value
                                            )
                                          }
                                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                                          placeholder="PDF thumbnail URL (optional)"
                                        />
                                        <label className="inline-flex items-center gap-2 text-xs bg-gray-100 px-3 py-2 rounded-lg cursor-pointer">
                                          <Upload className="h-4 w-4" />
                                          Upload thumbnail
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) =>
                                              handleResourceBlockUpload(
                                                index,
                                                itemIndex,
                                                blockIndex,
                                                event.target.files?.[0],
                                                { urlField: 'thumbnailUrl', setCaption: false }
                                              )
                                            }
                                            className="hidden"
                                            disabled={uploading}
                                          />
                                        </label>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {block.type === 'video' && (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={block.url || ''}
                                      onChange={(event) =>
                                        updateResourceBlockField(index, itemIndex, blockIndex, 'url', event.target.value)
                                      }
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                      placeholder="Paste video link (YouTube, Vimeo, etc.)"
                                    />
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="text"
                                        value={block.thumbnailUrl || ''}
                                        onChange={(event) =>
                                          updateResourceBlockField(
                                            index,
                                            itemIndex,
                                            blockIndex,
                                            'thumbnailUrl',
                                            event.target.value
                                          )
                                        }
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="Video thumbnail URL (optional)"
                                      />
                                      <label className="inline-flex items-center gap-2 text-xs bg-gray-100 px-3 py-2 rounded-lg cursor-pointer">
                                        <Upload className="h-4 w-4" />
                                        Upload
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(event) =>
                                            handleResourceBlockUpload(
                                              index,
                                              itemIndex,
                                              blockIndex,
                                              event.target.files?.[0],
                                              { urlField: 'thumbnailUrl', setCaption: false }
                                            )
                                          }
                                          className="hidden"
                                          disabled={uploading}
                                        />
                                      </label>
                                    </div>
                                    <input
                                      type="text"
                                      value={block.caption || ''}
                                      onChange={(event) =>
                                        updateResourceBlockField(index, itemIndex, blockIndex, 'caption', event.target.value)
                                      }
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                      placeholder="Caption (optional)"
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  const renderPoliciesEditor = () => (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
          <input
            type="text"
            value={content.title || ''}
            onChange={(event) => updateContentField('title', event.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
          <textarea
            rows={2}
            value={content.subtitle || ''}
            onChange={(event) => updateContentField('subtitle', event.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Stats Cards</h3>
          <button
            type="button"
            onClick={() => addListItem('stats', { label: '', value: '', icon: 'FileText', color: '', bg: '' })}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add stat
          </button>
        </div>
        {policyStats.length === 0 ? (
          <p className="text-sm text-gray-500">Add stats to summarize policy impact.</p>
        ) : (
          <div className="space-y-4">
            {policyStats.map((stat, index) => (
              <div key={stat.id || index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">Stat {index + 1}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveListItem('stats', index, -1)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveListItem('stats', index, 1)}
                      disabled={index === policyStats.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeListItem('stats', index)}
                      className="p-1 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={stat.label || ''}
                    onChange={(event) => updateListItemField('stats', index, 'label', event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Label"
                  />
                  <input
                    type="text"
                    value={stat.value || ''}
                    onChange={(event) => updateListItemField('stats', index, 'value', event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Value"
                  />
                  <input
                    type="text"
                    value={stat.icon || ''}
                    onChange={(event) => updateListItemField('stats', index, 'icon', event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Icon name"
                  />
                  <input
                    type="text"
                    value={stat.bg || ''}
                    onChange={(event) => updateListItemField('stats', index, 'bg', event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Background class"
                  />
                  <input
                    type="text"
                    value={stat.color || ''}
                    onChange={(event) => updateListItemField('stats', index, 'color', event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Text color class"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Policy Entries</h3>
          <button
            type="button"
            onClick={() =>
              addListItem('policies', {
                id: `policy-${Date.now()}`,
                title: '',
                slug: '',
                description: '',
                category: '',
                scope: 'national',
                status: 'draft',
                universities: '',
                studentsReached: '',
                budget: '',
                startDate: '',
                keyPoints: [],
                content: '',
              })
            }
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add policy
          </button>
        </div>
        {policies.length === 0 ? (
          <p className="text-sm text-gray-500">Add policy entries to highlight initiatives.</p>
        ) : (
          <div className="space-y-4">
            {policies.map((policy, index) => {
              const keyPoints = Array.isArray(policy.keyPoints) ? policy.keyPoints : [];

              return (
                <div key={policy.id || index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">Policy {index + 1}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveListItem('policies', index, -1)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveListItem('policies', index, 1)}
                      disabled={index === policies.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeListItem('policies', index)}
                      className="p-1 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={policy.title || ''}
                    onChange={(event) => updateListItemField('policies', index, 'title', event.target.value)}
                    onBlur={(event) => {
                      if (!policy.slug && event.target.value) {
                        updateListItemField('policies', index, 'slug', slugify(event.target.value));
                      }
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Policy title"
                  />
                  <input
                    type="text"
                    value={policy.slug || ''}
                    onChange={(event) => updateListItemField('policies', index, 'slug', event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Slug (used in URL)"
                  />
                  <input
                    type="text"
                    value={policy.category || ''}
                    onChange={(event) => updateListItemField('policies', index, 'category', event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Category"
                  />
                  <select
                    value={policy.scope || 'national'}
                    onChange={(event) => updateListItemField('policies', index, 'scope', event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="national">National</option>
                    <option value="regional">Regional</option>
                    <option value="institutional">Institutional</option>
                  </select>
                  <select
                    value={policy.status || 'draft'}
                    onChange={(event) => updateListItemField('policies', index, 'status', event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="under-review">Under review</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  value={policy.description || ''}
                  onChange={(event) => updateListItemField('policies', index, 'description', event.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Policy description"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="0"
                    value={policy.universities ?? ''}
                    onChange={(event) =>
                      updateListItemField('policies', index, 'universities', Number(event.target.value))
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Universities"
                  />
                  <input
                    type="number"
                    min="0"
                    value={policy.studentsReached ?? ''}
                    onChange={(event) =>
                      updateListItemField('policies', index, 'studentsReached', Number(event.target.value))
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Students reached"
                  />
                  <input
                    type="number"
                    min="0"
                    value={policy.budget ?? ''}
                    onChange={(event) =>
                      updateListItemField('policies', index, 'budget', Number(event.target.value))
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Budget (KES)"
                  />
                  <input
                    type="date"
                    value={policy.startDate ? policy.startDate.slice(0, 10) : ''}
                    onChange={(event) => updateListItemField('policies', index, 'startDate', event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">Key Points</p>
                    <button
                      type="button"
                      onClick={() => addNestedListItem('policies', index, 'keyPoints', '')}
                      className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-3 w-3" />
                      Add point
                    </button>
                  </div>
                  {keyPoints.length === 0 ? (
                    <p className="text-sm text-gray-500">Add key points to highlight focus areas.</p>
                  ) : (
                    <div className="space-y-2">
                      {keyPoints.map((point, pointIndex) => (
                        <div key={`${policy.id || index}-point-${pointIndex}`} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={point || ''}
                            onChange={(event) =>
                              updateNestedListItem('policies', index, 'keyPoints', pointIndex, event.target.value)
                            }
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="Key point"
                          />
                          <button
                            type="button"
                            onClick={() => removeNestedListItem('policies', index, 'keyPoints', pointIndex)}
                            className="p-1 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Detailed Content (Markdown)</label>
                  <textarea
                    rows={4}
                    value={policy.content || ''}
                    onChange={(event) => updateListItemField('policies', index, 'content', event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Markdown content shown on the policy detail page"
                  />
                </div>
              </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );

  const renderEditor = () => {
    switch (selectedSlug) {
      case PAGE_CONTENT_SLUGS.TEACHER_OVERVIEW:
        return renderOverviewEditor();
      case PAGE_CONTENT_SLUGS.TEACHER_COURSES:
        return renderCoursesEditor();
      case PAGE_CONTENT_SLUGS.TEACHER_RESOURCES:
        return renderResourcesEditor();
      case PAGE_CONTENT_SLUGS.POLICIES:
        return renderPoliciesEditor();
      default:
        return (
          <p className="text-sm text-gray-500">Select a page to begin editing.</p>
        );
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
          <p className="text-sm text-gray-600">Update page copy, stats, and cards using the structured editor.</p>
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
            <p className="text-sm text-gray-500">Changes update the public-facing pages immediately.</p>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading content...</p>
          ) : (
            <div className="space-y-6">
              {renderEditor()}
              <div className="flex flex-wrap items-center gap-3">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPageContent;
