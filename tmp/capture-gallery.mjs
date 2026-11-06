import { chromium } from 'playwright';
import path from 'node:path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  
  try {
    await page.goto('http://localhost:3000/select-product', { waitUntil: 'networkidle', timeout: 30000 });
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'day');
      localStorage.setItem('fs_ui_theme', 'day');
    });
    await page.waitForTimeout(1000);

    const tabs = ['Plaques', 'Headstones', 'Full Monuments', 'Urns', 'Pet Memorials'];
    for (const tabName of tabs) {
      const btn = await page.locator(`button:has-text("${tabName}")`).first();
      if (btn) {
        await btn.click();
        await page.waitForTimeout(800);
        const slug = tabName.toLowerCase().replace(/\s+/g, '-');
        const p = path.resolve(`tmp/gallery-${slug}.png`);
        await page.screenshot({ path: p, fullPage: false });
        console.log(`Saved ${tabName}:`, p);
      }
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

main();
