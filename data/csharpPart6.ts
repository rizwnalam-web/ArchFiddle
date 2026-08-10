import { InterviewQuestion } from './interviewPrepData';

export const CSHARP_PART6: InterviewQuestion[] = [
  {
    id: 'csnet-56',
    category: 'C# & .NET',
    question: '56. How do Aggregate Roots manage Domain Events in C#, and how are events dispatched via MediatR during SaveChangesAsync?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'Domain Events', 'Aggregate Root', 'MediatR', 'DDD'],
    shortSummary: 'Explains in-memory domain events collection, dispatching before or after SQL commit, and eventual consistency.',
    detailedAnswer: {
      executiveSummary: 'An Aggregate Root maintains domain consistency across a boundary of entities. When internal domain state changes (e.g. `LoanApplication.Approve()`), it records a Domain Event in an internal collection. When the active `DbContext.SaveChangesAsync()` executes, an EF Core interceptor or overridden SaveChanges method extracts all domain events from tracked aggregates and dispatches them via `IMediator.Publish()` before or after the database transaction commits.',
      keyPoints: [
        'Domain Events: In-process notifications representing domain state transitions that occurred within the aggregate.',
        'Aggregate Root Boundary: Only the root entity exposes methods to external callers and raises domain events.',
        'Pre-Commit Dispatch: Events participate in the same local transaction (useful for domain validation rules).',
        'Post-Commit Dispatch: Events fire after database commit (useful for triggering outbox messages, email, or external notifications).'
      ],
      codeOrQuerySnippet: {
        title: 'Dispatching Domain Events in EF Core SaveChangesAsync',
        language: 'csharp',
        code: `public abstract class BaseEntity
{
    private readonly List<INotification> _domainEvents = [];
    public IReadOnlyCollection<INotification> DomainEvents => _domainEvents.AsReadOnly();

    public void AddDomainEvent(INotification domainEvent) => _domainEvents.Add(domainEvent);
    public void ClearDomainEvents() => _domainEvents.Clear();
}

public class DomainEventDispatcherInterceptor(IMediator mediator) : SaveChangesInterceptor
{
    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData, int result, CancellationToken cancellationToken = default)
    {
        var context = eventData.Context;
        if (context == null) return result;

        var domainEntities = context.ChangeTracker
            .Entries<BaseEntity>()
            .Where(x => x.Entity.DomainEvents.Any())
            .Select(x => x.Entity)
            .ToList();

        var events = domainEntities.SelectMany(x => x.DomainEvents).ToList();
        domainEntities.ForEach(x => x.ClearDomainEvents());

        foreach (var domainEvent in events)
        {
            await mediator.Publish(domainEvent, cancellationToken);
        }

        return result;
    }
}`
      },
      proTipOrPitfall: 'Always clear domain events from the entity collection immediately upon dispatching to prevent duplicate re-dispatching if SaveChanges is retried.',
      studyResources: [
        {
          title: 'Domain events: Design and implementation (.NET)',
          url: 'https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-events-design-implementation',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-57',
    category: 'C# & .NET',
    question: '57. Why is EF Core DbContext already a Unit of Work & Repository, and what are the architectural trade-offs of generic Repository<T> wrappers?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'EF Core', 'Repository Pattern', 'Unit of Work', 'Architecture'],
    shortSummary: 'Compares DbContext/DbSet vs generic IRepository<T>, abstraction leakage, query optimization limits, and testability.',
    detailedAnswer: {
      executiveSummary: 'In Martin Fowler\'s enterprise patterns, `DbContext` implements the **Unit of Work** (managing transactions and coordinating changes) and `DbSet<T>` implements the **Repository** (in-memory collection representation). Wrapping EF Core in generic `IRepository<T>` often creates an "anemic abstraction" that hides powerful EF Core features (`AsNoTracking`, `Include`, `ExecuteUpdate`, `AsSplitQuery`) or results in N+1 query leaks when `IQueryable` escapes the repository boundary.',
      keyPoints: [
        'DbContext as Unit of Work: Tracks changes, manages database transactions, and commits batches atomically.',
        'DbSet<T> as Repository: Provides LINQ querying, adding, updating, and removing entities.',
        'Generic Repository Anti-Pattern: Exposing `IQueryable<T>` from repositories leaks ORM internals and defeats repository encapsulation.',
        'Modern Approach: Use specific feature repositories with intention-revealing methods (e.g. `ILoanReadRepository.GetDashboardSummaryAsync()`) or inject DbContext directly into CQRS handlers.'
      ],
      codeOrQuerySnippet: {
        title: 'Direct CQRS Handler using DbContext vs Flawed Generic Repository',
        language: 'csharp',
        code: `// Preferred Modern Approach: Feature-specific handler using EF Core directly with CQRS
public class GetMortgageRatesQueryHandler(MortgageDbContext dbContext) 
    : IRequestHandler<GetMortgageRatesQuery, List<RateSummaryDto>>
{
    public async Task<List<RateSummaryDto>> Handle(GetMortgageRatesQuery request, CancellationToken ct)
    {
        // Full access to EF Core optimization features without repository impedance mismatch
        return await dbContext.Rates
            .AsNoTracking()
            .Where(r => r.StateCode == request.StateCode)
            .Select(r => new RateSummaryDto(r.LenderId, r.InterestRate))
            .ToListAsync(ct);
    }
}`
      },
      proTipOrPitfall: 'If you must create repositories, make them intention-specific (e.g., `ILoanApplicationRepository`) and return materialized domain models (`Task<LoanApplication>`), NEVER `IQueryable<T>`.',
      studyResources: [
        {
          title: 'Infrastructure persistence layer design in .NET',
          url: 'https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-58',
    category: 'C# & .NET',
    question: '58. How does the Saga Pattern manage distributed transactions across .NET microservices, and how do Orchestration vs Choreography compare?',
    difficulty: 'Principal Architect',
    tags: ['C#', 'Saga Pattern', 'Distributed Systems', 'MassTransit', 'Microservices', 'Event-Driven'],
    shortSummary: 'Explains compensating transactions, event choreography vs centralized orchestrator state machine, and MassTransit Automatonymous.',
    detailedAnswer: {
      executiveSummary: 'Because distributed 2-Phase Commit (2PC) locks database resources and fails in cloud environments, the Saga Pattern coordinates distributed transactions across microservices using a sequence of local transactions. Each local step commits locally and publishes an event. If a step fails (e.g., Credit Check fails), compensating transactions execute in reverse order to rollback previous steps. Choreography uses peer-to-peer event listening, while Orchestration uses a centralized state machine (like MassTransit Automatonymous) to direct steps.',
      keyPoints: [
        'Local Transactions: Each service commits to its own database locally without cross-database distributed locks.',
        'Compensating Actions: Explicit business undo operations (e.g. `RefundPayment()`, `CancelReservation()`).',
        'Choreography: Services react to each other\'s events; simple for 2-3 services, unmanageable spaghetti for complex flows.',
        'Orchestration: Central state machine coordinates workflow, handles timeouts, and triggers compensations.'
      ],
      codeOrQuerySnippet: {
        title: 'MassTransit State Machine Saga Orchestrator in C#',
        language: 'csharp',
        code: `public class MortgageApplicationSagaState : SagaStateMachineInstance
{
    public Guid CorrelationId { get; set; }
    public string CurrentState { get; set; } = null!;
    public Guid LoanId { get; set; }
    public decimal LoanAmount { get; set; }
}

public class MortgageApplicationStateMachine : MassTransitStateMachine<MortgageApplicationSagaState>
{
    public State Underwriting { get; private set; } = null!;
    public State Approved { get; private set; } = null!;
    public State Rejected { get; private set; } = null!;

    public Event<SubmitLoanApplicationCommand> LoanSubmitted { get; private set; } = null!;
    public Event<CreditScoreCalculatedEvent> CreditApproved { get; private set; } = null!;
    public Event<CreditCheckFailedEvent> CreditFailed { get; private set; } = null!;

    public MortgageApplicationStateMachine()
    {
        InstanceState(x => x.CurrentState);

        Initially(
            When(LoanSubmitted)
                .Then(ctx => ctx.Saga.LoanId = ctx.Message.LoanId)
                .TransitionTo(Underwriting)
                .Publish(ctx => new RequestCreditCheckCommand(ctx.Saga.LoanId))
        );

        During(Underwriting,
            When(CreditApproved)
                .TransitionTo(Approved)
                .Publish(ctx => new NotifyBorrowerApprovedEvent(ctx.Saga.LoanId)),
            When(CreditFailed)
                .TransitionTo(Rejected)
                .Publish(ctx => new CompensateAndCancelLoanEvent(ctx.Saga.LoanId))
        );
    }
}`
      },
      proTipOrPitfall: 'Remember that compensating transactions are NOT identical to database rollbacks; previous steps were committed and visible to the outside world, so compensations must be designed as semantic business actions.',
      studyResources: [
        {
          title: 'Saga distributed transactions pattern',
          url: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/saga/saga',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-59',
    category: 'C# & .NET',
    question: '59. How do you implement Idempotency Keys in ASP.NET Core APIs using Distributed Cache (Redis) to prevent duplicate payment or loan submissions?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'Idempotency', 'Redis', 'API Design', 'Distributed Systems'],
    shortSummary: 'Explains Idempotency-Key HTTP header, Redis atomic lock acquisition, response caching, and in-flight request handling.',
    detailedAnswer: {
      executiveSummary: 'Network retries can cause clients to submit identical HTTP POST requests multiple times. Implementing an Idempotency filter requires clients to pass a unique `Idempotency-Key` header (e.g. UUID). The server attempts to store the key atomically in Redis with a status of "PROCESSING". If the key already exists and is "COMPLETED", the server returns the cached response directly without re-executing business logic.',
      keyPoints: [
        'Idempotency-Key Header: Client-generated unique identifier per mutation operation.',
        'Redis Atomic Lock: `SET key value NX EX 120` ensures only one request acquires execution rights.',
        'State Transitions: Key transitions from PROCESSING -> COMPLETED with serialized response payload.',
        'Concurrent Retries: If a duplicate arrives while status is PROCESSING, return HTTP 409 Conflict with "Request currently in progress".'
      ],
      codeOrQuerySnippet: {
        title: 'ASP.NET Core Idempotency Endpoint Filter with Redis',
        language: 'csharp',
        code: `public class IdempotencyEndpointFilter(IConnectionMultiplexer redis) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var httpContext = context.HttpContext;
        if (!httpContext.Request.Headers.TryGetValue("Idempotency-Key", out var key) || string.IsNullOrWhiteSpace(key))
        {
            return await next(context);
        }

        var db = redis.GetDatabase();
        string redisKey = $"idempotency:{key}";

        // Try acquire lock atomically
        bool acquired = await db.StringSetAsync(redisKey, "PROCESSING", TimeSpan.FromMinutes(2), When.NotExists);
        if (!acquired)
        {
            var cachedValue = await db.StringGetAsync(redisKey);
            if (cachedValue == "PROCESSING")
            {
                return Results.Conflict(new { message = "Operation is already in progress. Please wait." });
            }

            // Return cached previous response directly
            var cachedResponse = JsonSerializer.Deserialize<CachedResponseDto>(cachedValue!);
            return Results.Json(cachedResponse!.Data, statusCode: cachedResponse.StatusCode);
        }

        var result = await next(context);
        
        // Cache result upon success
        await db.StringSetAsync(redisKey, JsonSerializer.Serialize(new CachedResponseDto(200, result)), TimeSpan.FromHours(24));
        return result;
    }
}`
      },
      proTipOrPitfall: 'Always hash the request body along with the Idempotency Key in Redis. If a client sends the same key with different payload parameters, return HTTP 422 Unprocessable Entity for payload mismatch.',
      studyResources: [
        {
          title: 'Designing idempotent APIs with ASP.NET Core',
          url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/idempotency',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-60',
    category: 'C# & .NET',
    question: '60. How do Feature Flags with Microsoft.FeatureManagement and Azure App Configuration enable dark launches and canary deployments in .NET?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'Feature Flags', 'Microsoft.FeatureManagement', 'Azure App Configuration', 'DevOps'],
    shortSummary: 'Covers IFeatureManager, FeatureGateAttribute, percentage targeting filters, and zero-downtime configuration reload.',
    detailedAnswer: {
      executiveSummary: '`Microsoft.FeatureManagement.AspNetCore` provides runtime feature toggling without code deployments. Feature flags defined in appsettings or Azure App Configuration dynamically control endpoint availability via `[FeatureGate("NewUnderwritingEngine")]` or programmatic `IFeatureManager.IsEnabledAsync()`. Custom Feature Filters support percentage rollouts, user targeting, and schedule-based activations.',
      keyPoints: [
        'IFeatureManager: Evaluates flags asynchronously with dynamic feature filter evaluation.',
        'FeatureGate Attribute: Restricts Controller actions or Minimal API endpoints based on flag state.',
        'Targeting Filter: Rolls out features to a percentage of users (e.g. 10% beta cohort) or specific beta email domains.',
        'Azure App Configuration: Pushes real-time flag toggles to running containers without restarting pods.'
      ],
      codeOrQuerySnippet: {
        title: 'Feature Management with Percentage Rollout in ASP.NET Core',
        language: 'csharp',
        code: `// Program.cs
builder.Services.AddFeatureManagement()
    .AddFeatureFilter<PercentageFilter>()
    .AddFeatureFilter<TargetingFilter>();

// Minimal API protected by FeatureGate
app.MapPost("/api/v2/loans/instant-underwrite", async (LoanDto loan, IFeatureManager featureManager) =>
{
    if (await featureManager.IsEnabledAsync("AiUnderwritingEngine"))
    {
        return Results.Ok(await ExecuteAiUnderwritingAsync(loan));
    }

    return Results.Ok(await ExecuteLegacyRulesEngineAsync(loan));
});`
      },
      proTipOrPitfall: 'Never let obsolete feature flags accumulate in the codebase. Schedule cleanup sprints to remove flag checks once a feature is 100% rolled out.',
      studyResources: [
        {
          title: 'Tutorial: Use feature flags in an ASP.NET Core app',
          url: 'https://learn.microsoft.com/en-us/azure/azure-app-configuration/use-feature-flags-dotnet-core',
          source: 'Microsoft Learn'
        }
      ]
    }
  }
];
