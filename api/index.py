from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

def get_stock_data(symbol, period='3mo'):
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period, interval='1d')

        if hist.empty:
            return None

        # Drop rows with NaN in price columns
        hist = hist.dropna(subset=['Open', 'High', 'Low', 'Close'])
        if hist.empty:
            return None

        # Get latest quote
        latest = hist.iloc[-1]
        previous = hist.iloc[-2] if len(hist) > 1 else latest

        c = float(latest['Close'])
        o = float(latest['Open'])
        h = float(latest['High'])
        l = float(latest['Low'])
        pc = float(previous['Close'])
        d = c - pc
        dp = (d / pc) * 100 if pc != 0 else 0

        quote = {
            'c': c,
            'd': d,
            'dp': dp,
            'h': h,
            'l': l,
            'o': o,
            'pc': pc,
            't': int(latest.name.timestamp()),
        }

        # Prepare candles data
        t = [int(x.timestamp() * 1000) for x in hist.index]
        o_data = [float(x) for x in hist['Open']]
        h_data = [float(x) for x in hist['High']]
        l_data = [float(x) for x in hist['Low']]
        c_data = [float(x) for x in hist['Close']]
        v_data = [float(x) if pd.notna(x) else 0 for x in hist['Volume']]

        candle = {
            't': t,
            'o': o_data,
            'h': h_data,
            'l': l_data,
            'c': c_data,
            'v': v_data,
        }

        # Get company info
        info = ticker.info
        
        # Fair Value & Financial Health Data
        analysis = {
            'targetMeanPrice': info.get('targetMeanPrice'),
            'targetHighPrice': info.get('targetHighPrice'),
            'targetLowPrice': info.get('targetLowPrice'),
            'numberOfAnalystOpinions': info.get('numberOfAnalystOpinions'),
            'fiftyTwoWeekLow': info.get('fiftyTwoWeekLow'),
            'fiftyTwoWeekHigh': info.get('fiftyTwoWeekHigh'),
            'currentPrice': info.get('currentPrice', c),
            'financialMetrics': {
                'forwardPE': info.get('forwardPE'),
                'trailingPE': info.get('trailingPE'),
                'priceToBook': info.get('priceToBook'),
                'revenueGrowth': info.get('revenueGrowth'),
                'profitMargins': info.get('profitMargins'),
                'debtToEquity': info.get('debtToEquity'),
                'returnOnEquity': info.get('returnOnEquity'),
                'operatingMargins': info.get('operatingMargins'),
            }
        }

        company_info = {
            'country': info.get('country', 'US'),
            'currency': info.get('currency', 'USD'),
            'exchange': info.get('exchange', 'N/A'),
            'ipo': info.get('ipo', 'N/A'),
            'marketCapitalization': info.get('marketCap', 0) or 0,
            'name': info.get('shortName', info.get('longName', f'{symbol} Corporation')),
            'phone': info.get('phone', 'N/A'),
            'shareOutstanding': info.get('sharesOutstanding', 0) or 0,
            'ticker': symbol,
            'weburl': info.get('website', 'N/A'),
            'logo': info.get('logo_url', ''),
            'finnhubIndustry': info.get('sector', 'Technology'),
        }

        # Calculate technical indicators using pandas
        df = pd.DataFrame(candle)
        
        # 1. SMA
        df['sma20'] = df['c'].rolling(window=20).mean()
        df['sma50'] = df['c'].rolling(window=50).mean()
        df['sma200'] = df['c'].rolling(window=200).mean()
        
        # 2. RSI (14)
        delta = df['c'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi14'] = 100 - (100 / (1 + rs))
        
        # 3. MACD
        exp1 = df['c'].ewm(span=12, adjust=False).mean()
        exp2 = df['c'].ewm(span=26, adjust=False).mean()
        df['macd'] = exp1 - exp2
        df['macdSignal'] = df['macd'].ewm(span=9, adjust=False).mean()
        df['macdHistogram'] = df['macd'] - df['macdSignal']
        
        # 4. Bollinger Bands
        df['bollingerMiddle'] = df['c'].rolling(window=20).mean()
        df['bollingerStd'] = df['c'].rolling(window=20).std()
        df['bollingerUpper'] = df['bollingerMiddle'] + (df['bollingerStd'] * 2)
        df['bollingerLower'] = df['bollingerMiddle'] - (df['bollingerStd'] * 2)

        # 5. True Box Range (Trading Range) & Support/Resistance Calculation
        period_length = len(df)
        lookback = min(60, period_length)
        
        supports = []
        resistances = []
        box_range = None
        
        if lookback >= 20: # Require at least 20 candles for a meaningful box
            recent_df = df.iloc[-lookback:].copy()
            
            # 1. Body-Based Extrema (Ignore wicks)
            recent_df['body_top'] = recent_df[['o', 'c']].max(axis=1)
            recent_df['body_bottom'] = recent_df[['o', 'c']].min(axis=1)
            
            # Finding candidate box using highest body tops and lowest body bottoms
            # Using 90th and 10th percentile to filter out extreme outlier bodies
            top_bound = recent_df['body_top'].quantile(0.95)
            bottom_bound = recent_df['body_bottom'].quantile(0.05)
            
            # 2. Multi-Touch Validation (Margin of 2%)
            margin_ratio = 0.02
            top_margin = top_bound * margin_ratio
            bottom_margin = bottom_bound * margin_ratio
            
            # Count touches (candles where body or wick comes close to the bounds)
            # Resistance touches (High reaches near top bound)
            top_touches = recent_df[recent_df['h'] >= (top_bound - top_margin)]
            # Support touches (Low reaches near bottom bound)
            bottom_touches = recent_df[recent_df['l'] <= (bottom_bound + bottom_margin)]
            
            # 3. Volume Trend Validation
            # Check if recent volume (last 10 days) is lower than the previous period's volume within the box
            vol_half = lookback // 2
            first_half_vol = recent_df['v'].iloc[:vol_half].mean()
            second_half_vol = recent_df['v'].iloc[vol_half:].mean()
            volume_decreasing = (second_half_vol <= first_half_vol * 1.2) # Allow slight bump, but generally not exploding
            
            # 4. Box Range Condition evaluation
            # Needs at least 2 clear touches on both sides, narrow enough range, and not exploding volume
            box_height_ratio = (top_bound - bottom_bound) / bottom_bound
            
            if len(top_touches) >= 2 and len(bottom_touches) >= 2 and box_height_ratio < 0.20 and volume_decreasing:
                box_range = {
                    'low': float(bottom_bound),
                    'high': float(top_bound),
                    'start_time': int(candle['t'][-lookback]),
                    'end_time': int(candle['t'][-1])
                }
                supports = [float(bottom_bound)]
                resistances = [float(top_bound)]
            else:
                # Fallback purely for Support/Resistance lines if Box fails conditions
                # Use recent local mins/maxs
                window = 10
                recent_df['min'] = recent_df['l'].rolling(window=window, center=True).min()
                recent_df['max'] = recent_df['h'].rolling(window=window, center=True).max()
                
                local_supports = recent_df[recent_df['l'] == recent_df['min']]['l'].unique().tolist()
                local_resistances = recent_df[recent_df['h'] == recent_df['max']]['h'].unique().tolist()
                
                current_price = c
                supports = sorted([float(s) for s in local_supports if s < current_price], reverse=True)[:1]
                resistances = sorted([float(r) for r in local_resistances if r > current_price])[:1]

        # Get latest indicators for summary
        latest_idx = -1
        indicators = {
            'rsi14': float(df['rsi14'].iloc[latest_idx]) if not pd.isna(df['rsi14'].iloc[latest_idx]) else None,
            'macd': float(df['macd'].iloc[latest_idx]) if not pd.isna(df['macd'].iloc[latest_idx]) else None,
            'macdSignal': float(df['macdSignal'].iloc[latest_idx]) if not pd.isna(df['macdSignal'].iloc[latest_idx]) else None,
            'macdHistogram': float(df['macdHistogram'].iloc[latest_idx]) if not pd.isna(df['macdHistogram'].iloc[latest_idx]) else None,
            'sma20': float(df['sma20'].iloc[latest_idx]) if not pd.isna(df['sma20'].iloc[latest_idx]) else None,
            'sma50': float(df['sma50'].iloc[latest_idx]) if not pd.isna(df['sma50'].iloc[latest_idx]) else None,
            'sma200': float(df['sma200'].iloc[latest_idx]) if not pd.isna(df['sma200'].iloc[latest_idx]) else None,
            'bollingerUpper': float(df['bollingerUpper'].iloc[latest_idx]) if not pd.isna(df['bollingerUpper'].iloc[latest_idx]) else None,
            'bollingerMiddle': float(df['bollingerMiddle'].iloc[latest_idx]) if not pd.isna(df['bollingerMiddle'].iloc[latest_idx]) else None,
            'bollingerLower': float(df['bollingerLower'].iloc[latest_idx]) if not pd.isna(df['bollingerLower'].iloc[latest_idx]) else None,
        }

        return {
            'quote': quote, 
            'candle': candle, 
            'company_info': company_info,
            'analysis': analysis,
            'indicators': indicators,
            'support_resistance': {
                'supports': [float(s) for s in supports],
                'resistances': [float(r) for r in resistances]
            },
            'box_range': box_range
        }

    except Exception as e:
        print(f"Error fetching data for {symbol} with period {period}: {e}")
        return None

@app.route('/api/stock/<symbol>', methods=['GET'])
def get_stock(symbol):
    period = request.args.get('period', '3mo')
    data = get_stock_data(symbol, period)
    if data:
        return jsonify(data)
    return jsonify({'error': f'Failed to fetch data for {symbol}'}), 404

import os
from openai import OpenAI

# NVIDIA NIM 설정
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=NVIDIA_API_KEY
)

