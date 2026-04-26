/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { GlassInput } from '@/components/ui/glass-input';

describe('GlassInput', () => {
  it('renders without label', () => {
    render(<GlassInput placeholder="email" />);
    expect(screen.getByPlaceholderText('email')).toBeInTheDocument();
  });

  it('associates label with input via htmlFor/id', () => {
    render(<GlassInput label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
    expect(input.id).toBe('email');
  });

  it('renders error message + applies error ring', () => {
    render(<GlassInput label="Email" error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
    const input = screen.getByLabelText('Email');
    expect(input.className).toMatch(/ring-red-400/);
  });

  it('forwards onChange', () => {
    const onChange = jest.fn();
    render(<GlassInput label="Email" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    expect(onChange).toHaveBeenCalled();
  });
});
