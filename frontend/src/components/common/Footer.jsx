import { Music, Mail, Github, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Music className="h-6 w-6 text-primary-400" />
              <span className="text-xl font-bold text-white">Spatial AI</span>
            </div>
            <p className="text-gray-400 mb-4">
              Transforming music teacher training through spatial audio technology and AI-powered solutions for Kenyan universities.
            </p>
            <p className="text-sm text-gray-500">
              Policy, Resources, and Scalability in Music Education
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/training" className="hover:text-primary-400 transition-colors">
                  Training Programs
                </a>
              </li>
              <li>
                <a href="/resources" className="hover:text-primary-400 transition-colors">
                  Resource Library
                </a>
              </li>
              <li>
                <a href="/policies" className="hover:text-primary-400 transition-colors">
                  Policy Framework
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-primary-400 transition-colors">
                  Admin Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@spatialai.edu" className="hover:text-primary-400 transition-colors">
                  info@spatialai.edu
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Github className="h-4 w-4" />
                <a href="#" className="hover:text-primary-400 transition-colors">
                  GitHub
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Linkedin className="h-4 w-4" />
                <a href="#" className="hover:text-primary-400 transition-colors">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Spatial AI for Music Teacher Training. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;