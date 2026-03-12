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

        return {'quote': quote, 'candle': candle, 'company_info': company_info}

    except Exception as e:
        print(f"Error fetching data for {symbol}: {e}")
        return None

@app.route('/api/stock/<symbol>', methods=['GET'])
def get_stock(symbol):
    data = get_stock_data(symbol)
    if data:
        return jsonify(data)
    return jsonify({'error': f'Failed to fetch data for {symbol}'}), 404

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'Flask API is running'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
