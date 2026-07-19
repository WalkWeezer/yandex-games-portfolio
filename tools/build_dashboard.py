#!/usr/bin/env python3
"""Build Russian multi-page portfolio dashboard with tabs and embedded docs/images."""

from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MGMT = ROOT / "management"
PROJ_DIR = MGMT / "projects"
ASSETS = MGMT / "assets"

GAMES = [
    {"id": "01", "slug": "neon-bullet", "name": "Neon Bullet", "genre": "Top-down экшен", "wave": 3, "prio": "P1", "segment": "Экшен / 14–35"},
    {"id": "02", "slug": "deadline-escape", "name": "Работник месяца", "genre": "Офисная escape-аркада", "wave": 1, "prio": "P0", "segment": "Вирусный юмор / 18–45"},
    {"id": "03", "slug": "tide-of-relics", "name": "Море Реликвий", "genre": "Naval FTL-like", "wave": 4, "prio": "P1", "segment": "Стратегия midcore / 20–40"},
    {"id": "04", "slug": "legends-of-the-pitch", "name": "Легенды Поля", "genre": "Футбол CCG + autochess", "wave": 4, "prio": "P1", "segment": "Спорт / коллекционеры"},
    {"id": "05", "slug": "merge-bazaar", "name": "Базар Слияний", "genre": "Merge-tycoon", "wave": 1, "prio": "P0", "segment": "Уютный казуал / 25–55"},
    {"id": "06", "slug": "crystal-archipelago", "name": "Кристаллы Архипелага", "genre": "Match-3", "wave": 2, "prio": "P0", "segment": "Головоломки / 25–60"},
    {"id": "07", "slug": "idle-forge", "name": "Кузница Вечности", "genre": "Idle / incremental", "wave": 2, "prio": "P0", "segment": "AFK / idle"},
    {"id": "08", "slug": "cozy-plot", "name": "Уютный Участок", "genre": "Cozy farm", "wave": 3, "prio": "P1", "segment": "Cozy / life-sim"},
    {"id": "09", "slug": "auto-towers", "name": "Автобашни", "genre": "TD + auto-battler", "wave": 3, "prio": "P1", "segment": "Лёгкий мидкор"},
    {"id": "10", "slug": "night-courier", "name": "Ночной Курьер", "genre": "Endless runner", "wave": 1, "prio": "P0", "segment": "Сессионный runner"},
]

WAVE_NAMES = {1: "Волна 1 — кэшфлоу", 2: "Волна 2 — гибрид", 3: "Волна 3 — LTV", 4: "Волна 4 — флагманы"}

REF_LABELS = [
    ("art/key-art.png", "Ключевой арт", "Настроение, палитра, композиция"),
    ("ui/wireframe-main.png", "Вайрфрейм UI", "Экраны, иерархия, CTA рекламы/покупок"),
    ("levels/layout-main.png", "Раскладка уровней", "Грамматика уровней / доски / маршрута"),
    ("sprites/sheet-main.png", "Спрайт-лист", "Пропорции, кадры, иконки"),
]

PROMPT_FILES = [
    ("ART_PROMPTS.md", "Арт"),
    ("SPRITE_ANIM_PROMPTS.md", "Спрайты и анимация"),
    ("UI_PROMPTS.md", "Интерфейс"),
    ("LEVEL_PROMPTS.md", "Уровни"),
    ("CODE_AGENT_PROMPT.md", "Код-агент"),
]


def ensure_markdown():
    try:
        import markdown  # noqa: F401
    except ImportError:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "markdown", "-q"])


def md_to_html(text: str) -> str:
    ensure_markdown()
    import markdown
    return markdown.markdown(
        text,
        extensions=["tables", "fenced_code", "sane_lists", "toc"],
        extension_configs={"toc": {"permalink": False}},
    )


def rewrite_img_src(html_body: str, slug: str, doc_dir: Path) -> str:
    """Rewrite relative image paths so they work from management/projects/*.html."""

    def repl(match: re.Match[str]) -> str:
        prefix, src, suffix = match.group(1), match.group(2), match.group(3)
        src_clean = src.strip().split()[0]
        if src_clean.startswith("data:") or src_clean.startswith("http"):
            return match.group(0)

        candidate = (doc_dir / src_clean).resolve()
        if not candidate.exists():
            candidate = (ROOT / src_clean.lstrip("./")).resolve()
        if not candidate.exists():
            name = Path(src_clean).name
            found = list((ROOT / "games" / slug / "refs").rglob(name))
            if found:
                candidate = found[0]

        if candidate.exists():
            try:
                rel = (Path("../..") / candidate.relative_to(ROOT)).as_posix()
                return f"{prefix}{rel}{suffix}"
            except ValueError:
                return match.group(0)
        return match.group(0)

    return re.sub(r'(<img\s[^>]*src=")([^"]+)(")', repl, html_body, flags=re.I)


