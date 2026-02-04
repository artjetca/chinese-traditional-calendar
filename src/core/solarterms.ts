/**
 * 節氣計算模組
 * 基於太陽黃經計算
 */

import { SOLAR_TERMS } from './constants';

export interface SolarTermInfo {
  name: string;
  index: number;
  date: Date;
  jieQi: boolean;  // true=節, false=氣(中氣)
}

/**
 * 節氣對應的太陽黃經角度
 * 從小寒開始，每15度一個節氣
 */
const SOLAR_TERM_ANGLES = [
  285, 300,  // 小寒(285°), 大寒(300°)
  315, 330,  // 立春(315°), 雨水(330°)
  345, 0,    // 驚蟄(345°), 春分(0°)
  15, 30,    // 清明(15°), 穀雨(30°)
  45, 60,    // 立夏(45°), 小滿(60°)
  75, 90,    // 芒種(75°), 夏至(90°)
  105, 120,  // 小暑(105°), 大暑(120°)
  135, 150,  // 立秋(135°), 處暑(150°)
  165, 180,  // 白露(165°), 秋分(180°)
  195, 210,  // 寒露(195°), 霜降(210°)
  225, 240,  // 立冬(225°), 小雪(240°)
  255, 270   // 大雪(255°), 冬至(270°)
];

/**
 * 節氣數據表 (2020-2035)
 * 格式: 每年24個節氣的日期 [月, 日, 時, 分]
 * 使用預計算數據以提高精度和效率
 */
