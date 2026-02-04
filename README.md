# 中國傳統擇日萬年曆系統

基於 forecasting.hk 的功能分析，創建一個完整的時辰吉凶查詢系統。

## 項目概述

本系統提供中國傳統擇日功能，包括：
- 農曆/公曆轉換
- 每日吉凶宜忌
- 時辰吉凶（12時辰）
- 天干地支計算
- 節氣計算
- 建除十二神
- 吉神凶煞

## 資料結構

詳見 `docs/data-schema.md`

## 開發計劃

詳見 `docs/development-plan.md`

## 技術棧建議

- **前端**: React/Vue.js + TypeScript
- **後端**: Node.js/Python
- **資料庫**: SQLite/PostgreSQL（用於存儲預計算的曆法資料）

## 目錄結構

```
chinese-calendar-project/
├── README.md
├── docs/
│   ├── data-schema.md          # 資料結構定義
│   ├── development-plan.md     # 開發計劃
│   ├── terminology.md          # 擇吉名詞解釋
│   └── algorithms.md           # 算法說明
├── src/
│   ├── core/                   # 核心計算模組
│   │   ├── lunar.ts            # 農曆計算
│   │   ├── ganzhi.ts           # 天干地支
│   │   ├── solarterms.ts       # 節氣計算
│   │   └── fortune.ts          # 吉凶計算
│   ├── data/                   # 靜態資料
│   └── api/                    # API 接口
└── tests/
```

## 授權

本項目僅供學習參考
