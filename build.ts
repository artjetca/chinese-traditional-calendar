import * as fs from 'fs';
import * as path from 'path';
import { getDayInfo } from './src/index.js';
import { generateCalendarHTML, calendarCSS } from './src/calendar-view.js';
import { getHourlyFortune } from './src/core/index.js';

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;
const day = today.getDate();

function generateStaticHTML(): string {
  const info = getDayInfo(year, month, day);
  
  const hourlyHTML = info.hourlyFortune.map(h => {
    const color = h.fortune === '吉' ? '#22c55e' : h.fortune === '凶' ? '#ef4444' : '#6b7280';
    const icon = h.fortune === '吉' ? '☆' : h.fortune === '凶' ? '●' : '○';
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
    .ganzhi-value { font-size: 20px; font-weight: bold; color: #fbbf24; }
    .ganzhi-nayin { font-size: 12px; color: #67e8f9; margin-top: 2px; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; }
    .info-item { background: #334155; padding: 12px; border-radius: 8px; }
    .info-label { font-size: 12px; color: #94a3b8; }
    .info-value { font-size: 16px; font-weight: bold; }
    .yi-ji { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .yi { background: rgba(34, 197, 94, 0.1); border-left: 4px solid #22c55e; padding: 15px; border-radius: 8px; }
    .ji { background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 15px; border-radius: 8px; }
    .yi-title { color: #22c55e; font-weight: bold; margin-bottom: 8px; }
    .ji-title { color: #ef4444; font-weight: bold; margin-bottom: 8px; }
    .yi-list, .ji-list { font-size: 14px; line-height: 1.8; }
    .hourly-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; }
    .hour-item { 
      display: flex; align-items: center; gap: 8px;
      background: #334155; padding: 10px 12px; border-radius: 6px; font-size: 14px;
    }
    .hour-icon { font-size: 16px; }
    .hour-time { font-size: 11px; color: #94a3b8; margin-left: auto; }
    .hour-fortune { font-weight: bold; min-width: 20px; text-align: right; }
    .activity-selector { 
      display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
      margin-bottom: 15px;
    }
    .activity-selector select {
      padding: 8px 12px; border-radius: 6px; border: 1px solid #475569;
      background: #1e293b; color: #e2e8f0; font-size: 14px; min-width: 150px;
    }
    .activity-selector button {
      padding: 8px 16px; border-radius: 6px; border: none;
      background: #fbbf24; color: #1a1a2e; font-weight: bold; cursor: pointer;
    }
    .quick-activities { display: flex; gap: 6px; flex-wrap: wrap; }
    .quick-btn {
      padding: 6px 12px; border-radius: 6px; border: 1px solid #475569;
      background: transparent; color: #e2e8f0; cursor: pointer; font-size: 13px;
    }
    .quick-btn:hover { background: #334155; border-color: #fbbf24; }
    .quick-btn.active { background: #fbbf24; color: #1a1a2e; border-color: #fbbf24; }
    .quick-btn.yi { border-color: #22c55e; color: #22c55e; }
    .quick-btn.ji { border-color: #ef4444; color: #ef4444; }
    .calendar-card { 
      background: #faf8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;
      box-shadow: 0 4px 12px rgba(139, 69, 19, 0.15);
    }
    .month-nav { display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 15px; }
    .month-nav button { 
      padding: 8px 16px; border: none; border-radius: 6px;
      background: #8b4513; color: #fff; cursor: pointer; font-weight: bold;
    }
    .month-nav button:hover { background: #a0522d; }
    .month-nav .month-title { font-size: 20px; font-weight: bold; color: #5c4033; min-width: 180px; text-align: center; }
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

    <div class="card" id="mainCard">
      <div class="card-title">日期資訊</div>
      <div class="main-date" id="mainDate">${info.gregorianDate} ${info.weekday}</div>
      <div class="lunar-date" id="lunarDate">${info.lunarYear}年 ${info.lunarMonthName} ${info.lunarDayName}</div>
      <div class="ganzhi-row" id="ganzhiRow">
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
          <div class="ganzhi-value" id="hourGanZhi">—</div>
          <div class="ganzhi-nayin">現時</div>
        </div>
      </div>
    </div>

    <div class="card" id="infoCard">
      <div class="card-title">基本資訊</div>
      <div class="info-grid" id="infoGrid">
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

    <div class="card" id="yiJiCard">
      <div class="card-title">今日宜忌</div>
      <div class="yi-ji" id="yiJi">
        <div class="yi">
          <div class="yi-title">✓ 宜</div>
          <div class="yi-list">${info.auspicious.join('、') || '無'}</div>
        </div>
        <div class="ji">
          <div class="ji-title">✗ 忌</div>
          <div class="ji-list">${info.inauspicious.join('、') || '無'}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">選擇活動查看本月適宜日期</div>
      <div class="activity-selector">
        <select id="activitySelect">
          <option value="">-- 選擇活動 --</option>
          <option value="祭祀">祭祀</option>
          <option value="祈福">祈福</option>
          <option value="嫁娶">嫁娶</option>
          <option value="開市">開市</option>
          <option value="動土">動土</option>
          <option value="修造">修造</option>
          <option value="入宅">入宅</option>
          <option value="出行">出行</option>
          <option value="納財">納財</option>
          <option value="安葬">安葬</option>
        </select>
        <button onclick="checkActivity()">查詢</button>
      </div>
      <div class="quick-activities">
        <button class="quick-btn" onclick="selectActivity('祭祀')">祭祀</button>
        <button class="quick-btn" onclick="selectActivity('嫁娶')">嫁娶</button>
        <button class="quick-btn" onclick="selectActivity('開市')">開市</button>
        <button class="quick-btn" onclick="selectActivity('動土')">動土</button>
        <button class="quick-btn" onclick="selectActivity('入宅')">入宅</button>
        <button class="quick-btn" onclick="selectActivity('出行')">出行</button>
      </div>
    </div>

    <div class="calendar-card" id="calendarCard">
      <div class="month-nav">
        <button onclick="prevMonth()">◀ 上月</button>
        <div class="month-title" id="monthTitle">📅 ${year}年${month}月</div>
        <button onclick="nextMonth()">下月 ▶</button>
      </div>
      <div id="calendarBody">${generateCalendarHTML(year, month)}</div>
    </div>

    <div class="card" id="hourlyCard">
      <div class="card-title">時辰吉凶</div>
      <div class="hourly-grid" id="hourlyGrid">${hourlyHTML}</div>
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
    let currentYear = ${year};
    let currentMonth = ${month};
    let selectedActivity = '';

    function changeDate() {
      const date = document.getElementById('datePicker').value;
      if (date) {
        let url = '/?date=' + date;
        if (selectedActivity) url += '&activity=' + encodeURIComponent(selectedActivity);
        window.location.href = url;
      }
    }

    function goToday() {
      const today = new Date().toISOString().split('T')[0];
      window.location.href = '/?date=' + today;
    }

    function checkActivity() {
      const activity = document.getElementById('activitySelect').value;
      if (activity) {
        selectedActivity = activity;
        updateCalendar();
        highlightQuickBtn(activity);
      }
    }

    function selectActivity(activity) {
      selectedActivity = activity;
      document.getElementById('activitySelect').value = activity;
      updateCalendar();
      highlightQuickBtn(activity);
    }

    function highlightQuickBtn(activity) {
      document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.classList.remove('yi', 'ji', 'active');
        if (btn.textContent === activity) {
          btn.classList.add('active');
        }
      });
    }

    function goToDate(y, m, d) {
      if (window.innerWidth <= 640) {
        showDayModal(y, m, d);
      } else {
        const date = y + '-' + String(m).padStart(2,'0') + '-' + String(d).padStart(2,'0');
        let url = '/?date=' + date;
        if (selectedActivity) url += '&activity=' + encodeURIComponent(selectedActivity);
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
      const date = y + '-' + String(m).padStart(2,'0') + '-' + String(d).padStart(2,'0');
      let url = '/?date=' + date;
      if (selectedActivity) url += '&activity=' + encodeURIComponent(selectedActivity);
      window.location.href = url;
    }

    function prevMonth() {
      currentMonth--;
      if (currentMonth < 1) { currentMonth = 12; currentYear--; }
      updateCalendar();
    }

    function nextMonth() {
      currentMonth++;
      if (currentMonth > 12) { currentMonth = 1; currentYear++; }
      updateCalendar();
    }

    function updateCalendar() {
      document.getElementById('monthTitle').textContent = '📅 ' + currentYear + '年' + currentMonth + '月';
      fetch('/api/calendar?year=' + currentYear + '&month=' + currentMonth + (selectedActivity ? '&activity=' + encodeURIComponent(selectedActivity) : ''))
        .then(r => r.text())
        .then(html => {
          document.getElementById('calendarBody').innerHTML = html;
        });
    }

    // Update hour pillar based on current time
    function updateHourPillar() {
      const hour = new Date().getHours();
      const hourIndex = Math.floor((hour + 1) % 24 / 2);
      fetch('/api/day?date=' + document.getElementById('datePicker').value)
        .then(r => r.json())
        .then(data => {
          const hourGanZhi = data.hourlyFortune[hourIndex]?.ganZhi || '—';
          document.getElementById('hourGanZhi').textContent = hourGanZhi;
        });
    }

    // Get URL params
    const urlParams = new URLSearchParams(window.location.search);
    selectedActivity = urlParams.get('activity') || '';
    if (selectedActivity) {
      document.getElementById('activitySelect').value = selectedActivity;
    }

    updateHourPillar();
    setInterval(updateHourPillar, 60000);
  </script>
</body>
</html>`;
}

// Create dist directory and write HTML
const distDir = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(path.join(distDir, 'index.html'), generateStaticHTML());
console.log('✅ Static HTML generated to dist/index.html');
