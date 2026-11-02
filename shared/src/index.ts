import { z } from 'zod';

/* =========================================================================
   DESIGN TOKENS & SYSTEM CONSTANTS
   ========================================================================= */

export const DESIGN_TOKENS = {
  colors: {
    primary: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1', // Electric Indigo
      600: '#4f46e5',
      700: '#4338ca', // Deep Indigo
      800: '#3730a3',
      900: '#312e81',
    },
    surface: {
      white: '#ffffff',
      canvas: '#f8fafc', // Soft blue-tinted light canvas
      card: '#ffffff',
      subtle: '#f1f5f9',
      border: '#e2e8f0',
      borderHover: '#cbd5e1',
    },
    accent: {
      lavenderLight: '#f5f3ff',
      lavender: '#ede9fe',
      lavenderDark: '#ddd6fe',
      sky: '#0284c7',
      emerald: '#059669',
      amber: '#d97706',
      rose: '#e11d48',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      muted: '#64748b',
      inverse: '#ffffff',
    },
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.25rem', // Default card radius per spec
    '3xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    soft: '0 2px 10px -2px rgba(15, 23, 42, 0.04), 0 10px 25px -4px rgba(15, 23, 42, 0.06)',
    card: '0 4px 20px -2px rgba(99, 102, 241, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
    elevated: '0 12px 36px -4px rgba(15, 23, 42, 0.1), 0 4px 12px -2px rgba(15, 23, 42, 0.05)',
  },
  typography: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    display: 'Plus Jakarta Sans, Inter, sans-serif',
  },
} as const;

/* =========================================================================
   USER & AUTH TYPES AND SCHEMAS
   ========================================================================= */

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginDto = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  currentRole: z.string().optional(),
  targetRole: z.string().optional(),
  targetIndustry: z.string().optional(),
  yearsOfExperience: z.number().min(0).max(50).optional(),
  onboardingComplete: z.boolean().optional(),
  preferences: z
    .object({
      emailAlerts: z.boolean().optional(),
      atsOptimizationLevel: z.enum(['balanced', 'aggressive', 'strict-ats']).optional(),
      defaultTemplate: z.string().optional(),
    })
    .optional(),
});
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  googleId?: string;
  onboardingComplete: boolean;
  currentRole?: string;
  targetRole?: string;
  targetIndustry?: string;
  yearsOfExperience?: number;
  preferences: {
    emailAlerts: boolean;
    atsOptimizationLevel: 'balanced' | 'aggressive' | 'strict-ats';
    defaultTemplate: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: IUser;
  token: string;
}

/* =========================================================================
   RESUME TYPES AND SCHEMAS
   ========================================================================= */

export const ContactInfoSchema = z.object({
  fullName: z.string().default(''),
  email: z.string().default(''),
  phone: z.string().default(''),
  location: z.string().default(''),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  website: z.string().optional(),
});
export type ContactInfo = z.infer<typeof ContactInfoSchema>;

export const ExperienceItemSchema = z.object({
  id: z.string(),
  company: z.string(),
  position: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(), // 'Present' or ISO date
  current: z.boolean().default(false),
  description: z.string(),
  highlights: z.array(z.string()).default([]),
});
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;

export const EducationItemSchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string(),
  fieldOfStudy: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  highlights: z.array(z.string()).default([]),
});
export type EducationItem = z.infer<typeof EducationItemSchema>;

export const ProjectItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()).default([]),
  link: z.string().optional(),
  highlights: z.array(z.string()).default([]),
});
export type ProjectItem = z.infer<typeof ProjectItemSchema>;

export const CertificationItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialUrl: z.string().optional(),
});
export type CertificationItem = z.infer<typeof CertificationItemSchema>;

export const ParsedResumeDataSchema = z.object({
  contact: ContactInfoSchema,
  summary: z.string().default(''),
  skills: z.object({
    technical: z.array(z.string()).default([]),
    soft: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([]),
    languages: z.array(z.string()).default([]),
  }),
  experience: z.array(ExperienceItemSchema).default([]),
  education: z.array(EducationItemSchema).default([]),
  projects: z.array(ProjectItemSchema).default([]),
  certifications: z.array(CertificationItemSchema).default([]),
  customSections: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
      })
    )
    .default([]),
});
export type ParsedResumeData = z.infer<typeof ParsedResumeDataSchema>;

export interface IResume {
  id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
}

/* =========================================================================
   JOB DESCRIPTION TYPES AND SCHEMAS
   ========================================================================= */

