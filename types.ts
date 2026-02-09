
export enum AppView {
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  VOICE = 'voice',
  VISION = 'vision',
}

export type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  mode?: 'fast' | 'thinking' | 'search';
  image?: string;
  sources?: { title: string; uri: string }[];
};

export interface ChatConfig {
  mode: 'fast' | 'thinking' | 'search' | 'standard';
}
