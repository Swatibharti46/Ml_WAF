
import React, { useState } from 'react';
import { RecommendedRule } from '../types';
// Fix: Added missing Info and Terminal imports from lucide-react
import { 
  FileCode, 
  Trash2, 
  Play, 
  Pause, 
  ShieldCheck, 
  Plus, 
  Code2,
  ExternalLink,
  Info,
  Terminal
} from 'lucide-react';

const INITIAL_RULES: RecommendedRule[] = [
  {
    id: 'RULE-001',
    originalThreatId: 'TX-4452',
    name: 'SQL Injection Prevention (ML-Gen)',
    description: 'Automated rule preventing specific UNION SELECT pattern found in log TX-4452.',
    ruleContent: 'SecRule REQUEST_COOKIES|!REQUEST_COOKIES:/__utm/|REQUEST_COOKIES_NAMES|REQUEST_HEADERS:User-Agent|REQUEST_HEADERS:Referer|ARGS_NAMES|ARGS|XML:/* "@detectSQLi" "id:10001,phase:2,block,t:none,t:utf8toUnicode,t:urlDecodeUni,t:removeNulls,t:removeWhitespace,msg:\'SQL Injection Attempt\'"',
    status: 'DEPLOYED'
  },
  {
    id: 'RULE-002',
    originalThreatId: 'TX-4458',
    name: 'XSS Filter (Baseline Deviation)',
    description: 'Blocked script tags in query parameters that deviated from standard JSON pattern.',
    ruleContent: 'SecRule ARGS "@rx <script" "id:10002,phase:2,deny,status:403"',
    status: 'APPROVED'
  }
];

const RuleManager: React.FC = () => {
  const [rules, setRules] = useState<RecommendedRule[]>(INITIAL_RULES);

  const toggleStatus = (id: string) => {
    setRules(rules.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === 'DEPLOYED' ? 'PENDING' : 'DEPLOYED';
        return { ...r, status: nextStatus };
      }
      return r;
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">WAF Rule Orchestration</h2>
          <p className="text-slate-400 text-sm">Convert ML insights into actionable security policies.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all">
          <Plus size={18} /> Create Manual Rule
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${rule.status === 'DEPLOYED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  <FileCode size={20} />
                </div>
                <div>
                  <h4 className="font-bold flex items-center gap-2">
                    {rule.name}
                    {rule.status === 'DEPLOYED' && <ShieldCheck size={14} className="text-emerald-500" />}
                  </h4>
                  <p className="text-xs text-slate-500">Target Incident: {rule.originalThreatId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleStatus(rule.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    rule.status === 'DEPLOYED' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {rule.status === 'DEPLOYED' ? <Pause size={14} /> : <Play size={14} />}
                  {rule.status === 'DEPLOYED' ? 'Disable' : 'Deploy'}
                </button>
                <button className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Info size={14} /> Policy Description
                </h5>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {rule.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-indigo-400">
                  <Code2 size={14} />
                  <span>Integrated with ModSecurity Core Rule Set</span>
                  <ExternalLink size={12} />
                </div>
              </div>
              
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Terminal size={14} /> Rule Syntax
                </h5>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-400 break-all leading-relaxed">
                  {rule.ruleContent}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RuleManager;
