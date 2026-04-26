/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { GlassCard } from '@/components/ui/glass-card';

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard>hello</GlassCard>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('default variant is glass + md padding', () => {
    const { container } = render(<GlassCard>x</GlassCard>);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toMatch(/\bglass\b/);
    expect(div.className).toMatch(/\bp-5\b/);
  });

  it('strong + lg variant maps to expected classes', () => {
    const { container } = render(
      <GlassCard variant="strong" padding="lg">
        x
      </GlassCard>,
    );
    const div = container.firstChild as HTMLElement;
    expect(div.className).toMatch(/glass-strong/);
    expect(div.className).toMatch(/\bp-8\b/);
  });

  it('forwards arbitrary props (data attrs)', () => {
    const { container } = render(<GlassCard data-testid="card">x</GlassCard>);
    expect(container.querySelector('[data-testid="card"]')).not.toBeNull();
  });
});
