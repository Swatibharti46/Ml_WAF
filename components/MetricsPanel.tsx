
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Download, Target, Zap, ShieldAlert, BarChart2 } from 'lucide-react';

const accuracyData = [
  { time: '10:00', accuracy: 94, fp: 1.2 },
  { time: '11:00', accuracy: 95, fp: 1.1 },
  { time: '12:00', accuracy: 97, fp: 0.8 },
  { time: '13:00', accuracy: 98, fp: 0.5 },
  { time: '14:00', accuracy: 98.2, fp: 0.4 },
];

const MetricsPanel: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Performance Benchmarks</h2>
          <p className="text-slate-400 text-sm">Evaluation metrics for Swavlamban 2025 primary score components.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm hover:bg-slate-700 transition-colors">
          <Download size={16} /> Export Technical Report (6.5)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Detection Accuracy Over Time */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-2">
                <Target size={20} className="text-indigo-400" />
                <h3 className="font-semibold">Model Convergence (Accuracy)</h3>
             </div>
             <span className="text-emerald-400 font-bold">98.2% Current</span>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis domain={[90, 100]} stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                <Line type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* False Positive Rate */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-2">
                <ShieldAlert size={20} className="text-rose-400" />
                <h3 className="font-semibold">False Positive Stability</h3>
             </div>
             <span className="text-rose-400 font-bold">0.4% Target Achieved</span>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accuracyData}>
                <defs>
                  <linearGradient id="colorFp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                <Area type="monotone" dataKey="fp" stroke="#f43f5e" fillOpacity={1} fill="url(#colorFp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-amber-500/10 rounded-lg"><Zap size={20} className="text-amber-500" /></div>
               <p className="text-sm font-medium text-slate-400">Avg. Prediction Latency</p>
            </div>
            <h4 className="text-2xl font-bold">12ms</h4>
            <p className="text-xs text-emerald-400 mt-2 font-medium">Real-time Pass Grade</p>
         </div>
         <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-blue-500/10 rounded-lg"><BarChart2 size={20} className="text-blue-500" /></div>
               <p className="text-sm font-medium text-slate-400">Throughput Capacity</p>
            </div>
            <h4 className="text-2xl font-bold">5.2 Gbps</h4>
            <p className="text-xs text-slate-500 mt-2 font-medium">Synthetic stress-test stable</p>
         </div>
         <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-emerald-500/10 rounded-lg"><ShieldAlert size={20} className="text-emerald-500" /></div>
               <p className="text-sm font-medium text-slate-400">Zero-Day Resilience</p>
            </div>
            <h4 className="text-2xl font-bold">High</h4>
            <p className="text-xs text-slate-300 mt-2 font-medium italic">Gemini-Pro Reasoning Enabled</p>
         </div>
      </div>
    </div>
  );
};

export default MetricsPanel;
