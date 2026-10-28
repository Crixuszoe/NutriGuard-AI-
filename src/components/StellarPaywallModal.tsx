import React, { useState } from 'react';
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  Zap,
  Lock,
  X,
  AlertTriangle,
  QrCode,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  TrialStatusResponse,
  verifyStellarPaymentApi,
  getOrCreateDeviceId,
} from '../services/api';

interface StellarPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  trialStatus: TrialStatusResponse | null;
  onPaymentSuccess: (newStatus: TrialStatusResponse) => void;
}

export const StellarPaywallModal: React.FC<StellarPaywallModalProps> = ({
  isOpen,
  onClose,
  trialStatus,
  onPaymentSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('monthly');
  const [selectedAsset, setSelectedAsset] = useState<'XLM' | 'USDC'>('XLM');
  const [network, setNetwork] = useState<'testnet' | 'public'>('testnet');
  const [txHash, setTxHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const treasuryAddress =
    trialStatus?.treasuryAddress || 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJULST';
  const memo = trialStatus?.memo || `NG-${getOrCreateDeviceId().substring(0, 8).toUpperCase()}`;

  const planPricing = {
    monthly: { xlm: '25 XLM', usdc: '$9.99 USDC', label: 'Pro Monthly (30 Days)' },
    yearly: { xlm: '250 XLM', usdc: '$89.99 USDC', label: 'Pro Annual (365 Days)' },
    lifetime: { xlm: '500 XLM', usdc: '$199.99 USDC', label: 'Forensic Lifetime Access' },
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleVerify = async (simulate: boolean = false) => {
    setIsVerifying(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await verifyStellarPaymentApi({
        txHash: simulate ? undefined : txHash.trim(),
        planTier: selectedPlan,
        memo,
        network,
        simulate,
      });

      if (res.success) {
        setSuccessMessage(res.message || 'Payment verified on Stellar Ledger!');
        setTimeout(() => {
          onPaymentSuccess({
            success: true,
            token: res.token,
            valid: true,
            isExpired: false,
            isPaid: true,
            plan: res.plan,
            daysRemaining: res.daysRemaining,
            hoursRemaining: res.daysRemaining * 24,
            memo,
            treasuryAddress,
          });
          onClose();
        }, 1800);
      } else {
        setErrorMessage(res.error || 'Failed to verify Stellar transaction on Horizon.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with Stellar Horizon node.');
    } finally {
      setIsVerifying(false);
    }
  };

  // If expired and not paid, don't allow closing without paying
  const canClose = !trialStatus?.isExpired || trialStatus?.isPaid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-md">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  Stellar Blockchain Payments & Licensing
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
                  {network.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tamper-proof micropayments in XLM or USDC verified on the Stellar Horizon ledger
              </p>
            </div>
          </div>
          {canClose ? (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span
              title="14-day free trial has expired. Activate a Stellar subscription to proceed."
              className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>Trial Expired</span>
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Trial Status or Anti-Bypass Alert */}
          {trialStatus?.isExpired ? (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">14-Day Free Trial Expired</p>
                <p className="text-xs text-rose-300/90 mt-0.5">
                  Your 2-week evaluation period has finished. To maintain continuous poison detection, forensic chemical formula quantification, and food safety alerts, subscribe via Stellar.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>
                  14-Day Free Trial: <strong>{trialStatus?.daysRemaining ?? 14} days</strong> remaining. Upgrade anytime to lock in early Stellar rates!
                </span>
              </div>
              <span className="font-mono text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">HMAC Protected</span>
            </div>
          )}

          {/* Plan Selector */}
          <div>
            <label className="block text-slate-400 font-semibold mb-2">Select Subscription Tier:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(['monthly', 'yearly', 'lifetime'] as const).map((tierKey) => {
                const info = planPricing[tierKey];
                const isSelected = selectedPlan === tierKey;
                return (
                  <button
                    key={tierKey}
                    type="button"
                    onClick={() => setSelectedPlan(tierKey)}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-100">{info.label}</div>
                      <div className="text-xs font-mono mt-1 text-amber-400">
                        {selectedAsset === 'XLM' ? info.xlm : info.usdc}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="mt-2 text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Asset & Network Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <label className="block text-slate-400 font-semibold mb-1.5">Asset:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAsset('XLM')}
                  className={`flex-1 py-1.5 rounded-xl font-bold transition text-xs ${
                    selectedAsset === 'XLM'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  XLM (Native)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAsset('USDC')}
                  className={`flex-1 py-1.5 rounded-xl font-bold transition text-xs ${
                    selectedAsset === 'USDC'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  USDC (Stellar)
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <label className="block text-slate-400 font-semibold mb-1.5">Stellar Network:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNetwork('testnet')}
                  className={`flex-1 py-1.5 rounded-xl font-bold transition text-xs ${
                    network === 'testnet'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Testnet (Free Testing)
                </button>
                <button
                  type="button"
                  onClick={() => setNetwork('public')}
                  className={`flex-1 py-1.5 rounded-xl font-bold transition text-xs ${
                    network === 'public'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Public Mainnet
                </button>
              </div>
            </div>
          </div>

          {/* Payment Transfer Instructions Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Step 1: Send {selectedAsset === 'XLM' ? planPricing[selectedPlan].xlm : planPricing[selectedPlan].usdc} to NutriGuard Treasury</span>
            </h4>

            {/* Treasury Address */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">NutriGuard Stellar Treasury Public Address:</span>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-200">
                <span className="truncate">{treasuryAddress}</span>
                <button
                  onClick={() => copyToClipboard(treasuryAddress, 'address')}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-sans flex items-center gap-1 shrink-0 transition"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey === 'address' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Payment Memo */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-400">Required Payment Memo (Crucial for Instant Credit):</span>
                <span className="text-[10px] text-amber-400 font-mono">Type: MEMO_TEXT</span>
              </div>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 font-mono text-[11px] text-amber-300">
                <span>{memo}</span>
                <button
                  onClick={() => copyToClipboard(memo, 'memo')}
                  className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-sans flex items-center gap-1 shrink-0 transition"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey === 'memo' ? 'Copied!' : 'Copy Memo'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Verification Step Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Step 2: Enter Transaction Hash for Instant Ledger Verification</span>
            </h4>

            <div>
              <input
                type="text"
                placeholder="Paste 64-character Stellar transaction hash (e.g. 5d9a8...)"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                disabled={isVerifying || !txHash.trim()}
                onClick={() => handleVerify(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isVerifying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>Verify Stellar Transaction</span>
              </button>

              {/* 1-Click Testnet Demo Mode */}
              <button
                type="button"
                disabled={isVerifying}
                onClick={() => handleVerify(true)}
                title="Simulates an instant verified Stellar Testnet transaction proof for immediate testing"
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Zap className="w-4 h-4" />
                <span>1-Click Testnet Demo Verification</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>

          {/* Anti-Bypass Security Guarantee Footer */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Cryptographic Anti-Bypass:</strong> License tokens are server-signed with HMAC-SHA256 and matched to the Stellar blockchain consensus. Modifying client code or localStorage cannot unlock AI scanning without a valid token.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
