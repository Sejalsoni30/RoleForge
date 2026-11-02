import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ScoreRing } from '../components/motion/ScoreRing';
import { EvidenceStatusBadge } from '../components/ui/StatusBadge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { IResume, IJobDescription, IMatchAnalysis, EvidenceStatus } from '@roleforge/shared';
import {
  GitCompare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Info,
  ChevronRight,
} from 'lucide-react';

export const MatchingPage: React.FC = () => {
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [resumes, setResumes] = useState<IResume[]>([]);
  const [jobs, setJobs] = useState<IJobDescription[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  const [matchAnalysis, setMatchAnalysis] = useState<IMatchAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompiling, setIsCompiling] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resumesRes, jobsRes] = await Promise.all([
          api.get<IResume[]>('/resumes'),
          api.get<IJobDescription[]>('/jobs'),
        ]);

        const rList = resumesRes.data || [];
        const jList = jobsRes.data || [];
        setResumes(rList);
        setJobs(jList);

        const queryResId = searchParams.get('resumeId') || (rList[0]?.id ?? '');
        const queryJobId = searchParams.get('jobId') || (jList[0]?.id ?? '');

        setSelectedResumeId(queryResId);
        setSelectedJobId(queryJobId);

        if (queryResId && queryJobId) {
          await fetchExistingMatch(queryResId, queryJobId);
        }
      } catch (err: any) {
        error(err.message || 'Failed to initialize matching studio.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  const fetchExistingMatch = async (resId: string, jId: string) => {
    try {
      const res = await api.get<IMatchAnalysis | null>(`/matches/by-pair/${resId}/${jId}`);
      if (res.data) {
        setMatchAnalysis(res.data);
      } else {
        setMatchAnalysis(null);
      }
    } catch {
      setMatchAnalysis(null);
    }
  };

  const handleRunCompilation = async () => {
    if (!selectedResumeId || !selectedJobId) {
      error('Please select both a resume and a target job description.');
      return;
    }

    setIsCompiling(true);
    try {
      const res = await api.post<{ match: IMatchAnalysis }>('/matches/compile', {
        resumeId: selectedResumeId,
        jobDescriptionId: selectedJobId,
      });

      setMatchAnalysis(res.data.match);
      success('Alignment analysis compiled successfully with evidence grounding!');
    } catch (err: any) {
      error(err.message || 'Compilation failed.');
    } finally {
      setIsCompiling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  const filteredEvidence = matchAnalysis
    ? filterStatus === 'all'
      ? matchAnalysis.evidenceLinks
      : matchAnalysis.evidenceLinks.filter((e) => e.status === filterStatus)
    : [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          Match & Evidence Compiler
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Evidence-backed semantic alignment engine. Every qualification is linked directly to your resume text.
        </p>
      </div>

      {/* Target Selector Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Candidate Resume
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => {
                setSelectedResumeId(e.target.value);
                if (selectedJobId) fetchExistingMatch(e.target.value, selectedJobId);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {resumes.length === 0 && <option value="">No resumes found. Please upload one first.</option>}
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.parsedData.contact.fullName || 'Candidate'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Target Job Spec
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => {
                setSelectedJobId(e.target.value);
                if (selectedResumeId) fetchExistingMatch(selectedResumeId, e.target.value);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {jobs.length === 0 && <option value="">No jobs found. Please add a job first.</option>}
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} — {j.company}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Deterministic weighted scoring across mandatory & preferred criteria</span>
          </div>

          <Button
            onClick={handleRunCompilation}
            isLoading={isCompiling}
            disabled={!selectedResumeId || !selectedJobId}
            rightIcon={<Sparkles className="w-4 h-4 ml-1" />}
          >
            {matchAnalysis ? 'Re-compile Alignment' : 'Compile Alignment Analysis'}
          </Button>
        </div>
      </Card>

      {/* Match Results View */}
      {!matchAnalysis ? (
        <EmptyState
          icon={GitCompare}
          title="Ready to Compile"
          description="Click 'Compile Alignment Analysis' above to parse relationships between your resume and the target job description."
          actionText="Run Compilation"
          onAction={handleRunCompilation}
        />
      ) : (
        <div className="space-y-6">
          {/* Top Score Banner & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Ring & Disclaimer Card */}
            <Card className="p-6 flex flex-col items-center justify-center text-center">
              <ScoreRing score={matchAnalysis.overallScore} size={140} strokeWidth={11} />

              <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 text-left flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>RoleForge Alignment Estimate:</strong> An independent algorithmic evaluation of requirement fulfillment, not an internal employer ATS score.
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => navigate(`/skill-gaps?matchId=${matchAnalysis.id}`)}
                >
                  Skill Gap Roadmap →
                </Button>
                <Button
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => navigate(`/optimizations?resumeId=${selectedResumeId}&jobId=${selectedJobId}`)}
                >
                  Optimize Resume →
                </Button>
              </div>
            </Card>

            {/* Category Score Weights */}
            <Card className="p-6 lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Weighted Category Evaluation
              </h3>

              <div className="space-y-3.5">
                {[
                  {
                    title: 'Mandatory Qualifications',
                    weight: '45% Weight',
                    data: matchAnalysis.categoryScores.mandatorySkills,
                    color: 'bg-rose-500',
                  },
                  {
                    title: 'Preferred & Bonus Skills',
                    weight: '20% Weight',
                    data: matchAnalysis.categoryScores.preferredSkills,
                    color: 'bg-amber-500',
                  },
                  {
                    title: 'Experience Depth & Roles',
                    weight: '15% Weight',
                    data: matchAnalysis.categoryScores.experienceRelevance,
                    color: 'bg-indigo-500',
                  },
                  {
                    title: 'Education & Credentials',
                    weight: '10% Weight',
                    data: matchAnalysis.categoryScores.educationAndCerts,
                    color: 'bg-sky-500',
                  },
                  {
                    title: 'Domain Knowledge & Keywords',
                    weight: '10% Weight',
                    data: matchAnalysis.categoryScores.domainKnowledge,
                    color: 'bg-emerald-500',
                  },
                ].map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{cat.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({cat.weight})</span>
                      </div>
                      <span className="font-extrabold text-slate-900">{cat.data.score}%</span>
                    </div>
                    {/* Progress track */}
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full ${cat.color} rounded-full transition-all duration-700`}
                        style={{ width: `${cat.data.score}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">{cat.data.breakdown}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Evidence Links Table with Status Filter */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Grounded Evidence Breakdown ({matchAnalysis.evidenceLinks.length} Criteria)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct citation of resume text against job requirements.
                </p>
              </div>

              {/* Status filter tabs */}
              <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/60 text-xs">
                {['all', 'matched', 'partially_matched', 'not_mentioned', 'not_demonstrated'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      filterStatus === st
                        ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'all'
                      ? 'All'
                      : st === 'matched'
                      ? 'Matched'
                      : st === 'partially_matched'
                      ? 'Partial'
                      : st === 'not_mentioned'
                      ? 'Not Mentioned'
                      : 'Not Demonstrated'}
                  </button>
                ))}
              </div>
            </div>

            {/* Evidence items */}
            <div className="space-y-3">
              {filteredEvidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200/90 hover:border-indigo-200 transition-all bg-white shadow-sm space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {ev.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{ev.requirementText}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {ev.confidence}% Confidence
                      </span>
                      <EvidenceStatusBadge status={ev.status} />
                    </div>
                  </div>

                  {/* Resume matched citation or missing status */}
                  {ev.matchedTextInResume ? (
                    <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs text-slate-700">
                      <span className="font-semibold text-emerald-800">Resume Citation: </span>
                      <span className="italic">"{ev.matchedTextInResume}"</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
                      <span>No direct textual evidence verified in submitted resume.</span>
                    </div>
                  )}

                  {/* Recommendation if not fully matched */}
                  {ev.recommendation && (
                    <p className="text-[11px] text-indigo-700 font-medium">
                      💡 <strong>Compiler Suggestion:</strong> {ev.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

