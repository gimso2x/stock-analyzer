from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

def get_stock_data(symbol):
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period='3mo', interval='1d')

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

        return {
            'quote': quote, 
            'candle': candle, 
            'company_info': company_info,
            'analysis': analysis
        }

    except Exception as e:
        print(f"Error fetching data for {symbol}: {e}")
        return None

@app.route('/api/stock/<symbol>', methods=['GET'])
def get_stock(symbol):
    data = get_stock_data(symbol)
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
        
        # 프롬프트 구성
        prompt = f"""
        당신은 전문 주식 분석가입니다. 다음 주식 데이터를 바탕으로 기술적 분석 리포트를 한국어로 작성해주세요.
        마크다운 형식을 사용하고, 투자자에게 도움이 될 만한 인사이트를 포함해주세요.
        
        - 종목: {company['name']} ({symbol})
        - 현재가: {quote['c']}
        - 변동: {quote['d']} ({quote['dp']}%)
        - 주요 지표: RSI {data.get('indicators', {}).get('rsi14', 'N/A')}, MACD {data.get('indicators', {}).get('macd', 'N/A')}
        
        리포트에는 '기술적 요약', '투자 심리', '단기 전망' 섹션을 포함해주세요.
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
