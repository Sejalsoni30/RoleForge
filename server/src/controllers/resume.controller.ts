import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import { Resume } from '../models/Resume';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';
import { parseResumeDocument } from '../services/parser';
import { getAIService } from '../services/ai';
import { AuditLog } from '../models/AuditLog';
import { ParsedResumeDataSchema } from '@roleforge/shared';

const isValidObjectId = (id: unknown): boolean =>
  typeof id === 'string' && id !== 'undefined' && id !== 'null' && mongoose.Types.ObjectId.isValid(id);

export const listResumes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resumes = await Resume.find({
      userId: req.user!._id,
      isArchived: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: resumes.map((r) => ({
        id: r.id,
        title: r.title,
        originalFileName: r.originalFileName,
        fileType: r.fileType,
        fileSize: r.fileSize,
        status: r.status,
        version: r.version,
        parsedData: r.parsedData,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const uploadResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError('Please provide a resume file (PDF or Word document).', 400);
    }

    const parseResult = await parseResumeDocument(req.file);
    const aiService = getAIService();

    // Parse structured resume elements
    const parsedData = await aiService.parseResumeStructure(parseResult.text);

    const title =
      req.body.title ||
      parseResult.originalFileName.replace(/\.[^/.]+$/, '') ||
      'Untitled Resume';

    const resume = await Resume.create({
      userId: req.user!._id,
      title,
      originalFileName: parseResult.originalFileName,
      fileType: parseResult.fileType,
      fileSize: parseResult.fileSize,
      rawText: parseResult.text,
      parsedData,
      status: 'ready',
      version: 1,
    });

    await AuditLog.create({
      userId: req.user!._id,
      action: 'RESUME_UPLOADED',
      entityType: 'Resume',
      entityId: resume.id,
    });

    res.status(201).json({
      success: true,
      data: {
        id: resume.id,
        title: resume.title,
        originalFileName: resume.originalFileName,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        status: resume.status,
        version: resume.version,
        parsedData: resume.parsedData,
        createdAt: resume.createdAt.toISOString(),
        updatedAt: resume.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createResumeFromText = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, text } = req.body;
    if (!text || text.trim().length < 20) {
      throw new AppError('Please provide meaningful resume text (minimum 20 characters).', 400);
    }

    const aiService = getAIService();
    const parsedData = await aiService.parseResumeStructure(text);

    const resume = await Resume.create({
      userId: req.user!._id,
      title: title || 'Pasted Resume',
      rawText: text,
      fileType: 'txt',
      parsedData,
      status: 'ready',
      version: 1,
    });

    res.status(201).json({
      success: true,
      data: {
        id: resume.id,
        title: resume.title,
        status: resume.status,
        version: resume.version,
        parsedData: resume.parsedData,
        createdAt: resume.createdAt.toISOString(),
        updatedAt: resume.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      throw new AppError('Resume not found or access denied', 404);
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user!._id,
      isArchived: false,
    });

    if (!resume) {
      throw new AppError('Resume not found or access denied', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        id: resume.id,
        title: resume.title,
        originalFileName: resume.originalFileName,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        rawText: resume.rawText,
        parsedData: resume.parsedData,
        status: resume.status,
        version: resume.version,
        createdAt: resume.createdAt.toISOString(),
        updatedAt: resume.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateResumeData = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      throw new AppError('Resume not found', 404);
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user!._id,
      isArchived: false,
    });

    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    if (req.body.title) {
      resume.title = req.body.title;
    }

    if (req.body.parsedData) {
      // Validate schema
      const validatedData = ParsedResumeDataSchema.parse(req.body.parsedData);
      resume.parsedData = validatedData;
      resume.version += 1;
    }

    await resume.save();

    res.status(200).json({
      success: true,
      data: {
        id: resume.id,
        title: resume.title,
        parsedData: resume.parsedData,
        version: resume.version,
        updatedAt: resume.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      throw new AppError('Resume not found', 404);
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    // Soft archive or permanent delete
    resume.isArchived = true;
    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

