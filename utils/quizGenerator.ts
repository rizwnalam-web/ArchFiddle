import { ARCHITECTURE_DETAILS } from '../constants';
import { ArchType } from '../types';
import { SOLID_PRINCIPLES_DATA } from '../data/solidData';

export interface QuizOption {
  id: string;
  archId?: ArchType | string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  category: 'Use Case' | 'Pro / Advantage' | 'Con / Drawback' | 'Core Concept' | 'Tech Stack' | 'Planning & Complexity' | 'Prerequisites' | 'Pitfalls & Deployment' | 'SOLID Principle';
  targetArchId?: ArchType;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  snippet?: string;
}

export interface QuizConfig {
  selectedArchIds?: ArchType[];
  includeSolid?: boolean;
  solidOnly?: boolean;
  questionCount?: number;
  timedMode?: boolean;
  timePerQuestionSeconds?: number;
}

// Utility to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateSolidQuestions(): QuizQuestion[] {
  const solidList = Object.values(SOLID_PRINCIPLES_DATA);
  const questions: QuizQuestion[] = [];

  solidList.forEach((p) => {
    const otherSolid = solidList.filter(s => s.id !== p.id);

    // 1. Definition / Tagline Question
    const defOptions = shuffleArray([
      { id: `opt-${p.id}-def`, text: `${p.name} (${p.id})` },
      ...otherSolid.map(o => ({ id: `opt-${o.id}-def`, text: `${o.name} (${o.id})` }))
    ]);
    questions.push({
      id: `q-solid-${p.id}-def`,
      questionText: `Which SOLID principle states: "${p.tagline}"?`,
      category: 'SOLID Principle',
      options: defOptions,
      correctOptionId: `opt-${p.id}-def`,
      explanation: `${p.name} (${p.id}): ${p.definition}`
    });

    // 2. Layer Examples Questions
    p.layerExamples.forEach((ex, idx) => {
      const layerOpt = shuffleArray([
        { id: `opt-${p.id}-ex${idx}`, text: `${p.id} - ${p.name}` },
        ...otherSolid.map(o => ({ id: `opt-${o.id}-ex${idx}`, text: `${o.id} - ${o.name}` }))
      ]);

      questions.push({
        id: `q-solid-${p.id}-ex${idx}`,
        questionText: `In the [${ex.layerName}] for "${ex.scenario}", solving the anti-pattern by refactoring code into: "${ex.solidExplanation.slice(0, 110)}..." directly applies which SOLID principle?`,
        category: 'SOLID Principle',
        options: layerOpt,
        correctOptionId: `opt-${p.id}-ex${idx}`,
        explanation: `${ex.solidExplanation}`
      });
    });
  });

  return shuffleArray(questions);
}

