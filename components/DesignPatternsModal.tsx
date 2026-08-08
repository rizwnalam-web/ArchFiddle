import React, { useState } from 'react';
import { DESIGN_PATTERNS_DATA, DesignPattern } from '../data/designPatternsData';
import { ArchType } from '../types';

interface DesignPatternsModalProps {
  onClose: () => void;
  onSelectArchitecture?: (archId: ArchType) => void;
}

export const DesignPatternsModal: React.FC<DesignPatternsModalProps> = ({
  onClose,
  onSelectArchitecture
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePatternId, setActivePatternId] = useState<string>(DESIGN_PATTERNS_DATA[0].id);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Filter patterns
  const filteredPatterns = DESIGN_PATTERNS_DATA.filter((pattern) => {
    const matchesCategory = selectedCategory === 'ALL' || pattern.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      pattern.name.toLowerCase().includes(q) ||
      pattern.tagline.toLowerCase().includes(q) ||
      pattern.problemScenario.toLowerCase().includes(q) ||
      pattern.realWorldUseCases.some((uc) => uc.toLowerCase().includes(q)) ||
      pattern.codeExample.code.toLowerCase().includes(q)
    );
  });

  const activePattern =
    DESIGN_PATTERNS_DATA.find((p) => p.id === activePatternId) ||
    filteredPatterns[0] ||
    DESIGN_PATTERNS_DATA[0];

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const categories = ['ALL', 'Cloud & Distributed', 'Behavioral', 'Creational', 'Structural'];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-6xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-purple-900/30">
              <span className="text-xl">📐</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Software & Distributed Design Patterns
              </h2>
              <p className="text-xs text-zinc-400">
                Architectural design patterns with real-world scenarios, trade-offs, and code implementations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Top Filter & Search Controls */}
        <div className="bg-zinc-950 border-b border-zinc-800 p-3 sm:p-4 shrink-0 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto custom-scrollbar pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pattern name, CQRS, Saga..."
              className="w-full pl-8 pr-7 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
            />
            <span className="absolute left-2.5 top-2 text-zinc-500 text-xs">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-zinc-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Main Split Body: Sidebar Pattern List + Main Detail Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Pattern Selection Sidebar */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-950/60 overflow-y-auto custom-scrollbar p-3 space-y-2 shrink-0 max-h-48 md:max-h-none">
            {filteredPatterns.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No patterns found for "{searchQuery}".
              </div>
            ) : (
              filteredPatterns.map((pattern) => {
                const isActive = activePattern.id === pattern.id;

                return (
                  <button
                    key={pattern.id}
                    onClick={() => setActivePatternId(pattern.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                      isActive
                        ? 'bg-purple-950/40 border-purple-500/60 text-white ring-1 ring-purple-500/30'
                        : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span>{pattern.icon}</span>
                        <span>{pattern.name}</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {pattern.tagline}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
                      <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800/80">
                        {pattern.category}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Pattern Detail Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-zinc-900/40">
            
            {/* Title & Category Badge */}
            <div className="space-y-2 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activePattern.icon}</span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                  {activePattern.category}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {activePattern.name}
              </h3>
              <p className="text-sm font-medium text-purple-200/90 leading-relaxed">
                {activePattern.tagline}
              </p>
            </div>

            {/* Problem & Solution Comparison Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Problem Scenario */}
              <div className="bg-red-950/20 border border-red-900/40 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🚨 The Problem Scenario:</span>
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activePattern.problemScenario}
                </p>
              </div>

              {/* Solution Explanation */}
              <div className="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>💡 Architectural Solution:</span>
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activePattern.solutionExplanation}
                </p>
              </div>
            </div>

            {/* Code Implementation Window */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                  <span>💻 Code Blueprint Implementation:</span>
                  <span className="text-zinc-500 font-mono text-[10px]">({activePattern.codeExample.title})</span>
                </span>
                <button
                  onClick={() => handleCopyCode(activePattern.codeExample.code)}
                  className="text-[11px] px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  {copiedCode ? '✓ Copied' : '📋 Copy Code'}
                </button>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
                <div className="bg-zinc-900/90 px-4 py-2 border-b border-zinc-800/80 flex items-center justify-between text-zinc-400 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                    <span className="ml-2 font-semibold text-zinc-300">{activePattern.codeExample.title}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-purple-400">{activePattern.codeExample.language}</span>
                </div>
                <pre className="p-4 overflow-x-auto text-zinc-300 leading-relaxed max-h-72 overflow-y-auto custom-scrollbar">
                  <code>{activePattern.codeExample.code}</code>
                </pre>
              </div>
            </div>

            {/* Real World Use Cases */}
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <span>🌐 Real-World Enterprise Use Cases:</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                {activePattern.realWorldUseCases.map((uc, idx) => (
                  <li key={idx} className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/80 flex items-start gap-2">
                    <span className="text-indigo-400 font-bold shrink-0">•</span>
                    <span>{uc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trade-offs: Pros vs Cons & When To Use */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              {/* When To Use */}
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                  ✅ When To Use:
                </h4>
                <ul className="space-y-1.5 text-zinc-300">
                  {activePattern.whenToUse.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 shrink-0">✓</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* When NOT To Use */}
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                  ⚠️ When NOT To Use (Anti-Pattern):
                </h4>
                <ul className="space-y-1.5 text-zinc-300">
                  {activePattern.whenNotToUse.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 shrink-0">✕</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Related Architectures Links */}
            {activePattern.relatedArchTypes && activePattern.relatedArchTypes.length > 0 && (
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-zinc-400 font-medium">
                  Related Architecture Specifications in ArchFiddle:
                </span>
                <div className="flex gap-2">
                  {activePattern.relatedArchTypes.map((archId) => (
                    <button
                      key={archId}
                      onClick={() => {
                        onClose();
                        if (onSelectArchitecture) onSelectArchitecture(archId);
                      }}
                      className="px-3 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Explore Spec</span>
                      <span>→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
