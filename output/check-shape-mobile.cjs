const {chromium, expect} = require('@playwright/test');
(async()=>{
const browser=await chromium.launch({headless:true});
for(const width of [390,1440]){
 const page=await browser.newPage();
 page.on('dialog', dialog => dialog.accept());
 await page.addInitScript(()=>localStorage.setItem('fs_ui_theme','day'));
 await page.setViewportSize({width,height:844});
 await page.goto('http://localhost:3000/traditional-engraved-headstone/select-shape');
 const search=page.getByRole('searchbox',{name:'Search shapes by name'});
 await search.waitFor();
 await page.getByRole('heading',{name:'Serpentine',exact:true}).waitFor();
 await page.getByRole('button',{name:/^Traditional\(/}).click();
 await expect(page.getByRole('button',{name:/^Traditional\(/})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:/^All Shapes/}).click();
 await expect(page.getByRole('button',{name:/^All Shapes/})).toHaveAttribute('aria-pressed','true');
 await page.screenshot({path:`output/select-shape-${width}.png`});
 await search.fill('zzzz-no-shape');
 await expect(page.getByRole('heading',{name:/No shapes match/})).toBeVisible();
 await expect(search).toBeVisible();
 await search.fill('Serpentine');
 await page.getByRole('heading',{name:'Serpentine',exact:true}).waitFor();
 await search.fill('');
 await page.getByRole('button',{name:/^Military\(/}).click();
 await expect(page.getByRole('button',{name:/^Military\(/})).toHaveAttribute('aria-pressed','true');
 console.log(width,'search, empty state and category selection passed');
 await page.close();
}
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
