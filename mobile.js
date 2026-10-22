/* Mobile reading and input presentation. Existing demo controllers retain state/storage ownership. */
(()=>{'use strict';
 const media=matchMedia('(max-width:1023px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const q=(s,r=document)=>r.querySelector(s),all=(s,r=document)=>[...r.querySelectorAll(s)],node=id=>q('[data-node-id="'+id+'"]');
 const text=n=>{if(!n)return '';const read=x=>x.nodeType===3?x.textContent:[...x.childNodes].map(read).join(x.nodeName==='BR'?' ':'')+(['BR','P','LI'].includes(x.nodeName)?' ':'');return read(n).replace(/[\u200b-\u200d\ufeff]/g,' ').replace(/\s+/g,' ').trim();};
 const el=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value)n.textContent=value;return n;};
 const sourceText=id=>text(node(id));
 const go=n=>n?.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});
 const copies=[],expanded=new Set(),moves=[],canvases=new Map();let mounted=false,observer=null;
 function copy(id,parts,{after=false}={}){
  const section=q('#'+id),box=el('div','mobile-copy');
  for(const [tag,reference]of parts){const source=typeof reference==='string'?node(reference):reference;if(!source)continue;box.append(el(tag,tag==='h3'?'mobile-label':'',text(source)));if(id!=='easy-save')copies.push(source);}
  if(!box.children.length)return box;
  section.insertBefore(box,after?null:section.firstChild);expanded.add(section);return box;
 }
 const definitions={
  concept:[['p','148:2927']],logo:[['h3','148:4750'],['h2',node('148:4750')?.parentElement.querySelector('[data-node-id="148:4751"]')]],
  system:[['h3','148:2823'],['h2',node('148:2823')?.nextElementSibling]],
  typography:[['h3','148:2494'],['h2','148:2492'],['p','148:2493']],components:[['h3','148:2820']],
  'information-architecture':[['h3','148:3926'],['h2','148:3927']],wireframe:[['h3','148:3929']],
  'app-home':[['h3','148:3486'],['h2','148:3487'],['p','148:3488'],['h3','148:3494'],['p','148:3492'],['h3','148:3505'],['p','148:3506'],['h3','148:3498'],['p','148:3496'],['h3','148:3502'],['p','148:3500'],['h3','148:3510'],['p','148:3508']],
  onboarding:[['h3','148:4743'],['h2','148:4745'],['p','148:4744']],
  'walk-planning':[['h3','148:3198'],['h2','148:3199'],['p','212:5098'],['p','148:3200'],['p','148:3203'],['p','148:3206']],
  'active-walk':[['h3','148:3179'],['h2','148:3180'],['p','148:3184']],
  'walk-log':[['h3','148:3113'],['h2','148:3114'],['p','148:3115']],
  'easy-save':[['h2','148:3174']],
  'walk-summary':[['h3','148:3153'],['h2','148:3154'],['p','148:3155']],
  'walk-archive':[['h3','148:2969'],['h2','148:2970'],['p','148:2971'],['h3','148:2980'],['p','148:2981']],
  community:[],
  'thank-you':[['p','148:4757'],['p','148:4758'],['p','148:4759']]
 };
 const heading=q('#community .case-heading');definitions.community=all('p,h2',heading).map(n=>[n.classList.contains('eyebrow')?'h3':n.tagName==='H2'?'h2':'p',n]);
 // Keep connected artwork adjacent: planning and the yellow banner are explained below it.
 for(const [id,parts]of Object.entries(definitions)){const box=copy(id,parts,{after:['thank-you','walk-planning','easy-save'].includes(id)});if(id==='thank-you')all('p',box).forEach(n=>n.classList.add('mobile-credit'));}
 q('#components>.mobile-copy').append(el('p','', ['2499','2513','2510','2579','2581','2614','2650','2652'].map(id=>sourceText('148:'+id)).join(' · ')));
 // Interview words are copied from unique authored cards, not the marquee duplicates.
 const interview=copy('interview',[['h3','148:4954'],['h2','148:4953'],['p','148:4952']]);
 all('.interview-card[data-node-id]',q('#interview')).forEach(card=>{const quote=el('blockquote');all('p',card).filter(n=>parseFloat(getComputedStyle(n).fontSize)>=24).forEach(n=>quote.append(el('p','',text(n))));interview.append(quote);});
 // Keep the authored type values; these are specifications, not enlarged mockup UI.
 const typeBox=q('#typography>.mobile-copy'),table=el('table','type-table'),head=el('thead'),hr=el('tr');
 for(const id of ['148:2455','148:2452','148:2453','148:2454'])hr.append(el('th','',sourceText(id)));head.append(hr);table.append(head);const tb=el('tbody');
 for(const ids of [['2460','2458','2457','2459'],['2450','2448','2447','2449'],['2445','2443','2442','2444'],['2440','2438','2437','2439'],['2462','2464','2463','2465'],['2467','2469','2468','2470'],['2472','2474','2473','2475'],['2477','2479','2478','2480'],['2482','2484','2483','2485'],['2487','2489','2488','2490']]){const tr=el('tr');ids.forEach((id,i)=>{const cell=el(i?'td':'th','',sourceText('148:'+id));if(!i)cell.scope='row';tr.append(cell);});tb.append(tr);}table.append(tb);typeBox.append(table);
 // Explicit mapping verified against the original row/column coordinates, never DOM order alone.
 const strategy=q('#strategy .mobile-reading'),comparison=el('div','mobile-copy mobile-comparison');
 comparison.append(el('h3','mobile-label',sourceText('148:4853')));const ct=el('table'),caption=el('caption','','원본 경쟁사 비교'),ch=el('thead'),cr=el('tr');cr.append(el('th','','비교 기준'));
 ['4917','4924','4934'].forEach(id=>{const th=el('th','',sourceText('148:'+id));th.scope='col';cr.append(th);});ch.append(cr);ct.append(caption,ch);const cb=el('tbody');
 for(const ids of [['4897','4898','4900','4899'],['4902','4903','4905','4904'],['4907','4908','4910','4909'],['4912','4913','4915','4914']]){const tr=el('tr');ids.forEach((id,i)=>{const cell=el(i?'td':'th','',sourceText('148:'+id));if(!i)cell.scope='row';tr.append(cell);});cb.append(tr);}ct.append(cb);comparison.append(ct,el('h3','mobile-label',sourceText('148:4854')));
 // Reuse original app artwork and its authored normalized placement in the two-axis diagram.
 const plot=el('div','mobile-positioning');plot.setAttribute('role','img');plot.setAttribute('aria-label','원본 포지셔닝: 위 감성/경험 중심, 아래 운동/기능 중심, 왼쪽 일반 기록, 오른쪽 AI 맞춤 관리. 댕고는 오른쪽 위에 배치되어 있습니다.');
 [['top','감성/경험 중심'],['bottom','운동/기능 중심'],['left','일반 기록'],['right','AI 맞춤 관리']].forEach(([cls,label])=>plot.append(el('span','mobile-axis '+cls,label)));
 const apps=['148:4880','148:4882','148:4888','148:4884','148:4890','148:4886','148:4872'];
 // Resolve authored CSS coordinates synchronously; the hidden canvas is never painted.
 const strategyCanvas=q('#strategy .design-canvas'),display=strategyCanvas.style.getPropertyValue('display'),priority=strategyCanvas.style.getPropertyPriority('display');
 strategyCanvas.style.setProperty('display','block','important');
 const panelStyle=getComputedStyle(node('148:4855')),panelWidth=parseFloat(panelStyle.width),panelHeight=parseFloat(panelStyle.height);
 apps.forEach(id=>{const app=node(id),img=q('img',app);if(!app||!img)return;const s=getComputedStyle(app),image=el('img');image.src=img.getAttribute('src');image.alt='';image.dataset.source=id;image.style.left=parseFloat(s.left)/panelWidth*100+'%';image.style.top=parseFloat(s.top)/panelHeight*100+'%';image.style.width=image.style.height=parseFloat(s.width)/panelWidth*100+'%';plot.append(image);});
 if(display)strategyCanvas.style.setProperty('display',display,priority);else strategyCanvas.style.removeProperty('display');comparison.append(plot);
 let removed=[];
 // Overview statements retain their original cream capsule and red text colors.
 const capsules=el('ul','mobile-capsules');capsules.setAttribute('aria-label','Overview 산책 문제 키워드');
 ['148:7506','148:7511','148:7513','148:7515','148:7517','148:7519'].forEach((id,i)=>{const li=el('li','',sourceText(id));li.style.setProperty('--capsule-delay',i*90+'ms');capsules.append(li);});q('#intro').append(capsules);expanded.add(q('#intro'));
 function panel(id,title){const section=q('#'+id),host=el('div','mobile-panel');host.append(el('h3','mobile-label',title));if(['walk-log'].includes(id))section.insertBefore(host,q(':scope>.design-canvas',section));else section.append(host);expanded.add(section);return host;}
 function button(label,run,cls=''){const b=el('button','mobile-button '+cls,label);b.type='button';b.addEventListener('click',run);return b;}
 const color=panel('color',sourceText('148:2342')),grid=el('div','mobile-swatch-grid');all('.swatch-button',q('#color .design-canvas')).forEach(source=>{const hex='#'+text(source).replace('#','').toUpperCase(),b=button(hex,()=>source.click()),chip=el('i');chip.style.backgroundColor=hex;chip.setAttribute('aria-hidden','true');b.prepend(chip);grid.append(b);});color.append(grid);
 const feedback=node('148:3118'),rating=panel('walk-log',sourceText('148:3122')),ratingChoices=el('div','mobile-actions');
 ratingChoices.setAttribute('role','group');ratingChoices.setAttribute('aria-label',sourceText('148:3122'));
 const labels=['148:3123','148:3124','148:3125'].map(node);const ratingButtons=labels.map(source=>button(text(source),()=>source.click()));ratingChoices.append(...ratingButtons);rating.append(ratingChoices,button('저장',()=>q('p[role="button"]',node('148:3119')).click(),'mobile-primary'));
 const syncRating=()=>ratingButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(labels[i].getAttribute('aria-pressed')==='true')));new MutationObserver(syncRating).observe(feedback,{subtree:true,attributes:true,attributeFilter:['aria-pressed','data-rating']});syncRating();
 // Move live editors/actions, not copies: the existing Community controller keeps all handlers/state.
 const community=panel('community','Community 데모'),filters=el('div','mobile-actions'),posts=el('div','mobile-posts'),detail=el('article'),write=el('div');
 const detailTitle=el('h3'),detailBody=el('div','mobile-detail-body'),likeWrap=el('div','mobile-actions');detail.append(detailTitle,detailBody,likeWrap,el('label','','댓글 초안'));community.append(el('h3','','게시글 목록'),filters,posts,button('새 글 작성하기',()=>go(write)),detail,write);write.append(el('h3','','새 글 작성하기'));
 const categorySlots=all(':scope>div',node('148:6959')).length?all(':scope>div',node('148:6959')):[...node('148:6959').children];
 function slot(source,host,cls=''){if(!source)return;const target=el('div');host.append(target);moves.push({source,target,cls,marker:null,clone:null});}
 categorySlots.forEach(source=>slot(source,filters));slot(node('148:7042'),likeWrap);likeWrap.prepend(el('span','','좋아요'));slot(node('148:7160'),detail,'mobile-edit');
 [['148:7391','주제',''],['148:7384','제목','mobile-edit'],['148:7386','본문','mobile-edit'],['148:7394','장소','mobile-edit']].forEach(([id,label,cls])=>{write.append(el('label','',label));slot(node(id),write,cls);});
 write.append(el('div','mobile-actions'));const uploads=write.lastElementChild;uploads.append(button('사진 추가',()=>node('148:7379').click()),button('장소 확인',()=>node('148:7395').click()));slot(node('148:7397'),write,'mobile-primary');
 // Preserve the existing navigation actions without leaving miniature duplicate hit targets.
 all('main section').forEach(section=>{if(['community','convenience','profile-setup','color'].includes(section.id))return;const actions=new Map();all('.design-canvas [role="button"]',section).filter(n=>!n.closest('[aria-hidden="true"]')&&(!feedback.contains(n)||['닫기','다음에 할게요'].includes(text(n)))).forEach(source=>{const label=text(source);if(label&&!actions.has(label))actions.set(label,source);});if(!actions.size)return;const host=panel(section.id,'화면 이동'),row=el('div','mobile-actions');actions.forEach((source,label)=>row.append(button(label,()=>source.click())));host.append(row);});
 let knownPostId=null;
 function syncCommunity(){if(!mounted)return;
  const list=node('148:6599'),firstId=q('[data-post-id]',list)?.dataset.postId||'';posts.replaceChildren();all('[data-name="목록글"]',list).filter(n=>!n.hidden).forEach(source=>{const title=q('.cn47',source),topic=q('.cn45',source),b=button(text(title),()=>{source.click();refreshDetail();go(detail);});b.append(el('small','',text(topic)));posts.append(b);});refreshDetail();
  if(knownPostId!==null&&firstId!==knownPostId&&document.activeElement===node('148:7397'))go(posts);knownPostId=firstId;
 }
 function refreshDetail(){detailTitle.textContent=sourceText('148:7027');detailBody.replaceChildren();all('p,img',node('148:7031')).filter(n=>n.tagName==='IMG'||!n.querySelector('p')).forEach(source=>{const n=source.tagName==='IMG'?source.cloneNode():el('p','',text(source));n.removeAttribute('class');n.removeAttribute('data-node-id');detailBody.append(n);});}
 let pending=false;new MutationObserver(()=>{if(!mounted||pending)return;pending=true;queueMicrotask(()=>{pending=false;syncCommunity();});}).observe(node('148:6460'),{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
 new MutationObserver(()=>{if(mounted)refreshDetail();}).observe(node('148:7031'),{childList:true,subtree:true,characterData:true});
 function strip(n){[n,...all('*',n)].forEach(x=>{x.removeAttribute('id');x.removeAttribute('data-node-id');x.removeAttribute('role');x.removeAttribute('tabindex');x.removeAttribute('contenteditable');});n.inert=true;n.setAttribute('aria-hidden','true');return n;}
 function mount(){if(mounted)return;mounted=true;
  copies.forEach(n=>n.classList.add('mobile-copy-source'));expanded.forEach(s=>s.classList.add('mobile-expanded'));
  // The old flattened O/X transcript is replaced, only within this mobile breakpoint.
  const start=[...strategy.children].findIndex(n=>text(n)===sourceText('148:4853')),end=[...strategy.children].findIndex(n=>text(n)==='Vision');
  if(start>=0&&end>start){removed=[...strategy.children].slice(start,end).map(n=>{const marker=document.createComment('mobile comparison source');n.before(marker);n.remove();return{n,marker};});strategy.insertBefore(comparison,removed[end-start-1].marker.nextSibling);}
  moves.forEach(m=>{m.marker=document.createComment('mobile live control');m.clone=strip(m.source.cloneNode(true));m.source.before(m.marker,m.clone);m.target.append(m.source);m.source.classList.add('mobile-live',...m.cls.split(' ').filter(Boolean));});
  // Static miniature copies must not compete with the accessible full-size controls.
  all('.design-canvas',q('main')).filter(canvas=>!['profile-setup','convenience'].includes(canvas.parentElement.id)).forEach(canvas=>{canvases.set(canvas,canvas.inert);canvas.inert=true;});
  syncCommunity();
  if(!reduced.matches&&'IntersectionObserver'in window){observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('capsule-enter');observer.unobserve(e.target);}}),{threshold:0});all('li',capsules).forEach(n=>observer.observe(n));}
 }
 function unmount(){if(!mounted)return;mounted=false;observer?.disconnect();copies.forEach(n=>n.classList.remove('mobile-copy-source'));expanded.forEach(s=>s.classList.remove('mobile-expanded'));comparison.remove();removed.forEach(({n,marker})=>marker.replaceWith(n));removed=[];moves.forEach(m=>{m.marker.replaceWith(m.source);m.clone.remove();m.source.classList.remove('mobile-live',...m.cls.split(' ').filter(Boolean));});canvases.forEach((value,n)=>n.inert=value);canvases.clear();}
 const update=()=>media.matches?mount():unmount();media.addEventListener('change',update);update();
 reduced.addEventListener('change',()=>{if(reduced.matches){observer?.disconnect();all('li',capsules).forEach(n=>n.classList.remove('capsule-enter'));}});
})();
