import { Link } from 'react-router-dom';
import { Waves, GraduationCap, FileText, TrendingUp, Users, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const features = [
    {
      icon: Headphones,
      title: 'Spatial Audio Engine',
      description: 'Advanced 3D audio analysis and visualization tools for immersive music education.',
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      icon: GraduationCap,
      title: 'Teacher Training',
      description: 'Comprehensive modules designed specifically for music teacher professional development.',
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      icon: FileText,
      title: 'Policy Framework',
      description: 'Track and manage educational policies across multiple Kenyan universities.',
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      icon: TrendingUp,
      title: 'Scalability Dashboard',
      description: 'Monitor deployment, track metrics, and scale programs university-wide.',
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    },
    {
      icon: Users,
      title: 'Collaborative Learning',
      description: 'Connect educators across institutions to share knowledge and best practices.',
      color: 'text-pink-600',
      bg: 'bg-pink-100'
    },
    {
      icon: Waves,
      title: 'Resource Library',
      description: 'Access curated music education materials, from theory to practical applications.',
      color: 'text-cyan-600',
      bg: 'bg-cyan-100'
    },
  ];

  const stats = [
    { value: '20+', label: 'Universities' },
    { value: '500+', label: 'Teachers Trained' },
    { value: '1000+', label: 'Resources' },
    { value: '95%', label: 'Satisfaction Rate' },
  ];

  return (
    <div className="">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Spatial AI for Music Teacher Training
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-gray-100">
              Policy, Resources, and Scalability in Kenyan Universities
            </p>
            <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-3xl mx-auto">
              Empowering music educators with cutting-edge spatial audio technology, 
              comprehensive training resources, and scalable implementation frameworks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/training"
                className="bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Explore Training
              </Link>
              <Link
                to="/resources"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Browse Resources
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to transform music education in your institution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow"
              >
                <div className={`${feature.bg} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-accent-600 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Music Education?
          </h2>
          <p className="text-lg mb-8 text-gray-100">
            Join hundreds of educators already using Spatial AI to enhance their teaching.
          </p>
          <Link
            to="/admin"
            className="inline-block bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;