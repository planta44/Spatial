import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { pageContentsAPI } from '../services/api';
import { PAGE_CONTENT_OPTIONS, PAGE_CONTENT_SLUGS, getDefaultPageContent } from '../utils/pageContentDefaults';

const AdminPageContent = () => {
  const navigate = useNavigate();
  const [selectedSlug, setSelectedSlug] = useState(PAGE_CONTENT_OPTIONS[0]?.slug || '');
  const [content, setContent] = useState(() =>
    getDefaultPageContent(PAGE_CONTENT_OPTIONS[0]?.slug || '')
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
      nested[nestedIndex] = { ...(nested[nestedIndex] || {}), [field]: value };
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
                            duration: 30,
                            type: 'lesson',
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
                      <div className="space-y-3">
                        {modules.map((module, moduleIndex) => (
                          <div
                            key={module.id || moduleIndex}
                            className="border border-gray-200 rounded-lg p-3 space-y-2"
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
                                  updateNestedObjectField('courses', index, 'modules', moduleIndex, 'title', event.target.value)
                                }
                                className="border border-gray-300 rounded-lg px-3 py-2"
                                placeholder="Module title"
                              />
                              <input
                                type="number"
                                min="1"
                                value={module.duration ?? ''}
                                onChange={(event) =>
                                  updateNestedObjectField(
                                    'courses',
                                    index,
                                    'modules',
                                    moduleIndex,
                                    'duration',
                                    Number(event.target.value)
                                  )
                                }
                                className="border border-gray-300 rounded-lg px-3 py-2"
                                placeholder="Minutes"
                              />
                              <select
                                value={module.type || 'lesson'}
                                onChange={(event) =>
                                  updateNestedObjectField('courses', index, 'modules', moduleIndex, 'type', event.target.value)
                                }
                                className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                              >
                                <option value="lesson">Lesson</option>
                                <option value="practical">Practical</option>
                                <option value="quiz">Quiz</option>
                                <option value="assignment">Assignment</option>
                              </select>
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">Items</p>
                    <button
                      type="button"
                      onClick={() => addNestedListItem('categories', index, 'items', '')}
                      className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-3 w-3" />
                      Add item
                    </button>
                  </div>
                  {(category.items || []).map((item, itemIndex) => (
                    <div key={`${category.id || index}-item-${itemIndex}`} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(event) =>
                          updateNestedListItem('categories', index, 'items', itemIndex, event.target.value)
                        }
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                        placeholder={`Item ${itemIndex + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeNestedListItem('categories', index, 'items', itemIndex)}
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
                description: '',
                category: '',
                scope: 'national',
                status: 'draft',
                universities: '',
                studentsReached: '',
                budget: '',
                startDate: '',
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
            {policies.map((policy, index) => (
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
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Policy title"
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
              </div>
            ))}
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
