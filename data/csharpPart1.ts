import { InterviewQuestion } from './interviewPrepData';

export const CSHARP_PART1: InterviewQuestion[] = [
  {
    id: 'csnet-01',
    category: 'C# & .NET',
    question: '1. How do Async/Await state machines work under the hood in C#/.NET, and how do you prevent thread starvation or deadlocks in legacy .NET sync contexts?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', '.NET 8', 'Async/Await', 'Threading', 'State Machine'],
    shortSummary: 'Explains C# async compiler transformations, IAsyncStateMachine, SynchronizationContext, and Task.ConfigureAwait(false).',
    detailedAnswer: {
      executiveSummary: 'When you mark a method as async, the C# compiler transforms it into a hidden state machine struct implementing IAsyncStateMachine. It divides code at each await operator, registering continuations through AsyncTaskMethodBuilder without blocking worker threads. In contexts with a SynchronizationContext (UI or classic ASP.NET), calling .Result or .Wait() synchronously blocks the thread, causing deadlocks if continuations must resume on that same thread.',
      keyPoints: [
        'Compiler Transformation: Replaces async methods with a value-type state machine struct managing execution steps (-1: running, 0+: awaiting, -2: completed).',
        'SynchronizationContext: Captures the calling thread context to resume execution on the same thread (useful for UI, detrimental for backend APIs).',
        'Deadlock Prevention: Always await asynchronously end-to-end; never invoke .Result or .Wait() on uncompleted Tasks.',
        'ConfigureAwait(false): Instructs the runtime to execute continuations on any available ThreadPool thread, skipping SynchronizationContext capture.'
      ],
      codeOrQuerySnippet: {
        title: 'Thread-Safe Async Pattern (.NET C#)',
        language: 'csharp',
        code: `public async Task<MortgageDto> GetApplicationAsync(int id, CancellationToken ct = default)
{
    var app = await _dbContext.Applications
        .AsNoTracking()
        .FirstOrDefaultAsync(a => a.Id == id, ct)
        .ConfigureAwait(false);

    if (app == null) throw new NotFoundException($"Application {id} not found");

    return _mapper.Map<MortgageDto>(app);
}`
      },
      secondaryCodeSnippet: {
        title: 'ValueTask<T> for Zero-Allocation Hot Paths',
        language: 'csharp',
        code: `public class CachedRateService
{
    private readonly ConcurrentDictionary<string, decimal> _rateCache = new();

    public ValueTask<decimal> GetInterestRateAsync(string stateCode)
    {
        if (_rateCache.TryGetValue(stateCode, out decimal cachedRate))
        {
            return new ValueTask<decimal>(cachedRate); // Zero heap allocation on synchronous hit
        }

        return new ValueTask<decimal>(FetchFromDatabaseAsync(stateCode));
    }
}`
      },
      proTipOrPitfall: 'Avoid "async void" except in top-level event handlers. Async void methods cannot be awaited and unhandled exceptions inside them will terminate the process.',
      studyResources: [
        {
          title: 'Asynchronous Programming with async and await in C#',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-02',
    category: 'C# & .NET',
    question: '2. How does the .NET Garbage Collector (GC) handle Generations (Gen 0, 1, 2, LOH, POH) and how do you prevent memory leaks in high-throughput services?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'Garbage Collection', 'Memory Management', 'LOH', 'POH', 'IDisposable'],
    shortSummary: 'Covers generational mark-and-sweep, Large Object Heap (>85KB), Pinned Object Heap, and IAsyncDisposable.',
    detailedAnswer: {
      executiveSummary: 'The .NET GC uses an ephemeral generational mark-sweep-compact algorithm. Gen 0 stores newly allocated objects; survivors advance to Gen 1 and Gen 2. Objects >= 85,000 bytes bypass Gen 0 and land on the Large Object Heap (LOH) to avoid memory copies. .NET 5+ introduced the Pinned Object Heap (POH) for pinned memory buffers used in native I/O. Memory leaks typically arise from unmanaged resources, lingering event subscriptions, or unbounded static collections.',
      keyPoints: [
        'Gen 0 & Gen 1: Ephemeral collections that pause execution for only microseconds.',
        'Gen 2 & LOH: Full GC collections; LOH fragmentation requires periodic compaction tuning.',
        'Pinned Object Heap (POH): Prevents LOH fragmentation by allocating pinned byte buffers directly into a dedicated uncompacted heap.',
        'Diagnostics: Use dotnet-dump, dotnet-gcdump, and PerfView to trace GC roots and memory graphs.'
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
        }
        _unmanagedHandle?.Dispose();
        _unmanagedHandle = null;
        _disposed = true;
    }

    protected virtual async ValueTask DisposeAsyncCore()
    {
        if (_managedStream is not null)
        {
            await _managedStream.DisposeAsync().ConfigureAwait(false);
        }
    }
}`
      },
      proTipOrPitfall: 'Never call GC.Collect() manually in production server code. The CLR GC auto-tunes generation budgets based on CPU load and memory pressure; manual calls disrupt GC heuristics.',
      studyResources: [
        {
          title: 'Fundamentals of Garbage Collection in .NET',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-03',
    category: 'C# & .NET',
    question: '3. What are the differences between Value Types, Reference Types, Structs, Classes, Ref Structs, and Span<T> / Memory<T> in high-performance C#?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'Span<T>', 'Memory<T>', 'Ref Struct', 'Zero-Allocation'],
    shortSummary: 'Explains Stack vs Heap allocations, ReadOnlySpan<T>, Ref Struct stack-only constraints, and Memory<T> async compatibility.',
    detailedAnswer: {
      executiveSummary: 'Value types (structs, primitives) are allocated inline (on the stack or within containing objects) and copied by value, while Reference types (classes, strings) live on the managed heap and are referenced by pointers. Span<T> is a ref struct representing a contiguous region of arbitrary memory (stack, heap, or native) with zero memory allocations. Because ref structs cannot escape the stack, Memory<T> is used for async method boundaries and heap storage.',
      keyPoints: [
        'Span<T> / ReadOnlySpan<T>: Stack-only ref struct providing zero-copy slicing over arrays, strings, and unmanaged memory.',
        'Ref Struct Constraints: Cannot be boxed, cannot be stored in heap objects, cannot be fields of normal classes, and cannot be captured in async state machines.',
        'Memory<T> / ReadOnlyMemory<T>: Heap-allocatable memory slice that can safely cross async await boundaries.',
        'Performance Impact: Slicing a string with span.Slice() creates no garbage collection allocations.'
      ],
      codeOrQuerySnippet: {
        title: 'Zero-Allocation String Parsing with ReadOnlySpan<T>',
        language: 'csharp',
        code: `public static (ReadOnlySpan<char> Account, ReadOnlySpan<char> Routing) ParseFinancialRouting(string input)
{
    ReadOnlySpan<char> span = input.AsSpan();
    int colonIndex = span.IndexOf(':');
    if (colonIndex == -1) throw new FormatException("Invalid routing string format");

    // Zero-allocation slicing!
    ReadOnlySpan<char> account = span.Slice(0, colonIndex);
    ReadOnlySpan<char> routing = span.Slice(colonIndex + 1);

    return (account, routing);
}`
      },
      proTipOrPitfall: 'Do not use Span<T> in async methods across await boundaries. Use Memory<T> or ReadOnlyMemory<T> when memory slices must survive async suspension points.',
      studyResources: [
        {
          title: 'Memory and Span in .NET',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-04',
    category: 'C# & .NET',
    question: '4. How do Dependency Injection (DI) lifetimes (Transient, Scoped, Singleton) work in .NET Core, and what causes Captive Dependencies?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'Dependency Injection', 'ASP.NET Core', 'Captive Dependency', 'Lifetimes'],
    shortSummary: 'Covers service lifetimes, scope boundaries, captive dependency anti-pattern, and Keyed Services in .NET 8.',
    detailedAnswer: {
      executiveSummary: 'ASP.NET Core DI supports Transient (new instance every resolution), Scoped (single instance per HTTP request scope), and Singleton (single instance per app lifecycle). A Captive Dependency occurs when a service with a longer lifetime (like Singleton) takes a dependency on a service with a shorter lifetime (like Scoped). This causes the Scoped service (e.g., DbContext) to remain alive for the lifetime of the application, leaking memory and causing cross-request concurrency race conditions.',
      keyPoints: [
        'Transient: Created every time requested. Best for lightweight, stateless utility operations.',
        'Scoped: Created once per HTTP request or IServiceScope. Ideal for DbContext and per-request state.',
        'Singleton: Created once on first resolution. Best for caches, telemetry clients, and background orchestrators.',
        'Captive Dependency: A Singleton capturing a Scoped service. Caught in development using builder.Host.UseDefaultServiceProvider(o => o.ValidateScopes = true).'
      ],
      codeOrQuerySnippet: {
        title: 'Detecting and Resolving Captive Dependencies in ASP.NET Core',
        language: 'csharp',
        code: `// Program.cs validation in Development
var builder = WebApplication.CreateBuilder(args);

builder.Host.UseDefaultServiceProvider((context, options) => {
    options.ValidateScopes = context.HostingEnvironment.IsDevelopment();
    options.ValidateOnBuild = true; // Catches captive dependencies at startup
});

// Resolving Scoped Service from Singleton Background Worker safely:
public class LoanProcessingWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public LoanProcessingWorker(IServiceProvider serviceProvider) => _serviceProvider = serviceProvider;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<LoanDbContext>();
            await dbContext.ProcessPendingApplicationsAsync(stoppingToken);
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }
}`
      },
      proTipOrPitfall: 'Always enable `ValidateScopes` and `ValidateOnBuild` in your development environment to catch captive dependencies during application startup instead of facing silent concurrency crashes in production.',
      studyResources: [
        {
          title: 'Dependency injection in ASP.NET Core',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-05',
    category: 'C# & .NET',
    question: '5. How does ASP.NET Core Middleware Pipeline ordering work, and how do you build custom middleware with ProblemDetails (RFC 7807)?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'ASP.NET Core', 'Middleware', 'ProblemDetails', 'RFC 7807', 'Exception Handling'],
    shortSummary: 'Covers RequestDelegate execution, bidirectional pipeline execution, and standardized ProblemDetails error responses.',
    detailedAnswer: {
      executiveSummary: 'ASP.NET Core middleware forms a bidirectional Russian-doll execution pipeline where each component decides whether to pass requests to the next delegate or short-circuit. Middleware registered first executes first on the incoming request and last on the outgoing response. A Global Exception Handler middleware should sit near the top of the pipeline to catch unhandled exceptions from downstream components and serialize standard RFC 7807 ProblemDetails JSON.',
      keyPoints: [
        'Bidirectional Flow: Middleware runs pre-processing before await next(context), and post-processing afterwards.',
        'Order Criticality: Exception handler -> HttpsRedirection -> Routing -> CORS -> Authentication -> Authorization -> Custom Middleware -> Endpoints.',
        'ProblemDetails (RFC 7807): Standardized error format providing type, title, status, detail, and instance properties.',
        'IExceptionHandler (.NET 8): Modern interface to handle domain exceptions cleanly without monolithic try-catch middleware.'
      ],
      codeOrQuerySnippet: {
        title: 'Custom Global Exception Handler with ProblemDetails (.NET 8)',
        language: 'csharp',
        code: `public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) => _logger = logger;

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Unhandled exception occurred: {Message}", exception.Message);

        var problemDetails = new ProblemDetails
        {
            Status = exception switch
            {
                NotFoundException => StatusCodes.Status404NotFound,
                ValidationException => StatusCodes.Status400BadRequest,
                _ => StatusCodes.Status500InternalServerError
            },
            Title = exception.GetType().Name,
            Detail = exception.Message,
            Instance = httpContext.Request.Path
        };

        httpContext.Response.StatusCode = problemDetails.Status.Value;
        httpContext.Response.ContentType = "application/problem+json";
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}`
      },
      proTipOrPitfall: 'Never write response headers after calling `await next(context)` if a downstream middleware or endpoint has already begun streaming the response body; doing so throws an InvalidOperationException.',
      studyResources: [
        {
          title: 'ASP.NET Core Middleware',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-06',
    category: 'C# & .NET',
    question: '6. How do ThreadPool, TaskScheduler, SemaphoreSlim, and System.Threading.Channels<T> manage high-concurrency throughput in .NET?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'Concurrency', 'ThreadPool', 'Channels<T>', 'SemaphoreSlim', 'High Throughput'],
    shortSummary: 'Covers ThreadPool starvation, work-stealing queues, bounded Channels, and async concurrency throttling.',
    detailedAnswer: {
      executiveSummary: 'The .NET ThreadPool uses a global queue and per-thread local work-stealing queues with a hill-climbing algorithm to inject threads when needed. ThreadPool starvation occurs when blocking calls (e.g. .Wait(), Thread.Sleep()) exhaust worker threads. System.Threading.Channels<T> provides high-throughput, zero-allocation producer-consumer queues supporting backpressure, while SemaphoreSlim throttles async concurrency without blocking OS threads.',
      keyPoints: [
        'ThreadPool Architecture: Hill-climbing algorithm adds 1-2 threads/sec under load; synchronous blocking causes severe throughput latency spikes.',
        'Channels<T>: Bounded channels provide built-in backpressure (Wait, DropOldest, DropWrite) to avoid out-of-memory under burst traffic.',
        'SemaphoreSlim: Use await semaphore.WaitAsync() for asynchronous rate limiting and resource throttling.',
        'Parallel.ForEachAsync (.NET 6+): Modern, memory-efficient way to parallelize async operations with bounded MaxDegreeOfParallelism.'
      ],
      codeOrQuerySnippet: {
        title: 'High-Throughput Producer-Consumer with Bounded Channels<T>',
        language: 'csharp',
        code: `public class MortgageAuditChannelProcessor
{
    private readonly Channel<AuditLogEntry> _channel = Channel.CreateBounded<AuditLogEntry>(
        new BoundedChannelOptions(capacity: 10_000)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = true,
            SingleWriter = false
        });

    public async ValueTask PublishLogAsync(AuditLogEntry entry, CancellationToken ct = default)
    {
        await _channel.Writer.WriteAsync(entry, ct);
    }

    public async Task StartConsumingAsync(Func<AuditLogEntry, Task> handler, CancellationToken ct)
    {
        await foreach (var item in _channel.Reader.ReadAllAsync(ct))
        {
            await handler(item);
        }
    }
}`
      },
      proTipOrPitfall: 'Do not use BlockingCollection<T> in async code paths because it blocks OS threads; always use System.Threading.Channels<T> for modern asynchronous producer-consumer workflows.',
      studyResources: [
        {
          title: 'An Introduction to System.Threading.Channels',
          url: 'https://devblogs.microsoft.com/dotnet/an-introduction-to-system-threading-channels/',
          source: '.NET Blog'
        }
      ]
    }
  },
  {
    id: 'csnet-07',
    category: 'C# & .NET',
    question: '7. What are C# Records, Positional Syntax, Immutability, and Non-Destructive Mutation (with expressions)?',
    difficulty: 'Junior (0-2 YOE)',
    tags: ['C#', 'Records', 'Immutability', 'With Expressions', 'Value Equality'],
    shortSummary: 'Explains record class vs record struct, value-based equality, init-only properties, and with-expression cloning.',
    detailedAnswer: {
      executiveSummary: 'C# Records (introduced in C# 9 and extended in C# 10/11/12) provide concise syntax for immutable data models with built-in value-based equality. Unlike standard classes where Equals compares reference pointers, records synthesize Equals, GetHashCode, and == operators based on all declared properties. They support non-destructive mutation via the `with` expression to create modified shallow copies while preserving original immutability.',
      keyPoints: [
        'Value-Based Equality: Two record instances with identical property values evaluate as equal.',
        'Positional Syntax: `public record LoanQuote(string Id, decimal Rate, decimal Amount);` generates constructor, deconstructor, and init properties.',
        'Non-Destructive Mutation: `var updated = quote with { Rate = 5.25m };` creates a new instance with the altered field.',
        'Record Struct (.NET 6+): Value-type record allocated on stack with value equality and copy semantics.'
      ],
      codeOrQuerySnippet: {
        title: 'C# Record Positional Syntax & Non-Destructive Mutation',
        language: 'csharp',
        code: `public record LoanApplication(
    Guid ApplicationId, 
    string BorrowerName, 
    decimal PrincipalAmount, 
    decimal InterestRate, 
    DateTime CreatedAtUtc);

