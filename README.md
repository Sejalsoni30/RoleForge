# RoleForge – Resume-to-Job Compiler

RoleForge is a production-grade, enterprise-ready SaaS platform that functions as an optimizing compiler for candidate career assets. It deterministically compiles candidate resumes against target job specifications, highlights verifiable textual evidence, identifies authentic skill gaps, and tailors ATS-compliant resumes and cover letters without fabricating qualifications.

---

## ⚡ Prime Directive Compliance

1. **Zero Fake Data or Analytics**: RoleForge never fabricates metrics, placeholder AI output, or fake statistics. Every score is an independent estimate computed from real requirement intersection.
2. **Clear In-App Setup Messages**: If external cloud providers (Gemini, OpenAI, Google OAuth, Cloudinary, MongoDB URI) are unconfigured, RoleForge gracefully operates on its built-in Semantic Heuristic Engine & embedded in-memory MongoDB, and renders clear in-app configuration pills and setup instructions.
3. **Evidence Grounded**: All match evaluations link directly back to specific sentences and sections in the candidate's resume, clearly distinguishing between:
   - `Verified Match`
   - `Partially Demonstrated`
   - `Not Mentioned`
   - `Not Demonstrated`
   - `Explicitly Missing`
4. **Data Retention & Privacy Rights**: Zero uploaded resumes are used for AI model training. User account deletion permanently purges all documents across all 12 database collections.

---

## 🚀 12-Step End-to-End User Journey (Verified)

1. **Sign Up & Account Creation**: Register with secure password hashing (`bcryptjs`) or Google OAuth.
2. **Personalized Onboarding**: Configure current role, aspirational target title, target industry, and ATS optimization aggressiveness.
3. **Resume Ingestion**: Upload native PDF, DOCX, or paste text. Native text extraction with automatic `tesseract.js` OCR fallback for scanned images.
4. **Target Job Parsing**: Paste any job description to automatically categorize criteria into Mandatory, Preferred, and Optional requirements with full user override capabilities.
5. **Alignment & Evidence Compilation**: Generate the RoleForge Alignment Estimate with weighted scoring breakdowns and exact sentence citations.
6. **Skill Gap Audit & Action Roadmap**: Inspect missing qualifications organized into an actionable learning roadmap (`learning`, `completed`, `already_known`) without auto-inserting unverified skills into resumes.
7. **Optimization Studio**: Review side-by-side proposed bullet improvements with Accept, Reject, Edit, and Undo controls. When metrics are missing, the compiler explicitly asks the user for real numbers.
8. **Resume Builder**: Select from 7 verifiable ATS-friendly templates (`ats-classic`, `modern-minimal`, `executive-refined`, etc.), edit sections in real time, and auto-save versions.
9. **Live ATS Readability Audit**: Run automated checks for parseable word counts, header recognizability, and contact completeness with severity-flagged fixes.
10. **Multi-Format Export**: Download tailored resumes in Single-Column ATS PDF, Word DOCX, or Plain TXT formats.
11. **Tailored Cover Letter**: Generate role-specific cover letters across 4 selectable tones (`modern`, `formal`, `conversational`, `technical`).
12. **Interview Studio & Application CRM**: Practice role-tailored mock behavioral/technical questions with optional Web Speech API voice input and grading rubrics, then track applications from submission to offer.

---

## 🛠 Monorepo Architecture

