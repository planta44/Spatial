export const PAGE_CONTENT_SLUGS = {
  HOME: 'home',
  FOOTER: 'footer',
  TEACHER_OVERVIEW: 'teacher-training-overview',
  TEACHER_COURSES: 'teacher-training-courses',
  TEACHER_RESOURCES: 'teacher-training-resources',
  POLICIES: 'policies',
};

export const PAGE_CONTENT_OPTIONS = [
  {
    slug: PAGE_CONTENT_SLUGS.HOME,
    label: 'Homepage',
    description: 'Hero copy, stats, feature cards, and CTA settings.'
  },
  {
    slug: PAGE_CONTENT_SLUGS.FOOTER,
    label: 'Footer',
    description: 'Footer copy, colors, quick links, and connect avatars.'
  },
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

const defaultHome = {
  hero: {
    title: 'Spatial AI for Music Teacher Training',
    subtitle: 'Policy, Resources, and Scalability in Kenyan Universities',
    description:
      'Empowering music educators with cutting-edge spatial audio technology, comprehensive training resources, and scalable implementation frameworks.',
    primaryCtaLabel: 'Explore Training',
    primaryCtaLink: '/training',
    secondaryCtaLabel: 'Browse Resources',
    secondaryCtaLink: '/resources',
    gradient: {
      from: '#2563eb',
      via: '#1d4ed8',
      to: '#7c3aed'
    }
  },
  stats: [
    { value: 20, label: 'Universities', suffix: '+' },
    { value: 500, label: 'Teachers Trained', suffix: '+' },
    { value: 1000, label: 'Resources', suffix: '+' },
    { value: 95, label: 'Satisfaction Rate', suffix: '%' }
  ],
  featuresTitle: 'Key Features',
  featuresSubtitle: 'Everything you need to transform music education in your institution',
  features: [
    {
      icon: 'Headphones',
      title: 'Spatial Audio Engine',
      description: 'Advanced 3D audio analysis and visualization tools for immersive music education.',
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      icon: 'GraduationCap',
      title: 'Teacher Training',
      description: 'Comprehensive modules designed specifically for music teacher professional development.',
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      icon: 'FileText',
      title: 'Policy Framework',
      description: 'Track and manage educational policies across multiple Kenyan universities.',
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      icon: 'TrendingUp',
      title: 'Scalability Dashboard',
      description: 'Monitor deployment, track metrics, and scale programs university-wide.',
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    },
    {
      icon: 'Users',
      title: 'Collaborative Learning',
      description: 'Connect educators across institutions to share knowledge and best practices.',
      color: 'text-pink-600',
      bg: 'bg-pink-100'
    },
    {
      icon: 'Waves',
      title: 'Resource Library',
      description: 'Access curated music education materials, from theory to practical applications.',
      color: 'text-cyan-600',
      bg: 'bg-cyan-100'
    }
  ],
  cta: {
    title: 'Ready to Transform Music Education?',
    description: 'Join hundreds of educators already using Spatial AI to enhance their teaching.',
    buttonLabel: 'Get Started Today',
    buttonLink: '/admin',
    gradient: {
      from: '#2563eb',
      to: '#7c3aed'
    }
  }
};

const defaultFooter = {
  brand: {
    name: 'Spatial AI',
    description:
      'Transforming music teacher training through spatial audio technology and AI-powered solutions for Kenyan universities.',
    tagline: 'Policy, Resources, and Scalability in Music Education'
  },
  quickLinks: [
    { label: 'Training Programs', url: '/training' },
    { label: 'Resource Library', url: '/resources' },
    { label: 'Policy Framework', url: '/policies' }
  ],
  connectTitle: 'Connect',
  connectLinks: [
    { label: 'info@spatialai.edu', url: 'mailto:info@spatialai.edu', icon: 'Mail', avatarUrl: '' },
    { label: 'GitHub', url: '#', icon: 'Github', avatarUrl: '' },
    { label: 'LinkedIn', url: '#', icon: 'Linkedin', avatarUrl: '' }
  ],
  styles: {
    backgroundColor: '#111827',
    textColor: '#d1d5db',
    headingColor: '#ffffff',
    accentColor: '#60a5fa',
    borderColor: '#1f2937'
  },
  bottomText: 'Spatial AI for Music Teacher Training. All rights reserved.'
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
        {
          id: 'intro-ai-music-tools',
          title: 'Introduction to AI Music Tools',
          slug: 'introduction-to-ai-music-tools',
          summary: 'A classroom-ready primer on AI composition, safe tool use, and lesson framing.',
          type: 'lesson',
          duration: 45,
          tags: ['ai', 'composition', 'foundations'],
          content: `# Overview
Introduce educators to the core capabilities of AI music tools while setting clear boundaries for ethical, student-centered use.

## Lesson flow
- Warm-up: listen and describe AI-generated clips
- Guided demo: melody and harmony generation
- Create: students iterate on 8-bar motifs
- Share: peer feedback using a listening checklist

## Teaching notes
- Require attribution of AI prompts and settings
- Pair AI drafts with human revisions
- Use reflection journals to evaluate choices`,
          downloadUrl: '',
          externalUrl: '',
        },
        {
          id: 'spatial-audio-listening-exercise',
          title: 'Spatial Audio Listening Exercise',
          slug: 'spatial-audio-listening-exercise',
          summary: 'Guided listening protocol for space, movement, and depth in audio.',
          type: 'exercise',
          duration: 35,
          tags: ['spatial-audio', 'listening'],
          content: `# Overview
Help students identify spatial cues such as distance, height, and motion using curated listening prompts.

## Activity steps
- Play three short excerpts with contrasting spatial placement
- Ask students to map the sound positions on a simple stage diagram
- Discuss how space changes the emotional impact

## Extension
- Invite students to remix a short clip with new spatial positioning
- Reflect on how movement influences storytelling`,
          downloadUrl: '',
          externalUrl: '',
        },
        {
          id: 'collaborative-composition-project',
          title: 'Collaborative Composition Project',
          slug: 'collaborative-composition-project',
          summary: 'Team-based project brief with milestones, roles, and reflective prompts.',
          type: 'project',
          duration: 60,
          tags: ['collaboration', 'project-based'],
          content: `# Overview
Student teams co-compose a short piece using AI tools and spatial audio techniques, then document their creative choices.

## Milestones
- Week 1: establish concept, roles, and prompt strategy
- Week 2: draft composition and spatial plan
- Week 3: refine, mix, and prepare presentation

## Deliverables
- Final audio export
- Process journal with prompt history
- Peer feedback summary`,
          downloadUrl: '',
          externalUrl: '',
        },
      ],
    },
    {
      id: 'assessment-tools',
      title: 'Assessment Tools',
      description: 'Rubrics and assessment criteria for evaluating student work with AI tools.',
      icon: 'Download',
      items: [
        {
          id: 'ai-composition-rubric',
          title: 'AI Composition Rubric',
          slug: 'ai-composition-rubric',
          summary: 'Criteria for evaluating creativity, technique, and responsible AI usage.',
          type: 'rubric',
          duration: 20,
          tags: ['assessment', 'rubric'],
          content: `# Rubric categories
- Musical originality and structure
- AI tool integration and attribution
- Spatial audio craft and clarity
- Presentation quality

## Scoring guidance
- 4: exceeds expectations with clear artistic intent
- 3: meets expectations with minor gaps
- 2: developing skills or missing documentation
- 1: incomplete or lacks understanding`,
          downloadUrl: '',
          externalUrl: '',
        },
        {
          id: 'spatial-audio-project-checklist',
          title: 'Spatial Audio Project Checklist',
          slug: 'spatial-audio-project-checklist',
          summary: 'Step-by-step checklist for planning and finishing spatial audio projects.',
          type: 'checklist',
          duration: 25,
          tags: ['assessment', 'checklist'],
          content: `# Pre-project
- Confirm playback system and headphones
- Set spatial goals for the composition
- Document AI tools and prompt plan

## Production
- Balance levels and spatial movement
- Test on at least two devices
- Log revisions and feedback

## Submission
- Export final mix and session file
- Include reflection and attribution notes`,
          downloadUrl: '',
          externalUrl: '',
        },
        {
          id: 'academic-integrity-guidelines',
          title: 'Academic Integrity Guidelines',
          slug: 'academic-integrity-guidelines',
          summary: 'Policy-aligned guidelines for ethical AI use and attribution.',
          type: 'guidelines',
          duration: 15,
          tags: ['policy', 'integrity'],
          content: `# Core expectations
- Students must disclose AI tools and prompt inputs
- AI output requires human revision and critique
- Source materials must be cited in reflections

## Prohibited practices
- Submitting unedited AI output as original work
- Omitting tool usage or prompt history
- Using AI to bypass learning objectives

## Support tips
- Model transparent attribution in class
- Use short reflection prompts after each project`,
          downloadUrl: '',
          externalUrl: '',
        },
      ],
    },
    {
      id: 'video-tutorials',
      title: 'Video Tutorials',
      description: 'Step-by-step video guides for teachers and students.',
      icon: 'Play',
      items: [
        {
          id: 'setting-up-first-ai-project',
          title: 'Setting Up Your First AI Project',
          slug: 'setting-up-your-first-ai-project',
          summary: 'Quick-start walkthrough for tools, files, and prompt setup.',
          type: 'video',
          duration: 12,
          tags: ['video', 'setup'],
          content: `# Quick-start agenda
- Choose a simple theme and tempo
- Generate a draft melody with AI assistance
- Save prompt history and version notes
- Export stems for spatial mixing`,
          downloadUrl: '',
          externalUrl: '',
        },
        {
          id: 'recording-for-spatial-audio',
          title: 'Recording for Spatial Audio',
          slug: 'recording-for-spatial-audio',
          summary: 'Mic placement, room prep, and capture tips for spatial mixes.',
          type: 'video',
          duration: 18,
          tags: ['video', 'recording'],
          content: `# Topics covered
- Room preparation and noise control
- Capturing clean mono sources
- Building stereo and spatial layers
- Quick checks before mixing`,
          downloadUrl: '',
          externalUrl: '',
        },
        {
          id: 'student-portfolio-examples',
          title: 'Student Portfolio Examples',
          slug: 'student-portfolio-examples',
          summary: 'Annotated exemplars to help students self-assess their work.',
          type: 'video',
          duration: 10,
          tags: ['video', 'portfolio'],
          content: `# What to highlight
- Creative intent statement
- Prompt history and AI contribution notes
- Spatial mix screenshots or diagrams
- Reflection on revisions`,
          downloadUrl: '',
          externalUrl: '',
        },
      ],
    },
  ],
};

