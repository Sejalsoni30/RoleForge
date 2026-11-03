import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import { SkillGap } from '../models/SkillGap';
import { MatchAnalysis } from '../models/MatchAnalysis';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';

const isValidObjectId = (id: unknown): boolean =>
  typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);

export const getLatestSkillGap = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let skillGap = await SkillGap.findOne({ userId: req.user!._id })
      .sort({ updatedAt: -1 })
      .populate({
        path: 'matchAnalysisId',
        populate: [
          { path: 'resumeId', select: 'title' },
          { path: 'jobDescriptionId', select: 'title company' },
        ],
      });

    // If no SkillGap found, see if there is any MatchAnalysis that we can generate SkillGap for
    if (!skillGap) {
      const latestMatch = await MatchAnalysis.findOne({ userId: req.user!._id })
        .sort({ updatedAt: -1 });

      if (latestMatch) {
        const missingMandatory = (latestMatch.evidenceLinks || [])
          .filter((e) => e.category === 'mandatory' && e.status !== 'matched')
          .map((e) => e.requirementText);

        const missingPreferred = (latestMatch.evidenceLinks || [])
          .filter((e) => e.category === 'preferred' && e.status !== 'matched')
          .map((e) => e.requirementText);

        const roadmapItems = [
          ...missingMandatory.map((skill, idx) => ({
            id: `gap-mand-${idx}`,
            skill,
            importance: 'critical' as const,
            category: 'Mandatory Qualification',
            status: 'learning' as const,
            estimatedHours: 12,
            actionPlan: `Complete practical project implementation and add portfolio evidence for ${skill}.`,
            recommendedResources: [
              { title: `${skill} Documentation & Architecture Guide`, type: 'doc' as const },
              { title: `Hands-on Project Blueprint: ${skill}`, type: 'project' as const },
            ],
          })),
          ...missingPreferred.map((skill, idx) => ({
            id: `gap-pref-${idx}`,
            skill,
            importance: 'medium' as const,
            category: 'Preferred Qualification',
            status: 'learning' as const,
            estimatedHours: 6,
            actionPlan: `Familiarize with high-level workflows and basic terminology for ${skill}.`,
            recommendedResources: [
              { title: `${skill} Essentials Overview`, type: 'course' as const },
            ],
          })),
        ];

        skillGap = await SkillGap.create({
          userId: req.user!._id,
          matchAnalysisId: latestMatch._id,
          missingMandatory,
          missingPreferred,
          roadmap: roadmapItems,
          progressPercentage: 0,
        });

        skillGap = await SkillGap.findById(skillGap._id).populate({
          path: 'matchAnalysisId',
          populate: [
            { path: 'resumeId', select: 'title' },
            { path: 'jobDescriptionId', select: 'title company' },
          ],
        });
      }
    }

    res.status(200).json({
      success: true,
      data: skillGap || null,
    });
  } catch (error) {
    next(error);
  }
};

export const listSkillGaps = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const skillGaps = await SkillGap.find({ userId: req.user!._id })
      .sort({ updatedAt: -1 })
      .populate({
        path: 'matchAnalysisId',
        populate: [
          { path: 'resumeId', select: 'title' },
          { path: 'jobDescriptionId', select: 'title company' },
        ],
      });

    res.status(200).json({
      success: true,
      data: skillGaps,
    });
  } catch (error) {
    next(error);
  }
};

export const getSkillGap = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { matchAnalysisId } = req.params;
    if (!matchAnalysisId || matchAnalysisId === 'undefined' || !isValidObjectId(matchAnalysisId)) {
      throw new AppError('Skill gap analysis not found', 404);
    }

    const skillGap = await SkillGap.findOne({
      matchAnalysisId,
      userId: req.user!._id,
    }).populate({
      path: 'matchAnalysisId',
      populate: [
        { path: 'resumeId', select: 'title' },
        { path: 'jobDescriptionId', select: 'title company' },
      ],
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

    if (!matchAnalysisId || matchAnalysisId === 'undefined' || !isValidObjectId(matchAnalysisId)) {
      throw new AppError('Skill gap record not found', 404);
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

