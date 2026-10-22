'use strict';
// One rate for time-based portfolio motion; scroll-scrubbed paths remain 1:1.
const dangoMotionRate=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--motion-rate'))||1;
const dangoMotionTime=milliseconds=>milliseconds/dangoMotionRate;
// Motion follows the accessibility preference independently of the fixed layout floor.
const dangoReducedMotion=matchMedia('(prefers-reduced-motion:reduce)');
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
function resizeDesign(){
 const root=document.documentElement,width=root.clientWidth||window.innerWidth;
 root.classList.toggle('compact-layout',width<768);
 root.style.setProperty('--layout-width',`${Math.max(768,width)}px`);
 root.style.setProperty('--page-scale',Math.min(Math.max(768,width)/1920.375,1));
}
resizeDesign();window.addEventListener('resize',resizeDesign,{passive:true});
const nav=$('.page-nav'),topButton=$('.back-top');
function updateScroll(){const y=window.scrollY;nav.classList.toggle('visible',y>200);topButton.classList.toggle('visible',y>600);}
window.addEventListener('scroll',updateScroll,{passive:true});updateScroll();
topButton.addEventListener('click',()=>{window.scrollTo({top:0,behavior:dangoReducedMotion.matches?'instant':'smooth'});});
const menu=$('#mobile-menu'),toggle=$('.menu-toggle');
function closeMenu(){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.textContent='목차 +';}
toggle.addEventListener('click',()=>{menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden));toggle.textContent=menu.hidden?'목차 +':'닫기 −';});
$$('a',menu).forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
const navigationObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)$$('.nav-links a').forEach(link=>{if(link.hash===`#${entry.target.id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}),{rootMargin:'-10% 0px -65% 0px'});
$$('.nav-links a').forEach(link=>{const section=$(link.hash);if(section)navigationObserver.observe(section);});
// Portfolio artwork is static. Only explicit app-demo controls register click handlers.
$('.asset-dialog')?.remove();
// Keep authored artwork at every supported width; no flattened reading views or cloned controls.
// Copyable color tokens are genuine buttons, and remain operable from the keyboard.
function toast(message){$('.toast')?.remove();const element=document.createElement('div');element.className='toast';element.setAttribute('role','status');element.textContent=message;document.body.append(element);setTimeout(()=>element.remove(),2200);}
$$('#color .design-canvas p').filter(p=>/^#?[a-f0-9]{6}$/i.test(p.textContent.trim())).forEach(p=>{p.tabIndex=0;p.setAttribute('role','button');p.classList.add('swatch-button');const hex='#'+p.textContent.trim().replace('#','').toUpperCase();p.setAttribute('aria-label',`${hex} 색상 코드 복사`);async function copy(){try{await navigator.clipboard.writeText(hex);toast(`${hex} 복사했어요`);}catch{toast(`색상 코드: ${hex}`);}}p.addEventListener('click',copy);p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();copy();}});});

// Page fades and short text fades are independent of Figma layout transforms.
const reducedMotion = dangoReducedMotion;
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
    entry.target.style.setProperty('--reveal-delay', `${dangoMotionTime(Math.min(index,3)*55)}ms`);
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
