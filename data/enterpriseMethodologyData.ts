export interface MethodologyStep {
  stepNumber: number;
  phaseTitle: string;
  shortSummary: string;
  icon: string;
  badge: string;
  strategicObjective: string;
  keyActivities: string[];
  artifactsAndDeliverables: string[];
  techStackAndTools: string[];
  techLayeringTable?: {
    layer: string;
    tooling: string;
    objectives: string;
  }[];
  codeOrDiagramSnippet: {
    title: string;
    language: 'yaml' | 'typescript' | 'hcl' | 'json' | 'text';
    code: string;
  };
  architecturalChecklist: string[];
}

export interface EnterpriseDomainPreset {
  id: string;
  name: string;
  industry: string;
  scaleMetric: string;
  keyConstraint: string;
  recommendedArchStyle: string;
  recommendedDbStack: string[];
}

export const ENTERPRISE_DOMAIN_PRESETS: EnterpriseDomainPreset[] = [
  {
    id: 'supply-chain',
    name: 'AI-Orchestrated Supply Chain & Logistics Engine',
    industry: 'Logistics & Supply Chain',
    scaleMetric: '10M Global Shipments / Day, Real-time SAP/ERP Sync',
    keyConstraint: 'Sub-second inventory locks, multi-agent AI procurement, 99.99% availability, SOC2/HIPAA',
    recommendedArchStyle: 'Event-Driven + Microservices + Semantic Kernel AI Agents',
    recommendedDbStack: ['Snowflake (OLAP Analytics)', 'MS SQL Server / PostgreSQL (OLTP Ledger)', 'Kafka / Azure Service Bus', 'Azure AI Search (Vector DB)']
  },
  {
    id: 'fintech',
    name: 'Global Financial Ledger & Payment Engine',
    industry: 'Financial Services',
    scaleMetric: '50,000 TPS Peak Throughput',
    keyConstraint: 'Zero data loss (Strict ACID), PCI-DSS Level 1, < 50ms processing latency, Entra ID SSO',
    recommendedArchStyle: 'Event-Driven + Microservices + gRPC',
    recommendedDbStack: ['CockroachDB / Spanner (Distributed SQL)', 'Kafka (Event Stream)', 'Redis Enterprise (Idempotency Cache)']
  },
  {
    id: 'healthcare',
    name: 'HIPAA & GDPR Compliant Health Data Engine',
    industry: 'Healthcare & Life Sciences',
    scaleMetric: '5 Million Patients & Real-time EHR Synchronization',
    keyConstraint: 'HIPAA, GDPR & SOC2 compliance, audited access controls, zero-trust perimeter, AES-256',
    recommendedArchStyle: 'Modular Monolith + Serverless Edge + Polyglot CDC',
    recommendedDbStack: ['PostgreSQL with Row-Level Security', 'Azure Blob / S3 Encrypted Archive', 'Elasticsearch / Azure AI Search']
  }
];

