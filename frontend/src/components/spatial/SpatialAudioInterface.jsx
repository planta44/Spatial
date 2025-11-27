import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, Upload, Volume2, Settings } from 'lucide-react';

const SpatialAudioInterface = ({ project, onProjectUpdate, audioTracks = [] }) => {
  const canvasRef = useRef();
  const [soundSources, setSoundSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [isUploadedPlaying, setIsUploadedPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [audioSources, setAudioSources] = useState({});
  const [demoSources, setDemoSources] = useState({});
  const [uploadedSources, setUploadedSources] = useState({});
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize default demo sounds
  useEffect(() => {
    if (soundSources.length === 0) {
      setSoundSources([
        {
          id: 'demo1',
          label: 'Piano',
          position: [-100, 0], // 2D coordinates for canvas
          volume: 0.8,
          color: '#3b82f6',
          frequency: 440
        },
        {
          id: 'demo2',
          label: 'Drums',
          position: [100, -80],
          volume: 0.6,
          color: '#ef4444',
          frequency: 220
        },
        {
          id: 'demo3',
          label: 'Bass',
          position: [0, 120],
          volume: 0.7,
          color: '#22c55e',
          frequency: 110
        }
      ]);
    }
  }, []);

  useEffect(() => {
    if (!project) return;

    if (project.sources && Array.isArray(project.sources) && project.sources.length > 0) {
      setSoundSources(
        project.sources.map((source, index) => ({
          id: source.id || `source_${index}`,
          label: source.label || `Source ${index + 1}`,
          position: source.position || [0, 0],
          volume: typeof source.volume === 'number' ? source.volume : 0.8,
          color:
            source.color || `hsl(${(index * 90) % 360}, 70%, 60%)`,
          isUploadedFile: source.isUploadedFile || false,
          audioFile: null,
          audioURL: source.audioURL || null,
        }))
      );
    }

    if (project.settings && typeof project.settings.masterVolume === 'number') {
      setMasterVolume(project.settings.masterVolume);
    }
  }, [project]);

  // Initialize Web Audio API
  useEffect(() => {
    const initAudioContext = async () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        setAudioContext(ctx);
        console.log('✅ Audio context initialized');
      } catch (error) {
        console.error('❌ Failed to initialize audio context:', error);
      }
    };

    initAudioContext();
  }, []);

  // Draw spatial visualization
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw room boundary
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, Math.min(width, height) / 2 - 40, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw listener at center
    ctx.fillStyle = '#10b981';
    ctx.fillRect(centerX - 8, centerY - 8, 16, 16);
    ctx.fillStyle = '#065f46';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('You', centerX, centerY + 25);

    // Draw sound sources
    soundSources.forEach((source, index) => {
      const x = centerX + source.position[0];
      const y = centerY + source.position[1];

      // Draw volume circle
      ctx.strokeStyle = source.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 20 + (source.volume * 20), 0, 2 * Math.PI);
      ctx.stroke();

      // Draw source circle
      ctx.fillStyle = selectedSource === index ? '#dc2626' : source.color;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, 2 * Math.PI);
      ctx.fill();

      // Draw label
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(source.label, x, y - 20);
    });

    // Instructions
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Click and drag sound sources • Use headphones for best experience', 10, height - 15);
  }, [soundSources, selectedSource]);

  // Draw canvas when sources change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Create audio source (handles both demo oscillators and uploaded files)
  const createAudioSource = useCallback((source) => {
    if (!audioContext) return null;

    try {
      const gainNode = audioContext.createGain();
      const pannerNode = audioContext.createStereoPanner();

      // Configure gain
      gainNode.gain.setValueAtTime(source.volume * masterVolume * 0.3, audioContext.currentTime);

      // Configure panning (simple stereo panning)
      const panValue = Math.max(-1, Math.min(1, source.position[0] / 150));
      pannerNode.pan.setValueAtTime(panValue, audioContext.currentTime);

      if (source.isUploadedFile && source.audioURL) {
        // Handle uploaded audio files
        const audio = new Audio(source.audioURL);
        audio.loop = true;
        audio.crossOrigin = 'anonymous';
        
        const audioSourceNode = audioContext.createMediaElementSource(audio);
        
        // Connect nodes
        audioSourceNode.connect(gainNode);
        gainNode.connect(pannerNode);
        pannerNode.connect(audioContext.destination);

        return { 
          audioElement: audio, 
          audioSourceNode, 
          gainNode, 
          pannerNode,
          isFile: true
        };
      } else {
        // Handle realistic demo instruments
        if (source.label === 'Piano') {
          return createRealisticPiano(audioContext, source, gainNode, pannerNode);
        } else if (source.label === 'Drums') {
          return createRealisticDrums(audioContext, source, gainNode, pannerNode);
        } else if (source.label === 'Bass') {
          return createRealisticBass(audioContext, source, gainNode, pannerNode);
        }
        
        // Fallback to basic oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(source.frequency || 440, audioContext.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(pannerNode);
        pannerNode.connect(audioContext.destination);
        return { oscillator, gainNode, pannerNode, isFile: false };
      }
    } catch (error) {
      console.error('Error creating audio source:', error);
      return null;
    }
  }, [audioContext, masterVolume]);

  // Create realistic piano sound
  const createRealisticPiano = (audioContext, source, gainNode, pannerNode) => {
    const oscillators = [];
    
    // Create piano-like sound with multiple harmonics
    const frequencies = [262, 330, 392]; // C major chord
    const harmonics = [1, 0.5, 0.25, 0.1]; // Harmonic series
    
    frequencies.forEach((freq, i) => {
      harmonics.forEach((amp, h) => {
        const osc = audioContext.createOscillator();
        const harmGain = audioContext.createGain();
        
        osc.type = 'triangle'; // Warmer than sine
        osc.frequency.setValueAtTime(freq * (h + 1), audioContext.currentTime);
        
        // Longer piano-like envelope for extended demo
        harmGain.gain.setValueAtTime(0, audioContext.currentTime);
        harmGain.gain.linearRampToValueAtTime(amp * 0.3, audioContext.currentTime + 0.01);
        harmGain.gain.exponentialRampToValueAtTime(amp * 0.15, audioContext.currentTime + 1);
        harmGain.gain.exponentialRampToValueAtTime(amp * 0.05, audioContext.currentTime + 4);
        harmGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 8);
        
        osc.connect(harmGain);
        harmGain.connect(gainNode);
        oscillators.push(osc);
      });
    });
    
    gainNode.connect(pannerNode);
    pannerNode.connect(audioContext.destination);
    
    return { 
      oscillator: { 
        start: () => oscillators.forEach(osc => osc.start()),
        stop: () => oscillators.forEach(osc => { try { osc.stop(); } catch(e) {} })
      }, 
      gainNode, 
      pannerNode, 
      isFile: false 
    };
  };

  // Create realistic bass sound
  const createRealisticBass = (audioContext, source, gainNode, pannerNode) => {
    const bassOsc = audioContext.createOscillator();
    const subOsc = audioContext.createOscillator();
    const filter = audioContext.createBiquadFilter();
    const bassGain = audioContext.createGain();
    
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(82, audioContext.currentTime); // E2
    
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(41, audioContext.currentTime); // E1 (sub bass)
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, audioContext.currentTime);
    filter.Q.setValueAtTime(2, audioContext.currentTime);
    
    bassGain.gain.setValueAtTime(0, audioContext.currentTime);
    bassGain.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.05);
    bassGain.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.5);
    bassGain.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 3);
    bassGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 6);
    
    bassOsc.connect(filter);
    subOsc.connect(bassGain);
    filter.connect(bassGain);
    bassGain.connect(gainNode);
    gainNode.connect(pannerNode);
    pannerNode.connect(audioContext.destination);
    
    return { 
      oscillator: { 
        start: () => { bassOsc.start(); subOsc.start(); },
        stop: () => { try { bassOsc.stop(); subOsc.stop(); } catch(e) {} }
      }, 
      gainNode, 
      pannerNode, 
      isFile: false 
    };
  };

  // Create realistic drum sound
  const createRealisticDrums = (audioContext, source, gainNode, pannerNode) => {
    const kickOsc = audioContext.createOscillator();
    const snareNoise = audioContext.createBufferSource();
    const kickGain = audioContext.createGain();
    const snareGain = audioContext.createGain();
    const merger = audioContext.createChannelMerger(2);
    
    // Create kick drum
    kickOsc.type = 'sine';
    kickOsc.frequency.setValueAtTime(60, audioContext.currentTime);
    kickOsc.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.1);
    
    kickGain.gain.setValueAtTime(0.5, audioContext.currentTime);
    kickGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
    
    // Create snare/noise with longer duration
    const bufferSize = audioContext.sampleRate * 0.3;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // White noise
    }
    
    snareNoise.buffer = buffer;
    snareNoise.loop = true;
    
    snareGain.gain.setValueAtTime(0.2, audioContext.currentTime);
    snareGain.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 0.25);
    snareGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 5);
    
    kickOsc.connect(kickGain);
    snareNoise.connect(snareGain);
    kickGain.connect(merger, 0, 0);
    snareGain.connect(merger, 0, 1);
    merger.connect(gainNode);
    gainNode.connect(pannerNode);
    pannerNode.connect(audioContext.destination);
    
    return { 
      oscillator: { 
        start: () => { kickOsc.start(); snareNoise.start(); },
        stop: () => { try { kickOsc.stop(); snareNoise.stop(); } catch(e) {} }
      }, 
      gainNode, 
      pannerNode, 
      isFile: false 
    };
  };

  // Update spatial positioning in real-time during dragging
  const updateSpatialPositioning = useCallback((sourceIndex, newX, newY) => {
    if (!audioContext || sourceIndex === null) return;

    const source = soundSources[sourceIndex];
    if (!source) return;

    // Calculate new pan value from X position (-1 to 1)
    const panValue = Math.max(-1, Math.min(1, newX / 150));

    // Update source position in state
    const updatedSources = [...soundSources];
    updatedSources[sourceIndex] = {
      ...source,
      position: [newX, newY, source.position[2] || 0]
    };
    setSoundSources(updatedSources);

    // Update ALL active audio sources immediately
    const activeId = source.id;
    
    // Update demo sources (if playing)
    if (demoSources[activeId] && demoSources[activeId].pannerNode) {
      try {
        demoSources[activeId].pannerNode.pan.setValueAtTime(panValue, audioContext.currentTime);
        console.log(`Updated demo panning for ${source.label}: ${panValue}`);
      } catch (e) {
        console.log('Demo panner update failed:', e);
      }
    }
    
    // Update uploaded sources (if playing)
    if (uploadedSources[activeId] && uploadedSources[activeId].pannerNode) {
      try {
        uploadedSources[activeId].pannerNode.pan.setValueAtTime(panValue, audioContext.currentTime);
        console.log(`Updated uploaded panning for ${source.label}: ${panValue}`);
      } catch (e) {
        console.log('Uploaded panner update failed:', e);
      }
    }
    
    // Force visual update
    drawCanvas();
  }, [soundSources, demoSources, uploadedSources, audioContext, drawCanvas]);

  // Handle demo audio play/pause
  const handleDemoPlayPause = async () => {
    if (!audioContext) {
      return;
    }

    if (isDemoPlaying) {
      // Stop demo audio
      Object.values(demoSources).forEach((audioSource) => {
        try {
          if (audioSource.oscillator) {
            audioSource.oscillator.stop();
          }
        } catch (e) {}
      });
      setDemoSources({});
      setIsDemoPlaying(false);
    } else {
      try {
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        const newDemoSources = {};
        const demoOnlySources = soundSources.filter(source => !source.isUploadedFile);
        
        for (const source of demoOnlySources) {
          const audioSource = createAudioSource(source);
          if (audioSource && audioSource.oscillator) {
            audioSource.oscillator.start();
            newDemoSources[source.id] = audioSource;
          }
        }

        setDemoSources(newDemoSources);
        setIsDemoPlaying(true);
      } catch (error) {
        console.error('Error starting demo:', error);
        alert('Failed to start demo. Try again.');
      }
    }
  };

  // Handle uploaded audio play/pause with demo sounds
  const handleUploadedPlayPause = async () => {
    if (!audioContext) {
      alert('Audio not supported in this browser');
      return;
    }

    const uploadedFiles = soundSources.filter(source => source.isUploadedFile);
    if (uploadedFiles.length === 0) {
      alert('No uploaded audio files to play. Please upload some audio first.');
      return;
    }

    if (isUploadedPlaying) {
      // Stop uploaded audio AND demo sounds
      Object.values(uploadedSources).forEach((audioSource) => {
        try {
          if (audioSource.audioElement) {
            audioSource.audioElement.pause();
            audioSource.audioElement.currentTime = 0;
          }
        } catch (e) {}
      });
      
      setUploadedSources({});
      setIsUploadedPlaying(false);
    } else {
      try {
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        // Start ONLY uploaded audio files (no demo sounds)
        const newUploadedSources = {};
        
        // Start uploaded audio files
        for (const source of uploadedFiles) {
          const audioSource = createAudioSource(source);
          if (audioSource && audioSource.audioElement) {
            audioSource.audioElement.volume = source.volume * masterVolume;
            await audioSource.audioElement.play();
            newUploadedSources[source.id] = audioSource;
          }
        }

        setUploadedSources(newUploadedSources);
        setIsUploadedPlaying(true);
      } catch (error) {
        console.error('Error starting uploaded audio:', error);
        alert('Failed to start uploaded audio. Try again.');
      }
    }
  };

  // Stop all audio
  const handleStopAll = () => {
    // Stop demo sounds
    Object.values(demoSources).forEach((audioSource) => {
      try {
        if (audioSource.oscillator) audioSource.oscillator.stop();
      } catch (e) {}
    });
    
    // Stop uploaded sounds
    Object.values(uploadedSources).forEach((audioSource) => {
      try {
        if (audioSource.audioElement) {
          audioSource.audioElement.pause();
          audioSource.audioElement.currentTime = 0;
        }
      } catch (e) {}
    });
    
    setDemoSources({});
    setUploadedSources({});
    setIsDemoPlaying(false);
    setIsUploadedPlaying(false);
  };

  // Update audio when sources change
  useEffect(() => {
    if (isPlaying) {
      soundSources.forEach(source => {
        const audioSource = audioSources[source.id];
        if (audioSource) {
          // Update panning
          const panValue = Math.max(-1, Math.min(1, source.position[0] / 150));
          audioSource.pannerNode.pan.setValueAtTime(panValue, audioContext.currentTime);
          
          // Update volume
          audioSource.gainNode.gain.setValueAtTime(
            source.volume * masterVolume * 0.1, 
            audioContext.currentTime
          );
        }
      });
    }
  }, [soundSources, audioSources, isPlaying, audioContext, masterVolume]);

  // Handle canvas interactions
  const handleCanvasMouseDown = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Find clicked source
    const clickedIndex = soundSources.findIndex(source => {
      const sourceX = centerX + source.position[0];
      const sourceY = centerY + source.position[1];
      const distance = Math.sqrt((x - sourceX) ** 2 + (y - sourceY) ** 2);
      return distance <= 15;
    });

    if (clickedIndex !== -1) {
      setSelectedSource(clickedIndex);
      setIsDragging(true);
    }
  };

  const handleCanvasMouseMove = (event) => {
    if (!isDragging || selectedSource === null) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Update source position
    const newX = Math.max(-200, Math.min(200, x - centerX));
    const newY = Math.max(-150, Math.min(150, y - centerY));

    setSoundSources(prev => prev.map((source, index) =>
      index === selectedSource
        ? { ...source, position: [newX, newY] }
        : source
    ));

    // Update real-time spatial positioning for playing audio
    updateSpatialPositioning(selectedSource, newX, newY);
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setSelectedSource(null);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    // Process uploaded audio files
    files.forEach((file, index) => {
      const fileURL = URL.createObjectURL(file);
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      
      const newSource = {
        id: `upload_${Date.now()}_${index}`,
        label: fileName,
        position: [(index - files.length / 2) * 80, (index * 30) - 50],
        volume: 0.8,
        color: `hsl(${(index * 120 + 180) % 360}, 70%, 60%)`,
        audioFile: file,
        audioURL: fileURL,
        isUploadedFile: true
      };
      
      setSoundSources(prev => [...prev, newSource]);
    });
    
    alert(`✅ Uploaded ${files.length} audio file(s)! They appear as new sound sources. Click "Play Demo" to hear them.`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">🎧 Spatial Audio Studio</h3>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-4">
          {/* Demo Controls */}
          <button
            onClick={handleDemoPlayPause}
            className={`flex items-center gap-2 px-4 py-2 rounded font-medium ${
              isDemoPlaying
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isDemoPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isDemoPlaying ? 'Stop Demo' : 'Play Demo'}
          </button>

          {/* Uploaded Audio Controls */}
          <button
            onClick={handleUploadedPlayPause}
            disabled={soundSources.filter(s => s.isUploadedFile).length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded font-medium ${
              soundSources.filter(s => s.isUploadedFile).length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isUploadedPlaying
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isUploadedPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isUploadedPlaying ? 'Stop Uploaded' : 'Play Uploaded'}
          </button>

          {/* Stop All Button */}
          {(isDemoPlaying || isUploadedPlaying) && (
            <button
              onClick={handleStopAll}
              className="flex items-center gap-2 px-4 py-2 rounded font-medium bg-red-600 hover:bg-red-700 text-white"
            >
              ⏹️ Stop All
            </button>
          )}

          <label className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 cursor-pointer">
            <Upload size={16} />
            Upload Audio
            <input
              type="file"
              multiple
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              try {
                const spatialSection = {
                  room:
                    project && project.room
                      ? project.room
                      : { width: 10, height: 3, depth: 10 },
                  listener:
                    project && project.listener
                      ? project.listener
                      : { x: 0, y: 0, z: 0 },
                  sources: soundSources.map(source => ({
                    id: source.id,
                    label: source.label,
                    position: source.position,
                    volume: source.volume,
                    color: source.color,
                    isUploadedFile: source.isUploadedFile || false,
                    fileName: source.audioFile ? source.audioFile.name : null,
                    audioURL: source.audioURL || null,
                  })),
                  settings: {
                    masterVolume,
                    totalSources: soundSources.length,
                    uploadedFiles: soundSources.filter(s => s.isUploadedFile).length,
                    demoSources: soundSources.filter(s => !s.isUploadedFile).length,
                  },
                };

                if (onProjectUpdate) {
                  onProjectUpdate(spatialSection);
                  alert('✅ Spatial layout updated. Use "Save Project" above to store it.');
                } else {
                  const dataStr = JSON.stringify(spatialSection, null, 2);
                  const dataUri =
                    'data:application/json;charset=utf-8,' +
                    encodeURIComponent(dataStr);

                  const linkElement = document.createElement('a');
                  linkElement.setAttribute('href', dataUri);
                  linkElement.setAttribute(
                    'download',
                    `spatial-project-${Date.now()}.json`
                  );
                  document.body.appendChild(linkElement);
                  linkElement.click();
                  document.body.removeChild(linkElement);

                  alert(
                    `✅ Project saved successfully!\n\nFile: spatial-project-${Date.now()}.json\nSources: ${soundSources.length}\nUploaded Files: ${soundSources.filter(
                      s => s.isUploadedFile
                    ).length}`
                  );
                }
              } catch (error) {
                console.error('Save error:', error);
                alert('❌ Failed to save project. Please try again.');
              }
            }}
            className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={soundSources.length === 0}
          >
            <Settings size={16} />
            Save Project ({soundSources.length})
          </button>

          <div className="flex items-center gap-2">
            <Volume2 size={16} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={masterVolume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                setMasterVolume(newVolume);
                
                // Update all playing audio volumes in real-time
                Object.values(demoSources).forEach(audioSource => {
                  if (audioSource.gainNode) {
                    audioSource.gainNode.gain.setValueAtTime(newVolume * 0.3, audioContext.currentTime);
                  }
                });
                
                Object.values(uploadedSources).forEach(audioSource => {
                  if (audioSource.audioElement) {
                    audioSource.audioElement.volume = newVolume;
                  }
                });
              }}
              className="w-24"
            />
            <span className="text-sm text-gray-600 min-w-[35px]">{Math.round(masterVolume * 100)}%</span>
          </div>
        </div>

        {/* Sound Sources Controls */}
        <div className="mb-4">
          <h4 className="font-medium mb-2">Sound Sources:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {soundSources.map((source, index) => (
              <div key={source.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: source.color }}
                />
                <span className="text-sm flex-1 font-medium">{source.label}</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={source.volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setSoundSources(prev => prev.map((s, i) =>
                      i === index ? { ...s, volume: newVolume } : s
                    ));
                  }}
                  className="w-16"
                  title={`${source.label} volume`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spatial Canvas */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Spatial Positioning:</h4>
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="border-2 border-gray-300 rounded-lg cursor-grab active:cursor-grabbing bg-white"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <p className="font-medium text-blue-800 mb-2">How to use:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>Click <strong>Play Demo</strong> to hear positioned audio sources</li>
          <li>Drag colored circles to move sound sources in space</li>
          <li>Adjust individual volumes with the sliders above</li>
          <li>Use headphones for the best spatial audio experience</li>
          <li>The green square represents your listening position</li>
        </ul>
      </div>
    </div>
  );
};

export default SpatialAudioInterface;
