'use client';

import { useState } from 'react';
import { Search, TrendingUp, BarChart3, AlertCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    router.push(`/stock/${searchQuery.toUpperCase()}`);
  };

  const popularStocks = [
    { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Semiconductors' },
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', sector: 'Automotive' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
    { symbol: 'SOXL', name: 'Semiconductor Bull 3X', sector: 'Leveraged ETF' },
  ];

  const features = [
    {
      icon: TrendingUp,
      title: '실시간 분석',
      description: 'RSI, MACD 등 다양한 지표로 즉시 기술적 분석을 수행하세요.',
    },
    {
      icon: BarChart3,
      title: '인터랙티브 차트',
      description: '아름답고 반응형 차트로 가격 변동을 시각화하세요.',
    },
    {
      icon: AlertCircle,
      title: '트레이딩 신호',
      description: '리스크/보상 비율이 포함된 AI 기반 매수/매도 추천을 제공합니다.',
    },
    {
      icon: Clock,
      title: '시장 타이밍',
      description: '정밀한 타이밍 도구로 진입/청산 지점을 식별하세요.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-8 lg:py-16">
          <div className="lg:text-center">
            <h1 className="text-4xl tracking-tight font-bold text-slate-900 sm:text-5xl lg:text-6xl">
              주식 분석
              <span className="block text-emerald-600 mt-2">쉽게 만들기</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 lg:mx-auto lg:text-xl max-w-2xl">
              모든 주식 종목에 대한 즉시 기술적 분석, 트레이딩 신호, AI 기반 추천을 제공합니다.
              무료, 빠르고, 전문적입니다.
            </p>
          </div>
        </header>

        <div className="max-w-2xl mx-auto mb-16">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="종목 심볼 입력 (예: NVDA, AAPL, SOXL)"
                className="w-full px-6 py-4 pl-14 text-lg bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 shadow-lg shadow-slate-200/50"
                disabled={isLoading}
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <button
                type="submit"
                disabled={isLoading || !searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? '분석 중...' : '분석'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <p className="text-sm text-slate-500 text-center mb-4">인기 종목:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularStocks.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => router.push(`/stock/${stock.symbol}`)}
                  className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all duration-200"
                >
                  <span className="font-semibold">{stock.symbol}</span>
                  <span className="text-slate-400 mx-2">•</span>
                  <span className="text-slate-500 truncate max-w-[120px]">{stock.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 group"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mb-4 group-hover:bg-emerald-600 transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-8 lg:p-12 text-white mb-16 shadow-xl shadow-emerald-900/20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">더 쉽게 스마트한 트레이딩</h2>
            <p className="text-emerald-100 mb-6 text-lg">
              실시간 시장 데이터와 고급 기술 분석 알고리즘을 기반으로 제공됩니다.
              자신감을 가지고 정보에 기반한 의사결을 내리세요.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-4xl font-bold mb-1">200+</div>
                <div className="text-emerald-200 text-sm">지원 시장</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-1">100만+</div>
                <div className="text-emerald-200 text-sm">데이터 포인트</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
