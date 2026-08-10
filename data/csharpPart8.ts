import { InterviewQuestion } from './interviewPrepData';

export const CSHARP_PART8: InterviewQuestion[] = [
  {
    id: 'csnet-66',
    category: 'C# & .NET',
    question: '66. How do C# 12 Primary Constructors on classes and structs streamline Dependency Injection, and how does field capture work?',
    difficulty: 'Junior (0-2 YOE)',
    tags: ['C# 12', 'Primary Constructors', 'Dependency Injection', 'Clean Code'],
    shortSummary: 'Explains class-level constructor parameters, parameter capture in methods, and base constructor chaining.',
    detailedAnswer: {
      executiveSummary: 'C# 12 expanded Primary Constructors from records to all standard classes and structs. Declaring constructor parameters directly in the class signature (`public class LoanService(ILoanRepository repo, ILogger<LoanService> logger)`) eliminates boilerplate private readonly backing fields. The compiler automatically captures parameters into hidden private fields if they are referenced inside methods or property accessors.',
      keyPoints: [
        'Boilerplate Reduction: Eliminates redundant constructor bodies and manual backing field assignments.',
        'Parameter Capture: If a method references a primary constructor parameter, the compiler synthesizes a private backing field.',
        'Base Class Chaining: Derived classes pass arguments directly to base primary constructors: `class SpecialService(IRepo r) : BaseService(r)`.',
        'Multiple Constructors: Secondary constructors MUST chain to the primary constructor using `this(...)`.'
      ],
      codeOrQuerySnippet: {
        title: 'Primary Constructor Dependency Injection in C# 12',
        language: 'csharp',
        code: `// C# 12 Primary Constructor streamlines DI injection
public class MortgageUnderwritingService(
    IMortgageRepository repository,
    ICreditScoreGateway creditGateway,
    ILogger<MortgageUnderwritingService> logger)
{
    public async Task<bool> EvaluateEligibilityAsync(Guid loanId, CancellationToken ct)
    {
        logger.LogInformation("Evaluating underwriting eligibility for Loan {LoanId}", loanId);
        
        var loan = await repository.GetByIdAsync(loanId, ct);
        if (loan == null) return false;

        var score = await creditGateway.FetchScoreAsync(loan.BorrowerSsn, ct);
        return score >= 680;
    }
}`
      },
      proTipOrPitfall: 'Primary constructor parameters on classes are mutable unless explicitly guarded. Modifying a captured parameter in one method affects its value in all other methods.',
      studyResources: [
        {
          title: 'Primary constructors - C# 12 feature specification',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-12#primary-constructors',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-67',
    category: 'C# & .NET',
    question: '67. How does C# 12 Type Aliasing (using alias = TargetType) support tuples, arrays, pointers, and generic types across file scopes?',
    difficulty: 'Junior (0-2 YOE)',
    tags: ['C# 12', 'Type Aliasing', 'Tuples', 'Clean Code'],
    shortSummary: 'Explains aliasing tuples, arrays, pointer types, and global using aliases.',
    detailedAnswer: {
      executiveSummary: 'In C# 12, the `using` alias directive was expanded to support any type—including tuples, multidimensional arrays, pointer types, and generic collections. This allows complex semantic structures (like `(decimal Principal, decimal Rate, int Term)`) to be assigned meaningful domain names (`using LoanTerms = (decimal Principal, decimal Rate, int Term);`) without creating full class overhead.',
      keyPoints: [
        'Tuple Aliasing: Give readable domain names to positional and named tuples.',
        'Array & Pointer Aliasing: Alias multi-dimensional arrays or unsafe pointers: `using Matrix = double[,];`.',
        'Global Using Aliasing: Prefix with `global using` in `Usings.cs` to make aliases available across the entire project.',
        'Zero Runtime Cost: Aliases are pure compile-time abstractions; no new types are emitted in IL metadata.'
      ],
      codeOrQuerySnippet: {
        title: 'C# 12 Type Aliasing for Financial Tuples and Arrays',
        language: 'csharp',
        code: `// File-scoped type aliases in C# 12
using MortgageCoordinate = (double Latitude, double Longitude);
using RateSchedule = System.Collections.Generic.Dictionary<string, decimal>;

public class LocationRateService
{
    private readonly RateSchedule _schedule = [];

    public decimal GetRateForCoordinates(MortgageCoordinate coords)
    {
        // Access named tuple properties cleanly
        string regionKey = coords.Latitude > 35.0 ? "North" : "South";
        return _schedule.GetValueOrDefault(regionKey, 6.5m);
    }
}`
      },
      proTipOrPitfall: 'While aliases improve readability for complex tuples, consider using a `readonly record struct` if the data type requires methods, equality operators, or domain validation.',
      studyResources: [
        {
          title: 'Alias any type - C# 12',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-12#alias-any-type',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-68',
    category: 'C# & .NET',
    question: '68. How do C# 13 params Collections (params ReadOnlySpan<T>, params List<T>) eliminate array allocations in variable argument methods?',
    difficulty: 'Staff / Lead Architect',
    tags: ['C# 13', '.NET 9', 'params Collections', 'ReadOnlySpan', 'Performance'],
    shortSummary: 'Explains params Span<T>, params ReadOnlySpan<T>, params IEnumerable<T>, and zero-heap array allocations.',
    detailedAnswer: {
      executiveSummary: 'Historically, the `params` keyword in C# only accepted single-dimensional arrays (`params T[]`), forcing the runtime to allocate a new heap array on every method invocation. C# 13 in .NET 9 expands `params` to accept any recognized collection type, including `ReadOnlySpan<T>`, `Span<T>`, `List<T>`, and `IEnumerable<T>`. When using `params ReadOnlySpan<T>`, the compiler allocates the variable arguments directly on the stack with zero heap allocations.',
      keyPoints: [
        'params ReadOnlySpan<T>: Passes variable arguments via stack memory with 0 bytes of managed heap allocation.',
        'params List<T> / IEnumerable<T>: Directly pass collections without converting to arrays.',
        'Overload Resolution: The compiler chooses the lowest-allocation overload (`ReadOnlySpan<T>`) when multiple `params` methods exist.',
        'Backward Compatible: Existing `params T[]` code continues to work seamlessly.'
      ],
      codeOrQuerySnippet: {
        title: 'Zero-Allocation params ReadOnlySpan<T> in C# 13',
        language: 'csharp',
        code: `public static class FinancialAuditLogger
{
    // C# 13 allows params ReadOnlySpan<T>
    public static void LogFinancialDiscrepancies(Guid loanId, params ReadOnlySpan<decimal> discrepancies)
    {
        if (discrepancies.IsEmpty) return;

        decimal totalDiscrepancy = 0;
        foreach (var item in discrepancies)
        {
            totalDiscrepancy += item;
        }

        Console.WriteLine($"Loan {loanId} discrepancy count: {discrepancies.Length}, Total: {totalDiscrepancy}");
    }
}

// Call site:
// FinancialAuditLogger.LogFinancialDiscrepancies(loanId, 120.50m, 450.00m, 89.99m); 
// -> 0 bytes heap allocated! Memory lives on the caller's stack frame.`
      },
      proTipOrPitfall: 'Methods accepting `params ReadOnlySpan<T>` cannot be invoked asynchronously across `await` expressions because `ReadOnlySpan<T>` is a ref struct that cannot cross async state machine boundaries.',
      studyResources: [
        {
          title: 'params collections - C# 13 feature specification',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13#params-collections',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-69',
    category: 'C# & .NET',
    question: '69. What are C# 13 Enhanced ref struct capabilities, interface implementations, and the "allows ref struct" anti-constraint?',
    difficulty: 'Principal Architect',
    tags: ['C# 13', '.NET 9', 'ref struct', 'Anti-Constraint', 'Generics', 'Performance'],
    shortSummary: 'Explains ref structs implementing interfaces, `allows ref struct` generic constraint, and Span<T> in generic collections.',
    detailedAnswer: {
      executiveSummary: 'Prior to C# 13, `ref struct` types (such as `Span<T>` and `ReadOnlySpan<T>`) were strictly prohibited from implementing interfaces or being passed as generic type parameters because generics assumed heap boxability. C# 13 allows `ref struct` to implement interfaces and introduces the `where T : allows ref struct` anti-constraint. This enables generic algorithms to operate over `ReadOnlySpan<T>` without boxing.',
      keyPoints: [
        'Interface Implementation: Ref structs can implement interfaces (e.g. `ref struct MySpanEnumerator : IDisposable`).',
        'Anti-Constraint (`allows ref struct`): Opts into accepting stack-only ref structs as generic type arguments.',
        'Boxing Prevention: Interfaces implemented by ref structs can only be called via generic constraints, never via boxed interface casts.',
        'High-Performance Libraries: Enables BCL and third-party libraries to write unified generic code for both heap and stack types.'
      ],
      codeOrQuerySnippet: {
        title: 'C# 13 ref struct with allows ref struct Generic Constraint',
        language: 'csharp',
        code: `public interface IDataValidator<T> where T : allows ref struct
{
    bool Validate(T data);
}

// Ref struct implementing an interface directly in C# 13
public readonly ref struct SpanPayloadValidator : IDataValidator<ReadOnlySpan<char>>
{
    public bool Validate(ReadOnlySpan<char> data)
    {
        return !data.IsEmpty && char.IsLetterOrDigit(data[0]);
    }
}

public static class ValidatorRunner
{
    // Generic method accepting ref structs via anti-constraint
    public static bool ExecuteValidation<TValidator, TData>(TValidator validator, TData data)
        where TValidator : IDataValidator<TData>
        where TData : allows ref struct
    {
        return validator.Validate(data);
    }
}`
      },
      proTipOrPitfall: 'Remember that while a `ref struct` can implement an interface, casting a `ref struct` instance to `IInterface` object will still cause a compile error to prevent heap boxing.',
      studyResources: [
        {
          title: 'ref struct types - C# reference',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/ref-struct',
          source: 'Microsoft Learn'
        }
      ]
    }
  },
  {
    id: 'csnet-70',
    category: 'C# & .NET',
    question: '70. How do C# 13 Semi-Auto Properties and the "field" keyword eliminate boilerplate backing fields for property validation?',
    difficulty: 'Junior (0-2 YOE)',
    tags: ['C# 13', 'Semi-Auto Properties', 'field Keyword', 'Clean Code'],
    shortSummary: 'Explains `field` contextual keyword, mutating backing fields inside auto-property setters, and null check guards.',
    detailedAnswer: {
      executiveSummary: 'Historically in C#, if a property setter required validation or mutation (e.g. `if (value < 0) throw ...`), developers had to manually declare a separate private backing field (`private decimal _amount;`). C# 13 introduces Semi-Auto Properties with the contextual `field` keyword, providing direct access to the compiler-synthesized backing field inside property getters and setters without declaring explicit variables.',
      keyPoints: [
        'field Contextual Keyword: References the compiler-generated backing field directly inside getter/setter bodies.',
        'Encapsulation & Validation: Validate incoming `value` before assigning to `field`.',
        'Boilerplate Removal: Eliminates thousands of redundant private backing field declarations across enterprise models.',
        'Initializers Support: Works seamlessly with property initializers: `public string Name { get => field; set => field = value.Trim(); } = "Default";`.'
      ],
      codeOrQuerySnippet: {
        title: 'C# 13 Semi-Auto Properties with field Keyword',
        language: 'csharp',
        code: `public class MortgageRateConfiguration
{
    // C# 13 semi-auto property with inline validation using 'field' keyword
    public decimal BaseRate
    {
        get => field;
        set
        {
            if (value < 0.0m || value > 25.0m)
                throw new ArgumentOutOfRangeException(nameof(value), "Interest rate must be between 0% and 25%.");
            
            field = value; // Assigns directly to synthesized backing field
        }
    } = 5.25m; // Default initializer

    public string LenderCode
    {
        get => field;
        set => field = string.IsNullOrWhiteSpace(value) ? throw new ArgumentNullException() : value.ToUpper();
    } = "CHASE";
}`
      },
      proTipOrPitfall: 'If you already have a class member named `field`, you can disambiguate using `@field` or `this.field` to prevent identifier collisions.',
      studyResources: [
        {
          title: 'Properties - C# programming guide',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/properties',
          source: 'Microsoft Learn'
        }
      ]
    }
  }
];
