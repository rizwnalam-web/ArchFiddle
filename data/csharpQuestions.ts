import { InterviewQuestion } from './interviewPrepData';

export const TOP_20_CSHARP: InterviewQuestion[] = [
  {
    id: 'csharp-01',
    category: 'C#',
    question: '1. How do Async/Await state machines work under the hood in C#/.NET, and how do you prevent thread starvation or deadlocks in legacy .NET sync contexts?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', '.NET 8', 'Async/Await', 'Threading', 'State Machine'],
    shortSummary: 'Explains C# async compiler transformations, IAsyncStateMachine, SynchronizationContext, and Task.ConfigureAwait(false).',
    detailedAnswer: {
      executiveSummary: 'When you mark a method as async, the C# compiler generates a hidden state machine struct implementing IAsyncStateMachine. It splits code around await operators, registering continuations via AsyncTaskMethodBuilder without blocking calling threads. In legacy ASP.NET or UI contexts with a SynchronizationContext, calling .Result or .Wait() synchronously on an uncompleted Task locks the context thread while the continuation waits for that same thread, resulting in a permanent deadlock.',
      keyPoints: [
        'Compiler Transformation: Replaces async methods with a state machine struct managing execution states (-1: running, 0+: awaiting, -2: completed).',
        'SynchronizationContext: Captures the calling thread context to resume execution on the same thread (essential for UI, but harmful in class libraries).',
        'Deadlock Prevention: Never use .Result or .Wait() on uncompleted tasks; always use async/await all the way down.',
        'ConfigureAwait(false): Instructs the runtime to execute the continuation on any available ThreadPool thread, bypassing SynchronizationContext capture and improving performance.'
      ],
      codeOrQuerySnippet: {
        title: 'Thread-Safe Async Pattern (.NET C#)',
        language: 'csharp',
        code: `public async Task<MortgageDto> GetApplicationAsync(int id, CancellationToken ct = default)
{
    // ConfigureAwait(false) avoids capturing SynchronizationContext in backend services
    var app = await _dbContext.Applications
        .AsNoTracking()
        .FirstOrDefaultAsync(a => a.Id == id, ct)
        .ConfigureAwait(false);

    if (app == null) throw new NotFoundException($"Application {id} not found");

    return _mapper.Map<MortgageDto>(app);
}`
      },
      secondaryCodeSnippet: {
        title: 'ValueTask<T> vs Task<T> for Synchronous Path Optimization',
        language: 'csharp',
        code: `public class CachedRateService
{
    private readonly ConcurrentDictionary<string, decimal> _rateCache = new();

    // ValueTask<T> eliminates heap allocation when result is already available in cache
    public ValueTask<decimal> GetInterestRateAsync(string stateCode)
    {
        if (_rateCache.TryGetValue(stateCode, out decimal cachedRate))
        {
            return new ValueTask<decimal>(cachedRate); // Zero allocation!
        }

        return new ValueTask<decimal>(FetchFromDatabaseAsync(stateCode));
    }
}`
      },
      proTipOrPitfall: 'Avoid "async void" except in top-level UI event handlers. An async void method cannot be awaited, and any unhandled exception inside it will instantly terminate the process.',
      studyResources: [
        {
          title: 'Asynchronous Programming with async and await in C#',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/',
          source: 'Microsoft Learn',
          description: 'Official deep dive on C# state machine compilation, Task, and ConfigureAwait.'
        }
      ]
    }
  },
  {
    id: 'csharp-02',
    category: 'C#',
    question: '2. How does the .NET Garbage Collector (GC) handle Generations (Gen 0, 1, 2, LOH, POH), and how do you diagnose and eliminate memory leaks in high-throughput services?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'Garbage Collection', 'Memory Management', 'LOH', 'POH', 'IDisposable'],
    shortSummary: 'Covers generational mark-and-sweep, Large Object Heap (>85KB), Pinned Object Heap, and IAsyncDisposable.',
    detailedAnswer: {
      executiveSummary: 'The .NET GC uses an ephemeral generational mark-sweep-compact algorithm. Gen 0 holds newly allocated objects; objects surviving collection are promoted to Gen 1 and Gen 2. Objects >= 85,000 bytes bypass Gen 0 and are allocated on the Large Object Heap (LOH) to avoid expensive memory copying. .NET 5+ introduced the Pinned Object Heap (POH) for pinned memory buffers used in native I/O. Memory leaks in .NET typically result from lingering event handler subscriptions, static collection accumulation, and unclosed IDisposable handles.',
      keyPoints: [
        'Gen 0 & Gen 1: Ephemeral collections that freeze execution for only microseconds.',
        'Gen 2 & LOH: Full GC collections; LOH fragmentation requires periodic compaction tuning (`GCSettings.LargeObjectHeapCompactionMode`).',
        'Pinned Object Heap (POH): Prevents LOH fragmentation by allocating pinned byte buffers directly into a dedicated uncompacted heap.',
        'Diagnostics: Use `dotnet-dump`, `dotnet-gcdump`, and PerfView to analyze GC roots and memory retention graphs.'
      ],
      codeOrQuerySnippet: {
        title: 'Safe IAsyncDisposable & IDisposable Pattern in C#',
        language: 'csharp',
        code: `public class ResilientResourceHandler : IDisposable, IAsyncDisposable
{
    private SafeHandle? _unmanagedHandle = new SafeFileHandle(IntPtr.Zero, true);
    private Stream? _managedStream;
    private bool _disposed;

    public void Dispose()
    {
        Dispose(disposing: true);
        GC.SuppressFinalize(this);
    }

    public async ValueTask DisposeAsync()
    {
        await DisposeAsyncCore().ConfigureAwait(false);
        Dispose(disposing: false);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (_disposed) return;
        if (disposing)
        {
            _managedStream?.Dispose();
            _managedStream = null;
        }
        _unmanagedHandle?.Dispose();
        _unmanagedHandle = null;
        _disposed = true;
    }

    protected virtual async ValueTask DisposeAsyncCore()
    {
        if (_managedStream is IAsyncDisposable asyncDisposable)
            await asyncDisposable.DisposeAsync().ConfigureAwait(false);
        else
            _managedStream?.Dispose();
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'ArrayPool<T> to Eliminate LOH Allocations',
        language: 'csharp',
        code: `using System.Buffers;

public void ProcessLargePayload(ReadOnlySpan<byte> input)
{
    // Rent 128KB buffer from shared pool instead of allocating on LOH
    byte[] buffer = ArrayPool<byte>.Shared.Rent(131072);
    try
    {
        input.CopyTo(buffer);
        ExecuteNativeCalculation(buffer.AsSpan(0, input.Length));
    }
    finally
    {
        // Return buffer to pool so GC never has to collect it
        ArrayPool<byte>.Shared.Return(buffer, clearArray: true);
    }
}`
      },
      proTipOrPitfall: 'Use `ArrayPool<T>.Shared` or `MemoryPool<T>` for buffers larger than 85KB to prevent LOH memory fragmentation and eliminate costly Gen 2 GC pauses.',
      studyResources: [
        {
          title: 'Fundamentals of Garbage Collection in .NET',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals',
          source: 'Microsoft Learn',
          description: 'Deep architectural guide on Gen 0/1/2, LOH, and background Server GC.'
        }
      ]
    }
  },
  {
    id: 'csharp-03',
    category: 'C#',
    question: '3. What are Span<T>, ReadOnlySpan<T>, Memory<T>, and stackalloc, and how do they enable zero-allocation high-performance data processing in .NET 8/9?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'Span<T>', 'Memory<T>', 'Zero-Allocation', 'Performance', 'Ref Structs'],
    shortSummary: 'Details stack-allocated ref structs, continuous memory representation, ref fields, and async boundary passing.',
    detailedAnswer: {
      executiveSummary: 'Span<T> is a `ref struct` that represents a contiguous region of arbitrary memory (managed arrays, native heap memory, or stack memory allocated via `stackalloc`). It enables zero-allocation string slicing, buffer parsing, and serialization without allocating new objects on the heap. Because `ref struct` types reside strictly on the execution stack and cannot be boxed or placed on the heap, `Memory<T>` and `ReadOnlyMemory<T>` are used when memory views must cross asynchronous `await` boundaries or be stored in class fields.',
      keyPoints: [
        'Ref Struct Safety: Span<T> cannot be boxed, cannot be stored in class fields, cannot be captured in lambdas, and cannot cross async/await yield points.',
        'Zero-Copy Slicing: `span.Slice(start, length)` creates a lightweight pointer + length view in O(1) time without allocating memory.',
        'stackalloc: Allocates memory directly on the execution stack frame; automatically freed when the calling method exits without GC intervention.',
        'Utf8JsonReader: Built on `ReadOnlySpan<byte>` for high-throughput zero-allocation JSON deserialization.'
      ],
      codeOrQuerySnippet: {
        title: 'Zero-Allocation Fast URL/String Parser with ReadOnlySpan<char> (C#)',
        language: 'csharp',
        code: `public static bool TryParseMortgageUrn(
    ReadOnlySpan<char> urn, 
    out int loanId, 
    out ReadOnlySpan<char> stateCode)
{
    loanId = 0;
    stateCode = ReadOnlySpan<char>.Empty;

    // Expected format: "urn:mortgage:IL:948201"
    if (!urn.StartsWith("urn:mortgage:")) return false;

    ReadOnlySpan<char> payload = urn.Slice("urn:mortgage:".Length);
    int colonIndex = payload.IndexOf(':');
    if (colonIndex == -1) return false;

    stateCode = payload.Slice(0, colonIndex);
    ReadOnlySpan<char> idSpan = payload.Slice(colonIndex + 1);

    return int.TryParse(idSpan, out loanId);
}`
      },
      secondaryCodeSnippet: {
        title: 'Stackalloc Small Buffers with Safe Heap Fallback',
        language: 'csharp',
        code: `public static void EncodePayload(ReadOnlySpan<byte> input)
{
    // Use stackalloc for small buffers (<1024 bytes), fallback to ArrayPool for large data
    Span<byte> buffer = input.Length <= 1024 
        ? stackalloc byte[input.Length] 
        : new byte[input.Length];

    // Perform zero-allocation transformation
    for (int i = 0; i < input.Length; i++)
    {
        buffer[i] = (byte)(input[i] ^ 0xAA);
    }
}`
      },
      proTipOrPitfall: 'Never call `stackalloc` inside a loop without bounding the total size, as unbounded stack allocations can cause an uncatchable `StackOverflowException`.',
      studyResources: [
        {
          title: 'Memory and Span in .NET',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/',
          source: 'Microsoft Learn',
          description: 'Official guide to Span<T>, Memory<T>, and high-performance memory operations.'
        }
      ]
    }
  },
  {
    id: 'csharp-04',
    category: 'C#',
    question: '4. How do Primary Constructors, Collection Expressions, Pattern Matching, and Record Types in C# 12 & C# 13 improve domain-driven design and code immutability?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'C# 12', 'Records', 'Pattern Matching', 'Immutability', 'Domain-Driven Design'],
    shortSummary: 'Covers record class/struct value equality, non-destructive mutation (`with`), list patterns, and primary constructor scoping.',
    detailedAnswer: {
      executiveSummary: 'Modern C# (10 through 13) emphasizes immutability, brevity, and type safety. `record` types provide synthesized value-based equality, `IEquatable<T>`, hash codes, and non-destructive mutation via the `with` expression. Primary Constructors streamline dependency injection and immutable property initialization. Collection expressions `[..listA, itemB, ..listC]` provide unified zero-overhead syntax for arrays, spans, and immutable collections. Relational, positional, and list pattern matching simplify complex business rule evaluations.',
      keyPoints: [
        'Records vs Classes: Records synthesize value equality operators (== and !=), GetHashCode(), and ToString() based on properties rather than reference identity.',
        'Non-Destructive Mutation: `var updated = original with { Status = LoanStatus.Approved };` creates a modified copy while keeping the original immutable.',
        'Collection Expressions (`[1, 2, ..extras]`): Compiler automatically emits the most optimal allocation strategy (e.g. stackalloc or direct array span).',
        'List Patterns & Slice Patterns: Matches on array structures (e.g. `case [var first, .., var last]:`).'
      ],
      codeOrQuerySnippet: {
        title: 'Modern C# 12 Clean Domain Model with Records and Pattern Matching',
        language: 'csharp',
        code: `// Primary Constructor on Record Class
public record LoanApplication(
    Guid ApplicationId,
    decimal Amount,
    int CreditScore,
    decimal DebtToIncomeRatio,
    LoanType Type)
{
    // Property with init-only setter
    public DateTime SubmittedAtUtc { get; init; } = DateTime.UtcNow;
}

public static class UnderwritingEngine
{
    // Advanced C# 12 Pattern Matching Expression
    public static UnderwritingDecision Evaluate(LoanApplication app) => app switch
    {
        // Relational and logical patterns
        { CreditScore: >= 740, DebtToIncomeRatio: <= 0.36m } => 
            UnderwritingDecision.InstantApproval(app.Amount),
            
        { CreditScore: >= 680 and < 740, DebtToIncomeRatio: <= 0.43m, Type: LoanType.FHA } => 
            UnderwritingDecision.ManualReviewRequired("Eligible for FHA streamlined review"),
            
        { CreditScore: < 620 } or { DebtToIncomeRatio: > 0.50m } => 
            UnderwritingDecision.Declined("Credit score below threshold or excessive DTI"),
            
        _ => UnderwritingDecision.ManualReviewRequired("Standard secondary underwriting")
    };
}`
      },
      secondaryCodeSnippet: {
        title: 'Collection Expressions & Spread Operator in C# 12',
        language: 'csharp',
        code: `// Unified collection expressions across Array, List<T>, and ReadOnlySpan<T>
int[] standardRates = [5, 6, 7];
int[] premiumRates = [8, 9];

// Spread operator combines collections cleanly
ReadOnlySpan<int> allRates = [..standardRates, 10, ..premiumRates];`
      },
      proTipOrPitfall: 'In record classes, primary constructor parameters create public init-only properties automatically (`public record Person(string Name)`), but in standard classes (`public class Person(string Name)`), the parameter is a captured field and does NOT create a public property unless explicitly defined.',
      studyResources: [
        {
          title: 'What is new in C# 12',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-12',
          source: 'Microsoft Learn',
          description: 'Official feature guide for primary constructors, collection expressions, and ref struct enhancements.'
        }
      ]
    }
  },
  {
    id: 'csharp-05',
    category: 'C#',
    question: '5. How do System.Threading.Channels and System.Threading.RateLimiting enable high-throughput producer-consumer architectures and API throttling in ASP.NET Core?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'Channels', 'Concurrency', 'Rate Limiting', 'Producer-Consumer', 'ASP.NET Core'],
    shortSummary: 'Covers BoundedChannelOptions backpressure, lock-free queues, and token bucket rate limiters in .NET 8.',
    detailedAnswer: {
      executiveSummary: '`System.Threading.Channels` provides lightweight, lock-free, async-compatible bounded and unbounded queues for in-memory producer-consumer pipelines. Bounded channels enforce backpressure when consumer threads fall behind, preventing OutOfMemoryException by pausing producers asynchronously. `System.Threading.RateLimiting` in .NET 8 provides built-in HTTP request throttling algorithms (Fixed Window, Sliding Window, Token Bucket, and Concurrency Limiters) partitioned by user identity or IP address.',
      keyPoints: [
        'Bounded Channels: Configured with `BoundedChannelFullMode.Wait` to naturally throttle high-speed incoming ingestion.',
        'Lock-Free Async Consumption: Consumed via `await foreach (var item in channel.Reader.ReadAllAsync(cancellationToken))`.',
        'Token Bucket Limiter: Allows burst API traffic while refilling tokens at a fixed interval; ideal for rate-limiting public REST endpoints.',
        'Partitioned Rate Limiter: Dynamically isolates limits per authenticated Tenant or User ID, preventing a single client from starving the cluster.'
      ],
      codeOrQuerySnippet: {
        title: 'Bounded Channel In-Memory Event Ingestion Pipeline (C# .NET 8)',
        language: 'csharp',
        code: `using System.Threading.Channels;

public class LoanEventIngestionPipeline
{
    private readonly Channel<LoanEvent> _channel;

    public LoanEventIngestionPipeline()
    {
        // Enforce max capacity of 5,000 items with Wait backpressure
        _channel = Channel.CreateBounded<LoanEvent>(new BoundedChannelOptions(5000)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = true,
            SingleWriter = false
        });
    }

    public async ValueTask PublishEventAsync(LoanEvent evt, CancellationToken ct = default)
    {
        // Asynchronously pauses producer if queue is full
        await _channel.Writer.WriteAsync(evt, ct);
    }

    public async Task StartBackgroundProcessorAsync(CancellationToken ct)
    {
        // Async stream reads continuously as items arrive
        await foreach (var evt in _channel.Reader.ReadAllAsync(ct))
        {
            await ProcessLoanEventAsync(evt, ct);
        }
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'Configuring Token Bucket Rate Limiter in ASP.NET Core Program.cs',
        language: 'csharp',
        code: `builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("MortgageApiRateLimit", context =>
        RateLimitPartition.GetTokenBucketLimiter(
            partitionKey: context.User.Identity?.Name ?? context.Connection.RemoteIpAddress?.ToString() ?? "anon",
            factory: _ => new TokenBucketRateLimiterOptions
            {
                TokenLimit = 100, // Maximum burst capacity
                QueueLimit = 20,  // Max queued requests
                ReplenishmentPeriod = TimeSpan.FromSeconds(10),
                TokensPerPeriod = 20
            }));
});`
      },
      proTipOrPitfall: 'Always set `SingleReader = true` on `ChannelOptions` if you have a single background worker consumer loop—this enables dedicated internal lock-free fast paths inside .NET.',
      studyResources: [
        {
          title: 'An Introduction to System.Threading.Channels',
          url: 'https://devblogs.microsoft.com/dotnet/an-introduction-to-system-threading-channels/',
          source: 'Microsoft .NET Blog',
          description: 'Comprehensive guide by Stephen Toub on Channels architecture and lock-free concurrency.'
        }
      ]
    }
  },
  {
    id: 'csharp-06',
    category: 'C#',
    question: '6. How do Roslyn Source Generators and Native AOT (Ahead-of-Time Compilation) work in .NET 8/9, and why are they replacing runtime Reflection?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'Source Generators', 'Native AOT', 'Roslyn', 'Reflection', 'Performance'],
    shortSummary: 'Explains compile-time code generation, trimming, instant startup time, zero JIT compilation overhead, and reflection elimination.',
    detailedAnswer: {
      executiveSummary: 'Runtime reflection (`Type.GetType()`, `MethodInfo.Invoke()`) incurs significant performance overhead, prevents compiler tree-shaking (trimming), and creates runtime errors if members are renamed. Roslyn Source Generators run as an analyzer phase during compilation, inspecting C# Syntax Trees and injecting generated C# source code directly into the compilation pipeline. In .NET 8/9, Native AOT compiles C# directly into architecture-specific machine code without a JIT compiler, resulting in sub-10ms startup times, 80% lower memory footprints, and standalone binaries that do not require the .NET runtime installed.',
      keyPoints: [
        'Source Generator Phase: `IIncrementalGenerator` receives syntax changes and generates code at compile time (e.g. `[JsonSerializable]`, `[GeneratedRegex]`).',
        'Native AOT: Eliminates the JIT (Just-In-Time) compiler; requires 100% trim-compatible code with zero dynamic code generation (no `Reflection.Emit`).',
        'GeneratedRegex: Replaces runtime regex parsing with dedicated hardcoded state machines generated at compile time, improving regex execution speed by up to 5x.',
        'System.Text.Json Source Generation: Precomputes serialization metadata at build time for instant zero-reflection JSON handling.'
      ],
      codeOrQuerySnippet: {
        title: 'System.Text.Json Source Generator Context for Native AOT (C#)',
        language: 'csharp',
        code: `// Define Source Generator Context for Native AOT JSON Serialization
[JsonSourceGenerationOptions(
    WriteIndented = false, 
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    GenerationMode = JsonSourceGenerationMode.Default)]
[JsonSerializable(typeof(LoanApplicationDto))]
[JsonSerializable(typeof(List<LoanApplicationDto>))]
public partial class LoanJsonSerializerContext : JsonSerializerContext
{
}

// Usage in Minimal API with Zero Runtime Reflection
app.MapGet("/api/loans/{id}", async (int id, ILoanService svc) =>
{
    var loan = await svc.GetLoanAsync(id);
    return Results.Ok(loan, LoanJsonSerializerContext.Default.LoanApplicationDto);
});`
      },
      secondaryCodeSnippet: {
        title: 'Compile-Time Regex Source Generator ([GeneratedRegex])',
        language: 'csharp',
        code: `public static partial class ValidationUtilities
{
    // The Roslyn compiler generates an optimized static matcher method at compile time
    [GeneratedRegex(@"^\\d{3}-\\d{2}-\\d{4}$", RegexOptions.Compiled | RegexOptions.IgnoreCase)]
    public static partial Regex SsnRegex();

    public static bool IsValidSsn(string ssn) => SsnRegex().IsMatch(ssn);
}`
      },
      proTipOrPitfall: 'When targeting Native AOT for microservices, avoid libraries that rely on dynamic proxy generation (such as older AutoMapper or dynamic dependency injection interceptors). Always use source-generated alternatives.',
      studyResources: [
        {
          title: 'Native AOT deployment in .NET',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/deploying/native-aot/',
          source: 'Microsoft Learn',
          description: 'Official guide on Native AOT compilation, trimming warnings, and performance optimization.'
        }
      ]
    }
  },
  {
    id: 'csharp-07',
    category: 'C#',
    question: '7. How do .NET 8 Resilience Pipelines (Polly v8 integration) implement Retry, Circuit Breaker, Hedging, and Fallbacks with zero allocation?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', '.NET 8', 'Resilience', 'Polly v8', 'Circuit Breaker', 'Microservices'],
    shortSummary: 'Explains Microsoft.Extensions.Resilience, composite resilience pipelines, hedging, and proactive fault tolerance.',
    detailedAnswer: {
      executiveSummary: 'In .NET 8, Microsoft integrated Polly directly into the core runtime as `Microsoft.Extensions.Resilience`. Unlike legacy Polly v7 (which allocated delegates on every execution), Polly v8 uses struct-based `ResiliencePipeline` instances configured via builder patterns. Standard pipelines combine four key strategies: 1) Rate Limiter (sheds load when capacity is exceeded), 2) Retry (exponential backoff with jitter), 3) Circuit Breaker (opens when failure rate exceeds threshold, failing fast without hitting broken dependencies), and 4) Hedging (executes speculative parallel requests if the primary request exceeds latency thresholds).',
      keyPoints: [
        'Composite Pipeline: Configures multiple resilience strategies into a single optimized execution wrapper.',
        'Circuit Breaker State: Closed (Normal) -> Open (Fails fast after 50% errors over 10s) -> Half-Open (Tests single probe request).',
        'Hedging Strategy: If dependent service takes >500ms, immediately spawns a parallel duplicate request and takes whichever finishes first.',
        'HttpClient Integration: `builder.Services.AddHttpClient(...).AddStandardResilienceHandler();` configures production defaults in one line.'
      ],
      codeOrQuerySnippet: {
        title: 'Building a Custom Resilience Pipeline with Polly v8 (C# .NET 8)',
        language: 'csharp',
        code: `using Polly;
using Polly.CircuitBreaker;
using Polly.Retry;

public class CreditScoreServiceClient
{
    private readonly ResiliencePipeline _pipeline;

    public CreditScoreServiceClient()
    {
        _pipeline = new ResiliencePipelineBuilder()
            // 1. Timeout Strategy
            .AddTimeout(TimeSpan.FromSeconds(3))
            // 2. Exponential Retry with Jitter
            .AddRetry(new RetryStrategyOptions
            {
                MaxRetryAttempts = 3,
                Delay = TimeSpan.FromMilliseconds(200),
                BackoffType = DelayBackoffType.Exponential,
                UseJitter = true
            })
            // 3. Circuit Breaker Strategy
            .AddCircuitBreaker(new CircuitBreakerStrategyOptions
            {
                FailureRatio = 0.5, // 50% failure rate triggers open circuit
                SamplingDuration = TimeSpan.FromSeconds(10),
                MinimumThroughput = 8,
                BreakDuration = TimeSpan.FromSeconds(30)
            })
            .Build();
    }

    public async Task<int> FetchCreditScoreAsync(string borrowerSsn, CancellationToken ct)
    {
        return await _pipeline.ExecuteAsync(async token =>
        {
            return await CallCreditBureauApiAsync(borrowerSsn, token);
        }, ct);
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'Registering Standard HTTP Resilience Handler in Program.cs',
        language: 'csharp',
        code: `// Automatically adds Timeout, Retry, Circuit Breaker, and Rate Limiter to HttpClient
builder.Services.AddHttpClient<ICreditBureauClient, CreditBureauClient>(client =>
{
    client.BaseAddress = new Uri("https://api.creditbureau.example.com/");
})
.AddStandardResilienceHandler(options =>
{
    options.Retry.MaxRetryAttempts = 3;
    options.CircuitBreaker.SamplingDuration = TimeSpan.FromSeconds(15);
});`
      },
      proTipOrPitfall: 'Always enable Jitter on retry policies (`UseJitter = true`). Without jitter, if a downstream dependency restarts, thousands of clients will retry at the exact same millisecond intervals, causing a "thundering herd" DDoS self-inflicted outage.',
      studyResources: [
        {
          title: 'Building resilient HTTP apps: Key development patterns in .NET 8',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience',
          source: 'Microsoft Learn',
          description: 'Official guide on Polly v8 integration, resilience pipelines, and standard handlers.'
        }
      ]
    }
  },
  {
    id: 'csharp-08',
    category: 'C#',
    question: '8. How does Entity Framework Core 8/9 optimize queries under the hood (Compiled Queries, Split Queries, AsNoTrackingWithIdentityResolution, ChangeTracker batching)?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'EF Core', 'Entity Framework', 'Database', 'Performance', 'LINQ'],
    shortSummary: 'Explains query compilation caching, Cartesian explosion mitigation, identity resolution, and SQL batching.',
    detailedAnswer: {
      executiveSummary: 'EF Core converts LINQ expression trees into SQL queries via its Query Compilation Pipeline. While standard LINQ queries cache their expression compilation trees, high-frequency read endpoints benefit from `EF.CompileAsyncQuery()`, which eliminates LINQ-to-SQL translation overhead completely. For queries loading multiple one-to-many child collections, `AsSplitQuery()` prevents Cartesian Product explosion by executing independent SQL SELECT queries instead of massive multi-JOIN tables. `AsNoTrackingWithIdentityResolution()` ensures fast read-only queries while maintaining a local graph map so duplicate entity references point to the same memory instance.',
      keyPoints: [
        'Compiled Queries: Precompiles the LINQ AST into an executable delegate, providing 20-30% faster execution on high-throughput microservices.',
        'Split Queries (`AsSplitQuery`): Replaces single SQL queries with multiple JOINs (which duplicate parent columns across millions of child rows) with separate queries keyed by parent ID.',
        'ChangeTracker Batching: EF Core 7/8/9 automatically batches multiple INSERT/UPDATE/DELETE statements into a single SQL command payload, slashing network round-trips.',
        'Raw SQL Composable Queries: `context.Database.SqlQuery<T>($"...")` allows executing arbitrary SQL strings and composing LINQ filters on top.'
      ],
      codeOrQuerySnippet: {
        title: 'High-Performance Compiled Query & Split Query in EF Core 8 (C#)',
        language: 'csharp',
        code: `public class MortgageRepository
{
    private readonly MortgageDbContext _db;

    // Static compiled query cached across application lifetime
    private static readonly Func<MortgageDbContext, int, CancellationToken, Task<MortgageApplication?>> GetAppCompiled =
        EF.CompileAsyncQuery((MortgageDbContext ctx, int id, CancellationToken ct) =>
            ctx.Applications
                .AsNoTracking()
                .Include(a => a.Borrowers)
                .Include(a => a.AuditLogs)
                .AsSplitQuery() // Executes separate queries to avoid Cartesian explosion
                .FirstOrDefault(a => a.Id == id));

    public Task<MortgageApplication?> GetApplicationAsync(int id, CancellationToken ct) =>
        GetAppCompiled(_db, id, ct);
}`
      },
      secondaryCodeSnippet: {
        title: 'Bulk Updates without Loading Entities into Memory (ExecuteUpdateAsync)',
        language: 'csharp',
        code: `// Executes direct UPDATE SQL on the database server without fetching rows into memory
await _db.Applications
    .Where(a => a.Status == LoanStatus.Pending && a.CreatedAtUtc < DateTime.UtcNow.AddDays(-90))
    .ExecuteUpdateAsync(setter => setter
        .SetProperty(a => a.Status, LoanStatus.Archived)
        .SetProperty(a => a.UpdatedAtUtc, DateTime.UtcNow));`
      },
      proTipOrPitfall: 'Use `ExecuteUpdateAsync` and `ExecuteDeleteAsync` for batch updates. Never load 10,000 entities into memory just to modify one status column and call `SaveChangesAsync()`—that creates massive memory bloat and thousands of individual SQL statements.',
      studyResources: [
        {
          title: 'Efficient Querying in Entity Framework Core',
          url: 'https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying',
          source: 'Microsoft Learn',
          description: 'Official best practices for compiled queries, split queries, and change tracking.'
        }
      ]
    }
  },
  {
    id: 'csharp-09',
    category: 'C#',
    question: '9. How does the new System.Threading.Lock object in C# 13 improve thread synchronization over legacy object monitor locks?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'C# 13', 'Lock', 'Threading', 'Concurrency', 'Performance'],
    shortSummary: 'Explains the dedicated Lock class, Lock.Scope ref struct, Monitor overhead reduction, and async restrictions.',
    detailedAnswer: {
      executiveSummary: 'Prior to C# 13, the `lock(obj)` statement relied on `Monitor.Enter(object)` and `Monitor.Exit(object)`, which required allocating a generic object on the heap and inspecting its Object Header sync block index. In C# 13/.NET 9, Microsoft introduced `System.Threading.Lock`. When the compiler encounters `lock(lockObj)` targeting a `System.Threading.Lock` instance, it translates the block into `lockObj.EnterScope()`, returning a stack-allocated `ref struct Scope` that enters and exits native lightweight OS synchronization primitives with substantially lower contention overhead.',
      keyPoints: [
        'Dedicated Lock Type: `System.Threading.Lock` replaces arbitrary `object _gate = new();` locks.',
        'EnterScope Ref Struct: Disposed automatically via compiler-emitted try/finally pattern.',
        'Lower Contention Overhead: Bypasses the CLR sync block table by executing CPU-level spin-wait primitives.',
        'No Async/Await Inside Lock: Locks cannot span `await` yield points; use `SemaphoreSlim` for asynchronous mutual exclusion.'
      ],
      codeOrQuerySnippet: {
        title: 'Modern C# 13 System.Threading.Lock Implementation',
        language: 'csharp',
        code: `public class BankAccountLedger
{
    // In C# 13, use dedicated System.Threading.Lock instead of new object()
    private readonly System.Threading.Lock _lock = new();
    private decimal _balance;

    public void Deposit(decimal amount)
    {
        // Compiler emits _lock.EnterScope() with zero heap allocation
        lock (_lock)
        {
            _balance += amount;
        }
    }

    public decimal GetBalance()
    {
        using (_lock.EnterScope())
        {
            return _balance;
        }
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'Asynchronous Synchronization with SemaphoreSlim',
        language: 'csharp',
        code: `public class AsyncResourceManager
{
    private readonly SemaphoreSlim _gate = new(1, 1);

    public async Task<string> FetchExclusiveAsync(string key, CancellationToken ct)
    {
        await _gate.WaitAsync(ct).ConfigureAwait(false);
        try
        {
            return await CallExternalResourceAsync(key, ct).ConfigureAwait(false);
        }
        finally
        {
            _gate.Release();
        }
    }
}`
      },
      proTipOrPitfall: 'Never lock on `typeof(MyClass)` or public string literals—these are interned process-wide and can cause cross-library deadlocks.',
      studyResources: [
        {
          title: 'System.Threading.Lock Class (.NET 9)',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.threading.lock',
          source: 'Microsoft Learn',
          description: 'Official API documentation for C# 13 System.Threading.Lock.'
        }
      ]
    }
  },
  {
    id: 'csharp-10',
    category: 'C#',
    question: '10. How do SIMD (Single Instruction Multiple Data) and Hardware Intrinsics (Vector128 / Vector256 / Vector512) accelerate calculations in .NET 8/9?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'SIMD', 'Vectorization', 'Hardware Intrinsics', 'AVX-512', 'Performance'],
    shortSummary: 'Explains hardware acceleration, AVX2 / AVX-512 vector registers, and parallel math across Spans.',
    detailedAnswer: {
      executiveSummary: 'Hardware Intrinsics in `System.Runtime.Intrinsics` and `System.Numerics.Vector<T>` allow C# code to map directly to CPU vector instruction sets (SSE, AVX2, AVX-512, and ARM AdvSIMD). Instead of calculating values sequentially one number at a time, a 256-bit register executes math operations across 8 floating-point numbers or 4 doubles simultaneously in a single CPU clock cycle, achieving 4x to 8x throughput increases in mortgage amortizations, risk modeling, and vector search.',
      keyPoints: [
        'Vector256<T>: Operates on 256-bit CPU registers (e.g. 8x 32-bit floats simultaneously).',
        'Vector512<T>: Supported in .NET 8+ on modern Intel/AMD processors with AVX-512.',
        'Hardware Capability Check: Always guard with `Vector256.IsHardwareAccelerated` with scalar fallback.',
        'Zero Allocation: Intrinsic vectors reside entirely within CPU hardware registers.'
      ],
      codeOrQuerySnippet: {
        title: 'SIMD-Accelerated Array Dot Product with Vector256<float> (C#)',
        language: 'csharp',
        code: `using System.Runtime.Intrinsics;
using System.Runtime.Intrinsics.X86;

public static class FastMath
{
    public static float DotProduct(ReadOnlySpan<float> a, ReadOnlySpan<float> b)
    {
        if (a.Length != b.Length) throw new ArgumentException("Length mismatch");

        int i = 0;
        int vectorSize = Vector256<float>.Count; // 8 floats per vector
        Vector256<float> sumVector = Vector256<float>.Zero;

        // Process 8 elements per CPU clock cycle
        if (Vector256.IsHardwareAccelerated && a.Length >= vectorSize)
        {
            int limit = a.Length - vectorSize;
            while (i <= limit)
            {
                var vA = Vector256.LoadUnsafe(ref a[i]);
                var vB = Vector256.LoadUnsafe(ref b[i]);
                sumVector += vA * vB;
                i += vectorSize;
            }
        }

        // Horizontal sum across vector lanes
        float total = Vector256.Sum(sumVector);

        // Process remaining tail elements with scalar loop
        for (; i < a.Length; i++)
        {
            total += a[i] * b[i];
        }

        return total;
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'TensorPrimitives in .NET 8 for AI & Cosine Similarity',
        language: 'csharp',
        code: `using System.Numerics.Tensors;

// In .NET 8, TensorPrimitives automatically utilizes AVX-512 / AVX2 SIMD under the hood
public static float ComputeCosineSimilarity(ReadOnlySpan<float> embeddingA, ReadOnlySpan<float> embeddingB)
{
    return TensorPrimitives.CosineSimilarity(embeddingA, embeddingB);
}`
      },
      proTipOrPitfall: 'Always handle the leftover tail elements with a scalar loop after processing vector chunks of length `Vector256<T>.Count`.',
      studyResources: [
        {
          title: 'Hardware Intrinsics in .NET',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/simd',
          source: 'Microsoft Learn',
          description: 'Comprehensive guide to SIMD and Vector types in .NET.'
        }
      ]
    }
  },
  {
    id: 'csharp-11',
    category: 'C#',
    question: '11. How do FrozenSet<T> and FrozenDictionary<TKey, TValue> in .NET 8 achieve sub-nanosecond read lookups compared to ConcurrentDictionary or standard Dictionary?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', '.NET 8', 'FrozenDictionary', 'Performance', 'Collections', 'Memory'],
    shortSummary: 'Explains immutable frozen layout, precomputed perfect hash tables, and zero-thread-contention lookups.',
    detailedAnswer: {
      executiveSummary: 'In .NET 8, `System.Collections.Frozen` introduces `FrozenDictionary<TKey, TValue>` and `FrozenSet<T>`. When created via `.ToFrozenDictionary()`, the runtime analyzes the full key set at initialization time, select-computes an optimal minimal perfect hashing algorithm or lookup branch table, and fixes the memory layout permanently. While construction is slower, subsequent read operations are 30% to 50% faster than standard `Dictionary` and completely thread-safe without locks.',
      keyPoints: [
        'Optimized Hash Strategy: The frozen factory selects the best algorithm (e.g. perfect hash table, linear scan for <10 items, or hash bucket table).',
        'Thread-Safety: 100% immutable and lock-free across all concurrent reader threads.',
        'Use Case: Configuration tables, routing tables, state codes, interest rate tiers, and lookup tables initialized on app startup.',
        'Zero Allocation on Reads: Eliminates dictionary resize checks and bucket conflict locking.'
      ],
      codeOrQuerySnippet: {
        title: 'High-Throughput FrozenDictionary Lookup Service (C# .NET 8)',
        language: 'csharp',
        code: `using System.Collections.Frozen;

public class MortgageRateProvider
{
    private readonly FrozenDictionary<string, decimal> _stateBaseRates;

    public MortgageRateProvider(IDictionary<string, decimal> rawRates)
    {
        // Precomputes perfect hash table at startup
        _stateBaseRates = rawRates.ToFrozenDictionary(StringComparer.OrdinalIgnoreCase);
    }

    public decimal GetBaseRate(string stateCode)
    {
        // Sub-nanosecond lookup time with zero locking overhead
        return _stateBaseRates.TryGetValue(stateCode, out decimal rate) ? rate : 0.065m;
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'FrozenSet for Fast Authorization Permission Checking',
        language: 'csharp',
        code: `public class PermissionValidator
{
    private static readonly FrozenSet<string> ValidScopes = new[]
    {
        "loans:read", "loans:write", "underwrite:approve", "underwrite:audit"
    }.ToFrozenSet(StringComparer.Ordinal);

    public static bool HasPermission(string scope) => ValidScopes.Contains(scope);
}`
      },
      proTipOrPitfall: 'Never create a FrozenDictionary on every request—it is designed for static or long-lived data loaded once at startup and queried millions of times.',
      studyResources: [
        {
          title: 'System.Collections.Frozen Namespace in .NET 8',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.collections.frozen',
          source: 'Microsoft Learn',
          description: 'Official API documentation on Frozen collections in .NET.'
        }
      ]
    }
  },
  {
    id: 'csharp-12',
    category: 'C#',
    question: '12. How do you stream massive datasets with IAsyncEnumerable<T> and CancellationToken in ASP.NET Core, gRPC, and Server-Sent Events (SSE)?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'IAsyncEnumerable', 'Streaming', 'ASP.NET Core', 'gRPC', 'SSE'],
    shortSummary: 'Explains async iterators (yield return), HTTP streaming chunking, [EnumeratorCancellation], and memory preservation.',
    detailedAnswer: {
      executiveSummary: '`IAsyncEnumerable<T>` enables asynchronous pull-based streaming of data items one at a time. Instead of querying 500,000 database records, buffering them in server RAM, and serializing a 500MB JSON payload (which causes high GC pressure), `yield return` streams each record directly to the HTTP response stream as NDJSON or SSE chunks, keeping server memory footprint under a few kilobytes.',
      keyPoints: [
        'Asynchronous Yield: `yield return await item` pauses execution without blocking until consumer calls `MoveNextAsync()`.',
        'EnumeratorCancellation: Attribute `[EnumeratorCancellation]` binds the caller CancellationToken to the generator method.',
        'HTTP Chunked Transfer: ASP.NET Core streams items immediately to the client without buffering.',
        'DB Integration: EF Core `ctx.Applications.AsAsyncEnumerable()` streams directly from database cursor.'
      ],
      codeOrQuerySnippet: {
        title: 'Streaming 100K Records with IAsyncEnumerable in ASP.NET Core Minimal API',
        language: 'csharp',
        code: `using System.Runtime.CompilerServices;

app.MapGet("/api/loans/stream", async IAsyncEnumerable<LoanRecordDto> (
    MortgageDbContext db,
    [EnumeratorCancellation] CancellationToken ct) =>
{
    // Streams directly from SQL Server cursor without buffering into server RAM
    await foreach (var loan in db.Loans.AsNoTracking().AsAsyncEnumerable().WithCancellation(ct))
    {
        yield return new LoanRecordDto(loan.Id, loan.Amount, loan.Status);
    }
});`
      },
      secondaryCodeSnippet: {
        title: 'Consuming Async Stream on the Client with await foreach',
        language: 'csharp',
        code: `public async Task ProcessMortgageStreamAsync(IAsyncEnumerable<LoanRecordDto> stream, CancellationToken ct)
{
    await foreach (var loan in stream.WithCancellation(ct))
    {
        await ProcessSingleLoanAsync(loan, ct).ConfigureAwait(false);
    }
}`
      },
      proTipOrPitfall: 'Always decorate the `CancellationToken` parameter with `[EnumeratorCancellation]` on methods returning `IAsyncEnumerable<T>`. Without it, passing a cancellation token to `.WithCancellation(ct)` will fail to trigger cancellation in the generator method.',
      studyResources: [
        {
          title: 'Iterate with Async Streams in C#',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/generate-consume-asynchronous-stream',
          source: 'Microsoft Learn',
          description: 'Official guide on IAsyncEnumerable and async iterators.'
        }
      ]
    }
  },
  {
    id: 'csharp-13',
    category: 'C#',
    question: '13. How does TimeProvider in .NET 8 replace DateTime.UtcNow and enable deterministic unit testing for timeouts, delays, and timers?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', '.NET 8', 'TimeProvider', 'Unit Testing', 'Time', 'Architecture'],
    shortSummary: 'Explains TimeProvider abstraction, Microsoft.Extensions.TimeProvider.Testing, FakeTimeProvider, and instant time travel testing.',
    detailedAnswer: {
      executiveSummary: 'Directly calling `DateTime.UtcNow`, `Task.Delay()`, or `Thread.Sleep()` in enterprise services creates untestable code with flaky, slow unit tests. In .NET 8, Microsoft introduced the abstract `TimeProvider` class. By injecting `TimeProvider` into services, production code uses `TimeProvider.System`, while unit tests inject `FakeTimeProvider` from `Microsoft.Extensions.TimeProvider.Testing` to advance simulated time instantly without waiting for real wall-clock delays.',
      keyPoints: [
        'TimeProvider.System: Production implementation that queries real OS high-resolution timers.',
        'FakeTimeProvider: Test implementation enabling instant time travel via `fakeTime.Advance(TimeSpan.FromMinutes(30))` without physical thread waiting.',
        'Timer & Timeout Support: `timeProvider.CreateTimer()` creates virtual timers that fire deterministically in test suites.',
        'Thread-Safe Timestamps: `timeProvider.GetTimestamp()` provides nanosecond-precision stopwatch ticks.'
      ],
      codeOrQuerySnippet: {
        title: 'Service Utilizing TimeProvider for Expiration Logic (.NET 8)',
        language: 'csharp',
        code: `public class RateLockService
{
    private readonly TimeProvider _timeProvider;
    private readonly TimeSpan _lockDuration = TimeSpan.FromDays(30);

    public RateLockService(TimeProvider timeProvider)
    {
        _timeProvider = timeProvider;
    }

    public RateLock CreateLock(decimal rate) => new RateLock
    {
        Rate = rate,
        LockedAt = _timeProvider.GetUtcNow(),
        ExpiresAt = _timeProvider.GetUtcNow().Add(_lockDuration)
    };

    public bool IsLockValid(RateLock rateLock) =>
        _timeProvider.GetUtcNow() < rateLock.ExpiresAt;
}`
      },
      secondaryCodeSnippet: {
        title: 'Deterministic Unit Test with FakeTimeProvider (xUnit / C#)',
        language: 'csharp',
        code: `[Fact]
public void RateLock_Expires_After_30_Days()
{
    var fakeTime = new Microsoft.Extensions.TimeProvider.Testing.FakeTimeProvider();
    fakeTime.SetUtcNow(new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero));

    var service = new RateLockService(fakeTime);
    var rateLock = service.CreateLock(0.0625m);

    Assert.True(service.IsLockValid(rateLock));

    // Advance virtual clock by 31 days instantaneously (0 milliseconds real time!)
    fakeTime.Advance(TimeSpan.FromDays(31));

    Assert.False(service.IsLockValid(rateLock));
}`
      },
      proTipOrPitfall: 'Never use `Task.Delay(5000)` in unit tests to test timeouts. Inject `TimeProvider` and call `fakeTime.Advance(TimeSpan.FromSeconds(5))` for instantaneous, flake-free test runs.',
      studyResources: [
        {
          title: 'TimeProvider Class (.NET 8)',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.timeprovider',
          source: 'Microsoft Learn',
          description: 'Official API documentation for TimeProvider.'
        }
      ]
    }
  },
  {
    id: 'csharp-14',
    category: 'C#',
    question: '14. What are MemoryMarshal, Unsafe.As, and Unmanaged Memory Pointers, and when are they justified in high-frequency trading or network pipelines?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'MemoryMarshal', 'Unsafe', 'Pointers', 'High Performance', 'Bit Casting'],
    shortSummary: 'Explains zero-copy struct casting, byte reinterpretation, Unsafe.AsPointer, and memory layout safety.',
    detailedAnswer: {
      executiveSummary: '`MemoryMarshal` and `System.Runtime.CompilerServices.Unsafe` provide low-level mechanisms to bypass CLR type safety and bounds checks in ultra-high-throughput code. `MemoryMarshal.Cast<TFrom, TTo>()` casts a `Span<byte>` directly into a `Span<MyHeaderStruct>` in O(1) without memory copies. `Unsafe.As<TFrom, TTo>(ref from)` reinterprets reference pointers directly in CPU registers, enabling zero-overhead serialization and binary network packet parsing.',
      keyPoints: [
        'Zero-Copy Cast: `MemoryMarshal.Cast<byte, LoanPacketHeader>(span)` converts raw byte stream directly into a typed struct slice.',
        'Unsafe.As: Reinterprets reference types or structs without type checks or boxing.',
        'Struct Layout Requirement: Requires `[StructLayout(LayoutKind.Sequential)]` or `[StructLayout(LayoutKind.Explicit)]`.',
        'Safety: Misaligned reads or struct size mismatches can corrupt memory and cause hard process crashes.'
      ],
      codeOrQuerySnippet: {
        title: 'Zero-Copy Network Packet Parsing with MemoryMarshal (C#)',
        language: 'csharp',
        code: `using System.Runtime.InteropServices;

[StructLayout(LayoutKind.Sequential, Pack = 1)]
public readonly struct TradeMessageHeader
{
    public readonly uint MessageId;
    public readonly ulong TimestampUtcTicks;
    public readonly decimal Price;
    public readonly int Quantity;
}

public static class FastPacketParser
{
    public static TradeMessageHeader ParsePacket(ReadOnlySpan<byte> packetBytes)
    {
        // Casts byte span directly into struct without allocating heap memory or copying bytes
        ReadOnlySpan<TradeMessageHeader> headerSpan = MemoryMarshal.Cast<byte, TradeMessageHeader>(packetBytes);
        if (headerSpan.IsEmpty) throw new InvalidDataException("Invalid packet length");

        return headerSpan[0];
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'Direct Pointer Pinning with fixed Keyword',
        language: 'csharp',
        code: `public static unsafe void FastZeroMemory(byte[] data)
{
    fixed (byte* p = data)
    {
        // Unmanaged memset directly to CPU cache line
        NativeMemory.Clear(p, (nuint)data.Length);
    }
}`
      },
      proTipOrPitfall: 'Always verify `span.Length >= Unsafe.SizeOf<T>()` before casting with `MemoryMarshal.Cast`. An undersized span results in an empty returned span or memory corruption.',
      studyResources: [
        {
          title: 'MemoryMarshal Class (.NET)',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.memorymarshal',
          source: 'Microsoft Learn',
          description: 'Official API documentation for MemoryMarshal and unsafe memory transformations.'
        }
      ]
    }
  },
  {
    id: 'csharp-15',
    category: 'C#',
    question: '15. How do AsyncLocal<T> and ExecutionContext work under the hood, and how do they differ from ThreadLocal<T> in asynchronous architectures?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'AsyncLocal', 'ThreadLocal', 'ExecutionContext', 'Distributed Tracing', 'Correlation'],
    shortSummary: 'Explains async context propagation, ThreadPool thread handoffs, correlation IDs, and ambient state.',
    detailedAnswer: {
      executiveSummary: '`ThreadLocal<T>` stores data unique to the current operating system thread. Because `await` continuations frequently resume on different ThreadPool worker threads, data stored in a `ThreadLocal<T>` is lost across async boundaries. In contrast, `AsyncLocal<T>` attaches data to the .NET `ExecutionContext`, which the runtime automatically captures and flows across all `await` continuations and `Task.Run` child task hierarchies. It is the core foundation of ambient correlation IDs and OpenTelemetry distributed tracing.',
      keyPoints: [
        'ExecutionContext Flow: Captures security principal, culture, and `AsyncLocal<T>` data across task yields.',
        'Thread Switching: Guarantees context stays available even when a method starts on Thread #4 and finishes on Thread #19.',
        'Copy-On-Write Semantics: Modifying `AsyncLocal<T>` in a child task creates a local fork that does not overwrite the parent task value.',
        'SuppressFlow: `ExecutionContext.SuppressFlow()` can be used to prevent context inheritance in fire-and-forget background workers.'
      ],
      codeOrQuerySnippet: {
        title: 'Correlation ID Tracking with AsyncLocal<T> in Middleware (C#)',
        language: 'csharp',
        code: `public class CorrelationContext
{
    private static readonly AsyncLocal<string?> _currentCorrelationId = new();

    public static string CurrentCorrelationId
    {
        get => _currentCorrelationId.Value ?? "none";
        set => _currentCorrelationId.Value = value;
    }
}

// ASP.NET Core Middleware populates Correlation ID
public class CorrelationMiddleware
{
    private readonly RequestDelegate _next;

    public CorrelationMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        string correlationId = context.Request.Headers["X-Correlation-ID"].FirstOrDefault() 
            ?? Guid.NewGuid().ToString("N");

        CorrelationContext.CurrentCorrelationId = correlationId;
        context.Response.Headers["X-Correlation-ID"] = correlationId;

        // Context flows automatically through all nested async service calls
        await _next(context);
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'Suppressing ExecutionContext Flow for Independent Background Tasks',
        language: 'csharp',
        code: `// Prevents leaking parent request context and memory into background queue worker
using (ExecutionContext.SuppressFlow())
{
    Task.Run(async () =>
    {
        await ProcessBackgroundAnalyticsAsync();
    });
}`
      },
      proTipOrPitfall: 'Never store large mutable reference objects directly inside `AsyncLocal<T>` without copying, as concurrent child tasks sharing the object reference can cause race conditions.',
      studyResources: [
        {
          title: 'AsyncLocal<T> Class in .NET',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.threading.asynclocal-1',
          source: 'Microsoft Learn',
          description: 'Official API documentation for AsyncLocal and ExecutionContext flow.'
        }
      ]
    }
  },
  {
    id: 'csharp-16',
    category: 'C#',
    question: '16. How does Unmanaged Memory Allocation via NativeMemory.Alloc in .NET work, and how do you prevent native memory leaks?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'NativeMemory', 'Unmanaged Memory', 'SafeHandle', 'C-Interop', 'GC Bypass'],
    shortSummary: 'Explains NativeMemory.Alloc, NativeMemory.Free, SafeBuffer, and native allocator integration.',
    detailedAnswer: {
      executiveSummary: 'When building ultra-low-latency caches or inter-process communication systems, allocating gigabytes of memory on the managed heap can cause long Garbage Collection pauses. `System.Runtime.InteropServices.NativeMemory` provides direct access to OS memory allocators (`malloc`, `free`, `aligned_alloc`). Native memory resides outside the .NET GC entirely; it is never inspected or moved by the GC and must be manually freed with `NativeMemory.Free()` or wrapped in a `SafeBuffer` to prevent fatal memory leaks.',
      keyPoints: [
        'NativeMemory.Alloc: Allocates byte buffers directly from OS native heap memory (like C malloc).',
        'NativeMemory.AlignedAlloc: Allocates memory aligned to cache lines (e.g. 64-byte alignment for AVX-512 SIMD).',
        'Zero GC Pressure: The .NET GC completely ignores unmanaged native memory.',
        'Mandatory Cleanup: Failure to call `NativeMemory.Free()` causes permanent OS memory exhaustion.'
      ],
      codeOrQuerySnippet: {
        title: 'Safe Native Memory Buffer Wrapper with IDisposable (C#)',
        language: 'csharp',
        code: `using System.Runtime.InteropServices;

public unsafe class NativeBuffer : IDisposable
{
    private void* _pointer;
    private readonly nuint _byteCount;
    private bool _disposed;

    public NativeBuffer(nuint byteCount)
    {
        _byteCount = byteCount;
        // Allocate 64-byte aligned unmanaged memory for SIMD optimization
        _pointer = NativeMemory.AlignedAlloc(byteCount, 64);
        NativeMemory.Clear(_pointer, byteCount);
    }

    public Span<byte> AsSpan()
    {
        if (_disposed) throw new ObjectDisposedException(nameof(NativeBuffer));
        return new Span<byte>(_pointer, (int)_byteCount);
    }

    public void Dispose()
    {
        if (!_disposed)
        {
            if (_pointer != null)
            {
                NativeMemory.AlignedFree(_pointer);
                _pointer = null;
            }
            _disposed = true;
            GC.SuppressFinalize(this);
        }
    }

    ~NativeBuffer() => Dispose();
}`
      },
      secondaryCodeSnippet: {
        title: 'Writing and Reading from Native Buffer via Span',
        language: 'csharp',
        code: `using var nativeBuffer = new NativeBuffer(4096);
Span<byte> span = nativeBuffer.AsSpan();
span[0] = 0xFE;
span[1] = 0x01;`
      },
      proTipOrPitfall: 'Always implement a finalizer (`~MyClass()`) as a safety net when managing raw native memory pointers, ensuring `NativeMemory.Free()` is called if developers forget to call `Dispose()`.',
      studyResources: [
        {
          title: 'NativeMemory Class in .NET',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.nativememory',
          source: 'Microsoft Learn',
          description: 'Official API documentation for NativeMemory allocation methods.'
        }
      ]
    }
  },
  {
    id: 'csharp-17',
    category: 'C#',
    question: '17. How do Dynamic PGO (Profile-Guided Optimization), Tiered Compilation, and Inlining work in the .NET RyuJIT compiler?',
    difficulty: 'Principal Architect',
    tags: ['C#', 'RyuJIT', 'Tiered Compilation', 'Dynamic PGO', 'Inlining', 'Performance'],
    shortSummary: 'Explains Tier 0 quick JIT, Tier 1 optimized JIT, loop unrolling, devirtualization, and aggressive inlining.',
    detailedAnswer: {
      executiveSummary: 'The .NET RyuJIT compiler uses Tiered Compilation to balance fast application startup with maximum steady-state execution speed. On startup, methods are compiled in Tier 0 with minimal optimizations. As methods execute frequently, Tier 0 code instruments performance metrics. Dynamic Profile-Guided Optimization (Dynamic PGO in .NET 8+) analyzes runtime branch probabilities and monomorphic type calls, devirtualizing interface dispatches into direct non-virtual method calls and aggressive inlining in Tier 1.',
      keyPoints: [
        'Tier 0: Fast JIT compilation without optimizations to minimize app boot time.',
        'Tier 1: Heavy optimizations (loop unrolling, constant folding, SIMD vectorization, register allocation).',
        'Devirtualization: Converts expensive interface dispatch table lookups into direct static machine calls when profiling confirms 99% of calls use a single concrete type.',
        'MethodImplOptions.AggressiveInlining: Hints RyuJIT to inline short utility methods, eliminating method call stack frame overhead.'
      ],
      codeOrQuerySnippet: {
        title: 'Controlling RyuJIT Inlining with MethodImpl Attributes (C#)',
        language: 'csharp',
        code: `using System.Runtime.CompilerServices;

public static class PerformanceOptimizedRoutines
{
    // Inlines small mathematical method directly into caller call site
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static int FastClamp(int value, int min, int max)
    {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    // Prevents inlining for cold error paths to keep caller code size small and CPU cache friendly
    [MethodImpl(MethodImplOptions.NoInlining)]
    public static void ThrowInvalidMortgageState(string state)
    {
        throw new InvalidOperationException($"Invalid mortgage state: {state}");
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'Enabling Dynamic PGO in .csproj',
        language: 'xml',
        code: `<PropertyGroup>
  <!-- Dynamic PGO is enabled by default in .NET 8/9 for up to 20% throughput boost -->
  <TieredPGO>true</TieredPGO>
</PropertyGroup>`
      },
      proTipOrPitfall: 'Do not mark large methods (>100 lines) with `[MethodImpl(MethodImplOptions.AggressiveInlining)]`. Inlining huge methods causes instruction cache bloat (i-cache misses) and can degrade overall CPU throughput.',
      studyResources: [
        {
          title: 'Performance Improvements in .NET 8: JIT & Dynamic PGO',
          url: 'https://devblogs.microsoft.com/dotnet/performance-improvements-in-net-8/',
          source: 'Microsoft .NET Blog',
          description: 'Deep architectural overview of RyuJIT, Dynamic PGO, and inlining.'
        }
      ]
    }
  },
  {
    id: 'csharp-18',
    category: 'C#',
    question: '18. How do ISpanFormattable, IUtf8SpanFormattable, and Utf8.TryWrite enable zero-allocation string and JSON formatting in high-throughput .NET APIs?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'ISpanFormattable', 'IUtf8SpanFormattable', 'Zero-Allocation', 'Formatting', 'Strings'],
    shortSummary: 'Explains direct UTF-8 byte formatting, buffer writing without intermediate string allocations, and interpolation handlers.',
    detailedAnswer: {
      executiveSummary: 'In high-throughput web APIs, calling `.ToString()` or string interpolation `$"{id}:{amount}"` allocates temporary string objects on the heap. `ISpanFormattable` and `IUtf8SpanFormattable` (introduced in .NET 8) allow custom types, numbers, and dates to format their values directly into pre-allocated `Span<char>` or UTF-8 `Span<byte>` buffers without allocating a single string heap object, eliminating millions of GC allocations per second.',
      keyPoints: [
        'ISpanFormattable: Formats directly into `Span<char>` destination buffer.',
        'IUtf8SpanFormattable: Formats directly into UTF-8 `Span<byte>` destination buffer for zero-copy HTTP serialization.',
        'Utf8.TryWrite: Formats interpolated strings directly into UTF-8 bytes with zero heap allocation.',
        'InterpolatedStringHandler: Custom ref struct compiler handlers that pre-calculate total buffer length.'
      ],
      codeOrQuerySnippet: {
        title: 'Custom Struct Implementing IUtf8SpanFormattable (.NET 8 C#)',
        language: 'csharp',
        code: `using System.Buffers.Text;
using System.Text.Unicode;

public readonly struct LoanId : IUtf8SpanFormattable
{
    public int Value { get; }

    public LoanId(int value) => Value = value;

    // Formats directly into UTF-8 byte buffer without intermediate string allocation
    public bool TryFormat(
        Span<byte> utf8Destination, 
        out int bytesWritten, 
        ReadOnlySpan<char> format, 
        IFormatProvider? provider)
    {
        // Writes "LOAN-" prefix
        ReadOnlySpan<byte> prefix = "LOAN-"u8;
        if (utf8Destination.Length < prefix.Length + 10)
        {
            bytesWritten = 0;
            return false;
        }

        prefix.CopyTo(utf8Destination);
        
        if (Utf8Formatter.TryFormat(Value, utf8Destination.Slice(prefix.Length), out int numBytesWritten))
        {
            bytesWritten = prefix.Length + numBytesWritten;
            return true;
        }

        bytesWritten = 0;
        return false;
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'Zero-Allocation Interpolated UTF-8 Byte Formatting with Utf8.TryWrite',
        language: 'csharp',
        code: `Span<byte> buffer = stackalloc byte[128];
int loanId = 948201;
decimal amount = 425000.50m;

// Formats interpolated string directly into UTF-8 byte span without allocating string
if (System.Text.Unicode.Utf8.TryWrite(buffer, $"urn:loan:{loanId}:{amount:F2}", out int written))
{
    socketStream.Write(buffer.Slice(0, written));
}`
      },
      proTipOrPitfall: 'Use `"my-string"u8` literal syntax to create UTF-8 `ReadOnlySpan<byte>` literals at compile time with zero runtime encoding overhead.',
      studyResources: [
        {
          title: 'IUtf8SpanFormattable Interface (.NET 8)',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.iutf8spanformattable',
          source: 'Microsoft Learn',
          description: 'Official API documentation on UTF-8 span formatting in .NET.'
        }
      ]
    }
  },
  {
    id: 'csharp-19',
    category: 'C#',
    question: '19. How do ASP.NET Core Middleware Pipelines, Endpoint Routing, and Filter Pipelines execute request lifecycles under the hood?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'ASP.NET Core', 'Middleware', 'Routing', 'Filters', 'Architecture'],
    shortSummary: 'Explains Russian-Doll pipeline execution, EndpointRoutingMiddleware, EndpointDataSource, and authorization filter order.',
    detailedAnswer: {
      executiveSummary: 'ASP.NET Core processes HTTP requests using a bidirectional middleware pipeline constructed via chained `RequestDelegate` delegates (the "Russian Doll" pattern). `UseRouting()` matches the URL against `EndpointDataSource` and selects the target endpoint, storing the metadata on `HttpContext.GetEndpoint()`. Subsequent middleware (e.g. `UseAuthentication()`, `UseAuthorization()`) evaluates policies before `UseEndpoints()` invokes the endpoint action. Action Filters, Resource Filters, and Exception Filters wrap the controller/handler execution in a secondary pipeline.',
      keyPoints: [
        'Russian Doll Delegate Chain: Each middleware calls `await next(context)` to delegate to downstream handlers, and processes response logic as the stack unwinds.',
        'Routing vs Endpoint Execution: `UseRouting()` selects the route; `UseEndpoints()` executes the matched handler.',
        'Short-Circuiting: A middleware that returns without calling `next()` (e.g. authorization failure returning 401) stops pipeline propagation.',
        'Order of Middleware: ExceptionHandler -> HSTS -> HttpsRedirection -> StaticFiles -> Routing -> Cors -> Authentication -> Authorization -> Custom -> Endpoints.'
      ],
      codeOrQuerySnippet: {
        title: 'Custom Performance Profiling Middleware in ASP.NET Core (C#)',
        language: 'csharp',
        code: `public class RequestPerformanceMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestPerformanceMiddleware> _logger;

    public RequestPerformanceMiddleware(RequestDelegate next, ILogger<RequestPerformanceMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        long startTimestamp = Stopwatch.GetTimestamp();

        try
        {
            // Delegate down the Russian Doll pipeline
            await _next(context);
        }
        finally
        {
            // Executes on response unwind
            TimeSpan elapsed = Stopwatch.GetElapsedTime(startTimestamp);
            if (elapsed.TotalMilliseconds > 500)
            {
                _logger.LogWarning("Slow request detected: {Path} took {ElapsedMs}ms", 
                    context.Request.Path, elapsed.TotalMilliseconds);
            }
        }
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'Registering Middleware Pipeline in Program.cs',
        language: 'csharp',
        code: `var app = builder.Build();

app.UseExceptionHandler("/error");
app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<RequestPerformanceMiddleware>();

app.MapControllers();
app.Run();`
      },
      proTipOrPitfall: 'Always register `UseAuthentication()` before `UseAuthorization()`. Inverting their order causes authorization to execute on an unauthenticated identity, silently failing all permission checks.',
      studyResources: [
        {
          title: 'ASP.NET Core Middleware Architecture',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/',
          source: 'Microsoft Learn',
          description: 'Official guide to middleware pipeline configuration and order of execution.'
        }
      ]
    }
  },
  {
    id: 'csharp-20',
    category: 'C#',
    question: '20. How do System.Diagnostics.Activity, OpenTelemetry .NET, and Meter Metrics provide production distributed tracing and telemetry in microservices?',
    difficulty: 'Principal Architect',
    tags: ['C#', 'OpenTelemetry', 'Distributed Tracing', 'Activity', 'Metrics', 'Observability'],
    shortSummary: 'Explains W3C TraceContext (traceparent), ActivitySource, Meter / Counter instruments, and OTLP exporters.',
    detailedAnswer: {
      executiveSummary: 'In modern .NET cloud architectures, distributed tracing is built natively into the BCL via `System.Diagnostics.ActivitySource` and `System.Diagnostics.Metrics.Meter`. When an HTTP or gRPC request arrives, the framework automatically extracts W3C `traceparent` headers, continuing the distributed trace. Services instrument custom spans using `ActivitySource.StartActivity()` and emit structured metrics via `Counter<T>` or `Histogram<T>`, which OpenTelemetry .NET exports via OTLP to Prometheus, Grafana Tempo, or Azure Application Insights.',
      keyPoints: [
        'W3C TraceContext: Standard HTTP header `traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01` links distributed spans across polyglot microservices.',
        'ActivitySource: Native .NET BCL class for generating OpenTelemetry spans without third-party dependencies.',
        'Meter & Histogram: Native instruments for recording request duration distributions and business counters.',
        'OpenTelemetry SDK: Configured via `builder.Services.AddOpenTelemetry().WithTracing().WithMetrics()`.'
      ],
      codeOrQuerySnippet: {
        title: 'Native ActivitySource Distributed Tracing & Custom Metrics (.NET 8 C#)',
        language: 'csharp',
        code: `using System.Diagnostics;
using System.Diagnostics.Metrics;

public class LoanUnderwritingEngine
{
    private static readonly ActivitySource ActivitySource = new("Enterprise.Mortgage.Underwriting", "1.0.0");
    private static readonly Meter UnderwritingMeter = new("Enterprise.Mortgage.Underwriting", "1.0.0");
    
    private static readonly Counter<long> ApprovedLoansCounter = 
        UnderwritingMeter.CreateCounter<long>("loans.approved.count", "loans", "Total approved loans");
    private static readonly Histogram<double> UnderwritingDuration = 
        UnderwritingMeter.CreateHistogram<double>("loans.underwrite.duration.ms", "ms", "Underwriting latency");

    public async Task<bool> UnderwriteLoanAsync(LoanApplication app, CancellationToken ct)
    {
        using Activity? activity = ActivitySource.StartActivity("EvaluateCreditScoreAndDTI");
        activity?.SetTag("loan.id", app.ApplicationId.ToString());
        activity?.SetTag("loan.amount", app.Amount);

        long start = Stopwatch.GetTimestamp();
        
        bool approved = app.CreditScore >= 680 && app.DebtToIncomeRatio <= 0.43m;
        
        if (approved)
        {
            ApprovedLoansCounter.Add(1, new KeyValuePair<string, object?>("loan.type", app.Type.ToString()));
            activity?.AddEvent(new ActivityEvent("LoanApprovedInstantUnderwriting"));
        }

        UnderwritingDuration.Record(Stopwatch.GetElapsedTime(start).TotalMilliseconds);
        return approved;
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'Configuring OpenTelemetry OTLP Exporters in Program.cs',
        language: 'csharp',
        code: `builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddSource("Enterprise.Mortgage.Underwriting")
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddOtlpExporter(opt => opt.Endpoint = new Uri("http://otel-collector:4317")))
    .WithMetrics(metrics => metrics
        .AddMeter("Enterprise.Mortgage.Underwriting")
        .AddAspNetCoreInstrumentation()
        .AddOtlpExporter());`
      },
      proTipOrPitfall: 'Always check if `ActivitySource.HasListeners()` is true or if `activity` is non-null before performing heavy string formatting or tag serialization to avoid unnecessary CPU overhead when tracing is disabled.',
      studyResources: [
        {
          title: 'Distributed Tracing with OpenTelemetry .NET',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing',
          source: 'Microsoft Learn',
          description: 'Official guide to Activity, ActivitySource, and OpenTelemetry in .NET.'
        }
      ]
    }
  }
];
