import { InterviewQuestion } from './interviewPrepData';

export const TOP_20_SNOWFLAKE: InterviewQuestion[] = [
  {
    id: 'snw-01',
    category: 'Snowflake',
    question: '1. How does Snowflake\'s multi-cluster shared-data architecture decouple Storage, Compute (Virtual Warehouses), and Cloud Services, and what are the performance implications?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Snowflake', 'Architecture', 'Virtual Warehouses', 'Storage', 'Cloud Services'],
    shortSummary: 'Explains the 3-tier decoupled architecture: Centralized Storage (S3/GCS/Azure Blob), Multi-Cluster Compute Warehouses, and Global Cloud Services.',
    detailedAnswer: {
      executiveSummary: 'Snowflake separates compute from storage into three independent layers. Centralized Storage stores micro-partitioned columnar data in cloud blob storage. The Compute layer executes queries via independent Virtual Warehouses without resource contention. The Cloud Services layer orchestrates transactions, security, metadata, query parsing, and access control.',
      keyPoints: [
        'Centralized Storage: Data is encrypted, compressed in proprietary micro-partition columnar format, and accessible across all compute warehouses simultaneously.',
        'Independent Virtual Warehouses: Multiple compute clusters (T-shirt sizes X-Small to 6X-Large) read the same raw data concurrently with zero read/write locking contention.',
        'Cloud Services Layer: Manages ACID metadata, authentication, query optimization, Time Travel catalogues, and access control rules.',
        'Zero Concurrency Contention: Analytical ETL jobs and operational BI dashboards run on distinct virtual warehouses without stealing CPU/RAM from each other.'
      ],
      codeOrQuerySnippet: {
        title: 'Provisioning Dedicated Compute Warehouses for Isolation (SQL)',
        language: 'sql',
        code: `-- Dedicated Multi-Cluster Warehouse for High-Throughput BI Dashboards
CREATE OR REPLACE WAREHOUSE bi_reporting_wh
  WITH WAREHOUSE_SIZE = 'MEDIUM'
  AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE
  MIN_CLUSTER_COUNT = 1
  MAX_CLUSTER_COUNT = 5
  SCALING_POLICY = 'STANDARD'
  COMMENT = 'Elastic scaling warehouse for enterprise BI queries';

-- Dedicated Warehouse for Heavy Nightly ETL Pipelines
CREATE OR REPLACE WAREHOUSE etl_batch_wh
  WITH WAREHOUSE_SIZE = 'X-LARGE'
  AUTO_SUSPEND = 120
  AUTO_RESUME = TRUE
  WAREHOUSE_TYPE = 'STANDARD'
  COMMENT = 'Isolated compute for heavy data transformation';`
      },
      secondaryCodeSnippet: {
        title: 'Querying Metadata from Cloud Services Layer without Compute Cost',
        language: 'sql',
        code: `-- Metadata queries execute exclusively in Cloud Services layer (0 Warehouse Credit Cost)
SELECT 
    table_schema, 
    table_name, 
    row_count, 
    bytes / (1024*1024*1024) AS size_gb
FROM snowflake.account_usage.tables
WHERE deleted IS NULL
ORDER BY bytes DESC;`
      },
      proTipOrPitfall: 'Queries that operate purely on metadata (such as `SELECT COUNT(*) FROM table` or `SELECT MIN(col), MAX(col)`) resolve instantly inside the Cloud Services layer without spinning up warehouse credits.',
      studyResources: [
        {
          title: 'Snowflake Architecture Overview & Multi-Cluster Shared Data',
          url: 'https://docs.snowflake.com/en/user-guide/intro-key-concepts',
          source: 'Snowflake Documentation',
          description: 'Official deep dive on Storage, Virtual Warehouses, and Cloud Services.'
        }
      ]
    }
  },
  {
    id: 'snw-02',
    category: 'Snowflake',
    question: '2. How do Micro-partitions and Clustering Keys work in Snowflake, and when should you define an explicit Clustering Key over Automatic Clustering?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Snowflake', 'Micro-partitions', 'Clustering Keys', 'Pruning', 'Performance'],
    shortSummary: 'Covers 50-500MB immutable micro-partitions, min/max metadata pruning, clustering depth, and maintenance cost tradeoffs.',
    detailedAnswer: {
      executiveSummary: 'Snowflake automatically divides all tables into immutable, columnar micro-partitions (50MB to 500MB uncompressed). For every micro-partition, Snowflake records statistical metadata (Min/Max values, null counts). During queries, the query optimizer performs "Partition Pruning" to skip irrelevant micro-partitions. An explicit Clustering Key is recommended for multi-terabyte tables queried heavily on specific predicate columns.',
      keyPoints: [
        'Natural Ingestion Order: By default, tables are naturally clustered by insertion timestamp.',
        'Partition Pruning: The optimizer evaluates WHERE clauses against micro-partition min/max metadata to bypass reading unneeded disk blocks.',
        'Clustering Depth: Measures the number of overlapping micro-partitions for given column keys (lower depth = better pruning).',
        'Automatic Clustering: Snowflake continuously reclusters tables in background serverless compute, incurring credit consumption.'
      ],
      codeOrQuerySnippet: {
        title: 'Evaluating Clustering Quality & Defining Clustering Key (SQL)',
        language: 'sql',
        code: `-- Evaluate current clustering depth & partition overlap
SELECT SYSTEM$CLUSTERING_INFORMATION('MORTGAGE_DB.PUBLIC.LOAN_TRANSACTIONS', '(BORROWER_STATE, TRANSACTION_DATE)');

-- Alter table to define explicit multi-column clustering key
ALTER TABLE MORTGAGE_DB.PUBLIC.LOAN_TRANSACTIONS 
  CLUSTER BY (BORROWER_STATE, TRANSACTION_DATE);

-- Suspend auto-clustering during heavy batch loads to save credit burn
ALTER TABLE MORTGAGE_DB.PUBLIC.LOAN_TRANSACTIONS SUSPEND RECLUSTER;`
      },
      proTipOrPitfall: 'Never define clustering keys on tables under 1TB or high-cardinality unique columns (e.g. UUID/TransactionID). Choose columns with medium cardinality that are frequently filtered in WHERE or JOIN clauses.'
    }
  },
  {
    id: 'snw-03',
    category: 'Snowflake',
    question: '3. How do Time Travel, Fail-Safe, and Zero-Copy Cloning operate under the hood in Snowflake, and how do they impact storage costs?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Snowflake', 'Time Travel', 'Zero-Copy Clone', 'Fail-Safe', 'Storage'],
    shortSummary: 'Explains immutable micro-partition pointers, AT/BEFORE historical queries, 1-90 day Time Travel, 7-day Fail-Safe, and clone metadata.',
    detailedAnswer: {
      executiveSummary: 'Because micro-partitions are immutable, DML updates/deletes write new micro-partitions and preserve historical versions. Time Travel allows querying historical data up to 90 days (Enterprise Edition) using AT or BEFORE clauses. Fail-Safe provides a 7-day non-configurable disaster recovery window managed by Snowflake Support. Zero-Copy Cloning creates instantaneous new metadata references to existing micro-partitions without copying raw storage.',
      keyPoints: [
        'Zero-Copy Clone Mechanics: `CREATE TABLE clone_tbl CLONE source_tbl` duplicates only metadata pointers in the Cloud Services catalogue; 0 initial storage cost.',
        'Copy-on-Write: Storage costs accrue only when subsequent mutations (INSERT, UPDATE, DELETE) create new micro-partitions in the cloned table.',
        'Time Travel Retention: Transient/Temporary tables support 0-1 day; Permanent tables support 0-90 days of retention.',
        'Fail-Safe: After Time Travel expires, data moves to 7-day Fail-Safe (incurring standard storage cost) accessible only by Snowflake engineering for disaster recovery.'
      ],
      codeOrQuerySnippet: {
        title: 'Time Travel Historical Recovery & Zero-Copy Cloning (SQL)',
        language: 'sql',
        code: `-- Query table as it existed exactly 2 hours ago
SELECT * FROM MORTGAGE_APPLICATIONS
  AT(OFFSET => -60*120);

-- Restore accidentally dropped table instantly from Time Travel
UNDROP TABLE MORTGAGE_APPLICATIONS;

-- Query before a specific bad query execution ID
SELECT * FROM LOAN_RATES
  BEFORE(STATEMENT => '01b56789-0001-2345-0000-abcd00012345');

-- Create full Zero-Copy Clone of Production Database for Staging QA
CREATE DATABASE STAGING_QA CLONE PRODUCTION_MORTGAGE_DB;`
      },
      proTipOrPitfall: 'Use TRANSIENT tables for staging / ETL intermediate tables. Transient tables have 0 or 1-day Time Travel and NO Fail-Safe, preventing heavy 7-day storage cost buildup on temporary data.'
    }
  },
  {
    id: 'snw-04',
    category: 'Snowflake',
    question: '4. What is Snowpipe vs Snowpipe Streaming, and how do you design continuous event-driven micro-batch ingestion from AWS S3 or Azure Blob?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Snowflake', 'Snowpipe', 'Snowpipe Streaming', 'S3', 'Streaming Ingestion'],
    shortSummary: 'Compares Serverless Snowpipe (SQS/EventGrid notifications) with Snowpipe Streaming Java SDK (row-level direct ingestion).',
    detailedAnswer: {
      executiveSummary: 'Snowpipe is a serverless continuous ingestion service that loads data as files arrive in cloud stages via SQS/EventGrid notifications and auto-ingest pipes. Snowpipe Streaming uses the Snowflake Ingestion SDK to stream row-level records directly into Snowflake tables with sub-second latencies without writing intermediate stage files.',
      keyPoints: [
        'Snowpipe Auto-Ingest: S3 bucket event notifications send messages to Snowflake SQS queue, triggering serverless COPY INTO commands.',
        'Idempotency & Deduplication: Snowpipe tracks load history for 14 days, preventing duplicate file loads automatically.',
        'Snowpipe Streaming SDK: Lowers latency from minutes to milliseconds by streaming raw byte payloads directly into table micro-partitions via gRPC.',
        'Cost Efficiency: Snowpipe uses serverless compute charged per-second based on actual file parsing volume rather than keeping a Virtual Warehouse running 24/7.'
      ],
      codeOrQuerySnippet: {
        title: 'Configuring Continuous Auto-Ingest Snowpipe (SQL)',
        language: 'sql',
        code: `-- 1. External Cloud Storage Integration & Stage
CREATE OR REPLACE STAGE s3_mortgage_landing_stage
  URL = 's3://enterprise-mortgage-lake/incoming/'
  STORAGE_INTEGRATION = s3_azure_integration
  FILE_FORMAT = (TYPE = 'PARQUET');

-- 2. Create Snowpipe with Auto Ingest Enabled
CREATE OR REPLACE PIPE raw_mortgage_pipe
  AUTO_INGEST = TRUE
  COMMENT = 'Automated event-driven Snowpipe ingestion'
AS
  COPY INTO raw_db.public.mortgage_events
  FROM @s3_mortgage_landing_stage
  MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE
  ON_ERROR = 'CONTINUE';

-- Inspect Pipe Status & SQS ARN for Cloud Notification Setup
SELECT SYSTEM$PIPE_STATUS('raw_mortgage_pipe');`
      },
      proTipOrPitfall: 'For optimal Snowpipe throughput and cost, aggregate incoming streaming data into files sized between 100MB and 250MB. Millions of tiny 1KB files cause severe metadata overhead and higher Snowpipe credit fees.'
    }
  },
  {
    id: 'snw-05',
    category: 'Snowflake',
    question: '5. How do Snowflake Streams and Tasks implement Change Data Capture (CDC) and automated asynchronous transformation DAGs?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Snowflake', 'Streams', 'Tasks', 'CDC', 'DAG', 'Pipelines'],
    shortSummary: 'Covers standard/append-only streams, METADATA$ACTION, METADATA$ISUPDATE, Task dependencies (AFTER), and CRON schedules.',
    detailedAnswer: {
      executiveSummary: 'Snowflake Streams track Change Data Capture (CDC) on tables, recording row insertions, updates, and deletions along with metadata columns (`METADATA$ACTION`, `METADATA$ISUPDATE`, `METADATA$ROW_ID`). Snowflake Tasks execute SQL statements on a schedule or trigger when dependent tasks complete (forming a DAG). Combining Streams and Tasks provides automated, serverless event-driven ETL pipelines.',
      keyPoints: [
        'Standard Stream vs Append-Only: Standard tracks all INSERTs, UPDATEs, and DELETEs; Append-only tracks only INSERTs for write-heavy audit logs.',
        'Transactional Offset Advance: When a stream is consumed inside a DML transaction (`INSERT INTO target SELECT ... FROM stream`), the stream offset advances ONLY if the transaction commits.',
        'Task Tree DAG: Use `AFTER predecessor_task` to build dependent execution graphs.',
        'Stream Has Data Guard: Use `WHEN SYSTEM$STREAM_HAS_DATA(\'my_stream\')` in task definitions to prevent empty task runs and save credits.'
      ],
      codeOrQuerySnippet: {
        title: 'CDC Pipeline with Stream, Task DAG & Stream Verification (SQL)',
        language: 'sql',
        code: `-- 1. Create Stream to capture mutations on source table
CREATE OR REPLACE STREAM raw_loans_stream ON TABLE raw_db.public.loans;

-- 2. Root Task that executes on CRON schedule ONLY when stream contains changes
CREATE OR REPLACE TASK process_loan_cdc_task
  WAREHOUSE = etl_batch_wh
  SCHEDULE = 'USING CRON */5 * * * * UTC'
  WHEN SYSTEM$STREAM_HAS_DATA('raw_loans_stream')
AS
MERGE INTO dwh_db.public.dim_loans target
USING raw_loans_stream src
ON target.loan_id = src.loan_id
WHEN MATCHED AND src.METADATA$ACTION = 'DELETE' AND src.METADATA$ISUPDATE = FALSE THEN
  DELETE
WHEN MATCHED AND src.METADATA$ACTION = 'INSERT' AND src.METADATA$ISUPDATE = TRUE THEN
  UPDATE SET target.amount = src.amount, target.status = src.status, target.updated_at = CURRENT_TIMESTAMP()
WHEN NOT MATCHED AND src.METADATA$ACTION = 'INSERT' AND src.METADATA$ISUPDATE = FALSE THEN
  INSERT (loan_id, amount, status, created_at) VALUES (src.loan_id, src.amount, src.status, CURRENT_TIMESTAMP());

-- Resume task (Tasks are created in SUSPENDED state by default)
ALTER TASK process_loan_cdc_task RESUME;`
      },
      proTipOrPitfall: 'Always check that the database/schema containing the task has `TASK_AUTO_RETRY_ATTEMPTS` configured and verify that tasks are resumed, as newly created tasks start in SUSPENDED status.'
    }
  },
  {
    id: 'snw-06',
    category: 'Snowflake',
    question: '6. How does Snowflake query semi-structured data (JSON, Avro, Parquet, XML) using the VARIANT data type, FLATTEN, and LATERAL joins?',
    difficulty: 'Mid-Level (3-5 YOE)',
    tags: ['Snowflake', 'VARIANT', 'JSON', 'FLATTEN', 'LATERAL', 'Semi-Structured'],
    shortSummary: 'Explains colon path traversal, casting operators, FLATTEN table functions, and automatic sub-column columnar storage.',
    detailedAnswer: {
      executiveSummary: 'Snowflake stores semi-structured data in the native `VARIANT` data type (up to 16MB per row). Snowflake automatically extracts sub-fields into columnar format under the hood, providing relational performance on raw JSON. Developers query nested attributes using colon syntax (`v:applicant.address.state`) and explode arrays into rows using `LATERAL FLATTEN()`.',
      keyPoints: [
        'Dot/Colon Notation: `raw_payload:user.profile.age::INT` navigates nested JSON objects and casts to explicit SQL types.',
        'FLATTEN Function: Explodes nested arrays or objects into relational rows with `VALUE`, `INDEX`, and `KEY` columns.',
        'Schema on Read: Allows ingesting fluctuating IoT, webhook, or event schemas without prior DDL migrations.',
        'Automatic Columnar Optimization: Frequently queried sub-properties in VARIANT columns are stored in separate micro-partition columnar stripes.'
      ],
      codeOrQuerySnippet: {
        title: 'Parsing Nested JSON Payloads with FLATTEN & LATERAL (SQL)',
        language: 'sql',
        code: `-- Ingest raw JSON into VARIANT column
CREATE OR REPLACE TABLE raw_loan_events (
    event_id VARCHAR,
    payload VARIANT,
    ingested_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- Query and unpack nested borrowers array inside loan payload
SELECT 
    r.event_id,
    r.payload:loanNumber::STRING AS loan_number,
    r.payload:loanAmount::DECIMAL(12,2) AS loan_amount,
    b.value:borrowerName::STRING AS borrower_name,
    b.value:creditScore::INT AS credit_score,
    b.value:isPrimary::BOOLEAN AS is_primary_borrower
FROM raw_loan_events r,
LATERAL FLATTEN(input => r.payload:borrowers) b
WHERE r.payload:status::STRING = 'APPROVED';`
      },
      proTipOrPitfall: 'Always cast VARIANT expressions explicitly (e.g. `::STRING` or `::INT`). Without casting, Snowflake returns quoted string representations from JSON objects.'
    }
  },
  {
    id: 'snw-07',
    category: 'Snowflake',
    question: '7. What is Snowflake Cortex AI, and how do built-in LLM functions (COMPLETE, EMBED_TEXT_768, SEARCH_PREVIEW) and VECTOR types enable enterprise AI workflows?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Snowflake', 'Cortex AI', 'LLM', 'Vector Search', 'RAG', 'AI'],
    shortSummary: 'Explains serverless Snowflake Cortex LLMs (Llama 3, Mistral, Claude), text embedding generation, and in-database semantic search.',
    detailedAnswer: {
      executiveSummary: 'Snowflake Cortex AI delivers serverless generative AI and machine learning functions natively inside SQL. It includes `SNOWFLAKE.CORTEX.COMPLETE` for prompt completions, `SNOWFLAKE.CORTEX.EMBED_TEXT_768` for vector embeddings, native `VECTOR(FLOAT, 768)` column types, and `VECTOR_COSINE_SIMILARITY` for in-database RAG semantic retrieval without moving data out of governance boundaries.',
      keyPoints: [
        'Data Governance & Privacy: Queries and prompts processed by Cortex AI never leave the secure Snowflake security boundary or train foundational public models.',
        'Native Vector Data Type: `VECTOR(FLOAT, dim)` supports cosine and L2 distance calculations directly inside SQL queries.',
        'In-Database RAG Pipeline: Vectorize document chunks into Snowflake tables, compute similarity, and synthesize answers using Cortex LLMs in a single SQL CTE.'
      ],
      codeOrQuerySnippet: {
        title: 'In-Database Semantic RAG Pipeline with Snowflake Cortex (SQL)',
        language: 'sql',
        code: `-- 1. Table with Native Vector Embeddings
CREATE OR REPLACE TABLE mortgage_policy_embeddings (
    doc_id VARCHAR,
    chunk_text STRING,
    embedding VECTOR(FLOAT, 768)
);

-- 2. Embed policy chunks using Cortex embedding model
INSERT INTO mortgage_policy_embeddings (doc_id, chunk_text, embedding)
SELECT 
    doc_id,
    chunk_text,
    SNOWFLAKE.CORTEX.EMBED_TEXT_768('e5-base-v2', chunk_text)
FROM raw_policy_documents;

-- 3. Execute Semantic Search + LLM Answer Generation in Single SQL Query
WITH relevant_chunks AS (
    SELECT 
        chunk_text,
        VECTOR_COSINE_SIMILARITY(
            embedding, 
            SNOWFLAKE.CORTEX.EMBED_TEXT_768('e5-base-v2', 'What is maximum DTI for conventional loan?')
        ) AS similarity
    FROM mortgage_policy_embeddings
    ORDER BY similarity DESC
    LIMIT 3
),
aggregated_context AS (
    SELECT LISTAGG(chunk_text, '\n---\n') AS context FROM relevant_chunks
)
SELECT 
    SNOWFLAKE.CORTEX.COMPLETE(
        'llama3.1-70b', 
        CONCAT('Based on this mortgage guideline context:\n', context, '\n\nQuestion: What is maximum DTI for conventional loan? Provide brief answer.')
    ) AS ai_generated_answer
FROM aggregated_context;`
      },
      proTipOrPitfall: 'Snowflake Cortex AI functions run serverless and consume Cortex AI credits. Use smaller models (`llama3.1-8b`, `mistral-7b`) for high-volume classification/extraction and reserve `llama3.1-70b` for complex synthesis.'
    }
  },
  {
    id: 'snw-08',
    category: 'Snowflake',
    question: '8. How do Secure Data Sharing, Reader Accounts, and Clean Rooms work without physical data movement?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Snowflake', 'Data Sharing', 'Clean Rooms', 'Security', 'Reader Accounts'],
    shortSummary: 'Covers SHARES, SECURE VIEWS, grants, cross-region replication, and data privacy without ETL data copies.',
    detailedAnswer: {
      executiveSummary: 'Snowflake Secure Data Sharing allows provider accounts to grant real-time, live read access to database objects for consumer accounts via metadata references in the Cloud Services layer. No data is copied, moved, or transferred over FTP/APIs. The consumer pays for their own compute to query the provider\'s live data.',
      keyPoints: [
        'Metadata Pointers: The consumer account points directly to the provider\'s encrypted micro-partitions in blob storage.',
        'Live Real-time Access: As soon as provider updates data, consumer queries see the updated rows immediately.',
        'Secure Views / UDFs: Prevents consumer users from inspecting internal business logic, formulas, or unshared join tables via query profiles.',
        'Reader Accounts: Allow sharing data with third-party partners or clients who do not have their own Snowflake account; provider funds the reader account compute.'
      ],
      codeOrQuerySnippet: {
        title: 'Creating Secure Share & Granting Consumer Access (SQL)',
        language: 'sql',
        code: `-- 1. Create Share Object
CREATE OR REPLACE SHARE mortgage_underwriting_share;

-- 2. Grant Database & Schema Access
GRANT USAGE ON DATABASE mortgage_dwh TO SHARE mortgage_underwriting_share;
GRANT USAGE ON SCHEMA mortgage_dwh.shared_reporting TO SHARE mortgage_underwriting_share;

-- 3. Create Secure View hiding sensitive PII / SSN
CREATE OR REPLACE SECURE VIEW mortgage_dwh.shared_reporting.vw_anonymized_loans AS
SELECT 
    loan_id, 
    property_state, 
    loan_amount, 
    interest_rate, 
    loan_to_value_ratio
FROM mortgage_dwh.public.loans;

-- 4. Grant Secure View to Share and add Consumer Account ID
GRANT SELECT ON VIEW mortgage_dwh.shared_reporting.vw_anonymized_loans TO SHARE mortgage_underwriting_share;
ALTER SHARE mortgage_underwriting_share ADD ACCOUNTS = xy12345.us-east-1;`
      },
      proTipOrPitfall: 'Always use SECURE VIEWs and SECURE FUNCTIONs when sharing data externally. Non-secure views allow attackers to infer filtered rows through query execution plan statistics and deliberate divide-by-zero error tricks.'
    }
  }
];
