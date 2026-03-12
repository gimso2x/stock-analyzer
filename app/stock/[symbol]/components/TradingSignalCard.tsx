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
      koreanAction?: string;
      confidence: string;
      timeframe: string;
    };
  };
}

export default function TradingSignalCard({ signals }: TradingSignalCardProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case '강력 매수':
      case '매수':
        return <TrendingUp className="w-8 h-8 opacity-80" />;
      case '강력 매도':
      case '매도':
        return <TrendingDown className="w-8 h-8 opacity-80" />;
      default:
        return <Minus className="w-8 h-8 opacity-80" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case '강력 매수':
        return 'bg-red-600 text-white';
      case '매수':
        return 'bg-red-500 text-white';
      case '강력 매도':
        return 'bg-blue-600 text-white';
      case '매도':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case '과매수':
      case '상단 돌파':
      case '강세':
        return 'text-red-600 bg-red-50 border-red-200';
      case '과매도':
      case '하단 이탈':
      case '약세':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-lg">
      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-emerald-600" />
        트레이딩 신호
      </h3>

      <div className={`flex items-center justify-between p-3 sm:p-4 rounded-xl mb-4 ${getTrendColor(signals.trend)}`}>
        <div>
          <div className="text-xs sm:text-sm opacity-90">전체 추세</div>
          <div className="text-lg sm:text-xl font-bold">{signals.trend}</div>
        </div>
        {getTrendIcon(signals.trend)}
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
            signals.recommendations.action === 'BUY' ? 'text-red-600' :
            signals.recommendations.action === 'SELL' ? 'text-blue-600' :
            'text-slate-600'
          }`}>
            {signals.recommendations.koreanAction || signals.recommendations.action}
            {signals.recommendations.confidence && (
              <span className="text-xs text-slate-500 ml-1">({signals.recommendations.confidence})</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
