/**
 * 中國傳統曆法常量定義
 */

// 十天干
export const HEAVENLY_STEMS = ["Jiǎ", "Yǐ", "Bǐng", "Dīng", "Wù", "Jǐ", "Gēng", "Xīn", "Rén", "Guǐ"] as const;

// 十二地支
export const EARTHLY_BRANCHES = ["Zǐ", "Chǒu", "Yín", "Mǎo", "Chén", "Sì", "Wǔ", "Wèi", "Shēn", "Yǒu", "Xū", "Hài"] as const;

// 十二生肖
export const ZODIAC_ANIMALS = ["Rata", "Buey", "Tigre", "Conejo", "Dragón", "Serpiente", "Caballo", "Cabra", "Mono", "Gallo", "Perro", "Cerdo"] as const;

// 五行
export const FIVE_ELEMENTS = ["Madera", "Fuego", "Tierra", "Metal", "Agua"] as const;

// 建除十二神
export const JIAN_CHU = ["Jiàn", "Chú", "Mǎn", "Píng", "Dìng", "Zhí", "Pò", "Wēi", "Chéng", "Shōu", "Kāi", "Bì"] as const;

// 二十四節氣
export const SOLAR_TERMS = [
  "Pequeño Frío", "Gran Frío", "Inicio Primavera", "Agua de Lluvia", "Despertar Insectos", "Equinoccio Primavera",
  "Luz Pura", "Lluvia de Granos", "Inicio Verano", "Pequeña Plenitud", "Granos en Espiga", "Solsticio Verano",
  "Pequeño Calor", "Gran Calor", "Inicio Otoño", "Fin del Calor", "Rocío Blanco", "Equinoccio Otoño",
  "Rocío Frío", "Descenso Escarcha", "Inicio Invierno", "Pequeña Nieve", "Gran Nieve", "Solsticio Invierno"
] as const;

// 農曆月份名稱
export const LUNAR_MONTH_NAMES = [
  "Mes 1", "Mes 2", "Mes 3", "Mes 4", "Mes 5", "Mes 6",
  "Mes 7", "Mes 8", "Mes 9", "Mes 10", "Mes 11", "Mes 12"
] as const;

// 農曆日期名稱
export const LUNAR_DAY_NAMES = [
  "Día 1", "Día 2", "Día 3", "Día 4", "Día 5", "Día 6", "Día 7", "Día 8", "Día 9", "Día 10",
  "Día 11", "Día 12", "Día 13", "Día 14", "Día 15", "Día 16", "Día 17", "Día 18", "Día 19", "Día 20",
  "Día 21", "Día 22", "Día 23", "Día 24", "Día 25", "Día 26", "Día 27", "Día 28", "Día 29", "Día 30"
] as const;

// 時辰名稱
export const HOUR_NAMES = [
  "子時", "丑時", "寅時", "卯時", "辰時", "巳時",
  "午時", "未時", "申時", "酉時", "戌時", "亥時"
] as const;

// 時辰對應時間
export const HOUR_TIME_RANGES = [
  { name: "Zǐ (Rata)", start: "23:00", end: "01:00", display: "23:00 - 01:00" },
  { name: "Chǒu (Buey)", start: "01:00", end: "03:00", display: "01:00 - 03:00" },
  { name: "Yín (Tigre)", start: "03:00", end: "05:00", display: "03:00 - 05:00" },
  { name: "Mǎo (Conejo)", start: "05:00", end: "07:00", display: "05:00 - 07:00" },
  { name: "Chén (Dragón)", start: "07:00", end: "09:00", display: "07:00 - 09:00" },
  { name: "Sì (Serpiente)", start: "09:00", end: "11:00", display: "09:00 - 11:00" },
  { name: "Wǔ (Caballo)", start: "11:00", end: "13:00", display: "11:00 - 13:00" },
  { name: "Wèi (Cabra)", start: "13:00", end: "15:00", display: "13:00 - 15:00" },
  { name: "Shēn (Mono)", start: "15:00", end: "17:00", display: "15:00 - 17:00" },
  { name: "Yǒu (Gallo)", start: "17:00", end: "19:00", display: "17:00 - 19:00" },
  { name: "Xū (Perro)", start: "19:00", end: "21:00", display: "19:00 - 21:00" },
  { name: "Hài (Cerdo)", start: "21:00", end: "23:00", display: "21:00 - 23:00" }
] as const;

// 六沖對照表（地支索引）
export const CLASH_PAIRS: Record<number, number> = {
  0: 6,   // 子沖午
  1: 7,   // 丑沖未
  2: 8,   // 寅沖申
  3: 9,   // 卯沖酉
  4: 10,  // 辰沖戌
  5: 11,  // 巳沖亥
  6: 0,   // 午沖子
  7: 1,   // 未沖丑
  8: 2,   // 申沖寅
  9: 3,   // 酉沖卯
  10: 4,  // 戌沖辰
  11: 5   // 亥沖巳
};

