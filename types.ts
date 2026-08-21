
export enum ArchType {
  Monolithic = 'Monolithic',
  Layered = 'Layered',
  SOA = 'SOA',
  Microservices = 'Microservices',
  EventDriven = 'Event-Driven',
  Serverless = 'Serverless',
  WebOriented = 'Web-Oriented',
  MobileFirst = 'Mobile-First',
  ContainerNative = 'Container-Native',
  GitOps = 'GitOps & IaC',
  Reactive = 'Reactive',
  SpaceBased = 'Space-Based',
  EdgeComputing = 'Edge Computing',
}

export enum ArchCategory {
  Enterprise = 'Enterprise Systems',
  CloudNative = 'Cloud-Native & Distributed',
  DevOpsInfra = 'DevOps & Infrastructure',
  RealtimeScale = 'Real-time & High Scale',
  WebMobileEdge = 'Web, Mobile & Edge',
}

export interface EstimationData {
  devSpeed: 'Rapid' | 'Moderate' | 'Slow';
  devSpeedDesc: string;
  infraCost: 'Low' | 'Medium' | 'High' | 'Variable';
  infraCostDesc: string;
  teamSize: string; // e.g. "1-5 devs"
  complexityScore: number; // 1-10
  maintenanceEffort: 'Low' | 'Medium' | 'High' | 'Very High';
}

export interface DataFlowStep {
  step: number;
  phase: string;
  title: string;
  description: string;
  components: string[];
  latency: string;
  protocol: string;
}

export interface ConcurrencyAndStateModel {
  transactionScope: string;
  isolationLevel: string;
  lockingStrategy: string;
  distributedPatterns: string[];
  stateDescription: string;
}

export interface FailureMode {
  failureScenario: string;
  impactLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  rootCause: string;
  detectionSignal: string;
  mitigationMechanism: string;
  resiliencePattern: string;
}

export interface SecurityModel {
  authentication: string;
  authorization: string;
  serviceToServiceAuth: string;
  secretManagement: string;
  dataProtection: string;
  complianceCertifications: string[];
}

export interface ScaleBottleneck {
  bottleneck: string;
  threshold: string;
  symptom: string;
  engineeringSolution: string;
}

export interface RealWorldCaseStudy {
  company: string;
  scaleMetric: string;
  problemEncountered: string;
  architecturalSolution: string;
  keyTakeaway: string;
}

export interface ArchitectureDecisionRecord {
  title: string;
  status: 'Proposed' | 'Accepted' | 'Superseded' | 'Deprecated';
  context: string;
  decision: string;
  positiveConsequences: string[];
  negativeConsequences: string[];
  complianceNotes: string;
}

export interface CiCdPipelineTemplate {
  id: string;
  provider: 'GitHub Actions' | 'AWS CodePipeline' | 'GitLab CI' | 'Azure DevOps';
  pipelineName: string;
  fileName: string;
  targetStack: string;
  triggerEvent: string;
  deploymentTarget: string;
  yamlConfig: string;
  keyStages: { name: string; description: string; durationEst: string }[];
  securityAndQualityGates: string[];
  environmentSecrets: { name: string; purpose: string }[];
}

export interface CiCdSpec {
  strategy: string;
  artifactRegistry: string;
  deploymentModel: 'Blue/Green' | 'Canary' | 'Rolling Update' | 'Serverless Multi-Region';
  rollbackMechanism: string;
  pipelines: CiCdPipelineTemplate[];
}

export interface DeepDiveArchitectureSpec {
  dataFlowSteps: DataFlowStep[];
  concurrencyAndState: ConcurrencyAndStateModel;
  failureModes: FailureMode[];
  securityModel: SecurityModel;
  scalabilityBottlenecks: ScaleBottleneck[];
  caseStudies: RealWorldCaseStudy[];
  adrSpecimen: ArchitectureDecisionRecord;
  ciCdSpec?: CiCdSpec;
}

export interface ArchitectureData {
  id: ArchType;
  title: string;
  category: ArchCategory;
  categoryDesc?: string;
  tags?: string[];
  coreIdea: string;
  useCase: string;
  description: string;
  technologyStack: string[];
  prerequisites: string[];
  pros: string[];
  cons: string[];
  estimation: EstimationData;
  deepDiveSpec?: DeepDiveArchitectureSpec;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
