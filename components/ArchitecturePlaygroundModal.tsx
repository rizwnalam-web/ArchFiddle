import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Share2,
  Download,
  Upload,
  Sparkles,
  Zap,
  Activity,
  AlertTriangle,
  Flame,
  Layers,
  Settings,
  Cpu,
  Database,
  Server,
  Globe,
  Smartphone,
  HardDrive,
  Radio,
  Shuffle,
  Eye,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Info,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Copy,
  ChevronRight,
  Terminal,
  HelpCircle,
  BarChart2
} from 'lucide-react';
import { ArchType } from '../types';

// Node Types and Categories
export type NodeCategory = 'client' | 'compute' | 'queue' | 'database' | 'infra';

export interface ComponentDefinition {
  type: string;
  name: string;
  category: NodeCategory;
  icon: string;
  defaultLatency: number; // in ms
  defaultMaxRps: number;
  description: string;
  badgeColor: string;
  borderAccent: string;
  glowColor: string;
}

export const COMPONENT_PALETTE: ComponentDefinition[] = [
  // Clients & Ingress
  {
    type: 'client_web',
    name: 'Web Browser / SPA',
    category: 'client',
    icon: '🌐',
    defaultLatency: 10,
    defaultMaxRps: 1000,
    description: 'React / Next.js / Vue client making HTTP/WebSocket requests',
    badgeColor: 'bg-sky-950 text-sky-300 border-sky-800',
    borderAccent: 'border-sky-500',
    glowColor: '#0ea5e9'
  },
  {
    type: 'client_mobile',
    name: 'Mobile Client (iOS/Android)',
    category: 'client',
    icon: '📱',
    defaultLatency: 25,
    defaultMaxRps: 800,
    description: 'Native mobile app with variable cellular network latency',
    badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
    borderAccent: 'border-indigo-500',
    glowColor: '#6366f1'
  },
  {
    type: 'cdn_edge',
    name: 'Cloudflare / Edge CDN',
    category: 'client',
    icon: '⚡',
    defaultLatency: 5,
    defaultMaxRps: 5000,
    description: 'Global Edge PoP caching static assets and terminating SSL',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    borderAccent: 'border-amber-500',
    glowColor: '#f59e0b'
  },
  {
    type: 'load_balancer',
    name: 'Nginx / ALB Load Balancer',
    category: 'infra',
    icon: '⚖️',
    defaultLatency: 4,
    defaultMaxRps: 4000,
    description: 'Round-robin & least-connections ingress traffic distributor',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    borderAccent: 'border-emerald-500',
    glowColor: '#10b981'
  },
  {
    type: 'api_gateway',
    name: 'Kong / Envoy API Gateway',
    category: 'infra',
    icon: '🛡️',
    defaultLatency: 8,
    defaultMaxRps: 3000,
    description: 'Authentication, rate limiting, and route orchestration proxy',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    borderAccent: 'border-cyan-500',
    glowColor: '#06b6d4'
  },

  // Compute & Microservices
  {
    type: 'microservice',
    name: 'Core API Microservice',
    category: 'compute',
    icon: '⚙️',
    defaultLatency: 35,
    defaultMaxRps: 800,
    description: 'Domain service executing business logic and orchestrating state',
    badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    borderAccent: 'border-purple-500',
    glowColor: '#a855f7'
  },
  {
    type: 'auth_service',
    name: 'Auth & JWT Service',
    category: 'compute',
    icon: '🔑',
    defaultLatency: 20,
    defaultMaxRps: 1500,
    description: 'OAuth2/OIDC token verification and RBAC permission evaluator',
    badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
    borderAccent: 'border-rose-500',
    glowColor: '#f43f5e'
  },
  {
    type: 'serverless_lambda',
    name: 'Serverless Function (Lambda)',
    category: 'compute',
    icon: 'λ',
    defaultLatency: 45,
    defaultMaxRps: 2000,
    description: 'Ephemeral on-demand compute with auto-concurrency scaling',
    badgeColor: 'bg-yellow-950 text-yellow-300 border-yellow-800',
    borderAccent: 'border-yellow-500',
    glowColor: '#eab308'
  },
  {
    type: 'worker_service',
    name: 'Background Worker / Celery',
    category: 'compute',
    icon: '🔄',
    defaultLatency: 120,
    defaultMaxRps: 400,
    description: 'Asynchronous task runner for intensive compute and batch syncs',
    badgeColor: 'bg-teal-950 text-teal-300 border-teal-800',
    borderAccent: 'border-teal-500',
    glowColor: '#14b8a6'
  },

  // Message Queues & Streaming
  {
    type: 'kafka_broker',
    name: 'Apache Kafka Event Log',
    category: 'queue',
    icon: '🪵',
    defaultLatency: 5,
    defaultMaxRps: 10000,
    description: 'High-throughput distributed append-only partition event stream',
    badgeColor: 'bg-red-950 text-red-300 border-red-800',
    borderAccent: 'border-red-500',
    glowColor: '#ef4444'
  },
  {
    type: 'rabbitmq_queue',
    name: 'RabbitMQ / SQS Queue',
    category: 'queue',
    icon: '📬',
    defaultLatency: 8,
    defaultMaxRps: 3000,
    description: 'Message broker with routing keys, ACK delivery, and dead letters',
    badgeColor: 'bg-orange-950 text-orange-300 border-orange-800',
    borderAccent: 'border-orange-500',
    glowColor: '#f97316'
  },

  // Data Stores & Caching
  {
    type: 'redis_cache',
    name: 'Redis In-Memory Cache',
    category: 'database',
    icon: '⚡',
    defaultLatency: 2,
    defaultMaxRps: 15000,
    description: 'Sub-millisecond key-value cache and distributed lock store',
    badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
    borderAccent: 'border-rose-500',
    glowColor: '#f43f5e'
  },
  {
    type: 'postgres_db',
    name: 'PostgreSQL Primary (RDBMS)',
    category: 'database',
    icon: '🐘',
    defaultLatency: 25,
    defaultMaxRps: 600,
    description: 'ACID transactional SQL database with connection pooling',
    badgeColor: 'bg-blue-950 text-blue-300 border-blue-800',
    borderAccent: 'border-blue-500',
    glowColor: '#3b82f6'
  },
  {
    type: 'mongodb_doc',
    name: 'MongoDB / Document DB',
    category: 'database',
    icon: '🍃',
    defaultLatency: 18,
    defaultMaxRps: 1200,
    description: 'Flexible schema JSON document store for high write throughput',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    borderAccent: 'border-emerald-500',
    glowColor: '#10b981'
  },
  {
    type: 's3_storage',
    name: 'S3 Object Storage',
    category: 'database',
    icon: '🪣',
    defaultLatency: 60,
    defaultMaxRps: 2000,
    description: 'Infinite scalability blob store for files, videos, and backups',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    borderAccent: 'border-amber-500',
    glowColor: '#f59e0b'
  }
];

