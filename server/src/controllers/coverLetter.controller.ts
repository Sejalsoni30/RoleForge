import { Response, NextFunction } from 'express';
import { CoverLetter } from '../models/CoverLetter';
import { Resume } from '../models/Resume';
import { JobDescription } from '../models/JobDescription';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';
import { getAIService } from '../services/ai';
import { AuditLog } from '../models/AuditLog';

export const listCoverLetters = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const letters = await CoverLetter.find({ userId: req.user!._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: letters,
    });
  } catch (error) {
    next(error);
  }
};

export const generateCoverLetter = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { resumeId, jobDescriptionId, tone } = req.body;

    const [resume, job] = await Promise.all([
      Resume.findOne({ _id: resumeId, userId: req.user!._id }),
      JobDescription.findOne({ _id: jobDescriptionId, userId: req.user!._id }),
    ]);

    if (!resume) throw new AppError('Resume not found', 404);
    if (!job) throw new AppError('Job description not found', 404);

    const aiService = getAIService();
    const result = await aiService.generateCoverLetter(
      resume.parsedData,
      job.parsedRequirements,
      tone || 'modern'
    );

    const title = `Cover Letter - ${job.company} (${job.title})`;

    const letter = await CoverLetter.create({
      userId: req.user!._id,
      resumeId,
      jobDescriptionId,
      title,
      companyName: job.company,
      content: result.content,
      tone: tone || 'modern',
      highlightedSkills: result.highlightedSkills,
      status: 'draft',
    });

    await AuditLog.create({
      userId: req.user!._id,
      action: 'COVER_LETTER_GENERATED',
      entityType: 'CoverLetter',
      entityId: letter.id,
    });

    res.status(201).json({
      success: true,
      data: letter,
    });
  } catch (error) {
    next(error);
  }
};

export const getCoverLetter = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const letter = await CoverLetter.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!letter) throw new AppError('Cover letter not found', 404);

    res.status(200).json({
      success: true,
      data: letter,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoverLetter = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const letter = await CoverLetter.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!letter) throw new AppError('Cover letter not found', 404);

    if (req.body.content) letter.content = req.body.content;
    if (req.body.title) letter.title = req.body.title;
    if (req.body.tone) letter.tone = req.body.tone;
    if (req.body.status) letter.status = req.body.status;

    await letter.save();

    res.status(200).json({
      success: true,
      data: letter,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoverLetter = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const letter = await CoverLetter.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!letter) throw new AppError('Cover letter not found', 404);

    res.status(200).json({
      success: true,
      message: 'Cover letter deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