const defaultPolicies = [
  {
    id: 1,
    title: 'National Spatial Audio Integration Framework',
    slug: 'national-spatial-audio-integration-framework',
    category: 'curriculum',
    scope: 'national',
    status: 'active',
    universities: 15,
    studentsReached: 3500,
    budget: 5000000,
    startDate: '2023-01-15',
    description: 'Comprehensive framework for integrating spatial audio technology into music education curricula across Kenyan universities.',
    keyPoints: [
      'Curriculum integration roadmap',
      'Equipment and lab standards',
      'Faculty development plan',
      'Assessment benchmarks',
    ],
    content: `# Overview
This framework defines how spatial audio should be embedded into music technology programs across the country.

## Implementation priorities
- Align learning outcomes across universities
- Establish shared studio and lab requirements
- Provide teacher upskilling pathways

## Monitoring
Annual reviews will track adoption, outcomes, and resource gaps.`,
  },
  {
    id: 2,
    title: 'Teacher Training Certification Standards',
    slug: 'teacher-training-certification-standards',
    category: 'training',
    scope: 'national',
    status: 'active',
    universities: 12,
    studentsReached: 450,
    budget: 2500000,
    startDate: '2023-03-10',
    description: 'Standardized certification requirements for music educators specializing in spatial audio technology.',
    keyPoints: [
      'Core pedagogy requirements',
      'Spatial audio production skills',
      'Assessment and evaluation standards',
    ],
    content: `# Certification focus
The certification ensures educators can deliver spatial audio curricula with confidence and consistency.

## Required modules
- Spatial audio theory and listening skills
- Production workflows and toolchains
- Classroom-ready lesson planning

## Renewal cadence
Certifications are renewed every two years to reflect evolving tools.`,
  },
  {
    id: 3,
    title: 'Technology Infrastructure Guidelines',
    slug: 'technology-infrastructure-guidelines',
    category: 'infrastructure',
    scope: 'institutional',
    status: 'under-review',
    universities: 8,
    studentsReached: 1200,
    budget: 8000000,
    startDate: '2023-06-01',
    description: 'Guidelines for setting up and maintaining spatial audio labs and equipment in university settings.',
    keyPoints: [
      'Studio hardware baselines',
      'Network and storage requirements',
      'Maintenance and support plan',
    ],
    content: `# Infrastructure guidance
These guidelines define minimum technical requirements for spatial audio labs.

## Recommended setup
- 24+ channel audio interfaces
- Multichannel monitoring arrays
- Dedicated rendering workstations

## Support
Institutions should allocate annual budgets for hardware refresh cycles.`,
  },
  {
    id: 4,
    title: 'Quality Assurance for Spatial Audio Programs',
    slug: 'quality-assurance-for-spatial-audio-programs',
    category: 'quality-assurance',
    scope: 'regional',
    status: 'active',
    universities: 6,
    studentsReached: 800,
    budget: 1500000,
    startDate: '2023-04-20',
    description: 'Quality standards and assessment criteria for spatial audio training programs.',
    keyPoints: [
      'Program review cadence',
      'Student outcomes measurement',
      'Industry feedback loops',
    ],
    content: `# Quality assurance
This policy defines how regional programs will be evaluated and improved.

## Evaluation criteria
- Curriculum alignment with national benchmarks
- Student portfolio review standards
- Graduate placement tracking

## Reporting
Regional reports are published each semester for transparency.`,
  },
];

const defaultPolicyStats = [
  { icon: 'FileText', label: 'Total Policies', value: defaultPolicies.length, color: 'text-blue-600', bg: 'bg-blue-100' },
  { icon: 'Users', label: 'Universities Involved', value: '20+', color: 'text-green-600', bg: 'bg-green-100' },
  { icon: 'TrendingUp', label: 'Students Reached', value: '6K+', color: 'text-purple-600', bg: 'bg-purple-100' },
  { icon: 'DollarSign', label: 'Total Budget (KES)', value: '17.5M', color: 'text-orange-600', bg: 'bg-orange-100' },
];

export const DEFAULT_PAGE_CONTENT = {
  [PAGE_CONTENT_SLUGS.HOME]: defaultHome,
  [PAGE_CONTENT_SLUGS.FOOTER]: defaultFooter,
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
