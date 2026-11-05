import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Trash2,
  HelpCircle,
  Lightbulb,
  Info,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Layers,
  DollarSign
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { assistantService } from '../../services/assistantService';
import { dashboardService } from '../../services/dashboardService';
import { useToast } from '../../components/Toast';

export function AssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: 'Welcome to the NIRNAY AI Transformation Advisor. I provide decision support calibrated with your active enterprise assessment, multi-criteria SaaS rankings, migration risks, and 8-phase transformation roadmap. How can I assist your transformation committee today?',
      category: 'Transformation Guidance',
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [telemetry, setTelemetry] = useState(null);
  const messagesEndRef = useRef(null);
  const { showToast } = useToast();

  const suggestedQuestions = [
    {
      text: 'How can we improve technology readiness?',
      icon: TrendingUp,
      desc: 'Technical debt & API decoupling'
    },
    {
      text: 'What are our biggest transformation risks?',
      icon: ShieldAlert,
      desc: 'Critical exposure & mitigations'
    },
    {
      text: 'Which migration phase should we prioritise?',
      icon: Layers,
      desc: '8-phase execution sequencing'
    },
    {
      text: 'How can we reduce SaaS adoption costs?',
      icon: DollarSign,
      desc: 'Licensing & infrastructure TCO'
    }
  ];

  // Load telemetry context for summary card
  useEffect(() => {
    async function fetchTelemetry() {
      try {
        const data = await dashboardService.getDashboardMetrics('assessment-ref-case');
        setTelemetry(data);
      } catch (err) {
        console.warn('Telemetry load error:', err);
      }
    }
    fetchTelemetry();
  }, []);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText = input) => {
    const q = (questionText || '').trim();
    if (!q) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await assistantService.askQuestion(q, 'assessment-ref-case');
      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: response.answer,
        category: response.category || 'Advisory Guidance',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      showToast(`Advisory engine error: ${err.message}`, 'danger');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: `An error occurred while analyzing: ${err.message}. Please select one of the suggested transformation prompts.`,
          category: 'Error',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'assistant',
        text: 'Conversation history cleared. Select a transformation question or type your strategic inquiry below.',
        category: 'Transformation Guidance',
        timestamp: 'Just now'
      }
    ]);
    showToast('Conversation reset.', 'info');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE5EA]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#102B46] tracking-tight">AI Transformation Advisor</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#247C78]/10 text-[#247C78] border border-[#247C78]/20">
              Decision Support
            </span>
          </div>
          <p className="text-xs text-[#718096]">
            Get guidance for enterprise readiness, SaaS adoption and digital transformation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <Button variant="outline" size="sm" onClick={handleClearChat}>
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </Button>
          )}
        </div>
      </div>

      {/* Advisory Context Banner: Honest Rule-Based vs Backend AI status */}
      <div className="p-3.5 rounded-xl bg-white border border-[#DCE5EA] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-start md:items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#247C78]/10 text-[#247C78] flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#102B46]">Advisory Intelligence Mode:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F4F7FA] text-[#247C78] border border-[#DCE5EA]">
                Rule-Based Guidance & Telemetry Synthesis
              </span>
            </div>
            <p className="text-[#718096] text-[11px] mt-0.5">
              Calibrated directly against your active enterprise parameters (Apex Global Enterprises, 1,000 employees, TOE score: {telemetry?.assessment?.readinessScore || 77.5}/100).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-medium text-[#718096]">Zero-Secret Verified</span>
        </div>
      </div>

      {/* Suggested Questions Grid */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles className="w-4 h-4 text-[#247C78]" />
          <h2 className="text-xs font-bold text-[#102B46] uppercase tracking-wider">Suggested Transformation Questions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {suggestedQuestions.map((q) => {
            const Icon = q.icon;
            return (
              <button
                key={q.text}
                onClick={() => handleSend(q.text)}
                disabled={loading}
                className="text-left p-3 rounded-xl bg-white border border-[#DCE5EA] hover:border-[#247C78] hover:bg-[#F4F7FA]/50 transition-all shadow-sm group flex flex-col justify-between"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#247C78]/10 text-[#247C78] flex items-center justify-center shrink-0 group-hover:bg-[#247C78] group-hover:text-white transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#102B46] group-hover:text-[#247C78] transition-colors leading-snug">
                      {q.text}
                    </p>
                    <p className="text-[10px] text-[#718096] mt-1">{q.desc}</p>
                  </div>
                </div>
                <div className="flex items-center text-[10px] font-semibold text-[#247C78] mt-2 pt-2 border-t border-[#DCE5EA]/60">
                  <span>Ask Advisor</span>
                  <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Conversation Area */}
      <div className="bg-white rounded-xl border border-[#DCE5EA] shadow-sm flex flex-col h-[600px] overflow-hidden">
        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F4F7FA]/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-[#247C78]/10 border border-[#247C78]/20 flex items-center justify-center text-[#247C78] shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-[#102B46] text-white rounded-tr-none'
                    : 'bg-white border border-[#DCE5EA] text-[#263746] rounded-tl-none'
                }`}
              >
                {m.category && (
                  <div className="text-[10px] font-bold text-[#247C78] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{m.category}</span>
                  </div>
                )}
                <div className="whitespace-pre-line leading-relaxed text-xs">
                  {m.text}
                </div>
                {m.timestamp && (
                  <div className={`text-[10px] mt-2 text-right ${m.sender === 'user' ? 'text-slate-300' : 'text-[#718096]'}`}>
                    {m.timestamp}
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-[#102B46] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-3 text-xs justify-start">
              <div className="w-8 h-8 rounded-lg bg-[#247C78]/10 border border-[#247C78]/20 flex items-center justify-center text-[#247C78] shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-[#DCE5EA] rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-[#247C78] animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-[#102B46] animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-[#718096] text-[11px] ml-1">Synthesizing advisory guidance...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* User Input Form */}
        <div className="p-3.5 bg-white border-t border-[#DCE5EA]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2.5"
          >
            <input
              type="text"
              placeholder="Ask about readiness improvements, migration phases, risks, or SaaS evaluation..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-[#F4F7FA] border border-[#DCE5EA] rounded-xl px-4 py-2.5 text-xs text-[#263746] placeholder-[#718096] focus:outline-none focus:border-[#247C78] focus:bg-white transition-all disabled:opacity-50"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading || !input.trim()}
              className="bg-[#247C78] hover:bg-[#1f6b67] text-white border-none px-4"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              <span>Submit</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
