import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { diffLines } from 'diff';

const USER_AGENT = 'CompetitorTrackerBot/1.0 (personal project)';
const FETCH_TIMEOUT_MS = 10000;

export interface FetchResult {
  success: boolean;
  rawHtml?: string;
  visibleText?: string;
  textHash?: string;
  error?: string;
}

export async function fetchPage(url: string): Promise<FetchResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }

    const rawHtml = await res.text();
    const visibleText = extractVisibleText(rawHtml);
    const textHash = crypto.createHash('sha256').update(visibleText).digest('hex');

    return { success: true, rawHtml, visibleText, textHash };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('abort')) {
      return { success: false, error: 'Request timed out' };
    }
    return { success: false, error: msg };
  }
}

export function extractVisibleText(html: string): string {
  const $ = cheerio.load(html);

  $('script, style, nav, footer, noscript, iframe, svg').remove();

  const body = $('body');
  if (!body.length) return '';

  const text = body
    .text()
    .replace(/[\r\n]+/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}

export interface DiffResult {
  added: number;
  removed: number;
  summary: string;
  hasChanges: boolean;
}

export function computeDiff(oldText: string, newText: string): DiffResult {
  const changes = diffLines(oldText, newText);

  let added = 0;
  let removed = 0;

  for (const part of changes) {
    if (part.added) added += part.count ?? 0;
    if (part.removed) removed += part.count ?? 0;
  }

  const summary = `${added} line${added === 1 ? '' : 's'} added, ${removed} line${removed === 1 ? '' : 's'} removed`;

  return {
    added,
    removed,
    summary: added > 0 || removed > 0 ? summary : 'No changes detected',
    hasChanges: added > 0 || removed > 0,
  };
}
