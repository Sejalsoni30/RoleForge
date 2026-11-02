import { ParsedResumeData } from '@roleforge/shared';

export const generateResumeTxt = (resumeData: ParsedResumeData): string => {
  const parts: string[] = [];

  parts.push(resumeData.contact.fullName.toUpperCase());
  parts.push([
    resumeData.contact.email,
    resumeData.contact.phone,
    resumeData.contact.location,
    resumeData.contact.linkedin,
    resumeData.contact.github,
  ].filter(Boolean).join(' | '));
  parts.push('--------------------------------------------------\n');

  if (resumeData.summary) {
    parts.push('PROFESSIONAL SUMMARY');
    parts.push(resumeData.summary);
    parts.push('\n');
  }

  const allSkills = [...resumeData.skills.technical, ...resumeData.skills.tools];
  if (allSkills.length > 0) {
    parts.push('SKILLS & EXPERTISE');
    parts.push(allSkills.join(', '));
    parts.push('\n');
  }

  if (resumeData.experience && resumeData.experience.length > 0) {
    parts.push('PROFESSIONAL EXPERIENCE');
    resumeData.experience.forEach((exp) => {
      parts.push(`${exp.position} | ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})`);
      if (exp.highlights) {
        exp.highlights.forEach((h) => parts.push(`  * ${h}`));
      }
      parts.push('');
    });
  }

  if (resumeData.education && resumeData.education.length > 0) {
    parts.push('EDUCATION');
    resumeData.education.forEach((edu) => {
      parts.push(`${edu.degree} in ${edu.fieldOfStudy} - ${edu.institution} (${edu.startDate || ''} - ${edu.endDate || ''})`);
    });
  }

  return parts.join('\n');
};

