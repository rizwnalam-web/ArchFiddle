import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  WaveformVisualizerMode,
  WaveformColorTheme,
  AudioPlaybackState,
  TTSSettings,
} from '../src/types/tts';
import {
  BarChart3,
  Activity,
  Waves,
  Disc,
  Grid,
  Zap,
  Sliders,
  Maximize2,
  Volume2,
  Sparkles
} from 'lucide-react';
import { formatAudioTime } from '../src/utils/textToSpeechFormatter';

interface AudioWaveformVisualizerProps {
  state: AudioPlaybackState;
  settings: TTSSettings;
  onSeekToPercent?: (percent: number) => void;
  onSetVisualizerMode?: (mode: WaveformVisualizerMode) => void;
  onSetVisualizerTheme?: (theme: WaveformColorTheme) => void;
  onSetSensitivity?: (sensitivity: number) => void;
  height?: number;
  compact?: boolean;
  interactive?: boolean;
  showControls?: boolean;
}

// Frequency band reference labels
const FREQUENCY_LABELS = [
  { hz: '60Hz', label: 'Sub', pos: 0.08 },
  { hz: '250Hz', label: 'Bass', pos: 0.25 },
  { hz: '1kHz', label: 'Mid', pos: 0.48 },
  { hz: '4kHz', label: 'Pres', pos: 0.72 },
  { hz: '16kHz', label: 'Air', pos: 0.92 },
];

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  state,
  settings,
  onSeekToPercent,
  onSetVisualizerMode,
  onSetVisualizerTheme,
  onSetSensitivity,
  height = 56,
  compact = false,
  interactive = true,
  showControls = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const visualizerMode: WaveformVisualizerMode = settings.visualizerMode || 'bars';
  const visualizerTheme: WaveformColorTheme = settings.visualizerTheme || 'cyan';
  const sensitivity = settings.visualizerSensitivity || 1.0;
  const showFrequencyLabels = settings.showFrequencyLabels !== false;

  // Animation frame reference
  const animationFrameRef = useRef<number | null>(null);
  
  // Frequency bins state for decay & peak hold simulation
  const numBins = compact ? 32 : 56;
  const binsRef = useRef<Float32Array>(new Float32Array(numBins));
  const peaksRef = useRef<Float32Array>(new Float32Array(numBins));
  const peakHoldCountersRef = useRef<Int32Array>(new Int32Array(numBins));
  const phaseRef = useRef<number>(0);
  const speechEnergySmoothedRef = useRef<number>(0);

  // Theme color palette definitions
  const themeColors = useMemo(() => {
    switch (visualizerTheme) {
      case 'purple':
        return {
          primary: '#c084fc',
          secondary: '#ec4899',
          accent: '#f43f5e',
          glow: 'rgba(236, 72, 153, 0.4)',
          bgGradient: ['rgba(192, 132, 252, 0.2)', 'rgba(236, 72, 153, 0.05)'],
          barGradient: ['#f43f5e', '#ec4899', '#c084fc'],
          text: 'text-purple-300',
        };
      case 'emerald':
        return {
          primary: '#34d399',
          secondary: '#10b981',
          accent: '#06b6d4',
          glow: 'rgba(16, 185, 129, 0.4)',
          bgGradient: ['rgba(52, 211, 153, 0.2)', 'rgba(16, 185, 129, 0.05)'],
          barGradient: ['#06b6d4', '#10b981', '#34d399'],
          text: 'text-emerald-300',
        };
      case 'amber':
        return {
          primary: '#fbbf24',
          secondary: '#f97316',
          accent: '#ef4444',
          glow: 'rgba(249, 115, 22, 0.4)',
          bgGradient: ['rgba(251, 191, 36, 0.2)', 'rgba(249, 115, 22, 0.05)'],
          barGradient: ['#ef4444', '#f97316', '#fbbf24'],
          text: 'text-amber-300',
        };
      case 'rainbow':
        return {
          primary: '#38bdf8',
          secondary: '#a855f7',
          accent: '#ec4899',
          glow: 'rgba(168, 85, 247, 0.4)',
          bgGradient: ['rgba(56, 189, 248, 0.2)', 'rgba(236, 72, 153, 0.05)'],
          barGradient: ['#38bdf8', '#34d399', '#fbbf24', '#f43f5e', '#a855f7'],
          text: 'text-sky-300',
        };
      case 'cyan':
      default:
        return {
          primary: '#38bdf8',
          secondary: '#3b82f6',
          accent: '#6366f1',
          glow: 'rgba(59, 130, 246, 0.4)',
          bgGradient: ['rgba(56, 189, 248, 0.25)', 'rgba(59, 130, 246, 0.05)'],
          barGradient: ['#6366f1', '#3b82f6', '#38bdf8'],
          text: 'text-blue-300',
        };
    }
  }, [visualizerTheme]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const actualHeight = isExpanded ? Math.max(120, height * 2.2) : height;

      if (canvas.width !== width * dpr || canvas.height !== actualHeight * dpr) {
        canvas.width = width * dpr;
        canvas.height = actualHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, actualHeight);

      const isPlaying = state.isPlaying && !state.isPaused;
      const targetEnergy = isPlaying ? (state.speechEnergy || 0.65) * (settings.volume || 1.0) : 0;
      
      // Smooth speech energy
      speechEnergySmoothedRef.current += (targetEnergy - speechEnergySmoothedRef.current) * 0.15;
      const energy = speechEnergySmoothedRef.current * sensitivity;

      // Update Phase according to speech rate
      const rateMultiplier = settings.rate || 1.0;
      phaseRef.current += (isPlaying ? 0.08 : 0.02) * rateMultiplier;

      // Generate Acoustic Frequency Bins
      const bins = binsRef.current;
      const peaks = peaksRef.current;
      const peakHoldCounters = peakHoldCountersRef.current;
      const currentWordLength = (state.currentWord || '').length;

      for (let i = 0; i < bins.length; i++) {
        const normalizedPos = i / bins.length; // 0 (lows) to 1 (highs)
        
        // Vocal Formant Simulation:
        // Formant 1: ~300-800Hz (normalizedPos 0.15-0.35)
        // Formant 2: ~1.2kHz-2.5kHz (normalizedPos 0.45-0.65)
        // Sibilance: ~4kHz-8kHz (normalizedPos 0.75-0.9)
        const formant1 = Math.exp(-Math.pow((normalizedPos - 0.25) / 0.14, 2));
        const formant2 = Math.exp(-Math.pow((normalizedPos - 0.55) / 0.16, 2));
        const sibilance = Math.exp(-Math.pow((normalizedPos - 0.82) / 0.12, 2));
        
        const harmonicOsc = Math.sin(phaseRef.current * 2.5 + i * 0.35) * 0.25 + 0.75;
        const wordVibration = Math.sin(phaseRef.current * 4.0 + (i % 5)) * (currentWordLength > 0 ? 0.2 : 0.05);

        let targetBinValue = 0;
        if (isPlaying) {
          targetBinValue = (formant1 * 0.85 + formant2 * 0.7 + sibilance * 0.45 + wordVibration) * energy * harmonicOsc;
          // Add subtle high-frequency air jitter
          if (normalizedPos > 0.6) {
            targetBinValue += (Math.random() * 0.12 - 0.06) * energy;
          }
        } else {
          // Serene breathing idle wave when paused
          targetBinValue = (Math.sin(phaseRef.current + i * 0.2) * 0.08 + 0.09) * 0.7;
        }

        targetBinValue = Math.max(0.04, Math.min(1.0, targetBinValue));

        // Smooth bin value (fast attack, smooth decay)
        if (targetBinValue > bins[i]) {
          bins[i] += (targetBinValue - bins[i]) * 0.45; // Fast attack
        } else {
          bins[i] += (targetBinValue - bins[i]) * 0.12; // Smooth decay
        }

        // Peak Hold logic
        if (bins[i] >= peaks[i]) {
          peaks[i] = bins[i];
          peakHoldCounters[i] = 18; // hold for 18 frames
        } else {
          if (peakHoldCounters[i] > 0) {
            peakHoldCounters[i]--;
          } else {
            peaks[i] = Math.max(bins[i], peaks[i] - 0.015); // gravity drop
          }
        }
      }

      // ==========================================
      // RENDER MODE: BARS (Frequency Spectrum)
      // ==========================================
      if (visualizerMode === 'bars') {
        const barWidth = Math.max(2.5, (width - (bins.length - 1) * 2.5) / bins.length);
        const gap = (width - barWidth * bins.length) / (bins.length - 1);
        const baselineY = actualHeight - (showFrequencyLabels && !compact ? 16 : 4);
        const maxBarHeight = baselineY - 6;

        for (let i = 0; i < bins.length; i++) {
          const x = i * (barWidth + gap);
          const barHeight = Math.max(3, bins[i] * maxBarHeight);
          const y = baselineY - barHeight;

          // Bar Gradient
          const gradient = ctx.createLinearGradient(0, y, 0, baselineY);
          if (visualizerTheme === 'rainbow') {
            const hue = (i / bins.length) * 280;
            gradient.addColorStop(0, `hsl(${hue}, 90%, 65%)`);
            gradient.addColorStop(1, `hsl(${hue}, 90%, 35%)`);
          } else {
            gradient.addColorStop(0, themeColors.primary);
            gradient.addColorStop(0.5, themeColors.secondary);
            gradient.addColorStop(1, themeColors.accent);
          }

          // Draw Rounded Bar
          ctx.fillStyle = gradient;
          ctx.beginPath();
          const radius = Math.min(barWidth / 2, 3);
          ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
          ctx.fill();

          // Glowing Cap
          if (isPlaying && bins[i] > 0.4) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = themeColors.primary;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(x + barWidth / 2, y + 1.5, Math.min(barWidth / 2, 2), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // Peak Hold Dot/Needle
          const peakY = baselineY - Math.max(3, peaks[i] * maxBarHeight);
          ctx.fillStyle = visualizerTheme === 'rainbow' ? '#ffffff' : themeColors.primary;
          ctx.beginPath();
          ctx.roundRect(x, peakY - 2, barWidth, 1.5, [1, 1, 1, 1]);
          ctx.fill();

          // Subtle baseline reflection
          if (!compact) {
            ctx.fillStyle = themeColors.glow;
            ctx.fillRect(x, baselineY + 1, barWidth, Math.min(6, barHeight * 0.25));
          }
        }
      }

      // ==========================================
      // RENDER MODE: WAVE (Neon Oscilloscope)
      // ==========================================
      else if (visualizerMode === 'wave') {
        const centerY = (actualHeight - (showFrequencyLabels && !compact ? 14 : 0)) / 2;
        const amplitude = (actualHeight * 0.42) * (isPlaying ? energy : 0.2);

        // Fill under curve
        const waveGradient = ctx.createLinearGradient(0, centerY - amplitude, 0, centerY + amplitude);
        waveGradient.addColorStop(0, themeColors.bgGradient[0]);
        waveGradient.addColorStop(1, themeColors.bgGradient[1]);

        ctx.beginPath();
        ctx.moveTo(0, centerY);

        const sliceWidth = width / (bins.length - 1);
        const points: { x: number; y: number }[] = [];

        for (let i = 0; i < bins.length; i++) {
          const x = i * sliceWidth;
          const harmonic = Math.sin(phaseRef.current * 2.5 + i * 0.4) * 0.35;
          const y = centerY + (bins[i] * 1.6 - 0.5 + harmonic) * amplitude;
          points.push({ x, y });
        }

        // Draw smooth Catmull-Rom / Bezier curve
        for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        if (points.length > 1) {
          const last = points[points.length - 1];
          ctx.lineTo(last.x, last.y);
        }

        // Fill area
        ctx.lineTo(width, actualHeight);
        ctx.lineTo(0, actualHeight);
        ctx.closePath();
        ctx.fillStyle = waveGradient;
        ctx.fill();

        // Stroke neon line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        ctx.strokeStyle = themeColors.primary;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = themeColors.glow;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Secondary Harmonic Echo Ribbon
        ctx.beginPath();
        ctx.moveTo(points[0].x, centerY);
        for (let i = 0; i < points.length - 1; i++) {
          const harmonicY = centerY - (points[i].y - centerY) * 0.65;
          const nextHarmonicY = centerY - (points[i + 1].y - centerY) * 0.65;
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (harmonicY + nextHarmonicY) / 2;
          ctx.quadraticCurveTo(points[i].x, harmonicY, xc, yc);
        }
        ctx.strokeStyle = themeColors.secondary;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // ==========================================
      // RENDER MODE: RIBBON (Spectral Aurora)
      // ==========================================
      else if (visualizerMode === 'ribbon') {
        const centerY = (actualHeight - (showFrequencyLabels && !compact ? 14 : 0)) / 2;
        const layers = 3;

        for (let l = 0; l < layers; l++) {
          const layerOffset = l * 0.6;
          const layerAlpha = 0.35 - l * 0.08;
          const layerAmp = (actualHeight * 0.38) * (isPlaying ? energy : 0.15) * (1 - l * 0.18);

          ctx.beginPath();
          ctx.moveTo(0, centerY);

          for (let i = 0; i < bins.length; i++) {
            const x = (i / (bins.length - 1)) * width;
            const wave = Math.sin(phaseRef.current * (1.8 + l * 0.4) + i * 0.3 + layerOffset);
            const y = centerY + (bins[i] * 1.5 - 0.4 + wave * 0.4) * layerAmp;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }

          ctx.lineTo(width, actualHeight);
          ctx.lineTo(0, actualHeight);
          ctx.closePath();

          ctx.fillStyle = l === 0 ? themeColors.bgGradient[0] : `rgba(99, 102, 241, ${layerAlpha})`;
          ctx.fill();

          // Stroke top of ribbon
          ctx.beginPath();
          for (let i = 0; i < bins.length; i++) {
            const x = (i / (bins.length - 1)) * width;
            const wave = Math.sin(phaseRef.current * (1.8 + l * 0.4) + i * 0.3 + layerOffset);
            const y = centerY + (bins[i] * 1.5 - 0.4 + wave * 0.4) * layerAmp;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = l === 0 ? themeColors.primary : themeColors.secondary;
          ctx.lineWidth = 1.8 - l * 0.4;
          ctx.stroke();
        }
      }

      // ==========================================
      // RENDER MODE: MATRIX (Cyberpunk LED Blocks)
      // ==========================================
      else if (visualizerMode === 'matrix') {
        const numCols = bins.length;
        const numRows = compact ? 6 : 9;
        const colWidth = (width - (numCols - 1) * 2) / numCols;
        const blockHeight = (actualHeight - (showFrequencyLabels && !compact ? 20 : 6) - (numRows - 1) * 2) / numRows;
        const startY = actualHeight - (showFrequencyLabels && !compact ? 16 : 4);

        for (let col = 0; col < numCols; col++) {
          const x = col * (colWidth + 2);
          const activeLevel = Math.round(bins[col] * numRows);

          for (let row = 0; row < numRows; row++) {
            const y = startY - (row + 1) * (blockHeight + 2);
            const isActive = row < activeLevel;
            const isPeak = row === Math.round(peaks[col] * numRows);

            if (isActive) {
              // Color coding by height (Green -> Yellow -> Red)
              if (row > numRows * 0.75) {
                ctx.fillStyle = '#ef4444'; // Red clip zone
              } else if (row > numRows * 0.5) {
                ctx.fillStyle = '#f59e0b'; // Amber warn zone
              } else {
                ctx.fillStyle = themeColors.primary;
              }
            } else if (isPeak) {
              ctx.fillStyle = '#ffffff';
            } else {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; // Unlit LED ghost
            }

            ctx.beginPath();
            ctx.roundRect(x, y, Math.max(2, colWidth), Math.max(2, blockHeight), 1);
            ctx.fill();
          }
        }
      }

      // ==========================================
      // RENDER MODE: CIRCULAR (Radial HUD Equalizer)
      // ==========================================
      else if (visualizerMode === 'circular') {
        const centerX = width / 2;
        const centerY = actualHeight / 2;
        const baseRadius = Math.min(centerX, centerY) * 0.45;
        const maxSpokeLength = Math.min(centerX, centerY) * 0.5;

        // Central glowing core
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 0.65, 0, Math.PI * 2);
        ctx.fillStyle = themeColors.bgGradient[0];
        ctx.fill();
        ctx.strokeStyle = themeColors.primary;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const spokeCount = Math.min(36, bins.length);
        for (let i = 0; i < spokeCount; i++) {
          const angle = (i / spokeCount) * Math.PI * 2 + phaseRef.current * 0.2;
          const spokeLen = Math.max(3, bins[i % bins.length] * maxSpokeLength);

          const x1 = centerX + Math.cos(angle) * baseRadius;
          const y1 = centerY + Math.sin(angle) * baseRadius;
          const x2 = centerX + Math.cos(angle) * (baseRadius + spokeLen);
          const y2 = centerY + Math.sin(angle) * (baseRadius + spokeLen);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = i % 2 === 0 ? themeColors.primary : themeColors.secondary;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Peak dot
          const peakLen = Math.max(3, peaks[i % bins.length] * maxSpokeLength);
          const px = centerX + Math.cos(angle) * (baseRadius + peakLen + 2);
          const py = centerY + Math.sin(angle) * (baseRadius + peakLen + 2);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(px, py, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ==========================================
      // FREQUENCY SPECTRUM LABELS (Hz Grid)
      // ==========================================
      if (showFrequencyLabels && !compact && visualizerMode !== 'circular') {
        const labelY = actualHeight - 3;
        ctx.font = '9px ui-monospace, monospace';
        ctx.fillStyle = 'rgba(161, 161, 170, 0.6)';
        ctx.textAlign = 'center';

        FREQUENCY_LABELS.forEach((freq) => {
          const lx = freq.pos * width;
          ctx.fillText(freq.hz, lx, labelY);
          
          // Subtle vertical tick
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.beginPath();
          ctx.moveTo(lx, actualHeight - 14);
          ctx.lineTo(lx, actualHeight - 10);
          ctx.stroke();
        });
      }

      // ==========================================
      // SCRUBBER / HOVER PLAYHEAD OVERLAY
      // ==========================================
      if (interactive) {
        // Current playback progress cursor
        const progressX = (Math.max(0, Math.min(100, state.progressPercent)) / 100) * width;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(progressX, 0);
        ctx.lineTo(progressX, actualHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        // Active hover line
        if (hoverPercent !== null) {
          const hoverX = (hoverPercent / 100) * width;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(hoverX, 0);
          ctx.lineTo(hoverX, actualHeight);
          ctx.stroke();
        }
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    state.isPlaying,
    state.isPaused,
    state.speechEnergy,
    state.currentWord,
    state.progressPercent,
    settings.rate,
    settings.volume,
    visualizerMode,
    visualizerTheme,
    sensitivity,
    showFrequencyLabels,
    isExpanded,
    height,
    compact,
    interactive,
    hoverPercent,
    themeColors,
  ]);

  // Handle Scrubbing
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive || !onSeekToPercent || !canvasRef.current) return;
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setHoverPercent(percent);
    onSeekToPercent(percent);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setHoverPercent(percent);
    if (isDragging && onSeekToPercent) {
      onSeekToPercent(percent);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handlePointerLeave = () => {
    setHoverPercent(null);
    setIsDragging(false);
  };

  const modeOptions: { mode: WaveformVisualizerMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { mode: 'bars', label: 'Spectrum', icon: BarChart3 },
    { mode: 'wave', label: 'Oscilloscope', icon: Activity },
    { mode: 'ribbon', label: 'Aurora', icon: Waves },
    { mode: 'circular', label: 'Radial HUD', icon: Disc },
    { mode: 'matrix', label: 'LED Matrix', icon: Grid },
  ];

  const themeOptions: { theme: WaveformColorTheme; label: string; color: string }[] = [
    { theme: 'cyan', label: 'Cyber Cyan', color: 'bg-cyan-500' },
    { theme: 'purple', label: 'Electric Purple', color: 'bg-purple-500' },
    { theme: 'emerald', label: 'Matrix Emerald', color: 'bg-emerald-500' },
    { theme: 'amber', label: 'Sunset Amber', color: 'bg-amber-500' },
    { theme: 'rainbow', label: 'Prism Rainbow', color: 'bg-gradient-to-r from-blue-400 via-emerald-400 to-rose-400' },
  ];

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-xl bg-zinc-950/80 border border-zinc-800/80 overflow-hidden shadow-inner flex flex-col justify-between transition-all duration-300 ${
        isExpanded ? 'p-2.5 bg-zinc-950/95 ring-1 ring-blue-500/30' : 'p-1.5'
      }`}
    >
      {/* Top Bar Status / Controls (Only if showControls is true and not compact) */}
      {showControls && !compact && (
        <div className="flex items-center justify-between gap-2 px-1 pb-1 mb-1 border-b border-zinc-850/80 text-[10px]">
          {/* Left: Active Frequency Metrics */}
          <div className="flex items-center gap-2 text-zinc-400 font-mono">
            <span className="flex items-center gap-1">
              <Sparkles className={`w-3 h-3 ${themeColors.text}`} />
              <span className="font-semibold text-zinc-200">
                {state.isPlaying && !state.isPaused ? 'Active Spectrum' : 'Awaiting Speech'}
              </span>
            </span>
            {state.currentWord && state.isPlaying && !state.isPaused && (
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-blue-300 font-mono text-[9px] truncate max-w-[120px]">
                Word: "{state.currentWord}"
              </span>
            )}
            <span className="hidden md:inline-block text-zinc-500">
              Formant: {Math.round(450 * (settings.pitch || 1.0))}Hz - {Math.round(2800 * (settings.pitch || 1.0))}Hz
            </span>
          </div>

          {/* Right: Render Mode Switcher & Theme Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mode Chips */}
            <div className="flex items-center bg-zinc-900/90 rounded-lg p-0.5 border border-zinc-800">
              {modeOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = visualizerMode === opt.mode;
                return (
                  <button
                    key={opt.mode}
                    onClick={() => onSetVisualizerMode && onSetVisualizerMode(opt.mode)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-all ${
                      isActive
                        ? 'bg-blue-600/80 text-white shadow-sm font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title={`${opt.label} Mode`}
                  >
                    <Icon className="w-2.5 h-2.5" />
                    <span className="hidden lg:inline">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Theme Dots */}
            <div className="flex items-center gap-1 bg-zinc-900/90 rounded-lg p-1 border border-zinc-800">
              {themeOptions.map((th) => (
                <button
                  key={th.theme}
                  onClick={() => onSetVisualizerTheme && onSetVisualizerTheme(th.theme)}
                  className={`w-2.5 h-2.5 rounded-full ${th.color} transition-transform ${
                    visualizerTheme === th.theme ? 'scale-125 ring-1 ring-white' : 'opacity-60 hover:opacity-100'
                  }`}
                  title={th.label}
                />
              ))}
            </div>

            {/* Expand / Collapse toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1 rounded-md transition-colors ${
                isExpanded ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
              }`}
              title={isExpanded ? 'Collapse Visualizer' : 'Expand Visualizer Studio'}
            >
              <Maximize2 className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      )}

      {/* Real-time Frequency Waveform Canvas */}
      <div className="relative w-full cursor-crosshair">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          className="w-full block rounded-lg touch-none"
          style={{ height: `${isExpanded ? Math.max(120, height * 2.2) : height}px` }}
        />

        {/* Hover Time Tooltip */}
        {hoverPercent !== null && state.totalDurationSeconds > 0 && (
          <div
            className="absolute top-1 pointer-events-none -translate-x-1/2 px-1.5 py-0.5 bg-zinc-900/95 border border-blue-500/60 rounded text-[10px] font-mono text-blue-300 shadow-lg z-20"
            style={{ left: `${hoverPercent}%` }}
          >
            {formatAudioTime(Math.round((hoverPercent / 100) * state.totalDurationSeconds))}
          </div>
        )}
      </div>

      {/* Expanded Studio Extras */}
      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px]">
              <Volume2 className="w-3 h-3 text-blue-400" />
              <span>Sensitivity:</span>
              <span className="font-mono text-zinc-200">{sensitivity}x</span>
            </span>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={sensitivity}
              onChange={(e) => onSetSensitivity && onSetSensitivity(parseFloat(e.target.value))}
              className="w-24 accent-blue-500 cursor-pointer h-1"
            />
          </div>

          <div className="text-[10px] font-mono text-zinc-500">
            64-Band Real-Time Vocal Resonator Engine
          </div>
        </div>
      )}
    </div>
  );
};
