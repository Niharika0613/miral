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
    answer: 'No. Your video is analysed on your device and is not uploaded. All computer vision runs locally in your browser using WebAssembly. Camera frames never leave your computer or phone.'
  },
  {
    category: 'metrics',
    question: 'How is my eye contact score calculated?',
    answer: 'VaniDarpan extracts 478 facial landmarks to compute iris ratios relative to eye corners. Looking directly into the camera registers as direct eye contact. Glancing away registers as looking away.'
  },
  {
    category: 'metrics',
    question: 'What is the ideal speaking pace for interviews?',
    answer: 'The recommended conversational band for campus placements and interviews is 130–150 WPM. Speaking faster than 160 WPM sounds rushed, while speaking below 120 WPM can signal hesitation.'
  },
  {
    category: 'placement',
    question: 'How does VaniDarpan detect filler words like "um" and "matlab"?',
    answer: 'VaniDarpan uses real-time on-device speech-to-text matching to catch common fillers including "um", "uh", "like", "basically", "matlab", "yaani", and "actually".'
  },
  {
    category: 'placement',
    question: 'Does VaniDarpan work on smartphones and tablets?',
    answer: 'Yes. VaniDarpan is fully responsive and works across modern browsers on phones, tablets, and laptops.'
  },
  {
    category: 'placement',
    question: 'How can my college placement cell set up a campus pilot?',
    answer: 'Submit a pilot request through our Contact page. We provide college overview dashboards to track batch-wide communication readiness.'
  }
];

const categoryColors: Record<FAQItem['category'], string> = {
  privacy: 'border-green-500/30 text-green-600',
  metrics: 'border-primary/30 text-primary',
  placement: 'border-amber-500/30 text-amber-600',
};

const categoryLabels: Record<FAQItem['category'], string> = {
  privacy: 'Privacy',
  metrics: 'Metrics',
  placement: 'Placement',
};

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 space-y-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Help Center</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Quick answers about VaniDarpan metrics, privacy, and campus placement practice.
          </p>
        </div>

        {/* FAQ Accordion — 2 column grid on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`border rounded-xl bg-card transition-all cursor-pointer overflow-hidden ${isOpen ? 'border-primary/40 shadow-sm' : 'border-border/60'}`}
                onClick={() => setOpenIdx(isOpen ? null : idx)}
              >
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <Badge variant="outline" className={`text-[10px] font-semibold mb-1.5 ${categoryColors[faq.category]}`}>
                      {categoryLabels[faq.category]}
                    </Badge>
                    <p className="text-xs font-semibold text-foreground leading-snug">
                      {faq.question}
                    </p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 mt-0.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border/30">
                    <p className="pt-3">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Callout */}
        <div className="p-5 rounded-xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <p className="text-sm font-bold text-foreground">Still have questions?</p>
            <p className="text-xs text-muted-foreground">
              Reach us at <span className="text-primary font-semibold font-mono">contact@vanidarpan.app</span>
            </p>
          </div>
          <Link href="/contact" className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shrink-0">
            Contact Us
          </Link>
        </div>

      </div>
    </div>
  );
}
