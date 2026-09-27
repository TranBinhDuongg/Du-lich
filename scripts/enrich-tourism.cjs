// Attach document images and destination photos with their original attribution.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,'');
const data=JSON.parse(read('assets/data/tourism.json'));
const sources=JSON.parse(read('assets/data/tourism-sources.json'));
const media=JSON.parse(read('assets/data/tourism-media.json'));
data.media=media.map(m=>({...m,attribution:'Ảnh trích từ '+m.sourceFile}));
const images={
 'Núi Bà Đen':['doc-7-image10.png',76],
 'Tòa Thánh Tây Ninh':['doc-7-image7.png',77],
 'Khu du lịch Đại Nam':['doc-7-image6.png',78],
 'Vườn quốc gia Bù Gia Mập':['doc-7-image11.png',79],
 'Rừng cao su Bình Phước':['doc-7-image9.png',80],
 'Chùa Hội Khánh':['doc-7-image1.png',84],
 'Núi Bà Rá':['doc-7-image3.png',85]
};
for(const d of Object.values(data.destinations))if(images[d.name]){
 const [filename,paragraph]=images[d.name];
 d.image='assets/images/source/'+filename;
 d.imageAttribution=sources[7].paragraphs[paragraph];
}
for(const route of data.routes){
 route.image=media.find(m=>m.document===route.sourceDocument)?.path||'assets/images/tourism-placeholder.svg';
 if(route.id==='tay-ninh-2n1d')route.image='assets/images/source/doc-7-image10.png';
 if(route.id==='binh-duong-2n1d')route.image='assets/images/source/doc-7-image6.png';
 if(route.id==='binh-phuoc-3n2d')route.image='assets/images/source/doc-7-image11.png';
 route.imageAlt=route.image.includes('/source/')?'Ảnh trong tài liệu '+route.sourceFile:'Minh họa hành trình miền Nam';
 route.imageAttribution=route.image.includes('/source/')?sources[route.sourceDocument].paragraphs.filter(p=>/Nguồn:|Ảnh minh họa:/.test(p)).join('\n'):'';
 for(const day of route.days)for(const a of day.activities){
   const d=data.destinations[a.destinationId];
   if(d?.imageAttribution){a.image=d.image;a.imageAttribution=d.imageAttribution;}
 }
}
// Keep food and lodging information separate and traceable without guessing nightly or meal prices.
data.meals=data.routes.flatMap(r=>r.days.flatMap(d=>d.activities.filter(a=>a.tag==='Ẩm thực').map(a=>({...a,routeId:r.id,day:d.number}))));
data.accommodations=data.routes.flatMap(r=>r.days.flatMap(d=>d.activities.filter(a=>a.tag==='Lưu trú').map(a=>({...a,routeId:r.id,day:d.number}))));
// Optional verified photos for the editorial selection; preserve them on every rebuild.
const featuredFile=path.join(root,'assets/data/featured-images.json');
if(fs.existsSync(featuredFile)){
 const images=JSON.parse(fs.readFileSync(featuredFile,'utf8'));
 for(const [id,image]of Object.entries(images))if(data.destinations[id])Object.assign(data.destinations[id],image);
 for(const route of data.routes){
   const replacement=Object.values(images).find(image=>image.originalImage===route.image);
   if(replacement){route.image=replacement.image;route.imageAttribution=replacement.imageAttribution;}
 }
 for(const route of data.routes)for(const day of route.days)for(const activity of day.activities){
   const image=images[activity.destinationId];if(image)Object.assign(activity,image);
 }
}
// Verified destination photos survive catalog rebuilds and follow their place IDs.
const destinationImagesFile=path.join(root,'assets/data/destination-images.json');
if(fs.existsSync(destinationImagesFile)){
 const photos=JSON.parse(fs.readFileSync(destinationImagesFile,'utf8'));
 for(const [id,photo]of Object.entries(photos))if(data.destinations[id])Object.assign(data.destinations[id],photo);
 for(const route of data.routes){
   for(const day of route.days)for(const activity of day.activities){
     const place=data.destinations[activity.destinationId];
     if(place?.image&&!place.image.includes('placeholder')){
       for(const key of ['image','imageAlt','imageAttribution','imageSource','imageOriginalUrl','imageLicense']){
         if(place[key])activity[key]=place[key];
       }
     }
   }
   const cover=route.destinationIds.map(id=>data.destinations[id]).find(d=>d?.image&&!d.image.includes('placeholder'));
   if(cover){
     route.image=cover.image;
     route.imageAlt=cover.imageAlt||cover.name;
     route.imageAttribution=cover.imageAttribution||'';
     route.imageSource=cover.imageSource||'';
   }
 }
 data.meals=data.routes.flatMap(r=>r.days.flatMap(d=>d.activities.filter(a=>a.tag==='Ẩm thực').map(a=>({...a,routeId:r.id,day:d.number}))));
 data.accommodations=data.routes.flatMap(r=>r.days.flatMap(d=>d.activities.filter(a=>a.tag==='Lưu trú').map(a=>({...a,routeId:r.id,day:d.number}))));
}
// Editorial estimates fill missing prices; published group rates retain their conditions.
const estimates=JSON.parse(read('assets/data/route-price-estimates.json'));
for(const route of data.routes){
 const range=estimates.routes[route.id];
 if(!range)continue;
 const estimate={...range,minPeople:null,currency:'VND',estimated:true,checkedAt:estimates.checkedAt,note:'Ước tính cho người lớn, ngày thường, đi đường bộ từ TP.HCM và ở ghép phòng tiêu chuẩn; chưa gồm vé máy bay, phòng riêng và phụ thu lễ Tết. Cần xác nhận giá trước khi đặt.'};
 if(!route.price||route.price.estimated)route.price=estimate;
 else route.estimatedPrice=estimate;
}
fs.writeFileSync(path.join(root,'assets/data/tourism.json'),JSON.stringify(data,null,2)+'\n');
fs.writeFileSync(path.join(root,'assets/js/tourism-data.js'),'// Generated from the eight supplied Word documents.\n(function(root){const data='+JSON.stringify(data)+';if(typeof module!=="undefined"&&module.exports)module.exports=data;else root.TripMateTourism=data;})(typeof window!=="undefined"?window:globalThis);\n');
console.log(`Attached ${media.length} source images, ${data.meals.length} meal entries, ${data.accommodations.length} lodging entries.`);
