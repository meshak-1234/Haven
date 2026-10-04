export type TonePreference = 'warm_gentle' | 'thoughtful_inquiring' | 'grounded_practical';
export type ResponseLength = 'balanced' | 'concise' | 'reflective';
export type AppTheme = 'calm_teal' | 'soft_lavender' | 'slate_dusk';

export interface UserSettings {
  id: string;
  user_id: string;
  preferred_tone: TonePreference;
  response_length: ResponseLength;
  crisis_resources_enabled: boolean;
  theme: AppTheme;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  settings?: UserSettings;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  safety_flag: string;
  escalation_triggered: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  message_count: number;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface Memory {
  id: string;
  user_id: string;
  content: string;
  category: string;
  importance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EscalationResource {
  name: string;
  contact: string;
  description: string;
  availability: string;
  website?: string;
}

export interface SafetyAnalysisResult {
  level: 'normal' | 'emotional_distress' | 'potentially_high_risk' | 'urgent_safety_concern';
  requires_escalation: boolean;
  calm_guidance?: string;
  resources: EscalationResource[];
  flagged_reasons: string[];
}

export interface ChatResponse {
  conversation_id: string;
  user_message: Message;
  assistant_message: Message;
  safety_analysis?: SafetyAnalysisResult;
  extracted_memory?: string;
}