def read_md(path: Path) -> str:
    if not path.exists():
        return f"*Файл не найден: `{path}`*"
    return path.read_text(encoding="utf-8")


def shell_page(title: str, body: str, active: str = "index") -> str:
    nav_games = "\n".join(
        f'<a class="nav-game" href="{g["slug"]}.html">{g["id"]}. {html.escape(g["name"])}</a>'
        for g in GAMES
    )
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>{html.escape(title)} — Портфель Яндекс Игры</title>
<link rel="stylesheet" href="../assets/dashboard.css"/>
</head>
<body>
<div class="layout">
  <aside class="sidebar">
    <a class="brand" href="../portfolio-dashboard.html">Портфель<br/><span>Яндекс Игры</span></a>
    <div class="side-section">Навигация</div>
    <a class="nav-link {'active' if active=='index' else ''}" href="../portfolio-dashboard.html">Все проекты</a>
    <a class="nav-link" href="../CHECKLIST.md">Чеклист (MD)</a>
    <div class="side-section">Игры</div>
    <div class="nav-games">{nav_games}</div>
    <div class="side-foot">Код запрещён до статуса<br/><strong>ПОДТВЕРЖДЁН</strong></div>
  </aside>
  <main class="main">
{body}
  </main>
</div>
<script src="../assets/dashboard.js"></script>
</body>
</html>
"""


def index_page() -> str:
    cards = []
    for g in GAMES:
        thumb = f"../games/{g['slug']}/refs/art/key-art.png"
        cards.append(f"""
        <a class="card" href="projects/{g['slug']}.html" data-slug="{g['slug']}">
          <div class="card-art" style="background-image:url('{thumb}')"></div>
          <div class="card-body">
            <div class="card-top">
              <span class="muted">{g['id']}</span>
              <span class="badge prio">{g['prio']}</span>
            </div>
            <h2>{html.escape(g['name'])}</h2>
            <p class="muted">{html.escape(g['genre'])}</p>
            <p class="seg">{html.escape(g['segment'])}</p>
            <div class="card-meta">
              <span>{WAVE_NAMES[g['wave']]}</span>
              <span class="status-pill" data-status-for="{g['slug']}">Черновик</span>
            </div>
            <div class="progress"><i data-progress-for="{g['slug']}"></i></div>
          </div>
        </a>""")

    body = f"""
    <header class="page-head">
      <div>
        <h1>Портфель из 10 игр</h1>
        <p class="lead">Сначала подтверждаем диздоки, потом разработка. Открой проект → вкладки с документами, картинками и промптами.</p>
      </div>
      <div class="head-actions">
        <button class="btn" onclick="exportReport()">Экспорт отчёта</button>
        <button class="btn ghost" onclick="exportJSON()">JSON</button>
        <button class="btn ghost" onclick="resetAll()">Сброс</button>
      </div>
    </header>

    <section class="stats" id="stats"></section>

    <section class="filters">
      <button class="chip active" data-wave="all">Все</button>
      <button class="chip" data-wave="1">Волна 1</button>
      <button class="chip" data-wave="2">Волна 2</button>
      <button class="chip" data-wave="3">Волна 3</button>
      <button class="chip" data-wave="4">Волна 4</button>
    </section>

    <section class="grid" id="grid">
      {''.join(cards)}
    </section>

    <section class="help">
      <h3>Как работать</h3>
      <ol>
        <li>Открой карточку игры</li>
        <li>Просмотри вкладки: обзор, классический диздок, LLM-спека, референсы, промпты</li>
        <li>На вкладке «Управление» поставь статус <strong>На ревью</strong> → после проверки <strong>Подтверждён</strong></li>
        <li>Только после «Подтверждён» можно запускать код-агента (гейты G0–G5)</li>
      </ol>
    </section>
    """
    # index lives in management/, so shell paths differ
    nav_games = "\n".join(
        f'<a class="nav-game" href="projects/{g["slug"]}.html">{g["id"]}. {html.escape(g["name"])}</a>'
        for g in GAMES
    )
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Портфель Яндекс Игры — Дашборд</title>
<link rel="stylesheet" href="assets/dashboard.css"/>
</head>
<body>
<div class="layout">
  <aside class="sidebar">
    <a class="brand" href="portfolio-dashboard.html">Портфель<br/><span>Яндекс Игры</span></a>
    <div class="side-section">Навигация</div>
    <a class="nav-link active" href="portfolio-dashboard.html">Все проекты</a>
    <div class="side-section">Игры</div>
    <div class="nav-games">{nav_games}</div>
    <div class="side-foot">Данные статусов хранятся<br/>в браузере (localStorage)</div>
  </aside>
  <main class="main">
{body}
  </main>
</div>
<script>
window.PORTFOLIO_GAMES = {json.dumps([{k: g[k] for k in ('id','slug','name','wave','prio')} for g in GAMES], ensure_ascii=False)};
</script>
<script src="assets/dashboard.js"></script>
</body>
</html>
"""


