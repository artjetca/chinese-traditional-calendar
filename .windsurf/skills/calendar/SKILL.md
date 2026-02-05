---
name: calendar
description: A brief description, shown to the model to help it understand when to use this skill
---

## Purpose

Use this skill when you need to:

- Add or update **calendar-related capabilities** (lunar day info, auspicious/inauspicious activities, activity-based filtering, month calendar view).
- Expose the calendar data via **voice assistants** (Alexa Skill), using the existing public API endpoints.

## Existing Public API Endpoints

- `GET /api/day?date=YYYY-MM-DD`
  - Returns a JSON payload for a specific day.
  - Used by the web UI to refresh day details.

- `GET /api/calendar?year=YYYY&month=M&activity=<activity>`
  - Returns month HTML for the calendar grid.
  - Used by the web UI when checking a given activity.

## Data/Feature Expectations

- The UI uses an activity selector with categorized options.
- The day payload includes at least:
  - `gregorianDate`, `weekday`
  - `lunarYear`, `lunarMonthName`, `lunarDayName`
  - `yearGanZhi`, `monthGanZhi`, `dayGanZhi`
  - `jianChu`, `clash`, `shaDirection`
  - `auspicious[]`, `inauspicious[]`
  - `hourlyFortune[]`

## Alexa Skill (ASK) Integration

When the request is to “generate Alexa skill files”, follow the workflow:

- `../../workflows/alexa-skill.md`

### Intent Design (recommended)

- `TodayInfoIntent`
  - User asks for today’s lunar date, JianChu, and top 2-3 auspicious/inauspicious activities.

- `CheckActivityIntent`
  - Slots:
    - `activity` (custom type)
    - `date` (AMAZON.DATE)
  - Behavior:
    - If a date is provided, call `/api/day?date=...`.
    - Else call `/api/day` for “today”.
    - Determine:
      - if activity appears in `auspicious` => favorable
      - if activity appears in `inauspicious` => unfavorable
      - else => neutral

### Implementation Notes

- Prefer **calling the existing deployed site** endpoints rather than duplicating calendar logic inside Lambda.
- For production Lambda, ensure the runtime supports `fetch` (Node 18+) or add a fetch polyfill.

