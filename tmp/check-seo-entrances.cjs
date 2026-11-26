const {chromium,devices}=require('playwright');
const paths=['traditional-plaque/memorial/rectangle-portrait-bird-flower','traditional-headstone/mother-memorial/peak-much-loved','laser-etched-headstone/butterfly-memorial/headstone-27-butterflies','stainless-steel-plaque/teacher-memorial'];
(async()=>{const b=await chromium.launch({args:['--enable-unsafe-swiftshader']});try{
for(const path of paths){const c=await b.newContext({...devices['Pixel 7'],deviceScaleFactor:1});const p=await c.newPage();p.setDefaultTimeout(15000);const r={path};const sent=[];p.on('request',q=>{if(q.url().includes('sentry')&&q.postDataBuffer()?.includes(Buffer.from('ready_design.editor_open')))sent.push('editor_open')});
try{const resp=await p.goto('https://forevershining.org/designs/'+path,{waitUntil:'domcontentloaded'});r.status=resp.status();if(r.status===200){
await p.waitForTimeout(1800);
r.screen=await p.evaluate(()=>({h:innerHeight,text:[...document.querySelectorAll('h1,h2,p,button,a')].filter(e=>{const b=e.getBoundingClientRect();return b.width&&b.height&&b.top>=0&&b.top<innerHeight&&b.left>=0&&b.left<innerWidth}).map(e=>e.innerText.trim()).filter(Boolean).join(' | ').slice(0,650)}));
if(path.split('/').length===2){const link=p.locator('#category-design-list a').first();r.card=await link.getAttribute('href');await link.click()}
const btn=p.getByRole('button',{name:/start with this design|personalization unavailable/i}).first();await btn.waitFor();r.cta=await btn.innerText();r.y=Math.round((await btn.boundingBox()).y);r.preview=await p.locator('img[alt$="3D preview" i]:visible').first().getAttribute('src');if(await btn.isEnabled()){await btn.click();await p.waitForURL(/select-size/,{timeout:30000});r.editor=p.url();await p.locator('canvas').first().waitFor();r.canvas=true;await p.waitForTimeout(5300)}}
}catch(e){r.error=e.message.slice(0,180)}r.observedMetric=sent;console.log(JSON.stringify(r));await c.close()}}
finally{await b.close()}})()
