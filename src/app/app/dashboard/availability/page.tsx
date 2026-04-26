'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { useToast } from '@/components/ui/glass-toast';
import { Clock, Plus, Trash2 } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Slot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export default function AvailabilityPage() {
  const { toast } = useToast();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/artists/availability?artistId=me')
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .finally(() => setLoading(false));
  }, []);

  const addSlot = (dayOfWeek: number) => {
    if (slots.find((s) => s.dayOfWeek === dayOfWeek)) return;
    setSlots([...slots, { dayOfWeek, startTime: '10:00', endTime: '18:00' }]);
  };

  const removeSlot = (dayOfWeek: number) => {
    setSlots(slots.filter((s) => s.dayOfWeek !== dayOfWeek));
  };

  const updateSlot = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setSlots(slots.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s)));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/artists/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots }),
      });
      if (res.ok) {
        toast('Availability saved', 'success');
      } else {
        toast('Failed to save', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-foreground">Availability</h1>
        <p className="mt-1 text-muted">Set your weekly availability for bookings</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl glass animate-pulse" />
          ))}
        </div>
      ) : (
        <GlassCard variant="subtle" padding="md" className="space-y-3">
          {DAYS.map((day, i) => {
            const slot = slots.find((s) => s.dayOfWeek === i);
            return (
              <div key={i} className="flex items-center gap-4 rounded-xl glass p-3">
                <span className="w-24 text-sm font-medium text-foreground">{day}</span>

                {slot ? (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateSlot(i, 'startTime', e.target.value)}
                        className="rounded-lg glass px-2 py-1 text-sm text-foreground bg-transparent"
                      />
                      <span className="text-xs text-muted">to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateSlot(i, 'endTime', e.target.value)}
                        className="rounded-lg glass px-2 py-1 text-sm text-foreground bg-transparent"
                      />
                    </div>
                    <button
                      onClick={() => removeSlot(i)}
                      className="ml-auto text-muted hover:text-foreground transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => addSlot(i)}
                    className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add hours
                  </button>
                )}
              </div>
            );
          })}

          <div className="flex justify-end pt-2">
            <GlassButton variant="primary" size="md" onClick={save} loading={saving}>
              <Clock className="h-4 w-4" />
              Save Availability
            </GlassButton>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
