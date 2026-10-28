import React, { useState } from 'react';
import {
  HeartPulse,
  Volume2,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bot,
  User,
} from 'lucide-react';
import {
  PersonalizedHealthAdvice,
  FoodAnalysisResult,
  UserHealthProfile,
} from '../types/food';
import { askHealthAdvisorApi, speakAdvice } from '../services/api';

interface HealthAdviceCardProps {
  advice: PersonalizedHealthAdvice;
  foodResult: FoodAnalysisResult;
  userProfile: UserHealthProfile;
}

export const HealthAdviceCard: React.FC<HealthAdviceCardProps> = ({
  advice,
  foodResult,
  userProfile,
}) => {
  const {
    fitForUserGoal,
    goalAlignmentScore,
    personalizedInsight,
    portionAdvice,
    diabeticFriendly,
    heartHealthy,
    healthierAlternatives,
  } = advice;

  const [question, setQuestion] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([]);
  const [isAsking, setIsAsking] = useState(false);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isAsking) return;

    const userText = question.trim();
    setQuestion('');
    setChatLog((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsAsking(true);

    try {
      const reply = await askHealthAdvisorApi({
        question: userText,
        foodContext: foodResult,
        userProfile,
      });
      setChatLog((prev) => [...prev, { sender: 'ai', text: reply }]);
    } catch (err) {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Error contacting clinical dietary service. Please check your network and try again.',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleSpeak = () => {
    speakAdvice(
      `NutriGuard Health Insight: ${personalizedInsight}. Recommended portion: ${portionAdvice}.`
    );
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Personalized Clinical Health Advice</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Goal: <span className="text-cyan-400 font-semibold capitalize">{userProfile.healthGoal.replace('_', ' ')}</span> · Profile: {userProfile.age}y, {userProfile.weightKg}kg
            </p>
          </div>
        </div>

        {/* Read Aloud Button for Accessibility */}
        <button
          onClick={handleSpeak}
          title="Read advice aloud (Web Speech API)"
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <Volume2 className="w-4 h-4" />
          <span className="hidden sm:inline">Read Aloud</span>
        </button>
      </div>

      {/* Goal Alignment Banner */}
      <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-700/40 mb-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 font-mono font-bold flex items-center justify-center shrink-0">
          {goalAlignmentScore}%
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-200">
              {fitForUserGoal ? 'Aligned with your health objectives' : 'Attention: Discrepancy with target goal'}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {personalizedInsight}
          </p>
        </div>
      </div>

      {/* Badges: Diabetic & Heart Health */}
      <div className="grid grid-cols-2 gap-2.5 mb-4 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Diabetic Index</span>
          <span className={`font-semibold flex items-center gap-1 ${diabeticFriendly ? 'text-emerald-400' : 'text-amber-400'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {diabeticFriendly ? 'Low Glycemic Load' : 'Monitor Sugar Intake'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Cardiovascular Risk</span>
          <span className={`font-semibold flex items-center gap-1 ${heartHealthy ? 'text-emerald-400' : 'text-amber-400'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {heartHealthy ? 'Heart Healthy' : 'Elevated Saturated Fats'}
          </span>
        </div>
      </div>

      {/* Portion Guidance */}
      <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 mb-4 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
          Portion Control Directive
        </span>
        <p className="text-slate-200">{portionAdvice}</p>
      </div>

      {/* Healthier Substitutions */}
      {healthierAlternatives && healthierAlternatives.length > 0 && (
        <div className="mb-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Recommended Food Alternatives & Optimizations
          </span>
          <div className="space-y-1.5">
            {healthierAlternatives.map((alt, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center gap-2 text-xs text-slate-300"
              >
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{alt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Clinical Q&A Chat */}
      <div className="pt-3 border-t border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Ask Dietary Advisor About This Meal
        </span>

        {chatLog.length > 0 && (
          <div className="max-h-48 overflow-y-auto space-y-2 mb-3 pr-1 text-xs">
            {chatLog.map((msg, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl ${
                  msg.sender === 'user'
                    ? 'bg-cyan-950/60 border border-cyan-800/50 text-cyan-100 ml-6'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 mr-6'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                  {msg.sender === 'user' ? (
                    <User className="w-3 h-3 text-cyan-400" />
                  ) : (
                    <Bot className="w-3 h-3 text-emerald-400" />
                  )}
                  <span>{msg.sender === 'user' ? 'You' : 'NutriGuard Dietitian AI'}</span>
                </div>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAskQuestion} className="flex items-center gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about allergens, digestion, or fitness impact..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
          <button
            type="submit"
            disabled={!question.trim() || isAsking}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            {isAsking ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
