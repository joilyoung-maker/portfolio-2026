import FinanceDataReader as fdr
import yfinance as yf

# ETF 목록에서 TIGER 배당커버드콜액티브 검색
try:
    df = fdr.StockListing('ETF/KR')
    result = df[df['Name'].str.contains('TIGER 배당커버드콜액티브', na=False)]
    
    if not result.empty:
        symbol = result.iloc[0]['Symbol']
        name = result.iloc[0]['Name']
        print(f"=== {name} ({symbol}) ===")
        
        ticker = yf.Ticker(f"{symbol}.KS")
        hist = ticker.history(start='2025-01-01')
        
        if 'Dividends' not in hist.columns:
            print("배당 데이터 필드가 없습니다.")
        else:
            ex_divs = hist[hist['Dividends'] > 0]
            if ex_divs.empty:
                print("해당 기간에 권리락(분배락) 데이터가 없습니다.")
            else:
                for date, row in ex_divs.iterrows():
                    print(f"날짜: {date.strftime('%Y-%m-%d')} | 종가: {row['Close']:,.0f}원 | 분배금: {row['Dividends']:,.0f}원")
    else:
        print("해당 이름의 ETF를 찾지 못했습니다.")
except Exception as e:
    print(f"오류 발생: {e}")
