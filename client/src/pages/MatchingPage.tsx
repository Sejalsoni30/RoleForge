import React, { useEffect, useState, useMemo } from 'react';
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
  Search,
  FileText,
  Briefcase,
  GraduationCap,
  Target,
  Code,
  TrendingUp,
  Copy,
  Check,
  Sliders,
  Layers,
  Quote,
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCitationIdx, setCopiedCitationIdx] = useState<number | null>(null);

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

  const handleCopyCitation = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCitationIdx(idx);
    success('Citation copied to clipboard');
    setTimeout(() => setCopiedCitationIdx(null), 2000);
  };

  // Status counts for interactive filter badges
  const statusCounts = useMemo(() => {
    if (!matchAnalysis) return { all: 0, matched: 0, partially_matched: 0, not_mentioned: 0, not_demonstrated: 0 };
    const links = matchAnalysis.evidenceLinks;
    return {
      all: links.length,
      matched: links.filter((e) => e.status === 'matched').length,
      partially_matched: links.filter((e) => e.status === 'partially_matched').length,
      not_mentioned: links.filter((e) => e.status === 'not_mentioned').length,
      not_demonstrated: links.filter((e) => e.status === 'not_demonstrated').length,
    };
  }, [matchAnalysis]);

  // Filtered and searched evidence items
  const filteredEvidence = useMemo(() => {
    if (!matchAnalysis) return [];
    return matchAnalysis.evidenceLinks.filter((ev) => {
      const matchesStatus = filterStatus === 'all' || ev.status === filterStatus;
      const matchesSearch =
        !searchQuery.trim() ||
        ev.requirementText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.matchedTextInResume && ev.matchedTextInResume.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ev.category && ev.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [matchAnalysis, filterStatus, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  const getScoreTier = (score: number) => {
    if (score >= 85) return { label: 'High Alignment', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 70) return { label: 'Competitive Match', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    if (score >= 50) return { label: 'Moderate Fit', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Gaps Detected', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);
  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-2">
            <GitCompare className="w-3.5 h-3.5 text-indigo-600" />
            <span>Semantic Verification Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Match & Evidence Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Grounded algorithmic evaluation of your qualifications against target job requirements with direct citations.
          </p>
        </div>

        {matchAnalysis && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 shadow-xs"
              onClick={() => navigate(`/skill-gaps?matchId=${matchAnalysis.id}`)}
              leftIcon={<TrendingUp className="w-3.5 h-3.5 text-indigo-600" />}
            >
              Skill Gap Roadmap
            </Button>
            <Button
              size="sm"
              className="text-xs gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs"
              onClick={() => navigate(`/optimizations?resumeId=${selectedResumeId}&jobId=${selectedJobId}`)}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Optimize in Studio
            </Button>
          </div>
        )}
      </div>

      {/* Target Selector Card */}
      <Card className="p-5 sm:p-6 border border-slate-200/80 shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          
          {/* Resume Dropdown */}
          <div className="md:col-span-5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Select Candidate Resume</span>
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => {
                setSelectedResumeId(e.target.value);
                if (selectedJobId) fetchExistingMatch(e.target.value, selectedJobId);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer shadow-2xs"
            >
              {resumes.length === 0 && <option value="">No resumes found. Please upload one first.</option>}
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.parsedData.contact.fullName || 'Candidate'})
                </option>
              ))}
            </select>
          </div>

          {/* Job Dropdown */}
          <div className="md:col-span-5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>Select Target Job Description</span>
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => {
                setSelectedJobId(e.target.value);
                if (selectedResumeId) fetchExistingMatch(selectedResumeId, e.target.value);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer shadow-2xs"
            >
              {jobs.length === 0 && <option value="">No jobs found. Please add a job first.</option>}
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} — {j.company}
                </option>
              ))}
            </select>
          </div>

          {/* Action Button */}
          <div className="md:col-span-2">
            <Button
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-500/20"
              onClick={handleRunCompilation}
              isLoading={isCompiling}
              disabled={!selectedResumeId || !selectedJobId}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              {matchAnalysis ? 'Re-compile' : 'Compile'}
            </Button>
          </div>

        </div>
      </Card>

      {/* Match Results View */}
      {!matchAnalysis ? (
        <EmptyState
          icon={GitCompare}
          title="Ready to Compile Alignment"
          description="Select a candidate resume and target job posting above, then click 'Compile' to generate a grounded evidence breakdown."
          actionText="Run Compilation"
          onAction={handleRunCompilation}
        />
      ) : (
        <div className="space-y-6">
          
          {/* Top Score Banner & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Score Ring & Action CTAs Card (Spans 5 cols on LG) */}
            <Card className="lg:col-span-5 p-6 flex flex-col justify-between items-center text-center border border-slate-200/80 shadow-soft bg-white relative overflow-hidden">
              <div className="w-full flex flex-col items-center">
                {/* Score Tier Badge */}
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                      getScoreTier(matchAnalysis.overallScore).badge
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {getScoreTier(matchAnalysis.overallScore).label}
                  </span>
                </div>

                {/* Score Ring */}
                <ScoreRing score={matchAnalysis.overallScore} size={150} strokeWidth={12} />

                {/* Evidence Summary Counters */}
                <div className="grid grid-cols-3 gap-2 w-full mt-5 pt-4 border-t border-slate-100 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-base font-extrabold text-emerald-600 font-display">
                      {statusCounts.matched}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Verified</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-base font-extrabold text-amber-600 font-display">
                      {statusCounts.partially_matched}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Partial</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-base font-extrabold text-rose-500 font-display">
                      {statusCounts.not_mentioned + statusCounts.not_demonstrated}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Missing</span>
                  </div>
                </div>

                {/* Independent Estimate Disclaimer Pill */}
                <div className="mt-4 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100/70 text-[11px] text-indigo-900/90 text-left flex items-start gap-2.5 w-full">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>RoleForge Alignment Estimate:</strong> An independent algorithmic evaluation of requirement fulfillment, not an internal employer ATS score.
                  </p>
                </div>
              </div>

              {/* Action Buttons Stack (Generously Spaced & Never Wrapped) */}
              <div className="mt-5 space-y-2.5 w-full">
                <Button
                  className="w-full h-11 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all duration-150 flex items-center justify-center"
                  onClick={() => navigate(`/optimizations?resumeId=${selectedResumeId}&jobId=${selectedJobId}`)}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Optimize Resume in Studio
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-10 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border-slate-200 rounded-xl transition-all duration-150 flex items-center justify-center"
                  onClick={() => navigate(`/skill-gaps?matchId=${matchAnalysis.id}`)}
                  leftIcon={<TrendingUp className="w-4 h-4 text-indigo-600" />}
                >
                  View Skill Gap Roadmap
                </Button>
              </div>
            </Card>

            {/* Category Score Weights (Spans 7 cols on LG) */}
            <Card className="lg:col-span-7 p-6 border border-slate-200/80 shadow-soft bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900 font-display">
                      Weighted Category Evaluation
                    </h3>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    5 Dimensions Analyzed
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: 'Mandatory Qualifications',
                      weight: '45% Weight',
                      data: matchAnalysis.categoryScores.mandatorySkills,
                      color: 'bg-rose-500',
                      icon: Target,
                      iconColor: 'text-rose-500',
                    },
                    {
                      title: 'Preferred & Bonus Skills',
                      weight: '20% Weight',
                      data: matchAnalysis.categoryScores.preferredSkills,
                      color: 'bg-amber-500',
                      icon: Sparkles,
                      iconColor: 'text-amber-500',
                    },
                    {
                      title: 'Experience Depth & Roles',
                      weight: '15% Weight',
                      data: matchAnalysis.categoryScores.experienceRelevance,
                      color: 'bg-indigo-500',
                      icon: Briefcase,
                      iconColor: 'text-indigo-500',
                    },
                    {
                      title: 'Education & Credentials',
                      weight: '10% Weight',
                      data: matchAnalysis.categoryScores.educationAndCerts,
                      color: 'bg-sky-500',
                      icon: GraduationCap,
                      iconColor: 'text-sky-500',
                    },
                    {
                      title: 'Domain Knowledge & Keywords',
                      weight: '10% Weight',
                      data: matchAnalysis.categoryScores.domainKnowledge,
                      color: 'bg-emerald-500',
                      icon: Code,
                      iconColor: 'text-emerald-500',
                    },
                  ].map((cat, idx) => {
                    const CatIcon = cat.icon;
                    return (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-colors space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <CatIcon className={`w-4 h-4 ${cat.iconColor}`} />
                            <span className="font-bold text-slate-800">{cat.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({cat.weight})</span>
                          </div>
                          <span className="font-extrabold text-slate-900 font-display">
                            {cat.data.score}%
                          </span>
                        </div>

                        {/* Progress track */}
                        <div className="h-2 w-full rounded-full bg-slate-200/80 overflow-hidden">
                          <div
                            className={`h-full ${cat.color} rounded-full transition-all duration-700`}
                            style={{ width: `${cat.data.score}%` }}
                          />
                        </div>

                        <p className="text-[11px] text-slate-500 leading-snug">{cat.data.breakdown}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Weighted according to target job seniority requirements</span>
                <span className="font-semibold text-indigo-600">Zero ATS Hallucination</span>
              </div>
            </Card>

          </div>

          {/* Evidence Links Table with Search & Status Filter */}
          <Card className="p-6 border border-slate-200/80 shadow-soft bg-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Grounded Evidence Breakdown ({matchAnalysis.evidenceLinks.length} Criteria)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct citations connecting job qualifications to exact clauses in your resume.
                </p>
              </div>

              {/* Search Bar + Filter Tabs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Keyword Search Input */}
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search criteria or text..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-slate-100/80 border border-slate-200/60 text-xs">
                  {[
                    { id: 'all', label: 'All', count: statusCounts.all },
                    { id: 'matched', label: 'Matched', count: statusCounts.matched },
                    { id: 'partially_matched', label: 'Partial', count: statusCounts.partially_matched },
                    { id: 'not_mentioned', label: 'Not Mentioned', count: statusCounts.not_mentioned },
                    { id: 'not_demonstrated', label: 'Not Demonstrated', count: statusCounts.not_demonstrated },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilterStatus(tab.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        filterStatus === tab.id
                          ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          filterStatus === tab.id ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/70 text-slate-500'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Evidence Items List */}
            {filteredEvidence.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200/60">
                <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No criteria matching criteria</h4>
                <p className="text-xs text-slate-500 mt-1">Try resetting your search query or selecting a different filter.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 text-xs"
                  onClick={() => {
                    setFilterStatus('all');
                    setSearchQuery('');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredEvidence.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-300 transition-all bg-white shadow-xs hover:shadow-soft space-y-3"
                  >
                    {/* Header: Requirement text + Category tag + Confidence + Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-start sm:items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                          {ev.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {ev.requirementText}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                          {ev.confidence}% Confidence
                        </span>
                        <EvidenceStatusBadge status={ev.status} />
                      </div>
                    </div>

                    {/* Resume Matched Citation or Missing Callout */}
                    {ev.matchedTextInResume ? (
                      <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-slate-800 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <Quote className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-emerald-800">Verified Resume Citation: </span>
                            <span className="italic">"{ev.matchedTextInResume}"</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCitation(ev.matchedTextInResume, idx)}
                          className="text-emerald-700 hover:text-emerald-900 p-1 rounded hover:bg-emerald-100/50 transition-colors shrink-0"
                          title="Copy citation"
                        >
                          {copiedCitationIdx === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>No direct textual evidence verified in your uploaded resume.</span>
                      </div>
                    )}

                    {/* Recommendation Callout with Quick Optimize CTA */}
                    {ev.recommendation && (
                      <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/80 flex items-start justify-between gap-3 text-xs">
                        <div className="flex items-start gap-2 text-indigo-950">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <p className="leading-relaxed">
                            <strong className="text-indigo-900 font-semibold">Compiler Suggestion: </strong>
                            {ev.recommendation}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/optimizations?resumeId=${selectedResumeId}&jobId=${selectedJobId}`)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 shrink-0 whitespace-nowrap"
                        >
                          <span>Tailor</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>
      )}
    </div>
  );
};
