import React, { useState, useEffect } from 'react';
import { ArchType } from '../types';
import { ARCHITECTURE_DETAILS } from '../constants';

interface CareerPathModalProps {
  onClose: () => void;
  onSelectArchitecture: (archId: ArchType) => void;
  onAskAICareerCoach?: (prompt: string) => void;
  onOpenFdeAcademy?: () => void;
}

export type SeniorityLevel = 'Junior' | 'Mid' | 'Senior' | 'Principal';

export interface RoleProfile {
  id: string;
  title: string;
  category: string;
  icon: string;
  summary: string;
  demandTag: string;
  salaryRange: Record<SeniorityLevel, string>;
  requiredArchitectures: Record<SeniorityLevel, ArchType[]>;
  optionalArchitectures: Record<SeniorityLevel, ArchType[]>;
  keyCompetencies: Record<SeniorityLevel, string[]>;
  interviewQuestions: Record<SeniorityLevel, string[]>;
  recommendedMilestones: Record<SeniorityLevel, string[]>;
}

export const CAREER_ROLES: RoleProfile[] = [
  {
    id: 'backend-engineer',
    title: 'Senior Backend Engineer',
    category: 'Application & Core Services',
    icon: '⚙️',
    summary: 'Focuses on building high-performance server-side APIs, database ORM access layers, distributed cache systems, and scalable backend microservices.',
    demandTag: '🔥 Extremely High Demand',
    salaryRange: {
      Junior: '$85k - $115k',
      Mid: '$120k - $160k',
      Senior: '$165k - $220k',
      Principal: '$225k - $320k+'
    },
    requiredArchitectures: {
      Junior: [ArchType.Monolithic, ArchType.Layered],
      Mid: [ArchType.Monolithic, ArchType.Layered, ArchType.Microservices, ArchType.WebOriented],
      Senior: [ArchType.Layered, ArchType.Microservices, ArchType.EventDriven, ArchType.Serverless],
      Principal: [ArchType.Microservices, ArchType.EventDriven, ArchType.Reactive, ArchType.SpaceBased]
    },
    optionalArchitectures: {
      Junior: [ArchType.WebOriented],
      Mid: [ArchType.EventDriven, ArchType.ContainerNative],
      Senior: [ArchType.ContainerNative, ArchType.GitOps, ArchType.Reactive],
      Principal: [ArchType.EdgeComputing, ArchType.GitOps]
    },
    keyCompetencies: {
      Junior: ['RESTful API Design', 'Relational DB Queries (SQL)', 'Clean Code & Layering', 'Basic Unit Testing'],
      Mid: ['Database Indexing & Query Optimization', 'Redis Caching Patterns', 'Asynchronous Queues (RabbitMQ/SQS)', 'Docker Containerization'],
      Senior: ['CQRS & Event Sourcing', 'Distributed Locking & Transactions (Saga Pattern)', 'Service Mesh & API Gateways', 'P99 Latency Tuning'],
      Principal: ['Multi-Region Active-Active Backends', 'Zero-Downtime Migration Strategies', 'Consensus Algorithms (Raft/Paxos)', 'FinOps & Cost Optimization']
    },
    interviewQuestions: {
      Junior: ['What is the difference between Layered Architecture and Monolithic Architecture?', 'How do ACID database transactions guarantee data safety?'],
      Mid: ['How do you handle race conditions during high-volume database updates?', 'When would you break a monolith into separate microservices?'],
      Senior: ['How do you implement the Saga Pattern for distributed transactions across 3 microservices without 2-phase commit?', 'Explain CQRS read/write separation and how to handle eventual consistency lag.'],
      Principal: ['Design a global order processing backend handling 100k writes/sec with sub-50ms latency and 99.999% SLA.', 'How do you prevent cascading failures in a microservices network during an AWS availability zone outage?']
    },
    recommendedMilestones: {
      Junior: ['Build a modular Layered Monolith with clean service and repository interfaces.', 'Set up PostgreSQL with indexed FKs and database migration scripts.'],
      Mid: ['Decouple a heavy background task using an asynchronous message queue.', 'Implement JWT auth, Redis session cache, and rate-limiting middleware.'],
      Senior: ['Migrate a synchronous REST call flow into an Event-Driven pub/sub pipeline.', 'Implement distributed tracing (OpenTelemetry) and circuit breakers.'],
      Principal: ['Publish an enterprise architecture blueprint for multi-region disaster recovery.', 'Establish automated chaos engineering experiments in pre-prod environment.']
    }
  },
  {
    id: 'system-architect',
    title: 'Principal System & Enterprise Architect',
    category: 'Architecture & Strategy',
    icon: '🏛️',
    summary: 'Designs enterprise-wide software standards, multi-system integration frameworks, high-availability cloud topographies, and long-term technical roadmaps.',
    demandTag: '⭐ Executive / Lead Level',
    salaryRange: {
      Junior: '$100k - $130k',
      Mid: '$140k - $185k',
      Senior: '$190k - $260k',
      Principal: '$250k - $400k+'
    },
    requiredArchitectures: {
      Junior: [ArchType.Monolithic, ArchType.Layered, ArchType.SOA],
      Mid: [ArchType.Layered, ArchType.SOA, ArchType.Microservices, ArchType.ContainerNative],
      Senior: [ArchType.SOA, ArchType.Microservices, ArchType.EventDriven, ArchType.GitOps],
      Principal: [ArchType.Microservices, ArchType.EventDriven, ArchType.Reactive, ArchType.SpaceBased, ArchType.GitOps]
    },
    optionalArchitectures: {
      Junior: [ArchType.WebOriented],
      Mid: [ArchType.Serverless, ArchType.GitOps],
      Senior: [ArchType.SpaceBased, ArchType.EdgeComputing, ArchType.Serverless],
      Principal: [ArchType.EdgeComputing]
    },
    keyCompetencies: {
      Junior: ['UML & C4 Model Diagramming', 'System Component Decomposition', 'Enterprise Integration Basics'],
      Mid: ['Domain-Driven Design (DDD)', 'Service-Oriented Architecture vs Microservices', 'Security Governance & OAuth2/OIDC'],
      Senior: ['Enterprise Service Bus (ESB) Replacement', 'Disaster Recovery RTO/RPO Metrics', 'Cloud Migration & Hybrid Topologies'],
      Principal: ['Enterprise Technology Radar & Standards', 'Board-Level Architecture Governance', 'Ultra-Low Latency Tuple Memory Grids']
    },
    interviewQuestions: {
      Junior: ['What are the trade-offs between SOA and Monolithic architectures?'],
      Mid: ['How do you define Bounded Contexts using Domain-Driven Design (DDD)?'],
      Senior: ['How do you evaluate whether to build a custom internal platform or buy an enterprise vendor solution?'],
      Principal: ['Design a unified enterprise architecture for a bank migrating legacy mainframe core to hybrid cloud with zero downtime.']
    },
    recommendedMilestones: {
      Junior: ['Document a legacy system using C4 Model Level 1 and Level 2 diagrams.'],
      Mid: ['Lead DDD Event Storming workshops to map business domains into service boundaries.'],
      Senior: ['Author an enterprise Architecture Decision Record (ADR) framework.'],
      Principal: ['Define 5-year technology evolution roadmap and Cloud FinOps governance.']
    }
  },
  {
    id: 'cloud-devops',
    title: 'Cloud & DevOps Platform Engineer',
    category: 'Infrastructure & Reliability',
    icon: '☁️',
    summary: 'Constructs automated CI/CD pipelines, Kubernetes container orchestration, Infrastructure-as-Code (Terraform/Bicep), and GitOps deployment workflows.',
    demandTag: '🚀 Rapidly Growing',
    salaryRange: {
      Junior: '$90k - $120k',
      Mid: '$125k - $165k',
      Senior: '$170k - $230k',
      Principal: '$230k - $330k+'
    },
    requiredArchitectures: {
      Junior: [ArchType.ContainerNative, ArchType.WebOriented],
      Mid: [ArchType.ContainerNative, ArchType.GitOps, ArchType.Serverless],
      Senior: [ArchType.ContainerNative, ArchType.GitOps, ArchType.Microservices, ArchType.EdgeComputing],
      Principal: [ArchType.GitOps, ArchType.ContainerNative, ArchType.Microservices, ArchType.EventDriven, ArchType.EdgeComputing]
    },
    optionalArchitectures: {
      Junior: [ArchType.Layered],
      Mid: [ArchType.Microservices, ArchType.EdgeComputing],
      Senior: [ArchType.EventDriven, ArchType.SpaceBased],
      Principal: [ArchType.Reactive]
    },
    keyCompetencies: {
      Junior: ['Docker Container Builds', 'Linux System Administration', 'Basic Bash & CI/CD Scripts'],
      Mid: ['Kubernetes Deployment & Services', 'Terraform / Bicep Infrastructure-as-Code', 'Prometheus & Grafana Monitoring'],
      Senior: ['ArgoCD / Flux GitOps Workflows', 'Service Mesh (Istio / Linkerd)', 'Automated Canary & Blue-Green Releases'],
      Principal: ['Multi-Cloud Kubernetes Federation', 'Self-Healing Platform Infrastructure', 'Zero-Trust Security & Policy-as-Code']
    },
    interviewQuestions: {
      Junior: ['What is the difference between a Container and a Virtual Machine?'],
      Mid: ['Explain how Kubernetes handles Pod readiness, liveness probes, and rolling updates.'],
      Senior: ['How does GitOps prevent environment drift compared to traditional push CI/CD?'],
      Principal: ['Design an automated multi-region Kubernetes platform with cross-cloud failover and global traffic routing.']
    },
    recommendedMilestones: {
      Junior: ['Containerize a full-stack application with multi-stage Dockerfiles.'],
      Mid: ['Provision a production-grade Kubernetes cluster using Terraform IaC.'],
      Senior: ['Implement GitOps deployment pipeline using ArgoCD with automated canary analysis.'],
      Principal: ['Build an Internal Developer Platform (IDP) enabling 1-click ephemeral preview environments.']
    }
  },
  {
    id: 'fullstack-saas',
    title: 'Full-Stack SaaS & Frontend Architect',
    category: 'Product & Web Platforms',
    icon: '💻',
    summary: 'Builds end-to-end web applications, resilient client-side state management, Serverless cloud functions, and edge-rendered web experiences.',
    demandTag: '🔥 Standard Industry Role',
    salaryRange: {
      Junior: '$80k - $110k',
      Mid: '$115k - $155k',
      Senior: '$160k - $210k',
      Principal: '$215k - $300k+'
    },
    requiredArchitectures: {
      Junior: [ArchType.WebOriented, ArchType.Monolithic],
      Mid: [ArchType.WebOriented, ArchType.Serverless, ArchType.MobileFirst],
      Senior: [ArchType.WebOriented, ArchType.Serverless, ArchType.Microservices, ArchType.EdgeComputing],
      Principal: [ArchType.WebOriented, ArchType.Serverless, ArchType.EdgeComputing, ArchType.EventDriven]
    },
    optionalArchitectures: {
      Junior: [ArchType.Layered],
      Mid: [ArchType.Microservices, ArchType.EdgeComputing],
      Senior: [ArchType.GitOps, ArchType.ContainerNative],
      Principal: [ArchType.Reactive]
    },
    keyCompetencies: {
      Junior: ['HTML/CSS & Tailwind', 'React / Angular Component Lifecycle', 'REST API Client Fetching'],
      Mid: ['State Management (Redux/Zustand)', 'Serverless Functions (AWS Lambda / Vercel)', 'Web Vitals & Performance Optimization'],
      Senior: ['Micro-Frontends & Module Federation', 'Edge SSR & Static Site Generation', 'Offline-First & PWA Cache Strategies'],
      Principal: ['Cross-Platform Web/Mobile Architecture', 'Design System Infrastructure', 'Global CDN Edge Compute Optimization']
    },
    interviewQuestions: {
      Junior: ['What are the advantages of Single Page Applications (SPAs) over traditional Server-Side Rendering?'],
      Mid: ['How do Serverless Edge Functions improve page load performance and SEO?'],
      Senior: ['How do you architect a Micro-Frontend architecture with Module Federation for 5 independent squads?'],
      Principal: ['Design a real-time collaborative document editor handling concurrent online/offline edits across web and mobile.']
    },
    recommendedMilestones: {
      Junior: ['Build a responsive React/Vite SPA with custom state hooks and API error boundaries.'],
      Mid: ['Launch a SaaS product powered by Serverless API routes and cloud database.'],
      Senior: ['Implement a Micro-Frontend shell with lazy-loaded remote feature modules.'],
      Principal: ['Architect a global Edge-rendered application with <100ms P95 Time-to-Interactive globally.']
    }
  },
  {
    id: 'mobile-edge',
    title: 'Mobile & Edge Systems Specialist',
    category: 'Mobile & Edge Computing',
    icon: '📱',
    summary: 'Architects high-performance native/cross-platform mobile apps, local database synchronization, edge AI inference, and IoT device communications.',
    demandTag: '⚡ High Specialized Demand',
    salaryRange: {
      Junior: '$85k - $115k',
      Mid: '$120k - $160k',
      Senior: '$165k - $220k',
      Principal: '$225k - $320k+'
    },
    requiredArchitectures: {
      Junior: [ArchType.MobileFirst, ArchType.WebOriented],
      Mid: [ArchType.MobileFirst, ArchType.Serverless, ArchType.EdgeComputing],
      Senior: [ArchType.MobileFirst, ArchType.EdgeComputing, ArchType.EventDriven, ArchType.Microservices],
      Principal: [ArchType.MobileFirst, ArchType.EdgeComputing, ArchType.EventDriven, ArchType.Reactive]
    },
    optionalArchitectures: {
      Junior: [ArchType.Monolithic],
      Mid: [ArchType.ContainerNative],
      Senior: [ArchType.Reactive, ArchType.GitOps],
      Principal: [ArchType.SpaceBased]
    },
    keyCompetencies: {
      Junior: ['Mobile UI Development (Swift/Kotlin/React Native)', 'Local SQLite / Room Storage', 'Async HTTP Requests'],
      Mid: ['Offline Data Sync & Conflict Resolution', 'Push Notification Topologies', 'Edge Lambda & Cloudlet APIs'],
      Senior: ['On-Device ML Inference Optimization', 'Bluetooth / IoT Socket Protocols', 'Battery & Memory Management'],
      Principal: ['Ultra-Low Latency Mobile Edge CDN Architecture', 'Zero-Latency Offline-First Data Engines']
    },
    interviewQuestions: {
      Junior: ['What is the difference between Native and Cross-Platform mobile development?'],
      Mid: ['How do you synchronize local SQLite data with a cloud backend when connection drops?'],
      Senior: ['How do you run AI/ML models on-device while maintaining 60 FPS UI rendering?'],
      Principal: ['Design an edge-computing IoT pipeline for 1,000,000 smart sensors transmitting telemetry every 500ms.']
    },
    recommendedMilestones: {
      Junior: ['Publish a mobile app featuring local SQLite storage and clean UI layering.'],
      Mid: ['Implement bidirectional offline synchronization engine with delta patches.'],
      Senior: ['Deploy on-device LLM/vision inference pipeline with Edge CDN acceleration.'],
      Principal: ['Architect enterprise fleet management mobile suite for zero-connectivity environments.']
    }
  },
  {
    id: 'realtime-ai-data',
    title: 'Real-Time Data & AI Platform Architect',
    category: 'Data & High-Scale Systems',
    icon: '⚡',
    summary: 'Designs streaming event pipelines (Kafka/Pulsar), vector search backends, distributed in-memory data grids, and real-time AI agent orchestration.',
    demandTag: '🤖 Ultra-High Growth Area',
    salaryRange: {
      Junior: '$95k - $130k',
      Mid: '$135k - $180k',
      Senior: '$185k - $260k',
      Principal: '$260k - $420k+'
    },
    requiredArchitectures: {
      Junior: [ArchType.EventDriven, ArchType.Layered],
      Mid: [ArchType.EventDriven, ArchType.Reactive, ArchType.ContainerNative],
      Senior: [ArchType.EventDriven, ArchType.Reactive, ArchType.SpaceBased, ArchType.Microservices],
      Principal: [ArchType.EventDriven, ArchType.SpaceBased, ArchType.Reactive, ArchType.ContainerNative, ArchType.EdgeComputing]
    },
    optionalArchitectures: {
      Junior: [ArchType.Monolithic],
      Mid: [ArchType.Serverless, ArchType.GitOps],
      Senior: [ArchType.EdgeComputing, ArchType.GitOps],
      Principal: [ArchType.SOA]
    },
    keyCompetencies: {
      Junior: ['SQL Data Warehousing', 'Basic Pub/Sub Message Streams', 'Python/Scala Data Pipelines'],
      Mid: ['Apache Kafka / Flink Event Streaming', 'Vector DB & Embedding Indexing', 'Non-Blocking Reactive Processing'],
      Senior: ['Distributed Tuple Spaces & In-Memory Grids', 'RAG (Retrieval-Augmented Generation) Architecture', 'CQRS Stream Analytics'],
      Principal: ['Sub-Millisecond Financial & AI Pipeline Topology', 'Massive Sharded Multi-Model Database Engines']
    },
    interviewQuestions: {
      Junior: ['What is the difference between batch data processing and stream data processing?'],
      Mid: ['How does Apache Kafka ensure event ordering within a topic partition?'],
      Senior: ['How do you architect a Vector Search pipeline for 100M embeddings with real-time updates and sub-20ms latency?'],
      Principal: ['Design a distributed memory-grid architecture for a high-frequency trading platform handling 500k ops/sec.']
    },
    recommendedMilestones: {
      Junior: ['Build a real-time event consumer using Kafka/RabbitMQ in Python or Go.'],
      Mid: ['Deploy a vector search pipeline using Qdrant/Pinecone and streaming embeddings.'],
      Senior: ['Architect an event-driven RAG agent pipeline with real-time feedback loops.'],
      Principal: ['Construct a space-based distributed memory grid operating with zero database locks.']
    }
  },
  {
    id: 'forward-deployed-engineer',
    title: 'Forward Deployed Software Engineer (FDE)',
    category: 'Enterprise Solutions & Client Systems',
    icon: '⚡',
    summary: 'Directly bridges core engineering and high-stakes enterprise clients (Defense, Tier-1 FinTech, Healthcare). Deploys operational ontologies, air-gapped zero-trust clusters, and production AI workflows on-site.',
    demandTag: '💎 Elite High-Compensation Track',
    salaryRange: {
      Junior: '$130k - $175k',
      Mid: '$175k - $240k',
      Senior: '$240k - $360k',
      Principal: '$360k - $550k+'
    },
    requiredArchitectures: {
      Junior: [ArchType.Layered, ArchType.WebOriented, ArchType.Monolithic],
      Mid: [ArchType.ContainerNative, ArchType.Microservices, ArchType.EventDriven],
      Senior: [ArchType.ContainerNative, ArchType.GitOps, ArchType.EventDriven, ArchType.EdgeComputing],
      Principal: [ArchType.ContainerNative, ArchType.GitOps, ArchType.Microservices, ArchType.SpaceBased, ArchType.SOA]
    },
    optionalArchitectures: {
      Junior: [ArchType.Serverless],
      Mid: [ArchType.GitOps, ArchType.SOA],
      Senior: [ArchType.SpaceBased, ArchType.Reactive],
      Principal: [ArchType.Reactive, ArchType.EdgeComputing]
    },
    keyCompetencies: {
      Junior: ['Enterprise API & Webhook Integration', 'DuckDB/Polars In-Memory Ingestion', 'Docker Container Packaging', 'Customer-Facing Technical Demos'],
      Mid: ['Palantir-style OAR Ontology Modeling', 'Air-Gapped Kubernetes & Helm Offline Charts', 'SAML 2.0 / OIDC Identity Federation', 'Kafka CDC & Change Data Capture'],
      Senior: ['Zero-Trust PrivateLink / VPC Peering', 'Self-Hosted LLM Serving (vLLM/Triton)', 'Executive Incident Command & Blameless RCAs', 'Enterprise RAG with PII Masking'],
      Principal: ['Multi-Million Dollar POC Scoping & Risk Management', 'SCIF / IL5 Defense Secret Network Architecture', 'Enterprise Product-to-Platform Flywheels', 'Cross-Organizational Architecture Influence']
    },
    interviewQuestions: {
      Junior: ['How do you quickly parse and sanitize a dirty 20GB customer CSV file without crashing server memory?'],
      Mid: ['Explain how an Object-Action-Relation (OAR) ontology differs from a raw dimensional Data Lakehouse model.'],
      Senior: ['How do you architect a high-security AI assistant deployed entirely in an offline, air-gapped client Kubernetes cluster?'],
      Principal: ['During a live C-Suite demo, the client database times out. Walk me through your real-time incident command and client communication strategy.']
    },
    recommendedMilestones: {
      Junior: ['Build an automated client data ingestion pipeline with schema validation and dead-letter queues.'],
      Mid: ['Design and deploy a semantic business ontology over heterogeneous enterprise databases.'],
      Senior: ['Package and deploy an air-gapped K8s application with automated Helm offline bundles.'],
      Principal: ['Earn the Official Forward Deployed Engineering (FDE) Credential and deliver a 6-figure enterprise POC.']
    }
  }
];

