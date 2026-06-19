import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '../renderContent';

describe('renderMarkdown', () => {
  it('should parse headings correctly without nesting consecutive ones', () => {
    const markdown = '# H1\n## H2\n### H3\n#### H4';
    const result = renderMarkdown(markdown);
    expect(result).toContain('<h1 class="section-heading section-heading-h1">H1</h1>');
    expect(result).toContain('<h2 class="section-heading section-heading-h2">H2</h2>');
    expect(result).toContain('<h3 class="section-heading section-heading-h3">H3</h3>');
    expect(result).toContain('<h4 class="section-heading section-heading-h4">H4</h4>');
    // Ensure they are siblings, not nested
    expect(result).not.toContain('H1<h2');
  });

  it('should parse blockquotes successfully with both > and &gt;', () => {
    const md1 = '> This is a quote';
    const md2 = '&gt; This is another quote';
    expect(renderMarkdown(md1)).toContain('<blockquote class="section-blockquote">This is a quote</blockquote>');
    expect(renderMarkdown(md2)).toContain('<blockquote class="section-blockquote">This is another quote</blockquote>');
  });

  it('should remove the newline immediately following closing block tags', () => {
    const markdown = '### What We Will Cover\n- The foundations...\n\n### Deliverables\nBy the end...';
    const result = renderMarkdown(markdown);
    // Since the newline immediately after h3 is removed, there is no <br> immediately following it.
    expect(result).toContain('</h3>- The foundations...');
    expect(result).toContain('</h3>By the end...');
    // Double newlines should still be preserved
    expect(result).toContain('- The foundations...<br><br>');
  });

  it('should parse tables correctly without sucking in sibling headings', () => {
    const markdown = [
      '| Header 1 | Header 2 |',
      '|---|---|',
      '| Cell 1 | Cell 2 |',
      '## Test Heading Here',
      'Test Content'
    ].join('\n');

    const result = renderMarkdown(markdown);
    // Table should contain table structure
    expect(result).toContain('<table class="section-table">');
    // Sibling heading should not be inside table rows/cells
    expect(result).toContain('</table><h2 class="section-heading section-heading-h2">Test Heading Here</h2>');
    expect(result).not.toContain('<td><h2');
  });
});
