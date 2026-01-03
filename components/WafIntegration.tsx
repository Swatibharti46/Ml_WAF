
import React from 'react';
import { Terminal, Copy, ExternalLink, Shield } from 'lucide-react';

const WafIntegration: React.FC = () => {
  const sampleJson = `{
  "sentinel_analysis": {
    "threat_id": "TX-4452",
    "classification": "SQL_INJECTION",
    "ml_confidence": 0.985,
    "source": "192.168.1.45",
    "action": "BLOCK",
    "recommended_waf_rule": "SecRule ARGS '@detectSQLi' 'id:1001,phase:2,deny,status:403'"
  }
}`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-2xl font-bold mb-1">WAF API Integration</h2>
        <p className="text-slate-400 text-sm">Synchronize Machine Learning insights with your existing security infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
            <Terminal size={18} className="text-indigo-400" /> Webhook Output Schema
          </h3>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative group">
            <button className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
              <Copy size={16} />
            </button>
            <pre className="text-xs font-mono text-indigo-300 overflow-x-auto leading-relaxed">
              {sampleJson}
            </pre>
          </div>
          <p className="mt-4 text-xs text-slate-500 italic">
            * This JSON payload is triggered on every 'HIGH' severity detection and can be consumed by ModSecurity via Lua scripts or custom WAF filters.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
             <h3 className="font-semibold text-lg mb-4">Supported Integrations</h3>
             <ul className="space-y-3">
               <li className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/50">
                 <div className="flex items-center gap-3">
                    <Shield size={16} className="text-emerald-400" />
                    <span className="text-sm font-medium">ModSecurity CRS v3</span>
                 </div>
                 <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">Ready</span>
               </li>
               <li className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/50">
                 <div className="flex items-center gap-3">
                    <Shield size={16} className="text-indigo-400" />
                    <span className="text-sm font-medium">AWS WAF v2 (Custom JSON)</span>
                 </div>
                 <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-bold uppercase">Ready</span>
               </li>
               <li className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/50 opacity-50">
                 <div className="flex items-center gap-3">
                    <Shield size={16} className="text-slate-500" />
                    <span className="text-sm font-medium">Cloudflare Workers WAF</span>
                 </div>
                 <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded font-bold uppercase">Beta</span>
               </li>
             </ul>
          </div>

          <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-600/20">
             <h3 className="font-bold mb-2">Automated Policy Sync</h3>
             <p className="text-sm opacity-90 mb-4">Enable "Auto-Push" to deploy approved rules directly to your production cluster via REST API.</p>
             <button className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors">
               Setup API Key <ExternalLink size={14} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WafIntegration;
