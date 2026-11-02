import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Layers, Briefcase, Target, ShieldCheck, ArrowRight, Check } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [currentRole, setCurrentRole] = useState(user?.currentRole || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || '');
  const [targetIndustry, setTargetIndustry] = useState(user?.targetIndustry || 'Technology & Software');
  const [yearsOfExperience, setYearsOfExperience] = useState(user?.yearsOfExperience || 3);
  const [atsOptimizationLevel, setAtsOptimizationLevel] = useState<'balanced' | 'aggressive' | 'strict-ats'>('balanced');
  const [isLoading, setIsLoading] = useState(false);

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        currentRole,
        targetRole,
        targetIndustry,
        yearsOfExperience: Number(yearsOfExperience),
        onboardingComplete: true,
        preferences: {
          atsOptimizationLevel,
          emailAlerts: true,
          defaultTemplate: 'ats-classic',
        },
      });
      success('Onboarding complete! Welcome to your compiler workspace.');
      navigate('/dashboard');
    } catch (err: any) {
      error(err.message || 'Failed to save onboarding preferences.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 hero-mesh-gradient">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-slate-900 font-display">RoleForge</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 font-display">
          Personalize Your Compilation Workspace
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Step {step} of 2 — Configure your career targets and ATS optimization engine
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <Card className="p-8 shadow-elevated border border-slate-200">
          {step === 1 ? (
            <div className="space-y-4">
              <Input
                label="What is your current or most recent job title?"
                placeholder="e.g. Senior Frontend Engineer"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                leftIcon={<Briefcase className="w-4 h-4" />}
                required
              />

              <Input
                label="What role are you targeting next?"
                placeholder="e.g. Staff Software Engineer / Tech Lead"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                leftIcon={<Target className="w-4 h-4" />}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Target Industry
                  </label>
                  <select
                    value={targetIndustry}
                    onChange={(e) => setTargetIndustry(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Technology & Software">Technology & Software</option>
                    <option value="Fintech & Banking">Fintech & Banking</option>
                    <option value="Healthcare & HealthTech">Healthcare & HealthTech</option>
                    <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                  </select>
                </div>

                <Input
                  label="Years of Experience"
                  type="number"
                  min={0}
                  max={50}
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => setStep(2)}
                  className="w-full"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                >
                  Continue to Preferences
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select ATS Optimization Aggressiveness
                </label>
                <div className="space-y-3">
                  {[
                    {
                      id: 'balanced',
                      title: 'Balanced (Recommended)',
                      desc: 'Balances ATS keyword alignment with natural human recruiter readability.',
                    },
                    {
                      id: 'strict-ats',
                      title: 'Strict ATS Verification',
                      desc: 'Strict single-column formatting, zero complex glyphs, maximum keyword density.',
                    },
                    {
                      id: 'aggressive',
                      title: 'Impact Accelerated',
                      desc: 'Prioritizes bold action metrics, leadership vocabulary, and quantified outcomes.',
                    },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setAtsOptimizationLevel(opt.id as any)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        atsOptimizationLevel === opt.id
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">{opt.title}</span>
                        {atsOptimizationLevel === opt.id && (
                          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleFinish}
                  isLoading={isLoading}
                  className="flex-1"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                >
                  Finish & Open Workspace
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

