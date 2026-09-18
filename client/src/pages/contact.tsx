// client/src/pages/contact.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mail, MessageSquare, Building2, Send, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    role: 'student',
    category: 'pilot',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    toast({
      title: "Inquiry Received",
      description: "Thank you for reaching out. Our team will get back to you within 24 hours.",
    });
  };

  return (
    <div className="min-h-screen bg-[#05060A] text-slate-100 py-12 relative overflow-x-hidden">
      {/* Aurora Ambient Background */}
      <div className="pointer-events-none fixed inset-0 z-[-10] overflow-hidden">
        <div className="aurora-blob-1 absolute top-[-100px] left-[-80px] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="aurora-blob-2 absolute top-[40%] right-[-120px] w-[450px] h-[450px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <div className="container max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25">
            <Building2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>Campus Pilots &amp; Support</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Contact MIRAL AI
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Planning a campus placement pilot, need technical support, or want to integrate MIRAL into your university or career bootcamp? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Contact Details & Info Cards */}
          <div className="space-y-4">
            <Card className="border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl rounded-2xl shadow-sm hover:border-indigo-500/30 transition-all card-gradient-top">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider font-mono">
                  <Mail className="h-4 w-4" />
                  Campus Pilot Inquiries
                </div>
                <CardTitle className="text-sm font-bold text-white mt-1">
                  University TPO &amp; Deans
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-400 space-y-1">
                <p>Deploy structured mock rounds and aggregate readiness analytics across student batches.</p>
                <p className="font-mono text-indigo-300 font-semibold pt-1">supportmiralai@gmail.com</p>
              </CardContent>
            </Card>

            <Card className="border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl rounded-2xl shadow-sm hover:border-cyan-500/30 transition-all card-gradient-top">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider font-mono">
                  <MessageSquare className="h-4 w-4" />
                  Candidate Support
                </div>
                <CardTitle className="text-sm font-bold text-white mt-1">
                  Students &amp; Practitioners
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-400 space-y-1">
                <p>Questions regarding camera permissions, speech analytics, or feature feedback.</p>
                <p className="font-mono text-cyan-300 font-semibold pt-1">supportmiralai@gmail.com</p>
              </CardContent>
            </Card>

            <Card className="border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl rounded-2xl shadow-sm hover:border-emerald-500/30 transition-all card-gradient-top">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
                  <ShieldCheck className="h-4 w-4" />
                  Security &amp; Compliance
                </div>
                <CardTitle className="text-sm font-bold text-white mt-1">
                  Data Protection &amp; Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-400 space-y-1">
                <p>Inquiries regarding client-side data ethics, account deletion, or DPDP compliance.</p>
                <p className="font-mono text-emerald-300 font-semibold pt-1">supportmiralai@gmail.com</p>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Inquiry Form */}
          <div className="md:col-span-2">
            <Card className="border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.08)] card-gradient-top">
              <CardHeader className="border-b border-white/[0.06] pb-4 bg-white/[0.02]">
                <CardTitle className="text-lg font-bold text-white">
                  Send an Inquiry
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Fill in your details below and our team will respond within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {isSubmitted ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">Message Sent Successfully</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Thank you for contacting MIRAL AI. We have received your request and will be in touch shortly.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs font-semibold mt-2 border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-slate-200"
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({ name: '', email: '', institution: '', role: 'student', category: 'pilot', message: '' });
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-name" className="text-xs font-semibold text-slate-300">Your Name</Label>
                        <Input
                          id="contact-name"
                          placeholder="e.g. Candidate Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="text-xs h-9 bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-slate-500 focus:border-indigo-500/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="contact-email" className="text-xs font-semibold text-slate-300">Email Address</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder="you@university.edu"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="text-xs h-9 bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-slate-500 focus:border-indigo-500/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-inst" className="text-xs font-semibold text-slate-300">College / Organization</Label>
                        <Input
                          id="contact-inst"
                          placeholder="e.g. Institute of Engineering &amp; Technology"
                          value={formData.institution}
                          onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                          className="text-xs h-9 bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-slate-500 focus:border-indigo-500/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="contact-role" className="text-xs font-semibold text-slate-300">Role / Persona</Label>
                        <select
                          id="contact-role"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full h-9 rounded-xl border border-white/[0.1] bg-white/[0.06] px-3 py-1 text-xs text-white shadow-xs focus:outline-none focus:border-indigo-500/60"
                        >
                          <option value="student" className="bg-[#090b10] text-white">Student / Placement Aspirant</option>
                          <option value="tpo" className="bg-[#090b10] text-white">Training &amp; Placement Officer (TPO)</option>
                          <option value="faculty" className="bg-[#090b10] text-white">College Dean / Faculty</option>
                          <option value="professional" className="bg-[#090b10] text-white">Working Professional / Debater</option>
                          <option value="other" className="bg-[#090b10] text-white">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contact-cat" className="text-xs font-semibold text-slate-300">Inquiry Subject</Label>
                      <select
                        id="contact-cat"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full h-9 rounded-xl border border-white/[0.1] bg-white/[0.06] px-3 py-1 text-xs text-white shadow-xs focus:outline-none focus:border-indigo-500/60"
                      >
                        <option value="pilot" className="bg-[#090b10] text-white">Request College Placement Pilot Access</option>
                        <option value="support" className="bg-[#090b10] text-white">Technical Support / Bug Report</option>
                        <option value="feedback" className="bg-[#090b10] text-white">Product Feedback &amp; Suggestions</option>
                        <option value="partnership" className="bg-[#090b10] text-white">Institutional Partnership</option>
                        <option value="other" className="bg-[#090b10] text-white">Other / General Inquiry</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contact-msg" className="text-xs font-semibold text-slate-300">Message / Pilot Requirements</Label>
                      <textarea
                        id="contact-msg"
                        rows={4}
                        placeholder="Tell us about your requirements, student batch size, or questions..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        className="w-full rounded-xl border border-white/[0.1] bg-white/[0.06] p-3 text-xs text-white shadow-xs focus:outline-none focus:border-indigo-500/60 resize-none placeholder:text-slate-500"
                      />
                    </div>

                    <Button type="submit" className="w-full text-xs font-semibold h-10 gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] border-0 rounded-xl">
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Inquiry</span>
                    </Button>

                  </form>
                )}
              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}
