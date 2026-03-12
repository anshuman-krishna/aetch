'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { GlassTextarea } from '@/components/ui/glass-textarea';
import { GlassSelect } from '@/components/ui/glass-select';
import { GlassModal } from '@/components/ui/glass-modal';
import { GlassBadge } from '@/components/ui/glass-badge';
import { GlassAvatar } from '@/components/ui/glass-avatar';
import { GlassTabs } from '@/components/ui/glass-tabs';
import { GlassTooltip } from '@/components/ui/glass-tooltip';
import { GlassSkeleton } from '@/components/ui/glass-skeleton';
import { GlassSwitch } from '@/components/ui/glass-switch';
import { GlassSlider } from '@/components/ui/glass-slider';
import { GlassDropdown } from '@/components/ui/glass-dropdown';
import { useToast } from '@/components/ui/glass-toast';
import { PageContainer } from '@/components/layouts/page-container';
import { SectionLayout } from '@/components/layouts/section-layout';
import { GridLayout } from '@/components/layouts/grid-layout';

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const { toast } = useToast();

  return (
    <PageContainer>
      <div className="py-12">
        <h1 className="text-display text-foreground">Design System</h1>
        <p className="mt-3 text-lg text-muted">
          AETCH internal UI reference — Glassmorphism + Pastel palette
        </p>

        {/* ─── Typography ─── */}
        <SectionLayout title="Typography">
          <GlassCard padding="lg">
            <div className="space-y-6">
              <div>
                <span className="text-caption text-muted uppercase tracking-wider">Display</span>
                <p className="text-display text-foreground mt-1">The quick brown fox</p>
              </div>
              <div>
                <span className="text-caption text-muted uppercase tracking-wider">H1</span>
                <p className="text-h1 text-foreground mt-1">The quick brown fox</p>
              </div>
              <div>
                <span className="text-caption text-muted uppercase tracking-wider">H2</span>
                <p className="text-h2 text-foreground mt-1">The quick brown fox</p>
              </div>
              <div>
                <span className="text-caption text-muted uppercase tracking-wider">H3</span>
                <p className="text-h3 text-foreground mt-1">The quick brown fox</p>
              </div>
              <div>
                <span className="text-caption text-muted uppercase tracking-wider">H4</span>
                <p className="text-h4 text-foreground mt-1">The quick brown fox</p>
              </div>
              <div>
                <span className="text-caption text-muted uppercase tracking-wider">Body</span>
                <p className="text-body text-foreground mt-1">
                  The quick brown fox jumps over the lazy dog. Typography should be clear and
                  readable at every scale.
                </p>
              </div>
              <div>
                <span className="text-caption text-muted uppercase tracking-wider">Caption</span>
                <p className="text-caption text-muted mt-1">The quick brown fox jumps over the lazy dog</p>
              </div>
            </div>
          </GlassCard>
        </SectionLayout>

        {/* ─── Color Palette ─── */}
        <SectionLayout title="Color Palette" subtitle="Pastel palette with glass overlays">
          <GridLayout cols={4} gap="sm">
            {[
              { name: 'Sky', class: 'bg-pastel-sky' },
              { name: 'Mint', class: 'bg-pastel-mint' },
              { name: 'Lavender', class: 'bg-pastel-lavender' },
              { name: 'Coral', class: 'bg-pastel-coral' },
              { name: 'Peach', class: 'bg-pastel-peach' },
              { name: 'Rose', class: 'bg-pastel-rose' },
              { name: 'Cream', class: 'bg-pastel-cream' },
              { name: 'Ice', class: 'bg-pastel-ice' },
              { name: 'Primary', class: 'bg-primary' },
              { name: 'Primary Light', class: 'bg-primary-light' },
              { name: 'Accent', class: 'bg-accent' },
              { name: 'Surface', class: 'bg-surface border border-border' },
            ].map((c) => (
              <div key={c.name} className="flex flex-col items-center gap-2">
                <div className={`h-16 w-full rounded-xl ${c.class}`} />
                <span className="text-caption text-muted">{c.name}</span>
              </div>
            ))}
          </GridLayout>
        </SectionLayout>

        {/* ─── Buttons ─── */}
        <SectionLayout title="Buttons">
          <GlassCard padding="lg">
            <div className="space-y-6">
              <div>
                <p className="text-caption text-muted mb-3 uppercase tracking-wider">Variants</p>
                <div className="flex flex-wrap items-center gap-3">
                  <GlassButton variant="default">Default</GlassButton>
                  <GlassButton variant="primary">Primary</GlassButton>
                  <GlassButton variant="ghost">Ghost</GlassButton>
                  <GlassButton variant="primary" disabled>Disabled</GlassButton>
                </div>
              </div>
              <div>
                <p className="text-caption text-muted mb-3 uppercase tracking-wider">Sizes</p>
                <div className="flex flex-wrap items-center gap-3">
                  <GlassButton variant="primary" size="sm">Small</GlassButton>
                  <GlassButton variant="primary" size="md">Medium</GlassButton>
                  <GlassButton variant="primary" size="lg">Large</GlassButton>
                </div>
              </div>
            </div>
          </GlassCard>
        </SectionLayout>

        {/* ─── Inputs ─── */}
        <SectionLayout title="Inputs">
          <GridLayout cols={2} gap="md">
            <GlassCard padding="lg">
              <div className="space-y-4">
                <GlassInput label="Email" placeholder="you@example.com" type="email" />
                <GlassInput label="With error" placeholder="..." error="This field is required" />
                <GlassInput label="Disabled" placeholder="..." disabled />
              </div>
            </GlassCard>
            <GlassCard padding="lg">
              <div className="space-y-4">
                <GlassTextarea label="Message" placeholder="Write something..." />
                <GlassSelect
                  label="Tattoo Style"
                  placeholder="Select a style"
                  options={[
                    { value: 'japanese', label: 'Japanese' },
                    { value: 'traditional', label: 'Traditional' },
                    { value: 'minimalist', label: 'Minimalist' },
                    { value: 'blackwork', label: 'Blackwork' },
                  ]}
                />
              </div>
            </GlassCard>
          </GridLayout>
        </SectionLayout>

        {/* ─── Cards ─── */}
        <SectionLayout title="Cards" subtitle="Three glass intensity levels">
          <GridLayout cols={3} gap="md">
            <GlassCard variant="subtle" padding="lg">
              <p className="text-h4 text-foreground">Subtle</p>
              <p className="text-sm text-muted mt-1">Light frosted glass effect</p>
            </GlassCard>
            <GlassCard variant="default" padding="lg">
              <p className="text-h4 text-foreground">Default</p>
              <p className="text-sm text-muted mt-1">Standard glass effect</p>
            </GlassCard>
            <GlassCard variant="strong" padding="lg">
              <p className="text-h4 text-foreground">Strong</p>
              <p className="text-sm text-muted mt-1">Heavy frosted glass effect</p>
            </GlassCard>
          </GridLayout>
        </SectionLayout>

        {/* ─── Badges ─── */}
        <SectionLayout title="Badges">
          <GlassCard padding="lg">
            <div className="flex flex-wrap items-center gap-3">
              <GlassBadge>Default</GlassBadge>
              <GlassBadge variant="primary">Primary</GlassBadge>
              <GlassBadge variant="success">Success</GlassBadge>
              <GlassBadge variant="warning">Warning</GlassBadge>
              <GlassBadge variant="danger">Danger</GlassBadge>
              <GlassBadge variant="primary" size="md">Medium</GlassBadge>
            </div>
          </GlassCard>
        </SectionLayout>

        {/* ─── Avatars ─── */}
        <SectionLayout title="Avatars">
          <GlassCard padding="lg">
            <div className="flex flex-wrap items-center gap-4">
              <GlassAvatar size="sm" alt="John Doe" />
              <GlassAvatar size="md" alt="Jane Smith" />
              <GlassAvatar size="lg" alt="Alex" fallback="AX" />
              <GlassAvatar size="xl" alt="Big Avatar" fallback="BA" />
            </div>
          </GlassCard>
        </SectionLayout>

        {/* ─── Tabs ─── */}
        <SectionLayout title="Tabs">
          <GlassCard padding="lg">
            <GlassTabs
              tabs={[
                { id: 'portfolio', label: 'Portfolio' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'booking', label: 'Booking' },
                { id: 'about', label: 'About' },
              ]}
            />
          </GlassCard>
        </SectionLayout>

        {/* ─── Switch & Slider ─── */}
        <SectionLayout title="Controls">
          <GridLayout cols={2} gap="md">
            <GlassCard padding="lg">
              <p className="text-caption text-muted mb-4 uppercase tracking-wider">Switches</p>
              <div className="space-y-3">
                <GlassSwitch
                  checked={switchChecked}
                  onCheckedChange={setSwitchChecked}
                  label="Enable notifications"
                />
                <GlassSwitch checked={true} onCheckedChange={() => {}} label="Always on" />
                <GlassSwitch checked={false} onCheckedChange={() => {}} label="Disabled" disabled />
              </div>
            </GlassCard>
            <GlassCard padding="lg">
              <p className="text-caption text-muted mb-4 uppercase tracking-wider">Slider</p>
              <GlassSlider
                label="Price Range"
                showValue
                min={0}
                max={100}
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
              />
            </GlassCard>
          </GridLayout>
        </SectionLayout>

        {/* ─── Tooltips & Dropdown ─── */}
        <SectionLayout title="Tooltips & Dropdown">
          <GlassCard padding="lg">
            <div className="flex flex-wrap items-center gap-6">
              <GlassTooltip content="This is a tooltip">
                <GlassButton variant="default" size="sm">Hover me (top)</GlassButton>
              </GlassTooltip>
              <GlassTooltip content="Bottom tooltip" side="bottom">
                <GlassButton variant="default" size="sm">Hover me (bottom)</GlassButton>
              </GlassTooltip>
              <GlassDropdown
                trigger={<GlassButton variant="default" size="sm">Dropdown</GlassButton>}
                items={[
                  { id: 'edit', label: 'Edit Profile' },
                  { id: 'settings', label: 'Settings' },
                  { id: 'logout', label: 'Log Out', danger: true },
                ]}
                onSelect={(id) => toast(`Selected: ${id}`)}
              />
            </div>
          </GlassCard>
        </SectionLayout>

        {/* ─── Modal ─── */}
        <SectionLayout title="Modal">
          <GlassCard padding="lg">
            <GlassButton variant="primary" onClick={() => setModalOpen(true)}>
              Open Modal
            </GlassButton>
            <GlassModal open={modalOpen} onClose={() => setModalOpen(false)} title="Example Modal">
              <p className="text-sm text-muted mb-4">
                This is a glassmorphism modal with spring animations.
              </p>
              <div className="flex justify-end gap-2">
                <GlassButton variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </GlassButton>
                <GlassButton variant="primary" onClick={() => setModalOpen(false)}>
                  Confirm
                </GlassButton>
              </div>
            </GlassModal>
          </GlassCard>
        </SectionLayout>

        {/* ─── Toasts ─── */}
        <SectionLayout title="Toasts">
          <GlassCard padding="lg">
            <div className="flex flex-wrap gap-3">
              <GlassButton size="sm" onClick={() => toast('This is an info toast', 'info')}>
                Info Toast
              </GlassButton>
              <GlassButton size="sm" onClick={() => toast('Operation successful!', 'success')}>
                Success Toast
              </GlassButton>
              <GlassButton size="sm" onClick={() => toast('Please check your input', 'warning')}>
                Warning Toast
              </GlassButton>
              <GlassButton size="sm" onClick={() => toast('Something went wrong', 'error')}>
                Error Toast
              </GlassButton>
            </div>
          </GlassCard>
        </SectionLayout>

        {/* ─── Skeleton ─── */}
        <SectionLayout title="Skeletons">
          <GridLayout cols={3} gap="md">
            <GlassCard padding="lg">
              <div className="space-y-3">
                <GlassSkeleton className="h-32 w-full" rounded="lg" />
                <GlassSkeleton className="h-4 w-3/4" />
                <GlassSkeleton className="h-4 w-1/2" />
              </div>
            </GlassCard>
            <GlassCard padding="lg">
              <div className="flex items-center gap-3">
                <GlassSkeleton className="h-10 w-10" rounded="full" />
                <div className="flex-1 space-y-2">
                  <GlassSkeleton className="h-4 w-2/3" />
                  <GlassSkeleton className="h-3 w-1/3" />
                </div>
              </div>
            </GlassCard>
            <GlassCard padding="lg">
              <div className="space-y-3">
                <GlassSkeleton className="h-4 w-full" />
                <GlassSkeleton className="h-4 w-full" />
                <GlassSkeleton className="h-4 w-2/3" />
                <GlassSkeleton className="h-10 w-24 mt-2" rounded="lg" />
              </div>
            </GlassCard>
          </GridLayout>
        </SectionLayout>

        {/* ─── Glass Variants ─── */}
        <SectionLayout title="Glass Utilities" subtitle="CSS utility classes for glass effects">
          <GridLayout cols={3} gap="md">
            <div className="glass rounded-2xl p-6 text-center">
              <p className="text-h4 text-foreground">.glass</p>
              <p className="text-sm text-muted mt-1">16px blur</p>
            </div>
            <div className="glass-subtle rounded-2xl p-6 text-center">
              <p className="text-h4 text-foreground">.glass-subtle</p>
              <p className="text-sm text-muted mt-1">8px blur</p>
            </div>
            <div className="glass-strong rounded-2xl p-6 text-center">
              <p className="text-h4 text-foreground">.glass-strong</p>
              <p className="text-sm text-muted mt-1">24px blur</p>
            </div>
          </GridLayout>
        </SectionLayout>

        {/* ─── Gradients ─── */}
        <SectionLayout title="Gradients">
          <GridLayout cols={3} gap="md">
            <div className="gradient-pastel rounded-2xl p-6 text-center">
              <p className="text-h4 text-white">.gradient-pastel</p>
            </div>
            <div className="gradient-brand rounded-2xl p-6 text-center">
              <p className="text-h4 text-white">.gradient-brand</p>
            </div>
            <div className="gradient-mesh rounded-2xl p-6 text-center border border-border/30">
              <p className="text-h4 text-foreground">.gradient-mesh</p>
            </div>
          </GridLayout>
        </SectionLayout>
      </div>
    </PageContainer>
  );
}
