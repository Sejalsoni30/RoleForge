import React from 'react';
import { ParsedResumeData, ResumeTemplateId } from '@roleforge/shared';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Terminal,
  Sparkles,
} from 'lucide-react';

interface ResumeTemplateViewProps {
  templateId: ResumeTemplateId;
  data: ParsedResumeData;
}

export const ResumeTemplateView: React.FC<ResumeTemplateViewProps> = ({ templateId, data }) => {
  const { contact, summary, skills, experience, education, certifications, customSections } = data;

  const contactItems = [
    contact.email && { icon: Mail, text: contact.email, href: `mailto:${contact.email}` },
    contact.phone && { icon: Phone, text: contact.phone, href: `tel:${contact.phone}` },
    contact.location && { icon: MapPin, text: contact.location },
    contact.linkedin && { icon: Linkedin, text: contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, 'linkedin/'), href: contact.linkedin },
    contact.github && { icon: Github, text: contact.github.replace(/^https?:\/\/(www\.)?github\.com\//, 'github/'), href: contact.github },
    contact.website && { icon: Globe, text: contact.website.replace(/^https?:\/\//, ''), href: contact.website },
  ].filter(Boolean) as Array<{ icon: any; text: string; href?: string }>;

  /* --------------------------------------------------------------------------
     1. ATS CLASSIC
     Single-column, high contrast, pure black/white, standard underline rules
     -------------------------------------------------------------------------- */
  if (templateId === 'ats-classic') {
    return (
      <div className="font-sans text-black leading-relaxed space-y-4 p-2 bg-white selection:bg-slate-200">
        {/* Header */}
        <div className="text-center pb-2 border-b-2 border-black">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-black">
            {contact.fullName || 'Candidate Name'}
          </h1>
          <div className="flex flex-wrap justify-center items-center gap-x-2 text-xs text-black mt-1.5 font-normal">
            {contactItems.map((c, i) => (
              <React.Fragment key={i}>
                <span>{c.text}</span>
                {i < contactItems.length - 1 && <span className="font-bold">•</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 mb-1.5">
              Professional Summary
            </h2>
            <p className="text-xs text-black leading-normal text-justify">{summary}</p>
          </div>
        )}

        {/* Skills */}
        {(skills.technical.length > 0 || skills.tools.length > 0 || skills.soft.length > 0) && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 mb-1.5">
              Skills & Expertise
            </h2>
            <div className="text-xs space-y-1 text-black">
              {skills.technical.length > 0 && (
                <p>
                  <strong className="font-semibold">Technical: </strong>
                  {skills.technical.join(', ')}
                </p>
              )}
              {skills.tools.length > 0 && (
                <p>
                  <strong className="font-semibold">Tools & Frameworks: </strong>
                  {skills.tools.join(', ')}
                </p>
              )}
              {skills.soft.length > 0 && (
                <p>
                  <strong className="font-semibold">Core Competencies: </strong>
                  {skills.soft.join(', ')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 mb-2">
              Professional Experience
            </h2>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} className="text-xs">
                  <div className="flex justify-between items-baseline font-bold text-black">
                    <span>{exp.position}</span>
                    <span className="text-[11px] font-normal">
                      {exp.startDate} – {exp.endDate || 'Present'}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-[11px] italic text-neutral-800 mb-1">
                    <span>{exp.company}</span>
                    {exp.location && <span>{exp.location}</span>}
                  </div>
                  {exp.highlights && exp.highlights.length > 0 ? (
                    <ul className="list-disc list-outside pl-4 space-y-1 text-black">
                      {exp.highlights.map((hl, i) => (
                        <li key={i} className="leading-snug">
                          {hl}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    exp.description && <p className="leading-snug">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 mb-1.5">
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="text-xs flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-black">{edu.degree} in {edu.fieldOfStudy}</span>
                    <span className="text-neutral-700"> — {edu.institution}</span>
                  </div>
                  <span className="text-[11px] text-neutral-600">
                    {edu.startDate ? `${edu.startDate} – ` : ''}{edu.endDate || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 mb-1.5">
              Certifications
            </h2>
            <ul className="list-disc list-outside pl-4 text-xs space-y-0.5">
              {certifications.map((c) => (
                <li key={c.id}>
                  <strong>{c.name}</strong> — {c.issuer} {c.issueDate && `(${c.issueDate})`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  /* --------------------------------------------------------------------------
     2. MODERN MINIMAL
     Sleek contemporary look, cool slate, indigo headings, pill skills
     -------------------------------------------------------------------------- */
  if (templateId === 'modern-minimal') {
    return (
      <div className="font-sans text-slate-800 space-y-5 p-2 bg-white">
        {/* Header */}
        <div className="border-b border-indigo-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {contact.fullName || 'Candidate Name'}
              </h1>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mt-0.5">
                {experience[0]?.position || 'Professional Resume'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              {contactItems.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                  <c.icon className="w-3 h-3 text-indigo-500" />
                  <span>{c.text}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              Summary
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed pl-3 border-l-2 border-indigo-200">{summary}</p>
          </div>
        )}

        {/* Skills */}
        {(skills.technical.length > 0 || skills.tools.length > 0) && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              Skills & Tech Stack
            </h3>
            <div className="flex flex-wrap gap-1.5 pl-3">
              {[...skills.technical, ...skills.tools].map((sk, i) => (
                <span key={i} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-indigo-50/70 text-indigo-900 border border-indigo-100">
                  {sk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              Work Experience
            </h3>
            <div className="space-y-4 pl-3 border-l border-slate-200 ml-1">
              {experience.map((exp) => (
                <div key={exp.id} className="relative pl-3">
                  <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-4 ring-white" />
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-xs text-slate-900">{exp.position}</span>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {exp.startDate} – {exp.endDate || 'Present'}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-600 font-medium mb-1.5">{exp.company}</p>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="space-y-1 text-xs text-slate-600">
                      {exp.highlights.map((hl, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-indigo-400 mt-0.5">›</span>
                          <span className="leading-relaxed">{hl}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              Education
            </h3>
            <div className="space-y-2 pl-3">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</span>
                    <span className="text-slate-500"> — {edu.institution}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{edu.endDate || ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* --------------------------------------------------------------------------
     3. EXECUTIVE REFINED
     Stately serif typography, centered elegant rules, navy accents, prestige feel
     -------------------------------------------------------------------------- */
  if (templateId === 'executive-refined') {
    return (
      <div className="font-serif text-slate-900 space-y-5 p-4 bg-white selection:bg-amber-100">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif font-bold tracking-widest text-slate-900 uppercase">
            {contact.fullName || 'Candidate Name'}
          </h1>
          <p className="text-xs tracking-wider uppercase text-slate-500 font-sans font-medium">
            Executive Leadership & Strategic Management
          </p>

          <div className="border-y-2 border-slate-300 py-2 mt-3 flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-sans">
            {contactItems.map((c, i) => (
              <React.Fragment key={i}>
                <span className="inline-flex items-center gap-1">
                  <c.icon className="w-3 h-3 text-slate-600" />
                  <span>{c.text}</span>
                </span>
                {i < contactItems.length - 1 && <span className="text-slate-300">◆</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div>
            <div className="flex items-center gap-3 my-2 text-center">
              <div className="h-px bg-slate-300 flex-1" />
              <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-slate-800 px-2">
                Executive Profile
              </h2>
              <div className="h-px bg-slate-300 flex-1" />
            </div>
            <p className="text-xs font-serif text-slate-800 leading-relaxed text-justify px-3 italic">
              "{summary}"
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <div className="flex items-center gap-3 my-3 text-center">
              <div className="h-px bg-slate-300 flex-1" />
              <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-slate-800 px-2">
                Executive Experience
              </h2>
              <div className="h-px bg-slate-300 flex-1" />
            </div>

            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="text-xs">
                  <div className="flex justify-between items-baseline font-serif">
                    <span className="font-bold text-sm text-slate-900 tracking-wide">{exp.position}</span>
                    <span className="text-xs font-sans text-slate-500 uppercase tracking-wider">
                      {exp.startDate} – {exp.endDate || 'Present'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs italic text-slate-700 mb-1.5">
                    <span>{exp.company}</span>
                    {exp.location && <span>{exp.location}</span>}
                  </div>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside pl-4 space-y-1 font-serif text-slate-800">
                      {exp.highlights.map((hl, i) => (
                        <li key={i} className="leading-relaxed">
                          {hl}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Competencies & Skills */}
        {(skills.technical.length > 0 || skills.soft.length > 0) && (
          <div>
            <div className="flex items-center gap-3 my-3 text-center">
              <div className="h-px bg-slate-300 flex-1" />
              <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-slate-800 px-2">
                Leadership Competencies & Expertise
              </h2>
              <div className="h-px bg-slate-300 flex-1" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-serif text-slate-800 px-2">
              {skills.soft.length > 0 && (
                <div>
                  <h4 className="font-sans font-bold text-[11px] text-slate-500 uppercase mb-1">Leadership Capabilities</h4>
                  <p className="leading-snug">{skills.soft.join(' • ')}</p>
                </div>
              )}
              {skills.technical.length > 0 && (
                <div>
                  <h4 className="font-sans font-bold text-[11px] text-slate-500 uppercase mb-1">Strategic Technologies</h4>
                  <p className="leading-snug">{skills.technical.join(' • ')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <div className="flex items-center gap-3 my-3 text-center">
              <div className="h-px bg-slate-300 flex-1" />
              <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-slate-800 px-2">
                Academic Background
              </h2>
              <div className="h-px bg-slate-300 flex-1" />
            </div>
            <div className="space-y-1.5">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline text-xs font-serif">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</span>
                    <span className="text-slate-600">, {edu.institution}</span>
                  </div>
                  <span className="text-[11px] font-sans text-slate-500">{edu.endDate || ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* --------------------------------------------------------------------------
     4. TECHNICAL COMPACT
     High density, monospace skill chips, terminal accents, software engineer focus
     -------------------------------------------------------------------------- */
  if (templateId === 'technical-compact') {
    return (
      <div className="font-sans text-slate-900 space-y-3.5 p-2 bg-white text-xs">
        {/* Terminal Header */}
        <div className="bg-slate-900 text-white p-3.5 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-mono text-slate-400 ml-2">resume.sh</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              BUILD: PASSING
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pt-1">
            <h1 className="text-xl font-bold font-mono tracking-tight text-white">
              {contact.fullName || 'Candidate Name'}
            </h1>
            <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-300">
              {contactItems.map((c, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span>{c.text}</span>
                  {i < contactItems.length - 1 && <span className="text-slate-600">|</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Stack Chips */}
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-700 uppercase mb-1">
            <Terminal className="w-3.5 h-3.5 text-emerald-600" />
            <span>// Tech Stack & Tooling</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
            {skills.technical.length > 0 && (
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-mono font-bold text-slate-500 block mb-0.5">LANGUAGES & FRAMEWORKS:</span>
                <div className="flex flex-wrap gap-1">
                  {skills.technical.map((t, idx) => (
                    <span key={idx} className="bg-white border border-slate-300 px-1.5 py-0.5 rounded font-mono text-slate-800">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {skills.tools.length > 0 && (
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-mono font-bold text-slate-500 block mb-0.5">PLATFORMS & TOOLS:</span>
                <div className="flex flex-wrap gap-1">
                  {skills.tools.map((t, idx) => (
                    <span key={idx} className="bg-white border border-slate-300 px-1.5 py-0.5 rounded font-mono text-slate-800">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-700 uppercase mb-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
              <span>// Professional Experience</span>
            </div>
            <div className="space-y-2.5">
              {experience.map((exp) => (
                <div key={exp.id} className="p-2.5 border border-slate-200 rounded-lg bg-white">
                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <div>
                      <strong className="text-slate-900">{exp.position}</strong>
                      <span className="text-indigo-600"> @ {exp.company}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      [{exp.startDate} – {exp.endDate || 'Present'}]
                    </span>
                  </div>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside pl-4 mt-1.5 space-y-0.5 text-slate-700 text-[11px]">
                      {exp.highlights.map((hl, i) => (
                        <li key={i} className="leading-snug">
                          {hl}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-700 uppercase mb-1">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>// Education & Credentials</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {education.map((edu) => (
                <div key={edu.id} className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex-1 min-w-[200px] text-[11px]">
                  <strong className="block text-slate-900">{edu.degree} in {edu.fieldOfStudy}</strong>
                  <span className="text-slate-500 font-mono">{edu.institution} ({edu.endDate || ''})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* --------------------------------------------------------------------------
     5. CREATIVE BOLD
     Vibrant gradient banner header, colorful section tags, design & product focus
     -------------------------------------------------------------------------- */
  if (templateId === 'creative-bold') {
    return (
      <div className="font-sans text-slate-800 space-y-4 p-1 bg-white">
        {/* Vibrant Gradient Banner */}
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white p-5 rounded-2xl shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full mb-1">
                <Sparkles className="w-3 h-3 text-amber-300" /> Product & Creative Leader
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {contact.fullName || 'Candidate Name'}
              </h1>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs text-white/90">
              {contactItems.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm">
                  <c.icon className="w-3 h-3 text-white" />
                  <span>{c.text}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        {summary && (
          <div className="p-3.5 bg-violet-50/50 border border-violet-100 rounded-xl">
            <h3 className="text-xs font-black uppercase tracking-wider text-violet-700 mb-1">
              About Me & Mission
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">{summary}</p>
          </div>
        )}

        {/* Skills Pills */}
        {(skills.technical.length > 0 || skills.soft.length > 0) && (
          <div>
            <span className="inline-block text-xs font-black uppercase tracking-wider bg-violet-100 text-violet-800 px-2.5 py-1 rounded-lg mb-2">
              Capabilities & Superpowers
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[...skills.technical, ...skills.soft].map((sk, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 text-violet-900 shadow-2xs"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <span className="inline-block text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-lg mb-2.5">
              Selected Impact & Experience
            </span>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} className="p-3.5 rounded-xl border-l-4 border-indigo-500 bg-slate-50/60 border border-slate-200">
                  <div className="flex justify-between items-baseline">
                    <span className="font-extrabold text-sm text-slate-900">{exp.position}</span>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {exp.startDate} – {exp.endDate || 'Present'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">{exp.company}</p>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="space-y-1 text-xs text-slate-700 mt-2">
                      {exp.highlights.map((hl, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-violet-500 font-bold">★</span>
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <span className="inline-block text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg mb-2">
              Education
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {education.map((edu) => (
                <div key={edu.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <strong className="block text-slate-900">{edu.degree} in {edu.fieldOfStudy}</strong>
                  <span className="text-slate-500">{edu.institution}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* --------------------------------------------------------------------------
     6. ACADEMIC STANDARD
     Traditional Curriculum Vitae, formal academic serif, Education first
     -------------------------------------------------------------------------- */
  if (templateId === 'academic-standard') {
    return (
      <div className="font-serif text-slate-900 space-y-4 p-3 bg-white text-xs">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-2">
          <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-normal">
            {contact.fullName || 'Candidate Name'}
          </h1>
          <p className="text-[11px] text-slate-700 mt-1 font-sans">
            {[
              contact.email,
              contact.phone,
              contact.location,
              contact.website || contact.linkedin,
            ]
              .filter(Boolean)
              .join('  |  ')}
          </p>
        </div>

        {/* Education First (Academic CV Rule) */}
        {education.length > 0 && (
          <div>
            <h2 className="text-xs font-serif font-bold uppercase tracking-wider border-b border-slate-800 pb-0.5 mb-2">
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline font-serif">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</span>
                    <span className="text-slate-700">, {edu.institution}</span>
                  </div>
                  <span className="text-[11px] text-slate-600 font-sans">
                    {edu.startDate ? `${edu.startDate} – ` : ''}{edu.endDate || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professional & Research Experience */}
        {experience.length > 0 && (
          <div>
            <h2 className="text-xs font-serif font-bold uppercase tracking-wider border-b border-slate-800 pb-0.5 mb-2">
              Academic & Professional Appointments
            </h2>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} className="font-serif">
                  <div className="flex justify-between items-baseline font-bold">
                    <span className="text-slate-900">{exp.position}</span>
                    <span className="text-[11px] font-normal font-sans text-slate-600">
                      {exp.startDate} – {exp.endDate || 'Present'}
                    </span>
                  </div>
                  <p className="italic text-slate-700 text-[11px] mb-1">{exp.company}, {exp.location}</p>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside pl-4 space-y-0.5 text-slate-800">
                      {exp.highlights.map((hl, i) => (
                        <li key={i} className="leading-relaxed">
                          {hl}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Research Interests / Summary */}
        {summary && (
          <div>
            <h2 className="text-xs font-serif font-bold uppercase tracking-wider border-b border-slate-800 pb-0.5 mb-1.5">
              Research Interests & Summary
            </h2>
            <p className="text-slate-800 leading-relaxed text-justify">{summary}</p>
          </div>
        )}

        {/* Certifications & Honors */}
        {certifications && certifications.length > 0 && (
          <div>
            <h2 className="text-xs font-serif font-bold uppercase tracking-wider border-b border-slate-800 pb-0.5 mb-1.5">
              Honors, Awards & Certifications
            </h2>
            <ul className="list-disc list-outside pl-4 space-y-0.5">
              {certifications.map((c) => (
                <li key={c.id}>
                  <strong>{c.name}</strong>, {c.issuer} {c.issueDate && `(${c.issueDate})`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  /* --------------------------------------------------------------------------
     7. HYBRID MODERN (2-COLUMN SPLIT)
     Sidebar with contact, skills & education; main column with summary & experience
     -------------------------------------------------------------------------- */
  return (
    <div className="font-sans text-slate-800 bg-white grid grid-cols-1 md:grid-cols-12 gap-4 rounded-xl">
      {/* Left Column (Sidebar) */}
      <div className="md:col-span-4 bg-slate-50/90 p-4 border-r border-slate-200 rounded-l-xl space-y-4 text-xs">
        {/* Name in Sidebar for Mobile */}
        <div className="md:hidden">
          <h1 className="text-xl font-bold text-slate-900">{contact.fullName}</h1>
          <div className="h-0.5 w-10 bg-indigo-600 my-1" />
        </div>

        {/* Contact info */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Contact Details
          </h3>
          <div className="space-y-1.5 text-xs text-slate-700">
            {contactItems.map((c, i) => (
              <div key={i} className="flex items-center gap-2 truncate">
                <c.icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">{c.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        {skills.technical.length > 0 && (
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Technical Proficiencies
            </h3>
            <div className="flex flex-wrap gap-1">
              {skills.technical.map((sk, i) => (
                <span key={i} className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-800 px-2 py-0.5 rounded-md">
                  {sk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tools */}
        {skills.tools.length > 0 && (
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Tools & Environment
            </h3>
            <p className="text-[11px] text-slate-600 leading-snug">{skills.tools.join(', ')}</p>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Education
            </h3>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="text-[11px]">
                  <strong className="block text-slate-900">{edu.degree}</strong>
                  <span className="text-slate-600">{edu.institution}</span>
                  <span className="block text-[10px] text-slate-400">{edu.endDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column (Main Experience & Story) */}
      <div className="md:col-span-8 p-4 space-y-4 text-xs">
        {/* Header (Desktop) */}
        <div className="hidden md:block border-b border-slate-200 pb-3">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {contact.fullName || 'Candidate Name'}
          </h1>
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mt-0.5">
            {experience[0]?.position || 'Professional Summary'}
          </p>
        </div>

        {/* Summary */}
        {summary && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
              Executive Profile
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Experience Timeline */}
        {experience.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5">
              Experience History
            </h2>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} className="text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">{exp.position}</span>
                    <span className="text-[11px] text-indigo-600 font-medium">
                      {exp.startDate} – {exp.endDate || 'Present'}
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium mb-1">{exp.company}</p>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside pl-4 space-y-1 text-slate-600">
                      {exp.highlights.map((hl, i) => (
                        <li key={i} className="leading-relaxed">
                          {hl}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

