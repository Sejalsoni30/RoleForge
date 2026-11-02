import mongoose, { Document, Schema } from 'mongoose';
import { ApplicationReminder, ApplicationStatus } from '@roleforge/shared';

export interface IApplicationDoc extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  jobDescriptionId?: mongoose.Types.ObjectId;
  resumeVersionId?: mongoose.Types.ObjectId;
  coverLetterId?: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  appliedDate?: string;
  salary?: string;
  location?: string;
  jobUrl?: string;
  notes?: string;
  matchScore?: number;
  reminders: ApplicationReminder[];
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplicationDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    jobDescriptionId: { type: Schema.Types.ObjectId, ref: 'JobDescription' },
    resumeVersionId: { type: Schema.Types.ObjectId, ref: 'ResumeVersion' },
    coverLetterId: { type: Schema.Types.ObjectId, ref: 'CoverLetter' },
    status: {
      type: String,
      enum: ['saved', 'applied', 'interviewing', 'offered', 'rejected', 'withdrawn'],
      default: 'saved',
    },
    appliedDate: { type: String },
    salary: { type: String },
    location: { type: String },
    jobUrl: { type: String },
    notes: { type: String, default: '' },
    matchScore: { type: Number },
    reminders: [
      {
        id: { type: String, required: true },
        date: { type: String, required: true },
        note: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

ApplicationSchema.index({ userId: 1, status: 1 });
ApplicationSchema.index({ userId: 1, appliedDate: -1 });

export const Application = mongoose.model<IApplicationDoc>('Application', ApplicationSchema);

