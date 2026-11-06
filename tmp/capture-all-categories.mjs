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
    await page.waitForTimeout(1500);

    // 1. Capture Plaques tab
    const plaquesPath = path.resolve('tmp/all-products-plaques.png');
    await page.screenshot({ path: plaquesPath, fullPage: false });
    console.log('Saved Plaques:', plaquesPath);

    // 2. Click Headstones tab
    const headstonesBtn = await page.locator('button:has-text("Headstones")').first();
    if (headstonesBtn) {
      await headstonesBtn.click();
      await page.waitForTimeout(1000);
      const headstonesPath = path.resolve('tmp/all-products-headstones.png');
      await page.screenshot({ path: headstonesPath, fullPage: false });
      console.log('Saved Headstones:', headstonesPath);
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

main();
