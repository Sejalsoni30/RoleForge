import {
  ParsedResumeData,
  ParsedJobRequirements,
  CategoryScore,
  EvidenceLink,
  OptimizationSuggestion,
  CoverLetterTone,
  InterviewQuestion,
  ICareerSwitchRoadmap,
} from '@roleforge/shared';

export interface EvaluatedMatchPayload {
  overallScore: number;
  scoreLabel: string;
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
}

export interface IAIService {
  providerName: 'gemini' | 'openai' | 'heuristic-engine';
  parseResumeStructure(rawText: string): Promise<ParsedResumeData>;
  parseJobRequirements(rawText: string): Promise<ParsedJobRequirements>;
  evaluateMatchAndEvidence(
    resume: ParsedResumeData,
    job: ParsedJobRequirements
  ): Promise<EvaluatedMatchPayload>;
  generateOptimizations(
    resume: ParsedResumeData,
    job: ParsedJobRequirements,
    evidence: EvidenceLink[]
  ): Promise<OptimizationSuggestion[]>;
  generateCoverLetter(
    resume: ParsedResumeData,
    job: ParsedJobRequirements,
    tone: CoverLetterTone
  ): Promise<{ content: string; highlightedSkills: string[] }>;
  generateInterviewSession(
    resume: ParsedResumeData,
    job: ParsedJobRequirements
  ): Promise<{ roleTarget: string; questions: InterviewQuestion[] }>;
  evaluateInterviewAnswer(
    question: InterviewQuestion,
    userAnswer: string
  ): Promise<{
    score: number;
    strengths: string[];
    improvements: string[];
    keyMissedPoints: string[];
    suggestedRefinement: string;
  }>;
  generateCareerSwitch(
    currentRole: string,
    targetRole: string,
    currentSkills: string[]
  ): Promise<Omit<ICareerSwitchRoadmap, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;
}

