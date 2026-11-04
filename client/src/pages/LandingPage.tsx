import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { LandingNavbar } from '../components/layout/LandingNavbar';
import { LandingFooter } from '../components/layout/LandingFooter';
import { ParticleField3D } from '../components/motion/ParticleField3D';
import { MagneticButton } from '../components/motion/MagneticButton';
import { ScoreRing } from '../components/motion/ScoreRing';
import { Button } from '../components/ui/Button';
import {
  FileText,
  Briefcase,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Cpu,
  Layers,
  Zap,
  TrendingUp,
  Award,
  ChevronRight,
  ChevronDown,
  Star,
  Terminal,
  Palette,
  Eye,
  Check,
  HelpCircle,
  Users,
  Compass,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [heroHovered, setHeroHovered] = useState(false);
  const [chipMatched, setChipMatched] = useState(true);

  // Before / After interactive toggle
  const [demoState, setDemoState] = useState<'before' | 'after'>('after');

  // Interactive template showcase
  const [activeTemplate, setActiveTemplate] = useState<string>('ats-classic');

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Scroll animations for pipeline section
  const { scrollYProgress } = useScroll();
  const pipelineScale = useTransform(scrollYProgress, [0.1, 0.3], [0.95, 1]);
  const pipelineOpacity = useTransform(scrollYProgress, [0.08, 0.2], [0.5, 1]);

  const showcaseTemplates = [
    {
      id: 'ats-classic',
      name: 'ATS Classic',
      badge: '100% Parser Compliant',
      desc: 'Single-column black & white layout with crisp horizontal dividers. Designed to pass Workday, Taleo, and Greenhouse with zero extraction errors.',
      tagColor: 'bg-slate-100 text-slate-800 border-slate-200',
    },
    {
      id: 'modern-minimal',
      name: 'Modern Minimal',
      badge: 'Tech & SaaS Standard',
      desc: 'Contemporary sans-serif typography with subtle slate and indigo accents, timeline dots, and clean skill badges.',
      tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      id: 'executive-refined',
      name: 'Executive Refined',
      badge: 'C-Suite & Leadership',
      desc: 'Stately serif typography with centered header, decorative hairline border rules, and distinguished executive spacing.',
      tagColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 'technical-compact',
      name: 'Technical Compact',
      badge: 'Software & DevOps',
      desc: 'High-density developer layout with monospace skill chips, terminal status header, and categorized framework groupings.',
      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      id: 'creative-bold',
      name: 'Creative Bold',
      badge: 'Design & Product',
      desc: 'Eye-catching visual gradient banner with colored badge section headers and standout typographic hierarchy.',
      tagColor: 'bg-violet-50 text-violet-800 border-violet-200',
    },
    {
      id: 'academic-standard',
      name: 'Academic Standard',
      badge: 'Research & CV',
      desc: 'Traditional academic curriculum vitae format with Education placed first, hanging citations, and formal serif structure.',
      tagColor: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    {
      id: 'hybrid-modern',
      name: 'Hybrid Modern',
      badge: '2-Column Skimmable',
      desc: 'High-impact split layout: left column highlights contact info, credentials, and skills; right column details career impact.',
      tagColor: 'bg-blue-50 text-blue-800 border-blue-200',
    },
  ];

  const faqs = [
    {
      q: 'How does RoleForge prevent AI hallucinations and fake credentials?',
      a: 'Unlike generic ChatGPT wrappers that invent employment history, RoleForge is a deterministic compiler. It strictly maps your existing resume text to the target job description. When an experience bullet lacks a quantitative metric, it generates an interactive prompt asking you for the real data instead of hallucinating fictitious numbers.',
    },
    {
      q: 'Will my compiled resume pass ATS parsers like Workday and Greenhouse?',
      a: 'Yes. Every template in RoleForge is built to strict single-column ATS specifications (no floating text boxes, unreadable tables, or icon-only contact info). Exporters output standard PDF and Word (.docx) files verified against ATS parsing benchmarks.',
    },
    {
      q: 'Can I review and customize suggestions before applying them?',
      a: 'Absolutely. RoleForge gives you side-by-side diffs where you can accept, reject, or edit every single bullet optimization with one click. You maintain complete editorial authority over your resume.',
    },
    {
      q: 'Is my uploaded resume data kept private and secure?',
      a: 'Yes. We enforce a strict Zero-Data Training Privacy Guarantee. Your resumes and career data are never used to train public AI models. All data is encrypted in transit and at rest with per-user database tenancy.',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-canvas text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      <LandingNavbar />

      {/* =========================================================================
          HERO SECTION: INTERACTIVE COMPILER SCENE
          ========================================================================= */}
      <section className="relative min-h-[92vh] pt-32 pb-20 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 overflow-hidden hero-mesh-gradient">
        {/* 3D Particle Canvas with graceful CSS fallback */}
        <ParticleField3D />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-indigo-200 shadow-sm text-xs font-bold text-indigo-700 mb-6 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>RoleForge 2.0 • Deterministic Resume-to-Job Compiler</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight font-display leading-[1.12]"
          >
            Compile your resume to{' '}
            <span className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              match the job
            </span>
            , with verifiable evidence.
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
          >
            RoleForge parses real requirements, highlights exact textual evidence, isolates true skill gaps, and tailors ATS-compliant resumes without fabricating credentials.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticButton strength={20}>
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto shadow-elevated bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Compile Your Resume Now
              </Button>
            </MagneticButton>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto text-slate-700 border-slate-300 hover:bg-slate-50 font-semibold"
            >
              Explore Live Architecture
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-semibold"
          >
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero AI Training on Uploads</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>100% Single-Column ATS Standards</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              <span>Cites Real Text Evidence Only</span>
            </div>
          </motion.div>
        </div>

        {/* =========================================================================
            INTERACTIVE COMPILER VISUALIZATION: FLOATING FRAGMENTS CONVERGING
            ========================================================================= */}
        <div
          onMouseEnter={() => setHeroHovered(true)}
          onMouseLeave={() => setHeroHovered(false)}
          className="relative mt-16 max-w-4xl w-full mx-auto p-4 cursor-pointer"
        >
          <motion.div
            animate={{ y: heroHovered ? -5 : 0 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-2xl bg-white/95 border border-slate-200/90 shadow-elevated p-6 backdrop-blur-md overflow-hidden"
          >
            {/* Top Compiler status bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono font-medium text-slate-500 ml-2">
                  RoleForge Compiler v2.4 — Live Evidence Grounding
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
            </div>

            {/* Split compilation view */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Left: Raw Resume fragment card */}
              <motion.div
                animate={{
                  x: heroHovered ? 10 : 0,
                  rotate: heroHovered ? 0 : -2,
                }}
                transition={{ duration: 0.4 }}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 shadow-sm"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Candidate Resume</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  "Built microservices with Node.js & React; optimized database query speeds."
                </p>
                <div className="pt-2 flex flex-wrap gap-1.5">
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded border text-slate-600 font-mono">React</span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded border text-slate-600 font-mono">Node.js</span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded border text-slate-600 font-mono">PostgreSQL</span>
                </div>
              </motion.div>

              {/* Center: Compiler alignment core with animated score ring */}
              <div className="flex flex-col items-center justify-center p-2 text-center">
                <ScoreRing score={88} size={110} strokeWidth={9} label="Estimated Alignment" />
                <span className="text-[11px] text-slate-500 mt-2 font-medium">
                  {heroHovered ? '⚡ Converged & Snapped' : 'Hover to preview convergence'}
                </span>
              </div>

              {/* Right: Job requirements & matched evidence card */}
              <motion.div
                animate={{
                  x: heroHovered ? -10 : 0,
                  rotate: heroHovered ? 0 : 2,
                }}
                transition={{ duration: 0.4 }}
                className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-left space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Target Job Spec</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Match Found
                  </span>
                </div>
                <p className="text-xs text-indigo-950 font-medium">
                  "Requires 3+ years experience with high-load microservices architecture."
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setChipMatched(!chipMatched)}
                    className="w-full text-left"
                  >
                    <div
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all duration-300 flex items-center justify-between ${
                        chipMatched
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      <span>{chipMatched ? '✓ Evidence verified in Section 2' : '⚠ Click to verify match'}</span>
                      <span className="text-[9px] uppercase tracking-wider">{chipMatched ? 'Matched' : 'Missing'}</span>
                    </div>
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Company Logo Bar */}
        <div className="mt-16 text-center max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">
            Candidates empowered to land interviews across top engineering teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-70 grayscale hover:grayscale-0 transition-all">
            <span className="font-display font-black text-xl text-slate-800 tracking-tighter">Google</span>
            <span className="font-display font-black text-xl text-slate-800 tracking-tight">Microsoft</span>
            <span className="font-display font-black text-xl text-slate-800 tracking-tighter">amazon</span>
            <span className="font-display font-bold text-xl text-slate-800 tracking-wider">stripe</span>
            <span className="font-display font-bold text-xl text-slate-800 tracking-tight">NETFLIX</span>
            <span className="font-display font-bold text-xl text-slate-800 tracking-tight">Uber</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE DEMO: BEFORE VS AFTER TRANSFORMATION
          ========================================================================= */}
      <section className="py-20 bg-slate-50 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Interactive Demonstration
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display mt-3">
              See the RoleForge difference in action.
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              Toggle between a standard generic resume and a RoleForge-compiled version tailored to an engineering lead role.
            </p>

            {/* Toggle control */}
            <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm mt-6">
              <button
                onClick={() => setDemoState('before')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  demoState === 'before'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Before: Generic Resume (54%)
              </button>
              <button
                onClick={() => setDemoState('after')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  demoState === 'after'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                After: RoleForge Compiled (94%)
              </button>
            </div>
          </div>

          {/* Interactive Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Score & Diagnostic Card */}
            <div className="md:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ATS Alignment Metric</span>
                <div className="flex items-center gap-4 mt-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl font-display ${
                      demoState === 'after' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {demoState === 'after' ? '94%' : '54%'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {demoState === 'after' ? 'High Tier Interview Probability' : 'Risk of Immediate ATS Rejection'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {demoState === 'after' ? 'Evidence verified across all mandatory criteria' : 'Missing 4 critical keywords from Job Spec'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-600">Mandatory Skills:</span>
                    <span className={`font-bold ${demoState === 'after' ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {demoState === 'after' ? '6 of 6 Matched (100%)' : '2 of 6 Matched (33%)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-600">Evidence Grounding:</span>
                    <span className={`font-bold ${demoState === 'after' ? 'text-emerald-700' : 'text-amber-600'}`}>
                      {demoState === 'after' ? '12 Verifiable Line Items' : 'Vague / Unanchored'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-600">Quantified Impact:</span>
                    <span className={`font-bold ${demoState === 'after' ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {demoState === 'after' ? '5 Key Metrics Provided' : '0 Quantitative Results'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Button
                  size="sm"
                  onClick={() => navigate('/register')}
                  className="w-full text-xs font-bold"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Compile My Resume
                </Button>
              </div>
            </div>

            {/* Experience Bullet Diff Card */}
            <div className="md:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">Target Role: Senior Full-Stack Engineer</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                      Stripe Payments
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600">Experience Optimization</span>
                </div>

                <div className="mt-4 space-y-4">
                  {demoState === 'before' ? (
                    <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/80 space-y-2">
                      <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                        <span>⚠ Generic, Unoptimized Experience Bullet</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-mono">
                        "Responsible for maintaining web applications using React and Node.js. Fixed bugs and worked with other team members on deployment."
                      </p>
                      <p className="text-[11px] text-rose-600">
                        Flaws: Passive voice ("responsible for"), zero metrics, no mention of scalability, fails mandatory JD requirement "Microservices Architecture".
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                        <span>✓ RoleForge Verified & Optimized Experience Bullet</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-mono font-medium">
                        "Architected scalable microservices utilizing Node.js, TypeScript, and React; reduced end-to-end payment processing latency by 32% across 1.4M daily transactions."
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Grounding Evidence: Directly fulfills Stripe's mandatory qualification for high-scale microservices.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Verified against Workday, Taleo, Greenhouse parsing engines</span>
                <span className="text-indigo-600 font-bold">100% Truth Grounded</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CONTINUOUS PIPELINE STORYTELLING: HOW IT WORKS
          ========================================================================= */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            End-to-End Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display mt-3">
            From raw document to verified interview-ready submission.
          </h2>
          <p className="text-slate-600 mt-4 text-base">
            RoleForge functions like an optimizing compiler: parsing requirements, constructing abstract syntax trees of your experience, and resolving dependencies.
          </p>
        </div>

        {/* 4 Pipeline Stages */}
        <motion.div
          style={{ scale: pipelineScale, opacity: pipelineOpacity }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 relative"
        >
          {/* Stage 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card hover:border-indigo-200 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Parse & Extract</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload PDF/DOCX. Native parser + OCR extracts skills, dates, and roles without corrupting original formatting.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
              <span>PDF, DOCX, OCR Support</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Stage 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card hover:border-indigo-200 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Categorize Spec</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste any job description. RoleForge isolates mandatory qualifications from preferred bonuses with full user override.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
              <span>Mandatory vs Preferred</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Stage 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card hover:border-indigo-200 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Evidence Grounding</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Computes evidence links with 5 distinct states: matched, partially demonstrated, not mentioned, or explicitly missing.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
              <span>Zero Hallucinations</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Stage 4 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card hover:border-indigo-200 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 font-bold">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Optimize & Export</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Side-by-side diff with accept/reject controls. Export single-column ATS PDF, Word DOCX, and practice mock interview questions.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
              <span>7 Verified Templates</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          7 VERIFIABLE RESUME TEMPLATES SHOWCASE
          ========================================================================= */}
      <section className="py-20 bg-slate-50 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Verifiable Design Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display mt-3">
              7 Precision Templates Designed for Parsing & Prestige.
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              Every template is engineered to single-column ATS specifications while providing bespoke typography for software, executive, academic, and creative careers.
            </p>

            {/* Template Selector Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {showcaseTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setActiveTemplate(tpl.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTemplate === tpl.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Template Spotlight Card */}
          {(() => {
            const current = showcaseTemplates.find((t) => t.id === activeTemplate) || showcaseTemplates[0];
            return (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md max-w-3xl mx-auto space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{current.name}</h3>
                      <p className="text-xs text-slate-500">Full ATS Parser Compliance Guaranteed</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${current.tagColor}`}>
                    {current.badge}
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">{current.desc}</p>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
                  <span>Available in PDF, DOCX, & Plain Text</span>
                  <Button
                    size="sm"
                    onClick={() => navigate('/register')}
                    className="text-xs font-bold"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Build in this Template
                  </Button>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* =========================================================================
          KEY PILLARS SECTION
          ========================================================================= */}
      <section id="intelligence" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Core Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display mt-3">
            Engineered around four foundational pillars.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-indigo-200 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-100/60 text-indigo-700 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Truth-Bound Optimization</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              RoleForge never invents companies, dates, numbers, or certifications. When an impact metric is missing, it explicitly prompts you to fill in your real accomplishments.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-emerald-200 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-100/60 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">ATS Readability Assurance</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Standard single-column layouts designed to sail through Taleo, Workday, Greenhouse, and Lever parsing engines without missing headers or garbled columns.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-violet-200 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-violet-100/60 text-violet-700 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Full Lifecycle CRM</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Track applications from initial draft through offers, link tailored resume versions to exact job descriptions, and prepare tailored interview answers with audio feedback.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FREQUENTLY ASKED QUESTIONS (ACCORDION)
          ========================================================================= */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Got Questions?
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-display">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          CALL TO ACTION (REDESIGNED WITH HIGH CONTRAST & ZERO BLANK BUTTONS)
          ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="relative rounded-3xl bg-gradient-to-tr from-indigo-950 via-indigo-900 to-indigo-800 p-8 sm:p-14 text-white shadow-2xl overflow-hidden border border-indigo-800/80">
          {/* Ambient background glow effects */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-violet-600/30 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 rounded-full bg-indigo-500/30 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Start Compiling in 60 Seconds
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
              Ready to compile your next career milestone?
            </h2>

            <p className="text-indigo-200 text-sm sm:text-base leading-relaxed">
              Create your account in seconds. Upload your existing resume, paste a target job description, and view your verified alignment breakdown immediately.
            </p>

            {/* Action Buttons: High Contrast, perfectly visible */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="white"
                size="lg"
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-8 font-extrabold shadow-lg hover:shadow-xl"
                rightIcon={<ArrowRight className="w-4 h-4 ml-1 text-indigo-700" />}
              >
                Get Started Free
              </Button>

              <Button
                variant="glass"
                size="lg"
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 font-semibold"
              >
                Sign In to Existing Account
              </Button>
            </div>

            {/* Micro guarantees */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-indigo-200 font-medium">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Free tier available
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> No credit card required
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> 100% Data Privacy
              </span>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};
