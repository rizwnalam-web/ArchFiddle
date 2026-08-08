import React, { useState } from 'react';
import { ArchCategory, ArchitectureData, ArchType } from '../types';
import { ARCHITECTURE_DETAILS } from '../constants';

interface CategoryMatrixModalProps {
  onClose: () => void;
  onSelectArchitecture: (arch: ArchType) => void;
}

interface CategoryInfo {
  category: ArchCategory;
  icon: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  headline: string;
  summary: string;
  targetOrgs: string;
  keyDrivers: string[];
  sampleTech: string[];
}

const CATEGORY_META: Record<ArchCategory, CategoryInfo> = {
  [ArchCategory.Enterprise]: {
    category: ArchCategory.Enterprise,
    icon: '🏢',
    color: 'amber',
    badgeBg: 'bg-amber-950/40',
    badgeBorder: 'border-amber-800/50',
    badgeText: 'text-amber-400',
    headline: 'Enterprise & Legacy Systems',
    summary: 'Centralized, unified, or tiered operational stacks prioritizing data governance, ACID compliance, and vertical control.',
    targetOrgs: 'Banks, Fortune 500s, Government, On-premise Corporate IT',
    keyDrivers: ['Regulatory compliance', 'Transactional consistency', 'Domain stability', 'Clear audit trails'],
    sampleTech: ['Spring Boot', 'Oracle DB', 'Java EE', 'MuleSoft ESB', '.NET Enterprise']
  },
  [ArchCategory.CloudNative]: {
    category: ArchCategory.CloudNative,
    icon: '☁️',
    color: 'blue',
    badgeBg: 'bg-blue-950/40',
    badgeBorder: 'border-blue-800/50',
    badgeText: 'text-blue-400',
    headline: 'Cloud-Native & Distributed Systems',
    summary: 'Decomposed micro-units or ephemeral functions running on hyper-scalable cloud infrastructure.',
    targetOrgs: 'High-growth SaaS, Tech Scale-ups, Global Platforms',
    keyDrivers: ['Independent team velocity', 'Elastic auto-scaling', 'Fault isolation', 'Polyglot technology choices'],
    sampleTech: ['Kubernetes', 'AWS Lambda', 'gRPC', 'DynamoDB', 'Istio']
  },
  [ArchCategory.DevOpsInfra]: {
    category: ArchCategory.DevOpsInfra,
    icon: '♾️',
    color: 'emerald',
    badgeBg: 'bg-emerald-950/40',
    badgeBorder: 'border-emerald-800/50',
    badgeText: 'text-emerald-400',
    headline: 'DevOps & Platform Engineering',
    summary: 'Declarative, version-controlled infrastructure with continuous reconciliation and container orchestration.',
    targetOrgs: 'Platform Engineering teams, Cloud Platforms, FinTech Security Operations',
    keyDrivers: ['Zero configuration drift', 'Automated pull-request deployments', 'Strict cluster security', 'Self-healing infrastructure'],
    sampleTech: ['ArgoCD', 'Terraform', 'Helm', 'Docker', 'Flux CD', 'Kubernetes']
  },
  [ArchCategory.RealtimeScale]: {
    category: ArchCategory.RealtimeScale,
    icon: '⚡',
    color: 'purple',
    badgeBg: 'bg-purple-950/40',
    badgeBorder: 'border-purple-800/50',
    badgeText: 'text-purple-400',
    headline: 'Real-time & High Scale',
    summary: 'Asynchronous event streams, non-blocking back-pressure, and in-memory tuple grids delivering sub-millisecond throughput.',
    targetOrgs: 'Stock Exchanges, Gaming Backends, Telemetry Networks, AdTech',
    keyDrivers: ['Sub-millisecond latency', 'Massive event ingestion', 'Zero database I/O bottlenecks', 'Elastic stream buffering'],
    sampleTech: ['Apache Kafka', 'Hazelcast', 'RxJava', 'Akka', 'Redis Cluster', 'Vert.x']
  },
  [ArchCategory.WebMobileEdge]: {
    category: ArchCategory.WebMobileEdge,
    icon: '🌐',
    color: 'sky',
    badgeBg: 'bg-sky-950/40',
    badgeBorder: 'border-sky-800/50',
    badgeText: 'text-sky-400',
    headline: 'Web, Mobile & Edge Client Stacks',
    summary: 'Global CDN worker networks, offline-first syncing clients, and headless frontend architectures.',
    targetOrgs: 'Consumer Apps, E-commerce, Field Logistics, Global Media Networks',
    keyDrivers: ['Offline usability', 'Speed-of-light edge execution', 'Rich interactive UI', 'Zero API latency'],
    sampleTech: ['Cloudflare Workers', 'React Native', 'SQLite / Realm', 'GraphQL', 'Next.js']
  }
};

