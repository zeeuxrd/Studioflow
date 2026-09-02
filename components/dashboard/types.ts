export interface Idea {
  idea_id: string;
  idea_text: string;
  category: string;
}

export interface Post {
  post_id: string;
  idea_id: string;
  platform_type: string;
  content_body: string;
  engagement_prediction_score: number;
  refinement_history?: { instruction: string; content: string; notes?: string; created_at: string }[];
}

export interface Product {
  product_id: string;
  source_post_id: string;
  product_type: string;
  title: string;
  content_structure: any;
  monetization_price_suggestion: number;
  refinement_history?: { instruction: string; title: string; content_structure: any; monetization_price_suggestion: number; created_at: string }[];
}

export type ChatTurnIntent = 'ideas' | 'post' | 'product' | 'refinement' | 'chat' | 'platform_select';

export interface BaseChatTurn {
  id: string;
  userPrompt: string;
  timestamp: number;
  isLoading?: boolean;
  error?: string | null;
  conversationalText?: string;
  platform?: string;
  ideas?: Idea[];
  post?: Post;
  product?: Product;
  isChat?: boolean;
}

export interface ChatTurnIdeas extends BaseChatTurn {
  intent: 'ideas';
  ideas: Idea[];
}

export interface ChatTurnPost extends BaseChatTurn {
  intent: 'post';
}

export interface ChatTurnProduct extends BaseChatTurn {
  intent: 'product';
}

export interface ChatTurnChat extends BaseChatTurn {
  intent: 'chat';
  isChat?: boolean;
}

export interface ChatTurnPlatformSelect extends BaseChatTurn {
  intent: 'platform_select';
}

export type ChatTurn = BaseChatTurn;
