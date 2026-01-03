
import React, { useState, useEffect, useCallback } from 'react';
// Use BrowserRouter instead of HashRouter for better compatibility in many web environments
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Settings, 
  FileCode, 
  BarChart3,
  Search,
  Zap,
  Cpu,
  Terminal,
  Layers,
  Globe
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import TrafficMonitor from './components/TrafficMonitor';
import AnomalyAnalysis from './components/AnomalyAnalysis';
import RuleManager from './components/RuleManager';
import Baselining from './components/Baselining';
import WafIntegration from './components/WafIntegration';
import MetricsPanel from './components/MetricsPanel';
import { TrafficLog } from './types';
import { fetchLiveLogs } from './services/dataIngestionService';

const App: React.FC = () => {
  const [logs, setLogs] = useState<TrafficLog[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [wafEndpoint, setWafEndpoint] = useState<string>(''); // User can set this for real data

  const ingestData = useCallback(async () => {
    const newLogs = await fetchLiveLogs(wafEndpoint);
    setLogs(prev => [...newLogs, ...prev].slice(0, 200));
  }, [wafEndpoint]);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(ingestData, wafEndpoint ? 5000 : 2500);
    return () => clearInterval(interval);
  }, [isLive, ingestData, wafEndpoint]);

  const handleManualImport = (importedLogs: TrafficLog[]) => {
    setLogs(prev => [...importedLogs, ...prev].slice(0, 500));
    alert(`${importedLogs.length} logs imported successfully.`);
  };

  const updateLogFeedback = (id: string, feedback: 'CONFIRMED' | 'FALSE_POSITIVE') => {
    setLogs(prev => prev.map(log => log.id === id ? { ...log, feedback } : log));
  };

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Sentinel</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">ML-WAF Core</p>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main</p>
            <NavLink to="/" icon={<BarChart3 size={20} />} label="Overview" />
            <NavLink to="/traffic" icon={<Activity size={20} />} label="Live Traffic" />
            
            <p className="px-4 py-2 mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Intelligence</p>
            <NavLink to="/anomalies" icon={<AlertTriangle size={20} />} label="Threat Analysis" />
            <NavLink to="/baselining" icon={<Cpu size={20} />} label="Behavior Profile" />
            <NavLink to="/metrics" icon={<Layers size={20} />} label="Score Components" />
            
            <p className="px-4 py-2 mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">WAF Control</p>
            <NavLink to="/rules" icon={<FileCode size={20} />} label="Security Rules" />
            <NavLink to="/integration" icon={<Terminal size={20} />} label="API Integration" />
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Source</span>
                <span className={`text-[10px] font-bold uppercase ${wafEndpoint ? 'text-emerald-400' : 'text-amber-400'}`}>
                   {wafEndpoint ? 'Live API' : 'Simulated'}
                </span>
              </div>
              <input 
                type="text" 
                placeholder="Log Endpoint URL..." 
                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={wafEndpoint}
                onChange={(e) => setWafEndpoint(e.target.value)}
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/20 backdrop-blur-md z-10 shrink-0">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-md w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search live packets..." 
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 mr-4">
                <Globe size={14} />
                <span>Cloud Instance: sentinel-node-01</span>
              </div>
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

          <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
            <Routes>
              <Route path="/" element={<Dashboard logs={logs} />} />
              <Route path="/traffic" element={<TrafficMonitor logs={logs} onImport={handleManualImport} />} />
              <Route path="/anomalies" element={<AnomalyAnalysis logs={logs.filter(l => l.type !== 'LEGITIMATE')} onFeedback={updateLogFeedback} />} />
              <Route path="/baselining" element={<Baselining logs={logs} />} />
              <Route path="/metrics" element={<MetricsPanel />} />
              <Route path="/rules" element={<RuleManager />} />
              <Route path="/integration" element={<WafIntegration />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
};

const NavLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-indigo-400 rounded-xl transition-all group">
    <span className="transition-colors group-hover:scale-110">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

export default App;
