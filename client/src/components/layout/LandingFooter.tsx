import React from 'react';
import { Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 font-display">RoleForge</span>
          <span className="text-xs text-slate-400">© {new Date().getFullYear()} RoleForge SaaS. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
          <Link to="/login" className="hover:text-indigo-600">Sign In</Link>
          <Link to="/register" className="hover:text-indigo-600">Get Started</Link>
          <span className="text-slate-300">•</span>
          <span>ATS Verification Compliant</span>
          <span className="text-slate-300">•</span>
          <span>Zero-Data Training Privacy Guarantee</span>
        </div>
      </div>
    </footer>
  );
};

