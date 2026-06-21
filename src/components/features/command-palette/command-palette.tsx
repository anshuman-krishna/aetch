'use client';

import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { filterCommands } from './commands';

// global ⌘k / ctrl-k launcher for quick navigation
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => filterCommands(query), [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActive(0);
  }, []);

  const run = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router],
  );

  // toggle on ⌘k / ctrl-k from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 40);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const onSearch = (value: string) => {
    setQuery(value);
    setActive(0);
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return close();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      run(results[active].href);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onKeyDown={onListKey}
            className="glass-strong relative w-full max-w-xl overflow-hidden rounded-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <Search className="h-4 w-4 shrink-0 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search pages…"
                aria-label="Search pages"
                className="w-full bg-transparent py-4 text-sm text-foreground placeholder:text-muted focus:outline-none"
              />
              <kbd className="hidden shrink-0 rounded-md border border-white/15 px-1.5 py-0.5 text-[10px] text-muted sm:block">
                ESC
              </kbd>
            </div>

            <ul className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
              {results.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-muted">No matches</li>
              )}
              {results.map((c, i) => {
                const Icon = c.icon;
                return (
                  <li key={c.id} role="option" aria-selected={i === active}>
                    <button
                      onMouseEnter={() => setActive(i)}
                      onClick={() => run(c.href)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                        i === active ? 'bg-primary/15' : 'hover:bg-white/5',
                      )}
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-sm text-foreground">{c.label}</span>
                      <span className="ml-auto text-xs text-muted">{c.group}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
