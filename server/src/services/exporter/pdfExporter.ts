import PDFDocument from 'pdfkit';
import { ParsedResumeData, ResumeTemplateId } from '@roleforge/shared';

interface TemplateStyle {
  headingFont: string;
  bodyFont: string;
  primaryColor: string;
  subColor: string;
  nameAlign: 'left' | 'center';
  ruleColor: string;
  ruleWidth: number;
}

const TEMPLATE_STYLES: Record<string, TemplateStyle> = {
  'ats-classic': {
    headingFont: 'Helvetica-Bold',
    bodyFont: 'Helvetica',
    primaryColor: '#000000',
    subColor: '#222222',
    nameAlign: 'center',
    ruleColor: '#000000',
    ruleWidth: 1.5,
  },
  'modern-minimal': {
    headingFont: 'Helvetica-Bold',
    bodyFont: 'Helvetica',
    primaryColor: '#4f46e5',
    subColor: '#475569',
    nameAlign: 'left',
    ruleColor: '#e0e7ff',
    ruleWidth: 1,
  },
  'executive-refined': {
    headingFont: 'Times-Bold',
    bodyFont: 'Times-Roman',
    primaryColor: '#0f172a',
    subColor: '#334155',
    nameAlign: 'center',
    ruleColor: '#94a3b8',
    ruleWidth: 1,
  },
  'technical-compact': {
    headingFont: 'Helvetica-Bold',
    bodyFont: 'Helvetica',
    primaryColor: '#0f766e',
    subColor: '#334155',
    nameAlign: 'left',
    ruleColor: '#99f6e4',
    ruleWidth: 1,
  },
  'creative-bold': {
    headingFont: 'Helvetica-Bold',
    bodyFont: 'Helvetica',
    primaryColor: '#7c3aed',
    subColor: '#475569',
    nameAlign: 'left',
    ruleColor: '#c4b5fd',
    ruleWidth: 2,
  },
  'academic-standard': {
    headingFont: 'Times-Bold',
    bodyFont: 'Times-Roman',
    primaryColor: '#111827',
    subColor: '#374151',
    nameAlign: 'left',
    ruleColor: '#111827',
    ruleWidth: 1.5,
  },
  'hybrid-modern': {
    headingFont: 'Helvetica-Bold',
    bodyFont: 'Helvetica',
    primaryColor: '#2563eb',
    subColor: '#475569',
    nameAlign: 'left',
    ruleColor: '#bfdbfe',
    ruleWidth: 1,
  },
};

