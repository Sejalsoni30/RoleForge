import PDFDocument from 'pdfkit';
import { ParsedResumeData } from '@roleforge/shared';

export const generateResumePdf = (resumeData: ParsedResumeData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header: Candidate Name
      doc.fontSize(22).font('Helvetica-Bold').fillColor('#1e293b').text(resumeData.contact.fullName || 'Candidate Name');
      doc.moveDown(0.2);

      // Contact Line
      const contactParts = [
        resumeData.contact.email,
        resumeData.contact.phone,
        resumeData.contact.location,
        resumeData.contact.linkedin,
        resumeData.contact.github,
      ].filter(Boolean);

      doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(contactParts.join('  •  '));
      doc.moveDown(0.8);
      doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.6);

      // Professional Summary
      if (resumeData.summary) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#4338ca').text('PROFESSIONAL SUMMARY');
        doc.moveDown(0.2);
        doc.fontSize(10).font('Helvetica').fillColor('#334155').text(resumeData.summary, { lineGap: 2 });
        doc.moveDown(0.8);
      }

      // Technical Skills
      const allSkills = [
        ...resumeData.skills.technical,
        ...resumeData.skills.tools,
      ];
      if (allSkills.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#4338ca').text('SKILLS & EXPERTISE');
        doc.moveDown(0.2);
        doc.fontSize(10).font('Helvetica').fillColor('#334155').text(allSkills.join(', '), { lineGap: 2 });
        doc.moveDown(0.8);
      }

      // Professional Experience
      if (resumeData.experience && resumeData.experience.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#4338ca').text('PROFESSIONAL EXPERIENCE');
        doc.moveDown(0.4);

        resumeData.experience.forEach((exp) => {
          doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text(exp.position, { continued: true });
          doc.fontSize(10).font('Helvetica').fillColor('#64748b').text(`  —  ${exp.company} (${exp.startDate} – ${exp.endDate || 'Present'})`);
          doc.moveDown(0.2);

          if (exp.highlights && exp.highlights.length > 0) {
            exp.highlights.forEach((hl) => {
              doc.fontSize(9.5).font('Helvetica').fillColor('#334155').text(`•  ${hl}`, { indent: 10, lineGap: 1.5 });
            });
          } else if (exp.description) {
            doc.fontSize(9.5).font('Helvetica').fillColor('#334155').text(exp.description, { lineGap: 1.5 });
          }
          doc.moveDown(0.5);
        });
      }

      // Education
      if (resumeData.education && resumeData.education.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#4338ca').text('EDUCATION');
        doc.moveDown(0.4);

        resumeData.education.forEach((edu) => {
          doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#0f172a').text(`${edu.degree} in ${edu.fieldOfStudy}`, { continued: true });
          doc.fontSize(9.5).font('Helvetica').fillColor('#64748b').text(`  —  ${edu.institution} (${edu.startDate || ''} – ${edu.endDate || ''})`);
          doc.moveDown(0.4);
        });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

