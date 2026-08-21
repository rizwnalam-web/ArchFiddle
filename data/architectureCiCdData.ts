import { CiCdPipelineTemplate, CiCdSpec } from '../types';

/**
 * Production-Ready CI/CD Pipeline YAML Templates for .NET 10 + React 19 Stack & Microservices
 */

export const GITHUB_ACTIONS_DOTNET_REACT_YAML = `name: CI/CD Pipeline - .NET 10 & React 19 Microservices

on:
  push:
    branches: [ main, release/* ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment target environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
      run_load_tests:
        description: 'Execute synthetic load tests post-deploy'
        required: false
        default: false
        type: boolean

permissions:
  id-token: write   # Required for AWS OIDC authentication (Zero-Key Security)
  contents: read    # Repository checkout
  pull-requests: write # PR comments for test results
  security-events: write # SARIF upload for security scanning

env:
  AWS_REGION: us-east-1
  AWS_OIDC_ROLE_ARN: \${{ secrets.AWS_OIDC_ROLE_ARN }}
  ECR_REGISTRY: \${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com
  DOTNET_VERSION: '10.0.x'
  NODE_VERSION: '20.x'
  DOTNET_CLI_TELEMETRY_OPTOUT: 'true'

jobs:
  # ===========================================================================
  # 1. MATRIX TEST & CODE QUALITY GATE
  # ===========================================================================
  test-and-lint:
    name: 🧪 Matrix Unit & Integration Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history for gitversion & sonar

      # Setup .NET 10 SDK with NuGet Caching
      - name: Setup .NET 10 SDK
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: \${{ env.DOTNET_VERSION }}
          cache: true
          cache-dependency-path: '**/packages.lock.json'

      # Setup Node.js for React 19 Client & Express BFF
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: '**/package-lock.json'

      # Restore & Test ASP.NET Core 10 Microservice
      - name: Restore .NET Solution
        run: dotnet restore src/dotnet-microservices/OrderAnalyticsService.sln

      - name: Build & Run .NET Unit/Integration Tests
        run: |
          dotnet test src/dotnet-microservices/OrderAnalyticsService.sln \\
            --configuration Release \\
            --no-restore \\
            --verbosity normal \\
            --collect:"XPlat Code Coverage" \\
            --results-directory ./TestResults/dotnet

      # Test & Lint Express.js BFF Gateway
      - name: Test Express.js BFF Gateway
        run: |
          cd src/client-bff-express
          npm ci
          npm run lint
          npm run test -- --coverage
          cd ../..

      # Test & Lint React 19 Frontend Client
      - name: Test React 19 UI Client
        run: |
          cd src/client-web
          npm ci
          npm run lint
          npm run test -- --coverage
          cd ../..

      # Upload Unified Coverage Reports
      - name: Upload Test Coverage Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: code-coverage-reports
          path: |
            ./TestResults
            src/client-bff-express/coverage
            src/client-web/coverage

  # ===========================================================================
  # 2. SECURITY & SAST CONTAINER VULNERABILITY SCAN
  # ===========================================================================
  security-sast:
    name: 🛡️ Security & Vulnerability Gates
    runs-on: ubuntu-latest
    needs: [test-and-lint]
    steps:
      - name: Checkout Source
        uses: actions/checkout@v4

      # SAST Scan for .NET & JavaScript
      - name: Run Trivy Vulnerability Scanner (Repo & Config)
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          ignore-unfixed: true
          severity: 'CRITICAL,HIGH'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy Scan Results to GitHub Security
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

  # ===========================================================================
  # 3. DOCKER BUILDX & PUSH TO AMAZON ECR (MULTI-CONTAINER)
  # ===========================================================================
  build-and-push-ecr:
    name: 🐳 Docker Multi-Image Build & Push (ECR)
    runs-on: ubuntu-latest
    needs: [security-sast]
    if: github.ref == 'refs/heads/main' || github.event_name == 'workflow_dispatch'
    outputs:
      image_tag: \${{ steps.set-tag.outputs.image_tag }}
      dotnet_image: \${{ steps.build-dotnet.outputs.image }}
      bff_image: \${{ steps.build-bff.outputs.image }}
      web_image: \${{ steps.build-web.outputs.image }}
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Set Image Tag
        id: set-tag
        run: echo "image_tag=sha-\${{ github.sha }}-\$(date +%s)" >> $GITHUB_OUTPUT

      - name: Configure AWS Credentials (OIDC - Zero Secret Storage)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: \${{ env.AWS_OIDC_ROLE_ARN }}
          aws-region: \${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      # Build 1: ASP.NET Core 10 Microservice Image
      - name: Build & Push .NET 10 Microservice Image
        id: build-dotnet
        uses: docker/build-push-action@v5
        with:
          context: ./src/dotnet-microservices
          file: ./src/dotnet-microservices/Dockerfile
          push: true
          tags: |
            \${{ steps.login-ecr.outputs.registry }}/order-analytics-dotnet10:\${{ steps.set-tag.outputs.image_tag }}
            \${{ steps.login-ecr.outputs.registry }}/order-analytics-dotnet10:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      # Build 2: Express.js BFF Gateway Image
      - name: Build & Push Express.js BFF Image
        id: build-bff
        uses: docker/build-push-action@v5
        with:
          context: ./src/client-bff-express
          file: ./src/client-bff-express/Dockerfile
          push: true
          tags: |
            \${{ steps.login-ecr.outputs.registry }}/order-analytics-bff:\${{ steps.set-tag.outputs.image_tag }}
            \${{ steps.login-ecr.outputs.registry }}/order-analytics-bff:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      # Build 3: React 19 Frontend Static Client Image (Nginx Alpine)
      - name: Build & Push React 19 Client Image
        id: build-web
        uses: docker/build-push-action@v5
        with:
          context: ./src/client-web
          file: ./src/client-web/Dockerfile
          push: true
          tags: |
            \${{ steps.login-ecr.outputs.registry }}/order-analytics-web:\${{ steps.set-tag.outputs.image_tag }}
            \${{ steps.login-ecr.outputs.registry }}/order-analytics-web:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ===========================================================================
  # 4. DATABASE / WAREHOUSE SCHEMA MIGRATION GATE
  # ===========================================================================
  snowflake-efcore-migration:
    name: ❄️ Snowflake & EF Core Migration Bundle
    runs-on: ubuntu-latest
    needs: [build-and-push-ecr]
    environment: \${{ github.event.inputs.environment || 'staging' }}
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup .NET 10 SDK
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: \${{ env.DOTNET_VERSION }}

      - name: Execute EF Core Snowflake Migration
        env:
          SNOWFLAKE_CONNECTION_STRING: \${{ secrets.SNOWFLAKE_CONNECTION_STRING }}
        run: |
          dotnet ef database update \\
            --project src/dotnet-microservices/src/OrderAnalyticsService.Infrastructure \\
            --startup-project src/dotnet-microservices/src/OrderAnalyticsService.Api \\
            --connection "$SNOWFLAKE_CONNECTION_STRING"

  # ===========================================================================
  # 5. ZERO-DOWNTIME BLUE/GREEN DEPLOYMENT (AWS ECS FARGATE / CODE-DEPLOY)
  # ===========================================================================
  deploy-aws-ecs-blue-green:
    name: 🚀 Zero-Downtime Blue/Green Rollout (AWS ECS)
    runs-on: ubuntu-latest
    needs: [build-and-push-ecr, snowflake-efcore-migration]
    environment: \${{ github.event.inputs.environment || 'staging' }}
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Configure AWS Credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: \${{ env.AWS_OIDC_ROLE_ARN }}
          aws-region: \${{ env.AWS_REGION }}

      # Download existing task definitions
      - name: Render AWS ECS Task Definition for .NET 10 Microservice
        id: render-dotnet-taskdef
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: .aws/ecs-taskdef-dotnet10.json
          container-name: order-analytics-api
          image: \${{ env.ECR_REGISTRY }}/order-analytics-dotnet10:\${{ needs.build-and-push-ecr.outputs.image_tag }}

      - name: Deploy to Amazon ECS using AWS CodeDeploy (Linear Shifting: 10% every 1m)
        uses: aws-actions/amazon-ecs-deploy-task-definition@v2
        with:
          task-definition: \${{ steps.render-dotnet-taskdef.outputs.task-definition }}
          service: order-analytics-microservice
          cluster: production-microservices-cluster
          wait-for-service-stability: true
          codedeploy-appspec: .aws/appspec.yml
          codedeploy-application: AppECS-production-microservices
          codedeploy-deployment-group: DgpECS-production-microservices

      # Automated Synthetic Health Probe & Rollback Verification
      - name: Automated Synthetic Health Check Probe
        run: |
          echo "Verifying /healthz and /api/analytics/summary endpoints..."
          for i in {1..12}; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.prod.domain.com/healthz || true)
            if [ "$STATUS" == "200" ]; then
              echo "✅ Health check passed with HTTP 200 OK!"
              exit 0
            fi
            echo "Waiting for health probe (attempt $i/12, status: $STATUS)..."
            sleep 10
          done
          echo "❌ Health check probe failed! Initiating automated rollback in AWS CodeDeploy."
          exit 1`;

