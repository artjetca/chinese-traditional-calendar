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

export type FortuneLevel = "Bueno" | "Malo" | "Neutral";

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
  // hourIndex directly corresponds to the Earthly Branch index (Zǐ=0, Chǒu=1, etc.)
  const hourZhiIndex = hourIndex;

  // 規則1：時辰與日支相沖為凶
  if (isClash(dayZhiIndex, hourZhiIndex)) {
    return "Malo";
  }

  // 規則2：檢查是否為黃道吉時
  if (isHuangDaoHour(dayZhiIndex, hourIndex)) {
    return "Bueno";
  }

  // 規則3：檢查是否為黑道凶時
  if (isHeiDaoHour(dayZhiIndex, hourIndex)) {
    return "Malo";
  }

  return "Neutral";
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
  // Matrimonio
  "Matrimonio", "Compromiso", "Propuesta", "Pedida", "Yerno", "Visita",
  // Negocios
  "Inauguración", "Contrato", "Comercio", "Finanzas", "Almacén", "Envío", "Letrero",
  // Construcción
  "Excavar", "Romper Tierra", "Renovar", "Cimientos", "Vigas", "Pilares", "Puertas", "Consagrar",
  // Hogar
  "Mudanza", "Traslado", "Cama", "Cocina", "Limpieza", "Propiedad",
  // Social
  "Amigos", "Viaje", "Viaje Largo", "Banquete", "Empleo",
  // Ceremonias
  "Ceremonias", "Oraciones", "Descendencia", "Ayuno", "Baño",
  // Médico
  "Médico", "Tratamiento", "Acupuntura", "Medicina",
  // Funerario
  "Entierro", "Exhumación", "Luto", "Duelo",
  // Agricultura
  "Sembrar", "Pastoreo", "Ganado", "Caza", "Pesca",
  // Otros
  "Ropa", "Ceremonia", "Corte Pelo", "Tumba", "Lápida", "Purificar", "Almacenar"
];

/**
 * 活動分類
 */
export const ACTIVITY_CATEGORIES: Record<string, string[]> = {
  "Matrimonio": ["Matrimonio", "Compromiso", "Propuesta", "Pedida", "Yerno", "Visita"],
  "Negocios": ["Inauguración", "Contrato", "Comercio", "Finanzas", "Almacén", "Envío", "Letrero"],
  "Construcción": ["Excavar", "Romper Tierra", "Renovar", "Cimientos", "Vigas", "Pilares", "Puertas", "Consagrar"],
  "Hogar": ["Mudanza", "Traslado", "Cama", "Cocina", "Limpieza", "Propiedad"],
  "Social": ["Amigos", "Viaje", "Viaje Largo", "Banquete", "Empleo"],
  "Ceremonias": ["Ceremonias", "Oraciones", "Descendencia", "Ayuno", "Baño"],
  "Médico": ["Médico", "Tratamiento", "Acupuntura", "Medicina"],
  "Funerario": ["Entierro", "Exhumación", "Luto", "Duelo"],
  "Agricultura": ["Sembrar", "Pastoreo", "Ganado", "Caza", "Pesca"],
  "Otros": ["Ropa", "Ceremonia", "Corte Pelo", "Tumba", "Lápida", "Purificar", "Almacenar"]
};

/**
 * 根據建除獲取宜忌事項（擴展版）
 */
export function getAuspiciousByJianChu(jianChu: string): { auspicious: string[], inauspicious: string[] } {
  const jianChuFortune: Record<string, { auspicious: string[], inauspicious: string[] }> = {
    "Jiàn": {
      auspicious: ["Ceremonias", "Oraciones", "Viaje", "Excavar", "Amigos", "Vigas", "Consagrar", "Ganado"],
      inauspicious: ["Inauguración", "Entierro", "Matrimonio", "Traslado"]
    },
    "Chú": {
      auspicious: ["Purificar", "Baño", "Médico", "Tratamiento", "Limpieza", "Medicina"],
      inauspicious: ["Matrimonio", "Viaje Largo", "Inauguración", "Comercio"]
    },
    "Mǎn": {
      auspicious: ["Oraciones", "Matrimonio", "Mudanza", "Inauguración", "Finanzas", "Propuesta", "Traslado", "Propiedad"],
      inauspicious: ["Excavar", "Medicina", "Romper Tierra"]
    },
    "Píng": {
      auspicious: ["Renovar", "Excavar", "Cama", "Ropa", "Corte Pelo"],
      inauspicious: ["Oraciones", "Descendencia", "Matrimonio", "Inauguración"]
    },
    "Dìng": {
      auspicious: ["Matrimonio", "Inauguración", "Comercio", "Contrato", "Compromiso", "Propuesta", "Amigos", "Propiedad"],
      inauspicious: ["Litigio", "Viaje Largo", "Excavar"]
    },
    "Zhí": {
      auspicious: ["Ceremonias", "Caza", "Pesca", "Ganado", "Pastoreo"],
      inauspicious: ["Inauguración", "Comercio", "Matrimonio", "Traslado"]
    },
    "Pò": {
      auspicious: ["Tratamiento", "Médico", "Romper Tierra", "Purificar"],
      inauspicious: ["Matrimonio", "Inauguración", "Comercio", "Oraciones", "Mudanza", "Traslado"]
    },
    "Wēi": {
      auspicious: ["Cama", "Ceremonias", "Oraciones", "Baño", "Ayuno"],
      inauspicious: ["Altura", "Viaje Largo", "Viaje", "Excavar", "Renovar"]
    },
    "Chéng": {
      auspicious: ["Inauguración", "Matrimonio", "Mudanza", "Finanzas", "Contrato", "Comercio", "Propiedad", "Traslado", "Amigos"],
      inauspicious: ["Litigio", "Excavar", "Entierro"]
    },
    "Shōu": {
      auspicious: ["Finanzas", "Mudanza", "Almacenar", "Ganado", "Pastoreo", "Sembrar"],
      inauspicious: ["Inauguración", "Excavar", "Viaje", "Matrimonio"]
    },
    "Kāi": {
      auspicious: ["Inauguración", "Excavar", "Consagrar", "Matrimonio", "Viaje", "Traslado", "Mudanza", "Comercio", "Contrato", "Amigos"],
      inauspicious: ["Entierro", "Médico"]
    },
    "Bì": {
      auspicious: ["Entierro", "Almacenar", "Tumba", "Exhumación"],
      inauspicious: ["Inauguración", "Viaje", "Matrimonio", "Excavar", "Comercio", "Traslado"]
    }
  };

  return jianChuFortune[jianChu] || { auspicious: [], inauspicious: [] };
}

/**
 * 查詢特定活動在某日是否適宜
 */
export function isActivityAuspicious(jianChu: string, activity: string): "Fav" | "Desf" | "Neut" {
  const fortune = getAuspiciousByJianChu(jianChu);
  if (fortune.auspicious.includes(activity)) return "Fav";
  if (fortune.inauspicious.includes(activity)) return "Desf";
  return "Neut";
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
    case "Bueno": return "☆";
    case "Malo": return "●";
    case "Neutral": return "○";
    default: return "○";
  }
}
