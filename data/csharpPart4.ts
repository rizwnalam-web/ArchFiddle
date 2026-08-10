import { InterviewQuestion } from './interviewPrepData';

export const CSHARP_PART4: InterviewQuestion[] = [
  {
    id: 'csnet-46',
    category: 'C# & .NET',
    question: '46. How does the EF Core Change Tracker work under the hood, and why is AsNoTracking critical for high-throughput read operations?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'EF Core', 'Change Tracker', 'AsNoTracking', 'Performance'],
    shortSummary: 'Explains snapshot tracking, entity entries, detect changes overhead, and AsNoTracking memory savings.',
    detailedAnswer: {
      executiveSummary: 'When EF Core executes a tracking query, it creates a duplicate snapshot of each entity in the `ChangeTracker`. When `SaveChangesAsync()` is called, `DetectChanges()` compares property values against original snapshots to generate UPDATE statements. In read-only scenarios, this snapshot allocation and change-detection phase wastes significant memory and CPU. Calling `.AsNoTracking()` bypasses the tracker completely, yielding 30-50% faster query execution and zero tracking memory overhead.',
      keyPoints: [
        'Snapshot Change Tracking: Stores original property values in memory; checks diffs upon SaveChanges.',
        'AsNoTracking(): Instructs EF Core not to store snapshots in ChangeTracker, drastically cutting GC allocation.',
        'AsNoTrackingWithIdentityResolution(): Prevents duplicate entity instances when queries return repeated child relations.',
        'Query Tracking Behavior: Can be set globally on DbContext: `options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking)`.'
      ],
      codeOrQuerySnippet: {
        title: 'Optimized Read Query with AsNoTracking in EF Core',
        language: 'csharp',
        code: `public async Task<List<LoanSummaryDto>> GetActiveLoansAsync(MortgageDbContext context, CancellationToken ct)
{
    // AsNoTracking avoids snapshot creation in ChangeTracker
    return await context.Loans
        .AsNoTracking()
        .Where(l => l.Status == LoanStatus.Active)
        .Select(l => new LoanSummaryDto(l.Id, l.BorrowerName, l.Principal, l.InterestRate))
        .ToListAsync(ct);
}`
      },
      proTipOrPitfall: 'Never call `AsNoTracking()` if you intend to modify the entity and persist changes with `SaveChangesAsync()` without explicitly attaching and setting entity state manually.',
      studyResources: [
        {
          title: 'Change Tracking in Entity Framework Core',
          url: 'https://learn.microsoft.com/en-us/ef/core/change-tracking/',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-47',
    category: 'C# & .NET',
    question: '47. How do EF Core Compiled Queries (EF.CompileAsyncQuery) eliminate LINQ query compilation overhead in high-frequency read endpoints?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'EF Core', 'Compiled Queries', 'Performance', 'Micro-Optimization'],
    shortSummary: 'Explains expression tree translation caching, parameter delegate creation, and sub-millisecond query execution.',
    detailedAnswer: {
      executiveSummary: 'Whenever EF Core runs a LINQ query, it parses the expression tree into a relational model and generates SQL commands. While EF Core caches the generated SQL template, the expression tree hashing and parameter extraction still incur microsecond overhead per execution. `EF.CompileAsyncQuery` pre-compiles the entire LINQ-to-SQL translation pipeline into a reusable static delegate, eliminating translation overhead on high-frequency hot paths.',
      keyPoints: [
        'Pre-Compiled Delegate: Generates an invokable delegate that directly executes parameterized SQL without expression tree inspection.',
        'Throughput Gain: Provides 2x-3x faster query dispatch for high-volume lookup endpoints (e.g. 5,000 req/sec).',
        'Static Storage: Compiled query delegates should be stored in static readonly fields.',
        'Limitations: Best suited for fixed-structure parameterized queries, not dynamic dynamic-clause queries.'
      ],
      codeOrQuerySnippet: {
        title: 'Static EF.CompileAsyncQuery Implementation',
        language: 'csharp',
        code: `public class MortgageRepository
{
    // Pre-compiled query delegate stored statically
    private static readonly Func<MortgageDbContext, Guid, CancellationToken, Task<LoanApplication?>> 
        GetLoanByIdCompiled = EF.CompileAsyncQuery(
            (MortgageDbContext ctx, Guid loanId, CancellationToken ct) =>
                ctx.Loans.AsNoTracking().FirstOrDefault(l => l.Id == loanId));

    private readonly MortgageDbContext _dbContext;
    public MortgageRepository(MortgageDbContext dbContext) => _dbContext = dbContext;

    public Task<LoanApplication?> GetByIdAsync(Guid loanId, CancellationToken ct)
    {
        return GetLoanByIdCompiled(_dbContext, loanId, ct);
    }
}`
      },
      proTipOrPitfall: 'Do not use compiled queries for dynamically constructed queries with variable Where clauses; compiled queries require a static expression tree structure.',
      studyResources: [
        {
          title: 'Compiled queries in EF Core',
          url: 'https://learn.microsoft.com/en-us/ef/core/performance/advanced-performance-topics#compiled-queries',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-48',
    category: 'C# & .NET',
    question: '48. What is Cartesian Explosion in EF Core, and how does AsSplitQuery() resolve performance degradation on multi-collection queries?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'EF Core', 'AsSplitQuery', 'Cartesian Product', 'SQL Performance'],
    shortSummary: 'Explains single query multiple JOIN multiplication, duplicated network payload, and split SQL execution.',
    detailedAnswer: {
      executiveSummary: 'When EF Core includes multiple one-to-many collection navigations (e.g. `Include(l => l.Borrowers).Include(l => l.Documents).Include(l => l.AuditLogs)`), a single SQL query uses multiple `LEFT JOIN` clauses. This creates a Cartesian product (multiplication of matching rows), causing the database to return tens of thousands of duplicate rows over the network. `.AsSplitQuery()` instructs EF Core to emit separate, fast SELECT statements per collection and assemble them in memory.',
      keyPoints: [
        'Cartesian Product: Including two collections of 10 items each results in 100 joined rows with duplicate parent columns.',
        'AsSplitQuery(): Generates 1 SQL query for parent + 1 SQL query for each included collection.',
        'Consistency Consideration: Split queries execute separate SELECTs; if concurrent updates occur between queries, inconsistencies could arise unless inside a transaction.',
        'Global Configuration: Can be enabled globally via `options.UseSqlServer(conn, o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery))`.'
      ],
      codeOrQuerySnippet: {
        title: 'Preventing Cartesian Explosion with AsSplitQuery',
        language: 'csharp',
        code: `public async Task<LoanPackageDto?> GetCompleteLoanPackageAsync(
    MortgageDbContext context, Guid loanId, CancellationToken ct)
{
    return await context.Loans
        .AsNoTracking()
        .AsSplitQuery() // Emits separate SELECT statements instead of massive Cartesian JOINs
        .Include(l => l.Borrowers)
        .Include(l => l.PropertyAppraisals)
        .Include(l => l.UnderwritingConditions)
        .Where(l => l.Id == loanId)
        .FirstOrDefaultAsync(ct);
}`
      },
      proTipOrPitfall: 'When using `.AsSplitQuery()` with pagination (`Skip`/`Take`), ensure you order by a unique column on the root query to prevent erratic row slicing across the split queries.',
      studyResources: [
        {
          title: 'Single vs. Split Queries in EF Core',
          url: 'https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-49',
    category: 'C# & .NET',
    question: '49. How do EF Core Interceptors (DbCommandInterceptor, SaveChangesInterceptor) implement automated auditing, soft deletes, and tenant isolation?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'EF Core', 'Interceptors', 'Auditing', 'Soft Delete', 'Security'],
    shortSummary: 'Covers intercepting SQL commands before execution, mutating entity states during SaveChanges, and query expression modification.',
    detailedAnswer: {
      executiveSummary: 'EF Core Interceptors hook directly into the database execution lifecycle. `SaveChangesInterceptor` intercepts `SavingChangesAsync` to automatically stamp `CreatedUtc`, `LastModifiedUtc`, and `ModifiedBy` properties on all modified entities before generating SQL. `DbCommandInterceptor` intercepts raw ADO.NET `DbCommand` objects before they hit SQL Server, enabling SQL query tagging, slow query threshold logging, and transient retry injection.',
      keyPoints: [
        'SaveChangesInterceptor: Accesses `eventData.Context.ChangeTracker` to inspect and mutate EntityEntry states before saving.',
        'DbCommandInterceptor: Modifies command text, parameters, or logs execution time in `CommandExecuted` / `ReaderExecuted`.',
        'Decoupled Architecture: Eliminates manual audit property setting in application business logic.',
        'Registration: Registered via `options.AddInterceptors(new AuditSaveChangesInterceptor())` in DI.'
      ],
      codeOrQuerySnippet: {
        title: 'Automated Audit Stamping with SaveChangesInterceptor',
        language: 'csharp',
        code: `public class AuditSaveChangesInterceptor(ICurrentUserContext userContext) : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        var context = eventData.Context;
        if (context == null) return base.SavingChangesAsync(eventData, result, cancellationToken);

        var utcNow = DateTime.UtcNow;
        var userId = userContext.UserId ?? "System";

        foreach (var entry in context.ChangeTracker.Entries<IAuditableEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAtUtc = utcNow;
                entry.Entity.CreatedBy = userId;
            }
            if (entry.State is EntityState.Added or EntityState.Modified)
            {
                entry.Entity.LastModifiedAtUtc = utcNow;
                entry.Entity.LastModifiedBy = userId;
            }
        }

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }
}`
      },
      proTipOrPitfall: 'Never execute asynchronous database calls inside an interceptor that could cause recursion or lock the active DbConnection.',
      studyResources: [
        {
          title: 'EF Core Interceptors Overview',
          url: 'https://learn.microsoft.com/en-us/ef/core/logging-events-diagnostics/interceptors',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-50',
    category: 'C# & .NET',
    question: '50. How do EF Core 7/8 ExecuteUpdateAsync and ExecuteDeleteAsync perform bulk operations directly in SQL without loading entities into memory?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'EF Core', 'ExecuteUpdate', 'ExecuteDelete', 'Bulk Operations', 'Performance'],
    shortSummary: 'Explains direct SQL UPDATE/DELETE generation, bypassing change tracker, and handling multi-row batch modifications.',
    detailedAnswer: {
      executiveSummary: 'Prior to EF Core 7, updating or deleting 1,000 entities required querying all 1,000 rows into memory, attaching them to the ChangeTracker, mutating properties, and emitting 1,000 individual UPDATE statements. `ExecuteUpdateAsync` and `ExecuteDeleteAsync` translate LINQ expressions directly into a single SQL `UPDATE ... SET` or `DELETE FROM ... WHERE` statement executed directly on the database server without loading any entities into .NET memory.',
      keyPoints: [
        'Direct SQL Execution: Generates a single SQL statement; executes atomically on the database engine.',
        'Zero Memory Footprint: No entity instances are allocated or tracked in the .NET process.',
        'SetProperty Calls: Chain `.SetProperty(p => p.Status, LoanStatus.Archived)` for selective updates.',
        'ChangeTracker Ignorance: Does not update in-memory entity instances if they were already loaded in the active DbContext.'
      ],
      codeOrQuerySnippet: {
        title: 'Bulk Update and Delete with ExecuteUpdateAsync / ExecuteDeleteAsync',
        language: 'csharp',
        code: `public async Task ArchiveStaleApplicationsAsync(MortgageDbContext context, CancellationToken ct)
{
    var cutoffDate = DateTime.UtcNow.AddMonths(-6);

    // 1. Bulk Update: Single SQL UPDATE statement executed directly on database
    int rowsUpdated = await context.Loans
        .Where(l => l.Status == LoanStatus.Draft && l.LastModifiedAtUtc < cutoffDate)
        .ExecuteUpdateAsync(setter => setter
            .SetProperty(l => l.Status, LoanStatus.Expired)
            .SetProperty(l => l.LastModifiedAtUtc, DateTime.UtcNow), ct);

    // 2. Bulk Delete: Single SQL DELETE statement
    int rowsDeleted = await context.AuditLogs
        .Where(a => a.CreatedAtUtc < DateTime.UtcNow.AddYears(-2))
        .ExecuteDeleteAsync(ct);
}`
      },
      proTipOrPitfall: 'Because `ExecuteUpdate` and `ExecuteDelete` bypass the ChangeTracker, EF Core Interceptors (`SavingChangesAsync`) and domain events attached to entity classes will NOT fire automatically.',
      studyResources: [
        {
          title: 'Bulk updates and deletes in EF Core',
          url: 'https://learn.microsoft.com/en-us/ef/core/saving/execute-insert-update-delete',
          source: 'Microsoft Learn'
        }
      ]
    }
  }
];
