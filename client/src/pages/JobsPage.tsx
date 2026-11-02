import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { IJobDescription, RequirementItem } from '@roleforge/shared';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowRight,
  Sliders,
} from 'lucide-react';

export const JobsPage: React.FC = () => {
  const { success, error } = useToast();

  const [jobs, setJobs] = useState<IJobDescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Job Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobRawText, setJobRawText] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);

  // Requirement Editor Modal
  const [selectedJob, setSelectedJob] = useState<IJobDescription | null>(null);
  const [isSavingCorrections, setIsSavingCorrections] = useState(false);

  // Delete Confirm
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await api.get<IJobDescription[]>('/jobs');
      setJobs(res.data || []);
    } catch (err: any) {
      error(err.message || 'Failed to load job descriptions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobRawText.trim() || jobRawText.trim().length < 30) {
      error('Please provide a substantive job description (at least 30 characters).');
      return;
    }

    setIsCompiling(true);
    try {
      const res = await api.post<IJobDescription>('/jobs', {
        title: jobTitle,
        company: companyName,
        rawText: jobRawText,
      });
      success(`Job description for "${res.data.title}" compiled and categorized!`);
      setIsAddModalOpen(false);
      setJobTitle('');
      setCompanyName('');
      setJobRawText('');
      await fetchJobs();
    } catch (err: any) {
      error(err.message || 'Failed to parse job description.');
    } finally {
      setIsCompiling(false);
    }
  };

  const handleRequirementCategoryChange = (
    reqId: string,
    newCategory: 'mandatory' | 'preferred' | 'optional'
  ) => {
    if (!selectedJob) return;

    const copy = JSON.parse(JSON.stringify(selectedJob)) as IJobDescription;
    const reqs = copy.parsedRequirements;

    // Remove from all existing lists
    let targetItem: RequirementItem | undefined;
    const findAndRemove = (list: RequirementItem[]) => {
      const idx = list.findIndex((r) => r.id === reqId);
      if (idx !== -1) {
        targetItem = list.splice(idx, 1)[0];
      }
    };

    findAndRemove(reqs.mandatoryRequirements);
    findAndRemove(reqs.preferredRequirements);
    findAndRemove(reqs.optionalRequirements);

    if (targetItem) {
      targetItem.category = newCategory;
      targetItem.weight = newCategory === 'mandatory' ? 75 : newCategory === 'preferred' ? 45 : 20;

      if (newCategory === 'mandatory') reqs.mandatoryRequirements.push(targetItem);
      else if (newCategory === 'preferred') reqs.preferredRequirements.push(targetItem);
      else reqs.optionalRequirements.push(targetItem);
    }

    setSelectedJob(copy);
  };

  const handleSaveCorrections = async () => {
    if (!selectedJob) return;

    setIsSavingCorrections(true);
    try {
      await api.put(`/jobs/${selectedJob.id}`, {
        title: selectedJob.title,
        company: selectedJob.company,
        parsedRequirements: selectedJob.parsedRequirements,
      });
      success('Job categorization corrections saved successfully.');
      setSelectedJob(null);
      await fetchJobs();
    } catch (err: any) {
      error(err.message || 'Failed to save job modifications.');
    } finally {
      setIsSavingCorrections(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!deleteJobId) return;

    setIsDeleting(true);
    try {
      await api.delete(`/jobs/${deleteJobId}`);
      success('Job description deleted.');
      setDeleteJobId(null);
      await fetchJobs();
    } catch (err: any) {
      error(err.message || 'Failed to delete job description.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Target Job Descriptions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Categorize criteria into mandatory, preferred, and optional with full user correction authority.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Job Description
        </Button>
      </div>

      {/* Jobs Grid */}
      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Job Descriptions Added"
          description="Paste the requirements from a job posting you wish to target. RoleForge will parse key qualifications and prioritize mandatory vs preferred requirements."
          actionText="Add Target Job"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((job) => (
            <Card key={job.id} variant="default" className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{job.title}</h4>
                      <p className="text-[11px] text-slate-500">{job.company}</p>
                    </div>
                  </div>

                  {job.userCorrectionsApplied && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      User Corrected
                    </span>
                  )}
                </div>

                {/* Categorization Breakdown Chips */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
                    <p className="font-extrabold text-rose-700 text-sm">
                      {job.parsedRequirements.mandatoryRequirements.length}
                    </p>
                    <p className="text-[10px] uppercase font-semibold text-rose-600 mt-0.5">Mandatory</p>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="font-extrabold text-amber-700 text-sm">
                      {job.parsedRequirements.preferredRequirements.length}
                    </p>
                    <p className="text-[10px] uppercase font-semibold text-amber-600 mt-0.5">Preferred</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                    <p className="font-extrabold text-slate-700 text-sm">
                      {job.parsedRequirements.optionalRequirements.length}
                    </p>
                    <p className="text-[10px] uppercase font-semibold text-slate-600 mt-0.5">Optional</p>
                  </div>
                </div>

                {/* Key Skills */}
                <div className="mt-4 flex flex-wrap gap-1">
                  {job.parsedRequirements.keySkills.slice(0, 6).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedJob(JSON.parse(JSON.stringify(job)))}
                    leftIcon={<Sliders className="w-3.5 h-3.5" />}
                  >
                    Adjust Categories
                  </Button>
                  <button
                    onClick={() => setDeleteJobId(job.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete job description"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Job Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Compile Target Job Description"
        description="Paste job requirements. The compiler will isolate mandatory qualifications from bonus skills."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateJob} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Job Title"
              placeholder="e.g. Senior Backend Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
            <Input
              label="Hiring Organization"
              placeholder="e.g. Stripe, Linear"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <Textarea
            label="Job Description & Qualifications"
            placeholder="Paste complete job post, responsibilities, requirements, and tech stack..."
            value={jobRawText}
            onChange={(e) => setJobRawText(e.target.value)}
            rows={10}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCompiling} rightIcon={<Sparkles className="w-4 h-4" />}>
              Compile & Extract Requirements
            </Button>
          </div>
        </form>
      </Modal>

      {/* Requirement Categorization Modal */}
      {selectedJob && (
        <Modal
          isOpen={Boolean(selectedJob)}
          onClose={() => setSelectedJob(null)}
          title={`Requirement Categorization (${selectedJob.title})`}
          description="Move requirements between Mandatory, Preferred, or Optional to ensure accurate alignment weights."
          maxWidth="2xl"
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
            {/* Mandatory Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Mandatory Requirements ({selectedJob.parsedRequirements.mandatoryRequirements.length})
                </h4>
              </div>
              <div className="space-y-2">
                {selectedJob.parsedRequirements.mandatoryRequirements.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3 text-xs"
                  >
                    <span className="text-slate-800 flex-1">{req.text}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleRequirementCategoryChange(req.id, 'preferred')}
                        className="px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold text-[10px]"
                      >
                        → Preferred
                      </button>
                      <button
                        onClick={() => handleRequirementCategoryChange(req.id, 'optional')}
                        className="px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-[10px]"
                      >
                        → Optional
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferred Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Preferred / Nice-to-Have Requirements ({selectedJob.parsedRequirements.preferredRequirements.length})
                </h4>
              </div>
              <div className="space-y-2">
                {selectedJob.parsedRequirements.preferredRequirements.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3 text-xs"
                  >
                    <span className="text-slate-800 flex-1">{req.text}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleRequirementCategoryChange(req.id, 'mandatory')}
                        className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[10px]"
                      >
                        → Mandatory
                      </button>
                      <button
                        onClick={() => handleRequirementCategoryChange(req.id, 'optional')}
                        className="px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-[10px]"
                      >
                        → Optional
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Section */}
            {selectedJob.parsedRequirements.optionalRequirements.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Optional Requirements ({selectedJob.parsedRequirements.optionalRequirements.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {selectedJob.parsedRequirements.optionalRequirements.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3 text-xs"
                    >
                      <span className="text-slate-800 flex-1">{req.text}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleRequirementCategoryChange(req.id, 'mandatory')}
                          className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[10px]"
                        >
                          → Mandatory
                        </button>
                        <button
                          onClick={() => handleRequirementCategoryChange(req.id, 'preferred')}
                          className="px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold text-[10px]"
                        >
                          → Preferred
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedJob(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCorrections} isLoading={isSavingCorrections}>
                Save Corrections
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteJobId)}
        onClose={() => setDeleteJobId(null)}
        onConfirm={handleDeleteJob}
        title="Delete Job Description"
        message="Are you sure you want to remove this job description from your workspace?"
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

