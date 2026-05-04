import pandas as pd
import OpenDartReader
import sys

# DART API KEY 설정
# 금융감독원 전자공시시스템(https://opendart.fss.or.kr/)에서 발급받은 API 키를 입력하세요.
API_KEY = "4338ae2d129f11d968ccc973f03a7432df2f4d0c"

def main():
    if API_KEY == "YOUR_DART_API_KEY_HERE":
        print("경고: DART API 키가 설정되지 않았습니다.")
        print("API_KEY 변수를 발급받은 키로 변경해주세요.")
        return

    # DART 객체 생성
    print("DART 객체를 초기화합니다...")
    dart = OpenDartReader(API_KEY)
    
    # 분석할 기업과 기준 연도 설정
    company_name = "SK하이닉스"
    year = 2023 
    
    print(f"[{company_name}] {year}년도 사업보고서 재무제표를 불러옵니다...")
    
    try:
        # reprt_code='11011' : 사업보고서 (보통 1년치 확정 데이터와 함께 과거 2개년 데이터 포함)
        df = dart.finstate(company_name, year, reprt_code='11011')
    except Exception as e:
        print(f"데이터를 불러오는 중 오류가 발생했습니다: {e}")
        return

    if df is None or df.empty:
        print("데이터를 찾을 수 없거나 기업명을 잘못 입력했습니다.")
        return

    # 연결재무제표의 손익계산서 데이터만 필터링
    # 연결 기준이 없을 경우를 대비하여 조건 필터링
    df_is = df[(df['sj_nm'] == '손익계산서') | (df['sj_nm'] == '포괄손익계산서')]
    
    # 추출할 주요 계정명 (DART 기업마다 표기 방식이 다를 수 있으므로 여러 이름 지원)
    target_accounts = {
        '매출액': ['매출액', '수익(매출액)'],
        '영업이익': ['영업이익', '영업이익(손실)'],
        '당기순이익': ['당기순이익', '당기순이익(손실)', '연결당기순이익', '반기순이익']
    }
    
    analysis_data = []

    for kpi, names in target_accounts.items():
        # 여러 후보 중 일치하는 계정 추출
        acc_data = df_is[df_is['account_nm'].isin(names)]
        if acc_data.empty:
            continue
            
        acc_data = acc_data.iloc[0] # 중복 계정이 있을 경우 첫 번째 데이터 사용
        
        # 문자열로 된 금액을 정수로 변환하는 함수 (쉼표 제어, 결측치 처리)
        def parse_amount(val):
            if pd.isna(val) or val == '' or val == '-':
                return 0
            try:
                return float(str(val).replace(',', ''))
            except ValueError:
                return 0
            
        current_amount = parse_amount(acc_data['thstrm_amount'])   # 당기
        prev_amount = parse_amount(acc_data['frmtrm_amount'])      # 전기
        prev2_amount = parse_amount(acc_data['bfefrmtrm_amount'])  # 전전기
        
        analysis_data.append({
            '계정명': kpi,
            f'{year-2}년': prev2_amount,
            f'{year-1}년': prev_amount,
            f'{year}년': current_amount
        })

    if not analysis_data:
         print("지정한 계정명(매출액, 영업이익, 당기순이익)을 찾을 수 없습니다.")
         return

    # Series/DataFrame 기반 연산을 위해 '계정명'을 인덱스로 설정
    result_df = pd.DataFrame(analysis_data)
    result_df.set_index('계정명', inplace=True)
    
    print("\n--- 요약 재무 데이터 (단위: 원) ---")
    print(result_df)
    
    # 재무 분석: 주요 수익성 지표(마진율) 계산 및 억 원 단위 변환 표시
    print("\n--- 수익성 분석 ---")
    
    try:
        # 단위를 억 원으로 표시하기 위한 배수
        DIV = 100000000 
        
        sales = result_df.loc['매출액']
        op_profit = result_df.loc['영업이익']
        net_profit = result_df.loc['당기순이익']
        
        # 마진율 계산 (영업이익률, 순이익률)
        op_margin = (op_profit / sales) * 100
        net_margin = (net_profit / sales) * 100
        
        # 분석 요약 데이터프레임 생성
        analysis_summary = pd.DataFrame({
            '매출액(억원)': sales / DIV,
            '영업이익(억원)': op_profit / DIV,
            '영업이익률(%)': op_margin,
            '당기순이익(억원)': net_profit / DIV,
            '순이익률(%)': net_margin
        })
        
        # 소수점 2자리까지만 표시
        print(analysis_summary.round(2))
        
        # 다운로드(저장) 기능 추가: 분석 결과 및 요약 재무 데이터 CSV 파일로 저장
        summary_filename = f"{company_name}_{year}_financial_summary.csv"
        analysis_filename = f"{company_name}_{year}_profitability_analysis.csv"
        
        result_df.to_csv(summary_filename, encoding='utf-8-sig')
        analysis_summary.round(2).to_csv(analysis_filename, encoding='utf-8-sig')
        
        print(f"\n[알림] 분석 데이터가 '{summary_filename}' 및 '{analysis_filename}'로 성공적으로 저장(다운로드)되었습니다.")
        
    except KeyError as e:
         print(f"[분석 오류] 필요한 계정 매칭에 실패했습니다. (없는 계정: {e})")

if __name__ == "__main__":
    main()
