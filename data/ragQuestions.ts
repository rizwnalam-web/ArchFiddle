import { InterviewQuestion } from './interviewPrepData';

export const TOP_20_RAG: InterviewQuestion[] = [
  {
    id: 'rag-01',
    category: 'RAG (Retrieval-Augmented Generation)',
    question: '1. What are the key architectural differences between Naive RAG, Advanced RAG, and Modular RAG pipelines, and what failure modes does each address?',
    difficulty: 'Staff / Lead Architect',
    tags: ['RAG', 'Architecture', 'Advanced RAG', 'Modular RAG', 'AI', 'Retrieval'],
    shortSummary: 'Compares simple Vector-Store lookup with multi-stage pipelines (Pre-Retrieval query rewriting, Hybrid Search, Post-Retrieval Cross-Encoder re-ranking, and Router/Judge modules).',
    detailedAnswer: {
      executiveSummary: 'Naive RAG follows a simple "Chunk -> Embed -> Vector Search -> Prompt LLM" sequence, which suffers from low precision, out-of-context chunks, semantic drift, and hallucination. Advanced RAG introduces Pre-Retrieval (query expansion, HyDE), Hybrid Retrieval (BM25 + Dense Vectors), and Post-Retrieval (Cross-Encoder re-ranking, contextual compression). Modular RAG decouples pipelines into dynamic routing graphs with specialized modules (Query Rewriter, Retriever, Reader, Reflection Judge, and Fallback Web Search).',
      keyPoints: [
        'Naive RAG Bottlenecks: Fixed-size chunking splits semantic ideas in half; pure vector search fails on exact keywords/part numbers; LLM suffers from "Lost in the Middle" attention degradation.',
        'Advanced RAG (Pre-Retrieval): Query transformation (Sub-queries, Step-Back, HyDE) converts messy user questions into optimal retrieval queries.',
        'Advanced RAG (Post-Retrieval): Re-ranking models re-score the top 50 retrieved chunks to pass only the top 5 most relevant chunks to the LLM context window.',
        'Modular RAG: Implemented via state machines (e.g. LangGraph) allowing dynamic iteration, source validation, and conditional human-in-the-loop escalation.'
      ],
      codeOrQuerySnippet: {
        title: 'Modular Advanced RAG Pipeline with Query Rewriting & Re-ranking (TypeScript)',
        language: 'typescript',
        code: `import { ChatOpenAI } from "@langchain/openai";
import { ScoreEvaluator } from "./ragEvaluator";

export async function executeModularRAGPipeline(userQuery: string, vectorStore: any, reranker: any) {
  const llm = new ChatOpenAI({ modelName: "gpt-4o", temperature: 0.1 });

  // 1. Pre-Retrieval: Query Transformation / Expansion
  const expandedQueries = await generateSubQueries(userQuery, llm);
  
  // 2. Hybrid Retrieval: Fetch candidates across sparse BM25 + dense vector store
  const rawCandidates = await Promise.all(
    expandedQueries.map(q => vectorStore.similaritySearch(q, { k: 25 }))
  );
  const flattenedChunks = deduplicateChunks(rawCandidates.flat());

  // 3. Post-Retrieval: Cross-Encoder Re-Ranking
  const scoredChunks = await reranker.rerank({
    query: userQuery,
    documents: flattenedChunks,
    topN: 5 // Pass only top 5 highest relevance chunks to LLM
  });

  // 4. Generation with Strict Citation & Grounding Prompt
  const contextText = scoredChunks.map((c, i) => \`[Doc \${i+1}]: \${c.pageContent}\`).join('\\n\\n');
  const response = await llm.invoke([
    { role: "system", content: "You are a factual enterprise assistant. Answer ONLY using the provided context docs. Include [Doc X] citations." },
    { role: "user", content: \`Context:\\n\${contextText}\\n\\nQuestion: \${userQuery}\` }
  ]);

  return { answer: response.content, citations: scoredChunks };
}`
      },
      proTipOrPitfall: 'Never pass more than 10-15 raw unranked vector search results directly to an LLM. Cross-Encoder re-ranking before context insertion is the single highest-ROI optimization for reducing RAG hallucination and cutting LLM token costs.',
      studyResources: [
        {
          title: 'Retrieval-Augmented Generation for Large Language Models: A Survey',
          url: 'https://arxiv.org/abs/2312.10997',
          source: 'arXiv Research Paper',
          description: 'Comprehensive academic breakdown of Naive, Advanced, and Modular RAG architectures.'
        }
      ]
    }
  },
  {
    id: 'rag-02',
    category: 'RAG (Retrieval-Augmented Generation)',
    question: '2. How do Hybrid Search (Sparse BM25 + Dense Embeddings) and Reciprocal Rank Fusion (RRF) solve the vocabulary mismatch problem in RAG?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['RAG', 'Hybrid Search', 'BM25', 'Embeddings', 'RRF', 'Reciprocal Rank Fusion'],
    shortSummary: 'Explains combining exact lexical token matching (BM25/SPLADE) with semantic dense vector similarity, fused via RRF score normalization.',
    detailedAnswer: {
      executiveSummary: 'Dense vector embeddings excel at capturing conceptual meaning and synonyms but often fail on exact keyword lookups, SKU numbers, acronyms, and rare proper nouns. Sparse lexical search (BM25 or SPLADE) matches exact term frequency. Hybrid Search executes both retrieval strategies in parallel and combines the ranked result lists using Reciprocal Rank Fusion (RRF), scoring documents by `RRF_Score(d) = \\sum \\frac{1}{k + rank_i(d)}` (typically k=60).',
      keyPoints: [
        'Why Dense Only Fails: Vector embeddings compress text into a fixed vector (e.g. 1536 dims). Exact serial numbers (e.g. "ERR-9021-X") get blurred into generic "error message" vector space.',
        'Why BM25 Only Fails: Cannot understand synonyms (e.g. "physician" vs "doctor" or "mortgage rate reduction" vs "refinancing").',
        'RRF Formula: RRF does not require calibrating or normalizing raw vector cosine scores against raw BM25 scores; it operates purely on ordinal ranks.',
        'Production Deployment: Supported natively in PostgreSQL (pgvector + tsvector), Azure AI Search, Pinecone, and Qdrant.'
      ],
      codeOrQuerySnippet: {
        title: 'Reciprocal Rank Fusion (RRF) Algorithm Implementation (TypeScript)',
        language: 'typescript',
        code: `export interface SearchResultItem {
  id: string;
  content: string;
  score?: number;
}

export function reciprocalRankFusion(
  denseRankedList: SearchResultItem[],
  sparseRankedList: SearchResultItem[],
  kConstant: number = 60,
  topN: number = 5
): SearchResultItem[] {
  const rrfScores = new Map<string, { item: SearchResultItem; score: number }>();

  // 1. Process Dense Vector Results
  denseRankedList.forEach((item, rank) => {
    const current = rrfScores.get(item.id) || { item, score: 0 };
    current.score += 1.0 / (kConstant + (rank + 1));
    rrfScores.set(item.id, current);
  });

  // 2. Process Sparse BM25 Results
  sparseRankedList.forEach((item, rank) => {
    const current = rrfScores.get(item.id) || { item, score: 0 };
    current.score += 1.0 / (kConstant + (rank + 1));
    rrfScores.set(item.id, current);
  });

  // 3. Sort by aggregated RRF score descending
  const sorted = Array.from(rrfScores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(entry => ({
      ...entry.item,
      score: entry.score
    }));

  return sorted;
}`
      },
      proTipOrPitfall: 'Set `k = 60` in the RRF formula. Empirical research across information retrieval benchmarks shows that `k=60` balances top-ranked high-confidence matches against longer-tail relevant documents.'
    }
  },
  {
    id: 'rag-03',
    category: 'RAG (Retrieval-Augmented Generation)',
    question: '3. What are the best Chunking Strategies in enterprise RAG (Semantic Chunking, Parent Document Retriever, Markdown/Structure-Aware), and how do you choose?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['RAG', 'Chunking', 'Parent Document', 'Semantic Chunking', 'Embeddings'],
    shortSummary: 'Compares fixed token slicing with Semantic Chunking (cosine distance break-points) and Small-to-Big Parent Document retrieval.',
    detailedAnswer: {
      executiveSummary: 'Naive fixed-size chunking (e.g. 500 characters with 50 character overlap) frequently cuts sentences mid-thought, destroying semantic meaning. Advanced chunking strategies include: 1) Semantic Chunking (calculates cosine distances between consecutive sentences and splits when distance spikes), 2) Parent Document / Small-to-Big Retrieval (indexes small 100-token child chunks for precision vector matching, but returns the 1000-token parent document to the LLM for rich context), and 3) Document Structure Chunking (splits by Markdown headers, HTML sections, or JSON trees).',
      keyPoints: [
        'Fixed vs Semantic: Fixed chunking is fast but blind; Semantic Chunking preserves coherent paragraphs and topic boundaries.',
        'Parent Document Retriever (Small-to-Big): Small chunks are optimal for vector similarity search (less noise in vector representation), while large chunks provide the LLM with complete surrounding context.',
        'Table & Structured Data: Never split tables with generic text splitters; serialize tables into Markdown/JSON with explicit column header context per row.',
        'Chunk Overlap: Set 10-20% overlap in text splitters to prevent contextual fragmentation across chunk boundaries.'
      ],
      codeOrQuerySnippet: {
        title: 'Parent Document Retriever (Small-to-Big) Architecture (TypeScript)',
        language: 'typescript',
        code: `export interface ParentDocument {
  parentId: string;
  fullContent: string;
  childChunks: { childId: string; chunkText: string; embedding: number[] }[];
}

export class ParentDocumentRetriever {
  private parentDocStore = new Map<string, string>(); // Key: parentId -> fullContent
  private vectorIndex: Array<{ childId: string; parentId: string; embedding: number[] }> = [];

  // Indexing phase: Slice document into small child chunks for vector precision
  async indexDocument(docId: string, fullText: string, embeddingModel: any) {
    this.parentDocStore.set(docId, fullText);
    const smallChunks = splitIntoSmallSentenceChunks(fullText, 120); // 120 tokens each

    for (const chunk of smallChunks) {
      const vector = await embeddingModel.embedQuery(chunk.text);
      this.vectorIndex.push({
        childId: chunk.id,
        parentId: docId,
        embedding: vector
      });
    }
  }

  // Retrieval phase: Search child vectors, but return the FULL parent document
  async retrieveContext(queryVector: number[], topKParents = 2): Promise<string[]> {
    const matchedChildren = searchNearestNeighbors(this.vectorIndex, queryVector, 10);
    const uniqueParentIds = Array.from(new Set(matchedChildren.map(c => c.parentId))).slice(0, topKParents);
    
    // Return full parent document for complete contextual understanding
    return uniqueParentIds.map(pId => this.parentDocStore.get(pId) || '');
  }
}`
      },
      proTipOrPitfall: 'When chunking PDFs with legal or financial contracts, always prepend metadata (Document Title, Section Title, Effective Date) to every individual chunk before embedding to anchor the chunk\'s semantic vector.'
    }
  },
  {
    id: 'rag-04',
    category: 'RAG (Retrieval-Augmented Generation)',
    question: '4. How do Query Transformation techniques (HyDE, Step-Back Prompting, Sub-Question Decomposition) improve retrieval accuracy for complex queries?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['RAG', 'Query Transformation', 'HyDE', 'Sub-Questions', 'Multi-Query'],
    shortSummary: 'Covers Hypothetical Document Embeddings (HyDE), abstract Step-Back retrieval, and decomposing multi-hop questions into parallel sub-searches.',
    detailedAnswer: {
      executiveSummary: 'Raw user questions often have poor semantic alignment with document passages (e.g. a question is a short query, while the answer is a detailed factual paragraph). Query Transformation techniques bridge this gap: 1) HyDE (Hypothetical Document Embeddings) prompts an LLM to generate a hypothetical answer first and embeds that answer for retrieval, 2) Step-Back Prompting derives high-level concepts for broader context, and 3) Sub-Question Decomposition breaks multi-hop queries into independent parallel search vectors.',
      keyPoints: [
        'HyDE Mechanics: A hypothetical answer—even if factually imperfect—shares the same vector space and vocabulary distribution as real corpus documents.',
        'Multi-Hop Problem: "How do conventional mortgage reserve requirements in 2026 compare to FHA guidelines?" requires two separate searches.',
        'Sub-Question Decomposition: Deconstructs the question into Query A (Conventional reserves) and Query B (FHA reserves), merging the retrieved contexts.',
        'Step-Back Prompting: Generates a higher-level abstract question (e.g. "What are standard debt-to-income underwriting thresholds?") to fetch foundational principles.'
      ],
      codeOrQuerySnippet: {
        title: 'Hypothetical Document Embeddings (HyDE) Query Transformer (TypeScript)',
        language: 'typescript',
        code: `import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";

export async function retrieveWithHyDE(userQuery: string, vectorStore: any) {
  const llm = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0.3 });
  const embeddings = new OpenAIEmbeddings({ modelName: "text-embedding-3-small" });

  // 1. Generate a hypothetical passage that answers the question
  const hydePrompt = \`Please write a detailed, authoritative financial paragraph answering this question:
Question: "\${userQuery}"
Hypothetical Passage:\`;

  const hypotheticalDoc = await llm.invoke(hydePrompt);
  console.log("Generated HyDE Passage:", hypotheticalDoc.content);

  // 2. Embed the HYPOTHETICAL PASSAGE (not the raw question!)
  const hydeVector = await embeddings.embedQuery(hypotheticalDoc.content as string);

  // 3. Search the vector store using the hypothetical document vector
  const relevantDocs = await vectorStore.similaritySearchVectorWithScore(hydeVector, 5);
  return relevantDocs;
}`
      },
      proTipOrPitfall: 'Do not use HyDE for open-ended or highly specialized queries where the LLM has zero pre-trained background knowledge, as the hallucinated hypothetical passage will pull the vector search into an irrelevant vector cluster.'
    }
  },
  {
    id: 'rag-05',
    category: 'RAG (Retrieval-Augmented Generation)',
    question: '5. How do you evaluate and benchmark enterprise RAG systems using the RAG Triad and frameworks like Ragas and TruLens (Faithfulness, Answer Relevance, Context Precision)?',
    difficulty: 'Staff / Lead Architect',
    tags: ['RAG', 'Evaluation', 'Ragas', 'TruLens', 'Faithfulness', 'Benchmarks', 'LLM-as-a-Judge'],
    shortSummary: 'Explains automated evaluation metrics: Faithfulness (Groundedness), Answer Relevance, Context Recall, Context Precision, and Synthetic Testsets.',
    detailedAnswer: {
      executiveSummary: 'Evaluating RAG without human annotators relies on the "RAG Triad" and LLM-as-a-Judge frameworks like Ragas and TruLens. The triad evaluates three critical dimensions: 1) Context Precision & Recall (did retrieval fetch the right chunks without noise?), 2) Faithfulness / Groundedness (is the answer mathematically derived strictly from the context, or did the LLM hallucinate?), and 3) Answer Relevance (does the answer directly address the user\'s original query without irrelevant filler?).',
      keyPoints: [
        'Faithfulness Metric: Claims in the generated answer are parsed into atomic statements and verified against the retrieved context (Score = Verified Statements / Total Statements).',
        'Answer Relevance: Generates potential questions from the answer and measures cosine embedding similarity against the user\'s real query.',
        'Context Precision: Measures whether relevant chunks are ranked at top positions (Mean Reciprocal Rank / NDCG).',
        'Synthetic Test Generation: Ragas generates hundreds of question-context-groundtruth test pairs from raw documents to run regression testing in CI/CD pipelines.'
      ],
      codeOrQuerySnippet: {
        title: 'Automated Faithfulness & Groundedness Evaluator (TypeScript)',
        language: 'typescript',
        code: `export interface RAGEvalResult {
  faithfulnessScore: number;
  unsupportedClaims: string[];
  isGrounded: boolean;
}

export async function evaluateFaithfulness(context: string, answer: string, judgeLLM: any): Promise<RAGEvalResult> {
  const evalPrompt = \`You are an expert AI evaluator measuring RAG Groundedness.
Task:
1. Break the GENERATED ANSWER into individual factual claims.
2. For each claim, determine if it is directly supported by the PROVIDED CONTEXT.

CONTEXT:
\${context}

GENERATED ANSWER:
\${answer}

Respond in strict JSON:
{
  "totalClaims": number,
  "supportedClaims": number,
  "unsupportedClaims": ["list of hallucinated or unverified claims"],
  "faithfulnessScore": number (0.0 to 1.0)
}\`;

  const response = await judgeLLM.invoke(evalPrompt);
  const result = JSON.parse(response.content);
  
  return {
    faithfulnessScore: result.faithfulnessScore,
    unsupportedClaims: result.unsupportedClaims,
    isGrounded: result.faithfulnessScore >= 0.90
  };
}`
      },
      proTipOrPitfall: 'Set automated Faithfulness validation in production pipelines. If `faithfulnessScore < 0.85`, trigger an automatic retry with higher temperature penalty or return a safe fallback: "I could not verify this answer in the source documentation."'
    }
  },
  {
    id: 'rag-06',
    category: 'RAG (Retrieval-Augmented Generation)',
    question: '6. What is GraphRAG (Knowledge Graph Augmented Generation), how does it use entity extraction and Leiden community clustering, and when is it superior to Vector RAG?',
    difficulty: 'Staff / Lead Architect',
    tags: ['RAG', 'GraphRAG', 'Knowledge Graphs', 'Community Detection', 'Microsoft GraphRAG'],
    shortSummary: 'Explains Microsoft GraphRAG, entity-relationship graphs, hierarchical community summarization, and answering global "sensemaking" questions.',
    detailedAnswer: {
      executiveSummary: 'Vector RAG struggles with global dataset questions (e.g. "What are the main themes across all 5,000 regulatory audit reports?"), because vector search only retrieves isolated local chunks. Microsoft GraphRAG extracts entities, relationships, and claims using an LLM to build a Knowledge Graph. It then applies the Leiden community detection algorithm to partition the graph into hierarchical clusters and pre-generates community summaries at multiple abstraction levels.',
      keyPoints: [
        'Local vs Global Search: Vector RAG excels at localized lookups ("What is the interest rate for Loan #42?"); GraphRAG excels at holistic dataset summarization ("What are the top compliance risks?").',
        'Entity & Edge Extraction: LLM parses raw text into a graph of nodes (People, Organizations, Concepts) and edges (Relationships).',
        'Leiden Clustering: Groups tightly connected entity subgraphs into community clusters (from macro-level themes to micro-level details).',
        'Hierarchical Summarization: Community summaries allow the LLM to answer complex multi-document reasoning questions without reading all raw chunks into memory.'
      ],
      codeOrQuerySnippet: {
        title: 'Knowledge Graph Triplet Extraction for GraphRAG (TypeScript)',
        language: 'typescript',
        code: `export interface GraphTriplet {
  sourceEntity: string;
  sourceType: string;
  relationship: string;
  targetEntity: string;
  targetType: string;
  evidenceSnippet: string;
}

export async function extractKnowledgeGraphTriplets(textChunk: string, llm: any): Promise<GraphTriplet[]> {
  const prompt = \`Extract all key entities and explicit relationships from the text below.
Format response as a JSON array of triplets.

Text:
\${textChunk}

JSON Structure:
[
  {
    "sourceEntity": "Fannie Mae",
    "sourceType": "ORGANIZATION",
    "relationship": "MANDATES_MAX_DTI",
    "targetEntity": "45 Percent",
    "targetType": "REGULATORY_THRESHOLD",
    "evidenceSnippet": "Fannie Mae mandates a maximum DTI of 45% for conventional loans."
  }
]\`;

  const response = await llm.invoke(prompt);
  return JSON.parse(response.content);
}`
      },
      proTipOrPitfall: 'GraphRAG has significantly higher upfront indexing costs (thousands of LLM extraction calls) compared to standard vector embedding models. Use GraphRAG when users need high-level synthesis, comparative analysis, and relationship traversals across vast corpora.'
    }
  }
];
