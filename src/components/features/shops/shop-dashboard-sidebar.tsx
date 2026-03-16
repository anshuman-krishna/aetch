'use client';

import { Sidebar } from '@/components/layouts/sidebar';
import {
  LayoutDashboard,
  Users,
  Images,
  CalendarDays,
  Settings,
} from 'lucide-react';

const shopLinks = [
  { href: '/app/shop-dashboard', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: '/app/shop-dashboard/artists', label: 'Artists', icon: <Users className="h-4 w-4" /> },
  { href: '/app/shop-dashboard/portfolio', label: 'Portfolio', icon: <Images className="h-4 w-4" /> },
  { href: '/app/shop-dashboard/bookings', label: 'Bookings', icon: <CalendarDays className="h-4 w-4" /> },
  { href: '/app/shop-dashboard/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

export function ShopDashboardSidebar() {
  return <Sidebar links={shopLinks} className="hidden lg:flex" />;
}
