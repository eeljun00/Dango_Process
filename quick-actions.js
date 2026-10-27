/* Functional, browser-local demos for the six original Quick Actions. */
(()=>{
 const section=document.querySelector('#convenience');if(!section)return;
 const items=[['5850','camera','카메라'],['5854','album','앨범'],['5858','location','위치'],['5863','profile','프로필'],['5867','voice','음성'],['5871','schedule','일정']];
 const dialog=document.createElement('dialog');dialog.className='quick-demo-dialog';dialog.setAttribute('aria-labelledby','quick-demo-title');
 dialog.innerHTML='<div class="quick-demo-header"><h2 id="quick-demo-title"></h2><button class="quick-demo-close" type="button" aria-label="닫기">×</button></div><div class="quick-demo-body"></div><p class="quick-demo-status" role="status" aria-live="polite"></p>';
 document.body.append(dialog);
 const body=dialog.querySelector('.quick-demo-body'),status=dialog.querySelector('.quick-demo-status');
 let opener=null,version=0,stream=null,recorder=null,ticker=null;const urls=new Set();
 const setStatus=text=>{status.textContent=text;};
 const url=blob=>{const value=URL.createObjectURL(blob);urls.add(value);return value;};
 const cleanup=()=>{version++;clearInterval(ticker);ticker=null;if(recorder?.state==='recording')recorder.stop();stream?.getTracks().forEach(t=>t.stop());stream=null;recorder=null;urls.forEach(u=>URL.revokeObjectURL(u));urls.clear();};
 const save=(key,data)=>{try{localStorage.setItem('dango-process:v1:quick-'+key,JSON.stringify(data));return true;}catch{setStatus('브라우저 저장 공간에 저장할 수 없어요. 현재 창에서는 확인할 수 있어요.');return false;}};
 const load=key=>{try{return JSON.parse(localStorage.getItem('dango-process:v1:quick-'+key))||{};}catch{return {};}};
 function preview(title,lines=[]){body.querySelector('.quick-demo-preview')?.remove();const card=document.createElement('div');card.className='quick-demo-preview';const heading=document.createElement('h3');heading.textContent=title;card.append(heading);for(const text of lines){const p=document.createElement('p');p.textContent=text;card.append(p);}body.append(card);return card;}
 dialog.querySelector('.quick-demo-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{cleanup();opener?.focus({preventScroll:true});});
 window.addEventListener('pagehide',cleanup);
 function photos(kind){
  body.innerHTML='<p>사진을 선택하면 이 창에서 미리 볼 수 있어요.</p><input class="quick-demo-file" type="file" accept="image/*" hidden><button class="quick-demo-primary" type="button" data-demo-action="pick"></button>';
  const input=body.querySelector('input'),button=body.querySelector('button');button.textContent=kind==='camera'?'사진 촬영 / 선택':'앨범에서 사진 선택';
  if(kind==='camera')input.setAttribute('capture','environment');else input.multiple=true;
  button.onclick=()=>input.click();input.onchange=()=>{const files=[...input.files].filter(f=>f.type.startsWith('image/')).slice(0,3);if(!files.length){setStatus('이미지 파일을 선택해 주세요.');return;}const card=preview(files.length+'장의 사진');for(const file of files){const image=document.createElement('img');image.alt=file.name;image.src=url(file);card.append(image);}setStatus('사진을 추가했어요.');};
 }
 function locationDemo(){
  body.innerHTML='<p>공유할 장소를 입력하거나 현재 위치를 확인하세요.</p><form><label>장소 또는 주소<input name="place" required placeholder="장소 이름이나 주소"></label><div class="quick-demo-actions"><button type="button" data-demo-action="locate">현재 위치 확인</button><button class="quick-demo-primary" type="submit">위치 저장</button></div></form>';
  const form=body.querySelector('form'),place=form.elements.place;place.value=load('location').place||'';let coordinates=null;place.addEventListener('input',()=>{coordinates=null;});
  body.querySelector('[data-demo-action="locate"]').onclick=()=>{if(!navigator.geolocation){setStatus('이 브라우저에서는 위치 확인을 지원하지 않아요. 장소를 직접 입력해 주세요.');return;}const current=version;setStatus('현재 위치를 확인하고 있어요.');navigator.geolocation.getCurrentPosition(position=>{if(current!==version||!dialog.open)return;coordinates={latitude:position.coords.latitude,longitude:position.coords.longitude};place.value=coordinates.latitude.toFixed(5)+', '+coordinates.longitude.toFixed(5);setStatus('현재 위치를 확인했어요.');},()=>{if(current===version)setStatus('위치를 확인할 수 없어요. 장소를 직접 입력해 주세요.');},{timeout:10000,maximumAge:60000});};
  form.onsubmit=e=>{e.preventDefault();const data={place:place.value.trim(),coordinates};if(!data.place)return;preview('공유할 위치',[data.place]);if(save('location',data))setStatus('위치를 저장했어요.');};
 }
 function profileDemo(){
  body.innerHTML='<p>반려견 정보를 입력해 프로필 카드를 만들어 보세요.</p><form><label>이름<input name="petName" required maxlength="30" autocomplete="off"></label><label>견종<input name="breed" maxlength="40" autocomplete="off"></label><label>소개<textarea name="intro" maxlength="300"></textarea></label><div class="quick-demo-actions"><button class="quick-demo-primary" type="submit">프로필 카드 만들기</button></div></form>';
  const form=body.querySelector('form'),saved=load('profile');for(const key of ['petName','breed','intro'])form.elements[key].value=saved[key]||'';
  form.onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(['petName','breed','intro'].map(key=>[key,form.elements[key].value.trim()]));if(!data.petName)return;preview(data.petName,[data.breed,data.intro].filter(Boolean));if(save('profile',data))setStatus('프로필 카드를 저장했어요.');};
 }
 function voiceDemo(){
  body.innerHTML='<p>짧은 음성 메시지를 녹음하고 재생해 보세요.</p><div class="quick-demo-actions"><button class="quick-demo-primary" type="button" data-demo-action="record">녹음 시작</button><button type="button" data-demo-action="stop" disabled>녹음 종료</button><button type="button" data-demo-action="audio-file">음성 파일 선택</button></div><input type="file" accept="audio/*" hidden>';
  const start=body.querySelector('[data-demo-action="record"]'),stop=body.querySelector('[data-demo-action="stop"]'),file=body.querySelector('input');
  const audioPreview=blob=>{const card=preview('음성 미리보기'),audio=document.createElement('audio');audio.controls=true;audio.src=url(blob);card.append(audio);setStatus('재생 버튼을 눌러 음성을 확인하세요.');};
  body.querySelector('[data-demo-action="audio-file"]').onclick=()=>file.click();file.onchange=()=>{if(file.files[0])audioPreview(file.files[0]);};
  start.onclick=async()=>{if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){setStatus('녹음을 지원하지 않는 브라우저예요. 음성 파일을 선택해 주세요.');return;}const current=version;start.disabled=true;setStatus('마이크를 연결하고 있어요.');try{const recordingStream=await navigator.mediaDevices.getUserMedia({audio:true});if(current!==version||!dialog.open){recordingStream.getTracks().forEach(t=>t.stop());return;}stream=recordingStream;const chunks=[];let recordingTicker=null;recorder=new MediaRecorder(stream);recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onstop=()=>{if(current===version&&dialog.open){audioPreview(new Blob(chunks,{type:chunks[0]?.type||'audio/webm'}));start.disabled=false;stop.disabled=true;}recordingStream.getTracks().forEach(t=>t.stop());clearInterval(recordingTicker);if(ticker===recordingTicker)ticker=null;};recorder.start();stop.disabled=false;let seconds=0;setStatus('녹음 중 · 0초');ticker=recordingTicker=setInterval(()=>{seconds++;setStatus('녹음 중 · '+seconds+'초');if(seconds>=60&&recorder?.state==='recording')recorder.stop();},1000);}catch{stream?.getTracks().forEach(t=>t.stop());stream=null;if(current===version){start.disabled=false;setStatus('마이크를 사용할 수 없어요. 권한을 확인하거나 음성 파일을 선택해 주세요.');}}};
  stop.onclick=()=>{if(recorder?.state==='recording'){stop.disabled=true;recorder.stop();}};
 }
 function scheduleDemo(){
  body.innerHTML='<p>산책이나 약속 일정을 저장하고 캘린더로 가져갈 수 있어요.</p><form><label>일정 이름<input name="title" required maxlength="100"></label><label>날짜와 시간<input name="startsAt" type="datetime-local" required></label><label>장소<input name="place" maxlength="200"></label><div class="quick-demo-actions"><button class="quick-demo-primary" type="submit">일정 저장</button><button type="button" data-demo-action="calendar" hidden>캘린더 파일 받기</button></div></form>';
  const form=body.querySelector('form'),saved=load('schedule'),download=form.querySelector('[data-demo-action="calendar"]');let data=null;
  for(const key of ['title','startsAt','place'])form.elements[key].value=saved[key]||'';
  form.onsubmit=e=>{e.preventDefault();data=Object.fromEntries(['title','startsAt','place'].map(key=>[key,form.elements[key].value.trim()]));if(!data.title||!Number.isFinite(new Date(data.startsAt).getTime()))return;preview(data.title,[new Date(data.startsAt).toLocaleString('ko-KR'),data.place].filter(Boolean));download.hidden=false;if(save('schedule',data))setStatus('일정을 저장했어요.');};
  download.onclick=()=>{if(!data)return;const date=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');const escape=value=>value.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');const start=new Date(data.startsAt),end=new Date(start.getTime()+3600000);const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Dango//Portfolio Demo//KO','BEGIN:VEVENT','UID:'+(crypto.randomUUID?.()||Date.now())+'@daenggo.local','DTSTAMP:'+date(new Date()),'DTSTART:'+date(start),'DTEND:'+date(end),'SUMMARY:'+escape(data.title),'LOCATION:'+escape(data.place),'END:VEVENT','END:VCALENDAR',''].join('\r\n');const link=document.createElement('a');link.href=url(new Blob([ics],{type:'text/calendar;charset=utf-8'}));link.download='daenggo-schedule.ics';link.click();};
 }
 function open(kind,label,node){cleanup();opener=node;body.replaceChildren();setStatus('');dialog.querySelector('h2').textContent=label;dialog.dataset.action=kind;if(kind==='camera'||kind==='album')photos(kind);else if(kind==='location')locationDemo();else if(kind==='profile')profileDemo();else if(kind==='voice')voiceDemo();else scheduleDemo();dialog.showModal();}
 for(const [id,kind,label]of items){const node=section.querySelector('[data-node-id="148:'+id+'"]');if(!node)continue;node.classList.add('quick-demo-trigger');node.tabIndex=0;node.setAttribute('role','button');node.setAttribute('aria-label',label+' 데모 열기');node.setAttribute('aria-haspopup','dialog');const activate=e=>{if(e.type==='keydown'&&!['Enter',' '].includes(e.key))return;e.preventDefault();e.stopImmediatePropagation();open(kind,label,node);};node.addEventListener('click',activate,true);node.addEventListener('keydown',activate,true);}
 // Visual hover tour: only camera, location and voice take turns. Real hover/focus takes priority.
 const quickPanel=section.querySelector('[data-node-id="148:5632"]');
 const triggers=[...section.querySelectorAll('.quick-demo-trigger')];
 const tour=['5850','5858','5867'].map(id=>section.querySelector('[data-node-id="148:'+id+'"]')).filter(Boolean);
 let tourTimer=null,tourIndex=0,tourVisible=false,hovered=null;
 const stopTour=()=>{clearTimeout(tourTimer);tourTimer=null;};
 const selectQuick=node=>triggers.forEach(n=>n.classList.toggle('is-quick-highlight',n===node));
 function runTour(){
  stopTour();const focused=triggers.find(n=>n.contains(document.activeElement));
  if(!tourVisible||document.hidden){selectQuick(null);return;}
  const manual=dialog.open?opener:hovered||focused;
  if(manual){selectQuick(manual);return;}
  if(dangoReducedMotion.matches||!tour.length){selectQuick(null);return;}
  selectQuick(tour[tourIndex]);tourTimer=setTimeout(()=>{tourIndex=(tourIndex+1)%tour.length;runTour()},560);
 }
 if(quickPanel){
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{tourVisible=entries[0].isIntersecting;runTour()},{threshold:.2}).observe(quickPanel);
  else{tourVisible=true;runTour();}
  quickPanel.addEventListener('pointerover',e=>{const node=e.target.closest('.quick-demo-trigger');if(node&&node!==hovered){hovered=node;runTour();}});
  quickPanel.addEventListener('pointerout',e=>{const next=e.relatedTarget?.closest?.('.quick-demo-trigger');if(hovered&&next!==hovered){hovered=next;runTour();}});
  quickPanel.addEventListener('focusin',runTour);quickPanel.addEventListener('focusout',()=>queueMicrotask(runTour));
  new MutationObserver(runTour).observe(dialog,{attributes:true,attributeFilter:['open']});
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
