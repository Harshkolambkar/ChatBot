import { useState, useEffect } from "react";
import { SessionList } from "./components/SessionList";
import { ChatArea } from "./components/ChatArea";
import { RenameSessionDialog } from "./components/RenameSessionDialog";
import { DeleteSessionDialog } from "./components/DeleteSessionDialog";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { AccountSettings } from "./components/AccountSettings";
import { api } from "./api/api";
import type { Session as SessionType } from "./types";

interface Session {
  id: string;
  title: string;
  timestamp: string;
}

interface Message {
  id: string;
  messages: string;
  sender: "human" | "ai";
  timestamp: string;
}

type View = "chat" | "account";

function ChatInterface() {
  const [currentView, setCurrentView] = useState<View>("chat");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [sessionToRename, setSessionToRename] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [messagesBySession, setMessagesBySession] = useState<Record<string, Message[]>>({});

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Load messages when active session changes
  useEffect(() => {
    if (activeSessionId && !messagesBySession[activeSessionId]) {
      loadMessages(activeSessionId);
    }
  }, [activeSessionId]);

  const loadSessions = async () => {
    try {
      const sessionsData = await api.getSessions();
      const formattedSessions = sessionsData.map((s: SessionType) => ({
        id: s.session_token,
        title: s.session_short_name || "New Chat",
        timestamp: "Recently",
      }));
      setSessions(formattedSessions);
      
      if (formattedSessions.length > 0 && !activeSessionId) {
        setActiveSessionId(formattedSessions[0].id);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  };

  const loadMessages = async (sessionToken: string) => {
    try {
      const messages = await api.getMessages(sessionToken);
      setMessagesBySession(prev => ({
        ...prev,
        [sessionToken]: messages
      }));
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessagesBySession(prev => ({
        ...prev,
        [sessionToken]: []
      }));
    }
  };

  const handleNewSession = async () => {
    try {
      const sessionToken = await api.createSession();
      const newSession: Session = {
        id: sessionToken,
        title: "New Chat",
        timestamp: "Just now",
      };
      setSessions([newSession, ...sessions]);
      setMessagesBySession({ ...messagesBySession, [sessionToken]: [] });
      setActiveSessionId(sessionToken);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeSessionId) return;
    
    const newMessage: Message = {
      id: String(Date.now()),
      messages: content,
      sender: "human",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const currentMessages = messagesBySession[activeSessionId] || [];
    const updatedMessages = [...currentMessages, newMessage];

    setMessagesBySession({
      ...messagesBySession,
      [activeSessionId]: updatedMessages,
    });

    try {
      const aiMessage = await api.sendMessage(activeSessionId, content);
      setMessagesBySession(prev => ({
        ...prev,
        [activeSessionId]: [...updatedMessages, aiMessage],
      }));
      
      // Generate session name if this is the first message
      if (updatedMessages.length === 1) {
        try {
          const { session_name } = await api.generateSessionName(activeSessionId, content);
          setSessions(prev => prev.map(s => 
            s.id === activeSessionId 
              ? { ...s, title: session_name }
              : s
          ));
        } catch (error) {
          console.error("Failed to generate session name:", error);
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleRenameSession = (sessionId: string) => {
    setSessionToRename(sessionId);
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = async (newName: string) => {
    if (sessionToRename) {
      try {
        await api.updateSessionName(sessionToRename, newName);
        setSessions(sessions.map(session => 
          session.id === sessionToRename 
            ? { ...session, title: newName }
            : session
        ));
        setRenameDialogOpen(false);
      } catch (error) {
        console.error("Failed to rename session:", error);
      }
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (sessionToDelete) {
      try {
        await api.deleteSession(sessionToDelete);
        
        // Remove the session
        setSessions(sessions.filter(session => session.id !== sessionToDelete));
        
        // Remove the messages for this session
        const { [sessionToDelete]: _, ...remainingMessages } = messagesBySession;
        setMessagesBySession(remainingMessages);
        
        // If the deleted session was active, switch to another session
        if (activeSessionId === sessionToDelete) {
          const remainingSessions = sessions.filter(s => s.id !== sessionToDelete);
          if (remainingSessions.length > 0) {
            setActiveSessionId(remainingSessions[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to delete session:", error);
      }
    }
    setDeleteDialogOpen(false);
  };

  // Show account settings if that view is selected
  if (currentView === "account") {
    return <AccountSettings onBack={() => setCurrentView("chat")} />;
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <div className="w-80 flex-shrink-0">
          <SessionList
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSessionSelect={setActiveSessionId}
            onNewSession={handleNewSession}
            onRenameSession={handleRenameSession}
            onDeleteSession={handleDeleteSession}
            onAccountSettings={() => setCurrentView("account")}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatArea
            messages={messagesBySession[activeSessionId] || []}
            onSendMessage={handleSendMessage}
            sessionTitle={sessions.find(s => s.id === activeSessionId)?.title || "Chat"}
          />
        </div>
      </div>
      <RenameSessionDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        currentName={sessions.find(s => s.id === sessionToRename)?.title || ""}
        onRename={handleRenameSubmit}
      />
      <DeleteSessionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        sessionName={sessions.find(s => s.id === sessionToDelete)?.title || ""}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [authView, setAuthView] = useState<"login" | "signup">("login");

  // If not authenticated, show login/signup
  if (!isAuthenticated) {
    return authView === "login" ? (
      <Login onSwitchToSignup={() => setAuthView("signup")} />
    ) : (
      <Signup onSwitchToLogin={() => setAuthView("login")} />
    );
  }

  // Show chat interface if authenticated
  return <ChatInterface />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
