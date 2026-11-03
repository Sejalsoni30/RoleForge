import React, { useEffect, useState, useRef } from 'react';
import { api } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import {
  IInterviewSession,
  IResume,
  IJobDescription,
  InterviewQuestion,
} from '@roleforge/shared';
import {
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export const InterviewStudioPage: React.FC = () => {
  const { success, error, info } = useToast();

  const [resumes, setResumes] = useState<IResume[]>([]);
  const [jobs, setJobs] = useState<IJobDescription[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');

  const [session, setSession] = useState<IInterviewSession | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showSample, setShowSample] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>('');

  useEffect(() => {
    const init = async () => {
      try {
        const [resumesRes, jobsRes, sessionsRes] = await Promise.all([
          api.get<IResume[]>('/resumes'),
          api.get<IJobDescription[]>('/jobs'),
          api.get<IInterviewSession[]>('/interviews'),
        ]);

        setResumes(resumesRes.data || []);
        setJobs(jobsRes.data || []);

        if (resumesRes.data?.[0]) setSelectedResumeId(resumesRes.data[0].id);
        if (jobsRes.data?.[0]) setSelectedJobId(jobsRes.data[0].id);
        if (sessionsRes.data?.[0]) {
          setSession(sessionsRes.data[0]);
          setUserAnswer(sessionsRes.data[0].questions[0]?.userAnswer || '');
        }
      } catch (err: any) {
        error(err.message || 'Failed to initialize interview studio.');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Web Speech API Voice Recognition
  const toggleRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      error('Web Speech API is not supported in this browser. Please type your answer.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      info('Voice recording stopped.');
    } else {
      baseTextRef.current = userAnswer.trim();
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result && result[0]) {
            if (result.isFinal) {
              finalTranscript += result[0].transcript + ' ';
            } else {
              interimTranscript += result[0].transcript;
            }
          }
        }

        const prefix = baseTextRef.current ? `${baseTextRef.current} ` : '';
        const combined = `${prefix}${finalTranscript}${interimTranscript}`.trim();
        setUserAnswer(combined);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
      info('Listening... Speak your response clearly.');
    }
  };

  const handleGenerate = async () => {
    if (!selectedResumeId || !selectedJobId) {
      error('Please select both a resume and job description.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await api.post<IInterviewSession>('/interviews/generate', {
        resumeId: selectedResumeId,
        jobDescriptionId: selectedJobId,
      });
      setSession(res.data);
      setActiveQuestionIndex(0);
      setUserAnswer('');
      setShowSample(false);
      success('Mock interview session prepared!');
    } catch (err: any) {
      error(err.message || 'Failed to generate interview questions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session || !userAnswer.trim()) {
      error('Please provide an answer before submitting.');
      return;
    }

    const currentQuestion = session.questions[activeQuestionIndex];
    if (!currentQuestion) return;

    const sessionId = session.id || (session as any)._id;
    if (!sessionId) {
      error('Invalid interview session ID.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post<{ session: IInterviewSession }>(
        `/interviews/${sessionId}/answer`,
        {
          questionId: currentQuestion.id,
          userAnswer,
        }
      );
      setSession(res.data.session);
      success('Answer evaluated against scoring rubric!');
    } catch (err: any) {
      error(err.message || 'Failed to evaluate answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const currentQ = session?.questions[activeQuestionIndex];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Interview Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Practice role-specific mock questions with rubric evaluations and optional voice input.
          </p>
        </div>
      </div>

      {/* Target Role Selector */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Resume</label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Job</label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} — {j.company}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <Button onClick={handleGenerate} isLoading={isGenerating} rightIcon={<Sparkles className="w-4 h-4 ml-1" />}>
            {session ? 'Generate New Session' : 'Start Mock Interview'}
          </Button>
        </div>
      </Card>

      {/* Interactive Studio Session */}
      {!session ? (
        <EmptyState
          icon={Mic}
          title="No Active Interview Session"
          description="Click 'Start Mock Interview' to generate questions tailored to the intersection of your experience and target role."
          actionText="Begin Mock Interview"
          onAction={handleGenerate}
        />
      ) : (
        <div className="space-y-6">
          {/* Question selector tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {session.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => {
                  setActiveQuestionIndex(idx);
                  setUserAnswer(q.userAnswer || '');
                  setShowSample(false);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeQuestionIndex === idx
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : q.feedback?.score !== undefined
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Question {idx + 1}</span>
                {q.feedback?.score !== undefined && (
                  <span className="text-[10px] font-extrabold font-mono">
                    ({q.feedback.score}%)
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Current Question Card */}
          {currentQ && (
            <Card className="p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {currentQ.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">
                    Difficulty: {currentQ.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {currentQ.question}
                </h3>
              </div>

              {/* Rubric evaluation criteria */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Evaluation Criteria Rubric:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {currentQ.rubric.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Answer Input (Voice + Text) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Your Response
                  </label>
                  <Button
                    variant={isRecording ? 'danger' : 'outline'}
                    size="sm"
                    onClick={toggleRecording}
                    leftIcon={isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  >
                    {isRecording ? 'Stop Recording' : 'Voice Input (Web Speech)'}
                  </Button>
                </div>

                <Textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Structure your answer using STAR (Situation, Task, Action, Result)..."
                  rows={6}
                />

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSample(!showSample)}
                    leftIcon={<BookOpen className="w-3.5 h-3.5" />}
                  >
                    {showSample ? 'Hide Model Answer' : 'View Sample Model Answer'}
                  </Button>

                  <Button onClick={handleSubmitAnswer} isLoading={isSubmitting}>
                    Evaluate Answer
                  </Button>
                </div>
              </div>

              {/* Sample Answer Toggle */}
              {showSample && (
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 space-y-1">
                  <span className="font-bold text-indigo-900">Sample High-Impact Response:</span>
                  <p className="leading-relaxed">{currentQ.sampleAnswer}</p>
                </div>
              )}

              {/* Real Feedback Card */}
              {currentQ.feedback && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <span className="font-bold text-slate-900 text-sm">
                      Evaluator Performance Score
                    </span>
                    <span
                      className={`text-lg font-extrabold font-display ${
                        currentQ.feedback.score >= 80 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {currentQ.feedback.score}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-emerald-800 flex items-center gap-1 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Strengths
                      </span>
                      <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                        {currentQ.feedback.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold text-amber-800 flex items-center gap-1 mb-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Opportunities
                      </span>
                      <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                        {currentQ.feedback.improvements.map((im, i) => (
                          <li key={i}>{im}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 pt-2 border-t border-slate-200/60 leading-relaxed">
                    💡 <strong>Suggested Refinement:</strong> {currentQ.feedback.suggestedRefinement}
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

