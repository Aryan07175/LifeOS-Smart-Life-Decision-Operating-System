import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Plus, ChevronRight, ArrowRight,
  User, Bot, RotateCcw, History,
} from 'lucide-react';
import { aiApi } from '@/api/ai';
import type { SSEEvent } from '@/api/ai';
import { GlowBorder } from '@/components/ui/GlowBorder';
import { ShimmerButton } from '@/components/ui/ShimmerButton';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
};

const SUGGESTION_CHIPS = [
  'What patterns do you see in my decisions?',
  'Help me think through a career decision',
  'How confident should I be about financial choices?',
  'What do my past health decisions tell me?',
];

// ── Context Pipeline Visualization ───────────────────────────────────────────
function ContextPipeline() {
  const stages = [
    { label: 'Your Profile', icon: '👤', desc: 'Behavioral traits' },
    { label: 'Category Context', icon: '📂', desc: 'Domain patterns' },
    { label: 'Similar Decisions', icon: '🔍', desc: 'RAG similarity' },
    { label: 'Patterns', icon: '📊', desc: 'Detected behaviors' },
    { label: 'AI Analysis', icon: '✨', desc: 'Personalized advice' },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {stages.map((stage, i) => (
          <React.Fragment key={stage.label}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-lg">
                {stage.icon}
              </div>
              <p className="text-[10px] font-bold text-gray-700 whitespace-nowrap">{stage.label}</p>
              <p className="text-[9px] text-gray-400 whitespace-nowrap">{stage.desc}</p>
            </motion.div>
            {i < stages.length - 1 && (
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mb-4" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ onChipClick }: { onChipClick: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8 px-4">
      <GlowBorder borderRadius="24px" className="mb-6">
        <div className="p-6 rounded-3xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">AI Decision Advisor</h2>
          <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
            Your advisor knows your decision history and uses it to give you personalized, evidence-based guidance.
          </p>
        </div>
      </GlowBorder>

      <ContextPipeline />

      <div className="space-y-2 w-full max-w-md">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center mb-3">Try asking</p>
        {SUGGESTION_CHIPS.map((chip, i) => (
          <motion.button
            key={chip}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 + 0.3 }}
            onClick={() => onChipClick(chip)}
            className="w-full flex items-center gap-3 text-left px-4 py-3 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all duration-200 shadow-sm group"
          >
            <span className="text-sm text-gray-700 flex-1">{chip}</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Chat Bubble ───────────────────────────────────────────────────────────────
function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
        isUser ? 'bg-indigo-100' : 'bg-indigo-600',
      )}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-indigo-600" />
          : <Sparkles className="w-3.5 h-3.5 text-white" />}
      </div>

      {/* Bubble */}
      <div className={cn(
        'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
        isUser
          ? 'bg-indigo-600 text-white rounded-tr-sm'
          : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm',
      )}>
        {message.content}
        {message.streaming && (
          <span className="inline-flex items-center gap-0.5 ml-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block w-1 h-1 bg-gray-400 rounded-full"
                style={{ animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '', streaming: true };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsStreaming(true);

    await aiApi.sendChatMessage(
      { sessionId, message: text.trim() },
      (event: SSEEvent) => {
        if (event.type === 'session') {
          setSessionId(event.sessionId);
        } else if (event.type === 'delta') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + event.text } : m,
            ),
          );
        }
      },
      (err) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: 'Sorry, something went wrong. Please try again.', streaming: false }
              : m,
          ),
        );
        setIsStreaming(false);
      },
      () => {
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, streaming: false } : m),
        );
        setIsStreaming(false);
      },
    );
  }, [sessionId, isStreaming]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setSessionId(undefined);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto px-5 lg:px-8 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900">AI Advisor</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-gray-400 font-medium">Active · Personalized to your history</span>
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Chat
          </button>
        )}
      </div>

      {/* Messages / Empty State */}
      <div className="flex-1 overflow-y-auto -mx-2 px-2" data-lenis-prevent>
        {messages.length === 0 ? (
          <EmptyState onChipClick={(text) => sendMessage(text)} />
        ) : (
          <div className="space-y-4 py-2">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="flex-shrink-0 mt-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your decision patterns..."
            rows={2}
            className="w-full px-4 pt-3 pb-1 text-sm text-gray-800 placeholder-gray-400 resize-none outline-none bg-transparent leading-relaxed"
          />
          <div className="flex items-center justify-between px-4 pb-3">
            <span className="text-[10px] text-gray-400 font-medium">
              <kbd className="bg-gray-100 rounded px-1">⌘Enter</kbd> to send
            </span>
            <ShimmerButton
              size="sm"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              loading={isStreaming}
              icon={<Send className="w-3.5 h-3.5" />}
              className="rounded-xl"
            >
              Send
            </ShimmerButton>
          </div>
        </div>
      </div>
    </div>
  );
}
