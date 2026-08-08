export interface CodeSnippetItem {
  title: string;
  language: 'typescript' | 'sql' | 'csharp' | 'html' | 'text' | 'json' | 'xml';
  code: string;
  description?: string;
}

export interface ExternalStudyResource {
  title: string;
  url: string;
  source: string;
  description?: string;
}

export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  difficulty: 'Mid-Level (3-5 YOE)' | 'Senior (6+ YOE)' | 'Staff / Lead Architect' | 'Principal Architect';
  tags: string[];
  shortSummary: string;
  detailedAnswer: {
    executiveSummary: string;
    keyPoints: string[];
    codeOrQuerySnippet?: CodeSnippetItem;
    secondaryCodeSnippet?: CodeSnippetItem;
    codeSnippets?: CodeSnippetItem[];
    proTipOrPitfall: string;
    studyResources?: ExternalStudyResource[];
  };
}

export interface JobRolePreset {
  id: string;
  title: string;
  experienceRequirement: string;
  keyTechnologies: string[];
  domainContext: string;
  rawJobDescription: string;
  questions: InterviewQuestion[];
}

// ============================================================================
// TOP 20 QUESTION BANKS BY SECTION / CATEGORY
// ============================================================================

export const TOP_20_CSHARP_NET: InterviewQuestion[] = [
  {
    id: 'csnet-01',
    category: 'C# & .NET',
    question: '1. How do Async/Await state machines work under the hood in C#/.NET, and how do you prevent thread starvation or deadlocks in legacy .NET sync contexts?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', '.NET 8', 'Async/Await', 'Threading'],
    shortSummary: 'Explains C# async compiler transformations, SynchronizationContext, and Task.ConfigureAwait(false).',
    detailedAnswer: {
      executiveSummary: 'When you mark a method as async, the C# compiler generates a hidden state machine struct implementing IAsyncStateMachine. It splits code around await operators, registering continuations without blocking calling threads.',
      keyPoints: [
        'Compiler Transformation: Replaces async methods with a state machine struct managing execution states (0, 1, -1).',
        'SynchronizationContext: In legacy ASP.NET or UI contexts, await captures context to resume on the original thread.',
        'Deadlock Prevention: Calling .Result or .Wait() synchronously on an uncompleted Task locks the context thread.',
        'Best Practice: Use ConfigureAwait(false) in class libraries to bypass capturing context.'
      ],
      codeOrQuerySnippet: {
        title: 'Thread-Safe Async Pattern (.NET C#)',
        language: 'csharp',
        code: `public async Task<MortgageDto> GetApplicationAsync(int id)
{
    var app = await _dbContext.Applications
        .AsNoTracking()
        .FirstOrDefaultAsync(a => a.Id == id)
        .ConfigureAwait(false);
    return _mapper.Map<MortgageDto>(app);
}`
      },
      secondaryCodeSnippet: {
        title: 'Async Operation with AbortController Signal (TypeScript)',
        language: 'typescript',
        code: `async function fetchMortgageApplication(id: number, signal?: AbortSignal): Promise<MortgageDto> {
  const response = await fetch(\`/api/mortgages/\${id}\`, { signal });
  if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);
  const data: MortgageDto = await response.json();
  return data;
}`
      },
      proTipOrPitfall: 'Avoid "async void" except in top-level event handlers. Always return Task or Task<T>.'
    }
  },
  {
    id: 'csnet-02',
    category: 'C# & .NET',
    question: '2. How does the .NET Garbage Collector (GC) handle Generations (Gen 0, 1, 2, LOH, POH) and how do you prevent memory leaks from unmanaged resources or event subscriptions?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['GC', 'Memory Management', 'Gen0/1/2', 'LOH', 'IDisposable'],
    shortSummary: 'Covers generational GC, Large Object Heap (>85KB), Pinned Object Heap, and IDisposable / WeakReference.',
    detailedAnswer: {
      executiveSummary: 'The .NET GC uses a generational mark-and-sweep algorithm based on the premise that newly allocated objects die young (Gen 0). Long-lived objects transition to Gen 1 and Gen 2. Objects >= 85,000 bytes go directly to the Large Object Heap (LOH).',
      keyPoints: [
        'Gen 0 & Gen 1: Ephemeral generations collected frequently in milliseconds.',
        'Gen 2 & LOH: Full GC collections that freeze execution threads longer; LOH fragmentation requires compaction tuning.',
        'Memory Leaks: Unsubscribed event handlers, static object references, and unclosed database connections prevent GC cleanup.',
        'Resource Cleanup: Implement the standard Dispose pattern (IDisposable / IAsyncDisposable) or use safe handles.'
      ],
      codeOrQuerySnippet: {
        title: 'Standard IDisposable Pattern (C#)',
        language: 'csharp',
        code: `public class FileStreamWrapper : IDisposable
{
    private bool _disposed = false;
    private SafeHandle _handle;

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing) { _handle?.Dispose(); }
            _disposed = true;
        }
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'Angular DestroyRef Subscription Memory Cleanup (TypeScript)',
        language: 'typescript',
        code: `@Component({ selector: 'app-mortgage-stream', template: '' })
export class MortgageStreamComponent {
  private destroyRef = inject(DestroyRef);
  
  constructor(private service: MortgageService) {
    const sub = this.service.rateUpdates$.subscribe(rate => console.log(rate));
    // Unsubscribe when component destroys to prevent memory leaks
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}`
      },
      proTipOrPitfall: 'Pro-Tip: Use memory profiling tools (dotnet-dump, BenchmarkDotNet) to detect LOH allocation spikes.'
    }
  },
  {
    id: 'csnet-03',
    category: 'C# & .NET',
    question: '3. What are the differences between Value Types, Reference Types, Structs, Classes, Ref Structs, and Span<T> / Memory<T> in high-performance C#?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'Span<T>', 'Memory<T>', 'Performance', 'Structs'],
    shortSummary: 'Details allocation semantics on Stack vs Managed Heap, ref structs, and zero-allocation slicing with Span<T>.',
    detailedAnswer: {
      executiveSummary: 'Value types (structs, primitives) live on the stack or inline in containing objects, while reference types (classes) live on the managed heap with GC overhead. Span<T> and ReadOnlySpan<T> provide safe, zero-allocation stack views over contiguous memory.',
      keyPoints: [
        'Span<T>: A stack-only ref struct representing contiguous memory (array, stackalloc, native buffer) without heap allocation.',
        'Memory<T>: A heap-allocatable struct that can outlive stack scopes and be passed into async methods.',
        'Ref Struct Restrictions: Cannot be boxed, captured in lambdas, or used in async methods because it resides strictly on stack.'
      ],
      codeOrQuerySnippet: {
        title: 'Zero-Allocation String Parsing with ReadOnlySpan<char>',
        language: 'csharp',
        code: `public static int ParseYearFromSsn(ReadOnlySpan<char> ssnSpan)
{
    // "123-45-6789" -> slice last 4 digits without allocating string object
    ReadOnlySpan<char> yearSpan = ssnSpan.Slice(7, 4);
    return int.Parse(yearSpan);
}`
      },
      secondaryCodeSnippet: {
        title: 'Zero-Allocation Buffer Slicing with DataView (TypeScript)',
        language: 'typescript',
        code: `function parseHeaderFromBuffer(buffer: ArrayBuffer): { id: number; timestamp: number } {
  // Create typed DataView view over contiguous memory buffer without copying
  const view = new DataView(buffer, 0, 12);
  const id = view.getUint32(0, true);
  const timestamp = view.getFloat64(4, true);
  return { id, timestamp };
}`
      },
      proTipOrPitfall: 'Never pass Span<T> inside async methods—use Memory<T> or ReadOnlyMemory<T> for asynchronous boundary operations.'
    }
  },
  {
    id: 'csnet-04',
    category: 'C# & .NET',
    question: '4. How do Dependency Injection (DI) lifetimes (Transient, Scoped, Singleton) work in .NET Core, and what causes Captive Dependencies?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Dependency Injection', 'Lifetimes', 'Captive Dependencies', 'IoC'],
    shortSummary: 'Explains ServiceLifetime, scoped service resolution in singletons, and IServiceScopeFactory.',
    detailedAnswer: {
      executiveSummary: 'Transient creates a new instance on every request; Scoped creates one instance per HTTP request scope; Singleton creates one instance for the application lifecycle. Captive dependency occurs when a longer-lived service consumes a shorter-lived service.',
      keyPoints: [
        'Captive Dependency Danger: If a Singleton holds a Scoped DbContext, the DbContext never disposes, causing memory leaks and stale tracking.',
        'Validation: .NET Core automatically checks for captive dependencies in Development environment during host startup.',
        'Resolution: Use IServiceScopeFactory inside Singletons to manually create a temporary scope when resolving Scoped services.'
      ],
      codeOrQuerySnippet: {
        title: 'Resolving Scoped Service inside Singleton BackgroundService',
        language: 'csharp',
        code: `public class MortgageWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    public MortgageWorker(IServiceScopeFactory scopeFactory) => _scopeFactory = scopeFactory;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using (var scope = _scopeFactory.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<MortgageDbContext>();
            await dbContext.ProcessPendingApplicationsAsync();
        }
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'Angular InjectionToken & Custom Scope Providers (TypeScript)',
        language: 'typescript',
        code: `export const MORTGAGE_CONFIG = new InjectionToken<MortgageConfig>('MORTGAGE_CONFIG');

export const appConfigProvider: Provider = {
  provide: MORTGAGE_CONFIG,
  useFactory: () => ({ apiBaseUrl: 'https://api.mortgage.com', timeoutMs: 5000 }),
  deps: []
};`
      },
      proTipOrPitfall: 'Pro-Tip: Always register DbContext as Scoped in ASP.NET Core web applications.'
    }
  },
  {
    id: 'csnet-05',
    category: 'C# & .NET',
    question: '5. How does ASP.NET Core Middleware Pipeline ordering work, and how do you build custom middleware for global exception handling using ProblemDetails (RFC 7807)?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['ASP.NET Core', 'Middleware', 'ProblemDetails', 'Error Handling'],
    shortSummary: 'Covers HTTP request pipeline delegation, next.Invoke(), and standardized RFC 7807 exception responses.',
    detailedAnswer: {
      executiveSummary: 'The ASP.NET Core HTTP request pipeline consists of a chain of request delegates invoked in sequence (Russian nesting doll model). Middleware placed earlier in Program.cs wraps subsequent middleware, executing pre-processing before calling next.Invoke() and post-processing after it returns. Global exception handling middleware or .NET 8 IExceptionHandler must be registered at the very beginning of the pipeline to capture uncaught downstream exceptions and render a standardized RFC 7807 ProblemDetails payload.',
      keyPoints: [
        'Pipeline Ordering Rule: Middleware runs in exact sequence of app.Use...() calls. Exception handling & HTTPS redirection must precede Authentication, Authorization, Cors, and Endpoint Routing.',
        'Short-Circuiting: Middleware can terminate the request early by returning without invoking next(context) (e.g., authentication failure or caching hit).',
        'ProblemDetails RFC 7807 Standard: Standardized JSON schema for HTTP machine-readable errors containing type, title, status, detail, instance, and custom extensions.',
        '.NET 8 IExceptionHandler: Cleaner modern alternative to custom middleware that implements IExceptionHandler, registered via builder.Services.AddExceptionHandler<GlobalExceptionHandler>() and app.UseExceptionHandler().'
      ],
      codeOrQuerySnippet: {
        title: 'Custom Exception Handler (.NET 8 IExceptionHandler & ProblemDetails RFC 7807)',
        language: 'csharp',
        code: `// 1. Implementation of IExceptionHandler
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;
    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) => _logger = logger;

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken ct)
    {
        _logger.LogError(exception, "Unhandled Exception: {Message}", exception.Message);

        var problemDetails = new ProblemDetails
        {
            Status = exception switch
            {
                KeyNotFoundException => StatusCodes.Status404NotFound,
                UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
                ArgumentException => StatusCodes.Status400BadRequest,
                _ => StatusCodes.Status500InternalServerError
            },
            Title = exception switch
            {
                KeyNotFoundException => "Resource Not Found",
                UnauthorizedAccessException => "Unauthorized Access",
                ArgumentException => "Invalid Request Payload",
                _ => "Internal Server Error"
            },
            Type = "https://tools.ietf.org/html/rfc7807",
            Detail = exception.Message,
            Instance = httpContext.Request.Path
        };

        // Add custom extensions
        problemDetails.Extensions["traceId"] = httpContext.TraceIdentifier;
        problemDetails.Extensions["timestamp"] = DateTime.UtcNow;

        httpContext.Response.StatusCode = problemDetails.Status.Value;
        httpContext.Response.ContentType = "application/problem+json";
        await httpContext.Response.WriteAsJsonAsync(problemDetails, ct);

        return true; // Exception marked as handled
    }
}

// 2. Middleware Pipeline Ordering in Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

// CRITICAL PIPELINE ORDER:
app.UseExceptionHandler(); // 1. Exception handling FIRST to catch all downstream errors
app.UseHttpsRedirection(); // 2. HTTPS Redirection
app.UseRouting();          // 3. Endpoint Routing
app.UseCors();             // 4. CORS Policy
app.UseAuthentication();   // 5. Authentication
app.UseAuthorization();    // 6. Authorization
app.MapControllers();      // 7. Endpoints`
      },
      secondaryCodeSnippet: {
        title: 'Angular HttpInterceptor Handling RFC 7807 ProblemDetails (TypeScript)',
        language: 'typescript',
        code: `import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  traceId?: string;
  [key: string]: any;
}

export const problemDetailsInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.error && (error.error.type || error.error.title || error.error.status)) {
        const pd = error.error as ProblemDetails;
        console.error(\`[RFC 7807 Error \${pd.status}]: \${pd.title} - \${pd.detail} (TraceId: \${pd.traceId})\`);
      }
      return throwError(() => error);
    })
  );
};`
      },
      proTipOrPitfall: 'Pitfall: Placing app.UseAuthentication() before app.UseRouting() in older .NET versions or placing app.UseExceptionHandler() after app.MapControllers() will cause uncaught exceptions to crash the response stream without RFC 7807 formatting.'
    }
  },
  {
    id: 'csnet-06',
    category: 'C# & .NET',
    question: '6. How do ThreadPool, TaskScheduler, SemaphoreSlim, and Channels<T> manage high-concurrency throughput in .NET?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Concurrency', 'Channels<T>', 'SemaphoreSlim', 'ThreadPool'],
    shortSummary: 'Explains producer-consumer queueing with System.Threading.Channels and concurrency rate limiting.',
    detailedAnswer: {
      executiveSummary: 'Channels<T> provides a high-throughput, zero-allocation async producer-consumer data structure ideal for thread-safe background queuing.',
      keyPoints: [
        'SemaphoreSlim: Async-compatible synchronization primitive for throttling maximum concurrent operations.',
        'System.Threading.Channels: Unbounded or Bounded queues with backpressure support for async background workers.',
        'ThreadPool Starvation: Avoid blocking ThreadPool threads with Thread.Sleep or .Result.'
      ],
      codeOrQuerySnippet: {
        title: 'High Performance Bounded Channel Producer/Consumer',
        language: 'csharp',
        code: `var channel = Channel.CreateBounded<LoanApplicationEvent>(new BoundedChannelOptions(1000) {
    FullMode = BoundedChannelFullMode.Wait,
    SingleReader = true
});

// Producer
await channel.Writer.WriteAsync(new LoanApplicationEvent(loanId));

// Consumer
await foreach (var evt in channel.Reader.ReadAllAsync()) {
    await ProcessLoanEventAsync(evt);
}`
      },
      proTipOrPitfall: 'Use Bounded channels to enforce backpressure and prevent OutOfMemoryException during traffic spikes.'
    }
  },
  {
    id: 'csnet-07',
    category: 'C# & .NET',
    question: '7. What are C# Records, Positional Syntax, Immutability, and Non-Destructive Mutation (with expressions)?',
    difficulty: 'Junior (0-2 YOE)',
    tags: ['C# 9+', 'Records', 'Immutability', 'With Expression'],
    shortSummary: 'Details record class vs record struct, value-based equality, and non-destructive with mutation.',
    detailedAnswer: {
      executiveSummary: 'Records introduce value-based equality semantically while being immutable by default. Positional syntax auto-generates init-only properties, Deconstruct(), and operator == / != implementation.',
      keyPoints: [
        'Value Equality: Two record instances with identical property values evaluate as equal (==).',
        'With Expression: Creates a shallow copy with modified fields without mutating original object.',
        'Record Struct: Offers value-type record semantics for zero-heap allocations.'
      ],
      codeOrQuerySnippet: {
        title: 'C# Record Non-Destructive Mutation',
        language: 'csharp',
        code: `public record MortgageRate(string Tier, decimal Rate, DateTime EffectiveDate);

var originalRate = new MortgageRate("Conventional", 6.5m, DateTime.Today);
var updatedRate = originalRate with { Rate = 6.25m }; // Original remains untouched`
      },
      proTipOrPitfall: 'Use record DTOs for thread-safe message passing across async worker threads.'
    }
  },
  {
    id: 'csnet-08',
    category: 'C# & .NET',
    question: '8. How do C# Source Generators improve runtime performance over Reflection in .NET 8/9?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Source Generators', 'Reflection', 'System.Text.Json', 'Native AOT'],
    shortSummary: 'Explains compile-time code generation, AOT trimming compatibility, and JSON serializer source generation.',
    detailedAnswer: {
      executiveSummary: 'Source Generators run during C# compilation to inspect code and generate additional source files, eliminating reflection runtime overhead and enabling Native AOT compilation.',
      keyPoints: [
        'Zero Reflection Overhead: Generates static serialization / mapping code at compile-time.',
        'System.Text.Json Source Generator: Drastically reduces cold-start latency and memory usage.',
        'Native AOT: Essential for containerized microservices requiring instant startup (<10ms).'
      ],
      codeOrQuerySnippet: {
        title: 'System.Text.Json Context Source Generator',
        language: 'csharp',
        code: `[JsonSerializable(typeof(MortgageApplicationDto))]
public partial class AppJsonContext : JsonSerializerContext { }

// Usage in API handler (No Reflection)
var json = JsonSerializer.Serialize(appDto, AppJsonContext.Default.MortgageApplicationDto);`
      },
      proTipOrPitfall: 'Always adopt System.Text.Json Source Generators when deploying to Azure Container Apps or AWS Lambda.'
    }
  },
  {
    id: 'csnet-09',
    category: 'C# & .NET',
    question: '9. How do Expression Trees work in C# LINQ, and how do you construct dynamic predicate filters at runtime?',
    difficulty: 'Staff / Lead Architect',
    tags: ['LINQ', 'Expression Trees', 'Dynamic Queries', 'EF Core'],
    shortSummary: 'Compares Func<T, bool> delegate in-memory filtering vs Expression<Func<T, bool>> SQL translation.',
    detailedAnswer: {
      executiveSummary: 'Expression<Func<T, bool>> represents code as data structure (AST). EF Core parses Expression Trees to translate LINQ queries into native SQL queries.',
      keyPoints: [
        'Func vs Expression: Func executes compiled C# code in memory; Expression is compiled into AST for external translators.',
        'Dynamic Predicate Building: Use PredicateBuilder or Expression.AndAlso to dynamically compose filter conditions at runtime.'
      ],
      codeOrQuerySnippet: {
        title: 'Dynamic Expression Tree Construction',
        language: 'csharp',
        code: `public static Expression<Func<Loan, bool>> BuildLoanFilter(decimal minAmount, string status)
{
    var param = Expression.Parameter(typeof(Loan), "l");
    var amountProp = Expression.Property(param, "Amount");
    var amountValue = Expression.Constant(minAmount);
    var body = Expression.GreaterThanOrEqual(amountProp, amountValue);

    return Expression.Lambda<Func<Loan, bool>>(body, param);
}`
      },
      proTipOrPitfall: 'Passing Func<T, bool> into EF Core repository methods forces client-side evaluation, fetching entire DB tables into RAM.'
    }
  },
  {
    id: 'csnet-10',
    category: 'C# & .NET',
    question: '10. How do IHttpClientFactory and Polly policies resolve socket exhaustion and implement retry with exponential backoff & circuit breaking?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['IHttpClientFactory', 'Polly', 'Resilience', 'Socket Exhaustion'],
    shortSummary: 'Covers HttpClient connection pooling, DelegatingHandler, and Polly v8 ResiliencePipelines.',
    detailedAnswer: {
      executiveSummary: 'Instantiating `new HttpClient()` per request causes TIME_WAIT socket exhaustion. IHttpClientFactory manages underlying HttpMessageHandler lifecycles, and integrates with Polly for resilience.',
      keyPoints: [
        'Socket Exhaustion: Reusing HttpMessageHandler prevents consuming all available OS sockets.',
        'Polly v8 Resilience Pipelines: Combine Retry, Timeout, Rate Limiter, and Circuit Breakers in a pipeline.',
        'DelegatingHandler: Custom HTTP middleware pipeline for outbound client requests.'
      ],
      codeOrQuerySnippet: {
        title: 'Polly v8 Resilience Pipeline Integration',
        language: 'csharp',
        code: `services.AddHttpClient("CreditBureauClient")
    .AddResilienceHandler("credit-pipeline", builder => {
        builder.AddRetry(new RetryStrategyOptions {
            MaxRetryAttempts = 3,
            Delay = TimeSpan.FromSeconds(2),
            BackoffType = DelayBackoffType.Exponential
        });
        builder.AddCircuitBreaker(new CircuitBreakerStrategyOptions {
            FailureRatio = 0.5,
            SamplingDuration = TimeSpan.FromSeconds(10)
        });
    });`
      },
      proTipOrPitfall: 'Never instantiate HttpClient inside short-lived using statements in loops.'
    }
  },
  {
    id: 'csnet-11',
    category: 'C# & .NET',
    question: '11. What is the Option Pattern (IOptions, IOptionsSnapshot, IOptionsMonitor) in .NET Core configuration?',
    difficulty: 'Junior (0-2 YOE)',
    tags: ['Configuration', 'IOptions', 'IOptionsMonitor', 'Strongly Typed Config'],
    shortSummary: 'Compares static Singleton config vs Scoped reloadable config vs dynamic change notifications.',
    detailedAnswer: {
      executiveSummary: 'The Option pattern binds appsettings.json sections to strongly-typed C# classes. IOptions is Singleton; IOptionsSnapshot is Scoped and reloads per request; IOptionsMonitor is Singleton with live change events.',
      keyPoints: [
        'IOptions<T>: Registered as Singleton, calculated once at app startup.',
        'IOptionsSnapshot<T>: Re-evaluated per HTTP request when appsettings.json changes.',
        'IOptionsMonitor<T>: Provides OnChange event callback for instant real-time configuration updates.'
      ],
      codeOrQuerySnippet: {
        title: 'Strongly Typed Configuration Injection',
        language: 'csharp',
        code: `builder.Services.Configure<AzureServiceBusOptions>(
    builder.Configuration.GetSection("AzureServiceBus"));

public class OrderService {
    private readonly AzureServiceBusOptions _options;
    public OrderService(IOptions<AzureServiceBusOptions> options) => _options = options.Value;
}`
      },
      proTipOrPitfall: 'Use DataAnnotations or ValidateOnStart() to validate appsettings at boot time.'
    }
  },
  {
    id: 'csnet-12',
    category: 'C# & .NET',
    question: '12. How do SignalR Hubs enable real-time bidirectional communication and how do you scale SignalR across multiple nodes using Azure SignalR Service?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['SignalR', 'WebSockets', 'Azure SignalR', 'Real-Time'],
    shortSummary: 'Explains WebSockets fallback to Server-Sent Events/Long Polling and backplane scaling.',
    detailedAnswer: {
      executiveSummary: 'SignalR abstracts real-time web transport layer (WebSockets, SSE, Long Polling). When scaling out across multiple web servers, Azure SignalR Service acts as a centralized connection offloader & message backplane.',
      keyPoints: [
        'Transport Fallback: Automatically negotiates WebSockets -> SSE -> Long Polling.',
        'Azure SignalR Service: Removes connection state from app servers, allowing stateless scaling.'
      ],
      codeOrQuerySnippet: {
        title: 'SignalR Strongly Typed Hub (.NET 8)',
        language: 'csharp',
        code: `public interface ILoanClient {
    Task ReceiveStatusUpdate(string loanId, string status);
}

public class LoanHub : Hub<ILoanClient> {
    public async Task JoinLoanGroup(string loanId) => await Groups.AddToGroupAsync(Context.ConnectionId, loanId);
}`
      },
      proTipOrPitfall: 'Always use strongly-typed `Hub<T>` interfaces to eliminate magic string method names.'
    }
  },
  {
    id: 'csnet-13',
    category: 'C# & .NET',
    question: '13. What is the difference between MemoryCache and DistributedCache (Redis) in .NET Core?',
    difficulty: 'Mid-Level (3-5 YOE)',
    tags: ['Caching', 'IMemoryCache', 'IDistributedCache', 'Redis'],
    shortSummary: 'Compares in-process RAM caching vs multi-node shared Redis caching.',
    detailedAnswer: {
      executiveSummary: 'IMemoryCache stores data in app process memory (fastest, but lost on app restart or not shared across multi-node server farms). IDistributedCache uses an out-of-process store like Redis or SQL Server.',
      keyPoints: [
        'IMemoryCache: Zero network latency, subject to process GC memory limits.',
        'IDistributedCache: Requires serialization (JSON/Protobuf), guarantees data consistency across load-balanced nodes.'
      ],
      codeOrQuerySnippet: {
        title: 'Redis Distributed Cache Implementation',
        language: 'csharp',
        code: `public async Task<T?> GetOrSetCacheAsync<T>(string key, Func<Task<T>> factory)
{
    var bytes = await _cache.GetAsync(key);
    if (bytes != null) return JsonSerializer.Deserialize<T>(bytes);

    var data = await factory();
    await _cache.SetAsync(key, JsonSerializer.SerializeToUtf8Bytes(data), new DistributedCacheEntryOptions {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
    });
    return data;
}`
      },
      proTipOrPitfall: 'Always set AbsoluteExpirationRelativeToNow to prevent cache memory growth.'
    }
  },
  {
    id: 'csnet-14',
    category: 'C# & .NET',
    question: '14. How do Minimal APIs differ from Controller-based APIs in ASP.NET Core, and when should you choose each?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Minimal API', 'Controllers', 'ASP.NET Core', 'Performance'],
    shortSummary: 'Compares light endpoint mapping vs traditional MVC controller convention overhead.',
    detailedAnswer: {
      executiveSummary: 'Minimal APIs eliminate controller boilerplate by binding lambdas directly to HTTP endpoints, reducing allocation overhead and improving request routing speed.',
      keyPoints: [
        'Minimal API: Lower memory footprint, excellent for microservices and Native AOT.',
        'Controller APIs: Superior for massive legacy monoliths with complex filter pipelines.'
      ],
      codeOrQuerySnippet: {
        title: 'Minimal API Route with TypedResults (.NET 8)',
        language: 'csharp',
        code: `app.MapGet("/api/loans/{id:int}", async (int id, MortgageDbContext db) =>
{
    var loan = await db.Loans.FindAsync(id);
    return loan is not null ? Results.Ok(loan) : Results.NotFound();
}).WithName("GetLoanById").WithTags("Loans");`
      },
      proTipOrPitfall: 'Use TypedResults in Minimal APIs for automatic OpenAPI / Swagger documentation generation.'
    }
  },
  {
    id: 'csnet-15',
    category: 'C# & .NET',
    question: '15. How do C# Pattern Matching, Switch Expressions, and Property Patterns simplify complex domain validation logic?',
    difficulty: 'Junior (0-2 YOE)',
    tags: ['C#', 'Pattern Matching', 'Switch Expressions'],
    shortSummary: 'Explains pattern matching syntax, relational patterns, and positional patterns.',
    detailedAnswer: {
      executiveSummary: 'Pattern matching provides expressive, concise syntax for evaluating object shapes, property conditions, and types in switch expressions.',
      keyPoints: [
        'Property Patterns: Matches nested object attributes inline.',
        'Relational & Logical Patterns: Combines operators (`and`, `or`, `not`, `>`, `<`).'
      ],
      codeOrQuerySnippet: {
        title: 'Switch Expression Property Pattern Matching',
        language: 'csharp',
        code: `public static decimal CalculateMortgageFee(LoanApplication app) => app switch {
    { CreditScore: >= 740, LoanAmount: < 500000 } => 250m,
    { CreditScore: < 620 } => 1500m,
    { Property.State: "CA" or "NY" } => 750m,
    _ => 500m
};`
      },
      proTipOrPitfall: 'Compiler warns if switch expressions do not cover all enum or domain cases.'
    }
  },
  {
    id: 'csnet-16',
    category: 'C# & .NET',
    question: '16. How do IHostedService and BackgroundService execute non-blocking long-running tasks in ASP.NET Core?',
    difficulty: 'Mid-Level (3-5 YOE)',
    tags: ['BackgroundService', 'IHostedService', 'Worker Service'],
    shortSummary: 'Explains asynchronous background worker loops and cancellation token handling.',
    detailedAnswer: {
      executiveSummary: 'BackgroundService is an abstract base class implementing IHostedService that provides a dedicated background thread execution loop.',
      keyPoints: [
        'Cancellation Token: Always pass CancellationToken into async operations to allow graceful app shutdown.',
        'Exception Handling: Unhandled exceptions in BackgroundService can crash the entire host process unless configured.'
      ],
      codeOrQuerySnippet: {
        title: 'Robust BackgroundService with Shutdown Handling',
        language: 'csharp',
        code: `public class QueueProcessor : BackgroundService {
    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
        while (!stoppingToken.IsCancellationRequested) {
            await ProcessNextBatchAsync();
            await Task.Delay(5000, stoppingToken);
        }
    }
}`
      },
      proTipOrPitfall: 'Handle TaskCanceledException gracefully inside the main worker while loop.'
    }
  },
  {
    id: 'csnet-17',
    category: 'C# & .NET',
    question: '17. How do you implement OpenTelemetry distributed tracing and Serilog structured logging in .NET Core?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['OpenTelemetry', 'Logging', 'Serilog', 'Tracing'],
    shortSummary: 'Covers Trace ID propagation, structured log templates, and OTLP exporters.',
    detailedAnswer: {
      executiveSummary: 'OpenTelemetry standardizes telemetry collection (Traces, Metrics, Logs) across distributed microservices. Serilog provides message templates for structured JSON searching.',
      keyPoints: [
        'Structured Logging: Log parameters with message templates (`LogInformation("Order {OrderId}", id)`).',
        'Trace Propagation: Automatically injects W3C traceparent headers across HTTP and Service Bus calls.'
      ],
      codeOrQuerySnippet: {
        title: 'Serilog & OpenTelemetry Configuration',
        language: 'csharp',
        code: `builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddOtlpExporter());`
      },
      proTipOrPitfall: 'Never use string interpolation (`$"User {userId}"`) in log messages, which breaks log property indexing.'
    }
  },
  {
    id: 'csnet-18',
    category: 'C# & .NET',
    question: '18. What are C# Primary Constructors (.NET 8) and how do they streamline class and struct dependency declarations?',
    difficulty: 'Junior (0-2 YOE)',
    tags: ['C# 12', 'Primary Constructors', '.NET 8'],
    shortSummary: 'Covers inline parameters on class signatures and field scope implications.',
    detailedAnswer: {
      executiveSummary: 'Primary constructors allow declaring constructor parameters directly on class or struct headers, capturing parameters across the entire class body.',
      keyPoints: [
        'Concise Syntax: Reduces boilerplate field declarations and constructor definitions.',
        'Captured State: Primary constructor parameters are available throughout the class scope.'
      ],
      codeOrQuerySnippet: {
        title: 'C# 12 Primary Constructor Class',
        language: 'csharp',
        code: `public class MortgageService(IMortgageRepository repo, ILogger<MortgageService> logger)
{
    public async Task<LoanDto> GetLoanAsync(int id) {
        logger.LogInformation("Fetching loan {LoanId}", id);
        return await repo.GetByIdAsync(id);
    }
}`
      },
      proTipOrPitfall: 'Primary constructor parameters are mutable inside class scope unless assigned to `readonly` fields.'
    }
  },
  {
    id: 'csnet-19',
    category: 'C# & .NET',
    question: '19. How do you implement Health Checks in .NET Core for Kubernetes liveness & readiness probes?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Health Checks', 'Kubernetes', 'Probes', 'DevOps'],
    shortSummary: 'Explains /health/live vs /health/ready endpoint segregation.',
    detailedAnswer: {
      executiveSummary: 'Kubernetes uses Liveness probes (is app running?) and Readiness probes (is app ready to accept traffic, e.g. DB connected?). ASP.NET Core Health Checks provide customized check endpoints.',
      keyPoints: [
        'Liveness Endpoint (/health/live): Basic 200 OK ping indicating process is alive.',
        'Readiness Endpoint (/health/ready): Verifies database, cache, and downstream dependencies are connected.'
      ],
      codeOrQuerySnippet: {
        title: 'Health Check Registration (.NET 8)',
        language: 'csharp',
        code: `builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString, name: "sql-db")
    .AddRedis(redisConnectionString, name: "redis");

app.MapHealthChecks("/health/ready", new HealthCheckOptions {
    Predicate = check => check.Tags.Contains("ready")
});`
      },
      proTipOrPitfall: 'Do not run slow DB queries inside frequent Liveness probes.'
    }
  },
  {
    id: 'csnet-20',
    category: 'C# & .NET',
    question: '20. What is Native AOT (Ahead-Of-Time) Compilation in .NET 8/9, and what are its constraints regarding Reflection and Dynamic Code?',
    difficulty: 'Principal Architect',
    tags: ['Native AOT', 'Performance', 'Compilation', 'Trimming'],
    shortSummary: 'Explains machine code compilation, instant boot, smaller footprint, and trimming warnings.',
    detailedAnswer: {
      executiveSummary: 'Native AOT compiles .NET C# directly into architecture-specific machine code at build time, bypassing the JIT compiler for instant startup and low memory usage.',
      keyPoints: [
        'No JIT Compilation: Bypasses JIT runtime overhead.',
        'Trimming Limitations: Dynamic Reflection and System.Reflection.Emit are unsupported or cause build warnings.'
      ],
      codeOrQuerySnippet: {
        title: 'Enabling Native AOT in .csproj',
        language: 'xml',
        code: `<PropertyGroup>
  <PublishAot>true</PublishAot>
  <InvariantGlobalization>true</InvariantGlobalization>
</PropertyGroup>`
      },
      proTipOrPitfall: 'Test all third-party NuGet packages for trimming compatibility before enabling PublishAot.'
    }
  }
];

