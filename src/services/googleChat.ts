import { FoodAnalysisResult } from '../types/food';

export interface ChatSpace {
  name: string; // e.g. "spaces/AAAA..."
  displayName?: string;
  type?: 'SPACE' | 'GROUP_CHAT' | 'DIRECT_MESSAGE';
  spaceType?: 'SPACE' | 'GROUP_CHAT' | 'DIRECT_MESSAGE';
  singleUserBotDm?: boolean;
}

export interface ChatMessage {
  name: string;
  text?: string;
  createTime?: string;
  sender?: {
    name?: string;
    displayName?: string;
    avatarUrl?: string;
    type?: string;
  };
}

export interface CommunityRoom {
  id: string;
  name: string;
  description: string;
  topic: 'food_safety' | 'nutrition_tips' | 'allergen_alert' | 'recalls' | 'water_purity' | 'general';
  isPrivate: boolean;
  passcode?: string;
  creatorName: string;
  createdAt: string;
  memberCount: number;
  googleChatSpaceName?: string;
  isOfficial?: boolean;
}

export interface CommunityMessage {
  id: string;
  roomId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  tag?: 'Safety Alert' | 'Nutrition Tip' | 'Recall' | 'Question';
  isAlertCard?: boolean;
}

export const CHAT_APP_CONSOLE_URL =
  'https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat?project=gen-lang-client-0840546765';

const COMMUNITY_ROOMS_KEY = 'nutriguard_community_rooms_v1';
const COMMUNITY_MSGS_KEY = 'nutriguard_community_messages_v1';

export const DEFAULT_COMMUNITY_ROOMS: CommunityRoom[] = [
  {
    id: 'room-safety-alerts',
    name: 'Food Safety & Biotoxins Watch',
    description: 'Active broadcast and peer analysis of suspected poisons, chemical adulterants, and toxic mushroom forages.',
    topic: 'food_safety',
    isPrivate: false,
    creatorName: 'NutriGuard Clinical Lab',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    memberCount: 142,
    isOfficial: true,
  },
  {
    id: 'room-nutrition-tips',
    name: 'Nutrition & Macro Optimization',
    description: 'Peer-reviewed dietary strategies, portion management, diabetic-friendly glycemic swaps, and clean eating habits.',
    topic: 'nutrition_tips',
    isPrivate: false,
    creatorName: 'Dietary Advisory Board',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    memberCount: 98,
    isOfficial: true,
  },
  {
    id: 'room-allergy-shield',
    name: 'Severe Allergens Private Shield',
    description: 'Confidential group for anaphylaxis risk, cross-contact protocol in restaurants, and school allergen safety.',
    topic: 'allergen_alert',
    isPrivate: true,
    passcode: 'SAFEFOOD',
    creatorName: 'Allergy Advocates Network',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    memberCount: 34,
    isOfficial: true,
  },
  {
    id: 'room-water-watch',
    name: 'Municipal & Well Water Purity',
    description: 'Discussions on water filtration, lead pipe detection, TDS ppm calibrations, and boiling water advisories.',
    topic: 'water_purity',
    isPrivate: false,
    creatorName: 'Hydration Quality Group',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    memberCount: 65,
    isOfficial: true,
  },
];

