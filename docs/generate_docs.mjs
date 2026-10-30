import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

function mdToHtml(md, title) {
  // Simple clean markdown converter for documentation
  let lines = md.split("\n");
  let out = [];
  let inCode = false;
  let inTable = false;

  for (let line of lines) {
    if (line.startsWith("```")) {
      inCode = !inCode;
      out.push(inCode ? "<pre><code>" : "</code></pre>");
      continue;
    }
    if (inCode) {
      out.push(line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      continue;
    }

    if (line.startsWith("|")) {
      if (!inTable) {
        inTable = true;
        out.push("<table>");
      }
      if (line.includes("---")) continue; // separator line
      let cells = line.split("|").slice(1, -1).map(c => c.trim());
      let row = cells.map(c => `<td>${inlineFormat(c)}</td>`).join("");
      out.push(`<tr>${row}</tr>`);
      continue;
    } else if (inTable) {
      inTable = false;
      out.push("</table>");
    }

    if (line.startsWith("# ")) {
      out.push(`<h1>${inlineFormat(line.slice(2))}</h1>`);
    } else if (line.startsWith("## ")) {
      out.push(`<h2>${inlineFormat(line.slice(3))}</h2>`);
    } else if (line.startsWith("### ")) {
      out.push(`<h3>${inlineFormat(line.slice(4))}</h3>`);
    } else if (line.startsWith("- ")) {
      out.push(`<li>${inlineFormat(line.slice(2))}</li>`);
    } else if (line.trim() === "---") {
      out.push("<hr/>");
    } else if (line.trim().length > 0) {
      out.push(`<p>${inlineFormat(line)}</p>`);
    }
  }

  function inlineFormat(s) {
    return s
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @page { margin: 20mm 15mm; size: A4; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; font-size: 24pt; margin-top: 0; }
    h2 { color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; font-size: 16pt; margin-top: 24pt; }
    h3 { color: #1d4ed8; font-size: 13pt; margin-top: 16pt; }
    p, li { font-size: 10.5pt; color: #334155; }
    li { margin-bottom: 4px; }
    code { font-family: Consolas, monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 9.5pt; color: #0f172a; }
    pre { background: #0f172a; color: #f8fafc; padding: 14px; border-radius: 8px; overflow-x: auto; font-size: 9pt; }
    pre code { background: none; color: inherit; padding: 0; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 10pt; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    tr:nth-child(even) { background-color: #f8fafc; }
    tr:first-child { background-color: #e2e8f0; font-weight: bold; }
    blockquote { border-left: 4px solid #3b82f6; padding-left: 12px; margin-left: 0; color: #475569; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
  </style>
</head>
<body>
  ${out.join("\n")}
</body>
</html>`;
}

// Convert PRD
const prdMd = readFileSync("docs/PRD.md", "utf8");
const prdHtml = mdToHtml(prdMd, "Little Steps - PRD");
writeFileSync("docs/PRD.html", prdHtml);

// Convert Tech Doc
const techMd = readFileSync("docs/Technical-Documentation.md", "utf8");
const techHtml = mdToHtml(techMd, "Little Steps - Technical Documentation");
writeFileSync("docs/Technical-Documentation.html", techHtml);

console.log("HTML docs generated successfully.");
