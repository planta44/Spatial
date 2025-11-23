const Composition = require('../models/Composition');
const Course = require('../models/Course');
const aiCompositionService = require('../services/aiCompositionService');
const { successResponse, errorResponse } = require('../utils/helpers');

// Generate AI melody
const generateMelody = async (req, res) => {
  try {
    const { key, length, style, complexity, tempo } = req.body;
    const userId = req.user.id;

    // Generate melody using AI service
    const generatedMelody = aiCompositionService.generateMelody({
      key: key || 'C major',
      length: length || 8,
      style: style || 'classical',
      complexity: complexity || 'beginner',
      tempo: tempo || 120
    });

    // Convert to MusicXML
    const musicXML = aiCompositionService.toMusicXML(generatedMelody);

    // Create composition record
    const composition = await Composition.create({
      title: `AI Generated Melody - ${new Date().toISOString().split('T')[0]}`,
      description: `Generated using ${generatedMelody.key} scale in ${style} style`,
      musicXML,
      aiModel: 'rule-based',
      generationParams: {
        key: generatedMelody.key,
        length,
        style,
        complexity,
        tempo: generatedMelody.tempo
      },
      authorId: userId,
      completionStatus: 'completed'
    });

    successResponse(res, 201, 'Melody generated successfully', {
      composition,
      melody: generatedMelody,
      musicXML
    });
  } catch (error) {
    console.error('Generate melody error:', error);
    errorResponse(res, 500, 'Error generating melody');
  }
};

// Generate chord progression
const generateChords = async (req, res) => {
  try {
    const { key, progression, length } = req.body;
    const userId = req.user.id;

    const generatedChords = aiCompositionService.generateChords({
      key: key || 'C major',
      progression: progression || 'classical',
      length: length || 4
    });

    const composition = await Composition.create({
      title: `AI Generated Chords - ${progression || 'classical'}`,
      description: `Generated chord progression in ${key || 'C major'}`,
      aiModel: 'chord-generator',
      generationParams: {
        key: generatedChords.key,
        progression: generatedChords.progression,
        length
      },
      authorId: userId,
      completionStatus: 'completed'
    });

    successResponse(res, 201, 'Chord progression generated', {
      composition,
      chords: generatedChords
    });
  } catch (error) {
    console.error('Generate chords error:', error);
    errorResponse(res, 500, 'Error generating chord progression');
  }
};

// Analyze uploaded melody and suggest harmonies
const analyzeMelody = async (req, res) => {
  try {
    const { melody, key } = req.body;
    const userId = req.user.id;

    if (!melody || !Array.isArray(melody)) {
      return errorResponse(res, 400, 'Invalid melody data provided');
    }

    // Analyze melody and suggest harmonies
    const harmonyAnalysis = aiCompositionService.suggestHarmony(melody, key);

    const composition = await Composition.create({
      title: 'Melody Analysis',
      description: 'Uploaded melody with AI harmony suggestions',
      harmonyAnalysis,
      suggestedImprovements: [
        'Consider adding rhythmic variation',
        'Try modulating to the relative minor',
        'Add passing tones for smoother voice leading'
      ],
      authorId: userId,
      completionStatus: 'completed'
    });

    successResponse(res, 201, 'Melody analyzed successfully', {
      composition,
      analysis: harmonyAnalysis
    });
  } catch (error) {
    console.error('Analyze melody error:', error);
    errorResponse(res, 500, 'Error analyzing melody');
  }
};

// Get user's compositions
const getUserCompositions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, category } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { authorId: userId };
    if (category) {
      whereClause.aiModel = category;
    }

    const compositions = await Composition.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category']
        }
      ]
    });

    successResponse(res, 200, 'Compositions retrieved', {
      compositions: compositions.rows,
      pagination: {
        total: compositions.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(compositions.count / limit)
      }
    });
  } catch (error) {
    console.error('Get user compositions error:', error);
    errorResponse(res, 500, 'Error retrieving compositions');
  }
};

// Get composition details
const getComposition = async (req, res) => {
  try {
    const { id } = req.params;

    const composition = await Composition.findByPk(id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category']
        }
      ]
    });

    if (!composition) {
      return errorResponse(res, 404, 'Composition not found');
    }

    // Check if user has access
    if (composition.authorId !== req.user.id && !composition.isPublic) {
      return errorResponse(res, 403, 'Access denied');
    }

    successResponse(res, 200, 'Composition details retrieved', { composition });
  } catch (error) {
    console.error('Get composition error:', error);
    errorResponse(res, 500, 'Error retrieving composition');
  }
};

// Update composition
const updateComposition = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.id;

    const composition = await Composition.findByPk(id);

    if (!composition) {
      return errorResponse(res, 404, 'Composition not found');
    }

    if (composition.authorId !== userId) {
      return errorResponse(res, 403, 'Access denied');
    }

    await composition.update(updates);

    successResponse(res, 200, 'Composition updated successfully', { composition });
  } catch (error) {
    console.error('Update composition error:', error);
    errorResponse(res, 500, 'Error updating composition');
  }
};

// Delete composition
const deleteComposition = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const composition = await Composition.findByPk(id);

    if (!composition) {
      return errorResponse(res, 404, 'Composition not found');
    }

    if (composition.authorId !== userId) {
      return errorResponse(res, 403, 'Access denied');
    }

    await composition.destroy();

    successResponse(res, 200, 'Composition deleted successfully');
  } catch (error) {
    console.error('Delete composition error:', error);
    errorResponse(res, 500, 'Error deleting composition');
  }
};

// Export composition as MIDI or MusicXML
const exportComposition = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'musicxml' } = req.query;

    const composition = await Composition.findByPk(id);

    if (!composition) {
      return errorResponse(res, 404, 'Composition not found');
    }

    // Check access
    if (composition.authorId !== req.user.id && !composition.isPublic) {
      return errorResponse(res, 403, 'Access denied');
    }

    let exportData;
    let contentType;
    let filename;

    switch (format) {
      case 'musicxml':
        exportData = composition.musicXML;
        contentType = 'application/vnd.recordare.musicxml+xml';
        filename = `${composition.title}.musicxml`;
        break;
      case 'midi':
        // For now, return a placeholder - would need MIDI conversion library
        exportData = composition.midiData || 'MIDI export not yet implemented';
        contentType = 'audio/midi';
        filename = `${composition.title}.mid`;
        break;
      default:
        return errorResponse(res, 400, 'Invalid export format');
    }

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`
    });

    res.send(exportData);
  } catch (error) {
    console.error('Export composition error:', error);
    errorResponse(res, 500, 'Error exporting composition');
  }
};

module.exports = {
  generateMelody,
  generateChords,
  analyzeMelody,
  getUserCompositions,
  getComposition,
  updateComposition,
  deleteComposition,
  exportComposition
};
