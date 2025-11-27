const Course = require('../models/Course');
const University = require('../models/University');
const { successResponse, errorResponse } = require('../utils/helpers');

const buildCurriculumModules = ({ weeks, topic, focusAreas = [], difficulty }) => {
  const totalWeeks = Math.max(4, Math.min(weeks || 14, 52));
  const modules = [];

  const baseFocus = focusAreas.length
    ? focusAreas
    : ['foundations', 'practice', 'assessment', 'technology'];

  for (let week = 1; week <= totalWeeks; week += 1) {
    const phaseIndex = week - 1;
    const phase = baseFocus[phaseIndex % baseFocus.length];

    const title =
      phase === 'foundations'
        ? `Week ${week}: Core Concepts in ${topic}`
        : phase === 'practice'
        ? `Week ${week}: Applied ${topic} Studio`
        : phase === 'assessment'
        ? `Week ${week}: Assessment & Reflection`
        : `Week ${week}: Technology & Innovation`;

    const difficultyLabel =
      difficulty === 'advanced'
        ? 'Advanced'
        : difficulty === 'intermediate'
        ? 'Intermediate'
        : 'Introductory';

    modules.push({
      week,
      title,
      phase,
      overview: `${difficultyLabel} module focusing on ${topic} with emphasis on ${phase}.`,
      learningOutcomes: [
        `Explain key principles of ${topic} in the context of Kenyan university music programmes.`,
        `Apply Spatial AI tools to ${phase} tasks in teaching and learning.`,
      ],
      activities: [
        `Guided lecture or seminar on ${topic}.`,
        `Hands-on exercise using Spatial AI platform features.`,
        'Small-group discussion or peer feedback session.',
      ],
      assessments: [
        'Short reflective journal or teaching note.',
        'Practical task evaluated with a rubric.',
      ],
      resources: [
        'Platform resource library items tagged for this topic.',
        'Locally relevant policy or curriculum documents.',
      ],
    });
  }

  return modules;
};

const generateCurriculum = async (req, res) => {
  try {
    const {
      title,
      description,
      category = 'teacher-training',
      difficulty = 'intermediate',
      weeks = 14,
      hoursPerWeek = 3,
      focusAreas,
      learningOutcomes,
      universityId,
    } = req.body || {};

    const trimmedTitle = (title || '').trim();

    if (!trimmedTitle) {
      return errorResponse(res, 400, 'Title is required for curriculum generation');
    }

    const inferredTopic =
      trimmedTitle.replace(/course|module|training/gi, '').trim() ||
      'Spatial AI for Music Education';
    const inferredFocus = Array.isArray(focusAreas)
      ? focusAreas
      : ['foundations', 'practice', 'assessment', 'technology'];

    const modules = buildCurriculumModules({
      weeks,
      topic: inferredTopic,
      focusAreas: inferredFocus,
      difficulty,
    });

    const coreOutcomes =
      Array.isArray(learningOutcomes) && learningOutcomes.length
        ? learningOutcomes
        : [
            'Integrate Spatial AI tools into music teaching and assessment.',
            'Design learning activities that link spatial audio, composition, and policy.',
            'Evaluate student work using transparent, AI-aware rubrics.',
          ];

    const estimatedHours = Math.max(1, Math.round((weeks || 14) * (hoursPerWeek || 3)));

    let universityMeta = null;
    if (universityId) {
      universityMeta = await University.findByPk(universityId).catch(() => null);
    }

    const curriculum = {
      title: trimmedTitle,
      description:
        description ||
        `Automatically generated syllabus for ${inferredTopic} using Spatial AI Curriculum Studio.`,
      category,
      difficulty,
      estimatedHours,
      modules,
      outcomes: coreOutcomes,
      meta: {
        weeks: weeks || 14,
        hoursPerWeek: hoursPerWeek || 3,
        university: universityMeta
          ? { id: universityMeta.id, name: universityMeta.name, country: universityMeta.country }
          : null,
      },
    };

    const canPersist = req.user && req.user.id;
    let persistedCourse = null;

    if (canPersist) {
      try {
        persistedCourse = await Course.create({
          title: curriculum.title,
          description: curriculum.description,
          category,
          difficulty,
          estimatedHours,
          modules,
          downloadableResources: [],
          prerequisites: [],
          certificationRequired: false,
          authorId: req.user.id,
          universityId: universityMeta ? universityMeta.id : null,
          curriculumStandards: {},
          policyGuidelines: {},
          isPublished: false,
          enrollmentCount: 0,
          averageRating: 0.0,
          tags: ['auto-generated', 'curriculum-studio'],
        });
      } catch (err) {
        console.error('Error persisting generated curriculum:', err);
      }
    }

    return successResponse(res, 201, 'Curriculum generated successfully', {
      curriculum,
      course: persistedCourse,
    });
  } catch (error) {
    console.error('Curriculum generation error:', error);
    return errorResponse(res, 500, 'Failed to generate curriculum');
  }
};

module.exports = {
  generateCurriculum,
};

