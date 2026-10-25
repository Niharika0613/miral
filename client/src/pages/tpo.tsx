// client/src/pages/tpo.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  ShieldCheck, 
  Download, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
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
  UserCheck
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
        description: 'Candidate communication telemetry saved to CSV successfully.',
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
    <div className="min-h-screen bg-slate-50/70 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Top Institutional Header Bar ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Title & Metadata */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                  {stats?.college_name || 'Apex Engineering & Technology Institute'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium">
                  Training & Placement Cell (TPO)
                </span>
                <Badge variant="outline" className="text-[11px] font-medium text-slate-500 bg-slate-100 border-slate-200">
                  Sample Cohort Data
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Campus Placement Readiness & Communication Intelligence
              </h1>

              <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                Aggregated interview communication analytics, department readiness heatmaps, and candidate performance records across the 2025–2026 campus recruitment cycle.
              </p>

              {/* Status Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Soft-Skills Benchmark Compliant</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Batch of 2026 Recruitment Drive</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Academic Season 2025–2026</span>
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTpoData}
                disabled={isLoading}
                className="h-10 text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 gap-2 shadow-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
                <span>Refresh Data</span>
              </Button>

              <Button
                size="sm"
                onClick={handleExportCsv}
                disabled={isExporting}
                className="h-10 text-xs font-semibold gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{isExporting ? 'Generating CSV...' : 'Export Placement Dossier (CSV)'}</span>
              </Button>
            </div>

          </div>
        </div>

        {/* ── Executive KPI Metric Cards (5 Cards) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Total Candidates */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Enrolled Candidates</span>
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {stats?.total_enrolled_candidates.toLocaleString() || '1,480'}
              </div>
              <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                <span>Evaluated Sessions</span>
                <span className="font-semibold text-slate-700 font-mono">{stats?.total_practice_sessions.toLocaleString() || '6,840'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Campus Readiness Index */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Campus Readiness Index</span>
                <Activity className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
                <span>{stats?.college_readiness_index || 77.4}%</span>
                <span className="text-xs font-semibold text-emerald-600">+5.2%</span>
              </div>
              <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                <span>Status</span>
                <span className="font-semibold text-emerald-700">Drive Ready</span>
              </div>
            </CardContent>
          </Card>

          {/* Day-1 Ready (Tier 1) */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Day-1 Recruiter Ready</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
                <span>{stats?.tier1_candidates || 426}</span>
                <span className="text-xs font-normal text-slate-500">({stats?.tier1_pct || 28.8}%)</span>
              </div>
              <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                <span>Rating</span>
                <span className="font-semibold text-emerald-700">Tier-1 Qualified</span>
              </div>
            </CardContent>
          </Card>

          {/* Core Ready (Tier 2) */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Core Placement Ready</span>
                <UserCheck className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
                <span>{stats?.core_candidates || 824}</span>
                <span className="text-xs font-normal text-slate-500">({stats?.core_pct || 55.7}%)</span>
              </div>
              <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                <span>Target Drive</span>
                <span className="font-semibold text-slate-700">Day-1 & Core IT</span>
              </div>
            </CardContent>
          </Card>

          {/* Needs Practice Support */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Needs Practice Support</span>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
                <span>{(stats?.targeted_candidates || 168) + (stats?.critical_candidates || 62)}</span>
                <span className="text-xs font-normal text-slate-500">({(((stats?.targeted_candidates || 168) + (stats?.critical_candidates || 62)) / 1480 * 100).toFixed(1)}%)</span>
              </div>
              <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                <span>Remedial Drills</span>
                <span className="font-semibold text-amber-700">Active</span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ── Cohort Skill Benchmarks Strip ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            
            {/* Eye Contact Benchmark */}
            <div className="flex items-center gap-3 px-2">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Eye className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-500">Average Camera Gaze</div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-mono">
                  <span>{stats?.avg_eye_contact || 73.6}%</span>
                  <span className="text-[11px] font-normal text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Target Met
                  </span>
                </div>
              </div>
            </div>

            {/* Speaking Pace Benchmark */}
            <div className="flex items-center gap-3 px-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Gauge className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-500">Average Speaking Pace</div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-mono">
                  <span>{stats?.avg_wpm || 142.4} WPM</span>
                  <span className="text-[11px] font-normal text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                    Optimal Zone
                  </span>
                </div>
              </div>
            </div>

            {/* Filler Word Rate */}
            <div className="flex items-center gap-3 px-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Volume2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-500">Average Filler Frequency</div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-mono">
                  <span>{stats?.avg_filler_rate || 1.7} / min</span>
                  <span className="text-[11px] font-normal text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Low Friction
                  </span>
                </div>
              </div>
            </div>

            {/* Live Practice Sessions Active */}
            <div className="flex items-center gap-3 px-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Activity className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-500">Live Practice In Progress</div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{stats?.live_candidates_active || 4} Candidates Live</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Segmented Navigation Tabs ── */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'heatmap'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Candidate Placement Directory</span>
            <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'directory' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {students.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rubric')}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'rubric'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCheck2 className="h-4 w-4" />
            <span>Placement Criteria & Rubric</span>
          </button>
        </div>

        {/* ── TAB 1: BRANCH COMMUNICATION HEATMAP ── */}
        {activeTab === 'heatmap' && (
          <div className="space-y-6">
            
            {/* Heatmap Table Card */}
            <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>Department Interview Readiness Breakdown</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-1">
                      Objective behavioral telemetry across engineering and management departments for the 2026 hiring season.
                    </CardDescription>
                  </div>

                  {/* Table Legend */}
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span>Ready (80%+)</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                      <span>Core (70–79%)</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-600">
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
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
                        <th className="py-3.5 px-5">Department</th>
                        <th className="py-3.5 px-4 text-center">Enrolled Candidates</th>
                        <th className="py-3.5 px-4 text-center">Camera Gaze</th>
                        <th className="py-3.5 px-4 text-center">Speaking Pace</th>
                        <th className="py-3.5 px-4 text-center">Filler Frequency</th>
                        <th className="py-3.5 px-4 text-center">Posture Stability</th>
                        <th className="py-3.5 px-4 text-center">Readiness Index</th>
                        <th className="py-3.5 px-5">Key Observation</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {heatmap.map((item) => {
                        const isHigh = item.readiness_score >= 80;
                        const isMid = item.readiness_score >= 70 && item.readiness_score < 80;

                        return (
                          <tr key={item.branch} className="hover:bg-slate-50/70 transition-colors">
                            
                            {/* Branch Name */}
                            <td className="py-4 px-5">
                              <div className="font-bold text-slate-900 text-xs">{item.branch}</div>
                              <div className="text-[11px] text-slate-500">{item.name}</div>
                            </td>

                            {/* Cohort Size */}
                            <td className="py-4 px-4 text-center font-mono text-slate-700">
                              <div className="font-semibold">{item.students_count}</div>
                              <div className="text-[11px] text-slate-400">{item.sessions_count} sessions</div>
                            </td>

                            {/* Camera Gaze */}
                            <td className="py-4 px-4 text-center">
                              <div className="font-semibold text-slate-800 font-mono">{item.eye_contact}%</div>
                              <div className="w-20 h-1.5 bg-slate-100 rounded-full mx-auto mt-1 overflow-hidden border border-slate-200">
                                <div 
                                  className={`h-full rounded-full ${isHigh ? 'bg-emerald-500' : isMid ? 'bg-indigo-500' : 'bg-amber-500'}`}
                                  style={{ width: `${item.eye_contact}%` }}
                                />
                              </div>
                            </td>

                            {/* Speaking Cadence (WPM) */}
                            <td className="py-4 px-4 text-center font-mono">
                              <div className="font-semibold text-slate-800">{item.wpm} <span className="text-[10px] text-slate-400 font-normal">WPM</span></div>
                              <div className="text-[10px] text-slate-500">
                                {item.wpm > 152 ? 'Fast Pace' : (item.wpm < 125 ? 'Deliberate' : 'Optimal')}
                              </div>
                            </td>

                            {/* Filler Rate */}
                            <td className="py-4 px-4 text-center font-mono">
                              <div className={`font-semibold ${item.filler_rate > 2.0 ? 'text-amber-700' : 'text-slate-800'}`}>
                                {item.filler_rate} <span className="text-[10px] text-slate-400 font-normal">/min</span>
                              </div>
                            </td>

                            {/* Posture */}
                            <td className="py-4 px-4 text-center font-mono text-slate-700">
                              {item.posture}%
                            </td>

                            {/* Readiness Index */}
                            <td className="py-4 px-4 text-center font-mono">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                                isHigh 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : isMid 
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {item.readiness_score}%
                              </span>
                            </td>

                            {/* Diagnostic Finding */}
                            <td className="py-4 px-5">
                              <div className="text-[11px] font-medium text-slate-900 leading-snug">
                                {item.key_strength}
                              </div>
                              <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                                Focus Area: {item.primary_bottleneck}
                              </div>
                            </td>

                            {/* Status Badge */}
                            <td className="py-4 px-4 text-center">
                              <Badge 
                                variant="outline" 
                                className={`text-[11px] font-medium py-0.5 px-2.5 ${
                                  isHigh 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : isMid 
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
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

            {/* Strategic Placement Readiness Tiers Guide */}
            <div>
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900">Placement Cohort Classification Guide</h3>
                <p className="text-xs text-slate-500">Standard operational criteria used to tier candidates for recruiter interviews.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                
                {/* Tier 1 */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Tier 1 • Direct Ready</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">80%+ Score</Badge>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">High-Impact Recruiter Ready</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Consistent camera lens focus (&gt;75%), controlled conversational cadence (130–150 WPM), and minimal verbal fillers. Prime recommendation for top product companies and consulting roles.
                  </p>
                </div>

                {/* Tier 2 */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Tier 2 • Core Ready</span>
                    <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">70–79% Score</Badge>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">Core Placement Ready</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Solid structured responses with occasional pacing variance. Ready for mass recruiter technical and HR interview rounds.
                  </p>
                </div>

                {/* Tier 3 */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Tier 3 • Targeted Support</span>
                    <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">55–69% Score</Badge>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">Targeted Practice Track</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Shows solid technical capability but exhibits hesitation crutches or gaze avoidance under pressure. Assigned to automated 2-minute daily practice drills.
                  </p>
                </div>

                {/* Tier 4 */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Tier 4 • Mentor Intervention</span>
                    <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-200">&lt;55% Score</Badge>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">Faculty Guided Coaching</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Significant interview anxiety or vocal hesitation detected. Recommended for 1-on-1 faculty mentor sessions prior to live recruitment drives.
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ── TAB 2: CANDIDATE PLACEMENT DIRECTORY ── */}
        {activeTab === 'directory' && (
          <div className="space-y-4">
            
            {/* Filter and Search Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search candidate by name, roll number, or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-xs h-9 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* Branch Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 font-medium">Branch:</span>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="text-xs h-9 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
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
                    <span className="text-xs text-slate-500 font-medium">Tier:</span>
                    <select
                      value={selectedTier}
                      onChange={(e) => setSelectedTier(e.target.value)}
                      className="text-xs h-9 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
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
                      className="h-9 px-2 text-xs text-slate-500 hover:text-slate-800"
                    >
                      Reset
                    </Button>
                  )}

                </div>

              </div>
            </div>

            {/* Students Table */}
            <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
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
                  <tbody className="divide-y divide-slate-100">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-500">
                          No candidates found matching the selected filters.
                        </td>
                      </tr>
                    ) : (
                      students.map((cand) => {
                        return (
                          <tr key={cand.id} className="hover:bg-slate-50/80 transition-colors">
                            
                            {/* Name + Live Badge */}
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900">{cand.name}</span>
                                {cand.is_live && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Live</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">Last active: {cand.last_session}</div>
                            </td>

                            {/* Roll Number */}
                            <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">
                              {cand.roll_number}
                            </td>

                            {/* Department */}
                            <td className="py-3.5 px-4">
                              <div className="text-slate-800 font-medium">{cand.branch} • Sec {cand.section}</div>
                              <div className="text-[11px] text-slate-400">{cand.batch} Batch</div>
                            </td>

                            {/* Sessions */}
                            <td className="py-3.5 px-3 text-center font-mono text-slate-700">
                              {cand.sessions_completed}
                            </td>

                            {/* Camera Gaze */}
                            <td className="py-3.5 px-4 text-center font-mono text-slate-800">
                              {cand.eye_contact}%
                            </td>

                            {/* Pacing WPM */}
                            <td className="py-3.5 px-4 text-center font-mono text-slate-800">
                              {cand.wpm}
                            </td>

                            {/* Fillers */}
                            <td className="py-3.5 px-4 text-center font-mono text-slate-800">
                              {cand.filler_count}
                            </td>

                            {/* Readiness Score */}
                            <td className="py-3.5 px-4 text-center font-mono">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-xs ${
                                cand.tier_badge === 'tier1'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : cand.tier_badge === 'core'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : cand.tier_badge === 'targeted'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
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
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : cand.tier_badge === 'core'
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                    : cand.tier_badge === 'targeted'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
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
                                className="text-xs h-7 px-2.5 border-slate-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 font-medium"
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

          </div>
        )}

        {/* ── TAB 3: PLACEMENT CRITERIA & AUDIT RUBRIC ── */}
        {activeTab === 'rubric' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Communication Evaluation Criteria */}
              <Card className="bg-white border-slate-200 shadow-xs p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Multimodal Evaluation Criteria</h3>
                    <p className="text-xs text-slate-500">Objective scoring weights across interview practice runs</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Candidate interview performance is measured client-side in the browser using objective biometric and acoustic algorithms without faculty subjectivity:
                </p>

                <div className="space-y-3 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex justify-between font-semibold text-slate-900">
                      <span>1. Camera Lens Presence (40% Weightage)</span>
                      <span className="font-mono text-indigo-600">80%+ Target</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed">
                      Measures facial orientation and iris gaze vectors directed toward the camera lens to project virtual presence and authority.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex justify-between font-semibold text-slate-900">
                      <span>2. Posture & Spinal Alignment (35% Weightage)</span>
                      <span className="font-mono text-indigo-600">75%+ Target</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed">
                      Monitors head tilt, shoulder slouching, and lateral alignment to prevent restless swaying during virtual interviews.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex justify-between font-semibold text-slate-900">
                      <span>3. Conversational Cadence & WPM (25% Weightage)</span>
                      <span className="font-mono text-indigo-600">130–150 WPM</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed">
                      Optimal speaking speed benchmark. Penalties applied when rushing (&gt;165 WPM) or hesitating (&lt;120 WPM).
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex justify-between font-semibold text-slate-900">
                      <span>4. Filler Word Frequency Deduction</span>
                      <span className="font-mono text-indigo-600">&lt;2.0 / min</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed">
                      Automated identification of speech disfluencies (`um`, `like`, `basically`, `you know`) with recommendations for 1-second silent pauses.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Institutional Compliance & Audit Evidence */}
              <Card className="bg-white border-slate-200 shadow-xs p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Institutional Audit & Accreditation Evidence</h3>
                    <p className="text-xs text-slate-500">Documentary compliance for Career Development Cells</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  VaniDarpan provides concrete, verifiable evidence for higher education quality benchmarks and placement cell accreditation:
                </p>

                <div className="space-y-3 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Verifiable Practice Records:</strong>
                      <p className="text-slate-500 leading-relaxed mt-0.5">
                        Over 6,840 timestamped mock sessions recorded for the 2026 cohort, showing measurable improvement curves from initial to final attempts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Remedial Student Triage:</strong>
                      <p className="text-slate-500 leading-relaxed mt-0.5">
                        Automated identification of 230 students requiring targeted communication practice before recruiter campus drives commence.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">One-Click Recruiter Dossier Export:</strong>
                      <p className="text-slate-500 leading-relaxed mt-0.5">
                        Download complete cohort telemetry in standard CSV format for recruiter shortlisting and departmental reviews.
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
                      <span>Export Full Institutional Audit Report</span>
                    </Button>
                  </div>
                </div>
              </Card>

            </div>

          </div>
        )}

      </div>

      {/* ── Interactive Candidate Dossier Modal ── */}
      <Dialog open={isDossierOpen} onOpenChange={setIsDossierOpen}>
        <DialogContent className="max-w-xl bg-white border-slate-200 p-6 text-slate-900">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  {selectedStudent?.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Roll No: <span className="font-mono font-medium text-slate-700">{selectedStudent?.roll_number}</span> • {selectedStudent?.branch_full || selectedStudent?.branch} (Section {selectedStudent?.section})
                </DialogDescription>
              </div>
              <Badge 
                variant="outline" 
                className={`text-xs font-semibold py-1 px-3 ${
                  selectedStudent?.tier_badge === 'tier1'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : selectedStudent?.tier_badge === 'core'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : selectedStudent?.tier_badge === 'targeted'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {selectedStudent?.tier}
              </Badge>
            </div>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4 py-2 text-xs">
              
              {/* Overall Score Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Composite Placement Readiness</span>
                  <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5">
                    {selectedStudent.readiness_score}%
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-medium">Practice Sessions</span>
                  <div className="text-base font-semibold text-slate-800 font-mono mt-0.5">
                    {selectedStudent.sessions_completed} Completed
                  </div>
                </div>
              </div>

              {/* Multimodal Telemetry Breakdown */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Telemetry Performance Metrics:
                </span>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border border-slate-200 bg-white">
                    <span className="text-slate-500 text-[11px] block">Camera Gaze Focus</span>
                    <span className="text-sm font-bold text-slate-900 font-mono block mt-1">
                      {selectedStudent.eye_contact}%
                    </span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">
                      {selectedStudent.eye_contact >= 75 ? 'Direct Focus' : 'Gaze Wandering'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 bg-white">
                    <span className="text-slate-500 text-[11px] block">Speaking Pace</span>
                    <span className="text-sm font-bold text-slate-900 font-mono block mt-1">
                      {selectedStudent.wpm} WPM
                    </span>
                    <span className="text-[10px] text-indigo-600 block mt-0.5">
                      {selectedStudent.wpm >= 130 && selectedStudent.wpm <= 155 ? 'Optimal' : 'Needs Adjust'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 bg-white">
                    <span className="text-slate-500 text-[11px] block">Filler Count</span>
                    <span className="text-sm font-bold text-slate-900 font-mono block mt-1">
                      {selectedStudent.filler_count}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {selectedStudent.filler_count <= 2 ? 'Low Hesitation' : 'Frequent Hesitation'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Diagnostic Notes */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                <span className="font-semibold text-slate-900 block text-xs">
                  Placement Coordinator Recommendations:
                </span>
                <p className="text-slate-600 leading-relaxed text-xs">
                  {selectedStudent.tier_badge === 'tier1' 
                    ? 'Candidate exhibits executive composure, steady camera presence, and clean STAR responses. Ready for premium recruiter Day-1 technical and leadership rounds.'
                    : selectedStudent.tier_badge === 'core'
                    ? 'Consistent technical communication. Advise practicing 2-minute timed problem statements to maintain composure during stress interviews.'
                    : selectedStudent.tier_badge === 'targeted'
                    ? 'Suffers from pacing acceleration and frequent filler words under pressure. Assigned to 60-second table topic drills to build instinctive pause habits.'
                    : 'High anxiety response during initial rounds. Recommended for personal mentorship with departmental soft-skills faculty.'
                  }
                </p>
              </div>

            </div>
          )}

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              VaniDarpan Institutional Intelligence Dossier
            </span>
            <Button
              size="sm"
              onClick={() => setIsDossierOpen(false)}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-white"
            >
              Close Dossier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
