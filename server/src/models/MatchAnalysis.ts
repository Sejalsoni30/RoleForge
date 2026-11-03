import mongoose, { Document, Schema } from 'mongoose';
import { CategoryScore, EvidenceLink } from '@roleforge/shared';

export interface IMatchAnalysisDoc extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  jobDescriptionId: mongoose.Types.ObjectId;
  overallScore: number;
  scoreLabel: string;
  categoryScores: {
    mandatorySkills: CategoryScore;
    preferredSkills: CategoryScore;
    experienceRelevance: CategoryScore;
    educationAndCerts: CategoryScore;
    domainKnowledge: CategoryScore;
  };
  evidenceLinks: EvidenceLink[];
  summary: string;
  strengths: string[];
  criticalGaps: string[];
  quickWins: string[];
  isStale: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategoryScoreSchema = new Schema(
  {
    score: { type: Number, required: true },
    weight: { type: Number, required: true },
    matchedCount: { type: Number, required: true },
    totalCount: { type: Number, required: true },
    breakdown: { type: String, default: '' },
  },
  { _id: false }
);

const EvidenceLinkSchema = new Schema(
  {
    requirementId: { type: String, required: true },
    requirementText: { type: String, required: true },
    category: { type: String, enum: ['mandatory', 'preferred', 'optional'], required: true },
    type: { type: String, required: true },
    status: {
      type: String,
      enum: ['matched', 'partially_matched', 'not_mentioned', 'not_demonstrated', 'explicitly_unavailable'],
      required: true,
    },
    matchedTextInResume: { type: String, default: '' },
    resumeSection: { type: String },
    confidence: { type: Number, min: 0, max: 100, default: 0 },
    reasoning: { type: String, required: true },
    recommendation: { type: String },
  },
  { _id: false }
);

const MatchAnalysisSchema = new Schema<IMatchAnalysisDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
    jobDescriptionId: { type: Schema.Types.ObjectId, ref: 'JobDescription', required: true },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    scoreLabel: { type: String, default: 'RoleForge Alignment Estimate' },
    categoryScores: {
      mandatorySkills: { type: CategoryScoreSchema, required: true },
      preferredSkills: { type: CategoryScoreSchema, required: true },
      experienceRelevance: { type: CategoryScoreSchema, required: true },
      educationAndCerts: { type: CategoryScoreSchema, required: true },
      domainKnowledge: { type: CategoryScoreSchema, required: true },
    },
    evidenceLinks: [EvidenceLinkSchema],
    summary: { type: String, default: '' },
    strengths: [{ type: String }],
    criticalGaps: [{ type: String }],
    quickWins: [{ type: String }],
    isStale: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        return ret;
      },
    },
  }
);

MatchAnalysisSchema.index({ userId: 1, resumeId: 1, jobDescriptionId: 1 });
MatchAnalysisSchema.index({ resumeId: 1 });

export const MatchAnalysis = mongoose.model<IMatchAnalysisDoc>('MatchAnalysis', MatchAnalysisSchema);

