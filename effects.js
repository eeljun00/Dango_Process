(() => {
 'use strict';
 const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
 const reduced=dangoReducedMotion;
 const variants=['up','soft','left','scale'];
 qa('.design-section').forEach((section,i)=>qa('.reveal-text',section).forEach((n,j)=>{const s=getComputedStyle(n),large=parseFloat(s.fontSize)>=32||qa('*',n).some(c=>parseFloat(getComputedStyle(c).fontSize)>=32),centered=s.textAlign==='center'||s.transform!=='none'&&Math.abs(parseFloat(s.left)-(n.offsetParent?.clientWidth||0)/2)<2;n.dataset.reveal=centered&&large?'down':j===0?'soft':variants[(i+Math.floor(j/3))%variants.length];}));
 // Home artwork and copy share the existing section fade, without a second text entrance.
 qa('#app-home .reveal-text').forEach(n=>n.classList.remove('reveal-text','is-revealed'));
 // Closing-page copy stays static; its decorative flowers move independently.
 qa('#thank-you .reveal-text').forEach(n=>n.classList.remove('reveal-text','is-revealed'));
 const typeRows=qa('#typography p').filter(n=>parseFloat(getComputedStyle(n).left)>900);
 const observers=[];
 // STEP 3-A: own only these entrances; keep Figma transform/rotation and native layout intact.
 const entryGroups=[];
 function ownEntrance(root){
  [root,...qa('.reveal-text',root)].forEach(n=>n.classList.remove('reveal-text','is-revealed'));
 }
 function entrance(nodes,{kind,duration,delay=0,delays,counts=[],anchor=nodes[0],easing='cubic-bezier(.22,1,.36,1)',frames,onStart,onSettle}={}){
  if(!nodes.length||!anchor)return;
  const timing=i=>delays?.[i]??i*delay;
  nodes.forEach((n,i)=>{n.dataset.entryKind=typeof kind==='function'?kind(n,i):kind;n.dataset.entryState='pending';n.style.setProperty('--entry-delay',`${dangoMotionTime(timing(i))}ms`);n.classList.add('entry-motion-pending');});
  const group={nodes,anchor,started:false,animations:[],observer:null};entryGroups.push(group);
  const finish=()=>{group.observer?.disconnect();nodes.forEach(n=>{n.classList.remove('entry-motion-pending');n.dataset.entryState='done';});counts.forEach(c=>{c.node.textContent=c.final+'%';c.node.style.removeProperty('width');});group.animations.forEach(a=>a.cancel());onSettle?.();};
  group.finish=finish;
  const play=()=>{
   if(group.started)return;group.started=true;group.observer?.disconnect();
   if(reduced.matches||!Element.prototype.animate){finish();return;}
   onStart?.();
   nodes.forEach((n,i)=>{
    if(n.dataset.entryState==='done')return;
    n.dataset.entryState='running';
    const counter=counts[i];
    if(counter){counter.node.textContent=counter.final+'%';counter.node.style.removeProperty('width');counter.node.style.width=getComputedStyle(counter.node).width;counter.node.textContent='0%';}
    const a=n.animate(typeof frames==='function'?frames(n,i):frames,{duration:dangoMotionTime(typeof duration==='function'?duration(n,i):duration),delay:dangoMotionTime(timing(i)),easing,fill:'both'});group.animations.push(a);
    if(counter){const tick=()=>{if(n.dataset.entryState!=='running')return;const progress=Math.min(1,Math.max(0,a.effect.getComputedTiming().progress||0));counter.node.textContent=Math.round(counter.final*progress)+'%';requestAnimationFrame(tick);};requestAnimationFrame(tick);}
    a.onfinish=()=>{n.classList.remove('entry-motion-pending');n.dataset.entryState='done';if(counter){counter.node.textContent=counter.final+'%';counter.node.style.removeProperty('width');}a.cancel();};
   });
  };
  if(reduced.matches||!('IntersectionObserver'in window)){finish();return group;}
  group.observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){
   if(kind==='cover')Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,900))]).then(play);else play();
  }},{threshold:0,rootMargin:'0px 0px -8% 0px'});group.observer.observe(anchor);
  return group;
 }
 const cover=q('#intro [data-node-id="148:7503"]');
 if(cover){ownEntrance(cover);entrance([cover],{kind:'cover',duration:950,easing:'cubic-bezier(.18,.85,.28,1.18)',frames:[{opacity:0,translate:'0 28px',scale:.92},{opacity:1,translate:'0 0',scale:1}]});}
 // A scroll-driven liquid surface rises and rolls sideways; no idle animation or input interception.
 function coverWaterPath(fill){
  const tau=Math.PI*2,level=380-440*fill,amplitude=48*Math.pow(1-fill,.75),phase=tau*fill,height=3712,segments=18;
  const front=x=>level+amplitude*(Math.sin(tau*1.5*x-phase)+.18*Math.sin(tau*3*x+phase*.65));
  const slope=x=>amplitude*(tau*1.5*Math.cos(tau*1.5*x-phase)+.18*tau*3*Math.cos(tau*3*x+phase*.65));
  let path=`M0 ${front(0)/height}`;
  for(let i=1;i<=segments;i++){
   const x0=(i-1)/segments,x1=i/segments,step=(x1-x0)/3;
   path+=` C${x0+step} ${(front(x0)+slope(x0)*step)/height} ${x1-step} ${(front(x1)-slope(x1)*step)/height} ${x1} ${front(x1)/height}`;
  }
  return path+' L1 1 L0 1 Z';
 }
 // Spend a short native scroll range drawing each boundary before the artwork moves on.
 function roundScrollStage(sectionSelector,surfaceSelector,kind,boundaryLocal){
  const section=q(sectionSelector);if(!section)return;
  const canvas=q('.design-canvas',section),surface=q(surfaceSelector,section);
  if(!canvas||!surface)return;
  section.classList.add('round-scroll-stage');
  surface.classList.add('round-scroll-surface',`${kind}-round-surface`);
  // Morph the whole edge as a continuous Bezier arc, rather than rounding only its corners.
  const ns='http://www.w3.org/2000/svg',mask=document.createElementNS(ns,'svg'),defs=document.createElementNS(ns,'defs'),clip=document.createElementNS(ns,'clipPath'),edge=document.createElementNS(ns,'path');
  mask.setAttribute('width','0');mask.setAttribute('height','0');mask.setAttribute('aria-hidden','true');mask.style.position='absolute';
  clip.id=`dango-round-${kind}`;clip.setAttribute('clipPathUnits','objectBoundingBox');clip.append(edge);defs.append(clip);mask.append(defs);section.append(mask);
  surface.style.clipPath=`url(#${clip.id})`;
  let frame=0,lastOffset=-1,lastProgress=-1,lastLength=-1,shownProgress=null,lastTime=0,stagePrinting=false;
  const render=now=>{
   frame=0;
   const frozen=reduced.matches||stagePrinting;
   const length=frozen?0:Math.round(kind==='cover'?Math.min(900,Math.max(500,innerHeight*.85)):Math.min(1040,Math.max(480,innerHeight*.9)));
   if(length!==lastLength){section.style.setProperty('--round-hold-length',`${length}px`);lastLength=length;}
   const rect=section.getBoundingClientRect(),scale=canvas.getBoundingClientRect().width/1920.375;
   const readingLine=kind==='cover'?0:innerHeight*(kind==='vision'?.86:.43);
   const start=rect.top+scrollY+boundaryLocal*scale-readingLine;
   const offset=Math.max(0,Math.min(length,scrollY-start));
   const phase=length?offset/length:1;
   const drawing=Math.max(0,Math.min(1,(phase-.12)/.72));
   const target=drawing*drawing*drawing*(drawing*(drawing*6-15)+10);
   const dt=lastTime?Math.max(1,Math.min(64,now-lastTime)):16.67;lastTime=now;
   if(shownProgress===null||frozen||phase<=0||phase>=1)shownProgress=target;
   else shownProgress+=(target-shownProgress)*(1-Math.exp(-dt/95));
   if(Math.abs(target-shownProgress)<.0002)shownProgress=target;
   const progress=shownProgress;
   if(offset!==lastOffset){section.style.setProperty('--round-hold-offset',`${offset.toFixed(3)}px`);lastOffset=offset;}
   const drawProgress=kind==='cover'&&frozen?0:progress;
   if(drawProgress!==lastProgress){
    const curveProgress=kind==='cover'?1-drawProgress:drawProgress;
    surface.style.setProperty('--round-progress',curveProgress.toFixed(4));
    if(kind==='cover'){
     section.style.setProperty('--cover-round-progress',curveProgress.toFixed(4));
     section.dataset.coverFill=drawProgress.toFixed(4);
     edge.setAttribute('d',coverWaterPath(drawProgress));
    }else{
    const half=.5*progress,control=.223858*progress;
    edge.setAttribute('d',kind==='character'?`M0 1 L0 ${half} C0 ${control} .223858 0 .5 0 C.776142 0 1 ${control} 1 ${half} L1 1 Z`:`M0 0 L1 0 L1 ${1-half} C1 ${1-control} .776142 1 .5 1 C.223858 1 0 ${1-control} 0 ${1-half} Z`);
    }
    lastProgress=drawProgress;
   }
   section.dataset.roundState=frozen?'static':phase<=0?'before':phase>=1?'after':'drawing';
   if(progress!==target&&!frozen)frame=requestAnimationFrame(render);
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(render);};
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('pageshow',schedule);
  reduced.addEventListener('change',schedule);
  window.addEventListener('beforeprint',()=>{stagePrinting=true;render(performance.now());});
  window.addEventListener('afterprint',()=>{stagePrinting=false;schedule();});
  render(performance.now());
 }
 roundScrollStage('#intro','[data-node-id="148:7501"]','cover',0);
 roundScrollStage('#strategy','[data-node-id="148:4764"]','vision',4170.15);
 roundScrollStage('#branding','[data-node-id="148:2307"]','character',679.4);
 // A full-height pink box draws in on scroll and resets after the copy leaves the viewport.
 const saveHighlight=q('.walk-save-highlight');
 if(saveHighlight){
  const showHighlight=()=>saveHighlight.classList.add('is-highlighted');
  if(reduced.matches||!('IntersectionObserver'in window))showHighlight();
  else{
   const observer=new IntersectionObserver(entries=>entries.forEach(entry=>saveHighlight.classList.toggle('is-highlighted',reduced.matches||entry.isIntersecting)),{threshold:.35,rootMargin:'0px 0px -12% 0px'});
   observer.observe(saveHighlight.closest('p'));
  }
  reduced.addEventListener('change',()=>{if(reduced.matches)showHighlight();});
 }
 // Reuse the original ornament groups; a full-canvas shell preserves percentage coordinates.
 const introCanvas=q('#intro .design-canvas'),introArt=introCanvas?.firstElementChild;
 if(introArt){
  const popcornIds=['148:7533','148:7527','148:7549','148:7557'];
  const popcornTargets=new Map();
  const popcornObserver=new IntersectionObserver(entries=>entries.forEach(entry=>popcornTargets.get(entry.target)?.classList.toggle('is-popcorn-visible',entry.isIntersecting)),{rootMargin:'0px 0px -8% 0px'});
  const base=introCanvas.getBoundingClientRect(),scale=base.width/1920.375;
  ['148:7527','148:7533','148:7541','148:7542','148:7545','148:7549','148:7557','148:7564','148:7565'].forEach((id,i)=>{
   const art=q('[data-node-id="'+id+'"]',introArt);if(!art)return;
   const bounds=[art,...qa('[data-node-id]',art)].map(n=>n.getBoundingClientRect()).filter(r=>r.width>0&&r.height>0);if(!bounds.length)return;
   const x=(Math.min(...bounds.map(r=>r.left))-base.left)/scale,y=(Math.min(...bounds.map(r=>r.top))-base.top)/scale;
   const right=(Math.max(...bounds.map(r=>r.right))-base.left)/scale,bottom=(Math.max(...bounds.map(r=>r.bottom))-base.top)/scale;
   const shell=document.createElement('div');shell.className='cover-decoration-entrance';shell.dataset.coverDecoration=id;
   Object.assign(shell.style,{position:'absolute',inset:'0',pointerEvents:'none',transformOrigin:`${(x+right)/2}px ${(y+bottom)/2}px`});art.before(shell);shell.append(art);
   const trigger=document.createElement('span');trigger.setAttribute('aria-hidden','true');Object.assign(trigger.style,{position:'absolute',left:x+'px',top:y+'px',width:'1px',height:'1px',visibility:'hidden',pointerEvents:'none'});introArt.append(trigger);
   const popcornIndex=popcornIds.indexOf(id);
   if(popcornIndex!==-1){
    // A second full-canvas layer keeps the authored percentage positions and entrance intact.
    const hop=document.createElement('div');hop.className='cover-decoration-popcorn';
    Object.assign(hop.style,{position:'absolute',inset:'0',transformOrigin:shell.style.transformOrigin});
    hop.style.setProperty('--popcorn-delay',`${popcornIndex*.45}s`);
    hop.style.setProperty('--popcorn-rise',`${[8,6,9,6][popcornIndex]}px`);
    hop.style.setProperty('--popcorn-x',`${[-1,1,1,-1][popcornIndex]}px`);
    hop.style.setProperty('--popcorn-tilt',`${[-3,2,3,-2][popcornIndex]}deg`);
    art.before(hop);hop.append(art);popcornTargets.set(trigger,shell);popcornObserver.observe(trigger);
   }
   entrance([shell],{kind:'cover-decoration',anchor:trigger,duration:650,delays:[i%3*50],easing:'cubic-bezier(.18,.85,.28,1.18)',frames:[{opacity:0,scale:.72,translate:`${x<960?-14:14}px 12px`},{opacity:1,scale:1,translate:'0 0'}]});
  });
 }
 // These authored artwork groups own their entrance independently of text reveals.
 const pinkLogo=q('#logo-grid [data-node-id="148:2842"]');
 if(pinkLogo){ownEntrance(pinkLogo);entrance([pinkLogo],{kind:'logo-application',duration:1200,frames:[{opacity:0,translate:'36px 0'},{opacity:1,translate:'0 0'}]});}
 const photoLogo=q('#logo [data-node-id="148:4748"]');
 if(photoLogo){ownEntrance(photoLogo);entrance([photoLogo],{kind:'logo-photo',duration:1100,frames:[{opacity:0,translate:'-36px 0'},{opacity:1,translate:'0 0'}]});}
 // One observer starts the line first, then phones and dots on the same clock.
 const onboarding=['148:4724','148:4725','148:4726','148:4740','148:4741'].map(id=>q('#onboarding [data-node-id="'+id+'"]')).filter(Boolean);
 onboarding.forEach(ownEntrance);
 const onboardingLine=q('#onboarding [data-node-id="148:4730"] .r520');
 const onboardingDots=['148:4732','148:4733','148:4735','148:4736','148:4738','148:4739'].map(id=>q('#onboarding [data-node-id="'+id+'"]')).filter(Boolean);
 if(onboardingLine&&onboarding.length===5){
  const trigger=document.createElement('span');trigger.className='onboarding-sequence-trigger';trigger.setAttribute('aria-hidden','true');
  Object.assign(trigger.style,{position:'absolute',left:'0',top:'0',width:'1px',height:'1px',visibility:'hidden',pointerEvents:'none'});onboardingLine.parentElement.append(trigger);
  entrance([onboardingLine,...onboarding,...onboardingDots],{anchor:trigger,
   kind:(n,i)=>i===0?'onboarding-line':i<=5?'onboarding-phone':'onboarding-dot',
   duration:(n,i)=>i===0?560:i<=5?640:130,delays:[0,80,200,320,440,440,78,78,252,252,426,426],
   frames:(n,i)=>i===0?[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)'}]:i<=5?[{opacity:0,translate:'0 18px'},{opacity:1,translate:'0 0'}]:[{opacity:0},{opacity:1}],easing:'linear'});
 }
 // Overview owns the six leaf capsules; overview.js handles their bounded physics.
 const capsules=['148:7519','148:7517','148:7515','148:7506','148:7511','148:7513'].map(id=>q(`#intro [data-node-id="${id}"]`)).filter(Boolean);
 capsules.forEach(ownEntrance);
 const chart=q('#research [data-node-id="148:7450"]');
 if(chart)ownEntrance(chart); // Labels and percentages stay still while only the colored bars fill.
 const bars=['148:7452','148:7457','148:7463','148:7469'].map(id=>q(`#research [data-node-id="${id}"]`)).filter(Boolean);
 const counts=['148:7455','148:7461','148:7467','148:7473'].map(id=>q(`#research [data-node-id="${id}"]`)).filter(Boolean).map(node=>{const final=parseInt(node.textContent,10);node.setAttribute('aria-label',final+'%');node.classList.add('research-count');if(!reduced.matches){node.style.width=getComputedStyle(node).width;node.textContent='0%';}return{node,final};});
 entrance(bars,{kind:'bar',duration:1800,delay:130,counts,anchor:chart,easing:'cubic-bezier(.4,0,.2,1)',frames:[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)'}]});
 const keywordCard=q('#research [data-node-id="148:7419"]');
 const keywords=keywordCard?qa('.f149',keywordCard):[];keywords.forEach(ownEntrance);
 entrance(keywords,{kind:'keyword',duration:600,delay:100,anchor:keywordCard,frames:[{opacity:0,translate:'0 12px'},{opacity:1,translate:'0 0'}]});
 // Mobile already uses a reading list, without graph bars or a divider. Animate only its existing keywords.
 const mobileKeywords=qa('#research .mobile-reading .reading-card li');mobileKeywords.forEach(ownEntrance);
 entrance(mobileKeywords,{kind:'keyword',duration:600,delay:100,anchor:mobileKeywords[0]?.closest('ul'),frames:[{opacity:0,translate:'0 12px'},{opacity:1,translate:'0 0'}]});
 const divider=['148:7481','148:7479'].map(id=>q(`#research [data-node-id="${id}"]`)).filter(Boolean);
 entrance(divider,{kind:'divider',duration:900,easing:'ease-in-out',frames:(n,i)=>[{clipPath:i?'inset(0 0 0 100%)':'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0%)'}]});
 // One observer and one row clock prevent the table from restarting halfway down.
 typeRows.sort((a,b)=>parseFloat(getComputedStyle(a).top)-parseFloat(getComputedStyle(b).top)||parseFloat(getComputedStyle(a).left)-parseFloat(getComputedStyle(b).left));
 const rowTops=[...new Set(typeRows.map(n=>Math.round(parseFloat(getComputedStyle(n).top))))];typeRows.forEach(ownEntrance);
 entrance(typeRows,{kind:'type-row',duration:550,delays:typeRows.map(n=>rowTops.indexOf(Math.round(parseFloat(getComputedStyle(n).top)))*80),frames:[{opacity:0,translate:'0 -12px'},{opacity:1,translate:'0 0'}]});
 // STEP 3-B has its own replayable triggers; the existing one-shot entrances above stay unchanged.
 // Observe stationary points, not the translated artwork. Vertical IO percentages use root width,
 // so derive the reading band from viewport height in pixels instead.
 const scrollGroups=[],scrollTargets=new Map();let bandObserver,exitObserver,triggerFrame=0,printing=false;
 function scrollEntrance(nodes,{kind,duration,delays,frames,onStart,onSettle,timingRate=dangoMotionRate}={}){
  const first=nodes[0];if(!first)return;const time=milliseconds=>milliseconds/timingRate;
  const anchor=document.createElement('span'),style=getComputedStyle(first),matrix=new DOMMatrixReadOnly(style.transform==='none'?undefined:style.transform);
  anchor.className='step3b-scroll-trigger';anchor.setAttribute('aria-hidden','true');
  anchor.style.left=`${parseFloat(style.left)+parseFloat(style.width)/2+matrix.m41}px`;
  anchor.style.top=`${parseFloat(style.top)+parseFloat(style.height)/2+matrix.m42}px`;
  let parent=first.parentElement;while(parent&&getComputedStyle(parent).display==='contents')parent=parent.parentElement;
  (first.offsetParent||parent).append(anchor); // The existing mobile reading view hides the desktop diagram.
  const group={nodes,anchor,armed:true,animations:[],runs:0};scrollGroups.push(group);scrollTargets.set(anchor,group);
  const cancel=()=>{group.animations.forEach(a=>{a.onfinish=null;a.cancel();});group.animations=[];onSettle?.();};
  const pending=()=>nodes.forEach(n=>{n.dataset.entryKind=kind;n.dataset.entryState='pending';n.classList.add('entry-motion-pending');});
  const finish=()=>{cancel();nodes.forEach(n=>{n.classList.remove('entry-motion-pending');n.dataset.entryState='done';});};
  const focused=()=>nodes.some(n=>n.contains(document.activeElement));
  group.finish=()=>{group.armed=false;finish();};
  group.park=()=>{
   if(reduced.matches||printing||focused()){group.finish();return;}
   cancel();group.armed=true;pending(); // Rearm only while entirely outside the viewport + 180px.
  };
  group.play=()=>{
   if(!group.armed)return;
   if(reduced.matches||printing||focused()||!Element.prototype.animate){group.finish();return;}
   cancel();group.armed=false;group.runs++;pending();onStart?.();
   nodes.forEach((n,i)=>{
    n.dataset.entryState='running';n.dataset.scrollRuns=String(group.runs);
    const a=n.animate(frames,{duration:time(duration),delay:time(delays?.[i]||0),easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});group.animations.push(a);
    a.onfinish=()=>{n.classList.remove('entry-motion-pending');n.dataset.entryState='done';a.onfinish=null;a.cancel();};
   });
  };
  nodes.forEach((n,i)=>{n.style.setProperty('--entry-delay',`${time(delays?.[i]||0)}ms`);n.addEventListener('focusin',group.finish);});
  pending();if(reduced.matches||!('IntersectionObserver'in window)||!Element.prototype.animate)group.finish();
  return group;
 }
 function connectStep3B(){
  triggerFrame=0;bandObserver?.disconnect();exitObserver?.disconnect();
  if(reduced.matches||printing||!('IntersectionObserver'in window)||!Element.prototype.animate){scrollGroups.forEach(g=>g.finish());return;}
  const height=innerHeight;
  bandObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)scrollTargets.get(e.target)?.play();}),
   {rootMargin:`-${Math.round(height*.30)}px 0px -${Math.round(height*.35)}px 0px`,threshold:0});
  exitObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
   const g=scrollTargets.get(e.target),r=e.boundingClientRect;if(!g||!r.width||!r.height)return;
   if(!e.isIntersecting)g.park();
   // A reload or an instant jump can land above the band, already in clear view.
   else if(r.top>=0&&r.top<=height*.65)g.play();
  }),{rootMargin:'180px 0px 180px 0px',threshold:0});
  scrollGroups.forEach(g=>{bandObserver.observe(g.anchor);exitObserver.observe(g.anchor);});
 }
 const refreshStep3B=()=>{if(!triggerFrame)triggerFrame=requestAnimationFrame(connectStep3B);};
 window.addEventListener('resize',refreshStep3B,{passive:true});
 window.addEventListener('pageshow',()=>requestAnimationFrame(refreshStep3B));
 document.fonts.ready.then(refreshStep3B);
 // Restored scroll positions and large wheel jumps can skip the narrow observer band.
 // Inspect only these eleven fixed points once per scroll frame; ordinary upward entry still waits for 30%.
 let viewFrame=0,lastViewY=scrollY,jumped=false;
 window.addEventListener('scroll',()=>{
  jumped=jumped||Math.abs(scrollY-lastViewY)>innerHeight*.30;lastViewY=scrollY;
  if(viewFrame)return;viewFrame=requestAnimationFrame(()=>{
   viewFrame=0;const top=jumped?0:innerHeight*.30;jumped=false;if(reduced.matches||printing)return;
   const visible=scrollGroups.filter(g=>g.armed).map(g=>({g,r:g.anchor.getBoundingClientRect()}));
   visible.forEach(({g,r})=>{if(r.width&&r.height&&r.top>=top&&r.top<=innerHeight*.65)g.play();});
  });
 },{passive:true});
 reduced.addEventListener('change',()=>{
  if(reduced.matches){bandObserver?.disconnect();exitObserver?.disconnect();scrollGroups.forEach(g=>g.finish());}
  else refreshStep3B();
 });
 window.addEventListener('beforeprint',()=>{printing=true;scrollGroups.forEach(g=>g.finish());});
 window.addEventListener('afterprint',()=>{printing=false;refreshStep3B();});
 // The chart starts all app entrances together as its panel enters the viewport.
 // Their original centering transforms, coordinates, axes and rings remain authored.
 const panel=q('#strategy [data-node-id="148:4855"]');
 const halo=q('#strategy [data-node-id="148:4871"]');
 if(panel&&halo){
  let haloAnimation;
  halo.dataset.positioningHalo='pending';
  const settleHalo=()=>{if(haloAnimation){haloAnimation.onfinish=null;haloAnimation.cancel();haloAnimation=null;}halo.dataset.positioningHalo='done';};
  const playHalo=()=>{
   if(reduced.matches||!Element.prototype.animate){settleHalo();return;}
   halo.dataset.positioningHalo='running';
   haloAnimation=halo.animate([{scale:1,opacity:.7},{scale:1.035,opacity:.58},{scale:1,opacity:.7}],{delay:40,duration:900,iterations:1,easing:'ease-in-out'});
   haloAnimation.onfinish=settleHalo;
  };
  const apps=['148:4880','148:4882','148:4888','148:4884','148:4890','148:4886','148:4872'].map(id=>q(`[data-node-id="${id}"]`,panel)).filter(Boolean);
  apps.forEach((app,i)=>{
   const dango=app.dataset.nodeId==='148:4872';ownEntrance(app);app.style.setProperty('--positioning-rise','0px');
   // Dango blooms into place; competitors use a short fade on the same panel clock.
   entrance([app],{kind:'positioning-app',anchor:panel,duration:dango?620:280,delays:[dango?100:i*25],
    frames:dango?[{opacity:0,scale:.72,rotate:'-8deg'},{opacity:1,scale:1,rotate:'0deg'}]:[{opacity:0},{opacity:1}],
    onStart:dango?playHalo:undefined,onSettle:dango?settleHalo:undefined});
  });
  reduced.addEventListener('change',()=>{if(reduced.matches)settleHalo();});
  window.addEventListener('beforeprint',settleHalo);
 }
 // If a large scroll skips an entrance entirely, leave the content above the viewport fully visible.
 let entryFrame=0;
 const settleSkipped=()=>{entryFrame=0;entryGroups.forEach(g=>{if(g.started||g.nodes.every(n=>n.dataset.entryState==='done'))return;const r=g.anchor.getBoundingClientRect();if(r.width&&r.height&&r.bottom<0){g.started=true;g.finish();}});};
 window.addEventListener('scroll',()=>{if(!entryFrame)entryFrame=requestAnimationFrame(settleSkipped);},{passive:true});
 reduced.addEventListener('change',()=>{if(reduced.matches)entryGroups.forEach(g=>g.finish());});
 window.addEventListener('beforeprint',()=>entryGroups.forEach(g=>g.finish()));
 function sequence(nodes,{group=1,delay=100,kind=''}={}){
  nodes.forEach((n,i)=>{n.style.setProperty('--motion-opacity',getComputedStyle(n).opacity);n.style.setProperty('--motion-delay',`${dangoMotionTime(Math.floor(i/group)*delay)}ms`);n.classList.add('motion-item');if(kind)n.classList.add(kind);});
  if(!nodes.length)return;
  const reveal=()=>nodes.forEach(n=>n.classList.add('motion-visible'));
  if(reduced.matches||!('IntersectionObserver'in window)){reveal();return;}
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){reveal();observer.disconnect();}},{threshold:0,rootMargin:'0px 0px -8% 0px'});observer.observe(nodes[0].closest('section'));observers.push({observer,reveal});
 }
 const pawNodes=qa('#system [data-node-id]').filter(n=>{const id=Number(n.dataset.nodeId?.split(':')[1]);return id>=2826&&id<=2840&&getComputedStyle(n).display!=='contents';});
 const leftPaws=pawNodes.filter(n=>parseFloat(getComputedStyle(n).left)<960).sort((a,b)=>parseFloat(getComputedStyle(a).left)-parseFloat(getComputedStyle(b).left));
 const rightPaws=pawNodes.filter(n=>parseFloat(getComputedStyle(n).left)>=960).sort((a,b)=>parseFloat(getComputedStyle(b).left)-parseFloat(getComputedStyle(a).left));
 const paws=[];for(let i=0;i<Math.max(leftPaws.length,rightPaws.length);i++){if(leftPaws[i])paws.push(leftPaws[i]);if(rightPaws[i])paws.push(rightPaws[i]);}
 paws.forEach(n=>n.style.setProperty('--enter-x',parseFloat(getComputedStyle(n).left)<960?'-36px':'36px'));
 const pawDelay=paws.length>1?Math.floor((paws.length-1)/2)*180*1.5/(paws.length-1):0;
 sequence(paws,{group:1,delay:pawDelay,kind:'paw-step'});
 // Each original color row starts when its first actual box enters, not at the
 // section heading. A left-to-right wave replaces the previous section-wide fade.
 const swatches=qa('#color [data-node-id]').filter(n=>Math.abs(parseFloat(getComputedStyle(n).height)-155.984)<.1);
 const colorRows=new Map();
 swatches.forEach(n=>{const y=Math.round(parseFloat(getComputedStyle(n).top));if(!colorRows.has(y))colorRows.set(y,[]);colorRows.get(y).push(n);});
 [...colorRows].sort((a,b)=>a[0]-b[0]).forEach(([,row],rowIndex)=>{
  row.sort((a,b)=>parseFloat(getComputedStyle(a).left)-parseFloat(getComputedStyle(b).left));
  row.forEach((n,i)=>{ownEntrance(n);n.dataset.colorRow=String(rowIndex);n.dataset.colorColumn=String(i);});
  scrollEntrance(row,{kind:'color',duration:620,delays:row.map((_,i)=>i*85),timingRate:1,
   frames:[{opacity:0,translate:'-10px 0'},{opacity:1,translate:'0 0'}]});
 });
 refreshStep3B();
 const cheer=q('[data-node-id="148:2319"]');if(cheer){ownEntrance(cheer);cheer.classList.add('ppippo-pop');}
 // Keep each distinct interview once per period; repeat the complete row for a seamless marquee.
 const interview=q('#interview .design-canvas');
 const cards=qa('[data-node-id]',interview).filter(n=>getComputedStyle(n).position==='absolute'&&getComputedStyle(n).display==='flex'&&getComputedStyle(n).backgroundColor==='rgb(255, 255, 255)'&&parseFloat(getComputedStyle(n).top)>400);
 const rows=new Map();cards.forEach(n=>{const top=parseFloat(getComputedStyle(n).top);if(!rows.has(top))rows.set(top,[]);rows.get(top).push(n);});
 [...rows].sort((a,b)=>a[0]-b[0]).forEach(([top,nodes],rowIndex)=>{
  nodes.sort((a,b)=>parseFloat(getComputedStyle(a).left)-parseFloat(getComputedStyle(b).left));
  const initialX=rowIndex?parseFloat(getComputedStyle(nodes[0]).left):-182;
  const row=document.createElement('div');row.className='interview-row';row.style.top=`${top}px`;row.style.setProperty('--marquee-start',`${initialX}px`);row.style.setProperty('--marquee-duration',rowIndex?'78s':'64s');row.setAttribute('aria-label',`보호자 인터뷰 ${rowIndex+1}번째 줄`);
  row.style.setProperty('--interview-period',`${nodes.length*(684+20)}px`);
  row.dataset.direction=rowIndex?'left':'right';
  const track=document.createElement('div');track.className='interview-track';const group=document.createElement('div');group.className='interview-group';nodes.forEach(n=>{n.classList.add('interview-card');group.append(n);});track.append(group);
  const duplicate=group.cloneNode(true);duplicate.setAttribute('aria-hidden','true');duplicate.inert=true;qa('[id],[data-node-id]',duplicate).forEach(n=>{n.removeAttribute('id');n.removeAttribute('data-node-id');});track.append(duplicate,duplicate.cloneNode(true));row.append(track);interview.firstElementChild.append(row);
 });
 // The feedback panel is centered in the authored canvas and has its own gentle entrance.
 const feedback=q('[data-node-id="148:3118"]');
 if(feedback)sequence([feedback],{kind:'feedback-enter'});
 // Keep decorative device shells out of the image-preview interaction.
 qa('.original-section [data-name="iPhone Air - Cloud White - Portrait"]').forEach(n=>{n.removeAttribute('role');n.removeAttribute('tabindex');n.style.cursor='default';n.style.pointerEvents='none';});
 const destinations={'산책하기':'walk-planning','다음':'profile-setup','프로필 생성 완료':'app-home','산책 종료':'walk-log','기록하기':'walk-archive','산책 기록 작성':'walk-log'};
 function activate(node,action){node.setAttribute('role','button');node.tabIndex=0;const run=e=>{e.preventDefault();e.stopPropagation();action();};node.addEventListener('click',run);node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')run(e);});}
 const go=id=>q('#'+id)?.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
 qa('.original-section p').forEach(n=>{if(n.closest('#walk-log'))return;const text=n.textContent.trim();if(destinations[text])activate(n,()=>go(destinations[text]));else if(/^(카카오 로그인|네이버 로그인|Google 로그인|이메일 로그인|가입하기)$/.test(text))activate(n,()=>go('profile-setup'));});
 if(feedback){
  // Ratings are an automatic visual demonstration, without click or keyboard selection.
  qa('p',feedback).filter(n=>['별로','보통','만족','저장','닫기','다음에 할게요'].includes(n.textContent.trim())).forEach(n=>{n.removeAttribute('role');n.removeAttribute('tabindex');n.style.cursor='default';});
 }
 reduced.addEventListener('change',()=>{if(reduced.matches)observers.forEach(({observer,reveal})=>{reveal();observer.disconnect();});});
})();
