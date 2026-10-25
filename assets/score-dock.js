/* Skårlinjen på mobil: viser NEWS2 (og qSOFA) nederst mens du fyller ut skjemaet, så du slipper å bla ned
 * til resultatet. Leser bare det resultatkortene allerede viser; regner ingenting selv.
 * Skjules når tastaturet er oppe, når resultatet synes på skjermen, og på andre sider.
 */
'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 const page=$('page-vurdering'),form=$('vitalsForm'),results=$('resultater');
 if(!page||!form||!results)return;
 // Feltene NEWS2 trenger. SpO₂-skala har alltid en verdi og telles ikke.
 const FIELDS=['rr','spo2','sbp','hr','temp','conscious','oxygen'];
 const mobile=matchMedia('(max-width: 770px)');
 const dock=document.createElement('div');dock.className='score-dock';dock.hidden=true;dock.dataset.level='neutral';
 const text=document.createElement('p');text.className='score-dock-text';
 const go=document.createElement('button');go.type='button';go.className='score-dock-go';go.textContent='Se skår';
 go.addEventListener('click',()=>{
  results.scrollIntoView({block:'start'});
  const h=$('result-heading');if(h){h.tabIndex=-1;h.focus({preventScroll:true})}
 });
 dock.append(text,go);document.body.append(dock);
 let resultsVisible=false,formVisible=false;
 const filled=()=>FIELDS.filter(id=>{const e=$(id);return e&&e.value.trim()!==''&&(!e.validity||e.validity.valid)}).length+(form.querySelector('input[name=confusion]:checked')?1:0);
 function render(){
  const total=FIELDS.length+1,n=filled();
  const news=$('newsNumber')?.textContent.trim(),ready=news&&news!=='–';
  const card=$('newsCard'),level=card?.classList.contains('danger')?'danger':card?.classList.contains('warning')?'warning':card?.classList.contains('red-trigger')?'red-trigger':ready?'ok':'neutral';
  dock.dataset.level=level;
  text.replaceChildren();
  if(ready){
   const strong=document.createElement('strong');strong.textContent='NEWS2 '+news;
   const status=document.createElement('span');status.textContent=$('newsStatus')?.textContent.split('·')[0].trim()||'';
   text.append(strong,status);
   const q=$('qNumber')?.textContent.trim();
   if(q&&q!=='–'){const qs=document.createElement('span');qs.className='score-dock-q';qs.textContent='qSOFA '+q;text.append(qs)}
  }else{
   const strong=document.createElement('strong');strong.textContent='NEWS2';
   const status=document.createElement('span');status.textContent=n+' av '+total+' felt fylt ut';
   text.append(strong,status);
  }
  go.hidden=!ready;
  const show=mobile.matches&&!page.hidden&&formVisible&&!resultsVisible&&n>0;
  dock.hidden=!show;
  document.documentElement.classList.toggle('score-dock-open',show);
 }
 new IntersectionObserver(e=>{resultsVisible=e.some(x=>x.isIntersecting);render()},{rootMargin:'0px 0px -80px 0px'}).observe(results);
 new IntersectionObserver(e=>{formVisible=e.some(x=>x.isIntersecting);render()}).observe(form);
 form.addEventListener('input',render);form.addEventListener('change',render);form.addEventListener('reset',()=>setTimeout(render,0));
 addEventListener('kartlegg:news2-changed',render);addEventListener('hashchange',()=>setTimeout(render,0));
 new MutationObserver(render).observe(page,{attributes:true,attributeFilter:['hidden']});
 mobile.addEventListener?.('change',render);
 render();
 window.KartleggScoreDock=Object.freeze({render,get visible(){return !dock.hidden},get text(){return text.textContent}});
})();
