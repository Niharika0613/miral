// client/src/pages/tpo.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Building2, 
  Download, 
  Search, 
  Users, 
  RefreshCw, 
  FileSpreadsheet, 
  Calendar, 
  Settings, 
  Briefcase, 
  Layers, 
  Check, 
  X,
  FileText,
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { VaniDarpanLogo } from '@/components/miral-logo';

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
}

type SidebarSection = 'overview' | 'batches' | 'students' | 'drives' | 'reports' | 'settings';

export default function TPO() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState<SidebarSection>('overview');
  
  const [stats, setStats] = useState<TpoStats | null>(null);
  const [heatmap, setHeatmap] = useState<BranchHeatmapItem[]>([]);
  const [students, setStudents] = useState<StudentCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Assign Practice Modal
  const [assignTarget, setAssignTarget] = useState<StudentCandidate | null>(null);
  const [assignedTopic, setAssignedTopic] = useState('Campus Placement Technical Interview');

  const fetchTpoData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, heatmapRes, studentsRes] = await Promise.all([
        fetch('/api/tpo/stats'),
        fetch('/api/tpo/heatmap'),
        fetch(`/api/tpo/students?branch=${selectedBranch}&tier=all&search=${encodeURIComponent(searchQuery)}`)
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
      console.error('Failed to fetch college portal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTpoData();
  }, [selectedBranch, searchQuery]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/tpo/export-csv');
      if (!res.ok) throw new Error('Export generation failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VaniDarpan_Placement_Readiness_Sample.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export complete',
        description: 'Candidate readiness data exported in CSV format.',
      });
    } catch (err: any) {
      toast({
        title: 'Export error',
        description: err.message || 'Unable to download placement data.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmAssignment = () => {
    if (!assignTarget) return;
    toast({
      title: 'Practice assigned',
      description: `Assigned "${assignedTopic}" to ${assignTarget.name} (${assignTarget.roll_number}).`,
    });
    setAssignTarget(null);
  };

  // Heatmap color helper according to DESIGN.md 5-step blue scale
  const getHeatmapColor = (score: number) => {
    if (score >= 85) return 'bg-[#1F4FBF] text-white';
    if (score >= 80) return 'bg-[#5280D8] text-white';
    if (score >= 70) return 'bg-[#8FB0EC] text-ink';
    if (score >= 60) return 'bg-[#C5D6F6] text-ink';
    return 'bg-[#EAF0FC] text-ink';
  };

  // Filter students who need support (<70 score or 'targeted'/'critical')
  const studentsNeedingSupport = students.filter(s => s.readiness_score < 70 || s.tier_badge === 'targeted' || s.tier_badge === 'critical');

  return (
    <div className="min-h-screen bg-surface text-text flex font-sans antialiased">
      
      {/* ===================== LEFT SIDEBAR ===================== */}
      <aside className="w-60 shrink-0 bg-paper border-r border-hairline flex flex-col justify-between min-h-screen sticky top-0 h-screen overflow-y-auto">
        <div className="p-5 space-y-6">
          
          {/* Logo & Portal Label */}
          <div className="space-y-1">
            <Link href="/" className="inline-block">
              <VaniDarpanLogo height={32} showHindi={true} />
            </Link>
            <div className="pt-2">
              <span className="text-[11px] font-medium text-muted">
                College portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setCurrentSection('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${
                currentSection === 'overview'
                  ? 'bg-darpan-blue-tint text-darpan-blue'
                  : 'text-text hover:text-ink hover:bg-surface'
              }`}
            >
              <BarChart3 className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentSection('batches')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${
                currentSection === 'batches'
                  ? 'bg-darpan-blue-tint text-darpan-blue'
                  : 'text-text hover:text-ink hover:bg-surface'
              }`}
            >
              <Layers className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span>Batches</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentSection('students')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${
                currentSection === 'students'
                  ? 'bg-darpan-blue-tint text-darpan-blue'
                  : 'text-text hover:text-ink hover:bg-surface'
              }`}
            >
              <Users className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span>Students</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentSection('drives')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${
                currentSection === 'drives'
                  ? 'bg-darpan-blue-tint text-darpan-blue'
                  : 'text-text hover:text-ink hover:bg-surface'
              }`}
            >
              <Briefcase className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span>Drives</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentSection('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${
                currentSection === 'reports'
                  ? 'bg-darpan-blue-tint text-darpan-blue'
                  : 'text-text hover:text-ink hover:bg-surface'
              }`}
            >
              <FileText className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span>Reports</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentSection('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${
                currentSection === 'settings'
                  ? 'bg-darpan-blue-tint text-darpan-blue'
                  : 'text-text hover:text-ink hover:bg-surface'
              }`}
            >
              <Settings className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span>Settings</span>
            </button>
          </nav>

        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-hairline space-y-3">
          <Link href="/practice" className="flex items-center gap-2 text-xs text-muted hover:text-ink transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Open student mirror</span>
          </Link>

          <div className="pt-2 border-t border-hairline">
            <div className="text-xs font-medium text-ink">Career services cell</div>
            <div className="text-[11px] text-muted">placement@college.edu.in</div>
          </div>
        </div>
      </aside>

      {/* ===================== MAIN PORTAL VIEW ===================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Bar */}
        <header className="h-16 px-6 sm:px-8 bg-paper border-b border-hairline flex items-center justify-between sticky top-0 z-20">
          
          {/* Left: College Name & Sample Data Tag */}
          <div className="flex items-center gap-3 min-w-0">
            <Building2 className="h-5 w-5 text-darpan-blue shrink-0" strokeWidth={1.75} />
            <div className="flex items-center gap-2 truncate">
              <h1 className="text-sm sm:text-base font-semibold text-ink truncate">
                {stats?.college_name || 'Apex Engineering & Technology Institute'}
              </h1>
              <span className="text-[11px] font-medium text-muted bg-surface border border-hairline px-2 py-0.5 rounded-md shrink-0">
                Sample data
              </span>
            </div>
            <span className="hidden md:inline-block text-xs text-muted border-l border-hairline pl-3 ml-1">
              Batch of 2026
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTpoData}
              disabled={isLoading}
              className="h-10 text-xs font-medium rounded-md bg-paper border-hairline text-ink hover:bg-surface gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-10 text-xs font-medium rounded-md bg-paper border-hairline text-ink hover:bg-surface"
            >
              Download report
            </Button>

            <Button
              size="sm"
              onClick={handleExportCsv}
              disabled={isExporting}
              className="h-10 px-4 text-xs font-medium rounded-md bg-darpan-blue text-white hover:bg-darpan-blue-hover"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
            </Button>
          </div>

        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 sm:p-8 space-y-8 max-w-[1360px] w-full mx-auto">
          
          {/* ===================== OVERVIEW VIEW ===================== */}
          {currentSection === 'overview' && (
            <div className="space-y-8">
              
              {/* 1. Four KPI Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* KPI 1 */}
                <div className="bg-paper border border-hairline rounded-lg p-5 space-y-1 text-left">
                  <div className="text-sm text-muted">Enrolled students</div>
                  <div className="text-3xl font-semibold text-ink tabular-nums">
                    {stats?.total_enrolled_candidates.toLocaleString() || '1,480'}
                  </div>
                  <div className="text-xs text-muted pt-1">
                    {stats?.total_practice_sessions.toLocaleString() || '6,840'} practice sessions
                  </div>
                </div>

                {/* KPI 2 */}
                <div className="bg-paper border border-hairline rounded-lg p-5 space-y-1 text-left">
                  <div className="text-sm text-muted">Average readiness</div>
                  <div className="text-3xl font-semibold text-ink tabular-nums">
                    {stats?.college_readiness_index || 77.4}%
                  </div>
                  <div className="text-xs text-success font-medium pt-1">
                    +5.2% vs baseline
                  </div>
                </div>

                {/* KPI 3 */}
                <div className="bg-paper border border-hairline rounded-lg p-5 space-y-1 text-left">
                  <div className="text-sm text-muted">Placement ready</div>
                  <div className="text-3xl font-semibold text-ink tabular-nums">
                    {stats?.tier1_candidates || 426}
                  </div>
                  <div className="text-xs text-muted pt-1">
                    85%+ composite score ({stats?.tier1_pct || 28.8}%)
                  </div>
                </div>

                {/* KPI 4 */}
                <div className="bg-paper border border-hairline rounded-lg p-5 space-y-1 text-left">
                  <div className="text-sm text-muted">Students who need support</div>
                  <div className="text-3xl font-semibold text-ink tabular-nums">
                    {(stats?.targeted_candidates || 168) + (stats?.critical_candidates || 62)}
                  </div>
                  <div className="text-xs text-caution font-medium pt-1">
                    &lt;70% readiness score
                  </div>
                </div>

              </div>

              {/* 2. Readiness Heatmap (Branch by Skill) */}
              <div className="bg-paper border border-hairline rounded-lg p-6 text-left space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-hairline">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-ink">Readiness heatmap by branch and skill</h2>
                      <span className="text-[11px] font-medium text-muted bg-surface border border-hairline px-2 py-0.5 rounded-md">
                        Sample data
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      Benchmarked from recent student on-camera practice sessions
                    </p>
                  </div>
                </div>

                {/* Heatmap Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-hairline text-xs font-medium text-muted">
                        <th className="py-2.5 px-3">Branch</th>
                        <th className="py-2.5 px-3 text-center">Enrolled</th>
                        <th className="py-2.5 px-3 text-right">Eye contact</th>
                        <th className="py-2.5 px-3 text-right">Pace</th>
                        <th className="py-2.5 px-3 text-right">Posture</th>
                        <th className="py-2.5 px-3 text-right">Filler friction</th>
                        <th className="py-2.5 px-3 text-right">Overall readiness</th>
                        <th className="py-2.5 px-3">Primary observation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {heatmap.map((item) => (
                        <tr key={item.branch} className="hover:bg-surface transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-semibold text-ink">{item.branch}</span>
                            <span className="text-xs text-muted block">{item.name}</span>
                          </td>
                          <td className="py-3 px-3 text-center tabular-nums text-xs text-muted">
                            {item.students_count}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className={`inline-block w-14 py-1 text-center rounded-sm text-xs font-medium tabular-nums ${getHeatmapColor(item.eye_contact)}`}>
                              {item.eye_contact}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className={`inline-block w-14 py-1 text-center rounded-sm text-xs font-medium tabular-nums ${getHeatmapColor(Math.min(100, Math.round(item.wpm / 1.7)))}`}>
                              {item.wpm} wpm
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className={`inline-block w-14 py-1 text-center rounded-sm text-xs font-medium tabular-nums ${getHeatmapColor(item.posture)}`}>
                              {item.posture}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-xs text-text tabular-nums">
                              {item.filler_rate}/min
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className={`inline-block w-14 py-1 text-center rounded-sm text-xs font-semibold tabular-nums ${getHeatmapColor(item.readiness_score)}`}>
                              {item.readiness_score}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-xs text-muted max-w-xs truncate">
                            {item.primary_bottleneck}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Heatmap Legend */}
                <div className="pt-3 border-t border-hairline flex flex-wrap items-center justify-between gap-4 text-xs text-muted">
                  <span className="font-medium">Readiness scale:</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-sm bg-[#EAF0FC] border border-hairline" />
                      <span>&lt;60% Needs support</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-sm bg-[#C5D6F6]" />
                      <span>60–70% Developing</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-sm bg-[#8FB0EC]" />
                      <span>70–80% Competent</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-sm bg-[#5280D8]" />
                      <span>80–90% Ready</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-sm bg-[#1F4FBF]" />
                      <span>90%+ Outstanding</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* 3. Table: Students Who Need Support */}
              <div className="bg-paper border border-hairline rounded-lg p-6 text-left space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-hairline">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-ink">Students who need support</h2>
                      <span className="text-[11px] font-medium text-muted bg-surface border border-hairline px-2 py-0.5 rounded-md">
                        Sample data
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      Students scoring below 70% readiness who benefit from targeted practice assignments
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Branch filter */}
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="h-10 text-xs px-3 rounded-md bg-paper border border-hairline text-ink focus:outline-none focus:border-darpan-blue"
                    >
                      <option value="all">All departments</option>
                      <option value="CSE">CSE</option>
                      <option value="IT">IT</option>
                      <option value="ECE">ECE</option>
                      <option value="ME">ME</option>
                      <option value="CE">CE</option>
                    </select>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                      <Input
                        placeholder="Search student..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 text-xs h-10 w-48 sm:w-60 bg-paper border-hairline text-ink rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-hairline text-xs font-medium text-muted">
                        <th className="py-2.5 px-3">Student name</th>
                        <th className="py-2.5 px-3">Roll number</th>
                        <th className="py-2.5 px-3">Branch & section</th>
                        <th className="py-2.5 px-3 text-center">Sessions</th>
                        <th className="py-2.5 px-3 text-right">Eye contact</th>
                        <th className="py-2.5 px-3 text-right">Pace</th>
                        <th className="py-2.5 px-3 text-right">Readiness score</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {studentsNeedingSupport.length > 0 ? (
                        studentsNeedingSupport.map((cand) => (
                          <tr key={cand.id} className="hover:bg-surface transition-colors">
                            <td className="py-3 px-3 font-semibold text-ink">
                              {cand.name}
                            </td>
                            <td className="py-3 px-3 text-xs text-muted tabular-nums">
                              {cand.roll_number}
                            </td>
                            <td className="py-3 px-3 text-xs text-text">
                              {cand.branch} • Sec {cand.section}
                            </td>
                            <td className="py-3 px-3 text-center text-xs tabular-nums text-text">
                              {cand.sessions_completed}
                            </td>
                            <td className="py-3 px-3 text-right text-xs tabular-nums text-text">
                              {cand.eye_contact}%
                            </td>
                            <td className="py-3 px-3 text-right text-xs tabular-nums text-text">
                              {cand.wpm} wpm
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className="text-xs font-semibold tabular-nums text-caution">
                                {cand.readiness_score}%
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAssignTarget(cand)}
                                className="h-8 px-3 text-xs font-medium rounded-md bg-paper border-hairline text-ink hover:bg-surface"
                              >
                                Assign practice
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-xs text-muted">
                            No students currently flagged in this filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* ===================== BATCHES VIEW ===================== */}
          {currentSection === 'batches' && (
            <div className="bg-paper border border-hairline rounded-lg p-6 text-left space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-hairline">
                <div>
                  <h2 className="text-base font-semibold text-ink">Batch cohort comparison</h2>
                  <p className="text-xs text-muted">Active graduation cohorts across placement cycles</p>
                </div>
                <span className="text-[11px] font-medium text-muted bg-surface border border-hairline px-2 py-0.5 rounded-md">
                  Sample data
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-lg bg-surface border border-hairline space-y-2">
                  <span className="text-xs text-muted">Batch of 2026</span>
                  <div className="text-2xl font-semibold text-ink tabular-nums">1,480 students</div>
                  <div className="text-xs text-success font-medium">77.4% average readiness</div>
                  <p className="text-xs text-muted pt-2">Active placement drive season.</p>
                </div>

                <div className="p-5 rounded-lg bg-surface border border-hairline space-y-2">
                  <span className="text-xs text-muted">Batch of 2027</span>
                  <div className="text-2xl font-semibold text-ink tabular-nums">1,520 students</div>
                  <div className="text-xs text-muted font-medium">68.2% average readiness</div>
                  <p className="text-xs text-muted pt-2">Pre-final year foundation practice.</p>
                </div>

                <div className="p-5 rounded-lg bg-surface border border-hairline space-y-2">
                  <span className="text-xs text-muted">Batch of 2028</span>
                  <div className="text-2xl font-semibold text-ink tabular-nums">1,450 students</div>
                  <div className="text-xs text-muted font-medium">61.5% average readiness</div>
                  <p className="text-xs text-muted pt-2">Introductory speech mirror onboarding.</p>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STUDENTS DIRECTORY VIEW ===================== */}
          {currentSection === 'students' && (
            <div className="bg-paper border border-hairline rounded-lg p-6 text-left space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-hairline">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-ink">Student directory</h2>
                    <span className="text-[11px] font-medium text-muted bg-surface border border-hairline px-2 py-0.5 rounded-md">
                      Sample data
                    </span>
                  </div>
                  <p className="text-xs text-muted">All registered students in the active academic batch</p>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search all candidates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 text-xs w-60 bg-paper border-hairline rounded-md"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-hairline text-xs font-medium text-muted">
                      <th className="py-2.5 px-3">Student name</th>
                      <th className="py-2.5 px-3">Roll number</th>
                      <th className="py-2.5 px-3">Branch</th>
                      <th className="py-2.5 px-3 text-center">Sessions</th>
                      <th className="py-2.5 px-3 text-right">Eye contact</th>
                      <th className="py-2.5 px-3 text-right">Pace</th>
                      <th className="py-2.5 px-3 text-right">Readiness</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {students.map((cand) => (
                      <tr key={cand.id} className="hover:bg-surface transition-colors">
                        <td className="py-3 px-3 font-semibold text-ink">{cand.name}</td>
                        <td className="py-3 px-3 text-xs text-muted tabular-nums">{cand.roll_number}</td>
                        <td className="py-3 px-3 text-xs text-text">{cand.branch}</td>
                        <td className="py-3 px-3 text-center text-xs tabular-nums text-text">{cand.sessions_completed}</td>
                        <td className="py-3 px-3 text-right text-xs tabular-nums text-text">{cand.eye_contact}%</td>
                        <td className="py-3 px-3 text-right text-xs tabular-nums text-text">{cand.wpm} wpm</td>
                        <td className="py-3 px-3 text-right text-xs font-semibold tabular-nums text-ink">{cand.readiness_score}%</td>
                        <td className="py-3 px-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAssignTarget(cand)}
                            className="h-8 px-3 text-xs font-medium rounded-md bg-paper border-hairline text-ink hover:bg-surface"
                          >
                            Assign practice
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== DRIVES VIEW ===================== */}
          {currentSection === 'drives' && (
            <div className="bg-paper border border-hairline rounded-lg p-6 text-left space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-hairline">
                <div>
                  <h2 className="text-base font-semibold text-ink">Upcoming placement drives</h2>
                  <p className="text-xs text-muted">Scheduled recruitment events and preparation readiness targets</p>
                </div>
                <span className="text-[11px] font-medium text-muted bg-surface border border-hairline px-2 py-0.5 rounded-md">
                  Sample data
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-surface border border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-ink">Tier-1 Consulting & Product Engineering Drive</div>
                    <div className="text-xs text-muted">Scheduled: November 15, 2026 • Target readiness: 85%+</div>
                  </div>
                  <span className="text-xs text-darpan-blue bg-darpan-blue-tint px-2.5 py-1 rounded-md font-medium w-fit">
                    426 candidates qualified
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-surface border border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-ink">Core IT & Cloud Infrastructure Drive</div>
                    <div className="text-xs text-muted">Scheduled: November 28, 2026 • Target readiness: 75%+</div>
                  </div>
                  <span className="text-xs text-darpan-blue bg-darpan-blue-tint px-2.5 py-1 rounded-md font-medium w-fit">
                    824 candidates qualified
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ===================== REPORTS VIEW ===================== */}
          {currentSection === 'reports' && (
            <div className="bg-paper border border-hairline rounded-lg p-6 text-left space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-hairline">
                <div>
                  <h2 className="text-base font-semibold text-ink">Institutional reports and downloads</h2>
                  <p className="text-xs text-muted">Audited batch delivery metrics for internal review</p>
                </div>
                <span className="text-[11px] font-medium text-muted bg-surface border border-hairline px-2 py-0.5 rounded-md">
                  Sample data
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-lg bg-surface border border-hairline space-y-3">
                  <h3 className="text-sm font-semibold text-ink">Comprehensive placement readiness dossier</h3>
                  <p className="text-xs text-muted">Full CSV export containing all candidate metrics, session timestamps, and branch readiness scores.</p>
                  <Button onClick={handleExportCsv} className="h-10 text-xs font-medium bg-darpan-blue text-white rounded-md">
                    Export CSV dossier
                  </Button>
                </div>

                <div className="p-5 rounded-lg bg-surface border border-hairline space-y-3">
                  <h3 className="text-sm font-semibold text-ink">Printable overview report</h3>
                  <p className="text-xs text-muted">Print-ready PDF layout formatted with KPI strip, readiness heatmap, and departmental summary.</p>
                  <Button variant="outline" onClick={() => window.print()} className="h-10 text-xs font-medium bg-paper border-hairline text-ink rounded-md">
                    Download printable report
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ===================== SETTINGS VIEW ===================== */}
          {currentSection === 'settings' && (
            <div className="bg-paper border border-hairline rounded-lg p-6 text-left space-y-6">
              <div className="pb-3 border-b border-hairline">
                <h2 className="text-base font-semibold text-ink">Portal settings</h2>
                <p className="text-xs text-muted">Manage college profile and notification preferences</p>
              </div>

              <div className="space-y-4 max-w-xl">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ink">Institution name</label>
                  <Input 
                    value={stats?.college_name || 'Apex Engineering & Technology Institute'} 
                    disabled 
                    className="h-10 text-sm bg-surface border-hairline"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ink">Placement season</label>
                  <Input 
                    value="2025–2026 Academic Placement Season" 
                    disabled 
                    className="h-10 text-sm bg-surface border-hairline"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ink">Official notification email</label>
                  <Input 
                    value="placement@college.edu.in" 
                    disabled 
                    className="h-10 text-sm bg-surface border-hairline"
                  />
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* ===================== ASSIGN PRACTICE MODAL ===================== */}
      {assignTarget && (
        <div className="fixed inset-0 bg-[#0E1726]/60 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-paper border border-hairline rounded-lg p-6 shadow-sm space-y-4 text-left">
            
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <span className="text-sm font-semibold text-ink">Assign practice session</span>
              <button onClick={() => setAssignTarget(null)} className="text-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted">Candidate:</span>
              <div className="text-sm font-semibold text-ink">
                {assignTarget.name} ({assignTarget.roll_number})
              </div>
              <div className="text-xs text-muted">
                {assignTarget.branch} • Current readiness: {assignTarget.readiness_score}%
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-medium text-ink">Select practice track or drill:</label>
              <select
                value={assignedTopic}
                onChange={(e) => setAssignedTopic(e.target.value)}
                className="w-full h-10 text-xs px-3 rounded-md bg-paper border border-hairline text-ink focus:outline-none focus:border-darpan-blue"
              >
                <option value="Campus Placement Technical Interview">Campus Placement Technical Interview</option>
                <option value="Executive Pacing & Pause Control Drill">Executive Pacing & Pause Control Drill</option>
                <option value="Camera Lens Gaze Stability Focus">Camera Lens Gaze Stability Focus</option>
                <option value="Hesitation & Filler Word Elimination">Hesitation & Filler Word Elimination</option>
                <option value="STAR Technical Capstone Walkthrough">STAR Technical Capstone Walkthrough</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAssignTarget(null)}
                className="h-9 px-4 text-xs font-medium rounded-md bg-paper border-hairline text-ink hover:bg-surface"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmAssignment}
                className="h-9 px-4 text-xs font-medium rounded-md bg-darpan-blue text-white hover:bg-darpan-blue-hover"
              >
                Confirm assignment
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
