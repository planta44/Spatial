const axios = require('axios');
const { successResponse, errorResponse } = require('../utils/helpers');

const transcribePerformance = async (req, res) => {
  try {
    const { key = 'C major', tempo = 120, length = 8, style = 'classical' } = req.body || {};
    const audioFile = req.file;

    if (!audioFile) {
      return errorResponse(res, 400, 'No audio file provided');
    }

    const transcriptionServiceUrl = process.env.TRANSCRIPTION_SERVICE_URL || 'http://localhost:8000';

    // Forward the file to the Python transcription service
    const formData = new (require('form-data'))();
    formData.append('audio', audioFile.buffer, audioFile.originalname);
    formData.append('key', key);
    formData.append('tempo', tempo.toString());
    formData.append('length', length.toString());
    formData.append('style', style);

    const response = await axios.post(`${transcriptionServiceUrl}/transcribe`, formData, {
      headers: formData.getHeaders(),
      timeout: 30000, // 30 seconds
    });

    const data = response.data || {};

    // Ensure the response has the expected shape
    const composition = data.composition || {
      melody: data.melody || [],
      key: data.key || key,
      tempo: parseInt(data.tempo, 10) || tempo,
    };

    return successResponse(res, 200, 'Transcription completed', {
      melody: composition.melody,
      key: composition.key,
      tempo: composition.tempo,
      composition,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    if (error.code === 'ECONNREFUSED') {
      return errorResponse(res, 503, 'Transcription service unavailable. Ensure the transcription service is running.');
    }
    const message = error.response?.data?.error || error.message || 'Failed to transcribe performance';
    return errorResponse(res, 500, `Transcription failed: ${message}`);
  }
};

module.exports = {
  transcribePerformance,
};