export const CareerPathModal: React.FC<CareerPathModalProps> = ({
  onClose,
  onSelectArchitecture,
  onAskAICareerCoach,
  onOpenFdeAcademy
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('backend-engineer');
  const [selectedSeniority, setSelectedSeniority] = useState<SeniorityLevel>('Senior');
  const [masteredArchs, setMasteredArchs] = useState<ArchType[]>(() => {
    try {
      const saved = localStorage.getItem('archfiddle_career_mastered');
      return saved ? JSON.parse(saved) : [ArchType.Monolithic, ArchType.Layered];
    } catch (e) {
      return [ArchType.Monolithic, ArchType.Layered];
    }
  });

  const [activeTab, setActiveTab] = useState<'roadmap' | 'competencies' | 'interview' | 'export'>('roadmap');
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('archfiddle_career_mastered', JSON.stringify(masteredArchs));
    } catch (e) {
      // ignore
    }
  }, [masteredArchs]);

  const activeRole = CAREER_ROLES.find(r => r.id === selectedRoleId) || CAREER_ROLES[0];
  const reqArchs = activeRole.requiredArchitectures[selectedSeniority] || [];
  const optArchs = activeRole.optionalArchitectures[selectedSeniority] || [];
  const allTargetArchs = [...reqArchs, ...optArchs];

  // Calculate Readiness Score
  const totalRequired = reqArchs.length;
  const masteredCount = reqArchs.filter(a => masteredArchs.includes(a)).length;
  const readinessPercent = totalRequired > 0 ? Math.round((masteredCount / totalRequired) * 100) : 0;

  const toggleMasteredArch = (arch: ArchType) => {
    setMasteredArchs(prev =>
      prev.includes(arch) ? prev.filter(a => a !== arch) : [...prev, arch]
    );
  };

  const handleCopyReport = () => {
    const markdown = `# Career Path Plan: ${activeRole.title} (${selectedSeniority} Level)
    
## Role Overview
- **Category:** ${activeRole.category}
- **Target Salary Range:** ${activeRole.salaryRange[selectedSeniority]}
- **Market Demand:** ${activeRole.demandTag}
- **Readiness Score:** ${readinessPercent}% (${masteredCount}/${totalRequired} Required Architectures Mastered)

## Core Architectural Mastery Checklist
${reqArchs.map(a => `- [${masteredArchs.includes(a) ? 'x' : ' '}] **${a}** (Required)`).join('\n')}
${optArchs.map(a => `- [${masteredArchs.includes(a) ? 'x' : ' '}] **${a}** (Optional / Recommended)`).join('\n')}

## Key Technical Competencies
${(activeRole.keyCompetencies[selectedSeniority] || []).map(c => `- ${c}`).join('\n')}

## Recommended Practical Milestones
${(activeRole.recommendedMilestones[selectedSeniority] || []).map(m => `- ${m}`).join('\n')}

## Key Interview Preparation Focus
${(activeRole.interviewQuestions[selectedSeniority] || []).map(q => `- ${q}`).join('\n')}

---
*Generated via ArchFiddle Enterprise Architecture Studio*
`;

    navigator.clipboard.writeText(markdown);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-7xl w-full max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-600 via-orange-600 to-red-600 rounded-xl text-white shadow-lg shadow-orange-900/30 shrink-0">
              <span className="text-xl">🚀</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Architecture Career Path Builder
              </h2>
              <p className="text-xs text-zinc-400">
                Tailored architectural mastery roadmaps & interview prep by job role and seniority
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Selector */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
              <button
                onClick={() => setActiveTab('roadmap')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'roadmap'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>🗺️ Architecture Roadmap</span>
              </button>
              <button
                onClick={() => setActiveTab('competencies')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'competencies'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>🎯 Competencies</span>
              </button>
              <button
                onClick={() => setActiveTab('interview')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'interview'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>💬 Interview Prep</span>
              </button>
            </div>

            <button
              onClick={handleCopyReport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-bold rounded-xl transition-all border border-zinc-700"
              title="Copy personalized career readiness checklist as Markdown"
            >
              <span>{copiedReport ? '✓ Copied Report' : '📋 Copy Plan'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all border border-zinc-700 ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Role & Seniority Selector Bar */}
        <div className="bg-zinc-950 border-b border-zinc-800 p-3 sm:p-4 shrink-0 space-y-3">
          
          {/* Top Row: Role Selector Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono shrink-0 mr-1">
              💼 Role Profile:
            </span>
            {CAREER_ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                  selectedRoleId === role.id
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-500 shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{role.icon}</span>
                <span>{role.title}</span>
              </button>
            ))}
          </div>

          {/* Bottom Row: Seniority Levels + Role Summary Stats */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-2 border-t border-zinc-900">
            
            {/* Seniority Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto custom-scrollbar">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono shrink-0 mr-1">
                ⭐ Seniority Level:
              </span>
              {(['Junior', 'Mid', 'Senior', 'Principal'] as SeniorityLevel[]).map((level) => {
                const labels: Record<SeniorityLevel, string> = {
                  Junior: 'Junior (0-2 YOE)',
                  Mid: 'Mid-Level (2-5 YOE)',
                  Senior: 'Senior (5-8 YOE)',
                  Principal: 'Principal / Lead (8+ YOE)'
                };

                const isSelected = selectedSeniority === level;
                return (
                  <button
                    key={level}
                    onClick={() => setSelectedSeniority(level)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-amber-950 text-amber-200 border-amber-600 shadow-sm font-extrabold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {labels[level]}
                  </button>
                );
              })}
            </div>

            {/* Live Role Snapshot Badges */}
            <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
              <span className="text-zinc-400">
                Target Salary: <strong className="text-emerald-400">{activeRole.salaryRange[selectedSeniority]}</strong>
              </span>
              <span className="text-zinc-400 hidden sm:inline">
                • Demand: <strong className="text-amber-300">{activeRole.demandTag.split(' ')[1] || 'High'}</strong>
              </span>
              <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">
                <span className="text-zinc-400">Role Readiness:</span>
                <span className={`font-bold ${readinessPercent >= 80 ? 'text-emerald-400' : readinessPercent >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {readinessPercent}%
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6 bg-zinc-950/50">
          
          {/* Active Role Summary Card */}
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  {activeRole.category}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {selectedSeniority} Level Target
                </span>
              </div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>{activeRole.icon}</span>
                <span>{activeRole.title} ({selectedSeniority})</span>
              </h3>
              <p className="text-xs text-zinc-300 max-w-4xl leading-relaxed">
                {activeRole.summary}
              </p>
            </div>

            {onAskAICareerCoach && (
              <button
                onClick={() => {
                  onAskAICareerCoach(`Give me a detailed career progression plan for becoming a ${selectedSeniority} ${activeRole.title}. Focus on required architecture styles (${reqArchs.join(', ')}), key system design concepts to master, and step-by-step roadmap.`);
                  onClose();
                }}
                className="py-2.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 border border-amber-400/40"
              >
                <span>💬 Ask AI Career Coach</span>
                <span>→</span>
              </button>
            )}
          </div>

          {/* FDE Academy Quick Launcher Banner */}
          {selectedRoleId === 'forward-deployed-engineer' && onOpenFdeAcademy && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950 via-blue-950 to-indigo-950 border-2 border-cyan-500/60 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-cyan-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 text-xl font-bold">
                  ⚡
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Forward Deployed Engineering (FDE) Academy & Certificate</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-900 text-cyan-200 border border-cyan-700">
                      Module Ready
                    </span>
                  </h4>
                  <p className="text-xs text-cyan-200/80">
                    Access the complete 6-phase curriculum, Palantir-style OAR ontology cheat sheets, SCIF blueprints, war room simulators, and official certification exam.
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenFdeAcademy}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-950/50 flex items-center gap-1.5 shrink-0 transition-transform active:scale-95"
              >
                <span>Launch FDE Academy</span>
                <span>→</span>
              </button>
            </div>
          )}

          {/* TAB 1: ARCHITECTURE ROADMAP & MASTERY CHECKLIST */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Core Required Architectures Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-2">
                    <span>🔥 Must-Master Core Architectures ({reqArchs.length})</span>
                    <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                      Required for {selectedSeniority} Role
                    </span>
                  </h4>
                  <span className="text-[11px] text-zinc-500 hidden sm:inline">
                    Check off architectures you've built or mastered to track your Readiness Score
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reqArchs.map((archType) => {
                    const arch = ARCHITECTURE_DETAILS[archType];
                    const isMastered = masteredArchs.includes(archType);
                    if (!arch) return null;

                    return (
                      <div
                        key={arch.id}
                        className={`bg-zinc-900 border rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all relative shadow-md ${
                          isMastered
                            ? 'border-emerald-500/70 bg-emerald-950/20'
                            : 'border-zinc-800 hover:border-amber-500/50'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => toggleMasteredArch(archType)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 border ${
                                isMastered
                                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                              }`}
                            >
                              <span>{isMastered ? '✓ Mastered' : '◯ Mark Mastered'}</span>
                            </button>

                            <span className="text-[10px] font-mono text-zinc-400">
                              Complexity: <strong className="text-amber-400">{arch.estimation.complexityScore}/10</strong>
                            </span>
                          </div>

                          <h5 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{arch.title}</span>
                          </h5>

                          <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                            {arch.coreIdea}
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                            <span>Category: <strong className="text-zinc-200">{arch.category.split(' ')[0]}</strong></span>
                            <span>Speed: <strong className="text-emerald-400">{arch.estimation.devSpeed}</strong></span>
                          </div>

                          <button
                            onClick={() => {
                              onSelectArchitecture(arch.id);
                              onClose();
                            }}
                            className="w-full py-1.5 px-3 bg-amber-600/20 hover:bg-amber-600 text-amber-200 hover:text-white text-xs font-bold rounded-lg border border-amber-500/40 transition-all flex items-center justify-center gap-1.5"
                          >
                            <span>Inspect Architecture Blueprint</span>
                            <span>→</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Optional / Recommended Secondary Architectures Section */}
              {optArchs.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono flex items-center gap-2">
                      <span>💡 Secondary & Advantageous Architectures ({optArchs.length})</span>
                      <span className="text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-800">
                        Recommended Boost
                      </span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {optArchs.map((archType) => {
                      const arch = ARCHITECTURE_DETAILS[archType];
                      const isMastered = masteredArchs.includes(archType);
                      if (!arch) return null;

                      return (
                        <div
                          key={arch.id}
                          className={`bg-zinc-900 border rounded-xl p-3.5 flex flex-col justify-between gap-2.5 transition-all ${
                            isMastered ? 'border-emerald-500/60 bg-emerald-950/10' : 'border-zinc-800 hover:border-sky-500/50'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-sky-300 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                                Secondary
                              </span>
                              <button
                                onClick={() => toggleMasteredArch(archType)}
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                                  isMastered
                                    ? 'bg-emerald-600 text-white border-emerald-400'
                                    : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                                }`}
                              >
                                {isMastered ? '✓ Mastered' : '◯ Mark'}
                              </button>
                            </div>
                            <h5 className="text-xs font-bold text-white">{arch.title}</h5>
                            <p className="text-[11px] text-zinc-400 line-clamp-2">{arch.coreIdea}</p>
                          </div>

                          <button
                            onClick={() => {
                              onSelectArchitecture(arch.id);
                              onClose();
                            }}
                            className="w-full py-1 px-2 bg-zinc-950 hover:bg-sky-950 text-sky-300 text-[11px] font-bold rounded border border-zinc-800 hover:border-sky-700 transition-all text-center"
                          >
                            Inspect Architecture →
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recommended Practical Milestones */}
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-3 shadow-lg">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span>🏆 Practical Engineering Milestones to Achieve ({selectedSeniority} Level):</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(activeRole.recommendedMilestones[selectedSeniority] || []).map((milestone, idx) => (
                    <div key={idx} className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 flex items-start gap-2.5 text-xs text-zinc-200">
                      <span className="p-1 bg-emerald-950 text-emerald-300 font-bold font-mono rounded text-[10px] shrink-0 border border-emerald-800">
                        Goal #{idx + 1}
                      </span>
                      <span className="leading-relaxed">{milestone}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: KEY COMPETENCIES & CONCEPTS */}
          {activeTab === 'competencies' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-xl">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span>🎯 Target Technical Competencies ({selectedSeniority} Level)</span>
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Core system concepts, trade-off evaluations, and architectural knowledge expected during technical interviews and day-to-day leadership.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(activeRole.keyCompetencies[selectedSeniority] || []).map((comp, idx) => (
                    <div key={idx} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 font-mono">
                          Competency #{idx + 1}
                        </span>
                        <span className="text-[10px] bg-amber-950 text-amber-200 px-2 py-0.5 rounded border border-amber-800 font-mono">
                          Core Capability
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white leading-relaxed">
                        {comp}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Salary & Career Progression Trajectory Table */}
              <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-xl">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>📈 Compensation & Seniority Progression Trajectory</span>
                </h4>

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-xs text-left text-zinc-300 font-mono">
                    <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Level Tier</th>
                        <th className="p-3">Target Compensation</th>
                        <th className="p-3">Required Architectures Count</th>
                        <th className="p-3">Primary Focus Shift</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80">
                      {(['Junior', 'Mid', 'Senior', 'Principal'] as SeniorityLevel[]).map((level) => {
                        const isCurrent = level === selectedSeniority;
                        return (
                          <tr key={level} className={isCurrent ? 'bg-amber-950/30 font-bold' : 'hover:bg-zinc-900/50'}>
                            <td className="p-3 font-bold text-white">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${
                                isCurrent ? 'bg-amber-600 text-white font-extrabold' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                              }`}>
                                {level}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-emerald-400">
                              {activeRole.salaryRange[level]}
                            </td>
                            <td className="p-3 text-amber-300">
                              {(activeRole.requiredArchitectures[level] || []).length} Core Styles
                            </td>
                            <td className="p-3 text-zinc-300 font-sans text-[11px]">
                              {level === 'Junior' && 'Feature implementation & module boundaries'}
                              {level === 'Mid' && 'Independent service ownership & queue processing'}
                              {level === 'Senior' && 'Distributed trade-offs, CQRS, resiliency & event streams'}
                              {level === 'Principal' && 'Enterprise blueprints, multi-region failover & platform strategy'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: INTERVIEW PREPARATION */}
          {activeTab === 'interview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-xl">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span>💬 Seniority Interview Preparation Focus ({selectedSeniority} Level)</span>
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Real-world technical questions asked during top tech & enterprise architectural system design loops.
                  </p>
                </div>

                <div className="space-y-3">
                  {(activeRole.interviewQuestions[selectedSeniority] || []).map((q, idx) => (
                    <div key={idx} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 font-mono">
                          Interview Question #{idx + 1}
                        </span>
                        {onAskAICareerCoach && (
                          <button
                            onClick={() => {
                              onAskAICareerCoach(`How should I answer this architectural interview question for a ${selectedSeniority} ${activeRole.title} position: "${q}"? Provide a structured Senior-level answer with trade-offs.`);
                              onClose();
                            }}
                            className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 text-blue-300 hover:text-white border border-blue-800 text-[11px] font-bold rounded-lg transition-all"
                          >
                            💬 Practice with AI Coach
                          </button>
                        )}
                      </div>
                      <h5 className="text-sm font-bold text-white leading-relaxed">
                        "{q}"
                      </h5>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