```
RoleForge/
├── client/                     # Vite + React 18 + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── api/                # Typed API client with auto-JWT headers
│   │   ├── components/         # Atomic UI kit, modals, shells
│   │   │   ├── ui/             # Button, Input, Textarea, Card, Badge, Modal, ConfirmDialog, Skeleton
│   │   │   ├── motion/         # Three.js 3D ParticleField, MagneticButton, ScoreRing
│   │   │   └── layout/         # DashboardLayout, LandingNavbar, ProtectedRoute
│   │   ├── contexts/           # AuthContext, ToastContext
│   │   ├── pages/              # Landing, Auth, Resumes, Jobs, Matching, Gaps, Studio, Builder, Interviews, Tracker, CareerSwitch
│   │   └── index.css           # Tailwind design tokens & accessibility focus rings
│   ├── vercel.json             # Vercel deployment configuration
│   └── package.json
│
├── server/                     # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/             # Environment, Database (MongoDB + MongoMemoryServer fallback)
│   │   ├── controllers/        # Auth, Resume, Job, Match, Gap, Optimization, Builder, Interview, Tracker, CareerSwitch
│   │   ├── middleware/         # Security (Helmet, CORS, RateLimiting, Zod Validator, Multer)
│   │   ├── models/             # 12 Mongoose Collections with Compound Indexes
│   │   ├── services/
│   │   │   ├── ai/             # Multi-provider (Gemini, OpenAI, Heuristic Engine)
│   │   │   ├── parser/         # PDF parser, Mammoth DOCX parser, Tesseract OCR
│   │   │   ├── ats/            # ATS readability verification engine
│   │   │   └── exporter/       # PDFKit ATS builder, docx Word generator, TXT exporter
│   │   └── index.ts            # Server entrypoint
│   ├── render.yaml             # Render deployment configuration
│   └── package.json
│
├── shared/                     # Cross-platform types, contracts & Zod schemas
│   ├── src/
│   │   ├── index.ts            # Typed interfaces, Zod schemas, Design tokens
│   └── package.json
│
├── .env.example
├── package.json                # NPM workspaces root
└── README.md
```

---

## 📊 12 Mongoose Collections & Compound Indexes

1. **`User`**: `{ email: 1 }` (unique), `{ googleId: 1 }` (sparse)
2. **`Resume`**: `{ userId: 1, isArchived: 1 }`, `{ userId: 1, createdAt: -1 }`
3. **`JobDescription`**: `{ userId: 1, createdAt: -1 }`, `{ userId: 1, company: 1 }`
4. **`MatchAnalysis`**: `{ userId: 1, resumeId: 1, jobDescriptionId: 1 }`, `{ resumeId: 1 }`
5. **`SkillGap`**: `{ userId: 1, matchAnalysisId: 1 }`
6. **`Optimization`**: `{ userId: 1, resumeId: 1, jobDescriptionId: 1 }`
7. **`ResumeVersion`**: `{ userId: 1, resumeId: 1, versionNumber: -1 }`
8. **`CoverLetter`**: `{ userId: 1, createdAt: -1 }`
9. **`InterviewSession`**: `{ userId: 1, createdAt: -1 }`
10. **`Application`**: `{ userId: 1, status: 1 }`, `{ userId: 1, appliedDate: -1 }`
11. **`CareerSwitch`**: `{ userId: 1, targetRole: 1 }`
12. **`AuditLog`**: `{ userId: 1, createdAt: -1 }`, `{ entityType: 1, entityId: 1 }`

---

## 🧪 Testing Suite

RoleForge includes comprehensive automated tests covering schema validation, heuristic parsing, semantic matching, ATS audits, and full API integration:

```bash
# Run all server & engine tests
npm test --workspace=@roleforge/server
```

---

## 🏃 Local Development Quickstart

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/roleforge.git
   cd roleforge
   ```

2. **Install all monorepo dependencies**:
   ```bash
   npm install
   ```

3. **Build the shared library**:
   ```bash
   npm run build --workspace=@roleforge/shared
   ```

4. **Start Development Servers (Server & Client concurrently)**:
   ```bash
   npm run dev
   ```

   - **Client**: `http://localhost:5173`
   - **Server API**: `http://localhost:5000`
   - **Embedded In-Memory MongoDB**: Automatically started if no local/remote MongoDB URI is provided!

---

## 🌐 Production Deployment

### Frontend (Vercel)
The `client/` folder is configured with `vercel.json` for single-page routing and API proxying.
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`

### Backend (Render)
The `server/` service is configured with `render.yaml`.
- Build Command: `npm install && npm run build --workspace=@roleforge/shared && npm run build --workspace=@roleforge/server`
- Start Command: `npm run start --workspace=@roleforge/server`
- Environment Variables: Set `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, and optional `GEMINI_API_KEY`.

