'use client';

import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface IndicatorCardProps {
  title: string;
  value: number;
  description: string;
  format: 'currency' | 'number';
  symbol?: string;
}

export default function IndicatorCard({ title, value, description, format, symbol }: IndicatorCardProps) {
  const isKRW = symbol?.endsWith('.KS') || symbol?.endsWith('.KQ');
  const currencySymbol = isKRW ? '₩' : '$';

  const formatValue = (val: number) => {
    if (isNaN(val)) return 'N/A';
    if (format === 'currency') {
      return isKRW 
        ? `${currencySymbol}${Math.round(val).toLocaleString()}` 
        : `${currencySymbol}${val.toFixed(2)}`;
    }
    if (format === 'number') return val.toFixed(2);
    return val.toString();
  };

  const getStatus = () => {
    if (isNaN(value)) return null;

    if (title.includes('RSI')) {
      if (value > 70) return { icon: TrendingUp, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', status: '과매수' };
      if (value < 30) return { icon: TrendingDown, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', status: '과매도' };
    }

    if (title.includes('Stochastic')) {
      if (value > 80) return { icon: TrendingUp, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', status: '과매수' };
      if (value < 20) return { icon: TrendingDown, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', status: '과매도' };
    }

    return { icon: Minus, color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', status: '중립' };
  };

  const status = getStatus();

  return (
    <div className={`p-4 rounded-xl border ${status?.bgColor || 'bg-slate-50'} ${status?.borderColor || 'border-slate-200'} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-[10px] sm:text-xs text-slate-500">{description}</p>
        </div>
        {status && status.status !== '중립' && (
          <div className={`p-1.5 rounded-lg ${status.bgColor}`}>
            <status.icon className={`w-4 h-4 ${status.color}`} />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900">{formatValue(value)}</span>
        {status && status.status !== '중립' && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.bgColor} ${status.color}`}>
            {status.status}
          </span>
        )}
      </div>
    </div>
  );
}
