import React, { useState } from 'react';
import {
  METHODOLOGY_STEPS,
  ENTERPRISE_DOMAIN_PRESETS,
  MethodologyStep,
  EnterpriseDomainPreset
} from '../data/enterpriseMethodologyData';
import { ArchType } from '../types';

interface EnterpriseMethodologyViewProps {
  onClose: () => void;
  onSelectArchitecture?: (archId: ArchType) => void;
  onOpenSolidGuide?: () => void;
}

export const EnterpriseMethodologyView: React.FC<EnterpriseMethodologyViewProps> = ({
  onClose,
  onSelectArchitecture,
  onOpenSolidGuide
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [selectedDomainPresetId, setSelectedDomainPresetId] = useState<string>('supply-chain');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedBlueprint, setCopiedBlueprint] = useState<boolean>(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const currentStep: MethodologyStep = METHODOLOGY_STEPS[activeStepIndex];
  const selectedPreset: EnterpriseDomainPreset =
    ENTERPRISE_DOMAIN_PRESETS.find(p => p.id === selectedDomainPresetId) || ENTERPRISE_DOMAIN_PRESETS[0];

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const toggleChecklist = (key: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const calculateTotalProgress = () => {
    const totalChecklistCount = METHODOLOGY_STEPS.reduce((sum, step) => sum + step.architecturalChecklist.length, 0);
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    return Math.round((checkedCount / totalChecklistCount) * 100);
  };

  const exportFullBlueprintMarkdown = (): string => {
    return `# Enterprise System Architecture & Engineering Methodology Blueprint

> End-to-end engineering methodology bridging strategic business goals with scalable, cloud-native technical architectures.

---

## Preset Domain: ${selectedPreset.name}
- **Industry & Scale:** ${selectedPreset.industry} — ${selectedPreset.scaleMetric}
- **Primary Architectural Constraint:** ${selectedPreset.keyConstraint}
- **Recommended Architecture Stack:** ${selectedPreset.recommendedArchStyle}

---

${METHODOLOGY_STEPS.map((step) => `
## ${step.phaseTitle}

**Objective:** ${step.strategicObjective}  
**Summary:** ${step.shortSummary}

### ⚡ Key Activities
${step.keyActivities.map(a => `- ${a}`).join('\n')}

${step.techLayeringTable ? `
### 🏢 Enterprise Technology Layering
| Layer | Recommended Architecture & Tooling | Core Objectives |
| --- | --- | --- |
${step.techLayeringTable.map(t => `| **${t.layer}** | ${t.tooling} | ${t.objectives} |`).join('\n')}
` : ''}

### 📄 Deliverables & Artifacts
${step.artifactsAndDeliverables.map(d => `- ${d}`).join('\n')}

### 🛠️ Toolchain
${step.techStackAndTools.map(t => `- ${t}`).join('\n')}

### 💻 ${step.codeOrDiagramSnippet.title}
\`\`\`${step.codeOrDiagramSnippet.language}
${step.codeOrDiagramSnippet.code}
\`\`\`

### 📋 Architectural Governance Checklist
${step.architecturalChecklist.map(c => `- [ ] ${c}`).join('\n')}

---
`).join('\n')}

*Exported from ArchFiddle Enterprise Architecture Blueprint*
`;
  };

  const handleDownloadBlueprint = () => {
    const content = exportFullBlueprintMarkdown();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `enterprise-architecture-blueprint.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyBlueprint = async () => {
    try {
      await navigator.clipboard.writeText(exportFullBlueprintMarkdown());
      setCopiedBlueprint(true);
      setTimeout(() => setCopiedBlueprint(false), 2000);
    } catch (err) {
      console.error('Failed to copy blueprint', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-6xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-900/30">
              <span className="font-mono font-black text-lg">🏢 ENTERPRISE</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                Enterprise System Architecture Blueprint
              </h2>
              <p className="text-xs text-zinc-400">
                End-to-End Engineering Methodology: Strategic Business Discovery to Cloud-Native Governance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBlueprint}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow"
              title="Download full enterprise blueprint as Markdown"
            >
              <span>📥 Download .md</span>
            </button>
            <button
              onClick={handleCopyBlueprint}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg transition-all border border-zinc-700"
              title="Copy blueprint to clipboard"
            >
              <span>{copiedBlueprint ? '✓ Copied' : '📋 Copy Spec'}</span>
            </button>
            <div className="hidden lg:flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-zinc-400">Governance Progress:</span>
              <span className="font-mono font-bold text-emerald-400">{calculateTotalProgress()}%</span>
            </div>
            {onOpenSolidGuide && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSolidGuide();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-bold rounded-lg transition-all border border-amber-500/30"
              >
                <span>📐 SOLID Guide</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
              title="Close Methodology Guide"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Domain Blueprint Selector Banner */}
        <div className="bg-zinc-950 border-b border-zinc-800 p-3 sm:p-4 shrink-0 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <span>🎯 Enterprise Domain Preset:</span>
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              {ENTERPRISE_DOMAIN_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedDomainPresetId(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedDomainPresetId === p.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Preset Summary */}
          <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800/80 text-xs grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <span className="text-zinc-500 block font-semibold text-[10px] uppercase">Industry & Scale:</span>
              <span className="text-zinc-200 font-medium">{selectedPreset.industry} — {selectedPreset.scaleMetric}</span>
            </div>
            <div>
              <span className="text-zinc-500 block font-semibold text-[10px] uppercase">Primary Architectural Constraint:</span>
              <span className="text-amber-300 font-medium">{selectedPreset.keyConstraint}</span>
            </div>
            <div>
              <span className="text-zinc-500 block font-semibold text-[10px] uppercase">Recommended Architecture Stack:</span>
              <span className="text-blue-300 font-medium">{selectedPreset.recommendedArchStyle}</span>
            </div>
          </div>
        </div>

        {/* 6-Phase Interactive Stepper Bar */}
        <div className="bg-zinc-950 border-b border-zinc-800 p-2 overflow-x-auto flex items-center justify-between gap-1 shrink-0 scrollbar-thin">
          {METHODOLOGY_STEPS.map((step, idx) => {
            const isCurrent = activeStepIndex === idx;
            const isCompleted = activeStepIndex > idx;

            return (
              <button
                key={step.stepNumber}
                onClick={() => setActiveStepIndex(idx)}
                className={`flex-1 min-w-[130px] py-2 px-2.5 rounded-xl text-left transition-all flex flex-col justify-between border ${
                  isCurrent
                    ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500/50 shadow-md'
                    : isCompleted
                    ? 'bg-zinc-900/90 border-emerald-900/60 text-emerald-300'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isCurrent
                        ? 'bg-blue-500 text-white'
                        : isCompleted
                        ? 'bg-emerald-800/80 text-emerald-200'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    Phase {step.stepNumber}
                  </span>
                  <span className="text-sm">{step.icon}</span>
                </div>
                <span className="text-[11px] font-bold truncate block">
                  {step.phaseTitle.replace(/^Phase \d+:\s*/, '').split('&')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Step Detail View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Phase Header Banner */}
          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden space-y-3">
            <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-zinc-900 border border-zinc-800 rounded-xl">{currentStep.icon}</span>
                <div>
                  <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest block">
                    {currentStep.badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {currentStep.phaseTitle}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={activeStepIndex === 0}
                  onClick={() => setActiveStepIndex(prev => Math.max(0, prev - 1))}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 text-xs font-bold rounded-xl border border-zinc-800 transition-colors"
                >
                  ← Previous
                </button>
                <button
                  disabled={activeStepIndex === METHODOLOGY_STEPS.length - 1}
                  onClick={() => setActiveStepIndex(prev => Math.min(METHODOLOGY_STEPS.length - 1, prev + 1))}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow transition-colors"
                >
                  Next Phase →
                </button>
              </div>
            </div>

            <p className="text-sm text-zinc-200 leading-relaxed font-medium">
              {currentStep.shortSummary}
            </p>

            <div className="bg-indigo-950/20 border border-indigo-900/50 p-3 rounded-xl text-xs text-indigo-200 flex items-start gap-2">
              <span className="font-bold text-indigo-400 shrink-0">🎯 Strategic Business Objective:</span>
              <span>{currentStep.strategicObjective}</span>
            </div>
          </div>

          {/* Technology Layering Table (Phase 2 Special Feature) */}
          {currentStep.techLayeringTable && (
            <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <span>🏢 Enterprise Technology Layering Architecture:</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 uppercase font-mono font-bold">
                      <th className="p-3">Layer</th>
                      <th className="p-3">Recommended Architecture & Tooling</th>
                      <th className="p-3">Core Objectives</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-sans">
                    {currentStep.techLayeringTable.map((row, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="p-3 font-bold text-blue-300 font-mono whitespace-nowrap">{row.layer}</td>
                        <td className="p-3 text-zinc-200 font-medium">{row.tooling}</td>
                        <td className="p-3 text-zinc-400 leading-relaxed">{row.objectives}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2-Column Grid: Activities + Deliverables / Tech Stack */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Key Engineering Activities */}
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <span>⚡ Key Engineering Execution Activities:</span>
              </h4>
              <ul className="space-y-2 text-xs text-zinc-300">
                {currentStep.keyActivities.map((activity, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
                    <span className="font-mono text-blue-400 font-bold shrink-0">{idx + 1}.</span>
                    <span className="leading-relaxed">{activity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Artifacts & Tech Stack */}
            <div className="space-y-4">
              {/* Deliverables */}
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <span>📄 Artifacts & Deliverables:</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentStep.artifactsAndDeliverables.map((artifact, idx) => (
                    <span
                      key={idx}
                      className="bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5"
                    >
                      <span>✓</span> {artifact}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Stack */}
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                  <span>🛠️ Recommended Enterprise Toolchain:</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentStep.techStackAndTools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="bg-purple-950/40 border border-purple-800/60 text-purple-300 text-xs px-2.5 py-1 rounded-lg font-mono font-semibold"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Architectural Code & Spec Window */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                <span>💻 Architecture Spec / Code Blueprint:</span>
                <span className="text-zinc-500 font-mono text-[10px]">({currentStep.codeOrDiagramSnippet.title})</span>
              </span>
              <button
                onClick={() => handleCopyCode(currentStep.codeOrDiagramSnippet.code)}
                className="text-[11px] px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg transition-colors flex items-center gap-1"
              >
                {copiedCode ? '✓ Copied' : '📋 Copy Spec'}
              </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
              <div className="bg-zinc-900/90 px-4 py-2 border-b border-zinc-800/80 flex items-center justify-between text-zinc-400 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                  <span className="ml-2 font-semibold text-zinc-300">{currentStep.codeOrDiagramSnippet.title}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-zinc-500">{currentStep.codeOrDiagramSnippet.language}</span>
              </div>
              <pre className="p-4 overflow-x-auto text-zinc-300 leading-relaxed max-h-[300px] overflow-y-auto">
                <code>{currentStep.codeOrDiagramSnippet.code}</code>
              </pre>
            </div>
          </div>

          {/* Architectural Governance Checklist */}
          <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span>📋 Phase {currentStep.stepNumber} Architectural Governance Checklist:</span>
            </h4>
            <div className="space-y-2">
              {currentStep.architecturalChecklist.map((checkItem, idx) => {
                const itemKey = `step${currentStep.stepNumber}-check${idx}`;
                const isChecked = !!checkedItems[itemKey];

                return (
                  <label
                    key={idx}
                    onClick={() => toggleChecklist(itemKey)}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-3 cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-500/60 text-emerald-200'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // Handled by label onClick
                      className="mt-0.5 rounded bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-0"
                    />
                    <span className="leading-relaxed">{checkItem}</span>
                  </label>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex justify-between items-center shrink-0">
          <div className="text-xs text-zinc-400 hidden sm:block">
            Phase <span className="text-white font-bold">{currentStep.stepNumber}</span> of <span className="text-white font-bold">6</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownloadBlueprint}
              className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-blue-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
            >
              <span>📥 Export Blueprint</span>
            </button>
            {onSelectArchitecture && (
              <button
                onClick={() => {
                  onClose();
                  onSelectArchitecture(ArchType.Microservices);
                }}
                className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-indigo-300 text-xs font-bold rounded-xl transition-colors"
              >
                View Microservices Spec →
              </button>
            )}
            <button
              onClick={onClose}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
