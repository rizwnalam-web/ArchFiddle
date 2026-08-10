import { InterviewQuestion } from './interviewPrepData';

export const CSHARP_PART7: InterviewQuestion[] = [
  {
    id: 'csnet-61',
    category: 'C# & .NET',
    question: '61. How do you implement Zero-Downtime Database Schema Migrations in EF Core using the Expand-Contract (Parallel Change) pattern?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C#', 'EF Core', 'Database Migration', 'Zero-Downtime', 'CI/CD'],
    shortSummary: 'Explains Expand-Contract phase transitions, backward-compatible schema changes, column renaming strategies, and EF Core migration bundles.',
    detailedAnswer: {
      executiveSummary: 'In continuous delivery, application pods and database migrations cannot be updated instantaneously together. The Expand-Contract (Parallel Change) pattern splits breaking changes into three safe phases: 1) Expand (add new nullable column, app writes to both old and new), 2) Migrate (backfill existing data), and 3) Contract (switch reads to new column, drop old column in subsequent deployment). EF Core Migration Bundles (`dotnet ef migrations bundle`) generate self-contained executables for automated CI/CD execution.',
      keyPoints: [
        'Expand Phase: Add new columns without modifying existing columns; new app versions handle both.',
        'Dual-Write Strategy: App writes to both old and new columns during the rollout transition window.',
        'Contract Phase: Once all old application pods are retired, drop the old column in a final migration.',
        'Migration Bundles: Pre-compiled standalone binaries execute migrations deterministically in Kubernetes init containers.'
      ],
      codeOrQuerySnippet: {
        title: 'Expand-Contract Dual Write Property in EF Core Entity',
        language: 'csharp',
        code: `public class BorrowerProfile
{
    public Guid Id { get; set; }
    
    // Legacy column (to be deprecated in Contract phase)
    public string? FullName { get; set; }

    // New normalized columns (Expand phase)
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    // Dual-write helper ensuring both columns remain synchronized during transition
    public void UpdateName(string first, string last)
    {
        FirstName = first;
        LastName = last;
        FullName = $"{first} {last}".Trim(); // Maintains backward compatibility for legacy v1 pods
    }
}`
      },
      proTipOrPitfall: 'Never call `context.Database.Migrate()` on startup inside multi-pod Kubernetes applications. Multiple pods starting simultaneously will attempt to apply the same schema migration concurrently, causing database deadlocks.',
      studyResources: [
        {
          title: 'Applying migrations in production (.NET)',
          url: 'https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-62',
    category: 'C# & .NET',
    question: '62. What is Generic Math in C# 11 / .NET 7, and how do static virtual interface members enable numeric algorithms across any primitive type?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C# 11', 'Generic Math', 'Static Virtual Interface', 'Performance', 'Algorithms'],
    shortSummary: 'Explains INumber<T>, static abstract interface members, polymorphic operator overloading, and zero-allocation math.',
    detailedAnswer: {
      executiveSummary: 'Prior to C# 11, writing a generic method like `T Add<T>(T a, T b)` was impossible because operators (`+`, `-`) could not be constrained by interfaces. C# 11 introduced Static Abstract Members in Interfaces and the `INumber<T>` hierarchy. This allows algorithms (such as financial amortizations or statistical averages) to be written once generically and execute over `int`, `decimal`, `double`, `float`, or custom numeric structs with zero boxing overhead.',
      keyPoints: [
        'Static Abstract Members: Interfaces can declare operators and static factory methods: `static abstract T operator +(T a, T b)`.',
        'INumber<T> Hierarchy: Includes `IFloatingPoint<T>`, `IBinaryInteger<T>`, `IRootFunctions<T>`.',
        'Zero Boxing: Operates directly on value types with full JIT inlining and devirtualization.',
        'Custom Types: Domain value objects (e.g. `Money`) can implement `INumber<Money>` to support standard operators.'
      ],
      codeOrQuerySnippet: {
        title: 'Generic Financial Calculation using C# 11 Generic Math',
        language: 'csharp',
        code: `using System.Numerics;

public static class GenericFinancialMath
{
    // Generic algorithm works across decimal, double, float, etc.
    public static T CalculateWeightedAverage<T>(ReadOnlySpan<T> values, ReadOnlySpan<T> weights) 
        where T : INumber<T>
    {
        if (values.Length != weights.Length || values.IsEmpty)
            throw new ArgumentException("Arrays must be non-empty and equal length.");

        T totalWeightedSum = T.Zero;
        T totalWeight = T.Zero;

        for (int i = 0; i < values.Length; i++)
        {
            totalWeightedSum += values[i] * weights[i];
            totalWeight += weights[i];
        }

        return totalWeightedSum / totalWeight;
    }
}`
      },
      proTipOrPitfall: 'Static abstract interface members can only be declared on interfaces and implemented on concrete types; they cannot be called directly on an interface instance without generic type parameters.',
      studyResources: [
        {
          title: 'Generic math - C# guide',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-11#generic-math-support',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-63',
    category: 'C# & .NET',
    question: '63. What are C# 11 Required Members and the SetsRequiredMembers attribute, and how do they enforce object initialization invariants?',
    difficulty: 'Junior (0-2 YOE)',
    tags: ['C# 11', 'Required Members', 'Object Initializers', 'Type Safety'],
    shortSummary: 'Explains `required` property modifier, compiler enforcement in object initializers, and SetsRequiredMembers constructor bypass.',
    detailedAnswer: {
      executiveSummary: 'C# 11 introduced the `required` modifier for properties and fields. When a class has `required` members, the compiler strictly enforces that callers MUST initialize those properties in the object initializer when instantiating via `new MyClass { ... }`. The `[SetsRequiredMembers]` attribute is placed on constructors that initialize all required properties internally, relieving callers from specifying them in the initializer.',
      keyPoints: [
        'Compiler Enforcement: Omitting a `required` property during `new MyClass { }` causes a compile error (CS9035).',
        'Immutability Support: Combines cleanly with `init` properties for immutable DTO creation.',
        'SetsRequiredMembers: Tells the compiler that the constructor initializes all required fields internally.',
        'Serialization: Fully supported by System.Text.Json deserialization.'
      ],
      codeOrQuerySnippet: {
        title: 'C# 11 Required Members and SetsRequiredMembers',
        language: 'csharp',
        code: `public class CreateBorrowerRequest
{
    public required string SocialSecurityNumber { get; init; }
    public required string FullName { get; init; }
    public required decimal AnnualIncome { get; init; }

    public string? EmployerName { get; init; } // Optional property

    public CreateBorrowerRequest() { }

    [SetsRequiredMembers]
    public CreateBorrowerRequest(string ssn, string name, decimal income)
    {
        SocialSecurityNumber = ssn;
        FullName = name;
        AnnualIncome = income;
    }
}

// Usage:
// var req = new CreateBorrowerRequest { SocialSecurityNumber = "123", FullName = "Jane", AnnualIncome = 120000m };`
      },
      proTipOrPitfall: 'Be aware that adding a `required` modifier to an existing property is a breaking change for existing callers that do not currently specify that property in their object initializers.',
      studyResources: [
        {
          title: 'Required members - C# 11 feature specification',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/required',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-64',
    category: 'C# & .NET',
    question: '64. How do C# 11 Raw String Literals (""") and string interpolation formatting simplify embedded JSON, SQL, and GraphQL queries?',
    difficulty: 'Junior (0-2 YOE)',
    tags: ['C# 11', 'Raw String Literals', 'JSON', 'SQL', 'Formatting'],
    shortSummary: 'Explains triple quotes, multi-line whitespace trimming, curly brace escaping with $$""", and zero-escape formatting.',
    detailedAnswer: {
      executiveSummary: 'Raw string literals in C# 11 (delimited by at least three double quotes `"""`) allow arbitrary text—including raw quotes, backslashes, and multiline formatting—without escape sequences (`\"` or `\\`). By prefixing with multiple dollar signs (e.g. `$$"""`), the number of consecutive `{` symbols determines whether curly braces are treated as literal characters or interpolated variables.',
      keyPoints: [
        'Zero Escape Characters: Quotes and backslashes can be written directly without escape characters.',
        'Whitespace Stripping: The indentation of the closing `"""` determines how much leading whitespace is automatically stripped from each line.',
        'Custom Interpolation ($$): `$$"""{ "id": "{{userId}}" }"""` treats single `{` as literal JSON and `{{userId}}` as variable interpolation.',
        'Use Cases: Embedded SQL statements, JSON payloads, GraphQL queries, XML templates.'
      ],
      codeOrQuerySnippet: {
        title: 'Raw String Literals with JSON Interpolation in C# 11',
        language: 'csharp',
        code: `public static class JsonPayloadFactory
{
    public static string CreateMortgageWebhookPayload(Guid loanId, decimal amount, string status)
    {
        // $$""" specifies that two braces {{variable}} are required for interpolation,
        // allowing single braces { } to be treated as literal JSON!
        return $$"""
        {
            "event": "mortgage.updated",
            "timestamp": "{{DateTime.UtcNow:O}}",
            "data": {
                "loanId": "{{loanId}}",
                "amount": {{amount}},
                "status": "{{status}}"
            }
        }
        """;
    }
}`
      },
      proTipOrPitfall: 'Ensure the closing `"""` is aligned at or to the left of all content lines; if a content line has less indentation than the closing quote, the compiler emits a syntax error.',
      studyResources: [
        {
          title: 'Raw string literal - C# reference',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/tokens/raw-string',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-65',
    category: 'C# & .NET',
    question: '65. What are C# 12 Inline Arrays and the InlineArray attribute, and how do they create fixed-size contiguous struct buffers for high-performance computing?',
    difficulty: 'Principal Architect',
    tags: ['C# 12', 'Inline Arrays', 'High Performance', 'Memory Optimization', 'CLR'],
    shortSummary: 'Explains [InlineArray(N)] struct attribute, fixed-size stack buffers, zero GC allocation, and Span<T> interop.',
    detailedAnswer: {
      executiveSummary: 'C# 12 introduced Inline Arrays via the `[InlineArray(Length)]` attribute on struct declarations. Inline arrays allow developers to create contiguous, fixed-size buffers directly inside a struct definition without unsafe fixed-size buffer pointers or heap array allocations. When accessed via indexers or converted to `Span<T>`, inline arrays offer safe, zero-allocation fixed buffer operations.',
      keyPoints: [
        '[InlineArray(N)]: Compiler generates memory storage for N contiguous elements inside the struct layout.',
        'Zero Allocation: Lives entirely on the stack (if struct is on stack) with no GC overhead.',
        'Safe Indexing: Compiler emits safe bounds-checked indexing without unsafe pointer code.',
        'Span Conversion: Implicitly converts to `Span<T>` and `ReadOnlySpan<T>` for standard BCL operations.'
      ],
      codeOrQuerySnippet: {
        title: 'C# 12 Inline Array for Fixed-Size Buffer Processing',
        language: 'csharp',
        code: `// Define a fixed-size buffer of 16 decimals directly inside a struct
[System.Runtime.CompilerServices.InlineArray(16)]
public struct FinancialBuffer16
{
    private decimal _element0; // Single element declaration; runtime reserves space for 16 decimals
}

public class FastCalculationEngine
{
    public void ProcessMonthlyProjections()
    {
        var buffer = new FinancialBuffer16();

        // Safe bounds-checked indexing
        for (int i = 0; i < 16; i++)
        {
            buffer[i] = (i + 1) * 1250.50m;
        }

        // Convert directly to Span for vector operations
        Span<decimal> span = buffer;
        Console.WriteLine($"Total 16-period sum: {Sum(span)}");
    }

    private static decimal Sum(ReadOnlySpan<decimal> values)
    {
        decimal total = 0;
        foreach (var v in values) total += v;
        return total;
    }
}`
      },
      proTipOrPitfall: 'Inline array structs should be passed using `in` or `ref` parameters when large, because passing an inline array struct by value will copy the entire fixed buffer block across stack frames.',
      studyResources: [
        {
          title: 'Inline arrays - C# 12 feature specification',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/struct#inline-arrays',
          source: 'Microsoft Learn'
        }
      ]
    }
  }
];
