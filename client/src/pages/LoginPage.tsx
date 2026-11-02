import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { signInWithGoogle, isFirebaseConfigured } from '../config/firebase';
import { Layers, Mail, Lock, ArrowRight, Info } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleOauthNote, setGoogleOauthNote] = useState(false);

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
      error(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 hero-mesh-gradient">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            Role<span className="text-indigo-600">Forge</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Or{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            create a new account for free
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="p-8 shadow-elevated border border-slate-200/80">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                autoComplete="current-password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
            >
              Sign In
            </Button>
          </form>

          {/* Social / Google OAuth Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full text-slate-700 hover:bg-slate-50"
                onClick={handleGoogleSignIn}
                isLoading={isGoogleLoading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
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
                Continue with Google
              </Button>

              {googleOauthNote && (
                <div className="mt-3 p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    To enable Google OAuth in this instance, provide <code className="font-mono bg-white px-1 rounded text-[11px]">GOOGLE_CLIENT_ID</code> in the server environment. Email and password authentication is active and ready.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

