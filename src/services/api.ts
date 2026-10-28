import { FoodAnalysisResult, UserHealthProfile, GlobalAlert, CommunityReport } from '../types/food';

const STORAGE_KEY = 'nutriguard_scans_history_v1';
const PROFILE_KEY = 'nutriguard_user_profile_v1';
const SUBSCRIPTION_KEY = 'nutriguard_subscription_v1';
const DEVICE_ID_KEY = 'nutriguard_device_uuid_v1';
const LICENSE_TOKEN_KEY = 'nutriguard_license_token_v1';

export class TrialExpiredError extends Error {
  public daysRemaining: number;
  public stellarTreasury: string;
  constructor(message: string, daysRemaining: number = 0, stellarTreasury: string = '') {
    super(message);
    this.name = 'TrialExpiredError';
    this.daysRemaining = daysRemaining;
    this.stellarTreasury = stellarTreasury;
  }
}

export function getOrCreateDeviceId(): string {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `dev-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    return 'dev-standard-client';
  }
}

export function getStoredLicenseToken(): string | null {
  try {
    return localStorage.getItem(LICENSE_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveLicenseToken(token: string) {
  try {
    localStorage.setItem(LICENSE_TOKEN_KEY, token);
  } catch (e) {
    console.warn('Failed to save license token to localStorage', e);
  }
}

export const DEFAULT_USER_PROFILE: UserHealthProfile = {
  name: 'Alex Mercer',
  age: 32,
  weightKg: 72,
  heightCm: 178,
  gender: 'male',
  dietaryPreference: 'omnivore',
  healthGoal: 'general_wellness',
  allergies: ['Shellfish'],
  dailyCalorieTarget: 2200,
  dailySodiumMaxMg: 2300,
};

// 14-Day Free Trial & Stellar Monetization APIs
export interface TrialStatusResponse {
  success: boolean;
  token: string;
  valid: boolean;
  isExpired: boolean;
  isPaid: boolean;
  plan: string;
  daysRemaining: number;
  hoursRemaining: number;
  memo: string;
  treasuryAddress: string;
}

export async function initOrGetTrialApi(userEmail?: string): Promise<TrialStatusResponse> {
  const deviceId = getOrCreateDeviceId();
  const res = await fetch('/api/trial/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, userEmail }),
  });
  const json = await res.json();
  if (json.token) {
    saveLicenseToken(json.token);
  }
  return json;
}

export async function fetchTrialStatusApi(): Promise<TrialStatusResponse> {
  const deviceId = getOrCreateDeviceId();
  const token = getStoredLicenseToken();
  const res = await fetch(`/api/trial/status?deviceId=${encodeURIComponent(deviceId)}${token ? `&token=${encodeURIComponent(token)}` : ''}`);
  const json = await res.json();
  if (json.token) {
    saveLicenseToken(json.token);
  }
  return json;
}

export async function fetchStellarConfigApi() {
  const res = await fetch('/api/stellar/config');
  return res.json();
}

export async function verifyStellarPaymentApi(params: {
  txHash?: string;
  planTier: 'monthly' | 'yearly' | 'lifetime';
  memo: string;
  network: 'testnet' | 'public';
  simulate?: boolean;
  userEmail?: string;
}): Promise<any> {
  const deviceId = getOrCreateDeviceId();
  const res = await fetch('/api/stellar/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, deviceId }),
  });
  const json = await res.json();
  if (json.token) {
    saveLicenseToken(json.token);
  }
  return json;
}

// API calls
export async function analyzeFoodApi(params: {
  image?: string;
  foodDescription?: string;
  analysisMode?: string;
  userProfile?: UserHealthProfile;
}): Promise<{ data: FoodAnalysisResult; source: string; warning?: string }> {
  const token = getStoredLicenseToken();
  const deviceId = getOrCreateDeviceId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-device-id': deviceId,
  };
  if (token) {
    headers['x-nutriguard-token'] = token;
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/analyze-food', {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...params, deviceId }),
  });

  if (res.status === 402) {
    const errorJson = await res.json();
    throw new TrialExpiredError(
      errorJson.message || 'Your 14-day free trial has expired. Subscribe with Stellar to continue scanning.',
      errorJson.daysRemaining || 0,
      errorJson.stellarTreasury || ''
    );
  }

  if (!res.ok) {
    throw new Error(`Analysis service error (${res.status})`);
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || 'Failed to process food sample');
  }

  // Save to encrypted history
  const resultWithMeta: FoodAnalysisResult = {
    ...json.data,
    id: `scan-${Date.now()}`,
    scannedAt: new Date().toISOString(),
    imageThumbnail: params.image || undefined,
  };
  saveScanToHistory(resultWithMeta);

  return { data: resultWithMeta, source: json.source, warning: json.warning };
}

export async function askHealthAdvisorApi(params: {
  question: string;
  foodContext: FoodAnalysisResult;
  userProfile: UserHealthProfile;
}): Promise<string> {
  const token = getStoredLicenseToken();
  const deviceId = getOrCreateDeviceId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-device-id': deviceId,
  };
  if (token) {
    headers['x-nutriguard-token'] = token;
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/chat-advice', {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...params, deviceId }),
  });

  if (res.status === 402) {
    throw new TrialExpiredError('14-day free trial expired. Subscription required.');
  }

  const json = await res.json();
  return json.reply || 'Consult a certified clinical dietitian or healthcare provider.';
}

export async function fetchAlertsApi(): Promise<GlobalAlert[]> {
  const res = await fetch('/api/alerts');
  const json = await res.json();
  return json.alerts || [];
}

export async function fetchCommunityReportsApi(): Promise<CommunityReport[]> {
  const res = await fetch('/api/community-reports');
  const json = await res.json();
  return json.reports || [];
}

export async function submitCommunityReportApi(report: Partial<CommunityReport>): Promise<CommunityReport> {
  const res = await fetch('/api/community-reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });
  const json = await res.json();
  return json.report;
}

export async function activateSubscriptionApi(plan: string, billingCycle: string): Promise<any> {
  const res = await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, billingCycle }),
  });
  const json = await res.json();
  if (json.success) {
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(json.subscription));
  }
  return json;
}

export async function fetchDbHealthApi(): Promise<{
  status: string;
  engine: string;
  persistence: string;
  totalScans: number;
  totalRooms: number;
  totalMessages: number;
  totalReports: number;
  totalUsers: number;
  totalSubscriptions: number;
  totalAuditLogs: number;
  lastPersistedAt: string;
  checksum: string;
}> {
  const res = await fetch('/api/db/health');
  return res.json();
}

export async function fetchScansFromDbApi(): Promise<FoodAnalysisResult[]> {
  try {
    const res = await fetch('/api/scans');
    const json = await res.json();
    if (json.scans && Array.isArray(json.scans)) {
      // Sync to local storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(json.scans));
      return json.scans;
    }
    return getSavedScansHistory();
  } catch (err) {
    console.warn('Backend DB scans fetch failed, falling back to local storage', err);
    return getSavedScansHistory();
  }
}

export async function deleteScanFromDbApi(id: string): Promise<boolean> {
  try {
    await fetch(`/api/scans/${id}`, { method: 'DELETE' });
    const local = getSavedScansHistory().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
    return true;
  } catch (e) {
    console.error('Failed to delete scan', e);
    return false;
  }
}

export async function fetchUserProfileApi(userId: string = 'default_user'): Promise<UserHealthProfile> {
  try {
    const res = await fetch(`/api/user/profile?userId=${encodeURIComponent(userId)}`);
    const json = await res.json();
    if (json.success && json.profile) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(json.profile));
      return json.profile;
    }
    return getStoredUserProfile();
  } catch {
    return getStoredUserProfile();
  }
}

export async function updateUserProfileApi(profile: UserHealthProfile, userId: string = 'default_user'): Promise<UserHealthProfile> {
  saveStoredUserProfile(profile);
  try {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profile, userId }),
    });
    const json = await res.json();
    return json.profile || profile;
  } catch (err) {
    console.warn('Failed syncing profile to backend DB', err);
    return profile;
  }
}

export async function exportDatabaseBackupApi() {
  const res = await fetch('/api/db/backup');
  return res.json();
}

export async function resetDatabaseToSeedApi() {
  const res = await fetch('/api/db/reset', { method: 'POST' });
  return res.json();
}

// Local storage management
export function getSavedScansHistory(): FoodAnalysisResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed reading scans history', e);
    return [];
  }
}

export function saveScanToHistory(scan: FoodAnalysisResult) {
  try {
    const existing = getSavedScansHistory();
    // Keep last 30 scans
    const updated = [scan, ...existing.filter((s) => s.id !== scan.id)].slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed saving scan to history', e);
  }
}

export function clearScansHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getStoredUserProfile(): UserHealthProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_USER_PROFILE;
  } catch (e) {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveStoredUserProfile(profile: UserHealthProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getStoredSubscription() {
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_KEY);
    return raw ? JSON.parse(raw) : { plan: 'Free', status: 'active', remainingScansToday: 3 };
  } catch (e) {
    return { plan: 'Free', status: 'active', remainingScansToday: 3 };
  }
}

// Web Speech Synthesis for Voice Readout
export function speakAdvice(text: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

// ==========================================
// ADMIN DASHBOARD & SYSTEM ANOMALY APIS
// ==========================================

export interface SystemAnomalyAlert {
  id: string;
  type: 'TOXIC_SPIKE' | 'PATHOGEN_OUTBREAK' | 'SECURITY_TAMPER' | 'API_LATENCY' | 'REGULATORY_RECALL';
  severity: 'critical' | 'high' | 'medium' | 'info';
  title: string;
  description: string;
  detectedAt: string;
  region: string;
  affectedItem?: string;
  status: 'active' | 'investigating' | 'resolved';
  mitigationNotes?: string;
  anomalyMetric?: string;
}

export interface AdminDashboardData {
  success: boolean;
  kpis: {
    totalScans: number;
    safeScans: number;
    unsafeScans: number;
    avgSafetyScore: number;
    activeTrialsCount: number;
    expiredTrialsCount: number;
    paidSubscribersCount: number;
    totalRegisteredDevices: number;
    stellarRevenueXlm: string;
    stellarRevenueUsdc: string;
    totalReportsCount: number;
    verifiedReportsCount: number;
    activeAnomaliesCount: number;
    criticalThreatsCount: number;
  };
  reports: CommunityReport[];
  anomalies: SystemAnomalyAlert[];
  subscriptions: {
    allSubscriptions: any[];
    trialsList: Array<{
      deviceId: string;
      userEmail: string;
      isPaid: boolean;
      plan: string;
      trialStartedAt: number;
      trialExpiresAt: number;
      paidExpiresAt?: number;
      stellarTxHash?: string;
      createdAt: string;
    }>;
    stellarTransactions: Array<{
      txHash: string;
      deviceId: string;
      userEmail: string;
      amount: string;
      asset: string;
      sender: string;
      recipient: string;
      memo: string;
      plan: string;
      ledger?: number;
      verifiedAt: string;
    }>;
  };
  systemTelemetry: {
    version: string;
    lastPersistedAt: string;
    databaseFileSizeBytes: number;
    encryptionType: string;
    antiBypassStatus: string;
    stellarHorizonConnection: string;
    checksum: string;
  };
}

export async function fetchAdminDashboardApi(): Promise<AdminDashboardData> {
  const res = await fetch('/api/admin/dashboard');
  if (!res.ok) {
    throw new Error(`Admin dashboard error (${res.status})`);
  }
  return res.json();
}

export async function verifyReportAdminApi(id: string, verified: boolean): Promise<any> {
  const res = await fetch(`/api/admin/verify-report/${encodeURIComponent(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verified }),
  });
  return res.json();
}

export async function resolveAnomalyAdminApi(id: string, mitigationNotes?: string): Promise<any> {
  const res = await fetch(`/api/admin/resolve-anomaly/${encodeURIComponent(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mitigationNotes }),
  });
  return res.json();
}

export async function triggerAnomalyAdminApi(data: Partial<SystemAnomalyAlert>): Promise<any> {
  const res = await fetch('/api/admin/trigger-anomaly', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