export const RequirementItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  category: z.enum(['mandatory', 'preferred', 'optional']),
  type: z.enum(['skill', 'experience', 'education', 'certification', 'domain_knowledge', 'soft_skill']),
  weight: z.number().min(0).max(100).default(50),
});
export type RequirementItem = z.infer<typeof RequirementItemSchema>;

export const ParsedJobRequirementsSchema = z.object({
  title: z.string(),
  company: z.string().default('Target Company'),
  department: z.string().optional(),
  location: z.string().optional(),
  seniorityLevel: z.string().optional(),
  employmentType: z.string().optional(),
  salaryRange: z.string().optional(),
  summary: z.string().default(''),
  mandatoryRequirements: z.array(RequirementItemSchema).default([]),
  preferredRequirements: z.array(RequirementItemSchema).default([]),
  optionalRequirements: z.array(RequirementItemSchema).default([]),
  keySkills: z.array(z.string()).default([]),
  softSkills: z.array(z.string()).default([]),
  domainKeywords: z.array(z.string()).default([]),
});
export type ParsedJobRequirements = z.infer<typeof ParsedJobRequirementsSchema>;

export interface IJobDescription {
  id: string;
  userId: string;
  title: string;
  company: string;
  location?: string;
  rawText: string;
  parsedRequirements: ParsedJobRequirements;
  status: 'parsed' | 'processing' | 'error';
  userCorrectionsApplied: boolean;
  createdAt: string;
  updatedAt: string;
}

/* =========================================================================
   MATCHING ENGINE & EVIDENCE TYPES
   ========================================================================= */

export type EvidenceStatus =
  | 'matched'
  | 'partially_matched'
  | 'not_mentioned'
  | 'not_demonstrated'
  | 'explicitly_unavailable';

export const EvidenceLinkSchema = z.object({
  requirementId: z.string(),
  requirementText: z.string(),
  category: z.enum(['mandatory', 'preferred', 'optional']),
  type: z.string(),
  status: z.enum([
    'matched',
    'partially_matched',
    'not_mentioned',
    'not_demonstrated',
    'explicitly_unavailable',
  ]),
  matchedTextInResume: z.string().default(''),
  resumeSection: z.string().optional(),
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  recommendation: z.string().optional(),
});
export type EvidenceLink = z.infer<typeof EvidenceLinkSchema>;

export const CategoryScoreSchema = z.object({
  score: z.number().min(0).max(100),
  weight: z.number(),
  matchedCount: z.number(),
  totalCount: z.number(),
  breakdown: z.string(),
});
export type CategoryScore = z.infer<typeof CategoryScoreSchema>;

export interface IMatchAnalysis {
  id: string;
  userId: string;
  resumeId: string;
  jobDescriptionId: string;
  overallScore: number;
  scoreLabel: string; // "RoleForge Alignment Estimate" (strictly independent estimate)
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
  createdAt: string;
  updatedAt: string;
}

/* =========================================================================
   SKILL GAP ANALYZER & ROADMAP
   ========================================================================= */

export type SkillRoadmapStatus = 'learning' | 'completed' | 'already_known';

export const SkillRoadmapItemSchema = z.object({
  id: z.string(),
  skill: z.string(),
  importance: z.enum(['critical', 'high', 'medium', 'bonus']),
  category: z.string(),
  status: z.enum(['learning', 'completed', 'already_known']).default('learning'),
  estimatedHours: z.number().default(10),
  actionPlan: z.string(),
  recommendedResources: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().optional(),
        type: z.enum(['course', 'doc', 'project', 'book']),
      })
    )
    .default([]),
});
export type SkillRoadmapItem = z.infer<typeof SkillRoadmapItemSchema>;

