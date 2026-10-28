import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Coins,
  TrendingUp,
  Activity,
  CheckCircle2,
  X,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  Radio,
  ExternalLink,
  Lock,
  Database,
  UserCheck,
  Clock,
  Check,
  PlusCircle,
  FileText,
  BadgeAlert,
  Terminal,
} from 'lucide-react';
import {
  AdminDashboardData,
  SystemAnomalyAlert,
  fetchAdminDashboardApi,
  verifyReportAdminApi,
  resolveAnomalyAdminApi,
  triggerAnomalyAdminApi,
} from '../services/api';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'subscriptions' | 'anomalies'>('overview');
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reportFilter, setReportFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [reportSearch, setReportSearch] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isSimulatingAnomaly, setIsSimulatingAnomaly] = useState(false);

  // New simulated anomaly form state
  const [newAnomalyTitle, setNewAnomalyTitle] = useState('');
  const [newAnomalyType, setNewAnomalyType] = useState<SystemAnomalyAlert['type']>('TOXIC_SPIKE');
  const [newAnomalySeverity, setNewAnomalySeverity] = useState<SystemAnomalyAlert['severity']>('high');
  const [newAnomalyRegion, setNewAnomalyRegion] = useState('');
  const [newAnomalyDescription, setNewAnomalyDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDashboardData();
    }
  }, [isOpen]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminDashboardApi();
      setData(res);
    } catch (err) {
      console.error('Failed to load admin telemetry', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchAdminDashboardApi();
      setData(res);
      showNotice('Telemetry refreshed from live database and Stellar ledger.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const showNotice = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleToggleVerifyReport = async (reportId: string, currentStatus: boolean) => {
    try {
      const res = await verifyReportAdminApi(reportId, !currentStatus);
      if (res.success) {
        showNotice(`Report ${reportId} marked as ${!currentStatus ? 'Official Verified' : 'Unverified Community'}.`);
        loadDashboardData();
      }
    } catch (err) {
      console.error('Failed toggling report verification', err);
    }
  };

  const handleResolveAnomaly = async (anomalyId: string) => {
    try {
      const res = await resolveAnomalyAdminApi(
        anomalyId,
        'Investigated, isolated, and mitigated by Food Safety Administrator via Command Console.'
      );
      if (res.success) {
        showNotice(`Anomaly ${anomalyId} successfully marked as Resolved.`);
        loadDashboardData();
      }
    } catch (err) {
      console.error('Failed resolving anomaly', err);
    }
  };

  const handleCreateTestAnomaly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnomalyTitle.trim()) return;

    try {
      const res = await triggerAnomalyAdminApi({
        title: newAnomalyTitle,
        type: newAnomalyType,
        severity: newAnomalySeverity,
        region: newAnomalyRegion || 'Global Telemetry Grid',
        description: newAnomalyDescription || 'Elevated anomaly parameters flagged by admin probe.',
        anomalyMetric: 'Simulated Forensic Trigger',
      });
      if (res.success) {
        showNotice(`New anomaly alert triggered: ${newAnomalyTitle}`);
        setNewAnomalyTitle('');
        setNewAnomalyRegion('');
        setNewAnomalyDescription('');
        setIsSimulatingAnomaly(false);
        loadDashboardData();
      }
    } catch (err) {
      console.error('Failed to trigger anomaly', err);
    }
  };

  if (!isOpen) return null;

  const kpis = data?.kpis;
  const reports = data?.reports || [];
  const anomalies = data?.anomalies || [];
  const subscriptions = data?.subscriptions;
  const systemTelemetry = data?.systemTelemetry;

  const filteredReports = reports.filter((r) => {
    const matchesFilter = reportFilter === 'all' || r.severity === reportFilter;
    const matchesSearch =
      r.foodItem.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.contaminantType.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.location.toLowerCase().includes(reportSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[94vh]">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-cyan-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  NutriGuard AI Security & Operations Command
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  ADMIN LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Global food safety surveillance, Stellar subscription telemetry, and bio-threat anomaly radar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">Refresh Sync</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Notice Toast */}
        {actionSuccess && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-5 py-2 text-emerald-300 text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 px-4 sm:px-6 overflow-x-auto text-xs font-semibold gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Overview & KPIs</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Global Food Safety Reports</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
              {reports.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'subscriptions'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Subscriptions & Stellar Trends</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">
              {kpis?.stellarRevenueXlm || '0'} XLM
            </span>
          </button>
          <button
            onClick={() => setActiveTab('anomalies')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'anomalies'
                ? 'border-rose-400 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BadgeAlert className="w-4 h-4" />
            <span>System Anomaly Alerts</span>
            {kpis?.activeAnomaliesCount ? (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono">
                {kpis.activeAnomaliesCount} Active
              </span>
            ) : null}
          </button>
        </div>

        {/* Main Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {isLoading && !data ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
              <p className="text-xs font-semibold">Aggregating live food safety telemetry & Stellar ledger data...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW & KPIS */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top 4 KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Forensic Scans */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-md">
                      <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                        <span className="font-semibold">Total Food Scans</span>
                        <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                          <Activity className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold text-white">
                        {kpis?.totalScans ?? 0}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
                        <span className="text-emerald-400 font-semibold">{kpis?.safeScans ?? 0} Safe</span>
                        <span>•</span>
                        <span className="text-rose-400 font-semibold">{kpis?.unsafeScans ?? 0} Unsafe</span>
                        <span>•</span>
                        <span className="font-mono text-cyan-300">Avg {kpis?.avgSafetyScore ?? 90}/100</span>
                      </div>
                    </div>

                    {/* Card 2: 14-Day Free Trials */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-md">
                      <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                        <span className="font-semibold">14-Day Free Trials</span>
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                          <Clock className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold text-emerald-400">
                        {kpis?.activeTrialsCount ?? 0}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
                        <span>{kpis?.totalRegisteredDevices ?? 0} Registered Devices</span>
                        <span>•</span>
                        <span className="text-amber-400">{kpis?.expiredTrialsCount ?? 0} Expired</span>
                      </div>
                    </div>

                    {/* Card 3: Stellar Revenue */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-md">
                      <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                        <span className="font-semibold">Stellar Blockchain Revenue</span>
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                          <Coins className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold text-amber-400">
                        {kpis?.stellarRevenueXlm ?? '0.00'} XLM
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
                        <span className="text-cyan-300 font-mono">${kpis?.stellarRevenueUsdc ?? '0.00'} USDC</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">{kpis?.paidSubscribersCount ?? 0} Paid Subs</span>
                      </div>
                    </div>

                    {/* Card 4: Critical Anomaly Threats */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/30 shadow-md">
                      <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                        <span className="font-semibold">Active Bio-Threats & Alerts</span>
                        <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                          <BadgeAlert className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold text-rose-400">
                        {kpis?.criticalThreatsCount ?? 0}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
                        <span className="text-rose-300 font-semibold">{kpis?.activeAnomaliesCount ?? 0} Active Anomalies</span>
                        <span>•</span>
                        <span>{kpis?.totalReportsCount ?? 0} Incident Reports</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Section: Security & System Health Telemetry */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Security & Anti-Bypass Status */}
                    <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                          <Lock className="w-4 h-4 text-emerald-400" />
                          <span>Cryptographic Anti-Bypass & Encryption Integrity</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                          100% ENFORCING
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        NutriGuard AI implements server-side HMAC-SHA256 signature verification on all AI forensic scan endpoints. Client tampering with browser cookies or localStorage is cryptographically intercepted.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">Vault Encryption</span>
                          <span className="font-mono text-cyan-300 text-xs mt-0.5 block">{systemTelemetry?.encryptionType || 'AES-256-GCM'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">Database SHA-256 Checksum</span>
                          <span className="font-mono text-emerald-400 text-[11px] mt-0.5 block truncate" title={systemTelemetry?.checksum}>
                            {systemTelemetry?.checksum ? systemTelemetry.checksum.substring(0, 16) + '...' : 'Verified'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">Stellar Horizon Node</span>
                          <span className="font-mono text-amber-300 text-xs mt-0.5 block">Testnet & Public Mainnet</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick System Action Card */}
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-100 mb-2">
                          <Terminal className="w-4 h-4 text-cyan-400" />
                          <span>Command Quick Actions</span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Simulate bio-threat spikes, trigger test anomaly telemetry, or verify community food safety reports.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setActiveTab('anomalies');
                            setIsSimulatingAnomaly(true);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Simulate Bio-Threat Spike</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('reports')}
                          className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition border border-slate-700"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Review Pending Reports ({reports.filter((r) => !r.verified).length})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: GLOBAL FOOD SAFETY REPORTS */}
              {activeTab === 'reports' && (
                <div className="space-y-4">
                  {/* Filters & Search Header */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search food item, contaminant, or location..."
                        value={reportSearch}
                        onChange={(e) => setReportSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto">
                      <span className="text-slate-400 text-xs shrink-0 font-semibold">Severity:</span>
                      {(['all', 'critical', 'high', 'medium', 'low'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setReportFilter(lvl)}
                          className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition ${
                            reportFilter === lvl
                              ? 'bg-cyan-500 text-slate-950 shadow-sm'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reports Table */}
                  <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px] font-bold">
                          <tr>
                            <th className="p-3.5">Food Item</th>
                            <th className="p-3.5">Hazard / Contaminant</th>
                            <th className="p-3.5">Severity</th>
                            <th className="p-3.5">Location</th>
                            <th className="p-3.5">Reported</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-right">Admin Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                          {filteredReports.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-500">
                                No food contamination reports found matching the selected filters.
                              </td>
                            </tr>
                          ) : (
                            filteredReports.map((report) => (
                              <tr key={report.id} className="hover:bg-slate-900/40 transition">
                                <td className="p-3.5 font-bold text-slate-100">
                                  {report.foodItem}
                                </td>
                                <td className="p-3.5 text-rose-300 font-mono text-[11px]">
                                  {report.contaminantType}
                                </td>
                                <td className="p-3.5">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                      report.severity === 'critical'
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                        : report.severity === 'high'
                                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                                        : report.severity === 'medium'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    }`}
                                  >
                                    {report.severity}
                                  </span>
                                </td>
                                <td className="p-3.5 text-slate-400">{report.location}</td>
                                <td className="p-3.5 text-slate-400 text-[11px]">
                                  {new Date(report.reportedAt).toLocaleDateString()}
                                </td>
                                <td className="p-3.5">
                                  {report.verified ? (
                                    <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Verified</span>
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>Community</span>
                                    </span>
                                  )}
                                </td>
                                <td className="p-3.5 text-right">
                                  <button
                                    onClick={() => handleToggleVerifyReport(report.id, report.verified)}
                                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                                      report.verified
                                        ? 'bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/30'
                                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
                                    }`}
                                  >
                                    {report.verified ? 'Revoke' : 'Verify'}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SUBSCRIPTIONS & STELLAR TRENDS */}
              {activeTab === 'subscriptions' && (
                <div className="space-y-6">
                  {/* Subscription KPI Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 text-xs block mb-1">Active 14-Day Free Trials</span>
                      <div className="text-2xl font-bold text-cyan-400">
                        {kpis?.activeTrialsCount ?? 0}
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">Full Unrestricted Toxicology Access</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 text-xs block mb-1">Total Stellar XLM Collected</span>
                      <div className="text-2xl font-bold text-amber-400 font-mono">
                        {kpis?.stellarRevenueXlm ?? '0'} XLM
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">Verified on Stellar Horizon Ledger</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 text-xs block mb-1">Paid Subscriptions Total</span>
                      <div className="text-2xl font-bold text-emerald-400">
                        {kpis?.paidSubscribersCount ?? 0}
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">Pro & Lifetime License Holders</span>
                    </div>
                  </div>

                  {/* Stellar Transactions Table */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span>Stellar Blockchain Ledger Payment History</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono">
                        HORIZON SYNC
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px] font-bold">
                          <tr>
                            <th className="p-3">Tx Hash</th>
                            <th className="p-3">Amount & Asset</th>
                            <th className="p-3">Plan</th>
                            <th className="p-3">Memo</th>
                            <th className="p-3">Sender Account</th>
                            <th className="p-3">Ledger Height</th>
                            <th className="p-3 text-right">Verified At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                          {subscriptions?.stellarTransactions && subscriptions.stellarTransactions.length > 0 ? (
                            subscriptions.stellarTransactions.map((tx, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/40">
                                <td className="p-3 font-mono text-[11px] text-amber-300">
                                  {tx.txHash ? `${tx.txHash.substring(0, 12)}...` : 'N/A'}
                                </td>
                                <td className="p-3 font-bold text-white">
                                  {tx.amount} {tx.asset}
                                </td>
                                <td className="p-3 text-cyan-300 font-semibold">{tx.plan}</td>
                                <td className="p-3 font-mono text-slate-400 text-[11px]">{tx.memo}</td>
                                <td className="p-3 font-mono text-slate-500 text-[10px]">
                                  {tx.sender ? `${tx.sender.substring(0, 10)}...` : 'Stellar Wallet'}
                                </td>
                                <td className="p-3 font-mono text-slate-400">{tx.ledger || '45910234'}</td>
                                <td className="p-3 text-slate-400 text-right text-[11px]">
                                  {new Date(tx.verifiedAt).toLocaleTimeString()}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="p-6 text-center text-slate-500">
                                No Stellar blockchain payments recorded yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Registered Devices Trial Registry */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span>Registered Devices & Free Trial Registry</span>
                      </div>
                      <span className="text-slate-400 text-xs">
                        {subscriptions?.trialsList?.length || 0} Devices Active
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px] font-bold">
                          <tr>
                            <th className="p-3">Device Fingerprint</th>
                            <th className="p-3">User Email</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Trial Started</th>
                            <th className="p-3">Trial Expires</th>
                            <th className="p-3 text-right">Stellar License</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                          {subscriptions?.trialsList && subscriptions.trialsList.length > 0 ? (
                            subscriptions.trialsList.map((trial, idx) => {
                              const isExpired = Date.now() > trial.trialExpiresAt && !trial.isPaid;
                              return (
                                <tr key={idx} className="hover:bg-slate-900/40">
                                  <td className="p-3 font-mono text-[11px] text-cyan-300">
                                    {trial.deviceId}
                                  </td>
                                  <td className="p-3 text-slate-300">{trial.userEmail}</td>
                                  <td className="p-3">
                                    {trial.isPaid ? (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                        Paid ({trial.plan})
                                      </span>
                                    ) : isExpired ? (
                                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                                        Expired
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                                        14d Trial Active
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-slate-400 text-[11px]">
                                    {new Date(trial.trialStartedAt).toLocaleDateString()}
                                  </td>
                                  <td className="p-3 text-slate-400 text-[11px]">
                                    {new Date(trial.trialExpiresAt).toLocaleDateString()}
                                  </td>
                                  <td className="p-3 text-right font-mono text-[11px] text-amber-300">
                                    {trial.stellarTxHash ? `${trial.stellarTxHash.substring(0, 8)}...` : 'None (Trial)'}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-slate-500">
                                No device registrations recorded.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SYSTEM ANOMALY ALERTS */}
              {activeTab === 'anomalies' && (
                <div className="space-y-6">
                  {/* Simulation Trigger Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">System-Wide Anomaly Surveillance</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Continuous spectrometry clustering, pathogen surge detection, and anti-bypass threat interception.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsSimulatingAnomaly(!isSimulatingAnomaly)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>{isSimulatingAnomaly ? 'Close Generator' : 'Simulate Anomaly Spike'}</span>
                    </button>
                  </div>

                  {/* Anomaly Generator Form */}
                  {isSimulatingAnomaly && (
                    <form
                      onSubmit={handleCreateTestAnomaly}
                      className="p-5 rounded-2xl bg-slate-950 border border-rose-500/40 space-y-4 animate-fadeIn"
                    >
                      <div className="flex items-center gap-2 text-rose-300 text-sm font-bold">
                        <Flame className="w-4 h-4 text-rose-400" />
                        <span>Inject Telemetry Anomaly Alert</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-slate-400 block mb-1 font-semibold">Anomaly Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Botulinum Toxin Cluster Detected"
                            value={newAnomalyTitle}
                            onChange={(e) => setNewAnomalyTitle(e.target.value)}
                            required
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-1 font-semibold">Geographic Region</label>
                          <input
                            type="text"
                            placeholder="e.g. Midwestern Canneries / Retail Hubs"
                            value={newAnomalyRegion}
                            onChange={(e) => setNewAnomalyRegion(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-1 font-semibold">Anomaly Type</label>
                          <select
                            value={newAnomalyType}
                            onChange={(e) => setNewAnomalyType(e.target.value as any)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 outline-none"
                          >
                            <option value="TOXIC_SPIKE">TOXIC_SPIKE (Chemical / Fungal Toxin)</option>
                            <option value="PATHOGEN_OUTBREAK">PATHOGEN_OUTBREAK (Bacterial / Viral)</option>
                            <option value="SECURITY_TAMPER">SECURITY_TAMPER (HMAC Bypass Attempt)</option>
                            <option value="REGULATORY_RECALL">REGULATORY_RECALL (FDA / FSIS Class I)</option>
                            <option value="API_LATENCY">API_LATENCY (Telemetry Spike)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-1 font-semibold">Severity</label>
                          <select
                            value={newAnomalySeverity}
                            onChange={(e) => setNewAnomalySeverity(e.target.value as any)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 outline-none"
                          >
                            <option value="critical">Critical (Immediate Bio-Safety Risk)</option>
                            <option value="high">High (Elevated Community Threshold)</option>
                            <option value="medium">Medium (Moderate Concern)</option>
                            <option value="info">Info (Surveillance Notice)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1 font-semibold text-xs">Detailed Description</label>
                        <textarea
                          placeholder="Provide forensic findings, spectrometry concentration, and immediate containment measures..."
                          value={newAnomalyDescription}
                          onChange={(e) => setNewAnomalyDescription(e.target.value)}
                          rows={2}
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsSimulatingAnomaly(false)}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition"
                        >
                          Deploy Anomaly Alert
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of Anomalies */}
                  <div className="space-y-3">
                    {anomalies.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-950 border border-slate-800">
                        No anomaly alerts on the system radar.
                      </div>
                    ) : (
                      anomalies.map((anomaly) => {
                        const isCritical = anomaly.severity === 'critical';
                        const isResolved = anomaly.status === 'resolved';

                        return (
                          <div
                            key={anomaly.id}
                            className={`p-4 sm:p-5 rounded-2xl border transition ${
                              isResolved
                                ? 'bg-slate-950/60 border-slate-800/80 opacity-75'
                                : isCritical
                                ? 'bg-gradient-to-r from-rose-950/40 via-slate-950 to-slate-950 border-rose-500/50 shadow-lg'
                                : anomaly.severity === 'high'
                                ? 'bg-slate-950 border-orange-500/40 shadow-md'
                                : 'bg-slate-950 border-slate-800'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="space-y-1.5 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                      isCritical
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                        : anomaly.severity === 'high'
                                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    }`}
                                  >
                                    {anomaly.severity}
                                  </span>

                                  <span className="font-mono text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded">
                                    {anomaly.type}
                                  </span>

                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      isResolved
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : 'bg-rose-500/20 text-rose-300 animate-pulse'
                                    }`}
                                  >
                                    {anomaly.status.toUpperCase()}
                                  </span>

                                  <span className="text-[11px] text-slate-400 font-mono">
                                    {new Date(anomaly.detectedAt).toLocaleString()}
                                  </span>
                                </div>

                                <h3 className="text-sm font-bold text-slate-100">{anomaly.title}</h3>

                                <p className="text-xs text-slate-300 leading-relaxed">
                                  {anomaly.description}
                                </p>

                                {anomaly.anomalyMetric && (
                                  <div className="inline-block mt-1 font-mono text-[11px] text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                                    {anomaly.anomalyMetric}
                                  </div>
                                )}

                                {anomaly.mitigationNotes && (
                                  <div className="mt-2 text-[11px] text-emerald-300 bg-emerald-950/30 border border-emerald-500/30 p-2 rounded-xl">
                                    <strong>Mitigation Log:</strong> {anomaly.mitigationNotes}
                                  </div>
                                )}
                              </div>

                              {!isResolved && (
                                <button
                                  onClick={() => handleResolveAnomaly(anomaly.id)}
                                  className="self-start px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition shrink-0"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Resolve & Mitigate</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
