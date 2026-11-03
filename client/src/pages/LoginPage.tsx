import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { RoleForgeLogo } from '../components/ui/RoleForgeLogo';
import { signInWithGoogle, isFirebaseConfigured } from '../config/firebase';
import {
  Mail,
  Lock,
  ArrowRight,
  Info,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Star,
  Check,
  ArrowLeft,
  Zap,
} from 'lucide-react';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={`${className} shrink-0`} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.86c2.26-2.09 3.685-5.17 3.685-9.09z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.37 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
    />
  </svg>
);

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleOauthNote, setGoogleOauthNote] = useState(false);

  // Pre-warm the backend server on mount (eliminates Render free tier cold-start delay)
  useEffect(() => {
    api.get('/health').catch(() => {});
  }, []);

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured()) {
      setGoogleOauthNote(true);
      return;
    }

    setIsGoogleLoading(true);
    try {
      const fbUser = await signInWithGoogle();
      if (!fbUser.email) {
        throw new Error('Google did not return an email address.');
      }
      await loginWithGoogle({
        email: fbUser.email,
        name: fbUser.displayName || 'Google User',
        avatar: fbUser.photoURL || undefined,
        googleId: fbUser.uid,
      });
      success('Welcome to RoleForge!');
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      error(err.message || 'Google sign-in failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      success('Welcome back to RoleForge!');
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      error(err.message || 'Login failed. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900 font-sans relative overflow-x-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-violet-200/35 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[26rem] h-[26rem] bg-sky-100/50 rounded-full blur-3xl" />
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(#4338ca 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link to="/" className="group flex items-center gap-2">
          <RoleForgeLogo size="md" showSubtitle={true} />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors bg-white/80 hover:bg-white px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-xs backdrop-blur-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 my-auto">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left / Login Form Panel (Span 6 on LG, 7 on XL) */}
          <div className="lg:col-span-6 xl:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-7 sm:p-9 relative">
              
              {/* Form Header */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-[11px] font-semibold text-indigo-700 mb-3">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Resume-to-Job Compiler v2.4</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                  Welcome back
                </h1>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Sign in to access your tailored resumes, evidence-backed matching, and interview studio.
                </p>
              </div>

              {/* Google One-Click Sign-In */}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 bg-white hover:bg-slate-50/80 text-slate-700 font-semibold text-sm border-slate-200/90 shadow-xs hover:border-slate-300 rounded-xl transition-all duration-150 flex items-center justify-center"
                  onClick={handleGoogleSignIn}
                  isLoading={isGoogleLoading}
                  leftIcon={<GoogleIcon />}
                >
                  Continue with Google
                </Button>

                {googleOauthNote && (
                  <div className="mt-3 p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Google OAuth requires <code className="font-mono bg-white px-1 rounded text-[11px]">VITE_FIREBASE_API_KEY</code>. You can also sign in directly using email and password below.
                    </p>
                  </div>
                )}
              </div>

              {/* Or Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/80" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-400 font-medium tracking-wider uppercase text-[10px]">
                    or continue with email
                  </span>
                </div>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                    autoComplete="email"
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 hover:text-slate-600 focus:outline-none transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-slate-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    }
                    autoComplete="current-password"
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
                  </label>
                </div>

                {/* Submit CTA */}
                <Button
                  type="submit"
                  className="w-full h-11 mt-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/25 transition-all duration-150"
                  isLoading={isLoading}
                  rightIcon={!isLoading ? <ArrowRight className="w-4 h-4 ml-1" /> : undefined}
                >
                  {isLoading ? 'Signing in...' : 'Sign In to RoleForge'}
                </Button>
              </form>

              {/* Sign Up Redirect */}
              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-600">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors inline-flex items-center gap-0.5"
                  >
                    <span>Create one free</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </p>
              </div>

              {/* Privacy Footer Guarantee */}
              <div className="mt-5 pt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero AI training on your resumes • 256-bit TLS</span>
              </div>
            </div>
          </div>

          {/* Right / Product Showcase Panel (Hidden on mobile/tablet, shown on LG+) */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-6 flex-col justify-center space-y-6 pl-4">
            
            {/* Live Compiler Visual Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xl shadow-indigo-500/5 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-indigo-100/70 to-transparent rounded-full blur-2xl -z-10" />

              {/* Top Tag & Status */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 font-display">
                    Target Role Alignment
                  </span>
                </div>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Staff Engineer • Cloud
                </span>
              </div>

              {/* Match Score Display */}
              <div className="mt-5 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                  <div className="text-center">
                    <span className="text-xl font-extrabold tracking-tight font-display leading-none">94%</span>
                    <span className="block text-[8px] font-semibold uppercase tracking-wider text-indigo-200 mt-0.5">Match</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    High ATS Fulfillment Probability
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    12 of 13 mandatory requirements verified with exact textual evidence in your experience.
                  </p>
                </div>
              </div>

              {/* Verified Requirements Pills */}
              <div className="mt-5 space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Distributed Systems Architecture</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    Demonstrated
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>TypeScript & Full-Stack Node.js</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    Demonstrated
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-indigo-900 font-medium">
                    <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Suggested Optimization (Zero Hallucination)</span>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-100">
                    Refined
                  </span>
                </div>
              </div>
            </div>

            {/* Testimonial Quote Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/70 p-5 shadow-sm">
              <div className="flex items-center gap-1 text-amber-400 mb-2.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "RoleForge eliminated the guesswork. It showed me exactly where my resume had gaps before I hit submit, and never invented false metrics. Landed 3 interviews in two weeks."
              </p>
              <div className="mt-3 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold font-display">
                  SC
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Sarah Chen</h4>
                  <p className="text-[10px] text-slate-400">Senior Full-Stack Engineer</p>
                </div>
              </div>
            </div>

            {/* Value Metrics Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-slate-200/60 text-center">
                <span className="block text-base font-extrabold text-indigo-600 font-display">3.8x</span>
                <span className="text-[10px] text-slate-500 font-medium">Interview Callbacks</span>
              </div>
              <div className="bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-slate-200/60 text-center">
                <span className="block text-base font-extrabold text-slate-800 font-display">100%</span>
                <span className="text-[10px] text-slate-500 font-medium">ATS Parsable</span>
              </div>
              <div className="bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-slate-200/60 text-center">
                <span className="block text-base font-extrabold text-emerald-600 font-display">0%</span>
                <span className="text-[10px] text-slate-500 font-medium">Fake Data</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Page Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center text-xs text-slate-400">
        <span>© {new Date().getFullYear()} RoleForge – Resume-to-Job Compiler. All rights reserved.</span>
      </footer>
    </div>
  );
};
