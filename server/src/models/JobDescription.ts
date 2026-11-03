import mongoose, { Document, Schema } from 'mongoose';
import { ParsedJobRequirements } from '@roleforge/shared';

export interface IJobDescriptionDoc extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  company: string;
  location?: string;
  rawText: string;
  parsedRequirements: ParsedJobRequirements;
  status: 'parsed' | 'processing' | 'error';
  userCorrectionsApplied: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobDescriptionSchema = new Schema<IJobDescriptionDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String },
    rawText: { type: String, required: true },
    parsedRequirements: {
      title: { type: String, default: '' },
      company: { type: String, default: '' },
      department: { type: String },
      location: { type: String },
      seniorityLevel: { type: String },
      employmentType: { type: String },
      salaryRange: { type: String },
      summary: { type: String, default: '' },
      mandatoryRequirements: [
        {
          id: { type: String, required: true },
          text: { type: String, required: true },
          category: { type: String, default: 'mandatory' },
          type: { type: String, default: 'skill' },
          weight: { type: Number, default: 70 },
        },
      ],
      preferredRequirements: [
        {
          id: { type: String, required: true },
          text: { type: String, required: true },
          category: { type: String, default: 'preferred' },
          type: { type: String, default: 'skill' },
          weight: { type: Number, default: 40 },
        },
      ],
      optionalRequirements: [
        {
          id: { type: String, required: true },
          text: { type: String, required: true },
          category: { type: String, default: 'optional' },
          type: { type: String, default: 'skill' },
          weight: { type: Number, default: 20 },
        },
      ],
      keySkills: [{ type: String }],
      softSkills: [{ type: String }],
      domainKeywords: [{ type: String }],
    },
    status: {
      type: String,
      enum: ['parsed', 'processing', 'error'],
      default: 'parsed',
    },
    userCorrectionsApplied: { type: Boolean, default: false },
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

JobDescriptionSchema.index({ userId: 1, createdAt: -1 });
JobDescriptionSchema.index({ userId: 1, company: 1 });

export const JobDescription = mongoose.model<IJobDescriptionDoc>('JobDescription', JobDescriptionSchema);

