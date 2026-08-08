export interface FdeCompetency {
  id: string;
  title: string;
  level: 'Core' | 'Advanced' | 'Expert';
  description: string;
  skills: string[];
}

export interface FdeCodeArtifact {
  title: string;
  language: string;
  filename: string;
  description: string;
  code: string;
}

export interface FdePhase {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  estimatedWeeks: string;
  icon: string;
  themeColor: string;
  badgeBg: string;
  borderColor: string;
  activeGradient: string;
  overview: string;
  strategicImportance: string;
  coreObjectives: string[];
  keyArchitecturalConcepts: {
    title: string;
    description: string;
    tradeoffs: string;
  }[];
  realWorldScenario: {
    client: string;
    challenge: string;
    solution: string;
    impact: string;
  };
  competencies: FdeCompetency[];
  codeArtifact: FdeCodeArtifact;
  interviewQuestions: {
    question: string;
    expectedAnswer: string;
    redFlags: string;
  }[];
}

export interface FdeStudyResource {
  id: string;
  title: string;
  category: 'System Design' | 'Data & Ontology' | 'Air-Gapped Infra' | 'Enterprise AI' | 'Client Leadership' | 'Security & Compliance';
  readTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  summary: string;
  keyTakeaways: string[];
  content: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
}

export interface FdeCaseStudy {
  id: string;
  title: string;
  companyArchetype: string;
  contractValue: string;
  timeframe: string;
  situation: string;
  fdePlaybook: string[];
  architectureDiagramSnippet: string;
  outcome: string;
  lessonsLearned: string[];
}

export interface FdeQuizQuestion {
  id: number;
  phaseId: number;
  question: string;
  scenario?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  competencyArea: string;
}

export interface FdeFlashcard {
  id: number;
  category: string;
  front: string;
  back: string;
  codeSample?: string;
}

