import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Sparkles, Plus, Trash2, TrendingUp, Calendar, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { decisionsApi } from '@/api/decisions';
import { aiApi } from '@/api/ai';
import { ShimmerButton } from '@/components/ui/ShimmerButton';

import { getCategoryColor, getCategoryLabel } from '@/lib/helpers';
import type { DecisionCreatePayload, Alternative, ExpectedOutcome } from '@/api/decisions';
import type { PreDecisionAnalysis } from '@/api/ai';

const CATEGORIES = [
  'career', 'financial', 'health', 'relationship', 'education',
  'lifestyle', 'business', 'personal_growth', 'family', 'other',
];

// ── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: number }) {
  const steps = ['Foundations', 'Context', 'Calibration'];
  return (
    <div className="flex items-center gap-1 mb-8">
      {steps.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              i < step ? 'bg-indigo-600 text-white' : i === step ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-gray-100 text-gray-400'
            }`}>
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`mt-1.5 text-[10px] font-semibold whitespace-nowrap ${i === step ? 'text-indigo-600' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px mx-2 mb-4 transition-colors duration-500 ${i < step ? 'bg-indigo-400' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── AI Analysis Modal ─────────────────────────────────────────────────────────
function AnalysisModal({ analysis, onProceed, onBack, loading }: {
  analysis: PreDecisionAnalysis | null;
  onProceed: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  const verdictConfig = {
    proceed: { icon: CheckCircle2, color: '#10B981', bg: '#ECFDF5', label: 'Proceed' },
    caution: { icon: AlertTriangle, color: '#F59E0B', bg: '#FFFBEB', label: 'Proceed with Caution' },
    reconsider: { icon: XCircle, color: '#EF4444', bg: '#FEF2F2', label: 'Reconsider' },
  };

  const config = analysis ? verdictConfig[analysis.verdict] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
      >
        {loading || !analysis ? (
          <div className="flex flex-col items-center justify-center p-10 gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center animate-pulse">
              <Sparkles className="w-6 h-6 text-indigo-500" />
            </div>
            <p className="text-sm font-medium text-gray-600">Analyzing your decision history...</p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Verdict */}
            {config && (
            <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: config.bg }}>
              <config.icon className="w-6 h-6 flex-shrink-0" style={{ color: config.color }} />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: config.color }}>AI Verdict</p>
                <p className="text-base font-extrabold text-gray-900">{config.label}</p>
              </div>
              <span className="ml-auto text-xs font-bold text-gray-500">{Math.round(analysis.confidenceInVerdict * 100)}% confident</span>
            </div>
            )}

            {/* Timing */}
            {analysis.timingAssessment && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Timing Assessment</p>
                <p className="text-sm text-gray-700">{analysis.timingAssessment}</p>
              </div>
            )}

            {/* Risk Factors */}
            {analysis.riskFactors.length > 0 && (
              <div>
                <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Risk Factors</p>
                <ul className="space-y-1.5">
                  {analysis.riskFactors.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">•</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Suggestions</p>
                <ul className="space-y-1.5">
                  {analysis.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-indigo-400 mt-0.5 flex-shrink-0">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Historical Context */}
            {analysis.historicalContext && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">From Your History</p>
                <p className="text-sm text-gray-600 italic">"{analysis.historicalContext}"</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={onBack} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Go Back & Edit
              </button>
              <ShimmerButton onClick={onProceed} className="flex-[2] py-2.5 rounded-xl text-sm">
                Proceed Anyway
              </ShimmerButton>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────────
export default function NewDecisionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<PreDecisionAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [context, setContext] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [alternatives, setAlternatives] = useState<Alternative[]>([{ option: '' }]);
  const [outcomes, setOutcomes] = useState<ExpectedOutcome[]>([{ outcome: '' }]);
  const [targetDate, setTargetDate] = useState('');
  const [confidence, setConfidence] = useState(5);

  const createMutation = useMutation({
    mutationFn: decisionsApi.createDecision,
    onSuccess: (d) => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      navigate(`/decisions/${d.id}`);
    },
  });

  const handleRequestAnalysis = async () => {
    setShowAnalysis(true);
    setAnalysisLoading(true);
    try {
      const result = await aiApi.preDecisionAnalysis({
        title,
        category,
        description: context,
        context: reasoning,
        confidenceLevel: confidence,
        expectedOutcomes: outcomes.filter((o) => o.outcome),
        alternativesConsidered: alternatives.filter((a) => a.option),
      });
      setAnalysis(result);
    } catch {
      setAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleCreate = () => {
    const payload: DecisionCreatePayload = {
      title,
      category: category || undefined,
      context: context || undefined,
      reasoningProcess: reasoning || undefined,
      alternativesConsidered: alternatives.filter((a) => a.option.trim()),
      expectedOutcomes: outcomes.filter((o) => o.outcome.trim()),
      confidenceLevel: confidence,
      expectedOutcomeDate: targetDate || undefined,
    };
    setShowAnalysis(false);
    createMutation.mutate(payload);
  };

  const canProceedStep1 = title.trim().length > 0;

  const SLIDE = {
    initial: (dir: number) => ({ opacity: 0, x: dir * 40 }),
    animate: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
  };
  const [dir, setDir] = useState(1);

  const goNext = () => { setDir(1); setStep((s) => s + 1); };
  const goBack = () => { setDir(-1); setStep((s) => s - 1); };

  return (
    <div className="max-w-2xl mx-auto px-5 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">New Decision</h1>
          <p className="text-sm text-gray-400">Record your decision with full context</p>
        </div>
      </div>

      <StepIndicator step={step} />

      {/* Step Content */}
      <AnimatePresence custom={dir} mode="wait">
        {step === 0 && (
          <motion.div key="step0" custom={dir} variants={SLIDE} initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }} className="space-y-5">

            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Decision Title *</label>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What is the choice ahead of me?"
                rows={3}
                className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 text-[17px] font-semibold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 resize-none transition-all bg-white"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const color = getCategoryColor(cat);
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200"
                      style={{
                        backgroundColor: isSelected ? color : 'transparent',
                        borderColor: isSelected ? color : '#E5E7EB',
                        color: isSelected ? '#fff' : '#6B7280',
                      }}
                    >
                      {getCategoryLabel(cat)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Context */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Context & Nuance</label>
              <textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="What's the situation? What factors are in play?"
                rows={4} className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 resize-none bg-white" />
            </div>

            <div className="pt-2 flex justify-end">
              <ShimmerButton onClick={goNext} disabled={!canProceedStep1}
                icon={<ArrowRight className="w-4 h-4" />}>
                Continue
              </ShimmerButton>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" custom={dir} variants={SLIDE} initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }} className="space-y-6">

            {/* Reasoning */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">My Reasoning</label>
              <p className="text-xs text-gray-400">What led you to this crossroad?</p>
              <textarea value={reasoning} onChange={(e) => setReasoning(e.target.value)} placeholder="Describe your thought process, what led you here..."
                rows={4} className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 resize-none bg-white" />
            </div>

            {/* Alternatives */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Alternatives Considered</label>
              <div className="space-y-2">
                {alternatives.map((alt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-500 flex-shrink-0">{i + 1}</div>
                    <input value={alt.option} onChange={(e) => setAlternatives((a) => a.map((x, j) => j === i ? { ...x, option: e.target.value } : x))}
                      placeholder={`Option ${i + 1}...`}
                      className="flex-1 h-10 px-4 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white" />
                    {alternatives.length > 1 && (
                      <button onClick={() => setAlternatives((a) => a.filter((_, j) => j !== i))} className="p-1.5 text-red-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => setAlternatives((a) => [...a, { option: '' }])}
                className="flex items-center gap-2 text-sm font-medium text-indigo-500 hover:text-indigo-600 mt-2 transition-colors">
                <Plus className="w-4 h-4" /> Add Another Option
              </button>
            </div>

            <div className="flex justify-between pt-2">
              <button onClick={goBack} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <ShimmerButton onClick={goNext} icon={<ArrowRight className="w-4 h-4" />}>Continue</ShimmerButton>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" custom={dir} variants={SLIDE} initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }} className="space-y-6">

            {/* Expected Outcomes */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Expected Outcomes</label>
              <div className="space-y-2">
                {outcomes.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <input value={o.outcome} onChange={(e) => setOutcomes((a) => a.map((x, j) => j === i ? { ...x, outcome: e.target.value } : x))}
                      placeholder={`Expected outcome ${i + 1}...`}
                      className="flex-1 h-10 px-4 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white" />
                    {outcomes.length > 1 && (
                      <button onClick={() => setOutcomes((a) => a.filter((_, j) => j !== i))} className="p-1.5 text-red-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => setOutcomes((a) => [...a, { outcome: '' }])}
                className="flex items-center gap-2 text-sm font-medium text-indigo-500 hover:text-indigo-600 transition-colors">
                <Plus className="w-4 h-4" /> Add Outcome
              </button>
            </div>

            {/* Target Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Target Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white" />
              </div>
            </div>

            {/* Confidence */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Confidence Level</label>
                <span className="text-2xl font-extrabold text-indigo-600">{confidence}<span className="text-sm font-medium text-gray-400">/10</span></span>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setConfidence(i + 1)}
                    className="flex-1 h-2 rounded-full transition-all duration-200"
                    style={{ backgroundColor: i < confidence ? '#4F46E5' : '#E5E7EB' }}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center">
                {confidence <= 2 ? 'Very uncertain' : confidence <= 4 ? 'Somewhat uncertain' : confidence <= 6 ? 'Moderately confident' : confidence <= 8 ? 'Strongly leaning' : 'Unshakeable'}
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <button onClick={goBack} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <ShimmerButton
                onClick={handleRequestAnalysis}
                loading={createMutation.isPending}
                icon={<Sparkles className="w-4 h-4" />}
                disabled={!title.trim()}
              >
                Create Decision
              </ShimmerButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Modal */}
      <AnimatePresence>
        {showAnalysis && (
          <AnalysisModal
            analysis={analysis}
            loading={analysisLoading}
            onProceed={handleCreate}
            onBack={() => setShowAnalysis(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
