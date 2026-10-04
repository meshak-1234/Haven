import type {
  AuthResponse,
  User,
  UserSettings,
  Conversation,
  ConversationDetail,
  ChatResponse,
  Memory,
  EscalationResource
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('haven_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let errorDetail = 'An unexpected error occurred.';
      try {
        const errorJson = await res.json();
        errorDetail = errorJson.detail || errorJson.message || errorDetail;
      } catch {
        errorDetail = res.statusText || errorDetail;
      }
      throw new Error(errorDetail);
    }
    return res.json();
  }

  // --- Auth ---
  async register(data: { email: string; password: string; full_name: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse<AuthResponse>(res);
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse<AuthResponse>(res);
  }

  // --- User & Settings ---
  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<User>(res);
  }

  async updateProfile(data: { full_name?: string; email?: string; new_password?: string }): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<User>(res);
  }

  async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
    const res = await fetch(`${API_BASE_URL}/users/me/settings`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<UserSettings>(res);
  }

  async deleteAccount(): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ status: string; message: string }>(res);
  }

  // --- Chat & Conversations ---
  async sendMessage(message: string, conversationId?: string): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        message,
        conversation_id: conversationId || null,
      }),
    });
    return this.handleResponse<ChatResponse>(res);
  }

  async getConversations(): Promise<Conversation[]> {
    const res = await fetch(`${API_BASE_URL}/conversations`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Conversation[]>(res);
  }

  async getConversationDetail(id: string): Promise<ConversationDetail> {
    const res = await fetch(`${API_BASE_URL}/conversations/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<ConversationDetail>(res);
  }

  async updateConversation(id: string, title: string): Promise<Conversation> {
    const res = await fetch(`${API_BASE_URL}/conversations/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ title }),
    });
    return this.handleResponse<Conversation>(res);
  }

  async deleteConversation(id: string): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE_URL}/conversations/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ status: string }>(res);
  }

  async clearConversationMessages(id: string): Promise<{ status: string; cleared_messages: number }> {
    const res = await fetch(`${API_BASE_URL}/conversations/${id}/messages`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ status: string; cleared_messages: number }>(res);
  }

  // --- Memory ---
  async getMemories(): Promise<Memory[]> {
    const res = await fetch(`${API_BASE_URL}/memory`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Memory[]>(res);
  }

  async addMemory(data: { content: string; category?: string; importance?: number }): Promise<Memory> {
    const res = await fetch(`${API_BASE_URL}/memory`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Memory>(res);
  }

  async deleteMemory(id: string): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE_URL}/memory/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ status: string }>(res);
  }

  async clearAllMemories(): Promise<{ status: string; cleared_memories: number }> {
    const res = await fetch(`${API_BASE_URL}/memory`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ status: string; cleared_memories: number }>(res);
  }

  // --- Crisis Resources ---
  async getCrisisResources(): Promise<EscalationResource[]> {
    const res = await fetch(`${API_BASE_URL}/safety/resources`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<EscalationResource[]>(res);
  }
}

export const api = new ApiService();
