import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
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
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [heroHovered, setHeroHovered] = useState(false);
  const [chipMatched, setChipMatched] = useState(true);

  // Scroll animations for pipeline section
  const { scrollYProgress } = useScroll();
  const pipelineScale = useTransform(scrollYProgress, [0.1, 0.3], [0.95, 1]);
  const pipelineOpacity = useTransform(scrollYProgress, [0.08, 0.2], [0.5, 1]);

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
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-indigo-100 shadow-sm text-xs font-semibold text-indigo-700 mb-6 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>Deterministic Resume-to-Job Compiler</span>
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
                className="w-full sm:w-auto shadow-elevated"
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
              className="w-full sm:w-auto"
            >
              Explore Live Architecture
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Strict Privacy: No AI Training on Uploads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>100% Single-Column ATS Standards</span>
            </div>
            <div className="flex items-center gap-1.5">
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
            className="relative rounded-2xl bg-white/90 border border-slate-200 shadow-elevated p-6 backdrop-blur-md overflow-hidden"
          >
            {/* Top Compiler status bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono font-medium text-slate-500 ml-2">
                  RoleForge Compiler v2.4 — Live Evidence Engine
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
          KEY PILLARS SECTION
          ========================================================================= */}
      <section id="intelligence" className="py-20 bg-slate-50 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100/60 text-indigo-700 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Truth-Bound Optimization</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                RoleForge never invents companies, dates, numbers, or certifications. When an impact metric is missing, it explicitly prompts you to fill in your real accomplishments.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100/60 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">ATS Readability Assurance</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Standard single-column layouts designed to sail through Taleo, Workday, Greenhouse, and Lever parsing engines without missing headers or garbled columns.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-violet-100/60 text-violet-700 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Full Lifecycle CRM</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Track applications from initial draft through offers, link tailored resume versions to exact job descriptions, and prepare tailored interview answers with audio feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CALL TO ACTION
          ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="rounded-3xl bg-gradient-to-tr from-indigo-900 via-indigo-800 to-indigo-700 p-12 text-white shadow-elevated relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display">
              Ready to compile your next career milestone?
            </h2>
            <p className="text-indigo-200 text-sm sm:text-base leading-relaxed">
              Create your account in seconds. Upload your existing resume, paste a target job description, and view your verified alignment breakdown immediately.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold"
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Get Started Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
                className="border-indigo-300 text-white hover:bg-white/10"
              >
                Sign In to Existing Account
              </Button>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

