const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage();
  await page.addInitScript(() => localStorage.setItem('fs_ui_theme', 'day'));
  for (const width of [390, 1440]) {
    await page.setViewportSize({width, height:844});
    await page.goto('http://localhost:3000/select-product');
    const track = page.getByRole('region', {name:'Plaques products'});
    await track.waitFor();
    await page.getByRole('button', {name:'Next products in Plaques'}).waitFor();
    await page.screenshot({path:`output/select-product-${width}.png`});
    console.log(width, await track.boundingBox());
    await page.getByRole('button', {name:'Next products in Plaques'}).click();
    await page.waitForFunction(() => document.querySelector('[aria-label="Plaques products"]').scrollLeft > 100);
    console.log('Carousel advances');
    await page.getByRole('button', {name:/^Headstones/}).click();
    await page.getByRole('region', {name:'Headstones products'}).waitFor();
    console.log('Category filter works');
  }
  await browser.close();
})().catch(error => {console.error(error); process.exit(1)});