public class RecordDemo
{
    public void Execute()
    {
        var original = new LoanApplication(Guid.NewGuid(), "Jane Doe", 450000m, 6.5m, DateTime.UtcNow);
        
        // Non-destructive mutation creates new instance:
        var refinanced = original with { InterestRate = 5.75m };

        Console.WriteLine(original == refinanced); // false
        Console.WriteLine(original.BorrowerName == refinanced.BorrowerName); // true
    }
}`
      },
      proTipOrPitfall: 'Remember that `with` expressions perform shallow copies of reference-type properties inside the record. If a property is a mutable List, both record instances will share the same underlying list reference.',
      studyResources: [
        {
          title: 'Records - C# Reference',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-08',
    category: 'C# & .NET',
    question: '8. How do C# Source Generators improve runtime performance over Reflection in .NET 8/9?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'Source Generators', 'Roslyn', 'Reflection', 'Performance', 'AOT'],
    shortSummary: 'Explains compile-time code generation via Roslyn, System.Text.Json source generation, and Native AOT compatibility.',
    detailedAnswer: {
      executiveSummary: 'C# Source Generators execute during compilation as part of the Roslyn compiler pipeline. They inspect user source code and generate additional C# source files directly into the compilation. By moving tasks like JSON serialization, dependency injection, and regex parsing from runtime Reflection/Emit to compile-time generated code, they eliminate reflection overhead, reduce startup latency, and enable Native AOT compatibility.',
      keyPoints: [
        'Compile-Time Execution: Runs before compilation completes; emitted code is compiled directly into the binary.',
        'Zero Runtime Reflection: Eliminates System.Reflection type inspections, dynamic invocations, and JIT emit.',
        'System.Text.Json Source Generator: Attributes like `[JsonSerializable(typeof(LoanDto))]` generate fast direct property writers.',
        'Regex Source Generator: `[GeneratedRegex(@"^[A-Z]{3}-\\d{4}$")]` emits optimized deterministic finite automaton (DFA) code.'
      ],
      codeOrQuerySnippet: {
        title: 'System.Text.Json & Regex Source Generators (.NET 8 C#)',
        language: 'csharp',
        code: `using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

