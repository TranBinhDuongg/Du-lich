(() => {
const E=window.TripPlannerEngine,$=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),money=n=>Math.round(n).toLocaleString('vi-VN')+' ₫';
const stopPhotos={"Ngắm cầu Trường Tiền":["hue-truong-tien.jpg","Cầu Trường Tiền"],"Dạo bến Ninh Kiều":["can-tho-ninh-kieu.jpg","Bến Ninh Kiều"],"Biển Mỹ Khê":["da-nang-my-khe.jpg","Bãi biển Mỹ Khê"],"Dạo phố cổ Hội An":["hoi-an.jpg","Phố cổ Hội An"],"Ngắm đèo Mã Pí Lèng":["ma-pi-leng.jpg","Đèo Mã Pí Lèng"],"Tham quan thác Bản Giốc":["ban-gioc.png","Thác Bản Giốc"],"Ngắm Cổng Tò Vò":["ly-son-to-vo.jpg","Cổng Tò Vò"],"Khám phá cảnh quan Hang Câu":["ly-son-hang-cau.jpg","Hang Câu"]};
function stopPhoto(a){const p=stopPhotos[a.name];return p?'<img class="stop-photo" src="assets/images/'+p[0]+'" alt="'+esc(p[1])+'" loading="lazy">':'';}
function show(){
 try{
 const id=new URLSearchParams(location.search).get('id'),records=JSON.parse(localStorage.getItem('tripmate.saved-plans.v1')||'[]');
 const p=Array.isArray(records)?records.find(p=>p.id===id):null;
 if(!p)throw Error('Không tìm thấy lịch trình. Lịch trình chỉ được lưu trên trình duyệt này và có thể đã bị xóa.');
 E.validate(p.input);
 if(!Array.isArray(p.days)||p.days.length!==p.input.days||!p.days.every(d=>Array.isArray(d.activities)&&d.activities.length===3&&d.activities.every(a=>typeof a.name==='string'&&typeof a.time==='string'&&Number.isFinite(a.cost)&&a.cost>=0)))throw Error('Dữ liệu lịch trình không hợp lệ.');
 const d=E.destinations[p.input.destination],c=E.costs(p);
 $('route-content').hidden=false;$('route-error').textContent='';$('route-title').textContent=d.name+' — theo cách của bạn';
 $('route-meta').textContent=p.input.days+' ngày · '+p.input.people+' người · '+p.input.interests.join(' · ');
 $('route-total').textContent=money(c.total);
 $('route-days').innerHTML=p.days.map((day,i)=>'<a href="#route-day-'+(i+1)+'">Ngày '+(i+1)+'</a>').join('');
 $('route-path').innerHTML=p.days.map((day,i)=>'<section class="route-day" id="route-day-'+(i+1)+'"><header><span class="day-marker">'+String(i+1).padStart(2,'0')+'</span><div><p>CHẶNG HÀNH TRÌNH</p><h2>Ngày '+(i+1)+'</h2></div></header><ol>'+day.activities.map((a,j)=>'<li><span class="stop-marker">'+(i*3+j+1)+'</span><article>'+stopPhoto(a)+'<div class="stop-meta"><span>'+esc(a.time)+'</span><span>'+esc(a.tag||'Trải nghiệm')+'</span></div><h3>'+esc(a.name)+'</h3><p>'+(a.cost?money(a.cost)+' / người':'Chi phí trải nghiệm: 0 ₫ (dự toán mẫu)')+'</p></article></li>').join('')+'</ol></section>').join('')+'<div class="route-finish">✓ &nbsp; Kết thúc hành trình · Mang những kỷ niệm về nhà</div>';
 const photo=d.image||(p.input.destination==='halong'?'assets/images/Vinh-ha-long.jpg':null);
 $('route-photo').hidden=!photo;if(photo){$('route-photo').src=photo;$('route-photo').alt=d.name;$('route-photo').hidden=false;}
 for(const [button,target] of [['edit-route','plan.html'],['chat-route','chat.html']])$(button).onclick=()=>{
 try{sessionStorage.setItem('tripmate.current-plan.v1',JSON.stringify({plan:p,dirty:false}));window.TripMateNavigate(target);}catch{$('route-error').textContent='Không thể mở bản chỉnh sửa vì trình duyệt không cho lưu bản nháp.';}
 };
 }catch(e){$('route-content').hidden=true;$('route-title').textContent='Chưa thể mở hành trình';$('route-error').textContent=e.message;}
}

function drawCurves(){
 const ns='http://www.w3.org/2000/svg';
 document.querySelectorAll('.route-day ol').forEach(list=>{
  list.querySelector('.route-curve')?.remove();
  const box=list.getBoundingClientRect();if(!box.width)return;
  const points=[...list.querySelectorAll('.stop-marker')].map(el=>{const r=el.getBoundingClientRect();const card=el.parentElement.querySelector('article').getBoundingClientRect();return{x:card.left-box.left+card.width/2,top:card.top-box.top,bottom:card.bottom-box.top};});
  if(points.length<2)return;
  const svg=document.createElementNS(ns,'svg');svg.classList.add('route-curve');svg.setAttribute('viewBox','0 0 '+box.width+' '+box.height);svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
  let d='';
  for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],mid=(a.bottom+b.top)/2;d+=' M '+a.x+' '+a.bottom+' C '+a.x+' '+mid+', '+b.x+' '+mid+', '+b.x+' '+b.top;}
  for(const cls of ['route-curve-base','route-curve-dashes']){const p=document.createElementNS(ns,'path');p.setAttribute('d',d);p.setAttribute('class',cls);svg.append(p);}
  list.prepend(svg);
 });
}
document.getElementById('route-path').addEventListener('load',scheduleCurves,true);
let curveFrame;
function scheduleCurves(){cancelAnimationFrame(curveFrame);curveFrame=requestAnimationFrame(drawCurves);}
new ResizeObserver(scheduleCurves).observe(document.getElementById('route-path'));
document.fonts?.ready.then(scheduleCurves);


show();scheduleCurves();window.addEventListener('storage',e=>{if(e.key==='tripmate.saved-plans.v1'){show();scheduleCurves();}});
})();
