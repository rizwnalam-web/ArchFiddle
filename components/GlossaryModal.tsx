import React, { useState, useMemo } from 'react';
import { GLOSSARY_TERMS, GlossaryTerm } from '../data/glossaryData';
import { ArchType } from '../types';

interface GlossaryModalProps {
  onClose: () => void;
  onSelectArchitecture?: (archId: ArchType) => void;
  initialSearchQuery?: string;
}

const CATEGORIES = [
  'All Terms',
  'Architectural Patterns',
  'Data & Persistence',
  'Domain-Driven Design',
  'Cloud & Infrastructure',
  'Security & Governance',
  'Operations & DevOps'
] as const;

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  onClose,
  onSelectArchitecture,
  initialSearchQuery = ''
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Terms');
  const [selectedTermId, setSelectedTermId] = useState<string>(GLOSSARY_TERMS[0].id);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Filtered terms
  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All Terms' || item.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        item.term.toLowerCase().includes(q) ||
        item.shortDefinition.toLowerCase().includes(q) ||
        item.fullDefinition.toLowerCase().includes(q) ||
        item.realWorldScenario.toLowerCase().includes(q) ||
        item.keyBenefits.some(b => b.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const activeTerm: GlossaryTerm =
    GLOSSARY_TERMS.find(t => t.id === selectedTermId) || filteredTerms[0] || GLOSSARY_TERMS[0];

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getArchEnumFromRelatedName = (name: string): ArchType | null => {
    const lower = name.toLowerCase();
    if (lower.includes('monolith') && !lower.includes('modular')) return ArchType.Monolithic;
    if (lower.includes('modular')) return ArchType.ModularMonolith;
    if (lower.includes('microservice')) return ArchType.Microservices;
    if (lower.includes('event')) return ArchType.EventDriven;
    if (lower.includes('serverless')) return ArchType.Serverless;
    if (lower.includes('cqrs')) return ArchType.CQRS;
    if (lower.includes('service mesh')) return ArchType.ServiceMesh;
    if (lower.includes('peer')) return ArchType.PeerToPeer;
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-6xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-900/30">
              <span className="font-mono font-black text-lg">📖 DICTIONARY</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                Software Architecture Interactive Glossary
              </h2>
              <p className="text-xs text-zinc-400">
                Essential technical definitions, real-world scenarios, and implementation patterns
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
            title="Close Glossary"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="bg-zinc-950 border-b border-zinc-800 p-3 sm:p-4 space-y-3 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search architecture terms, e.g. CQRS, Idempotency, Circuit Breaker, Event Sourcing..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <span className="absolute left-3.5 top-3 text-zinc-500 text-sm">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 text-xs bg-zinc-800 px-2 py-0.5 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Master-Detail Body Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-800">

          {/* Term Selection Sidebar List */}
          <div className="md:col-span-4 overflow-y-auto p-2 space-y-1.5 max-h-[220px] md:max-h-none bg-zinc-950/50">
            <div className="text-[10px] font-bold text-zinc-500 uppercase px-2 py-1 flex justify-between items-center">
              <span>Terms Found ({filteredTerms.length})</span>
            </div>

            {filteredTerms.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-xs">
                No matching architectural terms found.
              </div>
            ) : (
              filteredTerms.map((term) => {
                const isSelected = activeTerm.id === term.id;
                return (
                  <button
                    key={term.id}
                    onClick={() => setSelectedTermId(term.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all border ${
                      isSelected
                        ? 'bg-zinc-900 border-blue-500/80 text-white shadow-md ring-1 ring-blue-500/30'
                        : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {term.category}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white mb-1 truncate">{term.term}</div>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-tight">
                      {term.shortDefinition}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Term Detail View */}
          <div className="md:col-span-8 overflow-y-auto p-4 sm:p-6 space-y-6 bg-zinc-900/60">
            {activeTerm && (
              <div className="space-y-5 animate-in fade-in duration-150">

                {/* Term Header */}
                <div className="border-b border-zinc-800 pb-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-blue-400 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      {activeTerm.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white">{activeTerm.term}</h3>
                  <p className="text-sm text-zinc-300 font-semibold leading-relaxed bg-zinc-950/80 p-3 rounded-xl border border-zinc-800">
                    "{activeTerm.shortDefinition}"
                  </p>
                </div>

                {/* Deep Dive Definition */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Detailed Explanation:
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
                    {activeTerm.fullDefinition}
                  </p>
                </div>

                {/* Real-World Scenario */}
                <div className="bg-amber-950/20 border border-amber-800/50 p-4 rounded-xl space-y-1.5">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <span>💡 Real-World Scenario:</span>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
                    {activeTerm.realWorldScenario}
                  </p>
                </div>

                {/* Key Benefits */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Core Architectural Advantages:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeTerm.keyBenefits.map((benefit, idx) => (
                      <div
                        key={idx}
                        className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 text-xs text-zinc-300 flex items-center gap-2"
                      >
                        <span className="text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Code or Schema Snippet */}
                {activeTerm.codeOrSchemaSnippet && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-300">
                        Code / Schema Pattern: <span className="text-zinc-500 font-mono text-[10px]">({activeTerm.codeOrSchemaSnippet.title})</span>
                      </span>
                      <button
                        onClick={() => handleCopyCode(activeTerm.codeOrSchemaSnippet!.code)}
                        className="text-[11px] px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg transition-colors"
                      >
                        {copiedCode ? '✓ Copied' : '📋 Copy'}
                      </button>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
                      <pre className="p-4 overflow-x-auto text-zinc-300 leading-relaxed">
                        <code>{activeTerm.codeOrSchemaSnippet.code}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* Related Architecture Styles */}
                {activeTerm.relatedArchTypes && activeTerm.relatedArchTypes.length > 0 && (
                  <div className="border-t border-zinc-800 pt-4 space-y-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                      Related Software Architecture Styles:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeTerm.relatedArchTypes.map((archName, idx) => {
                        const matchedEnum = getArchEnumFromRelatedName(archName);
                        return (
                          <button
                            key={idx}
                            disabled={!matchedEnum || !onSelectArchitecture}
                            onClick={() => {
                              if (matchedEnum && onSelectArchitecture) {
                                onClose();
                                onSelectArchitecture(matchedEnum);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                              matchedEnum && onSelectArchitecture
                                ? 'bg-blue-950/40 border-blue-800/80 text-blue-300 hover:bg-blue-900/60 hover:text-white cursor-pointer'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-500 cursor-default'
                            }`}
                          >
                            <span>{archName}</span>
                            {matchedEnum && onSelectArchitecture && <span className="text-[10px]">→</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex justify-between items-center shrink-0">
          <p className="text-xs text-zinc-500 hidden sm:block">
            Search 15+ core software architecture terms and patterns.
          </p>
          <button
            onClick={onClose}
            className="py-2 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
          >
            Close Glossary
          </button>
        </div>

      </div>
    </div>
  );
};
