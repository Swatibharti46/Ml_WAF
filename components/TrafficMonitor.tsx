import React, { useState, useEffect } from 'react';
import { TrafficLog, TrafficType } from '../types';
// Added missing Activity icon import to resolve name reference error on line 34
import { Activity, ChevronRight, Filter, Download, ShieldCheck, ShieldAlert, Zap } from 'lucide-react';

interface TrafficMonitorProps {
  logs: TrafficLog[];
}

const TrafficMonitor: React.FC<TrafficMonitorProps> = ({ logs }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Briefly highlight the newest log entry
  useEffect(() => {
    if (logs.length > 0) {
      const newestId = logs[0].id;
      setHighlightedId(newestId);
      const timer = setTimeout(() => setHighlightedId(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [logs[0]?.id]);

  const filteredLogs = logs.filter(l => {
    if (filter === 'ALL') return true;
    if (filter === 'ANOMALOUS') return l.type !== 'LEGITIMATE';
    return l.type === 'LEGITIMATE';
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <Activity className="text-indigo-500" size={24} />
            Network Traffic Stream
          </h2>
          <p className="text-slate-400 text-sm">Real-time inspection of inbound and outbound packet clusters.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
             <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
             <select 
              className="bg-slate-900 border border-slate-700/50 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all appearance-none cursor-pointer"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">All Segments</option>
              <option value="LEGITIMATE">Safe Only</option>
              <option value="ANOMALOUS">Threats Only</option>
            </select>
          </div>
          <button className="flex items-center gap-2 bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-2 text-sm font-semibold hover:bg-slate-800 transition-colors">
            <Download size={16} className="text-slate-400" /> PCAP Export
          </button>
        </div>
      </div>

      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="grid grid-cols-12 gap-4 px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] bg-slate-900/50 border-b border-slate-800">
          <div className="col-span-1">Method</div>
          <div className="col-span-2">Source IP</div>
          <div className="col-span-1 text-center">Protocol</div>
          <div className="col-span-4">Payload Hint</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-center">Score</div>
          <div className="col-span-1 text-right">Time</div>
          <div className="col-span-1"></div>
        </div>
        
        <div className="divide-y divide-slate-800/50 max-h-[65vh] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-600 italic">No packet data matches the current filters.</div>
          ) : (
            filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className={`grid grid-cols-12 gap-4 px-8 py-4 items-center hover:bg-slate-800/40 transition-all group relative ${
                  highlightedId === log.id ? 'bg-indigo-600/10' : ''
                }`}
              >
                {highlightedId === log.id && (
                  <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div>
                )}
                
                <div className="col-span-1">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                    log.method === 'GET' ? 'bg-blue-500/10 text-blue-400' :
                    log.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>
                    {log.method}
                  </span>
                </div>
                <div className="col-span-2 font-mono text-xs text-slate-400 tracking-tight">{log.sourceIp}</div>
                <div className="col-span-1 text-center">
                  <span className="text-[10px] text-slate-600 font-bold uppercase">HTTPS</span>
                </div>
                <div className="col-span-4 flex items-center gap-3">
                   <div className="truncate text-xs text-slate-300 font-mono italic max-w-full">
                    {log.payload}
                   </div>
                </div>
                <div className="col-span-1 text-center">
                  <span className={`text-xs font-bold ${log.status >= 400 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {log.status}
                  </span>
                </div>
                <div className="col-span-1 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700 overflow-hidden relative">
                      <div 
                        className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ${
                          log.score > 0.7 ? 'bg-rose-500' : log.score > 0.4 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} 
                        style={{ height: `${log.score * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-[11px] font-mono font-bold ${
                      log.score > 0.7 ? 'text-rose-500' : log.score > 0.4 ? 'text-amber-500' : 'text-slate-400'
                    }`}>
                      {(log.score * 100).toFixed(0)}
                    </span>
                  </div>
                </div>
                <div className="col-span-1 text-right text-[10px] text-slate-500 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="col-span-1 text-right">
                  <button className="p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-600 group-hover:text-indigo-400 transition-all transform group-hover:translate-x-1">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="px-8 py-3 bg-slate-900/50 border-t border-slate-800/50 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>Legitimate: {logs.filter(l => l.type === 'LEGITIMATE').length}</span>
             </div>
             <div className="flex items-center gap-1.5">
                <ShieldAlert size={12} className="text-rose-500" />
                <span>Anomalies: {logs.filter(l => l.type !== 'LEGITIMATE').length}</span>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={10} className="text-amber-500 animate-pulse" />
            Monitoring Buffer: {logs.length}/50 Packets
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficMonitor;