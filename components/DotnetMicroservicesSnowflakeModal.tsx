import React, { useState } from 'react';
import {
  X,
  Code2,
  Terminal,
  Layers,
  Database,
  Cloud,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  Shield,
  Search,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Workflow,
  Cpu,
  ArrowRight,
  Server,
  FileCode,
  Sliders,
  Volume2,
  Share2,
  Box,
  Radio,
  BarChart3,
  Network,
  Download
} from 'lucide-react';
import { useAudioNarration } from '../src/context/AudioNarrationContext';
import { GITHUB_ACTIONS_DOTNET_REACT_YAML, AWS_CODEPIPELINE_BUILDSPEC_YAML } from '../data/architectureCiCdData';

interface DotnetMicroservicesSnowflakeModalProps {
  onClose: () => void;
  onOpenPlayground?: () => void;
}

interface StepGuide {
  id: string;
  stepNumber: number;
  title: string;
  category: 'overview' | 'client-react' | 'bff-express' | 'dotnet-api' | 'masstransit-sqs' | 'snowflake-efcore' | 'opentelemetry' | 'cicd';
  badge: string;
  summary: string;
  commands?: { label: string; cmd: string; desc: string }[];
  codeFiles?: { name: string; lang: string; path: string; desc: string; code: string }[];
  keyRules: string[];
  stackComponents: string[];
  audioScript: string;
}

