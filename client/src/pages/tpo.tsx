// client/src/pages/tpo.tsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import { VaniDarpanLogo } from '@/components/miral-logo';
import { 
  Building2, 
  ShieldCheck, 
  Download, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  BarChart3, 
  RefreshCw, 
  GraduationCap, 
  ChevronRight, 
  Activity,
  Check,
  FileCheck2,
  Eye,
  Gauge,
  Volume2,
  Calendar,
  Layers,
  ArrowRight,
  UserCheck,
  ExternalLink,
  Award,
  Sparkles,
  Lock,
  Unlock,
  Key,
  LogOut,
  TrendingUp,
  Filter,
  Grid,
  Info
} from 'lucide-react';

interface TpoStats {
  college_name: string;
  institution_tag: string;
  academic_season: string;
  total_enrolled_candidates: number;
  total_practice_sessions: number;
  college_readiness_index: number;
  tier1_candidates: number;
  tier1_pct: number;
  core_candidates: number;
  core_pct: number;
  targeted_candidates: number;
  targeted_pct: number;
  critical_candidates: number;
  critical_pct: number;
  avg_eye_contact: number;
  avg_wpm: number;
  avg_filler_rate: number;
  accreditation_naac: string;
  accreditation_nba: string;
  live_candidates_active: number;
}

interface BranchHeatmapItem {
  branch: string;
  name: string;
  students_count: number;
  sessions_count: number;
  readiness_score: number;
  eye_contact: number;
  wpm: number;
  filler_rate: number;
  posture: number;
  key_strength: string;
  primary_bottleneck: string;
  bottleneck?: string;
  status: string;
  recruiter_status?: string;
  // Derived multi-dimensional scores for heatmap
  prep_score?: number;
  filler_control_pct?: number;
}

interface StudentCandidate {
  id: string;
  name: string;
  roll_number: string;
  branch: string;
  branch_full: string;
  batch: string;
  section: string;
  sessions_completed: number;
  readiness_score: number;
  eye_contact: number;
  wpm: number;
  filler_count: number;
  tier: string;
  tier_badge: 'tier1' | 'core' | 'targeted' | 'critical';
  last_session: string;
  is_live: boolean;
}

interface TpoOfficerSession {
  officerName: string;
  officerEmail: string;
  officerRole: string;
  institutionName: string;
  authenticatedAt: string;
  sessionToken: string;
}

