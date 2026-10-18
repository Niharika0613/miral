// client/src/pages/tpo.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  ShieldCheck, 
  Download, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  BarChart3, 
  Filter, 
  RefreshCw, 
  Layers, 
  Award, 
  GraduationCap, 
  ChevronRight, 
  Activity,
  Check,
  FileSpreadsheet,
  FileCheck2,
  ExternalLink
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
  const [activeTab, setActiveTab] = useState<'heatmap' | 'directory' | 'accreditation'>('heatmap');
  
  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);

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
      a.download = `VaniDarpan_Placement_Dossier_2026.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Placement Dossier Downloaded',
        description: 'Official candidate readiness telemetry exported successfully in CSV format.',
      });
    } catch (err: any) {
      toast({
        title: 'Export Error',
        description: err.message || 'Unable to download placement dossier.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060A] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Aurora Ambient Glow Background */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* ── Executive Institutional Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">
                {stats?.college_name || 'Autonomous Engineering & Technology Institute'} • Office of Career Services
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              TPO Institutional Placement & Communication Intelligence
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
              Objective multimodal AI telemetry monitoring candidate interview readiness, branch-level delivery heatmaps, and NBA PO10 accreditation compliance across the 2025–2026 hiring cycle.
            </p>

            {/* Accreditation Compliance Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="outline" className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border-emerald-500/30 py-0.5 px-2.5 gap-1.5">
                <ShieldCheck className="h-3 w-3" />
                <span>NAAC Criteria 5.1.2 & 5.1.4 Verified</span>
              </Badge>
              <Badge variant="outline" className="text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 border-cyan-500/30 py-0.5 px-2.5 gap-1.5">
                <Award className="h-3 w-3" />
                <span>NBA PO10 Attainment: 82.6%</span>
              </Badge>
              <Badge variant="outline" className="text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 border-indigo-500/30 py-0.5 px-2.5 gap-1.5">
                <GraduationCap className="h-3 w-3" />
                <span>2026 Batch Campus Recruitment</span>
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTpoData}
              disabled={isLoading}
              className="h-10 text-xs border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 gap-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </Button>

            <Button
              size="sm"
              onClick={handleExportCsv}
              disabled={isExporting}
              className="h-10 text-xs font-semibold gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isExporting ? 'Generating Dossier...' : 'Export Recruiter Dossier'}</span>
            </Button>
          </div>
        </div>

        {/* ── Executive KPI Metric Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Candidates & Sessions */}
          <Card className="bg-[#090D1A]/80 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-sm">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="uppercase font-semibold tracking-wider">Candidate Cohort</span>
                <Users className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {stats?.total_enrolled_candidates.toLocaleString() || '1,480'}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/[0.06]">
                <span>Evaluated Practice Sessions</span>
                <span className="font-semibold text-indigo-300">{stats?.total_practice_sessions.toLocaleString() || '6,840'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Composite Placement Readiness */}
          <Card className="bg-[#090D1A]/80 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-sm">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="uppercase font-semibold tracking-wider">College Readiness Index</span>
                <Activity className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight flex items-baseline gap-2">
                <span>{stats?.college_readiness_index || 77.4}%</span>
                <span className="text-xs font-semibold text-emerald-400">+5.2% vs baseline</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/[0.06]">
                <span>Average Gaze Stability</span>
                <span className="font-semibold text-slate-200">{stats?.avg_eye_contact || 73.6}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Tier-1 Elite Candidates */}
          <Card className="bg-[#090D1A]/80 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-sm">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="uppercase font-semibold tracking-wider">Tier-1 Recruiter Pool</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight flex items-baseline gap-2">
                <span>{stats?.tier1_candidates || 426}</span>
                <span className="text-xs font-semibold text-slate-400">({stats?.tier1_pct || 28.8}%)</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/[0.06]">
                <span>Target Package Potential</span>
                <span className="font-semibold text-emerald-400">₹12 LPA – ₹42 LPA</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Priority Remedial Intervention Pool */}
          <Card className="bg-[#090D1A]/80 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-sm">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="uppercase font-semibold tracking-wider">Targeted Remedial Pool</span>
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight flex items-baseline gap-2">
                <span>{(stats?.targeted_candidates || 168) + (stats?.critical_candidates || 62)}</span>
                <span className="text-xs font-semibold text-amber-400">At-Risk</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/[0.06]">
                <span>Automated Remedial Drills</span>
                <span className="font-semibold text-amber-300">Active</span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1">
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'heatmap'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Branch Communication Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'directory'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Candidate Placement Directory</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300">
              {students.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('accreditation')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'accreditation'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            <FileCheck2 className="h-4 w-4" />
            <span>NAAC & NBA Accreditation Rubric</span>
          </button>
        </div>

        {/* ── TAB 1: BRANCH COMMUNICATION HEATMAP ── */}
        {activeTab === 'heatmap' && (
          <div className="space-y-6">
            
            {/* Heatmap Matrix Card */}
            <Card className="bg-[#090D1A]/80 backdrop-blur-xl border border-white/[0.08] rounded-xl overflow-hidden shadow-sm">
              <CardHeader className="p-6 border-b border-white/[0.06] bg-white/[0.01]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                      <span>Cross-Department Placement Diagnostic Matrix</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 mt-1">
                      Objective behavioral telemetry benchmarked across engineering and management departments.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span>Ready (80%+)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-indigo-400" />
                      <span>Core (70-79%)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      <span>Attention (&lt;70%)</span>
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02] text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                        <th className="py-3.5 px-5">Department</th>
                        <th className="py-3.5 px-4 text-center">Cohort Size</th>
                        <th className="py-3.5 px-4 text-center">Gaze Stability</th>
                        <th className="py-3.5 px-4 text-center">Speaking Cadence</th>
                        <th className="py-3.5 px-4 text-center">Filler Friction</th>
                        <th className="py-3.5 px-4 text-center">Posture Poise</th>
                        <th className="py-3.5 px-4 text-center">Readiness Index</th>
                        <th className="py-3.5 px-5">Primary Diagnostic Finding</th>
                        <th className="py-3.5 px-4 text-center">TPO Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {heatmap.map((item) => {
                        const isHigh = item.readiness_score >= 80;
                        const isMid = item.readiness_score >= 70 && item.readiness_score < 80;

                        return (
                          <tr key={item.branch} className="hover:bg-white/[0.02] transition-colors">
                            {/* Branch Name */}
                            <td className="py-4 px-5">
                              <div className="font-bold text-white text-xs">{item.branch}</div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{item.name}</div>
                            </td>

                            {/* Cohort Size */}
                            <td className="py-4 px-4 text-center font-mono text-slate-300">
                              <div>{item.students_count}</div>
                              <div className="text-[10px] text-slate-500">{item.sessions_count} sessions</div>
                            </td>

                            {/* Gaze Stability */}
                            <td className="py-4 px-4 text-center">
                              <div className="font-semibold text-slate-200 font-mono">{item.eye_contact}%</div>
                              <div className="w-16 h-1.5 bg-white/10 rounded-full mx-auto mt-1 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${item.eye_contact >= 75 ? 'bg-emerald-400' : (item.eye_contact >= 68 ? 'bg-indigo-400' : 'bg-amber-400')}`}
                                  style={{ width: `${item.eye_contact}%` }}
                                />
                              </div>
                            </td>

                            {/* Speaking Cadence (WPM) */}
                            <td className="py-4 px-4 text-center font-mono">
                              <div className="font-semibold text-slate-200">{item.wpm} <span className="text-[10px] text-slate-500">WPM</span></div>
                              <div className="text-[10px] text-slate-500">
                                {item.wpm > 150 ? 'Rapid' : (item.wpm < 125 ? 'Deliberate' : 'Optimal')}
                              </div>
                            </td>

                            {/* Filler Rate */}
                            <td className="py-4 px-4 text-center font-mono">
                              <div className={`font-semibold ${item.filler_rate > 2.5 ? 'text-amber-400' : 'text-slate-200'}`}>
                                {item.filler_rate} <span className="text-[10px] text-slate-500">/min</span>
                              </div>
                            </td>

                            {/* Posture */}
                            <td className="py-4 px-4 text-center font-mono text-slate-300">
                              {item.posture}%
                            </td>

                            {/* Readiness Index */}
                            <td className="py-4 px-4 text-center font-mono">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                isHigh 
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                  : isMid 
                                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' 
                                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              }`}>
                                {item.readiness_score}%
                              </span>
                            </td>

                            {/* Diagnostic Finding */}
                            <td className="py-4 px-5">
                              <div className="text-[11px] font-medium text-slate-200 line-clamp-1">
                                {item.key_strength}
                              </div>
                              <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                Bottleneck: {item.primary_bottleneck}
                              </div>
                            </td>

                            {/* Status Badge */}
                            <td className="py-4 px-4 text-center">
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] font-semibold py-0.5 px-2 ${
                                  isHigh 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                                    : isMid 
                                    ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25' 
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
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

            {/* Strategic Placement Readiness Quadrants Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-4 rounded-xl bg-white/[0.02] border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Quadrant 1 • Elite</span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/15 text-emerald-300 border-emerald-500/30">85%+ Score</Badge>
                </div>
                <div className="text-sm font-semibold text-white">Tier-1 Direct Recruiter Ready</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Candidates with commanding camera gaze (&gt;80%), controlled vocal cadence (135–150 WPM), and zero hesitation crutches. Prime recommendation for Google, Amazon, Deloitte, and Consulting roles.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-indigo-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Quadrant 2 • Core</span>
                  <Badge variant="outline" className="text-[10px] bg-indigo-500/15 text-indigo-300 border-indigo-500/30">70–84% Score</Badge>
                </div>
                <div className="text-sm font-semibold text-white">Core Placement Ready</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Solid structured communication with occasional minor pacing variance. Fully equipped for mass recruiter Day-1 rounds (TCS Prime, Infosys, Wipro, Accenture, Cognizant).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Quadrant 3 • Remedial</span>
                  <Badge variant="outline" className="text-[10px] bg-amber-500/15 text-amber-300 border-amber-500/30">55–69% Score</Badge>
                </div>
                <div className="text-sm font-semibold text-white">Targeted Remediation</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Demonstrates technical competency but suffers from high filler friction (&gt;3 fillers/min) or low camera gaze (&lt;60%). Automated micro-coaching assignments active.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-rose-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Quadrant 4 • Priority</span>
                  <Badge variant="outline" className="text-[10px] bg-rose-500/15 text-rose-300 border-rose-500/30">&lt;55% Score</Badge>
                </div>
                <div className="text-sm font-semibold text-white">Faculty Mentor Triage</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Acute stage hesitation and vocal freezing detected. Assigned directly to communication faculty mentors for guided 1-on-1 confidence rebuilding prior to company visits.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ── TAB 2: CANDIDATE PLACEMENT DIRECTORY ── */}
        {activeTab === 'directory' && (
          <div className="space-y-4">
            
            {/* Filter and Search Bar */}
            <Card className="bg-[#090D1A]/80 backdrop-blur-xl border border-white/[0.08] rounded-xl p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search candidate by name, roll number, or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-xs h-9 bg-white/[0.04] border-white/[0.1] text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Branch Filter */}
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="text-xs h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.1] text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Departments</option>
                    <option value="CSE">CSE (Computer Science)</option>
                    <option value="IT">IT (Information Technology)</option>
                    <option value="ECE">ECE (Electronics)</option>
                    <option value="ME">ME (Mechanical)</option>
                    <option value="CE">CE (Civil)</option>
                    <option value="MBA">MBA (Management)</option>
                  </select>

                  {/* Readiness Tier Filter */}
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="text-xs h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.1] text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Placement Tiers</option>
                    <option value="tier1">Tier-1 Elite (85%+)</option>
                    <option value="core">Core Ready (70–84%)</option>
                    <option value="targeted">Targeted Remediation (55–69%)</option>
                    <option value="critical">Faculty Intervention (&lt;55%)</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Students Table */}
            <Card className="bg-[#090D1A]/80 backdrop-blur-xl border border-white/[0.08] rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02] text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-3 px-5">Candidate Name</th>
                      <th className="py-3 px-4">Roll Number</th>
                      <th className="py-3 px-4">Department & Batch</th>
                      <th className="py-3 px-3 text-center">Sessions</th>
                      <th className="py-3 px-4 text-center">Camera Gaze</th>
                      <th className="py-3 px-4 text-center">Pacing WPM</th>
                      <th className="py-3 px-4 text-center">Fillers</th>
                      <th className="py-3 px-4 text-center">Readiness Score</th>
                      <th className="py-3 px-4 text-center">Placement Tier</th>
                      <th className="py-3 px-4 text-right">Recruiter Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {students.map((cand) => {
                      return (
                        <tr key={cand.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Name + Live Badge */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{cand.name}</span>
                              {cand.is_live && (
                                <Badge className="text-[9px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30 py-0 px-1.5 font-bold uppercase tracking-widest">
                                  Live Session
                                </Badge>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">{cand.last_session}</div>
                          </td>

                          {/* Roll Number */}
                          <td className="py-3.5 px-4 font-mono text-slate-300 text-xs">
                            {cand.roll_number}
                          </td>

                          {/* Department */}
                          <td className="py-3.5 px-4">
                            <div className="text-slate-200 font-medium">{cand.branch} • Sec {cand.section}</div>
                            <div className="text-[10px] text-slate-500">{cand.batch} Batch</div>
                          </td>

                          {/* Sessions */}
                          <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                            {cand.sessions_completed}
                          </td>

                          {/* Camera Gaze */}
                          <td className="py-3.5 px-4 text-center font-mono text-slate-200">
                            {cand.eye_contact}%
                          </td>

                          {/* Pacing WPM */}
                          <td className="py-3.5 px-4 text-center font-mono text-slate-200">
                            {cand.wpm}
                          </td>

                          {/* Fillers */}
                          <td className="py-3.5 px-4 text-center font-mono text-slate-200">
                            {cand.filler_count}
                          </td>

                          {/* Readiness Score */}
                          <td className="py-3.5 px-4 text-center font-mono">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-xs ${
                              cand.tier_badge === 'tier1'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : cand.tier_badge === 'core'
                                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                                : cand.tier_badge === 'targeted'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}>
                              {cand.readiness_score}%
                            </span>
                          </td>

                          {/* Tier Badge */}
                          <td className="py-3.5 px-4 text-center">
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] font-semibold py-0.5 px-2 ${
                                cand.tier_badge === 'tier1'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                  : cand.tier_badge === 'core'
                                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25'
                                  : cand.tier_badge === 'targeted'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                              }`}
                            >
                              {cand.tier}
                            </Badge>
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: `Candidate Dossier: ${cand.name}`,
                                  description: `Roll: ${cand.roll_number} | Readiness Score: ${cand.readiness_score}% | NBA PO10 Compliant`,
                                });
                              }}
                              className="text-[11px] h-7 px-2.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 font-medium"
                            >
                              <span>View Dossier</span>
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>
        )}

        {/* ── TAB 3: ACCREDITATION & AUDIT RUBRIC ── */}
        {activeTab === 'accreditation' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* NAAC Card */}
              <Card className="bg-[#090D1A]/80 backdrop-blur-xl border border-white/[0.08] rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">NAAC Accreditation Criteria 5.1.2 & 5.1.4</h3>
                    <p className="text-xs text-slate-400">Capacity Building & Soft Skills Enhancement Audit</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  VaniDarpan serves as an automated digital repository for NAAC peer-team inspections, providing verifiable evidence of institutional efforts in:
                </p>

                <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Soft Skills & Public Speaking Development:</strong> Automated timestamped logs verifying 6,840+ individual student practice runs.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Remedial Coaching for Hesitant Speakers:</strong> Documented algorithmic intervention for 230 at-risk students.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Transparent Quantitative Metrics:</strong> WPM pacing and camera intimacy ratings eliminating subjective faculty grading bias.</span>
                  </div>
                </div>
              </Card>

              {/* NBA PO10 Card */}
              <Card className="bg-[#090D1A]/80 backdrop-blur-xl border border-white/[0.08] rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">NBA Program Outcome 10 (PO10)</h3>
                    <p className="text-xs text-slate-400">Engineering Communication Rubric Attainment</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  NBA PO10 mandates that engineering graduates must communicate effectively on complex engineering activities with the engineering community and society at large.
                </p>

                <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Technical Viva & Defense Readiness:</strong> Real-time PREP framework scoring for algorithmic and architectural reasoning.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Department Attainment Level:</strong> CSE (82.6%), IT (79.8%), ECE (74.2%) — directly exportable for NBA SAR (Self-Assessment Report).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Continuous Improvement Proof:</strong> +5.2% delta recorded across multi-week practice cycles.</span>
                  </div>
                </div>
              </Card>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
