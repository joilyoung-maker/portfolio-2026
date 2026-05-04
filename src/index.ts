/**
 * 조일영님, 기본적인 TypeScript 환경 설정이 완료되었습니다.
 * 이 파일은 프로젝트의 진입점입니다.
 */

interface NewsItem {
  title: string;
  press: string;
  url: string;
  date: string;
}

const main = async () => {
  console.log("금융 뉴스 스크래퍼를 시작합니다...");
  
  // 예시 데이터
  const sampleNews: NewsItem[] = [
    {
      title: "SK하이닉스, 반도체 실적 개선 전망",
      press: "네이버 경제",
      url: "https://finance.naver.com/...",
      date: new Date().toISOString()
    }
  ];

  console.table(sampleNews);
};

main().catch(err => {
  console.error("오류 발생:", err);
});
