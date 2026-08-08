import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Zap,
  BookOpen,
  Briefcase,
  GraduationCap,
  Award,
  Layers,
  Scale,
  DollarSign,
  FileDown,
  Sparkles,
  Search,
  Star,
  CheckSquare,
  HelpCircle,
  FolderTree,
  Database,
  Grid,
  Shield,
  ChevronDown,
  Menu,
  X,
  Workflow,
  Code2,
  Terminal,
  Activity,
  BarChart3,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { ArchType, ArchCategory } from '../types';

interface HeaderNavProps {
  // Navigation trigger callbacks
  onOpenFdeAcademy: () => void;
  onOpenQuiz: (defaultArch?: ArchType, scope?: 'all' | 'favorites' | 'current' | 'solid') => void;
  onOpenCareerPath: () => void;
  onOpenRoadmap: () => void;
  onOpenComparisonReport: () => void;
  onOpenCostEstimator: () => void;
  onOpenExportSpec: () => void;
  onOpenInterviewPrep: () => void;
  onOpenCategoryMatrix: () => void;
  onOpenEnterpriseMethodology: () => void;
  onOpenDatabasePatterns: () => void;
  onOpenDesignPatterns: () => void;
  onOpenSolidGuide: () => void;
  onOpenGlossary: () => void;
  
  // Search & Filters state
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  favoritesCount: number;
  isCompareMode: boolean;
  onToggleCompareMode: () => void;
  compareCount: number;
  onOpenCompareView: () => void;

