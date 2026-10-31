import { useState } from 'react';
import { Bot, User, Send, Sparkles, Trash2 } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { assistantService } from '../../services/assistantService';
import { useToast } from '../../components/Toast';

export function AssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: 'Welcome to the Enterprise SaaS Transformation Advisor. I have ingested your active organizational profile (Apex Global Enterprises, 1,000 employees, on-premise infrastructure) along with multi-criteria evaluation results and the 8-phase roadmap. How can I assist your transformation committee today?',
      category: 'Welcome Guidance'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const { showToast } = useToast();

  const promptChips = [
    'Why is the top product ranked #1?',
    'What are our most critical migration risks?',
    'How should we plan data migration for our legacy systems?',
    'What does our TOE readiness score indicate?',
    'Generate executive summary pitch for the CFO'
  ];

  const handleSend = async (questionText = input) => {
    const q = questionText.trim();
    if (!q) return;
    if (!enabled) {
      showToast('AI Advisor is currently paused.', 'warning');
      return;
    }

    const userMsg = { id: Date.now(), sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await assistantService.askQuestion(q, 'assessment-ref-case');
      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: response.answer,
        category: response.category
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      showToast(`AI Assistant error: ${err.message}`, 'danger');
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: `Error processing query: ${err.message}. Please try again or select a suggested prompt chip.`,
          category: 'Error'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    showToast('Conversation history cleared.', 'info');
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col">
      {/* Notice Banner */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <Badge variant="warning">New UI / Mocked Service</Badge>
          <span className="text-amber-200">
            <strong>Module 8 (AI Transformation Advisor):</strong> Operates against a mocked service adhering to the zero-secret policy (no cloud LLM API keys hardcoded in frontend).
          </span>
        </div>
        <Badge variant="cyan">Deterministic Logic</Badge>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white tracking-tight">AI Transformation Advisor</h2>
            <Badge variant="cyan">Module 8</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Conversational decision support calibrated with active enterprise assessment context, scores, risks, and roadmap.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearChat} title="Clear conversation history">
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </Button>
          )}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">Active</label>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => {
                setEnabled(e.target.checked);
                showToast(e.target.checked ? 'AI Advisor activated' : 'AI Advisor paused', 'info');
              }}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-800 border-slate-700 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
        {promptChips.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1 rounded-full text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Box */}
      <Card className="flex-1 flex flex-col min-h-0 bg-slate-900/90 overflow-hidden shadow-xl border-slate-800">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <Bot className="w-12 h-12 text-slate-600" />
              <div>
                <h4 className="text-sm font-bold text-white">No Messages in Conversation</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Click any suggested prompt chip above or type an architectural inquiry below to consult the transformation advisor.
                </p>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 shadow-md ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {m.category && (
                    <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{m.category}</span>
                    </div>
                  )}
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                </div>

                {m.sender === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Typing Loading Indicator */}
          {loading && (
            <div className="flex gap-3 text-xs justify-start">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-slate-400 text-[11px] ml-2">Advisor analyzing architecture...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder={enabled ? "Ask about scoring rationale, migration risks, or phased planning..." : "Advisor is paused. Re-enable switch above."}
              disabled={!enabled || loading}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <Button type="submit" variant="primary" size="sm" disabled={!enabled || loading || !input.trim()}>
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send Inquiry</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
