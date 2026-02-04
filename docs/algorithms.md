# 算法說明

## 1. 農曆計算算法

### 1.1 農曆資料結構

農曆計算需要預存的資料表（1900-2100年）：

```typescript
// 每年的農曆資料
interface LunarYearData {
  // 閏月（0表示無閏月，1-12表示閏哪月）
  leapMonth: number;

  // 閏月天數（0=無閏月, 29=小月, 30=大月）
  leapDays: number;

  // 12個月的大小月（bit表示，1=30天，0=29天）
  monthDays: number;  // 12位二進制

  // 春節的公曆日期（用於計算農曆）
  springFestival: [number, number];  // [月, 日]
}
```

### 1.2 公曆轉農曆算法

```typescript
function solarToLunar(year: number, month: number, day: number): LunarDate {
  // 1. 計算距離1900年1月31日（農曆1900年正月初一）的天數
  const offset = daysBetween(new Date(1900, 0, 31), new Date(year, month - 1, day));

  // 2. 從1900年開始逐年減去天數，直到找到對應的農曆年
  let lunarYear = 1900;
  let daysInYear = getLunarYearDays(lunarYear);
  while (offset >= daysInYear) {
    offset -= daysInYear;
    lunarYear++;
    daysInYear = getLunarYearDays(lunarYear);
  }

  // 3. 計算農曆月份和日期
  let lunarMonth = 1;
  let isLeap = false;
  const leapMonth = getLeapMonth(lunarYear);

  let daysInMonth = getLunarMonthDays(lunarYear, lunarMonth, false);
  while (offset >= daysInMonth) {
    offset -= daysInMonth;

    // 處理閏月
    if (lunarMonth === leapMonth && !isLeap) {
      isLeap = true;
      daysInMonth = getLunarMonthDays(lunarYear, lunarMonth, true);
    } else {
      isLeap = false;
      lunarMonth++;
      daysInMonth = getLunarMonthDays(lunarYear, lunarMonth, false);
    }
  }

  const lunarDay = offset + 1;

  return { lunarYear, lunarMonth, lunarDay, isLeapMonth: isLeap };
}
```

## 2. 天干地支計算

### 2.1 年干支

```typescript
function getYearGanZhi(year: number): string {
  // 以1984年甲子年為基準
  const offset = year - 1984;
  const ganIndex = ((offset % 10) + 10) % 10;
  const zhiIndex = ((offset % 12) + 12) % 12;

  return HEAVENLY_STEMS[ganIndex] + EARTHLY_BRANCHES[zhiIndex];
}
```

**注意**：年干支以立春為界，立春前仍屬上一年。

### 2.2 月干支

```typescript
function getMonthGanZhi(year: number, month: number, day: number): string {
  // 計算節氣，確定月份
  const solarTermMonth = getSolarTermMonth(year, month, day);

  // 月支固定：寅月(正月)、卯月(二月)...
  const zhiIndex = (solarTermMonth + 1) % 12;  // 正月=寅(2)

  // 月干由年干推算（五虎遁）
  const yearGan = getYearGan(year);
  const ganIndex = (yearGan * 2 + solarTermMonth) % 10;

  return HEAVENLY_STEMS[ganIndex] + EARTHLY_BRANCHES[zhiIndex];
}
```

**五虎遁口訣**：
- 甲己之年丙作首（甲年、己年正月為丙寅）
- 乙庚之歲戊為頭（乙年、庚年正月為戊寅）
- 丙辛之年尋庚上（丙年、辛年正月為庚寅）
- 丁壬壬寅順水流（丁年、壬年正月為壬寅）
- 若問戊癸何處起，甲寅之上好追求（戊年、癸年正月為甲寅）

### 2.3 日干支

```typescript
function getDayGanZhi(year: number, month: number, day: number): string {
  // 以2000年1月1日（甲戌日）為基準
  const baseDate = new Date(2000, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  const offset = Math.floor((targetDate - baseDate) / 86400000);

  // 2000年1月1日是甲戌日，甲=0，戌=10
  const baseGan = 0;   // 甲
  const baseZhi = 10;  // 戌

  const ganIndex = (baseGan + offset % 10 + 10) % 10;
  const zhiIndex = (baseZhi + offset % 12 + 12) % 12;

  return HEAVENLY_STEMS[ganIndex] + EARTHLY_BRANCHES[zhiIndex];
}
```

### 2.4 時干支

```typescript
function getHourGanZhi(dayGan: number, hour: number): string {
  // 根據小時確定時辰地支
  const zhiIndex = Math.floor((hour + 1) / 2) % 12;

  // 五鼠遁：根據日干推算時干
  // 甲己日起甲子時
  // 乙庚日起丙子時
  // 丙辛日起戊子時
  // 丁壬日起庚子時
  // 戊癸日起壬子時
  const baseGan = [0, 2, 4, 6, 8][dayGan % 5];  // 子時的天干
  const ganIndex = (baseGan + zhiIndex) % 10;

  return HEAVENLY_STEMS[ganIndex] + EARTHLY_BRANCHES[zhiIndex];
}
```

## 3. 節氣計算

### 3.1 節氣時刻計算

使用天文算法計算太陽黃經，當黃經為特定度數時即為節氣：

