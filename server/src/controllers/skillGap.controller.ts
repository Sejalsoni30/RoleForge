import { Response, NextFunction } from 'express';
import { SkillGap } from '../models/SkillGap';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';

export const getSkillGap = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const skillGap = await SkillGap.findOne({
      matchAnalysisId: req.params.matchAnalysisId,
      userId: req.user!._id,
    });

    if (!skillGap) {
      throw new AppError('Skill gap analysis not found', 404);
    }

    res.status(200).json({
      success: true,
      data: skillGap,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRoadmapItemStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { matchAnalysisId, itemId } = req.params;
    const { status } = req.body;

    if (!['learning', 'completed', 'already_known'].includes(status)) {
      throw new AppError("Status must be 'learning', 'completed', or 'already_known'.", 400);
    }

    const skillGap = await SkillGap.findOne({
      matchAnalysisId,
      userId: req.user!._id,
    });

    if (!skillGap) {
      throw new AppError('Skill gap record not found', 404);
    }

    const item = skillGap.roadmap.find((r) => r.id === itemId);
    if (!item) {
      throw new AppError('Roadmap item not found', 404);
    }

    item.status = status;

    // Recalculate progress percentage
    const completedCount = skillGap.roadmap.filter(
      (r) => r.status === 'completed' || r.status === 'already_known'
    ).length;
    skillGap.progressPercentage = Math.round((completedCount / Math.max(1, skillGap.roadmap.length)) * 100);

    await skillGap.save();

    res.status(200).json({
      success: true,
      data: skillGap,
    });
  } catch (error) {
    next(error);
  }
};

