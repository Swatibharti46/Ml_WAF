
import React, { useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  LineChart, Line
} from 'recharts';
import { TrafficLog, TrafficType } from '../types';
import { Info, Target, Zap, Clock } from 'lucide-react';

const Baselining: React.FC<{ logs: TrafficLog[] }> = ({ logs }) => {
  const legitLogs = useMemo(() => logs.filter(l => l.type === TrafficType.LEGITIMATE), [logs]);
  
  const radarData = useMemo(() => [
    { subject: 'GET', A: legitLogs.filter(l => l.method === 'GET').length, fullMark: 100 },
    { subject: 'POST', A: legitLogs.filter(l => l.method === 'POST').length, fullMark: 100 },
    { subject: 'PUT', A: legitLogs.filter(l => l.method === 'PUT').length, fullMark: 100 },
    { subject: 'DELETE', A: legitLogs.filter(l => l.method === 'DELETE').length, fullMark: 100 },
    { subject: 'API', A: legitLogs.filter(l => l.path.includes('/api')).length, fullMark: 100 },
    { subject: 'Static', A: legitLogs.filter(l => !l.path.includes('/api')).length, fullMark: 100 },
  ], [legitLogs]);

  const pathDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    legitLogs.forEach(l => {
      counts[l.path] = (counts[l.path] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5);
  }, [legitLogs]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Behavioral Baselining</h2>
          <p className="text-slate-400 text-sm">Real-time mapping of "Normal" traffic profiles using Continuous Learning.</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
            <Target size={14} /> Training Stable
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Behavioral Profile */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={18} className="text-indigo-400" />
            <h3 className="font-semibold text-lg">Method/Modality Profile</h3>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                <Radar
                  name="Baseline"
                  dataKey="A"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Path Frequency */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-lg">Learned Path Frequency</h3>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pathDistribution} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} width={100} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info size={18} className="text-slate-400" />
          <h3 className="font-semibold text-lg">Baselining Methodology</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-400">
          <p>The module calculates <span className="text-indigo-400 font-bold">Standard Deviation</span> of request payloads and timing to identify outliers in real-time.</p>
          <p>Heuristic analysis of <span className="text-indigo-400 font-bold">User-Agent</span> distributions prevents bot-driven baseline shifts.</p>
          <p>TLS-Termination allows inspection of encrypted payloads for <span className="text-indigo-400 font-bold">Zero-Day</span> pattern extraction via Gemini ML engine.</p>
        </div>
      </div>
    </div>
  );
};

export default Baselining;
