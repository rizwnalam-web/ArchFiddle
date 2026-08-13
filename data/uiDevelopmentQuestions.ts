import { InterviewQuestion } from './interviewPrepData';

export const TOP_20_REACT_NEXTJS: InterviewQuestion[] = [
  {
    id: 'react-01',
    category: 'React & Next.js',
    question: '1. How do React Server Components (RSC) differ from Client Components, and how do serialization boundaries and Server Actions work?',
    difficulty: 'Staff / Lead Architect',
    tags: ['React 19', 'Next.js App Router', 'RSC', 'Server Actions', 'SSR'],
    shortSummary: 'Explains server-only execution, zero client-bundle footprint, streaming serialization format, and server actions.',
    detailedAnswer: {
      executiveSummary: 'React Server Components execute strictly on the server and emit an intermediate streaming JSON-like UI tree format (RSC Payload) without sending their dependencies to the browser bundle. Client components are demarcated with "use client" and render both on server (during initial SSR) and hydrate in the browser.',
      keyPoints: [
        'Zero-Bundle Overhead: Heavy server dependencies (e.g., database drivers, markdown parsers) never ship to the client browser.',
        'Serialization Boundary: Props passed from Server to Client Components must be JSON-serializable (primitives, plain objects, arrays, Server Actions).',
        'Server Actions ("use server"): Asynchronous RPC endpoints executed on the server, invokable directly from forms or UI event handlers without manual API routes.',
        'Data Fetching: Async components `async function Page()` can fetch data directly in the component body with automatic request deduplication.'
      ],
      codeOrQuerySnippet: {
        title: 'Next.js App Router Server Component with Server Action',
        language: 'typescript',
        code: `// app/dashboard/page.tsx (Server Component by default)
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { UserMetricsCard } from '@/components/UserMetricsCard'; // 'use client'

async function updateQuotaAction(formData: FormData) {
  'use server';
  const quota = Number(formData.get('quota'));
  await db.user.updateQuota({ quota });
  revalidatePath('/dashboard');
}

export default async function DashboardPage() {
  const metrics = await db.analytics.getMetrics();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cloud Infrastructure Hub</h1>
      <UserMetricsCard initialData={metrics} />
      <form action={updateQuotaAction} className="flex gap-2">
        <input name="quota" type="number" defaultValue={100} className="border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Update Quota
        </button>
      </form>
    </div>
  );
}`
      },
      secondaryCodeSnippet: {
        title: 'Client Component Boundary with Optimistic Update',
        language: 'typescript',
        code: `'use client';
import { useOptimistic } from 'react';

export function UserMetricsCard({ initialData }: { initialData: { activeUsers: number } }) {
  const [optimisticUsers, setOptimisticUsers] = useOptimistic(
    initialData.activeUsers,
    (state, delta: number) => state + delta
  );

  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
      <div className="text-sm text-zinc-400">Live Active Tenants</div>
      <div className="text-3xl font-bold text-cyan-400">{optimisticUsers}</div>
    </div>
  );
}`
      },
      proTipOrPitfall: 'Never import server-only secrets into Client Components. Use `import "server-only"` at the top of database/auth files to trigger compile-time errors if imported accidentally.'
    }
  },
  {
    id: 'react-02',
    category: 'React & Next.js',
    question: '2. How does the React Fiber reconciler implement Cooperative Multitasking, Time-Slicing, and Concurrent Mode?',
    difficulty: 'Principal Architect',
    tags: ['React Internals', 'Fiber', 'Reconciler', 'Concurrent Mode', 'Scheduler'],
    shortSummary: 'Details the Fiber singly linked list tree, WorkLoop time-slicing (5ms yield to browser), and priority lanes.',
    detailedAnswer: {
      executiveSummary: 'Before Fiber, React used the Stack Reconciler which recursively diffed virtual DOM nodes synchronously, blocking browser input and animations. Fiber restructured the tree into a linked list of Fiber nodes (child, sibling, return). This enables pausing, aborting, and prioritizing render work using the Scheduler and requestIdleCallback / MessageChannel.',
      keyPoints: [
        'Fiber Node Architecture: Each component is represented as a node with pointers: `child`, `sibling`, and `return` (parent).',
        'Double Buffering (WorkInProgress vs Current): React builds a workInProgress tree off-screen and swaps root pointer atomically in the commit phase.',
        'Time Slicing: The WorkLoop checks `shouldYield()` every ~5ms to return control to the browser for 60/120 FPS paint and user input.',
        'Priority Lanes: Updates are categorized into 31 bitmask lanes (SyncLane, InputContinuousLane, DefaultLane, TransitionLane, IdleLane).'
      ],
      codeOrQuerySnippet: {
        title: 'React Concurrent Transition with startTransition / useDeferredValue',
        language: 'typescript',
        code: `import React, { useState, useTransition, useDeferredValue } from 'react';

export function HighDensitySearchGrid({ dataset }: { dataset: ArchitectureItem[] }) {
  const [filter, setFilter] = useState('');
  const [isPending, startTransition] = useTransition();
  const deferredFilter = useDeferredValue(filter);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. High-priority urgent input update (instant typing response)
    setFilter(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        value={filter}
        onChange={handleInputChange}
        placeholder="Type to search 10,000 nodes..."
        className="p-2 border rounded"
      />
      {isPending && <span className="text-xs text-amber-400">Filtering in background...</span>}
      <HeavyDataGrid query={deferredFilter} dataset={dataset} />
    </div>
  );
}`
      },
      proTipOrPitfall: 'Use `startTransition` for expensive filter/chart recalculations so that user keystrokes never experience input lag or frame drops.'
    }
  },
  {
    id: 'react-03',
    category: 'React & Next.js',
    question: '3. How do Hooks (useState, useEffect, useMemo, useCallback, useRef) work under the hood in Fiber nodes?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['React Hooks', 'Fiber Internals', 'Linked List', 'Closures'],
    shortSummary: 'Covers the memoizedState linked list on Fiber nodes, mount vs update dispatchers, and stale closure traps.',
    detailedAnswer: {
      executiveSummary: 'Each Fiber node has a `memoizedState` property pointing to a singly linked list of Hook objects. During the mount phase, `mountState` / `mountEffect` append hook objects to this list. During re-renders, `updateState` iterates through the list in the exact order called. This is why React requires calling hooks unconditionally at the top level.',
      keyPoints: [
        'Linked List Structure: Each hook node contains `memoizedState`, `queue`, `next`, and for effects `create` / `destroy` closures.',
        'Rules of Hooks: Calling hooks conditionally mutates the linked list order, causing state variable mismatches.',
        'useRef: Stores `{ current: initialValue }` on `memoizedState` and mutates property without triggering re-render.',
        'Stale Closure Bug: Effects or callbacks that capture state variables without listing them in dependencies hold stale scope values.'
      ],
      codeOrQuerySnippet: {
        title: 'Custom Hook with Persistent AbortController and Cleanup',
        language: 'typescript',
        code: `import { useState, useEffect, useRef, useCallback } from 'react';

export function useResilientTelemetry<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchTelemetry = useCallback(async () => {
    // Abort previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { signal: controller.signal });
      if (!res.ok) throw new Error(\`Telemetry error HTTP \${res.status}\`);
      const payload: T = await res.json();
      setData(payload);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchTelemetry();
    return () => {
      // Automatic cleanup on unmount or endpoint change
      abortControllerRef.current?.abort();
    };
  }, [fetchTelemetry]);

  return { data, isLoading, error, refetch: fetchTelemetry };
}`
      },
      proTipOrPitfall: 'Always return cleanup functions from `useEffect` to abort fetch requests, clear setInterval timers, and unsubscribe from event streams.'
    }
  },
  {
    id: 'react-04',
    category: 'React & Next.js',
    question: '4. How does the Next.js App Router streaming rendering pipeline work with Suspense, loading.tsx, and error.tsx?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Next.js', 'Streaming SSR', 'Suspense', 'Selective Hydration'],
    shortSummary: 'Explains HTTP chunked transfer encoding, fallback shell HTML, out-of-order component streaming, and selective hydration.',
    detailedAnswer: {
      executiveSummary: 'Next.js App Router utilizes Node.js and Web Streams with React 18+ `renderToPipeableStream`. Instead of waiting for all backend database queries before returning HTML (traditional SSR), the server immediately flushes the static layout shell and `<Suspense>` fallback spinners. As async sub-trees resolve, their HTML and inline script replacements stream down the same HTTP connection.',
      keyPoints: [
        'Time To First Byte (TTFB): Instantly serves static HTML shell and CSS stylesheets.',
        'Selective Hydration: React prioritizes hydrating components that the user actively clicks on, even while other components are still streaming.',
        'loading.tsx & error.tsx: Special Next.js file conventions automatically wrapped in `<Suspense fallback={<Loading />}>` and `<ErrorBoundary fallback={<Error />}>`.',
        'Partial Prerendering (PPR): Statically builds layout shell at build time while dynamically streaming dynamic holes at runtime.'
      ],
      codeOrQuerySnippet: {
        title: 'Streaming Subcomponents with Suspense Boundaries',
        language: 'typescript',
        code: `// app/analytics/page.tsx
import { Suspense } from 'react';
import { SkeletonChart, SkeletonTable } from '@/components/Skeletons';
import { RealtimeCostChart } from '@/components/RealtimeCostChart'; // Async server component
import { MicroserviceTable } from '@/components/MicroserviceTable'; // Async server component

export default function AnalyticsPage() {
  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Enterprise Cost Analytics</h1>
        <p className="text-zinc-400">Live multi-cloud telemetry</p>
      </header>

      {/* Independent stream 1: FinOps Cost Breakdown */}
      <Suspense fallback={<SkeletonChart />}>
        <RealtimeCostChart />
      </Suspense>

      {/* Independent stream 2: Microservice Fleet Health */}
      <Suspense fallback={<SkeletonTable />}>
        <MicroserviceTable />
      </Suspense>
    </div>
  );
}`
      },
      proTipOrPitfall: 'Never block the entire page for a slow third-party API. Wrap only the slow component in `<Suspense>` to keep navigation snappy.'
    }
  },
  {
    id: 'react-05',
    category: 'React & Next.js',
    question: '5. What is the React Compiler (React Forget) and how does it automate memoization over manual useMemo / useCallback / React.memo?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['React 19', 'React Compiler', 'Memoization', 'AST Transformation'],
    shortSummary: 'Explains compiler AST static analysis, automatic dependency tracking, and removing memoization boilerplate.',
    detailedAnswer: {
      executiveSummary: 'The React Compiler is an optimizing compiler that automatically analyzes JavaScript expressions at build time and injects fine-grained reactive caching. It eliminates the need for developers to manually write `useMemo`, `useCallback`, and `React.memo`, removing human error from dependency array maintenance.',
      keyPoints: [
        'Static AST Analysis: Analyzes pure component code following the Rules of React (immutability, pure functions).',
        'Fine-Grained Value Caching: Caches intermediate computed values and JSX elements so only changed subtrees re-render.',
        'Eliminates Stale Closures: Developers no longer debug missing dependency array warnings or accidental object reference mutations.'
      ],
      codeOrQuerySnippet: {
        title: 'React 19 Form Actions & useActionState Pattern',
        language: 'typescript',
        code: `'use client';
import { useActionState } from 'react';

interface FormState {
  success: boolean;
  message: string | null;
}

async function handleDeployService(prevState: FormState, formData: FormData): Promise<FormState> {
  const serviceName = formData.get('serviceName') as string;
  if (!serviceName) return { success: false, message: 'Service name is required' };
  
  const res = await fetch('/api/deploy', { method: 'POST', body: JSON.stringify({ serviceName }) });
  return { success: res.ok, message: res.ok ? 'Deployed successfully!' : 'Deployment failed' };
}

export function DeployForm() {
  const [state, formAction, isPending] = useActionState(handleDeployService, {
    success: false,
    message: null,
  });

  return (
    <form action={formAction} className="space-y-4">
      <input name="serviceName" placeholder="Service Name (e.g. auth-api)" className="p-2 bg-zinc-900 border rounded" />
      <button type="submit" disabled={isPending} className="px-4 py-2 bg-indigo-600 text-white rounded">
        {isPending ? 'Deploying...' : 'Launch Container'}
      </button>
      {state.message && (
        <p className={state.success ? 'text-emerald-400' : 'text-rose-400'}>{state.message}</p>
      )}
    </form>
  );
}`
      },
      proTipOrPitfall: 'Strictly adhere to the Rules of React (pure functions, never mutate props or state objects directly) to ensure compatibility with React Compiler.'
    }
  }
];

