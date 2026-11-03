import React, { useEffect, useState, useRef } from 'react';
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
import { IResume, ParsedResumeData } from '@roleforge/shared';
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Clock,
  Sparkles,
} from 'lucide-react';

export const ResumesPage: React.FC = () => {
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resumes, setResumes] = useState<IResume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Text Paste Modal
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [isPasting, setIsPasting] = useState(false);

  // Edit Parsed Data Modal
  const [selectedResume, setSelectedResume] = useState<IResume | null>(null);
  const [editingParsedData, setEditingParsedData] = useState<ParsedResumeData | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Confirm
  const [deleteResumeId, setDeleteResumeId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchResumes = async () => {
    try {
      const res = await api.get<IResume[]>('/resumes');
      setResumes(res.data || []);
    } catch (err: any) {
      error(err.message || 'Failed to fetch resumes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validExtensions = ['.pdf', '.docx', '.doc'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      error('Invalid file format. Please upload a PDF or DOCX file.');
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      error('File is too large. Maximum size is 10MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

    setIsUploading(true);
    try {
      const res = await api.post<IResume>('/resumes/upload', formData);
      success(`Resume "${res.data.title}" parsed and saved successfully!`);
      await fetchResumes();
    } catch (err: any) {
      error(err.message || 'Upload & parsing failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) return;

    setIsPasting(true);
    try {
      const res = await api.post<IResume>('/resumes/text', {
        title: pastedTitle || 'Pasted Resume',
        text: pastedText,
      });
      success(`Resume "${res.data.title}" compiled successfully!`);
      setIsPasteModalOpen(false);
      setPastedTitle('');
      setPastedText('');
      await fetchResumes();
    } catch (err: any) {
      error(err.message || 'Failed to parse resume text.');
    } finally {
      setIsPasting(false);
    }
  };

  const openEditModal = (resume: IResume) => {
    setSelectedResume(resume);
    setEditingParsedData(JSON.parse(JSON.stringify(resume.parsedData)));
  };

  const handleSaveEdit = async () => {
    if (!selectedResume || !editingParsedData) return;
    const resumeId = selectedResume.id || (selectedResume as any)._id;
    if (!resumeId) return;

    setIsSavingEdit(true);
    try {
      await api.put(`/resumes/${resumeId}`, {
        title: selectedResume.title,
        parsedData: editingParsedData,
      });
      success('Parsed resume data updated and version incremented.');
      setSelectedResume(null);
      setEditingParsedData(null);
      await fetchResumes();
    } catch (err: any) {
      error(err.message || 'Failed to update resume.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteResumeId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/resumes/${deleteResumeId}`);
      success('Resume deleted successfully.');
      setDeleteResumeId(null);
      await fetchResumes();
    } catch (err: any) {
      error(err.message || 'Failed to delete resume.');
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
            My Resumes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload PDF/DOCX or paste resume text. Originals remain untouched; extracted data is editable.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.doc"
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPasteModalOpen(true)}
            leftIcon={<FileCode className="w-4 h-4" />}
          >
            Paste Text
          </Button>
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            isLoading={isUploading}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Upload Document (PDF/DOCX)
          </Button>
        </div>
      </div>

      {/* Upload Drag & Drop Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-8 border-2 border-dashed border-indigo-200/80 hover:border-indigo-400 bg-white/60 hover:bg-indigo-50/20 rounded-2xl text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center shadow-sm"
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">
          Drop your resume here, or <span className="text-indigo-600 underline">browse files</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Supports PDF, Word (.docx) up to 10MB. Native text extraction with automated OCR fallback for scanned pages.
        </p>
      </div>

      {/* Resume List */}
      {resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Resumes Uploaded Yet"
          description="Upload your resume to begin extracting structured experience, education, and technical competencies."
          actionText="Upload PDF or DOCX"
          onAction={() => fileInputRef.current?.click()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {resumes.map((resume) => (
            <Card key={resume.id} variant="default" className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{resume.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        {resume.fileType?.toUpperCase() || 'TXT'} • Version {resume.version}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Ready
                  </span>
                </div>

                {/* Candidate contact preview */}
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1">
                  <p className="font-semibold text-slate-800 truncate">
                    {resume.parsedData.contact.fullName || 'Candidate Name'}
                  </p>
                  <p className="text-slate-500 truncate">
                    {resume.parsedData.contact.email || 'No email detected'} • {resume.parsedData.contact.phone || 'No phone'}
                  </p>
                </div>

                {/* Skills tags preview */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {resume.parsedData.skills.technical.slice(0, 5).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                  {resume.parsedData.skills.technical.length > 5 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{resume.parsedData.skills.technical.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {new Date(resume.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(resume)}
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit Extracted Data
                  </Button>
                  <button
                    onClick={() => setDeleteResumeId(resume.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Paste Resume Modal */}
      <Modal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        title="Paste Resume Text"
        description="Paste your resume content directly into RoleForge to compile structured metadata."
        maxWidth="lg"
      >
        <form onSubmit={handlePasteSubmit} className="space-y-4">
          <Input
            label="Resume Title"
            placeholder="e.g. Lead Engineer Resume 2025"
            value={pastedTitle}
            onChange={(e) => setPastedTitle(e.target.value)}
            required
          />
          <Textarea
            label="Resume Content"
            placeholder="Paste complete resume text including experience, education, and skills..."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={10}
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsPasteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPasting} rightIcon={<Sparkles className="w-4 h-4" />}>
              Parse & Compile Text
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Extracted Data Modal */}
      {selectedResume && editingParsedData && (
        <Modal
          isOpen={Boolean(selectedResume)}
          onClose={() => setSelectedResume(null)}
          title={`Edit Extracted Data (${selectedResume.title})`}
          description="Adjust extracted fields. The original uploaded document is never modified."
          maxWidth="2xl"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Full Name"
                value={editingParsedData.contact.fullName}
                onChange={(e) =>
                  setEditingParsedData({
                    ...editingParsedData,
                    contact: { ...editingParsedData.contact, fullName: e.target.value },
                  })
                }
              />
              <Input
                label="Email"
                value={editingParsedData.contact.email}
                onChange={(e) =>
                  setEditingParsedData({
                    ...editingParsedData,
                    contact: { ...editingParsedData.contact, email: e.target.value },
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone"
                value={editingParsedData.contact.phone}
                onChange={(e) =>
                  setEditingParsedData({
                    ...editingParsedData,
                    contact: { ...editingParsedData.contact, phone: e.target.value },
                  })
                }
              />
              <Input
                label="Location"
                value={editingParsedData.contact.location}
                onChange={(e) =>
                  setEditingParsedData({
                    ...editingParsedData,
                    contact: { ...editingParsedData.contact, location: e.target.value },
                  })
                }
              />
            </div>

            <Textarea
              label="Professional Summary"
              value={editingParsedData.summary}
              onChange={(e) =>
                setEditingParsedData({
                  ...editingParsedData,
                  summary: e.target.value,
                })
              }
              rows={3}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Technical Skills (comma-separated)
              </label>
              <Input
                value={editingParsedData.skills.technical.join(', ')}
                onChange={(e) =>
                  setEditingParsedData({
                    ...editingParsedData,
                    skills: {
                      ...editingParsedData.skills,
                      technical: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    },
                  })
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedResume(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} isLoading={isSavingEdit}>
                Save Updates (Increment Version)
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteResumeId)}
        onClose={() => setDeleteResumeId(null)}
        onConfirm={handleDelete}
        title="Delete Resume"
        message="Are you sure you want to remove this resume from your workspace? Associated versions will also be deleted."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