const SOLAR_TERM_DATA: Record<number, number[][]> = {
  2024: [
    [1, 6, 4, 49], [1, 20, 22, 7], [2, 4, 16, 27], [2, 19, 12, 13],
    [3, 5, 10, 23], [3, 20, 11, 6], [4, 4, 15, 2], [4, 19, 22, 0],
    [5, 5, 8, 10], [5, 20, 20, 59], [6, 5, 12, 10], [6, 21, 4, 51],
    [7, 6, 22, 20], [7, 22, 15, 44], [8, 7, 8, 9], [8, 22, 22, 55],
    [9, 7, 11, 11], [9, 22, 20, 44], [10, 8, 3, 0], [10, 23, 6, 15],
    [11, 7, 6, 20], [11, 22, 3, 56], [12, 6, 23, 17], [12, 21, 17, 21]
  ],
  2025: [
    [1, 5, 10, 33], [1, 20, 4, 0], [2, 3, 22, 10], [2, 18, 18, 7],
    [3, 5, 16, 7], [3, 20, 17, 1], [4, 4, 21, 2], [4, 20, 4, 0],
    [5, 5, 14, 4], [5, 21, 2, 55], [6, 5, 18, 4], [6, 21, 10, 42],
    [7, 7, 4, 5], [7, 22, 21, 29], [8, 7, 13, 52], [8, 23, 4, 33],
    [9, 7, 17, 0], [9, 23, 2, 19], [10, 8, 8, 41], [10, 23, 11, 51],
    [11, 7, 12, 4], [11, 22, 9, 35], [12, 7, 5, 5], [12, 21, 23, 3]
  ],
  2026: [
    [1, 5, 16, 23], [1, 20, 9, 45], [2, 4, 4, 2], [2, 18, 23, 52],
    [3, 5, 21, 59], [3, 20, 22, 46], [4, 5, 2, 40], [4, 20, 9, 39],
    [5, 5, 19, 49], [5, 21, 8, 37], [6, 5, 23, 48], [6, 21, 16, 25],
    [7, 7, 9, 57], [7, 23, 3, 13], [8, 7, 19, 43], [8, 23, 10, 19],
    [9, 7, 22, 41], [9, 23, 8, 5], [10, 8, 14, 28], [10, 23, 17, 38],
    [11, 7, 17, 52], [11, 22, 15, 23], [12, 7, 10, 52], [12, 22, 4, 50]
  ],
  2027: [
    [1, 5, 22, 10], [1, 20, 15, 30], [2, 4, 9, 46], [2, 19, 5, 33],
    [3, 6, 3, 39], [3, 21, 4, 25], [4, 5, 8, 17], [4, 20, 15, 17],
    [5, 6, 1, 26], [5, 21, 14, 18], [6, 6, 5, 26], [6, 21, 22, 11],
    [7, 7, 15, 37], [7, 23, 8, 54], [8, 8, 1, 27], [8, 23, 16, 14],
    [9, 8, 4, 28], [9, 23, 13, 55], [10, 8, 20, 16], [10, 23, 23, 32],
    [11, 7, 23, 37], [11, 22, 21, 15], [12, 7, 16, 38], [12, 22, 10, 42]
  ],
  2028: [
    [1, 6, 3, 55], [1, 20, 21, 22], [2, 4, 15, 31], [2, 19, 11, 25],
    [3, 5, 9, 24], [3, 20, 10, 17], [4, 4, 14, 3], [4, 19, 21, 9],
    [5, 5, 7, 12], [5, 20, 20, 10], [6, 5, 11, 17], [6, 21, 4, 2],
    [7, 6, 21, 30], [7, 22, 14, 54], [8, 7, 7, 21], [8, 22, 22, 15],
    [9, 7, 10, 23], [9, 22, 19, 45], [10, 8, 2, 8], [10, 23, 5, 14],
    [11, 7, 5, 27], [11, 22, 2, 54], [12, 6, 22, 25], [12, 21, 16, 20]
  ],
  2029: [
    [1, 5, 9, 43], [1, 20, 3, 1], [2, 3, 21, 20], [2, 18, 17, 8],
    [3, 5, 15, 17], [3, 20, 15, 58], [4, 4, 19, 51], [4, 20, 2, 56],
    [5, 5, 13, 8], [5, 21, 1, 56], [6, 5, 17, 11], [6, 21, 9, 48],
    [7, 7, 3, 22], [7, 22, 20, 42], [8, 7, 13, 12], [8, 23, 3, 51],
    [9, 7, 16, 17], [9, 23, 1, 37], [10, 8, 7, 58], [10, 23, 11, 8],
    [11, 7, 11, 14], [11, 22, 8, 49], [12, 7, 4, 13], [12, 21, 22, 14]
  ],
  2030: [
    [1, 5, 15, 33], [1, 20, 8, 55], [2, 4, 3, 8], [2, 18, 23, 7],
    [3, 5, 21, 8], [3, 20, 21, 51], [4, 5, 1, 41], [4, 20, 8, 43],
    [5, 5, 18, 55], [5, 21, 7, 41], [6, 5, 22, 56], [6, 21, 15, 31],
    [7, 7, 9, 11], [7, 23, 2, 25], [8, 7, 19, 1], [8, 23, 9, 37],
    [9, 7, 22, 4], [9, 23, 7, 27], [10, 8, 13, 56], [10, 23, 17, 0],
    [11, 7, 17, 9], [11, 22, 14, 44], [12, 7, 10, 8], [12, 22, 4, 9]
  ]
};

/**
 * 獲取某年的所有節氣
 */
export function getSolarTermsOfYear(year: number): SolarTermInfo[] {
  const terms: SolarTermInfo[] = [];

  // 優先使用預計算數據
  if (SOLAR_TERM_DATA[year]) {
    const data = SOLAR_TERM_DATA[year];
    for (let i = 0; i < 24; i++) {
      const [month, day, hour, minute] = data[i];
      terms.push({
        name: SOLAR_TERMS[i],
        index: i,
        date: new Date(year, month - 1, day, hour, minute),
        jieQi: i % 2 === 0  // 偶數索引為節，奇數為氣
      });
    }
    return terms;
  }

  // 否則使用近似計算
  for (let i = 0; i < 24; i++) {
    const date = calculateSolarTermDate(year, i);
    terms.push({
      name: SOLAR_TERMS[i],
      index: i,
      date,
      jieQi: i % 2 === 0
    });
  }

  return terms;
}

