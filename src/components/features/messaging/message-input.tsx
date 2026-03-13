'use client';

import { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';

interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping?: () => void;
  disabled?: boolean;
}

const MAX_LENGTH = 2000;

export function MessageInput({ onSend, onTyping, disabled }: MessageInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > MAX_LENGTH) return;
    onSend(trimmed);
    setValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    onTyping?.();
  };

  return (
    <div className="flex items-end gap-2 glass rounded-2xl p-2">
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type a message..."
        rows={1}
        maxLength={MAX_LENGTH}
        className={
          'flex-1 resize-none bg-transparent px-3 py-2 text-sm text-foreground ' +
          'placeholder:text-muted focus:outline-none'
        }
      />
      <GlassButton
        variant="primary"
        size="sm"
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </GlassButton>
    </div>
  );
}