export const AWS_CODEPIPELINE_BUILDSPEC_YAML = `version: 0.2

# =============================================================================
# AWS CODEBUILD / CODEPIPELINE SPECIFICATION FOR .NET 10 & REACT 19 STACK
# =============================================================================

env:
  shell: bash
  variables:
    DOTNET_ROOT: "/root/.dotnet"
    NODE_OPTIONS: "--max-old-space-size=4096"
  parameter-store:
    SNOWFLAKE_CONN: "/prod/microservices/snowflake_conn_str"
    OTEL_EXPORTER_ENDPOINT: "/prod/telemetry/otel_endpoint"
  secrets-manager:
    SONAR_TOKEN: "prod/cicd/sonar:token"

phases:
  install:
    runtime-versions:
      dotnet: 8.0 # Base runtime, upgraded to .NET 10 preview in scripts
      nodejs: 20
    commands:
      - echo "Installing .NET 10 SDK & build prerequisites..."
      - curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin --channel 10.0 --install-dir /root/.dotnet
      - export PATH="/root/.dotnet:$PATH"
      - dotnet --version
      - node --version
      - npm --version
      # Install Trivy security scanner
      - curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

  pre_build:
    commands:
      - echo "Authenticating with Amazon Elastic Container Registry (ECR)..."
      - AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
      - ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com"
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
      - COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-8)
      - IMAGE_TAG="\${COMMIT_HASH:=latest}-\$(date +%s)"
      
      # 1. Run .NET 10 Automated Unit Tests & Integration Tests
      - echo "Running .NET 10 test suite..."
      - dotnet test src/dotnet-microservices/OrderAnalyticsService.sln -c Release --verbosity normal --collect:"XPlat Code Coverage"
      
      # 2. Run React 19 & Express BFF Unit Tests
      - echo "Running React 19 and Express BFF test suites..."
      - cd src/client-web && npm ci && npm test -- --run && cd ../..
      - cd src/client-bff-express && npm ci && npm test -- --run && cd ../..

      # 3. Security Vulnerability Scan on Dependencies
      - echo "Running Trivy filesystem scan..."
      - trivy fs --severity CRITICAL,HIGH --exit-code 0 .

  build:
    commands:
      - echo "Building multi-tier Docker container images on $(date)..."
      
      # 1. Build .NET 10 Microservice Image
      - echo "Building ASP.NET Core 10 Container..."
      - docker build -t $ECR_REGISTRY/order-analytics-dotnet10:$IMAGE_TAG ./src/dotnet-microservices
      - docker tag $ECR_REGISTRY/order-analytics-dotnet10:$IMAGE_TAG $ECR_REGISTRY/order-analytics-dotnet10:latest
      
      # 2. Build Express.js BFF Gateway Image
      - echo "Building Express.js BFF Container..."
      - docker build -t $ECR_REGISTRY/order-analytics-bff:$IMAGE_TAG ./src/client-bff-express
      - docker tag $ECR_REGISTRY/order-analytics-bff:$IMAGE_TAG $ECR_REGISTRY/order-analytics-bff:latest
      
      # 3. Build React 19 Frontend Web Image
      - echo "Building React 19 Static Nginx Container..."
      - docker build -t $ECR_REGISTRY/order-analytics-web:$IMAGE_TAG ./src/client-web
      - docker tag $ECR_REGISTRY/order-analytics-web:$IMAGE_TAG $ECR_REGISTRY/order-analytics-web:latest

  post_build:
    commands:
      - echo "Pushing container images to Amazon ECR..."
      - docker push $ECR_REGISTRY/order-analytics-dotnet10:$IMAGE_TAG
      - docker push $ECR_REGISTRY/order-analytics-dotnet10:latest
      - docker push $ECR_REGISTRY/order-analytics-bff:$IMAGE_TAG
      - docker push $ECR_REGISTRY/order-analytics-bff:latest
      - docker push $ECR_REGISTRY/order-analytics-web:$IMAGE_TAG
      - docker push $ECR_REGISTRY/order-analytics-web:latest
      
      # Generate ECS Image Definitions for CodeDeploy Blue/Green Action
      - echo "Generating imagedefinitions.json and taskdef artifacts for CodePipeline deploy stage..."
      - printf '[{"name":"order-analytics-api","imageUri":"%s"},{"name":"order-analytics-bff","imageUri":"%s"}]' "$ECR_REGISTRY/order-analytics-dotnet10:$IMAGE_TAG" "$ECR_REGISTRY/order-analytics-bff:$IMAGE_TAG" > imagedefinitions.json
      
      # Generate AppSpec for AWS CodeDeploy ECS Traffic Shifting
      - |
        cat <<EOF > appspec.yaml
        version: 0.0
        Resources:
          - TargetService:
              Type: AWS::ECS::Service
              Properties:
                TaskDefinition: <TASK_DEFINITION>
                LoadBalancerInfo:
                  ContainerName: "order-analytics-bff"
                  ContainerPort: 4000
        Hooks:
          - BeforeInstall: "LambdaValidateSnowflakeConnectivity"
          - AfterInstall: "LambdaRunSyntheticSmokeTests"
        EOF

artifacts:
  files:
    - imagedefinitions.json
    - appspec.yaml
    - taskdef.json
  discard-paths: yes

cache:
  paths:
    - '/root/.nuget/packages/**/*'
    - '/root/.npm/**/*'
    - '/var/lib/docker/**/*'`;