export function generateQuizQuestions(config: QuizConfig = {}): QuizQuestion[] {
  if (config.solidOnly) {
    const solidQs = generateSolidQuestions();
    return solidQs.slice(0, Math.min(config.questionCount || 10, solidQs.length));
  }

  const allArchs = Object.values(ARCHITECTURE_DETAILS);
  const isSingleFocus = config.selectedArchIds && config.selectedArchIds.length === 1;
  const targetArchs = config.selectedArchIds && config.selectedArchIds.length > 0
    ? allArchs.filter(a => config.selectedArchIds!.includes(a.id))
    : allArchs;

  const rawQuestions: QuizQuestion[] = [];

  if (targetArchs.length > 0) {
    // If drilling a SINGLE architecture type, generate focused questions specifically testing mastery on that architecture
    if (isSingleFocus) {
      const arch = targetArchs[0];
      const otherArchs = allArchs.filter(a => a.id !== arch.id);

      // 1. Core Idea Question
      const coreIdeaDistractors = shuffleArray(otherArchs).slice(0, 3);
      rawQuestions.push({
        id: `q-single-${arch.id}-core`,
        questionText: `What is the core architectural principle that defines "${arch.title}"?`,
        category: 'Core Concept',
        targetArchId: arch.id,
        options: shuffleArray([
          { id: `opt-correct-core`, text: arch.coreIdea },
          ...coreIdeaDistractors.map((d, i) => ({ id: `opt-dist-core-${i}`, text: d.coreIdea }))
        ]),
        correctOptionId: `opt-correct-core`,
        explanation: `The core principle of ${arch.title} is: "${arch.coreIdea}". ${arch.description.split('\n')[0]}`
      });

      // 2. Primary Use Case Question
      const useCaseDistractors = shuffleArray(otherArchs).slice(0, 3);
      rawQuestions.push({
        id: `q-single-${arch.id}-uc`,
        questionText: `Which of the following scenarios is the primary recommended use case for "${arch.title}"?`,
        category: 'Use Case',
        targetArchId: arch.id,
        options: shuffleArray([
          { id: `opt-correct-uc`, text: arch.useCase },
          ...useCaseDistractors.map((d, i) => ({ id: `opt-dist-uc-${i}`, text: d.useCase }))
        ]),
        correctOptionId: `opt-correct-uc`,
        explanation: `${arch.title} is ideal for: "${arch.useCase}".`
      });

      // 3. Pro / Advantage Questions for EACH pro
      arch.pros.forEach((pro, pIdx) => {
        const otherPros = otherArchs.flatMap(o => o.pros).filter(p => !arch.pros.includes(p));
        const proDistractors = shuffleArray(otherPros).slice(0, 3);
        rawQuestions.push({
          id: `q-single-${arch.id}-pro-${pIdx}`,
          questionText: `Which of the following is an explicit strength or benefit of "${arch.title}"?`,
          category: 'Pro / Advantage',
          targetArchId: arch.id,
          options: shuffleArray([
            { id: `opt-correct-pro-${pIdx}`, text: pro },
            ...proDistractors.map((d, i) => ({ id: `opt-dist-pro-${pIdx}-${i}`, text: d }))
          ]),
          correctOptionId: `opt-correct-pro-${pIdx}`,
          explanation: `A major advantage of ${arch.title} is "${pro}". All strengths include: ${arch.pros.join(', ')}.`
        });
      });

      // 4. Con / Drawback Questions for EACH con
      arch.cons.forEach((con, cIdx) => {
        const otherCons = otherArchs.flatMap(o => o.cons).filter(c => !arch.cons.includes(c));
        const conDistractors = shuffleArray(otherCons).slice(0, 3);
        rawQuestions.push({
          id: `q-single-${arch.id}-con-${cIdx}`,
          questionText: `What known drawback or trade-off must architects account for when adopting "${arch.title}"?`,
          category: 'Con / Drawback',
          targetArchId: arch.id,
          options: shuffleArray([
            { id: `opt-correct-con-${cIdx}`, text: con },
            ...conDistractors.map((d, i) => ({ id: `opt-dist-con-${cIdx}-${i}`, text: d }))
          ]),
          correctOptionId: `opt-correct-con-${cIdx}`,
          explanation: `A recognized trade-off of ${arch.title} is "${con}". Known challenges: ${arch.cons.join(', ')}.`
        });
      });

      // 5. Tech Stack Question
      const otherTechs = otherArchs.map(o => o.technologyStack.slice(0, 4).join(', '));
      const techDistractors = shuffleArray(otherTechs).slice(0, 3);
      rawQuestions.push({
        id: `q-single-${arch.id}-tech`,
        questionText: `Which technology stack is commonly associated with "${arch.title}"?`,
        category: 'Tech Stack',
        targetArchId: arch.id,
        options: shuffleArray([
          { id: `opt-correct-tech`, text: arch.technologyStack.join(', ') },
          ...techDistractors.map((d, i) => ({ id: `opt-dist-tech-${i}`, text: d }))
        ]),
        correctOptionId: `opt-correct-tech`,
        explanation: `${arch.title} commonly uses: ${arch.technologyStack.join(', ')}.`
      });

      // 6. Prerequisites Question
      if (arch.prerequisites && arch.prerequisites.length > 0) {
        const otherPrereqs = otherArchs.map(o => o.prerequisites.join(', ')).filter(Boolean);
        const prereqDistractors = shuffleArray(otherPrereqs).slice(0, 3);
        rawQuestions.push({
          id: `q-single-${arch.id}-prereq`,
          questionText: `What operational foundation or prerequisite is essential before deploying "${arch.title}"?`,
          category: 'Prerequisites',
          targetArchId: arch.id,
          options: shuffleArray([
            { id: `opt-correct-prereq`, text: arch.prerequisites.join('; ') },
            ...prereqDistractors.map((d, i) => ({ id: `opt-dist-prereq-${i}`, text: d }))
          ]),
          correctOptionId: `opt-correct-prereq`,
          explanation: `Key prerequisites for ${arch.title} include: ${arch.prerequisites.join(', ')}.`
        });
      }

      // 7. Complexity & Team Planning Question
      const est = arch.estimation;
      const estOther = otherArchs.map(o => ({
        text: `Complexity: ${o.estimation.complexityScore}/10 | Dev Speed: ${o.estimation.devSpeed} | Team: ${o.estimation.teamSize} | Maintenance: ${o.estimation.maintenanceEffort}`
      }));
      rawQuestions.push({
        id: `q-single-${arch.id}-est`,
        questionText: `What is the estimated complexity score, development velocity, and maintenance profile for "${arch.title}"?`,
        category: 'Planning & Complexity',
        targetArchId: arch.id,
        options: shuffleArray([
          { id: `opt-correct-est`, text: `Complexity: ${est.complexityScore}/10 | Dev Speed: ${est.devSpeed} | Team: ${est.teamSize} | Maintenance: ${est.maintenanceEffort}` },
          ...shuffleArray(estOther).slice(0, 3).map((d, i) => ({ id: `opt-dist-est-${i}`, text: d.text }))
        ]),
        correctOptionId: `opt-correct-est`,
        explanation: `${arch.title} features a complexity rating of ${est.complexityScore}/10, dev speed of "${est.devSpeed}" (${est.devSpeedDesc}), and maintenance effort of "${est.maintenanceEffort}".`
      });

      // 8. Pitfalls & Deployment Challenge Question
      const descLines = arch.description.split('\n\n');
      const pitfallLine = descLines.find(l => l.startsWith('Common Pitfalls:')) || descLines.find(l => l.startsWith('Deployment Challenges:'));
      if (pitfallLine) {
        const otherPitfalls = otherArchs.map(o => {
          const oLines = o.description.split('\n\n');
          return (oLines.find(l => l.startsWith('Common Pitfalls:')) || oLines.find(l => l.startsWith('Deployment Challenges:')) || o.cons[0]).replace(/^(Common Pitfalls:|Deployment Challenges:)\s*/, '');
        });
        const cleanPitfall = pitfallLine.replace(/^(Common Pitfalls:|Deployment Challenges:)\s*/, '');
        rawQuestions.push({
          id: `q-single-${arch.id}-pitfall`,
          questionText: `When operating "${arch.title}", which common architectural trap or deployment hurdle must teams beware of?`,
          category: 'Pitfalls & Deployment',
          targetArchId: arch.id,
          options: shuffleArray([
            { id: `opt-correct-pitfall`, text: cleanPitfall.slice(0, 140) + (cleanPitfall.length > 140 ? '...' : '') },
            ...shuffleArray(otherPitfalls).slice(0, 3).map((d, i) => ({ id: `opt-dist-pitfall-${i}`, text: d.slice(0, 140) + (d.length > 140 ? '...' : '') }))
          ]),
          correctOptionId: `opt-correct-pitfall`,
          explanation: `In ${arch.title}: ${cleanPitfall}`
        });
      }

    } else {
      // Multiple / All Architectures Pool
      targetArchs.forEach((arch) => {
        const otherArchs = allArchs.filter(a => a.id !== arch.id);

        // 1. Core Idea Question
        const coreIdeaDistractors = shuffleArray(otherArchs).slice(0, 3);
        const coreIdeaOptions: QuizOption[] = shuffleArray([
          { id: `opt-${arch.id}-core`, archId: arch.id, text: arch.title },
          ...coreIdeaDistractors.map(d => ({ id: `opt-${d.id}-core`, archId: d.id, text: d.title }))
        ]);
        rawQuestions.push({
          id: `q-${arch.id}-core`,
          questionText: `Which architectural style is defined by the core principle: "${arch.coreIdea}"?`,
          category: 'Core Concept',
          targetArchId: arch.id,
          options: coreIdeaOptions,
          correctOptionId: `opt-${arch.id}-core`,
          explanation: `${arch.title} centers around "${arch.coreIdea}". ${arch.description.split('\n')[0]}`
        });

        // 2. Use Case Question
        const useCaseDistractors = shuffleArray(otherArchs).slice(0, 3);
        const useCaseOptions: QuizOption[] = shuffleArray([
          { id: `opt-${arch.id}-uc`, archId: arch.id, text: arch.title },
          ...useCaseDistractors.map(d => ({ id: `opt-${d.id}-uc`, archId: d.id, text: d.title }))
        ]);
        rawQuestions.push({
          id: `q-${arch.id}-uc`,
          questionText: `Which architecture is ideal for this scenario: "${arch.useCase}"?`,
          category: 'Use Case',
          targetArchId: arch.id,
          options: useCaseOptions,
          correctOptionId: `opt-${arch.id}-uc`,
          explanation: `${arch.title} is commonly used for ${arch.useCase}. Key advantage: ${arch.pros[0] || 'high flexibility'}.`
        });

        // 3. Pro / Advantage Question
        if (arch.pros.length > 0) {
          const selectedPro = arch.pros[Math.floor(Math.random() * arch.pros.length)];
          const proDistractors = shuffleArray(otherArchs).slice(0, 3);
          const proOptions: QuizOption[] = shuffleArray([
            { id: `opt-${arch.id}-pro`, archId: arch.id, text: arch.title },
            ...proDistractors.map(d => ({ id: `opt-${d.id}-pro`, archId: d.id, text: d.title }))
          ]);
          rawQuestions.push({
            id: `q-${arch.id}-pro`,
            questionText: `Which architecture style lists "${selectedPro}" as a key advantage?`,
            category: 'Pro / Advantage',
            targetArchId: arch.id,
            options: proOptions,
            correctOptionId: `opt-${arch.id}-pro`,
            explanation: `A major strength of ${arch.title} is "${selectedPro}". Other pros include: ${arch.pros.filter(p => p !== selectedPro).join(', ')}.`
          });
        }

        // 4. Con / Drawback Question
        if (arch.cons.length > 0) {
          const selectedCon = arch.cons[Math.floor(Math.random() * arch.cons.length)];
          const conDistractors = shuffleArray(otherArchs).slice(0, 3);
          const conOptions: QuizOption[] = shuffleArray([
            { id: `opt-${arch.id}-con`, archId: arch.id, text: arch.title },
            ...conDistractors.map(d => ({ id: `opt-${d.id}-con`, archId: d.id, text: d.title }))
          ]);
          rawQuestions.push({
            id: `q-${arch.id}-con`,
            questionText: `Which architectural approach explicitly suffers from the following trade-off or challenge: "${selectedCon}"?`,
            category: 'Con / Drawback',
            targetArchId: arch.id,
            options: conOptions,
            correctOptionId: `opt-${arch.id}-con`,
            explanation: `"${selectedCon}" is a known drawback of ${arch.title}. Recommended team size: ${arch.estimation.teamSize}.`
          });
        }

        // 5. Tech Stack Question
        if (arch.technologyStack.length > 0) {
          const sampleTech = arch.technologyStack.slice(0, 3).join(', ');
          const techDistractors = shuffleArray(otherArchs).slice(0, 3);
          const techOptions: QuizOption[] = shuffleArray([
            { id: `opt-${arch.id}-tech`, archId: arch.id, text: arch.title },
            ...techDistractors.map(d => ({ id: `opt-${d.id}-tech`, archId: d.id, text: d.title }))
          ]);
          rawQuestions.push({
            id: `q-${arch.id}-tech`,
            questionText: `Which architecture style typically features technologies like: [${sampleTech}]?`,
            category: 'Tech Stack',
            targetArchId: arch.id,
            options: techOptions,
            correctOptionId: `opt-${arch.id}-tech`,
            explanation: `${arch.title} frequently leverages tech like ${arch.technologyStack.join(', ')}.`
          });
        }

        // 6. Estimation & Complexity Question
        const est = arch.estimation;
        const estDistractors = shuffleArray(otherArchs).slice(0, 3);
        const estOptions: QuizOption[] = shuffleArray([
          { id: `opt-${arch.id}-est`, archId: arch.id, text: arch.title },
          ...estDistractors.map(d => ({ id: `opt-${d.id}-est`, archId: d.id, text: d.title }))
        ]);
        rawQuestions.push({
          id: `q-${arch.id}-est`,
          questionText: `Which architecture has a complexity rating of ${est.complexityScore}/10 with "${est.devSpeed}" development speed and "${est.infraCost}" infra cost?`,
          category: 'Planning & Complexity',
          targetArchId: arch.id,
          options: estOptions,
          correctOptionId: `opt-${arch.id}-est`,
          explanation: `${arch.title} has complexity ${est.complexityScore}/10 (${est.maintenanceEffort} maintenance effort) and infra cost: ${est.infraCostDesc}.`
        });

        // 7. Prerequisites Question
        if (arch.prerequisites && arch.prerequisites.length > 0) {
          const prereqDistractors = shuffleArray(otherArchs).slice(0, 3);
          rawQuestions.push({
            id: `q-${arch.id}-prereq`,
            questionText: `Which architecture requires foundation prerequisites including: [${arch.prerequisites.slice(0, 2).join(', ')}]?`,
            category: 'Prerequisites',
            targetArchId: arch.id,
            options: shuffleArray([
              { id: `opt-${arch.id}-prereq`, archId: arch.id, text: arch.title },
              ...prereqDistractors.map(d => ({ id: `opt-${d.id}-prereq`, archId: d.id, text: d.title }))
            ]),
            correctOptionId: `opt-${arch.id}-prereq`,
            explanation: `${arch.title} mandates prerequisites such as: ${arch.prerequisites.join(', ')}.`
          });
        }
      });
    }
  }

  // Combine with SOLID questions if requested or in general pool (unless single focus arch)
  if (!isSingleFocus && config.includeSolid !== false) {
    const solidQs = generateSolidQuestions();
    rawQuestions.push(...solidQs);
  }

  const shuffledQuestions = shuffleArray(rawQuestions);
  const finalCount = config.questionCount || 10;
  return shuffledQuestions.slice(0, Math.min(finalCount, shuffledQuestions.length));
}

