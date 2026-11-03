import mongoose, { Document, Schema } from 'mongoose';
import { ATSIssue, ParsedResumeData, ResumeTemplateId } from '@roleforge/shared';

export interface IResumeVersionDoc extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  versionNumber: number;
  title: string;
  templateId: ResumeTemplateId;
  customTheme: {
    primaryColor: string;
    fontFamily: string;
    fontSize: string;
    lineSpacing: string;
  };
  content: ParsedResumeData;
  atsReadabilityScore: number;
  atsIssues: ATSIssue[];
  pdfUrl?: string;
  docxUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeVersionSchema = new Schema<IResumeVersionDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true, index: true },
    versionNumber: { type: Number, required: true },
    title: { type: String, required: true },
    templateId: {
      type: String,
      enum: [
        'ats-classic',
        'modern-minimal',
        'executive-refined',
        'technical-compact',
        'creative-bold',
        'academic-standard',
        'hybrid-modern',
      ],
      default: 'ats-classic',
    },
    customTheme: {
      primaryColor: { type: String, default: '#4338CA' },
      fontFamily: { type: String, default: 'Inter' },
      fontSize: { type: String, default: 'medium' },
      lineSpacing: { type: String, default: 'normal' },
    },
    content: { type: Schema.Types.Mixed, required: true },
    atsReadabilityScore: { type: Number, default: 85 },
    atsIssues: [
      {
        severity: { type: String, enum: ['critical', 'warning', 'info'], required: true },
        type: { type: String, required: true },
        message: { type: String, required: true },
        section: { type: String },
        fixRecommendation: { type: String, required: true },
      },
    ],
    pdfUrl: { type: String },
    docxUrl: { type: String },
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

ResumeVersionSchema.index({ userId: 1, resumeId: 1, versionNumber: -1 });

export const ResumeVersion = mongoose.model<IResumeVersionDoc>('ResumeVersion', ResumeVersionSchema);

