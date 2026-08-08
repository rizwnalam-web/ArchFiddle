import { InterviewQuestion } from './interviewPrepData';

export const TOP_20_LANGUAGES_VB: InterviewQuestion[] = [
  {
    id: 'lang-01',
    category: 'Languages & Classic VB',
    question: '1. What are Option Strict and Option Explicit in VB.NET, and how do Late Binding vs Early Binding impact runtime performance and type safety?',
    difficulty: 'Mid-Level (3-5 YOE)',
    tags: ['VB.NET', 'Option Strict', 'Option Explicit', 'Late Binding', 'Type Safety'],
    shortSummary: 'Explains VB.NET compilation flags, dynamic dispatch vs vtable early binding, and implicit type conversions.',
    detailedAnswer: {
      executiveSummary: 'Option Explicit forces explicit variable declarations, preventing typo bugs. Option Strict disallows implicit narrowing conversions and restricts Late Binding, forcing developers to declare explicit types so the compiler can perform Early Binding via vtables for maximum runtime performance.',
      keyPoints: [
        'Option Explicit On: Requires Dim statements before using variables; prevents silent creation of unintended Object variables.',
        'Option Strict On: Disallows implicit narrowing casts (e.g. Double to Integer) and prevents Late Binding.',
        'Early Binding: Resolved at compile time. Method calls execute directly via virtual function tables (vtables), optimizing performance.',
        'Late Binding: Resolved at runtime via Reflection / IDispatch. Incurs severe CPU overhead and hides runtime missing-member errors.'
      ],
      codeOrQuerySnippet: {
        title: 'Option Strict & Early Binding Pattern (VB.NET)',
        language: 'text',
        code: `' Always enable strict compiler flags at top of VB.NET files
Option Explicit On
Option Strict On

Public Class MortgageService
    Public Function ProcessApplication(ByVal appId As Integer) As String
        ' Early Binding: Type is strongly defined at compile time
        Dim dbConn As New System.Data.SqlClient.SqlConnection("Server=sql01;Database=MortgageDB;Trusted_Connection=True;")
        Dim calc As IMortgageCalculator = New StandardCalculator()
        
        Dim monthlyPayment As Decimal = calc.Calculate(400000.00D, 0.065D, 360)
        Return $"Processed App {appId}: Monthly = {monthlyPayment:C}"
    End Function
End Class`
      },
      secondaryCodeSnippet: {
        title: 'Equivalent Strongly Typed C# Implementation',
        language: 'csharp',
        code: `public class MortgageService
{
    public string ProcessApplication(int appId)
    {
        using var dbConn = new SqlConnection("Server=sql01;Database=MortgageDB;Trusted_Connection=True;");
        IMortgageCalculator calc = new StandardCalculator();
        decimal monthlyPayment = calc.Calculate(400000.00m, 0.065m, 360);
        return $"Processed App {appId}: Monthly = {monthlyPayment:C}";
    }
}`
      },
      proTipOrPitfall: 'Always set Option Strict On in project settings for enterprise VB.NET solutions to eliminate hidden runtime TypeCast exceptions.'
    }
  },
  {
    id: 'lang-02',
    category: 'Languages & Classic VB',
    question: '2. What are Visual Basic 6.0 - 9.0 architectural fundamentals, COM / ActiveX controls, DLL Hell, and refactoring strategies for modernizing legacy VB6 / VB 2002-2008 codebases to .NET 8?',
    difficulty: 'Staff / Lead Architect',
    tags: ['VB6', 'VB.NET 2002-2008', 'COM', 'DLL Hell', 'Migration', 'P/Invoke'],
    shortSummary: 'Covers VB6 COM apartments, IDispatch, ActiveX controls, P/Invoke, and automated refactoring to .NET 8 / C#.',
    detailedAnswer: {
      executiveSummary: 'Visual Basic 6.0 relied on COM (Component Object Model), single-threaded apartments (STA), and reference-counted garbage collection (IUnknown). Transitioning from legacy VB6 / VB.NET 2002-2008 (VB 7.0 to 9.0) to modern .NET 8 requires decoupling COM ActiveX dependencies, replacing P/Invoke Win32 calls, and converting late-bound code to C# / .NET 8.',
      keyPoints: [
        'COM & ActiveX Controls: VB6 forms relied on OCX controls bound to Windows registry GUIDs, leading to deployment registration conflicts ("DLL Hell").',
        'VB6 vs VB.NET Memory Model: VB6 used reference counting (objects destroyed immediately when scope ended); .NET uses non-deterministic generational GC.',
        'P/Invoke Win32 API: Legacy VB code declared Win32 API calls (`Declare Function GetUserName Lib "advapi32.dll" ...`). Modern .NET uses system library wrappers.',
        'Refactoring Strategy: Use automated conversion tools (or Roslyn codegen) to convert VB code to C#, replace ADODB recordsets with Entity Framework Core, and isolate legacy COM via Interop wrappers.'
      ],
      codeOrQuerySnippet: {
        title: 'Legacy Visual Basic 6.0 COM / ADODB Pattern',
        language: 'text',
        code: `' Legacy VB6 / ADODB Data Access Pattern
Dim conn As ADODB.Connection
Dim rs As ADODB.Recordset

Set conn = New ADODB.Connection
conn.Open "Provider=SQLOLEDB;Data Source=SQLSERVER01;Initial Catalog=MortgageDB;Integrated Security=SSSSPI;"

Set rs = New ADODB.Recordset
rs.Open "SELECT ApplicationID, BorrowerName FROM Applications WHERE Status = 'Pending'", conn, adOpenForwardOnly, adLockReadOnly

Do While Not rs.EOF
    MsgBox "Borrower: " & rs.Fields("BorrowerName").Value
    rs.MoveNext
Loop

rs.Close
conn.Close
Set rs = Nothing
Set conn = Nothing`
      },
      secondaryCodeSnippet: {
        title: 'Modernized .NET 8 C# Refactoring with EF Core & Async Streams',
        language: 'csharp',
        code: `public async Task StreamPendingApplicationsAsync(CancellationToken ct = default)
{
    await using var db = new MortgageDbContext();
    
    var pendingApps = db.Applications
        .AsNoTracking()
        .Where(a => a.Status == "Pending")
        .Select(a => new { a.ApplicationId, a.BorrowerName })
        .AsAsyncEnumerable();

    await foreach (var app in pendingApps.WithCancellation(ct))
    {
        _logger.LogInformation("Borrower: {BorrowerName}", app.BorrowerName);
    }
}`
      },
      proTipOrPitfall: 'When migrating legacy VB6 to .NET, watch out for 1-based arrays (`Option Base 1`), Default Properties on objects, and deterministic destructors (`Class_Terminate`).'
    }
  },
  {
    id: 'lang-03',
    category: 'Languages & Classic VB',
    question: '3. How does the JavaScript V8 Event Loop manage Microtasks (Promises) vs Macrotasks (setTimeout, I/O), Prototypal Inheritance, and Closures?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['JavaScript', 'V8 Event Loop', 'Microtasks', 'Closures', 'Prototypal Inheritance'],
    shortSummary: 'Explains call stack execution, microtask queue priority, prototype chain lookup, and lexical closure memory retention.',
    detailedAnswer: {
      executiveSummary: 'JavaScript executes on a single-threaded event loop driven by the V8 engine. Understanding execution context, Call Stack operations, Microtask queue priority (Promises, process.nextTick) over Macrotask queues (setTimeout, setInterval, I/O), and Closures is essential for high-performance JS apps.',
      keyPoints: [
        'Event Loop Order: 1. Execute Call Stack -> 2. Flush ALL Microtasks -> 3. Render UI / Paint -> 4. Pick ONE Macrotask -> Repeat.',
        'Microtasks vs Macrotasks: Promises, queueMicrotask, and MutationObservers are Microtasks; setTimeout, setImmediate, and I/O callbacks are Macrotasks.',
        'Prototypal Inheritance: Objects inherit properties via an internal [[Prototype]] link (__proto__). Property resolution walks up the prototype chain until null.',
        'Closures: Inner functions retain access to outer lexical scope variables even after outer function execution terminates. Can cause memory leaks if outer variables reference large objects.'
      ],
      codeOrQuerySnippet: {
        title: 'Event Loop Order Interview Quiz (JavaScript)',
        language: 'typescript',
        code: `console.log('1: Sync');

setTimeout(() => {
  console.log('2: Macrotask (setTimeout)');
}, 0);

Promise.resolve().then(() => {
  console.log('3: Microtask 1 (Promise)');
}).then(() => {
  console.log('4: Microtask 2 (Promise)');
});

console.log('5: Sync End');

// Expected Console Output Order:
// 1: Sync
// 5: Sync End
// 3: Microtask 1 (Promise)
// 4: Microtask 2 (Promise)
// 2: Macrotask (setTimeout)`
      },
      proTipOrPitfall: 'Continuous recursive Promise chaining or microtask loops can starve the Macrotask queue and completely freeze UI rendering in web browsers.'
    }
  }
];

