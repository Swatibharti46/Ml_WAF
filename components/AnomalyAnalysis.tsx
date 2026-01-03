import React, { useState } from 'react';
import { TrafficLog, AnomalyInsight, TrafficType } from '../types';
import { analyzeAnomaly } from '../services/geminiService';
import { 
  Terminal, 
  BrainCircuit, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  ArrowRight,
  ShieldCheck,
  RefreshCcw,
  ThumbsUp,
  ThumbsDown,
  Loader2
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
      const result = await analyzeAnomaly(log);
      setInsight(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (type: 'CONFIRMED' | 'FALSE_POSITIVE') => {
    if (!selectedLog) return;
    onFeedback(selectedLog.id, type);
    // In a real app, this would be a toast notification
    console.log(`Feedback Received: ${type}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Left List */}
      <div className="space-y-6 flex flex-col h-full overflow-hidden">
        <div>
          <h2 className="text-2xl font-bold mb-1">Threat Intelligence</h2>
          <p className="text-slate-400 text-sm">Deep analysis of anomalies using Explainable AI.</p>
        </div>
        
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-y-auto min-h-[400px]">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
              <ShieldCheck size={48} className="mb-4 text-emerald-500/20" />
              <p>No critical anomalies detected.</p>
              <p className="text-xs">Your system is within normal parameters.</p>
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
                    log.type === TrafficType.ZERO_DAY ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    <AlertCircle size={20} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{log.type} Attempt</span>
                      {log.feedback && (
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                          log.feedback === 'CONFIRMED' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {log.feedback}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="font-mono text-indigo-400">{log.sourceIp}</span>
                      <span>&bull;</span>
                      <span className="truncate max-w-[150px]">{log.path}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Detail */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col h-full overflow-y-auto">
        {!selectedLog ? (
          <div className="flex flex-col items-center justify-center flex-1 text-slate-500 text-center space-y-4">
            <BrainCircuit size={64} className="text-slate-800 animate-pulse" />
            <div>
              <p className="font-medium text-slate-400">Explainable AI Interface</p>
              <p className="text-xs">Select an incident to view model reasoning.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Terminal size={24} className="text-indigo-500" /> Analysis Report
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">Incident ID: {selectedLog.id}</p>
              </div>
              <div className="flex gap-2">
                 <button 
                  onClick={() => handleFeedback('FALSE_POSITIVE')}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                  title="Mark as False Positive"
                >
                  <ThumbsDown size={18} />
                </button>
                <button 
                   onClick={() => handleFeedback('CONFIRMED')}
                  className="p-2 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-lg text-indigo-400 transition-colors"
                  title="Confirm Threat"
                >
                  <ThumbsUp size={18} />
                </button>
              </div>
            </div>

            <section className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                <BrainCircuit size={14} /> AI Reasoning (Explainability)
              </h4>
              <div className="bg-indigo-900/10 border border-indigo-500/20 p-5 rounded-xl min-h-[100px] flex flex-col justify-center">
                {loading ? (
                  <div className="flex items-center gap-3 text-indigo-400 text-sm font-medium">
                    <Loader2 size={18} className="animate-spin" />
                    Generative Engine is processing threat vectors...
                  </div>
                ) : insight ? (
                  <p className="text-sm leading-relaxed text-indigo-100 italic">
                    {insight.explanation}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">Awaiting analysis sequence...</p>
                )}
              </div>
            </section>

            {insight && (
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
                   Recommended Mitigation Rule
                </h4>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                    {insight.suggestedRule}
                  </pre>
                </div>
                <div className="flex flex-wrap gap-2 py-2">
                  {insight.reasoningVector.map((tag, i) => (
                    <span key={i} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> Approve & Sync with WAF
                </button>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomalyAnalysis;