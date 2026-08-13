import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ArchitectureData, ChatMessage, ArchType } from '../types';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Copy, 
  Check, 
  MessageSquare,
  ChevronDown,
  Layers,
  HelpCircle,
  Zap,
  DollarSign,
  ArrowUpRight
} from 'lucide-react';

interface FloatingAiAssistantProps {
  architecture?: ArchitectureData;
  initialPrompt?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const getApiKey = (): string => {
  try {
    if (typeof process !== 'undefined' && process && process.env) {
      if (process.env.API_KEY) return process.env.API_KEY;
      if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
    }
  } catch (e) {}
  try {
    if (import.meta && (import.meta as any).env) {
      if ((import.meta as any).env.VITE_GEMINI_API_KEY) return (import.meta as any).env.VITE_GEMINI_API_KEY;
      if ((import.meta as any).env.VITE_API_KEY) return (import.meta as any).env.VITE_API_KEY;
    }
  } catch (e) {}
  return '';
};

export const FloatingAiAssistant: React.FC<FloatingAiAssistantProps> = ({
  architecture,
  initialPrompt,
  isOpen: controlledIsOpen,
  onOpenChange
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isPopupOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  
  const setPopupOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasAutoSentRef = useRef<boolean>(false);

  // Suggested quick prompts tailored to current architecture
  const quickPrompts = [
    {
      label: '⚖️ Core Trade-offs',
      prompt: `What are the top 3 architectural trade-offs, bottlenecks, and anti-patterns for ${architecture?.title || 'this architecture'}?`
    },
    {
      label: '💰 Cost Optimization',
      prompt: `How can an engineering team optimize infrastructure cost and cloud spending when running ${architecture?.title || 'this system'} at scale?`
    },
    {
      label: '🎯 Mock Interview Question',
      prompt: `Give me a realistic Staff / Principal Engineer system design interview question specifically about ${architecture?.title || 'modern software architecture'} and walk through the ideal answer structure.`
    },
    {
      label: '🚀 Migration Strategy',
      prompt: `What is the recommended phased strangler-fig or migration roadmap from a legacy monolithic stack to ${architecture?.title || 'this architecture'}?`
    }
  ];

  // Send message function
  const sendPromptText = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const apiKey = getApiKey();
      const ai = new GoogleGenAI({ apiKey });
      
      let specificAdvice = "";
      if (architecture?.id === ArchType.Serverless) {
        specificAdvice = `
        Specific Cost Optimization Strategies for Serverless:
        - Use Compute Savings Plans if available.
        - Optimize memory allocation (power tuning) to balance cost vs duration.
        - Avoid "architectural sprawl" (too many small functions).
        - Use provisioned concurrency only when necessary for latency-critical paths.
        - Filter events at the source (e.g., SQS/Kinesis) to avoid invoking functions for irrelevant data.
        `;
      }

      const archTitle = architecture?.title || 'Software Architecture & Senior Interview Concepts';

      const systemContext = `
        You are an expert Principal Software Architect & Senior Technical Interviewer in ArchFiddle SaaS Encyclopedia.
        The user is asking a question in the context of: "${archTitle}".
        
        ${architecture ? `
        Context about current architecture (${architecture.title}):
        - Category: ${architecture.category}
        - Core Idea: ${architecture.coreIdea}
        - Primary Use Cases: ${architecture.useCase}
        - Architectural Description: ${architecture.description}
        - Dev Speed: ${architecture.estimation.devSpeed} (${architecture.estimation.devSpeedDesc})
        - Infra Cost: ${architecture.estimation.infraCost} (${architecture.estimation.infraCostDesc})
        - Complexity Score: ${architecture.estimation.complexityScore}/10 (Recommended Team: ${architecture.estimation.teamSize})
        - Key Strengths (Pros): ${architecture.pros.join(', ')}
        - Key Challenges (Cons): ${architecture.cons.join(', ')}
        - Tech Stack: ${architecture.technologyStack.join(', ')}
        ${specificAdvice}
        ` : ''}

        Formatting guidelines:
        - Structure your response cleanly with clear markdown headings, bullet points, and concise trade-off tables where useful.
        - Include concrete code/architecture snippets or configuration examples when explaining technical patterns.
        - Emphasize real-world engineering constraints (SLA, p99 latency, cognitive load, blast radius, operational costs).
        - Keep answers structured, highly insightful, and senior-level.
      `;

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemContext,
        },
      });

      const result = await chat.sendMessage({ message: textToSend });
      
      const botMsg: ChatMessage = {
        role: 'model',
        text: result.text || "I couldn't generate a response at this moment.",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "Sorry, I encountered an error connecting to the AI Architect. Please verify your connection or try again in a moment.",
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Reset or initialize greeting when architecture changes
  useEffect(() => {
    hasAutoSentRef.current = false;
    const title = architecture?.title || 'Modern Software Architecture';
    
    setMessages([{
      role: 'model',
      text: `👋 Greetings! I'm your **AI Principal Architect**. \n\nI have full architectural context on **${title}** loaded. Ask me about system design trade-offs, cloud cost modeling, zero-downtime migrations, or senior interview drills!`,
      timestamp: Date.now()
    }]);

    if (initialPrompt && !hasAutoSentRef.current) {
      hasAutoSentRef.current = true;
      setPopupOpen(true);
      setInput(initialPrompt);
      const timer = setTimeout(() => {
        sendPromptText(initialPrompt);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [architecture?.id, initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isPopupOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isPopupOpen]);

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearHistory = () => {
    const title = architecture?.title || 'Modern Software Architecture';
    setMessages([{
      role: 'model',
      text: `Conversation cleared. I'm ready for new questions regarding **${title}** or general system design patterns.`,
      timestamp: Date.now()
    }]);
  };

  return (
    <>
      {/* Floating Action Button / Bubble */}
      {!isPopupOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3">
          {/* Subtle Attention Tooltip Badge on larger screens */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/95 backdrop-blur-md border border-blue-500/40 rounded-full text-xs text-blue-200 shadow-xl animate-in fade-in slide-in-from-right-4 duration-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            <span className="font-semibold">Ask AI Architect</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-blue-950 text-blue-300 border border-blue-800 rounded font-mono">
              Gemini 2.5
            </span>
          </div>

          <button
            onClick={() => setPopupOpen(true)}
            aria-label="Open AI Architect Assistant"
            className="group relative flex items-center justify-center p-3.5 sm:p-4 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full shadow-2xl shadow-blue-900/60 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20"
          >
            {/* Glowing outer pulse ring */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-40 blur-sm group-hover:opacity-75 transition-opacity animate-pulse" />
            
            <div className="relative flex items-center gap-2">
              <Bot className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-200" />
              <span className="hidden sm:inline font-bold text-xs pr-1">
                AI Architect
              </span>
            </div>

            {/* Online Status Dot */}
            <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 border-2 border-zinc-950 rounded-full" />
          </button>
        </div>
      )}

      {/* Floating Popup Window or Full Screen Modal */}
      {isPopupOpen && (
        <>
          {/* Backdrop when in full-screen expanded mode */}
          {isExpanded && (
            <div 
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[90] animate-in fade-in duration-200"
            />
          )}

          <div
            className={`fixed z-[100] flex flex-col bg-zinc-950/95 backdrop-blur-2xl border border-zinc-700/90 shadow-2xl shadow-black/80 transition-all duration-300 ${
              isExpanded
                ? 'inset-3 sm:inset-8 md:inset-12 max-w-5xl mx-auto rounded-2xl'
                : 'bottom-4 sm:bottom-6 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[480px] md:w-[520px] h-[640px] max-h-[85vh] rounded-2xl animate-in fade-in slide-in-from-bottom-6 duration-200'
            }`}
          >
            {/* Header */}
            <div className="p-3.5 sm:p-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between gap-2 shrink-0">
              
              {/* Left Title & Status */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative p-2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl text-white shadow-md shrink-0">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-zinc-900 rounded-full" />
                </div>
                
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <h3 className="font-extrabold text-sm sm:text-base text-white truncate">
                      AI Principal Architect
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800/80 px-2 py-0.5 rounded-full shrink-0">
                      Gemini 2.5
                    </span>
                  </div>
                  
                  {architecture && (
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono truncate">
                      <span className="text-zinc-500">Context:</span>
                      <span className="text-blue-400 font-semibold truncate">{architecture.title}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Action Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleClearHistory}
                  className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Clear Conversation History"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors hidden sm:flex"
                  title={isExpanded ? "Collapse to Floating Card" : "Expand to Full Screen"}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    setPopupOpen(false);
                    setIsExpanded(false);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Close Assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Context / Suggested Starter Prompts Banner */}
            <div className="px-3.5 py-2 bg-zinc-900/50 border-b border-zinc-800/60 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Drill Prompts:</span>
              </span>
              
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => sendPromptText(item.prompt)}
                  disabled={loading}
                  className="whitespace-nowrap px-2.5 py-1 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-blue-200 text-[11px] rounded-lg border border-zinc-700/60 hover:border-blue-500/60 transition-all font-medium shrink-0 flex items-center gap-1 disabled:opacity-50"
                >
                  <span>{item.label}</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                </button>
              ))}
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`group relative max-w-[90%] sm:max-w-[85%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-br-none shadow-md'
                      : 'bg-zinc-900/90 text-zinc-200 rounded-bl-none border border-zinc-800/90 shadow-sm'
                  }`}>
                    {/* Copy button on bot message */}
                    {msg.role === 'model' && (
                      <button
                        onClick={() => handleCopyMessage(msg.text, idx)}
                        className="absolute top-2.5 right-2.5 p-1 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-all text-[10px] flex items-center gap-1"
                        title="Copy Response"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span className="text-green-400 font-mono">Copied</span>
                          </>
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}

                    <div className="whitespace-pre-wrap font-sans">
                      {msg.text}
                    </div>

                    <div className={`text-[10px] mt-2 flex items-center justify-end font-mono opacity-70 ${
                      msg.role === 'user' ? 'text-blue-200' : 'text-zinc-500'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900/90 p-4 rounded-2xl rounded-bl-none border border-zinc-800 text-xs text-zinc-400 flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                    <div>
                      <p className="font-semibold text-zinc-300">AI Architect is analyzing architecture context...</p>
                      <p className="text-[11px] text-zinc-500">Synthesizing trade-offs, SLAs, and technical recommendations</p>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 sm:p-4 bg-zinc-900/90 border-t border-zinc-800 shrink-0">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  sendPromptText(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask about ${architecture?.title || 'architecture'}, design patterns, trade-offs...`}
                  className="flex-1 bg-zinc-950 border border-zinc-700/80 text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-zinc-500 font-sans"
                />
                
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shadow-md shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>

          </div>
        </>
      )}
    </>
  );
};
