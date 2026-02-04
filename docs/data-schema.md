# 資料結構定義 (Data Schema)

## 1. 每日基本資料 (DailyInfo)

```typescript
interface DailyInfo {
  // 公曆資料
  gregorianDate: string;        // "2026-02-03"
  weekday: string;              // "星期二"

  // 農曆資料
  lunarYear: number;            // 2025 (農曆年)
  lunarMonth: number;           // 12 (十二月)
  lunarDay: number;             // 16 (十六日)
  lunarMonthName: string;       // "十二月"
  lunarDayName: string;         // "十六"
  isLeapMonth: boolean;         // 是否閏月

  // 天干地支
  yearGanZhi: string;           // "乙巳年"
  monthGanZhi: string;          // "己丑月"
  dayGanZhi: string;            // "戊申日"

  // 納音五行
  yearNaYin: string;            // "佛燈火"
  monthNaYin: string;           // "霹靂火"
  dayNaYin: string;             // "大驛土"

  // 飛星
  yearFlyingStar: number;       // 2 (二黑)
  monthFlyingStar: number;      // 9 (九紫)
  dayFlyingStar: number;        // 9 (九紫)

  // 建除十二神
  jianChu: string;              // "危日"

  // 沖煞
  dayClash: string;             // "虎年生人" (沖什麼生肖)
  daySha: string;               // "南方" (煞方位)

  // 節氣（如有）
  solarTerm?: string;           // "立春", "雨水" 等

  // 節日（如有）
  festival?: string[];          // ["大除夕", "情人節"] 等
}
```

## 2. 每日宜忌 (DailyFortune)

```typescript
interface DailyFortune {
  date: string;

  // 宜做之事（紅色）
  auspicious: string[];         // ["沐浴", "開倉", "出貨財", "開市", "交易", "立券", "納財", "栽種", "納畜", "牧養", "畋獵", "入殮", "破土", "安葬"]

  // 忌做之事（藍色）
  inauspicious: string[];       // ["祈福", "嫁娶", "安床", "入宅", "造船"]

  // 吉神
  auspiciousGods: string[];     // ["吉星", "母倉", "陽德", "五富", "福生", "除神", "司命"]

  // 凶煞
  inauspiciousGods: string[];   // ["兇星", "遊禍", "五離"]
}
```

## 3. 時辰吉凶 (HourlyFortune)

```typescript
interface HourlyFortune {
  date: string;
  hours: HourInfo[];
}

interface HourInfo {
  // 時辰名稱
  name: string;                 // "子時", "丑時" 等
  ganZhi: string;               // "壬子時", "癸丑時" 等

  // 時間範圍
  startTime: string;            // "23:00" 或 "晚上11時"
  endTime: string;              // "01:00" 或 "早上1時"

  // 吉凶評級
  fortune: "吉" | "凶" | "平";

  // 星級（可選）
  rating?: number;              // 1-5 星

  // 詳細說明（可選）
  description?: string;
}
```

### 十二時辰對照表

| 時辰 | 地支 | 時間範圍 | 現代時間 |
|------|------|----------|----------|
| 子時 | 子 | 晚上11時 - 早上1時 | 23:00-01:00 |
| 丑時 | 丑 | 早上1時 - 早上3時 | 01:00-03:00 |
| 寅時 | 寅 | 早上3時 - 早上5時 | 03:00-05:00 |
| 卯時 | 卯 | 早上5時 - 早上7時 | 05:00-07:00 |
| 辰時 | 辰 | 早上7時 - 早上9時 | 07:00-09:00 |
| 巳時 | 巳 | 早上9時 - 早上11時 | 09:00-11:00 |
| 午時 | 午 | 早上11時 - 下午1時 | 11:00-13:00 |
| 未時 | 未 | 下午1時 - 下午3時 | 13:00-15:00 |
| 申時 | 申 | 下午3時 - 下午5時 | 15:00-17:00 |
| 酉時 | 酉 | 下午5時 - 晚上7時 | 17:00-19:00 |
| 戌時 | 戌 | 晚上7時 - 晚上9時 | 19:00-21:00 |
| 亥時 | 亥 | 晚上9時 - 晚上11時 | 21:00-23:00 |

