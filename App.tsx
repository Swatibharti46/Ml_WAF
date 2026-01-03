import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { 
  Shield, Activity, AlertTriangle, Settings, FileCode, BarChart3,
  Search, Zap, Cpu, Terminal, Layers
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import TrafficMonitor from './components/TrafficMonitor';
import AnomalyAnalysis from './components/AnomalyAnalysis';
import RuleManager from './components/RuleManager';
import Baselining from './components/Baselining';
import WafIntegration from './components/WafIntegration';
import MetricsPanel from './components/MetricsPanel';
import { TrafficLog } from './types';

const App: React.FC = () => {
  const [logs, setLogs] = useState<TrafficLog[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Log fetch error:", err);
    }
  };

  useEffect(() => {
    if (!isLive) return;
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [isLive]);

  const updateLogFeedback = async (id: string, feedback: 'CONFIRMED' | 'FALSE_POSITIVE') => {
    try {
      await fetch(`/api/logs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });
      fetchLogs();
    } catch (err) {
      console.error("Feedback update error:", err);
    }
  };

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(log => 
      log.sourceIp.toLowerCase().includes(q) ||
      log.path.toLowerCase().includes(q) ||
      (log.payload && log.payload.toLowerCase().includes(q))
    );
  }, [logs, searchQuery]);

  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
        <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Sentinel</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Node WAF Core</p>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <NavLink to="/" icon={<BarChart3 size={20} />} label="Overview" />
            <NavLink to="/traffic" icon={<Activity size={20} />} label="Live Traffic" />
            <NavLink to="/anomalies" icon={<AlertTriangle size={20} />} label="Threat Analysis" />
            <NavLink to="/baselining" icon={<Cpu size={20} />} label="Behavior Profile" />
            <NavLink to="/metrics" icon={<Layers size={20} />} label="Performance" />
            <NavLink to="/rules" icon={<FileCode size={20} />} label="Security Rules" />
            <NavLink to="/integration" icon={<Terminal size={20} />} label="API Integration" />
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">System Status</span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-medium text-slate-300 italic">API Live</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/20 backdrop-blur-md z-10">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-md w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Query live buffer..." 
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsLive(!isLive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isLive ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                <Zap size={16} className={isLive ? 'animate-pulse' : ''} />
                {isLive ? 'Monitoring' : 'Paused'}
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            <Routes>
              <Route path="/" element={<Dashboard logs={logs} />} />
              <Route path="/traffic" element={<TrafficMonitor logs={filteredLogs} />} />
              <Route path="/anomalies" element={<AnomalyAnalysis logs={filteredLogs.filter(l => l.type !== 'LEGITIMATE')} onFeedback={updateLogFeedback} />} />
              <Route path="/baselining" element={<Baselining logs={logs} />} />
              <Route path="/metrics" element={<MetricsPanel />} />
              <Route path="/rules" element={<RuleManager />} />
              <Route path="/integration" element={<WafIntegration />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

const NavLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-indigo-400 rounded-xl transition-all">
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

export default App;