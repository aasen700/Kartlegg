/* Adapt fixed controls to the visual viewport when an on-screen keyboard opens. */
'use strict';
(()=>{
 const root=document.documentElement,viewport=window.visualViewport;
 const editable=el=>el?.matches('textarea,select,input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit])');
 let frame=0,restHeight=innerHeight;
 function update(){
  frame=0;
  const height=viewport?.height||innerHeight,top=viewport?.offsetTop||0;
  root.style.setProperty('--visible-height',height+'px');
  root.style.setProperty('--visible-top',top+'px');
  if(!editable(document.activeElement))restHeight=innerHeight;
  const keyboard=editable(document.activeElement)&&innerWidth<=770&&Math.abs((viewport?.scale||1)-1)<.1&&Math.max(innerHeight,restHeight)-height>120;
  root.classList.toggle('keyboard-open',Boolean(keyboard));
  // Flytt feltet inn i synsfeltet høyst én gang per fokus. Før skjedde det ved hver rulling av det
  // synlige området, også rullingen vi selv startet. På iPhone kunne det gå i ring, så siden blafret
  // eller rullet nedover av seg selv.
  if(keyboard&&adjusted!==document.activeElement){
   const field=document.activeElement,box=field.getBoundingClientRect();
   adjusted=field;
   if(box.bottom>top+height-16||box.top<top+16)window.scrollBy(0,box.top+box.height/2-(top+height/2));
  }
 }
 let adjusted=null;
 document.addEventListener('focusout',()=>{adjusted=null});
 function schedule(){if(!frame)frame=requestAnimationFrame(update)}
 viewport?.addEventListener('resize',schedule);viewport?.addEventListener('scroll',schedule);
 window.addEventListener('resize',schedule);document.addEventListener('focusin',schedule);document.addEventListener('focusout',schedule);
 update();
})();