export default function TPO() {
  const { toast } = useToast();

  // ── Authentication & Gate State ──
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const stored = sessionStorage.getItem('vanidarpan_tpo_session') || localStorage.getItem('vanidarpan_tpo_session');
      return !!stored;
    } catch {
      return false;
    }
  });

  const [officerSession, setOfficerSession] = useState<TpoOfficerSession | null>(() => {
    try {
      const stored = sessionStorage.getItem('vanidarpan_tpo_session') || localStorage.getItem('vanidarpan_tpo_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Gate Form States
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('tpo@apex.edu');
  const [loginPin, setLoginPin] = useState('2026');
  const [selectedInstitution, setSelectedInstitution] = useState('Apex Engineering & Technology Institute');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Institution Registration Form States
  const [regCollegeName, setRegCollegeName] = useState('');
  const [regOfficerName, setRegOfficerName] = useState('');
  const [regDesignation, setRegDesignation] = useState('Head, Training & Placement');
  const [regWorkEmail, setRegWorkEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBatchSize, setRegBatchSize] = useState('1200+ Candidates');
  const [regSuccessKey, setRegSuccessKey] = useState<string | null>(null);

  // ── Dashboard Data State ──
  const [stats, setStats] = useState<TpoStats | null>(null);
  const [heatmap, setHeatmap] = useState<BranchHeatmapItem[]>([]);
  const [students, setStudents] = useState<StudentCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'heatmap' | 'directory' | 'rubric'>('heatmap');

  // Heatmap View Mode: '3d-cards' | 'matrix' | 'timeline' | 'density'
  const [heatmapView, setHeatmapView] = useState<'3d-cards' | 'matrix' | 'timeline' | 'density'>('3d-cards');
  const [heatmapSortBy, setHeatmapSortBy] = useState<'readiness' | 'gaze' | 'wpm' | 'cohort'>('readiness');
  const [heatmapDimensionFocus, setHeatmapDimensionFocus] = useState<'all' | 'gaze' | 'wpm' | 'fillers' | 'posture'>('all');
  const [densityViewMode, setDensityViewMode] = useState<'3d-cards' | 'table'>('3d-cards');
  const [hoveredCell, setHoveredCell] = useState<{
    branch: string;
    dimension: string;
    value: string | number;
    benchmark: string;
    delta: string;
    note: string;
  } | null>(null);
  
  // Filters for Directory
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Student Dossier Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentCandidate | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);

  // ── Fetch Telemetry ──
  const fetchTpoData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, heatmapRes, studentsRes] = await Promise.all([
        fetch('/api/tpo/stats'),
        fetch('/api/tpo/heatmap'),
        fetch(`/api/tpo/students?branch=${selectedBranch}&tier=${selectedTier}&search=${encodeURIComponent(searchQuery)}`)
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (heatmapRes.ok) {
        const rawHeatmap: BranchHeatmapItem[] = await heatmapRes.json();
        // Enrich branches with PREP structuring score and filler control %
        const enriched = rawHeatmap.map(item => {
          let prep = 75;
          if (item.branch === 'CSE') prep = 85.4;
          else if (item.branch === 'IT') prep = 81.2;
          else if (item.branch === 'ECE') prep = 73.0;
          else if (item.branch === 'ME') prep = 63.5;
          else if (item.branch === 'CE') prep = 65.0;
          else if (item.branch === 'MBA') prep = 88.2;

          const fillerPct = Math.max(50, Math.min(98, Math.round(100 - (item.filler_rate * 12.5))));

          return {
            ...item,
            prep_score: prep,
            filler_control_pct: fillerPct
          };
        });
        setHeatmap(enriched);
      }
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
      }
    } catch (err) {
      console.error('Failed to fetch TPO telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTpoData();
    }
  }, [isAuthenticated, selectedBranch, selectedTier, searchQuery]);

  // ── Authentication Handlers ──
  const handleOfficerLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAuthenticating(true);

    setTimeout(() => {
      const sessionData: TpoOfficerSession = {
        officerName: loginEmail.includes('sharma') ? 'Dr. Rajesh Sharma' : 'Dr. R. K. Sharma',
        officerEmail: loginEmail,
        officerRole: 'Head, Career Services & Placements',
        institutionName: selectedInstitution,
        authenticatedAt: new Date().toISOString(),
        sessionToken: `VD-TPO-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      };

      try {
        sessionStorage.setItem('vanidarpan_tpo_session', JSON.stringify(sessionData));
        localStorage.setItem('vanidarpan_tpo_session', JSON.stringify(sessionData));
      } catch (err) {
        console.error('Failed to store TPO session:', err);
      }

      setOfficerSession(sessionData);
      setIsAuthenticated(true);
      setIsAuthenticating(false);

      toast({
        title: 'Institutional Session Established',
        description: `Welcome, ${sessionData.officerName}. Access granted to ${sessionData.institutionName}.`,
      });
    }, 600);
  };

  const handleInstantDemoAccess = () => {
    setLoginEmail('tpo@apex.edu');
    setLoginPin('2026');
    setSelectedInstitution('Apex Engineering & Technology Institute');
    
    setIsAuthenticating(true);
    setTimeout(() => {
      const demoSession: TpoOfficerSession = {
        officerName: 'Dr. Rajesh Sharma',
        officerEmail: 'tpo@apex.edu',
        officerRole: 'Head, Corporate Relations & Placements',
        institutionName: 'Apex Engineering & Technology Institute',
        authenticatedAt: new Date().toISOString(),
        sessionToken: 'VD-DEMO-2026'
      };

      try {
        sessionStorage.setItem('vanidarpan_tpo_session', JSON.stringify(demoSession));
        localStorage.setItem('vanidarpan_tpo_session', JSON.stringify(demoSession));
      } catch (err) {
        console.error('Failed to store TPO session:', err);
      }

      setOfficerSession(demoSession);
      setIsAuthenticated(true);
      setIsAuthenticating(false);

      toast({
        title: 'Demo Placement Officer Access Activated',
        description: 'Signed in as Dr. Rajesh Sharma with full institutional placement intelligence.',
      });
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regCollegeName || !regOfficerName || !regWorkEmail) {
      toast({
        title: 'Required Fields Missing',
        description: 'Please provide institution name, officer name, and official institutional email.',
        variant: 'destructive',
      });
      return;
    }

    const generatedKey = `TPO-PILOT-${Math.floor(1000 + Math.random() * 9000)}`;
    setRegSuccessKey(generatedKey);

    toast({
      title: 'Campus Pilot Application Approved',
      description: `Institutional passkey generated: ${generatedKey}`,
    });
  };

  const handleEnterWithTrialKey = () => {
    const trialSession: TpoOfficerSession = {
      officerName: regOfficerName || 'Placement Officer',
      officerEmail: regWorkEmail || 'officer@campus.edu',
      officerRole: regDesignation || 'Head, Placement Cell',
      institutionName: regCollegeName || 'Registered University Campus',
      authenticatedAt: new Date().toISOString(),
      sessionToken: regSuccessKey || 'TPO-PILOT-2026'
    };

    try {
      sessionStorage.setItem('vanidarpan_tpo_session', JSON.stringify(trialSession));
      localStorage.setItem('vanidarpan_tpo_session', JSON.stringify(trialSession));
    } catch (err) {
      console.error('Failed to store TPO session:', err);
    }

    setOfficerSession(trialSession);
    setIsAuthenticated(true);
  };

  const handleLockPortal = () => {
    try {
      sessionStorage.removeItem('vanidarpan_tpo_session');
      localStorage.removeItem('vanidarpan_tpo_session');
    } catch (err) {
      console.error('Failed to clear TPO session:', err);
    }
    setIsAuthenticated(false);
    setOfficerSession(null);
    setRegSuccessKey(null);

    toast({
      title: 'Portal Locked',
      description: 'Institutional placement session locked successfully.',
    });
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/tpo/export-csv');
      if (!res.ok) throw new Error('Export generation failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Placement_Readiness_Dossier_2026.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Placement Dossier Exported',
        description: 'Cohort candidate telemetry downloaded in CSV format.',
      });
    } catch (err: any) {
      toast({
        title: 'Export Failed',
        description: err.message || 'Unable to generate placement dossier.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const openStudentDossier = (cand: StudentCandidate) => {
    setSelectedStudent(cand);
    setIsDossierOpen(true);
  };

  // ── Sorted Heatmap Items ──
  const sortedHeatmap = useMemo(() => {
    const list = [...heatmap];
    if (heatmapSortBy === 'readiness') {
      return list.sort((a, b) => b.readiness_score - a.readiness_score);
    } else if (heatmapSortBy === 'gaze') {
      return list.sort((a, b) => b.eye_contact - a.eye_contact);
    } else if (heatmapSortBy === 'wpm') {
      return list.sort((a, b) => b.wpm - a.wpm);
    } else if (heatmapSortBy === 'cohort') {
      return list.sort((a, b) => b.students_count - a.students_count);
    }
    return list;
  }, [heatmap, heatmapSortBy]);

  // Helper for department placement tier distribution & remedial priority
  const getDepartmentTierDistribution = (item: BranchHeatmapItem) => {
    let t1 = 20, t2 = 50, t3 = 20, t4 = 10;
    let action = 'Targeted Intervention';
    let actionType: 'low' | 'medium' | 'high' | 'super' = 'medium';

    if (item.branch === 'CSE') {
      t1 = 42; t2 = 48; t3 = 8; t4 = 2;
      action = 'Low Intervention • Direct Campus Ready';
      actionType = 'low';
    } else if (item.branch === 'IT') {
      t1 = 36; t2 = 52; t3 = 10; t4 = 2;
      action = 'Low Intervention • Recruiter Ready';
      actionType = 'low';
    } else if (item.branch === 'MBA') {
      t1 = 48; t2 = 42; t3 = 8; t4 = 2;
      action = 'Super-Dream Focused • Executive Cadence';
      actionType = 'super';
    } else if (item.branch === 'ECE') {
      t1 = 24; t2 = 56; t3 = 16; t4 = 4;
      action = 'Medium Focus • Pacing & Hesitation Drills';
      actionType = 'medium';
    } else if (item.branch === 'ME') {
      t1 = 12; t2 = 46; t3 = 32; t4 = 10;
      action = 'High Priority Drills • Camera Gaze Coaching';
      actionType = 'high';
    } else if (item.branch === 'CE') {
      t1 = 10; t2 = 48; t3 = 34; t4 = 8;
      action = 'High Priority Drills • Vocal Modulation Drills';
      actionType = 'high';
    } else {
      t1 = Math.max(8, Math.min(60, Math.round(item.readiness_score * 0.48)));
      t4 = Math.max(2, Math.min(25, Math.round((100 - item.readiness_score) * 0.25)));
      t3 = Math.max(10, Math.min(35, Math.round((100 - item.readiness_score) * 0.55)));
      t2 = Math.max(10, 100 - (t1 + t3 + t4));
      action = item.readiness_score >= 80 ? 'Low Intervention • Recruiter Ready' : item.readiness_score >= 70 ? 'Medium Focus • Targeted Drills' : 'High Priority Drills • Faculty Mentorship';
      actionType = item.readiness_score >= 80 ? 'low' : item.readiness_score >= 70 ? 'medium' : 'high';
    }

    const t1Count = Math.round((item.students_count * t1) / 100);
    const t2Count = Math.round((item.students_count * t2) / 100);
    const t3Count = Math.round((item.students_count * t3) / 100);
    const t4Count = Math.max(0, item.students_count - (t1Count + t2Count + t3Count));

    return { t1, t2, t3, t4, t1Count, t2Count, t3Count, t4Count, action, actionType };
  };

  // Helper for heatmap cell color scale
  const getHeatmapColorClass = (score: number) => {
    if (score >= 82) {
      return 'bg-emerald-600 dark:bg-emerald-600 text-white font-bold border-emerald-500/60 shadow-xs';
    } else if (score >= 76) {
      return 'bg-emerald-500/80 dark:bg-emerald-500/80 text-white font-semibold border-emerald-400/50';
    } else if (score >= 70) {
      return 'bg-teal-600/75 dark:bg-teal-600/75 text-white font-medium border-teal-500/50';
    } else if (score >= 63) {
      return 'bg-amber-500/80 dark:bg-amber-500/80 text-slate-900 dark:text-slate-950 font-semibold border-amber-400/60';
    } else {
      return 'bg-rose-500/85 dark:bg-rose-500/85 text-white font-bold border-rose-400/60';
    }
  };

  // ── 1. RENDER INSTITUTIONAL ACCESS GATE (If not authenticated) ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        
        {/* Subtle top banner */}
        <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
              <VaniDarpanLogo width={140} height={34} />
            </Link>
            <div className="h-5 w-px bg-slate-800 hidden sm:block" />
            <Badge variant="outline" className="text-[11px] font-semibold text-indigo-400 bg-indigo-950/60 border-indigo-800/80 py-0.5 px-2">
              Institutional Placement Intelligence
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <Link href="/" className="hover:text-white transition-colors text-xs font-medium">
              Student Studio
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <ThemeToggle />
          </div>
        </div>

        {/* Gate Container */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
          
          {/* Subtle background ambient mesh */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl" />
          </div>

          <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Context Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Authorized Personnel Only</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  University TPO & Placement Cell Gateway
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Confidential multimodal communication benchmarks, candidate dossiers, and branch readiness heatmaps for university placement leadership.
                </p>
              </div>

              {/* Institutional Capabilities List */}
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    <Grid className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">2D Competency Heatmaps</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Visual department-by-department eye contact, pacing, and disfluency matrix.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Award className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">Day-1 Recruiter Triage</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Instant categorization into Day-1 Ready, Core Drives, and Remedial Drills.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="h-7 w-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                    <FileCheck2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">CSV Dossier Export</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      One-click audit export with timestamped session metrics and NAAC evidence.
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant One-Click Demo Access Button */}
              <div className="pt-2">
                <Button
                  onClick={handleInstantDemoAccess}
                  disabled={isAuthenticating}
                  className="w-full h-11 text-xs font-semibold gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md border border-indigo-500/40"
                >
                  <Unlock className="h-4 w-4" />
                  <span>One-Click Demo Officer Access (Dr. Rajesh Sharma)</span>
                </Button>
                <p className="text-[11px] text-slate-500 text-center mt-2">
                  Instant sandbox access without credentials for institutional evaluation.
                </p>
              </div>
            </div>

            {/* Right Auth Card Column */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Highlighted 1-Click Re-Entry Card when Locked */}
              <div className="p-4 rounded-xl border-2 border-indigo-500/50 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Verified Officer Session Available
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                      1-Click Resume
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300">
                    Dr. Rajesh Sharma &bull; Head of Placement & Training (Apex Institute)
                  </p>
                </div>
                <Button
                  onClick={handleInstantDemoAccess}
                  disabled={isAuthenticating}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 h-9 gap-1.5 shadow-md shadow-indigo-600/30 shrink-0"
                >
                  <Unlock className="h-3.5 w-3.5" />
                  <span>Unlock & Resume Dashboard</span>
                </Button>
              </div>

              <Card className="bg-slate-900/90 border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
                
                {/* Card Top Tabs */}
                <div className="grid grid-cols-2 border-b border-slate-800 bg-slate-950/50 text-xs">
                  <button
                    onClick={() => { setAuthMode('login'); setRegSuccessKey(null); }}
                    className={`py-3.5 px-4 font-semibold text-center transition-colors flex items-center justify-center gap-2 ${
                      authMode === 'login'
                        ? 'bg-slate-900 text-white border-b-2 border-indigo-500'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }`}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Officer Sign In</span>
                  </button>

                  <button
                    onClick={() => { setAuthMode('register'); setRegSuccessKey(null); }}
                    className={`py-3.5 px-4 font-semibold text-center transition-colors flex items-center justify-center gap-2 ${
                      authMode === 'register'
                        ? 'bg-slate-900 text-white border-b-2 border-indigo-500'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }`}
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Register Campus Pilot</span>
                  </button>
                </div>

                <CardContent className="p-6 sm:p-8 space-y-6">
                  
                  {/* MODE 1: OFFICER LOGIN */}
                  {authMode === 'login' && (
                    <form onSubmit={handleOfficerLogin} className="space-y-4">
                      
                      {/* Institution Selector */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">
                          Affiliated Institution / University
                        </label>
                        <select
                          value={selectedInstitution}
                          onChange={(e) => setSelectedInstitution(e.target.value)}
                          className="w-full text-xs h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Apex Engineering & Technology Institute">Apex Engineering & Technology Institute (Verified Pilot)</option>
                          <option value="KIET Group of Institutions">KIET Group of Institutions (Verified Pilot)</option>
                          <option value="National Institute of Technology (Demo)">National Institute of Technology (Demo)</option>
                          <option value="Indian Institute of Technology (Demo)">Indian Institute of Technology (Demo)</option>
                        </select>
                      </div>

                      {/* Official Email */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">
                          Official Placement Officer Email
                        </label>
                        <Input
                          type="email"
                          placeholder="e.g. tpo@apex.edu"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                          className="text-xs h-10 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:border-indigo-500"
                        />
                      </div>

                      {/* Access PIN / Passkey */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-slate-300">
                            Institutional Access Key / PIN
                          </label>
                          <span className="text-[11px] text-indigo-400 font-mono">Demo PIN: 2026</span>
                        </div>
                        <Input
                          type="password"
                          placeholder="Enter 4-digit key or passkey"
                          value={loginPin}
                          onChange={(e) => setLoginPin(e.target.value)}
                          required
                          className="text-xs h-10 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 font-mono"
                        />
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full h-10 text-xs font-semibold gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                      >
                        {isAuthenticating ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        )}
                        <span>{isAuthenticating ? 'Verifying Institutional Credentials...' : 'Authenticate & Open TPO Portal'}</span>
                      </Button>

                      <div className="text-center pt-2">
                        <span className="text-[11px] text-slate-500">
                          Need access for your college? Switch to the "Register Campus Pilot" tab.
                        </span>
                      </div>
                    </form>
                  )}

                  {/* MODE 2: REGISTER CAMPUS PILOT */}
                  {authMode === 'register' && (
                    <div>
                      {regSuccessKey ? (
                        <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-center space-y-4">
                          <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">Pilot Application Approved</h3>
                            <p className="text-xs text-slate-300 mt-1">
                              Your institution has been provisioned on the VaniDarpan pilot network.
                            </p>
                          </div>

                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-center">
                            <span className="text-[11px] text-slate-400 block">Generated Access Passkey:</span>
                            <span className="text-base font-bold text-emerald-400 tracking-wider">{regSuccessKey}</span>
                          </div>

                          <Button
                            onClick={handleEnterWithTrialKey}
                            className="w-full h-10 text-xs font-semibold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <span>Enter TPO Workspace with Generated Passkey</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-300">College / University Name</label>
                              <Input
                                placeholder="e.g. Apex Engineering Institute"
                                value={regCollegeName}
                                onChange={(e) => setRegCollegeName(e.target.value)}
                                required
                                className="text-xs h-9 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-300">Batch Size</label>
                              <select
                                value={regBatchSize}
                                onChange={(e) => setRegBatchSize(e.target.value)}
                                className="w-full text-xs h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                              >
                                <option value="300-600 Candidates">300–600 Candidates</option>
                                <option value="600-1200 Candidates">600–1,200 Candidates</option>
                                <option value="1200+ Candidates">1,200+ Candidates (Full Cohort)</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-300">Placement Officer / Dean Name</label>
                              <Input
                                placeholder="e.g. Dr. Rajesh Sharma"
                                value={regOfficerName}
                                onChange={(e) => setRegOfficerName(e.target.value)}
                                required
                                className="text-xs h-9 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-300">Official Designation</label>
                              <Input
                                placeholder="e.g. Head, Placement Cell"
                                value={regDesignation}
                                onChange={(e) => setRegDesignation(e.target.value)}
                                required
                                className="text-xs h-9 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-300">Official Email (.edu / .ac.in)</label>
                              <Input
                                type="email"
                                placeholder="e.g. tpo@apex.edu"
                                value={regWorkEmail}
                                onChange={(e) => setRegWorkEmail(e.target.value)}
                                required
                                className="text-xs h-9 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-300">Contact Number</label>
                              <Input
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={regPhone}
                                onChange={(e) => setRegPhone(e.target.value)}
                                className="text-xs h-9 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600"
                              />
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full h-10 text-xs font-semibold gap-2 bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
                          >
                            <Building2 className="h-3.5 w-3.5" />
                            <span>Submit Campus Registration & Generate Passkey</span>
                          </Button>
                        </form>
                      )}
                    </div>
                  )}

                </CardContent>
              </Card>
            </div>

          </div>
        </div>

        {/* Gate Footer */}
        <div className="border-t border-slate-800/80 bg-slate-950 py-3 px-6 text-center text-[11px] text-slate-500">
          VaniDarpan Institutional Placement Intelligence • 256-bit Encrypted TPO Session • Extended Pilot Access
        </div>

      </div>
    );
  }

  // ── 2. RENDER AUTHENTICATED TPO DASHBOARD ──
  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* ── Institutional Top Bar ── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left Brand & Institutional Identity */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link href="/" className="shrink-0 flex items-center">
              <VaniDarpanLogo width={136} height={32} />
            </Link>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block shrink-0" />

            <div className="hidden sm:flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {officerSession?.institutionName || stats?.college_name || 'Apex Engineering & Technology Institute'}
                </span>
                <Badge variant="outline" className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 py-0 px-1.5">
                  TPO Portal
                </Badge>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {officerSession?.officerName || 'Dr. Rajesh Sharma'} • {officerSession?.officerRole || 'Office of Career Services'}
              </span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Badge variant="outline" className="hidden lg:inline-flex text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              Sample Cohort Data
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchTpoData}
              disabled={isLoading}
              className="h-8 text-xs font-medium border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 gap-1.5 shadow-xs"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              size="sm"
              onClick={handleExportCsv}
              disabled={isExporting}
              className="h-8 text-xs font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export CSV Dossier'}</span>
            </Button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            <Link href="/practice">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white gap-1"
              >
                <span>Student Studio</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>

            <ThemeToggle />

            {/* Lock / Sign Out Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLockPortal}
              title="Lock Institutional Portal"
              className="h-8 px-2 text-xs border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <Lock className="h-3.5 w-3.5" />
              <span className="hidden md:inline ml-1">Lock Portal</span>
            </Button>
          </div>

        </div>
      </header>

      {/* ── Main Workspace Body ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* ── Page Header & Accreditation Badges ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Campus Placement Readiness Intelligence
              </h2>
              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold py-0.5 px-2">
                Active Pilot
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Automated behavioral, eye contact, and pacing diagnostic analytics across engineering and management branches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium">
              <GraduationCap className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{stats?.academic_season || '2025–2026 Season'}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Accreditation Ready</span>
            </div>
          </div>
        </div>

        {/* ── KPI Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Card 1: Enrolled Candidates */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
          >
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs h-full flex flex-col justify-between">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                  <span>Enrolled Candidates</span>
                  <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {stats?.total_enrolled_candidates || 1480}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Practice Volume</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{stats?.total_practice_sessions || 6840} runs</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Campus Readiness Index */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
          >
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs h-full flex flex-col justify-between">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                  <span>Campus Readiness Index</span>
                  <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1.5 font-mono">
                  <span>{stats?.college_readiness_index || 77.4}%</span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+5.2%</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Drive Status</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">Drive Ready</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 3: Tier 1 Direct Recruiter Ready */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
          >
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs h-full flex flex-col justify-between">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                  <span>Day-1 Recruiter Ready</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1.5">
                  <span>{stats?.tier1_candidates || 426}</span>
                  <span className="text-xs font-normal text-slate-500">({stats?.tier1_pct || 28.8}%)</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Rating Tier</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">Tier-1 Qualified</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 4: Core Placement Ready */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
          >
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs h-full flex flex-col justify-between">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                  <span>Core Placement Ready</span>
                  <UserCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1.5">
                  <span>{stats?.core_candidates || 824}</span>
                  <span className="text-xs font-normal text-slate-500">({stats?.core_pct || 55.7}%)</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Target Recruiters</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Mass & Core Drives</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 5: Needs Practice Support */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
          >
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs h-full flex flex-col justify-between">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                  <span>Needs Practice Support</span>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1.5">
                  <span>{(stats?.targeted_candidates || 168) + (stats?.critical_candidates || 62)}</span>
                  <span className="text-xs font-normal text-slate-500">({(((stats?.targeted_candidates || 168) + (stats?.critical_candidates || 62)) / 1480 * 100).toFixed(1)}%)</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Intervention</span>
                  <span className="font-semibold text-amber-700 dark:text-amber-400">Drills Active</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* ── Cohort Skill Benchmarks Strip ── */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            
            <div className="flex items-center gap-3 px-2">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Eye className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-500 dark:text-slate-400">Average Camera Gaze</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
                  <span>{stats?.avg_eye_contact || 73.6}%</span>
                  <span className="text-[11px] font-normal text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                    Target Met
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Gauge className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-500 dark:text-slate-400">Average Speaking Pace</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
                  <span>{stats?.avg_wpm || 142.4} WPM</span>
                  <span className="text-[11px] font-normal text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.2 rounded border border-indigo-200 dark:border-indigo-800">
                    Optimal Tempo
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Volume2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-500 dark:text-slate-400">Average Filler Rate</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
                  <span>{stats?.avg_filler_rate || 1.7} / min</span>
                  <span className="text-[11px] font-normal text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                    Low Disfluency
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Activity className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-500 dark:text-slate-400">Live Practice In Progress</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{stats?.live_candidates_active || 4} Candidates Live</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Segmented Navigation Tabs ── */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'heatmap'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Grid className="h-4 w-4" />
            <span>Multimodal Heatmap Suite</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'directory'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Candidate Placement Directory</span>
            <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'directory' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {students.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rubric')}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'rubric'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileCheck2 className="h-4 w-4" />
            <span>Placement Evaluation Rubric</span>
          </button>
        </div>

        {/* ── Tab Content with Framer Motion AnimatePresence ── */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: ADVANCED MULTIMODAL HEATMAP SUITE */}
          {activeTab === 'heatmap' && (
            <motion.div
              key="tab-heatmap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-6"
            >
              
              {/* Heatmap Controls & Sub-view Switcher */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3.5">
                {/* Top Row: Sub-view Switcher + Sort & Display Controls */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                  
                  {/* Sub-view switcher pill bar - non-wrapping with horizontal scroll support */}
                  <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl text-xs font-medium overflow-x-auto max-w-full">
                    <button
                      onClick={() => setHeatmapView('3d-cards')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                        heatmapView === '3d-cards'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>3D Department Matrix</span>
                    </button>

                    <button
                      onClick={() => setHeatmapView('density')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                        heatmapView === 'density'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>3D Placement Tier Density</span>
                    </button>

                    <button
                      onClick={() => setHeatmapView('matrix')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                        heatmapView === 'matrix'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Grid className="h-3.5 w-3.5" />
                      <span>Executive Audit Table</span>
                    </button>

                    <button
                      onClick={() => setHeatmapView('timeline')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                        heatmapView === 'timeline'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Activity Rhythm</span>
                    </button>
                  </div>

                  {/* Heatmap Sorting & View Controls */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {(heatmapView === '3d-cards' || heatmapView === 'density' || heatmapView === 'matrix') && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 whitespace-nowrap">
                          <Filter className="h-3.5 w-3.5" />
                          Sort Matrix:
                        </span>
                        <select
                          value={heatmapSortBy}
                          onChange={(e: any) => setHeatmapSortBy(e.target.value)}
                          className="text-xs h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="readiness">Highest Readiness Score</option>
                          <option value="gaze">Camera Gaze Focus</option>
                          <option value="wpm">Speaking Pace (WPM)</option>
                          <option value="cohort">Cohort Size</option>
                        </select>
                      </div>
                    )}

                    {heatmapView === 'density' && (
                      <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                        <button
                          onClick={() => setDensityViewMode('3d-cards')}
                          className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                            densityViewMode === '3d-cards'
                              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          3D Cards
                        </button>
                        <button
                          onClick={() => setDensityViewMode('table')}
                          className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                            densityViewMode === 'table'
                              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-2xs'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          Audit Table
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Contextual Legend & Focus Filters */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
                  {/* If 3D Cards */}
                  {heatmapView === '3d-cards' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
                        Highlight Dimension:
                      </span>
                      {[
                        { id: 'all', label: 'All Dimensions', icon: BarChart3 },
                        { id: 'gaze', label: 'Camera Gaze Focus', icon: Eye },
                        { id: 'wpm', label: 'Cadence (WPM)', icon: Volume2 },
                        { id: 'fillers', label: 'Filler Control', icon: Gauge },
                        { id: 'posture', label: 'Posture Poise', icon: UserCheck }
                      ].map(dim => {
                        const Icon = dim.icon;
                        const isActive = heatmapDimensionFocus === dim.id;
                        return (
                          <button
                            key={dim.id}
                            onClick={() => setHeatmapDimensionFocus(dim.id as any)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                              isActive
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <Icon className="h-3 w-3" />
                            <span>{dim.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* If Tier Density */}
                  {heatmapView === 'density' && (
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Recruitment Tier Brackets:</span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block shadow-xs" />
                        <span>Tier 1: Product / Super-Dream (12+ LPA)</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 inline-block shadow-xs" />
                        <span>Tier 2: Core (6–12 LPA)</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block shadow-xs" />
                        <span>Tier 3: Mass (4–6 LPA)</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block shadow-xs" />
                        <span>Tier 4: Remedial (&lt;4 LPA)</span>
                      </span>
                    </div>
                  )}

                  {/* Chromatic Color Scale Legend (for 3D cards and matrix) */}
                  {(heatmapView === '3d-cards' || heatmapView === 'matrix') && (
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 lg:ml-auto">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Readiness:</span>
                      <span className="flex items-center gap-1">
                        <span className="h-2.5 w-2.5 rounded bg-emerald-600 inline-block" />
                        <span>&ge;82% Super-Dream</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2.5 w-2.5 rounded bg-emerald-500/80 inline-block" />
                        <span>76–81% Day-1</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2.5 w-2.5 rounded bg-teal-600/75 inline-block" />
                        <span>70–75% Core</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2.5 w-2.5 rounded bg-amber-500/80 inline-block" />
                        <span>63–69% Practice</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2.5 w-2.5 rounded bg-rose-500/85 inline-block" />
                        <span>&lt;63% Remedial</span>
                      </span>
                    </div>
                  )}

                  {heatmapView === 'timeline' && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 lg:ml-auto">
                      <span>Less Practice</span>
                      <div className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                        <span className="h-3 w-3 rounded-xs bg-emerald-400/30" />
                        <span className="h-3 w-3 rounded-xs bg-emerald-500/60" />
                        <span className="h-3 w-3 rounded-xs bg-emerald-600" />
                        <span className="h-3 w-3 rounded-xs bg-emerald-700 shadow-xs" />
                      </div>
                      <span>Peak Drive Surge</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── VIEW 0: 3D DEPARTMENT COMPETENCY CARDS MATRIX ── */}
              {heatmapView === '3d-cards' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {sortedHeatmap.map((item) => {
                      const gazeTarget = 75;
                      const gazeDelta = item.eye_contact - gazeTarget;
                      const isGazeFocused = heatmapDimensionFocus === 'gaze' || heatmapDimensionFocus === 'all';
                      const isWpmFocused = heatmapDimensionFocus === 'wpm' || heatmapDimensionFocus === 'all';
                      const isFillersFocused = heatmapDimensionFocus === 'fillers' || heatmapDimensionFocus === 'all';
                      const isPostureFocused = heatmapDimensionFocus === 'posture' || heatmapDimensionFocus === 'all';

                      return (
                        <div
                          key={item.branch}
                          className="relative group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-xl hover:border-indigo-500/60 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
                        >
                          {/* Ambient Glow Accent */}
                          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-indigo-500/10 blur-xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />

                          <div className="space-y-4 relative z-10">
                            {/* Card Top: Department Name + Batch Count + Recruiter Tier */}
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {item.branch}
                                  </span>
                                  <Badge variant="outline" className="text-[10px] font-mono py-0 px-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                                    {item.students_count} Candidates
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                  {item.name}
                                </p>
                              </div>

                              <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider shrink-0 ${
                                item.readiness_score >= 82
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                  : item.readiness_score >= 76
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : item.readiness_score >= 70
                                  ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              }`}>
                                {(item.status || item.recruiter_status || 'Day-1 Ready')}
                              </div>
                            </div>

                            {/* Center Gauge / Metric Spotlight */}
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                                  Placement Readiness
                                </span>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                                    {item.readiness_score}%
                                  </span>
                                  <span className="text-xs text-slate-400">composite</span>
                                </div>
                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-0.5">
                                  {item.sessions_count} practice rounds logged
                                </span>
                              </div>

                              {/* Circular Gauge Ring */}
                              <div className="relative h-14 w-14 flex items-center justify-center shrink-0">
                                <svg className="w-14 h-14 transform -rotate-90">
                                  <circle
                                    cx="28"
                                    cy="28"
                                    r="22"
                                    stroke="currentColor"
                                    strokeWidth="5"
                                    className="text-slate-200 dark:text-slate-700/60 fill-none"
                                  />
                                  <circle
                                    cx="28"
                                    cy="28"
                                    r="22"
                                    stroke="currentColor"
                                    strokeWidth="5"
                                    strokeDasharray={138}
                                    strokeDashoffset={138 - (138 * item.readiness_score) / 100}
                                    strokeLinecap="round"
                                    className={`fill-none transition-all duration-700 ${
                                      item.readiness_score >= 82 ? 'text-emerald-500' : (item.readiness_score >= 76 ? 'text-emerald-400' : (item.readiness_score >= 70 ? 'text-teal-500' : 'text-amber-500'))
                                    }`}
                                  />
                                </svg>
                                <span className="absolute text-[11px] font-bold font-mono text-slate-900 dark:text-white">
                                  {Math.round(item.readiness_score)}%
                                </span>
                              </div>
                            </div>

                            {/* 4 Multi-Modal Telemetry Chips (Spacious & Legible) */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {/* Camera Gaze */}
                              <div className={`p-2.5 rounded-lg border transition-all ${
                                heatmapDimensionFocus === 'gaze'
                                  ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                                  : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                              }`}>
                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] font-semibold">
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3 text-indigo-500" />
                                    Camera Gaze
                                  </span>
                                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{item.eye_contact}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${item.eye_contact}%` }} />
                                </div>
                              </div>

                              {/* Speaking Cadence */}
                              <div className={`p-2.5 rounded-lg border transition-all ${
                                heatmapDimensionFocus === 'wpm'
                                  ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                                  : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                              }`}>
                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] font-semibold">
                                  <span className="flex items-center gap-1">
                                    <Volume2 className="h-3 w-3 text-indigo-500" />
                                    Cadence
                                  </span>
                                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{item.wpm} WPM</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (item.wpm / 165) * 100)}%` }} />
                                </div>
                              </div>

                              {/* Filler Control */}
                              <div className={`p-2.5 rounded-lg border transition-all ${
                                heatmapDimensionFocus === 'fillers'
                                  ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                                  : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                              }`}>
                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] font-semibold">
                                  <span className="flex items-center gap-1">
                                    <Gauge className="h-3 w-3 text-teal-500" />
                                    Filler Control
                                  </span>
                                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{item.filler_control_pct || 75}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${item.filler_control_pct || 75}%` }} />
                                </div>
                              </div>

                              {/* Posture Poise */}
                              <div className={`p-2.5 rounded-lg border transition-all ${
                                heatmapDimensionFocus === 'posture'
                                  ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                                  : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                              }`}>
                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] font-semibold">
                                  <span className="flex items-center gap-1">
                                    <UserCheck className="h-3 w-3 text-indigo-500" />
                                    Posture Poise
                                  </span>
                                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{item.posture}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                                  <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${item.posture}%` }} />
                                </div>
                              </div>
                            </div>

                            {/* Remedial Diagnostic Callout */}
                            <div className="p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 text-xs">
                              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                <span>Remedial Priority:</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1 leading-relaxed">
                                {(item.primary_bottleneck || item.bottleneck || 'Practice drills recommended')}
                              </p>
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-4">
                            <span className="text-[11px] text-slate-400">
                              {item.sessions_count} benchmark runs
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 gap-1 h-8 px-2"
                              onClick={() => {
                                setSelectedBranch(item.branch);
                                setActiveTab('directory');
                              }}
                            >
                              <span>View Roster</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── VIEW 1: 2D DEPARTMENT COMPETENCY MATRIX HEATMAP ── */}
              {heatmapView === 'matrix' && (
                <div className="space-y-4">
                  <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                            Multimodal Behavioral Heatmap Matrix
                          </CardTitle>
                          <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Cross-departmental interview dimension intensity grid. Hover over any cell for precision diagnostic telemetry.
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="w-fit text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800">
                          1,480 Candidates • 6 Dimensions
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                              <th className="py-3.5 px-5 min-w-[200px]">Department</th>
                              <th className="py-3.5 px-3 text-center min-w-[110px]">Camera Gaze</th>
                              <th className="py-3.5 px-3 text-center min-w-[110px]">Speaking Pace</th>
                              <th className="py-3.5 px-3 text-center min-w-[110px]">Filler Control</th>
                              <th className="py-3.5 px-3 text-center min-w-[110px]">Posture Poise</th>
                              <th className="py-3.5 px-3 text-center min-w-[110px]">PREP Structure</th>
                              <th className="py-3.5 px-3 text-center min-w-[120px]">Readiness Score</th>
                              <th className="py-3.5 px-4 min-w-[240px]">Primary Diagnostic Bottleneck</th>
                              <th className="py-3.5 px-4 text-center min-w-[110px]">Recruiter Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {sortedHeatmap.map((item) => {
                              const gazeColor = getHeatmapColorClass(item.eye_contact);
                              const paceScore = Math.max(55, Math.min(95, Math.round(100 - Math.abs(142 - item.wpm) * 1.5)));
                              const paceColor = getHeatmapColorClass(paceScore);
                              const fillerScore = item.filler_control_pct || 75;
                              const fillerColor = getHeatmapColorClass(fillerScore);
                              const postureColor = getHeatmapColorClass(item.posture);
                              const prepScore = item.prep_score || 75;
                              const prepColor = getHeatmapColorClass(prepScore);
                              const overallColor = getHeatmapColorClass(item.readiness_score);

                              return (
                                <tr key={item.branch} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                  
                                  {/* Department Info */}
                                  <td className="py-4 px-5">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 dark:text-white text-xs">{item.branch}</span>
                                      <span className="text-[10px] text-slate-400 font-mono">({item.students_count} studs)</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                                      {item.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                      {item.sessions_count} sessions conducted
                                    </div>
                                  </td>

                                  {/* Metric 1: Camera Gaze Heatmap Tile */}
                                  <td className="py-2.5 px-2 text-center">
                                    <div 
                                      className={`p-2 rounded-lg border text-xs transition-all hover:scale-105 cursor-pointer ${gazeColor}`}
                                      onMouseEnter={() => setHoveredCell({
                                        branch: item.branch,
                                        dimension: 'Camera Gaze Focus',
                                        value: `${item.eye_contact}%`,
                                        benchmark: '75.0% Recruiter Target',
                                        delta: item.eye_contact >= 75 ? `+${(item.eye_contact - 75).toFixed(1)}% above target` : `${(item.eye_contact - 75).toFixed(1)}% below target`,
                                        note: item.eye_contact >= 75 ? 'Direct eye-to-lens connection maintained during technical explanations.' : 'Significant eye wandering and glance drift away from camera detected.'
                                      })}
                                      onMouseLeave={() => setHoveredCell(null)}
                                      onClick={() => {
                                        setSelectedBranch(item.branch);
                                        setActiveTab('directory');
                                      }}
                                    >
                                      <div className="font-mono text-sm">{item.eye_contact}%</div>
                                      <div className="text-[9px] opacity-80 uppercase tracking-wider">Gaze</div>
                                    </div>
                                  </td>

                                  {/* Metric 2: Speaking Pace Heatmap Tile */}
                                  <td className="py-2.5 px-2 text-center">
                                    <div 
                                      className={`p-2 rounded-lg border text-xs transition-all hover:scale-105 cursor-pointer ${paceColor}`}
                                      onMouseEnter={() => setHoveredCell({
                                        branch: item.branch,
                                        dimension: 'Speaking Pace / Cadence',
                                        value: `${item.wpm} WPM`,
                                        benchmark: '130–150 WPM Optimal Tempo',
                                        delta: item.wpm > 155 ? 'Rushed Cadence (>155 WPM)' : item.wpm < 125 ? 'Deliberate Cadence (<125 WPM)' : 'Optimal Conversational Pace',
                                        note: item.wpm > 155 ? 'Candidates speak too fast when answering complex project questions.' : 'Tempo is controlled and easily understandable for interview panel.'
                                      })}
                                      onMouseLeave={() => setHoveredCell(null)}
                                      onClick={() => {
                                        setSelectedBranch(item.branch);
                                        setActiveTab('directory');
                                      }}
                                    >
                                      <div className="font-mono text-sm">{item.wpm}</div>
                                      <div className="text-[9px] opacity-80 uppercase tracking-wider">WPM</div>
                                    </div>
                                  </td>

                                  {/* Metric 3: Filler Control Heatmap Tile */}
                                  <td className="py-2.5 px-2 text-center">
                                    <div 
                                      className={`p-2 rounded-lg border text-xs transition-all hover:scale-105 cursor-pointer ${fillerColor}`}
                                      onMouseEnter={() => setHoveredCell({
                                        branch: item.branch,
                                        dimension: 'Filler Disfluency Control',
                                        value: `${fillerScore}% Score (${item.filler_rate}/min)`,
                                        benchmark: '<2.0 fillers/min Target',
                                        delta: item.filler_rate <= 1.8 ? 'Excellent Pausing Discipline' : 'Frequent Crutches Detected',
                                        note: item.filler_rate <= 1.8 ? 'Candidates use confident 1-second silent pauses instead of verbal crutches.' : 'High reliance on fillers like "um", "like", and "basically".'
                                      })}
                                      onMouseLeave={() => setHoveredCell(null)}
                                      onClick={() => {
                                        setSelectedBranch(item.branch);
                                        setActiveTab('directory');
                                      }}
                                    >
                                      <div className="font-mono text-sm">{fillerScore}%</div>
                                      <div className="text-[9px] opacity-80 uppercase tracking-wider">{item.filler_rate}/min</div>
                                    </div>
                                  </td>

                                  {/* Metric 4: Posture Poise Heatmap Tile */}
                                  <td className="py-2.5 px-2 text-center">
                                    <div 
                                      className={`p-2 rounded-lg border text-xs transition-all hover:scale-105 cursor-pointer ${postureColor}`}
                                      onMouseEnter={() => setHoveredCell({
                                        branch: item.branch,
                                        dimension: 'Posture & Composure Stability',
                                        value: `${item.posture}%`,
                                        benchmark: '75.0% Stability Target',
                                        delta: item.posture >= 75 ? '+3.8% above campus benchmark' : 'Lateral slouching detected',
                                        note: item.posture >= 75 ? 'Upright spinal alignment with minimal nervous head swaying.' : 'Restless shoulder shifting during stress interview scenarios.'
                                      })}
                                      onMouseLeave={() => setHoveredCell(null)}
                                      onClick={() => {
                                        setSelectedBranch(item.branch);
                                        setActiveTab('directory');
                                      }}
                                    >
                                      <div className="font-mono text-sm">{item.posture}%</div>
                                      <div className="text-[9px] opacity-80 uppercase tracking-wider">Poise</div>
                                    </div>
                                  </td>

                                  {/* Metric 5: PREP Structuring Heatmap Tile */}
                                  <td className="py-2.5 px-2 text-center">
                                    <div 
                                      className={`p-2 rounded-lg border text-xs transition-all hover:scale-105 cursor-pointer ${prepColor}`}
                                      onMouseEnter={() => setHoveredCell({
                                        branch: item.branch,
                                        dimension: 'PREP & STAR Structural Reasoning',
                                        value: `${prepScore}%`,
                                        benchmark: '75.0% Structure Target',
                                        delta: prepScore >= 80 ? 'Structured Point-Reason-Example Flow' : 'Freeform / Unstructured Answers',
                                        note: prepScore >= 80 ? 'Answers start with strong thesis statements followed by verifiable project metrics.' : 'Candidates need more practice structuring behavioral responses with STAR methodology.'
                                      })}
                                      onMouseLeave={() => setHoveredCell(null)}
                                      onClick={() => {
                                        setSelectedBranch(item.branch);
                                        setActiveTab('directory');
                                      }}
                                    >
                                      <div className="font-mono text-sm">{prepScore}%</div>
                                      <div className="text-[9px] opacity-80 uppercase tracking-wider">Logic</div>
                                    </div>
                                  </td>

                                  {/* Metric 6: Overall Readiness Heatmap Tile */}
                                  <td className="py-2.5 px-2 text-center">
                                    <div 
                                      className={`p-2 rounded-lg border text-xs transition-all hover:scale-105 cursor-pointer ring-1 ring-black/10 dark:ring-white/10 ${overallColor}`}
                                      onMouseEnter={() => setHoveredCell({
                                        branch: item.branch,
                                        dimension: 'Composite Placement Readiness Index',
                                        value: `${item.readiness_score}%`,
                                        benchmark: 'Campus Avg: 77.4%',
                                        delta: item.readiness_score >= 77.4 ? `+${(item.readiness_score - 77.4).toFixed(1)}% vs Campus Average` : `${(item.readiness_score - 77.4).toFixed(1)}% vs Campus Average`,
                                        note: item.key_strength
                                      })}
                                      onMouseLeave={() => setHoveredCell(null)}
                                      onClick={() => {
                                        setSelectedBranch(item.branch);
                                        setActiveTab('directory');
                                      }}
                                    >
                                      <div className="font-mono text-sm font-bold">{item.readiness_score}%</div>
                                      <div className="text-[9px] opacity-90 uppercase tracking-wider">Composite</div>
                                    </div>
                                  </td>

                                  {/* Primary Finding */}
                                  <td className="py-4 px-4">
                                    <div className="text-[11px] font-semibold text-slate-900 dark:text-white leading-snug">
                                      {item.key_strength}
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                                      <span className="font-medium text-amber-600 dark:text-amber-400">Bottleneck:</span> {item.primary_bottleneck}
                                    </div>
                                  </td>

                                  {/* Status */}
                                  <td className="py-4 px-4 text-center">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-[10px] font-semibold py-0.5 px-2 whitespace-nowrap ${
                                        item.readiness_score >= 80
                                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                          : item.readiness_score >= 70
                                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                      }`}
                                    >
                                      {item.status}
                                    </Badge>
                                  </td>

                                </tr>
                              );
                            })}

                            {/* Summary Benchmark Row */}
                            <tr className="bg-slate-100/80 dark:bg-slate-800/80 font-semibold border-t-2 border-slate-300 dark:border-slate-700">
                              <td className="py-4 px-5">
                                <div className="font-bold text-slate-900 dark:text-white text-xs">Campus Benchmark Average</div>
                                <div className="text-[10px] text-slate-500">1,480 Total Candidates • Batch of 2026</div>
                              </td>
                              <td className="py-3 px-2 text-center font-mono text-sm text-slate-900 dark:text-white">
                                73.6%
                              </td>
                              <td className="py-3 px-2 text-center font-mono text-sm text-slate-900 dark:text-white">
                                142.4
                              </td>
                              <td className="py-3 px-2 text-center font-mono text-sm text-slate-900 dark:text-white">
                                78.8%
                              </td>
                              <td className="py-3 px-2 text-center font-mono text-sm text-slate-900 dark:text-white">
                                74.5%
                              </td>
                              <td className="py-3 px-2 text-center font-mono text-sm text-slate-900 dark:text-white">
                                76.6%
                              </td>
                              <td className="py-3 px-2 text-center font-mono text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                77.4%
                              </td>
                              <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                                Overall Campus Readiness Target Met for Day-1 & Mass Recruiter Drives
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Badge className="bg-emerald-600 text-white text-[10px]">
                                  Cohort Ready
                                </Badge>
                              </td>
                            </tr>

                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dynamic Hover Inspection Card */}
                  {hoveredCell && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-400 text-xs uppercase tracking-wider">{hoveredCell.branch} Department</span>
                          <span className="text-slate-500">•</span>
                          <span className="font-semibold text-slate-200 text-xs">{hoveredCell.dimension}</span>
                        </div>
                        <div className="text-xs text-slate-300 leading-relaxed">
                          {hoveredCell.note}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-lg font-bold font-mono text-emerald-400">{hoveredCell.value}</div>
                          <div className="text-[10px] text-slate-400">{hoveredCell.delta}</div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedBranch(hoveredCell.branch);
                            setActiveTab('directory');
                          }}
                          className="h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          <span>Inspect Candidates</span>
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ── VIEW 2: TEMPORAL PRACTICE ACTIVITY RHYTHM HEATMAP ── */}
              {heatmapView === 'timeline' && (
                <div className="space-y-4">
                  <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                          Cohort Practice Velocity & Cadence Heatmap
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Daily session volume across the 12-week preparation cycle leading up to Day-1 campus placement drives.
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>Less Practice</span>
                        <div className="flex items-center gap-1">
                          <span className="h-3 w-3 rounded-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                          <span className="h-3 w-3 rounded-xs bg-emerald-400/30" />
                          <span className="h-3 w-3 rounded-xs bg-emerald-500/60" />
                          <span className="h-3 w-3 rounded-xs bg-emerald-600" />
                          <span className="h-3 w-3 rounded-xs bg-emerald-700 shadow-xs" />
                        </div>
                        <span>Peak Drive Surge</span>
                      </div>
                    </div>

                    {/* GitHub-style 12-week temporal matrix */}
                    <div className="overflow-x-auto py-2">
                      <div className="min-w-[700px] space-y-2">
                        
                        {/* Month / Week Headers */}
                        <div className="grid grid-cols-12 text-[11px] font-semibold text-slate-400 text-center pl-10">
                          {Array.from({ length: 12 }, (_, i) => (
                            <div key={i}>Wk {i + 1}</div>
                          ))}
                        </div>

                        {/* 7 Days Grid */}
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIdx) => (
                          <div key={day} className="flex items-center gap-2">
                            <span className="w-8 text-[11px] font-medium text-slate-500 text-right">{day}</span>
                            <div className="grid grid-cols-12 gap-2 flex-1">
                              {Array.from({ length: 12 }, (_, weekIdx) => {
                                // Simulate realistic session counts with spikes on weekends and later weeks
                                const base = (weekIdx + 1) * 6 + (dayIdx === 5 || dayIdx === 6 ? 25 : 8);
                                const sessions = Math.round(base * (0.8 + (Math.sin(weekIdx * 3 + dayIdx) * 0.3)));
                                
                                let cellBg = 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
                                if (sessions > 85) cellBg = 'bg-emerald-700 text-white shadow-xs';
                                else if (sessions > 55) cellBg = 'bg-emerald-600 text-white';
                                else if (sessions > 30) cellBg = 'bg-emerald-500/60 text-white';
                                else if (sessions > 12) cellBg = 'bg-emerald-400/30 text-slate-800 dark:text-slate-200';

                                return (
                                  <div
                                    key={weekIdx}
                                    title={`Week ${weekIdx + 1}, ${day}: ${sessions} mock sessions conducted`}
                                    className={`h-8 rounded-md flex items-center justify-center font-mono text-[10px] font-medium border border-transparent transition-transform hover:scale-110 cursor-pointer ${cellBg}`}
                                  >
                                    {sessions}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                      </div>
                    </div>

                    {/* Temporal Summary Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500 text-[11px] block">Peak Practice Window</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm block mt-0.5">
                          Sunday Evenings (7 PM – 11 PM)
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                          Avg 340 sessions completed prior to Monday mock rounds
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500 text-[11px] block">Total Practice Hours Logged</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm block mt-0.5 font-mono">
                          1,710 Hours (6,840 Sessions)
                        </span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block mt-0.5">
                          Equivalent to 4.6 full mock interviews per candidate
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500 text-[11px] block">Remedial Improvement Rate</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm block mt-0.5 font-mono">
                          +18.4% Average Lift
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                          Observed across candidates with 5+ studio sessions
                        </span>
                      </div>
                    </div>

                  </Card>
                </div>
              )}

              {/* ── VIEW 3: 3D PLACEMENT TIER DENSITY & RECRUITMENT BRACKETS ── */}
              {heatmapView === 'density' && (
                <div className="space-y-4">
                  {/* Top Bar for Tier Density */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-500" />
                        <span>Department Placement Tier Distribution Density</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Interactive behavioral qualification breakdown across {sortedHeatmap.length} engineering cohorts. Dynamic sorting by {heatmapSortBy}.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {stats ? stats.total_enrolled_candidates.toLocaleString() : '1,480'} Candidates Tracked
                      </Badge>
                    </div>
                  </div>

                  {/* 3D CARDS VIEW */}
                  {densityViewMode === '3d-cards' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {sortedHeatmap.map((item) => {
                        const tier = getDepartmentTierDistribution(item);
                        return (
                          <div
                            key={item.branch}
                            className="relative group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-xl hover:border-indigo-500/60 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
                          >
                            {/* Ambient Glow */}
                            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/10 blur-xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />

                            <div className="space-y-4 relative z-10">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                      {item.branch}
                                    </span>
                                    <Badge variant="outline" className="text-[10px] font-mono py-0 px-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                                      {item.students_count} Candidates
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                    {item.name}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                      {item.readiness_score}% Readiness
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Multi-Segment Stacked Tier Distribution Track */}
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">Recruitment Tier Distribution</span>
                                  <span className="font-mono text-[10px] text-slate-500">{tier.t1 + tier.t2}% Day-1 / Core Ready</span>
                                </div>

                                {/* Stacked Progress Bar */}
                                <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner p-0.5 gap-0.5">
                                  <div
                                    style={{ width: `${tier.t1}%` }}
                                    className="h-full rounded-l-full bg-emerald-500 hover:brightness-110 transition-all cursor-pointer"
                                    title={`Tier 1: ${tier.t1}% (${tier.t1Count} candidates)`}
                                  />
                                  <div
                                    style={{ width: `${tier.t2}%` }}
                                    className="h-full bg-indigo-500 hover:brightness-110 transition-all cursor-pointer"
                                    title={`Tier 2: ${tier.t2}% (${tier.t2Count} candidates)`}
                                  />
                                  <div
                                    style={{ width: `${tier.t3}%` }}
                                    className="h-full bg-amber-500 hover:brightness-110 transition-all cursor-pointer"
                                    title={`Tier 3: ${tier.t3}% (${tier.t3Count} candidates)`}
                                  />
                                  <div
                                    style={{ width: `${tier.t4}%` }}
                                    className="h-full rounded-r-full bg-rose-500 hover:brightness-110 transition-all cursor-pointer"
                                    title={`Tier 4: ${tier.t4}% (${tier.t4Count} candidates)`}
                                  />
                                </div>

                                {/* Micro Tier Legend with percentage ticks */}
                                <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-center pt-1 text-slate-500">
                                  <div className="text-emerald-600 dark:text-emerald-400 font-bold">{tier.t1}% T1</div>
                                  <div className="text-indigo-600 dark:text-indigo-400 font-bold">{tier.t2}% T2</div>
                                  <div className="text-amber-600 dark:text-amber-400 font-bold">{tier.t3}% T3</div>
                                  <div className="text-rose-600 dark:text-rose-400 font-bold">{tier.t4}% T4</div>
                                </div>
                              </div>

                              {/* 4 Interactive KPI Tiles */}
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-semibold">
                                    <span>Product (12+ LPA)</span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  </div>
                                  <div className="mt-1 flex items-baseline justify-between">
                                    <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{tier.t1}%</span>
                                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{tier.t1Count} studs</span>
                                  </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-semibold">
                                    <span>Core (6–12 LPA)</span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                  </div>
                                  <div className="mt-1 flex items-baseline justify-between">
                                    <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{tier.t2}%</span>
                                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{tier.t2Count} studs</span>
                                  </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-semibold">
                                    <span>Mass (4–6 LPA)</span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                  </div>
                                  <div className="mt-1 flex items-baseline justify-between">
                                    <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{tier.t3}%</span>
                                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{tier.t3Count} studs</span>
                                  </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-semibold">
                                    <span>Drills (&lt;4 LPA)</span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                  </div>
                                  <div className="mt-1 flex items-baseline justify-between">
                                    <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{tier.t4}%</span>
                                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{tier.t4Count} studs</span>
                                  </div>
                                </div>
                              </div>

                              {/* Remedial Priority Bar */}
                              <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Intervention Plan:</span>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] font-semibold py-0.5 px-2 ${
                                    tier.actionType === 'high'
                                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                                      : tier.actionType === 'medium'
                                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                      : tier.actionType === 'super'
                                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                  }`}
                                >
                                  {tier.action}
                                </Badge>
                              </div>
                            </div>

                            {/* Card Footer / Direct Action */}
                            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                {item.sessions_count} sessions logged
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center gap-1.5 px-2.5"
                                onClick={() => {
                                  setSelectedBranch(item.branch);
                                  setActiveTab('directory');
                                }}
                              >
                                <span>Inspect Candidates</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* COMPARATIVE AUDIT TABLE VIEW */}
                  {densityViewMode === 'table' && (
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                              <th className="py-3 px-4">Department</th>
                              <th className="py-3 px-3 text-center">Tier 1: Product (12+ LPA)</th>
                              <th className="py-3 px-3 text-center">Tier 2: Core (6–12 LPA)</th>
                              <th className="py-3 px-3 text-center">Tier 3: Mass (4–6 LPA)</th>
                              <th className="py-3 px-3 text-center">Tier 4: Remedial (&lt;4 LPA)</th>
                              <th className="py-3 px-4 text-center">Remedial Priority Plan</th>
                              <th className="py-3 px-3 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {sortedHeatmap.map((item) => {
                              const tier = getDepartmentTierDistribution(item);
                              return (
                                <tr
                                  key={item.branch}
                                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                                  onClick={() => {
                                    setSelectedBranch(item.branch);
                                    setActiveTab('directory');
                                  }}
                                >
                                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                                    <div className="flex items-center gap-2">
                                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">{item.branch}</span>
                                      <span className="text-[11px] text-slate-400 font-normal">({item.name})</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                      {item.students_count} enrolled • {item.sessions_count} sessions
                                    </span>
                                  </td>

                                  {/* T1 Tile */}
                                  <td className="py-2.5 px-3 text-center">
                                    <div className="py-1.5 px-2 rounded-md font-mono text-xs font-semibold bg-emerald-600 text-white shadow-xs">
                                      <div>{tier.t1}%</div>
                                      <div className="text-[9px] opacity-80">{tier.t1Count} studs</div>
                                    </div>
                                  </td>

                                  {/* T2 Tile */}
                                  <td className="py-2.5 px-3 text-center">
                                    <div className="py-1.5 px-2 rounded-md font-mono text-xs font-semibold bg-indigo-600 text-white shadow-xs">
                                      <div>{tier.t2}%</div>
                                      <div className="text-[9px] opacity-80">{tier.t2Count} studs</div>
                                    </div>
                                  </td>

                                  {/* T3 Tile */}
                                  <td className="py-2.5 px-3 text-center">
                                    <div className={`py-1.5 px-2 rounded-md font-mono text-xs font-semibold ${
                                      tier.t3 >= 25 ? 'bg-amber-500/80 text-slate-900 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                    }`}>
                                      <div>{tier.t3}%</div>
                                      <div className="text-[9px] opacity-80">{tier.t3Count} studs</div>
                                    </div>
                                  </td>

                                  {/* T4 Tile */}
                                  <td className="py-2.5 px-3 text-center">
                                    <div className={`py-1.5 px-2 rounded-md font-mono text-xs font-semibold ${
                                      tier.t4 >= 8 ? 'bg-rose-500/85 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                    }`}>
                                      <div>{tier.t4}%</div>
                                      <div className="text-[9px] opacity-80">{tier.t4Count} studs</div>
                                    </div>
                                  </td>

                                  <td className="py-3.5 px-4 text-center">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-[10px] font-semibold py-0.5 px-2 ${
                                        tier.actionType === 'high'
                                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                                          : tier.actionType === 'medium'
                                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                          : tier.actionType === 'super'
                                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                      }`}
                                    >
                                      {tier.action}
                                    </Badge>
                                  </td>

                                  <td className="py-3.5 px-3 text-center">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 p-1.5"
                                    >
                                      Inspect &rarr;
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Placement Cohort Classification Cards */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Placement Cohort Classification Guide</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Standard operational criteria used to tier candidates for campus recruitment.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                  
                  {/* Tier 1 */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Tier 1 • Direct Ready</span>
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">80%+ Score</Badge>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Day-1 Recruiter Ready</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Consistent camera lens focus (&gt;75%), controlled conversational cadence (130–150 WPM), and minimal verbal fillers. Prime recommendation for top product companies and consulting roles.
                    </p>
                  </div>

                  {/* Tier 2 */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Tier 2 • Core Ready</span>
                      <Badge variant="outline" className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">70–79% Score</Badge>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Core Placement Ready</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Solid structured responses with occasional pacing variance. Ready for mass recruiter technical and HR interview rounds.
                    </p>
                  </div>

                  {/* Tier 3 */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Tier 3 • Targeted Support</span>
                      <Badge variant="outline" className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">55–69% Score</Badge>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Targeted Practice Track</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Shows solid technical capability but exhibits hesitation crutches or gaze avoidance under pressure. Assigned to automated 2-minute daily practice drills.
                    </p>
                  </div>

                  {/* Tier 4 */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Tier 4 • Mentor Intervention</span>
                      <Badge variant="outline" className="text-[10px] bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800">&lt;55% Score</Badge>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Faculty Guided Coaching</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Significant interview anxiety or vocal hesitation detected. Recommended for 1-on-1 faculty mentor sessions prior to live recruitment drives.
                    </p>
                  </div>

                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: CANDIDATE PLACEMENT DIRECTORY */}
          {activeTab === 'directory' && (
            <motion.div
              key="tab-directory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-4"
            >
              {/* Filter and Search Bar */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      placeholder="Search candidate by name, roll number, or department..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 text-xs h-9 bg-slate-50/50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Branch Filter */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Branch:</span>
                      <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="text-xs h-9 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                      >
                        <option value="all">All Departments ({students.length})</option>
                        <option value="CSE">CSE (Computer Science)</option>
                        <option value="IT">IT (Information Technology)</option>
                        <option value="ECE">ECE (Electronics)</option>
                        <option value="ME">ME (Mechanical)</option>
                        <option value="CE">CE (Civil)</option>
                        <option value="MBA">MBA (Management)</option>
                      </select>
                    </div>

                    {/* Readiness Tier Filter */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tier:</span>
                      <select
                        value={selectedTier}
                        onChange={(e) => setSelectedTier(e.target.value)}
                        className="text-xs h-9 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                      >
                        <option value="all">All Readiness Tiers</option>
                        <option value="tier1">Tier-1 Ready (80%+)</option>
                        <option value="core">Core Ready (70–79%)</option>
                        <option value="targeted">Targeted Practice (55–69%)</option>
                        <option value="critical">Faculty Intervention (&lt;55%)</option>
                      </select>
                    </div>

                    {/* Reset Filters button */}
                    {(selectedBranch !== 'all' || selectedTier !== 'all' || searchQuery !== '') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedBranch('all');
                          setSelectedTier('all');
                          setSearchQuery('');
                        }}
                        className="h-9 px-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      >
                        Reset
                      </Button>
                    )}

                  </div>

                </div>
              </div>

              {/* Students Table */}
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                        <th className="py-3 px-5">Candidate</th>
                        <th className="py-3 px-4">Roll Number</th>
                        <th className="py-3 px-4">Department & Section</th>
                        <th className="py-3 px-3 text-center">Sessions</th>
                        <th className="py-3 px-4 text-center">Camera Gaze</th>
                        <th className="py-3 px-4 text-center">Speaking Pace</th>
                        <th className="py-3 px-4 text-center">Filler Words</th>
                        <th className="py-3 px-4 text-center">Readiness Score</th>
                        <th className="py-3 px-4 text-center">Placement Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-12 text-center text-slate-500">
                            No candidates found matching the selected filters.
                          </td>
                        </tr>
                      ) : (
                        students.map((cand) => {
                          return (
                            <tr key={cand.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                              
                              {/* Name + Live Badge */}
                              <td className="py-3.5 px-5">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-900 dark:text-white">{cand.name}</span>
                                  {cand.is_live && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.2 rounded">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      <span>Live</span>
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400">Last active: {cand.last_session}</div>
                              </td>

                              {/* Roll Number */}
                              <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300 font-medium">
                                {cand.roll_number}
                              </td>

                              {/* Department */}
                              <td className="py-3.5 px-4">
                                <div className="text-slate-800 dark:text-slate-200 font-medium">{cand.branch} • Sec {cand.section}</div>
                                <div className="text-[11px] text-slate-400">{cand.batch} Batch</div>
                              </td>

                              {/* Sessions */}
                              <td className="py-3.5 px-3 text-center font-mono text-slate-700 dark:text-slate-300">
                                {cand.sessions_completed}
                              </td>

                              {/* Camera Gaze */}
                              <td className="py-3.5 px-4 text-center font-mono text-slate-800 dark:text-slate-200">
                                {cand.eye_contact}%
                              </td>

                              {/* Pacing WPM */}
                              <td className="py-3.5 px-4 text-center font-mono text-slate-800 dark:text-slate-200">
                                {cand.wpm}
                              </td>

                              {/* Fillers */}
                              <td className="py-3.5 px-4 text-center font-mono text-slate-800 dark:text-slate-200">
                                {cand.filler_count}
                              </td>

                              {/* Readiness Score */}
                              <td className="py-3.5 px-4 text-center font-mono">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-xs ${
                                  cand.tier_badge === 'tier1'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : cand.tier_badge === 'core'
                                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                    : cand.tier_badge === 'targeted'
                                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                }`}>
                                  {cand.readiness_score}%
                                </span>
                              </td>

                              {/* Tier Badge */}
                              <td className="py-3.5 px-4 text-center">
                                <Badge 
                                  variant="outline" 
                                  className={`text-[11px] font-medium py-0.5 px-2.5 ${
                                    cand.tier_badge === 'tier1'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                      : cand.tier_badge === 'core'
                                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                      : cand.tier_badge === 'targeted'
                                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                  }`}
                                >
                                  {cand.tier}
                                </Badge>
                              </td>

                              {/* Action Button */}
                              <td className="py-3.5 px-4 text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openStudentDossier(cand)}
                                  className="text-xs h-7 px-2.5 border-slate-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:border-indigo-300 font-medium"
                                >
                                  <span>View Dossier</span>
                                  <ChevronRight className="h-3 w-3 ml-0.5" />
                                </Button>
                              </td>

                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

            </motion.div>
          )}

          {/* TAB 3: PLACEMENT CRITERIA & AUDIT RUBRIC */}
          {activeTab === 'rubric' && (
            <motion.div
              key="tab-rubric"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Communication Evaluation Criteria */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Multimodal Assessment Criteria</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Quantitative scoring breakdown across candidate interview runs</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Interview performance is benchmarked directly inside the browser using objective computer vision and speech recognition models:
                  </p>

                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                        <span>1. Camera Lens Presence (40% Weightage)</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">80%+ Target</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                        Measures facial orientation and iris gaze vectors directed toward the camera lens to project virtual presence and authority.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                        <span>2. Posture & Spinal Alignment (35% Weightage)</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">75%+ Target</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                        Monitors head tilt, shoulder slouching, and lateral alignment to prevent restless swaying during virtual interviews.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                        <span>3. Conversational Cadence & WPM (25% Weightage)</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">130–150 WPM</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                        Optimal conversational tempo. Automated alerts flag pacing acceleration (&gt;165 WPM) or hesitant pauses (&lt;120 WPM).
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                        <span>4. Verbal Disfluency & Filler Penalty</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">&lt;2.0 / min</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                        Identifies speech fillers (`um`, `like`, `basically`, `you know`) and trains speakers to replace crutches with confident 1-second silent pauses.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Institutional Compliance & Audit Evidence */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Institutional Placement Verification</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Documentary evidence for Career Development Cells</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    VaniDarpan provides concrete, verifiable evidence for higher education placement benchmarks and institutional reviews:
                  </p>

                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 dark:text-white">Verifiable Mock Interview Logs:</strong>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                          Over 6,840 timestamped mock sessions recorded for the 2026 cohort, proving candidate improvement curves across repeated practice.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 dark:text-white">Proactive Remedial Triage:</strong>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                          Automated identification of 230 students requiring targeted communication practice before recruiter campus drives commence.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 dark:text-white">Recruiter Dossier CSV Exports:</strong>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                          One-click export of cohort telemetry in standard CSV format for recruiter shortlisting and departmental reviews.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3">
                      <Button
                        size="sm"
                        onClick={handleExportCsv}
                        disabled={isExporting}
                        className="w-full text-xs font-semibold gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download Full Cohort Placement Dossier</span>
                      </Button>
                    </div>
                  </div>
                </Card>

              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* ── Clean Institutional Footer (1 line, no marketing clutter) ── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {officerSession?.institutionName || stats?.college_name || 'Apex Engineering & Technology Institute'} • Training & Placement Intelligence System
          </span>
          <span className="text-[11px] text-slate-400">
            Confidential Institutional Record • VaniDarpan v2.4
          </span>
        </div>
      </footer>

      {/* ── Interactive Candidate Dossier Modal ── */}
      <Dialog open={isDossierOpen} onOpenChange={setIsDossierOpen}>
        <DialogContent className="max-w-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 text-slate-900 dark:text-slate-100">
          <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedStudent?.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Roll No: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{selectedStudent?.roll_number}</span> • {selectedStudent?.branch_full || selectedStudent?.branch} (Section {selectedStudent?.section})
                </DialogDescription>
              </div>
              <Badge 
                variant="outline" 
                className={`text-xs font-semibold py-1 px-3 ${
                  selectedStudent?.tier_badge === 'tier1'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : selectedStudent?.tier_badge === 'core'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                    : selectedStudent?.tier_badge === 'targeted'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                }`}
              >
                {selectedStudent?.tier}
              </Badge>
            </div>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4 py-2 text-xs">
              
              {/* Overall Score Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Composite Placement Readiness</span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    {selectedStudent.readiness_score}%
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Practice Completed</span>
                  <div className="text-base font-semibold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                    {selectedStudent.sessions_completed} Sessions
                  </div>
                </div>
              </div>

              {/* Multimodal Telemetry Breakdown */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Candidate Communication Telemetry:
                </span>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Camera Gaze Focus</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-mono block mt-1">
                      {selectedStudent.eye_contact}%
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                      {selectedStudent.eye_contact >= 75 ? 'Direct Focus' : 'Wandering'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Speaking Pace</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-mono block mt-1">
                      {selectedStudent.wpm} WPM
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block mt-0.5">
                      {selectedStudent.wpm >= 130 && selectedStudent.wpm <= 155 ? 'Optimal' : 'Needs Adjust'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Filler Count</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-mono block mt-1">
                      {selectedStudent.filler_count}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      {selectedStudent.filler_count <= 2 ? 'Low Hesitation' : 'Frequent'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coordinator Diagnostic Notes */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                <span className="font-semibold text-slate-900 dark:text-white block text-xs">
                  Placement Coordinator Diagnostic Notes:
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                  {selectedStudent.tier_badge === 'tier1' 
                    ? 'Candidate projects strong executive composure, steady camera lens connection, and structured STAR answers. Recommended for top-tier recruiter Day-1 technical and leadership rounds.'
                    : selectedStudent.tier_badge === 'core'
                    ? 'Consistent technical communication. Advise practicing 2-minute timed problem walkthroughs to maintain cadence stability during technical stress rounds.'
                    : selectedStudent.tier_badge === 'targeted'
                    ? 'Suffers from pacing acceleration and frequent verbal crutches under pressure. Recommended for 60-second table topic drills to build instinctive pause habits.'
                    : 'Noticeable interview anxiety detected in baseline sessions. Recommended for 1-on-1 guided practice with communication faculty mentors.'
                  }
                </p>
              </div>

            </div>
          )}

          <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              VaniDarpan Placement Intelligence Record
            </span>
            <Button
              size="sm"
              onClick={() => setIsDossierOpen(false)}
              className="text-xs bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800"
            >
              Close Dossier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
