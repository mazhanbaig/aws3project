import puppeteer, { Browser } from 'puppeteer';

const SCREENSHOT_WIDTH = 1280;
const SCREENSHOT_HEIGHT = 900;
const NAVIGATION_TIMEOUT = 15000;

let browser: Browser | null = null;
let browserInitializing = false;
let browserFailed = false;

async function getBrowser(): Promise<Browser | null> {
  if (browser) return browser;
  if (browserFailed) return null;
  if (browserInitializing) {
    // Wait for the other init to finish
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 100));
      if (browser) return browser;
      if (browserFailed) return null;
    }
    return null;
  }

  browserInitializing = true;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
      ],
    });
    browserInitializing = false;
    return browser;
  } catch (err) {
    console.error('[Screenshot] Failed to launch browser:', err);
    browserFailed = true;
    browserInitializing = false;
    return null;
  }
}

export interface ScreenshotResult {
  success: boolean;
  buffer?: Buffer;
  error?: string;
}

export async function captureScreenshot(url: string): Promise<ScreenshotResult> {
  const br = await getBrowser();
  if (!br) {
    // Fallback: return a simple data URL indicating screenshot unavailable
    return { success: false, error: 'Browser not available (Chromium may not be installed)' };
  }

  let page;
  try {
    page = await br.newPage();
    await page.setViewport({ width: SCREENSHOT_WIDTH, height: SCREENSHOT_HEIGHT });
    await page.setUserAgent('CompetitorTrackerBot/1.0 (screenshot)');

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: NAVIGATION_TIMEOUT,
    });

    // Wait a bit for any lazy-loaded content
    await new Promise(r => setTimeout(r, 1000));

    const buffer = await page.screenshot({
      type: 'png',
      fullPage: true,
      encoding: 'binary',
    }) as Buffer;

    return { success: true, buffer };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Screenshot] Failed to capture ${url}:`, msg);
    return { success: false, error: msg };
  } finally {
    if (page) {
      try { await page.close(); } catch { /* ignore */ }
    }
  }
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    try { await browser.close(); } catch { /* ignore */ }
    browser = null;
    browserFailed = false;
  }
}