export const FDE_ROADMAP_PHASES: FdePhase[] = [
  {
    id: 1,
    slug: 'discovery-and-scoping',
    title: 'Phase 1: Enterprise Discovery, Technical Scoping & Client Architecture Mapping',
    subtitle: 'Mastering the first 14 days on client ground: Reverse engineering data estates, security boundaries, and defining high-velocity POC SOWs.',
    estimatedWeeks: 'Weeks 1 – 3',
    icon: '🔍',
    themeColor: 'cyan',
    badgeBg: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    borderColor: 'border-cyan-800/60',
    activeGradient: 'from-cyan-600 to-blue-600',
    overview: 'The Forward Deployed Engineer is dropped into messy, undocumented enterprise topologies. Unlike traditional software engineers who build against clean Jira tickets, FDEs must interview non-technical executives, interrogate legacy Oracle/SAP DBAs, identify firewall and VPN choke points, and map out a bulletproof Statement of Work (SOW).',
    strategicImportance: '80% of enterprise software deals fail not due to algorithmic weakness, but because the vendor failed to anticipate VPC network routing, data ingress latency, or Infosec compliance blockers.',
    coreObjectives: [
      'Conduct multi-stakeholder technical discovery (C-suite business sponsors vs. skeptical DBA/Infosec leads).',
      'Audit existing data schemas, batch sync cadences, and identify data silos (SAP, Salesforce, Mainframes, Snowflake).',
      'Define clear Scope Boundaries & Anti-Scope for a 14-day or 30-day Proof of Concept (POC).',
      'Draft Architecture Decision Records (ADRs) with measurable KPI benchmarks (latency <200ms, data freshness <15m).'
    ],
    keyArchitecturalConcepts: [
      {
        title: 'Zero-Trust Network Perimeter & Ingress Topology',
        description: 'Mapping corporate firewalls, AWS PrivateLink, Azure ExpressRoute, proxy whitelists, and self-hosted bastion jumping.',
        tradeoffs: 'Direct VPC peering is fastest to set up but triggers intense Infosec scrutiny; AWS PrivateLink / Azure Private Endpoints take longer to configure but offer maximum security isolation.'
      },
      {
        title: 'Brownfield vs. Greenfield Integration Boundaries',
        description: 'Determining where the core platform acts as a system of record vs. an operational overlay on top of legacy mainframes and data warehouses.',
        tradeoffs: 'Writing back to legacy databases creates transactional risk; read-only operational overlays reduce risk but require custom event streaming synchronization.'
      },
      {
        title: 'POC Kill-Criteria & Milestone Gating',
        description: 'Establishing objective, binary technical success criteria with the client VP of Engineering before writing a single line of code.',
        tradeoffs: 'Vague success criteria make sales happier upfront but guarantee endless unpaid scope creep later.'
      }
    ],
    realWorldScenario: {
      client: 'Tier-1 Global Commercial Bank ($45B AUM)',
      challenge: 'Client wanted real-time loan risk analysis, but loan documents were trapped in an on-premises 20-year-old IBM DB2 database accessible only via a Citrix jumpbox with no internet access.',
      solution: 'The FDE designed an offline agentic data extractor running inside a local Docker container that wrote encrypted parquet batches to a local MinIO bucket, synced once every 10 minutes over a dedicated private direct connect.',
      impact: 'Delivered an interactive loan intelligence dashboard in 11 days, securing a $4.8M multi-year enterprise license.'
    },
    competencies: [
      {
        id: 'comp-1-1',
        title: 'Enterprise Discovery & Stakeholder Triangulation',
        level: 'Core',
        description: 'Ability to interview engineering leads, security architects, and business operators to construct an accurate system topography diagram.',
        skills: ['C4 Architecture Diagramming', 'Discovery Questionnaires', 'Security Boundary Mapping', 'Stakeholder Alignment']
      },
      {
        id: 'comp-1-2',
        title: 'Proof-of-Concept (POC) SOW Scoping & Execution',
        level: 'Advanced',
        description: 'Designing time-boxed, high-impact 2-to-4 week pilot programs with unambiguous quantitative success metrics.',
        skills: ['SOW Authoring', 'Risk Matrix Modeling', 'Resource Allocation', 'Milestone Gating']
      },
      {
        id: 'comp-1-3',
        title: 'Information Security & Compliance Auditing',
        level: 'Expert',
        description: 'Navigating SOC2 Type II, ISO 27001, HIPAA BAA, FedRAMP High, and GDPR data sovereignty requirements on client ground.',
        skills: ['Infosec Questionnaires', 'Data Flow Diagrams (DFDs)', 'PII Redaction Policies', 'Air-Gap Feasibility Analysis']
      }
    ],
    codeArtifact: {
      title: 'Enterprise Discovery & SOW Specification Generator',
      language: 'typescript',
      filename: 'enterprise_poc_spec_blueprint.ts',
      description: 'Production TypeScript specification model for validating client technical prerequisites, networking boundaries, and quantitative success gates.',
      code: `/**
 * Architecture Decision Record & POC Technical Specification Model
 * Used by Forward Deployed Engineers to formalize client deployments.
 */

export interface ClientDiscoveryProfile {
  clientName: string;
  industry: 'FinTech' | 'Healthcare' | 'Defense' | 'Retail' | 'SupplyChain';
  deploymentTarget: 'Client_AWS_VPC' | 'Azure_Confidential' | 'OnPrem_AirGapped' | 'SaaS_PrivateLink';
  securityClearance: 'Public' | 'SOC2_Type2' | 'HIPAA' | 'FedRAMP_High' | 'IL5_Defense';
  primaryDataSources: {
    sourceType: 'Oracle' | 'SAP_HANA' | 'Snowflake' | 'IBM_DB2' | 'Kafka' | 'S3_Parquet';
    estimatedVolumeGB: number;
    syncCadence: 'Realtime_CDC' | 'Hourly_Batch' | 'Daily_Batch';
    networkConnectivity: 'Public_Internet' | 'VPN_IPSec' | 'PrivateLink' | 'AirGapped_Sneakernet';
  }[];
  pocTimelineWeeks: 2 | 3 | 4;
  successGates: {
    metric: string;
    targetValue: string;
    validationMethod: string;
    isMandatory: boolean;
  }[];
}

export class FdePocScoper {
  public static evaluateFeasibility(profile: ClientDiscoveryProfile): {
    feasibilityScore: number; // 0 - 100
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    blockers: string[];
    recommendedInfra: string[];
  } {
    const blockers: string[] = [];
    const recommendedInfra: string[] = [];
    let score = 100;

    // Check for air-gapped constraints
    if (profile.deploymentTarget === 'OnPrem_AirGapped') {
      score -= 20;
      recommendedInfra.push('Offline Harbor Container Registry', 'Embedded K3s Cluster', 'MinIO Object Store');
      if (profile.pocTimelineWeeks < 3) {
        blockers.push('Air-gapped on-prem deployments require minimum 3 weeks for hardware and firewall provisioning.');
      }
    }

    // Check high compliance
    if (profile.securityClearance === 'FedRAMP_High' || profile.securityClearance === 'IL5_Defense') {
      score -= 15;
      recommendedInfra.push('FIPS 140-2 Cryptographic Modules', 'Air-Gapped Model Weights Bundle', 'Zero-Egress Security Groups');
    }

    // Check data sync bottlenecks
    const hasDb2OrSap = profile.primaryDataSources.some(ds => ds.sourceType === 'IBM_DB2' || ds.sourceType === 'SAP_HANA');
    if (hasDb2OrSap) {
      score -= 10;
      recommendedInfra.push('Debezium Kafka CDC Connector', 'Intermediate Parquet Staging Lakehouse');
    }

    const riskLevel = score >= 80 ? 'LOW' : score >= 60 ? 'MEDIUM' : score >= 40 ? 'HIGH' : 'CRITICAL';

    return {
      feasibilityScore: Math.max(0, score),
      riskLevel,
      blockers,
      recommendedInfra
    };
  }
}`
    },
    interviewQuestions: [
      {
        question: 'You arrive on client site for day 1 of a 3-week POC. The client IT director informs you that the promised AWS VPC access will not be approved for another 10 days. How do you pivot without failing the POC timeline?',
        expectedAnswer: 'Immediately negotiate an on-premise local development environment or air-gapped staging laptop with simulated synthetic data schemas. Mock all upstream APIs using WireMock or Prism, build out the core data transformations and UI interfaces with mock payloads, and use the 10 days to validate business logic and user experience with end-users so that the remaining days are purely pipe-connecting.',
        redFlags: 'Waiting passively for the IT ticket to clear, blaming the sales team, or attempting unauthorized workarounds that violate corporate policy.'
      },
      {
        question: 'How do you prevent a client from moving the goalposts and demanding out-of-scope custom integrations at the end of a POC?',
        expectedAnswer: 'Draft a signed Technical Acceptance Criteria (TAC) document on Day 1 containing strict binary pass/fail conditions. When out-of-scope requests arise, acknowledge their value, log them immediately into a "Phase 2 Production Roadmap" document, and clarify that the current POC remains anchored to the agreed TAC.',
        redFlags: 'Saying yes to every client request and burning out, or bluntly refusing without capturing the commercial opportunity for Phase 2.'
      }
    ]
  },
  {
    id: 2,
    slug: 'data-pipelines-and-ontology',
    title: 'Phase 2: Enterprise Data Pipelines, Reverse ETL & Palantir-Style Ontologies',
    subtitle: 'Transforming messy relational schemas into semantically unified Object-Action-Relation (OAR) operational ontologies with sub-second queries.',
    estimatedWeeks: 'Weeks 4 – 7',
    icon: '🧬',
    themeColor: 'emerald',
    badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    borderColor: 'border-emerald-800/60',
    activeGradient: 'from-emerald-600 to-teal-600',
    overview: 'The superpower of top-tier FDEs (especially at companies like Palantir, Databricks, and Scale AI) is building an "Ontology". Enterprise data lives in 50 different normalized SQL tables, dirty CSVs, and API responses. The FDE creates an operational digital twin where business users interact with "Aircraft", "Patients", "Transactions", and "Supply Chains" rather than foreign keys and join tables.',
    strategicImportance: 'Raw data tables are incomprehensible to executive decision-makers. An operational ontology bridges the chasm between raw SQL storage and real-time operational workflows.',
    coreObjectives: [
      'Build resilient high-throughput ingestion pipelines using PySpark, Polars, DuckDB, and Kafka.',
      'Model Object-Action-Relation (OAR) schemas with bi-directional link traversal.',
      'Implement Change Data Capture (CDC) with Debezium and write-back reverse ETL integrations.',
      'Deploy automated data quality assertions and schema drift sentinels with Great Expectations.'
    ],
    keyArchitecturalConcepts: [
      {
        title: 'The Object-Action-Relation (OAR) Ontology Pattern',
        description: 'Objects represent business entities (e.g. Flight, Vessel, Loan). Actions represent validated state mutations (e.g. RerouteFlight, ApproveLoan). Relations represent graph links between objects.',
        tradeoffs: 'Graph and semantic overlays introduce query translation overhead but empower non-developers to execute atomic, auditable workflows across multiple legacy systems.'
      },
      {
        title: 'Real-Time CDC vs. Micro-Batch ELT',
        description: 'Capturing row-level write-ahead log (WAL) changes from relational databases using Debezium vs. periodic 5-minute parquet partition dumps.',
        tradeoffs: 'CDC gives sub-second freshness but requires database admin privileges and replication slots; Micro-batch is far easier to approve in corporate infosec environments.'
      },
      {
        title: 'Reverse ETL & Write-Back Integrity',
        description: 'Taking decisions made inside the operational application and safely writing updates back to legacy systems of record without breaking transactional locks.',
        tradeoffs: 'Direct SQL write-backs risk database locks; asynchronous outbox patterns with idempotent retry queues guarantee eventual consistency.'
      }
    ],
    realWorldScenario: {
      client: 'Global Air Cargo Logistics Operator ($12B Revenue)',
      challenge: 'Flight schedules were in Oracle, cargo weights were in SAP, maintenance logs were in MongoDB, and weather alerts came over REST. Operators were manually cross-referencing 4 screens to reroute delayed freight.',
      solution: 'The FDE team created an interactive "Flight Cargo Ontology" merging all 4 data streams in real time using Apache Flink and DuckDB, exposing unified Actions like "ReassignFreightPayload" with automatic capacity recalculation.',
      impact: 'Reduced flight delay incident resolution time from 45 minutes to 90 seconds, saving $28M in annual fuel and penalty costs.'
    },
    competencies: [
      {
        id: 'comp-2-1',
        title: 'Ontology Graph Modeling & Schema Synthesis',
        level: 'Core',
        description: 'Translating legacy relational schemas into unified entity-relationship graph models with type-safe properties and actions.',
        skills: ['Ontology Design', 'Graph Schema Modeling', 'GraphQL Federation', 'Entity Resolution']
      },
      {
        id: 'comp-2-2',
        title: 'High-Throughput Streaming & Batch Ingestion',
        level: 'Advanced',
        description: 'Designing data pipelines capable of handling 50k+ events/sec with zero packet loss in low-bandwidth client environments.',
        skills: ['PySpark', 'Polars', 'DuckDB', 'Kafka / Event Hubs', 'CDC with Debezium']
      },
      {
        id: 'comp-2-3',
        title: 'Reverse ETL & Outbox Pattern Implementations',
        level: 'Expert',
        description: 'Writing bi-directional synchronization engines that push operational decisions back to SAP/Salesforce/SQL without data corruption.',
        skills: ['Transactional Outbox Pattern', 'Idempotency Keys', 'Dead-Letter Queues', 'Optimistic Concurrency Control']
      }
    ],
    codeArtifact: {
      title: 'Operational Ontology & Action Engine Core',
      language: 'python',
      filename: 'enterprise_ontology_engine.py',
      description: 'Production Python engine modeling Palantir-style business objects, linked relations, and atomic transactional actions with audit logging.',
      code: `"""
Enterprise Operational Ontology Engine (Palantir / Foundry Architecture Pattern)
Defines semantic Object Types, Link Traversal, and Atomic Action Handlers.
"""

from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
import datetime
import uuid

@dataclass
class OntologyObject:
    object_type: str
    primary_key: str
    properties: Dict[str, Any]
    links: Dict[str, List[str]] = field(default_factory=dict) # relation_name -> list of target primary keys
    last_updated: datetime.datetime = field(default_factory=datetime.datetime.utcnow)

@dataclass
class ActionContext:
    user_id: str
    user_roles: List[str]
    timestamp: datetime.datetime
    audit_trace_id: str

class OntologyEngine:
    def __init__(self):
        self._objects: Dict[str, Dict[str, OntologyObject]] = {} # type -> {pk: obj}
        self._action_registry: Dict[str, Callable[[ActionContext, Dict[str, Any]], bool]] = {}

    def register_object(self, obj: OntologyObject) -> None:
        if obj.object_type not in self._objects:
            self._objects[obj.object_type] = {}
        self._objects[obj.object_type][obj.primary_key] = obj

    def link_objects(self, source_type: str, source_pk: str, relation: str, target_pk: str) -> None:
        source_obj = self._objects.get(source_type, {}).get(source_pk)
        if not source_obj:
            raise ValueError(f"Source object {source_type}:{source_pk} not found")
        if relation not in source_obj.links:
            source_obj.links[relation] = []
        if target_pk not in source_obj.links[relation]:
            source_obj.links[relation].append(target_pk)

    def execute_action(self, action_name: str, ctx: ActionContext, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Executes an auditable state mutation with role checks and outbox write-back."""
        if action_name not in self._action_registry:
            raise NotImplementedError(f"Action {action_name} is not registered in the ontology.")
        
        # 1. Audit log initiation
        print(f"[AUDIT {ctx.audit_trace_id}] User {ctx.user_id} triggered {action_name}")
        
        # 2. Execute business mutation
        handler = self._action_registry[action_name]
        success = handler(ctx, payload)
        
        return {
            "status": "SUCCESS" if success else "REJECTED",
            "traceId": ctx.audit_trace_id,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }

# Example Usage: Defense Aircraft Maintenance Ontology
ontology = OntologyEngine()

# Register Aircraft Object
ontology.register_object(OntologyObject(
    object_type="Aircraft",
    primary_key="AF-7701",
    properties={"tailNumber": "AF-7701", "model": "C-17 Globemaster", "status": "MISSION_CAPABLE", "fuelPct": 94.5}
))

# Register Maintenance Work Order Object
ontology.register_object(OntologyObject(
    object_type="WorkOrder",
    primary_key="WO-99201",
    properties={"priority": "URGENT", "system": "Avionics_Radar", "estimatedHours": 3.5}
))

# Link Work Order to Aircraft
ontology.link_objects("Aircraft", "AF-7701", "activeWorkOrders", "WO-99201")
`
    },
    interviewQuestions: [
      {
        question: 'Why does an FDE advocate for an Object-Action-Relation (OAR) ontology layer instead of simply exposing REST/GraphQL endpoints over Postgres SQL views?',
        expectedAnswer: 'Postgres SQL views provide read-only projections but fail to encapsulate real-world business constraints, bi-directional relationship graphs, and write-back action semantics. An ontology abstracts the physical database schema into durable business concepts (e.g. an "Asset" or "Customer"), enforces role-based business rules when an Action occurs, and manages audit trails and reverse-ETL writes to multiple disparate systems automatically.',
        redFlags: 'Saying ontology is just a buzzword for an ORM, or failing to understand the operational write-back and graph traversal aspects.'
      }
    ]
  },
  {
    id: 3,
    slug: 'hybrid-and-airgapped-deployments',
    title: 'Phase 3: Hybrid/Multi-Cloud & Air-Gapped Deployments',
    subtitle: 'Deploying robust containerized platforms into zero-egress client VPCs, GovCloud, and on-premises air-gapped bare metal clusters.',
    estimatedWeeks: 'Weeks 8 – 11',
    icon: '🛡️',
    themeColor: 'purple',
    badgeBg: 'bg-purple-950 text-purple-300 border-purple-800',
    borderColor: 'border-purple-800/60',
    activeGradient: 'from-purple-600 to-indigo-600',
    overview: 'Enterprise clients in defense, intelligence, healthcare, and banking forbid multi-tenant SaaS connections. FDEs must deploy their company software inside customer-owned AWS VPCs, Azure Government, or physically disconnected air-gapped server racks using Helm, Kustomize, Harbor registries, and offline bundle archives.',
    strategicImportance: 'The largest enterprise contracts (7-figure and 8-figure deals) almost universally mandate self-hosted VPC or air-gapped deployment capability.',
    coreObjectives: [
      'Master air-gapped image mirroring, offline Helm chart packaging, and zero-egress container orchestration.',
      'Configure enterprise identity federation via SAML 2.0, OAuth2/OIDC, Okta, and Azure Entra ID.',
      'Deploy zero-trust service mesh networking with mutual TLS (mTLS) via Istio or Linkerd.',
      'Implement automated telemetry, health checks, and air-gapped diagnostic log bundles.'
    ],
    keyArchitecturalConcepts: [
      {
        title: 'Zero-Egress Container Deployment & Image Bundling',
        description: 'Building self-contained tarball bundles with all container images, database migrations, model weights, and Helm charts for offline installation.',
        tradeoffs: 'Air-gapped bundles are large (10GB-50GB+) and slow to patch, but they eliminate any dependency on public internet registries (Docker Hub, NPM, PyPI).'
      },
      {
        title: 'Customer-Managed Keys (CMK) & Envelope Encryption',
        description: 'Encrypting data at rest and in transit using client-owned AWS KMS, Azure Key Vault, or HashiCorp Vault with Hardware Security Modules (HSM).',
        tradeoffs: 'Client key rotation can trigger application outages if not properly handled with key version aliases and graceful cache invalidation.'
      },
      {
        title: 'mTLS & Service-to-Service Identity Verification',
        description: 'Ensuring every microservice call inside the customer cluster is authenticated using SPIFFE/SPIRE certificates and encrypted with mutual TLS.',
        tradeoffs: 'Adds a minor compute overhead (1-3% CPU for crypto handshakes) but satisfies strict zero-trust enterprise compliance mandates.'
      }
    ],
    realWorldScenario: {
      client: 'National Department of Defense / Allied Air Command',
      challenge: 'Software had to run on tactical edge server nodes installed inside transportable field containers with zero internet connection for up to 90 days at a time.',
      solution: 'The FDE created an automated K3s packaging pipeline with embedded SQLite/DuckDB replication and offline model inference weights packaged as encrypted bootable ISO images.',
      impact: 'Enabled frontline tactical officers to run real-time mission planning software without satellite connectivity, winning a $14M defense contract.'
    },
    competencies: [
      {
        id: 'comp-3-1',
        title: 'Air-Gapped & Self-Hosted Infrastructure Packaging',
        level: 'Core',
        description: 'Packaging complex distributed platforms into single-command offline installers with embedded container registries.',
        skills: ['Kubernetes (k8s/k3s)', 'Helm & Kustomize', 'Docker Image Mirroring', 'Harbor Private Registry']
      },
      {
        id: 'comp-3-2',
        title: 'Enterprise Identity & Role-Based Access Control (RBAC)',
        level: 'Advanced',
        description: 'Integrating SAML 2.0, SCIM provisioning, Okta, Ping Identity, and Active Directory with granular permission gates.',
        skills: ['SAML 2.0 / OIDC', 'SCIM Protocol', 'OAuth2 Proxy', 'Attribute-Based Access Control (ABAC)']
      },
      {
        id: 'comp-3-3',
        title: 'Network Topologies, Firewalls & VPN Tunnels',
        level: 'Expert',
        description: 'Debugging complex MTU sizing, DNS resolution traps, reverse proxies, and asymmetric routing inside client enterprise networks.',
        skills: ['Wireshark / tcpdump', 'AWS PrivateLink / Azure ExpressRoute', 'Nginx / Envoy Reverse Proxies', 'IPSec & WireGuard']
      }
    ],
    codeArtifact: {
      title: 'Air-Gapped K8s Helm Deployment Blueprint with Zero-Egress Rules',
      language: 'yaml',
      filename: 'airgapped-deployment-values.yaml',
      description: 'Production Kubernetes Helm configuration enforcing local image registries, zero egress security policies, and mTLS sidecar injection.',
      code: `# Air-Gapped Enterprise VPC Helm Values Specification
global:
  environment: "customer-vpc-airgapped"
  imageRegistry: "harbor.internal.client.corp:8443/fde-core"
  imagePullSecrets:
    - name: "client-enterprise-harbor-creds"
  networkPolicy:
    enabled: true
    egress:
      # Block all public internet egress strictly
      - to:
          - ipBlock:
              cidr: 10.0.0.0/8 # Internal corporate subnets only
        ports:
          - protocol: TCP
            port: 5432 # Internal PostgreSQL
          - protocol: TCP
            port: 9092 # Internal Kafka

security:
  tls:
    mode: "MUTUAL_TLS"
    certSecretName: "enterprise-internal-ca-cert"
  rbac:
    enforceScimRoleSync: true
    idpType: "OKTA_SAML2"

storage:
  persistenceClass: "pure-storage-nvme"
  blobStore:
    type: "MINIO_INTERNAL"
    endpoint: "http://minio-service.storage.svc.cluster.local:9000"

observability:
  diagnosticsBundleExporter:
    enabled: true
    schedule: "0 */6 * * *"
    targetLocalPath: "/var/log/fde-diagnostics"
`
    },
    interviewQuestions: [
      {
        question: 'Your application pod in a client AWS EKS cluster fails to start with "ImagePullBackOff" and DNS resolution timeouts. You have no direct internet access and only SSH access to a bastion. What is your systematic troubleshooting procedure?',
        expectedAnswer: 'First check if the node can resolve the internal Harbor or ECR VPC endpoint via `nslookup` or `dig`. Verify that the AWS VPC Endpoint for ECR/S3 is attached to the route table of the private subnet. Second, verify the Kubernetes `imagePullSecret` is present and valid in the target namespace. Third, inspect security groups on the worker nodes and ECR endpoint to confirm inbound/outbound HTTPS port 443 rules are allowed.',
        redFlags: 'Guessing randomly without checking DNS and security groups, or asking the client to open public internet 0.0.0.0/0 on port 80.'
      }
    ]
  },
  {
    id: 4,
    slug: 'enterprise-ai-and-rag',
    title: 'Phase 4: Production Enterprise AI, LLMs & Secure Client-Side RAG',
    subtitle: 'Deploying private RAG pipelines, local LLM inference engines, PII redaction guardrails, and deterministic tool-calling gateways inside client perimeters.',
    estimatedWeeks: 'Weeks 12 – 15',
    icon: '🤖',
    themeColor: 'amber',
    badgeBg: 'bg-amber-950 text-amber-300 border-amber-800',
    borderColor: 'border-amber-800/60',
    activeGradient: 'from-amber-600 to-orange-600',
    overview: 'Forward Deployed AI Engineers (FDAIEs) are the highest-demand specialists in the industry. Enterprise customers want Generative AI, but their legal teams strictly prohibit sending client data to public LLM endpoints. FDEs architect private RAG pipelines using Azure OpenAI Private Endpoints or self-hosted vLLM on private GPUs with strict PII token masking, hybrid vector search, and deterministic tool verification.',
    strategicImportance: 'Enterprise AI deals stall on hallucination risks and data leakage. FDEs who know how to build hallucination-free deterministic workflows with verifiable citations win multi-million dollar contracts.',
    coreObjectives: [
      'Architect Hybrid Semantic + Full-Text RAG (BM25 + Dense Vector Embeddings + Cohere/BGE Reranking).',
      'Deploy self-hosted LLM inference servers (vLLM, Ollama, TensorRT-LLM) on NVIDIA A100/H100 clusters.',
      'Implement real-time PII anonymization & prompt injection guardrails with Presidio and NeMo.',
      'Implement Model Context Protocol (MCP) and function-calling schemas with structured JSON output enforcement.'
    ],
    keyArchitecturalConcepts: [
      {
        title: 'Hybrid Search & Two-Stage Re-Ranking',
        description: 'Combining sparse lexical search (BM25 for exact part numbers, contract IDs) with dense vector embeddings (Cosine similarity for conceptual meaning), followed by a cross-encoder re-ranker.',
        tradeoffs: 'Adds ~50-80ms to retrieval latency but boosts accuracy on enterprise domain terminology from 65% to 94%.'
      },
      {
        title: 'Real-Time PII Token Redaction & Re-Hydration',
        description: 'Scanning user prompts for SSNs, credit cards, patient names, and secret keys before passing to the model, replacing them with reversible placeholder tokens.',
        tradeoffs: 'Ensures absolute compliance with HIPAA/GDPR while keeping the LLM reasoning intact.'
      },
      {
        title: 'Structured Output Enforcement & Schema Constrained Decoding',
        description: 'Using JSON schema grammars (Outlines, Instructor, Pydantic) to force the LLM to output valid typed JSON conforming to enterprise API schemas.',
        tradeoffs: 'Eliminates parsing runtime errors completely at zero extra token cost.'
      }
    ],
    realWorldScenario: {
      client: 'Top-3 Global Pharmaceutical Company ($35B Market Cap)',
      challenge: 'Scientists needed to query 400,000 proprietary clinical trial PDFs and patent filings without any proprietary molecular structures leaking to external AI clouds.',
      solution: 'The FDE deployed an on-premise cluster of 8x NVIDIA H100s running Llama-3-70B with Qdrant vector database and an automated PII redaction proxy.',
      impact: 'Accelerated drug candidate discovery literature review from 3 weeks per molecule to under 4 minutes with 100% data sovereignty.'
    },
    competencies: [
      {
        id: 'comp-4-1',
        title: 'Enterprise RAG Architecture & Vector Indexing',
        level: 'Core',
        description: 'Building multi-stage retrieval pipelines with semantic chunking, metadata filtering, and re-ranking.',
        skills: ['Qdrant / pgvector / Milvus', 'BM25 + Vector Hybrid Retrieval', 'Cross-Encoder Re-Rankers', 'Chunking Strategies']
      },
      {
        id: 'comp-4-2',
        title: 'Self-Hosted Inference & Hardware Sizing',
        level: 'Advanced',
        description: 'Deploying vLLM, TensorRT-LLM, KV Cache quantization (AWQ/GPTQ), and calculating GPU VRAM budgets.',
        skills: ['vLLM Server Optimization', 'NVIDIA GPU Profiling', 'KV-Cache Management', 'PagedAttention']
      },
      {
        id: 'comp-4-3',
        title: 'AI Safety, PII Guardrails & Evaluation Benchmarks',
        level: 'Expert',
        description: 'Building automated evaluation suites (RAGAS, TruLens) to quantify faithfulness, context recall, and prompt injection defense.',
        skills: ['Microsoft Presidio', 'NeMo Guardrails', 'RAGAS Metric Evaluation', 'Adversarial Prompt Testing']
      }
    ],
    codeArtifact: {
      title: 'Production Enterprise RAG Service with PII Masking & Re-Ranking',
      language: 'python',
      filename: 'enterprise_rag_service.py',
      description: 'Production-ready Python FastAPI RAG pipeline featuring PII token anonymization, hybrid search, and cross-encoder re-ranking.',
      code: `"""
Production Enterprise RAG Pipeline for Forward Deployed AI Engineers.
Features: PII Redaction -> Hybrid Retrieval -> Cross-Encoder Re-Ranking -> Structured JSON Generation
"""

from typing import List, Dict, Any
from dataclasses import dataclass
import re

@dataclass
class RetrievedDocument:
    doc_id: str
    content: str
    metadata: Dict[str, Any]
    initial_score: float
    rerank_score: float = 0.0

class EnterprisePIIMasker:
    """Masks SSNs, Emails, and API keys before sending to LLM context."""
    def __init__(self):
        self._patterns = {
            "SSN": r"\\b\\d{3}-\\d{2}-\\d{4}\\b",
            "EMAIL": r"\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,7}\\b",
            "API_KEY": r"\\b(sk-[a-zA-Z0-9]{32,})\\b"
        }

    def mask(self, text: str) -> (str, Dict[str, str]):
        mapping = {}
        counter = 1
        masked_text = text
        for p_name, regex in self._patterns.items():
            matches = re.findall(regex, masked_text)
            for match in matches:
                token = f"<{p_name}_{counter}>"
                mapping[token] = match
                masked_text = masked_text.replace(match, token)
                counter += 1
        return masked_text, mapping

class EnterpriseRAGPipeline:
    def __init__(self, pii_masker: EnterprisePIIMasker):
        self.masker = pii_masker

    def execute_rag(self, query: str, client_tenant_id: str) -> Dict[str, Any]:
        # Step 1: PII Masking
        safe_query, pii_map = self.masker.mask(query)

        # Step 2: Hybrid Query (Simulated Vector + BM25 with Tenant Isolation)
        raw_results = self._hybrid_retrieve(safe_query, client_tenant_id)

        # Step 3: Cross-Encoder Re-Ranking (Top 3 select)
        reranked = self._rerank(safe_query, raw_results)[:3]

        # Step 4: Construct Prompt & Call Private LLM
        prompt = self._build_grounded_prompt(safe_query, reranked)

        return {
            "safeQuery": safe_query,
            "citations": [d.doc_id for d in reranked],
            "contextDocs": len(reranked),
            "piiMaskedCount": len(pii_map),
            "promptPreview": prompt[:150] + "..."
        }

    def _hybrid_retrieve(self, q: str, tenant_id: str) -> List[RetrievedDocument]:
        # Enforce strict multi-tenant metadata filter in Vector DB
        return [
            RetrievedDocument(doc_id="DOC-01", content="Contract clause 4.1: Net 30 payment terms.", metadata={"tenant": tenant_id}, initial_score=0.82),
            RetrievedDocument(doc_id="DOC-02", content="Compliance audit: Annual SOC2 Type 2 verified.", metadata={"tenant": tenant_id}, initial_score=0.79),
            RetrievedDocument(doc_id="DOC-03", content="SLA Guarantee: 99.95% uptime with 1hr P1 response.", metadata={"tenant": tenant_id}, initial_score=0.75)
        ]

    def _rerank(self, query: str, docs: List[RetrievedDocument]) -> List[RetrievedDocument]:
        for doc in docs:
            doc.rerank_score = doc.initial_score * 1.15
        return sorted(docs, key=lambda d: d.rerank_score, reverse=True)

    def _build_grounded_prompt(self, query: str, docs: List[RetrievedDocument]) -> str:
        ctx = "\\n\\n".join([f"[{d.doc_id}] {d.content}" for d in docs])
        return f"SYSTEM: Answer strictly from context. Always cite [DOC-ID].\\nCONTEXT:\\n{ctx}\\n\\nQUESTION: {query}"
`
    },
    interviewQuestions: [
      {
        question: 'An enterprise client complains that their RAG system frequently hallucinates citations that do not exist in the source document. What architectural mechanisms do you put in place to achieve 100% verifiable citations?',
        expectedAnswer: 'Implement a two-pass verification architecture: Pass 1 retrieves chunks and prompts the model with explicit citation token requirements (e.g. `[DOC_ID:PAGE_NUM]`). Pass 2 runs an automated deterministic verification parser that matches the cited quote directly against the retrieved character offsets in the raw document text. If the quote cannot be grounded to the exact offset, the citation is stripped and the system falls back to an explicit "unverified" disclaimer.',
        redFlags: 'Suggesting prompt engineering alone (e.g. adding "please do not lie") without deterministic regex or text offset verification.'
      }
    ]
  },
  {
    id: 5,
    slug: 'client-leadership-and-incident-management',
    title: 'Phase 5: High-Stakes Client Leadership, War-Room Incident Management & De-escalation',
    subtitle: 'Navigating executive panics, conducting blameless RCAs on client soil, and mastering the art of high-pressure customer communication.',
    estimatedWeeks: 'Weeks 16 – 18',
    icon: '🤝',
    themeColor: 'rose',
    badgeBg: 'bg-rose-950 text-rose-300 border-rose-800',
    borderColor: 'border-rose-800/60',
    activeGradient: 'from-rose-600 to-pink-600',
    overview: 'Technical excellence is only half of the FDE equation. When a production data pipeline fails during a live executive board presentation or an overnight batch job corrupts a transaction table, the FDE is the single throat to choke. FDEs must master calm crisis de-escalation, rapid triage under observation, and authoring world-class Root Cause Analysis (RCA) memos.',
    strategicImportance: 'How an FDE handles a severe P0 outage is the #1 predictor of whether a customer cancels a contract or renews for 5 years with increased trust.',
    coreObjectives: [
      'Command high-pressure live production war-rooms with calm, authoritative communication.',
      'Lead the First 30 Days on Client Ground onboarding and trust-building playbook.',
      'Author executive-ready Blameless Post-Mortem and Root Cause Analysis (RCA) reports.',
      'Bridge the Product Flywheel: Translate one-off bespoke customer hacks into core platform roadmap features.'
    ],
    keyArchitecturalConcepts: [
      {
        title: 'The 15-Minute Incident Communication Cadence',
        description: 'Providing structured status updates (Impact, Working Hypotheses, Active Mitigations, Next Update Time) every 15 minutes during a critical P0 incident.',
        tradeoffs: 'Takes 2-3 minutes of engineer time away from debugging, but prevents executive leadership from micromanaging or panicking.'
      },
      {
        title: 'Blameless Post-Mortem & 5-Whys Methodology',
        description: 'Focusing entirely on systemic failures, missing guards, and telemetry gaps rather than individual human error.',
        tradeoffs: 'Demands rigorous architectural honesty but builds deep institutional trust with client engineering leadership.'
      },
      {
        title: 'Core Platform vs. Customer-Specific Fork Management',
        description: 'Resisting the temptation to fork codebases for demanding clients; creating modular plugin hooks or configuration extensions.',
        tradeoffs: 'Writing extension hooks takes 2x longer during the POC but prevents nightmare maintenance debt when supporting 30 different clients.'
      }
    ],
    realWorldScenario: {
      client: 'Major US Health Insurance Carrier ($28B Revenue)',
      challenge: 'During open enrollment, an unexpected batch of 1.2M claims saturated the ingestion database, triggering 504 gateway timeouts across client member portals 2 hours before a state regulator audit.',
      solution: 'The lead FDE opened a war room, implemented an emergency Redis backpressure throttle within 20 minutes, drained queues into S3 overflow buckets, and restored portal latency to <180ms.',
      impact: 'Customer CIO praised the team transparency and expanded the FDE headcount on-site from 2 to 6 engineers.'
    },
    competencies: [
      {
        id: 'comp-5-1',
        title: 'Crisis Management & Executive De-Escalation',
        level: 'Core',
        description: 'De-escalating angry client stakeholders, establishing war-room command hierarchies, and communicating clearly without technical jargon.',
        skills: ['Incident Command Protocol', 'Executive Presence', 'Conflict De-Escalation', 'War Room Management']
      },
      {
        id: 'comp-5-2',
        title: 'Blameless Post-Mortems & Root Cause Analysis (RCA)',
        level: 'Advanced',
        description: 'Writing comprehensive forensic post-mortem documents that detail timeline, systemic root causes, and automated preventive actions.',
        skills: ['5-Whys Analysis', 'Forensic Log Auditing', 'Preventive Action Item Tracking', 'SLA/SLO Impact Modeling']
      },
      {
        id: 'comp-5-3',
        title: 'Product-Engineering Feedback Flywheel',
        level: 'Expert',
        description: 'Synthesizing edge-case customer requirements into elegant, reusable core product primitives for the central engineering team.',
        skills: ['Feature Generalization', 'Platform SDK Design', 'Product Management Partnership', 'Technical Debt Mitigation']
      }
    ],
    codeArtifact: {
      title: 'Executive Blameless RCA (Root Cause Analysis) & Post-Mortem Template',
      language: 'markdown',
      filename: 'EXECUTIVE_RCA_POSTMORTEM_TEMPLATE.md',
      description: 'The standard Palantir/Databricks-style Root Cause Analysis document presented to client VP of Engineering after a major incident.',
      code: `# INCIDENT FORENSIC ROOT CAUSE ANALYSIS (RCA)
**Incident Reference:** INC-2026-0805-P0  
**Service Impacted:** Real-Time Claims Ingestion Pipeline & Member Portal  
**Severity Level:** P0 (Critical - Full Ingestion Degradation)  
**Total Downtime:** 23 minutes (14:02 UTC – 14:25 UTC)  
**Lead FDE Incident Commander:** Alex Vance  
**Target Audience:** Client VP of Engineering & Executive Steering Committee  

---

## 1. Executive Summary
On August 5, 2026 at 14:02 UTC, the ingestion gateway experienced a memory starvation event due to an unannounced 400% surge in uncompressed XML claim payloads. Automated backpressure throttles responded, resulting in 504 Gateway Timeouts on 4.2% of inbound member queries. At 14:25 UTC, the FDE team deployed an emergency Redis stream queue offloader, draining all backpressure and restoring API latency to P99 < 140ms. **Zero data was lost or corrupted.**

---

## 2. Quantitative Customer Impact
- **Total Inbound Payloads:** 1,240,000 requests
- **Degraded Requests:** 52,080 requests (504 Timeout)
- **Data Loss:** 0 items (All captured in S3 Dead-Letter Bucket)
- **Financial / Regulatory Exposure:** $0

---

## 3. Detailed Chronological Timeline (UTC)
| Timestamp | Event / Observation | Action Taken |
| :--- | :--- | :--- |
| **14:00** | Normal baseline traffic (4,200 req/s, P99 = 85ms). | Baseline monitoring. |
| **14:02** | Payload spike to 18,500 req/s. Memory usage on Pod 4-7 hits 96%. | Kube OOMKiller terminates 4 ingestion pods. |
| **14:06** | Lead FDE opens War Room. Notifies Client Incident Lead via PagerDuty. | Initiated 15-minute status update cadence. |
| **14:14** | Root cause identified: Payload parsing buffering entire 45MB XML in RAM. | Enabled streaming chunk parser. |
| **14:22** | Scaled ingestion replicas from 8 to 24 with Redis buffering. | Traffic normalized. |
| **14:25** | System fully stabilized. P99 latency returns to 110ms. | Incident stood down. |

---

## 4. 5-Whys Root Cause Analysis
1. *Why did pods crash?* -> Container memory exceeded 4GB cgroup limit.
2. *Why did memory spike?* -> XML parser was using DOM tree loading instead of streaming SAX parsing.
3. *Why were payloads 45MB?* -> Client billing partner consolidated 24hrs of claims into a single batch without compression.
4. *Why did the gateway accept 45MB?* -> Ingress max_body_size was set to 100MB for legacy compatibility.
5. *Why was backpressure not decoupled?* -> Ingestion worker directly called SQL write synchronously instead of queueing to Kafka.

---

## 5. Preventative Architectural Action Items
- [x] **ACTION-01 (Immediate):** Lower ingress max body size to 10MB; reject oversized batches with 413 Payload Too Large. *(Completed)*
- [ ] **ACTION-02 (Week 1):** Replace DOM parser with streaming io.Reader SAX parser across all ingestion nodes. *(Assigned: FDE Team)*
- [ ] **ACTION-03 (Week 2):** Introduce Redis Streams circuit breaker before SQL writes to decouple surge absorption. *(Assigned: Core Platform)*
`
    },
    interviewQuestions: [
      {
        question: 'During a live demo with the client Chief Technology Officer, the dashboard displays a blank error screen with "Internal Server Error 500". The CTO looks at you skeptically. What is your immediate reaction and exact words?',
        expectedAnswer: 'Maintain complete composure. Do not panic, apologize excessively, or blame the platform. Say: "That looks like an unhandled edge case in the live query worker. Let us inspect the browser network trace and server logs right now together—this is exactly why we run live pilots to harden these edge cases before enterprise rollout." Open DevTools/logs calmly, identify the error (e.g. null value in unmapped field), and demonstrate live how the architecture handles error isolation.',
        redFlags: 'Freezing in panic, blaming coworkers or cloud providers, or trying to hide the error and pretending nothing happened.'
      }
    ]
  },
  {
    id: 6,
    slug: 'scalability-roi-and-expansion',
    title: 'Phase 6: Long-Term Enterprise Scalability, Value Handover & Expansion',
    subtitle: 'Transitioning from POC hacker to Enterprise Architect: Institutionalizing client Centers of Excellence (CoE), calculating multimillion-dollar ROI, and expanding accounts.',
    estimatedWeeks: 'Weeks 19 – 24',
    icon: '📈',
    themeColor: 'blue',
    badgeBg: 'bg-blue-950 text-blue-300 border-blue-800',
    borderColor: 'border-blue-800/60',
    activeGradient: 'from-blue-600 to-indigo-600',
    overview: 'The final phase of Forward Deployed Engineering is transforming an initial successful deployment into an irreplaceable cornerstone of the client enterprise. FDEs train the client internal team, establish a "Center of Excellence" (CoE), quantify concrete dollar ROI ($ Saved, Hours Reclaimed, Risk Mitigated), and author executive roadmaps that justify multi-year account expansion.',
    strategicImportance: 'Forward Deployed Engineers are the primary growth engine for enterprise software companies; account expansions drive Net Revenue Retention (NRR) above 130%.',
    coreObjectives: [
      'Establish a formal Client Center of Excellence (CoE) and internal developer onboarding academy.',
      'Deploy enterprise-wide telemetry, custom Grafana/Datadog dashboards, and SLO/SLA alerts.',
      'Quantify and present empirical ROI metrics to the C-Suite (e.g. 14,000 engineering hours saved, $3.2M infrastructure reduction).',
      'Architect long-term multi-year multi-region migration blueprints.'
    ],
    keyArchitecturalConcepts: [
      {
        title: 'Platform Handover & "Day-2" Operations Runbook',
        description: 'Creating comprehensive operational runbooks, disaster recovery step-by-step checklists, and automated health diagnostics for client internal SREs.',
        tradeoffs: 'Takes time to author thorough documentation, but prevents the client from becoming an ongoing support burden that ties up FDE capacity.'
      },
      {
        title: 'Business Value & ROI Quantification Modeling',
        description: 'Directly linking latency reductions and automation workflows to dollar savings and business revenue milestones.',
        tradeoffs: 'Engineers often prefer discussing code elegance; translating architecture into financial metrics is what unlocks C-suite budget.'
      },
      {
        title: 'Multi-Tenant Scale & Enterprise Federation',
        description: 'Scaling the core deployment from one pilot department (e.g. Loan Origination) to the entire enterprise (Card Services, Risk, Wealth Management).',
        tradeoffs: 'Requires robust multi-tenancy, cross-department data governance, and tenant isolation policies.'
      }
    ],
    realWorldScenario: {
      client: 'Fortune 50 Manufacturing & Heavy Machinery Conglomerate',
      challenge: 'Initial 1-factory pilot proved successful, but corporate headquarters wanted to roll out the predictive maintenance ontology across 42 global manufacturing plants in 14 countries.',
      solution: 'The FDE designed a decentralized hub-and-spoke federated architecture where each factory ran a local edge cluster synchronizing daily aggregated anomalies back to a global Snowflake data warehouse.',
      impact: 'Generated $42M in documented warranty prevention savings, resulting in a 5-year, $38M enterprise contract expansion.'
    },
    competencies: [
      {
        id: 'comp-6-1',
        title: 'Enterprise Runbooks & SRE Handover',
        level: 'Core',
        description: 'Writing comprehensive Day-2 operational runbooks, disaster recovery protocols, and training client internal operations teams.',
        skills: ['Operational Runbooks', 'Disaster Recovery (DR)', 'SRE Training Workshops', 'SLA / SLO Definitions']
      },
      {
        id: 'comp-6-2',
        title: 'Empirical ROI & Executive Value Synthesis',
        level: 'Advanced',
        description: 'Quantifying engineering velocity, computing cost reductions, and operational efficiency gains into board-level presentations.',
        skills: ['ROI Financial Modeling', 'Executive Steering Presentations', 'Business Value Realization', 'TCO Analysis']
      },
      {
        id: 'comp-6-3',
        title: 'Global Federated Enterprise Topologies',
        level: 'Expert',
        description: 'Architecting globally distributed, multi-region hub-and-spoke deployments with cross-region replication and local compliance.',
        skills: ['Multi-Region Architecture', 'Federated Data Mesh', 'Global Load Balancing (GSLB)', 'Disaster Recovery RTO/RPO']
      }
    ],
    codeArtifact: {
      title: 'Enterprise Executive ROI & Value Realization Calculator',
      language: 'typescript',
      filename: 'enterprise_roi_calculator.ts',
      description: 'Production TypeScript model calculating total cost of ownership (TCO) savings, engineering hours reclaimed, and payback period for client executives.',
      code: `/**
 * Forward Deployed Engineering ROI & Value Realization Engine
 * Generates empirical executive summaries for contract renewals and expansions.
 */

export interface DeploymentMetrics {
  clientName: string;
  legacyAnnualInfraCost: number; // e.g. $1,200,000
  platformAnnualInfraCost: number; // e.g. $450,000
  manualWorkflowHoursPerWeek: number; // e.g. 350 hours across 20 analysts
  averageHourlyRate: number; // e.g. $85/hr
  incidentDowntimeHoursPerYear: number; // e.g. 42 hours
  costPerDowntimeHour: number; // e.g. $40,000/hr
  annualLicenseCost: number; // e.g. $500,000
}

export interface RoiReport {
  annualInfraSavings: number;
  annualLaborSavings: number;
  annualDowntimeSavings: number;
  grossAnnualSavings: number;
  netAnnualBenefit: number;
  roiPercentage: number;
  paybackMonths: number;
}

export class FdeRoiEngine {
  public static calculate(metrics: DeploymentMetrics): RoiReport {
    const annualInfraSavings = metrics.legacyAnnualInfraCost - metrics.platformAnnualInfraCost;
    const annualLaborSavings = (metrics.manualWorkflowHoursPerWeek * 0.75) * 52 * metrics.averageHourlyRate; // 75% automation efficiency
    const annualDowntimeSavings = (metrics.incidentDowntimeHoursPerYear * 0.85) * metrics.costPerDowntimeHour; // 85% incident reduction

    const grossAnnualSavings = annualInfraSavings + annualLaborSavings + annualDowntimeSavings;
    const netAnnualBenefit = grossAnnualSavings - metrics.annualLicenseCost;
    const roiPercentage = (netAnnualBenefit / metrics.annualLicenseCost) * 100;
    const paybackMonths = (metrics.annualLicenseCost / (grossAnnualSavings / 12));

    return {
      annualInfraSavings,
      annualLaborSavings,
      annualDowntimeSavings,
      grossAnnualSavings,
      netAnnualBenefit,
      roiPercentage: Math.round(roiPercentage),
      paybackMonths: Number(paybackMonths.toFixed(1))
    };
  }
}`
    },
    interviewQuestions: [
      {
        question: 'How do you transition a client engineering team from viewing you as an indispensable external contractor who fixes everything to owning and expanding the platform themselves?',
        expectedAnswer: 'Implement a structured 3-stage handover: 1) "I do, you watch" (FDE builds with recorded loom videos and written ADRs); 2) "We do together" (Pair programming on real client features and weekly architecture reviews); 3) "You do, I watch" (Client engineers write the PRs and on-call runbooks while FDE reviews and signs off). Establish internal certification badges and champion recognition programs within their company.',
        redFlags: 'Hoarding knowledge to make oneself irreplaceable, or dumping undocumented code on the client on the last day of the contract.'
      }
    ]
  }
];

