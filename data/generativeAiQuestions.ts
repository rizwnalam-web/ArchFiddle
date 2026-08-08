import { InterviewQuestion } from './interviewPrepData';

export const TOP_20_GENERATIVE_AI: InterviewQuestion[] = [
  {
    id: 'genai-01',
    category: 'Generative AI',
    question: '1. How does the Transformer Self-Attention mechanism work under the hood, and how do KV Caching and FlashAttention optimize inference latency in production LLMs?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Generative AI', 'Transformers', 'Self-Attention', 'KV Cache', 'FlashAttention', 'LLM Internals'],
    shortSummary: 'Explains Query-Key-Value matrices, quadratic computational complexity, KV Cache memory overhead, and IO-aware FlashAttention tiled GPU SRAM execution.',
    detailedAnswer: {
      executiveSummary: 'Self-attention calculates token interactions via Query (Q), Key (K), and Value (V) projections using the formula Softmax((Q * K^T) / sqrt(d_k)) * V. During autoregressive token generation, recomputing previous keys and values for every new token would be O(N^2); KV Caching stores previous K and V matrices in GPU VRAM, reducing per-token generation to O(N). FlashAttention further optimizes this by computing exact attention in GPU on-chip SRAM using tiling and kernel fusion, preventing slow GPU HBM memory roundtrips.',
      keyPoints: [
        'Attention Formulation: Computes scalar dot-product compatibility scores between query tokens and all preceding key tokens, scaled by sqrt(dimension) to prevent gradient vanishing in softmax.',
        'KV Caching: Stores computed K and V tensors in GPU high-bandwidth memory (HBM) so decoding subsequent tokens only requires computing Q for the single new token against cached keys and values.',
        'KV Cache Memory Bottleneck: KV Cache size scales with (2 * num_layers * num_heads * head_dim * sequence_length * batch_size * precision_bytes), requiring multi-query attention (MQA) or grouped-query attention (GQA) to conserve VRAM.',
        'FlashAttention Tiling: Loads blocks of Q, K, V into fast GPU SRAM (20 TB/s), computes attention increments, and avoids materializing the massive N x N attention matrix in global HBM memory.'
      ],
      codeOrQuerySnippet: {
        title: 'Multi-Head Attention & Scaled Dot-Product Attention in PyTorch',
        language: 'typescript',
        code: `// Conceptual TypeScript simulation of Scaled Dot-Product Self-Attention
function scaledDotProductAttention(
  query: number[][], // [seq_len_q, d_k]
  key: number[][],   // [seq_len_k, d_k]
  value: number[][], // [seq_len_v, d_v]
  mask?: boolean[][]
): number[][] {
  const d_k = query[0].length;
  const scale = Math.sqrt(d_k);
  
  // 1. Compute Raw Attention Scores: Q * K^T / sqrt(d_k)
  const scores = matrixMultiply(query, transpose(key)).map(row => 
    row.map(val => val / scale)
  );

  // 2. Apply Causal / Padding Mask if provided
  if (mask) {
    for (let i = 0; i < scores.length; i++) {
      for (let j = 0; j < scores[i].length; j++) {
        if (mask[i][j]) scores[i][j] = -1e9; // Mask future tokens
      }
    }
  }

  // 3. Compute Softmax Probabilities along row dimension
  const attentionWeights = scores.map(row => softmax(row));

  // 4. Multiply with Value Matrix: Weights * V
  return matrixMultiply(attentionWeights, value);
}`
      },
      secondaryCodeSnippet: {
        title: 'Optimizing Inference with vLLM PagedAttention & GQA Configuration',
        language: 'typescript',
        code: `// Configuration for vLLM Server with FlashAttention-2 & Paged KV-Cache
const vllmDeploymentConfig = {
  model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
  tensor_parallel_size: 4, // Shard across 4x A100/H100 GPUs
  gpu_memory_utilization: 0.90,
  max_model_len: 8192,
  enable_prefix_caching: true, // Reuses KV cache for shared system prompts
  kv_cache_dtype: "auto", // FP8 KV cache for 2x memory reduction
  speculative_model: "meta-llama/Meta-Llama-3.1-8B-Instruct", // Speculative decoding for 2.5x TTFT speedup
  num_speculative_tokens: 5
};`
      },
      proTipOrPitfall: 'In production systems with long system prompts, enable Prefix Caching in vLLM or Anthropic/OpenAI Prompt Caching. It reuses the precomputed KV cache across API requests, cutting Time-To-First-Token (TTFT) by up to 80% and token billing costs by up to 50%.',
      studyResources: [
        {
          title: 'Attention Is All You Need (Vaswani et al. Original Paper)',
          url: 'https://arxiv.org/abs/1706.03762',
          source: 'arXiv.org',
          description: 'The foundational paper introducing Transformer architecture, Scaled Dot-Product Attention, and Multi-Head Attention.'
        },
        {
          title: 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness',
          url: 'https://arxiv.org/abs/2205.14135',
          source: 'Stanford Hazy Research',
          description: 'Details on GPU SRAM tiling, kernel fusion, and removing memory-bound bottlenecks in LLMs.'
        }
      ]
    }
  },
  {
    id: 'genai-02',
    category: 'Generative AI',
    question: '2. In-Context Learning (Prompting) vs Parameter-Efficient Fine-Tuning (LoRA/QLoRA) vs Direct Preference Optimization (DPO/RLHF): When should an enterprise choose each approach?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Generative AI', 'Fine-Tuning', 'LoRA', 'QLoRA', 'RLHF', 'DPO', 'Strategy'],
    shortSummary: 'Compares RAG/Prompting, LoRA rank decomposition, QLoRA 4-bit quantization, and alignment techniques for domain adaptation.',
    detailedAnswer: {
      executiveSummary: 'In-Context Learning (RAG + Prompt Engineering) is best for injecting dynamic, real-time proprietary data with instant updates and deterministic attribution. Parameter-Efficient Fine-Tuning (PEFT/LoRA) freezes the base model weights and trains low-rank adapter matrices (A & B) to alter model tone, style, output formatting, or complex domain syntax without catastrophic forgetting. RLHF (Reinforcement Learning from Human Feedback) with PPO and DPO (Direct Preference Optimization) align model behavior to human safety, preference, and nuanced policy constraints.',
      keyPoints: [
        'In-Context Learning / RAG: Zero training cost, eliminates model drift, provides source verification, but consumes context window tokens and has latency overhead.',
        'LoRA (Low-Rank Adaptation): Freezes base weight matrix W_0 (d x k) and injects trainable decomposition matrices B (d x r) and A (r x k) where rank r << min(d, k), reducing trainable parameters by 99.9%.',
        'QLoRA: Quantizes base model to NormalFloat4 (NF4) and attaches 16-bit LoRA adapters with Double Quantization and Paged Optimizers, allowing fine-tuning a 70B model on a single 48GB GPU.',
        'DPO vs PPO: DPO optimizes the policy directly on pairwise chosen vs rejected completions using closed-form loss without requiring a separate reward model or actor-critic reinforcement learning loop.'
      ],
      codeOrQuerySnippet: {
        title: 'LoRA Mathematical Adapter Injection Pattern',
        language: 'typescript',
        code: `// LoRA Forward Pass Simulation
// Output = W_0 * x + (alpha / r) * (B * A * x)
interface LoRAConfig {
  rank: number;       // e.g., 16 or 32
  alpha: number;      // Scaling factor, e.g., 32
  targetModules: string[]; // ["q_proj", "v_proj", "k_proj", "o_proj"]
  dropout: number;
}

function loraForward(
  inputX: number[], 
  baseWeightW0: number[][], 
  adapterA: number[][], // [rank, in_features]
  adapterB: number[][], // [out_features, rank]
  config: LoRAConfig
): number[] {
  // 1. Frozen base model projection (no gradients computed)
  const baseOutput = matVecMul(baseWeightW0, inputX);
  
  // 2. Low-rank adapter pathway: (B * (A * x)) * (alpha / rank)
  const intermediate = matVecMul(adapterA, inputX);
  const adapterOutput = matVecMul(adapterB, intermediate);
  const scaling = config.alpha / config.rank;
  
  // 3. Sum combined outputs
  return baseOutput.map((val, idx) => val + adapterOutput[idx] * scaling);
}`
      },
      secondaryCodeSnippet: {
        title: 'Enterprise Architecture Decision Matrix for Model Customization',
        language: 'json',
        code: `{
  "Use_Case_Routing": {
    "Dynamic_Facts_Knowledge_Retrieval": "RAG + Semantic Search (Prompt Injection)",
    "Consistent_JSON_Style_Dialect_Syntax": "LoRA / QLoRA Fine-Tuning",
    "Safety_Tone_Policy_Compliance": "DPO (Direct Preference Optimization)",
    "Domain_Vocabulary_New_Language": "Continued Pretraining + LoRA Adapter Fusion"
  }
}`
      },
      proTipOrPitfall: 'Never fine-tune an LLM solely to teach it facts—models suffer from hallucination when retrieving factual data from weights. Always use RAG for factual knowledge retrieval and Fine-Tuning for style, grammar, structured JSON schemas, and reasoning behaviors.',
      studyResources: [
        {
          title: 'LoRA: Low-Rank Adaptation of Large Language Models (Hu et al.)',
          url: 'https://arxiv.org/abs/2106.09685',
          source: 'Microsoft Research / arXiv',
          description: 'The seminal paper on parameter-efficient fine-tuning via low-rank matrix decomposition.'
        },
        {
          title: 'Direct Preference Optimization: Your Language Model is Secretly a Reward Model (Rafailov et al.)',
          url: 'https://arxiv.org/abs/2305.18290',
          source: 'Stanford University / arXiv',
          description: 'Details on DPO mathematical derivation replacing complex PPO reinforcement learning.'
        }
      ]
    }
  },
  {
    id: 'genai-03',
    category: 'Generative AI',
    question: '3. How do Function Calling and Constrained Structured Outputs (JSON Schema enforcement) work in LLMs, and how do Outlines / CFG grammars prevent schema violations?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Generative AI', 'Function Calling', 'JSON Schema', 'Grammars', 'Outlines', 'Tool Use'],
    shortSummary: 'Explains tool calling tokens, JSON Schema AST validation, logit biasing, and Context-Free Grammar (CFG) constrained token generation.',
    detailedAnswer: {
      executiveSummary: 'Tool Calling enables LLMs to interact with external APIs by returning structured arguments corresponding to provided JSON Schemas. Traditional prompting relies on model compliance, which can fail with invalid syntax. Modern Structured Output engines (OpenAI Structured Outputs, Outlines, llama.cpp GBNF) use Context-Free Grammars (CFG) at the token sampling layer: during each generation step, the engine masks out any tokens from the logit distribution that would violate the JSON Schema state machine, guaranteeing 100% syntactically valid JSON output.',
      keyPoints: [
        'Grammar-Guided Decoding: Compiles a JSON Schema or Pydantic model into a finite state automaton (FSA) or pushdown automaton.',
        'Logit Masking: At each token step, sets logits to -infinity for all tokens in vocabulary that do not represent valid transitions in the grammar.',
        'Zero Schema Hallucination: Guarantees required keys exist, types match (numbers, booleans, arrays), and enums are strictly respected.',
        'Multi-Step Tool Orchestration: Model emits tool_calls array -> Client executes native code -> Client returns tool_call_id results -> Model synthesizes final response.'
      ],
      codeOrQuerySnippet: {
        title: 'Strict JSON Schema Tool Calling with TypeScript SDK',
        language: 'typescript',
        code: `import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Define strict function tool schema
const calculateLoanMortgageTool = {
  name: 'calculateMortgageQuote',
  description: 'Calculates amortized loan payment and debt-to-income ratio',
  parameters: {
    type: Type.OBJECT,
    properties: {
      loanAmount: { type: Type.NUMBER, description: 'Total requested loan in USD' },
      interestRate: { type: Type.NUMBER, description: 'Annual interest rate percentage (e.g. 6.25)' },
      termMonths: { type: Type.INTEGER, description: 'Loan term duration (e.g. 180, 360)' },
      propertyZipCode: { type: Type.STRING, description: '5-digit US ZIP Code' }
    },
    required: ['loanAmount', 'interestRate', 'termMonths', 'propertyZipCode'],
    additionalProperties: false // Enforce strict schema closure
  }
};

async function executeAgentToolLoop(userPrompt: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userPrompt,
    config: {
      tools: [{ functionDeclarations: [calculateLoanMortgageTool] }],
      toolConfig: { functionCallingConfig: { mode: 'AUTO' } }
    }
  });

  // Inspect tool calls emitted by LLM
  if (response.functionCalls && response.functionCalls.length > 0) {
    const call = response.functionCalls[0];
    console.log(\`Invoking \${call.name} with args:\`, call.args);
  }
}`
      },
      secondaryCodeSnippet: {
        title: 'Grammar Masking State Machine Logic (Pseudocode)',
        language: 'typescript',
        code: `// Token Logit Filter based on Active JSON Parsing State
function filterLogitsWithGrammar(logits: Float32Array, grammarFSM: GrammarState): Float32Array {
  const allowedTokenIds = grammarFSM.getValidNextTokens(); // e.g. only quotes, digits, or braces
  
  for (let tokenId = 0; tokenId < logits.length; tokenId++) {
    if (!allowedTokenIds.has(tokenId)) {
      logits[tokenId] = -Infinity; // Mask out invalid tokens
    }
  }
  return logits; // Now Softmax can only choose structurally valid tokens
}`
      },
      proTipOrPitfall: 'When designing tool descriptions for LLMs, avoid generic descriptions like "executes mortgage logic". Provide explicit boundary criteria: "Use this function ONLY when the user explicitly requests an estimated monthly mortgage payment and provides loan amount, rate, and term."',
      studyResources: [
        {
          title: 'Structured Outputs Official Guide (OpenAI & JSON Schema Grammars)',
          url: 'https://platform.openai.com/docs/guides/structured-outputs',
          source: 'OpenAI Documentation',
          description: 'Comprehensive documentation on constrained decoding and strict schema validation.'
        }
      ]
    }
  },
  {
    id: 'genai-04',
    category: 'Generative AI',
    question: '4. What are the key patterns for Autonomous Multi-Agent Architectures (ReAct, Plan-and-Solve, Reflection, Human-in-the-Loop), and how do you prevent runaway infinite loops?',
    difficulty: 'Principal Architect',
    tags: ['Generative AI', 'Agents', 'ReAct', 'Multi-Agent', 'LangGraph', 'Architecture', 'Resilience'],
    shortSummary: 'Covers Agentic reasoning loops (Thought-Action-Observation), state graphs, cyclic workflow boundaries, and deterministic circuit breakers.',
    detailedAnswer: {
      executiveSummary: 'Autonomous AI Agents combine LLM reasoning with tool execution to achieve multi-step objectives. Key architectures include ReAct (interleaved Reasoning and Acting), Plan-and-Solve (generating an explicit DAG of sub-tasks before execution), and Reflection (a critic agent critiquing the worker agent\'s output). Production agent architectures must be modeled as stateful cyclic graphs (e.g. LangGraph / Semantic Kernel / AutoGen) with strict token budgets, recursion limits, deterministic circuit breakers, and human-in-the-loop approval gates for destructive actions.',
      keyPoints: [
        'ReAct Paradigm: Loop consisting of: 1) Thought (LLM analyzes current state), 2) Action (LLM selects tool & parameters), 3) Observation (Environment returns tool execution payload).',
        'State Graph Modeling: Represents agent workflow as nodes (actions/LLM calls) and conditional edges (decision branches), persisting memory checkpoints across conversational turns.',
        'Runaway Execution Prevention: Implement max_iterations thresholds (e.g. max 10 loops), execution timeouts, and exponential backoff on tool error retries.',
        'Human-in-the-Loop (HITL): Interrupt graph execution before high-stakes nodes (wire transfers, database updates, email dispatch), persisting state for user approval.'
      ],
      codeOrQuerySnippet: {
        title: 'Stateful Agent Orchestrator with Recursion Limit & Circuit Breakers (TypeScript)',
        language: 'typescript',
        code: `export interface AgentState {
  messages: Array<{ role: 'user' | 'assistant' | 'tool'; content: string; toolCallId?: string }>;
  iterationCount: number;
  maxIterations: number;
  approvedByHuman: boolean;
  status: 'running' | 'completed' | 'failed' | 'awaiting_approval';
}

export async function executeAgentLoop(
  initialPrompt: string, 
  executeTool: (name: string, args: any) => Promise<string>
): Promise<string> {
  let state: AgentState = {
    messages: [{ role: 'user', content: initialPrompt }],
    iterationCount: 0,
    maxIterations: 8,
    approvedByHuman: false,
    status: 'running'
  };

  while (state.status === 'running') {
    state.iterationCount++;
    
    // Circuit Breaker: Prevent infinite recursive spend
    if (state.iterationCount > state.maxIterations) {
      throw new Error(\`Agent exceeded maximum iteration safety limit (\${state.maxIterations})\`);
    }

    const aiResponse = await callLLMWithTools(state.messages);

    if (aiResponse.finishReason === 'stop') {
      state.status = 'completed';
      return aiResponse.content;
    }

    if (aiResponse.toolCalls) {
      for (const call of aiResponse.toolCalls) {
        // High-Stakes Action Guard: Trigger HITL
        if (call.name === 'executeWireTransfer' && !state.approvedByHuman) {
          state.status = 'awaiting_approval';
          return 'ACTION_REQUIRED: Please confirm wire transfer execution.';
        }

        const toolResult = await executeTool(call.name, call.args);
        state.messages.push({
          role: 'tool',
          toolCallId: call.id,
          content: toolResult
        });
      }
    }
  }

  return state.messages[state.messages.length - 1].content;
}`
      },
      secondaryCodeSnippet: {
        title: 'Reflection & Critic Agent Pattern',
        language: 'typescript',
        code: `// Multi-Agent Generator -> Critic -> Refiner Pipeline
async function generateAndRefineArchitecture(spec: string): Promise<string> {
  // 1. Generator Agent creates draft
  const draft = await callLLM(\`Generate Cloud Architecture for: \${spec}\`);
  
  // 2. Critic Agent checks against Well-Architected Framework
  const critique = await callLLM(\`Critique this architecture for Security & Cost: \${draft}\`);
  
  // 3. Refiner Agent produces final hardened output
  const finalized = await callLLM(\`Refine draft based on critique:\\nDraft: \${draft}\\nCritique: \${critique}\`);
  return finalized;
}`
      },
      proTipOrPitfall: 'Always decouple Agent State from LLM Context. Store the raw state history in a durable store (PostgreSQL/Redis) and trim/summarize older messages before passing to the LLM to avoid context window degradation and ballooning token bills.',
      studyResources: [
        {
          title: 'ReAct: Synergizing Reasoning and Acting in Language Models (Yao et al.)',
          url: 'https://arxiv.org/abs/2210.03629',
          source: 'Princeton University & Google Brain',
          description: 'The foundational ReAct agent paper demonstrating iterative thought and tool action loops.'
        }
      ]
    }
  },
  {
    id: 'genai-05',
    category: 'Generative AI',
    question: '5. How do Advanced RAG patterns (HyDE, Parent-Document Retriever, Reciprocal Rank Fusion, Cohere Reranking) overcome basic vector search limitations?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Generative AI', 'RAG', 'HyDE', 'Reranking', 'Vector Search', 'Hybrid Retrieval'],
    shortSummary: 'Explains query rewriting, hypothetical embeddings, hierarchical chunking, dense-sparse hybrid search, and cross-encoder rerankers.',
    detailedAnswer: {
      executiveSummary: 'Naive RAG (cosine similarity between raw user query and flat text chunks) fails on short queries, semantic vocabulary mismatches, and fragmented context. Advanced RAG resolves this using four pillars: 1) HyDE (Hypothetical Document Embeddings generates a speculative answer to embed instead of the question), 2) Parent-Document Retrieval (embeds small chunks for fine-grained retrieval but passes the parent container section to the LLM for rich context), 3) Hybrid Search with Reciprocal Rank Fusion (combines BM25 keyword search with dense vector similarity), and 4) Cross-Encoder Reranking (scores top candidates using full cross-attention before LLM generation).',
      keyPoints: [
        'HyDE: User question "How does Escrow account work?" -> LLM creates hallucinated paragraph -> Embed the paragraph -> Matches actual documentation 40% better than embedding the short question.',
        'Hierarchical / Parent-Document: Splits text into 200-token child chunks for dense embedding indexing; on hit, retrieves the full 1500-token parent document to preserve context continuity.',
        'Reciprocal Rank Fusion (RRF): Combines ranked lists from sparse BM25 and dense HNSW using formula RRF_Score(d) = Sum(1 / (k + rank_i(d))), balancing exact keyword matches with semantic intent.',
        'Cross-Encoder Reranking: Dense bi-encoders embed query and document separately. Cross-encoders (Cohere Rerank, BGE-Reranker) feed (Query, Document) together into Transformer layers, analyzing deep token interactions.'
      ],
      codeOrQuerySnippet: {
        title: 'Hybrid Retrieval with Reciprocal Rank Fusion (RRF) in TypeScript',
        language: 'typescript',
        code: `export interface SearchHit {
  id: string;
  content: string;
  score: number;
}

export function reciprocalRankFusion(
  bm25Results: SearchHit[],
  vectorResults: SearchHit[],
  k: number = 60
): SearchHit[] {
  const scoreMap = new Map<string, { hit: SearchHit; rrfScore: number }>();

  // 1. Accumulate Sparse BM25 Ranks
  bm25Results.forEach((hit, rank) => {
    const current = scoreMap.get(hit.id) || { hit, rrfScore: 0 };
    current.rrfScore += 1 / (k + (rank + 1));
    scoreMap.set(hit.id, current);
  });

  // 2. Accumulate Dense Vector Ranks
  vectorResults.forEach((hit, rank) => {
    const current = scoreMap.get(hit.id) || { hit, rrfScore: 0 };
    current.rrfScore += 1 / (k + (rank + 1));
    scoreMap.set(hit.id, current);
  });

  // 3. Sort by aggregated RRF score descending
  return Array.from(scoreMap.values())
    .sort((a, b) => b.rrfScore - a.rrfScore)
    .map(entry => ({
      ...entry.hit,
      score: entry.rrfScore
    }));
}`
      },
      secondaryCodeSnippet: {
        title: 'Two-Stage Reranking Pipeline Architecture',
        language: 'typescript',
        code: `async function advancedRAGPipeline(userQuery: string): Promise<string> {
  // Step 1: Broad Retrieval (Fetch Top 50 via Hybrid Search)
  const candidateHits = await fetchHybridBM25AndVector(userQuery, 50);

  // Step 2: High-Precision Reranker (Score Top 50 with Cross-Encoder, select Top 5)
  const top5Reranked = await cohereRerankService.rerank({
    query: userQuery,
    documents: candidateHits.map(h => h.content),
    topN: 5
  });

  // Step 3: Augmented Generation
  return await generateAnswerWithContext(userQuery, top5Reranked);
}`
      },
      proTipOrPitfall: 'Always run a reranker (like Cohere Rerank v3 or BGE-Reranker-Large) after vector retrieval. In production benchmarks, adding a cross-encoder reranker stage improves RAG answer accuracy and context precision by 25-35% with negligible latency (<50ms).',
      studyResources: [
        {
          title: 'Precise Zero-Shot Dense Retrieval without Relevance Labels (HyDE Paper)',
          url: 'https://arxiv.org/abs/2212.10496',
          source: 'Gao et al. / arXiv',
          description: 'Foundational research on Hypothetical Document Embeddings for zero-shot dense search.'
        }
      ]
    }
  },
  {
    id: 'genai-06',
    category: 'Generative AI',
    question: '6. What is Semantic Caching in LLM architectures, and how do you implement cosine similarity thresholding with Redis or Vector DBs to reduce cost and latency?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Generative AI', 'Semantic Caching', 'Redis', 'Vector DB', 'Latency', 'FinOps'],
    shortSummary: 'Covers embedding user queries, vector similarity lookups, exact vs semantic matching, cache invalidation, and dynamic variable handling.',
    detailedAnswer: {
      executiveSummary: 'Exact key-value caching fails on LLM queries because minor semantic variations ("How do I apply for a loan?" vs "What is the mortgage application process?") produce identical intent but different string hashes. Semantic Caching embeds incoming user queries, performs a vector search against previously answered query embeddings in Redis/Vector DB, and returns the cached completion if the cosine similarity exceeds a strict threshold (typically 0.92-0.96). This reduces response latency from 2500ms to 20ms and slashes API token costs by 40-70%.',
      keyPoints: [
        'Architecture: Query -> Embed Query -> Vector Search Cache Store -> If Similarity >= Threshold -> Return Cached Completion; Else -> Call LLM -> Store (QueryEmbedding, Completion) in Cache.',
        'Similarity Threshold Tuning: Threshold too low (<0.88) causes incorrect context leaks; threshold too high (>0.98) behaves like exact match with low cache hit rate.',
        'Metadata / Tenant Partitioning: Cache keys must be partitioned by Tenant ID, User Permissions, and Model Version to avoid data leaks across multi-tenant boundaries.',
        'Dynamic Entities: Template matching replaces dynamic variables (dates, account IDs, names) with entity placeholders before embedding.'
      ],
      codeOrQuerySnippet: {
        title: 'Semantic Cache Layer Implementation with Vector Similarity (TypeScript)',
        language: 'typescript',
        code: `export class SemanticCacheManager {
  private threshold: number = 0.94;

  constructor(
    private vectorStore: VectorSearchClient,
    private embeddingModel: TextEmbeddingClient
  ) {}

  async getOrExecute(
    userPrompt: string, 
    llmCaller: () => Promise<string>, 
    tenantId: string
  ): Promise<{ response: string; cached: boolean }> {
    // 1. Generate dense embedding for incoming prompt
    const promptEmbedding = await this.embeddingModel.embedText(userPrompt);

    // 2. Query cache vector index partitioned by tenant
    const topMatch = await this.vectorStore.searchNearest({
      vector: promptEmbedding,
      topK: 1,
      filter: { tenantId }
    });

    // 3. Cache Hit Evaluation
    if (topMatch.length > 0 && topMatch[0].score >= this.threshold) {
      console.log(\`Semantic Cache HIT (Score: \${topMatch[0].score.toFixed(4)})\`);
      return { response: topMatch[0].metadata.cachedResponse, cached: true };
    }

    // 4. Cache Miss: Execute LLM and cache result
    console.log('Semantic Cache MISS: Querying LLM...');
    const freshResponse = await llmCaller();

    await this.vectorStore.insert({
      id: crypto.randomUUID(),
      vector: promptEmbedding,
      metadata: {
        rawPrompt: userPrompt,
        cachedResponse: freshResponse,
        tenantId,
        createdAt: new Date().toISOString()
      },
      ttlSeconds: 86400 // 24-hour expiration
    });

    return { response: freshResponse, cached: false };
  }
}`
      },
      secondaryCodeSnippet: {
        title: 'Redis Vector Similarity Index Creation (RediSearch)',
        language: 'typescript',
        code: `// FT.CREATE idx:semantic_cache ON HASH PREFIX 1 cache: 
// SCHEMA prompt_vec VECTOR HNSW 6 TYPE FLOAT32 DIM 1536 DISTANCE_METRIC COSINE prompt TEXT response TEXT tenant_id TAG
const redisSearchQuery = \`
  FT.SEARCH idx:semantic_cache "(@tenant_id:{tenant_123})=>[KNN 1 @prompt_vec $vec AS score]"
  PARAMS 2 vec <BINARY_EMBEDDING>
  RETURN 2 response score
  DIALECT 2
\`;`
      },
      proTipOrPitfall: 'Never cache personalized outputs containing PII or volatile financial balances in a shared semantic cache. Use semantic caching primarily for general knowledge, onboarding FAQs, policy explanations, and deterministic computational queries.',
      studyResources: [
        {
          title: 'GPTCache: An Open-Source Semantic Cache for LLM Applications',
          url: 'https://github.com/zilliztech/GPTCache',
          source: 'Zilliz / GitHub',
          description: 'Architecture reference for vector similarity caching and semantic evaluation.'
        }
      ]
    }
  },
  {
    id: 'genai-07',
    category: 'Generative AI',
    question: '7. How do you mitigate LLM Hallucinations and enforce AI Safety Guardrails (NeMo Guardrails, Llama Guard, Groundedness checks)?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Generative AI', 'Hallucinations', 'Guardrails', 'NeMo', 'AI Safety', 'Groundedness'],
    shortSummary: 'Covers input sanitization, jailbreak mitigation, output verification, Colang policies, and automated Groundedness / Hallucination detection.',
    detailedAnswer: {
      executiveSummary: 'LLM hallucinations occur when probabilistic next-token predictors generate plausible-sounding but factually baseless statements. Mitigating hallucinations in production requires a multi-layered guardrail pipeline: 1) Input Guardrails (checking for jailbreaks, prompt injection, and harmful topics via Llama Guard / NeMo), 2) Grounding Constraints (requiring citations from verified RAG context), 3) Output Guardrails (running secondary evaluator models to check factuality against retrieved context), and 4) Semantic Entropy / Self-Consistency (generating multiple low-temperature completions to measure uncertainty).',
      keyPoints: [
        'Input Moderation: Uses classification models (Llama-Guard-3, Perspective API) to intercept toxic, violent, or prompt injection payloads before LLM inference.',
        'Groundedness Scoring: Evaluates if every sentence in the generated output is directly entailed by the provided RAG context using Natural Language Inference (NLI) models.',
        'NeMo Guardrails (Colang): Declarative rails define dialogue flows, blocking unauthorized topical detours (e.g. preventing a mortgage bot from providing investment advice).',
        'Self-Consistency (Chain-of-Verification): Deconstructs the generated answer into factual claims, generates verification questions for each claim, answers them independently, and rewrites the final output.'
      ],
      codeOrQuerySnippet: {
        title: 'Production Groundedness Verification & Citation Check Filter',
        language: 'typescript',
        code: `export interface GroundednessResult {
  isGrounded: boolean;
  groundedScore: number; // 0.0 to 1.0
  unsupportedClaims: string[];
}

export async function verifyGroundedness(
  generatedAnswer: string,
  retrievedContext: string
): Promise<GroundednessResult> {
  const verificationPrompt = \`
You are an expert NLI (Natural Language Inference) Auditor.
Context:
"""
\${retrievedContext}
"""

Generated Answer to Audit:
"""
\${generatedAnswer}
"""

Task:
1. Break down the Generated Answer into individual factual claims.
2. For each claim, check if it is ENTAILED by the Context.
3. Return JSON: { "groundedScore": number, "isGrounded": boolean, "unsupportedClaims": string[] }
Strictly output valid JSON only.
\`;

  const auditResponse = await callAuditorLLM(verificationPrompt);
  const result: GroundednessResult = JSON.parse(auditResponse);
  
  if (result.groundedScore < 0.85) {
    throw new Error(\`Hallucination detected! Unsupported claims: \${result.unsupportedClaims.join(', ')}\`);
  }

  return result;
}`
      },
      secondaryCodeSnippet: {
        title: 'NeMo Guardrails Colang Policy Definition (Conceptual)',
        language: 'text',
        code: `# Define Guardrail Policy for Financial Domain
define user ask about cryptocurrency
  "Should I invest in Bitcoin?"
  "What is the best crypto token?"

define flow cryptocurrency advice
  user ask about cryptocurrency
  bot refuse cryptocurrency advice
  
define bot refuse cryptocurrency advice
  "I am authorized only to assist with residential mortgage origination and loan processing. I cannot provide cryptocurrency or equity investment advice."`
      },
      proTipOrPitfall: 'Set Temperature to 0.0 or 0.2 for enterprise analytical or RAG extraction workloads. Higher temperatures (>0.7) increase stochastic token selection and dramatically elevate hallucination rates.',
      studyResources: [
        {
          title: 'NVIDIA NeMo Guardrails Documentation & Architecture',
          url: 'https://docs.nvidia.com/nemo/guardrails/',
          source: 'NVIDIA Developer',
          description: 'Open-source toolkit for adding programmable guardrails to LLM-based conversational applications.'
        }
      ]
    }
  },
  {
    id: 'genai-08',
    category: 'Generative AI',
    question: '8. How do Evaluation Frameworks for GenAI (Ragas, TruLens, DeepEval, G-Eval) measure RAG quality and agent performance in CI/CD pipelines?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Generative AI', 'Evaluation', 'Ragas', 'G-Eval', 'CI/CD', 'Metrics'],
    shortSummary: 'Explains the RAG Triad: Faithfulness, Answer Relevance, Context Precision, and LLM-as-a-Judge grading rubrics.',
    detailedAnswer: {
      executiveSummary: 'Traditional NLP metrics (BLEU, ROUGE) measure n-gram overlap and fail to capture semantic accuracy or factual truth in LLM outputs. Modern GenAI evaluation uses the "RAG Triad" and LLM-as-a-Judge methodologies (Ragas, DeepEval, TruLens). The core metrics are: 1) Faithfulness (measures hallucinations by checking if the answer is grounded in retrieved context), 2) Answer Relevance (measures if the answer directly addresses the prompt without fluff), 3) Context Precision (evaluates if top retrieved chunks are actually relevant), and 4) Context Recall (evaluates if all required facts were retrieved).',
      keyPoints: [
        'Faithfulness: (Number of claims in answer supported by context) / (Total claims in answer). Score < 1.0 indicates hallucination.',
        'Answer Relevance: Measures semantic cosine similarity between the original user prompt and reverse-engineered questions generated from the answer.',
        'Context Precision: Evaluates rank ordering of retrieved documents using Mean Average Precision (MAP), ensuring signal-to-noise ratio is maximized at top ranks.',
        'G-Eval (LLM-as-a-Judge with Chain-of-Thought): Uses frontier LLMs (e.g. GPT-4o / Claude 3.5 Sonnet) guided by detailed scoring rubrics and step-by-step reasoning to assign 1-5 scalar ratings with 90%+ human agreement.'
      ],
      codeOrQuerySnippet: {
        title: 'Automated RAG Quality Evaluation Test in CI/CD (TypeScript / DeepEval Pattern)',
        language: 'typescript',
        code: `import { test, expect } from 'vitest';

export async function evaluateRAGTriad(
  question: string,
  contextChunks: string[],
  generatedAnswer: string
): Promise<{ faithfulness: number; answerRelevance: number; contextPrecision: number }> {
  // Execute LLM-as-a-Judge evaluation prompt with Rubric
  const evaluation = await callEvaluationJudge({
    question,
    retrievedContext: contextChunks.join('\\n---\\n'),
    answer: generatedAnswer,
    rubric: 'RAG_TRIAD_V2'
  });

  return {
    faithfulness: evaluation.faithfulnessScore,       // Target >= 0.90
    answerRelevance: evaluation.relevanceScore,        // Target >= 0.85
    contextPrecision: evaluation.contextPrecisionScore // Target >= 0.80
  };
}

// CI/CD Automated Regression Test
test('Mortgage Underwriting Q&A RAG Pipeline adheres to Quality Thresholds', async () => {
  const testQuestion = "What is the maximum allowed Debt-to-Income (DTI) for a conventional loan?";
  const { retrievedChunks, answer } = await runMortgageRAG(testQuestion);

  const metrics = await evaluateRAGTriad(testQuestion, retrievedChunks, answer);

  expect(metrics.faithfulness).toBeGreaterThanOrEqual(0.90);
  expect(metrics.answerRelevance).toBeGreaterThanOrEqual(0.85);
  expect(metrics.contextPrecision).toBeGreaterThanOrEqual(0.80);
});`
      },
      secondaryCodeSnippet: {
        title: 'RAG Triad Metric Architecture Diagram',
        language: 'text',
        code: `                  [ User Question ]
                     /          \\
         Context Precision     Answer Relevance
                   /              \\
        [ Retrieved Context ] <--- Faithfulness ---> [ Generated Answer ]`
      },
      proTipOrPitfall: 'When using LLM-as-a-Judge, guard against Position Bias (the judge preferring whichever answer is presented first) and Verbosity Bias (the judge preferring longer answers). Always randomize answer order and normalize answer lengths during pairwise evaluations.',
      studyResources: [
        {
          title: 'Ragas: Automated Evaluation of Retrieval Augmented Generation (Es et al.)',
          url: 'https://arxiv.org/abs/2309.15217',
          source: 'Exploding Gradients / arXiv',
          description: 'The standard framework for evaluating Faithfulness, Context Recall, and Answer Relevance.'
        }
      ]
    }
  },
  {
    id: 'genai-09',
    category: 'Generative AI',
    question: '9. How do Context Window Limits, Attention Degeneracy ("Lost in the Middle"), and Prompt Caching affect multi-turn conversational agents?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Generative AI', 'Context Window', 'Lost in the Middle', 'Prompt Caching', 'Conversation Management'],
    shortSummary: 'Explains U-shaped recall degradation in long contexts, KV cache persistence, token pruning, and memory summarization.',
    detailedAnswer: {
      executiveSummary: 'While modern LLMs boast 128k to 2M token context windows, performance is not uniform across the window. The "Lost in the Middle" phenomenon (Liu et al.) shows that LLMs retrieve facts positioned at the beginning and end of long contexts with 90%+ accuracy, but recall drops to 50% for facts buried in the middle 60%. Production agents must manage context via sliding-window message pruning, hierarchical entity memory, position-aware chunk placement, and Prompt Caching to maintain accuracy and prevent exponential billing.',
      keyPoints: [
        'Lost in the Middle Root Cause: Positional bias in Transformer attention mechanisms prioritizes tokens at the start (system prompt) and end (latest user prompt).',
        'Strategic Context Placement: Always place the most critical grounding instructions and primary reference documents at the very top or bottom of the prompt.',
        'Sliding Window & Token Pruning: Retain recent N turns in full fidelity; summarize turns N+1 to N+20 into a consolidated summary block.',
        'Prompt Caching Mechanics: Static prefixes (System prompt + tool declarations + foundational schema) exceeding 1024 tokens are cached by OpenAI/Anthropic/Gemini, offering 50-80% discounts on cached token reads.'
      ],
      codeOrQuerySnippet: {
        title: 'Context Manager with Sliding Window & Position-Aware Placement (TypeScript)',
        language: 'typescript',
        code: `export class ContextWindowManager {
  private maxTokens: number = 8000;
  private reservedOutputTokens: number = 1500;

  formatContextPayload(
    systemPrompt: string,
    criticalGroundingDocs: string[],
    conversationHistory: Array<{ role: string; content: string }>,
    latestUserQuestion: string
  ) {
    // 1. Position critical instructions at top (high recall zone)
    const promptHeader = \`\${systemPrompt}\\n\\nCRITICAL INSTRUCTIONS:\\n\${criticalGroundingDocs.join('\\n')}\`;

    // 2. Prune conversation history to fit budget
    const prunedHistory = this.pruneHistoryToFitBudget(
      conversationHistory, 
      this.maxTokens - this.reservedOutputTokens - countTokens(promptHeader) - countTokens(latestUserQuestion)
    );

    // 3. Assemble: Header (Top) -> Pruned History (Middle) -> Latest User Question (Bottom High Recall Zone)
    return [
      { role: 'system', content: promptHeader },
      ...prunedHistory,
      { role: 'user', content: latestUserQuestion }
    ];
  }

  private pruneHistoryToFitBudget(history: any[], budgetTokens: number): any[] {
    const valid: any[] = [];
    let used = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      const tokens = countTokens(history[i].content);
      if (used + tokens > budgetTokens) break;
      valid.unshift(history[i]);
      used += tokens;
    }
    return valid;
  }
}`
      },
      secondaryCodeSnippet: {
        title: 'Anthropic Prompt Caching Breakpoint Configuration',
        language: 'typescript',
        code: `// Enable Prompt Caching on large static context
const requestBody = {
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  system: [
    {
      type: "text",
      text: "You are the Enterprise Loan Underwriting AI. Below is the 500-page policy manual...",
      cache_control: { type: "ephemeral" } // Cache this 50,000-token block
    }
  ],
  messages: [{ role: "user", content: "What are the Fannie Mae reserve requirements?" }]
};`
      },
      proTipOrPitfall: 'When constructing RAG prompts with 10+ retrieved chunks, sort the chunks by reranker score and place the highest scoring chunk at the bottom right before the user question, the second highest at the very top, and lower scoring chunks in the middle.',
      studyResources: [
        {
          title: 'Lost in the Middle: How Language Models Use Long Contexts (Liu et al.)',
          url: 'https://arxiv.org/abs/2307.03172',
          source: 'Stanford University / arXiv',
          description: 'Empirical research demonstrating U-shaped retrieval degradation in long-context LLMs.'
        }
      ]
    }
  },
  {
    id: 'genai-10',
    category: 'Generative AI',
    question: '10. What are Model Quantization techniques (AWQ, GPTQ, GGUF, FP8) and how do they impact VRAM, throughput, and perplexity in local LLM serving (vLLM / Ollama)?',
    difficulty: 'Principal Architect',
    tags: ['Generative AI', 'Quantization', 'AWQ', 'GPTQ', 'GGUF', 'vLLM', 'Inference Optimization'],
    shortSummary: 'Explains post-training quantization, weight-only vs weight-activation quantization, activation-aware outlier preservation, and FP8 serving.',
    detailedAnswer: {
      executiveSummary: 'Full-precision FP16 model weights require 2 bytes per parameter (a 70B parameter model requires 140GB VRAM just for weights, requiring 2x 80GB A100 GPUs). Quantization maps high-precision float values to lower bit-depth representations (INT8, INT4, FP8). AWQ (Activation-aware Weight Quantization) protects the 1% most salient outlier weights while quantizing the remaining 99% to 4-bit, achieving 3.5x VRAM reduction and 2-3x token generation speedup with less than 0.1 perplexity loss.',
      keyPoints: [
        'AWQ vs GPTQ: GPTQ uses second-order Taylor expansions to minimize error row-by-row; AWQ observes activation magnitudes and selectively scales salient weights, preserving reasoning and coding accuracy better at INT4.',
        'GGUF Format: Designed by Georgi Gerganov for CPU/GPU hybrid inference (llama.cpp/Ollama), supporting flexible layer offloading to unified RAM.',
        'FP8 (E4M3 & E5M2): Native 8-bit floating point hardware support on NVIDIA Ada Lovelace / Hopper (H100/H200) architectures, offering 2x throughput over FP16 without requiring complex INT4 scaling routines.',
        'Perplexity & Degradation: Models >= 30B parameters tolerate 4-bit quantization with zero human-discernible degradation, whereas small models (<7B) exhibit noticeable math/code degradation below 6-bit.'
      ],
      codeOrQuerySnippet: {
        title: 'VRAM Calculation Formula for LLM Serving',
        language: 'typescript',
        code: `// Exact VRAM Capacity Formula in Gigabytes
export function calculateRequiredVRAM(
  paramCountBillions: number, // e.g. 70 for 70B model
  bitsPerWeight: 16 | 8 | 4,   // FP16, INT8/FP8, INT4 (AWQ/GPTQ)
  maxContextLength: number,    // e.g. 8192
  batchSize: number = 4
): { weightVRAM_GB: number; kvCacheVRAM_GB: number; totalRecommended_GB: number } {
  // 1. Model Weights: (Params * bits) / 8 / 1e9
  const weightVRAM_GB = (paramCountBillions * (bitsPerWeight / 8));

  // 2. KV Cache for Llama-3-70B (80 layers, 8 KV heads, 128 head_dim, FP16 2 bytes)
  const numLayers = 80;
  const kvHeads = 8;
  const headDim = 128;
  const kvCacheBytesPerToken = 2 * numLayers * kvHeads * headDim * 2; // ~327,680 bytes/token
  const kvCacheVRAM_GB = (kvCacheBytesPerToken * maxContextLength * batchSize) / (1024 * 1024 * 1024);

  // 3. Add 20% buffer for CUDA kernels & activation workspace
  const totalRecommended_GB = (weightVRAM_GB + kvCacheVRAM_GB) * 1.2;

  return {
    weightVRAM_GB: Math.round(weightVRAM_GB * 10) / 10,
    kvCacheVRAM_GB: Math.round(kvCacheVRAM_GB * 10) / 10,
    totalRecommended_GB: Math.round(totalRecommended_GB * 10) / 10
  };
}`
      },
      secondaryCodeSnippet: {
        title: 'Running 4-bit AWQ Model with vLLM in Production Docker Container',
        language: 'text',
        code: `# Launch vLLM with AWQ 4-bit Quantization on a single 24GB RTX 3090 / 4090 GPU
vllm serve casperhansen/llama-3-8b-instruct-awq \\
  --quantization awq \\
  --dtype auto \\
  --gpu-memory-utilization 0.95 \\
  --max-model-len 8192 \\
  --port 8000`
      },
      proTipOrPitfall: 'For enterprise GPU infrastructure on modern hardware (NVIDIA L4, H100, H200), prefer FP8 quantization over INT4. FP8 is natively supported in TensorRT-LLM and vLLM with zero quantization compilation time and identical accuracy to FP16.',
      studyResources: [
        {
          title: 'AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration (Lin et al.)',
          url: 'https://arxiv.org/abs/2306.00978',
          source: 'MIT & arXiv',
          description: 'Research paper detailing how activation outlier awareness preserves LLM reasoning capabilities.'
        }
      ]
    }
  }
];
