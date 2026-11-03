import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import { Optimization } from '../models/Optimization';
import { Resume } from '../models/Resume';
import { JobDescription } from '../models/JobDescription';
import { MatchAnalysis } from '../models/MatchAnalysis';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';
import { getAIService } from '../services/ai';
import { AuditLog } from '../models/AuditLog';

const isValidObjectId = (id: unknown): boolean =>
  typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);

const formatOptimization = (opt: any) => {
  if (!opt) return null;
  const optId = opt._id?.toString() || opt.id;
  return {
    id: optId,
    _id: optId,
    userId: opt.userId?.toString(),
    resumeId: opt.resumeId?.toString(),
    jobDescriptionId: opt.jobDescriptionId?.toString(),
    suggestions: opt.suggestions,
    status: opt.status,
    createdAt: opt.createdAt instanceof Date ? opt.createdAt.toISOString() : opt.createdAt,
    updatedAt: opt.updatedAt instanceof Date ? opt.updatedAt.toISOString() : opt.updatedAt,
  };
};

export const getOptimizations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { resumeId, jobId } = req.params;

    if (
      !resumeId ||
      !jobId ||
      resumeId === 'undefined' ||
      jobId === 'undefined' ||
      !isValidObjectId(resumeId) ||
      !isValidObjectId(jobId)
    ) {
      res.status(200).json({ success: true, data: null });
      return;
    }

    const opt = await Optimization.findOne({
      userId: req.user!._id,
      resumeId,
      jobDescriptionId: jobId,
    });

    res.status(200).json({
      success: true,
      data: formatOptimization(opt),
    });
  } catch (error) {
    next(error);
  }
};

export const generateOptimizations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { resumeId, jobDescriptionId } = req.body;

    const [resume, job, match] = await Promise.all([
      Resume.findOne({ _id: resumeId, userId: req.user!._id, isArchived: false }),
      JobDescription.findOne({ _id: jobDescriptionId, userId: req.user!._id }),
      MatchAnalysis.findOne({ resumeId, jobDescriptionId, userId: req.user!._id }),
    ]);

    if (!resume) throw new AppError('Resume not found', 404);
    if (!job) throw new AppError('Job description not found', 404);

    const aiService = getAIService();
    const suggestions = await aiService.generateOptimizations(
      resume.parsedData,
      job.parsedRequirements,
      match?.evidenceLinks || []
    );

    let opt = await Optimization.findOne({
      userId: req.user!._id,
      resumeId,
      jobDescriptionId,
    });

    if (opt) {
      // Keep statuses of existing suggestions if matching IDs exist
      opt.suggestions = suggestions;
      await opt.save();
    } else {
      opt = await Optimization.create({
        userId: req.user!._id,
        resumeId,
        jobDescriptionId,
        suggestions,
        status: 'draft',
      });
    }

    await AuditLog.create({
      userId: req.user!._id,
      action: 'OPTIMIZATIONS_GENERATED',
      entityType: 'Optimization',
      entityId: opt.id,
    });

    res.status(200).json({
      success: true,
      data: formatOptimization(opt),
    });
  } catch (error) {
    next(error);
  }
};

export const updateSuggestionStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { id, suggestionId } = req.params;
    const { status, editedText } = req.body;

    if (!['pending', 'accepted', 'rejected', 'edited'].includes(status)) {
      throw new AppError("Status must be 'pending', 'accepted', 'rejected', or 'edited'.", 400);
    }

    let opt = null;
    if (id && id !== 'undefined' && id !== 'null' && isValidObjectId(id)) {
      opt = await Optimization.findOne({
        _id: id,
        userId: req.user!._id,
      });
    } else {
      opt = await Optimization.findOne({
        userId: req.user!._id,
        'suggestions.id': suggestionId,
      });
    }

    if (!opt) {
      throw new AppError('Optimization record not found', 404);
    }

    const suggestion = opt.suggestions.find((s) => s.id === suggestionId);
    if (!suggestion) {
      throw new AppError('Suggestion item not found', 404);
    }

    suggestion.status = status;
    if (editedText !== undefined) {
      suggestion.editedText = editedText;
    }

    opt.markModified('suggestions');
    await opt.save();

    res.status(200).json({
      success: true,
      data: formatOptimization(opt),
    });
  } catch (error) {
    next(error);
  }
};

export const applyAcceptedOptimizations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { id } = req.params;

    let opt = null;
    if (id && id !== 'undefined' && id !== 'null' && isValidObjectId(id)) {
      opt = await Optimization.findOne({
        _id: id,
        userId: req.user!._id,
      });
    } else {
      opt = await Optimization.findOne({ userId: req.user!._id }).sort({ updatedAt: -1 });
    }

    if (!opt) throw new AppError('Optimization record not found', 404);

    const resume = await Resume.findOne({
      _id: opt.resumeId,
      userId: req.user!._id,
    });

    if (!resume) throw new AppError('Associated resume not found', 404);

    // Apply accepted and edited suggestions
    opt.suggestions.forEach((s) => {
      if (s.status === 'accepted' || s.status === 'edited') {
        const replacementText = s.editedText || s.proposedText;

        if (s.section === 'summary') {
          resume.parsedData.summary = replacementText;
        } else if (s.section === 'experience' && s.targetItemId) {
          const exp = resume.parsedData.experience.find((e) => e.id === s.targetItemId);
          if (exp && exp.highlights.length > 0) {
            exp.highlights[0] = replacementText;
          }
        }
      }
    });

    resume.version += 1;
    await resume.save();

    opt.status = 'applied';
    await opt.save();

    res.status(200).json({
      success: true,
      message: 'Optimizations successfully compiled into your resume draft.',
      data: {
        resume,
        optimization: opt,
      },
    });
  } catch (error) {
    next(error);
  }
};

