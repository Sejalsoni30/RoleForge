import { Response, NextFunction } from 'express';
import { ResumeVersion } from '../models/ResumeVersion';
import { Resume } from '../models/Resume';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';
import { evaluateATSReadability } from '../services/ats';
import { generateResumePdf, generateResumeDocx, generateResumeTxt } from '../services/exporter';
import { AuditLog } from '../models/AuditLog';

export const listVersions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { resumeId } = req.params;

    const versions = await ResumeVersion.find({
      userId: req.user!._id,
      resumeId,
    }).sort({ versionNumber: -1 });

    res.status(200).json({
      success: true,
      data: versions,
    });
  } catch (error) {
    next(error);
  }
};

export const saveVersion = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { resumeId, title, templateId, customTheme, content } = req.body;

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user!._id,
    });

    if (!resume) throw new AppError('Resume not found', 404);

    // Calculate ATS readability score
    const atsResult = evaluateATSReadability(content || resume.parsedData);

    // Count existing versions to increment version number
    const count = await ResumeVersion.countDocuments({
      userId: req.user!._id,
      resumeId,
    });

    const newVersion = await ResumeVersion.create({
      userId: req.user!._id,
      resumeId,
      versionNumber: count + 1,
      title: title || `Version ${count + 1}`,
      templateId: templateId || 'ats-classic',
      customTheme: customTheme || {
        primaryColor: '#4338CA',
        fontFamily: 'Inter',
        fontSize: 'medium',
        lineSpacing: 'normal',
      },
      content: content || resume.parsedData,
      atsReadabilityScore: atsResult.score,
      atsIssues: atsResult.issues,
    });

    // Also update current active parsed data on the primary resume
    if (content) {
      resume.parsedData = content;
      resume.version = count + 1;
      await resume.save();
    }

    await AuditLog.create({
      userId: req.user!._id,
      action: 'RESUME_VERSION_SAVED',
      entityType: 'ResumeVersion',
      entityId: newVersion.id,
    });

    res.status(201).json({
      success: true,
      data: newVersion,
    });
  } catch (error) {
    next(error);
  }
};

export const checkATSReadability = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { content } = req.body;
    if (!content) throw new AppError('Resume content is required for ATS analysis', 400);

    const result = evaluateATSReadability(content);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const exportResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { format } = req.params;
    const { resumeId, content, templateId } = req.body;

    let resumeData = content;
    if (!resumeData && resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, userId: req.user!._id });
      if (!resume) throw new AppError('Resume not found', 404);
      resumeData = resume.parsedData;
    }

    if (!resumeData) {
      throw new AppError('Resume data is required to export', 400);
    }

    const candidateName = (resumeData.contact.fullName || 'Resume').replace(/[^a-zA-Z0-9]/g, '_');

    if (format === 'pdf') {
      const pdfBuffer = await generateResumePdf(resumeData, templateId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${candidateName}_RoleForge.pdf"`);
      res.send(pdfBuffer);
      return;
    } else if (format === 'docx') {
      const docxBuffer = await generateResumeDocx(resumeData, templateId);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${candidateName}_RoleForge.docx"`);
      res.send(docxBuffer);
      return;
    } else if (format === 'txt') {
      const txtContent = generateResumeTxt(resumeData);
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${candidateName}_RoleForge.txt"`);
      res.send(txtContent);
      return;
    } else {
      throw new AppError('Invalid export format. Supported formats: pdf, docx, txt', 400);
    }
  } catch (error) {
    next(error);
  }
};

