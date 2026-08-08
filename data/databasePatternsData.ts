export interface DatabasePattern {
  id: string;
  name: string;
  category: 'Scaling & Partitioning' | 'Distributed Consistency' | 'Data Storage Optimization' | 'Audit & Compliance';
  tagline: string;
  problemScenario: string;
  solutionDescription: string;
  tradeOffs: {
    pros: string[];
    cons: string[];
  };
  keyUseCases: string[];
  recommendedEngines: string[];
  schemaImplementation: {
    title: string;
    language: 'sql' | 'typescript' | 'json' | 'yaml';
    antiPatternCode: string;
    antiPatternExplanation: string;
    refactoredCode: string;
    refactoredExplanation: string;
  };
  architecturalTips: string[];
}

export const DATABASE_PATTERNS_DATA: DatabasePattern[] = [
  {
    id: 'sharding-partitioning',
    name: 'Sharding & Horizontal Partitioning',
    category: 'Scaling & Partitioning',
    tagline: 'Distribute data horizontally across independent database nodes using a shard key.',
    problemScenario: 'A global e-commerce payment ledger accumulates 500 million records in a single PostgreSQL database table. Write lock contention and index re-building cause severe latency spikes during peak sales.',
    solutionDescription: 'Partition the database horizontally by routing records to dedicated database nodes (shards) based on a Shard Key (e.g., tenant_id or user_id). Each shard holds a subset of data with identical schema.',
    tradeOffs: {
      pros: [
        'Linear Write & Read Throughput Scaling across multiple servers',
        'Prevents Single Point of Failure and reduces blast radius',
        'Allows geographical data residency compliance (e.g. EU data in EU shards)'
      ],
      cons: [
        'Cross-shard joins are extremely expensive or unsupported',
        'Complex re-sharding / re-balancing required as shards grow unevenly',
        'Distributed transactions across shards require complex coordination'
      ]
    },
    keyUseCases: [
      'Multi-tenant SaaS platforms (Shard by Tenant ID)',
      'High-frequency financial transaction ledgers',
      'Global user profile data stores'
    ],
    recommendedEngines: ['CockroachDB', 'Citus for PostgreSQL', 'Vitess for MySQL', 'AWS DynamoDB'],
    schemaImplementation: {
      title: 'Declarative PostgreSQL Shard Partitioning Strategy',
      language: 'sql',
      antiPatternCode: `-- ❌ ANTI-PATTERN: Single massive monolithic table causing index bloat & lock contention
CREATE TABLE customer_orders (
  id UUID PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2),
  created_at TIMESTAMP
);
-- Over 100M rows, B-Tree index lookups become extremely slow and exhaust RAM!`,
      antiPatternExplanation: 'A single monolithic table exhausts CPU/RAM cache during high-volume concurrent writes and creates massive B-tree indexes that no longer fit in memory.',
      refactoredCode: `-- ✅ REFACTORED: Declarative Range/Hash Partitioning by Tenant ID

-- 1. Root Partitioned Table
CREATE TABLE customer_orders (
  id UUID NOT NULL,
  tenant_id VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2),
  created_at TIMESTAMP,
  PRIMARY KEY (tenant_id, id)
) PARTITION BY HASH (tenant_id);

-- 2. Physical Shard Partitions distributed across storage
CREATE TABLE customer_orders_shard_0 PARTITION OF customer_orders
  FOR VALUES WITH (MODULUS 4, REMAINDER 0);

CREATE TABLE customer_orders_shard_1 PARTITION OF customer_orders
  FOR VALUES WITH (MODULUS 4, REMAINDER 1);

CREATE TABLE customer_orders_shard_2 PARTITION OF customer_orders
  FOR VALUES WITH (MODULUS 4, REMAINDER 2);

CREATE TABLE customer_orders_shard_3 PARTITION OF customer_orders
  FOR VALUES WITH (MODULUS 4, REMAINDER 3);`,
      refactoredExplanation: 'Hash partitioning automatically routes queries containing tenant_id to the exact physical shard partition, ensuring index sizes stay small and writes scale horizontally.'
    },
    architecturalTips: [
      'Choose a high-cardinality Shard Key to ensure even data distribution across shards.',
      'Avoid queries without the Shard Key; otherwise, the router must query all shards in parallel (Scatter-Gather).',
      'Consider managed distributed SQL engines (CockroachDB, Spanner) to handle auto-sharding automatically.'
    ]
  },
  {
    id: 'transactional-outbox',
    name: 'Transactional Outbox Pattern',
    category: 'Distributed Consistency',
    tagline: 'Guarantee reliable event publishing without dual-write inconsistency risks.',
    problemScenario: 'An order service updates its SQL database and then sends an event to Kafka. If the Kafka broker drops the connection after the DB commit, other microservices never receive the OrderCreated event.',
    solutionDescription: 'Write the domain state update and an outbox event record within the SAME local ACID database transaction. A separate async background process (or Debezium CDC) reads the outbox table and reliably publishes to Kafka.',
    tradeOffs: {
      pros: [
        'Guarantees At-Least-Once event delivery without two-phase commit (2PC) performance penalty',
        'Eliminates dual-write partial failure risks',
        'Works with any relational database supporting standard transactions'
      ],
      cons: [
        'Requires downstream message consumers to be idempotent to handle retries',
        'Adds minor latency between local DB write and Kafka message delivery',
        'Outbox table requires periodic pruning/archiving worker'
      ]
    },
    keyUseCases: [
      'Microservices communicating via Kafka/RabbitMQ event streams',
      'E-commerce order fulfillment pipelines',
      'Financial transfer auditing systems'
    ],
    recommendedEngines: ['PostgreSQL + Debezium CDC', 'MySQL + Kafka Connect', 'MongoDB Change Streams'],
    schemaImplementation: {
      title: 'Atomic Outbox Transaction Implementation (TypeScript + SQL)',
      language: 'typescript',
      antiPatternCode: `// ❌ ANTI-PATTERN: Vulnerable Dual-Write
async function createOrder(orderData: OrderData) {
  // 1. Commit to SQL
  await db.query('INSERT INTO orders ...', [orderData]);

  // 2. Network call to Kafka (IF THIS FAILS, EVENT IS LOST FOREVER!)
  await kafkaProducer.send({ topic: 'orders', message: orderData });
}`,
      antiPatternExplanation: 'If the process crashes or Kafka throws a network error after step 1, the order exists in the DB but downstream services are never notified.',
      refactoredCode: `// ✅ REFACTORED: Transactional Outbox Pattern
async function createOrderWithOutbox(orderData: OrderData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Write core business entity
    const orderRes = await client.query(
      'INSERT INTO orders (id, customer_id, total) VALUES ($1, $2, $3) RETURNING id',
      [orderData.id, orderData.customerId, orderData.total]
    );

    // 2. Write Outbox Event within SAME ACID TRANSACTION
    await client.query(
      \`INSERT INTO outbox_events (id, aggregate_type, aggregate_id, event_type, payload)
       VALUES ($1, 'ORDER', $2, 'ORDER_CREATED', $3)\`,
      [crypto.randomUUID(), orderData.id, JSON.stringify(orderData)]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}`,
      refactoredExplanation: 'The order and outbox record commit atomically. A background CDC worker or polling thread picks up unread outbox events and pushes them to Kafka with retry guarantees.'
    },
    architecturalTips: [
      'Use Change Data Capture (CDC) like Debezium to stream outbox table changes directly from database WAL logs.',
      'Ensure event consumers handle duplicate messages using unique event IDs or idempotency keys.'
    ]
  },
  {
    id: 'cqrs-read-write-separation',
    name: 'CQRS Read/Write Database Separation',
    category: 'Scaling & Partitioning',
    tagline: 'Decouple high-frequency read views from transactional write models.',
    problemScenario: 'An e-commerce mobile app performs complex SQL JOINs across 8 tables for search & filtering. These heavy read queries lock tables, slowing down checkout write transactions.',
    solutionDescription: 'Separate data mutation (Commands) into an ACID write database (e.g., PostgreSQL) and project read-optimized denormalized documents into a dedicated read database (e.g., Elasticsearch or MongoDB).',
    tradeOffs: {
      pros: [
        'Blazing fast read query latency (< 10ms) via pre-computed denormalized views',
        'Write database is completely freed from complex search & aggregation overhead',
        'Read and write data stores can be scaled independently'
      ],
      cons: [
        'Eventual consistency delay between write DB commit and read model projection',
        'Increased infrastructure complexity with multiple database engines',
        'Requires rebuild scripts if read projection schemas change'
      ]
    },
    keyUseCases: [
      'High-traffic search portals (Product catalogs, Real estate listings)',
      'Analytics dashboards with heavy aggregations',
      'Social media feeds & timelines'
    ],
    recommendedEngines: ['PostgreSQL (Write) + OpenSearch/Elasticsearch (Read)', 'MongoDB + Redis'],
    schemaImplementation: {
      title: 'CQRS Projection Pipeline (Read vs Write Schemas)',
      language: 'json',
      antiPatternCode: `// ❌ ANTI-PATTERN: Normalised 8-table SQL query executed on every page view
SELECT o.id, u.name, p.title, p.price, s.shipping_status
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON oi.product_id = p.id
JOIN shipments s ON s.order_id = o.id
WHERE u.region = 'US-EAST' AND p.category = 'Electronics';`,
      antiPatternExplanation: 'Executing expensive multi-table JOINs on high-frequency user page views locks relational tables and exhausts CPU during sales spikes.',
      refactoredCode: `// ✅ REFACTORED: CQRS Read-Optimized Document Schema (Stored in OpenSearch/Elasticsearch)
{
  "_id": "ord_99823",
  "searchableText": "Wireless Headphones Electronics US-EAST Active",
  "customer": {
    "id": "usr_441",
    "name": "Jane Doe",
    "region": "US-EAST"
  },
  "items": [
    { "title": "Wireless Headphones", "category": "Electronics", "price": 129.99 }
  ],
  "shippingStatus": "IN_TRANSIT",
  "updatedAt": "2026-07-24T01:20:00Z"
}`,
      refactoredExplanation: 'Read queries fetch a single pre-computed JSON document from Elasticsearch in 2ms without running JOINs or locking primary transactional databases.'
    },
    architecturalTips: [
      'Publish domain events upon write mutations to trigger real-time read model projection updates.',
      'Provide immediate optimistic UI updates to mask the 50ms eventual consistency window.'
    ]
  },
  {
    id: 'saga-pattern',
    name: 'Saga Pattern (Orchestrated & Choreographed)',
    category: 'Distributed Consistency',
    tagline: 'Manage distributed transactions across microservices using compensating actions.',
    problemScenario: 'An order spans Order Service, Payment Service, and Inventory Service. Two-phase commits (2PC) are too slow over HTTP. If Payment succeeds but Inventory fails, how do we roll back the Payment safely?',
    solutionDescription: 'Break a global distributed transaction into a sequence of local transactions. Each step executes a local DB transaction and publishes an event. If a step fails, the Saga executes compensating transactions in reverse order to undo prior changes.',
    tradeOffs: {
      pros: [
        'Maintains data consistency across microservices without non-blocking 2PC locks',
        'High performance and scale across distinct database boundaries',
        'Clear failure recovery mechanisms for complex business processes'
      ],
      cons: [
        'Requires writing explicit compensating logic (e.g., Refund Payment, Cancel Reservation)',
        'Lack of isolation: intermediate states are visible to other requests before completion',
        'Debugging distributed state transitions requires centralized tracing'
      ]
    },
    keyUseCases: [
      'Travel reservation booking (Flight + Hotel + Rental Car)',
      'E-commerce order checkout & stock reservation',
      'Financial multi-step fund transfers'
    ],
    recommendedEngines: ['Temporal.io', 'AWS Step Functions', 'Apache Kafka + Camunda'],
    schemaImplementation: {
      title: 'Orchestrated Saga Execution & Compensating Action (TypeScript)',
      language: 'typescript',
      antiPatternCode: `// ❌ ANTI-PATTERN: Direct HTTP cascading calls without failure rollback
async function checkout(order: Order) {
  await orderDb.save(order);
  await paymentService.charge(order.total); // Success!
  await inventoryService.reserve(order.items); // 💥 THROWS ERROR! Payment was charged but stock unavailable!
}`,
      antiPatternExplanation: 'When Inventory reservation fails, the user is left with a charged credit card and no refund because there is no automated rollback workflow.',
      refactoredCode: `// ✅ REFACTORED: Saga Orchestrator with Compensating Actions
export class OrderSagaOrchestrator {
  async executeSaga(order: Order) {
    let paymentCharged = false;

    try {
      // Step 1: Create Pending Order
      await orderDb.updateStatus(order.id, 'PENDING');

      // Step 2: Process Charge
      await paymentService.charge(order.id, order.total);
      paymentCharged = true;

      // Step 3: Reserve Inventory
      await inventoryService.reserve(order.id, order.items);

      // Final Step: Complete Order
      await orderDb.updateStatus(order.id, 'APPROVED');
    } catch (err) {
      // 🔄 COMPENSATING ACTIONS
      console.error('Saga failed, executing compensating actions...', err);
      
      if (paymentCharged) {
        await paymentService.refund(order.id, order.total); // Compensating Action
      }
      
      await orderDb.updateStatus(order.id, 'CANCELLED');
    }
  }
}`,
      refactoredExplanation: 'The Saga orchestrator explicitly executes compensating transactions (e.g. `refund`) if any downstream step fails, restoring business data consistency.'
    },
    architecturalTips: [
      'Use state machine frameworks like Temporal.io or AWS Step Functions to manage long-running Saga state persistence automatically.',
      'Ensure all compensating actions are strictly idempotent.'
    ]
  },
  {
    id: 'polyglot-persistence-topology',
    name: 'Polyglot Persistence Pattern',
    category: 'Data Storage Optimization',
    tagline: 'Combine specialized database engines matching the specific workload of each microservice.',
    problemScenario: 'An enterprise application forces all features (User Auth, Social Graph, Product Search, High-Speed Leaderboards) into a single PostgreSQL database, causing index bloat and query timeouts.',
    solutionDescription: 'Select the optimal database paradigm for each functional domain: Relational for ACID transactions, Graph DB for social connections, Key-Value store for sessions, and Vector DB for AI semantic search.',
    tradeOffs: {
      pros: [
        'Each domain service gets maximum query performance and specialized data structures',
        'Simplified schemas without forced hacky relationships or JSON bloat',
        'Independent database capacity scaling per feature'
      ],
      cons: [
        'Higher operational overhead managing multiple database technologies',
        'Requires engineering teams to master multiple DB query languages and drivers',
        'Cross-service data consistency requires event-driven sync pipelines'
      ]
    },
    keyUseCases: [
      'Social networks with recommendations & feeds',
      'AI-powered e-commerce platforms (Vector search + Relational ledger)',
      'Gaming platforms with real-time leaderboards & player inventories'
    ],
    recommendedEngines: ['PostgreSQL (ACID)', 'Neo4j (Graph)', 'Redis (Cache/Leaderboard)', 'Pinecone (Vector DB)'],
    schemaImplementation: {
      title: 'Polyglot System Architecture Mapping (YAML Specification)',
      language: 'yaml',
      antiPatternCode: `# ❌ ANTI-PATTERN: Forcing all workloads into a single SQL Engine
database_architecture:
  primary_engine: PostgreSQL
  workloads_handled:
    - User Account Authentication
    - Product Recommendation Graph (Executing 10-level JOINs!)
    - Real-Time Session Caching (Frequent disk IO updates!)
    - AI Embedding Vector Search (Extremely heavy CPU utilization!)`,
      antiPatternExplanation: 'Using one database for vastly different access patterns leads to poor performance, CPU spikes, and operational bottlenecks.',
      refactoredCode: `# ✅ REFACTORED: Polyglot Persistence Workload Allocation
polyglot_topology:
  user_accounts:
    engine: PostgreSQL
    reason: "Strict ACID transactions for auth & billing ledgers"
  social_recommendations:
    engine: Neo4j / AWS Neptune
    reason: "Sub-millisecond graph traversal for friend connections"
  session_caching:
    engine: Redis Cluster
    reason: "In-memory key-value cache with < 1ms TTL expiration"
  ai_semantic_search:
    engine: Pinecone / Milvus
    reason: "HNSW vector indexing for fast semantic product search"`,
      refactoredExplanation: 'Each microservice uses the exact database engine built for its data access requirements, maximizing performance and architectural efficiency.'
    },
    architecturalTips: [
      'Do not adopt polyglot persistence prematurely; start with PostgreSQL + Redis and introduce new engines only when justified by NFR metrics.',
      'Use Change Data Capture (CDC) or event buses to keep specialized read replicas in sync.'
    ]
  },
  {
    id: 'temporal-audit-ledger',
    name: 'Temporal Data & Audit Ledger Pattern',
    category: 'Audit & Compliance',
    tagline: 'Track historic state changes and soft deletions with automated time-versioning.',
    problemScenario: 'An enterprise ERP updates employee salary records directly using UPDATE SQL statements. When audited by regulators, the company cannot prove what an employee\'s salary was 6 months ago.',
    solutionDescription: 'Implement system-versioned temporal tables or append-only audit tables. Current state queries remain fast, while historic state snapshots can be queried for any point in time (`AS OF SYSTEM TIME`).',
    tradeOffs: {
      pros: [
        'Complete historical record for regulatory audit compliance (SOX, HIPAA, GDPR)',
        'Effortless point-in-time state reconstruction for debugging',
        'Protects against malicious or accidental row deletions'
      ],
      cons: [
        'Substantially increases storage footprint over time',
        'Requires automated table partitioning or data retention archiving',
        'Update/Delete operations require extra trigger or system overhead'
      ]
    },
    keyUseCases: [
      'Financial ledgers & payroll management',
      'Medical patient electronic health records (EHR)',
      'Legal contract management platforms'
    ],
    recommendedEngines: ['PostgreSQL Temporal Tables', 'CockroachDB (AS OF SYSTEM TIME)', 'SQL Server Temporal Tables'],
    schemaImplementation: {
      title: 'PostgreSQL Temporal Audit Trigger Implementation',
      language: 'sql',
      antiPatternCode: `-- ❌ ANTI-PATTERN: Destructive Update destroying historic context
UPDATE employee_salaries 
SET salary_amount = 120000.00 
WHERE employee_id = 'emp_441';
-- Old salary value is lost forever!`,
      antiPatternExplanation: 'Destructive SQL UPDATE statements destroy historic audit context, leaving no proof of previous state values.',
      refactoredCode: `-- ✅ REFACTORED: Append-Only Historic Audit Ledger
CREATE TABLE employee_salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id VARCHAR(50) NOT NULL,
  salary_amount DECIMAL(12,2) NOT NULL,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  valid_to TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  updated_by VARCHAR(100) NOT NULL
);

-- Query current active salary
SELECT * FROM employee_salaries 
WHERE employee_id = 'emp_441' AND valid_to IS NULL;

-- Query historic salary AS OF 6 months ago
SELECT * FROM employee_salaries 
WHERE employee_id = 'emp_441' 
  AND '2026-01-01 00:00:00' BETWEEN valid_from AND COALESCE(valid_to, '9999-12-31');`,
      refactoredExplanation: 'By setting valid_to on old records and inserting new records with valid_from, the database retains a complete temporal history for point-in-time compliance queries.'
    },
    architecturalTips: [
      'Combine temporal audit tables with database triggers or ORM middleware so developers cannot bypass historic logging.',
      'Set up cold storage partition archiving for audit data older than 3–7 years.'
    ]
  }
];
