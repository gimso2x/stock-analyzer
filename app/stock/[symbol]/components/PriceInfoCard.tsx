'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import type { StockQuote, CompanyInfo } from '@/lib/stock-types';

interface PriceInfoCardProps {
  quote: StockQuote;
  companyInfo: CompanyInfo;
}

export default function PriceInfoCard({ quote, companyInfo }: PriceInfoCardProps) {
  const change = quote.d || 0;
  const changePercent = quote.dp || 0;
  const isPositive = change >= 0;
  const isKRW = companyInfo?.ticker?.endsWith('.KS') || companyInfo?.ticker?.endsWith('.KQ');
  const currencySymbol = isKRW ? '₩' : '$';

  const formatPrice = (val: number) => {
    if (val === undefined || val === null) return 'N/A';
    return isKRW 
      ? `${currencySymbol}${Math.round(val).toLocaleString()}` 
      : `${currencySymbol}${val.toFixed(2)}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-slate-900">{companyInfo?.name || 'N/A'}</h2>
          <p className="text-slate-600">{companyInfo?.finnhubIndustry || 'N/A'}</p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <span className={`text-3xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {formatPrice(quote.c)}
          </span>
          <div className={`flex flex-col items-end ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <div className="flex items-center gap-1 text-sm font-medium">
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{isPositive ? '+' : ''}{isKRW ? Math.round(change).toLocaleString() : change.toFixed(2)}</span>
            </div>
            <div className="text-xs">
              ({isPositive ? '+' : ''}{changePercent?.toFixed(2) || 'N/A'}%)
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-600 mb-1">시가</div>
          <div className="text-sm font-semibold text-slate-900">{formatPrice(quote.o)}</div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-600 mb-1">고가</div>
          <div className="text-sm font-semibold text-slate-900">{formatPrice(quote.h)}</div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-600 mb-1">저가</div>
          <div className="text-sm font-semibold text-slate-900">{formatPrice(quote.l)}</div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-600 mb-1">전일 종가</div>
          <div className="text-sm font-semibold text-slate-900">{formatPrice(quote.pc)}</div>
        </div>
      </div>
    </div>
  );
}
