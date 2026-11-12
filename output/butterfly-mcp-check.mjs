import { chromium } from 'playwright';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import os from 'node:os'; import fs from 'node:fs/promises'; import path from 'node:path';
const profile=await fs.mkdtemp(path.join(os.tmpdir(),'butterfly-check-'));
const context=await chromium.launchPersistentContext(profile,{headless:true,args:['--remote-debugging-port=19222','--use-angle=swiftshader']});
let client;
try {
 const page=context.pages()[0]; await page.goto('http://localhost:3001/traditional-engraved-headstone/inscriptions',{waitUntil:'domcontentloaded',timeout:120000});
 await page.waitForFunction(()=>window.__designerAgentBridge && window.__headstoneStore?.getState().catalog,null,{timeout:120000});
 client=new Client({name:'butterfly-verification',version:'1.0.0'});
 await client.connect(new StdioClientTransport({command:process.execPath,args:['scripts/designer-mcp.mjs'],env:{...process.env,DESIGNER_MCP_CDP_URL:'http://127.0.0.1:19222'}}));
 let config=await client.callTool({name:'get_product_configuration',arguments:{}}); console.log('CONFIG',JSON.stringify(config.structuredContent?.shapes?.filter(s=>s.id==='48'||s.name?.includes('32'))));
 let set=await client.callTool({name:'set_shape',arguments:{shapeId:'48',expectedRevision:'latest'}});console.log('SET',JSON.stringify(set.structuredContent??set.content));
 await page.waitForTimeout(8000); await page.screenshot({path:'output/butterfly-verified.png'});
 console.log('SCENE',await page.evaluate(()=>{let n=0;window.__r3fScene?.traverse(x=>{if(x.isMesh&&x.visible)n++});return n}));
} finally {if(client)await client.close();await context.close();}
