import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { RoleForgeLogo } from '../components/ui/RoleForgeLogo';
import { signInWithGoogle, isFirebaseConfigured } from '../config/firebase';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  FileCheck,
  Target,
  Wand2,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, loginWithGoogle } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured()) {
      error('Firebase Google authentication is not configured.');
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
      navigate('/onboarding');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      error(err.message || 'Google sign-up failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      error('Please complete all fields.');
      return;
    }
    if (password.length < 8) {
      error('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await register({ name, email, password });
      success('Account created! Let us configure your career preferences.');
      navigate('/onboarding');
    } catch (err: any) {
      error(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900 font-sans relative overflow-x-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[30rem] h-[30rem] bg-violet-200/35 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-[26rem] h-[26rem] bg-sky-100/50 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(#4338ca 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Top Header */}
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
          
          {/* Left Form Panel */}
          <div className="lg:col-span-6 xl:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-7 sm:p-9 relative">
              
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100/80 text-[11px] font-semibold text-emerald-700 mb-3">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Free Forever Account • No Credit Card</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                  Start Compiling Free
                </h1>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Join thousands of engineers and professionals matching real requirements with zero hallucinations.
                </p>
              </div>

              {/* Google Sign-in */}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 bg-white hover:bg-slate-50/80 text-slate-700 font-semibold text-sm border-slate-200/90 shadow-xs hover:border-slate-300 rounded-xl transition-all duration-150 flex items-center justify-center gap-2.5"
                  onClick={handleGoogleSignIn}
                  isLoading={isGoogleLoading}
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                  <span>Sign up with Google</span>
                </Button>
              </div>

              {/* Or Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/80" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-400 font-medium tracking-wider uppercase text-[10px]">
                    or create with email
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    leftIcon={<User className="w-4 h-4 text-slate-400" />}
                    autoComplete="name"
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

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
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password (Min. 8 characters)
                  </label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a secure password"
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
                    autoComplete="new-password"
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                {/* Agreement Checkbox */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="agree"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="agree" className="text-xs text-slate-500 leading-snug cursor-pointer select-none">
                    I agree to the Terms of Service. My resume data is private and will never be used for public model training.
                  </label>
                </div>

                {/* Submit CTA */}
                <Button
                  type="submit"
                  className="w-full h-11 mt-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/25 transition-all duration-150"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                >
                  Create Free Account
                </Button>
              </form>

              {/* Switch to login */}
              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors inline-flex items-center gap-0.5"
                  >
                    <span>Sign in</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </p>
              </div>

              {/* Privacy Footer */}
              <div className="mt-5 pt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Strict Data Privacy • Never Sold or Leaked</span>
              </div>

            </div>
          </div>

          {/* Right Showcase Panel */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-6 flex-col justify-center space-y-6 pl-4">
            
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xl shadow-indigo-500/5 p-6">
              <h2 className="text-lg font-bold text-slate-900 font-display">
                How RoleForge Powers Your Job Search
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                A transparent, evidence-backed compiler that aligns your authentic experience to modern ATS standards.
              </p>

              {/* 3 Step Process Card */}
              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">1. Instant Parsing & Validation</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload your real PDF or DOCX resume. All qualifications, roles, and impact metrics are parsed with original preservation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">2. Algorithmic Requirement Mapping</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Paste the target job description. Requirements are automatically classified into mandatory vs preferred with evidence links.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">3. Zero-Hallucination Tailoring</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Accept or reject side-by-side bullet optimizations. We never invent fake numbers, dates, or jobs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Promise Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/70 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center text-indigo-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">Zero-Data Training Guarantee</span>
                <span className="text-slate-500">Your documents are never retained for AI training and can be permanently deleted anytime.</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center text-xs text-slate-400">
        <span>© {new Date().getFullYear()} RoleForge – Resume-to-Job Compiler. All rights reserved.</span>
      </footer>
    </div>
  );
};
