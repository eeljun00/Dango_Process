/* Community demo: one owner for composing, persisted posts, list and detail. */
(()=>{
 const section=document.querySelector('#community');if(!section)return;
 const q=id=>section.querySelector('[data-node-id="'+id+'"]');
 const list=q('148:6460'),detail=q('148:6972'),write=q('148:7375');if(!list||!detail||!write)return;
 const notify=message=>{if(typeof toast==='function')toast(message);};
 const clean=value=>String(value||'').replace(/\u00a0/g,' ').replace(/[\u200b-\u200d\ufeff]/g,'').trim();
 const moveCaret=node=>{const range=document.createRange();range.selectNodeContents(node);range.collapse(false);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);};
 const activate=(node,label,run)=>{
  if(!node)return;node.tabIndex=0;node.setAttribute('role','button');node.setAttribute('aria-label',label);
  const handler=e=>{if(e.type==='keydown'&&(!['Enter',' '].includes(e.key)||e.repeat||e.isComposing))return;e.preventDefault();e.stopPropagation();if(node.getAttribute('aria-disabled')!=='true')run();};
  node.addEventListener('click',handler,true);node.addEventListener('keydown',handler,true);
 };
 const open=node=>node?.scrollIntoView({block:'center',behavior:dangoReducedMotion.matches?'instant':'smooth'});
 const key='dango-process:v1:community-posts',draftKey='dango-process:v1:community-draft',categories=['추천','자유','동네','병원','전문가'];
 const validPost=p=>p&&typeof p.id==='string'&&typeof p.title==='string'&&clean(p.title)&&typeof p.body==='string'&&clean(p.body)&&(!p.photos||Array.isArray(p.photos));
 let posts=[],storageReadable=true;
 try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved!==null){if(saved.version!==1||!Array.isArray(saved.posts)||!saved.posts.every(validPost))throw new Error('Invalid community data');posts=saved.posts;}}catch{storageReadable=false;}
 const persist=next=>{
  // Never overwrite unreadable existing data with an empty collection.
  if(!storageReadable)throw new Error('Unreadable community data');
  localStorage.setItem(key,JSON.stringify({version:1,posts:next}));posts=next;
 };
 const safePhoto=url=>typeof url==='string'&&/^data:image\/(png|jpe?g|webp|gif|avif);base64,/i.test(url);
 const originalRows=[...list.querySelectorAll('[data-name="목록글"]')],rowTemplate=originalRows[0].cloneNode(true),rowGroup=q('148:6599');
 const chips=[...q('148:6959').children];let filter=0,current=null,originalLiked=false;
 const rowCategory=row=>row.dataset.topic||[...row.querySelectorAll('p')].map(n=>n.textContent.trim()).find(t=>categories.includes(t));
 function applyFilter(index){
  filter=index;chips.forEach((chip,j)=>{chip.setAttribute('aria-pressed',String(j===index));chip.classList.toggle('community-filter-selected',j===index);chip.classList.toggle('community-filter-idle',j!==index);});
  list.querySelectorAll('[data-name="목록글"]').forEach(row=>{row.hidden=index!==0&&rowCategory(row)!==categories[index];});
 }
 chips.forEach((chip,index)=>{chip.setAttribute('aria-pressed',String(index===0));activate(chip,categories[index]+' 게시글 보기',()=>applyFilter(index));});
 const originalText=new Map(['148:6993','148:6996','148:7027','148:7041','148:7046','148:7055'].map(id=>[id,q(id).textContent]));
 const content=q('148:7031'),originalContent=content.innerHTML,like=q('148:7042'),likeCount=q('148:7046'),reply=q('148:7160'),replyPlaceholder=reply.textContent;
 const replyKey=()=>current?'dango-process:v1:community-reply:'+current.id:'dango-process:v1:community-reply';
 function loadReply(){let saved='';try{saved=localStorage.getItem(replyKey())||'';}catch{}reply.textContent=saved||replyPlaceholder;reply.dataset.placeholder=String(!saved);}
 function showDetail(post){
  current=post;detail.classList.toggle('community-saved-detail',!!post);
  if(post){
   q('148:6993').textContent='나';q('148:6996').textContent='내가 작성한 글';q('148:7027').textContent=post.title;content.replaceChildren();
   const text=document.createElement('p');text.textContent=post.body;content.append(text);
   if(clean(post.place)){const place=document.createElement('p');place.textContent='장소: '+post.place;content.append(place);}
   for(const src of (post.photos||[]).filter(safePhoto)){const img=document.createElement('img');img.src=src;img.alt='게시글 첨부 사진';content.append(img);}
   q('148:7041').textContent='0';likeCount.textContent=post.liked?'1':'0';q('148:7055').textContent='0';
  }else{
   originalText.forEach((text,id)=>{q(id).textContent=text;});content.innerHTML=originalContent;content.querySelectorAll('.reveal-text').forEach(n=>n.classList.add('is-revealed'));
   likeCount.textContent=String(Number(originalText.get('148:7046'))+(originalLiked?1:0));
  }
  q('148:7078').style.visibility=post?'hidden':'';like.setAttribute('aria-pressed',String(post?!!post.liked:originalLiked));loadReply();open(detail);
 }
 function renderPosts(){
  rowGroup.querySelectorAll('[data-post-id]').forEach(n=>n.remove());rowGroup.classList.toggle('community-has-posts',posts.length>0);
  const fragment=document.createDocumentFragment();
  posts.forEach((post,index)=>{
   const row=rowTemplate.cloneNode(true);row.dataset.postId=post.id;row.dataset.topic=post.topic||'자유';
   [row,...row.querySelectorAll('*')].forEach(n=>{n.removeAttribute('data-node-id');n.classList.remove('reveal-text','is-revealed');n.removeAttribute('data-reveal');});
   row.classList.add('community-saved-row');row.querySelector('.cn42').textContent=String(index+1);row.querySelector('.cn45').textContent=row.dataset.topic;row.querySelector('.cn47').textContent=post.title;
   const meta=row.querySelectorAll('.cn51');meta[0].textContent='내가 작성한 글';meta[1].textContent='0';
   const photo=row.querySelector('.cn60'),src=(post.photos||[]).find(safePhoto);photo.style.visibility=src?'':'hidden';if(src)photo.querySelector('img').src=src;
   activate(row,post.title+' 상세 보기',()=>showDetail(posts.find(p=>p.id===post.id)));fragment.append(row);
  });
  rowGroup.prepend(fragment);if(filter)applyFilter(filter);
 }
 for(const row of originalRows)activate(row,'게시글 상세 보기',()=>showDetail(null));
 activate(q('148:6950'),'새 글 작성하기',()=>open(write));
 activate(q('I148:6981;678:3522'),'게시글 목록으로 돌아가기',()=>open(list));
 activate(q('I148:7389;678:3522'),'게시글 목록으로 돌아가기',()=>open(list));
 like.setAttribute('aria-pressed','false');activate(like,'게시글 좋아요',()=>{
  if(current){const updated={...current,liked:!current.liked};try{persist(posts.map(p=>p.id===current.id?updated:p));current=updated;}catch{notify('좋아요를 저장하지 못했어요');return;}likeCount.textContent=updated.liked?'1':'0';like.setAttribute('aria-pressed',String(updated.liked));}
  else{originalLiked=!originalLiked;likeCount.textContent=String(Number(originalText.get('148:7046'))+(originalLiked?1:0));like.setAttribute('aria-pressed',String(originalLiked));}
 });
 // Keep existing reply drafts, separated by post so content cannot leak between details.
 reply.contentEditable='true';reply.setAttribute('role','textbox');reply.setAttribute('aria-label','답글 입력');reply.spellcheck=false;loadReply();
 reply.addEventListener('focus',()=>{if(reply.dataset.placeholder==='true'){reply.textContent='';reply.dataset.placeholder='false';moveCaret(reply);}});
 reply.addEventListener('pointerdown',event=>{if(reply.dataset.placeholder==='true'&&event.button===0){event.preventDefault();reply.focus();moveCaret(reply);}});
 reply.addEventListener('blur',()=>{if(!clean(reply.textContent)){reply.textContent=replyPlaceholder;reply.dataset.placeholder='true';}});
 reply.addEventListener('input',()=>{reply.dataset.placeholder='false';try{localStorage.setItem(replyKey(),reply.textContent);}catch{notify('답글 초안을 저장하지 못했어요');}});
 // Explicit placeholder state survives reveal classes/styles changing nested HTML.
 function field(id,label,multiline=false){
  const node=q(id),original=node.innerHTML;let placeholder=true;
  node.contentEditable='true';node.setAttribute('role','textbox');node.setAttribute('aria-label',label);node.setAttribute('aria-multiline',String(multiline));node.spellcheck=false;
  const editing=()=>{placeholder=false;node.classList.add('community-field-edited');node.removeAttribute('aria-invalid');};
  const reset=()=>{placeholder=true;node.innerHTML=original;node.classList.remove('community-field-edited');node.removeAttribute('aria-invalid');node.querySelectorAll('.reveal-text').forEach(n=>n.classList.add('is-revealed'));};
  node.addEventListener('focus',()=>{if(placeholder){node.textContent='';editing();moveCaret(node);}else editing();});
  // Removing the clicked placeholder paragraph during native pointer focus can leave
  // the selection in the previous editor. Place it in the new editor explicitly.
  node.addEventListener('pointerdown',event=>{if(placeholder&&event.button===0){event.preventDefault();node.focus();moveCaret(node);}});
  node.addEventListener('input',editing);node.addEventListener('blur',()=>{if(!clean(node.textContent))reset();});
  return{node,reset,value:()=>placeholder?'':clean(node.innerText),set:value=>{node.textContent=value;editing();}};
 }
 const title=field('148:7384','게시글 제목'),body=field('148:7386','게시글 내용',true),place=field('148:7394','공유할 장소');
 const category=q('148:7391'),categoryPlaceholder=category.textContent;let topic=-1;
 activate(category,'게시글 주제 선택',()=>{topic=(topic+1)%categories.length;category.textContent=categories[topic];});
 activate(q('148:7395'),'공유할 장소 확인',()=>notify(place.value()||'공유할 장소를 입력해 주세요'));
 // Legacy storage held drafts only. Restore for editing, without silently publishing.
 try{const draft=JSON.parse(localStorage.getItem(draftKey)||'null');if(draft){for(const [name,f]of [['title',title],['body',body],['place',place]])if(typeof draft[name]==='string'&&clean(draft[name]))f.set(draft[name]);topic=categories.indexOf(draft.topic);if(topic>=0)category.textContent=categories[topic];}}catch{}
 const photo=q('148:7379'),counter=q('148:7380'),input=document.createElement('input');input.type='file';input.accept='image/*';input.multiple=true;input.hidden=true;write.append(input);let files=[];
 activate(photo,'사진 추가',()=>input.click());input.addEventListener('change',event=>{
  // This native screen owns uploads; the generic phone demo expects a label wrapper.
  event.stopPropagation();
  files=[...input.files].filter(f=>/^image\/(png|jpe?g|webp|gif|avif)$/i.test(f.type)).slice(0,3);counter.textContent=files.length+'/3';photo.querySelector('.community-upload-preview')?.remove();
  if(files[0]){const img=document.createElement('img');img.className='community-upload-preview';img.alt='추가한 사진';const url=URL.createObjectURL(files[0]);img.onload=img.onerror=()=>URL.revokeObjectURL(url);img.src=url;photo.prepend(img);}
 });
 const readPhoto=file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file);});
 const save=q('148:7397');let saving=false,cooldown=false;
 activate(save,'작성한 글 저장',async()=>{
  if(saving||cooldown)return;const values={title:title.value(),body:body.value(),place:place.value(),topic:categories[topic]||'자유'};
  if(!values.title||!values.body){title.node.setAttribute('aria-invalid',String(!values.title));body.node.setAttribute('aria-invalid',String(!values.body));notify(!values.title&&!values.body?'제목과 내용을 입력해 주세요':!values.title?'제목을 입력해 주세요':'내용을 입력해 주세요');(!values.title?title:body).node.focus();return;}
  saving=true;save.setAttribute('aria-disabled','true');write.setAttribute('aria-busy','true');const attachments=files;
  try{
   const photos=await Promise.all(attachments.map(readPhoto)),post={id:crypto.randomUUID(),...values,photos,createdAt:new Date().toISOString(),liked:false};persist([post,...posts]);
   // Commit first, then reset. In-flight/repeated clicks cannot publish twice.
   cooldown=true;setTimeout(()=>{cooldown=false;},650);
   if(title.value()===values.title&&body.value()===values.body&&place.value()===values.place&&files===attachments){title.reset();body.reset();place.reset();topic=-1;category.textContent=categoryPlaceholder;files=[];input.value='';counter.textContent='0/3';photo.querySelector('.community-upload-preview')?.remove();}
   try{localStorage.removeItem(draftKey);}catch{}
   renderPosts();applyFilter(0);rowGroup.scrollTop=0;notify('게시글을 저장했어요');open(list);
  }catch{notify('게시글을 저장하지 못했어요. 브라우저 저장 공간·권한을 확인한 뒤 다시 시도해 주세요');}
  finally{saving=false;save.removeAttribute('aria-disabled');write.removeAttribute('aria-busy');}
 });
 renderPosts();
})();
