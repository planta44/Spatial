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

const TeacherTraining = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [progress, setProgress] = useState({});

  // Mock course data (would come from backend)
  const availableCourses = [
    {
      id: 'ai-composition-basics',
      title: 'AI Composition Fundamentals',
      category: 'ai-composition',
      difficulty: 'beginner',
      estimatedHours: 4,
      description: 'Learn the basics of AI-assisted music composition, including melody generation and harmony analysis.',
      modules: [
        { id: 1, title: 'Introduction to AI in Music', duration: 30, type: 'lesson' },
        { id: 2, title: 'Understanding Music Theory for AI', duration: 45, type: 'lesson' },
        { id: 3, title: 'Hands-on: Generate Your First Melody', duration: 60, type: 'practical' },
        { id: 4, title: 'Knowledge Check: AI Composition', duration: 15, type: 'quiz' }
      ],
      prerequisites: [],
      certificationRequired: true
    },
    {
      id: 'spatial-audio-intro',
      title: 'Spatial Audio in Education',
      category: 'spatial-audio',
      difficulty: 'beginner',
      estimatedHours: 3,
      description: 'Understanding spatial audio concepts and their application in music education.',
      modules: [
        { id: 1, title: 'What is Spatial Audio?', duration: 40, type: 'lesson' },
        { id: 2, title: 'Web Audio API Fundamentals', duration: 50, type: 'lesson' },
        { id: 3, title: 'Creating Your First 3D Audio Scene', duration: 70, type: 'practical' },
        { id: 4, title: 'Assessment: Spatial Audio Concepts', duration: 20, type: 'quiz' }
      ],
      prerequisites: [],
      certificationRequired: true
    },
    {
      id: 'reaper-ambisonics',
      title: 'Reaper for Ambisonics Production',
      category: 'teacher-training',
      difficulty: 'intermediate',
      estimatedHours: 6,
      description: 'Complete guide to using Reaper DAW for immersive audio production.',
      modules: [
        { id: 1, title: 'Reaper Setup for Ambisonics', duration: 45, type: 'lesson' },
        { id: 2, title: 'Recording Techniques', duration: 60, type: 'lesson' },
        { id: 3, title: 'Mixing and Panning', duration: 75, type: 'practical' },
        { id: 4, title: 'Final Project: Complete Ambisonic Mix', duration: 90, type: 'assignment' },
        { id: 5, title: 'Certification Exam', duration: 30, type: 'quiz' }
      ],
      prerequisites: ['spatial-audio-intro'],
      certificationRequired: true
    },
    {
      id: 'academic-integrity',
      title: 'Academic Integrity with AI Tools',
      category: 'policy',
      difficulty: 'beginner',
      estimatedHours: 2,
      description: 'Ethical considerations and best practices when using AI in academic settings.',
      modules: [
        { id: 1, title: 'Understanding AI Ethics in Education', duration: 30, type: 'lesson' },
        { id: 2, title: 'Plagiarism vs. AI Assistance', duration: 40, type: 'lesson' },
        { id: 3, title: 'Creating Fair Assessment Criteria', duration: 35, type: 'practical' },
        { id: 4, title: 'Policy Quiz', duration: 15, type: 'quiz' }
      ],
      prerequisites: [],
      certificationRequired: true
    }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Teacher Professional Development</h2>
        <p className="text-lg mb-6">
          Comprehensive training program for music educators to integrate AI composition 
          and spatial audio technologies in their teaching practice.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/20 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="text-yellow-300" />
              <span className="font-semibold">Courses Available</span>
            </div>
            <p className="text-2xl font-bold">{availableCourses.length}</p>
          </div>
          <div className="bg-white/20 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-green-300" />
              <span className="font-semibold">Active Learners</span>
            </div>
            <p className="text-2xl font-bold">150+</p>
          </div>
          <div className="bg-white/20 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Award className="text-purple-300" />
              <span className="font-semibold">Certificates Issued</span>
            </div>
            <p className="text-2xl font-bold">89</p>
          </div>
        </div>
      </div>

      {/* Learning Pathways */}
      <div>
        <h3 className="text-2xl font-bold mb-6">Recommended Learning Pathways</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Beginner Path */}
          <div className="border-2 border-green-200 bg-green-50 p-6 rounded-lg">
            <h4 className="text-xl font-bold text-green-800 mb-4">🌱 Beginner Path</h4>
            <p className="text-green-700 mb-4">New to AI and spatial audio? Start here!</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-green-600 text-white text-sm rounded-full flex items-center justify-center">1</span>
                <span>AI Composition Fundamentals</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-green-600 text-white text-sm rounded-full flex items-center justify-center">2</span>
                <span>Spatial Audio in Education</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-green-600 text-white text-sm rounded-full flex items-center justify-center">3</span>
                <span>Academic Integrity with AI</span>
              </div>
            </div>
            <p className="text-sm text-green-600 mt-4">⏱ Estimated time: 9 hours</p>
          </div>

          {/* Advanced Path */}
          <div className="border-2 border-blue-200 bg-blue-50 p-6 rounded-lg">
            <h4 className="text-xl font-bold text-blue-800 mb-4">🚀 Advanced Path</h4>
            <p className="text-blue-700 mb-4">Ready for professional-level skills?</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white text-sm rounded-full flex items-center justify-center">1</span>
                <span>Complete Beginner Path</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white text-sm rounded-full flex items-center justify-center">2</span>
                <span>Reaper for Ambisonics</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white text-sm rounded-full flex items-center justify-center">3</span>
                <span>Advanced AI Composition</span>
              </div>
            </div>
            <p className="text-sm text-blue-600 mt-4">⏱ Estimated time: 15 hours total</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCoursesList = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Available Courses</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {availableCourses.map(course => (
          <div key={course.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
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
                {course.modules.slice(0, 3).map((module, index) => (
                  <div key={module.id} className="flex items-center gap-2 text-sm">
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
                {course.modules.length > 3 && (
                  <div className="text-sm text-gray-500">
                    +{course.modules.length - 3} more modules
                  </div>
                )}
              </div>
            </div>
            
            {course.prerequisites.length > 0 && (
              <div className="mb-4">
                <h5 className="font-semibold mb-1 text-sm">Prerequisites:</h5>
                <div className="text-sm text-gray-600">
                  {course.prerequisites.join(', ')}
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
        ))}
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
      <h3 className="text-2xl font-bold">Teaching Resources</h3>
      
      {/* Resource Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="text-blue-600" />
            <h4 className="font-semibold">Lesson Plans</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Ready-to-use lesson plans for integrating AI composition and spatial audio.
          </p>
          <div className="space-y-2">
            <button className="w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100 text-sm">
              📝 Introduction to AI Music Tools
            </button>
            <button className="w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100 text-sm">
              🎵 Spatial Audio Listening Exercise
            </button>
            <button className="w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100 text-sm">
              🎹 Collaborative Composition Project
            </button>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Download className="text-green-600" />
            <h4 className="font-semibold">Assessment Tools</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Rubrics and assessment criteria for evaluating student work with AI tools.
          </p>
          <div className="space-y-2">
            <button className="w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100 text-sm">
              📊 AI Composition Rubric
            </button>
            <button className="w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100 text-sm">
              🎧 Spatial Audio Project Checklist
            </button>
            <button className="w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100 text-sm">
              ✅ Academic Integrity Guidelines
            </button>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Play className="text-purple-600" />
            <h4 className="font-semibold">Video Tutorials</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Step-by-step video guides for teachers and students.
          </p>
          <div className="space-y-2">
            <button className="w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100 text-sm">
              🎥 Setting Up Your First AI Project
            </button>
            <button className="w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100 text-sm">
              🎬 Recording for Spatial Audio
            </button>
            <button className="w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100 text-sm">
              📹 Student Portfolio Examples
            </button>
          </div>
        </div>
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
