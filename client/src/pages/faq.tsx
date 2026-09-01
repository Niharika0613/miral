// client/src/pages/faq.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    question: 'Is my webcam video recorded or stored on external cloud servers?',
    answer: 'No. MIRAL executes all computer vision and facial landmark calculations locally inside your browser using Google MediaPipe and WebAssembly. Your raw camera stream is never uploaded or saved to remote databases, ensuring complete personal privacy.'
  },
  {
    category: 'metrics',
    question: 'How does MIRAL calculate my eye contact and pupil gaze score?',
    answer: 'MIRAL extracts 478 3D facial landmarks to calculate horizontal and vertical iris ratios relative to your eye corners. When looking directly into your camera lens, the ratio is centered. Glancing away at notes, your keyboard, or the screen margin immediately registers as looking away.'
  },
  {
    category: 'metrics',
    question: 'What is the optimal speaking pace (WPM) for job interviews and GDs?',
    answer: 'The optimal conversational band for campus placements, technical interviews, and debate rounds is between 130 and 155 Words Per Minute (WPM). Speaking faster than 165 WPM makes complex arguments hard to follow, while speaking slower than 110 WPM can signal hesitation.'
  },
  {
    category: 'placement',
    question: 'How does MIRAL detect filler words like "um", "like", and "matlab"?',
    answer: 'MIRAL utilizes real-time speech-to-text token matching to identify English and bilingual conversational fillers (including "um", "uh", "like", "you know", "basically", "actually", "matlab", "yaani", and "and all"). In your session report, the ESL Bridge suggests concise executive replacements.'
  },
  {
    category: 'placement',
    question: 'Can I use MIRAL on smartphones and tablets?',
    answer: 'Yes! MIRAL is built with a fully responsive modular interface that supports Chrome, Edge, and Safari on iOS, Android, tablets, and desktop workstations.'
  },
  {
    category: 'placement',
    question: 'How can my college or Training & Placement Officer (TPO) set up a pilot?',
    answer: 'College placement coordinators and deans can submit a pilot inquiry through our Contact Portal or email tpo-pilot@miral.ai. We provide institutional cohort dashboards to monitor batch-wide communication improvement.'
  }
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Everything you need to know about MIRAL metrics, vision tracking, privacy, and campus placement practice.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <Card 
                key={idx} 
                className="border border-border/60 shadow-xs bg-card transition-all cursor-pointer overflow-hidden"
                onClick={() => toggle(idx)}
              >
                <CardHeader className="p-4 sm:p-5 flex flex-row items-center justify-between gap-4">
                  <span className="font-semibold text-sm text-foreground text-left">
                    {faq.question}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </CardHeader>
                {isOpen && (
                  <CardContent className="px-4 pb-5 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border/30 mt-1 pt-3">
                    {faq.answer}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Support Callout */}
        <div className="p-6 rounded-xl border border-border/60 bg-muted/20 text-center space-y-2">
          <h3 className="text-sm font-bold text-foreground">Still have questions?</h3>
          <p className="text-xs text-muted-foreground">
            Our campus engineering and student support team is here to assist.
          </p>
          <div className="pt-2">
            <Link href="/contact" className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
              Contact Support & Campus Pilot
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