export const FDE_STUDY_RESOURCES: FdeStudyResource[] = [
  {
    id: 'fde-study-1',
    title: 'The FDE Technical Discovery & Scoping Bible',
    category: 'System Design',
    readTime: '12 min read',
    difficulty: 'Intermediate',
    summary: 'A step-by-step masterclass on interrogating enterprise architectures, extracting hidden database schemas, and avoiding POC failure traps.',
    keyTakeaways: [
      'Always separate Technical Acceptance Criteria (TAC) from commercial sales promises.',
      'Identify the 3 critical stakeholders: The Business Sponsor, the Technical Gatekeeper (DBA/Infosec), and the Daily End-User.',
      'Never accept "we will get you production access next week"—always demand a sanitized staging dataset on Day 1.'
    ],
    content: `### The Art of Forward Deployed Technical Discovery

Forward Deployed Engineering is systems architecture practiced under live combat conditions. When you walk into a client office or join their private Slack channel on Day 1, you are immediately confronted with two opposing forces:
1. **The Executive Sponsor:** Has promised their board that your software will revolutionize their operations in 30 days.
2. **The Internal Engineering & DBA Staff:** Often views your team with skepticism, fearing you will create security vulnerabilities, break legacy systems, or make their jobs redundant.

#### The 5 Pillars of Enterprise Discovery:
1. **Data Lineage Mapping:** Trace where data originates (ERP, CRM, Mainframe), how it is transformed, where it is cached, and what downstream systems depend on it.
2. **Network Perimeter Auditing:** Determine whether you are operating in multi-tenant cloud, customer-dedicated VPC, or a 100% air-gapped zero-egress environment.
3. **Identity & Authorization Hierarchy:** Audit whether authentication is Okta SAML, Kerberos, Active Directory, or custom tokens.
4. **Failure Modes & Rate Limits:** Interrogate legacy API limits (e.g. Salesforce 100k API call limit/day, SAP lock contention).
5. **The "Definition of Done" Matrix:** Ensure both parties sign off on binary quantitative acceptance metrics.`
  },
  {
    id: 'fde-study-2',
    title: 'Palantir-Style Ontology Design: From Raw Tables to Operational Objects',
    category: 'Data & Ontology',
    readTime: '15 min read',
    difficulty: 'Advanced',
    summary: 'How to model high-performance entity graphs with Object-Action-Relation (OAR) mechanics, GraphQL federation, and sub-second query performance.',
    keyTakeaways: [
      'An ontology is NOT an ORM: it models business real-world entities, graph links, and auditable action mutations.',
      'Actions must be atomic, role-checked, and execute asynchronous outbox synchronization to legacy systems of record.',
      'Materialized views and streaming graph indexes (DuckDB, Neo4j, RedisGraph) prevent slow N+1 query cascades.'
    ],
    content: `### Deep Dive: Designing Operational Ontologies

Enterprise databases are notoriously fragmented. A single conceptual "Customer Loan" might span 24 different normalized tables in SQL Server, 3 collections in MongoDB, and live telemetry in Kafka.

#### The 3 Layers of an Enterprise Ontology:
1. **The Semantic Entity Layer (Objects):**
   - Represents the digital twin of a real-world entity (e.g. *Aircraft*, *Hospital Patient*, *Semiconductor Wafer*).
   - Properties are typed, validated, and continuously synced from source systems.
2. **The Graph Traversal Layer (Relations):**
   - Explicit directed links between objects (e.g. \`Aircraft --hasMaintenanceHistory--> WorkOrder\`).
   - Allows multi-hop graph queries without raw SQL JOIN complexity.
3. **The Mutation & Workflow Layer (Actions):**
   - Validated state transitions (e.g. \`AuthorizeEmergencyFlightReroute\`).
   - Dispatches transactional events to internal queues and writes back to legacy external APIs idempotently.`
  },
  {
    id: 'fde-study-3',
    title: 'Air-Gapped & Zero-Egress Infrastructure Mastery',
    category: 'Air-Gapped Infra',
    readTime: '18 min read',
    difficulty: 'Expert',
    summary: 'Comprehensive guide to building, mirroring, and running enterprise Kubernetes platforms in physically isolated data centers and classified clouds.',
    keyTakeaways: [
      'Assume ZERO internet access: no \`npm install\`, no \`docker pull\`, no public DNS resolvers.',
      'Package all base images, Helm charts, model weights, and database migrations into self-verifying sha256 archive bundles.',
      'Master private container registries (Harbor), offline package managers (pip cache, Nexus), and internal root CAs.'
    ],
    content: `### Operating in Dark Sites: The Air-Gap Handbook

When deploying into Defense (DoD IL5/IL6), Intelligence, or ultra-strict Financial perimeters, the public internet does not exist. Egress traffic is physically severed or filtered by unidirectional data diodes.

#### Essential Air-Gapped Toolchain:
- **Image Bundler:** \`skopeo copy\` and \`docker save\` to package multi-arch container images into single compressed tarballs.
- **Private Registry Mirror:** Self-hosted Harbor with automated Trivy vulnerability scanning.
- **Offline Kubernetes:** K3s or RKE2 with bundled air-gapped image tarballs located in \`/var/lib/rancher/k3s/agent/images/\`.
- **Local Secrets & Identity:** HashiCorp Vault or Kubernetes Sealed Secrets initialized with offline PGP keys.`
  },
  {
    id: 'fde-study-4',
    title: 'Enterprise RAG in Restricted VPCs: Hybrid Search & Guardrails',
    category: 'Enterprise AI',
    readTime: '14 min read',
    difficulty: 'Advanced',
    summary: 'Architecting secure Generative AI solutions inside customer cloud boundaries with PII redaction, token anonymization, and hybrid vector search.',
    keyTakeaways: [
      'Pure vector search fails on exact enterprise identifiers (e.g. Part #AX-9912); always combine with BM25 keyword search.',
      'Use cross-encoder re-rankers (e.g. Cohere Rerank, BGE-Reranker-Large) to re-order top 25 chunks down to top 3-5.',
      'Anonymize PII locally before passing tokens to the model to remain HIPAA/GDPR compliant.'
    ],
    content: `### Production Enterprise RAG Blueprint

Most RAG prototypes fail in enterprise production because real corporate documents are messy: 200-page scanned PDF contracts, complex multi-column tables, acronym-heavy engineering specs, and strict privacy laws.

#### The 4-Stage Enterprise Retrieval Pipeline:
1. **Document Ingestion & Semantic Chunking:**
   - Use layout-aware OCR (e.g. LayoutLM, Marker, Unstructured) rather than naive character-count chunking.
   - Attach rich metadata: \`tenant_id\`, \`department_clearance\`, \`effective_date\`, \`document_type\`.
2. **Hybrid Retrieval (Dense + Sparse):**
   - Dense: 1536-dim or 3072-dim embeddings (e.g. \`text-embedding-3-large\`, \`bge-en-v1.5\`) for conceptual intent.
   - Sparse: BM25 / Splade for exact part numbers, contract IDs, and legal terms.
3. **Two-Stage Re-Ranking:**
   - Retrieve top 30 candidates via Reciprocal Rank Fusion (RRF).
   - Score with a cross-encoder model to select the top 3-5 most relevant chunks.
4. **Constrained Decoding:**
   - Force JSON output with strict Pydantic schemas to ensure 100% deterministic parsing.`
  },
  {
    id: 'fde-study-5',
    title: 'The FDE War-Room & Escalation Playbook',
    category: 'Client Leadership',
    readTime: '10 min read',
    difficulty: 'Intermediate',
    summary: 'How to manage P0 outages on client ground, control communication flow, de-escalate executive panic, and author blameless forensic RCAs.',
    keyTakeaways: [
      'Maintain an unshakeable, objective demeanor: panic is contagious in a client war room.',
      'Establish a strict 15-minute status update cadence with the client incident commander.',
      'Never speculate or guess causes to client executives; communicate only verified empirical facts.'
    ],
    content: `### High-Stakes Incident Management on Client Ground

When a critical production failure strikes an enterprise customer, everyone is watching the Forward Deployed Engineer. How you conduct yourself in the first 30 minutes dictates whether the relationship strengthens or collapses.

#### The 4 Golden Rules of War-Room Command:
1. **Rule 1: Separate Triage from Communication.** Designate one person (or half your focus) purely on technical diagnosis, and the other on stakeholder messaging.
2. **Rule 2: Speak in Triads.** Always communicate: *What we know happened*, *What we are currently doing*, and *When the next update will occur*.
3. **Rule 3: Protect the Evidence.** Capture heap dumps, container logs, and telemetry metrics BEFORE restarting pods so the root cause can be mathematically proven.
4. **Rule 4: Deliver the Forensic Post-Mortem in <24 Hours.** A comprehensive, transparent RCA that explains the systemic breakdown and automated preventative safeguards turns an outage into a showcase of engineering maturity.`
  }
];

