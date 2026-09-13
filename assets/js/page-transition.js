(() => {
'use strict';
const key='tripmate.transition',pairs=[['#023323','#ccff90'],['#ff4e58','#ffe0b2'],['#a9d7ed','#023323']];
const style=document.createElement('style');
style.textContent='@font-face{font-family:TripmateBrand;src:url("assets/fonts/EuclidSquare-Medium.woff") format("woff");font-weight:500;font-display:swap}.page-transition{position:fixed;inset:0;z-index:100000;visibility:hidden;pointer-events:none;overflow:hidden;display:flex;align-items:center;justify-content:center}.page-transition.active{visibility:visible;pointer-events:auto}.page-transition__shade,.page-transition__bg{position:absolute;inset:0}.page-transition__shade{background:#0008;opacity:0;transition:opacity .5s cubic-bezier(.445,.05,.55,.95) .1s}.page-transition__bg{background:var(--back);transform:translate3d(0,100%,0);transition:transform .6s cubic-bezier(.77,0,.175,1),background-color .6s cubic-bezier(.445,.05,.55,.95)}.page-transition__logo{position:relative;display:flex;align-items:center;gap:13px;font:500 clamp(38px,5vw,68px)/1.15 TripmateBrand,Arial,sans-serif;letter-spacing:-2.5px;color:var(--front);opacity:0;transform:translate3d(0,60vh,0) scale(1);transition:opacity .4s cubic-bezier(.445,.05,.55,.95),transform .6s cubic-bezier(.77,0,.175,1),color .6s ease}.page-transition__logo small{font:500 11px/1 TripmateBrand,Arial,sans-serif;letter-spacing:1px;border:1px solid currentColor;border-radius:5px;padding:6px 7px}.page-transition.shown .page-transition__bg{transform:translate3d(0,0,0)}.page-transition.shown .page-transition__shade{opacity:1}.page-transition.shown .page-transition__logo{opacity:1;transform:translate3d(0,0,0) scale(1);transition:opacity .4s ease .25s,transform .6s cubic-bezier(.19,1,.22,1) .3s,color .6s ease}.page-transition.swapped .page-transition__bg{background:var(--front)}.page-transition.swapped .page-transition__logo{color:var(--back);transform:translate3d(0,0,0) scale(.8);transition:transform .6s cubic-bezier(.77,0,.175,1),color .6s ease}.page-transition.exiting .page-transition__logo{transform:translate3d(0,60vh,0) scale(1);opacity:0;transition:opacity .4s ease,transform .6s cubic-bezier(.77,0,.175,1)}.page-transition.frozen,.page-transition.frozen *{transition:none!important}';
document.head.append(style);
const overlay=document.createElement('div');
overlay.className='page-transition';overlay.setAttribute('aria-hidden','true');
overlay.innerHTML='<div class="page-transition__shade"></div><div class="page-transition__bg"></div><div class="page-transition__logo">Tripmate<small>AI</small></div>';
document.documentElement.append(overlay);
let busy=false,timers=[],generation=0;
const later=(fn,ms)=>{timers.push(setTimeout(fn,ms));};
function colors(pair){overlay.style.setProperty('--back',pair[0]);overlay.style.setProperty('--front',pair[1]);}
function reset(){generation++;timers.forEach(clearTimeout);timers=[];busy=false;overlay.className='page-transition';}
let incoming;
try{incoming=JSON.parse(sessionStorage.getItem(key));sessionStorage.removeItem(key);}catch{}
window.TripMateNavigate=href=>{
 if(busy)return;
 const target=new URL(href,location.href);
 if(target.origin!==location.origin){location.assign(target.href);return;}
 busy=true;
 const pair=pairs[Math.floor(Math.random()*pairs.length)];
 colors(pair);overlay.className='page-transition active';overlay.getBoundingClientRect();
 overlay.classList.add('shown');
 later(()=>{
  try{sessionStorage.setItem(key,JSON.stringify({pair,url:target.href,time:Date.now()}));}catch{}
  location.assign(target.href);
 },1000);
};
document.addEventListener('click',event=>{
 const a=event.target.closest('a[href]');
 if(!a||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||a.hasAttribute('download')||(a.target&&a.target!=='_self'))return;
 const target=new URL(a.href,location.href);
 if(target.origin!==location.origin||!['http:','https:','file:'].includes(target.protocol)||(target.pathname===location.pathname&&target.search===location.search))return;
 event.preventDefault();window.TripMateNavigate(target.href);
});
if(incoming&&Date.now()-incoming.time<15000&&pairs.some(p=>JSON.stringify(p)===JSON.stringify(incoming.pair))){
 colors(incoming.pair);busy=true;overlay.className='page-transition active shown frozen';
 const reveal=async()=>{
  const token=generation;
  if(document.fonts)await Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,350))]);
  if(token!==generation)return;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(token!==generation)return;
   overlay.classList.remove('frozen');overlay.getBoundingClientRect();
   overlay.classList.add('swapped');
   later(()=>{overlay.classList.remove('shown');overlay.classList.add('exiting');},600);
   later(reset,1250);
  }));
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',reveal,{once:true});else reveal();
}
window.addEventListener('pageshow',event=>{if(event.persisted)reset();});
})();
