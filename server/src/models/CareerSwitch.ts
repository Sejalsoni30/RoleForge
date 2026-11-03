import mongoose, { Document, Schema } from 'mongoose';

export interface ICareerSwitchDoc extends Document {
  userId: mongoose.Types.ObjectId;
  currentRole: string;
  targetRole: string;
  transferableSkills: string[];
  missingFoundations: string[];
  bridgeProjects: Array<{
    title: string;
    description: string;
    skillsDemonstrated: string[];
    portfolioImpact: string;
  }>;
  timelineMonths: number;
  milestones: Array<{
    month: number;
    goal: string;
    tasks: string[];
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CareerSwitchSchema = new Schema<ICareerSwitchDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    currentRole: { type: String, required: true },
    targetRole: { type: String, required: true },
    transferableSkills: [{ type: String }],
    missingFoundations: [{ type: String }],
    bridgeProjects: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        skillsDemonstrated: [{ type: String }],
        portfolioImpact: { type: String },
      },
    ],
    timelineMonths: { type: Number, default: 6 },
    milestones: [
      {
        month: { type: Number, required: true },
        goal: { type: String, required: true },
        tasks: [{ type: String }],
      },
    ],
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

CareerSwitchSchema.index({ userId: 1, targetRole: 1 });

export const CareerSwitch = mongoose.model<ICareerSwitchDoc>('CareerSwitch', CareerSwitchSchema);

