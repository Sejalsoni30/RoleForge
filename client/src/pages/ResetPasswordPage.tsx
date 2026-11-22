import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { RoleForgeLogo } from '../components/ui/RoleForgeLogo';
import { Lock, ArrowRight, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordError =
    passwordTouched && password.length > 0 && password.length < 8
      ? 'Password must be at least 8 characters long.'
      : undefined;

  const confirmError =
    confirmPasswordTouched && confirmPassword.length > 0 && confirmPassword !== password
      ? 'Passwords do not match.'
      : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      error('Missing reset token. Please request a new password reset link.');
      return;
    }
    if (password.length < 8) {
      setPasswordTouched(true);
      error('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordTouched(true);
      error('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      success('Password successfully reset! Please sign in with your new credentials.');
      navigate('/login');
    } catch (err: any) {
      error(err.message || 'Password reset failed. The token may be expired or invalid.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 hero-mesh-gradient">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex justify-center mb-6">
          <RoleForgeLogo size="lg" showSubtitle={true} />
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 font-display">
          {token ? 'Choose a new password' : 'Reset your password'}
        </h2>
        {token && (
          <p className="mt-2 text-sm text-slate-600">
            Please enter and confirm your new secure password below.
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="p-8 shadow-elevated border border-slate-200">
          {!token ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Missing Reset Token</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We couldn't detect a valid password reset token in your link. Reset links expire after 1 hour or may have been broken during copying.
              </p>
              <div className="pt-2 space-y-2">
                <Link to="/forgot-password" className="block">
                  <Button className="w-full" size="md">
                    Request New Reset Link
                  </Button>
                </Link>
                <Link to="/login" className="block">
                  <Button variant="ghost" className="w-full text-xs text-slate-600">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setPasswordTouched(true)}
                error={passwordError}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />

              <Input
                label="Confirm New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setConfirmPasswordTouched(true)}
                error={confirmError}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Update Password
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
