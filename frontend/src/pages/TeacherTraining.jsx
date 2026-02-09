import React, { useState, useEffect } from 'react';
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
import { pageContentsAPI } from '../services/api';
import { PAGE_CONTENT_SLUGS, getDefaultPageContent } from '../utils/pageContentDefaults';

const TeacherTraining = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [progress, setProgress] = useState({});

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
                <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                  Enroll Now
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="text-blue-600" />
            <span className="font-semibold text-blue-800">Enrolled</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">3</p>
          <p className="text-sm text-blue-600">Active courses</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="text-green-600" />
            <span className="font-semibold text-green-800">Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-900">1</p>
          <p className="text-sm text-green-600">Finished courses</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-yellow-600" />
            <span className="font-semibold text-yellow-800">Certificates</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">1</p>
          <p className="text-sm text-yellow-600">Earned certificates</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="text-purple-600" />
            <span className="font-semibold text-purple-800">Average</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">87%</p>
          <p className="text-sm text-purple-600">Quiz scores</p>
        </div>
      </div>
      
      {/* Current Courses */}
      <div>
        <h4 className="text-xl font-semibold mb-4">Current Courses</h4>
        <div className="space-y-4">
          {/* Mock enrolled course */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h5 className="font-semibold">AI Composition Fundamentals</h5>
                <p className="text-sm text-gray-600">Progress: 65% complete</p>
              </div>
              <button className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                <Play size={14} />
                Continue
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }} />
            </div>
            <p className="text-sm text-gray-600">
              Next: Hands-on: Generate Your First Melody
            </p>
          </div>
        </div>
      </div>
      
      {/* Certificates */}
      <div>
        <h4 className="text-xl font-semibold mb-4">My Certificates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mock certificate */}
          <div className="border-2 border-yellow-200 bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="text-yellow-600" size={24} />
              <div>
                <h5 className="font-semibold text-yellow-800">Academic Integrity with AI Tools</h5>
                <p className="text-sm text-yellow-700">Completed: November 15, 2024</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-yellow-700">Score: 92%</span>
              <button className="flex items-center gap-2 text-yellow-700 hover:text-yellow-800">
                <Download size={14} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">{resourceContent?.title || 'Teaching Resources'}</h3>
      
      {/* Resource Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resourceCategories.map((category, index) => {
          const CategoryIcon = iconMap[category.icon] || FileText;
          const items = Array.isArray(category.items) ? category.items : [];

          return (
            <div key={category.id || category.title || index} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CategoryIcon className={resourceIconColors[index % resourceIconColors.length]} />
                <h4 className="font-semibold">{category.title}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">{category.description}</p>
              <div className="space-y-2">
                {items.map((item, itemIndex) => (
                  <button
                    key={`${category.id || index}-item-${itemIndex}`}
                    className="w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100 text-sm"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
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
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
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
