import { InterviewQuestion } from './interviewPrepData';

export const CSHARP_PART2: InterviewQuestion[] = [
  {
    id: 'csnet-26',
    category: 'C# & .NET',
    question: '26. How does IAsyncEnumerable<T> enable asynchronous streaming and real-time chunked JSON serialization in ASP.NET Core?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'IAsyncEnumerable', 'Async Streams', 'Streaming JSON', 'ASP.NET Core'],
    shortSummary: 'Explains async streams with yield return, System.Text.Json streaming, and memory efficiency for large datasets.',
    detailedAnswer: {
      executiveSummary: '`IAsyncEnumerable<T>` combines asynchronous pull-based iteration with async await. Instead of buffering an entire 100,000-record query in memory as a `List<T>` before returning, `IAsyncEnumerable<T>` yields each item asynchronously as it arrives from the database or external stream. ASP.NET Core automatically serializes `IAsyncEnumerable<T>` as chunked JSON array streams to the HTTP client.',
      keyPoints: [
        'Zero Buffering: Yields items as they are ready, reducing server memory usage from gigabytes to kilobytes.',
        'Cancellation: Support cancellation tokens using `[EnumeratorCancellation] CancellationToken ct`.',
        'ASP.NET Core Integration: Serializes directly to the response body using HTTP chunked transfer encoding.',
        'EF Core AsAsyncEnumerable: `dbContext.Loans.AsAsyncEnumerable()` streams rows directly from SQL cursor.'
      ],
      codeOrQuerySnippet: {
        title: 'Streaming Large Database Results with IAsyncEnumerable<T>',
        language: 'csharp',
        code: `public class MortgageExportService
{
    private readonly MortgageDbContext _dbContext;

    public MortgageExportService(MortgageDbContext dbContext) => _dbContext = dbContext;

    public async IAsyncEnumerable<LoanExportDto> StreamActiveLoansAsync(
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        // Streams records row-by-row without buffering the entire table in RAM
        await foreach (var loan in _dbContext.Loans.AsNoTracking().AsAsyncEnumerable().WithCancellation(cancellationToken))
        {
            yield return new LoanExportDto(loan.Id, loan.BorrowerName, loan.Principal);
        }
    }
}`
      },
      proTipOrPitfall: 'Always pass `[EnumeratorCancellation]` on the CancellationToken parameter in async iterator methods; omitting it prevents cancellation tokens passed by the caller from reaching the iterator.',
      studyResources: [
        {
          title: 'Iterate with Async Streams in C#',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/async-scenarios',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-27',
    category: 'C# & .NET',
    question: '27. What is the difference between AsyncLocal<T> and ThreadLocal<T>, and how does ExecutionContext flow across async await boundaries?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'AsyncLocal', 'ThreadLocal', 'ExecutionContext', 'Concurrency'],
    shortSummary: 'Explains ambient context propagation across async tasks, copy-on-write semantics, and ThreadLocal single-thread confinement.',
    detailedAnswer: {
      executiveSummary: '`ThreadLocal<T>` stores data unique to the current operating system thread. Because `async/await` continuations can resume on any ThreadPool thread, `ThreadLocal<T>` loses state across await boundaries. `AsyncLocal<T>` stores ambient data that flows with the asynchronous control flow (via `ExecutionContext`), ensuring context (such as CorrelationId, User Principal, or TenantId) is preserved across all async calls and tasks.',
      keyPoints: [
        'AsyncLocal<T>: Follows the logical async call tree; child tasks inherit parent values.',
        'ExecutionContext: Manages security and logical ambient context flow; suppressed via `ExecutionContext.SuppressFlow()` for perf-critical paths.',
        'Copy-on-Write: Setting value in a child async task does not overwrite the parent task value.',
        'ThreadLocal<T>: Strictly bound to the physical managed thread; use only for thread-confined non-async workloads.'
      ],
      codeOrQuerySnippet: {
        title: 'Ambient Correlation Context using AsyncLocal<T>',
        language: 'csharp',
        code: `public static class CorrelationContext
{
    private static readonly AsyncLocal<string?> _correlationId = new();

    public static string? CurrentCorrelationId
    {
        get => _correlationId.Value;
        set => _correlationId.Value = value;
    }
}

// Middleware setting ambient context for the entire async request tree:
public class CorrelationMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        string correlationId = context.Request.Headers["X-Correlation-ID"].FirstOrDefault() ?? Guid.NewGuid().ToString();
        CorrelationContext.CurrentCorrelationId = correlationId;
        context.Response.Headers["X-Correlation-ID"] = correlationId;

        await next(context); // Ambient context flows into all downstream async services
    }
}`
      },
      proTipOrPitfall: 'Mutating properties of an object stored inside AsyncLocal<T> will be visible across sibling tasks because the reference is shared. Store immutable values or records.',
      studyResources: [
        {
          title: 'ExecutionContext vs SynchronizationContext',
          url: 'https://devblogs.microsoft.com/pfxteam/executioncontext-vs-synchronizationcontext/',
          source: '.NET Blog'
        }
      ]
    }
  },
  {
    id: 'csnet-28',
    category: 'C# & .NET',
    question: '28. How do SocketsHttpHandler configuration, connection pooling, and HTTP/2 multiplexing optimize outbound HTTP performance in .NET?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'SocketsHttpHandler', 'HTTP/2', 'Connection Pooling', 'Networking'],
    shortSummary: 'Covers PooledConnectionLifetime, PooledConnectionIdleTimeout, MaxConnectionsPerServer, and HTTP/2 streams.',
    detailedAnswer: {
      executiveSummary: '`SocketsHttpHandler` is the high-performance cross-platform socket implementation powering HttpClient in .NET Core. By configuring connection pooling properties—such as `PooledConnectionLifetime` (refreshes connections for DNS), `PooledConnectionIdleTimeout` (closes stale sockets), and `EnableMultipleHttp2Connections`—architects can eliminate socket contention and maximize throughput.',
      keyPoints: [
        'PooledConnectionLifetime: Sets max age of a pooled socket (e.g. 2 minutes) to ensure DNS updates take effect.',
        'EnableMultipleHttp2Connections: Allows opening multiple TCP connections when HTTP/2 concurrent stream limit (default 100) is saturated.',
        'MaxConnectionsPerServer: Limits concurrent outbound connections per host (useful for protecting backend services).',
        'Automatic Decompression: Enable GZip/Brotli decoding natively in socket handler.'
      ],
      codeOrQuerySnippet: {
        title: 'Tuning SocketsHttpHandler in IHttpClientFactory',
        language: 'csharp',
        code: `builder.Services.AddHttpClient("HighScaleApiClient")
    .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
    {
        PooledConnectionLifetime = TimeSpan.FromMinutes(2), // DNS refresh
        PooledConnectionIdleTimeout = TimeSpan.FromMinutes(1),
        MaxConnectionsPerServer = 200,
        EnableMultipleHttp2Connections = true,
        AutomaticDecompression = DecompressionMethods.All,
        KeepAlivePingDelay = TimeSpan.FromSeconds(30),
        KeepAlivePingTimeout = TimeSpan.FromSeconds(5)
    });`
      },
      proTipOrPitfall: 'Never disable `PooledConnectionLifetime` in microservice environments behind dynamic DNS (like Kubernetes ClusterIP or AWS ALB), or your app will fail to detect IP changes when pods rebalance.',
      studyResources: [
        {
          title: 'SocketsHttpHandler Class',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.net.http.socketshttphandler',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-29',
    category: 'C# & .NET',
    question: '29. What are C# 12 Collection Expressions and the Spread Operator (..), and how does the compiler optimize their allocations?',
    difficulty: 'Junior (0-2 YOE)',
    tags: ['C# 12', 'Collection Expressions', 'Spread Operator', 'ReadOnlySpan', 'Compiler Optimization'],
    shortSummary: 'Explains unified syntax `[1, 2, 3]`, spread element `[..a, ..b]`, and ReadOnlySpan compiler optimizations.',
    detailedAnswer: {
      executiveSummary: 'C# 12 introduced Collection Expressions, providing a unified bracket syntax `[...]` to initialize arrays, lists, spans, and immutable collections. The compiler optimizes collection initialization by inspecting the target type—e.g., when initializing a `ReadOnlySpan<int>`, the compiler creates the data directly in the assembly binary data segment with zero heap allocation.',
      keyPoints: [
        'Unified Syntax: Works for `int[]`, `List<T>`, `Span<T>`, `ReadOnlySpan<T>`, and `ImmutableArray<T>`.',
        'Spread Operator (`..`): Flattens collections inline: `int[] combined = [..firstList, 99, ..secondList];`.',
        'Zero Allocation Spans: `ReadOnlySpan<string> tags = ["Mortgage", "Finance"];` compiles to stack/static segment.',
        'CollectionBuilder Attribute: Allows custom collections to support collection expressions.'
      ],
      codeOrQuerySnippet: {
        title: 'C# 12 Collection Expressions & Spread Syntax',
        language: 'csharp',
        code: `public class CollectionExpressionDemo
{
    public void Run()
    {
        // 1. Zero-allocation ReadOnlySpan
        ReadOnlySpan<string> primeStates = ["CA", "NY", "TX"];

        // 2. Initializing Lists and Arrays identically
        List<int> standardRates = [4, 5, 6];
        int[] premiumRates = [7, 8, 9];

        // 3. Flattening with Spread Operator (..)
        int[] allRates = [0, ..standardRates, ..premiumRates, 10];

        Console.WriteLine($"Total count: {allRates.Length}");
    }
}`
      },
      proTipOrPitfall: 'When initializing a collection that targets an interface like `IEnumerable<T>`, the compiler selects an internal optimized representation. Target concrete types (`List<T>` or `Span<T>`) when specific behavior is required.',
      studyResources: [
        {
          title: 'Collection expressions - C# 12 feature specification',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/collection-expressions',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-30',
    category: 'C# & .NET',
    question: '30. How does the C# 13 System.Threading.Lock type improve synchronization performance over traditional object-based Monitor locking?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C# 13', '.NET 9', 'Lock Type', 'Synchronization', 'Performance'],
    shortSummary: 'Explains new Lock object, EnterScope ref struct, Monitor deprecation, and JIT optimizations.',
    detailedAnswer: {
      executiveSummary: 'Prior to C# 13, `lock(obj)` used `System.Threading.Monitor` on arbitrary heap objects, which requires managing object headers and sync blocks in the CLR. C# 13 introduces a dedicated `System.Threading.Lock` class. When the compiler encounters `lock(myLockInstance)` where `myLockInstance` is of type `System.Threading.Lock`, it emits an optimized `EnterScope()` call returning a ref struct, resulting in cleaner, faster locking primitives.',
      keyPoints: [
        'System.Threading.Lock: Dedicated BCL locking class introduced in .NET 9 / C# 13.',
        'EnterScope Pattern: Returns a `Lock.Scope` ref struct that releases lock upon disposal.',
        'No SyncBlock Bloat: Avoids CLR object header SyncBlock allocation and contention overhead.',
        'Backward Compatible: `lock (lockObj)` continues to work for legacy code, but emits optimized code for `System.Threading.Lock`.'
      ],
      codeOrQuerySnippet: {
        title: 'C# 13 System.Threading.Lock in .NET 9',
        language: 'csharp',
        code: `public class ThreadSafeMortgageLedger
{
    // C# 13 dedicated lock type
    private readonly System.Threading.Lock _lock = new();
    private readonly List<decimal> _transactions = [];

    public void AddTransaction(decimal amount)
    {
        // C# 13 compiler uses Lock.EnterScope() automatically
        lock (_lock)
        {
            _transactions.Add(amount);
        }
    }

    public decimal GetTotal()
    {
        lock (_lock)
        {
            return _transactions.Sum();
        }
    }
}`
      },
      proTipOrPitfall: 'Do not cast a `System.Threading.Lock` instance to `object` before locking on it, or the compiler will fall back to legacy `Monitor.Enter` instead of using the optimized scope lock.',
      studyResources: [
        {
          title: 'Whats new in C# 13',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-31',
    category: 'C# & .NET',
    question: '31. How do Roslyn Analyzers and .editorconfig enforce enterprise code standards and security rules at compile time?',
    difficulty: 'Mid-Level (3-5 YOE)',
    tags: ['C#', 'Roslyn Analyzers', 'Code Quality', '.editorconfig', 'CI/CD'],
    shortSummary: 'Covers DiagnosticSuppressor, severity levels (Error, Warning), and automated code fixes.',
    detailedAnswer: {
      executiveSummary: 'Roslyn Analyzers inspect C# syntax and semantic trees at compile time to detect security vulnerabilities, memory inefficiencies, and style deviations. Configured via `.editorconfig` and TreatWarningsAsErrors, analyzers fail CI/CD builds when violations occur before code ever reaches code review or staging.',
      keyPoints: [
        'Security Rules: Detect SQL injection, unvalidated redirects, and hardcoded credentials (e.g. CA2100, CA5351).',
        'Performance Rules: Catch unnecessary heap allocations, unawaited tasks, and missing ConfigureAwait (CA2007, CA1822).',
        'Severity Escalation: Set `dotnet_diagnostic.CA2000.severity = error` to block PR builds on disposable leaks.',
        'Automated Fixers: Provide 1-click refactorings in IDEs.'
      ],
      codeOrQuerySnippet: {
        title: 'Enterprise .editorconfig Rule Configuration',
        language: 'text',
        code: `# Top-level .editorconfig
root = true

[*.cs]
# Enforce nullable reference types
dotnet_diagnostic.CS8600.severity = error
dotnet_diagnostic.CS8602.severity = error

# Security & Disposal Rules
dotnet_diagnostic.CA2000.severity = error  # Dispose objects before losing scope
dotnet_diagnostic.CA2100.severity = error  # Review SQL queries for vulnerabilities
dotnet_diagnostic.CA1860.severity = warning # Avoid using Enumerable.Any() when Length/Count can be used`
      },
      proTipOrPitfall: 'Enable `<EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>` in your Directory.Build.props to ensure analyzer rules run during CLI `dotnet build`, not just inside the IDE editor.',
      studyResources: [
        {
          title: 'Code analysis in .NET',
          url: 'https://learn.microsoft.com/en-us/dotnet/fundamentals/code-analysis/overview',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-32',
    category: 'C# & .NET',
    question: '32. How do EventSource, EventCounters, and dotnet-counters provide low-overhead live performance diagnostics in production .NET servers?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'Diagnostics', 'EventSource', 'dotnet-counters', 'Metrics', 'Performance'],
    shortSummary: 'Explains ETW on Windows / EventPipe on Linux, EventSource event emission, and real-time CPU/GC monitoring.',
    detailedAnswer: {
      executiveSummary: '`EventSource` is the high-performance structured event tracing system in the .NET runtime. It communicates via EventPipe on Linux and ETW on Windows with zero CPU overhead when disabled. `EventCounters` emit point-in-time metrics (e.g., requests/sec, thread pool queue length) that CLI tools like `dotnet-counters` monitor in live production containers without attaching intrusive debuggers.',
      keyPoints: [
        'Zero Overhead when Inactive: EventSource checks an internal boolean before formatting strings.',
        'dotnet-counters CLI: `dotnet-counters monitor -p <PID> System.Runtime` provides live GC pause times and allocation rates.',
        'Custom Metrics: Subclass `EventSource` and instantiate `PollingCounter` or `IncrementingEventCounter`.',
        'Cross-Platform: Works on Linux Docker containers via named pipes without root privileges.'
      ],
      codeOrQuerySnippet: {
        title: 'Custom EventSource with EventCounter in C#',
        language: 'csharp',
        code: `[EventSource(Name = "Enterprise-Mortgage-Pipeline")]
public sealed class MortgagePipelineEventSource : EventSource
{
    public static readonly MortgagePipelineEventSource Log = new();
    private readonly IncrementingEventCounter _applicationProcessedCounter;

    private MortgagePipelineEventSource()
    {
        _applicationProcessedCounter = new IncrementingEventCounter("applications-processed-rate", this)
        {
            DisplayName = "Loan Applications Processed",
            DisplayRateTimeScale = TimeSpan.FromSeconds(1)
        };
    }

    [Event(1, Level = EventLevel.Informational)]
    public void LoanApplicationStarted(string loanId, decimal amount)
    {
        if (IsEnabled()) WriteEvent(1, loanId, amount);
        _applicationProcessedCounter.Increment();
    }
}`
      },
      proTipOrPitfall: 'Always guard custom payload serialization inside `if (IsEnabled())` before calling `WriteEvent` to avoid unnecessary string allocations when tracing is off.',
      studyResources: [
        {
          title: 'dotnet-counters diagnostic tool',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-counters',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-33',
    category: 'C# & .NET',
    question: '33. What are ref readonly parameters, in parameters, and readonly structs, and how do they prevent defensive struct copying?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'Ref Readonly', 'In Parameters', 'Readonly Struct', 'Performance'],
    shortSummary: 'Explains pass-by-reference without mutation, defensive copying overhead, and readonly struct guarantees.',
    detailedAnswer: {
      executiveSummary: 'When passing large structs (e.g., matrices, 64-byte financial models) by value, the runtime copies all bytes on every method call. Passing with `in` or `ref readonly` passes a pointer/reference to the struct without copying. However, if the struct is NOT declared as `readonly struct`, the compiler creates a hidden defensive copy on every property access to guard against internal mutations.',
      keyPoints: [
        'in Parameter: Passes a readonly reference to a struct; caller can pass variables or literals.',
        'ref readonly Parameter (C# 12): Stricter pass-by-reference requiring an lvalue (variable).',
        'Defensive Copying: If a struct is not `readonly struct`, the compiler copies the struct on every method call to ensure immutability.',
        'readonly struct: Enforces that all fields and properties are readonly, allowing the compiler to omit defensive copies.'
      ],
      codeOrQuerySnippet: {
        title: 'Eliminating Defensive Copies with readonly struct and in parameter',
        language: 'csharp',
        code: `// 1. Declare as readonly struct to prevent defensive copying
public readonly struct FinancialVector
{
    public readonly decimal Principal;
    public readonly decimal InterestRate;
    public readonly int TermMonths;

    public FinancialVector(decimal principal, decimal interestRate, int termMonths)
    {
        Principal = principal;
        InterestRate = interestRate;
        TermMonths = termMonths;
    }
}

public static class LoanMathEngine
{
    // 2. 'in' passes by reference with zero byte copying
    public static decimal CalculateMonthlyPayment(in FinancialVector vector)
    {
        // Zero defensive copy generated because vector is a 'readonly struct'
        decimal monthlyRate = vector.InterestRate / 1200m;
        return vector.Principal * monthlyRate;
    }
}`
      },
      proTipOrPitfall: 'Never use `in` parameters for small primitive structs (like `int`, `Guid`, or `DateTime`). Passing a 4-byte or 8-byte value by reference actually incurs pointer dereferencing overhead without any memory savings.',
      studyResources: [
        {
          title: 'Write safe and efficient C# code',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/write-safe-efficient-code',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-34',
    category: 'C# & .NET',
    question: '34. How do Unsafe code, fixed statements, and stackalloc enable direct memory manipulation in performance-critical C# algorithms?',
    difficulty: 'Principal Architect',
    tags: ['C#', 'Unsafe', 'Pointers', 'Stackalloc', 'Fixed', 'Memory'],
    shortSummary: 'Explains stack allocation, GC pointer pinning, fixed statements, and Span<T> safe interop.',
    detailedAnswer: {
      executiveSummary: 'C# provides unsafe code blocks for direct memory pointer arithmetic. `stackalloc` allocates memory directly on the execution stack frame, completely bypassing the Garbage Collector. When interacting with managed heap arrays, the `fixed` statement pins the object in memory, preventing the GC from moving it during compaction while pointers are active. In modern C#, `Span<T> span = stackalloc byte[size]` provides a safe, bounds-checked abstraction over stack memory.',
      keyPoints: [
        'stackalloc: Allocates memory on the call stack; reclaimed automatically when the function returns.',
        'Span<T> stackalloc: Safe alternative to raw pointers: `Span<byte> buffer = stackalloc byte[256];`.',
        'fixed Statement: Pins a managed heap object so the GC relocator does not move it while pointers are accessed.',
        'AllowUnsafeBlocks: Must be enabled in .csproj to compile raw pointer code.'
      ],
      codeOrQuerySnippet: {
        title: 'Safe Stackalloc and Unsafe Pointer Manipulation',
        language: 'csharp',
        code: `public class MemoryFastCrypto
{
    // Safe stackalloc using Span<byte> (No unsafe keyword required!)
    public static void FastSha256Hash(ReadOnlySpan<byte> input, Span<byte> destination)
    {
        Span<byte> tempBuffer = stackalloc byte[64]; // Fast stack memory, 0 GC allocation
        input.Slice(0, Math.Min(input.Length, 64)).CopyTo(tempBuffer);
        // Compute hash into destination
    }

    // Unsafe pointer arithmetic for extreme hot loops
    public unsafe static void FastZeroMemory(byte[] array)
    {
        fixed (byte* p = array)
        {
            byte* ptr = p;
            for (int i = 0; i < array.Length; i++)
            {
                *ptr++ = 0;
            }
        }
    }
}`
      },
      proTipOrPitfall: 'Never stackalloc large or unbounded buffers based on user input (e.g. `stackalloc byte[userInputLength]`). Allocating more than a few kilobytes on the stack can cause an unrecoverable `StackOverflowException` that crashes the process.',
      studyResources: [
        {
          title: 'Unsafe code, pointer types, and function pointers',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/unsafe-code',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-35',
    category: 'C# & .NET',
    question: '35. How does built-in Rate Limiting Middleware in .NET 7/8 protect APIs against DDoS and API abuse?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'Rate Limiting', 'ASP.NET Core', 'Security', 'Resilience'],
    shortSummary: 'Covers Fixed Window, Sliding Window, Token Bucket, Concurrency limiters, and partition-based rate limiting by IP/User.',
    detailedAnswer: {
      executiveSummary: 'ASP.NET Core provides native rate limiting middleware in `System.Threading.RateLimiting`. It offers four core algorithms: Fixed Window (resets every X seconds), Sliding Window (smooths boundary bursts across sub-segments), Token Bucket (accumulates refill tokens for burst tolerance), and Concurrency (limits simultaneous active requests). Partitioned limiters enable customized limits per IP address, authenticated user ID, or subscription tier.',
      keyPoints: [
        'Token Bucket Limiter: Allows short bursts while enforcing long-term average throughput.',
        'Sliding Window Limiter: Eliminates burst spikes at window boundary transitions.',
        'PartitionedRateLimiter: Create dynamic limits: `PartitionedRateLimiter.Create<HttpContext, string>(...)`.',
        'Rejection Handling: Configurable HTTP 429 Too Many Requests response with `Retry-After` header.'
      ],
      codeOrQuerySnippet: {
        title: 'Configuring Token Bucket Rate Limiting in ASP.NET Core',
        language: 'csharp',
        code: `// Program.cs
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    
    // Global IP-based Token Bucket policy
    options.AddPolicy("IpTokenBucket", httpContext =>
    {
        string clientIp = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        
        return RateLimitPartition.GetTokenBucketLimiter(clientIp, _ => new TokenBucketRateLimiterOptions
        {
            TokenLimit = 100,
            ReplenishmentPeriod = TimeSpan.FromSeconds(10),
            TokensPerPeriod = 20,
            QueueLimit = 10,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst
        });
    });
});

var app = builder.Build();
app.UseRateLimiter();
app.MapControllers().RequireRateLimiting("IpTokenBucket");`
      },
      proTipOrPitfall: 'In microservice clusters behind load balancers or reverse proxies, ensure you configure `UseForwardedHeaders()` before the rate limiter so that `RemoteIpAddress` reflects the real client IP rather than the load balancer IP.',
      studyResources: [
        {
          title: 'Rate limiting middleware in ASP.NET Core',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit',
          source: 'Microsoft Learn'
        }
      ]
    }
  }
];
