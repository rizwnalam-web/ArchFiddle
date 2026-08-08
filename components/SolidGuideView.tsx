import React, { useState } from 'react';
import { SOLID_PRINCIPLES_DATA, SolidPrincipleData, LayerExample } from '../data/solidData';

interface SolidGuideViewProps {
  onClose: () => void;
  onOpenQuizWithSolid?: () => void;
}

export const SolidGuideView: React.FC<SolidGuideViewProps> = ({
  onClose,
  onOpenQuizWithSolid
}) => {
  const [selectedPrincipleKey, setSelectedPrincipleKey] = useState<string>('SRP');
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);
  const [codeMode, setCodeMode] = useState<'solid' | 'violation'>('solid');

  const currentPrinciple: SolidPrincipleData = SOLID_PRINCIPLES_DATA[selectedPrincipleKey];
  const currentExample: LayerExample = currentPrinciple.layerExamples[selectedLayerIndex] || currentPrinciple.layerExamples[0];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-purple-600 to-blue-600 rounded-xl text-white shadow-lg shadow-purple-900/30">
              <span className="font-mono font-black text-lg">SOLID</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                SOLID Principles in Layered Architecture
              </h2>
              <p className="text-xs text-zinc-400">
                Master clean architecture across Presentation, Domain, and Data Access layers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenQuizWithSolid && (
              <button
                onClick={() => {
                  onClose();
                  onOpenQuizWithSolid();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold rounded-lg shadow-md transition-all"
              >
                <span>🧠 Quiz on SOLID</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
              title="Close Guide"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Principle Selector Tabs (S - O - L - I - D) */}
        <div className="grid grid-cols-5 bg-zinc-950 border-b border-zinc-800 p-2 gap-1 shrink-0">
          {Object.values(SOLID_PRINCIPLES_DATA).map((p) => {
            const isSelected = p.id === selectedPrincipleKey;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPrincipleKey(p.id);
                  setSelectedLayerIndex(0); // Reset layer view when switching principle
                }}
                className={`py-2.5 px-2 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                  isSelected
                    ? 'bg-gradient-to-b from-blue-600/30 to-purple-600/30 border border-blue-500/60 text-white shadow-lg shadow-blue-900/20'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-mono font-black text-base px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {p.letter}
                  </span>
                  <span className="hidden md:inline text-xs font-bold truncate">{p.id}</span>
                </div>
                <span className="text-[10px] text-zinc-400 truncate max-w-[120px] hidden sm:block">
                  {p.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Principle Summary Banner */}
          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
                  Principle {currentPrinciple.letter}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {currentPrinciple.name} ({currentPrinciple.id})
                </h3>
              </div>
              <div className="text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 self-start sm:self-auto">
                <span>💡 Analogy:</span>
                <span className="italic">{currentPrinciple.realWorldAnalogy}</span>
              </div>
            </div>

            <p className="text-sm font-semibold text-zinc-200 leading-relaxed italic bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
              "{currentPrinciple.tagline}"
            </p>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {currentPrinciple.definition}
            </p>

            {/* Key Benefits Pills */}
            <div className="pt-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Core Architectural Benefits:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {currentPrinciple.keyBenefits.map((benefit, idx) => (
                  <div key={idx} className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/80 text-xs text-zinc-300 flex items-start gap-2">
                    <span className="text-green-400 font-bold shrink-0">✓</span>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Application Layer Selection Tabs */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Select Application Layer Scenario:
              </label>

              {/* Code Toggle (Violation vs SOLID) */}
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setCodeMode('violation')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    codeMode === 'violation'
                      ? 'bg-red-950 border border-red-500/80 text-red-200 shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-xs">❌</span> Anti-Pattern (Violation)
                </button>
                <button
                  onClick={() => setCodeMode('solid')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    codeMode === 'solid'
                      ? 'bg-green-950 border border-green-500/80 text-green-200 shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-xs">✅</span> SOLID Refactored
                </button>
              </div>
            </div>

            {/* Layer Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {currentPrinciple.layerExamples.map((example, idx) => {
                const isLayerSelected = selectedLayerIndex === idx;
                let layerBadgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
                if (example.layerName.includes('Business')) {
                  layerBadgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
                } else if (example.layerName.includes('Data')) {
                  layerBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedLayerIndex(idx)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isLayerSelected
                        ? 'bg-zinc-900 border-blue-500/80 ring-1 ring-blue-500/50 shadow-lg'
                        : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${layerBadgeColor}`}>
                        {example.layerName}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white truncate">{example.scenario}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Demonstration Window */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                Scenario: <span className="text-white">{currentExample.scenario}</span> ({currentExample.layerName})
              </span>
            </div>

            {/* Explanation Banner */}
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed ${
                codeMode === 'violation'
                  ? 'bg-red-950/20 border-red-900/50 text-red-200'
                  : 'bg-green-950/20 border-green-900/50 text-green-200'
              }`}
            >
              <div className="font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                {codeMode === 'violation' ? '❌ Why this violates ' + currentPrinciple.id + ':' : '✅ How this achieves ' + currentPrinciple.id + ':'}
              </div>
              <p>{codeMode === 'violation' ? currentExample.violationExplanation : currentExample.solidExplanation}</p>
            </div>

            {/* Code Block Container */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden font-mono text-xs shadow-2xl">
              <div className="bg-zinc-900/90 px-4 py-2 border-b border-zinc-800/80 flex items-center justify-between text-zinc-400 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                  <span className="ml-2 font-semibold text-zinc-300">
                    {codeMode === 'violation' ? 'anti-pattern.ts' : 'solid-refactored.ts'}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-zinc-500">TypeScript / React</span>
              </div>

              <pre className="p-4 overflow-x-auto text-zinc-300 leading-relaxed max-h-[380px] overflow-y-auto">
                <code>{codeMode === 'violation' ? currentExample.violationCode : currentExample.solidCode}</code>
              </pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex justify-between items-center shrink-0">
          <p className="text-xs text-zinc-500 hidden sm:block">
            Apply SOLID principles alongside architecture styles for resilient systems.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {onOpenQuizWithSolid && (
              <button
                onClick={() => {
                  onClose();
                  onOpenQuizWithSolid();
                }}
                className="py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <span>🧠 Quiz on SOLID Principles</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
