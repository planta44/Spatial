/**
 * React Component Example for Handwritten Music Recognition
 * 
 * This component demonstrates how to integrate the OMR service
 * with your React frontend for handwritten music notation recognition.
 */

import React, { useState } from 'react';

const HandwrittenMusicRecognition = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Settings
  const [smoothing, setSmoothing] = useState(true);
  const [smoothingStrength, setSmoothingStrength] = useState(3);
  const [outputFormat, setOutputFormat] = useState('musicxml');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Reset previous results
      setResult(null);
      setError(null);
    }
  };

  const handleRecognize = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('apply_smoothing', smoothing.toString());
      formData.append('smoothing_strength', smoothingStrength.toString());
      formData.append('output_format', outputFormat);

      // Call API (adjust URL based on your setup)
      const API_URL = process.env.REACT_APP_OMR_SERVICE_URL || 'http://localhost:8001';
      
      const response = await fetch(`${API_URL}/recognize`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Recognition failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);

    } catch (err) {
      console.error('Recognition error:', err);
      setError(err.message || 'Recognition failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadFile = (url, filename) => {
    const API_URL = process.env.REACT_APP_OMR_SERVICE_URL || 'http://localhost:8001';
    const downloadUrl = `${API_URL}${url}`;
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        🎵 Handwritten Music Recognition
      </h1>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Handwritten Music</h2>
        
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {/* Image Preview */}
        {preview && (
          <div className="mb-4">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full h-auto border rounded"
              style={{ maxHeight: '400px' }}
            />
          </div>
        )}

        {/* Settings */}
        <div className="bg-gray-50 p-4 rounded mb-4">
          <h3 className="font-semibold mb-3">Preprocessing Settings</h3>
          
          <div className="space-y-3">
            {/* Smoothing Toggle */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={smoothing}
                onChange={(e) => setSmoothing(e.target.checked)}
                className="mr-2"
              />
              <span>Enable Smoothing (removes noise)</span>
            </label>

            {/* Smoothing Strength */}
            {smoothing && (
              <div>
                <label className="block mb-1">
                  Smoothing Strength: {smoothingStrength}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={smoothingStrength}
                  onChange={(e) => setSmoothingStrength(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Light</span>
                  <span>Heavy</span>
                </div>
              </div>
            )}

            {/* Output Format */}
            <div>
              <label className="block mb-1">Output Format</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="block w-full p-2 border rounded"
              >
                <option value="musicxml">MusicXML</option>
                <option value="midi">MIDI</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
          </div>
        </div>

        {/* Process Button */}
        <button
          onClick={handleRecognize}
          disabled={!selectedFile || processing}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white
            ${!selectedFile || processing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {processing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            '🎼 Recognize Music'
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Results Display */}
      {result && result.status === 'success' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recognition Results</h2>

          {/* Metadata */}
          {result.metadata && Object.keys(result.metadata).length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Music Information</h3>
              <div className="grid grid-cols-2 gap-3">
                {result.metadata.key && (
                  <div>
                    <span className="text-gray-600">Key:</span>
                    <span className="ml-2 font-medium">{result.metadata.key}</span>
                  </div>
                )}
                {result.metadata.time_signature && (
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <span className="ml-2 font-medium">{result.metadata.time_signature}</span>
                  </div>
                )}
                {result.metadata.tempo && (
                  <div>
                    <span className="text-gray-600">Tempo:</span>
                    <span className="ml-2 font-medium">{result.metadata.tempo} BPM</span>
                  </div>
                )}
                {result.metadata.measures > 0 && (
                  <div>
                    <span className="text-gray-600">Measures:</span>
                    <span className="ml-2 font-medium">{result.metadata.measures}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Statistics */}
          {result.validation?.statistics && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-600">Notes:</span>
                  <span className="ml-2 font-medium">{result.validation.statistics.notes}</span>
                </div>
                <div>
                  <span className="text-gray-600">Rests:</span>
                  <span className="ml-2 font-medium">{result.validation.statistics.rests}</span>
                </div>
                <div>
                  <span className="text-gray-600">Parts:</span>
                  <span className="ml-2 font-medium">{result.validation.statistics.parts}</span>
                </div>
                <div>
                  <span className="text-gray-600">Avg Notes/Measure:</span>
                  <span className="ml-2 font-medium">
                    {result.validation.statistics.average_notes_per_measure}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Validation Status */}
          {result.validation && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Validation</h3>
              <div className={`p-3 rounded ${
                result.validation.status === 'valid' ? 'bg-green-50' :
                result.validation.status === 'valid_with_warnings' ? 'bg-yellow-50' :
                'bg-red-50'
              }`}>
                <p className="font-medium">
                  Status: {result.validation.status.replace(/_/g, ' ').toUpperCase()}
                </p>
                
                {result.validation.warnings?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Warnings:</p>
                    <ul className="list-disc list-inside text-sm">
                      {result.validation.warnings.slice(0, 3).map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {result.validation.errors?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-600">Errors:</p>
                    <ul className="list-disc list-inside text-sm text-red-600">
                      {result.validation.errors.slice(0, 3).map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Download Links */}
          {result.download_urls && Object.keys(result.download_urls).length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Download Files</h3>
              <div className="space-y-2">
                {Object.entries(result.download_urls).map(([type, url]) => (
                  <button
                    key={type}
                    onClick={() => downloadFile(url, `music.${type}`)}
                    className="block w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded"
                  >
                    📥 Download {type.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tips Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">💡 Tips for Better Recognition</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Use high-resolution images (300+ DPI)</li>
          <li>Ensure good lighting and contrast</li>
          <li>Draw staff lines as straight as possible</li>
          <li>Use clear, bold strokes for notes</li>
          <li>Increase smoothing for noisy/rough images</li>
          <li>Decrease smoothing for clean, precise drawings</li>
        </ul>
      </div>
    </div>
  );
};

export default HandwrittenMusicRecognition;
