import mongoose, { Document, Schema } from 'mongoose';
import { CoverLetterTone } from '@roleforge/shared';

export interface ICoverLetterDoc extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  jobDescriptionId: mongoose.Types.ObjectId;
  title: string;
  recipientName?: string;
  recipientTitle?: string;
  companyName: string;
  content: string;
  tone: CoverLetterTone;
  highlightedSkills: string[];
  status: 'draft' | 'final';
  createdAt: Date;
  updatedAt: Date;
}

const CoverLetterSchema = new Schema<ICoverLetterDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
    jobDescriptionId: { type: Schema.Types.ObjectId, ref: 'JobDescription', required: true },
    title: { type: String, required: true },
    recipientName: { type: String },
    recipientTitle: { type: String },
    companyName: { type: String, required: true },
    content: { type: String, required: true },
    tone: {
      type: String,
      enum: ['formal', 'conversational', 'modern', 'technical'],
      default: 'modern',
    },
    highlightedSkills: [{ type: String }],
    status: { type: String, enum: ['draft', 'final'], default: 'draft' },
  },
  { timestamps: true }
);

CoverLetterSchema.index({ userId: 1, createdAt: -1 });

export const CoverLetter = mongoose.model<ICoverLetterDoc>('CoverLetter', CoverLetterSchema);

