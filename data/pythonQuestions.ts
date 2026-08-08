import { InterviewQuestion } from './interviewPrepData';

export const TOP_20_PYTHON: InterviewQuestion[] = [
  {
    id: 'py-01',
    category: 'Python',
    question: '1. How does Python\'s Memory Management work under the hood (Reference Counting + Generational Cyclic Garbage Collection), and how does __slots__ optimize memory?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Python', 'Memory Management', 'Garbage Collection', 'Reference Counting', '__slots__', 'CPython'],
    shortSummary: 'Explains PyObject ob_refcnt, cyclic reference detection (Gen 0/1/2), weakref, and eliminating instance __dict__ overhead via __slots__.',
    detailedAnswer: {
      executiveSummary: 'CPython uses a two-tier memory management system: primary Reference Counting for instantaneous deallocation when `ob_refcnt == 0`, supplemented by a tri-generational cyclic Garbage Collector (Gen 0, 1, 2) that detects reference cycles by tracking pointer graphs. By default, every class instance creates a dynamic `__dict__` hash table (~150 bytes overhead). Using `__slots__` replaces `__dict__` with a static array of C struct pointers, reducing memory by up to 60-80% for millions of objects.',
      keyPoints: [
        'Reference Counting: Incremented on assignments/function calls and decremented on scope exits. When count hits 0, memory is freed immediately.',
        'Cyclic Reference Problem: Object A refers to Object B and Object B refers to Object A. Reference counting alone cannot collect them when outside references drop to 0.',
        'Generational GC: Collects isolated cyclic islands. Objects surviving collections are promoted from Gen 0 -> Gen 1 -> Gen 2.',
        '__slots__ Optimization: Prevents dynamic attribute creation and removes `__dict__` allocation, drastically reducing heap overhead in high-scale data models.'
      ],
      codeOrQuerySnippet: {
        title: 'Diagnosing Reference Cycles & Optimizing with __slots__ (Python 3.11+)',
        language: 'text',
        code: `import sys
import gc

class StandardBorrower:
    def __init__(self, name: str, ssn: str, credit_score: int):
        self.name = name
        self.ssn = ssn
        self.credit_score = credit_score

class OptimizedBorrower:
    # __slots__ replaces __dict__ with a fixed-size C struct array
    __slots__ = ('name', 'ssn', 'credit_score')
    
    def __init__(self, name: str, ssn: str, credit_score: int):
        self.name = name
        self.ssn = ssn
        self.credit_score = credit_score

# Memory comparison:
std_obj = StandardBorrower("John Doe", "123-45-6789", 750)
opt_obj = OptimizedBorrower("John Doe", "123-45-6789", 750)

print(f"Standard Object Size (+ __dict__): {sys.getsizeof(std_obj) + sys.getsizeof(std_obj.__dict__)} bytes")
print(f"Optimized __slots__ Object Size: {sys.getsizeof(opt_obj)} bytes")

# Cyclic Reference Detection:
class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

a = Node(1)
b = Node(2)
a.next = b
b.next = a  # Cycle created!
del a, b    # Reference count never drops to 0!

unreachable_count = gc.collect()  # Generational GC sweeps and frees the cycle
print(f"Generational GC collected {unreachable_count} unreachable cyclic objects.")`
      },
      proTipOrPitfall: 'Avoid creating `__del__()` (finalizer) methods on objects in cyclic references if using Python versions before 3.4; in modern Python, `__del__` is safe but can still mask exception handling bugs.',
      studyResources: [
        {
          title: 'Python Memory Management & Garbage Collector Internals',
          url: 'https://docs.python.org/3/library/gc.html',
          source: 'Python Official Documentation',
          description: 'Official deep dive on gc module, thresholds, and cycle detection.'
        }
      ]
    }
  },
  {
    id: 'py-02',
    category: 'Python',
    question: '2. What is the Global Interpreter Lock (GIL) in CPython, how does it affect CPU vs I/O bound concurrency, and what is Free-Threaded Python (PEP 703 in Python 3.13)?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Python', 'GIL', 'CPython', 'PEP 703', 'Threading', 'Multiprocessing', 'Python 3.13'],
    shortSummary: 'Covers GIL mutex thread safety, CPU bound thread contention, subinterpreters (PEP 684), and the no-GIL free-threaded build in Python 3.13.',
    detailedAnswer: {
      executiveSummary: 'The Global Interpreter Lock (GIL) is a mutual-exclusion mutex in CPython that prevents multiple native OS threads from executing Python bytecode simultaneously. It simplifies memory management and C extensions but restricts CPU-bound multithreaded code to a single CPU core. I/O-bound tasks release the GIL during syscalls (socket read, file I/O). Python 3.13 introduced experimental Free-Threaded Python (PEP 703) using mimalloc and biased reference counting to eliminate the GIL entirely.',
      keyPoints: [
        'Why GIL Exists: CPython\'s reference counting is not thread-safe without atomic operations. The GIL protects object state without per-object lock overhead.',
        'I/O vs CPU Concurrency: In I/O-bound operations (HTTP requests, DB calls), threads release the GIL while waiting. In CPU-bound work, multithreading runs slower than single-threading due to GIL lock contention.',
        'Bypassing the GIL: Use `multiprocessing`, `ProcessPoolExecutor`, C/Rust extensions (Cython/PyO3 with `nogil`), or subinterpreters (PEP 684).',
        'Python 3.13 Free-Threaded (PEP 703): Replaces global GIL with thread-safe garbage collection, enabling true multi-core parallel CPU execution in native Python threads.'
      ],
      codeOrQuerySnippet: {
        title: 'CPU Parallelism: ProcessPool vs ThreadPool with GIL Bypass (Python)',
        language: 'text',
        code: `import concurrent.futures
import time
import math

def cpu_heavy_prime_check(n: int) -> bool:
    if n < 2: return False
    for i in range(2, int(math.isqrt(n)) + 1):
        if n % i == 0: return False
    return True

numbers = [1000000007, 1000000009, 1000000021, 1000000033] * 4

# 1. ThreadPoolExecutor (Constrained by GIL - runs on 1 core)
start = time.perf_counter()
with concurrent.futures.ThreadPoolExecutor() as executor:
    results = list(executor.map(cpu_heavy_prime_check, numbers))
print(f"ThreadPool (GIL Constrained): {time.perf_counter() - start:.3f}s")

# 2. ProcessPoolExecutor (Bypasses GIL - runs across all CPU cores)
start = time.perf_counter()
with concurrent.futures.ProcessPoolExecutor() as executor:
    results = list(executor.map(cpu_heavy_prime_check, numbers))
print(f"ProcessPool (Multi-Core True Parallelism): {time.perf_counter() - start:.3f}s")`
      },
      proTipOrPitfall: 'When using `multiprocessing` on Windows and macOS, always wrap entry-point scripts inside `if __name__ == \'__main__\':` to prevent recursive process spawning loops.'
    }
  },
  {
    id: 'py-03',
    category: 'Python',
    question: '3. How does Python asyncio work under the hood (Event Loop, Coroutines, Tasks), and why should you use asyncio.TaskGroup (Structured Concurrency in Python 3.11+) over asyncio.gather()?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Python', 'Asyncio', 'TaskGroup', 'Structured Concurrency', 'Event Loop', 'Coroutines'],
    shortSummary: 'Explains coroutine frame suspension, Task wrappers, ExceptionGroup handling, and safe cancellation semantics in TaskGroup.',
    detailedAnswer: {
      executiveSummary: 'Python `asyncio` runs a single-threaded cooperative multitasking event loop. Coroutines (`async def`) are paused and resumed at `await` yield points via generator frames. `asyncio.gather()` executes tasks concurrently but suffers from poor error handling: if one task fails, remaining tasks continue running as orphaned background tasks. `asyncio.TaskGroup` (introduced in Python 3.11) enforces Structured Concurrency: if any child task raises an exception, all other tasks in the group are immediately cancelled, and exceptions are bundled into an `ExceptionGroup`.',
      keyPoints: [
        'Event Loop: Schedules callbacks, executes ready coroutines, and handles OS multiplexing (epoll on Linux, kqueue on macOS).',
        'Coroutine vs Task: A coroutine object does not execute until awaited or wrapped into an `asyncio.Task` scheduled on the loop.',
        'Why TaskGroup is superior: Guarantees no orphaned background tasks, cancels siblings on failures, and preserves full stack traces inside `except*` blocks.',
        'Async Generators: `async def fetch_stream(): yield ...` allows memory-efficient streaming over HTTP/WebSockets.'
      ],
      codeOrQuerySnippet: {
        title: 'Structured Concurrency with asyncio.TaskGroup & ExceptionGroup (Python 3.11+)',
        language: 'text',
        code: `import asyncio
import httpx

async def fetch_mortgage_rate(provider: str, timeout: float) -> dict:
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.get(f"https://api.mortgage.bank/{provider}/rates")
        response.raise_for_status()
        return {"provider": provider, "data": response.json()}

async def aggregate_all_rates():
    providers = ["fannie_mae", "freddie_mac", "wells_fargo"]
    results = []
    
    try:
        # Structured Concurrency: If any task raises an exception, siblings are cleanly cancelled!
        async with asyncio.TaskGroup() as tg:
            tasks = [tg.create_task(fetch_mortgage_rate(p, timeout=3.0)) for p in providers]
            
        # All tasks guaranteed completed upon exiting context manager
        results = [t.result() for t in tasks]
        return results
        
    except* httpx.HTTPStatusError as eg:
        # Python 3.11+ ExceptionGroup pattern matching
        for exc in eg.exceptions:
            print(f"HTTP Error from provider: {exc}")
    except* asyncio.TimeoutError as eg:
        print("At least one provider timed out.")`
      },
      proTipOrPitfall: 'Never call blocking synchronous functions (like `time.sleep()`, `requests.get()`, or raw file I/O) directly inside an `async def` function. It blocks the entire asyncio event loop for all concurrent users. Use `asyncio.to_thread(blocking_func)` instead.'
    }
  },
  {
    id: 'py-04',
    category: 'Python',
    question: '4. How do Python Descriptors (__get__, __set__, __delete__) and Metaclasses work, and how do frameworks like Pydantic and Django ORM use them?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Python', 'Descriptors', 'Metaclasses', '__init_subclass__', 'Pydantic', 'ORM'],
    shortSummary: 'Covers descriptor protocol, attribute lookup order (__getattribute__), metaclass type.__new__, and validation engine construction.',
    detailedAnswer: {
      executiveSummary: 'A Descriptor is a Python object that defines `__get__()`, `__set__()`, or `__delete__()` methods to customize attribute access on classes (e.g. `@property`, `@classmethod`, and ORM field mappings). Metaclasses (`type`) are "classes of classes" that intercept class definition time to dynamically inspect class dictionaries, register models, and construct schema validators. Modern Python also provides `__init_subclass__` as a cleaner alternative to metaclasses.',
      keyPoints: [
        'Attribute Lookup Hierarchy: Data Descriptors (both `__get__` and `__set__`) > Instance `__dict__` > Non-Data Descriptors (only `__get__`) > Class `__dict__`.',
        'How ORM / Pydantic Works: Model fields are declared as class attributes holding Descriptors. When instantiated, reading `user.email` triggers the descriptor\'s `__get__` method.',
        'Metaclass `__new__` vs `__init__`: `__new__` creates and returns the class object; `__init__` initializes the newly created class.',
        '__init_subclass__: Replaces complex metaclasses for automatic plugin registration and parameter validation during subclassing.'
      ],
      codeOrQuerySnippet: {
        title: 'Building a Strongly Typed Validated Field Descriptor & Model (Python)',
        language: 'text',
        code: `class PositiveInteger:
    """Data Descriptor enforcing positive integer validation on class attributes."""
    def __set_name__(self, owner, name):
        self.private_name = f"_{name}"

    def __get__(self, instance, owner):
        if instance is None:
            return self
        return getattr(instance, self.private_name, 0)

    def __set__(self, instance, value):
        if not isinstance(value, int) or value <= 0:
            raise ValueError(f"{self.private_name[1:]} must be a positive integer, got {value}")
        setattr(instance, self.private_name, value)

class MortgageApplication:
    # Class-level descriptor declarations (similar to Django ORM / SQLAlchemy fields)
    loan_amount = PositiveInteger()
    credit_score = PositiveInteger()
    term_months = PositiveInteger()

    def __init__(self, loan_amount: int, credit_score: int, term_months: int):
        self.loan_amount = loan_amount       # Invokes PositiveInteger.__set__
        self.credit_score = credit_score     # Invokes PositiveInteger.__set__
        self.term_months = term_months       # Invokes PositiveInteger.__set__

# Test Descriptor Validation:
app = MortgageApplication(loan_amount=450000, credit_score=760, term_months=360)
print(f"Validated Loan Amount: \${app.loan_amount:,}")

try:
    app.credit_score = -50  # Raises ValueError: credit_score must be a positive integer
except ValueError as e:
    print(f"Validation Guard Caught Error: {e}")`
      },
      proTipOrPitfall: 'Always define `__set_name__(self, owner, name)` in modern Python (3.6+) descriptors so the descriptor knows the variable name assigned to it without requiring hardcoded strings.'
    }
  },
  {
    id: 'py-05',
    category: 'Python',
    question: '5. What are the architectural differences between FastAPI (ASGI, Pydantic v2, Starlette) and Flask/Django (WSGI), and how do Dependency Injection and BackgroundTasks work?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Python', 'FastAPI', 'ASGI', 'WSGI', 'Pydantic v2', 'Dependency Injection'],
    shortSummary: 'Compares asynchronous ASGI event loops with synchronous WSGI thread pools, Rust-based Pydantic v2 core, and FastAPI Depends().',
    detailedAnswer: {
      executiveSummary: 'Flask and Django traditionally use WSGI (Web Server Gateway Interface), which is synchronous and requires 1 OS thread per concurrent HTTP request. FastAPI is built on ASGI (Asynchronous Server Gateway Interface via Starlette) and Uvicorn, handling tens of thousands of concurrent I/O connections on an asynchronous event loop. FastAPI uses Pydantic v2 (whose core validation engine is compiled in Rust) for schema validation and provides built-in Dependency Injection (`Depends`) for DB transactions and security authentication.',
      keyPoints: [
        'ASGI vs WSGI: ASGI supports asynchronous coroutines, WebSockets, Server-Sent Events (SSE), and HTTP/2 natively.',
        'Pydantic v2 Performance: Serializes and validates schemas 5x to 20x faster than Pydantic v1 due to Rust core.',
        'Dependency Injection (`Depends`): Hierarchical DI container that handles database session lifecycles (opening session, yielding, auto-closing on response commit).',
        'Thread Pool Offloading: When a route is defined as standard `def route()` instead of `async def route()`, FastAPI automatically runs it on a separate external thread pool to prevent blocking the event loop.'
      ],
      codeOrQuerySnippet: {
        title: 'Production FastAPI Microservice with Async DB Session & Dependency Injection (Python)',
        language: 'text',
        code: `from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field, EmailStr
from typing import AsyncGenerator
import asyncio

app = FastAPI(title="Enterprise Mortgage API")

# Pydantic v2 Request / Response Schemas
class LoanRequest(BaseModel):
    borrower_email: EmailStr
    loan_amount: float = Field(gt=0, description="Loan principal amount in USD")
    annual_income: float = Field(gt=0)
    credit_score: int = Field(ge=300, le=850)

# Database Session Dependency Generator with Automatic Cleanup
async def get_db_session() -> AsyncGenerator[str, None]:
    print("Opening Async Database Transaction...")
    session = "active_db_session_connection"
    try:
        yield session
    finally:
        print("Closing Database Connection cleanly in finally block.")

def send_underwriting_email_task(email: str, loan_id: str):
    """Background task executed after HTTP response is returned to client."""
    print(f"Sending confirmation email to {email} for Loan ID {loan_id}")

@app.post("/api/v1/loans/apply", status_code=status.HTTP_201_CREATED)
async def submit_loan_application(
    payload: LoanRequest,
    background_tasks: BackgroundTasks,
    db: str = Depends(get_db_session)
):
    dti_ratio = (payload.loan_amount * 0.05) / (payload.annual_income / 12)
    if dti_ratio > 0.45:
        raise HTTPException(status_code=400, detail="Debt-To-Income (DTI) ratio exceeds 45% limit.")

    loan_id = "LOAN-2026-9988"
    # Schedule background audit task
    background_tasks.add_task(send_underwriting_email_task, payload.borrower_email, loan_id)

    return {"status": "SUBMITTED", "loan_id": loan_id, "estimated_dti": round(dti_ratio, 2)}`
      },
      proTipOrPitfall: 'Do not define a FastAPI route with `async def` if the route body contains synchronous blocking database drivers (like legacy psycopg2 or raw `requests`). Either use async libraries (like `asyncpg`, `httpx`) or define the route with synchronous `def` so FastAPI routes it to a worker thread.'
    }
  }
];
