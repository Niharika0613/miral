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
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Building2 className="h-3.5 w-3.5" />
            <span>Campus Pilots & Support</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Contact MIRAL AI
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Planning a campus placement pilot, need technical support, or want to integrate MIRAL into your university or career bootcamp? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Contact Details & Info Cards */}
          <div className="space-y-4">
            <Card className="border border-border/60 shadow-xs bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
                  <Mail className="h-4 w-4" />
                  Campus Pilot Inquiries
                </div>
                <CardTitle className="text-sm font-bold text-foreground mt-1">
                  University TPO & Deans
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <p>Deploy structured mock rounds and aggregate readiness analytics across student batches.</p>
                <p className="font-mono text-primary font-semibold pt-1">tpo-pilot@miral.ai</p>
              </CardContent>
            </Card>

            <Card className="border border-border/60 shadow-xs bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
                  <MessageSquare className="h-4 w-4" />
                  Candidate Support
                </div>
                <CardTitle className="text-sm font-bold text-foreground mt-1">
                  Students & Practitioners
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <p>Questions regarding camera permissions, speech analytics, or feature feedback.</p>
                <p className="font-mono text-primary font-semibold pt-1">support@miral.ai</p>
              </CardContent>
            </Card>

            <Card className="border border-border/60 shadow-xs bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-green-600 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4" />
                  Security & Compliance
                </div>
                <CardTitle className="text-sm font-bold text-foreground mt-1">
                  Data Protection Officer
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <p>Inquiries regarding client-side data ethics, account deletion, or DPDP compliance.</p>
                <p className="font-mono text-primary font-semibold pt-1">privacy@miral.ai</p>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Inquiry Form */}
          <div className="md:col-span-2">
            <Card className="border border-border/60 shadow-xs bg-card">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-lg font-bold text-foreground">
                  Send an Inquiry
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Fill in your details below and our team will respond within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {isSubmitted ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">Message Sent Successfully</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Thank you for contacting MIRAL AI. We have received your request and will be in touch shortly.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs font-semibold mt-2"
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
                        <Label htmlFor="contact-name" className="text-xs font-semibold text-foreground">Your Name</Label>
                        <Input
                          id="contact-name"
                          placeholder="e.g. Candidate Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="text-xs h-9"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="contact-email" className="text-xs font-semibold text-foreground">Email Address</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder="you@university.edu"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="text-xs h-9"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-inst" className="text-xs font-semibold text-foreground">College / Organization</Label>
                        <Input
                          id="contact-inst"
                          placeholder="e.g. Institute of Engineering & Technology"
                          value={formData.institution}
                          onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                          className="text-xs h-9"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="contact-role" className="text-xs font-semibold text-foreground">Role / Persona</Label>
                        <select
                          id="contact-role"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="student">Student / Placement Aspirant</option>
                          <option value="tpo">Training & Placement Officer (TPO)</option>
                          <option value="faculty">College Dean / Faculty</option>
                          <option value="professional">Working Professional / Debater</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contact-cat" className="text-xs font-semibold text-foreground">Inquiry Subject</Label>
                      <select
                        id="contact-cat"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="pilot">Request College Placement Pilot Access</option>
                        <option value="support">Technical Support / Bug Report</option>
                        <option value="feedback">Product Feedback & Suggestions</option>
                        <option value="partnership">Institutional Partnership</option>
                        <option value="other">Other / General Inquiry</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contact-msg" className="text-xs font-semibold text-foreground">Message / Pilot Requirements</Label>
                      <textarea
                        id="contact-msg"
                        rows={4}
                        placeholder="Tell us about your requirements, student batch size, or questions..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        className="w-full rounded-md border border-input bg-background p-3 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                      />
                    </div>

                    <Button type="submit" className="w-full text-xs font-semibold h-9 gap-1.5">
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
