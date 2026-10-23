/* A floating logo: pointer and keyboard presses give it one gentle upward bob. */
(()=>{
 'use strict';
 const section=document.querySelector('#concept'),logo=section?.querySelector('.concept-logo-balloon');
 if(!section||!logo)return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let bob;
 const reset=()=>{logo.style.removeProperty('--balloon-x');logo.style.removeProperty('--balloon-y');};
 logo.addEventListener('pointermove',event=>{
  if(reduced.matches||event.pointerType==='touch')return;
  const r=logo.getBoundingClientRect();
  logo.style.setProperty('--balloon-x',((event.clientX-r.left)/r.width-.5)*10+'px');
  logo.style.setProperty('--balloon-y',((event.clientY-r.top)/r.height-.5)*6+'px');
 });
 logo.addEventListener('pointerleave',reset);
 logo.addEventListener('click',()=>{
  if(reduced.matches)return;
  bob?.cancel();
  bob=logo.animate([{translate:'0 0'},{translate:'0 -32px',offset:.38},{translate:'0 4px',offset:.78},{translate:'0 0'}],{duration:1100,easing:'cubic-bezier(.2,.65,.3,1)'});
 });
 const stop=()=>{bob?.cancel();reset();};
 if('IntersectionObserver' in window){
  new IntersectionObserver(entries=>entries.forEach(entry=>{
   section.classList.toggle('concept-in-view',entry.isIntersecting);
   if(!entry.isIntersecting)stop();
  }),{threshold:0}).observe(section);
 }else section.classList.add('concept-in-view');
 reduced.addEventListener('change',stop);
 window.addEventListener('beforeprint',stop);
})();

/* Pause the walking frames outside the viewport; reduced motion uses the still pose. */
(()=>{
 'use strict';
 const walk=document.querySelector('#concept .dango-walk-animation');
 if(!walk)return;
 let visible=false;
 const sync=()=>walk.classList.toggle('walk-in-view',visible&&!document.hidden);
 if('IntersectionObserver' in window){
  new IntersectionObserver(entries=>entries.forEach(entry=>{visible=entry.isIntersecting;sync();}),{threshold:.1}).observe(walk);
 }else{visible=true;sync();}
 document.addEventListener('visibilitychange',sync);
 const sheet=new Image();
 sheet.onload=()=>{walk.classList.add('walk-ready');walk.dataset.walkState='ready';};
 sheet.onerror=()=>{walk.dataset.walkState='unavailable';};
 sheet.src='assets/generated/dango-walk-sprite-v1.png';
})();
