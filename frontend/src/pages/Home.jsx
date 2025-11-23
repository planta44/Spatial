import { Link } from 'react-router-dom';
import { Waves, GraduationCap, FileText, TrendingUp, Users, Headphones, Play, Star, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedCard from '../components/animations/AnimatedCard';
import CountUpNumber from '../components/animations/CountUpNumber';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

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
    { value: 20, label: 'Universities', suffix: '+' },
    { value: 500, label: 'Teachers Trained', suffix: '+' },
    { value: 1000, label: 'Resources', suffix: '+' },
    { value: 95, label: 'Satisfaction Rate', suffix: '%' },
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

      {/* Stats Section with Count-Up Animation */}
      <section className="bg-white py-12 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <AnimatedCard
                key={index}
                animationType="scaleUp"
                delay={index * 100}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  <CountUpNumber 
                    end={stat.value} 
                    duration={2000} 
                    suffix={stat.suffix}
                    className="inline-block"
                  />
                </div>
                <div className="text-gray-600 text-sm md:text-base">{stat.label}</div>
              </AnimatedCard>
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
            {features.map((feature, index) => {
              const animationTypes = ['fadeInUp', 'fadeInLeft', 'fadeInRight', 'scaleUp', 'slideInUp', 'rotateIn'];
              const animationType = animationTypes[index % animationTypes.length];
              
              return (
                <AnimatedCard
                  key={index}
                  animationType={animationType}
                  delay={index * 150}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                >
                  <div className={`${feature.bg} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-8 w-8 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </AnimatedCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section with Movement Animation */}
      <section className="bg-gradient-to-r from-primary-600 to-accent-600 py-16 px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl"
          />
          <motion.div
            animate={{
              x: [0, -80, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full blur-xl"
          />
        </div>

        <AnimatedCard
          animationType="fadeInUp"
          className="max-w-4xl mx-auto text-center text-white relative z-10"
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Ready to Transform Music Education?
          </motion.h2>
          <p className="text-lg mb-8 text-gray-100">
            Join hundreds of educators already using Spatial AI to enhance their teaching.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              Get Started Today
            </Link>
          </motion.div>
        </AnimatedCard>
      </section>
    </div>
  );
};

export default Home;