/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { GlassTabs } from '@/components/ui/glass-tabs';

const tabs = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
];

describe('GlassTabs', () => {
  it('renders all tab labels', () => {
    render(<GlassTabs tabs={tabs} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('first tab is active by default', () => {
    render(<GlassTabs tabs={tabs} />);
    const first = screen.getByText('Alpha').closest('button')!;
    expect(first.className).toMatch(/text-foreground\b/);
  });

  it('respects defaultTab prop', () => {
    render(<GlassTabs tabs={tabs} defaultTab="b" />);
    const second = screen.getByText('Beta').closest('button')!;
    expect(second.className).toMatch(/text-foreground\b/);
  });

  it('onChange fires with id on click', () => {
    const onChange = jest.fn();
    render(<GlassTabs tabs={tabs} onChange={onChange} />);
    fireEvent.click(screen.getByText('Beta'));
    expect(onChange).toHaveBeenCalledWith('b');
  });
});
