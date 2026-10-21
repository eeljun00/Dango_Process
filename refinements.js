(() => {
 'use strict';
 const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
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
 if(gridImage&&!reduced.matches)fetch(gridImage.src).then(response=>{if(!response.ok)throw new Error('guide asset');return response.text();}).then(text=>{
  if(reduced.matches)return;const source=new DOMParser().parseFromString(text,'image/svg+xml'),svg=source.documentElement;
  if(svg.localName!=='svg'||source.querySelector('parsererror'))return;
  const lines=qa('path[stroke="#BFBFBF"]',svg);if(lines.length!==14)return;
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
     const a=n.animate([{strokeDashoffset:String(offsets.get(n))},{strokeDashoffset:'0'}],{duration:650,easing:'ease-in-out',fill:'forwards'});animations.add(a);
     a.onfinish=()=>{n.style.strokeDashoffset='0';animations.delete(a);a.cancel();if(!remaining.length&&!animations.size)settle();};
    });
    if(remaining.length)timer=setTimeout(batch,1050);
   };batch();
  };
  watch(grid,play);
  reduced.addEventListener('change',()=>{if(reduced.matches){started=true;settle();}});window.addEventListener('beforeprint',settle);
 }).catch(()=>{}); // Keep the original static image if loading or SVG parsing is unavailable.
 // Preserve each map button's native shell; its existing icon and text share one flex row.
 for(const [buttonId,iconId]of [['I148:3210;1128:12418','I148:3210;1128:12419'],['I148:3211;1128:12486','I148:3211;1128:12491']]){
  const button=byId(buttonId),icon=byId(iconId);if(!button||!icon)continue;button.classList.add('planning-search-button');icon.classList.add('planning-button-icon');button.append(icon);
 }
 // Keep bullet markers attached to the text, even inside the original centred text blocks.
 qa('#strategy li').forEach(n=>{
  if(/환경 정보 확인 과정 분산|반려견별 코스 선택 기준 필요|산책 기록과 활동 목표의 연계 필요|반려견별 활동 추이 확인 필요/.test(n.textContent))n.classList.add('opportunity-bullet');
 });
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
  nodes.forEach(n=>{
   const r=rect(n);let delay;
   if(r.y<rootY-15)delay=Math.max(0,(r.y-300)*1.25);
   else {const x=r.x+r.w/2,col=roots.length?roots.reduce((best,p,i)=>Math.abs(p.x-x)<Math.abs(roots[best].x-x)?i:best,0):0;delay=620+col*65+Math.max(0,Math.round((r.y-rootY)/55))*110;}
   n.classList.add('ia-flow-node');n.style.setProperty('--flow-delay',`${Math.round(delay)}ms`);
  });
  const panel=qa('div',ia).find(n=>{const r=rect(n);return r.w>1400&&r.h>700&&getComputedStyle(n).backgroundColor==='rgb(255, 255, 255)';})||ia;
  watch(panel,()=>ia.classList.add('flow-visible'));
 }
 // Animate the two original pet cards in their authored left-to-right order.
 const profiles=[byId('I148:2991;1263:24971'),byId('148:3101')].filter(Boolean);
 profiles.forEach((n,i)=>{n.classList.add('archive-profile');n.style.setProperty('--profile-delay',`${i*240}ms`);});
 watch(profiles[0],()=>profiles.forEach(n=>n.classList.add('profile-visible')));
 const marker=byId('148:3090'),bar=byId('148:3088');
 if(marker&&bar){
  const measure=()=>{marker.style.animation='none';const a=marker.getBoundingClientRect(),b=bar.getBoundingClientRect(),s=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-scale'))||1;marker.style.setProperty('--rhythm-min',`${(b.left-a.left)/s+16}px`);marker.style.setProperty('--rhythm-max',`${(b.right-a.left)/s-16}px`);marker.style.animation='';};
  measure();window.addEventListener('resize',measure,{passive:true});marker.classList.add('rhythm-marker');watch(bar,()=>marker.classList.add('in-view'),()=>marker.classList.remove('in-view'));
 }
 // A 20% black tint cycles between the original faces until a user selection locks it.
 const feedback=byId('148:3118');
 if(feedback){
  qa('div',feedback).filter(n=>getComputedStyle(n).backgroundColor==='rgba(0, 0, 0, 0.2)').forEach(n=>n.style.backgroundColor='transparent');
  const names=['별로','보통','만족'],labels=names.map(t=>qa('p',feedback).find(n=>n.textContent.trim()===t));
  // The third source mask is 108px at (534.6, 156.6), not the 102.6px faces' origin.
  const specs=[[135,159.3,102.6],[345.6,159.3,102.6],[534.6,156.6,108]];
  const ratingKey='dango-process:v1:rating';
  let displayed=0,userChoice=null,timer=null,visible=false;
  const choices=specs.map(([x,y,size],i)=>{const n=document.createElement('button');n.type='button';n.tabIndex=-1;n.setAttribute('aria-hidden','true');n.className='feedback-choice';Object.assign(n.style,{left:x+'px',top:y+'px',width:size+'px',height:size+'px'});feedback.append(n);n.addEventListener('pointerdown',e=>{if(e.button===0){e.preventDefault();labels[i]?.focus({preventScroll:true});}});n.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();choose(i);});return n;});
  function show(i){displayed=i;feedback.dataset.rating=names[i];choices.forEach((n,j)=>n.classList.toggle('is-dimmed',i!==j));labels.forEach((n,j)=>{if(!n)return;n.setAttribute('aria-pressed',String(i===j));n.style.color=i===j?'#111':'#999';});}
  // The demonstration may change the display only until a person chooses or saves.
  function sync(){clearInterval(timer);timer=null;if(userChoice===null&&visible&&!reduced.matches&&!document.hidden)timer=setInterval(()=>{if(userChoice===null)show((displayed+1)%3);},1200);}
  function choose(i){userChoice=i;show(i);sync();}
  function bind(node,action){if(!node)return;const run=e=>{if(e.type==='keydown'&&(!['Enter',' '].includes(e.key)||e.repeat||e.isComposing))return;e.preventDefault();e.stopImmediatePropagation();action();};node.addEventListener('click',run);node.addEventListener('keydown',run);}
  labels.forEach((node,i)=>bind(node,()=>choose(i)));
  // This is the sole save handler; keep the existing key and plain-text value.
  qa('p',feedback).filter(n=>n.textContent.trim()==='저장').forEach(node=>bind(node,()=>{
   choose(userChoice??displayed);const value=names[userChoice];
   try{if(localStorage.getItem(ratingKey)!==value)localStorage.setItem(ratingKey,value);if(typeof toast==='function')toast('산책 후기를 저장했어요');}
   catch{if(typeof toast==='function')toast('산책 후기를 저장하지 못했어요. 브라우저 저장 공간·권한을 확인해 주세요');}
  }));
  try{const saved=names.indexOf(localStorage.getItem(ratingKey));if(saved>=0)userChoice=saved;}catch{}
  show(userChoice??0);watch(feedback,()=>{visible=true;sync();},()=>{visible=false;sync();});reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
 }
})();
