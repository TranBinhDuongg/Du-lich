// Build exclusively from the eight imported Word sources. Paragraph references are zero-based.
const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(base,p),'utf8').replace(/^\uFEFF/,'');
const write = (p,s) => fs.writeFileSync(path.join(base,p),s,'utf8');
const sources = JSON.parse(read('assets/data/tourism-sources.json'));
const slug = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const groups = {
 'An Giang': 'Quần thể di tích Núi Sam|Miếu Bà Chúa Xứ Núi Sam|Lăng Thoại Ngọc Hầu|Chùa Tây An|Rừng tràm Trà Sư|Núi Cấm|Chợ Tịnh Biên',
 'Cần Thơ': 'Nhà cổ Bình Thủy|Chùa Ông|Bến Ninh Kiều|Chợ nổi Cái Răng|Làng du lịch Mỹ Khánh',
 'Hậu Giang': 'Lung Ngọc Hoàng|Công viên Xà No|Thiền viện Trúc Lâm Hậu Giang|Khu di tích Chương Thiện',
 'Long An': 'Hàng cau vua Tân Trụ|Làng nổi Tân Lập|Cánh Đồng Bất Tận|Mộc Hoa Tràm',
 'Tiền Giang': 'Chùa Vĩnh Tràng|Cồn Thới Sơn|Làng cổ Đông Hòa Hiệp|Trại rắn Đồng Tâm|Bến tàu 30/4|Mê Kông Rest Stop',
 'Bến Tre': 'Cồn Phụng|Sân chim Vàm Hồ|Vườn trái cây Cái Mơn|Chợ Lách|Lò làm kẹo dừa',
 'Bạc Liêu': 'Quán Âm Phật Đài|Chùa Xiêm Cán|Vườn nhãn cổ Bạc Liêu|Cây xoài di sản|Nhà máy Điện gió Bạc Liêu|Quảng trường Hùng Vương|Nhà Công tử Bạc Liêu|Khu lưu niệm Nhạc sĩ Cao Văn Lầu|Nhà hát Ba Nón Lá|Nhà thờ Tắc Sậy',
 'Trà Vinh': 'Chùa Vàm Ray|Ao Bà Om|Chùa Âng|Bảo tàng Văn hóa dân tộc Khmer',
 'Vĩnh Long': 'Cù lao An Bình|Làng nghề gạch gốm Măng Thít',
 'Đồng Tháp': 'Nhà cổ Huỳnh Thủy Lê|Làng hoa Sa Đéc|Khu di tích Nguyễn Sinh Sắc|Khu di tích Xẻo Quít',
 'Sóc Trăng': "Chùa Som Rong|Chùa Dơi|Chùa Chén Kiểu|Chùa Đất Sét|Hồ Nước Ngọt|Quảng trường Bạch Đằng|Chùa Kh’leang|Bảo tàng Văn hóa Khmer|Chùa Phật Học 2|Tân Huê Viên",
 'TP.HCM': 'Bảo tàng Chứng tích Chiến tranh|Chùa Bà Thiên Hậu|Chợ Bình Tây|Dinh Thống Nhất|Nhà thờ Đức Bà|Bưu điện Thành phố|Địa đạo Củ Chi|Đảo Khỉ Cần Giờ|Rừng Sác|Bãi biển 30 tháng 04|Chợ hải sản Cần Giờ',
 'Bà Rịa - Vũng Tàu': 'Suối khoáng Bình Châu|Biển Hồ Cốc|Khu du lịch Hồng Hà',
 'Kiên Giang': 'Thạch Động|Lăng Mạc Cửu|Biển Mũi Nai|Đền Nguyễn Trung Trực|Bãi Nò|Chợ đêm Hà Tiên',
 'Cà Mau': 'Vườn quốc gia U Minh Hạ|Khu du lịch Mũi Cà Mau|Cột cờ Hà Nội tại Đất Mũi|Đền thờ Lạc Long Quân và tượng Mẹ Âu Cơ|Chợ Năm Căn|Khu tưởng niệm Chủ tịch Hồ Chí Minh|Chùa Monivongsa Bopharam',
 'Tây Ninh': 'Tòa Thánh Tây Ninh|Núi Bà Đen|Thung lũng Ma Thiên Lãnh|Hồ Đá|Hồ Dầu Tiếng',
 'Bình Dương': 'Khu du lịch Đại Nam|Nhà thờ Chánh tòa Phú Cường|Chùa Hội Khánh|Công viên Bạch Đằng|Vườn Nhà Gốm|Vườn cây ăn trái Lái Thiêu|Khu du lịch Thủy Châu',
 'Bình Phước': 'Núi Bà Rá|Đồi Bằng Lăng|Hồ Thác Mơ|Vườn quốc gia Bù Gia Mập|Suối Giác Mại|Trảng cỏ Bù Lạch|Rừng cao su Bình Phước'
};
const aliases = {
 'Quần thể di tích Núi Sam':['núi sam'], 'Chợ nổi Cái Răng':['chợ nổi cái răng'], 'Làng du lịch Mỹ Khánh':['mỹ khánh'],
 'Khu di tích Chương Thiện':['chương thiện'], 'Cồn Thới Sơn':['cù lao thới sơn','cồn thới sơn'],
 'Sân chim Vàm Hồ':['vàm hồ'], 'Vườn trái cây Cái Mơn':['cái mơn'], 'Lò làm kẹo dừa':['kẹo dừa'],
 'Cây xoài di sản':['cây xoài'], 'Nhà máy Điện gió Bạc Liêu':['điện gió','phong điện'],
 'Nhà Công tử Bạc Liêu':['nhà công tử','dinh thự công tử'], 'Khu lưu niệm Nhạc sĩ Cao Văn Lầu':['cao văn lầu'],
 'Nhà hát Ba Nón Lá':['nón lá'], 'Làng nghề gạch gốm Măng Thít':['măng thít'],
 'Khu di tích Nguyễn Sinh Sắc':['nguyễn sinh sắc'], 'Khu di tích Xẻo Quít':['xẻo quít','xéo quít'],
 'Chùa Kh’leang':["kh'leang",'khleang'], 'Dinh Thống Nhất':['dinh thống nhất'],
 'Đảo Khỉ Cần Giờ':['đảo khỉ'], 'Bưu điện Thành phố':['bưu điện thành phố'],
 'Suối khoáng Bình Châu':['bình châu'], 'Biển Hồ Cốc':['hồ cốc'],
 'Biển Mũi Nai':['mũi nai'], 'Khu du lịch Mũi Cà Mau':['mũi cà mau','đất mũi'],
 'Cột cờ Hà Nội tại Đất Mũi':['cột cờ hà nội'], 'Đền thờ Lạc Long Quân và tượng Mẹ Âu Cơ':['lạc long quân'],
 'Khu du lịch Đại Nam':['đại nam'], 'Nhà thờ Chánh tòa Phú Cường':['phú cường'],
 'Vườn cây ăn trái Lái Thiêu':['vườn cây ăn trái lái thiêu'], 'Khu du lịch Thủy Châu':['thủy châu'],
 'Hồ Thác Mơ':['thác mơ'], 'Rừng cao su Bình Phước':['rừng cao su']
};
const tag = text => /(?:^|[\s:–|])(ăn|ẩm thực|bữa|thực đơn)/i.test(text) ? 'Ẩm thực' : /di chuyển|khởi hành|lên xe|đón khách|trả khách/i.test(text) ? 'Di chuyển' : /khách sạn|nhận phòng|trả phòng|nghỉ đêm/i.test(text) ? 'Lưu trú' : /biển|bãi|hải sản/i.test(text) ? 'Biển' : /rừng|vườn|suối|hồ|cồn|cù lao|núi|cây/i.test(text) ? 'Thiên nhiên' : 'Văn hóa';
const destinations = {};
for (const [region,names] of Object.entries(groups)) for (const name of names.split('|')) {
 const id = slug(region+' '+name);
 destinations[id]={name,region,aliases:aliases[name]||[name],description:'',color:'#557f80',image:'assets/images/tourism-placeholder.svg',stay:null,food:null,transport:null,places:[],sources:[]};
}
const specs = [
 [0,1,25,'an-giang-2n1d','An Giang · Châu Đốc – Trà Sư – Núi Cấm',['An Giang'],null,[2,14]],
 [0,25,47,'can-tho-2n1d','Cần Thơ · Tây Đô và miệt vườn',['Cần Thơ'],[2100000,2100000],[26,39]],
 [0,47,71,'hau-giang-2n1d','Hậu Giang · Lung Ngọc Hoàng – Vị Thanh',['Hậu Giang'],[1850000,1850000],[48,60]],
 [1,0,142,'long-an-2n1d','Long An · Xứ tràm thơm',['Long An'],[1300000,1600000],[3,88]],
 [1,142,254,'tien-giang-2n1d','Tiền Giang · Miệt vườn và làng cổ',['Tiền Giang'],[1300000,1500000],[151,213]],
 [1,254,424,'ben-tre-2n1d','Bến Tre · Cồn Phụng – Cái Mơn',['Bến Tre'],[1200000,1500000],[264,357]],
 [2,1,33,'bac-lieu-2n1d','Bạc Liêu · Giai điệu Hoài Lang',['Bạc Liêu'],[2290000,2290000],[5,21],20],
 [3,0,84,'mien-tay-4n3d','Bến Tre – Trà Vinh – Vĩnh Long – Đồng Tháp',['Bến Tre','Trà Vinh','Vĩnh Long','Đồng Tháp'],[2890000,null],[2,28,48,69],26],
 [4,1,33,'soc-trang-2n1d','Sóc Trăng · Hương sắc ba dân tộc',['Sóc Trăng'],[2190000,2190000],[5,21],20],
 [5,0,18,'ho-chi-minh-5n4d','TP.HCM – Mê Kông – Cần Giờ – Bình Châu',['TP.HCM','Tiền Giang','Bến Tre','Bà Rịa - Vũng Tàu'],null,[1,4,7,12,15]],
 [6,0,386,'kien-giang-ca-mau-4n3d','Kiên Giang – Cà Mau',['Kiên Giang','Cà Mau'],null,[4,140,217,323]],
 [6,386,563,'ha-tien-2n1d','Hà Tiên – Mũi Nai',['Kiên Giang'],null,[390,500]],
 [7,0,14,'tay-ninh-2n1d','Tây Ninh · Núi Bà Đen – Hồ Dầu Tiếng',['Tây Ninh'],null,[1,8]],
 [7,14,28,'binh-duong-2n1d','Bình Dương · Đại Nam – Thủy Châu',['Bình Dương'],null,[15,22]],
 [7,28,48,'binh-phuoc-3n2d','Bình Phước · Bù Gia Mập – Bù Lạch',['Bình Phước'],null,[29,35,42]],
 [7,48,76,'dong-nam-bo-4n3d','Bình Dương – Tây Ninh – Bình Phước',['Bình Dương','Tây Ninh','Bình Phước'],null,[49,56,63,70]]
];
// Identify clocks even when Word concatenates multiple runs into one paragraph.
const clock = /(?<!\d)(\d{1,2}[:h]\d{2})(?:\s*[–-]\s*(\d{1,2}[:h]\d{2})(?:\/\d{1,2}:\d{2})?)?/g;
const normalize = s => slug(s).replace(/-/g,' ');
const matches = (d,text) => d.aliases.some(a=>normalize(text).includes(normalize(a)));
const routes=specs.map(([doc,start,end,id,name,regions,price,heads,minPeople])=>{
 const source=sources[doc];
 const warnings=[];
 if(doc===5) warnings.push('Đã bỏ đoạn Cần Giờ lặp trước tiêu đề ngày 4; ngày 1 được xếp lại theo mốc giờ. Tiêu đề ngày 2 nhắc Tây Ninh nhưng phần hoạt động không có điểm dừng tại Tây Ninh.');
 if(id==='ha-tien-2n1d') warnings.push('Nguồn ghi 0:45 – 12:00 tại Mũi Nai sau bữa sáng 09:30 – 10:30; cần xác nhận lại giờ bắt đầu.');
 if(id==='mien-tay-4n3d') warnings.push('Bến Tre là chặng đi qua trong ngày 1. Xẻo Quít được nêu ở phần dịch vụ nhưng chưa có khung giờ trong lịch trình.');
 const days=heads.map((head,index)=>{
   const stop=heads[index+1]??end;
   const paragraphs=source.paragraphs.slice(head+1,stop).map((text,k)=>({text,paragraph:head+1+k})).filter(p=>!(doc===5&&[10,11].includes(p.paragraph)));
   const activities=[]; let current=null;
   for(const p of paragraphs){
     const ms=[...p.text.matchAll(clock)];
     if(!ms.length){if(current)current.note+='\n'+p.text;continue;}
     // A time mentioned within prose isn't a new stop unless it begins a line or follows punctuation.
     const boundaries=ms.filter((m,j)=>m.index===0 || (j>0 && /[.!?…]\s*$/.test(p.text.slice(0,m.index))) || (/[.!?…]\s*$/.test(p.text.slice(0,m.index)) && !/^Khoảng|^Thời gian|^Dự kiến|^Thời gian đẹp/.test(p.text)));
     if(!boundaries.length){if(current)current.note+='\n'+p.text;continue;}
     for(let j=0;j<boundaries.length;j++){
       const m=boundaries[j];
       const body=p.text.slice(m.index+m[0].length,boundaries[j+1]?.index??p.text.length).replace(/^[\s:|–-]+/,'').trim();
       const time=m[0].replace(/h/g,':');
       current={time,name:body.split(/(?<=[.!?])\s/)[0]||'',note:body,tag:tag(body),cost:0,costKnown:false,sourceFile:source.name,sourceParagraph:p.paragraph};
       if(time.startsWith('0:45')) {current.time='Giờ cần xác nhận (nguồn: '+time+')';current.warning=warnings[0];}
       activities.push(current);
     }
   }
   for(const a of activities){
     if(!a.name) a.name=a.note.trim().split('\n')[0]||'Hoạt động theo chương trình';
     a.tag=tag(a.name);
     const hits=Object.entries(destinations).filter(([,d])=>regions.includes(d.region)&&matches(d,a.note));
     a.destinationIds=hits.map(([id])=>id);
     a.destinationId=hits[0]?.[0]||null;
     for(const [did,d] of hits){
       d.sources.push({file:source.name,paragraph:a.sourceParagraph,routeId:id});
       if(!d.description)d.description=a.note;
       if(!d.places.some(p=>p[0]===a.name))d.places.push([a.name,a.tag,0,{note:a.note,time:a.time,sourceFile:source.name,sourceParagraph:a.sourceParagraph,costKnown:false}]);
     }
   }
   // Preserve source order; only the known out-of-order HCMC day is chronologically normalized.
   if(doc===5&&index===0)activities.sort((a,b)=>a.time.localeCompare(b.time));
   return {number:index+1,title:source.paragraphs[head],activities};
 });
 const destinationIds=[...new Set(days.flatMap(d=>d.activities.flatMap(a=>a.destinationIds)))];
 return {id,name,regions,days,duration:days.length,nights:days.length-1,sourceFile:source.name,sourceDocument:doc,sourceStart:start,sourceEnd:end,price:price?{min:price[0],max:price[1],minPeople:minPeople||null,currency:'VND',note:minPeople?'Giá tham khảo cho đoàn từ '+minPeople+' khách; phải xác nhận lại dịch vụ.':'Giá dự kiến trong tài liệu nguồn.'}:null,destinationIds,warnings,details:source.paragraphs.slice(start,end),conditions:[2,3,4].includes(doc)?source.paragraphs.slice(end):[]};
});
// Source-only mentions without timed visits remain searchable without inventing a timed itinerary.
for(const [id,d] of Object.entries(destinations)){
 if(!d.sources.length){
   for(let i=0;i<sources.length;i++)for(let j=0;j<sources[i].paragraphs.length;j++)if(matches(d,sources[i].paragraphs[j])){
     d.sources.push({file:sources[i].name,paragraph:j});d.description ||= sources[i].paragraphs[j];
   }
 }
 if(!d.sources.length)throw Error('No source for '+d.name);
 if(!d.places.length)d.places.push([d.name,tag(d.name),0,{note:d.description+' Chưa có khung giờ riêng trong nguồn.',costKnown:false,sourceFile:d.sources[0].file}]);
}
const data={version:'word-20260926-v1',provinces:Object.keys(groups).sort((a,b)=>a.localeCompare(b,'vi')),destinations,routes,sources:sources.map(s=>({name:s.name,paragraphCount:s.paragraphs.length})),note:'Tên tỉnh/thành được giữ theo tài liệu nguồn. Mốc giờ và giá là thông tin tham khảo trong tài liệu.'};
write('assets/data/tourism.json',JSON.stringify(data,null,2)+'\n');
write('assets/js/tourism-data.js','// Generated by scripts/build-tourism.cjs from the supplied Word documents.\n(function(root){const data='+JSON.stringify(data)+'; if(typeof module!=="undefined"&&module.exports)module.exports=data;else root.TripMateTourism=data;})(typeof window!=="undefined"?window:globalThis);\n');
console.log(JSON.stringify({sources:data.sources.length,provinces:data.provinces.length,places:Object.keys(destinations).length,routes:routes.length,days:routes.reduce((s,r)=>s+r.duration,0),activities:routes.reduce((s,r)=>s+r.days.reduce((n,d)=>n+d.activities.length,0),0)}));

if(fs.existsSync(path.join(base,"assets/data/tourism-media.json")))require("./enrich-tourism.cjs");
