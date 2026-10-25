// client/src/pages/tpo.tsx
import { useState, useEffect } from 'react';
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
  Sparkles
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
  status: string;
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

export default function TPO() {
  const { toast } = useToast();
  const [stats, setStats] = useState<TpoStats | null>(null);
  const [heatmap, setHeatmap] = useState<BranchHeatmapItem[]>([]);
  const [students, setStudents] = useState<StudentCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'heatmap' | 'directory' | 'rubric'>('heatmap');
  
  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Student Dossier Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentCandidate | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);

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
        const heatmapData = await heatmapRes.json();
        setHeatmap(heatmapData);
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
    fetchTpoData();
  }, [selectedBranch, selectedTier, searchQuery]);

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

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* ── 1. Dedicated Institutional Top Header (No public student nav clutter) ── */}
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
                  {stats?.college_name || 'Apex Engineering & Technology Institute'}
                </span>
                <Badge variant="outline" className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 py-0 px-1.5">
                  TPO Portal
                </Badge>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Office of Career Services & Corporate Relations • Batch of 2026
              </span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Badge variant="outline" className="hidden md:inline-flex text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
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
                className="h-8 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 gap-1"
                title="Switch to Student Practice Studio"
              >
                <span>Student Studio</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>

            <ThemeToggle />
          </div>

        </div>
      </header>

      {/* ── Main Dashboard Content ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── 2. Executive Overview Hero Card ── */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Campus Recruitment Telemetry
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs text-slate-500 font-medium">Placement Cycle 2025–2026</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Candidate Communication & Placement Readiness
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                Aggregated interview communication analytics, branch performance heatmaps, and individual candidate records evaluated using automated on-device computer vision and vocal acoustic metrics.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Badge variant="outline" className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 py-1 px-3 gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Soft-Skills Benchmark Compliant</span>
              </Badge>
              <Badge variant="outline" className="text-xs font-medium text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 py-1 px-3 gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>1,480 Batch Size</span>
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* ── 3. Executive KPI Metric Cards (5 Animated Cards) ── */}
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
                  {stats?.total_enrolled_candidates.toLocaleString() || '1,480'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Practice Sessions</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{stats?.total_practice_sessions.toLocaleString() || '6,840'}</span>
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
                  <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-baseline gap-2">
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

        {/* ── 4. Cohort Skill Benchmarks Strip ── */}
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

        {/* ── 5. Segmented Navigation Tabs ── */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'heatmap'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Branch Readiness Heatmap</span>
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

        {/* ── 6. Tab Content with Framer Motion AnimatePresence ── */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: BRANCH COMMUNICATION HEATMAP */}
          {activeTab === 'heatmap' && (
            <motion.div
              key="tab-heatmap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Heatmap Table Card */}
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                        Department Interview Readiness Matrix
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Comparative behavioral and communication benchmarks across engineering and management branches.
                      </CardDescription>
                    </div>

                    {/* Table Legend */}
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span>Ready (80%+)</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                        <span>Core (70–79%)</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <span>Needs Practice (&lt;70%)</span>
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                          <th className="py-3.5 px-5">Department</th>
                          <th className="py-3.5 px-4 text-center">Candidates</th>
                          <th className="py-3.5 px-4 text-center">Camera Gaze</th>
                          <th className="py-3.5 px-4 text-center">Speaking Pace</th>
                          <th className="py-3.5 px-4 text-center">Filler Frequency</th>
                          <th className="py-3.5 px-4 text-center">Posture Stability</th>
                          <th className="py-3.5 px-4 text-center">Readiness Index</th>
                          <th className="py-3.5 px-5">Primary Finding</th>
                          <th className="py-3.5 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {heatmap.map((item) => {
                          const isHigh = item.readiness_score >= 80;
                          const isMid = item.readiness_score >= 70 && item.readiness_score < 80;

                          return (
                            <tr key={item.branch} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                              
                              {/* Branch Name */}
                              <td className="py-4 px-5">
                                <div className="font-bold text-slate-900 dark:text-white text-xs">{item.branch}</div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.name}</div>
                              </td>

                              {/* Cohort Size */}
                              <td className="py-4 px-4 text-center font-mono text-slate-700 dark:text-slate-300">
                                <div className="font-semibold">{item.students_count}</div>
                                <div className="text-[11px] text-slate-400">{item.sessions_count} sessions</div>
                              </td>

                              {/* Camera Gaze */}
                              <td className="py-4 px-4 text-center">
                                <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{item.eye_contact}%</div>
                                <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mt-1 overflow-hidden border border-slate-200 dark:border-slate-700">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.eye_contact}%` }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    className={`h-full rounded-full ${isHigh ? 'bg-emerald-500' : isMid ? 'bg-indigo-500' : 'bg-amber-500'}`}
                                  />
                                </div>
                              </td>

                              {/* Speaking Pace */}
                              <td className="py-4 px-4 text-center font-mono">
                                <div className="font-semibold text-slate-800 dark:text-slate-200">{item.wpm} <span className="text-[10px] text-slate-400 font-normal">WPM</span></div>
                                <div className="text-[10px] text-slate-500">
                                  {item.wpm > 152 ? 'Fast Pace' : (item.wpm < 125 ? 'Deliberate' : 'Optimal')}
                                </div>
                              </td>

                              {/* Filler Frequency */}
                              <td className="py-4 px-4 text-center font-mono">
                                <div className={`font-semibold ${item.filler_rate > 2.0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                  {item.filler_rate} <span className="text-[10px] text-slate-400 font-normal">/min</span>
                                </div>
                              </td>

                              {/* Posture */}
                              <td className="py-4 px-4 text-center font-mono text-slate-700 dark:text-slate-300">
                                {item.posture}%
                              </td>

                              {/* Readiness Index */}
                              <td className="py-4 px-4 text-center font-mono">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                                  isHigh 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                                    : isMid 
                                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' 
                                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                }`}>
                                  {item.readiness_score}%
                                </span>
                              </td>

                              {/* Diagnostic Finding */}
                              <td className="py-4 px-5">
                                <div className="text-[11px] font-medium text-slate-900 dark:text-white leading-snug">
                                  {item.key_strength}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                                  Focus: {item.primary_bottleneck}
                                </div>
                              </td>

                              {/* Status Badge */}
                              <td className="py-4 px-4 text-center">
                                <Badge 
                                  variant="outline" 
                                  className={`text-[11px] font-medium py-0.5 px-2.5 ${
                                    isHigh 
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                                      : isMid 
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
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

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
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                      : cand.tier_badge === 'core'
                                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                                      : cand.tier_badge === 'targeted'
                                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
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

      {/* ── 7. Clean Institutional Footer (1 line, no marketing clutter) ── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {stats?.college_name || 'Apex Engineering & Technology Institute'} • Training & Placement Intelligence System
          </span>
          <span className="text-[11px] text-slate-400">
            Confidential Institutional Record • VaniDarpan v2.4
          </span>
        </div>
      </footer>

      {/* ── 8. Interactive Candidate Dossier Modal ── */}
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