// 1. JSON Source Generator Context for Native AOT & High Performance
[JsonSourceGenerationOptions(WriteIndented = false, PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
[JsonSerializable(typeof(LoanQuoteDto))]
[JsonSerializable(typeof(List<LoanQuoteDto>))]
public partial class LoanJsonContext : JsonSerializerContext { }

// 2. Generated Regex for Zero-Allocation Validation
public static partial class MortgageValidators
{
    [GeneratedRegex(@"^[A-Z]{2}\\d{6}$", RegexOptions.Compiled | RegexOptions.IgnoreCase)]
    public static partial Regex ValidLoanIdRegex();
}`
      },
      proTipOrPitfall: 'Source generators cannot modify existing code; they can only append new source files. Use partial classes and partial methods to wire generated implementations to user declarations.',
      studyResources: [
        {
          title: 'Source Generators in .NET',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/roslyn-sdk/source-generators-overview',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-09',
    category: 'C# & .NET',
    question: '9. How do Expression Trees work in C# LINQ, and how do you construct dynamic predicate filters at runtime?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'LINQ', 'Expression Trees', 'EF Core', 'Dynamic Queries'],
    shortSummary: 'Explains Expression<Func<T, bool>>, AST representation, dynamic parameter binding, and EF Core translation.',
    detailedAnswer: {
      executiveSummary: 'An Expression Tree in C# is a data structure representing abstract syntax tree (AST) code rather than compiled executable IL. While `Func<T, bool>` compiles to executable delegates (in-memory filtering), `Expression<Func<T, bool>>` is analyzed at runtime by LINQ providers (such as EF Core) to translate C# code expressions into SQL SELECT queries. Developers can construct dynamic predicates dynamically using Expression.Lambda, Expression.AndAlso, and Expression.Equal.',
      keyPoints: [
        'Func vs Expression: Func<T> is compiled IL code; Expression<Func<T>> is an AST data structure that can be inspected and transformed.',
        'Provider Translation: EF Core traverses the AST visiting nodes (BinaryExpression, MemberExpression) to generate parameterized SQL.',
        'Dynamic Filtering: Compose dynamic criteria without raw SQL string concatenation, preventing SQL injection.',
        'Compilation: Call `.Compile()` on an expression tree to generate an executable delegate in memory.'
      ],
      codeOrQuerySnippet: {
        title: 'Dynamic Predicate Builder with Expression Trees',
        language: 'csharp',
        code: `public static class DynamicFilterBuilder
{
    public static Expression<Func<T, bool>> BuildEqualityFilter<T>(string propertyName, object value)
    {
        var parameter = Expression.Parameter(typeof(T), "x");
        var property = Expression.Property(parameter, propertyName);
        var constant = Expression.Constant(value, property.Type);
        var comparison = Expression.Equal(property, constant);

        return Expression.Lambda<Func<T, bool>>(comparison, parameter);
    }
}

// Usage in EF Core:
// var filter = DynamicFilterBuilder.BuildEqualityFilter<LoanApplication>("Status", "Approved");
// var approved = await dbContext.Applications.Where(filter).ToListAsync();`
      },
      proTipOrPitfall: 'Compiling expression trees via `.Compile()` is computationally expensive. Cache compiled delegates in a ConcurrentDictionary if you reuse dynamically generated expressions repeatedly.',
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
    id: 'csnet-10',
    category: 'C# & .NET',
    question: '10. How do IHttpClientFactory and Microsoft.Extensions.Http.Resilience (Polly v8) resolve socket exhaustion and implement retry with exponential backoff & circuit breaking?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'HttpClient', 'Polly', 'Socket Exhaustion', 'Resilience', 'Circuit Breaker'],
    shortSummary: 'Explains HttpMessageHandler pooling, DNS rotation, Polly v8 resilience pipelines, and SocketsHttpHandler tuning.',
    detailedAnswer: {
      executiveSummary: 'Instantiating new HttpClient instances with `new HttpClient()` leads to socket exhaustion under load because closed sockets linger in TIME_WAIT state. Conversely, keeping a single static HttpClient indefinitely ignores DNS changes. `IHttpClientFactory` solves both problems by pooling and rotating underlying `HttpMessageHandler` instances (default lifetime 2 mins) while allowing transient client wrappers. In .NET 8, `Microsoft.Extensions.Http.Resilience` integrates Polly v8 directly via `AddStandardResilienceHandler()`.',
      keyPoints: [
        'Socket Exhaustion: New HttpClients deplete OS TCP ephemeral ports; IHttpClientFactory pools underlying sockets.',
        'DNS Refresh: Handlers are recycled periodically to honor DNS changes without terminating active connections.',
        'Polly v8 Resilience: Combines Rate Limiting, Total Request Timeout, Retry with Exponential Jitter, Circuit Breaker, and Attempt Timeout.',
        'Typed Clients: Register strongly-typed API service classes via `services.AddHttpClient<ICreditService, CreditService>()`.'
      ],
      codeOrQuerySnippet: {
        title: 'Polly v8 Standard Resilience Pipeline (.NET 8 C#)',
        language: 'csharp',
        code: `// Program.cs
builder.Services.AddHttpClient<ICreditBureauClient, CreditBureauClient>(client =>
{
    client.BaseAddress = new Uri("https://api.creditbureau.enterprise.com/");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
})
.AddStandardResilienceHandler(options =>
{
    // Configure exponential retry with jitter:
    options.Retry.MaxRetryAttempts = 3;
    options.Retry.BackoffType = DelayBackoffType.Exponential;
    options.Retry.UseJitter = true;

    // Configure Circuit Breaker:
    options.CircuitBreaker.SamplingDuration = TimeSpan.FromSeconds(30);
    options.CircuitBreaker.FailureRatio = 0.5; // Trip if 50% fail
    options.CircuitBreaker.MinimumThroughput = 20;
    options.CircuitBreaker.BreakDuration = TimeSpan.FromSeconds(15);
});`
      },
      proTipOrPitfall: 'Always add randomized jitter to exponential retry delays to prevent the "thundering herd" problem where hundreds of retrying instances slam an recovering downstream server simultaneously.',
      studyResources: [
        {
          title: 'Build resilient HTTP apps with .NET and Polly',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-11',
    category: 'C# & .NET',
    question: '11. What is the Options Pattern (IOptions, IOptionsSnapshot, IOptionsMonitor) in .NET Core configuration?',
    difficulty: 'Junior (0-2 YOE)',
    tags: ['C#', 'Configuration', 'Options Pattern', 'IOptions', 'IOptionsMonitor'],
    shortSummary: 'Covers strongly-typed configuration binding, validation, reload-on-change, and lifetime differences.',
    detailedAnswer: {
      executiveSummary: 'The Options Pattern in .NET binds hierarchical appsettings.json configuration sections to strongly-typed C# POCO classes with validation. It provides three interfaces: `IOptions<T>` (registered as Singleton, read once at startup, no reload), `IOptionsSnapshot<T>` (registered as Scoped, recomputes options per HTTP request, honors runtime reloads in scoped services), and `IOptionsMonitor<T>` (registered as Singleton, supports realtime change notifications via `OnChange` across all lifetimes).',
      keyPoints: [
        'IOptions<T>: Singleton lifetime, cached at startup, does NOT detect config file changes without app restart.',
        'IOptionsSnapshot<T>: Scoped lifetime, re-reads configuration on each request, cannot be injected into Singletons.',
        'IOptionsMonitor<T>: Singleton lifetime, real-time updates via `CurrentValue` and `OnChange` callbacks, safe for Singletons.',
        'DataAnnotation Validation: `services.AddOptions<T>().BindConfiguration("Section").ValidateDataAnnotations().ValidateOnStart();`.'
      ],
      codeOrQuerySnippet: {
        title: 'Options Pattern with Validation & IOptionsMonitor',
        language: 'csharp',
        code: `public class MortgageEngineOptions
{
    [Required, Range(1, 100)]
    public int MaxConcurrentUnderwritings { get; set; } = 10;

    [Required, Url]
    public string CreditApiEndpoint { get; set; } = string.Empty;
}

// Registration in Program.cs:
builder.Services.AddOptions<MortgageEngineOptions>()
    .BindConfiguration("MortgageEngine")
    .ValidateDataAnnotations()
    .ValidateOnStart(); // Fails fast at startup if configuration is invalid

// Usage in Singleton Service:
public class MortgageWorker
{
    private readonly IOptionsMonitor<MortgageEngineOptions> _options;

    public MortgageWorker(IOptionsMonitor<MortgageEngineOptions> options)
    {
        _options = options;
        _options.OnChange(newConfig => {
            Console.WriteLine($"Config reloaded: MaxConcurrent={newConfig.MaxConcurrentUnderwritings}");
        });
    }
}`
      },
      proTipOrPitfall: 'Never inject `IOptionsSnapshot<T>` into a Singleton service; doing so will cause a runtime DI captive dependency exception during container resolution.',
      studyResources: [
        {
          title: 'Options pattern in .NET',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/extensions/options',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-12',
    category: 'C# & .NET',
    question: '12. How do SignalR Hubs enable real-time bidirectional communication and how do you scale SignalR across multiple nodes using Azure SignalR Service or Redis Backplane?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'SignalR', 'WebSockets', 'Real-Time', 'Azure SignalR', 'Redis Backplane'],
    shortSummary: 'Covers WebSockets fallback transport, Hub<T> strongly-typed RPC, connection scaling, and Redis pub/sub backplane.',
    detailedAnswer: {
      executiveSummary: 'ASP.NET Core SignalR provides high-level bidirectional RPC communication between client and server, abstracting underlying transports (WebSockets -> Server-Sent Events -> Long Polling). When scaling out across multiple web server instances behind a load balancer, client connections land on different servers. A backplane (such as Azure SignalR Service or Redis Pub/Sub) routes messages published on one node to clients connected to any other node in the cluster.',
      keyPoints: [
        'Transport Negotiation: Automatically negotiates fastest protocol, favoring persistent duplex WebSockets.',
        'Strongly-Typed Hubs: `Hub<TClientInterface>` enforces compile-time safety on client RPC method names.',
        'Multi-Server Scaling: Multi-node clusters require Azure SignalR Service (managed offload) or Redis Backplane to broadcast across pods.',
        'Groups & Users: Send messages targeting specific users (`Clients.User(id)`), groups (`Clients.Group(name)`), or callers.'
      ],
      codeOrQuerySnippet: {
        title: 'Strongly-Typed SignalR Hub & Client Interface',
        language: 'csharp',
        code: `public interface ILoanRateClient
{
    Task RateUpdated(string state, decimal newRate);
    Task UnderwritingStatusChanged(Guid loanId, string status);
}

public class LoanRateHub : Hub<ILoanRateClient>
{
    public async Task JoinStateMarket(string stateCode)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"State_{stateCode}");
    }

    public async Task BroadcastRateChange(string stateCode, decimal rate)
    {
        // Broadcasts to all connected clients in that group
        await Clients.Group($"State_{stateCode}").RateUpdated(stateCode, rate);
    }
}`
      },
      proTipOrPitfall: 'When using self-hosted SignalR with a Redis backplane, ensure your load balancer enables sticky sessions (cookie affinity) during the initial HTTP negotiation handshake.',
      studyResources: [
        {
          title: 'Overview of ASP.NET Core SignalR',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-13',
    category: 'C# & .NET',
    question: '13. What is the difference between IMemoryCache, IDistributedCache (Redis), and .NET 9 HybridCache?',
    difficulty: 'Mid-Level (3-5 YOE)',
    tags: ['C#', 'Caching', 'HybridCache', 'Redis', 'IMemoryCache', 'Performance'],
    shortSummary: 'Covers in-process L1 memory caching, L2 distributed Redis caching, cache stampede prevention, and HybridCache in .NET 9.',
    detailedAnswer: {
      executiveSummary: 'IMemoryCache stores objects in the process heap with instant sub-microsecond access, but is local to a single pod and lost upon restart. IDistributedCache (Redis/SQL) stores byte arrays in an external shared cache accessible across all cluster nodes, incurring network serialization latency. .NET 9 introduced HybridCache, which unifies L1 (in-process) and L2 (Redis) with built-in cache stampede (thundering herd) locking and tag-based invalidation.',
      keyPoints: [
        'IMemoryCache: Fast L1 in-process caching; susceptible to cache drift across multi-pod deployments.',
        'IDistributedCache: Shared L2 storage; incurs JSON/Protobuf serialization and network I/O per query.',
        'Cache Stampede: Simultaneous requests for expired keys causing DB overload; HybridCache locks requests so only one fetches.',
        'HybridCache (.NET 9): Automatic two-tier caching with atomic factory locking and string tag invalidations.'
      ],
      codeOrQuerySnippet: {
        title: '.NET 9 HybridCache with Stampede Protection',
        language: 'csharp',
        code: `public class MortgageRateService
{
    private readonly HybridCache _hybridCache;
    private readonly ILenderRepository _repository;

    public MortgageRateService(HybridCache hybridCache, ILenderRepository repository)
    {
        _hybridCache = hybridCache;
        _repository = repository;
    }

    public async Task<LenderRateQuote> GetBestRateAsync(string stateCode, CancellationToken ct)
    {
        string cacheKey = $"rate:state:{stateCode.ToUpper()}";

        // HybridCache handles L1 in-memory check, L2 Redis check, and locks DB fetch
        return await _hybridCache.GetOrCreateAsync(
            cacheKey,
            async token => await _repository.CalculateBestRateFromDbAsync(stateCode, token),
            options: new HybridCacheEntryOptions
            {
                Expiration = TimeSpan.FromMinutes(30),
                LocalCacheExpiration = TimeSpan.FromMinutes(5)
            },
            cancellationToken: ct
        );
    }
}`
      },
      proTipOrPitfall: 'When caching mutable objects in IMemoryCache, any modification to the returned object mutates the cached instance directly. Always cache immutable records or return deep clones.',
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
    id: 'csnet-14',
    category: 'C# & .NET',
    question: '14. How do Minimal APIs differ from Controller-based APIs in ASP.NET Core, and when should you choose each?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'Minimal APIs', 'Controllers', 'ASP.NET Core', 'Performance', 'Routing'],
    shortSummary: 'Compares routing engines, overhead, source generation, endpoint filters, and architectural suitability.',
    detailedAnswer: {
      executiveSummary: 'Minimal APIs bypass the heavy MVC Controller model-binding, action invoker, and filter pipelines, binding HTTP routes directly to RequestDelegate lambda handlers using source generators. They offer faster cold starts, ~20-30% higher throughput, smaller memory footprint, and native AOT compatibility. Controller APIs remain advantageous for large legacy systems with hundreds of endpoints and complex shared ActionFilter hierarchies.',
      keyPoints: [
        'Performance & Startup: Minimal APIs use direct endpoint routing without reflection-heavy Controller discovery.',
        'AOT Compatibility: Minimal APIs work seamlessly with Native Ahead-Of-Time compilation in .NET 8/9.',
        'Endpoint Filters: Replace MVC ActionFilters using `AddEndpointFilter` for cross-cutting logging, validation, and auth.',
        'Route Groups: Organize modules cleanly using `app.MapGroup("/api/v1/mortgages").RequireAuthorization()`.'
      ],
      codeOrQuerySnippet: {
        title: 'Modular Minimal API with Route Groups and Endpoint Filters (.NET 8)',
        language: 'csharp',
        code: `public static class LoanEndpointModule
{
    public static RouteGroupBuilder MapLoanEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/{id:guid}", async (Guid id, ILoanService service, CancellationToken ct) =>
        {
            var loan = await service.GetByIdAsync(id, ct);
            return loan is not null ? Results.Ok(loan) : Results.NotFound();
        })
        .WithName("GetLoanById")
        .WithOpenApi()
        .AddEndpointFilter(async (context, next) =>
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await next(context);
            stopwatch.Stop();
            // Custom endpoint metric logging
            return result;
        });

        return group;
    }
}`
      },
      proTipOrPitfall: 'Avoid writing giant 1,000-line Program.cs files when using Minimal APIs. Structure endpoints into modular extension methods using `RouteGroupBuilder` and extension classes.',
      studyResources: [
        {
          title: 'Minimal APIs overview',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-15',
    category: 'C# & .NET',
    question: '15. How do C# Pattern Matching, Switch Expressions, and Property Patterns simplify complex domain validation logic?',
    difficulty: 'Junior (0-2 YOE)',
    tags: ['C#', 'Pattern Matching', 'Switch Expressions', 'Property Patterns', 'Relational Patterns'],
    shortSummary: 'Explains type patterns, relational & logical patterns (and/or/not), property sub-patterns, and exhaustive checking.',
    detailedAnswer: {
      executiveSummary: 'C# 8 through C# 12 introduced comprehensive Pattern Matching capabilities including switch expressions, property patterns, positional patterns, relational operators (<, >=), and logical combinators (and, or, not). These constructs replace deeply nested if-else ladders with declarative, expressive, compiler-checked expressions that guarantee exhaustive matching.',
      keyPoints: [
        'Switch Expressions: Concise functional expression syntax returning a value based on matched pattern.',
        'Property Patterns: Inspect nested properties: `{ Borrower: { CreditScore: >= 740 }, LoanToValue: <= 80 }`.',
        'Relational & Logical: Combine patterns using `and`, `or`, `not`, and comparisons like `>= 0 and <= 100`.',
        'List & Slice Patterns (.NET 7+): Match array structures: `[var first, .., var last]`.'
      ],
      codeOrQuerySnippet: {
        title: 'Domain Risk Scoring using Advanced Pattern Matching',
        language: 'csharp',
        code: `public static class UnderwritingRules
{
    public static RiskTier EvaluateMortgageRisk(LoanApplication app) => app switch
    {
        { CreditScore: >= 760, LoanToValueRatio: <= 0.80m, DebtToIncomeRatio: <= 0.36m } => RiskTier.Prime,
        { CreditScore: >= 680 and < 760, LoanToValueRatio: <= 0.90m } => RiskTier.Standard,
        { CreditScore: < 620 } or { DebtToIncomeRatio: > 0.50m } => RiskTier.Decline,
        { Property: { PropertyType: PropertyType.Condo }, LoanToValueRatio: > 0.85m } => RiskTier.HighRiskCondo,
        _ => RiskTier.ManualReview
    };
}`
      },
      proTipOrPitfall: 'Always provide a fallback discard `_ => ...` in switch expressions unless matching on an exhaustive enum, otherwise an unhandled case throws a `SwitchExpressionException` at runtime.',
      studyResources: [
        {
          title: 'Pattern matching overview - C# guide',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/functional/pattern-matching',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-16',
    category: 'C# & .NET',
    question: '16. How do IHostedService and BackgroundService execute non-blocking long-running tasks in ASP.NET Core, and how do you handle graceful shutdown?',
    difficulty: 'Mid-Level (3-5 YOE)',
    tags: ['C#', 'BackgroundService', 'IHostedService', 'Graceful Shutdown', 'PeriodicTimer'],
    shortSummary: 'Covers background worker lifecycles, CancellationToken handling, HostOptions.ShutdownTimeout, and PeriodicTimer in .NET 6+.',
    detailedAnswer: {
      executiveSummary: '`IHostedService` defines `StartAsync` and `StopAsync` for lifecycle events managed by the .NET Generic Host. `BackgroundService` is an abstract base class implementing `IHostedService` that runs a long-running background task via `ExecuteAsync(CancellationToken)`. When the host shuts down (SIGTERM or container stop), it signals the CancellationToken and waits up to `HostOptions.ShutdownTimeout` (default 30 seconds) for workers to complete cleanup gracefully.',
      keyPoints: [
        'Non-Blocking Startup: StartAsync must return promptly; heavy loops must be offloaded to ExecuteAsync.',
        'PeriodicTimer (.NET 6+): Replaces System.Threading.Timer for async cancellation-safe periodic loops without callback re-entrancy.',
        'Graceful Shutdown: Workers must check `stoppingToken.IsCancellationRequested` and await active transactions.',
        'Scoped Dependencies: BackgroundServices are singletons; create an explicit `IServiceScope` to resolve Scoped services like DbContext.'
      ],
      codeOrQuerySnippet: {
        title: 'Robust BackgroundService with PeriodicTimer and Graceful Shutdown',
        language: 'csharp',
        code: `public class MortgageSettlementProcessor : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<MortgageSettlementProcessor> _logger;

    public MortgageSettlementProcessor(IServiceScopeFactory scopeFactory, ILogger<MortgageSettlementProcessor> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(15));
        _logger.LogInformation("Settlement processor started.");

        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var settlementService = scope.ServiceProvider.GetRequiredService<ISettlementService>();
                await settlementService.ProcessPendingSettlementsAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break; // Graceful shutdown requested
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing batch settlements.");
            }
        }

        _logger.LogInformation("Settlement processor stopped cleanly.");
    }
}`
      },
      proTipOrPitfall: 'Never block inside `StartAsync` with synchronous operations or long tasks, as this blocks the entire .NET Generic Host from starting and prevents HTTP servers from listening on ports.',
      studyResources: [
        {
          title: 'Background tasks with hosted services in ASP.NET Core',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-17',
    category: 'C# & .NET',
    question: '17. How do you implement OpenTelemetry distributed tracing and Serilog structured logging in .NET Core?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'OpenTelemetry', 'Serilog', 'Structured Logging', 'Observability', 'Tracing'],
    shortSummary: 'Explains structured log templates, message templates, correlation IDs, ActivitySource, and OTLP exporters.',
    detailedAnswer: {
      executiveSummary: 'Structured logging captures log events as queryable key-value properties rather than plain text strings. Serilog integrates into ASP.NET Core via `UseSerilog()`, enriching logs with MachineName, Environment, CorrelationId, and W3C TraceId. OpenTelemetry standardizes tracing across HTTP, gRPC, and database calls using `System.Diagnostics.ActivitySource`, transmitting traces and metrics to collectors like Grafana Tempo, Datadog, or Azure App Insights.',
      keyPoints: [
        'Message Templates: Use `@` to serialize objects (`{@Borrower}`) and `_` for scalar values to keep logs queryable.',
        'Serilog Enrichment: Add `Enrich.FromLogContext()` and `Enrich.WithProperty()` for contextual metadata.',
        'W3C TraceContext: Links Serilog logs automatically with OpenTelemetry `TraceId` and `SpanId`.',
        'OTLP Protocol: Standardized OpenTelemetry Protocol (gRPC/HTTP) exports telemetry vendor-neutrally.'
      ],
      codeOrQuerySnippet: {
        title: 'Configuring Serilog & OpenTelemetry in .NET 8 Program.cs',
        language: 'csharp',
        code: `// Serilog Bootstrap Logger
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console(new JsonFormatter())
    .CreateBootstrapLogger();

builder.Host.UseSerilog((ctx, lc) => lc
    .ReadFrom.Configuration(ctx.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}"));

// OpenTelemetry Configuration
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddSource("Enterprise.Mortgage.*")
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddEntityFrameworkCoreInstrumentation()
        .AddOtlpExporter())
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddRuntimeInstrumentation()
        .AddOtlpExporter());`
      },
      proTipOrPitfall: 'Never use string interpolation (`$"User {userId} logged in"`) in logging statements. String interpolation compiles to a single flat string, destroying structured property indexing in log search engines like Elasticsearch/Seq.',
      studyResources: [
        {
          title: 'Logging in .NET and ASP.NET Core',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/extensions/logging',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-18',
    category: 'C# & .NET',
    question: '18. What are C# Primary Constructors (.NET 8) and how do they streamline class and struct dependency declarations?',
    difficulty: 'Junior (0-2 YOE)',
    tags: ['C# 12', '.NET 8', 'Primary Constructors', 'Dependency Injection', 'Boilerplate'],
    shortSummary: 'Covers class and struct primary constructors, parameter scope, field capture, and DI streamlining.',
    detailedAnswer: {
      executiveSummary: 'C# 12 introduced Primary Constructors for all classes and structs (extending the feature first introduced in C# 9 records). Parameters declared on the class header are available throughout the class body (in methods, properties, and initializers). When used with Dependency Injection in ASP.NET Core, primary constructors eliminate repetitive private readonly backing fields and manual constructor assignments.',
      keyPoints: [
        'Parameter Availability: Primary constructor parameters are in scope across all instance methods and field initializers.',
        'Compiler Capture: If referenced inside a method, the compiler automatically generates a hidden private backing field.',
        'Overloaded Constructors: Any explicit constructor declared in the class MUST chain to the primary constructor using `this(...)`.',
        'Syntax Reduction: Cuts boilerplate service declarations by ~50%.'
      ],
      codeOrQuerySnippet: {
        title: 'C# 12 Primary Constructors in ASP.NET Core Service',
        language: 'csharp',
        code: `// Clean, zero-boilerplate DI service using C# 12 Primary Constructor
public class MortgageUnderwritingService(
    ILoanRepository loanRepository,
    ICreditScoringClient creditClient,
    ILogger<MortgageUnderwritingService> logger) : IMortgageUnderwritingService
{
    public async Task<bool> UnderwriteAsync(Guid loanId, CancellationToken ct)
    {
        logger.LogInformation("Starting underwriting for loan {LoanId}", loanId);
        
        var loan = await loanRepository.GetByIdAsync(loanId, ct);
        if (loan == null) return false;

        var score = await creditClient.GetScoreAsync(loan.BorrowerSsn, ct);
        return score >= 680 && loan.LoanToValue <= 0.80m;
    }
}`
      },
      proTipOrPitfall: 'Primary constructor parameters in standard classes are mutable parameters, not properties. If you mutate a parameter, methods referencing it will see the mutated value, unlike records where properties are generated as init-only by default.',
      studyResources: [
        {
          title: 'Primary constructors - C# 12 tutorial',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-12#primary-constructors',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-19',
    category: 'C# & .NET',
    question: '19. How do you implement Health Checks in .NET Core for Kubernetes liveness & readiness probes?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'Health Checks', 'Kubernetes', 'Liveness', 'Readiness', 'DevOps'],
    shortSummary: 'Covers IHealthCheck, database & cache ping checks, /health/live vs /health/ready, and tag filtering.',
    detailedAnswer: {
      executiveSummary: 'ASP.NET Core Health Checks expose HTTP endpoints that external orchestrators (like Kubernetes or Azure App Service) query to determine container health. Kubernetes uses two key probes: Liveness probes (/health/live, checks if process is alive and responsive; failure causes pod restart) and Readiness probes (/health/ready, checks if downstream databases, message queues, and caches are operational; failure removes pod from load balancer traffic).',
      keyPoints: [
        'IHealthCheck Interface: Implement `CheckHealthAsync` returning Healthy, Degraded, or Unhealthy.',
        'Liveness Probe (/health/live): Lightweight self-check returning 200 OK without calling external dependencies.',
        'Readiness Probe (/health/ready): Evaluates connectivity to SQL Server, Redis, and message queues before routing user requests.',
        'Tags: Group checks with tags: `AddCheck("sql", new SqlCheck(), tags: new[] { "ready" })`.'
      ],
      codeOrQuerySnippet: {
        title: 'Kubernetes Liveness & Readiness Health Checks (.NET 8)',
        language: 'csharp',
        code: `// Program.cs
builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy(), tags: new[] { "live" })
    .AddSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")!, name: "sqlserver", tags: new[] { "ready" })
    .AddRedis(builder.Configuration.GetConnectionString("Redis")!, name: "redis", tags: new[] { "ready" });

var app = builder.Build();

// Liveness endpoint (K8s restarts pod if fails)
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live")
});

// Readiness endpoint (K8s stops traffic if fails)
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});`
      },
      proTipOrPitfall: 'Never include external database or third-party API dependencies in the /health/live probe. If your database experiences temporary latency, Kubernetes will restart all your web pods simultaneously, exacerbating the outage.',
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
    id: 'csnet-20',
    category: 'C# & .NET',
    question: '20. What is Native AOT (Ahead-Of-Time) Compilation in .NET 8/9, and what are its constraints regarding Reflection and Dynamic Code?',
    difficulty: 'Principal Architect',
    tags: ['C#', 'Native AOT', '.NET 8', '.NET 9', 'Performance', 'Trimming'],
    shortSummary: 'Covers ahead-of-time machine code compilation, instant startup, trimming warnings, and reflection limits.',
    detailedAnswer: {
      executiveSummary: 'Native AOT compiles .NET C# code directly into architecture-specific machine code binaries ahead of time instead of compiling to Intermediate Language (IL) that requires a runtime JIT. It offers near-instant startup (<10ms), minimal memory footprint (ideal for serverless AWS Lambda / Azure Functions / Kubernetes pods), and eliminates JIT warm-up latency. However, it restricts dynamic code generation (`Reflection.Emit`), unannotated reflection, and dynamic assembly loading.',
      keyPoints: [
        'Zero JIT Overhead: Produces a standalone OS executable without the .NET runtime DLL dependencies.',
        'Trimming & Dead Code Stripping: IL linker removes unused methods to achieve tiny binary sizes (~10MB).',
        'Reflection Warnings: Unregistered dynamic reflection triggers warnings (IL2026/IL3050); resolve using Source Generators or `[DynamicallyAccessedMembers]`.',
        'Use Cases: High-scale microservices, CLI tools, serverless functions, and low-latency financial engines.'
      ],
      codeOrQuerySnippet: {
        title: 'Configuring Native AOT in .csproj and Program.cs',
        language: 'xml',
        code: `<!-- LoanService.csproj -->
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <PublishAot>true</PublishAot>
    <InvariantGlobalization>false</InvariantGlobalization>
  </PropertyGroup>
</Project>`
      },
      secondaryCodeSnippet: {
        title: 'Native AOT Slim Web Application Builder (.NET 8 C#)',
        language: 'csharp',
        code: `var builder = WebApplication.CreateSlimBuilder(args);

// Register AOT-compatible JSON source generator
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
});

var app = builder.Build();
app.MapGet("/api/ping", () => Results.Ok(new PingResponse("Pong", DateTime.UtcNow)));
app.Run();`
      },
      proTipOrPitfall: 'Test Native AOT publishing (`dotnet publish -c Release -r linux-x64`) regularly in your CI pipeline. Never wait until the end of a project, as third-party NuGet packages that rely on unannotated reflection will fail at runtime.',
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
    id: 'csnet-21',
    category: 'C# & .NET',
    question: '21. How do Interlocked operations, Volatile memory barriers, and lock / Monitor ensure thread safety in high-concurrency C# applications?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'Multithreading', 'Interlocked', 'Volatile', 'Memory Barriers', 'Concurrency'],
    shortSummary: 'Explains atomic CPU instructions, compiler/CPU memory reordering, volatile reads/writes, and lock contention.',
    detailedAnswer: {
      executiveSummary: 'Thread safety in .NET spans lock-based and lock-free concurrency. `lock(obj)` acquires an exclusive Monitor on a heap object, causing thread blocking and context switches when contested. `Interlocked` methods (e.g. `Interlocked.Increment`, `Interlocked.CompareExchange`) execute atomic hardware CPU instructions without kernel locks. `Volatile.Read` and `Volatile.Write` prevent the compiler and CPU from reordering instructions across memory barriers.',
      keyPoints: [
        'Interlocked.CompareExchange: Lock-free atomic compare-and-swap (CAS) primitive for implementing lock-free data structures.',
        'Memory Reordering: Modern CPUs and JIT reorder reads and writes for performance; `volatile` keyword enforces acquire/release semantics.',
        'lock (Monitor): Exclusive synchronization; C# 13 introduces a dedicated `System.Threading.Lock` type for improved performance.',
        'SpinWait: Avoids thread sleep/context switch for very short expected hold times before falling back to full OS wait.'
      ],
      codeOrQuerySnippet: {
        title: 'Lock-Free High-Performance Counter with Interlocked',
        language: 'csharp',
        code: `public class HighThroughputMetricsCollector
{
    private long _processedTransactions;
    private long _totalTransactionVolumeDollars;

    public void RecordTransaction(long amountDollars)
    {
        // Atomic hardware-level increments without locks
        Interlocked.Increment(ref _processedTransactions);
        Interlocked.Add(ref _totalTransactionVolumeDollars, amountDollars);
    }

    public (long Count, long Volume) GetSnapshot()
    {
        return (
            Interlocked.Read(ref _processedTransactions),
            Interlocked.Read(ref _totalTransactionVolumeDollars)
        );
    }
}`
      },
      proTipOrPitfall: 'Never lock on public objects, `this`, strings (which may be interned globally across app domains), or value types (which box on every lock attempt). Always lock on a dedicated `private readonly object _lock = new();` or C# 13 `System.Threading.Lock`.',
      studyResources: [
        {
          title: 'Interlocked Class (.NET)',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.threading.interlocked',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-22',
    category: 'C# & .NET',
    question: '22. What is ArrayPool<T> and ObjectPool<T>, and how do they eliminate Gen 0/1/LOH GC allocations in high-volume buffer processing?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'ArrayPool<T>', 'ObjectPool<T>', 'Memory Pooling', 'GC Tuning', 'High Performance'],
    shortSummary: 'Covers ArrayPool<T>.Shared, rent and return patterns, buffer safety, and memory recycling.',
    detailedAnswer: {
      executiveSummary: 'Allocating large byte or char arrays per request floods the GC and can fragment the Large Object Heap (LOH). `ArrayPool<T>.Shared` provides a thread-safe pool of reusable arrays, renting pre-allocated memory buffers and returning them when finished. `ObjectPool<T>` applies the same recycling pattern to complex objects (e.g. StringBuilder, cryptographic encryptors), drastically reducing GC pause times.',
      keyPoints: [
        'ArrayPool<T>.Shared: Thread-safe pool of reusable arrays; `Rent(minSize)` returns an array of at least that size.',
        'Return Protocol: Always return rented arrays inside a `finally` block with `ArrayPool<T>.Shared.Return(rentedArray, clearArray: false/true)`.',
        'ClearArray Flag: Set `clearArray: true` when storing sensitive data (passwords, PII) to zero out memory.',
        'Array Length Warning: `Rent(100)` may return an array of length 128 or 256; always slice using `rentedArray.AsSpan(0, actualLength)`.'
      ],
      codeOrQuerySnippet: {
        title: 'Renting and Slicing Buffers with ArrayPool<T>',
        language: 'csharp',
        code: `public async Task ProcessPayloadStreamAsync(Stream networkStream, int payloadLength, CancellationToken ct)
{
    byte[] buffer = ArrayPool<byte>.Shared.Rent(payloadLength);
    try
    {
        // Always slice to actual payload length since rented buffer may be larger
        Memory<byte> memorySlice = buffer.AsMemory(0, payloadLength);
        await networkStream.ReadExactlyAsync(memorySlice, ct);

        // Process slice with zero GC allocations
        ProcessDecryptedPayload(memorySlice.Span);
    }
    finally
    {
        // Return buffer to pool for reuse by subsequent requests
        ArrayPool<byte>.Shared.Return(buffer, clearArray: true);
    }
}`
      },
      proTipOrPitfall: 'Never hold a reference to an array after returning it to `ArrayPool<T>`, as other threads will immediately receive and overwrite that same memory, leading to silent data corruption.',
      studyResources: [
        {
          title: 'ArrayPool<T> Class in .NET',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.buffers.arraypool-1',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-23',
    category: 'C# & .NET',
    question: '23. How does Dynamic PGO (Profile-Guided Optimization) and Tiered Compilation accelerate .NET 8/9 runtime performance?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'JIT', 'Tiered Compilation', 'Dynamic PGO', 'Performance', 'CLR Internals'],
    shortSummary: 'Explains Tier 0 unoptimized quick JIT, Tier 1 optimized JIT, loop unrolling, guarded devirtualization, and hardware vectorization.',
    detailedAnswer: {
      executiveSummary: '.NET utilizes Tiered Compilation and Dynamic Profile-Guided Optimization (Dynamic PGO). In Tier 0, methods are compiled rapidly with minimal optimizations for fast app startup while instrumenting execution counters. As methods become "hot", the runtime profiles actual type usages and branches, recompiling them at Tier 1 with aggressive loop unrolling, inline caching, and guarded devirtualization (converting interface calls into direct non-virtual invocations).',
      keyPoints: [
        'Tier 0: Fast JIT compilation with instrumentation stubs for instant startup response.',
        'Tier 1 (Re-JIT): Optimizing compiler applies deep inlining and SIMD vectorization after 30+ invocations.',
        'Guarded Devirtualization: Dynamic PGO discovers the most frequent concrete type behind an interface and emits a direct branch.',
        'Default in .NET 8+: Dynamic PGO is enabled by default in .NET 8 and .NET 9, yielding 15-25% higher throughput without code changes.'
      ],
      codeOrQuerySnippet: {
        title: 'Demonstrating Devirtualization with Dynamic PGO',
        language: 'csharp',
        code: `public interface IRateCalculator
{
    decimal Compute(decimal principal);
}

public class StandardRateCalculator : IRateCalculator
{
    public decimal Compute(decimal principal) => principal * 0.05m;
}

// In .NET 8 with Dynamic PGO:
// If StandardRateCalculator is 99% of usages, Tier 1 JIT emits:
// if (calculator is StandardRateCalculator s) return s.Compute(principal); // Inlined direct call!
// else calculator.Compute(principal); // Fallback virtual call`
      },
      proTipOrPitfall: 'Avoid benchmarking micro-benchmarks with a single cold iteration; use BenchmarkDotNet which runs sufficient warmup iterations to allow Tiered Compilation and Dynamic PGO to reach steady-state Tier 1 code generation.',
      studyResources: [
        {
          title: 'Performance Improvements in .NET 8',
          url: 'https://devblogs.microsoft.com/dotnet/performance-improvements-in-net-8/',
          source: '.NET Blog'
        }
      ]
    }
  },
  {
    id: 'csnet-24',
    category: 'C# & .NET',
    question: '24. What are FrozenDictionary<TKey, TValue> and FrozenSet<T> in .NET 8, and when should you use them over standard collections?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', '.NET 8', 'Frozen Collections', 'High Performance', 'Lookup Optimization'],
    shortSummary: 'Explains immutable frozen collections, optimized hash-table perfect hashing, and read-heavy workloads.',
    detailedAnswer: {
      executiveSummary: 'Introduced in .NET 8 in `System.Collections.Frozen`, `FrozenDictionary<TKey, TValue>` and `FrozenSet<T>` are immutable collections optimized for scenarios where a collection is created once at startup and read millions of times without modifications. The creation step analyzes the key set to construct perfect or near-perfect hash tables and optimized lookup strategies, delivering ~30-50% faster reads than `Dictionary<K,V>` or `ImmutableDictionary<K,V>`.',
      keyPoints: [
        'Read Optimization: Lookup operations (`TryGetValue`, `Contains`) are significantly faster than standard Dictionary.',
        'Cost Trade-off: Construction (`ToFrozenDictionary()`) takes longer than creating standard dictionaries because it computes optimal hash strategies.',
        'Use Cases: Route tables, HTTP status lookups, country/currency configuration tables, static mapping dictionaries.',
        'Thread Safety: Completely thread-safe for concurrent read access without locks.'
      ],
      codeOrQuerySnippet: {
        title: 'Using FrozenDictionary for High-Performance Lookup Tables',
        language: 'csharp',
        code: `using System.Collections.Frozen;

public class MortgageRateConfigurationEngine
{
    // Frozen once during application startup
    private static readonly FrozenDictionary<string, decimal> StateAdjustmentRates = 
        new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase)
        {
            ["CA"] = 0.25m,
            ["NY"] = 0.35m,
            ["TX"] = 0.15m,
            ["FL"] = 0.20m,
            ["WA"] = 0.10m
        }.ToFrozenDictionary(StringComparer.OrdinalIgnoreCase);

    public decimal GetStateAdjustment(string stateCode)
    {
        return StateAdjustmentRates.TryGetValue(stateCode, out decimal rate) ? rate : 0.0m;
    }
}`
      },
      proTipOrPitfall: 'Do not use FrozenDictionary for collections that are frequently modified or recreated per request. The expensive hash optimization phase makes frequent creation counterproductive.',
      studyResources: [
        {
          title: 'System.Collections.Frozen in .NET 8',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.collections.frozen',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-25',
    category: 'C# & .NET',
    question: '25. What is SearchValues<T> in .NET 8/9, and how does it vectorize string and byte searches using SIMD instructions?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', '.NET 8', 'SearchValues<T>', 'SIMD', 'Vectorization', 'String Parsing'],
    shortSummary: 'Explains hardware-accelerated searching with SIMD, vectorized character lookups, and ReadOnlySpan.IndexOfAny.',
    detailedAnswer: {
      executiveSummary: '`SearchValues<T>` in .NET 8 provides pre-computed search strategies optimized with SIMD (Single Instruction Multiple Data) hardware vector instructions (AVX2, AVX-512, ARM NEON). When passed to `ReadOnlySpan<T>.IndexOfAny()` or `ContainsAny()`, it evaluates multiple characters or bytes simultaneously in CPU vector registers rather than scanning linearly character-by-character.',
      keyPoints: [
        'SIMD Vectorization: Analyzes character sets to choose the fastest CPU instruction vector table.',
        'Precomputation: `SearchValues.Create("abc123")` builds an immutable search helper once and caches it.',
        'Zero Allocation: Works directly with `ReadOnlySpan<char>` and `ReadOnlySpan<byte>`.',
        'Performance: Up to 10x-20x faster than traditional regex or multiple `IndexOf` checks in URL routing and validation.'
      ],
      codeOrQuerySnippet: {
        title: 'High-Performance Token Validation with SearchValues<char>',
        language: 'csharp',
        code: `using System.Buffers;

public static class SecurityTokenValidator
{
    // Pre-computed vector search values for invalid header characters
    private static readonly SearchValues<char> DisallowedHeaderChars = 
        SearchValues.Create("\r\n\0\t<>\"'");

    public static bool IsValidHeaderValue(ReadOnlySpan<char> headerValue)
    {
        // SIMD hardware-accelerated vector search across the entire span
        return !headerValue.ContainsAny(DisallowedHeaderChars);
    }
}`
      },
      proTipOrPitfall: 'Always store `SearchValues<T>` instances in `static readonly` fields. The initialization calculates vector tables, so recreating them on every method invocation negates the performance benefit.',
      studyResources: [
        {
          title: 'SearchValues<T> Class (.NET 8)',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.buffers.searchvalues-1',
          source: 'Microsoft Learn'
        }
      ]
    }
  }
];
