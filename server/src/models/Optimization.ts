import mongoose, { Document, Schema } from 'mongoose';
import { OptimizationSuggestion } from '@roleforge/shared';

export interface IOptimizationDoc extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  jobDescriptionId: mongoose.Types.ObjectId;
  suggestions: OptimizationSuggestion[];
  status: 'draft' | 'applied';
  createdAt: Date;
  updatedAt: Date;
}

const OptimizationSuggestionSchema = new Schema(
  {
    id: { type: String, required: true },
    section: {
      type: String,
      enum: ['summary', 'experience', 'skills', 'projects'],
      required: true,
    },
    targetItemId: { type: String },
    originalText: { type: String, required: true },
    proposedText: { type: String, required: true },
    rationale: { type: String, required: true },
    evidenceOrigin: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'edited'],
      default: 'pending',
    },
    editedText: { type: String },
    requiresUserData: { type: Boolean, default: false },
    userPromptQuestion: { type: String },
  },
  { _id: false }
);

const OptimizationSchema = new Schema<IOptimizationDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
    jobDescriptionId: { type: Schema.Types.ObjectId, ref: 'JobDescription', required: true },
    suggestions: [OptimizationSuggestionSchema],
    status: { type: String, enum: ['draft', 'applied'], default: 'draft' },
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

OptimizationSchema.index({ userId: 1, resumeId: 1, jobDescriptionId: 1 });

export const Optimization = mongoose.model<IOptimizationDoc>('Optimization', OptimizationSchema);

