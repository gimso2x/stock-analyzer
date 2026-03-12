'use client';

import { useRef, useState } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { RefreshCw } from 'lucide-react';
import type { StockCandle } from '@/lib/stock-types';

interface DataPoint {
  name: string;
  price: number;
  date: string;
  timestamp: number;
}

type Period = '1M' | '3M' | '6M' | '1Y' | 'ALL';

interface LineChartProps {
  candle: StockCandle;
  symbol: string;
  isFetching?: boolean;
  onPeriodChange?: (label: string) => void;
  supportResistance?: {
    supports: number[];
    resistances: number[];
  };
  boxRange?: {
    low: number;
    high: number;
    start_time: number;
    end_time: number;
  } | null;
}

export default function LineChart({ 
  candle, 
  symbol, 
  isFetching, 
  onPeriodChange,
  supportResistance,
  boxRange
}: LineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('ALL');
  const isKRW = symbol.endsWith('.KS') || symbol.endsWith('.KQ');
  const currencySymbol = isKRW ? '₩' : '$';

  const periods: { value: Period; label: string }[] = [
    { value: '1M', label: '1개월' },
    { value: '3M', label: '3개월' },
    { value: '6M', label: '6개월' },
    { value: '1Y', label: '1년' },
    { value: 'ALL', label: '전체' },
  ];

  const handlePeriodChange = (period: { value: Period; label: string }) => {
    setSelectedPeriod(period.value);
    if (onPeriodChange) {
      onPeriodChange(period.value);
    }
  };

  const fullData: DataPoint[] = candle.t.map((timestamp, index) => ({
    name: new Date(timestamp * 1000).toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
    }),
    price: candle.c[index],
    date: new Date(timestamp * 1000).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    timestamp: timestamp,
  }));

  const data = fullData;

  const minValue = Math.min(...data.map((d) => d.price));
  const maxValue = Math.max(...data.map((d) => d.price));
  
  // Adjust min/max for reference items
  let effectiveMin = minValue;
  let effectiveMax = maxValue;
  
  if (supportResistance) {
    const allSR = [...supportResistance.supports, ...supportResistance.resistances];
    if (allSR.length > 0) {
      effectiveMin = Math.min(effectiveMin, ...allSR);
      effectiveMax = Math.max(effectiveMax, ...allSR);
    }
  }
  
  const paddingValue = (effectiveMax - effectiveMin) * 0.1;

  const formatPrice = (value: number) => {
    return isKRW 
      ? `${currencySymbol}${Math.round(value).toLocaleString()}` 
      : `${currencySymbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div ref={chartRef} className="w-full">
      <div className="flex justify-start sm:justify-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 flex-nowrap">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => handlePeriodChange(period)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              selectedPeriod === period.value
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      <div className="h-[320px] sm:h-[360px] w-full mt-2 relative">
        {isFetching && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/30 backdrop-blur-[1px] transition-all duration-300 rounded-xl">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        )}
        <div className={`w-full h-full transition-opacity duration-300 ${isFetching ? 'opacity-40' : 'opacity-100'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={15}
                height={50}
                interval="preserveStartEnd"
                minTickGap={30}
              />
              <YAxis
                domain={[effectiveMin - paddingValue, effectiveMax + paddingValue]}
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => isKRW ? `${Math.round(value / 1000)}k` : `$${value.toFixed(0)}`}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }}
                itemStyle={{ color: '#0f172a', fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [formatPrice(Number(value)), '가격']}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                labelFormatter={(label: any) => String(label)}
              />
              
              {/* Box Range Visualization */}
              {boxRange && (
                <ReferenceArea
                  x1={new Date(boxRange.start_time * 1000).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                  x2={new Date(boxRange.end_time * 1000).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                  y1={boxRange.low}
                  y2={boxRange.high}
                  fill="#94a3b8"
                  fillOpacity={0.15}
                  stroke="none"
                />
              )}

              {/* Support Lines */}
              {supportResistance?.supports.map((s, i) => (
                <ReferenceLine 
                  key={`support-${i}`} 
                  y={s} 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  label={{ 
                    position: 'insideBottomRight', 
                    value: 'SUPPORT / 지지', 
                    fill: '#22c55e', 
                    fontSize: 11,
                    fontWeight: 'bold' 
                  }} 
                />
              ))}

              {/* Resistance Lines */}
              {supportResistance?.resistances.map((r, i) => (
                <ReferenceLine 
                  key={`resistance-${i}`} 
                  y={r} 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  label={{ 
                    position: 'insideTopRight', 
                    value: 'RESISTANCE / 저항', 
                    fill: '#ef4444', 
                    fontSize: 11,
                    fontWeight: 'bold' 
                  }} 
                />
              ))}

              <Line
                type="monotone"
                dataKey="price"
                stroke="#059669"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: '#059669',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
                animationDuration={1000}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
