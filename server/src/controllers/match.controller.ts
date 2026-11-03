import { Response, NextFunction } from 'express';
import { MatchAnalysis } from '../models/MatchAnalysis';
import { Resume } from '../models/Resume';
import { JobDescription } from '../models/JobDescription';
import { SkillGap } from '../models/SkillGap';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';
import { getAIService } from '../services/ai';
import { AuditLog } from '../models/AuditLog';

export const compileMatch = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { resumeId, jobDescriptionId } = req.body;

    if (!resumeId || !jobDescriptionId) {
      throw new AppError('Both resumeId and jobDescriptionId are required.', 400);
    }

    const [resume, job] = await Promise.all([
      Resume.findOne({ _id: resumeId, userId: req.user!._id, isArchived: false }),
      JobDescription.findOne({ _id: jobDescriptionId, userId: req.user!._id }),
    ]);

    if (!resume) throw new AppError('Resume not found or access denied', 404);
    if (!job) throw new AppError('Job description not found or access denied', 404);

    const aiService = getAIService();
    const evaluation = await aiService.evaluateMatchAndEvidence(
      resume.parsedData,
      job.parsedRequirements
    );

    // Save or update match analysis
    let match = await MatchAnalysis.findOne({
      userId: req.user!._id,
      resumeId: resume._id,
      jobDescriptionId: job._id,
    });

    if (match) {
      match.overallScore = evaluation.overallScore;
      match.categoryScores = evaluation.categoryScores;
      match.evidenceLinks = evaluation.evidenceLinks;
      match.summary = evaluation.summary;
      match.strengths = evaluation.strengths;
      match.criticalGaps = evaluation.criticalGaps;
      match.quickWins = evaluation.quickWins;
      match.isStale = false;
      await match.save();
    } else {
      match = await MatchAnalysis.create({
        userId: req.user!._id,
        resumeId: resume._id,
        jobDescriptionId: job._id,
        overallScore: evaluation.overallScore,
        scoreLabel: 'RoleForge Alignment Estimate',
        categoryScores: evaluation.categoryScores,
        evidenceLinks: evaluation.evidenceLinks,
        summary: evaluation.summary,
        strengths: evaluation.strengths,
        criticalGaps: evaluation.criticalGaps,
        quickWins: evaluation.quickWins,
        isStale: false,
      });
    }

    // Synchronize Skill Gap & Roadmap
    const missingMandatory = evaluation.evidenceLinks
      .filter((e) => e.category === 'mandatory' && e.status !== 'matched')
      .map((e) => e.requirementText);

    const missingPreferred = evaluation.evidenceLinks
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

    let skillGap = await SkillGap.findOne({
      userId: req.user!._id,
      matchAnalysisId: match._id,
    });

    if (skillGap) {
      skillGap.missingMandatory = missingMandatory;
      skillGap.missingPreferred = missingPreferred;
      // Preserve status of existing roadmap items if already marked completed/known
      const statusMap = new Map(skillGap.roadmap.map((r) => [r.skill, r.status]));
      skillGap.roadmap = roadmapItems.map((item) => ({
        ...item,
        status: statusMap.get(item.skill) || item.status,
      }));
      await skillGap.save();
    } else {
      skillGap = await SkillGap.create({
        userId: req.user!._id,
        matchAnalysisId: match._id,
        missingMandatory,
        missingPreferred,
        roadmap: roadmapItems,
        progressPercentage: 0,
      });
    }

    await AuditLog.create({
      userId: req.user!._id,
      action: 'MATCH_COMPILED',
      entityType: 'MatchAnalysis',
      entityId: match.id,
      metadata: { overallScore: match.overallScore },
    });

    res.status(200).json({
      success: true,
      data: {
        match: {
          id: match.id,
          resumeId: match.resumeId.toString(),
          jobDescriptionId: match.jobDescriptionId.toString(),
          overallScore: match.overallScore,
          scoreLabel: match.scoreLabel,
          categoryScores: match.categoryScores,
          evidenceLinks: match.evidenceLinks,
          summary: match.summary,
          strengths: match.strengths,
          criticalGaps: match.criticalGaps,
          quickWins: match.quickWins,
          createdAt: match.createdAt.toISOString(),
          updatedAt: match.updatedAt.toISOString(),
        },
        skillGap: {
          id: skillGap.id,
          missingMandatory: skillGap.missingMandatory,
          missingPreferred: skillGap.missingPreferred,
          roadmap: skillGap.roadmap,
          progressPercentage: skillGap.progressPercentage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMatch = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const match = await MatchAnalysis.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!match) {
      throw new AppError('Match analysis record not found', 404);
    }

    res.status(200).json({
      success: true,
      data: match,
    });
  } catch (error) {
    next(error);
  }
};

export const getMatchByPair = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { resumeId, jobId } = req.params;

    const match = await MatchAnalysis.findOne({
      userId: req.user!._id,
      resumeId,
      jobDescriptionId: jobId,
    });

    if (!match) {
      res.status(200).json({
        success: true,
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: match,
    });
  } catch (error) {
    next(error);
  }
};

export const listMatches = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const matches = await MatchAnalysis.find({ userId: req.user!._id })
      .sort({ updatedAt: -1 })
      .populate('resumeId', 'title')
      .populate('jobDescriptionId', 'title company');

    res.status(200).json({
      success: true,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};

