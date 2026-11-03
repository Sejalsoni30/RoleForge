import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User';
import { Resume } from '../models/Resume';
import { JobDescription } from '../models/JobDescription';
import { MatchAnalysis } from '../models/MatchAnalysis';
import { SkillGap } from '../models/SkillGap';
import { Optimization } from '../models/Optimization';
import { ResumeVersion } from '../models/ResumeVersion';
import { CoverLetter } from '../models/CoverLetter';
import { InterviewSession } from '../models/InterviewSession';
import { Application } from '../models/Application';
import { CareerSwitch } from '../models/CareerSwitch';
import { AuditLog } from '../models/AuditLog';
import { ENV } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { RegisterSchema, LoginSchema, UpdateProfileSchema } from '@roleforge/shared';

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, ENV.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = RegisterSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase().trim();

    // Fast single-pass hash computation
    const passwordHash = await bcrypt.hash(password, 10);

    let user;
    try {
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        onboardingComplete: false,
      });
    } catch (dbErr: any) {
      if (dbErr?.code === 11000) {
        throw new AppError('An account with this email already exists', 400);
      }
      throw dbErr;
    }

    const token = generateToken(user.id);

    // Non-blocking asynchronous audit log
    AuditLog.create({
      userId: user._id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
    }).catch((err) => console.error('[AuditLog] Non-blocking register log notice:', err));

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          onboardingComplete: user.onboardingComplete,
          preferences: user.preferences,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(user.id);

    await AuditLog.create({
      userId: user._id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
    });

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          onboardingComplete: user.onboardingComplete,
          currentRole: user.currentRole,
          targetRole: user.targetRole,
          targetIndustry: user.targetIndustry,
          yearsOfExperience: user.yearsOfExperience,
          preferences: user.preferences,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { credential, email, name, avatar, googleId } = req.body;

    if (!ENV.GOOGLE_CLIENT_ID && !credential && !googleId) {
      throw new AppError('Google OAuth is not configured on this instance. Use Email & Password.', 400);
    }

    if (!email) {
      throw new AppError('Email is required for Google Sign-In', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const query = googleId ? { $or: [{ googleId }, { email: normalizedEmail }] } : { email: normalizedEmail };
    let user = await User.findOne(query);

    if (!user) {
      user = await User.create({
        name: (name || 'Google User').trim(),
        email: normalizedEmail,
        googleId,
        avatar,
        onboardingComplete: false,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (avatar && !user.avatar) user.avatar = avatar;
      await user.save();
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          onboardingComplete: user.onboardingComplete,
          currentRole: user.currentRole,
          targetRole: user.targetRole,
          preferences: user.preferences,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond with success to prevent user enumeration
    if (!user) {
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been generated.',
      });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset token generated successfully.',
      // In development, return token for frictionless testing
      ...(process.env.NODE_ENV !== 'production' && { devResetToken: resetToken }),
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid or expired password reset token', 400);
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been successfully updated. You may now log in.',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        onboardingComplete: user.onboardingComplete,
        currentRole: user.currentRole,
        targetRole: user.targetRole,
        targetIndustry: user.targetIndustry,
        yearsOfExperience: user.yearsOfExperience,
        preferences: user.preferences,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = UpdateProfileSchema.parse(req.body);
    const user = req.user!;

    if (validatedData.name) user.name = validatedData.name;
    if (validatedData.currentRole !== undefined) user.currentRole = validatedData.currentRole;
    if (validatedData.targetRole !== undefined) user.targetRole = validatedData.targetRole;
    if (validatedData.targetIndustry !== undefined) user.targetIndustry = validatedData.targetIndustry;
    if (validatedData.yearsOfExperience !== undefined) user.yearsOfExperience = validatedData.yearsOfExperience;
    if (validatedData.onboardingComplete !== undefined) user.onboardingComplete = validatedData.onboardingComplete;
    if (validatedData.preferences) {
      user.preferences = {
        ...user.preferences,
        ...validatedData.preferences,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        onboardingComplete: user.onboardingComplete,
        currentRole: user.currentRole,
        targetRole: user.targetRole,
        targetIndustry: user.targetIndustry,
        yearsOfExperience: user.yearsOfExperience,
        preferences: user.preferences,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Engineering rule: "Account and data deletion actually delete."
export const deleteAccount = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;

    // Concurrently wipe all user-owned records across all 11 dependent collections
    await Promise.all([
      Resume.deleteMany({ userId }),
      JobDescription.deleteMany({ userId }),
      MatchAnalysis.deleteMany({ userId }),
      SkillGap.deleteMany({ userId }),
      Optimization.deleteMany({ userId }),
      ResumeVersion.deleteMany({ userId }),
      CoverLetter.deleteMany({ userId }),
      InterviewSession.deleteMany({ userId }),
      Application.deleteMany({ userId }),
      CareerSwitch.deleteMany({ userId }),
      AuditLog.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    res.status(200).json({
      success: true,
      message: 'Account and all associated personal data have been permanently deleted.',
    });
  } catch (error) {
    next(error);
  }
};

