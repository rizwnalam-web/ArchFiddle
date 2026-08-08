export interface GlossaryTerm {
  id: string;
  term: string;
  shortDefinition: string;
  fullDefinition: string;
  category: 'Architectural Patterns' | 'Data & Persistence' | 'Domain-Driven Design' | 'Cloud & Infrastructure' | 'Security & Governance' | 'Operations & DevOps';
  realWorldScenario: string;
  keyBenefits: string[];
  relatedArchTypes?: string[];
  codeOrSchemaSnippet?: {
    title: string;
    language: 'typescript' | 'json' | 'yaml' | 'sql';
    code: string;
  };
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'cqrs',
    term: 'CQRS (Command Query Responsibility Segregation)',
    category: 'Architectural Patterns',
    shortDefinition: 'Separates data mutation (Commands) from data querying (Queries) into distinct models.',
    fullDefinition: 'CQRS segregates read and write operations for a data store. Commands mutate state and write to transactional stores, while Queries read from highly optimized, denormalized read replicas or search indexes. This eliminates read-write database lock contention in high-scale systems.',
    realWorldScenario: 'An e-commerce flash sale where 100,000 buyers check product details (heavy read queries) while 5,000 buyers place orders simultaneously (atomic write commands).',
    keyBenefits: [
      'Independent Read/Write Scaling',
      'Optimized Read Schemas (e.g. Elasticsearch / Redis)',
      'Reduced Database Lock Contention'
    ],
    relatedArchTypes: ['Event-Driven', 'Microservices', 'CQRS Architecture'],
    codeOrSchemaSnippet: {
      title: 'CQRS Command vs Query Interface',
      language: 'typescript',
      code: `// Write Side: Command
interface PlaceOrderCommand {
  orderId: string;
  items: { sku: string; qty: number }[];
}

// Read Side: Optimized Query View
interface OrderSummaryView {
  orderId: string;
  totalFormatted: string;
  statusBadge: string;
}`
    }
  },
  {
    id: 'event-sourcing',
    term: 'Event Sourcing',
    category: 'Data & Persistence',
    shortDefinition: 'Persists application state as an append-only sequence of immutable state change events.',
    fullDefinition: 'Instead of storing only the current state of an entity in a database row, Event Sourcing logs every state-changing event in chronological order. Current state is reconstructed by replaying events from the beginning or a snapshot.',
    realWorldScenario: 'Bank Account Ledger: Rather than overwriting a column balance = $500, the system records +$1000 Deposit, -$200 ATM Withdrawal, -$300 Transfer, maintaining a 100% verifiable audit trail.',
    keyBenefits: [
      'Complete Audit Log & Historical Time Travel',
      'Zero Data Mutation Loss',
      'Seamless Integration with CQRS Projections'
    ],
    relatedArchTypes: ['Event-Driven', 'Microservices'],
    codeOrSchemaSnippet: {
      title: 'Immutable Event Log Entry',
      language: 'json',
      code: `{
  "aggregateId": "account-9821",
  "sequenceNumber": 4,
  "eventType": "MoneyWithdrawn",
  "payload": { "amount": 200, "currency": "USD" },
  "timestamp": "2026-07-24T01:15:00Z"
}`
    }
  },
  {
    id: 'bounded-context',
    term: 'Bounded Context',
    category: 'Domain-Driven Design',
    shortDefinition: 'A explicitly defined boundary within which a specific domain model applies.',
    fullDefinition: 'A core concept in Domain-Driven Design (DDD) that sets explicit boundaries around where a domain model applies. Inside the boundary, all terms in the Ubiquitous Language have unified, unambiguous meanings.',
    realWorldScenario: 'The word "Account" means a user profile with email in the Auth Context, but means a credit balance with tax ID in the Billing Context.',
    keyBenefits: [
      'Eliminates Ambiguity in Data Models',
      'Enables Microservice Boundary Mapping',
      'Allows Independent Team Autonomy'
    ],
    relatedArchTypes: ['Microservices', 'Modular Monolith']
  },
  {
    id: 'circuit-breaker',
    term: 'Circuit Breaker Pattern',
    category: 'Cloud & Infrastructure',
    shortDefinition: 'Prevents cascading failures by halting requests to an unresponsive upstream service.',
    fullDefinition: 'A operational pattern inspired by electrical switches. When consecutive failures to a downstream service exceed a threshold, the circuit "opens" and immediately fails subsequent requests without clogging threads. After a timeout, it tests recovery via a "half-open" state.',
    realWorldScenario: 'If the Payment Gateway API times out 10 times in 5 seconds, the circuit breaker trips open, returning instant error messages to UI users rather than freezing 1,000 server threads.',
    keyBenefits: [
      'Prevents System-wide Cascading Outages',
      'Gives Struggling Downstream Services Time to Recover',
      'Fails Fast for Improved User Feedback'
    ],
    relatedArchTypes: ['Microservices', 'Serverless']
  },
  {
    id: 'idempotency',
    term: 'Idempotency',
    category: 'Architectural Patterns',
    shortDefinition: 'Ensures repeating an operation multiple times produces the exact same result as executing it once.',
    fullDefinition: 'An operation is idempotent if executing it multiple times yields the same state change as a single execution. In distributed network systems with retries, idempotency keys prevent duplicate payments or orders.',
    realWorldScenario: 'A user double-clicks "Submit Payment" on a lagging connection. The client sends an Idempotency-Key header; the API executes the charge once and returns the cached confirmation for the duplicate retry.',
    keyBenefits: [
      'Prevents Duplicate Mutations on Network Retries',
      'Safely Replays Failed Background Jobs',
      'Guarantees Data Consistency'
    ],
    relatedArchTypes: ['Event-Driven', 'Microservices', 'Monolithic'],
    codeOrSchemaSnippet: {
      title: 'Idempotency Key Check Header',
      language: 'yaml',
      code: `POST /api/v1/payments
Host: api.bank.com
Idempotency-Key: 8f4d92e1-4c11-4a88-a621-12bf6342011a
Content-Type: application/json`
    }
  },
  {
    id: 'sidecar-pattern',
    term: 'Sidecar Pattern',
    category: 'Cloud & Infrastructure',
    shortDefinition: 'Deploys supporting helper tasks alongside a primary application in a separate container.',
    fullDefinition: 'Attaches secondary helper functionality (such as logging, proxying, metric collection, or mTLS encryption) into a separate companion container sharing the same network/pod namespace without polluting primary application code.',
    realWorldScenario: 'Envoy proxy containers deployed as sidecars in Kubernetes to handle mTLS encryption and request tracing for a Go microservice.',
    keyBenefits: [
      'Language-Agnostic Cross-Cutting Capabilities',
      'Separation of Business Logic from Infrastructure Ops',
      'Zero Code Changes Required for App Containers'
    ],
    relatedArchTypes: ['Microservices', 'Service Mesh']
  },
  {
    id: 'anti-corruption-layer',
    term: 'Anti-Corruption Layer (ACL)',
    category: 'Domain-Driven Design',
    shortDefinition: 'Translates domain models between a new system and legacy subsystems.',
    fullDefinition: 'A facade or adapter layer placed between two subsystems with different domain models. It translates calls back and forth so the new clean system is not polluted or corrupted by legacy concepts or database formats.',
    realWorldScenario: 'A modern cloud microservice communicating with a 20-year-old COBOL mainframe database via a dedicated translation layer.',
    keyBenefits: [
      'Isolates Modern Domain Models from Legacy Debt',
      'Facilitates Strangler Fig Migration Strategies',
      'Maintains Clean Bounded Context Boundaries'
    ],
    relatedArchTypes: ['Microservices', 'Modular Monolith']
  },
  {
    id: 'acid',
    term: 'ACID Guarantees',
    category: 'Data & Persistence',
    shortDefinition: 'Atomicity, Consistency, Isolation, Durability guarantees for database transactions.',
    fullDefinition: 'Set of properties that guarantee database transactions are processed reliably. Atomicity (all or nothing), Consistency (valid state transitions), Isolation (concurrent transactions don\'t interfere), Durability (persisted permanently).',
    realWorldScenario: 'Transferring $100 from Account A to B must deduct from A AND credit B in a single transaction. If server crashes mid-way, neither change persists.',
    keyBenefits: [
      'Zero Financial Ledger Discrepancies',
      'Predictable Concurrent Data Safety',
      'Absolute Data Integrity'
    ],
    relatedArchTypes: ['Monolithic', 'Modular Monolith']
  },
  {
    id: 'cap-theorem',
    term: 'CAP Theorem',
    category: 'Architectural Patterns',
    shortDefinition: 'In a distributed network partition, you must choose between Consistency or Availability.',
    fullDefinition: 'States that any distributed data store can simultaneously provide at most two of three guarantees: Consistency (every read gets the most recent write), Availability (every request receives a non-error response), Partition Tolerance (system operates despite network dropouts).',
    realWorldScenario: 'When a network cable breaks between East Coast and West Coast data centers, a database must either decline writes to guarantee Consistency (CP) or accept writes on both sides and resolve conflicts later for Availability (AP).',
    keyBenefits: [
      'Guides Distributed Database Selection',
      'Clarifies System Trade-Off Expectations'
    ],
    relatedArchTypes: ['Microservices', 'Event-Driven', 'Peer-to-Peer']
  },
  {
    id: 'polyglot-persistence',
    term: 'Polyglot Persistence',
    category: 'Data & Persistence',
    shortDefinition: 'Using multiple distinct database engines tailored to specific data storage needs.',
    fullDefinition: 'The practice of selecting different database technologies (e.g. relational SQL, key-value Redis, document MongoDB, graph Neo4j, search Elasticsearch) for different microservices based on their unique access patterns.',
    realWorldScenario: 'A social network storing user transactions in PostgreSQL, friend graphs in Neo4j, posts in MongoDB, and active session tokens in Redis.',
    keyBenefits: [
      'Optimal Read/Write Performance per Use Case',
      'No Forcing Complex Data into Unsuited Schemas',
      'High Architectural Precision'
    ],
    relatedArchTypes: ['Microservices', 'Event-Driven']
  },
  {
    id: 'strangler-fig',
    term: 'Strangler Fig Migration Pattern',
    category: 'Architectural Patterns',
    shortDefinition: 'Incrementally replaces legacy monolith features with new microservices until the old system is gone.',
    fullDefinition: 'An architectural refactoring strategy named after strangler vines that grow around trees. Features are carved out of a legacy monolithic application one API route at a time into new microservices, behind a proxy, minimizing rewrite risk.',
    realWorldScenario: 'Migrating a massive legacy monolith to microservices over 2 years by routing 10% of API endpoints (e.g., Notifications) to new services first.',
    keyBenefits: [
      'Zero Big-Bang Migration Downtime Risk',
      'Continuous Value Delivery during Refactoring',
      'Reversible Phase-by-Phase Execution'
    ],
    relatedArchTypes: ['Monolithic', 'Microservices', 'Modular Monolith']
  },
  {
    id: 'outbox-pattern',
    term: 'Transactional Outbox Pattern',
    category: 'Data & Persistence',
    shortDefinition: 'Reliably publishes domain events by saving them in a database outbox table within the same transaction.',
    fullDefinition: 'Solves dual-write problems where an application needs to update a database and publish a message to Kafka simultaneously. The event is written to an "outbox" table in the primary DB transaction, and an asynchronous worker pushes it to the message queue.',
    realWorldScenario: 'Preventing orders from being created in SQL without triggering their corresponding shipping events in Kafka if the broker is briefly offline.',
    keyBenefits: [
      'Guarantees At-Least-Once Event Delivery',
      'Eliminates Two-Phase Commit (2PC) Overhead',
      'Prevents Data Inconsistency between DB & Message Queue'
    ],
    relatedArchTypes: ['Event-Driven', 'Microservices']
  },
  {
    id: 'gitops',
    term: 'GitOps',
    category: 'Operations & DevOps',
    shortDefinition: 'Manages infrastructure and app configuration using Git repositories as the single source of truth.',
    fullDefinition: 'An operational framework where cloud infrastructure and Kubernetes cluster state are declaratively defined in Git. Automated controllers (e.g., ArgoCD) continuously poll Git and pull changes into production clusters.',
    realWorldScenario: 'Deploying a new microservice release by merging a pull request that updates a Kubernetes YAML manifest image tag.',
    keyBenefits: [
      'Complete Audit Traceability via Git Commits',
      'Instant Rollbacks via `git revert`',
      'Zero Direct kubectl Production Cluster Access Required'
    ],
    relatedArchTypes: ['Microservices', 'Serverless']
  },
  {
    id: 'mtls',
    term: 'mTLS (Mutual TLS)',
    category: 'Security & Governance',
    shortDefinition: 'Two-way cryptographic authentication where both client and server verify each other\'s certificates.',
    fullDefinition: 'Unlike standard HTTPS where only the server proves its identity, mutual TLS requires both client and server microservices to present valid X.509 certificates to establish an encrypted TLS tunnel.',
    realWorldScenario: 'Service A communicating with Service B inside a Kubernetes service mesh, ensuring rogue internal containers cannot spoof requests.',
    keyBenefits: [
      'Enforces Zero-Trust Network Architecture',
      'Prevents Man-In-The-Middle (MITM) & Eavesdropping',
      'Provides Cryptographic Service Identity'
    ],
    relatedArchTypes: ['Microservices', 'Service Mesh']
  }
];
