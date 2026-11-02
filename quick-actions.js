/* Visual Quick Actions tour and incoming chat-card animation. */
(()=>{
 const section=document.querySelector('#convenience');if(!section)return;
 // Camera, location and voice keep taking turns while hovered or focused.
 const quickPanel=section.querySelector('[data-node-id="148:5632"]');
 const triggers=['5850','5854','5858','5863','5867','5871'].map(id=>section.querySelector('[data-node-id="148:'+id+'"]')).filter(Boolean);
 triggers.forEach(node=>node.classList.add('quick-action-icon'));
 const tour=['5850','5858','5867'].map(id=>section.querySelector('[data-node-id="148:'+id+'"]')).filter(Boolean);
 let tourTimer=null,tourIndex=0,tourVisible=false;
 const stopTour=()=>{clearTimeout(tourTimer);tourTimer=null;};
 const selectQuick=node=>triggers.forEach(n=>n.classList.toggle('is-quick-highlight',n===node));
 function runTour(){
  stopTour();
  if(!tourVisible||document.hidden){selectQuick(null);return;}
  if(dangoReducedMotion.matches||!tour.length){selectQuick(null);return;}
  selectQuick(tour[tourIndex]);tourTimer=setTimeout(()=>{tourIndex=(tourIndex+1)%tour.length;runTour()},560);
 }
 if(quickPanel){
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{tourVisible=entries[0].isIntersecting;runTour()},{threshold:.2}).observe(quickPanel);
  else{tourVisible=true;runTour();}
  dangoReducedMotion.addEventListener('change',runTour);document.addEventListener('visibilitychange',runTour);
  window.addEventListener('pagehide',stopTour);window.addEventListener('pageshow',runTour);
 }
 // A received appointment keeps its original layout: typing dots, then the card, then its timestamp.
 const arrival=section.querySelector('[data-node-id="148:5568"]');
 const card=arrival?.querySelector('[data-node-id="148:5575"]');
 const stamp=arrival?.querySelector('[data-node-id="148:5603"]');
 if(arrival&&card&&stamp){
  arrival.classList.add('chat-arrival-row','is-chat-waiting');card.classList.add('chat-arrival-card');stamp.classList.add('chat-arrival-time');
  [card,stamp].forEach(root=>[root,...root.querySelectorAll('.reveal-text')].forEach(n=>n.classList.remove('reveal-text','is-revealed')));
  const composer=section.querySelector('[data-node-id="148:5615"]');composer?.classList.remove('reveal-text','is-revealed');
  const dots=document.createElement('div');dots.className='chat-typing';dots.setAttribute('aria-hidden','true');dots.innerHTML='<span></span><span></span><span></span>';
  card.parentElement.append(dots);
  let arrivalTimer=null,arrivalState='waiting',arrivalPrinting=false;
  const state=value=>{arrivalState=value;arrival.dataset.chatState=value;arrival.classList.toggle('is-chat-waiting',value==='waiting');arrival.classList.toggle('is-chat-typing',value==='typing');arrival.classList.toggle('is-chat-arrived',value==='arrived');};
  const finishArrival=()=>{clearTimeout(arrivalTimer);arrivalTimer=null;state('arrived');};
  const playArrival=()=>{if(arrivalState!=='waiting')return;if(dangoReducedMotion.matches){finishArrival();return;}state('typing');arrivalTimer=setTimeout(finishArrival,650);};
  arrival.addEventListener('focusin',finishArrival);
  if(dangoReducedMotion.matches||!('IntersectionObserver'in window))finishArrival();
  else{
   new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(dangoReducedMotion.matches||arrivalPrinting){finishArrival();return;}
    if(entry.isIntersecting)playArrival();
   }),{threshold:.25,rootMargin:'0px 0px -12% 0px'}).observe(arrival);
   // A separate wide exit boundary rearms both directions only after the whole card is out of view.
   new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(dangoReducedMotion.matches||arrivalPrinting||arrival.contains(document.activeElement)){finishArrival();return;}
    if(!entry.isIntersecting){clearTimeout(arrivalTimer);arrivalTimer=null;state('waiting');}
   }),{rootMargin:'100px 0px 100px 0px',threshold:0}).observe(arrival);
  }
  dangoReducedMotion.addEventListener('change',()=>{if(dangoReducedMotion.matches)finishArrival();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&arrivalState==='typing')finishArrival();});
  window.addEventListener('beforeprint',()=>{arrivalPrinting=true;finishArrival();});window.addEventListener('afterprint',()=>{arrivalPrinting=false;});window.addEventListener('pagehide',finishArrival);
  state(arrivalState);
 }

})();
