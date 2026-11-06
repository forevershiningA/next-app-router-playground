import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    const res = await page.goto('http://localhost:3000/select-size', { timeout: 25000, waitUntil: 'domcontentloaded' });
    console.log('Status:', res?.status());
    console.log('Title:', await page.title());
    await page.waitForSelector('#scene-root canvas', { timeout: 20000 });
    console.log('Canvas found!');
    
    // Check window variables
    const globals = await page.evaluate(() => ({
      hasStore: typeof window.__headstoneStore !== 'undefined',
      hasR3fScene: typeof window.__r3fScene !== 'undefined',
      hasLoadDesign: typeof window.__loadDesignById !== 'undefined'
    }));
    console.log('Globals:', globals);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

main();
