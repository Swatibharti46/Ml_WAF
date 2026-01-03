import React, { useState } from 'react';
import { TrafficLog, AnomalyInsight } from '../types';
import { 
  Terminal, BrainCircuit, AlertCircle, CheckCircle2, ThumbsUp, ThumbsDown, Loader2, ShieldCheck
} from 'lucide-react';

interface AnomalyAnalysisProps {
  logs: TrafficLog[];
  onFeedback: (id: string, feedback: 'CONFIRMED' | 'FALSE_POSITIVE') => void;
}

const AnomalyAnalysis: React.FC<AnomalyAnalysisProps> = ({ logs, onFeedback }) => {
  const [selectedLog, setSelectedLog] = useState<TrafficLog | null>(null);
  const [insight, setInsight] = useState<AnomalyInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (log: TrafficLog) => {
    setSelectedLog(log);
    setLoading(true);
    setInsight(null);
    try {
      const res = await fetch(`/api/analyze/${log.id}`, { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        setInsight(result);
      }
    } catch (err) {
      console.error("Forensic analysis failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6 flex flex-col h-full overflow-hidden">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-indigo-100">AI Threat Inspector</h2>
          <p className="text-slate-400 text-sm">Validating anomalies against neural threat patterns.</p>
        </div>
        
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-y-auto">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
              <ShieldCheck size={48} className="mb-4 text-emerald-500/20" />
              <p>Buffer clear. No active threats.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {logs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => handleAnalyze(log)}
                  className={`w-full text-left p-6 transition-all hover:bg-slate-800/40 flex items-start gap-4 relative ${
                    selectedLog?.id === log.id ? 'bg-indigo-600/10 border-l-4 border-indigo-500' : ''
                  }`}
                >
                  <div className={`mt-1 p-2 rounded-lg ${
                    log.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    <AlertCircle size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-200">{log.type}</span>
                      <span className="text-[10px] text-slate-500 font-mono tracking-tighter">{log.id}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono italic">{log.sourceIp} &bull; {log.path}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col h-full relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full"></div>
        
        {!selectedLog ? (
          <div className="flex flex-col items-center justify-center flex-1 text-slate-600 text-center">
            <BrainCircuit size={64} className="mb-4 opacity-5" />
            <p className="text-sm font-medium">Select an incident for server-side evaluation.</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Terminal size={24} className="text-indigo-500" /> Forensic Report
              </h3>
              <div className="flex gap-2">
                <button onClick={() => onFeedback(selectedLog.id, 'FALSE_POSITIVE')} className="p-2 bg-slate-800 rounded-lg hover:text-rose-400 transition-colors"><ThumbsDown size={18} /></button>
                <button onClick={() => onFeedback(selectedLog.id, 'CONFIRMED')} className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600/40 transition-colors"><ThumbsUp size={18} /></button>
              </div>
            </div>

            <section className="bg-indigo-900/10 border border-indigo-500/20 p-5 rounded-xl">
              <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <BrainCircuit size={14} /> Explainable Reasoning
              </h4>
              {loading ? (
                <div className="flex items-center gap-3 text-slate-500 text-sm italic">
                  <Loader2 size={18} className="animate-spin text-indigo-500" /> Processing threat vectors via Gemini...
                </div>
              ) : insight ? (
                <p className="text-sm leading-relaxed text-slate-300 italic">{insight.explanation}</p>
              ) : (
                <p className="text-sm text-slate-600 italic">Awaiting API resolution...</p>
              )}
            </section>

            {insight && (
              <div className="space-y-6">
                <section className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Automated Policy Injection</h4>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 whitespace-pre-wrap shadow-inner">{insight.suggestedRule}</div>
                  <div className="flex flex-wrap gap-2">
                    {insight.reasoningVector.map((v, i) => (
                      <span key={i} className="text-[9px] font-bold uppercase tracking-tighter bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">{v}</span>
                    ))}
                  </div>
                </section>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                  <CheckCircle2 size={18} /> Sync Policy with Edge Nodes
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomalyAnalysis;