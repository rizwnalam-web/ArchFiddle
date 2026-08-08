import React, { useState, useMemo, useEffect } from 'react';
import { MessageSquare, Sparkles, Bot } from 'lucide-react';
import {
  JOB_ROLE_PRESETS,
  JobRolePreset,
  InterviewQuestion,
  CodeSnippetItem,
  ExternalStudyResource,
  getTop50QuestionsForCategory,
  getTop20QuestionsForCategory,
  getStudyResourcesForQuestion
} from '../data/interviewPrepData';
import { ArchType } from '../types';
import { ProficiencyRadarChart } from './ProficiencyRadarChart';
import { VoiceAnswerEvaluator } from './VoiceAnswerEvaluator';
import { ChatAssistant } from './ChatAssistant';

export function getCategoryIcon(category: string): string {
  const catLower = category.toLowerCase();
  if (catLower === 'all') return '🌟';
  if (catLower.includes('react native') || catLower.includes('mobile') || catLower.includes('ios') || catLower.includes('android')) return '📱';
  if (catLower.includes('react') || catLower.includes('next.js') || catLower.includes('nextjs')) return '⚛️';
  if (catLower.includes('vue') || catLower.includes('nuxt') || catLower.includes('pinia')) return '💚';
  if (catLower.includes('web vitals') || catLower.includes('performance') || catLower.includes('lcp')) return '⚡';
  if (catLower === 'c#' || catLower === 'csharp') return '🔷';
  if (catLower.includes('generative ai') || catLower.includes('genai') || catLower.includes('gen ai')) return '✨';
  if (catLower.includes('azure iot') || catLower.includes('iot hub') || catLower.includes('iot edge') || catLower.includes('microsoft azure iot') || catLower === 'iot') return '📡';
  if (catLower.includes('snowflake')) return '❄️';
  if (catLower.includes('node.js') || catLower.includes('node')) return '🟩';
  if (catLower.includes('python')) return '🐍';
  if (catLower.includes('rag') || catLower.includes('retrieval')) return '🧠';
  if (catLower.includes('mcp') || catLower.includes('model context protocol')) return '🔌';
  if (catLower.includes('prompt') || catLower.includes('context engineering')) return '✍️';
  if (catLower.includes('ai') || catLower.includes('agent') || catLower.includes('kernel')) return '🤖';
  if (catLower.includes('vector') || catLower.includes('search')) return '📐';
  if (catLower.includes('language') || catLower.includes('vb')) return '📜';
  if (catLower.includes('web') || catLower.includes('legacy')) return '🌐';
  if (catLower.includes('enterprise database') || catLower.includes('database')) return '🗄️';
  if (catLower.includes('c#') || catLower.includes('.net')) return '🔷';
  if (catLower.includes('sql') || catLower.includes('ef')) return '📊';
  if (catLower.includes('angular') || catLower.includes('ui')) return '🔴';
  if (catLower.includes('system design')) return '🏗️';
  if (catLower.includes('agile') || catLower.includes('scrum')) return '⚡';
  if (catLower.includes('domain') || catLower.includes('mortgage')) return '🏠';
  if (catLower.includes('microservices')) return '🧩';
  if (catLower.includes('data strategy')) return '📈';
  if (catLower.includes('security') || catLower.includes('identity')) return '🛡️';
  if (catLower.includes('governance') || catLower.includes('devops')) return '⚙️';
  return '📁';
}

export type DifficultyTarget = 'ALL' | 'Junior' | 'Mid' | 'Senior' | 'Lead';

export interface DifficultyLevelMeta {
  id: DifficultyTarget;
  label: string;
  shortLabel: string;
  yoeLabel: string;
  badgeColor: string;
  activeColor: string;
  borderClass: string;
  description: string;
  expectation: string;
}

export const DIFFICULTY_LEVELS: DifficultyLevelMeta[] = [
  {
    id: 'ALL',
    label: 'All Seniority Levels',
    shortLabel: 'All Levels',
    yoeLabel: 'Any YOE',
    badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    activeColor: 'bg-gradient-to-r from-zinc-700 to-zinc-600 text-white border-zinc-500 shadow-md',
    borderClass: 'border-zinc-700',
    description: 'Displays all interview questions across Junior, Mid-Level, Senior, and Staff/Lead Architect tiers.',
    expectation: 'Comprehensive mix of fundamental language constructs, framework execution pipelines, zero-allocation micro-optimizations, and distributed system design.'
  },
  {
    id: 'Junior',
    label: 'Junior Developer',
    shortLabel: 'Junior',
    yoeLabel: '0-2 YOE',
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    activeColor: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md',
    borderClass: 'border-emerald-600',
    description: 'Focuses on language syntax, OOP/SOLID basics, simple LINQ/SQL queries, REST endpoints, and clean code fundamentals.',
    expectation: 'Interviewers evaluate problem-solving logic, grasp of core syntax, eager learning attitude, and baseline understanding of HTTP/SQL.'
  },
  {
    id: 'Mid',
    label: 'Mid-Level Engineer',
    shortLabel: 'Mid-Level',
    yoeLabel: '3-5 YOE',
    badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-800',
    activeColor: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-500 shadow-md',
    borderClass: 'border-blue-600',
    description: 'Focuses on framework execution pipelines, Dependency Injection scopes, async state machines, ORM query tuning, and unit testing.',
    expectation: 'Interviewers expect feature delivery independence, understanding of framework lifecycle hooks, clean error handling, and DB performance awareness.'
  },
  {
    id: 'Senior',
    label: 'Senior Engineer',
    shortLabel: 'Senior',
    yoeLabel: '6+ YOE',
    badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-800',
    activeColor: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-md',
    borderClass: 'border-purple-600',
    description: 'Focuses on memory management, zero-allocation Span<T>, thread safety, resilience pipelines (Polly), and security hardening.',
    expectation: 'Interviewers look for deep technical mastery, memory/CPU diagnostics, resilience architecture, security practices, and trade-off decisions.'
  },
  {
    id: 'Lead',
    label: 'Staff / Lead Architect',
    shortLabel: 'Lead Architect',
    yoeLabel: 'Staff / Principal',
    badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-800',
    activeColor: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-500 shadow-md',
    borderClass: 'border-amber-600',
    description: 'Focuses on enterprise system design, saga patterns, event sourcing, multi-tenancy, zero-downtime schema evolution, and FinOps governance.',
    expectation: 'Interviewers evaluate strategic architectural vision, cross-team technical alignment, fault-tolerant infrastructure blueprints, and cost governance.'
  }
];

