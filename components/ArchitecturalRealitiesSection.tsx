import React, { useMemo } from 'react';
import { ArchitectureData } from '../types';
import { useAudioNarration } from '../src/context/AudioNarrationContext';
import { cleanTextForSpeech, splitIntoSentences } from '../src/utils/textToSpeechFormatter';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Sparkles,
  Radio,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface ArchitecturalRealitiesSectionProps {
  architecture: ArchitectureData;
  onOpenAudioStudio?: () => void;
}

interface ParsedWord {
  id: string;
  word: string;
  cleanWord: string;
  startChar: number;
  endChar: number;
}

interface ParsedSentence {
  id: string;
  index: number;
  rawText: string;
  cleanText: string;
  words: ParsedWord[];
  paragraphIndex: number;
}

interface ParsedParagraph {
  index: number;
  sentences: ParsedSentence[];
}

export const ArchitecturalRealitiesSection: React.FC<ArchitecturalRealitiesSectionProps> = ({
  architecture,
  onOpenAudioStudio
}) => {
  const {
    state: audioState,
    settings: audioSettings,
    playSnippet,
    pause,
    resume,
    stop,
    jumpToSentence,
    isSupported: isTtsSupported
  } = useAudioNarration();

  // Parse description text into structured paragraphs, sentences, and words
  const parsedData = useMemo(() => {
    const rawParagraphs = (architecture.description || '')
      .split('\n\n')
      .map(p => p.trim())
      .filter(Boolean);

    let globalSentenceIndex = 0;
    const paragraphs: ParsedParagraph[] = [];
    const allSentences: ParsedSentence[] = [];

    rawParagraphs.forEach((paraText, pIdx) => {
      const sentenceStrings = splitIntoSentences(paraText);
      const paraSentences: ParsedSentence[] = [];

      sentenceStrings.forEach(rawSentence => {
        const cleanSentence = cleanTextForSpeech(rawSentence);
        
        // Tokenize sentence into words while preserving exact indices
        const words: ParsedWord[] = [];
        const regex = /(\S+)/g;
        let match;

        while ((match = regex.exec(rawSentence)) !== null) {
          const rawWord = match[0];
          const cleanWord = rawWord.replace(/^[^\w]+|[^\w]+$/g, '').toLowerCase();
          words.push({
            id: `w-${globalSentenceIndex}-${match.index}`,
            word: rawWord,
            cleanWord,
            startChar: match.index,
            endChar: match.index + rawWord.length
          });
        }

        const sentenceObj: ParsedSentence = {
          id: `s-${globalSentenceIndex}`,
          index: globalSentenceIndex,
          rawText: rawSentence,
          cleanText: cleanSentence,
          words,
          paragraphIndex: pIdx
        };

        paraSentences.push(sentenceObj);
        allSentences.push(sentenceObj);
        globalSentenceIndex++;
      });

      paragraphs.push({
        index: pIdx,
        sentences: paraSentences
      });
    });

    return { paragraphs, allSentences };
  }, [architecture.description]);

  // Determine if the current audio track is actively narrating this architecture's description
  const isNarratingThisArch =
    audioState.isPlaying &&
    audioState.currentTrack &&
    audioState.currentTrack.archId === architecture.id;

  // Find active sentence index based on audioState.currentSentenceText or section sentence
  const activeSentenceMatch = useMemo(() => {
    if (!audioState.isPlaying || !audioState.currentSentenceText) {
      return null;
    }

    const currentSpokenClean = cleanTextForSpeech(audioState.currentSentenceText).toLowerCase();

    // Check if the current spoken sentence matches one of our parsed sentences
    const matchedIndex = parsedData.allSentences.findIndex(s => {
      const sClean = s.cleanText.toLowerCase();
      return (
        sClean === currentSpokenClean ||
        sClean.includes(currentSpokenClean) ||
        currentSpokenClean.includes(sClean) ||
        (s.rawText.length > 15 && currentSpokenClean.includes(s.rawText.slice(0, 15).toLowerCase()))
      );
    });

    return matchedIndex !== -1 ? parsedData.allSentences[matchedIndex] : null;
  }, [audioState.isPlaying, audioState.currentSentenceText, parsedData.allSentences]);

  // Find active word in the active sentence
  const activeWordId = useMemo(() => {
    if (!activeSentenceMatch) return null;

    const currentSpokenWord = (audioState.currentWord || '').replace(/^[^\w]+|[^\w]+$/g, '').toLowerCase();
    const charIndex = audioState.charIndex ?? 0;

    // Strategy 1: Match by character boundary offset in sentence if available
    if (charIndex > 0 && activeSentenceMatch.words.length > 0) {
      const wordByChar = activeSentenceMatch.words.find(
        w => charIndex >= w.startChar && charIndex <= w.endChar + 2
      );
      if (wordByChar) return wordByChar.id;
    }

    // Strategy 2: Match by clean word equality
    if (currentSpokenWord) {
      const wordByName = activeSentenceMatch.words.find(w => w.cleanWord === currentSpokenWord);
      if (wordByName) return wordByName.id;
    }

    return null;
  }, [activeSentenceMatch, audioState.currentWord, audioState.charIndex]);

  // Start reading aloud this entire Architectural Realities section
  const handlePlaySection = (startFromSentenceIndex = 0) => {
    const fullText = architecture.description;
    const title = `${architecture.title}: Architectural Realities & Trade-Offs`;
    const subtitle = 'Deep-Dive Reality Analysis';
    
    // Play as custom snippet track
    playSnippet(title, subtitle, fullText, architecture.id);

    if (startFromSentenceIndex > 0) {
      // jump to sentence index
      setTimeout(() => {
        jumpToSentence(0, startFromSentenceIndex);
      }, 100);
    }
  };

  const handleSentenceClick = (sentenceIndex: number) => {
    if (isNarratingThisArch && audioState.currentTrack?.mode === 'custom' && activeSentenceMatch) {
      jumpToSentence(audioState.currentSectionIndex, sentenceIndex);
    } else {
      handlePlaySection(sentenceIndex);
    }
  };

  return (
    <section id="architectural-realities-tradeoffs-section" className="space-y-3">
      {/* Section Header with Audio Synchronization Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/80 p-3.5 sm:px-5 sm:py-3.5 rounded-2xl border border-zinc-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-700/60 text-purple-400 shrink-0">
            <Radio className={`w-4 h-4 ${audioState.isPlaying && activeSentenceMatch ? 'text-purple-300 animate-pulse' : 'text-purple-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Architectural Realities & Trade-Offs
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-700/50 text-purple-300">
                Live Speech Sync
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Interactive text with real-time audio narration and word-by-word tracking
            </p>
          </div>
        </div>

        {/* Audio Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {isTtsSupported && (
            <>
              {audioState.isPlaying && activeSentenceMatch ? (
                <div className="flex items-center gap-1.5 bg-zinc-950 border border-purple-500/40 px-3 py-1.5 rounded-xl shadow-sm">
                  {/* Energy Waveform Bars */}
                  <div className="flex items-end gap-0.5 h-3.5 px-1">
                    {[0.6, 1.0, 0.4, 0.8, 0.5].map((scale, i) => (
                      <span
                        key={i}
                        className="w-1 bg-purple-400 rounded-full transition-all duration-75"
                        style={{
                          height: `${Math.max(20, Math.min(100, (audioState.speechEnergy || 0.5) * 100 * scale))}%`
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={audioState.isPaused ? resume : pause}
                    className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                    title={audioState.isPaused ? "Resume Audio" : "Pause Audio"}
                  >
                    {audioState.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={stop}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    title="Stop Audio"
                  >
                    <Square className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handlePlaySection(0)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-purple-950/50 flex items-center gap-1.5 group transform active:scale-95"
                  title="Listen to Architectural Realities with Live Word Highlighting"
                >
                  <Volume2 className="w-3.5 h-3.5 text-purple-200 group-hover:scale-110 transition-transform" />
                  <span>Listen to Realities (~1.5m)</span>
                </button>
              )}

              {onOpenAudioStudio && (
                <button
                  onClick={onOpenAudioStudio}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl border border-zinc-700 transition-colors"
                  title="Open Voice Studio & Settings"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Active Spoken Status Banner (Shows when narration is running on this section) */}
      {audioState.isPlaying && activeSentenceMatch && (
        <div className="bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-zinc-900 border border-purple-500/50 px-4 py-2 rounded-xl flex items-center justify-between text-xs text-purple-200 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping shrink-0" />
            <span className="font-semibold text-white">Narrating:</span>
            <span className="italic truncate text-purple-300">
              "{activeSentenceMatch.rawText}"
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-mono text-[10px] text-purple-300/80">
            <span>Sent {activeSentenceMatch.index + 1}/{parsedData.allSentences.length}</span>
            {audioState.currentWord && (
              <span className="px-1.5 py-0.2 rounded bg-purple-900 text-white font-bold">
                {audioState.currentWord}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Text Container with Real-Time Word & Sentence Highlighting */}
      <div className="relative bg-zinc-900/50 p-5 sm:p-6 rounded-2xl border border-zinc-800/80 shadow-lg text-sm sm:text-base leading-relaxed space-y-4">
        {parsedData.paragraphs.map(para => (
          <p key={para.index} className="space-y-1">
            {para.sentences.map(sentence => {
              const isSentenceActive = activeSentenceMatch?.id === sentence.id;

              return (
                <span
                  key={sentence.id}
                  onClick={() => handleSentenceClick(sentence.index)}
                  className={`cursor-pointer transition-all duration-150 rounded-lg px-1.5 py-0.5 inline ${
                    isSentenceActive
                      ? 'bg-blue-950/70 text-blue-100 ring-1 ring-blue-500/60 shadow-sm shadow-blue-950/50'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                  }`}
                  title="Click to play narration from this sentence"
                >
                  {sentence.words.map((w, wIdx) => {
                    const isWordActive = isSentenceActive && (activeWordId === w.id || (activeWordId === null && wIdx === 0));

                    return (
                      <span
                        key={w.id}
                        className={`transition-all duration-75 inline-block mx-[1.5px] ${
                          isWordActive
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-extrabold px-1.5 py-0.5 rounded-md shadow-md shadow-blue-600/60 ring-2 ring-blue-400 scale-105 transform -translate-y-0.5'
                            : isSentenceActive
                            ? 'text-blue-100 font-medium'
                            : 'text-zinc-300'
                        }`}
                      >
                        {w.word}
                      </span>
                    );
                  })}
                  {' '}
                </span>
              );
            })}
          </p>
        ))}

        {/* Floating Hint Bar */}
        <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Click any sentence to listen directly with live word cursor</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span>{parsedData.allSentences.length} Sentences</span>
            <span>•</span>
            <span>Speed: {audioSettings.rate}x</span>
          </div>
        </div>
      </div>
    </section>
  );
};
