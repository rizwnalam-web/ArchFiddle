import { InterviewQuestion } from './interviewPrepData';

export const TOP_20_MCP_SERVER: InterviewQuestion[] = [
  {
    id: 'mcp-01',
    category: 'MCP Server (Model Context Protocol)',
    question: '1. What is the Model Context Protocol (MCP) by Anthropic, and how does the Host-Client-Server architectural topology standardize LLM integration with external tools and data?',
    difficulty: 'Staff / Lead Architect',
    tags: ['MCP', 'Model Context Protocol', 'Anthropic', 'Architecture', 'AI Protocol', 'JSON-RPC'],
    shortSummary: 'Explains the universal open standard replacing fragmented custom tool-calling APIs with a decoupled Host, Client, and Server hierarchy.',
    detailedAnswer: {
      executiveSummary: 'The Model Context Protocol (MCP) is an open-source standard introduced by Anthropic that provides a unified, language-agnostic protocol for connecting AI models to external data sources, developer tools, and operational environments. Instead of writing custom API integration glue for every LLM and IDE, MCP establishes an "N x M" interoperability architecture: any MCP Host (Claude Desktop, VS Code, Cursor) can communicate with any MCP Server (PostgreSQL, Git, GitHub, Jira, FileSystem) via standardized JSON-RPC 2.0 messages.',
      keyPoints: [
        'Host: The top-level user-facing AI application (e.g. Claude Desktop, AI IDE, Chat Agent) coordinating AI interactions and user approvals.',
        'Client: The internal protocol client within the host application that maintains a 1:1 connection with an individual MCP server.',
        'Server: A lightweight executable or microservice exposing Tools, Resources, and Prompts to the client.',
        'Three Core Primitives: Resources (contextual data/files), Prompts (parameterized slash-command templates), and Tools (executable functions/APIs).'
      ],
      codeOrQuerySnippet: {
        title: 'MCP Host-Client-Server Configuration (claude_desktop_config.json)',
        language: 'json',
        code: `{
  "mcpServers": {
    "enterprise-postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://app_user:secret@db.internal.corp:5432/mortgage_db"
      ],
      "env": {
        "PGSSLMODE": "require"
      }
    },
    "custom-mortgage-calculator": {
      "command": "node",
      "args": ["/opt/mcp-servers/mortgage-tools/dist/index.js"]
    }
  }
}`
      },
      secondaryCodeSnippet: {
        title: 'MCP Protocol Lifecycle Handshake (JSON-RPC 2.0)',
        language: 'json',
        code: `// 1. Client sends initialize request with client capabilities
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "roots": { "listChanged": true },
      "sampling": {}
    },
    "clientInfo": {
      "name": "Claude Desktop",
      "version": "1.0.0"
    }
  }
}

// 2. Server responds with server capabilities (tools, resources, prompts)
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": { "listChanged": true },
      "resources": { "subscribe": true }
    },
    "serverInfo": {
      "name": "Mortgage underwriting MCP Server",
      "version": "2.1.0"
    }
  }
}`
      },
      proTipOrPitfall: 'MCP completely decouples tool providers from model providers. A single MCP server written in Node.js or Python can serve Anthropic Claude, OpenAI ChatGPT, Google Gemini, or local Ollama models without modifying a single line of server code.',
      studyResources: [
        {
          title: 'Anthropic Model Context Protocol (MCP) Official Documentation & Specification',
          url: 'https://modelcontextprotocol.io/',
          source: 'Model Context Protocol Docs',
          description: 'Official protocol specification, TypeScript SDK, Python SDK, and quickstart guides.'
        }
      ]
    }
  },
  {
    id: 'mcp-02',
    category: 'MCP Server (Model Context Protocol)',
    question: '2. What are the differences between stdio and SSE (Server-Sent Events) Transports in MCP, and when do you use each?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['MCP', 'Transport', 'stdio', 'SSE', 'Server-Sent Events', 'HTTP'],
    shortSummary: 'Compares local child process Standard Input/Output with remote cloud HTTP Server-Sent Events (SSE) and POST endpoints.',
    detailedAnswer: {
      executiveSummary: 'MCP defines two primary transport mechanisms: `stdio` and `SSE` (Server-Sent Events). `stdio` executes the MCP server as a local child process, exchanging line-delimited JSON-RPC messages over standard input and output streams. `SSE` transport runs over HTTP/HTTPS, where the MCP server streams notifications and server responses over an SSE connection, and the client sends client-to-server requests via HTTP POST to an endpoint URI.',
      keyPoints: [
        'stdio Transport: Ideal for local development, desktop applications, CLI tools, and secure container sandboxes without network overhead.',
        'stdio Isolation: Standard process security; crashed servers do not expose ports on localhost, eliminating network port conflicts.',
        'SSE Transport: Ideal for distributed cloud microservices, shared enterprise servers, and multi-tenant SaaS environments.',
        'SSE Handshake: Client establishes a long-lived GET connection to `/sse`, receives an `endpoint` event with a unique session URI, and sends JSON-RPC requests via POST.'
      ],
      codeOrQuerySnippet: {
        title: 'Building a Remote SSE-based MCP Server with Express & SDK (TypeScript)',
        language: 'typescript',
        code: `import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const app = express();
const mcpServer = new Server(
  { name: "remote-mortgage-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Map to track active SSE sessions
const transports = new Map<string, SSEServerTransport>();

// 1. Establish Server-Sent Events (SSE) Stream
app.get("/sse", async (req, res) => {
  console.log("Client connected via SSE");
  const transport = new SSEServerTransport("/messages", res);
  transports.set(transport.sessionId, transport);
  
  await mcpServer.connect(transport);
});

// 2. Handle HTTP POST requests from client
app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports.get(sessionId);
  if (!transport) {
    return res.status(404).send("Session not found");
  }
  await transport.handlePostMessage(req, res);
});

app.listen(3001, () => console.log("MCP SSE Server running on port 3001"));`
      },
      proTipOrPitfall: 'When writing a `stdio` MCP server, never use `console.log()` for internal debugging statements. `console.log()` writes directly to `stdout`, which corrupts the JSON-RPC protocol parser and crashes the client. Use `console.error()` (writes to `stderr`) for logging.'
    }
  },
  {
    id: 'mcp-03',
    category: 'MCP Server (Model Context Protocol)',
    question: '3. What are the three core primitives of MCP (Tools, Resources, and Prompts), how are they declared, and how does the JSON Schema contract enforce type safety?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['MCP', 'Tools', 'Resources', 'Prompts', 'JSON Schema', 'Zod'],
    shortSummary: 'Details tools/list, tools/call, resources/read, prompts/get, URI schemes, and schema validation with Zod / Pydantic.',
    detailedAnswer: {
      executiveSummary: 'MCP structures all AI capabilities into three distinct primitives: 1) **Tools**: Callable functions with input schemas that perform side effects or compute actions, 2) **Resources**: Read-only, URI-addressable data payloads (files, database rows, logs) with MIME types and real-time subscription notifications, and 3) **Prompts**: Pre-configured user-facing slash commands and templates with dynamic parameters.',
      keyPoints: [
        'Tools (`tools/call`): Modeled after model function-calling. Exposes `name`, `description`, and `inputSchema` (JSON Schema object).',
        'Resources (`resources/read`): Identified by standard URIs (e.g. `postgres://db/table/row` or `file:///path/doc.pdf`). Does not execute arbitrary side-effects.',
        'Prompts (`prompts/get`): User-initiated workflow templates that populate the conversation prompt with structured instructions and embedded resources.',
        'Zod / JSON Schema Validation: The server validates incoming JSON arguments against strict schemas before executing code, returning JSON-RPC error codes on validation failures.'
      ],
      codeOrQuerySnippet: {
        title: 'Complete MCP Server with Tools, Resources, and Prompts (TypeScript SDK)',
        language: 'typescript',
        code: `import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const server = new Server(
  { name: "enterprise-loan-server", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {}, prompts: {} } }
);

// 1. Declare Available Tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "calculate_monthly_mortgage",
      description: "Calculates monthly amortized mortgage payment with taxes and insurance",
      inputSchema: {
        type: "object",
        properties: {
          principal: { type: "number", description: "Loan principal amount in USD" },
          annualInterestRate: { type: "number", description: "Annual interest rate (e.g. 6.5)" },
          termYears: { type: "integer", default: 30 }
        },
        required: ["principal", "annualInterestRate"]
      }
    }
  ]
}));

// 2. Handle Tool Invocations
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "calculate_monthly_mortgage") {
    const { principal, annualInterestRate, termYears = 30 } = request.params.arguments as any;
    const monthlyRate = (annualInterestRate / 100) / 12;
    const n = termYears * 12;
    const monthlyPayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));

    return {
      content: [
        {
          type: "text",
          text: \`Monthly Payment: $\${monthlyPayment.toFixed(2)} (Principal: $\${principal}, Rate: \${annualInterestRate}%, Term: \${termYears} yrs)\`
        }
      ]
    };
  }
  throw new Error(\`Unknown tool: \${request.params.name}\`);
});

// Start server on stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);`
      },
      proTipOrPitfall: 'Always provide clear, highly descriptive `description` strings on tools and parameters. LLMs use these description strings as prompt context to decide which tool to invoke and how to format arguments.'
    }
  },
  {
    id: 'mcp-04',
    category: 'MCP Server (Model Context Protocol)',
    question: '4. How does MCP handle Security, Sandboxing, Human-in-the-Loop Permissions, and Prompt Injection Defense?',
    difficulty: 'Staff / Lead Architect',
    tags: ['MCP', 'Security', 'Sandboxing', 'Human-in-the-Loop', 'Prompt Injection', 'Permissions'],
    shortSummary: 'Explains client-side authorization prompts, read-only vs write boundaries, sanitizing tool parameters, and preventing tool hijacking.',
    detailedAnswer: {
      executiveSummary: 'Because MCP servers can execute shell commands, query production databases, or mutate file systems, robust security boundaries are mandatory. In MCP architecture: 1) The Host enforces Human-in-the-Loop approval dialogs before executing any write/mutate Tool, 2) Process sandboxing (Docker containers / WebAssembly) restricts server file system access, and 3) Strict JSON schema validation prevents parameter injection attacks.',
      keyPoints: [
        'Client-Side Approval: The host application prompts the human user ("Allow tool `execute_sql_query` with argument `DROP TABLE`?") before dispatching.',
        'Read vs Write Isolation: Separate read-only resources (safe for auto-execution) from destructive mutation tools requiring explicit user confirmation.',
        'Indirect Prompt Injection Guardrails: External data fetched by MCP resources must be treated as untrusted data and wrapped in boundary tags (`<untrusted_mcp_content>`).',
        'Least Privilege Database Roles: MCP database servers should connect using restricted, non-superuser database credentials with read-only replicas.'
      ],
      codeOrQuerySnippet: {
        title: 'Defensive Input Sanitization & SQL Parameterization in MCP Server (TypeScript)',
        language: 'typescript',
        code: `import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "safe_query_loan_status") {
    const { loanId } = request.params.arguments as { loanId: string };
    
    // Strict regex validation preventing SQL injection payloads
    if (!/^[A-Z0-9-]{6,20}$/.test(loanId)) {
      return {
        isError: true,
        content: [{ type: "text", text: "Security Error: Invalid Loan ID format." }]
      };
    }

    // Always use parameterized SQL queries
    const result = await dbPool.query(
      "SELECT id, borrower_name, status FROM loans WHERE id = $1 LIMIT 1",
      [loanId]
    );

    return {
      content: [{ type: "text", text: JSON.stringify(result.rows) }]
    };
  }
});`
      },
      proTipOrPitfall: 'Never build an MCP tool that accepts arbitrary raw SQL strings (`query: "SELECT ... FROM ..."`). Always expose structured business-level tools (e.g. `get_loan_by_id`, `update_loan_status`) with strict schemas to eliminate SQL injection and prompt hijacking risks.'
    }
  },
  {
    id: 'mcp-05',
    category: 'MCP Server (Model Context Protocol)',
    question: '5. What is the MCP Sampling API (sampling/createMessage), and how does it allow MCP Servers to invoke LLM reasoning recursively without full conversation history access?',
    difficulty: 'Staff / Lead Architect',
    tags: ['MCP', 'Sampling API', 'LLM Agents', 'Recursive AI', 'Security'],
    shortSummary: 'Explains nested LLM completions requested by the server via the host, preserving privacy and eliminating server-side API key management.',
    detailedAnswer: {
      executiveSummary: 'The MCP Sampling API (`sampling/createMessage`) allows an MCP server to request an LLM completion from the host client. This enables servers to implement intelligent agentic behaviors (such as summarization, translation, or entity classification) without needing their own OpenAI/Anthropic API keys or storing user credentials. Crucially, the host controls the model, enforces token limits, and retains user privacy without exposing the full parent conversation history to the server.',
      keyPoints: [
        'Zero Server API Keys: The MCP server delegates LLM execution back to the client host application.',
        'Privacy-Preserving: The server only receives the specific prompt text it requested; it cannot read the user\'s full chat history.',
        'Recursive Agentic Patterns: A database MCP server can sample the LLM to translate natural language queries into schema-valid SQL inside the server boundary.',
        'Host Governance: The host application can inspect, rate-limit, or require user permission before granting sampling requests.'
      ],
      codeOrQuerySnippet: {
        title: 'Using MCP Sampling API for In-Server LLM Summarization (TypeScript)',
        language: 'typescript',
        code: `import { CreateMessageRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// MCP Server helper requesting an LLM completion from the Client Host
export async function summarizeDocumentViaHost(server: any, rawDocText: string): Promise<string> {
  // Check if client supports sampling capability during handshake
  const sampleResponse = await server.request(
    {
      method: "sampling/createMessage",
      params: {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: \`Extract top 3 mortgage risk factors from this contract snippet:\n\n\${rawDocText}\`
            }
          }
        ],
        maxTokens: 300,
        temperature: 0.1
      }
    },
    CreateMessageRequestSchema
  );

  const completionContent = sampleResponse.content.text;
  return completionContent;
}`
      },
      proTipOrPitfall: 'Always verify during the initialization handshake whether `capabilities.sampling` is enabled by the client before attempting to invoke `sampling/createMessage`, as some lightweight MCP clients do not support the sampling API.'
    }
  }
];
