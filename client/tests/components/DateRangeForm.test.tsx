import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangeForm } from '../../src/components/DateRangeForm/DateRangeForm.js';

describe('DateRangeForm', () => {
  it('renders date inputs and buttons', () => {
    render(
      <DateRangeForm onSubmit={vi.fn()} onValidationError={vi.fn()} isLoading={false} />,
    );
    expect(screen.getByText('From Date')).toBeInTheDocument();
    expect(screen.getByText('To Date')).toBeInTheDocument();
    expect(screen.getByText('Fetch Data')).toBeInTheDocument();
    expect(screen.getByText('Clear & Show All')).toBeInTheDocument();
  });

  it('disables buttons when loading', () => {
    render(
      <DateRangeForm onSubmit={vi.fn()} onValidationError={vi.fn()} isLoading={true} />,
    );
    expect(screen.getByText('Loading...')).toBeDisabled();
    expect(screen.getByText('Clear & Show All')).toBeDisabled();
  });

  it('calls onSubmit with undefined when form submitted without dates', () => {
    const onSubmit = vi.fn();
    render(
      <DateRangeForm onSubmit={onSubmit} onValidationError={vi.fn()} isLoading={false} />,
    );
    fireEvent.click(screen.getByText('Fetch Data'));
    expect(onSubmit).toHaveBeenCalledWith(undefined, undefined);
  });

  it('calls onSubmit with undefined on clear', () => {
    const onSubmit = vi.fn();
    render(
      <DateRangeForm onSubmit={onSubmit} onValidationError={vi.fn()} isLoading={false} />,
    );
    fireEvent.click(screen.getByText('Clear & Show All'));
    expect(onSubmit).toHaveBeenCalledWith(undefined, undefined);
  });

  it('pre-fills date inputs from initialFromDate and initialToDate', () => {
    render(
      <DateRangeForm
        onSubmit={vi.fn()}
        onValidationError={vi.fn()}
        isLoading={false}
        initialFromDate="2020-06-15"
        initialToDate="2021-03-20"
      />,
    );
    const inputs = screen.getAllByPlaceholderText('YYYY-MM-DD') as HTMLInputElement[];
    expect(inputs[0].value).toBe('2020-06-15');
    expect(inputs[1].value).toBe('2021-03-20');
  });

  it('submits pre-filled dates from URL params', () => {
    const onSubmit = vi.fn();
    render(
      <DateRangeForm
        onSubmit={onSubmit}
        onValidationError={vi.fn()}
        isLoading={false}
        initialFromDate="2020-01-01"
        initialToDate="2020-12-31"
      />,
    );
    fireEvent.click(screen.getByText('Fetch Data'));
    expect(onSubmit).toHaveBeenCalledWith('2020-01-01', '2020-12-31');
  });
});
