# Backend Setup with Flask + yfinance

## Prerequisites
- Python 3.7+
- pip

## Installation

```bash
cd backend
pip install -r requirements.txt
```

## Running Flask API Server

```bash
python app.py
```

Server will start on port 5000.

## API Endpoints

### GET /api/stock/{symbol}
Returns quote, candles, and company info.

Example:
```bash
curl http://localhost:5000/api/stock/NVIA
```

## Note
- Both Next.js (port 2002) and Flask (port 5000) run in parallel
- Next.js fetches data from Flask API
- yfinance provides free, unlimited access to stock data
