import { useState } from 'react';
import { Bot, User, Send, Sparkles } from 'lucide-react';
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
      text: 'Welcome to the SAP Enterprise SaaS Transformation Advisor. I have ingested your active organizational profile (Apex Global Enterprises, 1,000 employees, on-premise infrastructure) along with multi-criteria evaluation results and 8-phase roadmap. How can I assist your transformation committee today?',
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
      showToast('AI Advisor is currently disabled.', 'warning');
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI Transformation Advisor</h2>
          <p className="text-xs text-slate-400 mt-1">
            Conversational decision support powered by your active assessment context, scores, risks, and roadmap.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium">Assistant Active</label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => {
              setEnabled(e.target.checked);
              showToast(e.target.checked ? 'AI Advisor activated' : 'AI Advisor paused', 'info');
            }}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-800 border-slate-700"
          />
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
      <Card className="flex-1 flex flex-col min-h-0 bg-slate-900/90 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl max-w-2xl text-xs leading-relaxed space-y-1.5 ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none shadow-md'
                }`}
              >
                {m.category && (
                  <Badge variant="cyan" className="mb-1 text-[9px]">
                    {m.category}
                  </Badge>
                )}
                <div className="whitespace-pre-line">{m.text}</div>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-800 text-slate-400 text-xs border border-slate-700 italic flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <span>Analyzing transformation parameters...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center gap-3 shrink-0">
          <input
            type="text"
            placeholder="Ask questions about evaluation rankings, risk mitigations, migration timelines, or business case..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <Button variant="primary" size="md" onClick={() => handleSend()}>
            <Send className="w-4 h-4" />
            <span>Send</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
