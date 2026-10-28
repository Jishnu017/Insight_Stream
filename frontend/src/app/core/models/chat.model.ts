export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface DocumentListResponse {
  files: string[];
}

export interface ChatResponse {
  text: string;
}

export interface UserSession {
  userId: string;
  orgId: string;
  orgRole: 'org:admin' | 'org:member';
  orgName?: string;
}