export const INITIAL_COMMUNITY_MESSAGES: Record<string, CommunityMessage[]> = {
  'room-safety-alerts': [
    {
      id: 'msg-01',
      roomId: 'room-safety-alerts',
      authorName: 'Dr. Evelyn Vance (Toxicology)',
      content:
        '⚠️ Caution regarding wild foraged mushrooms in the Pacific Northwest this week. Several samples showed high amatoxin peaks on chromatography. Always verify with spectrometry before consuming any white or pale greenish gill specimens.',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      tag: 'Safety Alert',
      isAlertCard: true,
    },
    {
      id: 'msg-02',
      roomId: 'room-safety-alerts',
      authorName: 'Marcus Miller',
      content:
        'Thanks for the advisory! Just scanned a basket using NutriGuard and it immediately flagged high risk. Preserved the sample in a sealed cooler.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      tag: 'Question',
    },
  ],
  'room-nutrition-tips': [
    {
      id: 'msg-03',
      roomId: 'room-nutrition-tips',
      authorName: 'Sarah Jenkins (RD)',
      content:
        '🥗 Nutrition Tip: When prepping Mediterranean bowls, cold-pressed extra virgin olive oil provides oleocanthal, a natural anti-inflammatory polyphenol. Pair it with dark leafy greens to boost fat-soluble vitamin absorption (A, D, E, K)!',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      tag: 'Nutrition Tip',
    },
    {
      id: 'msg-04',
      roomId: 'room-nutrition-tips',
      authorName: 'David Chen',
      content:
        'What is your go-to low sodium swap for soy sauce or heavy marinades when grilling chicken skewers?',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      tag: 'Question',
    },
  ],
  'room-allergy-shield': [
    {
      id: 'msg-05',
      roomId: 'room-allergy-shield',
      authorName: 'Elena Rostova',
      content:
        '🔒 Private advisory: Always check bulk bakery items for unlisted sesame oil or peanut flour aerosols. A reminder that FALCPA requires explicit labeling on packaged foods, but restaurant kitchens can have cross-contact.',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      tag: 'Safety Alert',
    },
  ],
  'room-water-watch': [
    {
      id: 'msg-06',
      roomId: 'room-water-watch',
      authorName: 'AquaPurity Team',
      content:
        '💧 Reminder: An optimal drinking water TDS level is between 50 and 300 PPM. Over 500 PPM indicates heavy mineral hardness or runoff contamination. Test your tap water monthly!',
      createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
      tag: 'Nutrition Tip',
    },
  ],
};

export class GoogleChatApiError extends Error {
  status: number;
  isAppNotConfigured: boolean;

  constructor(message: string, status: number, isAppNotConfigured: boolean = false) {
    super(message);
    this.name = 'GoogleChatApiError';
    this.status = status;
    this.isAppNotConfigured = isAppNotConfigured;
  }
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    let errBody = '';
    try {
      const json = await res.json();
      errBody = json.error?.message || JSON.stringify(json);
    } catch {
      errBody = await res.text();
    }

    const isAppNotConfigured =
      res.status === 404 ||
      errBody.toLowerCase().includes('google chat app not found') ||
      errBody.toLowerCase().includes('configure the app');

    throw new GoogleChatApiError(
      errBody || `Google Chat API Error (${res.status})`,
      res.status,
      isAppNotConfigured
    );
  }
  return res.json();
}

export async function listChatSpaces(accessToken: string): Promise<ChatSpace[]> {
  const res = await fetch('https://chat.googleapis.com/v1/spaces', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await handleResponse(res);
  return data.spaces || [];
}

export async function listChatMessages(accessToken: string, spaceName: string): Promise<ChatMessage[]> {
  const res = await fetch(
    `https://chat.googleapis.com/v1/${spaceName}/messages?pageSize=25`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await handleResponse(res);
  return data.messages || [];
}

export async function sendChatMessage(
  accessToken: string,
  spaceName: string,
  text: string
): Promise<ChatMessage> {
  const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  return handleResponse(res);
}

export async function createChatSpace(
  accessToken: string,
  displayName: string
): Promise<ChatSpace> {
  const res = await fetch('https://chat.googleapis.com/v1/spaces', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      displayName,
      spaceType: 'SPACE',
    }),
  });
  return handleResponse(res);
}

// Local Storage & Backend DB helpers for Community Rooms & Messages
export async function fetchCommunityRoomsFromBackend(): Promise<CommunityRoom[]> {
  try {
    const res = await fetch('/api/community/rooms');
    const json = await res.json();
    if (json.rooms && Array.isArray(json.rooms)) {
      localStorage.setItem(COMMUNITY_ROOMS_KEY, JSON.stringify(json.rooms));
      return json.rooms;
    }
  } catch (err) {
    console.warn('Backend community rooms fetch failed, falling back to local', err);
  }
  return getStoredCommunityRooms();
}

export function getStoredCommunityRooms(): CommunityRoom[] {
  try {
    const raw = localStorage.getItem(COMMUNITY_ROOMS_KEY);
    if (!raw) {
      localStorage.setItem(COMMUNITY_ROOMS_KEY, JSON.stringify(DEFAULT_COMMUNITY_ROOMS));
      return DEFAULT_COMMUNITY_ROOMS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_COMMUNITY_ROOMS;
  }
}

export async function saveCommunityRoom(room: CommunityRoom) {
  try {
    const existing = getStoredCommunityRooms();
    const updated = [room, ...existing.filter((r) => r.id !== room.id)];
    localStorage.setItem(COMMUNITY_ROOMS_KEY, JSON.stringify(updated));

    // Also persist to backend DB
    await fetch('/api/community/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room),
    });
  } catch (e) {
    console.error('Failed to save community room', e);
  }
}

