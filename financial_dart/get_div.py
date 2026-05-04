import yfinance as yf

# KODEX 200타겟위클리커버드콜 (498400)
ticker = yf.Ticker('498400.KS')
hist = ticker.history(start='2025-01-01')
ex_divs = hist[hist['Dividends'] > 0]

print("=== 2025년 1월 1일 이후 권리락(분배락) 발생일 및 주가 ===")
if ex_divs.empty:
    print("해당 기간에 권리락(분배락) 데이터가 없습니다 (yfinance 기준).")
else:
    for date, row in ex_divs.iterrows():
        print(f"날짜: {date.strftime('%Y-%m-%d')} | 종가: {row['Close']:,.0f}원 | 분배금: {row['Dividends']:,.0f}원")
