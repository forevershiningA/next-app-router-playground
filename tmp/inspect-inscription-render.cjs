const {chromium,devices}=require('playwright');
(async()=>{
 const browser=await chromium.launch({args:['--enable-unsafe-swiftshader']});
 const page=await browser.newPage({...devices['Pixel 7'],deviceScaleFactor:1});
 page.on('pageerror', e=>console.log('error',e.message));page.on('console', m=>{if(m.type()==='error'||m.text().startsWith('materials'))console.log(m.text().slice(0,300))});page.setDefaultTimeout(120000);
 const button=(name)=>page.getByRole('button',{name}).first();
 const tap=async(name)=>page.getByRole('button',{name}).or(page.getByRole('link',{name})).first().click();
 const expand=async()=>{const group=page.locator('button[aria-controls=designer-menu-group-1-items]:visible').first();await group.waitFor();if(await group.getAttribute('aria-expanded')==='false')await group.click()};
 const inspect=async()=>console.log(page.url(),(await page.locator('body').innerText()).slice(-2200));
 try {
 await page.goto(process.argv[2]==='public'?'https://forevershining.org':'http://localhost:3128',{waitUntil:'domcontentloaded'});
 await page.getByRole('link',{name:/heart-shaped headstone.*customize/i}).first().click();
 await page.waitForURL(/select-material/,{timeout:60000});
 console.log('Preset',page.url());
 await tap(/^Menu$/i);await page.waitForURL(/design-menu/);await expand();await page.getByText('Add Your Inscriptions',{exact:true}).filter({visible:true}).first().click();
 const inscription='Always remembered';
 await page.locator('textarea:visible').first().fill(inscription);
 const done=button(/^Done$/i);if(await done.isVisible())await done.click();
 await tap(/^Add Inscription$/i);
 const dump=async(label)=>{await page.waitForTimeout(2500);console.log(label,await page.evaluate(()=>{const scene=window.__r3fScene;const nodes=[];scene?.traverse(o=>{if(o.text||o.userData?.inscriptionId)nodes.push({text:o.text, pos:o.matrixWorld.elements.slice(12,15),count:o.geometry?.instanceCount,visible:o.visible,ancestors:(()=>{const a=[];for(let p=o;p;p=p.parent)a.push([p.name,p.visible]);return a})()})});return JSON.stringify({frame:window.__r3fGL?.info.render.frame,nodes,meshes:scene?.children.length})}));await page.screenshot({path:'tmp/inscription-'+label+'.png'})};
 await dump('before');  const diag=await page.evaluate(()=>{const scene=window.__r3fScene,cam=window.__r3fCamera;let t;scene.traverse(o=>{if(o.text)t=o});const r=scene.__r3f.root.getState();const loc=t.position.clone().setFromMatrixPosition(t.matrixWorld).project(cam);r.raycaster.setFromCamera(loc,cam);const hits=r.raycaster.intersectObjects(scene.children,true).slice(0,10).map(h=>[h.object.name,h.object.type,h.point.z,h.object.material?.type,h.object.material?.depthWrite,h.object.material?.opacity,h.object.visible,h.object.geometry?.type,h.object.parent?.name]);const m=t.material;console.log('materials',JSON.stringify([m].flat().map(x=>({depth:x.depthTest,visible:x.visible,opacity:x.opacity,color:x.color?.getHexString(),side:x.side,groups:t.geometry.groups,layer:t.layers.mask,camLayer:cam.layers.mask})))); const info={loc,depthTest:m.depthTest,color:m.color?.getHexString(),bounds:t.textRenderInfo?.blockBounds,fontSize:t.fontSize,hits};scene.traverse(o=>{if(o.geometry?.type==='PlaneGeometry'&&o.material?.opacity===0){console.log('materials plane',o.geometry.parameters.width,o.geometry.parameters.height,o.position.toArray(),o.material.depthWrite);if(o.geometry.parameters.width===200)o.material.depthWrite=false}});r.invalidate();return info});console.log('diagnosis',diag);await dump('depth'); await page.evaluate(()=>{let t;const s=window.__r3fScene;s.traverse(o=>{if(o.text)t=o});t.text+='!';t.sync(()=>s.__r3f.root.getState().invalidate())});await dump('resync');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});