export type ConnectionProtocol = 'http' | 'grpc' | 'event' | 'sql' | 'cache';

export interface PlaygroundNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  status: 'healthy' | 'degraded' | 'crashed';
  latencyMs: number;
  maxRps: number;
  currentRps: number;
  queueDepth: number;
  cacheHitRate?: number; // 0-100%
  errorRatePercent: number;
}

export interface PlaygroundConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  protocol: ConnectionProtocol;
  label?: string;
  latencyOverheadMs: number;
}

export interface FlowPacket {
  id: string;
  connectionId: string;
  progress: number; // 0 to 1
  status: 'ok' | 'error' | 'retrying';
  speed: number;
  fromNodeId: string;
  toNodeId: string;
  payload: string;
}

export interface ArchitectureTemplate {
  id: string;
  name: string;
  tag: string;
  description: string;
  archTypeEquivalent?: ArchType;
  nodes: PlaygroundNode[];
  connections: PlaygroundConnection[];
}

export const PREBUILT_TEMPLATES: ArchitectureTemplate[] = [
  {
    id: 'template-3tier',
    name: 'Classic 3-Tier Web App + Cache',
    tag: 'Monolith / Layered',
    description: 'Web Browser → Load Balancer → Backend API Monolith → Redis Cache & Postgres DB',
    nodes: [
      { id: 'node-web', type: 'client_web', label: 'React SPA Client', x: 80, y: 220, status: 'healthy', latencyMs: 10, maxRps: 1000, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-alb', type: 'load_balancer', label: 'AWS ALB Ingress', x: 300, y: 220, status: 'healthy', latencyMs: 4, maxRps: 4000, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-api', type: 'microservice', label: 'Monolith Backend API', x: 540, y: 220, status: 'healthy', latencyMs: 40, maxRps: 800, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-cache', type: 'redis_cache', label: 'Redis Session & Query Cache', x: 780, y: 120, status: 'healthy', latencyMs: 2, maxRps: 10000, currentRps: 0, queueDepth: 0, cacheHitRate: 85, errorRatePercent: 0 },
      { id: 'node-db', type: 'postgres_db', label: 'Postgres Primary DB', x: 780, y: 320, status: 'healthy', latencyMs: 30, maxRps: 600, currentRps: 0, queueDepth: 0, errorRatePercent: 0 }
    ],
    connections: [
      { id: 'conn-1', fromNodeId: 'node-web', toNodeId: 'node-alb', protocol: 'http', label: 'HTTPS :443', latencyOverheadMs: 15 },
      { id: 'conn-2', fromNodeId: 'node-alb', toNodeId: 'node-api', protocol: 'http', label: 'HTTP /api/*', latencyOverheadMs: 3 },
      { id: 'conn-3', fromNodeId: 'node-api', toNodeId: 'node-cache', protocol: 'cache', label: 'GET/SET (Cache-Aside)', latencyOverheadMs: 1 },
      { id: 'conn-4', fromNodeId: 'node-api', toNodeId: 'node-db', protocol: 'sql', label: 'SQL Connection Pool', latencyOverheadMs: 5 }
    ]
  },
  {
    id: 'template-eda-microservices',
    name: 'Event-Driven Microservices + Kafka',
    tag: 'Event-Driven',
    description: 'API Gateway → Order Service → Kafka Event Bus → Payment & Inventory Workers → DBs',
    nodes: [
      { id: 'node-client', type: 'client_web', label: 'Web / Mobile Shopper', x: 80, y: 240, status: 'healthy', latencyMs: 10, maxRps: 1200, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-gw', type: 'api_gateway', label: 'Kong API Gateway', x: 280, y: 240, status: 'healthy', latencyMs: 8, maxRps: 3000, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-order', type: 'microservice', label: 'Order Microservice', x: 480, y: 150, status: 'healthy', latencyMs: 25, maxRps: 900, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-order-db', type: 'postgres_db', label: 'Order Database', x: 480, y: 350, status: 'healthy', latencyMs: 20, maxRps: 700, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-kafka', type: 'kafka_broker', label: 'Kafka Broker (order-events)', x: 720, y: 150, status: 'healthy', latencyMs: 5, maxRps: 10000, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-payment', type: 'worker_service', label: 'Payment Consumer Worker', x: 940, y: 80, status: 'healthy', latencyMs: 65, maxRps: 450, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-inventory', type: 'worker_service', label: 'Inventory Consumer Worker', x: 940, y: 240, status: 'healthy', latencyMs: 40, maxRps: 550, currentRps: 0, queueDepth: 0, errorRatePercent: 0 }
    ],
    connections: [
      { id: 'conn-1', fromNodeId: 'node-client', toNodeId: 'node-gw', protocol: 'http', label: 'POST /checkout', latencyOverheadMs: 12 },
      { id: 'conn-2', fromNodeId: 'node-gw', toNodeId: 'node-order', protocol: 'grpc', label: 'gRPC CreateOrder', latencyOverheadMs: 2 },
      { id: 'conn-3', fromNodeId: 'node-order', toNodeId: 'node-order-db', protocol: 'sql', label: 'Insert Outbox', latencyOverheadMs: 4 },
      { id: 'conn-4', fromNodeId: 'node-order', toNodeId: 'node-kafka', protocol: 'event', label: 'Publish OrderCreated', latencyOverheadMs: 3 },
      { id: 'conn-5', fromNodeId: 'node-kafka', toNodeId: 'node-payment', protocol: 'event', label: 'Consumer Group: payment', latencyOverheadMs: 4 },
      { id: 'conn-6', fromNodeId: 'node-kafka', toNodeId: 'node-inventory', protocol: 'event', label: 'Consumer Group: inventory', latencyOverheadMs: 4 }
    ]
  },
  {
    id: 'template-serverless-cqrs',
    name: 'Serverless CQRS + Read/Write DB Split',
    tag: 'Serverless / CQRS',
    description: 'API Gateway → Write Lambda → MongoDB (Command) → SQS → Sync Lambda → Redis (Query)',
    nodes: [
      { id: 'node-client', type: 'client_mobile', label: 'Mobile App Client', x: 80, y: 220, status: 'healthy', latencyMs: 20, maxRps: 800, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-apigw', type: 'api_gateway', label: 'AWS HTTP API Gateway', x: 280, y: 220, status: 'healthy', latencyMs: 6, maxRps: 4000, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-write-lambda', type: 'serverless_lambda', label: 'Write Command Lambda', x: 480, y: 130, status: 'healthy', latencyMs: 45, maxRps: 2000, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-read-lambda', type: 'serverless_lambda', label: 'Read Query Lambda', x: 480, y: 310, status: 'healthy', latencyMs: 30, maxRps: 3000, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-write-db', type: 'mongodb_doc', label: 'Primary MongoDB (Write Store)', x: 720, y: 130, status: 'healthy', latencyMs: 15, maxRps: 1500, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-queue', type: 'rabbitmq_queue', label: 'AWS SQS Change Stream', x: 720, y: 230, status: 'healthy', latencyMs: 8, maxRps: 3500, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-read-cache', type: 'redis_cache', label: 'Redis Query Read Model', x: 720, y: 340, status: 'healthy', latencyMs: 2, maxRps: 12000, currentRps: 0, queueDepth: 0, cacheHitRate: 94, errorRatePercent: 0 }
    ],
    connections: [
      { id: 'c1', fromNodeId: 'node-client', toNodeId: 'node-apigw', protocol: 'http', label: 'REST Commands & Queries', latencyOverheadMs: 15 },
      { id: 'c2', fromNodeId: 'node-apigw', toNodeId: 'node-write-lambda', protocol: 'http', label: 'POST /mutate', latencyOverheadMs: 2 },
      { id: 'c3', fromNodeId: 'node-apigw', toNodeId: 'node-read-lambda', protocol: 'http', label: 'GET /views/*', latencyOverheadMs: 2 },
      { id: 'c4', fromNodeId: 'node-write-lambda', toNodeId: 'node-write-db', protocol: 'sql', label: 'Atomic Doc Write', latencyOverheadMs: 4 },
      { id: 'c5', fromNodeId: 'node-write-db', toNodeId: 'node-queue', protocol: 'event', label: 'Change Data Capture (CDC)', latencyOverheadMs: 5 },
      { id: 'c6', fromNodeId: 'node-queue', toNodeId: 'node-read-cache', protocol: 'event', label: 'Async Read-Projection Sync', latencyOverheadMs: 3 },
      { id: 'c7', fromNodeId: 'node-read-lambda', toNodeId: 'node-read-cache', protocol: 'cache', label: 'Instant Query Hit', latencyOverheadMs: 1 }
    ]
  },
  {
    id: 'template-edge-mesh',
    name: 'Global Edge CDN + Regional Microservices',
    tag: 'Edge Computing',
    description: 'Clients worldwide → Cloudflare Edge PoP → Regional API Gateways → Distributed Storage',
    nodes: [
      { id: 'node-c1', type: 'client_web', label: 'US West Users', x: 80, y: 140, status: 'healthy', latencyMs: 15, maxRps: 900, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-c2', type: 'client_mobile', label: 'EU Central Users', x: 80, y: 300, status: 'healthy', latencyMs: 25, maxRps: 700, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-edge', type: 'cdn_edge', label: 'Cloudflare Workers Edge', x: 300, y: 220, status: 'healthy', latencyMs: 5, maxRps: 6000, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-gw-us', type: 'api_gateway', label: 'Region: us-east Gateway', x: 540, y: 140, status: 'healthy', latencyMs: 8, maxRps: 2500, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-gw-eu', type: 'api_gateway', label: 'Region: eu-west Gateway', x: 540, y: 300, status: 'healthy', latencyMs: 8, maxRps: 2500, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-db-primary', type: 'postgres_db', label: 'Global CockroachDB Mesh', x: 780, y: 220, status: 'healthy', latencyMs: 22, maxRps: 1800, currentRps: 0, queueDepth: 0, errorRatePercent: 0 },
      { id: 'node-s3', type: 's3_storage', label: 'S3 Multi-Region Assets', x: 780, y: 380, status: 'healthy', latencyMs: 50, maxRps: 3000, currentRps: 0, queueDepth: 0, errorRatePercent: 0 }
    ],
    connections: [
      { id: 'e1', fromNodeId: 'node-c1', toNodeId: 'node-edge', protocol: 'http', label: 'Anycast DNS', latencyOverheadMs: 8 },
      { id: 'e2', fromNodeId: 'node-c2', toNodeId: 'node-edge', protocol: 'http', label: 'Anycast DNS', latencyOverheadMs: 12 },
      { id: 'e3', fromNodeId: 'node-edge', toNodeId: 'node-gw-us', protocol: 'http', label: 'Smart Geo-Routing US', latencyOverheadMs: 25 },
      { id: 'e4', fromNodeId: 'node-edge', toNodeId: 'node-gw-eu', protocol: 'http', label: 'Smart Geo-Routing EU', latencyOverheadMs: 20 },
      { id: 'e5', fromNodeId: 'node-gw-us', toNodeId: 'node-db-primary', protocol: 'sql', label: 'Raft Consensus SQL', latencyOverheadMs: 5 },
      { id: 'e6', fromNodeId: 'node-gw-eu', toNodeId: 'node-db-primary', protocol: 'sql', label: 'Raft Consensus SQL', latencyOverheadMs: 5 },
      { id: 'e7', fromNodeId: 'node-edge', toNodeId: 'node-s3', protocol: 'http', label: 'Presigned Media Uploads', latencyOverheadMs: 18 }
    ]
  }
];

interface ArchitecturePlaygroundModalProps {
  onClose: () => void;
  onAskAI?: (prompt: string) => void;
}

export const ArchitecturePlaygroundModal: React.FC<ArchitecturePlaygroundModalProps> = ({
  onClose,
  onAskAI
}) => {
  // Playground state
  const [nodes, setNodes] = useState<PlaygroundNode[]>(() => PREBUILT_TEMPLATES[0].nodes);
  const [connections, setConnections] = useState<PlaygroundConnection[]>(() => PREBUILT_TEMPLATES[0].connections);
  
  // Selection & UI State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [activePaletteCategory, setActivePaletteCategory] = useState<NodeCategory | 'all'>('all');
  const [isConnectingFrom, setIsConnectingFrom] = useState<string | null>(null);
  const [connectingProtocol, setConnectingProtocol] = useState<ConnectionProtocol>('http');

  // Canvas Transform (Pan & Zoom)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [nodeDragOffset, setNodeDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Simulation Engine State
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [trafficLoad, setTrafficLoad] = useState<'low' | 'normal' | 'high' | 'spike'>('normal');
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [chaosMonkeyEnabled, setChaosMonkeyEnabled] = useState<boolean>(false);
  const [packets, setPackets] = useState<FlowPacket[]>([]);
  
  // Live Telemetry Telemetry
  const [telemetry, setTelemetry] = useState({
    totalRequests: 1420,
    currentRps: 45,
    avgLatencyMs: 24,
    p95LatencyMs: 62,
    p99LatencyMs: 148,
    errorCount: 3,
    errorRate: 0.2,
    activePackets: 0
  });

  // Export/Notification Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper map for component definitions
  const compDefMap = useMemo(() => {
    const map = new Map<string, ComponentDefinition>();
    COMPONENT_PALETTE.forEach(c => map.set(c.type, c));
    return map;
  }, []);

  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const selectedConnection = useMemo(() => {
    return connections.find(c => c.id === selectedConnectionId) || null;
  }, [connections, selectedConnectionId]);

  // Handle Load Template
  const handleLoadTemplate = (template: ArchitectureTemplate) => {
    setNodes(JSON.parse(JSON.stringify(template.nodes)));
    setConnections(JSON.parse(JSON.stringify(template.connections)));
    setPackets([]);
    setSelectedNodeId(null);
    setSelectedConnectionId(null);
    showToast(`Loaded "${template.name}" topology.`);
  };

  const handleClearCanvas = () => {
    setNodes([]);
    setConnections([]);
    setPackets([]);
    setSelectedNodeId(null);
    setSelectedConnectionId(null);
    showToast('Canvas cleared. Start dragging components!');
  };

  // Add component to canvas
  const handleAddComponent = (def: ComponentDefinition) => {
    // Generate clean unique ID
    const uniqueId = `node-${def.type.replace('_', '-')}-${Date.now().toString().slice(-4)}`;
    
    // Position near center with slight randomized offset
    const centerX = Math.round((-pan.x + 400 + Math.random() * 100) / zoom);
    const centerY = Math.round((-pan.y + 250 + Math.random() * 100) / zoom);

    const newNode: PlaygroundNode = {
      id: uniqueId,
      type: def.type,
      label: `${def.name}`,
      x: Math.max(20, centerX),
      y: Math.max(20, centerY),
      status: 'healthy',
      latencyMs: def.defaultLatency,
      maxRps: def.defaultMaxRps,
      currentRps: 0,
      queueDepth: 0,
      cacheHitRate: def.type.includes('cache') ? 85 : undefined,
      errorRatePercent: 0
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(uniqueId);
    showToast(`Added ${def.name} to canvas.`);
  };

  // Delete selected Node
  const handleDeleteSelectedNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId));
    setPackets(prev => prev.filter(p => p.fromNodeId !== nodeId && p.toNodeId !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    if (isConnectingFrom === nodeId) setIsConnectingFrom(null);
    showToast('Component removed.');
  };

  // Delete selected Connection
  const handleDeleteSelectedConnection = (connId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connId));
    setPackets(prev => prev.filter(p => p.connectionId !== connId));
    if (selectedConnectionId === connId) setSelectedConnectionId(null);
    showToast('Connection removed.');
  };

  // Start / Finish Connecting Nodes
  const handleStartConnect = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnectingFrom === null) {
      setIsConnectingFrom(nodeId);
      showToast('Click another component to wire connection.');
    } else if (isConnectingFrom === nodeId) {
      setIsConnectingFrom(null);
    } else {
      // Connect isConnectingFrom -> nodeId
      const exists = connections.some(
        c => (c.fromNodeId === isConnectingFrom && c.toNodeId === nodeId) ||
             (c.fromNodeId === nodeId && c.toNodeId === isConnectingFrom)
      );

      if (exists) {
        showToast('Connection already exists between these components.');
        setIsConnectingFrom(null);
        return;
      }

      const newConn: PlaygroundConnection = {
        id: `conn-${Date.now().toString().slice(-5)}`,
        fromNodeId: isConnectingFrom,
        toNodeId: nodeId,
        protocol: connectingProtocol,
        label: connectingProtocol.toUpperCase(),
        latencyOverheadMs: connectingProtocol === 'cache' ? 1 : connectingProtocol === 'grpc' ? 2 : 8
      };

      setConnections(prev => [...prev, newConn]);
      setIsConnectingFrom(null);
      showToast(`Connected ${connectingProtocol.toUpperCase()} channel!`);
    }
  };

  // Node Dragging on Canvas
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setSelectedConnectionId(null);

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setDraggingNodeId(nodeId);
    setNodeDragOffset({
      x: e.clientX / zoom - node.x,
      y: e.clientY / zoom - node.y
    });
  };

  // Canvas Pan & Mouse Move Handler
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedNodeId(null);
      setSelectedConnectionId(null);
      setIsConnectingFrom(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      const newX = Math.max(10, Math.round(e.clientX / zoom - nodeDragOffset.x));
      const newY = Math.max(10, Math.round(e.clientY / zoom - nodeDragOffset.y));
      setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n));
    } else if (isPanning) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  // Zoom handlers
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(2.0, Math.max(0.4, Number((prev + delta).toFixed(1)))));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 40, y: 30 });
  };

  // --- Real-time Traffic Simulation Loop ---
  useEffect(() => {
    if (!isRunning) return;

    // Traffic rate multiplier based on setting
    const rateFactor = trafficLoad === 'low' ? 0.3 : trafficLoad === 'normal' ? 0.8 : trafficLoad === 'high' ? 1.8 : 3.5;
    const packetSpawnInterval = Math.max(80, Math.round(300 / (rateFactor * simSpeed)));

    // Interval to spawn request packets from entry nodes (clients/ingress)
    const spawnTimer = setInterval(() => {
      if (connections.length === 0 || nodes.length === 0) return;

      // Find client or root nodes
      const clientNodes = nodes.filter(n => n.category === 'client' || n.type.includes('client') || n.type.includes('gateway') || n.type.includes('balancer'));
      const activeEntryNode = clientNodes.length > 0
        ? clientNodes[Math.floor(Math.random() * clientNodes.length)]
        : nodes[0];

      // Find outbound connections from this node
      const outboundConns = connections.filter(c => c.fromNodeId === activeEntryNode.id);
      if (outboundConns.length > 0) {
        const chosenConn = outboundConns[Math.floor(Math.random() * outboundConns.length)];
        const targetNode = nodes.find(n => n.id === chosenConn.toNodeId);

        // Determine if packet fails (based on target node status/errorRate)
        const isError = targetNode?.status === 'crashed' || (targetNode && Math.random() * 100 < targetNode.errorRatePercent);

        const newPacket: FlowPacket = {
          id: `pkt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          connectionId: chosenConn.id,
          progress: 0,
          status: isError ? 'error' : 'ok',
          speed: 0.02 * simSpeed,
          fromNodeId: chosenConn.fromNodeId,
          toNodeId: chosenConn.toNodeId,
          payload: chosenConn.protocol === 'sql' ? 'SELECT *' : chosenConn.protocol === 'event' ? 'Event:OrderCreated' : 'HTTP GET /api'
        };

        setPackets(prev => [...prev.slice(-35), newPacket]);
      }
    }, packetSpawnInterval);

    // Main animation & packet progress tick (60 FPS)
    const animTimer = setInterval(() => {
      setPackets(prev => {
        const nextPackets: FlowPacket[] = [];

        prev.forEach(p => {
          const nextProgress = p.progress + p.speed;

          if (nextProgress < 1) {
            nextPackets.push({ ...p, progress: nextProgress });
          } else {
            // Packet reached destination node!
            // Propagate downstream packet if target node has further outbound connections
            const targetNode = nodes.find(n => n.id === p.toNodeId);
            if (targetNode && targetNode.status !== 'crashed') {
              const downstreamConns = connections.filter(c => c.fromNodeId === targetNode.id);
              if (downstreamConns.length > 0 && Math.random() > 0.3) {
                const nextConn = downstreamConns[Math.floor(Math.random() * downstreamConns.length)];
                const isDownstreamError = Math.random() * 100 < targetNode.errorRatePercent;

                nextPackets.push({
                  id: `pkt-down-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  connectionId: nextConn.id,
                  progress: 0,
                  status: isDownstreamError ? 'error' : 'ok',
                  speed: 0.025 * simSpeed,
                  fromNodeId: nextConn.fromNodeId,
                  toNodeId: nextConn.toNodeId,
                  payload: nextConn.protocol === 'cache' ? 'CACHE_GET' : 'SUB_REQUEST'
                });
              }
            }
          }
        });

        return nextPackets;
      });

      // Update Live Telemetry
      setTelemetry(prev => {
        const rpsBase = trafficLoad === 'low' ? 18 : trafficLoad === 'normal' ? 65 : trafficLoad === 'high' ? 185 : 420;
        const jitter = Math.floor((Math.random() - 0.5) * 8);
        const liveRps = Math.max(5, Math.round(rpsBase * simSpeed + jitter));

        // Calculate theoretical system latency
        const activeNodes = nodes.filter(n => n.status !== 'crashed');
        const avgNodeLatency = activeNodes.length > 0
          ? activeNodes.reduce((acc, n) => acc + (n.status === 'degraded' ? n.latencyMs * 4 : n.latencyMs), 0) / activeNodes.length
          : 0;

        const totalErrors = nodes.filter(n => n.status === 'crashed').length * 25 + nodes.reduce((acc, n) => acc + n.errorRatePercent, 0);

        return {
          totalRequests: prev.totalRequests + Math.round(liveRps / 10),
          currentRps: liveRps,
          avgLatencyMs: Math.round(avgNodeLatency + 12),
          p95LatencyMs: Math.round(avgNodeLatency * 2.2 + 30),
          p99LatencyMs: Math.round(avgNodeLatency * 4.5 + 80),
          errorCount: prev.errorCount + (totalErrors > 0 ? 1 : 0),
          errorRate: Number(Math.min(100, (totalErrors / Math.max(1, activeNodes.length * 2))).toFixed(1)),
          activePackets: packets.length
        };
      });
    }, 32);

    return () => {
      clearInterval(spawnTimer);
      clearInterval(animTimer);
    };
  }, [isRunning, trafficLoad, simSpeed, connections, nodes, packets.length]);

  // Chaos Monkey: randomly degrade or recover nodes every 10 seconds
  useEffect(() => {
    if (!chaosMonkeyEnabled || !isRunning) return;

    const chaosInterval = setInterval(() => {
      if (nodes.length <= 1) return;

      const randomIdx = Math.floor(Math.random() * nodes.length);
      const targetNode = nodes[randomIdx];

      if (targetNode.status === 'healthy') {
        const nextStatus = Math.random() > 0.5 ? 'degraded' : 'crashed';
        setNodes(prev => prev.map((n, i) => i === randomIdx ? { ...n, status: nextStatus, errorRatePercent: nextStatus === 'crashed' ? 100 : 35 } : n));
        showToast(`🐒 Chaos Monkey injected: ${targetNode.label} is now ${nextStatus.toUpperCase()}!`);
      } else {
        // Self-heal
        setNodes(prev => prev.map((n, i) => i === randomIdx ? { ...n, status: 'healthy', errorRatePercent: 0 } : n));
        showToast(`💚 Self-Healing: ${targetNode.label} recovered to HEALTHY.`);
      }
    }, 7000);

    return () => clearInterval(chaosInterval);
  }, [chaosMonkeyEnabled, isRunning, nodes]);

  // Export Topology as JSON
  const handleExportTopology = () => {
    const topology = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      nodes,
      connections
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(topology, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `architecture-playground-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Architecture topology JSON downloaded!');
  };

  // Import Topology JSON
  const handleImportTopology = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.nodes && Array.isArray(parsed.nodes)) {
          setNodes(parsed.nodes);
          setConnections(parsed.connections || []);
          setPackets([]);
          showToast('Topology imported successfully!');
        } else {
          showToast('Invalid topology JSON format.');
        }
      } catch (err) {
        showToast('Failed to parse JSON topology file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Ask AI Architect to evaluate current playground canvas
  const handleAskAIEvaluation = () => {
    if (!onAskAI) return;

    const nodeSummary = nodes.map(n => `- ${n.label} (${n.type}, Latency: ${n.latencyMs}ms, Max RPS: ${n.maxRps}, Status: ${n.status})`).join('\n');
    const connSummary = connections.map(c => {
      const fromN = nodes.find(n => n.id === c.fromNodeId)?.label || c.fromNodeId;
      const toN = nodes.find(n => n.id === c.toNodeId)?.label || c.toNodeId;
      return `- ${fromN} ──[${c.protocol.toUpperCase()}]──> ${toN} (${c.label || ''})`;
    }).join('\n');

    const prompt = `Please perform a Senior Principal Architect review of my custom distributed system architecture topology designed in the Architecture Playground:

COMPONENTS (${nodes.length} nodes):
${nodeSummary || 'None'}

DATA FLOW CONNECTIONS (${connections.length} links):
${connSummary || 'None'}

CURRENT TELEMETRY METRICS:
- Live Traffic: ${telemetry.currentRps} RPS (Load Profile: ${trafficLoad.toUpperCase()})
- Avg Latency: ${telemetry.avgLatencyMs}ms (p99: ${telemetry.p99LatencyMs}ms)
- Error Rate: ${telemetry.errorRate}% (${telemetry.errorCount} failed requests)

Please analyze:
1. Architectural Bottlenecks & Single Points of Failure (SPOFs).
2. Resilience & Circuit Breaker / Retry recommendations.
3. Recommended Caching or Async Message Queue optimizations.
4. Scale rating from 1 to 10 for enterprise SaaS workloads.`;

    onAskAI(prompt);
  };

  // Protocol styling helper
  const getProtocolColor = (proto: ConnectionProtocol) => {
    switch (proto) {
      case 'http': return { stroke: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)', dash: '' };
      case 'grpc': return { stroke: '#c084fc', glow: 'rgba(192, 132, 252, 0.5)', dash: '' };
      case 'event': return { stroke: '#f97316', glow: 'rgba(249, 115, 22, 0.5)', dash: '6,4' };
      case 'sql': return { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', dash: '' };
      case 'cache': return { stroke: '#f43f5e', glow: 'rgba(244, 63, 94, 0.5)', dash: '3,3' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-[1700px] h-[94vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Interactive Architecture Playground
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-bold">
                  SIMULATION ENGINE v3.0
                </span>
                {chaosMonkeyEnabled && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" /> CHAOS MONKEY ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Drag components onto canvas, connect directed data channels, and observe real-time packet flow & latency metrics.
              </p>
            </div>
          </div>

          {/* Quick Prebuilt Templates Dropdown & Actions */}
          <div className="flex items-center gap-2">
            
            {/* Prebuilt Templates Selector */}
            <div className="hidden md:flex items-center gap-1.5 bg-zinc-950/90 border border-zinc-800 rounded-xl p-1">
              <span className="text-[11px] font-semibold text-zinc-400 pl-2 pr-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Archetypes:
              </span>
              {PREBUILT_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleLoadTemplate(t)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                  title={t.description}
                >
                  {t.name.split('+')[0].trim()}
                </button>
              ))}
              <button
                onClick={handleClearCanvas}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 transition-colors"
                title="Clear all components from canvas"
              >
                Clear
              </button>
            </div>

            {/* AI Review Button */}
            {onAskAI && (
              <button
                onClick={handleAskAIEvaluation}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-950/40 flex items-center gap-1.5 transition-all transform active:scale-95"
                title="Send active canvas architecture to Senior AI Architect for review"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                <span className="hidden lg:inline">Ask AI Architect</span>
              </button>
            )}

            {/* Export / Import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportTopology}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors"
              title="Import JSON Architecture Topology"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportTopology}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors"
              title="Export Topology as JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-rose-900/80 text-zinc-400 hover:text-white border border-zinc-700 hover:border-rose-700 transition-colors ml-1"
              title="Close Architecture Playground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Work Area: 3-Column Split (Left Palette, Center Canvas, Right Inspector & Telemetry) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* LEFT COLUMN: Component Palette & Tooling */}
          <div className="w-full lg:w-72 bg-zinc-900/95 border-r border-zinc-800 flex flex-col shrink-0 h-48 lg:h-auto overflow-hidden">
            
            {/* Palette Header */}
            <div className="p-3 border-b border-zinc-800 bg-zinc-950/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Component Library
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {COMPONENT_PALETTE.length} components
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1">
                {(['all', 'client', 'compute', 'queue', 'database', 'infra'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActivePaletteCategory(cat)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase transition-colors ${
                      activePaletteCategory === cat
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Component List */}
            <div className="flex-1 p-2.5 overflow-y-auto space-y-1.5 custom-scrollbar">
              {COMPONENT_PALETTE
                .filter(c => activePaletteCategory === 'all' || c.category === activePaletteCategory)
                .map(comp => (
                  <div
                    key={comp.type}
                    onClick={() => handleAddComponent(comp)}
                    className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/90 hover:border-blue-500/70 hover:bg-zinc-800/80 cursor-pointer transition-all group flex items-center justify-between gap-2 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg ${comp.badgeColor} border flex items-center justify-center text-sm shrink-0 group-hover:scale-110 transition-transform shadow`}>
                        {comp.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-200 truncate group-hover:text-blue-300 transition-colors">
                          {comp.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                          {comp.description}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      className="w-6 h-6 rounded-lg bg-zinc-800 group-hover:bg-blue-600 text-zinc-400 group-hover:text-white flex items-center justify-center shrink-0 transition-colors"
                      title="Add to canvas"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
            </div>

            {/* Wiring Tool Selection */}
            <div className="p-3 bg-zinc-950/90 border-t border-zinc-800">
              <div className="text-[11px] font-bold text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>Wiring Protocol Mode:</span>
                <span className="text-[10px] font-mono text-cyan-400 uppercase">{connectingProtocol}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {(['http', 'grpc', 'event', 'sql', 'cache'] as ConnectionProtocol[]).map(proto => (
                  <button
                    key={proto}
                    onClick={() => setConnectingProtocol(proto)}
                    className={`py-1 px-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 border ${
                      connectingProtocol === proto
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getProtocolColor(proto).stroke }} />
                    {proto}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: 2D Interactive Canvas */}
          <div className="flex-1 flex flex-col bg-zinc-950 relative overflow-hidden">
            
            {/* Canvas Simulation Floating Controls Bar */}
            <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
              
              {/* Left Controls: Simulation Engine (Play/Pause, Traffic Sliders, Speed) */}
              <div className="flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl p-1.5 shadow-xl pointer-events-auto">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow ${
                    isRunning
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                  title={isRunning ? "Pause Traffic Simulation" : "Start Traffic Simulation"}
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-zinc-300" />}
                  <span>{isRunning ? "Simulating" : "Paused"}</span>
                </button>

                {/* Traffic Load Selector */}
                <div className="flex items-center bg-zinc-950 rounded-xl p-0.5 border border-zinc-800">
                  {(['low', 'normal', 'high', 'spike'] as const).map(load => (
                    <button
                      key={load}
                      onClick={() => setTrafficLoad(load)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                        trafficLoad === load
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                      title={`${load.toUpperCase()} traffic volume`}
                    >
                      {load}
                    </button>
                  ))}
                </div>

                {/* Speed Multiplier */}
                <div className="flex items-center bg-zinc-950 rounded-xl p-0.5 border border-zinc-800">
                  {[0.5, 1, 2, 4].map(s => (
                    <button
                      key={s}
                      onClick={() => setSimSpeed(s)}
                      className={`px-1.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors ${
                        simSpeed === s ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                {/* Chaos Monkey Toggle */}
                <button
                  onClick={() => setChaosMonkeyEnabled(!chaosMonkeyEnabled)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                    chaosMonkeyEnabled
                      ? 'bg-amber-950 border-amber-600 text-amber-300 shadow-md shadow-amber-950/50'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                  }`}
                  title="Randomly inject node failures and latency spikes"
                >
                  <Flame className={`w-3.5 h-3.5 ${chaosMonkeyEnabled ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'}`} />
                  <span className="hidden sm:inline">Chaos</span>
                </button>
              </div>

              {/* Right Canvas Controls: Zoom, Pan Reset, Clear */}
              <div className="flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl p-1.5 shadow-xl pointer-events-auto">
                <button
                  onClick={() => handleZoom(0.15)}
                  className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-zinc-400 px-1">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => handleZoom(-0.15)}
                  className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetView}
                  className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                  title="Reset View to 100%"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Connecting Active Banner */}
            {isConnectingFrom && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-cyan-950/95 border border-cyan-500 text-cyan-200 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-pulse">
                <span>Wiring from <strong>{nodes.find(n => n.id === isConnectingFrom)?.label}</strong>. Click another component to connect!</span>
                <button
                  onClick={() => setIsConnectingFrom(null)}
                  className="p-0.5 rounded hover:bg-cyan-900 text-cyan-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Toast Notification */}
            {toastMessage && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                {toastMessage}
              </div>
            )}

            {/* Main Interactive SVG & HTML Canvas Area */}
            <div
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className={`flex-1 w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden ${
                isPanning ? 'cursor-grabbing' : ''
              }`}
              style={{
                backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
                backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
                backgroundPosition: `${pan.x}px ${pan.y}px`
              }}
            >
              {/* Transform Container */}
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: '0 0',
                  position: 'absolute',
                  width: '3000px',
                  height: '3000px'
                }}
              >
                {/* SVG Layer for Rendered Connections & Data Packets */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                  <defs>
                    <marker id="arrow-http" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <polygon points="0 1, 7 4, 0 7" fill="#38bdf8" />
                    </marker>
                    <marker id="arrow-grpc" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <polygon points="0 1, 7 4, 0 7" fill="#c084fc" />
                    </marker>
                    <marker id="arrow-event" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <polygon points="0 1, 7 4, 0 7" fill="#f97316" />
                    </marker>
                    <marker id="arrow-sql" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <polygon points="0 1, 7 4, 0 7" fill="#10b981" />
                    </marker>
                    <marker id="arrow-cache" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <polygon points="0 1, 7 4, 0 7" fill="#f43f5e" />
                    </marker>
                  </defs>

                  {/* Render Connections */}
                  {connections.map(conn => {
                    const fromNode = nodes.find(n => n.id === conn.fromNodeId);
                    const toNode = nodes.find(n => n.id === conn.toNodeId);
                    if (!fromNode || !toNode) return null;

                    // Compute node center anchors (Node card width: ~180px, height: ~80px)
                    const x1 = fromNode.x + 90;
                    const y1 = fromNode.y + 40;
                    const x2 = toNode.x + 90;
                    const y2 = toNode.y + 40;

                    // Smooth Bezier Curve
                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const cx1 = x1 + dx * 0.5;
                    const cy1 = y1;
                    const cx2 = x1 + dx * 0.5;
                    const cy2 = y2;
                    const pathData = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

                    const isSelected = selectedConnectionId === conn.id;
                    const protoStyle = getProtocolColor(conn.protocol);

                    return (
                      <g key={conn.id} className="pointer-events-auto cursor-pointer" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedConnectionId(conn.id);
                        setSelectedNodeId(null);
                      }}>
                        {/* Glow Background Path */}
                        <path
                          d={pathData}
                          fill="none"
                          stroke={protoStyle.glow}
                          strokeWidth={isSelected ? "8" : "4"}
                          className="transition-all"
                        />
                        {/* Main Wire Path */}
                        <path
                          d={pathData}
                          fill="none"
                          stroke={protoStyle.stroke}
                          strokeWidth={isSelected ? "3" : "2"}
                          strokeDasharray={protoStyle.dash}
                          markerEnd={`url(#arrow-${conn.protocol})`}
                          className="transition-all"
                        />
                        {/* Protocol Label Pill */}
                        <g transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2 - 10})`}>
                          <rect
                            x="-32"
                            y="-10"
                            width="64"
                            height="20"
                            rx="10"
                            fill="#18181b"
                            stroke={isSelected ? '#38bdf8' : '#27272a'}
                            strokeWidth="1"
                          />
                          <text
                            x="0"
                            y="4"
                            textAnchor="middle"
                            fill={protoStyle.stroke}
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {conn.protocol.toUpperCase()}
                          </text>
                        </g>
                      </g>
                    );
                  })}

                  {/* Render Live Flow Packets */}
                  {packets.map(packet => {
                    const fromNode = nodes.find(n => n.id === packet.fromNodeId);
                    const toNode = nodes.find(n => n.id === packet.toNodeId);
                    if (!fromNode || !toNode) return null;

                    const x1 = fromNode.x + 90;
                    const y1 = fromNode.y + 40;
                    const x2 = toNode.x + 90;
                    const y2 = toNode.y + 40;

                    // Interpolate bezier position
                    const t = packet.progress;
                    const dx = x2 - x1;
                    const cx1 = x1 + dx * 0.5;
                    const cy1 = y1;
                    const cx2 = x1 + dx * 0.5;
                    const cy2 = y2;

                    // Cubic Bezier interpolation formula
                    const px = Math.pow(1 - t, 3) * x1 + 3 * Math.pow(1 - t, 2) * t * cx1 + 3 * (1 - t) * Math.pow(t, 2) * cx2 + Math.pow(t, 3) * x2;
                    const py = Math.pow(1 - t, 3) * y1 + 3 * Math.pow(1 - t, 2) * t * cy1 + 3 * (1 - t) * Math.pow(t, 2) * cy2 + Math.pow(t, 3) * y2;

                    const isError = packet.status === 'error';
                    const fillColor = isError ? '#ef4444' : '#38bdf8';

                    return (
                      <g key={packet.id} transform={`translate(${px}, ${py})`}>
                        <circle r="7" fill={fillColor} opacity="0.3" className="animate-ping" />
                        <circle r="4.5" fill={fillColor} stroke="#ffffff" strokeWidth="1.5" shadow="0 0 8px currentColor" />
                      </g>
                    );
                  })}
                </svg>

                {/* HTML DOM Layer for Placed Architecture Nodes */}
                {nodes.map(node => {
                  const def = compDefMap.get(node.type) || COMPONENT_PALETTE[0];
                  const isSelected = selectedNodeId === node.id;
                  const isConnecting = isConnectingFrom === node.id;

                  // Status styling
                  const statusBorder = node.status === 'crashed'
                    ? 'border-rose-500 ring-2 ring-rose-500/50 bg-rose-950/40'
                    : node.status === 'degraded'
                    ? 'border-amber-500 ring-2 ring-amber-500/50 bg-amber-950/40'
                    : isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/50 bg-zinc-900'
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/90';

                  return (
                    <div
                      key={node.id}
                      onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                      style={{
                        position: 'absolute',
                        left: `${node.x}px`,
                        top: `${node.y}px`,
                        width: '180px'
                      }}
                      className={`rounded-2xl border p-3 shadow-xl backdrop-blur-md transition-all cursor-move select-none ${statusBorder}`}
                    >
                      {/* Node Header */}
                      <div className="flex items-center justify-between gap-1.5 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-7 h-7 rounded-lg ${def.badgeColor} border flex items-center justify-center text-xs shrink-0`}>
                            {def.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">
                              {node.label}
                            </div>
                            <div className="text-[9px] font-mono text-zinc-400 uppercase">
                              {def.category}
                            </div>
                          </div>
                        </div>

                        {/* Node Status Badge */}
                        <div
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            node.status === 'crashed'
                              ? 'bg-rose-500 animate-pulse'
                              : node.status === 'degraded'
                              ? 'bg-amber-400 animate-pulse'
                              : 'bg-emerald-400'
                          }`}
                          title={`Status: ${node.status.toUpperCase()}`}
                        />
                      </div>

                      {/* Node Mini Metrics Bar */}
                      <div className="grid grid-cols-2 gap-1 py-1 px-1.5 bg-zinc-950/80 rounded-lg border border-zinc-800 text-[10px] font-mono text-zinc-400 mb-2">
                        <div>
                          <span className="text-zinc-500">LAT:</span>{' '}
                          <span className={node.status === 'degraded' ? 'text-amber-400 font-bold' : 'text-zinc-300'}>
                            {node.status === 'degraded' ? `${node.latencyMs * 4}ms` : `${node.latencyMs}ms`}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500">CAP:</span>{' '}
                          <span className="text-zinc-300">{node.maxRps}</span>
                        </div>
                      </div>

                      {/* Node Connector Port Button */}
                      <button
                        onClick={(e) => handleStartConnect(node.id, e)}
                        className={`w-full py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 border transition-all ${
                          isConnecting
                            ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-900/50'
                            : 'bg-zinc-800 hover:bg-cyan-950 hover:border-cyan-700 text-zinc-300 hover:text-cyan-200 border-zinc-700'
                        }`}
                        title="Click to wire connection from this component"
                      >
                        <Zap className="w-3 h-3 text-cyan-400" />
                        <span>{isConnecting ? "Wiring..." : "Connect Out"}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Floating Telemetry Strip */}
            <div className="p-3 bg-zinc-900/90 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4 shrink-0 text-xs">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-mono">Live Ingress</div>
                    <div className="text-sm font-black text-white font-mono">{telemetry.currentRps} <span className="text-[10px] font-normal text-zinc-400">RPS</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-mono">System Latency (p50 / p99)</div>
                    <div className="text-sm font-black text-white font-mono">
                      {telemetry.avgLatencyMs}ms <span className="text-xs text-zinc-500 font-normal">/ {telemetry.p99LatencyMs}ms</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ShieldAlert className={`w-4 h-4 ${telemetry.errorRate > 5 ? 'text-rose-400' : 'text-zinc-500'}`} />
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-mono">Error Rate</div>
                    <div className={`text-sm font-black font-mono ${telemetry.errorRate > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {telemetry.errorRate}% <span className="text-xs text-zinc-500 font-normal">({telemetry.errorCount} fails)</span>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-mono">Topology Footprint</div>
                    <div className="text-xs font-bold text-zinc-200 font-mono">
                      {nodes.length} Nodes • {connections.length} Channels
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-zinc-500 font-medium hidden xl:block">
                Tip: Drag nodes to rearrange • Click "Connect Out" on a node to wire directed channels.
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Inspector & Node Configuration */}
          <div className="w-full lg:w-80 bg-zinc-900/95 border-l border-zinc-800 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
            
            {selectedNode ? (
              /* Selected Node Inspector */
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Node Inspector
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteSelectedNode(selectedNode.id)}
                    className="px-2 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>

                {/* Node Label / Name Input */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Component Display Name:
                  </label>
                  <input
                    type="text"
                    value={selectedNode.label}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, label: val } : n));
                    }}
                    className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Node Health / Status Injection */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Simulation Health Status:
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['healthy', 'degraded', 'crashed'] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => {
                          setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, status: st, errorRatePercent: st === 'crashed' ? 100 : st === 'degraded' ? 30 : 0 } : n));
                        }}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                          selectedNode.status === st
                            ? st === 'crashed'
                              ? 'bg-rose-950 border-rose-600 text-rose-300'
                              : st === 'degraded'
                              ? 'bg-amber-950 border-amber-600 text-amber-300'
                              : 'bg-emerald-950 border-emerald-600 text-emerald-300'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Processing Latency Slider */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                    <span className="text-zinc-400">Processing Latency:</span>
                    <span className="font-mono text-cyan-400">{selectedNode.latencyMs} ms</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="500"
                    step="5"
                    value={selectedNode.latencyMs}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, latencyMs: val } : n));
                    }}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                    <span>1ms (Sub-RAM)</span>
                    <span>500ms (Heavy compute)</span>
                  </div>
                </div>

                {/* Max Throughput / RPS Capacity */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                    <span className="text-zinc-400">Max Capacity:</span>
                    <span className="font-mono text-indigo-400">{selectedNode.maxRps} RPS</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={selectedNode.maxRps}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, maxRps: val } : n));
                    }}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Inbound / Outbound Channels list for this node */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Connected Channels:
                  </label>
                  <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                    {connections
                      .filter(c => c.fromNodeId === selectedNode.id || c.toNodeId === selectedNode.id)
                      .map(c => {
                        const isOutbound = c.fromNodeId === selectedNode.id;
                        const otherNode = nodes.find(n => n.id === (isOutbound ? c.toNodeId : c.fromNodeId));

                        return (
                          <div
                            key={c.id}
                            className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className={`px-1 rounded text-[9px] font-mono font-bold ${isOutbound ? 'bg-cyan-950 text-cyan-300' : 'bg-purple-950 text-purple-300'}`}>
                                {isOutbound ? 'OUT' : 'IN'}
                              </span>
                              <span className="text-zinc-300 truncate">{otherNode?.label || 'Target'}</span>
                            </div>
                            <span className="font-mono text-[10px] text-zinc-500 uppercase">{c.protocol}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            ) : selectedConnection ? (
              /* Selected Connection Inspector */
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Channel Wire Inspector
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteSelectedConnection(selectedConnection.id)}
                    className="px-2 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Wire Protocol:
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {(['http', 'grpc', 'event', 'sql', 'cache'] as ConnectionProtocol[]).map(proto => (
                      <button
                        key={proto}
                        onClick={() => {
                          setConnections(prev => prev.map(c => c.id === selectedConnection.id ? { ...c, protocol: proto, label: proto.toUpperCase() } : c));
                        }}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold uppercase transition-all border ${
                          selectedConnection.protocol === proto
                            ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        {proto}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Channel Label / Payload Description:
                  </label>
                  <input
                    type="text"
                    value={selectedConnection.label || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConnections(prev => prev.map(c => c.id === selectedConnection.id ? { ...c, label: val } : c));
                    }}
                    placeholder="e.g. gRPC OrderPlaced"
                    className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>
            ) : (
              /* Default Empty Selection Guide */
              <div className="p-5 flex flex-col items-center justify-center text-center h-full text-zinc-500 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400">
                  <Sliders className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-300">Nothing Selected</div>
                  <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
                    Click any node or connection line on the canvas to inspect throughput, inject faults, or alter latency.
                  </p>
                </div>

                <div className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 text-left space-y-2 mt-4 text-[11px]">
                  <div className="font-bold text-zinc-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-400" /> Quick Cheatsheet:
                  </div>
                  <div className="space-y-1 text-zinc-400 text-[10px]">
                    <div>• <strong>Add Component:</strong> Click items in left library.</div>
                    <div>• <strong>Connect:</strong> Click "Connect Out" on source node.</div>
                    <div>• <strong>Chaos Test:</strong> Enable "Chaos" in top toolbar.</div>
                    <div>• <strong>AI Review:</strong> Click "Ask AI Architect" above.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
