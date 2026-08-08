
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
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
