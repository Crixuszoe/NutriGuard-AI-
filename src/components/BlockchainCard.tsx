import React, { useState } from 'react';
import { Link2, ShieldCheck, Check, Copy, ExternalLink, Award } from 'lucide-react';
import { BlockchainTraceability } from '../types/food';

interface BlockchainCardProps {
  traceability?: BlockchainTraceability;
}

export const BlockchainCard: React.FC<BlockchainCardProps> = ({ traceability }) => {
  if (!traceability) return null;

  const {
    batchId,
    originFarm,
    harvestDate,
    inspectionCertificateId,
    immutableLedgerHash,
    certifications,
    tamperEvidentStatus,
  } = traceability;

  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    if (immutableLedgerHash) {
      navigator.clipboard.writeText(immutableLedgerHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Link2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Blockchain Food Traceability</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Decentralized Farm-to-Plate Origin Verification
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
            Smart Contract Verified
          </span>
        </div>
      </div>

      {/* Ledger Verification Status */}
      <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-700/40 mb-4 flex items-center justify-between text-xs text-purple-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span className="font-semibold">{tamperEvidentStatus}</span>
        </div>
        <span className="text-purple-400 font-mono text-[10px]">Zero Block Collisions</span>
      </div>

      {/* Supply Chain Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-slate-400 text-[11px] block">Provenance Origin / Facility</span>
          <p className="font-semibold text-slate-200 mt-1">{originFarm}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-slate-400 text-[11px] block">Batch Lot & Harvest Timestamp</span>
          <p className="font-semibold text-slate-200 mt-1 font-mono">
            {batchId} · {harvestDate}
          </p>
        </div>
      </div>

      {/* Certifications Row */}
      {certifications && certifications.length > 0 && (
        <div className="mb-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Audited Certifications
          </span>
          <div className="flex flex-wrap gap-2">
            {certifications.map((cert, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-medium"
              >
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>{cert}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cryptographic Hash Bar */}
      <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] text-slate-500 font-mono block">SHA-256 Ledger Hash</span>
          <p className="font-mono text-[11px] text-purple-300 truncate mt-0.5">
            {immutableLedgerHash}
          </p>
        </div>
        <button
          onClick={copyHash}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-[11px]"
          title="Copy Ledger Hash"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
};
