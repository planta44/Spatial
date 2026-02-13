import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Users,
  Download,
  Play,
  FileText,
  Trophy,
  BarChart3
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { courseEnrollmentsAPI, pageContentsAPI } from '../services/api';
import { PAGE_CONTENT_SLUGS, getDefaultPageContent } from '../utils/pageContentDefaults';
import {
  addLocalEnrollment,
  getCourseId,
  readLocalEnrollments,
  removeLocalEnrollment
} from '../utils/courseEnrollment';
import { clearCourseProgress, getCompletionProgress, isModuleComplete } from '../utils/courseProgress';

const TeacherTraining = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(() => location.state?.section || 'overview');
  const [enrollments, setEnrollments] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  const [overviewContent, setOverviewContent] = useState(() =>
    getDefaultPageContent(PAGE_CONTENT_SLUGS.TEACHER_OVERVIEW)
  );
  const [courseContent, setCourseContent] = useState(() =>
    getDefaultPageContent(PAGE_CONTENT_SLUGS.TEACHER_COURSES)
  );
  const [resourceContent, setResourceContent] = useState(() =>
    getDefaultPageContent(PAGE_CONTENT_SLUGS.TEACHER_RESOURCES)
  );

  useEffect(() => {
    let isMounted = true;

    const fetchPageContent = async (slug) => {
      try {
        const response = await pageContentsAPI.getBySlug(slug);
        const payload = response?.data || {};
        const pageContent = payload.pageContent || payload.data?.pageContent;
        return pageContent?.content || getDefaultPageContent(slug);
      } catch (error) {
        return getDefaultPageContent(slug);
      }
    };

    const loadContent = async () => {
      const [overview, courses, resources] = await Promise.all([
        fetchPageContent(PAGE_CONTENT_SLUGS.TEACHER_OVERVIEW),
        fetchPageContent(PAGE_CONTENT_SLUGS.TEACHER_COURSES),
        fetchPageContent(PAGE_CONTENT_SLUGS.TEACHER_RESOURCES)
      ]);

      if (!isMounted) return;

      setOverviewContent(overview);
      setCourseContent(courses);
      setResourceContent(resources);
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const targetSection = location.state?.section;
    if (targetSection) {
      setActiveSection(targetSection);
    }
  }, [location.state]);

  useEffect(() => {
    let isMounted = true;

    const loadEnrollments = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedUser && isMounted) {
        try {
          setUserProfile(JSON.parse(storedUser));
        } catch (error) {
          setUserProfile(null);
        }
      }

      if (token) {
        try {
          const response = await courseEnrollmentsAPI.getMine();
          const payload = response?.data || {};
          const apiEnrollments = payload.enrollments || payload.data?.enrollments || [];

          if (isMounted) {
            setEnrollments(apiEnrollments);
          }

          apiEnrollments.forEach((enrollment) => {
            if (enrollment?.courseId) {
              addLocalEnrollment(String(enrollment.courseId));
            }
          });
          return;
        } catch (error) {
          console.error('Failed to load enrollments:', error);
        }

        const localIds = readLocalEnrollments();
        if (isMounted) {
          setEnrollments(localIds.map((courseId) => ({
            courseId,
            status: 'enrolled',
            progress: 0
          })));
        }
        return;
      }

      if (isMounted) {
        setEnrollments([]);
      }
    };

    loadEnrollments();

    return () => {
      isMounted = false;
    };
  }, []);

  const availableCourses = Array.isArray(courseContent?.courses) ? courseContent.courses : [];
  const overviewStats = Array.isArray(overviewContent?.stats) ? overviewContent.stats : [];
  const pathways = Array.isArray(overviewContent?.pathways) ? overviewContent.pathways : [];
  const resourceCategories = Array.isArray(resourceContent?.categories) ? resourceContent.categories : [];

  const iconMap = { BookOpen, Users, Award, FileText, Download, Play };
  const statIconColors = ['text-yellow-300', 'text-green-300', 'text-purple-300', 'text-blue-300'];
  const resourceIconColors = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600'];

  const pathwayThemes = {
    green: {
      border: 'border-green-200',
      bg: 'bg-green-50',
      title: 'text-green-800',
      text: 'text-green-700',
      badge: 'bg-green-600 text-white',
      time: 'text-green-600'
    },
    blue: {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      title: 'text-blue-800',
      text: 'text-blue-700',
      badge: 'bg-blue-600 text-white',
      time: 'text-blue-600'
    },
    purple: {
      border: 'border-purple-200',
      bg: 'bg-purple-50',
      title: 'text-purple-800',
      text: 'text-purple-700',
      badge: 'bg-purple-600 text-white',
      time: 'text-purple-600'
    },
    orange: {
      border: 'border-orange-200',
      bg: 'bg-orange-50',
      title: 'text-orange-800',
      text: 'text-orange-700',
      badge: 'bg-orange-600 text-white',
      time: 'text-orange-600'
    }
  };

  const getPathwayTheme = (theme) => pathwayThemes[theme] || pathwayThemes.blue;

  const slugify = (value) =>
    String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const getModuleId = (module, index) =>
    module?.id || module?.slug || slugify(module?.title) || `module-${index + 1}`;

  const getResourceSlug = (item) => {
    if (!item) return '';
    const raw = typeof item === 'string'
      ? item
      : item.slug || item.id || item.title;
    return slugify(raw);
  };

  const enrollmentMap = useMemo(() => {
    return new Map(enrollments.map((enrollment) => [
      String(enrollment.courseId),
      enrollment
    ]));
  }, [enrollments]);

  const enrolledCourseItems = useMemo(() => {
    return availableCourses
      .map((course) => {
        const courseId = String(getCourseId(course));
        if (!courseId) return null;
        const enrollment = enrollmentMap.get(courseId);
        if (!enrollment) return null;
        const modules = Array.isArray(course.modules) ? course.modules : [];
        const completion = getCompletionProgress(courseId, modules.length);
        const enrollmentProgress = Number(enrollment.progress) || 0;
        const progressValue = Math.max(enrollmentProgress, completion.percent);
        const isCompleted = enrollment.status === 'completed' || progressValue >= 100;
        return { course, enrollment, courseId, progressValue, isCompleted };
      })
      .filter(Boolean);
  }, [availableCourses, enrollmentMap]);

  const completedCourseItems = useMemo(() => {
    return enrolledCourseItems.filter(({ isCompleted }) => isCompleted);
  }, [enrolledCourseItems]);

  const activeCourseItems = useMemo(() => {
    return enrolledCourseItems.filter(({ isCompleted }) => !isCompleted);
  }, [enrolledCourseItems]);

  const certificateItems = useMemo(() => {
    return completedCourseItems.filter(({ course }) => course.certificationRequired);
  }, [completedCourseItems]);

  const averageProgress = useMemo(() => {
    if (!enrolledCourseItems.length) return 0;
    const total = enrolledCourseItems.reduce((sum, { progressValue }) =>
      sum + (Number(progressValue) || 0), 0);
    return Math.round(total / enrolledCourseItems.length);
  }, [enrolledCourseItems]);

  const handleContinue = async (course) => {
    const courseId = String(getCourseId(course));
    if (!courseId) return;
    const token = localStorage.getItem('token');

    if (token) {
      try {
        await courseEnrollmentsAPI.update(courseId, { lastAccessedAt: new Date().toISOString() });
      } catch (error) {
        console.error('Failed to update last accessed:', error);
      }
    }

    const modules = Array.isArray(course?.modules) ? course.modules : [];
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
    if (!targetModule && modules.length) {
      targetModule = modules[0];
      targetIndex = 0;
    }

    if (targetModule) {
      navigate(`/courses/${courseId}/modules/${getModuleId(targetModule, targetIndex)}`);
      return;
    }

    navigate(`/courses/${courseId}`);
  };

  const handleUnenroll = async (courseId) => {
    if (!courseId) return;
    const confirmed = window.confirm('Are you sure you want to unenroll from this course?');
    if (!confirmed) return;
    const token = localStorage.getItem('token');

    try {
      if (token) {
        await courseEnrollmentsAPI.unenroll(courseId);
      }
      removeLocalEnrollment(courseId);
      clearCourseProgress(courseId);
      setEnrollments((prev) => prev.filter((enrollment) => String(enrollment.courseId) !== courseId));
      toast.success('You have been unenrolled from this course.');
    } catch (error) {
      console.error('Failed to unenroll:', error);
      toast.error(error.response?.data?.message || 'Unable to unenroll. Please try again.');
    }
  };

  const handleCourseCta = (course, isEnrolled) => {
    const courseId = String(getCourseId(course));
    if (!courseId) return;
    if (isEnrolled) {
      handleContinue(course);
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please sign in or create an account to enroll.');
      navigate('/admin?mode=register', { state: { from: `/courses/${courseId}` } });
      return;
    }
    navigate(`/courses/${courseId}`);
  };

  const handleDownloadCertificate = (course, enrollment) => {
    const userName = userProfile?.name || 'Student';
    const completionDate = enrollment?.completedAt
      ? new Date(enrollment.completedAt)
      : new Date();

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const centerX = pageWidth / 2;

    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(1);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

    doc.setFillColor(30, 64, 175);
    doc.rect(8, 8, pageWidth - 16, 8, 'F');
    doc.setFillColor(59, 130, 246);
    doc.rect(8, pageHeight - 16, pageWidth - 16, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(30, 64, 175);
    doc.text('Certificate of Achievement', centerX, 48, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(55, 65, 81);
    doc.text('This certificate is proudly presented to', centerX, 68, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(17, 24, 39);
    doc.text(userName, centerX, 86, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(55, 65, 81);
    doc.text('for successfully completing the professional training course', centerX, 104, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(17, 24, 39);
    doc.text(course.title, centerX, 120, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(75, 85, 99);
    doc.text(`Completed on ${completionDate.toLocaleDateString()}`, centerX, 134, { align: 'center' });

    doc.setTextColor(30, 64, 175);
    doc.setFontSize(11);
    doc.text('Spatial AI Music Teacher Training', centerX, 150, { align: 'center' });

    doc.setDrawColor(156, 163, 175);
    doc.setLineWidth(0.5);
    doc.line(45, 165, 120, 165);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    doc.text('Dr. Amina Mwangi', 82.5, 160, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text('Program Director', 82.5, 172, { align: 'center' });

    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(1);
    doc.circle(pageWidth - 60, 162, 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 64, 175);
    doc.text('Spatial AI', pageWidth - 60, 158, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Official Stamp', pageWidth - 60, 164, { align: 'center' });
    doc.text('Kenya', pageWidth - 60, 170, { align: 'center' });

    doc.save(`${slugify(course.title)}-certificate.pdf`);
  };

  const resolveEmoji = (value) => {
    const emojiMap = {
      seedling: '🌱',
      rocket: '🚀',
      music: '🎵',
      sparkles: '✨',
      star: '⭐'
    };

    if (!value) return '✨';
    return emojiMap[value] || value;
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-4">
          {overviewContent?.title || 'Teacher Professional Development'}
        </h2>
        <p className="text-lg mb-6">
          {overviewContent?.description ||
            'Comprehensive training program for music educators to integrate AI composition and spatial audio technologies in their teaching practice.'}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {overviewStats.map((stat, index) => {
            const StatIcon = iconMap[stat.icon] || BookOpen;
            const statValue =
              stat.value ??
              (stat.label?.toLowerCase().includes('course') ? availableCourses.length : '—');

            return (
              <div key={stat.id || stat.label || index} className="bg-white/20 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <StatIcon className={statIconColors[index % statIconColors.length]} />
                  <span className="font-semibold">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold">{statValue}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning Pathways */}
      <div>
        <h3 className="text-2xl font-bold mb-6">
          {overviewContent?.pathwayTitle || 'Recommended Learning Pathways'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pathways.map((pathway, index) => {
            const theme = getPathwayTheme(pathway.theme);
            const steps = Array.isArray(pathway.steps) ? pathway.steps : [];

            return (
              <div
                key={pathway.id || pathway.title || index}
                className={`border-2 ${theme.border} ${theme.bg} p-6 rounded-lg`}
              >
                <h4 className={`text-xl font-bold ${theme.title} mb-4`}>
                  {resolveEmoji(pathway.emoji)} {pathway.title}
                </h4>
                <p className={`${theme.text} mb-4`}>{pathway.description}</p>
                <div className="space-y-2">
                  {steps.map((step, stepIndex) => (
                    <div
                      key={`${pathway.id || index}-step-${stepIndex}`}
                      className="flex items-center gap-2"
                    >
                      <span
                        className={`w-6 h-6 ${theme.badge} text-sm rounded-full flex items-center justify-center`}
                      >
                        {stepIndex + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
                {pathway.estimatedTime && (
                  <p className={`text-sm ${theme.time} mt-4`}>
                    ⏱ Estimated time: {pathway.estimatedTime}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderCoursesList = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">{courseContent?.title || 'Available Courses'}</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {availableCourses.map((course) => {
          const courseId =
            course.id ||
            course.slug ||
            course.title?.toLowerCase().replace(/\s+/g, '-') ||
            '';
          const enrollment = enrollmentMap.get(String(courseId));
          const isEnrolled = Boolean(enrollment);
          const ctaLabel = isEnrolled ? 'Resume Course' : 'Enroll Now';
          const modules = Array.isArray(course.modules) ? course.modules : [];
          const prerequisites = Array.isArray(course.prerequisites) ? course.prerequisites : [];

          return (
            <div key={course.id || course.title} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold">{course.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {course.estimatedHours}h
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      course.difficulty === 'beginner'
                        ? 'bg-green-100 text-green-800'
                        : course.difficulty === 'intermediate'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {course.difficulty}
                    </span>
                  </div>
                </div>
                {course.certificationRequired && (
                  <Award className="text-yellow-500" size={20} />
                )}
              </div>

              <p className="text-gray-700 mb-4">{course.description}</p>

              <div className="mb-4">
                <h5 className="font-semibold mb-2">Course Modules:</h5>
                <div className="space-y-1">
                  {modules.slice(0, 3).map((module, index) => (
                    <div key={module.id || index} className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        module.type === 'lesson'
                          ? 'bg-blue-400'
                          : module.type === 'practical'
                          ? 'bg-green-400'
                          : module.type === 'quiz'
                          ? 'bg-yellow-400'
                          : 'bg-purple-400'
                      }`} />
                      <span>{module.title}</span>
                      <span className="text-gray-500">({module.duration}min)</span>
                    </div>
                  ))}
                  {modules.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{modules.length - 3} more modules
                    </div>
                  )}
                </div>
              </div>

              {prerequisites.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-semibold mb-1 text-sm">Prerequisites:</h5>
                  <div className="text-sm text-gray-600">
                    {prerequisites.join(', ')}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCourseCta(course, isEnrolled)}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  {ctaLabel}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/courses/${courseId}?preview=true`)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Preview
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">My Learning Progress</h3>

      {/* Progress Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="text-blue-600" />
            <span className="font-semibold text-blue-800">Enrolled</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{enrolledCourseItems.length}</p>
          <p className="text-sm text-blue-600">Total courses</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="text-green-600" />
            <span className="font-semibold text-green-800">Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{completedCourseItems.length}</p>
          <p className="text-sm text-green-600">Finished courses</p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-yellow-600" />
            <span className="font-semibold text-yellow-800">Certificates</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">{certificateItems.length}</p>
          <p className="text-sm text-yellow-600">Ready to download</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="text-purple-600" />
            <span className="font-semibold text-purple-800">Average</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {enrolledCourseItems.length ? `${averageProgress}%` : '—'}
          </p>
          <p className="text-sm text-purple-600">Overall completion</p>
        </div>
      </div>

      {/* Current Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-semibold">Current Courses</h4>
          {activeCourseItems.length > 0 && (
            <span className="text-sm text-gray-500">{activeCourseItems.length} active</span>
          )}
        </div>
        <div className="space-y-4">
          {activeCourseItems.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-lg p-6 bg-white text-center">
              <p className="text-gray-600 mb-4">You're not currently enrolled in any courses.</p>
              <button
                type="button"
                onClick={() => setActiveSection('courses')}
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
              >
                Browse courses
              </button>
            </div>
          ) : (
            activeCourseItems.map(({ course, enrollment, courseId, progressValue }) => {
              const normalizedProgress = Math.max(0, Math.min(100, Number(progressValue) || 0));
              const modules = Array.isArray(course.modules) ? course.modules : [];
              let nextModule = null;
              for (let index = 0; index < modules.length; index += 1) {
                if (!isModuleComplete(courseId, getModuleId(modules[index], index))) {
                  nextModule = modules[index];
                  break;
                }
              }
              const lastAccessed = enrollment.lastAccessedAt ? new Date(enrollment.lastAccessedAt) : null;
              const lastAccessedText = lastAccessed && !Number.isNaN(lastAccessed.getTime())
                ? lastAccessed.toLocaleDateString()
                : null;
              const ctaLabel = normalizedProgress > 0 ? 'Resume' : 'Start';

              return (
                <div key={courseId} className="border rounded-lg p-4 bg-white">
                  <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                    <div>
                      <h5 className="font-semibold text-gray-900">{course.title}</h5>
                      <p className="text-sm text-gray-600">Progress: {normalizedProgress}% complete</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleContinue(course)}
                        className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        <Play size={14} />
                        {ctaLabel}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnenroll(courseId)}
                        className="px-3 py-1 rounded text-sm border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Unenroll
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${normalizedProgress}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {nextModule ? (
                      <span>Next: {nextModule.title}</span>
                    ) : (
                      <span>Modules ready to explore</span>
                    )}
                    {lastAccessedText && <span>Last accessed: {lastAccessedText}</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Certificates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-semibold">My Certificates</h4>
          {certificateItems.length > 0 && (
            <span className="text-sm text-gray-500">{certificateItems.length} earned</span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificateItems.length === 0 ? (
            <div className="border border-dashed border-yellow-200 bg-yellow-50 p-6 rounded-lg text-center md:col-span-2">
              <p className="text-yellow-800 font-medium">Complete a certified course to unlock your certificate.</p>
              <p className="text-sm text-yellow-700 mt-2">Certificates appear here once a course is marked complete.</p>
            </div>
          ) : (
            certificateItems.map(({ course, enrollment, courseId }) => {
              const completedDate = enrollment?.completedAt || enrollment?.updatedAt;
              const completionText = completedDate
                ? new Date(completedDate).toLocaleDateString()
                : 'Completed';

              return (
                <div key={courseId} className="border-2 border-yellow-200 bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="text-yellow-600" size={24} />
                    <div>
                      <h5 className="font-semibold text-yellow-800">{course.title}</h5>
                      <p className="text-sm text-yellow-700">Completed: {completionText}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-yellow-700">Status: Certified</span>
                    <button
                      type="button"
                      onClick={() => handleDownloadCertificate(course, enrollment)}
                      className="flex items-center gap-2 text-yellow-700 hover:text-yellow-800"
                    >
                      <Download size={14} />
                      Download PDF
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const renderResources = () => {
    const totalResources = resourceCategories.reduce((sum, category) => {
      const items = Array.isArray(category.items) ? category.items : [];
      return sum + items.length;
    }, 0);

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl font-bold">{resourceContent?.title || 'Teaching Resources'}</h3>
          {totalResources > 0 && (
            <span className="text-sm text-gray-500">{totalResources} resources</span>
          )}
        </div>

        {/* Resource Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resourceCategories.map((category, index) => {
            const CategoryIcon = iconMap[category.icon] || FileText;
            const items = Array.isArray(category.items) ? category.items : [];

            return (
              <div key={category.id || category.title || index} className="border rounded-lg p-4 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <CategoryIcon className={resourceIconColors[index % resourceIconColors.length]} />
                  <h4 className="font-semibold">{category.title}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <p className="text-sm text-gray-500">No resources in this category yet.</p>
                  ) : (
                    items.map((item, itemIndex) => {
                      const normalizedItem = typeof item === 'string'
                        ? { title: item, slug: getResourceSlug(item) }
                        : item;
                      const resourceSlug = getResourceSlug(normalizedItem);
                      const tags = Array.isArray(normalizedItem.tags) ? normalizedItem.tags : [];
                      const durationValue = normalizedItem.duration;
                      const durationText = durationValue !== undefined && durationValue !== null && durationValue !== ''
                        ? `${durationValue} min`
                        : null;

                      return (
                        <button
                          key={`${category.id || index}-item-${itemIndex}`}
                          type="button"
                          onClick={() => navigate(`/teacher-training/resources/${resourceSlug}`)}
                          className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900">{normalizedItem.title || 'Resource'}</p>
                              {normalizedItem.summary && (
                                <p className="text-xs text-gray-600 mt-1">{normalizedItem.summary}</p>
                              )}
                            </div>
                            <span className="text-xs text-blue-600 font-medium">View</span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-3">
                            {normalizedItem.type && (
                              <span className="px-2 py-1 rounded-full bg-white border border-gray-200">
                                {normalizedItem.type}
                              </span>
                            )}
                            {durationText && (
                              <span className="px-2 py-1 rounded-full bg-white border border-gray-200">
                                {durationText}
                              </span>
                            )}
                            {tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="px-2 py-1 rounded-full bg-white border border-gray-200">
                                {tag}
                              </span>
                            ))}
                            {tags.length > 3 && (
                              <span className="px-2 py-1 rounded-full bg-white border border-gray-200">
                                +{tags.length - 3}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex gap-6 overflow-x-auto whitespace-nowrap pb-1">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpen },
                { id: 'courses', label: 'Courses', icon: Users },
                { id: 'progress', label: 'My Progress', icon: BarChart3 },
                { id: 'resources', label: 'Resources', icon: FileText }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex items-center gap-2 py-4 px-3 border-b-2 font-medium text-sm flex-shrink-0 ${
                      activeSection === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div>
          {activeSection === 'overview' && renderOverview()}
          {activeSection === 'courses' && renderCoursesList()}
          {activeSection === 'progress' && renderProgress()}
          {activeSection === 'resources' && renderResources()}
        </div>
      </div>
    </div>
  );
};

export default TeacherTraining;
