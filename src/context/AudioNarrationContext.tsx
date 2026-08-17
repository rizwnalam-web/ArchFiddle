import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ArchitectureData, ArchType } from '../../types';
import { ARCHITECTURE_DETAILS } from '../../constants';
import {
  AudioPlaybackState,
  AudioTrackMetadata,
  NarrationMode,
  TTSSettings,
  WaveformVisualizerMode,
  WaveformColorTheme,
} from '../types/tts';
import {
  buildTrackForMode,
  buildBriefingTrack,
  buildComprehensiveTrack,
  buildCustomSnippetTrack,
  cleanTextForSpeech,
} from '../utils/textToSpeechFormatter';

interface AudioNarrationContextType {
  // State
  state: AudioPlaybackState;
  settings: TTSSettings;
  availableVoices: SpeechSynthesisVoice[];
  isSupported: boolean;

  // Actions
  playArchitecture: (arch: ArchitectureData | ArchType, mode?: NarrationMode, startSectionIndex?: number) => void;
  playSnippet: (title: string, subtitle: string, text: string, archId?: ArchType) => void;
  pause: () => void;
  resume: () => void;
  togglePlayPause: () => void;
  stop: () => void;
  nextSection: () => void;
  prevSection: () => void;
  jumpToSection: (sectionIndex: number) => void;
  jumpToSentence: (sectionIndex: number, sentenceIndex: number) => void;
  seekRelativeSeconds: (deltaSeconds: number) => void;

  // Settings Updaters
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
  setVoice: (voiceURI: string) => void;
  setAutoPlayOnArchChange: (enabled: boolean) => void;
  setPreferredMode: (mode: NarrationMode) => void;

  // Utility
  getNarrationScript: (arch: ArchitectureData | ArchType, mode?: NarrationMode) => string;

  // Waveform Visualizer Updaters
  setVisualizerMode: (mode: WaveformVisualizerMode) => void;
  setVisualizerTheme: (theme: WaveformColorTheme) => void;
  setVisualizerSensitivity: (sensitivity: number) => void;
  setShowFrequencyLabels: (show: boolean) => void;
}

const AudioNarrationContext = createContext<AudioNarrationContextType | null>(null);

const SETTINGS_STORAGE_KEY = 'archfiddle_tts_settings';

