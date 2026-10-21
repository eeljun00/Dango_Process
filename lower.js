(() => {
 'use strict';
 const q=(selector,root=document)=>root.querySelector(selector);
 const qa=(selector,root=document)=>[...root.querySelectorAll(selector)];
 const announce=message=>{if(typeof window.toast==='function')window.toast(message);};
 const urls=new Set();
 function sizePhones(){
  qa('.lower-section .phone-slot').forEach(slot=>{
   const width=parseFloat(slot.style.getPropertyValue('--device-w'));
   slot.style.setProperty('--mobile-phone-scale',Math.min(1,(window.innerWidth-48)/width));
  });
  qa('.wireframe-grid').forEach(grid=>grid.style.setProperty('--wire-scale',Math.min(1,((grid.clientWidth-12)/2)/235)));
 }
 sizePhones();window.addEventListener('resize',sizePhones,{passive:true});
 const sectionFor={home:'app-home',menu:'convenience',walk:'walk-planning',community:'community',archive:'walk-archive'};
 function go(id){q('#'+id)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});}
 function save(key,value){try{localStorage.setItem('dango-process:v1:'+key,JSON.stringify(value));}catch{/* The current view still confirms the save when storage is unavailable. */}}
 function filterPosts(phone,filter){
  if(!phone)return;
  qa('[data-community-filter]',phone).forEach(b=>b.classList.toggle('selected',b.dataset.communityFilter===filter));
  const search=q('.community-search input',phone)?.value.toLocaleLowerCase()||'';
  qa('.community-post',phone).forEach(row=>{row.hidden=(!(filter==='전체'||filter==='추천'||row.dataset.category===filter))||!row.textContent.toLocaleLowerCase().includes(search);});
  phone.dataset.communityFilter=filter;
 }
 const onboarding=[
  ['우리 강아지에게 딱 맞는 산책','날씨, 시간, 반려견 상태를 분석해 안전하고 즐거운 산책 코스를 안내해드려요','f0a77.webp'],
  ['모든 순간을 기록하고 연결해요','산책 기록부터 인증, 크루 모임까지 반려인들과 함께 더 즐거운 일상을 만들어가요','a9ac1.webp'],
  ['앞으로의 산책을 더욱 즐겁게','가로등, 위험 구간, 혼잡도까지 확인하고 안심할 수 있는 산책 환경을 제공해요','b1a60.webp']
 ];
 document.addEventListener('click',event=>{
  const target=event.target.closest('.lower-section button');if(!target)return;
  const phone=target.closest('.phone-ui');
  if(target.dataset.deviceNav){go(sectionFor[target.dataset.deviceNav]);return;}
  if(target.hasAttribute('data-course')){
   const custom=target.dataset.course==='custom';
   qa('[data-course]',phone).forEach(tab=>tab.classList.toggle('selected',tab===target));
   q('[data-course-title]',phone).textContent=custom?'오늘의 맞춤코스':'오늘의 추천코스';
   q('[data-course-state]',phone).textContent=custom?'완료':'미정';
   ['time','distance','calories'].forEach((key,index)=>q(`[data-metric="${key}"]`,phone).textContent=(custom?['23분','1.2km','58kal']:['48분','2.4km','118kal'])[index]);return;
  }
  if(target.hasAttribute('data-filter')){
   target.setAttribute('aria-pressed',String(target.getAttribute('aria-pressed')!=='true'));
   const count=qa('[data-filter][aria-pressed="true"]',phone).length;
   qa('.map-pin',phone).forEach((pin,index)=>pin.hidden=index>count);return;
  }
  if(target.hasAttribute('data-select')){
   qa('[data-select="gender"]',phone).forEach(button=>button.setAttribute('aria-pressed',String(button===target)));return;
  }
  if(target.hasAttribute('data-rating')){
   qa('[data-rating]',target.closest('.rating-dialog')).forEach(button=>button.setAttribute('aria-pressed',String(button===target)));return;
  }
  if(target.hasAttribute('data-pet')){
   qa('[data-pet]',phone).forEach(button=>button.setAttribute('aria-pressed',String(button===target)));
   q('[data-pet-name]',phone).textContent=target.dataset.pet+(target.dataset.pet==='삐삐'?' | 12세':' | 2세');
   q('.pet-avatar',phone).src='assets/'+(target.dataset.pet==='삐삐'?'2b846.webp':'8a6c8.webp');return;
  }
  if(target.hasAttribute('data-community-filter')){filterPosts(phone,target.dataset.communityFilter);return;}
  if(target.hasAttribute('data-post')){go('community');announce('아래 게시글 본문 화면에서 확인할 수 있어요');return;}
  if(target.hasAttribute('data-like')){const liked=target.getAttribute('aria-pressed')==='true';target.setAttribute('aria-pressed',String(!liked));q('span',target).textContent=liked?'24':'25';return;}
  if(target.hasAttribute('data-quick')){announce(target.dataset.quick+' 기능을 선택했어요');return;}
  switch(target.dataset.appAction){
   case 'plan':go('walk-planning');break;
   case 'signup':go('profile-setup');break;
   case 'archive':go('walk-archive');break;
   case 'log':go('walk-log');break;
   case 'category':announce(target.getAttribute('aria-label')+' 항목을 선택했어요');break;
   case 'profile-next':{
    const input=q('input,select',phone);if(input&&!input.checkValidity()){input.reportValidity();return;}
    target.textContent='입력 완료 ✓';save('profile',{label:q('.profile-ui label',phone)?.textContent.trim(),value:input?.value});break;
   }
   case 'onboard-next':{
    const panel=target.closest('[data-onboarding]'),step=Number(panel.dataset.onboarding);
    if(step===2){go('profile-setup');break;}
    const next=step+1;panel.dataset.onboarding=String(next);
    q('[data-onboard-title]',panel).textContent=onboarding[next][0];q('[data-onboard-description]',panel).textContent=onboarding[next][1];q('.onboard-character',panel).src='assets/'+onboarding[next][2];
    qa('.onboard-dots i',panel).forEach((dot,i)=>dot.classList.toggle('current',i===next));target.textContent=next===2?'시작하기':'다음';break;
   }
   case 'start-walk':target.textContent='산책 진행 중 ✓';target.disabled=true;save('walk-start',{at:Date.now()});go('active-walk');break;
   case 'end-walk':go('walk-log');announce('오늘의 산책 후기를 선택해 주세요');break;
   case 'save-rating':{
    const dialog=target.closest('.rating-dialog'),rating=q('[data-rating][aria-pressed="true"]',dialog)?.dataset.rating||'만족';save('rating',{rating,at:Date.now()});target.textContent='저장 완료 ✓';announce('산책 후기를 저장했어요');break;
   }
   case 'dismiss-rating':target.closest('.rating-dialog').hidden=true;announce('후기 입력을 닫았어요');break;
   case 'save-log':{
    const value=q('textarea',phone)?.value||'';save('walk-log',{text:value,at:Date.now()});target.textContent='기록 완료 ✓';announce('산책 기록을 저장했어요');break;
   }
   case 'save-post':{
    const title=q('.post-title-input',phone),body=q('textarea',phone);if(!title.value.trim()||!body.value.trim()){announce('제목과 본문을 입력해 주세요');(!title.value.trim()?title:body).focus();break;}save('post',{title:title.value,body:body.value,at:Date.now()});target.textContent='저장 완료 ✓';announce('게시글을 저장했어요');break;
   }
   case 'comment':{
    const row=target.closest('.comment-box'),input=q('input',row);if(!input.value.trim())break;const paragraph=document.createElement('p');paragraph.className='post-body';paragraph.textContent=input.value;row.before(paragraph);input.value='';break;
   }
   case 'quick':{const panel=q('.quick-menu',phone);panel.hidden=!panel.hidden;target.setAttribute('aria-expanded',String(!panel.hidden));break;}
  }
 });
 document.addEventListener('input',event=>{
  if(!event.target.closest('.lower-section'))return;
  if(event.target.matches('textarea')){const count=q('.character-count',event.target.parentElement);if(count)count.textContent=event.target.value.length+'/1000';}
  if(event.target.matches('.community-search input'))filterPosts(event.target.closest('.phone-ui'),event.target.closest('.phone-ui').dataset.communityFilter||'전체');
 });
 document.addEventListener('change',event=>{
  if(!event.target.matches('.lower-section input[type="file"]'))return;
  const file=event.target.files?.[0];if(!file)return;
  if(!file.type.startsWith('image/')){announce('이미지 파일을 선택해 주세요');return;}
  const preview=document.createElement('img'),url=URL.createObjectURL(file);urls.add(url);preview.src=url;preview.alt='추가한 사진';event.target.closest('label').before(preview);announce('사진을 추가했어요');
 });
 document.addEventListener('submit',event=>{
  if(!event.target.matches('.lower-section .chat-compose'))return;event.preventDefault();
  const input=q('input',event.target),value=input.value.trim();if(!value)return;
  const messages=q('.chat-messages',event.target.closest('.phone-ui')),bubble=document.createElement('p');bubble.className='chat-bubble own';bubble.textContent=value;messages.append(bubble);messages.scrollTop=messages.scrollHeight;input.value='';
 });
 window.addEventListener('pagehide',()=>{urls.forEach(url=>URL.revokeObjectURL(url));});
})();