export const CategoryMatrixModal: React.FC<CategoryMatrixModalProps> = ({ onClose, onSelectArchitecture }) => {
  const [selectedCategory, setSelectedCategory] = useState<ArchCategory | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'matrix' | 'roadmap'>('matrix');

  const allArchitectures = Object.values(ARCHITECTURE_DETAILS);

  const filteredArchitectures = selectedCategory === 'ALL'
    ? allArchitectures
    : allArchitectures.filter(a => a.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-zinc-800 flex flex-wrap justify-between items-center bg-zinc-900 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Architecture Categorization Matrix</h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                5 Categories &bull; 13 Patterns
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Enterprise, Cloud-Native, DevOps Infrastructure, Real-time Scale, and Edge Architectures
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'matrix'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            Category Explorer
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'roadmap'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            Evolution Roadmap
          </button>

          <button
            onClick={onClose}
            className="ml-2 p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Modal Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar">
        {activeTab === 'matrix' ? (
          <div className="space-y-8 max-w-7xl mx-auto">
            {/* Category Filter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedCategory === 'ALL'
                    ? 'bg-zinc-800 border-indigo-500 ring-1 ring-indigo-500 shadow-md'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="text-xl mb-1">🌟</div>
                <div className="text-xs font-bold text-white">All Categories</div>
                <div className="text-[10px] text-zinc-400 mt-1">{allArchitectures.length} Total Architectures</div>
              </button>

              {Object.entries(CATEGORY_META).map(([catKey, meta]) => {
                const isSelected = selectedCategory === catKey;
                const count = allArchitectures.filter(a => a.category === catKey).length;
                return (
                  <button
                    key={catKey}
                    onClick={() => setSelectedCategory(catKey as ArchCategory)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? `${meta.badgeBg} ${meta.badgeBorder} ring-1 ring-indigo-500 shadow-md`
                        : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="text-xl mb-1">{meta.icon}</div>
                    <div className={`text-xs font-bold ${meta.badgeText}`}>{catKey}</div>
                    <div className="text-[10px] text-zinc-400 mt-1">{count} Patterns</div>
                  </button>
                );
              })}
            </div>

            {/* Category Overview Panel if specific category selected */}
            {selectedCategory !== 'ALL' && (
              <div className={`p-5 rounded-2xl border ${CATEGORY_META[selectedCategory].badgeBg} ${CATEGORY_META[selectedCategory].badgeBorder} animate-in fade-in duration-300`}>
                <div className="flex items-start gap-4">
                  <span className="text-3xl p-2 bg-zinc-950/60 rounded-xl border border-zinc-800 shrink-0">
                    {CATEGORY_META[selectedCategory].icon}
                  </span>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-lg font-bold ${CATEGORY_META[selectedCategory].badgeText}`}>
                        {CATEGORY_META[selectedCategory].headline}
                      </h3>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {CATEGORY_META[selectedCategory].summary}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                      <div>
                        <span className="font-semibold text-zinc-400 block mb-1">Target Environments & Organizations:</span>
                        <p className="text-zinc-200">{CATEGORY_META[selectedCategory].targetOrgs}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-zinc-400 block mb-1">Key Architectural Tech Stack:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {CATEGORY_META[selectedCategory].sampleTech.map(t => (
                            <span key={t} className="px-2 py-0.5 rounded bg-zinc-950/80 border border-zinc-800 text-zinc-300 font-mono text-[11px]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Architectural Cards Grid */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <span>Architectures in Category</span>
                  <span className="px-2 py-0.5 bg-zinc-800 rounded-full text-xs text-zinc-400">
                    {filteredArchitectures.length}
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredArchitectures.map(arch => {
                  const meta = CATEGORY_META[arch.category];
                  return (
                    <div
                      key={arch.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all flex flex-col justify-between group hover:shadow-xl hover:shadow-indigo-950/20"
                    >
                      <div>
                        {/* Card Top Category Pill */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}>
                            <span>{meta.icon}</span>
                            <span>{arch.category}</span>
                          </span>

                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                            Score: {arch.estimation.complexityScore}/10
                          </span>
                        </div>

                        {/* Title & Core Idea */}
                        <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors mb-1">
                          {arch.title}
                        </h4>
                        <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
                          {arch.coreIdea}
                        </p>

                        {/* Tags */}
                        {arch.tags && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {arch.tags.map(tag => (
                              <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-zinc-950 text-zinc-400 rounded border border-zinc-800/80">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Key Metrics */}
                        <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/60 mb-4 text-[11px]">
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase">Dev Speed</span>
                            <span className={`font-semibold ${
                              arch.estimation.devSpeed === 'Rapid' ? 'text-emerald-400' :
                              arch.estimation.devSpeed === 'Moderate' ? 'text-amber-400' : 'text-red-400'
                            }`}>{arch.estimation.devSpeed}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase">Cost</span>
                            <span className="text-zinc-300 font-semibold">{arch.estimation.infraCost}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase">Team Size</span>
                            <span className="text-zinc-300 font-semibold">{arch.estimation.teamSize}</span>
                          </div>
                        </div>

                        {/* Use Case */}
                        <p className="text-xs text-zinc-400 bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/40 italic mb-4">
                          &ldquo;{arch.useCase}&rdquo;
                        </p>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          onSelectArchitecture(arch.id);
                          onClose();
                        }}
                        className="w-full py-2 bg-zinc-800 hover:bg-indigo-600 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white shadow-sm"
                      >
                        <span>Explore Diagram & Details</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Evolutionary Category Roadmap View */
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h3 className="text-2xl font-bold text-white">Enterprise Architecture Evolution & Migration Path</h3>
              <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
                How modern technology organizations modernize across architectural categories—from legacy monolithic tiers to cloud-native microservices, GitOps platform engineering, and global edge computing.
              </p>
            </div>

            <div className="relative border-l-2 border-indigo-500/40 ml-4 md:ml-8 space-y-8 pl-6 md:pl-8">
              {/* Step 1: Enterprise Monolith */}
              <div className="relative group">
                <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-amber-500 border-4 border-zinc-950 flex items-center justify-center text-xs font-bold text-zinc-950 shadow-md">
                  1
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-amber-950/60 text-amber-400 border border-amber-800/60 text-xs font-bold rounded-full">
                      🏢 Enterprise Systems Phase
                    </span>
                    <span className="text-xs font-mono text-zinc-500">Traditional Baseline</span>
                  </div>
                  <h4 className="text-lg font-bold text-white">Monolithic & Layered Tier Architectures</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Single deployment units with shared databases. Simple development in early days, but faces deployment bottlenecks and database contention as engineering teams expand past 20 developers.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs pt-2">
                    <span className="text-zinc-500 font-semibold">Key Transition Trigger:</span>
                    <span className="text-amber-300">Monolithic build times exceed 45 mins & merge conflicts stall releases.</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Cloud-Native Microservices */}
              <div className="relative group">
                <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-blue-500 border-4 border-zinc-950 flex items-center justify-center text-xs font-bold text-zinc-950 shadow-md">
                  2
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-blue-950/60 text-blue-400 border border-blue-800/60 text-xs font-bold rounded-full">
                      ☁️ Cloud-Native & Microservices
                    </span>
                    <span className="text-xs font-mono text-zinc-500">Decomposition & Autonomy</span>
                  </div>
                  <h4 className="text-lg font-bold text-white">Domain-Driven Microservices & Serverless</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Decomposing monolithic domains into independently deployable services with dedicated databases, gRPC/REST communication, and cloud FaaS execution for spiky workloads.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs pt-2">
                    <span className="text-zinc-500 font-semibold">Key Transition Trigger:</span>
                    <span className="text-blue-300">Managing 50+ microservice pipelines manually becomes operational chaos.</span>
                  </div>
                </div>
              </div>

              {/* Step 3: DevOps & GitOps Automation */}
              <div className="relative group">
                <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-emerald-500 border-4 border-zinc-950 flex items-center justify-center text-xs font-bold text-zinc-950 shadow-md">
                  3
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-xs font-bold rounded-full">
                      ♾️ DevOps & GitOps Infrastructure
                    </span>
                    <span className="text-xs font-mono text-zinc-500">Platform Engineering</span>
                  </div>
                  <h4 className="text-lg font-bold text-white">Kubernetes Orchestration & Declarative GitOps</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Automating infrastructure state through Git pull requests (ArgoCD/Flux). Eliminating direct cluster SSH/kubectl access in favor of continuous automated drift reconciliation.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs pt-2">
                    <span className="text-zinc-500 font-semibold">Key Transition Trigger:</span>
                    <span className="text-emerald-300">Needing sub-second global real-time messaging or zero database latency.</span>
                  </div>
                </div>
              </div>

              {/* Step 4: Real-time Scale & Edge */}
              <div className="relative group">
                <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-purple-500 border-4 border-zinc-950 flex items-center justify-center text-xs font-bold text-zinc-950 shadow-md">
                  4
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-purple-950/60 text-purple-400 border border-purple-800/60 text-xs font-bold rounded-full">
                      ⚡ Real-time Scale & Edge Computing
                    </span>
                    <span className="text-xs font-mono text-zinc-500">Hyper-Scale Frontier</span>
                  </div>
                  <h4 className="text-lg font-bold text-white">Event Streaming Streams, In-Memory Grids & Edge CDN Workers</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Moving compute directly to edge CDN nodes worldwide and utilizing Kafka stream topologies and in-memory tuple spaces (Hazelcast/Redis) for microsecond transactional throughput.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs pt-2">
                    <span className="text-zinc-500 font-semibold">Ultimate Outcome:</span>
                    <span className="text-purple-300">Infinite elasticity, zero database bottleneck, global 10ms response times.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-400">
        <div>
          Showing <span className="text-white font-semibold">{filteredArchitectures.length}</span> of {allArchitectures.length} total architecture patterns
        </div>
        <button
          onClick={onClose}
          className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
        >
          Close Category Explorer
        </button>
      </div>
    </div>
  );
};
