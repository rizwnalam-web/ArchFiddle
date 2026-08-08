import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Play, Square, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Award, BarChart2, ShieldCheck, HelpCircle } from 'lucide-react';
import { InterviewQuestion } from '../data/interviewPrepData';

interface VoiceAnswerEvaluatorProps {
  question: InterviewQuestion;
  onAnswerEvaluated?: (score: number) => void;
}

export interface AIEvaluationResult {
  score: number;
  clarityScore: number;
  technicalAccuracyScore: number;
  coveredPoints: string[];
  missedPoints: string[];
  spokenKeywordsFound: string[];
  missingKeywords: string[];
  clarityFeedback: string;
  seniorityRating: 'Junior' | 'Mid-Level' | 'Senior' | 'Staff / Architect';
  actionableTip: string;
}

// Helper to declare window speech recognition for TS
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const VoiceAnswerEvaluator: React.FC<VoiceAnswerEvaluatorProps> = ({ question, onAnswerEvaluated }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<AIEvaluationResult | null>(null);
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Check browser SpeechRecognition & Microphone availability
  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass && !navigator.mediaDevices?.getUserMedia) {
      setMicPermission('unsupported');
      return;
    }

    // Check permission status if API available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then((permissionStatus) => {
          setMicPermission(permissionStatus.state as any);
          permissionStatus.onchange = () => {
            setMicPermission(permissionStatus.state as any);
          };
        })
        .catch(() => {
          // Fallback
        });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  // Recording Timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  // Request Microphone Permission & Start Speech Recognition
  const startRecording = async () => {
    setMicErrorMessage(null);
    setEvaluation(null);

    // 1. Request microphone stream via getUserMedia for audio analyzer & browser permission grant
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setMicPermission('granted');

      // Set up Audio Context & Visualizer Analyser
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateAudioLevel = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(updateAudioLevel);
          }
        };
        updateAudioLevel();
      }
    } catch (err: any) {
      console.error("Microphone permission error:", err);
      setMicPermission('denied');
      setMicErrorMessage(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Microphone access was blocked by your browser. Please click the microphone icon in your address bar to grant permission.'
          : 'Could not access microphone: ' + (err.message || 'Unknown error')
      );
      return;
    }

    // 2. Initialize SpeechRecognition API for live transcription
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalTranscriptAccumulator = transcript ? transcript + ' ' : '';

        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscriptAccumulator += event.results[i][0].transcript + ' ';
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          setTranscript((finalTranscriptAccumulator + interim).trim());
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition notice:", event.error);
          if (event.error === 'not-allowed') {
            setMicPermission('denied');
            setMicErrorMessage('Speech recognition microphone access denied.');
          }
        };

        recognition.onend = () => {
          // Auto restart if user is still in recording state
          if (recognitionRef.current && isRecording && !isPaused) {
            try {
              recognition.start();
            } catch (e) {
              // Ignore restart error
            }
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.error("Failed to start SpeechRecognition:", err);
      }
    } else {
      // Browser supports audio recording but not built-in SpeechRecognition
      setMicErrorMessage("SpeechRecognition is not built into this browser version, but you can speak into the mic and type/paste your answer below for AI evaluation.");
    }

    setIsRecording(true);
    setIsPaused(false);
  };

  const stopRecordingCleanup = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);
    setIsPaused(false);
    setAudioLevel(0);
  };

  const stopRecording = () => {
    stopRecordingCleanup();
  };

  const handleReset = () => {
    stopRecordingCleanup();
    setTranscript('');
    setRecordingSeconds(0);
    setEvaluation(null);
    setMicErrorMessage(null);
  };

  // Evaluate the Spoken Answer
  const evaluateAnswer = () => {
    if (!transcript.trim()) return;

    setIsEvaluating(true);

    setTimeout(() => {
      const textLower = transcript.toLowerCase();
      const keyPoints = question.detailedAnswer.keyPoints || [];
      const tags = question.tags || [];

      // Check key points coverage
      const coveredPoints: string[] = [];
      const missedPoints: string[] = [];

      keyPoints.forEach((point) => {
        // Extract meaningful technical terms from point
        const words = point.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').filter(w => w.length > 3);
        const matchCount = words.filter(w => textLower.includes(w)).length;
        const matchRatio = words.length > 0 ? matchCount / words.length : 0;

        if (matchRatio >= 0.3 || textLower.includes(point.toLowerCase().slice(0, 15))) {
          coveredPoints.push(point);
        } else {
          missedPoints.push(point);
        }
      });

      // Keywords match
      const spokenKeywordsFound: string[] = [];
      const missingKeywords: string[] = [];

      tags.forEach((tag) => {
        if (textLower.includes(tag.toLowerCase())) {
          spokenKeywordsFound.push(tag);
        } else {
          missingKeywords.push(tag);
        }
      });

      // Calculate score breakdown
      const pointCoverageRatio = keyPoints.length > 0 ? coveredPoints.length / keyPoints.length : 0.8;
      const wordCount = transcript.trim().split(/\s+/).length;
      
      // Clarity score based on word count and structure
      let clarityScore = 85;
      if (wordCount < 15) clarityScore = 40;
      else if (wordCount < 30) clarityScore = 65;
      else if (wordCount > 250) clarityScore = 75; // a bit verbose

      // Technical accuracy score
      let techScore = Math.round(pointCoverageRatio * 100);
      if (spokenKeywordsFound.length > 0) techScore = Math.min(100, techScore + 10);

      const overallScore = Math.min(100, Math.round((techScore * 0.65) + (clarityScore * 0.35)));

      // Determine Seniority Impression
      let seniorityRating: 'Junior' | 'Mid-Level' | 'Senior' | 'Staff / Architect' = 'Mid-Level';
      if (overallScore >= 88 && wordCount >= 40) seniorityRating = 'Staff / Architect';
      else if (overallScore >= 75) seniorityRating = 'Senior';
      else if (overallScore >= 55) seniorityRating = 'Mid-Level';
      else seniorityRating = 'Junior';

      // Feedback & Tips
      let clarityFeedback = '';
      if (wordCount < 20) {
        clarityFeedback = 'Answer is too brief for a senior interview. Expand on concrete architecture implementation details.';
      } else if (wordCount > 200) {
        clarityFeedback = 'Comprehensive explanation! To impress executives, summarize the core tradeoff in the first 20 seconds before diving deep.';
      } else {
        clarityFeedback = 'Great pacing and structural delivery! Clear explanation of technical concepts.';
      }

      let actionableTip = '';
      if (missedPoints.length > 0) {
        actionableTip = `To boost your score, explicitly mention key point: "${missedPoints[0]}".`;
      } else {
        actionableTip = `Excellent coverage! Pro-tip: Wrap up your response with: "${(question.detailedAnswer?.proTipOrPitfall || '').slice(0, 80)}..." to showcase battle-tested experience.`;
      }

      const result: AIEvaluationResult = {
        score: overallScore,
        clarityScore,
        technicalAccuracyScore: techScore,
        coveredPoints,
        missedPoints,
        spokenKeywordsFound,
        missingKeywords,
        clarityFeedback,
        seniorityRating,
        actionableTip
      };

      setEvaluation(result);
      setIsEvaluating(false);

      if (onAnswerEvaluated) {
        onAnswerEvaluated(overallScore);
      }
    }, 600);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-5 shadow-2xl animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl text-white shadow-md">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Voice Answer Practice & AI Speech Evaluator</span>
              <span className="text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded">
                Live Mic Transcriber
              </span>
            </h4>
            <p className="text-[11px] text-zinc-400">
              Speak your answer into your microphone. The AI will transcribe and evaluate your technical depth & clarity.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {micPermission === 'granted' && !isRecording && (
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Microphone Ready</span>
            </span>
          )}
          {isRecording && (
            <span className="text-[10px] font-mono text-red-400 bg-red-950/80 border border-red-800 px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Recording... ({formatTimer(recordingSeconds)})</span>
            </span>
          )}
          {micPermission === 'denied' && (
            <span className="text-[10px] font-mono text-red-300 bg-red-950/90 border border-red-800 px-2.5 py-1 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Mic Access Blocked</span>
            </span>
          )}
        </div>
      </div>

      {/* Permission Blocked Banner */}
      {micErrorMessage && (
        <div className="bg-red-950/40 border border-red-900/60 p-3.5 rounded-xl text-xs text-red-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{micErrorMessage}</p>
            <p className="text-[11px] text-red-300">
              Tip: Check your browser's site settings or click the lock/mic icon near the URL address bar to grant microphone access.
            </p>
          </div>
        </div>
      )}

      {/* Recording Visualizer & Controls Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Main Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex-1 sm:flex-initial py-2.5 px-5 bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-600 hover:from-purple-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4" />
                <span>Start Speaking</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex-1 sm:flex-initial py-2.5 px-5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 animate-pulse"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Recording</span>
              </button>
            )}

            {(transcript || isRecording) && (
              <button
                onClick={handleReset}
                className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                title="Clear transcript and reset"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>

          {/* Sound Wave Meter */}
          {isRecording && (
            <div className="flex items-center gap-2 w-full sm:w-48 bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-800">
              <Volume2 className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="flex-1 flex items-center gap-1 h-4">
                {[...Array(12)].map((_, i) => {
                  const isActive = (i / 12) * 100 <= audioLevel;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-75 ${
                        isActive
                          ? i > 8 ? 'bg-red-500 h-full' : i > 5 ? 'bg-amber-400 h-3/4' : 'bg-purple-400 h-1/2'
                          : 'bg-zinc-800 h-1'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-[10px] font-mono text-zinc-400 w-8 text-right">
                {audioLevel}%
              </span>
            </div>
          )}
        </div>

        {/* Live Transcribed Speech Output Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
            <span className="flex items-center gap-1.5">
              <span>📝 Live Transcribed Answer:</span>
              {transcript && (
                <span className="text-[10px] font-mono font-normal text-zinc-400">
                  ({transcript.trim().split(/\s+/).filter(Boolean).length} words)
                </span>
              )}
            </span>
            {transcript && (
              <button
                onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                className="text-[10px] text-teal-400 hover:underline"
              >
                {isEditingTranscript ? 'Done Editing' : '✏️ Edit Text'}
              </button>
            )}
          </div>

          {isEditingTranscript ? (
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full h-28 bg-zinc-950 border border-teal-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
              placeholder="Type or edit your spoken answer..."
            />
          ) : (
            <div className="min-h-[70px] max-h-36 overflow-y-auto bg-zinc-950 border border-zinc-800/90 rounded-xl p-3 text-xs text-zinc-200 leading-relaxed custom-scrollbar font-mono">
              {transcript ? (
                <p className="whitespace-pre-wrap">{transcript}</p>
              ) : (
                <p className="text-zinc-600 italic">
                  {isRecording
                    ? 'Listening... Speak into your microphone to generate live transcript.'
                    : 'Click "Start Speaking" above to record your voice answer or type your response here.'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Evaluate Action Button */}
        {transcript.trim().length > 0 && (
          <div className="pt-1">
            <button
              onClick={evaluateAnswer}
              disabled={isEvaluating}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI Analyzing Answer Content & Technical Depth...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Evaluate Answer with AI</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* AI Evaluation Results Panel */}
      {evaluation && (
        <div className="bg-zinc-900 border border-teal-900/60 p-5 rounded-2xl space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* Top Score Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-950 to-emerald-950 border border-teal-800 shrink-0 shadow-inner">
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {evaluation.score}
                </span>
                <span className="text-[9px] font-mono text-zinc-500 absolute bottom-1">/ 100</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">AI Technical Assessment Score</h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-purple-950 text-purple-300 border-purple-800">
                    {evaluation.seniorityRating} Level
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-snug">
                  {evaluation.clarityFeedback}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-around border-t sm:border-t-0 border-zinc-800 pt-3 sm:pt-0">
              <div className="text-center">
                <div className="text-xs text-zinc-400">Technical Depth</div>
                <div className="text-sm font-black text-teal-400 font-mono">{evaluation.technicalAccuracyScore}%</div>
              </div>
              <div className="h-8 w-px bg-zinc-800" />
              <div className="text-center">
                <div className="text-xs text-zinc-400">Clarity & Pace</div>
                <div className="text-sm font-black text-sky-400 font-mono">{evaluation.clarityScore}%</div>
              </div>
            </div>
          </div>

          {/* Key Points Coverage Breakdown */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-teal-400" />
              <span>Model Answer Key Points Coverage ({evaluation.coveredPoints.length} / {question.detailedAnswer.keyPoints.length})</span>
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {question.detailedAnswer.keyPoints.map((point, idx) => {
                const isCovered = evaluation.coveredPoints.includes(point);
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                      isCovered
                        ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-200'
                        : 'bg-zinc-950 border-zinc-800/80 text-zinc-400'
                    }`}
                  >
                    {isCovered ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <HelpCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed font-medium">{point}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spoken Technical Keywords Detected */}
          {evaluation.spokenKeywordsFound.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                ✓ Technical Keywords Detected in Your Speech:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {evaluation.spokenKeywordsFound.map((kw) => (
                  <span
                    key={kw}
                    className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-semibold"
                  >
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Senior Improvement Tip */}
          <div className="bg-amber-950/30 border border-amber-900/50 p-4 rounded-xl space-y-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Actionable Senior Tip to Elevate Your Response:</span>
            </span>
            <p className="text-xs text-amber-100 leading-relaxed font-medium">
              {evaluation.actionableTip}
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
