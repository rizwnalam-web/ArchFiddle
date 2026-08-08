import { InterviewQuestion } from './interviewPrepData';

export const TOP_20_AI_FRAMEWORKS_AGENTS: InterviewQuestion[] = [
  {
    id: 'ai-01',
    category: 'AI Frameworks & Agents',
    question: '1. What is Microsoft Semantic Kernel, and how do Kernel Plugins, Native Functions, and Prompt Templates orchestrate LLMs in enterprise C# / .NET apps?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Semantic Kernel', 'Microsoft AI', 'C#', '.NET 8', 'Prompt Engineering'],
    shortSummary: 'Explains Kernel building blocks, KernelPluginFactory, [KernelFunction] attributes, and ChatCompletionService integration.',
    detailedAnswer: {
      executiveSummary: 'Microsoft Semantic Kernel is an open-source SDK that integrates LLMs (Azure OpenAI, OpenAI, Hugging Face) into .NET and Python apps. It encapsulates AI capabilities into "Plugins" containing Native C# Functions and Semantic Prompt Templates, allowing AI agents to invoke structured code.',
      keyPoints: [
        'Kernel Instance: Acts as the central dependency injection container configuring model connectors, memory stores, and logging.',
        'Native Functions: C# methods decorated with [KernelFunction] and [Description] that the LLM can discover and invoke.',
        'Semantic Functions: Natural language prompt templates stored in skprompt.txt with config.json defining parameters, temperature, and top_p.',
        'ChatCompletionService: Standard interface for streaming response generation and automated function calling loops.'
      ],
      codeOrQuerySnippet: {
        title: 'Defining a Semantic Kernel Native Plugin (C# .NET 8)',
        language: 'csharp',
        code: `public class MortgagePlugin
{
    [KernelFunction, Description("Calculates monthly mortgage payment based on loan amount, interest rate, and term.")]
    public string CalculateMonthlyPayment(
        [Description("Loan amount in USD")] double loanAmount,
        [Description("Annual interest rate (e.g. 6.5)")] double annualRate,
        [Description("Loan duration in years")] int termYears)
    {
        double monthlyRate = (annualRate / 100) / 12;
        int totalPayments = termYears * 12;
        double payment = (loanAmount * monthlyRate) / (1 - Math.Pow(1 + monthlyRate, -totalPayments));
        return $"Monthly Payment: $\{payment:F2}";
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'Initializing Kernel & Automatic Function Calling Loop (C#)',
        language: 'csharp',
        code: `var builder = Kernel.CreateBuilder();
builder.AddAzureOpenAIChatCompletion("gpt-4o", "https://my-resource.openai.azure.com/", "apiKey");
builder.Plugins.AddFromType<MortgagePlugin>("MortgageCalculator");

Kernel kernel = builder.Build();
var chatService = kernel.GetRequiredService<IChatCompletionService>();

OpenAIPromptExecutionSettings settings = new() 
{ 
    ToolCallBehavior = ToolCallBehavior.AutoInvokeKernelFunctions 
};

var history = new ChatHistory();
history.AddUserMessage("What is my monthly payment for a $400,000 loan at 6.5% interest for 30 years?");
var result = await chatService.GetChatMessageContentAsync(history, settings, kernel);
Console.WriteLine(result.Content);`
      },
      proTipOrPitfall: 'Always provide detailed [Description] attributes on KernelFunction arguments—the LLM uses these descriptions as tool schemas to decide when and how to call your code.'
    }
  },
  {
    id: 'ai-02',
    category: 'AI Frameworks & Agents',
    question: '2. How does LangChain (and LCEL - LangChain Expression Language) structure LLM pipelines, Chains, and Memory, and how does it compare to Semantic Kernel?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['LangChain', 'LCEL', 'Python', 'TypeScript', 'AI Frameworks'],
    shortSummary: 'Compares LangChain composition operator (|), RunnableSequence, VectorStoreRetriever, and conversation memory types.',
    detailedAnswer: {
      executiveSummary: 'LangChain provides a composable abstractions framework for LLM applications. LCEL (LangChain Expression Language) uses the pipe operator (|) to chain PromptTemplates, Models, OutputParsers, and Retrievers into type-safe streaming execution graphs.',
      keyPoints: [
        'LCEL Pipeline Syntax: prompt | model | parser creates a RunnableSequence supporting async, streaming, and batching natively.',
        'Memory Abstractions: ConversationBufferMemory, ConversationSummaryVectorStoreMemory track state across multi-turn interactions.',
        'Retrievers: Turn vector stores into standard LCEL components for contextual document querying.',
        'LangChain vs Semantic Kernel: LangChain offers a vast ecosystem of Python/JS integrations; Semantic Kernel provides deep enterprise C#/.NET integration with strong type safety.'
      ],
      codeOrQuerySnippet: {
        title: 'LCEL Chain Composition in TypeScript / Node.js',
        language: 'typescript',
        code: `import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are an enterprise financial AI assistant."],
  ["user", "Explain the risks of {financialProduct} in 2 sentences."]
]);

const model = new ChatOpenAI({ modelName: "gpt-4o", temperature: 0.2 });
const outputParser = new StringOutputParser();

// Chain composition using LCEL pipe operator
const chain = prompt.pipe(model).pipe(outputParser);

const response = await chain.invoke({ financialProduct: "Adjustable-Rate Mortgages (ARM)" });
console.log(response);`
      },
      proTipOrPitfall: 'In production TypeScript/Python services, use LangGraph instead of legacy LangChain AgentExecutor for complex stateful loops and human-in-the-loop workflows.'
    }
  },
  {
    id: 'ai-03',
    category: 'AI Frameworks & Agents',
    question: '3. What is Microsoft AutoGen, and how do UserProxyAgent, AssistantAgent, GroupChat, and Code Execution sandboxes drive multi-agent collaboration?',
    difficulty: 'Staff / Lead Architect',
    tags: ['AutoGen', 'Multi-Agent', 'Microsoft AI', 'Python', 'Agentic Workflows'],
    shortSummary: 'Explains multi-agent converse loops, automated task division, GroupChatManager routing, and safe code execution.',
    detailedAnswer: {
      executiveSummary: 'Microsoft AutoGen is a multi-agent framework where specialized AI agents converse with each other to solve complex multi-step problems. Agents can be backed by LLMs, human input, or automated code execution environments.',
      keyPoints: [
        'AssistantAgent: An LLM-backed agent designed to act as an expert (e.g. C# Coder, SQL Architect, Security Auditor).',
        'UserProxyAgent: Represents human user intent or acts as an automated executor that runs generated code in a sandbox (Docker/Jupyter).',
        'GroupChat & GroupChatManager: Orchestrates multi-agent conversations using speaker selection strategies (round-robin, auto, manual).',
        'Human-in-the-Loop: Allows human intervention when agents require permission before executing system commands or database migrations.'
      ],
      codeOrQuerySnippet: {
        title: 'Multi-Agent Collaboration with AutoGen (Python / C#)',
        language: 'text',
        code: `from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager

config_list = [{"model": "gpt-4o", "api_key": "YOUR_KEY"}]

coder = AssistantAgent(
    name="CSharp_Developer",
    llm_config={"config_list": config_list},
    system_message="You write clean .NET 8 Web API endpoints."
)

reviewer = AssistantAgent(
    name="Code_Auditor",
    llm_config={"config_list": config_list},
    system_message="You review C# code for SQL injection, memory leaks, and performance bottlenecks."
)

user_proxy = UserProxyAgent(
    name="Product_Owner",
    human_input_mode="NEVER",
    code_execution_config={"work_dir": "sandbox", "use_docker": False}
)

groupchat = GroupChat(agents=[user_proxy, coder, reviewer], messages=[], max_round=6)
manager = GroupChatManager(groupchat=groupchat, llm_config={"config_list": config_list})

user_proxy.initiate_chat(manager, message="Write a C# controller for async mortgage document uploads.")`
      },
      proTipOrPitfall: 'Always restrict code execution in UserProxyAgent to isolated Docker containers or sandboxed WASM runtime environments in production.'
    }
  },
  {
    id: 'ai-04',
    category: 'AI Frameworks & Agents',
    question: '4. What is Retrieval-Augmented Generation (RAG), and what are the best practices for Chunking, Hybrid Search, Reciprocal Rank Fusion (RRF), and Re-ranking?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['RAG', 'Vector Search', 'Chunking', 'Reciprocal Rank Fusion', 'Re-ranking'],
    shortSummary: 'Covers RAG architecture, semantic chunking, dense/sparse embeddings, RRF scoring, and Cohere re-rankers.',
    detailedAnswer: {
      executiveSummary: 'Retrieval-Augmented Generation (RAG) grounds LLM responses by retrieving relevant enterprise context from private data stores before generation. Production RAG pipelines rely on advanced retrieval techniques like Hybrid Search and Re-ranking to maximize precision.',
      keyPoints: [
        'Chunking Strategies: Fixed-size with overlap (e.g. 512 tokens / 50 token overlap), Recursive Character Splitting, or Semantic Chunking based on embedding distance shifts.',
        'Hybrid Search: Combines Sparse Keyword Search (BM25 / Full-Text Search) with Dense Vector Similarity (Cosine/Dot Product).',
        'Reciprocal Rank Fusion (RRF): Merges ranked result lists from keyword and vector searches using score formula RRF = 1 / (60 + rank).',
        'Re-ranking: Cross-Encoder models (e.g., Cohere Rerank, BGE-Rerancer) score candidate chunks for true semantic relevance before feeding to the LLM context window.'
      ],
      codeOrQuerySnippet: {
        title: 'Reciprocal Rank Fusion (RRF) Implementation (TypeScript / C#)',
        language: 'typescript',
        code: `interface SearchResult { id: string; text: string; }

function reciprocalRankFusion(
  vectorResults: SearchResult[],
  keywordResults: SearchResult[],
  k = 60
): SearchResult[] {
  const rrfScores = new Map<string, { doc: SearchResult; score: number }>();

  const processList = (list: SearchResult[]) => {
    list.forEach((doc, rank) => {
      const current = rrfScores.get(doc.id) || { doc, score: 0 };
      current.score += 1 / (k + (rank + 1));
      rrfScores.set(doc.id, current);
    });
  };

  processList(vectorResults);
  processList(keywordResults);

  return Array.from(rrfScores.values())
    .sort((a, b) => b.score - a.score)
    .map(item => item.doc);
}`
      },
      proTipOrPitfall: 'Pure vector search struggles with exact match numbers, IDs, and acronyms. Always implement Hybrid Search (Vector + Full-Text) with Re-ranking for enterprise data.'
    }
  },
  {
    id: 'ai-05',
    category: 'AI Frameworks & Agents',
    question: '5. How do Autonomous Agent Workflows work using ReAct (Reasoning + Acting), Reflection Loops, and Plan-and-Execute architectures?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Autonomous Agents', 'ReAct Pattern', 'Reflection', 'Plan-and-Execute', 'Agentic Design'],
    shortSummary: 'Explains Thought-Action-Observation loops, self-correction, state graphs, and autonomous execution boundaries.',
    detailedAnswer: {
      executiveSummary: 'Autonomous Agent Workflows enable LLMs to reason dynamically, formulate multi-step execution plans, call external tools, observe outputs, and self-correct when errors occur.',
      keyPoints: [
        'ReAct Pattern: Alternates between Thought (reasoning about state), Action (invoking external APIs/tools), and Observation (analyzing tool response).',
        'Reflection & Critique: Agents evaluate their own output against requirements, iteratively correcting flaws before presenting results to the user.',
        'Plan-and-Execute: An initial Planning agent decomposes a high-level goal into an execution graph, and worker agents execute individual sub-tasks.',
        'State Graphs: Deterministic control flows (e.g. LangGraph) that enforce maximum loop iterations, human approvals, and state rollbacks.'
      ],
      codeOrQuerySnippet: {
        title: 'ReAct Agent Execution Loop Pseudo-Code (C# / TS)',
        language: 'typescript',
        code: `async function runReActAgent(goal: string, tools: Map<string, Function>, maxSteps = 5) {
  let context = \`Goal: \${goal}\n\`;
  
  for (let step = 1; step <= maxSteps; step++) {
    const prompt = \`\${context}\nStep \${step}: Think what to do next. Output 'Thought:', 'Action:', and 'Action Input:'\`;
    const llmResponse = await callLLM(prompt);
    
    if (llmResponse.includes("Final Answer:")) {
      return extractFinalAnswer(llmResponse);
    }
    
    const { action, actionInput } = parseAction(llmResponse);
    const tool = tools.get(action);
    const observation = await tool(actionInput);
    
    context += \`\nThought: \${parseThought(llmResponse)}\nAction: \${action}\nObservation: \${JSON.stringify(observation)}\`;
  }
  throw new Error("Agent reached maximum step limit without concluding.");
}`
      },
      proTipOrPitfall: 'Uncontrolled agent loops cause exponential token consumption. Always set strict max-iteration limits, execution timeouts, and cost tracking middleware.'
    }
  },
  {
    id: 'ai-06',
    category: 'AI Frameworks & Agents',
    question: '6. How does Function Calling / Tool Use work under the hood in OpenAI / Gemini APIs, and how do you handle JSON schema validation and multi-tool execution?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Function Calling', 'Tool Use', 'OpenAI API', 'Gemini API', 'JSON Schema'],
    shortSummary: 'Details tool specification schemas, finish_reason="tool_calls", client execution, and sending tool responses back to model.',
    detailedAnswer: {
      executiveSummary: 'Function Calling allows LLMs to return structured JSON arguments corresponding to client-defined functions rather than free-form text. The application executes the requested tool and passes the output back to the model to complete the user interaction.',
      keyPoints: [
        'Tool Schema Definition: Passed in API payload using JSON Schema describing function parameters, required fields, and parameter types.',
        'Model Decision: The model inspects conversation context and determines if a function call is needed, returning finish_reason = "tool_calls".',
        'Client Execution: The client program receives the tool name and arguments, executes the local code (e.g., database query or REST call), and formats the result.',
        'Multi-Tool Calls: Modern models can invoke multiple independent tools in a single turn for parallel processing.'
      ],
      codeOrQuerySnippet: {
        title: 'Handling Tool Calls with OpenAI / Gemini SDK in C#',
        language: 'csharp',
        code: `// 1. Define Tool Schema
var toolSpec = ChatTool.CreateFunctionTool(
    functionName: "get_credit_score",
    functionDescription: "Retrieves borrower credit score from bureau.",
    functionParameters: BinaryData.FromString(@"{
        ""type"": ""object"",
        ""properties"": {
            ""ssn"": { ""type"": ""string"", ""description"": ""Borrower SSN"" }
        },
        ""required"": [""ssn""]
    }")
);

// 2. Process Response in Loop
ChatCompletion completion = await client.CompleteChatAsync(messages, options);
if (completion.FinishReason == ChatFinishReason.ToolCalls)
{
    foreach (var toolCall in completion.ToolCalls)
    {
        var jsonArgs = toolCall.FunctionArguments.ToString();
        string result = ExecuteLocalTool(toolCall.FunctionName, jsonArgs);
        messages.Add(new ToolChatMessage(toolCall.Id, result));
    }
    // Call model again with tool results
    completion = await client.CompleteChatAsync(messages, options);
}`
      },
      proTipOrPitfall: 'Never trust LLM-generated tool arguments blindly. Always validate inputs against strong C# / TS types before calling database or external infrastructure endpoints.'
    }
  }
];

