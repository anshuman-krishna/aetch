/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { GlassBadge } from '@/components/ui/glass-badge';

describe('GlassBadge', () => {
  it('renders content', () => {
    render(<GlassBadge>NEW</GlassBadge>);
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('default variant + size', () => {
    const { container } = render(<GlassBadge>x</GlassBadge>);
    const span = container.firstChild as HTMLElement;
    expect(span.className).toMatch(/glass\b/);
    expect(span.className).toMatch(/text-xs/);
  });

  it.each([
    ['primary', /bg-primary/],
    ['success', /pastel-mint/],
    ['warning', /pastel-peach/],
    ['danger', /pastel-coral/],
  ])('variant %s applies expected class', (variant, pattern) => {
    const { container } = render(
      <GlassBadge variant={variant as 'primary' | 'success' | 'warning' | 'danger'}>x</GlassBadge>,
    );
    expect((container.firstChild as HTMLElement).className).toMatch(pattern);
  });
});
