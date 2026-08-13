import React, { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { JobRolePreset, InterviewQuestion } from '../data/interviewPrepData';

interface ProficiencyRadarChartProps {
  currentPreset: JobRolePreset;
  allQuestions: InterviewQuestion[];
  confidenceMap: Record<string, 'needs-work' | 'getting-there' | 'mastered'>;
  onSelectCategoryFilter?: (category: string) => void;
  onClose: () => void;
  customRequirementsText?: string;
}

export const ProficiencyRadarChart: React.FC<ProficiencyRadarChartProps> = ({
  currentPreset,
  allQuestions,
  confidenceMap,
  onSelectCategoryFilter,
  onClose,
  customRequirementsText
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'gap-analysis'>('radar');

  // Extract unique categories
  const categories: string[] = Array.from(new Set(allQuestions.map((q) => q.category)));

  // Calculate scores per category
  const radarData = categories.map((cat) => {
    const questions = allQuestions.filter((q) => q.category === cat);
    if (questions.length === 0) {
      return {
        category: cat,
        shortLabel: cat.length > 18 ? cat.substring(0, 16) + '...' : cat,
        targetRequired: 100,
        userProficiency: 0,
        totalQuestions: 0,
        mastered: 0,
        gettingThere: 0,
        needsWork: 0,
        unrated: 0,
        gap: 100
      };
    }

    let sum = 0;
    let masteredCount = 0;
    let gettingThereCount = 0;
    let needsWorkCount = 0;
    let unratedCount = 0;

    questions.forEach((q) => {
      const status = confidenceMap[q.id];
      if (status === 'mastered') {
        sum += 100;
        masteredCount++;
      } else if (status === 'getting-there') {
        sum += 60;
        gettingThereCount++;
      } else if (status === 'needs-work') {
        sum += 25;
        needsWorkCount++;
      } else {
        unratedCount++;
      }
    });

    const userProficiency = Math.round(sum / questions.length);
    const targetRequired = 100; // Benchmark target required for job profile

    return {
      category: cat,
      shortLabel: cat.length > 20 ? cat.substring(0, 18) + '..' : cat,
      targetRequired,
      userProficiency,
      totalQuestions: questions.length,
      mastered: masteredCount,
      gettingThere: gettingThereCount,
      needsWork: needsWorkCount,
      unrated: unratedCount,
      gap: Math.max(0, targetRequired - userProficiency)
    };
  });

  // Calculate overall metrics
  const totalQuestions = allQuestions.length;
  const overallUserProficiency =
    radarData.length > 0
      ? Math.round(
          radarData.reduce((acc, curr) => acc + curr.userProficiency, 0) / radarData.length
        )
      : 0;

  const criticalGaps = radarData.filter((d) => d.userProficiency < 60);
  const targetMetCategories = radarData.filter((d) => d.userProficiency >= 80);

  // Custom tooltip for recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl shadow-xl text-xs space-y-1.5">
          <p className="font-bold text-white border-b border-zinc-800 pb-1">{data.category}</p>
          <div className="flex justify-between gap-4 text-emerald-400">
            <span>Target Requirement:</span>
            <span className="font-mono font-bold">{data.targetRequired}%</span>
          </div>
          <div className="flex justify-between gap-4 text-teal-300">
            <span>Your Current Proficiency:</span>
            <span className="font-mono font-bold">{data.userProficiency}%</span>
          </div>
          <div className="flex justify-between gap-4 text-zinc-400 text-[11px] pt-1">
            <span>Questions Mastered:</span>
            <span>{data.mastered} / {data.totalQuestions}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 rounded-xl text-white shadow-lg">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Knowledge vs Role Requirement Benchmark
              </h2>
              <p className="text-xs text-zinc-400">
                Visualizing target candidate requirements against your evaluated interview readiness
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Selected Role Context Banner */}
        <div className="bg-zinc-950 border-b border-zinc-800 p-3 sm:p-4 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-zinc-400 font-semibold">Target Requirement Benchmark: </span>
            <span className="text-emerald-400 font-bold">{currentPreset.title}</span>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              {currentPreset.experienceRequirement}
            </div>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl">
            <div className="text-right">
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Overall Match</div>
              <div className="text-base font-black text-emerald-400 font-mono">
                {overallUserProficiency}%
              </div>
            </div>
            <div className="h-8 w-px bg-zinc-800"></div>
            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Competency Met</div>
              <div className="text-xs font-bold text-teal-300">
                {targetMetCategories.length} / {radarData.length} Axes
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950 px-4 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'radar'
                ? 'border-emerald-500 bg-zinc-900 text-emerald-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>🕸️ Radar Chart Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('gap-analysis')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'gap-analysis'
                ? 'border-emerald-500 bg-zinc-900 text-emerald-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>🎯 Competency Gap Analysis ({criticalGaps.length} Action Needed)</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'radar' && (
            <div className="space-y-6">
              {/* Radar Chart Container */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center">
                <div className="w-full h-[320px] sm:h-[380px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#3f3f46" strokeDasharray="3 3" />
                      <PolarAngleAxis
                        dataKey="shortLabel"
                        tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 600 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: '#71717a', fontSize: 10 }}
                      />
                      <Radar
                        name="Required Role Benchmark"
                        dataKey="targetRequired"
                        stroke="#0ea5e9"
                        fill="#0ea5e9"
                        fillOpacity={0.15}
                      />
                      <Radar
                        name="Your Assessed Knowledge"
                        dataKey="userProficiency"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.45}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                        formatter={(value) => (
                          <span className="text-zinc-300 font-semibold">{value}</span>
                        )}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full flex flex-wrap justify-between items-center text-xs text-zinc-400 border-t border-zinc-800/80 pt-3 mt-2 px-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                    <span>Your Assessed Score (Based on Question Masteries)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
                    <span>Target Role Requirement (100% Target)</span>
                  </div>
                </div>
              </div>

              {/* Quick Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl space-y-1">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Top Competency</div>
                  <div className="text-xs font-bold text-emerald-400">
                    {radarData.reduce((prev, current) =>
                      prev.userProficiency > current.userProficiency ? prev : current
                    ).category}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Highest confidence score evaluated
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl space-y-1">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Priority Skill Gap</div>
                  <div className="text-xs font-bold text-amber-400">
                    {radarData.reduce((prev, current) =>
                      prev.userProficiency < current.userProficiency ? prev : current
                    ).category}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Needs practice before technical round
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl space-y-1">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Total Evaluated</div>
                  <div className="text-xs font-bold text-teal-300 font-mono">
                    {allQuestions.filter((q) => confidenceMap[q.id]).length} / {totalQuestions} Questions
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Mark questions as Mastered to update chart
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gap-analysis' && (
            <div className="space-y-4">
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400">
                💡 <span className="text-zinc-200 font-semibold">Gap Analysis Overview:</span> Below is a side-by-side comparison of each skill requirement category. Click <strong className="text-emerald-400">"Practice This Category"</strong> to filter the interview questions instantly to that domain.
              </div>

              <div className="space-y-3">
                {radarData.map((d) => {
                  const gap = d.targetRequired - d.userProficiency;
                  const isGapHigh = d.userProficiency < 50;
                  const isTargetMet = d.userProficiency >= 80;

                  return (
                    <div
                      key={d.category}
                      className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{d.category}</h4>
                          {isTargetMet && (
                            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                              ✓ Target Satisfied
                            </span>
                          )}
                          {isGapHigh && (
                            <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full font-bold">
                              ⚠️ Critical Gap
                            </span>
                          )}
                          {!isTargetMet && !isGapHigh && (
                            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-bold">
                              ⚡ Moderate Gap
                            </span>
                          )}
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[11px] text-zinc-400">
                            <span>Your Proficiency: <strong className="text-emerald-400">{d.userProficiency}%</strong></span>
                            <span>Target Requirement: <strong className="text-sky-400">{d.targetRequired}%</strong></span>
                          </div>
                          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800 relative">
                            <div
                              className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${d.userProficiency}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-1">
                          <span>Mastered: <strong className="text-emerald-400">{d.mastered}</strong></span>
                          <span>In-Progress: <strong className="text-amber-400">{d.gettingThere}</strong></span>
                          <span>Needs Work: <strong className="text-rose-400">{d.needsWork + d.unrated}</strong></span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (onSelectCategoryFilter) {
                            onSelectCategoryFilter(d.category);
                          }
                          onClose();
                        }}
                        className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5 justify-center"
                      >
                        <span>🎯 Practice Category</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition-colors"
          >
            Close Benchmark
          </button>
        </div>
      </div>
    </div>
  );
};
