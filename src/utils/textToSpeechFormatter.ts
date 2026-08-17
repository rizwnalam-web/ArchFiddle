import { ArchitectureData, ArchType } from '../../types';
import { AudioNarrationSection, AudioTrackMetadata, NarrationMode } from '../types/tts';

/**
 * Phonetic & Acronym Replacements for crystal-clear natural speech synthesis
 */
const ACRONYM_MAP: Record<string, string> = {
  'CI/CD': 'Continuous Integration and Continuous Delivery',
  'IaC': 'Infrastructure as Code',
  'K8s': 'Kubernetes',
  'gRPC': 'G-R-P-C',
  'REST': 'Rest',
  'RESTful': 'Rest-ful',
  'API': 'A-P-I',
  'APIs': 'A-P-Is',
  'ADR': 'Architecture Decision Record',
  'ADRs': 'Architecture Decision Records',
  'ESB': 'Enterprise Service Bus',
  'SOA': 'S-O-A, Service Oriented Architecture',
  'MVC': 'M-V-C',
  'MVP': 'M-V-P',
  'MVPs': 'M-V-Ps',
  'ORM': 'O-R-M',
  'CRUD': 'Crud',
  'CQRS': 'C-Q-R-S, Command Query Responsibility Segregation',
  'ETL': 'E-T-L',
  'B2B': 'B to B',
  'B2C': 'B to C',
  'PWA': 'Progressive Web App',
  'SLA': 'S-L-A',
  'SLAs': 'S-L-As',
  'SLO': 'S-L-O',
  'SLOs': 'S-L-Os',
  'IAM': 'I-A-M Identity and Access Management',
  'RBAC': 'Role Based Access Control',
  'ABAC': 'Attribute Based Access Control',
  'mTLS': 'Mutual T-L-S',
  'TLS': 'T-L-S',
  'JWT': 'J-W-T JSON Web Token',
  'JWTs': 'J-W-Ts',
  'SDK': 'S-D-K',
  'SDKs': 'S-D-Ks',
  'FIFO': 'First-In First-Out',
  'LIFO': 'Last-In First-Out',
  'WSDL': 'W-S-D-L',
  'SOAP': 'Soap',
  'JSON': 'Jason',
  'YAML': 'Yaml',
  'DB': 'Database',
  'DBs': 'Databases',
  'SQL': 'Sequel',
  'NoSQL': 'No-Sequel',
  'AWS': 'A-W-S',
  'GCP': 'Google Cloud Platform',
  'UI': 'User Interface',
  'UX': 'User Experience',
  'IPC': 'Inter-Process Communication',
  'CDN': 'C-D-N',
  'CDNs': 'C-D-Ns',
  'SSE': 'Server-Sent Events',
  'TPS': 'Transactions per second',
  'QPS': 'Queries per second',
  'RPS': 'Requests per second',
  'RTO': 'Recovery Time Objective',
  'RPO': 'Recovery Point Objective',
  'MVCC': 'Multi-Version Concurrency Control',
  'ACID': 'A-C-I-D',
  '2PC': 'Two-Phase Commit',
  'DLQ': 'Dead Letter Queue',
  'OPA': 'Open Policy Agent',
};

/**
 * Clean & normalize text for Natural Speech Synthesis
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';

  let cleaned = text
    // Remove markdown formatting
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/#+\s+/g, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/•\s*/g, '')
    .replace(/->|→/g, ' to ')
    .replace(/&/g, ' and ')
    .replace(/\//g, ' or ')
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Replace recognized technical acronyms
  Object.entries(ACRONYM_MAP).forEach(([acronym, replacement]) => {
    const regex = new RegExp(`\\b${acronym}\\b`, 'g');
    cleaned = cleaned.replace(regex, replacement);
  });

  return cleaned;
}

/**
 * Split text into distinct sentences for reliable utterance tracking and highlighting
 */
