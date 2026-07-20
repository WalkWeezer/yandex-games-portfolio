# Работник месяца (`deadline-escape`)

Yandex Games HTML5 · portrait 720×1280 · RU.

## Запуск (G0 Phaser + заглушки)

```bash
cd games/deadline-escape
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/ для стора
```

Графика — **runtime placeholders** с ID из `docs/DESIGN.md` §8 (`tile_*`, `boss_*`, `pu_*`, `char_*`). Реальные спрайты подставляются теми же ключами.

## Feel / clean play (без Phaser)

- Демка: dashboard → FEEL `deadline-escape`
- Production feel: `play/` (`DEADLINE_PROD`)

## Документы

| Файл | Роль |
|------|------|
| `docs/DESIGN.md` | GDD |
| `docs/STATUS.md` | gate / G0 |
| `docs/PORT.md` | ALLOW/DENY |
| `src/sdk/yandex.ts` | LoadingAPI · GameplayAPI · RV · interstitial |
