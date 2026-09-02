export interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  keywords: string[];
}

export const PLATFORMS: Record<string, PlatformConfig> = {
  LinkedIn: {
    id: 'LinkedIn',
    name: 'LinkedIn',
    icon: '💼',
    keywords: ['linkedin']
  },
  X: {
    id: 'X',
    name: 'X / Twitter',
    icon: '🧵',
    keywords: ['x', 'twitter', 'thread']
  },
  Instagram: {
    id: 'Instagram',
    name: 'Instagram',
    icon: '📸',
    keywords: ['instagram', 'ig']
  },
  TikTok: {
    id: 'TikTok',
    name: 'TikTok',
    icon: '🎵',
    keywords: ['tiktok']
  }
};

export const GREETINGS = [
  'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'what can you do', 'help', 'who are you'
];

export function detectPlatformFromPrompt(promptText: string): string | null {
  const lower = promptText.toLowerCase();
  for (const p of Object.values(PLATFORMS)) {
    if (p.keywords.some(k => lower.includes(k))) {
      return p.id;
    }
  }
  return null;
}

export function isGreetingPrompt(promptText: string): boolean {
  const lower = promptText.trim().toLowerCase();
  return GREETINGS.some(g => lower === g || lower.startsWith(g + ' ') || lower.startsWith(g + '!'));
}
