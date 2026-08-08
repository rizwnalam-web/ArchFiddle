
import React from 'react';
import { ArchitectureData } from '../types';

interface ComparisonViewProps {
  architectures: ArchitectureData[];
  onClose: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ architectures, onClose }) => {
  if (architectures.length === 0) return null;

  // Define the rows we want to compare
  const rows = [
    { 
      label: 'Category', 
      key: 'category', 
      render: (a: ArchitectureData) => (
        <span className="inline-block px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
          {a.category}
        </span>
      )
    },
    { label: 'Core Idea', key: 'coreIdea', render: (a: ArchitectureData) => <span className="text-zinc-200">{a.coreIdea}</span> },
    { 
      label: 'Dev Speed', 
      key: 'devSpeed', 
      render: (a: ArchitectureData) => (
        <div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
             a.estimation.devSpeed === 'Rapid' ? 'bg-green-900 text-green-300' :
             a.estimation.devSpeed === 'Moderate' ? 'bg-yellow-900 text-yellow-300' :
             'bg-red-900 text-red-300'
           }`}>{a.estimation.devSpeed}</span>
           <p className="text-[10px] text-zinc-500 mt-1">{a.estimation.devSpeedDesc}</p>
        </div>
      ) 
    },
    { label: 'Cost', key: 'cost', render: (a: ArchitectureData) => <span className="text-zinc-300 text-sm font-mono">{a.estimation.infraCost}</span> },
    { label: 'Complexity (1-10)', key: 'complexity', render: (a: ArchitectureData) => (
       <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500" style={{ width: `${a.estimation.complexityScore * 10}%` }}></div>
          </div>
          <span className="text-xs text-zinc-400">{a.estimation.complexityScore}</span>
       </div>
    )},
    { label: 'Team Size', key: 'team', render: (a: ArchitectureData) => <span className="text-zinc-300 text-sm">{a.estimation.teamSize}</span> },
    { label: 'Use Case', key: 'useCase', render: (a: ArchitectureData) => <span className="text-zinc-300 text-sm">{a.useCase}</span> },
    { 
      label: 'Tech Stack', 
      key: 'technologyStack', 
      render: (a: ArchitectureData) => (
        <div className="flex flex-wrap gap-2">
          {a.technologyStack.map(t => (
            <span key={t} className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300 border border-zinc-700">{t}</span>
          ))}
        </div>
      ) 
    },
    { 
      label: 'Pros', 
      key: 'pros', 
      render: (a: ArchitectureData) => (
        <ul className="space-y-2">
          {a.pros.map((p, i) => (
            <li key={i} className="text-sm text-zinc-300 flex gap-2 items-start">
              <span className="text-green-500 shrink-0 mt-0.5">✓</span> 
              <span>{p}</span>
            </li>
          ))}
        </ul>
      ) 
    },
    { 
      label: 'Cons', 
      key: 'cons', 
      render: (a: ArchitectureData) => (
        <ul className="space-y-2">
          {a.cons.map((c, i) => (
            <li key={i} className="text-sm text-zinc-300 flex gap-2 items-start">
              <span className="text-red-500 shrink-0 mt-0.5">✕</span> 
              <span>{c}</span>
            </li>
          ))}
        </ul>
      ) 
    },
    { label: 'Prerequisites', key: 'prerequisites', render: (a: ArchitectureData) => <span className="text-zinc-400 text-xs italic">{a.prerequisites.join(', ')}</span> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
      <div className="p-4 md:p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Architecture Comparison</h2>
            <p className="text-xs text-zinc-400">Comparing {architectures.length} styles side-by-side</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
        >
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        <div className="min-w-max">
           {/* Grid Container */}
           <div 
             className="grid gap-px bg-zinc-800 border border-zinc-800 rounded-lg overflow-hidden shadow-xl" 
             style={{ gridTemplateColumns: `200px repeat(${architectures.length}, minmax(320px, 1fr))` }}
           >
              {/* Header Row */}
              <div className="bg-zinc-950 p-5 font-bold text-zinc-500 uppercase tracking-wider text-xs flex items-center sticky top-0 left-0 z-20 shadow-sm">
                Feature
              </div>
              {architectures.map(arch => (
                  <div key={arch.id} className="bg-zinc-900 p-5 sticky top-0 z-10 shadow-sm border-b border-zinc-800">
                      <h3 className="font-bold text-lg text-blue-400 mb-1">{arch.title}</h3>
                      <div className="text-[10px] text-zinc-500 font-mono uppercase">{arch.id}</div>
                  </div>
              ))}

              {/* Data Rows */}
              {rows.map((row, idx) => (
                <React.Fragment key={row.key}>
                  <div className={`bg-zinc-950/50 p-5 font-medium text-zinc-400 text-sm border-t border-zinc-800/50 flex items-start sticky left-0 z-10`}>
                    {row.label}
                  </div>
                  {architectures.map(arch => (
                    <div key={`${arch.id}-${row.key}`} className="bg-zinc-900/30 p-5 border-t border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      {row.render(arch)}
                    </div>
                  ))}
                </React.Fragment>
              ))}
           </div>
        </div>
      </div>
      
      <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-end">
        <button 
          onClick={onClose}
          className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Close Comparison
        </button>
      </div>
    </div>
  );
};
