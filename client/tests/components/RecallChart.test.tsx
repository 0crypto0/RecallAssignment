import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecallChart } from '../../src/components/RecallChart/RecallChart.js';

describe('RecallChart', () => {
  it('renders empty state when data is empty', () => {
    render(<RecallChart data={[]} />);
    expect(screen.getByText('No data found for the selected date range.')).toBeInTheDocument();
  });

  it('renders chart container when data is provided', () => {
    const data = [
      { date: '2020-01-01', recall: 50 },
      { date: '2020-01-02', recall: 75 },
    ];
    const { container } = render(<RecallChart data={data} />);
    expect(container.querySelector('.recall-chart')).toBeInTheDocument();
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });
});