export const TOP_20_WEB_FRAMEWORKS: InterviewQuestion[] = [
  {
    id: 'web-01',
    category: 'Web Frameworks & Legacy',
    question: '1. What are the key architectural differences between ASP.NET Web Forms (Page Lifecycle, ViewState) vs ASP.NET MVC vs ASP.NET Core Middleware Pipeline?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['ASP.NET', 'Web Forms', 'ASP.NET MVC', 'ASP.NET Core', 'Middleware'],
    shortSummary: 'Compares server control event model, ViewState payload bloat, RESTful MVC routing, and lightweight OWIN/ASP.NET Core middleware pipelines.',
    detailedAnswer: {
      executiveSummary: 'ASP.NET evolved from server-side stateful Web Forms (which abstracted HTTP into a synthetic event model with ViewState) to stateless RESTful ASP.NET MVC, and ultimately to cross-platform ASP.NET Core built around modular, high-performance Request Middleware Pipelines.',
      keyPoints: [
        'ASP.NET Web Forms: Emulated desktop event-driven GUI (Init, Load, PostBack, Render). Stored control state in hidden base64 `__VIEWSTATE` payloads, creating heavy network overhead.',
        'ASP.NET MVC: Separated concerns into Model, View, and Controller. Leveraged stateless HTTP, custom routing tables, and Razor view compilation.',
        'ASP.NET Core Middleware: Uses `RequestDelegate` pipeline `app.Use(...)` where components process requests sequentially in an onion-architecture chain with zero dependency on System.Web.dll.'
      ],
      codeOrQuerySnippet: {
        title: 'ASP.NET Core Request Middleware Pipeline (C#)',
        language: 'csharp',
        code: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Custom Exception Handling & Security Middleware Pipeline
app.UseExceptionHandler("/api/error");
app.UseHsts();
app.UseHttpsRedirection();

// Inline Custom Request Timing Middleware
app.Use(async (context, next) =>
{
    var sw = Stopwatch.StartNew();
    await next(context); // Call next middleware in pipeline
    sw.Stop();
    context.Response.Headers.Add("X-Response-Time-Ms", sw.ElapsedMilliseconds.ToString());
});

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run("http://0.0.0.0:3000");`
      },
      proTipOrPitfall: 'Order matters in ASP.NET Core middleware! Authentication (`UseAuthentication`) MUST always be placed BEFORE Authorization (`UseAuthorization`).'
    }
  },
  {
    id: 'web-02',
    category: 'Web Frameworks & Legacy',
    question: '2. How does AngularJS (1.6) $scope, Digest Cycle ($digest / $apply), and Directives compare to Angular 2.0+ Component Architecture, and how do you migrate using ngUpgrade?',
    difficulty: 'Staff / Lead Architect',
    tags: ['AngularJS 1.6', 'Angular 2.0', 'Digest Cycle', '$scope', 'ngUpgrade', 'Migration'],
    shortSummary: 'Explains two-way binding dirty checking in AngularJS, zone.js reactivity in Angular 2+, and incremental hybrid migration with ngUpgrade.',
    detailedAnswer: {
      executiveSummary: 'AngularJS (1.x) relied on two-way data binding powered by $scope dirty checking inside $digest loops. Angular 2.0+ eliminated $scope and $digest in favor of unidirectional data flow, TypeScript class components, Zone.js change detection, and reactive RxJS streams / Signals. `ngUpgrade` enables running AngularJS 1.6 and modern Angular 2.0+ side-by-side in a single hybrid app.',
      keyPoints: [
        'AngularJS Digest Cycle: When DOM events trigger, $scope.$apply() executes $digest loop, re-evaluating all $watch expressions. Excessive watchers cause severe UI lag.',
        'Angular 2.0+ Component Model: Standardizes on `@Component` decorators, explicit `@Input()` / `@Output()` bindings, and unidirectional change detection.',
        'ngUpgrade Strategy: Boots an Angular 2+ `UpgradeModule` that bootstraps the legacy AngularJS 1.6 application, allowing components and services to be upgraded incrementally using `downgradeComponent` and `upgradeProvider`.'
      ],
      codeOrQuerySnippet: {
        title: 'AngularJS 1.6 Component vs Modern Angular 2+ Component',
        language: 'typescript',
        code: `// --- 1. Legacy AngularJS 1.6 Component Definition ---
angular.module('mortgageApp').component('borrowerCard', {
  bindings: { borrower: '<', onUpdate: '&' },
  template: \`<div class="card"><h4>{{ $ctrl.borrower.name }}</h4><button ng-click="$ctrl.onUpdate()">Save</button></div>\`,
  controller: function() {
    var $ctrl = this;
    $ctrl.$onInit = function() { console.log('AngularJS Borrower Card initialized'); };
  }
});

// --- 2. Modern Angular 2+ / 18+ Component Definition ---
@Component({
  selector: 'app-borrower-card',
  standalone: true,
  template: \`<div class="card"><h4>{{ borrower().name }}</h4><button (click)="onUpdate.emit()">Save</button></div>\`
})
export class BorrowerCardComponent {
  borrower = input.required<{ name: string }>();
  onUpdate = output<void>();
}`
      },
      proTipOrPitfall: 'When migrating from AngularJS 1.6 to modern Angular, convert AngularJS Controllers to 1.5/1.6 `.component()` syntax first before attempting `ngUpgrade` conversion.'
    }
  },
  {
    id: 'web-03',
    category: 'Web Frameworks & Legacy',
    question: '3. What is Knockout.js MVVM Architecture, ko.observable, ko.computed, and how do custom bindings prevent memory leaks in legacy enterprise web apps?',
    difficulty: 'Mid-Level (3-5 YOE)',
    tags: ['Knockout.js', 'MVVM', 'ko.observable', 'ko.computed', 'Legacy Web'],
    shortSummary: 'Covers Knockout observable subscriptions, dependency tracking, data-bind attributes, and Dispose callbacks.',
    detailedAnswer: {
      executiveSummary: 'Knockout.js is a client-side MVVM framework that uses Observable functions (`ko.observable`, `ko.observableArray`, `ko.computed`) to bind JavaScript view models directly to HTML DOM attributes using `data-bind`. Automated dependency tracking updates the DOM when observables change.',
      keyPoints: [
        'ko.observable(): Wraps primitive values or objects in getter/setter functions that notify subscribers on mutation.',
        'ko.computed(): Evaluates an expression derived from other observables, automatically subscribing to any observable accessed during evaluation.',
        'Memory Leaks: Unmanaged manual `.subscribe()` handlers or custom bindings that do not register `ko.utils.domNodeDisposal.addDisposeCallback` retain DOM node references indefinitely.'
      ],
      codeOrQuerySnippet: {
        title: 'Knockout.js MVVM View Model Pattern',
        language: 'javascript',
        code: `function MortgageViewModel(loanAmount, rate) {
    var self = this;
    self.loanAmount = ko.observable(loanAmount);
    self.annualRate = ko.observable(rate);

    // Computed Observable with automatic dependency tracking
    self.formattedRate = ko.computed(function() {
        return (self.annualRate() * 100).toFixed(2) + "%";
    });

    self.calculatePayment = function() {
        alert("Calculating payment for loan: $" + self.loanAmount());
    };
}

// Bind View Model to HTML DOM
ko.applyBindings(new MortgageViewModel(350000, 0.065));`
      },
      proTipOrPitfall: 'When destroying dynamic Knockout DOM elements (e.g. inside modal dialogs), always call `ko.cleanNode(element)` to release event listeners and subscription memory.'
    }
  },
  {
    id: 'web-04',
    category: 'Web Frameworks & Legacy',
    question: '4. How does Classic ASP (Active Server Pages) execute VBScript / JScript, utilize Server.CreateObject for ADODB, and manage COM component threading models?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Classic ASP', 'VBScript', 'ADODB', 'COM', 'Legacy Architectures'],
    shortSummary: 'Covers Classic ASP request processing, IIS inetinfo execution, ADODB.Connection, and Session state lock bottlenecks.',
    detailedAnswer: {
      executiveSummary: 'Classic ASP (1996-2002) is a server-side scripting environment for IIS that executes VBScript or JScript line-by-line inside `.asp` files. It interfaces with databases using COM components like ADODB.Connection and ADODB.Recordset instantiated via `Server.CreateObject`.',
      keyPoints: [
        'Built-in Objects: Request, Response, Server, Session, and Application objects provided global execution scope.',
        'COM Threading Models: Single-Threaded Apartment (STA) vs Both/Free Threading. Storing STA COM objects in ASP Session variables locked thread pools and degraded IIS scalability.',
        'Session Locking: IIS serializes requests for a given Session ID, preventing concurrent execution of multiple ASP pages for the same user.'
      ],
      codeOrQuerySnippet: {
        title: 'Classic ASP (VBScript) & ADODB Data Access',
        language: 'html',
        code: `<%@ Language=VBScript %>
<%
Option Explicit
Response.Buffer = True

Dim conn, rs, sql
Set conn = Server.CreateObject("ADODB.Connection")
conn.Open "Provider=SQLOLEDB;Data Source=SQLSERVER01;Initial Catalog=MortgageDB;User Id=asp_user;Password=secret;"

sql = "SELECT ApplicationID, Amount FROM MortgageApps WHERE Status = 'Pending'"
Set rs = conn.Execute(sql)
%>
<html>
<body>
  <h2>Pending Applications</h2>
  <ul>
  <% Do While Not rs.EOF %>
    <li>App #<%= rs("ApplicationID") %> - $<%= FormatNumber(rs("Amount"), 2) %></li>
  <% 
     rs.MoveNext
     Loop 
     rs.Close
     conn.Close
     Set rs = Nothing
     Set conn = Nothing
  %>
  </ul>
</body>
</html>`
      },
      proTipOrPitfall: 'Always set `Response.Buffer = True` and set COM objects to `Nothing` explicitly at the bottom of Classic ASP pages to prevent IIS thread leaks.'
    }
  },
  {
    id: 'web-05',
    category: 'Web Frameworks & Legacy',
    question: '5. How does React Native execute cross-platform code using the Bridge vs New Architecture (Fabric, TurboModules, JSI), and Yoga Layout Engine?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['React Native', 'Fabric', 'TurboModules', 'JSI', 'Yoga', 'Mobile'],
    shortSummary: 'Compares asynchronous JSON Bridge serializations vs zero-copy C++ JSI synchronous native calls and Yoga flexbox layout.',
    detailedAnswer: {
      executiveSummary: 'React Native allows building native iOS and Android apps using React. The legacy architecture relied on an asynchronous JSON Bridge for communication between JavaScript and Native threads. The New Architecture replaces the Bridge with JSI (JavaScript Interface), TurboModules, and Fabric renderer for direct C++ thread synchronous execution.',
      keyPoints: [
        'Legacy Bridge: Batched asynchronous JSON messages between JS thread and Native thread; caused UI stutter during fast scrolling.',
        'JSI (JavaScript Interface): Allows JS thread to hold direct C++ references to Host Objects, eliminating JSON serialization overhead.',
        'Fabric Renderer: Modern C++ rendering engine operating directly with JSI for synchronous UI updates and surface concurrency.',
        'Yoga Layout Engine: Cross-platform C++ layout engine that calculates Flexbox coordinates into native iOS/Android view trees.'
      ],
      codeOrQuerySnippet: {
        title: 'React Native TurboModule / Native Method Call Pattern',
        language: 'typescript',
        code: `import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // Synchronous C++ execution enabled by JSI / TurboModules
  getDeviceSecurityStatus(): { isJailbroken: boolean; osVersion: string };
  encryptPayload(payload: string): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('MortgageSecurityModule');`
      },
      proTipOrPitfall: 'Avoid heavy computations or large synchronous operations inside JSI methods—doing so blocks the JS main thread and drops frame rates.'
    }
  }
];

export const TOP_20_ENTERPRISE_DATABASES: InterviewQuestion[] = [
  {
    id: 'db-01',
    category: 'Enterprise Databases',
    question: '1. What is Snowflake Architecture, and how do Micro-partitions, Virtual Warehouses, Zero-Copy Cloning, Time Travel, and Snowpipe optimize cloud analytics?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Snowflake', 'Data Warehouse', 'Micro-partitions', 'Time Travel', 'Zero-Copy Cloning'],
    shortSummary: 'Explains Snowflake decoupled storage/compute, automatic micro-partitioning, metadata cloning, and continuous ingestion.',
    detailedAnswer: {
      executiveSummary: 'Snowflake is a cloud-native SaaS enterprise data warehouse featuring decoupled storage, multi-cluster compute (Virtual Warehouses), and a centralized Cloud Services layer. Data is automatically organized into columnar, compressed Micro-partitions (50MB–150MB uncompressed) managed transparently by Snowflake.',
      keyPoints: [
        'Decoupled Compute & Storage: Compute clusters (Virtual Warehouses) can be resized, suspended, or scaled independently without re-indexing storage.',
        'Micro-partitions: Immutable columnar files automatically partitioned as data is ingested; enables fast query pruning using metadata (min/max values).',
        'Zero-Copy Cloning: Creates instant metadata-only copies of tables, schemas, or databases without duplicating underlying storage bytes.',
        'Time Travel & Fail-safe: Query historical data up to 90 days (`AT(TIMESTAMP => ...)`) and recover accidentally dropped tables.',
        'Snowpipe: Automated, continuous serverless file ingestion service that loads data from S3/Azure Blob Storage as soon as files land.'
      ],
      codeOrQuerySnippet: {
        title: 'Snowflake Zero-Copy Clone, Time Travel & JSON Querying',
        language: 'sql',
        code: `-- 1. Instant Zero-Copy Clone for Dev Testing (Zero Storage Cost)
CREATE DATABASE MortgageDB_Dev CLONE MortgageDB_Prod;

-- 2. Query Table State as it existed 2 hours ago using Time Travel
SELECT COUNT(*) 
FROM MortgageDB_Prod.Public.LoanApplications 
AT(OFFSET => -2 * 3600);

-- 3. Query Semi-Structured VARIANT JSON Data natively in Snowflake
SELECT 
    v:borrower.ssn::STRING AS BorrowerSSN,
    v:creditScore::INT AS CreditScore
FROM MortgageDB_Prod.Public.RawEvents
WHERE v:creditScore::INT > 720;`
      },
      proTipOrPitfall: 'Auto-suspend Virtual Warehouses after 1-2 minutes of inactivity to avoid unneeded cloud credits consumption.'
    }
  },
  {
    id: 'db-02',
    category: 'Enterprise Databases',
    question: '2. How does PostgreSQL manage Concurrency using MVCC (Multi-Version Concurrency Control), Write-Ahead Logging (WAL), VACUUM / Autovacuum, and JSONB GIN Indexing?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['PostgreSQL', 'MVCC', 'WAL', 'VACUUM', 'JSONB', 'GIN Index'],
    shortSummary: 'Covers PostgreSQL row tuple versions (xmin/xmax), dead tuple cleanup with VACUUM, WAL crash recovery, and GIN JSON search.',
    detailedAnswer: {
      executiveSummary: 'PostgreSQL achieves ACID compliance and high concurrency using Multi-Version Concurrency Control (MVCC). Instead of locking rows during updates, PostgreSQL writes a new row tuple version with `xmin` and `xmax` transaction identifiers. Autovacuum cleans up dead tuples to prevent table bloat.',
      keyPoints: [
        'MVCC & Tuple Versioning: UPDATE statements insert a new tuple and mark the old tuple as dead. Readers never block writers, and writers never block readers.',
        'VACUUM & Autovacuum: Scans tables to reclaim space occupied by dead tuples and update visibility maps. Neglecting Autovacuum leads to severe table bloat and transaction ID wraparound.',
        'Write-Ahead Logging (WAL): Ensures durability (D in ACID) by recording all changes to disk before modifying actual data pages.',
        'JSONB & GIN Indexes: JSONB stores decomposed binary JSON; Generalized Inverted Indexes (GIN) index containment operators (`@>`) for fast JSON searching.'
      ],
      codeOrQuerySnippet: {
        title: 'PostgreSQL JSONB GIN Indexing & MVCC Diagnostic Queries',
        language: 'sql',
        code: `-- Create JSONB Column & GIN Index
CREATE TABLE borrower_profiles (
    id UUID PRIMARY KEY,
    metadata JSONB NOT NULL
);

CREATE INDEX idx_borrower_metadata_gin ON borrower_profiles USING gin (metadata);

-- Fast JSONB containment query utilizing GIN Index
SELECT id, metadata->>'name' AS borrower_name
FROM borrower_profiles
WHERE metadata @> '{"creditTier": "PRIME", "verified": true}';

-- Check Dead Tuple Bloat for Autovacuum health
SELECT relname, n_dead_tup, n_live_tup, 
       ROUND(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_percentage
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;`
      },
      proTipOrPitfall: 'Tune `autovacuum_vacuum_scale_factor` down to 0.05 on large high-write PostgreSQL tables so vacuuming triggers frequently in small batches rather than locking large tables.'
    }
  },
  {
    id: 'db-03',
    category: 'Enterprise Databases',
    question: '3. What are Oracle Database PL/SQL Packages, Real Application Clusters (RAC), Tablespaces, System Global Area (SGA), and Autonomous DB capabilities?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Oracle', 'PL/SQL', 'Oracle RAC', 'Tablespaces', 'SGA', 'Autonomous Database'],
    shortSummary: 'Covers PL/SQL encapsulation, cache Fusion multi-node RAC, memory SGA buffers, and auto-indexing Autonomous DB.',
    detailedAnswer: {
      executiveSummary: 'Oracle Database is an enterprise relational database system engineered for mission-critical workloads. Key architectural concepts include PL/SQL procedural extensions, Real Application Clusters (RAC) for shared-disk high availability, System Global Area (SGA) shared memory architecture, and cloud Autonomous Database auto-tuning.',
      keyPoints: [
        'PL/SQL Packages: Encapsulates procedures, functions, variables, and cursors into compiled Spec and Body definitions.',
        'Oracle RAC (Real Application Clusters): Multiple database instances running on different servers share a single disk array using Cache Fusion over high-speed interconnects.',
        'SGA (System Global Area): Shared memory region containing Database Buffer Cache, Shared Pool (library cache for SQL execution plans), and Redo Log Buffer.',
        'Autonomous Database: Self-driving cloud database that automates patching, indexing, scaling, and security updates without downtime.'
      ],
      codeOrQuerySnippet: {
        title: 'Oracle PL/SQL Package Specification & Body Pattern',
        language: 'sql',
        code: `-- Package Specification (Header interface)
CREATE OR REPLACE PACKAGE Mortgage_Pkg AS
    TYPE RefCursor IS REF CURSOR;
    PROCEDURE GetApprovedLoans(p_minScore IN NUMBER, p_cursor OUT RefCursor);
END Mortgage_Pkg;
/

-- Package Body (Implementation)
CREATE OR REPLACE PACKAGE BODY Mortgage_Pkg AS
    PROCEDURE GetApprovedLoans(p_minScore IN NUMBER, p_cursor OUT RefCursor) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT loan_id, borrower_name, loan_amount
            FROM loan_applications
            WHERE credit_score >= p_minScore AND status = 'APPROVED';
    END GetApprovedLoans;
END Mortgage_Pkg;
/`
      },
      proTipOrPitfall: 'In Oracle PL/SQL, always use bind variables (`:val`) in dynamic SQL strings to prevent Hard Parses from clogging the SGA Shared Pool.'
    }
  },
  {
    id: 'db-04',
    category: 'Enterprise Databases',
    question: '4. How do MySQL InnoDB Storage Engine, B-Tree vs Hash Indexes, Multi-Source Replication, and InnoDB Buffer Pool tuning work?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['MySQL', 'InnoDB', 'Replication', 'Buffer Pool', 'B-Tree Index'],
    shortSummary: 'Explains InnoDB clustered index architecture, undo/redo logs, GTID replication, and buffer pool memory optimization.',
    detailedAnswer: {
      executiveSummary: 'MySQL relies on the ACID-compliant InnoDB storage engine. InnoDB stores table rows inside the primary key B-Tree index (Clustered Index), uses Redo Logs for crash recovery, and relies on the InnoDB Buffer Pool to cache table and index data pages in memory.',
      keyPoints: [
        'InnoDB Clustered Index: Primary keys store the actual table row data in leaf nodes. Secondary indexes store primary key values as pointers.',
        'B-Tree vs Hash Indexes: B-Tree indexes support range queries (`<`, `>`, `BETWEEN`), equality searches, and sorting. Hash indexes (used in MEMORY tables) only support exact equality (`=`).',
        'Replication: Asynchronous or Semi-Synchronous replication via Global Transaction Identifiers (GTID) relays binlog events from primary to replica nodes.',
        'Buffer Pool Tuning: `innodb_buffer_pool_size` should typically be configured to 60%-80% of total dedicated RAM in production database servers.'
      ],
      codeOrQuerySnippet: {
        title: 'MySQL InnoDB Performance Diagnostic Queries',
        language: 'sql',
        code: `-- Check InnoDB Buffer Pool Hit Ratio (Target > 99%)
SELECT 
    (1 - (Innodb_buffer_pool_reads / Innodb_buffer_pool_read_requests)) * 100 AS buffer_pool_hit_ratio
FROM 
    (SELECT variable_value AS Innodb_buffer_pool_reads FROM performance_schema.global_status WHERE variable_name='Innodb_buffer_pool_reads') a,
    (SELECT variable_value AS Innodb_buffer_pool_read_requests FROM performance_schema.global_status WHERE variable_name='Innodb_buffer_pool_read_requests') b;

-- Analyze Query Index Usage with EXPLAIN FORMAT=JSON
EXPLAIN FORMAT=JSON
SELECT id, borrower_name, amount 
FROM mortgage_loans 
WHERE status = 'APPROVED' AND origination_date >= '2024-01-01';`
      },
      proTipOrPitfall: 'Never use UUID strings as MySQL InnoDB primary keys without ordering strategy—random UUID inserts cause constant B-Tree page splits and severe write amplification.'
    }
  },
  {
    id: 'db-05',
    category: 'Enterprise Databases',
    question: '5. What is Microsoft Access Architecture (JET / ACE Engine, DAO vs ADO, .mdb vs .accdb formats), .laccdb multi-user locking, and how do you migrate to SQL Server using SSMA?',
    difficulty: 'Mid-Level (3-5 YOE)',
    tags: ['MS Access', 'JET Engine', 'ACE Engine', 'DAO', 'ADO', 'SSMA', 'SQL Migration'],
    shortSummary: 'Covers JET/ACE database engines, multi-user lock files (.laccdb), file-server limitations, and SQL Server Migration Assistant (SSMA).',
    detailedAnswer: {
      executiveSummary: 'Microsoft Access is a desktop relational database system using the JET (Joint Engine Technology) or ACE (Access Database Engine) engine. Access combines UI Forms, Reports, and database tables into `.mdb` or `.accdb` files. Enterprise applications migrate legacy Access databases to SQL Server using SSMA (SQL Server Migration Assistant).',
      keyPoints: [
        'JET / ACE Engines: JET (.mdb) and ACE (.accdb) act as file-based database engines where database processing executes on the client desktop rather than a server daemon.',
        'Multi-User Locking (.laccdb): A temporary lock file created when a database is opened to manage row/page level locking; susceptible to file corruption over network shares when >10-15 users connect concurrently.',
        'DAO vs ADO: DAO (Data Access Objects) is optimized specifically for native JET/ACE engines; ADO (ActiveX Data Objects) provides a generic interface for SQL Server / OLEDB.',
        'SSMA Migration: Automatically converts Access queries, forms, VBA macros, and table schemas into T-SQL DDL and transfers data into MS SQL Server.'
      ],
      codeOrQuerySnippet: {
        title: 'Legacy VBA / DAO Access Code vs Migrated SQL Server T-SQL',
        language: 'text',
        code: `' Legacy MS Access VBA (DAO Engine)
Dim db As DAO.Database
Dim rs As DAO.Recordset

Set db = CurrentDb()
Set rs = db.OpenRecordset("SELECT ApplicationID, BorrowerName FROM Loans WHERE Status = 'Pending'")

Do While Not rs.EOF
    Debug.Print "Loan: " & rs!ApplicationID & " - " & rs!BorrowerName
    rs.MoveNext
Loop

rs.Close
Set rs = Nothing
Set db = Nothing`
      },
      secondaryCodeSnippet: {
        title: 'Migrated SQL Server Stored Procedure (T-SQL)',
        language: 'sql',
        code: `-- Migrated T-SQL Stored Procedure on SQL Server
CREATE PROCEDURE dbo.usp_GetPendingLoans
AS
BEGIN
    SET NOCOUNT ON;
    SELECT ApplicationID, BorrowerName, Amount, CreatedDate
    FROM dbo.Loans
    WHERE Status = 'Pending';
END;`
      },
      proTipOrPitfall: 'When Access databases suffer corruption due to network drops, use the built-in "Compact & Repair Database" utility before initiating SSMA migration to SQL Server.'
    }
  }
];
