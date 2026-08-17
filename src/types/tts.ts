import { ArchType, ArchCategory } from '../../types';

export type NarrationMode =
  | 'briefing'
  | 'comprehensive'
  | 'deepdive'
  | 'dataflow'
  | 'concurrency'
  | 'resilience'
  | 'security'
  | 'scalability'
  | 'casestudies'
  | 'adr'
  | 'custom';
export type WaveformVisualizerMode = 'bars' | 'wave' | 'ribbon' | 'circular' | 'matrix';
export type WaveformColorTheme = 'cyan' | 'purple' | 'emerald' | 'amber' | 'rainbow';

export interface AudioNarrationSection {
  id: string;
  title: string;
  subtitle?: string;
  text: string;
  sentences: string[];
  durationEstSeconds: number;
}

export interface AudioTrackMetadata {
  archId: ArchType;
  title: string;
  category: ArchCategory;
  mode: NarrationMode;
  totalDurationEstSeconds: number;
  sections: AudioNarrationSection[];
}

export interface AudioPlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentTrack: AudioTrackMetadata | null;
  currentSectionIndex: number;
  currentSentenceIndex: number;
  currentSentenceText: string;
  currentWord?: string;
  charIndex?: number;
  speechEnergy?: number;
  elapsedSeconds: number;
  totalDurationSeconds: number;
  progressPercent: number;
}

export interface TTSSettings {
  rate: number; // 0.75 to 2.0
  pitch: number; // 0.8 to 1.2
  volume: number; // 0 to 1
  selectedVoiceURI: string | null;
  autoPlayOnArchChange: boolean;
  autoAdvanceSection: boolean;
  preferredMode: NarrationMode;
  visualizerMode?: WaveformVisualizerMode;
  visualizerTheme?: WaveformColorTheme;
  visualizerSensitivity?: number;
  showFrequencyLabels?: boolean;
}
