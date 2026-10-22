/* STEP 3-C: scoped scroll connections and finite closing motions, without pinning. */
(()=>{
 'use strict';
 const reduced=dangoReducedMotion,clamp=n=>Math.min(1,Math.max(0,n));
 // Keep the original SVGs and their Figma rotation/skew. Reveal their unrotated
 // containing boxes against one shared reading line, including the clipped section seam.
 const routes=['148:3217','148:3216','148:3192','148:3185','148:3177'].map(id=>document.querySelector(`[data-node-id="${id}"]`)).filter(Boolean);
 routes.forEach(n=>n.classList.add('connection-route'));
 const routeArt=new Map();let dottedArt;
 const svgNS='http://www.w3.org/2000/svg';
 const svgElement=(tag,attributes={})=>{const node=document.createElementNS(svgNS,tag);Object.entries(attributes).forEach(([key,value])=>node.setAttribute(key,String(value)));return node;};
 async function enhanceRoute(node,mode){
  const image=node?.querySelector('img');if(!image)return;
  let svg;
  try{
   const response=await fetch(image.src);if(!response.ok)throw new Error('route asset unavailable');
   const parsed=new DOMParser().parseFromString(await response.text(),'image/svg+xml');
   if(parsed.documentElement.localName!=='svg'||parsed.querySelector('parsererror,script,foreignObject'))return;
   svg=document.importNode(parsed.documentElement,true);svg.setAttribute('class',(image.getAttribute('class')||'')+' connection-route-art');svg.setAttribute('aria-hidden','true');
   svg.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
   const paths=[...svg.querySelectorAll('path')],defs=svgElement('defs'),id='dango-route-'+node.dataset.nodeId.replace(/[^a-z0-9]/gi,'-');
   svg.prepend(defs);const art={svg,mode};
   if(mode==='flow'){
    const gradient=svgElement('linearGradient',{id,gradientUnits:'userSpaceOnUse',x1:0,y1:0,x2:0,y2:140});
    [[0,0],[.5,.65],[1,0]].forEach(([at,opacity])=>gradient.append(svgElement('stop',{offset:at,'stop-color':'#fff','stop-opacity':opacity})));
    defs.append(gradient);const overlay=svgElement('g',{'aria-hidden':'true'});
    paths.forEach(path=>{const copy=path.cloneNode(true);copy.setAttribute('fill','url(#'+id+')');overlay.append(copy);});svg.append(overlay);Object.assign(art,{gradient,overlay});
   }else if(mode==='setup'){
    // The invisible mask follows the original SVG dash centres, including its 90-degree placement.
    const mask=svgElement('mask',{id,maskUnits:'userSpaceOnUse',x:-24,y:-24,width:914,height:1063});
    const stroke=svgElement('path',{d:'M1.5 1013.2V7.25H413.107V1013.2H857.73V8',fill:'none',stroke:'#fff','stroke-width':24,'stroke-linecap':'round','stroke-linejoin':'round',pathLength:1,'stroke-dasharray':'1 1'});
    mask.append(stroke);defs.append(mask);const group=svgElement('g');paths.forEach(path=>group.append(path));svg.append(group);stroke.setAttribute('stroke-dashoffset','1');group.setAttribute('mask','url(#'+id+')');Object.assign(art,{stroke,group,id,state:'idle'});
   }
   image.replaceWith(svg);
   if(mode==='track'){
    art.paths=paths.map(path=>({path,length:path.getTotalLength()}));if(!art.paths.every(n=>n.length>0))throw new Error('empty route');
   }
   if(mode==='setup')dottedArt={node,...art};else routeArt.set(node,art);
   node.dataset.routeMode=mode;schedule();
  }catch{if(svg?.isConnected)svg.replaceWith(image);}
 }
 routes.forEach(node=>enhanceRoute(node,node.dataset.nodeId==='148:3177'?'track':'flow'));
 enhanceRoute(document.querySelector('#profile-setup [data-node-id="148:3218"]'),'setup');

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
 const sleepyCharacter=document.querySelector('#easy-save [data-node-id="148:3170"]');
 if(sleepyCharacter)closingGroup(sleepyCharacter,[{node:sleepyCharacter,duration:600}],'sleepy-character');
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
     group.kind==='ending'&&node.dataset.nodeId==='148:4756'?
     [{opacity:0,translate:'96px 0',scale:1},{opacity:getComputedStyle(node).opacity,translate:'0 0',scale:1}]:
     [{opacity:0,translate:'0 14px',scale},{opacity:getComputedStyle(node).opacity,translate:'0 0',scale:1}];
    const a=node.animate(frames,
     {delay:dangoMotionTime(delay),duration:dangoMotionTime(duration),easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
    group.animations.push(a);return a.finished;
   });
   await Promise.all(motions);if(group.run!==run)return;
   group.animations.forEach(a=>a.cancel());group.animations=[];
   if(group.kind==='archive-character'){
    const a=group.items[0].node.animate([{translate:'0 0',offset:0},{translate:'0 3px',offset:.16},{translate:'0 -32px',offset:.48},{translate:'0 0',offset:.84},{translate:'0 0',offset:1}],
     {duration:dangoMotionTime(900),iterations:2,easing:'ease-in-out',fill:'both'});
    group.animations.push(a);await a.finished;if(group.run!==run)return;
   }
   if(group.kind==='sleepy-character'){
    const a=group.items[0].node.animate([{translate:'0 0',rotate:'0deg',scale:1},{translate:'0 -4px',rotate:'-1deg',scale:1.015},{translate:'0 0',rotate:'0deg',scale:1}],{duration:dangoMotionTime(1400),iterations:2,easing:'ease-in-out',fill:'both'});
    group.animations.push(a);await a.finished;if(group.run!==run)return;
   }
   if(group.kind==='track-character'){
    const a=group.items[0].node.animate([{rotate:'0deg'},{rotate:'-1.4deg'},{rotate:'.8deg'},{rotate:'0deg'}],
     {duration:dangoMotionTime(1600),iterations:1,easing:'ease-in-out',fill:'both'});
    group.animations.push(a);await a.finished;if(group.run!==run)return;
   }
   settle(group);
  }catch{if(group.run===run)settle(group);}
 }
 // One timed sweep follows the authored dotted route after it enters view.
 // Scrolling only triggers it; subsequent scroll events never scrub or restart it.
 function finishSetup(){
  if(!dottedArt)return;
  const art=dottedArt;art.animation?.cancel();art.animation=null;art.state='done';
  art.stroke.setAttribute('stroke-dashoffset','0');art.group.removeAttribute('mask');
  art.node.dataset.setupState='done';art.node.dataset.setupProgress='1';
 }
 function playSetup(){
  const art=dottedArt;if(!art||art.state!=='idle')return;
  if(!Element.prototype.animate){finishSetup();return;}
  art.state='running';art.node.dataset.setupState='running';art.node.dataset.setupProgress='0';
  art.animation=art.stroke.animate([{strokeDashoffset:'1'},{strokeDashoffset:'0'}],
   {duration:dangoMotionTime(1750),easing:'cubic-bezier(.4,0,.2,1)',fill:'both'});
  art.animation.onfinish=finishSetup;
 }
 let frame=0,printing=false;
 function render(){
  frame=0;const final=reduced.matches||printing,height=innerHeight;
  // Batch geometry reads before touching styles. The mask never changes these bounds.
  const positions=routes.map(node=>({node,rect:node.getBoundingClientRect()})),banner=yellow?.getBoundingClientRect();
  const trackRect=document.querySelector('#active-walk')?.getBoundingClientRect(),setupRect=dottedArt?.node.getBoundingClientRect();
  const entrances=closing.map(group=>({group,rect:group.anchor.getBoundingClientRect()}));
  const atEnd=scrollY+height>=document.documentElement.scrollHeight-2;
  positions.forEach(({node,rect})=>{
   const track=node.dataset.nodeId==='148:3177'&&trackRect;
   const progress=final?1:track?clamp((height*.98-track.top)/(Math.min(track.height,height)*.45)):rect.height?clamp((height*.70-rect.top)/rect.height):1;
   node.dataset.connectionProgress=progress.toFixed(4);node.style.maskImage='none';
   const art=routeArt.get(node);if(!art)return;
   if(art.mode==='flow'){
    // One screen-space band crosses both original pink/blue ribbons without hiding their join.
    art.overlay.style.opacity=final?'0':'1';const matrix=art.svg.getScreenCTM();
    if(matrix){const m=DOMMatrix.fromMatrix(matrix).inverse().translate(0,height*.65-70);art.gradient.setAttribute('gradientTransform',`matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`);}
   }else{
    art.paths.forEach(({path,length})=>{path.style.strokeDasharray=progress>=1?'none':`${length} ${length}`;path.style.strokeDashoffset=String(length*(1-progress));path.style.opacity=progress<=0?'0':'';});
   }
  });
  if(dottedArt&&setupRect){
   if(final||setupRect.bottom<=72)finishSetup();
   else if(dottedArt.state==='idle'&&setupRect.top<height*.82)playSetup();
  }
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
