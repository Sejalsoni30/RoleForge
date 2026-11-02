import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: 'user' | 'admin';
  avatar?: string;
  googleId?: string;
  onboardingComplete: boolean;
  currentRole?: string;
  targetRole?: string;
  targetIndustry?: string;
  yearsOfExperience?: number;
  preferences: {
    emailAlerts: boolean;
    atsOptimizationLevel: 'balanced' | 'aggressive' | 'strict-ats';
    defaultTemplate: string;
  };
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String },
    googleId: { type: String, sparse: true, index: true },
    onboardingComplete: { type: Boolean, default: false },
    currentRole: { type: String, default: '' },
    targetRole: { type: String, default: '' },
    targetIndustry: { type: String, default: '' },
    yearsOfExperience: { type: Number, default: 0 },
    preferences: {
      emailAlerts: { type: Boolean, default: true },
      atsOptimizationLevel: {
        type: String,
        enum: ['balanced', 'aggressive', 'strict-ats'],
        default: 'balanced',
      },
      defaultTemplate: { type: String, default: 'ats-classic' },
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// Password comparison method
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = mongoose.model<IUserDocument>('User', UserSchema);

