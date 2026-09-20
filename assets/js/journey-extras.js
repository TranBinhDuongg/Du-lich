(() => {
  const journey=document.getElementById('journey');
  if(!journey)return;
  const entries=[
    ['halong','Hạ Long','Biển đảo · Ngắm cảnh','Dạo bên vịnh, khám phá cảnh quan đảo đá và dành thời gian thư giãn ven biển.','Áo chống nắng, nước uống và túi chống nước.'],
    ['caobang','Bản Giốc','Thiên nhiên · Thác nước','Ngắm thác, chụp ảnh cảnh quan và kết hợp tìm hiểu đời sống địa phương.','Giày chống trượt; kiểm tra thời tiết trước khi đi.'],
    ['hagiang','Mã Pí Lèng','Núi rừng · Cung đường','Ngắm cao nguyên đá tại những điểm dừng phù hợp và khám phá văn hóa vùng cao.','Áo khoác, giày chắc chân; chọn phương tiện phù hợp đường đèo.'],
    ['hoian','Hội An','Phố cổ · Văn hóa','Tản bộ phố cổ, ngắm sông Hoài và dành thời gian khám phá ẩm thực.','Giày đi bộ, mũ và một lịch trình thoải mái.'],
    ['danang','Cầu Vàng','Ngắm cảnh · Trải nghiệm','Ngắm kiến trúc và cảnh quan, kết hợp các hoạt động trong chuyến đi Đà Nẵng.','Kiểm tra thời tiết, giờ hoạt động và vé trước khi đặt.'],
    ['lyson','Lý Sơn','Biển đảo · Thư giãn','Dạo quanh đảo, ngắm cảnh biển và tìm hiểu cảnh quan núi lửa.','Kiểm tra lịch tàu, thời tiết và thời gian di chuyển.']
  ];
  const intro=journey.querySelector('.tripBlock__introWrapper');
  const caption=document.createElement('p');caption.className='explore-caption';caption.textContent='Chọn một nơi bạn muốn đến. Bắt đầu hành trình theo cách riêng.';intro.append(caption);
  const nav=document.createElement('nav');nav.className='explore-quick';nav.setAttribute('aria-label','Chuyển nhanh đến địa điểm');intro.append(nav);
  const dialog=document.createElement('dialog');dialog.className='explore-detail';dialog.setAttribute('aria-labelledby','explore-detail-title');
  dialog.innerHTML='<button type="button" class="explore-close" aria-label="Đóng thông tin">×</button><p class="explore-category"></p><h2 id="explore-detail-title"></h2><h3>Gợi ý trải nghiệm</h3><p class="explore-summary"></p><h3>Chuẩn bị trước chuyến đi</h3><p class="explore-preparation"></p><p class="explore-note">Gợi ý tham khảo. Lịch trình, giá vé và giờ mở cửa cần kiểm tra theo ngày đi.</p><a class="explore-plan">Tạo lịch trình cho điểm đến ↗</a>';
  document.body.append(dialog);
  dialog.querySelector('button').onclick=()=>dialog.close();
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  entries.forEach((entry,i)=>{
    const section=document.getElementById('day-'+(i+1));if(!section)return;
    const quick=document.createElement('button');quick.type='button';quick.textContent=entry[1];quick.onclick=()=>journey.scrollTo({left:section.offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});nav.append(quick);
    const wrapper=section.querySelector('.tripTextItem__wrapper');
    const category=document.createElement('p');category.className='explore-category';category.textContent=String(i+1).padStart(2,'0')+' / '+entry[2];wrapper.prepend(category);
    const actions=document.createElement('div');actions.className='explore-actions';
    const plan=document.createElement('a');plan.className='explore-plan';plan.href='plan.html?destination='+entry[0];plan.textContent='Tạo lịch trình ↗';
    const detail=document.createElement('button');detail.type='button';detail.className='explore-more';detail.textContent='Xem thông tin';detail.onclick=()=>{
      dialog.querySelector('h2').textContent=entry[1];dialog.querySelector('.explore-category').textContent=entry[2];dialog.querySelector('.explore-summary').textContent=entry[3];dialog.querySelector('.explore-preparation').textContent=entry[4];dialog.querySelector('a').href=plan.href;dialog.showModal();
    };
    actions.append(plan,detail);wrapper.append(actions);
  });
})();