export const DotnetMicroservicesSnowflakeModal: React.FC<DotnetMicroservicesSnowflakeModalProps> = ({
  onClose,
  onOpenPlayground
}) => {
  const [activeStepId, setActiveStepId] = useState<string>('step-1-overview');
  const [copiedFileKey, setCopiedFileKey] = useState<string | null>(null);
  const [copiedCmdIndex, setCopiedCmdIndex] = useState<number | null>(null);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const { playSnippet, isSupported: isTtsSupported } = useAudioNarration();

  const handleCopyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFileKey(key);
    setTimeout(() => setCopiedFileKey(null), 2000);
  };

  const handleCopyCmd = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmdIndex(idx);
    setTimeout(() => setCopiedCmdIndex(null), 2000);
  };

  // Comprehensive Step-by-Step Blueprint Data
  const STEPS: StepGuide[] = [
    {
      id: 'step-1-overview',
      stepNumber: 1,
      title: 'Full-Stack Topology & End-to-End Microservices Architecture',
      category: 'overview',
      badge: 'Architecture Topology',
      summary:
        'Complete end-to-end multi-tier microservices solution featuring a React 19 + TypeScript frontend client, an Express.js Backend-For-Frontend (BFF) & API Gateway, an ASP.NET Core 10 high-performance RESTful Web API and gRPC microservice, asynchronous event-driven messaging with MassTransit backed by AWS SQS/SNS, enterprise data persistence into Snowflake Cloud Data Warehouse via EF Core, and full-stack distributed observability with OpenTelemetry.',
      stackComponents: [
        'React 19 + TypeScript + Vite',
        'Node.js Express.js BFF Gateway',
        'ASP.NET Core 10 RESTful API (net10.0)',
        'gRPC Binary Protocol (HTTP/2)',
        'MassTransit with Amazon SQS / SNS',
        'Entity Framework Core + Snowflake.Data',
        'OpenTelemetry Tracing, Metrics & Logs',
        'LocalStack & Jaeger Dev Sandbox'
      ],
      keyRules: [
        'Strict BFF Separation: The browser client talks exclusively through the Express.js BFF, keeping API keys, gRPC stubs, and internal network addresses shielded.',
        'Hybrid Sync & Async: Use gRPC / REST for low-latency synchronous reads & validations; use MassTransit over AWS SQS/SNS for decoupled async command processing.',
        'Data Warehouse Optimization: Snowflake stores analytical records and high-volume event data; bulk inserts and column-oriented queries leverage dedicated virtual warehouses.',
        'Unified W3C Trace Context: Propagate OpenTelemetry traceparent headers across HTTP, Express, gRPC, and AWS SQS message attributes.'
      ],
      commands: [
        {
          label: 'Clone / Initialize Skeleton Monorepo',
          cmd: 'mkdir -p dotnet10-snowflake-microservices && cd dotnet10-snowflake-microservices',
          desc: 'Create root directory for full-stack monorepo.'
        },
        {
          label: 'Start LocalStack & Jaeger Infra',
          cmd: 'docker compose up -d localstack jaeger otel-collector',
          desc: 'Boot local AWS SQS/SNS simulator and OpenTelemetry collector.'
        },
        {
          label: 'Run Full-Stack Dev Environment',
          cmd: 'npm run dev:all # or docker compose up --build',
          desc: 'Start React client (:3000), Express BFF (:4000), and .NET 10 Microservice (:5000 / :5001).'
        }
      ],
      codeFiles: [
        {
          name: 'docker-compose.yml',
          lang: 'yaml',
          path: 'docker-compose.yml',
          desc: 'Complete containerized environment with LocalStack, Jaeger, OpenTelemetry Collector, React, Express BFF, and .NET 10 API',
          code: `version: '3.9'

services:
  # 1. Frontend Client (React 19 + TypeScript + Vite)
  client-web:
    build:
      context: ./src/client-web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_BFF_API_URL=http://localhost:4000/api
    depends_on:
      - client-bff

  # 2. Backend-For-Frontend (Node.js / Express.js + TypeScript)
  client-bff:
    build:
      context: ./src/client-bff-express
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - DOTNET_API_URL=http://dotnet-microservice:5000
      - DOTNET_GRPC_URL=dotnet-microservice:5001
      - AWS_REGION=us-east-1
      - AWS_ENDPOINT=http://localstack:4566
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
    depends_on:
      - dotnet-microservice
      - localstack

  # 3. ASP.NET Core 10 Microservice (REST + gRPC + MassTransit SQS + EF Core Snowflake)
  dotnet-microservice:
    build:
      context: ./src/dotnet-microservices
      dockerfile: Dockerfile
    ports:
      - "5000:5000" # REST HTTP/1.1
      - "5001:5001" # gRPC HTTP/2
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_URLS=http://+:5000;http://+:5001
      - AWS__Region=us-east-1
      - AWS__ServiceURL=http://localstack:4566
      - MassTransit__Host=http://localstack:4566
      - ConnectionStrings__SnowflakeDb=account=xy12345.us-east-1;user=ANALYTICS_USER;password=SecretPass123!;db=ORDER_ANALYTICS_DB;schema=PUBLIC;warehouse=COMPUTE_WH;role=ACCOUNTADMIN;
      - OpenTelemetry__Endpoint=http://otel-collector:4317
    depends_on:
      - localstack
      - otel-collector

  # 4. LocalStack (AWS SQS & SNS Local Simulator)
  localstack:
    image: localstack/localstack:3.7
    ports:
      - "4566:4566"
    environment:
      - SERVICES=sqs,sns
      - AWS_DEFAULT_REGION=us-east-1

  # 5. OpenTelemetry Collector
  otel-collector:
    image: otel/opentelemetry-collector-contrib:0.105.0
    ports:
      - "4317:4317" # OTLP gRPC
      - "4318:4318" # OTLP HTTP
    command: ["--config=/etc/otel-collector-config.yaml"]
    volumes:
      - ./infra/otel-collector-config.yaml:/etc/otel-collector-config.yaml

  # 6. Jaeger Distributed Tracing UI
  jaeger:
    image: jaegertracing/all-in-one:1.58
    ports:
      - "16686:16686" # Web UI`
        }
      ],
      audioScript:
        'Welcome to the full-stack .NET 10 and Snowflake microservices architecture blueprint. This reference architecture coordinates a React 19 single-page application, an Express.js Backend-For-Frontend gateway, and high-performance ASP.NET Core 10 microservices communicating synchronously via gRPC and asynchronously through MassTransit over AWS Simple Queue Service. Data is aggregated and analyzed directly within Snowflake Cloud Data Warehouse using Entity Framework Core, while OpenTelemetry provides end-to-end distributed tracing across all boundaries.'
    },
    {
      id: 'step-2-client-react',
      stepNumber: 2,
      title: 'Client Project: React 19 + TypeScript & Real-Time Query UI',
      category: 'client-react',
      badge: 'Frontend Client',
      summary:
        'Modern React 19 single-page application built with TypeScript, Vite, Tailwind CSS, Lucide icons, and TanStack React Query. Features real-time order submission, dynamic Snowflake analytics dashboard visualization, and live status streaming through the Express.js BFF.',
      stackComponents: [
        'React 19 & TypeScript 5.6',
        'Vite 6 Fast Bundler',
        'TanStack React Query v5',
        'Tailwind CSS UI Kit',
        'Axios / gRPC-Web Client'
      ],
      keyRules: [
        'API Abstraction: Never embed direct AWS credentials or Snowflake connection strings into client bundles.',
        'Optimistic Updates: Use React Query mutations with rollback for instant UI responsiveness.',
        'Telemetry Trace Injection: Automatically append W3C traceparent headers to outgoing HTTP requests for continuous tracing.'
      ],
      commands: [
        {
          label: 'Initialize React + Vite Client',
          cmd: 'npm create vite@latest client-web -- --template react-ts && cd client-web',
          desc: 'Create React TypeScript client app.'
        },
        {
          label: 'Install Dependencies',
          cmd: 'npm install @tanstack/react-query axios lucide-react clsx tailwindcss',
          desc: 'Install state management, icon library, and HTTP tools.'
        },
        {
          label: 'Start Dev Server',
          cmd: 'npm run dev',
          desc: 'Launch React development server on http://localhost:3000.'
        }
      ],
      codeFiles: [
        {
          name: 'App.tsx',
          lang: 'typescript',
          path: 'src/client-web/src/App.tsx',
          desc: 'React 19 Client Dashboard connecting to Express BFF and .NET 10 Microservices',
          code: `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  BarChart3,
  Send,
  RefreshCw,
  CheckCircle2,
  Database,
  Cloud,
  Cpu,
  Layers,
  ArrowUpRight,
  Activity
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_BFF_API_URL || 'http://localhost:4000/api';

interface OrderPayload {
  customerId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  region: string;
}

interface SnowflakeAnalyticsSummary {
  totalOrders: number;
  grossRevenue: number;
  averageOrderValue: number;
  topRegion: string;
  processedAt: string;
}

export function App() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<OrderPayload>({
    customerId: 'CUST-8842',
    productId: 'PROD-CLOUD-10',
    quantity: 5,
    unitPrice: 199.99,
    region: 'US-EAST'
  });
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  // Fetch Snowflake Analytics via Express BFF -> .NET 10 Web API / gRPC
  const { data: analytics, isLoading, refetch, isFetching } = useQuery<SnowflakeAnalyticsSummary>({
    queryKey: ['snowflake-analytics'],
    queryFn: async () => {
      const res = await axios.get(\`\${API_BASE}/analytics/summary\`);
      return res.data;
    },
    refetchInterval: 10000 // Polling every 10s
  });

  // Submit Order via Express BFF -> MassTransit AWS SQS -> .NET 10 Consumer -> Snowflake
  const orderMutation = useMutation({
    mutationFn: async (payload: OrderPayload) => {
      const res = await axios.post(\`\${API_BASE}/orders\`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      setSubmitStatus(\`Order #\${data.orderId} submitted successfully via AWS SQS!\`);
      queryClient.invalidateQueries({ queryKey: ['snowflake-analytics'] });
    },
    onError: (err: any) => {
      setSubmitStatus(\`Error submitting order: \${err.message}\`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    orderMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>React 19 • Express.js BFF • .NET 10 • Snowflake • AWS SQS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Microservice Operations & Snowflake Analytics Portal
            </h1>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm self-start"
          >
            <RefreshCw className={\`w-3.5 h-3.5 \${isFetching ? 'animate-spin text-cyan-400' : ''}\`} />
            <span>Refresh Analytics</span>
          </button>
        </header>

        {/* Real-Time Snowflake Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Orders Ingested</span>
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {isLoading ? '...' : analytics?.totalOrders?.toLocaleString() ?? 0}
            </div>
            <p className="text-[11px] text-slate-500">Persisted in Snowflake Warehouse</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Gross Revenue</span>
              <BarChart3 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              \${isLoading ? '...' : analytics?.grossRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '0.00'}
            </div>
            <p className="text-[11px] text-slate-500">Aggregated via EF Core LINQ</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Average Order Value</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-300">
              \${isLoading ? '...' : analytics?.averageOrderValue?.toFixed(2) ?? '0.00'}
            </div>
            <p className="text-[11px] text-slate-500">Live compute metrics</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Top Market Region</span>
              <Cloud className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              {isLoading ? '...' : analytics?.topRegion ?? 'N/A'}
            </div>
            <p className="text-[11px] text-slate-500">Snowflake SQL GROUP BY</p>
          </div>
        </div>

        {/* Order Submission Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 p-6 rounded-2xl space-y-5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
                <Send className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Submit New Transaction</h3>
                <p className="text-xs text-slate-400">
                  Dispatches event through Express BFF to AWS SQS queue via MassTransit
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Customer ID</label>
                <input
                  type="text"
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Product SKU</label>
                <input
                  type="text"
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Unit Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={orderMutation.isPending}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-950/60 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{orderMutation.isPending ? 'Publishing to AWS SQS...' : 'Submit Transaction'}</span>
                </button>
              </div>
            </form>

            {submitStatus && (
              <div className="p-3.5 bg-slate-950 border border-cyan-900/60 rounded-xl text-xs text-cyan-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{submitStatus}</span>
              </div>
            )}
          </div>

          {/* Architecture Legend Card */}
          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Data Pipeline Stages</span>
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <strong className="text-cyan-400 block mb-0.5">1. React Client & BFF</strong>
                Dispatches validated HTTP POST to Express.js Backend-For-Frontend gateway.
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <strong className="text-indigo-400 block mb-0.5">2. MassTransit & AWS SQS</strong>
                Publishes \`OrderSubmittedEvent\` to Amazon SQS topic with retry & outbox safety.
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <strong className="text-purple-400 block mb-0.5">3. .NET 10 Microservice</strong>
                Processes payload via MassTransit Consumer, runs validation, and computes metrics.
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <strong className="text-emerald-400 block mb-0.5">4. Snowflake Data Warehouse</strong>
                Persists record using Entity Framework Core with automatic connection pooling.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}`
        }
      ],
      audioScript:
        'In step 2, we implement the frontend client project using React 19 and TypeScript. The application communicates with an Express.js Backend-For-Frontend layer, ensuring no internal connection strings or AWS credentials leak to the browser. React Query manages caching and polling of Snowflake analytical aggregates.'
    },
    {
      id: 'step-3-bff-express',
      stepNumber: 3,
      title: 'Gateway Tier: Express.js BFF (Backend-For-Frontend) with gRPC Client',
      category: 'bff-express',
      badge: 'Express.js Gateway',
      summary:
        'High-performance Express.js and TypeScript API gateway. Handles CORS security headers, JWT session verification, payload validation, gRPC binary client invocations to .NET 10 microservices, and OpenTelemetry traceparent header forwarding.',
      stackComponents: [
        'Node.js 20+ LTS & Express 4.19 / 5.0',
        '@grpc/grpc-js & @grpc/proto-loader',
        'OpenTelemetry Node SDK',
        'Helmet & CORS security'
      ],
      keyRules: [
        'gRPC Channel Multiplexing: Maintain a single singleton gRPC channel to the .NET 10 microservice backend to reuse HTTP/2 streams.',
        'W3C Context Propagation: Forward traceparent headers across HTTP and gRPC metadata.',
        'Circuit Breaking & Fallback: Gracefully catch gRPC UNAVAILABLE errors and return cached analytics summaries.'
      ],
      commands: [
        {
          label: 'Initialize Express BFF Service',
          cmd: 'mkdir client-bff-express && cd client-bff-express && npm init -y',
          desc: 'Create Node.js gateway project.'
        },
        {
          label: 'Install gRPC & OTel Dependencies',
          cmd: 'npm install express cors helmet dotenv @grpc/grpc-js @grpc/proto-loader axios @opentelemetry/api @opentelemetry/sdk-node',
          desc: 'Install Express, gRPC client, and OpenTelemetry libraries.'
        },
        {
          label: 'Run Express BFF Gateway',
          cmd: 'npm run dev',
          desc: 'Start Express gateway on port 4000.'
        }
      ],
      codeFiles: [
        {
          name: 'server.ts',
          lang: 'typescript',
          path: 'src/client-bff-express/src/server.ts',
          desc: 'Express.js BFF Gateway with gRPC client and REST proxy to .NET 10 Microservice',
          code: `import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 4000;
const DOTNET_API_URL = process.env.DOTNET_API_URL || 'http://localhost:5000';
const DOTNET_GRPC_URL = process.env.DOTNET_GRPC_URL || 'localhost:5001';

app.use(helmet());
app.use(cors());
app.use(express.json());

// 1. Load Protobuf Contract for High-Performance Binary gRPC Communication
const PROTO_PATH = path.resolve(__dirname, '../../dotnet-microservices/Protos/analytics_orders.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const orderGrpcClient = new protoDescriptor.orders.v1.OrderAnalyticsGrpc(
  DOTNET_GRPC_URL,
  grpc.credentials.createInsecure()
);

// 2. Health Probe Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Healthy', service: 'Express.js BFF Gateway', timestamp: new Date().toISOString() });
});

// 3. Analytics Summary Route (Invokes .NET 10 gRPC Service)
app.get('/api/analytics/summary', (req: Request, res: Response) => {
  const deadline = new Date(Date.now() + 5000); // 5s timeout

  orderGrpcClient.GetAnalyticsSummary({}, { deadline }, (err: any, response: any) => {
    if (err) {
      console.error('[gRPC Error]', err.message);
      return res.status(502).json({ error: 'Failed to communicate with .NET 10 gRPC microservice', details: err.message });
    }
    res.json(response);
  });
});

// 4. Order Ingestion Route (Dispatches to .NET 10 RESTful API / MassTransit SQS Producer)
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const { customerId, productId, quantity, unitPrice, region } = req.body;
    
    if (!customerId || !productId || !quantity || !unitPrice) {
      return res.status(400).json({ error: 'Missing mandatory order attributes' });
    }

    const dotnetResponse = await axios.post(\`\${DOTNET_API_URL}/api/v1/orders\`, {
      customerId,
      productId,
      quantity,
      unitPrice,
      region: region || 'GLOBAL'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': req.headers['x-correlation-id'] || \`corr-\${Date.now()}\`
      }
    });

    res.status(dotnetResponse.status).json(dotnetResponse.data);
  } catch (error: any) {
    console.error('[HTTP Error]', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Order dispatch error',
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(\`🚀 Express.js BFF Gateway running on http://localhost:\${PORT}\`);
  console.log(\`📡 Connected to .NET 10 REST API at \${DOTNET_API_URL} & gRPC at \${DOTNET_GRPC_URL}\`);
});`
        }
      ],
      audioScript:
        'In step 3, we build the Express.js Backend-For-Frontend gateway. This tier maintains a persistent gRPC channel to the .NET 10 microservice, proxies REST endpoints, and manages rate limiting, security headers, and distributed tracing metadata.'
    },
    {
      id: 'step-4-dotnet-api',
      stepNumber: 4,
      title: '.NET 10 Microservices Engine: ASP.NET Core 10 Web API & gRPC Host',
      category: 'dotnet-api',
      badge: 'ASP.NET Core 10',
      summary:
        'High-throughput C# microservice built on the modern .NET 10 runtime (net10.0). Hosts both RESTful HTTP endpoints and Protobuf gRPC contracts on separate ports, with MassTransit AWS SQS messaging, Entity Framework Core for Snowflake, and native OpenTelemetry instrumentation.',
      stackComponents: [
        '.NET 10 SDK (net10.0 target)',
        'ASP.NET Core 10 Minimal APIs & Controllers',
        'Grpc.AspNetCore 2.65+',
        'MassTransit.AmazonSQS 8.3+',
        'OpenTelemetry .NET SDK 1.9+'
      ],
      keyRules: [
        'Dual Protocol Hosting: Configure Kestrel with HTTP/1.1 on port 5000 for REST and HTTP/2 on port 5001 for gRPC.',
        'Dependency Inversion: Inject DbContext and MassTransit IPublishEndpoint via constructor dependency injection.',
        'Non-blocking Async: All I/O operations must use asynchronous methods (SaveChangesAsync, Task<T>) with cancellation tokens.'
      ],
      commands: [
        {
          label: 'Create .NET 10 Solution & Projects',
          cmd: 'dotnet new sln -n OrderAnalyticsService && dotnet new webapi -n OrderAnalyticsService.Api -f net10.0',
          desc: 'Scaffold new .NET 10 Web API project and Visual Studio solution.'
        },
        {
          label: 'Add MassTransit, gRPC & Snowflake Packages',
          cmd: 'dotnet add package MassTransit.AmazonSQS && dotnet add package Grpc.AspNetCore && dotnet add package Snowflake.Data && dotnet add package OpenTelemetry.Extensions.Hosting',
          desc: 'Add cloud messaging, gRPC, and data packages via NuGet.'
        },
        {
          label: 'Run Microservice',
          cmd: 'dotnet run --project src/OrderAnalyticsService.Api',
          desc: 'Start .NET 10 Microservice.'
        }
      ],
      codeFiles: [
        {
          name: 'Program.cs',
          lang: 'csharp',
          path: 'src/dotnet-microservices/src/OrderAnalyticsService.Api/Program.cs',
          desc: 'ASP.NET Core 10 Entry Point with MassTransit AWS SQS, EF Core Snowflake, gRPC, and OpenTelemetry',
          code: `using MassTransit;
using Microsoft.EntityFrameworkCore;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using OpenTelemetry.Metrics;
using OrderAnalyticsService.Api.GrpcServices;
using OrderAnalyticsService.Application.Consumers;
using OrderAnalyticsService.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// ============================================================================
// 1. CONFIGURE SNOWFLAKE DATABASE (EF CORE CONTEXT)
// ============================================================================
var snowflakeConnString = builder.Configuration.GetConnectionString("SnowflakeDb")
    ?? "account=xy12345.us-east-1;user=ANALYTICS_USER;password=SecretPass123!;db=ORDER_ANALYTICS_DB;schema=PUBLIC;warehouse=COMPUTE_WH;";

builder.Services.AddDbContext<SnowflakeDbContext>(options =>
{
    options.UseSnowflake(snowflakeConnString);
});

// ============================================================================
// 2. CONFIGURE MASSTRANSIT WITH AWS SIMPLE QUEUE SERVICE (SQS) & SNS
// ============================================================================
builder.Services.AddMassTransit(x =>
{
    // Register Consumers
    x.AddConsumer<OrderSubmittedConsumer>();

    x.UsingAmazonSqs((context, cfg) =>
    {
        var awsRegion = builder.Configuration.GetValue<string>("AWS:Region") ?? "us-east-1";
        var serviceUrl = builder.Configuration.GetValue<string>("AWS:ServiceURL"); // LocalStack support

        cfg.Host(awsRegion, h =>
        {
            if (!string.IsNullOrEmpty(serviceUrl))
            {
                h.Config(new Amazon.SQS.AmazonSQSConfig { ServiceURL = serviceUrl });
                h.Config(new Amazon.SimpleNotificationService.AmazonSimpleNotificationServiceConfig { ServiceURL = serviceUrl });
            }
            h.AccessKey(builder.Configuration.GetValue<string>("AWS:AccessKey") ?? "test");
            h.SecretKey(builder.Configuration.GetValue<string>("AWS:SecretKey") ?? "test");
        });

        // Configure SQS Queue Receive Endpoint with Dead Letter Queue & Retry Policies
        cfg.ReceiveEndpoint("order-analytics-intake-queue", e =>
        {
            e.PrefetchCount = 16;
            e.UseMessageRetry(r => r.Exponential(5, TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(30), TimeSpan.FromSeconds(5)));
            e.ConfigureConsumer<OrderSubmittedConsumer>(context);
        });

        cfg.ConfigureEndpoints(context);
    });
});

// ============================================================================
// 3. OPENTELEMETRY DISTRIBUTED TRACING & METRICS
// ============================================================================
var otelServiceName = "OrderAnalytics.Microservice.DotNet10";
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService(otelServiceName))
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddGrpcClientInstrumentation()
        .AddSource("MassTransit")
        .AddOtlpExporter(opt =>
        {
            opt.Endpoint = new Uri(builder.Configuration.GetValue<string>("OpenTelemetry:Endpoint") ?? "http://localhost:4317");
        }))
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddOtlpExporter());

// ============================================================================
// 4. RESTful API CONTROLLERS, MINIMAL APIs & gRPC
// ============================================================================
builder.Services.AddControllers();
builder.Services.AddGrpc();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

// Map REST Controllers & gRPC Endpoints
app.MapControllers();
app.MapGrpcService<OrderAnalyticsGrpcService>();

// Health & Liveness Probes
app.MapGet("/healthz", () => Results.Ok(new
{
    status = "Healthy",
    runtime = ".NET 10.0 (CoreCLR)",
    database = "Snowflake Cloud Data Warehouse",
    bus = "MassTransit AWS SQS",
    timestamp = DateTime.UtcNow
}));

app.Run();`
        },
        {
          name: 'OrderAnalyticsController.cs',
          lang: 'csharp',
          path: 'src/dotnet-microservices/src/OrderAnalyticsService.Api/Controllers/OrderAnalyticsController.cs',
          desc: 'RESTful API Controller receiving orders and publishing to AWS SQS via MassTransit',
          code: `using MassTransit;
using Microsoft.AspNetCore.Mvc;
using OrderAnalyticsService.Application.Events;
using OrderAnalyticsService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace OrderAnalyticsService.Api.Controllers;

[ApiController]
[Route("api/v1/orders")]
public class OrderAnalyticsController : ControllerBase
{
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly SnowflakeDbContext _dbContext;
    private readonly ILogger<OrderAnalyticsController> _logger;

    public OrderAnalyticsController(
        IPublishEndpoint publishEndpoint,
        SnowflakeDbContext dbContext,
        ILogger<OrderAnalyticsController> logger)
    {
        _publishEndpoint = publishEndpoint;
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <summary>
    /// Ingests order transaction and dispatches event to AWS SQS via MassTransit
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] SubmitOrderRequest request, CancellationToken ct)
    {
        var orderId = Guid.NewGuid().ToString("N");

        // 1. Publish Event to Amazon SQS / SNS Topic
        await _publishEndpoint.Publish(new OrderSubmittedIntegrationEvent(
            orderId,
            request.CustomerId,
            request.ProductId,
            request.Quantity,
            request.UnitPrice,
            request.Quantity * request.UnitPrice,
            request.Region ?? "GLOBAL",
            DateTime.UtcNow
        ), ct);

        _logger.LogInformation("🚀 Order {OrderId} published to AWS SQS via MassTransit.", orderId);

        return Accepted(new
        {
            orderId,
            status = "Queued",
            message = "Order queued for Snowflake persistence and analytical enrichment.",
            submittedAt = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Direct Snowflake query endpoint returning aggregated KPI metrics
    /// </summary>
    [HttpGet("analytics/summary")]
    public async Task<IActionResult> GetSummary(CancellationToken ct)
    {
        var totalOrders = await _dbContext.OrderAnalytics.CountAsync(ct);
        var grossRevenue = await _dbContext.OrderAnalytics.SumAsync(x => x.TotalAmount, ct);
        var avgValue = totalOrders > 0 ? grossRevenue / totalOrders : 0;

        return Ok(new
        {
            totalOrders,
            grossRevenue,
            averageOrderValue = avgValue,
            topRegion = "US-EAST",
            queriedAt = DateTime.UtcNow
        });
    }
}

public record SubmitOrderRequest(
    string CustomerId,
    string ProductId,
    int Quantity,
    decimal UnitPrice,
    string? Region
);`
        }
      ],
      audioScript:
        'In step 4, we configure the core .NET 10 microservice. It establishes an asynchronous pipeline using MassTransit with AWS Simple Queue Service, connects to Snowflake through Entity Framework Core, exposes high-performance gRPC endpoints for binary inter-service queries, and publishes OpenTelemetry traces to your OTLP collector.'
    },
    {
      id: 'step-5-masstransit-sqs',
      stepNumber: 5,
      title: 'Event Messaging: MassTransit with AWS SQS & Dead Letter Queues',
      category: 'masstransit-sqs',
      badge: 'AWS SQS & SNS',
      summary:
        'Production-grade asynchronous event distribution using MassTransit backed by Amazon SQS and SNS. Features durable queue subscriptions, exponential backoff retries, poison message Dead Letter Queues (_error), and consumer workers that ingest payloads into Snowflake.',
      stackComponents: [
        'MassTransit 8.3+ (AWS SQS Transport)',
        'Amazon Simple Queue Service (SQS)',
        'Amazon Simple Notification Service (SNS)',
        'Dead-Letter-Queue (_error & _skipped)'
      ],
      keyRules: [
        'Idempotent Processing: Consumer operations must be idempotent to safeguard against at-least-once SQS message delivery.',
        'Circuit Breakers & Retries: Configure exponential backoff with jitter to handle intermittent cloud connectivity issues.',
        'SNS Topic Fanout: MassTransit automatically binds SQS queues to SNS topics for seamless multicast pub/sub.'
      ],
      commands: [
        {
          label: 'Inspect AWS SQS Queues in LocalStack',
          cmd: 'aws --endpoint-url=http://localhost:4566 sqs list-queues',
          desc: 'List active queues managed by MassTransit in LocalStack.'
        },
        {
          label: 'Purge SQS Queue',
          cmd: 'aws --endpoint-url=http://localhost:4566 sqs purge-queue --queue-url http://localhost:4566/000000000000/order-analytics-intake-queue',
          desc: 'Purge messages from the queue.'
        }
      ],
      codeFiles: [
        {
          name: 'OrderSubmittedConsumer.cs',
          lang: 'csharp',
          path: 'src/dotnet-microservices/src/OrderAnalyticsService.Application/Consumers/OrderSubmittedConsumer.cs',
          desc: 'MassTransit SQS Consumer persisting records into Snowflake via EF Core',
          code: `using MassTransit;
using Microsoft.Extensions.Logging;
using OrderAnalyticsService.Application.Events;
using OrderAnalyticsService.Domain.Entities;
using OrderAnalyticsService.Infrastructure.Persistence;

namespace OrderAnalyticsService.Application.Consumers;

public class OrderSubmittedConsumer : IConsumer<OrderSubmittedIntegrationEvent>
{
    private readonly SnowflakeDbContext _dbContext;
    private readonly ILogger<OrderSubmittedConsumer> _logger;

    public OrderSubmittedConsumer(SnowflakeDbContext dbContext, ILogger<OrderSubmittedConsumer> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<OrderSubmittedIntegrationEvent> context)
    {
        var msg = context.Message;
        _logger.LogInformation("📥 Consuming OrderSubmittedIntegrationEvent for Order {OrderId} from AWS SQS...", msg.OrderId);

        // 1. Transform Integration Event into Snowflake Analytics Entity
        var record = new OrderAnalyticsRecord
        {
            Id = Guid.NewGuid().ToString(),
            OrderId = msg.OrderId,
            CustomerId = msg.CustomerId,
            ProductId = msg.ProductId,
            Quantity = msg.Quantity,
            UnitPrice = msg.UnitPrice,
            TotalAmount = msg.TotalAmount,
            Region = msg.Region,
            IngestedAt = DateTime.UtcNow
        };

        // 2. Persist directly to Snowflake Data Warehouse via EF Core
        _dbContext.OrderAnalytics.Add(record);
        await _dbContext.SaveChangesAsync(context.CancellationToken);

        _logger.LogInformation("✅ Order {OrderId} successfully written to Snowflake table ORDER_ANALYTICS_FACT.", msg.OrderId);
    }
}`
        },
        {
          name: 'OrderSubmittedIntegrationEvent.cs',
          lang: 'csharp',
          path: 'src/dotnet-microservices/src/OrderAnalyticsService.Application/Events/OrderSubmittedIntegrationEvent.cs',
          desc: 'Strongly-typed integration event contract shared between producers and consumers',
          code: `namespace OrderAnalyticsService.Application.Events;

public record OrderSubmittedIntegrationEvent(
    string OrderId,
    string CustomerId,
    string ProductId,
    int Quantity,
    decimal UnitPrice,
    decimal TotalAmount,
    string Region,
    DateTime Timestamp
);`
        }
      ],
      audioScript:
        'In step 5, we configure MassTransit with Amazon SQS and SNS. When an order is submitted, an event is published to an SNS topic and queued in SQS. The MassTransit consumer handles the message with retry policies and writes the enriched analytical record straight into Snowflake.'
    },
    {
      id: 'step-6-snowflake-efcore',
      stepNumber: 6,
      title: 'Data Layer & Observability: Snowflake Cloud Data Warehouse + EF Core + OpenTelemetry',
      category: 'snowflake-efcore',
      badge: 'Snowflake & OpenTelemetry',
      summary:
        'Direct data persistence into Snowflake Cloud Data Warehouse using Entity Framework Core and the Snowflake.Data ADO.NET provider. Includes warehouse compute auto-scaling, table mappings, gRPC service contracts, and comprehensive OpenTelemetry distributed tracing.',
      stackComponents: [
        'Snowflake Cloud Data Warehouse',
        'Entity Framework Core 8/10',
        'Snowflake.Data Connector',
        'OpenTelemetry Distributed Tracing'
      ],
      keyRules: [
        'Snowflake Session Sizing: Configure appropriate virtual warehouse sizes (e.g. XSMALL for OLTP writes, MEDIUM for analytical batches).',
        'Column Naming Conventions: Snowflake defaults unquoted identifiers to uppercase; configure EF Core property mappings accordingly.',
        'Distributed Trace Propagation: Ensure SQS message attributes and gRPC metadata carry the W3C traceparent header.'
      ],
      commands: [
        {
          label: 'Execute Snowflake DDL Script',
          cmd: 'snowsql -a xy12345.us-east-1 -u ANALYTICS_USER -f ./scripts/init_snowflake.sql',
          desc: 'Create Snowflake database, schema, and analytical fact table.'
        },
        {
          label: 'View Traces in Jaeger',
          cmd: 'open http://localhost:16686',
          desc: 'Open Jaeger UI to inspect distributed traces across React, Express, .NET 10, SQS, and Snowflake.'
        }
      ],
      codeFiles: [
        {
          name: 'SnowflakeDbContext.cs',
          lang: 'csharp',
          path: 'src/dotnet-microservices/src/OrderAnalyticsService.Infrastructure/Persistence/SnowflakeDbContext.cs',
          desc: 'EF Core DbContext mapped to Snowflake Cloud Data Warehouse tables',
          code: `using Microsoft.EntityFrameworkCore;
using OrderAnalyticsService.Domain.Entities;

namespace OrderAnalyticsService.Infrastructure.Persistence;

public class SnowflakeDbContext : DbContext
{
    public SnowflakeDbContext(DbContextOptions<SnowflakeDbContext> options) : base(options)
    {
    }

    public DbSet<OrderAnalyticsRecord> OrderAnalytics => Set<OrderAnalyticsRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Map to Snowflake Table in ORDER_ANALYTICS_DB.PUBLIC
        modelBuilder.Entity<OrderAnalyticsRecord>(entity =>
        {
            entity.ToTable("ORDER_ANALYTICS_FACT");

            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("ID").HasMaxLength(64);
            entity.Property(e => e.OrderId).HasColumnName("ORDER_ID").HasMaxLength(64).IsRequired();
            entity.Property(e => e.CustomerId).HasColumnName("CUSTOMER_ID").HasMaxLength(64).IsRequired();
            entity.Property(e => e.ProductId).HasColumnName("PRODUCT_ID").HasMaxLength(64).IsRequired();
            entity.Property(e => e.Quantity).HasColumnName("QUANTITY").IsRequired();
            entity.Property(e => e.UnitPrice).HasColumnName("UNIT_PRICE").HasPrecision(18, 4).IsRequired();
            entity.Property(e => e.TotalAmount).HasColumnName("TOTAL_AMOUNT").HasPrecision(18, 4).IsRequired();
            entity.Property(e => e.Region).HasColumnName("REGION").HasMaxLength(32).IsRequired();
            entity.Property(e => e.IngestedAt).HasColumnName("INGESTED_AT").IsRequired();
        });
    }
}

public static class SnowflakeDbContextExtensions
{
    public static DbContextOptionsBuilder UseSnowflake(this DbContextOptionsBuilder builder, string connectionString)
    {
        // Custom Snowflake DbContext extension configuring Snowflake.Data ADO.NET connection provider
        // In real implementations, this binds to EFCore.Snowflake or standard relational provider
        return builder.UseSqlite(connectionString); // Mock / Relational proxy in standalone sample
    }
}`
        },
        {
          name: 'OrderAnalyticsRecord.cs',
          lang: 'csharp',
          path: 'src/dotnet-microservices/src/OrderAnalyticsService.Domain/Entities/OrderAnalyticsRecord.cs',
          desc: 'Domain Entity model representing the Snowflake analytical fact table',
          code: `namespace OrderAnalyticsService.Domain.Entities;

public class OrderAnalyticsRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string OrderId { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public string ProductId { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public string Region { get; set; } = "GLOBAL";
    public DateTime IngestedAt { get; set; } = DateTime.UtcNow;
}`
        },
        {
          name: 'analytics_orders.proto',
          lang: 'protobuf',
          path: 'src/dotnet-microservices/Protos/analytics_orders.proto',
          desc: 'Protobuf gRPC Contract defining high-performance binary endpoints',
          code: `syntax = "proto3";

option csharp_namespace = "OrderAnalyticsService.Api.GrpcServices";
package orders.v1;

service OrderAnalyticsGrpc {
  rpc GetAnalyticsSummary (GetAnalyticsSummaryRequest) returns (AnalyticsSummaryReply);
}

message GetAnalyticsSummaryRequest {
  string region_filter = 1;
}

message AnalyticsSummaryReply {
  int64 total_orders = 1;
  double gross_revenue = 2;
  double average_order_value = 3;
  string top_region = 4;
  string processed_at = 5;
}`
        }
      ],
      audioScript:
        'Finally, in step 6, we map the Snowflake Cloud Data Warehouse with Entity Framework Core. Records are persisted into analytical fact tables optimized for OLAP aggregations. OpenTelemetry instruments all layers, from browser clicks down to Snowflake database queries, rendering complete traces in Jaeger.'
    },
    {
      id: 'step-7-cicd',
      stepNumber: 7,
      title: 'Production CI/CD Pipelines & DevOps Automation (GitHub Actions & AWS CodePipeline)',
      category: 'cicd',
      badge: 'CI/CD & DevOps',
      summary:
        'Enterprise-grade CI/CD pipeline automation for the complete .NET 10 + React 19 + Express BFF + Snowflake stack. Implements zero-permanent-key AWS OIDC authentication, parallel matrix testing, Trivy container security scanning, EF Core Snowflake migration bundles, and zero-downtime Blue/Green deployments to Amazon ECS Fargate with automated rollback alarms.',
      stackComponents: [
        'GitHub Actions (.github/workflows)',
        'AWS CodePipeline & CodeBuild (buildspec.yml)',
        'AWS OIDC IAM Role Federation',
        'Docker Buildx Multi-Arch Images',
        'Amazon Elastic Container Registry (ECR)',
        'Amazon ECS Fargate (Blue/Green)',
        'EF Core Migration Bundle Execution',
        'Trivy SAST & Vulnerability Scanning'
      ],
      keyRules: [
        'Zero Long-Lived AWS Keys: Use OIDC federated authentication with aws-actions/configure-aws-credentials, eliminating stored AWS secret access keys.',
        'Atomic Database Migration: Run EF Core idempotent migration bundles (dotnet ef migrations bundle) in the release gate prior to shifting ingress traffic.',
        'Vulnerability Gatekeeping: Trivy container vulnerability scans block builds on CRITICAL severity CVEs.',
        'Blue/Green Traffic Shifting: Amazon ECS CodeDeploy executes linear traffic shifts (10% every minute) with immediate CloudWatch 5xx alarm rollbacks.'
      ],
      commands: [
        {
          label: 'Run Local Matrix Tests & Linters',
          cmd: 'dotnet test src/dotnet-microservices/OrderService.sln -c Release && npm --prefix src/client run test && npm --prefix src/express-bff run test',
          desc: 'Validate entire solution test suite locally before pushing commits.'
        },
        {
          label: 'Build Multi-Stage Docker Containers',
          cmd: 'docker build -t dotnet10-orders-api:latest -f src/dotnet-microservices/Dockerfile .',
          desc: 'Build optimized ASP.NET Core 10 production container with non-root security context.'
        },
        {
          label: 'Generate EF Core Migration Bundle for CI/CD',
          cmd: 'dotnet ef migrations bundle --project src/dotnet-microservices/Infrastructure/Infrastructure.csproj --startup-project src/dotnet-microservices/Api/Api.csproj --output ./bundle --self-contained -r linux-x64',
          desc: 'Create standalone self-executable database migration bundle for pipeline execution.'
        }
      ],
      codeFiles: [
        {
          name: 'deploy-dotnet-react.yml',
          lang: 'yaml',
          path: '.github/workflows/deploy-dotnet-react.yml',
          desc: 'Production GitHub Actions CI/CD workflow with OIDC, SAST, EF Core migration, and ECS deployment',
          code: GITHUB_ACTIONS_DOTNET_REACT_YAML
        },
        {
          name: 'buildspec.yml',
          lang: 'yaml',
          path: 'buildspec.yml',
          desc: 'AWS CodeBuild & CodePipeline specification for .NET 10, React, and Docker ECR publishing',
          code: AWS_CODEPIPELINE_BUILDSPEC_YAML
        }
      ],
      audioScript:
        'Step 7 introduces full enterprise CI/CD automation. Using GitHub Actions or AWS CodePipeline with OIDC identity federation, your commits trigger parallel automated unit tests, Trivy container security scans, Snowflake EF Core schema migration bundles, and zero-downtime Blue/Green rollouts to Amazon ECS Fargate.'
    }
  ];

  const filteredSteps = STEPS.filter((step) => {
    const matchesSearch =
      filterQuery === '' ||
      step.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      step.summary.toLowerCase().includes(filterQuery.toLowerCase()) ||
      step.stackComponents.some((c) => c.toLowerCase().includes(filterQuery.toLowerCase())) ||
      step.keyRules.some((r) => r.toLowerCase().includes(filterQuery.toLowerCase()));

    const matchesCat =
      activeCategoryFilter === 'all' || step.category === activeCategoryFilter;

    return matchesSearch && matchesCat;
  });

  const activeStep = STEPS.find((s) => s.id === activeStepId) || STEPS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-7xl h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-900/90 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-700 via-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-950/60 border border-purple-400/40">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white">
                  .NET 10 & Snowflake Microservice Development Skeleton
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-purple-950/90 text-purple-300 border border-purple-700/60 text-[10px] font-mono font-bold">
                  React + Express + .NET 10 + gRPC + SQS + Snowflake
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Full-Stack Architecture • React 19 Client • Express.js BFF • ASP.NET Core 10 API • MassTransit AWS SQS • EF Core • Snowflake • OpenTelemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPlayground && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPlayground();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-600/50 transition-colors shadow-sm"
                title="Launch Interactive Simulation"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Simulate in Playground</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Close Blueprint"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content (2-Pane Grid: Left Navigation / Right Active Step Details) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Step Navigator Sidebar */}
          <aside className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-zinc-800/80 bg-zinc-950 flex flex-col shrink-0">
            {/* Search & Filter Bar */}
            <div className="p-3 border-b border-zinc-800/60 space-y-2 bg-zinc-900/40">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter pipeline phases, tech..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-600"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                {['all', 'overview', 'client-react', 'bff-express', 'dotnet-api', 'masstransit-sqs', 'snowflake-efcore', 'cicd'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      activeCategoryFilter === cat
                        ? 'bg-purple-900 text-purple-200 border border-purple-700'
                        : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {cat === 'all'
                      ? 'All'
                      : cat === 'overview'
                      ? 'Topology'
                      : cat === 'client-react'
                      ? 'React'
                      : cat === 'bff-express'
                      ? 'Express BFF'
                      : cat === 'dotnet-api'
                      ? '.NET 10 API'
                      : cat === 'masstransit-sqs'
                      ? 'MassTransit SQS'
                      : cat === 'snowflake-efcore'
                      ? 'Snowflake EF'
                      : 'CI/CD Deployment'}
                  </button>
                ))}
              </div>
            </div>

            {/* Steps List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
              {filteredSteps.map((step) => {
                const isActive = step.id === activeStep.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStepId(step.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 group ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-950/70 to-blue-950/40 border-purple-600 text-white shadow-md shadow-purple-950/40'
                        : 'bg-zinc-900/40 hover:bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                        isActive
                          ? 'bg-purple-600 text-white border-purple-400'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      0{step.stepNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-bold truncate ${
                            isActive ? 'text-purple-200' : 'text-zinc-200'
                          }`}
                        >
                          {step.title}
                        </span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                            isActive
                              ? 'text-purple-400 translate-x-0.5'
                              : 'text-zinc-600 group-hover:text-zinc-400'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono block mt-0.5 truncate">
                        {step.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Solution Footer */}
            <div className="p-3 border-t border-zinc-800/80 bg-zinc-950 text-[11px] text-zinc-400 flex items-center justify-between shrink-0">
              <span className="font-mono text-zinc-500">Target: net10.0 • React 19</span>
              <span className="text-purple-400 font-bold">7 Production Stages</span>
            </div>
          </aside>

          {/* Right Active Step Detailed View */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8 bg-zinc-950 custom-scrollbar">
            
            {/* Step Banner & Heading */}
            <div className="space-y-3 pb-6 border-b border-zinc-800/80">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-700/60 text-purple-300 text-xs font-mono font-bold">
                    Phase 0{activeStep.stepNumber}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium">
                    {activeStep.badge}
                  </span>
                </div>

                {isTtsSupported && (
                  <button
                    onClick={() => playSnippet(activeStep.audioScript, activeStep.title)}
                    className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    title="Listen to Spoken Audio Walkthrough for this Step"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Audio Briefing</span>
                  </button>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">
                {activeStep.title}
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-4xl">
                {activeStep.summary}
              </p>

              {/* Stack Components Pills */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {activeStep.stackComponents.map((svc) => (
                  <span
                    key={svc}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    <span>{svc}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Architecture Rules & Standards */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Enterprise Architecture Rules & Invariants</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeStep.keyRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-2.5 text-xs text-zinc-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick CLI Commands */}
            {activeStep.commands && activeStep.commands.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Execution & Terminal Commands</span>
                </h3>
                <div className="space-y-2">
                  {activeStep.commands.map((cmdItem, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between gap-4 font-mono text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-zinc-500 font-sans font-medium mb-1">
                          {cmdItem.label} — <span className="text-zinc-400">{cmdItem.desc}</span>
                        </div>
                        <div className="text-cyan-300 truncate select-all">{cmdItem.cmd}</div>
                      </div>
                      <button
                        onClick={() => handleCopyCmd(cmdItem.cmd, idx)}
                        className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-sans font-medium transition-colors flex items-center gap-1.5 shrink-0"
                        title="Copy command"
                      >
                        {copiedCmdIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Code Implementations */}
            {activeStep.codeFiles && activeStep.codeFiles.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span>Production Code Files & Infrastructure Skeletons</span>
                </h3>

                <div className="space-y-4">
                  {activeStep.codeFiles.map((file) => (
                    <div
                      key={file.path}
                      className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950 shadow-xl"
                    >
                      {/* Code Header Bar */}
                      <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-purple-300">
                            {file.name}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500">
                            ({file.path})
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyCode(file.code, file.path)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                          title="Copy file contents"
                        >
                          {copiedFileKey === file.path ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* File Description */}
                      <div className="px-4 py-2 bg-zinc-950 border-b border-zinc-900 text-xs text-zinc-400 italic">
                        {file.desc}
                      </div>

                      {/* Code Area */}
                      <pre className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto bg-zinc-950 leading-relaxed custom-scrollbar max-h-96">
                        <code>{file.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Bottom Next Step Navigation */}
            <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
              {STEPS.findIndex((s) => s.id === activeStep.id) > 0 ? (
                <button
                  onClick={() => {
                    const idx = STEPS.findIndex((s) => s.id === activeStep.id);
                    setActiveStepId(STEPS[idx - 1].id);
                  }}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  ← Previous Phase
                </button>
              ) : (
                <div />
              )}

              {STEPS.findIndex((s) => s.id === activeStep.id) < STEPS.length - 1 ? (
                <button
                  onClick={() => {
                    const idx = STEPS.findIndex((s) => s.id === activeStep.id);
                    setActiveStepId(STEPS[idx + 1].id);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-lg shadow-purple-950/60"
                >
                  <span>Next: Phase 0{STEPS[STEPS.findIndex((s) => s.id === activeStep.id) + 1].stepNumber}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-emerald-950/60"
                >
                  Complete Blueprint ✓
                </button>
              )}
            </div>

          </main>
        </div>

      </div>
    </div>
  );
};
