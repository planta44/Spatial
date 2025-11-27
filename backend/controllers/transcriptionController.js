const aiCompositionService = require('../services/aiCompositionService');
const { successResponse, errorResponse } = require('../utils/helpers');

const transcribePerformance = async (req, res) => {
  try {
    const { key = 'C major', tempo = 120, length = 8, style = 'classical' } = req.body || {};

    const generated = aiCompositionService.generateMelody({
      key,
      length,
      style,
      tempo,
    });

    const composition = {
      melody: generated.melody,
      key: generated.key,
      tempo: generated.tempo,
    };

    successResponse(res, 200, 'Transcription stub generated successfully', {
      melody: generated.melody,
      key: generated.key,
      tempo: generated.tempo,
      composition,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    errorResponse(res, 500, 'Failed to transcribe performance');
  }
};

module.exports = {
  transcribePerformance,
};