## 4. 月曆資料 (MonthlyCalendar)

```typescript
interface MonthlyCalendar {
  year: number;
  month: number;
  region: "CHN" | "HKG" | "MAC" | "TWN";  // 大陸/香港/澳門/台灣
  days: DayCell[];
}

interface DayCell {
  gregorianDay: number;         // 1-31
  lunarDay: string;             // "初一", "十五" 等
  dayGanZhi: string;            // "丙午日"
  clash: string;                // "沖鼠"
  auspiciousBrief: string[];    // 簡要宜事 ["開市", "嫁娶"]
  inauspiciousBrief: string[];  // 簡要忌事 ["動土", "出行"]
  solarTerm?: string;           // 節氣
  festival?: string;            // 節日
  backgroundColor?: string;     // 背景色 (節日為粉紅等)
}
```

## 5. 天干地支基礎資料

### 十天干
```typescript
const HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
```

### 十二地支
```typescript
const EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
```

### 十二生肖
```typescript
const ZODIAC_ANIMALS = ["鼠", "牛", "虎", "兔", "龍", "蛇", "馬", "羊", "猴", "雞", "狗", "豬"];
```

### 五行
```typescript
const FIVE_ELEMENTS = ["木", "火", "土", "金", "水"];
```

### 建除十二神
```typescript
const JIAN_CHU = ["建", "除", "滿", "平", "定", "執", "破", "危", "成", "收", "開", "閉"];
```

## 6. 六十甲子納音表

```typescript
const SIXTY_JIAZI_NAYIN: Record<string, string> = {
  "甲子": "海中金", "乙丑": "海中金",
  "丙寅": "爐中火", "丁卯": "爐中火",
  "戊辰": "大林木", "己巳": "大林木",
  "庚午": "路旁土", "辛未": "路旁土",
  "壬申": "劍鋒金", "癸酉": "劍鋒金",
  "甲戌": "山頭火", "乙亥": "山頭火",
  "丙子": "澗下水", "丁丑": "澗下水",
  "戊寅": "城頭土", "己卯": "城頭土",
  "庚辰": "白蠟金", "辛巳": "白蠟金",
  "壬午": "楊柳木", "癸未": "楊柳木",
  "甲申": "泉中水", "乙酉": "泉中水",
  "丙戌": "屋上土", "丁亥": "屋上土",
  "戊子": "霹靂火", "己丑": "霹靂火",
  "庚寅": "松柏木", "辛卯": "松柏木",
  "壬辰": "長流水", "癸巳": "長流水",
  "甲午": "砂石金", "乙未": "砂石金",
  "丙申": "山下火", "丁酉": "山下火",
  "戊戌": "平地木", "己亥": "平地木",
  "庚子": "壁上土", "辛丑": "壁上土",
  "壬寅": "金箔金", "癸卯": "金箔金",
  "甲辰": "覆燈火", "乙巳": "佛燈火",
  "丙午": "天河水", "丁未": "天河水",
  "戊申": "大驛土", "己酉": "大驛土",
  "庚戌": "釵釧金", "辛亥": "釵釧金",
  "壬子": "桑柘木", "癸丑": "桑柘木",
  "甲寅": "大溪水", "乙卯": "大溪水",
  "丙辰": "砂中土", "丁巳": "砂中土",
  "戊午": "天上火", "己未": "天上火",
  "庚申": "石榴木", "辛酉": "石榴木",
  "壬戌": "大海水", "癸亥": "大海水"
};
```

## 7. 二十四節氣

```typescript
const SOLAR_TERMS = [
  "小寒", "大寒",     // 1月
  "立春", "雨水",     // 2月
  "驚蟄", "春分",     // 3月
  "清明", "穀雨",     // 4月
  "立夏", "小滿",     // 5月
  "芒種", "夏至",     // 6月
  "小暑", "大暑",     // 7月
  "立秋", "處暑",     // 8月
  "白露", "秋分",     // 9月
  "寒露", "霜降",     // 10月
  "立冬", "小雪",     // 11月
  "大雪", "冬至"      // 12月
];
```
