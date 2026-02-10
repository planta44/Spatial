import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Music, Waves, ArrowLeft } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Student Practice', path: '/practice' },
    { name: 'Teacher Training', path: '/teacher-training' },
    { name: 'Resources', path: '/resources' },
    { name: 'Policies', path: '/policies' },
    { name: 'Login', path: '/admin' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            {/* Back Button - only show on non-home pages */}
            {location.pathname !== '/' && (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Go back"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline text-sm">Back</span>
              </button>
            )}
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Waves className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
                <Music className="h-4 w-4 text-purple-500 absolute -top-1 -right-1" />
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Spatial AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation with Dropdown Animation */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="relative">
          {/* Blurred Background */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md"></div>
          
          {/* Menu Items */}
          <div className="relative px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 transform ${
                  isOpen 
                    ? 'translate-x-0 opacity-100' 
                    : 'translate-x-4 opacity-0'
                } ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 hover:text-gray-900'
                }`}
                style={{
                  transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
                }}
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    isActive(item.path) ? 'bg-white' : 'bg-blue-500'
                  }`}></span>
                  <span>{item.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;