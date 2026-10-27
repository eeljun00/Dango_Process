(() => {
 'use strict';
 const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
 const reduced=dangoReducedMotion;
 const byId=id=>q(`[data-node-id="${id}"]`);
 function watch(target,show,hide=()=>{}){
  if(!target)return;
  if(!('IntersectionObserver' in window)){show();return;}
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.isIntersecting?show():hide()),{threshold:.05});
  observer.observe(target);
 }
 // Preserve each original composition; translate a repeated row, not its individual artwork.
 const branding=q('#branding .design-canvas>div');
 const poses=['148:2332','148:2320','148:2326','148:2336','148:2323'].map(byId).filter(Boolean);
 if(branding&&poses.length===5){
  const row=document.createElement('div');row.className='character-marquee';row.setAttribute('aria-label','댕고 캐릭터의 다섯 가지 모습');
  const track=document.createElement('div');track.className='character-track';
  const group=document.createElement('div');group.className='character-group';
  // Retain native artwork sizes; these rendered bounds exclude transparent outer padding.
  const origins=[108.78,506.45,853.21,1217.68,1564.74],widths=[311,242,289,259,232];
  poses.forEach((pose,i)=>{
   const slot=document.createElement('div');slot.className='character-slot';slot.style.setProperty('--pose-width',widths[i]+'px');
   const content=document.createElement('div');content.className='character-content';content.style.left=-origins[i]+'px';content.append(pose);slot.append(content);group.append(slot);
  });track.append(group);
  // Three copies cover a desktop viewport even while the first period exits.
  for(let copy=0;copy<2;copy++){const duplicate=group.cloneNode(true);duplicate.inert=true;duplicate.setAttribute('aria-hidden','true');qa('[data-node-id],[id]',duplicate).forEach(n=>{n.removeAttribute('data-node-id');n.removeAttribute('id');});track.append(duplicate);}
  row.append(track);branding.append(row);
  watch(row,()=>row.classList.add('in-view'),()=>row.classList.remove('in-view'));
  const mobileStrip=q('#branding .mobile-reading .character-strip');
  if(mobileStrip){const mobileRow=row.cloneNode(true);mobileRow.classList.add('character-marquee-mobile');mobileRow.classList.remove('in-view');qa('[data-node-id],[id]',mobileRow).forEach(n=>{n.removeAttribute('data-node-id');n.removeAttribute('id');});const scale=document.createElement('div');scale.className='character-mobile-scale';scale.append(mobileRow.firstElementChild);mobileRow.append(scale);mobileStrip.replaceWith(mobileRow);watch(mobileRow,()=>mobileRow.classList.add('in-view'),()=>mobileRow.classList.remove('in-view'));}
 }
 // Animate the 14 original gray SVG paths, without slicing the logo or inventing guide lines.
 const grid=byId('148:2853'),gridImage=grid&&q('img',grid);
 if(gridImage)fetch(gridImage.src).then(response=>{if(!response.ok)throw new Error('guide asset');return response.text();}).then(text=>{
  const source=new DOMParser().parseFromString(text,'image/svg+xml'),svg=source.documentElement;
  if(svg.localName!=='svg'||source.querySelector('parsererror'))return;
  const lines=qa('path.logo-guide-line',svg);if(lines.length!==14)return;
  svg.classList.add('logo-guide-svg');svg.setAttribute('aria-hidden','true');lines.forEach(n=>n.classList.add('logo-guide-line'));gridImage.replaceWith(document.importNode(svg,true));
  const guides=qa('.logo-guide-line',grid);
  let started=false,timer;const animations=new Set(),offsets=new Map();
  guides.forEach(n=>{
   const length=n.getTotalLength(),start=n.getPointAtLength(0),end=n.getPointAtLength(length);
   // The original horizontal paths run right to left; reveal them from their left endpoint.
   const offset=start.x>end.x?-length:length;offsets.set(n,offset);
   n.style.strokeDasharray=String(length);n.style.strokeDashoffset=String(offset);n.style.opacity='0';
  });
  const settle=()=>{started=true;clearTimeout(timer);animations.forEach(a=>{a.onfinish=null;a.cancel();});animations.clear();guides.forEach(n=>{n.style.opacity='';n.style.strokeDasharray='';n.style.strokeDashoffset='';});grid.dataset.gridState='done';};
  const play=()=>{
   if(started)return;started=true;if(reduced.matches||!Element.prototype.animate){settle();return;}
   const remaining=[...guides];
   for(let i=remaining.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[remaining[i],remaining[j]]=[remaining[j],remaining[i]];}
   const batch=()=>{
    // Keep every batch, including the final one, within four to six guides.
    const count=remaining.length>6?Math.min(4+Math.floor(Math.random()*3),remaining.length-4):remaining.length;
    const chosen=remaining.splice(0,count);
    grid.dataset.gridBatch=String(chosen.length);grid.dataset.gridState='running';
    chosen.forEach(n=>{
     n.style.opacity='1';
     const a=n.animate([{strokeDashoffset:String(offsets.get(n))},{strokeDashoffset:'0'}],{duration:dangoMotionTime(650),easing:'ease-in-out',fill:'forwards'});animations.add(a);
     a.onfinish=()=>{n.style.strokeDashoffset='0';animations.delete(a);a.cancel();if(!remaining.length&&!animations.size)settle();};
    });
    if(remaining.length)timer=setTimeout(batch,dangoMotionTime(1050));
   };batch();
  };
  watch(grid,play);if(reduced.matches)settle();
  reduced.addEventListener('change',()=>{if(reduced.matches){started=true;settle();}});window.addEventListener('beforeprint',settle);
 }).catch(()=>{}); // Keep the original static image if loading or SVG parsing is unavailable.
 // Preserve each map button's native shell; its existing icon and text share one flex row.
 for(const [buttonId,iconId]of [['I148:3210;1128:12418','I148:3210;1128:12419'],['I148:3211;1128:12486','I148:3211;1128:12491']]){
  const button=byId(buttonId),icon=byId(iconId);if(!button||!icon)continue;button.classList.add('planning-search-button');icon.classList.add('planning-button-icon');button.append(icon);
 }
 // The Home spinner shares the same flex row as its label, with a real gap.
 const homeSearch=byId('I148:3512;1128:12418'),homeSpinner=byId('I148:3512;1128:12419');
 if(homeSearch&&homeSpinner){homeSearch.classList.add('home-search-button');homeSpinner.classList.add('home-search-spinner');homeSearch.append(homeSpinner);}
 // Keep the dimmer inside the map plane, below the phone's independent UI layers.
 const logShade=byId('I148:3116;1418:22726'),logMap=byId('I148:3116;1418:22623');
 if(logShade&&logMap)logMap.append(logShade);
 // Keep the three authored background flowers separate and pause their gentle drift offscreen.
 const flowers=qa('#community .community-flower');
 flowers.forEach((node,i)=>{node.style.setProperty('--flower-duration',`${[14,18,22][i]}s`);node.style.setProperty('--flower-delay',`${[-4,-11,-18][i]}s`);node.style.setProperty('--flower-x',`${[100,-120,90][i]}px`);node.style.setProperty('--flower-y',`${[-60,72,-68][i]}px`);});
 watch(q('#community'),()=>flowers.forEach(n=>n.classList.add('flower-moving')),()=>flowers.forEach(n=>n.classList.remove('flower-moving')));
 // Keep bullet markers attached to the text, even inside the original centred text blocks.
 qa('#strategy li').forEach(n=>{
  if(/환경 정보 확인 과정 분산|반려견별 코스 선택 기준 필요|산책 기록과 활동 목표의 연계 필요|반려견별 활동 추이 확인 필요/.test(n.textContent))n.classList.add('opportunity-bullet');
 });
 // The original confetti is a separate transparent asset. Split it with CSS clips,
 // so its eleven existing colored pieces burst while the character remains still.
 const confettiBoxes=[[453,38,506,92],[237,79,282,140],[803,107,841,169],[547,110,609,144],[374,168,435,212],[111,191,155,253],[703,210,750,269],[877,247,939,291],[70,407,121,464],[905,482,959,536],[148,587,192,648]];
 for(const id of ['I148:3230;1288:21796','I148:3160;1189:19653']){
  const target=byId(id),image=target&&q('img',target);if(!image||!Element.prototype.animate)continue;
  const width=target.clientWidth,height=target.clientHeight,cover=Math.max(width,height),crop=(cover-width)/2;
  const pieces=confettiBoxes.map(([x1,y1,x2,y2],i)=>{
   const left=(x1/1024*cover-crop)/width*100,right=(x2/1024*cover-crop)/width*100;
   const top=y1/1024*cover/height*100,bottom=y2/1024*cover/height*100;
   const cx=(left+right)/200,cy=(top+bottom)/200,node=document.createElement('span');
   node.className='confetti-piece';node.setAttribute('aria-hidden','true');
   node.style.clipPath=`inset(${top}% ${100-right}% ${100-bottom}% ${left}%)`;
   node.style.transformOrigin=`${cx*100}% ${cy*100}%`;const copy=image.cloneNode(true);copy.loading='eager';node.append(copy);target.append(node);
   return{node,cx,cy,i};
  });
  image.classList.add('confetti-source-hidden');let animations=[],armed=true,visible=false;
  const finish=()=>{animations.forEach(a=>{a.onfinish=null;a.cancel();});animations=[];target.dataset.burstState='done';};
  const play=()=>{
   if(!armed||reduced.matches)return;armed=false;target.dataset.burstState='running';
   animations=pieces.map(({node,cx,cy,i})=>{
    const x=(.5-cx)*width*.42,y=(.5-cy)*height*.4;
    const a=node.animate([{opacity:0,translate:`${x}px ${y}px`,scale:.3,rotate:`${i%2?24:-24}deg`},
     {opacity:1,translate:`${-x*.16}px ${-Math.abs(y)*.15-6}px`,scale:1,rotate:`${i%2?-12:12}deg`,offset:.42},
     {opacity:1,translate:'0 0',scale:1,rotate:'0deg',offset:.78},
     {opacity:0,translate:`0 ${height*.12}px`,scale:.8,rotate:`${i%2?18:-18}deg`}],
     {duration:dangoMotionTime(2100),delay:dangoMotionTime(i%4*35),iterations:Infinity,easing:'cubic-bezier(.2,.7,.3,1)',fill:'both'});
    return a;
   });
  };
  watch(target,()=>{visible=true;play();},()=>{visible=false;finish();armed=true;});
  reduced.addEventListener('change',()=>{finish();armed=true;if(visible)play();});window.addEventListener('beforeprint',finish);
 }
 // Figma graph branches cascade from the common menu row down their own columns.
 const ia=q('#information-architecture .design-canvas');
 if(ia){
  const base=ia.getBoundingClientRect(),scale=base.width/1920.375;
  const rect=n=>{const r=n.getBoundingClientRect();return {x:(r.left-base.left)/scale,y:(r.top-base.top)/scale,w:r.width/scale,h:r.height/scale};};
  const boxes=qa('div[data-node-id]',ia).filter(n=>{const r=rect(n),s=getComputedStyle(n);return s.display!=='contents'&&r.w>=45&&r.w<310&&r.h>=20&&r.h<=110&&s.backgroundColor!=='rgba(0, 0, 0, 0)'&&r.y>300;});
  const blues=boxes.filter(n=>{const c=getComputedStyle(n).backgroundColor.match(/[\d.]+/g)?.map(Number);return c&&c[2]>c[0]+12&&c[2]>c[1]&&rect(n).w>65;});
  const rows=new Map();blues.forEach(n=>{const y=Math.round(rect(n).y/12)*12;if(!rows.has(y))rows.set(y,[]);rows.get(y).push(n);});
  const common=[...rows.values()].sort((a,b)=>b.length-a.length)[0]||[];
  const roots=common.map(n=>{const r=rect(n);return {x:r.x+r.w/2,y:r.y};}).sort((a,b)=>a.x-b.x);
  const rootY=roots[0]?.y||650;
  const texts=qa('p[data-node-id]',ia).filter(n=>{const r=rect(n);return r.y>300&&parseFloat(getComputedStyle(n).fontSize)<=26&&!boxes.some(b=>b.contains(n));});
  const nodes=[...boxes,...texts];
  const delayAt=r=>{
   if(r.y<rootY-15)return Math.max(0,(r.y-300)*1.25);
   const x=r.x+r.w/2,col=roots.length?roots.reduce((best,p,i)=>Math.abs(p.x-x)<Math.abs(roots[best].x-x)?i:best,0):0;
   return 620+col*65+Math.max(0,Math.round((r.y-rootY)/55))*110;
  };
  nodes.forEach(n=>{
   n.classList.add('ia-flow-node');n.style.setProperty('--flow-delay',`${dangoMotionTime(Math.round(delayAt(rect(n))))}ms`);
  });
  // Reveal the existing connectors, including their dashes, on the boxes' shared clock.
  // An SVG mask leaves the authored geometry/colors untouched and works on rotated,
  // zero-width/height connector containers without clipping their parent boxes.
  let flowStartedAt=null;const linePlans=[],svgNS='http://www.w3.org/2000/svg';
  const settleLine=plan=>{
   plan.animations.forEach(a=>{a.onfinish=null;a.cancel();});plan.animations=[];
   plan.group.removeAttribute('mask');plan.svg.dataset.iaLineState='done';
  };
  const playLine=plan=>{
   if(reduced.matches||!Element.prototype.animate){settleLine(plan);return;}
   if(flowStartedAt===null)return;
   const elapsed=performance.now()-flowStartedAt;plan.svg.dataset.iaLineState='running';
   plan.strokes.forEach(({stroke,offset,delay,duration})=>{
    const animation=stroke.animate([{strokeDashoffset:String(offset)},{strokeDashoffset:'0'}],
     {duration,delay,easing:'linear',fill:'both'});
    animation.currentTime=elapsed;plan.animations.push(animation);
    animation.onfinish=()=>{if(plan.animations.every(a=>a.playState==='finished'))settleLine(plan);};
   });
  };
  const lineIds=['148:3713','148:3714','148:3715','148:3716','148:3719','148:3720','148:3722','148:3737','148:3763','148:3769','148:3779','148:3787','148:3797','148:3810','148:3813','148:3834','148:3837','148:3850','148:3851','148:3852','148:3864','148:3866','148:3867','148:3902','148:3911','148:3912','148:3913','148:3914','148:3923'];
  lineIds.forEach(async id=>{
   const node=byId(id),image=node&&q('img',node);if(!image)return;let svg;
   try{
    const response=await fetch(image.src);if(!response.ok)return;
    const source=new DOMParser().parseFromString(await response.text(),'image/svg+xml');
    if(source.documentElement.localName!=='svg'||source.querySelector('parsererror,script,foreignObject'))return;
    svg=document.importNode(source.documentElement,true);svg.setAttribute('class',(image.getAttribute('class')||'')+' ia-flow-line');svg.setAttribute('aria-hidden','true');
    qa('[id]',svg).forEach(n=>n.removeAttribute('id'));
    const group=document.createElementNS(svgNS,'g');[...svg.children].filter(n=>n.localName!=='defs').forEach(n=>group.append(n));svg.append(group);
    image.replaceWith(svg);const paths=qa('path',group);if(!paths.length){svg.replaceWith(image);return;}
    const geometry=paths.map(path=>{
     const r=rect(path),matrix=path.getScreenCTM(),length=path.getTotalLength();
     const start=path.getPointAtLength(0).matrixTransform(matrix),end=path.getPointAtLength(length).matrixTransform(matrix);
     const reverse=r.h>r.w?start.y>end.y:start.x>end.x;
     const delay=dangoMotionTime(Math.round(delayAt(r)));
     const endDelay=dangoMotionTime(Math.round(delayAt({...r,y:r.y+r.h})));
     return{offset:reverse?-1:1,delay,duration:Math.max(dangoMotionTime(550),endDelay-delay+dangoMotionTime(450))};
    });
    const defs=document.createElementNS(svgNS,'defs'),mask=document.createElementNS(svgNS,'mask'),maskId='dango-ia-'+id.replace(':','-');
    mask.id=maskId;mask.setAttribute('maskUnits','userSpaceOnUse');const box=group.getBBox();
    Object.entries({x:box.x-8,y:box.y-8,width:Math.max(1,box.width)+16,height:Math.max(1,box.height)+16}).forEach(([key,value])=>mask.setAttribute(key,value));
    const contents=group.cloneNode(true);mask.append(contents);defs.append(mask);svg.prepend(defs);
    const strokes=qa('path',contents).map((stroke,i)=>{
     stroke.setAttribute('fill','none');stroke.setAttribute('stroke','#fff');stroke.setAttribute('stroke-width','6');stroke.setAttribute('pathLength','1');stroke.setAttribute('stroke-dasharray','1 1');stroke.setAttribute('stroke-dashoffset',geometry[i].offset);return{stroke,...geometry[i]};
    });
    group.setAttribute('mask','url(#'+maskId+')');svg.dataset.iaLineState='pending';
    const plan={svg,group,strokes,animations:[]};linePlans.push(plan);playLine(plan);
   }catch{if(svg?.isConnected)svg.replaceWith(image);}
  });
  reduced.addEventListener('change',()=>{if(reduced.matches)linePlans.forEach(settleLine);});
  window.addEventListener('beforeprint',()=>linePlans.forEach(settleLine));
  const panel=qa('div',ia).find(n=>{const r=rect(n);return r.w>1400&&r.h>700&&getComputedStyle(n).backgroundColor==='rgb(255, 255, 255)';})||ia;
  watch(panel,()=>{ia.classList.add('flow-visible');if(flowStartedAt===null){flowStartedAt=performance.now();linePlans.forEach(playLine);}});
 }
 // Animate the two original pet cards in their authored left-to-right order.
 const profiles=[byId('I148:2991;1263:24971'),byId('148:3101')].filter(Boolean);
 profiles.forEach((n,i)=>{n.classList.add('archive-profile');n.style.setProperty('--profile-delay',`${dangoMotionTime(i*240)}ms`);});
 watch(profiles[0],()=>profiles.forEach(n=>n.classList.add('profile-visible')));
 const marker=byId('148:3090'),bar=byId('148:3088');
 if(marker&&bar){
  const measure=()=>{marker.style.animation='none';const a=marker.getBoundingClientRect(),b=bar.getBoundingClientRect(),s=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-scale'))||1;marker.style.setProperty('--rhythm-min',`${(b.left-a.left)/s+16}px`);marker.style.setProperty('--rhythm-max',`${(b.right-a.left)/s-16}px`);marker.style.animation='';};
  measure();window.addEventListener('resize',measure,{passive:true});marker.classList.add('rhythm-marker');watch(bar,()=>marker.classList.add('in-view'),()=>marker.classList.remove('in-view'));
 }
 // Loop the three authored faces automatically; saved ratings never lock this demonstration.
 const feedback=byId('148:3118');
 if(feedback){
  qa('div',feedback).filter(n=>getComputedStyle(n).backgroundColor==='rgba(0, 0, 0, 0.2)').forEach(n=>n.style.backgroundColor='transparent');
  const names=['별로','보통','만족'],labels=names.map(t=>qa('p',feedback).find(n=>n.textContent.trim()===t));
  const specs=[[135,159.3,102.6],[345.6,159.3,102.6],[534.6,156.6,108]];
  let displayed=0,timer=null,visible=false;
  const choices=specs.map(([x,y,size])=>{const n=document.createElement('span');n.setAttribute('aria-hidden','true');n.className='feedback-choice';Object.assign(n.style,{left:x+'px',top:y+'px',width:size+'px',height:size+'px'});feedback.append(n);return n;});
  function show(i){displayed=i;feedback.dataset.rating=names[i];choices.forEach((n,j)=>n.classList.toggle('is-dimmed',i!==j));labels.forEach((n,j)=>{if(n)n.style.color=i===j?'#111':'#999';});}
  function sync(){clearInterval(timer);timer=null;if(visible&&!reduced.matches&&!document.hidden)timer=setInterval(()=>show((displayed+1)%3),dangoMotionTime(1200));}
  show(0);watch(feedback,()=>{visible=true;sync();},()=>{visible=false;sync();});reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
 }
 // The candy character hops continuously while its separate ground shadow follows the landing.
 const candy=byId('148:2978'),candyShadow=byId('148:2977');
 if(candy&&candyShadow){
  candy.classList.add('archive-jump-character');candyShadow.classList.add('archive-jump-shadow');
  watch(candy,()=>{candy.classList.add('jumping');candyShadow.classList.add('jumping');},()=>{candy.classList.remove('jumping');candyShadow.classList.remove('jumping');});
 }

 // Replace zero-width CSS border corners with clean paths, keeping both reveal clocks.
 const surveyCanvas=q('#research .design-canvas');
 if(surveyCanvas){
  const canvasRect=surveyCanvas.getBoundingClientRect(),scale=canvasRect.width/1920.375;
  for(const id of ['148:7481','148:7479']){
   const branch=byId(id);if(!branch)continue;branch.classList.add('survey-connector-branch');
   const r=branch.getBoundingClientRect(),width=r.width/scale,height=r.height/scale,junction=1920.375/2-(r.left-canvasRect.left)/scale;
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),path=document.createElementNS(svg.namespaceURI,'path');
   svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.setAttribute('aria-hidden','true');svg.classList.add('survey-connector-art');
   const left=id==='148:7481';
   path.setAttribute('d',left?`M0 1 H${junction-99} A99 99 0 0 1 ${junction} 100 V${height}`:`M${width} 1 H${junction+99} A99 99 0 0 0 ${junction} 100 V${height}`);
   path.setAttribute('fill','none');path.setAttribute('stroke','#ff4444');path.setAttribute('stroke-width','2');svg.append(path);branch.replaceChildren(svg);
  }
 }
 // Only the foreground archive card paints dividers; align their edges to device pixels.
 const archiveRules=['148:3084','148:3085'].map(byId).filter(Boolean);
 function snapArchiveRules(){
  const scale=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-scale'))||1,dpr=devicePixelRatio||1;
  archiveRules.forEach(n=>{const x=n.getBoundingClientRect().left;n.style.setProperty('--archive-rule-x',`${(Math.round(x*dpr)/dpr-x)/scale}px`);});
 }
 snapArchiveRules();window.addEventListener('resize',snapArchiveRules,{passive:true});document.fonts.ready.then(snapArchiveRules);
 // The two original blurred flower fields drift while the closing page is visible.
 const endingFlowers=['148:4754','148:4755'].map(byId).filter(Boolean);
 endingFlowers.forEach((n,i)=>{n.classList.add('ending-flower');n.style.setProperty('--ending-flower-duration',`${[16,21][i]}s`);n.style.setProperty('--ending-flower-delay',`${[-3,-9][i]}s`);n.style.setProperty('--ending-flower-x',`${[35,-42][i]}px`);n.style.setProperty('--ending-flower-y',`${[-26,32][i]}px`);});
 watch(q('#thank-you'),()=>endingFlowers.forEach(n=>n.classList.add('flower-moving')),()=>endingFlowers.forEach(n=>n.classList.remove('flower-moving')));
 // Align field captions with the corresponding input frame, including fractional instance offsets.
 const profileLabels=[['I148:3223;1288:21455','I148:3223;1288:21454'],['I148:3224;1288:21485','I148:3224;1288:21484'],['I148:3225;1288:21514','I148:3225;1288:21513'],['I148:3226;1288:21547','I148:3226;1288:21546'],['I148:3227;1288:21580','I148:3227;1288:21578'],['I148:3228;1288:21612','I148:3228;1288:21611'],['I148:3229;1288:21658','I148:3229;1288:21641']];
 function alignProfileLabels(){
  const scale=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-scale'))||1;
  profileLabels.forEach(([labelId,boxId])=>{const label=byId(labelId),box=byId(boxId);if(!label||!box)return;const left=parseFloat(getComputedStyle(label).left),delta=(box.getBoundingClientRect().left-label.getBoundingClientRect().left)/scale+4;if(Number.isFinite(left))label.style.left=(left+delta)+'px';});
 }
 alignProfileLabels();window.addEventListener('resize',alignProfileLabels,{passive:true});document.fonts.ready.then(alignProfileLabels);
 // Lettering remains still while only the two separate bubble backgrounds pop repeatedly.
 for(const id of ['148:2318','I148:4740;1258:22645']){
  const bubble=byId(id);if(!bubble)continue;bubble.classList.add('bubble-pop-background');watch(bubble,()=>bubble.classList.add('bubble-moving'),()=>bubble.classList.remove('bubble-moving'));
 }
 // Follow all four original edges; a rotated rectangle cannot match the baked perspective.
 const walkPhone=byId('148:3190');
 if(walkPhone){
  const shadow=document.createElementNS('http://www.w3.org/2000/svg','svg');
  shadow.classList.add('walk-navigation-shadow');shadow.setAttribute('viewBox','0 0 559.045 805.439');shadow.setAttribute('aria-hidden','true');shadow.setAttribute('focusable','false');
  // Emit only the outside shadow. The source path never paints over the original icons.
  shadow.innerHTML='<defs><filter id="walk-navigation-shadow-filter" x="-10%" y="-20%" width="120%" height="140%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="soft"/><feOffset in="soft" dy="1.5" result="offset"/><feFlood flood-color="#26364a" flood-opacity=".085" result="color"/><feComposite in="color" in2="offset" operator="in" result="shadow"/><feComposite in="shadow" in2="SourceAlpha" operator="out"/></filter></defs><path d="M237.22 707.99 Q234.38 700.51 242.08 698.33 L502.41 624.32 Q510.10 622.13 512.53 629.76 L525.56 670.80 Q527.98 678.42 520.31 680.71 L264.31 756.87 Q256.64 759.15 253.80 751.67 Z" fill="#000" filter="url(#walk-navigation-shadow-filter)"/>';
  walkPhone.append(shadow);
 }
 // The original nav icon frame is 24/40 of each item, including its scaled instances.
 qa('[data-name="sound_detection_dog_barking"]>p').forEach(glyph=>{
  const item=glyph.closest('[data-name="5"]');if(!item)return;
  const height=parseFloat(getComputedStyle(item).height);if(height>0)glyph.style.setProperty('--my-nav-scale',String(height/40));
 });
})();
