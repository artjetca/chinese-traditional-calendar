/**
 * 吉凶計算模組
 */

import {
  JIAN_CHU,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  HOUR_TIME_RANGES
} from './constants';
import {
  getDayGanIndex,
  getDayZhiIndex,
  getHourGanZhi,
  parseGanZhi
} from './ganzhi';

export type FortuneLevel = "吉" | "凶" | "平";

export interface HourlyFortuneInfo {
  hourIndex: number;
  hourName: string;
  ganZhi: string;
  timeRange: string;
  fortune: FortuneLevel;
}

export interface DailyFortuneInfo {
  jianChu: string;
  auspicious: string[];
  inauspicious: string[];
  auspiciousGods: string[];
  inauspiciousGods: string[];
}

/**
 * 計算建除十二神
 * @param monthZhiIndex 月支索引（月建）
 * @param dayZhiIndex 日支索引
 */
export function getJianChu(monthZhiIndex: number, dayZhiIndex: number): string {
  // 建除以月建為起點
  // 月建那天為"建"日
  const offset = (dayZhiIndex - monthZhiIndex + 12) % 12;
  return JIAN_CHU[offset];
}

/**
 * 獲取月建索引
 * 正月建寅，二月建卯...
 * @param lunarMonth 農曆月份（1-12）
 */
export function getMonthZhiIndex(lunarMonth: number): number {
  // 正月=寅(2)，二月=卯(3)...
  return (lunarMonth + 1) % 12;
}

/**
 * 計算時辰吉凶
 * @param year 公曆年
 * @param month 公曆月
 * @param day 公曆日
 */
export function getHourlyFortune(year: number, month: number, day: number): HourlyFortuneInfo[] {
  const dayGanIndex = getDayGanIndex(year, month, day);
  const dayZhiIndex = getDayZhiIndex(year, month, day);

  const result: HourlyFortuneInfo[] = [];

  for (let hourIndex = 0; hourIndex < 12; hourIndex++) {
    const ganZhi = getHourGanZhi(dayGanIndex, hourIndex);
    const fortune = calculateHourFortune(dayGanIndex, dayZhiIndex, hourIndex, ganZhi);

    result.push({
      hourIndex,
      hourName: HOUR_TIME_RANGES[hourIndex].name,
      ganZhi,
      timeRange: HOUR_TIME_RANGES[hourIndex].display,
      fortune
    });
  }

  return result;
}

/**
 * 計算單個時辰的吉凶
 */
function calculateHourFortune(
  dayGanIndex: number,
  dayZhiIndex: number,
  hourIndex: number,
  hourGanZhi: string
): FortuneLevel {
  const parsed = parseGanZhi(hourGanZhi);
  if (!parsed) return "平";

  const hourZhiIndex = parsed.zhiIndex;

  // 規則1：時辰與日支相沖為凶
  if (isClash(dayZhiIndex, hourZhiIndex)) {
    return "凶";
  }

  // 規則2：檢查是否為黃道吉時
  if (isHuangDaoHour(dayZhiIndex, hourIndex)) {
    return "吉";
  }

  // 規則3：檢查是否為黑道凶時
  if (isHeiDaoHour(dayZhiIndex, hourIndex)) {
    return "凶";
  }

  return "平";
}

/**
 * 檢查六沖
 */
function isClash(zhi1: number, zhi2: number): boolean {
  return Math.abs(zhi1 - zhi2) === 6;
}

/**
 * 檢查是否為黃道吉時（簡化版）
 * 黃道六神：青龍、明堂、金匱、天德、玉堂、司命
 */
function isHuangDaoHour(dayZhiIndex: number, hourIndex: number): boolean {
  // 黃道吉時的簡化計算
  // 實際算法需要根據日支和黃道六神的位置來判斷
  // 這裡使用簡化規則

  // 子午卯酉日
  if ([0, 6, 3, 9].includes(dayZhiIndex)) {
    // 子、丑、卯、午、未、酉時為吉
    return [0, 1, 3, 6, 7, 9].includes(hourIndex);
  }

  // 寅申巳亥日
  if ([2, 8, 5, 11].includes(dayZhiIndex)) {
    // 寅、卯、巳、申、酉、亥時為吉
    return [2, 3, 5, 8, 9, 11].includes(hourIndex);
  }

  // 辰戌丑未日
  if ([4, 10, 1, 7].includes(dayZhiIndex)) {
    // 子、寅、辰、午、申、戌時為吉
    return [0, 2, 4, 6, 8, 10].includes(hourIndex);
  }

  return false;
}

/**
 * 檢查是否為黑道凶時（簡化版）
 * 黑道六神：天刑、朱雀、白虎、天牢、玄武、勾陳
 */
function isHeiDaoHour(dayZhiIndex: number, hourIndex: number): boolean {
  // 黑道凶時是黃道吉時的相反
  // 簡化處理：與日支形成刑、害關係的時辰

  // 三刑
  // 寅刑巳，巳刑申，申刑寅
  // 丑刑戌，戌刑未，未刑丑
  // 子刑卯，卯刑子
  // 辰、午、酉、亥自刑

  const xingPairs: Record<number, number[]> = {
    0: [3],      // 子刑卯
    1: [10],     // 丑刑戌
    2: [5],      // 寅刑巳
    3: [0],      // 卯刑子
    4: [4],      // 辰自刑
    5: [8],      // 巳刑申
    6: [6],      // 午自刑
    7: [1],      // 未刑丑
    8: [2],      // 申刑寅
    9: [9],      // 酉自刑
    10: [7],     // 戌刑未
    11: [11]     // 亥自刑
  };

  return xingPairs[dayZhiIndex]?.includes(hourIndex) || false;
}

/**
 * 所有活動類別
 */
export const ALL_ACTIVITIES = [
  // 婚姻類
  "嫁娶", "訂盟", "納采", "問名", "納婿", "歸寧",
  // 事業類
  "開市", "立約", "交易", "納財", "開倉", "出貨", "掛匾",
  // 建築類
  "動土", "破土", "修造", "起基", "上樑", "豎柱", "安門", "開光",
  // 居家類
  "入宅", "移徙", "安床", "安灶", "掃舍", "置產",
  // 社交類
  "會友", "出行", "遠行", "宴會", "赴任",
  // 祭祀類
  "祭祀", "祈福", "求嗣", "齋醮", "沐浴",
  // 醫療類
  "求醫", "治病", "針灸", "服藥",
  // 喪葬類
  "安葬", "啟攢", "除服", "成服",
  // 農牧類
  "栽種", "牧養", "納畜", "捕捉", "畋獵",
  // 其他
  "裁衣", "冠笄", "理髮", "修墳", "立碑", "解除", "收藏"
];

/**
 * 活動分類
 */
export const ACTIVITY_CATEGORIES: Record<string, string[]> = {
  "婚姻": ["嫁娶", "訂盟", "納采", "問名", "納婿", "歸寧"],
  "事業": ["開市", "立約", "交易", "納財", "開倉", "出貨", "掛匾"],
  "建築": ["動土", "破土", "修造", "起基", "上樑", "豎柱", "安門", "開光"],
  "居家": ["入宅", "移徙", "安床", "安灶", "掃舍", "置產"],
  "社交": ["會友", "出行", "遠行", "宴會", "赴任"],
  "祭祀": ["祭祀", "祈福", "求嗣", "齋醮", "沐浴"],
  "醫療": ["求醫", "治病", "針灸", "服藥"],
  "喪葬": ["安葬", "啟攢", "除服", "成服"],
  "農牧": ["栽種", "牧養", "納畜", "捕捉", "畋獵"],
  "其他": ["裁衣", "冠笄", "理髮", "修墳", "立碑", "解除", "收藏"]
};

/**
 * 根據建除獲取宜忌事項（擴展版）
 */
