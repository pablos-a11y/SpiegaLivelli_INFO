export type LevelId = 'BIENNIO' | 'TRIENNIO' | 'MATURITA';

export interface LevelConfig {
  id: LevelId;
  label: string;
  subtitle: string;
  badge: string;
  colorName: string; // e.g. 'emerald', 'amber', 'rose'
  colorHex: string;  // e.g. '#10b981', '#f59e0b', '#f43f5e'
  emoji: string;
  prefix: string;
  badgeBg: string; // Tailwind class
  badgeText: string; // Tailwind class
  activeBorderClass: string; // Tailwind class
  activeBgClass: string; // Tailwind class
  hoverClass: string; // Tailwind class
  textPrimaryClass: string; // Tailwind class
}

export interface AttachedFile {
  name: string;
  base64: string;
  mimeType: string;
  size: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  level: LevelId;
  timestamp: string;
  attachedFile?: {
    name: string;
    mimeType: string;
    size: string;
  };
}