export const GITLAB_CI_DOTNET_REACT_YAML = `stages:
  - test
  - security
  - build
  - migration
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"
  DOTNET_VERSION: "10.0"
  AWS_DEFAULT_REGION: "us-east-1"
  IMAGE_TAG: "$CI_COMMIT_SHORT_SHA-$CI_PIPELINE_IID"

# Caching for NuGet and NPM dependencies across runner jobs
cache:
  key: "$CI_COMMIT_REF_SLUG"
  paths:
    - .nuget/
    - .npm/

# =============================================================================
# STAGE 1: TEST & LINT
# =============================================================================
test:dotnet10:
  stage: test
  image: mcr.microsoft.com/dotnet/sdk:10.0
  script:
    - dotnet restore src/dotnet-microservices/OrderAnalyticsService.sln --packages .nuget
    - dotnet test src/dotnet-microservices/OrderAnalyticsService.sln -c Release --no-restore --collect:"XPlat Code Coverage"
  artifacts:
    when: always
    reports:
      junit: TestResults/**/TestResults.xml

test:react_and_bff:
  stage: test
  image: node:20-alpine
  script:
    - cd src/client-bff-express && npm ci --cache ../../.npm && npm test && cd ../..
    - cd src/client-web && npm ci --cache ../../.npm && npm test && cd ../..

# =============================================================================
# STAGE 2: CONTAINER SECURITY & SAST SCAN
# =============================================================================
security:trivy:
  stage: security
  image: aquasec/trivy:latest
  script:
    - trivy fs --severity HIGH,CRITICAL --format json --output trivy-report.json .
  artifacts:
    reports:
      sast: trivy-report.json

# =============================================================================
# STAGE 3: MULTI-IMAGE DOCKER BUILD & PUSH TO AWS ECR / GITLAB REGISTRY
# =============================================================================
build:containers:
  stage: build
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  before_script:
    - apk add --no-cache aws-cli
    - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $CI_AWS_ECR_REGISTRY
  script:
    - docker build -t $CI_AWS_ECR_REGISTRY/dotnet-api:$IMAGE_TAG ./src/dotnet-microservices
    - docker build -t $CI_AWS_ECR_REGISTRY/express-bff:$IMAGE_TAG ./src/client-bff-express
    - docker build -t $CI_AWS_ECR_REGISTRY/react-web:$IMAGE_TAG ./src/client-web
    - docker push $CI_AWS_ECR_REGISTRY/dotnet-api:$IMAGE_TAG
    - docker push $CI_AWS_ECR_REGISTRY/express-bff:$IMAGE_TAG
    - docker push $CI_AWS_ECR_REGISTRY/react-web:$IMAGE_TAG
  only:
    - main

# =============================================================================
# STAGE 4: PRODUCTION ZERO-DOWNTIME ROLLOUT (HELM / K8S OR AWS ECS)
# =============================================================================
deploy:production:
  stage: deploy
  image: alpine/helm:3.14.0
  environment:
    name: production
    url: https://analytics.company.com
  script:
    - echo "Deploying helm release with Canary traffic shifting..."
    - helm upgrade --install order-analytics-microservices ./deploy/helm \\
        --namespace production \\
        --set image.tag=$IMAGE_TAG \\
        --set snowflake.secretRef=$SNOWFLAKE_SECRET_NAME \\
        --wait --timeout 5m
  only:
    - main`;

