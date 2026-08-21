import React, { useState } from 'react';
import { ArchitectureData, DataFlowStep, FailureMode, ScaleBottleneck, RealWorldCaseStudy, ArchitectureDecisionRecord, CiCdSpec, CiCdPipelineTemplate } from '../types';
import {
  Activity,
  Shield,
  Layers,
  Zap,
  AlertTriangle,
  FileText,
  Building2,
  Lock,
  ArrowRight,
  Database,
  Server,
  Key,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Cpu,
  RefreshCw,
  GitBranch,
  Terminal,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Info,
  Headphones,
  Volume2,
  Workflow,
  Copy,
  Check,
  Download,
  Search,
  Sliders,
  Cloud,
  Box,
  Radio,
  Share2,
  Sparkles
} from 'lucide-react';
import { useAudioNarration } from '../src/context/AudioNarrationContext';
import { NarrationMode } from '../src/types/tts';
import { DEFAULT_DOTNET_REACT_CICD_SPEC } from '../data/architectureCiCdData';

interface ArchitectureDeepDiveSectionProps {
  architecture: ArchitectureData;
  onOpenProjectExplorer?: () => void;
  onOpenPlayground?: () => void;
}

type DeepDiveTab = 'dataflow' | 'concurrency' | 'resilience' | 'security' | 'scalability' | 'casestudies' | 'adr' | 'cicd';

