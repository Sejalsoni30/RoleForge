import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ICareerSwitchRoadmap, IResume } from '@roleforge/shared';
import {
  Compass,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  Calendar,
  Layers,
} from 'lucide-react';

export const CareerSwitchPage: React.FC = () => {
  const { success, error } = useToast();

  const [resumes, setResumes] = useState<IResume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Distributed Systems Engineer');
  const [roadmaps, setRoadmaps] = useState<ICareerSwitchRoadmap[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<ICareerSwitchRoadmap | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [resumesRes, roadmapsRes] = await Promise.all([
          api.get<IResume[]>('/resumes'),
          api.get<ICareerSwitchRoadmap[]>('/career-switch'),
        ]);

        const rList = resumesRes.data || [];
        setResumes(rList);
        if (rList[0]) setSelectedResumeId(rList[0].id);

        const rmList = roadmapsRes.data || [];
        setRoadmaps(rmList);
        if (rmList[0]) setActiveRoadmap(rmList[0]);
      } catch (err: any) {
        error(err.message || 'Failed to load career switch data.');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) return;

    setIsGenerating(true);
    try {
      const res = await api.post<ICareerSwitchRoadmap>('/career-switch/generate', {
        targetRole,
        resumeId: selectedResumeId,
      });
      success(`Transition roadmap to ${targetRole} compiled!`);
      setActiveRoadmap(res.data);
      setRoadmaps((prev) => [res.data, ...prev]);
    } catch (err: any) {
      error(err.message || 'Failed to generate career transition plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          Career-Switch & Transition Mode
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Bridge from your current expertise to a new target domain with transferable skill mapping and targeted portfolio proof.
        </p>
      </div>

      {/* Target Role Form */}
      <Card className="p-6">
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Source Resume
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5">
            <Input
              label="Aspirational Target Role"
              placeholder="e.g. Machine Learning Infrastructure Engineer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <Button
              type="submit"
              className="w-full"
              isLoading={isGenerating}
              rightIcon={<Sparkles className="w-4 h-4 ml-1" />}
            >
              Compile Plan
            </Button>
          </div>
        </form>
      </Card>

      {/* Transition Plan Breakdown */}
      {!activeRoadmap ? (
        <EmptyState
          icon={Compass}
          title="No Career Transition Plan Generated"
          description="Enter your target job title above to evaluate transferable strengths and view a month-by-month bridge plan."
          actionText="Compile Transition Plan"
          onAction={() => handleGenerate({ preventDefault: () => {} } as any)}
        />
      ) : (
        <div className="space-y-6">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transferable Strengths */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Transferable Capabilities</h3>
                  <p className="text-[11px] text-slate-500">Skills immediately applicable to target role</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {activeRoadmap.transferableSkills.map((sk, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800"
                  >
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </Card>

            {/* Foundational Gaps */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Foundational Gaps</h3>
                  <p className="text-[11px] text-slate-500">Core requirements to acquire</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {activeRoadmap.missingFoundations.map((g, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800"
                  >
                    • {g}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          {/* Bridge Projects */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FolderGit2 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Recommended Bridge Portfolio Projects
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRoadmap.bridgeProjects.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs"
                >
                  <h4 className="font-bold text-slate-900 text-sm">{proj.title}</h4>
                  <p className="text-slate-600">{proj.description}</p>
                  <div className="pt-2 flex flex-wrap gap-1">
                    {proj.skillsDemonstrated.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white border text-[10px] font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-indigo-700 font-semibold pt-1">
                    🎯 Screen Impact: {proj.portfolioImpact}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Month-by-Month Roadmap Milestones */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                {activeRoadmap.timelineMonths}-Month Transition Execution Schedule
              </h3>
            </div>

            <div className="space-y-4">
              {activeRoadmap.milestones.map((ms) => (
                <div key={ms.month} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700 uppercase tracking-wider text-[11px]">
                      Month {ms.month}
                    </span>
                    <span className="font-bold text-slate-800">{ms.goal}</span>
                  </div>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {ms.tasks.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