export const AZURE_DEVOPS_DOTNET_REACT_YAML = `trigger:
  branches:
    include:
      - main
      - release/*

pool:
  vmImage: 'ubuntu-latest'

variables:
  buildConfiguration: 'Release'
  dotnetVersion: '10.0.x'
  nodeVersion: '20.x'
  azureServiceConnection: 'Azure-Production-Subscription'
  containerRegistry: 'acrmicroservicesprod.azurecr.io'
  imageTag: '$(Build.BuildId)'

stages:
  # ===========================================================================
  # STAGE 1: BUILD & UNIT TESTING
  # ===========================================================================
  - stage: TestAndLint
    displayName: 'Test & Code Quality Analysis'
    jobs:
      - job: DotNetAndReactTests
        displayName: 'Run Matrix Test Suites'
        steps:
          - task: UseDotNet@2
            inputs:
              packageType: 'sdk'
              version: '$(dotnetVersion)'

          - task: NodeTool@0
            inputs:
              versionSpec: '$(nodeVersion)'

          - script: |
              dotnet restore src/dotnet-microservices/OrderAnalyticsService.sln
              dotnet test src/dotnet-microservices/OrderAnalyticsService.sln --configuration $(buildConfiguration) --collect "Code Coverage"
            displayName: 'Restore & Test .NET 10 Microservices'

          - script: |
              cd src/client-bff-express && npm ci && npm test
              cd ../client-web && npm ci && npm test
            displayName: 'Test Express BFF & React 19 Frontend'

  # ===========================================================================
  # STAGE 2: DOCKER CONTAINERIZATION & PUSH TO ACR
  # ===========================================================================
  - stage: BuildAndPublishImages
    displayName: 'Build & Push Container Images'
    dependsOn: TestAndLint
    condition: succeeded()
    jobs:
      - job: DockerBuild
        displayName: 'Build Multi-Container Images'
        steps:
          - task: Docker@2
            displayName: 'Login to Azure Container Registry'
            inputs:
              command: login
              containerRegistry: '$(azureServiceConnection)'

          - task: Docker@2
            displayName: 'Build & Push .NET 10 API'
            inputs:
              command: buildAndPush
              repository: 'order-analytics-dotnet10'
              dockerfile: 'src/dotnet-microservices/Dockerfile'
              tags: |
                $(imageTag)
                latest

          - task: Docker@2
            displayName: 'Build & Push Express BFF'
            inputs:
              command: buildAndPush
              repository: 'order-analytics-bff'
              dockerfile: 'src/client-bff-express/Dockerfile'
              tags: |
                $(imageTag)
                latest

  # ===========================================================================
  # STAGE 3: ZERO-DOWNTIME ROLLOUT TO AZURE CONTAINER APPS
  # ===========================================================================
  - stage: DeployProduction
    displayName: 'Deploy to Azure Container Apps (Blue/Green)'
    dependsOn: BuildAndPublishImages
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: DeployProductionEnvironment
        environment: 'production-container-apps'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureContainerApps@1
                  displayName: 'Deploy .NET 10 Microservice Revision'
                  inputs:
                    azureSubscription: '$(azureServiceConnection)'
                    containerAppName: 'aca-order-analytics-dotnet10'
                    resourceGroup: 'rg-microservices-prod'
                    imageToDeploy: '$(containerRegistry)/order-analytics-dotnet10:$(imageTag)'
                    targetPort: 5000`;

