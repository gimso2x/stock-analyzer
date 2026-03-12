import { OpenAI } from 'openai';

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || '',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const symbolUpper = symbol.toUpperCase();

    // 1. 기본 주식 데이터 및 지표를 가져오는 내부 API 호출 (또는 직접 fetch)
    const host = request.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const dataResponse = await fetch(`${protocol}://${host}/api/stock/${symbolUpper}`);
    
    if (!dataResponse.ok) {
      throw new Error('Failed to fetch stock data for AI report');
    }

    const data = await dataResponse.json();
    const { quote, companyInfo, indicators } = data;

    // 2. NVIDIA NIM 프롬프트 구성
    const isLeveragedETF = companyInfo.name?.includes('Bull') || companyInfo.name?.includes('Bear') ||
                          symbolUpper.includes('SOXL') || symbolUpper.includes('SOXS') ||
                          symbolUpper.includes('TQQQ') || symbolUpper.includes('SQQQ');

    const leveragedWarning = isLeveragedETF ? `
⚠️ 레버리지 ETF 중요 경고
${companyInfo.name}은(는) 레버리지 ETF입니다!
리스크 | 설명
---|---
일간 손실 누적 | 하루 -10% 손실 × 레버리지 배수 = 더 큰 손실 (복리 효과)
장기 보유 위험 | 장기 보유 시 손실 누적 가능성 높음
높은 변동성 | 기초 자산 변동성 × 레버리지 배수
롤링 리스크 | 일일 리밸런싱으로 인한 손실 누적 가능
` : '';

    const prompt = `당신은 전문 주식 분석가입니다. 다음 주식 데이터를 바탕으로 반드시 지정된 마크다운 구조를 준수하여 상세한 기술적 분석 리포트를 한국어로 작성해주세요.
모든 섹션 제목은 반드시 '##' 또는 '###'를 사용하는 마크다운 헤더 형식을 지켜야 하며, 표 데이터는 반드시 마크다운 표 형식을 사용하세요.

# ${companyInfo.name} (${symbolUpper}) 기술적 분석 리포트

**분석일:** ${new Date().toLocaleDateString('ko-KR')}
**현재가격:** $${quote.c} (${quote.d >= 0 ? '+' : ''}${quote.d}) (${quote.dp}%)
**시가총액:** ${companyInfo.marketCapitalization ? `$${(companyInfo.marketCapitalization / 1000000).toFixed(2)}M` : 'N/A'}

---

## 🎯 요약 추천
| 항목 | 평가 |
|------|------|
| 추천 상태 | 기술적 지표 기반 추천 (강력 매수/매수/보유/매도/강력 매도) |
| 전반적 추세 | 현재 가격과 이동평균선 대비 추세 분석 |
| 일관성 신호 | 이동평균선 vs 모멘텀 지표 신호 일치 여부 |
| 리스크/리워드 | 기술적 지표 기반 리스크-리워드 평가 |
| 자금 배분 | 포지션 사이징 제안 (보통~공격적) |

## 📈 기술적 지표 분석

### 1. 모멘텀 지표
| 지표 | 현재값 | 신호 | 해석 |
|------|--------|------|------|
| RSI(14) | ${indicators?.rsi14?.toFixed(2) || 'N/A'} | ${indicators?.rsi14 > 70 ? '🔴 과매수' : indicators?.rsi14 < 30 ? '🟢 과매도' : '⚪ 중립'} | 70+ 과매수, 30- 과매도, 45-70 매수권, 30-45 보수적 매수 |
| Stochastic %K | ${indicators?.stochasticK?.toFixed(2) || 'N/A'} | ${indicators?.stochasticK > 80 ? '🔴 과매수' : indicators?.stochasticK < 20 ? '🟢 과매도' : '⚪ 중립'} | 상승/하락 모멘텀 확인 |
| MACD | ${indicators?.macd?.toFixed(2) || 'N/A'} | ${indicators?.macd && indicators?.macdSignal && indicators.macd > indicators.macdSignal ? '🟢 매수' : '🔴 매도'} | 시그널 라인 기준 교차 여부 |
| MACD Histogram | ${indicators?.macdHistogram?.toFixed(2) || 'N/A'} | 양수/음수 추세 강도 | 모멘텀 방향과 강도 |

### 2. 추세 지표
| 지표 | 상태 | 신호 | 해석 |
|------|--------|------|------|
| SMA20 ($${indicators?.sma20?.toFixed(2) || 'N/A'}) | ${quote.c > indicators?.sma20 ? '🟢 상위' : '🔴 하위'} | 가격 위치 | 단기 추세 |
| SMA50 ($${indicators?.sma50?.toFixed(2) || 'N/A'}) | ${quote.c > indicators?.sma50 ? '🟢 상위' : '🔴 하위'} | 가격 위치 | 중기 추세 |
| SMA200 ($${indicators?.sma200?.toFixed(2) || 'N/A'}) | ${quote.c > indicators?.sma200 ? '🟢 상위' : '🔴 하위'} | 가격 위치 | 장기 추세 |
| 요약 신호 | ${(quote.c > indicators?.sma50 && indicators?.rsi14 > 50) ? '🟢 매수' : (quote.c < indicators?.sma50 && indicators?.rsi14 < 50) ? '🔴 매도' : '⚪ 중립'} | 매수권/매도권 여부 | SMA 대비 종합 추세 |

### 3. 변동성
| 지표 | 현재값 | 신호 | 해석 |
|------|--------|------|------|
| 볼린저 밴드 상단 | $${indicators?.bollingerUpper?.toFixed(2) || 'N/A'} | | 상단 밴드 근접 시 과매수 가능성 |
| 볼린저 밴드 하단 | $${indicators?.bollingerLower?.toFixed(2) || 'N/A'} | | 하단 밴드 근접 시 과매도 가능성 |
| 밴드 폭 | ${indicators?.bollingerUpper && indicators?.bollingerLower ? ((indicators.bollingerUpper - indicators.bollingerLower) / quote.c * 100).toFixed(2) + '%' : 'N/A'} | 변동성 레벨 | 밴드 폭 확대 = 높은 변동성 |

## 🎨 추세 분석
현재 상황:
- 현재가: $${quote.c}
- 전일 종가: $${quote.pc} (${quote.d >= 0 ? '+' : ''}${quote.d})
- 전일 대비: ${quote.d >= 0 ? '+' : ''}${quote.dp}%
- 52주 고점: $${quote.h}
- 52주 저점: $${quote.l}
- 현재 52주 범위 위치: ${((quote.c - quote.l) / (quote.h - quote.l) * 100).toFixed(0)}%

주요 기술적 레벨:
- 저항 3: $${quote.h} (52주 고점)
- 저항 2: 직전 고가 대비 +5%
- 저항 1: $${(quote.pc * 1.05).toFixed(2)} (전일 종가 +5%)
- 현재가: $${quote.c} (${quote.d >= 0 ? '+' : ''}${quote.dp}%)
- 지지 1: $${indicators?.sma20?.toFixed(2) || 'N/A'} (20일 SMA)
- 지지 2: $${indicators?.sma50?.toFixed(2) || 'N/A'} (50일 SMA)
- 지지 3: $${quote.l} (52주 저점)

## 🔮 시나리오 분석

### 상승 시나리오 (Bull Case):
- MACD가 시그널 라인 위로 확고한 상승 유지
- RSI가 50-65 구간 안정화
- 가격이 50일 SMA 위로 확고한 돌파
- 거래량 증가와 함께 상승
- 저항 1($${(quote.pc * 1.05).toFixed(2)}) 돌파 → 저항 2 달성 가능

### 하락 시나리오 (Bear Case):
- RSI가 다시 30 미만으로 하락
- MACD가 시그널 라인 교차 아래로 전환
- 20일 SMA 하방 지지 붕괴
- 거래량 감소와 함께 하락
- 지지 2($${indicators?.sma50?.toFixed(2) || (quote.pc * 0.95).toFixed(2)}) 붕괴 시 추가 하락

${leveragedWarning}

## 💡 실전 트레이딩 전략

### 진입 전략 (Entry):

보수적 진입:
- 가격: $${indicators?.sma50?.toFixed(2) || 'N/A'} 근처 (50일 SMA 지지)
- 조건:
  - RSI 30-45 과매도 구간
  - MACD 하락 둔화 및 역전 신호
  - 50일 SMA 붕괴 확인

공격적 진입:
- 가격: $${(quote.pc * 0.98).toFixed(2)} - $${(quote.pc * 1.02).toFixed(2)} (현재 가격 근처)
- 조건:
  - RSI 50-60 안정화
  - MACD 상승 추세 확인
  - 가격이 20일 SMA 위 확인

### 손절/익절 (Exit Strategy):

| 전략 | 가격 | 이유 |
|------|------|------|
| 손절 (SL) | $${(quote.pc * 0.95).toFixed(2)} | 전일 종가 기준 -5% 또는 50일 SMA 하방 손절 |
| 익절 1 (TP1) | $${(quote.pc * 1.05).toFixed(2)} | 1:1 리스크/리워드, 첫 번째 물량 분 매도 |
| 익절 2 (TP2) | $${(quote.pc * 1.10).toFixed(2)} | 1:2 리스크/리워드, 두 번째 물량 분 매도 |
| 익절 3 (TP3) | $${(quote.pc * 1.15).toFixed(2)} | 1:3 리스크/리워드, 잔여 매도 |

## ⚠️ 핵심 주의사항

기술적 지표 현재 상황:
- 모멘텀 지표: ${indicators?.rsi14 > 50 ? '강함' : '약함'} (RSI 기준)
- 추세 지표: ${quote.c > indicators?.sma50 ? '상승' : '하락'} (50일 SMA 기준)
- 볼린저 밴드: ${quote.c > indicators?.bollingerMiddle ? '상단 밴드 근처' : '하단 밴드 근처'}

실전 팁:
✅ DO:
1. 시초/종매 전후 변동성 체크
2. 거래량이 평균 대비 20% 이상 증가 시 신뢰도 상승
3. 손절은 철저하게 실행 (감정 결정 금지)
4. 다른 기술적 지표와 확인 후 진입

❌ DON'T:
1. 기술적 지표 혼합 시 무리한 진입
2. 손실이 -10% 이상 확대 시 추가 매수 보유 (마틴게일 금지)
3. 한 종목에 전체 자본의 20% 이상 투자
4. 뉴스나 이슈 없는 급등/급락에 추격 매매

## 📝 결론

기술적 분석 기반 종합 의견:
- 현재 기술적 상태: ${indicators?.rsi14 > 50 && quote.c > indicators?.sma50 ? '상승 추세 강함' : indicators?.rsi14 > 50 || quote.c > indicators?.sma50 ? '혼합 신호, 관망 권장' : '하락 추세, 관망 권장'}
- 단기 전망: ${indicators?.macd > indicators?.macdSignal ? '긍정적' : '부정적'}
- 추천: ${indicators?.rsi14 > 50 && quote.c > indicators?.sma50 ? '매수 권장' : '관망 권장'}

---

⚠️ 면책 조항: 이 분석은 정보 제공용 목적으로만 제공되며, 금융 조언이 아닙니다. 자신만의 조사를 수행하고 리스크를 완전히 이해한 후 거래하세요. 과거의 성과가 미래의 결과를 보장하지 않습니다.
    `;

    // 3. NVIDIA NIM API 호출
    const response = await client.chat.completions.create({
      model: 'meta/llama-3.1-70b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2048,
    });

    return Response.json({
      symbol: symbolUpper,
      report: response.choices[0].message.content,
    });

  } catch (error) {
    console.error('Error generating AI report:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to generate AI report' },
      { status: 500 }
    );
  }
}
