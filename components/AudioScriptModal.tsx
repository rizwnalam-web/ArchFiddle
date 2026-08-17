import React, { useState, useMemo } from 'react';
import {
  Volume2,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Copy,
  Check,
  Download,
  X,
  Sliders,
  Sparkles,
  BookOpen,
  Headphones,
  Search,
  Clock,
  Layers,
  ChevronRight,
  Shield,
  Zap,
  Database,
  Activity,
  Award,
  FileText,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { useAudioNarration } from '../src/context/AudioNarrationContext';
import { ArchitectureData, ArchType } from '../types';
import { ARCHITECTURE_DETAILS } from '../constants';
import { NarrationMode } from '../src/types/tts';
import { formatAudioTime, buildTrackForMode } from '../src/utils/textToSpeechFormatter';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';

interface AudioScriptModalProps {
  archId: ArchType;
  onClose: () => void;
}

interface ModeOption {
  id: NarrationMode;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  durationEst: string;
  description: string;
  badgeColor: string;
}

const NARRATION_MODES: ModeOption[] = [
  {
    id: 'comprehensive',
    label: 'Complete Architecture Masterclass',
    shortLabel: 'Complete Architecture',
    icon: <BookOpen className="w-3.5 h-3.5" />,
    durationEst: '~7-9 min',
    description: '10-Chapter deep-dive covering topology, request data flow, concurrency, failure modes, zero-trust security & ADR.',
    badgeColor: 'from-purple-600 to-indigo-600',
  },
  {
    id: 'briefing',
    label: 'Executive Briefing',
    shortLabel: 'Executive Briefing',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    durationEst: '~1.5 min',
    description: 'Concise executive summary of core premise, target production fit, velocity, and trade-offs.',
    badgeColor: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'dataflow',
    label: 'End-to-End Request Data Flow',
    shortLabel: 'Request Data Flow',
    icon: <Activity className="w-3.5 h-3.5" />,
    durationEst: '~3 min',
    description: 'Step-by-step pipeline walkthrough from client ingress to database persistence and response egress.',
    badgeColor: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'concurrency',
    label: 'Concurrency & State Topology',
    shortLabel: 'Concurrency & State',
    icon: <Cpu className="w-3.5 h-3.5" />,
    durationEst: '~2.5 min',
    description: 'ACID vs Saga boundaries, isolation levels, locking strategies, and distributed state patterns.',
    badgeColor: 'from-amber-600 to-orange-600',
  },
  {
    id: 'resilience',
    label: 'Failure Modes & Chaos Resilience',
    shortLabel: 'Failure & Resilience',
    icon: <Zap className="w-3.5 h-3.5" />,
    durationEst: '~3 min',
    description: 'Production failure scenarios, telemetry detection signals, and automated circuit breaker mitigations.',
    badgeColor: 'from-rose-600 to-red-600',
  },
  {
    id: 'security',
    label: 'Zero-Trust Security & Compliance',
    shortLabel: 'Security & Compliance',
    icon: <Shield className="w-3.5 h-3.5" />,
    durationEst: '~2.5 min',
    description: 'Authentication, authorization, mTLS service identity, secret management, and compliance standards.',
    badgeColor: 'from-cyan-600 to-blue-700',
  },
  {
    id: 'scalability',
    label: 'Scalability Limits & Bottlenecks',
    shortLabel: 'Scalability Limits',
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    durationEst: '~2.5 min',
    description: 'Threshold bottlenecks, high-concurrency symptoms, and engineering remediation strategies.',
    badgeColor: 'from-violet-600 to-fuchsia-600',
  },
  {
    id: 'casestudies',
    label: 'Enterprise Production Case Studies',
    shortLabel: 'Case Studies',
    icon: <Award className="w-3.5 h-3.5" />,
    durationEst: '~2 min',
    description: 'Real-world scale case studies from high-throughput enterprise deployments.',
    badgeColor: 'from-yellow-600 to-amber-700',
  },
  {
    id: 'adr',
    label: 'Architecture Decision Record (ADR)',
    shortLabel: 'ADR Specimen',
    icon: <FileText className="w-3.5 h-3.5" />,
    durationEst: '~2 min',
    description: 'Production ADR breakdown covering context, adopted decisions, positive consequences and trade-offs.',
    badgeColor: 'from-sky-600 to-indigo-700',
  },
];

export const AudioScriptModal: React.FC<AudioScriptModalProps> = ({ archId, onClose }) => {
  const {
    state,
    settings,
    availableVoices,
    playArchitecture,
    togglePlayPause,
    stop,
    jumpToSentence,
    setRate,
    setPitch,
    setVoice,
    setPreferredMode,
    getNarrationScript
  } = useAudioNarration();

  const [selectedMode, setSelectedMode] = useState<NarrationMode>(
    state.currentTrack?.mode || settings.preferredMode || 'comprehensive'
  );
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const arch: ArchitectureData = ARCHITECTURE_DETAILS[archId] || ARCHITECTURE_DETAILS[ArchType.Monolithic];
  const isCurrentArchActive = state.currentTrack?.archId === archId;
  const isCurrentModeActive = isCurrentArchActive && state.currentTrack?.mode === selectedMode;
  const isPlayingThis = isCurrentModeActive && state.isPlaying && !state.isPaused;

  // Active or previewed track
  const trackToDisplay = useMemo(() => {
    if (isCurrentModeActive && state.currentTrack) {
      return state.currentTrack;
    }
    return buildTrackForMode(arch, selectedMode);
  }, [isCurrentModeActive, state.currentTrack, arch, selectedMode]);

  const scriptText = useMemo(() => {
    return getNarrationScript(arch, selectedMode);
  }, [arch, selectedMode, getNarrationScript]);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([scriptText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${arch.title.toLowerCase().replace(/\s+/g, '-')}-${selectedMode}-narration.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleStartNarration = (mode: NarrationMode, sectionIdx = 0) => {
    setSelectedMode(mode);
    setPreferredMode(mode);
    playArchitecture(arch, mode, sectionIdx);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-zinc-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/40 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Audio Architecture Studio & Live Transcript
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  {arch.category}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Spoken architectural narration for <span className="text-zinc-200 font-semibold">{arch.title}</span> with real-time waveform & sentence tracking
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/40 overflow-x-auto custom-scrollbar flex items-center gap-2">
          {NARRATION_MODES.map((mode) => {
            const isSelected = selectedMode === mode.id;
            const isPlayingMode = isCurrentArchActive && state.currentTrack?.mode === mode.id && state.isPlaying && !state.isPaused;

            return (
              <button
                key={mode.id}
                onClick={() => {
                  setSelectedMode(mode.id);
                  if (state.isPlaying && state.currentTrack?.archId === archId) {
                    playArchitecture(arch, mode.id, 0);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/50 shadow-md shadow-blue-950/50'
                    : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                }`}
                title={mode.description}
              >
                {mode.icon}
                <span>{mode.shortLabel}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {mode.durationEst}
                </span>
                {isPlayingMode && (
                  <span className="flex gap-0.5 items-end h-2.5 ml-0.5">
                    <span className="w-0.5 bg-white animate-bounce h-2" style={{ animationDelay: '0ms' }} />
                    <span className="w-0.5 bg-white animate-bounce h-3" style={{ animationDelay: '150ms' }} />
                    <span className="w-0.5 bg-white animate-bounce h-1.5" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Toolbar Bar */}
        <div className="px-4 py-2.5 border-b border-zinc-800/80 bg-zinc-950 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Active Mode Info Description */}
          <div className="text-zinc-400 flex items-center gap-2 flex-1 min-w-[240px]">
            <span className="text-blue-400 font-semibold">
              {NARRATION_MODES.find(m => m.id === selectedMode)?.label}:
            </span>
            <span className="text-zinc-300 truncate">
              {NARRATION_MODES.find(m => m.id === selectedMode)?.description}
            </span>
          </div>

          {/* Search Transcript & Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-44 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                showSettings
                  ? 'bg-zinc-800 border-zinc-600 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Voice & Speed Settings"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voice & Speed</span>
            </button>

            <button
              onClick={handleCopyScript}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5"
              title="Copy Narration Transcript Markdown"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadScript}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5"
              title="Download Narration Script .md file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export .md</span>
            </button>
          </div>
        </div>

        {/* Voice & Speed Settings Drawer */}
        {showSettings && (
          <div className="p-4 bg-zinc-900/95 border-b border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-150 text-xs">
            {/* Speed Rate */}
            <div>
              <label className="text-zinc-400 font-medium block mb-1.5 flex justify-between">
                <span>Playback Speed</span>
                <span className="text-blue-400 font-mono font-bold">{settings.rate}x</span>
              </label>
              <div className="flex gap-1">
                {[0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setRate(rate)}
                    className={`flex-1 py-1 rounded text-center font-mono text-[11px] transition-colors ${
                      settings.rate === rate
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Selector */}
            <div>
              <label className="text-zinc-400 font-medium block mb-1.5">
                Synthesized Voice
              </label>
              <select
                value={settings.selectedVoiceURI || ''}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="">Default System Voice</option>
                {availableVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Pitch */}
            <div>
              <label className="text-zinc-400 font-medium block mb-1.5 flex justify-between">
                <span>Voice Pitch</span>
                <span className="text-zinc-300 font-mono">{settings.pitch.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.1"
                value={settings.pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        )}

        {/* Interactive Transcript Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {trackToDisplay.sections.map((section, secIdx) => {
            const isCurrentSec = isCurrentModeActive && state.currentSectionIndex === secIdx;
            const matchesSearch = !searchQuery || section.text.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return null;

            return (
              <div
                key={section.id || secIdx}
                className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                  isCurrentSec
                    ? 'bg-blue-950/30 border-blue-500/60 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/40'
                    : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold flex items-center justify-center shrink-0">
                      {secIdx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base font-bold text-white truncate">
                        {section.title}
                      </h4>
                      {section.subtitle && (
                        <span className="text-xs text-zinc-400 block truncate">
                          {section.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatAudioTime(section.durationEstSeconds)}</span>
                    </span>

                    <button
                      onClick={() => handleStartNarration(selectedMode, secIdx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                        isCurrentSec && isPlayingThis
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {isCurrentSec && isPlayingThis ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Play Chapter</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Sentences with Live Spoken Highlighting */}
                <div className="text-sm leading-relaxed text-zinc-300 space-y-1.5">
                  {section.sentences.map((sentence, sentIdx) => {
                    const isSpokenNow =
                      isCurrentSec &&
                      state.currentSentenceIndex === sentIdx &&
                      isPlayingThis;

                    return (
                      <span
                        key={sentIdx}
                        onClick={() => {
                          if (!isCurrentModeActive) {
                            handleStartNarration(selectedMode, secIdx);
                          } else {
                            jumpToSentence(secIdx, sentIdx);
                          }
                        }}
                        className={`cursor-pointer rounded px-1 py-0.5 transition-all inline ${
                          isSpokenNow
                            ? 'bg-blue-500 text-white font-medium shadow-sm ring-2 ring-blue-400'
                            : 'hover:bg-zinc-800 text-zinc-300 hover:text-white'
                        }`}
                        title="Click to start speech playback from this sentence"
                      >
                        {sentence}{' '}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Player Footer inside Modal */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex flex-col gap-3">
          {/* Real-time frequency waveform */}
          {state.isPlaying && (
            <div className="w-full">
              <AudioWaveformVisualizer
                state={state}
                settings={settings}
                height={42}
                compact={false}
                interactive={true}
                showControls={false}
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => {
                  if (isPlayingThis) {
                    togglePlayPause();
                  } else {
                    handleStartNarration(selectedMode);
                  }
                }}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-900/50 transition-transform active:scale-95 shrink-0"
              >
                {isPlayingThis ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <div className="min-w-0">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="truncate">{arch.title}</span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-blue-300 text-[10px] uppercase font-mono">
                    {selectedMode}
                  </span>
                  {state.currentTrack && isCurrentArchActive && (
                    <span className="text-[10px] text-zinc-400 font-mono">
                      ({formatAudioTime(state.elapsedSeconds)} / {formatAudioTime(state.totalDurationSeconds)})
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-zinc-400 truncate max-w-xl">
                  {state.currentSentenceText || 'Click play to start spoken architecture narration'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {state.isPlaying && (
                <button
                  onClick={stop}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                >
                  Stop
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-950/50"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
