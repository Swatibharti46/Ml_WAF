import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Shield, Activity, AlertTriangle, Settings, FileCode, BarChart3,
  Search, Zap, Cpu, Terminal, Layers, Wifi, WifiOff, RefreshCw, Database
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import TrafficMonitor from './components/TrafficMonitor';
import AnomalyAnalysis from './components/AnomalyAnalysis';
import RuleManager from './components/RuleManager';
import Baselining from './components/Baselining';
import WafIntegration from './components/WafIntegration';
import MetricsPanel from './components/MetricsPanel';
import { TrafficLog } from './types';
import { generateTraffic } from './services/trafficSimulator';

const App: React.FC = () => {
  const [logs, setLogs] = useState<TrafficLog[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [syncMode, setSyncMode] = useState<'server' | 'simulation'>('server');
  const [apiStatus, setApiStatus] = useState<'connected' | 'error' | 'connecting'>('connecting');
  
  // Keep logs state in a ref for the simulator to append correctly
  const logsRef = useRef<TrafficLog[]>([]);

  const fetchLogs = useCallback(async () => {
    try {
      // Try fetching from Express API first
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        const sortedData = (data as TrafficLog[]).sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setLogs(sortedData);
        logsRef.current = sortedData;
        setSyncMode('server');
        setApiStatus('connected');
        setLastSync(new Date());
      } else {
        throw new Error("API responded with error");
      }
    } catch (err) {
      // Fallback: Local Simulation if Server is unreachable
      setApiStatus('error');
      if (syncMode === 'server') {
        setSyncMode('simulation');
        console.warn("Backend API unreachable. Falling back to local simulation engine.");
      }
      
      const newPacket = generateTraffic();
      const updatedLogs = [newPacket, ...logsRef.current].slice(0, 50);
      setLogs(updatedLogs);
      logsRef.current = updatedLogs;
      setLastSync(new Date());
    }
  }, [syncMode]);

  useEffect(() => {
    // Initial fetch
    fetchLogs();
    
    let interval: any;
    if (isLive) {
      interval = setInterval(fetchLogs, 3000);
    }
    return () => clearInterval(interval);
  }, [isLive, fetchLogs]);

  const updateLogFeedback = async (id: string, feedback: 'CONFIRMED' | 'FALSE_POSITIVE') => {
    if (syncMode === 'server') {
      try {
        await fetch(`/api/logs/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback })
        });
      } catch (err) {
        console.error("Failed to send feedback to server", err);
      }
    }
    
    // Always update local state for immediate UI feedback
    setLogs(prev => prev.map(l => l.id === id ? { ...l, feedback } : l));
  };

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(log => 
      log.sourceIp.toLowerCase().includes(q) ||
      log.path.toLowerCase().includes(q) ||
      (log.payload && log.payload.toLowerCase().includes(q)) ||
      log.id.toLowerCase().includes(q)
    );
  }, [logs, searchQuery]);

  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0 relative overflow-hidden">
          <div className="scanner-line absolute w-full top-0 left-0 z-0"></div>
          
          <div className="p-6 flex items-center gap-3 border-b border-slate-800 relative z-10">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">Sentinel</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">ML-WAF Core</p>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto relative z-10">
            <SidebarLink to="/" icon={<BarChart3 size={20} />} label="Overview" />
            <SidebarLink to="/traffic" icon={<Activity size={20} />} label="Live Traffic" />
            <SidebarLink to="/anomalies" icon={<AlertTriangle size={20} />} label="Threat Analysis" />
            <SidebarLink to="/baselining" icon={<Cpu size={20} />} label="Behavior Profile" />
            <SidebarLink to="/metrics" icon={<Layers size={20} />} label="Performance" />
            <SidebarLink to="/rules" icon={<FileCode size={20} />} label="Security Rules" />
            <SidebarLink to="/integration" icon={<Terminal size={20} />} label="API Integration" />
          </nav>

          <div className="p-4 border-t border-slate-800 relative z-10">
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Engine Status</span>
                {syncMode === 'server' ? (
                  <Wifi size={12} className="text-emerald-500" />
                ) : (
                  <Database size={12} className="text-amber-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${syncMode === 'server' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></span>
                <span className="text-xs font-semibold text-slate-300">
                  {syncMode === 'server' ? 'Live Server Sync' : 'Local Simulation'}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-700/50 flex flex-col gap-1">
                <p className="text-[9px] text-slate-500 font-mono italic">
                  {syncMode === 'server' ? 'Connected to :3001' : 'Backend offline: Mocking API'}
                </p>
                <p className="text-[9px] text-slate-500 font-mono">Sync: {lastSync.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
          <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/10 backdrop-blur-xl z-20">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-md w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Intercept data patterns..." 
                  className="w-full bg-slate-800/30 border border-slate-700/50 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-500">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"></span>
                {syncMode === 'server' ? 'High Precision Engine' : 'Local Baseline Model'}
              </div>
              <button 
                onClick={() => setIsLive(!isLive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  isLive ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800/80 text-slate-400 border border-slate-700'
                }`}
              >
                <Zap size={16} className={isLive ? 'animate-pulse text-indigo-400' : ''} />
                {isLive ? 'Live Inspection' : 'Inspection Paused'}
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
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

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        isActive 
          ? 'bg-indigo-600/15 text-indigo-400 shadow-sm border border-indigo-500/10' 
          : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'
      }`}
    >
      <span className={`${isActive ? 'text-indigo-500' : 'group-hover:text-indigo-400'}`}>
        {icon}
      </span>
      <span className="text-sm font-semibold">{label}</span>
      {isActive && <div className="ml-auto w-1 h-4 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]"></div>}
    </Link>
  );
};

export default App;