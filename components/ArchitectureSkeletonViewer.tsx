import React, { useState, useMemo, useEffect } from 'react';
import { ArchType } from '../types';
import {
  ARCHITECTURE_TEMPLATES,
  TechStackTemplate,
  TemplateFile,
  FolderNode,
  SupportedStackLanguage
} from '../data/architectureTemplatesData';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Copy,
  Check,
  Terminal,
  Download,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Cpu,
  Package,
  Key,
  ExternalLink,
  Code2,
  X,
  Maximize2,
  Minimize2,
  Workflow,
  Search,
  ChevronsUpDown,
  FolderTree,
  File,
  Filter
} from 'lucide-react';

export const LANGUAGE_METADATA: Record<string, { label: string; icon: string; badge: string; color: string }> = {
  all: { label: 'All Frameworks', icon: '⚡', badge: 'All', color: 'text-zinc-300' },
  nodejs: { label: 'Node.js', icon: '🟩', badge: 'Node.js', color: 'text-emerald-400' },
  typescript: { label: 'TypeScript', icon: '🔷', badge: 'TypeScript', color: 'text-blue-400' },
  go: { label: 'Go (Golang)', icon: '🔷', badge: 'Go', color: 'text-cyan-400' },
  java: { label: 'Java / Spring', icon: '☕', badge: 'Java', color: 'text-orange-400' },
  python: { label: 'Python / FastAPI', icon: '🐍', badge: 'Python', color: 'text-yellow-400' },
  csharp: { label: 'C# / .NET', icon: '🔷', badge: '.NET', color: 'text-blue-400' },
  rust: { label: 'Rust', icon: '🦀', badge: 'Rust', color: 'text-amber-500' },
  yaml: { label: 'IaC / YAML', icon: '🐙', badge: 'IaC', color: 'text-purple-400' },
  other: { label: 'Other', icon: '⚙️', badge: 'Other', color: 'text-zinc-400' },
};

interface ArchitectureSkeletonViewerProps {
  archId: ArchType;
  onSelectArchitecture?: (id: ArchType) => void;
  isModal?: boolean;
  onClose?: () => void;
}

// Helper: Recursively flatten all file nodes from a tree
export const getAllFilesFromTree = (node: FolderNode, acc: { name: string; path: string; description?: string }[] = []) => {
  if (node.isFile && node.path) {
    acc.push({ name: node.name, path: node.path, description: node.description });
  }
  if (node.children) {
    node.children.forEach(child => getAllFilesFromTree(child, acc));
  }
  return acc;
};

// Helper: Determine programming language from filename extension
const getLanguageFromExtension = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
    case 'mjs':
      return 'javascript';
    case 'cs':
      return 'csharp';
    case 'go':
      return 'go';
    case 'py':
      return 'python';
    case 'java':
    case 'kt':
      return 'java';
    case 'rs':
      return 'rust';
    case 'json':
      return 'json';
    case 'yml':
    case 'yaml':
      return 'yaml';
    case 'sql':
      return 'sql';
    case 'prisma':
      return 'prisma';
    case 'proto':
      return 'protobuf';
    case 'md':
      return 'markdown';
    case 'sh':
    case 'bash':
      return 'bash';
    case 'env':
    case 'example':
      return 'shell';
    case 'dockerfile':
      return 'dockerfile';
    default:
      if (path.toLowerCase().includes('dockerfile')) return 'dockerfile';
      return 'text';
  }
};

