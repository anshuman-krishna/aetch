/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { GlassButton } from '@/components/ui/glass-button';

describe('GlassButton', () => {
  it('renders children', () => {
    render(<GlassButton>Click me</GlassButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('aria-busy + disabled when loading', () => {
    render(<GlassButton loading>Save</GlassButton>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toBeDisabled();
  });

  it('disabled wins over click handler', () => {
    const handler = jest.fn();
    render(
      <GlassButton disabled onClick={handler}>
        Disabled
      </GlassButton>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('forwards onClick when enabled', () => {
    const handler = jest.fn();
    render(<GlassButton onClick={handler}>Go</GlassButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('applies variant + size classes', () => {
    render(
      <GlassButton variant="primary" size="lg">
        Big
      </GlassButton>,
    );
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/bg-primary/);
    expect(btn.className).toMatch(/px-7/);
  });
});