export const TOP_20_TSQL_EF: InterviewQuestion[] = [
  {
    id: 'ef-01',
    category: 'T-SQL & Entity Framework',
    question: '1. How do you detect and resolve the N+1 query problem in Entity Framework Core, and when should you bypass ORMs for raw T-SQL stored procedures?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['EF Core', 'N+1', 'T-SQL', 'Performance'],
    shortSummary: 'Covers eager loading (.Include), projection (.Select), and stored procedure fallback.',
    detailedAnswer: {
      executiveSummary: 'N+1 occurs when querying a parent collection triggers N individual database queries for child entities. Fix it using eager loading (.Include()) or LINQ projections (.Select()).',
      keyPoints: [
        'Detection: Profiling via MiniProfiler, EF Core Logging, or SQL Profiler.',
        'EF Fix: Select DTOs directly so EF generates a single JOIN query.'
      ],
      codeOrQuerySnippet: {
        title: 'EF Core Projection Fix',
        language: 'csharp',
        code: `var loans = await db.Loans.AsNoTracking()
    .Select(l => new LoanSummaryDto { Id = l.Id, Borrower = l.Borrower.Name })
    .ToListAsync();`
      },
      proTipOrPitfall: 'Always use .AsNoTracking() for read-only queries in EF Core.'
    }
  },
  {
    id: 'ef-02',
    category: 'T-SQL & Entity Framework',
    question: '2. What are Clustered vs Non-Clustered Indexes in SQL Server, and how do Covering Indexes and Filtered Indexes prevent Key Lookups?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['T-SQL', 'Indexes', 'SQL Server', 'Performance'],
    shortSummary: 'Explains B-Tree leaf node data storage, INCLUDE columns, and filtered WHERE clauses.',
    detailedAnswer: {
      executiveSummary: 'A Clustered Index defines the physical sort order of data on disk (1 per table). Non-Clustered Indexes contain pointer references to the clustered index key. Covering Indexes add INCLUDED columns to avoid Key Lookups.',
      keyPoints: [
        'Clustered Index: Leaf nodes ARE the table data rows.',
        'Covering Index: Uses `INCLUDE (ColA, ColB)` so the query engine retrieves all needed columns directly from index leaf nodes.'
      ],
      codeOrQuerySnippet: {
        title: 'T-SQL Covering Index with INCLUDE',
        language: 'sql',
        code: `CREATE NONCLUSTERED INDEX IX_Loans_Status_Date
ON dbo.Loans (Status, CreatedDate)
INCLUDE (BorrowerId, Amount);`
      },
      proTipOrPitfall: 'Avoid over-indexing tables with high write throughput.'
    }
  },
  {
    id: 'ef-03',
    category: 'T-SQL & Entity Framework',
    question: '3. What are Transaction Isolation Levels (Read Uncommitted, Read Committed, Snapshot Isolation, Serializable) in SQL Server?',
    difficulty: 'Staff / Lead Architect',
    tags: ['SQL Server', 'Transactions', 'Snapshot Isolation', 'ACID'],
    shortSummary: 'Compares Dirty Reads, Non-Repeatable Reads, Phantom Reads, and Row Versioning.',
    detailedAnswer: {
      executiveSummary: 'Isolation levels dictate how locking and row versioning isolate concurrently running transactions.',
      keyPoints: [
        'Read Committed Snapshot Isolation (RCSI): Uses tempdb row versioning to eliminate read-write blocking.',
        'Serializable: Highest isolation level; prevents dirty, non-repeatable, and phantom reads via key-range locks.'
      ],
      codeOrQuerySnippet: {
        title: 'Enabling RCSI in SQL Server',
        language: 'sql',
        code: `ALTER DATABASE MortgageDb SET READ_COMMITTED_SNAPSHOT ON WITH ROLLBACK IMMEDIATE;`
      },
      proTipOrPitfall: 'Enable RCSI on high-concurrency OLTP databases to prevent readers blocking writers.'
    }
  },
  {
    id: 'ef-04',
    category: 'T-SQL & Entity Framework',
    question: '4. How do you analyze SQL Server Execution Plans to identify Index Scans, Index Seeks, Implicit Conversions, and Spills in TempDB?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['T-SQL', 'Execution Plan', 'Performance', 'SQL Profiler'],
    shortSummary: 'Covers Seek vs Scan, data type mismatches, and memory grant warnings.',
    detailedAnswer: {
      executiveSummary: 'Execution plans reveal physical operators chosen by the Query Optimizer. Index Seeks navigate B-Trees directly; Index Scans read entire index structures.',
      keyPoints: [
        'Implicit Conversion: Occurs when comparing VARCHAR to NVARCHAR, causing index scans.',
        'TempDB Spills: Occurs when memory grant is insufficient for Sort/Hash Warning operators.'
      ],
      codeOrQuerySnippet: {
        title: 'Detecting Missing Index Suggestions in DMVs',
        language: 'sql',
        code: `SELECT top 10 * FROM sys.dm_db_missing_index_details ORDER BY index_handle DESC;`
      },
      proTipOrPitfall: 'Watch out for yellow warning triangles in SSMS Execution Plans.'
    }
  },
  {
    id: 'ef-05',
    category: 'T-SQL & Entity Framework',
    question: '5. How do you implement Optimistic Concurrency Control in Entity Framework Core using RowVersion / Timestamp?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['EF Core', 'Optimistic Concurrency', 'DbUpdateConcurrencyException'],
    shortSummary: 'Covers concurrency tokens, DbUpdateConcurrencyException, and resolution strategies.',
    detailedAnswer: {
      executiveSummary: 'Optimistic concurrency assumes conflicts are rare. EF Core verifies that the RowVersion byte column in DB matches the original loaded value during UPDATE statements.',
      keyPoints: [
        'RowVersion Property: Configured with `[Timestamp]` or `.IsRowVersion()`.',
        'Conflict Handling: Catches `DbUpdateConcurrencyException` and re-loads or merges entity values.'
      ],
      codeOrQuerySnippet: {
        title: 'EF Core Optimistic Concurrency Entity Config',
        language: 'csharp',
        code: `public class MortgageLoan {
    public int Id { get; set; }
    public decimal Balance { get; set; }
    [Timestamp]
    public byte[] RowVersion { get; set; }
}`
      },
      proTipOrPitfall: 'Optimistic locking avoids holding long database row locks compared to pessimistic locking.'
    }
  },
  {
    id: 'ef-06',
    category: 'T-SQL & Entity Framework',
    question: '6. How do T-SQL Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG) simplify analytical reporting queries?',
    difficulty: 'Mid-Level (3-5 YOE)',
    tags: ['T-SQL', 'Window Functions', 'OVER Partition By'],
    shortSummary: 'Covers partition ranking and offset lead/lag analytics.',
    detailedAnswer: {
      executiveSummary: 'Window functions perform calculations across a set of table rows related to the current row without collapsing rows like GROUP BY.',
      keyPoints: [
        'ROW_NUMBER(): Assigns sequential integer within partition.',
        'LEAD() / LAG(): Accesses data from previous or subsequent rows without self-joins.'
      ],
      codeOrQuerySnippet: {
        title: 'T-SQL Window Function Example',
        language: 'sql',
        code: `SELECT LoanId, Amount,
  ROW_NUMBER() OVER(PARTITION BY BranchId ORDER BY Amount DESC) as RankInBranch
FROM dbo.Loans;`
      },
      proTipOrPitfall: 'Use ROW_NUMBER() in CTEs for clean pagination deduplication.'
    }
  },
  {
    id: 'ef-07',
    category: 'T-SQL & Entity Framework',
    question: '7. What are Common Table Expressions (CTEs), Recursive CTEs, Temp Tables (#Temp), and Table Variables (@Table)?',
    difficulty: 'Mid-Level (3-5 YOE)',
    tags: ['T-SQL', 'CTE', 'Temp Tables', 'Performance'],
    shortSummary: 'Compares scope, statistic generation, and tempdb usage.',
    detailedAnswer: {
      executiveSummary: '#Temp tables have statistics and support indexing for large datasets; @Table variables lack statistics; CTEs are inline view abstractions.',
      keyPoints: [
        '#Temp Table: Best for > 10,000 rows requiring indexes.',
        'Recursive CTE: Ideal for hierarchical data (org trees, category graphs).'
      ],
      codeOrQuerySnippet: {
        title: 'Recursive CTE for Hierarchy',
        language: 'sql',
        code: `WITH OrgHierarchy AS (
    SELECT EmpId, ManagerId, 1 as Level FROM Employees WHERE ManagerId IS NULL
    UNION ALL
    SELECT e.EmpId, e.ManagerId, h.Level + 1 FROM Employees e
    JOIN OrgHierarchy h ON e.ManagerId = h.EmpId
)
SELECT * FROM OrgHierarchy;`
      },
      proTipOrPitfall: 'Avoid @Table variables for massive join operations due to 1-row estimate defaults.'
    }
  },
  {
    id: 'ef-08',
    category: 'T-SQL & Entity Framework',
    question: '8. How do Global Query Filters in EF Core support Multi-Tenancy and Soft Delete patterns seamlessly?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['EF Core', 'Soft Delete', 'Multi-Tenancy', 'Global Filters'],
    shortSummary: 'Covers HasQueryFilter, IgnoreQueryFilters, and tenant ID enforcement.',
    detailedAnswer: {
      executiveSummary: 'Global Query Filters automatically append WHERE predicates to all LINQ queries executed against an Entity Type.',
      keyPoints: [
        'Soft Delete: `.HasQueryFilter(e => !e.IsDeleted)`.',
        'Bypass: Use `.IgnoreQueryFilters()` when explicit admin auditing is required.'
      ],
      codeOrQuerySnippet: {
        title: 'EF Core Global Multi-Tenant Filter',
        language: 'csharp',
        code: `builder.Entity<MortgageLoan>()
    .HasQueryFilter(l => l.TenantId == _tenantProvider.CurrentTenantId && !l.IsDeleted);`
      },
      proTipOrPitfall: 'Ensure global filters handle null tenant parameters during migration seeding.'
    }
  },
  {
    id: 'ef-09',
    category: 'T-SQL & Entity Framework',
    question: '9. How do you perform Bulk Operations (SqlBulkCopy / EF Core ExecuteUpdate / ExecuteDelete) efficiently in .NET?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['T-SQL', 'SqlBulkCopy', 'EF Core 8', 'Bulk Operations'],
    shortSummary: 'Compares EF Core 8 bulk SQL generation vs legacy row-by-row tracking.',
    detailedAnswer: {
      executiveSummary: 'EF Core 8 introduces ExecuteUpdateAsync and ExecuteDeleteAsync, executing single bulk SQL statements without loading entities into memory.',
      keyPoints: [
        'EF Core 8 Bulk API: Modifies thousands of DB rows directly via SQL in 1 roundtrip.',
        'SqlBulkCopy: Best for streaming millions of raw records into SQL Server.'
      ],
      codeOrQuerySnippet: {
        title: 'EF Core 8 Bulk Update Statement',
        language: 'csharp',
        code: `await db.Loans
    .Where(l => l.Status == LoanStatus.Expired)
    .ExecuteUpdateAsync(s => s.SetProperty(l => l.IsActive, false));`
      },
      proTipOrPitfall: 'ExecuteUpdate bypasses EF change tracker and entity validation hooks.'
    }
  },
  {
    id: 'ef-10',
    category: 'T-SQL & Entity Framework',
    question: '10. What are Table Partitioning and Columnstore Indexes in SQL Server for Big Data & Data Warehousing?',
    difficulty: 'Principal Architect',
    tags: ['SQL Server', 'Columnstore', 'Partitioning', 'Data Warehousing'],
    shortSummary: 'Explains columnar compression ratios (10x) and partition switching.',
    detailedAnswer: {
      executiveSummary: 'Clustered Columnstore Indexes store data in column-based segments with extreme compression, ideal for OLAP aggregations.',
      keyPoints: [
        'Columnstore Index: Aggregates millions of rows in milliseconds.',
        'Table Partitioning: Divides table data horizontally by date range for instant partition switching.'
      ],
      codeOrQuerySnippet: {
        title: 'Creating Clustered Columnstore Index',
        language: 'sql',
        code: `CREATE CLUSTERED COLUMNSTORE INDEX CCI_FactLoans ON dbo.FactLoans;`
      },
      proTipOrPitfall: 'Do not use Columnstore on high-frequency OLTP update tables.'
    }
  },
  {
    id: 'ef-11',
    category: 'T-SQL & Entity Framework',
    question: '11. How do you handle Database Deadlocks in SQL Server and write resilient retry logic in EF Core?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['SQL Server', 'Deadlocks', 'EF Core', 'EnableRetryOnFailure'],
    shortSummary: 'Explains deadlock graph analysis, lock escalation, and EF Core execution strategy.',
    detailedAnswer: {
      executiveSummary: 'A deadlock occurs when 2 transactions hold locks on resources the other needs. EF Core supports automatic execution retries for transient SQL errors.',
      keyPoints: [
        'Deadlock Priority: `SET DEADLOCK_PRIORITY LOW`.',
        'EF Core Resilience: `EnableRetryOnFailure()` automatically retries transient error codes (e.g. 1205).'
      ],
      codeOrQuerySnippet: {
        title: 'EF Core Transient Fault Retry Config',
        language: 'csharp',
        code: `options.UseSqlServer(connectionString, sql => {
    sql.EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(10), errorNumbersToAdd: null);
});`
      },
      proTipOrPitfall: 'Access database tables in the exact same order across all stored procedures.'
    }
  },
  {
    id: 'ef-12',
    category: 'T-SQL & Entity Framework',
    question: '12. What are Compiled Queries and DbContext Pooling in EF Core for high throughput APIs?',
    difficulty: 'Staff / Lead Architect',
    tags: ['EF Core', 'DbContextPooling', 'Compiled Queries'],
    shortSummary: 'Covers EF Core instance reuse and LINQ expression tree compilation caching.',
    detailedAnswer: {
      executiveSummary: 'DbContext Pooling reuses DbContext instances, removing allocation overhead. EF.CompileAsyncQuery pre-compiles LINQ expressions into delegate delegates.',
      keyPoints: [
        'DbContext Pooling: Configured via `AddDbContextPool`.',
        'Compiled Queries: Avoids expression tree parsing on hot code paths.'
      ],
      codeOrQuerySnippet: {
        title: 'EF Core Compiled Query Definition',
        language: 'csharp',
        code: `private static readonly Func<MortgageDbContext, int, Task<Loan?>> GetLoanById =
    EF.CompileAsyncQuery((MortgageDbContext db, int id) => db.Loans.FirstOrDefault(l => l.Id == id));`
      },
      proTipOrPitfall: 'DbContext Pooling requires DbContext to be stateless.'
    }
  },
  {
    id: 'ef-13',
    category: 'T-SQL & Entity Framework',
    question: '13. How do you design an audit log system tracking entity changes (Who, What, When) in EF Core?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['EF Core', 'Audit Trail', 'ChangeTracker'],
    shortSummary: 'Covers ChangeTracker.Entries(), Added/Modified state detection, and audit tables.',
    detailedAnswer: {
      executiveSummary: 'Override `SaveChangesAsync()` in DbContext to inspect `ChangeTracker.Entries()`, recording original and current values into an AuditLog table.',
      keyPoints: [
        'Entity States: Added, Modified, Deleted.',
        'Audit Payload: Capture JSON snapshot of modified properties.'
      ],
      codeOrQuerySnippet: {
        title: 'EF Core SaveChanges Audit Interception',
        language: 'csharp',
        code: `public override async Task<int> SaveChangesAsync(CancellationToken ct = default) {
    var entries = ChangeTracker.Entries().Where(e => e.State == EntityState.Modified);
    foreach (var entry in entries) {
        // Record audit entries
    }
    return await base.SaveChangesAsync(ct);
}`
      },
      proTipOrPitfall: 'Ensure audit logging runs inside the same database transaction.'
    }
  },
  {
    id: 'ef-14',
    category: 'T-SQL & Entity Framework',
    question: '14. What are T-SQL MERGE statements, UPSERT patterns, and potential concurrency pitfalls?',
    difficulty: 'Mid-Level (3-5 YOE)',
    tags: ['T-SQL', 'MERGE', 'UPSERT', 'Concurrency'],
    shortSummary: 'Covers atomic MATCHED / NOT MATCHED INSERT/UPDATE and HOLDLOCK hints.',
    detailedAnswer: {
      executiveSummary: 'MERGE performs insert, update, or delete operations on a target table based on the results of a join with a source table.',
      keyPoints: [
        'UPSERT: Combines UPDATE and INSERT atomically.',
        'Pitfall: MERGE without HOLDLOCK can cause concurrency race conditions.'
      ],
      codeOrQuerySnippet: {
        title: 'T-SQL Atomic UPSERT with MERGE',
        language: 'sql',
        code: `MERGE dbo.LoanRates WITH (HOLDLOCK) AS target
USING (SELECT @Id AS Id, @Rate AS Rate) AS source
ON (target.Id = source.Id)
WHEN MATCHED THEN UPDATE SET target.Rate = source.Rate
WHEN NOT MATCHED THEN INSERT (Id, Rate) VALUES (source.Id, source.Rate);`
      },
      proTipOrPitfall: 'Always specify WITH (HOLDLOCK) hint on MERGE target tables.'
    }
  },
  {
    id: 'ef-15',
    category: 'T-SQL & Entity Framework',
    question: '15. How do you secure sensitive T-SQL columns using Always Encrypted and Dynamic Data Masking?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['T-SQL', 'Always Encrypted', 'Security', 'Data Masking'],
    shortSummary: 'Explains client-side encryption key management vs DB engine masking.',
    detailedAnswer: {
      executiveSummary: 'Always Encrypted encrypts data at rest and in transit; keys remain in Azure Key Vault so DB Administrators cannot view plaintext.',
      keyPoints: [
        'Always Encrypted: Cryptographic protection for SSN, credit cards.',
        'Dynamic Data Masking: Obfuscates column data (e.g. `XXXX-1234`) for non-privileged DB users.'
      ],
      codeOrQuerySnippet: {
        title: 'T-SQL Dynamic Data Masking Syntax',
        language: 'sql',
        code: `ALTER TABLE dbo.Borrowers ALTER COLUMN SSN ADD MASKED WITH (FUNCTION = 'partial(0,"XXX-XX-",4)');`
      },
      proTipOrPitfall: 'Data Masking is a display obfuscation feature, not encryption.'
    }
  },
  {
    id: 'ef-16',
    category: 'T-SQL & Entity Framework',
    question: '16. What is Database Connection Pooling in SQL Server and how do you prevent connection exhaustion in microservices?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['SQL Server', 'Connection Pool', 'Performance'],
    shortSummary: 'Explains ADO.NET connection pool reuse, Max Pool Size, and connection leaks.',
    detailedAnswer: {
      executiveSummary: 'ADO.NET maintains a pool of active DB connections. Opening a connection acquires an idle pooled connection rather than negotiating a new socket connection.',
      keyPoints: [
        'Connection Leak: Failing to dispose DbCommand / DbConnection exhausts pool.',
        'Max Pool Size: Default is 100 connections per connection string.'
      ],
      codeOrQuerySnippet: {
        title: 'Connection String Pool Configuration',
        language: 'text',
        code: `Server=sql.enterprise.com;Database=MortgageDb;User Id=app;Password=x;Min Pool Size=10;Max Pool Size=200;`
      },
      proTipOrPitfall: 'Always wrap DB connections in using statements or rely on EF Core DI.'
    }
  },
  {
    id: 'ef-17',
    category: 'T-SQL & Entity Framework',
    question: '17. How do you implement Split Queries (.AsSplitQuery()) in EF Core to avoid Cartesian Explosion on multi-collection joins?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['EF Core', 'AsSplitQuery', 'Cartesian Explosion'],
    shortSummary: 'Compares single JOIN SQL query multiplication vs multiple SELECT queries.',
    detailedAnswer: {
      executiveSummary: 'Joining multiple child collections in a single SQL query causes Cartesian product row duplication. `.AsSplitQuery()` splits the LINQ query into multiple SQL SELECT statements.',
      keyPoints: [
        'Cartesian Explosion: 1 parent with 10 items A and 10 items B generates 100 rows.',
        'AsSplitQuery(): Executes separate SQL queries connected via transactions.'
      ],
      codeOrQuerySnippet: {
        title: 'EF Core AsSplitQuery Usage',
        language: 'csharp',
        code: `var loanDetails = await db.Loans
    .Include(l => l.Documents)
    .Include(l => l.AuditHistory)
    .AsSplitQuery()
    .FirstOrDefaultAsync(l => l.Id == loanId);`
      },
      proTipOrPitfall: 'Use AsSplitQuery when including multiple navigation collections.'
    }
  },
  {
    id: 'ef-18',
    category: 'T-SQL & Entity Framework',
    question: '18. What are Memory-Optimized Tables (In-Memory OLTP / Hekaton) in SQL Server?',
    difficulty: 'Principal Architect',
    tags: ['SQL Server', 'In-Memory OLTP', 'Hekaton'],
    shortSummary: 'Covers lock-free latch-free memory structures and compiled T-SQL procedures.',
    detailedAnswer: {
      executiveSummary: 'In-Memory OLTP stores table rows in RAM using lock-free data structures, yielding up to 30x performance improvements for high-ingestion workloads.',
      keyPoints: [
        'Lock-Free Execution: Eliminates latching bottlenecks.',
        'Natively Compiled Stored Procedures: Compiled to C code DLLs.'
      ],
      codeOrQuerySnippet: {
        title: 'Creating Memory-Optimized Table in T-SQL',
        language: 'sql',
        code: `CREATE TABLE dbo.HotSessionState (
    SessionId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY NONCLUSTERED,
    Data NVARCHAR(MAX)
) WITH (MEMORY_OPTIMIZED = ON, DURABILITY = SCHEMA_AND_DATA);`
      },
      proTipOrPitfall: 'Ideal for high-speed queue or session state ingestion.'
    }
  },
  {
    id: 'ef-19',
    category: 'T-SQL & Entity Framework',
    question: '19. How do EF Core DbContext Interceptors intercept, modify, or log raw SQL queries and transactions?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['EF Core', 'Interceptors', 'DbCommandInterceptor'],
    shortSummary: 'Covers DbCommandInterceptor, DbTransactionInterceptor, and query alteration.',
    detailedAnswer: {
      executiveSummary: 'EF Core Interceptors allow running custom code before or after database commands, connections, or transactions are executed.',
      keyPoints: [
        'DbCommandInterceptor: Inspects or modifies command text (e.g. adding SQL hints).',
        'SaveChangesInterceptor: Hooks into entity state changes.'
      ],
      codeOrQuerySnippet: {
        title: 'Custom EF Core Query Hint Interceptor',
        language: 'csharp',
        code: `public class QueryHintInterceptor : DbCommandInterceptor {
    public override InterceptionResult<DbDataReader> ReaderExecuting(
        DbCommand command, CommandEventData eventData, InterceptionResult<DbDataReader> result) {
        command.CommandText += " OPTION (RECOMPILE)";
        return base.ReaderExecuting(command, eventData, result);
    }
}`
      },
      proTipOrPitfall: 'Interceptors run on every query execution; keep logic lightweight.'
    }
  },
  {
    id: 'ef-20',
    category: 'T-SQL & Entity Framework',
    question: '20. How do you design Zero-Downtime Database Migrations in enterprise deployment pipelines?',
    difficulty: 'Principal Architect',
    tags: ['Database Migrations', 'Zero Downtime', 'DevOps', 'Schema Evolution'],
    shortSummary: 'Covers Expand-Contract (Parallel Change) schema evolution pattern.',
    detailedAnswer: {
      executiveSummary: 'Zero-downtime migrations use the Expand-Contract pattern: Expand schema (add new column without dropping old), deploy code that writes to both, contract schema (remove old column in subsequent deployment).',
      keyPoints: [
        'Expand Phase: Non-breaking schema additions (nullable columns, new tables).',
        'Contract Phase: Safely remove deprecated columns after app code is upgraded.'
      ],
      codeOrQuerySnippet: {
        title: 'Expand Phase Migration Step',
        language: 'sql',
        code: `-- Step 1: Add new column as Nullable (Non-blocking)
ALTER TABLE dbo.Borrowers ADD FullName NVARCHAR(200) NULL;`
      },
      proTipOrPitfall: 'Never rename columns directly in a single live deployment.'
    }
  }
];

import { TOP_20_AI_FRAMEWORKS_AGENTS, TOP_20_VECTOR_DATABASES } from './aiAndVectorQuestions';
import { TOP_20_LANGUAGES_VB, TOP_20_WEB_FRAMEWORKS, TOP_20_ENTERPRISE_DATABASES } from './frameworksAndDbQuestions';
import { TOP_20_SNOWFLAKE } from './snowflakeQuestions';
import { TOP_20_NODEJS } from './nodejsQuestions';
import { TOP_20_PYTHON } from './pythonQuestions';
import { TOP_20_RAG } from './ragQuestions';
import { TOP_20_MCP_SERVER } from './mcpQuestions';
import { TOP_20_PROMPT_CONTEXT_ENGINEERING } from './promptContextQuestions';
import { TOP_20_GENERATIVE_AI } from './generativeAiQuestions';
import { TOP_20_AZURE_IOT } from './azureIotQuestions';
import { TOP_20_CSHARP } from './csharpQuestions';
import {
  TOP_20_REACT_NEXTJS,
  TOP_20_REACT_NATIVE_MOBILE,
  TOP_20_VUE_NUXT,
  TOP_20_FRONTEND_PERFORMANCE_WEB
} from './uiDevelopmentQuestions';

export {
  TOP_20_AI_FRAMEWORKS_AGENTS,
  TOP_20_VECTOR_DATABASES,
  TOP_20_LANGUAGES_VB,
  TOP_20_WEB_FRAMEWORKS,
  TOP_20_ENTERPRISE_DATABASES,
  TOP_20_SNOWFLAKE,
  TOP_20_NODEJS,
  TOP_20_PYTHON,
  TOP_20_RAG,
  TOP_20_MCP_SERVER,
  TOP_20_PROMPT_CONTEXT_ENGINEERING,
  TOP_20_GENERATIVE_AI,
  TOP_20_AZURE_IOT,
  TOP_20_CSHARP,
  TOP_20_REACT_NEXTJS,
  TOP_20_REACT_NATIVE_MOBILE,
  TOP_20_VUE_NUXT,
  TOP_20_FRONTEND_PERFORMANCE_WEB
};

// Helper to resolve or fallback to Top 50 Questions for any category
export function getTop50QuestionsForCategory(categoryName: string, presetQuestions: InterviewQuestion[] = []): InterviewQuestion[] {
  const catLower = categoryName.toLowerCase().trim();

  let pool: InterviewQuestion[] = [];

  if (catLower.includes('react native') || catLower.includes('mobile') || catLower.includes('ios') || catLower.includes('android')) {
    pool = TOP_20_REACT_NATIVE_MOBILE;
  } else if (catLower.includes('react') || catLower.includes('next.js') || catLower.includes('nextjs')) {
    pool = TOP_20_REACT_NEXTJS;
  } else if (catLower.includes('vue') || catLower.includes('nuxt') || catLower.includes('pinia')) {
    pool = TOP_20_VUE_NUXT;
  } else if (catLower.includes('web vitals') || catLower.includes('performance') || catLower.includes('lcp') || catLower.includes('micro-frontend')) {
    pool = TOP_20_FRONTEND_PERFORMANCE_WEB;
  } else if (catLower.includes('generative ai') || catLower === 'genai' || catLower === 'gen ai') {
    pool = TOP_20_GENERATIVE_AI;
  } else if (catLower.includes('azure iot') || catLower.includes('iot hub') || catLower.includes('iot edge') || catLower.includes('microsoft azure iot') || catLower === 'iot') {
    pool = TOP_20_AZURE_IOT;
  } else if (catLower === 'c#' || catLower === 'csharp') {
    pool = TOP_20_CSHARP;
  } else if (catLower === 'c# & .net' || (catLower.includes('.net') && !catLower.includes('angular'))) {
    pool = TOP_20_CSHARP_NET;
  } else if (catLower.includes('snowflake')) {
    pool = TOP_20_SNOWFLAKE;
  } else if (catLower.includes('node.js') || catLower.includes('nodejs') || catLower === 'node') {
    pool = TOP_20_NODEJS;
  } else if (catLower.includes('python')) {
    pool = TOP_20_PYTHON;
  } else if (catLower.includes('rag') || catLower.includes('retrieval-augmented') || catLower.includes('retrieval augmented')) {
    pool = TOP_20_RAG;
  } else if (catLower.includes('mcp') || catLower.includes('model context protocol')) {
    pool = TOP_20_MCP_SERVER;
  } else if (catLower.includes('prompt') || catLower.includes('context engineering')) {
    pool = TOP_20_PROMPT_CONTEXT_ENGINEERING;
  } else if (catLower.includes('ai framework') || catLower.includes('agent') || catLower.includes('kernel') || catLower.includes('langchain')) {
    pool = TOP_20_AI_FRAMEWORKS_AGENTS;
  } else if (catLower.includes('vector') || catLower.includes('pgvector') || catLower.includes('pinecone') || catLower.includes('qdrant') || catLower.includes('search')) {
    pool = TOP_20_VECTOR_DATABASES;
  } else if (catLower.includes('language') || catLower.includes('classic vb') || catLower.includes('vb') || catLower.includes('javascript')) {
    pool = TOP_20_LANGUAGES_VB;
  } else if (catLower.includes('web framework') || catLower.includes('legacy') || catLower.includes('asp') || catLower.includes('knockout')) {
    pool = TOP_20_WEB_FRAMEWORKS;
  } else if (catLower.includes('enterprise database') || catLower.includes('postgres') || catLower.includes('oracle') || catLower.includes('access')) {
    pool = TOP_20_ENTERPRISE_DATABASES;
  } else if (catLower.includes('t-sql') || catLower.includes('entity framework') || catLower.includes('ef') || catLower.includes('sql')) {
    pool = TOP_20_TSQL_EF;
  } else {
    // Default fallback combining multiple diverse tech topics
    pool = [
      ...TOP_20_REACT_NEXTJS,
      ...TOP_20_REACT_NATIVE_MOBILE,
      ...TOP_20_VUE_NUXT,
      ...TOP_20_FRONTEND_PERFORMANCE_WEB,
      ...TOP_20_GENERATIVE_AI,
      ...TOP_20_AZURE_IOT,
      ...TOP_20_CSHARP,
      ...TOP_20_SNOWFLAKE,
      ...TOP_20_NODEJS,
      ...TOP_20_PYTHON,
      ...TOP_20_RAG,
      ...TOP_20_MCP_SERVER,
      ...TOP_20_PROMPT_CONTEXT_ENGINEERING,
      ...TOP_20_AI_FRAMEWORKS_AGENTS,
      ...TOP_20_VECTOR_DATABASES,
      ...TOP_20_LANGUAGES_VB,
      ...TOP_20_WEB_FRAMEWORKS,
      ...TOP_20_ENTERPRISE_DATABASES,
      ...TOP_20_CSHARP_NET,
      ...TOP_20_TSQL_EF
    ];
  }

  // Combine with preset questions strictly matching this category
  const matchingPreset = presetQuestions.filter(q => {
    if (categoryName === 'ALL') return true;
    const qCat = q.category.toLowerCase().trim();
    if (qCat === catLower) return true;
    if ((catLower.includes('react native') || catLower.includes('mobile')) && (qCat.includes('react native') || qCat.includes('mobile'))) return true;
    if ((catLower.includes('react') || catLower.includes('next.js') || catLower.includes('nextjs')) && (qCat.includes('react') || qCat.includes('next'))) return true;
    if ((catLower.includes('vue') || catLower.includes('nuxt')) && (qCat.includes('vue') || qCat.includes('nuxt'))) return true;
    if ((catLower.includes('web vitals') || catLower.includes('performance')) && (qCat.includes('performance') || qCat.includes('vitals'))) return true;
    if ((catLower.includes('azure iot') || catLower === 'iot') && (qCat.includes('azure iot') || qCat === 'iot')) return true;
    if ((catLower.includes('generative ai') || catLower === 'genai') && (qCat.includes('generative ai') || qCat === 'genai')) return true;
    if ((catLower === 'c#' || catLower === 'csharp') && (qCat === 'c#' || qCat === 'csharp')) return true;
    if ((catLower === 'c# & .net') && (qCat.includes('c# & .net') || qCat === '.net')) return true;
    if (catLower.includes('snowflake') && qCat.includes('snowflake')) return true;
    if (catLower.includes('node') && qCat.includes('node')) return true;
    if (catLower.includes('python') && qCat.includes('python')) return true;
    if (catLower.includes('rag') && qCat.includes('rag')) return true;
    if (catLower.includes('mcp') && qCat.includes('mcp')) return true;
    if (catLower.includes('prompt') && qCat.includes('prompt')) return true;
    if (catLower.includes('agent') && qCat.includes('agent')) return true;
    if (catLower.includes('vector') && qCat.includes('vector')) return true;
    if (catLower.includes('language') && qCat.includes('language')) return true;
    if (catLower.includes('web') && qCat.includes('web')) return true;
    if (catLower.includes('enterprise database') && qCat.includes('enterprise database')) return true;
    if (catLower.includes('t-sql') && qCat.includes('sql')) return true;
    if (catLower.includes('angular') && qCat.includes('angular')) return true;
    if (catLower.includes('system design') && qCat.includes('system design')) return true;
    if (catLower.includes('agile') && qCat.includes('agile')) return true;
    if (catLower.includes('domain') && qCat.includes('domain')) return true;
    if (catLower.includes('microservice') && qCat.includes('microservice')) return true;
    if (catLower.includes('data strategy') && qCat.includes('data strategy')) return true;
    if (catLower.includes('security') && qCat.includes('security')) return true;
    if (catLower.includes('governance') && qCat.includes('governance')) return true;
    return false;
  });

  const combined = [...matchingPreset, ...pool];
  const uniqueMap = new Map<string, InterviewQuestion>();

  combined.forEach(q => {
    if (!uniqueMap.has(q.question)) {
      uniqueMap.set(q.question, q);
    }
  });

  let result = Array.from(uniqueMap.values());

  // Guarantee 50 questions for any category section
  if (result.length < 50 && categoryName !== 'ALL') {
    const extraNeeded = 50 - result.length;
    const extra = generate50QuestionsForCategory(categoryName, result.length, extraNeeded);
    extra.forEach(q => {
      if (!uniqueMap.has(q.question)) {
        uniqueMap.set(q.question, q);
      }
    });
    result = Array.from(uniqueMap.values());
  }

  return result.slice(0, 50); // Return 50 questions per section
}

// Backward-compatible alias
export function getTop20QuestionsForCategory(categoryName: string, presetQuestions: InterviewQuestion[] = []): InterviewQuestion[] {
  return getTop50QuestionsForCategory(categoryName, presetQuestions);
}

// Systematic Generator for Supplementary High-Yield Enterprise Q&A (Ensures 50 questions per category)
export function generate50QuestionsForCategory(categoryName: string, startIdx: number, needed: number): InterviewQuestion[] {
  const topicsMap: Record<string, Array<{
    title: string;
    summary: string;
    exec: string;
    points: string[];
    snippetTitle: string;
    snippetLang: 'csharp' | 'sql' | 'typescript' | 'json' | 'text';
    snippetCode: string;
    proTip: string;
    diff: 'Junior (0-2 YOE)' | 'Mid-Level (3-5 YOE)' | 'Senior (6+ YOE)' | 'Staff / Lead Architect' | 'Principal Architect';
    tags: string[];
  }>> = {
    'microsoft azure iot': [
      {
        title: 'How do you design high-throughput IoT Hub Message Routing with custom query endpoints and fallback dead-lettering?',
        summary: 'Covers routing queries, system properties vs application properties, JSON body filtering, and Event Hubs/Storage endpoints.',
        exec: 'IoT Hub Message Routing filters device telemetry in real-time based on message system and application properties. Enrichments add device twin tags automatically before routing to Event Hubs, Service Bus, or Blob storage, preventing downstream compute overhead.',
        points: [
          'Routing Queries: Filter on $body payload or custom headers (e.g. `as_number($body.temperature) > 75`).',
          'Enrichments: Append device twin tags (e.g. `$twin.tags.location`) directly to message headers.',
          'Dead-Lettering: Configure fallback route to Azure Blob Storage to prevent data loss on routing failures.'
        ],
        snippetTitle: 'IoT Hub Routing & Message Enrichment Definition (ARM / Bicep)',
        snippetLang: 'json',
        snippetCode: `{
  "routing": {
    "endpoints": {
      "serviceBusQueues": [{ "name": "criticalAlerts", "connectionString": "@parameters('sbConn')" }]
    },
    "routes": [{
      "name": "HighTempAlerts",
      "source": "DeviceMessages",
      "condition": "$app.criticalAlert = 'true' OR as_number($body.temperature) > 85",
      "endpointNames": ["criticalAlerts"],
      "isEnabled": true
    }],
    "fallbackRoute": { "endpointNames": ["$default"], "isEnabled": true }
  }
}`,
        proTip: 'To route based on message body fields in IoT Hub, set ContentType = "application/json" and ContentEncoding = "utf-8" on every device message.',
        diff: 'Senior (6+ YOE)',
        tags: ['Microsoft Azure IoT', 'IoT Hub', 'Message Routing', 'Telemetry']
      },
      {
        title: 'How does OPC-UA integration work on Azure IoT Edge for Industrial IIoT telemetry ingestion?',
        summary: 'Explains OPC Publisher module, OPC Twin discovery, industrial automation PLC protocols, and cloud translation.',
        exec: 'Industrial factories use OPC Unified Architecture (OPC-UA). Azure provides containerized IoT Edge modules (OPC Publisher and OPC Twin) to connect to on-premise industrial PLCs, publish filtered binary telemetry over MQTT/JSON to IoT Hub, and preserve industrial security boundaries.',
        points: [
          'OPC Publisher: Edge container subscribing to OPC-UA PLC nodes and publishing telemetry to edgeHub.',
          'OPC Twin: Microservice enabling cloud management and discovery of OPC-UA servers without firewall openings.',
          'Security: Industrial firewalls block inbound traffic; edge modules initiate outbound TLS 1.3 to IoT Hub.'
        ],
        snippetTitle: 'OPC Publisher Configuration on IoT Edge (publishednodes.json)',
        snippetLang: 'json',
        snippetCode: `[
  {
    "EndpointUrl": "opc.tcp://factory-plc-01:4840",
    "UseSecurity": true,
    "OpcNodes": [
      { "Id": "ns=2;s=PressureBar", "SamplingInterval": 500, "PublishingInterval": 1000 },
      { "Id": "ns=2;s=MotorRPM", "SamplingInterval": 250, "PublishingInterval": 500 }
    ]
  }
]`,
        proTip: 'Always configure OPC Publisher with store-and-forward disk buffers so factory line telemetry is never lost during plant WAN disconnects.',
        diff: 'Staff / Lead Architect',
        tags: ['Microsoft Azure IoT', 'IoT Edge', 'OPC-UA', 'IIoT', 'Industrial IoT']
      },
      {
        title: 'How do you secure field IoT devices using Microsoft Defender for IoT and X.509 Certificate Revocation Lists (CRL)?',
        summary: 'Covers micro-agents, security posture auditing, certificate life-cycle rotation, and anomalous telemetry detection.',
        exec: 'Microsoft Defender for IoT provides endpoint security micro-agents for Linux and RTOS devices. It analyzes local process execution, open ports, and anomalous cloud traffic. X.509 Certificate Revocation Lists (CRL) and DPS enrollment disablement allow instantaneous device fleet isolation during breaches.',
        points: [
          'Micro-Agent: Monitors local device network sockets, CPU spikes, and unauthorized binary executions.',
          'Certificate Revocation: Invalidate compromised device thumbprints in DPS to immediately block connection renegotiation.',
          'Zero-Trust: Enforce mutual TLS (mTLS) with per-device unique certificates signed by an enterprise intermediate CA.'
        ],
        snippetTitle: 'Device Certificate Validation & Dynamic Revocation Check (C#)',
        snippetLang: 'csharp',
        snippetCode: `public static bool ValidateDeviceCertificate(X509Certificate2 cert, X509Chain chain)
{
    chain.ChainPolicy.RevocationMode = X509RevocationMode.Online;
    chain.ChainPolicy.RevocationFlag = X509RevocationFlag.EntireChain;
    chain.ChainPolicy.VerificationFlags = X509VerificationFlags.NoFlag;

    bool isValid = chain.Build(cert);
    if (!isValid)
    {
        Console.WriteLine($"[Security Alert] Device Certificate revoked or invalid: {chain.ChainStatus[0].StatusInformation}");
    }
    return isValid;
}`,
        proTip: 'Never embed private keys in device source code or unencrypted flash. Always store device private keys in a TPM or secure crypto element (e.g. ATECC608A).',
        diff: 'Senior (6+ YOE)',
        tags: ['Microsoft Azure IoT', 'Security', 'Defender for IoT', 'X.509', 'Zero Trust']
      }
    ],
    'generative ai': [
      {
        title: 'How do you design multi-stage Retrieval-Augmented Generation (RAG) with Hybrid Search, Cross-Encoder Reranking, and HyDE?',
        summary: 'Explains dense vector embeddings, sparse BM25 keyword search, reciprocal rank fusion (RRF), and cross-encoder precision.',
        exec: 'Production GenAI search combines dense semantic embeddings (vector search) with sparse BM25 keywords via Reciprocal Rank Fusion (RRF). Hypothetical Document Embeddings (HyDE) generate synthetic answers to align query embeddings, while Cross-Encoder rerankers score top chunks to eliminate noise before LLM context injection.',
        points: [
          'Hybrid Search: Vector search captures semantic intent; BM25 captures exact IDs, SKUs, and acronyms.',
          'HyDE: Uses LLM to generate a hypothetical answer, then embeds that answer to retrieve similar real passages.',
          'Reranking: Cross-encoders jointly attend to (Query, Document) pairs, achieving higher ranking precision than bi-encoders.'
        ],
        snippetTitle: 'Hybrid Search & Cross-Encoder Reranking Pipeline (Python)',
        snippetLang: 'typescript',
        snippetCode: `// Multi-Stage Semantic Retrieval with RRF
export async function hybridRAGRetrieval(userQuery: string, topK = 5) {
  const [vectorHits, keywordHits] = await Promise.all([
    vectorDb.query({ vector: await embedText(userQuery), topK: 20 }),
    searchIndex.bm25Query({ text: userQuery, topK: 20 })
  ]);
  
  // Reciprocal Rank Fusion (RRF)
  const fusedScores = computeRRF(vectorHits, keywordHits, 60);
  
  // Cross-Encoder Reranker
  const reranked = await crossEncoderRerank(userQuery, fusedScores.slice(0, 15));
  return reranked.slice(0, topK);
}`,
        proTip: 'Always cap context chunks using strict token budget calculations to prevent "Lost in the Middle" attention degradation in long-context models.',
        diff: 'Staff / Lead Architect',
        tags: ['Generative AI', 'RAG', 'Vector Search', 'Reranking', 'HyDE']
      },
      {
        title: 'How do you implement Structured JSON Constrained Decoding (CFG) vs Function Calling for reliable enterprise Agent outputs?',
        summary: 'Covers Context-Free Grammar (CFG) logit masking, JSON Schema adherence, and tool invocation contracts.',
        exec: 'Traditional prompt-based JSON output often fails with invalid syntax. Constrained Decoding (using Outlines or vLLM grammar masks) restricts the model token vocabulary during sampling to strictly valid JSON grammar transitions, guaranteeing 100% syntactically valid outputs matching the target schema without retries.',
        points: [
          'Logit Masking: At each token generation step, tokens violating the JSON Schema receive -infinity logit bias.',
          'Guaranteed Schema: Eliminates JSON parsing errors and guarantees strict typing in downstream microservices.',
          'Tool Calling: Function calling contracts specify parameter schemas so models emit clean structured invocation payloads.'
        ],
        snippetTitle: 'Structured JSON Output with Context-Free Grammar (Outlines / TypeScript)',
        snippetLang: 'typescript',
        snippetCode: `import { z } from 'zod';

export const MortgageDecisionSchema = z.object({
  applicationId: z.string(),
  approved: z.boolean(),
  debtToIncomeRatio: z.number().min(0).max(1),
  riskFactors: z.array(z.string()),
  recommendedAction: z.enum(['APPROVE', 'MANUAL_REVIEW', 'DECLINE'])
});

export type MortgageDecision = z.infer<typeof MortgageDecisionSchema>;`,
        proTip: 'Prefer Constrained Decoding over few-shot prompting when building financial or regulatory decisioning engines.',
        diff: 'Senior (6+ YOE)',
        tags: ['Generative AI', 'Structured Output', 'Agents', 'JSON Schema', 'Tool Calling']
      }
    ],
    'c#': [
      {
        title: 'Span<T> vs ReadOnlySpan<T> vs Memory<T>: How to achieve zero-allocation high-performance memory slicing in .NET 8/9?',
        summary: 'Explains stack-allocated contiguous memory representations, ref struct restrictions, and asynchronous Task boundaries.',
        exec: 'Span<T> is a ref struct allocated on the stack representing contiguous arbitrary memory. It avoids heap allocations during array/string slicing. ReadOnlySpan<T> enforces immutability, while Memory<T> can live on the heap and cross async await boundaries.',
        points: [
          'Stack Allocation: Span<T> cannot be boxed or stored in heap fields or async methods.',
          'Memory<T>: Wraps contiguous memory for async operations where stack-allocated ref structs cannot be captured.',
          'Performance Gains: Eliminates string.Substring allocations in high-throughput JSON/HTTP parsing.'
        ],
        snippetTitle: 'High-Performance Zero-Allocation String Parsing with ReadOnlySpan<T>',
        snippetLang: 'csharp',
        snippetCode: `public static ReadOnlySpan<char> ExtractDomainName(ReadOnlySpan<char> emailUrl)
{
    int atIndex = emailUrl.IndexOf('@');
    if (atIndex == -1) return ReadOnlySpan<char>.Empty;
    ReadOnlySpan<char> domainPart = emailUrl.Slice(atIndex + 1);
    int slashIndex = domainPart.IndexOf('/');
    return slashIndex == -1 ? domainPart : domainPart.Slice(0, slashIndex);
}`,
        proTip: 'Never store Span<T> in class instance fields—the compiler forbids it because ref structs reside strictly on the stack.',
        diff: 'Senior (6+ YOE)',
        tags: ['C#', 'Span<T>', 'Memory Management', 'Zero Allocation']
      },
      {
        title: 'Captive Dependencies in ASP.NET Core Dependency Injection: How do they occur and how do you prevent them?',
        summary: 'Covers lifetime mismatches where Singleton services hold Scoped or Transient dependencies.',
        exec: 'A Captive Dependency occurs when a service with a longer lifetime (e.g. Singleton) captures a service with a shorter lifetime (e.g. Scoped DbContext). This causes the shorter-lived service to persist indefinitely, leading to stale data, threading bugs, or DbContext memory leaks.',
        points: [
          'Detection: Enable validateScopes: true in CreateBuilder() to throw InvalidOperationException during dev startup.',
          'Solution: Use IServiceScopeFactory inside Singletons to create short-lived explicit scopes on demand.',
          'Best Practice: Never inject Scoped services directly into Singleton constructors.'
        ],
        snippetTitle: 'Safe Scoped Resolution Inside Singleton Service',
        snippetLang: 'csharp',
        snippetCode: `public class MortgageJobScheduler : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    public MortgageJobScheduler(IServiceScopeFactory scopeFactory) => _scopeFactory = scopeFactory;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<MortgageDbContext>();
        await dbContext.ProcessPendingApplicationsAsync(stoppingToken);
    }
}`,
        proTip: 'Always call builder.Host.UseDefaultServiceProvider(options => options.ValidateScopes = true) during development.',
        diff: 'Senior (6+ YOE)',
        tags: ['C#', 'Dependency Injection', 'ASP.NET Core', 'Architecture']
      }
    ],
    'c# & .net': [
      {
        title: 'Span<T> vs ReadOnlySpan<T> vs Memory<T>: How to achieve zero-allocation high-performance memory slicing in .NET 8/9?',
        summary: 'Explains stack-allocated contiguous memory representations, ref struct restrictions, and asynchronous Task boundaries.',
        exec: 'Span<T> is a ref struct allocated on the stack representing contiguous arbitrary memory. It avoids heap allocations during array/string slicing. ReadOnlySpan<T> enforces immutability, while Memory<T> can live on the heap and cross async await boundaries.',
        points: [
          'Stack Allocation: Span<T> cannot be boxed or stored in heap fields or async methods.',
          'Memory<T>: Wraps contiguous memory for async operations where stack-allocated ref structs cannot be captured.',
          'Performance Gains: Eliminates string.Substring allocations in high-throughput JSON/HTTP parsing.'
        ],
        snippetTitle: 'High-Performance Zero-Allocation String Parsing with ReadOnlySpan<T>',
        snippetLang: 'csharp',
        snippetCode: `public static ReadOnlySpan<char> ExtractDomainName(ReadOnlySpan<char> emailUrl)
{
    int atIndex = emailUrl.IndexOf('@');
    if (atIndex == -1) return ReadOnlySpan<char>.Empty;
    ReadOnlySpan<char> domainPart = emailUrl.Slice(atIndex + 1);
    int slashIndex = domainPart.IndexOf('/');
    return slashIndex == -1 ? domainPart : domainPart.Slice(0, slashIndex);
}`,
        proTip: 'Never store Span<T> in class instance fields—the compiler forbids it because ref structs reside strictly on the stack.',
        diff: 'Senior (6+ YOE)',
        tags: ['C#', 'Span<T>', 'Memory Management', 'Zero Allocation']
      },
      {
        title: 'Captive Dependencies in ASP.NET Core Dependency Injection: How do they occur and how do you prevent them?',
        summary: 'Covers lifetime mismatches where Singleton services hold Scoped or Transient dependencies.',
        exec: 'A Captive Dependency occurs when a service with a longer lifetime (e.g. Singleton) captures a service with a shorter lifetime (e.g. Scoped DbContext). This causes the shorter-lived service to persist indefinitely, leading to stale data, threading bugs, or DbContext memory leaks.',
        points: [
          'Detection: Enable validateScopes: true in CreateBuilder() to throw InvalidOperationException during dev startup.',
          'Solution: Use IServiceScopeFactory inside Singletons to create short-lived explicit scopes on demand.',
          'Best Practice: Never inject Scoped services directly into Singleton constructors.'
        ],
        snippetTitle: 'Safe Scoped Resolution Inside Singleton Service',
        snippetLang: 'csharp',
        snippetCode: `public class MortgageJobScheduler : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    public MortgageJobScheduler(IServiceScopeFactory scopeFactory) => _scopeFactory = scopeFactory;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<MortgageDbContext>();
        await dbContext.ProcessPendingApplicationsAsync(stoppingToken);
    }
}`,
        proTip: 'Always call builder.Host.UseDefaultServiceProvider(options => options.ValidateScopes = true) during development.',
        diff: 'Senior (6+ YOE)',
        tags: ['C#', 'Dependency Injection', 'ASP.NET Core', 'Architecture']
      },
      {
        title: 'Channel<T> in System.Threading.Channels: How to build thread-safe high-throughput Producer-Consumer pipelines in .NET?',
        summary: 'Explains BoundedChannelOptions, backpressure handling, and replacing ConcurrentQueue with async Channel<T>.',
        exec: 'System.Threading.Channels provides lock-free, async-compatible bounded or unbounded queues for producer-consumer messaging within a single process. Bounded channels enforce backpressure when queues fill up, preventing OutOfMemoryException.',
        points: [
          'Bounded vs Unbounded: Bounded channels limit memory usage and pause producers when full (FullMode.Wait).',
          'Async Consumer Loop: Consumes items using await foreach (var item in channel.Reader.ReadAllAsync()).',
          'Performance: Significantly outperforms ConcurrentQueue + SemaphoreSlim under heavy concurrent thread contention.'
        ],
        snippetTitle: 'Bounded Channel Producer-Consumer Engine (C#)',
        snippetLang: 'csharp',
        snippetCode: `var channel = Channel.CreateBounded<LoanApplication>(new BoundedChannelOptions(100)
{
    FullMode = BoundedChannelFullMode.Wait,
    SingleReader = true
});

// Producer
await channel.Writer.WriteAsync(new LoanApplication { Id = 401 });

// Consumer
await foreach (var app in channel.Reader.ReadAllAsync())
{
    await ProcessLoanAsync(app);
}`,
        proTip: 'Set SingleReader = true and SingleWriter = true on ChannelOptions when applicable to enable dedicated internal lock-free optimizations.',
        diff: 'Staff / Lead Architect',
        tags: ['C#', 'Threading', 'Channels', 'Concurrency', 'Async']
      },
      {
        title: 'FrozenDictionary<TKey, TValue> and FrozenSet<T> in .NET 8: When and why should you use read-only frozen collections?',
        summary: 'Covers .NET 8 immutable frozen collections optimized for read-heavy dictionary lookups.',
        exec: 'FrozenDictionary and FrozenSet (in System.Collections.Frozen) are immutable collections constructed once and optimized for ultra-fast read lookups. They analyze the key set during creation to generate custom hash code strategy masks, outperforming standard Dictionary<TKey, TValue> by up to 300%.',
        points: [
          'Immutable Initialization: Call .ToFrozenDictionary() during application startup or DI initialization.',
          'Read Optimization: Ideal for static configuration maps, lookup tables, and caching keys.',
          'Trade-off: High initial construction cost in exchange for near-instant zero-overhead lookups.'
        ],
        snippetTitle: 'FrozenDictionary Lookup Initialization (.NET 8)',
        snippetLang: 'csharp',
        snippetCode: `public class InterestRateService
{
    private readonly FrozenDictionary<string, decimal> _rates;

    public InterestRateService(IDictionary<string, decimal> rawRates)
    {
        _rates = rawRates.ToFrozenDictionary(StringComparer.OrdinalIgnoreCase);
    }

    public decimal GetRate(string stateCode) => _rates.TryGetValue(stateCode, out var rate) ? rate : 0.05m;
}`,
        proTip: 'Use FrozenDictionary for lookup maps that are initialized once at startup and queried millions of times per minute.',
        diff: 'Senior (6+ YOE)',
        tags: ['C#', '.NET 8', 'Performance', 'Collections', 'Optimization']
      },
      {
        title: 'System.Threading.RateLimiting in .NET 8: How do Fixed Window, Sliding Window, Token Bucket, and Concurrency Limiters work?',
        summary: 'Covers built-in ASP.NET Core rate limiting middleware algorithms and client partitioning.',
        exec: 'System.Threading.RateLimiting provides built-in HTTP request throttling in ASP.NET Core. Token Bucket allows burst requests with steady refill, Sliding Window smooths traffic across sub-segments, and Concurrency Limiter caps simultaneous execution.',
        points: [
          'Token Bucket: Maintains a capacity pool that refills periodically; ideal for APIs allowing short burst activity.',
          'Partitioned Rate Limiter: Allows applying distinct rate limits per authenticated User ID, IP Address, or Tenant.',
          'Rejection Handling: Configures HTTP 429 Too Many Requests responses with Retry-After headers.'
        ],
        snippetTitle: 'Configuring Partitioned Token Bucket Rate Limiter in Program.cs',
        snippetLang: 'csharp',
        snippetCode: `builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("ApiPolicy", httpContext =>
        RateLimitPartition.GetTokenBucketLimiter(
            partitionKey: httpContext.User.Identity?.Name ?? httpContext.Request.Headers.Host.ToString(),
            factory: _ => new TokenBucketRateLimiterOptions
            {
                TokenLimit = 100,
                QueueLimit = 10,
                ReplenishmentPeriod = TimeSpan.FromSeconds(10),
                TokensPerPeriod = 20
            }));
});`,
        proTip: 'Always combine Rate Limiting with Distributed Redis Cache when running behind a multi-instance Cloud Load Balancer.',
        diff: 'Staff / Lead Architect',
        tags: ['C#', 'ASP.NET Core', 'Rate Limiting', 'Security', 'Resilience']
      }
    ]
  };

  const results: InterviewQuestion[] = [];
  const categoryKey = categoryName.toLowerCase();

  // Find best matching topic list or construct default structured Q&A
  let templates = topicsMap[categoryKey];
  if (!templates) {
    // Generate fallback structured technical templates based on category name
    templates = Array.from({ length: 10 }).map((_, idx) => ({
      title: `${categoryName} Enterprise Blueprint Q${startIdx + idx + 1}: Deep-Dive Architecture & Production Trade-offs`,
      summary: `Covers production-grade patterns, fault tolerance, performance tuning, and operational practices in ${categoryName}.`,
      exec: `In enterprise ${categoryName} architectures, system reliability depends on clear separation of concerns, defensive error boundaries, optimized data contracts, and proactive telemetry monitoring under peak load.`,
      points: [
        `Architectural Isolation: Ensure ${categoryName} components maintain clear bounded contexts.`,
        `Performance Optimization: Eliminate unnecessary allocations and database round-trips.`,
        `Fault Tolerance: Implement exponential retry policies, circuit breakers, and graceful fallback paths.`
      ],
      snippetTitle: `Production Implementation Pattern (${categoryName})`,
      snippetLang: (categoryKey.includes('sql') || categoryKey.includes('database')) ? 'sql' : (categoryKey.includes('angular') || categoryKey.includes('ui')) ? 'typescript' : 'csharp',
      snippetCode: `// Enterprise ${categoryName} Production Example
public async Task<ServiceResult> ExecuteEnterpriseWorkflowAsync(WorkflowRequest request)
{
    // Validate inputs & trace context
    if (request == null) throw new ArgumentNullException(nameof(request));
    
    // Execute core resilient operation
    var result = await _resiliencePipeline.ExecuteAsync(async token => 
        await _primaryService.ProcessAsync(request, token));
        
    return ServiceResult.Success(result);
}`,
      proTip: `Always profile ${categoryName} workloads under simulated peak load prior to production release.`,
      diff: idx % 3 === 0 ? 'Senior (6+ YOE)' : idx % 3 === 1 ? 'Staff / Lead Architect' : 'Mid-Level (3-5 YOE)',
      tags: [categoryName, 'Enterprise Architecture', 'Best Practices', 'Performance']
    }));
  }

  for (let i = 0; i < needed; i++) {
    const template = templates[i % templates.length];
    const qNum = startIdx + i + 1;

    results.push({
      id: `${categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${qNum}`,
      category: categoryName,
      question: `${qNum}. ${template.title.replace(/Q\d+:/, `Q${qNum}:`)}`,
      difficulty: template.diff,
      tags: template.tags,
      shortSummary: template.summary,
      detailedAnswer: {
        executiveSummary: template.exec,
        keyPoints: template.points,
        codeOrQuerySnippet: {
          title: template.snippetTitle,
          language: template.snippetLang,
          code: template.snippetCode
        },
        proTipOrPitfall: template.proTip
      }
    });
  }

  return results;
}


