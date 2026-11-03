import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import { JobDescription } from '../models/JobDescription';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';
import { getAIService } from '../services/ai';
import { AuditLog } from '../models/AuditLog';
import { ParsedJobRequirementsSchema } from '@roleforge/shared';

const isValidObjectId = (id: unknown): boolean =>
  typeof id === 'string' && id !== 'undefined' && id !== 'null' && mongoose.Types.ObjectId.isValid(id);

export const listJobs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobs = await JobDescription.find({ userId: req.user!._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: jobs.map((j) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        parsedRequirements: j.parsedRequirements,
        status: j.status,
        userCorrectionsApplied: j.userCorrectionsApplied,
        createdAt: j.createdAt.toISOString(),
        updatedAt: j.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const createJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { rawText, title, company, location } = req.body;

    if (!rawText || rawText.trim().length < 30) {
      throw new AppError('Please provide a substantive job description (at least 30 characters).', 400);
    }

    const aiService = getAIService();
    const parsedRequirements = await aiService.parseJobRequirements(rawText);

    if (title) parsedRequirements.title = title;
    if (company) parsedRequirements.company = company;
    if (location) parsedRequirements.location = location;

    const job = await JobDescription.create({
      userId: req.user!._id,
      title: parsedRequirements.title || 'Target Role',
      company: parsedRequirements.company || 'Target Company',
      location: parsedRequirements.location,
      rawText,
      parsedRequirements,
      status: 'parsed',
      userCorrectionsApplied: false,
    });

    await AuditLog.create({
      userId: req.user!._id,
      action: 'JOB_DESCRIPTION_PARSED',
      entityType: 'JobDescription',
      entityId: job.id,
    });

    res.status(201).json({
      success: true,
      data: {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        parsedRequirements: job.parsedRequirements,
        status: job.status,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      throw new AppError('Job description not found', 404);
    }

    const job = await JobDescription.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!job) {
      throw new AppError('Job description not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        rawText: job.rawText,
        parsedRequirements: job.parsedRequirements,
        status: job.status,
        userCorrectionsApplied: job.userCorrectionsApplied,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateJobRequirements = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      throw new AppError('Job description not found', 404);
    }

    const job = await JobDescription.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!job) {
      throw new AppError('Job description not found', 404);
    }

    if (req.body.parsedRequirements) {
      const validated = ParsedJobRequirementsSchema.parse(req.body.parsedRequirements);
      job.parsedRequirements = validated;
      job.title = validated.title;
      job.company = validated.company;
      job.userCorrectionsApplied = true;
    }

    if (req.body.title) job.title = req.body.title;
    if (req.body.company) job.company = req.body.company;

    await job.save();

    res.status(200).json({
      success: true,
      data: {
        id: job.id,
        title: job.title,
        company: job.company,
        parsedRequirements: job.parsedRequirements,
        userCorrectionsApplied: job.userCorrectionsApplied,
        updatedAt: job.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      throw new AppError('Job description not found', 404);
    }

    const job = await JobDescription.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!job) {
      throw new AppError('Job description not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Job description deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