export const matchQuestionDifficulty = (q: InterviewQuestion, targetLevel: DifficultyTarget): boolean => {
  if (targetLevel === 'ALL') return true;
  const diff = (q.difficulty || '').toLowerCase();
  if (targetLevel === 'Junior') {
    return diff.includes('junior') || diff.includes('entry') || diff.includes('0-2') || diff.includes('beginner');
  }
  if (targetLevel === 'Mid') {
    return diff.includes('mid') || diff.includes('3-5');
  }
  if (targetLevel === 'Senior') {
    return diff.includes('senior') || diff.includes('6+');
  }
  if (targetLevel === 'Lead') {
    return diff.includes('staff') || diff.includes('lead') || diff.includes('principal') || diff.includes('architect');
  }
  return true;
};

export const getQuestionDifficultyBadge = (difficultyStr: string) => {
  const d = (difficultyStr || '').toLowerCase();
  if (d.includes('junior') || d.includes('entry') || d.includes('0-2') || d.includes('beginner')) {
    return {
      label: '🟢 Junior (0-2 YOE)',
      shortLabel: 'Junior',
      colorClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-800/80',
      pillClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    };
  }
  if (d.includes('mid') || d.includes('3-5')) {
    return {
      label: '🔵 Mid-Level (3-5 YOE)',
      shortLabel: 'Mid-Level',
      colorClass: 'bg-blue-950/90 text-blue-300 border-blue-800/80',
      pillClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
    };
  }
  if (d.includes('senior') || d.includes('6+')) {
    return {
      label: '🟣 Senior (6+ YOE)',
      shortLabel: 'Senior',
      colorClass: 'bg-purple-950/90 text-purple-300 border-purple-800/80',
      pillClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    };
  }
  return {
    label: '👑 Lead / Architect',
    shortLabel: 'Lead Architect',
    colorClass: 'bg-amber-950/90 text-amber-300 border-amber-800/80',
    pillClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  };
};

interface InterviewPrepModalProps {
  onClose: () => void;
  onSelectArchitecture?: (archId: ArchType) => void;
}

