import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  BookOpen,
  Award,
  ShieldCheck,
  Briefcase,
  Terminal,
  Code2,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronDown,
  Layers,
  Printer,
  Share2,
  Copy,
  Check,
  Search,
  RotateCcw,
  AlertTriangle,
  Play,
  TrendingUp,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  X,
  BadgeCheck,
  Workflow
} from 'lucide-react';
import {
  FDE_ROADMAP_PHASES,
  FDE_STUDY_RESOURCES,
  FDE_CASE_STUDIES,
  FDE_CERTIFICATION_EXAM,
  FDE_FLASHCARDS,
  FdePhase,
  FdeStudyResource,
  FdeCaseStudy,
  FdeQuizQuestion,
  FdeFlashcard
} from '../data/fdeData';
import { ArchType } from '../types';

interface FdeRoadmapModalProps {
  onClose: () => void;
  onSelectArchitecture?: (archId: ArchType) => void;
}

type TabType = 'roadmap' | 'study' | 'cases' | 'tools' | 'exam' | 'certificate';

export const FdeRoadmapModal: React.FC<FdeRoadmapModalProps> = ({ onClose, onSelectArchitecture }) => {
  const [activeTab, setActiveTab] = useState<TabType>('roadmap');
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Completed competencies state in localStorage
  const [completedCompetencies, setCompletedCompetencies] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fde_completed_competencies');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('fde_completed_competencies', JSON.stringify(completedCompetencies));
  }, [completedCompetencies]);

  const toggleCompetency = (id: string) => {
    setCompletedCompetencies(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // Total competencies count
  const allCompetencies = useMemo(() => {
    return FDE_ROADMAP_PHASES.flatMap(p => p.competencies);
  }, []);

  const progressPercent = Math.round((completedCompetencies.length / (allCompetencies.length || 1)) * 100);

  // Copy code helper
  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Study resources filter
  const [selectedStudyCategory, setSelectedStudyCategory] = useState<string>('ALL');
  const filteredStudyResources = useMemo(() => {
    return FDE_STUDY_RESOURCES.filter(res => {
      const matchesCat = selectedStudyCategory === 'ALL' || res.category === selectedStudyCategory;
      const matchesSearch = !searchQuery.trim() ||
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedStudyCategory, searchQuery]);

  // Flashcards state
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);

  // POC Estimator State
  const [estimatorParams, setEstimatorParams] = useState({
    deploymentTarget: 'Client_AWS_VPC',
    securityLevel: 'SOC2_Type2',
    dataSourcesCount: 3,
    dataVolumeGB: 500,
    hasAirGappedRequirement: false,
    hasCustomLLM: true,
    expectedRPS: 2500
  });

  const estimatedPocResult = useMemo(() => {
    let weeks = 2;
    let engineers = 2;
    let risk = 'LOW';
    let infraBudget = '$3,500 - $6,000';

    if (estimatorParams.deploymentTarget === 'OnPrem_AirGapped' || estimatorParams.hasAirGappedRequirement) {
      weeks += 2;
      engineers += 1;
      risk = 'HIGH';
      infraBudget = '$15,000 - $28,000';
    }

    if (estimatorParams.securityLevel === 'FedRAMP_High' || estimatorParams.securityLevel === 'IL5_Defense') {
      weeks += 1;
      risk = risk === 'HIGH' ? 'CRITICAL' : 'HIGH';
    }

    if (estimatorParams.dataSourcesCount > 4) {
      weeks += 1;
      engineers += 1;
    }

    if (estimatorParams.hasCustomLLM) {
      infraBudget = '$8,000 - $18,000';
    }

    return {
      weeks: Math.min(6, weeks),
      engineers,
      risk,
      infraBudget,
      recommendedTech: [
        'K3s / Air-Gapped Helm',
        'Debezium Kafka CDC',
        'DuckDB + Polars Staging',
        estimatorParams.hasCustomLLM ? 'vLLM on NVIDIA A100' : 'FastAPI REST Gateway',
        'Okta SAML 2.0 Auth Proxy'
      ]
    };
  }, [estimatorParams]);

  // War Room Incident Simulator State
  const [warRoomStep, setWarRoomStep] = useState(0);
  const [warRoomScore, setWarRoomScore] = useState(0);
  const [warRoomFeedback, setWarRoomFeedback] = useState<string | null>(null);

  const warRoomScenarios = [
    {
      title: 'Incident 1: 504 Timeouts During Live VP Presentation',
      situation: 'You are on client site at a major bank. During a live demonstration to the Chief Risk Officer, the dashboard shows "504 Gateway Timeout". The VP of Architecture looks at you sternly.',
      options: [
        {
          text: 'Blame the bank internal proxy server and ask the VP to refresh their page.',
          scoreDelta: -10,
          feedback: 'Never blame the client without proof. This creates immediate defensiveness.'
        },
        {
          text: 'Maintain composure, state that you will open server telemetry live on screen, identify the bottleneck (e.g. unindexed query), and explain the isolation safeguard.',
          scoreDelta: 20,
          feedback: 'Excellent. Calm, transparent technical leadership turns an error into a demonstration of competence.'
        },
        {
          text: 'Quickly restart all Kubernetes pods and hope the error goes away before anyone notices.',
          scoreDelta: -5,
          feedback: 'Blind restarts destroy forensic logs and memory traces needed for the root cause analysis.'
        }
      ]
    },
    {
      title: 'Incident 2: Unannounced 50GB Corrupt CSV Drop in Production',
      situation: 'At 2:00 AM, a client legacy mainframe drops a 50GB uncompressed CSV with malformed delimiters that crashes the worker node with an Out-of-Memory (OOM) error.',
      options: [
        {
          text: 'Deploy an in-memory Pandas script with a higher RAM allocation on AWS.',
          scoreDelta: -5,
          feedback: 'Throwing RAM at unscalable parsing will fail when the next 200GB drop arrives.'
        },
        {
          text: 'Implement a streaming chunk parser (Polars/io.Reader) with a dead-letter queue (DLQ) for malformed rows and notify client data leads with line-number error offsets.',
          scoreDelta: 20,
          feedback: 'Master-level FDE pattern. Streaming handles infinite file sizes while DLQ guarantees zero system halt.'
        },
        {
          text: 'Delete the corrupt CSV file from S3 and tell the client they must re-send clean data.',
          scoreDelta: -15,
          feedback: 'Deleting client data is a critical breach of enterprise trust.'
        }
      ]
    }
  ];

  // Certification Exam State
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [examTimeLeft, setExamTimeLeft] = useState(1200); // 20 minutes
  const [learnerName, setLearnerName] = useState(() => {
    return localStorage.getItem('fde_certificate_name') || 'Enterprise Software Architect';
  });
  const [certificateId, setCertificateId] = useState(() => {
    return localStorage.getItem('fde_certificate_id') || `FDE-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  });
  const [certificateEarned, setCertificateEarned] = useState<boolean>(() => {
    return localStorage.getItem('fde_certificate_earned') === 'true';
  });
  const [lastExamScore, setLastExamScore] = useState<number>(() => {
    const saved = localStorage.getItem('fde_exam_score');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Exam timer
  useEffect(() => {
    if (!examStarted || examSubmitted) return;
    const interval = setInterval(() => {
      setExamTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examStarted, examSubmitted]);

  const handleStartExam = () => {
    setUserAnswers({});
    setFlaggedQuestions([]);
    setExamTimeLeft(1200);
    setExamStarted(true);
    setExamSubmitted(false);
  };

  const handleSelectAnswer = (qId: number, optIdx: number) => {
    if (examSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const toggleFlagQuestion = (qId: number) => {
    setFlaggedQuestions(prev =>
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  const calculateScore = () => {
    let correct = 0;
    FDE_CERTIFICATION_EXAM.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        correct += 1;
      }
    });
    return Math.round((correct / FDE_CERTIFICATION_EXAM.length) * 100);
  };

  const handleSubmitExam = () => {
    setExamSubmitted(true);
    const score = calculateScore();
    setLastExamScore(score);
    localStorage.setItem('fde_exam_score', score.toString());
    if (score >= 75) {
      setCertificateEarned(true);
      localStorage.setItem('fde_certificate_earned', 'true');
      const newCertId = `FDE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      setCertificateId(newCertId);
      localStorage.setItem('fde_certificate_id', newCertId);
    }
  };

  const handleSaveName = (name: string) => {
    setLearnerName(name);
    localStorage.setItem('fde_certificate_name', name);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const selectedPhase = FDE_ROADMAP_PHASES.find(p => p.id === selectedPhaseId) || FDE_ROADMAP_PHASES[0];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-7xl h-[94vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-950/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-cyan-900/30">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-200 bg-clip-text text-transparent">
                  Forward Deployed Engineering (FDE) Academy
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 text-[10px] font-mono font-semibold">
                  Palantir • Scale AI • Databricks Spec
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Complete technical curriculum, enterprise study materials, real-world war rooms, and certified credentialing.
              </p>
            </div>
          </div>

          {/* Quick Progress Metric and Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-zinc-400">Readiness:</span>
              <div className="w-24 bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="font-mono font-bold text-cyan-300">{progressPercent}%</span>
            </div>

            {certificateEarned && (
              <button
                onClick={() => setActiveTab('certificate')}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-900/30 transition-transform active:scale-95"
              >
                <Award className="w-4 h-4 text-yellow-200" />
                <span>View Certificate</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-5 py-2.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'roadmap'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Workflow className="w-4 h-4" />
            <span>Curriculum & 6 Phases</span>
          </button>

          <button
            onClick={() => setActiveTab('study')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'study'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Study Material & Guides ({FDE_STUDY_RESOURCES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cases')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'cases'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Enterprise Case Studies ({FDE_CASE_STUDIES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'tools'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-900/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Interactive POC Tools & Simulators</span>
          </button>

          <button
            onClick={() => setActiveTab('exam')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'exam'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-900/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Certification Challenge {certificateEarned && '✓'}</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'certificate'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md shadow-yellow-900/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Official Credential Certificate</span>
          </button>
        </div>

        {/* Tab 1: 6-PHASE ROADMAP VIEW */}
        {activeTab === 'roadmap' && (
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Sidebar: Phases Navigator */}
            <div className="w-full md:w-80 bg-zinc-950/60 border-r border-zinc-800 flex flex-col shrink-0 overflow-y-auto custom-scrollbar p-3 space-y-2">
              <div className="px-2 py-1 flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                <span>Curriculum Roadmap</span>
                <span className="font-mono text-[10px] text-cyan-400">{completedCompetencies.length}/{allCompetencies.length} Done</span>
              </div>

              {FDE_ROADMAP_PHASES.map((phase) => {
                const phaseCompetencies = phase.competencies.map(c => c.id);
                const completedInPhase = phaseCompetencies.filter(id => completedCompetencies.includes(id)).length;
                const isAllDone = completedInPhase === phaseCompetencies.length && phaseCompetencies.length > 0;
                const isSelected = selectedPhaseId === phase.id;

                return (
                  <button
                    key={phase.id}
                    onClick={() => setSelectedPhaseId(phase.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? `bg-zinc-900 border-cyan-500/60 shadow-lg shadow-cyan-950/40 text-white`
                        : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{phase.icon}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {phase.estimatedWeeks}
                      </span>
                    </div>
                    <div className="font-bold text-xs leading-snug">{phase.title}</div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                      <span>{completedInPhase}/{phaseCompetencies.length} Competencies</span>
                      {isAllDone && <span className="text-emerald-400 font-semibold text-[10px] flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Mastered</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Main Content Area for Selected Phase */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-zinc-900/30">
              {/* Phase Header Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 space-y-3 relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${selectedPhase.badgeBg}`}>
                    Phase {selectedPhase.id} • {selectedPhase.estimatedWeeks}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">Core FDE Playbook</span>
                </div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{selectedPhase.icon}</span>
                  <span>{selectedPhase.title}</span>
                </h3>
                <p className="text-sm text-cyan-200/90 font-medium">
                  {selectedPhase.subtitle}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {selectedPhase.overview}
                </p>

                <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-200/90">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Strategic Importance: </span>
                    {selectedPhase.strategicImportance}
                  </div>
                </div>
              </div>

              {/* Core Objectives & Competency Checklist */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Objectives */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Phase Execution Objectives</span>
                  </h4>
                  <ul className="space-y-2">
                    {selectedPhase.coreObjectives.map((obj, i) => (
                      <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Trackable Competencies */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Trackable Competencies (Click to Verify)</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedPhase.competencies.map((comp) => {
                      const isDone = completedCompetencies.includes(comp.id);
                      return (
                        <div
                          key={comp.id}
                          onClick={() => toggleCompetency(comp.id)}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                            isDone
                              ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-100'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs">{comp.title}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                comp.level === 'Expert' ? 'bg-purple-900/60 text-purple-300' :
                                comp.level === 'Advanced' ? 'bg-blue-900/60 text-blue-300' :
                                'bg-zinc-800 text-zinc-300'
                              }`}>
                                {comp.level}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400">{comp.description}</p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {comp.skills.map((s, idx) => (
                                <span key={idx} className="text-[9px] bg-zinc-800/80 px-1.5 py-0.5 rounded text-zinc-300 font-mono">
                                  #{s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isDone ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-zinc-700 bg-zinc-900'
                          }`}>
                            {isDone && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Architectural Concepts & Tradeoffs */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Key Architectural Concepts & Engineering Trade-offs</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedPhase.keyArchitecturalConcepts.map((concept, idx) => (
                    <div key={idx} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                      <div className="text-xs font-bold text-indigo-300">{concept.title}</div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{concept.description}</p>
                      <div className="pt-2 border-t border-zinc-900 text-[10px] text-amber-300/90">
                        <span className="font-semibold text-amber-400">Trade-offs: </span>
                        {concept.tradeoffs}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real World Client War Story */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-zinc-900 to-indigo-950/40 border border-purple-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-purple-400" />
                    <span>Real-World Client War Story & Solution</span>
                  </h4>
                  <span className="text-[11px] font-mono text-purple-200 bg-purple-900/50 px-2 py-0.5 rounded border border-purple-700/50">
                    {selectedPhase.realWorldScenario.client}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-800 space-y-1">
                    <span className="font-bold text-rose-300">The Challenge:</span>
                    <p className="text-zinc-400 text-[11px]">{selectedPhase.realWorldScenario.challenge}</p>
                  </div>
                  <div className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-800 space-y-1">
                    <span className="font-bold text-cyan-300">FDE Solution:</span>
                    <p className="text-zinc-400 text-[11px]">{selectedPhase.realWorldScenario.solution}</p>
                  </div>
                  <div className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-800 space-y-1">
                    <span className="font-bold text-emerald-300">Commercial & Tech Impact:</span>
                    <p className="text-zinc-400 text-[11px]">{selectedPhase.realWorldScenario.impact}</p>
                  </div>
                </div>
              </div>

              {/* Downloadable / Copyable Code Artifact */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-xs text-white">{selectedPhase.codeArtifact.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-800 text-cyan-300 rounded border border-zinc-700">
                      {selectedPhase.codeArtifact.filename}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(selectedPhase.codeArtifact.code, selectedPhase.codeArtifact.filename)}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    {copiedCodeId === selectedPhase.codeArtifact.filename ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">{selectedPhase.codeArtifact.description}</p>
                <div className="bg-zinc-900/90 rounded-lg p-3 border border-zinc-800 max-h-72 overflow-y-auto custom-scrollbar font-mono text-[11px] text-zinc-200">
                  <pre>{selectedPhase.codeArtifact.code}</pre>
                </div>
              </div>

              {/* FDE Interview Drill for this Phase */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-rose-400" />
                  <span>Technical & Behavioral Interview Mastery</span>
                </h4>
                {selectedPhase.interviewQuestions.map((q, idx) => (
                  <div key={idx} className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-2">
                    <div className="font-semibold text-xs text-rose-200">{q.question}</div>
                    <div className="p-2.5 bg-zinc-900/80 rounded border border-zinc-800 text-[11px] text-emerald-200/90">
                      <span className="font-bold text-emerald-400">Expected High-Bar Answer: </span>
                      {q.expectedAnswer}
                    </div>
                    <div className="text-[10px] text-rose-400/90">
                      <span className="font-bold text-rose-300">Candidate Red Flags: </span>
                      {q.redFlags}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: STUDY MATERIAL & CHEAT SHEETS */}
        {activeTab === 'study' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-zinc-900/30">
            {/* Filter Bar & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
                <span className="text-xs font-semibold text-zinc-400 shrink-0">Category:</span>
                {['ALL', 'System Design', 'Data & Ontology', 'Air-Gapped Infra', 'Enterprise AI', 'Client Leadership'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedStudyCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                      selectedStudyCategory === cat
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles & blueprints..."
                  className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Flashcard Quick Mastery Drill Widget */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/60 to-zinc-900 border border-indigo-700/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-xs text-indigo-200">FDE Rapid Architectural Mental Model Flashcards</span>
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded">
                    Card {currentFlashcardIndex + 1} of {FDE_FLASHCARDS.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsFlashcardFlipped(false);
                      setCurrentFlashcardIndex(prev => (prev > 0 ? prev - 1 : FDE_FLASHCARDS.length - 1));
                    }}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => {
                      setIsFlashcardFlipped(false);
                      setCurrentFlashcardIndex(prev => (prev < FDE_FLASHCARDS.length - 1 ? prev + 1 : 0));
                    }}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Interactive Flip Card */}
              <div
                onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                className="p-6 bg-zinc-950/90 border border-zinc-800 rounded-xl cursor-pointer hover:border-indigo-500/50 transition-all min-h-36 flex flex-col justify-center items-center text-center space-y-2 select-none"
              >
                <span className="text-[10px] uppercase font-mono text-zinc-500">
                  Category: {FDE_FLASHCARDS[currentFlashcardIndex].category} • (Click to Flip)
                </span>
                {!isFlashcardFlipped ? (
                  <div className="text-sm sm:text-base font-bold text-indigo-100">
                    {FDE_FLASHCARDS[currentFlashcardIndex].front}
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm text-emerald-300 font-medium leading-relaxed max-w-2xl">
                    {FDE_FLASHCARDS[currentFlashcardIndex].back}
                  </div>
                )}
              </div>
            </div>

            {/* Articles List */}
            <div className="space-y-4">
              {filteredStudyResources.map((resource) => (
                <div key={resource.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {resource.category}
                      </span>
                      <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> {resource.readTime}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                      Level: {resource.difficulty}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{resource.title}</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">{resource.summary}</p>

                  {/* Key Takeaways */}
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-1.5">
                    <span className="text-[11px] font-bold text-cyan-400">Core Takeaways:</span>
                    <ul className="space-y-1">
                      {resource.keyTakeaways.map((tk, idx) => (
                        <li key={idx} className="text-[11px] text-zinc-300 flex items-start gap-1.5">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span>{tk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Markdown-style content view */}
                  <div className="p-3.5 bg-zinc-950/50 rounded-xl border border-zinc-800 text-xs text-zinc-300 space-y-2 font-sans leading-relaxed whitespace-pre-line">
                    {resource.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: ENTERPRISE CASE STUDIES */}
        {activeTab === 'cases' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-zinc-900/30">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Deconstructed Real-World FDE Case Studies</h3>
              <p className="text-xs text-zinc-400">
                True architectural blueprints from multi-million dollar deployments across Defense, Tier-1 Banking, and Healthcare.
              </p>
            </div>

            <div className="space-y-5">
              {FDE_CASE_STUDIES.map((cs) => (
                <div key={cs.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        {cs.companyArchetype}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">{cs.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800">
                        {cs.contractValue}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">{cs.timeframe}</span>
                    </div>
                  </div>

                  {/* Situation & Playbook */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                      <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> The Situation & Bottleneck
                      </span>
                      <p className="text-xs text-zinc-300 leading-relaxed">{cs.situation}</p>
                    </div>

                    <div className="space-y-2 p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                      <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                        <Workflow className="w-3.5 h-3.5 text-cyan-400" /> The FDE Tactical Playbook
                      </span>
                      <ul className="space-y-1.5 text-xs text-zinc-300">
                        {cs.fdePlaybook.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-cyan-400 font-bold">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Architecture Flow ASCII Diagram */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-indigo-300 font-mono">Deployment Topography:</span>
                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-[11px] text-cyan-300 overflow-x-auto custom-scrollbar">
                      <pre>{cs.architectureDiagramSnippet}</pre>
                    </div>
                  </div>

                  {/* Outcome & Lessons */}
                  <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-2 text-xs">
                    <div className="text-emerald-300 font-semibold">
                      <span className="font-bold text-emerald-400">Quantitative Outcome: </span>
                      {cs.outcome}
                    </div>
                    <div className="pt-2 border-t border-emerald-900/40 space-y-1">
                      <span className="font-bold text-zinc-400">FDE Hard-Earned Lessons:</span>
                      {cs.lessonsLearned.map((ll, idx) => (
                        <div key={idx} className="text-zinc-300 text-[11px] flex items-start gap-1.5">
                          <span className="text-emerald-400">✓</span>
                          <span>{ll}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: INTERACTIVE TOOLS & SIMULATORS */}
        {activeTab === 'tools' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-zinc-900/30">
            {/* Tool 1: Interactive POC Scoping & Risk Calculator */}
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Enterprise POC Scoping & Risk Estimator</h3>
                </div>
                <span className="text-xs font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                  Interactive Simulator
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Configure your client deployment constraints to calculate realistic POC timelines, staffing requirements, risk indicators, and recommended infrastructure.
              </p>

              {/* Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Deployment Target</label>
                  <select
                    value={estimatorParams.deploymentTarget}
                    onChange={(e) => setEstimatorParams({ ...estimatorParams, deploymentTarget: e.target.value })}
                    className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Client_AWS_VPC">Customer AWS / Azure VPC</option>
                    <option value="OnPrem_AirGapped">On-Premises 100% Air-Gapped</option>
                    <option value="SaaS_PrivateLink">SaaS over AWS PrivateLink</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Compliance & Security Level</label>
                  <select
                    value={estimatorParams.securityLevel}
                    onChange={(e) => setEstimatorParams({ ...estimatorParams, securityLevel: e.target.value })}
                    className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="SOC2_Type2">Standard SOC2 Type II</option>
                    <option value="HIPAA">HIPAA (Healthcare / PHI)</option>
                    <option value="FedRAMP_High">FedRAMP High / Defense IL5</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Upstream Data Sources Count: {estimatorParams.dataSourcesCount}</label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={estimatorParams.dataSourcesCount}
                    onChange={(e) => setEstimatorParams({ ...estimatorParams, dataSourcesCount: parseInt(e.target.value, 10) })}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>1 Source</span>
                    <span>5 Sources</span>
                    <span>10 Sources</span>
                  </div>
                </div>
              </div>

              {/* Output Summary Card */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-500">Estimated Timeline</span>
                  <div className="text-lg font-bold text-amber-300 font-mono">{estimatedPocResult.weeks} Weeks</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-500">Required FDE Staffing</span>
                  <div className="text-lg font-bold text-cyan-300 font-mono">{estimatedPocResult.engineers} Engineers</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-500">Risk Profile</span>
                  <div className={`text-lg font-bold font-mono ${
                    estimatedPocResult.risk === 'CRITICAL' ? 'text-rose-400' :
                    estimatedPocResult.risk === 'HIGH' ? 'text-orange-400' : 'text-emerald-400'
                  }`}>
                    {estimatedPocResult.risk}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-500">Cloud Infra Budget</span>
                  <div className="text-sm sm:text-base font-bold text-purple-300 font-mono">{estimatedPocResult.infraBudget}</div>
                </div>
              </div>

              {/* Recommended Stack */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-semibold text-zinc-400">Recommended Toolchain:</span>
                {estimatedPocResult.recommendedTech.map((tech, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded font-mono text-[11px] border border-zinc-700">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Tool 2: Interactive Client War-Room Incident Simulator */}
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-400" />
                  <h3 className="text-base font-bold text-white">Live Client War-Room Incident Command Simulator</h3>
                </div>
                <span className="text-xs font-mono text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                  Interactive Scenario
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Step into the shoes of a Forward Deployed Incident Commander. Choose tactical actions and receive real-time scoring.
              </p>

              {/* Scenario Step */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300">{warRoomScenarios[warRoomStep].title}</span>
                  <span className="text-xs font-mono text-cyan-300">Command Score: {warRoomScore} pts</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
                  {warRoomScenarios[warRoomStep].situation}
                </p>

                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Select Your Action:</span>
                  {warRoomScenarios[warRoomStep].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setWarRoomScore(prev => prev + opt.scoreDelta);
                        setWarRoomFeedback(opt.feedback);
                      }}
                      className="w-full text-left p-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/50 text-xs text-zinc-200 transition-all flex items-start gap-2"
                    >
                      <span className="font-mono text-cyan-400 font-bold">[{idx + 1}]</span>
                      <span>{opt.text}</span>
                    </button>
                  ))}
                </div>

                {warRoomFeedback && (
                  <div className="p-3 bg-indigo-950/40 border border-indigo-700/60 rounded-lg text-xs text-indigo-200 animate-in fade-in flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-indigo-300">Debrief: </span>
                      {warRoomFeedback}
                    </div>
                    <button
                      onClick={() => {
                        setWarRoomFeedback(null);
                        setWarRoomStep(prev => (prev < warRoomScenarios.length - 1 ? prev + 1 : 0));
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold shrink-0"
                    >
                      {warRoomStep < warRoomScenarios.length - 1 ? 'Next Scenario →' : 'Restart Sim ↻'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: CERTIFICATION EXAM */}
        {activeTab === 'exam' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-zinc-900/30">
            {!examStarted ? (
              <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 mx-auto flex items-center justify-center text-zinc-950 shadow-xl shadow-amber-950/40">
                  <Award className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Official Forward Deployed Engineer (FDE) Certification Challenge</h3>
                  <p className="text-xs text-zinc-400 max-w-lg mx-auto">
                    Test your comprehensive mastery across Technical Discovery, Ontology Modeling, Air-Gapped Deployments, Enterprise RAG, and Crisis Incident Leadership.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-center">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono">Questions</span>
                    <div className="text-base font-bold text-white font-mono">{FDE_CERTIFICATION_EXAM.length}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono">Time Limit</span>
                    <div className="text-base font-bold text-white font-mono">20 Mins</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono">Passing Grade</span>
                    <div className="text-base font-bold text-emerald-400 font-mono">75% Score</div>
                  </div>
                </div>

                {certificateEarned && (
                  <div className="p-3 bg-emerald-950/50 border border-emerald-700/60 rounded-xl text-xs text-emerald-300 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>You are certified! Previous Score: {lastExamScore}% • ID: {certificateId}</span>
                  </div>
                )}

                <button
                  onClick={handleStartExam}
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-950/50 transition-transform active:scale-95 flex items-center gap-2 mx-auto"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{certificateEarned ? 'Retake Examination' : 'Start Certification Challenge'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Exam Floating Status Bar */}
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between sticky top-0 z-20 shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-white">FDE Exam in Progress</span>
                    <span className="text-xs font-mono text-zinc-400">
                      Answered: {Object.keys(userAnswers).length}/{FDE_CERTIFICATION_EXAM.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-300 bg-amber-950 px-2.5 py-1 rounded-lg border border-amber-800">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{Math.floor(examTimeLeft / 60)}:{(examTimeLeft % 60).toString().padStart(2, '0')}</span>
                    </div>

                    {!examSubmitted ? (
                      <button
                        onClick={handleSubmitExam}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Submit Exam
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('certificate')}
                        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Award className="w-3.5 h-3.5" /> View Certificate
                      </button>
                    )}
                  </div>
                </div>

                {/* Exam Result Banner when submitted */}
                {examSubmitted && (
                  <div className={`p-5 rounded-2xl border text-center space-y-2 ${
                    lastExamScore >= 75
                      ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-600 text-rose-200'
                  }`}>
                    <h3 className="text-xl font-bold">
                      {lastExamScore >= 75 ? '🎉 Certification Passed!' : 'Exam Incomplete'}
                    </h3>
                    <p className="text-sm">
                      Your Score: <span className="font-mono font-bold text-lg">{lastExamScore}%</span> ({FDE_CERTIFICATION_EXAM.filter(q => userAnswers[q.id] === q.correctIndex).length}/{FDE_CERTIFICATION_EXAM.length} Correct)
                    </p>
                    {lastExamScore >= 75 ? (
                      <p className="text-xs text-emerald-300">
                        Your official cryptographic credential ID has been generated. Switch to the <strong>Official Credential Certificate</strong> tab to print or export your badge!
                      </p>
                    ) : (
                      <p className="text-xs text-rose-300">
                        Passing grade is 75%. Review the question explanations below and retake when ready!
                      </p>
                    )}
                  </div>
                )}

                {/* Questions List */}
                <div className="space-y-4">
                  {FDE_CERTIFICATION_EXAM.map((q, idx) => {
                    const selectedOpt = userAnswers[q.id];
                    const isCorrect = selectedOpt === q.correctIndex;
                    const isFlagged = flaggedQuestions.includes(q.id);

                    return (
                      <div
                        key={q.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          examSubmitted
                            ? isCorrect
                              ? 'bg-emerald-950/20 border-emerald-800'
                              : 'bg-rose-950/20 border-rose-800'
                            : 'bg-zinc-900 border-zinc-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-300 font-mono text-xs flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              {q.competencyArea}
                            </span>
                          </div>

                          {!examSubmitted && (
                            <button
                              onClick={() => toggleFlagQuestion(q.id)}
                              className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                                isFlagged
                                  ? 'bg-amber-950 text-amber-300 border-amber-700 font-bold'
                                  : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                              }`}
                            >
                              {isFlagged ? '🚩 Flagged' : 'Flag'}
                            </button>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm font-semibold text-zinc-100 mb-3">{q.question}</p>

                        {/* Options */}
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = selectedOpt === optIdx;
                            const isTheCorrectOne = q.correctIndex === optIdx;

                            let optClass = 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700';

                            if (examSubmitted) {
                              if (isTheCorrectOne) {
                                optClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-100 font-bold';
                              } else if (isChosen && !isTheCorrectOne) {
                                optClass = 'bg-rose-950/60 border-rose-500 text-rose-200 line-through';
                              }
                            } else if (isChosen) {
                              optClass = 'bg-cyan-950/60 border-cyan-500 text-cyan-100 font-semibold';
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={examSubmitted}
                                onClick={() => handleSelectAnswer(q.id, optIdx)}
                                className={`w-full text-left p-2.5 sm:p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${optClass}`}
                              >
                                <span className="font-mono text-zinc-500 font-bold shrink-0">
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation after submission */}
                        {examSubmitted && (
                          <div className="mt-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-300 space-y-1">
                            <span className="font-bold text-cyan-400">Architectural Rationale: </span>
                            <span>{q.explanation}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 6: OFFICIAL CREDENTIAL CERTIFICATE GENERATOR */}
        {activeTab === 'certificate' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-zinc-950">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-zinc-900 rounded-2xl border border-zinc-800 print:hidden">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-white">Forward Deployed Engineering Credential Engine</h3>
                  <p className="text-xs text-zinc-400">Official certificate issued by the Enterprise Architecture Institute.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintCertificate}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-900/40 transition-transform active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            </div>

            {/* Learner Name Customizer */}
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3 print:hidden">
              <label className="text-xs text-zinc-300 font-semibold shrink-0">Recipient Name on Certificate:</label>
              <input
                type="text"
                value={learnerName}
                onChange={(e) => handleSaveName(e.target.value)}
                placeholder="Enter Full Name (e.g., Alex Vance, Lead FDE)"
                className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* LUXURY GOLD & OBSIDIAN CERTIFICATE DISPLAY */}
            <div className="max-w-4xl mx-auto my-4 p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 border-4 border-amber-500/80 shadow-2xl relative overflow-hidden text-center space-y-6 print:border-black print:bg-white print:text-black">
              {/* Decorative Luxury Guilloche Corner Accents */}
              <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
              <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

              {/* Watermark Logo */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <Compass className="w-96 h-96 text-amber-300" />
              </div>

              {/* Header Badge */}
              <div className="space-y-1 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 text-xs font-mono font-bold uppercase tracking-widest">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Enterprise Software Architecture Institute</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent pt-2">
                  Certificate of Mastery
                </h1>
                <p className="text-xs text-amber-300/80 uppercase tracking-widest font-mono">
                  Forward Deployed Engineering & Enterprise Systems
                </p>
              </div>

              {/* Recipient Presentation Text */}
              <div className="space-y-2 relative z-10 pt-2">
                <p className="text-xs text-zinc-400 italic">This official credential is proudly awarded to</p>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white border-b border-amber-500/40 pb-2 inline-block px-8">
                  {learnerName || 'Enterprise Architect'}
                </div>
                <p className="text-xs text-zinc-300 max-w-xl mx-auto leading-relaxed pt-2">
                  Having successfully demonstrated advanced technical competence in enterprise technical scoping, Palantir-style operational ontologies, zero-trust air-gapped deployments, private enterprise RAG systems, and high-stakes client leadership.
                </p>
              </div>

              {/* Skills Signature Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 relative z-10 text-[10px] font-mono text-zinc-400">
                <div className="p-2 bg-zinc-950/80 rounded border border-zinc-800">
                  <span className="text-amber-300 font-bold block">✓ OAR Ontologies</span>
                  <span>Palantir / Foundry Spec</span>
                </div>
                <div className="p-2 bg-zinc-950/80 rounded border border-zinc-800">
                  <span className="text-amber-300 font-bold block">✓ Air-Gapped K8s</span>
                  <span>Zero-Egress VPCs</span>
                </div>
                <div className="p-2 bg-zinc-950/80 rounded border border-zinc-800">
                  <span className="text-amber-300 font-bold block">✓ Enterprise RAG</span>
                  <span>PII Token Masking</span>
                </div>
                <div className="p-2 bg-zinc-950/80 rounded border border-zinc-800">
                  <span className="text-amber-300 font-bold block">✓ Incident Command</span>
                  <span>Blameless RCA Mastery</span>
                </div>
              </div>

              {/* Certificate Footer & Signatures */}
              <div className="pt-6 border-t border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 text-xs text-zinc-400">
                <div className="text-left space-y-0.5">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase block">Credential ID</span>
                  <span className="font-mono text-amber-300 font-bold">{certificateId}</span>
                </div>

                {/* Digital Verification Gold Seal */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 flex items-center justify-center text-zinc-950 shadow-lg border-2 border-amber-200">
                  <BadgeCheck className="w-10 h-10 text-zinc-950" />
                </div>

                <div className="text-right space-y-0.5">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase block">Issue Date</span>
                  <span className="font-mono text-zinc-300">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
