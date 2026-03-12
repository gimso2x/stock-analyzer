# Stock Analyzer

한국 및 미국 주식을 위한 실시간 분석 웹 애플리케이션입니다. Next.js, Flask(Python), TypeScript, TailwindCSS로 구축되었습니다.

## Features

- **한국 & 미국 주식 지원**: 코스피(KOSPI), 코스닥(KOSDAQ), 미국 주식 데이터 지원 (`yfinance` 기반)
- **실시간 시장 데이터**: 실시간 주식 데이터 및 상세 재무 지표 제공
- **AI 기술적 분석 리포트**: NVIDIA NIM (Llama 3.1)을 활용한 AI 기반 주식 분석 리포트 생성
- **기술적 분석**: RSI, MACD, 볼린저 밴드 등 다양한 지표 계산
- **인터랙티브 차트**: Recharts를 활용한 가독성 높은 가격 차트
- **모던 UI**: TailwindCSS 4를 활용한 프리미엄 반응형 디자인

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS 4, Recharts, TanStack Query
- **Backend**: Flask (Python), yfinance, OpenAI SDK
- **AI**: NVIDIA NIM (llama-3.1-405b-instruct, llama-3.1-70b-instruct)

## Getting Started

### Prerequisites

- Node.js 18+ 및 pnpm
- Python 3.9+

### Installation

1. 의존성 설치:
```bash
# Frontend
pnpm install

# Backend
pip install -r requirements.txt
```

2. 환경 변수 설정:
```bash
cp .env.local.example .env.local
```

3. **API 키 설정** (`.env.local`):
```bash
# AI 리포트 생성을 위해 필수
NVIDIA_API_KEY=your_nvidia_api_key_here
```

### Development

프론트엔드와 백엔드를 동시에 실행해야 합니다:

1. **Backend (Flask)**:
```bash
# api/index.py 실행
pnpm flask-dev
```

2. **Frontend (Next.js)**:
```bash
pnpm dev
```

## Deployment

### Vercel 배포 (권장)

이 프로젝트는 **Next.js + Python (Flask)** 하이브리드 구조로 설계되어 Vercel에 쉽게 배포할 수 있습니다.

1. **Vercel CLI** 또는 **Vercel Dashboard**에서 프로젝트를 임포트합니다.
2. **Environment Variables** 설정:
   - `NVIDIA_API_KEY`: NVIDIA NIM API 키를 등록합니다.
3. 배포가 완료되면 `vercel.json`의 설정을 통해 `/api/*` 경로가 Python 서버로 자동 라우팅됩니다.

## Project Structure

```
stock-analyzer/
├── app/                  # Next.js App Router (UI & API Routes)
├── api/                  # Python Flask Backend (Data & AI)
├── lib/                  # 공통 유틸리티 및 기술 지표 계산 로직
├── public/               # 정적 자산
└── vercel.json           # Vercel 배포 라우팅 설정
```

## Contact & Copyright

- **제작자**: [stevecode278@gmail.com](mailto:stevecode278@gmail.com)
- **저작권 안내**: 본 프로젝트의 소스 코드 및 디자인에 대한 저작권은 제작자에게 있습니다. **상업적 이용 또는 재배포 시 반드시 제작자의 사전 승인을 받아야 합니다.**

---

## Disclaimer

이 애플리케이션은 정보 제공 목적으로만 제공되며, 투자 조언을 구성하지 않습니다. 투자 결정을 내리기 전에 직접 조사를 수행하고 금융 고문과 상담하세요. 과거의 성과가 미래의 결과를 보장하지 않습니다.
es
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
