import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Square } from 'lucide-react';
import SpatialCanvas from '../components/spatial/SpatialCanvas';
import AudioVisualizer from '../components/spatial/AudioVisualizer';

const Training = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [audioSources] = useState([
    { position: [3, 0, 2], color: '#3b82f6' },
    { position: [-2, 0, 3], color: '#8b5cf6' },
    { position: [0, 0, -3], color: '#ec4899' },
  ]);

  // Audio analysis state
  const [waveformData, setWaveformData] = useState([]);
  const [frequencyData, setFrequencyData] = useState([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const masterGainRef = useRef(null);
  const animationRef = useRef(null);

  // Audio analysis visualization
  const updateVisualizations = () => {
    if (!analyserRef.current || !isPlaying) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const waveArray = new Float32Array(analyser.fftSize);

    // Get frequency data
    analyser.getByteFrequencyData(dataArray);
    const freqData = Array.from(dataArray);
    setFrequencyData(freqData);

    // Get waveform data  
    analyser.getFloatTimeDomainData(waveArray);
    const waveData = Array.from(waveArray);
    setWaveformData(waveData);

    // Debug: Log data to ensure it's flowing
    if (Math.random() < 0.01) { // Log 1% of the time
      console.log('Visualizer data:', { 
        freqDataLength: freqData.length, 
        waveDataLength: waveData.length,
        freqMax: Math.max(...freqData),
        waveRange: [Math.min(...waveData), Math.max(...waveData)]
      });
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateVisualizations);
    }
  };

  // Handle play/stop
  const handlePlayStop = async () => {
    if (isPlaying) {
      // Stop audio
      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setIsPlaying(false);
      setWaveformData([]);
      setFrequencyData([]);
    } else {
      // Start audio
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        await audioContext.resume();
        
        audioContextRef.current = audioContext;
        
        // Create master gain and analyser
        const masterGain = audioContext.createGain();
        masterGain.gain.setValueAtTime(volume, audioContext.currentTime);
        masterGainRef.current = masterGain;
        
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;
        
        // Correct audio routing: masterGain -> analyser -> destination
        masterGain.connect(analyser);
        analyser.connect(audioContext.destination);
        
        setIsPlaying(true);
        
        // Start musical demo
        playMusicalDemo(audioContext, masterGain);
        
        // Start visualization updates
        updateVisualizations();
        
      } catch (error) {
        console.error('Error starting audio:', error);
        alert('Please click the page first to enable audio, then try again.');
      }
    }
  };

  // Musical demo function
  const playMusicalDemo = (audioContext, masterGain) => {
    const chordProgression = [
      [261.63, 329.63, 392.00], // C major
      [220.00, 261.63, 329.63], // A minor  
      [174.61, 220.00, 261.63], // F major
      [195.99, 246.94, 293.66]  // G major
    ];
    
    const rhythmPattern = [1, 0.5, 0.5, 1, 1];
    let currentTime = audioContext.currentTime;
    
    // Play chord progression
    chordProgression.forEach((chord, chordIndex) => {
      rhythmPattern.forEach((duration, beatIndex) => {
        chord.forEach((freq, noteIndex) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          const panner = audioContext.createStereoPanner();
          
          // Different timbres
          if (noteIndex === 0) osc.type = 'sawtooth';
          else if (noteIndex === 1) osc.type = 'square';
          else osc.type = 'sine';
          
          osc.frequency.setValueAtTime(freq, currentTime);
          
          // Spatial positioning
          const panValue = (noteIndex - 1) * 0.6;
          panner.pan.setValueAtTime(panValue, currentTime);
          
          // Envelope
          gain.gain.setValueAtTime(0, currentTime);
          gain.gain.linearRampToValueAtTime(0.15, currentTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.05, currentTime + duration * 0.7);
          gain.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);
          
          osc.connect(gain);
          gain.connect(panner);
          panner.connect(masterGain);
          
          osc.start(currentTime);
          osc.stop(currentTime + duration);
        });
        
        currentTime += duration * 0.6;
      });
    });
    
    // Add percussion
    for (let i = 0; i < 20; i++) {
      const kickTime = audioContext.currentTime + i * 0.6;
      const kick = audioContext.createOscillator();
      const kickGain = audioContext.createGain();
      
      kick.type = 'square';
      kick.frequency.setValueAtTime(60, kickTime);
      kick.frequency.exponentialRampToValueAtTime(30, kickTime + 0.1);
      
      kickGain.gain.setValueAtTime(0.3, kickTime);
      kickGain.gain.exponentialRampToValueAtTime(0.001, kickTime + 0.1);
      
      kick.connect(kickGain);
      kickGain.connect(masterGain);
      
      kick.start(kickTime);
      kick.stop(kickTime + 0.1);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.setValueAtTime(newVolume, audioContextRef.current.currentTime);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const trainingModules = [
    {
      id: 1,
      title: 'Introduction to Spatial Audio',
      duration: '45 min',
      difficulty: 'Beginner',
      description: 'Learn the fundamentals of spatial audio and its applications in music education.',
    },
    {
      id: 2,
      title: 'Setting Up 3D Audio Environments',
      duration: '60 min',
      difficulty: 'Intermediate',
      description: 'Master the technical setup for creating immersive spatial audio experiences.',
    },
    {
      id: 3,
      title: 'Pedagogy of Spatial Music Teaching',
      duration: '90 min',
      difficulty: 'Advanced',
      description: 'Advanced techniques for integrating spatial audio into your curriculum.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Spatial Audio Training
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Immersive learning experiences for music educators using cutting-edge spatial audio technology
        </p>
      </div>

      {/* Interactive Demo Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Interactive 3D Audio Demo</h2>
          <p className="text-gray-600">
            Explore spatial audio positioning in real-time. Drag to rotate the view.
          </p>
        </div>

        <SpatialCanvas audioSources={audioSources} />

        {/* Playback Controls */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={handlePlayStop}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
              isPlaying 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="h-5 w-5" />
                Stop Demo
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Play Demo
              </>
            )}
          </button>
          
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-gray-600" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              className="w-24"
              onChange={handleVolumeChange}
            />
            <span className="text-sm text-gray-600">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Audio Visualizer */}
      {isPlaying && (
        <div className="mb-12">
          <AudioVisualizer waveformData={waveformData} frequencyData={frequencyData} />
        </div>
      )}

      {/* Training Modules */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Training Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trainingModules.map((module) => (
            <div
              key={module.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-primary-600">{module.difficulty}</span>
                <span className="text-sm text-gray-500">{module.duration}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{module.title}</h3>
              <p className="text-gray-600 mb-4">{module.description}</p>
              <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium">
                Start Module
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-8 md:p-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Why Spatial Audio Training?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Enhanced Learning Outcomes
            </h3>
            <p className="text-gray-600">
              Students show 40% better retention when learning with spatial audio compared to traditional methods.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Modern Teaching Tools
            </h3>
            <p className="text-gray-600">
              Stay ahead with the latest technology in music education and prepare students for industry standards.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Accessible Technology
            </h3>
            <p className="text-gray-600">
              Our platform works with standard equipment, making spatial audio accessible to all institutions.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Continuous Support
            </h3>
            <p className="text-gray-600">
              Get ongoing training, resources, and community support throughout your journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training;