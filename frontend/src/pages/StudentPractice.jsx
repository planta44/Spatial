import React, { useState, useEffect } from 'react';
import { 
  Music, 
  Volume2, 
  Save, 
  Share, 
  Plus, 
  Play, 
  Pause,
  Download,
  Upload,
  Folder,
  Star
} from 'lucide-react';
import MusicEditor from '../components/music/MusicEditor';
import SpatialAudioInterface from '../components/spatial/SpatialAudioInterface';

const StudentPractice = () => {
  const [activeTab, setActiveTab] = useState('compose');
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [composition, setComposition] = useState(null);
  const [spatialProject, setSpatialProject] = useState(null);

  // Mock data for student projects
  useEffect(() => {
    const mockProjects = [
      {
        id: 1,
        title: 'My First Melody',
        type: 'composition',
        lastModified: '2024-11-20',
        status: 'draft',
        isShared: false,
        rating: 4.2
      },
      {
        id: 2,
        title: 'Forest Soundscape',
        type: 'spatial',
        lastModified: '2024-11-19',
        status: 'completed',
        isShared: true,
        rating: 4.7
      },
      {
        id: 3,
        title: 'Jazz Harmony Exercise',
        type: 'composition',
        lastModified: '2024-11-18',
        status: 'submitted',
        isShared: false,
        rating: 4.0
      }
    ];
    setProjects(mockProjects);
  }, []);

  const handleCreateNew = (type) => {
    const newProject = {
      id: Date.now(),
      title: type === 'composition' ? 'New Composition' : 'New Spatial Project',
      type: type,
      lastModified: new Date().toISOString().split('T')[0],
      status: 'draft',
      isShared: false,
      rating: 0
    };
    setProjects([newProject, ...projects]);
    setCurrentProject(newProject);
    setActiveTab(type === 'composition' ? 'compose' : 'spatialize');
  };

  const handleSaveProject = (projectData) => {
    if (currentProject) {
      // Update existing project
      setProjects(projects.map(p => 
        p.id === currentProject.id 
          ? { ...p, lastModified: new Date().toISOString().split('T')[0] }
          : p
      ));
      
      // Save project data based on type
      if (currentProject.type === 'composition') {
        setComposition(projectData);
      } else {
        setSpatialProject(projectData);
      }
    }
  };

  const handleShareProject = (projectId) => {
    setProjects(projects.map(p => 
      p.id === projectId 
        ? { ...p, isShared: !p.isShared }
        : p
    ));
  };

  const renderProjectLibrary = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl sm:text-2xl font-bold">My Projects</h3>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleCreateNew('composition')}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-600 text-sm sm:text-base whitespace-nowrap"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Composition</span>
            <span className="sm:hidden">Compose</span>
          </button>
          <button
            onClick={() => handleCreateNew('spatial')}
            className="flex items-center justify-center gap-2 bg-green-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-green-600 text-sm sm:text-base whitespace-nowrap"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Spatial Project</span>
            <span className="sm:hidden">Spatial</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs - Mobile Responsive */}
      <div className="flex gap-2 sm:gap-4 border-b overflow-x-auto">
        {['all', 'composition', 'spatial'].map(filter => (
          <button
            key={filter}
            className={`pb-2 px-2 sm:px-3 border-b-2 capitalize text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
              filter === 'all' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {filter === 'all' ? 'All' : filter} Projects
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                {project.type === 'composition' ? (
                  <Music className="text-blue-500" size={20} />
                ) : (
                  <Volume2 className="text-green-500" size={20} />
                )}
                <h4 className="font-semibold">{project.title}</h4>
              </div>
              <div className="flex items-center gap-1">
                <Star className={`${project.rating > 0 ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} size={16} />
                <span className="text-sm text-gray-600">{project.rating > 0 ? project.rating : 'Unrated'}</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mb-3">
              <p>Modified: {project.lastModified}</p>
              <p className="flex items-center gap-2">
                Status: 
                <span className={`px-2 py-1 rounded text-xs ${
                  project.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : project.status === 'submitted'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status}
                </span>
              </p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setCurrentProject(project);
                  setActiveTab(project.type === 'composition' ? 'compose' : 'spatialize');
                }}
                className="flex-1 bg-blue-500 text-white py-2 px-3 rounded hover:bg-blue-600 text-sm font-medium transition-colors"
              >
                <Play size={14} className="inline mr-1" />
                Open
              </button>
              <button 
                onClick={() => handleShareProject(project.id)}
                className={`p-2 rounded transition-colors ${
                  project.isShared 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={project.isShared ? 'Shared' : 'Share project'}
              >
                <Share size={14} />
              </button>
            </div>
          </div>
        ))}
        
        {/* Add New Project Cards */}
        <div 
          onClick={() => handleCreateNew('composition')}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
        >
          <Plus className="text-gray-400 mb-2" size={32} />
          <p className="text-gray-600 font-medium">Create New Composition</p>
          <p className="text-sm text-gray-500">Generate melodies & harmonies</p>
        </div>
        
        <div 
          onClick={() => handleCreateNew('spatial')}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-green-400 hover:bg-green-50 cursor-pointer transition-colors"
        >
          <Plus className="text-gray-400 mb-2" size={32} />
          <p className="text-gray-600 font-medium">Create Spatial Audio</p>
          <p className="text-sm text-gray-500">3D sound positioning</p>
        </div>
      </div>
    </div>
  );

  const renderComposer = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">AI Music Composer</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
            <Download size={16} />
            Export MIDI
          </button>
          <button 
            onClick={() => handleSaveProject(composition)}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            <Save size={16} />
            Save Project
          </button>
        </div>
      </div>

      <MusicEditor
        composition={composition}
        onSave={handleSaveProject}
        onPlay={() => setIsPlaying(true)}
        onStop={() => setIsPlaying(false)}
        isPlaying={isPlaying}
      />

      {/* AI Assistant Panel */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">🤖 AI Composition Assistant</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => {
              // Generate random melody and set it to current composition
              const scales = {
                'C major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
                'G major': ['G', 'A', 'B', 'C', 'D', 'E', 'F#']
              };
              const scale = 'C major';
              const notes = [];
              for (let i = 0; i < 8; i++) {
                const noteIndex = Math.floor(Math.random() * scales[scale].length);
                notes.push({
                  note: scales[scale][noteIndex],
                  duration: 1,
                  octave: 4
                });
              }
              setComposition({ melody: notes, key: scale, tempo: 120 });
              alert('✨ New melody generated! Check the music editor above.');
            }}
            className="bg-white border p-4 rounded-lg hover:shadow-md transition-shadow hover:bg-purple-50"
          >
            <h5 className="font-medium mb-2">Generate Melody</h5>
            <p className="text-sm text-gray-600">Create a new melody in your chosen key and style</p>
          </button>
          <button 
            onClick={() => {
              if (!composition || !composition.melody || composition.melody.length === 0) {
                alert('⚠️ Please generate or add a melody first!');
                return;
              }
              const suggestions = [
                'Try adding a C major chord under the first note',
                'Consider using a vi-IV-I-V progression',
                'Add some passing tones between your main melody notes',
                'Try harmonizing in thirds above the melody'
              ];
              const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
              alert(`🎵 Harmony Suggestion: ${randomSuggestion}`);
            }}
            className="bg-white border p-4 rounded-lg hover:shadow-md transition-shadow hover:bg-blue-50"
          >
            <h5 className="font-medium mb-2">Suggest Harmony</h5>
            <p className="text-sm text-gray-600">Get chord suggestions for your melody</p>
          </button>
          <button 
            onClick={() => {
              if (!composition || !composition.melody || composition.melody.length === 0) {
                alert('⚠️ Please create a melody first to analyze!');
                return;
              }
              const improvements = [
                'Your melody has good stepwise motion! 👍',
                'Consider adding more rhythmic variety',
                'Try ending on the tonic note for better resolution',
                'Great use of scale tones! Very musical.',
                'Add some leaps to make it more interesting'
              ];
              const randomImprovement = improvements[Math.floor(Math.random() * improvements.length)];
              alert(`🎯 Analysis: ${randomImprovement}`);
            }}
            className="bg-white border p-4 rounded-lg hover:shadow-md transition-shadow hover:bg-green-50"
          >
            <h5 className="font-medium mb-2">Analyze & Improve</h5>
            <p className="text-sm text-gray-600">Get feedback on your composition</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSpatializer = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Spatial Audio Studio</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
            <Upload size={16} />
            Import Audio
          </button>
          <button 
            onClick={() => handleSaveProject(spatialProject)}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            <Save size={16} />
            Save Project
          </button>
        </div>
      </div>

      <SpatialAudioInterface
        project={spatialProject}
        onProjectUpdate={setSpatialProject}
        audioTracks={spatialProject?.audioTracks || []}
      />

      {/* Spatial Audio Tips */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">🎧 Spatial Audio Tips</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium mb-2">For Best Results:</h5>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Use headphones for accurate spatial perception</li>
              <li>• Start with stereo or mono audio files</li>
              <li>• Place sounds at different distances for depth</li>
              <li>• Experiment with room size and reverb settings</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">Creative Ideas:</h5>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Create a virtual concert hall</li>
              <li>• Design immersive soundscapes</li>
              <li>• Practice ensemble positioning</li>
              <li>• Compare different acoustic spaces</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubmissions = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Assignment Submissions</h3>
      
      {/* Submitted Work */}
      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold">Assignment: Create Your First AI Melody</h4>
              <p className="text-sm text-gray-600">Due: November 25, 2024</p>
            </div>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Submitted</span>
          </div>
          <p className="text-gray-700 mb-3">
            Create an 8-note melody using the AI composition tools. Include both the original AI-generated version and your own modifications.
          </p>
          <div className="flex items-center gap-4">
            <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
              View Submission
            </button>
            <span className="text-sm text-gray-600">Submitted: November 20, 2024</span>
            <div className="flex items-center gap-1">
              <Star className="text-yellow-500 fill-current" size={16} />
              <span className="text-sm">Grade: A-</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold">Assignment: Spatial Audio Scene Design</h4>
              <p className="text-sm text-gray-600">Due: November 30, 2024</p>
            </div>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">In Progress</span>
          </div>
          <p className="text-gray-700 mb-3">
            Design a 3D audio scene representing a natural environment. Use at least 4 different sound sources positioned in 3D space.
          </p>
          <div className="flex items-center gap-4">
            <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
              Continue Working
            </button>
            <span className="text-sm text-gray-600">Progress: 60%</span>
          </div>
        </div>
      </div>

      {/* Teacher Feedback */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Recent Feedback</h4>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded border-l-4 border-green-500">
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-medium">AI Melody Assignment</h5>
              <span className="text-sm text-gray-600">Prof. Johnson</span>
            </div>
            <p className="text-sm text-gray-700">
              "Great work on exploring different harmonic possibilities! Your modifications to the AI-generated melody show good understanding of voice leading principles. Consider experimenting with rhythmic variations next time."
            </p>
            <p className="text-xs text-gray-500 mt-2">November 21, 2024</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Practice Area</h1>
          <p className="text-gray-600">Create, experiment, and learn with AI composition and spatial audio tools</p>
        </div>

        {/* Navigation Tabs - Mobile Responsive */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex overflow-x-auto">
              {[
                { id: 'projects', label: 'My Projects', icon: Folder, shortLabel: 'Projects' },
                { id: 'compose', label: 'AI Composer', icon: Music, shortLabel: 'Compose' },
                { id: 'spatialize', label: 'Spatial Studio', icon: Volume2, shortLabel: 'Spatial' },
                { id: 'submissions', label: 'Assignments', icon: Upload, shortLabel: 'Assignments' }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap min-w-0 flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'projects' && renderProjectLibrary()}
          {activeTab === 'compose' && renderComposer()}
          {activeTab === 'spatialize' && renderSpatializer()}
          {activeTab === 'submissions' && renderSubmissions()}
        </div>
      </div>
    </div>
  );
};

export default StudentPractice;
