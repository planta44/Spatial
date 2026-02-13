import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Download, FileText, ListChecks } from 'lucide-react';
import toast from 'react-hot-toast';
import { courseEnrollmentsAPI, pageContentsAPI } from '../services/api';
import { PAGE_CONTENT_SLUGS, getDefaultPageContent } from '../utils/pageContentDefaults';
import { getCourseId } from '../utils/courseEnrollment';
import { getCompletionProgress, isModuleComplete, markModuleComplete } from '../utils/courseProgress';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

const resolveAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      if (['localhost', '127.0.0.1'].includes(parsed.hostname)) {
        return `${API_BASE_URL}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch (error) {
      return url;
    }
    return url;
  }
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${normalized}`;
};

const getVideoEmbedUrl = (url) => {
  if (!url) return '';
  const youTubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/i);
  if (youTubeMatch) {
    return `https://www.youtube.com/embed/${youTubeMatch[1]}`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/i);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return '';
};

const isVideoFile = (url) => /\.(mp4|webm|ogg)$/i.test(url || '');

const normalizeValue = (value) => String(value || '').trim().toLowerCase();

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const getModuleId = (module, index) =>
  module?.id || module?.slug || slugify(module?.title) || `module-${index + 1}`;

const matchesCourseId = (course, targetId) => {
  if (!course || !targetId) return false;
  const normalizedTarget = normalizeValue(targetId);
  const candidates = [course.id, course.slug, getCourseId(course), slugify(course.title)];
  return candidates.some((candidate) => normalizeValue(candidate) === normalizedTarget);
};

const matchesModuleId = (module, index, targetId) => {
  if (!module || !targetId) return false;
  const normalizedTarget = normalizeValue(targetId);
  const candidates = [
    module.id,
    module.slug,
    slugify(module.title),
    `module-${index + 1}`,
    String(index + 1),
  ];
  return candidates.some((candidate) => normalizeValue(candidate) === normalizedTarget);
};

const formatInlineMarkdown = (value) =>
  String(value || '')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

const buildMarkdownBlocks = (content) => {
  const lines = String(content || '').split('\n');
  const blocks = [];
  let listItems = [];
  let listType = null;

  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: 'list', items: listItems, ordered: listType === 'ordered' });
      listItems = [];
      listType = null;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    const unorderedMatch = trimmed.match(/^[-*•]\s+/);
    const orderedMatch = trimmed.match(/^\d+\.\s+/);
    if (unorderedMatch) {
      if (listType && listType !== 'unordered') {
        flushList();
      }
      listType = 'unordered';
      listItems.push(trimmed.replace(/^[-*•]\s+/, ''));
      return;
    }
    if (orderedMatch) {
      if (listType && listType !== 'ordered') {
        flushList();
      }
      listType = 'ordered';
      listItems.push(trimmed.replace(/^\d+\.\s+/, ''));
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

const renderMarkdownBlocks = (content, keyPrefix) => {
  const blocks = buildMarkdownBlocks(content);
  if (!blocks.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        const key = `${keyPrefix}-${block.type}-${index}`;
        if (block.type === 'heading') {
          const HeadingTag = block.level === 1 ? 'h2' : block.level === 2 ? 'h3' : 'h4';
          const headingClass = block.level === 1
            ? 'text-2xl font-semibold text-gray-900'
            : block.level === 2
              ? 'text-xl font-semibold text-gray-900'
              : 'text-lg font-semibold text-gray-900';
          return (
            <HeadingTag
              key={key}
              className={headingClass}
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.text) }}
            />
          );
        }
        if (block.type === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul';
          const listClass = block.ordered
            ? 'list-decimal list-inside space-y-1 text-gray-700'
            : 'list-disc list-inside space-y-1 text-gray-700';
          return (
            <ListTag key={key} className={listClass}>
              {block.items.map((listItem, listIndex) => (
                <li
                  key={`${key}-item-${listIndex}`}
                  dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(listItem) }}
                />
              ))}
            </ListTag>
          );
        }
        return (
          <p
            key={key}
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.text) }}
          />
        );
      })}
    </div>
  );
};

