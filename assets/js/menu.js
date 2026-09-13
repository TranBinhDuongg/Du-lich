(() => {
const menu=document.getElementById('journey-menu'),button=document.querySelector('.menu-button');
let animation,previousOverflow;
function close(){
 animation?.cancel();
 animation=menu.animate([{transform:'translateY(0)'},{transform:'translateY(-100%)'}],{duration:500,easing:'cubic-bezier(.76,0,.24,1)'});
 animation.finished.then(()=>{menu.hidden=true;button.setAttribute('aria-expanded','false');document.body.style.overflow=previousOverflow||'';button.focus();}).catch(()=>{});
}
button.addEventListener('click',e=>{
 e.stopImmediatePropagation();
 if(!menu.hidden){close();return;}
 previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
 menu.hidden=false;button.setAttribute('aria-expanded','true');animation?.cancel();
 animation=menu.animate([{transform:'translateY(-100%)'},{transform:'translateY(0)'}],{duration:750,easing:'cubic-bezier(.76,0,.24,1)'});
 menu.querySelector('.menu-dismiss').focus();
},true);
menu.querySelector('.menu-dismiss').addEventListener('click',close);
menu.querySelector('[data-view="home"]').addEventListener('click',e=>{e.stopImmediatePropagation();close();},true);
document.addEventListener('keydown',e=>{
 if(menu.hidden)return;
 if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}
 if(e.key==='Tab'){
 const items=[...menu.querySelectorAll('button')],first=items[0],last=items.at(-1);
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
},true);
})();
