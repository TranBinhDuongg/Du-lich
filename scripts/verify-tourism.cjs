const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
for(const f of fs.readdirSync(path.join(root,'assets/js')).filter(f=>f.endsWith('.js'))){new vm.Script(fs.readFileSync(path.join(root,'assets/js',f),'utf8'),{filename:f});}
const E=require('../assets/js/planner-engine.js');
assert.equal(E.routes.length,16);assert.equal(E.provinces.length,18);assert.equal(Object.keys(E.destinations).length,107);
assert.equal(E.sources.length,8);
for (const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))) {
 const html=fs.readFileSync(path.join(root,file),'utf8');
 for(const match of html.matchAll(/(?:src|href)="(assets\/[^"?#]+)(?:[?#][^"]*)?"/g))assert.ok(fs.existsSync(path.join(root,match[1])),file+': '+match[1]);
}
for(const d of Object.values(E.destinations))assert.ok(fs.existsSync(path.join(root,d.image)),d.name);
for(const r of E.routes)assert.ok(fs.existsSync(path.join(root,r.image)),r.id);
assert.ok(!E.meals.some(a=>a.name==='Đến Khu lưu niệm Nhạc sĩ Cao Văn Lầu.'));

const defaults={destination:E.defaultDestination,days:2,people:2,budget:3000000,interests:['Văn hóa']};
for(const route of E.routes){
 assert.ok(route.destinationIds.length,route.id);
 const plan=E.generate({...defaults,routeId:route.id});
 assert.equal(plan.days.length,route.duration);
 assert.equal(plan.input.days,route.duration);
 for(const day of plan.days){
  assert.ok(day.activities.length,route.id);
  for(const a of day.activities){assert.ok(a.time&&a.name&&a.note,route.id+': missing activity content');assert.ok(E.sources.some(s=>s.name===a.sourceFile),'source');for(const id of a.destinationIds)assert.ok(E.destinations[id],id);}
 }
 assert.deepEqual(E.scheduleDay(plan,0),route.days[0].activities);
 assert.ok(!Number.isNaN(E.costs(plan).total));
}
assert.equal(E.costs(E.generate({...defaults,routeId:'an-giang-2n1d'})).total,null);
assert.equal(E.costs(E.generate({...defaults,routeId:'can-tho-2n1d'})).total,4200000);
assert.equal(E.costs(E.generate({...defaults,routeId:'bac-lieu-2n1d'})).total,null);
assert.equal(E.costs(E.generate({...defaults,routeId:'bac-lieu-2n1d',people:20})).total,45800000);
assert.equal(E.generate({...defaults,routeId:'ho-chi-minh-5n4d'}).days[2].activities.some(a=>a.name.includes('Đảo Khỉ')),false);
assert.ok(E.routes.find(r=>r.id==='ha-tien-2n1d').days[0].activities.some(a=>a.time.includes('cần xác nhận')));
const bot=require('../assets/js/chatbot.js').create(E);
assert.match(bot.respond(null,'Lịch trình Cần Thơ 2 ngày').reply,/Cái Răng/);
assert.match(bot.respond(null,'Giá tour Bạc Liêu').reply,/20 khách/);
assert.match(bot.respond(null,'Đà Nẵng có gì chơi?').reply,/chưa tìm thấy/);
assert.match(bot.respond(null,'Giá tour Đà Nẵng').reply,/chưa tìm thấy/);
assert.match(bot.respond(null,'Ăn gì ở Cần Thơ?').reply,/lẩu mắm/);
assert.match(bot.respond(null,'Có những tuyến du lịch nào?').reply,/16 tuyến/);
// Migration deletes old app records without touching unrelated storage or future new plans.
const storage=()=>{const m=new Map([['tripmate.saved-plans.v1','old'],['unrelated','keep']]);return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};
const context={TripMateTourism:E,localStorage:storage(),sessionStorage:storage()};context.window=context;
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/planner-engine.js'),'utf8'),context);
assert.equal(context.localStorage.getItem('tripmate.saved-plans.v1'),null);assert.equal(context.localStorage.getItem('unrelated'),'keep');
context.localStorage.setItem('tripmate.saved-plans.v1','new');
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/planner-engine.js'),'utf8'),context);
assert.equal(context.localStorage.getItem('tripmate.saved-plans.v1'),'new');
console.log('PASS: syntax, 16 routes, provenance, source schedules, unknown/group prices, chatbot, storage migration.');
if(!process.argv.includes('--browser'))process.exit(0);
(async()=>{
 const http=require('node:http');
 const {createRequire}=require('node:module');
 const dep=createRequire('C:/Users/nlhel.PERUSI/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/runtime.cjs');
 const {chromium}=dep('playwright');
 const server=http.createServer((req,res)=>{
  let filename=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!filename.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(fs.existsSync(filename)&&fs.statSync(filename).isDirectory())filename=path.join(filename,'index.html');
  if(!fs.existsSync(filename)){res.writeHead(404).end();return;}
  const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'};
  res.setHeader('Content-Type',(mime[path.extname(filename)]||'application/octet-stream')+'; charset=utf-8');res.end(fs.readFileSync(filename));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{
  const exe=['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
  browser=await chromium.launch({headless:true,...(exe?{executablePath:exe}:{})});
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const url='http://127.0.0.1:'+server.address().port;
  for(const f of ['index.html','explore.html','chat.html','saved.html','plan.html']){await page.goto(url+'/'+f);await page.waitForTimeout(150);assert.equal(errors.length,0,f+': '+errors.join('; '));}
  for(const route of E.routes){
    await page.goto(url+'/plan.html?route='+route.id);
    assert.equal(await page.locator('[name=routeId]').inputValue(),route.id);
    assert.equal(await page.locator('[name=days]').inputValue(),String(route.duration));
    assert.equal(await page.locator('#day-content .activity-card').count(),route.days[0].activities.length);
  }
  await page.goto(url+'/plan.html?route=can-tho-2n1d');
  assert.match(await page.locator('#destination-title').innerText(),/Cần Thơ/);
  assert.equal(await page.locator('[name=routeId]').inputValue(),'can-tho-2n1d');
  assert.equal(await page.locator('[name=days]').inputValue(),'2');
  await page.locator('#save-plan').click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('tripmate.saved-plans.v1')));
  assert.equal(saved.length,1);
  await page.goto(url+'/saved.html');assert.match(await page.locator('body').innerText(),/Bình Thủy|Cần Thơ/);
  await page.goto(url+'/route.html?id='+saved[0].id);assert.match(await page.locator('#route-path').innerText(),/05:00|5:30/);
  await page.goto(url+'/plan.html?route=bac-lieu-2n1d');assert.match(await page.locator('#budget-number').innerText(),/Chưa có giá/);
  await page.locator('[name=people]').fill('20');await page.locator('#studio-form').evaluate(f=>f.requestSubmit());
  assert.match(await page.locator('#budget-number').innerText(),/45\.800\.000/);
  await page.reload();assert.match(await page.locator('#destination-title').innerText(),/Bạc Liêu/);
  await page.locator('[name=province]').selectOption('Bình Phước');assert.equal(await page.locator('[name=routeId]').inputValue(),'');
  await page.locator('#studio-form').evaluate(f=>f.requestSubmit());assert.match(await page.locator('#destination-title').innerText(),/Bà Rá/);
  assert.equal(errors.length,0,errors.join('; '));
  fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});
  await page.goto(url+'/plan.html?route=can-tho-2n1d');await page.screenshot({path:path.join(root,'artifacts/tourism-plan.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.goto(url+'/explore.html');await page.screenshot({path:path.join(root,'artifacts/tourism-explore-mobile.png'),fullPage:true});
  assert.equal(errors.length,0,errors.join('; '));
  console.log('PASS: five pages, route picker, save/reload, route view, price conditions, custom province selection, desktop/mobile screenshots.');
 } finally {await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
