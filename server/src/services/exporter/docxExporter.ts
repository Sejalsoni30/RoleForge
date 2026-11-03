import { Document, Paragraph, TextRun, HeadingLevel, Packer, BorderStyle } from 'docx';
import { ParsedResumeData, ResumeTemplateId } from '@roleforge/shared';

export const generateResumeDocx = async (
  resumeData: ParsedResumeData,
  templateId: ResumeTemplateId = 'ats-classic'
): Promise<Buffer> => {
  const font =
    templateId === 'executive-refined' || templateId === 'academic-standard'
      ? 'Times New Roman'
      : templateId === 'technical-compact'
      ? 'Consolas'
      : 'Calibri';

  const headingColor =
    templateId === 'modern-minimal'
      ? '4338CA'
      : templateId === 'creative-bold'
      ? '7C3AED'
      : templateId === 'technical-compact'
      ? '0F766E'
      : templateId === 'executive-refined'
      ? '0F172A'
      : '111827';

  const sections: any[] = [];

  // Name
  sections.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [
        new TextRun({
          text: resumeData.contact.fullName || 'Candidate Name',
          bold: true,
          size: 32, // 16pt
          font: 'Arial',
        }),
      ],
    })
  );

  // Contact line
  const contactParts = [
    resumeData.contact.email,
    resumeData.contact.phone,
    resumeData.contact.location,
    resumeData.contact.linkedin,
    resumeData.contact.github,
  ].filter(Boolean);

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: contactParts.join(' | '),
          size: 18,
          font: 'Arial',
          color: '555555',
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // Summary
  if (resumeData.summary) {
    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: 'PROFESSIONAL SUMMARY',
            bold: true,
            size: 22,
            font: 'Arial',
            color: '333333',
          }),
        ],
        spacing: { before: 150, after: 100 },
      })
    );
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: resumeData.summary, size: 20, font: 'Arial' })],
        spacing: { after: 200 },
      })
    );
  }

  // Skills
  const allSkills = [...resumeData.skills.technical, ...resumeData.skills.tools];
  if (allSkills.length > 0) {
    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: 'SKILLS & EXPERTISE',
            bold: true,
            size: 22,
            font: 'Arial',
            color: '333333',
          }),
        ],
        spacing: { before: 150, after: 100 },
      })
    );
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: allSkills.join(', '), size: 20, font: 'Arial' })],
        spacing: { after: 200 },
      })
    );
  }

  // Experience
  if (resumeData.experience && resumeData.experience.length > 0) {
    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: 'PROFESSIONAL EXPERIENCE',
            bold: true,
            size: 22,
            font: 'Arial',
            color: '333333',
          }),
        ],
        spacing: { before: 150, after: 100 },
      })
    );

    resumeData.experience.forEach((exp) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.position, bold: true, size: 20, font: 'Arial' }),
            new TextRun({ text: ` — ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})`, italics: true, size: 20, font: 'Arial' }),
          ],
          spacing: { before: 100, after: 60 },
        })
      );

      if (exp.highlights && exp.highlights.length > 0) {
        exp.highlights.forEach((hl) => {
          sections.push(
            new Paragraph({
              bullet: { level: 0 },
              children: [new TextRun({ text: hl, size: 19, font: 'Arial' })],
            })
          );
        });
      }
    });
  }

  // Education
  if (resumeData.education && resumeData.education.length > 0) {
    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: 'EDUCATION',
            bold: true,
            size: 22,
            font: 'Arial',
            color: '333333',
          }),
        ],
        spacing: { before: 150, after: 100 },
      })
    );

    resumeData.education.forEach((edu) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${edu.degree} in ${edu.fieldOfStudy}`, bold: true, size: 20, font: 'Arial' }),
            new TextRun({ text: ` — ${edu.institution} (${edu.startDate || ''} - ${edu.endDate || ''})`, italics: true, size: 20, font: 'Arial' }),
          ],
          spacing: { before: 60, after: 60 },
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  return await Packer.toBuffer(doc);
};
