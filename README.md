# Stock Analyzer

한국 및 미국 주식을 위한 실시간 분석 웹 애플리케이션입니다. Next.js, TypeScript, TailwindCSS로 구축되었습니다.

## Features

- **한국 & 미국 주식 지원**: 코스피(KOSPI), 코스닥(KOSDAQ), 미국 주식 데이터 지원
- **실시간 시장 데이터**: Finnhub API를 통한 실시간 주식 데이터
- **기술적 분석**: RSI, MACD, 볼린저 밴드 등 다양한 지표 계산
- **인터랙티브 차트**: Recharts를 활용한 아름다운 가격 차트
- **트레이딩 신호**: 리스크/보상 비율이 포함된 AI 기반 매수/매도 추천
- **지지선/저항선**: 자동 주요 가격 레벨 계산
- **모던 UI**: TailwindCSS를 활용한 깔끔하고 반응형 디자인

## 🇰🇷 한국 주식 지원

한국 주식 종목코드 형식:
- **KOSPI**: `005930.KS` (삼성전자)
- **KOSDAQ**: `247540.KQ` (코스닥 종목)

인기 종목 제공:
- 시가총액 상위 10개 한국 종목 포함
- 클릭 한 번으로 바로 분석 가능

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **Charts**: Recharts
- **API**: Finnhub (free tier, 500 calls/day)

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm installed

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

3. **Add your Finnhub API key** (Required for full functionality):
```bash
NEXT_PUBLIC_FINNHUB_API_KEY=your_actual_api_key_here
```

### ⚠️ IMPORTANT: API Key Setup

**You need a full free API key for technical analysis:**

1. Go to: https://finnhub.io/register
2. Sign up for a free account (takes 30 seconds)
3. Get your API key from the API Keys section
4. Add it to `.env.local`

**Without a full API key:**
- Quote data ✅ works (limited)
- Technical indicators ❌ won't work (no historical data)
- Charts ❌ won't work

**With a full API key:**
- All features ✅ fully functional

⚠️ **IMPORTANT: For full functionality, you need a Finnhub API key:**

1. Sign up for free: https://finnhub.io/register
2. Get your API key from the Dashboard
3. Add to `.env.local`:
```
NEXT_PUBLIC_FINNHUB_API_KEY=your_api_key_here
``**

**Without full API key:**
- Quote data ✅ works (limited)
- Technical indicators ❌ won't work
- Charts ❌ won't work

### Development

Run the development server:
```bash
pnpm dev
```

Open [http://localhost:2002](http://localhost:2002) in your browser.

### Build

Production build:
```bash
pnpm build
```

Start production server:
```bash
pnpm start
```

## API Routes

### Stock Analysis
`GET /api/stock/[symbol]`

Returns comprehensive stock data including:
- Quote information
- Historical candles (90 days)
- Technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands, Stochastic)
- Company information

### Trading Signals
`GET /api/signals/[symbol]`

Returns trading recommendations including:
- Overall trend (BUY/SELL/HOLD)
- Individual indicator signals
- Buy/Sell recommendations with targets and stop-losses
- Support and resistance levels

## Project Structure

```
stock-analyzer/
├── app/
│   ├── api/
│   │   ├── stock/[symbol]/route.ts       # Stock data API
│   │   └── signals/[symbol]/route.ts     # Trading signals API
│   ├── stock/[symbol]/
│   │   ├── page.tsx                      # Analysis page
│   │   └── components/                   # UI components
│   ├── layout.tsx
│   └── page.tsx                          # Home page
├── lib/
│   ├── finnhub.ts                        # API client
│   └── indicators.ts                     # Technical calculations
└── tailwind.css
```

## Technical Indicators Implemented

- **Moving Averages**: SMA (20, 50, 200 days), EMA (12, 26 days)
- **RSI**: Relative Strength Index (14 period)
- **MACD**: Moving Average Convergence Divergence (12, 26, 9)
- **Bollinger Bands**: 20-period with 2 standard deviations
- **Stochastic Oscillator**: %K (14), %D (3)

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## Troubleshooting

### "Failed to fetch stock candles" Error

This error means your API key doesn't have access to historical candle data.

**Fix:**
1. Sign up: https://finnhub.io/register (free)
2. Get your API key
3. Update `.env.local`: `NEXT_PUBLIC_FINNHUB_API_KEY=your_key`
4. Restart server: `pnpm dev`

### Port 2002 Already in Use

```bash
# Kill process
lsof -ti :2002 | xargs kill -9

# Or use different port
pnpm dev -p 3001
```

## Disclaimer

이 애플리케이션은 정보 제공 목적으로만 제공되며, 투자 조언을 구성하지 않습니다. 투자 결정을 내리기 전에 직접 조사를 수행하고 금융 고문과 상담하세요. 과거의 성과가 미래의 결과를 보장하지 않습니다.
