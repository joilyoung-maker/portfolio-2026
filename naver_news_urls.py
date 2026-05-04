import requests
from bs4 import BeautifulSoup
import re
import time
import csv

def get_original_urls(list_url, output_file="news_urls.csv"):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    print(f"Fetching news list from: {list_url}", flush=True)
    try:
        response = requests.get(list_url, headers=headers)
        response.encoding = 'euc-kr' # Naver Finance uses euc-kr
        soup = BeautifulSoup(response.text, 'html.parser')
    except Exception as e:
        print(f"Error fetching list: {e}", flush=True)
        return

    # Find all news links
    news_items = []
    links = soup.find_all('a', href=True)
    
    seen_articles = set()
    for a in links:
        href = a['href']
        title = a.get_text(strip=True)
        
        # Match article_id and office_id to construct n.news.naver.com URL
        match = re.search(r'article_id=(\d+)&office_id=(\d+)', href)
        if match and len(title) > 5: 
            article_id = match.group(1)
            office_id = match.group(2)
            article_key = f"{office_id}_{article_id}"
            
            if article_key not in seen_articles:
                seen_articles.add(article_key)
                naver_news_url = f"https://n.news.naver.com/mnews/article/{office_id}/{article_id}"
                news_items.append({
                    'title': title,
                    'naver_url': naver_news_url
                })

    print(f"Found {len(news_items)} unique news items. Fetching original URLs...", flush=True)

    results = []
    for i, item in enumerate(news_items):
        try:
            print(f"[{i+1}/{len(news_items)}] Processing: {item['title'][:30]}...", flush=True)
            time.sleep(0.3) # Respectful delay
            
            res = requests.get(item['naver_url'], headers=headers)
            res.encoding = 'utf-8'
            article_soup = BeautifulSoup(res.text, 'html.parser')
            
            # Selector for "기사원문" link
            origin_link = article_soup.select_one('a.media_end_head_origin_link')
            
            original_url = origin_link['href'] if origin_link else "N/A (Naver Exclusive)"
            results.append([item['title'], original_url])
            
        except Exception as e:
            print(f"Error processing {item['title']}: {e}", flush=True)

    # Save to CSV
    with open(output_file, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerow(['Title', 'Original URL'])
        writer.writerows(results)

    print(f"\nDone! Results saved to {output_file}", flush=True)
    for title, url in results:
        print(f"Title: {title}\nURL: {url}\n", flush=True)

if __name__ == "__main__":
    target_url = "https://finance.naver.com/news/news_list.naver?mode=LSS3D&section_id=101&section_id2=258&section_id3=401&page=1"
    get_original_urls(target_url)
