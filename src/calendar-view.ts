/**
 * 月曆視圖生成器 - 傳統黃曆樣式
 */

import { solarToLunar } from './core/lunar.js';
import { getDayZhiIndex, getDayGanZhi } from './core/ganzhi.js';
import { getJianChu, getMonthZhiIndex, getAuspiciousByJianChu, isActivityAuspicious } from './core/fortune.js';
import { getSolarTermOfDate } from './core/solarterms.js';
import { EARTHLY_BRANCHES, ZODIAC_ANIMALS } from './core/constants.js';

// 沖煞計算
const CLASH_ANIMALS = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];
const SHA_DIRECTIONS = ['北', '西', '南', '東'];

function getClashAnimal(dayZhiIndex: number): string {
  const clashIndex = (dayZhiIndex + 6) % 12;
  return CLASH_ANIMALS[clashIndex];
}

function getShaDirection(dayZhiIndex: number): string {
  // 煞方計算：申子辰煞南，寅午戌煞北，亥卯未煞西，巳酉丑煞東
  const groups = [[8, 0, 4], [2, 6, 10], [11, 3, 7], [5, 9, 1]];
  const dirs = ['南', '北', '西', '東'];
  for (let i = 0; i < groups.length; i++) {
    if (groups[i].includes(dayZhiIndex)) return dirs[i];
  }
  return '';
}

export interface CalendarDay {
  day: number;
  lunarDay: string;
  lunarMonth: string;
  jianChu: string;
  ganZhi: string;
  clash: string;
  sha: string;
  solarTerm?: string;
  auspicious: string[];
  inauspicious: string[];
  isFirstOfMonth: boolean;
}

export function generateMonthData(year: number, month: number): CalendarDay[] {
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const result: CalendarDay[] = [];
  
  for (let d = 1; d <= daysInMonth; d++) {
    const lunar = solarToLunar(year, month, d);
    const dayZhiIndex = getDayZhiIndex(year, month, d);
    const monthZhiIndex = getMonthZhiIndex(lunar.month);
    const jianChu = getJianChu(monthZhiIndex, dayZhiIndex);
    const ganZhi = getDayGanZhi(year, month, d);
    const fortune = getAuspiciousByJianChu(jianChu);
    const solarTerm = getSolarTermOfDate(year, month, d);
    
    result.push({
      day: d,
      lunarDay: lunar.dayName,
      lunarMonth: lunar.monthName,
      jianChu,
      ganZhi,
      clash: getClashAnimal(dayZhiIndex),
      sha: getShaDirection(dayZhiIndex),
      solarTerm: solarTerm || undefined,
      auspicious: fortune.auspicious.slice(0, 4),
      inauspicious: fortune.inauspicious.slice(0, 3),
      isFirstOfMonth: lunar.day === 1
    });
  }
  
  return result;
}

