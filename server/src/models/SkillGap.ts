import mongoose, { Document, Schema } from 'mongoose';
import { SkillRoadmapItem } from '@roleforge/shared';

export interface ISkillGapDoc extends Document {
  userId: mongoose.Types.ObjectId;
  matchAnalysisId: mongoose.Types.ObjectId;
  missingMandatory: string[];
  missingPreferred: string[];
  roadmap: SkillRoadmapItem[];
  progressPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const SkillRoadmapItemSchema = new Schema(
  {
    id: { type: String, required: true },
    skill: { type: String, required: true },
    importance: { type: String, enum: ['critical', 'high', 'medium', 'bonus'], default: 'high' },
    category: { type: String, default: 'Technical' },
    status: { type: String, enum: ['learning', 'completed', 'already_known'], default: 'learning' },
    estimatedHours: { type: Number, default: 10 },
    actionPlan: { type: String, default: '' },
    recommendedResources: [
      {
        title: { type: String, required: true },
        url: { type: String },
        type: { type: String, enum: ['course', 'doc', 'project', 'book'], default: 'doc' },
      },
    ],
  },
  { _id: false }
);

const SkillGapSchema = new Schema<ISkillGapDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    matchAnalysisId: { type: Schema.Types.ObjectId, ref: 'MatchAnalysis', required: true, index: true },
    missingMandatory: [{ type: String }],
    missingPreferred: [{ type: String }],
    roadmap: [SkillRoadmapItemSchema],
    progressPercentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SkillGapSchema.index({ userId: 1, matchAnalysisId: 1 });

export const SkillGap = mongoose.model<ISkillGapDoc>('SkillGap', SkillGapSchema);

