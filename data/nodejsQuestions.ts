import { InterviewQuestion } from './interviewPrepData';

export const TOP_20_NODEJS: InterviewQuestion[] = [
  {
    id: 'node-01',
    category: 'Node.js',
    question: '1. How does the Node.js Event Loop work under the hood with libuv, and what is the exact execution order between Microtask Queues (process.nextTick, Promise.then) and Event Loop Phases?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Node.js', 'Event Loop', 'libuv', 'Microtasks', 'process.nextTick', 'Promises'],
    shortSummary: 'Explains libuv 6 phases (Timers, Pending, Idle/Prepare, Poll, Check, Close) and how microtasks drain between every individual callback.',
    detailedAnswer: {
      executiveSummary: 'Node.js is single-threaded for JavaScript execution but leverages the libuv C library for a multi-threaded event loop and asynchronous I/O. The Event Loop traverses 6 main phases: Timers -> Pending Callbacks -> Idle/Prepare -> Poll (I/O) -> Check (setImmediate) -> Close Callbacks. Crucially, the Microtask Queue (process.nextTick has top priority, followed by resolved Promises) runs immediately after the current operation finishes and between every individual callback transition across all phases.',
      keyPoints: [
        'Timers Phase: Executes callbacks scheduled by setTimeout() and setInterval() whose threshold has elapsed.',
        'Poll Phase: Retrieves new I/O events (sockets, file descriptors, network traffic); blocks if no other timers or immediate callbacks are scheduled.',
        'Check Phase: Executes callbacks registered with setImmediate().',
        'Microtask Priority: process.nextTick() queue is drained first, followed by Promise/MutationObserver microtasks before the event loop advances to the next tick.'
      ],
      codeOrQuerySnippet: {
        title: 'Event Loop & Microtask Execution Order Demonstration (Node.js TypeScript)',
        language: 'typescript',
        code: `console.log('1: Synchronous Start');

setTimeout(() => {
  console.log('2: setTimeout (Timers Phase)');
  process.nextTick(() => console.log('3: nextTick inside setTimeout'));
}, 0);

setImmediate(() => {
  console.log('4: setImmediate (Check Phase)');
});

Promise.resolve().then(() => {
  console.log('5: Promise.then (Microtask Queue)');
});

process.nextTick(() => {
  console.log('6: process.nextTick (High Priority Microtask)');
});

console.log('7: Synchronous End');

// Expected Output Order:
// 1: Synchronous Start
// 7: Synchronous End
// 6: process.nextTick (High Priority Microtask)
// 5: Promise.then (Microtask Queue)
// 2: setTimeout (Timers Phase)  [or setImmediate depending on startup context]
// 3: nextTick inside setTimeout
// 4: setImmediate (Check Phase)`
      },
      secondaryCodeSnippet: {
        title: 'Preventing Event Loop Starvation with setImmediate()',
        language: 'typescript',
        code: `// Recursively calling process.nextTick starves I/O because microtasks never yield!
// Use setImmediate to chunk heavy CPU work across Event Loop ticks:
function processLargeArrayChunked<T>(items: T[], processItem: (item: T) => void, onComplete: () => void) {
  let index = 0;
  function nextChunk() {
    const start = Date.now();
    while (index < items.length && Date.now() - start < 10) { // Max 10ms per tick
      processItem(items[index++]);
    }
    if (index < items.length) {
      setImmediate(nextChunk); // Yields back to Event Loop for I/O handling
    } else {
      onComplete();
    }
  }
  nextChunk();
}`
      },
      proTipOrPitfall: 'Recursive `process.nextTick()` calls will completely starve the Event Loop by continuously filling the microtask queue, preventing Node.js from ever reaching the Poll phase for incoming HTTP requests or file I/O.',
      studyResources: [
        {
          title: 'The Node.js Event Loop, Timers, and process.nextTick()',
          url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick',
          source: 'Node.js Official Documentation',
          description: 'Official deep dive on libuv phases, Poll mechanics, and nextTick behavior.'
        }
      ]
    }
  },
  {
    id: 'node-02',
    category: 'Node.js',
    question: '2. How do Node.js Streams work, how do you manage Backpressure with high-water marks, and why should you use pipeline() over .pipe()?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Node.js', 'Streams', 'Backpressure', 'pipeline', 'Memory Management'],
    shortSummary: 'Covers Readable/Writable/Transform streams, highWaterMark (16KB/64KB), drain event, and memory-safe pipeline stream composition.',
    detailedAnswer: {
      executiveSummary: 'Streams allow processing chunks of data sequentially in memory without buffering entire multi-gigabyte files into RAM. When a fast Readable stream overwhelms a slower Writable stream (e.g. fast disk read into slow network socket), Backpressure occurs. The writable stream\'s internal buffer exceeds `highWaterMark`, returning `false` from `.write()`. `pipeline()` automatically manages backpressure, stream destruction, and error propagation without memory leaks.',
      keyPoints: [
        'Stream Types: Readable (data source), Writable (destination), Duplex (both, like TCP sockets), Transform (modifies chunks in-flight, like zlib/crypto).',
        'Backpressure Mechanism: When `writable.write(chunk) === false`, the readable stream must `.pause()` until the writable emits the `\'drain\'` event.',
        'Why .pipe() is dangerous: `.pipe()` does NOT close or destroy all streams in the pipeline if one stream encounters an error, causing file descriptor and memory leaks.',
        'Modern Solution: Use `stream/promises` or `pipeline(readable, transform, writable, callback)` which guarantees clean teardown of all streams on errors.'
      ],
      codeOrQuerySnippet: {
        title: 'Memory-Safe High-Throughput Stream Pipeline with Backpressure (TypeScript)',
        language: 'typescript',
        code: `import { createReadStream, createWriteStream } from 'node:fs';
import { createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';

// Custom Transform stream that sanitizes records chunk-by-chunk
const sanitizeTransform = new Transform({
  objectMode: false,
  highWaterMark: 64 * 1024, // 64KB chunk buffer
  transform(chunk: Buffer, encoding, callback) {
    // Redact sensitive PII / SSN in-flight without loading full file into heap
    const cleaned = chunk.toString().replace(/\\d{3}-\\d{2}-\\d{4}/g, 'XXX-XX-XXXX');
    callback(null, Buffer.from(cleaned));
  }
});

export async function compressAndSanitizeLogFile(sourcePath: string, destPath: string) {
  try {
    await pipeline(
      createReadStream(sourcePath, { highWaterMark: 64 * 1024 }),
      sanitizeTransform,
      createGzip({ level: 6 }),
      createWriteStream(destPath)
    );
    console.log('Stream pipeline completed with zero memory leak and backpressure handled!');
  } catch (error) {
    console.error('Pipeline failed and auto-destroyed open streams:', error);
    throw error;
  }
}`
      },
      proTipOrPitfall: 'Never use `fs.readFile()` on user uploads or large reports in web servers. Loading a 1GB file via `readFile()` allocates 1GB+ on the V8 heap and easily triggers `ERR_STRING_TOO_LONG` or `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed`.'
    }
  },
  {
    id: 'node-03',
    category: 'Node.js',
    question: '3. What are the differences between Worker Threads (worker_threads), Cluster Module (cluster), and Child Processes (child_process) for multi-core scaling in Node.js?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Node.js', 'Worker Threads', 'Cluster', 'Child Process', 'Concurrency', 'CPU Bound'],
    shortSummary: 'Compares Process-level isolation (Cluster/ChildProcess) vs Thread-level shared memory (WorkerThreads with SharedArrayBuffer & Atomics).',
    detailedAnswer: {
      executiveSummary: 'Because Node.js runs single-threaded by default, CPU-bound computations block the event loop. The Cluster module forks separate OS processes sharing the same TCP port via round-robin master distribution. Worker Threads run multiple V8 threads within the same process, sharing memory via `SharedArrayBuffer` and communicating via fast `MessagePort`. Child Processes spawn external binaries with isolated memory via IPC/stdin/stdout.',
      keyPoints: [
        'Cluster Module: Best for horizontal scaling of I/O-bound HTTP web servers across CPU cores (1 process per physical core).',
        'Worker Threads: Best for CPU-intensive in-process tasks (image resizing, cryptographic hashing, machine learning tensor math) with low overhead.',
        'SharedArrayBuffer & Atomics: Allows Worker Threads to read/write zero-copy shared memory without serialization overhead.',
        'Child Process: Best for executing shell commands, Python scripts, or native CLI utilities (`spawn`, `execFile`).'
      ],
      codeOrQuerySnippet: {
        title: 'CPU Offloading with Worker Threads Pool (TypeScript)',
        language: 'typescript',
        code: `import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import os from 'node:os';

if (isMainThread) {
  // Main thread: Dispatch CPU-heavy task without blocking HTTP Event Loop
  export function computeHeavyHashAsync(data: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: { payload: data }
      });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(\`Worker stopped with exit code \${code}\`));
      });
    });
  }
} else {
  // Worker thread: Executes heavy computation on background thread
  const { payload } = workerData;
  // Heavy CPU work (e.g. Scrypt / Argon2 / Prime calculation)
  let hash = 0;
  for (let i = 0; i < 50000000; i++) {
    hash = (hash + payload.charCodeAt(i % payload.length) * 31) & 0xffffffff;
  }
  parentPort?.postMessage(\`ComputedHash_\${hash}\`);
}`
      },
      proTipOrPitfall: 'Do NOT use Worker Threads for I/O operations (like database queries or HTTP calls). Node.js libuv handles thousands of concurrent I/O operations asynchronously on the main event loop much more efficiently than worker thread overhead.'
    }
  },
  {
    id: 'node-04',
    category: 'Node.js',
    question: '4. How do V8 Heap memory management and Garbage Collection work in Node.js, and how do you diagnose and fix memory leaks in production?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Node.js', 'V8', 'Memory Leaks', 'Garbage Collection', 'Heap Snapshot', 'Profiling'],
    shortSummary: 'Covers New Space (Scavenge/Semi-space), Old Space (Mark-Sweep-Compact), closures/event emitter leaks, and v8.getHeapSnapshot().',
    detailedAnswer: {
      executiveSummary: 'Node.js memory is managed by the Google V8 engine. The V8 heap is partitioned into New Space (ephemeral allocations collected fast via Scavenge / Cheney\'s algorithm) and Old Space (long-lived objects collected via Mark-Sweep-Compact). Memory leaks in Node.js commonly stem from unremoved Event Emitter listeners, global caching collections without eviction TTLs, unclosed timers, and retained closure variables.',
      keyPoints: [
        'Generational Hypothesis: Most allocated objects die immediately in the Nursery / Semi-space. Surviving objects get promoted to Old Pointer/Data space.',
        'Common Leak Culprits: Static maps growing unboundedly, `eventEmitter.on()` inside request handlers without `.removeListener()`, and circular closure references.',
        'Heap Snapshot Diagnostics: Use `v8.getHeapSnapshot()` or Chrome DevTools Inspector to compare two snapshots and inspect retained object distance and shallow/retained sizes.',
        'V8 Flags: `--max-old-space-size=4096` increases default heap limit from 1.4GB to 4GB in containerized workloads.'
      ],
      codeOrQuerySnippet: {
        title: 'Generating In-Process Heap Snapshot for Memory Leak Profiling (TypeScript)',
        language: 'typescript',
        code: `import v8 from 'node:v8';
import fs from 'node:fs';
import path from 'node:path';

export function takeHeapSnapshotOnHighMemory(thresholdMB = 1200) {
  const memUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);

  if (heapUsedMB > thresholdMB) {
    const filename = path.join(process.cwd(), \`heap-\${Date.now()}-\${heapUsedMB}MB.heapsnapshot\`);
    console.warn(\`⚠️ High Memory Detected (\${heapUsedMB}MB). Writing heap snapshot to \${filename}...\`);
    
    const snapshotStream = v8.getHeapSnapshot();
    const fileStream = fs.createWriteStream(filename);
    snapshotStream.pipe(fileStream);
    
    fileStream.on('finish', () => {
      console.log(\`✅ Heap snapshot saved successfully. Load into Chrome DevTools Memory panel to inspect retainer trees.\`);
    });
  }
}`
      },
      proTipOrPitfall: 'Always check `process.memoryUsage().rss` in addition to `heapUsed`. Buffer allocations and native C++ add-ons allocate memory outside the V8 heap in external/ArrayBuffer memory, which is reflected in RSS.'
    }
  },
  {
    id: 'node-05',
    category: 'Node.js',
    question: '5. What is AsyncLocalStorage in Node.js, and how does it implement request context propagation, distributed tracing, and transaction isolation?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Node.js', 'AsyncLocalStorage', 'Tracing', 'Correlation ID', 'Context Propagation'],
    shortSummary: 'Explains AsyncLocalStorage from node:async_hooks, maintaining execution context across asynchronous await boundaries without prop-drilling.',
    detailedAnswer: {
      executiveSummary: '`AsyncLocalStorage` (from `node:async_hooks`) allows storing state across asynchronous control flows, similar to Thread-Local Storage in multi-threaded languages like Java or C#. It solves the problem of propagating Request IDs, Tenant Context, and Logger Correlation IDs across deeply nested asynchronous helper functions and database queries without having to pass context objects through every function signature.',
      keyPoints: [
        'Zero Prop-Drilling: Request IDs, User Claims, and DB Transaction clients are accessible anywhere in the call stack via `storage.getStore()`.',
        'Asynchronous Continuity: Preserves store context across `await`, `setTimeout`, event listeners, and Promise chains.',
        'Performance Optimization: Modern Node.js V8 engines have optimized AsyncLocalStorage with minimal runtime overhead compared to legacy `domain` modules.',
        'Production Use Case: OpenTelemetry and Winston/Pino logger integration for tracing distributed microservices.'
      ],
      codeOrQuerySnippet: {
        title: 'Request Correlation & Tenant Context Middleware with AsyncLocalStorage (TypeScript)',
        language: 'typescript',
        code: `import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

export interface RequestContext {
  correlationId: string;
  tenantId: string;
  userId?: string;
  startTime: number;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

// Express Middleware initializing context
export function contextMiddleware(req: Request, res: Response, next: NextFunction) {
  const context: RequestContext = {
    correlationId: (req.headers['x-correlation-id'] as string) || randomUUID(),
    tenantId: (req.headers['x-tenant-id'] as string) || 'default-tenant',
    startTime: Date.now()
  };

  res.setHeader('x-correlation-id', context.correlationId);

  // Wrap remaining request handling inside AsyncLocalStorage execution scope
  requestContextStorage.run(context, () => {
    next();
  });
}

// Enterprise Contextual Logger accessible from any utility or service
export class Logger {
  static info(message: string, meta?: Record<string, unknown>) {
    const ctx = requestContextStorage.getStore();
    const logPayload = {
      timestamp: new Date().toISOString(),
      correlationId: ctx?.correlationId || 'N/A',
      tenantId: ctx?.tenantId || 'N/A',
      message,
      ...meta
    };
    console.log(JSON.stringify(logPayload));
  }
}`
      },
      proTipOrPitfall: 'Be cautious when using AsyncLocalStorage inside unbound EventEmitters. If an event listener is registered outside `storage.run()`, `storage.getStore()` will return `undefined` when the event fires.'
    }
  },
  {
    id: 'node-06',
    category: 'Node.js',
    question: '6. How do you design zero-downtime Graceful Shutdown and signal handling (SIGTERM, SIGINT) in production Node.js microservices?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Node.js', 'Graceful Shutdown', 'SIGTERM', 'Kubernetes', 'Microservices', 'Resilience'],
    shortSummary: 'Covers Kubernetes termination lifecycle, stopping incoming connections, draining in-flight requests, closing DB pools, and timeout force kill.',
    detailedAnswer: {
      executiveSummary: 'When Kubernetes or Docker stops a container, it sends a `SIGTERM` signal followed by a grace period (e.g. 30 seconds) before sending `SIGKILL`. A robust Node.js graceful shutdown handler intercepts `SIGTERM`, immediately fails Kubernetes health readiness probes to stop new incoming traffic, finishes draining in-flight HTTP requests via `server.close()`, commits open DB transactions, and exits cleanly with code 0.',
      keyPoints: [
        'Readiness Probe Failure: Mark readiness status as false immediately so load balancers stop routing new traffic.',
        'server.close(): Stops accepting new TCP connections while allowing in-flight requests to complete.',
        'Keep-Alive Teardown: In Node.js 18.2.0+, use `server.closeIdleConnections()` to terminate persistent HTTP keep-alive connections.',
        'Force Kill Timeout: Set a fallback `setTimeout(() => process.exit(1), 10000).unref()` in case stuck hanging promises prevent shutdown.'
      ],
      codeOrQuerySnippet: {
        title: 'Production-Grade Graceful Shutdown Handler (TypeScript / Node.js)',
        language: 'typescript',
        code: `import http from 'node:http';

export function setupGracefulShutdown(server: http.Server, dbPool: { close: () => Promise<void> }) {
  let isShuttingDown = false;

  async function handleShutdown(signal: string) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.warn(\`🛑 Received \${signal}. Starting graceful shutdown sequence...\`);

    // 1. Force kill fallback timer if connections refuse to close in 15 seconds
    const forceKillTimer = setTimeout(() => {
      console.error('⚠️ Forcefully terminating process due to shutdown timeout!');
      process.exit(1);
    }, 15000);
    forceKillTimer.unref(); // Prevent timer from keeping event loop alive

    // 2. Stop accepting new HTTP connections and close idle keep-alive sockets
    server.close(async (err) => {
      if (err) {
        console.error('Error closing HTTP server:', err);
        process.exit(1);
      }
      console.log('✅ HTTP server closed. In-flight requests drained.');

      // 3. Close database connection pools and Redis clients cleanly
      try {
        await dbPool.close();
        console.log('✅ Database connection pools closed cleanly.');
        process.exit(0);
      } catch (dbErr) {
        console.error('Error closing database connections:', dbErr);
        process.exit(1);
      }
    });

    // Close idle keep-alive connections (available in Node 18.2+)
    if (typeof server.closeIdleConnections === 'function') {
      server.closeIdleConnections();
    }
  }

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}`
      },
      proTipOrPitfall: 'Always handle `process.on(\'unhandledRejection\')` and `process.on(\'uncaughtException\')`. When an uncaught exception occurs, log the error and initiate graceful shutdown—the process memory state is corrupted and must not continue serving requests.'
    }
  }
];
