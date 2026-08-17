import React, { useState, useEffect } from 'react';
import { ARCHITECTURE_DETAILS } from './constants';
import { ArchType, ArchitectureData, ArchCategory } from './types';
import { DiagramRenderer } from './components/DiagramRenderer';
import { ChatAssistant } from './components/ChatAssistant';
import { ComparisonView } from './components/ComparisonView';
import { QuizModal } from './components/QuizModal';
import { SolidGuideView } from './components/SolidGuideView';
import { EnterpriseMethodologyView } from './components/EnterpriseMethodologyView';
import { GlossaryModal } from './components/GlossaryModal';
import { DatabasePatternsModal } from './components/DatabasePatternsModal';
import { CategoryMatrixModal } from './components/CategoryMatrixModal';
import { ExportModal } from './components/ExportModal';
import { CostEstimatorModal } from './components/CostEstimatorModal';
import { DesignPatternsModal } from './components/DesignPatternsModal';
import { InterviewPrepModal } from './components/InterviewPrepModal';
import { RoadmapView } from './components/RoadmapView';
import { CareerPathModal } from './components/CareerPathModal';
import { ArchitectureComparisonReportModal } from './components/ArchitectureComparisonReportModal';
import { FdeRoadmapModal } from './components/FdeRoadmapModal';
import { ArchitecturePlaygroundModal } from './components/ArchitecturePlaygroundModal';
import { ArchitectureSkeletonViewer } from './components/ArchitectureSkeletonViewer';
import { ArchitectureDeepDiveSection } from './components/ArchitectureDeepDiveSection';
import { FloatingAiAssistant } from './components/FloatingAiAssistant';
import { HeaderNav } from './components/HeaderNav';
import { ArchitectureSidebar } from './components/ArchitectureSidebar';
import {
  Star,
  Scale,
  Sparkles,
  Award,
  Zap,
  Briefcase,
  Workflow,
  DollarSign,
  FileDown,
  Terminal,
  Grid,
  Code2,
  Shield,
  HelpCircle,
  FolderTree,
  ChevronRight,
  Database,
  Bot,
  MessageSquare
} from 'lucide-react';

