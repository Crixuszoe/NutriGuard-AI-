import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  Shield,
  Zap,
  Sparkles,
  Building,
  Lock,
  X,
  CheckCircle2,
  Coins,
} from 'lucide-react';
import { activateSubscriptionApi } from '../services/api';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  onPlanUpdated: (newPlan: string) => void;
  onOpenStellarModal?: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onPlanUpdated,
  onOpenStellarModal,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'Free' | 'Pro' | 'Enterprise'>('Pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'stellar'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('08/28');
  const [cvc, setCvc] = useState('884');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      await activateSubscriptionApi(selectedPlan, billingCycle);
      setSuccessMsg(true);
      onPlanUpdated(selectedPlan);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1600);
    } catch (e) {
      console.error('Subscription checkout error', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                NutriGuard Security Subscriptions
              </h3>
              <p className="text-xs text-slate-400">
                Upgrade for unlimited forensic scans and enterprise food safety protection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plan Switcher */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 max-w-xs mx-auto">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-1.5 rounded-xl font-semibold transition ${
                billingCycle === 'monthly'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 py-1.5 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-emerald-300">
                Save 25%
              </span>
            </button>
          </div>

          {/* Pricing Tier Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Free Tier */}
            <div
              onClick={() => setSelectedPlan('Free')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                selectedPlan === 'Free'
                  ? 'bg-slate-850 border-slate-600 ring-1 ring-slate-400'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-200">Free Tier</span>
                {currentPlan === 'Free' && (
                  <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                    Current
                  </span>
                )}
              </div>
              <p className="text-xl font-black text-slate-100">$0</p>
              <p className="text-[10px] text-slate-500 mb-2">Basic daily safety</p>
              <ul className="space-y-1 text-[11px] text-slate-400">
                <li className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-slate-500" /> 3 Scans / day
                </li>
                <li className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-slate-500" /> Standard Macros
                </li>
              </ul>
            </div>

            {/* Pro Tier */}
            <div
              onClick={() => setSelectedPlan('Pro')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition relative ${
                selectedPlan === 'Pro'
                  ? 'bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold text-[9px] uppercase px-2 py-0.5 rounded-full shadow">
                Popular
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-emerald-400">NutriGuard Pro</span>
              </div>
              <p className="text-xl font-black text-slate-100">
                {billingCycle === 'monthly' ? '$14.99' : '$9.99'}
                <span className="text-[10px] text-slate-500 font-normal">/mo</span>
              </p>
              <p className="text-[10px] text-slate-400 mb-2">Unlimited Protection</p>
              <ul className="space-y-1 text-[11px] text-slate-300">
                <li className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> Unlimited AI Scans
                </li>
                <li className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> Chemical Poison Specs
                </li>
                <li className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> Blockchain Audits
                </li>
                <li className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> Encrypted Health Vault
                </li>
              </ul>
            </div>

            {/* Enterprise Tier */}
            <div
              onClick={() => setSelectedPlan('Enterprise')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                selectedPlan === 'Enterprise'
                  ? 'bg-purple-950/30 border-purple-500 ring-2 ring-purple-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-purple-400">Enterprise</span>
              </div>
              <p className="text-xl font-black text-slate-100">
                $99<span className="text-[10px] text-slate-500 font-normal">/mo</span>
              </p>
              <p className="text-[10px] text-slate-400 mb-2">Suppliers & Kitchens</p>
              <ul className="space-y-1 text-[11px] text-slate-300">
                <li className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-purple-400" /> Batch Bulk Scans
                </li>
                <li className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-purple-400" /> Lab Toxicology PDF Export
                </li>
                <li className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-purple-400" /> FDA Recall Webhook
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Method Toggle */}
          <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                paymentMethod === 'card'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Credit Card (Stripe)</span>
            </button>
            <button
              onClick={() => setPaymentMethod('stellar')}
              className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                paymentMethod === 'stellar'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Stellar Blockchain (XLM)</span>
            </button>
          </div>

          {paymentMethod === 'card' ? (
            /* Simulated Stripe Payment Form */
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Stripe 256-Bit Encrypted Payment</span>
                </span>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Visa / MC / Apple Pay</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Expiration</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">CVC Security Code</label>
                  <input
                    type="password"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Stellar Payment Prompt */
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>Stellar Network Micropayment</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  25 XLM (~$3.50)
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Pay using Stellar XLM or USDC with real-time on-chain Horizon verification. Fast, low fee, and completely decentralized.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenStellarModal) onOpenStellarModal();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow"
              >
                <Coins className="w-4 h-4" />
                <span>Open Dedicated Stellar Ledger Checkout</span>
              </button>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 flex items-center gap-2 text-emerald-300 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Subscription activated! Unlimited security scans unlocked.</span>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 text-slate-950" />
            )}
            <span>
              {isProcessing
                ? 'Validating Stripe Auth...'
                : `Activate ${selectedPlan} Plan (${
                    selectedPlan === 'Free'
                      ? 'Free'
                      : billingCycle === 'monthly'
                      ? selectedPlan === 'Pro'
                        ? '$14.99/mo'
                        : '$99/mo'
                      : selectedPlan === 'Pro'
                      ? '$119/yr'
                      : '$999/yr'
                  })`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