export const TOP_20_VECTOR_DATABASES: InterviewQuestion[] = [
  {
    id: 'vdb-01',
    category: 'Vector DBs & Search',
    question: '1. What is Pgvector, how do HNSW and IVFFlat index types work in PostgreSQL, and how do you perform hybrid vector + relational SQL queries?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Pgvector', 'PostgreSQL', 'HNSW', 'IVFFlat', 'Vector Search'],
    shortSummary: 'Explains Pgvector extension, cosine/L2 distance operators (<=>, <->), HNSW graph construction, and relational filtering.',
    detailedAnswer: {
      executiveSummary: 'Pgvector is an open-source extension that adds vector embedding storage and similarity search directly to PostgreSQL. It allows applications to combine vector similarity operators (<=> cosine, <-> L2, <#> inner product) with standard relational SQL JOINs and WHERE clauses in a single query transaction.',
      keyPoints: [
        'HNSW (Hierarchical Navigable Small World): Builds multi-layer graph structures offering ultra-fast approximate nearest neighbor (ANN) search without requiring training data.',
        'IVFFlat (Inverted File Flat): Divides vectors into clusters (lists); faster build time but lower recall unless lists parameter is tuned.',
        'Hybrid Relational Queries: PostgreSQL evaluates vector distance alongside indexes on tenant_id, metadata, and timestamps in a single execution plan.',
        'Distance Operators: <=> (Cosine distance), <-> (L2 Euclidean distance), <#> (Negative inner product).'
      ],
      codeOrQuerySnippet: {
        title: 'Pgvector HNSW Index Creation & Hybrid SQL Query',
        language: 'sql',
        code: `-- Enable extension & create vector table
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id INT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536) -- OpenAI embedding dimension
);

-- Build HNSW Index for Cosine Distance
CREATE INDEX ON document_embeddings 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- Hybrid Query: Relational tenant filter + Vector similarity search
SELECT id, content, 1 - (embedding <=> '[0.012, -0.045, ...]') AS similarity
FROM document_embeddings
WHERE tenant_id = 4022
ORDER BY embedding <=> '[0.012, -0.045, ...]'
LIMIT 5;`
      },
      proTipOrPitfall: 'When using IVFFlat, you MUST populate data before creating the index, whereas HNSW index creation works seamlessly on empty or growing tables.'
    }
  },
  {
    id: 'vdb-02',
    category: 'Vector DBs & Search',
    question: '2. How does Pinecone deliver Serverless Vector Indexing, Namespaces, Metadata Filtering, and low-latency upsert pipelines?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Pinecone', 'Vector Database', 'Serverless', 'Namespaces', 'RAG'],
    shortSummary: 'Covers Pinecone serverless architecture, payload metadata, namespace isolation, and index metric configuration.',
    detailedAnswer: {
      executiveSummary: 'Pinecone is a managed cloud-native vector database designed for high-throughput similarity search. Its Serverless architecture decouples storage from compute, automatically scaling read/write workers while supporting real-time metadata filtering and multi-tenant namespace isolation.',
      keyPoints: [
        'Namespaces: Logically isolate vector data within a single index (ideal for tenant segregation).',
        'Metadata Filtering: Allows filtering vector matches using key-value payload attributes ($eq, $in, $gt) before vector similarity scoring.',
        'Index Metrics: Cosine, Euclidean (L2), or Dot Product. Metric choice must match the normalization of embedding models.',
        'Serverless Architecture: Eliminates pod provisioning, billing purely on storage size and read/write units.'
      ],
      codeOrQuerySnippet: {
        title: 'Pinecone Vector Query with Metadata Filter (TypeScript / Node.js)',
        language: 'typescript',
        code: `import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index('mortgage-embeddings');

// Query vector within specific tenant namespace with metadata filter
const queryResponse = await index.namespace('tenant-8821').query({
  vector: [0.021, -0.034, 0.089, /* 1536 floats */],
  topK: 5,
  includeMetadata: true,
  filter: {
    docType: { $eq: 'UnderwritingGuide' },
    year: { $gte: 2024 }
  }
});

queryResponse.matches.forEach(match => {
  console.log(\`Score: \${match.score} | Title: \${match.metadata?.title}\`);
});`
      },
      proTipOrPitfall: 'In Pinecone, string metadata fields are indexed by default. Avoid storing huge unstructured text payloads inside Pinecone metadata—store text in PostgreSQL/S3 and store doc reference IDs in Pinecone.'
    }
  },
  {
    id: 'vdb-03',
    category: 'Vector DBs & Search',
    question: '3. What is Milvus, how does its distributed architecture work with Knowhere indexing, and how does it execute GPU-accelerated similarity search?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Milvus', 'Knowhere', 'GPU Acceleration', 'Vector Search', 'Distributed Systems'],
    shortSummary: 'Explains Milvus proxy/query nodes, segment partitions, Knowhere execution engine, and CAGRA/RAFT GPU indexes.',
    detailedAnswer: {
      executiveSummary: 'Milvus is an open-source, highly decoupled distributed vector database built for billion-scale embeddings. It separates compute nodes (Proxy, Query, Data, Index) and relies on the Knowhere engine for hardware-accelerated vector indexing on CPUs and NVIDIA GPUs.',
      keyPoints: [
        'Distributed Architecture: Query Nodes handle search, Data Nodes handle ingestion, and Index Nodes asynchronously build indexes.',
        'Knowhere Engine: Core C++ vector engine wrapping FAISS, HNSW, and GPU-accelerated libraries (CAGRA, RAFT).',
        'Scalar Filtering + Vector Search: Uses two-stage query execution or expression filtering (e.g. `age > 25 && status == "Active"`) prior to vector search.',
        'Collection Partitions: Physical segregation of collections into partition keys for rapid sub-tree searches.'
      ],
      codeOrQuerySnippet: {
        title: 'Milvus Collection Schema & Vector Search (Python / PyMilvus)',
        language: 'text',
        code: `from pymilvus import Connections, Collection, FieldSchema, CollectionSchema, DataType

connections.connect("default", host="localhost", port="19530")

# Define Collection Schema
fields = [
    FieldSchema(name="pk", dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name="org_id", dtype=DataType.INT64),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=1536)
]
schema = CollectionSchema(fields, description="Enterprise vector store")
collection = Collection("documents", schema)

# Create GPU-accelerated CAGRA / HNSW index
index_params = {
    "metric_type": "COSINE",
    "index_type": "HNSW",
    "params": {"M": 16, "efConstruction": 64}
}
collection.create_index(field_name="embedding", index_params=index_params)

# Hybrid Search
collection.load()
results = collection.search(
    data=[[0.01, -0.02, ...]], 
    anns_field="embedding", 
    param={"metric_type": "COSINE", "params": {"ef": 32}},
    limit=5,
    expr="org_id == 104"
)`
      },
      proTipOrPitfall: 'Always call `collection.load()` before querying Milvus, as collections must be loaded from persistent storage into Query Node memory.'
    }
  },
  {
    id: 'vdb-04',
    category: 'Vector DBs & Search',
    question: '4. How does Qdrant handle Vector Search, Payload Indexes, Filtering conditions (must/should/must_not), and Sparse-Dense Hybrid Vectors?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Qdrant', 'Rust', 'Payload Indexing', 'Sparse Vectors', 'Hybrid Search'],
    shortSummary: 'Covers Qdrant Rust engine, points & payloads, filter tree expressions, and SPLADE/BM25 sparse vectors.',
    detailedAnswer: {
      executiveSummary: 'Qdrant is a high-performance vector search engine written in Rust. It offers rich payload indexing and native support for Sparse-Dense Hybrid Vectors, enabling applications to search semantic dense embeddings and keyword sparse embeddings simultaneously.',
      keyPoints: [
        'Points & Payloads: A Point consists of an ID, Vector(s), and a JSON Payload metadata object.',
        'Payload Indexing: Creating indexes on payload fields (keyword, integer, geo) allows Qdrant to filter graph edges during HNSW traversal without degrading recall.',
        'Filter Conditions: Evaluates `must` (AND), `should` (OR), and `must_not` (NOT) clauses on payloads during vector graph navigation.',
        'Sparse-Dense Vectors: Supports dual vectors per point (Dense OpenAI + Sparse SPLADE/BM25) for unified multi-vector retrieval.'
      ],
      codeOrQuerySnippet: {
        title: 'Qdrant Hybrid Vector Search with Payload Filters (TypeScript / C#)',
        language: 'typescript',
        code: `import { QdrantClient } from '@qdrant/js-client-rest';

const client = new QdrantClient({ url: 'http://localhost:6333' });

// Query dense vector with payload filter condition
const response = await client.search('mortgage_knowledge', {
  vector: [0.012, -0.045, 0.088, /* 1536 floats */],
  limit: 5,
  filter: {
    must: [
      { key: 'status', match: { value: 'APPROVED' } },
      { key: 'risk_score', range: { lte: 15 } }
    ],
    must_not: [
      { key: 'archived', match: { value: true } }
    ]
  },
  with_payload: true
});

response.forEach(point => {
  console.log(\`Score: \${point.score} | Payload: \${point.payload?.title}\`);
});`
      },
      proTipOrPitfall: 'In Qdrant, create explicit Payload Indexes for frequently filtered metadata keys. Without payload indexes, Qdrant falls back to full segment scans for filtered vector search.'
    }
  },
  {
    id: 'vdb-05',
    category: 'Vector DBs & Search',
    question: '5. How does Azure AI Search operate as an enterprise Vector Store with Integrated Vectorization, Hybrid Search, and Semantic Ranker?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Azure AI Search', 'Vector Store', 'Integrated Vectorization', 'Semantic Ranker', 'Hybrid Search'],
    shortSummary: 'Explains Azure AI Search vector indexes, HNSW/Exhaustive K-NN, chunking indexers, and L2 Semantic Reranking.',
    detailedAnswer: {
      executiveSummary: 'Azure AI Search (formerly Azure Cognitive Search) is Microsoft’s enterprise search platform. It provides vector indexing (HNSW & Exhaustive K-NN), keyword search (BM25 Lucene), Integrated Vectorization pipelines using Azure OpenAI embedding models, and deep AI Semantic Ranking.',
      keyPoints: [
        'Integrated Vectorization: Indexers automatically extract text from Blob Storage/SQL, chunk documents, and push chunks through Azure OpenAI embedding models asynchronously.',
        'Hybrid Search: Combines Lucene BM25 full-text scoring with HNSW vector similarity scoring using Reciprocal Rank Fusion (RRF).',
        'Semantic Ranker: A secondary deep learning neural ranker re-evaluates top RRF search results to score domain comprehension and context alignment.',
        'Security & RBAC: Enforces Entra ID index security filters and row-level document ACL access.'
      ],
      codeOrQuerySnippet: {
        title: 'Azure AI Search Hybrid + Semantic Ranker Query (C# .NET 8)',
        language: 'csharp',
        code: `SearchClient searchClient = new SearchClient(
    new Uri("https://my-search.search.windows.net"), 
    "mortgage-index", 
    new AzureKeyCredential("apiKey")
);

var options = new SearchOptions
{
    QueryType = SearchQueryType.Semantic,
    SemanticSearch = new SemanticSearchOptions
    {
        SemanticConfigurationName = "my-semantic-config",
        QueryCaption = new QueryCaption(QueryCaptionType.Extracted)
    },
    VectorSearchQueries = 
    {
        new VectorizedQuery(embeddingFloats)
        {
            KNearestNeighborsCount = 5,
            Fields = { "contentVector" }
        }
    },
    Size = 5
};

// Execute Hybrid Search (Full-text query + Vector search + Semantic Ranker)
SearchResults<SearchDocument> response = await searchClient.SearchAsync<SearchDocument>("conventional loan limits", options);
await foreach (SearchResult<SearchDocument> result in response.Value.GetResultsAsync())
{
    Console.WriteLine($"Score: {result.Score} | Semantic Score: {result.SemanticSearch.RerankerScore}");
    Console.WriteLine($"Content: {result.Document["content"]}");
}`
      },
      proTipOrPitfall: 'Enable "Semantic Ranker" in Azure AI Search for enterprise RAG applications—it dramatically reduces top-K false positives compared to raw vector cosine similarity alone.'
    }
  }
];
