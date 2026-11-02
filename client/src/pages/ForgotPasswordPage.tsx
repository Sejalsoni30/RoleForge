import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Layers, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await api.post<{ devResetToken?: string }>('/auth/forgot-password', { email });
      setSubmitted(true);
      if (res.devResetToken) {
        setDevToken(res.devResetToken);
      }
      success('Password reset instructions generated.');
    } catch (err: any) {
      error(err.message || 'Failed to submit password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 hero-mesh-gradient">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-slate-900 font-display">RoleForge</span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 font-display">Reset your password</h2>
        <p className="mt-2 text-sm text-slate-600">
          Remember your password?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="p-8 shadow-elevated border border-slate-200">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Check your inbox</h3>
              <p className="text-xs text-slate-600">
                If an account with <strong className="text-slate-800">{email}</strong> exists, password reset instructions have been dispatched.
              </p>

              {devToken && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-left text-xs">
                  <p className="font-semibold text-indigo-900 mb-1">Local Testing Token:</p>
                  <code className="block bg-white p-1.5 rounded border text-[11px] font-mono break-all text-slate-700">
                    {devToken}
                  </code>
                  <div className="mt-2 text-right">
                    <Link
                      to={`/reset-password?token=${devToken}`}
                      className="font-bold text-indigo-700 hover:underline"
                    >
                      Open Password Reset Link →
                    </Link>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Return to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Send Reset Link
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

