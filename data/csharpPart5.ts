import { InterviewQuestion } from './interviewPrepData';

export const CSHARP_PART5: InterviewQuestion[] = [
  {
    id: 'csnet-51',
    category: 'C# & .NET',
    question: '51. What is DbContext Pooling (AddDbContextPool) in EF Core, and what are its constraints regarding scoped dependencies and state leakage?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'EF Core', 'DbContext Pooling', 'Performance', 'Memory Management'],
    shortSummary: 'Explains DbContext instance reuse, eliminating instantiation overhead, and ensuring state reset across requests.',
    detailedAnswer: {
      executiveSummary: '`AddDbContextPool` maintains a pool of initialized `DbContext` instances, recycling them across HTTP requests rather than allocating a new instance per request. This eliminates context instantiation, service provider resolution, and internal hook creation overhead, increasing throughput by 10-20% in high-load scenarios. However, DbContext instances in a pool must remain completely stateless.',
      keyPoints: [
        'Instance Recycling: When a request finishes, EF Core resets the DbContext state and returns it to the pool.',
        'No Stateful Service Injection: Pooled DbContext cannot accept scoped stateful services in its constructor.',
        'Pool Size: Configured via `poolSize: 1024` (default 1024); if pool is exhausted, new instances are allocated as needed.',
        'Reset Execution: EF Core calls `ResetState()` internally to clear tracking caches and event hooks before reuse.'
      ],
      codeOrQuerySnippet: {
        title: 'Configuring DbContext Pooling in Program.cs',
        language: 'csharp',
        code: `builder.Services.AddDbContextPool<MortgageDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), sql =>
    {
        sql.EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(10), errorNumbersToAdd: null);
    });
}, poolSize: 512);`
      },
      proTipOrPitfall: 'Never store per-request state (such as tenant ID or current user ID) in private fields of a pooled DbContext constructor; use `IHttpContextAccessor` or custom query filters instead.',
      studyResources: [
        {
          title: 'DbContext Pooling in EF Core',
          url: 'https://learn.microsoft.com/en-us/ef/core/performance/advanced-performance-topics#dbcontext-pooling',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-52',
    category: 'C# & .NET',
    question: '52. How do you implement Optimistic Concurrency Control in EF Core using RowVersion / Timestamp tokens to resolve concurrent edit conflicts?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'EF Core', 'Optimistic Concurrency', 'RowVersion', 'DbUpdateConcurrencyException'],
    shortSummary: 'Covers byte[] rowversion, concurrency tokens, DbUpdateConcurrencyException handling, and client-wins vs store-wins strategies.',
    detailedAnswer: {
      executiveSummary: 'Optimistic Concurrency assumes concurrent updates are rare and checks for conflicts at commit time. EF Core maps a `[Timestamp]` byte array (or `IsRowVersion()` in Fluent API) to a SQL Server `rowversion` column that automatically increments on any row update. EF Core includes this token in the UPDATE WHERE clause (`WHERE Id = @id AND RowVersion = @rowVersion`). If another user updated the row first, zero rows match and EF Core throws `DbUpdateConcurrencyException`.',
      keyPoints: [
        'RowVersion Column: SQL Server automatically generates a new binary token on each row modification.',
        'Concurrency Check in SQL: `UPDATE Loans SET Principal = @p WHERE Id = @id AND RowVersion = @originalToken`.',
        'DbUpdateConcurrencyException: Thrown when zero rows are updated; application catches exception to resolve conflicts.',
        'Resolution Strategies: Database-wins (reload latest from DB), Client-wins (overwrite DB with client values), or Merge (prompt user).'
      ],
      codeOrQuerySnippet: {
        title: 'Handling DbUpdateConcurrencyException in C#',
        language: 'csharp',
        code: `public async Task<bool> UpdateLoanTermsAsync(Guid loanId, decimal newRate, byte[] clientRowVersion, CancellationToken ct)
{
    var loan = await _dbContext.Loans.FindAsync([loanId], ct);
    if (loan == null) return false;

    // Attach client's original version token
    _dbContext.Entry(loan).Property(l => l.RowVersion).OriginalValue = clientRowVersion;
    loan.InterestRate = newRate;

    try
    {
        await _dbContext.SaveChangesAsync(ct);
        return true;
    }
    catch (DbUpdateConcurrencyException ex)
    {
        var entry = ex.Entries.Single();
        var databaseValues = await entry.GetDatabaseValuesAsync(ct);
        
        if (databaseValues == null)
        {
            throw new InvalidOperationException("The loan was deleted by another user.");
        }

        throw new ConcurrencyException("The loan was modified by another underwriter. Please reload and retry.");
    }
}`
      },
      proTipOrPitfall: 'Always send the RowVersion token back and forth to SPA/mobile clients as a Base64 string; never trust clients to modify or omit the concurrency token.',
      studyResources: [
        {
          title: 'Handling Concurrency Conflicts in EF Core',
          url: 'https://learn.microsoft.com/en-us/ef/core/saving/concurrency',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-53',
    category: 'C# & .NET',
    question: '53. How do Global Query Filters (HasQueryFilter) in EF Core enforce Multi-Tenancy and Soft Delete isolation automatically across all queries?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'EF Core', 'Global Query Filters', 'Multi-Tenancy', 'Soft Delete', 'Security'],
    shortSummary: 'Explains model-level query filters, tenant isolation, IgnoreQueryFilters(), and dynamic tenant resolution.',
    detailedAnswer: {
      executiveSummary: 'Global Query Filters in EF Core apply LINQ predicate expressions automatically to all queries targeting an entity type. In multi-tenant systems, `HasQueryFilter(e => e.TenantId == _currentTenantId)` ensures developers never accidentally query or expose cross-tenant data. For soft deletes, `HasQueryFilter(e => !e.IsDeleted)` hides logically deleted records unless explicitly overridden with `.IgnoreQueryFilters()`.',
      keyPoints: [
        'Automatic SQL Injection: EF Core appends `WHERE TenantId = @tenantId AND IsDeleted = 0` to all generated SQL queries.',
        'Tenant Scoping: DbContext resolves current tenant ID dynamically per HTTP request from `ITenantService`.',
        'IgnoreQueryFilters(): Explicitly bypasses filters for admin or auditing operations: `dbContext.Loans.IgnoreQueryFilters().ToListAsync()`.',
        'Navigation Property Filtering: Filters propagate across `Include` navigations automatically.'
      ],
      codeOrQuerySnippet: {
        title: 'Configuring Global Multi-Tenant and Soft Delete Query Filters',
        language: 'csharp',
        code: `public class MortgageDbContext(
    DbContextOptions<MortgageDbContext> options, 
    ITenantProvider tenantProvider) : DbContext(options)
{
    private readonly Guid _tenantId = tenantProvider.GetCurrentTenantId();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Global query filter applied automatically to all LoanApplication queries
        modelBuilder.Entity<LoanApplication>()
            .HasQueryFilter(l => l.TenantId == _tenantId && !l.IsDeleted);
    }
}`
      },
      proTipOrPitfall: 'Be cautious when combining global query filters with required navigation relationships. If a parent entity exists but its required child is filtered out, EF Core may return null for the entire parent row.',
      studyResources: [
        {
          title: 'Global Query Filters in EF Core',
          url: 'https://learn.microsoft.com/en-us/ef/core/querying/filters',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-54',
    category: 'C# & .NET',
    question: '54. How do Clean Architecture and the Dependency Inversion Principle structure enterprise .NET solutions for maintainability and testability?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'Clean Architecture', 'Dependency Inversion', 'Architecture', 'Design Patterns'],
    shortSummary: 'Explains Domain, Application, Infrastructure, and Presentation layers, dependency flow rules, and decoupling external frameworks.',
    detailedAnswer: {
      executiveSummary: 'Clean Architecture organizes enterprise .NET applications into concentric layers where source code dependencies point strictly inward toward the core domain. The Domain layer contains enterprise business entities, value objects, and domain events with zero third-party dependencies. The Application layer contains use cases and CQRS handlers. The Infrastructure layer implements persistence (EF Core, SQL), external APIs, and file storage, while Presentation (Web API, Blazor) handles HTTP routing.',
      keyPoints: [
        'Inward Dependency Rule: Inner layers have zero references to outer layers; Domain depends on nothing.',
        'Dependency Inversion: Application defines interfaces (`ILoanRepository`), Infrastructure implements them.',
        'Framework Independence: Database technology (SQL vs Cosmos) or UI framework can be swapped without touching core domain rules.',
        'Unit Testability: Business use cases are 100% unit-testable in memory using mock interfaces.'
      ],
      codeOrQuerySnippet: {
        title: 'Project Structure and Dependency Inversion in Clean Architecture',
        language: 'text',
        code: `Solution: EnterpriseMortgage
├── src
│   ├── Domain (Entities, Value Objects, Domain Events, Enums - 0 Dependencies)
│   ├── Application (Use Cases, Commands, Queries, DTOs, Interfaces - Depends on Domain)
│   ├── Infrastructure (EF Core, Azure Blob, SendGrid, MassTransit - Depends on Application)
│   └── WebApi (Controllers, Minimal APIs, Middleware, Program.cs - Depends on Application & Infrastructure)
└── tests
    ├── Domain.UnitTests
    ├── Application.UnitTests
    └── WebApi.IntegrationTests`
      },
      proTipOrPitfall: 'Never reference EF Core packages inside the Domain project. Entities should be plain C# POCO classes without database-specific annotations.',
      studyResources: [
        {
          title: 'Common web application architectures (.NET)',
          url: 'https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-55',
    category: 'C# & .NET',
    question: '55. How do Domain-Driven Design (DDD) Entities, Value Objects, and C# Records enforce business invariants in enterprise applications?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'DDD', 'Value Objects', 'Entities', 'Records', 'Domain Logic'],
    shortSummary: 'Compares identity-based Entities vs immutable structural Value Objects, self-validating types, and primitive obsession.',
    detailedAnswer: {
      executiveSummary: 'In Domain-Driven Design, Entities are defined by a unique persistent identity (e.g. `LoanId`), mutating state over time while maintaining invariant rules. Value Objects have no conceptual identity; they are defined strictly by their structural attributes and are immutable (e.g. `Money`, `Address`, `SocialSecurityNumber`). C# records or readonly record structs provide the ideal syntax for Value Objects, eliminating "Primitive Obsession" by encapsulating validation inside factory methods.',
      keyPoints: [
        'Entity: Defined by identity (`Id`); two entities with different IDs are distinct even if all properties match.',
        'Value Object: Defined by value equality; immutable; replacing one instance with another of equal properties produces identical semantics.',
        'Primitive Obsession Elimination: Replace `decimal amount` with `Money(decimal Amount, Currency Currency)` to prevent currency mismatch bugs.',
        'Self-Validation: Value Object factory constructors validate invariants before instantiation.'
      ],
      codeOrQuerySnippet: {
        title: 'Domain-Driven Design Value Object and Entity in C#',
        language: 'csharp',
        code: `// 1. Immutable Value Object using C# Record with Invariant Validation
public readonly record struct Money
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency = "USD")
    {
        if (amount < 0) throw new DomainValidationException("Money amount cannot be negative.");
        if (string.IsNullOrWhiteSpace(currency)) throw new DomainValidationException("Currency code required.");
        
        Amount = amount;
        Currency = currency.ToUpper();
    }

    public static Money operator +(Money a, Money b)
    {
        if (a.Currency != b.Currency) throw new DomainValidationException("Cannot add different currencies.");
        return new Money(a.Amount + b.Amount, a.Currency);
    }
}

// 2. Aggregate Entity enforcing domain state transitions
public class MortgageApplication
{
    public Guid Id { get; private set; }
    public Money RequestedAmount { get; private set; }
    public LoanStatus Status { get; private set; }

    public void Approve(Money approvedAmount)
    {
        if (Status != LoanStatus.Underwriting) 
            throw new InvalidDomainStateException("Can only approve loans currently in Underwriting.");
        
        Status = LoanStatus.Approved;
        // Raise Domain Event: AddDomainEvent(new LoanApprovedEvent(Id, approvedAmount));
    }
}`
      },
      proTipOrPitfall: 'Avoid public property setters on Domain Entities. Expose intention-revealing methods (`loan.Approve()`, `loan.Reject()`) that guard domain invariants instead of allowing external callers to set `loan.Status = LoanStatus.Approved` arbitrarily.',
      studyResources: [
        {
          title: 'Design a DDD-oriented microservice',
          url: 'https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice',
          source: 'Microsoft Learn'
        }
      ]
    }
  }
];
