/**
 * 測試檔案 - 驗證核心功能
 */

import {
  getDayGanZhi,
  getYearGanZhi,
  solarToLunar,
  lunarToSolar,
  getSolarTermOfDate,
  isAfterLiChun,
  getHourlyFortune,
  getJianChu,
  getMonthZhiIndex,
  getDayZhiIndex
} from './core/index.js';
import { getDayInfo, formatDayInfo } from './index.js';

interface TestCase {
  name: string;
  test: () => boolean;
}

const tests: TestCase[] = [];

// 日干支測試
tests.push({
  name: '日干支測試: 2026-02-03 應為甲子',
  test: () => getDayGanZhi(2026, 2, 3) === '甲子'
});

tests.push({
  name: '日干支測試: 2024-01-01 應為庚辰',
  test: () => getDayGanZhi(2024, 1, 1) === '庚辰'
});

tests.push({
  name: '日干支測試: 2000-01-01 應為甲戌',
  test: () => getDayGanZhi(2000, 1, 1) === '甲戌'
});

// 年干支測試
tests.push({
  name: '年干支測試: 2024年（立春後）應為甲辰',
  test: () => getYearGanZhi(2024, true) === '甲辰'
});

tests.push({
  name: '年干支測試: 2026年（立春後）應為丙午',
  test: () => getYearGanZhi(2026, true) === '丙午'
});

tests.push({
  name: '年干支測試: 2026年（立春前）應為乙巳',
  test: () => getYearGanZhi(2026, false) === '乙巳'
});

// 農曆測試
tests.push({
  name: '農曆測試: 2026-02-17 應為農曆正月初一',
  test: () => {
    const lunar = solarToLunar(2026, 2, 17);
    return lunar.month === 1 && lunar.day === 1;
  }
});

tests.push({
  name: '農曆測試: 2026-02-03 應為農曆十二月十六',
  test: () => {
    const lunar = solarToLunar(2026, 2, 3);
    return lunar.year === 2025 && lunar.month === 12 && lunar.day === 16;
  }
});

tests.push({
  name: '農曆轉公曆測試: 農曆2026-01-01 應為公曆2026-02-17',
  test: () => {
    const solar = lunarToSolar(2026, 1, 1, false);
    return solar.year === 2026 && solar.month === 2 && solar.day === 17;
  }
});

// 節氣測試
tests.push({
  name: '節氣測試: 2026-02-04 應為立春',
  test: () => getSolarTermOfDate(2026, 2, 4) === '立春'
});

tests.push({
  name: '節氣測試: 2026-03-20 應為春分',
  test: () => getSolarTermOfDate(2026, 3, 20) === '春分'
});

// 立春判斷測試
tests.push({
  name: '立春判斷: 2026-02-03 應為立春前',
  test: () => isAfterLiChun(2026, 2, 3) === false
});

tests.push({
  name: '立春判斷: 2026-02-05 應為立春後',
  test: () => isAfterLiChun(2026, 2, 5) === true
});

// 建除測試
tests.push({
  name: '建除測試: 驗證計算不報錯',
  test: () => {
    const monthZhi = getMonthZhiIndex(1);  // 正月
    const dayZhi = getDayZhiIndex(2026, 2, 3);
    const jianChu = getJianChu(monthZhi, dayZhi);
    return typeof jianChu === 'string' && jianChu.length > 0;
  }
});

// 時辰吉凶測試
tests.push({
  name: '時辰吉凶測試: 應返回12個時辰',
  test: () => {
    const fortune = getHourlyFortune(2026, 2, 3);
    return fortune.length === 12;
  }
});

tests.push({
  name: '時辰吉凶測試: 每個時辰應有吉凶評級',
  test: () => {
    const fortune = getHourlyFortune(2026, 2, 3);
    return fortune.every(h => ['吉', '凶', '平'].includes(h.fortune));
  }
});

// 完整日期信息測試
tests.push({
  name: '完整日期信息測試: getDayInfo 應返回完整結構',
  test: () => {
    const info = getDayInfo(2026, 2, 3);
    return (
      info.gregorianDate === '2026-02-03' &&
      info.yearGanZhi === '乙巳' &&
      info.dayGanZhi === '甲子' &&
      info.lunarMonthName === '十二月' &&
      info.lunarDayName === '十六' &&
      info.hourlyFortune.length === 12
    );
  }
});

// 執行測試
function runTests() {
  console.log('═══════════════════════════════════════════');
  console.log('🧪 中國傳統曆法系統 - 單元測試');
  console.log('═══════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      const result = t.test();
      if (result) {
        console.log(`✅ ${t.name}`);
        passed++;
      } else {
        console.log(`❌ ${t.name}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${t.name} - 錯誤: ${error}`);
      failed++;
    }
  }

  console.log('\n═══════════════════════════════════════════');
  console.log(`📊 測試結果: ${passed} 通過, ${failed} 失敗`);
  console.log('═══════════════════════════════════════════');

  // 額外顯示幾個重要日期的詳細信息
  console.log('\n\n📅 重要日期驗證:\n');

  // 2026年2月3日
  console.log('--- 2026年2月3日 (測試日) ---');
  const day1 = getDayInfo(2026, 2, 3);
  console.log(`公曆: ${day1.gregorianDate}`);
  console.log(`農曆: ${day1.lunarYear}年 ${day1.lunarMonthName} ${day1.lunarDayName}`);
  console.log(`干支: ${day1.yearGanZhi}年 ${day1.monthGanZhi}月 ${day1.dayGanZhi}日`);
  console.log(`建除: ${day1.jianChu}日`);
  console.log(`沖煞: 沖${day1.clash} 煞${day1.shaDirection}`);

  // 2026年2月4日 立春
  console.log('\n--- 2026年2月4日 (立春) ---');
  const day2 = getDayInfo(2026, 2, 4);
  console.log(`公曆: ${day2.gregorianDate}`);
  console.log(`農曆: ${day2.lunarYear}年 ${day2.lunarMonthName} ${day2.lunarDayName}`);
  console.log(`干支: ${day2.yearGanZhi}年 ${day2.monthGanZhi}月 ${day2.dayGanZhi}日`);
  console.log(`節氣: ${day2.solarTerm || '無'}`);

  // 2026年2月17日 春節
  console.log('\n--- 2026年2月17日 (春節) ---');
  const day3 = getDayInfo(2026, 2, 17);
  console.log(`公曆: ${day3.gregorianDate}`);
  console.log(`農曆: ${day3.lunarYear}年 ${day3.lunarMonthName} ${day3.lunarDayName}`);
  console.log(`干支: ${day3.yearGanZhi}年 ${day3.monthGanZhi}月 ${day3.dayGanZhi}日`);

  return failed === 0;
}

runTests();
