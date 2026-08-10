import { InterviewQuestion } from './interviewPrepData';

export const CSHARP_PART10: InterviewQuestion[] = [
  {
    id: 'csnet-76',
    category: 'C# & .NET',
    question: '76. How does TaskCompletionSource<T> bridge legacy event-driven or callback APIs to modern async/await in C#?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'TaskCompletionSource', 'Async/Await', 'Threading', 'Interoperability'],
    shortSummary: 'Explains manual task lifecycle management, SetResult / SetException / SetCanceled, and RunContinuationsAsynchronously.',
    detailedAnswer: {
      executiveSummary: '`TaskCompletionSource<T>` provides a programmatic mechanism to produce and control a `Task<T>`. When interacting with legacy callback-based APIs, message bus listeners, or socket events, a `TaskCompletionSource<T>` allows developers to wrap the asynchronous operation in a standard awaitable Task, completing it explicitly when the callback fires via `SetResult()`, `SetException()`, or `SetCanceled()`.',
      keyPoints: [
        'Task Producer: Manages the internal state transition of an uncompleted Task.',
        'RunContinuationsAsynchronously: Always specify `TaskCreationOptions.RunContinuationsAsynchronously` to prevent continuations from running synchronously on the thread calling `SetResult`.',
        'Cancellation Integration: Link `CancellationToken.Register(() => tcs.TrySetCanceled())` for clean timeout handling.',
        'Thread-Safe State Machine: Use `TrySetResult()` to avoid exceptions if multiple callbacks trigger concurrently.'
      ],
      codeOrQuerySnippet: {
        title: 'Bridging Legacy Event to Async/Await with TaskCompletionSource',
        language: 'csharp',
        code: `public static class LegacyEventBridge
{
    public static async Task<MortgageQuote> WaitForQuoteAsync(
        ILegacyQuoteEngine engine, Guid quoteId, CancellationToken cancellationToken)
    {
        var tcs = new TaskCompletionSource<MortgageQuote>(TaskCreationOptions.RunContinuationsAsynchronously);

        void OnQuoteCalculated(object? sender, LegacyQuoteEventArgs args)
        {
            if (args.QuoteId == quoteId)
            {
                engine.QuoteReceived -= OnQuoteCalculated;
                tcs.TrySetResult(new MortgageQuote(args.QuoteId, args.CalculatedRate));
            }
        }

        engine.QuoteReceived += OnQuoteCalculated;

        using var reg = cancellationToken.Register(() =>
        {
            engine.QuoteReceived -= OnQuoteCalculated;
            tcs.TrySetCanceled(cancellationToken);
        });

        engine.RequestQuote(quoteId);
        return await tcs.Task;
    }
}`
      },
      proTipOrPitfall: 'Always use `TaskCreationOptions.RunContinuationsAsynchronously`. Without this option, the code executing immediately after the `await` will execute inline on whichever thread called `SetResult()`, which can lead to unexpected thread starvation and deadlocks.',
      studyResources: [
        {
          title: 'TaskCompletionSource Class',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.taskcompletionsource-1',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-77',
    category: 'C# & .NET',
    question: '77. How do WeakReference<T> and ConditionalWeakTable<TKey, TValue> prevent memory leaks in caching and event listeners?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'WeakReference', 'ConditionalWeakTable', 'Garbage Collection', 'Memory Management'],
    shortSummary: 'Explains weak references, ephemerons, attaching metadata to objects without memory leaks, and GC reclamation.',
    detailedAnswer: {
      executiveSummary: 'Standard strong references prevent the Garbage Collector from collecting objects. `WeakReference<T>` allows an object to be collected by GC while still providing temporary access if it hasn\'t been reclaimed. `ConditionalWeakTable<TKey, TValue>` implements "ephemerons"—it associates arbitrary metadata (`TValue`) with an object instance (`TKey`) without preventing `TKey` from being garbage collected. When `TKey` is collected, its associated `TValue` entry is automatically purged.',
      keyPoints: [
        'WeakReference<T>: `TryGetTarget(out var target)` retrieves reference only if GC has not yet collected it.',
        'ConditionalWeakTable<TKey, TValue>: Attaches fields or audit tags to third-party sealed classes without subclassing.',
        'Ephemeron Semantics: Keys are held weakly; values are held strongly only as long as the key is alive.',
        'Thread Safety: ConditionalWeakTable is inherently thread-safe without explicit lock statements.'
      ],
      codeOrQuerySnippet: {
        title: 'Attaching Audit Metadata with ConditionalWeakTable',
        language: 'csharp',
        code: `public class EntityAuditTracker
{
    // Attaches audit timestamp to any object instance without preventing GC collection
    private static readonly ConditionalWeakTable<object, AuditInfo> _auditTable = new();

    public static void StampAuditInfo(object entity, string userId)
    {
        _auditTable.AddOrUpdate(entity, new AuditInfo(userId, DateTime.UtcNow));
    }

    public static AuditInfo? GetAuditInfo(object entity)
    {
        return _auditTable.TryGetValue(entity, out var info) ? info : null;
    }
}

public record AuditInfo(string UserId, DateTime StampedAtUtc);`
      },
      proTipOrPitfall: 'Never store `TKey` inside `TValue` in a `ConditionalWeakTable<TKey, TValue>`. Creating a cyclic reference from the value back to the key causes the key to remain strongly reachable, leaking both objects forever.',
      studyResources: [
        {
          title: 'ConditionalWeakTable Class',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.runtime.compilerservices.conditionalweaktable-2',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-78',
    category: 'C# & .NET',
    question: '78. How does Native AOT (Ahead-Of-Time) compilation in .NET 8 eliminate JIT overhead, reduce container startup times to single-digit milliseconds, and what are its trim warnings?',
    difficulty: 'Principal Architect',
    tags: ['C#', 'Native AOT', '.NET 8', 'JIT', 'Docker', 'Cold Start', 'Serverless'],
    shortSummary: 'Compares JIT vs Native AOT, trimming restrictions, reflection warnings, and sub-10ms container cold starts.',
    detailedAnswer: {
      executiveSummary: 'Native AOT compiles C# source code directly into machine-specific native code (x64 / ARM64 ELF or Mach-O binary) at publish time rather than IL bytecode. Native AOT produces self-contained binaries that start in 5-15 milliseconds with 80% lower base memory footprint (no JIT compiler loaded in memory). However, Native AOT requires strict trim compatibility: dynamic reflection (`Assembly.Load`, `Type.GetType`), runtime `Reflection.Emit`, and unannotated generic serialization are prohibited.',
      keyPoints: [
        'Instantaneous Cold Starts: Sub-10ms startup times, making .NET ideal for AWS Lambda and Google Cloud Run scale-to-zero.',
        'Tiny Memory Footprint: Bypasses JIT memory overhead and metadata tables.',
        'Trim Warnings: Flagged at build time (`IL2026`, `IL3050`) when code uses unsupported dynamic reflection.',
        'Source Generator Dependency: Requires compile-time source generators for JSON, DI, and configuration.'
      ],
      codeOrQuerySnippet: {
        title: 'Enabling Native AOT in .csproj',
        language: 'xml',
        code: `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    
    <!-- Enable Native AOT Compilation -->
    <PublishAot>true</PublishAot>
    <InvariantGlobalization>true</InvariantGlobalization>
    <StripSymbols>true</StripSymbols>
  </PropertyGroup>
</Project>`
      },
      proTipOrPitfall: 'Test Native AOT publishing frequently in your CI pipeline (`dotnet publish -c Release -r linux-x64`). Third-party libraries that rely on runtime reflection will fail at runtime unless configured with explicit trimmer root descriptors.',
      studyResources: [
        {
          title: 'Native AOT deployment overview',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/deploying/native-aot/',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-79',
    category: 'C# & .NET',
    question: '79. What is Dynamic PGO (Profile-Guided Optimization) in .NET 8 JIT, and how does it optimize hot code paths, devirtualize calls, and inline loops?',
    difficulty: 'Principal Architect',
    tags: ['C#', 'Dynamic PGO', 'JIT', 'Tiered Compilation', 'Performance'],
    shortSummary: 'Explains Tier 0 instrumentation, execution frequency profiling, Tier 1 re-compilation, interface devirtualization, and vectorization.',
    detailedAnswer: {
      executiveSummary: 'Dynamic PGO (Profile-Guided Optimization) is enabled by default in .NET 8. In Tier 0 compilation, the JIT injects lightweight instrumentation probes to observe actual runtime execution patterns (e.g. types passed to interfaces, loop iterations, branch probabilities). When code becomes "hot", Tier 1 JIT recompiles the method using these live observations—devirtualizing interface method calls, inlining hot branch paths, and unrolling loops for unmatched throughput.',
      keyPoints: [
        'Tiered Compilation: Tier 0 compiles quickly with instrumentation; Tier 1 optimizes hot paths based on actual usage profile.',
        'Interface Devirtualization: Replaces expensive `vtable` interface lookups with direct static method calls if 99% of calls use a single concrete type.',
        'Branch Prediction Tuning: Moves rarely taken error-handling branches out of the main CPU instruction cache line.',
        'Zero Manual Tuning: Works automatically at runtime without needing offline profiling files.'
      ],
      codeOrQuerySnippet: {
        title: 'How Dynamic PGO Devirtualizes Interface Calls',
        language: 'csharp',
        code: `public interface IRateCalculator { decimal Calculate(); }
public class StandardRateCalculator : IRateCalculator { public decimal Calculate() => 6.25m; }

public class MortgageProcessor
{
    // In Tier 0: JIT calls interface method via vtable lookup.
    // In Tier 1 with Dynamic PGO: JIT notices that 99.9% of calls pass 'StandardRateCalculator'.
    // JIT transforms call into:
    // if (calc is StandardRateCalculator s) return s.Calculate(); // Devirtualized & Inlined directly!
    // else return calc.Calculate();
    public decimal Process(IRateCalculator calc) => calc.Calculate();
}`
      },
      proTipOrPitfall: 'Dynamic PGO is active by default in .NET 8+. Ensure `<TieredPGO>true</TieredPGO>` is not disabled in your build properties if you are migrating older .NET 6/7 projects.',
      studyResources: [
        {
          title: 'Performance Improvements in .NET 8 (Dynamic PGO)',
          url: 'https://devblogs.microsoft.com/dotnet/performance-improvements-in-net-8/',
          source: '.NET Blog'
        }
      ]
    }
  },
  {
    id: 'csnet-80',
    category: 'C# & .NET',
    question: '80. How do System.Text.Json Polymorphic Type Discriminators and custom JsonConverter<T> handle inheritance hierarchies securely?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'System.Text.Json', 'Polymorphism', 'Serialization', 'Security'],
    shortSummary: 'Explains [JsonPolymorphic], [JsonDerivedType], type discriminators ($type), and custom UTF-8 JsonConverter writing.',
    detailedAnswer: {
      executiveSummary: 'Serializing polymorphic object hierarchies (e.g. `MortgageLoan` base class with `FixedRateLoan` and `ArmLoan` derived classes) requires type discriminator metadata. Modern `System.Text.Json` supports native polymorphism via `[JsonPolymorphic]` and `[JsonDerivedType]` attributes. This safely emits and parses type discriminators (e.g. `"$type": "fixed"`) without the critical security vulnerabilities of legacy Newtonsoft `$type` arbitrary type instantiations.',
      keyPoints: [
        '[JsonPolymorphic]: Enables polymorphic serialization and sets custom discriminator property names.',
        '[JsonDerivedType]: Maps derived C# types to explicit string or integer discriminators.',
        'Safe Deserialization: Only explicitly registered derived types can be instantiated; blocks arbitrary remote code execution.',
        'Custom JsonConverter<T>: Use `Utf8JsonReader` and `Utf8JsonWriter` for custom low-level streaming serialization.'
      ],
      codeOrQuerySnippet: {
        title: 'Polymorphic Type Serialization in System.Text.Json',
        language: 'csharp',
        code: `[JsonPolymorphic(TypeDiscriminatorPropertyName = "loanType")]
[JsonDerivedType(typeof(FixedRateLoan), typeDiscriminator: "fixed")]
[JsonDerivedType(typeof(AdjustableRateLoan), typeDiscriminator: "arm")]
public abstract class BaseLoanApplication
{
    public Guid Id { get; set; }
    public decimal Principal { get; set; }
}

public class FixedRateLoan : BaseLoanApplication
{
    public decimal FixedInterestRate { get; set; }
    public int TermYears { get; set; }
}

public class AdjustableRateLoan : BaseLoanApplication
{
    public decimal InitialRate { get; set; }
    public decimal MarginRate { get; set; }
    public int AdjustmentPeriodMonths { get; set; }
}`
      },
      proTipOrPitfall: 'Always use string or integer discriminators with `[JsonDerivedType]` rather than relying on full assembly-qualified class names to prevent coupling your JSON contracts to internal C# namespaces.',
      studyResources: [
        {
          title: 'Polymorphic serialization in System.Text.Json',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/polymorphism',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-81',
    category: 'C# & .NET',
    question: '81. How does HybridCache in .NET 9 combine In-Memory L1 caching and Distributed L2 Redis caching with built-in stampede protection?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', '.NET 9', 'HybridCache', 'Redis', 'Caching', 'Performance'],
    shortSummary: 'Explains two-tier caching (L1 in-memory + L2 Redis), GetOrCreateAsync, cache stampede mutex locking, and tag invalidation.',
    detailedAnswer: {
      executiveSummary: '`HybridCache` (introduced in .NET 9) unifies in-memory caching (`IMemoryCache`) as a microsecond L1 tier with distributed caching (`IDistributedCache` / Redis) as an L2 tier. It eliminates the boilerplate of querying in-memory cache first, then checking Redis, then querying the database. Crucially, `HybridCache.GetOrCreateAsync()` includes built-in Mutex locking across threads and processes, completely eliminating "Cache Stampedes" when keys expire.',
      keyPoints: [
        'Two-Tier Hierarchy: L1 (local process RAM) provides sub-microsecond reads; L2 (Redis) provides cross-pod synchronization.',
        'Stampede Protection: Only 1 concurrent execution fetches from the database; other concurrent requests await the leader result.',
        'Tag-Based Invalidation: Group entries with tags and evict multiple cache items across both L1 and L2 simultaneously.',
        'Zero Allocation Serialization: Uses modern buffer serialization directly against Redis.'
      ],
      codeOrQuerySnippet: {
        title: 'HybridCache in .NET 9 with Stampede Protection',
        language: 'csharp',
        code: `// Program.cs (.NET 9)
builder.Services.AddHybridCache(options =>
{
    options.DefaultEntryOptions = new HybridCacheEntryOptions
    {
        Expiration = TimeSpan.FromMinutes(30),
        LocalCacheExpiration = TimeSpan.FromMinutes(5) // L1 In-Memory TTL
    };
});

// Service implementation:
public class MortgageRateService(HybridCache cache, MortgageDbContext dbContext)
{
    public async Task<RateTableDto> GetDailyRatesAsync(string stateCode, CancellationToken ct)
    {
        string cacheKey = $"rates:{stateCode.ToUpper()}";

        // HybridCache checks L1 (RAM) -> L2 (Redis) -> executes factory lambda with stampede protection!
        return await cache.GetOrCreateAsync(
            cacheKey,
            async token => await dbContext.RateTables
                .AsNoTracking()
                .Where(r => r.StateCode == stateCode)
                .Select(r => new RateTableDto(r.StateCode, r.BaseRate, r.EffectiveDate))
                .FirstAsync(token),
            cancellationToken: ct
        );
    }
}`
      },
      proTipOrPitfall: 'Ensure types cached in HybridCache are serializable if an L2 distributed provider (Redis) is attached; if types cannot be serialized to bytes, Redis storage will fail.',
      studyResources: [
        {
          title: 'HybridCache library in ASP.NET Core',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/performance/caching/hybrid',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-82',
    category: 'C# & .NET',
    question: '82. How does TimeProvider in .NET 8 enable deterministic time mocking and timer simulation in unit tests?',
    difficulty: 'Mid-Level (3-5 YOE)',
    tags: ['C#', 'TimeProvider', '.NET 8', 'Unit Testing', 'Time Abstraction'],
    shortSummary: 'Explains replacing DateTime.UtcNow and System.Threading.Timer with abstract TimeProvider and FakeTimeProvider in tests.',
    detailedAnswer: {
      executiveSummary: 'Relying directly on `DateTime.UtcNow` or `Thread.Sleep` creates non-deterministic unit tests prone to race conditions. .NET 8 introduced the abstract `TimeProvider` class. By injecting `TimeProvider` into services, production code uses `TimeProvider.System`, while unit tests inject `FakeTimeProvider` (from `Microsoft.Extensions.TimeProvider.Testing`) to advance time forward instantaneously without real-world delays.',
      keyPoints: [
        'TimeProvider.System: Production implementation returning real-world system UTC timestamps.',
        'FakeTimeProvider: Test implementation enabling programmatic time travel (`fakeTime.Advance(TimeSpan.FromDays(30))`).',
        'Timer & Delay Virtualization: `timeProvider.CreateTimer()` and `Task.Delay(timeout, timeProvider)` execute deterministically in unit tests.',
        'High-Precision Timestamps: `timeProvider.GetTimestamp()` provides high-resolution performance counters.'
      ],
      codeOrQuerySnippet: {
        title: 'Deterministic Unit Testing with TimeProvider and FakeTimeProvider',
        language: 'csharp',
        code: `// Business Service:
public class LoanGracePeriodEvaluator(TimeProvider timeProvider)
{
    public bool IsPaymentDelinquent(DateTime dueDateUtc)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        return now > dueDateUtc.AddDays(15); // 15-day grace period
    }
}

// Unit Test:
public class LoanGracePeriodTests
{
    [Fact]
    public void IsPaymentDelinquent_ReturnsTrue_AfterGracePeriodExpires()
    {
        var fakeTime = new FakeTimeProvider(new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero));
        var evaluator = new LoanGracePeriodEvaluator(fakeTime);
        var dueDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        // Advance simulated time forward 16 days instantaneously
        fakeTime.Advance(TimeSpan.FromDays(16));

        bool isDelinquent = evaluator.IsPaymentDelinquent(dueDate);
        isDelinquent.Should().BeTrue();
    }
}`
      },
      proTipOrPitfall: 'Never use `DateTime.Now` or `DateTime.UtcNow` directly in domain logic classes. Always inject `TimeProvider` to maintain 100% testable time calculations.',
      studyResources: [
        {
          title: 'TimeProvider Class (.NET 8)',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.timeprovider',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-83',
    category: 'C# & .NET',
    question: '83. How do ASP.NET Core Health Checks implement Kubernetes Liveness, Readiness, and Startup probes with UI Dashboards?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'Health Checks', 'Kubernetes', 'DevOps', 'Resilience', 'Monitoring'],
    shortSummary: 'Explains IHealthCheck, tags for Readiness vs Liveness, status codes (200 Healthy, 503 Unhealthy), and UI dashboards.',
    detailedAnswer: {
      executiveSummary: 'Kubernetes uses health probes to manage container lifecycles: **Startup** (verifies initialization), **Liveness** (restarts crashed pods), and **Readiness** (removes pods from load balancer routing when dependencies fail). ASP.NET Core provides `IHealthCheck` with tag-based filtering (`Predicate = check => check.Tags.Contains("ready")`), ensuring readiness checks test database/Redis connectivity while liveness checks only test process responsiveness.',
      keyPoints: [
        'Liveness Probe (`/healthz/live`): Checks basic HTTP responsiveness; failure restarts the container pod.',
        'Readiness Probe (`/healthz/ready`): Checks DB, Redis, and message broker connections; failure detaches pod from traffic.',
        'HealthStatus Enums: Returns `HealthStatus.Healthy`, `Degraded`, or `Unhealthy` (maps to HTTP 503).',
        'AspNetCore.Diagnostics.HealthChecks: Provides ready-made checks for SQL Server, Redis, RabbitMQ, and Azure Service Bus.'
      ],
      codeOrQuerySnippet: {
        title: 'Kubernetes Liveness and Readiness Health Checks Configuration',
        language: 'csharp',
        code: `// Program.cs
builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy(), tags: ["live"])
    .AddSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")!, name: "sqlserver", tags: ["ready"])
    .AddRedis(builder.Configuration.GetConnectionString("Redis")!, name: "redis", tags: ["ready"]);

var app = builder.Build();

// Liveness probe (Lightweight, 0 dependency check)
app.MapHealthChecks("/healthz/live", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live")
});

// Readiness probe (Deep dependency validation)
app.MapHealthChecks("/healthz/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});`
      },
      proTipOrPitfall: 'Never include heavy external dependencies (like SQL database or external payment gateways) inside the Liveness probe. If the database experiences transient latency, Kubernetes will continuously restart all application pods, causing a cascading outage.',
      studyResources: [
        {
          title: 'Health checks in ASP.NET Core',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-84',
    category: 'C# & .NET',
    question: '84. How does High-Performance Structured Logging with [LoggerMessage] source generators outperform string formatting and Serilog interpolation?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'Logging', 'LoggerMessage', 'Performance', 'Source Generators'],
    shortSummary: 'Explains [LoggerMessage] compile-time delegate generation, zero boxing of value types, and zero string allocation when logging is disabled.',
    detailedAnswer: {
      executiveSummary: 'Traditional `logger.LogInformation("Processing loan {LoanId} for {Amount}", loanId, amount)` boxes value types (like `decimal` and `Guid`) into `object[]` arrays and performs runtime string parsing even when the log level is disabled. The `[LoggerMessage]` source generator creates strongly typed, compile-time logging delegates that check log level thresholds first, format strings with zero boxing, and allocate zero heap memory when disabled.',
      keyPoints: [
        '[LoggerMessage] Attribute: Directs Roslyn source generator to emit an optimized `LoggerMessage.Define` delegate.',
        'Zero Boxing: Strongly typed method parameters avoid casting `int`, `decimal`, or `Guid` to `object`.',
        'Zero Allocation when Inactive: Checks `logger.IsEnabled(LogLevel.Information)` before executing any formatting.',
        'Event ID & Template Enforcement: Enforces static Event IDs and template syntax consistency across teams.'
      ],
      codeOrQuerySnippet: {
        title: 'Compile-Time LoggerMessage Source Generator in C#',
        language: 'csharp',
        code: `public static partial class MortgageLogMessages
{
    // High-performance compile-time logger message
    [LoggerMessage(
        EventId = 1001,
        Level = LogLevel.Information,
        Message = "Underwriting evaluation completed for LoanId {LoanId}. Status: {Status}, ApprovedAmount: {ApprovedAmount:C}")]
    public static partial void LogUnderwritingCompleted(
        this ILogger logger, Guid loanId, string status, decimal approvedAmount);

    [LoggerMessage(
        EventId = 1002,
        Level = LogLevel.Error,
        Message = "Failed to communicate with Credit Bureau Gateway for Borrower {BorrowerSsn}")]
    public static partial void LogCreditBureauFailure(
        this ILogger logger, Exception ex, string borrowerSsn);
}`
      },
      proTipOrPitfall: 'Always define `[LoggerMessage]` methods on `partial` static or instance classes, as the compiler requires partial class declarations to generate matching implementation files.',
      studyResources: [
        {
          title: 'Compile-time logging source generation',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/extensions/logger-message-generator',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-85',
    category: 'C# & .NET',
    question: '85. What are C# 11/12 List Patterns and Slice Patterns, and how do they simplify sequence matching and packet parsing?',
    difficulty: 'Junior (0-2 YOE)',
    tags: ['C# 11', 'List Patterns', 'Slice Patterns', 'Pattern Matching'],
    shortSummary: 'Explains `[1, 2, ..]`, slice pattern `..`, discard `_`, and structural sequence matching on arrays and spans.',
    detailedAnswer: {
      executiveSummary: 'C# 11 introduced List Patterns, allowing pattern matching directly against arrays, lists, spans, and indexable collections. You can match exact sequences (`[1, 2, 3]`), use discards (`[var first, _, var third]`), match length constraints, and use the slice pattern (`..`) to capture or ignore variable-length sub-sequences.',
      keyPoints: [
        'Sequence Matching: `if (tokens is ["GET", var path, "HTTP/1.1"])` validates exact positional tokens.',
        'Discard Pattern (`_`): Matches any single element at a specific index.',
        'Slice Pattern (`..`): Matches zero or more elements: `[var head, .. var tail]`.',
        'Span & List Support: Works over `T[]`, `List<T>`, `Span<T>`, and `ReadOnlySpan<T>`.'
      ],
      codeOrQuerySnippet: {
        title: 'Parsing Financial Command Stream with List Patterns',
        language: 'csharp',
        code: `public class FinancialCommandParser
{
    public static string ProcessCommand(string[] tokens) => tokens switch
    {
        ["LOAN", "APPROVE", var loanId] => $"Approving loan {loanId}",
        ["LOAN", "ADJUST", var loanId, var newRate] => $"Adjusting loan {loanId} to {newRate}%",
        ["BATCH", .. var batchItems, "COMMIT"] => $"Processing batch of {batchItems.Length} items",
        ["PING"] => "PONG",
        _ => "Invalid Command Syntax"
    };

    public static bool IsValidHeader(ReadOnlySpan<byte> headerBytes) => headerBytes switch
    {
        [0x4D, 0x54, 0x47, ..] => true, // Matches "MTG" magic header bytes at start
        _ => false
    };
}`
      },
      proTipOrPitfall: 'Slice patterns (`..`) can only appear at most ONCE inside a single list pattern; having multiple slice patterns in the same bracket expression causes a compiler error.',
      studyResources: [
        {
          title: 'List patterns - C# 11 pattern matching',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns#list-patterns',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-86',
    category: 'C# & .NET',
    question: '86. What is the difference between Memory<T> and Span<T>, and why must Memory<T> be used in asynchronous method signatures?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'Memory<T>', 'Span<T>', 'Async/Await', 'Memory Management'],
    shortSummary: 'Explains ref struct stack-only limitations of Span<T>, heap storability of Memory<T>, and async method state machines.',
    detailedAnswer: {
      executiveSummary: '`Span<T>` is a `ref struct` that can only reside on the thread stack, meaning it cannot cross `await` boundaries or be stored in heap objects (such as async state machine classes generated by the compiler). `Memory<T>` is a standard struct that encapsulates an underlying array or native buffer and CAN live on the heap. Asynchronous methods accept `Memory<T>` (or `ReadOnlyMemory<T>`), slicing it and obtaining a stack `Span<T>` synchronously via `.Span` when ready to read/write.',
      keyPoints: [
        'Span<T>: Stack-only ref struct; fastest zero-allocation slicing; cannot be used in async methods across await.',
        'Memory<T>: Heap-allocatable struct holding a reference to an array, string, or MemoryManager; can cross await boundaries.',
        'Memory<T>.Span: Accesses underlying `Span<T>` synchronously during computation blocks.',
        'Stream Async Overloads: `Stream.ReadAsync(Memory<byte>, CancellationToken)` accepts Memory<T>.'
      ],
      codeOrQuerySnippet: {
        title: 'Using Memory<T> across Async Await Boundaries',
        language: 'csharp',
        code: `public class FastAsyncFileProcessor
{
    public async Task ProcessMortgageDocumentAsync(Stream stream, CancellationToken ct)
    {
        // Memory<byte> can safely live inside the async state machine on the heap!
        Memory<byte> buffer = new byte[8192];

        while (true)
        {
            int bytesRead = await stream.ReadAsync(buffer, ct);
            if (bytesRead == 0) break;

            // Obtain synchronous Span<T> from Memory<T> for fast zero-allocation parsing
            ReadOnlySpan<byte> activeSlice = buffer.Slice(0, bytesRead).Span;
            ParseMortgageSegment(activeSlice);
        }
    }

    private void ParseMortgageSegment(ReadOnlySpan<byte> segment) { }
}`
      },
      proTipOrPitfall: 'Never call `.Span` on a `Memory<T>` instance and pass that `Span<T>` into an async method; pass the `Memory<T>` instance itself.',
      studyResources: [
        {
          title: 'Memory<T> and Span<T> usage guidelines',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/memory-t-usage-guidelines',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-87',
    category: 'C# & .NET',
    question: '87. How do StructLayout and FieldOffset attributes create C-style Memory Unions and Interop Structs in C#?',
    difficulty: 'Principal Architect',
    tags: ['C#', 'StructLayout', 'FieldOffset', 'Memory Unions', 'P/Invoke', 'Low Latency'],
    shortSummary: 'Explains LayoutKind.Explicit, FieldOffset(0), overlapping memory fields, fast bitcasting, and native C struct interop.',
    detailedAnswer: {
      executiveSummary: '`[StructLayout(LayoutKind.Explicit)]` combined with `[FieldOffset(N)]` allows developers to explicitly define the byte offset of each field inside a struct. By setting multiple fields to the exact same offset (e.g. `FieldOffset(0)`), fields overlap in memory, creating a C-style union. This enables zero-allocation bitcasting between primitive types (e.g. interpreting a `ulong` as an `IEEE 754 double` or four `ushort` values).',
      keyPoints: [
        'LayoutKind.Explicit: Developer controls exact byte positioning of all fields.',
        'Overlapping Fields: Multiple fields share the same memory address when assigned identical byte offsets.',
        'Bitcasting: Fast conversions between binary representations without pointer casting.',
        'Packing & Alignment: `Pack = 1` eliminates compiler padding bytes for exact binary protocol mapping.'
      ],
      codeOrQuerySnippet: {
        title: 'C-Style Memory Union with StructLayout in C#',
        language: 'csharp',
        code: `using System.Runtime.InteropServices;

[StructLayout(LayoutKind.Explicit)]
public struct FinancialPacketUnion
{
    [FieldOffset(0)]
    public ulong RawBitRepresentation;

    [FieldOffset(0)]
    public double FloatRate;

    [FieldOffset(0)]
    public uint LowPart;

    [FieldOffset(4)]
    public uint HighPart;
}

public class UnionTest
{
    public static void Demo()
    {
        var union = new FinancialPacketUnion { FloatRate = 6.875 };
        Console.WriteLine($"Raw Hex: {union.RawBitRepresentation:X16}");
        Console.WriteLine($"High Part: {union.HighPart:X8}, Low Part: {union.LowPart:X8}");
    }
}`
      },
      proTipOrPitfall: 'Never overlap reference type fields (objects/strings) with value types at overlapping offsets; the runtime runtime-type-checker will throw a `TypeLoadException` to preserve GC pointer safety.',
      studyResources: [
        {
          title: 'StructLayoutAttribute Class',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.structlayoutattribute',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-88',
    category: 'C# & .NET',
    question: '88. How do IAsyncDisposable and await using ensure clean, non-blocking asynchronous resource cleanup in .NET Core?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'IAsyncDisposable', 'DisposeAsync', 'Async Cleanup', 'Resource Management'],
    shortSummary: 'Explains ValueTask DisposeAsync(), await using statements, async database connections, and flushing streams.',
    detailedAnswer: {
      executiveSummary: 'Traditional `IDisposable.Dispose()` is synchronous, which forces asynchronous resources (like closing network sockets, flushing buffered HTTP/file streams, or returning pooled DB connections) to block the calling thread or execute sync-over-async anti-patterns. `IAsyncDisposable` and `await using` provide a non-blocking asynchronous cleanup mechanism returning a `ValueTask`.',
      keyPoints: [
        'IAsyncDisposable: Exposes `ValueTask DisposeAsync()` for asynchronous disposal.',
        'await using: Asynchronously disposes the resource when exiting the code block.',
        'Non-Blocking Stream Flush: Ensures buffered bytes in network streams are fully written before release.',
        'Dual Implementation: Classes can implement both `IDisposable` and `IAsyncDisposable` for consumer flexibility.'
      ],
      codeOrQuerySnippet: {
        title: 'Implementing and Consuming IAsyncDisposable in C#',
        language: 'csharp',
        code: `public class AsyncBlobStorageWriter : IAsyncDisposable
{
    private readonly FileStream _fileStream;

    public AsyncBlobStorageWriter(string path)
    {
        _fileStream = new FileStream(path, FileMode.Create, FileAccess.Write, FileShare.None, 4096, useAsync: true);
    }

    public async Task WriteChunkAsync(ReadOnlyMemory<byte> data, CancellationToken ct)
    {
        await _fileStream.WriteAsync(data, ct);
    }

    public async ValueTask DisposeAsync()
    {
        // Flush remaining buffer asynchronously without blocking threads
        await _fileStream.FlushAsync();
        await _fileStream.DisposeAsync();
        GC.SuppressFinalize(this);
    }
}

// Consumer:
// await using var writer = new AsyncBlobStorageWriter("loan_audit.bin");
// await writer.WriteChunkAsync(data, ct);`
      },
      proTipOrPitfall: 'Always call `GC.SuppressFinalize(this)` inside `DisposeAsync()` just like in synchronous `Dispose()` to remove the object from the GC finalizer queue.',
      studyResources: [
        {
          title: 'Implement a DisposeAsync method',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implement-disposeasync',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-89',
    category: 'C# & .NET',
    question: '89. How does ActivitySource and OpenTelemetry distributed tracing propagate W3C TraceContext headers across HTTP and message brokers in .NET?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'OpenTelemetry', 'Distributed Tracing', 'ActivitySource', 'Observability', 'W3C'],
    shortSummary: 'Explains traceparent header, ActivitySource/Activity spans, tags/baggage, and Jaeger/Application Insights exporting.',
    detailedAnswer: {
      executiveSummary: 'Distributed tracing tracks requests as they flow across multiple microservices. In .NET, `System.Diagnostics.ActivitySource` creates and manages trace spans according to the W3C TraceContext standard (`traceparent` header containing `version-traceId-spanId-flags`). `HttpClient` and MassTransit automatically propagate trace context headers across network boundaries, allowing OpenTelemetry collectors (Jaeger, Prometheus, Azure App Insights) to assemble complete end-to-end distributed flamegraphs.',
      keyPoints: [
        'ActivitySource: Creates strongly typed trace spans: `using var activity = _activitySource.StartActivity("UnderwriteLoan")`.',
        'W3C TraceContext: Standard HTTP header `traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`.',
        'Tags & Events: Enrich traces with domain attributes (`activity?.SetTag("loan.amount", 500000)`).',
        'OpenTelemetry SDK: Configured in Program.cs to export traces to OTLP collectors.'
      ],
      codeOrQuerySnippet: {
        title: 'Creating Custom ActivitySource Tracing Spans in C#',
        language: 'csharp',
        code: `public class MortgageUnderwritingActivityTracer
{
    private static readonly ActivitySource ActivitySource = new("Enterprise.Mortgage.Underwriting", "1.0.0");

    public async Task<bool> ExecuteUnderwritingWorkflowAsync(Guid loanId, decimal amount)
    {
        // Starts a distributed tracing span
        using var activity = ActivitySource.StartActivity("EvaluateLoanApplication", ActivityKind.Internal);
        
        activity?.SetTag("mortgage.loan_id", loanId.ToString());
        activity?.SetTag("mortgage.requested_amount", amount);

        try
        {
            await Task.Delay(50); // Simulate underwriting computation
            activity?.SetStatus(ActivityStatusCode.Ok);
            return true;
        }
        catch (Exception ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            activity?.RecordException(ex);
            throw;
        }
    }
}`
      },
      proTipOrPitfall: 'Do not log sensitive PII (like plain-text Social Security Numbers or Credit Card numbers) in OpenTelemetry span tags, as traces are often stored in plain-text observability systems.',
      studyResources: [
        {
          title: 'Distributed tracing in .NET',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-90',
    category: 'C# & .NET',
    question: '90. How does PeriodicTimer in .NET 6+ solve timer drift, memory leaks, and overlapping async execution in background services?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'PeriodicTimer', 'BackgroundService', 'Concurrency', 'Threading'],
    shortSummary: 'Explains WaitForNextTickAsync, eliminating timer callbacks, preventing overlapping ticks, and clean cancellation handling.',
    detailedAnswer: {
      executiveSummary: 'Legacy `System.Threading.Timer` executes callbacks on ThreadPool threads without awaiting asynchronous methods, causing new ticks to fire before previous asynchronous operations complete (overlapping executions). `PeriodicTimer` (introduced in .NET 6) is designed specifically for `async/await`. Calling `await timer.WaitForNextTickAsync(ct)` pauses execution asynchronously until the next tick arrives, completely eliminating overlapping executions and drift.',
      keyPoints: [
        'Sequential Async Ticks: Next tick is not evaluated until previous async iteration completes.',
        'Zero Overlapping Executions: Eliminates race conditions and concurrency locks in recurring background workers.',
        'Cancellation Friendly: `WaitForNextTickAsync(cancellationToken)` returns `false` or throws cleanly on shutdown.',
        'Zero Callback Allocations: No delegate or state object allocations per tick.'
      ],
      codeOrQuerySnippet: {
        title: 'BackgroundService using PeriodicTimer in .NET',
        language: 'csharp',
        code: `public class MortgageRateRefreshWorker(
    IServiceScopeFactory scopeFactory, 
    ILogger<MortgageRateRefreshWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(15));

        logger.LogInformation("Rate Refresh Worker started.");

        // Waits asynchronously for the next 15-minute interval
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var rateService = scope.ServiceProvider.GetRequiredService<IRateService>();
                
                await rateService.SyncMarketRatesAsync(stoppingToken);
                logger.LogInformation("Successfully refreshed market rates at {Time}", DateTime.UtcNow);
            }
            catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
            {
                logger.LogError(ex, "Error occurred refreshing rates.");
            }
        }
    }
}`
      },
      proTipOrPitfall: 'Always wrap `PeriodicTimer` in a `using` statement or dispose it when exiting `ExecuteAsync` to release underlying timer resources immediately.',
      studyResources: [
        {
          title: 'PeriodicTimer Class',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.threading.periodictimer',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-91',
    category: 'C# & .NET',
    question: '91. How does ObjectPool<T> and DefaultObjectPoolProvider reuse expensive objects (StringBuilder, buffers, cryptographic engines) in high-throughput ASP.NET Core pipelines?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'ObjectPool', 'Performance', 'Memory Management', 'Garbage Collection'],
    shortSummary: 'Explains Rent/Return pattern, IPooledObjectPolicy, preventing Gen 2 GC collections, and thread-safe instance pools.',
    detailedAnswer: {
      executiveSummary: 'Allocating large or complex objects (e.g. `StringBuilder` with 64KB capacity, cryptographic transformers, or protocol parsers) repeatedly in hot paths forces objects into Gen 1 and Gen 2 heap spaces, triggering costly GC pauses. `Microsoft.Extensions.ObjectPool` maintains a thread-safe pool of reusable instances. Services "rent" an object, use it, and "return" it to the pool in a `finally` block, reducing allocations to near zero.',
      keyPoints: [
        'ObjectPool<T>: Provides `Get()` to rent an instance and `Return(obj)` to recycle it.',
        'IPooledObjectPolicy<T>: Defines `Create()` to instantiate new instances and `Return()` to reset state before returning to the pool.',
        'StringBuilderPooledObjectPolicy: Built-in policy for recycling string builders with capacity caps.',
        'Thread Safety: Lock-free synchronization algorithms optimize multi-core concurrent pooling.'
      ],
      codeOrQuerySnippet: {
        title: 'High-Throughput StringBuilder Pooling in C#',
        language: 'csharp',
        code: `public class MortgageAuditReportGenerator
{
    private readonly ObjectPool<StringBuilder> _stringBuilderPool;

    public MortgageAuditReportGenerator(ObjectPoolProvider poolProvider)
    {
        // Pool retains up to 100 StringBuilders with 32KB max retained capacity
        var policy = new StringBuilderPooledObjectPolicy { MaximumRetainedCapacity = 32 * 1024 };
        _stringBuilderPool = poolProvider.Create(policy);
    }

    public string GenerateAuditReport(LoanApplication loan)
    {
        var sb = _stringBuilderPool.Get();
        try
        {
            sb.Append("LOAN AUDIT REPORT - ID: ").Append(loan.Id).AppendLine();
            sb.Append("BORROWER: ").Append(loan.BorrowerName).AppendLine();
            sb.Append("AMOUNT: ").Append(loan.Principal.ToString("C")).AppendLine();
            return sb.ToString();
        }
        finally
        {
            _stringBuilderPool.Return(sb); // State is cleared and returned to pool!
        }
    }
}`
      },
      proTipOrPitfall: 'Always return rented objects to the pool inside a `finally` block. If an exception occurs and the object is not returned, the pool will lose capacity and allocate replacement instances.',
      studyResources: [
        {
          title: 'Object reuse with ObjectPool in ASP.NET Core',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/performance/ObjectPool',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-92',
    category: 'C# & .NET',
    question: '92. How does LibraryImport and source-generated P/Invoke in .NET 7/8 replace legacy DllImport for zero-overhead native C/C++ interop?',
    difficulty: 'Principal Architect',
    tags: ['C#', 'LibraryImport', 'P/Invoke', 'Native Interop', 'Source Generators', 'AOT'],
    shortSummary: 'Explains [LibraryImport], compile-time marshalling stubs, eliminating runtime IL stubs, and Native AOT compatibility.',
    detailedAnswer: {
      executiveSummary: 'Legacy `[DllImport]` generated runtime IL marshalling stubs using dynamic code emission, which added invocation overhead and prevented Native AOT compilation. .NET 7 introduced `[LibraryImport]`, a Roslyn source generator that generates strongly typed C# marshalling code at compile time. This eliminates runtime stub generation, enables inlining, and provides full compatibility with trimmed and Native AOT applications.',
      keyPoints: [
        '[LibraryImport]: Replaces `[DllImport]` on `partial` method declarations.',
        'Compile-Time Marshalling: Emits explicit C# memory pinning and pointer passing code visible in generated files.',
        'StringMarshalling: Explicitly specify `StringMarshalling.Utf8` or `StringMarshalling.Utf16`.',
        'Native AOT Compliant: No runtime JIT IL stub generation required.'
      ],
      codeOrQuerySnippet: {
        title: 'Source-Generated Native Interop with LibraryImport in C#',
        language: 'csharp',
        code: `using System.Runtime.InteropServices;

public static partial class NativeFinancialEngine
{
    // Source generator generates fast, zero-reflection P/Invoke marshaller at compile time!
    [LibraryImport("libfinancial_core.so", EntryPoint = "compute_loan_apr", StringMarshalling = StringMarshalling.Utf8)]
    [UnmanagedCallConv(CallConvs = [typeof(System.Runtime.CompilerServices.CallConvCdecl)])]
    public static partial double ComputeLoanApr(
        double principal, double monthlyPayment, int termMonths, string rateScheduleName);
}`
      },
      proTipOrPitfall: 'Methods decorated with `[LibraryImport]` must be declared as `static partial`, and the containing class must also be declared as `partial`.',
      studyResources: [
        {
          title: 'Source-generated P/Invoke with LibraryImport',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/native-interop/pinvoke-source-generation',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-93',
    category: 'C# & .NET',
    question: '93. How do EF Core 8 Complex Types ([ComplexType] / ComplexProperty) compare to Owned Entity Types for mapping value objects to SQL columns?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'EF Core 8', 'Complex Types', 'Value Objects', 'DDD', 'SQL Mapping'],
    shortSummary: 'Explains value object mapping without synthetic primary keys, nested complex types, and change tracking by value.',
    detailedAnswer: {
      executiveSummary: 'In EF Core prior to version 8, mapping Domain-Driven Design Value Objects required Owned Entity Types (`OwnsOne`), which internally treated the value object as a hidden entity with synthetic shadow primary keys and table splitting. EF Core 8 introduced true **Complex Types** (`[ComplexType]` or `builder.ComplexProperty()`). Complex types are treated as pure value structures without identities, supporting clean column mapping, nullability, and nested complex types without table splitting impedance.',
      keyPoints: [
        'Pure Value Semantics: No synthetic shadow primary keys or entity identity.',
        'ComplexProperty API: Configured via `modelBuilder.Entity<Loan>().ComplexProperty(l => l.Terms);`.',
        'Nested Complex Types: Complex types can contain other complex types (e.g. `Address` containing `ZipCode`).',
        'Immutability Support: Maps directly to C# `readonly record struct` value objects.'
      ],
      codeOrQuerySnippet: {
        title: 'EF Core 8 Complex Types Mapping for DDD Value Objects',
        language: 'csharp',
        code: `// Value Object
public readonly record struct LoanTerms(decimal InterestRate, int DurationMonths, string Currency);

// Entity
public class LoanApplication
{
    public Guid Id { get; set; }
    public string BorrowerName { get; set; } = null!;
    public LoanTerms Terms { get; set; } // Complex Type Value Object
}

// DbContext configuration:
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<LoanApplication>(entity =>
    {
        entity.HasKey(e => e.Id);
        
        // EF Core 8 Complex Property maps properties directly as columns on the LoanApplications table
        entity.ComplexProperty(e => e.Terms, terms =>
        {
            terms.Property(t => t.InterestRate).HasPrecision(5, 4).HasColumnName("Terms_InterestRate");
            terms.Property(t => t.DurationMonths).HasColumnName("Terms_DurationMonths");
            terms.Property(t => t.Currency).HasMaxLength(3).HasColumnName("Terms_Currency");
        });
    });
}`
      },
      proTipOrPitfall: 'Unlike Owned Entities, Complex Types cannot be shared across multiple entity tables or configured with independent database tables; they are always stored inline in the containing entity\'s table.',
      studyResources: [
        {
          title: 'Complex types in EF Core 8',
          url: 'https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-8.0/whatsnew#complex-types-as-value-objects',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-94',
    category: 'C# & .NET',
    question: '94. How does MemoryBarrier and the Volatile class ensure CPU memory ordering and visibility in lock-free concurrent C# code?',
    difficulty: 'Principal Architect',
    tags: ['C#', 'MemoryBarrier', 'Volatile', 'Concurrency', 'Lock-Free', 'Memory Model'],
    shortSummary: 'Explains CPU out-of-order instruction execution, CPU cache coherency, volatile reads/writes, and full memory fences.',
    detailedAnswer: {
      executiveSummary: 'Modern multi-core CPUs and JIT compilers aggressively reorder read and write instructions to optimize pipeline throughput. In multi-threaded lock-free algorithms, this instruction reordering can cause Thread B to observe writes out of order. `Thread.MemoryBarrier()` creates a full hardware memory fence preventing CPU reordering across the boundary. `Volatile.Write()` and `Volatile.Read()` enforce acquire-release semantics, guaranteeing immediate visibility across CPU core caches.',
      keyPoints: [
        'Instruction Reordering: CPUs and JIT reorder operations unless bounded by memory barriers.',
        'Volatile.Write: Enforces a release barrier (all previous writes complete before this write publishes).',
        'Volatile.Read: Enforces an acquire barrier (subsequent reads observe values after this read).',
        'Thread.MemoryBarrier(): Inserts a full bidirectional hardware fence on the CPU pipeline.'
      ],
      codeOrQuerySnippet: {
        title: 'Lock-Free Publishing with Volatile Memory Barriers in C#',
        language: 'csharp',
        code: `public class LockFreeRatePublisher
{
    private decimal[] _latestRates = [];
    private int _isInitialized = 0;

    public void PublishRates(decimal[] newRates)
    {
        _latestRates = newRates;
        
        // Memory fence ensures _latestRates write is committed to memory BEFORE _isInitialized is set to 1
        Volatile.Write(ref _isInitialized, 1);
    }

    public decimal[]? TryGetRates()
    {
        // Acquire barrier ensures _isInitialized is read before attempting to read _latestRates
        if (Volatile.Read(ref _isInitialized) == 1)
        {
            return _latestRates;
        }
        return null;
    }
}`
      },
      proTipOrPitfall: 'Avoid using the legacy C# `volatile` keyword on fields; prefer explicit `Volatile.Read` and `Volatile.Write` method calls, which make memory barriers and concurrency intentions explicit.',
      studyResources: [
        {
          title: 'The .NET Memory Model and Thread.MemoryBarrier',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.threading.thread.memorybarrier',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-95',
    category: 'C# & .NET',
    question: '95. How does SIMD Hardware Intrinsics (Vector128, Vector256, Vector512) accelerate CPU data processing in C# with AVX2 and AVX-512?',
    difficulty: 'Principal Architect',
    tags: ['C#', 'SIMD', 'Hardware Intrinsics', 'AVX2', 'AVX-512', 'Vectorization'],
    shortSummary: 'Explains Single Instruction Multiple Data (SIMD), processing 8-16 floats per CPU clock cycle, and Avx2.IsSupported checks.',
    detailedAnswer: {
      executiveSummary: 'SIMD (Single Instruction Multiple Data) enables a CPU core to apply an arithmetic operation to an entire vector of numbers in a single clock cycle. .NET provides hardware intrinsics in `System.Runtime.Intrinsics.X86` (`Avx2`, `Avx512F`, `Sse2`) and cross-platform `Vector128<T>`, `Vector256<T>`, and `Vector512<T>`. Processing data with 256-bit AVX2 vectors calculates 8 floating-point numbers simultaneously, providing up to 8x throughput gains in calculation-heavy algorithms.',
      keyPoints: [
        'Hardware Detection: Check `Avx2.IsSupported` or `Vector256.IsHardwareAccelerated` before execution.',
        'Parallel Lanes: `Vector256<float>` holds 8 floats; `Vector512<double>` holds 8 doubles.',
        'Vectorized Loops: Process data in vector chunks, followed by a scalar loop for remaining trailing elements.',
        'Cross-Platform: Automatically maps to ARM NEON instructions on Apple Silicon / ARM64 servers.'
      ],
      codeOrQuerySnippet: {
        title: 'Accelerated SIMD Array Summation using Vector256<float>',
        language: 'csharp',
        code: `using System.Runtime.Intrinsics;
using System.Runtime.Intrinsics.X86;

public static class SimdMathEngine
{
    public static float SumVectorized(ReadOnlySpan<float> values)
    {
        float total = 0f;
        int i = 0;

        if (Vector256.IsHardwareAccelerated && values.Length >= Vector256<float>.Count)
        {
            var vectorSum = Vector256<float>.Zero;
            int vectorSize = Vector256<float>.Count; // 8 floats per vector

            fixed (float* ptr = values)
            {
                while (i <= values.Length - vectorSize)
                {
                    var v = Avx.LoadVector256(ptr + i);
                    vectorSum = Avx.Add(vectorSum, v);
                    i += vectorSize;
                }
            }

            // Horizontal sum across vector lanes
            for (int lane = 0; lane < Vector256<float>.Count; lane++)
            {
                total += vectorSum.GetElement(lane);
            }
        }

        // Process remaining tail elements with scalar loop
        for (; i < values.Length; i++)
        {
            total += values[i];
        }

        return total;
    }
}`
      },
      proTipOrPitfall: 'Always implement a scalar fallback loop at the end of SIMD methods to process any remaining elements when the array size is not an exact multiple of the vector lane size.',
      studyResources: [
        {
          title: 'Hardware intrinsics in .NET',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/simd',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-96',
    category: 'C# & .NET',
    question: '96. How do Expression Trees and ExpressionVisitor in C# enable custom LINQ query providers, AST inspection, and query translation?',
    difficulty: 'Principal Architect',
    tags: ['C#', 'Expression Trees', 'ExpressionVisitor', 'LINQ Providers', 'Metaprogramming'],
    shortSummary: 'Explains Expression<Func<T, bool>> vs Func<T, bool>, Abstract Syntax Trees (AST), node visiting, and dynamic query transformation.',
    detailedAnswer: {
      executiveSummary: 'While `Func<T, bool>` represents executable compiled IL code, `Expression<Func<T, bool>>` represents an Abstract Syntax Tree (AST) of the code structure in memory. ORMs like EF Core inspect this expression tree at runtime to translate C# predicates into SQL. By subclassing `ExpressionVisitor`, developers can inspect, rewrite, or intercept AST nodes to build custom query translation layers or dynamic filtering engines.',
      keyPoints: [
        'AST Data Representation: Code is stored as data structures (`BinaryExpression`, `MemberExpression`, `ParameterExpression`).',
        'Expression.Compile(): Compiles an in-memory AST into an executable delegate at runtime.',
        'ExpressionVisitor: Overrides methods like `VisitBinary` or `VisitMember` to transform expression trees.',
        'Dynamic LINQ: Combine multiple predicates dynamically at runtime using `Expression.AndAlso`.'
      ],
      codeOrQuerySnippet: {
        title: 'Dynamic Predicate Builder with Expression Trees in C#',
        language: 'csharp',
        code: `public static class ExpressionBuilder
{
    // Combines two expressions with AND: expr1 AND expr2
    public static Expression<Func<T, bool>> AndAlso<T>(
        this Expression<Func<T, bool>> expr1, Expression<Func<T, bool>> expr2)
    {
        var parameter = Expression.Parameter(typeof(T));

        var leftVisitor = new ReplaceParameterVisitor(expr1.Parameters[0], parameter);
        var left = leftVisitor.Visit(expr1.Body);

        var rightVisitor = new ReplaceParameterVisitor(expr2.Parameters[0], parameter);
        var right = rightVisitor.Visit(expr2.Body);

        return Expression.Lambda<Func<T, bool>>(Expression.AndAlso(left!, right!), parameter);
    }

    private class ReplaceParameterVisitor(ParameterExpression oldParam, ParameterExpression newParam) : ExpressionVisitor
    {
        protected override Expression VisitParameter(ParameterExpression node) =>
            node == oldParam ? newParam : base.VisitParameter(node);
    }
}`
      },
      proTipOrPitfall: 'Compiling expression trees via `expr.Compile()` is computationally expensive. Always cache compiled delegates if executing the same expression repeatedly.',
      studyResources: [
        {
          title: 'Expression Trees (C#)',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/expression-trees/',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-97',
    category: 'C# & .NET',
    question: '97. How does .NET Aspire orchestrate cloud-native microservices, OpenTelemetry dashboards, and service discovery in development and production?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', '.NET Aspire', 'Cloud-Native', 'Microservices', 'OpenTelemetry', 'Orchestration'],
    shortSummary: 'Explains AppHost orchestrator, ServiceDefaults, automated container provisioning with Testcontainers, and Aspire Dashboard.',
    detailedAnswer: {
      executiveSummary: '.NET Aspire is an opinionated, cloud-native stack for building distributed applications. The AppHost project acts as the code-first orchestrator, provisioning containers (Redis, Postgres, RabbitMQ), linking microservices, and injecting service discovery endpoints. The ServiceDefaults project configures standardized OpenTelemetry distributed tracing, metrics, structured logging, and resilient Polly HTTP pipelines across all microservices automatically.',
      keyPoints: [
        'AppHost Orchestration: Declare multi-project dependencies and backing containers in C# code.',
        'Aspire Dashboard: Real-time UI displaying live distributed traces, structured logs, container metrics, and endpoints.',
        'Service Discovery: Connect to peer services via logical names (`https+http://mortgage-api`) without hardcoded URLs.',
        'Production Deployment: Emits deployment manifests for Azure Container Apps, Kubernetes, or Docker Compose.'
      ],
      codeOrQuerySnippet: {
        title: '.NET Aspire AppHost Orchestrator Configuration in C#',
        language: 'csharp',
        code: `// AppHost / Program.cs
var builder = DistributedApplication.CreateBuilder(args);

// Spin up containerized Redis cache with dashboard integration
var redis = builder.AddRedis("cache");

// Spin up containerized SQL Server database
var sqlServer = builder.AddSqlServer("sql").AddDatabase("mortgagedb");

// Add Underwriting Microservice with references to dependencies
var underwritingApi = builder.AddProject<Projects.Mortgage_UnderwritingApi>("underwriting-api")
    .WithReference(sqlServer)
    .WithReference(redis);

// Add Frontend Web Application referencing backend API
builder.AddProject<Projects.Mortgage_Web>("frontend-portal")
    .WithReference(underwritingApi);

builder.Build().Run();`
      },
      proTipOrPitfall: 'Always reference the shared `ServiceDefaults` project in every microservice to ensure uniform health checks, OpenTelemetry exports, and Polly retry resilience.',
      studyResources: [
        {
          title: '.NET Aspire overview',
          url: 'https://learn.microsoft.com/en-us/dotnet/aspire/get-started/aspire-overview',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-98',
    category: 'C# & .NET',
    question: '98. How do MassTransit Consumer Error Pipelines, Retry Policies, and Dead Letter Queues (DLQ) handle poison messages in event-driven systems?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'MassTransit', 'Dead Letter Queue', 'Error Handling', 'RabbitMQ', 'Resilience'],
    shortSummary: 'Explains immediate retry, exponential backoff with jitter, error queues (_error), skipped queues, and redelivery scheduling.',
    detailedAnswer: {
      executiveSummary: 'In event-driven architectures, transient network blips or unhandled exceptions during message processing must be isolated to prevent queue blockages. MassTransit provides built-in retry policies (immediate, interval, exponential backoff with jitter). If all retries fail, MassTransit automatically moves the poison message to a dedicated Dead Letter Queue (e.g. `loan-processing_error`) accompanied by the full exception stack trace, freeing the main queue to continue processing valid messages.',
      keyPoints: [
        'Exponential Backoff: Gradually increases retry delay to give downstream systems time to recover.',
        'Poison Message DLQ: Permanently failed messages are moved to `_error` queues without discarding message data.',
        'Delayed Redelivery: `UseDelayedRedelivery` schedules message reprocessing after minutes or hours using external schedulers.',
        'Exception Filters: Configure `Ignore<ValidationException>()` to immediately route non-retryable bugs to DLQ.'
      ],
      codeOrQuerySnippet: {
        title: 'Configuring MassTransit Resilient Retry and DLQ Policies',
        language: 'csharp',
        code: `builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<ProcessMortgageApplicationConsumer>();

    x.UsingRabbitMQ((context, cfg) =>
    {
        cfg.Host("rabbitmq://localhost");

        cfg.ReceiveEndpoint("loan-processing-queue", e =>
        {
            // Configure exponential retry with jitter for transient failures
            e.UseMessageRetry(r =>
            {
                r.Exponential(5, TimeSpan.FromSeconds(1), TimeSpan.FromMinutes(1), TimeSpan.FromSeconds(5));
                r.Ignore<ArgumentException>(); // Non-retryable validation errors go straight to _error DLQ!
            });

            // Delayed redelivery for long outages (e.g. 5m, 15m, 30m intervals)
            e.UseDelayedRedelivery(r => r.Intervals(TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(15)));

            e.ConfigureConsumer<ProcessMortgageApplicationConsumer>(context);
        });
    });
});`
      },
      proTipOrPitfall: 'Never configure infinite retries without delays. A single malformed poison message will spin on the CPU and block all other valid messages in the queue indefinitely.',
      studyResources: [
        {
          title: 'MassTransit Exceptions and Retry Policies',
          url: 'https://masstransit.io/documentation/concepts/exceptions',
          source: 'MassTransit Docs'
        }
      ]
    }
  },
  {
    id: 'csnet-99',
    category: 'C# & .NET',
    question: '99. How do you implement Zero-Allocation Custom JSON Formatting using IUtf8SpanFormattable and Utf8JsonWriter in C#?',
    difficulty: 'Principal Architect',
    tags: ['C#', 'IUtf8SpanFormattable', 'Utf8JsonWriter', 'High Performance', 'Zero Allocation'],
    shortSummary: 'Explains writing UTF-8 bytes directly to output buffers, eliminating intermediate string allocations, and Span formatting.',
    detailedAnswer: {
      executiveSummary: 'Converting objects to JSON traditionally formats numbers and dates into intermediary C# strings before encoding to UTF-8 bytes, creating massive GC allocations. .NET 8 introduced `IUtf8SpanFormattable`. Combined with `Utf8JsonWriter` and pooled buffers, custom serializers format primitives directly as UTF-8 bytes directly into socket or pipe buffers with zero intermediate string or byte[] heap allocations.',
      keyPoints: [
        'IUtf8SpanFormattable: `TryFormat(Span<byte> utf8Destination, out int bytesWritten, ...)` formats values directly into UTF-8 bytes.',
        'Utf8JsonWriter: High-performance low-level forward-only JSON writer operating on `IBufferWriter<byte>`.',
        'Zero String Conversions: Numbers and GUIDs write directly to byte buffers without calling `.ToString()`.',
        'Throughput: 3-5x faster than standard reflection-based JSON serializers.'
      ],
      codeOrQuerySnippet: {
        title: 'Zero-Allocation Custom JSON Serialization with Utf8JsonWriter',
        language: 'csharp',
        code: `public class UltraFastLoanJsonSerializer
{
    public static void WriteLoanSummary(IBufferWriter<byte> bufferWriter, Guid loanId, decimal amount)
    {
        using var writer = new Utf8JsonWriter(bufferWriter);

        writer.WriteStartObject();
        
        // Write property names as static UTF-8 byte spans
        writer.WriteString("id"u8, loanId);
        writer.WriteNumber("amount"u8, amount);
        writer.WriteString("status"u8, "APPROVED"u8);
        
        writer.WriteEndObject();
        writer.Flush();
    }
}`
      },
      proTipOrPitfall: 'Use the C# 11 UTF-8 string literal suffix `u8` (e.g. `"property"u8`) to create `ReadOnlySpan<byte>` constants at compile time with zero UTF-8 encoding overhead at runtime.',
      studyResources: [
        {
          title: 'IUtf8SpanFormattable Interface',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.iutf8spanformattable',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-100',
    category: 'C# & .NET',
    question: '100. What is the comprehensive roadmap and mental model for mastering modern C# 13 and .NET 9 architecture?',
    difficulty: 'Principal Architect',
    tags: ['C#', '.NET 9', 'Architecture', 'Roadmap', 'Best Practices', 'Senior Engineer'],
    shortSummary: 'Synthesizes runtime memory management, async plumbing, concurrency, cloud-native orchestration, and clean architectural principles.',
    detailedAnswer: {
      executiveSummary: 'Mastering modern C# 13 and .NET 9 requires a holistic mental model combining: 1) **Zero-Allocation Execution** (Spans, Memory, Inline Arrays, ref structs, MemoryPool), 2) **Async & Concurrency Plumbing** (ThreadPool tuning, Channels, PeriodicTimer, Lock, SynchronizationContext), 3) **High-Density Web & Networking** (Kestrel tuning, HTTP/3, SocketsHttpHandler, RateLimiting, HybridCache), 4) **Enterprise Resilience & Data** (EF Core ChangeTracker optimization, Clean Architecture, DDD, MassTransit Outbox/Sagas), and 5) **Cloud-Native Observability** (.NET Aspire, Native AOT, OpenTelemetry, W3C Tracing).',
      keyPoints: [
        'Memory Efficiency: Treat heap allocation as a deliberate design choice; leverage stack and span primitives for hot paths.',
        'Asynchronous Rigor: Never block async code synchronously; enforce cancellation tokens across all I/O boundaries.',
        'Resilience First: Build microservices with Outbox patterns, Idempotency keys, and exponential backoff.',
        'Modern Tooling: Transition from runtime reflection to Roslyn Source Generators, Native AOT, and .NET Aspire.'
      ],
      codeOrQuerySnippet: {
        title: 'The Modern .NET 9 Production Architecture Stack',
        language: 'text',
        code: `┌─────────────────────────────────────────────────────────────┐
│                 .NET 9 Modern Cloud Stack                   │
├─────────────────────────────────────────────────────────────┤
│ Presentation:  Minimal APIs / gRPC / FastEndpoints (AOT)   │
│ Cross-Cutting: Rate Limiting, HybridCache, OpenTelemetry   │
│ Application:   Clean Architecture, CQRS (MediatR Behaviors) │
│ Domain:        DDD Aggregate Roots, Records, Generic Math   │
│ Persistence:   EF Core 8/9 (AsSplitQuery, ExecuteUpdate)   │
│ Messaging:     MassTransit Transactional Outbox + Sagas    │
│ Orchestration: .NET Aspire + Testcontainers Integration    │
└─────────────────────────────────────────────────────────────┘`
      },
      proTipOrPitfall: 'Continuous learning is essential. Focus on understanding CLR memory and JIT mechanics rather than just memorizing syntax—deep fundamentals make new C# language features intuitive.',
      studyResources: [
        {
          title: '.NET Documentation & Architecture Guides',
          url: 'https://learn.microsoft.com/en-us/dotnet/',
          source: 'Microsoft Learn'
        }
      ]
    }
  }
];
