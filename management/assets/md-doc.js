/**
 * Load Markdown docs into project tabs: TOC + formatted HTML + scroll-to-section.
 */
(function () {
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slugify(text, prefix) {
    const base = String(text)
      .toLowerCase()
      .replace(/<[^>]+>/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "section";
    return (prefix ? prefix + "-" : "") + base;
  }

  function inlineMd(text) {
    let s = escapeHtml(text);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[\s(])\*([^*]+)\*(?=[\s).,]|$)/g, "$1<em>$2</em>");
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return s;
  }

  function isTableSep(line) {
    return /^\s*\|?[\s:-]+\|[\s|:-]+\|?\s*$/.test(line);
  }

  function parseTable(lines, i) {
    const header = lines[i].trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
    i += 2;
    const rows = [];
    while (i < lines.length && lines[i].includes("|") && !lines[i].startsWith("#")) {
      const cells = lines[i].trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      rows.push(cells);
      i += 1;
    }
    let html = "<table><thead><tr>";
    header.forEach((h) => { html += `<th>${inlineMd(h)}</th>`; });
    html += "</tr></thead><tbody>";
    rows.forEach((row) => {
      html += "<tr>";
      header.forEach((_, idx) => { html += `<td>${inlineMd(row[idx] || "")}</td>`; });
      html += "</tr>";
    });
    html += "</tbody></table>";
    return { html, next: i };
  }

  function mdToHtml(md, idPrefix) {
    const lines = md.replace(/\r\n/g, "\n").split("\n");
    const toc = [];
    const used = Object.create(null);
    let html = "";
    let i = 0;
    let inCode = false;
    let codeBuf = [];
    let listType = null;

    function closeList() {
      if (listType) {
        html += listType === "ol" ? "</ol>" : "</ul>";
        listType = null;
      }
    }

    function addHeading(level, text) {
      closeList();
      let id = slugify(text, idPrefix);
      if (used[id]) {
        used[id] += 1;
        id = id + "-" + used[id];
      } else used[id] = 1;
      toc.push({ level, text: text.replace(/`/g, ""), id });
      html += `<h${level} id="${id}">${inlineMd(text)}</h${level}>`;
    }

    while (i < lines.length) {
      const line = lines[i];

      if (inCode) {
        if (line.trimStart().startsWith("```")) {
          html += `<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`;
          codeBuf = [];
          inCode = false;
        } else codeBuf.push(line);
        i += 1;
        continue;
      }

      if (line.trimStart().startsWith("```")) {
        closeList();
        inCode = true;
        codeBuf = [];
        i += 1;
        continue;
      }

      if (/^\s*\|/.test(line) && i + 1 < lines.length && isTableSep(lines[i + 1])) {
        closeList();
        const t = parseTable(lines, i);
        html += t.html;
        i = t.next;
        continue;
      }

      const hm = /^(#{1,4})\s+(.+)$/.exec(line);
      if (hm) {
        addHeading(hm[1].length, hm[2].trim());
        i += 1;
        continue;
      }

      if (/^\s*---+\s*$/.test(line)) {
        closeList();
        html += "<hr/>";
        i += 1;
        continue;
      }

      if (/^\s*>\s?/.test(line)) {
        closeList();
        const parts = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          parts.push(lines[i].replace(/^\s*>\s?/, ""));
          i += 1;
        }
        html += `<blockquote><p>${inlineMd(parts.join(" "))}</p></blockquote>`;
        continue;
      }

      const ul = /^\s*[-*]\s+(.+)$/.exec(line);
      const ol = /^\s*\d+\.\s+(.+)$/.exec(line);
      if (ul || ol) {
        const type = ul ? "ul" : "ol";
        if (listType !== type) {
          closeList();
          listType = type;
          html += type === "ol" ? "<ol>" : "<ul>";
        }
        html += `<li>${inlineMd((ul || ol)[1])}</li>`;
        i += 1;
        continue;
      }

      if (!line.trim()) {
        closeList();
        i += 1;
        continue;
      }

      closeList();
      const parts = [line];
      i += 1;
      while (i < lines.length && lines[i].trim() && !lines[i].startsWith("#") && !lines[i].trimStart().startsWith("```") && !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i]) && !/^\s*>/.test(lines[i]) && !(lines[i].includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1]))) {
        parts.push(lines[i]);
        i += 1;
      }
      html += `<p>${inlineMd(parts.join(" "))}</p>`;
    }
    closeList();
    return { html, toc };
  }

  function renderToc(toc) {
    if (!toc.length) return "<p class='muted'>Нет разделов</p>";
    return (
      '<nav class="md-toc-nav"><div class="md-toc-title">Разделы</div><ul>' +
      toc
        .filter((t) => t.level <= 3)
        .map(
          (t) =>
            `<li class="lv${t.level}"><a href="#${t.id}" data-md-jump="${t.id}">${escapeHtml(t.text)}</a></li>`
        )
        .join("") +
      "</ul></nav>"
    );
  }

  function bundleKey(src) {
    if (!src) return null;
    if (src.startsWith("docs/") || src.startsWith("prompts/")) return src;
    const m = src.match(/deadline-escape\/(docs|prompts)\/([^/?#]+\.md)$/i);
    return m ? m[1] + "/" + m[2] : null;
  }

  function loadMarkdown(src) {
    const key = bundleKey(src);
    const bundle = window.DEADLINE_DOCS_BUNDLE || {};
    if (key && bundle[key] != null) {
      return Promise.resolve({ md: bundle[key], via: "bundle:" + key });
    }
    const urls = [src];
    if (src.includes("games/")) {
      const m = src.match(/(games\/.+)$/);
      if (m) urls.push("/" + m[1]);
    }
    return (async () => {
      let lastErr = null;
      for (const url of [...new Set(urls)]) {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (res.ok) return { md: await res.text(), via: url };
          lastErr = new Error(url + " → " + res.status);
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr || new Error("fetch failed");
    })();
  }

  async function mountShell(shell) {
    const src = shell.getAttribute("data-md-src");
    const prefix = shell.getAttribute("data-md-prefix") || "doc";
    const tocEl = shell.querySelector(".md-toc");
    const bodyEl = shell.querySelector(".md-body");
    if (!src || !bodyEl) return;
    bodyEl.innerHTML = "<p class='muted'>Загрузка…</p>";
    try {
      const { md, via } = await loadMarkdown(src);
      shell.setAttribute("data-md-loaded", via);
      const { html, toc } = mdToHtml(md, prefix);
      bodyEl.innerHTML = html;
      if (tocEl) tocEl.innerHTML = renderToc(toc);
      shell.querySelectorAll("[data-md-jump]").forEach((a) => {
        a.addEventListener("click", (e) => {
          e.preventDefault();
          const id = a.getAttribute("data-md-jump");
          const target = bodyEl.querySelector("#" + CSS.escape(id));
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            history.replaceState(null, "", "#" + id);
            shell.querySelectorAll("[data-md-jump]").forEach((x) => x.classList.remove("active"));
            a.classList.add("active");
          }
        });
      });
      const hash = location.hash.replace(/^#/, "");
      if (hash) {
        const t = bodyEl.querySelector("#" + CSS.escape(hash));
        if (t) setTimeout(() => t.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      }
    } catch (err) {
      bodyEl.innerHTML =
        `<p class="warn">Не удалось загрузить <code>${escapeHtml(src)}</code>. ` +
        `Пересобери бандл: <code>python management/tools/sync-deadline-docs-bundle.py</code>. ` +
        `<br/><span class="muted">${escapeHtml(String(err.message || err))}</span></p>`;
      if (tocEl) tocEl.innerHTML = "";
    }
  }

  function wireDocSelect(select) {
    const shellId = select.getAttribute("data-md-shell") || "llm-md-shell";
    const shell = document.getElementById(shellId) || select.closest(".tab-panel")?.querySelector(".md-shell");
    if (!shell) return;
    const apply = () => {
      const file = select.value;
      shell.setAttribute("data-md-src", "docs/" + file);
      shell.setAttribute("data-md-prefix", file.replace(/\.md$/i, "").toLowerCase().replace(/[^\w]+/g, "-"));
      mountShell(shell);
    };
    select.addEventListener("change", apply);
  }

  function mountPromptPicker(root) {
    const select = root.querySelector("[data-md-prompt-select]");
    const shell = root.querySelector(".md-shell");
    if (!select || !shell) return;
    const apply = () => {
      shell.setAttribute("data-md-src", "prompts/" + select.value);
      shell.setAttribute("data-md-prefix", "prompt-" + select.value.replace(/\.md$/i, "").toLowerCase());
      mountShell(shell);
    };
    select.addEventListener("change", apply);
    apply();
  }

  function boot() {
    document.querySelectorAll("[data-md-doc-select]").forEach(wireDocSelect);
    document.querySelectorAll(".md-shell[data-md-src]").forEach((shell) => {
      if (shell.closest("[data-md-prompt-root]")) return;
      mountShell(shell);
    });
    document.querySelectorAll("[data-md-prompt-root]").forEach(mountPromptPicker);

    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const id = tab.getAttribute("data-tab");
        const panel = document.getElementById("tab-" + id);
        if (!panel) return;
        panel.querySelectorAll(".md-shell[data-md-src]").forEach((shell) => {
          if (!shell.querySelector(".md-body h1, .md-body h2")) mountShell(shell);
        });
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
