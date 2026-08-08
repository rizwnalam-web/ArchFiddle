import React, { useState } from 'react';
import {
  Compass,
  Star,
  CheckSquare,
  Sparkles,
  Search,
  Filter,
  Grid,
  List,
  Layers,
  ChevronDown,
  ChevronRight,
  Zap,
  Award,
  Briefcase,
  Scale,
  DollarSign,
  Terminal,
  BookOpen,
  FolderTree,
  Shield,
  HelpCircle,
  Code2
} from 'lucide-react';
import { ArchitectureData, ArchType, ArchCategory } from '../types';

interface ArchitectureSidebarProps {
  architectures: ArchitectureData[];
  selectedArchId: ArchType;
  onSelectArchitecture: (id: ArchType) => void;
  favorites: ArchType[];
  onToggleFavorite: (id: ArchType, e?: React.MouseEvent) => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  selectedCategory: ArchCategory | 'ALL';
  onSelectCategory: (cat: ArchCategory | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isCompareMode: boolean;
  onToggleCompareMode: () => void;
  compareList: ArchType[];
  onToggleCompareList: (id: ArchType, e: React.MouseEvent) => void;
  onOpenComparison: () => void;
  
  // Quick launchers
  onOpenFdeAcademy: () => void;
  onOpenQuiz: () => void;
  onOpenCareerPath: () => void;
  onOpenCostEstimator: () => void;
  onOpenCategoryMatrix: () => void;
  onOpenEnterpriseMethodology: () => void;
  onOpenInterviewPrep: () => void;
  onOpenSolidGuide: () => void;
  onOpenGlossary: () => void;
}

export const ArchitectureSidebar: React.FC<ArchitectureSidebarProps> = ({
  architectures,
  selectedArchId,
  onSelectArchitecture,
  favorites,
  onToggleFavorite,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  isCompareMode,
  onToggleCompareMode,
  compareList,
  onToggleCompareList,
  onOpenComparison,
  onOpenFdeAcademy,
  onOpenQuiz,
  onOpenCareerPath,
  onOpenCostEstimator,
  onOpenCategoryMatrix,
  onOpenEnterpriseMethodology,
  onOpenInterviewPrep,
  onOpenSolidGuide,
  onOpenGlossary,
}) => {
  // View mode: 'grouped' by category or 'flat' list
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryCollapse = (cat: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

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

  const getCategoryIcon = (cat: ArchCategory) => {
    switch (cat) {
      case ArchCategory.Enterprise:
        return '🏢';
      case ArchCategory.CloudNative:
        return '☁️';
      case ArchCategory.DevOpsInfra:
        return '⚙️';
      case ArchCategory.RealtimeScale:
        return '⚡';
      case ArchCategory.WebMobileEdge:
        return '🌐';
      default:
        return '📐';
    }
  };

  // Filter architectures
  const visibleArchitectures = architectures.filter(arch => {
    const matchesFav = !showFavoritesOnly || favorites.includes(arch.id);
    const matchesCat = selectedCategory === 'ALL' || arch.category === selectedCategory;

    if (!matchesFav || !matchesCat) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    const titleMatch = arch.title.toLowerCase().includes(q);
    const categoryMatch = arch.category.toLowerCase().includes(q);
    const tagMatch = arch.tags?.some(tag => tag.toLowerCase().includes(q));
    const techMatch = arch.technologyStack.some(tech => tech.toLowerCase().includes(q));
    const coreIdeaMatch = arch.coreIdea.toLowerCase().includes(q);
    const useCaseMatch = arch.useCase.toLowerCase().includes(q);

    return titleMatch || categoryMatch || tagMatch || techMatch || coreIdeaMatch || useCaseMatch;
  });

  // Group by category
  const categoriesList = Object.values(ArchCategory);

  const renderArchitectureCard = (arch: ArchitectureData) => {
    const isSelected = selectedArchId === arch.id;
    const isFav = favorites.includes(arch.id);
    const isCompared = compareList.includes(arch.id);

    return (
      <div
        key={arch.id}
        onClick={() => onSelectArchitecture(arch.id)}
        className={`w-full text-left p-3 rounded-xl cursor-pointer transition-all duration-150 relative group border ${
          isSelected
            ? 'bg-gradient-to-r from-blue-900/60 via-indigo-900/50 to-zinc-900 border-blue-500 shadow-lg shadow-blue-950/50 text-white'
            : 'bg-zinc-900/80 hover:bg-zinc-800/90 border-zinc-800/80 text-zinc-300 hover:text-white'
        }`}
      >
        {/* Active Left Indicator Bar */}
        {isSelected && (
          <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-r-full" />
        )}

        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isCompareMode && (
              <div
                onClick={(e) => onToggleCompareList(arch.id, e)}
                className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                  isCompared
                    ? 'bg-purple-600 border-purple-500'
                    : 'border-zinc-600 bg-zinc-950 hover:border-zinc-400'
                }`}
                title={isCompared ? 'Remove from compare' : 'Add to compare'}
              >
                {isCompared && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
            <span className="font-bold text-xs leading-snug truncate group-hover:text-blue-300 transition-colors">
              {arch.title}
            </span>
          </div>

          <button
            onClick={(e) => onToggleFavorite(arch.id, e)}
            className={`p-1 rounded-md transition-colors shrink-0 ${
              isFav ? 'text-amber-400 hover:text-amber-300' : 'text-zinc-600 hover:text-zinc-400 opacity-0 group-hover:opacity-100'
            }`}
            title={isFav ? 'Remove favorite' : 'Add favorite'}
          >
            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Category & Complexity Metadata Pill Row */}
        <div className="flex items-center justify-between gap-2 mt-2 text-[10px]">
          <span className={`px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(arch.category)} font-mono font-medium truncate max-w-[130px]`}>
            {arch.category.split(' ')[0]}
          </span>
          <span className="text-zinc-400 font-mono text-[10px]">
            Score: <strong className="text-zinc-200">{arch.estimation.complexityScore}/10</strong>
          </span>
        </div>

        {/* Tech Stack Chips */}
        {arch.technologyStack && arch.technologyStack.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {arch.technologyStack.slice(0, 3).map((tech, idx) => (
              <span
                key={idx}
                className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${
                  isSelected
                    ? 'bg-blue-950/70 border-blue-600/40 text-blue-200'
                    : 'bg-zinc-950/80 border-zinc-800 text-zinc-400'
                }`}
              >
                {tech}
              </span>
            ))}
            {arch.technologyStack.length > 3 && (
              <span className="text-[9px] text-zinc-500 self-center">
                +{arch.technologyStack.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-full md:w-80 lg:w-84 bg-zinc-950 border-r border-zinc-800 flex-shrink-0 h-[calc(100vh-53px)] overflow-hidden flex flex-col relative select-none">
      
      {/* Top Filter & Control Header */}
      <div className="p-3.5 border-b border-zinc-800/90 bg-zinc-900/60 space-y-3 shrink-0">
        
        {/* Title Bar with Count & View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Architectures</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/60 font-bold">
              {visibleArchitectures.length} / 13
            </span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
            <button
              onClick={() => setViewMode('grouped')}
              className={`p-1 rounded text-xs transition-colors ${
                viewMode === 'grouped' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Group by Architectural Pillar"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`p-1 rounded text-xs transition-colors ${
                viewMode === 'flat' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Flat Streamlined List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Scrolling) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
            <span>Filter Category</span>
            {selectedCategory !== 'ALL' && (
              <button
                onClick={() => onSelectCategory('ALL')}
                className="text-blue-400 hover:underline lowercase font-mono"
              >
                reset
              </button>
            )}
          </div>
          <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1 text-[11px]">
            <button
              onClick={() => onSelectCategory('ALL')}
              className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === 'ALL'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              All (13)
            </button>
            {categoriesList.map(cat => {
              const catCount = architectures.filter(a => a.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors shrink-0 flex items-center gap-1 ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-950 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                  }`}
                >
                  <span>{getCategoryIcon(cat)}</span>
                  <span>{cat.split(' ')[0]}</span>
                  <span className="text-[9px] opacity-70 font-mono">({catCount})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Tech Search Shortcuts */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar text-[10px]">
          <span className="text-zinc-500 shrink-0 font-medium">Quick:</span>
          {['Kafka', 'Kubernetes', 'React', 'gRPC', 'Serverless', 'Redis'].map((tag) => (
            <button
              key={tag}
              onClick={() => onSearchChange(searchQuery === tag ? '' : tag)}
              className={`px-1.5 py-0.5 rounded border transition-colors shrink-0 ${
                searchQuery.toLowerCase() === tag.toLowerCase()
                  ? 'bg-blue-600 text-white border-blue-500 font-bold'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Architectures List Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {visibleArchitectures.length === 0 ? (
          <div className="text-center py-12 px-4 text-zinc-500">
            <Search className="w-8 h-8 mx-auto text-zinc-600 mb-2 opacity-50" />
            <p className="text-xs font-semibold text-zinc-400">No matching architectures found.</p>
            {searchQuery && (
              <p className="text-[11px] text-zinc-500 mt-1">
                Query: <span className="text-zinc-300 font-mono">"{searchQuery}"</span>
              </p>
            )}
            <button
              onClick={() => {
                onSelectCategory('ALL');
                onSearchChange('');
              }}
              className="mt-3 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-blue-400 rounded-xl text-xs font-semibold transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : viewMode === 'flat' ? (
          <div className="space-y-2 pb-16">
            {visibleArchitectures.map(arch => renderArchitectureCard(arch))}
          </div>
        ) : (
          <div className="space-y-4 pb-16">
            {categoriesList.map(cat => {
              const itemsInCat = visibleArchitectures.filter(a => a.category === cat);
              if (itemsInCat.length === 0) return null;

              const isCollapsed = collapsedCategories[cat] || false;

              return (
                <div key={cat} className="space-y-2">
                  {/* Category Header Bar */}
                  <div
                    onClick={() => toggleCategoryCollapse(cat)}
                    className="flex items-center justify-between px-2 py-1 bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800/80 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                      <span>{getCategoryIcon(cat)}</span>
                      <span>{cat}</span>
                      <span className="text-[10px] font-mono text-zinc-400 font-normal">
                        ({itemsInCat.length})
                      </span>
                    </div>
                    <button className="text-zinc-500 hover:text-zinc-300">
                      {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {!isCollapsed && (
                    <div className="space-y-2 pl-1">
                      {itemsInCat.map(arch => renderArchitectureCard(arch))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Compare Action Bar */}
      {isCompareMode && compareList.length > 0 && (
        <div className="p-3 bg-zinc-900/95 backdrop-blur border-t border-purple-800/50 shadow-2xl animate-in slide-in-from-bottom-4">
          <button
            onClick={onOpenComparison}
            disabled={compareList.length < 2}
            className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Scale className="w-4 h-4" />
            {compareList.length < 2 ? `Select ${2 - compareList.length} more` : `Launch Compare (${compareList.length})`}
          </button>
        </div>
      )}

      {/* Bottom Compact Quick Hub */}
      <div className="p-2 border-t border-zinc-800/80 bg-zinc-950 flex items-center justify-between text-zinc-400 text-xs shrink-0">
        <button
          onClick={onOpenFdeAcademy}
          className="p-1.5 hover:bg-cyan-950/60 hover:text-cyan-300 rounded-lg transition-colors flex items-center gap-1"
          title="FDE Academy & Certification"
        >
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-bold hidden sm:inline">FDE</span>
        </button>

        <button
          onClick={onOpenQuiz}
          className="p-1.5 hover:bg-purple-950/60 hover:text-purple-300 rounded-lg transition-colors flex items-center gap-1"
          title="Mastery Quiz"
        >
          <Award className="w-4 h-4 text-purple-400" />
          <span className="text-[10px] font-bold hidden sm:inline">Quiz</span>
        </button>

        <button
          onClick={onOpenCareerPath}
          className="p-1.5 hover:bg-amber-950/60 hover:text-amber-300 rounded-lg transition-colors flex items-center gap-1"
          title="Career Path"
        >
          <Briefcase className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold hidden sm:inline">Career</span>
        </button>

        <button
          onClick={onOpenCostEstimator}
          className="p-1.5 hover:bg-emerald-950/60 hover:text-emerald-300 rounded-lg transition-colors flex items-center gap-1"
          title="Cost Estimator"
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-bold hidden sm:inline">Cost</span>
        </button>

        <button
          onClick={onOpenCategoryMatrix}
          className="p-1.5 hover:bg-indigo-950/60 hover:text-indigo-300 rounded-lg transition-colors flex items-center gap-1"
          title="Category Matrix"
        >
          <Grid className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-bold hidden sm:inline">Matrix</span>
        </button>
      </div>
    </aside>
  );
};
