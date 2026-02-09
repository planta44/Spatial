export const PAGE_CONTENT_SLUGS = {
  TEACHER_OVERVIEW: 'teacher-training-overview',
  TEACHER_COURSES: 'teacher-training-courses',
  TEACHER_RESOURCES: 'teacher-training-resources',
  POLICIES: 'policies',
};

export const PAGE_CONTENT_OPTIONS = [
  {
    slug: PAGE_CONTENT_SLUGS.TEACHER_OVERVIEW,
    label: 'Teacher Training - Overview',
    description: 'Hero copy, stats, and learning pathways.'
  },
  {
    slug: PAGE_CONTENT_SLUGS.TEACHER_COURSES,
    label: 'Teacher Training - Courses',
    description: 'Course catalog and module descriptions.'
  },
  {
    slug: PAGE_CONTENT_SLUGS.TEACHER_RESOURCES,
    label: 'Teacher Training - Resources',
    description: 'Teaching resource categories and downloads.'
  },
  {
    slug: PAGE_CONTENT_SLUGS.POLICIES,
    label: 'Policies Page',
    description: 'Policy list, stats, and header text.'
  },
];

const defaultCourses = [
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
      { id: 4, title: 'Knowledge Check: AI Composition', duration: 15, type: 'quiz' },
    ],
    prerequisites: [],
    certificationRequired: true,
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
      { id: 4, title: 'Assessment: Spatial Audio Concepts', duration: 20, type: 'quiz' },
    ],
    prerequisites: [],
    certificationRequired: true,
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
      { id: 5, title: 'Certification Exam', duration: 30, type: 'quiz' },
    ],
    prerequisites: ['spatial-audio-intro'],
    certificationRequired: true,
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
      { id: 4, title: 'Policy Quiz', duration: 15, type: 'quiz' },
    ],
    prerequisites: [],
    certificationRequired: true,
  },
];

const defaultOverview = {
  title: 'Teacher Professional Development',
  description: 'Comprehensive training program for music educators to integrate AI composition and spatial audio technologies in their teaching practice.',
  stats: [
    { label: 'Courses Available', value: defaultCourses.length, icon: 'BookOpen' },
    { label: 'Active Learners', value: '150+', icon: 'Users' },
    { label: 'Certificates Issued', value: '89', icon: 'Award' },
  ],
  pathways: [
    {
      id: 'beginner-path',
      title: 'Beginner Path',
      emoji: 'seedling',
      description: 'New to AI and spatial audio? Start here!',
      steps: [
        'AI Composition Fundamentals',
        'Spatial Audio in Education',
        'Academic Integrity with AI',
      ],
      estimatedTime: '9 hours',
      theme: 'green',
    },
    {
      id: 'advanced-path',
      title: 'Advanced Path',
      emoji: 'rocket',
      description: 'Ready for professional-level skills?',
      steps: [
        'Complete Beginner Path',
        'Reaper for Ambisonics',
        'Advanced AI Composition',
      ],
      estimatedTime: '15 hours total',
      theme: 'blue',
    },
  ],
};

const defaultResources = {
  title: 'Teaching Resources',
  categories: [
    {
      id: 'lesson-plans',
      title: 'Lesson Plans',
      description: 'Ready-to-use lesson plans for integrating AI composition and spatial audio.',
      icon: 'FileText',
      items: [
        'Introduction to AI Music Tools',
        'Spatial Audio Listening Exercise',
        'Collaborative Composition Project',
      ],
    },
    {
      id: 'assessment-tools',
      title: 'Assessment Tools',
      description: 'Rubrics and assessment criteria for evaluating student work with AI tools.',
      icon: 'Download',
      items: [
        'AI Composition Rubric',
        'Spatial Audio Project Checklist',
        'Academic Integrity Guidelines',
      ],
    },
    {
      id: 'video-tutorials',
      title: 'Video Tutorials',
      description: 'Step-by-step video guides for teachers and students.',
      icon: 'Play',
      items: [
        'Setting Up Your First AI Project',
        'Recording for Spatial Audio',
        'Student Portfolio Examples',
      ],
    },
  ],
};

const defaultPolicies = [
  {
    id: 1,
    title: 'National Spatial Audio Integration Framework',
    category: 'curriculum',
    scope: 'national',
    status: 'active',
    universities: 15,
    studentsReached: 3500,
    budget: 5000000,
    startDate: '2023-01-15',
    description: 'Comprehensive framework for integrating spatial audio technology into music education curricula across Kenyan universities.',
  },
  {
    id: 2,
    title: 'Teacher Training Certification Standards',
    category: 'training',
    scope: 'national',
    status: 'active',
    universities: 12,
    studentsReached: 450,
    budget: 2500000,
    startDate: '2023-03-10',
    description: 'Standardized certification requirements for music educators specializing in spatial audio technology.',
  },
  {
    id: 3,
    title: 'Technology Infrastructure Guidelines',
    category: 'infrastructure',
    scope: 'institutional',
    status: 'under-review',
    universities: 8,
    studentsReached: 1200,
    budget: 8000000,
    startDate: '2023-06-01',
    description: 'Guidelines for setting up and maintaining spatial audio labs and equipment in university settings.',
  },
  {
    id: 4,
    title: 'Quality Assurance for Spatial Audio Programs',
    category: 'quality-assurance',
    scope: 'regional',
    status: 'active',
    universities: 6,
    studentsReached: 800,
    budget: 1500000,
    startDate: '2023-04-20',
    description: 'Quality standards and assessment criteria for spatial audio training programs.',
  },
];

const defaultPolicyStats = [
  { icon: 'FileText', label: 'Total Policies', value: defaultPolicies.length, color: 'text-blue-600', bg: 'bg-blue-100' },
  { icon: 'Users', label: 'Universities Involved', value: '20+', color: 'text-green-600', bg: 'bg-green-100' },
  { icon: 'TrendingUp', label: 'Students Reached', value: '6K+', color: 'text-purple-600', bg: 'bg-purple-100' },
  { icon: 'DollarSign', label: 'Total Budget (KES)', value: '17.5M', color: 'text-orange-600', bg: 'bg-orange-100' },
];

export const DEFAULT_PAGE_CONTENT = {
  [PAGE_CONTENT_SLUGS.TEACHER_OVERVIEW]: defaultOverview,
  [PAGE_CONTENT_SLUGS.TEACHER_COURSES]: {
    title: 'Available Courses',
    courses: defaultCourses,
  },
  [PAGE_CONTENT_SLUGS.TEACHER_RESOURCES]: defaultResources,
  [PAGE_CONTENT_SLUGS.POLICIES]: {
    title: 'Policy Framework',
    subtitle: 'Educational policies for scaling spatial audio training across Kenyan universities',
    stats: defaultPolicyStats,
    policies: defaultPolicies,
  },
};

export const getDefaultPageContent = (slug) => {
  const content = DEFAULT_PAGE_CONTENT[slug];
  return content ? JSON.parse(JSON.stringify(content)) : {};
};
