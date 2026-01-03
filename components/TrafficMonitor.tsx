
import React, { useState, useRef } from 'react';
import { TrafficLog, TrafficType } from '../types';
import { ChevronRight, Filter, Download, Upload, FileJson } from 'lucide-react';
import { parseUploadedLogs } from '../services/dataIngestionService';

interface TrafficMonitorProps {
  logs: TrafficLog[];
  onImport: (logs: TrafficLog[]) => void;
}

const TrafficMonitor: React.FC<TrafficMonitorProps> = ({ logs, onImport }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredLogs = logs.filter(l => {
    if (filter === 'ALL') return true;
    if (filter === 'ANOMALOUS') return l.type !== TrafficType.LEGITIMATE;
    return l.type === TrafficType.LEGITIMATE;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseUploadedLogs(content);
        onImport(parsed);
      } catch (err) {
        alert('Failed to parse logs: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Inbound Traffic Streams</h2>
          <p className="text-slate-400 text-sm">Deep Packet Inspection (DPI) and ML classification.</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".json"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-lg px-4 py-2 text-sm hover:bg-indigo-600/20 transition-colors"
          >
            <Upload size={16} /> Import Real Logs
          </button>
          <select 
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Flows</option>
            <option value="LEGITIMATE">Clean Traffic</option>
            <option value="ANOMALOUS">Threats Only</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-800/50">
          <div className="col-span-1">Method</div>
          <div className="col-span-3">Source Identifier</div>
          <div className="col-span-4">Resource Path</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-center">ML Confidence</div>
          <div className="col-span-1 text-right">Age</div>
          <div className="col-span-1"></div>
        </div>
        <div className="divide-y divide-slate-800 max-h-[70vh] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-600">
               <FileJson size={48} className="mx-auto mb-4 opacity-20" />
               <p>No traffic data available in the current buffer.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-800/30 transition-colors group">
                <div className="col-span-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    log.method === 'GET' ? 'bg-blue-500/10 text-blue-400' :
                    log.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>
                    {log.method}
                  </span>
                </div>
                <div className="col-span-3 font-mono text-xs text-slate-300">{log.sourceIp}</div>
                <div className="col-span-4 truncate text-sm text-slate-400 font-mono">{log.path}</div>
                <div className="col-span-1 text-center">
                  <span className={`text-xs font-bold ${log.status >= 400 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {log.status}
                  </span>
                </div>
                <div className="col-span-1 text-center">
                  <div className="flex flex-col items-center">
                    <span className={`text-xs font-bold ${log.score > 0.8 ? 'text-rose-500' : log.score > 0.4 ? 'text-amber-500' : 'text-slate-500'}`}>
                      {(log.score * 100).toFixed(1)}%
                    </span>
                    <div className="w-12 h-0.5 bg-slate-800 rounded-full mt-1">
                      <div className={`h-full rounded-full ${log.score > 0.8 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{width: `${log.score * 100}%`}}></div>
                    </div>
                  </div>
                </div>
                <div className="col-span-1 text-right text-xs text-slate-500 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, second: '2-digit' }).split(' ')[0]}
                </div>
                <div className="col-span-1 text-right">
                  <button className="p-1 hover:bg-indigo-500/10 rounded text-slate-600 group-hover:text-indigo-400 transition-all">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TrafficMonitor;
