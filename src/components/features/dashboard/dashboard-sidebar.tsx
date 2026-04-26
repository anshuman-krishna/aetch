'use client';

import { Sidebar } from '@/components/layouts/sidebar';
import { LayoutDashboard, Images, CalendarDays, Clock, Settings, Upload } from 'lucide-react';

const dashboardLinks = [
  { href: '/app/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: '/app/dashboard/portfolio', label: 'Portfolio', icon: <Images className="h-4 w-4" /> },
  {
    href: '/app/dashboard/bookings',
    label: 'Bookings',
    icon: <CalendarDays className="h-4 w-4" />,
  },
  {
    href: '/app/dashboard/availability',
    label: 'Availability',
    icon: <Clock className="h-4 w-4" />,
  },
  { href: '/app/dashboard/upload', label: 'Upload', icon: <Upload className="h-4 w-4" /> },
  { href: '/app/dashboard/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

export function DashboardSidebar() {
  return <Sidebar links={dashboardLinks} className="hidden lg:flex" />;
}
