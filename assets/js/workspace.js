(() => {
'use strict';
const E=window.TripPlannerEngine,$=id=>document.getElementById(id),form=$('studio-form'),key='tripmate.saved-plans.v1';
const money=n=>Math.round(n).toLocaleString('vi-VN')+' ₫';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const colors={halong:'#557f80',danang:'#497d9a',hanoi:'#897060',dalat:'#607965'};
Object.entries(E.destinations).forEach(([id,d])=>{colors[id]=d.color||colors[id]||'#557f80';});
const icons={'Ẩm thực':'♧','Biển':'≈','Thiên nhiên':'❋','Văn hóa':'⌂','Check-in':'◎'};
const screen=document.body.dataset.screen||'plan',draftKey='tripmate.current-plan.v1';
let plan,day=1,dirty=true,toastTimer;
function keep(){try{sessionStorage.setItem(draftKey,JSON.stringify({plan,dirty}));}catch{toast('Không thể giữ bản nháp khi chuyển trang. Hãy lưu hành trình trước.');}}
function go(page){keep();window.TripMateNavigate?window.TripMateNavigate(page+'.html'):location.href=page+'.html';}
function restore(){try{const state=JSON.parse(sessionStorage.getItem(draftKey));if(!state?.plan)return false;E.validate(state.plan.input);E.costs(state.plan);if(!Array.isArray(state.plan.days)||state.plan.days.length!==state.plan.input.days||!state.plan.days.every(d=>d.activities?.length===3))return false;plan=state.plan;dirty=state.dirty;return true;}catch{return false;}}


function animate(el){el?.animate?.([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'});}
function toast(text){$('studio-toast').textContent=text;$('studio-toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('studio-toast').hidden=true,3500);}
function read(){
 try{return JSON.parse(localStorage.getItem(key)||'[]').filter(p=>{try{E.validate(p.input);return typeof p.id==='string'&&p.days.length===p.input.days&&p.days.every(d=>d.activities.length===3&&d.activities.every(a=>typeof a.name==='string'&&typeof a.tag==='string'&&typeof a.time==='string'&&Number.isFinite(a.cost)&&a.cost>=0));}catch{return false;}}).slice(0,50);}catch{return [];}
}
function write(records){try{localStorage.setItem(key,JSON.stringify(records));return true;}catch{toast('Không thể lưu trên trình duyệt này. Vui lòng kiểm tra dung lượng lưu trữ.');return false;}}
function input(){if(!form)return {destination:"halong",days:3,people:2,budget:3000000,interests:["Ẩm thực","Biển","Check-in"]};const f=new FormData(form);return {destination:f.get('destination'),days:Number(f.get('days')),people:Number(f.get('people')),budget:Number(f.get('budget')),interests:f.getAll('interests')};}
function populate(){if(!form)return;for(const k of ['destination','days','people','budget'])form.elements[k].value=plan.input[k];form.querySelectorAll('[name=interests]').forEach(x=>x.checked=plan.input.interests.includes(x.value));}
function renderDay(){if(!$("day-tabs"))return;
 $('day-tabs').innerHTML=plan.days.map((d,i)=>'<button type="button" data-day="'+(i+1)+'" class="'+(day===i+1?'active':'')+'" aria-pressed="'+(day===i+1)+'">Ngày '+(i+1)+'</button>').join('');
 $('day-content').innerHTML='<div class="day-topline"><div><small>KHÁM PHÁ THEO NHỊP CỦA BẠN</small><h3>Ngày '+day+' · '+esc(E.destinations[plan.input.destination].name)+'</h3></div><button type="button" id="swap-day">↻ Đổi địa điểm</button></div>'+
 plan.days[day-1].activities.map(a=>'<article class="activity-card"><span class="activity-icon" aria-hidden="true">'+(icons[a.tag]||'✧')+'</span><div><span class="activity-time">'+esc(a.time)+'</span><h4>'+esc(a.name)+'</h4><div class="activity-footer"><span class="activity-tag">'+esc(a.tag)+'</span><span class="activity-cost">'+(a.cost?money(a.cost)+'/người':'Miễn phí tham quan')+'</span></div></div></article>').join('')+
 '<p class="day-tip">✧ Dành một chút khoảng trống cho những điều bất ngờ. Bạn có thể đổi địa điểm bất cứ lúc nào.</p>';
 animate($('day-content'));
}
function render(){
 const v=plan.input,c=E.costs(plan),name=E.destinations[v.destination].name;
 if($('destination-title')){ $('destination-title').textContent=name;$('trip-meta').textContent=v.days+' ngày · '+v.people+' người · '+v.interests.join(' & ');
 const photo=E.destinations[v.destination].image||(v.destination==='halong'?'assets/images/Vinh-ha-long.jpg':null);$('destination-image').hidden=!photo;if(photo)$('destination-image').src=photo;$('destination-image').alt='Phong cảnh '+name;
 document.querySelector('.destination-cover').style.background='linear-gradient(125deg,'+colors[v.destination]+',#293d4c)';
 }
 if($('chat-trip-title')){$('chat-trip-title').textContent=name;$('chat-trip-meta').textContent=v.days+' ngày · '+v.people+' người · '+money(c.total)+' dự kiến';}
 if($('budget-number')){ $('budget-number').innerHTML=money(c.total)+' <small>/ cả nhóm</small>';
 $('budget-meter-fill').style.width=Math.min(100,c.total/c.budgetTotal*100)+'%';
 $('budget-status').classList.toggle('over',c.over);
 $('budget-status').textContent=c.over?'Vượt ngân sách '+money(c.total-c.budgetTotal):'Còn dư '+money(c.budgetTotal-c.total)+' so với ngân sách';
 const names={stay:'Lưu trú',food:'Ăn uống',transport:'Di chuyển tại điểm đến',activities:'Trải nghiệm',reserve:'Dự phòng'};
 $('budget-brief').innerHTML=Object.entries(c.perPerson).map(([k,n])=>'<div><span>'+names[k]+'</span><strong>'+money(n*v.people)+'</strong></div>').join('');
 if($('budget-content')) $('budget-content').innerHTML='<span class="overline">MỌI KHOẢN CHI, THẬT RÕ RÀNG</span><h3>Dự toán chuyến đi</h3><p>Ước tính cho '+v.people+' người · '+v.days+' ngày</p>'+Object.entries(c.perPerson).map(([k,n])=>'<div class="cost-row"><div><span>'+names[k]+'</span><strong>'+money(n*v.people)+'</strong></div><div class="bar"><span style="width:'+Math.round(n*v.people/c.total*100)+'%"></span></div></div>').join('')+'<div class="cost-total"><span>Tổng dự kiến</span><strong>'+money(c.total)+'</strong></div><p>'+money(c.totalPerPerson)+' / người. Chi phí minh họa, chưa gồm vé đến điểm đến.</p>';
 $('save-plan').textContent=dirty?'♡ Lưu hành trình':'✓ Đã lưu hành trình';
 }
 if($('draft-label')) $('draft-label').textContent=dirty?'Bản nháp · chưa lưu':'Đã lưu trên trình duyệt';
 $('saved-count').textContent=read().length;renderDay();keep();
}
function bubble(text,user=false){if(!$('studio-messages'))return;const el=document.createElement('div');el.className='chat-bubble'+(user?' user':'');el.textContent=text;$('studio-messages').append(el);animate(el);document.getElementById("studio-messages").scrollTop=document.getElementById("studio-messages").scrollHeight;}
function ask(text){
 if(!text.trim())return;bubble(text,true);
 try{const result=E.command(plan,text);if(result){if(result.plan){plan=result.plan;dirty=true;const n=text.match(/ngày\s*(\d+)/i);if(n)day=Math.min(plan.days.length,Number(n[1]));render();}bubble(result.reply);}else bubble('Mình có thể điều chỉnh lịch trình bạn đang xem. Hãy thử “Đổi địa điểm ngày 2” hoặc “Giảm chi phí”. Để đổi điểm đến, số người hoặc ngân sách, hãy chỉnh thông tin chuyến đi rồi chọn Tạo lịch trình. Đây là trợ lý demo theo kịch bản.');}
 catch(e){bubble(e.message);}
}
function saved(){
 const records=read();$('saved-count').textContent=records.length;
 $('studio-saved').innerHTML=records.length?records.map(p=>'<article class="saved-tile"><div class="saved-art" style="background:'+colors[p.input.destination]+'">'+((E.destinations[p.input.destination].image||p.input.destination==='halong')?'<img src="'+(E.destinations[p.input.destination].image||'assets/images/Vinh-ha-long.jpg')+'" alt="'+esc(E.destinations[p.input.destination].name)+'">':'')+'<span>'+esc(E.destinations[p.input.destination].name)+'</span></div><div class="saved-body"><p>'+p.input.days+' ngày · '+p.input.people+' người</p><h3>'+esc(E.destinations[p.input.destination].name)+' theo cách của bạn</h3><p>'+p.input.interests.map(esc).join(' · ')+'</p><strong class="saved-total">'+money(E.costs(p).total)+'</strong><div class="saved-actions"><button data-open="'+esc(p.id)+'">Mở hành trình ↗</button><button class="delete" data-delete="'+esc(p.id)+'" aria-label="Xóa lịch trình '+esc(E.destinations[p.input.destination].name)+'">Xóa</button></div></div></article>').join(''):'<div class="empty-library"><span>♡</span><h3>Những chuyến đi đang chờ bạn.</h3><p>Tạo một lịch trình và nhấn Lưu hành trình để giữ lại ở đây.</p><button data-page="plan">Tạo hành trình đầu tiên ↗</button></div>';
}
function route(){
 document.querySelectorAll('[data-nav]').forEach(a=>{const active=a.dataset.nav===screen;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');});
 $('page-title').innerHTML=screen==='saved'?'Những hành trình, <em>để dành.</em>':screen==='chat'?'Một lời nhắn, <em>mở lối đi.</em>':'Một chuyến đi, <em>thật riêng.</em>';
 $('page-subtitle').textContent=screen==='saved'?'Những kế hoạch đã lưu, sẵn sàng cho ngày lên đường.':screen==='chat'?'Một không gian riêng để trò chuyện và điều chỉnh hành trình của bạn.':'Chọn điều bạn thích. Sắp xếp một hành trình theo cách của riêng bạn.';
 if(screen==='saved')saved();
}


form?.addEventListener('submit',e=>{e.preventDefault();try{const next=E.generate(input());next.id=plan?.id||null;plan=next;day=1;dirty=true;$('form-error').textContent='';render();toast('Lịch trình mới đã sẵn sàng.');}catch(err){$('form-error').textContent=err.message;}});
$('day-tabs')?.addEventListener('click',e=>{const b=e.target.closest('[data-day]');if(b){day=Number(b.dataset.day);renderDay();$('day-tabs').querySelector('[data-day="'+day+'"]').focus();}});
$('day-content')?.addEventListener('click',e=>{if(e.target.closest('#swap-day')){plan=E.changeDay(plan,day);dirty=true;render();$('swap-day').focus();toast('Đã đổi địa điểm ngày '+day+'.');}});
$('reduce-cost')?.addEventListener('click',()=>ask('Giảm chi phí'));
$('save-plan')?.addEventListener('click',()=>{
 const records=read(),record=JSON.parse(JSON.stringify(plan));record.id=record.id||(crypto.randomUUID?crypto.randomUUID():'trip-'+Date.now());record.savedAt=new Date().toISOString();
 if(write([record,...records.filter(p=>p.id!==record.id)].slice(0,50))){plan=record;dirty=false;render();toast('Đã lưu hành trình trên trình duyệt này.');}
});
$('studio-saved')?.addEventListener('click',e=>{
 const open=e.target.closest('[data-open]'),del=e.target.closest('[data-delete]');
 if(open){const url='route.html?id='+encodeURIComponent(open.dataset.open);window.TripMateNavigate?window.TripMateNavigate(url):location.href=url;}
 if(del){if(write(read().filter(p=>p.id!==del.dataset.delete))){if(plan.id===del.dataset.delete){plan.id=null;dirty=true;render();}saved();toast('Đã xóa lịch trình khỏi danh sách lưu.');}}
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b)go(b.dataset.page);const q=e.target.closest('[data-question]');if(q)ask(q.dataset.question);});
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{
 document.querySelectorAll('[data-tab]').forEach(t=>{const active=t===b;t.classList.toggle('selected',active);t.setAttribute('aria-selected',active);});
 $('timeline-content').hidden=b.dataset.tab!=='timeline';$('budget-content').hidden=b.dataset.tab!=='budget';animate($(b.dataset.tab+'-content'));
}));
$('studio-chat-form')?.addEventListener('submit',e=>{e.preventDefault();const text=$('studio-chat-input').value;$('studio-chat-input').value='';ask(text);});
$('focus-chat')?.addEventListener('click',()=>go('chat'));
$('new-trip')?.addEventListener('click',()=>{form?.reset();plan=E.generate(input());day=1;dirty=true;render();go('plan');toast('Bắt đầu bản nháp mới. Hãy chọn sở thích của bạn.');});
document.querySelectorAll('a[href="plan.html"],a[href="chat.html"],a[href="saved.html"]').forEach(a=>a.addEventListener('click',()=>keep()));
if(!restore())plan=E.generate(input());populate();render();route();
bubble('Xin chào! Mình sẵn sàng điều chỉnh hành trình hiện tại của bạn. Hãy mở trang Tạo lịch trình để đổi thông tin hoặc nhắn mình để đổi địa điểm, giảm chi phí nhé. ✧');
document.querySelectorAll('.page-intro,.request-panel,.itinerary-column,.assistant-column').forEach((el,i)=>setTimeout(()=>animate(el),i*70));
})();


