
import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  FileImage,
  FileCode,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Code,
  Sparkles,
  Layers,
  Settings2,
  Maximize2,
  ChevronDown,
  Sliders,
  Eye,
  CheckCircle,
  FileText
} from 'lucide-react';
import { ArchType } from '../types';
import { ARCHITECTURE_DETAILS } from '../constants';
import { DiagramExportModal } from './DiagramExportModal';
import {
  downloadSvgDiagram,
  downloadRasterDiagram,
  copyDiagramImageToClipboard,
  getCleanSvgString,
} from '../src/utils/diagramExport';

interface DiagramProps {
  type: ArchType;
  onOpenExport?: () => void;
}

interface NodeData {
  title: string;
  sub?: string;
  description: string;
  type?: 'db' | 'actor' | 'cloud' | 'component';
  flows?: string[];
}

export const DiagramRenderer: React.FC<DiagramProps> = ({ type }) => {
  const [activeNode, setActiveNode] = useState<NodeData | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Diagram Copied!');
  
  // Export Studio Modal State
  const [showExportModal, setShowExportModal] = useState(false);

  // Code Viewer State
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [svgCode, setSvgCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  
  // Download State
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  
  // Hover & Selection state
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Zoom & Pan State
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastTransform = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const currentArch = ARCHITECTURE_DETAILS[type];

  // Reset state when type changes
  useEffect(() => {
    setTransform({ x: 0, y: 0, k: 1 });
    setActiveNode(null);
    setHighlightedIds([]);
    setSelectedIds([]);
    setShowCodeModal(false);
    setShowDownloadMenu(false);
  }, [type]);

  const handleWheel = (e: React.WheelEvent) => {
    const zoomIntensity = 0.001;
    const delta = -e.deltaY * zoomIntensity;
    const newScale = Math.min(Math.max(0.5, transform.k + delta), 4);
    
    setTransform(prev => ({
      ...prev,
      k: newScale
    }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    hasMoved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    lastTransform.current = { x: transform.x, y: transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMoved.current = true;
    }

    setTransform(prev => ({
      ...prev,
      x: lastTransform.current.x + dx,
      y: lastTransform.current.y + dy
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTransform(prev => ({ ...prev, k: Math.min(prev.k * 1.2, 4) }));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTransform(prev => ({ ...prev, k: Math.max(prev.k / 1.2, 0.5) }));
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTransform({ x: 0, y: 0, k: 1 });
  };

  // Serialize SVG to string for Code View
  const handleShowCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    const svgElement = containerRef.current?.querySelector('svg');
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);

    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const cleanSource = source.replace(
      /transform="translate\([^)]+\)\s*scale\([^)]+\)"/, 
      'transform="translate(0, 0) scale(1)"'
    );

    setSvgCode(cleanSource);
    setShowCodeModal(true);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(svgCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };
  
  const handleCopyDiagram = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const svgElement = containerRef.current?.querySelector('svg');
    if (!svgElement) return;

    try {
      const success = await copyDiagramImageToClipboard(svgElement, {
        archType: type,
        archTitle: currentArch?.title,
        category: currentArch?.category,
        scale: 2,
        theme: 'obsidian',
        includeBanner: true,
        includeWatermark: true,
      });

      if (success) {
        setToastMessage('High-Res PNG Copied to Clipboard!');
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 2500);
      }
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleDownload = async (format: 'png' | 'svg' | 'jpeg') => {
    const svgElement = containerRef.current?.querySelector('svg');
    if (!svgElement) return;

    try {
      if (format === 'svg') {
        downloadSvgDiagram(svgElement, {
          archType: type,
          archTitle: currentArch?.title,
          category: currentArch?.category,
          theme: 'obsidian',
          includeBanner: true,
          includeWatermark: true,
        });
        setToastMessage('SVG Vector File Downloaded!');
      } else {
        await downloadRasterDiagram(svgElement, {
          archType: type,
          archTitle: currentArch?.title,
          category: currentArch?.category,
          format: format as any,
          scale: 2,
          theme: 'obsidian',
          includeBanner: true,
          includeWatermark: true,
        });
        setToastMessage(`High-Res ${format.toUpperCase()} Downloaded!`);
      }
      
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2500);
      setShowDownloadMenu(false);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const handleBackgroundClick = () => {
    if (!hasMoved.current) {
      setActiveNode(null);
      setSelectedIds([]); // Clear selection
      setShowDownloadMenu(false);
    }
  };
  
  const colorStroke = "#60a5fa"; // blue-400
  const colorText = "#e2e8f0"; // slate-200
  const colorSelected = "#facc15"; // yellow-400
  
  // Helper: Determine opacity based on selection and hover state
  const getOpacity = (id: string) => {
    // Prioritize hover state for exploration
    if (highlightedIds.length > 0) {
       return highlightedIds.includes(id) ? 1 : 0.2;
    }
    // Fallback to selection state
    if (selectedIds.length > 0) {
       return selectedIds.includes(id) ? 1 : 0.2;
    }
    return 1;
  };

  // Helper: Determine glow filter
  const getFilter = (id: string) => {
    if (selectedIds.includes(id)) {
      // Strong Golden Glow for selection
      return 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.5)) drop-shadow(0 0 2px rgba(250, 204, 21, 0.3))';
    }
    if (highlightedIds.includes(id)) {
      // Blue Glow for hover
       return 'drop-shadow(0 0 6px rgba(96, 165, 250, 0.6))';
    }
    return 'none';
  };
  
  // SVG Helper Components
  const Box = ({ id, x, y, w, h, label, sub, details, type, dashed, flows, deps = [] }: any) => {
    const nx = Number(x);
    const ny = Number(y);
    const nw = Number(w);
    const nh = Number(h);
    
    const cx = nx + nw / 2;
    const cy = ny + nh / 2;
    
    const getTypeStyles = (t?: string) => {
      switch (t) {
        case 'db': return { stroke: '#fbbf24', fill: '#451a03' }; 
        case 'actor': return { stroke: '#a3e635', fill: '#1a2e05' }; 
        case 'cloud': return { stroke: '#c084fc', fill: '#3b0764' }; 
        case 'component':
        default: return { stroke: '#60a5fa', fill: '#1e293b' }; 
      }
    };

    const style = getTypeStyles(type);

    const isSelected = selectedIds.includes(id);
    const isHovered = highlightedIds.includes(id);

    // Visual Priority: Selected > Hovered > Default
    const currentStroke = isSelected ? colorSelected : (isHovered ? '#ffffff' : style.stroke);
    const currentFill = (isSelected || isHovered) ? '#334155' : style.fill; 
    
    // Distinct thick border for selection
    const currentStrokeWidth = isSelected ? "4" : (isHovered ? "3" : "2");
    
    const textFill = (isSelected || isHovered) ? "#ffffff" : colorText;
    const fontWeight = (isSelected || isHovered) ? "900" : "bold";

    const handleSelect = (e?: React.MouseEvent | React.KeyboardEvent) => {
      if (e) e.stopPropagation();
      if (hasMoved.current) return;

      setActiveNode({
        title: label,
        sub,
        description: details || "No additional details available.",
        type: type,
        flows: flows || []
      });
      // Persist selection
      setSelectedIds([id, ...deps]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect(e);
        }
    };

    const handleMouseEnter = () => {
       if (id) {
         setHighlightedIds([id, ...deps]);
       }
    };

    const handleMouseLeave = () => {
       setHighlightedIds([]);
    };
    
    const isDatabase = type === 'db';
    const isCloud = type === 'cloud';
    const isActor = type === 'actor';

    // Semantic description for ARIA
    const typeDescription = type ? `${type.charAt(0).toUpperCase() + type.slice(1)}` : 'Component';
    const ariaLabel = `${typeDescription}: ${label}${sub ? `, ${sub}` : ''}`;

    return (
      <g
        role="button"
        aria-label={ariaLabel}
        aria-expanded={isSelected}
        tabIndex={0}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer group hover:scale-[1.05] focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-sm"
        style={{ 
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, filter 0.3s ease-in-out',
            transformOrigin: `${cx}px ${cy}px`, 
            opacity: getOpacity(id),
            filter: getFilter(id)
        }}
      >
        {isDatabase ? (
          <path 
            d={`M${nx},${ny+10} v${nh-20} q0,10 ${nw},10 v-${nh-20} q0,-10 -${nw},-10 z M${nx},${ny+10} q0,-10 ${nw},-10 q-${nw},10 -${nw},10`}
            fill={currentFill}
            stroke={currentStroke}
            strokeWidth={currentStrokeWidth}
            className="transition-colors duration-300"
          />
        ) : isCloud ? (
           <path
            d={`M${nx},${ny+nh/2} Q${nx},${ny} ${nx+nw/3},${ny} Q${nx+nw/2},${ny-nh/2} ${nx+2*nw/3},${ny} Q${nx+nw},${ny} ${nx+nw},${ny+nh/2} Q${nx+nw},${ny+nh} ${nx+2*nw/3},${ny+nh} Q${nx+nw/2},${ny+nh*1.5} ${nx+nw/3},${ny+nh} Q${nx},${ny+nh} ${nx},${ny+nh/2}`}
            fill={currentFill}
            stroke={currentStroke}
            strokeWidth={currentStrokeWidth}
            strokeDasharray={dashed ? "4,4" : ""}
            className="transition-colors duration-300"
          />
        ) : (
          <rect 
            x={nx} y={ny} width={nw} height={nh} rx={isActor ? nh/2 : "4"} 
            fill={currentFill} 
            stroke={currentStroke} 
            strokeWidth={currentStrokeWidth}
            strokeDasharray={dashed ? "4,4" : ""}
            className="transition-colors duration-300"
          />
        )}
        
        <text 
          x={nx + nw / 2} y={ny + nh / 2 - (sub ? 6 : 0)} 
          textAnchor="middle" 
          fill={textFill} 
          fontSize="11" 
          fontWeight={fontWeight}
          dominantBaseline="middle" 
          className="pointer-events-none select-none"
        >
          {label}
        </text>
        {sub && (
          <text 
            x={nx + nw / 2} y={ny + nh / 2 + 8} 
            textAnchor="middle" 
            fill={(isSelected || isHovered) ? "#e2e8f0" : "#94a3b8"} 
            fontSize="9" 
            dominantBaseline="middle" 
            className="pointer-events-none select-none"
          >
            {sub}
          </text>
        )}
      </g>
    );
  };

  const Arrow = ({ id, x1, y1, x2, y2, label, dashed, color, deps = [] }: any) => {
    const stroke = color || colorStroke;
    const isHovered = highlightedIds.includes(id);
    const isSelected = selectedIds.includes(id);
    
    const mx = (Number(x1) + Number(x2)) / 2;
    const my = (Number(y1) + Number(y2)) / 2;

    // Visual styling priority
    const currentStroke = isSelected ? colorSelected : (isHovered ? '#ffffff' : stroke);
    
    // Distinct thick border for selection
    const currentStrokeWidth = isSelected ? "4" : (isHovered ? "3" : "2");
    
    const handleSelect = (e?: React.MouseEvent | React.KeyboardEvent) => {
       if (e) e.stopPropagation();
       if (hasMoved.current) return;
       // If arrow has deps or is clickable, highlight it
       setSelectedIds([id, ...deps]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect(e);
        }
    };
    
    return (
      <g 
        role="button"
        aria-label={`Data flow: ${label || 'Connection'}`}
        aria-expanded={isSelected}
        tabIndex={0}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        className="cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-sm" 
        style={{ 
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, filter 0.3s ease-in-out',
            transformOrigin: `${mx}px ${my}px`,
            opacity: id ? getOpacity(id) : 1,
            filter: id ? getFilter(id) : 'none'
        }}
      >
        {/* Invisible thick line for easier hovering/clicking */}
        <line 
          x1={x1} y1={y1} x2={x2} y2={y2} 
          stroke="transparent" 
          strokeWidth="15" 
        />
        
        <defs>
          <marker id={`arrowhead-${id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={currentStroke} />
          </marker>
        </defs>
        <line 
          x1={x1} y1={y1} x2={x2} y2={y2} 
          stroke={currentStroke} 
          strokeWidth={currentStrokeWidth} 
          markerEnd={`url(#arrowhead-${id})`}
          strokeDasharray={dashed ? "5,5" : ""}
        />
        {label && (
          <text x={(Number(x1)+Number(x2))/2} y={(Number(y1)+Number(y2))/2 - 5} textAnchor="middle" fill={isSelected || isHovered ? '#ffffff' : colorText} fontSize="9" className="bg-zinc-900/80 px-1">
            {label}
          </text>
        )}
      </g>
    );
  };

  const renderContent = () => {
    switch (type) {
      case ArchType.Monolithic:
        return (
          <g>
            <Box 
              id="mono-app"
              deps={['mono-arr', 'mono-db']}
              x="100" y="50" w="200" h="150" 
              label="Monolith App" 
              sub="UI + Logic + Data" 
              details="A single executable containing all modules (User, Payment, Inventory). Simple to deploy but hard to scale individual components."
              flows={[
                  "Receives all HTTP requests",
                  "Executes business logic in shared memory",
                  "Reads/Writes to Shared DB",
                  "Returns HTML or JSON response"
              ]}
            />
            <Arrow id="mono-arr" x1="200" y1="200" x2="200" y2="250" />
            <Box 
              id="mono-db"
              deps={['mono-arr', 'mono-app']}
              x="150" y="250" w="100" h="40" 
              type="db"
              label="Shared DB" 
              details="Single centralized relational database (e.g., MySQL/PostgreSQL) shared by the entire monolithic application."
              flows={[
                  "Handles ACID transactions",
                  "Stores data for all modules",
                  "Potential bottleneck under load"
              ]}
            />
            <text x="200" y="30" textAnchor="middle" fill={colorText} fontSize="12" fontWeight="bold" opacity="0.5" className="select-none">Single Deployment Unit</text>
          </g>
        );
      case ArchType.Layered:
        return (
          <g>
            <Box 
              id="layer-pres"
              deps={['layer-a1', 'layer-biz']}
              x="100" y="20" w="200" h="40" 
              label="Presentation Layer" 
              details="Handles HTTP requests, UI rendering, and API endpoints. No business logic here."
              flows={["Receives user input", "Validates request format", "Calls Business Layer"]}
            />
            <Arrow id="layer-a1" x1="200" y1="60" x2="200" y2="90" />
            <Box 
              id="layer-biz"
              deps={['layer-a1', 'layer-pres', 'layer-a2', 'layer-persist']}
              x="100" y="90" w="200" h="40" 
              label="Business Layer" 
              details="Contains the core domain logic, rules, and calculations. Agnostic of UI and Database."
              flows={["Executes domain rules", "Performs calculations", "Calls Persistence Layer"]}
            />
            <Arrow id="layer-a2" x1="200" y1="130" x2="200" y2="160" />
            <Box 
              id="layer-persist"
              deps={['layer-a2', 'layer-biz', 'layer-a3', 'layer-db']}
              x="100" y="160" w="200" h="40" 
              label="Persistence Layer" 
              details="Abstracts data access (DAOs, Repositories). Converts objects to SQL."
              flows={["Constructs SQL queries", "Maps DB rows to Objects", "Executes DB transactions"]}
            />
            <Arrow id="layer-a3" x1="200" y1="200" x2="200" y2="230" />
            <Box 
              id="layer-db"
              deps={['layer-a3', 'layer-persist']}
              x="130" y="230" w="140" h="40" 
              type="db"
              label="Database" 
              details="Centralized data store. Strict separation ensures layers only talk to the layer directly below."
              flows={["Stores application state", "Enforces referential integrity"]}
            />
          </g>
        );
      case ArchType.SOA:
        return (
          <g>
            <Box id="soa-s1" deps={['soa-a1', 'soa-esb']} x="20" y="40" w="90" h="40" label="Service A" sub="Billing" 
                 details="Independent billing service exposing a contract (WSDL)."
                 flows={["Publishes service contract", "Sends SOAP messages to ESB"]} />
            <Box id="soa-s2" deps={['soa-a2', 'soa-esb']} x="20" y="100" w="90" h="40" label="Service B" sub="Sales" 
                 details="Independent sales service."
                 flows={["Consumes Billing Service via ESB", "Updates Sales Records"]} />
            <Box id="soa-legacy" deps={['soa-a3', 'soa-esb']} x="20" y="160" w="90" h="40" label="Legacy App" sub="Mainframe" 
                 details="Existing legacy system wrapped as a service."
                 flows={["Exposes mainframe logic as Web Service", "Integration point for modern apps"]} />
            
            <Arrow id="soa-a1" x1="110" y1="60" x2="160" y2="120" />
            <Arrow id="soa-a2" x1="110" y1="120" x2="160" y2="120" />
            <Arrow id="soa-a3" x1="110" y1="180" x2="160" y2="120" />

            <Box 
              id="soa-esb"
              deps={['soa-s1', 'soa-a1', 'soa-s2', 'soa-a2', 'soa-legacy', 'soa-a3', 'soa-a4', 'soa-db', 'soa-a5', 'soa-ext']}
              x="160" y="40" w="80" h="160" 
              type="cloud"
              label="ESB" 
              sub="Enterprise Service Bus" 
              details="Middleware that orchestrates communication, transforms messages (XML/SOAP), and routes requests."
              dashed={true}
              flows={[
                  "Transforms Message Formats (XML <-> JSON)",
                  "Routes based on content",
                  "Handles Protocol Bridging (HTTP <-> JMS)"
              ]}
            />

            <Arrow id="soa-a4" x1="240" y1="120" x2="290" y2="60" />
            <Arrow id="soa-a5" x1="240" y1="120" x2="290" y2="180" />

            <Box id="soa-db" deps={['soa-a4', 'soa-esb']} x="290" y="40" w="80" h="40" type="db" label="Ent. DB" details="Enterprise Data Warehouse" flows={["Stores aggregated enterprise data"]} />
            <Box id="soa-ext" deps={['soa-a5', 'soa-esb']} x="290" y="160" w="80" h="40" label="External" type="actor" details="External B2B Partners" flows={["Receives EDI/XML updates"]} />
          </g>
        );
      case ArchType.Microservices:
        return (
          <g>
            <Box id="ms-client" deps={['ms-a1', 'ms-gw']} x="20" y="100" w="60" h="40" type="actor" label="Client" details="Web or Mobile Client" flows={["Initiates API requests"]} />
            <Arrow id="ms-a1" x1="80" y1="120" x2="120" y2="120" />
            
            <Box 
              id="ms-gw"
              deps={['ms-a1', 'ms-client', 'ms-a2', 'ms-auth', 'ms-a3', 'ms-order']}
              x="120" y="40" w="60" h="160" 
              label="API Gateway" 
              type="component"
              details="Single entry point. Handles routing, auth, and rate limiting." 
              flows={[
                  "Authenticates Request",
                  "Routes /auth to Auth Svc",
                  "Routes /orders to Order Svc",
                  "Aggregates responses"
              ]}
            />

            <Arrow id="ms-a2" x1="180" y1="80" x2="220" y2="50" />
            <Arrow id="ms-a3" x1="180" y1="160" x2="220" y2="190" />

            {/* Service 1 */}
            <Box id="ms-auth" deps={['ms-a2', 'ms-gw', 'ms-a4', 'ms-auth-db']} x="220" y="30" w="90" h="40" label="Auth Svc" details="Microservice for Users/Auth. Has its own DB." 
                 flows={["Validates credentials", "Issues JWT Tokens", "Reads/Writes User DB"]} />
            <Arrow id="ms-a4" x1="265" y1="70" x2="265" y2="90" />
            <Box id="ms-auth-db" deps={['ms-a4', 'ms-auth']} x="240" y="90" w="50" h="30" type="db" label="SQL" details="User Database (isolated)" 
                 flows={["Stores User Profiles", "Stores Password Hashes"]} />

            {/* Service 2 */}
            <Box id="ms-order" deps={['ms-a3', 'ms-gw', 'ms-a5', 'ms-ord-db']} x="220" y="170" w="90" h="40" label="Order Svc" details="Microservice for Orders. Has its own DB." 
                 flows={["Creates Orders", "Publishes OrderCreated Events", "Reads/Writes Order DB"]} />
            <Arrow id="ms-a5" x1="265" y1="210" x2="265" y2="230" />
            <Box id="ms-ord-db" deps={['ms-a5', 'ms-order']} x="240" y="230" w="50" h="30" type="db" label="NoSQL" details="Order Database (isolated)" 
                 flows={["Stores Order History", "Optimized for heavy read/write"]} />
          </g>
        );
      case ArchType.EventDriven:
        return (
          <g>
            <Box id="eda-prod" deps={['eda-a1', 'eda-bus']} x="20" y="20" w="80" h="40" label="Producer" sub="Checkout" details="Publishes 'OrderPlaced' event." 
                 flows={["User completes checkout", "Publishes 'OrderPlaced' to Event Bus", "Does not wait for consumers"]} />
            <Arrow id="eda-a1" x1="60" y1="60" x2="60" y2="100" label="Event" />
            
            <Box 
              id="eda-bus"
              deps={['eda-a1', 'eda-prod', 'eda-a2', 'eda-inv', 'eda-a3', 'eda-ship', 'eda-a4', 'eda-anal']}
              x="20" y="100" w="360" h="40" 
              label="Event Bus / Broker (Kafka)" 
              type="cloud"
              details="Asynchronous backbone. Persists events and allows decoupled communication."
              flows={[
                  "Ingests events at high throughput",
                  "Persists events to log",
                  "Distributes events to Consumer Groups"
              ]}
            />

            <Arrow id="eda-a2" x1="60" y1="140" x2="60" y2="180" />
            <Arrow id="eda-a3" x1="200" y1="140" x2="200" y2="180" />
            <Arrow id="eda-a4" x1="340" y1="140" x2="340" y2="180" />

            <Box id="eda-inv" deps={['eda-a2', 'eda-bus']} x="20" y="180" w="80" h="40" label="Inventory" details="Consumer: Reserves stock upon OrderPlaced." 
                 flows={["Subscribes to OrderPlaced", "Decrements Stock Count", "Publishes StockReserved"]} />
            <Box id="eda-ship" deps={['eda-a3', 'eda-bus']} x="160" y="180" w="80" h="40" label="Shipping" details="Consumer: Schedules delivery upon OrderPlaced." 
                 flows={["Subscribes to OrderPlaced", "Generates Shipping Label", "Notifies Logistics"]} />
            <Box id="eda-anal" deps={['eda-a4', 'eda-bus']} x="300" y="180" w="80" h="40" label="Analytics" details="Consumer: Updates dashboards in real-time." 
                 flows={["Subscribes to all events", "Aggregates metrics", "Updates Real-time Dashboards"]} />
          </g>
        );
      case ArchType.Serverless:
        return (
          <g>
            <Box id="sls-user" deps={['sls-a1', 'sls-gw']} x="20" y="100" w="60" h="40" type="actor" label="User" flows={["Triggers action via HTTP"]} />
            <Arrow id="sls-a1" x1="80" y1="120" x2="120" y2="120" label="HTTP" />
            
            <Box id="sls-gw" deps={['sls-a1', 'sls-user', 'sls-a2', 'sls-func']} x="120" y="100" w="80" h="40" label="API Gateway" type="cloud" details="Managed API entry point (AWS API Gateway)." 
                 flows={["Receives request", "Triggers Lambda function", "Handles throttling"]} />
            <Arrow id="sls-a2" x1="200" y1="120" x2="240" y2="120" label="Trigger" />
            
            <Box 
              id="sls-func"
              deps={['sls-a2', 'sls-gw', 'sls-a3', 'sls-db', 'sls-a4', 'sls-s3']}
              x="240" y="100" w="80" h="40" 
              label="FaaS Function" 
              sub="Lambda" 
              dashed={true}
              details="Ephemeral stateless function. Spins up on demand, runs code, then dies."
              flows={["Starts on trigger", "Executes business logic", "Writes to DB", "Shuts down immediately"]}
            />
            
            <Arrow id="sls-a3" x1="280" y1="140" x2="280" y2="180" />
            <Box id="sls-db" deps={['sls-a3', 'sls-func']} x="250" y="180" w="60" h="40" type="db" label="DynamoDB" details="Serverless Database (managed scaling)." 
                 flows={["Auto-scales with load", "Provides low-latency access"]} />
            
            {/* Event Trigger Side */}
            <Box id="sls-s3" deps={['sls-a4', 'sls-func']} x="240" y="20" w="80" h="40" type="cloud" label="S3 Bucket" details="File upload triggers a separate function." 
                 flows={["Stores user uploads", "Triggers processing function on 'ObjectCreated'"]} />
            <Arrow id="sls-a4" x1="280" y1="60" x2="280" y2="100" dashed={true} label="Async" />
          </g>
        );
      case ArchType.WebOriented:
        return (
          <g>
            <Box id="web-browser" deps={['web-a1', 'web-cdn', 'web-a2', 'web-api']} x="20" y="100" w="80" h="50" label="Browser" type="actor" sub="SPA / PWA" details="Rich Client (React/Vue). Handles routing and rendering." 
                 flows={["Renders UI Components", "Manages Client State", "Fetches data via Fetch/Axios"]} />
            
            {/* CDN Path */}
            <Arrow id="web-a1" x1="60" y1="100" x2="60" y2="60" />
            <Box id="web-cdn" deps={['web-a1', 'web-browser']} x="20" y="20" w="80" h="40" type="cloud" label="CDN" details="Serves static assets (JS, CSS, Images) fast." 
                 flows={["Caches assets at edge", "Serves index.html", "Reduces latency"]} />
            
            {/* API Path */}
            <Arrow id="web-a2" x1="100" y1="125" x2="160" y2="125" label="JSON/REST" />
            
            <Box id="web-api" deps={['web-a2', 'web-browser', 'web-a3', 'web-db', 'web-a4', 'web-auth']} x="160" y="100" w="100" h="50" label="API Backend" sub="REST / GraphQL" details="Stateless backend API serving data to the frontend." 
                 flows={["Validates tokens", "Executes Logic", "Returns JSON data"]} />
            
            <Arrow id="web-a3" x1="260" y1="125" x2="300" y2="125" />
            <Box id="web-db" deps={['web-a3', 'web-api']} x="300" y="110" w="80" h="30" type="db" label="DB" details="Primary Database." flows={["Persists Application Data"]} />
            
            <Arrow id="web-a4" x1="210" y1="150" x2="210" y2="190" />
            <Box id="web-auth" deps={['web-a4', 'web-api']} x="170" y="190" w="80" h="30" label="Auth Provider" type="cloud" details="SaaS Auth (Auth0 / Firebase)." 
                 flows={["Handles Login/Signup", "Issues ID Tokens"]} />
          </g>
        );
      case ArchType.MobileFirst:
        return (
          <g>
             <Box id="mob-app" deps={['mob-a1', 'mob-loc', 'mob-a2', 'mob-sync']} x="30" y="50" w="80" h="150" type="actor" label="Mobile App" details="Native/Cross-platform app optimized for touch and battery." 
                  flows={["Captures offline data", "Writes to Local DB", "Queues sync jobs"]} />
             
             {/* Local DB inside mobile */}
             <Box id="mob-loc" deps={['mob-a1', 'mob-app']} x="40" y="160" w="60" h="30" type="db" label="SQLite" details="Local on-device database for offline support." 
                  flows={["Stores data on device", "Allows offline queries"]} />
             
             <Arrow id="mob-a2" x1="110" y1="125" x2="180" y2="125" label="Sync" dashed={true} />
             
             <Box id="mob-sync" deps={['mob-a2', 'mob-app', 'mob-a3', 'mob-cloud']} x="180" y="50" w="100" h="150" label="Sync Service" details="Handles data synchronization, conflict resolution, and delta updates." 
                  flows={["Receives data deltas", "Resolves conflicts (Last-Write-Wins)", "Push updates to clients"]} />
             
             <Arrow id="mob-a3" x1="280" y1="125" x2="330" y2="125" />
             <Box id="mob-cloud" deps={['mob-a3', 'mob-sync']} x="330" y="105" w="60" h="40" type="db" label="Cloud DB" details="Central source of truth." flows={["Persists global state"]} />
          </g>
        );
      case ArchType.ContainerNative:
        return (
          <g>
            {/* K8s Cluster Boundary */}
            <rect x="10" y="10" width="380" height="280" rx="8" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="8,4" opacity={getOpacity('cluster')} />
            <text x="30" y="30" fill="#3b82f6" fontSize="10" fontWeight="bold" opacity={getOpacity('cluster')}>Kubernetes Cluster</text>
            
            <Box id="k8s-ing" deps={['k8s-a1', 'k8s-pod-a', 'k8s-a2', 'k8s-pod-b']} x="30" y="120" w="60" h="60" label="Ingress" type="cloud" details="K8s Ingress Controller. Routes external traffic to services." 
                 flows={["Terminates SSL", "Routes based on Host/Path", "Load balances traffic"]} />
            <Arrow id="k8s-a1" x1="90" y1="150" x2="130" y2="100" />
            <Arrow id="k8s-a2" x1="90" y1="150" x2="130" y2="200" />
            
            {/* Pod A Group */}
            <g style={{ opacity: getOpacity('k8s-pod-a'), transition: 'opacity 0.3s' }}>
                <rect x="130" y="60" width="100" height="80" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                <text x="180" y="75" textAnchor="middle" fill="#94a3b8" fontSize="9">Pod A (ReplicaSet)</text>
                <Box id="k8s-pod-a" deps={['k8s-a1', 'k8s-ing', 'k8s-a3', 'k8s-mesh']} x="140" y="85" w="80" h="40" label="Container" details="Docker container running the application process." 
                     flows={["Runs app binary", "Logs to stdout", "Health check endpoint"]} />
            </g>
            
             {/* Pod B Group */}
             <g style={{ opacity: getOpacity('k8s-pod-b'), transition: 'opacity 0.3s' }}>
                <rect x="130" y="160" width="100" height="80" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                <text x="180" y="175" textAnchor="middle" fill="#94a3b8" fontSize="9">Pod B (ReplicaSet)</text>
                <Box id="k8s-pod-b" deps={['k8s-a2', 'k8s-ing', 'k8s-a4', 'k8s-mesh']} x="140" y="185" w="80" h="40" label="Container" details="Docker container running the application process." 
                     flows={["Runs app binary", "Scales horizontally"]} />
            </g>
            
            <Arrow id="k8s-a3" x1="230" y1="100" x2="270" y2="150" />
            <Arrow id="k8s-a4" x1="230" y1="200" x2="270" y2="150" />
            
            <Box id="k8s-mesh" deps={['k8s-a3', 'k8s-pod-a', 'k8s-a4', 'k8s-pod-b']} x="270" y="130" w="100" h="40" label="Service Mesh" type="cloud" details="Istio/Linkerd. Handles mTLS, observability, and traffic splitting." 
                 flows={["Injects sidecar proxy", "Encrypts traffic (mTLS)", "Collects telemetry"]} />
          </g>
        );
      case ArchType.GitOps:
        return (
          <g>
            {/* Git Repo Source */}
            <Box id="git-repo" deps={['git-a1', 'git-operator']} x="20" y="110" w="80" h="50" type="actor" label="Git Repo" sub="Single Source of Truth" 
                 details="Declarative YAML/HCL manifests describing cluster desired state." 
                 flows={["Developer opens Pull Request", "CI runs validation & linting", "Merge updates desired state"]} />
            
            <Arrow id="git-a1" x1="100" y1="135" x2="160" y2="135" label="Pull Sync" dashed={true} />

            {/* Reconciliation Operator in Cluster */}
            <rect x="150" y="20" width="230" height="250" rx="8" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="8,4" opacity={getOpacity('cluster-gitops')} />
            <text x="165" y="40" fill="#10b981" fontSize="10" fontWeight="bold" opacity={getOpacity('cluster-gitops')}>Kubernetes Cluster (Managed)</text>

            <Box id="git-operator" deps={['git-a1', 'git-repo', 'git-a2', 'git-target-state']} x="160" y="110" w="90" h="50" type="cloud" label="GitOps Agent" sub="ArgoCD / Flux" 
                 details="Continuous Reconciliation Controller. Pulls Git state and repairs drift." 
                 flows={["Polls Git repository for changes", "Compares desired vs live state", "Applies kubectl/Helm manifests automatically"]} />

            <Arrow id="git-a2" x1="250" y1="135" x2="290" y2="135" label="Reconcile" />

            {/* Live Workloads */}
            <Box id="git-target-state" deps={['git-a2', 'git-operator']} x="290" y="80" w="80" h="110" label="Live State" sub="Pods / Services" 
                 details="Kubernetes Workloads matching Git state exactly." 
                 flows={["Automatically updated on PR merge", "Zero manual cluster access required", "Self-heals if drift occurs"]} />
          </g>
        );
      case ArchType.Reactive:
        return (
          <g>
             <Box id="re-src" deps={['re-a1', 're-sys']} x="20" y="120" w="60" h="40" type="actor" label="Source" details="Data stream source (User, Sensor, WebSocket)." flows={["Emits continuous stream of data"]} />
             <Arrow id="re-a1" x1="80" y1="140" x2="120" y2="140" label="Stream" />
             
             <Box id="re-sys" deps={['re-a1', 're-src', 're-a2', 're-sink', 're-bp']} x="120" y="100" w="160" h="80" label="Reactive System" sub="Non-blocking IO" details="Handles back-pressure. Does not block threads. Asynchronous message-passing." 
                  flows={["Processes items asynchronously", "Signals demand to upstream", "Does not block on I/O"]} />
             
             <Arrow id="re-a2" x1="280" y1="140" x2="320" y2="140" label="Stream" />
             <Box id="re-sink" deps={['re-a2', 're-sys']} x="320" y="120" w="60" h="40" type="db" label="Sink" details="Database or Client consuming the stream." flows={["Acknowledges receipt", "Persists data"]} />

             {/* Backpressure arrow */}
             <defs>
                <marker id="arrowhead-f472b6" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#f472b6" />
                </marker>
             </defs>
             <path 
               id="re-bp"
               d="M 280 130 Q 200 80 120 130" 
               fill="none" 
               stroke="#f472b6" 
               strokeWidth="2" 
               strokeDasharray="4,4" 
               markerEnd="url(#arrowhead-f472b6)" 
               style={{ opacity: getOpacity('re-bp'), transition: 'opacity 0.3s' }}
             />
             <text x="200" y="90" textAnchor="middle" fill="#f472b6" fontSize="10" fontWeight="bold" style={{ opacity: getOpacity('re-bp') }}>Backpressure</text>
          </g>
        );
      case ArchType.SpaceBased:
          return (
            <g>
              <text x="200" y="20" textAnchor="middle" fill={colorText} fontSize="12" opacity="0.6">In-Memory Data Grid</text>
              
              {/* Processing Unit 1 */}
              <rect x="30" y="50" width="110" height="160" rx="4" fill="none" stroke="#a3e635" strokeWidth="1" strokeDasharray="4,2" opacity={getOpacity('sb-pu1')} />
              <text x="85" y="40" textAnchor="middle" fill="#a3e635" fontSize="10" opacity={getOpacity('sb-pu1')}>Node 1 (Partition A)</text>
              
              <Box id="sb-web1" deps={['sb-logic1']} x="45" y="60" w="80" h="30" label="Web" details="Receives requests for this partition." flows={["Routes based on ID"]} />
              <Arrow id="sb-a1" x1="85" y1="90" x2="85" y2="110" />
              <Box id="sb-logic1" deps={['sb-web1', 'sb-a1', 'sb-grid1', 'sb-a2']} x="45" y="110" w="80" h="30" label="Logic" details="Business Logic co-located with data." flows={["Processes data in memory"]} />
              <Arrow id="sb-a2" x1="85" y1="140" x2="85" y2="160" />
              <Box id="sb-grid1" deps={['sb-logic1', 'sb-a2', 'sb-sync', 'sb-a5']} x="45" y="160" w="80" h="40" type="db" label="IMDG" details="In-Memory Data Grid (Primary Partition A)." flows={["Reads/Writes RAM", "Syncs to Backup"]} />

              {/* Processing Unit 2 */}
              <rect x="260" y="50" width="110" height="160" rx="4" fill="none" stroke="#a3e635" strokeWidth="1" strokeDasharray="4,2" opacity={getOpacity('sb-pu2')} />
              <text x="315" y="40" textAnchor="middle" fill="#a3e635" fontSize="10" opacity={getOpacity('sb-pu2')}>Node 2 (Partition B)</text>

              <Box id="sb-web2" deps={['sb-logic2']} x="275" y="60" w="80" h="30" label="Web" details="Receives requests for this partition." />
              <Arrow id="sb-a3" x1="315" y1="90" x2="315" y2="110" />
              <Box id="sb-logic2" deps={['sb-logic2', 'sb-a3', 'sb-grid2', 'sb-a4']} x="275" y="110" w="80" h="30" label="Logic" details="Business Logic co-located with data." />
              <Arrow id="sb-a4" x1="315" y1="140" x2="315" y2="160" />
              <Box id="sb-grid2" deps={['sb-logic2', 'sb-a4', 'sb-sync', 'sb-a6']} x="275" y="160" w="80" h="40" type="db" label="IMDG" details="In-Memory Data Grid (Primary Partition B)." flows={["Reads/Writes RAM"]} />

              {/* Replication */}
              <path id="sb-sync" d="M 125 180 L 275 180" stroke="#f472b6" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrowhead-sb-sync)" style={{ opacity: getOpacity('sb-sync') }} />
              <text x="200" y="175" textAnchor="middle" fill="#f472b6" fontSize="9" style={{ opacity: getOpacity('sb-sync') }}>Replication</text>
              
              {/* Persistent Store */}
              <Box id="sb-persist" deps={['sb-a5', 'sb-a6']} x="160" y="250" w="80" h="40" type="db" label="Disk DB" details="Persistent storage for recovery." flows={["Async Write-Behind", "System of Record"]} />
              <Arrow id="sb-a5" x1="85" y1="200" x2="160" y2="260" dashed={true} label="Async" />
              <Arrow id="sb-a6" x1="315" y1="200" x2="240" y2="260" dashed={true} />

            </g>
          );
      case ArchType.EdgeComputing:
          return (
            <g>
              {/* Origin Cloud */}
              <rect x="140" y="10" width="120" height="80" rx="8" fill="#3b0764" stroke="#c084fc" strokeWidth="1" opacity={getOpacity('ec-origin')} />
              <text x="200" y="25" textAnchor="middle" fill="#c084fc" fontSize="10" fontWeight="bold" opacity={getOpacity('ec-origin')}>Origin Cloud</text>
              <Box id="ec-origin-db" deps={['ec-a1', 'ec-a2']} x="160" y="40" w="80" h="40" type="db" label="Central DB" details="Primary Data Store." flows={["Stores Global State", "Syncs with Edge"]} />

              {/* Edge Layer */}
              <path d="M 10 150 Q 200 120 390 150" fill="none" stroke="#60a5fa" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
              <text x="350" y="140" textAnchor="middle" fill="#60a5fa" fontSize="10" fontStyle="italic">Edge Network</text>

              {/* Edge Node 1 */}
              <Box id="ec-node1" deps={['ec-a1', 'ec-u1', 'ec-origin-db']} x="40" y="160" w="100" h="60" label="Edge Node (US)" type="cloud" 
                   details="Worker running near US users." flows={["Intercepts Request", "Runs Logic locally", "Returns Cached Content"]} />
              <Arrow id="ec-a1" x1="90" y1="160" x2="160" y2="80" dashed={true} label="Sync" />
              
              {/* Edge Node 2 */}
              <Box id="ec-node2" deps={['ec-a2', 'ec-u2', 'ec-origin-db']} x="260" y="160" w="100" h="60" label="Edge Node (EU)" type="cloud" 
                   details="Worker running near EU users." flows={["Intercepts Request", "Runs Logic locally"]} />
              <Arrow id="ec-a2" x1="310" y1="160" x2="240" y2="80" dashed={true} label="Sync" />

              {/* Users */}
              <Box id="ec-u1" deps={['ec-node1']} x="60" y="250" w="60" h="40" type="actor" label="User US" details="User in New York." flows={["Connects to nearest node (<10ms)"]} />
              <Arrow id="ec-a3" x1="90" y1="250" x2="90" y2="220" />

              <Box id="ec-u2" deps={['ec-node2']} x="280" y="250" w="60" h="40" type="actor" label="User EU" details="User in London." flows={["Connects to nearest node (<10ms)"]} />
              <Arrow id="ec-a4" x1="310" y1="250" x2="310" y2="220" />

            </g>
          );
      default:
        return <text x="200" y="150" textAnchor="middle" fill="white">Diagram not available</text>;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full group overflow-hidden rounded-lg bg-zinc-950 border border-zinc-800 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleBackgroundClick}
      onWheel={handleWheel}
    >
      {/* Legend Panel */}
      <div className="absolute top-4 left-4 z-20">
        <button 
          onClick={() => setShowLegend(!showLegend)}
          className="bg-zinc-800/80 hover:bg-zinc-700 backdrop-blur-sm text-xs text-zinc-300 px-3 py-1.5 rounded-md border border-zinc-700 shadow-sm flex items-center gap-2 transition-colors"
        >
          <span className="font-bold">Legend</span>
          <svg className={`w-3 h-3 transition-transform ${showLegend ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>

        {showLegend && (
          <div className="mt-2 bg-zinc-900/90 backdrop-blur-md border border-zinc-700 rounded-lg p-3 shadow-xl w-40 animate-in fade-in slide-in-from-top-2 duration-200">
             <div className="grid grid-cols-1 gap-2">
                 <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 20 20">
                       <rect x="2" y="4" width="16" height="12" rx="2" fill="#1e293b" stroke="#60a5fa" strokeWidth="2"/>
                    </svg>
                    <span className="text-[10px] text-zinc-300">Component</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 20 20">
                       <path d="M2,6 v8 q0,4 16,4 v-8 q0,-4 -16,-4 z M2,6 q0,-4 16,-4 q-16,4 -16,4" fill="#451a03" stroke="#fbbf24" strokeWidth="2"/>
                    </svg>
                    <span className="text-[10px] text-zinc-300">Database</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 20 20">
                       <path d="M2,10 Q2,5 6,5 Q8,2 12,5 Q18,5 18,10 Q18,15 12,15 Q8,18 6,15 Q2,15 2,10" fill="#3b0764" stroke="#c084fc" strokeWidth="2"/>
                    </svg>
                    <span className="text-[10px] text-zinc-300">Cloud / Ext</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 20 20">
                       <rect x="2" y="4" width="16" height="12" rx="6" fill="#1a2e05" stroke="#a3e635" strokeWidth="2"/>
                    </svg>
                    <span className="text-[10px] text-zinc-300">Client / Actor</span>
                 </div>
                 <div className="h-px bg-zinc-700 my-1"></div>
                 <div className="flex items-center gap-2">
                    <svg width="16" height="6" viewBox="0 0 20 6">
                       <line x1="0" y1="3" x2="20" y2="3" stroke="#60a5fa" strokeWidth="2" />
                    </svg>
                    <span className="text-[10px] text-zinc-300">Sync Call</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <svg width="16" height="6" viewBox="0 0 20 6">
                       <line x1="0" y1="3" x2="20" y2="3" stroke="#60a5fa" strokeWidth="2" strokeDasharray="4,2" />
                    </svg>
                    <span className="text-[10px] text-zinc-300">Async / Event</span>
                 </div>
             </div>
          </div>
        )}
      </div>

      {/* Floating Controls Bar */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Export Studio Main CTA */}
        <div className="relative">
          <button
            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
            className={`p-2 rounded-xl shadow-xl transition-all flex items-center justify-center group relative border ${
              showDownloadMenu
                ? 'bg-blue-600 border-blue-400 text-white shadow-blue-900/60 ring-2 ring-blue-400/40'
                : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-700/80 text-blue-400 hover:text-white shadow-black/60'
            }`}
            title="Export Architecture Diagram (PNG / SVG)"
          >
            <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
          </button>

          {showDownloadMenu && (
            <div className="absolute right-full top-0 mr-2.5 bg-zinc-950/95 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col min-w-[210px] animate-in fade-in slide-in-from-right-2 duration-150 p-1.5 z-40">
              <div className="px-2.5 py-1.5 border-b border-zinc-800/80 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Export Diagram</span>
                <span className="text-[9px] font-mono text-blue-400">High-Q</span>
              </div>

              {/* Full Studio Modal Trigger */}
              <button
                onClick={() => {
                  setShowDownloadMenu(false);
                  setShowExportModal(true);
                }}
                className="w-full px-2.5 py-2 mt-1 rounded-xl text-left hover:bg-blue-950/70 border border-transparent hover:border-blue-800/60 text-white transition-all flex items-center gap-2.5 group"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-900/60 border border-blue-700/60 flex items-center justify-center text-blue-300 group-hover:scale-105 transition-transform">
                  <Sliders className="w-3.5 h-3.5 text-blue-300" />
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-200">Export Studio...</div>
                  <div className="text-[10px] text-zinc-400 leading-tight">Customize DPI, Theme & Banner</div>
                </div>
              </button>

              <div className="h-px bg-zinc-800/80 my-1" />

              {/* Fast 1-Click Downloads */}
              <button
                onClick={() => handleDownload('png')}
                className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-zinc-800/80 text-zinc-300 hover:text-white transition-colors flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2">
                  <FileImage className="w-3.5 h-3.5 text-blue-400" />
                  <span>High-Res PNG (2x)</span>
                </span>
                <span className="text-[9px] font-mono text-zinc-500">.png</span>
              </button>

              <button
                onClick={() => handleDownload('svg')}
                className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-zinc-800/80 text-zinc-300 hover:text-white transition-colors flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5 text-purple-400" />
                  <span>Vector SVG Graphic</span>
                </span>
                <span className="text-[9px] font-mono text-zinc-500">.svg</span>
              </button>

              <button
                onClick={() => {
                  setShowDownloadMenu(false);
                  handleCopyDiagram({ stopPropagation: () => {} } as any);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-zinc-800/80 text-zinc-300 hover:text-white transition-colors flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2">
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copy Image to Clipboard</span>
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Copy Image Button */}
        <button
          onClick={handleCopyDiagram}
          className="p-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white rounded-xl shadow-xl transition-all group relative"
          title="Copy High-Res PNG to Clipboard"
        >
          <Copy className="w-4 h-4" />
        </button>

        {/* View SVG Code */}
        <button
          onClick={handleShowCode}
          className="p-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white rounded-xl shadow-xl transition-all group relative"
          title="View SVG Source Code"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="h-px bg-zinc-800 my-0.5" />

        {/* Zoom Controls */}
        <button
          onClick={handleZoomIn}
          className="p-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white rounded-xl shadow-xl transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white rounded-xl shadow-xl transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white rounded-xl shadow-xl transition-all"
          title="Reset Pan & Zoom View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {showCopiedToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl animate-in fade-in slide-in-from-top-4 flex items-center gap-1.5 border border-emerald-400/40">
          <CheckCircle className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      <svg viewBox="0 0 400 300" className="w-full h-full select-none touch-none">
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
          {renderContent()}
        </g>
      </svg>
      
      {/* Detailed Overlay Panel */}
      {activeNode && (
        <div
          className="absolute bottom-4 left-4 right-4 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 duration-200 z-30 cursor-default"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                {activeNode.title}
                {activeNode.sub && (
                  <span className="text-xs font-normal text-zinc-400 px-2 py-0.5 bg-zinc-800 rounded-full">
                    {activeNode.sub}
                  </span>
                )}
              </h4>
              <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                {activeNode.description}
              </p>
            </div>
            <button
              onClick={() => setActiveNode(null)}
              className="text-zinc-500 hover:text-white p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {activeNode.flows && activeNode.flows.length > 0 && (
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Data Flows & Interactions
              </span>
              <ul className="mt-1 space-y-1">
                {activeNode.flows.map((flow: string, idx: number) => (
                  <li key={idx} className="text-xs text-zinc-400 flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-500 rounded-full flex-shrink-0" />
                    {flow}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!activeNode && !showCodeModal && !showExportModal && (
        <div className="absolute bottom-2 left-2 text-[10px] text-zinc-600 pointer-events-none opacity-60">
          Drag to pan • Scroll to zoom • Click nodes to inspect • Export button in top-right
        </div>
      )}
       
      {/* Code Modal */}
      {showCodeModal && (
        <div 
          className="absolute inset-0 z-50 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center p-6 sm:p-8 animate-in fade-in duration-200"
          onClick={(e) => { e.stopPropagation(); }}
        >
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col h-[80%] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-800/50">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-400" />
                SVG Source Code
              </h3>
              <button onClick={() => setShowCodeModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 relative bg-zinc-950">
              <textarea 
                readOnly 
                value={svgCode}
                className="w-full h-full bg-transparent text-zinc-400 font-mono text-xs p-4 resize-none focus:outline-none selection:bg-blue-500/30"
                spellCheck={false}
              />
            </div>
            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex justify-end gap-3">
              <button onClick={() => setShowCodeModal(false)} className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors">
                Close
              </button>
              <button 
                onClick={handleCopyCode}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-lg transition-all flex items-center gap-2 ${codeCopied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500'}`}
              >
                {codeCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Diagram Export Studio Modal */}
      {showExportModal && (
        <DiagramExportModal
          svgElement={containerRef.current?.querySelector('svg') || null}
          archType={type}
          archTitle={currentArch?.title || type}
          category={currentArch?.category}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};
