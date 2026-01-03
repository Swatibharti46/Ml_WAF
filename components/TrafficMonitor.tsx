
import React, { useState } from 'react';
import { TrafficLog, TrafficType } from '../types';
import { ChevronRight, Filter, Download } from 'lucide-react';

interface TrafficMonitorProps {
  logs: TrafficLog[];
}

const TrafficMonitor: React.FC<TrafficMonitorProps> = ({ logs }) => {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredLogs = logs.filter(l => {
    if (filter === 'ALL') return true;
    if (filter === 'ANOMALOUS') return l.type !== TrafficType.LEGITIMATE;
    return l.type === TrafficType.LEGITIMATE;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Network Traffic Log</h2>
          <p className="text-slate-400 text-sm">Inspecting inbound/outbound packets in real-time.</p>
        </div>
        <div className="flex gap-3">
          <select 
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Traffic</option>
            <option value="LEGITIMATE">Legitimate Only</option>
            <option value="ANOMALOUS">Anomalies Only</option>
          </select>
          <button className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm hover:bg-slate-700 transition-colors">
            <Download size={16} /> Export Logs
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-800/50">
          <div className="col-span-1">Method</div>
          <div className="col-span-3">Source IP</div>
          <div className="col-span-4">Path</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-center">Score</div>
          <div className="col-span-1 text-right">Time</div>
          <div className="col-span-1"></div>
        </div>
        <div className="divide-y divide-slate-800 max-h-[70vh] overflow-y-auto">
          {filteredLogs.map((log) => (
            <div key={log.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-800/30 transition-colors group">
              <div className="col-span-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  log.method === 'GET' ? 'bg-indigo-500/10 text-indigo-400' :
                  log.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-amber-500/10 text-amber-400'
                }`}>
                  {log.method}
                </span>
              </div>
              <div className="col-span-3 font-mono text-xs">{log.sourceIp}</div>
              <div className="col-span-4 truncate text-sm text-slate-300">{log.path}</div>
              <div className="col-span-1 text-center">
                <span className={`text-xs ${log.status >= 400 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {log.status}
                </span>
              </div>
              <div className="col-span-1 text-center">
                <span className={`text-xs font-bold ${log.score > 0.7 ? 'text-rose-500' : log.score > 0.4 ? 'text-amber-500' : 'text-slate-500'}`}>
                  {(log.score * 100).toFixed(0)}%
                </span>
              </div>
              <div className="col-span-1 text-right text-xs text-slate-500 font-mono">
                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
              </div>
              <div className="col-span-1 text-right">
                <button className="p-1 hover:bg-slate-700 rounded text-slate-500 group-hover:text-indigo-400 transition-all">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrafficMonitor;