// Helper to resolve high-quality external study articles and documentation links for any question
export function getStudyResourcesForQuestion(q: InterviewQuestion): ExternalStudyResource[] {
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(q.question)}`;
  const searchResource: ExternalStudyResource = {
    title: `Google Search Reference: "${q.question.length > 70 ? q.question.slice(0, 70) + '...' : q.question}"`,
    url: googleSearchUrl,
    source: 'Google Search Engine',
    description: 'Direct Google Search query link for deep-dive technical articles, RFC documentation, and community discussions.'
  };

  if (q.detailedAnswer.studyResources && q.detailedAnswer.studyResources.length > 0) {
    return [searchResource, ...q.detailedAnswer.studyResources];
  }

  const text = `${q.category} ${q.question} ${q.tags.join(' ')} ${q.shortSummary}`.toLowerCase();
  const resources: ExternalStudyResource[] = [searchResource];

  if (text.includes('semantic kernel') || text.includes('kernel')) {
    resources.push({
      title: 'Microsoft Semantic Kernel Documentation & SDK Guide',
      url: 'https://learn.microsoft.com/en-us/semantic-kernel/overview/',
      source: 'Microsoft Learn',
      description: 'Official guide on Kernel Plugins, Native Functions, Prompt Templates, and Planners.'
    });
  }

  if (text.includes('langchain') || text.includes('lcel')) {
    resources.push({
      title: 'LangChain Documentation & LCEL Expression Language',
      url: 'https://python.langchain.com/docs/concepts/lcel/',
      source: 'LangChain Docs',
      description: 'Composition operators, RunnableSequence, VectorStoreRetriever, and LangGraph.'
    });
  }

  if (text.includes('autogen') || text.includes('multi-agent')) {
    resources.push({
      title: 'Microsoft AutoGen Multi-Agent Framework Documentation',
      url: 'https://microsoft.github.io/autogen/',
      source: 'Microsoft Research',
      description: 'UserProxyAgent, AssistantAgent, GroupChatManager, and sandboxed code execution.'
    });
  }

  if (text.includes('rag') || text.includes('retrieval') || text.includes('chunking') || text.includes('rrf')) {
    resources.push({
      title: 'Azure OpenAI & Enterprise RAG Best Practices',
      url: 'https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview',
      source: 'Microsoft Learn',
      description: 'Hybrid search, Reciprocal Rank Fusion, Cohere reranking, and semantic chunking.'
    });
  }

  if (text.includes('pgvector') || text.includes('vector')) {
    resources.push({
      title: 'Pgvector GitHub & PostgreSQL Vector Distance Operations',
      url: 'https://github.com/pgvector/pgvector',
      source: 'PostgreSQL Docs',
      description: 'HNSW, IVFFlat, cosine distance (<=>), L2 distance (<->), and hybrid relational SQL.'
    });
  }

  if (text.includes('pinecone')) {
    resources.push({
      title: 'Pinecone Vector Database Architecture Guide',
      url: 'https://docs.pinecone.io/',
      source: 'Pinecone Docs',
      description: 'Serverless vector indexes, payload metadata filtering, and multi-tenant namespaces.'
    });
  }

  if (text.includes('milvus') || text.includes('knowhere')) {
    resources.push({
      title: 'Milvus Distributed Vector Database Architecture',
      url: 'https://milvus.io/docs',
      source: 'Milvus Docs',
      description: 'Knowhere C++ engine, GPU-accelerated CAGRA indexing, and scalar filtering.'
    });
  }

  if (text.includes('qdrant')) {
    resources.push({
      title: 'Qdrant Rust Vector Search Engine Documentation',
      url: 'https://qdrant.tech/documentation/',
      source: 'Qdrant Docs',
      description: 'Payload indexes, filter trees, and sparse-dense hybrid vector retrieval.'
    });
  }

  if (text.includes('snowflake')) {
    resources.push({
      title: 'Snowflake Cloud Data Warehouse Documentation',
      url: 'https://docs.snowflake.com/',
      source: 'Snowflake Docs',
      description: 'Micro-partitions, Virtual Warehouses, Zero-Copy Cloning, Time Travel, and Snowpipe.'
    });
  }

  if (text.includes('node') || text.includes('libuv') || text.includes('event loop') || text.includes('worker_threads')) {
    resources.push({
      title: 'The Node.js Event Loop, Timers, and process.nextTick() Guide',
      url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick',
      source: 'Node.js Official Docs',
      description: 'libuv phases (Timers, Poll, Check), microtask queues, Worker Threads, and stream backpressure.'
    });
  }

  if (text.includes('python') || text.includes('gil') || text.includes('pydantic') || text.includes('fastapi')) {
    resources.push({
      title: 'Python Official Documentation & CPython Internals',
      url: 'https://docs.python.org/3/',
      source: 'Python Software Foundation',
      description: 'CPython memory model, Generational Cyclic GC, PEP 703 Free-Threaded Python, asyncio TaskGroups, and FastAPI ASGI.'
    });
  }

  if (text.includes('mcp') || text.includes('model context protocol')) {
    resources.push({
      title: 'Anthropic Model Context Protocol (MCP) Official Specification',
      url: 'https://modelcontextprotocol.io/',
      source: 'Model Context Protocol Docs',
      description: 'MCP Host-Client-Server topology, Tools/Resources/Prompts primitives, stdio & SSE transports, and JSON-RPC 2.0.'
    });
  }

  if (text.includes('prompt') || text.includes('context engineering') || text.includes('lost in the middle') || text.includes('few-shot')) {
    resources.push({
      title: 'Prompt Engineering & Context Optimization Guide',
      url: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering',
      source: 'Microsoft & OpenAI AI Center',
      description: 'Chain-of-Thought, Tree-of-Thoughts, ReAct, Prompt Caching, XML sandboxing, and Lost in the Middle mitigation.'
    });
  }

  if (text.includes('postgres') || text.includes('mvcc') || text.includes('vacuum')) {
    resources.push({
      title: 'PostgreSQL Internals: MVCC, WAL & Autovacuum Architecture',
      url: 'https://www.postgresql.org/docs/current/mvcc.html',
      source: 'PostgreSQL Docs',
      description: 'Row tuple versioning (xmin/xmax), Write-Ahead Logging, and GIN index tuning.'
    });
  }

  if (text.includes('oracle') || text.includes('rac') || text.includes('pl/sql')) {
    resources.push({
      title: 'Oracle Database Architecture & PL/SQL Language Guide',
      url: 'https://docs.oracle.com/en/database/',
      source: 'Oracle Docs',
      description: 'PL/SQL packages, Real Application Clusters (RAC), SGA memory, and Autonomous DB.'
    });
  }

  if (text.includes('access') || text.includes('jet') || text.includes('ssma')) {
    resources.push({
      title: 'SQL Server Migration Assistant (SSMA) for Access',
      url: 'https://learn.microsoft.com/en-us/sql/ssma/access/sql-server-migration-assistant-for-access',
      source: 'Microsoft Learn',
      description: 'Migrating Access JET/ACE databases, queries, and tables to Microsoft SQL Server.'
    });
  }

  if (text.includes('async') || text.includes('task') || text.includes('threading')) {
    resources.push({
      title: 'Asynchronous Programming with async and await in C#',
      url: 'https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/',
      source: 'Microsoft Learn',
      description: 'Official guide on C# state machine transformations, Task, Task<T>, and ConfigureAwait.'
    });
  }

  if (text.includes('gc') || text.includes('garbage') || text.includes('memory') || text.includes('disposable') || text.includes('span')) {
    resources.push({
      title: 'Fundamentals of Garbage Collection & Memory Management in .NET',
      url: 'https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals',
      source: 'Microsoft Learn',
      description: 'Generational GC (Gen 0/1/2), Large Object Heap (LOH), and Pinned Object Heap dynamics.'
    });
  }

  if (text.includes('generative ai') || text.includes('genai') || text.includes('transformer') || text.includes('flashattention') || text.includes('lora') || text.includes('dpo') || text.includes('vllm')) {
    resources.push({
      title: 'Attention Is All You Need (Vaswani et al. Transformer Paper)',
      url: 'https://arxiv.org/abs/1706.03762',
      source: 'arXiv.org',
      description: 'The foundational paper introducing Transformer architecture, Scaled Dot-Product Attention, and Multi-Head Attention.'
    });
    resources.push({
      title: 'LoRA: Low-Rank Adaptation of Large Language Models (Hu et al.)',
      url: 'https://arxiv.org/abs/2106.09685',
      source: 'Microsoft Research / arXiv',
      description: 'The seminal paper on parameter-efficient fine-tuning via low-rank matrix decomposition.'
    });
    resources.push({
      title: 'Direct Preference Optimization (DPO Paper)',
      url: 'https://arxiv.org/abs/2305.18290',
      source: 'Stanford University / arXiv',
      description: 'Direct Preference Optimization replacing PPO reinforcement learning for model alignment.'
    });
  }

  if (text.includes('iot') || text.includes('azure iot') || text.includes('iot hub') || text.includes('iot edge') || text.includes('dps') || text.includes('device twin') || text.includes('dtdl') || text.includes('opc-ua')) {
    resources.push({
      title: 'Azure IoT Hub Architecture & Protocols Guide',
      url: 'https://learn.microsoft.com/en-us/azure/iot-hub/about-iot-hub',
      source: 'Microsoft Learn',
      description: 'Bidirectional messaging, per-device identity registry, device twins, direct methods, and security.'
    });
    resources.push({
      title: 'Azure IoT Device Provisioning Service (DPS) Zero-Touch Enrollment',
      url: 'https://learn.microsoft.com/en-us/azure/iot-dps/about-iot-dps',
      source: 'Microsoft Learn',
      description: 'Hardware roots of trust, TPM 2.0 attestation, X.509 CA certificate chains, and allocation policies.'
    });
    resources.push({
      title: 'Azure IoT Edge Runtime & Architecture',
      url: 'https://learn.microsoft.com/en-us/azure/iot-edge/iot-edge-runtime',
      source: 'Microsoft Learn',
      description: 'edgeAgent, edgeHub, local message routing, offline store-and-forward persistence, and containerized modules.'
    });
  }

  if (text.includes('react native') || text.includes('fabric') || text.includes('jsi') || text.includes('turbomodule') || text.includes('hermes') || text.includes('reanimated')) {
    resources.push({
      title: 'React Native New Architecture Guide & JSI/Fabric Spec',
      url: 'https://reactnative.dev/docs/the-new-architecture/landing-page',
      source: 'React Native Official Docs',
      description: 'JavaScript Interface (JSI), Fabric C++ renderer, TurboModules codegen spec, and Hermes bytecode runtime.'
    });
    resources.push({
      title: 'React Native Reanimated 3 & Gesture Handler Worklets Guide',
      url: 'https://docs.swmansion.com/react-native-reanimated/',
      source: 'Software Mansion Docs',
      description: 'Synchronous UI-thread worklets, shared values, physics decay springs, and continuous gestures.'
    });
  }

  if (text.includes('react') || text.includes('server component') || text.includes('rsc') || text.includes('next.js') || text.includes('fiber') || text.includes('suspense')) {
    resources.push({
      title: 'React 19 Official Documentation & Server Components Spec',
      url: 'https://react.dev/reference/rsc/server-components',
      source: 'React.dev Official',
      description: 'Server Components vs Client Components, Server Actions ("use server"), useOptimistic, and React Compiler.'
    });
    resources.push({
      title: 'Next.js App Router Architecture, Streaming SSR & Routing Rules',
      url: 'https://nextjs.org/docs/app/building-your-application/rendering/server-components',
      source: 'Vercel / Next.js Docs',
      description: 'Streaming SSR with renderToPipeableStream, partial prerendering, parallel routes, and ISR cache revalidation.'
    });
  }

  if (text.includes('vue') || text.includes('nuxt') || text.includes('pinia') || text.includes('nitro') || text.includes('vapor')) {
    resources.push({
      title: 'Vue 3 Reactivity Engine Deep Dive & Composition API Guide',
      url: 'https://vuejs.org/guide/extras/reactivity-in-depth.html',
      source: 'Vue.js Official Docs',
      description: 'ES6 Proxy targetMap tracking, reactivity transform, Vapor mode compilation, and script setup SFCs.'
    });
    resources.push({
      title: 'Nuxt 3 Nitro Engine, Universal SSR & Hybrid Route Rules',
      url: 'https://nuxt.com/docs/guide/concepts/rendering',
      source: 'Nuxt.com Official Docs',
      description: 'Universal SSR hydration, SWR route rules, auto-imports, and multi-cloud Nitro serverless compilation.'
    });
  }

  if (text.includes('web vitals') || text.includes('lcp') || text.includes('inp') || text.includes('cls') || text.includes('performance') || text.includes('module federation')) {
    resources.push({
      title: 'Core Web Vitals Optimization Guide: LCP, INP, & CLS',
      url: 'https://web.dev/explore/fast',
      source: 'Google Chrome Web.dev',
      description: 'Interaction to Next Paint (INP < 200ms), scheduler.yield() task breaking, and resource priority hints.'
    });
    resources.push({
      title: 'Module Federation 2.0 Architectural Specification for Micro-Frontends',
      url: 'https://module-federation.io/',
      source: 'Module Federation Docs',
      description: 'Runtime remote container negotiation, shared singleton dependency trees, and dynamic micro-frontends.'
    });
  }

  if (text.includes('c#') || text.includes('span<t>') || text.includes('polly') || text.includes('aot') || text.includes('channels') || text.includes('ef core')) {
    resources.push({
      title: 'What is new in C# 12 and C# 13',
      url: 'https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-12',
      source: 'Microsoft Learn',
      description: 'Primary constructors, collection expressions, ref structs, pattern matching, and params collections.'
    });
    resources.push({
      title: 'Building Resilient HTTP Apps in .NET 8 with Polly v8',
      url: 'https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience',
      source: 'Microsoft Learn',
      description: 'Resilience pipelines, rate limiting, circuit breaker, hedging, and timeout strategies.'
    });
  }

  if (resources.length === 0) {
    resources.push({
      title: '.NET Application Architecture Guides & Best Practices',
      url: 'https://learn.microsoft.com/en-us/dotnet/architecture/',
      source: 'Microsoft Architecture Center',
      description: 'Enterprise architecture guidelines for microservices, cloud-native apps, and clean architecture.'
    });
    resources.push({
      title: 'Software Architecture & Technology Interview Guide',
      url: 'https://learn.microsoft.com/en-us/azure/architecture/',
      source: 'Microsoft Learn',
      description: 'Comprehensive technical documentation and architectural design patterns.'
    });
  }

  return resources;
}

export const JOB_ROLE_PRESETS: JobRolePreset[] = [
  {
    id: 'genai-llm-architect',
    title: 'Generative AI & LLM Systems Architect',
    experienceRequirement: '7+ YOE in LLM Systems, Transformer Architectures, Advanced RAG, PEFT/LoRA, & vLLM Serving',
    keyTechnologies: ['Generative AI', 'Transformers', 'FlashAttention', 'KV Cache', 'LoRA / QLoRA', 'DPO', 'Advanced RAG', 'HyDE', 'Reranking', 'Semantic Caching', 'Guardrails', 'vLLM', 'Outlines CFG'],
    domainContext: 'Enterprise GenAI Platforms, Agentic Orchestration, Autonomous Workflows & High-Throughput Inference',
    rawJobDescription: `Principal / Lead Generative AI Solutions Architect responsible for enterprise LLM systems design, low-latency inference serving with vLLM/PagedAttention, advanced multi-stage RAG pipelines, fine-tuning with LoRA/QLoRA, JSON Schema constrained decoding, and safety guardrails.`,
    questions: [
      ...TOP_20_GENERATIVE_AI,
      ...TOP_20_RAG.slice(0, 5),
      ...TOP_20_PROMPT_CONTEXT_ENGINEERING.slice(0, 5)
    ]
  },
  {
    id: 'azure-iot-edge-architect',
    title: 'Microsoft Azure IoT & Edge Cloud Solutions Architect',
    experienceRequirement: '8+ YOE in Azure IoT Hub, IoT Edge, DPS Zero-Touch Attestation, MQTT/AMQP, & Digital Twins',
    keyTechnologies: ['Microsoft Azure IoT', 'Azure IoT Hub', 'Azure IoT Edge', 'Device Provisioning Service (DPS)', 'Device Twins', 'MQTT', 'AMQP', 'Azure Digital Twins (ADT)', 'DTDL', 'Azure Data Explorer (ADX)', 'TPM 2.0 / X.509', 'OPC-UA'],
    domainContext: 'High-Scale Connected Fleets, Industrial IoT (IIoT), Edge AI & Real-Time Stream Telemetry',
    rawJobDescription: `Lead Azure IoT Solutions Architect overseeing connected device fleet architecture (1,000,000+ devices), zero-touch DPS provisioning with X.509/TPM, containerized edge module orchestration, offline store-and-forward edge telemetry, and Azure Digital Twins ontologies.`,
    questions: [
      ...TOP_20_AZURE_IOT,
      ...TOP_20_CSHARP.slice(0, 5)
    ]
  },
  {
    id: 'csharp-enterprise-architect',
    title: 'Senior Enterprise C# & .NET 8 Architect',
    experienceRequirement: '8+ YOE in Modern C# (12/13), .NET 8/9, Span<T> Zero-Allocation, Polly v8, & Native AOT',
    keyTechnologies: ['C#', '.NET 8 / 9', 'Span<T>', 'Memory<T>', 'Channels', 'Polly v8 Resilience', 'Native AOT', 'Source Generators', 'EF Core 8', 'ASP.NET Core', 'Rate Limiting'],
    domainContext: 'High-Throughput Microservices, Low-Latency Financial Platforms & Clean Architecture',
    rawJobDescription: `Senior Staff C# & .NET Architect leading core platform performance, zero-allocation memory design, async state machines, Polly v8 resilience pipelines, lock-free Channels concurrency, and EF Core compiled queries.`,
    questions: [
      ...TOP_20_CSHARP,
      ...TOP_20_TSQL_EF.slice(0, 5)
    ]
  },
  {
    id: 'dotnet-angular-enterprise',
    title: 'Senior Enterprise .NET & Angular Developer (6+ YOE)',
    experienceRequirement: 'Minimum 6+ YOE in .NET 5+ / C#, T-SQL, EF, Angular 10+, Azure, & Agile',
    keyTechnologies: ['C#', '.NET 8 / .NET Core', 'T-SQL', 'REST API', 'Entity Framework', 'Angular 14+', 'TypeScript', 'Bootstrap', 'W3C Accessibility', 'Azure', 'Agile/SCRUM'],
    domainContext: 'Mortgage Origination & Enterprise Financial Systems',
    rawJobDescription: `Minimum of 6 years in a structured environment working on systems, applications, programming, development, testing, implementation, and deployment required.
At least 6 years of in-depth knowledge and experience in: C#, .NET Framework 4.5+, .Net 5+, T-SQL, REST API, Entity Framework.
At least 3 years of demonstrated experience on modern UI development with Angular 10+, bootstrap, CSS 3+, HTML 4+, TypeScript.
Experience writing W3C compliant accessible HTML5 markup.
Familiarity with modern JavaScript command-line tools such as npm.
Software development lifecycle using structured processes.
Practical knowledge of Agile principles and prefer ability to lead SCRUM ceremonies.
Experience with cloud development (Azure preferred).
Competent with tool use to manage: code management, unit testing, integration testing, version control, and prototyping.
Mortgage origination experience (preferred).
Understand a broad range of technologies and able to think in terms "enterprise wide" solutions.`,
    questions: [
      ...TOP_20_CSHARP_NET.slice(0, 10),
      ...TOP_20_TSQL_EF.slice(0, 10)
    ]
  },
  {
    id: 'ms-tech-architect',
    title: 'Microsoft Technology Solution Architect (Azure & .NET)',
    experienceRequirement: '10+ YOE in Azure Cloud, .NET 8/9, Microservices, Enterprise Service Bus, Entra ID, & FinOps',
    keyTechnologies: ['C#', '.NET 8 / 9', 'Azure APIM', 'Azure Container Apps', 'Azure Service Bus', 'Cosmos DB', 'Azure SQL', 'Entra ID (Azure AD)', 'Bicep / Terraform', 'FinOps'],
    domainContext: 'Enterprise Microsoft Ecosystem, Modernization & Cloud Platforms',
    rawJobDescription: `Lead Solution Architect responsible for enterprise cloud modernization on the Microsoft tech stack. Must demonstrate deep expertise in .NET microservices, Azure governance, zero-trust security, event-driven integrations, and multi-tier database architecture.`,
    questions: [
      ...TOP_20_CSHARP_NET.slice(0, 10),
      ...TOP_20_TSQL_EF.slice(0, 10)
    ]
  },
  {
    id: 'frontend-ui-architect',
    title: 'Principal Frontend & UI Systems Architect (React 19, Next.js, Vue 3, TypeScript)',
    experienceRequirement: '8+ YOE in React 19 RSC, Next.js App Router, Vue 3 Composition, Micro-Frontends, & Core Web Vitals',
    keyTechnologies: ['React 19', 'Next.js App Router', 'React Server Components (RSC)', 'Vue 3 / Nuxt 3', 'TypeScript 5', 'Tailwind CSS', 'Module Federation', 'Core Web Vitals (LCP/INP/CLS)', 'Pinia / Zustand', 'Web Workers / Comlink'],
    domainContext: 'High-Density Enterprise Web Studios, Real-Time Interactive Canvas & Micro-Frontend Systems',
    rawJobDescription: `Principal UI Architect spearheading modern frontend modernization across React 19, Next.js streaming SSR, Vue 3 Pinia state stores, module federation micro-frontends, Core Web Vitals optimization, and responsive design systems.`,
    questions: [
      ...TOP_20_REACT_NEXTJS,
      ...TOP_20_VUE_NUXT.slice(0, 5),
      ...TOP_20_FRONTEND_PERFORMANCE_WEB.slice(0, 5)
    ]
  },
  {
    id: 'mobile-cross-platform-lead',
    title: 'Senior Cross-Platform Mobile Architect (React Native, JSI, Fabric, iOS & Android)',
    experienceRequirement: '7+ YOE in React Native New Architecture (JSI / Fabric), Hermes, Reanimated 3, & Offline Sync',
    keyTechnologies: ['React Native', 'JSI (JavaScript Interface)', 'Fabric UI Renderer', 'TurboModules', 'Hermes Engine', 'Reanimated 3', 'Gesture Handler', 'FlashList', 'WatermelonDB / SQLite', 'CodePush / OTA'],
    domainContext: 'Enterprise Mobile Engineering, 60/120 FPS Native Gesture Animation & Offline-First Edge Field Operations',
    rawJobDescription: `Lead Mobile Architect designing mission-critical iOS and Android enterprise applications with React Native New Architecture, synchronous C++ JSI bindings, FlashList high-speed virtualization, offline WatermelonDB synchronization, and Reanimated 3 UI-thread worklets.`,
    questions: [
      ...TOP_20_REACT_NATIVE_MOBILE,
      ...TOP_20_REACT_NEXTJS.slice(0, 5)
    ]
  }
];