export const TOP_20_REACT_NATIVE_MOBILE: InterviewQuestion[] = [
  {
    id: 'rn-01',
    category: 'React Native & Mobile',
    question: '1. What is the React Native New Architecture (JSI, Fabric UI Renderer, TurboModules, and Hermes Engine)?',
    difficulty: 'Staff / Lead Architect',
    tags: ['React Native', 'New Architecture', 'JSI', 'Fabric', 'TurboModules', 'Hermes'],
    shortSummary: 'Compares the asynchronous JSON serialization Bridge with direct C++ memory invocation via JSI.',
    detailedAnswer: {
      executiveSummary: 'The Old Architecture relied on an asynchronous JSON Bridge that serialized messages across JavaScript and Native threads. The New Architecture replaces the Bridge with the JavaScript Interface (JSI), enabling JavaScript to hold direct C++ pointers to Native HostObjects for synchronous execution. Fabric replaces the UI Manager with concurrent C++ rendering, and TurboModules provides lazy loading of native modules.',
      keyPoints: [
        'JavaScript Interface (JSI): Direct C++ binding allowing JavaScript to call native methods synchronously with zero JSON serialization.',
        'Fabric Renderer: C++ rendering engine executing layout on background threads via Yoga and supporting concurrent React features.',
        'TurboModules: Lazy-initializes native device modules on first use, reducing application startup time by over 40%.',
        'Hermes Engine: Bytecode pre-compiled JavaScript engine optimized for rapid mobile Time-To-Interactive (TTI) and low RAM consumption.'
      ],
      codeOrQuerySnippet: {
        title: 'TurboModule Specification with TypeScript (Codegen Spec)',
        language: 'typescript',
        code: `import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // Synchronous native method invocation via JSI
  getHardwareSecurityToken(): string;
  
  // Asynchronous encrypted biometric authentication
  authenticateBiometric(promptTitle: string): Promise<{ success: boolean; signature: string }>;
  
  // Direct event listener registration
  onNetworkStateChanged(listener: (isConnected: boolean) => void): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('HardwareSecurityModule');`
      },
      secondaryCodeSnippet: {
        title: 'Fabric Native Component Specification',
        language: 'typescript',
        code: `import type { ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/libraries/Utilities/codegenNativeComponent';

interface NativeVideoPlayerProps extends ViewProps {
  streamUrl: string;
  autoPlay?: boolean;
  onBufferStateChange?: (event: { isBuffering: boolean }) => void;
}

export default codegenNativeComponent<NativeVideoPlayerProps>('NativeVideoPlayerView');`
      },
      proTipOrPitfall: 'Enable the New Architecture in `app.json` with `"newArchEnabled": true` to leverage synchronous layout and gesture interactions.'
    }
  },
  {
    id: 'rn-02',
    category: 'React Native & Mobile',
    question: '2. How do you achieve 60/120 FPS high-performance animations and gestures in React Native using Reanimated 3 and Gesture Handler?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['React Native', 'Reanimated 3', 'Worklets', 'UI Thread', 'Gesture Handler'],
    shortSummary: 'Explains JavaScript worklets running synchronously on the UI thread, bypassing JS bridge thread congestion.',
    detailedAnswer: {
      executiveSummary: 'Standard React Native Animated API communicates across the JS bridge on every frame, which stutters when the JS thread is busy with business logic or network parsing. React Native Reanimated 3 uses "Worklets"—small JavaScript functions compiled to run directly on the UI/Render thread at 60/120 FPS without JS thread roundtrips.',
      keyPoints: [
        'Worklet Directive ("worklet"): Directs Babel plugin to compile functions for execution in the UI thread JS runtime.',
        'Shared Values (useSharedValue): Thread-safe reactive memory references accessible from both JS and UI threads.',
        'Gesture.Pan(): React Native Gesture Handler hooks into native iOS UIPanGestureRecognizer / Android TouchEvent pipelines.'
      ],
      codeOrQuerySnippet: {
        title: '60 FPS Gesture & Physics Animation with Reanimated 3',
        language: 'typescript',
        code: `import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDecay
} from 'react-native-reanimated';

export function SwipeableCard({ children }: { children: React.ReactNode }) {
  const translateX = useSharedValue(0);
  const contextX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      contextX.value = translateX.value;
    })
    .onUpdate((event) => {
      'worklet';
      translateX.value = contextX.value + event.translationX;
    })
    .onEnd((event) => {
      'worklet';
      if (Math.abs(event.velocityX) > 500) {
        translateX.value = withDecay({ velocity: event.velocityX });
      } else {
        translateX.value = withSpring(0, { damping: 15 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#18181b', borderRadius: 16, padding: 16 }
});`
      },
      proTipOrPitfall: 'Always declare "worklet" at the top of helper functions called inside gesture callbacks or useDerivedValue.'
    }
  },
  {
    id: 'rn-03',
    category: 'React Native & Mobile',
    question: '3. How do you optimize Virtualized Lists (FlatList vs FlashList) for rendering 100,000 items with zero blank areas?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['FlatList', 'FlashList', 'Cell Recycling', 'Virtualization', 'Mobile Memory'],
    shortSummary: 'Compares FlatList window unmounting with FlashList view recycling (Shopify engine), getItemLayout, and memory pressure.',
    detailedAnswer: {
      executiveSummary: 'FlatList renders items within a virtual window and unmounts items outside the window, which causes blank white spaces during fast flings and frequent garbage collection cycles. FlashList (by Shopify) recycles native views (similar to Android RecyclerView / iOS UICollectionView), eliminating view creation overhead and rendering 10x faster.',
      keyPoints: [
        'Cell Recycling: Reuses existing native view hierarchy rather than creating and destroying native views during scroll.',
        'estimatedItemSize: FlashList relies on a precise average cell height estimate to compute scrollbar geometry.',
        'getItemLayout: In FlatList, provides fixed item dimensions to skip asynchronous native layout measurement.'
      ],
      codeOrQuerySnippet: {
        title: 'High-Throughput Mobile Feed with FlashList Cell Recycling',
        language: 'typescript',
        code: `import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';

interface TelemetryItem {
  id: string;
  sensor: string;
  reading: number;
  timestamp: string;
}

export function HighSpeedTelemetryList({ data }: { data: TelemetryItem[] }) {
  const renderItem = useCallback(({ item }: { item: TelemetryItem }) => (
    <View style={styles.row}>
      <Text style={styles.title}>{item.sensor}</Text>
      <Text style={styles.value}>{item.reading.toFixed(2)} psi</Text>
    </View>
  ), []);

  return (
    <View style={styles.container}>
      <FlashList
        data={data}
        renderItem={renderItem}
        estimatedItemSize={72}
        keyExtractor={(item) => item.id}
        drawDistance={250}
        overrideItemLayout={(layout, item) => {
          layout.size = 72; // Fixed layout size bypasses dynamic measuring
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  row: { height: 72, padding: 16, borderBottomWidth: 1, borderBottomColor: '#27272a' },
  title: { color: '#e4e4e7', fontSize: 16, fontWeight: '600' },
  value: { color: '#38bdf8', fontSize: 14, marginTop: 4 }
});`
      },
      proTipOrPitfall: 'Never define anonymous arrow functions or inline object styles directly inside `renderItem`—always memoize with `useCallback`.'
    }
  },
  {
    id: 'rn-04',
    category: 'React Native & Mobile',
    question: '4. How do you implement Offline-First data synchronization in React Native using WatermelonDB / SQLite and CRDTs?',
    difficulty: 'Staff / Lead Architect',
    tags: ['React Native', 'Offline-First', 'WatermelonDB', 'SQLite', 'CRDT'],
    shortSummary: 'Covers lazy loading observable models with RxJS, multi-threaded SQLite queries, and conflict resolution.',
    detailedAnswer: {
      executiveSummary: 'Mobile devices frequently lose network connectivity. An offline-first mobile architecture writes all user mutations directly to an encrypted local SQLite/WatermelonDB database first. A background synchronization worker handles push/pull replication with the cloud backend using vector clocks or CRDT (Conflict-Free Replicated Data Type) merge rules.',
      keyPoints: [
        'Lazy Loading: WatermelonDB loads only records currently visible on screen into memory, scaling to 100,000+ local rows.',
        'RxJS Observables: Components re-render reactively when SQLite table changes occur.',
        'Sync Protocol: Sends `{ changes: { created, updated, deleted }, lastPulledAt }` timestamp payloads to backend server.'
      ],
      codeOrQuerySnippet: {
        title: 'WatermelonDB Model & Synchronizer in React Native',
        language: 'typescript',
        code: `import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { Model, tableSchema, appSchema } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';
import { synchronize } from '@nozbe/watermelondb/sync';

export class DeviceInspection extends Model {
  static table = 'inspections';
  @field('device_id') deviceId!: string;
  @field('status') status!: 'PASSED' | 'FAILED';
  @field('notes') notes!: string;
  @readonly @date('created_at') createdAt!: Date;
}

export async function syncOfflineInspections(database: Database) {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      const response = await fetch(\`/api/sync?lastPulledAt=\${lastPulledAt ?? 0}\`);
      const { changes, timestamp } = await response.json();
      return { changes, timestamp };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes, lastPulledAt })
      });
    },
  });
}`
      },
      proTipOrPitfall: 'Always run SQLite database access on a separate background thread to prevent blocking 60 FPS UI rendering.'
    }
  }
];

