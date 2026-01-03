
import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';
import { TrafficLog, TrafficType, ThreatSeverity } from '../types';
import { 
  TrendingUp, 
  ShieldAlert, 
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Unlock
} from 'lucide-react';

interface DashboardProps {
  logs: TrafficLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ logs }) => {
  const stats = useMemo(() => {
    const total = logs.length;
    const anomalies = logs.filter(l => l.type !== TrafficType.LEGITIMATE).length;
    const critical = logs.filter(l => l.severity === ThreatSeverity.CRITICAL).length;
    const avgResponse = total ? Math.round(logs.reduce((acc, l) => acc + l.responseTime, 0) / total) : 0;
    
    return { total, anomalies, critical, avgResponse };
  }, [logs]);

  const chartData = useMemo(() => {
    return logs.slice(0, 30).reverse().map(l => ({
      time: l.timestamp.split('T')[1].split('.')[0],
      latency: l.responseTime,
      score: Math.round(l.score * 100)
    }));
  }, [logs]);

  const typeData = useMemo(() => {
    const counts = logs.reduce((acc, l) => {
      acc[l.type] = (acc[l.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [logs]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Network Throughput" 
          value="4.8k req/s" 
          subValue="Real-time Inspection" 
          icon={<TrendingUp size={20} className="text-indigo-400" />}
          trend="up"
        />
        <StatCard 
          label="Active Threats" 
          value={stats.anomalies.toString()} 
          subValue="Detection Latency < 15ms" 
          icon={<ShieldAlert size={20} className="text-rose-400" />}
          trend="down"
        />
        <StatCard 
          label="Zero-Day Mitigation" 
          value="Active" 
          subValue="Behavioral Analysis" 
          icon={<AlertTriangle size={20} className="text-amber-400" />}
          trend="neutral"
        />
        <StatCard 
          label="Avg Response" 
          value={`${stats.avgResponse}ms`} 
          subValue="Low Overhead Performance" 
          icon={<Clock size={20} className="text-emerald-400" />}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold text-lg">Live ML Signal Strength</h3>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Latency</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> ML Score</div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="latency" stroke="#6366f1" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} />
                <Area type="monotone" dataKey="score" stroke="#10b981" fillOpacity={0.1} fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-8">Attack Vector Mix</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} layout="vertical" margin={{ left: -10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'LEGITIMATE' ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-lg">Inbound Decrypted Traffic (TLS Termination)</h3>
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
            <Unlock size={12} /> Inspection Active
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-slate-400 font-medium bg-slate-800/20">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Source IP</th>
                <th className="px-6 py-4">Payload (Decrypted)</th>
                <th className="px-6 py-4">Inspection Latency</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.slice(0, 5).map(log => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    {log.type === TrafficType.LEGITIMATE ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                        <Lock size={12} className="opacity-50" /> Safe
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-rose-500 text-xs font-bold">
                        <Unlock size={12} /> {log.type}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-300">{log.sourceIp}</td>
                  <td className="px-6 py-4 text-slate-400 truncate max-w-[200px] font-mono text-xs">
                    {log.payload || 'GET / HTTP/1.1'}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{log.responseTime}ms</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ 
  label: string, 
  value: string, 
  subValue: string, 
  icon: React.ReactNode, 
  trend: 'up' | 'down' | 'neutral' 
}> = ({ label, value, subValue, icon, trend }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 transition-all hover:border-slate-700 group relative overflow-hidden">
    <div className="flex items-center justify-between mb-4">
      <div className="bg-slate-800 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      {trend !== 'neutral' && (
        <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
          trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
        }`}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend === 'up' ? 'OPT' : 'VOL'}
        </div>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-slate-400 text-sm font-medium">{label}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-2xl font-bold tracking-tight">{value}</h4>
        <span className="text-[10px] text-slate-500 font-semibold">{subValue}</span>
      </div>
    </div>
  </div>
);

export default Dashboard;
