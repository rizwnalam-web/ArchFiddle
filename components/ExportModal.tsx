import React, { useState } from 'react';
import { ArchitectureData } from '../types';

interface ExportModalProps {
  architecture: ArchitectureData;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ architecture, onClose }) => {
  const [copiedType, setCopiedType] = useState<'full' | 'summary' | null>(null);

  const generateFullMarkdown = (arch: ArchitectureData): string => {
    return `# ${arch.title}
**Category:** ${arch.category}  
**Core Idea:** ${arch.coreIdea}  
${arch.tags && arch.tags.length > 0 ? `**Tags:** ${arch.tags.map(t => `#${t}`).join(', ')}` : ''}

---

## 📊 Estimation & Planning
- **Dev Speed:** ${arch.estimation.devSpeed} — ${arch.estimation.devSpeedDesc}
- **Infra Cost:** ${arch.estimation.infraCost} — ${arch.estimation.infraCostDesc}
- **Recommended Team Size:** ${arch.estimation.teamSize}
- **Complexity Score:** ${arch.estimation.complexityScore}/10

---

## 🎯 Primary Use Cases
${arch.useCase}

---

## 🛠️ Technology Stack
${arch.technologyStack.map(t => `- ${t}`).join('\n')}

---

## 📋 Prerequisites
${arch.prerequisites.map(p => `- ${p}`).join('\n')}

---

## ⚡ Pros & Cons

### ✅ Pros
${arch.pros.map(p => `- ${p}`).join('\n')}

### ❌ Cons
${arch.cons.map(c => `- ${c}`).join('\n')}

---

## 📖 Deep-Dive Architecture & Deployment Notes
${arch.description}

---
*Exported from ArchFiddle SaaS Architecture Encyclopedia*
`;
  };

  const generateSummaryText = (arch: ArchitectureData): string => {
    return `🏛️ **${arch.title}** (${arch.category})
• **Core Idea:** ${arch.coreIdea}
• **Dev Speed:** ${arch.estimation.devSpeed} | **Infra Cost:** ${arch.estimation.infraCost} | **Complexity:** ${arch.estimation.complexityScore}/10
• **Tech Stack:** ${arch.technologyStack.join(', ')}
• **Primary Use Case:** ${arch.useCase}
• **Key Pros:** ${arch.pros.join('; ')}
• **Key Cons:** ${arch.cons.join('; ')}`;
  };

  const fullMarkdown = generateFullMarkdown(architecture);
  const summaryText = generateSummaryText(architecture);

  const handleDownload = () => {
    const blob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${architecture.id}-architecture-spec.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyFull = async () => {
    try {
      await navigator.clipboard.writeText(fullMarkdown);
      setCopiedType('full');
      setTimeout(() => setCopiedType(null), 2500);
    } catch (err) {
      console.error('Failed to copy full markdown', err);
    }
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedType('summary');
      setTimeout(() => setCopiedType(null), 2500);
    } catch (err) {
      console.error('Failed to copy summary text', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Export Architecture Specification</h3>
              <p className="text-xs text-zinc-400">Export details for {architecture.title}</p>
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Download Markdown */}
            <button
              onClick={handleDownload}
              className="p-4 bg-gradient-to-br from-indigo-900/40 to-blue-900/40 hover:from-indigo-900/70 hover:to-blue-900/70 border border-indigo-500/40 rounded-xl text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">📥</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded border border-indigo-800">
                    .md File
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">
                  Download Markdown
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Save complete specification as a `.md` file for documentation or repositories.
                </p>
              </div>
              <div className="mt-4 text-xs font-semibold text-indigo-400 group-hover:underline flex items-center gap-1">
                <span>Download file</span>
                <span>→</span>
              </div>
            </button>

            {/* Copy Full Markdown */}
            <button
              onClick={handleCopyFull}
              className="p-4 bg-gradient-to-br from-purple-900/40 to-pink-900/40 hover:from-purple-900/70 hover:to-pink-900/70 border border-purple-500/40 rounded-xl text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">📋</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-purple-950 text-purple-300 rounded border border-purple-800">
                    Clipboard
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">
                  Copy Full Markdown
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Copy formatted Markdown including pros, cons, and tech stack to clipboard.
                </p>
              </div>
              <div className="mt-4 text-xs font-semibold text-purple-400 group-hover:underline flex items-center gap-1">
                <span>{copiedType === 'full' ? '✓ Copied to Clipboard!' : 'Copy to clipboard →'}</span>
              </div>
            </button>

            {/* Copy Short Summary */}
            <button
              onClick={handleCopySummary}
              className="p-4 bg-gradient-to-br from-emerald-900/40 to-teal-900/40 hover:from-emerald-900/70 hover:to-teal-900/70 border border-emerald-500/40 rounded-xl text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">✂️</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">
                    Snippet
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-200 transition-colors">
                  Copy Summary Snippet
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Copy a concise bulleted summary snippet for Slack, teams, or quick notes.
                </p>
              </div>
              <div className="mt-4 text-xs font-semibold text-emerald-400 group-hover:underline flex items-center gap-1">
                <span>{copiedType === 'summary' ? '✓ Copied Snippet!' : 'Copy snippet →'}</span>
              </div>
            </button>
          </div>

          {/* Preview Box */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <span>Markdown Preview</span>
              <span className="text-zinc-500 text-[10px] font-mono">UTF-8 Markdown</span>
            </div>
            <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap max-h-60 custom-scrollbar selection:bg-indigo-500 selection:text-white">
              {fullMarkdown}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
