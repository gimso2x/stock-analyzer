# Stock Analyzer

A modern, real-time stock analysis web application built with Next.js, TypeScript, and TailwindCSS.

## Features

- **Real-Time Stock Data**: Fetches live market data using Finnhub API
- **Technical Analysis**: Calculates RSI, MACD, Bollinger Bands, and more indicators
- **Interactive Charts**: Beautiful price charts powered by Recharts
- **Trading Signals**: AI-powered buy/sell recommendations with risk-reward ratios
- **Support/Resistance Levels**: Automatic calculation of key price levels
- **Modern UI**: Clean, responsive design with TailwindCSS

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

This application is for informational purposes only and does not constitute financial advice. Always do your own research and consult with a financial advisor before making investment decisions. Past performance is not indicative of future results.
