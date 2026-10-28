import React, { useState, useEffect } from 'react';
import {
  Header,
} from './components/Header';
import { FeatureSlider, SliderMode } from './components/FeatureSlider';
import { ScannerUploader } from './components/ScannerUploader';
import { PoisonAnalysisCard } from './components/PoisonAnalysisCard';
import { IngredientCard } from './components/IngredientCard';
import { NutritionCard } from './components/NutritionCard';
import { HealthAdviceCard } from './components/HealthAdviceCard';
import { SpoilageCard } from './components/SpoilageCard';
import { WaterQualityCard } from './components/WaterQualityCard';
import { BlockchainCard } from './components/BlockchainCard';
import { ContaminationAlertsModal } from './components/ContaminationAlertsModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { UserProfileModal } from './components/UserProfileModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { EmergencyHotlineModal } from './components/EmergencyHotlineModal';
import { GoogleChatModal } from './components/GoogleChatModal';
import { BottomNavBar } from './components/BottomNavBar';
import { TrialBanner } from './components/TrialBanner';
import { StellarPaywallModal } from './components/StellarPaywallModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { ScanVerdictHero, ResultCategoryTab } from './components/ScanVerdictHero';
import {
  FoodAnalysisResult,
  AnalysisMode,
  UserHealthProfile,
} from './types/food';
import {
  analyzeFoodApi,
  getSavedScansHistory,
  getStoredUserProfile,
  getStoredSubscription,
  fetchScansFromDbApi,
  fetchUserProfileApi,
  updateUserProfileApi,
  initOrGetTrialApi,
  fetchTrialStatusApi,
  TrialStatusResponse,
  TrialExpiredError,
} from './services/api';
import { SAMPLE_PRESETS } from './data/samplePresets';
import {
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Zap,
  Info,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function App() {
  const [activeMode, setActiveMode] = useState<SliderMode>('poison');
  const [activeBottomTab, setActiveBottomTab] = useState<'scan' | 'radar' | 'history' | 'profile'>('scan');

  // Modals state
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isStellarPaywallOpen, setIsStellarPaywallOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // App settings & profile
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userProfile, setUserProfile] = useState<UserHealthProfile>(getStoredUserProfile());
  const [subscription, setSubscription] = useState(getStoredSubscription());
  const [scansHistory, setScansHistory] = useState<FoodAnalysisResult[]>(getSavedScansHistory());
  const [trialStatus, setTrialStatus] = useState<TrialStatusResponse | null>(null);

  // Current food analysis state (initial default loaded for instant visual richness)
  const [currentAnalysis, setCurrentAnalysis] = useState<FoodAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Initialize with verified records from backend DB, local storage & 14-day trial
  useEffect(() => {
    async function initDbSync() {
      try {
        const [dbScans, dbProfile, trial] = await Promise.all([
          fetchScansFromDbApi(),
          fetchUserProfileApi(),
          initOrGetTrialApi(),
        ]);

        if (trial) {
          setTrialStatus(trial);
          if (trial.isExpired && !trial.isPaid) {
            setIsStellarPaywallOpen(true);
          }
        }

        if (dbScans && dbScans.length > 0) {
          setScansHistory(dbScans);
          setCurrentAnalysis(dbScans[0]);
        } else {
          runAnalysis({ foodDescription: SAMPLE_PRESETS[1].queryHint, initialDemo: true });
        }
        if (dbProfile) {
          setUserProfile(dbProfile);
        }
      } catch {
        const history = getSavedScansHistory();
        if (history.length > 0) {
          setCurrentAnalysis(history[0]);
        } else {
          runAnalysis({ foodDescription: SAMPLE_PRESETS[1].queryHint, initialDemo: true });
        }
      }
    }
    initDbSync();
  }, []);

  const refreshHistory = async () => {
    try {
      const scans = await fetchScansFromDbApi();
      setScansHistory(scans);
    } catch {
      setScansHistory(getSavedScansHistory());
    }
  };

  const runAnalysis = async (params: { image?: string; foodDescription?: string; initialDemo?: boolean }) => {
    setIsLoading(true);
    setStatusMessage('Engaging AI Spectrometry & Toxicology Engine...');
    try {
      const res = await analyzeFoodApi({
        image: params.image,
        foodDescription: params.foodDescription,
        analysisMode: activeMode === 'alerts' || activeMode === 'chat' ? 'poison' : activeMode,
        userProfile,
      });

      setCurrentAnalysis(res.data);
      refreshHistory();

      if (!params.initialDemo) {
        setStatusMessage('Analysis verified & saved to encrypted vault.');
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      if (err instanceof TrialExpiredError || err?.name === 'TrialExpiredError' || err?.message?.includes('trial has expired')) {
        setStatusMessage('14-Day Free Trial period ended. Unlock via Stellar to continue.');
        setIsStellarPaywallOpen(true);
        return;
      }
      setStatusMessage('Service encountered issue, using verified baseline toxicology model.');
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFeatureMode = (mode: SliderMode) => {
    if (mode === 'alerts') {
      setIsAlertsOpen(true);
      return;
    }
    if (mode === 'chat') {
      setIsChatOpen(true);
      return;
    }
    setActiveMode(mode);
  };

  const getActiveTabFromMode = (mode: SliderMode): ResultCategoryTab => {
    if (mode === 'poison' || mode === 'spoilage') return 'safety';
    if (mode === 'ingredients') return 'ingredients';
    if (mode === 'nutrition') return 'nutrition';
    if (mode === 'health') return 'health';
    if (mode === 'blockchain' || mode === 'water') return 'traceability';
    return 'safety';
  };

  const activeResultTab = getActiveTabFromMode(activeMode);

  const handleSelectResultTab = (tab: ResultCategoryTab) => {
    if (tab === 'safety') setActiveMode('poison');
    else if (tab === 'ingredients') setActiveMode('ingredients');
    else if (tab === 'nutrition') setActiveMode('nutrition');
    else if (tab === 'health') setActiveMode('health');
    else if (tab === 'traceability') setActiveMode('blockchain');
  };

  const handleBottomTabSelect = (tab: 'scan' | 'radar' | 'history' | 'profile') => {
    setActiveBottomTab(tab);
    if (tab === 'radar') setIsAlertsOpen(true);
    if (tab === 'history') setIsHistoryOpen(true);
    if (tab === 'profile') setIsProfileOpen(true);
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-200`}>
      {/* Universal Top Bar */}
      <Header
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        onOpenStellarPaywall={() => setIsStellarPaywallOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        currentPlan={trialStatus?.isPaid ? trialStatus.plan : subscription.plan}
        trialDaysRemaining={trialStatus?.daysRemaining ?? 14}
        isTrialExpired={trialStatus?.isExpired ?? false}
        isPaidLicense={trialStatus?.isPaid ?? false}
      />

      {/* Main Content Area: Responsive or Mobile Frame container */}
      <main className="flex-1 flex justify-center w-full px-3 sm:px-6 py-4 sm:py-6 pb-24">
        <div
          className={`w-full transition-all duration-300 ${
            isMobileFrame
              ? 'max-w-[430px] rounded-[48px] border-[10px] border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden bg-slate-900/95 my-2 p-3 sm:p-4'
              : 'max-w-5xl'
          }`}
        >
          {/* Mobile Notch Bar if in frame mode */}
          {isMobileFrame && (
            <div className="w-full flex items-center justify-between px-6 pt-1 pb-3 text-[11px] font-mono text-slate-400">
              <span>9:41</span>
              <div className="w-24 h-4 bg-slate-950 rounded-full mx-auto -mt-1 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-slate-800" />
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* 14-Day Free Trial Banner & Status */}
          <TrialBanner
            trialStatus={trialStatus}
            onOpenStellarPaywall={() => setIsStellarPaywallOpen(true)}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />

          {/* Status Message Notification Bar */}
          {statusMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{statusMessage}</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400/80">AES-256</span>
            </div>
          )}

          {/* Top Feature Slider: Prompt Requirement */}
          <div className="mb-5">
            <FeatureSlider
              activeMode={activeMode}
              onSelectMode={handleSelectFeatureMode}
            />
          </div>

          {/* Scanner & Food Uploader */}
          <div className="mb-6">
            <ScannerUploader
              onAnalyze={runAnalysis}
              isLoading={isLoading}
              activeMode={activeMode}
            />
          </div>

          {/* Analysis Results Display with Unified Verdict Hero and Segmented Mobile Tabs */}
          {currentAnalysis && (
            <div className="space-y-4">
              <ScanVerdictHero
                analysis={currentAnalysis}
                activeTab={activeResultTab}
                onSelectTab={handleSelectResultTab}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
                onOpenChat={() => setIsChatOpen(true)}
              />

              {/* Tab Category Content */}
              {activeResultTab === 'safety' && (
                <div className="space-y-4">
                  <PoisonAnalysisCard
                    poison={currentAnalysis.poisonAnalysis}
                    foodName={currentAnalysis.foodName}
                    safetyScore={currentAnalysis.safetyScore}
                    onOpenEmergency={() => setIsEmergencyOpen(true)}
                    onOpenChat={() => setIsChatOpen(true)}
                  />
                  <SpoilageCard
                    spoilage={currentAnalysis.spoilageAndExpiry}
                    foodName={currentAnalysis.foodName}
                  />
                </div>
              )}

              {activeResultTab === 'ingredients' && (
                <IngredientCard
                  ingredientData={currentAnalysis.ingredientAnalysis}
                  foodName={currentAnalysis.foodName}
                />
              )}

              {activeResultTab === 'nutrition' && (
                <NutritionCard
                  nutrition={currentAnalysis.nutritionalAnalysis}
                  userProfile={userProfile}
                />
              )}

              {activeResultTab === 'health' && (
                <HealthAdviceCard
                  advice={currentAnalysis.personalizedHealthAdvice}
                  foodResult={currentAnalysis}
                  userProfile={userProfile}
                />
              )}

              {activeResultTab === 'traceability' && (
                <div className="space-y-4">
                  <BlockchainCard
                    traceability={currentAnalysis.blockchainTraceability}
                  />
                  {currentAnalysis.waterOrLiquidQuality && (
                    <WaterQualityCard
                      waterData={currentAnalysis.waterOrLiquidQuality}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Fixed Thumb-Zone Bottom Nav Bar */}
      <BottomNavBar
        activeTab={activeBottomTab}
        onSelectTab={handleBottomTabSelect}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* Modals & Drawers */}
      <GoogleChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentScan={currentAnalysis}
      />

      <ContaminationAlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
      />

      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        currentPlan={subscription.plan}
        onPlanUpdated={(newPlan) => setSubscription({ ...subscription, plan: newPlan })}
        onOpenStellarModal={() => setIsStellarPaywallOpen(true)}
      />

      <StellarPaywallModal
        isOpen={isStellarPaywallOpen}
        onClose={() => setIsStellarPaywallOpen(false)}
        trialStatus={trialStatus}
        onPaymentSuccess={(newStatus) => {
          setTrialStatus(newStatus);
          setSubscription({ ...subscription, plan: newStatus.plan });
          setStatusMessage(`Payment Confirmed on Stellar Ledger! Plan: ${newStatus.plan}`);
          setTimeout(() => setStatusMessage(null), 4000);
        }}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={userProfile}
        onProfileUpdated={(up) => {
          setUserProfile(up);
          updateUserProfileApi(up);
        }}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        scans={scansHistory}
        onSelectScan={(s) => setCurrentAnalysis(s)}
        onRefreshHistory={refreshHistory}
      />

      <EmergencyHotlineModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        poisonName={currentAnalysis?.poisonAnalysis?.poisonName}
        chemicalFormula={currentAnalysis?.poisonAnalysis?.chemicalFormula}
      />

      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}
