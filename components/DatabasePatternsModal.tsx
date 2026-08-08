import React, { useState } from 'react';
import {
  DATABASE_PATTERNS_DATA,
  DatabasePattern
} from '../data/databasePatternsData';
import { ArchType } from '../types';

interface DatabasePatternsModalProps {
  onClose: () => void;
  onSelectArchitecture?: (archId: ArchType) => void;
}

const CATEGORIES = [
  'All Patterns',
  'Scaling & Partitioning',
  'Distributed Consistency',
  'Data Storage Optimization',
  'Audit & Compliance'
] as const;

export const DatabasePatternsModal: React.FC<DatabasePatternsModalProps> = ({
  onClose,
  onSelectArchitecture
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Patterns');
  const [activePatternId, setActivePatternId] = useState<string>(DATABASE_PATTERNS_DATA[0].id);
  const [codeTab, setCodeTab] = useState<'refactored' | 'antiPattern'>('refactored');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const filteredPatterns = DATABASE_PATTERNS_DATA.filter((p) => {
    if (selectedCategory === 'All Patterns') return true;
    return p.category === selectedCategory;
  });

  const activePattern: DatabasePattern =
    DATABASE_PATTERNS_DATA.find((p) => p.id === activePatternId) || filteredPatterns[0] || DATABASE_PATTERNS_DATA[0];

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-6xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 rounded-xl text-white shadow-lg shadow-teal-900/30">
              <span className="font-mono font-black text-lg">🗄️ DATABASE</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                Enterprise Database Architecture Patterns
              </h2>
              <p className="text-xs text-zinc-400">
                Real-world data persistence strategies, anti-patterns vs refactored schemas, and consistency trade-offs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
            title="Close Database Patterns"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category Filter Bar */}
        <div className="bg-zinc-950 border-b border-zinc-800 p-3 sm:p-4 shrink-0 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider shrink-0 mr-1">
            Category Filter:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Master-Detail Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-800">

          {/* Left Master List */}
          <div className="md:col-span-4 overflow-y-auto p-2 space-y-1.5 max-h-[220px] md:max-h-none bg-zinc-950/50">
            <div className="text-[10px] font-bold text-zinc-500 uppercase px-2 py-1">
              Patterns ({filteredPatterns.length})
            </div>

            {filteredPatterns.map((pattern) => {
              const isSelected = activePattern.id === pattern.id;
              return (
                <button
                  key={pattern.id}
                  onClick={() => setActivePatternId(pattern.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    isSelected
                      ? 'bg-zinc-900 border-emerald-500/80 text-white shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                      {pattern.category}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-white mb-1">{pattern.name}</div>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 leading-tight">
                    {pattern.tagline}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Detail Pane */}
          <div className="md:col-span-8 overflow-y-auto p-4 sm:p-6 space-y-6 bg-zinc-900/60">
            {activePattern && (
              <div className="space-y-6 animate-in fade-in duration-150">

                {/* Pattern Title Banner */}
                <div className="border-b border-zinc-800 pb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      {activePattern.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white">{activePattern.name}</h3>
                  <p className="text-sm text-zinc-300 font-medium leading-relaxed">
                    "{activePattern.tagline}"
                  </p>
                </div>

                {/* Problem Scenario vs Architectural Solution */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Scenario */}
                  <div className="bg-amber-950/20 border border-amber-800/50 p-4 rounded-xl space-y-1.5">
                    <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>⚠️ Real-World Problem Scenario:</span>
                    </div>
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      {activePattern.problemScenario}
                    </p>
                  </div>

                  {/* Solution */}
                  <div className="bg-emerald-950/20 border border-emerald-800/50 p-4 rounded-xl space-y-1.5">
                    <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>✅ Architectural Solution Pattern:</span>
                    </div>
                    <p className="text-xs text-emerald-200/90 leading-relaxed">
                      {activePattern.solutionDescription}
                    </p>
                  </div>
                </div>

                {/* Interactive Code Comparison (Anti-Pattern vs Refactored Schema) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-300">
                        Schema & Code Implementation:
                      </span>
                      <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[11px]">
                        <button
                          onClick={() => setCodeTab('refactored')}
                          className={`px-3 py-1 rounded-md font-bold transition-all ${
                            codeTab === 'refactored'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          ✅ Refactored Schema
                        </button>
                        <button
                          onClick={() => setCodeTab('antiPattern')}
                          className={`px-3 py-1 rounded-md font-bold transition-all ${
                            codeTab === 'antiPattern'
                              ? 'bg-rose-600 text-white shadow'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          ❌ Anti-Pattern
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleCopyCode(
                          codeTab === 'refactored'
                            ? activePattern.schemaImplementation.refactoredCode
                            : activePattern.schemaImplementation.antiPatternCode
                        )
                      }
                      className="text-[11px] px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg transition-colors"
                    >
                      {copiedCode ? '✓ Copied' : '📋 Copy Code'}
                    </button>
                  </div>

                  {/* Code Box */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
                    <div className="bg-zinc-900/90 px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-zinc-400 text-[11px]">
                      <span className="font-semibold text-zinc-300">
                        {activePattern.schemaImplementation.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-zinc-500">
                        {activePattern.schemaImplementation.language}
                      </span>
                    </div>

                    <pre className="p-4 overflow-x-auto text-zinc-300 leading-relaxed max-h-[280px] overflow-y-auto">
                      <code>
                        {codeTab === 'refactored'
                          ? activePattern.schemaImplementation.refactoredCode
                          : activePattern.schemaImplementation.antiPatternCode}
                      </code>
                    </pre>

                    <div className="bg-zinc-900/80 p-3 border-t border-zinc-800 text-xs text-zinc-300">
                      <span className="font-bold text-zinc-400 block mb-0.5 text-[10px] uppercase">
                        {codeTab === 'refactored' ? 'Why this works:' : 'Why this fails under scale:'}
                      </span>
                      <p className="text-[11px] leading-relaxed">
                        {codeTab === 'refactored'
                          ? activePattern.schemaImplementation.refactoredExplanation
                          : activePattern.schemaImplementation.antiPatternExplanation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pros vs Cons Trade-off Analysis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>👍 Architectural Advantages (Pros):</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {activePattern.tradeOffs.pros.map((pro, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold shrink-0">✓</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>👎 Trade-Offs & Complexity (Cons):</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {activePattern.tradeOffs.cons.map((con, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold shrink-0">⚠️</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommended Engines & Tips */}
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Recommended Database Engines:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activePattern.recommendedEngines.map((engine, idx) => (
                        <span
                          key={idx}
                          className="bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs px-2.5 py-0.5 rounded-lg font-mono font-semibold"
                        >
                          {engine}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                      💡 Production Implementation Rules of Thumb:
                    </span>
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {activePattern.architecturalTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-400 font-bold shrink-0">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex justify-between items-center shrink-0">
          <p className="text-xs text-zinc-500 hidden sm:block">
            Database Design Patterns for Distributed Systems and High-Scale Engines
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-2 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
