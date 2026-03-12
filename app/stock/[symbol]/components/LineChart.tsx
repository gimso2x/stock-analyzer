'use client';

import { useRef, useEffect } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { StockCandle } from '@/lib/finnhub';

interface DataPoint {
  name: string;
  price: number;
  date: string;
}

interface LineChartProps {
  candle: StockCandle;
}

export default function LineChart({ candle }: LineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const data: DataPoint[] = candle.t.map((timestamp, index) => ({
    name: new Date(timestamp * 1000).toLocaleDateString(),
    price: candle.c[index],
    date: new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  }));

  const minValue = Math.min(...data.map((d) => d.price));
  const maxValue = Math.max(...data.map((d) => d.price));
  const padding = (maxValue - minValue) * 0.1;

  return (
    <div ref={chartRef} className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[minValue - padding, maxValue + padding]}
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
            itemStyle={{ color: '#1e293b', fontSize: '12px' }}
            labelStyle={{ color: '#64748b', fontSize: '11px', fontWeight: '500' }}
            formatter={(value: any, name: any) => {
              const numValue = Array.isArray(value) ? value[0] : value;
              return typeof numValue === 'number' ?
                [`$${numValue.toFixed(2)}`, 'Price'] :
                ['N/A', 'Price'];
            }}
            labelFormatter={(label: any) => label || 'N/A'}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#059669"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 6,
              fill: '#059669',
              stroke: '#ffffff',
              strokeWidth: 2,
            }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
