import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 조일영님, 종목 코드 및 키워드 기반 금융 뉴스 스크래퍼입니다.
 */
interface NewsItem {
  title: string;
  press: string;
  time: string;
  url: string;
}

class NewsScraper {
  private readonly searchBaseUrl: string = 'https://finance.naver.com/news/news_search.naver?q=';
  private readonly itemBaseUrl: string = 'https://finance.naver.com/item/news.naver?code=';

  /**
   * 종목 코드 또는 키워드로 뉴스를 수집합니다.
   */
  public async scrape(target: string): Promise<NewsItem[]> {
    const isCode = /^\d{6}$/.test(target);
    const url = isCode ? `${this.itemBaseUrl}${target}` : `${this.searchBaseUrl}${encodeURIComponent(target)}`;
    
    console.log(`[${target}] 뉴스 수집 시작: ${url}`);
    
    try {
      const { data: html } = await axios.get(url);
      const $ = cheerio.load(html);
      const newsList: NewsItem[] = [];

      // 종목 뉴스 페이지와 검색 페이지의 구조가 다를 수 있으므로 분기 처리
      if (isCode) {
        $('table.type5 tbody tr').each((_, el) => {
          const titleEl = $(el).find('td.title a');
          const title = titleEl.text().trim();
          const href = titleEl.attr('href');
          const press = $(el).find('td.info').text().trim();
          const time = $(el).find('td.date').text().trim();

          if (title && href) {
            newsList.push({
              title,
              press,
              time,
              url: `https://finance.naver.com${href}`
            });
          }
        });
      } else {
        $('.newsList dt.articleSubject a').each((_, el) => {
          const title = $(el).text().trim();
          const href = $(el).attr('href');
          const press = $(el).parent().next().find('.press').text().trim();
          const time = $(el).parent().next().find('.wdate').text().trim();

          if (title && href) {
            newsList.push({
              title,
              press,
              time,
              url: `https://finance.naver.com${href}`
            });
          }
        });
      }

      return newsList.slice(0, 10);
    } catch (error) {
      console.error('스크래핑 실패:', error);
      return [];
    }
  }

  public saveToCsv(data: NewsItem[], filename: string): void {
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

    const header = 'title,press,time,url\n';
    const rows = data.map(item => 
      `"${item.title.replace(/"/g, '""')}","${item.press}","${item.time}","${item.url}"`
    ).join('\n');

    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, '\ufeff' + header + rows, 'utf8'); // BOM 추가로 엑셀 한글 깨짐 방지
    console.log(`저장 완료: ${filePath}`);
  }
}

// 실행 예시
const scraper = new NewsScraper();
const target = '347700'; // 스피어
scraper.scrape(target).then(news => {
  scraper.saveToCsv(news, `news_${target}.csv`);
});
