/**
 * 農曆計算模組
 * 基於 lunar-javascript 天文算法生成的完整資料庫 (1900-2100)
 */

import { LUNAR_MONTH_NAMES, LUNAR_DAY_NAMES } from './constants';
import { LUNAR_YEAR_DATA, getLunarYearData } from './lunarData';

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
  monthName: string;
  dayName: string;
}

/**
 * 計算儒略日
 */
function getJulianDay(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    m += 12;
    y--;
  }
  const b = Math.floor(y / 100);
  const c = 2 - b + Math.floor(b / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + c - 1524.5;
}

/**
 * 儒略日轉公曆
 */
function julianDayToSolar(jd: number): { year: number; month: number; day: number } {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let a: number;
  if (z < 2299161) {
    a = z;
  } else {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e) + f;
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  return { year, month, day: Math.floor(day) };
}

/**
 * 獲取農曆年的總天數
 */
export function getLunarYearDays(year: number): number {
  const data = getLunarYearData(year);
  if (!data) throw new Error(`Year ${year} is out of range (1900-2100)`);
  return data.monthDays.reduce((sum, days) => sum + days, 0);
}

/**
 * 獲取農曆某月的天數
 */
export function getLunarMonthDays(year: number, month: number, isLeapMonth: boolean = false): number {
  const data = getLunarYearData(year);
  if (!data) throw new Error(`Year ${year} is out of range (1900-2100)`);
  
  let idx = month - 1;
  if (data.leapMonth > 0 && month > data.leapMonth) {
    idx++;
  }
  if (isLeapMonth && month === data.leapMonth) {
    idx = month; // 閏月在正常月份之後
  }
  return data.monthDays[idx] || 29;
}

/**
 * 獲取閏月月份 (0表示無閏月)
 */
export function getLeapMonth(year: number): number {
  const data = getLunarYearData(year);
  return data?.leapMonth || 0;
}

/**
 * 獲取閏月天數
 */
export function getLeapMonthDays(year: number): number {
  const data = getLunarYearData(year);
  if (!data || data.leapMonth === 0) return 0;
  return data.monthDays[data.leapMonth]; // 閏月在正常月份之後
}

/**
 * 獲取春節日期 (正月初一)
 */
export function getSpringFestival(year: number): { month: number; day: number } {
  const data = getLunarYearData(year);
  if (!data) throw new Error(`Year ${year} is out of range (1900-2100)`);
  const solar = julianDayToSolar(data.firstDayJD);
  return { month: solar.month, day: solar.day };
}

/**
 * 公曆轉農曆
 */
export function solarToLunar(year: number, month: number, day: number): LunarDate {
  if (year < 1900 || year > 2100) {
    throw new Error(`Year ${year} is out of range (1900-2100)`);
  }

  // 儒略日需要+0.5後取整，因為資料庫中的 firstDayJD 是這樣計算的
  const jd = Math.floor(getJulianDay(year, month, day) + 0.5);
  
  // 找到對應的農曆年
  let lunarYear = year;
  let data = getLunarYearData(lunarYear);
  
  // 如果儒略日小於該年正月初一，則是上一年
  if (data && jd < data.firstDayJD) {
    lunarYear--;
    data = getLunarYearData(lunarYear);
  }
  
  if (!data) throw new Error(`Year ${year} is out of range (1900-2100)`);
  
  // 計算距離正月初一的天數
  let offset = jd - data.firstDayJD;
  
  // 遍歷月份找到對應的農曆月日
  let lunarMonth = 1;
  let isLeapMonth = false;
  let monthIndex = 0;
  
  while (offset >= data.monthDays[monthIndex]) {
    offset -= data.monthDays[monthIndex];
    monthIndex++;
    
    // 判斷是否為閏月
    if (data.leapMonth > 0 && monthIndex === data.leapMonth) {
      // 這是閏月
      if (!isLeapMonth) {
        isLeapMonth = true;
      } else {
        isLeapMonth = false;
        lunarMonth++;
      }
    } else {
      if (isLeapMonth) {
        isLeapMonth = false;
      }
      lunarMonth++;
    }
    
    // 跨年處理
    if (monthIndex >= data.monthDays.length) {
      lunarYear++;
      data = getLunarYearData(lunarYear);
      if (!data) throw new Error(`Year out of range`);
      monthIndex = 0;
      lunarMonth = 1;
      isLeapMonth = false;
    }
  }
  
  const lunarDay = offset + 1;

  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    isLeapMonth,
    monthName: (isLeapMonth ? "閏" : "") + LUNAR_MONTH_NAMES[lunarMonth - 1],
    dayName: LUNAR_DAY_NAMES[lunarDay - 1]
  };
}

/**
 * 農曆轉公曆
 */
export function lunarToSolar(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  isLeapMonth: boolean = false
): { year: number; month: number; day: number } {
  if (lunarYear < 1900 || lunarYear > 2100) {
    throw new Error(`Year ${lunarYear} is out of range (1900-2100)`);
  }

  const data = getLunarYearData(lunarYear);
  if (!data) throw new Error(`Year ${lunarYear} is out of range (1900-2100)`);

  // 計算距離正月初一的天數
  let offset = 0;
  let monthIndex = 0;
  
  // 累加前面月份的天數
  for (let m = 1; m < lunarMonth; m++) {
    offset += data.monthDays[monthIndex];
    monthIndex++;
    
    // 如果這個月有閏月
    if (data.leapMonth === m) {
      offset += data.monthDays[monthIndex];
      monthIndex++;
    }
  }
  
  // 如果目標是閏月，加上正常月份的天數
  if (isLeapMonth && lunarMonth === data.leapMonth) {
    offset += data.monthDays[monthIndex];
  }
  
  // 加上日期
  offset += lunarDay - 1;
  
  // 計算公曆日期
  const targetJD = data.firstDayJD + offset;
  return julianDayToSolar(targetJD);
}

/**
 * 獲取農曆月份名稱
 */
export function getLunarMonthName(month: number, isLeapMonth: boolean = false): string {
  return (isLeapMonth ? "閏" : "") + LUNAR_MONTH_NAMES[month - 1];
}

/**
 * 獲取農曆日期名稱
 */
export function getLunarDayName(day: number): string {
  return LUNAR_DAY_NAMES[day - 1];
}