export function getAuspiciousByJianChu(jianChu: string): { auspicious: string[], inauspicious: string[] } {
  const jianChuFortune: Record<string, { auspicious: string[], inauspicious: string[] }> = {
    "建": {
      auspicious: ["祭祀", "祈福", "出行", "動土", "會友", "上樑", "開光", "納畜"],
      inauspicious: ["開市", "安葬", "嫁娶", "移徙"]
    },
    "除": {
      auspicious: ["解除", "沐浴", "求醫", "治病", "掃舍", "服藥"],
      inauspicious: ["嫁娶", "遠行", "開市", "交易"]
    },
    "滿": {
      auspicious: ["祈福", "嫁娶", "入宅", "開市", "納財", "納采", "移徙", "置產"],
      inauspicious: ["動土", "服藥", "破土"]
    },
    "平": {
      auspicious: ["修造", "動土", "安床", "裁衣", "理髮"],
      inauspicious: ["祈福", "求嗣", "嫁娶", "開市"]
    },
    "定": {
      auspicious: ["嫁娶", "開市", "交易", "立約", "訂盟", "納采", "會友", "置產"],
      inauspicious: ["訴訟", "遠行", "動土"]
    },
    "執": {
      auspicious: ["祭祀", "捕捉", "畋獵", "納畜", "牧養"],
      inauspicious: ["開市", "交易", "嫁娶", "移徙"]
    },
    "破": {
      auspicious: ["治病", "求醫", "破土", "解除"],
      inauspicious: ["嫁娶", "開市", "交易", "祈福", "入宅", "移徙"]
    },
    "危": {
      auspicious: ["安床", "祭祀", "祈福", "沐浴", "齋醮"],
      inauspicious: ["登高", "遠行", "出行", "動土", "修造"]
    },
    "成": {
      auspicious: ["開市", "嫁娶", "入宅", "納財", "立約", "交易", "置產", "移徙", "會友"],
      inauspicious: ["訴訟", "動土", "安葬"]
    },
    "收": {
      auspicious: ["納財", "入宅", "收藏", "納畜", "牧養", "栽種"],
      inauspicious: ["開市", "動土", "出行", "嫁娶"]
    },
    "開": {
      auspicious: ["開市", "動土", "開光", "嫁娶", "出行", "移徙", "入宅", "交易", "立約", "會友"],
      inauspicious: ["安葬", "求醫"]
    },
    "閉": {
      auspicious: ["安葬", "收藏", "修墳", "啟攢"],
      inauspicious: ["開市", "出行", "嫁娶", "動土", "交易", "移徙"]
    }
  };

  return jianChuFortune[jianChu] || { auspicious: [], inauspicious: [] };
}

/**
 * 查詢特定活動在某日是否適宜
 */
export function isActivityAuspicious(jianChu: string, activity: string): "宜" | "忌" | "平" {
  const fortune = getAuspiciousByJianChu(jianChu);
  if (fortune.auspicious.includes(activity)) return "宜";
  if (fortune.inauspicious.includes(activity)) return "忌";
  return "平";
}

/**
 * 獲取指定活動的適宜日期建議
 */
export function getRecommendedJianChuForActivity(activity: string): { good: string[], bad: string[] } {
  const good: string[] = [];
  const bad: string[] = [];
  
  const allJianChu = ["建", "除", "滿", "平", "定", "執", "破", "危", "成", "收", "開", "閉"];
  
  for (const jc of allJianChu) {
    const fortune = getAuspiciousByJianChu(jc);
    if (fortune.auspicious.includes(activity)) good.push(jc);
    if (fortune.inauspicious.includes(activity)) bad.push(jc);
  }
  
  return { good, bad };
}

/**
 * 格式化時辰吉凶為表格數據
 */
export function formatHourlyFortuneTable(fortunes: HourlyFortuneInfo[]): string[][] {
  return fortunes.map(f => [
    getFortuneSymbol(f.fortune),
    f.fortune,
    `${f.ganZhi} (${f.timeRange})`
  ]);
}

/**
 * 獲取吉凶符號
 */
function getFortuneSymbol(fortune: FortuneLevel): string {
  switch (fortune) {
    case "吉": return "☆";
    case "凶": return "●";
    case "平": return "○";
    default: return "○";
  }
}
