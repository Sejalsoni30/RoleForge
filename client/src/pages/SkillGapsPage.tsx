import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ISkillGap, SkillRoadmapStatus } from '@roleforge/shared';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  BookOpen,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Code,
} from 'lucide-react';

export const SkillGapsPage: React.FC = () => {
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('matchId');

  const [skillGap, setSkillGap] = useState<ISkillGap | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSkillGap = async () => {
      try {
        if (matchId) {
          const res = await api.get<ISkillGap>(`/gaps/${matchId}`);
          setSkillGap(res.data);
        } else {
          // If no matchId provided in query params, find matches first
          const matches = await api.get<any[]>('/matches/compile');
          // or check recent match
        }
      } catch (err: any) {
        console.error('Failed to load skill gap analysis', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkillGap();
  }, [matchId]);

  const handleStatusChange = async (itemId: string, newStatus: SkillRoadmapStatus) => {
    if (!skillGap || !matchId) return;

    try {
      const res = await api.put<ISkillGap>(`/gaps/${matchId}/item/${itemId}`, {
        status: newStatus,
      });
      setSkillGap(res.data);
      success(`Status updated to ${newStatus.replace('_', ' ')}!`);
    } catch (err: any) {
      error(err.message || 'Failed to update item status.');
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

  if (!skillGap) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No Skill Gap Analysis Found"
        description="Run an alignment compilation between a resume and a job description to extract missing criteria and an action roadmap."
        actionText="Open Matching Studio"
        onAction={() => navigate('/matching')}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Skill Gap Analyzer & Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track missing qualifications, learn target technologies, and mark milestones as completed.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2 max-w-md">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Integrity Rule:</strong> Skills on your roadmap are <em>never</em> automatically inserted into your resume until you genuinely acquire them.
          </span>
        </div>
      </div>

      {/* Progress & Summary Bar */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Roadmap Completion Progress
            </span>
            <h3 className="text-2xl font-bold text-slate-900">{skillGap.progressPercentage}%</h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-rose-700 font-semibold">
              {skillGap.missingMandatory.length} Missing Mandatory
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-700 font-semibold">
              {skillGap.missingPreferred.length} Missing Preferred
            </span>
          </div>
        </div>

        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-700"
            style={{ width: `${skillGap.progressPercentage}%` }}
          />
        </div>
      </Card>

      {/* Roadmap Items */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Target Competency Milestones ({skillGap.roadmap.length})
        </h3>

        {skillGap.roadmap.map((item) => (
          <Card key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    item.importance === 'critical'
                      ? 'bg-rose-100 text-rose-800'
                      : item.importance === 'high'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {item.importance}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{item.skill}</h4>
                <span className="text-xs text-slate-400">~{item.estimatedHours} hrs study</span>
              </div>
              <p className="text-xs text-slate-600">{item.actionPlan}</p>

              {/* Resources */}
              {item.recommendedResources.length > 0 && (
                <div className="flex items-center gap-3 pt-1 text-[11px] text-indigo-600 font-medium">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Curated Learning Guide: {item.recommendedResources[0].title}</span>
                </div>
              )}
            </div>

            {/* Status Select Toggle */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {(['learning', 'completed', 'already_known'] as SkillRoadmapStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(item.id, st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    item.status === st
                      ? st === 'completed'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : st === 'already_known'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'learning' ? 'In Progress' : st === 'completed' ? 'Completed' : 'Already Known'}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

