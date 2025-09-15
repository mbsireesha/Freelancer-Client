import React from 'react';
import { BrainCircuit, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">SkillBridge</span>
            </div>
            <p className="text-gray-400">
              Connecting talented freelancers with clients worldwide. Your bridge to success.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">For Clients</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Post a Project</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Find Freelancers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Project Management</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Payment Protection</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">For Freelancers</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Find Work</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Build Portfolio</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Skills Assessment</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Career Growth</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>support@skillbridge.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 SkillBridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;