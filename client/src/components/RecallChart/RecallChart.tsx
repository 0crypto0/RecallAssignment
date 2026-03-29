import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { RecallRecord } from '../../types/recall.js';
import './RecallChart.scss';

interface RecallChartProps {
  data: RecallRecord[];
}

function formatDateTick(value: string): string {
  const parts = value.split('-');
  return `${parts[1]}/${parts[2]}`;
}

function formatTooltipValue(value: number): [string, string] {
  return [value.toFixed(2), 'Recall'];
}

export function RecallChart({ data }: RecallChartProps) {
  if (data.length === 0) {
    return (
      <div className="recall-chart__empty">
        <p>No data found for the selected date range.</p>
      </div>
    );
  }

  return (
    <div className="recall-chart">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={formatDateTick}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={[0, 100]}
            label={{ value: 'Recall', angle: -90, position: 'insideLeft', offset: 0 }}
          />
          <Tooltip
            labelFormatter={(label: string) => `Date: ${label}`}
            formatter={formatTooltipValue}
          />
          <Line
            type="monotone"
            dataKey="recall"
            stroke="var(--color-chart-line)"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
