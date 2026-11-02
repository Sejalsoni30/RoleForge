import { Response, NextFunction } from 'express';
import { InterviewSession } from '../models/InterviewSession';
import { Resume } from '../models/Resume';
import { JobDescription } from '../models/JobDescription';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';
import { getAIService } from '../services/ai';
import { AuditLog } from '../models/AuditLog';

export const listInterviewSessions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user!._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

export const generateInterviewSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { resumeId, jobDescriptionId } = req.body;

    const [resume, job] = await Promise.all([
      Resume.findOne({ _id: resumeId, userId: req.user!._id }),
      JobDescription.findOne({ _id: jobDescriptionId, userId: req.user!._id }),
    ]);

    if (!resume) throw new AppError('Resume not found', 404);
    if (!job) throw new AppError('Job description not found', 404);

    const aiService = getAIService();
    const sessionData = await aiService.generateInterviewSession(
      resume.parsedData,
      job.parsedRequirements
    );

    const session = await InterviewSession.create({
      userId: req.user!._id,
      resumeId,
      jobDescriptionId,
      roleTarget: sessionData.roleTarget,
      questions: sessionData.questions,
    });

    await AuditLog.create({
      userId: req.user!._id,
      action: 'INTERVIEW_SESSION_CREATED',
      entityType: 'InterviewSession',
      entityId: session.id,
    });

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!session) throw new AppError('Interview session not found', 404);

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { questionId, userAnswer, userAudioUrl } = req.body;

    if (!userAnswer || userAnswer.trim().length === 0) {
      throw new AppError('Answer text is required', 400);
    }

    const session = await InterviewSession.findOne({
      _id: id,
      userId: req.user!._id,
    });

    if (!session) throw new AppError('Interview session not found', 404);

    const question = session.questions.find((q) => q.id === questionId);
    if (!question) throw new AppError('Question not found in this session', 404);

    const aiService = getAIService();
    const feedback = await aiService.evaluateInterviewAnswer(question, userAnswer);

    question.userAnswer = userAnswer;
    if (userAudioUrl) question.userAudioUrl = userAudioUrl;
    question.feedback = feedback;

    // Check if all questions are answered, and compute overall feedback
    const answeredCount = session.questions.filter((q) => q.feedback?.score !== undefined).length;
    if (answeredCount === session.questions.length) {
      const avgScore = Math.round(
        session.questions.reduce((acc, q) => acc + (q.feedback?.score || 0), 0) /
          session.questions.length
      );

      session.overallFeedback = {
        overallScore: avgScore,
        readinessRating:
          avgScore >= 80 ? 'Ready' : avgScore >= 60 ? 'Needs Practice' : 'Significant Gaps',
        summary: `Performance evaluation completed across all questions with an aggregate readiness score of ${avgScore}%. Focus on structuring your trade-off explanations clearly.`,
      };
    }

    await session.save();

    res.status(200).json({
      success: true,
      data: {
        session,
        evaluatedQuestion: question,
      },
    });
  } catch (error) {
    next(error);
  }
};

