import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import ResourceCard from '../components/resources/ResourceCard';
import { resourcesAPI } from '../services/api';
import { DIFFICULTY_LEVELS, RESOURCE_CATEGORIES } from '../utils/constants';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const categories = ['all', ...Object.values(RESOURCE_CATEGORIES)];
  const difficulties = ['all', ...Object.values(DIFFICULTY_LEVELS)];

  // Curated fallback collections for choral educators and music theory
  const fallbackResources = [
    {
      _id: 'acda-k12',
      title: 'ACDA: Resources for K-12 Choral Educators',
      description: 'Curated collection with tools, articles, and guidance for K-12 choral directors.',
      category: 'k-12-choral',
      type: 'collection',
      difficulty: 'all-levels',
      duration: 20,
      author: { name: 'American Choral Directors Association', university: 'acda.org' },
      thumbnailUrl: '',
      content: `# K-12 Choral Educator Toolkit

## Focus areas
- Program planning and curriculum sequencing
- Rehearsal strategy and warm-up design
- Repertoire selection and concert programming
- Assessment ideas and student growth tracking
- Advocacy and community support for choral programs

## Suggested use
Use this toolkit as a planning companion when building units, running rehearsals, or preparing performance cycles.

## Ideal for
K-12 directors seeking practical, classroom-ready guidance.
`,
    },
    {
      _id: 'wis-choral-educator',
      title: 'Wisconsin Choral Educator Resources',
      description: 'Extensive educator toolkit with planning guides, rehearsal resources, repertoire ideas, and professional learning materials.',
      category: 'choral-educator',
      type: 'collection',
      difficulty: 'all-levels',
      duration: 45,
      author: { name: 'Wisconsin Choral Directors Association', university: 'wischoral.org' },
      thumbnailUrl: '',
      content: `# Wisconsin Choral Educator Resources

## Highlights
- Planning templates and calendars
- Festival and assessment preparation checklists
- Rehearsal pacing and classroom management tips
- Recruitment and retention ideas
- Professional learning links

## Suggested use
Choose one focus area at a time and integrate a tool into your weekly planning routine.

## Ideal for
Middle and high school choral educators.
`,
    },
    {
      _id: 'hs-choral-theory',
      title: 'High School Choral Resources: Music Theory',
      description: 'Theory resources and classroom materials tailored for high school choral programs.',
      category: 'music-theory',
      type: 'collection',
      difficulty: 'intermediate',
      duration: 30,
      author: { name: 'High School Choral Resources', university: 'highschoolchoralresources.com' },
      thumbnailUrl: '',
      content: `# High School Choral Resources: Music Theory

## Topics covered
- Notation, rhythm, and meter review
- Intervals, scales, and key signatures
- Triads, seventh chords, and inversions
- Sight-singing and ear training prompts
- Theory vocabulary for rehearsal language

## Classroom ideas
Use short mini-lessons or warm-ups to reinforce theory concepts in rehearsal.
`,
    },
    {
      _id: 'musictheory-lessons',
      title: 'MusicTheory.net Free Lessons',
      description: 'Complete sequence of free, interactive lessons covering notation, rhythm, scales, chords, and harmony.',
      category: 'music-theory',
      type: 'lesson',
      difficulty: 'beginner',
      duration: 60,
      author: { name: 'MusicTheory.net', university: 'musictheory.net' },
      thumbnailUrl: '',
      content: `# MusicTheory.net Free Lessons (Curated Path)

## Lesson sequence
1. Notation and rhythm foundations
2. Scales, intervals, and key signatures
3. Triads, seventh chords, and harmonic function
4. Cadences and chord progressions
5. Ear training connections

## Teaching tip
Assign one lesson per week and follow with a quick in-class application (singing, clapping, or analysis).
`,
    },
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchResources = async () => {
      try {
        const response = await resourcesAPI.getAll({ limit: 200 });
        const payload = response?.data || {};
        const data = payload.data || payload.resources || payload.data?.resources || [];

        if (isMounted) {
          setResources(data);
        }
      } catch (error) {
        console.error('Failed to fetch resources:', error);
        if (isMounted) {
          setResources(fallbackResources);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResources();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title?.toLowerCase().includes(search.toLowerCase()) ||
      resource.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Choral Education Resources
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Curated collections and free lessons for K-12 choral educators and music theory instruction.
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
            <ResourceCard key={resource.id || resource._id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;