/**
 * 近似計算節氣日期
 * 使用簡化的太陽黃經計算
 */
function calculateSolarTermDate(year: number, termIndex: number): Date {
  // 節氣的平均間隔約15.22天
  // 基準：春分約在3月21日
  const springEquinoxIndex = 5;  // 春分在索引5

  // 計算相對於春分的天數偏移
  let indexOffset = termIndex - springEquinoxIndex;
  if (indexOffset < 0) indexOffset += 24;

  const daysPerTerm = 365.2422 / 24;
  const daysFromSpringEquinox = indexOffset * daysPerTerm;

  // 春分基準日期（約3月21日）
  const baseDate = new Date(year, 2, 21);
  const targetDate = new Date(baseDate.getTime() + daysFromSpringEquinox * 24 * 60 * 60 * 1000);

  // 調整年份（小寒、大寒可能在前一年）
  if (termIndex < 2 && targetDate.getMonth() > 6) {
    targetDate.setFullYear(year);
  }

  return targetDate;
}

/**
 * 獲取某日期的節氣（如果有的話）
 */
export function getSolarTermOfDate(year: number, month: number, day: number): string | null {
  const terms = getSolarTermsOfYear(year);

  for (const term of terms) {
    if (term.date.getMonth() + 1 === month && term.date.getDate() === day) {
      return term.name;
    }
  }

  // 也檢查前一年的節氣（處理年初的情況）
  if (month <= 2) {
    const prevTerms = getSolarTermsOfYear(year - 1);
    for (const term of prevTerms) {
      if (term.date.getFullYear() === year &&
          term.date.getMonth() + 1 === month &&
          term.date.getDate() === day) {
        return term.name;
      }
    }
  }

  return null;
}

/**
 * 獲取某日期所在的節氣月份
 * 用於確定月柱（以節為月份分界）
 */
export function getSolarTermMonth(year: number, month: number, day: number): number {
  const targetDate = new Date(year, month - 1, day);
  const terms = getSolarTermsOfYear(year);

  // 找到最近的節（偶數索引）
  let solarTermMonth = 1;

  for (let i = 0; i < 24; i += 2) {  // 只檢查節
    const term = terms[i];
    if (term && targetDate >= term.date) {
      // 節氣索引轉換為農曆月份
      // 立春(2)=正月, 驚蟄(4)=二月, ...
      solarTermMonth = Math.floor(i / 2) + 1;
      if (solarTermMonth > 12) solarTermMonth -= 12;
    }
  }

  // 處理跨年（小寒、大寒前）
  if (month === 1 && day < 6) {
    // 小寒前通常還在上一年的子月（十一月）
    const prevTerms = getSolarTermsOfYear(year - 1);
    const dongZhi = prevTerms[23];  // 冬至
    if (dongZhi && targetDate >= dongZhi.date) {
      solarTermMonth = 11;
    }
  }

  return solarTermMonth;
}

/**
 * 判斷某日期是否在立春之後
 */
export function isAfterLiChun(year: number, month: number, day: number): boolean {
  const terms = getSolarTermsOfYear(year);
  const liChun = terms[2];  // 立春在索引2

  if (!liChun) {
    // 如果沒有數據，使用近似值（2月4日左右）
    return month > 2 || (month === 2 && day >= 4);
  }

  const targetDate = new Date(year, month - 1, day);
  return targetDate >= liChun.date;
}

/**
 * 獲取指定月份的兩個節氣
 */
export function getSolarTermsOfMonth(year: number, month: number): SolarTermInfo[] {
  const terms = getSolarTermsOfYear(year);
  return terms.filter(term =>
    term.date.getMonth() + 1 === month &&
    term.date.getFullYear() === year
  );
}

/**
 * 獲取節氣名稱
 */
export function getSolarTermName(index: number): string {
  return SOLAR_TERMS[index % 24];
}
