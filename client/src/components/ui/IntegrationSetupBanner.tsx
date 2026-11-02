import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { SystemStatusResponse } from '@roleforge/shared';
import { CheckCircle2, AlertTriangle, Sparkles, Database, X } from 'lucide-react';

export const IntegrationSetupBanner: React.FC = () => {
  const [status, setStatus] = useState<SystemStatusResponse | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get<SystemStatusResponse>('/system/status');
        setStatus(res.data);
      } catch (e) {
        console.error('Failed to load system integration status', e);
      }
    };
    fetchStatus();
  }, []);

  if (isDismissed || !status) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 border-b border-indigo-100/60 px-4 py-2.5 text-xs text-slate-700">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>Database:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {status.database.provider}
            </span>
          </div>

          <div className="hidden sm:inline-block text-slate-300">|</div>

          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Intelligence Engine:</span>
            {status.ai.configured ? (
              <span className="font-semibold text-emerald-700">{status.ai.model}</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-600">
                <span className="font-semibold text-indigo-900">Semantic Heuristic Engine</span> (Zero external API keys required)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!status.ai.configured && (
            <span className="hidden md:inline-block text-[11px] text-slate-500">
              Optional: set <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[10px]">GEMINI_API_KEY</code> in server/.env for cloud LLM
            </span>
          )}
          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

