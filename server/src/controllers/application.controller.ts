import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import { Application } from '../models/Application';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';
import { AuditLog } from '../models/AuditLog';

const isValidObjectId = (id: unknown): boolean =>
  typeof id === 'string' && id !== 'undefined' && id !== 'null' && mongoose.Types.ObjectId.isValid(id);

export const listApplications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, company } = req.query;

    const filter: any = { userId: req.user!._id };
    if (status) filter.status = status;
    if (company) filter.company = new RegExp(String(company), 'i');

    const applications = await Application.find(filter).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

export const createApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      company,
      role,
      jobDescriptionId,
      resumeVersionId,
      coverLetterId,
      status,
      appliedDate,
      salary,
      location,
      jobUrl,
      notes,
      matchScore,
      reminders,
    } = req.body;

    if (!company || !role) {
      throw new AppError('Company and Role are required', 400);
    }

    const application = await Application.create({
      userId: req.user!._id,
      company,
      role,
      jobDescriptionId,
      resumeVersionId,
      coverLetterId,
      status: status || 'saved',
      appliedDate: appliedDate || (status === 'applied' ? new Date().toISOString().split('T')[0] : undefined),
      salary,
      location,
      jobUrl,
      notes: notes || '',
      matchScore,
      reminders: reminders || [],
    });

    await AuditLog.create({
      userId: req.user!._id,
      action: 'APPLICATION_CREATED',
      entityType: 'Application',
      entityId: application.id,
      metadata: { company, role, status },
    });

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      throw new AppError('Application not found', 404);
    }

    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!application) throw new AppError('Application not found', 404);

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      throw new AppError('Application not found', 404);
    }

    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!application) throw new AppError('Application not found', 404);

    const allowedFields = [
      'company',
      'role',
      'jobDescriptionId',
      'resumeVersionId',
      'coverLetterId',
      'status',
      'appliedDate',
      'salary',
      'location',
      'jobUrl',
      'notes',
      'matchScore',
      'reminders',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (application as any)[field] = req.body[field];
      }
    });

    await application.save();

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      throw new AppError('Application not found', 404);
    }

    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!application) throw new AppError('Application not found', 404);

    res.status(200).json({
      success: true,
      message: 'Application removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

