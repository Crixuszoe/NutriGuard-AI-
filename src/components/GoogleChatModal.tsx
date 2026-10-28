import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Plus,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Users,
  ShieldAlert,
  LogOut,
  Sparkles,
  Lock,
  Globe,
  Salad,
  Flame,
  Key,
  Tag,
  Share2,
  ChevronRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logoutGoogle,
  initAuth,
} from '../services/googleAuth';
import {
  ChatSpace,
  ChatMessage,
  CommunityRoom,
  CommunityMessage,
  listChatSpaces,
  listChatMessages,
  sendChatMessage,
  createChatSpace,
  getStoredCommunityRooms,
  fetchCommunityRoomsFromBackend,
  saveCommunityRoom,
  getStoredCommunityMessages,
  fetchCommunityMessagesFromBackend,
  postCommunityMessage,
  formatFoodSafetyAlertMessage,
  CHAT_APP_CONSOLE_URL,
  GoogleChatApiError,
} from '../services/googleChat';
import { FoodAnalysisResult } from '../types/food';

interface GoogleChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScan?: FoodAnalysisResult | null;
}

export const GoogleChatModal: React.FC<GoogleChatModalProps> = ({
  isOpen,
  onClose,
  currentScan,
}) => {
  // Main view tab: 'community' (Public/Private rooms for food safety & nutrition tips) vs 'workspace' (Google Chat Spaces)
  const [activeMainTab, setActiveMainTab] = useState<'community' | 'workspace'>('community');

  // Google Auth & Workspace state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [spaces, setSpaces] = useState<ChatSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<ChatSpace | null>(null);
  const [workspaceMessages, setWorkspaceMessages] = useState<ChatMessage[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const [isLoadingWorkspaceMessages, setIsLoadingWorkspaceMessages] = useState(false);
  const [workspaceInput, setWorkspaceInput] = useState('');

  // Community Support state
  const [communityRooms, setCommunityRooms] = useState<CommunityRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<CommunityRoom | null>(null);
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>([]);
  const [roomFilter, setRoomFilter] = useState<'all' | 'public' | 'private' | 'safety' | 'nutrition'>('all');
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [communityInput, setCommunityInput] = useState('');
  const [selectedMessageTag, setSelectedMessageTag] = useState<'Nutrition Tip' | 'Safety Alert' | 'Question'>('Nutrition Tip');

  // Private room passcode challenge
  const [unlockedRoomIds, setUnlockedRoomIds] = useState<string[]>([]);
  const [passcodeAttempt, setPasscodeAttempt] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  // Room Creation Modal state
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [newRoomTopic, setNewRoomTopic] = useState<CommunityRoom['topic']>('food_safety');
  const [newRoomIsPrivate, setNewRoomIsPrivate] = useState(false);
  const [newRoomPasscode, setNewRoomPasscode] = useState('');
  const [newRoomSyncWorkspace, setNewRoomSyncWorkspace] = useState(false);

  // Explicit confirmation dialog state for sending messages
  const [pendingAction, setPendingAction] = useState<{
    type: 'workspace_message' | 'workspace_alert' | 'community_message' | 'community_alert';
    text: string;
    targetName: string;
    targetId: string;
    tag?: CommunityMessage['tag'];
  } | null>(null);

  // Notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Initialize data on open
  useEffect(() => {
    if (isOpen) {
      loadCommunityRooms();
      initAuth(
        (user, token) => {
          setCurrentUser(user);
          setAccessToken(token);
          loadWorkspaceSpaces(token);
        },
        () => {
          setCurrentUser(null);
          setAccessToken(null);
          setSpaces([]);
          setSelectedSpace(null);
        }
      );
    }
  }, [isOpen]);

  const loadCommunityRooms = async () => {
    const localRooms = getStoredCommunityRooms();
    setCommunityRooms(localRooms);
    if (localRooms.length > 0 && !selectedRoom) {
      handleSelectRoom(localRooms[0]);
    }
    // Sync with persistent backend database
    const dbRooms = await fetchCommunityRoomsFromBackend();
    if (dbRooms && dbRooms.length > 0) {
      setCommunityRooms(dbRooms);
    }
  };

  const handleSelectRoom = async (room: CommunityRoom) => {
    setSelectedRoom(room);
    setPasscodeError(false);
    setPasscodeAttempt('');
    // Load messages if public or already unlocked
    if (!room.isPrivate || unlockedRoomIds.includes(room.id)) {
      setCommunityMessages(getStoredCommunityMessages(room.id));
      const backendMsgs = await fetchCommunityMessagesFromBackend(room.id);
      if (backendMsgs) {
        setCommunityMessages(backendMsgs);
      }
    } else {
      setCommunityMessages([]);
    }
  };

  const handleUnlockPrivateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    if (passcodeAttempt.trim().toUpperCase() === (selectedRoom.passcode || 'SAFEFOOD').toUpperCase()) {
      setUnlockedRoomIds((prev) => [...prev, selectedRoom.id]);
      setCommunityMessages(getStoredCommunityMessages(selectedRoom.id));
      setPasscodeError(false);
      setSuccessNotice(`Unlocked private room "${selectedRoom.name}"`);
      setTimeout(() => setSuccessNotice(null), 3000);
    } else {
      setPasscodeError(true);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        await loadWorkspaceSpaces(res.accessToken);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setErrorMessage(err.message || 'Google Sign-In failed');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setCurrentUser(null);
    setAccessToken(null);
    setSpaces([]);
    setSelectedSpace(null);
    setWorkspaceMessages([]);
  };

  const loadWorkspaceSpaces = async (token: string) => {
    setIsLoadingSpaces(true);
    setErrorMessage(null);
    setIsConfigError(false);
    try {
      const sp = await listChatSpaces(token);
      setSpaces(sp);
      if (sp.length > 0 && !selectedSpace) {
        selectWorkspaceSpace(sp[0], token);
      }
    } catch (err: any) {
      console.error('Error fetching workspace spaces:', err);
      if (err instanceof GoogleChatApiError && err.isAppNotConfigured) {
        setIsConfigError(true);
        setErrorMessage(
          'Google Chat App Configuration is required in the Google Cloud Console before calling the Chat API with user credentials.'
        );
      } else {
        setErrorMessage(
          err.message ||
            'Note: Google Chat spaces require a Google Workspace account (business/enterprise).'
        );
      }
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  const selectWorkspaceSpace = async (space: ChatSpace, tokenToUse?: string) => {
    setSelectedSpace(space);
    const token = tokenToUse || accessToken;
    if (!token) return;

    setIsLoadingWorkspaceMessages(true);
    try {
      const msgs = await listChatMessages(token, space.name);
      setWorkspaceMessages(msgs.reverse());
    } catch (err: any) {
      console.error('Error loading messages:', err);
      if (err instanceof GoogleChatApiError && err.isAppNotConfigured) {
        setIsConfigError(true);
      }
    } finally {
      setIsLoadingWorkspaceMessages(false);
    }
  };

  // Prompt actions with mandatory explicit confirmation
  const promptPostCommunityMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityInput.trim() || !selectedRoom) return;

    setPendingAction({
      type: 'community_message',
      text: communityInput.trim(),
      targetName: selectedRoom.name,
      targetId: selectedRoom.id,
      tag: selectedMessageTag,
    });
  };

  const promptShareScanToCommunity = () => {
    if (!currentScan || !selectedRoom) return;
    const alertMsg = formatFoodSafetyAlertMessage(currentScan);

    setPendingAction({
      type: 'community_alert',
      text: alertMsg,
      targetName: selectedRoom.name,
      targetId: selectedRoom.id,
      tag: currentScan.isSafe ? 'Nutrition Tip' : 'Safety Alert',
    });
  };

  const promptPostWorkspaceMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceInput.trim() || !selectedSpace) return;

    setPendingAction({
      type: 'workspace_message',
      text: workspaceInput.trim(),
      targetName: selectedSpace.displayName || 'Direct Space',
      targetId: selectedSpace.name,
    });
  };

  const promptShareScanToWorkspace = () => {
    if (!currentScan || !selectedSpace) return;
    const alertMsg = formatFoodSafetyAlertMessage(currentScan);

    setPendingAction({
      type: 'workspace_alert',
      text: alertMsg,
      targetName: selectedSpace.displayName || 'Current Space',
      targetId: selectedSpace.name,
    });
  };

  // Execute confirmed action
  const confirmAndExecuteAction = async () => {
    if (!pendingAction) return;

    setIsSending(true);
    try {
      if (pendingAction.type === 'community_message' || pendingAction.type === 'community_alert') {
        const authorName = currentUser?.displayName || 'Community Member';
        postCommunityMessage({
          roomId: pendingAction.targetId,
          authorName,
          content: pendingAction.text,
          tag: pendingAction.tag || 'Nutrition Tip',
          isAlertCard: pendingAction.type === 'community_alert',
        });

        // If also connected to workspace and synced, send to workspace space too
        if (selectedRoom?.googleChatSpaceName && accessToken) {
          try {
            await sendChatMessage(accessToken, selectedRoom.googleChatSpaceName, pendingAction.text);
          } catch (syncErr) {
            console.warn('Workspace mirror sync failed:', syncErr);
          }
        }

        setCommunityMessages(getStoredCommunityMessages(pendingAction.targetId));
        setCommunityInput('');
        setSuccessNotice('Message shared to community room!');
      } else {
        if (!accessToken) throw new Error('Not connected to Google Workspace');
        await sendChatMessage(accessToken, pendingAction.targetId, pendingAction.text);

        const msgs = await listChatMessages(accessToken, pendingAction.targetId);
        setWorkspaceMessages(msgs.reverse());
        setWorkspaceInput('');
        setSuccessNotice('Posted to Google Chat space!');
      }

      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err: any) {
      console.error('Execution error:', err);
      setErrorMessage(err.message || 'Action failed.');
    } finally {
      setIsSending(false);
      setPendingAction(null);
    }
  };

  const handleCreateRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const newRoom: CommunityRoom = {
      id: `room-${Date.now().toString(36)}`,
      name: newRoomName.trim(),
      description: newRoomDesc.trim() || 'Community room for food safety alerts and nutrition tips.',
      topic: newRoomTopic,
      isPrivate: newRoomIsPrivate,
      passcode: newRoomIsPrivate ? (newRoomPasscode.trim() || 'SAFEFOOD') : undefined,
      creatorName: currentUser?.displayName || 'Community Host',
      createdAt: new Date().toISOString(),
      memberCount: 1,
      googleChatSpaceName: newRoomSyncWorkspace && selectedSpace ? selectedSpace.name : undefined,
    };

    saveCommunityRoom(newRoom);
    const updatedRooms = getStoredCommunityRooms();
    setCommunityRooms(updatedRooms);

    // Auto unlock own room
    if (newRoom.isPrivate) {
      setUnlockedRoomIds((prev) => [...prev, newRoom.id]);
    }

    handleSelectRoom(newRoom);
    setShowCreateRoomModal(false);
    setNewRoomName('');
    setNewRoomDesc('');
    setNewRoomPasscode('');
    setSuccessNotice(`Community room "${newRoom.name}" created!`);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  if (!isOpen) return null;

  // Filter community rooms
  const filteredRooms = communityRooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(roomSearchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(roomSearchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (roomFilter === 'public') return !r.isPrivate;
    if (roomFilter === 'private') return r.isPrivate;
    if (roomFilter === 'safety') return r.topic === 'food_safety' || r.topic === 'allergen_alert' || r.topic === 'recalls';
    if (roomFilter === 'nutrition') return r.topic === 'nutrition_tips' || r.topic === 'water_purity';
    return true;
  });

  const isCurrentRoomUnlocked = !selectedRoom?.isPrivate || (selectedRoom && unlockedRoomIds.includes(selectedRoom.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Main Header & Dual Tab Navigation */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">Community Support & Google Chat</h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Live Rooms
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Discuss food safety alerts, discuss nutrition tips, or connect Google Workspace spaces
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary Tab Switcher */}
        <div className="px-5 pt-3 pb-2.5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveMainTab('community')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeMainTab === 'community'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Community Support Rooms</span>
            </button>

            <button
              onClick={() => setActiveMainTab('workspace')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeMainTab === 'workspace'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Google Workspace Spaces</span>
            </button>
          </div>

          {activeMainTab === 'community' && (
            <button
              onClick={() => setShowCreateRoomModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Create Room</span>
            </button>
          )}
        </div>

        {/* Global Notifications */}
        {successNotice && (
          <div className="px-4 py-2 bg-emerald-950/70 border-b border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successNotice}</span>
          </div>
        )}

        {errorMessage && (
          <div className="px-4 py-2 bg-rose-950/70 border-b border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: Community Support (Public & Private Rooms) */}
        {activeMainTab === 'community' && (
          <div className="flex-1 flex flex-col md:flex-row min-h-0">
            {/* Rooms Sidebar */}
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col bg-slate-950/40">
              {/* Search & Filter pills */}
              <div className="p-3 border-b border-slate-850 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={roomSearchQuery}
                    onChange={(e) => setRoomSearchQuery(e.target.value)}
                    placeholder="Search safety & nutrition rooms..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[11px]">
                  <button
                    onClick={() => setRoomFilter('all')}
                    className={`px-2 py-0.5 rounded-lg font-semibold shrink-0 transition ${
                      roomFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All ({communityRooms.length})
                  </button>
                  <button
                    onClick={() => setRoomFilter('public')}
                    className={`px-2 py-0.5 rounded-lg font-semibold shrink-0 transition ${
                      roomFilter === 'public' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Public
                  </button>
                  <button
                    onClick={() => setRoomFilter('private')}
                    className={`px-2 py-0.5 rounded-lg font-semibold shrink-0 transition ${
                      roomFilter === 'private' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Private
                  </button>
                  <button
                    onClick={() => setRoomFilter('safety')}
                    className={`px-2 py-0.5 rounded-lg font-semibold shrink-0 transition ${
                      roomFilter === 'safety' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Safety
                  </button>
                  <button
                    onClick={() => setRoomFilter('nutrition')}
                    className={`px-2 py-0.5 rounded-lg font-semibold shrink-0 transition ${
                      roomFilter === 'nutrition' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Nutrition
                  </button>
                </div>
              </div>

              {/* Rooms List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {filteredRooms.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    No community rooms found. Click "+ Create Room" to start one.
                  </div>
                ) : (
                  filteredRooms.map((room) => {
                    const isSelected = selectedRoom?.id === room.id;
                    const isUnlocked = !room.isPrivate || unlockedRoomIds.includes(room.id);

                    return (
                      <button
                        key={room.id}
                        onClick={() => handleSelectRoom(room)}
                        className={`w-full p-3 rounded-2xl text-left transition flex items-start justify-between gap-2.5 border ${
                          isSelected
                            ? 'bg-slate-850/90 border-emerald-500/60 ring-1 ring-emerald-500/30'
                            : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-850'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            {room.isPrivate ? (
                              <span className="p-1 rounded-md bg-purple-500/20 text-purple-300" title="Private Room">
                                <Lock className="w-3 h-3" />
                              </span>
                            ) : (
                              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-300" title="Public Room">
                                <Globe className="w-3 h-3" />
                              </span>
                            )}
                            <h4 className="font-bold text-xs text-slate-200 truncate">{room.name}</h4>
                          </div>

                          <p className="text-[11px] text-slate-400 line-clamp-1">{room.description}</p>

                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1.5">
                            <span className="capitalize">{room.topic.replace('_', ' ')}</span>
                            <span>·</span>
                            <span>{room.memberCount} members</span>
                            {room.isPrivate && !isUnlocked && (
                              <span className="text-purple-400 font-semibold">· Locked</span>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 mt-2" />
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Room Chat Viewport */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-900/40">
              {selectedRoom ? (
                <>
                  {/* Room Banner */}
                  <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/40">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-100 truncate">{selectedRoom.name}</h4>
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                            selectedRoom.isPrivate
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {selectedRoom.isPrivate ? 'Private Room' : 'Public Community'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{selectedRoom.description}</p>
                    </div>

                    {/* Share Current Scan Trigger */}
                    {currentScan && isCurrentRoomUnlocked && (
                      <button
                        onClick={promptShareScanToCommunity}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition shrink-0"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share Current Scan</span>
                      </button>
                    )}
                  </div>

                  {/* Private Room Passcode Screen if locked */}
                  {!isCurrentRoomUnlocked ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-14 h-14 rounded-3xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-3">
                        <Lock className="w-7 h-7" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-100">Private Community Room</h4>
                      <p className="text-xs text-slate-400 max-w-sm mt-1">
                        This discussion room is restricted for sensitive dietary advice or verified food safety teams.
                        Enter the room passcode to join.
                      </p>

                      <form onSubmit={handleUnlockPrivateRoom} className="mt-4 flex items-center gap-2 max-w-xs w-full">
                        <input
                          type="password"
                          value={passcodeAttempt}
                          onChange={(e) => setPasscodeAttempt(e.target.value)}
                          placeholder="Passcode (Default: SAFEFOOD)"
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-purple-500 outline-none"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
                        >
                          Unlock
                        </button>
                      </form>

                      {passcodeError && (
                        <p className="text-rose-400 text-[11px] mt-2 font-medium">
                          Incorrect passcode. Try again or request access from room host.
                        </p>
                      )}
                    </div>
                  ) : (
                    /* Unlocked Message Thread */
                    <>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                        {communityMessages.length === 0 ? (
                          <div className="h-40 flex flex-col items-center justify-center text-center text-slate-500">
                            <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
                            <p className="font-semibold text-slate-300">Room is Ready for Discussion</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Be the first to share a nutrition tip or food safety update below!
                            </p>
                          </div>
                        ) : (
                          communityMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`p-3.5 rounded-2xl border transition ${
                                msg.isAlertCard
                                  ? 'bg-rose-950/40 border-rose-800/60'
                                  : msg.tag === 'Nutrition Tip'
                                  ? 'bg-amber-950/20 border-amber-800/40'
                                  : 'bg-slate-950/70 border-slate-800/80'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-200">{msg.authorName}</span>
                                  {msg.tag && (
                                    <span
                                      className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                                        msg.tag === 'Safety Alert'
                                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                          : msg.tag === 'Nutrition Tip'
                                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                          : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                      }`}
                                    >
                                      {msg.tag}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Community Message Composer */}
                      <form onSubmit={promptPostCommunityMessage} className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/60">
                        {/* Tag selectors */}
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-slate-500 font-medium">Tag message:</span>
                          <button
                            type="button"
                            onClick={() => setSelectedMessageTag('Nutrition Tip')}
                            className={`px-2 py-0.5 rounded-lg font-semibold transition ${
                              selectedMessageTag === 'Nutrition Tip'
                                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Nutrition Tip
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedMessageTag('Safety Alert')}
                            className={`px-2 py-0.5 rounded-lg font-semibold transition ${
                              selectedMessageTag === 'Safety Alert'
                                ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Safety Alert
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedMessageTag('Question')}
                            className={`px-2 py-0.5 rounded-lg font-semibold transition ${
                              selectedMessageTag === 'Question'
                                ? 'bg-sky-500/30 text-sky-300 border border-sky-500/50'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Question
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={communityInput}
                            onChange={(e) => setCommunityInput(e.target.value)}
                            placeholder={`Post to #${selectedRoom.name}...`}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 outline-none"
                          />
                          <button
                            type="submit"
                            disabled={!communityInput.trim() || isSending}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Post</span>
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </>
              ) : (
                <div className="h-full flex items-center justify-center p-6 text-slate-500 text-xs">
                  Select a community room to view discussion.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Google Workspace Chat Spaces */}
        {activeMainTab === 'workspace' && (
          <div className="flex-1 flex flex-col min-h-0">
            {!currentUser || !accessToken ? (
              <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow-inner">
                  <MessageSquare className="w-8 h-8 text-emerald-400" />
                </div>

                <div className="max-w-md">
                  <h4 className="text-base font-bold text-slate-100">
                    Connect Google Workspace Account
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Authenticate to broadcast food safety hazards and recall warnings directly into
                    your enterprise Google Chat spaces with your permission.
                  </p>
                </div>

                {/* Official Sign In with Google Button Pattern from skill */}
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="mt-2 flex items-center justify-center gap-3 px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-850 font-semibold text-xs shadow-lg transition active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span className="text-slate-800">
                    {isSigningIn ? 'Connecting...' : 'Sign in with Google'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col md:flex-row min-h-0">
                {/* Account Bar */}
                <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col bg-slate-950/40">
                  <div className="p-3 border-b border-slate-850 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400 uppercase text-[10px]">
                      Google Chat Spaces ({spaces.length})
                    </span>
                    <button
                      onClick={() => loadWorkspaceSpaces(accessToken)}
                      title="Refresh Spaces"
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSpaces ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
                    {spaces.map((sp) => {
                      const isSelected = selectedSpace?.name === sp.name;
                      return (
                        <button
                          key={sp.name}
                          onClick={() => selectWorkspaceSpace(sp)}
                          className={`w-full p-2.5 rounded-xl text-left transition flex items-center gap-2 text-xs ${
                            isSelected
                              ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30'
                              : 'text-slate-300 hover:bg-slate-850'
                          }`}
                        >
                          <Users className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          <span className="truncate">{sp.displayName || sp.name.replace('spaces/', 'Space ')}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-2 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate">{currentUser.displayName || currentUser.email}</span>
                    <button onClick={handleSignOut} className="text-rose-400 hover:underline">
                      Disconnect
                    </button>
                  </div>
                </div>

                {/* Workspace Space Viewer */}
                <div className="flex-1 flex flex-col min-h-0 bg-slate-900/40">
                  {selectedSpace ? (
                    <>
                      <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
                        <div>
                          <h4 className="font-bold text-slate-200">{selectedSpace.displayName || 'Direct Space'}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">{selectedSpace.name}</span>
                        </div>

                        {currentScan && (
                          <button
                            onClick={promptShareScanToWorkspace}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Share Food Alert</span>
                          </button>
                        )}
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                        {workspaceMessages.length === 0 ? (
                          <div className="h-32 flex items-center justify-center text-slate-500">
                            No recent messages in this space.
                          </div>
                        ) : (
                          workspaceMessages.map((m, i) => (
                            <div key={m.name || i} className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-slate-200">{m.sender?.displayName || 'User'}</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {m.createTime ? new Date(m.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                              </div>
                              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{m.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <form onSubmit={promptPostWorkspaceMessage} className="p-3 border-t border-slate-800 flex items-center gap-2">
                        <input
                          type="text"
                          value={workspaceInput}
                          onChange={(e) => setWorkspaceInput(e.target.value)}
                          placeholder={`Message ${selectedSpace.displayName || 'space'}...`}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 outline-none"
                        />
                        <button
                          type="submit"
                          disabled={!workspaceInput.trim() || isSending}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center p-6 text-slate-500 text-xs">
                      Select a Google Chat space to begin.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: Mandatory Explicit Confirmation Dialog */}
        {pendingAction && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">
                    Confirm Posting to "{pendingAction.targetName}"
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Please confirm that you want to publish this message to the destination room.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 max-h-40 overflow-y-auto text-xs text-slate-300 font-mono whitespace-pre-wrap">
                {pendingAction.text}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPendingAction(null)}
                  disabled={isSending}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmAndExecuteAction}
                  disabled={isSending}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition"
                >
                  {isSending ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isSending ? 'Sending...' : 'Confirm & Publish'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Create Community Room (Public or Private) */}
        {showCreateRoomModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <form
              onSubmit={handleCreateRoomSubmit}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3.5 text-xs"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-100">Create Community Support Room</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set up a public or private room to discuss food safety alerts and nutrition tips.
                </p>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Room Title</label>
                <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. Organic Produce & Toxin Watch"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  placeholder="What is this community room focused on?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Primary Topic</label>
                  <select
                    value={newRoomTopic}
                    onChange={(e: any) => setNewRoomTopic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 outline-none"
                  >
                    <option value="food_safety">Food Safety & Toxins</option>
                    <option value="nutrition_tips">Nutrition & Diet Tips</option>
                    <option value="allergen_alert">Allergen Protection</option>
                    <option value="recalls">Food Recalls & Alerts</option>
                    <option value="water_purity">Water Quality & Testing</option>
                    <option value="general">General Discussion</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Room Privacy</label>
                  <select
                    value={newRoomIsPrivate ? 'private' : 'public'}
                    onChange={(e) => setNewRoomIsPrivate(e.target.value === 'private')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 outline-none"
                  >
                    <option value="public">Public (Open to All)</option>
                    <option value="private">Private (Passcode Protected)</option>
                  </select>
                </div>
              </div>

              {newRoomIsPrivate && (
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Passcode / Access Key (Share with members)
                  </label>
                  <input
                    type="text"
                    value={newRoomPasscode}
                    onChange={(e) => setNewRoomPasscode(e.target.value)}
                    placeholder="Enter custom room key (e.g. SAFE2026)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-purple-500 outline-none"
                  />
                </div>
              )}

              {selectedSpace && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-slate-200 block text-[11px]">Sync with Google Chat Space</span>
                    <span className="text-[10px] text-slate-500 truncate block">Mirror updates to "{selectedSpace.displayName}"</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newRoomSyncWorkspace}
                    onChange={(e) => setNewRoomSyncWorkspace(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateRoomModal(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newRoomName.trim()}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition disabled:opacity-50"
                >
                  Create Community Room
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
