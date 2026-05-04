import FinanceDataReader as fdr
import matplotlib.pyplot as plt

def plot_dubai_crude():
    print("Fetching Dubai Crude Oil data from FRED...")
    
    # FRED에서 두바이유 월간 가격 데이터 가져오기 (ID: POILDUBUSDM)
    # 최근 10년 치 데이터 가져오기 (2014년 이후)
    df = fdr.DataReader('FRED:POILDUBUSDM', '2014-01-01')

    if df.empty:
        print("데이터를 불러오지 못했습니다.")
        return

    # 한글 폰트 설정 (Windows 기준)
    plt.rc('font', family='Malgun Gothic')
    plt.rcParams['axes.unicode_minus'] = False # 마이너스 기호 깨짐 방지

    # 그래프 그리기
    plt.figure(figsize=(10, 6))
    plt.plot(df.index, df['POILDUBUSDM'], label='두바이유 가격(월간)', color='darkred')
    plt.title('두바이유 가격 추이 (최근 10년)')
    plt.xlabel('날짜')
    plt.ylabel('가격 (USD/배럴)')
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.7)
    
    # 이미지로 저장
    output_filename = 'dubai_crude.png'
    plt.tight_layout()
    plt.savefig(output_filename)
    print(f"그래프가 {output_filename}로 저장되었습니다.")

if __name__ == "__main__":
    plot_dubai_crude()
