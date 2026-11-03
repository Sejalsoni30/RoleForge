import mongoose, { Document, Schema } from 'mongoose';
import { InterviewQuestion } from '@roleforge/shared';

export interface IInterviewSessionDoc extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  jobDescriptionId: mongoose.Types.ObjectId;
  roleTarget: string;
  questions: InterviewQuestion[];
  overallFeedback?: {
    overallScore: number;
    readinessRating: 'Ready' | 'Needs Practice' | 'Significant Gaps';
    summary: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSessionSchema = new Schema<IInterviewSessionDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
    jobDescriptionId: { type: Schema.Types.ObjectId, ref: 'JobDescription', required: true },
    roleTarget: { type: String, required: true },
    questions: [
      {
        id: { type: String, required: true },
        question: { type: String, required: true },
        type: {
          type: String,
          enum: ['behavioral', 'technical', 'situational', 'culture_fit', 'case_study'],
          default: 'behavioral',
        },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
        rubric: [{ type: String }],
        sampleAnswer: { type: String, default: '' },
        userAnswer: { type: String },
        userAudioUrl: { type: String },
        feedback: {
          score: { type: Number },
          strengths: [{ type: String }],
          improvements: [{ type: String }],
          keyMissedPoints: [{ type: String }],
          suggestedRefinement: { type: String },
        },
      },
    ],
    overallFeedback: {
      overallScore: { type: Number },
      readinessRating: { type: String, enum: ['Ready', 'Needs Practice', 'Significant Gaps'] },
      summary: { type: String },
    },
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

InterviewSessionSchema.index({ userId: 1, createdAt: -1 });

export const InterviewSession = mongoose.model<IInterviewSessionDoc>(
  'InterviewSession',
  InterviewSessionSchema
);

