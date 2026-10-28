import React, { useState } from 'react';
import {
  History,
  X,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Download,
  Trash2,
  Calendar,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { FoodAnalysisResult } from '../types/food';
import { clearScansHistory } from '../services/api';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  scans: FoodAnalysisResult[];
  onSelectScan: (scan: FoodAnalysisResult) => void;
  onRefreshHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  scans,
  onSelectScan,
  onRefreshHistory,
}) => {
  const [filter, setFilter] = useState<'all' | 'safe' | 'hazard'>('all');

  if (!isOpen) return null;

  const filteredScans = scans.filter((s) => {
    if (filter === 'safe') return s.isSafe;
    if (filter === 'hazard') return !s.isSafe;
    return true;
  });

  const handleClear = () => {
    if (confirm('Clear all local encrypted scan logs?')) {
      clearScansHistory();
      onRefreshHistory();
    }
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scans, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nutriguard_health_records_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Analysis Records</h3>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono mt-0.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>AES-256 Encrypted Vault</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters and Actions Bar */}
        <div className="p-3 border-b border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({scans.length})
            </button>
            <button
              onClick={() => setFilter('safe')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                filter === 'safe' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Safe
            </button>
            <button
              onClick={() => setFilter('hazard')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                filter === 'hazard' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Toxins
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExport}
              title="Export records to JSON"
              disabled={scans.length === 0}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 disabled:opacity-40 transition"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClear}
              title="Clear vault history"
              disabled={scans.length === 0}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-400 disabled:opacity-40 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scan List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs">
          {filteredScans.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <History className="w-10 h-10 mb-2 opacity-40" />
              <p className="font-semibold text-slate-300">No records found</p>
              <p className="text-[11px] mt-1">Execute a food scan to record analytical results.</p>
            </div>
          ) : (
            filteredScans.map((scan) => (
              <div
                key={scan.id}
                onClick={() => {
                  onSelectScan(scan);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-950 transition cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      scan.isSafe
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}
                  >
                    {scan.isSafe ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (
                      <ShieldAlert className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-100 truncate text-xs">{scan.foodName}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-mono">
                        {scan.scannedAt ? new Date(scan.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 text-amber-400 font-mono">
                        <Flame className="w-3 h-3" />
                        {scan.nutritionalAnalysis?.calories || 0} kcal
                      </span>
                    </div>

                    {!scan.isSafe && (
                      <p className="text-[10px] text-rose-400 font-semibold mt-1 truncate">
                        Hazard: {scan.poisonAnalysis?.poisonName || 'Toxin Detected'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm font-black tabular-nums font-mono ${
                        scan.safetyScore > 70 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {scan.safetyScore}%
                    </span>
                    <p className="text-[9px] text-slate-500 uppercase">Score</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