export function splitIntoSentences(text: string): string[] {
  if (!text) return [];

  // Match sentences ending in punctuation or line breaks
  const rawSentences = text
    .split(/(?<=[.?!;:])\s+(?=[A-Z0-9"'])/g)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // If split produced nothing or only 1 huge block, fall back to period split
  if (rawSentences.length <= 1 && text.length > 180) {
    return text.split(/\.\s+/).map(s => s.trim().endsWith('.') ? s : `${s}.`).filter(s => s.length > 2);
  }

  return rawSentences.length > 0 ? rawSentences : [text];
}

/**
 * Estimate audio duration in seconds based on word count (~145 wpm)
 */
export function estimateDurationSeconds(text: string, rate = 1.0): number {
  if (!text) return 0;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const wordsPerSecond = (145 * rate) / 60;
  return Math.max(2, Math.round(wordCount / wordsPerSecond));
}

/**
 * Format time in mm:ss format
 */
export function formatAudioTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 1. Executive Briefing Track (1.5-2 minutes high-yield audio overview)
 */
export function buildBriefingTrack(arch: ArchitectureData): AudioTrackMetadata {
  const sections: AudioNarrationSection[] = [];

  // Section 1: Paradigm & Core Philosophy
  const p1Text = cleanTextForSpeech(
    `Welcome to the audio briefing on ${arch.title}. Categorized under the ${arch.category} classification. ` +
    `The fundamental premise of this architecture is: ${arch.coreIdea}.`
  );
  sections.push({
    id: 'intro',
    title: 'Core Paradigm & Concept',
    subtitle: arch.title,
    text: p1Text,
    sentences: splitIntoSentences(p1Text),
    durationEstSeconds: estimateDurationSeconds(p1Text),
  });

  // Section 2: Ideal Use Cases & Production Fit
  const p2Text = cleanTextForSpeech(
    `Target Production Fit: This architecture is engineered specifically for: ${arch.useCase}. ` +
    (arch.categoryDesc ? `In enterprise context: ${arch.categoryDesc}` : '')
  );
  sections.push({
    id: 'use-cases',
    title: 'Target Use Cases & Production Fit',
    subtitle: 'When to adopt',
    text: p2Text,
    sentences: splitIntoSentences(p2Text),
    durationEstSeconds: estimateDurationSeconds(p2Text),
  });

  // Section 3: Engineering Characteristics & Team Scale
  const est = arch.estimation;
  const p3Text = cleanTextForSpeech(
    `Engineering Profile: Development speed is rated as ${est.devSpeed}. ${est.devSpeedDesc} ` +
    `Infrastructure cost is ${est.infraCost}, with an architectural complexity score of ${est.complexityScore} out of 10, typically operated by teams of ${est.teamSize}.`
  );
  sections.push({
    id: 'complexity',
    title: 'Complexity, Velocity & Cost',
    subtitle: `Score: ${est.complexityScore}/10`,
    text: p3Text,
    sentences: splitIntoSentences(p3Text),
    durationEstSeconds: estimateDurationSeconds(p3Text),
  });

  // Section 4: Key Trade-offs & Strengths
  const prosList = arch.pros.slice(0, 3).join(', ');
  const consList = arch.cons.slice(0, 3).join(', ');
  const p4Text = cleanTextForSpeech(
    `Strategic Trade-offs: Key competitive advantages include: ${prosList}. ` +
    `Conversely, the primary architectural constraints to mitigate are: ${consList}.`
  );
  sections.push({
    id: 'tradeoffs',
    title: 'Key Strengths & Trade-offs',
    subtitle: 'Pros vs Cons',
    text: p4Text,
    sentences: splitIntoSentences(p4Text),
    durationEstSeconds: estimateDurationSeconds(p4Text),
  });

  // Section 5: Architect's Verdict
  const p5Text = cleanTextForSpeech(
    `Principal Architect Verdict: When implementing ${arch.title}, ensure your organization's tooling, observability, and team maturity match its operational demands. This concludes the executive summary.`
  );
  sections.push({
    id: 'verdict',
    title: "Principal Architect's Verdict",
    subtitle: 'Summary wrap-up',
    text: p5Text,
    sentences: splitIntoSentences(p5Text),
    durationEstSeconds: estimateDurationSeconds(p5Text),
  });

  const totalDuration = sections.reduce((acc, s) => acc + s.durationEstSeconds, 0);

  return {
    archId: arch.id,
    title: arch.title,
    category: arch.category,
    mode: 'briefing',
    totalDurationEstSeconds: totalDuration,
    sections,
  };
}

/**
 * 2. Complete Architecture Masterclass Track (7-9 minutes end-to-end walkthrough covering ALL architectural pillars)
 */
export function buildComprehensiveTrack(arch: ArchitectureData): AudioTrackMetadata {
  const sections: AudioNarrationSection[] = [];
  const spec = arch.deepDiveSpec;

  // Chapter 1: Foundational Paradigm & Taxonomy
  const tagsStr = arch.tags && arch.tags.length > 0 ? `Key architectural tags: ${arch.tags.join(', ')}.` : '';
  const prereqsStr = arch.prerequisites.length > 0 ? `Required operational prerequisites: ${arch.prerequisites.join(', ')}.` : '';
  const introText = cleanTextForSpeech(
    `Welcome to the complete architectural masterclass on ${arch.title}. ` +
    `Categorized under the ${arch.category} domain. ` +
    (arch.categoryDesc ? `${arch.categoryDesc} ` : '') +
    `Foundational Premise: ${arch.coreIdea}. ` +
    `${tagsStr} ` +
    `${prereqsStr}`
  );
  sections.push({
    id: 'chapter-1-foundations',
    title: 'Chapter 1: Foundations & Architecture Philosophy',
    subtitle: arch.title,
    text: introText,
    sentences: splitIntoSentences(introText),
    durationEstSeconds: estimateDurationSeconds(introText),
  });

  // Chapter 2: Component Topology, Deployment Architecture & Anti-Patterns
  const descParagraphs = arch.description.split('\n\n').filter(Boolean);
  const topologyText = cleanTextForSpeech(
    `Component Topology and Deployment Architecture: ${descParagraphs.join(' ')} ` +
    `Primary use cases where this architecture thrives: ${arch.useCase}.`
  );
  sections.push({
    id: 'chapter-2-topology',
    title: 'Chapter 2: Topology, Deployment & Anti-Patterns',
    subtitle: 'Deployment Boundaries & Pitfalls',
    text: topologyText,
    sentences: splitIntoSentences(topologyText),
    durationEstSeconds: estimateDurationSeconds(topologyText),
  });

  // Chapter 3: End-to-End Request & Data Flow Lifecycle
  if (spec && spec.dataFlowSteps && spec.dataFlowSteps.length > 0) {
    const stepsNarrative = spec.dataFlowSteps.map((step) => {
      return `Step ${step.step}, Phase: ${step.phase}. Title: ${step.title}. Involving components: ${step.components.join(', ')}. Operating over protocol ${step.protocol} with an expected latency of ${step.latency}. Operational description: ${step.description}`;
    }).join(' ');

    const dataFlowText = cleanTextForSpeech(
      `End-to-End Request and Data Flow Lifecycle: Across ${spec.dataFlowSteps.length} sequential phases. ${stepsNarrative}`
    );
    sections.push({
      id: 'chapter-3-dataflow',
      title: 'Chapter 3: End-to-End Request & Data Flow Lifecycle',
      subtitle: `${spec.dataFlowSteps.length} Sequential Pipeline Steps`,
      text: dataFlowText,
      sentences: splitIntoSentences(dataFlowText),
      durationEstSeconds: estimateDurationSeconds(dataFlowText),
    });
  }

  // Chapter 4: Concurrency Model, Isolation Levels & State Management
  if (spec && spec.concurrencyAndState) {
    const cs = spec.concurrencyAndState;
    const patternsStr = cs.distributedPatterns && cs.distributedPatterns.length > 0
      ? `Distributed patterns implemented: ${cs.distributedPatterns.join(', ')}.`
      : '';
    const concurrencyText = cleanTextForSpeech(
      `Concurrency, Isolation and State Architecture: ` +
      `Transaction Scope: ${cs.transactionScope}. ` +
      `Database Isolation Level: ${cs.isolationLevel}. ` +
      `Locking Strategy: ${cs.lockingStrategy}. ` +
      `${patternsStr} ` +
      `State Storage and Memory Topology: ${cs.stateDescription}`
    );
    sections.push({
      id: 'chapter-4-concurrency',
      title: 'Chapter 4: Concurrency, Isolation & State Topology',
      subtitle: cs.transactionScope,
      text: concurrencyText,
      sentences: splitIntoSentences(concurrencyText),
      durationEstSeconds: estimateDurationSeconds(concurrencyText),
    });
  }

  // Chapter 5: Production Failure Modes, Chaos Scenarios & Automated Resilience
  if (spec && spec.failureModes && spec.failureModes.length > 0) {
    const failureNarrative = spec.failureModes.map((fm, idx) => {
      return `Failure Scenario ${idx + 1}: ${fm.failureScenario}. Impact Level: ${fm.impactLevel}. Root Cause: ${fm.rootCause}. Telemetry Detection Signal: ${fm.detectionSignal}. Automated Mitigation: ${fm.mitigationMechanism}. Resilience Pattern: ${fm.resiliencePattern}.`;
    }).join(' ');

    const resilienceText = cleanTextForSpeech(
      `Production Failure Modes and Chaos Resilience Engineering: Analyzing ${spec.failureModes.length} critical failure scenarios. ${failureNarrative}`
    );
    sections.push({
      id: 'chapter-5-resilience',
      title: 'Chapter 5: Failure Modes & Chaos Resilience',
      subtitle: `${spec.failureModes.length} Chaos Scenarios & Mitigations`,
      text: resilienceText,
      sentences: splitIntoSentences(resilienceText),
      durationEstSeconds: estimateDurationSeconds(resilienceText),
    });
  }

  // Chapter 6: Zero-Trust Security, Identity & Compliance Guardrails
  if (spec && spec.securityModel) {
    const sec = spec.securityModel;
    const certsStr = sec.complianceCertifications && sec.complianceCertifications.length > 0
      ? `Target compliance certifications: ${sec.complianceCertifications.join(', ')}.`
      : '';
    const securityText = cleanTextForSpeech(
      `Zero-Trust Security, Identity and Compliance Guardrails: ` +
      `Authentication Architecture: ${sec.authentication}. ` +
      `Authorization and Access Policies: ${sec.authorization}. ` +
      `Service-to-Service Identity: ${sec.serviceToServiceAuth}. ` +
      `Secret Management: ${sec.secretManagement}. ` +
      `Data Protection in Transit and at Rest: ${sec.dataProtection}. ` +
      `${certsStr}`
    );
    sections.push({
      id: 'chapter-6-security',
      title: 'Chapter 6: Zero-Trust Security & Compliance',
      subtitle: 'Zero Trust & Data Protection',
      text: securityText,
      sentences: splitIntoSentences(securityText),
      durationEstSeconds: estimateDurationSeconds(securityText),
    });
  }

  // Chapter 7: Scalability Limits, Bottlenecks & High-Load Remediation
  if (spec && spec.scalabilityBottlenecks && spec.scalabilityBottlenecks.length > 0) {
    const bottleNarrative = spec.scalabilityBottlenecks.map((b, idx) => {
      return `Bottleneck ${idx + 1}: ${b.bottleneck}. Threshold Limit: ${b.threshold}. Degradation Symptom: ${b.symptom}. Engineered Solution: ${b.engineeringSolution}.`;
    }).join(' ');

    const scalabilityText = cleanTextForSpeech(
      `Scalability Bottlenecks and High-Load Capacity Engineering: ${bottleNarrative}`
    );
    sections.push({
      id: 'chapter-7-scalability',
      title: 'Chapter 7: Scalability Limits & Bottlenecks',
      subtitle: `${spec.scalabilityBottlenecks.length} Scale Remediation Strategies`,
      text: scalabilityText,
      sentences: splitIntoSentences(scalabilityText),
      durationEstSeconds: estimateDurationSeconds(scalabilityText),
    });
  }

  // Chapter 8: Real-World Enterprise Production Case Studies
  if (spec && spec.caseStudies && spec.caseStudies.length > 0) {
    const caseStudiesNarrative = spec.caseStudies.map((cs, idx) => {
      return `Case Study ${idx + 1}: Company ${cs.company} at production scale of ${cs.scaleMetric}. Challenge Encountered: ${cs.problemEncountered}. Engineered Architectural Solution: ${cs.architecturalSolution}. Key Strategic Takeaway: ${cs.keyTakeaway}.`;
    }).join(' ');

    const caseStudiesText = cleanTextForSpeech(
      `Real-World Enterprise Production Case Studies: ${caseStudiesNarrative}`
    );
    sections.push({
      id: 'chapter-8-casestudies',
      title: 'Chapter 8: Enterprise Case Studies at Scale',
      subtitle: `${spec.caseStudies.length} Real-World Case Studies`,
      text: caseStudiesText,
      sentences: splitIntoSentences(caseStudiesText),
      durationEstSeconds: estimateDurationSeconds(caseStudiesText),
    });
  }

  // Chapter 9: Architecture Decision Record (ADR) Specimen Analysis
  if (spec && spec.adrSpecimen) {
    const adr = spec.adrSpecimen;
    const posConsequences = adr.positiveConsequences && adr.positiveConsequences.length > 0
      ? `Positive consequences: ${adr.positiveConsequences.join(', ')}.`
      : '';
    const negConsequences = adr.negativeConsequences && adr.negativeConsequences.length > 0
      ? `Trade-offs and architectural constraints: ${adr.negativeConsequences.join(', ')}.`
      : '';
    const adrText = cleanTextForSpeech(
      `Production Architecture Decision Record Specimen: Title: ${adr.title}. ` +
      `Lifecycle Status: ${adr.status}. ` +
      `Business and Architectural Context: ${adr.context}. ` +
      `Adopted Architectural Decision: ${adr.decision}. ` +
      `${posConsequences} ` +
      `${negConsequences} ` +
      (adr.complianceNotes ? `Regulatory & Compliance Notes: ${adr.complianceNotes}` : '')
    );
    sections.push({
      id: 'chapter-9-adr',
      title: 'Chapter 9: Architecture Decision Record (ADR)',
      subtitle: adr.title,
      text: adrText,
      sentences: splitIntoSentences(adrText),
      durationEstSeconds: estimateDurationSeconds(adrText),
    });
  }

  // Chapter 10: Reference Tech Ecosystem & Engineering Matrix Summary
  const est = arch.estimation;
  const prosText = arch.pros.join(', ');
  const consText = arch.cons.join(', ');
  const wrapupText = cleanTextForSpeech(
    `Reference Technology Ecosystem and Engineering Execution Matrix: ` +
    `Recommended technology stacks: ${arch.technologyStack.join(', ')}. ` +
    `Development Velocity: ${est.devSpeed}. ${est.devSpeedDesc} ` +
    `Infrastructure Cost Profile: ${est.infraCost}. ${est.infraCostDesc} ` +
    `Operating Team Scale: ${est.teamSize}. ` +
    `Complexity Rating: ${est.complexityScore} out of 10. ` +
    `Ongoing Maintenance Effort: ${est.maintenanceEffort}. ` +
    `Summary of Strengths: ${prosText}. ` +
    `Summary of Trade-Offs: ${consText}. ` +
    `This concludes the comprehensive architectural masterclass on ${arch.title}.`
  );
  sections.push({
    id: 'chapter-10-summary',
    title: 'Chapter 10: Tech Ecosystem & Engineering Matrix',
    subtitle: `Complexity: ${est.complexityScore}/10 | Velocity: ${est.devSpeed}`,
    text: wrapupText,
    sentences: splitIntoSentences(wrapupText),
    durationEstSeconds: estimateDurationSeconds(wrapupText),
  });

  const totalDuration = sections.reduce((acc, s) => acc + s.durationEstSeconds, 0);

  return {
    archId: arch.id,
    title: arch.title,
    category: arch.category,
    mode: 'comprehensive',
    totalDurationEstSeconds: totalDuration,
    sections,
  };
}

/**
 * 3. Specialized Pillar Track: Request & Data Flow Lifecycle
 */
export function buildDataFlowTrack(arch: ArchitectureData): AudioTrackMetadata {
  const spec = arch.deepDiveSpec;
  const sections: AudioNarrationSection[] = [];

  if (!spec || !spec.dataFlowSteps || spec.dataFlowSteps.length === 0) {
    return buildBriefingTrack(arch);
  }

  // Intro
  const intro = cleanTextForSpeech(
    `Welcome to the deep-dive request data flow analysis for ${arch.title}. We will walk step-by-step through the ${spec.dataFlowSteps.length} sequential execution stages from client ingress to database persistence and response egress.`
  );
  sections.push({
    id: 'df-intro',
    title: 'Request Flow Overview',
    subtitle: `${spec.dataFlowSteps.length} Pipeline Stages`,
    text: intro,
    sentences: splitIntoSentences(intro),
    durationEstSeconds: estimateDurationSeconds(intro),
  });

  // Each Step
  spec.dataFlowSteps.forEach((step) => {
    const stepText = cleanTextForSpeech(
      `Step ${step.step}: ${step.title}. Phase category: ${step.phase}. ` +
      `Participating components: ${step.components.join(', ')}. ` +
      `Network protocol: ${step.protocol}, with typical latency of ${step.latency}. ` +
      `Execution details: ${step.description}`
    );
    sections.push({
      id: `df-step-${step.step}`,
      title: `Step ${step.step}: ${step.title}`,
      subtitle: `${step.phase} (${step.protocol}, ${step.latency})`,
      text: stepText,
      sentences: splitIntoSentences(stepText),
      durationEstSeconds: estimateDurationSeconds(stepText),
    });
  });

  const totalDuration = sections.reduce((acc, s) => acc + s.durationEstSeconds, 0);

  return {
    archId: arch.id,
    title: `${arch.title}: Request Data Flow`,
    category: arch.category,
    mode: 'dataflow',
    totalDurationEstSeconds: totalDuration,
    sections,
  };
}

/**
 * 4. Specialized Pillar Track: Concurrency, Isolation & State Management
 */
export function buildConcurrencyTrack(arch: ArchitectureData): AudioTrackMetadata {
  const spec = arch.deepDiveSpec;
  const sections: AudioNarrationSection[] = [];

  if (!spec || !spec.concurrencyAndState) {
    return buildBriefingTrack(arch);
  }

  const cs = spec.concurrencyAndState;

  // Section 1: Transaction Scope & Isolation
  const sec1Text = cleanTextForSpeech(
    `Concurrency and Transaction Boundaries for ${arch.title}. ` +
    `Transaction Scope: ${cs.transactionScope}. ` +
    `Database Isolation Level: ${cs.isolationLevel}.`
  );
  sections.push({
    id: 'cs-isolation',
    title: 'Transaction Scope & Isolation Levels',
    subtitle: cs.isolationLevel,
    text: sec1Text,
    sentences: splitIntoSentences(sec1Text),
    durationEstSeconds: estimateDurationSeconds(sec1Text),
  });

  // Section 2: Locking Strategy & Concurrency Control
  const sec2Text = cleanTextForSpeech(
    `Locking Strategy: ${cs.lockingStrategy}.`
  );
  sections.push({
    id: 'cs-locking',
    title: 'Locking & Concurrency Control',
    subtitle: 'Optimistic vs Pessimistic Locking',
    text: sec2Text,
    sentences: splitIntoSentences(sec2Text),
    durationEstSeconds: estimateDurationSeconds(sec2Text),
  });

  // Section 3: Distributed Patterns & State Storage
  const sec3Text = cleanTextForSpeech(
    `Distributed architectural patterns utilized: ${cs.distributedPatterns.join(', ')}. ` +
    `State storage and memory model: ${cs.stateDescription}`
  );
  sections.push({
    id: 'cs-patterns',
    title: 'Distributed Patterns & State Storage',
    subtitle: `${cs.distributedPatterns.length} Architectural Patterns`,
    text: sec3Text,
    sentences: splitIntoSentences(sec3Text),
    durationEstSeconds: estimateDurationSeconds(sec3Text),
  });

  const totalDuration = sections.reduce((acc, s) => acc + s.durationEstSeconds, 0);

  return {
    archId: arch.id,
    title: `${arch.title}: Concurrency & State Model`,
    category: arch.category,
    mode: 'concurrency',
    totalDurationEstSeconds: totalDuration,
    sections,
  };
}

/**
 * 5. Specialized Pillar Track: Failure Modes & Chaos Resilience
 */
export function buildResilienceTrack(arch: ArchitectureData): AudioTrackMetadata {
  const spec = arch.deepDiveSpec;
  const sections: AudioNarrationSection[] = [];

  if (!spec || !spec.failureModes || spec.failureModes.length === 0) {
    return buildBriefingTrack(arch);
  }

  spec.failureModes.forEach((fm, idx) => {
    const text = cleanTextForSpeech(
      `Chaos Failure Scenario ${idx + 1}: ${fm.failureScenario}. ` +
      `Severity Impact: ${fm.impactLevel}. ` +
      `Root Cause: ${fm.rootCause}. ` +
      `Telemetry Detection Signals: ${fm.detectionSignal}. ` +
      `Automated Mitigation Mechanism: ${fm.mitigationMechanism}. ` +
      `Architectural Resilience Pattern: ${fm.resiliencePattern}.`
    );
    sections.push({
      id: `fm-${idx}`,
      title: `Scenario ${idx + 1}: ${fm.failureScenario}`,
      subtitle: `Impact: ${fm.impactLevel} | ${fm.resiliencePattern}`,
      text,
      sentences: splitIntoSentences(text),
      durationEstSeconds: estimateDurationSeconds(text),
    });
  });

  const totalDuration = sections.reduce((acc, s) => acc + s.durationEstSeconds, 0);

  return {
    archId: arch.id,
    title: `${arch.title}: Failure Modes & Chaos Engineering`,
    category: arch.category,
    mode: 'resilience',
    totalDurationEstSeconds: totalDuration,
    sections,
  };
}

/**
 * 6. Specialized Pillar Track: Zero-Trust Security & Compliance
 */
export function buildSecurityTrack(arch: ArchitectureData): AudioTrackMetadata {
  const spec = arch.deepDiveSpec;
  const sections: AudioNarrationSection[] = [];

  if (!spec || !spec.securityModel) {
    return buildBriefingTrack(arch);
  }

  const sec = spec.securityModel;

  const authText = cleanTextForSpeech(
    `Zero-Trust Authentication and Authorization for ${arch.title}. ` +
    `Authentication Topology: ${sec.authentication}. ` +
    `Authorization and Access Policies: ${sec.authorization}.`
  );
  sections.push({
    id: 'sec-auth',
    title: 'Authentication & Access Governance',
    subtitle: 'Zero-Trust Identity',
    text: authText,
    sentences: splitIntoSentences(authText),
    durationEstSeconds: estimateDurationSeconds(authText),
  });

  const infraText = cleanTextForSpeech(
    `Service Identity, Secret Management, and Cryptography: ` +
    `Service-to-Service Identity: ${sec.serviceToServiceAuth}. ` +
    `Secret Management: ${sec.secretManagement}. ` +
    `Data Protection at Rest and in Transit: ${sec.dataProtection}. ` +
    `Compliance Certifications: ${sec.complianceCertifications.join(', ')}.`
  );
  sections.push({
    id: 'sec-infra',
    title: 'Service Identity, Secrets & Encryption',
    subtitle: 'mTLS & Data Protection',
    text: infraText,
    sentences: splitIntoSentences(infraText),
    durationEstSeconds: estimateDurationSeconds(infraText),
  });

  const totalDuration = sections.reduce((acc, s) => acc + s.durationEstSeconds, 0);

  return {
    archId: arch.id,
    title: `${arch.title}: Zero-Trust Security`,
    category: arch.category,
    mode: 'security',
    totalDurationEstSeconds: totalDuration,
    sections,
  };
}

/**
 * 7. Specialized Pillar Track: Scalability Limits & Bottlenecks
 */
export function buildScalabilityTrack(arch: ArchitectureData): AudioTrackMetadata {
  const spec = arch.deepDiveSpec;
  const sections: AudioNarrationSection[] = [];

  if (!spec || !spec.scalabilityBottlenecks || spec.scalabilityBottlenecks.length === 0) {
    return buildBriefingTrack(arch);
  }

  spec.scalabilityBottlenecks.forEach((b, idx) => {
    const text = cleanTextForSpeech(
      `Scalability Bottleneck ${idx + 1}: ${b.bottleneck}. ` +
      `Scale Threshold Limit: ${b.threshold}. ` +
      `System Degradation Symptom: ${b.symptom}. ` +
      `Engineered Remediation Solution: ${b.engineeringSolution}.`
    );
    sections.push({
      id: `scale-${idx}`,
      title: `Bottleneck ${idx + 1}: ${b.bottleneck}`,
      subtitle: `Threshold: ${b.threshold}`,
      text,
      sentences: splitIntoSentences(text),
      durationEstSeconds: estimateDurationSeconds(text),
    });
  });

  const totalDuration = sections.reduce((acc, s) => acc + s.durationEstSeconds, 0);

  return {
    archId: arch.id,
    title: `${arch.title}: Scalability Bottlenecks`,
    category: arch.category,
    mode: 'scalability',
    totalDurationEstSeconds: totalDuration,
    sections,
  };
}

/**
 * 8. Specialized Pillar Track: Enterprise Case Studies
 */
export function buildCaseStudiesTrack(arch: ArchitectureData): AudioTrackMetadata {
  const spec = arch.deepDiveSpec;
  const sections: AudioNarrationSection[] = [];

  if (!spec || !spec.caseStudies || spec.caseStudies.length === 0) {
    return buildBriefingTrack(arch);
  }

  spec.caseStudies.forEach((cs, idx) => {
    const text = cleanTextForSpeech(
      `Real-World Case Study ${idx + 1}: ${cs.company}. ` +
      `Operating Scale Metric: ${cs.scaleMetric}. ` +
      `Production Challenge Encountered: ${cs.problemEncountered}. ` +
      `Architectural Solution Implemented: ${cs.architecturalSolution}. ` +
      `Principal Key Takeaway: ${cs.keyTakeaway}.`
    );
    sections.push({
      id: `cs-${idx}`,
      title: `${cs.company} Case Study`,
      subtitle: `Scale: ${cs.scaleMetric}`,
      text,
      sentences: splitIntoSentences(text),
      durationEstSeconds: estimateDurationSeconds(text),
    });
  });

  const totalDuration = sections.reduce((acc, s) => acc + s.durationEstSeconds, 0);

  return {
    archId: arch.id,
    title: `${arch.title}: Case Studies at Scale`,
    category: arch.category,
    mode: 'casestudies',
    totalDurationEstSeconds: totalDuration,
    sections,
  };
}

/**
 * 9. Specialized Pillar Track: Architecture Decision Record (ADR)
 */
export function buildAdrTrack(arch: ArchitectureData): AudioTrackMetadata {
  const spec = arch.deepDiveSpec;
  const sections: AudioNarrationSection[] = [];

  if (!spec || !spec.adrSpecimen) {
    return buildBriefingTrack(arch);
  }

  const adr = spec.adrSpecimen;

  // Context & Problem
  const c1Text = cleanTextForSpeech(
    `Architecture Decision Record Specimen: ${adr.title}. ` +
    `Status: ${adr.status}. ` +
    `Problem Context and Business Forces: ${adr.context}.`
  );
  sections.push({
    id: 'adr-context',
    title: 'Context & Decision Forces',
    subtitle: adr.status,
    text: c1Text,
    sentences: splitIntoSentences(c1Text),
    durationEstSeconds: estimateDurationSeconds(c1Text),
  });

  // Adopted Decision
  const c2Text = cleanTextForSpeech(
    `Adopted Architecture Decision: ${adr.decision}.`
  );
  sections.push({
    id: 'adr-decision',
    title: 'Adopted Architectural Decision',
    subtitle: 'Design Solution',
    text: c2Text,
    sentences: splitIntoSentences(c2Text),
    durationEstSeconds: estimateDurationSeconds(c2Text),
  });

  // Consequences
  const c3Text = cleanTextForSpeech(
    `Positive Consequences: ${adr.positiveConsequences.join(', ')}. ` +
    `Trade-offs and Structural Constraints: ${adr.negativeConsequences.join(', ')}. ` +
    (adr.complianceNotes ? `Compliance Notes: ${adr.complianceNotes}` : '')
  );
  sections.push({
    id: 'adr-consequences',
    title: 'Consequences & Compliance',
    subtitle: 'Pros vs Constraints',
    text: c3Text,
    sentences: splitIntoSentences(c3Text),
    durationEstSeconds: estimateDurationSeconds(c3Text),
  });

  const totalDuration = sections.reduce((acc, s) => acc + s.durationEstSeconds, 0);

  return {
    archId: arch.id,
    title: `${arch.title}: ADR Analysis`,
    category: arch.category,
    mode: 'adr',
    totalDurationEstSeconds: totalDuration,
    sections,
  };
}

/**
 * Universal Track Builder Dispatcher
 */
export function buildTrackForMode(arch: ArchitectureData, mode: NarrationMode = 'comprehensive'): AudioTrackMetadata {
  switch (mode) {
    case 'briefing':
      return buildBriefingTrack(arch);
    case 'comprehensive':
    case 'deepdive':
      return buildComprehensiveTrack(arch);
    case 'dataflow':
      return buildDataFlowTrack(arch);
    case 'concurrency':
      return buildConcurrencyTrack(arch);
    case 'resilience':
      return buildResilienceTrack(arch);
    case 'security':
      return buildSecurityTrack(arch);
    case 'scalability':
      return buildScalabilityTrack(arch);
    case 'casestudies':
      return buildCaseStudiesTrack(arch);
    case 'adr':
      return buildAdrTrack(arch);
    default:
      return buildComprehensiveTrack(arch);
  }
}

/**
 * Build a single custom snippet track for specific card read-aloud buttons
 */
export function buildCustomSnippetTrack(
  title: string,
  subtitle: string,
  rawText: string,
  archId: ArchType,
  category = '' as any
): AudioTrackMetadata {
  const cleaned = cleanTextForSpeech(rawText);
  const sentences = splitIntoSentences(cleaned);
  const duration = estimateDurationSeconds(cleaned);

  const section: AudioNarrationSection = {
    id: 'snippet',
    title,
    subtitle,
    text: cleaned,
    sentences,
    durationEstSeconds: duration,
  };

  return {
    archId,
    title,
    category,
    mode: 'custom',
    totalDurationEstSeconds: duration,
    sections: [section],
  };
}
