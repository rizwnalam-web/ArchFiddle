import React, { useState, useMemo } from 'react';
import { ArchitectureData, ArchType } from '../types';
import { ARCHITECTURE_DETAILS } from '../constants';
import { 
  X, 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Sparkles, 
  Zap, 
  DollarSign, 
  Clock, 
  Cpu, 
  ShieldAlert, 
  Users, 
  Download, 
  Printer, 
  Layers,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface ArchitectureComparisonReportModalProps {
  initialArchA?: ArchType;
  initialArchB?: ArchType;
  onClose: () => void;
  onAskAI?: (prompt: string) => void;
}

export interface ComparisonMetricProfile {
  scalabilityScore: number; // 1-10
  scalabilityDesc: string;
  elasticityType: string;
  maxRpsCapacity: string;
  dataPartitioningStrategy: string;

  latencyScore: number; // 1-10 (10 = ultra low latency)
  p99Latency: string;
  networkHopOverhead: string;
  serializationOverhead: string;

  devEffortScore: number; // 1-10 (10 = highest operational/dev complexity)
  devSpeed: string;
  opsOverhead: string;
  localDebugging: string;
  cicdComplexity: string;

  costEfficiencyScore: number; // 1-10 (10 = most cost efficient at scale)
  baselineIdleCost: string;
  costCurveAtScale: string;
  resourceEfficiency: string;

  blastRadius: string;
  faultTolerance: string;
  idealTeamSize: string;
  verdictWhenToUse: string;
}

export const ARCHITECTURE_METRICS: Record<ArchType, ComparisonMetricProfile> = {
  [ArchType.Monolithic]: {
    scalabilityScore: 3,
    scalabilityDesc: 'Vertical scaling (scale-up). Hard to scale individual bottleneck modules.',
    elasticityType: 'Vertical VM/Server Resize',
    maxRpsCapacity: 'Up to 5,000 - 15,000 RPS (per cluster)',
    dataPartitioningStrategy: 'Single Relational DB (ACID transactions)',
    latencyScore: 9,
    p99Latency: '< 5ms - 15ms (In-memory method calls)',
    networkHopOverhead: 'Zero network hops for internal logic',
    serializationOverhead: 'Zero serialization overhead',
    devEffortScore: 2,
    devSpeed: 'Rapid (Fastest MVP build)',
    opsOverhead: 'Low (Single deployable artifact)',
    localDebugging: 'Straightforward (Single IDE breakpoint)',
    cicdComplexity: 'Low (Single build step)',
    costEfficiencyScore: 9,
    baselineIdleCost: '$20 - $80 / month',
    costCurveAtScale: 'Linear until vertical DB limit reached',
    resourceEfficiency: 'Very high memory sharing',
    blastRadius: 'Global (Single bug can crash full app)',
    faultTolerance: 'Low (Process failure drops all traffic)',
    idealTeamSize: '1 - 5 Developers',
    verdictWhenToUse: 'Choose for MVPs, early-stage startups, low-complexity domain models, or teams under 6 developers needing maximum delivery speed.'
  },
  [ArchType.Layered]: {
    scalabilityScore: 4,
    scalabilityDesc: 'Tiered horizontal scaling (Web & App tiers scale separately).',
    elasticityType: 'Horizontal Tier Auto-scaling',
    maxRpsCapacity: 'Up to 10,000 - 25,000 RPS',
    dataPartitioningStrategy: 'Centralized Relational DB with Read Replicas',
    latencyScore: 7,
    p99Latency: '15ms - 35ms (Layer-hopping overhead)',
    networkHopOverhead: '1 - 2 internal network boundaries',
    serializationOverhead: 'DTO object mapping between layers',
    devEffortScore: 4,
    devSpeed: 'Moderate (Standardized boilerplate)',
    opsOverhead: 'Medium (Multi-tier server management)',
    localDebugging: 'Moderate (Easy with local DB container)',
    cicdComplexity: 'Medium (Coordinated layer deployments)',
    costEfficiencyScore: 7,
    baselineIdleCost: '$100 - $300 / month',
    costCurveAtScale: 'Moderate (Database license & IOPS dominate)',
    resourceEfficiency: 'Moderate (Layer mapping memory overhead)',
    blastRadius: 'App-wide or Tier-wide failure',
    faultTolerance: 'Moderate (Web tier can failover automatically)',
    idealTeamSize: '5 - 20 Developers',
    verdictWhenToUse: 'Choose for enterprise corporate backends, ERPs, and administrative systems with strict compliance and layered governance requirements.'
  },
  [ArchType.SOA]: {
    scalabilityScore: 6,
    scalabilityDesc: 'Coarse-grained service scaling via Enterprise Service Bus (ESB).',
    elasticityType: 'Service Cluster Scaling',
    maxRpsCapacity: 'Up to 20,000 - 50,000 RPS',
    dataPartitioningStrategy: 'Shared Enterprise Databases & Integration Warehouses',
    latencyScore: 5,
    p99Latency: '40ms - 120ms (ESB orchestration & XML transforms)',
    networkHopOverhead: '2 - 4 network hops through ESB middleware',
    serializationOverhead: 'Heavy SOAP / XML parsing overhead',
    devEffortScore: 8,
    devSpeed: 'Slow (Heavy governance & contract definitions)',
    opsOverhead: 'High (ESB middleware maintenance & XML orchestration)',
    localDebugging: 'Complex (Requires local ESB environment)',
    cicdComplexity: 'High (ESB pipeline dependencies)',
    costEfficiencyScore: 4,
    baselineIdleCost: '$500 - $2,500 / month (ESB licenses)',
    costCurveAtScale: 'High (Middleware licensing and heavy ESB hardware)',
    resourceEfficiency: 'Low (Heavy middleware footprint)',
    blastRadius: 'ESB outage halts all enterprise integration',
    faultTolerance: 'Moderate (ESB provides message queuing & retries)',
    idealTeamSize: '20 - 100+ Enterprise Developers',
    verdictWhenToUse: 'Choose when integrating heterogeneous legacy enterprise systems, SAP/Oracle suites, and external B2B partner protocols.'
  },
  [ArchType.Microservices]: {
    scalabilityScore: 9,
    scalabilityDesc: 'Independent fine-grained service scaling and database sharding.',
    elasticityType: 'Independent Container/Pod Auto-scaling',
    maxRpsCapacity: '100,000+ RPS (Highly distributed)',
    dataPartitioningStrategy: 'Database-per-service (PolygLot persistence & Eventual consistency)',
    latencyScore: 6,
    p99Latency: '25ms - 75ms (Multi-hop HTTP/gRPC API gateway calls)',
    networkHopOverhead: '3 - 8 internal network hops per user transaction',
    serializationOverhead: 'JSON/Protobuf over gRPC/HTTP2',
    devEffortScore: 9,
    devSpeed: 'Slow initial setup, rapid feature velocity per squad later',
    opsOverhead: 'Very High (K8s, Service Mesh, Distributed Tracing)',
    localDebugging: 'Very Complex (Requires Docker Compose / Telemetry mocks)',
    cicdComplexity: 'Very High (Independent service pipelines & Helm charts)',
    costEfficiencyScore: 5,
    baselineIdleCost: '$300 - $1,500 / month (K8s Control plane & telemetry)',
    costCurveAtScale: 'Sub-linear per user, but high idle floor',
    resourceEfficiency: 'Moderate (Container overhead per service)',
    blastRadius: 'Isolated (Failure of 1 service does not crash others)',
    faultTolerance: 'High (Circuit breakers, bulkheads & retries)',
    idealTeamSize: '15 - 100+ Developers across autonomous squads',
    verdictWhenToUse: 'Choose for high-scale enterprise applications with multiple independent engineering teams, requiring autonomous release cycles and fine-grained elasticity.'
  },
  [ArchType.EventDriven]: {
    scalabilityScore: 10,
    scalabilityDesc: 'Asynchronous event streaming with parallel partition consumers.',
    elasticityType: 'Partition-based Dynamic Consumer Scaling',
    maxRpsCapacity: '500,000+ RPS (Kafka/EventHubs batch throughput)',
    dataPartitioningStrategy: 'Event Sourcing, CQRS & Distributed Event Log',
    latencyScore: 8,
    p99Latency: '10ms - 30ms (Async pub/sub pipeline)',
    networkHopOverhead: '1 - 2 hops to Message Broker',
    serializationOverhead: 'Avro / Protobuf schema registry serialization',
    devEffortScore: 8,
    devSpeed: 'Moderate to Slow (Complex async state machine reasoning)',
    opsOverhead: 'High (Kafka / RabbitMQ / Schema Registry management)',
    localDebugging: 'Complex (Async event replay debugging)',
    cicdComplexity: 'High (Schema versioning & contract compatibility)',
    costEfficiencyScore: 8,
    baselineIdleCost: '$150 - $600 / month',
    costCurveAtScale: 'Highly cost efficient under massive surge loads',
    resourceEfficiency: 'Very High (Non-blocking I/O event loops)',
    blastRadius: 'Isolated (Dead letter queues capture failing events)',
    faultTolerance: 'Very High (Replayability & durable message queues)',
    idealTeamSize: '10 - 50 Developers',
    verdictWhenToUse: 'Choose for real-time telemetry, IoT ingestion, e-commerce order processing, financial transactions, and decoupling reactive workflows.'
  },
  [ArchType.Serverless]: {
    scalabilityScore: 10,
    scalabilityDesc: 'Instant elastic auto-scaling from zero to tens of thousands of concurrent executions.',
    elasticityType: 'Instant Event-Triggered Micro-concurrency',
    maxRpsCapacity: '50,000+ Concurrent Executions (Cloud Provider Limits)',
    dataPartitioningStrategy: 'Serverless-friendly DBs (DynamoDB / Cosmos DB / Cloud SQL Proxy)',
    latencyScore: 6,
    p99Latency: '30ms - 250ms (Cold start spikes: 500ms+)',
    networkHopOverhead: '2 - 4 hops (API Gateway -> Lambda -> DynamoDB)',
    serializationOverhead: 'JSON payloads over HTTP API Gateways',
    devEffortScore: 5,
    devSpeed: 'Rapid (Zero infrastructure provisioning)',
    opsOverhead: 'Low (No server management, fully managed platform)',
    localDebugging: 'Moderate (Requires SAM / LocalStack emulation)',
    cicdComplexity: 'Medium (Serverless Framework / SAM / CDK)',
    costEfficiencyScore: 8,
    baselineIdleCost: '$0 / month (Pay strictly per millisecond execution)',
    costCurveAtScale: 'Linear per request; can become expensive at steady high RPS',
    resourceEfficiency: 'Near 100% (No paying for idle CPU)',
    blastRadius: 'Micro-isolated (Single function instance scope)',
    faultTolerance: 'High (Automatic managed multi-AZ retry & failover)',
    idealTeamSize: '2 - 20 Developers',
    verdictWhenToUse: 'Choose for bursty, event-driven workloads, webhooks, cron jobs, background image/data processing, and startups wanting zero idle infrastructure bills.'
  },
  [ArchType.WebOriented]: {
    scalabilityScore: 7,
    scalabilityDesc: 'Edge CDN caching combined with stateless web API clusters.',
    elasticityType: 'CDN Edge Caching + Statutory API Scaling',
    maxRpsCapacity: '50,000+ RPS (with 90% CDN edge cache hit ratio)',
    dataPartitioningStrategy: 'Stateless REST APIs with Caching Layer (Redis)',
    latencyScore: 8,
    p99Latency: '10ms - 40ms (Edge cached content: < 5ms)',
    networkHopOverhead: '1 - 2 network hops',
    serializationOverhead: 'Standard JSON over HTTPS',
    devEffortScore: 3,
    devSpeed: 'Rapid (Well-understood web standards & frameworks)',
    opsOverhead: 'Low to Medium (PaaS / Vercel / Cloudflare Workers)',
    localDebugging: 'Easy (Standard web dev server)',
    cicdComplexity: 'Low (Git-integrated automated previews)',
    costEfficiencyScore: 9,
    baselineIdleCost: '$20 - $100 / month',
    costCurveAtScale: 'Very low if edge caching is optimized',
    resourceEfficiency: 'High',
    blastRadius: 'Web application scope',
    faultTolerance: 'High (Edge CDN absorbs volumetric traffic spikes)',
    idealTeamSize: '2 - 15 Developers',
    verdictWhenToUse: 'Choose for content-rich SaaS products, e-commerce storefronts, customer portals, and public APIs prioritizing web performance.'
  },
  [ArchType.MobileFirst]: {
    scalabilityScore: 7,
    scalabilityDesc: 'Backend-for-Frontend (BFF) layer tailored for mobile client networks.',
    elasticityType: 'Mobile API Gateway Auto-scaling',
    maxRpsCapacity: '30,000+ RPS',
    dataPartitioningStrategy: 'Mobile Sync Store + Server DB (GraphQL / REST BFF)',
    latencyScore: 7,
    p99Latency: '20ms - 60ms (Optimized mobile payload batching)',
    networkHopOverhead: '1 hop to BFF -> internal fan-out',
    serializationOverhead: 'Compressed Protobuf / Minimal JSON DTOs',
    devEffortScore: 5,
    devSpeed: 'Moderate (BFF & client offline storage sync logic)',
    opsOverhead: 'Medium (BFF gateway & push notification servers)',
    localDebugging: 'Moderate (Mobile simulator + local API gateway)',
    cicdComplexity: 'Medium (App store releases + BFF deployments)',
    costEfficiencyScore: 7,
    baselineIdleCost: '$50 - $200 / month',
    costCurveAtScale: 'Predictable per active mobile session',
    resourceEfficiency: 'High (Aggregated mobile responses reduce payload size)',
    blastRadius: 'Client app version dependency or BFF gateway scope',
    faultTolerance: 'High on client (Offline-first SQLite local persistence)',
    idealTeamSize: '5 - 25 Developers',
    verdictWhenToUse: 'Choose for native iOS/Android applications, field operations tools, and mobile-first consumer apps needing offline synchronization.'
  },
  [ArchType.ContainerNative]: {
    scalabilityScore: 9,
    scalabilityDesc: 'Orchestrated container pods (Kubernetes) with HPA / KEDA auto-scaling.',
    elasticityType: 'Horizontal Pod Auto-scaler (HPA) & Node Auto-provisioning',
    maxRpsCapacity: '100,000+ RPS',
    dataPartitioningStrategy: 'StatefulSets with persistent volume claims or external cloud DBs',
    latencyScore: 7,
    p99Latency: '15ms - 45ms (Service Mesh ingress routing)',
    networkHopOverhead: '2 - 4 hops inside K8s overlay network',
    serializationOverhead: 'Standard JSON / gRPC',
    devEffortScore: 8,
    devSpeed: 'Moderate (Requires Dockerfile & K8s manifest drafting)',
    opsOverhead: 'High (Kubernetes cluster maintenance & security patching)',
    localDebugging: 'Moderate (Minikube / Kind / Docker Desktop)',
    cicdComplexity: 'High (GitOps, Helm, ArgoCD pipelines)',
    costEfficiencyScore: 6,
    baselineIdleCost: '$150 - $500 / month (K8s control plane node minimums)',
    costCurveAtScale: 'Highly efficient node bin-packing',
    resourceEfficiency: 'Very High (Bin-packed CPU & memory requests)',
    blastRadius: 'Pod-isolated or Namespace-isolated',
    faultTolerance: 'Very High (Self-healing pods & automated health checks)',
    idealTeamSize: '10 - 50 Developers',
    verdictWhenToUse: 'Choose for cloud-agnostic enterprise applications, multi-cloud deployments, containerized microservices, and platforms using Kubernetes.'
  },
  [ArchType.GitOps]: {
    scalabilityScore: 8,
    scalabilityDesc: 'Declarative infrastructure scaling via Git commit state synchronization.',
    elasticityType: 'Automated IaC Cluster Expansion',
    maxRpsCapacity: 'Unlimited (Depends on underlying provisioned target infra)',
    dataPartitioningStrategy: 'Managed via Terraform / Pulumi modules & State locking',
    latencyScore: 8,
    p99Latency: 'N/A (Control plane infrastructure automation model)',
    networkHopOverhead: 'Zero application runtime overhead',
    serializationOverhead: 'YAML / HCL state reconciliation',
    devEffortScore: 6,
    devSpeed: 'Rapid after IaC module library is established',
    opsOverhead: 'Low to Medium (Automated GitOps controllers like ArgoCD/Flux)',
    localDebugging: 'Easy (Dry-run terraform plan / helm diff)',
    cicdComplexity: 'High (Git pull request workflows & automated state rollbacks)',
    costEfficiencyScore: 8,
    baselineIdleCost: '$10 - $50 / month (GitOps agent footprint)',
    costCurveAtScale: 'Strictly deterministic cloud infrastructure expenditure',
    resourceEfficiency: 'High (Eliminates zombie infrastructure drift)',
    blastRadius: 'Controlled by Git branch protection & policy engines',
    faultTolerance: 'Extreme (Instant disaster recovery by re-applying Git state)',
    idealTeamSize: '3 - 30 Platform & DevOps Engineers',
    verdictWhenToUse: 'Choose for managing infrastructure-as-code, multi-cluster Kubernetes fleets, strict SOC2 compliance auditing, and cloud disaster recovery.'
  },
  [ArchType.Reactive]: {
    scalabilityScore: 10,
    scalabilityDesc: 'Non-blocking backpressure-aware message passing (Akka / Reactor).',
    elasticityType: 'Elastic Actor Placement & Stream Backpressure',
    maxRpsCapacity: '250,000+ RPS per node cluster',
    dataPartitioningStrategy: 'Event-driven persistent actors & in-memory stream buffers',
    latencyScore: 9,
    p99Latency: '1ms - 10ms (Non-blocking async event loop)',
    networkHopOverhead: '1 - 2 hops (Location transparent actor messaging)',
    serializationOverhead: 'Binary serialization (Kryo / Protobuf)',
    devEffortScore: 9,
    devSpeed: 'Slow (Requires deep understanding of reactive streams & actors)',
    opsOverhead: 'High (Stateful cluster node management)',
    localDebugging: 'Complex (Asynchronous actor call chains)',
    cicdComplexity: 'High (Stateful rolling cluster restarts)',
    costEfficiencyScore: 9,
    baselineIdleCost: '$100 - $400 / month',
    costCurveAtScale: 'Extremely efficient hardware utilization',
    resourceEfficiency: 'Maximum (Zero thread blocking on I/O)',
    blastRadius: 'Actor instance isolated with supervision hierarchies',
    faultTolerance: 'Extreme (Self-healing actor supervision trees)',
    idealTeamSize: '8 - 30 Senior Engineers',
    verdictWhenToUse: 'Choose for high-frequency trading platforms, real-time gaming backends, chat platforms, and high-concurrency streaming telemetry.'
  },
  [ArchType.SpaceBased]: {
    scalabilityScore: 10,
    scalabilityDesc: 'Tuple-space memory grids eliminating central database bottlenecks.',
    elasticityType: 'Dynamic In-Memory Grid Node Partitioning',
    maxRpsCapacity: '1,000,000+ RPS (Linear scale with RAM grid additions)',
    dataPartitioningStrategy: 'In-Memory Processing Units with asynchronous mirror database persist',
    latencyScore: 10,
    p99Latency: '< 1ms - 3ms (RAM-speed access)',
    networkHopOverhead: 'Zero DB network hops (Data co-located with processing unit)',
    serializationOverhead: 'Zero copy RAM memory structures',
    devEffortScore: 10,
    devSpeed: 'Slow (Requires specialized grid middleware & transactional state reasoning)',
    opsOverhead: 'Very High (Grid split-brain prevention & RAM replication)',
    localDebugging: 'Very Complex (Grid cluster emulation)',
    cicdComplexity: 'Very High (In-memory grid schema evolution)',
    costEfficiencyScore: 4,
    baselineIdleCost: '$800 - $4,000 / month (High-RAM instance clusters)',
    costCurveAtScale: 'Expensive RAM footprint, but unparalleled speed',
    resourceEfficiency: 'High CPU/RAM execution speed',
    blastRadius: 'Processing unit partition isolated',
    faultTolerance: 'High (In-memory active-active backup replication)',
    idealTeamSize: '10 - 40 Principal Engineers',
    verdictWhenToUse: 'Choose for ultra-high throughput applications like airline reservation systems, tick-by-tick stock exchanges, and high-concurrency betting engines.'
  },
  [ArchType.EdgeComputing]: {
    scalabilityScore: 10,
    scalabilityDesc: 'Global distribution across 300+ CDN Point-of-Presence (PoP) locations.',
    elasticityType: 'Global Anycast Edge Auto-routing',
    maxRpsCapacity: '1,000,000+ Global RPS (Absorbed at edge nodes)',
    dataPartitioningStrategy: 'Distributed Edge Key-Value & Globally Replicated Vector DBs',
    latencyScore: 10,
    p99Latency: '2ms - 15ms (Served from closest geographic PoP)',
    networkHopOverhead: 'Zero origin server hops for cached / edge compute logic',
    serializationOverhead: 'Minimal V8 isolate serialization',
    devEffortScore: 6,
    devSpeed: 'Moderate (Edge V8 runtime constraints)',
    opsOverhead: 'Low (Fully managed Cloudflare Workers / Fastly Compute@Edge)',
    localDebugging: 'Moderate (Edge CLI emulators)',
    cicdComplexity: 'Medium (Global deployment propagation)',
    costEfficiencyScore: 8,
    baselineIdleCost: '$5 - $50 / month',
    costCurveAtScale: 'Highly cost efficient for global traffic distribution',
    resourceEfficiency: 'Maximum (Short-lived V8 isolates)',
    blastRadius: 'Geographic PoP isolated',
    faultTolerance: 'Extreme (Anycast automatically reroutes around regional outages)',
    idealTeamSize: '2 - 15 Developers',
    verdictWhenToUse: 'Choose for global low-latency APIs, A/B testing gateways, personalized web content, geo-fencing, and distributed AI edge inference.'
  }
};

export const PRESET_COMPARISONS: Array<{
  label: string;
  archA: ArchType;
  archB: ArchType;
  tag: string;
  icon: string;
}> = [
  { label: 'Monolithic vs. Microservices', archA: ArchType.Monolithic, archB: ArchType.Microservices, tag: 'Classic Paradigm', icon: '🏛️ vs 🧩' },
  { label: 'Event-Driven vs. Monolithic', archA: ArchType.EventDriven, archB: ArchType.Monolithic, tag: 'Async vs Sync', icon: '⚡ vs 🏛️' },
  { label: 'Serverless vs. Microservices', archA: ArchType.Serverless, archB: ArchType.Microservices, tag: 'Ops & Cost', icon: '☁️ vs 🧩' },
  { label: 'Space-Based vs. Microservices', archA: ArchType.SpaceBased, archB: ArchType.Microservices, tag: 'Extreme Scale', icon: '🌌 vs 🧩' },
  { label: 'Reactive vs. Event-Driven', archA: ArchType.Reactive, archB: ArchType.EventDriven, tag: 'Concurrency', icon: '🚀 vs ⚡' },
  { label: 'Edge Computing vs. Web-Oriented', archA: ArchType.EdgeComputing, archB: ArchType.WebOriented, tag: 'Latency & Geo', icon: '🌐 vs 💻' },
  { label: 'Container-Native vs. GitOps & IaC', archA: ArchType.ContainerNative, archB: ArchType.GitOps, tag: 'DevOps & Infra', icon: '📦 vs 🛠️' },
  { label: 'Layered vs. SOA', archA: ArchType.Layered, archB: ArchType.SOA, tag: 'Enterprise', icon: '🥞 vs 🔌' },
];

export const ArchitectureComparisonReportModal: React.FC<ArchitectureComparisonReportModalProps> = ({
  initialArchA = ArchType.Monolithic,
  initialArchB = ArchType.Microservices,
  onClose,
  onAskAI
}) => {
  const [archA, setArchA] = useState<ArchType>(initialArchA);
  const [archB, setArchB] = useState<ArchType>(initialArchB);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [highlightDiffsOnly, setHighlightDiffsOnly] = useState<boolean>(false);

  const dataA = ARCHITECTURE_DETAILS[archA];
  const dataB = ARCHITECTURE_DETAILS[archB];

  const profileA = ARCHITECTURE_METRICS[archA];
  const profileB = ARCHITECTURE_METRICS[archB];

  const allArchTypes = Object.values(ArchType);

  const handleSwap = () => {
    setArchA(archB);
    setArchB(archA);
  };

  const handleApplyPreset = (a: ArchType, b: ArchType) => {
    setArchA(a);
    setArchB(b);
  };

  // Generate Markdown summary for clipboard export
  const generateMarkdownReport = useMemo(() => {
    return `# Architecture Comparison Report: ${dataA.title} vs. ${dataB.title}
Generated by Enterprise Architecture Studio

## Executive Summary
- **${dataA.title}**: ${profileA.verdictWhenToUse}
- **${dataB.title}**: ${profileB.verdictWhenToUse}

---

## 1. Scalability Profile
| Dimension | ${dataA.title} | ${dataB.title} |
| :--- | :--- | :--- |
| **Scalability Rating** | ${profileA.scalabilityScore}/10 | ${profileB.scalabilityScore}/10 |
| **Elasticity Model** | ${profileA.elasticityType} | ${profileB.elasticityType} |
| **Max RPS Capacity** | ${profileA.maxRpsCapacity} | ${profileB.maxRpsCapacity} |
| **Data Partitioning** | ${profileA.dataPartitioningStrategy} | ${profileB.dataPartitioningStrategy} |

## 2. Latency & Performance Profile
| Dimension | ${dataA.title} | ${dataB.title} |
| :--- | :--- | :--- |
| **Latency Rating** | ${profileA.latencyScore}/10 | ${profileB.latencyScore}/10 |
| **Expected p99 Latency** | ${profileA.p99Latency} | ${profileB.p99Latency} |
| **Network Hop Overhead** | ${profileA.networkHopOverhead} | ${profileB.networkHopOverhead} |
| **Serialization Overhead** | ${profileA.serializationOverhead} | ${profileB.serializationOverhead} |

## 3. Developer Effort & Operational Profile
| Dimension | ${dataA.title} | ${dataB.title} |
| :--- | :--- | :--- |
| **Dev Effort / Complexity** | ${profileA.devEffortScore}/10 | ${profileB.devEffortScore}/10 |
| **Delivery Velocity** | ${profileA.devSpeed} | ${profileB.devSpeed} |
| **Ops Overhead** | ${profileA.opsOverhead} | ${profileB.opsOverhead} |
| **Local Debugging** | ${profileA.localDebugging} | ${profileB.localDebugging} |
| **CI/CD Pipeline** | ${profileA.cicdComplexity} | ${profileB.cicdComplexity} |

## 4. Cost Profile & Resource Efficiency
| Dimension | ${dataA.title} | ${dataB.title} |
| :--- | :--- | :--- |
| **Cost Efficiency Score** | ${profileA.costEfficiencyScore}/10 | ${profileB.costEfficiencyScore}/10 |
| **Baseline Idle Cost** | ${profileA.baselineIdleCost} | ${profileB.baselineIdleCost} |
| **Cost Scaling Trajectory** | ${profileA.costCurveAtScale} | ${profileB.costCurveAtScale} |
| **Resource Efficiency** | ${profileA.resourceEfficiency} | ${profileB.resourceEfficiency} |

## 5. Reliability & Fault Isolation
| Dimension | ${dataA.title} | ${dataB.title} |
| :--- | :--- | :--- |
| **Blast Radius** | ${profileA.blastRadius} | ${profileB.blastRadius} |
| **Fault Tolerance** | ${profileA.faultTolerance} | ${profileB.faultTolerance} |
| **Ideal Team Size** | ${profileA.idealTeamSize} | ${profileB.idealTeamSize} |

---
*Report exported from Enterprise Architecture Studio*
`;
  }, [dataA, dataB, profileA, profileB]);

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateMarkdownReport);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper for rendering score badge
  const renderScoreBar = (score: number, maxScore = 10, colorClass = 'bg-blue-500') => {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colorClass} transition-all duration-300`} 
            style={{ width: `${(score / maxScore) * 100}%` }}
          />
        </div>
        <span className="text-xs font-mono font-bold text-zinc-300 w-8 text-right">
          {score}/10
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200 print:bg-white print:text-black print:static print:inset-auto">
      
      {/* Top Header */}
      <div className="p-4 md:px-6 md:py-4 border-b border-zinc-800 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-3 shadow-lg shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 text-indigo-400">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                Architecture Comparison Report
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-mono font-semibold">
                Side-by-Side Analysis
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Compare scalability, latency, developer effort, and cost profiles between architectural styles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyReport}
            className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700 transition-colors flex items-center gap-1.5"
            title="Copy formatted Markdown comparison report"
          >
            {copiedReport ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Report Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700 transition-colors flex items-center gap-1.5 hidden sm:flex"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-400" />
            <span>Print Report</span>
          </button>

          {onAskAI && (
            <button
              type="button"
              onClick={() => {
                onAskAI(`Can you give me a deep-dive technical architectural trade-off analysis between ${dataA.title} and ${dataB.title}? What are the key migration risks, database strategy differences, and team organizational impacts?`);
                onClose();
              }}
              className="py-1.5 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Assistant</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar space-y-6">

        {/* Selector Header Bar */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-4 shadow-xl print:hidden">
          
          {/* Presets Row */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                Quick Preset Comparisons
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 hover:text-zinc-200">
                <input
                  type="checkbox"
                  checked={highlightDiffsOnly}
                  onChange={(e) => setHighlightDiffsOnly(e.target.checked)}
                  className="rounded bg-zinc-950 border-zinc-700 text-indigo-500 focus:ring-0"
                />
                <span>Highlight Key Divergences</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESET_COMPARISONS.map((preset, idx) => {
                const isActive = (archA === preset.archA && archB === preset.archB) || (archA === preset.archB && archB === preset.archA);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset.archA, preset.archB)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md scale-105'
                        : 'bg-zinc-950/70 hover:bg-zinc-800 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Architecture Selectors Row */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center pt-2 border-t border-zinc-800/80">
            
            {/* Arch A Selector */}
            <div className="md:col-span-5 bg-zinc-950 p-3.5 rounded-xl border border-indigo-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
                  Architecture A (Baseline)
                </span>
                <span className="text-[10px] text-zinc-400 font-mono px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/50">
                  {dataA.category}
                </span>
              </div>
              
              <select
                value={archA}
                onChange={(e) => setArchA(e.target.value as ArchType)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
              >
                {allArchTypes.map((type) => (
                  <option key={type} value={type} disabled={type === archB}>
                    {ARCHITECTURE_DETAILS[type].title} ({type})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center">
              <button
                type="button"
                onClick={handleSwap}
                className="p-3 bg-zinc-800 hover:bg-indigo-600 text-zinc-300 hover:text-white rounded-2xl border border-zinc-700 transition-all shadow-md group"
                title="Swap Architecture A and Architecture B"
              >
                <ArrowRightLeft className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>

            {/* Arch B Selector */}
            <div className="md:col-span-5 bg-zinc-950 p-3.5 rounded-xl border border-purple-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
                  Architecture B (Challenger)
                </span>
                <span className="text-[10px] text-zinc-400 font-mono px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/50">
                  {dataB.category}
                </span>
              </div>

              <select
                value={archB}
                onChange={(e) => setArchB(e.target.value as ArchType)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-purple-500"
              >
                {allArchTypes.map((type) => (
                  <option key={type} value={type} disabled={type === archA}>
                    {ARCHITECTURE_DETAILS[type].title} ({type})
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Architectural Verdict / Decision Matrix Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Arch A Verdict Card */}
          <div className="bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-950 border border-indigo-900/50 p-4 rounded-2xl space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <span className="p-1 rounded bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold">A</span>
                <span>{dataA.title}</span>
              </h3>
              <span className="text-[11px] font-mono text-zinc-400">Score: {profileA.scalabilityScore + profileA.latencyScore + profileA.costEfficiencyScore}/30</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed italic border-l-2 border-indigo-500 pl-3">
              "{profileA.verdictWhenToUse}"
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] bg-zinc-900 text-indigo-300 px-2 py-0.5 rounded-md border border-zinc-800 font-mono">
                Team: {profileA.idealTeamSize}
              </span>
              <span className="text-[10px] bg-zinc-900 text-emerald-300 px-2 py-0.5 rounded-md border border-zinc-800 font-mono">
                Idle: {profileA.baselineIdleCost}
              </span>
              <span className="text-[10px] bg-zinc-900 text-amber-300 px-2 py-0.5 rounded-md border border-zinc-800 font-mono">
                p99: {profileA.p99Latency}
              </span>
            </div>
          </div>

          {/* Arch B Verdict Card */}
          <div className="bg-gradient-to-br from-purple-950/40 via-zinc-900 to-zinc-950 border border-purple-900/50 p-4 rounded-2xl space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                <span className="p-1 rounded bg-purple-500/20 text-purple-400 text-xs font-mono font-bold">B</span>
                <span>{dataB.title}</span>
              </h3>
              <span className="text-[11px] font-mono text-zinc-400">Score: {profileB.scalabilityScore + profileB.latencyScore + profileB.costEfficiencyScore}/30</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed italic border-l-2 border-purple-500 pl-3">
              "{profileB.verdictWhenToUse}"
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] bg-zinc-900 text-purple-300 px-2 py-0.5 rounded-md border border-zinc-800 font-mono">
                Team: {profileB.idealTeamSize}
              </span>
              <span className="text-[10px] bg-zinc-900 text-emerald-300 px-2 py-0.5 rounded-md border border-zinc-800 font-mono">
                Idle: {profileB.baselineIdleCost}
              </span>
              <span className="text-[10px] bg-zinc-900 text-amber-300 px-2 py-0.5 rounded-md border border-zinc-800 font-mono">
                p99: {profileB.p99Latency}
              </span>
            </div>
          </div>

        </div>

        {/* Visual Scorecard Matrix */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-5 space-y-4 shadow-xl">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            Core Dimension Scorecards Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Scalability Comparison */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Scalability & Elasticity Profile
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Higher = Better Scale</span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-medium text-indigo-300 mb-1">
                    <span>{dataA.title}</span>
                  </div>
                  {renderScoreBar(profileA.scalabilityScore, 10, 'bg-indigo-500')}
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-purple-300 mb-1">
                    <span>{dataB.title}</span>
                  </div>
                  {renderScoreBar(profileB.scalabilityScore, 10, 'bg-purple-500')}
                </div>
              </div>
            </div>

            {/* Latency Comparison */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Latency & Execution Speed Profile
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Higher = Lower Latency</span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-medium text-indigo-300 mb-1">
                    <span>{dataA.title}</span>
                  </div>
                  {renderScoreBar(profileA.latencyScore, 10, 'bg-indigo-500')}
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-purple-300 mb-1">
                    <span>{dataB.title}</span>
                  </div>
                  {renderScoreBar(profileB.latencyScore, 10, 'bg-purple-500')}
                </div>
              </div>
            </div>

            {/* Developer Effort Comparison */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-rose-400" />
                  Dev & Operational Effort (Complexity)
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Higher = More Complex</span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-medium text-indigo-300 mb-1">
                    <span>{dataA.title}</span>
                  </div>
                  {renderScoreBar(profileA.devEffortScore, 10, 'bg-indigo-500')}
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-purple-300 mb-1">
                    <span>{dataB.title}</span>
                  </div>
                  {renderScoreBar(profileB.devEffortScore, 10, 'bg-purple-500')}
                </div>
              </div>
            </div>

            {/* Cost Efficiency Comparison */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Cost Efficiency Profile at Scale
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Higher = More Efficient</span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-medium text-indigo-300 mb-1">
                    <span>{dataA.title}</span>
                  </div>
                  {renderScoreBar(profileA.costEfficiencyScore, 10, 'bg-indigo-500')}
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-purple-300 mb-1">
                    <span>{dataB.title}</span>
                  </div>
                  {renderScoreBar(profileB.costEfficiencyScore, 10, 'bg-purple-500')}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Detailed Side-by-Side Comparison Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Side-by-Side Architectural Technical Matrix
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              Comparing {dataA.title} vs {dataB.title}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 font-mono text-[11px]">
                  <th className="p-3.5 font-bold uppercase w-1/4">Technical Metric</th>
                  <th className="p-3.5 font-bold uppercase w-3/8 text-indigo-300 bg-indigo-950/20 border-l border-zinc-800">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      {dataA.title}
                    </span>
                  </th>
                  <th className="p-3.5 font-bold uppercase w-3/8 text-purple-300 bg-purple-950/20 border-l border-zinc-800">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      {dataB.title}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">

                {/* Section: Scalability Profile */}
                <tr className="bg-zinc-950/80 font-mono font-bold text-amber-400 border-t border-b border-zinc-800">
                  <td colSpan={3} className="px-3.5 py-2 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    1. Scalability Profile
                  </td>
                </tr>

                <tr className={`hover:bg-zinc-800/40 transition-colors ${highlightDiffsOnly && profileA.elasticityType === profileB.elasticityType ? 'opacity-40' : ''}`}>
                  <td className="p-3.5 font-semibold text-zinc-300">Elasticity Model</td>
                  <td className="p-3.5 text-zinc-200 bg-indigo-950/10 border-l border-zinc-800 font-mono">{profileA.elasticityType}</td>
                  <td className="p-3.5 text-zinc-200 bg-purple-950/10 border-l border-zinc-800 font-mono">{profileB.elasticityType}</td>
                </tr>

                <tr className={`hover:bg-zinc-800/40 transition-colors ${highlightDiffsOnly && profileA.maxRpsCapacity === profileB.maxRpsCapacity ? 'opacity-40' : ''}`}>
                  <td className="p-3.5 font-semibold text-zinc-300">Max Throughput (RPS)</td>
                  <td className="p-3.5 text-zinc-200 bg-indigo-950/10 border-l border-zinc-800 font-mono">{profileA.maxRpsCapacity}</td>
                  <td className="p-3.5 text-zinc-200 bg-purple-950/10 border-l border-zinc-800 font-mono">{profileB.maxRpsCapacity}</td>
                </tr>

                <tr className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 font-semibold text-zinc-300">Data Partitioning Strategy</td>
                  <td className="p-3.5 text-zinc-200 bg-indigo-950/10 border-l border-zinc-800">{profileA.dataPartitioningStrategy}</td>
                  <td className="p-3.5 text-zinc-200 bg-purple-950/10 border-l border-zinc-800">{profileB.dataPartitioningStrategy}</td>
                </tr>

                {/* Section: Latency Profile */}
                <tr className="bg-zinc-950/80 font-mono font-bold text-blue-400 border-t border-b border-zinc-800">
                  <td colSpan={3} className="px-3.5 py-2 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    2. Latency & Performance Profile
                  </td>
                </tr>

                <tr className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 font-semibold text-zinc-300">Expected p99 Latency</td>
                  <td className="p-3.5 text-zinc-200 bg-indigo-950/10 border-l border-zinc-800 font-mono text-emerald-400">{profileA.p99Latency}</td>
                  <td className="p-3.5 text-zinc-200 bg-purple-950/10 border-l border-zinc-800 font-mono text-emerald-400">{profileB.p99Latency}</td>
                </tr>

                <tr className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 font-semibold text-zinc-300">Network Hop Overhead</td>
                  <td className="p-3.5 text-zinc-200 bg-indigo-950/10 border-l border-zinc-800">{profileA.networkHopOverhead}</td>
                  <td className="p-3.5 text-zinc-200 bg-purple-950/10 border-l border-zinc-800">{profileB.networkHopOverhead}</td>
                </tr>

                <tr className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 font-semibold text-zinc-300">Serialization Overhead</td>
                  <td className="p-3.5 text-zinc-200 bg-indigo-950/10 border-l border-zinc-800">{profileA.serializationOverhead}</td>
                  <td className="p-3.5 text-zinc-200 bg-purple-950/10 border-l border-zinc-800">{profileB.serializationOverhead}</td>
                </tr>

                {/* Section: Developer Effort Profile */}
                <tr className="bg-zinc-950/80 font-mono font-bold text-rose-400 border-t border-b border-zinc-800">
                  <td colSpan={3} className="px-3.5 py-2 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    3. Developer Effort & Operational Profile
                  </td>
                </tr>

                <tr className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 font-semibold text-zinc-300">Development Velocity</td>
                  <td className="p-3.5 text-zinc-200 bg-indigo-950/10 border-l border-zinc-800">{profileA.devSpeed}</td>
                  <td className="p-3.5 text-zinc-200 bg-purple-950/10 border-l border-zinc-800">{profileB.devSpeed}</td>
                </tr>

                <tr className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 font-semibold text-zinc-300">Operational Overhead</td>
                  <td className="p-3.5 text-zinc-200 bg-indigo-950/10 border-l border-zinc-800">{profileA.opsOverhead}</td>
                  <td className="p-3.5 text-zinc-200 bg-purple-950/10 border-l border-zinc-800">{profileB.opsOverhead}</td>
                </tr>

                <tr className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 font-semibold text-zinc-300">Local Debugging Experience</td>
                  <td className="p-3.5 text-zinc-200 bg-indigo-950/10 border-l border-zinc-800">{profileA.localDebugging}</td>
                  <td className="p-3.5 text-zinc-200 bg-purple-950/10 border-l border-zinc-800">{profileB.localDebugging}</td>
                </tr>

                <tr className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 font-semibold text-zinc-300">CI/CD Pipeline Complexity</td>
                  <td className="p-3.5 text-zinc-200 bg-indigo-950/10 border-l border-zinc-800">{profileA.cicdComplexity}</td>
                  <td className="p-3.5 text-zinc-200 bg-purple-950/10 border-l border-zinc-800">{profileB.cicdComplexity}</td>
                </tr>

                {/* Section: Cost Profile */}
                <tr className="bg-zinc-950/80 font-mono font-bold text-emerald-400 border-t border-b border-zinc-800">
                  <td colSpan={3} className="px-3.5 py-2 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    4. Cost Profile & Resource Efficiency
                  </td>
                </tr>

                <tr className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 font-semibold text-zinc-300">Baseline Idle Infra Cost</td>
                  <td className="p-3.5 text-zinc-200 bg-indigo-950/10 border-l border-zinc-800 font-mono text-emerald-300">{profileA.baselineIdleCost}</td>
                  <td className="p-3.5 text-zinc-200 bg-purple-950/10 border-l border-zinc-800 font-mono text-emerald-300">{profileB.baselineIdleCost}</td>
                </tr>

                <tr className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 font-semibold text-zinc-300">Cost Trajectory at 10x Scale</td>
                  <td className="p-3.5 text-zinc-200 bg-indigo-950/10 border-l border-zinc-800">{profileA.costCurveAtScale}</td>
                  <td className="p-3.5 text-zinc-200 bg-purple-950/10 border-l border-zinc-800">{profileB.costCurveAtScale}</td>
                </tr>

                <tr className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 font-semibold text-zinc-300">Compute Resource Efficiency</td>
                  <td className="p-3.5 text-zinc-200 bg-indigo-950/10 border-l border-zinc-800">{profileA.resourceEfficiency}</td>
                  <td className="p-3.5 text-zinc-200 bg-purple-950/10 border-l border-zinc-800">{profileB.resourceEfficiency}</td>
                </tr>

                {/* Section: Reliability & Organization */}
                <tr className="bg-zinc-950/80 font-mono font-bold text-purple-400 border-t border-b border-zinc-800">
                  <td colSpan={3} className="px-3.5 py-2 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    5. Fault Tolerance & Team Structure
                  </td>
                </tr>

                <tr className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 font-semibold text-zinc-300">Failure Blast Radius</td>
                  <td className="p-3.5 text-zinc-200 bg-indigo-950/10 border-l border-zinc-800">{profileA.blastRadius}</td>
                  <td className="p-3.5 text-zinc-200 bg-purple-950/10 border-l border-zinc-800">{profileB.blastRadius}</td>
                </tr>

                <tr className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 font-semibold text-zinc-300">Fault Isolation & Recovery</td>
                  <td className="p-3.5 text-zinc-200 bg-indigo-950/10 border-l border-zinc-800">{profileA.faultTolerance}</td>
                  <td className="p-3.5 text-zinc-200 bg-purple-950/10 border-l border-zinc-800">{profileB.faultTolerance}</td>
                </tr>

                <tr className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 font-semibold text-zinc-300">Ideal Engineering Team Size</td>
                  <td className="p-3.5 text-zinc-200 bg-indigo-950/10 border-l border-zinc-800 font-bold">{profileA.idealTeamSize}</td>
                  <td className="p-3.5 text-zinc-200 bg-purple-950/10 border-l border-zinc-800 font-bold">{profileB.idealTeamSize}</td>
                </tr>

                <tr className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 font-semibold text-zinc-300">Technology Stack</td>
                  <td className="p-3.5 text-zinc-200 bg-indigo-950/10 border-l border-zinc-800">
                    <div className="flex flex-wrap gap-1">
                      {dataA.technologyStack.map((tech, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-zinc-800 text-[10px] text-zinc-300 rounded border border-zinc-700">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3.5 text-zinc-200 bg-purple-950/10 border-l border-zinc-800">
                    <div className="flex flex-wrap gap-1">
                      {dataB.technologyStack.map((tech, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-zinc-800 text-[10px] text-zinc-300 rounded border border-zinc-700">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Footer Bar */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex justify-between items-center shrink-0 print:hidden">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Metrics are derived from enterprise benchmark data, industry SLAs, and operational profiles.</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-colors"
        >
          Close Report
        </button>
      </div>

    </div>
  );
};