// Helper: Generate realistic, domain-specific boilerplate for files not explicitly hardcoded in starterFiles
export const generateBoilerplateForFile = (
  filePath: string,
  fileName: string,
  techStack: TechStackTemplate,
  archTitle: string
): TemplateFile => {
  const language = getLanguageFromExtension(filePath);
  const lowerName = fileName.toLowerCase();
  const lowerPath = filePath.toLowerCase();

  let description = `Architecture implementation file for ${fileName}`;
  let content = '';

  if (lowerName.includes('controller')) {
    description = `HTTP / API routing & request validation controller for ${fileName.replace(/\.controller\..*/, '')}`;
    if (language === 'typescript' || language === 'javascript') {
      const moduleName = fileName.split('.')[0] || 'resource';
      content = `import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
// import { ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Service } from './${moduleName}.service';

export const ${moduleName}Router = Router();

// Validation Schema
const Create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Schema = z.object({
  name: z.string().min(2),
  tags: z.array(z.string()).optional()
});

/**
 * GET /api/v1/${moduleName}s
 * List records with pagination and boundary isolation
 */
${moduleName}Router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = Math.min(parseInt(req.query.limit as string || '20', 10), 100);

    // Business service delegation
    res.status(200).json({
      success: true,
      data: [],
      meta: { page, limit, total: 0 }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/${moduleName}s
 * Create domain record
 */
${moduleName}Router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = Create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Schema.parse(req.body);
    
    // Dispatch to domain service
    res.status(201).json({
      success: true,
      message: '${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} created successfully',
      data: { id: 'gen_' + Date.now(), ...validated }
    });
  } catch (error) {
    next(error);
  }
});`;
    } else if (language === 'csharp') {
      const className = fileName.replace(/\.cs$/, '');
      content = `using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace App.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class ${className} : ControllerBase
    {
        private readonly ILogger<${className}> _logger;

        public ${className}(ILogger<${className}> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Querying domain collection in ${archTitle}");
            return Ok(new { success = true, timestamp = System.DateTime.UtcNow });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] object payload)
        {
            return CreatedAtAction(nameof(GetAll), new { status = "Created", payload });
        }
    }
}`;
    }
  } else if (lowerName.includes('service')) {
    description = `Core domain business logic and transaction boundary for ${fileName}`;
    if (language === 'typescript' || language === 'javascript') {
      const baseName = fileName.split('.')[0];
      const PascalName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
      content = `/**
 * Architecture Pattern: ${archTitle}
 * Domain Business Service: ${PascalName}
 */
export interface ${PascalName}DTO {
  id?: string;
  name: string;
  metadata?: Record<string, unknown>;
}

export class ${PascalName}Service {
  constructor() {}

  async executeDomainAction(dto: ${PascalName}DTO): Promise<{ id: string; status: string }> {
    // 1. Enforce Domain Boundary Invariants
    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error('Validation failed: Entity name is required.');
    }

    // 2. Perform Transactional / Business Logic
    const recordId = 'rec_' + Math.random().toString(36).substr(2, 9);

    // 3. Optional: Emit In-Process Event or Outbox Message
    // await eventPublisher.publish('${baseName}.updated', { id: recordId });

    return {
      id: recordId,
      status: 'PROCESSED'
    };
  }

  async findById(id: string) {
    return { id, found: true, retrievedAt: new Date() };
  }
}`;
    }
  } else if (lowerName.includes('repository') || lowerName.includes('repo')) {
    description = `Data access layer & persistence abstraction for ${fileName}`;
    content = `/**
 * Data Access Layer — ${fileName}
 * Encapsulates database queries & prevents leaking SQL/ORM details to business services.
 */
export class ${fileName.split('.')[0].charAt(0).toUpperCase() + fileName.split('.')[0].slice(1)}Repository {
  async findById(id: string) {
    // Execute query via connection pool or ORM client
    return { id, createdAt: new Date() };
  }

  async save(data: any) {
    // Isolated transactional write
    return { ...data, updatedAt: new Date() };
  }

  async delete(id: string): Promise<boolean> {
    return true;
  }
}`;
  } else if (lowerName.includes('schema') || lowerName.includes('dto')) {
    description = `Validation rules, contracts, and type declarations`;
    content = `import { z } from 'zod';

export const DomainEntitySchema = z.object({
  id: z.string().uuid().or(z.string()),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  isActive: z.boolean().default(true)
});

export type DomainEntityType = z.infer<typeof DomainEntitySchema>;`;
  } else if (lowerName.includes('prisma')) {
    description = `Prisma ORM schema definitions and database relational models`;
    content = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  role      String   @default("MEMBER")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}`;
  } else if (lowerName.includes('docker') || lowerPath.includes('dockerfile')) {
    description = `Container configuration & multi-stage optimized runtime build`;
    content = `# Multi-stage secure build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
USER appuser
EXPOSE 3000
CMD ["node", "dist/server.js"]`;
  } else if (lowerName.includes('readme')) {
    description = `Project overview, architectural guidelines, and setup manual`;
    content = `# ${archTitle} — ${techStack.techName}

## Architectural Highlights
- **Runtime:** \`${techStack.runtime}\`
- **Framework:** \`${techStack.framework}\`
- **Core Pattern:** High cohesion, decoupled domains, and strict boundary rules.

## Quick Start
\`\`\`bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
\`\`\`

## Architecture Boundary Rules
${techStack.architectureRules.map(r => `- ${r}`).join('\n')}
`;
  } else if (lowerName.includes('.env')) {
    description = `Environment configuration keys and sample values`;
    content = techStack.envVariables.map(e => `# ${e.description}\n${e.key}=${e.defaultValue}`).join('\n\n');
  } else if (lowerName.includes('package.json')) {
    description = `NPM project manifest and build toolchain scripts`;
    content = JSON.stringify({
      name: `${archTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-scaffold`,
      version: "1.0.0",
      private: true,
      scripts: {
        dev: "tsx watch src/index.ts",
        build: "tsc",
        start: "node dist/index.js",
        test: "vitest run"
      },
      dependencies: {
        express: "^4.19.2",
        zod: "^3.23.8",
        dotenv: "^16.4.5"
      },
      devDependencies: {
        typescript: "^5.4.5",
        tsx: "^4.7.2",
        "@types/node": "^20.12.7"
      }
    }, null, 2);
  } else {
    description = `Source file for ${fileName}`;
    content = `// Architecture: ${archTitle}
// File: ${filePath}
// Tech Stack: ${techStack.techName}

export const ${fileName.replace(/[^a-zA-Z0-9]/g, '_')} = {
  initialized: true,
  path: "${filePath}",
  createdAt: new Date().toISOString()
};`;
  }

  return {
    path: filePath,
    name: fileName,
    language,
    description,
    content
  };
};

