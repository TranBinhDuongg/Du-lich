const {test}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const {handler,generate,validateDays,validateCompleteSchedule}=require('./server');
const E=require('./assets/js/planner-engine');
const input={destination:E.defaultDestination,days:2,people:2,budget:3000000,interests:['Văn hóa']};
const days=[1,2].map(n=>({title:'Ngày '+n,activities:['Ăn sáng','Di chuyển','Tham quan','Ăn trưa','Nghỉ ngơi','Ăn tối',...(n===1?['Lưu trú']:[])].map((tag,i)=>({name:tag,tag,time:String(6+i*2).padStart(2,'0')+':00',note:'Gợi ý tham khảo, cần xác nhận',cost:100000,destinationId:E.defaultDestination,location:'Khu trung tâm',travelGuidance:'Taxi khoảng 15 phút'}))}));
const estimates={stay:400000,food:300000,transport:200000,activities:200000,reserve:100000};
const mock=data=>async()=>({ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(data)}]}}]})});
test('create, edit, and question preserve itinerary contracts',async()=>{
  process.env.GEMINI_API_KEY='test-key';
  const created=await generate({action:'plan',input},mock({reply:'Đã tạo',updatePlan:true,days,estimates,suggestions:['Ăn gì?']}));
  assert.equal(created.plan.days.length,2);assert.equal(created.plan.routeId,null);
  assert.equal(E.costs(created.plan).total,2400000);
  const current={...created.plan,id:'saved-trip'};
  const question=await generate({action:'chat',plan:current,message:'Ngày 1 đi đâu?'},mock({reply:'Tham quan',updatePlan:false,days:[],estimates,suggestions:[]}));
  assert.equal(question.plan,null);
  const edited=await generate({action:'chat',plan:current,message:'Đổi ngày 1'},mock({reply:'Đã đổi',updatePlan:true,days,estimates,suggestions:[]}));
  assert.equal(edited.plan.id,'saved-trip');assert.equal(edited.plan.revision,2);
});
test('invalid AI response cannot replace a saved plan',async()=>{
  assert.throws(()=>validateDays([],input));
  assert.throws(()=>validateDays(days.map(d=>({...d,activities:[{...d.activities[0],cost:-1}]})),input));
  assert.throws(()=>validateDays(days.map(d=>({...d,activities:[{...d.activities[0],destinationId:'unknown'}]})),input));
  await assert.rejects(generate({action:'plan',input},mock({reply:'OK',updatePlan:true,days,estimates:{...estimates,stay:-1}})));
});
test('complete schedules require meals, overnight stay and transport details',()=>{
  assert.doesNotThrow(()=>validateCompleteSchedule(days));
  for(const tag of ['Ăn sáng','Ăn trưa','Ăn tối','Di chuyển','Tham quan','Nghỉ ngơi','Lưu trú']){
    assert.throws(()=>validateCompleteSchedule(days.map((d,i)=>({...d,activities:i===0?d.activities.filter(a=>a.tag!==tag):d.activities}))));
  }
  assert.throws(()=>validateCompleteSchedule(days.map(d=>({...d,activities:d.activities.map(a=>({...a,location:''}))}))));
  assert.doesNotThrow(()=>validateCompleteSchedule([{...days[1],number:1}]));
});
test('incomplete generated schedule is repaired before being returned',async()=>{
  process.env.GEMINI_API_KEY='test-key';let calls=0;
  const result=await generate({action:'plan',input,tripDetails:{origin:'TP. Hồ Chí Minh',transport:'Xe khách'}},async(url,options)=>{
    calls++;const request=JSON.parse(JSON.parse(options.body).contents.at(-1).parts[0].text);
    assert.equal(request.tripDetails.origin,'TP. Hồ Chí Minh');
    const schedule=calls===1?days.map((d,i)=>({...d,activities:i===0?d.activities.filter(a=>a.tag!=='Ăn sáng'):d.activities})):days;
    return mock({reply:'Đã tạo',updatePlan:true,days:schedule,estimates,suggestions:[]})();
  });
  assert.equal(calls,2);assert.equal(result.plan.completeSchedule,true);
  assert.equal(result.plan.tripDetails.transport,'Xe khách');
});
test('request uses the supported REST structured-output format',async()=>{
  process.env.GEMINI_API_KEY='test-key';
  await generate({action:'chat',message:'Xin chào'},async(url,options)=>{
    const config=JSON.parse(options.body).generationConfig;
    assert.equal(config.responseFormat.text.mimeType,'APPLICATION_JSON');
    assert.equal(config.responseFormat.text.schema.type,'object');
    assert.equal(config.responseFormat.text.schema.properties.days.items.type,'object');
    assert.equal(config.responseSchema,undefined);
    return mock({reply:'Xin chào',updatePlan:false,suggestions:[],days:[],estimates})()
  });
});
test('configuration, invalid input and quota failures are explicit',async()=>{
  process.env.GEMINI_API_KEY='';
  await assert.rejects(generate({action:'plan',input}),/Chưa cấu hình/);
  process.env.GEMINI_API_KEY='test-key';
  await assert.rejects(generate({action:'plan',input:{...input,days:0}}),/Số ngày/);
  await assert.rejects(generate({action:'chat',message:''}),/Câu hỏi/);
  await assert.rejects(generate({action:'plan',input},async()=>({ok:false,status:429})),/hạn mức/);
  await assert.rejects(generate({action:'plan',input},async()=>({ok:false,status:401})),/xác thực/);
});
test('temporary overload retries and then returns the response',async()=>{
  process.env.GEMINI_API_KEY='test-key';let calls=0;
  const result=await generate({action:'chat',message:'Xin chào'},async()=>{
    calls++;return calls===1?{ok:false,status:503}:mock({reply:'Xin chào',updatePlan:false,suggestions:[],days:[],estimates})();
  });
  assert.equal(calls,2);assert.equal(result.reply,'Xin chào');
});
test('public pages are available, configuration and sources are private',async()=>{
  const server=http.createServer(handler);
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  try{
    for(const page of ['/','/plan.html','/chat.html','/saved.html','/route.html','/assets/js/workspace.js'])assert.equal((await fetch(origin+page)).status,200);
    for(const file of ['/.env','/server.js','/package.json','/.git/config','/assets/../.env','/assets/%2e%2e%5c.env'])assert.equal((await fetch(origin+file)).status,404);
    assert.equal((await fetch(origin+'/api/gemini')).status,405);
    assert.equal((await fetch(origin+'/api/gemini',{method:'POST',headers:{'content-type':'application/json',origin:'http://evil.example'},body:'{}'})).status,403);
    assert.equal((await fetch(origin+'/api/gemini',{method:'POST',headers:{'content-type':'application/json'},body:'broken'})).status,400);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
