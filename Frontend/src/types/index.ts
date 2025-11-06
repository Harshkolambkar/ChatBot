export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Session {
  id?: string;
  title?: string;
  timestamp?: string;
  session_token: string;
  session_short_name?: string;
}

export interface Message {
  id: string;
  messages: string;
  sender: "human" | "ai";
  timestamp: string;
}

export interface ChatState {
  sessions: Session[];
  activeSessionId: string;
  messagesBySession: Record<string, Message[]>;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  name: string;
}

export interface UserValidateRequest {
  email: string;
  password: string;
}

export interface UserValidateResponse {
  is_valid: boolean;
  message: string;
}

export interface UserCreateResponse {
  message: string;
  id: number;
  name: string;
  email: string;
}