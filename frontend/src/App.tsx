import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ContextPanel } from './components/ContextPanel';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { MemoryModal } from './components/MemoryModal';
import { SettingsModal } from './components/SettingsModal';
import { PrivacyModal } from './components/PrivacyModal';
import { CrisisHelpModal } from './components/CrisisHelpModal';
import { HavenLogo } from './components/HavenLogo';
import type { Conversation, Message } from './types';
import { api } from './services/api';

const MainApp: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);
  const [contextOpen, setContextOpen] = useState(window.innerWidth >= 1200);
  const [extractedMemory, setExtractedMemory] = useState<string | null>(null);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);

  // Apply theme when user settings change
  useEffect(() => {
    if (user?.settings?.theme) {
      document.documentElement.setAttribute('data-theme', user.settings.theme);
    }
  }, [user?.settings?.theme]);

  // Adjust sidebar/context panel on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 900) {
        setSidebarOpen(false);
      }
      if (window.innerWidth < 1200) {
        setContextOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load conversations when authenticated
  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
      if (data.length > 0 && !activeConversationId) {
        // Load latest conversation by default
        loadConversationDetails(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    } else {
      setConversations([]);
      setMessages([]);
      setActiveConversationId(undefined);
    }
  }, [isAuthenticated]);

  const loadConversationDetails = async (id: string) => {
    setActiveConversationId(id);
    try {
      const detail = await api.getConversationDetail(id);
      setMessages(detail.messages);
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
    }
  };

  const handleNewConversation = () => {
    setActiveConversationId(undefined);
    setMessages([]);
    setExtractedMemory(null);
  };

  const handleSendMessage = async (text: string) => {
    // Optimistic user message preview
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversationId || 'new',
      sender: 'user',
      content: text,
      safety_flag: 'normal',
      escalation_triggered: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setChatLoading(true);

    try {
      const res = await api.sendMessage(text, activeConversationId);

      // Update active conversation ID if it was newly created
      if (!activeConversationId || activeConversationId !== res.conversation_id) {
        setActiveConversationId(res.conversation_id);
        await loadConversations();
      }

      // Replace optimistic message and append assistant response
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        res.user_message,
        res.assistant_message,
      ]);

      if (res.extracted_memory) {
        setExtractedMemory(res.extracted_memory);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        conversation_id: activeConversationId || 'err',
        sender: 'assistant',
        content: `I'm having a brief issue connecting. (${err.message || 'Please check your connection'}). Take your time, and try again in a moment.`,
        safety_flag: 'normal',
        escalation_triggered: false,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      const updated = await api.updateConversation(id, newTitle);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: updated.title } : c))
      );
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        handleNewConversation();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleChatCleared = () => {
    setMessages([]);
  };

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  if (isLoading) {
    return (
      <div className="haven-loading-screen">
        <div className="haven-loading-box">
          <div className="haven-loading-logo">
            <HavenLogo size={52} showText={false} variant="white" />
          </div>
          <span className="haven-loading-text">Opening your sanctuary...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar
        onOpenMemory={() => setIsMemoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenCrisis={() => setIsCrisisOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {isAuthenticated ? (
        <div className="main-workspace">
          {/* Left Column: Sidebar Navigation */}
          <Sidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={loadConversationDetails}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            onRenameConversation={handleRenameConversation}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Center Column: Chat Conversation Space */}
          <ChatArea
            messages={messages}
            loading={chatLoading}
            onSendMessage={handleSendMessage}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onOpenMemory={() => setIsMemoryOpen(true)}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
            onOpenCrisis={() => setIsCrisisOpen(true)}
            extractedMemory={extractedMemory}
            onDismissMemory={() => setExtractedMemory(null)}
            activeConversationTitle={activeConv?.title}
            onToggleContext={() => setContextOpen(!contextOpen)}
            isContextOpen={contextOpen}
          />

          {/* Right Column: Desktop Context / Presence Panel */}
          <ContextPanel
            isOpen={contextOpen}
            onClose={() => setContextOpen(false)}
            onOpenMemory={() => setIsMemoryOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
            onOpenCrisis={() => setIsCrisisOpen(true)}
            extractedMemory={extractedMemory}
          />
        </div>
      ) : (
        <LandingPage
          onStartChat={() => setIsAuthOpen(true)}
          onOpenCrisis={() => setIsCrisisOpen(true)}
        />
      )}

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <MemoryModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        activeConversationId={activeConversationId}
        onChatCleared={handleChatCleared}
        onConversationDeleted={() => {
          if (activeConversationId) {
            handleDeleteConversation(activeConversationId);
          }
        }}
      />

      <CrisisHelpModal
        isOpen={isCrisisOpen}
        onClose={() => setIsCrisisOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
