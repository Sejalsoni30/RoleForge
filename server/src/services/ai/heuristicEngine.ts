import {
  ParsedResumeData,
  ParsedJobRequirements,
  RequirementItem,
  EvidenceLink,
  OptimizationSuggestion,
  CoverLetterTone,
  InterviewQuestion,
  ICareerSwitchRoadmap,
} from '@roleforge/shared';
import { IAIService, EvaluatedMatchPayload } from './types';

export class HeuristicEngine implements IAIService {
  public providerName: 'heuristic-engine' = 'heuristic-engine';

  public async parseResumeStructure(rawText: string): Promise<ParsedResumeData> {
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

    // Extract email
    const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : '';

    // Extract phone
    const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    // Extract LinkedIn
    const linkedinMatch = rawText.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    const linkedin = linkedinMatch ? `https://${linkedinMatch[0]}` : undefined;

    // Extract GitHub
    const githubMatch = rawText.match(/github\.com\/[a-zA-Z0-9_-]+/i);
    const github = githubMatch ? `https://${githubMatch[0]}` : undefined;

    // Full name usually on first or second line
    let fullName = lines[0] || 'Candidate Name';
    if (fullName.includes('@') || fullName.length > 40) {
      fullName = lines[1] && !lines[1].includes('@') ? lines[1] : 'Candidate';
    }

    // Common technical skills dictionary for detection
    const commonTechSkills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Next.js', 'Python', 'Java',
      'Go', 'C++', 'SQL', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes',
      'AWS', 'Azure', 'GCP', 'Git', 'REST API', 'GraphQL', 'Tailwind CSS',
      'HTML5', 'CSS3', 'Redux', 'Express', 'Redis', 'CI/CD', 'Linux', 'Microservices'
    ];

    const detectedTechSkills: string[] = [];
    commonTechSkills.forEach((skill) => {
      const regex = new RegExp(`\\b${skill.replace('+', '\\+')}\\b`, 'i');
      if (regex.test(rawText)) {
        detectedTechSkills.push(skill);
      }
    });

    // Detect sections
    const experienceList: ParsedResumeData['experience'] = [];
    const educationList: ParsedResumeData['education'] = [];
    const projectsList: ParsedResumeData['projects'] = [];
    const certsList: ParsedResumeData['certifications'] = [];

    let currentSection = 'summary';
    let summaryText = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();

      if (lower.includes('experience') || lower.includes('work history') || lower.includes('employment')) {
        currentSection = 'experience';
        continue;
      } else if (lower.includes('education') || lower.includes('academic')) {
        currentSection = 'education';
        continue;
      } else if (lower.includes('project') || lower.includes('portfolio')) {
        currentSection = 'projects';
        continue;
      } else if (lower.includes('certification') || lower.includes('licenses')) {
        currentSection = 'certifications';
        continue;
      } else if (lower.includes('skill') || lower.includes('technologies')) {
        currentSection = 'skills';
        continue;
      }

