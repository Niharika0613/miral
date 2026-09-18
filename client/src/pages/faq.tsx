// client/src/pages/faq.tsx
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, HelpCircle, ShieldCheck, Video, Zap, MessageSquare } from 'lucide-react';
import { Link } from 'wouter';

interface FAQItem {
  question: string;
  answer: string;
  category: 'privacy' | 'metrics' | 'placement';
}

const FAQS: FAQItem[] = [
  {
    category: 'privacy',
    question: 'Is my webcam video recorded or stored?',
    answer: 'No. All computer vision runs locally in your browser using Google MediaPipe and WebAssembly. Your raw camera stream is never uploaded or saved to any external server.'
  },
  {
    category: 'metrics',
    question: 'How is my eye contact score calculated?',
    answer: 'MIRAL extracts 478 3D facial landmarks to compute iris ratios relative to your eye corners. Looking directly into the camera registers as direct contact. Glancing away immediately lowers your score.'
  },
  {
    category: 'metrics',
    question: 'What is the ideal speaking pace for interviews?',
    answer: 'The optimal band for campus placements and GDs is 130–155 WPM. Faster than 165 WPM makes arguments hard to follow; slower than 110 WPM can signal hesitation.'
  },
  {
    category: 'placement',
    question: 'How does MIRAL detect filler words like "um" and "matlab"?',
    answer: 'MIRAL uses real-time speech-to-text token matching to catch English and bilingual fillers including "um", "uh", "like", "basically", "matlab", "yaani", and "and all".'
  },
  {
    category: 'placement',
    question: 'Does MIRAL work on smartphones and tablets?',
    answer: 'Yes. MIRAL is fully responsive and works on Chrome, Edge, and Safari across iOS, Android, tablets, and desktops.'
  },
  {
    category: 'placement',
    question: 'How can my college TPO set up a campus pilot?',
    answer: 'Submit a pilot inquiry through our Contact page or email supportmiralai@gmail.com. We provide institutional cohort dashboards to track batch-wide communication improvement.'
  }
];

const categoryColors: Record<FAQItem['category'], string> = {
  privacy: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
  metrics: 'border-indigo-500/30 text-indigo-300 bg-indigo-500/10',
  placement: 'border-cyan-500/30 text-cyan-300 bg-cyan-500/10',
};

const categoryLabels: Record<FAQItem['category'], string> = {
  privacy: 'Privacy',
  metrics: 'Metrics',
  placement: 'Placement',
};

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#05060A] text-slate-100 py-12 relative overflow-x-hidden">
      {/* Aurora Ambient Background */}
      <div className="pointer-events-none fixed inset-0 z-[-10] overflow-hidden">
        <div className="aurora-blob-1 absolute top-[-100px] left-[-80px] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="aurora-blob-2 absolute top-[40%] right-[-120px] w-[450px] h-[450px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <div className="container max-w-4xl mx-auto px-4 sm:px-6 space-y-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25">
            <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
            <span>Help Center</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Quick answers about MIRAL metrics, privacy, and campus placement practice.
          </p>
        </div>

        {/* FAQ Accordion — 2 column grid on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`border rounded-2xl bg-white/[0.03] backdrop-blur-xl transition-all cursor-pointer overflow-hidden ${isOpen ? 'border-indigo-500/50 shadow-[0_0_25px_rgba(99,102,241,0.15)]' : 'border-white/[0.08] hover:border-white/20'}`}
                onClick={() => setOpenIdx(isOpen ? null : idx)}
              >
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Badge variant="outline" className={`text-[10px] font-semibold mb-1 ${categoryColors[faq.category]}`}>
                      {categoryLabels[faq.category]}
                    </Badge>
                    <p className="text-xs font-semibold text-white leading-snug">
                      {faq.question}
                    </p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 mt-0.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-white/[0.06]">
                    <p className="pt-3">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Callout */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 card-gradient-top">
          <div className="space-y-0.5 text-center sm:text-left">
            <p className="text-sm font-bold text-white">Still have questions?</p>
            <p className="text-xs text-slate-400">
              Reach us at <span className="text-indigo-400 font-semibold font-mono">supportmiralai@gmail.com</span>
            </p>
          </div>
          <Link href="/contact" className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-semibold hover:opacity-90 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] transition-all shrink-0">
            Contact Us
          </Link>
        </div>

      </div>
    </div>
  );
}
