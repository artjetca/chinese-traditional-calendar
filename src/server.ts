import http from 'http';
import { getDayInfo, formatDayInfo } from './index.js';
import { ALL_ACTIVITIES, ACTIVITY_CATEGORIES, isActivityAuspicious, getRecommendedJianChuForActivity } from './core/fortune.js';
import { generateCalendarHTML, calendarCSS } from './calendar-view.js';

const PORT = 3000;

function generateHTML(year: number, month: number, day: number, selectedActivity?: string): string {
  const info = getDayInfo(year, month, day);
  
  // 生成活動分類下拉選單
  const activityOptionsHTML = Object.entries(ACTIVITY_CATEGORIES).map(([category, activities]) => {
    const options = activities.map(act => {
      const result = isActivityAuspicious(info.jianChu, act);
      const icon = result === '宜' ? '✓' : result === '忌' ? '✗' : '○';
      const selected = act === selectedActivity ? 'selected' : '';
      return `<option value="${act}" ${selected}>${icon} ${act}</option>`;
    }).join('');
    return `<optgroup label="${category}">${options}</optgroup>`;
  }).join('');

  // 選中活動的結果
  let activityResultHTML = '';
  if (selectedActivity) {
    const result = isActivityAuspicious(info.jianChu, selectedActivity);
    const recommend = getRecommendedJianChuForActivity(selectedActivity);
    const color = result === '宜' ? '#2e7d32' : result === '忌' ? '#c62828' : '#8b7355';
    const icon = result === '宜' ? '✓ 適宜' : result === '忌' ? '✗ 不宜' : '○ 普通';
    activityResultHTML = `
      <div class="activity-result">
        <span class="activity-name" style="color:${color}">${selectedActivity} ${icon}</span>
        <span class="activity-detail">宜日: ${recommend.good.join('、') || '無'} ｜ 忌日: ${recommend.bad.join('、') || '無'}</span>
      </div>`;
  }

  const hourlyHTML = info.hourlyFortune.map(h => {
    const icon = h.fortune === '吉' ? '☆' : h.fortune === '凶' ? '●' : '○';
    const color = h.fortune === '吉' ? '#22c55e' : h.fortune === '凶' ? '#ef4444' : '#6b7280';
    return `<div class="hour-item" style="border-left: 3px solid ${color}">
      <span class="hour-icon">${icon}</span>
      <strong>${h.hourName}</strong> ${h.ganZhi}
      <span class="hour-time">${h.timeRange}</span>
      <span class="hour-fortune" style="color: ${color}">${h.fortune}</span>
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>中國傳統擇日萬年曆</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh; color: #e2e8f0; padding: 20px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { text-align: center; margin-bottom: 20px; color: #fbbf24; }
    .date-picker { 
      display: flex; gap: 10px; justify-content: center; margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .date-picker input, .date-picker button {
      padding: 10px 15px; border-radius: 8px; border: none; font-size: 16px;
    }
    .date-picker input { background: #1e293b; color: #e2e8f0; }
    .date-picker button { 
      background: #fbbf24; color: #1a1a2e; cursor: pointer; font-weight: bold;
    }
    .date-picker button:hover { background: #f59e0b; }
    .card { 
      background: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    }
    .card-title { 
      font-size: 14px; color: #94a3b8; margin-bottom: 10px; 
      border-bottom: 1px solid #334155; padding-bottom: 8px;
    }
    .main-date { font-size: 28px; font-weight: bold; color: #fbbf24; }
    .lunar-date { font-size: 18px; color: #cbd5e1; margin-top: 5px; }
    .ganzhi-row { display: flex; gap: 20px; margin-top: 15px; flex-wrap: wrap; }
    .ganzhi-item { 
      background: #334155; padding: 10px 15px; border-radius: 8px; text-align: center;
    }
    .ganzhi-label { font-size: 12px; color: #94a3b8; }
    .ganzhi-value { font-size: 20px; font-weight: bold; color: #e2e8f0; }
    .ganzhi-nayin { font-size: 11px; color: #fbbf24; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
    .info-item { background: #334155; padding: 12px; border-radius: 8px; }
    .info-label { font-size: 12px; color: #94a3b8; }
    .info-value { font-size: 16px; color: #e2e8f0; margin-top: 4px; }
    .yi-ji { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .yi { background: rgba(34, 197, 94, 0.1); border: 1px solid #22c55e; padding: 15px; border-radius: 8px; }
    .ji { background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 15px; border-radius: 8px; }
    .yi-title { color: #22c55e; font-weight: bold; margin-bottom: 8px; }
    .ji-title { color: #ef4444; font-weight: bold; margin-bottom: 8px; }
    .hourly-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
    .hour-item { 
      background: #334155; padding: 10px; border-radius: 6px; 
      display: flex; align-items: center; gap: 8px; font-size: 14px;
    }
    .hour-icon { font-size: 16px; }
    .hour-time { color: #94a3b8; font-size: 12px; margin-left: auto; }
    .hour-fortune { font-weight: bold; min-width: 20px; }
    .solar-term { 
      display: inline-block; background: #fbbf24; color: #1a1a2e; 
      padding: 4px 12px; border-radius: 20px; font-weight: bold;
    }
    .activity-selector {
      display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
    }
    .activity-selector select {
      padding: 10px 15px; border-radius: 8px; border: none;
      background: #334155; color: #e2e8f0; font-size: 14px; min-width: 200px;
    }
    .activity-selector select optgroup { background: #1e293b; color: #fbbf24; }
    .activity-selector select option { background: #334155; color: #e2e8f0; }
    .activity-result {
      margin-top: 12px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;
    }
    .activity-name { font-size: 16px; font-weight: bold; }
    .activity-detail { font-size: 12px; color: #94a3b8; }
    .quick-activities { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
    .quick-btn {
      padding: 6px 12px; border-radius: 6px; border: 1px solid #475569;
      background: transparent; color: #e2e8f0; cursor: pointer; font-size: 13px;
    }
    .quick-btn:hover { background: #334155; border-color: #fbbf24; }
    .quick-btn.yi { border-color: #22c55e; color: #22c55e; }
    .quick-btn.ji { border-color: #ef4444; color: #ef4444; }
    .calendar-card { 
      background: #faf8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;
      box-shadow: 0 4px 12px rgba(139, 69, 19, 0.15);
    }
    /* 手機版響應式 */
    @media (max-width: 640px) {
      body { padding: 10px; }
      h1 { font-size: 20px; margin-bottom: 15px; }
      .container { padding: 0; }
      .card { padding: 15px; margin-bottom: 15px; border-radius: 10px; }
      .main-date { font-size: 20px; }
      .lunar-date { font-size: 14px; }
      .ganzhi-row { gap: 10px; }
      .ganzhi-item { padding: 8px 10px; }
      .ganzhi-value { font-size: 16px; }
      .info-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .yi-ji { grid-template-columns: 1fr; gap: 10px; }
      .hourly-grid { grid-template-columns: 1fr; }
      .hour-item { padding: 8px; font-size: 13px; }
      .date-picker { gap: 8px; }
      .date-picker input, .date-picker button { padding: 8px 12px; font-size: 14px; }
      .activity-selector { flex-direction: column; align-items: stretch; }
      .activity-selector select { width: 100%; }
      .quick-activities { justify-content: center; }
      .quick-btn { padding: 5px 10px; font-size: 12px; }
      .calendar-card { padding: 12px; border-radius: 10px; }
    }
    ${calendarCSS}
  </style>
</head>
<body>
  <div class="container">
    <h1>🗓️ 中國傳統擇日萬年曆</h1>
    
    <div class="date-picker">
      <input type="date" id="datePicker" value="${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}">
      <button onclick="changeDate()">查詢</button>
      <button onclick="goToday()">今天</button>
    </div>

    <div class="card">
      <div class="main-date">📅 ${year}年${month}月${day}日 ${info.weekday}</div>
      <div class="lunar-date">農曆 ${info.lunarYear}年 ${info.lunarMonthName} ${info.lunarDayName}</div>
      ${info.solarTerm ? `<div style="margin-top:10px"><span class="solar-term">${info.solarTerm}</span></div>` : ''}
      
      <div class="ganzhi-row">
        <div class="ganzhi-item">
          <div class="ganzhi-label">年柱</div>
          <div class="ganzhi-value">${info.yearGanZhi}</div>
          <div class="ganzhi-nayin">${info.yearNaYin}</div>
        </div>
        <div class="ganzhi-item">
          <div class="ganzhi-label">月柱</div>
          <div class="ganzhi-value">${info.monthGanZhi}</div>
          <div class="ganzhi-nayin">${info.monthNaYin}</div>
        </div>
        <div class="ganzhi-item">
          <div class="ganzhi-label">日柱</div>
          <div class="ganzhi-value">${info.dayGanZhi}</div>
          <div class="ganzhi-nayin">${info.dayNaYin}</div>
        </div>
        <div class="ganzhi-item">
          <div class="ganzhi-label">時柱</div>
          <div class="ganzhi-value">${info.hourlyFortune[Math.floor(new Date().getHours() / 2) % 12]?.ganZhi || '—'}</div>
          <div class="ganzhi-nayin">現時</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">基本資訊</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">生肖</div>
          <div class="info-value">${info.zodiac}年</div>
        </div>
        <div class="info-item">
          <div class="info-label">建除</div>
          <div class="info-value">${info.jianChu}日</div>
        </div>
        <div class="info-item">
          <div class="info-label">沖</div>
          <div class="info-value">沖${info.clash}</div>
        </div>
        <div class="info-item">
          <div class="info-label">煞</div>
          <div class="info-value">煞${info.shaDirection}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">宜忌</div>
      <div class="yi-ji">
        <div class="yi">
          <div class="yi-title">✓ 宜</div>
          <div>${info.auspicious.join('、') || '無'}</div>
        </div>
        <div class="ji">
          <div class="ji-title">✗ 忌</div>
          <div>${info.inauspicious.join('、') || '無'}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🔍 活動查詢</div>
      <div class="activity-selector">
        <select id="activitySelect" onchange="checkActivity()">
          <option value="">-- 選擇活動 --</option>
          ${activityOptionsHTML}
        </select>
        <span style="color:#94a3b8;font-size:13px">選擇活動查看今日是否適宜</span>
      </div>
      <div class="quick-activities">
        <span style="color:#94a3b8;font-size:12px;margin-right:5px">常用:</span>
        ${['開市', '動土', '嫁娶', '出行', '祭祀', '入宅', '交易', '立約', '會友', '移徙'].map(act => {
          const r = isActivityAuspicious(info.jianChu, act);
          const cls = r === '宜' ? 'yi' : r === '忌' ? 'ji' : '';
          return `<button class="quick-btn ${cls}" onclick="selectActivity('${act}')">${act}</button>`;
        }).join('')}
      </div>
      ${activityResultHTML}
    </div>

    <div class="calendar-card">
      <div class="month-nav">
        <button onclick="prevMonth()">◀ 上月</button>
        <div class="month-title">📅 ${year}年${month}月</div>
        <button onclick="nextMonth()">下月 ▶</button>
      </div>
      ${generateCalendarHTML(year, month, selectedActivity)}
    </div>

    <div class="card">
      <div class="card-title">時辰吉凶</div>
      <div class="hourly-grid">${hourlyHTML}</div>
    </div>
  </div>

  <!-- 日期詳情彈窗 -->
  <div class="modal-overlay" id="dayModal" onclick="closeModal(event)">
    <div class="modal-content" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h3 id="modalTitle">日期詳情</h3>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body" id="modalBody">載入中...</div>
    </div>
  </div>

  <script>
    function changeDate() {
      const date = document.getElementById('datePicker').value;
      if (date) {
        const activity = document.getElementById('activitySelect').value;
        let url = '/?date=' + date;
        if (activity) url += '&activity=' + encodeURIComponent(activity);
        window.location.href = url;
      }
    }
    function goToday() {
      const today = new Date().toISOString().split('T')[0];
      window.location.href = '/?date=' + today;
    }
    function checkActivity() {
      sessionStorage.setItem('scrollPos', window.scrollY);
      const date = document.getElementById('datePicker').value;
      const activity = document.getElementById('activitySelect').value;
      if (activity) {
        window.location.href = '/?date=' + date + '&activity=' + encodeURIComponent(activity);
      }
    }
    function selectActivity(activity) {
      sessionStorage.setItem('scrollPos', window.scrollY);
      const date = document.getElementById('datePicker').value;
      window.location.href = '/?date=' + date + '&activity=' + encodeURIComponent(activity);
    }
    function goToDate(y, m, d) {
      // 手機版用彈窗，桌機版直接跳轉
      if (window.innerWidth <= 640) {
        showDayModal(y, m, d);
      } else {
        const activity = document.getElementById('activitySelect').value;
        const date = y + '-' + String(m).padStart(2,'0') + '-' + String(d).padStart(2,'0');
        let url = '/?date=' + date;
        if (activity) url += '&activity=' + encodeURIComponent(activity);
        window.location.href = url;
      }
    }
    function showDayModal(y, m, d) {
      const modal = document.getElementById('dayModal');
      const title = document.getElementById('modalTitle');
      const body = document.getElementById('modalBody');
      title.textContent = y + '年' + m + '月' + d + '日';
      body.innerHTML = '載入中...';
      modal.classList.add('show');
      fetch('/api/day?date=' + y + '-' + String(m).padStart(2,'0') + '-' + String(d).padStart(2,'0'))
        .then(r => r.json())
        .then(data => {
          body.innerHTML = \`
            <div class="modal-section">
              <div class="modal-section-title">農曆</div>
              <div class="modal-lunar">\${data.lunarYear}年 \${data.lunarMonthName} \${data.lunarDayName}</div>
            </div>
            <div class="modal-section">
              <div class="modal-section-title">干支四柱</div>
              <div class="modal-ganzhi">
                <div class="modal-ganzhi-item"><div class="modal-ganzhi-label">年柱</div><div class="modal-ganzhi-value">\${data.yearGanZhi}</div></div>
                <div class="modal-ganzhi-item"><div class="modal-ganzhi-label">月柱</div><div class="modal-ganzhi-value">\${data.monthGanZhi}</div></div>
                <div class="modal-ganzhi-item"><div class="modal-ganzhi-label">日柱</div><div class="modal-ganzhi-value">\${data.dayGanZhi}</div></div>
                <div class="modal-ganzhi-item"><div class="modal-ganzhi-label">時柱</div><div class="modal-ganzhi-value">\${data.hourlyFortune[Math.floor(new Date().getHours() / 2) % 12]?.ganZhi || '—'}</div></div>
              </div>
            </div>
            <div class="modal-section">
              <div class="modal-section-title">宜忌</div>
              <div class="modal-yi-ji">
                <div class="modal-yi"><div class="modal-yi-title">✓ 宜</div><div class="modal-yi-list">\${data.auspicious.join('、') || '無'}</div></div>
                <div class="modal-ji"><div class="modal-ji-title">✗ 忌</div><div class="modal-ji-list">\${data.inauspicious.join('、') || '無'}</div></div>
              </div>
            </div>
            <div class="modal-section">
              <div class="modal-section-title">其他資訊</div>
              <div class="modal-info-grid">
                <div class="modal-info-item"><div class="modal-info-label">生肖</div><div class="modal-info-value">\${data.zodiac}年</div></div>
                <div class="modal-info-item"><div class="modal-info-label">建除</div><div class="modal-info-value">\${data.jianChu}日</div></div>
                <div class="modal-info-item"><div class="modal-info-label">沖</div><div class="modal-info-value">沖\${data.clash}</div></div>
                <div class="modal-info-item"><div class="modal-info-label">煞</div><div class="modal-info-value">煞\${data.shaDirection}</div></div>
                \${data.solarTerm ? '<div class="modal-info-item"><div class="modal-info-label">節氣</div><div class="modal-info-value">' + data.solarTerm + '</div></div>' : ''}
              </div>
            </div>
            <div class="modal-section">
              <div class="modal-section-title">時辰吉凶</div>
              <div class="modal-hours">
                \${data.hourlyFortune.map(h => {
                  const icon = h.fortune === '吉' ? '☆' : h.fortune === '凶' ? '●' : '○';
                  const color = h.fortune === '吉' ? '#22c55e' : h.fortune === '凶' ? '#ef4444' : '#6b7280';
                  return '<div class="modal-hour-item" style="border-left:3px solid '+color+'"><span class="hour-icon">'+icon+'</span><strong>'+h.hourName+'</strong> '+h.ganZhi+'<span class="hour-time">'+h.timeRange+'</span><span class="hour-fortune" style="color:'+color+'">'+h.fortune+'</span></div>';
                }).join('')}
              </div>
            </div>
            <div class="modal-section" style="text-align:center;margin-top:20px;">
              <button class="modal-goto-btn" onclick="navigateToDate(\${y},\${m},\${d})">查看完整詳情 →</button>
            </div>
          \`;
        });
    }
    function closeModal(e) {
      if (!e || e.target.id === 'dayModal') {
        document.getElementById('dayModal').classList.remove('show');
      }
    }
    function navigateToDate(y, m, d) {
      const activity = document.getElementById('activitySelect').value;
      const date = y + '-' + String(m).padStart(2,'0') + '-' + String(d).padStart(2,'0');
      let url = '/?date=' + date;
      if (activity) url += '&activity=' + encodeURIComponent(activity);
      window.location.href = url;
    }
    function prevMonth() {
      sessionStorage.setItem('scrollPos', window.scrollY);
      const date = document.getElementById('datePicker').value;
      const [y, m, d] = date.split('-').map(Number);
      const newDate = new Date(y, m - 2, 1);
      const activity = document.getElementById('activitySelect').value;
      let url = '/?date=' + newDate.getFullYear() + '-' + String(newDate.getMonth()+1).padStart(2,'0') + '-01';
      if (activity) url += '&activity=' + encodeURIComponent(activity);
      window.location.href = url;
    }
    function nextMonth() {
      sessionStorage.setItem('scrollPos', window.scrollY);
      const date = document.getElementById('datePicker').value;
      const [y, m, d] = date.split('-').map(Number);
      const newDate = new Date(y, m, 1);
      const activity = document.getElementById('activitySelect').value;
      let url = '/?date=' + newDate.getFullYear() + '-' + String(newDate.getMonth()+1).padStart(2,'0') + '-01';
      if (activity) url += '&activity=' + encodeURIComponent(activity);
      window.location.href = url;
    }
    // 頁面載入後恢復滾動位置
    window.addEventListener('load', function() {
      const pos = sessionStorage.getItem('scrollPos');
      if (pos) {
        window.scrollTo(0, parseInt(pos));
        sessionStorage.removeItem('scrollPos');
      }
    });
  </script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  
  // API 端點：獲取日期詳情
  if (url.pathname === '/api/day') {
    const dateParam = url.searchParams.get('date');
    if (dateParam) {
      const [y, m, d] = dateParam.split('-').map(Number);
      const info = getDayInfo(y, m, d);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(info));
      return;
    }
  }
  
  const dateParam = url.searchParams.get('date');
  const activityParam = url.searchParams.get('activity') || undefined;
  
  let year: number, month: number, day: number;
  if (dateParam) {
    const [y, m, d] = dateParam.split('-').map(Number);
    year = y; month = m; day = d;
  } else {
    const today = new Date();
    year = today.getFullYear();
    month = today.getMonth() + 1;
    day = today.getDate();
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(generateHTML(year, month, day, activityParam));
});

server.listen(PORT, () => {
  console.log(`\n🗓️  中國傳統擇日萬年曆`);
  console.log(`📡 伺服器運行中: http://localhost:${PORT}`);
  console.log(`\n按 Ctrl+C 停止伺服器\n`);
});