export const TOP_20_VUE_NUXT: InterviewQuestion[] = [
  {
    id: 'vue-01',
    category: 'Vue.js & Nuxt 3',
    question: '1. How does the Vue 3 Reactivity Engine work under the hood using ES6 Proxy & Reflect compared to Vue 2 Object.defineProperty?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Vue 3', 'Reactivity', 'ES6 Proxy', 'Reflect', 'Pinia'],
    shortSummary: 'Covers reactive(), ref(), effect(), track(), trigger(), and eliminating Vue 2 array index/property mutation limitations.',
    detailedAnswer: {
      executiveSummary: 'Vue 2 used `Object.defineProperty` to recursively wrap object properties with getters and setters, which could not detect new property additions, property deletions, or direct array index assignments (`arr[0] = val`). Vue 3 utilizes ES6 `Proxy` and `Reflect` to intercept all 13 internal traps (`get`, `set`, `has`, `deleteProperty`). When a property is read, `track()` registers the active effect in a WeakMap `targetMap`; when written, `trigger()` executes the subscribers.',
      keyPoints: [
        'Proxy Traps: Intercepts property addition, deletion, and array mutations dynamically without upfront recursive walk.',
        'targetMap Data Structure: `WeakMap<target, Map<key, Set<ReactiveEffect>>>` maps object fields to reactive dependency sets.',
        'ref vs reactive: `ref(primitive)` wraps values in `{ value: primitive }` with getter/setter; `reactive(object)` returns a Proxy.',
        'toRefs: Preserves reactivity when destructuring reactive objects by converting each property into a ref.'
      ],
      codeOrQuerySnippet: {
        title: 'Minimal Vue 3 Proxy Reactivity Engine Core',
        language: 'typescript',
        code: `// Conceptual implementation of Vue 3 track and trigger
const targetMap = new WeakMap<object, Map<string | symbol, Set<Function>>>();
let activeEffect: Function | null = null;

export function effect(fn: Function) {
  activeEffect = fn;
  fn(); // Run to trigger initial 'get' traps and register dependencies
  activeEffect = null;
}

export function reactive<T extends object>(target: T): T {
  return new Proxy(target, {
    get(target, key, receiver) {
      if (activeEffect) {
        let depsMap = targetMap.get(target);
        if (!depsMap) targetMap.set(target, (depsMap = new Map()));
        let dep = depsMap.get(key);
        if (!dep) depsMap.set(key, (dep = new Set()));
        dep.add(activeEffect); // Track active effect
      }
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver);
      const depsMap = targetMap.get(target);
      if (depsMap) {
        const dep = depsMap.get(key);
        if (dep) dep.forEach(effectFn => effectFn()); // Trigger all subscriber effects
      }
      return res;
    }
  });
}`
      },
      secondaryCodeSnippet: {
        title: 'Vue 3 Composition API with <script setup lang="ts">',
        language: 'typescript',
        code: `<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useFinopsStore } from '@/stores/finops';

const finops = useFinopsStore();
const selectedCluster = ref('us-east-prod');
const costThreshold = ref(5000);

const highCostWarning = computed(() => finops.totalSpend > costThreshold.value);

watchEffect(() => {
  if (highCostWarning.value) {
    console.warn(\`[Budget Alert] Spending exceeded: \${finops.totalSpend}\`);
  }
});
</script>

<template>
  <div class="p-6 bg-zinc-900 rounded-2xl border border-zinc-800">
    <h2 class="text-xl font-bold text-white">Cluster: {{ selectedCluster }}</h2>
    <p :class="highCostWarning ? 'text-rose-400 font-bold' : 'text-emerald-400'">
      Spend: \${{ finops.totalSpend }}
    </p>
  </div>
</template>`
      },
      proTipOrPitfall: 'Never destructure reactive objects directly (`const { count } = reactiveState`) as it breaks Proxy getters—always use `toRefs(reactiveState)`.'
    }
  },
  {
    id: 'vue-02',
    category: 'Vue.js & Nuxt 3',
    question: '2. How does Nuxt 3 Universal SSR with the Nitro Engine implement Hybrid Rendering and Route Rules (SWR, ISR, Pre-rendering)?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Nuxt 3', 'Nitro Engine', 'SSR', 'SWR', 'Hybrid Rendering', 'Route Rules'],
    shortSummary: 'Explains Nitro cross-cloud serverless compilation, route rules, useAsyncData deduplication, and SWR caching.',
    detailedAnswer: {
      executiveSummary: 'Nuxt 3 is built on Nitro, a cross-platform server engine that compiles to Node.js, Cloudflare Workers, AWS Lambda, or Vercel Edge. With Route Rules, developers can configure rendering strategies per URL path (e.g., SWR with stale-while-revalidate caching for products, pure SPA for admin panels, and full SSG pre-rendering for marketing pages).',
      keyPoints: [
        'Route Rules (nuxt.config.ts): Configure `{ swr: 3600 }`, `{ ssr: false }`, or `{ prerender: true }` granularly per route.',
        'useAsyncData & useFetch: Prevents duplicate fetching on hydration by transferring serialized data payload from server to client.',
        'Nitro Server Engine: Supports Web Standards (`Fetch`, `Request`, `Response`) with cold starts under 10ms on Edge runtimes.'
      ],
      codeOrQuerySnippet: {
        title: 'Nuxt 3 Route Rules Configuration (nuxt.config.ts)',
        language: 'typescript',
        code: `// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // 1. Static site generated at build-time
    '/': { prerender: true },
    // 2. Incremental Static Regeneration / SWR cached at edge for 10 minutes
    '/architectures/**': { swr: 600 },
    // 3. Client-Side Only SPA for heavy interactive studio
    '/studio/**': { ssr: false },
    // 4. API route reverse-proxy with CORS headers
    '/api/**': { cors: true, headers: { 'cache-control': 's-maxage=60' } }
  },
  nitro: {
    preset: 'cloudflare-pages'
  }
});`
      },
      proTipOrPitfall: 'Always use unique keys in `useAsyncData("unique-key", () => fetch(...))` to avoid hydration mismatches during client route navigation.'
    }
  },
  {
    id: 'vue-03',
    category: 'Vue.js & Nuxt 3',
    question: '3. What is Vue Vapor Mode and how does it compile templates to fine-grained DOM operations without a Virtual DOM?',
    difficulty: 'Principal Architect',
    tags: ['Vue Vapor', 'Virtual DOM', 'SolidJS', 'Compilation', 'Performance'],
    shortSummary: 'Compares Virtual DOM diffing with compile-time reactive DOM subscriptions for near-zero memory footprint.',
    detailedAnswer: {
      executiveSummary: 'Inspired by SolidJS and Svelte, Vue Vapor Mode is an opt-in compilation strategy that generates code to update DOM nodes directly via fine-grained reactive subscriptions, bypassing Virtual DOM allocation, tree diffing, and VNode lifecycle overhead entirely.',
      keyPoints: [
        'No VNode Allocation: Eliminates the creation of thousands of temporary Virtual DOM objects per render cycle.',
        'Direct DOM References: Reactive effects bind directly to concrete DOM element properties (`el.textContent = count.value`).',
        'Interoperability: Vapor components can be seamlessly embedded inside existing Virtual DOM Vue 3 applications.'
      ],
      codeOrQuerySnippet: {
        title: 'Pinia Store Architecture with Type-Safe State & Actions',
        language: 'typescript',
        code: `import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface ArchitectureSpec {
  id: string;
  name: string;
  category: string;
  stars: number;
}

export const useArchitectureStore = defineStore('architecture', () => {
  // 1. State
  const catalog = ref<ArchitectureSpec[]>([]);
  const selectedId = ref<string | null>(null);
  const filterQuery = ref('');

  // 2. Getters
  const filteredCatalog = computed(() => {
    if (!filterQuery.value) return catalog.value;
    const q = filterQuery.value.toLowerCase();
    return catalog.value.filter(a => a.name.toLowerCase().includes(q));
  });

  // 3. Actions
  async function fetchCatalog() {
    const res = await fetch('/api/architectures');
    catalog.value = await res.json();
  }

  function toggleStar(id: string) {
    const item = catalog.value.find(a => a.id === id);
    if (item) item.stars += 1;
  }

  return { catalog, selectedId, filterQuery, filteredCatalog, fetchCatalog, toggleStar };
});`
      },
      proTipOrPitfall: 'Prefer Pinia setup stores (`() => { ... }`) over option stores for seamless TypeScript inference and composable sharing.'
    }
  }
];

