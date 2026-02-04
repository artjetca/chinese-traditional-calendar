/**
 * 中國傳統曆法核心模組
 * Chinese Traditional Calendar Core Module
 */

// 常量導出
export * from './constants';
export * from './ganzhi';
export * from './lunarData';
export * from './lunar';

// 節氣計算
export * from './solarterms';

// 吉凶計算
export * from './fortune';

// 主要類型定義
export interface CalendarDate {
  // 公曆
  gregorianYear: number;
  gregorianMonth: number;
  gregorianDay: number;
  weekday: number;  // 0-6, 0=Sunday

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

  // 建除
  jianChu: string;

  // 沖煞
  clash: string;      // 沖什麼生肖
  shaDirection: string;  // 煞方

  // 飛星
  yearFlyingStar: number;
  monthFlyingStar: number;
  dayFlyingStar: number;

  // 節氣（如有）
  solarTerm?: string;

  // 節日（如有）
  festivals?: string[];
}

export interface DailyFortune {
  auspicious: string[];      // 宜
  inauspicious: string[];    // 忌
  auspiciousGods: string[];  // 吉神
  inauspiciousGods: string[]; // 凶煞
}

export interface HourFortune {
  hourIndex: number;
  hourName: string;
  ganZhi: string;
  timeRange: string;
  fortune: "吉" | "凶" | "平";
}

/**
 * 使用示例
 *
 * import {
 *   getDayGanZhi,
 *   getHourlyFortune,
 *   getJianChu,
 *   HEAVENLY_STEMS,
 *   EARTHLY_BRANCHES
 * } from './core';
 *
 * // 獲取日干支
 * const dayGanZhi = getDayGanZhi(2026, 2, 3);
 * console.log(dayGanZhi); // "戊申"
 *
 * // 獲取時辰吉凶
 * const hourlyFortune = getHourlyFortune(2026, 2, 3);
 * hourlyFortune.forEach(h => {
 *   console.log(`${h.hourName} ${h.ganZhi}: ${h.fortune}`);
 * });
 */