```typescript
const SOLAR_TERM_DEGREES = [
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

function getSolarTermDate(year: number, termIndex: number): Date {
  // 使用VSOP87理論計算太陽黃經
  // 二分法搜索達到目標黃經的精確時刻
  // ...
}
```

### 3.2 簡化方法

可使用近似公式或預計算的節氣表：

```typescript
// 使用壽星萬年曆的節氣數據表
const SOLAR_TERM_DATA: Record<number, number[]> = {
  2026: [
    // 24個節氣的儒略日（或Unix時間戳）
    // ...
  ]
};
```

## 4. 建除十二神計算

### 4.1 計算方法

```typescript
function getJianChu(month: number, dayZhi: number): string {
  // 建除以月建為基準
  // 正月建寅，二月建卯，以此類推
  const monthZhi = (month + 1) % 12;  // 正月=寅(2)

  // 計算日支與月建的關係
  const offset = (dayZhi - monthZhi + 12) % 12;

  // 建除順序：建、除、滿、平、定、執、破、危、成、收、開、閉
  return JIAN_CHU[offset];
}
```

### 4.2 建除與月建對照

| 月份 | 月建 | 建日 | 除日 | 滿日 | ... |
|------|------|------|------|------|-----|
| 正月 | 寅 | 寅日 | 卯日 | 辰日 | ... |
| 二月 | 卯 | 卯日 | 辰日 | 巳日 | ... |
| 三月 | 辰 | 辰日 | 巳日 | 午日 | ... |
| ... | ... | ... | ... | ... | ... |

## 5. 時辰吉凶計算

### 5.1 基本規則

時辰吉凶受多種因素影響：
1. 日干支與時干支的關係
2. 時辰本身的固有屬性
3. 當日神煞對時辰的影響

### 5.2 日上起時

根據日干確定子時天干，然後順推：

```typescript
const HOUR_GAN_BASE = {
  '甲': 0, '己': 0,  // 甲己日子時起甲子
  '乙': 2, '庚': 2,  // 乙庚日子時起丙子
  '丙': 4, '辛': 4,  // 丙辛日子時起戊子
  '丁': 6, '壬': 6,  // 丁壬日子時起庚子
  '戊': 8, '癸': 8   // 戊癸日子時起壬子
};
```

### 5.3 吉凶判斷（簡化版）

```typescript
function getHourFortune(dayGanZhi: string, hourIndex: number): "吉" | "凶" | "平" {
  const hourGanZhi = getHourGanZhi(dayGanZhi, hourIndex);

  // 檢查時辰是否遇到凶煞
  if (isHourClash(dayGanZhi, hourGanZhi)) return "凶";

  // 檢查時辰是否遇到吉神
  if (isHourAuspicious(dayGanZhi, hourGanZhi)) return "吉";

  return "平";
}
```

## 6. 九宮飛星計算

### 6.1 年飛星

```typescript
function getYearFlyingStar(year: number): number {
  // 上元：1864-1923（一坎、二坤、三震為三元）
  // 中元：1924-1983
  // 下元：1984-2043

  // 從1984年（下元甲子年，七赤入中）開始計算
  const offset = year - 1984;
  // 年飛星逆飛
  return ((7 - offset % 9) + 9) % 9 || 9;
}
```

### 6.2 月飛星

```typescript
function getMonthFlyingStar(year: number, month: number): number {
  // 月飛星規則較複雜，與年份和月份都相關
  // 子、午、卯、酉年：正月八白
  // 寅、申、巳、亥年：正月五黃
  // 辰、戌、丑、未年：正月二黑

  const yearZhi = (year - 4) % 12;
  let baseMonth: number;

  if ([0, 3, 6, 9].includes(yearZhi)) {
    baseMonth = 8;  // 八白
  } else if ([2, 5, 8, 11].includes(yearZhi)) {
    baseMonth = 5;  // 五黃
  } else {
    baseMonth = 2;  // 二黑
  }

  // 月飛星逆飛
  return ((baseMonth - (month - 1) % 9) + 9) % 9 || 9;
}
```

### 6.3 日飛星

```typescript
function getDayFlyingStar(year: number, month: number, day: number): number {
  // 日飛星規則需要查表或使用特定公式
  // 與節氣和甲子序數相關
  // ...
}
```

## 7. 沖煞計算

### 7.1 六沖

```typescript
const CLASH_PAIRS: Record<number, number> = {
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

function getDayClash(dayZhi: number): string {
  const clashZhi = CLASH_PAIRS[dayZhi];
  return ZODIAC_ANIMALS[clashZhi] + "年生人";
}
```

### 7.2 煞方

```typescript
function getDaySha(dayZhi: number): string {
  // 寅午戌日煞北
  // 申子辰日煞南
  // 亥卯未日煞西
  // 巳酉丑日煞東

  if ([2, 6, 10].includes(dayZhi)) return "北方";
  if ([8, 0, 4].includes(dayZhi)) return "南方";
  if ([11, 3, 7].includes(dayZhi)) return "西方";
  if ([5, 9, 1].includes(dayZhi)) return "東方";

  return "";
}
```

## 參考資料

1. 《協紀辨方書》- 清代擇日經典
2. 壽星萬年曆算法 - 許劍偉
3. 《中國古代曆法》- 張培瑜
4. VSOP87 天文算法
