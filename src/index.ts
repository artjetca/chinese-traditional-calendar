/**
 * 中國傳統擇日萬年曆系統
 * Chinese Traditional Calendar System
 */

import {
  // 常量
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  ZODIAC_ANIMALS,
  LUNAR_MONTH_NAMES,
  LUNAR_DAY_NAMES,
  HOUR_TIME_RANGES,

  // 干支計算
  getYearGanZhi,
  getYearGanIndex,
  getYearZhiIndex,
  getMonthGanZhi,
  getDayGanZhi,
  getDayGanIndex,
  getDayZhiIndex,
  getHourGanZhi,
  getHourIndex,
  getNaYin,
  getZodiac,
  getClashZodiac,
  getShaDirection,

  // 農曆計算
  solarToLunar,
  lunarToSolar,
  getLeapMonth,

  // 節氣計算
  getSolarTermsOfYear,
  getSolarTermOfDate,
  isAfterLiChun,
  getSolarTermMonth,

  // 吉凶計算
  getJianChu,
  getMonthZhiIndex,
  getHourlyFortune,
  getAuspiciousByJianChu,

  // 類型
  type CalendarDate,
  type HourlyFortuneInfo
} from './core/index.js';

export interface FullDayInfo {
  // 公曆
  gregorianDate: string;
  weekday: string;

  // 農曆
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  lunarMonthName: string;
  lunarDayName: string;
  isLeapMonth: boolean;

  // 干支
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;

  // 納音
  yearNaYin: string;
  monthNaYin: string;
  dayNaYin: string;

  // 生肖
  zodiac: string;

  // 建除
  jianChu: string;

  // 沖煞
  clash: string;
  shaDirection: string;

  // 節氣
  solarTerm: string | null;

  // 宜忌
  auspicious: string[];
  inauspicious: string[];

  // 時辰吉凶
  hourlyFortune: HourlyFortuneInfo[];
}

const WEEKDAY_NAMES = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

/**
 * 獲取某日期的完整信息
 */
export function getDayInfo(year: number, month: number, day: number): FullDayInfo {
  const date = new Date(year, month - 1, day);

  // 判斷是否過立春
  const afterLiChun = isAfterLiChun(year, month, day);

  // 農曆
  const lunar = solarToLunar(year, month, day);

  // 干支
  const yearGanZhi = getYearGanZhi(year, afterLiChun);
  const yearGanIndex = getYearGanIndex(year, afterLiChun);

  // 月干支需要使用節氣月份
  const solarTermMonthNum = getSolarTermMonth(year, month, day);
  const monthGanZhi = getMonthGanZhi(yearGanIndex, solarTermMonthNum);

  const dayGanZhi = getDayGanZhi(year, month, day);
  const dayZhiIndex = getDayZhiIndex(year, month, day);

  // 納音
  const yearNaYin = getNaYin(yearGanZhi);
  const monthNaYin = getNaYin(monthGanZhi);
  const dayNaYin = getNaYin(dayGanZhi);

  // 生肖
  const yearZhiIndex = getYearZhiIndex(year, afterLiChun);
  const zodiac = getZodiac(yearZhiIndex);

  // 建除
  const monthZhiIndex = getMonthZhiIndex(solarTermMonthNum);
  const jianChu = getJianChu(monthZhiIndex, dayZhiIndex);

  // 沖煞
  const clash = getClashZodiac(dayZhiIndex);
  const shaDirection = getShaDirection(dayZhiIndex);

  // 節氣
  const solarTerm = getSolarTermOfDate(year, month, day);

  // 宜忌
  const { auspicious, inauspicious } = getAuspiciousByJianChu(jianChu);

  // 時辰吉凶
  const hourlyFortune = getHourlyFortune(year, month, day);

  return {
    gregorianDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    weekday: WEEKDAY_NAMES[date.getDay()],

    lunarYear: lunar.year,
    lunarMonth: lunar.month,
    lunarDay: lunar.day,
    lunarMonthName: lunar.monthName,
    lunarDayName: lunar.dayName,
    isLeapMonth: lunar.isLeapMonth,

    yearGanZhi,
    monthGanZhi,
    dayGanZhi,

    yearNaYin,
    monthNaYin,
    dayNaYin,

    zodiac,

    jianChu,

    clash,
    shaDirection,

    solarTerm,

    auspicious,
    inauspicious,

    hourlyFortune
  };
}

/**
 * 格式化輸出日期信息
 */
export function formatDayInfo(info: FullDayInfo): string {
  const lines: string[] = [];

  lines.push(`═══════════════════════════════════════════`);
  lines.push(`📅 ${info.gregorianDate} ${info.weekday}`);
  lines.push(`═══════════════════════════════════════════`);

  lines.push(`\n【農曆】`);
  lines.push(`  ${info.lunarYear}年 ${info.lunarMonthName} ${info.lunarDayName}`);

  lines.push(`\n【干支】`);
  lines.push(`  年柱: ${info.yearGanZhi} (${info.yearNaYin})`);
  lines.push(`  月柱: ${info.monthGanZhi} (${info.monthNaYin})`);
  lines.push(`  日柱: ${info.dayGanZhi} (${info.dayNaYin})`);

  lines.push(`\n【生肖】${info.zodiac}年`);

  lines.push(`\n【建除】${info.jianChu}日`);

  lines.push(`\n【沖煞】`);
  lines.push(`  沖: ${info.clash}`);
  lines.push(`  煞: ${info.shaDirection}`);

  if (info.solarTerm) {
    lines.push(`\n【節氣】${info.solarTerm}`);
  }

  lines.push(`\n【宜】`);
  lines.push(`  ${info.auspicious.join('、') || '無'}`);

  lines.push(`\n【忌】`);
  lines.push(`  ${info.inauspicious.join('、') || '無'}`);

  lines.push(`\n【時辰吉凶】`);
  for (const hour of info.hourlyFortune) {
    const symbol = hour.fortune === '吉' ? '☆' : hour.fortune === '凶' ? '●' : '○';
    lines.push(`  ${symbol} ${hour.hourName} ${hour.ganZhi} (${hour.timeRange}) - ${hour.fortune}`);
  }

  return lines.join('\n');
}

// 導出所有模組
export * from './core/index.js';

// 主函數：示例使用
function main() {
  console.log('\n中國傳統擇日萬年曆系統\n');

  // 測試今天的日期 (2026年2月3日)
  const today = getDayInfo(2026, 2, 3);
  console.log(formatDayInfo(today));

  console.log('\n\n--- 更多測試日期 ---\n');

  // 測試立春
  const liChun = getDayInfo(2026, 2, 4);
  console.log(`2026年2月4日 立春: ${liChun.solarTerm || '無節氣'}`);

  // 測試春節
  const springFestival = getDayInfo(2026, 2, 17);
  console.log(`2026年2月17日 春節: 農曆${springFestival.lunarMonthName}${springFestival.lunarDayName}`);

  // 農曆轉公曆測試
  const solar = lunarToSolar(2026, 1, 1, false);
  console.log(`農曆2026年正月初一 = 公曆${solar.year}年${solar.month}月${solar.day}日`);
}

main();
