/* Adapt fixed controls to the visual viewport when an on-screen keyboard opens. Never scrolls the page. */
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
  // Vi ruller ikke selv. Nettleseren flytter feltet du trykker i inn i synsfeltet. Da vi også rullet,
  // kjempet de to mot hverandre: siden blafret, eller feltet havnet over skjermkanten (særlig AVPU og puls).
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update)}
 viewport?.addEventListener('resize',schedule);viewport?.addEventListener('scroll',schedule);
 window.addEventListener('resize',schedule);document.addEventListener('focusin',schedule);document.addEventListener('focusout',schedule);
 update();
})();
