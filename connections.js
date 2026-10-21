/* STEP 3-C: scoped scroll connections and finite closing motions, without pinning. */
(()=>{
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),clamp=n=>Math.min(1,Math.max(0,n));
 // Keep the original SVGs and their Figma rotation/skew. Reveal their unrotated
 // containing boxes against one shared reading line, including the clipped section seam.
 const routes=['148:3217','148:3216','148:3192','148:3185','148:3177'].map(id=>document.querySelector(`[data-node-id="${id}"]`)).filter(Boolean);
 routes.forEach(n=>n.classList.add('connection-route'));
 const yellow=document.querySelector('#easy-save [data-node-id="148:3166"]');
 // EATGO Project Goal's scroll-scrubbed foreground entrance, without its pin,
 // large rotations, layout changes or background color tween. Full-size wrappers
 // keep every authored child's containing block and centering transform intact.
 function wrapSave(nodes,className){
  if(!yellow||nodes.some(n=>!n))return;
  const wrapper=document.createElement('div');wrapper.className=className;
  yellow.insertBefore(wrapper,nodes[0]);nodes.forEach(n=>wrapper.append(n));
 }
 if(yellow){
  const copy=yellow.querySelector('[data-node-id="148:3174"]');
  copy?.classList.remove('reveal-text','is-revealed');
  wrapSave([yellow.querySelector('[data-node-id="148:3168"]')],'connection-save-character');
  wrapSave([yellow.querySelector('[data-node-id="148:3167"]'),copy],'connection-save-copy');
 }
 // Watch the artwork itself, not the very tall archive/ending section parents.
 // A pending entrance is hidden only until its actual artwork reaches the reading
 // band. Skipped content above the viewport is settled, and an 80px exit buffer
 // rearms a return without flickering at the visible edge.
 const closing=[];
 function ownClosing(node){
  [node,...node.querySelectorAll('.reveal-text')].forEach(n=>n.classList.remove('reveal-text','is-revealed'));
 }
 function closingGroup(anchor,items,kind){
  if(!anchor||!items.length)return;
  items.forEach(({node})=>{
   ownClosing(node);node.style.setProperty('--closing-opacity',getComputedStyle(node).opacity);
   node.classList.add('closing-motion-waiting');
  });
  const group={anchor,items,kind,state:'idle',animations:[],run:0};closing.push(group);
  group.mark=state=>{group.state=state;anchor.dataset.closingState=state;};group.mark('idle');
  return group;
 }
 const endingTitle=document.querySelector('#thank-you [data-node-id="148:4760"]');
 const endingItems=[['148:4760',0,750,.985],['148:4754',80,650,1],['148:4755',160,650,1],['148:4756',240,800,.985]]
  .map(([id,delay,duration,scale])=>({node:document.querySelector(`#thank-you [data-node-id="${id}"]`),delay,duration,scale})).filter(item=>item.node);
 closingGroup(endingTitle,endingItems,'ending');
 const archiveCharacter=document.querySelector('#walk-archive [data-node-id="148:2978"]');
 if(archiveCharacter)closingGroup(archiveCharacter,[{node:archiveCharacter,duration:700}],'archive-character');
 const activeLayers=document.querySelector('#active-walk [data-node-id="148:3186"]');
 const activeCharacter=document.querySelector('#active-walk [data-node-id="148:3187"]');
 if(activeLayers&&activeCharacter){
  // Keep the layered character and its shadow together. The full-canvas wrapper
  // leaves the display:contents children's original containing-block size intact.
  const wrapper=document.createElement('div');wrapper.className='connection-track-character';
  activeLayers.before(wrapper);wrapper.append(activeLayers);
  closingGroup(activeCharacter,[{node:wrapper,duration:650}],'track-character');
 }
 function settle(group,state='done'){
  group.run++;group.animations.forEach(a=>a.cancel());group.animations=[];
  group.items.forEach(({node})=>node.classList.remove('closing-motion-running','closing-motion-waiting'));group.mark(state);
 }
 async function play(group){
  group.mark('running');const run=++group.run;
  group.items.forEach(({node})=>{node.classList.remove('closing-motion-waiting');node.classList.add('closing-motion-running');});
  try{
   const motions=group.items.map(({node,delay=0,duration=700,scale=1})=>{
    const frames=group.kind==='track-character'?[{opacity:0},{opacity:getComputedStyle(node).opacity}]:
     [{opacity:0,translate:'0 14px',scale},{opacity:getComputedStyle(node).opacity,translate:'0 0',scale:1}];
    const a=node.animate(frames,
     {delay,duration,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
    group.animations.push(a);return a.finished;
   });
   await Promise.all(motions);if(group.run!==run)return;
   group.animations.forEach(a=>a.cancel());group.animations=[];
   if(group.kind==='archive-character'){
    const a=group.items[0].node.animate([{translate:'0 0'},{translate:'0 -6px'},{translate:'0 0'}],
     {duration:1200,iterations:2,easing:'ease-in-out',fill:'both'});
    group.animations.push(a);await a.finished;if(group.run!==run)return;
   }
   if(group.kind==='track-character'){
    const a=group.items[0].node.animate([{rotate:'0deg'},{rotate:'-1.4deg'},{rotate:'.8deg'},{rotate:'0deg'}],
     {duration:1600,iterations:1,easing:'ease-in-out',fill:'both'});
    group.animations.push(a);await a.finished;if(group.run!==run)return;
   }
   settle(group);
  }catch{if(group.run===run)settle(group);}
 }
 let frame=0,printing=false;
 function render(){
  frame=0;const final=reduced.matches||printing,height=innerHeight;
  // Batch geometry reads before touching styles. The mask never changes these bounds.
  const positions=routes.map(node=>({node,rect:node.getBoundingClientRect()})),banner=yellow?.getBoundingClientRect();
  const entrances=closing.map(group=>({group,rect:group.anchor.getBoundingClientRect()}));
  const atEnd=scrollY+height>=document.documentElement.scrollHeight-2;
  positions.forEach(({node,rect})=>{
   const progress=final?1:rect.height?clamp((height*.60-rect.top)/rect.height):1;
   const value=progress.toFixed(4);if(node.dataset.connectionProgress===value)return;
   node.dataset.connectionProgress=value;
   // Filled ribbons and stroked curves share the same short feather, revealing
   // the exact original SVG without inventing a curve or a hard horizontal cut.
   node.style.maskImage=progress>=1?'none':progress<=0?'linear-gradient(transparent,transparent)':
    `linear-gradient(to bottom,#000 calc(${progress*100}% - 12px),transparent calc(${progress*100}% + 12px))`;
  });
  if(yellow&&banner){
   const progress=final?1:clamp((height*.90-(banner.top+banner.height/2))/(height*.42));
   const value=progress.toFixed(4);if(yellow.dataset.connectionProgress!==value){
    yellow.dataset.connectionProgress=value;
    const settle=1-Math.pow(1-progress,3),copySettle=1-Math.pow(1-clamp((progress-.08)/.92),3);
    yellow.style.setProperty('--connection-save-scale',String(.92+.08*settle));
    yellow.style.setProperty('--connection-save-rise',`${24*(1-settle)}px`);
    yellow.style.setProperty('--connection-copy-rise',`${14*(1-copySettle)}px`);
   }
  }
  entrances.forEach(({group,rect})=>{
   if(final||!Element.prototype.animate){if(group.state!=='done')settle(group);return;}
   if(rect.bottom< -80||rect.top>height+80){
    if(group.state!=='idle')settle(group,'idle');
    group.items.forEach(({node})=>node.classList.toggle('closing-motion-waiting',rect.top>height+80));return;
   }
   if(group.state==='idle'&&rect.bottom<=72)group.items.forEach(({node})=>node.classList.remove('closing-motion-waiting'));
   if(group.state==='idle'&&rect.bottom>72&&rect.top<height&&(rect.top<=height*.65||atEnd))play(group);
  });
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(render);};
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('pageshow',schedule);document.fonts.ready.then(schedule);
 reduced.addEventListener('change',()=>{if(reduced.matches)render();else schedule();});
 window.addEventListener('beforeprint',()=>{printing=true;render();});
 window.addEventListener('afterprint',()=>{printing=false;schedule();});
 render();
})();