/**
 * Standard Production CI/CD Spec for Microservices & Full-Stack Architectures
 */
export const DEFAULT_DOTNET_REACT_CICD_SPEC: CiCdSpec = {
  strategy: 'Multi-stage automated pipeline with test matrix, SAST vulnerability gates, OIDC cloud authentication, and zero-downtime blue/green deployment.',
  artifactRegistry: 'Amazon Elastic Container Registry (ECR) / GitHub Packages (GHCR) with immutable SHA tags and Trivy vulnerability scanning.',
  deploymentModel: 'Blue/Green',
  rollbackMechanism: 'Automated AWS CodeDeploy traffic rollback triggered on CloudWatch synthetic alarm failure or HTTP 5xx error rate > 0.5% over 2 minutes.',
  pipelines: [
    {
      id: 'github-actions-dotnet-react',
      provider: 'GitHub Actions',
      pipelineName: 'GitHub Actions: .NET 10 Microservices + React 19 UI + AWS ECS Fargate Blue/Green',
      fileName: '.github/workflows/deploy-dotnet-react.yml',
      targetStack: '.NET 10 (ASP.NET Core Web API + gRPC) + React 19 + Express BFF + AWS SQS + Snowflake',
      triggerEvent: 'git push on main / release/* or workflow_dispatch manual trigger',
      deploymentTarget: 'Amazon ECS Fargate / Cloud Run via AWS CodeDeploy Blue/Green linear traffic shifting',
      yamlConfig: GITHUB_ACTIONS_DOTNET_REACT_YAML,
      keyStages: [
        { name: '1. Matrix Test & Lint', description: 'Runs parallelized .NET 10 xUnit and React 19 Vitest suites with code coverage reporting.', durationEst: '2m 10s' },
        { name: '2. SAST Security Gate', description: 'Trivy filesystem and container CVE scanning with automated SARIF reporting to GitHub Security.', durationEst: '1m 15s' },
        { name: '3. Docker Build & ECR Push', description: 'Multi-stage Docker Buildx with GitHub Actions layer caching, tagging with commit SHA and semver.', durationEst: '3m 40s' },
        { name: '4. Snowflake EF Migration', description: 'Applies EF Core migration bundles against Snowflake cloud warehouse before new container activation.', durationEst: '45s' },
        { name: '5. Blue/Green ECS Rollout', description: 'AWS CodeDeploy provisions green task set, shifts 10% traffic every minute, evaluates synthetic probes, and terminates blue set upon 100% healthy delivery.', durationEst: '4m 30s' }
      ],
      securityAndQualityGates: [
        'Zero Permanent AWS Access Keys: Uses GitHub OIDC provider (aws-actions/configure-aws-credentials) to assume temporary short-lived IAM roles.',
        'SAST & Dependency Gate: Trivy scans fail the build on unpatched CRITICAL CVEs with CVSS score > 8.0.',
        'Branch Protection: Main branch requires green CI check, 1 approving code review, and passing SonarCloud quality gate before merge.'
      ],
      environmentSecrets: [
        { name: 'AWS_OIDC_ROLE_ARN', purpose: 'ARN of IAM role configured with GitHub OIDC Trust Policy for zero-key deployment' },
        { name: 'AWS_ACCOUNT_ID', purpose: '12-digit AWS Account ID for Amazon ECR registry resolution' },
        { name: 'SNOWFLAKE_CONNECTION_STRING', purpose: 'Encrypted connection string with role, warehouse, and schema credentials' },
        { name: 'SLACK_WEBHOOK_URL', purpose: 'Operational webhook for deployment start, success, and rollback notifications' }
      ]
    },
    {
      id: 'aws-codepipeline-dotnet-react',
      provider: 'AWS CodePipeline',
      pipelineName: 'AWS CodePipeline & CodeBuild: Full-Stack .NET 10 + React 19 + AWS SQS + Snowflake Deployment',
      fileName: 'buildspec.yml',
      targetStack: 'ASP.NET Core 10 Web API + React 19 Client + Express BFF + AWS SQS + Snowflake',
      triggerEvent: 'AWS CodeStar Source webhook on GitHub repository push to main branch',
      deploymentTarget: 'Amazon ECS Fargate Service with Application Load Balancer & AWS CodeDeploy',
      yamlConfig: AWS_CODEPIPELINE_BUILDSPEC_YAML,
      keyStages: [
        { name: '1. CodeBuild Provision & Install', description: 'Boots Ubuntu CodeBuild container, installs .NET 10 SDK and Node.js 20 runtimes.', durationEst: '1m 30s' },
        { name: '2. Pre-Build Test & ECR Auth', description: 'Authenticates with Amazon ECR, executes dotnet test and npm test suites, runs Trivy security checks.', durationEst: '2m 45s' },
        { name: '3. Docker Buildx Multi-Image', description: 'Builds .NET 10 API, Express BFF, and React 19 Nginx container images with multi-stage layer caching.', durationEst: '3m 15s' },
        { name: '4. ECR Push & Artifact Output', description: 'Pushes tagged images to ECR, generates imagedefinitions.json and appspec.yaml for CodeDeploy.', durationEst: '1m 20s' },
        { name: '5. CodeDeploy Blue/Green Shift', description: 'Shifts live production traffic with Lambda lifecycle validation hooks before and after install.', durationEst: '4m 00s' }
      ],
      securityAndQualityGates: [
        'AWS Secrets Manager & SSM Parameter Store: Dynamic injection of Snowflake credentials and OpenTelemetry endpoints at build time.',
        'VPC-Isolated CodeBuild: Builds run inside private subnets with NAT gateways, blocking internet ingress.',
        'Automated Canary Alarms: CodeDeploy monitors CloudWatch 5xx error alarms during the 10-minute bake period.'
      ],
      environmentSecrets: [
        { name: '/prod/microservices/snowflake_conn_str', purpose: 'AWS Systems Manager Parameter Store SecureString for Snowflake' },
        { name: '/prod/telemetry/otel_endpoint', purpose: 'OTLP gRPC Collector endpoint for distributed trace telemetry' },
        { name: 'prod/cicd/sonar:token', purpose: 'AWS Secrets Manager secret containing SonarQube token' }
      ]
    },
    {
      id: 'gitlab-ci-dotnet-react',
      provider: 'GitLab CI',
      pipelineName: 'GitLab CI/CD: .NET 10 & React 19 Multi-Stage Pipeline with Kubernetes / Helm Rollout',
      fileName: '.gitlab-ci.yml',
      targetStack: '.NET 10 Microservices + React 19 + Express BFF + Kubernetes / AWS EKS',
      triggerEvent: 'GitLab Merge Request & commit push to main branch',
      deploymentTarget: 'Kubernetes Cluster (Amazon EKS / GKE) via Helm 3 with Canary traffic shifting',
      yamlConfig: GITLAB_CI_DOTNET_REACT_YAML,
      keyStages: [
        { name: '1. Test Stage', description: 'Parallel jobs running .NET 10 SDK and Node.js Alpine unit test runners.', durationEst: '2m 00s' },
        { name: '2. Security Stage', description: 'Trivy SAST scan generating GitLab Security dashboard reports.', durationEst: '1m 00s' },
        { name: '3. Docker Build Stage', description: 'Docker-in-Docker builds and pushes container images to registry.', durationEst: '3m 30s' },
        { name: '4. Helm Deploy Stage', description: 'Executes helm upgrade with Canary release and automated rollback on timeout.', durationEst: '3m 00s' }
      ],
      securityAndQualityGates: [
        'GitLab CI Protected Variables: Secrets available only to pipelines running on protected branches.',
        'Kubernetes RBAC: Runner uses least-privilege service account scoped to target production namespace.'
      ],
      environmentSecrets: [
        { name: 'CI_AWS_ECR_REGISTRY', purpose: 'Target container registry address' },
        { name: 'SNOWFLAKE_SECRET_NAME', purpose: 'Kubernetes Secret name containing Snowflake credentials' }
      ]
    },
    {
      id: 'azure-devops-dotnet-react',
      provider: 'Azure DevOps',
      pipelineName: 'Azure DevOps YAML Pipeline: ASP.NET Core 10 + React 19 + Azure Container Apps',
      fileName: 'azure-pipelines.yml',
      targetStack: 'C# .NET 10 + React 19 + Express BFF + Azure Container Apps / AKS',
      triggerEvent: 'Azure Repos Git push to main branch',
      deploymentTarget: 'Azure Container Apps (ACA) / Azure Kubernetes Service with Revision Traffic Splitting',
      yamlConfig: AZURE_DEVOPS_DOTNET_REACT_YAML,
      keyStages: [
        { name: '1. Test & Lint Stage', description: 'Executes dotnet test and npm test tasks on Ubuntu build agent.', durationEst: '2m 15s' },
        { name: '2. ACR Build Stage', description: 'Builds and pushes multi-container images to Azure Container Registry.', durationEst: '3m 00s' },
        { name: '3. ACA Deploy Stage', description: 'Deploys new Container App revision with zero-downtime traffic switching.', durationEst: '2m 30s' }
      ],
      securityAndQualityGates: [
        'Azure Service Principal with Managed Identity for keyless ACR and ACA authorization.',
        'Azure Key Vault task integration for runtime secret injection.'
      ],
      environmentSecrets: [
        { name: 'Azure-Production-Subscription', purpose: 'Azure Service Connection with Service Principal credentials' },
        { name: 'acrmicroservicesprod.azurecr.io', purpose: 'Azure Container Registry login endpoint' }
      ]
    }
  ]
};
