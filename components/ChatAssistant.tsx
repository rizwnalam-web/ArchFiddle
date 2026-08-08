import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ArchitectureData, ChatMessage, ArchType } from '../types';
import { MessageSquare, Sparkles, Send, X, Bot } from 'lucide-react';

interface ChatAssistantProps {
  architecture?: ArchitectureData;
  initialPrompt?: string;
  onClose?: () => void;
  isModal?: boolean;
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

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  architecture,
  initialPrompt,
  onClose,
  isModal = false
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAutoSentRef = useRef<boolean>(false);

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
        You are an expert Principal Software Architect & Senior Technical Interviewer.
        The user is asking a question in the context of: "${archTitle}".
        
        ${architecture ? `
        Context about current architecture (${architecture.title}):
        - Core Idea: ${architecture.coreIdea}
        - Use Case: ${architecture.useCase}
        - Description: ${architecture.description}
        - Dev Speed: ${architecture.estimation.devSpeed}
        - Infra Cost: ${architecture.estimation.infraCost}
        - Complexity Score: ${architecture.estimation.complexityScore}/10
        - Summary of Main Pros: ${architecture.pros.join(', ')}
        - Summary of Main Cons: ${architecture.cons.join(', ')}
        ${specificAdvice}
        ` : ''}

        Answer the user's question with senior-level depth, technical clarity, concrete trade-offs, and actionable guidance. 
        If it's an interview question, explain how to structure the answer effectively (e.g. executive summary, key trade-offs, edge cases, and code/architecture snippets).
        Keep answers structured, concise, and professional.
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
        text: result.text || "I couldn't generate a response.",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "Sorry, I encountered an error connecting to the AI Architect. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Reset / Initialize chat when architecture or initialPrompt changes
  useEffect(() => {
    hasAutoSentRef.current = false;
    const title = architecture?.title || 'Architecture & Technical Concepts';
    
    setMessages([{
      role: 'model',
      text: `Hi! I'm your AI Architect Assistant. Ask me anything about ${title} or technical interview questions.`,
      timestamp: Date.now()
    }]);

    if (initialPrompt && !hasAutoSentRef.current) {
      hasAutoSentRef.current = true;
      setInput(initialPrompt);
      const timer = setTimeout(() => {
        sendPromptText(initialPrompt);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [architecture, initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    sendPromptText(input);
  };

  const content = (
    <div className={`flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl ${
      isModal || onClose ? 'w-full max-w-2xl h-[650px] max-h-[90vh]' : 'h-[600px]'
    }`}>
      {/* Header */}
      <div className="p-4 bg-zinc-800/90 border-b border-zinc-700 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
              <span>AI Architect Assistant</span>
              <span className="text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                Gemini 2.5
              </span>
            </h3>
            {architecture && (
              <p className="text-[11px] text-zinc-400 font-mono">
                Context: {architecture.title}
              </p>
            )}
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors text-xs font-mono font-bold flex items-center gap-1"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close</span>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md font-mono' 
                : 'bg-zinc-950 text-zinc-200 rounded-bl-none border border-zinc-800/90 shadow-sm font-sans whitespace-pre-wrap'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-950 p-3.5 rounded-2xl rounded-bl-none border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
              <span>AI Architect is analyzing and crafting detailed response...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <div className="p-4 bg-zinc-800/90 border-t border-zinc-700 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about design patterns, trade-offs, architecture code..."
            className="flex-1 bg-zinc-950 border border-zinc-700 text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-zinc-500 font-mono"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (isModal || onClose) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        {content}
      </div>
    );
  }

  return content;
};
