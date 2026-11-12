import {chromium} from 'playwright';import {Client} from '@modelcontextprotocol/sdk/client/index.js';import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';
const profile=await fs.mkdtemp(path.join(os.tmpdir(),'butterfly-catalog-')); const context=await chromium.launchPersistentContext(profile,{headless:true,viewport:{width:1440,height:1000},args:['--remote-debugging-port=19338','--use-angle=swiftshader']});let client;
function result(r){if(r.isError)throw new Error(JSON.stringify(r.content));return r.structuredContent??JSON.parse(r.content.find(x=>x.type==='text').text)}
try{let page=context.pages()[0];await page.goto('http://localhost:3001/laser-etched-black-granite-headstone/inscriptions',{waitUntil:'domcontentloaded',timeout:120000});await page.waitForFunction(()=>window.__designerAgentBridge&&window.__headstoneStore?.getState().catalog,null,{timeout:120000});client=new Client({name:'butterfly-catalog',version:'1.0'});await client.connect(new StdioClientTransport({command:process.execPath,args:['scripts/designer-mcp.mjs'],env:{...process.env,DESIGNER_MCP_CDP_URL:'http://127.0.0.1:19338',DESIGNER_MCP_DRAFT_DIR:path.resolve('output/butterfly-drafts')}}));
const call=async(name,args)=>{let x=result(await client.callTool({name,arguments:args}));console.log(name,JSON.stringify(x).slice(0,800));return x};
await call('set_shape',{shapeId:'48',expectedRevision:'latest'});await call('set_dimensions',{widthMm:600,heightMm:600,expectedRevision:'latest'});
await call('add_inscriptions',{inscriptions:[{text:'FOREVER IN OUR HEARTS',font:'Garamond',sizeMm:28,color:'#FFFFFF',xPos:0,yPos:-185}],expectedRevision:'latest'});
for(const p of context.pages()) { try { await p.evaluate(()=>window.__headstoneStore?.getState().setSelectedInscriptionId(null)); } catch {} } let preview;for(let i=0;i<10;i++){await new Promise(r=>setTimeout(r,1500));let raw=await client.callTool({name:'get_preview',arguments:{expectedRevision:'latest'}});if(!raw.isError){let x=result(raw);let im=raw.content.find(c=>c.type==='image');if(x.previewId&&im){preview=x;await fs.writeFile('output/headstone-32-preview.jpg',Buffer.from(im.data,'base64'));break}}}if(!preview)throw Error('preview unavailable');console.log('PREVIEW_READY',JSON.stringify(preview));await new Promise(resolve=>process.stdin.once('data',resolve));let save=await call('save_local_design',{title:'Butterfly Shaped Headstone',expectedRevision:preview.revision,previewId:preview.previewId,visuallyReviewed:true});await fs.writeFile('output/headstone-32-save.json',JSON.stringify(save,null,2));console.log('SAVED');
}finally{if(client)await client.close();await context.close()}