export async function fetchCommunityMessagesFromBackend(roomId: string): Promise<CommunityMessage[]> {
  try {
    const res = await fetch(`/api/community/rooms/${roomId}/messages`);
    const json = await res.json();
    if (json.messages && Array.isArray(json.messages)) {
      localStorage.setItem(`${COMMUNITY_MSGS_KEY}_${roomId}`, JSON.stringify(json.messages));
      return json.messages;
    }
  } catch (err) {
    console.warn('Backend messages fetch failed, falling back to local', err);
  }
  return getStoredCommunityMessages(roomId);
}

export function getStoredCommunityMessages(roomId: string): CommunityMessage[] {
  try {
    const raw = localStorage.getItem(`${COMMUNITY_MSGS_KEY}_${roomId}`);
    if (!raw) {
      const initial = INITIAL_COMMUNITY_MESSAGES[roomId] || [];
      localStorage.setItem(`${COMMUNITY_MSGS_KEY}_${roomId}`, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_COMMUNITY_MESSAGES[roomId] || [];
  }
}

export function postCommunityMessage(
  msg: Omit<CommunityMessage, 'id' | 'createdAt'>
): CommunityMessage {
  const newMessage: CommunityMessage = {
    ...msg,
    id: `cmsg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  try {
    const existing = getStoredCommunityMessages(msg.roomId);
    const updated = [...existing, newMessage];
    localStorage.setItem(`${COMMUNITY_MSGS_KEY}_${msg.roomId}`, JSON.stringify(updated));

    // Async persist to backend DB
    fetch(`/api/community/rooms/${msg.roomId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMessage),
    }).catch((err) => console.warn('Failed async persist to backend DB', err));
  } catch (e) {
    console.error('Failed saving message', e);
  }

  return newMessage;
}

export function formatFoodSafetyAlertMessage(scan: FoodAnalysisResult): string {
  const isToxic = !scan.isSafe || scan.poisonAnalysis?.detected;

  if (isToxic) {
    return (
      `🚨 *URGENT FOOD SAFETY ALERT — NutriGuard AI*\n\n` +
      `⚠️ *Contaminated Sample Identified:* ${scan.foodName}\n` +
      `☠️ *Poison / Biotoxin:* ${scan.poisonAnalysis?.poisonName || 'Hazardous Contaminant'}\n` +
      `🔬 *Chemical Formula:* ${scan.poisonAnalysis?.chemicalFormula || 'N/A'}\n` +
      `📊 *Concentration:* ${scan.poisonAnalysis?.estimatedConcentrationPpm || 0} PPM\n` +
      `🛡️ *Safety Index:* ${scan.safetyScore}/100 (CRITICAL RISK)\n` +
      `⏱️ *Time Added:* ${scan.poisonAnalysis?.estimatedTimeAdded || 'Recent'}\n\n` +
      `🛑 *Immediate Protocol:* ${scan.poisonAnalysis?.immediateEmergencyMeasures?.[0] || 'Do not consume or taste.'}\n` +
      `🏥 *Antidote / Treatment:* ${scan.poisonAnalysis?.antidoteOrTreatment || 'Seek emergency medical evaluation.'}\n` +
      `📞 *Poison Control Hotline:* 1-800-222-1222\n\n` +
      `_Audit verified by NutriGuard AI Forensic Engine & Cryptographic Vault._`
    );
  }

  return (
    `✅ *FOOD SAFETY INSPECTION REPORT — NutriGuard AI*\n\n` +
    `🥗 *Item:* ${scan.foodName} (${scan.category})\n` +
    `🛡️ *Purity Score:* ${scan.safetyScore}/100 (VERIFIED SAFE)\n` +
    `🔥 *Calories:* ${scan.nutritionalAnalysis?.calories || 0} kcal\n` +
    `💪 *Protein:* ${scan.nutritionalAnalysis?.proteinGrams || 0}g · *Carbs:* ${scan.nutritionalAnalysis?.carbsGrams || 0}g · *Fat:* ${scan.nutritionalAnalysis?.totalFatGrams || 0}g\n` +
    `🌿 *Freshness:* ${scan.spoilageAndExpiry?.daysUntilExpiry || 0} days remaining shelf life\n` +
    `🔗 *Blockchain Provenance:* ${scan.blockchainTraceability?.batchId || 'Verified'}\n\n` +
    `_Logged via NutriGuard AI._`
  );
}