  // Sidebar Controls
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onOpenFdeAcademy,
  onOpenQuiz,
  onOpenCareerPath,
  onOpenRoadmap,
  onOpenComparisonReport,
  onOpenCostEstimator,
  onOpenExportSpec,
  onOpenInterviewPrep,
  onOpenCategoryMatrix,
  onOpenEnterpriseMethodology,
  onOpenDatabasePatterns,
  onOpenDesignPatterns,
  onOpenSolidGuide,
  onOpenGlossary,
  searchQuery,
  onSearchChange,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  favoritesCount,
  isCompareMode,
  onToggleCompareMode,
  compareCount,
  onOpenCompareView,
  isSidebarOpen,
  onToggleSidebar
}) => {
  const [activeDropdown, setActiveDropdown] = useState<'academy' | 'tools' | 'deepdives' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name: 'academy' | 'tools' | 'deepdives') => {
    setActiveDropdown(prev => (prev === name ? null : name));
  };

  return (
    <header ref={navRef} className="sticky top-0 z-40 w-full bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/90 shadow-xl select-none">
      <div className="max-w-[1700px] mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left Side: Sidebar Toggle + Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
              isSidebarOpen
                ? 'bg-zinc-900 border-zinc-700 text-blue-400 hover:bg-zinc-800'
                : 'bg-blue-950/60 border-blue-800 text-blue-300 hover:bg-blue-900 shadow-md shadow-blue-950/40'
            }`}
            title={isSidebarOpen ? "Collapse Left Architecture Menu" : "Expand Left Architecture Menu"}
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSearchChange('')}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/30">
              <Compass className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-base font-black tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  ArchFiddle
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/90 text-zinc-300 border border-zinc-700">
                  v3.0
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium tracking-tight mt-0.5">
                SaaS Architecture & FDE Academy
              </p>
            </div>
          </div>
        </div>

        {/* Center: Real-Time Global Search Bar */}
        <div className="flex-1 max-w-md mx-2 relative hidden md:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search 13 architectures, tech (Kafka, React, K8s), tags..."
              className="w-full pl-9 pr-8 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300 text-xs"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Nav Menu Group (Dropdowns & Direct Action Buttons) */}
        <div className="hidden lg:flex items-center gap-2">
          
          {/* Menu Dropdown 1: Academies & Roadmaps */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('academy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                activeDropdown === 'academy'
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Academy & Career</span>
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${activeDropdown === 'academy' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'academy' && (
              <div className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-150 z-50">
                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenFdeAcademy();
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-800/80 transition-colors flex items-start gap-2.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-300 shrink-0 group-hover:scale-105 transition-transform">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>FDE Academy & Certificate</span>
                      <span className="px-1 py-0.2 rounded bg-cyan-900 text-cyan-200 text-[9px] font-mono">
                        Cert Exam
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                      6-phase playbook, SCIF blueprints, war rooms & exam.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenCareerPath();
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-800/80 transition-colors flex items-start gap-2.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-700/60 flex items-center justify-center text-amber-300 shrink-0 group-hover:scale-105 transition-transform">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Career Path Builder</div>
                    <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                      Junior to Principal salaries, milestones & AI coaching.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenRoadmap();
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-800/80 transition-colors flex items-start gap-2.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-300 shrink-0 group-hover:scale-105 transition-transform">
                    <Workflow className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Progression Roadmap</div>
                    <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                      Visual system evolution from monoliths to space-based.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenQuiz();
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-800/80 transition-colors flex items-start gap-2.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-700/60 flex items-center justify-center text-purple-300 shrink-0 group-hover:scale-105 transition-transform">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Architecture Mastery Quiz</div>
                    <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                      Randomized drills, scorecards & category tests.
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Menu Dropdown 2: Tools & Reports */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('tools')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                activeDropdown === 'tools'
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              <span>Tools & Reports</span>
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${activeDropdown === 'tools' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'tools' && (
              <div className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-150 z-50">
                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenComparisonReport();
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-800/80 transition-colors flex items-start gap-2.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-700/60 flex items-center justify-center text-blue-300 shrink-0">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Compare Architectures Report</div>
                    <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                      Side-by-side trade-off matrix, SLA & cost scores.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenCostEstimator();
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-800/80 transition-colors flex items-start gap-2.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-300 shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Cloud Cost Estimator</div>
                    <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                      AWS/GCP monthly infra cost model with traffic sliders.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenInterviewPrep();
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-800/80 transition-colors flex items-start gap-2.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-950 border border-teal-700/60 flex items-center justify-center text-teal-300 shrink-0">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Interview Prep Studio</div>
                    <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                      System design drill questions, red flags & voice test.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenExportSpec();
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-800/80 transition-colors flex items-start gap-2.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
                    <FileDown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Export Architecture Spec</div>
                    <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                      Generate Markdown, JSON & PDF-ready specifications.
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Menu Dropdown 3: Engineering Deep Dives & Reference */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('deepdives')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                activeDropdown === 'deepdives'
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Engineering Blueprints</span>
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${activeDropdown === 'deepdives' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'deepdives' && (
              <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-150 z-50">
                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenCategoryMatrix();
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-zinc-800/80 transition-colors flex items-start gap-2.5"
                >
                  <Grid className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">Category Matrix</div>
                    <p className="text-[11px] text-zinc-400">Pillar-by-pillar comparative matrix of all 13 styles.</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenEnterpriseMethodology();
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-zinc-800/80 transition-colors flex items-start gap-2.5"
                >
                  <FolderTree className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">Enterprise Blueprint (TOGAF / C4)</div>
                    <p className="text-[11px] text-zinc-400">Context, Container, Component, and Code models.</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenDatabasePatterns();
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-zinc-800/80 transition-colors flex items-start gap-2.5"
                >
                  <Database className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">Database & Sharding Patterns</div>
                    <p className="text-[11px] text-zinc-400">CQRS, read replicas, distributed consensus & partitioning.</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenDesignPatterns();
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-zinc-800/80 transition-colors flex items-start gap-2.5"
                >
                  <Code2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">Distributed Design Patterns</div>
                    <p className="text-[11px] text-zinc-400">Circuit Breaker, Saga, Bulkhead, Outbox, and Sidecar.</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenSolidGuide();
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-zinc-800/80 transition-colors flex items-start gap-2.5"
                >
                  <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">SOLID Principles Guide</div>
                    <p className="text-[11px] text-zinc-400">Single Responsibility to Dependency Inversion code guides.</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    onOpenGlossary();
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-zinc-800/80 transition-colors flex items-start gap-2.5"
                >
                  <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">Distributed Systems Glossary</div>
                    <p className="text-[11px] text-zinc-400">Comprehensive dictionary of enterprise terms & acronyms.</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-zinc-800 mx-1" />

          {/* Quick Direct Buttons */}
          <button
            onClick={onOpenFdeAcademy}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-950/50 flex items-center gap-1.5 transition-all transform active:scale-95 shrink-0"
            title="Open Forward Deployed Engineering Academy & Certification"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-200" />
            <span>FDE Academy</span>
            <span className="px-1 py-0.2 bg-cyan-950 text-cyan-200 rounded text-[9px] font-mono border border-cyan-400/40">
              Exam
            </span>
          </button>

          {/* Favorites Filter Button with Counter */}
          <button
            onClick={onToggleFavoritesOnly}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              showFavoritesOnly
                ? 'bg-amber-950/80 border-amber-600 text-amber-300 shadow-md shadow-amber-950/40'
                : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title="Filter to show only starred favorite architectures"
          >
            <Star className={`w-3.5 h-3.5 ${showFavoritesOnly || favoritesCount > 0 ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'}`} />
            <span className="hidden xl:inline">{showFavoritesOnly ? 'Favorites Only' : 'Favorites'}</span>
            {favoritesCount > 0 && (
              <span className="px-1.5 py-0.2 bg-zinc-800 text-amber-300 rounded-full text-[10px] font-mono font-bold">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Compare Mode Toggle with Counter */}
          <button
            onClick={onToggleCompareMode}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isCompareMode
                ? 'bg-purple-950/80 border-purple-600 text-purple-300 shadow-md shadow-purple-950/40'
                : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title="Toggle Architecture Selection Compare Mode"
          >
            <CheckSquare className={`w-3.5 h-3.5 ${isCompareMode ? 'text-purple-400' : 'text-zinc-500'}`} />
            <span className="hidden xl:inline">Compare Mode</span>
            {compareCount > 0 && (
              <span className="px-1.5 py-0.2 bg-purple-900 text-purple-200 rounded-full text-[10px] font-mono font-bold">
                {compareCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile / Tablet Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onOpenFdeAcademy}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-600 text-white flex items-center gap-1"
          >
            <Zap className="w-3 h-3" />
            <span>FDE</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Sliders className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800 bg-zinc-950 p-4 space-y-3 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Mobile Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search 13 architectures..."
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200"
            />
          </div>

          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Academy & Career
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenFdeAcademy(); }}
              className="p-2.5 bg-zinc-900 border border-cyan-800/60 rounded-xl text-xs font-bold text-cyan-300 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" /> FDE Academy
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenCareerPath(); }}
              className="p-2.5 bg-zinc-900 border border-amber-800/60 rounded-xl text-xs font-bold text-amber-300 flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" /> Career Path
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenRoadmap(); }}
              className="p-2.5 bg-zinc-900 border border-indigo-800/60 rounded-xl text-xs font-bold text-indigo-300 flex items-center gap-2"
            >
              <Workflow className="w-4 h-4" /> Roadmap
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenQuiz(); }}
              className="p-2.5 bg-zinc-900 border border-purple-800/60 rounded-xl text-xs font-bold text-purple-300 flex items-center gap-2"
            >
              <Award className="w-4 h-4" /> Mastery Quiz
            </button>
          </div>

          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pt-2">
            Tools & Engineering Blueprints
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenComparisonReport(); }}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-center gap-2"
            >
              <Scale className="w-3.5 h-3.5 text-blue-400" /> Compare Report
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenCostEstimator(); }}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-center gap-2"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Cost Estimator
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenInterviewPrep(); }}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-center gap-2"
            >
              <Terminal className="w-3.5 h-3.5 text-teal-400" /> Interview Prep
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenCategoryMatrix(); }}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-center gap-2"
            >
              <Grid className="w-3.5 h-3.5 text-indigo-400" /> Category Matrix
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenEnterpriseMethodology(); }}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-center gap-2"
            >
              <FolderTree className="w-3.5 h-3.5 text-emerald-400" /> TOGAF / C4
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenDatabasePatterns(); }}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-center gap-2"
            >
              <Database className="w-3.5 h-3.5 text-teal-400" /> DB Patterns
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenDesignPatterns(); }}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-center gap-2"
            >
              <Code2 className="w-3.5 h-3.5 text-purple-400" /> Design Patterns
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenSolidGuide(); }}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-center gap-2"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" /> SOLID Guide
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenGlossary(); }}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-center gap-2"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> Glossary
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenExportSpec(); }}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-center gap-2"
            >
              <FileDown className="w-3.5 h-3.5 text-zinc-400" /> Export Spec
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