export const generateResumePdf = (
  resumeData: ParsedResumeData,
  templateId: ResumeTemplateId = 'ats-classic'
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const style = TEMPLATE_STYLES[templateId] || TEMPLATE_STYLES['ats-classic'];
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header: Candidate Name
      doc
        .fontSize(22)
        .font(style.headingFont)
        .fillColor(style.primaryColor)
        .text(resumeData.contact.fullName || 'Candidate Name', { align: style.nameAlign });
      doc.moveDown(0.2);

      // Contact Line
      const contactParts = [
        resumeData.contact.email,
        resumeData.contact.phone,
        resumeData.contact.location,
        resumeData.contact.linkedin,
        resumeData.contact.github,
      ].filter(Boolean);

      doc
        .fontSize(9)
        .font(style.bodyFont)
        .fillColor(style.subColor)
        .text(contactParts.join('  •  '), { align: style.nameAlign });
      doc.moveDown(0.6);

      // Horizontal separator rule
      doc
        .strokeColor(style.ruleColor)
        .lineWidth(style.ruleWidth)
        .moveTo(40, doc.y)
        .lineTo(555, doc.y)
        .stroke();
      doc.moveDown(0.6);

      // Academic CV: Education first!
      if (templateId === 'academic-standard' && resumeData.education && resumeData.education.length > 0) {
        doc.fontSize(12).font(style.headingFont).fillColor(style.primaryColor).text('EDUCATION');
        doc.moveDown(0.3);
        resumeData.education.forEach((edu) => {
          doc
            .fontSize(10.5)
            .font(style.headingFont)
            .fillColor('#0f172a')
            .text(`${edu.degree} in ${edu.fieldOfStudy}`, { continued: true });
          doc
            .fontSize(9.5)
            .font(style.bodyFont)
            .fillColor(style.subColor)
            .text(`  —  ${edu.institution} (${edu.startDate || ''} – ${edu.endDate || ''})`);
          doc.moveDown(0.3);
        });
        doc.moveDown(0.5);
      }

      // Professional Summary
      if (resumeData.summary) {
        const summaryTitle =
          templateId === 'executive-refined'
            ? 'EXECUTIVE PROFILE'
            : templateId === 'academic-standard'
            ? 'RESEARCH INTERESTS & SUMMARY'
            : 'PROFESSIONAL SUMMARY';

        doc.fontSize(12).font(style.headingFont).fillColor(style.primaryColor).text(summaryTitle);
        doc.moveDown(0.2);
        doc
          .fontSize(10)
          .font(style.bodyFont)
          .fillColor('#334155')
          .text(resumeData.summary, { lineGap: 2 });
        doc.moveDown(0.8);
      }

      // Technical Skills
      const allSkills = [...resumeData.skills.technical, ...resumeData.skills.tools];
      if (allSkills.length > 0) {
        const skillsTitle =
          templateId === 'technical-compact'
            ? 'TECH STACK & CORE PROFICIENCIES'
            : templateId === 'executive-refined'
            ? 'CORE COMPETENCIES & LEADERSHIP'
            : 'SKILLS & EXPERTISE';

        doc.fontSize(12).font(style.headingFont).fillColor(style.primaryColor).text(skillsTitle);
        doc.moveDown(0.2);
        doc
          .fontSize(10)
          .font(style.bodyFont)
          .fillColor('#334155')
          .text(allSkills.join(', '), { lineGap: 2 });
        doc.moveDown(0.8);
      }

      // Professional Experience
      if (resumeData.experience && resumeData.experience.length > 0) {
        const expTitle =
          templateId === 'executive-refined'
            ? 'EXECUTIVE EXPERIENCE'
            : templateId === 'academic-standard'
            ? 'PROFESSIONAL & ACADEMIC APPOINTMENTS'
            : 'PROFESSIONAL EXPERIENCE';

        doc.fontSize(12).font(style.headingFont).fillColor(style.primaryColor).text(expTitle);
        doc.moveDown(0.4);

        resumeData.experience.forEach((exp) => {
          doc
            .fontSize(11)
            .font(style.headingFont)
            .fillColor('#0f172a')
            .text(exp.position, { continued: true });
          doc
            .fontSize(10)
            .font(style.bodyFont)
            .fillColor(style.subColor)
            .text(`  —  ${exp.company} (${exp.startDate} – ${exp.endDate || 'Present'})`);
          doc.moveDown(0.2);

          if (exp.highlights && exp.highlights.length > 0) {
            exp.highlights.forEach((hl) => {
              doc
                .fontSize(9.5)
                .font(style.bodyFont)
                .fillColor('#334155')
                .text(`•  ${hl}`, { indent: 10, lineGap: 1.5 });
            });
          } else if (exp.description) {
            doc
              .fontSize(9.5)
              .font(style.bodyFont)
              .fillColor('#334155')
              .text(exp.description, { lineGap: 1.5 });
          }
          doc.moveDown(0.5);
        });
      }

      // Education (if not already rendered above for academic-standard)
      if (templateId !== 'academic-standard' && resumeData.education && resumeData.education.length > 0) {
        doc.fontSize(12).font(style.headingFont).fillColor(style.primaryColor).text('EDUCATION');
        doc.moveDown(0.4);

        resumeData.education.forEach((edu) => {
          doc
            .fontSize(10.5)
            .font(style.headingFont)
            .fillColor('#0f172a')
            .text(`${edu.degree} in ${edu.fieldOfStudy}`, { continued: true });
          doc
            .fontSize(9.5)
            .font(style.bodyFont)
            .fillColor(style.subColor)
            .text(`  —  ${edu.institution} (${edu.startDate || ''} – ${edu.endDate || ''})`);
          doc.moveDown(0.4);
        });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