export const FDE_CASE_STUDIES: FdeCaseStudy[] = [
  {
    id: 'case-study-defense',
    title: 'Air Combat Readiness: Defense Fleet Ontology in Air-Gapped Cloud',
    companyArchetype: 'DoD / Allied Air Command',
    contractValue: '$18.5M Enterprise License',
    timeframe: '21-Day Pilot -> 3-Year Deployment',
    situation: 'Military planners were using 12 separate legacy systems to track jet fighter readiness, maintenance parts, and pilot qualifications. It took 6 hours to compute if a combat squadron could deploy.',
    fdePlaybook: [
      'Deployed an offline K3s container stack with Harbor inside an air-gapped SCIF on Day 3.',
      'Engineered an Object-Action-Relation ontology linking "Aircraft", "Avionics_Subsystem", "Pilot", and "Munition".',
      'Created an atomic Action "ScrambleSquadron" that ran real-time automated verification across maintenance logs, munitions inventory, and pilot flight hours.'
    ],
    architectureDiagramSnippet: `[Legacy IBM DB2] ──(Airbyte CDC)──> [Offline Kafka] ──> [Ontology Engine] ──> [Combat Dashboard (React)]
[SAP Maintenance] ─(Batch ETL)───> [MinIO Lakehouse] ─┘ (mTLS + Okta SAML)`,
    outcome: 'Reduced mission deployment readiness calculation time from 6 hours to 8 seconds. Selected by the Joint Chiefs of Staff for enterprise-wide rollout across 350+ airbases.',
    lessonsLearned: [
      'Always carry extra encrypted offline USB drives with full OS dependencies when entering SCIF environments.',
      'Non-technical military commanders care about actionable green/red status cards, not SQL query performance.'
    ]
  },
  {
    id: 'case-study-fintech',
    title: 'Real-Time Anti-Money Laundering (AML) Graph for Global Bank',
    companyArchetype: 'Top-5 Tier-1 Investment Bank ($2T Assets)',
    contractValue: '$9.2M Annual Subscription',
    timeframe: '14-Day POC -> Global Production',
    situation: 'Legacy rule-based compliance engines generated 98% false positives on suspicious wire transfers, forcing 400 analysts to manually review transactions with an average backlog of 18 days.',
    fdePlaybook: [
      'Integrated live SWIFT wire transfer streams into an in-memory graph engine running inside the bank private AWS VPC.',
      'Modeled entity resolution algorithms connecting shell corporations, shared bank accounts, and beneficial owners across 40 countries.',
      'Deployed an automated ML fraud scoring gateway with explainable visual graph citations for compliance officers.'
    ],
    architectureDiagramSnippet: `[SWIFT Wire Stream] ──> [Apache Flink] ──> [Entity Graph Engine] ──> [Risk Scoring Gateway] ──> [Analyst Portal]`,
    outcome: 'Cut false positive AML alerts by 74%, reducing case backlog from 18 days to under 15 minutes and saving the bank $42M in regulatory fines.',
    lessonsLearned: [
      'Bank compliance teams require immutable cryptographic audit logs for every automated decision.',
      'Reverse-ETL write-backs to legacy mainframe ledger systems must be strictly rate-limited to avoid locking core banking transactions.'
    ]
  },
  {
    id: 'case-study-health',
    title: 'Hospital Clinical Triage & Private Patient RAG System',
    companyArchetype: 'Nationwide Healthcare Network (45 Hospitals)',
    contractValue: '$6.8M Multi-Year Contract',
    timeframe: '30-Day Clinical Trial',
    situation: 'Emergency room doctors spent 40% of their shifts reviewing hundreds of unstructured clinical notes and EHR scans across disconnected hospital databases.',
    fdePlaybook: [
      'Deployed self-hosted Llama-3-70B with vLLM on private on-premise GPU clusters inside the hospital DMZ.',
      'Built a hybrid RAG pipeline with Microsoft Presidio PII token masking to ensure 100% HIPAA compliance.',
      'Designed an intuitive doctor dashboard that summarized complex medical histories with direct one-click citations back to original physician lab notes.'
    ],
    architectureDiagramSnippet: `[Epic EHR / HL7 / FHIR] ──> [PII Masker] ──> [Hybrid Vector DB (Qdrant)] ──> [vLLM Private GPU Cluster] ──> [Clinician iPad App]`,
    outcome: 'Saved emergency physicians an average of 1.8 hours per 12-hour shift, accelerating critical trauma patient intake by 35%.',
    lessonsLearned: [
      'Doctors will reject any AI system that provides uncited recommendations; every single diagnosis claim must link directly to the source EHR paragraph.',
      'Medical terminology requires specialized biomedical embeddings (e.g. BioLinkBERT / PubMedBERT) rather than generic web models.'
    ]
  }
];

