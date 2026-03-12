'use client';

import { TrendingUp, TrendingDown, Activity, Target, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LineChart from './components/LineChart';
import IndicatorCard from './components/IndicatorCard';
import TradingSignalCard from './components/TradingSignalCard';
import PriceInfoCard from './components/PriceInfoCard';
import { useStockData } from '@/lib/hooks/useStockData';
import { use } from 'react';
import { calculateAllIndicators, getLatestIndicators } from '@/lib/indicators';

function generateTradingSignals(latestIndicators: any, currentPrice: number, indicators: any) {
  const rsi = latestIndicators?.rsi14 || 50;
  const macd = latestIndicators?.macd || 0;
  const macdSignal = latestIndicators?.macdSignal || 0;
  const bollingerUpper = latestIndicators?.bollingerUpper || 0;
  const bollingerLower = latestIndicators?.bollingerLower || 0;
  const stochasticK = latestIndicators?.stochasticK || 50;

  let trend = 'HOLD';
  let buySignals = 0;
  let sellSignals = 0;

  // RSI Analysis
  let rsiSignal = 'NEUTRAL';
  if (rsi > 70) {
    rsiSignal = 'OVERBOUGHT';
    sellSignals += 1;
  } else if (rsi < 30) {
    rsiSignal = 'OVERSOLD';
    buySignals += 1;
  }

  // MACD Analysis
  let macdSignal = 'NEUTRAL';
  if (macd > macdSignal) {
    macdSignal = 'BULLISH';
    buySignals += 1;
  } else if (macd < macdSignal) {
    macdSignal = 'BEARISH';
    sellSignals += 1;
  }

  // Bollinger Bands Analysis
  let bollingerSignal = 'NEUTRAL';
  if (currentPrice >= bollingerUpper) {
    bollingerSignal = 'ABOVE_UPPER';
    sellSignals += 1;
  } else if (currentPrice <= bollingerLower) {
    bollingerSignal = 'BELOW_LOWER';
    buySignals += 1;
  }

  // Stochastic Analysis
  let stochasticSignal = 'NEUTRAL';
  if (stochasticK > 80) {
    stochasticSignal = 'OVERBOUGHT';
    sellSignals += 1;
  } else if (stochasticK < 20) {
    stochasticSignal = 'OVERSOLD';
    buySignals += 1;
  }

  // Determine overall trend
  if (buySignals >= 3) {
    trend = 'STRONG BUY';
  } else if (buySignals >= 1 && buySignals > sellSignals) {
    trend = 'BUY';
  } else if (sellSignals >= 3) {
    trend = 'STRONG SELL';
  } else if (sellSignals >= 1 && sellSignals > buySignals) {
    trend = 'SELL';
  } else {
    trend = 'HOLD';
  }

  // Recommendation
  let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let confidence = '';

  if (trend.includes('BUY')) {
    action = 'BUY';
    confidence = buySignals >= 3 ? '높음' : '중간';
  } else if (trend.includes('SELL')) {
    action = 'SELL';
    confidence = sellSignals >= 3 ? '높음' : '중간';
  } else {
    action = 'HOLD';
    confidence = '중간';
  }

  return {
    trend,
    rsi: rsiSignal,
    macd: macdSignal,
    bollinger: bollingerSignal,
    stochastic: stochasticSignal,
    recommendations: {
      action,
      confidence,
      timeframe: '단기'
    }
  };
}

export default function StockAnalysisPage({ params }: { params: Promise<{ symbol: string }> }) {
  const router = useRouter();
  const { symbol } = use(params);

  const { data: stockData, isLoading, isError, error } = useStockData(symbol);

  const indicators = stockData?.candle ? calculateAllIndicators(stockData.candle) : null;
  const latestIndicators = indicators ? getLatestIndicators(indicators) : null;

  const tradingSignals = latestIndicators && stockData?.quote?.c
    ? generateTradingSignals(latestIndicators, stockData.quote.c, indicators)
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-slate-600">분석 중...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">오류</h2>
          <p className="text-slate-600 mb-4">{error?.message || '주식 데이터를 불러오지 못했습니다'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!stockData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push('/')}
          className="mb-6 inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          검색으로 돌아가기
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">{symbol.toUpperCase()}</h1>
          <p className="text-slate-600">{stockData.companyInfo?.name || 'Company name not available'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PriceInfoCard
              quote={stockData.quote}
              companyInfo={stockData.companyInfo || stockData.company_info}
            />

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">가격 차트</h2>
                <div className="text-sm text-slate-500">90일</div>
              </div>
              <LineChart candle={stockData.candle} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
              <h2 className="text-xl font-bold text-slate-900 mb-6">기술적 지표</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <IndicatorCard
                  title="RSI (14)"
                  value={latestIndicators?.rsi14 ?? 0}
                  description="상대 강도 지수"
                  format="number"
                  max={100}
                />
                <IndicatorCard
                  title="MACD"
                  value={latestIndicators?.macd ?? 0}
                  description="이동평균 수렴발산 지표"
                  format="number"
                />
                <IndicatorCard
                  title="MACD Signal"
                  value={latestIndicators?.macdSignal ?? 0}
                  description="MACD 시그널 라인"
                  format="number"
                />
                <IndicatorCard
                  title="Bollinger Upper"
                  value={latestIndicators?.bollingerUpper ?? 0}
                  description="상단 볼린저 밴드"
                  format="currency"
                />
                <IndicatorCard
                  title="Bollinger Middle"
                  value={latestIndicators?.bollingerMiddle ?? 0}
                  description="SMA 20 (중간 볼린저 밴드)"
                  format="currency"
                />
                <IndicatorCard
                  title="Bollinger Lower"
                  value={latestIndicators?.bollingerLower ?? 0}
                  description="하단 볼린저 밴드"
                  format="currency"
                />
                <IndicatorCard
                  title="SMA 20"
                  value={latestIndicators?.sma20 ?? 0}
                  description="20일 단순 이동평균"
                  format="currency"
                />
                <IndicatorCard
                  title="SMA 50"
                  value={latestIndicators?.sma50 ?? 0}
                  description="50일 단순 이동평균"
                  format="currency"
                />
                <IndicatorCard
                  title="SMA 200"
                  value={latestIndicators?.sma200 ?? 0}
                  description="200일 단순 이동평균"
                  format="currency"
                />
                <IndicatorCard
                  title="Stochastic %K"
                  value={latestIndicators?.stochasticK ?? 0}
                  description="스토케스틱 오실레이터 %K"
                  format="number"
                  max={100}
                />
                <IndicatorCard
                  title="Stochastic %D"
                  value={latestIndicators?.stochasticD ?? 0}
                  description="스토케스틱 오실레이터 %D (%K의 SMA)"
                  format="number"
                  max={100}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {tradingSignals && (
              <TradingSignalCard signals={tradingSignals} />
            )}

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-emerald-600" />
                주요 레벨
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600 font-medium">지지/저항 데이터 없음</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 mb-4">시장 현황</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">현재가</span>
                  <span className="font-semibold text-slate-900">
                    ${stockData?.quote?.c?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">변동</span>
                  <span className={`font-semibold ${stockData?.quote?.d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stockData?.quote?.d !== undefined ? (stockData.quote.d >= 0 ? '+' : '') + stockData.quote.d.toFixed(2) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-600">% 변동</span>
                  <span className={`font-semibold ${stockData?.quote?.dp >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stockData?.quote?.dp !== undefined ? (stockData.quote.dp >= 0 ? '+' : '') + stockData.quote.dp.toFixed(2) + '%' : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
                면책
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                이 분석은 정보 제공용 목적으로만 제공되며, 금융 조언이 아닙니다. 
                항상 자체만의 조사를 수행하고 금융 자문가와 상담 후 투자 결정을 내리세요.
                과거 성과는 미래의 결과를 보장하지 않습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