export const InterviewPrepModal: React.FC<InterviewPrepModalProps> = ({
  onClose,
  onSelectArchitecture
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('dotnet-angular-enterprise');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyTarget>('ALL');
  const [activeQuestionId, setActiveQuestionId] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [practiceMode, setPracticeMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [copiedCheatSheet, setCopiedCheatSheet] = useState<boolean>(false);
  const [copiedSearchUrl, setCopiedSearchUrl] = useState<boolean>(false);
  const [showRadarModal, setShowRadarModal] = useState<boolean>(false);
  const [activeSnippetTab, setActiveSnippetTab] = useState<number | 'all'>(0);
  const [showVoicePractice, setShowVoicePractice] = useState<boolean>(true);
  const [showQuickAskModal, setShowQuickAskModal] = useState<boolean>(false);
  const [quickAskPrompt, setQuickAskPrompt] = useState<string>('');
  const [showRoleDetails, setShowRoleDetails] = useState<boolean>(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'answer' | 'voice' | 'resources'>('answer');

  const getGoogleSearchUrl = (questionText: string) => {
    return `https://www.google.com/search?q=${encodeURIComponent(questionText)}`;
  };

  const handleQuickAsk = (questionText: string) => {
    setQuickAskPrompt(`How should I answer this technical interview question: "${questionText}"? What are the key architectural trade-offs, ideal senior-level response structure, and common interviewer follow-ups?`);
    setShowQuickAskModal(true);
  };

  // Custom Job Requirement Editor State
  const [isEditingRequirements, setIsEditingRequirements] = useState<boolean>(false);
  const [customRoleTitle, setCustomRoleTitle] = useState<string>('');
  const [customRequirementsText, setCustomRequirementsText] = useState<string>('');
  const [customTechStackText, setCustomTechStackText] = useState<string>('');

  // Confidence Tracking: { questionId: 'needs-work' | 'getting-there' | 'mastered' }
  const [confidenceMap, setConfidenceMap] = useState<Record<string, 'needs-work' | 'getting-there' | 'mastered'>>({});

  const currentPreset = JOB_ROLE_PRESETS.find((p) => p.id === selectedPresetId) || JOB_ROLE_PRESETS[0];

  // Available Category Sections with Top 50 Question Banks
  const categorySections = [
    'ALL',
    'React & Next.js',
    'React Native & Mobile',
    'Vue.js & Nuxt',
    'Web Vitals & Performance',
    'Angular & Modern UI',
    'C#',
    'Generative AI',
    'Microsoft Azure IoT',
    'Snowflake',
    'Node.js',
    'Python',
    'RAG (Retrieval-Augmented Generation)',
    'MCP Server (Model Context Protocol)',
    'Prompt & Context Engineering',
    'AI Frameworks & Agents',
    'Vector DBs & Search',
    'Languages & Classic VB',
    'Web Frameworks & Legacy',
    'Enterprise Databases',
    'C# & .NET',
    'T-SQL & Entity Framework',
    'Enterprise System Design',
    'Agile & SCRUM Leadership',
    'Domain & Security (Mortgage/Azure)',
    'Microservices & Integration',
    'Data Strategy (SQL / CosmosDB)',
    'Security & Identity (Entra ID)',
    'Governance & DevOps (FinOps)'
  ];

  // Base pool for active category
  const rawCategoryPool = useMemo(() => {
    if (activeCategory === 'ALL') {
      const pool = [
        ...currentPreset.questions,
        ...getTop50QuestionsForCategory('React & Next.js', currentPreset.questions),
        ...getTop50QuestionsForCategory('React Native & Mobile', currentPreset.questions),
        ...getTop50QuestionsForCategory('Vue.js & Nuxt', currentPreset.questions),
        ...getTop50QuestionsForCategory('Web Vitals & Performance', currentPreset.questions),
        ...getTop50QuestionsForCategory('C#', currentPreset.questions),
        ...getTop50QuestionsForCategory('Generative AI', currentPreset.questions),
        ...getTop50QuestionsForCategory('Microsoft Azure IoT', currentPreset.questions),
        ...getTop50QuestionsForCategory('Snowflake', currentPreset.questions),
        ...getTop50QuestionsForCategory('Node.js', currentPreset.questions),
        ...getTop50QuestionsForCategory('Python', currentPreset.questions),
        ...getTop50QuestionsForCategory('RAG (Retrieval-Augmented Generation)', currentPreset.questions),
        ...getTop50QuestionsForCategory('MCP Server (Model Context Protocol)', currentPreset.questions),
        ...getTop50QuestionsForCategory('Prompt & Context Engineering', currentPreset.questions),
        ...getTop50QuestionsForCategory('AI Frameworks & Agents', currentPreset.questions),
        ...getTop50QuestionsForCategory('Vector DBs & Search', currentPreset.questions),
        ...getTop50QuestionsForCategory('Languages & Classic VB', currentPreset.questions),
        ...getTop50QuestionsForCategory('Web Frameworks & Legacy', currentPreset.questions),
        ...getTop50QuestionsForCategory('Enterprise Databases', currentPreset.questions),
        ...getTop50QuestionsForCategory('C# & .NET', currentPreset.questions),
        ...getTop50QuestionsForCategory('T-SQL & Entity Framework', currentPreset.questions),
        ...getTop50QuestionsForCategory('Angular & Modern UI', currentPreset.questions),
        ...getTop50QuestionsForCategory('Enterprise System Design', currentPreset.questions),
        ...getTop50QuestionsForCategory('Agile & SCRUM Leadership', currentPreset.questions),
        ...getTop50QuestionsForCategory('Domain & Security (Mortgage/Azure)', currentPreset.questions),
        ...getTop50QuestionsForCategory('Microservices & Integration', currentPreset.questions),
        ...getTop50QuestionsForCategory('Data Strategy (SQL / CosmosDB)', currentPreset.questions),
        ...getTop50QuestionsForCategory('Security & Identity (Entra ID)', currentPreset.questions),
        ...getTop50QuestionsForCategory('Governance & DevOps (FinOps)', currentPreset.questions)
      ];
      const uniqueIdMap = new Map<string, InterviewQuestion>();
      const seenQuestions = new Set<string>();
      pool.forEach((q) => {
        const normalized = q.question.toLowerCase().trim();
        if (!uniqueIdMap.has(q.id) && !seenQuestions.has(normalized)) {
          uniqueIdMap.set(q.id, q);
          seenQuestions.add(normalized);
        }
      });
      return Array.from(uniqueIdMap.values());
    } else {
      const catQuestions = getTop50QuestionsForCategory(activeCategory, currentPreset.questions);
      const uniqueIdMap = new Map<string, InterviewQuestion>();
      const seenQuestions = new Set<string>();
      catQuestions.forEach((q) => {
        const normalized = q.question.toLowerCase().trim();
        if (!uniqueIdMap.has(q.id) && !seenQuestions.has(normalized)) {
          uniqueIdMap.set(q.id, q);
          seenQuestions.add(normalized);
        }
      });
      return Array.from(uniqueIdMap.values());
    }
  }, [activeCategory, currentPreset]);

  // Effective questions list filtered by difficulty target
  const allQuestions = useMemo(() => {
    if (selectedDifficulty === 'ALL') {
      return rawCategoryPool;
    }
    const filtered = rawCategoryPool.filter((q) => matchQuestionDifficulty(q, selectedDifficulty));
    return filtered;
  }, [rawCategoryPool, selectedDifficulty]);

  // Filter questions based on search query
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      return (
        q.question.toLowerCase().includes(query) ||
        q.shortSummary.toLowerCase().includes(query) ||
        q.tags.some((t) => t.toLowerCase().includes(query)) ||
        q.detailedAnswer.executiveSummary.toLowerCase().includes(query)
      );
    });
  }, [allQuestions, searchQuery]);

  const activeQuestion: InterviewQuestion =
    allQuestions.find((q) => q.id === activeQuestionId) ||
    filteredQuestions[0] ||
    allQuestions[0];

  const activeSnippets: CodeSnippetItem[] = useMemo(() => {
    if (!activeQuestion) return [];
    if (activeQuestion.detailedAnswer.codeSnippets && activeQuestion.detailedAnswer.codeSnippets.length > 0) {
      return activeQuestion.detailedAnswer.codeSnippets;
    }
    const list: CodeSnippetItem[] = [];
    if (activeQuestion.detailedAnswer.codeOrQuerySnippet) {
      list.push(activeQuestion.detailedAnswer.codeOrQuerySnippet);
    }
    if (activeQuestion.detailedAnswer.secondaryCodeSnippet) {
      list.push(activeQuestion.detailedAnswer.secondaryCodeSnippet);
    }
    return list;
  }, [activeQuestion]);

  const activeStudyResources: ExternalStudyResource[] = useMemo(() => {
    if (!activeQuestion) return [];
    return getStudyResourcesForQuestion(activeQuestion);
  }, [activeQuestion]);

  const currentDifficultyMeta = useMemo(() => {
    return DIFFICULTY_LEVELS.find((lvl) => lvl.id === selectedDifficulty) || DIFFICULTY_LEVELS[0];
  }, [selectedDifficulty]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setSelectedDifficulty('ALL');
    setSearchQuery('');
    const newPool = getTop50QuestionsForCategory(cat, currentPreset.questions);
    if (newPool && newPool.length > 0) {
      setActiveQuestionId(newPool[0].id);
      setActiveSnippetTab(0);
      if (!practiceMode) {
        setShowAnswer(true);
      }
    }
  };

  useEffect(() => {
    if (filteredQuestions.length > 0) {
      const exists = filteredQuestions.some((q) => q.id === activeQuestionId);
      if (!exists) {
        setActiveQuestionId(filteredQuestions[0].id);
      }
    }
  }, [filteredQuestions, activeQuestionId]);

  const handleSelectQuestion = (qId: string) => {
    setActiveQuestionId(qId);
    setActiveSnippetTab(0);
    if (practiceMode) {
      setShowAnswer(false);
    } else {
      setShowAnswer(true);
    }
  };

  const setQuestionConfidence = (qId: string, status: 'needs-work' | 'getting-there' | 'mastered') => {
    setConfidenceMap((prev) => ({
      ...prev,
      [qId]: status
    }));
  };

  const calculateReadinessScore = () => {
    if (allQuestions.length === 0) return 0;
    let scoreSum = 0;
    allQuestions.forEach((q) => {
      const status = confidenceMap[q.id];
      if (status === 'mastered') scoreSum += 100;
      else if (status === 'getting-there') scoreSum += 50;
    });
    return Math.round(scoreSum / allQuestions.length);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const exportCheatSheetMarkdown = (): string => {
    const titleHeader = activeCategory === 'ALL'
      ? `Top Interview Questions — ${currentPreset.title}`
      : `Top 20 Interview Questions — ${activeCategory} Section`;

    return `# ${titleHeader}

## Target Role: ${currentPreset.title}
**Experience Requirement:** ${currentPreset.experienceRequirement}
**Category Section:** ${activeCategory}
**Total Questions in Section:** ${allQuestions.length}

---

${allQuestions.map((q, idx) => {
  const qSnippets = q.detailedAnswer.codeSnippets || [
    q.detailedAnswer.codeOrQuerySnippet,
    q.detailedAnswer.secondaryCodeSnippet
  ].filter(Boolean) as CodeSnippetItem[];
  const qResources = getStudyResourcesForQuestion(q);

  return `
### Q${idx + 1}: ${q.question}
- **Category:** ${q.category}
- **Target Level:** ${q.difficulty}
- **Tags:** ${q.tags.join(', ')}
- **🌐 Google Search Query Link:** [https://www.google.com/search?q=${encodeURIComponent(q.question)}](${getGoogleSearchUrl(q.question)})

#### 💡 Executive Model Answer
${q.detailedAnswer.executiveSummary}

#### 🎯 Key Technical Bullet Points
${q.detailedAnswer.keyPoints.map((p) => `- ${p}`).join('\n')}

${qSnippets.map((snip) => `
#### 💻 ${snip.title} (${snip.language.toUpperCase()})
\`\`\`${snip.language}
${snip.code}
\`\`\`
`).join('\n')}

> ⚠️ **Pro-Tip / Enterprise Pitfall:** ${q.detailedAnswer.proTipOrPitfall}

${qResources.length > 0 ? `
#### 📚 Recommended Study Articles & Documentation Links
${qResources.map(res => `- [${res.title}](${res.url}) *(${res.source})* — ${res.description || ''}`).join('\n')}
` : ''}

---
`;
}).join('\n')}

*Generated by ArchFiddle Enterprise Interview Prep Studio*
`;
  };

  const handleCopyCheatSheet = async () => {
    try {
      await navigator.clipboard.writeText(exportCheatSheetMarkdown());
      setCopiedCheatSheet(true);
      setTimeout(() => setCopiedCheatSheet(false), 2000);
    } catch (err) {
      console.error('Failed to copy cheat sheet', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-7xl w-full max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Navigation Header */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 rounded-xl text-white shadow-lg shadow-teal-900/30 shrink-0">
              <span className="text-lg">🎯</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Enterprise Technical Interview Prep Studio
              </h2>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                50+ interview questions per section, deep-dive answers, C#/Angular/T-SQL code snippets & readiness score
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-zinc-400">Section Readiness:</span>
              <span className="font-mono font-bold text-emerald-400">{calculateReadinessScore()}%</span>
            </div>

            <button
              onClick={() => setShowRadarModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
              title="View visual proficiency radar comparing your knowledge vs target role requirement"
            >
              <span>📊 Radar</span>
            </button>

            <button
              onClick={handleCopyCheatSheet}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition-all border border-zinc-700"
              title="Copy full section interview guide as Markdown"
            >
              <span>{copiedCheatSheet ? '✓ Copied' : '📋 Cheat Sheet'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Preset Role Selector Bar (Compact + Collapsible Details) */}
        <div className="bg-zinc-950 border-b border-zinc-800 p-2.5 sm:p-3 shrink-0 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider shrink-0 flex items-center gap-1 font-mono">
                💼 Role Profile:
              </span>
              {JOB_ROLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPresetId(preset.id);
                    setActiveCategory('ALL');
                    setIsEditingRequirements(false);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedPresetId === preset.id
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {preset.title}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowRoleDetails(!showRoleDetails)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  showRoleDetails
                    ? 'bg-teal-950 border-teal-700 text-teal-200'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {showRoleDetails ? '🔼 Hide Details' : 'ℹ️ Job Requirements'}
              </button>

              <button
                onClick={() => setIsEditingRequirements(!isEditingRequirements)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  isEditingRequirements
                    ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                    : 'bg-zinc-900 border-zinc-800 text-amber-400 hover:bg-zinc-800'
                }`}
              >
                ✏️ Customize
              </button>
            </div>
          </div>

          {/* Expanded Job Requirements Drawer */}
          {showRoleDetails && !isEditingRequirements && (
            <div className="bg-zinc-900/90 p-3 rounded-xl border border-zinc-800 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">
                  {currentPreset.title}
                </span>
                <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  {currentPreset.experienceRequirement}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentPreset.keyTechnologies.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] font-mono bg-zinc-950 text-zinc-300 border border-zinc-800 px-2 py-0.5 rounded-md"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-zinc-400 italic line-clamp-2 flex-1 mr-2">
                  "{currentPreset.rawJobDescription.split('\n')[0]}"
                </p>
                <button
                  onClick={() => setShowRadarModal(true)}
                  className="px-2.5 py-1 bg-teal-950 hover:bg-teal-900 border border-teal-700/80 text-teal-300 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 shrink-0"
                >
                  <span>📊 Benchmark Radar Chart</span>
                </button>
              </div>
            </div>
          )}

          {/* Job Requirement Customizer */}
          {isEditingRequirements && (
            <div className="bg-amber-950/20 border border-amber-800/60 p-3 rounded-xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  ✏️ Edit Custom Target Job Requirements & Stack
                </h4>
                <button
                  onClick={() => setIsEditingRequirements(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  ✕ Close Customizer
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Role Title:</label>
                  <input
                    type="text"
                    value={customRoleTitle || currentPreset.title}
                    onChange={(e) => setCustomRoleTitle(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200"
                    placeholder="e.g. Lead C# .NET & Angular Developer"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Technologies (Comma Separated):</label>
                  <input
                    type="text"
                    value={customTechStackText || currentPreset.keyTechnologies.join(', ')}
                    onChange={(e) => setCustomTechStackText(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200"
                    placeholder="C#, Angular, T-SQL, Azure, Rest API, EF Core"
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold text-xs">Job Description / Requirements Snippet:</label>
                <textarea
                  rows={2}
                  value={customRequirementsText || currentPreset.rawJobDescription}
                  onChange={(e) => setCustomRequirementsText(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Category Sections & Search Filter Bar */}
        <div className="bg-zinc-950 border-b border-zinc-800 p-2.5 shrink-0 space-y-2">
          {/* Top Row: Categories & Search */}
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
            {/* Scrollable Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto custom-scrollbar pb-1 sm:pb-0">
              {categorySections.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-xs">{getCategoryIcon(cat)}</span>
                  <span>{cat}</span>
                  {cat !== 'ALL' && (
                    <span className="bg-zinc-950/80 text-teal-300 px-1.5 py-0.2 rounded text-[10px] font-mono border border-teal-800/60">
                      50 Qs
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-56 shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-7 pr-6 py-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-teal-500"
              />
              <span className="absolute left-2.5 top-1.5 text-zinc-500 text-xs">🔍</span>
            </div>
          </div>

          {/* Bottom Row: Seniority Level Filters + Quick Jumps */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-zinc-900">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto custom-scrollbar">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-mono shrink-0 mr-1">
                🎯 Seniority:
              </span>
              {DIFFICULTY_LEVELS.map((level) => {
                const isSelected = selectedDifficulty === level.id;
                const matchingCount = level.id === 'ALL'
                  ? rawCategoryPool.length
                  : rawCategoryPool.filter(q => matchQuestionDifficulty(q, level.id)).length;

                return (
                  <button
                    key={level.id}
                    onClick={() => setSelectedDifficulty(level.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                      isSelected
                        ? level.activeColor
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                    title={level.description}
                  >
                    <span>{level.shortLabel}</span>
                    <span className={`text-[10px] font-mono px-1 py-0.2 rounded border ${
                      isSelected
                        ? 'bg-black/40 border-white/30 text-white font-extrabold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}>
                      {matchingCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Jump Pills */}
            <div className="hidden lg:flex items-center gap-1 overflow-x-auto max-w-xs shrink-0">
              <span className="text-[10px] text-teal-400 font-mono mr-1">Jump:</span>
              {filteredQuestions.slice(0, 10).map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => handleSelectQuestion(q.id)}
                  className={`w-5 h-5 rounded text-[10px] font-mono font-bold transition-all flex items-center justify-center ${
                    activeQuestion?.id === q.id
                      ? 'bg-teal-500 text-black shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                  }`}
                  title={q.question}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Body (Split Workspace) */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Question List Sidebar */}
          <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-950/60 overflow-y-auto custom-scrollbar p-2.5 space-y-2 shrink-0 max-h-52 md:max-h-none">
            <div className="text-[11px] font-mono font-bold text-zinc-400 px-1 flex items-center justify-between pb-1 border-b border-zinc-900">
              <span>Questions ({filteredQuestions.length})</span>
              <span className="text-teal-400">{activeCategory}</span>
            </div>

            {filteredQuestions.length === 0 ? (
              <div className="text-center py-8 px-2 space-y-3">
                <p className="text-zinc-400 text-xs">
                  No questions match <strong className="text-teal-300">"{selectedDifficulty}"</strong> in <strong className="text-teal-300">"{activeCategory}"</strong>.
                </p>
                <button
                  onClick={() => setSelectedDifficulty('ALL')}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg border border-zinc-700 transition-colors"
                >
                  Show All Levels ({rawCategoryPool.length})
                </button>
              </div>
            ) : (
              filteredQuestions.map((q, idx) => {
                const isActive = activeQuestion?.id === q.id;
                const status = confidenceMap[q.id];
                const badge = getQuestionDifficultyBadge(q.difficulty);

                return (
                  <div
                    key={q.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectQuestion(q.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectQuestion(q.id);
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                      isActive
                        ? 'bg-teal-950/50 border-teal-500 text-white ring-1 ring-teal-500/30 border-l-4 border-l-teal-400'
                        : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-teal-400 font-mono">
                        Q{idx + 1}. {q.category}
                      </span>
                      {status === 'mastered' && (
                        <span className="text-[10px] text-emerald-400 font-bold">🟢 Mastered</span>
                      )}
                      {status === 'getting-there' && (
                        <span className="text-[10px] text-amber-400 font-bold">🟡 Practice</span>
                      )}
                      {status === 'needs-work' && (
                        <span className="text-[10px] text-red-400 font-bold">🔴 Review</span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-zinc-100 line-clamp-2 leading-snug">
                      {q.question}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-zinc-800/40">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${badge.colorClass}`}>
                        {badge.shortLabel}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAsk(q.question);
                        }}
                        className="px-2 py-0.5 rounded border bg-blue-950/80 hover:bg-blue-900 text-blue-300 hover:text-white border-blue-800 text-[10px] font-bold flex items-center gap-1 transition-all"
                        title="Quick Ask AI Architect"
                      >
                        <span>💬 Ask AI</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Active Question Detail Workspace */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar bg-zinc-900/40">
            {activeQuestion ? (
              <>
                {/* Active Question Title Card */}
                <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-5 rounded-2xl space-y-3 relative shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-teal-950 text-teal-300 border border-teal-800 flex items-center gap-1">
                      <span>🏆 Question #{filteredQuestions.findIndex(q => q.id === activeQuestion.id) + 1}</span>
                      <span>• {activeQuestion.category}</span>
                    </span>
                    {(() => {
                      const activeBadge = getQuestionDifficultyBadge(activeQuestion.difficulty);
                      return (
                        <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${activeBadge.colorClass}`}>
                          {activeBadge.label}
                        </span>
                      );
                    })()}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                    {activeQuestion.question}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeQuestion.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Clean Tab Switcher Bar */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => setActiveDetailTab('answer')}
                      className={`py-1.5 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border ${
                        activeDetailTab === 'answer'
                          ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-500 shadow-md'
                          : 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800'
                      }`}
                    >
                      <span>💡 Model Answer & Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveDetailTab('voice')}
                      className={`py-1.5 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border ${
                        activeDetailTab === 'voice'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-md'
                          : 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800'
                      }`}
                    >
                      <span>🎤 Voice Practice & AI Speech Evaluator</span>
                    </button>

                    {activeStudyResources.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveDetailTab('resources')}
                        className={`py-1.5 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border ${
                          activeDetailTab === 'resources'
                            ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white border-sky-500 shadow-md'
                            : 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800'
                        }`}
                      >
                        <span>📚 Study Resources ({activeStudyResources.length})</span>
                      </button>
                    )}

                    <a
                      href={getGoogleSearchUrl(activeQuestion.question)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 bg-zinc-900 hover:bg-emerald-950 text-emerald-300 hover:text-white border border-emerald-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 ml-auto"
                      title="Open direct Google Search query in a new browser tab"
                    >
                      <span className="text-xs">🔍</span>
                      <span>Google Search Details</span>
                      <span className="text-[10px]">↗</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleQuickAsk(activeQuestion.question)}
                      className="py-1.5 px-3 bg-zinc-900 hover:bg-blue-950 text-blue-300 hover:text-white border border-blue-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                      title="Ask AI Architect Assistant for a detailed breakdown"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>💬 Ask AI Architect</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: MODEL ANSWER & CODE */}
                {activeDetailTab === 'answer' && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    
                    {/* Google Search Reference Details Card */}
                    <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl space-y-2.5 shadow-md">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xs text-emerald-400 font-mono font-bold">
                            🌐
                          </div>
                          <span className="text-xs font-bold text-zinc-200 font-mono">
                            Google Search Reference Details & Deep Dive URL
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(getGoogleSearchUrl(activeQuestion.question));
                              setCopiedSearchUrl(true);
                              setTimeout(() => setCopiedSearchUrl(false), 2000);
                            }}
                            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span>{copiedSearchUrl ? '✓ Copied Search URL' : '📋 Copy Search URL'}</span>
                          </button>
                          <a
                            href={getGoogleSearchUrl(activeQuestion.question)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-bold rounded-lg transition-all shadow flex items-center gap-1.5"
                          >
                            <span>🔍 Search on Google</span>
                            <span className="text-[10px]">↗</span>
                          </a>
                        </div>
                      </div>

                      <div className="bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800 font-mono text-[11px] text-emerald-300 break-all select-all flex items-center justify-between gap-2">
                        <span className="line-clamp-2">
                          {getGoogleSearchUrl(activeQuestion.question)}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 italic">
                        Click above to inspect live Google Search details, community architectural discussions, RFC documentation, and framework benchmarks for this question.
                      </p>
                    </div>

                    {/* Executive Summary */}
                    <div className="bg-teal-950/20 border border-teal-900/50 p-4 rounded-xl space-y-1.5">
                      <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        💡 Executive Model Answer Summary:
                      </h4>
                      <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                        {activeQuestion.detailedAnswer.executiveSummary}
                      </p>
                    </div>

                    {/* Key Technical Points */}
                    <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        🎯 Key Technical Points to Structure in Interview:
                      </h4>
                      <ul className="space-y-2 text-xs text-zinc-300">
                        {activeQuestion.detailedAnswer.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800/80">
                            <span className="font-mono text-teal-400 font-bold shrink-0">{idx + 1}.</span>
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Code & Snippets */}
                    {activeSnippets.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                          <span className="text-xs font-bold text-zinc-200 flex items-center gap-2 font-mono">
                            💻 Code Implementation Blueprints:
                          </span>

                          {/* Language Switcher Tabs */}
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                            {activeSnippets.map((snip, idx) => {
                              const isSelected = activeSnippetTab === idx;
                              let langLabel = snip.language.toUpperCase();
                              let icon = '⚙️';
                              if (snip.language === 'csharp') {
                                langLabel = 'C# (.NET)';
                                icon = '🔷';
                              } else if (snip.language === 'typescript') {
                                langLabel = 'TypeScript';
                                icon = '🟨';
                              } else if (snip.language === 'sql') {
                                langLabel = 'T-SQL';
                                icon = '🛢️';
                              }

                              return (
                                <button
                                  key={idx}
                                  onClick={() => setActiveSnippetTab(idx)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                                    isSelected
                                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-500 shadow-md'
                                      : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                                  }`}
                                >
                                  <span>{icon}</span>
                                  <span>{langLabel}</span>
                                </button>
                              );
                            })}

                            {activeSnippets.length > 1 && (
                              <button
                                onClick={() => setActiveSnippetTab('all')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                                  activeSnippetTab === 'all'
                                    ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                                    : 'bg-zinc-900 text-purple-300 hover:text-white border-zinc-800'
                                }`}
                              >
                                <span>📑 Side-by-Side</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Code Display Area */}
                        <div className={`grid gap-4 ${activeSnippetTab === 'all' && activeSnippets.length > 1 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                          {activeSnippets
                            .filter((_, idx) => activeSnippetTab === 'all' || activeSnippetTab === idx)
                            .map((snip, idx) => (
                              <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
                                <div className="bg-zinc-900/90 px-3.5 py-2 border-b border-zinc-800/80 flex items-center justify-between text-zinc-400 text-[11px]">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                                    <span className="ml-2 font-semibold text-zinc-200">
                                      {snip.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/80">
                                      {snip.language}
                                    </span>
                                    <button
                                      onClick={() => handleCopyCode(snip.code)}
                                      className="text-[10px] px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded transition-colors"
                                    >
                                      {copiedSnippet ? '✓ Copied' : '📋 Copy'}
                                    </button>
                                  </div>
                                </div>
                                <pre className="p-4 overflow-x-auto text-zinc-300 leading-relaxed max-h-80 overflow-y-auto custom-scrollbar bg-zinc-950/90">
                                  <code>{snip.code}</code>
                                </pre>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Pro-Tip & Pitfall */}
                    <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl space-y-1 text-xs">
                      <span className="font-bold text-amber-400 uppercase tracking-wider block font-mono">
                        ⚠️ Senior Pro-Tip & Enterprise Pitfall:
                      </span>
                      <p className="text-zinc-300 leading-relaxed">
                        {activeQuestion.detailedAnswer.proTipOrPitfall}
                      </p>
                    </div>

                    {/* Readiness Self Rating Bar */}
                    <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex items-center justify-between flex-wrap gap-3">
                      <span className="text-xs font-semibold text-zinc-400">
                        Rate your confidence for this question:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuestionConfidence(activeQuestion.id, 'needs-work')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            confidenceMap[activeQuestion.id] === 'needs-work'
                              ? 'bg-red-600 text-white border-red-500'
                              : 'bg-zinc-900 text-red-300 border-zinc-800 hover:bg-zinc-800'
                          }`}
                        >
                          🔴 Needs Review
                        </button>
                        <button
                          onClick={() => setQuestionConfidence(activeQuestion.id, 'getting-there')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            confidenceMap[activeQuestion.id] === 'getting-there'
                              ? 'bg-amber-600 text-white border-amber-500'
                              : 'bg-zinc-900 text-amber-300 border-zinc-800 hover:bg-zinc-800'
                          }`}
                        >
                          🟡 Getting There
                        </button>
                        <button
                          onClick={() => setQuestionConfidence(activeQuestion.id, 'mastered')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            confidenceMap[activeQuestion.id] === 'mastered'
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-zinc-900 text-emerald-300 border-zinc-800 hover:bg-zinc-800'
                          }`}
                        >
                          🟢 Mastered
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 2: VOICE PRACTICE */}
                {activeDetailTab === 'voice' && (
                  <div className="animate-in fade-in duration-200">
                    <VoiceAnswerEvaluator
                      key={activeQuestion.id}
                      question={activeQuestion}
                      onAnswerEvaluated={(score) => {
                        if (score >= 80) {
                          setQuestionConfidence(activeQuestion.id, 'mastered');
                        } else if (score >= 60) {
                          setQuestionConfidence(activeQuestion.id, 'getting-there');
                        }
                      }}
                    />
                  </div>
                )}

                {/* TAB 3: STUDY RESOURCES */}
                {activeDetailTab === 'resources' && activeStudyResources.length > 0 && (
                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-3 shadow-xl animate-in fade-in duration-200">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2 font-mono">
                        <span>📚 Official Documentation & Study Resources:</span>
                        <span className="text-[10px] bg-sky-950 text-sky-300 font-mono px-2 py-0.5 rounded border border-sky-800">
                          {activeStudyResources.length} References
                        </span>
                      </h4>
                      <span className="text-[11px] text-zinc-500 italic">
                        Handpicked documentation for deep technical prep
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeStudyResources.map((res, idx) => {
                        let badgeColor = 'bg-blue-950 text-blue-300 border-blue-800';
                        if (res.source.includes('Microsoft')) {
                          badgeColor = 'bg-blue-950 text-sky-300 border-sky-800';
                        } else if (res.source.includes('Angular')) {
                          badgeColor = 'bg-red-950 text-red-300 border-red-800';
                        } else if (res.source.includes('MDN')) {
                          badgeColor = 'bg-amber-950 text-amber-300 border-amber-800';
                        } else if (res.source.includes('Refactoring') || res.source.includes('Martin Fowler')) {
                          badgeColor = 'bg-purple-950 text-purple-300 border-purple-800';
                        }

                        return (
                          <a
                            key={idx}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block p-3 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800/80 hover:border-sky-500/60 rounded-xl transition-all duration-200"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border shrink-0 ${badgeColor}`}>
                                {res.source}
                              </span>
                              <span className="text-zinc-500 group-hover:text-sky-400 text-xs transition-colors shrink-0 font-bold flex items-center gap-1">
                                <span>↗</span>
                                <span>Open</span>
                              </span>
                            </div>
                            <h5 className="text-xs font-semibold text-zinc-200 group-hover:text-sky-300 transition-colors mt-2 leading-snug">
                              {res.title}
                            </h5>
                            {res.description && (
                              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-normal">
                                {res.description}
                              </p>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-zinc-500 text-sm">
                Select a question from the left sidebar to view its interview model answer.
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-zinc-800 bg-zinc-900/90 flex justify-between items-center shrink-0">
          <div className="text-xs text-zinc-400 hidden sm:block font-mono">
            Target Domain: <span className="text-emerald-400 font-semibold">{currentPreset.domainContext}</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onSelectArchitecture && (
              <button
                onClick={() => {
                  onClose();
                  onSelectArchitecture(ArchType.Microservices);
                }}
                className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-teal-300 text-xs font-bold rounded-xl transition-colors"
              >
                View Architecture Spec →
              </button>
            )}
            <button
              onClick={onClose}
              className="py-1.5 px-5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>

      {/* Proficiency Radar Chart Benchmark Modal */}
      {showRadarModal && (
        <ProficiencyRadarChart
          currentPreset={currentPreset}
          allQuestions={allQuestions}
          confidenceMap={confidenceMap}
          onSelectCategoryFilter={(cat) => setActiveCategory(cat)}
          onClose={() => setShowRadarModal(false)}
        />
      )}

      {/* Quick Ask AI Architect Chat Modal */}
      {showQuickAskModal && (
        <ChatAssistant
          isModal={true}
          initialPrompt={quickAskPrompt}
          onClose={() => setShowQuickAskModal(false)}
        />
      )}
    </div>
  );
};
