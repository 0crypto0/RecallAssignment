import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loader } from '../../src/components/Loader/Loader.js';

describe('Loader', () => {
  it('renders with loading text', () => {
    render(<Loader />);
    expect(screen.getByText('Loading recall data...')).toBeInTheDocument();
  });

  it('has accessible role and label', () => {
    render(<Loader />);
    const loader = screen.getByRole('status');
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveAttribute('aria-label', 'Loading data');
  });

  it('renders spinner element', () => {
    const { container } = render(<Loader />);
    expect(container.querySelector('.loader__spinner')).toBeInTheDocument();
  });
});
