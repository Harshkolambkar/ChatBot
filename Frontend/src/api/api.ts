import type { Message, Session, UserCreateResponse, User } from '../types';
import { storage } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiError extends Error {
  status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new ApiError(response.status, error.message || 'An unknown error occurred');
  }
  return response.json();
};

export const api = {
  // User related API calls
  async createUser(email: string, password: string, name: string): Promise<UserCreateResponse> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await handleApiResponse(response);
    
    // Store user data immediately after creation
    if (data.id) {
      const user: User = {
        id: data.id,
        email: data.email,
        name: data.name,
      };
      storage.setUser(user);
    }
    
    return data;
  },

  async login(email: string, password: string): Promise<{ user: User; message: string }> {
    const response = await fetch(`${API_BASE_URL}/users/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleApiResponse(response);
    
    if (data.is_valid) {
      // User data is returned directly from the validation endpoint
      const user: User = {
        id: data.id,
        email: data.email,
        name: data.name,
      };
      storage.setUser(user);
      
      return { user, message: data.message };
    }
    
    throw new ApiError(401, data.message);
  },

  async getUser(userId: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    return await response.json();
  },

  async updatePassword(userId: number, oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword
      }),
    });
    return await handleApiResponse(response);
  },

  // Session related API calls
  async getSessions(): Promise<Session[]> {
    const userId = storage.getUserId();
    if (!userId) throw new ApiError(401, 'User not authenticated');
    
    const response = await fetch(`${API_BASE_URL}/sessions/${userId}`);
    const data = await handleApiResponse(response);
    return data.sessions || [];
  },

  async createSession(): Promise<string> {
    const userId = storage.getUserId();
    if (!userId) throw new ApiError(401, 'User not authenticated');
    
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        title: "New Chat"
      }),
    });
    const data = await handleApiResponse(response);
    storage.setStoredSession(data.session_token);
    return data.session_token;
  },

  async deleteSession(sessionToken: string): Promise<void> {
    await fetch(`${API_BASE_URL}/sessions/${sessionToken}`, {
      method: 'DELETE',
    });
    if (storage.getStoredSession() === sessionToken) {
      storage.clearStoredSession();
    }
  },

  async updateSessionName(sessionToken: string, name: string): Promise<void> {
    await fetch(`${API_BASE_URL}/sessions/${sessionToken}/name`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_short_name: name
      }),
    });
  },

  async generateSessionName(sessionToken: string, topic: string): Promise<{ session_name: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionToken}/name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic
      }),
    });
    return await handleApiResponse(response);
  },

  // Chat related API calls
  async getMessages(sessionToken: string): Promise<Message[]> {
    if (!storage.isAuthenticated()) throw new ApiError(401, 'User not authenticated');
    
    const response = await fetch(`${API_BASE_URL}/chat/${sessionToken}`);
    const data = await handleApiResponse(response);
    return data.messages || [];
  },

  async sendMessage(sessionToken: string, message: string): Promise<Message> {
    if (!storage.isAuthenticated()) throw new ApiError(401, 'User not authenticated');
    
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_token: sessionToken,
        message
      }),
    });
    const data = await handleApiResponse(response);
    return {
      id: String(Date.now()),
      messages: data.response,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  },

  // Error handling wrapper
  async handleRequest<T>(request: Promise<T>): Promise<T> {
    try {
      return await request;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};