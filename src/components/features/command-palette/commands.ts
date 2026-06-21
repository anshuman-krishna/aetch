import {
  Calendar,
  Compass,
  Image,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Plus,
  Settings,
  Sparkles,
  Store,
  TrendingUp,
  User,
  type LucideIcon,
} from 'lucide-react';

export interface Command {
  id: string;
  label: string;
  href: string;
  group: string;
  icon: LucideIcon;
  keywords?: string;
}

// static navigation map — index routes only, no dynamic segments
export const commands: Command[] = [
  { id: 'gallery', label: 'Gallery', href: '/app/gallery', group: 'Discover', icon: Image, keywords: 'browse designs tattoos' },
  { id: 'trending', label: 'Trending', href: '/app/trending', group: 'Discover', icon: TrendingUp, keywords: 'popular hot' },
  { id: 'shops', label: 'Shops', href: '/app/shops', group: 'Discover', icon: Store, keywords: 'studios artists directory' },
  { id: 'map', label: 'Map', href: '/app/map', group: 'Discover', icon: MapPin, keywords: 'near me location' },
  { id: 'events', label: 'Events', href: '/app/events', group: 'Discover', icon: Calendar, keywords: 'conventions meetups' },
  { id: 'feed', label: 'Feed', href: '/app/feed', group: 'Social', icon: Compass, keywords: 'social posts community' },
  { id: 'messages', label: 'Messages', href: '/app/messages', group: 'Social', icon: MessageCircle, keywords: 'chat dm conversations' },
  { id: 'ai', label: 'AI Generator', href: '/app/ai', group: 'Create', icon: Sparkles, keywords: 'generate concept design' },
  { id: 'ar', label: 'AR Preview', href: '/app/ar-preview', group: 'Create', icon: Image, keywords: 'try on skin overlay' },
  { id: 'create-post', label: 'New Post', href: '/app/create-post', group: 'Create', icon: Plus, keywords: 'share upload' },
  { id: 'dashboard', label: 'Dashboard', href: '/app/dashboard', group: 'Account', icon: LayoutDashboard, keywords: 'home analytics' },
  { id: 'profile', label: 'Saved', href: '/app/saved', group: 'Account', icon: User, keywords: 'bookmarks collections' },
  { id: 'settings', label: 'Settings', href: '/app/settings', group: 'Account', icon: Settings, keywords: 'preferences account' },
];

export function filterCommands(query: string): Command[] {
  const q = query.trim().toLowerCase();
  if (!q) return commands;
  return commands.filter((c) =>
    `${c.label} ${c.group} ${c.keywords ?? ''}`.toLowerCase().includes(q),
  );
}
