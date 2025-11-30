const axios = require('axios');
const { successResponse, errorResponse } = require('../utils/helpers');

const transcribePerformance = async (req, res) => {
  try {
    const { key = 'C major', tempo = 120, length = 8, style = 'classical' } = req.body || {};
    const audioFile = req.file;

    console.log('[Transcription] Request received:', {
      hasAudio: !!audioFile,
      audioSize: audioFile?.size,
      key,
      tempo,
      length,
      style
    });

    if (!audioFile) {
      return errorResponse(res, 400, 'No audio file provided');
    }

    const transcriptionServiceUrl = process.env.TRANSCRIPTION_SERVICE_URL || 'http://localhost:8000';
    console.log('[Transcription] Service URL:', transcriptionServiceUrl);

    // Forward the file to the Python transcription service
    const formData = new (require('form-data'))();
    formData.append('audio', audioFile.buffer, audioFile.originalname);
    formData.append('key', key);
    formData.append('tempo', tempo.toString());
    formData.append('length', length.toString());
    formData.append('style', style);

    console.log('[Transcription] Sending request to Python service...');
    const response = await axios.post(`${transcriptionServiceUrl}/transcribe`, formData, {
      headers: formData.getHeaders(),
      timeout: 60000, // 60 seconds (increased)
    });
    
    console.log('[Transcription] Response received from Python service');

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
    console.error('[Transcription] Error:', error.message);
    console.error('[Transcription] Error details:', {
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    if (error.code === 'ECONNREFUSED') {
      return errorResponse(res, 503, 'Transcription service unavailable. The Python service may be offline or restarting.');
    }
    
    if (error.response?.status === 404) {
      return errorResponse(res, 404, 'Transcription endpoint not found. Please check TRANSCRIPTION_SERVICE_URL is correct.');
    }
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return errorResponse(res, 504, 'Transcription timed out. The audio may be too long or complex.');
    }
    
    const message = error.response?.data?.error || error.message || 'Failed to transcribe performance';
    return errorResponse(res, error.response?.status || 500, `Transcription failed: ${message}`);
  }
};

module.exports = {
  transcribePerformance,
};
