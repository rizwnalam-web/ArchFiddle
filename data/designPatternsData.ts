import { ArchType } from '../types';

export interface DesignPattern {
  id: string;
  name: string;
  category: 'Cloud & Distributed' | 'Creational' | 'Structural' | 'Behavioral';
  tagline: string;
  icon: string;
  problemScenario: string;
  solutionExplanation: string;
  codeExample: {
    language: 'typescript' | 'json' | 'csharp';
    title: string;
    code: string;
  };
  realWorldUseCases: string[];
  whenToUse: string[];
  whenNotToUse: string[];
  pros: string[];
  cons: string[];
  relatedArchTypes: ArchType[];
}

export const DESIGN_PATTERNS_DATA: DesignPattern[] = [
  {
    id: 'cqrs',
    name: 'Command Query Responsibility Segregation (CQRS)',
    category: 'Cloud & Distributed',
    tagline: 'Isolate read data models from write data models to scale throughput and optimize query speeds.',
    icon: '⚡',
    problemScenario: 'In high-throughput e-commerce or financial systems, complex relational joins for reporting and search slow down transactional writes (e.g. order placement), creating database lock contention and performance bottlenecks.',
    solutionExplanation: 'Separate write operations (Commands that mutate state) from read operations (Queries that return data). Writes execute against a normalized OLTP store, while reads query an optimized denormalized view (e.g. Redis, Elasticsearch) populated asynchronously via events.',
    codeExample: {
      language: 'typescript',
      title: 'CQRS Command & Query Handler Implementation',
      code: `// 1. COMMAND: Mutates State
interface PlaceOrderCommand {
  type: 'PLACE_ORDER';
  orderId: string;
  customerId: string;
  items: Array<{ sku: string; qty: number }>;
}

class OrderCommandHandler {
  async handle(cmd: PlaceOrderCommand): Promise<void> {
    // Validate business rules
    const order = new OrderAggregate(cmd.orderId, cmd.customerId, cmd.items);
    await orderRepository.save(order);
    
    // Publish Event to sync Read Model
    await eventBus.publish({
      type: 'ORDER_PLACED_EVENT',
      payload: { orderId: order.id, customerId: order.customerId, total: order.totalAmount }
    });
  }
}

// 2. QUERY: Fast Denormalized Read
class OrderQueryHandler {
  async getCustomerSummary(customerId: string): Promise<CustomerOrderSummaryView> {
    // Fast single key read from cached search index / Redis
    return await readCache.get(\`customer:\${customerId}:orders\`);
  }
}`
    },
    realWorldUseCases: [
      'E-Commerce order fulfillment & live tracking dashboards',
      'Banking transaction processing & historical account balance statements',
      'High-scale IoT sensor logging and analytics visualizers'
    ],
    whenToUse: [
      'Read operations significantly outnumber write operations (e.g., 100:1 ratio)',
      'Complex domain models require distinct read projections for mobile, web, and reporting'
    ],
    whenNotToUse: [
      'Simple CRUD applications where data models are identical for reads and writes',
      'Systems requiring immediate, strict consistency across all read queries without eventual consistency delay'
    ],
    pros: [
      'Independent scaling of read and write storage tiers',
      'Optimized query performance without expensive SQL joins',
      'Clear separation of business write logic from read presentation'
    ],
    cons: [
      'Introduces eventual consistency lag between writes and read views',
      'Increases code complexity and operational infrastructure requirements'
    ],
    relatedArchTypes: [ArchType.EventDriven, ArchType.Microservices, ArchType.SOA]
  },
  {
    id: 'saga',
    name: 'Saga Pattern (Orchestrated & Choreographed)',
    category: 'Cloud & Distributed',
    tagline: 'Maintain data consistency across distributed microservices using a sequence of local transactions and compensating transactions.',
    icon: '🔄',
    problemScenario: 'In microservices, transactions span multiple database boundaries (e.g., Payment Service, Inventory Service, Shipping Service). Traditional 2-Phase Commit (2PC) locks services and does not scale across network boundaries.',
    solutionExplanation: 'Execute a series of local transactions. Each transaction updates its own database and publishes an event or triggers the next step. If a step fails, compensating transactions are executed in reverse to roll back previous state changes.',
    codeExample: {
      language: 'typescript',
      title: 'Saga Orchestrator State Machine',
      code: `class OrderSagaOrchestrator {
  async executeSaga(orderId: string, paymentInfo: PaymentDetails) {
    try {
      // Step 1: Reserve Inventory
      const inventoryReserved = await inventoryService.reserve(orderId);
      if (!inventoryReserved) throw new Error('INVENTORY_FAILED');

      // Step 2: Process Payment
      const paymentCharged = await paymentService.charge(orderId, paymentInfo);
      if (!paymentCharged) {
        // Compensate Step 1!
        await inventoryService.releaseReservation(orderId);
        throw new Error('PAYMENT_FAILED');
      }

      // Step 3: Dispatch Shipment
      await shippingService.createLabel(orderId);
      await orderService.updateStatus(orderId, 'CONFIRMED');
    } catch (error) {
      await orderService.updateStatus(orderId, 'FAILED_CANCELLED');
    }
  }
}`
    },
    realWorldUseCases: [
      'Flight, hotel, and car rental multi-booking booking engine',
      'E-commerce multi-vendor fulfillment pipelines',
      'Ride-sharing dispatch & driver payment authorization'
    ],
    whenToUse: [
      'Distributed business processes spanning multiple independent microservices',
      'Long-running business transactions that cannot hold database locks'
    ],
    whenNotToUse: [
      'Single monolithic database transactions where native ACID transactions exist',
      'Highly tightly coupled operations requiring synchronous atomic rollbacks'
    ],
    pros: [
      'Enables non-blocking distributed transactions across microservices',
      'Avoids global database lock contention'
    ],
    cons: [
      'Requires designing explicit compensating transactions for every step',
      'Debugging saga execution histories requires robust correlation IDs and distributed tracing'
    ],
    relatedArchTypes: [ArchType.Microservices, ArchType.EventDriven, ArchType.Serverless]
  },
  {
    id: 'circuit-breaker',
    name: 'Circuit Breaker Pattern',
    category: 'Cloud & Distributed',
    tagline: 'Prevent cascading failures in distributed systems when calling an unstable third-party API or downstream microservice.',
    icon: '🔌',
    problemScenario: 'When a downstream microservice or payment gateway suffers an outage, calling services block waiting for timeouts, exhausting thread pools and crashing the entire platform.',
    solutionExplanation: 'Wrap remote service calls in a circuit breaker object that monitors for failure rates. If failures cross a threshold, the breaker "trips" (Open state) and immediately returns fallback responses or errors without attempting remote network calls.',
    codeExample: {
      language: 'typescript',
      title: 'Circuit Breaker State Implementation',
      code: `enum CircuitState { CLOSED, OPEN, HALF_OPEN }

class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;

  constructor(
    private failureThreshold = 5,
    private cooldownMs = 10000
  ) {}

  async execute<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.cooldownMs) {
        this.state = CircuitState.HALF_OPEN; // Test downstream health
      } else {
        return fallback; // Fast fail immediately!
      }
    }

    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (err) {
      this.handleFailure();
      return fallback;
    }
  }

  private handleFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  private reset() {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }
}`
    },
    realWorldUseCases: [
      'Third-party payment gateways (Stripe / PayPal API integration)',
      'External geolocation & address verification REST endpoints',
      'Inter-service REST calls in microservice mesh architectures'
    ],
    whenToUse: [
      'Any distributed system interacting with networks or external APIs prone to latency spikes or downtime'
    ],
    whenNotToUse: [
      'In-memory synchronous calls within the same process',
      'Local database transactions where native retry/backoff is sufficient'
    ],
    pros: [
      'Protects system resources (threads/memory) from exhaustion',
      'Provides fast failure feedback to end users rather than hanging spinners',
      'Allows downstream services time to recover without being hammered'
    ],
    cons: [
      'Requires sensible fallback strategies for user experience',
      'Adds state tracking overhead and configuration complexity'
    ],
    relatedArchTypes: [ArchType.Microservices, ArchType.ContainerNative, ArchType.Serverless]
  },
  {
    id: 'outbox',
    name: 'Transactional Outbox Pattern',
    category: 'Cloud & Distributed',
    tagline: 'Guarantees reliable event publishing without distributed 2-Phase Commit transactions.',
    icon: '📦',
    problemScenario: 'A service updates its local database and then publishes a message to Kafka/RabbitMQ. If the app crashes right after updating the database but before sending the message, data becomes permanently inconsistent.',
    solutionExplanation: 'Save both the entity state AND the outgoing message event in the SAME local database transaction into an "Outbox" table. A separate background process polls the Outbox table and publishes events reliably to the message broker.',
    codeExample: {
      language: 'typescript',
      title: 'Transactional Outbox Writer & Poller',
      code: `// 1. Transactionally write Order + Outbox Event in same DB Transaction
async function createOrderWithOutbox(dbTx: DatabaseTransaction, orderData: Order) {
  await dbTx.orders.insert(orderData);

  await dbTx.outbox.insert({
    id: crypto.randomUUID(),
    aggregateType: 'Order',
    aggregateId: orderData.id,
    eventType: 'OrderCreated',
    payload: JSON.stringify(orderData),
    status: 'PENDING',
    createdAt: new Date()
  });
}

// 2. Separate Async Relay Worker
async function processOutboxQueue() {
  const pendingEvents = await db.outbox.findMany({ where: { status: 'PENDING' }, take: 50 });

  for (const event of pendingEvents) {
    await messageBroker.publish(event.eventType, event.payload);
    await db.outbox.update({ where: { id: event.id }, data: { status: 'PROCESSED' } });
  }
}`
    },
    realWorldUseCases: [
      'Microservice state persistence coupled with event streams',
      'Financial ledger audit logs with messaging queues',
      'CDC (Change Data Capture) with Debezium'
    ],
    whenToUse: [
      'You must guarantee at-least-once message delivery when mutating database records'
    ],
    whenNotToUse: [
      'Scenarios where losing an occasional event is acceptable (e.g. non-critical telemetry logs)'
    ],
    pros: [
      '100% reliable event publishing tied to local database ACID guarantees',
      'Eliminates dual-write race conditions and partial failures'
    ],
    cons: [
      'Consumers must handle duplicate messages (idempotent receiver requirements)'
    ],
    relatedArchTypes: [ArchType.EventDriven, ArchType.Microservices, ArchType.SOA]
  },
  {
    id: 'strategy',
    name: 'Strategy Pattern',
    category: 'Behavioral',
    tagline: 'Define a family of algorithms, encapsulate each one, and make them interchangeable at runtime.',
    icon: '🎯',
    problemScenario: 'A system needs to support multiple payment methods (Credit Card, PayPal, Crypto, Apple Pay). Using nested `if-else` or `switch` statements creates bloated, fragile code that violates the Open-Closed Principle.',
    solutionExplanation: 'Define a common interface for all algorithms and encapsulate each algorithm in its own strategy class. The client delegates execution to the configured strategy at runtime.',
    codeExample: {
      language: 'typescript',
      title: 'Payment Strategy Interface & Implementations',
      code: `interface PaymentStrategy {
  pay(amount: number): Promise<{ success: boolean; txId: string }>;
}

class StripeStrategy implements PaymentStrategy {
  async pay(amount: number) {
    console.log(\`Charging $\${amount} via Stripe SDK\`);
    return { success: true, txId: 'stripe_123' };
  }
}

class PayPalStrategy implements PaymentStrategy {
  async pay(amount: number) {
    console.log(\`Charging $\${amount} via PayPal REST API\`);
    return { success: true, txId: 'pp_456' };
  }
}

// Context Class
class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}

  setStrategy(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  async process(amount: number) {
    return await this.strategy.pay(amount);
  }
}`
    },
    realWorldUseCases: [
      'Multi-provider payment gateway integration',
      'Dynamic pricing algorithms (surge pricing, discount tier rules)',
      'Pluggable authentication strategies (OAuth, SAML, Local JWT)'
    ],
    whenToUse: [
      'You have multiple variants of an algorithm or business rule that change dynamically'
    ],
    whenNotToUse: [
      'When you only have 1 or 2 static algorithms that rarely or never change'
    ],
    pros: [
      'Adheres to Open/Closed Principle (add new strategies without modifying existing code)',
      'Eliminates giant conditional switch blocks'
    ],
    cons: [
      'Clients must be aware of different strategies to select the correct one'
    ],
    relatedArchTypes: [ArchType.Monolithic, ArchType.Layered, ArchType.WebOriented]
  },
  {
    id: 'factory',
    name: 'Factory Method & Abstract Factory',
    category: 'Creational',
    tagline: 'Provide an interface for creating objects in a superclass, but allow subclasses or factories to alter the type of objects created.',
    icon: '🏭',
    problemScenario: 'Instantiating complex cloud database connections or cloud notification services directly with `new MyClass()` tightly couples application code to specific vendor SDKs.',
    solutionExplanation: 'Delegate object instantiation to a factory class that encapsulates the construction logic and returns uniform interface instances based on configuration or environment.',
    codeExample: {
      language: 'typescript',
      title: 'Cloud Storage Factory Pattern',
      code: `interface StorageClient {
  uploadFile(path: string, buffer: Buffer): Promise<string>;
}

class S3StorageClient implements StorageClient {
  async uploadFile(path: string, buffer: Buffer) {
    return \`https://s3.amazonaws.com/my-bucket/\${path}\`;
  }
}

class AzureBlobClient implements StorageClient {
  async uploadFile(path: string, buffer: Buffer) {
    return \`https://myaccount.blob.core.windows.net/container/\${path}\`;
  }
}

// Factory
class StorageFactory {
  static createClient(provider: 'aws' | 'azure'): StorageClient {
    if (provider === 'aws') return new S3StorageClient();
    if (provider === 'azure') return new AzureBlobClient();
    throw new Error('Unsupported provider');
  }
}`
    },
    realWorldUseCases: [
      'Multi-cloud abstraction layers (AWS S3 vs Azure Blob vs GCP Storage)',
      'UI component library renderers across platforms (Web vs Mobile)',
      'Database driver connection managers'
    ],
    whenToUse: [
      'When exact object types cannot be known until runtime configuration is parsed'
    ],
    whenNotToUse: [
      'Simple object creation where direct constructor calls are clear and unvarying'
    ],
    pros: [
      'Decouples object creation from application core logic',
      'Simplifies unit testing with mock factory injection'
    ],
    cons: [
      'Requires creating multiple additional class files and interfaces'
    ],
    relatedArchTypes: [ArchType.Layered, ArchType.Monolithic, ArchType.SOA]
  }
];