export const AudioNarrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Settings with LocalStorage persistence
  const [settings, setSettings] = useState<TTSSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Ignore
    }
    return {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      selectedVoiceURI: null,
      autoPlayOnArchChange: false,
      autoAdvanceSection: true,
      preferredMode: 'briefing',
      visualizerMode: 'bars',
      visualizerTheme: 'cyan',
      visualizerSensitivity: 1.0,
      showFrequencyLabels: true,
    };
  });

  // Playback state
  const [state, setState] = useState<AudioPlaybackState>({
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentTrack: null,
    currentSectionIndex: 0,
    currentSentenceIndex: 0,
    currentSentenceText: '',
    currentWord: '',
    charIndex: 0,
    speechEnergy: 0,
    elapsedSeconds: 0,
    totalDurationSeconds: 0,
    progressPercent: 0,
  });

  // Internal references for speech queue & timers
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentSentenceIdxRef = useRef<number>(0);
  const currentSectionIdxRef = useRef<number>(0);
  const trackRef = useRef<AudioTrackMetadata | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync refs with state
  useEffect(() => {
    trackRef.current = state.currentTrack;
    currentSectionIdxRef.current = state.currentSectionIndex;
    currentSentenceIdxRef.current = state.currentSentenceIndex;
    isPlayingRef.current = state.isPlaying;
    isPausedRef.current = state.isPaused;
  }, [state.currentTrack, state.currentSectionIndex, state.currentSentenceIndex, state.isPlaying, state.isPaused]);

  // Save settings on changes
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      // Ignore
    }
  }, [settings]);

  // Initialize Speech Synthesis & Load Voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          // Sort English voices first, prefer natural / high quality
          const sorted = [...voices].sort((a, b) => {
            const aIsEn = a.lang.startsWith('en');
            const bIsEn = b.lang.startsWith('en');
            if (aIsEn && !bIsEn) return -1;
            if (!aIsEn && bIsEn) return 1;
            
            // Prefer natural / google / apple high quality voices
            const aHighQ = a.name.includes('Natural') || a.name.includes('Google') || a.name.includes('Premium');
            const bHighQ = b.name.includes('Natural') || b.name.includes('Google') || b.name.includes('Premium');
            if (aHighQ && !bHighQ) return -1;
            if (!aHighQ && bHighQ) return 1;
            return a.name.localeCompare(b.name);
          });
          setAvailableVoices(sorted);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.onvoiceschanged = null;
          window.speechSynthesis.cancel();
        }
      };
    }
  }, []);

  // Heartbeat to prevent Chrome's ~15 second speech synthesis stall
  useEffect(() => {
    if (state.isPlaying && !state.isPaused) {
      heartbeatTimerRef.current = setInterval(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }
      }, 10000);
    } else {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    }

    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
      }
    };
  }, [state.isPlaying, state.isPaused]);

  // Elapsed Time Scrubber Timer
  useEffect(() => {
    if (state.isPlaying && !state.isPaused) {
      elapsedTimerRef.current = setInterval(() => {
        setState(prev => {
          if (!prev.currentTrack || prev.totalDurationSeconds <= 0) return prev;
          const newElapsed = Math.min(prev.elapsedSeconds + 1, prev.totalDurationSeconds);
          const newProgress = Math.min(100, Math.round((newElapsed / prev.totalDurationSeconds) * 100));
          return {
            ...prev,
            elapsedSeconds: newElapsed,
            progressPercent: newProgress,
          };
        });
      }, 1000);
    } else {
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current);
        elapsedTimerRef.current = null;
      }
    }

    return () => {
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current);
      }
    };
  }, [state.isPlaying, state.isPaused]);

  /**
   * Internal sentence player: speaks a single sentence with sentence highlighting
   */
  const speakCurrentSentence = useCallback((sectionIdx: number, sentenceIdx: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const track = trackRef.current;
    if (!track || !track.sections[sectionIdx]) {
      // Playback finished
      stop();
      return;
    }

    const section = track.sections[sectionIdx];
    const sentences = section.sentences;

    // Check if sentence index exceeds section length
    if (sentenceIdx >= sentences.length) {
      // Advance to next section
      const nextSec = sectionIdx + 1;
      if (nextSec < track.sections.length) {
        speakCurrentSentence(nextSec, 0);
      } else {
        // Entire track finished
        stop();
      }
      return;
    }

    const sentence = sentences[sentenceIdx];
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(sentence);
    utteranceRef.current = utterance;

    // Apply voice settings
    utterance.rate = Math.max(0.5, Math.min(2.0, settings.rate));
    utterance.pitch = Math.max(0.5, Math.min(1.5, settings.pitch));
    utterance.volume = Math.max(0, Math.min(1, settings.volume));

    if (settings.selectedVoiceURI && availableVoices.length > 0) {
      const matchedVoice = availableVoices.find(v => v.voiceURI === settings.selectedVoiceURI);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.onstart = () => {
      setState(prev => {
        // Recalculate progress based on section and sentence position
        const completedSectionsDuration = track.sections
          .slice(0, sectionIdx)
          .reduce((acc, s) => acc + s.durationEstSeconds, 0);
        
        const currentSecDuration = section.durationEstSeconds;
        const sentenceRatio = sentences.length > 0 ? sentenceIdx / sentences.length : 0;
        const currentElapsed = Math.round(completedSectionsDuration + currentSecDuration * sentenceRatio);
        const progress = track.totalDurationEstSeconds > 0 
          ? Math.min(100, Math.round((currentElapsed / track.totalDurationEstSeconds) * 100))
          : 0;

        return {
          ...prev,
          isPlaying: true,
          isPaused: false,
          isLoading: false,
          currentSectionIndex: sectionIdx,
          currentSentenceIndex: sentenceIdx,
          currentSentenceText: sentence,
          elapsedSeconds: currentElapsed,
          progressPercent: progress,
        };
      });
    };

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      try {
        const charIdx = event.charIndex;
        const sub = sentence.slice(charIdx);
        const match = sub.match(/^([a-zA-Z0-9_-]+)/);
        const currentWord = match ? match[1] : '';

        // Dynamic energy calculation reacting to phoneme & pitch/rate
        const isVowel = /[aeiouy]/i.test(currentWord);
        const isFricative = /[sfthzvx]/i.test(currentWord);
        const isPlosive = /[ptkcdg]/i.test(currentWord);
        
        let energyFactor = 0.55;
        if (isVowel) energyFactor += 0.25;
        if (isFricative) energyFactor += 0.15;
        if (isPlosive) energyFactor += 0.1;

        const effectiveEnergy = Math.min(1.0, Math.max(0.2, energyFactor * (settings.volume ?? 1.0)));

        setState(prev => ({
          ...prev,
          currentWord: currentWord || prev.currentWord,
          charIndex: charIdx,
          speechEnergy: effectiveEnergy,
        }));
      } catch (err) {
        // Safe fallback
      }
    };

    utterance.onend = () => {
      // Only proceed if not cancelled/stopped or paused
      if (isPlayingRef.current && !isPausedRef.current) {
        speakCurrentSentence(sectionIdx, sentenceIdx + 1);
      }
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') {
        return;
      }
      console.warn('SpeechSynthesis error:', e.error);
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Failed to invoke speech synthesis:', err);
    }
  }, [availableVoices, settings.rate, settings.pitch, settings.volume, settings.selectedVoiceURI]);

  /**
   * Play an architecture track
   */
  const playArchitecture = useCallback((
    arch: ArchitectureData | ArchType,
    mode?: NarrationMode,
    startSectionIndex = 0
  ) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const resolvedArch: ArchitectureData = typeof arch === 'string'
      ? ARCHITECTURE_DETAILS[arch] || ARCHITECTURE_DETAILS[ArchType.Monolithic]
      : arch;

    const effectiveMode = mode || settings.preferredMode || 'comprehensive';
    const track = buildTrackForMode(resolvedArch, effectiveMode);

    trackRef.current = track;

    setState({
      isPlaying: true,
      isPaused: false,
      isLoading: true,
      currentTrack: track,
      currentSectionIndex: startSectionIndex,
      currentSentenceIndex: 0,
      currentSentenceText: track.sections[startSectionIndex]?.sentences[0] || '',
      elapsedSeconds: 0,
      totalDurationSeconds: track.totalDurationEstSeconds,
      progressPercent: 0,
    });

    speakCurrentSentence(startSectionIndex, 0);
  }, [settings.preferredMode, speakCurrentSentence]);

  /**
   * Play a custom snippet
   */
  const playSnippet = useCallback((title: string, subtitle: string, text: string, archId = ArchType.Monolithic) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const track = buildCustomSnippetTrack(title, subtitle, text, archId);
    trackRef.current = track;

    setState({
      isPlaying: true,
      isPaused: false,
      isLoading: true,
      currentTrack: track,
      currentSectionIndex: 0,
      currentSentenceIndex: 0,
      currentSentenceText: track.sections[0]?.sentences[0] || '',
      elapsedSeconds: 0,
      totalDurationSeconds: track.totalDurationEstSeconds,
      progressPercent: 0,
    });

    speakCurrentSentence(0, 0);
  }, [speakCurrentSentence]);

  /**
   * Pause playback
   */
  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, []);

  /**
   * Resume playback
   */
  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setState(prev => ({ ...prev, isPaused: false, isPlaying: true }));
      } else {
        // If utterance was cancelled on sleep/pause, restart current sentence
        speakCurrentSentence(currentSectionIdxRef.current, currentSentenceIdxRef.current);
      }
    }
  }, [speakCurrentSentence]);

  /**
   * Toggle Play / Pause
   */
  const togglePlayPause = useCallback(() => {
    if (state.isPlaying && !state.isPaused) {
      pause();
    } else if (state.isPaused) {
      resume();
    } else if (state.currentTrack) {
      resume();
    }
  }, [state.isPlaying, state.isPaused, state.currentTrack, pause, resume]);

  /**
   * Stop playback completely
   */
  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      isLoading: false,
      currentSentenceText: '',
      elapsedSeconds: 0,
      progressPercent: 0,
    }));
  }, []);

  /**
   * Next section
   */
  const nextSection = useCallback(() => {
    if (!trackRef.current) return;
    const nextIdx = currentSectionIdxRef.current + 1;
    if (nextIdx < trackRef.current.sections.length) {
      speakCurrentSentence(nextIdx, 0);
    } else {
      stop();
    }
  }, [speakCurrentSentence, stop]);

  /**
   * Previous section
   */
  const prevSection = useCallback(() => {
    if (!trackRef.current) return;
    const prevIdx = Math.max(0, currentSectionIdxRef.current - 1);
    speakCurrentSentence(prevIdx, 0);
  }, [speakCurrentSentence]);

  /**
   * Jump to specific section
   */
  const jumpToSection = useCallback((sectionIndex: number) => {
    if (!trackRef.current || !trackRef.current.sections[sectionIndex]) return;
    speakCurrentSentence(sectionIndex, 0);
  }, [speakCurrentSentence]);

  /**
   * Jump to specific sentence in a section
   */
  const jumpToSentence = useCallback((sectionIndex: number, sentenceIndex: number) => {
    if (!trackRef.current || !trackRef.current.sections[sectionIndex]) return;
    speakCurrentSentence(sectionIndex, sentenceIndex);
  }, [speakCurrentSentence]);

  /**
   * Seek relative seconds (+10s or -10s)
   */
  const seekRelativeSeconds = useCallback((deltaSeconds: number) => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    
    // Estimate target section/sentence
    const currentElapsed = state.elapsedSeconds;
    const targetElapsed = Math.max(0, Math.min(track.totalDurationEstSeconds, currentElapsed + deltaSeconds));
    
    // Find section matching targetElapsed
    let accum = 0;
    let targetSecIdx = 0;
    for (let i = 0; i < track.sections.length; i++) {
      if (targetElapsed <= accum + track.sections[i].durationEstSeconds) {
        targetSecIdx = i;
        break;
      }
      accum += track.sections[i].durationEstSeconds;
      targetSecIdx = i;
    }

    speakCurrentSentence(targetSecIdx, 0);
  }, [state.elapsedSeconds, speakCurrentSentence]);

  /**
   * Settings Updaters
   */
  const setRate = useCallback((rate: number) => {
    setSettings(prev => ({ ...prev, rate }));
    // If currently speaking, re-speak current sentence with new rate
    if (isPlayingRef.current && !isPausedRef.current) {
      speakCurrentSentence(currentSectionIdxRef.current, currentSentenceIdxRef.current);
    }
  }, [speakCurrentSentence]);

  const setPitch = useCallback((pitch: number) => {
    setSettings(prev => ({ ...prev, pitch }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, volume }));
  }, []);

  const setVoice = useCallback((voiceURI: string) => {
    setSettings(prev => ({ ...prev, selectedVoiceURI: voiceURI }));
    if (isPlayingRef.current && !isPausedRef.current) {
      speakCurrentSentence(currentSectionIdxRef.current, currentSentenceIdxRef.current);
    }
  }, [speakCurrentSentence]);

  const setAutoPlayOnArchChange = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, autoPlayOnArchChange: enabled }));
  }, []);

  const setPreferredMode = useCallback((mode: NarrationMode) => {
    setSettings(prev => ({ ...prev, preferredMode: mode }));
  }, []);

  const setVisualizerMode = useCallback((mode: WaveformVisualizerMode) => {
    setSettings(prev => ({ ...prev, visualizerMode: mode }));
  }, []);

  const setVisualizerTheme = useCallback((theme: WaveformColorTheme) => {
    setSettings(prev => ({ ...prev, visualizerTheme: theme }));
  }, []);

  const setVisualizerSensitivity = useCallback((sensitivity: number) => {
    setSettings(prev => ({ ...prev, visualizerSensitivity: sensitivity }));
  }, []);

  const setShowFrequencyLabels = useCallback((show: boolean) => {
    setSettings(prev => ({ ...prev, showFrequencyLabels: show }));
  }, []);

  /**
   * Full narration script generator (for copying or viewing)
   */
  const getNarrationScript = useCallback((arch: ArchitectureData | ArchType, mode?: NarrationMode): string => {
    const resolvedArch: ArchitectureData = typeof arch === 'string'
      ? ARCHITECTURE_DETAILS[arch] || ARCHITECTURE_DETAILS[ArchType.Monolithic]
      : arch;
    
    const effectiveMode = mode || settings.preferredMode || 'comprehensive';
    const track = buildTrackForMode(resolvedArch, effectiveMode);

    let script = `# Audio Narration Transcript: ${track.title}\n`;
    script += `**Mode:** ${effectiveMode.toUpperCase()} | **Estimated Duration:** ~${Math.ceil(track.totalDurationEstSeconds / 60)} minutes\n\n`;

    track.sections.forEach((sec, idx) => {
      script += `### ${idx + 1}. ${sec.title}\n`;
      if (sec.subtitle) script += `*${sec.subtitle}*\n\n`;
      script += `${sec.text}\n\n`;
    });

    return script;
  }, [settings.preferredMode]);

  return (
    <AudioNarrationContext.Provider
      value={{
        state,
        settings,
        availableVoices,
        isSupported,
        playArchitecture,
        playSnippet,
        pause,
        resume,
        togglePlayPause,
        stop,
        nextSection,
        prevSection,
        jumpToSection,
        jumpToSentence,
        seekRelativeSeconds,
        setRate,
        setPitch,
        setVolume,
        setVoice,
        setAutoPlayOnArchChange,
        setPreferredMode,
        getNarrationScript,
        setVisualizerMode,
        setVisualizerTheme,
        setVisualizerSensitivity,
        setShowFrequencyLabels,
      }}
    >
      {children}
    </AudioNarrationContext.Provider>
  );
};

export const useAudioNarration = () => {
  const context = useContext(AudioNarrationContext);
  if (!context) {
    throw new Error('useAudioNarration must be used within an AudioNarrationProvider');
  }
  return context;
};
