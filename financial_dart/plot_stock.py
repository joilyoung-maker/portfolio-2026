import pandas as pd
import matplotlib.pyplot as plt

# 맑은 고딕 폰트 설정 (윈도우 환경 한국어 깨짐 방지)
plt.rc('font', family='Malgun Gothic')
plt.rcParams['axes.unicode_minus'] = False 

try:
    # 이전에 추출한 CSV 데이터 불러오기 (Date 컬럼을 날짜 형식의 인덱스로 설정)
    df = pd.read_csv('삼성전자_일별주가_2024이후.csv', index_col='Date', parse_dates=True)

    # 그래프 생성
    plt.figure(figsize=(12, 6)) # 너비 12, 높이 6
    
    # 종가 선 그리기
    plt.plot(df.index, df['Close'], label='삼성전자 종가(Close)', color='#1f77b4', linewidth=1.5)

    # 20일 이동평균선 계산 및 그리기
    df['MA20'] = df['Close'].rolling(window=20).mean()
    plt.plot(df.index, df['MA20'], label='20일 이동평균선(MA20)', color='#ff7f0e', linewidth=1.5, linestyle='--')


    # 그래프 제목 및 디자인 요소 추가
    plt.title('삼성전자 일별 주가 추이 (2024.01.01 ~ )', fontsize=15, fontweight='bold', pad=15)
    plt.xlabel('날짜', fontsize=12)
    plt.ylabel('주가 (원)', fontsize=12)
    plt.grid(True, linestyle='--', linewidth=0.5, alpha=0.7)
    
    # x축 날짜 스핀 방지
    plt.xticks(rotation=45)
    
    # 범례 표시
    plt.legend()
    
    # 레이아웃 자동 조정
    plt.tight_layout()

    # 파일로 이미지 저장 (고해상도)
    image_filename = '삼성전자_주가그래프.png'
    plt.savefig(image_filename, dpi=300)
    print(f"성공적으로 그래프가 '{image_filename}' 파일로 저장되었습니다.")
    
except Exception as e:
    print(f"그래프 생성 중 오류가 발생했습니다: {e}")
