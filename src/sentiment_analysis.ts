import * as fs from 'fs';
import * as path from 'path';

/**
 * 조일영님, 수집된 뉴스의 감성 분석(Sentiment Analysis)을 수행하는 스크립트입니다.
 */
interface AnalyzedNews {
  title: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  reason: string;
}

class SentimentAnalyzer {
  public analyze(filePath: string): AnalyzedNews[] {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').slice(1); // 헤더 제외

    return lines.filter(line => line.trim() !== '').map(line => {
      // CSV 파싱 (단순 쉼표 분리 대신 따옴표 고려)
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      const title = matches ? matches[0].replace(/"/g, '') : '';
      
      return this.classify(title);
    });
  }

  private classify(title: string): AnalyzedNews {
    let sentiment: 'Positive' | 'Neutral' | 'Negative' = 'Neutral';
    let reason = '일반적인 정보 전달성 뉴스입니다.';

    if (title.includes('수상') || title.includes('최고') || title.includes('질주') || title.includes('인정')) {
      sentiment = 'Positive';
      reason = '긍정적인 성과(수상, 기술력 인정)가 포함되어 있습니다.';
    } else if (title.includes('노조') || title.includes('이기주의') || title.includes('몽니')) {
      sentiment = 'Negative';
      reason = '노사 갈등이나 산업 내 부정적 리스크가 언급되었습니다.';
    }

    return { title, sentiment, reason };
  }

  public saveReport(data: AnalyzedNews[], filename: string): void {
    const header = 'title,sentiment,reason\n';
    const rows = data.map(item => 
      `"${item.title.replace(/"/g, '""')}","${item.sentiment}","${item.reason}"`
    ).join('\n');

    const filePath = path.join(__dirname, '../data', filename);
    fs.writeFileSync(filePath, header + rows, 'utf8');
  }
}

// 분석 실행
const analyzer = new SentimentAnalyzer();
const results = analyzer.analyze(path.join(__dirname, '../data/hyundai_news.csv'));
analyzer.saveReport(results, 'hyundai_news_analyzed.csv');

console.log('분석이 완료되었습니다. data/hyundai_news_analyzed.csv를 확인하세요.');
