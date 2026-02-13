import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Award, BookOpen, CheckCircle2, Clock, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { courseEnrollmentsAPI, pageContentsAPI } from '../services/api';
import { PAGE_CONTENT_SLUGS, getDefaultPageContent } from '../utils/pageContentDefaults';
import { addLocalEnrollment, getCourseId, readLocalEnrollments } from '../utils/courseEnrollment';
import { getCompletionProgress, isModuleComplete } from '../utils/courseProgress';

const normalizeCourseId = (value) => String(value || '').trim().toLowerCase();

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const getModuleId = (module, index) => {
  if (!module) return `module-${index + 1}`;
  return (
    module.id ||
    module.slug ||
    slugify(module.title) ||
    `module-${index + 1}`
  );
};

const matchesCourseId = (course, targetId) => {
  if (!course || !targetId) return false;
  const normalizedTarget = normalizeCourseId(targetId);
  const candidates = [
    course.id,
    course.slug,
    getCourseId(course),
    slugify(course.title)
  ];
  return candidates.some((candidate) => normalizeCourseId(candidate) === normalizedTarget);
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);

  const isPreview = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('preview') === 'true';
  }, [location.search]);

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
        } catch (error) {
          console.warn('Falling back to default courses:', error);
        }

        const fallbackContent = content || getDefaultPageContent(PAGE_CONTENT_SLUGS.TEACHER_COURSES);
        const courses = Array.isArray(fallbackContent?.courses) ? fallbackContent.courses : [];
        const matchedCourse = courses.find((item) => matchesCourseId(item, id));

        if (!matchedCourse) {
          setCourse(null);
          setError('Course not found.');
          return;
        }

        setCourse(matchedCourse);
      } catch (err) {
        console.error('Failed to load course details:', err);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const loadEnrollmentStatus = async () => {
      if (!id) return;
      const token = localStorage.getItem('token');
      const resolvedCourseId = String(getCourseId(course) || id || '');

      if (token) {
        try {
          const response = await courseEnrollmentsAPI.getMine();
          const payload = response?.data || {};
          const enrollments = payload.enrollments || payload.data?.enrollments || [];
          const enrolled = enrollments.some((enrollment) =>
            matchesCourseId(course || { id: resolvedCourseId }, enrollment.courseId)
          );

          if (isMounted) {
            setIsEnrolled(enrolled);
          }

          if (enrolled && resolvedCourseId) {
            addLocalEnrollment(resolvedCourseId);
          }
          return;
        } catch (error) {
          console.error('Failed to load enrollments:', error);
        }

        const localIds = readLocalEnrollments();
        if (isMounted) {
          setIsEnrolled(localIds.includes(resolvedCourseId || id));
        }
        return;
      }

      if (isMounted) {
        setIsEnrolled(false);
      }
    };

    loadEnrollmentStatus();

    return () => {
      isMounted = false;
    };
  }, [course, id]);

  const handleEnroll = async () => {
    if (!course || !id) return;
    const resolvedCourseId = String(getCourseId(course) || id || '');
    if (!resolvedCourseId) return;
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Please sign in or create an account to enroll.');
      navigate('/admin?mode=register', { state: { from: `/courses/${resolvedCourseId}` } });
      return;
    }

    try {
      await courseEnrollmentsAPI.enroll(resolvedCourseId);
      addLocalEnrollment(resolvedCourseId);
      setIsEnrolled(true);
      toast.success('You are now enrolled in this course.');
    } catch (error) {
      console.error('Enrollment failed:', error);
      const status = error.response?.status;
      if (status === 401) {
        toast.error('Session expired. Please sign in again.');
        navigate('/admin?mode=register', { state: { from: `/courses/${resolvedCourseId}` } });
        return;
      }
      toast.error(error.response?.data?.message || 'Online enrollment failed. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/teacher-training', { state: { section: 'courses' } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading course details...</p>
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
            onClick={handleBack}
            className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to courses
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const modules = Array.isArray(course.modules) ? course.modules : [];
  const courseId = String(getCourseId(course) || id || '');
  const completionProgress = getCompletionProgress(courseId, modules.length);
  const hasCompletedCourse = completionProgress.percent >= 100;
  const prerequisites = Array.isArray(course.prerequisites) ? course.prerequisites : [];

  const handleOpenModule = (moduleId) => {
    if (!moduleId) return;
    if (!isEnrolled && !isPreview && !hasCompletedCourse) {
      const token = localStorage.getItem('token');
      toast.error(token
        ? 'Please enroll to access modules.'
        : 'Please sign in to enroll and access modules.');
      if (!token) {
        navigate('/admin?mode=register');
      }
      return;
    }
    const query = isPreview ? '?preview=true' : '';
    navigate(`/courses/${courseId}/modules/${moduleId}${query}`);
  };

  const handleResume = () => {
    if (!modules.length) return;
    let targetModule = null;
    let targetIndex = 0;
    for (let index = 0; index < modules.length; index += 1) {
      const module = modules[index];
      const moduleId = getModuleId(module, index);
      if (!isModuleComplete(courseId, moduleId)) {
        targetModule = module;
        targetIndex = index;
        break;
      }
    }
    if (!targetModule) {
      targetModule = modules[0];
      targetIndex = 0;
    }
    handleOpenModule(getModuleId(targetModule, targetIndex));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {isPreview && (
                <span className="text-xs uppercase tracking-wide font-semibold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                  Preview Mode
                </span>
              )}
              {course.category && (
                <span className="text-xs uppercase tracking-wide font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  {course.category.replace(/-/g, ' ')}
                </span>
              )}
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                <p className="text-gray-600 max-w-2xl">{course.description}</p>
              </div>
              <div className="flex items-center gap-3">
                {course.certificationRequired && (
                  <div className="inline-flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-full">
                    <Award className="h-4 w-4" />
                    Certification Included
                  </div>
                )}
                <div className="inline-flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-full">
                  <GraduationCap className="h-4 w-4" />
                  {course.difficulty}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8 mt-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Course Modules</h2>
                  {modules.length === 0 ? (
                    <p className="text-sm text-gray-500">Modules will be available soon.</p>
                  ) : (
                    <div className="space-y-3">
                      {modules.map((module, index) => {
                        const moduleId = getModuleId(module, index);
                        const completed = isModuleComplete(courseId, moduleId);
                        return (
                          <button
                            type="button"
                            key={moduleId}
                            onClick={() => handleOpenModule(moduleId)}
                            className="w-full text-left flex items-start gap-3 border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition"
                          >
                            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <h3 className="font-semibold text-gray-900">{module.title}</h3>
                                {completed && (
                                  <span className="text-xs font-semibold uppercase tracking-wide text-green-700 bg-green-50 px-2 py-1 rounded-full">
                                    Completed
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {module.duration} mins · {module.type}
                              </p>
                              {module.description && (
                                <p className="text-xs text-gray-500 mt-1">{module.description}</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {prerequisites.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Prerequisites</h2>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {prerequisites.map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm uppercase tracking-wide text-gray-500">Estimated Time</p>
                    <p className="text-lg font-semibold">{course.estimatedHours} hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm uppercase tracking-wide text-gray-500">Modules</p>
                    <p className="text-lg font-semibold">{modules.length}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  {isEnrolled ? (
                    <>
                      <div className="flex items-center gap-2 text-green-700 font-semibold">
                        <CheckCircle2 className="h-5 w-5" />
                        Enrolled
                      </div>
                      <button
                        type="button"
                        onClick={handleResume}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Resume Course
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleEnroll}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Enroll Now
                    </button>
                  )}
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Completion</span>
                      <span>{completionProgress.completedCount}/{completionProgress.totalModules} modules</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${completionProgress.percent}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Enrollment is tied to your account so progress syncs everywhere.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
