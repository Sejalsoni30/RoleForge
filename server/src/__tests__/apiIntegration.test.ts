import request from 'supertest';
import app from '../index';
import { connectDB, disconnectDB } from '../config/db';

describe('RoleForge REST API Integration Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  let authToken = '';
  let resumeId = '';
  let jobId = '';

  it('GET /health returns healthy service status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/system/status returns active db and engine status', async () => {
    const res = await request(app).get('/api/system/status');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.database.connected).toBe(true);
  });

  it('POST /api/auth/register registers a new user with token', async () => {
    const testUser = {
      name: 'Integration Test User',
      email: `test-${Date.now()}@roleforge.io`,
      password: 'password123!',
    };

    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);

    authToken = res.body.data.token;
  });

  it('GET /api/auth/me returns authenticated profile with token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Integration Test User');
  });

  it('POST /api/resumes/text creates and parses a resume', async () => {
    const resumePayload = {
      title: 'Full Stack Engineer 2025',
      text: `
John Matrix
john@matrix.io | (555) 019-2834
https://github.com/johnmatrix

Summary:
Full-stack software developer with 5 years experience building web applications using React and Node.js.

Skills:
React, TypeScript, Node.js, Express, MongoDB, Git

Experience:
Senior Engineer | Cyberdyne Systems | 2021 - Present
- Built high-speed distributed services and customer interfaces.
      `.trim(),
    };

    const res = await request(app)
      .post('/api/resumes/text')
      .set('Authorization', `Bearer ${authToken}`)
      .send(resumePayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.parsedData.skills.technical).toContain('TypeScript');

    resumeId = res.body.data.id;
  });

  it('POST /api/jobs creates and parses job description', async () => {
    const jobPayload = {
      title: 'Senior Frontend Engineer',
      company: 'Vercel',
      rawText: `
Job Title: Senior Frontend Engineer
Company: Vercel

About the role:
We are looking for an experienced Frontend Engineer with strong TypeScript and React skills.

Requirements:
- 4+ years of professional React experience
- Deep proficiency with modern TypeScript and component libraries
- Experience working with high-performance web tooling
      `.trim(),
    };

    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${authToken}`)
      .send(jobPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.parsedRequirements.mandatoryRequirements.length).toBeGreaterThan(0);

    jobId = res.body.data.id;
  });

  it('POST /api/matches/compile compiles alignment score and evidence links', async () => {
    const res = await request(app)
      .post('/api/matches/compile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        resumeId,
        jobDescriptionId: jobId,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.match.overallScore).toBeGreaterThanOrEqual(0);
    expect(res.body.data.match.evidenceLinks.length).toBeGreaterThan(0);
    expect(res.body.data.match.scoreLabel).toBe('RoleForge Alignment Estimate');
  });

  it('POST /api/builder/ats-check verifies ATS readability', async () => {
    const resumeRes = await request(app)
      .get(`/api/resumes/${resumeId}`)
      .set('Authorization', `Bearer ${authToken}`);

    const res = await request(app)
      .post('/api/builder/ats-check')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: resumeRes.body.data.parsedData });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.score).toBeGreaterThan(50);
  });

  it('DELETE /api/auth/account completely wipes user account and records', async () => {
    const res = await request(app)
      .delete('/api/auth/account')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify user no longer exists
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);
    expect(meRes.status).toBe(401);
  });
});

