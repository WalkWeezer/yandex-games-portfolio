#!/usr/bin/env python3
"""Convert portfolio markdown docs to self-contained PDFs with embedded images."""

from __future__ import annotations

import base64
import mimetypes
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "pdf"
DOCS = [
    ROOT / "docs" / "00-market-analysis-and-portfolio.md",
    *sorted((ROOT / "docs" / "concepts").glob("*.md")),
    ROOT / "docs" / "agents" / "10-agent-prompts.md",
    ROOT / "docs" / "agents" / "control-methodology.md",
]

CSS = """
@page { size: A4; margin: 18mm 16mm; }
html { font-size: 11pt; }
body {
  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  color: #1a1a1a;
  line-height: 1.45;
}
h1 { font-size: 1.7rem; border-bottom: 2px solid #222; padding-bottom: 0.3em; page-break-after: avoid; }
h2 { font-size: 1.25rem; margin-top: 1.4em; page-break-after: avoid; }
h3 { font-size: 1.05rem; page-break-after: avoid; }
img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1em auto;
  border-radius: 6px;
  page-break-inside: avoid;
}
table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 0.9rem; page-break-inside: avoid; }
th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }
th { background: #f3f3f3; }
code, pre {
  font-family: Consolas, "Courier New", monospace;
  font-size: 0.84rem;
  background: #f6f8fa;
}
pre {
  padding: 10px 12px;
  white-space: pre-wrap;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
}
code { padding: 1px 4px; border-radius: 3px; }
hr { border: none; border-top: 1px solid #ddd; margin: 1.5em 0; }
a { color: #0b57d0; text-decoration: none; }
"""


def ensure_markdown() -> None:
    try:
        import markdown  # noqa: F401
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "markdown", "-q"])


def resolve_image(src: str, base_dir: Path) -> Path | None:
    src = src.strip().split()[0]
    candidates = [
        (base_dir / src).resolve(),
        (ROOT / src.lstrip("./")).resolve(),
        (ROOT / "assets" / "concepts" / Path(src).name).resolve(),
    ]
    for path in candidates:
        if path.exists():
            return path
    return None


def embed_images_in_markdown(md_text: str, base_dir: Path) -> str:
    pattern = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")

    def repl(match: re.Match[str]) -> str:
        alt, src = match.group(1), match.group(2)
        path = resolve_image(src, base_dir)
        if path is None:
            return f"\n\n*[image missing: {src}]*\n\n"
        mime = mimetypes.guess_type(path.name)[0] or "image/png"
        b64 = base64.b64encode(path.read_bytes()).decode("ascii")
        return f'![{alt}](data:{mime};base64,{b64})'

    return pattern.sub(repl, md_text)


def md_to_html(md_text: str) -> str:
    ensure_markdown()
    import markdown

    return markdown.markdown(
        md_text,
        extensions=["tables", "fenced_code", "sane_lists"],
    )


def wrap_html(title: str, body: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8"/>
<title>{title}</title>
<style>{CSS}</style>
</head>
<body>
{body}
</body>
</html>
"""


def html_to_pdf_playwright(html_path: Path, pdf_path: Path) -> bool:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return False

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(html_path.resolve().as_uri(), wait_until="load")
        page.pdf(
            path=str(pdf_path),
            format="A4",
            print_background=True,
            margin={"top": "16mm", "bottom": "16mm", "left": "14mm", "right": "14mm"},
        )
        browser.close()
    return pdf_path.exists()


def html_to_pdf_edge(html_path: Path, pdf_path: Path) -> bool:
    edge_candidates = [
        Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
        Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
    ]
    edge = next((p for p in edge_candidates if p.exists()), None)
    if not edge:
        return False
    cmd = [
        str(edge),
        "--headless=new",
        "--disable-gpu",
        f"--print-to-pdf={pdf_path}",
        html_path.resolve().as_uri(),
    ]
    subprocess.run(cmd, check=False, capture_output=True)
    return pdf_path.exists() and pdf_path.stat().st_size > 1000


def convert_one(md_path: Path) -> Path:
    raw = md_path.read_text(encoding="utf-8")
    with_imgs = embed_images_in_markdown(raw, md_path.parent)
    body = md_to_html(with_imgs)
    title = md_path.stem
    html = wrap_html(title, body)

    PDF_DIR.mkdir(parents=True, exist_ok=True)
    tmp_html = PDF_DIR / f"_{title}.html"
    pdf_path = PDF_DIR / f"{title}.pdf"
    tmp_html.write_text(html, encoding="utf-8")

    if html_to_pdf_edge(tmp_html, pdf_path):
        print(f"OK (edge) {pdf_path.name} ({pdf_path.stat().st_size // 1024} KB)")
        return pdf_path

    if html_to_pdf_playwright(tmp_html, pdf_path):
        print(f"OK (playwright) {pdf_path.name} ({pdf_path.stat().st_size // 1024} KB)")
        return pdf_path

    print("Installing playwright + chromium...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "playwright", "-q"])
    subprocess.check_call([sys.executable, "-m", "playwright", "install", "chromium"])
    if html_to_pdf_playwright(tmp_html, pdf_path):
        print(f"OK (playwright) {pdf_path.name} ({pdf_path.stat().st_size // 1024} KB)")
        return pdf_path

    raise RuntimeError(f"Failed to create PDF for {md_path}")


def main() -> None:
    for doc in DOCS:
        if not doc.exists():
            print(f"SKIP missing {doc}")
            continue
        convert_one(doc)
    print("Done.")


if __name__ == "__main__":
    main()
