import katex from 'katex';

/**
 * Escape HTML to prevent XSS.
 */
export function escapeHtml(str: unknown): string {
  if (typeof str !== 'string') return String(str == null ? '' : str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Render simple markdown-like content to safe HTML.
 * Supports: # h1, ## h2, ### h3, #### h4 headings,
 * > blockquotes, **bold**, *italic*, `code`, [link](url), newlines, LaTeX.
 */
export function renderMarkdown(text: string): string {
  if (typeof text !== 'string') return '';

  const blocks: string[] = [];
  const inlines: string[] = [];

  // Helper to normalize double-escaped backslashes in LaTeX
  const normalizeMath = (math: string) => {
    return math.replace(/\\{2,}([a-zA-Z]+)/g, '\\$1');
  };

  // 1. Extract block math $$...$$
  let tempText = text.replace(/\$\$(.+?)\$\$/gs, (_, math) => {
    try {
      const rendered = katex.renderToString(normalizeMath(math), {
        displayMode: true,
        throwOnError: false,
      });
      blocks.push(rendered);
      return `__LATEX_BLOCK_${blocks.length - 1}__`;
    } catch (err) {
      console.error(err);
      return _;
    }
  });

  // 2. Extract inline math $...$
  tempText = tempText.replace(/\$([^$\n]+?)\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(normalizeMath(math), {
        displayMode: false,
        throwOnError: false,
      });
      inlines.push(rendered);
      return `__LATEX_INLINE_${inlines.length - 1}__`;
    } catch (err) {
      console.error(err);
      return _;
    }
  });

  let html = escapeHtml(tempText);

  // #### Headings (must be before ### and ## to avoid partial matches)
  html = html.replace(
    /(^|\r?\n)####\s+(.+?)(?=\r?\n|$)/g,
    '$1<h4 class="section-heading section-heading-h4">$2</h4>'
  );
  // ### Headings
  html = html.replace(
    /(^|\r?\n)###\s+(.+?)(?=\r?\n|$)/g,
    '$1<h3 class="section-heading section-heading-h3">$2</h3>'
  );
  // ## Headings (must be after ### to avoid triple-hash partial matches)
  html = html.replace(
    /(^|\r?\n)##\s+(.+?)(?=\r?\n|$)/g,
    '$1<h2 class="section-heading section-heading-h2">$2</h2>'
  );
  // # Headings (must be last since it's the most general)
  html = html.replace(
    /(^|\r?\n)#\s+(.+?)(?=\r?\n|$)/g,
    '$1<h1 class="section-heading section-heading-h1">$2</h1>'
  );
  // > Blockquotes
  html = html.replace(
    /(^|\r?\n)(?:&amp;gt;|&gt;|>)\s*(.+?)(?=\r?\n|$)/g,
    '$1<blockquote class="section-blockquote">$2</blockquote>'
  );
  // **Bold**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // *Italic*
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // `Code`
  html = html.replace(
    /`(.+?)`/g,
    '<code class="section-code">$1</code>'
  );
  // [Link](url)
  html = html.replace(
    /\[(.+?)\]\((.+?)\)/g,
    '<a href="$2" target="_blank" rel="noopener" class="section-link">$1</a>'
  );
  // Tables - convert markdown table blocks to HTML tables
  html = html.replace(
    /((?:\|[^\n]*\n?)+)/g,
    (match: string) => {
      const lines = match.trim().split(/\r?\n/);
      if (lines.length < 3) return match;
      // Check if second line is a separator (| --- | --- |)
      if (!/^\|[-:\s|]+\|$/.test(lines[1].trim())) return match;
      let tableHtml = '<table class="section-table">\n<thead>\n<tr>';
      // Header row
      const headerCells = lines[0].split('|').filter((c: string) => c.trim() !== '');
      headerCells.forEach((cell: string) => {
        tableHtml += `<th>${cell.trim()}</th>`;
      });
      tableHtml += '</tr>\n</thead>\n<tbody>\n';
      // Data rows (skip separator line at index 1)
      for (let i = 2; i < lines.length; i++) {
        const cells = lines[i].split('|').filter((c: string) => c.trim() !== '');
        if (cells.length === 0) continue;
        tableHtml += '<tr>';
        cells.forEach((cell: string) => {
          tableHtml += `<td>${cell.trim()}</td>`;
        });
        tableHtml += '</tr>\n';
      }
      tableHtml += '</tbody>\n</table>';
      return tableHtml;
    }
  );
  // Protect table HTML newlines from the <br> conversion below
  const TABLE_NL = '\x00TABLE_NL\x00';
  html = html.replace(/(<table[^>]*>[\s\S]*?<\/table>)/g, (m) =>
    m.replace(/\n/g, TABLE_NL)
  );
  // Remove newline immediately following block elements to prevent double-breaks
  html = html.replace(/(<\/h[1-6]>|<\/blockquote>|<\/table>)\r?\n/gi, '$1');
  // Newlines → <br>
  html = html.replace(/\r?\n/g, '<br>');
  // Restore table newlines
  html = html.replace(new RegExp(TABLE_NL, 'g'), '\n');
  // 4. Restore block math placeholders
  blocks.forEach((rendered, index) => {
    html = html.replace(`__LATEX_BLOCK_${index}__`, rendered);
  });

  // 5. Restore inline math placeholders
  inlines.forEach((rendered, index) => {
    html = html.replace(`__LATEX_INLINE_${index}__`, rendered);
  });

  return html;
}

/**
 * Returns the percentage of correct answers, rounded to the nearest integer.
 * Returns 0 when total is 0.
 */
export function scorePercent(correct: number, total: number): number {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Returns true when focus is inside a text-input element.
 */
export function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}
