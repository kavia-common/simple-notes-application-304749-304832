function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function inlineMd(s) {
  // Basic inline formatting: code, bold, italics, links
  let out = escapeHtml(s);

  // Inline code: `code`
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Bold: **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Italic: *text*
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Links: [text](url)
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  return out;
}

// PUBLIC_INTERFACE
export function renderMarkdownToHtml(markdown) {
  /**
   * Render a small subset of Markdown to HTML (headings, lists, code blocks, paragraphs).
   * This intentionally avoids raw HTML passthrough for safety.
   */
  const md = (markdown ?? "").replaceAll("\r\n", "\n");
  const lines = md.split("\n");

  let html = "";
  let inCodeBlock = false;
  let codeBuffer = [];
  let inList = false;

  const flushList = () => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  };

  const flushCode = () => {
    if (inCodeBlock) {
      const code = escapeHtml(codeBuffer.join("\n"));
      html += `<pre><code>${code}</code></pre>`;
      codeBuffer = [];
      inCodeBlock = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine ?? "";

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        flushCode();
      } else {
        flushList();
        inCodeBlock = true;
        codeBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Headings
    const hMatch = /^(#{1,3})\s+(.*)$/.exec(line);
    if (hMatch) {
      flushList();
      const level = hMatch[1].length;
      html += `<h${level}>${inlineMd(hMatch[2])}</h${level}>`;
      continue;
    }

    // Unordered list
    const liMatch = /^\s*-\s+(.*)$/.exec(line);
    if (liMatch) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${inlineMd(liMatch[1])}</li>`;
      continue;
    } else {
      flushList();
    }

    // Empty line -> paragraph spacing
    if (line.trim() === "") {
      html += "";
      continue;
    }

    // Paragraph
    html += `<p>${inlineMd(line)}</p>`;
  }

  flushList();
  flushCode();

  return html;
}