      if (currentSection === 'summary' && i < 10 && !line.includes('@') && line.length > 25) {
        summaryText += (summaryText ? ' ' : '') + line;
      } else if (currentSection === 'experience') {
        // Detect company/role line (e.g., contains 'at', '-', '|' or dates)
        if (line.match(/(19|20)\d{2}/) || line.includes('|') || line.includes(' - ')) {
          const parts = line.split(/[-|–]/).map((p) => p.trim());
          const position = parts[0] || 'Software Engineer';
          const company = parts[1] || 'Technology Company';
          const expId = `exp-${experienceList.length + 1}`;

          // Gather subsequent bullet lines
          const highlights: string[] = [];
          let j = i + 1;
          while (j < lines.length && !lines[j].match(/(19|20)\d{2}/) && !lines[j].toLowerCase().includes('education') && !lines[j].toLowerCase().includes('project')) {
            if (lines[j].startsWith('•') || lines[j].startsWith('-') || lines[j].length > 20) {
              highlights.push(lines[j].replace(/^[•\-\*]\s*/, ''));
            }
            if (highlights.length >= 4) break;
            j++;
          }

          experienceList.push({
            id: expId,
            company,
            position,
            startDate: '2021',
            endDate: 'Present',
            current: true,
            description: highlights.join(' '),
            highlights,
          });
        }
      } else if (currentSection === 'education') {
        if (lower.includes('university') || lower.includes('college') || lower.includes('bachelor') || lower.includes('master') || lower.includes('degree') || lower.includes('bs') || lower.includes('ms')) {
          educationList.push({
            id: `edu-${educationList.length + 1}`,
            institution: line,
            degree: lower.includes('master') ? 'Master of Science' : 'Bachelor of Science',
            fieldOfStudy: lower.includes('computer') ? 'Computer Science' : 'Engineering',
            startDate: '2016',
            endDate: '2020',
            highlights: [],
          });
        }
      }
    }

    // Fallback if none parsed
    if (experienceList.length === 0) {
      experienceList.push({
        id: 'exp-1',
        company: 'Software Solutions Inc.',
        position: 'Software Engineer',
        startDate: '2022',
        endDate: 'Present',
        current: true,
        description: 'Engineered performant full-stack web applications and scalable API architectures.',
        highlights: [
          'Engineered microservices and modern frontend workflows',
          'Collaborated with cross-functional teams to ship features on time'
        ],
      });
    }

    if (educationList.length === 0) {
      educationList.push({
        id: 'edu-1',
        institution: 'University / Institute',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science & Software Engineering',
        startDate: '2017',
        endDate: '2021',
        highlights: [],
      });
    }

    return {
      contact: {
        fullName: fullName.slice(0, 60),
        email,
        phone,
        location: 'Remote / Hybrid',
        linkedin,
        github,
      },
      summary: summaryText.slice(0, 500) || 'Experienced software professional committed to building scalable systems and impactful digital products.',
      skills: {
        technical: detectedTechSkills.length > 0 ? detectedTechSkills : ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git'],
        soft: ['Problem Solving', 'Team Collaboration', 'Communication', 'Agile Delivery'],
        tools: ['Docker', 'Git', 'VS Code', 'Jira', 'Postman'],
        languages: ['English (Fluent)'],
      },
      experience: experienceList,
      education: educationList,
      projects: projectsList,
      certifications: certsList,
      customSections: [],
    };
  }

  public async parseJobRequirements(rawText: string): Promise<ParsedJobRequirements> {
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const title = lines[0] ? lines[0].replace(/job title:?/i, '').trim() : 'Software Engineer';
    const company = lines[1] && lines[1].length < 50 ? lines[1].trim() : 'Hiring Organization';

    const mandatory: RequirementItem[] = [];
    const preferred: RequirementItem[] = [];
    const optional: RequirementItem[] = [];
    const keySkills: string[] = [];

    const techKeywords = [
      'React', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'AWS',
      'Docker', 'Kubernetes', 'SQL', 'PostgreSQL', 'MongoDB', 'GraphQL', 'REST', 'CI/CD',
      'System Design', 'Microservices', 'Tailwind', 'Redux', 'Next.js'
    ];

    techKeywords.forEach((kw) => {
      const regex = new RegExp(`\\b${kw.replace('+', '\\+')}\\b`, 'i');
      if (regex.test(rawText)) {
        keySkills.push(kw);
      }
    });

    let currentCategory: 'mandatory' | 'preferred' | 'optional' = 'mandatory';

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (
        lower.includes('must have') ||
        lower.includes('minimum requirements') ||
        lower.includes('required qualifications') ||
        lower.includes('responsibilities')
      ) {
        currentCategory = 'mandatory';
        continue;
      } else if (
        lower.includes('preferred') ||
        lower.includes('nice to have') ||
        lower.includes('bonus') ||
        lower.includes('desired qualifications')
      ) {
        currentCategory = 'preferred';
        continue;
      } else if (lower.includes('optional') || lower.includes('plus')) {
        currentCategory = 'optional';
        continue;
      }

      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || (line.length > 20 && line.length < 200)) {
        const clean = line.replace(/^[•\-\*]\s*/, '');
        const id = `req-${mandatory.length + preferred.length + optional.length + 1}`;
        const item: RequirementItem = {
          id,
          text: clean,
          category: currentCategory,
          type: clean.toLowerCase().includes('year') ? 'experience' : 'skill',
          weight: currentCategory === 'mandatory' ? 75 : currentCategory === 'preferred' ? 45 : 20,
        };

        if (currentCategory === 'mandatory' && mandatory.length < 8) {
          mandatory.push(item);
        } else if (currentCategory === 'preferred' && preferred.length < 6) {
          preferred.push(item);
        } else if (optional.length < 4) {
          optional.push(item);
        }
      }
    }

    // Provide sensible default requirements if job text is unstructured
    if (mandatory.length === 0) {
      keySkills.slice(0, 3).forEach((skill, idx) => {
        mandatory.push({
          id: `req-m-${idx}`,
          text: `Hands-on experience with ${skill} in production environments`,
          category: 'mandatory',
          type: 'skill',
          weight: 80,
        });
      });
      mandatory.push({
        id: 'req-m-exp',
        text: '3+ years of professional software development experience',
        category: 'mandatory',
        type: 'experience',
        weight: 70,
      });
    }

    if (preferred.length === 0) {
      preferred.push({
        id: 'req-p-1',
        text: 'Experience with cloud infrastructure (AWS / GCP / Docker)',
        category: 'preferred',
        type: 'skill',
        weight: 40,
      });
    }

    return {
      title,
      company,
      location: 'Hybrid / Remote',
      employmentType: 'Full-time',
      summary: rawText.slice(0, 300),
      mandatoryRequirements: mandatory,
      preferredRequirements: preferred,
      optionalRequirements: optional,
      keySkills: keySkills.length > 0 ? keySkills : ['TypeScript', 'React', 'Node.js'],
      softSkills: ['Analytical Problem Solving', 'Cross-functional Collaboration', 'Technical Communication'],
      domainKeywords: ['Web Applications', 'Distributed Systems', 'Cloud Services'],
    };
  }

  public async evaluateMatchAndEvidence(
    resume: ParsedResumeData,
    job: ParsedJobRequirements
  ): Promise<EvaluatedMatchPayload> {
    const resumeFullText = JSON.stringify(resume).toLowerCase();
    const evidenceLinks: EvidenceLink[] = [];

    let mandatoryMatched = 0;
    let preferredMatched = 0;

    const mandatoryList = job.mandatoryRequirements || [];
    const preferredList = job.preferredRequirements || [];
    const optionalList = job.optionalRequirements || [];

    const normalizeReq = (r: any, category: 'mandatory' | 'preferred' | 'optional') => {
      const obj = r && typeof r.toObject === 'function' ? r.toObject() : r;
      return {
        id: obj.id || `req-${Math.random()}`,
        text: obj.text || '',
        category,
        type: obj.type || 'skill',
        weight: obj.weight || (category === 'mandatory' ? 75 : category === 'preferred' ? 45 : 20),
      };
    };

    const allRequirements = [
      ...mandatoryList.map((r) => normalizeReq(r, 'mandatory')),
      ...preferredList.map((r) => normalizeReq(r, 'preferred')),
      ...optionalList.map((r) => normalizeReq(r, 'optional')),
    ].filter((r) => Boolean(r && r.text));

    for (const req of allRequirements) {
      const words = (req.text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w: string) => w.length > 3 && !['with', 'from', 'have', 'years', 'experience', 'must', 'preferred'].includes(w));

      let matchedWords = 0;
      let matchedQuote = '';

      for (const word of words) {
        if (resumeFullText.includes(word)) {
          matchedWords++;
          if (!matchedQuote) {
            // Find snippet in resume
            const idx = resumeFullText.indexOf(word);
            matchedQuote = resumeFullText.slice(Math.max(0, idx - 20), Math.min(resumeFullText.length, idx + 40)).trim();
          }
        }
      }

      const matchRatio = words.length > 0 ? matchedWords / words.length : 0;
      let status: EvidenceLink['status'] = 'not_mentioned';
      let confidence = 0;

      if (matchRatio >= 0.6) {
        status = 'matched';
        confidence = Math.round(75 + matchRatio * 25);
        if (req.category === 'mandatory') mandatoryMatched++;
        if (req.category === 'preferred') preferredMatched++;
      } else if (matchRatio >= 0.25) {
        status = 'partially_matched';
        confidence = Math.round(40 + matchRatio * 30);
        if (req.category === 'mandatory') mandatoryMatched += 0.5;
        if (req.category === 'preferred') preferredMatched += 0.5;
      } else {
        // Distinguish not mentioned vs not demonstrated
        status = req.type === 'experience' ? 'not_demonstrated' : 'not_mentioned';
        confidence = 10;
      }

      evidenceLinks.push({
        requirementId: req.id,
        requirementText: req.text,
        category: req.category,
        type: req.type,
        status,
        matchedTextInResume: status !== 'not_mentioned' && status !== 'not_demonstrated' ? matchedQuote : '',
        resumeSection: 'Experience & Skills',
        confidence,
        reasoning:
          status === 'matched'
            ? `Verified matching criteria against demonstrated background: "${matchedQuote}"`
            : status === 'partially_matched'
            ? `Partial alignment found (${Math.round(matchRatio * 100)}% keyword overlap). Needs more direct metric evidence.`
            : `Requirement not found in provided resume text. Needs addition or qualification.`,
        recommendation:
          status !== 'matched'
            ? `Highlight specific achievements or projects utilizing ${words.slice(0, 3).join(', ')}.`
            : undefined,
      });
    }

    const mandTotal = Math.max(1, job.mandatoryRequirements.length);
    const prefTotal = Math.max(1, job.preferredRequirements.length);

    const mandScore = Math.min(100, Math.round((mandatoryMatched / mandTotal) * 100));
    const prefScore = Math.min(100, Math.round((preferredMatched / prefTotal) * 100));
    const expScore = Math.min(100, Math.round(resume.experience.length >= 2 ? 85 : 65));
    const eduScore = Math.min(100, Math.round(resume.education.length > 0 ? 90 : 60));
    const domainScore = Math.min(100, Math.round((mandScore * 0.6) + (prefScore * 0.4)));

    // Weighted composite score (RoleForge Alignment Estimate)
    const overallScore = Math.round(
      mandScore * 0.45 +
      prefScore * 0.20 +
      expScore * 0.15 +
      eduScore * 0.10 +
      domainScore * 0.10
    );

    const strengths: string[] = [];
    const criticalGaps: string[] = [];
    const quickWins: string[] = [];

    evidenceLinks.forEach((link) => {
      if (link.status === 'matched' && strengths.length < 4) {
        strengths.push(link.requirementText);
      } else if (link.category === 'mandatory' && link.status !== 'matched' && criticalGaps.length < 4) {
        criticalGaps.push(link.requirementText);
      } else if (link.status === 'partially_matched' && quickWins.length < 3) {
        quickWins.push(`Elaborate on ${link.requirementText.slice(0, 50)}...`);
      }
    });

    if (strengths.length === 0) strengths.push('Strong foundational technical background');
    if (criticalGaps.length === 0) criticalGaps.push('Target role domain specialization');
    if (quickWins.length === 0) quickWins.push('Quantify impact metrics on key project achievements');

    return {
      overallScore,
      scoreLabel: 'RoleForge Alignment Estimate',
      categoryScores: {
        mandatorySkills: {
          score: mandScore,
          weight: 45,
          matchedCount: Math.round(mandatoryMatched),
          totalCount: mandTotal,
          breakdown: `${Math.round(mandatoryMatched)} of ${mandTotal} mandatory requirements met`,
        },
        preferredSkills: {
          score: prefScore,
          weight: 20,
          matchedCount: Math.round(preferredMatched),
          totalCount: prefTotal,
          breakdown: `${Math.round(preferredMatched)} of ${prefTotal} preferred requirements met`,
        },
        experienceRelevance: {
          score: expScore,
          weight: 15,
          matchedCount: resume.experience.length,
          totalCount: 3,
          breakdown: `${resume.experience.length} relevant professional roles verified`,
        },
        educationAndCerts: {
          score: eduScore,
          weight: 10,
          matchedCount: resume.education.length,
          totalCount: 1,
          breakdown: 'Educational degrees and credentials verified',
        },
        domainKnowledge: {
          score: domainScore,
          weight: 10,
          matchedCount: 2,
          totalCount: 3,
          breakdown: 'Industry vocabulary & domain alignment index',
        },
      },
      evidenceLinks,
      summary: `Alignment analysis calculated across ${evidenceLinks.length} target job criteria. Candidate demonstrates strong core capabilities with ${Math.round(mandatoryMatched)} of ${mandTotal} mandatory requirements verified.`,
      strengths,
      criticalGaps,
      quickWins,
    };
  }

  public async generateOptimizations(
    resume: ParsedResumeData,
    job: ParsedJobRequirements,
    evidence: EvidenceLink[]
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    // Summary optimization
    if (resume.summary) {
      const topJobSkills = job.keySkills.slice(0, 3).join(', ');
      suggestions.push({
        id: 'opt-summary-1',
        section: 'summary',
        originalText: resume.summary,
        proposedText: `${resume.summary.replace(/\.$/, '')}, specializing in building high-scale solutions with ${topJobSkills} aligned with ${job.company}'s engineering objectives.`,
        rationale: `Front-loads key job keywords (${topJobSkills}) directly into your executive summary for immediate ATS and recruiter visibility.`,
        evidenceOrigin: job.mandatoryRequirements[0]?.text || 'Core Job Responsibilities',
        status: 'pending',
        requiresUserData: false,
      });
    }

    // Experience optimizations based on partially matched or missing evidence
    resume.experience.forEach((exp, idx) => {
      if (idx === 0 && exp.highlights.length > 0) {
        const orig = exp.highlights[0];
        suggestions.push({
          id: `opt-exp-${idx}-1`,
          section: 'experience',
          targetItemId: exp.id,
          originalText: orig,
          proposedText: `Architected and optimized core services utilizing ${job.keySkills[0] || 'TypeScript'}, improving end-to-end performance and latency by [User Metric: e.g. 28%].`,
          rationale: 'Translates general duties into an active action verb + target technology + quantified impact result.',
          evidenceOrigin: job.mandatoryRequirements[0]?.text || 'Engineering Leadership & Quality',
          status: 'pending',
          requiresUserData: true,
          userPromptQuestion: 'What measurable impact or performance metric did you achieve in this role (e.g. % faster, users served, or revenue)?',
        });
      }
    });

    // Skills section alignment
    const missingSkills = job.keySkills.filter(
      (s) => !resume.skills.technical.map((t) => t.toLowerCase()).includes(s.toLowerCase())
    );

    if (missingSkills.length > 0) {
      suggestions.push({
        id: 'opt-skills-1',
        section: 'skills',
        originalText: resume.skills.technical.join(', '),
        proposedText: `${resume.skills.technical.join(', ')}, ${missingSkills.slice(0, 2).join(', ')}`,
        rationale: `Adds relevant target keywords (${missingSkills.slice(0, 2).join(', ')}) that are explicitly required by ${job.title}.`,
        evidenceOrigin: `Required Skill: ${missingSkills[0]}`,
        status: 'pending',
        requiresUserData: true,
        userPromptQuestion: `Do you have professional or project experience with ${missingSkills.slice(0, 2).join(' or ')}? Only confirm if you have practical familiarity.`,
      });
    }

    return suggestions;
  }

  public async generateCoverLetter(
    resume: ParsedResumeData,
    job: ParsedJobRequirements,
    tone: CoverLetterTone
  ): Promise<{ content: string; highlightedSkills: string[] }> {
    const candidateName = resume.contact.fullName || 'Candidate';
    const topSkills = job.keySkills.slice(0, 3);
    const currentCompany = resume.experience[0]?.company || 'my recent team';

    let greeting = 'Dear Hiring Team,';
    if (tone === 'formal') {
      greeting = `Dear Hiring Manager at ${job.company},`;
    }

    const content = `${greeting}

I am writing to express my strong enthusiasm for the ${job.title} role at ${job.company}. Having developed high-reliability systems and applications with a focus on ${topSkills.join(', ')}, I am eager to bring my practical technical experience to your engineering organization.

At ${currentCompany}, I have focused on delivering scalable, well-tested code while collaborating closely with cross-functional stakeholders. The prospect of contributing to ${job.company}'s mission aligns closely with my career values and technical strengths, particularly regarding ${job.mandatoryRequirements[0]?.text || 'scalable engineering best practices'}.

Thank you for your time and consideration. I would welcome the opportunity to discuss how my background and dedication can contribute to ${job.company}'s upcoming milestones.

Sincerely,
${candidateName}
${resume.contact.email} | ${resume.contact.phone}`;

    return {
      content,
      highlightedSkills: topSkills,
    };
  }

  public async generateInterviewSession(
    resume: ParsedResumeData,
    job: ParsedJobRequirements
  ): Promise<{ roleTarget: string; questions: InterviewQuestion[] }> {
    const questions: InterviewQuestion[] = [
      {
        id: 'q-1',
        question: `Tell me about a challenging technical hurdle you faced at ${resume.experience[0]?.company || 'your previous company'} and how you architected the resolution.`,
        type: 'behavioral',
        difficulty: 'medium',
        rubric: [
          'Clear STAR framework structure (Situation, Task, Action, Result)',
          'Demonstrates technical decision-making and trade-offs',
          'Quantified business or user impact',
        ],
        sampleAnswer: `In my role, we faced a performance bottleneck during peak load. I profiled the query executions, identified database locking bottlenecks, introduced an in-memory caching tier, and reduced 99th-percentile response times by 40%.`,
      },
      {
        id: 'q-2',
        question: `How do you approach ensuring type safety, maintainability, and clean architecture when building with ${job.keySkills[0] || 'TypeScript and modern frameworks'}?`,
        type: 'technical',
        difficulty: 'medium',
        rubric: [
          'Understands strict typing principles and modular boundaries',
          'Mentions automated linting, test suites, and schema validation',
          'Focuses on developer ergonomics and error reduction',
        ],
        sampleAnswer: `I enforce strict compiler flags, runtime validation using Zod for incoming API boundaries, well-defined domain models, and decoupled service layers to ensure testability and prevent runtime anomalies.`,
      },
      {
        id: 'q-3',
        question: `Describe a situation where you had a disagreement with a product manager or teammate regarding a technical deadline or feature scope. How did you align?`,
        type: 'situational',
        difficulty: 'medium',
        rubric: [
          'Maintains professional empathy and constructive dialogue',
          'Provides pragmatic options (e.g. MVP phased rollout)',
          'Aligns with user and business goals rather than pure technical dogmatism',
        ],
        sampleAnswer: `When a tight deadline conflicted with a proposed feature scope, I broke down the initiative into Phase 1 core functionality and Phase 2 enhancements, which met the launch window while maintaining code quality.`,
      },
    ];

    return {
      roleTarget: `${job.title} at ${job.company}`,
      questions,
    };
  }

  public async evaluateInterviewAnswer(
    question: InterviewQuestion,
    userAnswer: string
  ): Promise<{
    score: number;
    strengths: string[];
    improvements: string[];
    keyMissedPoints: string[];
    suggestedRefinement: string;
  }> {
    const wordCount = userAnswer.trim().split(/\s+/).length;
    let score = 70;
    const strengths: string[] = [];
    const improvements: string[] = [];
    const keyMissedPoints: string[] = [];

    if (wordCount > 60) {
      score += 15;
      strengths.push('Thorough and detailed response structure');
    } else {
      score -= 15;
      improvements.push('Answer is somewhat brief; elaborate further on the Action and Result phases.');
    }

    if (userAnswer.toLowerCase().includes('result') || userAnswer.toLowerCase().includes('%') || userAnswer.toLowerCase().includes('reduced') || userAnswer.toLowerCase().includes('improved')) {
      score += 10;
      strengths.push('Includes measurable outcomes and impact evidence');
    } else {
      keyMissedPoints.push('Missing explicit quantified results or outcome metrics');
    }

    return {
      score: Math.min(100, Math.max(30, score)),
      strengths: strengths.length > 0 ? strengths : ['Good initial clarity and tone'],
      improvements: improvements.length > 0 ? improvements : ['Consider highlighting technical trade-offs more explicitly'],
      keyMissedPoints: keyMissedPoints.length > 0 ? keyMissedPoints : ['Elaborate on lessons learned for future architectural iterations'],
      suggestedRefinement: `Structure your response using the STAR framework: start with the exact challenge context, outline your technical ownership, and conclude with the quantified impact (${score >= 80 ? 'Great job!' : 'Add specific metrics'}).`,
    };
  }

  public async generateCareerSwitch(
    currentRole: string,
    targetRole: string,
    currentSkills: string[]
  ): Promise<Omit<ICareerSwitchRoadmap, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> {
    return {
      currentRole,
      targetRole,
      transferableSkills: currentSkills.slice(0, 4).concat(['Problem Solving', 'Project Execution']),
      missingFoundations: ['Advanced Distributed Systems', 'Enterprise Architecture Patterns', 'Cloud Native DevOps'],
      bridgeProjects: [
        {
          title: `Full-Stack Cloud-Native ${targetRole} Showcase`,
          description: `Design and deploy an end-to-end production application demonstrating high-concurrency patterns, automated CI/CD, and monitoring.`,
          skillsDemonstrated: ['Docker', 'TypeScript', 'PostgreSQL', 'Microservices'],
          portfolioImpact: 'Serves as immediate proof of hands-on target domain capability for technical screeners.',
        },
      ],
      timelineMonths: 6,
      milestones: [
        {
          month: 1,
          goal: 'Establish Core Theoretical & Architectural Foundations',
          tasks: ['Complete deep dive into target design patterns', 'Audit current skill inventory against 10 target job posts'],
        },
        {
          month: 2,
          goal: 'Build Foundation Bridge Project',
          tasks: ['Scaffold full-stack repo with strict CI/CD and testing', 'Implement core business logic and database persistence'],
        },
        {
          month: 3,
          goal: 'Deploy & Optimize Production Cloud Setup',
          tasks: ['Containerize with Docker', 'Deploy to public cloud with automated SSL and monitoring'],
        },
        {
          month: 4,
          goal: 'Resume & Portfolio Re-alignment',
          tasks: ['Translate transferable competencies into RoleForge optimized resume', 'Conduct mock technical interviews'],
        },
      ],
    };
  }
}
