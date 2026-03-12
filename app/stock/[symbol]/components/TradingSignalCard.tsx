'use client';

import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TradingSignalCardProps {
  signals: {
    trend: string;
    rsi: string;
    macd: string;
    bollinger: string;
    stochastic: string;
    recommendations: {
      action: 'BUY' | 'SELL' | 'HOLD';
      confidence: string;
      timeframe: string;
    };
  };
}

export default function TradingSignalCard({ signals }: TradingSignalCardProps) {
  const getTrendIcon = () => {
    switch (signals.trend) {
      case 'STRONG BUY':
      case 'BUY':
        return TrendingUp;
      case 'STRONG SELL':
      case 'SELL':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = () => {
    switch (signals.trend) {
      case 'STRONG BUY':
        return 'bg-green-600 text-white';
      case 'BUY':
        return 'bg-green-500 text-white';
      case 'STRONG SELL':
        return 'bg-red-600 text-white';
      case 'SELL':
        return 'bg-red-500 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'OVERBOUGHT':
      case 'ABOVE_UPPER':
        return TrendingUp;
      case 'OVERSOLD':
      case 'BELOW_LOWER':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'OVERBOUGHT':
      case 'ABOVE_UPPER':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'OVERSOLD':
      case 'BELOW_LOWER':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-emerald-600" />
        트레이딩 신호
      </h3>

      <div className={`flex items-center justify-between p-4 rounded-xl mb-4 ${getTrendColor()}`}>
        <div>
          <div className="text-sm opacity-90">전체 추세</div>
          <div className="text-xl font-bold">{signals.trend}</div>
        </div>
        <TrendIcon className="w-8 h-8 opacity-80" />
      </div>

      <div className="space-y-3">
        <div className={`flex items-center justify-between py-2 px-3 rounded-lg border ${getSignalColor(signals.rsi)}`}>
          <span className="text-sm font-medium">RSI 상태</span>
          <span className="text-xs font-bold">{signals.rsi}</span>
        </div>

        <div className={`flex items-center justify-between py-2 px-3 rounded-lg border ${getSignalColor(signals.macd)}`}>
          <span className="text-sm font-medium">MACD 상태</span>
          <span className="text-xs font-bold">{signals.macd}</span>
        </div>

        <div className={`flex items-center justify-between py-2 px-3 rounded-lg border ${getSignalColor(signals.bollinger)}`}>
          <span className="text-sm font-medium">볼린저 밴드</span>
          <span className="text-xs font-bold">{signals.bollinger}</span>
        </div>

        <div className={`flex items-center justify-between py-2 px-3 rounded-lg border ${getSignalColor(signals.stochastic)}`}>
          <span className="text-sm font-medium">스토케스틱</span>
          <span className="text-xs font-bold">{signals.stochastic}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">추천 사항</span>
          <span className={`text-sm font-bold ${
            signals.recommendations.action === 'BUY' ? 'text-green-600' :
            signals.recommendations.action === 'SELL' ? 'text-red-600' :
            'text-slate-600'
          }`}>
            {signals.recommendations.action}
            {signals.recommendations.confidence && (
              <span className="text-xs text-slate-500 ml-1">({signals.recommendations.confidence})</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
