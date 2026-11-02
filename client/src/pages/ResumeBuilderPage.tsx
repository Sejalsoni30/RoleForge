import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import {
  IResume,
  ParsedResumeData,
  ResumeTemplateId,
  ATSCheckResult,
} from '@roleforge/shared';
import {
  Download,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Save,
  Palette,
  Eye,
  Edit3,
} from 'lucide-react';

export const ResumeBuilderPage: React.FC = () => {
  const { success, error } = useToast();

  const [resumes, setResumes] = useState<IResume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [resumeData, setResumeData] = useState<ParsedResumeData | null>(null);
  const [templateId, setTemplateId] = useState<ResumeTemplateId>('ats-classic');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'ats'>('editor');

  const [atsResult, setAtsResult] = useState<ATSCheckResult | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const templates: Array<{ id: ResumeTemplateId; label: string; desc: string }> = [
    { id: 'ats-classic', label: 'ATS Classic', desc: 'Single-column, maximum parser reliability' },
    { id: 'modern-minimal', label: 'Modern Minimal', desc: 'Clean lines with subtle blue highlights' },
    { id: 'executive-refined', label: 'Executive Refined', desc: 'Formal serif headers and elegant spacing' },
    { id: 'technical-compact', label: 'Technical Compact', desc: 'High information density for software roles' },
    { id: 'creative-bold', label: 'Creative Bold', desc: 'Strong accents for design & product' },
    { id: 'academic-standard', label: 'Academic Standard', desc: 'Standard CV format for publications & research' },
    { id: 'hybrid-modern', label: 'Hybrid Modern', desc: 'Balanced visual hierarchy' },
  ];

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get<IResume[]>('/resumes');
        const list = res.data || [];
        setResumes(list);
        if (list.length > 0) {
          setSelectedResumeId(list[0].id);
          setResumeData(JSON.parse(JSON.stringify(list[0].parsedData)));
        }
      } catch (err: any) {
        error(err.message || 'Failed to load resumes');
      } finally {
        setIsLoading(false);
      }
    };
    fetchResumes();
  }, []);

  // Run ATS check whenever resumeData changes
  useEffect(() => {
    if (!resumeData) return;
    const runCheck = async () => {
      try {
        const res = await api.post<ATSCheckResult>('/builder/ats-check', { content: resumeData });
        setAtsResult(res.data);
      } catch (err) {
        console.error('ATS check failed', err);
      }
    };
    runCheck();
  }, [resumeData]);

  const handleResumeSelect = (id: string) => {
    setSelectedResumeId(id);
    const found = resumes.find((r) => r.id === id);
    if (found) {
      setResumeData(JSON.parse(JSON.stringify(found.parsedData)));
    }
  };

  const handleSaveVersion = async () => {
    if (!selectedResumeId || !resumeData) return;
    setIsSaving(true);
    try {
      await api.post('/builder/versions', {
        resumeId: selectedResumeId,
        templateId,
        content: resumeData,
      });
      success('New resume version saved successfully!');
    } catch (err: any) {
      error(err.message || 'Failed to save version.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    if (!resumeData) return;
    setIsExporting(format);
    try {
      const res = await api.post<Blob>(`/builder/export/${format}`, {
        resumeId: selectedResumeId,
        content: resumeData,
      });

      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(resumeData.contact.fullName || 'Resume').replace(/\s+/g, '_')}_RoleForge.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      success(`Downloaded ${format.toUpperCase()} successfully!`);
    } catch (err: any) {
      error(err.message || `Failed to export ${format.toUpperCase()}.`);
    } finally {
      setIsExporting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!resumeData) {
    return (
      <EmptyState
        icon={FileText}
        title="No Resumes Available"
        description="Upload or paste a resume to access the Live Builder, Template Switcher, and ATS Readability Checker."
        actionText="Upload Resume"
        onAction={() => window.location.assign('/resumes')}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar with Template Selector and Export buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Resume Builder Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Single-column ATS-safe default with 7 verifiable templates and live formatting checks.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveVersion}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Version
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('txt')}
            isLoading={isExporting === 'txt'}
          >
            TXT
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('docx')}
            isLoading={isExporting === 'docx'}
            leftIcon={<Download className="w-4 h-4" />}
          >
            DOCX
          </Button>

          <Button
            size="sm"
            onClick={() => handleExport('pdf')}
            isLoading={isExporting === 'pdf'}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export ATS PDF
          </Button>
        </div>
      </div>

      {/* Template Selection Pills */}
      <Card className="p-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-2 mr-1 flex items-center gap-1">
            <Palette className="w-3.5 h-3.5" /> Template:
          </span>
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => setTemplateId(tpl.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                templateId === tpl.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tpl.label}
            </button>
          ))}
        </div>
      </Card>

      {/* View Switcher Tabs (Mobile & Tablet) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-3">
          <select
            value={selectedResumeId}
            onChange={(e) => handleResumeSelect(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'editor' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'preview' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('ats')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all ${
              activeTab === 'ats' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            <span>ATS Checker</span>
            {atsResult && (
              <span
                className={`w-2 h-2 rounded-full ${
                  atsResult.score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            )}
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Split Screen on Large Screens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editor or ATS Panel */}
        <div className={`lg:col-span-6 space-y-6 ${activeTab === 'preview' ? 'hidden lg:block' : ''}`}>
          {activeTab === 'ats' ? (
            /* ATS Checker Panel */
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg font-display ${
                      (atsResult?.score || 0) >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {atsResult?.score || 0}%
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">ATS Readability Health</h3>
                    <p className="text-xs text-slate-500">
                      {atsResult?.isAtsSafe ? '✓ 100% Parser Compliant' : '⚠ Parser Warnings Identified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Issues List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Verification Audit Log
                </h4>

                {atsResult?.issues.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>No critical ATS parsing bottlenecks detected in this document.</span>
                  </div>
                ) : (
                  atsResult?.issues.map((iss, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded ${
                            iss.severity === 'critical'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {iss.severity}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">{iss.type}</span>
                      </div>
                      <p className="font-semibold text-slate-800">{iss.message}</p>
                      <p className="text-slate-500 text-[11px]">
                        <strong>Fix:</strong> {iss.fixRecommendation}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          ) : (
            /* Resume Editor Panel */
            <div className="space-y-5">
              {/* Contact Info */}
              <Card className="p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Full Name"
                    value={resumeData.contact.fullName}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        contact: { ...resumeData.contact, fullName: e.target.value },
                      })
                    }
                  />
                  <Input
                    label="Email"
                    value={resumeData.contact.email}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        contact: { ...resumeData.contact, email: e.target.value },
                      })
                    }
                  />
                  <Input
                    label="Phone"
                    value={resumeData.contact.phone}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        contact: { ...resumeData.contact, phone: e.target.value },
                      })
                    }
                  />
                  <Input
                    label="Location"
                    value={resumeData.contact.location}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        contact: { ...resumeData.contact, location: e.target.value },
                      })
                    }
                  />
                </div>
              </Card>

              {/* Summary */}
              <Card className="p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Professional Summary
                </h3>
                <Textarea
                  value={resumeData.summary}
                  onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      summary: e.target.value,
                    })
                  }
                  rows={4}
                />
              </Card>

              {/* Skills */}
              <Card className="p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Skills & Tools
                </h3>
                <Input
                  label="Technical Skills (comma-separated)"
                  value={resumeData.skills.technical.join(', ')}
                  onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      skills: {
                        ...resumeData.skills,
                        technical: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      },
                    })
                  }
                />
              </Card>

              {/* Experience list */}
              <Card className="p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Professional Experience
                </h3>
                {resumeData.experience.map((exp, idx) => (
                  <div key={exp.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Position"
                        value={exp.position}
                        onChange={(e) => {
                          const updated = [...resumeData.experience];
                          updated[idx].position = e.target.value;
                          setResumeData({ ...resumeData, experience: updated });
                        }}
                      />
                      <Input
                        label="Company"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...resumeData.experience];
                          updated[idx].company = e.target.value;
                          setResumeData({ ...resumeData, experience: updated });
                        }}
                      />
                    </div>
                    <Textarea
                      label="Key Achievements & Bullet Points"
                      value={exp.highlights.join('\n')}
                      onChange={(e) => {
                        const updated = [...resumeData.experience];
                        updated[idx].highlights = e.target.value.split('\n').filter(Boolean);
                        setResumeData({ ...resumeData, experience: updated });
                      }}
                      rows={3}
                    />
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>

        {/* Right Column: High-Fidelity Live Preview */}
        <div className={`lg:col-span-6 ${activeTab === 'editor' && !window.matchMedia('(min-width: 1024px)').matches ? 'hidden' : 'block'}`}>
          <div className="sticky top-6">
            <Card className="p-8 bg-white border border-slate-300 shadow-elevated rounded-2xl min-h-[650px] font-sans text-slate-800">
              {/* Rendered Template Output */}
              <div className="space-y-5">
                {/* Header */}
                <div className={`border-b pb-4 ${templateId === 'modern-minimal' ? 'border-indigo-200' : 'border-slate-300'}`}>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    {resumeData.contact.fullName || 'Candidate Name'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {[
                      resumeData.contact.email,
                      resumeData.contact.phone,
                      resumeData.contact.location,
                      resumeData.contact.linkedin,
                    ]
                      .filter(Boolean)
                      .join('  •  ')}
                  </p>
                </div>

                {/* Summary */}
                {resumeData.summary && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">
                      Professional Summary
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">{resumeData.summary}</p>
                  </div>
                )}

                {/* Skills */}
                {resumeData.skills.technical.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">
                      Technical Competencies
                    </h4>
                    <p className="text-xs text-slate-700 font-mono">
                      {resumeData.skills.technical.join(', ')}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {resumeData.experience.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2">
                      Professional Experience
                    </h4>
                    <div className="space-y-3">
                      {resumeData.experience.map((exp) => (
                        <div key={exp.id} className="text-xs">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-slate-900">{exp.position}</span>
                            <span className="text-[11px] text-slate-500">
                              {exp.startDate} – {exp.endDate || 'Present'}
                            </span>
                          </div>
                          <p className="text-slate-600 italic mb-1">{exp.company}</p>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            {exp.highlights.map((hl, i) => (
                              <li key={i} className="leading-relaxed">
                                {hl}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resumeData.education.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">
                      Education
                    </h4>
                    {resumeData.education.map((edu) => (
                      <div key={edu.id} className="text-xs flex justify-between items-baseline">
                        <span className="font-bold text-slate-800">
                          {edu.degree} in {edu.fieldOfStudy}
                        </span>
                        <span className="text-slate-500">{edu.institution}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

