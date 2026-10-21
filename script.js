'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const mobile = window.matchMedia('(max-width:1023px)');
function resizeDesign(){ document.documentElement.style.setProperty('--page-scale', Math.min(window.innerWidth / 1920.375, 1)); }
resizeDesign();window.addEventListener('resize',resizeDesign,{passive:true});
const nav=$('.page-nav'),topButton=$('.back-top'),progress=$('.reading-progress');
function updateScroll(){const y=window.scrollY;nav.classList.toggle('visible',y>200);topButton.classList.toggle('visible',y>600);const max=document.documentElement.scrollHeight-window.innerHeight;progress.style.transform=`scaleX(${max>0?y/max:0})`;}
window.addEventListener('scroll',updateScroll,{passive:true});updateScroll();
topButton.addEventListener('click',()=>{window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});});
const menu=$('#mobile-menu'),toggle=$('.menu-toggle');
function closeMenu(){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.textContent='목차 +';}
toggle.addEventListener('click',()=>{menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden));toggle.textContent=menu.hidden?'목차 +':'닫기 −';});
$$('a',menu).forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
const navigationObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)$$('.nav-links a').forEach(link=>{if(link.hash===`#${entry.target.id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}),{rootMargin:'-10% 0px -65% 0px'});
$$('.nav-links a').forEach(link=>{const section=$(link.hash);if(section)navigationObserver.observe(section);});
// Portfolio artwork is static. Only explicit app-demo controls register click handlers.
$('.asset-dialog')?.remove();
function makeReading(id,content){const section=$('#'+id),reading=$('.mobile-reading',section);reading.innerHTML=content;section.classList.add('has-reading');const update=()=>{reading.hidden=!mobile.matches;};mobile.addEventListener('change',update);update();}
const text=id=>$(`[data-node-id="${id}"]`)?.textContent.replace(/\s+/g,' ').trim()||'';
const safe=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
makeReading('mission',`<p class="reading-label">Mission</p><h2>${safe(text('148:7581'))}</h2>`);
makeReading('research',`<p class="reading-label">User Research</p><h2>${safe(text('148:7406'))}</h2><p>설문기간　25.11.24 – 11.30<br>반려견 보호자 및 예비 보호자 20명</p><div class="reading-card"><h3>반려견 산책 시, 어려운 점은 무엇인가요?</h3>${[['날씨·환경에 따른 산책 일정 조정','45%'],['쓰레기통·배변 수거함 부족','30%'],['산책 코스 선택의 어려움','15%'],['기타','10%']].map(([label,value])=>`<div class="reading-stat"><span>${label}</span><strong>${value}</strong></div>`).join('')}</div><p class="reading-label">Survey Findings</p><h2>${safe(text('148:7407'))}</h2>${[['148:7486','148:7487'],['148:7492','148:7493'],['148:7498','148:7499']].map(([a,b],i)=>`<article class="reading-card"><p class="reading-label">Finding 0${i+1}</p><h3>${safe(text(a))}</h3><p>${safe(text(b))}</p></article>`).join('')}`);
const researchPanel=$('[data-node-id="148:7419"]');
if(researchPanel){const problems=$$('p',researchPanel).map(p=>p.textContent.replace(/\s+/g,' ').trim()).filter(t=>!t.startsWith('Q.'));$('.reading-card',$('#research .mobile-reading')).insertAdjacentHTML('afterend',`<article class="reading-card"><h3>${safe(text('148:7449'))}</h3><ul>${problems.map(t=>`<li>${safe(t)}</li>`).join('')}</ul></article>`);}
for(const id of ['interview','pain-point','strategy','system']){
 const section=$('#'+id),canvas=$('.design-canvas',section);let blocks='';
 $$('p,li',canvas).filter(p=>!p.closest('[aria-hidden="true"]')).forEach(p=>{const value=p.textContent.replace(/\s+/g,' ').trim();if(!value)return;const size=parseFloat(getComputedStyle(p).fontSize);const cls=/^[A-Za-z\s&·0-9/]+$/.test(value)&&size>=24?'reading-label':'';const tag=size>=38?'h2':'p';blocks+=`<${tag}${cls?` class="${cls}"`:''}>${safe(value)}</${tag}>`;});
 makeReading(id,blocks);
}
const brand=$('#branding');const characterImages=$$('img',brand).filter(img=>img.src.match(/\.(?:png|webp)$/i));
makeReading('branding',`<p class="reading-label">Branding</p><h2>즐겁고 편한 산책을 연결하는 브랜드, <span style="color:#ff6f6f">댕고</span></h2><p>'댕댕이'와 'GO'를 결합해, 반려견과 보호자가 함께 걷는 즐거움을 담았어요</p><p class="reading-label">Character</p><p>산책 준비부터 활동을 마치는 순간까지,<br>친근한 표정과 다양한 동작으로 사용자에게 즐거운 경험을 전달해요</p>${characterImages[0]?`<img class="brand-character" src="${characterImages[0].getAttribute('src')}" alt="댕고 캐릭터">`:''}<div class="character-strip">${characterImages.slice(1).map((img,i)=>`<img loading="lazy" src="${img.getAttribute('src')}" alt="댕고 캐릭터 표정 ${i+1}">`).join('')}</div>`);
// Copyable color tokens are genuine buttons, and remain operable from the keyboard.
function toast(message){$('.toast')?.remove();const element=document.createElement('div');element.className='toast';element.setAttribute('role','status');element.textContent=message;document.body.append(element);setTimeout(()=>element.remove(),2200);}
$$('#color .design-canvas p').filter(p=>/^#?[a-f0-9]{6}$/i.test(p.textContent.trim())).forEach(p=>{p.tabIndex=0;p.setAttribute('role','button');p.classList.add('swatch-button');const hex='#'+p.textContent.trim().replace('#','').toUpperCase();p.setAttribute('aria-label',`${hex} 색상 코드 복사`);async function copy(){try{await navigator.clipboard.writeText(hex);toast(`${hex} 복사했어요`);}catch{toast(`색상 코드: ${hex}`);}}p.addEventListener('click',copy);p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();copy();}});});

// Page fades and short text fades are independent of Figma layout transforms.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window) {
 const sectionObserver = new IntersectionObserver(entries => {
  entries.filter(entry => entry.isIntersecting).forEach(entry => {
   entry.target.classList.add('is-visible');
   sectionObserver.unobserve(entry.target);
  });
 }, { rootMargin: '0px 0px -4% 0px', threshold: 0 });
 const textObserver = new IntersectionObserver(entries => {
  entries.filter(entry => entry.isIntersecting)
   .sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
   .forEach((entry,index) => {
    entry.target.style.setProperty('--reveal-delay', `${Math.min(index,3)*55}ms`);
    entry.target.classList.add('is-revealed');
    textObserver.unobserve(entry.target);
   });
 }, { rootMargin: '0px 0px -4% 0px', threshold: 0 });
 const sections = $$('.design-section, main > .case-section');
 const textBlocks = $$('main p, main h1, main h2, main h3, main li').filter(element => {
  if (!element.textContent.trim() || element.closest('[aria-hidden="true"]')) return false;
  if(element.closest('.phone-ui,.rating-dialog'))return false;
  return element.closest('.mobile-reading, .case-section, .lower-section') || parseFloat(getComputedStyle(element).fontSize) >= 20 || [...element.children].some(child => parseFloat(getComputedStyle(child).fontSize) >= 20);
 });
 function showAll(){
  sections.forEach(section => section.classList.add('is-visible'));
  textBlocks.forEach(element => element.classList.add('is-revealed'));
  sectionObserver.disconnect();
  textObserver.disconnect();
 }
 sections.forEach(section => {
  if(section.id === 'intro') return;
  section.classList.add('reveal-section');
  sectionObserver.observe(section);
 });
 textBlocks.forEach(element => {
  element.style.setProperty('--reveal-opacity', getComputedStyle(element).opacity);
  element.classList.add('reveal-text');
  textObserver.observe(element);
 });
 if(reducedMotion.matches) showAll();
 reducedMotion.addEventListener('change', () => { if(reducedMotion.matches) showAll(); });
 document.addEventListener('focusin', event => {
  event.target.closest('.reveal-section')?.classList.add('is-visible');
  event.target.closest('.reveal-text')?.classList.add('is-revealed');
 });
 window.addEventListener('beforeprint', showAll);
}
