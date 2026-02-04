/**
 * 天干地支計算模組
 */

import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  ZODIAC_ANIMALS,
  SIXTY_JIAZI_NAYIN,
  CLASH_PAIRS
} from './constants';

/**
 * 獲取年干支
 * 注意：以立春為界，立春前仍屬上一年
 * @param year 公曆年份
 * @param isAfterLiChun 是否已過立春
 */
export function getYearGanZhi(year: number, isAfterLiChun: boolean = true): string {
  const effectiveYear = isAfterLiChun ? year : year - 1;
  // 以1984年甲子年為基準
  const offset = effectiveYear - 1984;
  const ganIndex = ((offset % 10) + 10) % 10;
  const zhiIndex = ((offset % 12) + 12) % 12;

  return HEAVENLY_STEMS[ganIndex] + EARTHLY_BRANCHES[zhiIndex];
}

/**
 * 獲取年干索引
 */
export function getYearGanIndex(year: number, isAfterLiChun: boolean = true): number {
  const effectiveYear = isAfterLiChun ? year : year - 1;
  const offset = effectiveYear - 1984;
  return ((offset % 10) + 10) % 10;
}

/**
 * 獲取年支索引
 */
export function getYearZhiIndex(year: number, isAfterLiChun: boolean = true): number {
  const effectiveYear = isAfterLiChun ? year : year - 1;
  const offset = effectiveYear - 1984;
  return ((offset % 12) + 12) % 12;
}

/**
 * 獲取月干支
 * 月支固定：正月建寅，二月建卯...
 * 月干由年干推算（五虎遁）
 * @param yearGanIndex 年干索引
 * @param lunarMonth 農曆月份（1-12）
 */
export function getMonthGanZhi(yearGanIndex: number, lunarMonth: number): string {
  // 月支：正月=寅(2)，二月=卯(3)...
  const zhiIndex = (lunarMonth + 1) % 12;

  // 五虎遁計算月干
  // 甲己年：正月丙寅 -> baseGan = 2
  // 乙庚年：正月戊寅 -> baseGan = 4
  // 丙辛年：正月庚寅 -> baseGan = 6
  // 丁壬年：正月壬寅 -> baseGan = 8
  // 戊癸年：正月甲寅 -> baseGan = 0
  const baseGanMap = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
  const baseGan = baseGanMap[yearGanIndex];
  const ganIndex = (baseGan + lunarMonth - 1) % 10;

  return HEAVENLY_STEMS[ganIndex] + EARTHLY_BRANCHES[zhiIndex];
}

/**
 * 獲取日干支
 * 使用儒略日計算
 * @param year 公曆年
 * @param month 公曆月
 * @param day 公曆日
 */
export function getDayGanZhi(year: number, month: number, day: number): string {
  // 計算儒略日數
  const jd = Math.floor(getJulianDay(year, month, day));

  // 以儒略日 2451911 (2001年1月1日，辛巳日) 為基準
  // 辛=7, 巳=5
  const baseJd = 2451911;
  const offset = jd - baseJd;

  const ganIndex = ((7 + offset) % 10 + 10) % 10;
  const zhiIndex = ((5 + offset) % 12 + 12) % 12;

  return HEAVENLY_STEMS[ganIndex] + EARTHLY_BRANCHES[zhiIndex];
}

/**
 * 獲取日干索引
 */
export function getDayGanIndex(year: number, month: number, day: number): number {
  const jd = Math.floor(getJulianDay(year, month, day));
  const baseJd = 2451911;
  const offset = jd - baseJd;
  return ((7 + offset) % 10 + 10) % 10;
}

/**
 * 獲取日支索引
 */
export function getDayZhiIndex(year: number, month: number, day: number): number {
  const jd = Math.floor(getJulianDay(year, month, day));
  const baseJd = 2451911;
  const offset = jd - baseJd;
  return ((5 + offset) % 12 + 12) % 12;
}

/**
 * 獲取時干支
 * @param dayGanIndex 日干索引
 * @param hourIndex 時辰索引（0-11，0=子時）
 */
export function getHourGanZhi(dayGanIndex: number, hourIndex: number): string {
  // 五鼠遁：根據日干確定子時天干
  // 甲己日：子時甲子 -> baseGan = 0
  // 乙庚日：子時丙子 -> baseGan = 2
  // 丙辛日：子時戊子 -> baseGan = 4
  // 丁壬日：子時庚子 -> baseGan = 6
  // 戊癸日：子時壬子 -> baseGan = 8
  const baseGanMap = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
  const baseGan = baseGanMap[dayGanIndex];

  const ganIndex = (baseGan + hourIndex) % 10;

  return HEAVENLY_STEMS[ganIndex] + EARTHLY_BRANCHES[hourIndex];
}

/**
 * 根據時間獲取時辰索引
 * @param hour 24小時制的小時（0-23）
 */
export function getHourIndex(hour: number): number {
  // 子時：23:00-01:00 -> 0
  // 丑時：01:00-03:00 -> 1
  // ...
  if (hour === 23) return 0;
  return Math.floor((hour + 1) / 2);
}

/**
 * 獲取納音五行
 * @param ganZhi 干支（如"甲子"）
 */
export function getNaYin(ganZhi: string): string {
  return SIXTY_JIAZI_NAYIN[ganZhi] || "";
}

/**
 * 獲取生肖
 * @param zhiIndex 地支索引
 */
export function getZodiac(zhiIndex: number): string {
  return ZODIAC_ANIMALS[zhiIndex];
}

/**
 * 獲取沖煞的生肖
 * @param dayZhiIndex 日支索引
 */
export function getClashZodiac(dayZhiIndex: number): string {
  const clashZhiIndex = CLASH_PAIRS[dayZhiIndex];
  return ZODIAC_ANIMALS[clashZhiIndex];
}

/**
 * 獲取煞方
 * @param dayZhiIndex 日支索引
 */
export function getShaDirection(dayZhiIndex: number): string {
  // 寅午戌日煞北
  if ([2, 6, 10].includes(dayZhiIndex)) return "北方";
  // 申子辰日煞南
  if ([8, 0, 4].includes(dayZhiIndex)) return "南方";
  // 亥卯未日煞西
  if ([11, 3, 7].includes(dayZhiIndex)) return "西方";
  // 巳酉丑日煞東
  if ([5, 9, 1].includes(dayZhiIndex)) return "東方";
  return "";
}

/**
 * 計算儒略日（簡化版）
 */
function getJulianDay(year: number, month: number, day: number): number {
  let y = year;
  let m = month;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  return Math.floor(365.25 * (y + 4716)) +
         Math.floor(30.6001 * (m + 1)) +
         day + b - 1524.5;
}

/**
 * 解析干支字符串
 * @param ganZhi 干支字符串（如"甲子"）
 */
export function parseGanZhi(ganZhi: string): { gan: string; zhi: string; ganIndex: number; zhiIndex: number } | null {
  if (ganZhi.length !== 2) return null;

  const gan = ganZhi[0];
  const zhi = ganZhi[1];

  const ganIndex = HEAVENLY_STEMS.indexOf(gan as any);
  const zhiIndex = EARTHLY_BRANCHES.indexOf(zhi as any);

  if (ganIndex === -1 || zhiIndex === -1) return null;

  return { gan, zhi, ganIndex, zhiIndex };
}
