import { Response, NextFunction } from 'express';
import { CareerSwitch } from '../models/CareerSwitch';
import { Resume } from '../models/Resume';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';
import { getAIService } from '../services/ai';
import { AuditLog } from '../models/AuditLog';

export const getCareerSwitchRoadmaps = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roadmaps = await CareerSwitch.find({ userId: req.user!._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: roadmaps,
    });
  } catch (error) {
    next(error);
  }
};

export const generateCareerSwitchRoadmap = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { targetRole, resumeId } = req.body;

    if (!targetRole) throw new AppError('Target role is required', 400);

    let currentRole = req.user!.currentRole || 'Software Professional';
    let skills: string[] = ['JavaScript', 'System Architecture', 'Problem Solving'];

    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, userId: req.user!._id });
      if (resume) {
        if (resume.parsedData.experience[0]?.position) {
          currentRole = resume.parsedData.experience[0].position;
        }
        if (resume.parsedData.skills.technical.length > 0) {
          skills = resume.parsedData.skills.technical;
        }
      }
    }

    const aiService = getAIService();
    const roadmapData = await aiService.generateCareerSwitch(currentRole, targetRole, skills);

    const roadmap = await CareerSwitch.create({
      userId: req.user!._id,
      ...roadmapData,
    });

    await AuditLog.create({
      userId: req.user!._id,
      action: 'CAREER_SWITCH_GENERATED',
      entityType: 'CareerSwitch',
      entityId: roadmap.id,
    });

    res.status(201).json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    next(error);
  }
};