export const METHODOLOGY_STEPS: MethodologyStep[] = [
  {
    stepNumber: 1,
    phaseTitle: 'Phase 1: Domain Discovery & Strategic Alignment',
    shortSummary: 'Strictly define system boundaries and business domain models through Domain-Driven Design (DDD) & Event Storming before provisioning infrastructure.',
    icon: '🧭',
    badge: 'Phase 1: Discovery & Alignment',
    strategicObjective: 'Align engineering boundaries directly with enterprise domain capabilities to prevent monolithic coupling and establish strict SLAs/NFRs.',
    keyActivities: [
      'Map Bounded Contexts: Deconstruct domain into distinct sub-domains (e.g., Core Logistics, Inventory Analytics, Identity & Access, Billing).',
      'Define Ubiquitous Language: Establish a standardized vocabulary shared between engineering teams and domain experts.',
      'Identify Aggregates & Domain Events: Map out how data changes state across the system and define triggering events (e.g., OrderPlaced, InventoryUpdated).',
      'Non-Functional Requirements (NFRs) & SLA Definition: Define 99.99% uptime availability targets, RPO/RTO disaster recovery objectives, latency thresholds (<50ms), and data residency rules (GDPR, SOC2, HIPAA).'
    ],
    artifactsAndDeliverables: [
      'Bounded Context & Domain Mapping Document',
      'Enterprise Ubiquitous Language Dictionary',
      'NFR Matrix (Availability, Latency, RPO/RTO, Compliance)',
      'Domain Event Taxonomy Schema'
    ],
    techStackAndTools: ['Domain-Driven Design (DDD)', 'Event Storming', 'Miro / Structurizr C4', 'Azure AD / Entra ID'],
    codeOrDiagramSnippet: {
      title: 'Domain Context Map & Aggregates Specification (Structurizr C4 DSL)',
      language: 'yaml',
      code: `workspace "Enterprise Logistics System" {
    model {
        customer = person "Enterprise Client" "Submits fulfillment orders"
        
        enterpriseSystem = softwareSystem "Supply Chain Engine" {
            logisticsContext = container "Core Logistics Context" "Handles order dispatch & routing"
            inventoryContext = container "Inventory Analytics Context" "Real-time stock reservation"
            billingContext = container "Billing Context" "Handles invoicing & ledger updates"
        }
        
        customer -> logisticsContext "Triggers OrderPlaced [HTTPS/gRPC]"
        logisticsContext -> inventoryContext "Emits Event: InventoryUpdated [Kafka]"
        logisticsContext -> billingContext "Triggers InvoiceGenerated [gRPC Sync]"
    }
}`
    },
    architecturalChecklist: [
      'Are bounded contexts strictly isolated with explicit domain ownership?',
      'Is the ubiquitous language documented and used consistently in code and APIs?',
      'Are NFRs, SLAs (99.99%), RPO/RTO, and compliance boundaries (GDPR/SOC2/HIPAA) signed off?'
    ]
  },
  {
    stepNumber: 2,
    phaseTitle: 'Phase 2: High-Level Architecture & Platform Selection',
    shortSummary: 'Select architectural styles and define enterprise technology layering to meet throughput, concurrency, and organizational requirements.',
    icon: '🏛️',
    badge: 'Phase 2: Platform & Layering',
    strategicObjective: 'Establish foundational architecture patterns (Microservices, EDA, Modular Monolith) and full-stack technology layering.',
    keyActivities: [
      'Architectural Pattern Selection: Evaluate Microservices (decoupled domains), Event-Driven Architecture (EDA via Azure Service Bus, Kafka, EventBridge), and Modular Monolith (rapid initial MVP velocity).',
      'Define Enterprise Technology Layering: Establish multi-tier stack spanning Frontend, API Gateway, Core Compute, AI Orchestration, Data, and DevOps.',
      'Formulate Architectural Decision Records (ADRs) capturing context, trade-offs, and consequences.'
    ],
    artifactsAndDeliverables: [
      'Enterprise Technology Layering Matrix',
      'Architectural Decision Records (ADRs)',
      'Event-Driven Ingestion Topology Map',
      'Platform Cost & Capacity Projections'
    ],
    techStackAndTools: ['.NET 8/9, C#', 'ASP.NET Core', 'React & TypeScript', 'Azure API Management / AWS Gateway', 'Azure Service Bus / Kafka', 'Snowflake / SQL Server / Postgres', 'Docker & Kubernetes'],
    techLayeringTable: [
      {
        layer: 'Frontend & Channel',
        tooling: 'React, TypeScript, Node.js, React Native',
        objectives: 'Omni-channel delivery, micro-frontends, Single Sign-On (SSO) integration.'
      },
      {
        layer: 'API & Gateway',
        tooling: 'RESTful Web APIs, gRPC, Azure API Management / AWS API Gateway',
        objectives: 'Rate limiting, SSL termination, request routing, low-latency inter-service gRPC communication.'
      },
      {
        layer: 'Core Compute',
        tooling: '.NET 8/9, C#, ASP.NET Core, Containerization (Docker/Kubernetes)',
        objectives: 'High-performance transactional processing, repository/unit-of-work patterns, dependency injection.'
      },
      {
        layer: 'AI & Orchestration',
        tooling: 'Semantic Kernel, LangGraph, CrewAI, Azure OpenAI, RAG Architectures',
        objectives: 'Intelligent agent workflows, automated decision-making, secure enterprise-grade data boundaries.'
      },
      {
        layer: 'Data & Analytics',
        tooling: 'Snowflake, MS SQL Server, PostgreSQL, Azure Data Factory',
        objectives: 'Transactional relational storage, analytical data warehousing, real-time data synchronization.'
      },
      {
        layer: 'DevOps & Cloud',
        tooling: 'Azure DevOps, GitHub Actions, Terraform/Bicep (IaC), Docker, K8s',
        objectives: 'Automated CI/CD pipelines, zero-downtime deployments, infrastructure-as-code governance.'
      }
    ],
    codeOrDiagramSnippet: {
      title: 'Architectural Decision Record (ADR-002: Technology Layering & Event Bus)',
      language: 'yaml',
      code: `# ADR-002: Enterprise Technology Layering and Asynchronous Messaging
Status: Accepted
Date: 2026-07-24

## Context
High-throughput logistics processing requires decoupling web channels from transactional core compute and analytical processing.

## Decision
1. Core Compute: .NET 8/9 ASP.NET Core microservices deployed to Azure Kubernetes Service (AKS).
2. Messaging: Azure Service Bus / Kafka for event-driven pub/sub.
3. Analytics: Snowflake fed via Change Data Capture (CDC) and Azure Data Factory pipelines.

## Consequences
- Guarantees sub-50ms API responses while processing asynchronous analytics off-path.
- Requires team mastery of gRPC contracts and event schema evolution.`
    },
    architecturalChecklist: [
      'Is the technology stack standardized across core layers (Frontend, API, Compute, AI, Data, DevOps)?',
      'Are asynchronous messaging brokers (Kafka / Azure Service Bus) configured for high-throughput spikes?',
      'Are ADRs recorded for all major architectural choices?'
    ]
  },
  {
    stepNumber: 3,
    phaseTitle: 'Phase 3: Detailed System Design & Specification',
    shortSummary: 'Translate high-level architecture into actionable API contracts, polyglot data schemas, and zero-trust security perimeters.',
    icon: '📐',
    badge: 'Phase 3: Contracts & Security',
    strategicObjective: 'Establish contract-first interfaces, polyglot persistence strategies, and zero-trust security standards across all layers.',
    keyActivities: [
      'API Contract & Schema Design: Design OpenAPI/Swagger specs for external RESTful endpoints ("API-First Design") and .proto schemas for low-latency internal microservice gRPC.',
      'Data Modeling & Storage Strategy: Separate operational transactional databases (OLTP: SQL Server/PostgreSQL) from analytical warehouses (OLAP: Snowflake). Design CDC pipelines via Azure Data Factory or SSIS.',
      'Enterprise Security & Zero Trust: Implement RBAC and OAuth2/OpenID Connect (Azure AD / Entra ID). Enforce encryption at rest (AES-256) and in transit (TLS 1.3) with Key Vault secret management.'
    ],
    artifactsAndDeliverables: [
      'OpenAPI 3.1 Swagger Specification',
      'Protocol Buffers (.proto) Schema Library',
      'Polyglot Data Persistence Architecture Diagram',
      'Zero-Trust RBAC & Encryption Matrix'
    ],
    techStackAndTools: ['OpenAPI / Swagger', 'gRPC & Protobuf', 'Azure Data Factory / Debezium CDC', 'Azure Key Vault / HashiCorp Vault', 'OAuth2 / OIDC (Entra ID)'],
    codeOrDiagramSnippet: {
      title: 'Internal Microservice gRPC Contract Definition (.proto)',
      language: 'yaml',
      code: `syntax = "proto3";

package enterprise.logistics.v1;

option csharp_namespace = "Enterprise.Logistics.V1";

service LogisticsService {
  rpc ReserveInventory (InventoryRequest) returns (InventoryResponse);
  rpc StreamShipmentUpdates (ShipmentQuery) returns (stream ShipmentEvent);
}

message InventoryRequest {
  string order_id = 1;
  string sku = 2;
  int32 quantity = 3;
}

message InventoryResponse {
  bool is_reserved = 1;
  string reservation_id = 2;
  int64 timestamp = 3;
}`
    },
    architecturalChecklist: [
      'Are external REST APIs defined via OpenAPI before code implementation begins?',
      'Is internal service-to-service communication specified using gRPC .proto schemas?',
      'Are transactional databases (OLTP) isolated from analytical warehouses (OLAP) via CDC/ETL?',
      'Is encryption enforced at rest (AES-256) and in transit (TLS 1.3) with Key Vault storage?'
    ]
  },
  {
    stepNumber: 4,
    phaseTitle: 'Phase 4: Modern AI & Agentic Workflow Integration',
    shortSummary: 'Embed AI orchestration layers, Retrieval-Augmented Generation (RAG), and multi-agent workflows with human-in-the-loop governance.',
    icon: '🤖',
    badge: 'Phase 4: AI & Agentic Orchestration',
    strategicObjective: 'Safely integrate LLM reasoning, enterprise document grounding, and autonomous agent orchestration into core workflows.',
    keyActivities: [
      'Implement Agent Orchestration Layer using Semantic Kernel or LangGraph/CrewAI between API Gateway and Core Enterprise APIs.',
      'Retrieval-Augmented Generation (RAG): Connect vector DBs & search indexes (Azure AI Search) to proprietary enterprise documents and transactional data.',
      'Multi-Agent Orchestration: Assign specialized personas to AI agents (e.g., Procurement Agent validating stock against Inventory Agent querying SAP transaction codes).',
      'Human-in-the-Loop (HITL): Enforce mandatory human approval checkpoints for high-stakes execution steps (e.g., transactions exceeding $50k).'
    ],
    artifactsAndDeliverables: [
      'Agentic Orchestration Sequence Diagram',
      'Vector Search & RAG Indexing Specification',
      'Multi-Agent Tool Execution Contracts',
      'HITL Governance & Safety Guardrail Policy'
    ],
    techStackAndTools: ['Semantic Kernel', 'LangGraph / CrewAI', 'Azure OpenAI Service', 'Azure AI Search (Vector DB)', 'SAP / Enterprise Tool Plugins'],
    codeOrDiagramSnippet: {
      title: 'Enterprise AI & Agentic Workflow Architecture',
      language: 'text',
      code: `[Client Application / UI] 
         │
         ▼
[API Gateway / Secure Boundary]
         │
         ▼
[Agent Orchestration Layer (Semantic Kernel / LangGraph)]
         ├──► [Azure OpenAI Service / LLM (Reasoning Engine)]
         ├──► [Azure AI Search / Vector DB (RAG Context)]
         └──► [Enterprise APIs / SAP / Database Tools (Execution)]`
    },
    architecturalChecklist: [
      'Is the Agent Orchestration Layer isolated behind the secure API Gateway boundary?',
      'Does the RAG architecture ground LLM responses with real-time vector search indexes?',
      'Are multi-agent execution steps guarded by Human-in-the-Loop (HITL) approval gates?'
    ]
  },
  {
    stepNumber: 5,
    phaseTitle: 'Phase 5: Implementation, CI/CD & Engineering Execution',
    shortSummary: 'Automate SDLC pipelines, leverage AI developer copilots, and manage cloud infrastructure programmatically using IaC.',
    icon: '⚙️',
    badge: 'Phase 5: SDLC & IaC',
    strategicObjective: 'Maximize engineering velocity while guaranteeing reproducible, test-driven deployments across all environments.',
    keyActivities: [
      'Software Development Lifecycle (SDLC) Automation: Establish strict branch policies and pull request workflows in GitHub Actions / Azure DevOps. Enforce TDD with unit, integration, and e2e tests.',
      'AI-Assisted Engineering Velocity: Integrate developer copilots (GitHub Copilot, Cursor) into IDEs for boilerplate, unit tests, and syntax translation.',
      'Infrastructure as Code (IaC): Provision 100% of cloud resources programmatically using Terraform or Azure Bicep to ensure reproducible, drift-free environments across Dev, Staging, and Production.'
    ],
    artifactsAndDeliverables: [
      'Terraform / Azure Bicep IaC Templates',
      'GitHub Actions / Azure DevOps CI/CD Pipelines',
      'Automated Test Execution Suite (TDD)',
      'Developer Copilot Engineering Guidelines'
    ],
    techStackAndTools: ['Terraform / Azure Bicep', 'GitHub Actions / Azure DevOps', 'Test Driven Development (TDD)', 'GitHub Copilot / Cursor'],
    codeOrDiagramSnippet: {
      title: 'Terraform Infrastructure as Code Module (Azure Container Apps / K8s)',
      language: 'hcl',
      code: `resource "azurerm_container_app" "core_logistics_service" {
  name                         = "core-logistics-app"
  container_app_environment_id = azurerm_container_app_environment.enterprise_env.id
  resource_group_name          = azurerm_resource_group.rg.name
  revision_mode                = "Multiple"

  template {
    container {
      name   = "logistics-api"
      image  = "enterpriseacr.azurecr.io/logistics-api:\${var.app_version}"
      cpu    = "1.0"
      memory = "2.0Gi"

      env {
        name  = "ConnectionStrings__SqlLedger"
        value = azurerm_key_vault_secret.db_conn.value
      }
    }
  }
}`
    },
    architecturalChecklist: [
      'Are 100% of cloud resources provisioned via declarative Terraform or Azure Bicep modules?',
      'Are automated test suites (unit, integration, e2e) executed on every PR before merge?',
      'Are secrets injected directly from Key Vault rather than hardcoded in code or CI configs?'
    ]
  },
  {
    stepNumber: 6,
    phaseTitle: 'Phase 6: Deployment, Observability & Governance',
    shortSummary: 'Deploy via zero-downtime Blue/Green or Canary releases, monitor full-stack distributed tracing, and practice continuous FinOps governance.',
    icon: '📊',
    badge: 'Phase 6: Observability & FinOps',
    strategicObjective: 'Ensure zero-downtime production rollouts, end-to-end distributed observability, and continuous cloud cost management.',
    keyActivities: [
      'Deployment Strategies: Implement Blue/Green or Canary deployments via Kubernetes or App Services to route a subset of traffic before full rollout.',
      'Full-Stack Telemetry & Observability: Integrate OpenTelemetry and distributed tracing (Application Insights / Datadog) tracking requests from SPA through API gateway down to SQL/Snowflake execution. Set automated alerts.',
      'Continuous Governance & FinOps: Regularly review cloud resource utilization and query performance (e.g., Snowflake warehouse sizing) to optimize costs. Conduct periodic architectural & penetration testing reviews.'
    ],
    artifactsAndDeliverables: [
      'Canary Deployment Manifests',
      'OpenTelemetry Distributed Tracing Setup',
      'Application Insights / Datadog Executive Dashboards',
      'FinOps Cloud Cost Optimization Report'
    ],
    techStackAndTools: ['Kubernetes Canary / Blue-Green', 'OpenTelemetry SDK', 'Azure Application Insights / Datadog', 'FinOps & Snowflake Cost Controls'],
    codeOrDiagramSnippet: {
      title: 'OpenTelemetry Distributed Tracing Instrumentation (.NET / C#)',
      language: 'typescript',
      code: `// .NET 8 / C# OpenTelemetry Service Configuration
public static void ConfigureObservability(IServiceCollection services, IConfiguration config)
{
    services.AddOpenTelemetry()
        .WithTracing(tracerProviderBuilder =>
            tracerProviderBuilder
                .AddSource("Enterprise.Logistics.Core")
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddSqlClientInstrumentation()
                .AddOtlpExporter(opt => opt.Endpoint = new Uri(config["OTEL_EXPORTER_ENDPOINT"])));
}`
    },
    architecturalChecklist: [
      'Are Canary or Blue/Green deployment pipelines configured for zero-downtime releases?',
      'Does distributed tracing correlate requests from the React SPA to API Gateway and SQL/Snowflake queries?',
      'Are FinOps monitoring alerts configured to prevent cloud spending overruns?'
    ]
  }
];
