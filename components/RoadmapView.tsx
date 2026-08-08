import React, { useState } from 'react';
import { ARCHITECTURE_DETAILS } from '../constants';
import { ArchType, ArchitectureData } from '../types';

interface RoadmapViewProps {
  onClose: () => void;
  onSelectArchitecture: (archId: ArchType) => void;
}

export interface RoadmapStage {
  id: number;
  title: string;
  tagline: string;
  badgeColor: string;
  borderColor: string;
  activeColor: string;
  complexityRange: string;
  teamSize: string;
  recommendedRPS: string;
  architectures: ArchType[];
  coreObjectives: string[];
  migrationTriggers: string[];
  antiPatterns: string[];
}

export const ROADMAP_STAGES: RoadmapStage[] = [
  {
    id: 1,
    title: 'Stage 1: Foundational Velocity',
    tagline: 'Simple, unified architectures focused on speed-to-market and low initial overhead.',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    borderColor: 'border-emerald-800/60',
    activeColor: 'from-emerald-600 to-teal-600',
    complexityRange: '2 - 3 / 10',
    teamSize: '1 - 5 Developers',
    recommendedRPS: '< 1,000 RPS',
    architectures: [ArchType.Monolithic, ArchType.WebOriented, ArchType.MobileFirst],
    coreObjectives: [
      'Ship product MVPs rapidly without complex distributed setup.',
      'Single deployment pipeline and in-memory function calls.',
      'Unified relational database with standard ACID transactions.'
    ],
    migrationTriggers: [
      'Build times exceed 15-20 minutes causing CI bottlenecks.',
      'Deployment locks force developers to wait on each other.',
      'Single database CPU hits 80%+ under peak traffic spikes.'
    ],
    antiPatterns: [
      'Premature Microservices: Splitting into 10+ services with a 3-person team.',
      'Spaghetti Codebase: Lacking internal module boundaries inside the monolith.'
    ]
  },
  {
    id: 2,
    title: 'Stage 2: Structured Isolation & Automation',
    tagline: 'Standardized N-tier boundaries and automated infrastructure for growing teams.',
    badgeColor: 'bg-blue-950 text-blue-300 border-blue-800',
    borderColor: 'border-blue-800/60',
    activeColor: 'from-blue-600 to-indigo-600',
    complexityRange: '4 - 6 / 10',
    teamSize: '5 - 20 Developers',
    recommendedRPS: '1,000 - 5,000 RPS',
    architectures: [ArchType.Layered, ArchType.SOA, ArchType.GitOps],
    coreObjectives: [
      'Enforce strict horizontal boundaries (Presentation → Business → Data).',
      'Automate infrastructure declaration using Infrastructure-as-Code (GitOps).',
      'Allow distinct feature squads to own domain modules safely.'
    ],
    migrationTriggers: [
      'Database queries stall due to lock contention on shared tables.',
      'Need to scale specific high-traffic services independently from background workers.',
      'Multi-team code conflicts block daily release cadences.'
    ],
    antiPatterns: [
      'Heavy Middleware Bloat: Over-indexing on enterprise service bus (ESB) logic.',
      'Sinkhole Pattern: Pass-through layers that add latency without value.'
    ]
  },
  {
    id: 3,
    title: 'Stage 3: Elastic Cloud-Native Scaling',
    tagline: 'Decoupled containerized services and independently deployable micro-units.',
    badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    borderColor: 'border-purple-800/60',
    activeColor: 'from-purple-600 to-violet-600',
    complexityRange: '7 - 9 / 10',
    teamSize: '20 - 50+ Developers',
    recommendedRPS: '5,000 - 25,000 RPS',
    architectures: [ArchType.ContainerNative, ArchType.Microservices, ArchType.Serverless],
    coreObjectives: [
      'Enable autonomous deployment per domain service without global restarts.',
      'Isolate persistence databases per service (Database-per-service pattern).',
      'Utilize container orchestration (Kubernetes) or FaaS auto-scaling.'
    ],
    migrationTriggers: [
      'Synchronous REST API call chains introduce high tail latency (P99 spikes).',
      'Cascading failures across HTTP services cause site-wide outages.',
      'Real-time streaming or pub/sub capabilities required for instantaneous updates.'
    ],
    antiPatterns: [
      'Distributed Monolith: Microservices sharing a central database.',
      'Nano-services: Splitting services too granularly (e.g. 1 function per service).'
    ]
  },
  {
    id: 4,
    title: 'Stage 4: Asynchronous Event Streams & Edge',
    tagline: 'Event-driven pub/sub backbones, non-blocking reactive pipelines, and edge compute.',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    borderColor: 'border-amber-800/60',
    activeColor: 'from-amber-600 to-orange-600',
    complexityRange: '8 - 9.5 / 10',
    teamSize: '30 - 100+ Developers',
    recommendedRPS: '25,000 - 100,000+ RPS',
    architectures: [ArchType.EventDriven, ArchType.Reactive, ArchType.EdgeComputing],
    coreObjectives: [
      'Transition from synchronous request-response to event-driven streaming (Kafka/Pulsar).',
      'Non-blocking, reactive event loops for max CPU utilization.',
      'Push computation and response generation to CDN edge nodes.'
    ],
    migrationTriggers: [
      'Eventual consistency is no longer fast enough for in-memory transactional processing.',
      'Central relational databases cannot handle millions of writes/sec even with sharding.'
    ],
    antiPatterns: [
      'Unbounded Message Queues: Lacking backpressure leading to OOM crashes.',
      'Lost Event Lineage: Inadequate distributed event tracing (OpenTelemetry).'
    ]
  },
  {
    id: 5,
    title: 'Stage 5: Extreme Memory Space Computing',
    tagline: 'Distributed in-memory tuple grids for ultra-low latency & linear horizontal scale.',
    badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
    borderColor: 'border-rose-800/60',
    activeColor: 'from-rose-600 to-pink-600',
    complexityRange: '10 / 10',
    teamSize: 'Specialized Platform Team',
    recommendedRPS: '100,000+ RPS',
    architectures: [ArchType.SpaceBased],
    coreObjectives: [
      'Eliminate the database as a runtime bottleneck via distributed memory grids.',
      'Process transactions in-memory with asynchronous database synchronization.',
      'Linear horizontal scaling for extreme high-frequency workloads.'
    ],
    migrationTriggers: [
      'Workloads require sub-millisecond responses at global scale (e.g. trading platforms).'
    ],
    antiPatterns: [
      'Split-Brain Scenarios: Cluster network partitions corrupting in-memory state.',
      'Excessive Memory Footprint: Over-allocating expensive RAM without eviction strategies.'
    ]
  }
];

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  onClose,
  onSelectArchitecture
}) => {
  const [selectedStageId, setSelectedStageId] = useState<number>(1);
  const [viewTab, setViewTab] = useState<'roadmap' | 'advisor' | 'matrix'>('roadmap');

  // Advisor State
  const [advisorTeamSize, setAdvisorTeamSize] = useState<string>('1-5');
  const [advisorRPS, setAdvisorRPS] = useState<string>('<1k');
  const [advisorDeployFreq, setAdvisorDeployFreq] = useState<string>('weekly');
  const [advisorBottleneck, setAdvisorBottleneck] = useState<string>('velocity');

  const selectedStage = ROADMAP_STAGES.find(s => s.id === selectedStageId) || ROADMAP_STAGES[0];

  // Calculate Advisor Recommendation
  const calculateRecommendation = () => {
    let stageScore = 1;
    if (advisorTeamSize === '5-20') stageScore += 1;
    if (advisorTeamSize === '20-50') stageScore += 2;
    if (advisorTeamSize === '50+') stageScore += 3;

    if (advisorRPS === '1k-5k') stageScore += 0.5;
    if (advisorRPS === '5k-25k') stageScore += 1.5;
    if (advisorRPS === '25k+') stageScore += 2.5;

    if (advisorDeployFreq === 'daily') stageScore += 0.5;
    if (advisorDeployFreq === 'continuous') stageScore += 1;

    let targetStageId = 1;
    if (stageScore >= 5.5) targetStageId = 4;
    else if (stageScore >= 4.0) targetStageId = 3;
    else if (stageScore >= 2.5) targetStageId = 2;
    else targetStageId = 1;

    if (advisorBottleneck === 'memory-grid') targetStageId = 5;

    return ROADMAP_STAGES.find(s => s.id === targetStageId) || ROADMAP_STAGES[0];
  };

  const recommendedStage = calculateRecommendation();

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-7xl w-full max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 rounded-xl text-white shadow-lg shadow-purple-900/30 shrink-0">
              <span className="text-xl">🗺️</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Architecture Progression Roadmap
              </h2>
              <p className="text-xs text-zinc-400">
                Visual evolution path from simple monoliths to ultra-scalable distributed event & memory grids
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Tabs */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
              <button
                onClick={() => setViewTab('roadmap')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  viewTab === 'roadmap'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>🗺️ Stage Pipeline</span>
              </button>
              <button
                onClick={() => setViewTab('advisor')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  viewTab === 'advisor'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>🧙 Maturity Advisor</span>
              </button>
              <button
                onClick={() => setViewTab('matrix')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  viewTab === 'matrix'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>📊 Trade-Off Matrix</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all border border-zinc-700 ml-2"
              title="Close Modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6 bg-zinc-950/50">
          
          {/* TAB 1: ROADMAP STAGE PIPELINE */}
          {viewTab === 'roadmap' && (
            <div className="space-y-6">
              
              {/* Pipeline Stepper Visual Bar */}
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                    📍 Evolutionary Maturity Pipeline (Stages 1 ➔ 5)
                  </span>
                  <span className="text-xs text-zinc-500 hidden sm:inline">
                    Click a stage to inspect architectures, trade-offs & migration triggers
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative">
                  {ROADMAP_STAGES.map((stage) => {
                    const isSelected = stage.id === selectedStageId;
                    return (
                      <button
                        key={stage.id}
                        onClick={() => setSelectedStageId(stage.id)}
                        className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-2 ${
                          isSelected
                            ? `bg-gradient-to-b ${stage.activeColor} text-white border-white shadow-xl scale-[1.02] ring-2 ring-white/20`
                            : `bg-zinc-900/90 ${stage.borderColor} text-zinc-300 hover:bg-zinc-800 hover:text-white`
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wide opacity-80">
                              Stage {stage.id}
                            </span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-black/30 text-white' : 'bg-zinc-950 text-zinc-400'
                            }`}>
                              Score {stage.complexityRange}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold leading-tight line-clamp-2">
                            {stage.title.split(': ')[1]}
                          </h4>
                        </div>

                        <div className="text-[10px] font-mono opacity-80 pt-1 border-t border-white/20">
                          👥 {stage.teamSize}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stage Detail Workspace */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-6 shadow-xl animate-in fade-in duration-200">
                
                {/* Active Stage Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${selectedStage.badgeColor}`}>
                        STAGE {selectedStage.id}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">
                        Complexity Score: <strong className="text-indigo-300">{selectedStage.complexityRange}</strong>
                      </span>
                      <span className="text-xs text-zinc-400 font-mono hidden md:inline">
                        • Scale: <strong className="text-emerald-400">{selectedStage.recommendedRPS}</strong>
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white">
                      {selectedStage.title}
                    </h3>
                    <p className="text-xs text-zinc-300">
                      {selectedStage.tagline}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-3 rounded-xl shrink-0">
                    <div className="text-left">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Ideal Team Size</div>
                      <div className="text-xs font-bold text-teal-300 font-mono">{selectedStage.teamSize}</div>
                    </div>
                    <div className="h-6 w-px bg-zinc-800 mx-2" />
                    <div className="text-left">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Traffic Horizon</div>
                      <div className="text-xs font-bold text-amber-300 font-mono">{selectedStage.recommendedRPS}</div>
                    </div>
                  </div>
                </div>

                {/* Core Objectives & Migration Triggers Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Core Objectives */}
                  <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <span>🎯 Primary Stage Objectives:</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {selectedStage.coreObjectives.map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Migration Triggers */}
                  <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <span>⚡ Evolution / Migration Triggers (When to Upgrade):</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {selectedStage.migrationTriggers.map((trig, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">🚨</span>
                          <span>{trig}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Architectures in Stage Cards Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                      🏗️ Architectures In Stage {selectedStage.id} ({selectedStage.architectures.length})
                    </h4>
                    <span className="text-[11px] text-zinc-500">
                      Click "Inspect in ArchFiddle" to explore full code, trade-offs & diagrams
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedStage.architectures.map((archType) => {
                      const arch = ARCHITECTURE_DETAILS[archType];
                      if (!arch) return null;

                      return (
                        <div
                          key={arch.id}
                          className="bg-zinc-900 border border-zinc-800 hover:border-indigo-500/60 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all group shadow-md"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-indigo-300 border border-zinc-800">
                                {arch.category.split(' ')[0]}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-400">
                                Complexity: <strong className="text-amber-400">{arch.estimation.complexityScore}/10</strong>
                              </span>
                            </div>

                            <h5 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                              {arch.title}
                            </h5>

                            <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                              {arch.coreIdea}
                            </p>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                              <span>Dev Speed: <strong className="text-emerald-400">{arch.estimation.devSpeed}</strong></span>
                              <span>Cost: <strong className="text-sky-400">{arch.estimation.infraCost}</strong></span>
                            </div>

                            <button
                              onClick={() => {
                                onSelectArchitecture(arch.id);
                                onClose();
                              }}
                              className="w-full py-1.5 px-3 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs font-bold rounded-lg border border-indigo-500/40 transition-all flex items-center justify-center gap-1.5"
                            >
                              <span>Inspect in ArchFiddle</span>
                              <span>→</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Common Anti-Patterns Box */}
                <div className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-xl space-y-2 text-xs">
                  <h4 className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <span>⚠️ Common Stage {selectedStage.id} Anti-Patterns to Avoid:</span>
                  </h4>
                  <ul className="space-y-1 text-zinc-300">
                    {selectedStage.antiPatterns.map((ap, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">✖</span>
                        <span>{ap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: MATURITY ADVISOR WIZARD */}
          {viewTab === 'advisor' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
              
              {/* Wizard Inputs (Left 2 Columns) */}
              <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-5 shadow-xl">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>🧙 Interactive Architecture Path Advisor</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Answer 4 key engineering questions to pinpoint your ideal architectural maturity stage.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Q1: Team Size */}
                  <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-2">
                    <label className="block text-xs font-bold text-zinc-200 font-mono">
                      1. What is your current engineering team size?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: '1-5', label: '1 - 5 Devs', desc: 'Startup / MVP' },
                        { id: '5-20', label: '5 - 20 Devs', desc: 'Growing Squads' },
                        { id: '20-50', label: '20 - 50 Devs', desc: 'Multi-Product' },
                        { id: '50+', label: '50+ Devs', desc: 'Enterprise Platform' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setAdvisorTeamSize(item.id)}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            advisorTeamSize === item.id
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md font-bold'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                          }`}
                        >
                          <div className="text-xs">{item.label}</div>
                          <div className="text-[10px] text-zinc-400 opacity-80">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q2: Traffic Scale */}
                  <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-2">
                    <label className="block text-xs font-bold text-zinc-200 font-mono">
                      2. What is your peak traffic / request volume?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: '<1k', label: '< 1k RPS', desc: 'Standard SaaS' },
                        { id: '1k-5k', label: '1k - 5k RPS', desc: 'Moderate Scale' },
                        { id: '5k-25k', label: '5k - 25k RPS', desc: 'High Scale' },
                        { id: '25k+', label: '25k+ RPS', desc: 'Extreme Global' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setAdvisorRPS(item.id)}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            advisorRPS === item.id
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md font-bold'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                          }`}
                        >
                          <div className="text-xs">{item.label}</div>
                          <div className="text-[10px] text-zinc-400 opacity-80">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q3: Release Cadence */}
                  <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-2">
                    <label className="block text-xs font-bold text-zinc-200 font-mono">
                      3. What is your target deployment release cadence?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'weekly', label: 'Weekly / Bi-Weekly', desc: 'Standard Batched' },
                        { id: 'daily', label: 'Daily Releases', desc: 'High Velocity' },
                        { id: 'continuous', label: 'Continuous CD', desc: 'Independent Micro-releases' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setAdvisorDeployFreq(item.id)}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            advisorDeployFreq === item.id
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md font-bold'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                          }`}
                        >
                          <div className="text-xs">{item.label}</div>
                          <div className="text-[10px] text-zinc-400 opacity-80">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q4: Primary Pain Point */}
                  <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-2">
                    <label className="block text-xs font-bold text-zinc-200 font-mono">
                      4. What is your primary system bottleneck or pain point?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'velocity', label: 'Time-to-Market Speed', desc: 'Need features fast, low complexity' },
                        { id: 'database', label: 'Database CPU / Locks', desc: 'Central DB bottlenecking under load' },
                        { id: 'team-blocking', label: 'Team Merge Conflicts', desc: 'Developers stepping on toes' },
                        { id: 'memory-grid', label: 'Sub-millisecond Latency', desc: 'Zero DB bottleneck allowed' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setAdvisorBottleneck(item.id)}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            advisorBottleneck === item.id
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md font-bold'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                          }`}
                        >
                          <div className="text-xs">{item.label}</div>
                          <div className="text-[10px] text-zinc-400 opacity-80">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation Results Panel (Right Column) */}
              <div className="bg-gradient-to-b from-indigo-950/80 via-zinc-950 to-zinc-950 border border-indigo-800/80 p-5 rounded-2xl space-y-5 shadow-2xl flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-indigo-600 text-white shadow-md">
                      RECOMMENDED PATH
                    </span>
                    <span className="text-xs text-indigo-300 font-mono">Stage {recommendedStage.id}</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white">
                      {recommendedStage.title}
                    </h3>
                    <p className="text-xs text-indigo-200/90 mt-1 leading-relaxed">
                      {recommendedStage.tagline}
                    </p>
                  </div>

                  <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                      Recommended Architectures:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recommendedStage.architectures.map((archId) => (
                        <span key={archId} className="text-xs bg-zinc-950 border border-zinc-700 px-2.5 py-1 rounded-lg text-zinc-200 font-semibold">
                          {archId}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl space-y-2 text-xs text-zinc-300">
                    <div className="font-bold text-amber-300 uppercase tracking-wider font-mono">
                      Why This Fits Your Profile:
                    </div>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400">⚡</span>
                        <span>Matches your team size of <strong>{advisorTeamSize} devs</strong> without over-engineering.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400">📊</span>
                        <span>Handles your traffic target of <strong>{advisorRPS} RPS</strong> comfortably.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400">🎯</span>
                        <span>Specifically addresses your bottleneck: <strong>{advisorBottleneck}</strong>.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedStageId(recommendedStage.id);
                    setViewTab('roadmap');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <span>Explore Stage {recommendedStage.id} Blueprint</span>
                  <span>→</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: EVOLUTIONARY TRADE-OFF MATRIX */}
          {viewTab === 'matrix' && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>📊 Stage-by-Stage Evolutionary Trade-Off Matrix</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Understand how core engineering metrics shift as your system matures from Stage 1 to Stage 5.
                </p>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-xs text-left text-zinc-300 font-mono">
                  <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Stage</th>
                      <th className="p-3">Dev Speed</th>
                      <th className="p-3">Infra Cost</th>
                      <th className="p-3">Complexity</th>
                      <th className="p-3">Data Consistency</th>
                      <th className="p-3">Max RPS Scale</th>
                      <th className="p-3">Team Ownership</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {ROADMAP_STAGES.map((s) => (
                      <tr key={s.id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="p-3 font-bold text-white">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${s.badgeColor}`}>
                            Stage {s.id}
                          </span>
                          <div className="text-[11px] font-sans text-zinc-300 mt-1">{s.title.split(': ')[1]}</div>
                        </td>
                        <td className="p-3">
                          <span className={s.id <= 2 ? 'text-emerald-400 font-bold' : s.id === 3 ? 'text-amber-400' : 'text-rose-400'}>
                            {s.id === 1 ? '⚡ Ultra Fast' : s.id === 2 ? '🚀 Fast' : s.id === 3 ? '⚖️ Moderate' : '🐢 Slow'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={s.id <= 2 ? 'text-emerald-400' : s.id <= 4 ? 'text-amber-400' : 'text-rose-400 font-bold'}>
                            {s.id === 1 ? '💵 Very Low' : s.id === 2 ? '💵 Low' : s.id === 3 ? '💰 Medium' : '💸 High'}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-amber-400">
                          {s.complexityRange}
                        </td>
                        <td className="p-3 text-zinc-300">
                          {s.id <= 2 ? '🔒 Strong ACID' : s.id === 3 ? '⚖️ Service ACID' : '🔄 Eventual'}
                        </td>
                        <td className="p-3 font-bold text-emerald-400">
                          {s.recommendedRPS}
                        </td>
                        <td className="p-3 text-zinc-400 font-sans text-[11px]">
                          {s.teamSize}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
