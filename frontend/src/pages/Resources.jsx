import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import ResourceCard from '../components/resources/ResourceCard';
import { resourcesAPI } from '../services/api';
import toast from 'react-hot-toast';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const categories = ['all', 'spatial-audio', 'pedagogy', 'theory', 'practical', 'technology', 'policy'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  // Mock data with specific requested resources
  const mockResources = [
    {
      _id: '1',
      title: 'Introduction to AI Music Tools',
      description: 'Comprehensive guide introducing educators to AI-powered music education tools and spatial audio systems.',
      category: 'technology',
      type: 'document',
      difficulty: 'beginner',
      duration: 60,
      views: 2340,
      rating: { average: 4.8, count: 156 },
      author: { name: 'Spatial AI Education Team', university: 'Spatial AI Platform' },
      thumbnailUrl: '',
    },
    {
      _id: '2',
      title: 'Spatial Audio Listening Exercise',
      description: 'Structured 4-part exercise to develop acute spatial hearing skills and understand audio positioning effects.',
      category: 'practical',
      type: 'document',
      difficulty: 'intermediate',
      duration: 50,
      views: 1890,
      rating: { average: 4.7, count: 134 },
      author: { name: 'Spatial AI Education Team', university: 'Spatial AI Platform' },
      thumbnailUrl: '',
    },
    {
      _id: '3',
      title: 'Collaborative Composition Project',
      description: 'Multi-week project guide for students to create original music using AI tools and spatial audio.',
      category: 'pedagogy',
      type: 'document',
      difficulty: 'intermediate',
      duration: 90,
      views: 1567,
      rating: { average: 4.9, count: 89 },
      author: { name: 'Spatial AI Education Team', university: 'Spatial AI Platform' },
      thumbnailUrl: '',
    },
    {
      _id: '4',
      title: 'AI Composition Rubric',
      description: 'Detailed assessment criteria and scoring guide for AI-assisted music composition projects.',
      category: 'pedagogy',
      type: 'document',
      difficulty: 'intermediate',
      duration: 30,
      views: 1234,
      rating: { average: 4.6, count: 78 },
      author: { name: 'Spatial AI Education Team', university: 'Spatial AI Platform' },
      thumbnailUrl: '',
    },
    {
      _id: '5',
      title: 'Spatial Audio Project Checklist',
      description: 'Comprehensive checklist covering all phases of spatial audio projects from setup to presentation.',
      category: 'practical',
      type: 'document',
      difficulty: 'beginner',
      duration: 25,
      views: 1890,
      rating: { average: 4.5, count: 112 },
      author: { name: 'Spatial AI Education Team', university: 'Spatial AI Platform' },
      thumbnailUrl: '',
    },
    {
      _id: '6',
      title: 'Academic Integrity Guidelines',
      description: 'Complete ethical guidelines for AI-assisted creative work and collaborative projects.',
      category: 'policy',
      type: 'document',
      difficulty: 'beginner',
      duration: 35,
      views: 2100,
      rating: { average: 4.7, count: 145 },
      author: { name: 'Spatial AI Education Team', university: 'Spatial AI Platform' },
      thumbnailUrl: '',
    },
    {
      _id: '7',
      title: 'Binaural Audio Fundamentals',
      description: 'Learn the basics of binaural audio recording and playback techniques for immersive music experiences.',
      category: 'spatial-audio',
      type: 'video',
      difficulty: 'beginner',
      duration: 45,
      views: 1234,
      rating: { average: 4.5, count: 89 },
      author: { name: 'Dr. Jane Mukami', university: 'University of Nairobi' },
      thumbnailUrl: '',
    },
    {
      _id: '8',
      title: 'Teaching Music Theory with Spatial Audio',
      description: 'Innovative approaches to teaching traditional music theory using spatial audio technology.',
      category: 'pedagogy',
      type: 'module',
      difficulty: 'intermediate',
      duration: 60,
      views: 856,
      rating: { average: 4.7, count: 62 },
      author: { name: 'Prof. John Kamau', university: 'Kenyatta University' },
      thumbnailUrl: '',
    },
    {
      _id: '9',
      title: 'Advanced Ambisonic Techniques',
      description: 'Master ambisonic recording, mixing, and playback for professional spatial audio production.',
      category: 'spatial-audio',
      type: 'document',
      difficulty: 'advanced',
      duration: 90,
      views: 542,
      rating: { average: 4.9, count: 45 },
      author: { name: 'Dr. Sarah Wanjiru', university: 'Moi University' },
      thumbnailUrl: '',
    },
    {
      _id: '10',
      title: 'Policy Framework for Music Ed Technology',
      description: 'Understanding and implementing educational technology policies in Kenyan universities.',
      category: 'policy',
      type: 'document',
      difficulty: 'intermediate',
      duration: 30,
      views: 678,
      rating: { average: 4.3, count: 34 },
      author: { name: 'Prof. David Omondi', university: 'Egerton University' },
      thumbnailUrl: '',
    },
    {
      _id: '11',
      title: 'Practical Spatial Audio Setup Guide',
      description: 'Step-by-step guide to setting up spatial audio equipment in your classroom or studio.',
      category: 'practical',
      type: 'interactive',
      difficulty: 'beginner',
      duration: 40,
      views: 1567,
      rating: { average: 4.6, count: 112 },
      author: { name: 'Dr. Mary Achieng', university: 'Maseno University' },
      thumbnailUrl: '',
    },
    {
      _id: '12',
      title: 'Music Technology Integration Assessment',
      description: 'Comprehensive assessment tools for evaluating student understanding of music technology.',
      category: 'technology',
      type: 'assessment',
      difficulty: 'intermediate',
      duration: 50,
      views: 934,
      rating: { average: 4.4, count: 71 },
      author: { name: 'Dr. Peter Ngugi', university: 'Technical University of Kenya' },
      thumbnailUrl: '',
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setResources(mockResources);
      setLoading(false);
    }, 500);
  }, []);

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(search.toLowerCase()) ||
                         resource.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Resource Library
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Curated music education materials for spatial audio training
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredResources.length} of {resources.length} resources
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resources...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600">No resources found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource._id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;