def project_page(g: dict) -> str:
    slug = g["slug"]
    gdir = ROOT / "games" / slug
    docs = gdir / "docs"

    classic_html = rewrite_img_src(md_to_html(read_md(docs / "DESIGN.md")), slug, docs)
    llm_html = rewrite_img_src(md_to_html(read_md(docs / "DESIGN_LLM.md")), slug, docs)
    refs_md_html = rewrite_img_src(md_to_html(read_md(docs / "REFS.md")), slug, docs)

    gallery = []
    for rel, title, desc in REF_LABELS:
        src = f"../../games/{slug}/refs/{rel}"
        abs_path = ROOT / "games" / slug / "refs" / rel
        exists = abs_path.exists()
        if exists:
            gallery.append(f"""
            <figure class="ref-card">
              <a href="{src}" target="_blank" rel="noopener">
                <img src="{src}" alt="{html.escape(title)}" loading="lazy"/>
              </a>
              <figcaption>
                <strong>{html.escape(title)}</strong>
                <span>{html.escape(desc)}</span>
                <code>{html.escape(rel)}</code>
              </figcaption>
            </figure>""")
        else:
            gallery.append(f"""
            <figure class="ref-card missing">
              <div class="missing-box">Нет файла</div>
              <figcaption><strong>{html.escape(title)}</strong><code>{html.escape(rel)}</code></figcaption>
            </figure>""")

    prompt_panels = []
    for fname, label in PROMPT_FILES:
        p = gdir / "prompts" / fname
        content = rewrite_img_src(md_to_html(read_md(p)), slug, gdir / "prompts")
        pid = fname.replace(".md", "").lower()
        prompt_panels.append(f"""
          <details class="prompt-acc" {'open' if fname.startswith('ART') else ''}>
            <summary>{html.escape(label)} <span class="muted">{html.escape(fname)}</span></summary>
            <article class="doc">{content}</article>
          </details>""")

    body = f"""
    <header class="page-head project-head">
      <div class="crumb"><a href="../portfolio-dashboard.html">← Все проекты</a></div>
      <div class="project-hero">
        <div class="hero-art" style="background-image:url('../../games/{slug}/refs/art/key-art.png')"></div>
        <div>
          <div class="muted">{g['id']} · {g['prio']} · {WAVE_NAMES[g['wave']]}</div>
          <h1>{html.escape(g['name'])}</h1>
          <p class="lead">{html.escape(g['genre'])} · {html.escape(g['segment'])}</p>
          <div class="inline-status">
            Статус дизайна: <span class="status-pill" data-status-for="{slug}">Черновик</span>
            · Гейт: <span data-gate-label-for="{slug}">—</span>
          </div>
        </div>
      </div>
    </header>

    <nav class="tabs" role="tablist">
      <button class="tab active" data-tab="overview">Обзор</button>
      <button class="tab" data-tab="demo">Демка</button>
      <button class="tab" data-tab="classic">Классический диздок</button>
      <button class="tab" data-tab="llm">LLM-спека</button>
      <button class="tab" data-tab="refs">Референсы</button>
      <button class="tab" data-tab="prompts">Промпты</button>
      <button class="tab" data-tab="manage">Управление</button>
    </nav>

    <section class="tab-panel active" id="tab-overview">
      <div class="two-col">
        <div class="panel">
          <h3>Что смотреть</h3>
          <ul class="checklist-static">
            <li><strong>Демка</strong> — сначала пощупай feel простыми фигурами</li>
            <li>Классический GDD — видение, лупы, экономика</li>
            <li>LLM-спека — контракты для агентов, UI, уровни, ассеты</li>
            <li>Референсы — арт, вайрфреймы, уровни, спрайты</li>
            <li>Промпты — готовые задания для арт/код агентов</li>
          </ul>
          <h3>Правило</h3>
          <p class="warn">Пока статус не <strong>Подтверждён</strong>, папку <code>src/</code> не создавать. CONFIRM только после playtest демки (F1→F2). См. <code>docs/METHODOLOGY.md</code>.</p>
        </div>
        <div class="panel">
          <h3>Файлы проекта</h3>
          <ul class="file-list">
            <li><code>games/{slug}/docs/DESIGN.md</code></li>
            <li><code>games/{slug}/docs/DESIGN_LLM.md</code></li>
            <li><code>games/{slug}/docs/REFS.md</code></li>
            <li><code>games/{slug}/prompts/*.md</code></li>
            <li><code>games/{slug}/refs/**</code></li>
            <li><code>management/demos/</code> — feel demo</li>
          </ul>
          <div class="progress big"><i data-progress-for="{slug}"></i></div>
          <div class="muted" style="margin-top:8px">Прогресс готовности (дизайн + гейты)</div>
        </div>
      </div>
    </section>

    <section class="tab-panel" id="tab-demo">
      <div class="panel demo-wrap">
        <h3>Feel-демка (простые фигуры)</h3>
        <p class="lead">Цель — проверить управление и «хочу ещё раз». На телефоне удобнее через LAN-сервер.</p>
        <div class="lan-box">С телефона: запусти <code>serve-dashboard.bat</code> на ПК, открой URL из окна батника (одна Wi-Fi сеть).</div>
        <p class="muted" style="margin:0 0 8px">«Работник месяца» = ядро chas-pik (сетка, 3 колонны, 09:00→18:00).</p>
        <p class="demo-hint" id="demo-hint">Загрузка демки…</p>
        <canvas id="feel-demo" width="360" height="640" aria-label="Feel demo"></canvas>
        <div class="demo-actions">
          <button class="btn" type="button" id="demo-restart">Рестарт</button>
          <span class="muted">Стик: левая половина экрана · WASD/стрелки · кнопки справа</span>
        </div>
      </div>
    </section>

    <section class="tab-panel" id="tab-classic">
      <article class="doc">{classic_html}</article>
    </section>

    <section class="tab-panel" id="tab-llm">
      <article class="doc">{llm_html}</article>
    </section>

    <section class="tab-panel" id="tab-refs">
      <div class="refs-intro doc">{refs_md_html}</div>
      <h3 class="gallery-title">Галерея референсов</h3>
      <div class="ref-grid">{''.join(gallery)}</div>
    </section>

    <section class="tab-panel" id="tab-prompts">
      <p class="lead">Атомарные промпты — копируй в отдельного агента вместе с нужным референсом из вкладки «Референсы».</p>
      {''.join(prompt_panels)}
    </section>

    <section class="tab-panel" id="tab-manage">
      <div class="panel manage-panel" data-manage-slug="{slug}">
        <h3>Статус дизайна</h3>
        <div class="seg-btns" data-role="design-status">
          <button data-v="DRAFT">Черновик</button>
          <button data-v="REVIEW">На ревью</button>
          <button data-v="CONFIRMED">Подтверждён</button>
          <button data-v="BLOCKED">Заблокирован</button>
        </div>

        <h3>Готовность документов</h3>
        <label class="check"><input type="checkbox" data-k="classic"/> Классический GDD прочитан</label>
        <label class="check"><input type="checkbox" data-k="llm"/> LLM-спека прочитана</label>
        <label class="check"><input type="checkbox" data-k="refs"/> Референсы проверены</label>

        <h3>Гейт разработки</h3>
        <p class="muted">Доступен только после статуса «Подтверждён».</p>
        <select data-role="gate">
          <option value="—">— не начато</option>
          <option value="G0">G0 — Каркас</option>
          <option value="G1">G1 — Вертикальный слайс</option>
          <option value="G2">G2 — Контент MVP</option>
          <option value="G3">G3 — Мета и удержание</option>
          <option value="G4">G4 — SDK монетизация</option>
          <option value="G5">G5 — Готово к стору</option>
        </select>

        <h3>Заметки</h3>
        <textarea data-role="note" rows="5" placeholder="Комментарии к ревью..."></textarea>
      </div>
    </section>
    """

    nav_games = "\n".join(
        f'<a class="nav-game {"active" if x["slug"]==slug else ""}" href="{x["slug"]}.html">{x["id"]}. {html.escape(x["name"])}</a>'
        for x in GAMES
    )
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>{html.escape(g['name'])} — Портфель Яндекс Игры</title>
<link rel="stylesheet" href="../assets/dashboard.css"/>
</head>
<body>
<div class="layout">
  <aside class="sidebar">
    <a class="brand" href="../portfolio-dashboard.html">Портфель<br/><span>Яндекс Игры</span></a>
    <div class="side-section">Навигация</div>
    <a class="nav-link" href="../portfolio-dashboard.html">Все проекты</a>
    <div class="side-section">Игры</div>
    <div class="nav-games">{nav_games}</div>
    <div class="side-foot">Код запрещён до статуса<br/><strong>Подтверждён</strong></div>
  </aside>
  <main class="main">
{body}
  </main>
