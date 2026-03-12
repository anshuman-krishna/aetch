'use client';

import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface GlassTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export function GlassTabs({ tabs, defaultTab, onChange, className }: GlassTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? '');

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  return (
    <div className={cn('inline-flex rounded-xl glass p-1 gap-0.5', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={cn(
            'relative rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            activeTab === tab.id ? 'text-foreground' : 'text-muted hover:text-foreground/70',
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="active-tab"
              className="absolute inset-0 rounded-lg bg-white/20 dark:bg-white/10"
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
