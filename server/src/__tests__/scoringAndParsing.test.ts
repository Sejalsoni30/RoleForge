import { evaluateATSReadability } from '../services/ats';
import { HeuristicEngine } from '../services/ai/heuristicEngine';
import {
  RegisterSchema,
  LoginSchema,
  ParsedResumeData,
  ParsedJobRequirements,
} from '@roleforge/shared';

describe('RoleForge Semantic Compiler Engine Tests', () => {
  const engine = new HeuristicEngine();

  describe('Validation Schemas', () => {
    it('validates proper user registration data', () => {
      const valid = {
        name: 'Sarah Connor',
        email: 'sarah@skynet-defense.com',
        password: 'securePassword123!',
      };
      expect(() => RegisterSchema.parse(valid)).not.toThrow();
    });

    it('rejects invalid email and short password', () => {
      const invalid = {
        name: 'A',
        email: 'not-an-email',
        password: '123',
      };
      expect(() => RegisterSchema.parse(invalid)).toThrow();
    });

    it('validates user login schema', () => {
      const valid = {
        email: 'user@example.com',
        password: 'mypassword',
      };
      expect(() => LoginSchema.parse(valid)).not.toThrow();
    });
  });

  describe('Resume Parsing & Extraction', () => {
    const rawResumeText = `
Alex Mercer
alex.mercer@gmail.com | (555) 234-5678 | San Francisco, CA
https://linkedin.com/in/alexmercer | https://github.com/alexmercer

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 6 years of experience architecting distributed cloud applications using TypeScript, React, and Node.js.

SKILLS
TypeScript, React, Node.js, Python, PostgreSQL, Docker, AWS, Git, GraphQL

EXPERIENCE
Staff Engineer | Acme Cloud Corp | 2021 - Present
- Architected high-throughput microservices handling 40M daily requests with Node.js and TypeScript.
- Reduced database query latency by 35% using PostgreSQL connection pooling and Redis caching.

Software Engineer | Startup Dynamics | 2018 - 2021
- Developed responsive web interfaces using React, Redux, and Tailwind CSS.

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley | 2014 - 2018
    `.trim();

    it('extracts candidate contact info correctly without hallucinations', async () => {
      const parsed = await engine.parseResumeStructure(rawResumeText);

      expect(parsed.contact.fullName).toContain('Alex Mercer');
      expect(parsed.contact.email).toBe('alex.mercer@gmail.com');
      expect(parsed.contact.phone).toContain('555');
      expect(parsed.contact.linkedin).toBe('https://linkedin.com/in/alexmercer');
      expect(parsed.contact.github).toBe('https://github.com/alexmercer');
    });

    it('extracts technical skills present in text', async () => {
      const parsed = await engine.parseResumeStructure(rawResumeText);
      expect(parsed.skills.technical).toContain('TypeScript');
      expect(parsed.skills.technical).toContain('React');
      expect(parsed.skills.technical).toContain('Node.js');
      expect(parsed.skills.technical).toContain('PostgreSQL');
    });

    it('extracts work history and achievements', async () => {
      const parsed = await engine.parseResumeStructure(rawResumeText);
      expect(parsed.experience.length).toBeGreaterThanOrEqual(1);
      expect(parsed.experience[0].highlights.length).toBeGreaterThan(0);
    });
  });

  describe('Job Description Parsing & Requirement Categorization', () => {
    const rawJobText = `
Senior Software Engineer
Stripe | Financial Infrastructure

About the Role:
We are looking for a Senior Software Engineer to build scalable payment systems.

Must Have Qualifications:
- 4+ years of professional experience with TypeScript and Node.js
- Hands-on experience with PostgreSQL and database optimizations
- Proven track record designing scalable microservices

Nice to Have / Preferred:
- Experience with AWS and containerized workflows (Docker)
- Familiarity with financial transactions and payment compliance
    `.trim();

    it('categorizes mandatory versus preferred requirements accurately', async () => {
      const parsedJob = await engine.parseJobRequirements(rawJobText);

      expect(parsedJob.title).toContain('Software Engineer');
      expect(parsedJob.mandatoryRequirements.length).toBeGreaterThan(0);
      expect(parsedJob.mandatoryRequirements[0].category).toBe('mandatory');
      expect(parsedJob.preferredRequirements.length).toBeGreaterThan(0);
      expect(parsedJob.preferredRequirements[0].category).toBe('preferred');
      expect(parsedJob.keySkills).toContain('TypeScript');
    });
  });

  describe('Evidence Grounding & Transparent Weighted Match Scoring', () => {
    const mockResume: ParsedResumeData = {
      contact: {
        fullName: 'Alex Mercer',
        email: 'alex@example.com',
        phone: '555-123-4567',
        location: 'Remote',
      },
      summary: 'Experienced TypeScript and Node.js backend developer.',
      skills: {
        technical: ['TypeScript', 'Node.js', 'React', 'PostgreSQL'],
        soft: ['Problem Solving'],
        tools: ['Docker', 'Git'],
        languages: ['English'],
      },
      experience: [
        {
          id: 'exp-1',
          company: 'Acme Cloud',
          position: 'Senior Engineer',
          startDate: '2020',
          endDate: 'Present',
          current: true,
          description: 'Hands-on experience with TypeScript and Node.js in production environments.',
          highlights: ['Hands-on experience with TypeScript and Node.js in production environments.'],
        },
      ],
      education: [
        {
          id: 'edu-1',
          institution: 'UC Berkeley',
          degree: 'BS',
          fieldOfStudy: 'Computer Science',
          highlights: [],
        },
      ],
      projects: [],
      certifications: [],
      customSections: [],
    };

    const mockJob: ParsedJobRequirements = {
      title: 'Senior Software Engineer',
      company: 'Stripe',
      summary: 'Payment infrastructure role',
      mandatoryRequirements: [
        {
          id: 'req-1',
          text: 'Hands-on experience with TypeScript and Node.js in production',
          category: 'mandatory',
          type: 'skill',
          weight: 80,
        },
        {
          id: 'req-2',
          text: 'Experience with Kubernetes clustering and service mesh',
          category: 'mandatory',
          type: 'skill',
          weight: 75,
        },
      ],
      preferredRequirements: [
        {
          id: 'req-3',
          text: 'Familiarity with PostgreSQL performance tuning',
          category: 'preferred',
          type: 'skill',
          weight: 40,
        },
      ],
      optionalRequirements: [],
      keySkills: ['TypeScript', 'Node.js', 'Kubernetes', 'PostgreSQL'],
      softSkills: [],
      domainKeywords: [],
    };

    it('evaluates match with evidence grounded in resume text', async () => {
      const match = await engine.evaluateMatchAndEvidence(mockResume, mockJob);

      expect(match.overallScore).toBeGreaterThan(0);
      expect(match.overallScore).toBeLessThanOrEqual(100);
      expect(match.scoreLabel).toBe('RoleForge Alignment Estimate');

      // Check evidence links
      const tsReq = match.evidenceLinks.find((e) => e.requirementId === 'req-1');
      expect(tsReq).toBeDefined();
      expect(tsReq?.status).toBe('matched');
      expect(tsReq?.matchedTextInResume.toLowerCase()).toContain('typescript');

      // Check missing skill
      const k8sReq = match.evidenceLinks.find((e) => e.requirementId === 'req-2');
      expect(k8sReq).toBeDefined();
      expect(['not_mentioned', 'not_demonstrated']).toContain(k8sReq?.status);
    });

    it('generates non-hallucinatory optimization suggestions with user question prompts', async () => {
      const match = await engine.evaluateMatchAndEvidence(mockResume, mockJob);
      const suggestions = await engine.generateOptimizations(
        mockResume,
        mockJob,
        match.evidenceLinks
      );

      expect(suggestions.length).toBeGreaterThan(0);
      const metricReq = suggestions.find((s) => s.requiresUserData);
      if (metricReq) {
        expect(metricReq.userPromptQuestion).toBeDefined();
      }
    });
  });

  describe('ATS Readability Check', () => {
    it('scores a complete resume as ATS safe (>75)', () => {
      const completeResume: ParsedResumeData = {
        contact: {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          phone: '555-555-5555',
          location: 'San Francisco, CA',
        },
        summary: 'Accomplished engineering leader with 10 years of experience delivering cloud platforms.',
        skills: {
          technical: ['Java', 'Go', 'Kubernetes', 'AWS', 'Distributed Systems'],
          soft: ['Team Leadership', 'Mentorship'],
          tools: ['Terraform', 'Docker'],
          languages: ['English'],
        },
        experience: [
          {
            id: 'exp-1',
            company: 'Tech Giants Inc.',
            position: 'Principal Engineer',
            startDate: '2018',
            endDate: 'Present',
            current: true,
            description: 'Directed cloud transformation.',
            highlights: [
              'Architected Kubernetes multi-cluster platform reducing compute costs by 22%',
              'Mentored 15 junior and mid-level engineers',
            ],
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Stanford University',
            degree: 'Master of Science',
            fieldOfStudy: 'Computer Science',
            highlights: [],
          },
        ],
        projects: [],
        certifications: [],
        customSections: [],
      };

      const result = evaluateATSReadability(completeResume);
      expect(result.score).toBeGreaterThanOrEqual(75);
      expect(result.isAtsSafe).toBe(true);
      expect(result.contactDetailsComplete).toBe(true);
    });

    it('flags critical severity issues when email is missing', () => {
      const missingEmailResume: ParsedResumeData = {
        contact: {
          fullName: 'Jane Doe',
          email: '', // Missing
          phone: '555-555-5555',
          location: 'Remote',
        },
        summary: 'Professional summary',
        skills: { technical: ['JavaScript'], soft: [], tools: [], languages: [] },
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        customSections: [],
      };

      const result = evaluateATSReadability(missingEmailResume);
      expect(result.isAtsSafe).toBe(false);
      expect(result.issues.some((i) => i.type === 'missing_email')).toBe(true);
    });
  });
});
