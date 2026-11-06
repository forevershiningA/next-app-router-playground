import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });

  await page.goto('http://localhost:3000/select-product', { waitUntil: 'networkidle', timeout: 30000 });

  // Set Day Mode
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'day');
    localStorage.setItem('fs_ui_theme', 'day');
  });
  await page.waitForTimeout(500);

  const categories = [
    { id: 'plaques', name: 'Plaques', file: 'tmp/final-3d-plaques.png' },
    { id: 'headstones', name: 'Headstones', file: 'tmp/final-3d-headstones.png' },
    { id: 'monuments', name: 'Full Monuments', file: 'tmp/final-3d-monuments.png' },
    { id: 'urns', name: 'Urns', file: 'tmp/final-3d-urns.png' },
    { id: 'pet-memorials', name: 'Pet Memorials', file: 'tmp/final-3d-pet-memorials.png' },
  ];

  for (const cat of categories) {
    console.log(`Selecting category: ${cat.name}...`);
    const btn = await page.getByRole('button', { name: new RegExp(cat.name, 'i') }).first();
    if (btn) {
      await btn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: cat.file, fullPage: false });
      console.log(`Saved ${cat.file}`);
    }
  }

  await browser.close();
  console.log('All gallery screenshots captured!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
