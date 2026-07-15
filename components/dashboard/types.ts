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