const App = () => {
  const [selectedArchId, setSelectedArchId] = useState<ArchType>(ArchType.Monolithic);
  
  // Favorites State
  const [favorites, setFavorites] = useState<ArchType[]>(() => {
    try {
      const saved = localStorage.getItem('archfiddle_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ArchCategory | 'ALL'>('ALL');

  // Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Comparison State
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<ArchType[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizDefaultArch, setQuizDefaultArch] = useState<ArchType | undefined>(undefined);
  const [quizScope, setQuizScope] = useState<'all' | 'favorites' | 'current' | 'solid'>('all');

  // SOLID Guide State
  const [showSolidGuide, setShowSolidGuide] = useState(false);

  // Enterprise Methodology State
  const [showEnterpriseMethodology, setShowEnterpriseMethodology] = useState(false);

  // Glossary State
  const [showGlossary, setShowGlossary] = useState(false);

  // Database Patterns State
  const [showDatabasePatterns, setShowDatabasePatterns] = useState(false);

  // Category Matrix Modal State
  const [showCategoryMatrix, setShowCategoryMatrix] = useState(false);

  // Export Spec Modal State
  const [showExportModal, setShowExportModal] = useState(false);

  // Cost Estimator Modal State
  const [showCostEstimator, setShowCostEstimator] = useState(false);

  // Design Patterns Modal State
  const [showDesignPatterns, setShowDesignPatterns] = useState(false);

  // Interview Prep Modal State
  const [showInterviewPrep, setShowInterviewPrep] = useState(false);

  // Roadmap View Modal State
  const [showRoadmapView, setShowRoadmapView] = useState(false);

  // Career Path Builder Modal State
  const [showCareerPathModal, setShowCareerPathModal] = useState(false);
  const [aiCoachPrompt, setAiCoachPrompt] = useState<string | undefined>(undefined);

  // Floating AI Assistant Modal / Popup State
  const [showAiAssistantModal, setShowAiAssistantModal] = useState(false);

  // Architecture Comparison Report Modal State
  const [showComparisonReportModal, setShowComparisonReportModal] = useState(false);
  const [comparisonReportPair, setComparisonReportPair] = useState<{ archA?: ArchType; archB?: ArchType }>({});

  // Forward Deployed Engineering (FDE) Academy & Certification State
  const [showFdeAcademy, setShowFdeAcademy] = useState(false);

  // Architecture Playground Modal State
  const [showPlaygroundModal, setShowPlaygroundModal] = useState(false);

  // Architecture Development Starter Skeletons Modal State
  const [showStarterTemplatesModal, setShowStarterTemplatesModal] = useState(false);

  // Main Architecture View Mode: 'details' | 'overview' | 'explorer' | 'unified'
  const [mainViewMode, setMainViewMode] = useState<'details' | 'overview' | 'explorer' | 'unified'>('details');

  // Global Search Query State
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('archfiddle_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: ArchType, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleCompareList = (id: ArchType, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareList(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleOpenComparison = () => {
    if (compareList.length > 1) {
      setShowComparison(true);
    }
  };

  const handleOpenQuiz = (defaultArch?: ArchType, scope: 'all' | 'favorites' | 'current' | 'solid' = 'all') => {
    setQuizDefaultArch(defaultArch);
    setQuizScope(scope);
    setShowQuiz(true);
  };

  const selectedArch: ArchitectureData = ARCHITECTURE_DETAILS[selectedArchId] || ARCHITECTURE_DETAILS[ArchType.Monolithic];
  const isCurrentFav = favorites.includes(selectedArch.id);
  const est = selectedArch.estimation;

  const getCategoryBadgeStyle = (cat: ArchCategory) => {
    switch (cat) {
      case ArchCategory.Enterprise:
        return 'bg-amber-950/70 border-amber-800/80 text-amber-300';
      case ArchCategory.CloudNative:
        return 'bg-blue-950/70 border-blue-800/80 text-blue-300';
      case ArchCategory.DevOpsInfra:
        return 'bg-emerald-950/70 border-emerald-800/80 text-emerald-300';
      case ArchCategory.RealtimeScale:
        return 'bg-purple-950/70 border-purple-800/80 text-purple-300';
      case ArchCategory.WebMobileEdge:
        return 'bg-sky-950/70 border-sky-800/80 text-sky-300';
      default:
        return 'bg-zinc-800 border-zinc-700 text-zinc-300';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      
      {/* Top Header Navigation with Complete Dropdown Menus, Search & Fast Launchers */}
      <HeaderNav
        onOpenPlayground={() => setShowPlaygroundModal(true)}
        onOpenFdeAcademy={() => setShowFdeAcademy(true)}
        onOpenQuiz={(defArch, scp) => handleOpenQuiz(defArch || selectedArchId, scp || 'all')}
        onOpenCareerPath={() => setShowCareerPathModal(true)}
        onOpenRoadmap={() => setShowRoadmapView(true)}
        onOpenComparisonReport={() => {
          setComparisonReportPair({ archA: selectedArchId });
          setShowComparisonReportModal(true);
        }}
        onOpenCostEstimator={() => setShowCostEstimator(true)}
        onOpenStarterTemplates={() => setShowStarterTemplatesModal(true)}
        onOpenExportSpec={() => setShowExportModal(true)}
        onOpenInterviewPrep={() => setShowInterviewPrep(true)}
        onOpenCategoryMatrix={() => setShowCategoryMatrix(true)}
        onOpenEnterpriseMethodology={() => setShowEnterpriseMethodology(true)}
        onOpenDatabasePatterns={() => setShowDatabasePatterns(true)}
        onOpenDesignPatterns={() => setShowDesignPatterns(true)}
        onOpenSolidGuide={() => setShowSolidGuide(true)}
        onOpenGlossary={() => setShowGlossary(true)}
        
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
        favoritesCount={favorites.length}
        isCompareMode={isCompareMode}
        onToggleCompareMode={() => setIsCompareMode(!isCompareMode)}
        compareCount={compareList.length}
        onOpenCompareView={() => setShowComparison(true)}
        
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Body Workspace (Sidebar + Interactive Main Studio) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Re-Organized Left Sidebar */}
        {isSidebarOpen && (
          <ArchitectureSidebar
            architectures={Object.values(ARCHITECTURE_DETAILS)}
            selectedArchId={selectedArchId}
            onSelectArchitecture={(id) => setSelectedArchId(id)}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isCompareMode={isCompareMode}
            onToggleCompareMode={() => setIsCompareMode(!isCompareMode)}
            compareList={compareList}
            onToggleCompareList={toggleCompareList}
            onOpenComparison={handleOpenComparison}
            
            onOpenPlayground={() => setShowPlaygroundModal(true)}
            onOpenFdeAcademy={() => setShowFdeAcademy(true)}
            onOpenStarterTemplates={() => setShowStarterTemplatesModal(true)}
            onOpenQuiz={() => handleOpenQuiz(selectedArchId, 'all')}
            onOpenCareerPath={() => setShowCareerPathModal(true)}
            onOpenCostEstimator={() => setShowCostEstimator(true)}
            onOpenCategoryMatrix={() => setShowCategoryMatrix(true)}
            onOpenEnterpriseMethodology={() => setShowEnterpriseMethodology(true)}
            onOpenInterviewPrep={() => setShowInterviewPrep(true)}
            onOpenSolidGuide={() => setShowSolidGuide(true)}
            onOpenGlossary={() => setShowGlossary(true)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 h-[calc(100vh-53px)] overflow-y-auto scroll-smooth custom-scrollbar">
          <div className="w-full max-w-[1650px] mx-auto p-4 sm:p-6 md:p-8 space-y-8">
            
            {/* Header with Breadcrumbs, Category Badge, Favorite Star & Quick Action Toolbar */}
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 pb-6 border-b border-zinc-800/80">
              <div className="space-y-3 flex-1">
                
                {/* Category Badge, Tag Pills & ID */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getCategoryBadgeStyle(selectedArch.category)} shadow-sm`}>
                    <span>🏷️</span>
                    <span>{selectedArch.category}</span>
                  </span>
                  
                  <span className="inline-block px-2.5 py-1 bg-zinc-900 text-zinc-300 border border-zinc-700/80 rounded-full text-xs font-mono">
                    ID: {selectedArch.id}
                  </span>

                  {selectedArch.tags && selectedArch.tags.map(tag => (
                    <span
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="text-[11px] px-2.5 py-0.5 bg-zinc-900/90 text-zinc-400 hover:text-blue-300 rounded-full border border-zinc-800 hover:border-blue-700 cursor-pointer transition-colors"
                      title={`Search by tag #${tag}`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Title and Favorite Toggle */}
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {selectedArch.title}
                  </h2>
                  <button 
                    onClick={() => toggleFavorite(selectedArch.id)}
                    className={`p-2 rounded-xl border transition-all ${
                      isCurrentFav 
                        ? 'bg-amber-950/80 border-amber-600 text-amber-400 shadow-md shadow-amber-950/50 hover:bg-amber-900' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                    }`}
                    title={isCurrentFav ? "Remove from Starred Favorites" : "Add to Starred Favorites"}
                  >
                    <Star className={`w-5 h-5 ${isCurrentFav ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {selectedArch.categoryDesc && (
                  <p className="text-xs text-indigo-300/90 italic font-medium">
                    {selectedArch.categoryDesc}
                  </p>
                )}

                <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-4xl">
                  {selectedArch.coreIdea}
                </p>
              </div>

              {/* Quick Actions Hub Bar */}
              <div className="shrink-0 flex items-center gap-2 self-start flex-wrap">
                <button
                  onClick={() => setShowAiAssistantModal(true)}
                  className="py-2 px-3.5 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-purple-600/30 hover:from-blue-600/50 hover:to-purple-600/50 border border-blue-500/50 text-blue-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm group"
                  title="Ask AI Principal Architect about trade-offs & senior system design"
                >
                  <Bot className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span>Ask AI Architect</span>
                </button>

                <button
                  onClick={() => setShowStarterTemplatesModal(true)}
                  className="py-2 px-3 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-cyan-600/20 hover:from-blue-600/40 hover:to-cyan-600/40 border border-blue-500/40 text-blue-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm group"
                  title="Explore Starter Development Skeletons, CLI Commands & Boilerplates"
                >
                  <Code2 className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span>Dev Skeletons</span>
                </button>

                <button
                  onClick={() => {
                    setComparisonReportPair({ archA: selectedArchId });
                    setShowComparisonReportModal(true);
                  }}
                  className="py-2 px-3 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 hover:from-blue-600/40 hover:to-purple-600/40 border border-blue-500/40 text-blue-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm group"
                  title="Generate a side-by-side comparative technical report"
                >
                  <Scale className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span>Compare Report</span>
                </button>

                <button
                  onClick={() => setShowCareerPathModal(true)}
                  className="py-2 px-3 bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-red-600/20 hover:from-amber-600/40 hover:to-red-600/40 border border-amber-500/40 text-amber-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm group"
                  title="View Career Path Builder & Roadmaps"
                >
                  <Briefcase className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Career Path</span>
                </button>

                <button
                  onClick={() => setShowCostEstimator(true)}
                  className="py-2 px-3 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/40 hover:to-teal-600/40 border border-emerald-500/40 text-emerald-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm group"
                  title="Calculate cloud infrastructure cost"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Cost Estimator</span>
                </button>

                <button
                  onClick={() => setShowExportModal(true)}
                  className="py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                  title="Export architecture details as Markdown or JSON"
                >
                  <FileDown className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Export</span>
                </button>

                <button
                  onClick={() => handleOpenQuiz(selectedArch.id)}
                  className="py-2 px-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-950/60 transition-all flex items-center gap-1.5 group transform active:scale-95"
                  title={`Test knowledge specifically on ${selectedArch.title}`}
                >
                  <Award className="w-4 h-4 text-purple-200 group-hover:scale-110 transition-transform" />
                  <span>Drill Quiz</span>
                </button>
              </div>
            </div>

            {/* Architecture Master Tip Accent Banner (Full Width) */}
            <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/40 p-4 sm:p-5 rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-amber-950/80 border border-amber-600/60 rounded-xl text-amber-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <span>Principal Architect Master Tip</span>
                    <span className="text-[10px] font-mono font-normal px-2 py-0.2 rounded bg-amber-950/80 border border-amber-700/60 text-amber-300">
                      Complexity {est.complexityScore}/10
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed">
                    "When evaluating {selectedArch.title}, verify whether team cognitive load, domain boundaries, and CI/CD automation can support its operational complexity ({est.complexityScore}/10)."
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setAiCoachPrompt(`What are the key architectural trade-offs, pitfalls, and cognitive load concerns when adopting ${selectedArch.title}?`);
                  setShowAiAssistantModal(true);
                }}
                className="whitespace-nowrap px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-end md:self-center shrink-0"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask AI About Pitfalls</span>
              </button>
            </div>

            {/* Primary Mode Switcher: In-Depth Details vs Overview vs Project Explorer vs All */}
            <div className="bg-zinc-900/90 border border-zinc-800 p-1.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-lg">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setMainViewMode('details')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    mainViewMode === 'details'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>🔬 In-Depth Details & Deep-Dive</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-200 border border-blue-400/30">
                    Primary
                  </span>
                </button>

                <button
                  onClick={() => setMainViewMode('overview')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    mainViewMode === 'overview'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <Workflow className="w-3.5 h-3.5" />
                  <span>🎯 Architecture Overview & Flow Canvas</span>
                </button>

                <button
                  onClick={() => setMainViewMode('explorer')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    mainViewMode === 'explorer'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <FolderTree className="w-3.5 h-3.5" />
                  <span>💻 Multi-Language Code Explorer</span>
                </button>

                <button
                  onClick={() => setMainViewMode('unified')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    mainViewMode === 'unified'
                      ? 'bg-zinc-700 text-white shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>📑 Unified View (All)</span>
                </button>
              </div>

              <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-400 px-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Spec: <strong className="text-zinc-200">{selectedArch.title}</strong></span>
              </div>
            </div>

            {/* View Mode 1: IN-DEPTH DETAILS (DEEP-DIVE PRIMARY SPEC) */}
            {(mainViewMode === 'details' || mainViewMode === 'unified') && (
              <div className="space-y-6">
                <ArchitectureDeepDiveSection
                  architecture={selectedArch}
                  onOpenProjectExplorer={() => setMainViewMode('explorer')}
                  onOpenPlayground={() => setShowPlaygroundModal(true)}
                />
              </div>
            )}

            {/* View Mode 2: ARCHITECTURE OVERVIEW & CANVAS */}
            {(mainViewMode === 'overview' || mainViewMode === 'unified') && (
              <div className="space-y-8">
                
                {/* Diagram Section (Expanded Full Width Canvas) */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3 shadow-xl">
                  <div className="bg-zinc-950 rounded-xl p-4 sm:p-5 h-[440px] sm:h-[480px] md:h-[520px] w-full flex flex-col">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                        <h3 className="text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-widest">
                          Interactive Architecture Flow Diagram & Micro-Components
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowPlaygroundModal(true)}
                          className="px-2.5 py-1 rounded-md bg-indigo-900/70 hover:bg-indigo-800 text-indigo-200 border border-indigo-600/50 text-[10px] font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          <span>Simulate in Playground</span>
                        </button>
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800">
                          Interactive SVG Canvas • Zoom & Pan Enabled
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 w-full relative overflow-hidden">
                      <DiagramRenderer type={selectedArch.id} />
                    </div>
                  </div>
                </div>

                {/* Estimation & Capacity Planning Section (4-Column Full-Width Grid on Desktop) */}
                <section className="bg-zinc-900/40 p-5 sm:p-6 rounded-2xl border border-zinc-800/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-pink-500 rounded-full" />
                      <span>Estimation & Capacity Planning</span>
                    </h3>
                    <button
                      onClick={() => setShowCostEstimator(true)}
                      className="px-3.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Estimate Cloud Cost</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
                    
                    {/* Development Speed */}
                    <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/60 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-400 uppercase">Dev Speed</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          est.devSpeed === 'Rapid' ? 'bg-green-950 text-green-300 border border-green-800' :
                          est.devSpeed === 'Moderate' ? 'bg-yellow-950 text-yellow-300 border border-yellow-800' :
                          'bg-red-950 text-red-300 border border-red-800'
                        }`}>{est.devSpeed}</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed mt-1">{est.devSpeedDesc}</p>
                    </div>

                    {/* Infrastructure Cost */}
                    <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/60 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-400 uppercase">Infra Cost</span>
                        <span className="text-xs font-bold text-zinc-300">{est.infraCost}</span>
                      </div>
                      <div className="flex gap-1 my-2">
                        {['Low', 'Medium', 'High', 'Variable'].map((lvl, idx) => {
                          const active = lvl === est.infraCost || (est.infraCost === 'Variable' && idx === 3);
                          return <div key={lvl} className={`h-1.5 flex-1 rounded-full ${active ? 'bg-blue-500' : 'bg-zinc-800'}`}></div>;
                        })}
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{est.infraCostDesc}</p>
                    </div>

                    {/* Team Size */}
                    <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/60 space-y-1.5">
                      <span className="text-xs font-bold text-zinc-400 uppercase block">Recommended Team Size</span>
                      <div className="flex items-center gap-2 text-sm text-zinc-200 font-semibold pt-1">
                        <Briefcase className="w-4 h-4 text-zinc-500" />
                        <span>{est.teamSize}</span>
                      </div>
                    </div>

                    {/* Complexity Score */}
                    <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/60 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-400 uppercase">Complexity Score</span>
                        <span className="text-xs font-bold text-zinc-300 font-mono">{est.complexityScore}/10</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden mt-2">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" 
                          style={{ width: `${est.complexityScore * 10}%` }}
                        />
                      </div>
                    </div>

                  </div>
                </section>

                {/* Deep Dive Description */}
                <section className="space-y-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-purple-500 rounded-full" />
                    <span>Architectural Realities & Trade-Offs</span>
                  </h3>
                  <div className="text-zinc-300 leading-7 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 whitespace-pre-line text-sm sm:text-base">
                    {selectedArch.description}
                  </div>
                </section>

                {/* Use Cases & Prerequisites (2-Column Grid) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <section className="space-y-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-green-500 rounded-full" />
                      <span>Target Use Cases</span>
                    </h3>
                    <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/80 text-zinc-300 text-sm min-h-[100px] leading-relaxed">
                      {selectedArch.useCase}
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-orange-500 rounded-full" />
                      <span>Prerequisites & Foundations</span>
                    </h3>
                    <ul className="space-y-2.5 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/80 min-h-[100px]">
                      {selectedArch.prerequisites.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-zinc-300 text-xs sm:text-sm">
                          <span className="text-orange-400 font-bold mt-0.5">▹</span> 
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                {/* Technology Stack */}
                <section className="space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
                    <span>Standard Technology Stack & Toolchain</span>
                  </h3>
                  <div className="flex flex-wrap gap-2.5 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/80">
                    {selectedArch.technologyStack.map((tech, i) => (
                      <button
                        key={i}
                        onClick={() => setSearchQuery(tech)}
                        className="px-3.5 py-2 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 rounded-xl text-xs font-semibold hover:border-blue-500 transition-colors flex items-center gap-1.5 shadow-sm"
                        title={`Search tech ${tech}`}
                      >
                        <span>{tech}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Pros and Cons (2-Column Grid) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <section className="space-y-2">
                    <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="p-1 bg-green-500/20 rounded">✓</span>
                      <span>Architectural Strengths (Pros)</span>
                    </h3>
                    <ul className="space-y-2.5 bg-zinc-900/30 p-5 rounded-2xl border border-zinc-800/60">
                      {selectedArch.pros.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-zinc-300 text-xs sm:text-sm">
                          <span className="text-green-500 font-bold">✓</span> 
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="p-1 bg-red-500/20 rounded">✕</span>
                      <span>Trade-Offs & Challenges (Cons)</span>
                    </h3>
                    <ul className="space-y-2.5 bg-zinc-900/30 p-5 rounded-2xl border border-zinc-800/60">
                      {selectedArch.cons.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-zinc-400 text-xs sm:text-sm">
                          <span className="text-red-500 font-bold">✕</span> 
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

              </div>
            )}

            {/* View Mode 3: MULTI-LANGUAGE CODE EXPLORER & STARTER TEMPLATES */}
            {(mainViewMode === 'explorer' || mainViewMode === 'unified') && (
              <section className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-emerald-500 rounded-full" />
                    <h3 className="text-base font-bold text-white">
                      Multi-Language Project Explorer & Boilerplate Scaffolding
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowStarterTemplatesModal(true)}
                    className="px-3.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Open Full Screen Studio</span>
                  </button>
                </div>
                
                <ArchitectureSkeletonViewer
                  archId={selectedArch.id}
                  onSelectArchitecture={(id) => setSelectedArchId(id)}
                />
              </section>
            )}

          </div>
        </main>
      </div>

      {/* Comparison View Overlay */}
      {showComparison && (
        <ComparisonView 
          architectures={compareList.map(id => ARCHITECTURE_DETAILS[id])}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* Quiz View Overlay */}
      {showQuiz && (
        <QuizModal 
          onClose={() => setShowQuiz(false)}
          defaultArchId={quizDefaultArch}
          defaultScope={quizScope}
          favorites={favorites}
          onSelectArchitecture={(id) => setSelectedArchId(id)}
          onOpenSolidGuide={() => setShowSolidGuide(true)}
        />
      )}

      {/* SOLID Principles Guide Overlay */}
      {showSolidGuide && (
        <SolidGuideView
          onClose={() => setShowSolidGuide(false)}
          onOpenQuizWithSolid={() => handleOpenQuiz(undefined, 'solid')}
        />
      )}

      {/* Enterprise System Methodology Blueprint Overlay */}
      {showEnterpriseMethodology && (
        <EnterpriseMethodologyView
          onClose={() => setShowEnterpriseMethodology(false)}
          onSelectArchitecture={(id) => setSelectedArchId(id)}
          onOpenSolidGuide={() => setShowSolidGuide(true)}
        />
      )}

      {/* Interactive Glossary Overlay */}
      {showGlossary && (
        <GlossaryModal
          onClose={() => setShowGlossary(false)}
          onSelectArchitecture={(id) => setSelectedArchId(id)}
        />
      )}

      {/* Database Design Patterns Overlay */}
      {showDatabasePatterns && (
        <DatabasePatternsModal
          onClose={() => setShowDatabasePatterns(false)}
          onSelectArchitecture={(id) => setSelectedArchId(id)}
        />
      )}

      {/* Architecture Category Matrix Overlay */}
      {showCategoryMatrix && (
        <CategoryMatrixModal
          onClose={() => setShowCategoryMatrix(false)}
          onSelectArchitecture={(id) => setSelectedArchId(id)}
        />
      )}

      {/* Export Architecture Specification Modal */}
      {showExportModal && (
        <ExportModal
          architecture={selectedArch}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Cloud Infrastructure Cost Estimator Modal */}
      {showCostEstimator && (
        <CostEstimatorModal
          architecture={selectedArch}
          onClose={() => setShowCostEstimator(false)}
        />
      )}

      {/* Software & Distributed Design Patterns Modal */}
      {showDesignPatterns && (
        <DesignPatternsModal
          onClose={() => setShowDesignPatterns(false)}
          onSelectArchitecture={(id) => setSelectedArchId(id)}
        />
      )}

      {/* Technical Interview Prep Studio Modal */}
      {showInterviewPrep && (
        <InterviewPrepModal
          onClose={() => setShowInterviewPrep(false)}
          onSelectArchitecture={(id) => setSelectedArchId(id)}
        />
      )}

      {/* Architecture Progression Roadmap Modal */}
      {showRoadmapView && (
        <RoadmapView
          onClose={() => setShowRoadmapView(false)}
          onSelectArchitecture={(id) => setSelectedArchId(id)}
        />
      )}

      {/* Career Path Builder Modal */}
      {showCareerPathModal && (
        <CareerPathModal
          onClose={() => setShowCareerPathModal(false)}
          onSelectArchitecture={(id) => setSelectedArchId(id)}
          onAskAICareerCoach={(prompt) => {
            setAiCoachPrompt(prompt);
            setShowAiAssistantModal(true);
          }}
          onOpenFdeAcademy={() => {
            setShowCareerPathModal(false);
            setShowFdeAcademy(true);
          }}
        />
      )}

      {/* Forward Deployed Engineering (FDE) Academy & Certification Modal */}
      {showFdeAcademy && (
        <FdeRoadmapModal
          onClose={() => setShowFdeAcademy(false)}
          onSelectArchitecture={(id) => setSelectedArchId(id)}
        />
      )}

      {/* Architecture Comparison Report Modal */}
      {showComparisonReportModal && (
        <ArchitectureComparisonReportModal
          initialArchA={comparisonReportPair.archA || selectedArchId}
          initialArchB={comparisonReportPair.archB || (selectedArchId === ArchType.Microservices ? ArchType.Monolithic : ArchType.Microservices)}
          onClose={() => setShowComparisonReportModal(false)}
          onAskAI={(prompt) => {
            setAiCoachPrompt(prompt);
            setShowAiAssistantModal(true);
          }}
        />
      )}

      {/* Architecture Development Starter Skeletons & Code Templates Modal */}
      {showStarterTemplatesModal && (
        <ArchitectureSkeletonViewer
          archId={selectedArchId}
          isModal={true}
          onClose={() => setShowStarterTemplatesModal(false)}
          onSelectArchitecture={(id) => setSelectedArchId(id)}
        />
      )}

      {/* Architecture Playground Modal (Interactive Canvas & Live Simulation) */}
      {showPlaygroundModal && (
        <ArchitecturePlaygroundModal
          onClose={() => setShowPlaygroundModal(false)}
          onAskAI={(prompt) => {
            setAiCoachPrompt(prompt);
            setShowAiAssistantModal(true);
          }}
        />
      )}

      {/* Persistent Floating AI Architect Bubble & Expandable Popup */}
      <FloatingAiAssistant
        architecture={selectedArch}
        initialPrompt={aiCoachPrompt}
        isOpen={showAiAssistantModal}
        onOpenChange={setShowAiAssistantModal}
      />

    </div>
  );
};

export default App;
