import mongoose, { Document, Schema } from 'mongoose';
import { ParsedResumeData } from '@roleforge/shared';

export interface IResumeDoc extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  originalFileName?: string;
  fileType?: string;
  fileSize?: number;
  rawText: string;
  parsedData: ParsedResumeData;
  status: 'processing' | 'ready' | 'error';
  errorMessage?: string;
  version: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResumeDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    originalFileName: { type: String },
    fileType: { type: String },
    fileSize: { type: Number },
    rawText: { type: String, default: '' },
    parsedData: {
      contact: {
        fullName: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        location: { type: String, default: '' },
        linkedin: { type: String },
        github: { type: String },
        website: { type: String },
      },
      summary: { type: String, default: '' },
      skills: {
        technical: [{ type: String }],
        soft: [{ type: String }],
        tools: [{ type: String }],
        languages: [{ type: String }],
      },
      experience: [
        {
          id: { type: String, required: true },
          company: { type: String, required: true },
          position: { type: String, required: true },
          location: { type: String },
          startDate: { type: String, required: true },
          endDate: { type: String },
          current: { type: Boolean, default: false },
          description: { type: String, default: '' },
          highlights: [{ type: String }],
        },
      ],
      education: [
        {
          id: { type: String, required: true },
          institution: { type: String, required: true },
          degree: { type: String, required: true },
          fieldOfStudy: { type: String, required: true },
          startDate: { type: String },
          endDate: { type: String },
          gpa: { type: String },
          highlights: [{ type: String }],
        },
      ],
      projects: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          description: { type: String, default: '' },
          technologies: [{ type: String }],
          link: { type: String },
          highlights: [{ type: String }],
        },
      ],
      certifications: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          issuer: { type: String, required: true },
          issueDate: { type: String },
          expiryDate: { type: String },
          credentialUrl: { type: String },
        },
      ],
      customSections: [
        {
          id: { type: String, required: true },
          title: { type: String, required: true },
          content: { type: String, default: '' },
        },
      ],
    },
    status: {
      type: String,
      enum: ['processing', 'ready', 'error'],
      default: 'ready',
    },
    errorMessage: { type: String },
    version: { type: Number, default: 1 },
    isArchived: { type: Boolean, default: false },
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

ResumeSchema.index({ userId: 1, isArchived: 1 });
ResumeSchema.index({ userId: 1, createdAt: -1 });

export const Resume = mongoose.model<IResumeDoc>('Resume', ResumeSchema);