export function generateCalendarHTML(year: number, month: number, selectedActivity?: string): string {
  const firstDay = new Date(year, month - 1, 1);
  const startWeekday = firstDay.getDay();
  const days = generateMonthData(year, month);
  
  const weekHeaders = ['星期日(SUN)', '星期一(MON)', '星期二(TUE)', '星期三(WED)', '星期四(THU)', '星期五(FRI)', '星期六(SAT)'];
  
  let html = '<div class="trad-calendar">';
  html += '<div class="trad-header">';
  html += weekHeaders.map((h, i) => {
    const cls = i === 0 ? 'sun' : i === 6 ? 'sat' : '';
    return `<div class="trad-header-cell ${cls}">${h}</div>`;
  }).join('');
  html += '</div>';
  
  html += '<div class="trad-body">';
  
  // 填充月初空白
  for (let i = 0; i < startWeekday; i++) {
    html += '<div class="trad-cell empty"></div>';
  }
  
  // 生成每一天
  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const weekday = (startWeekday + i) % 7;
    const isSun = weekday === 0;
    const isSat = weekday === 6;
    
    let cls = 'trad-cell';
    if (isSun) cls += ' sun';
    if (isSat) cls += ' sat';
    
    // 根據選擇的活動標記宜忌
    let activityBadge = '';
    if (selectedActivity) {
      const result = isActivityAuspicious(day.jianChu, selectedActivity);
      if (result === '宜') {
        cls += ' activity-yi';
        activityBadge = `<div class="activity-badge yi">✓ 宜${selectedActivity}</div>`;
      } else if (result === '忌') {
        cls += ' activity-ji';
        activityBadge = `<div class="activity-badge ji">✗ 忌${selectedActivity}</div>`;
      }
    }
    
    const lunarDisplay = day.isFirstOfMonth ? day.lunarMonth : day.lunarDay;
    
    html += `<div class="${cls}" onclick="goToDate(${year},${month},${day.day})">
      ${day.solarTerm ? `<div class="trad-term">${day.solarTerm}</div>` : ''}
      <div class="trad-date">${day.day}</div>
      <div class="trad-lunar">${lunarDisplay}</div>
      <div class="trad-clash">沖${day.clash}</div>
      <div class="trad-activities">${day.auspicious.slice(0, 2).join(' ')}</div>
      ${activityBadge}
    </div>`;
  }
  
  html += '</div></div>';
  return html;
}