export interface ISkillGap {
  id: string;
  userId: string;
  matchAnalysisId: string;
  missingMandatory: string[];
  missingPreferred: string[];
  roadmap: SkillRoadmapItem[];
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

/* =========================================================================
   OPTIMIZATION STUDIO
   ========================================================================= */

export type OptimizationStatus = 'pending' | 'accepted' | 'rejected' | 'edited';

export const OptimizationSuggestionSchema = z.object({
  id: z.string(),
  section: z.enum(['summary', 'experience', 'skills', 'projects']),
  targetItemId: z.string().optional(), // Experience ID or Project ID
  originalText: z.string(),
  proposedText: z.string(),
  rationale: z.string(),
  evidenceOrigin: z.string(), // Exact requirement from JD this targets
  status: z.enum(['pending', 'accepted', 'rejected', 'edited']).default('pending'),
  editedText: z.string().optional(),
  requiresUserData: z.boolean().default(false),
  userPromptQuestion: z.string().optional(), // Prompt if missing metric/tool
});
export type OptimizationSuggestion = z.infer<typeof OptimizationSuggestionSchema>;

export interface IOptimization {
  id: string;
  userId: string;
  resumeId: string;
  jobDescriptionId: string;
  suggestions: OptimizationSuggestion[];
  status: 'draft' | 'applied';
  createdAt: string;
  updatedAt: string;
}

/* =========================================================================
   RESUME BUILDER & TEMPLATES
   ========================================================================= */

export type ResumeTemplateId =
  | 'ats-classic' // Clean single column, maximum ATS compatibility
  | 'modern-minimal'
  | 'executive-refined'
  | 'technical-compact'
  | 'creative-bold'
  | 'academic-standard'
  | 'hybrid-modern';

export interface ATSIssue {
  severity: 'critical' | 'warning' | 'info';
  type: string;
  message: string;
  section?: string;
  fixRecommendation: string;
}

export interface ATSCheckResult {
  score: number; // 0 to 100
  isAtsSafe: boolean;
  issues: ATSIssue[];
  parseableWordsCount: number;
  contactDetailsComplete: boolean;
  unsupportedFormattingDetected: boolean;
}

export interface IResumeVersion {
  id: string;
  userId: string;
  resumeId: string;
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
  createdAt: string;
  updatedAt: string;
}

/* =========================================================================
   COVER LETTER GENERATOR
   ========================================================================= */

export type CoverLetterTone = 'formal' | 'conversational' | 'modern' | 'technical';

export interface ICoverLetter {
  id: string;
  userId: string;
  resumeId: string;
  jobDescriptionId: string;
  title: string;
  recipientName?: string;
  recipientTitle?: string;
  companyName: string;
  content: string;
  tone: CoverLetterTone;
  highlightedSkills: string[];
  status: 'draft' | 'final';
  createdAt: string;
  updatedAt: string;
}

/* =========================================================================
   INTERVIEW STUDIO
   ========================================================================= */

export type InterviewQuestionType =
  | 'behavioral'
  | 'technical'
  | 'situational'
  | 'culture_fit'
  | 'case_study';

export interface InterviewQuestion {
  id: string;
  question: string;
  type: InterviewQuestionType;
  difficulty: 'easy' | 'medium' | 'hard';
  rubric: string[];
  sampleAnswer: string;
  userAnswer?: string;
  userAudioUrl?: string;
  feedback?: {
    score: number; // 0 - 100
    strengths: string[];
    improvements: string[];
    keyMissedPoints: string[];
    suggestedRefinement: string;
  };
}

export interface IInterviewSession {
  id: string;
  userId: string;
  resumeId: string;
  jobDescriptionId: string;
  roleTarget: string;
  questions: InterviewQuestion[];
  overallFeedback?: {
    overallScore: number;
    readinessRating: 'Ready' | 'Needs Practice' | 'Significant Gaps';
    summary: string;
  };
  createdAt: string;
  updatedAt: string;
}

/* =========================================================================
   APPLICATION TRACKER (CRM)
   ========================================================================= */

export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'interviewing'
  | 'offered'
  | 'rejected'
  | 'withdrawn';

export interface ApplicationReminder {
  id: string;
  date: string;
  note: string;
  completed: boolean;
}

export interface IApplication {
  id: string;
  userId: string;
  company: string;
  role: string;
  jobDescriptionId?: string;
  resumeVersionId?: string;
  coverLetterId?: string;
  status: ApplicationStatus;
  appliedDate?: string;
  salary?: string;
  location?: string;
  jobUrl?: string;
  notes?: string;
  matchScore?: number;
  reminders: ApplicationReminder[];
  createdAt: string;
  updatedAt: string;
}

/* =========================================================================
   CAREER SWITCH ROADMAP
   ========================================================================= */

export interface ICareerSwitchRoadmap {
  id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
}

/* =========================================================================
   SYSTEM INTEGRATIONS STATUS
   ========================================================================= */

export interface SystemStatusResponse {
  healthy: boolean;
  timestamp: string;
  environment: string;
  database: {
    connected: boolean;
    provider: 'local-mongodb' | 'atlas-mongodb' | 'memory-mongodb';
    message: string;
  };
  ai: {
    configured: boolean;
    activeProvider: 'gemini' | 'openai' | 'heuristic-engine';
    model: string;
    message: string;
  };
  ocr: {
    available: boolean;
    engine: 'tesseract.js';
  };
  fileStorage: {
    configured: boolean;
    driver: 'local-disk' | 'cloudinary';
  };
}

