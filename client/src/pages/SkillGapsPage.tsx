import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ISkillGap, SkillRoadmapStatus, IResume, IJobDescription } from '@roleforge/shared';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  BookOpen,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Code,
  Sparkles,
  GitCompare,
  FileText,
  Briefcase,
  Search,
  Check,
  Award,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const SkillGapsPage: React.FC = () => {
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryMatchId = searchParams.get('matchId');

  const [skillGap, setSkillGap] = useState<ISkillGap | null>(null);
  const [allSkillGaps, setAllSkillGaps] = useState<any[]>([]);
  const [resumes, setResumes] = useState<IResume[]>([]);
  const [jobs, setJobs] = useState<IJobDescription[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCompiling, setIsCompiling] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadInitialData();
  }, [queryMatchId]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // 1. If matchId is in URL, fetch that specific skill gap
      if (queryMatchId) {
        try {
          const res = await api.get<ISkillGap>(`/gaps/${queryMatchId}`);
          setSkillGap(res.data);
        } catch {
          // If matchId failed, fallback to latest
        }
      }

      // 2. Fetch list of all user's skill gaps and latest
      const [gapsRes, resumesRes, jobsRes] = await Promise.all([
        api.get<any[]>('/gaps').catch(() => ({ data: [] })),
        api.get<IResume[]>('/resumes').catch(() => ({ data: [] })),
        api.get<IJobDescription[]>('/jobs').catch(() => ({ data: [] })),
      ]);

      const gapsList = gapsRes.data || [];
      setAllSkillGaps(gapsList);

      const rList = resumesRes.data || [];
      const jList = jobsRes.data || [];
      setResumes(rList);
      setJobs(jList);
      if (rList.length > 0) setSelectedResumeId(rList[0].id);
      if (jList.length > 0) setSelectedJobId(jList[0].id);

      // If we don't have a skill gap loaded yet from queryMatchId, load the latest one
      if (!queryMatchId && gapsList.length > 0) {
        setSkillGap(gapsList[0]);
      } else if (!queryMatchId) {
        // Try /gaps/latest endpoint
        try {
          const latestRes = await api.get<ISkillGap | null>('/gaps/latest');
          if (latestRes.data) {
            setSkillGap(latestRes.data);
          }
        } catch {
          // No gaps yet
        }
      }
    } catch (err: any) {
      console.error('Failed to load skill gap data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSkillGap = async (targetMatchId: string) => {
    setSearchParams({ matchId: targetMatchId });
    try {
      setIsLoading(true);
      const res = await api.get<ISkillGap>(`/gaps/${targetMatchId}`);
      setSkillGap(res.data);
    } catch (err: any) {
      error(err.message || 'Failed to load selected roadmap.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!selectedResumeId || !selectedJobId) {
      error('Please select both a resume and a job description.');
      return;
    }

    setIsCompiling(true);
    try {
      const matchRes = await api.post<{ match: any }>('/matches/compile', {
        resumeId: selectedResumeId,
        jobDescriptionId: selectedJobId,
      });

      const newMatchId = matchRes.data.match.id || matchRes.data.match._id;
      setSearchParams({ matchId: newMatchId });

      const gapRes = await api.get<ISkillGap>(`/gaps/${newMatchId}`);
      setSkillGap(gapRes.data);
      success('Skill gap roadmap synthesized successfully!');
      // Refresh all gaps list
      api.get<any[]>('/gaps').then((r) => setAllSkillGaps(r.data || []));
    } catch (err: any) {
      error(err.message || 'Failed to generate skill gap roadmap.');
    } finally {
      setIsCompiling(false);
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: SkillRoadmapStatus) => {
    const activeMatchId = (skillGap as any)?.matchAnalysisId?._id || (skillGap as any)?.matchAnalysisId || queryMatchId;
    if (!skillGap || !activeMatchId) return;

    try {
      const res = await api.put<ISkillGap>(`/gaps/${activeMatchId}/item/${itemId}`, {
        status: newStatus,
      });
      setSkillGap(res.data);
      success(`Updated status to: ${newStatus.replace('_', ' ')}`);
    } catch (err: any) {
      error(err.message || 'Failed to update milestone status.');
    }
  };

  // Filtered roadmap items
  const filteredRoadmap = useMemo(() => {
    if (!skillGap) return [];
    return skillGap.roadmap.filter((item) => {
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'learning' && item.status === 'learning') ||
        (filterStatus === 'completed' && (item.status === 'completed' || item.status === 'already_known')) ||
        (filterStatus === 'critical' && item.importance === 'critical');

      const matchesSearch =
        !searchQuery.trim() ||
        item.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.actionPlan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [skillGap, filterStatus, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  // When no skill gap exists anywhere in the account
  if (!skillGap) {
    const hasAssets = resumes.length > 0 && jobs.length > 0;

    return (
      <div className="space-y-8 max-w-4xl mx-auto py-8">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
            <TrendingUp className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Skill Gap Analyzer & Roadmap
          </h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Extract missing requirements between your resume and a target job, generating a personalized competency roadmap.
          </p>
        </div>

        {hasAssets ? (
          <Card className="p-7 border border-indigo-100 bg-gradient-to-b from-white to-slate-50/50 shadow-soft">
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Generate Your First Skill Gap Roadmap
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Candidate Resume</span>
                  </label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.parsedData.contact.fullName || 'Candidate'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Target Job Posting</span>
                  </label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
                  >
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} — {j.company}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-500/20"
                onClick={handleGenerateRoadmap}
                isLoading={isCompiling}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Generate Skill Gap Roadmap Now
              </Button>
            </div>
          </Card>
        ) : (
          <EmptyState
            icon={TrendingUp}
            title="Upload a Resume & Add a Job to Begin"
            description="To generate an action roadmap, RoleForge requires at least one candidate resume and one target job description."
            actionText={resumes.length === 0 ? 'Upload Candidate Resume' : 'Add Target Job Description'}
            onAction={() => navigate(resumes.length === 0 ? '/resumes' : '/jobs')}
          />
        )}
      </div>
    );
  }

  // Active target details
  const matchInfo = (skillGap as any).matchAnalysisId;
  const targetJobTitle = matchInfo?.jobDescriptionId?.title || 'Target Job';
  const targetCompany = matchInfo?.jobDescriptionId?.company || '';
  const targetResumeTitle = matchInfo?.resumeId?.title || 'Candidate Resume';

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>Target Competency Roadmap</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Skill Gap Analyzer & Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Isolate missing qualifications, prioritize learning milestones, and track verified competencies.
          </p>
        </div>

        {/* Integrity Rule Badge */}
        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5 max-w-md shadow-2xs">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Zero-Hallucination Integrity:</strong> Skills on this roadmap are <em>never</em> automatically inserted into your resume until you genuinely acquire them.
          </p>
        </div>
      </div>

      {/* Target Selector Banner (When multiple matches exist) */}
      {allSkillGaps.length > 1 && (
        <Card className="p-4 border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800">Target Role Roadmap:</span>
          </div>
          <select
            value={(skillGap as any).matchAnalysisId?._id || queryMatchId || ''}
            onChange={(e) => handleSelectSkillGap(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            {allSkillGaps.map((g, idx) => {
              const m = g.matchAnalysisId;
              const jTitle = m?.jobDescriptionId?.title || `Target Analysis #${idx + 1}`;
              const jComp = m?.jobDescriptionId?.company ? ` (${m.jobDescriptionId.company})` : '';
              return (
                <option key={g._id || idx} value={m?._id || g.matchAnalysisId}>
                  {jTitle}{jComp} — {g.roadmap?.length || 0} gaps
                </option>
              );
            })}
          </select>
        </Card>
      )}

      {/* Progress & Summary Bar */}
      <Card className="p-6 border border-slate-200/80 shadow-soft bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Overall Competency Progress
              </span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {targetJobTitle} {targetCompany && `• ${targetCompany}`}
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 font-display mt-1">
              {skillGap.progressPercentage}%
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
              {skillGap.missingMandatory.length} Missing Mandatory
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
              {skillGap.missingPreferred.length} Missing Preferred
            </span>
          </div>
        </div>

        {/* Progress Track */}
        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all duration-700"
            style={{ width: `${Math.max(4, skillGap.progressPercentage)}%` }}
          />
        </div>
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search missing skills or action items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/60 text-xs">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'critical', label: 'Critical / Mandatory' },
            { id: 'learning', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === tab.id
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Roadmap Items List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 font-display">
          Target Competency Milestones ({filteredRoadmap.length})
        </h3>

        {filteredRoadmap.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200/60">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No milestones match your current filter</h4>
            <p className="text-xs text-slate-500 mt-1">Try selecting "All Items" or clearing your search query.</p>
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
          filteredRoadmap.map((item) => (
            <Card
              key={item.id}
              className={`p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 border transition-all ${
                item.status === 'completed' || item.status === 'already_known'
                  ? 'border-emerald-200/80 bg-emerald-50/20'
                  : 'border-slate-200/90 bg-white hover:border-indigo-200 hover:shadow-soft'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      item.importance === 'critical'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : item.importance === 'high'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    }`}
                  >
                    {item.importance}
                  </span>
                  <h4 className="text-base font-bold text-slate-900">{item.skill}</h4>
                  <span className="text-xs text-slate-400 font-medium">~{item.estimatedHours} hrs estimated</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{item.actionPlan}</p>

                {/* Resources */}
                {item.recommendedResources && item.recommendedResources.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 text-xs text-indigo-600 font-semibold">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>Learning Resource: {item.recommendedResources[0].title}</span>
                  </div>
                )}
              </div>

              {/* Status Select Toggle */}
              <div className="flex items-center gap-2 shrink-0">
                {(['learning', 'completed', 'already_known'] as SkillRoadmapStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(item.id, st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      item.status === st
                        ? st === 'completed'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : st === 'already_known'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'learning' ? 'In Progress' : st === 'completed' ? 'Completed' : 'Already Known'}
                  </button>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