@app.route('/api/ai-report/<symbol>', methods=['GET'])
def get_ai_report(symbol):
    try:
        # 데이터 수집 (기존 함수 재사용)
        data = get_stock_data(symbol)
        if not data:
            return jsonify({'error': 'Failed to fetch data for AI report'}), 404

        quote = data['quote']
        company = data['company_info']
        
        indicators = data.get('indicators', {})
        
        # 프롬프트 구성 (지표 데이터 포함 보완)
        prompt = f"""
        당신은 전문 주식 분석가입니다. 다음 주식 데이터를 바탕으로 기술적 분석 리포트를 한국어로 작성해주세요.
        마크다운 형식을 사용하고, 투자자에게 도움이 될 만한 인사이트를 포함해주세요.
        
        - 종목: {company['name']} ({symbol})
        - 현재가: ${quote['c']}
        - 변동: {quote['d']:.2f} ({quote['dp']:.2f}%)
        - 주요 지표: 
          - RSI(14): {indicators.get('rsi14', 'N/A')}
          - MACD: {indicators.get('macd', 'N/A')}
          - MACD Signal: {indicators.get('macdSignal', 'N/A')}
          - SMA20: {indicators.get('sma20', 'N/A')}
          - SMA50: {indicators.get('sma50', 'N/A')}
        
        리포트에는 '기술적 요약', '투자 심리', '단기 전망' 섹션을 포함해주세요.
        지표 값을 구체적으로 인용하여 분석해주세요.
        """

        response = client.chat.completions.create(
            model="meta/llama-3.1-405b-instruct",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=1024
        )

        return jsonify({
            'symbol': symbol,
            'report': response.choices[0].message.content
        })

    except Exception as e:
        print(f"Error generating AI report for {symbol}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'Flask API is running'})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
