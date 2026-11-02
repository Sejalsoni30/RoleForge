import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { IResume, IJobDescription, IApplication } from '@roleforge/shared';
import {
  FileText,
  Briefcase,
  GitCompare,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const DashboardOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState<IResume[]>([]);
  const [jobs, setJobs] = useState<IJobDescription[]>([]);
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [resumesRes, jobsRes, appsRes] = await Promise.all([
          api.get<IResume[]>('/resumes'),
          api.get<IJobDescription[]>('/jobs'),
          api.get<IApplication[]>('/applications'),
        ]);

        setResumes(resumesRes.data || []);
        setJobs(jobsRes.data || []);
        setApplications(appsRes.data || []);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const hasData = resumes.length > 0 || jobs.length > 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {user?.targetRole ? `Compiling career assets for ${user.targetRole}` : 'Resume-to-Job Compilation Workspace'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/jobs')}
            leftIcon={<Briefcase className="w-4 h-4" />}
          >
            Add Job Spec
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/resumes')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Upload Resume
          </Button>
        </div>
      </div>

      {/* Primary KPI Metrics (REAL DATA ONLY) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card variant="default" className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Resumes</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{resumes.length}</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {resumes.length > 0 ? `${resumes[0].title}` : 'No resumes uploaded yet'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </Card>

        <Card variant="default" className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Job Specs</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{jobs.length}</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {jobs.length > 0 ? `${jobs.length} analyzed` : 'No jobs added yet'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </Card>

        <Card variant="default" className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Applications</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{applications.length}</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {applications.filter((a) => a.status === 'interviewing').length} currently interviewing
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </Card>

        <Card variant="default" className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compilation Engine</p>
            <h3 className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Grounded Evidence
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Zero Hallucinations</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {!hasData ? (
        /* Empty State with clear guidance */
        <EmptyState
          icon={FileText}
          title="Your Compilation Workspace is Ready"
          description="To begin evidence-backed matching, start by uploading your existing resume (PDF or DOCX), then paste a target job description to generate your first alignment estimate."
          actionText="Upload Your Resume"
          onAction={() => navigate('/resumes')}
        />
      ) : (
        /* Workflow Quick Action Pipeline */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Resumes */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>My Resumes</span>
                </h3>
                <Link to="/resumes" className="text-xs font-semibold text-indigo-600 hover:underline">
                  View All ({resumes.length})
                </Link>
              </div>

              {resumes.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No resumes uploaded yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {resumes.slice(0, 3).map((res) => (
                    <div
                      key={res.id}
                      onClick={() => navigate('/matching')}
                      className="p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-200 hover:bg-slate-50/50 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{res.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {res.parsedData.contact.fullName || 'Candidate'} • {res.parsedData.skills.technical.length} skills indexed
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Target Job Descriptions */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>Target Job Descriptions</span>
                </h3>
                <Link to="/jobs" className="text-xs font-semibold text-indigo-600 hover:underline">
                  View All ({jobs.length})
                </Link>
              </div>

              {jobs.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No job descriptions added yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {jobs.slice(0, 3).map((job) => (
                    <div
                      key={job.id}
                      onClick={() => navigate('/matching')}
                      className="p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-200 hover:bg-slate-50/50 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{job.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {job.company} • {job.parsedRequirements.mandatoryRequirements.length} mandatory criteria
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Quick compilation launchpad */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 to-indigo-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-elevated">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold">Ready to run a new alignment compilation?</h3>
              <p className="text-xs text-indigo-200">
                Select your resume and target job description to compute evidence links and skill gaps.
              </p>
            </div>
            <Button
              onClick={() => navigate('/matching')}
              className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold flex-shrink-0"
              rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
            >
              Open Match Studio
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