</div>
<script>
window.PORTFOLIO_GAMES = {json.dumps([{k: x[k] for k in ('id','slug','name','wave','prio')} for x in GAMES], ensure_ascii=False)};
window.CURRENT_SLUG = "{slug}";
</script>
<script src="../demos/demo-engine.js"></script>
<script src="../demos/demos-01-02.js"></script>
<script src="../demos/demos-03-06.js"></script>
<script src="../demos/demos-07-10.js"></script>
<script src="../assets/dashboard.js"></script>
</body>
</html>
"""


CSS = r"""
:root {
  --bg: #0e1218;
  --bg2: #141b24;
  --panel: #1a2330;
  --panel2: #222c3a;
  --line: #2c3a4d;
  --text: #e9eef5;
  --muted: #93a4b8;
  --accent: #5db0ff;
  --ok: #3dd68c;
  --warn: #f0b429;
  --bad: #f07178;
  --shadow: 0 10px 30px rgba(0,0,0,.35);
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
  background: radial-gradient(1200px 600px at 10% -10%, #1a2a40 0%, transparent 50%), var(--bg);
  color: var(--text);
  min-height: 100vh;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
.layout { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }
.sidebar {
  background: rgba(10,14,20,.92);
  border-right: 1px solid var(--line);
  padding: 18px 14px;
  position: sticky; top: 0; height: 100vh; overflow: auto;
}
.brand {
  display: block; color: var(--text); text-decoration: none; font-weight: 700;
  font-size: 1.05rem; line-height: 1.25; margin-bottom: 18px; padding: 8px 10px;
}
.brand span { color: var(--muted); font-weight: 500; font-size: .85rem; }
.side-section {
  color: var(--muted); font-size: .72rem; text-transform: uppercase;
  letter-spacing: .06em; margin: 14px 10px 6px;
}
.nav-link, .nav-game {
  display: block; padding: 8px 10px; border-radius: 8px; color: var(--text);
  text-decoration: none; font-size: .9rem; margin-bottom: 2px;
}
.nav-link:hover, .nav-game:hover { background: var(--panel); text-decoration: none; }
.nav-link.active, .nav-game.active { background: #1e3a5f; color: #d7ecff; }
.nav-games { max-height: 55vh; overflow: auto; }
.side-foot { margin-top: 18px; padding: 10px; color: var(--muted); font-size: .78rem; line-height: 1.4; }
.main { padding: 22px 28px 48px; max-width: 1200px; }
.page-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 18px; }
.page-head h1 { margin: 0 0 8px; font-size: 1.7rem; }
.lead { color: var(--muted); margin: 0; line-height: 1.45; max-width: 70ch; }
.head-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.btn {
  background: #1e4d7b; border: 1px solid #3a7ebf; color: white;
  border-radius: 10px; padding: 8px 12px; cursor: pointer; font: inherit;
}
.btn.ghost { background: var(--panel); border-color: var(--line); color: var(--text); }
.btn:hover { filter: brightness(1.08); }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 16px; }
.stat { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; }
.stat .n { font-size: 1.5rem; font-weight: 700; }
.stat .l { color: var(--muted); font-size: .8rem; }
.filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.chip {
  background: var(--panel); border: 1px solid var(--line); color: var(--text);
  border-radius: 999px; padding: 6px 12px; cursor: pointer; font: inherit;
}
.chip.active { background: #1e3a5f; border-color: #3a7ebf; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
.card {
  display: flex; flex-direction: column; background: var(--panel);
  border: 1px solid var(--line); border-radius: 14px; overflow: hidden;
  color: inherit; text-decoration: none; box-shadow: var(--shadow);
  transition: transform .15s ease, border-color .15s ease;
}
.card:hover { transform: translateY(-2px); border-color: #3a7ebf; text-decoration: none; }
.card-art { height: 140px; background: #0b0f14 center/cover no-repeat; }
.card-body { padding: 12px 14px 14px; }
.card-top { display: flex; justify-content: space-between; align-items: center; }
.card h2 { margin: 6px 0 4px; font-size: 1.1rem; }
.muted { color: var(--muted); }
.seg { font-size: .85rem; margin: 6px 0 10px; }
.card-meta { display: flex; justify-content: space-between; gap: 8px; align-items: center; font-size: .78rem; color: var(--muted); }
.badge.prio { background: #2a3340; border-radius: 999px; padding: 2px 8px; font-size: .72rem; }
.status-pill {
  display: inline-block; border-radius: 999px; padding: 3px 8px; font-size: .75rem; font-weight: 650;
  background: #2a3340; color: #b7c4d4;
}
.status-pill.DRAFT { background: #2a3340; color: #b7c4d4; }
.status-pill.REVIEW { background: #3d3415; color: #f5c542; }
.status-pill.CONFIRMED { background: #163528; color: #3dd68c; }
.status-pill.BLOCKED { background: #3a1a1f; color: #f07178; }
.progress { height: 8px; background: #2a3340; border-radius: 99px; overflow: hidden; margin-top: 10px; }
.progress > i { display: block; height: 100%; width: 0; background: linear-gradient(90deg, #3a7ebf, var(--ok)); }
.progress.big { height: 12px; }
.help { margin-top: 28px; background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 16px 18px; }
.help ol { margin: 8px 0 0; color: var(--muted); }
.crumb { margin-bottom: 10px; }
.project-hero { display: grid; grid-template-columns: 180px 1fr; gap: 16px; align-items: center; }
.hero-art {
  width: 180px; height: 110px; border-radius: 12px; border: 1px solid var(--line);
  background: #0b0f14 center/cover no-repeat;
}
.tabs {
  display: flex; gap: 6px; flex-wrap: wrap; margin: 18px 0 14px;
  border-bottom: 1px solid var(--line); padding-bottom: 10px;
}
.tab {
  background: transparent; border: 1px solid transparent; color: var(--muted);
  border-radius: 999px; padding: 8px 12px; cursor: pointer; font: inherit;
}
.tab:hover { color: var(--text); background: var(--panel); }
.tab.active { color: var(--text); background: #1e3a5f; border-color: #3a7ebf; }
.tab-panel { display: none; }
.tab-panel.active { display: block; animation: fade .15s ease; }
@keyframes fade { from { opacity: .4; } to { opacity: 1; } }
.panel {
  background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 16px;
}
.two-col { display: grid; grid-template-columns: 1.2fr .8fr; gap: 14px; }
@media (max-width: 960px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { position: relative; height: auto; }
  .two-col, .project-hero { grid-template-columns: 1fr; }
}
.doc {
  background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
  padding: 18px 22px; line-height: 1.55; overflow-x: auto;
}
.doc h1 { font-size: 1.45rem; border-bottom: 1px solid var(--line); padding-bottom: .35em; }
.doc h2 { font-size: 1.2rem; margin-top: 1.4em; }
.doc h3 { font-size: 1.05rem; }
.doc table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: .92rem; }
.doc th, .doc td { border: 1px solid var(--line); padding: 6px 8px; vertical-align: top; }
.doc th { background: var(--panel2); }
.doc code, .doc pre { font-family: Consolas, ui-monospace, monospace; font-size: .86rem; background: #10161f; }
.doc code { padding: 1px 5px; border-radius: 4px; }
.doc pre { padding: 12px; border-radius: 8px; overflow: auto; border: 1px solid var(--line); }
.doc pre code { padding: 0; background: transparent; }
.doc img {
  max-width: min(100%, 920px); height: auto; display: block; margin: 14px auto;
  border-radius: 10px; border: 1px solid var(--line); background: #0b0f14;
}
.doc blockquote { border-left: 3px solid var(--accent); margin-left: 0; padding-left: 12px; color: var(--muted); }
.ref-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; margin-top: 12px;
}
.ref-card {
  margin: 0; background: var(--panel); border: 1px solid var(--line); border-radius: 12px; overflow: hidden;
}
.ref-card img { width: 100%; height: 200px; object-fit: cover; display: block; background: #0b0f14; }
.ref-card figcaption { padding: 10px 12px; display: grid; gap: 4px; }
.ref-card figcaption span, .ref-card figcaption code { color: var(--muted); font-size: .8rem; }
.missing-box {
  height: 200px; display: grid; place-items: center; color: var(--bad); background: #1a1214;
}
.gallery-title { margin-top: 22px; }
.prompt-acc {
  background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
  margin-bottom: 10px; padding: 0 12px 12px;
}
.prompt-acc summary {
  cursor: pointer; font-weight: 650; padding: 12px 4px; list-style: none;
}
.prompt-acc summary::-webkit-details-marker { display: none; }
.prompt-acc .doc { margin-top: 6px; }
.warn {
  background: #3d3415; border: 1px solid #6a5a20; color: #ffe29a;
  padding: 10px 12px; border-radius: 8px;
}
.file-list { color: var(--muted); font-size: .88rem; }
.file-list code { color: #cfe6ff; }
.manage-panel .seg-btns { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.manage-panel .seg-btns button {
  background: var(--panel2); border: 1px solid var(--line); color: var(--text);
  border-radius: 999px; padding: 8px 12px; cursor: pointer; font: inherit;
}
.manage-panel .seg-btns button.active { background: #1e3a5f; border-color: #3a7ebf; }
.manage-panel .check { display: flex; gap: 8px; align-items: center; margin: 6px 0; color: var(--muted); }
.manage-panel select, .manage-panel textarea {
  width: 100%; max-width: 520px; background: #10161f; color: var(--text);
  border: 1px solid var(--line); border-radius: 10px; padding: 10px; font: inherit; margin-bottom: 12px;
}
.checklist-static { color: var(--muted); line-height: 1.6; }
.demo-wrap { max-width: 420px; width: 100%; }
#feel-demo {
  width: min(360px, 100%);
  max-width: 100%;
  height: auto;
  aspect-ratio: 360 / 640;
  display: block;
  margin: 12px auto;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: #0b0f14;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}
.demo-hint { color: var(--accent); font-size: .92rem; }
.demo-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; justify-content: center; }
.lan-box {
  margin: 10px 0 14px; padding: 10px 12px; border-radius: 10px;
  background: #163528; border: 1px solid #2a6b4a; color: #b7f5d0; font-size: .88rem;
}
@media (max-width: 720px) {
  .main { padding: 12px 12px 40px; }
  .tabs { gap: 4px; }
  .tab { padding: 8px 10px; font-size: .85rem; }
  .project-hero { grid-template-columns: 1fr; }
  .hero-art { width: 100%; height: 140px; }
  .two-col { grid-template-columns: 1fr; }
  .sidebar { display: none; }
  .layout { grid-template-columns: 1fr; }
}
"""


JS = r"""
const KEY = "yg-portfolio-mgmt-v1";
const STATUS_RU = {
  DRAFT: "Черновик",
  REVIEW: "На ревью",
  CONFIRMED: "Подтверждён",
  BLOCKED: "Заблокирован",
};
const GAMES = window.PORTFOLIO_GAMES || [];

function defaultState() {
  const o = {};
  GAMES.forEach(g => {
    o[g.slug] = { classic: true, llm: true, refs: true, designStatus: "DRAFT", gate: "—", note: "" };
  });
  return o;
}
function load() {
  try {
    return { ...defaultState(), ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return defaultState();
  }
}
let state = load();
function save() { localStorage.setItem(KEY, JSON.stringify(state)); }

function progress(s) {
  const design = ((s.classic?1:0)+(s.llm?1:0)+(s.refs?1:0)) / 3;
  const gates = {"—":0,G0:1,G1:2,G2:3,G3:4,G4:5,G5:6};
  const g = (gates[s.gate] || 0) / 6;
  if (s.designStatus !== "CONFIRMED") {
    const conf = s.designStatus === "REVIEW" ? 0.5 : 0;
    return Math.round((design * 0.5 + conf * 0.1) * 100);
  }
  return Math.round((0.4 + g * 0.6) * 100);
}

function paintStatusPills() {
  document.querySelectorAll("[data-status-for]").forEach(el => {
    const slug = el.getAttribute("data-status-for");
    const st = state[slug]?.designStatus || "DRAFT";
    el.textContent = STATUS_RU[st] || st;
    el.className = "status-pill " + st;
  });
  document.querySelectorAll("[data-gate-label-for]").forEach(el => {
    const slug = el.getAttribute("data-gate-label-for");
    el.textContent = state[slug]?.gate || "—";
  });
  document.querySelectorAll("[data-progress-for]").forEach(el => {
    const slug = el.getAttribute("data-progress-for");
    el.style.width = progress(state[slug] || {classic:0,llm:0,refs:0,designStatus:"DRAFT",gate:"—"}) + "%";
  });
}

function renderStats() {
  const box = document.getElementById("stats");
  if (!box) return;
  const vals = GAMES.map(g => state[g.slug]);
  const c = (pred) => vals.filter(pred).length;
  box.innerHTML = `
    <div class="stat"><div class="n">${c(s => s.designStatus==="CONFIRMED")}/10</div><div class="l">Подтверждено</div></div>
    <div class="stat"><div class="n">${c(s => s.designStatus==="REVIEW")}</div><div class="l">На ревью</div></div>
    <div class="stat"><div class="n">${c(s => s.designStatus==="DRAFT")}</div><div class="l">Черновики</div></div>
    <div class="stat"><div class="n">${c(s => s.designStatus==="BLOCKED")}</div><div class="l">Заблокировано</div></div>
    <div class="stat"><div class="n">${c(s => s.designStatus==="CONFIRMED" && s.gate!=="—")}</div><div class="l">В разработке</div></div>
    <div class="stat"><div class="n">${c(s => s.gate==="G5")}</div><div class="l">Готово к стору</div></div>
  `;
}

function setupFilters() {
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const wave = chip.getAttribute("data-wave");
      document.querySelectorAll(".card").forEach(card => {
        const slug = card.getAttribute("data-slug");
        const g = GAMES.find(x => x.slug === slug);
        card.style.display = (wave === "all" || String(g.wave) === wave) ? "" : "none";
      });
    });
  });
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const id = tab.getAttribute("data-tab");
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      document.getElementById("tab-" + id)?.classList.add("active");
      history.replaceState(null, "", "#" + id);
    });
  });
  const hash = location.hash.replace("#", "");
  if (hash) {
    const t = document.querySelector(`.tab[data-tab="${hash}"]`);
    if (t) t.click();
  }
}

function setupManage() {
  const panel = document.querySelector("[data-manage-slug]");
  if (!panel) return;
  const slug = panel.getAttribute("data-manage-slug");
  const s = state[slug];

  panel.querySelectorAll('[data-role="design-status"] button').forEach(btn => {
    if (btn.getAttribute("data-v") === s.designStatus) btn.classList.add("active");
    btn.addEventListener("click", () => {
      panel.querySelectorAll('[data-role="design-status"] button').forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      s.designStatus = btn.getAttribute("data-v");
      if (s.designStatus !== "CONFIRMED") s.gate = "—";
      save(); paintStatusPills(); syncGateDisabled();
    });
  });

  panel.querySelectorAll("input[data-k]").forEach(inp => {
    inp.checked = !!s[inp.getAttribute("data-k")];
    inp.addEventListener("change", () => {
      s[inp.getAttribute("data-k")] = inp.checked;
      save(); paintStatusPills();
    });
  });

  const gate = panel.querySelector('[data-role="gate"]');
  gate.value = s.gate || "—";
  gate.addEventListener("change", () => {
    s.gate = gate.value;
    save(); paintStatusPills();
  });

  const note = panel.querySelector('[data-role="note"]');
  note.value = s.note || "";
  note.addEventListener("change", () => {
    s.note = note.value;
    save();
  });

  function syncGateDisabled() {
    gate.disabled = s.designStatus !== "CONFIRMED";
  }
  syncGateDisabled();
}

function setupDemo() {
  const canvas = document.getElementById("feel-demo");
  if (!canvas || !window.FeelDemo || !window.CURRENT_SLUG) return;
  const hud = document.getElementById("demo-hint");
  let handle = null;
  function start() {
    if (handle) handle.destroy();
    handle = window.FeelDemo.mount(window.CURRENT_SLUG, canvas, hud);
  }
  // Start when Demo tab opened first time
  const demoTab = document.querySelector('.tab[data-tab="demo"]');
  if (demoTab) {
    demoTab.addEventListener("click", () => {
      if (!handle) start();
    }, { once: false });
  }
  // If landed on #demo
  if (location.hash === "#demo") start();
  document.getElementById("demo-restart")?.addEventListener("click", () => {
    if (handle) handle.restart();
    else start();
  });
}

function resetAll() {
  if (!confirm("Сбросить все статусы в «Черновик»?")) return;
  state = defaultState();
  save();
  location.reload();
}
function exportJSON() {
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), games: state }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "portfolio-status.json";
  a.click();
}
function exportReport() {
  const rows = GAMES.map(g => {
    const s = state[g.slug];
    return `<tr><td>${g.id}</td><td>${g.name}</td><td>${STATUS_RU[s.designStatus]}</td><td>${s.gate}</td><td>${progress(s)}%</td><td>${(s.note||"").replace(/</g,"&lt;")}</td></tr>`;
  }).join("");
  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"/><title>Отчёт портфеля</title>
  <style>body{font-family:Segoe UI,sans-serif;padding:24px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f3f3f3}</style></head>
  <body><h1>Отчёт портфеля Яндекс Игры</h1><p>${new Date().toLocaleString()}</p>
  <table><thead><tr><th>#</th><th>Игра</th><th>Статус дизайна</th><th>Гейт</th><th>%</th><th>Заметки</th></tr></thead><tbody>${rows}</tbody></table>
  </body></html>`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  a.download = "portfolio-report.html";
  a.click();
}

window.resetAll = resetAll;
window.exportJSON = exportJSON;
window.exportReport = exportReport;

document.addEventListener("DOMContentLoaded", () => {
  paintStatusPills();
  renderStats();
  setupFilters();
  setupTabs();
  setupManage();
  setupDemo();
});
"""


def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    PROJ_DIR.mkdir(parents=True, exist_ok=True)

    (ASSETS / "dashboard.css").write_text(CSS, encoding="utf-8")
    (ASSETS / "dashboard.js").write_text(JS, encoding="utf-8")
    (MGMT / "portfolio-dashboard.html").write_text(index_page(), encoding="utf-8")

    for g in GAMES:
        path = PROJ_DIR / f"{g['slug']}.html"
        path.write_text(project_page(g), encoding="utf-8")
        print(f"OK {path.name}")

    print("Dashboard built:", MGMT / "portfolio-dashboard.html")


if __name__ == "__main__":
    main()
