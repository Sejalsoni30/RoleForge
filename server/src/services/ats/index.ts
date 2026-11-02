import { ATSCheckResult, ATSIssue, ParsedResumeData } from '@roleforge/shared';

export const evaluateATSReadability = (resumeData: ParsedResumeData): ATSCheckResult => {
  const issues: ATSIssue[] = [];
  let score = 100;

  // 1. Contact Information Check
  if (!resumeData.contact.email) {
    score -= 20;
    issues.push({
      severity: 'critical',
      type: 'missing_email',
      message: 'No email address found.',
      section: 'contact',
      fixRecommendation: 'Add a valid, professional email address at the top of your resume.',
    });
  }

  if (!resumeData.contact.phone) {
    score -= 10;
    issues.push({
      severity: 'warning',
      type: 'missing_phone',
      message: 'No contact phone number detected.',
      section: 'contact',
      fixRecommendation: 'Include a reachable phone number with country/area code.',
    });
  }

  if (!resumeData.contact.fullName) {
    score -= 25;
    issues.push({
      severity: 'critical',
      type: 'missing_name',
      message: 'Full candidate name is missing or unparsed.',
      section: 'contact',
      fixRecommendation: 'Place your full name in primary header text.',
    });
  }

  // 2. Experience Section Check
  if (!resumeData.experience || resumeData.experience.length === 0) {
    score -= 30;
    issues.push({
      severity: 'critical',
      type: 'missing_experience',
      message: 'No work experience section identified.',
      section: 'experience',
      fixRecommendation: 'Add an Experience section with company names, job titles, and dates.',
    });
  } else {
    // Check for bullet points / action verbs
    let hasShortBullets = false;
    resumeData.experience.forEach((exp) => {
      if (!exp.highlights || exp.highlights.length === 0) {
        hasShortBullets = true;
      }
    });

    if (hasShortBullets) {
      score -= 10;
      issues.push({
        severity: 'warning',
        type: 'sparse_bullet_points',
        message: 'Some roles have sparse or missing achievement bullet points.',
        section: 'experience',
        fixRecommendation: 'Use 2-4 bullet points per role starting with strong action verbs.',
      });
    }
  }

  // 3. Skills Section Check
  if (!resumeData.skills || (resumeData.skills.technical.length === 0 && resumeData.skills.tools.length === 0)) {
    score -= 20;
    issues.push({
      severity: 'critical',
      type: 'missing_skills',
      message: 'No dedicated technical skills list identified.',
      section: 'skills',
      fixRecommendation: 'Add a clear "Technical Skills" section for direct ATS keyword indexing.',
    });
  }

  // 4. Education Check
  if (!resumeData.education || resumeData.education.length === 0) {
    score -= 10;
    issues.push({
      severity: 'warning',
      type: 'missing_education',
      message: 'No formal education or academic credentials found.',
      section: 'education',
      fixRecommendation: 'Add your degree, field of study, and institution name.',
    });
  }

  // Word count check
  const totalWords = JSON.stringify(resumeData).split(/\s+/).length;
  if (totalWords < 150) {
    score -= 15;
    issues.push({
      severity: 'warning',
      type: 'low_word_count',
      message: 'Resume content appears sparse (under 150 words).',
      fixRecommendation: 'Expand on your responsibilities, methodologies, and project impact.',
    });
  }

  const finalScore = Math.max(0, Math.min(100, score));

  return {
    score: finalScore,
    isAtsSafe: finalScore >= 75 && !issues.some((i) => i.severity === 'critical'),
    issues,
    parseableWordsCount: totalWords,
    contactDetailsComplete: Boolean(resumeData.contact.fullName && resumeData.contact.email && resumeData.contact.phone),
    unsupportedFormattingDetected: false,
  };
};

