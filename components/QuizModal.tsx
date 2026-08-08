import React, { useState, useEffect, useRef } from 'react';
import { ARCHITECTURE_DETAILS } from '../constants';
import { ArchType } from '../types';
import { generateQuizQuestions, QuizQuestion, QuizConfig } from '../utils/quizGenerator';

interface QuizModalProps {
  onClose: () => void;
  defaultArchId?: ArchType;
  defaultScope?: 'all' | 'favorites' | 'current' | 'solid';
  favorites?: ArchType[];
  onSelectArchitecture?: (id: ArchType) => void;
  onOpenSolidGuide?: () => void;
}

interface AnswerRecord {
  question: QuizQuestion;
  selectedOptionId: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  onClose,
  defaultArchId,
  defaultScope = 'all',
  favorites = [],
  onSelectArchitecture,
  onOpenSolidGuide
}) => {
  // Phase: 'config' | 'active' | 'results'
  const [phase, setPhase] = useState<'config' | 'active' | 'results'>('config');

  // Config State
  const [scope, setScope] = useState<'all' | 'favorites' | 'current' | 'solid'>(defaultScope);
  const [selectedSingleArch, setSelectedSingleArch] = useState<ArchType>(defaultArchId || ArchType.Monolithic);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [enableTimer, setEnableTimer] = useState<boolean>(true);
  const [timePerQuestion, setTimePerQuestion] = useState<number>(20);

  // Active Quiz State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);

  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(timePerQuestion);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // High Score from localStorage
  const [highScore, setHighScore] = useState<{ score: number; total: number; percent: number } | null>(() => {
    try {
      const saved = localStorage.getItem('archfiddle_quiz_highscore');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Start Quiz Handler
  const handleStartQuiz = () => {
    let config: QuizConfig = { questionCount };

    if (scope === 'solid') {
      config.solidOnly = true;
    } else if (scope === 'favorites' && favorites.length > 0) {
      config.selectedArchIds = favorites;
      config.includeSolid = false;
    } else if (scope === 'current') {
      config.selectedArchIds = [selectedSingleArch];
      config.includeSolid = false;
    } else {
      config.includeSolid = true;
    }

    const generated = generateQuizQuestions(config);
    if (generated.length === 0) return;

    setQuestions(generated);
    setCurrentIndex(0);
    setAnswers([]);
    setStreak(0);
    setBestStreak(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setTimeLeft(timePerQuestion);
    setPhase('active');
  };

  // Timer Effect during Active Phase
  useEffect(() => {
    if (phase !== 'active' || !enableTimer || isAnswerSubmitted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(timePerQuestion);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Time out - submit auto blank/wrong answer
          handleOptionSelect('TIMEOUT');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, phase, enableTimer, isAnswerSubmitted, timePerQuestion]);

  // Answer Option Selection
  const handleOptionSelect = (optionId: string) => {
    if (isAnswerSubmitted) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const currentQ = questions[currentIndex];
    const isCorrect = optionId === currentQ.correctOptionId;

    setSelectedOptionId(optionId);
    setIsAnswerSubmitted(true);

    const timeSpent = timePerQuestion - timeLeft;

    setAnswers((prev) => [
      ...prev,
      {
        question: currentQ,
        selectedOptionId: optionId,
        isCorrect,
        timeSpentSeconds: enableTimer ? Math.max(1, timeSpent) : 0,
      },
    ]);

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
    } else {
      setStreak(0);
    }
  };

  // Next Question or Finish
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
      setTimeLeft(timePerQuestion);
    } else {
      // Calculate final results
      setPhase('results');
    }
  };

  // Calculate scores for results
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const totalQuestions = questions.length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Save High Score on Results
  useEffect(() => {
    if (phase === 'results' && totalQuestions > 0) {
      if (!highScore || scorePercent > highScore.percent) {
        const newHighScore = { score: correctCount, total: totalQuestions, percent: scorePercent };
        setHighScore(newHighScore);
        try {
          localStorage.setItem('archfiddle_quiz_highscore', JSON.stringify(newHighScore));
        } catch (e) {
          // ignore
        }
      }
    }
  }, [phase, scorePercent, correctCount, totalQuestions, highScore]);

  // Get Architect Rank title
  const getRank = (percent: number) => {
    if (percent >= 90) return { title: 'Principal Software Architect 🏆', color: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-500/10' };
    if (percent >= 75) return { title: 'Senior Systems Designer 🚀', color: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-500/10' };
    if (percent >= 50) return { title: 'Tech Lead in Training 💻', color: 'text-blue-400', border: 'border-blue-500/50', bg: 'bg-blue-500/10' };
    return { title: 'Architecture Apprentice 📚', color: 'text-zinc-400', border: 'border-zinc-700', bg: 'bg-zinc-800/30' };
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Container Box */}
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl text-white shadow-lg shadow-blue-900/30">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Architecture Mastery Quiz
                {highScore && phase === 'config' && (
                  <span className="text-[11px] font-mono font-normal px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full">
                    Best: {highScore.percent}% ({highScore.score}/{highScore.total})
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-400">Test your knowledge of pros, cons, use cases, and design patterns</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
            title="Close Quiz"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body Content depending on Phase */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ==================== 1. CONFIGURATION PHASE ==================== */}
          {phase === 'config' && (
            <div className="space-y-6">
              {/* Introduction Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-zinc-900 border border-blue-800/30 rounded-xl flex items-start gap-3">
                <div className="text-2xl mt-0.5">🧠</div>
                <div className="text-sm text-zinc-300 space-y-1">
                  <p className="font-semibold text-white">Challenge Your System Design Instincts</p>
                  <p className="text-xs text-zinc-400">
                    Questions are dynamically drawn from real SaaS architecture specs in ArchFiddle, testing you on trade-offs, ideal use cases, tech stacks, and complexity scores.
                  </p>
                </div>
              </div>

              {/* Scope Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Select Quiz Scope
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => setScope('all')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      scope === 'all'
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-900/20 ring-1 ring-blue-500'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1 flex justify-between items-center">
                      All Specs + SOLID
                      <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-300">All Included</span>
                    </div>
                    <p className="text-xs text-zinc-500">Comprehensive exam covering architecture styles & SOLID principles.</p>
                  </button>

                  <button
                    onClick={() => setScope('solid')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      scope === 'solid'
                        ? 'bg-emerald-600/15 border-emerald-500 text-white shadow-lg shadow-emerald-900/20 ring-1 ring-emerald-500'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1 flex justify-between items-center">
                      SOLID Principles 📐
                      <span className="text-[10px] bg-emerald-900/50 border border-emerald-700/50 px-2 py-0.5 rounded-full text-emerald-300">
                        S-O-L-I-D
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">Test design principles across UI, Domain, & Data Access layers.</p>
                  </button>

                  <button
                    onClick={() => setScope('favorites')}
                    disabled={favorites.length === 0}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      favorites.length === 0
                        ? 'opacity-40 cursor-not-allowed bg-zinc-950 border-zinc-800 text-zinc-600'
                        : scope === 'favorites'
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-900/20 ring-1 ring-amber-500'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1 flex justify-between items-center">
                      My Favorites ⭐
                      <span className="text-[10px] bg-amber-900/50 border border-amber-700/50 px-2 py-0.5 rounded-full text-amber-300">
                        {favorites.length} Saved
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {favorites.length === 0
                        ? 'No favorites starred yet. Star architectures to quiz on them!'
                        : 'Focus exclusively on your bookmarked architectural styles.'}
                    </p>
                  </button>

                  <button
                    onClick={() => setScope('current')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      scope === 'current'
                        ? 'bg-purple-600/15 border-purple-500 text-white shadow-lg shadow-purple-900/20 ring-1 ring-purple-500'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1 flex justify-between items-center">
                      Single Focus 🎯
                      <span className="text-[10px] bg-purple-900/50 border border-purple-700/50 px-2 py-0.5 rounded-full text-purple-300">
                        Drill Mode
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">Deep dive drill on a single specific architecture style.</p>
                  </button>
                </div>

                {/* Single Arch Dropdown if 'current' scope selected */}
                {scope === 'current' && (
                  <div className="mt-3 p-3 bg-zinc-950 border border-purple-800/40 rounded-xl space-y-1">
                    <label className="text-xs text-purple-300 font-medium block">Select Architecture to Drill:</label>
                    <select
                      value={selectedSingleArch}
                      onChange={(e) => setSelectedSingleArch(e.target.value as ArchType)}
                      className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg p-2.5 focus:border-purple-500 focus:outline-none"
                    >
                      {Object.values(ARCHITECTURE_DETAILS).map((arch) => (
                        <option key={arch.id} value={arch.id}>
                          {arch.title} ({arch.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Question Count & Timer Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Question Count */}
                <div className="space-y-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Number of Questions
                  </label>
                  <div className="flex gap-2">
                    {[5, 10, 15].map((count) => (
                      <button
                        key={count}
                        onClick={() => setQuestionCount(count)}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                          questionCount === count
                            ? 'bg-blue-600 text-white shadow'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                        }`}
                      >
                        {count} Questions
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timed Mode Toggle */}
                <div className="space-y-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                        Timed Mode ⏱️
                      </span>
                      <span className="text-xs text-zinc-500">20 seconds per question</span>
                    </div>
                    <button
                      onClick={() => setEnableTimer(!enableTimer)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        enableTimer ? 'bg-blue-600' : 'bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          enableTimer ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  {enableTimer && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-zinc-400">Timer Speed:</span>
                      {[15, 20, 30].map((seconds) => (
                        <button
                          key={seconds}
                          onClick={() => setTimePerQuestion(seconds)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            timePerQuestion === seconds
                              ? 'bg-purple-900 text-purple-200 border border-purple-600'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {seconds}s
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Start Quiz Action */}
              <div className="pt-2">
                <button
                  onClick={handleStartQuiz}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 text-base active:scale-[0.99]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Architecture Quiz ({questionCount} Qs)
                </button>
              </div>
            </div>
          )}

          {/* ==================== 2. ACTIVE QUIZ PHASE ==================== */}
          {phase === 'active' && questions.length > 0 && (
            <div className="space-y-5">
              
              {/* Progress Header & Streak Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-zinc-400 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-200 font-bold">
                      Question {currentIndex + 1} of {questions.length}
                    </span>
                    <span className="px-2 py-0.5 bg-zinc-800 text-blue-400 border border-zinc-700 rounded-md text-[10px] uppercase font-semibold">
                      {questions[currentIndex].category}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Streak Counter */}
                    {streak > 1 && (
                      <span className="flex items-center gap-1 text-amber-400 font-bold animate-pulse text-xs bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                        🔥 {streak} Streak!
                      </span>
                    )}

                    {/* Score So Far */}
                    <span className="text-zinc-300 font-mono">
                      Score: {answers.filter((a) => a.isCorrect).length}/{currentIndex + (isAnswerSubmitted ? 1 : 0)}
                    </span>

                    {/* Countdown Timer */}
                    {enableTimer && (
                      <div
                        className={`font-mono text-sm font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${
                          timeLeft <= 5
                            ? 'bg-red-900/50 border-red-500 text-red-300 animate-bounce'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-200'
                        }`}
                      >
                        ⏱️ {timeLeft}s
                      </div>
                    )}
                  </div>
                </div>

                {/* Smooth Progress Bar */}
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${((currentIndex + (isAnswerSubmitted ? 1 : 0)) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Box */}
              <div className="bg-zinc-950 p-5 sm:p-6 rounded-xl border border-zinc-800 space-y-4 shadow-inner">
                <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                  {questions[currentIndex].questionText}
                </h3>

                {/* Multiple Choice Options */}
                <div className="grid grid-cols-1 gap-3 pt-2">
                  {questions[currentIndex].options.map((option, idx) => {
                    const letter = String.fromCharCode(65 + idx); // A, B, C, D
                    const isSelected = selectedOptionId === option.id;
                    const isCorrectOption = option.id === questions[currentIndex].correctOptionId;

                    let btnStyle = 'bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800';

                    if (isAnswerSubmitted) {
                      if (isCorrectOption) {
                        btnStyle = 'bg-green-950/60 border-green-500 text-green-200 shadow-lg shadow-green-950/50 ring-1 ring-green-500';
                      } else if (isSelected && !isCorrectOption) {
                        btnStyle = 'bg-red-950/60 border-red-500 text-red-200 shadow-lg shadow-red-950/50 ring-1 ring-red-500';
                      } else {
                        btnStyle = 'bg-zinc-900/40 border-zinc-800/60 text-zinc-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleOptionSelect(option.id)}
                        disabled={isAnswerSubmitted}
                        className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between gap-3 group ${btnStyle}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                              isAnswerSubmitted && isCorrectOption
                                ? 'bg-green-500 text-zinc-950'
                                : isAnswerSubmitted && isSelected && !isCorrectOption
                                ? 'bg-red-500 text-white'
                                : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="text-sm font-medium leading-snug">{option.text}</span>
                        </div>

                        {/* Status Icon */}
                        {isAnswerSubmitted && (
                          <div className="shrink-0">
                            {isCorrectOption && (
                              <span className="text-green-400 font-bold flex items-center gap-1 text-xs">
                                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                Correct
                              </span>
                            )}
                            {isSelected && !isCorrectOption && (
                              <span className="text-red-400 font-bold flex items-center gap-1 text-xs">
                                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Incorrect
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explanation Card upon Answer Submission */}
              {isAnswerSubmitted && (
                <div className="p-4 bg-zinc-950 border border-blue-900/40 rounded-xl space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Architect Analysis & Explanation
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/60">
                    "{questions[currentIndex].explanation}"
                  </p>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleNextQuestion}
                      className="py-2.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition-colors flex items-center gap-2"
                    >
                      {currentIndex + 1 < questions.length ? (
                        <>
                          Next Question
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </>
                      ) : (
                        <>
                          View Final Scorecard
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ==================== 3. RESULTS & PERFORMANCE SUMMARY ==================== */}
          {phase === 'results' && (
            <div className="space-y-6">
              
              {/* Scorecard Hero */}
              <div className={`p-6 rounded-2xl border text-center space-y-3 ${getRank(scorePercent).bg} ${getRank(scorePercent).border}`}>
                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                  {scorePercent}%
                </div>
                <div>
                  <div className={`text-lg font-bold ${getRank(scorePercent).color}`}>
                    {getRank(scorePercent).title}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    You answered <span className="text-white font-bold">{correctCount}</span> out of{' '}
                    <span className="text-white font-bold">{totalQuestions}</span> questions correctly.
                  </p>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-800/80 text-xs text-zinc-400">
                  <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60">
                    <span className="block text-[10px] text-zinc-500 uppercase">Best Streak</span>
                    <span className="font-bold text-amber-400">🔥 {bestStreak} in a row</span>
                  </div>
                  <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60">
                    <span className="block text-[10px] text-zinc-500 uppercase">Accuracy</span>
                    <span className="font-bold text-zinc-200">{scorePercent}%</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60">
                    <span className="block text-[10px] text-zinc-500 uppercase">High Score</span>
                    <span className="font-bold text-blue-400">
                      {highScore ? `${highScore.percent}% (${highScore.score}/${highScore.total})` : `${scorePercent}%`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Questions Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex justify-between items-center">
                  <span>Question Review & Feedback</span>
                  <span className="text-[10px] text-zinc-500 font-normal">
                    {correctCount} Correct, {totalQuestions - correctCount} Missed
                  </span>
                </h4>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {answers.map((item, idx) => {
                    const arch = ARCHITECTURE_DETAILS[item.question.targetArchId];
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                          item.isCorrect
                            ? 'bg-zinc-950 border-zinc-800/80'
                            : 'bg-red-950/20 border-red-900/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-zinc-200">
                            <span className="text-zinc-500 font-mono mr-1">#{idx + 1}.</span>
                            {item.question.questionText}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              item.isCorrect
                                ? 'bg-green-900/50 text-green-300 border border-green-700/50'
                                : 'bg-red-900/50 text-red-300 border border-red-700/50'
                            }`}
                          >
                            {item.isCorrect ? '✓ Correct' : '✕ Missed'}
                          </span>
                        </div>

                        {!item.isCorrect && (
                          <div className="text-[11px] text-zinc-400 bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                            {arch?.title ? (
                              <div className="text-red-300">
                                <span className="font-semibold">Target Architecture:</span> {arch.title}
                              </div>
                            ) : (
                              <div className="text-emerald-300">
                                <span className="font-semibold">Category:</span> {item.question.category}
                              </div>
                            )}
                            <div className="text-zinc-400 italic">"{item.question.explanation}"</div>
                            {arch && onSelectArchitecture && (
                              <button
                                onClick={() => {
                                  onSelectArchitecture(item.question.targetArchId!);
                                  onClose();
                                }}
                                className="mt-1 text-blue-400 hover:underline text-[10px] font-semibold flex items-center gap-1"
                              >
                                View {arch.title} details in ArchFiddle →
                              </button>
                            )}
                            {item.question.category === 'SOLID Principle' && onOpenSolidGuide && (
                              <button
                                onClick={() => {
                                  onClose();
                                  onOpenSolidGuide();
                                }}
                                className="mt-1 text-purple-400 hover:underline text-[10px] font-semibold flex items-center gap-1"
                              >
                                Open SOLID Principles Guide →
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setPhase('config')}
                  className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retake / Change Settings
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-colors text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  Return to Encyclopedia
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
