import { InterviewQuestion } from './interviewPrepData';

export const CSHARP_PART9: InterviewQuestion[] = [
  {
    id: 'csnet-71',
    category: 'C# & .NET',
    question: '71. How do MemoryMappedFile and UnmanagedMemoryAccessor enable ultra-fast inter-process communication and multi-gigabyte file manipulation in C#?',
    difficulty: 'Principal Architect',
    tags: ['C#', 'MemoryMappedFile', 'IPC', 'Low Latency', 'High Performance'],
    shortSummary: 'Explains virtual memory paging, OS shared memory, zero-copy file access, and multi-process synchronization.',
    detailedAnswer: {
      executiveSummary: '`MemoryMappedFile` maps a file or named shared memory block directly into the process\'s virtual address space. Instead of allocating large byte arrays in the CLR managed heap and issuing repeated `FileStream.Read()` system calls, the OS kernel pages the file directly into memory. Multiple .NET processes can attach to the same named memory-mapped file for nanosecond-latency Inter-Process Communication (IPC) without network overhead.',
      keyPoints: [
        'Zero-Copy File I/O: Reads and writes occur directly against OS virtual memory pages without managed buffer allocations.',
        'Shared Memory IPC: Named memory mapped files (`CreateOrOpen("MortgagePipe")`) allow separate local processes to share memory.',
        'View Accessors: `CreateViewAccessor()` creates an `UnmanagedMemoryAccessor` for structured binary read/write.',
        'Direct Pointer Access: `SafeMemoryMappedViewHandle.AcquirePointer()` allows direct C# unsafe pointer manipulation.'
      ],
      codeOrQuerySnippet: {
        title: 'Shared Memory IPC with MemoryMappedFile in C#',
        language: 'csharp',
        code: `using System.IO.MemoryMappedFiles;

public class HighFrequencySharedMemoryWriter
{
    public static void WriteMarketRates(ReadOnlySpan<decimal> rates)
    {
        // Create or open a named shared memory segment accessible by other processes
        using var mmf = MemoryMappedFile.CreateOrOpen("GlobalMortgageRateStream", 1024 * 1024);
        using var accessor = mmf.CreateViewAccessor(0, 1024 * 1024);

        int offset = 0;
        for (int i = 0; i < rates.Length; i++)
        {
            accessor.Write(offset, rates[i]);
            offset += sizeof(decimal);
        }
    }
}`
      },
      proTipOrPitfall: 'Always use inter-process synchronization primitives (such as `EventWaitHandle` or named `Mutex`) when multiple processes read and write to the same memory mapped file to avoid data corruption.',
      studyResources: [
        {
          title: 'Memory-Mapped Files in .NET',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/io/memory-mapped-files',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-72',
    category: 'C# & .NET',
    question: '72. How do AssemblyLoadContext and Collectible Assemblies implement dynamic plugin unloading and isolation in .NET Core?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'AssemblyLoadContext', 'Plugins', 'Collectible Assemblies', 'CLR Internals'],
    shortSummary: 'Explains AppDomain deprecation, isolated ALCs, assembly unloading, and preventing GC reference leaks.',
    detailedAnswer: {
      executiveSummary: 'In .NET Framework, plugins were isolated using `AppDomain`. In modern .NET Core, `AppDomain` is deprecated for isolation and replaced by `AssemblyLoadContext` (ALC). An ALC provides an isolated scope for loading assemblies and their dependencies, allowing different versions of the same NuGet package (e.g. Newtonsoft.Json v12 and v13) to run simultaneously. A Collectible ALC (`isCollectible: true`) can be fully unloaded, freeing assembly memory when all references are released.',
      keyPoints: [
        'Isolated Assembly Resolution: Isolates conflicting third-party dependency versions within the same process.',
        'Collectible ALC: `new AssemblyLoadContext(name, isCollectible: true)` enables dynamic hot-reloading.',
        'Unloading Lifecycle: Calling `alc.Unload()` marks the context for cleanup; memory is collected once no references remain.',
        'GC Leak Prevention: Static references, thread-local variables, or active delegates preventing collection will keep the ALC alive.'
      ],
      codeOrQuerySnippet: {
        title: 'Dynamic Collectible Plugin Loader in C#',
        language: 'csharp',
        code: `public class PluginLoader
{
    [MethodImpl(MethodImplOptions.NoInlining)]
    public static WeakReference LoadAndExecutePlugin(string pluginPath)
    {
        var alc = new AssemblyLoadContext("PluginContext", isCollectible: true);
        var assembly = alc.LoadFromAssemblyPath(pluginPath);

        var pluginType = assembly.GetType("MortgagePlugin.CustomUnderwriter")!;
        var pluginInstance = Activator.CreateInstance(pluginType);
        var method = pluginType.GetMethod("ExecuteRules")!;
        
        method.Invoke(pluginInstance, null);

        // Initiate unload
        alc.Unload();

        // Return weak reference to verify GC reclamation
        return new WeakReference(alc);
    }
}`
      },
      proTipOrPitfall: 'Never hold strong references to types, instances, or delegates created from a collectible ALC in long-lived services; otherwise, the assembly will leak and cannot be collected by GC.',
      studyResources: [
        {
          title: 'Understanding AssemblyLoadContext',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/dependency-loading/understanding-assemblyloadcontext',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-73',
    category: 'C# & .NET',
    question: '73. How do Incremental Source Generators (IIncrementalGenerator) in .NET 8 revolutionize performance and compile-time code generation over Reflection?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'Source Generators', 'Roslyn', 'IIncrementalGenerator', 'AOT'],
    shortSummary: 'Explains Roslyn pipeline caching, compile-time metadata generation, zero-reflection JSON/DI, and Native AOT compatibility.',
    detailedAnswer: {
      executiveSummary: 'Incremental Source Generators (`IIncrementalGenerator`) execute as part of the Roslyn compilation pipeline. By inspecting syntax trees and semantic models, they generate pure C# source files at compile time. Unlike runtime Reflection (which causes startup delays and breaks Native AOT), Source Generators provide type-safe, zero-allocation serialization (System.Text.Json source generators), regex compilation (`[GeneratedRegex]`), and logging (`[LoggerMessage]`).',
      keyPoints: [
        'Incremental Pipeline: Caches transformation steps so only modified source files trigger re-generation in IDEs.',
        'Native AOT Ready: Generates explicit C# code without dynamic runtime code emission (Emit/Reflection).',
        'Zero Startup Cost: Eliminates reflection scans during application startup.',
        'System.Text.Json Generator: `[JsonSerializable(typeof(LoanDto))]` generates fast serialization code at compile time.'
      ],
      codeOrQuerySnippet: {
        title: 'System.Text.Json Source Generator Context in C#',
        language: 'csharp',
        code: `public record LoanApplicationDto(Guid Id, string BorrowerName, decimal Principal);

// Compile-time source generator eliminates runtime reflection!
[JsonSourceGenerationOptions(WriteIndented = false, PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
[JsonSerializable(typeof(LoanApplicationDto))]
[JsonSerializable(typeof(List<LoanApplicationDto>))]
public partial class LoanJsonSerializerContext : JsonSerializerContext
{
}

// Usage in Minimal API:
app.MapGet("/api/loans", () => 
    Results.Ok(loans, LoanJsonSerializerContext.Default.ListLoanApplicationDto));`
      },
      proTipOrPitfall: 'Always use `IIncrementalGenerator` rather than legacy `ISourceGenerator`; incremental generators are required to maintain fast IDE typing performance and avoid Visual Studio freezes.',
      studyResources: [
        {
          title: 'Incremental source generators in Roslyn',
          url: 'https://github.com/dotnet/roslyn/blob/main/docs/features/incremental-generators.md',
          source: 'GitHub / Roslyn'
        }
      ]
    }
  },
  {
    id: 'csnet-74',
    category: 'C# & .NET',
    question: '74. How do System.Threading.Channels provide high-throughput, low-allocation Producer-Consumer asynchronous queues in .NET?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['C#', 'Channels', 'Producer-Consumer', 'Async', 'Concurrency', 'Performance'],
    shortSummary: 'Compares BoundedChannel vs UnboundedChannel, backpressure handling, ChannelReader/ChannelWriter, and BlockingCollection replacement.',
    detailedAnswer: {
      executiveSummary: '`System.Threading.Channels` is the high-performance async producer-consumer library in .NET, replacing legacy synchronous `BlockingCollection<T>`. It decouples producers (`ChannelWriter<T>`) from consumers (`ChannelReader<T>`) with minimal allocations. Bounded channels enforce backpressure via `BoundedChannelFullMode` (Wait, DropOldest, DropNewest, DropWrite), protecting server memory from out-of-memory crashes when message influx spikes.',
      keyPoints: [
        'Bounded Channels: Enforces capacity limits to apply backpressure on fast producers.',
        'SingleReader / SingleWriter: Optimizes internal synchronization primitives when concurrency guarantees are known.',
        'Async Iteration: Consumers process incoming items using `await foreach (var item in channel.Reader.ReadAllAsync())`.',
        'Thread Safety: ChannelWriter and ChannelReader are thread-safe and can be shared across multiple concurrent workers.'
      ],
      codeOrQuerySnippet: {
        title: 'High-Throughput Bounded Channel Worker in C#',
        language: 'csharp',
        code: `public class MortgageAuditBackgroundQueue
{
    private readonly Channel<AuditEntry> _channel;

    public MortgageAuditBackgroundQueue()
    {
        var options = new BoundedChannelOptions(10_000)
        {
            FullMode = BoundedChannelFullMode.Wait, // Backpressure: awaits producer when queue is full
            SingleWriter = false,
            SingleReader = true
        };
        _channel = Channel.CreateBounded<AuditEntry>(options);
    }

    public async ValueTask QueueAuditAsync(AuditEntry entry, CancellationToken ct = default)
    {
        await _channel.Writer.WriteAsync(entry, ct);
    }

    public async Task StartConsumerAsync(CancellationToken ct)
    {
        // Consumes items asynchronously as they arrive with zero spin-wait
        await foreach (var entry in _channel.Reader.ReadAllAsync(ct))
        {
            await ProcessAuditRecordAsync(entry);
        }
    }

    private Task ProcessAuditRecordAsync(AuditEntry entry) => Task.CompletedTask;
}`
      },
      proTipOrPitfall: 'Always prefer `Channel.CreateBounded<T>` in production web services over `CreateUnbounded<T>`. Unbounded channels have no capacity ceiling and will consume all server RAM if downstream processing slows.',
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
    id: 'csnet-75',
    category: 'C# & .NET',
    question: '75. How does System.IO.Pipelines solve high-performance socket parsing, buffer management, and memory fragmentation in ASP.NET Core?',
    difficulty: 'Principal Architect',
    tags: ['C#', 'System.IO.Pipelines', 'High Performance', 'PipeReader', 'Buffers', 'MemoryPool'],
    shortSummary: 'Explains PipeReader/PipeWriter, ReadResult, ReadOnlySequence<byte>, memory pooling, and eliminating buffer copying.',
    detailedAnswer: {
      executiveSummary: '`System.IO.Pipelines` is the I/O library originally created for Kestrel to achieve millions of HTTP requests per second. Traditional stream programming requires allocating byte arrays and managing manual offsets, leading to GC fragmentation and buffer-copying bottlenecks. Pipelines manages pooled memory automatically via `PipeReader` and `PipeWriter`. Readers consume data using `ReadOnlySequence<byte>` and signal consumed/examined positions back to the pipeline, eliminating buffer management overhead.',
      keyPoints: [
        'Zero Allocation Buffers: Memory is rented and returned automatically to a shared `MemoryPool<byte>`.',
        'ReadOnlySequence<byte>: Efficiently represents multi-segment contiguous and non-contiguous memory buffers.',
        'AdvanceTo(consumed, examined): Informs the pipe how much data was processed and how much remains for subsequent reads.',
        'Backpressure: Automatic flow control pauses the writer when the reader falls behind.'
      ],
      codeOrQuerySnippet: {
        title: 'Parsing Line-Delimited Socket Protocol with System.IO.Pipelines',
        language: 'csharp',
        code: `public async Task ProcessSocketMessagesAsync(PipeReader reader)
{
    while (true)
    {
        ReadResult result = await reader.ReadAsync();
        ReadOnlySequence<byte> buffer = result.Buffer;

        while (TryReadLine(ref buffer, out ReadOnlySequence<byte> line))
        {
            // Process message line with zero heap copying
            ProcessMessage(line);
        }

        // Advance the reader cursor
        reader.AdvanceTo(buffer.Start, buffer.End);

        if (result.IsCompleted) break;
    }
}

private bool TryReadLine(ref ReadOnlySequence<byte> buffer, out ReadOnlySequence<byte> line)
{
    SequencePosition? position = buffer.PositionOf((byte)'\\n');
    if (position == null)
    {
        line = default;
        return false;
    }

    line = buffer.Slice(0, position.Value);
    buffer = buffer.Slice(buffer.GetPosition(1, position.Value));
    return true;
}

private void ProcessMessage(ReadOnlySequence<byte> line) { }`
      },
      proTipOrPitfall: 'Always call `reader.AdvanceTo(...)` after every `reader.ReadAsync()`, even if no complete message was found. Failing to call `AdvanceTo` will cause subsequent `ReadAsync()` calls to block indefinitely.',
      studyResources: [
        {
          title: 'System.IO.Pipelines: High performance I/O in .NET',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/io/pipelines',
          source: 'Microsoft Learn'
        }
      ]
    }
  }
];
