document.addEventListener('DOMContentLoaded', () => {
    const aqiValueEl = document.getElementById('aqi-value');
    const aqiStatusTextEl = document.getElementById('aqi-status-text');
    const aqiDescEl = document.getElementById('aqi-desc');
    const pm25ValueEl = document.getElementById('pm25-value');
    const pm10ValueEl = document.getElementById('pm10-value');
    const o3ValueEl = document.getElementById('o3-value');
    const no2ValueEl = document.getElementById('no2-value');
    const currentTimeEl = document.getElementById('current-time');
    const refreshBtn = document.getElementById('refresh-btn');

    // 상태에 따른 텍스트 및 설명 정의
    const statusMap = {
        'good': { text: '좋음', desc: '공기가 아주 깨끗합니다. 야외 활동을 즐기기에 완벽한 날씨예요!', class: 'status-good' },
        'moderate': { text: '보통', desc: '대체로 무난한 공기 질입니다. 가벼운 산책을 하기 좋습니다.', class: 'status-moderate' },
        'unhealthy': { text: '나쁨', desc: '미세먼지 수치가 높습니다. 마스크 착용을 권장하며, 무리한 실외 활동은 자제하세요.', class: 'status-unhealthy' },
        'hazardous': { text: '매우 나쁨', desc: '경고! 외출을 최대한 자제하고, 부득이한 경우 반드시 KF94 마스크를 착용하세요.', class: 'status-hazardous' }
    };

    // 현재 시간 포맷팅
    function updateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        currentTimeEl.textContent = `${year}.${month}.${day} ${hours}:${minutes}`;
    }

    // 개별 지표 레벨 클래스 업데이트
    function updateLevelClass(elementId, value, thresholds) {
        const el = document.getElementById(elementId);
        el.className = 'level'; // reset
        if (value <= thresholds[0]) {
            el.classList.add('level-good');
            el.textContent = '좋음';
        } else if (value <= thresholds[1]) {
            el.classList.add('level-moderate');
            el.textContent = '보통';
        } else {
            el.classList.add('level-bad');
            el.textContent = '나쁨';
        }
    }

    // 임의의 측정 데이터 생성 (실제 API 연동 시 이 부분을 대체)
    /*
     * [참고] 실제 공공데이터포털(에어코리아) 연동 시:
     * 1. URL: http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty
     * 2. 파라미터: stationName="부평", dataTerm="DAILY", pageNo="1", numOfRows="1", returnType="json"
     * 3. serviceKey="사용자의_API_키"
     */
    function fetchAirQualityData() {
        // 새로고침 애니메이션
        refreshBtn.classList.add('spinning');
        setTimeout(() => refreshBtn.classList.remove('spinning'), 1000);

        // 시간 업데이트
        updateTime();

        // 시뮬레이션을 위한 랜덤 데이터 생성 (실제 환경과 유사하게)
        // 데모 목적으로 다양한 상태를 보여주기 위해 랜덤 범위를 넓게 설정
        const randomAQI = Math.floor(Math.random() * 200) + 10;
        
        let statusKey = 'good';
        if (randomAQI > 50 && randomAQI <= 100) statusKey = 'moderate';
        else if (randomAQI > 100 && randomAQI <= 150) statusKey = 'unhealthy';
        else if (randomAQI > 150) statusKey = 'hazardous';

        const statusInfo = statusMap[statusKey];

        // UI 업데이트
        aqiValueEl.textContent = randomAQI;
        aqiStatusTextEl.textContent = statusInfo.text;
        aqiDescEl.textContent = statusInfo.desc;

        // 배경 테마 변경
        document.body.className = statusInfo.class;

        // 세부 지표 시뮬레이션
        // AQI 수치에 비례하여 생성
        const pm25 = Math.floor(randomAQI * (Math.random() * 0.4 + 0.3));
        const pm10 = Math.floor(randomAQI * (Math.random() * 0.5 + 0.5));
        const o3 = (Math.random() * 0.08).toFixed(3);
        const no2 = (Math.random() * 0.05).toFixed(3);

        pm25ValueEl.textContent = pm25;
        pm10ValueEl.textContent = pm10;
        o3ValueEl.textContent = o3;
        no2ValueEl.textContent = no2;

        // 세부 지표 상태 라벨 업데이트 (임의의 기준치 적용)
        updateLevelClass('pm25-level', pm25, [15, 35]);
        updateLevelClass('pm10-level', pm10, [30, 80]);
        updateLevelClass('o3-level', o3, [0.030, 0.090]);
        updateLevelClass('no2-level', no2, [0.030, 0.060]);
    }

    // 이벤트 리스너 등록
    refreshBtn.addEventListener('click', fetchAirQualityData);

    // 초기 로드 시 데이터 가져오기
    fetchAirQualityData();
});
