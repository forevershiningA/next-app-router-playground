const {chromium,devices}=require('playwright');
(async()=>{
 const browser=await chromium.launch({args:['--enable-unsafe-swiftshader']});
 const page=await browser.newPage({...devices['Pixel 7'],deviceScaleFactor:1});
 page.setDefaultTimeout(8000);
 const button=(name)=>page.getByRole('button',{name}).first();
 const tap=async(name)=>page.getByRole('button',{name}).or(page.getByRole('link',{name})).first().click();
 const expand=async()=>{const group=page.locator('button[aria-controls=designer-menu-group-1-items]:visible').first();await group.waitFor();if(await group.getAttribute('aria-expanded')==='false')await group.click()};
 const inspect=async()=>console.log(page.url(),(await page.locator('body').innerText()).slice(-2200));
 try {
 await page.goto('https://forevershining.org',{waitUntil:'domcontentloaded'});
 await page.getByRole('link',{name:/heart-shaped headstone.*customize/i}).first().click();
 await page.waitForURL(/select-material/,{timeout:60000});
 console.log('Preset',page.url());
 await tap(/^Menu$/i);await inspect();await page.waitForURL(/design-menu/);await expand();await page.getByText('Add Your Inscriptions',{exact:true}).filter({visible:true}).first().click();
 const inscription='Always remembered';
 await page.locator('textarea:visible').first().fill(inscription);
 const done=button(/^Done$/i);if(await done.isVisible())await done.click();
 await tap(/^Add Inscription$/i);
 const draft=()=>page.evaluate(async()=>{const db=await new Promise((res,rej)=>{const r=indexedDB.open('forever-shining-designer');r.onsuccess=()=>res(r.result);r.onerror=rej});return new Promise(res=>{const r=db.transaction('drafts').objectStore('drafts').get('active-design');r.onsuccess=()=>{res(JSON.stringify(r.result||{}).includes('Always remembered'));db.close()}})});
 for(let i=0;i<15&&!await draft();i++)await page.waitForTimeout(500);
 console.log('Inscription in draft',await draft());
 await page.waitForTimeout(10000);await page.screenshot({path:'tmp/journey-inscription.png'});
 await tap(/Open price details/i);
 await inspect();
 if(!await button(/^Save Design$/i).isVisible()){
 const close=button(/Close dialog/i);if(await close.isVisible())await close.click();
 await tap(/^Menu$/i); await page.waitForURL(/design-menu/);await expand();await page.getByText('Save Design',{exact:true}).filter({visible:true}).first().click();
 } else await page.getByText('Save Design',{exact:true}).filter({visible:true}).first().click();
 await page.waitForTimeout(1200);await inspect();console.log('Draft after save',await draft());await page.waitForURL(/my-account/);const back=new URL(page.url()).searchParams.get('returnTo');await page.goto(new URL(back,page.url()).href,{waitUntil:'domcontentloaded'});console.log('Return path',page.url());if(page.url().includes('design-menu')){await expand();await page.getByText('Add Your Inscriptions',{exact:true}).filter({visible:true}).first().click();await page.getByText(inscription,{exact:true}).first().waitFor();await page.waitForTimeout(10000);await page.screenshot({path:'tmp/journey-restored.png'});console.log('Restored inscription',await page.locator('textarea:visible').first().inputValue(),await draft())}
 } catch(e){console.log(e.message);await inspect();console.log(await page.getByRole('button').allTextContents());process.exitCode=1}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});





