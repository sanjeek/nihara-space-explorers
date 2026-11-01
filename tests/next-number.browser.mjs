import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader']});
try {
 const page = await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
   window.__spoken=[];
   Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],cancel(){},speak(u){window.__spoken.push(u.text);u.onend?.();},addEventListener(){},removeEventListener(){}}});
 });
 await page.goto(process.env.GAME_URL || 'http://127.0.0.1:5175');
 await page.getByRole('button',{name:/Baby Bunny: One Hop/}).click();
 await page.getByRole('button',{name:'Show me one hop',exact:false}).click();
 await page.waitForFunction(()=>document.querySelector('.bunny-stop.landed button')?.textContent==='2');
 assert.ok((await page.evaluate(()=>window.__spoken.join(' '))).includes('Start at 1'));
 await page.getByRole('button',{name:'Number 1',exact:true}).click();
 await page.getByRole('status').filter({hasText:'Let’s try again'}).waitFor();
 assert.match(await page.locator('.bunny-progress').innerText(),/0 of 90/);
 for(let i=0;i<90;i++){
   const start=Number(await page.locator('.bunny-start').innerText());
   assert.ok(start>=1 && start<=14);
   if(i>=50){assert.ok(start+1<15);assert.match(await page.locator(".bunny-equation").innerText(), /\+ 1 = \?/);}
   await page.getByRole('button',{name:`Number ${start+1}`,exact:true}).click();
   await page.locator('.bunny-success').waitFor();
   if(i<89)await page.getByRole('button',{name:'Next exercise →'}).click();
 }
 assert.match(await page.locator('.bunny-progress').innerText(),/90 of 90/);
 await page.reload();
 await page.getByRole('button',{name:/Baby Bunny: One Hop/}).click();
 assert.match(await page.locator('.bunny-progress').innerText(),/90 of 90/);
 const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('nihara-space-v1')));
 assert.equal(save.profiles[0].bunnyDone.length,90);
 assert.deepEqual(save.profiles[0].done,[]);
 await page.getByRole('button',{name:'← Back to games'}).click();
 assert.equal(await page.locator('.playroom-game').count(),9);
 await page.getByRole('button',{name:/40 Add-One Questions/}).click();
 assert.match(await page.locator('.bunny-equation').innerText(),/Extra question 1 \/ 40/);
 await page.getByRole('button',{name:'← Back to games'}).click();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);
 console.log('All 90 one-hop exercises, spoken demo, gentle retry, reload persistence, unchanged mission rewards, existing nine games and phone layout passed.');
} finally {await browser.close();}