export const calendarCSS = `
.month-nav { display: flex; gap: 15px; align-items: center; margin-bottom: 20px; justify-content: center; }
.month-nav button { 
  padding: 10px 20px; border-radius: 4px; border: none;
  background: #8b4513; color: #fff; cursor: pointer; font-weight: bold; font-size: 14px;
  transition: background 0.2s;
}
.month-nav button:hover { background: #a0522d; }
.month-nav .month-title { font-size: 24px; font-weight: bold; color: #5c4033; min-width: 200px; text-align: center; }

/* 傳統黃曆樣式 */
.trad-calendar { background: #faf8f0; border-radius: 0; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.trad-header { display: grid; grid-template-columns: repeat(7, 1fr); background: #8b4513; }
.trad-header-cell { 
  padding: 12px 4px; text-align: center; font-size: 12px; font-weight: bold; 
  color: #fff; letter-spacing: 1px;
}
.trad-header-cell.sun { background: #c41e3a; }
.trad-header-cell.sat { background: #2e7d32; }
.trad-body { display: grid; grid-template-columns: repeat(7, 1fr); background: #e8dcc8; gap: 1px; }
.trad-cell {
  min-height: 110px; padding: 6px; background: #fdfcf5; cursor: pointer; position: relative;
  display: flex; flex-direction: column; transition: all 0.15s;
}
.trad-cell:hover { background: #f5edd8; transform: scale(1.02); z-index: 1; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
.trad-cell.empty { background: #f0ebe0; cursor: default; }
.trad-cell.empty:hover { transform: none; box-shadow: none; }
.trad-cell.sun { background: #fff8f8; }
.trad-cell.sat { background: #f8fff8; }
.trad-term { 
  position: absolute; top: 4px; left: 4px; 
  background: #c41e3a; color: #fff; font-weight: bold; font-size: 9px;
  padding: 2px 5px; border-radius: 2px;
}
.trad-date { font-size: 26px; font-weight: bold; color: #333; text-align: right; line-height: 1; }
.trad-cell.sun .trad-date { color: #c41e3a; }
.trad-cell.sat .trad-date { color: #2e7d32; }
.trad-lunar { font-size: 13px; color: #5c4033; margin-top: 4px; font-weight: 500; }
.trad-clash { font-size: 11px; color: #8b7355; margin-top: 3px; }
.trad-activities { margin-top: auto; font-size: 11px; line-height: 1.3; color: #a0522d; font-weight: 500; }

/* 活動宜忌高亮 */
.trad-cell.activity-yi { background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%) !important; box-shadow: inset 0 0 0 2px #2e7d32; }
.trad-cell.activity-ji { background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%) !important; box-shadow: inset 0 0 0 2px #c62828; }
.activity-badge {
  position: absolute; top: 4px; left: 4px; font-size: 10px; font-weight: bold;
  padding: 2px 6px; border-radius: 3px;
}
.activity-badge.yi { background: #2e7d32; color: #fff; }
.activity-badge.ji { background: #c62828; color: #fff; }
.trad-cell.activity-yi .trad-term, .trad-cell.activity-ji .trad-term { top: 22px; }

/* 彈窗樣式 */
.modal-overlay {
  display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.6); z-index: 1000; justify-content: center; align-items: center;
}
.modal-overlay.show { display: flex; }
.modal-content {
  background: #faf8f0; border-radius: 12px; max-width: 420px; width: 90%; max-height: 85vh;
  overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.3); animation: modalIn 0.2s ease-out;
}
@keyframes modalIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
.modal-header {
  background: #8b4513; color: #fff; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;
}
.modal-header h3 { margin: 0; font-size: 18px; }
.modal-close { background: none; border: none; color: #fff; font-size: 24px; cursor: pointer; line-height: 1; }
.modal-body { padding: 20px; }
.modal-section { margin-bottom: 16px; }
.modal-section-title { font-size: 12px; color: #8b7355; margin-bottom: 6px; font-weight: bold; }
.modal-lunar { font-size: 16px; color: #5c4033; font-weight: 500; }
.modal-ganzhi { display: flex; gap: 12px; flex-wrap: wrap; }
.modal-ganzhi-item { background: #f5edd8; padding: 8px 12px; border-radius: 6px; text-align: center; }
.modal-ganzhi-label { font-size: 10px; color: #8b7355; }
.modal-ganzhi-value { font-size: 16px; font-weight: bold; color: #5c4033; }
.modal-yi-ji { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.modal-yi { background: #e8f5e9; padding: 12px; border-radius: 8px; border-left: 4px solid #2e7d32; }
.modal-ji { background: #ffebee; padding: 12px; border-radius: 8px; border-left: 4px solid #c62828; }
.modal-yi-title { color: #2e7d32; font-weight: bold; margin-bottom: 6px; }
.modal-ji-title { color: #c62828; font-weight: bold; margin-bottom: 6px; }
.modal-yi-list, .modal-ji-list { font-size: 13px; color: #333; line-height: 1.6; }
.modal-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.modal-info-item { background: #f5edd8; padding: 10px; border-radius: 6px; }
.modal-info-label { font-size: 11px; color: #8b7355; }
.modal-info-value { font-size: 14px; color: #5c4033; font-weight: 500; }
.modal-hours { display: grid; grid-template-columns: 1fr; gap: 6px; }
.modal-hour-item { 
  background: #334155; padding: 10px 12px; border-radius: 6px; font-size: 13px; color: #e2e8f0;
  display: flex; align-items: center; gap: 8px;
}
.modal-hour-item .hour-icon { font-size: 14px; }
.modal-hour-item strong { min-width: 36px; }
.modal-hour-item .hour-time { font-size: 11px; color: #94a3b8; margin-left: auto; }
.modal-hour-item .hour-fortune { font-weight: bold; min-width: 20px; text-align: right; }
.modal-goto-btn {
  background: #8b4513; color: #fff; border: none; padding: 12px 24px;
  border-radius: 6px; font-size: 14px; font-weight: bold; cursor: pointer;
}
.modal-goto-btn:hover { background: #a0522d; }

/* 手機版響應式設計 */
@media (max-width: 640px) {
  .trad-calendar { border-radius: 10px; overflow: hidden; }
  .trad-header { display: grid; grid-template-columns: repeat(7, 1fr); }
  .trad-header-cell { padding: 8px 2px; font-size: 11px; letter-spacing: 0; text-align: center; }
  .trad-body { display: grid; grid-template-columns: repeat(7, 1fr); }
  .trad-cell { min-height: 58px; padding: 2px; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; }
  .trad-cell.empty { min-height: 58px; }
  .trad-date { font-size: 16px; text-align: center; margin-top: 2px; font-weight: 600; }
  .trad-lunar { font-size: 9px; text-align: center; margin-top: 1px; }
  .trad-clash { display: none; }
  .trad-activities { display: none; }
  .trad-term { font-size: 7px; padding: 1px 2px; top: 1px; left: 50%; transform: translateX(-50%); position: absolute; }
  .activity-badge { font-size: 7px; padding: 1px 3px; bottom: 2px; left: 50%; transform: translateX(-50%); top: auto; right: auto; position: absolute; white-space: nowrap; }
  .trad-cell.activity-yi .trad-term, .trad-cell.activity-ji .trad-term { top: 1px; }
  .month-nav { gap: 6px; margin-bottom: 10px; flex-wrap: nowrap; }
  .month-nav button { padding: 6px 10px; font-size: 11px; white-space: nowrap; }
  .month-nav .month-title { font-size: 15px; min-width: auto; white-space: nowrap; }
  .modal-overlay { padding: 10px; }
  .modal-content { max-width: 100%; margin: 0; max-height: 90vh; }
  .modal-header { padding: 12px 16px; }
  .modal-header h3 { font-size: 16px; }
  .modal-body { padding: 14px; max-height: 70vh; overflow-y: auto; }
  .modal-section { margin-bottom: 14px; }
  .modal-ganzhi { gap: 6px; flex-wrap: wrap; }
  .modal-ganzhi-item { padding: 5px 8px; min-width: 60px; }
  .modal-ganzhi-value { font-size: 13px; }
  .modal-yi-ji { grid-template-columns: 1fr; gap: 8px; }
  .modal-yi, .modal-ji { padding: 10px; }
  .modal-info-grid { gap: 6px; grid-template-columns: repeat(2, 1fr); }
  .modal-info-item { padding: 8px; }
  .modal-hours { grid-template-columns: 1fr; gap: 4px; }
  .modal-hour-item { font-size: 11px; padding: 8px 10px; }
  .modal-hour-item .hour-time { font-size: 10px; }
  .modal-goto-btn { padding: 10px 20px; font-size: 13px; }
}

@media (max-width: 380px) {
  .trad-header-cell { padding: 6px 1px; font-size: 10px; }
  .trad-cell { min-height: 46px; padding: 2px; }
  .trad-date { font-size: 14px; }
  .trad-lunar { font-size: 8px; }
  .month-nav .month-title { font-size: 14px; }
  .month-nav button { padding: 5px 8px; font-size: 10px; }
  .modal-hours { grid-template-columns: 1fr; }
}
.month-nav span { font-size: 18px; font-weight: bold; color: #fbbf24; min-width: 150px; text-align: center; }
.calendar-grid {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;
}
.cal-header { 
  text-align: center; padding: 8px; color: #94a3b8; font-size: 12px; font-weight: bold;
}
.cal-day {
  position: relative; padding: 8px; border-radius: 6px; background: #334155;
  cursor: pointer; min-height: 70px; transition: all 0.2s;
}
.cal-day:hover { background: #475569; }
.cal-day.empty { background: transparent; cursor: default; }
.cal-day.cal-yi { background: rgba(34, 197, 94, 0.15); border: 1px solid #22c55e; }
.cal-day.cal-ji { background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; }
.cal-num { font-size: 16px; font-weight: bold; color: #e2e8f0; }
.cal-lunar { font-size: 11px; color: #94a3b8; margin-top: 2px; }
.cal-jianchu { font-size: 10px; color: #fbbf24; margin-top: 2px; }
.cal-badge {
  position: absolute; top: 4px; right: 4px; font-size: 10px; padding: 1px 4px; border-radius: 3px;
}
.cal-badge.yi { background: #22c55e; color: #fff; }
.cal-badge.ji { background: #ef4444; color: #fff; }
`;
