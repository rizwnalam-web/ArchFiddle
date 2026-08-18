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
  Volume2
} from 'lucide-react';
import { useAudioNarration } from '../src/context/AudioNarrationContext';

interface PythonServerlessGuideModalProps {
  onClose: () => void;
  onOpenPlayground?: () => void;
}

interface StepGuide {
  id: string;
  stepNumber: number;
  title: string;
  category: 'tooling' | 'architecture' | 'sdk-solutions' | 'iac' | 'testing' | 'cicd' | 'security';
  badge: string;
  summary: string;
  commands?: { label: string; cmd: string; desc: string }[];
  codeFiles?: { name: string; lang: string; path: string; desc: string; code: string }[];
  keyRules: string[];
  awsServices: string[];
  audioScript: string;
}

export const PythonServerlessGuideModal: React.FC<PythonServerlessGuideModalProps> = ({
  onClose,
  onOpenPlayground
}) => {
  const [activeStepId, setActiveStepId] = useState<string>('step-1-tooling');
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
      id: 'step-1-tooling',
      stepNumber: 1,
      title: 'Python Tooling, Modern Package Management & SDK Setup',
      category: 'tooling',
      badge: 'Tooling & Toolchain',
      summary:
        'Establish a rock-solid, production-grade Python 3.12 development environment using ultra-fast uv / poetry, AWS CLI v2, AWS SAM CLI, AWS Lambda Powertools for Python, and Ruff.',
      awsServices: ['AWS CLI v2', 'AWS SAM CLI', 'AWS Lambda', 'Amazon CloudWatch'],
      audioScript:
        'Step 1 covers standard Python tooling for serverless applications. We use Python 3.12, the uv high-speed package manager or poetry, boto3 for AWS SDK communication, and AWS Lambda Powertools for structured logging, distributed tracing, and metrics.',
      commands: [
        {
          label: '1. Install uv & AWS SAM CLI',
          cmd: 'curl -LsSf https://astral.sh/uv/install.sh | sh\npip install aws-sam-cli',
          desc: 'Installs astral uv (10-100x faster than pip) and official AWS Serverless Application Model (SAM) CLI.'
        },
        {
          label: '2. Initialize Serverless Project with uv',
          cmd: 'uv init serverless-python-cloud\ncd serverless-python-cloud\nuv add boto3 botocore "aws-lambda-powertools[all]" pydantic "mangum>=0.17.0"\nuv add --dev pytest pytest-mock pytest-cov moto ruff mypy',
          desc: 'Creates a clean modern project scaffolding with locked dependencies and development test harness.'
        },
        {
          label: '3. Verify AWS Credentials & Local Profile',
          cmd: 'aws configure --profile cloud-prod\naws sts get-caller-identity --profile cloud-prod',
          desc: 'Verifies active AWS IAM credentials and STS caller identity.'
        }
      ],
      codeFiles: [
        {
          name: 'pyproject.toml',
          lang: 'toml',
          path: 'pyproject.toml',
          desc: 'Modern standard Python project declaration with strict linting & test config',
          code: `[project]
name = "serverless-python-cloud"
version = "1.0.0"
description = "Production-grade Serverless Application & Cloud Solutions with Python & AWS SDK"
readme = "README.md"
requires-python = ">=3.12"
dependencies = [
    "boto3>=1.34.0",
    "botocore>=1.34.0",
    "aws-lambda-powertools[all]>=2.36.0",
    "pydantic>=2.7.0",
    "mangum>=0.17.0",
]

[dependency-groups]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.23.0",
    "pytest-mock>=3.14.0",
    "pytest-cov>=5.0.0",
    "moto[all]>=5.0.0",
    "ruff>=0.4.0",
    "mypy>=1.10.0",
    "boto3-stubs[dynamodb,s3,sqs,sns,secretsmanager,ssm,stepfunctions,bedrock-runtime]>=1.34.0",
]

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "UP", "B", "A", "C4", "PT", "ARG"]

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
addopts = "-v --cov=app --cov-report=term-missing"`
        }
      ],
      keyRules: [
        'Always target Python 3.12 runtime on AWS Lambda with ARM64 (Graviton3) for 20-30% price-performance advantage.',
        'Use boto3-stubs in dev dependencies for full autocompletion and static type checking in VS Code / PyCharm.',
        'Enforce strict linting with Ruff and type validation with Pydantic v2 to catch schema errors at the ingress boundary.'
      ]
    },
    {
      id: 'step-2-architecture',
      stepNumber: 2,
      title: 'Scaffolding Clean Hexagonal Serverless Architecture',
      category: 'architecture',
      badge: 'Hexagonal Design',
      summary:
        'Structure your Python serverless codebase with domain layers: Handlers (Adapters) → Domain Services (Core Logic) → Repositories (Boto3 AWS Data Access).',
      awsServices: ['AWS Lambda', 'Amazon API Gateway', 'AWS X-Ray'],
      audioScript:
        'Step 2 designs the hexagonal serverless architecture. Handlers only parse events and delegate to domain services. Domain services execute pure business rules, and repositories encapsulate all Boto3 SDK calls. This enables effortless unit testing with zero AWS dependencies.',
      codeFiles: [
        {
          name: 'schemas.py',
          lang: 'python',
          path: 'app/models/schemas.py',
          desc: 'Pydantic v2 DTOs with strict validation, default timestamps, and JSON serialization',
          code: `from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class CreateOrderRequest(BaseModel):
    customer_id: str = Field(..., min_length=3, max_length=64, description="Unique customer identifier")
    items: List[str] = Field(..., min_items=1, description="List of SKU identifiers")
    total_amount: Decimal = Field(..., gt=0, decimal_places=2, description="Monetary total")
    currency: str = Field(default="USD", min_length=3, max_length=3)

class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    order_id: str
    customer_id: str
    status: str
    items: List[str]
    total_amount: Decimal
    currency: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))`
        },
        {
          name: 'order_service.py',
          lang: 'python',
          path: 'app/services/order_service.py',
          desc: 'Pure Domain Service coordinating business validation and repository dispatch',
          code: `import uuid
from datetime import datetime, timezone
from app.models.schemas import CreateOrderRequest, OrderResponse
from app.repositories.dynamo_repo import DynamoOrderRepository
from aws_lambda_powertools import Logger, Tracer, Metrics
from aws_lambda_powertools.metrics import MetricUnit

logger = Logger(child=True)
tracer = Tracer()
metrics = Metrics()

class OrderService:
    def __init__(self, repo: DynamoOrderRepository):
        self.repo = repo

    @tracer.capture_method
    def create_order(self, request: CreateOrderRequest) -> OrderResponse:
        order_id = f"ord_{uuid.uuid4().hex[:12]}"
        logger.info("Creating new customer order", extra={"order_id": order_id, "customer_id": request.customer_id})

        order_data = OrderResponse(
            order_id=order_id,
            customer_id=request.customer_id,
            status="PENDING_PAYMENT",
            items=request.items,
            total_amount=request.total_amount,
            currency=request.currency,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        # Persist through repository
        self.repo.save_order(order_data)

        metrics.add_metric(name="OrderCreated", unit=MetricUnit.Count, value=1)
        metrics.add_metric(name="OrderRevenue", unit=MetricUnit.Count, value=float(request.total_amount))
        return order_data

    @tracer.capture_method
    def get_order(self, order_id: str) -> Optional[OrderResponse]:
        return self.repo.find_by_id(order_id)`
        }
      ],
      keyRules: [
        'Keep Lambda Handler functions under 20 lines: parse event → call service → return HTTP/event status.',
        'Never import heavyweight dependencies inside handler methods; initialize Boto3 clients globally to reuse connections during warm invocations.',
        'Use aws-lambda-powertools Logger, Tracer, and Metrics decorators to auto-instrument CloudWatch and X-Ray.'
      ]
    },
    {
      id: 'step-3-boto3-solutions',
      stepNumber: 3,
      title: 'AWS SDK (Boto3) Cloud Solutions: DynamoDB, SQS, S3 & Secrets',
      category: 'sdk-solutions',
      badge: 'Boto3 Cloud Patterns',
      summary:
        'Production implementations for DynamoDB Single-Table transactions, SQS Partial Batch Failures, S3 presigned streaming, and Secrets Manager caching.',
      awsServices: ['Amazon DynamoDB', 'Amazon SQS', 'Amazon S3', 'AWS Secrets Manager', 'Amazon Bedrock'],
      audioScript:
        'Step 3 is the core cloud solutions library. We demonstrate production Boto3 patterns: single-table DynamoDB transactions with conditional writes, SQS batch event processors reporting partial failures, secure S3 presigned URLs, and Secrets Manager in-memory caching.',
      codeFiles: [
        {
          name: 'dynamo_repo.py',
          lang: 'python',
          path: 'app/repositories/dynamo_repo.py',
          desc: 'High-performance DynamoDB Single-Table Repository with Boto3 Resource & Transactions',
          code: `import os
from decimal import Decimal
from typing import Optional
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from app.models.schemas import OrderResponse
from aws_lambda_powertools import Logger, Tracer

logger = Logger(child=True)
tracer = Tracer()

# Boto3 client initialization with adaptive retries & socket pooling
boto_config = Config(
    retries={'mode': 'adaptive', 'max_attempts': 5},
    max_pool_connections=25
)
dynamodb = boto3.resource('dynamodb', config=boto_config)
TABLE_NAME = os.environ.get('ORDERS_TABLE_NAME', 'OrdersSingleTable')
table = dynamodb.Table(TABLE_NAME)

class DynamoOrderRepository:
    @tracer.capture_method
    def save_order(self, order: OrderResponse) -> None:
        item = {
            'PK': f"CUSTOMER#{order.customer_id}",
            'SK': f"ORDER#{order.order_id}",
            'GSI1PK': f"ORDER#{order.order_id}",
            'GSI1SK': f"STATUS#{order.status}",
            'order_id': order.order_id,
            'customer_id': order.customer_id,
            'status': order.status,
            'items': order.items,
            'total_amount': order.total_amount,
            'currency': order.currency,
            'created_at': order.created_at.isoformat(),
            'updated_at': order.updated_at.isoformat(),
        }
        try:
            # Conditional write to prevent overwriting existing order IDs
            table.put_item(
                Item=item,
                ConditionExpression="attribute_not_exists(PK) AND attribute_not_exists(SK)"
            )
            logger.info("Order written to DynamoDB successfully", extra={"order_id": order.order_id})
        except ClientError as err:
            if err.response['Error']['Code'] == 'ConditionalCheckFailedException':
                logger.error("Order ID collision detected", extra={"order_id": order.order_id})
                raise ValueError(f"Order {order.order_id} already exists.")
            logger.exception("DynamoDB PutItem failure")
            raise

    @tracer.capture_method
    def find_by_id(self, order_id: str) -> Optional[OrderResponse]:
        # Query GSI1 for fast lookup without knowing customer_id
        response = table.query(
            IndexName='GSI1',
            KeyConditionExpression='GSI1PK = :gsi1pk',
            ExpressionAttributeValues={':gsi1pk': f"ORDER#{order_id}"},
            Limit=1
        )
        items = response.get('Items', [])
        if not items:
            return None
        raw = items[0]
        return OrderResponse.model_validate(raw)`
        },
        {
          name: 'sqs_processor.py',
          lang: 'python',
          path: 'app/handlers/sqs_processor.py',
          desc: 'SQS Batch Handler with Partial Batch Failure Reporting (Prevents queue blocking)',
          code: `from aws_lambda_powertools import Logger, Tracer
from aws_lambda_powertools.utilities.batch import (
    BatchProcessor,
    EventType,
    process_partial_response
)
from aws_lambda_powertools.utilities.typing import LambdaContext
import json

logger = Logger()
tracer = Tracer()
processor = BatchProcessor(event_type=EventType.SQS)

def record_handler(record):
    """Processes a single SQS message payload."""
    body = json.loads(record.body)
    logger.info("Processing SQS payment job", extra={"message_id": record.message_id, "body": body})
    
    # Business logic here (e.g. charge payment gateway)
    if body.get("fail_simulation"):
        raise RuntimeError("Simulated transient payment gateway timeout")
    
    return {"status": "SUCCESS", "order_id": body.get("order_id")}

@logger.inject_lambda_context
@tracer.capture_lambda_handler
def handler(event: dict, context: LambdaContext):
    """
    Returns batchItemFailures list to SQS so only failed messages retry.
    """
    return process_partial_response(
        event=event,
        record_handler=record_handler,
        processor=processor,
        context=context
    )`
        },
        {
          name: 's3_service.py',
          lang: 'python',
          path: 'app/services/s3_service.py',
          desc: 'S3 Presigned URL generator and streaming file reader with Boto3 client',
          code: `import os
import boto3
from botocore.config import Config
from aws_lambda_powertools import Logger, Tracer

logger = Logger(child=True)
tracer = Tracer()

s3_client = boto3.client('s3', config=Config(signature_version='s3v4'))
BUCKET_NAME = os.environ.get('ASSETS_BUCKET', 'my-cloud-assets-prod')

class S3StorageService:
    @tracer.capture_method
    def generate_upload_url(self, key: str, content_type: str, expires_in_seconds: int = 900) -> str:
        """Generates a secure presigned PUT URL for client-side direct upload."""
        logger.info("Generating presigned upload URL", extra={"key": key, "bucket": BUCKET_NAME})
        url = s3_client.generate_presigned_url(
            ClientMethod='put_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': key,
                'ContentType': content_type,
            },
            ExpiresIn=expires_in_seconds
        )
        return url

    @tracer.capture_method
    def stream_lines(self, key: str):
        """Streams large S3 files without buffering entire object into Lambda RAM."""
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=key)
        for line in response['Body'].iter_lines():
            if line:
                yield line.decode('utf-8')`
        }
      ],
      keyRules: [
        'Always configure Boto3 with adaptive retries (botocore.config.Config(retries={"mode": "adaptive"})) to handle transient throttles gracefully.',
        'Use SQS ReportBatchItemFailures so a single malformed message in a batch of 10 does not re-drive the other 9 successful messages.',
        'For file uploads > 5MB, always generate S3 Presigned URLs instead of proxying binary streams through API Gateway & Lambda memory.'
      ]
    },
    {
      id: 'step-4-iac-sam',
      stepNumber: 4,
      title: 'Infrastructure as Code (IaC) with AWS SAM & AWS CDK Python',
      category: 'iac',
      badge: 'AWS SAM & CDK',
      summary:
        'Declare serverless infrastructure with AWS SAM template.yaml featuring ARM64 Graviton3 architecture, API Gateway HTTP API, DynamoDB pay-per-request table, and SQS DLQ.',
      awsServices: ['AWS SAM', 'AWS CloudFormation', 'Amazon API Gateway v2', 'AWS IAM'],
      audioScript:
        'Step 4 handles Infrastructure as Code. We provide an AWS SAM template configured with ARM64 Graviton3 architecture, HTTP API routing, pay-per-request DynamoDB table with GSI, and automated IAM least-privilege role generation.',
      codeFiles: [
        {
          name: 'template.yaml',
          lang: 'yaml',
          path: 'template.yaml',
          desc: 'Production AWS SAM Template with Globals, HTTP API, DynamoDB & SQS Integration',
          code: `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Production Serverless Python Application & Cloud Solutions

Globals:
  Function:
    Timeout: 10
    MemorySize: 512
    Runtime: python3.12
    Architectures:
      - arm64
    Tracing: Active
    Environment:
      Variables:
        POWERTOOLS_SERVICE_NAME: order-service
        POWERTOOLS_METRICS_NAMESPACE: CloudApp
        LOG_LEVEL: INFO
        ORDERS_TABLE_NAME: !Ref OrdersTable

Resources:
  # ==========================================
  # API GATEWAY HTTP API (v2)
  # ==========================================
  HttpApi:
    Type: AWS::Serverless::HttpApi
    Properties:
      CorsConfiguration:
        AllowMethods:
          - GET
          - POST
          - PUT
          - DELETE
        AllowHeaders:
          - Content-Type
          - Authorization
        AllowOrigins:
          - "*"

  # ==========================================
  # LAMBDA: CREATE & GET ORDERS
  # ==========================================
  OrdersFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: app/
      Handler: handlers.orders.handler
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref OrdersTable
      Events:
        CreateOrder:
          Type: HttpApi
          Properties:
            ApiId: !Ref HttpApi
            Path: /orders
            Method: POST
        GetOrder:
          Type: HttpApi
          Properties:
            ApiId: !Ref HttpApi
            Path: /orders/{order_id}
            Method: GET

  # ==========================================
  # DYNAMODB SINGLE-TABLE (PAY-PER-REQUEST)
  # ==========================================
  OrdersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub "\${AWS::StackName}-orders"
      BillingMode: PAY_PER_REQUEST
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true
      SSESpecification:
        SSEEnabled: true
      AttributeDefinitions:
        - AttributeName: PK
          AttributeType: S
        - AttributeName: SK
          AttributeType: S
        - AttributeName: GSI1PK
          AttributeType: S
        - AttributeName: GSI1SK
          AttributeType: S
      KeySchema:
        - AttributeName: PK
          KeyType: HASH
        - AttributeName: SK
          KeyType: RANGE
      GlobalSecondaryIndexes:
        - IndexName: GSI1
          KeySchema:
            - AttributeName: GSI1PK
              KeyType: HASH
            - AttributeName: GSI1SK
              KeyType: RANGE
          Projection:
            ProjectionType: ALL

Outputs:
  HttpApiUrl:
    Description: Ingress API Gateway Endpoint URL
    Value: !Sub "https://\${HttpApi}.execute-api.\${AWS::Region}.amazonaws.com"`
        }
      ],
      keyRules: [
        'Always enable Point-In-Time-Recovery (PITR) and Server-Side Encryption (SSE) on production DynamoDB tables.',
        'Use AWS::Serverless::HttpApi instead of REST API for 70% lower latency and 71% cost reduction.',
        'Declare SAM Policy Templates (like DynamoDBCrudPolicy) instead of wildcard * IAM permissions.'
      ]
    },
    {
      id: 'step-5-testing-moto',
      stepNumber: 5,
      title: 'Local Mocking & Unit Testing with Pytest & Moto',
      category: 'testing',
      badge: 'Pytest + Moto Mocking',
      summary:
        'Write ultra-fast local unit and integration tests using moto to mock DynamoDB and S3 with zero cloud costs and instant test execution.',
      awsServices: ['AWS Moto Mock', 'Pytest', 'AWS X-Ray Local'],
      audioScript:
        'Step 5 demonstrates comprehensive automated testing. We use the Moto library inside pytest fixtures to mock DynamoDB tables and S3 buckets in memory, guaranteeing rapid test execution and high code coverage with zero AWS infrastructure costs.',
      codeFiles: [
        {
          name: 'test_orders.py',
          lang: 'python',
          path: 'tests/test_orders.py',
          desc: 'Pytest suite with Moto DynamoDB Mocking & Pydantic validation tests',
          code: `import os
import boto3
import pytest
from moto import mock_aws
from decimal import Decimal
from app.models.schemas import CreateOrderRequest
from app.repositories.dynamo_repo import DynamoOrderRepository
from app.services.order_service import OrderService

@pytest.fixture
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ['AWS_ACCESS_KEY_ID'] = 'testing'
    os.environ['AWS_SECRET_ACCESS_KEY'] = 'testing'
    os.environ['AWS_SECURITY_TOKEN'] = 'testing'
    os.environ['AWS_SESSION_TOKEN'] = 'testing'
    os.environ['AWS_DEFAULT_REGION'] = 'us-east-1'
    os.environ['ORDERS_TABLE_NAME'] = 'test-orders-table'

@pytest.fixture
def dynamodb_table(aws_credentials):
    """Sets up an in-memory mock DynamoDB table with GSI."""
    with mock_aws():
        dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        table = dynamodb.create_table(
            TableName='test-orders-table',
            KeySchema=[
                {'AttributeName': 'PK', 'KeyType': 'HASH'},
                {'AttributeName': 'SK', 'KeyType': 'RANGE'},
            ],
            AttributeDefinitions=[
                {'AttributeName': 'PK', 'AttributeType': 'S'},
                {'AttributeName': 'SK', 'AttributeType': 'S'},
                {'AttributeName': 'GSI1PK', 'AttributeType': 'S'},
                {'AttributeName': 'GSI1SK', 'AttributeType': 'S'},
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'GSI1PK', 'KeyType': 'HASH'},
                        {'AttributeName': 'GSI1SK', 'KeyType': 'RANGE'},
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                }
            ],
            BillingMode='PAY_PER_REQUEST'
        )
        yield table

def test_order_lifecycle(dynamodb_table):
    repo = DynamoOrderRepository()
    service = OrderService(repo=repo)

    # 1. Create order
    request = CreateOrderRequest(
        customer_id="cust_12345",
        items=["SKU_MACBOOK_PRO", "SKU_MAGIC_MOUSE"],
        total_amount=Decimal("2499.00"),
        currency="USD"
    )
    created = service.create_order(request)

    assert created.order_id.startswith("ord_")
    assert created.status == "PENDING_PAYMENT"
    assert created.total_amount == Decimal("2499.00")

    # 2. Retrieve order by ID using GSI
    fetched = service.get_order(created.order_id)
    assert fetched is not None
    assert fetched.customer_id == "cust_12345"
    assert len(fetched.items) == 2`
        }
      ],
      keyRules: [
        'Use @mock_aws context managers or fixtures from Moto to mock any Boto3 call with zero network overhead.',
        'Never run tests against live AWS resources; isolate credentials with fake dummy keys.',
        'Achieve > 90% branch test coverage before triggering CI/CD deployment.'
      ]
    },
    {
      id: 'step-6-cicd-github-actions',
      stepNumber: 6,
      title: 'Production CI/CD with GitHub Actions & AWS OIDC (No Static Keys)',
      category: 'cicd',
      badge: 'Zero-Secret CI/CD',
      summary:
        'Automate testing, container building, and deployment using GitHub Actions with OpenID Connect (OIDC) authentication—eliminating long-lived AWS IAM access keys.',
      awsServices: ['GitHub Actions', 'AWS IAM OIDC', 'AWS SAM CLI'],
      audioScript:
        'Step 6 establishes automated CI/CD using GitHub Actions and AWS OIDC. We configure short-lived temporary security tokens so your repository never stores permanent AWS secret access keys, preventing credential leaks.',
      codeFiles: [
        {
          name: 'deploy.yml',
          lang: 'yaml',
          path: '.github/workflows/deploy.yml',
          desc: 'GitHub Actions workflow with OIDC authentication & SAM deploy',
          code: `name: Deploy Python Serverless Cloud Stack

on:
  push:
    branches: [main]

permissions:
  id-token: write # Required for AWS OIDC authentication
  contents: read

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Python 3.12
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install uv & Dependencies
        run: |
          curl -LsSf https://astral.sh/uv/install.sh | sh
          uv sync --all-groups

      - name: Run Ruff Linting & Type Checking
        run: |
          uv run ruff check .
          uv run mypy app

      - name: Run Pytest Suite with Moto
        run: |
          uv run pytest --cov=app --cov-report=term-missing

      - name: Configure AWS Credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsServerlessDeployer
          aws-region: us-east-1

      - name: Build & Deploy with SAM
        run: |
          sam build --use-container
          sam deploy --no-confirm-changeset --no-fail-on-empty-changeset --stack-name serverless-python-prod`
        }
      ],
      keyRules: [
        'Never store AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY in GitHub Secrets; always use AWS IAM OpenID Connect (OIDC).',
        'Use sam build --use-container to compile native C-extensions (like cryptography/pydantic-core) inside Lambda-compatible Amazon Linux containers.',
        'Enforce branch protection so deployment only triggers after 100% passing tests and required peer reviews.'
      ]
    }
  ];

  const filteredSteps = STEPS.filter(step => {
    const matchesCategory =
      activeCategoryFilter === 'all' || step.category === activeCategoryFilter;
    const matchesSearch =
      !filterQuery ||
      step.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      step.summary.toLowerCase().includes(filterQuery.toLowerCase()) ||
      step.awsServices.some(s => s.toLowerCase().includes(filterQuery.toLowerCase())) ||
      step.codeFiles?.some(
        f =>
          f.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
          f.code.toLowerCase().includes(filterQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const activeStep = STEPS.find(s => s.id === activeStepId) || STEPS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-950/80 via-indigo-950/60 to-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-950/60">
              🐍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Python Serverless Applications & AWS Cloud Solutions
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-900/90 text-blue-200 border border-blue-600/50">
                  Standard Tooling & SDKs
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Complete step-by-step master blueprint using Python 3.12, uv, Boto3, AWS SAM, Powertools & Moto
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isTtsSupported && (
              <button
                onClick={() =>
                  playSnippet(
                    activeStep.title,
                    'Python Serverless & AWS SDK Blueprint',
                    activeStep.audioScript
                  )
                }
                className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                title="Listen to this Step's Audio Guide"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Listen Step</span>
              </button>
            )}

            {onOpenPlayground && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPlayground();
                }}
                className="px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                title="Simulate in Interactive Architecture Canvas"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Simulate Canvas</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
              title="Close Guide Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-5 py-2.5 bg-zinc-900/60 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider mr-1">
              Phases:
            </span>
            {[
              { id: 'all', label: 'All 6 Phases' },
              { id: 'tooling', label: '1. Tooling' },
              { id: 'architecture', label: '2. Architecture' },
              { id: 'sdk-solutions', label: '3. AWS SDK Solutions' },
              { id: 'iac', label: '4. SAM IaC' },
              { id: 'testing', label: '5. Moto Testing' },
              { id: 'cicd', label: '6. CI/CD' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  activeCategoryFilter === cat.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-zinc-800/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              placeholder="Search DynamoDB, SQS, SAM, moto..."
              className="w-full pl-8 pr-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Modal Main Body: 2-Column Sidebar + Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Sidebar: Step Navigation List */}
          <div className="w-full md:w-72 border-r border-zinc-800 bg-zinc-950/70 overflow-y-auto p-3 space-y-2 shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 pt-1">
              Step-by-Step Blueprint ({filteredSteps.length})
            </div>

            {filteredSteps.map(step => {
              const isActive = step.id === activeStep.id;

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStepId(step.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-950/80 to-indigo-950/70 border-blue-500/60 shadow-md shadow-blue-950/50 text-white'
                      : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {step.stepNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono text-blue-400 font-semibold truncate">
                        {step.badge}
                      </span>
                    </div>
                    <div className="text-xs font-bold leading-tight mt-0.5 truncate text-zinc-200">
                      {step.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Main Panel: Active Step Details & Code Tabs */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-zinc-950">
            
            {/* Step Header */}
            <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-700 text-blue-300 font-mono text-xs font-bold">
                    Step {activeStep.stepNumber} of 6
                  </span>
                  <span className="text-xs text-zinc-400 font-mono font-medium">
                    {activeStep.badge}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {activeStep.awsServices.map(svc => (
                    <span
                      key={svc}
                      className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-mono border border-zinc-700"
                    >
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-black text-white">
                {activeStep.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {activeStep.summary}
              </p>
            </div>

            {/* Quick CLI Commands Section (If Present) */}
            {activeStep.commands && activeStep.commands.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span>Standard CLI Setup & Execution Commands</span>
                </h4>

                <div className="space-y-2.5">
                  {activeStep.commands.map((cmdItem, cIdx) => (
                    <div
                      key={cIdx}
                      className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 space-y-1.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-blue-300">{cmdItem.label}</span>
                        <button
                          onClick={() => handleCopyCmd(cmdItem.cmd, cIdx)}
                          className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-colors"
                        >
                          {copiedCmdIndex === cIdx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-300">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-zinc-400" />
                              <span>Copy Cmd</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="p-2.5 rounded-lg bg-black/80 text-emerald-300 font-mono text-xs overflow-x-auto border border-zinc-800/80">
                        {cmdItem.cmd}
                      </pre>
                      <p className="text-[11px] text-zinc-400 italic">{cmdItem.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Code Files & Implementations */}
            {activeStep.codeFiles && activeStep.codeFiles.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Production Starter Code & Specifications</span>
                </h4>

                <div className="space-y-4">
                  {activeStep.codeFiles.map((file, fIdx) => (
                    <div
                      key={fIdx}
                      className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg"
                    >
                      <div className="px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-yellow-400" />
                          <span className="font-mono text-xs font-bold text-white">
                            {file.name}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                            ({file.path})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                            {file.lang}
                          </span>
                          <button
                            onClick={() => handleCopyCode(file.code, file.name)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors border border-zinc-700"
                          >
                            {copiedFileKey === file.name ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-300">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-black/90">
                        <pre className="font-mono text-xs text-zinc-200 overflow-x-auto leading-relaxed max-h-[380px] p-2">
                          {file.code}
                        </pre>
                      </div>

                      <div className="px-4 py-2 bg-zinc-950/80 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                        💡 <span className="font-medium text-zinc-300">Architect Note:</span> {file.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Architecture Principles & Golden Rules */}
            <div className="bg-zinc-900/60 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Golden Rules & Best Practices for this Step</span>
              </h4>
              <ul className="space-y-2">
                {activeStep.keyRules.map((rule, rIdx) => (
                  <li key={rIdx} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next / Prev Step Navigation Footer */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-zinc-800">
              <button
                disabled={activeStep.stepNumber === 1}
                onClick={() => {
                  const prev = STEPS.find(s => s.stepNumber === activeStep.stepNumber - 1);
                  if (prev) setActiveStepId(prev.id);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 border border-zinc-800 transition-colors"
              >
                ← Previous Step
              </button>

              <button
                disabled={activeStep.stepNumber === STEPS.length}
                onClick={() => {
                  const next = STEPS.find(s => s.stepNumber === activeStep.stepNumber + 1);
                  if (next) setActiveStepId(next.id);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-blue-950/60 transition-colors flex items-center gap-1.5"
              >
                <span>Next Step</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
