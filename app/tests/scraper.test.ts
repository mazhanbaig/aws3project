import { describe, it, expect } from 'vitest';
import { extractVisibleText, computeDiff, fetchPage } from '../src/lib/scraper';

describe('extractVisibleText', () => {
  it('strips script and style tags', () => {
    const html = '<html><body><script>alert("x")</script><style>.cls{}</style><p>Hello</p></body></html>';
    const text = extractVisibleText(html);
    expect(text).toBe('Hello');
  });

  it('strips nav and footer tags', () => {
    const html = '<body><nav>Nav</nav><footer>Footer</footer><main>Content</main></body>';
    const text = extractVisibleText(html);
    expect(text).toBe('Content');
  });

  it('normalizes whitespace', () => {
    const html = '<body><p>  Line  1  </p><p>  Line  2  </p></body>';
    const text = extractVisibleText(html);
    // cheerio .text() collapses inline, but block elements create spacing
    expect(text).toContain('Line 1');
    expect(text).toContain('Line 2');
    expect(text).not.toContain('<p>');
  });

  it('returns empty string for empty body', () => {
    const text = extractVisibleText('<html></html>');
    expect(text).toBe('');
  });

  it('handles real-world HTML', () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>Test</title><style>body{color:red}</style></head>
      <body>
        <header><nav>Nav links</nav></header>
        <main>
          <h1>Pricing</h1>
          <p>Our product costs <strong>$10</strong>/month.</p>
        </main>
        <footer>Copyright 2024</footer>
        <script>console.log('hidden')</script>
      </body>
      </html>
    `;
    const text = extractVisibleText(html);
    expect(text).toContain('Pricing');
    expect(text).toContain('$10');
    expect(text).not.toContain('hidden');
    expect(text).not.toContain('Nav links');
    expect(text).not.toContain('Copyright 2024');
  });
});

describe('computeDiff', () => {
  it('detects added lines', () => {
    const result = computeDiff('Line 1\nLine 2', 'Line 1\nLine 2\nLine 3');
    expect(result.added).toBeGreaterThan(0);
    expect(result.hasChanges).toBe(true);
    expect(result.summary).toContain('added');
  });

  it('detects removed lines', () => {
    const result = computeDiff('Line 1\nLine 2\nLine 3', 'Line 1\nLine 2');
    expect(result.removed).toBeGreaterThan(0);
    expect(result.hasChanges).toBe(true);
    expect(result.summary).toContain('removed');
  });

  it('detects both added and removed', () => {
    const result = computeDiff('Old line 1\nOld line 2', 'New line 1\nNew line 2');
    expect(result.added).toBeGreaterThan(0);
    expect(result.removed).toBeGreaterThan(0);
    expect(result.hasChanges).toBe(true);
  });

  it('reports no changes for identical text', () => {
    const result = computeDiff('Same text', 'Same text');
    expect(result.added).toBe(0);
    expect(result.removed).toBe(0);
    expect(result.hasChanges).toBe(false);
    expect(result.summary).toBe('No changes detected');
  });
});

describe('fetchPage', () => {
  it('returns error for invalid URL', async () => {
    const result = await fetchPage('not-a-valid-url');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('handles fetch timeout gracefully', async () => {
    // Use a URL that will hang — but with our 10s timeout, it should reject
    const result = await fetchPage('https://example.com:81/');
    // We just check it doesn't crash — could be success or failure depending on network
    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');
  }, 20000);
});
