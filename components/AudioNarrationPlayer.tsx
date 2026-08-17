import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Sliders,
  Headphones,
  FileText,
  Minimize2,
  Maximize2,
  X,
  Sparkles,
  BookOpen,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Layers,
  Activity,
  BarChart3,
  Waves
} from 'lucide-react';
import { useAudioNarration } from '../src/context/AudioNarrationContext';
import { formatAudioTime } from '../src/utils/textToSpeechFormatter';
import { AudioScriptModal } from './AudioScriptModal';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';
import { ArchType } from '../types';

interface AudioNarrationPlayerProps {
  onOpenStudio?: () => void;
}

export const AudioNarrationPlayer: React.FC<AudioNarrationPlayerProps> = ({ onOpenStudio }) => {
  const {
    state,
    settings,
    availableVoices,
    isSupported,
    togglePlayPause,
    stop,
    nextSection,
    prevSection,
    seekRelativeSeconds,
    setRate,
    setPitch,
    setVolume,
    setVoice,
    setAutoPlayOnArchChange,
    setVisualizerMode,
    setVisualizerTheme,
    setVisualizerSensitivity,
    setShowFrequencyLabels,
  } = useAudioNarration();

  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // If browser doesn't support Web Speech API, don't show player
  if (!isSupported) return null;

  // If no track loaded and not playing, keep hidden
  if (!state.currentTrack && !state.isPlaying && !state.isPaused) {
    return null;
  }

  const track = state.currentTrack;
  const currentSection = track?.sections[state.currentSectionIndex];
  const totalSections = track?.sections.length || 1;

  const handleToggleMute = () => {
    if (isMuted) {
      setVolume(settings.volume || 1.0);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
    const currentIndex = speeds.indexOf(settings.rate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setRate(speeds[nextIndex]);
  };

  const handleSeekToPercent = (percent: number) => {
    if (!state.currentTrack || state.totalDurationSeconds <= 0) return;
    const targetSeconds = (percent / 100) * state.totalDurationSeconds;
    const delta = targetSeconds - state.elapsedSeconds;
    seekRelativeSeconds(Math.round(delta));
  };

  const handleOpenStudio = () => {
    if (onOpenStudio) {
      onOpenStudio();
    } else {
      setShowTranscriptModal(true);
    }
  };

  return (
    <>
      {/* Transcript Studio Modal */}
      {showTranscriptModal && track && (
        <AudioScriptModal
          archId={track.archId}
          onClose={() => setShowTranscriptModal(false)}
        />
      )}

      {/* MINIMIZED FLOATING PILL */}
      {isMinimized ? (
        <div className="fixed bottom-4 right-4 z-40 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-zinc-950/90 backdrop-blur-md border border-blue-500/40 rounded-full px-3.5 py-2 shadow-2xl flex items-center gap-3 text-white ring-1 ring-blue-500/30">
            {/* Real-time mini waveform visualizer */}
            <div className="w-16 h-4 overflow-hidden rounded">
              <AudioWaveformVisualizer
                state={state}
                settings={settings}
                height={16}
                compact={true}
                interactive={false}
                showControls={false}
              />
            </div>

            <div
              className="cursor-pointer flex items-center gap-2 max-w-[180px]"
              onClick={() => setIsMinimized(false)}
              title="Click to expand audio player"
            >
              <span className="text-xs font-bold truncate text-zinc-100">
                {track?.title || 'Audio Narration'}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {formatAudioTime(state.elapsedSeconds)}
              </span>
            </div>

            <button
              onClick={togglePlayPause}
              className="p-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              title={state.isPlaying && !state.isPaused ? 'Pause' : 'Resume'}
            >
              {state.isPlaying && !state.isPaused ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors"
              title="Expand Player"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* EXPANDED FULL FLOATING AUDIO BAR */
        <div className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-5xl z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-zinc-950/95 backdrop-blur-xl border border-zinc-750/90 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden ring-1 ring-white/10">
            {/* Top Progress Bar Scrubber */}
            <div
              className="w-full bg-zinc-800/80 h-1 relative overflow-hidden group cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = ((e.clientX - rect.left) / rect.width) * 100;
                handleSeekToPercent(percent);
              }}
              title="Click to seek along timeline"
            >
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full transition-all duration-300"
                style={{ width: `${Math.max(2, state.progressPercent)}%` }}
              />
            </div>

            <div className="p-3 sm:p-4 flex flex-col gap-2.5">
              {/* Top Row: Track Meta & Live Subtitle */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Audio Equalizer Animated Icon */}
                  <div className="w-8 h-8 rounded-xl bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-blue-300 shrink-0 shadow-inner">
                    <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                  </div>

                  {/* Title & Section details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-white truncate">
                        {track?.title}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-blue-950/90 text-blue-300 border border-blue-800/60 shrink-0">
                        Part {state.currentSectionIndex + 1}/{totalSections}: {currentSection?.title || 'Overview'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 capitalize shrink-0">
                        {track?.mode || 'Briefing'}
                      </span>
                    </div>

                    {/* Live Sentence Subtitle ticker */}
                    <div className="text-[11px] sm:text-xs text-zinc-300 truncate mt-0.5 font-sans leading-tight">
                      <span className="text-blue-400 font-semibold mr-1.5">Speaking:</span>
                      <span className="text-zinc-200">
                        {state.currentSentenceText || 'Preparing audio narration...'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right utility buttons: Transcript & Minimize/Close */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleOpenStudio}
                    className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                    title="View Interactive Script & Chapters"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span className="hidden sm:inline">Studio Script</span>
                  </button>

                  <button
                    onClick={() => setShowSettingsPopover(!showSettingsPopover)}
                    className={`p-1.5 rounded-xl border transition-colors ${
                      showSettingsPopover
                        ? 'bg-zinc-800 border-zinc-600 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                    title="Voice, Waveform & Speed Controls"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    title="Minimize to Floating Pill"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={stop}
                    className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
                    title="Stop & Close Audio Player"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* DYNAMIC REAL-TIME FREQUENCY WAVEFORM VISUALIZATION */}
              <div className="w-full">
                <AudioWaveformVisualizer
                  state={state}
                  settings={settings}
                  onSeekToPercent={handleSeekToPercent}
                  onSetVisualizerMode={setVisualizerMode}
                  onSetVisualizerTheme={setVisualizerTheme}
                  onSetSensitivity={setVisualizerSensitivity}
                  height={54}
                  compact={false}
                  interactive={true}
                  showControls={true}
                />
              </div>

              {/* Bottom Row: Scrubber, Controls & Speed */}
              <div className="flex items-center justify-between gap-3 pt-1 border-t border-zinc-850">
                {/* Time Indicator */}
                <div className="text-[11px] font-mono text-zinc-400 shrink-0">
                  <span className="text-zinc-200 font-bold">{formatAudioTime(state.elapsedSeconds)}</span>
                  <span className="mx-1 text-zinc-600">/</span>
                  <span>{formatAudioTime(state.totalDurationSeconds)}</span>
                </div>

                {/* Center Audio Control Buttons */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={prevSection}
                    disabled={state.currentSectionIndex === 0}
                    className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
                    title="Previous Section"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => seekRelativeSeconds(-10)}
                    className="px-2 py-1 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                    title="Rewind 10 seconds"
                  >
                    -10s
                  </button>

                  {/* Main Play / Pause Button */}
                  <button
                    onClick={togglePlayPause}
                    className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-950/60 transition-transform active:scale-95 mx-1"
                    title={state.isPlaying && !state.isPaused ? 'Pause (Space)' : 'Play (Space)'}
                  >
                    {state.isPlaying && !state.isPaused ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => seekRelativeSeconds(10)}
                    className="px-2 py-1 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                    title="Skip forward 10 seconds"
                  >
                    +10s
                  </button>

                  <button
                    onClick={nextSection}
                    disabled={state.currentSectionIndex >= totalSections - 1}
                    className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
                    title="Next Section"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>

                  <button
                    onClick={stop}
                    className="p-1.5 text-zinc-400 hover:text-rose-400 transition-colors ml-1"
                    title="Stop Playback"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right: Speed Quick-Toggle & Volume */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={cycleSpeed}
                    className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-blue-400 hover:text-blue-300 font-mono text-xs font-bold rounded-lg transition-colors shadow-sm"
                    title="Click to cycle playback speed (0.75x to 2.0x)"
                  >
                    {settings.rate}x
                  </button>

                  <button
                    onClick={handleToggleMute}
                    className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Settings Popover Panel */}
              {showSettingsPopover && (
                <div className="pt-3 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs animate-in slide-in-from-top-2 duration-150">
                  {/* Voice selector */}
                  <div>
                    <label className="text-zinc-400 font-medium block mb-1">
                      Synthesized Voice
                    </label>
                    <select
                      value={settings.selectedVoiceURI || ''}
                      onChange={(e) => setVoice(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Default System Voice</option>
                      {availableVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pitch slider */}
                  <div>
                    <label className="text-zinc-400 font-medium block mb-1 flex justify-between">
                      <span>Pitch</span>
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

                  {/* Waveform Visualizer Sensitivity */}
                  <div>
                    <label className="text-zinc-400 font-medium block mb-1 flex justify-between">
                      <span>Waveform Reactivity</span>
                      <span className="text-zinc-300 font-mono">{(settings.visualizerSensitivity || 1.0).toFixed(1)}x</span>
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={settings.visualizerSensitivity || 1.0}
                      onChange={(e) => setVisualizerSensitivity(parseFloat(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  {/* Auto-Play & Grid Toggles */}
                  <div className="flex flex-col justify-end space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={settings.showFrequencyLabels !== false}
                        onChange={(e) => setShowFrequencyLabels(e.target.checked)}
                        className="rounded bg-zinc-900 border-zinc-700 text-blue-600 focus:ring-blue-500 accent-blue-600"
                      />
                      <span className="text-xs">Show Frequency Hz Labels</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={settings.autoPlayOnArchChange}
                        onChange={(e) => setAutoPlayOnArchChange(e.target.checked)}
                        className="rounded bg-zinc-900 border-zinc-700 text-blue-600 focus:ring-blue-500 accent-blue-600"
                      />
                      <span className="text-xs">Auto-read on navigation</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

