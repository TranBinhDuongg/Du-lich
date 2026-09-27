const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>fs.writeFileSync(path.join(root,p),s,'utf8');
const data=JSON.parse(read('assets/data/tourism.json'));
const selected=[
 ['Rừng tràm Trà Sư','Len theo kênh rạch giữa rừng tràm, ngắm cảnh và tìm hiểu hệ sinh thái đất ngập nước.'],
 ['Chợ nổi Cái Răng','Khởi đầu buổi sáng trên sông, khám phá chợ nổi và thưởng thức hủ tiếu, cà phê trên ghe.'],
 ['Nhà Công tử Bạc Liêu','Ghé dinh thự tại 13 Điện Biên Phủ, tìm hiểu kiến trúc và những câu chuyện về Công tử Bạc Liêu.'],
 ['Chùa Som Rong','Khám phá kiến trúc Khmer và tượng Phật nằm trong khuôn viên chùa.'],
 ['Núi Bà Đen','Đi cáp treo lên núi, tham quan các công trình tâm linh và ngắm cảnh từ trên cao.'],
 ['Vườn quốc gia Bù Gia Mập','Trekking xuyên rừng, khám phá suối và trải nghiệm cắm trại cùng hướng dẫn viên địa phương.']
].map(([name,description])=>{const [id,d]=Object.entries(data.destinations).find(([,d])=>d.name===name);return {id,name,description,region:d.region,image:d.image,imageAlt:d.image.includes('placeholder')?'Minh họa hành trình':d.name,credit:d.imageAttribution||''};});
write('assets/js/featured-destinations.js','// A short editorial selection; the full catalog stays in tourism-data.js.\nwindow.TripMateFeatured='+JSON.stringify(selected,null,2)+';\n');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cards='<div class="journey-track"><section class="intro" id="intro"><div class="tripBlock__introWrapper"><h1 class="tripBlock__title">Điểm đến<br><span>tiêu biểu.</span></h1><p>Một vài gợi ý cho hành trình phương Nam.</p><a class="explore-plan" href="plan.html">Xem tất cả trong phần tạo lịch trình ↗</a></div></section>'+selected.map((d,i)=>`<section class="journey-group" id="day-${i+1}"><figure class="tripImageItem tripBlock__item"><img src="${d.image}" alt="${esc(d.imageAlt)}" loading="lazy">${d.credit?`<figcaption class="sr-only">${esc(d.credit)}</figcaption>`:''}</figure><article class="tripTextItem tripBlock__item"><div class="tripTextItem__wrapper"><p class="explore-category">${esc(d.region)}</p><h2 class="tripTextItem__title">${esc(d.name)}</h2><p class="tripTextItem__desc">${esc(d.description)}</p><a class="explore-plan" href="plan.html?destination=${d.id}">Lên lịch trình ↗</a></div></article></section>`).join('')+'</div>';
let s=read('explore.html').replace(/(<main[\s\S]*?id="journey"[^>]*>)[\s\S]*?<\/main>/,'$1'+cards+'</main>');
write('explore.html',s);
s=read('assets/js/journey.js').replace(/const scenes = window\.TripMateTourism\.routes\.map\([^\n]+/,'const scenes = window.TripMateFeatured.map(d => ({name:d.name,region:d.region,image:d.image,bg:"#173f42",ink:"#e7e7ce",baseline:d.region,description:d.description,destinationId:d.id}));');
write('assets/js/journey.js',s);
s=read('index.html').replace('<script src="assets/js/journey.js?v=word-20260926" defer></script>','<script src="assets/js/featured-destinations.js?v=1" defer></script><script src="assets/js/journey.js?v=featured-1" defer></script>');
write('index.html',s);
const assert=require('node:assert/strict'),vm=require('node:vm');
assert.equal((read('explore.html').match(/class="journey-group"/g)||[]).length,6);
assert.equal(data.routes.length,16);assert.equal(Object.keys(data.destinations).length,107);
new vm.Script(read('assets/js/journey.js'));new vm.Script(read('assets/js/featured-destinations.js'));
console.log('Updated 6 featured places; full 16-route / 107-place catalog preserved.');
