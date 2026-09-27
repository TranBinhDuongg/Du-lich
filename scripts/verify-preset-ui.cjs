const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const {chromium} = require('playwright');
const E = require('../assets/js/planner-engine.js');
(async () => {
 const browser = await chromium.launch({channel:'msedge',headless:true});
 try {
  const page = await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve('plan.html')).href);
  for(const r of E.routes){
   await page.selectOption('[name=routeId]',r.id);
   assert.ok((await page.locator('#preset-overview').innerText()).includes(r.name));
   await page.fill('[name=people]','4');
   await page.locator('#studio-form button[type=submit]').click();
   assert.equal(await page.locator('[data-day]').count(),r.duration);
   assert.equal(await page.locator('#destination-title').innerText(),r.name);
   assert.equal(await page.locator('#form-error').innerText(),'');
   assert.ok(!/Nguồn:|Nguồn ảnh|\.docx/.test(await page.locator('body').innerText()));
  }
  await page.locator('#save-plan').click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('tripmate.saved-plans.v1'))[0]);
  assert.equal(saved.input.people,4);
  assert.deepEqual(saved.days,E.routes.at(-1).days);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.selectOption('[name=routeId]','ben-tre-2n1d');
  await page.locator('#studio-form').scrollIntoViewIfNeeded();
  await page.screenshot({path:'artifacts/preset-form-mobile.png',fullPage:false});
  await page.goto(pathToFileURL(path.resolve('route.html')).href+'?id='+saved.id);
  assert.ok(!/Nguồn:|Nguồn ảnh|\.docx/.test(await page.locator('body').innerText()));
  assert.deepEqual(errors,[]);
  console.log('PASS: 16 preset selections, fixed days and activities, save/reopen, source banners removed, mobile fits.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
