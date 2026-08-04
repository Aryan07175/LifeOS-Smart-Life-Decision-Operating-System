import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { decisionsApi } from '@/api/decisions';
import { ShimmerButton } from '@/components/ui/ShimmerButton';
import { getCategoryColor, getCategoryLabel } from '@/lib/helpers';

const MOODS = [
  { value: 2, emoji: '😞', label: 'Low' },
  { value: 4, emoji: '😐', label: 'Okay' },
  { value: 6, emoji: '🙂', label: 'Good' },
  { value: 8, emoji: '😊', label: 'Great' },
  { value: 10, emoji: '🤩', label: 'Amazing' },
];

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-indigo-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / total) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
      <span className="text-xs font-bold text-gray-400 flex-shrink-0">{step + 1}/{total}</span>
    </div>
  );
}

export default function CheckInPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: decision } = useQuery({
    queryKey: ['decision', id],
    queryFn: () => decisionsApi.getDecision(id!),
    enabled: !!id,
  });

  const createOutcome = useMutation({
    mutationFn: decisionsApi.createOutcome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outcomes', 'pending-checkins'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      navigate(`/decisions/${id}`);
    },
  });

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [satisfaction, setSatisfaction] = useState(5);
  const [actualResults, setActualResults] = useState('');
  const [mood, setMood] = useState(6);
  const [stress, setStress] = useState(5);
  const [reflections, setReflections] = useState('');
  const [lessons, setLessons] = useState('');
  const [wouldDecideAgain, setWouldDecideAgain] = useState<boolean | null>(null);

  const STEPS = 4;
  const goNext = () => { setDir(1); setStep((s) => s + 1); };
  const goBack = () => { setDir(-1); setStep((s) => s - 1); };

  const handleSubmit = () => {
    createOutcome.mutate({
      decisionId: id!,
      satisfactionScore: satisfaction,
      actualResults: actualResults.trim(),
      reflections: reflections.trim() || undefined,
      lessonsLearned: lessons.trim() || undefined,
      wouldDecideAgain: wouldDecideAgain ?? undefined,
      moodAtCheckIn: mood,
      stressLevel: stress,
    });
  };

  const catColor = decision ? getCategoryColor(decision.category) : '#4F46E5';

  const SLIDE = {
    initial: (d: number) => ({ opacity: 0, x: d * 40 }),
    animate: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -40 }),
  };

  const stressColor = stress <= 3 ? '#10B981' : stress <= 6 ? '#F59E0B' : '#EF4444';

  return (
    <div className="max-w-2xl mx-auto px-5 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Outcome Check-in</h1>
          <p className="text-sm text-gray-400">Reflect on how this decision played out</p>
        </div>
      </div>

      {/* Decision context */}
      {decision && (
        <div className="mb-6 p-4 rounded-2xl border-l-4" style={{ borderColor: catColor, backgroundColor: catColor + '10' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: catColor }}>
            {getCategoryLabel(decision.category)}
          </p>
          <p className="text-sm font-bold text-gray-900 line-clamp-2">{decision.title}</p>
        </div>
      )}

      <ProgressBar step={step} total={STEPS} />

      <AnimatePresence custom={dir} mode="wait">
        {/* Step 0: Outcome + Satisfaction */}
        {step === 0 && (
          <motion.div key="s0" custom={dir} variants={SLIDE} initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.26 }} className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 mb-1">What actually happened?</h2>
              <p className="text-sm text-gray-400">Describe the actual results of this decision.</p>
            </div>
            <textarea value={actualResults} onChange={(e) => setActualResults(e.target.value)}
              placeholder="The actual outcome was..."
              rows={5} className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-700">Satisfaction Score</p>
                <span className="text-3xl font-extrabold text-indigo-600">{satisfaction}</span>
              </div>
              <div className="flex gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <button key={i} onClick={() => setSatisfaction(i + 1)}
                    className="flex-1 h-10 rounded-xl text-xs font-bold transition-all duration-150"
                    style={{
                      backgroundColor: i < satisfaction ? '#4F46E5' : '#F3F4F6',
                      color: i < satisfaction ? '#fff' : '#9CA3AF',
                    }}>
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <ShimmerButton onClick={goNext} disabled={!actualResults.trim()} icon={<ArrowRight className="w-4 h-4" />}>Continue</ShimmerButton>
            </div>
          </motion.div>
        )}

        {/* Step 1: Mood + Stress */}
        {step === 1 && (
          <motion.div key="s1" custom={dir} variants={SLIDE} initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.26 }} className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 mb-1">How are you feeling?</h2>
              <p className="text-sm text-gray-400">Your emotional state at the time of this check-in.</p>
            </div>

            {/* Mood */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-3">Current Mood</p>
              <div className="flex gap-3">
                {MOODS.map((m) => (
                  <button key={m.value} onClick={() => setMood(m.value)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all duration-200 ${mood === m.value ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[10px] font-bold text-gray-500">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stress */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-700">Stress Level</p>
                <span className="text-xl font-extrabold" style={{ color: stressColor }}>{stress}/10</span>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <button key={i} onClick={() => setStress(i + 1)}
                    className="flex-1 h-2.5 rounded-full transition-all"
                    style={{ backgroundColor: i < stress ? stressColor : '#E5E7EB' }} />
                ))}
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 font-medium">
                <span>Relaxed</span><span>Very Stressed</span>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={goBack} className="flex items-center gap-2 text-sm font-semibold text-gray-500 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <ShimmerButton onClick={goNext} icon={<ArrowRight className="w-4 h-4" />}>Continue</ShimmerButton>
            </div>
          </motion.div>
        )}

        {/* Step 2: Reflections */}
        {step === 2 && (
          <motion.div key="s2" custom={dir} variants={SLIDE} initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.26 }} className="space-y-5">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 mb-1">Looking back</h2>
              <p className="text-sm text-gray-400">What are your thoughts and lessons?</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Reflections</label>
              <textarea value={reflections} onChange={(e) => setReflections(e.target.value)} placeholder="Looking back, what are your thoughts?"
                rows={3} className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Lessons Learned</label>
              <textarea value={lessons} onChange={(e) => setLessons(e.target.value)} placeholder="What would you do differently next time?"
                rows={3} className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none" />
            </div>

            <div className="flex justify-between">
              <button onClick={goBack} className="flex items-center gap-2 text-sm font-semibold text-gray-500 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <ShimmerButton onClick={goNext} icon={<ArrowRight className="w-4 h-4" />}>Continue</ShimmerButton>
            </div>
          </motion.div>
        )}

        {/* Step 3: Would Decide Again + Submit */}
        {step === 3 && (
          <motion.div key="s3" custom={dir} variants={SLIDE} initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.26 }} className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 mb-1">Final Reflection</h2>
              <p className="text-sm text-gray-400">Knowing what you know now...</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-700">Would you make the same decision again?</p>
              <div className="flex gap-3">
                <button onClick={() => setWouldDecideAgain(wouldDecideAgain === true ? null : true)}
                  className={`flex-1 py-4 rounded-2xl border-2 text-2xl font-bold transition-all ${wouldDecideAgain === true ? 'border-emerald-400 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  👍 <span className="block text-sm font-semibold text-gray-700 mt-1">Yes</span>
                </button>
                <button onClick={() => setWouldDecideAgain(wouldDecideAgain === false ? null : false)}
                  className={`flex-1 py-4 rounded-2xl border-2 text-2xl font-bold transition-all ${wouldDecideAgain === false ? 'border-red-300 bg-red-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  👎 <span className="block text-sm font-semibold text-gray-700 mt-1">No</span>
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Summary</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Satisfaction</span>
                <span className="font-bold text-gray-900">{satisfaction}/10</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Mood</span>
                <span className="font-bold">{MOODS.find((m) => m.value === mood)?.emoji} {MOODS.find((m) => m.value === mood)?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Stress</span>
                <span className="font-bold" style={{ color: stressColor }}>{stress}/10</span>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={goBack} className="flex items-center gap-2 text-sm font-semibold text-gray-500 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <ShimmerButton onClick={handleSubmit} loading={createOutcome.isPending}
                icon={<CheckCircle2 className="w-4 h-4" />}>
                Complete Check-in
              </ShimmerButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
