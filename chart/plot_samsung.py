import yfinance as yf
import matplotlib.pyplot as plt

def plot_samsung_stock():
    # 삼성전자 종목 코드: 005930.KS
    ticker = '005930.KS'
    print(f"Fetching data for {ticker}...")
    
    # yfinance를 사용하여 최근 1년간의 데이터 가져오기
    samsung = yf.Ticker(ticker)
    df = samsung.history(period="1y")

    if df.empty:
        print("데이터를 불러오지 못했습니다.")
        return

    # 한글 폰트 설정 (Windows 기준)
    plt.rc('font', family='Malgun Gothic')
    plt.rcParams['axes.unicode_minus'] = False # 마이너스 기호 깨짐 방지

    # 그래프 그리기
    plt.figure(figsize=(10, 6))
    plt.plot(df.index, df['Close'], label='종가', color='blue')
    plt.title('삼성전자 주가 (최근 1년)')
    plt.xlabel('날짜')
    plt.ylabel('주가 (원)')
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.7)
    
    # 이미지로 저장
    output_filename = 'samsung_stock.png'
    plt.tight_layout()
    plt.savefig(output_filename)
    print(f"그래프가 {output_filename}로 저장되었습니다.")
    
    # 화면에 출력 (스크립트로 실행시 창이 뜰 수 있음)
    # plt.show()

if __name__ == "__main__":
    plot_samsung_stock()
