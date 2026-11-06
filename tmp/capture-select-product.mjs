import { chromium } from 'playwright';
import path from 'node:path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto('http://localhost:3000/select-product', { waitUntil: 'networkidle', timeout: 30000 });
    // Set day mode
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'day');
      localStorage.setItem('fs_ui_theme', 'day');
    });
    await page.waitForTimeout(1000);
    const screenshotPath = path.resolve('tmp/select-product-daymode-studio-result.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log('Saved screenshot:', screenshotPath);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

main();
