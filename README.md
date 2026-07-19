# Yandex Games Portfolio

Пакет стратегии выхода на **Яндекс Игры** с 10 играми под разные сегменты ЦА. Главная цель — монетизация (гибрид: реклама + инапы).

## Онлайн (любое устройство)

Репозиторий **public** (нужно для бесплатного GitHub Pages без Pro).

После деплоя дашборд:

`https://walkweezer.github.io/yandex-games-portfolio/management/portfolio-dashboard.html`

Локально в Wi‑Fi: `serve-dashboard.bat`  
Пересборка HTML: `build-dashboard.bat`

## Быстрый старт

1. **Дашборд:** [`management/portfolio-dashboard.html`](management/portfolio-dashboard.html)
2. **Методология:** [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md)
3. Универсальный промпт демки: [`management/demos/PROMPT_FEEL_DEMO_UNIFIED.md`](management/demos/PROMPT_FEEL_DEMO_UNIFIED.md)
4. Чеклист: [`management/CHECKLIST.md`](management/CHECKLIST.md)
5. Рынок: [`docs/00-market-analysis-and-portfolio.md`](docs/00-market-analysis-and-portfolio.md)
6. Игры: [`games/`](games/)
7. PDF: `python tools/md_to_pdf.py` (в git не кладём, собираются локально)

## Правило

**Код (`src/`) не начинать**, пока в дашборде Design Status игры ≠ `CONFIRMED`.

## Портфель

| # | Игра | Жанр |
|---|------|------|
| 1 | Neon Bullet | Top-down экшен |
| 2 | Работник месяца | Office escape arcade |
| 3 | Море Реликвий | Naval FTL-like |
| 4 | Легенды Поля | Football CCG + autochess |
| 5 | Базар Слияний | Merge-tycoon |
| 6 | Кристаллы Архипелага | Match-3 |
| 7 | Кузница Вечности | Idle |
| 8 | Уютный Участок | Cozy farm |
| 9 | Автобашни | TD + auto-battler lite |
| 10 | Ночной Курьер | Endless runner |

## PDF

Сборка PDF:

```bash
python tools/md_to_pdf.py
```
