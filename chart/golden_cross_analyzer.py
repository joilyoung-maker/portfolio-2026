import FinanceDataReader as fdr
import pandas as pd
import datetime
import warnings

# pandas의 SettingWithCopyWarning 등 불필요한 경고 무시
warnings.filterwarnings('ignore')

def analyze_golden_cross():
    print("코스피 시총 상위 50개 종목을 불러옵니다...")
    kospi = fdr.StockListing('KOSPI')
    
    # 시가총액(Marcap) 기준으로 상위 50개 정렬하여 추출
    kospi['Marcap'] = pd.to_numeric(kospi['Marcap'], errors='coerce')
    top50 = kospi.nlargest(50, 'Marcap')
    
    cross_list = []
    
    # 20일 이동평균선을 계산하기 위해 최근 2달치 데이터 조회
    start_date = (datetime.datetime.today() - datetime.timedelta(days=60)).strftime('%Y-%m-%d')
    
    print("\n시총 상위 50개 종목의 데이터 분석을 시작합니다...")
    
    for index, row in top50.iterrows():
        code = row['Code']
        name = row['Name']
        
        try:
            # 주가 데이터 가져오기
            df = fdr.DataReader(code, start_date)
            
            if len(df) < 20:
                continue # 20일선 계산을 못하는 경우 스킵
            
            # 이동평균선 5일, 20일 계산
            df['MA5'] = df['Close'].rolling(window=5).mean()
            df['MA20'] = df['Close'].rolling(window=20).mean()
            
            df = df.dropna(subset=['MA5', 'MA20'])
            if len(df) < 2:
                continue
                
            # 뒤에서 첫번째(최근 거래일)와 두번째(이전 거래일) 데이터 추출
            prev_day = df.iloc[-2]
            curr_day = df.iloc[-1]
            
            # 골든크로스 조건 확인
            if prev_day['MA5'] <= prev_day['MA20'] and curr_day['MA5'] > curr_day['MA20']:
                cross_list.append({
                    '종목코드': code,
                    '종목명': name,
                    '최근종가': curr_day['Close'],
                    '5일선': curr_day['MA5'],
                    '20일선': curr_day['MA20'],
                    '날짜': df.index[-1].strftime('%Y-%m-%d')
                })
        except Exception as e:
            print(f"Error processing {name} ({code}): {e}")
            
    print("\n=======================================================")
    print(" [ 결과: 최근 영업일 기준 골든크로스 발생 종목 ]")
    print(" (코스피 시가총액 상위 50개 중)")
    print("=======================================================")
    
    if not cross_list:
        print("조건(5일선이 20일선을 상향 돌파)을 만족하는 종목이 현재 없습니다.")
    else:
        for idx, item in enumerate(cross_list):
            print(f"{(idx+1)}. {item['종목명']} ({item['종목코드']})")
            print(f"   - 발생일  : {item['날짜']}")
            print(f"   - 종가    : {item['최근종가']:,.0f}원")
            print(f"   - 5일선   : {item['5일선']:,.1f}원")
            print(f"   - 20일선  : {item['20일선']:,.1f}원\n")
    print("=======================================================")

if __name__ == "__main__":
    analyze_golden_cross()
