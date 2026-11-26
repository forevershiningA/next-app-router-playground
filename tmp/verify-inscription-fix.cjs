const {chromium,devices}=require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--enable-unsafe-swiftshader']});
 try {
 for(const [name,options] of [['mobile',devices['Pixel 7']],['desktop',{viewport:{width:1440,height:900}}]]){
 const page=await b.newPage({...options,deviceScaleFactor:1});page.setDefaultTimeout(90000);
 await page.goto('http://127.0.0.1:3128/laser-etched-black-granite-headstone/inscriptions',{waitUntil:'domcontentloaded',timeout:150000});
 const input=page.locator('textarea:visible').first();await input.waitFor();
 await page.waitForFunction(()=>!!window.__r3fScene?.getObjectByName('headstone'));
 await input.fill('Always remembered');
 const done=page.getByRole('button',{name:'Done',exact:true});if(await done.isVisible())await done.click();
 await page.getByRole('button',{name:'Add Inscription',exact:true}).click();
 await page.waitForFunction(()=>{let ready=false;window.__r3fScene?.traverse(o=>{if(o.text==='Always remembered'&&o.geometry?.instanceCount>0)ready=true});return ready});
 await page.waitForTimeout(1200);
 console.log(name,await page.evaluate(()=>{let planes=[];window.__r3fScene.traverse(o=>{if(o.geometry?.parameters?.width===200&&o.material?.opacity===0)planes.push(o.material.depthWrite)});return planes}));
 await page.screenshot({path:'tmp/fixed-inscription-'+name+'.png'});await page.close();
 }
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
