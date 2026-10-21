(() => {
 'use strict';
 const canvas=document.querySelector('#intro .design-canvas');
 const circle=canvas?.querySelector('[data-node-id="148:7501"]');
 const nodes=['148:7519','148:7517','148:7515','148:7506','148:7511','148:7513'].map(id=>canvas?.querySelector(`[data-node-id="${id}"]`));
 if(!circle||nodes.some(n=>!n)||!window.Matter)return;
 const {Engine,Bodies,Body,Composite,Sleeping}=window.Matter;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),step=1000/60;
 let engine,arena,visibilityObserver,items=[],raf=0,last=0,accumulator=0,elapsed=0,visible=false,started=false,staticOnly=false,pointer=null;
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 const stop=()=>{cancelAnimationFrame(raf);raf=0;last=0;accumulator=0;};
 function restore(){
  staticOnly=true;stop();pointer=null;visibilityObserver?.disconnect();
  items.forEach(({node,art})=>{node.style.translate='';node.style.opacity='';art.style.rotate='';});
  nodes.forEach(n=>n.classList.remove('overview-capsule','overview-waiting'));
  if(engine){Composite.clear(engine.world,false);Engine.clear(engine);}
  circle.dataset.overviewState='static';
 }
 function localRect(node){
  const base=canvas.getBoundingClientRect(),scale=base.width/canvas.offsetWidth,r=node.getBoundingClientRect();
  return{x:(r.left-base.left)/scale,y:(r.top-base.top)/scale,w:r.width/scale,h:r.height/scale};
 }
 function floorAt(x){
  const dx=Math.max(0,Math.abs(x-arena.cx)-(arena.w/2-arena.radius));
  return arena.bottom-arena.radius+Math.sqrt(Math.max(0,arena.radius**2-dx**2));
 }
 // All four rotated artwork corners stay inside the curve, without cropping the text.
 function contain(item){
  const body=item.body;
  if(Math.abs(body.angle)>.65){Body.setAngle(body,clamp(body.angle,-.65,.65));Body.setAngularVelocity(body,-body.angularVelocity*.25);}
  const cos=Math.cos(body.angle),sin=Math.sin(body.angle),corners=[];
  for(const dx of [-item.w/2,item.w/2])for(const dy of [-item.h/2,item.h/2])corners.push({x:dx*cos-dy*sin,y:dx*sin+dy*cos});
  const hw=Math.max(...corners.map(p=>Math.abs(p.x))),hh=Math.max(...corners.map(p=>Math.abs(p.y)));
  const x=clamp(body.position.x,arena.left+hw+10,arena.right-hw-10);
  const bottom=Math.min(...corners.map(p=>floorAt(x+p.x)-p.y))-10;
  const y=clamp(body.position.y,arena.top+hh+10,bottom);
  if(x!==body.position.x||y!==body.position.y){
   const vx=x!==body.position.x?-body.velocity.x*.3:body.velocity.x;
   const vy=y!==body.position.y?(y===bottom?-Math.abs(body.velocity.y)*.22:Math.abs(body.velocity.y)*.22):body.velocity.y;
   Body.setPosition(body,{x,y});Body.setVelocity(body,{x:vx,y:vy});
  }
  const speed=Math.hypot(body.velocity.x,body.velocity.y);
  if(speed>12)Body.setVelocity(body,{x:body.velocity.x*12/speed,y:body.velocity.y*12/speed});
  if(Math.abs(body.angularVelocity)>.025)Body.setAngularVelocity(body,Math.sign(body.angularVelocity)*.025);
 }
 function hover(item){
  if(!pointer||!item.released)return;
  const body=item.body,dx=pointer.x-body.position.x,dy=pointer.y-body.position.y,c=Math.cos(body.angle),s=Math.sin(body.angle);
  const lx=dx*c+dy*s,ly=-dx*s+dy*c;
  const distance=Math.hypot(Math.max(0,Math.abs(lx)-item.w/2),Math.max(0,Math.abs(ly)-item.h/2));
  if(distance>=135)return;
  const awayX=Math.abs(dx)+Math.abs(dy)<1?(item.index%2?1:-1):-dx,awayY=Math.abs(dx)+Math.abs(dy)<1?-1:-dy;
  const length=Math.hypot(awayX,awayY),force=body.mass*.0012*(1-distance/135);
  Sleeping.set(body,false);
  Body.applyForce(body,{x:body.position.x,y:body.position.y-item.h*.08},{x:awayX/length*force,y:awayY/length*force});
 }
 function render(){
  items.forEach(item=>{
   if(!item.released)return;
   const {body,node,art}=item;
   node.style.translate=`${body.position.x-item.homeX}px ${body.position.y-item.homeY}px`;
   art.style.rotate=`${body.angle-item.baseAngle}rad`;
   node.style.opacity=String(Math.min(1,(elapsed-item.at)/180));
  });
 }
 function tick(now){
  raf=0;
  if(reduced.matches){restore();return;}
  if(!visible||document.hidden||staticOnly){stop();return;}
  accumulator+=last?Math.min(50,now-last):step;last=now;
  while(accumulator>=step){
   elapsed+=step;
   items.forEach(item=>{
    if(!item.released&&elapsed>=item.at){item.released=true;Composite.add(engine.world,item.body);item.node.classList.remove('overview-waiting');}
    if(item.released)hover(item);
   });
   Engine.update(engine,step);
   items.forEach(item=>{if(item.released)contain(item);});
   accumulator-=step;
  }
  render();
  if(items.some(item=>!item.released||!item.body.isSleeping)){
   circle.dataset.overviewState='running';raf=requestAnimationFrame(tick);
  }else{circle.dataset.overviewState='settled';last=0;accumulator=0;}
 }
 function wake(){
  if(reduced.matches){if(!staticOnly)restore();return;}
  if(!raf&&engine&&visible&&!document.hidden&&!staticOnly)raf=requestAnimationFrame(tick);
 }
 function prepare(){
  if(engine||staticOnly||reduced.matches||!nodes[0].getBoundingClientRect().width)return;
  const r=localRect(circle),copy=canvas.querySelector('[data-node-id="148:7523"]'),text=localRect(copy);
  arena={cx:r.x+r.w/2,w:r.w,bottom:r.y+r.h,radius:Math.min(r.w,r.h)/2,left:Math.max(0,r.x),right:Math.min(canvas.offsetWidth,r.x+r.w),top:text.y+text.h+90};
  engine=Engine.create({enableSleeping:true,positionIterations:8,velocityIterations:8});engine.gravity.y=.75;
  const walls=[],thickness=80,cy=arena.bottom-arena.radius;
  for(let i=0;i<56;i++){
   const a=i*Math.PI/56,b=(i+1)*Math.PI/56,m=(a+b)/2,rad=arena.radius-8;
   const x1=arena.cx+rad*Math.cos(a),y1=cy+rad*Math.sin(a),x2=arena.cx+rad*Math.cos(b),y2=cy+rad*Math.sin(b);
   walls.push(Bodies.rectangle((x1+x2)/2+Math.cos(m)*thickness/2,(y1+y2)/2+Math.sin(m)*thickness/2,Math.hypot(x2-x1,y2-y1)+4,thickness,{isStatic:true,angle:Math.atan2(y2-y1,x2-x1),friction:.35,restitution:.3}));
  }
  walls.push(Bodies.rectangle(arena.cx,arena.top-40,arena.w,80,{isStatic:true}));
  Composite.add(engine.world,walls);
  const lanes=[.3,.7,.48,.23,.77,.5];let at=0;
  items=nodes.map((node,index)=>{
   const art=node.firstElementChild,r=localRect(node),style=getComputedStyle(art),matrix=new DOMMatrixReadOnly(style.transform);
   const w=parseFloat(style.width),h=parseFloat(style.height),baseAngle=Math.atan2(matrix.b,matrix.a);
   const body=Bodies.rectangle(arena.left+(arena.right-arena.left)*lanes[index]+(Math.random()-.5)*100,arena.top+130+Math.random()*80,w,h,{angle:baseAngle+(Math.random()-.5)*.22,chamfer:{radius:Math.min(40,h/2-1)},friction:.32,frictionStatic:.7,frictionAir:.025,restitution:.3,sleepThreshold:55});
   const item={node,art,body,w,h,baseAngle,homeX:r.x+r.w/2,homeY:r.y+r.h/2,index,at,released:false};
   at+=140+Math.random()*100;contain(item);
   Body.setVelocity(body,{x:(Math.random()-.5)*4.5,y:.8+Math.random()*1.5});Body.setAngularVelocity(body,(Math.random()-.5)*.014);
   node.classList.add('overview-capsule','overview-waiting');node.dataset.overviewBody='true';
   return item;
  });
  circle.dataset.overviewState='ready';
  // Observe the lower artwork, rather than the tall background's cover area.
  if('IntersectionObserver'in window){
   const intersecting=new Set();
   visibilityObserver=new IntersectionObserver(entries=>{
    if(staticOnly)return;
    entries.forEach(e=>e.isIntersecting?intersecting.add(e.target):intersecting.delete(e.target));
    visible=intersecting.size>0;
    if(visible){started=true;wake();}else{pointer=null;stop();circle.dataset.overviewState=started?'paused':'ready';}
   },{rootMargin:'140px 0px',threshold:0});nodes.forEach(n=>visibilityObserver.observe(n));
  }else{visible=true;started=true;wake();}
 }
 canvas.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch'||!engine||staticOnly)return;
  const base=canvas.getBoundingClientRect(),scale=base.width/canvas.offsetWidth,x=(e.clientX-base.left)/scale,y=(e.clientY-base.top)/scale;
  pointer=x>=arena.left&&x<=arena.right&&y>=arena.top&&y<=floorAt(x)?{x,y}:null;
  if(pointer)wake();
 },{passive:true});
 canvas.addEventListener('pointerleave',()=>{pointer=null;});
 window.addEventListener('scroll',()=>{pointer=null;},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else wake();});
 window.addEventListener('resize',()=>{if(!engine)prepare();else if(!nodes[0].getBoundingClientRect().width){visible=false;pointer=null;stop();}});
 reduced.addEventListener('change',()=>{if(reduced.matches)restore();});
 window.addEventListener('beforeprint',restore);
 if(reduced.matches){restore();return;}
 document.fonts.ready.then(prepare);
})();