export const TOP_20_FRONTEND_PERFORMANCE_WEB: InterviewQuestion[] = [
  {
    id: 'perf-01',
    category: 'Frontend Performance & Web Vitals',
    question: '1. How do you measure, debug, and optimize Core Web Vitals (LCP, INP, CLS) in enterprise web applications?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Core Web Vitals', 'LCP', 'INP', 'CLS', 'Chrome DevTools', 'Performance'],
    shortSummary: 'Covers Largest Contentful Paint (<2.5s), Interaction to Next Paint (<200ms), and Cumulative Layout Shift (<0.1).',
    detailedAnswer: {
      executiveSummary: 'Core Web Vitals quantify real user experience. Largest Contentful Paint (LCP) measures perceived load speed (<2.5s); Interaction to Next Paint (INP) measures responsiveness to user clicks/keys (<200ms); Cumulative Layout Shift (CLS) measures visual stability (<0.1). Optimizations include priority resource hints, yielding to main thread, and reserving layout aspect ratios.',
      keyPoints: [
        'LCP Optimization: Preload hero image with `<link rel="preload" as="image" fetchpriority="high">`, remove render-blocking CSS/JS, and enable Brotli/HTTP/3.',
        'INP Optimization: Break long tasks (>50ms) using `scheduler.yield()` or `requestIdleCallback()`; debounce expensive state calculations.',
        'CLS Optimization: Explicit `width` and `height` on `<img>` / video elements; use `aspect-ratio` CSS and `font-display: optional` to eliminate FOIT/FOUT.'
      ],
      codeOrQuerySnippet: {
        title: 'Modern Task Chunking with scheduler.yield() (INP Optimization)',
        language: 'typescript',
        code: `// Break 200ms heavy computation into discrete micro-tasks yielding to main thread
export async function processLargeDatasetYielding<T, R>(
  items: T[],
  processItem: (item: T) => R
): Promise<R[]> {
  const results: R[] = [];
  let lastYieldTime = performance.now();

  for (let i = 0; i < items.length; i++) {
    results.push(processItem(items[i]));

    // Yield control back to browser if task runs longer than 16ms frame budget
    if (performance.now() - lastYieldTime > 16) {
      if ('scheduler' in window && 'yield' in (window as any).scheduler) {
        await (window as any).scheduler.yield();
      } else {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      lastYieldTime = performance.now();
    }
  }
  return results;
}`
      },
      secondaryCodeSnippet: {
        title: 'Web Vitals Monitoring Real User Telemetry (RUM)',
        language: 'typescript',
        code: `import { onLCP, onINP, onCLS, Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    delta: metric.delta,
    id: metric.id,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/telemetry/vitals', body);
  } else {
    fetch('/api/telemetry/vitals', { method: 'POST', body, keepalive: true });
  }
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);`
      },
      proTipOrPitfall: 'Always use `navigator.sendBeacon` for analytics so telemetry network calls are never canceled when the user closes or navigates away from the tab.'
    }
  },
  {
    id: 'perf-02',
    category: 'Frontend Performance & Web Vitals',
    question: '2. How do Micro-Frontends work using Webpack 5 / Vite Module Federation, and how do you handle shared dependencies and CSS isolation?',
    difficulty: 'Principal Architect',
    tags: ['Micro-Frontends', 'Module Federation', 'Webpack 5', 'Vite', 'Architecture'],
    shortSummary: 'Covers host/remote containers, runtime dynamic remotes, singleton React/Vue instances, and version negotiation.',
    detailedAnswer: {
      executiveSummary: 'Module Federation allows multiple independent JavaScript applications to dynamically load remote components and modules at runtime without compiling them into a monolithic bundle. The Module Federation runtime negotiates shared singletons (e.g. `react`, `react-dom`, `pinia`) using semantic version ranges to avoid loading duplicate library copies into browser memory.',
      keyPoints: [
        'Host (Shell) vs Remote: The Host loads the Remote entry (`remoteEntry.js`) over HTTP dynamically at runtime.',
        'Shared Singletons: Configured with `singleton: true, strictVersion: true` to guarantee exactly one active React runtime instance.',
        'CSS Isolation: Enforced using Tailwind namespace prefixes, CSS Modules, or Shadow DOM encapsulation.'
      ],
      codeOrQuerySnippet: {
        title: 'Module Federation Configuration (Host Application)',
        language: 'typescript',
        code: `// vite.config.ts / webpack.config.js
import { federation } from '@module-federation/vite';

export default {
  plugins: [
    federation({
      name: 'host_app',
      remotes: {
        finopsRemote: 'finopsApp@https://finops.enterprise.internal/assets/remoteEntry.js',
        authRemote: 'authApp@https://auth.enterprise.internal/assets/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.0' },
        'lucide-react': { singleton: true },
      },
    }),
  ],
};`
      },
      proTipOrPitfall: 'Never deploy breaking API changes to a remote without backward-compatible props or versioned remote entry URLs.'
    }
  },
  {
    id: 'perf-03',
    category: 'Frontend Performance & Web Vitals',
    question: '3. How do Web Workers and OffscreenCanvas offload heavy compute, 3D graphics, and data encryption from the main UI thread?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Web Workers', 'OffscreenCanvas', 'Comlink', 'Multithreading', 'Performance'],
    shortSummary: 'Covers MessageChannel, transferable ArrayBuffers, zero-copy memory transfer, and Comlink RPC abstraction.',
    detailedAnswer: {
      executiveSummary: 'JavaScript in browsers is single-threaded on the main execution thread. Heavy calculations (e.g. compressing 50MB files, parsing 100,000 JSON rows, or rendering WebGL graphics) cause frame stutter. Web Workers execute code on real OS background threads. ArrayBuffers can be transferred (zero-copy memory transfer) rather than cloned, eliminating serialization overhead.',
      keyPoints: [
        'Transferable Objects: `postMessage(data, [buffer])` transfers ownership of the underlying ArrayBuffer memory instantly without copying bytes.',
        'OffscreenCanvas: Moves 2D/3D canvas rendering and animation loops entirely to a background worker thread.',
        'Comlink Library: Wraps postMessage in an elegant `Proxy`-based asynchronous RPC interface.'
      ],
      codeOrQuerySnippet: {
        title: 'Zero-Copy Data Transfer with Dedicated Web Worker',
        language: 'typescript',
        code: `// worker.ts
self.onmessage = (event: MessageEvent<{ buffer: ArrayBuffer }>) => {
  const { buffer } = event.data;
  const floatView = new Float32Array(buffer);
  
  // Perform intensive floating-point mathematical calculation
  for (let i = 0; i < floatView.length; i++) {
    floatView[i] = Math.sqrt(floatView[i]) * 1.5;
  }

  // Transfer memory back to main thread with ZERO byte copy
  self.postMessage({ buffer }, [buffer] as any);
};

// main.ts
export function runBackgroundCompute(dataArray: Float32Array): Promise<Float32Array> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e) => {
      resolve(new Float32Array(e.data.buffer));
      worker.terminate();
    };
    // Transfer buffer to worker
    worker.postMessage({ buffer: dataArray.buffer }, [dataArray.buffer]);
  });
}`
      },
      proTipOrPitfall: 'Always remember that transferred ArrayBuffers become detached (byteLength = 0) on the sending thread; do not attempt to read them after transfer.'
    }
  }
];