export const FDE_CERTIFICATION_EXAM: FdeQuizQuestion[] = [
  {
    id: 1,
    phaseId: 1,
    competencyArea: 'Discovery & Scoping',
    question: 'On Day 2 of a 3-week enterprise POC, the client Chief Information Security Officer (CISO) blocks your cloud connector due to concerns about outbound egress. What is the most effective FDE response?',
    options: [
      'Argue that your cloud is SOC2 compliant and ask the sales executive to pressure the CISO.',
      'Immediately provide a documented architecture diagram showing an in-VPC PrivateLink endpoint with zero public egress and offer to deploy the data processing container entirely inside their VPC.',
      'Tell the client that the POC cannot proceed unless they make an exception to corporate firewall policy.',
      'Attempt to route the traffic through an unmonitored SSH tunnel on port 443.'
    ],
    correctIndex: 1,
    explanation: 'A top FDE never fights customer security policy or circumvents it. You pivot to an in-VPC private endpoint (AWS PrivateLink / Azure Private Endpoints) or local in-VPC compute with zero public internet egress, satisfying their security boundary while keeping the POC on schedule.'
  },
  {
    id: 2,
    phaseId: 1,
    competencyArea: 'POC SOW Design',
    question: 'What is the primary purpose of defining "Anti-Scope" in an enterprise POC Statement of Work (SOW)?',
    options: [
      'To make the legal contract as long as possible to intimidate client lawyers.',
      'To prevent endless scope creep by explicitly enumerating features, integrations, and data sources that will NOT be built during the pilot phase.',
      'To list tasks that the client engineering team is forced to do without vendor assistance.',
      'To outline penalty clauses if the client cancels the contract early.'
    ],
    correctIndex: 1,
    explanation: 'Anti-Scope explicitly establishes what is out-of-bounds for the time-boxed pilot (e.g. "We will NOT integrate the legacy SAP inventory module in Phase 1"). This protects the FDE team from moving goalposts and guarantees focus on the primary technical validation gates.'
  },
  {
    id: 3,
    phaseId: 2,
    competencyArea: 'Ontology Graph Modeling',
    question: 'In Palantir/Foundry-style ontology design, what fundamentally distinguishes an "Action" from a standard REST API update?',
    options: [
      'Actions can only be written in Python, whereas REST APIs use JavaScript.',
      'Actions encapsulate business validation rules, role permissions, multi-hop relationship updates, audit logging, and asynchronous reverse-ETL writes to legacy systems of record in a single atomic primitive.',
      'Actions only modify frontend UI state without affecting backend databases.',
      'Actions are executed exclusively during offline batch syncs.'
    ],
    correctIndex: 1,
    explanation: 'An Ontology Action is a high-level operational transaction that validates business constraints (e.g. "Only a Senior Dispatcher can approve an emergency flight reroute"), updates the entity graph, writes audit trails, and coordinates write-backs to underlying legacy databases.'
  },
  {
    id: 4,
    phaseId: 2,
    competencyArea: 'Data Pipelines & CDC',
    question: 'When synchronizing data from a high-volume legacy SQL database to an operational data lake, why is Change Data Capture (CDC) via Debezium preferred over polling SQL queries with timestamp columns (e.g. SELECT * WHERE updated_at > last_sync)?',
    options: [
      'Polling SQL queries cannot detect deleted records (hard deletes) and causes severe CPU table lock contention during large scans, whereas CDC reads the write-ahead log (WAL) non-intrusively.',
      'CDC makes SQL queries 100x faster inside the client browser.',
      'Timestamp polling requires purchasing expensive enterprise database licenses.',
      'Debezium automatically translates SQL queries into TypeScript.'
    ],
    correctIndex: 0,
    explanation: 'Timestamp-based polling misses DELETE operations completely, strains database memory with repeated table scans, and fails if transactions commit out of chronological order. CDC reads database Write-Ahead Logs (WAL) asynchronously with near-zero compute overhead.'
  },
  {
    id: 5,
    phaseId: 3,
    competencyArea: 'Air-Gapped Deployments',
    question: 'When deploying a containerized platform into a physically air-gapped government facility with zero internet connectivity, how are container images and dependencies delivered?',
    options: [
      'By configuring the Kubernetes cluster to download images through a public proxy.',
      'By pre-packaging all multi-architecture container images into compressed tarballs, transferring them via vetted encrypted media, and loading them into an internal private Harbor registry.',
      'By compiling all code directly on the production server from GitHub using public mirrors.',
      'By asking the client IT staff to temporarily connect the server to a mobile 5G hotspot.'
    ],
    correctIndex: 1,
    explanation: 'Air-gapped sites prohibit external connectivity. FDEs package images and Helm charts into verified archive tarballs (\`docker save\` / \`skopeo copy\`), transfer via vetted encrypted hardware, and load them into local Harbor registries inside the secure perimeter.'
  },
  {
    id: 6,
    phaseId: 3,
    competencyArea: 'Enterprise Security & Identity',
    question: 'A client requires that all user logins authenticate through their corporate Okta tenant and automatically assign roles based on Active Directory group memberships. Which standard protocols should the FDE implement?',
    options: [
      'Basic Auth with hardcoded passwords in Kubernetes ConfigMaps.',
      'SAML 2.0 or OIDC for single sign-on authentication, combined with SCIM 2.0 for automated user provisioning and group synchronization.',
      'FTP authentication with daily CSV user exports.',
      'Direct read access to the client Active Directory LDAP server over public internet.'
    ],
    correctIndex: 1,
    explanation: 'SAML 2.0 / OIDC provides modern federated identity authentication without exposing user credentials to the vendor platform. SCIM 2.0 (System for Cross-domain Identity Management) automates real-time provisioning and de-provisioning based on corporate AD groups.'
  },
  {
    id: 7,
    phaseId: 4,
    competencyArea: 'Enterprise RAG Architecture',
    question: 'Why does naive vector search (cosine similarity on dense embeddings) frequently fail when querying enterprise technical manuals, parts catalogs, or legal contracts?',
    options: [
      'Vector databases cannot store more than 1,000 documents.',
      'Dense embeddings excel at conceptual semantic meaning but struggle with exact lexical matches (e.g. specific part serial numbers, error codes, and alphanumeric contract clauses), requiring a Hybrid Search (BM25 + Dense) pipeline.',
      'Vector embeddings cannot be computed on Nvidia GPUs.',
      'Cosine similarity is mathematically inaccurate for English text.'
    ],
    correctIndex: 1,
    explanation: 'Dense embeddings map general concepts into vector space, but they frequently score random parts numbers similarly because alphanumeric strings lack semantic context. Hybrid search combines BM25 (keyword exact matching) with dense vectors, followed by cross-encoder re-ranking.'
  },
  {
    id: 8,
    phaseId: 4,
    competencyArea: 'AI Privacy & Guardrails',
    question: 'Under HIPAA and GDPR regulations, what is the mandatory architectural step before passing user queries containing medical notes or customer records to an LLM?',
    options: [
      'Translate the text into another language to obscure the meaning.',
      'Execute real-time PII/PHI detection and token redaction (e.g. replacing patient names and SSNs with reversible placeholder tokens) and enforce strict zero-data-retention agreements with the model endpoint.',
      'Rely exclusively on prompting the LLM with "Please do not store this patient information".',
      'Compress the prompt text using GZIP before sending.'
    ],
    correctIndex: 1,
    explanation: 'Prompt engineering alone is insufficient for HIPAA/GDPR compliance. The application layer must deterministically strip and tokenize PII/PHI using tools like Microsoft Presidio before the payload reaches model memory.'
  },
  {
    id: 9,
    phaseId: 4,
    competencyArea: 'LLM Inference Optimization',
    question: 'When deploying open-weights LLMs (e.g. Llama-3-70B) on customer-owned private GPU hardware, what is the primary benefit of using vLLM with PagedAttention over a basic HuggingFace Transformers pipeline?',
    options: [
      'vLLM translates Python code into C++ automatically.',
      'PagedAttention treats the KV cache like virtual memory pages, virtually eliminating memory fragmentation and boosting multi-user concurrent throughput by 4x to 10x.',
      'vLLM eliminates the need for GPU hardware completely.',
      'vLLM trains the model from scratch during every user prompt.'
    ],
    correctIndex: 1,
    explanation: 'Standard transformer inference wastes up to 60-80% of GPU VRAM due to static KV-cache allocation and fragmentation. vLLM’s PagedAttention algorithm allocates KV cache memory dynamically in fixed-size pages, allowing massive concurrent batching on the same GPU cluster.'
  },
  {
    id: 10,
    phaseId: 5,
    competencyArea: 'Crisis Incident Management',
    question: 'During a live production P0 outage on client soil, what is the primary responsibility of the Lead FDE acting as Incident Commander?',
    options: [
      'Immediately start rewriting backend code in the IDE while ignoring client questions.',
      'Establish a clear command structure, protect telemetry evidence, coordinate mitigation hypotheses, and maintain a disciplined 15-minute status update rhythm with client leadership.',
      'Blame the client DBA team for providing corrupt database records.',
      'Mute the microphone and wait until the systems recover automatically.'
    ],
    correctIndex: 1,
    explanation: 'The Incident Commander manages the incident lifecycle: assigning diagnostic tasks, preventing tunnel vision, capturing forensic telemetry before restarting, and giving structured status updates to client leadership to prevent organizational panic.'
  },
  {
    id: 11,
    phaseId: 5,
    competencyArea: 'Blameless Post-Mortem',
    question: 'What is the core philosophy of a "Blameless Root Cause Analysis (RCA)" presented to client engineering executives?',
    options: [
      'Assigning blame exclusively to third-party cloud providers.',
      'Focusing on systemic failures, missing safeguards, and process gaps under the premise that well-intentioned engineers make mistakes when systems lack guardrails.',
      'Refusing to admit that an outage occurred.',
      'Firing the junior engineer who pushed the broken commit.'
    ],
    correctIndex: 1,
    explanation: 'Blameless RCAs recognize that human error is a symptom of broken systems, not the cause. By focusing on why the system permitted the failure (e.g. missing pre-commit validation, lack of circuit breaker), the team builds long-term institutional reliability.'
  },
  {
    id: 12,
    phaseId: 5,
    competencyArea: 'Product-Engineering Flywheel',
    question: 'A high-value enterprise client demands a bespoke custom data transformation feature that does not exist in your core SaaS product. How should an FDE handle this request?',
    options: [
      'Fork the main repository and create a private customer-specific codebase branch that is maintained forever.',
      'Design the capability as a generic, pluggable extension point or custom script hook that can be contributed back to the core platform roadmap for all customers.',
      'Flatly refuse the client and report them to the sales director.',
      'Promise the feature tomorrow by copy-pasting code into production without code review.'
    ],
    correctIndex: 1,
    explanation: 'Forking customer-specific branches creates fatal technical debt. A great FDE abstracts the customer’s requirement into a generalized, reusable platform capability (e.g., custom plugin hooks or sandboxed WebAssembly workers) that enriches the core platform.'
  },
  {
    id: 13,
    phaseId: 6,
    competencyArea: 'Client Handover & CoE',
    question: 'What is the primary objective of establishing a client "Center of Excellence (CoE)" during the expansion phase?',
    options: [
      'To force the client to do all customer support work without vendor involvement.',
      'To train and empower internal client developers, data engineers, and architects to independently build workflows and champion the platform across their organization.',
      'To sell expensive consulting hours for basic bug fixes.',
      'To lock down the platform so only certified vendor staff can access it.'
    ],
    correctIndex: 1,
    explanation: 'A Center of Excellence (CoE) trains client internal champions. When client engineers become certified experts who love building on your platform, they drive organic bottom-up expansion into other departments across the entire enterprise.'
  },
  {
    id: 14,
    phaseId: 6,
    competencyArea: 'Executive ROI Synthesis',
    question: 'When presenting a $5M multi-year contract renewal to a client Chief Financial Officer (CFO), which metric is most persuasive?',
    options: [
      'The number of lines of TypeScript code written by the FDE team.',
      'Empirical TCO reduction and business value realization: $3.8M annual infrastructure savings, 22,000 engineering hours reclaimed, and payback period under 8 months.',
      'The aesthetic color scheme of the React frontend.',
      'A list of GitHub commits pushed during the pilot.'
    ],
    correctIndex: 1,
    explanation: 'CFOs and board members evaluate enterprise software on return on investment (ROI), Total Cost of Ownership (TCO) reduction, risk mitigation, and payback period—not code volume or technical minutiae.'
  },
  {
    id: 15,
    phaseId: 6,
    competencyArea: 'Global Multi-Region Scalability',
    question: 'When scaling an enterprise platform across 15 international subsidiaries with strict data residency laws (e.g. Germany, Saudi Arabia, Singapore), which architecture is mandatory?',
    options: [
      'Routing all global traffic to a single monolithic PostgreSQL database in US-East-1.',
      'A federated multi-region hub-and-spoke topology where local tenant data remains strictly within regional boundaries while aggregated analytics are synchronized globally.',
      'Disabling database backups to save bandwidth.',
      'Asking the client legal team to sign waivers ignoring local privacy laws.'
    ],
    correctIndex: 1,
    explanation: 'Data sovereignty laws (GDPR in Europe, PDPA in Singapore, Saudi National Data Governance) legally mandate that citizen data never leave the geographic region. A federated hub-and-spoke architecture isolates local persistent databases while sharing aggregated operational metrics.'
  }
];

