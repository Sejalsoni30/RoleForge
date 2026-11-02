import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { ICoverLetter, IResume, IJobDescription, CoverLetterTone } from '@roleforge/shared';
import { Mail, Plus, Trash2, Copy, Check, Sparkles } from 'lucide-react';

export const CoverLettersPage: React.FC = () => {
  const { success, error } = useToast();

  const [letters, setLetters] = useState<ICoverLetter[]>([]);
  const [resumes, setResumes] = useState<IResume[]>([]);
  const [jobs, setJobs] = useState<IJobDescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate modal
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [tone, setTone] = useState<CoverLetterTone>('modern');
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Letter View/Editor
  const [activeLetter, setActiveLetter] = useState<ICoverLetter | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Delete
  const [deleteLetterId, setDeleteLetterId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const [lettersRes, resumesRes, jobsRes] = await Promise.all([
        api.get<ICoverLetter[]>('/cover-letters'),
        api.get<IResume[]>('/resumes'),
        api.get<IJobDescription[]>('/jobs'),
      ]);

      const lList = lettersRes.data || [];
      const rList = resumesRes.data || [];
      const jList = jobsRes.data || [];

      setLetters(lList);
      setResumes(rList);
      setJobs(jList);

      if (rList[0]) setSelectedResumeId(rList[0].id);
      if (jList[0]) setSelectedJobId(jList[0].id);
      if (lList[0]) setActiveLetter(lList[0]);
    } catch (err: any) {
      error(err.message || 'Failed to load cover letters.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId || !selectedJobId) {
      error('Please select both a resume and a target job.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await api.post<ICoverLetter>('/cover-letters/generate', {
        resumeId: selectedResumeId,
        jobDescriptionId: selectedJobId,
        tone,
      });
      success('Tailored cover letter generated!');
      setIsGenerateModalOpen(false);
      setActiveLetter(res.data);
      await fetchData();
    } catch (err: any) {
      error(err.message || 'Failed to generate cover letter.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveActive = async () => {
    if (!activeLetter) return;
    setIsSaving(true);
    try {
      await api.put(`/cover-letters/${activeLetter.id}`, {
        content: activeLetter.content,
        title: activeLetter.title,
        tone: activeLetter.tone,
      });
      success('Cover letter saved!');
      await fetchData();
    } catch (err: any) {
      error(err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    if (!activeLetter) return;
    navigator.clipboard.writeText(activeLetter.content);
    setCopied(true);
    success('Copied cover letter to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!deleteLetterId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/cover-letters/${deleteLetterId}`);
      success('Cover letter deleted.');
      if (activeLetter?.id === deleteLetterId) setActiveLetter(null);
      setDeleteLetterId(null);
      await fetchData();
    } catch (err: any) {
      error(err.message || 'Failed to delete cover letter.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Cover Letter Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate role-tailored cover letters grounded in your authentic achievements.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsGenerateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Generate Cover Letter
        </Button>
      </div>

      {letters.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No Cover Letters Drafted"
          description="Create a role-specific cover letter tailored to any target job description and your uploaded resume."
          actionText="Draft First Cover Letter"
          onAction={() => setIsGenerateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Drafts ({letters.length})
            </h3>
            {letters.map((letter) => (
              <div
                key={letter.id}
                onClick={() => setActiveLetter(letter)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  activeLetter?.id === letter.id
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{letter.title}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteLetterId(letter.id);
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {letter.companyName} • {letter.tone.toUpperCase()}
                </p>
              </div>
            ))}
          </div>

          {/* Active Editor Panel */}
          {activeLetter && (
            <div className="lg:col-span-8">
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{activeLetter.title}</h3>
                    <p className="text-xs text-slate-500">{activeLetter.companyName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button size="sm" onClick={handleSaveActive} isLoading={isSaving}>
                      Save Changes
                    </Button>
                  </div>
                </div>

                <Textarea
                  value={activeLetter.content}
                  onChange={(e) => setActiveLetter({ ...activeLetter, content: e.target.value })}
                  rows={14}
                  className="font-serif leading-relaxed text-sm p-4"
                />
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Generate Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Tailored Cover Letter"
        description="Select the source resume and target role to generate a grounded letter."
        maxWidth="md"
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Resume</label>
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Job</label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} — {j.company}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Letter Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            >
              <option value="modern">Modern & Direct (Recommended)</option>
              <option value="formal">Formal & Traditional</option>
              <option value="conversational">Conversational</option>
              <option value="technical">Technical & Detail-Oriented</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => setIsGenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isGenerating} rightIcon={<Sparkles className="w-4 h-4 ml-1" />}>
              Generate Letter
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteLetterId)}
        onClose={() => setDeleteLetterId(null)}
        onConfirm={handleDelete}
        title="Delete Cover Letter"
        message="Are you sure you want to delete this cover letter?"
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

