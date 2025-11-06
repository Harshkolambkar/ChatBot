import { useState, useEffect } from 'react';
import type { Session, Message, ChatState } from '../types';
import { api } from '../api/api';
import { storage } from '../utils/storage';

const useChat = () => {
  const [state, setState] = useState<ChatState>({
    sessions: [],
    activeSessionId: storage.getStoredSession() || '',
    messagesBySession: {},
  });

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Load messages when active session changes
  useEffect(() => {
    if (state.activeSessionId) {
      loadMessages(state.activeSessionId);
    }
  }, [state.activeSessionId]);

  const loadSessions = async () => {
    try {
      const sessions = await api.handleRequest(api.getSessions());
      setState(prev => ({
        ...prev,
        sessions,
      }));
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadMessages = async (sessionToken: string) => {
    try {
      const messages = await api.handleRequest(api.getMessages(sessionToken));
      setState(prev => ({
        ...prev,
        messagesBySession: {
          ...prev.messagesBySession,
          [sessionToken]: messages,
        },
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleNewSession = async () => {
    try {
      const sessionToken = await api.handleRequest(api.createSession());
      const newSession: Session = {
        id: sessionToken,
        title: "New Chat",
        timestamp: new Date().toLocaleString(),
        session_token: sessionToken,
      };
      setState(prev => ({
        ...prev,
        sessions: [newSession, ...prev.sessions],
        messagesBySession: { ...prev.messagesBySession, [sessionToken]: [] },
        activeSessionId: sessionToken,
      }));
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!state.activeSessionId) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = {
      id: String(Date.now()),
      messages: content,
      sender: 'human',
      timestamp,
    };

    // Add user message first
    setState(prev => ({
      ...prev,
      messagesBySession: {
        ...prev.messagesBySession,
        [prev.activeSessionId]: [
          ...(prev.messagesBySession[prev.activeSessionId] || []),
          userMessage
        ],
      },
    }));

    try {
      // Send message and get AI response
      const aiResponse = await api.handleRequest(
        api.sendMessage(state.activeSessionId, content)
      );

      // Add AI response
      setState(prev => ({
        ...prev,
        messagesBySession: {
          ...prev.messagesBySession,
          [prev.activeSessionId]: [
            ...(prev.messagesBySession[prev.activeSessionId] || []),
            aiResponse
          ],
        },
      }));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const setActiveSessionId = (sessionToken: string) => {
    storage.setStoredSession(sessionToken);
    setState(prev => ({ ...prev, activeSessionId: sessionToken }));
  };

  const handleDeleteSession = async (sessionToken: string) => {
    try {
      await api.handleRequest(api.deleteSession(sessionToken));
      // Clear the deleted session from state
      setState(prev => ({
        ...prev,
        messagesBySession: Object.fromEntries(
          Object.entries(prev.messagesBySession).filter(([key]) => key !== sessionToken)
        ),
        activeSessionId: prev.activeSessionId === sessionToken ? '' : prev.activeSessionId,
      }));
      // Refresh the sessions list
      await loadSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handleRenameSession = async (sessionToken: string, newName: string) => {
    try {
      await api.handleRequest(api.updateSessionName(sessionToken, newName));
      setState(prev => ({
        ...prev,
        sessions: prev.sessions.map(session =>
          session.session_token === sessionToken
            ? { ...session, session_short_name: newName }
            : session
        ),
      }));
    } catch (error) {
      console.error('Error renaming session:', error);
    }
  };

  return {
    sessions: state.sessions,
    activeSessionId: state.activeSessionId,
    messagesBySession: state.messagesBySession,
    handleNewSession,
    handleSendMessage,
    setActiveSessionId,
    handleDeleteSession,
    handleRenameSession,
  };
};

export default useChat;