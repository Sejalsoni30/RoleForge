import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { RoleForgeLogo } from '../ui/RoleForgeLogo';
import { Menu, X, ArrowRight } from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Intelligence', id: 'intelligence' },
    { label: 'Job Matching', id: 'matching' },
    { label: 'Optimization Studio', id: 'studio' },
    { label: 'Interview Prep', id: 'interview' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="group">
          <RoleForgeLogo size="lg" showSubtitle={true} />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/dashboard')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Dashboard ({user?.name.split(' ')[0]})
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="font-semibold text-slate-700 hover:text-slate-900"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
                className="font-bold shadow-sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Compile Resume Free
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-5 pt-3 pb-6 space-y-2 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="block w-full text-left py-2.5 text-sm font-bold text-slate-700 hover:text-indigo-600 border-b border-slate-100 last:border-b-0"
            >
              {item.label}
            </button>
          ))}

          <div className="pt-3 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate('/login')} className="w-full">
                  Sign In
                </Button>
                <Button onClick={() => navigate('/register')} className="w-full">
                  Compile Resume Free
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
