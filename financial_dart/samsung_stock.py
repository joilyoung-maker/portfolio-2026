import FinanceDataReader as fdr
import pandas as pd

# 삼성전자 종목코드: 005930
# 2024년 1월 1일 이후 주가 데이터 추출
df = fdr.DataReader('005930', '2024-01-01')

print("=== 삼성전자 일별 주가 (2024-01-01 이후) ===")
print(f"총 {len(df)} 거래일 데이터")

# 처음 5일, 마지막 5일 요약
print("\n[최근 주가 요약]")
print(df.tail(10)[['Open', 'High', 'Low', 'Close', 'Volume']])

# CSV로 저장
filename = "삼성전자_일별주가_2024이후.csv"
df.to_csv(filename, encoding='utf-8-sig')
print(f"\n데이터가 '{filename}' 로 저장되었습니다.")