export const FDE_FLASHCARDS: FdeFlashcard[] = [
  {
    id: 1,
    category: 'Architecture',
    front: 'What is a Forward Deployed Engineer (FDE)?',
    back: 'An elite hybrid software engineer and systems architect who embeds directly with enterprise clients to solve mission-critical problems, deploy software on customer infrastructure, design ontologies, and bridge client feedback to core engineering.'
  },
  {
    id: 2,
    category: 'Architecture',
    front: 'What is an Operational Ontology (OAR Pattern)?',
    back: 'An abstraction layer representing real-world business entities (Objects), bi-directional graph connections (Relations), and auditable, role-governed state mutations (Actions) with automated write-back to legacy systems.'
  },
  {
    id: 3,
    category: 'Security & Infra',
    front: 'What is an "Air-Gapped" Deployment?',
    back: 'A physically or logically isolated computing environment with ZERO connection to the public internet. All container images, binaries, and model weights must be pre-packaged into offline archives.'
  },
  {
    id: 4,
    category: 'Enterprise AI',
    front: 'Why is Hybrid Search critical in Enterprise RAG?',
    back: 'Dense vector embeddings capture conceptual meaning but fail on exact part serial numbers, error codes, and legal clauses. BM25 sparse keyword search guarantees exact lexical retrieval.'
  },
  {
    id: 5,
    category: 'Client Leadership',
    front: 'What is the 15-Minute Rule during a P0 Incident?',
    back: 'During an active enterprise outage, provide a structured status update to client leadership every 15 minutes (Impact, Active Hypotheses, Mitigations in Progress, Next Update Time) to prevent panic.'
  },
  {
    id: 6,
    category: 'Data Engineering',
    front: 'What is Change Data Capture (CDC)?',
    back: 'A technique that reads database transaction logs (WAL) in real-time to stream inserts, updates, and deletes to Kafka/Debezium without putting load on database CPU or locking tables.'
  },
  {
    id: 7,
    category: 'Strategy & Scoping',
    front: 'What is "Technical Acceptance Criteria" (TAC)?',
    back: 'The pre-agreed binary pass/fail technical metrics (e.g. latency < 150ms, data freshness < 10m) signed by both vendor and client on Day 1 to prevent scope creep during a POC.'
  },
  {
    id: 8,
    category: 'Enterprise AI',
    front: 'What is KV-Cache PagedAttention?',
    back: 'An optimization algorithm in vLLM that allocates GPU memory for token attention in dynamic pages rather than static contiguous blocks, increasing concurrent LLM throughput by 4x-10x.'
  }
];
