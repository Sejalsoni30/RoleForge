import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import {
  IOptimization,
  IResume,
  IJobDescription,
  OptimizationSuggestion,
  OptimizationStatus,
} from '@roleforge/shared';
import {
  Sparkles,
  Check,
  X,
  Edit2,
  RotateCcw,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  CheckCheck,
} from 'lucide-react';

export const OptimizationsPage: React.FC = () => {
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [resumes, setResumes] = useState<IResume[]>([]);
  const [jobs, setJobs] = useState<IJobDescription[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  const [optimization, setOptimization] = useState<IOptimization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // In-place editing state
  const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const [resumesRes, jobsRes] = await Promise.all([
          api.get<IResume[]>('/resumes'),
          api.get<IJobDescription[]>('/jobs'),
        ]);

        const rList = resumesRes.data || [];
        const jList = jobsRes.data || [];
        setResumes(rList);
        setJobs(jList);

        const rId = searchParams.get('resumeId') || (rList[0]?.id ?? '');
        const jId = searchParams.get('jobId') || (jList[0]?.id ?? '');

        setSelectedResumeId(rId);
        setSelectedJobId(jId);

        if (rId && jId) {
          await fetchOptimizations(rId, jId);
        }
      } catch (err: any) {
        error(err.message || 'Failed to load optimization studio.');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [searchParams]);

  const fetchOptimizations = async (rId: string, jId: string) => {
    try {
      const res = await api.get<IOptimization | null>(`/optimizations/by-pair/${rId}/${jId}`);
      setOptimization(res.data);
    } catch {
      setOptimization(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedResumeId || !selectedJobId) return;

    setIsGenerating(true);
    try {
      const res = await api.post<IOptimization>('/optimizations/generate', {
        resumeId: selectedResumeId,
        jobDescriptionId: selectedJobId,
      });
      setOptimization(res.data);
      success('Optimization suggestions compiled!');
    } catch (err: any) {
      error(err.message || 'Failed to generate suggestions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStatusUpdate = async (
    suggestionId: string,
    status: OptimizationStatus,
    customText?: string
  ) => {
    if (!optimization) return;
    const optId = optimization.id || (optimization as any)._id;
    if (!optId) return;

    try {
      const res = await api.put<IOptimization>(
        `/optimizations/${optId}/suggestion/${suggestionId}`,
        {
          status,
          editedText: customText,
        }
      );
      setOptimization(res.data);
      setEditingSuggestionId(null);
    } catch (err: any) {
      error(err.message || 'Failed to update suggestion.');
    }
  };

  const handleApplyAll = async () => {
    if (!optimization) return;
    const optId = optimization.id || (optimization as any)._id;
    if (!optId) return;

    setIsApplying(true);
    try {
      await api.post(`/optimizations/${optId}/apply`);
      success('Accepted optimizations successfully written into your resume draft!');
      navigate('/builder');
    } catch (err: any) {
      error(err.message || 'Failed to apply optimizations.');
    } finally {
      setIsApplying(false);
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

  const acceptedCount =
    optimization?.suggestions.filter((s) => s.status === 'accepted' || s.status === 'edited').length || 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Optimization Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Side-by-side diffing with full editorial control. Never fabricates credentials or unverified numbers.
          </p>
        </div>

        {optimization && acceptedCount > 0 && (
          <Button
            onClick={handleApplyAll}
            isLoading={isApplying}
            leftIcon={<CheckCheck className="w-4 h-4" />}
          >
            Apply {acceptedCount} Accepted to Resume
          </Button>
        )}
      </div>

      {/* Target Selector */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Resume</label>
            <select
              value={selectedResumeId}
              onChange={(e) => {
                setSelectedResumeId(e.target.value);
                if (selectedJobId) fetchOptimizations(e.target.value, selectedJobId);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Job Spec
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => {
                setSelectedJobId(e.target.value);
                if (selectedResumeId) fetchOptimizations(selectedResumeId, e.target.value);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} — {j.company}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Accept, reject, edit, or undo each item individually.</span>
          </div>
          <Button
            onClick={handleGenerate}
            isLoading={isGenerating}
            rightIcon={<Sparkles className="w-4 h-4 ml-1" />}
          >
            {optimization ? 'Re-generate Suggestions' : 'Generate Optimizations'}
          </Button>
        </div>
      </Card>

      {/* Suggestions List */}
      {!optimization || optimization.suggestions.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No Optimization Suggestions Yet"
          description="Click 'Generate Optimizations' to compile high-impact, truthful phrasing proposals tailored to this job specification."
          actionText="Generate Suggestions"
          onAction={handleGenerate}
        />
      ) : (
        <div className="space-y-6">
          {optimization.suggestions.map((suggestion) => {
            const isEditing = editingSuggestionId === suggestion.id;

            return (
              <Card
                key={suggestion.id}
                className={`p-6 transition-all ${
                  suggestion.status === 'accepted'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : suggestion.status === 'rejected'
                    ? 'border-slate-200 opacity-60 bg-slate-50/40'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      Section: {suggestion.section}
                    </span>
                    <span className="text-xs text-slate-500">
                      Target: <em>{suggestion.evidenceOrigin}</em>
                    </span>
                  </div>

                  {/* Status chip */}
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      suggestion.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : suggestion.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : suggestion.status === 'edited'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {suggestion.status}
                  </span>
                </div>

                {/* Side-by-side diff */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original text */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <p className="font-bold text-slate-500 mb-1.5 uppercase text-[10px] tracking-wider">
                      Current Phrasing
                    </p>
                    <p className="text-slate-700 leading-relaxed">{suggestion.originalText}</p>
                  </div>

                  {/* Proposed text / Edit view */}
                  <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 text-xs">
                    <p className="font-bold text-indigo-800 mb-1.5 uppercase text-[10px] tracking-wider">
                      RoleForge Proposal
                    </p>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingSuggestionId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(suggestion.id, 'edited', editingText)
                            }
                          >
                            Save Custom Phrasing
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {suggestion.editedText || suggestion.proposedText}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rationale & User Prompt if missing data */}
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-slate-500">
                    <strong className="text-slate-700">Rationale:</strong> {suggestion.rationale}
                  </p>

                  {suggestion.requiresUserData && suggestion.userPromptQuestion && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold">User Input Requested: </strong>
                        <span>{suggestion.userPromptQuestion}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingSuggestionId(suggestion.id);
                      setEditingText(suggestion.editedText || suggestion.proposedText);
                    }}
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit Phrasing
                  </Button>

                  <div className="flex items-center gap-2">
                    {suggestion.status !== 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusUpdate(suggestion.id, 'pending')}
                        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                      >
                        Undo
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(suggestion.id, 'rejected')}
                      className="text-rose-600 hover:bg-rose-50"
                      leftIcon={<X className="w-3.5 h-3.5" />}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusUpdate(suggestion.id, 'accepted')}
                      className="bg-emerald-600 hover:bg-emerald-700"
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

