(function(root){
  'use strict';
  const normalize=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]+/g,' ').trim();
  const money=n=>n.toLocaleString('vi-VN')+' ₫';
  function shortName(route){
    if(!route)return 'Chuyến đi của bạn';
    const names={'mien-tay-4n3d':'Miền Tây','ho-chi-minh-5n4d':'TP.HCM & vùng ven','kien-giang-ca-mau-4n3d':'Kiên Giang – Cà Mau','ha-tien-2n1d':'Hà Tiên','dong-nam-bo-4n3d':'Đông Nam Bộ'};
    return names[route.id]||route.name.split(' · ')[0];
  }
  function create(E){
    let focus=null;
    const defaults=['Ngày 1 đi đâu?','Chi phí cho 4 người','Ăn gì?','Lịch trình từng ngày'];
    function respond(plan,text){
      const q=normalize(text);
      const explicitRoute=E.routes.find(r=>q.includes(normalize(r.name)));
      const found=explicitRoute?[explicitRoute]:E.routes.filter(r=>normalize(r.name).includes(q)||r.regions.some(p=>q.includes(normalize(p))));
      const places=Object.entries(E.destinations).filter(([,d])=>q.includes(normalize(d.name))||d.aliases.some(a=>q.includes(normalize(a))));
      if(found.length)focus=found[0].id;
      const followup = /\b(chi phi|gia|ngan sach|bao nhieu tien|lich trinh|an gi|khach san|luu tru|co gi choi|di may ngay|mon an|am thuc)\b/.test(q);
      const route=plan ? E.routes.find(r=>r.id===plan.routeId)||{id:null,name:'Chuyến đi của bạn',duration:plan.days.length,nights:Math.max(0,plan.days.length-1),warnings:plan.warnings||[],regions:[]} : found[0]||(followup ? E.routes.find(r=>r.id===focus) : null);
      const result=(reply,suggestions=defaults,actions=[])=>({reply,suggestions,actions});
      const action=r=>({label:'Xem lịch trình',href:plan?.id?'route.html?id='+encodeURIComponent(plan.id):r.id?'plan.html?route='+encodeURIComponent(r.id):'plan.html'});
      if(!plan)return result('Chọn một lịch trình ở phía trên để bắt đầu trò chuyện riêng về chuyến đi đó.',[]);
      if(plan&&found.length&&!found.some(r=>r.id===plan.routeId))return result('Câu hỏi này thuộc lịch trình khác. Hãy chuyển lịch trình ở phía trên để mở cuộc trò chuyện tương ứng.');
      const currentDays=plan?.days||route?.days||[];
      if(/\b(diem den|nhung dia diem)\b/.test(q)){
        const ids=plan.input.destinations?.length?plan.input.destinations:[plan.input.destination];
        return result('**'+shortName(route)+'**\n\n'+[...new Set(ids)].map(id=>'• '+E.destinations[id].name).join('\n'));
      }
      const requestedDay=q.match(/\bngay (\d+)\b/);
      if(requestedDay){
        const day=Number(requestedDay[1]);
        if(day<1||day>currentDays.length)return result('Chuyến đi này có '+currentDays.length+' ngày. Hãy chọn ngày từ 1 đến '+currentDays.length+'.');
        const activities=currentDays[day-1].activities;
        return result('**Ngày '+day+' · '+shortName(route)+'**\n\n'+activities.map(a=>'• '+a.time+' — '+a.name).join('\n'));
      }
      const adjustment=E.command(plan,text);if(adjustment)return result(adjustment.reply);
      if(/thoi tiet|du bao|hom nay/.test(q))return result('Tài liệu không có thời tiết trực tiếp. Mình có thể tra các điểm đến và lịch trình được cung cấp.');
      if(places.length&&!/\b(lich trinh|tuyen|chi phi|gia|ngan sach)\b/.test(q)){
        const [id,d]=places[0];
        if(plan&&!plan.input.destinations.includes(id))return result(d.name+' không thuộc lịch trình đang chọn. Hãy chuyển sang chuyến có địa điểm này để trò chuyện.');
        return result('**'+d.name+' · '+d.region+'**\n\n'+d.description,defaults,[{label:'Tạo lịch trình tại '+d.name,href:'plan.html?destination='+id}]);
      }
      if(route&&/\b(an gi|mon an|am thuc|khach san|luu tru|ngu o dau)\b/.test(q)){
        const lodging=/khach san|luu tru|ngu o dau/.test(q);
        const items=currentDays.flatMap((d,i)=>d.activities.filter(a=>a.tag===(lodging?'Lưu trú':'Ẩm thực')).map(a=>({...a,day:i+1})));
        if(!items.length)return result('Lịch trình này chưa ghi rõ thông tin '+(lodging?'lưu trú':'ăn uống')+'.');
        return result('**'+shortName(route)+'**\n\n'+items.map(a=>'• Ngày '+a.day+' · '+a.time+' — '+a.note).join('\n\n'),defaults,[action(route)]);
      }
      if(route&&/\b(chi phi|gia|ngan sach|bao nhieu tien|het bao nhieu)\b/.test(q)){
        const people=Number(q.match(/\b(\d+) (nguoi|khach)\b/)?.[1]||plan?.input.people||2);
        if(people<1||people>100)return result('Số người cần từ 1 đến 100.');
        const c=E.costs({routeId:route.id,input:{people,budget:plan?.input.budget||3000000}});
        return result('**'+shortName(route)+'**\n\n'+(c.unknown?c.note:money(c.totalPerPerson)+'/người · '+money(c.total)+' cho '+people+' người dự kiến. '+c.note),defaults,[action(route)]);
      }
      if(route&&(found.length||/lich trinh|ngay|tham quan|di dau|co gi choi/.test(q))&&!/nhung tuyen|cac tuyen|danh sach/.test(q)){
        return result('**'+shortName(route)+' · '+currentDays.length+' ngày**\n\n'+currentDays.map((d,i)=>'**'+(d.title||'Ngày '+(i+1))+'**\n'+d.activities.map(a=>'• '+a.time+' — '+a.name).join('\n')).join('\n\n'),defaults,[action(route)]);
      }
      if(/tuyen|dia diem|di dau|goi y|kham pha|tro giup|xin chao/.test(q))return result('Hiện có '+E.routes.length+' lịch trình:\n\n'+E.routes.map(r=>'• '+shortName(r)+' ('+r.duration+'N'+r.nights+'Đ)').join('\n'),defaults,E.routes.slice(0,3).map(action));
      return result('Mình chưa tìm thấy thông tin này trong lịch trình đang chọn. Bạn có thể hỏi tên địa điểm, lịch trình hoặc giá của một tuyến trong danh mục.',defaults);
    }
    return {respond,reset(){focus=null;}};
  }
  const api={create,normalize,shortName};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TripMateChatbot=api;
})(typeof window!=='undefined'?window:globalThis);