// 六十甲子納音表
export const SIXTY_JIAZI_NAYIN: Record<string, string> = {
  "JiǎZǐ": "Metal en Mar", "YǐChǒu": "Metal en Mar",
  "BǐngYín": "Fuego en Horno", "DīngMǎo": "Fuego en Horno",
  "WùChén": "Madera Gran Bosque", "JǐSì": "Madera Gran Bosque",
  "GēngWǔ": "Tierra de Camino", "XīnWèi": "Tierra de Camino",
  "RénShēn": "Metal de Espada", "GuǐYǒu": "Metal de Espada",
  "JiǎXū": "Fuego de Montaña", "YǐHài": "Fuego de Montaña",
  "BǐngZǐ": "Agua de Arroyo", "DīngChǒu": "Agua de Arroyo",
  "WùYín": "Tierra de Muralla", "JǐMǎo": "Tierra de Muralla",
  "GēngChén": "Metal de Cera", "XīnSì": "Metal de Cera",
  "RénWǔ": "Madera de Sauce", "GuǐWèi": "Madera de Sauce",
  "JiǎShēn": "Agua de Fuente", "YǐYǒu": "Agua de Fuente",
  "BǐngXū": "Tierra de Techo", "DīngHài": "Tierra de Techo",
  "WùZǐ": "Fuego de Trueno", "JǐChǒu": "Fuego de Trueno",
  "GēngYín": "Madera de Pino", "XīnMǎo": "Madera de Pino",
  "RénChén": "Agua de Río", "GuǐSì": "Agua de Río",
  "JiǎWǔ": "Metal de Arena", "YǐWèi": "Metal de Arena",
  "BǐngShēn": "Fuego Bajo Montaña", "DīngYǒu": "Fuego Bajo Montaña",
  "WùXū": "Madera de Llanura", "JǐHài": "Madera de Llanura",
  "GēngZǐ": "Tierra de Pared", "XīnChǒu": "Tierra de Pared",
  "RénYín": "Metal Dorado", "GuǐMǎo": "Metal Dorado",
  "JiǎChén": "Fuego de Lámpara", "YǐSì": "Fuego de Lámpara",
  "BǐngWǔ": "Agua Celestial", "DīngWèi": "Agua Celestial",
  "WùShēn": "Tierra de Posta", "JǐYǒu": "Tierra de Posta",
  "GēngXū": "Metal de Horquilla", "XīnHài": "Metal de Horquilla",
  "RénZǐ": "Madera de Morera", "GuǐChǒu": "Madera de Morera",
  "JiǎYín": "Agua de Río Grande", "YǐMǎo": "Agua de Río Grande",
  "BǐngChén": "Tierra de Arena", "DīngSì": "Tierra de Arena",
  "WùWǔ": "Fuego Celestial", "JǐWèi": "Fuego Celestial",
  "GēngShēn": "Madera de Granada", "XīnYǒu": "Madera de Granada",
  "RénXū": "Agua de Océano", "GuǐHài": "Agua de Océano"
};

// 宜忌事項列表
export const AUSPICIOUS_ACTIVITIES = [
  "嫁娶", "祭祀", "祈福", "求嗣", "開光", "出行", "解除", "動土",
  "起基", "開市", "交易", "立券", "掛匾", "安床", "入宅", "移徙",
  "安葬", "破土", "啟鑽", "修墳", "立碑", "納采", "訂盟", "納財",
  "開倉", "出貨財", "栽種", "牧養", "納畜", "畋獵", "入殮", "移柩",
  "安門", "修造", "上樑", "豎柱", "蓋屋", "造船", "會友", "冠笄",
  "進人口", "裁衣", "沐浴", "理髮", "求醫", "治病"
] as const;

export const INAUSPICIOUS_ACTIVITIES = [
  "嫁娶", "祭祀", "祈福", "出行", "動土", "開市", "安葬", "破土",
  "入宅", "移徙", "安床", "造船", "開倉", "納財", "栽種", "牧養"
] as const;

// 吉神
export const AUSPICIOUS_GODS = [
  "天德", "月德", "天德合", "月德合", "天恩", "母倉", "陽德",
  "五富", "福生", "除神", "司命", "吉期", "天喜", "天赦",
  "時德", "民日", "三合", "臨日", "天馬", "敬安"
] as const;

// 凶煞
export const INAUSPICIOUS_GODS = [
  "天刑", "五離", "遊禍", "歸忌", "血支", "月破", "四廢",
  "天賊", "九空", "往亡", "受死", "月煞", "月虛", "血忌",
  "天牢", "大耗", "小耗", "四窮", "五墓", "復日"
] as const;
