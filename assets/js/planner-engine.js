(function(root){
  'use strict';
  const data = typeof module !== 'undefined' && module.exports ? require('./tourism-data.js') : root.TripMateTourism;
  const {destinations, provinces, routes, version} = data;
  const interests=['Ẩm thực','Biển','Thiên nhiên','Văn hóa','Check-in'];
  const defaultDestination=Object.keys(destinations)[0];
  const clone=value=>JSON.parse(JSON.stringify(value));
  for(const storageName of ['localStorage','sessionStorage']){
    try {
      const storage=root[storageName];
      if(storage && storage.getItem('tripmate.tourism-version')!==version){
        const keys=['tripmate.saved-plans.v1','tripmate.current-plan.v1','tripmate.chat-history.v1','tripmate.chat-history.v2','tripmate.chat-focus.v1','tripmate.chat-suggestions.v1'];
        keys.forEach(key=>storage.removeItem(key));
        storage.setItem('tripmate.tourism-version',version);
      }
    } catch { /* Storage may be disabled; the new catalog still works. */ }
  }
  function validate(input){
    const ids=[...new Set((Array.isArray(input.destinations)?input.destinations:[input.destination]).filter(id=>Object.hasOwn(destinations,id)))];
    const v={destination:ids[0]||'',destinations:ids,days:Number(input.days),people:Number(input.people),budget:Number(input.budget),interests:(input.interests||[]).filter(x=>interests.includes(x)),routeId:input.routeId||null};
    if(!v.destination)throw Error('Hãy chọn ít nhất một địa điểm trong danh mục mới.');
    if(!Number.isInteger(v.days)||v.days<1||v.days>14)throw Error('Số ngày phải từ 1 đến 14.');
    if(!Number.isInteger(v.people)||v.people<1||v.people>100)throw Error('Số người phải từ 1 đến 100.');
    if(!Number.isFinite(v.budget)||v.budget<100000||v.budget>100000000)throw Error('Ngân sách mỗi người phải từ 100.000 đến 100.000.000 đồng.');
    if(!v.interests.length)throw Error('Hãy chọn ít nhất một sở thích.');
    if(v.routeId&&!routes.some(r=>r.id===v.routeId))throw Error('Tuyến không còn trong danh mục.');
    return v;
  }
  function generate(input){
    let v=validate(input);
    const route=v.routeId?routes.find(r=>r.id===v.routeId):routes.find(r=>r.duration===v.days&&v.destinations.every(id=>r.destinationIds.includes(id)));
    if(route){
      v={...v,days:route.duration,routeId:route.id,destinations:[...route.destinationIds],destination:route.destinationIds[0]};
      return {id:null,dataVersion:version,input:v,economy:false,revision:0,routeId:route.id,sourceFile:route.sourceFile,warnings:route.warnings,days:clone(route.days)};
    }
    const plan={id:null,dataVersion:version,input:v,economy:false,revision:0,routeId:null,warnings:['Bản nháp tự chọn; tài liệu chưa có tuyến trùng khớp. Cần sắp xếp giờ và xác nhận di chuyển.'],days:[]};
    for(let i=0;i<v.days;i++){
      const ids=v.destinations.filter((_,j)=>Math.min(v.days-1,Math.floor(j*v.days/v.destinations.length))===i);
      const activities=ids.map(id=>({name:destinations[id].name,tag:destinations[id].places[0][1],time:'Chưa sắp giờ',note:destinations[id].description,cost:0,costKnown:false,destinationId:id,destinationIds:[id],sourceFile:destinations[id].sources[0].file}));
      if(!activities.length)activities.push({name:'Thời gian tự do',tag:'Nghỉ ngơi',time:'Chưa sắp giờ',note:'Chưa có hoạt động từ tài liệu cho ngày này. Hãy chọn thêm địa điểm hoặc dùng tuyến mẫu.',cost:0,costKnown:false});
      plan.days.push({number:i+1,activities});
    }
    return plan;
  }
  function costs(plan){
    if(plan.aiGenerated && plan.estimates){
      const perPerson=Object.fromEntries(['stay','food','transport','activities','reserve'].map(k=>[k,Number.isFinite(plan.estimates[k])&&plan.estimates[k]>=0?plan.estimates[k]:0]));
      const totalPerPerson=Object.values(perPerson).reduce((a,b)=>a+b,0),total=totalPerPerson*plan.input.people,budgetTotal=plan.input.budget*plan.input.people;
      return {perPerson,totalPerPerson,total,budgetTotal,over:total>budgetTotal,unknown:false,price:null,note:'Dự toán do Tripmate đề xuất, chưa phải báo giá dịch vụ. Hãy xác nhận giá trước khi đi.'};
    }
    const route=routes.find(r=>r.id===plan.routeId);
    const published=route?.price;
    const price=published?.minPeople&&plan.input.people<published.minPeople ? route.estimatedPrice || published : published;
    const applicable=!!price&&(!price.minPeople||plan.input.people>=price.minPeople);
    const totalPerPerson=applicable?(price.max ?? price.min):null,total=totalPerPerson===null?null:totalPerPerson*plan.input.people;
    const range=price ? price.min.toLocaleString('vi-VN')+'–'+(price.max??price.min).toLocaleString('vi-VN')+' ₫/người' : '';
    const note=price?.estimated ? 'Ước tính '+range+'. Tổng dự kiến tính theo mức trên. '+price.note+(published?.minPeople?' Giá đoàn chỉ áp dụng từ '+published.minPeople+' khách.':'') : price?(price.minPeople&&!applicable?'Giá từ '+price.min.toLocaleString('vi-VN')+' ₫/khách chỉ áp dụng cho đoàn từ '+price.minPeople+' khách. Nhóm này cần báo giá riêng.':price.max&&price.max!==price.min?'Khoảng '+range+'.':price.max===null?'Giá từ '+price.min.toLocaleString('vi-VN')+' ₫/khách; tổng hiển thị là mức tối thiểu. '+price.note:price.note.replace(' trong tài liệu nguồn', '')):'Chưa có tổng giá cho hành trình này.';
    return {perPerson:{package:totalPerPerson},totalPerPerson,total,budgetTotal:plan.input.budget*plan.input.people,over:total!==null&&total>plan.input.budget*plan.input.people,unknown:total===null,price:price||null,note};
  }
  function scheduleDay(plan,index){
    return plan.days[index].activities.map(activity=>{
      const place=destinations[activity.destinationId];
      if(!place?.image||place.image.includes('placeholder'))return activity;
      // Resolve photos from the catalog, including plans saved before photos were added.
      const photo={};
      for(const key of ['image','imageAlt','imageAttribution','imageSource','imageOriginalUrl','imageLicense']){
        if(place[key])photo[key]=place[key];
      }
      return {...activity,...photo};
    });
  }
  // Derive visibility from itinerary order, independent of which day is opened first.
  function uniquePhotoDay(plan,index){
    const places=new Set(),images=new Set();
    let result=[];
    for(let day=0;day<=index;day++){
      result=scheduleDay(plan,day).map(activity=>{
        if(!activity.image)return activity;
        const place=activity.destinationId || activity.name.trim().toLocaleLowerCase('vi');
        const duplicate=places.has(place)||images.has(activity.image);
        places.add(place);images.add(activity.image);
        return duplicate ? {...activity,image:null} : activity;
      });
    }
    return result;
  }
  function changeDay(plan,number){
    if(!Number.isInteger(number)||number<1||number>plan.days.length)throw Error('Ngày cần đổi không hợp lệ.');
    throw Error('Tuyến nguồn có thứ tự cố định. Hãy chọn tuyến khác hoặc tạo bản nháp tự chọn để đổi địa điểm.');
  }
  function reduceCost(){throw Error('Tài liệu chưa có phương án giảm giá đã xác nhận. Hãy chọn tuyến có giá thấp hơn.');}
  function command(plan,text){
    const q=text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
    if(/doi.*ngay|giam.*chi phi|tiet kiem/.test(q))return {reply:'Mình giữ nguyên lịch trình và giá trong tài liệu. Bạn có thể chọn tuyến khác hoặc tạo bản nháp với các địa điểm mong muốn.'};
    return null;
  }
  const api={...data,defaultDestination,interests,validate,generate,costs,scheduleDay,uniquePhotoDay,changeDay,reduceCost,command};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TripPlannerEngine=api;
})(typeof window!=='undefined'?window:globalThis);