export const ArchitectureDeepDiveSection: React.FC<ArchitectureDeepDiveSectionProps> = ({
  architecture,
  onOpenProjectExplorer,
  onOpenPlayground
}) => {
  const [activeTab, setActiveTab] = useState<DeepDiveTab>('dataflow');
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [expandedFailureIndex, setExpandedFailureIndex] = useState<number | null>(0);
  const [selectedPipelineIndex, setSelectedPipelineIndex] = useState<number>(0);
  const [copiedYaml, setCopiedYaml] = useState<boolean>(false);
  const [yamlSearchTerm, setYamlSearchTerm] = useState<string>('');
  const [wrapYaml, setWrapYaml] = useState<boolean>(true);

  const { playArchitecture, isSupported: isTtsSupported } = useAudioNarration();

  const handleListenCurrentTab = () => {
    if (!spec) return;
    playArchitecture(architecture, activeTab as NarrationMode);
  };

  const spec = architecture.deepDiveSpec;

  if (!spec) {
    return (
      <div className="p-8 text-center text-zinc-400 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <Info className="w-8 h-8 mx-auto text-blue-400 mb-2" />
        <p>Detailed architecture specification is loading...</p>
      </div>
    );
  }

  const cicdSpec: CiCdSpec = spec.ciCdSpec || DEFAULT_DOTNET_REACT_CICD_SPEC;
  const currentPipeline: CiCdPipelineTemplate = cicdSpec.pipelines[selectedPipelineIndex] || cicdSpec.pipelines[0];

  const handleCopyYaml = () => {
    if (!currentPipeline) return;
    navigator.clipboard.writeText(currentPipeline.yamlConfig);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2200);
  };

  const handleDownloadYaml = () => {
    if (!currentPipeline) return;
    const blob = new Blob([currentPipeline.yamlConfig], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentPipeline.fileName || 'pipeline.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs: { id: DeepDiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dataflow', label: '1. Request & Data Flow', icon: <Activity className="w-4 h-4" />, badge: `${spec.dataFlowSteps.length} Steps` },
    { id: 'concurrency', label: '2. Concurrency & State', icon: <Database className="w-4 h-4" /> },
    { id: 'resilience', label: '3. Failure & Resilience', icon: <Shield className="w-4 h-4" />, badge: `${spec.failureModes.length} Scenarios` },
    { id: 'security', label: '4. Zero-Trust Security', icon: <Lock className="w-4 h-4" /> },
    { id: 'scalability', label: '5. Scale Bottlenecks', icon: <Zap className="w-4 h-4" /> },
    { id: 'casestudies', label: '6. Enterprise Case Studies', icon: <Building2 className="w-4 h-4" />, badge: `${spec.caseStudies.length} Real` },
    { id: 'adr', label: '7. Production ADR', icon: <FileText className="w-4 h-4" />, badge: spec.adrSpecimen.status },
    { id: 'cicd', label: '8. Deployment CI/CD', icon: <Workflow className="w-4 h-4" />, badge: 'GitHub & AWS' }
  ];

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 px-6 py-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              In-Depth Production Architecture
            </span>
            <span className="text-xs text-zinc-500 font-mono">SPEC-v2.5</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <span>{architecture.title}</span>
            <span className="text-zinc-500 font-normal text-sm">— Technical Deep-Dive & Reality</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPlayground && (
            <button
              onClick={onOpenPlayground}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all hover:shadow-indigo-500/20"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-200" />
              <span>Simulate in Playground</span>
            </button>
          )}

          {onOpenProjectExplorer && (
            <button
              onClick={onOpenProjectExplorer}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all hover:shadow-blue-500/20"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Multi-Language Explorer</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-zinc-900/70 px-4 py-2 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-blue-500/30 text-blue-200' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}

        {isTtsSupported && (
          <button
            onClick={handleListenCurrentTab}
            className="ml-auto px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-700/60 transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
            title="Listen to this section via voice narration"
          >
            <Volume2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Listen to Tab</span>
          </button>
        )}
      </div>

      {/* Tab Content Area */}
      <div className="p-6 bg-zinc-950/60 min-h-[460px]">
        {/* ==========================================
            TAB 1: REQUEST & DATA FLOW
            ========================================== */}
        {activeTab === 'dataflow' && (
          <div className="space-y-6">
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                End-to-End Request & Event Lifecycle
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Step-by-step trace of how transactions traverse network boundaries, middleware pipelines, domain entities, and persistence layers.
              </p>
            </div>

            {/* Step Timeline Indicator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
              {spec.dataFlowSteps.map((step, idx) => {
                const isSelected = selectedStepIndex === idx;
                return (
                  <button
                    key={step.step}
                    onClick={() => setSelectedStepIndex(idx)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500/50 shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-mono font-bold ${isSelected ? 'text-blue-400' : 'text-zinc-500'}`}>
                        Step 0{step.step}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">{step.latency}</span>
                    </div>
                    <p className={`text-xs font-semibold line-clamp-1 ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                      {step.phase}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Selected Step Detail Card */}
            {spec.dataFlowSteps[selectedStepIndex] && (
              <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <div>
                    <span className="text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
                      Phase: {spec.dataFlowSteps[selectedStepIndex].phase}
                    </span>
                    <h4 className="text-base font-bold text-white mt-0.5">
                      {spec.dataFlowSteps[selectedStepIndex].title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-700">
                      Protocol: {spec.dataFlowSteps[selectedStepIndex].protocol}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-blue-950/80 text-blue-300 text-xs font-mono border border-blue-800/60">
                      Latency: ~{spec.dataFlowSteps[selectedStepIndex].latency}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {spec.dataFlowSteps[selectedStepIndex].description}
                </p>

                <div>
                  <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Involved Infrastructure & Software Components:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {spec.dataFlowSteps[selectedStepIndex].components.map((comp) => (
                      <span
                        key={comp}
                        className="px-2.5 py-1 rounded-md text-xs bg-zinc-800/90 text-zinc-200 border border-zinc-700 font-mono flex items-center gap-1.5"
                      >
                        <Server className="w-3 h-3 text-blue-400" />
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB 2: CONCURRENCY & STATE MANAGEMENT
            ========================================== */}
        {activeTab === 'concurrency' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                  <Database className="w-4 h-4" />
                  Transaction Scope
                </div>
                <h4 className="text-sm font-bold text-white">Transactional Boundary & Atomicity</h4>
                <p className="text-xs text-zinc-300 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded-lg border border-zinc-800/60">
                  {spec.concurrencyAndState.transactionScope}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  <Shield className="w-4 h-4" />
                  Database Isolation Level
                </div>
                <h4 className="text-sm font-bold text-white">Concurrency & Multi-Version Concurrency (MVCC)</h4>
                <p className="text-xs text-zinc-300 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded-lg border border-zinc-800/60">
                  {spec.concurrencyAndState.isolationLevel}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  <Lock className="w-4 h-4" />
                  Locking Strategy
                </div>
                <h4 className="text-sm font-bold text-white">Contention Avoidance & Distributed Locks</h4>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/80 p-3 rounded-lg border border-zinc-800/60">
                  {spec.concurrencyAndState.lockingStrategy}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  State Topology
                </div>
                <h4 className="text-sm font-bold text-white">Cache & Source-of-Truth Hierarchy</h4>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/80 p-3 rounded-lg border border-zinc-800/60">
                  {spec.concurrencyAndState.stateDescription}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
                Key Distributed Data Patterns Employed:
              </h4>
              <div className="flex flex-wrap gap-2">
                {spec.concurrencyAndState.distributedPatterns.map((pattern) => (
                  <span
                    key={pattern}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: FAILURE MODES & RESILIENCE
            ========================================== */}
        {activeTab === 'resilience' && (
          <div className="space-y-4">
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Production Failure Scenarios & Circuit Breakers
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Real-world disaster modes, root cause analysis, detection signals, and automated architectural mitigation patterns.
              </p>
            </div>

            <div className="space-y-3">
              {spec.failureModes.map((failure, idx) => {
                const isExpanded = expandedFailureIndex === idx;
                const isCritical = failure.impactLevel === 'Critical';
                const isHigh = failure.impactLevel === 'High';

                return (
                  <div
                    key={failure.failureScenario}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedFailureIndex(isExpanded ? null : idx)}
                      className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-zinc-900 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase font-mono ${
                            isCritical
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                              : isHigh
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                              : 'bg-blue-950/80 text-blue-300 border border-blue-800'
                          }`}
                        >
                          {failure.impactLevel}
                        </span>
                        <span className="text-sm font-bold text-white">{failure.failureScenario}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
                          Pattern: {failure.resiliencePattern.split('+')[0]}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-zinc-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-zinc-800/80 space-y-4 bg-zinc-950/40">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                              Root Cause:
                            </span>
                            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{failure.rootCause}</p>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                              Detection Signal / APM Metric:
                            </span>
                            <p className="text-xs text-zinc-300 mt-1 font-mono bg-zinc-900 p-2 rounded border border-zinc-800">
                              {failure.detectionSignal}
                            </p>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
                          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                            Automated Mitigation & Engineering Fix:
                          </span>
                          <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
                            {failure.mitigationMechanism}
                          </p>
                          <div className="mt-2 text-[11px] text-zinc-400 font-mono">
                            Applied Resilience Pattern: <span className="text-zinc-200 font-bold">{failure.resiliencePattern}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: ZERO-TRUST SECURITY & GOVERNANCE
            ========================================== */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase">
                  <Key className="w-4 h-4" />
                  Authentication (AuthN)
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{spec.securityModel.authentication}</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase">
                  <Shield className="w-4 h-4" />
                  Authorization (AuthZ) & RBAC
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{spec.securityModel.authorization}</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase">
                  <Lock className="w-4 h-4" />
                  Service-to-Service Cryptography
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-mono bg-zinc-950 p-2.5 rounded border border-zinc-800/80">
                  {spec.securityModel.serviceToServiceAuth}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase">
                  <Key className="w-4 h-4" />
                  Secret Management & Rotation
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{spec.securityModel.secretManagement}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase">
                <Shield className="w-4 h-4" />
                Data Protection & Encryption
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{spec.securityModel.dataProtection}</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Target Compliance Frameworks Supported:
              </h4>
              <div className="flex flex-wrap gap-2">
                {spec.securityModel.complianceCertifications.map((cert) => (
                  <span
                    key={cert}
                    className="px-3 py-1 rounded-md text-xs font-bold bg-blue-950/60 text-blue-300 border border-blue-800/60 font-mono"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 5: SCALE BOTTLENECKS & CEILINGS
            ========================================== */}
        {activeTab === 'scalability' && (
          <div className="space-y-4">
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Scale Ceilings & Performance Mitigations
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Identifies the hard architectural bottlenecks when moving from 1,000 to 1,000,000 requests per minute and how to overcome them.
              </p>
            </div>

            <div className="space-y-3">
              {spec.scalabilityBottlenecks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      {item.bottleneck}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-zinc-800 text-amber-300 border border-zinc-700">
                      Threshold: {item.threshold}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800">
                      <span className="text-rose-400 font-semibold uppercase text-[10px] tracking-wider block mb-1">
                        Observable Symptom:
                      </span>
                      <p className="text-zinc-300">{item.symptom}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/50">
                      <span className="text-emerald-400 font-semibold uppercase text-[10px] tracking-wider block mb-1">
                        Engineering Solution:
                      </span>
                      <p className="text-emerald-200">{item.engineeringSolution}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 6: ENTERPRISE CASE STUDIES
            ========================================== */}
        {activeTab === 'casestudies' && (
          <div className="space-y-4">
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                Industry Case Studies & Real-World Evolution
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Documented engineering evolutions from high-scale technology companies that pioneered this architecture.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {spec.caseStudies.map((study, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
                      <h4 className="text-sm font-bold text-white">{study.company}</h4>
                      <span className="text-[11px] font-mono text-blue-400 font-semibold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/50">
                        {study.scaleMetric}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      <div>
                        <span className="font-semibold text-rose-400">Problem at Scale:</span>
                        <p className="text-zinc-300 mt-0.5">{study.problemEncountered}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-emerald-400">Architectural Solution:</span>
                        <p className="text-zinc-300 mt-0.5">{study.architecturalSolution}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 italic">
                    <span className="text-blue-400 font-bold not-italic">Key Takeaway: </span>
                    "{study.keyTakeaway}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 7: PRODUCTION ARCHITECTURE DECISION RECORD (ADR)
            ========================================== */}
        {activeTab === 'adr' && (
          <div className="space-y-4">
            <div className="p-6 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700">
                      Status: {spec.adrSpecimen.status}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">ADR Template</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{spec.adrSpecimen.title}</h3>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  1. Context & Business Drivers:
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  {spec.adrSpecimen.context}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  2. Architectural Decision:
                </h4>
                <p className="text-xs text-blue-200 leading-relaxed bg-blue-950/30 p-3 rounded-lg border border-blue-800/40">
                  {spec.adrSpecimen.decision}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
                  <h5 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Positive Consequences:
                  </h5>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {spec.adrSpecimen.positiveConsequences.map((pos, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{pos}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-800/40">
                  <h5 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" />
                    Negative Consequences & Trade-offs:
                  </h5>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {spec.adrSpecimen.negativeConsequences.map((neg, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{neg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
                <span className="font-semibold text-zinc-400 uppercase text-[10px] tracking-wider block mb-1">
                  Compliance & Governance Guardrails:
                </span>
                <p className="text-zinc-300">{spec.adrSpecimen.complianceNotes}</p>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 8: DEPLOYMENT CI/CD
            ========================================== */}
        {activeTab === 'cicd' && (
          <div className="space-y-6">
            {/* Overview & Strategic Metrics Banner */}
            <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-zinc-900/60 p-5 rounded-xl border border-blue-800/50 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
                    <Workflow className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Deployment CI/CD & DevOps Automation</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                        {cicdSpec.deploymentModel} Deployment
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Production-grade continuous integration, vulnerability scanning, and automated deployment pipelines for .NET 10 + React 19 + AWS + Snowflake.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-zinc-900/90 text-zinc-300 text-xs font-mono border border-zinc-700">
                    Target: Amazon ECS / Cloud Run
                  </span>
                  <button
                    onClick={handleDownloadYaml}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download {currentPipeline.fileName}</span>
                  </button>
                </div>
              </div>

              {/* Strategy & Rollback summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80">
                  <span className="text-blue-400 font-semibold uppercase text-[10px] tracking-wider block mb-1">
                    Deployment Strategy & Artifact Registry:
                  </span>
                  <p className="text-zinc-300">{cicdSpec.strategy}</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80">
                  <span className="text-rose-400 font-semibold uppercase text-[10px] tracking-wider block mb-1">
                    Automated Rollback Trigger:
                  </span>
                  <p className="text-zinc-300">{cicdSpec.rollbackMechanism}</p>
                </div>
              </div>
            </div>

            {/* Provider Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mr-2 flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5 text-blue-400" />
                Pipeline Provider:
              </span>
              {cicdSpec.pipelines.map((pipeline, idx) => {
                const isSelected = selectedPipelineIndex === idx;
                return (
                  <button
                    key={pipeline.id}
                    onClick={() => setSelectedPipelineIndex(idx)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/50'
                        : 'bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                    }`}
                  >
                    <span>
                      {pipeline.provider === 'GitHub Actions' && '🐙'}
                      {pipeline.provider === 'AWS CodePipeline' && '☁️'}
                      {pipeline.provider === 'GitLab CI' && '🦊'}
                      {pipeline.provider === 'Azure DevOps' && '🔷'}
                    </span>
                    <span>{pipeline.provider}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-blue-800 text-blue-100' : 'bg-zinc-800 text-zinc-400'}`}>
                      {pipeline.fileName}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Current Pipeline Header Specs */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                <div>
                  <span className="text-[11px] font-mono text-blue-400 font-semibold uppercase tracking-wider">
                    Pipeline: {currentPipeline.fileName}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{currentPipeline.pipelineName}</h4>
                </div>
                <span className="px-2.5 py-1 rounded bg-zinc-800/90 text-amber-300 text-xs font-mono border border-zinc-700">
                  Trigger: {currentPipeline.triggerEvent}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider block mb-0.5">
                    Target Tech Stack:
                  </span>
                  <p className="text-zinc-200 font-mono text-[11px]">{currentPipeline.targetStack}</p>
                </div>
                <div>
                  <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider block mb-0.5">
                    Deployment Ingress & Infrastructure Target:
                  </span>
                  <p className="text-zinc-200 font-mono text-[11px]">{currentPipeline.deploymentTarget}</p>
                </div>
              </div>
            </div>

            {/* Visual Pipeline Stage Flow Timeline */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Automated Pipeline Execution Stages ({currentPipeline.keyStages.length} Phases)
                </h4>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Total Est. Time: ~{currentPipeline.keyStages.reduce((acc, s) => acc + parseInt(s.durationEst.split('m')[0] || '2'), 0)} mins
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {currentPipeline.keyStages.map((stage, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between space-y-2 hover:border-blue-500/40 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-500/50 text-blue-400 text-[10px] font-bold font-mono flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                          ⏱ {stage.durationEst}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white line-clamp-1">{stage.name}</h5>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed line-clamp-3">
                        {stage.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-800 flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Automated Gate</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Production YAML Configuration Viewer */}
            <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl">
              {/* YAML Viewer Action Bar */}
              <div className="bg-zinc-900/90 px-4 py-2.5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-950 text-blue-300 border border-blue-800/60 flex items-center gap-1.5 font-bold">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    {currentPipeline.fileName}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    YAML • {currentPipeline.yamlConfig.split('\n').length} lines
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Search Filter */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search YAML (e.g. dotnet, ecr)..."
                      value={yamlSearchTerm}
                      onChange={(e) => setYamlSearchTerm(e.target.value)}
                      className="bg-zinc-950 text-zinc-200 placeholder-zinc-500 text-xs pl-8 pr-2.5 py-1 rounded-lg border border-zinc-800 focus:outline-none focus:border-blue-500 w-44 md:w-56 font-mono"
                    />
                  </div>

                  <button
                    onClick={() => setWrapYaml(!wrapYaml)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-all"
                    title={wrapYaml ? 'Disable Word Wrap' : 'Enable Word Wrap'}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleCopyYaml}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                      copiedYaml
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                    }`}
                  >
                    {copiedYaml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedYaml ? 'Copied YAML!' : 'Copy YAML'}</span>
                  </button>

                  <button
                    onClick={handleDownloadYaml}
                    className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/20"
                    title="Download YAML File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Code Container */}
              <div className="p-4 max-h-[500px] overflow-y-auto font-mono text-xs text-zinc-300 bg-zinc-950 scrollbar-thin scrollbar-thumb-zinc-700">
                <pre className={`${wrapYaml ? 'whitespace-pre-wrap' : 'whitespace-pre'} leading-relaxed`}>
                  {currentPipeline.yamlConfig.split('\n').map((line, lineIdx) => {
                    const isHighlighted = yamlSearchTerm && line.toLowerCase().includes(yamlSearchTerm.toLowerCase());
                    const isComment = line.trim().startsWith('#');
                    const isKey = /^[a-zA-Z0-9_-]+:/.test(line.trim());
                    const isJobOrStage = line.includes('name:') || line.includes('job:') || line.includes('stage:');

                    return (
                      <div
                        key={lineIdx}
                        className={`table-row ${isHighlighted ? 'bg-amber-950/50 text-amber-200 font-bold' : ''}`}
                      >
                        <span className="table-cell pr-4 text-right select-none text-zinc-600 text-[10px] w-8">
                          {lineIdx + 1}
                        </span>
                        <span
                          className={`table-cell ${
                            isComment
                              ? 'text-zinc-500 italic'
                              : isJobOrStage
                              ? 'text-blue-300 font-bold'
                              : isKey
                              ? 'text-purple-300 font-semibold'
                              : 'text-zinc-300'
                          }`}
                        >
                          {line}
                        </span>
                      </div>
                    );
                  })}
                </pre>
              </div>
            </div>

            {/* Security & Quality Gates + Required Secrets Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Security & Quality Guardrails */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  DevOps Security & Quality Gates
                </h4>
                <ul className="space-y-2 text-xs text-zinc-300">
                  {currentPipeline.securityAndQualityGates.map((gate, gIdx) => (
                    <li key={gIdx} className="flex items-start gap-2 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                      <span className="text-emerald-400 font-bold shrink-0">✔</span>
                      <span className="leading-relaxed">{gate}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Secrets & Parameter Store Matrix */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  Required Secrets & Environment Parameters
                </h4>
                <div className="space-y-2">
                  {currentPipeline.environmentSecrets.map((secret, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-2"
                    >
                      <div>
                        <code className="text-[11px] font-mono font-bold text-amber-300">{secret.name}</code>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{secret.purpose}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(secret.name);
                        }}
                        className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs shrink-0"
                        title="Copy Secret Name"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Zero-Downtime Migration & Deployment Reality Matrix */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h5 className="font-bold text-white">Production Deployment Best Practices & Architecture Realities</h5>
              </div>
              <p className="text-zinc-300 leading-relaxed">
                For microservices utilizing .NET 10 Web APIs and Snowflake data warehouses, database migrations must adhere to the <strong>Expand/Contract (Parallel Run)</strong> pattern. EF Core migration bundles execute in the CI/CD pipeline against Snowflake schemas before new container tasks receive ingress traffic. Traffic shifting occurs gradually (e.g. 10% linear increments) across the AWS Application Load Balancer target groups, with automated rollback if synthetic canary probes or CloudWatch 5xx alarm rates spike above the 0.5% threshold.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