const formatTimer = (value) => {
  if (value === null || value === undefined) return '';
  const minutes = Math.floor(value / 60);
  const seconds = String(value % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const CourseModuleDetail = () => {
  const { courseId, moduleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [moduleItem, setModuleItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const isPreview = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('preview') === 'true';
  }, [location.search]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [moduleId]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError('');

        let content = null;
        try {
          const response = await pageContentsAPI.getBySlug(PAGE_CONTENT_SLUGS.TEACHER_COURSES);
          const payload = response?.data || {};
          const pageContent = payload.pageContent || payload.data?.pageContent;
          content = pageContent?.content || null;
        } catch (fetchError) {
          console.warn('Falling back to default courses:', fetchError);
        }

        const fallbackContent = content || getDefaultPageContent(PAGE_CONTENT_SLUGS.TEACHER_COURSES);
        const courses = Array.isArray(fallbackContent?.courses) ? fallbackContent.courses : [];
        const matchedCourse = courses.find((item) => matchesCourseId(item, courseId));

        if (!matchedCourse) {
          setCourse(null);
          setModuleItem(null);
          setError('Course not found.');
          return;
        }

        setCourse(matchedCourse);
      } catch (err) {
        console.error('Failed to load module details:', err);
        setError('Failed to load module details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const modules = useMemo(() => (Array.isArray(course?.modules) ? course.modules : []), [course]);
  const moduleIndex = useMemo(
    () => modules.findIndex((module, index) => matchesModuleId(module, index, moduleId)),
    [modules, moduleId]
  );

  const resolvedCourseId = useMemo(
    () => String(getCourseId(course) || courseId || ''),
    [course, courseId]
  );

  const resolvedModuleId = useMemo(() => {
    if (moduleIndex < 0) return moduleId || '';
    return getModuleId(modules[moduleIndex], moduleIndex);
  }, [moduleIndex, modules, moduleId]);

  useEffect(() => {
    if (!course) return;
    if (moduleIndex < 0) {
      setModuleItem(null);
      setError('Module not found.');
      return;
    }
    setModuleItem(modules[moduleIndex]);
  }, [course, moduleIndex, modules]);

  useEffect(() => {
    if (!course || !resolvedCourseId) return;
    let isMounted = true;

    const loadEnrollmentStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        if (isMounted) {
          setIsEnrolled(false);
        }
        return;
      }

      try {
        const response = await courseEnrollmentsAPI.getMine();
        const payload = response?.data || {};
        const enrollments = payload.enrollments || payload.data?.enrollments || [];
        const enrollmentMatch = enrollments.find((enrollment) => matchesCourseId(course, enrollment.courseId));

        if (isMounted) {
          setIsEnrolled(Boolean(enrollmentMatch));
        }
      } catch (err) {
        console.error('Failed to load enrollments:', err);
      }
    };

    loadEnrollmentStatus();

    return () => {
      isMounted = false;
    };
  }, [course, resolvedCourseId]);

  useEffect(() => {
    if (!resolvedCourseId || !resolvedModuleId) return;
    setIsComplete(isModuleComplete(resolvedCourseId, resolvedModuleId));
  }, [resolvedCourseId, resolvedModuleId]);

  useEffect(() => {
    setAnswers({});
    setQuizResult(null);
    setTimeLeft(null);
  }, [moduleId]);

  const quizData = useMemo(() => {
    if (!moduleItem?.quiz || typeof moduleItem.quiz !== 'object') {
      return null;
    }
    return {
      enabled: Boolean(moduleItem.quiz.enabled),
      timeLimitMinutes: moduleItem.quiz.timeLimitMinutes,
      passingScore: Number(moduleItem.quiz.passingScore) || 70,
      questions: Array.isArray(moduleItem.quiz.questions) ? moduleItem.quiz.questions : [],
    };
  }, [moduleItem]);

  const quizEnabled =
    moduleItem?.type === 'quiz' ||
    quizData?.enabled ||
    (quizData?.questions?.length || 0) > 0;
  const completionProgress = getCompletionProgress(resolvedCourseId, modules.length);
  const hasCompletedCourse = completionProgress.percent >= 100;
  const allowAccess = isEnrolled || isPreview || hasCompletedCourse;
  const isReadOnly = isComplete || hasCompletedCourse;
  const allowQuizInteraction = allowAccess && !isReadOnly;

  useEffect(() => {
    if (!quizEnabled || quizResult?.submitted || isReadOnly) {
      setTimeLeft(null);
      return;
    }
    const minutes = Number(quizData?.timeLimitMinutes);
    if (!minutes || Number.isNaN(minutes) || minutes <= 0) {
      setTimeLeft(null);
      return;
    }
    const durationSeconds = Math.max(1, Math.round(minutes * 60));
    setTimeLeft(durationSeconds);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        return Math.max(0, prev - 1);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quizEnabled, quizData?.timeLimitMinutes, quizResult?.submitted, moduleId, isReadOnly]);

  const handleMarkComplete = useCallback(async () => {
    if (!resolvedCourseId || !resolvedModuleId) return;
    if (isComplete) return;
    if (!allowAccess) {
      toast.error('Please enroll to track your progress.');
      navigate('/admin?mode=register');
      return;
    }

    markModuleComplete(resolvedCourseId, resolvedModuleId);
    const completion = getCompletionProgress(resolvedCourseId, modules.length);
    setIsComplete(true);

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await courseEnrollmentsAPI.update(resolvedCourseId, {
          progress: completion.percent,
          status: completion.percent >= 100 ? 'completed' : 'enrolled',
        });
      } catch (err) {
        console.error('Failed to sync enrollment progress:', err);
      }
    }

    if (completion.percent >= 100) {
      toast.success('Course completed! Your certificate is ready.');
    } else {
      toast.success('Module marked complete.');
    }
  }, [allowAccess, isComplete, modules.length, navigate, resolvedCourseId, resolvedModuleId]);

  const handleAnswerChange = (questionId, optionId, allowMultiple) => {
    if (!allowQuizInteraction) return;
    setAnswers((prev) => {
      const current = new Set(prev[questionId] || []);
      if (allowMultiple) {
        if (current.has(optionId)) {
          current.delete(optionId);
        } else {
          current.add(optionId);
        }
        return { ...prev, [questionId]: Array.from(current) };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  };

  const handleSubmitQuiz = useCallback(
    (isAuto = false) => {
      if (!allowQuizInteraction) {
        toast('Quiz is read-only after completion.', { icon: 'ℹ️' });
        return;
      }
      if (!quizData || !quizData.questions.length) {
        toast.error('Quiz questions are not available yet.');
        return;
      }

      let correctCount = 0;
      quizData.questions.forEach((question) => {
        const selected = new Set(answers[question.id] || []);
        const correctOptions = (question.options || [])
          .filter((option) => option.isCorrect)
          .map((option) => option.id);
        const correctSet = new Set(correctOptions);
        const isCorrect =
          selected.size === correctSet.size &&
          Array.from(selected).every((id) => correctSet.has(id));
        if (isCorrect) {
          correctCount += 1;
        }
      });

      const total = quizData.questions.length;
      const score = total ? Math.round((correctCount / total) * 100) : 0;
      const passed = score >= quizData.passingScore;

      setQuizResult({ submitted: true, score, passed, total, correctCount, auto: isAuto });

      if (passed) {
        toast.success('Quiz passed!');
        handleMarkComplete();
      } else if (isAuto) {
        toast.error('Time is up. Review the answers and try again.');
      } else {
        toast.error('Quiz not passed yet. Review the questions and try again.');
      }
    },
    [allowQuizInteraction, answers, handleMarkComplete, quizData]
  );

  useEffect(() => {
    if (timeLeft === 0 && quizEnabled && !quizResult?.submitted) {
      handleSubmitQuiz(true);
    }
  }, [handleSubmitQuiz, quizEnabled, quizResult?.submitted, timeLeft]);

  const resources = Array.isArray(moduleItem?.resources) ? moduleItem.resources : [];
  const contentBlocks = Array.isArray(moduleItem?.contentBlocks) ? moduleItem.contentBlocks : [];
  const previousModule = moduleIndex > 0 ? modules[moduleIndex - 1] : null;
  const nextModule = moduleIndex >= 0 && moduleIndex < modules.length - 1 ? modules[moduleIndex + 1] : null;

  const navigateToModule = (targetModule, index) => {
    if (!targetModule) return;
    const query = isPreview ? '?preview=true' : '';
    navigate(`/courses/${resolvedCourseId}/modules/${getModuleId(targetModule, index)}${query}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading module details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-red-100 rounded-lg px-6 py-5 shadow-sm text-center">
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            type="button"
            onClick={() => navigate(`/courses/${resolvedCourseId}`)}
            className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to course
          </button>
        </div>
      </div>
    );
  }

  if (!course || !moduleItem) {
    return null;
  }

  const renderMarkdownContent = () => {
    if (!moduleItem?.content) {
      return <p className="text-sm text-gray-500">Module content will be available soon.</p>;
    }

    const contentMarkup = renderMarkdownBlocks(moduleItem.content, 'module-content');
    if (!contentMarkup) {
      return <p className="text-sm text-gray-500">Module content will be available soon.</p>;
    }

    return contentMarkup;
  };

  const renderContentBlocks = () => (
    <div className="space-y-6">
      {contentBlocks.map((block, index) => {
        const key = block.id || `${block.type}-${index}`;
        if (block.type === 'heading') {
          return (
            <h2 key={key} className="text-2xl font-semibold text-gray-900">
              {block.text}
            </h2>
          );
        }
        if (block.type === 'subheading') {
          return (
            <h3 key={key} className="text-xl font-semibold text-gray-800">
              {block.text}
            </h3>
          );
        }
        if (block.type === 'paragraph') {
          return (
            <p key={key} className="text-gray-700 leading-relaxed">
              {block.text}
            </p>
          );
        }
        if (block.type === 'list') {
          return (
            <ul key={key} className="list-disc list-inside space-y-1 text-gray-700">
              {(block.items || []).map((item, idx) => (
                <li key={`${key}-item-${idx}`}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === 'plain') {
          const plainMarkup = renderMarkdownBlocks(block.text, `plain-${key}`);
          if (!plainMarkup) {
            return null;
          }
          return <div key={key}>{plainMarkup}</div>;
        }
        if (block.type === 'link') {
          return (
            <div key={key} className="rounded-lg border border-gray-200 p-4 bg-gray-50">
              <p className="text-sm text-gray-500 mb-1">Resource link</p>
              <a
                href={block.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {block.caption || block.url}
              </a>
              {block.text && <p className="text-sm text-gray-600 mt-2">{block.text}</p>}
            </div>
          );
        }
        if (block.type === 'image') {
          const imageUrl = resolveAssetUrl(block.url);
          return (
            <figure key={key} className="space-y-2">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={block.caption || moduleItem.title}
                  className="w-full rounded-xl border border-gray-200"
                />
              )}
              {block.caption && (
                <figcaption className="text-sm text-gray-500">{block.caption}</figcaption>
              )}
            </figure>
          );
        }
        if (block.type === 'video') {
          const videoUrl = resolveAssetUrl(block.url);
          const embedUrl = getVideoEmbedUrl(block.url);
          return (
            <div key={key} className="space-y-2">
              {embedUrl ? (
                <div className="aspect-video rounded-xl overflow-hidden border border-gray-200">
                  <iframe
                    src={embedUrl}
                    title={block.caption || moduleItem.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                videoUrl && (
                  <video controls className="w-full rounded-xl border border-gray-200">
                    <source src={videoUrl} />
                  </video>
                )
              )}
              {block.caption && <p className="text-sm text-gray-500">{block.caption}</p>}
            </div>
          );
        }
        if (block.type === 'pdf') {
          const pdfUrl = resolveAssetUrl(block.url);
          return (
            <div key={key} className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <span className="text-sm text-gray-700">{block.caption || 'PDF Resource'}</span>
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Open PDF
                </a>
              )}
            </div>
          );
        }
        return null;
      })}
    </div>
  );

  const renderResources = () => {
    if (resources.length === 0) {
      return <p className="text-sm text-gray-500">No resources attached to this module yet.</p>;
    }

    return (
      <div className="space-y-3">
        {resources.map((resource, index) => {
          const resourceUrl = resolveAssetUrl(resource.url);
          const isPdf = /\.pdf$/i.test(resourceUrl || '') || resource.type === 'pdf';
          const isVideo = isVideoFile(resourceUrl) || resource.type === 'video';
          return (
            <div
              key={resource.id || index}
              className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div>
                <p className="font-medium text-gray-900">{resource.title || 'Resource'}</p>
                {resource.description && <p className="text-sm text-gray-600">{resource.description}</p>}
              </div>
              {resourceUrl && (
                <a
                  href={resourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  {isPdf ? <Download className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  {isVideo ? 'Watch' : isPdf ? 'Download' : 'Open'}
                </a>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderQuiz = () => {
    if (!quizEnabled) return null;
    if (!quizData) {
      return <p className="text-sm text-gray-500">Quiz settings will appear here once configured.</p>;
    }

    if (!quizData.questions.length) {
      return <p className="text-sm text-gray-500">Quiz questions will be available soon.</p>;
    }

    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ListChecks className="h-4 w-4 text-blue-500" />
            <span>{quizData.questions.length} questions</span>
          </div>
          {timeLeft !== null && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-amber-500" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          )}
        </div>

        {isReadOnly && (
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              You have completed this module. Quiz questions are available in read-only mode.
            </p>
          </div>
        )}

        {quizResult?.submitted && (
          <div
            className={`border rounded-lg p-4 ${quizResult.passed ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}
          >
            <p className="font-semibold text-gray-900">Score: {quizResult.score}%</p>
            <p className="text-sm text-gray-600">
              {quizResult.passed
                ? 'Great job! You passed the quiz.'
                : 'Not quite there yet. Review the material and try again.'}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {quizData.questions.map((question, questionIndex) => {
            const allowMultiple = Boolean(question.allowMultiple || question.multiple);
            const selected = new Set(answers[question.id] || []);
            return (
              <div key={question.id || questionIndex} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <p className="font-medium text-gray-900">
                  {questionIndex + 1}. {question.text || 'Question'}
                </p>
                <div className="space-y-2">
                  {(question.options || []).map((option, optionIndex) => {
                    const optionId = option.id || `option-${optionIndex}`;
                    const checked = selected.has(optionId);
                    return (
                      <label key={optionId} className="flex items-start gap-2 text-sm text-gray-700">
                        <input
                          type={allowMultiple ? 'checkbox' : 'radio'}
                          name={`question-${question.id || questionIndex}`}
                          checked={checked}
                          onChange={() => handleAnswerChange(question.id, optionId, allowMultiple)}
                          className="mt-1"
                          disabled={!allowQuizInteraction}
                        />
                        <span>{option.text || 'Option'}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => handleSubmitQuiz(false)}
          disabled={!allowQuizInteraction || quizResult?.submitted}
          className="inline-flex items-center justify-center bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          {isReadOnly ? 'Quiz completed' : 'Submit quiz'}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <button
          type="button"
          onClick={() => navigate(`/courses/${resolvedCourseId}`)}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to course
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-blue-600 font-semibold">Module {moduleIndex + 1}</p>
              <h1 className="text-2xl font-bold text-gray-900">{moduleItem.title}</h1>
              {moduleItem.description && <p className="text-gray-600 mt-2">{moduleItem.description}</p>}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {moduleItem.duration || 0} mins
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold uppercase">
                {moduleItem.type || 'lesson'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className={`h-4 w-4 ${isComplete ? 'text-green-500' : 'text-gray-300'}`} />
              {isComplete ? 'Completed' : 'Not completed yet'}
            </div>
            {!quizEnabled && !isComplete && !hasCompletedCourse && (
              <button
                type="button"
                onClick={handleMarkComplete}
                disabled={!allowAccess}
                className="inline-flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
              >
                Mark complete
              </button>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Course progress</span>
              <span>{completionProgress.percent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${completionProgress.percent}%` }} />
            </div>
          </div>

          {!allowAccess && (
            <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 text-sm text-amber-800">
              Please enroll to access this module. Sign in or register to track progress.
            </div>
          )}
        </div>

        {allowAccess && (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
            <div className="space-y-6">
              <section className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Module Content</h2>
                {contentBlocks.length > 0 ? renderContentBlocks() : renderMarkdownContent()}
              </section>

              <section className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Resources</h2>
                {renderResources()}
              </section>

              {quizEnabled && (
                <section className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">Module Quiz</h2>
                  {renderQuiz()}
                </section>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Module Navigation</h3>
                <p className="text-sm text-gray-600">Move through the course modules.</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => navigateToModule(previousModule, moduleIndex - 1)}
                    disabled={!previousModule}
                    className="w-full border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous module
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateToModule(nextModule, moduleIndex + 1)}
                    disabled={!nextModule}
                    className="w-full border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next module
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Course summary</h3>
                <p className="text-sm text-gray-600">{course.title}</p>
                <div className="text-sm text-gray-600">Total modules: {modules.length}</div>
                <div className="text-sm text-gray-600">Completed: {completionProgress.completedCount}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseModuleDetail;
