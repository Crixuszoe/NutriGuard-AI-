import React, { useState, useEffect } from 'react';
import {
  BellRing,
  X,
  AlertTriangle,
  PlusCircle,
  CheckCircle2,
  Send,
  Radio,
  MapPin,
  Calendar,
} from 'lucide-react';
import { GlobalAlert, CommunityReport } from '../types/food';
import { fetchAlertsApi, fetchCommunityReportsApi, submitCommunityReportApi } from '../services/api';

interface ContaminationAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContaminationAlertsModal: React.FC<ContaminationAlertsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'global' | 'community'>('global');
  const [alerts, setAlerts] = useState<GlobalAlert[]>([]);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);

  // New report form fields
  const [foodItem, setFoodItem] = useState('');
  const [location, setLocation] = useState('');
  const [contaminantType, setContaminantType] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [gAlerts, cReports] = await Promise.all([
        fetchAlertsApi(),
        fetchCommunityReportsApi(),
      ]);
      setAlerts(gAlerts);
      setCommunityReports(cReports);
    } catch (e) {
      console.error('Error loading contamination alerts', e);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodItem.trim() || !location.trim()) return;

    setIsSubmitting(true);
    try {
      const newReport = await submitCommunityReportApi({
        foodItem,
        location,
        contaminantType,
        severity,
        notes,
      });
      setCommunityReports([newReport, ...communityReports]);
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowReportForm(false);
        setSubmitSuccess(false);
        setFoodItem('');
        setLocation('');
        setContaminantType('');
        setNotes('');
      }, 1500);
    } catch (e) {
      console.error('Failed submitting report', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Food Safety Radar & Contamination Recalls
              </h3>
              <p className="text-xs text-slate-400">
                Cross-referenced with FDA, EFSA, and WHO food safety alert networks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('global')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'global'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Official Recalls ({alerts.length})
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'community'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Community Incidents ({communityReports.length})
            </button>
          </div>

          <button
            onClick={() => setShowReportForm(!showReportForm)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Report Incident</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          {/* Submission Form Drawer */}
          {showReportForm && (
            <form
              onSubmit={handleSubmitReport}
              className="p-4 rounded-2xl bg-slate-950 border border-rose-900/50 mb-4 space-y-3"
            >
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Submit Suspicious Food / Contaminant Incident</span>
              </h4>

              {submitSuccess ? (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Report verified and broadcasted to local security network.</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Food Item / Brand
                      </label>
                      <input
                        type="text"
                        required
                        value={foodItem}
                        onChange={(e) => setFoodItem(e.target.value)}
                        placeholder="e.g. Unpasteurized Milk Lot 104"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:border-rose-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Location / Retailer
                      </label>
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Seattle Farmers Market"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:border-rose-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Suspected Contaminant / Poison
                      </label>
                      <input
                        type="text"
                        value={contaminantType}
                        onChange={(e) => setContaminantType(e.target.value)}
                        placeholder="e.g. Chemical smell / Salmonella"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:border-rose-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Severity Level
                      </label>
                      <select
                        value={severity}
                        onChange={(e: any) => setSeverity(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:border-rose-500 outline-none"
                      >
                        <option value="low">Low - Minor aesthetic issue</option>
                        <option value="medium">Medium - Potential spoilage</option>
                        <option value="high">High - Allergen / Bacterial hazard</option>
                        <option value="critical">Critical - Acute toxic poison</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Observations / Symptoms
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Describe strange odor, color changes, symptoms experienced..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:border-rose-500 outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowReportForm(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Submitting...' : 'Broadcast Report'}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* List Content */}
          {activeTab === 'global' ? (
            alerts.map((al) => (
              <div
                key={al.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-bold font-mono text-rose-400 uppercase tracking-wider block">
                      {al.agency} · {al.dateIssued}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 mt-0.5">{al.title}</h4>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                    {al.riskLevel} Risk
                  </span>
                </div>

                <div className="space-y-1 text-slate-300 mt-2">
                  <p>
                    <strong className="text-slate-400">Hazard: </strong> {al.hazard}
                  </p>
                  <p>
                    <strong className="text-slate-400">Jurisdictions: </strong>{' '}
                    {al.affectedRegions}
                  </p>
                  <p className="text-rose-200 mt-1 font-medium bg-rose-950/40 p-2 rounded-xl border border-rose-900/40">
                    <strong className="text-white">Action Protocol: </strong> {al.actionRequired}
                  </p>
                </div>
              </div>
            ))
          ) : (
            communityReports.map((cr) => (
              <div
                key={cr.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800"
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{cr.foodItem}</h4>
                    <div className="flex items-center gap-3 text-slate-400 text-[11px] mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        {cr.location}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-slate-500">
                        {new Date(cr.reportedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${
                      cr.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {cr.severity}
                  </span>
                </div>

                <div className="mt-2 text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-850">
                  <p className="font-semibold text-rose-300 mb-0.5">
                    Contaminant: {cr.contaminantType}
                  </p>
                  <p className="text-slate-400">{cr.notes}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