export const ArchitectureSkeletonViewer: React.FC<ArchitectureSkeletonViewerProps> = ({
  archId,
  onSelectArchitecture,
  isModal = false,
  onClose
}) => {
  // Current architecture template collection
  const templateCollection = ARCHITECTURE_TEMPLATES[archId] || ARCHITECTURE_TEMPLATES[ArchType.Monolithic];

  // Language / Framework Filter State ('all' or specific language like 'nodejs', 'go', 'java', etc.)
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>('all');

  // Available languages in this architecture template
  const availableLanguages = useMemo(() => {
    const list: string[] = [];
    templateCollection.techStacks.forEach(t => {
      const lang = t.language || 'other';
      if (!list.includes(lang)) {
        list.push(lang);
      }
    });
    return list;
  }, [templateCollection]);

  // Reset language filter if the current filter is not present in the new architecture
  useEffect(() => {
    if (selectedLanguageFilter !== 'all' && !availableLanguages.includes(selectedLanguageFilter)) {
      setSelectedLanguageFilter('all');
    }
  }, [availableLanguages, selectedLanguageFilter]);

  // Filtered Tech Stacks based on the selected language toggle
  const filteredTechStacks = useMemo(() => {
    if (selectedLanguageFilter === 'all') {
      return templateCollection.techStacks;
    }
    return templateCollection.techStacks.filter(t => (t.language || 'other') === selectedLanguageFilter);
  }, [templateCollection, selectedLanguageFilter]);
  
  // Selected Tech Stack State
  const [selectedTechId, setSelectedTechId] = useState<string>(() => {
    return templateCollection.techStacks[0]?.techId || '';
  });

  // Sync selectedTechId if archId changes or filtered stacks change
  useEffect(() => {
    const isCurrentlySelectedValid = filteredTechStacks.some(t => t.techId === selectedTechId);
    if (!isCurrentlySelectedValid && filteredTechStacks[0]) {
      setSelectedTechId(filteredTechStacks[0].techId);
    }
  }, [filteredTechStacks, selectedTechId]);

  const activeTechStack: TechStackTemplate = useMemo(() => {
    const found = templateCollection.techStacks.find(t => t.techId === selectedTechId);
    return found || filteredTechStacks[0] || templateCollection.techStacks[0];
  }, [templateCollection, filteredTechStacks, selectedTechId]);

  // Extract all files from current active fileTree
  const allTreeFiles = useMemo(() => {
    return getAllFilesFromTree(activeTechStack.fileTree);
  }, [activeTechStack]);

  // Selected File in Code Viewer
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');

  // Synchronize default file whenever tech stack or architecture changes
  useEffect(() => {
    const defaultFile = activeTechStack.starterFiles[0]?.path || allTreeFiles[0]?.path || '';
    setSelectedFilePath(defaultFile);
  }, [activeTechStack, allTreeFiles]);

  // Search filter for file explorer
  const [searchFilter, setSearchFilter] = useState('');

  // Expand/collapse folders state
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Expand/collapse helper
  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const current = prev[path] !== undefined ? prev[path] : true;
      return {
        ...prev,
        [path]: !current
      };
    });
  };

  const expandAllFolders = () => {
    const allPaths: Record<string, boolean> = {};
    const traverse = (node: FolderNode) => {
      if (!node.isFile) {
        allPaths[node.path] = true;
        if (node.children) node.children.forEach(traverse);
      }
    };
    traverse(activeTechStack.fileTree);
    setExpandedFolders(allPaths);
  };

  const collapseAllFolders = () => {
    const allPaths: Record<string, boolean> = {};
    const traverse = (node: FolderNode) => {
      if (!node.isFile) {
        allPaths[node.path] = false;
        if (node.children) node.children.forEach(traverse);
      }
    };
    traverse(activeTechStack.fileTree);
    allPaths[''] = true; // keep root visible
    setExpandedFolders(allPaths);
  };

  // Robust activeFile resolution: exact starter file OR dynamic architectural boilerplate
  const activeFile: TemplateFile = useMemo(() => {
    if (!selectedFilePath && activeTechStack.starterFiles[0]) {
      return activeTechStack.starterFiles[0];
    }
    
    // 1. Search in explicit starterFiles
    const explicit = activeTechStack.starterFiles.find(f => f.path === selectedFilePath || f.name === selectedFilePath);
    if (explicit) return explicit;

    // 2. Search in allTreeFiles and generate dynamic boilerplate
    const matchedNode = allTreeFiles.find(f => f.path === selectedFilePath);
    const fileName = matchedNode?.name || selectedFilePath.split('/').pop() || 'index.ts';
    
    return generateBoilerplateForFile(selectedFilePath || fileName, fileName, activeTechStack, templateCollection.archTitle);
  }, [activeTechStack, selectedFilePath, allTreeFiles, templateCollection.archTitle]);

  // Copy states
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedCommandIdx, setCopiedCommandIdx] = useState<number | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'commands' | 'rules' | 'env'>('code');

  const handleCopyFileContent = async () => {
    if (!activeFile) return;
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopiedFile(true);
      setTimeout(() => setCopiedFile(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyCommand = async (cmd: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiedCommandIdx(idx);
      setTimeout(() => setCopiedCommandIdx(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Generate automated init-project.sh bash script
  const generateBashScaffoldScript = () => {
    const lines = [
      '#!/usr/bin/env bash',
      '# =========================================================',
      `# Automated Project Scaffold for ${templateCollection.archTitle}`,
      `# Tech Stack: ${activeTechStack.techName}`,
      '# Generated by ArchFiddle SaaS Architecture Studio',
      '# =========================================================',
      'set -e',
      '',
      'echo "🚀 Generating project skeleton..."',
      ''
    ];

    // Collect all directories
    const collectDirs = (node: FolderNode, acc: Set<string>) => {
      if (!node.isFile && node.path) {
        acc.add(node.path);
      }
      if (node.children) {
        node.children.forEach(c => collectDirs(c, acc));
      }
    };

    const dirSet = new Set<string>();
    collectDirs(activeTechStack.fileTree, dirSet);
    
    dirSet.forEach(d => {
      lines.push(`mkdir -p "${d}"`);
    });

    lines.push('');
    lines.push('echo "📁 Creating starter template files..."');

    allTreeFiles.forEach(fileNode => {
      const fileResolved = activeTechStack.starterFiles.find(f => f.path === fileNode.path) ||
        generateBoilerplateForFile(fileNode.path, fileNode.name, activeTechStack, templateCollection.archTitle);

      lines.push(`cat << 'EOF' > "${fileResolved.path}"`);
      lines.push(fileResolved.content);
      lines.push('EOF');
      lines.push(`echo "  ✓ Created ${fileResolved.path}"`);
      lines.push('');
    });

    lines.push('echo ""');
    lines.push('echo "✅ Project scaffold created successfully!"');
    lines.push('echo "Next steps:"');
    activeTechStack.quickStartCommands.forEach((q, i) => {
      lines.push(`echo "  ${i + 1}. ${q.command}"`);
    });

    return lines.join('\n');
  };

  const handleDownloadScaffold = () => {
    const script = generateBashScaffoldScript();
    const blob = new Blob([script], { type: 'text/x-sh;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `init-${archId.toLowerCase().replace(/[^a-z0-9]/g, '-')}-project.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyScaffoldScript = async () => {
    const script = generateBashScaffoldScript();
    try {
      await navigator.clipboard.writeText(script);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter check for search matching
  const nodeMatchesSearch = (node: FolderNode, query: string): boolean => {
    if (!query) return true;
    const q = query.toLowerCase();
    if (node.name.toLowerCase().includes(q) || (node.path && node.path.toLowerCase().includes(q))) {
      return true;
    }
    if (node.children) {
      return node.children.some(child => nodeMatchesSearch(child, query));
    }
    return false;
  };

  // Render tree node recursively with high-fidelity click handling
  const renderTreeNode = (node: FolderNode, depth = 0): React.ReactNode => {
    if (searchFilter && !nodeMatchesSearch(node, searchFilter)) {
      return null;
    }

    if (node.isFile) {
      const isSelected = activeFile?.path === node.path || selectedFilePath === node.path;
      const isExplicitStarter = activeTechStack.starterFiles.some(f => f.path === node.path);
      
      return (
        <button
          key={node.path || node.name}
          type="button"
          onClick={() => {
            setSelectedFilePath(node.path);
            setActiveTab('code');
          }}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          className={`w-full text-left py-1.5 pr-2 rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer select-none group ${
            isSelected
              ? 'bg-blue-600/30 text-blue-200 font-semibold border border-blue-500/50 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 border border-transparent'
          }`}
          title={node.path}
        >
          <FileCode className={`w-3.5 h-3.5 shrink-0 transition-colors ${isSelected ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
          <span className="truncate flex-1 font-mono text-[11px]">{node.name}</span>
          
          {isExplicitStarter && (
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60 hidden sm:inline">
              Core
            </span>
          )}
        </button>
      );
    }

    const isExpanded = searchFilter ? true : (expandedFolders[node.path] !== false);

    return (
      <div key={node.path || 'root'} className="space-y-0.5">
        {node.name && (
          <button
            type="button"
            onClick={() => toggleFolder(node.path)}
            style={{ paddingLeft: `${depth * 14 + 6}px` }}
            className="w-full text-left py-1.5 pr-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/70 flex items-center gap-1.5 transition-colors cursor-pointer select-none group"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 text-amber-400/90 shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
            )}
            <span className="truncate font-medium">{node.name}</span>
            {node.description && (
              <span className="text-[10px] text-zinc-500 font-normal ml-auto truncate max-w-[100px] hidden sm:inline">
                {node.description}
              </span>
            )}
          </button>
        )}

        {isExpanded && node.children && (
          <div className="space-y-0.5 border-l border-zinc-800/80 ml-2.5 my-0.5">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const content = (
    <div className="space-y-6">
      {/* Top Banner & Tech Stack Selector */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 p-5 rounded-2xl border border-zinc-800/90 shadow-xl space-y-4">
        
        {/* Architecture Header & Quick Arch Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
                <Code2 className="w-4 h-4" />
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {templateCollection.archTitle} — Development Skeleton
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">
              {templateCollection.corePattern}
            </p>
          </div>

          {/* Architecture Switcher if callback provided */}
          {onSelectArchitecture && (
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-xs text-zinc-400 font-medium hidden sm:inline">Architecture:</label>
              <select
                value={archId}
                onChange={(e) => {
                  const newArch = e.target.value as ArchType;
                  onSelectArchitecture(newArch);
                }}
                className="bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 shadow-inner"
              >
                {Object.keys(ARCHITECTURE_TEMPLATES).map((key) => (
                  <option key={key} value={key}>
                    {ARCHITECTURE_TEMPLATES[key as ArchType].archTitle}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tech Stacks Selection & Language / Framework Filter */}
        <div className="space-y-3">
          {/* Header with Title and Language Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Technology Stack:</span>
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                ({filteredTechStacks.length} of {templateCollection.techStacks.length} {templateCollection.techStacks.length > 1 ? 'options' : 'option'})
              </span>
            </div>

            {/* Language / Framework Toggle Bar */}
            {availableLanguages.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap bg-zinc-950/90 p-1 rounded-xl border border-zinc-800/90">
                <span className="text-[11px] text-zinc-500 font-medium px-1.5 flex items-center gap-1">
                  <Code2 className="w-3 h-3 text-cyan-400" />
                  <span className="hidden sm:inline">Filter:</span>
                </span>
                
                {/* 'All' Button */}
                <button
                  type="button"
                  onClick={() => setSelectedLanguageFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedLanguageFilter === 'all'
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                  title="Show all available language templates for this architecture"
                >
                  <span>All</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 font-mono">
                    {templateCollection.techStacks.length}
                  </span>
                </button>

                {/* Individual Language Buttons */}
                {availableLanguages.map((lang) => {
                  const meta = LANGUAGE_METADATA[lang] || { label: lang, icon: '⚙️', badge: lang, color: 'text-zinc-300' };
                  const count = templateCollection.techStacks.filter(t => (t.language || 'other') === lang).length;
                  const isLangActive = selectedLanguageFilter === lang;

                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLanguageFilter(lang)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        isLangActive
                          ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50 shadow-sm font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                      }`}
                      title={`Filter by ${meta.label}`}
                    >
                      <span className="text-xs">{meta.icon}</span>
                      <span>{meta.badge}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 font-mono">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tech Stack Cards Grid */}
          {filteredTechStacks.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {filteredTechStacks.map((tech) => {
                const isSelected = tech.techId === activeTechStack.techId;
                const langMeta = LANGUAGE_METADATA[tech.language || 'other'] || { label: tech.language || 'Other', icon: '⚙️', badge: tech.language || 'Other', color: 'text-zinc-300' };

                return (
                  <button
                    key={tech.techId}
                    type="button"
                    onClick={() => {
                      setSelectedTechId(tech.techId);
                    }}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 border shadow-sm cursor-pointer ${
                      isSelected
                        ? `${tech.badgeColor} ring-2 ring-blue-500/50 shadow-md scale-[1.01]`
                        : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-lg">{tech.techIcon}</span>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="leading-tight text-zinc-100">{tech.techName}</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-zinc-900/80 border border-zinc-700/60 text-zinc-300 flex items-center gap-0.5">
                          <span>{langMeta.icon}</span>
                          <span>{langMeta.badge}</span>
                        </span>
                      </div>
                      <div className="text-[10px] font-normal opacity-80 mt-0.5">{tech.framework}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 text-center">
              <p className="text-xs text-zinc-400">No templates found matching the selected filter.</p>
              <button
                type="button"
                onClick={() => setSelectedLanguageFilter('all')}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
              >
                Reset language filter
              </button>
            </div>
          )}
        </div>

        {/* Active Tech Stack Summary Pill Bar */}
        <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="text-emerald-400 font-bold">Runtime:</span>
            <span className="font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-200">
              {activeTechStack.runtime}
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-blue-400 font-bold">Framework:</span>
            <span className="font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-200">
              {activeTechStack.framework}
            </span>
          </div>

          {/* Quick Action Download / Copy Script */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyScaffoldScript}
              className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy setup bash script to clipboard"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{copiedScript ? 'Script Copied!' : 'Copy init-project.sh'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadScaffold}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              title="Download runnable shell script to scaffold this structure"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Shell Scaffold</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Panel Development Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (4 cols): Directory Tree & Architecture Rules */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* File Explorer Tree Box */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 shadow-lg flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-blue-400" />
                <span className="text-zinc-200 text-xs font-bold uppercase tracking-wider">Project Explorer</span>
              </div>
              
              {/* Expand / Collapse All Quick Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={expandAllFolders}
                  className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 text-[10px] font-mono px-1.5 border border-zinc-800 transition-colors"
                  title="Expand all directories"
                >
                  Expand
                </button>
                <button
                  type="button"
                  onClick={collapseAllFolders}
                  className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 text-[10px] font-mono px-1.5 border border-zinc-800 transition-colors"
                  title="Collapse all directories"
                >
                  Collapse
                </button>
              </div>
            </div>

            {/* Quick File Search Input */}
            <div className="relative mb-2">
              <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search files (e.g. controller, service, prisma)..."
                className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-lg pl-7 pr-7 py-1 text-[11px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Tree Scrollable Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-0.5">
              {renderTreeNode(activeTechStack.fileTree)}
            </div>

            <div className="pt-2 mt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
              <span className="font-mono">{allTreeFiles.length} files in architecture</span>
              <span className="text-blue-400 font-medium text-[10px] bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/50">
                Click any file to view
              </span>
            </div>
          </div>

          {/* Architecture Boundary Rules */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Architectural Boundary Rules</span>
            </h4>
            <ul className="space-y-2 text-xs text-zinc-300">
              {activeTechStack.architectureRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/60">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span className="leading-relaxed">{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Ecosystem Packages */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-purple-400" />
              <span>Recommended Ecosystem Libraries</span>
            </h4>
            <div className="space-y-1.5">
              {activeTechStack.recommendedLibraries.map((lib, idx) => (
                <div key={idx} className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/60 flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono font-bold text-purple-300">{lib.name}</span>
                  <span className="text-[11px] text-zinc-400 text-right truncate">{lib.purpose}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (8 cols): Interactive Code Viewer & Quick-Start Execution */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Main Code Viewer & Tab Navigation */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Tab Header */}
            <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              
              {/* File / View Mode Tabs */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'code'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Code Viewer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('commands')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'commands'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Quick Start CLI ({activeTechStack.quickStartCommands.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('env')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'env'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Config & .env</span>
                </button>
              </div>

              {/* File Selector Dropdown with ALL files */}
              {activeTab === 'code' && (
                <div className="flex items-center gap-2 max-w-full sm:max-w-md">
                  <select
                    value={activeFile?.path || selectedFilePath}
                    onChange={(e) => {
                      setSelectedFilePath(e.target.value);
                    }}
                    className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-mono max-w-[240px] sm:max-w-[320px] truncate"
                  >
                    {allTreeFiles.map(f => (
                      <option key={f.path} value={f.path}>
                        {f.name} ({f.path})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleCopyFileContent}
                    className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
                    title="Copy file contents"
                  >
                    {copiedFile ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                    <span>{copiedFile ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* TAB CONTENT 1: CODE VIEWER */}
            {activeTab === 'code' && activeFile && (
              <div className="flex flex-col">
                {/* File info banner with path breadcrumbs */}
                <div className="px-4 py-2.5 bg-zinc-950/90 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                  <div className="flex items-center gap-2 font-mono flex-wrap">
                    <span className="text-zinc-500">root</span>
                    {activeFile.path.split('/').map((seg, idx, arr) => (
                      <React.Fragment key={idx}>
                        <span className="text-zinc-700">/</span>
                        <span className={idx === arr.length - 1 ? 'text-blue-300 font-semibold' : 'text-zinc-400'}>
                          {seg}
                        </span>
                      </React.Fragment>
                    ))}
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400 italic text-[11px] font-sans">{activeFile.description}</span>
                  </div>
                  
                  <span className="uppercase text-[10px] font-mono px-2 py-0.5 bg-zinc-900 rounded border border-zinc-800 text-zinc-300">
                    {activeFile.language}
                  </span>
                </div>

                {/* Syntax Code Box with Line Numbers */}
                <div className="bg-zinc-950 p-4 font-mono text-xs sm:text-sm text-zinc-200 overflow-x-auto max-h-[520px] custom-scrollbar">
                  <pre className="flex">
                    <code className="text-zinc-600 select-none pr-4 text-right border-r border-zinc-800 mr-4 font-mono text-xs">
                      {activeFile.content.split('\n').map((_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </code>
                    <code className="text-zinc-200 font-mono text-xs sm:text-sm whitespace-pre">
                      {activeFile.content}
                    </code>
                  </pre>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: QUICK START COMMANDS */}
            {activeTab === 'commands' && (
              <div className="p-5 space-y-4 bg-zinc-950">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Step-by-Step Developer Launch Commands</span>
                  </h4>
                  <span className="text-xs text-zinc-500">Run in your terminal to bootstrap</span>
                </div>

                <div className="space-y-3">
                  {activeTechStack.quickStartCommands.map((step, idx) => (
                    <div key={idx} className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-blue-300">{step.label}</span>
                        <span className="text-zinc-400 text-[11px]">{step.explanation}</span>
                      </div>
                      
                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 font-mono text-xs text-emerald-300 flex items-center justify-between gap-3">
                        <span className="select-all truncate">{step.command}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCommand(step.command, idx)}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white rounded text-[11px] font-sans flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                        >
                          {copiedCommandIdx === idx ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                          <span>{copiedCommandIdx === idx ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: ENVIRONMENT VARIABLES & CONFIG */}
            {activeTab === 'env' && (
              <div className="p-5 space-y-4 bg-zinc-950">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>Environment Variables & Configuration (.env)</span>
                  </h4>
                  <span className="text-xs text-zinc-500">Required runtime keys</span>
                </div>

                <div className="border border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900 text-zinc-400 uppercase font-mono text-[10px] border-b border-zinc-800">
                      <tr>
                        <th className="p-3">Variable Key</th>
                        <th className="p-3">Default / Example</th>
                        <th className="p-3">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono">
                      {activeTechStack.envVariables.map((env, idx) => (
                        <tr key={idx} className="hover:bg-zinc-900/50">
                          <td className="p-3 font-bold text-amber-300">{env.key}</td>
                          <td className="p-3 text-zinc-300 truncate max-w-[200px]">{env.defaultValue}</td>
                          <td className="p-3 font-sans text-zinc-400">{env.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Example .env snippet */}
                <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Generated .env.example file:</span>
                    <button
                      type="button"
                      onClick={async () => {
                        const text = activeTechStack.envVariables.map(e => `${e.key}=${e.defaultValue}`).join('\n');
                        await navigator.clipboard.writeText(text);
                        alert('.env.example copied to clipboard!');
                      }}
                      className="text-blue-400 hover:underline text-[11px] cursor-pointer"
                    >
                      Copy All as .env
                    </button>
                  </div>
                  <pre className="bg-zinc-950 p-2.5 rounded text-xs font-mono text-zinc-300 overflow-x-auto">
                    {activeTechStack.envVariables.map(e => `${e.key}=${e.defaultValue}`).join('\n')}
                  </pre>
                </div>
              </div>
            )}

          </div>

          {/* Quick Guidance Box */}
          <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-800/40 p-4 rounded-2xl flex items-start gap-3 text-xs text-zinc-300">
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white">How to start coding with this architecture template:</span>
              <p className="text-zinc-400 leading-relaxed">
                Click <strong>"Download Shell Scaffold"</strong> to download the setup script or copy individual files. 
                Follow the <strong>Architectural Boundary Rules</strong> to ensure domain separation and avoid cross-layer contamination.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/90 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Architecture Development Starter Templates & Skeletons
                </h3>
                <p className="text-xs text-zinc-400">
                  Boilerplate scaffolding, directory hierarchies, and starter code across all patterns
                </p>
              </div>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
};
