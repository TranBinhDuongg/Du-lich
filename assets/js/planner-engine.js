(function(root){
'use strict';
const destinations={
 danang:{name:'Đà Nẵng',stay:320000,food:180000,transport:120000,places:[
 ['Biển Mỹ Khê','Biển',0],['Bán đảo Sơn Trà','Thiên nhiên',0],['Bảo tàng Điêu khắc Chăm','Văn hóa',80000],['Cầu Tình Yêu và bờ sông Hàn','Check-in',0],['Khám phá mì Quảng địa phương','Ẩm thực',60000],['Ngũ Hành Sơn','Thiên nhiên',80000],['Dạo phố cổ Hội An','Văn hóa',150000],['Cà phê ven biển','Check-in',60000],['Chợ Cồn và món ăn vặt','Ẩm thực',100000],['Dạo biển lúc hoàng hôn','Biển',0],['Làng đá mỹ nghệ Non Nước','Văn hóa',0],['Nghỉ ngơi tại bãi biển','Biển',0]]},
 hanoi:{name:'Hà Nội',stay:350000,food:190000,transport:100000,places:[
 ['Dạo quanh hồ Hoàn Kiếm','Check-in',0],['Văn Miếu – Quốc Tử Giám','Văn hóa',100000],['Khám phá phố cổ','Văn hóa',0],['Thưởng thức phở và cà phê trứng','Ẩm thực',100000],['Đi bộ ven hồ Tây','Thiên nhiên',0],['Bảo tàng Dân tộc học','Văn hóa',100000],['Chợ Đồng Xuân','Ẩm thực',80000],['Chụp ảnh phố Phan Đình Phùng','Check-in',0],['Vườn Bách Thảo','Thiên nhiên',30000],['Trải nghiệm bún chả','Ẩm thực',70000],['Phố sách Hà Nội','Văn hóa',0],['Ngồi cà phê ngắm phố','Check-in',70000]]},
 dalat:{name:'Đà Lạt',stay:300000,food:170000,transport:140000,places:[
 ['Đi bộ quanh hồ Xuân Hương','Thiên nhiên',0],['Quảng trường Lâm Viên','Check-in',0],['Nhà ga Đà Lạt','Văn hóa',80000],['Bánh căn và sữa đậu nành','Ẩm thực',70000],['Thiền viện Trúc Lâm','Văn hóa',0],['Khám phá khu vực hồ Tuyền Lâm','Thiên nhiên',50000],['Vườn hoa thành phố','Check-in',120000],['Cà phê giữa vườn','Check-in',80000],['Chợ Đà Lạt và món ăn địa phương','Ẩm thực',100000],['Làng hoa Vạn Thành','Thiên nhiên',100000],['Dạo phố trung tâm','Văn hóa',0],['Bữa sáng với bánh mì xíu mại','Ẩm thực',60000]]},
 halong:{name:'Hạ Long',stay:350000,food:220000,transport:120000,places:[
 ['Dạo biển Bãi Cháy','Biển',0],['Bảo tàng Quảng Ninh','Văn hóa',80000],['Cung Cá Heo và quảng trường','Check-in',0],['Khám phá chả mực địa phương','Ẩm thực',100000],['Tham quan vịnh bằng tàu ghép','Thiên nhiên',800000],['Dạo đường bao biển','Thiên nhiên',0],['Chợ Hạ Long','Ẩm thực',100000],['Ngắm cầu Bãi Cháy từ bờ','Check-in',0],['Thư giãn trên bãi biển','Biển',0],['Cà phê ngắm vịnh','Check-in',70000],['Dạo khu vực Hòn Gai','Văn hóa',0],['Khám phá hải sản địa phương','Ẩm thực',200000]]}
};
Object.assign(destinations,{"hoian":{"name":"Hội An","stay":320000,"food":180000,"transport":100000,"image":"assets/images/hoi-an.jpg","color":"#8c764c","places":[["Dạo phố cổ Hội An","Văn hóa",150000],["Ngắm sông Hoài","Check-in",0],["Biển An Bàng","Biển",0],["Thưởng thức cao lầu","Ẩm thực",60000],["Dạo làng rau Trà Quế","Thiên nhiên",50000],["Khám phá làng gốm Thanh Hà","Văn hóa",50000],["Chụp ảnh phố đèn lồng","Check-in",0],["Nghỉ ngơi bên biển","Biển",0],["Khám phá chợ Hội An","Ẩm thực",80000],["Đạp xe qua đồng lúa ngoại ô","Thiên nhiên",60000],["Cà phê ngắm phố","Check-in",60000],["Tản bộ ven sông","Thiên nhiên",0]]},"hagiang":{"name":"Hà Giang – Đồng Văn","stay":250000,"food":170000,"transport":250000,"image":"assets/images/ma-pi-leng.jpg","color":"#4e695c","places":[["Ngắm đèo Mã Pí Lèng","Thiên nhiên",0],["Khám phá phố cổ Đồng Văn","Văn hóa",0],["Cột cờ Lũng Cú","Check-in",50000],["Thung lũng Sủng Là","Thiên nhiên",0],["Tìm hiểu nhà truyền thống vùng cao","Văn hóa",50000],["Thưởng thức bánh cuốn địa phương","Ẩm thực",50000],["Ngắm cảnh cao nguyên đá Đồng Văn","Thiên nhiên",0],["Chụp ảnh cảnh núi từ điểm dừng an toàn","Check-in",0],["Tìm hiểu văn hóa bản làng","Văn hóa",80000],["Khám phá món ăn vùng cao","Ẩm thực",120000],["Cà phê phố cổ Đồng Văn","Check-in",50000],["Dạo quanh thị trấn Đồng Văn","Văn hóa",0]]},"caobang":{"name":"Cao Bằng – Trùng Khánh","stay":270000,"food":170000,"transport":230000,"image":"assets/images/ban-gioc.png","color":"#4d7967","places":[["Tham quan thác Bản Giốc","Thiên nhiên",100000],["Khám phá động Ngườm Ngao","Thiên nhiên",100000],["Chùa Phật Tích Trúc Lâm Bản Giốc","Văn hóa",0],["Ngắm cảnh sông Quây Sơn","Check-in",0],["Dạo làng đá Khuổi Ky","Văn hóa",50000],["Thưởng thức bánh cuốn Cao Bằng","Ẩm thực",50000],["Ngắm đồng ruộng Trùng Khánh","Thiên nhiên",0],["Chụp ảnh làng đá từ đường công cộng","Check-in",0],["Khám phá món ăn địa phương","Ẩm thực",100000],["Tìm hiểu nếp sống bản làng","Văn hóa",50000],["Cà phê ngắm núi","Check-in",50000],["Đi bộ thư giãn quanh nơi lưu trú","Thiên nhiên",0]]},"hue":{"name":"Huế","stay":280000,"food":170000,"transport":120000,"color":"#887252","places":[["Đại Nội Huế","Văn hóa",250000],["Chùa Thiên Mụ","Văn hóa",0],["Dạo bờ sông Hương","Thiên nhiên",0],["Ngắm cầu Trường Tiền","Check-in",0],["Khám phá bún bò Huế","Ẩm thực",60000],["Tham quan lăng Tự Đức","Văn hóa",150000],["Khám phá chợ Đông Ba","Ẩm thực",100000],["Làng hương Thủy Xuân","Check-in",50000],["Dạo công viên ven sông","Thiên nhiên",0],["Thưởng thức các món bánh Huế","Ẩm thực",80000],["Chụp ảnh đường phố Huế","Check-in",0],["Cà phê trong nhà vườn","Thiên nhiên",70000]]},"lyson":{"name":"Lý Sơn","stay":300000,"food":220000,"transport":150000,"image":"assets/images/ly-son.jpg","color":"#3f7887","places":[["Ngắm Cổng Tò Vò","Check-in",0],["Khám phá cảnh quan Hang Câu","Thiên nhiên",50000],["Ngắm biển ven đảo Lý Sơn","Biển",0],["Tìm hiểu văn hóa trồng tỏi","Văn hóa",50000],["Khám phá hải sản địa phương","Ẩm thực",200000],["Chùa Hang","Văn hóa",50000],["Ngắm cảnh núi Thới Lới","Thiên nhiên",50000],["Chụp ảnh ruộng tỏi từ đường công cộng","Check-in",0],["Dạo làng chài","Văn hóa",0],["Thưởng thức món ăn từ tỏi","Ẩm thực",100000],["Ngắm hoàng hôn bên biển","Biển",0],["Cà phê ven biển","Check-in",60000]]},"cantho":{"name":"Cần Thơ","stay":300000,"food":180000,"transport":150000,"color":"#658369","places":[["Tham quan chợ nổi Cái Răng","Văn hóa",200000],["Nhà cổ Bình Thủy","Văn hóa",50000],["Dạo bến Ninh Kiều","Check-in",0],["Khám phá ẩm thực miền Tây","Ẩm thực",100000],["Trải nghiệm vườn cây địa phương","Thiên nhiên",100000],["Dạo cầu đi bộ Ninh Kiều","Check-in",0],["Chùa Ông","Văn hóa",0],["Bữa sáng với món ăn địa phương","Ẩm thực",60000],["Cà phê ngắm sông","Check-in",60000],["Dạo công viên ven sông","Thiên nhiên",0],["Tìm hiểu làng nghề truyền thống","Văn hóa",100000],["Ngắm hoàng hôn bên sông Hậu","Thiên nhiên",0]]}});
destinations.hue.image='assets/images/hue-truong-tien.jpg';destinations.cantho.image='assets/images/can-tho-ninh-kieu.jpg';destinations.danang.image='assets/images/da-nang-my-khe.jpg';
const interests=['Ẩm thực','Biển','Thiên nhiên','Văn hóa','Check-in'];
function validate(input){
 const v={destination:String(input.destination),days:Number(input.days),budget:Number(input.budget),people:Number(input.people),interests:Array.isArray(input.interests)?input.interests.filter(x=>interests.includes(x)):[]};
 if(!destinations[v.destination])throw Error('Vui lòng chọn điểm đến được hỗ trợ.');
 if(!Number.isInteger(v.days)||v.days<1||v.days>14)throw Error('Số ngày phải từ 1 đến 14.');
 if(!Number.isInteger(v.people)||v.people<1||v.people>20)throw Error('Số người phải từ 1 đến 20.');
 if(!Number.isFinite(v.budget)||v.budget<100000||v.budget>100000000)throw Error('Ngân sách mỗi người phải từ 100.000 đến 100.000.000 đồng.');
 if(!v.interests.length)throw Error('Hãy chọn ít nhất một sở thích.');
 return v;
}
function costs(plan){
 const d=destinations[plan.input.destination],n=plan.input.days,p=plan.input.people,f=plan.economy?.78:1;
 const perPerson={stay:Math.round(d.stay*(n-1)*f),food:Math.round(d.food*n*f),transport:Math.round(d.transport*n*f),activities:plan.days.reduce((s,day)=>s+day.activities.reduce((a,x)=>a+x.cost,0),0)};
 const subtotal=Object.values(perPerson).reduce((a,b)=>a+b,0);perPerson.reserve=Math.round(subtotal*.1);
 const totalPerPerson=Object.values(perPerson).reduce((a,b)=>a+b,0);
 return {perPerson,totalPerPerson,total:totalPerPerson*p,budgetTotal:plan.input.budget*p,over:totalPerPerson>plan.input.budget};
}
function generate(input){
 const v=validate(input),d=destinations[v.destination];
 const ordered=d.places.map((p,index)=>({name:p[0],tag:p[1],cost:p[2],key:index})).sort((a,b)=>Number(v.interests.includes(b.tag))-Number(v.interests.includes(a.tag)));
 const plan={id:null,input:v,economy:false,revision:0,days:[]};
 for(let i=0;i<v.days;i++){
  const selected=Array.from({length:3},(_,j)=>({...ordered[(i*3+j)%ordered.length],time:['Sáng','Chiều','Tối'][j]}));
  plan.days.push({number:i+1,activities:selected});
 }
 if(costs(plan).over){plan.economy=true;}
 return plan;
}
function changeDay(plan,number){
 if(!Number.isInteger(number)||number<1||number>plan.days.length)throw Error('Ngày cần đổi phải từ 1 đến '+plan.days.length+'.');
 const next=JSON.parse(JSON.stringify(plan));const day=next.days[number-1],d=destinations[next.input.destination];
 const old=new Set(day.activities.map(x=>x.name));
 const candidates=d.places.map((p,i)=>({name:p[0],tag:p[1],cost:p[2],key:i})).filter(x=>!old.has(x.name)).sort((a,b)=>Number(next.input.interests.includes(b.tag))-Number(next.input.interests.includes(a.tag)));
 day.activities=candidates.slice(0,3).map((x,i)=>({...x,time:['Sáng','Chiều','Tối'][i]}));next.revision++;return next;
}
function reduceCost(plan){
 const next=JSON.parse(JSON.stringify(plan));next.economy=true;
 const cheap=destinations[next.input.destination].places.filter(p=>p[2]===0);
 next.days.forEach(day=>{
  const used=new Set(day.activities.filter(x=>x.cost===0).map(x=>x.name));
  day.activities=day.activities.map((a,i)=>{
   if(a.cost===0)return a;
   const p=cheap.find(x=>!used.has(x[0]));
   if(!p)return a;used.add(p[0]);return {name:p[0],tag:p[1],cost:0,time:a.time,key:'saving-'+i};
  });
 });
 next.revision++;return next;
}
function command(plan,text){
 const q=text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
 const day=q.match(/ngay\s*(\d+)/);
 if(/doi|thay/.test(q)&&/ngay/.test(q)){
  if(!plan)return {reply:'Bạn hãy tạo hoặc mở một lịch trình trước, sau đó mình có thể đổi hoạt động từng ngày.'};
  if(!day)return {reply:'Bạn muốn đổi ngày nào? Ví dụ: “Đổi địa điểm ngày 2”.'};
  const updated=changeDay(plan,Number(day[1]));return {plan:updated,reply:'Mình đã thay hoạt động ngày '+day[1]+' bằng các lựa chọn khác. Lịch trình và dự toán đã được cập nhật. Bấm “Lưu lịch trình” để giữ thay đổi.'};
 }
 if(/giam|tiet kiem|re hon/.test(q)&&/chi phi|ngan sach|tiet kiem|re hon/.test(q)){
  if(!plan)return {reply:'Bạn hãy tạo hoặc mở lịch trình trước để mình điều chỉnh chi phí.'};
  const before=costs(plan),updated=reduceCost(plan),after=costs(updated);
  return {plan:updated,reply:after.total<before.total?'Mình đã chuyển sang phương án tiết kiệm và ưu tiên hoạt động miễn phí. Dự toán giảm khoảng '+(before.total-after.total).toLocaleString('vi-VN')+' đồng cho cả nhóm. Bạn có thể xem lại và lưu lịch trình.':'Lịch trình đã ở phương án tiết kiệm nhất trong dữ liệu mẫu. Bạn có thể giảm số ngày hoặc tăng ngân sách.'};
 }
 return null;
}
const api={destinations,interests,validate,generate,costs,changeDay,reduceCost,command};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TripPlannerEngine=api;
})(typeof window!=='undefined'?window:globalThis);

