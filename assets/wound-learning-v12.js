/* TIMES interactive teaching: six fictional cases, one consistent clinical illustration style.
 * Never accepts patient identifiers. No storage, networking or treatment decisions.
 */
'use strict';
(()=>{
 const D=window.KartleggWoundLearning,chooser=document.getElementById('learningHubChooser');
 const panel=document.getElementById('learnTimesModule'),root=document.getElementById('woundLearningRoot');
 if(!D||!chooser||!panel||!root)return;
 const h=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
 const b=(txt,cls,fn)=>{const e=h('button',cls,txt);e.type='button';e.addEventListener('click',fn);return e};
 let mode='home',caseIndex=0,lesson=0,answers={},grades={},finished=false,view='analyse';
 const cases=()=>D.cases.filter(c=>c.level===(mode==='practice'?'Øv':'Test'));
 const course=b('','learn12-course-card wound12-course',()=>open('home'));course.dataset.learnTool='times';
 course.setAttribute('aria-pressed','false');course.append(h('span','learn12-course-symbol','▤'));
 const words=h('span','learn12-course-copy');words.append(h('strong','','TIMES'),h('small','','Seks fiktive kasus · medisinske illustrasjoner'));course.append(words);chooser.append(course);
 function picture(c,compact=false){
  const fig=h('figure','wound13-picture'+(compact?' compact':''));
  const viewport=h('div','wound13-image-viewport'),img=h('img','wound13-image is-oversikt');
  img.src='assets/wounds/'+c.id+'-clinical.svg';
  img.style.transformOrigin=({venous:'50% 57%',arterial:'55% 49%',pressure:'70% 52%',postop:'50% 50%',diabetic:'47% 48%','skin-tear':'52% 52%'})[c.id];
  img.alt='Digitalt laget, anatomisk tilpasset undervisningsillustrasjon av '+c.title+'. Fiktivt kasus, ikke pasientfoto.';
  img.loading=compact?'lazy':'eager';img.decoding='async';
  img.addEventListener('error',()=>{
   if(img.dataset.fallback)return;
   img.dataset.fallback='true';img.hidden=true;viewport.append(h('p','wound-image-unavailable','Illustrasjonen kunne ikke lastes. Bruk opplysningene i kasusbeskrivelsen.'));
  });
  viewport.append(img);fig.append(viewport);
  if(!compact){
   const tools=h('div','wound13-image-tools');tools.append(h('strong','','Undersøk illustrasjonen'));
   for(const [key,label] of [['oversikt','Oversikt'],['sarbunn','Sårbunn'],['sarkant','Sårkant / hud']]){
    const button=b(label,'wound13-image-button'+(key==='oversikt'?' active':''),()=>{
      img.className='wound13-image is-'+key;
      tools.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===button));
      tools.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===button)));
    });
    button.setAttribute('aria-pressed',String(key==='oversikt'));tools.append(button);
   }
   fig.append(tools);
  }
  fig.append(h('figcaption','','Original digital undervisningsillustrasjon av et fiktivt kasus – ikke pasientfoto. Utsnitt og farger er pedagogiske; observer og vurder også opplysningene i teksten.'));
  return fig;
 }
 function header(kicker,title){
  const d=h('div','wound12-header');d.append(h('small','',kicker),h('h3','',title));
  if(mode!=='home')d.append(b('← Til oversikten','learn12-secondary',()=>setMode('home')));
  root.append(d);
 }
 function setMode(m){mode=m;lesson=0;caseIndex=0;answers={};grades={};finished=false;view='analyse';render()}
 function open(m='home'){
  document.querySelector('[data-page="laer"]')?.click();
  for(const id of ['learnGcsModule','learn4atModule','learnNews2Module']){const p=document.getElementById(id);if(p)p.hidden=true}
  panel.hidden=false;
  chooser.querySelectorAll('[data-learn-tool]').forEach(x=>{x.classList.toggle('is-active',x===course);x.setAttribute('aria-pressed',String(x===course))});
  setMode(['learn','practice','test'].includes(m)?m:'home');
 }
 chooser.addEventListener('click',e=>{
  if(e.target.closest('[data-learn-tool]')!==course)panel.hidden=true;
 },true);
 function home(){
  header('Kartlegg Lær · sårvurdering','TIMES – lær, øv og test');
  root.append(h('p','wound13-lead','Seks fiktive sårkasus med klinisk inspirerte medisinske undervisningsillustrasjoner. Lær å beskrive sårbunn, infeksjons-/inflammasjonstegn, fuktbalanse, sårkant og huden rundt. Ingen pasientfoto, journalføring eller behandlingsråd.'));
  const hero=h('section','wound13-home-hero');
  hero.append(picture(D.cases[0],true));
  const expl=h('div','wound13-home-copy');expl.append(h('span','wound13-eyebrow','OBSERVÉR · BESKRIV · VURDER'),h('h4','','Lær systematisk sårvurdering'),h('p','','Illustrasjonene er laget for å gjøre vevstyper og anatomi lettere å kjenne igjen. Infeksjon, sårårsak og fuktbalanse må alltid vurderes ut fra hele situasjonen, ikke et bilde alene.'));
  hero.append(expl);root.append(hero);
  const cols=h('div','wound12-modes');
  for(const [key,num,title,detail] of [['learn','01','Lær','Seks korte leksjoner om TIMES og vurderingsbegrepene.'],['practice','02','Øv','Tre kasus med forklaring etter innlevering.'],['test','03','Test deg selv','Tre kasus der fasiten vises samlet til slutt.']]){
    const c=h('article','wound12-mode wound13-mode');c.append(h('span','wound12-num',num),h('h4','',title),h('p','',detail),b('Start '+title.toLowerCase()+' →','learn12-primary',()=>setMode(key)));cols.append(c);
  }
  root.append(cols);
  const gallery=h('section','wound13-gallery');gallery.append(h('h4','','De seks øvingskasusene'));
  const grid=h('div','wound13-gallery-grid');
  for(const c of D.cases){const card=h('article','wound13-gallery-card');card.append(picture(c,true),h('strong','',c.title),h('small','',c.level+' · '+c.subtitle));grid.append(card)}
  gallery.append(grid);root.append(gallery);
 }
 function learn(){
  const x=D.lessons[lesson];header('Lær · '+(lesson+1)+' av '+D.lessons.length,x.title);
  root.append(h('p','wound12-intro',x.body));
  const ul=h('ul','wound12-tips');x.tips.forEach(y=>ul.append(h('li','',y)));root.append(ul);
  const actions=h('div','wound12-actions');
  if(lesson)actions.append(b('← Forrige','learn12-secondary',()=>{lesson--;render()}));
  actions.append(b(lesson===D.lessons.length-1?'Start å øve →':'Neste tema →','learn12-primary',()=>{
   if(lesson===D.lessons.length-1)setMode('practice');else{lesson++;render()}
  }));root.append(actions);
 }
 function caseView(){
  const q=cases()[caseIndex],submitted=grades[q.id],a=answers[q.id]||{};
  header((mode==='practice'?'Øv':'Test')+' · kasus '+(caseIndex+1)+' av '+cases().length,q.title);
  const layout=h('div','wound13-case-layout'),left=h('section','wound13-case-media'),right=h('section','wound13-case-panel');
  left.append(picture(q));
  const context=h('div','wound13-context'),obs=h('details','wound12-observations');
  const evidence=h('section','wound-case-evidence');evidence.append(h('h5','','Dette viser illustrasjonen'));const visible=h('ul');q.imageFindings.forEach(x=>visible.append(h('li','',x)));evidence.append(visible);left.append(evidence);
  context.append(h('span','wound13-eyebrow',q.subtitle),h('h4','','Opplysninger fra det fiktive kasuset'),h('p','',q.summary));
  obs.append(h('summary','','Se oppsummering av observasjonene'));
  const ol=h('ul');q.observations.forEach(x=>ol.append(h('li','',x)));obs.append(ol);
  context.append(obs);left.append(context);
  const tabs=h('nav','wound13-tabs');tabs.setAttribute('aria-label','TIMES kasusinnhold');
  for(const [key,label] of [['analyse','Analyse'],['times','T-I-M-E-S'],['tiltak','Videre vurdering'],['fasit','Fasit']]){
   const locked=key==='fasit'&&!submitted;
   const btn=b(label,'wound13-tab'+(view===key?' active':''),()=>{view=key;render()});
   btn.disabled=locked;btn.setAttribute('aria-current',view===key?'page':'false');
   if(locked)btn.title=mode==='test'?'Fasit etter hele testen':'Fasit etter innlevering';
   tabs.append(btn);
  }
  right.append(tabs);
  const article=h('div','wound13-pane');
  if(view==='analyse'){
    article.append(h('span','wound13-eyebrow','Kasus '+(caseIndex+1)+' / '+cases().length),h('h4','','Vurder T-I-M-E-S'),h('p','wound13-help','Vurder alle fem områdene. Velg det alternativet som passer best til kasusbeskrivelsen. Et sårfoto alene kan aldri avgjøre alle funnene.'));
    const fields=h('div','wound13-questions');
    for(const part of D.parts){
      const field=h('label','wound13-question'),top=h('span','wound13-question-head'),copy=h('span','wound13-question-label');
      top.append(h('span','wound13-letter wound13-letter-'+part.letter,part.letter));
      copy.append(h('strong','',part.title),h('small','',part.prompt));top.append(copy);field.append(top);
      const sel=h('select','wound13-select');sel.setAttribute('aria-label',part.letter+' – '+part.title);sel.disabled=Boolean(submitted);
      const blank=h('option','','Velg et alternativ …');blank.value='';sel.append(blank);
      for(const [val,label] of part.options){const opt=h('option','',label);opt.value=val;sel.append(opt)}
      sel.value=a[part.id]||'';
      sel.addEventListener('change',()=>{answers[q.id]={...(answers[q.id]||{}),[part.id]:sel.value};const status=document.getElementById('wound12Status');if(status)status.textContent=''});
      field.append(sel);
      if(submitted){field.append(h('p','wound13-feedback', (submitted.match[part.id]?'✓ Riktig. ':'○ Se fasit. ')+D.optionLabel(part.id,submitted.truth[part.id])+'. '+q.why[part.id]))}
      fields.append(field);
    }
    article.append(fields);
  }else if(view==='times'){
    article.append(h('h4','','Fem områder i TIMES'),h('p','wound13-help','Bruk disse som huskeliste for observasjoner. Dette er ikke fasiten for kasuset.'));
    const ul=h('div','wound13-explain');
    const descriptions={
      T:'Beskriv sårbunnen: granulasjon, fibrin/slough, epitel eller nekrotisk vev.',
      I:'Kartlegg smerteendring, rødhet, varme, hevelse, lukt, sårvæske og allmenntilstand.',
      M:'Vurder sårvæske i bandasje og klinikk; mengde kan ikke fastslås fra bilde alene.',
      E:'Se etter fremgang, epitelisering og fortykkede kanter. Underminering krever undersøkelse.',
      S:'Vurder hudens tilstand rundt såret: macerasjon, rødhet, ødem, skjørhet og hard hud.'
    };
    for(const part of D.parts){const x=h('div','wound13-explain-row');x.append(h('span','wound13-letter',part.letter),h('p','',descriptions[part.letter]));ul.append(x)}
    article.append(ul);
  }else if(view==='tiltak'){
    article.append(h('h4','','Hva må vurderes videre?'),h('p','wound13-help','TIMES er ikke en behandlingsordinasjon. Sårtype, sirkulasjon, trykk, smerter, allmenntilstand og utvikling over tid må inngå før tiltak vurderes.'));
    const ul=h('ul','wound13-next');
    for(const x of ['Dokumenter størrelse, varighet, endring og relevante observasjoner etter lokale rutiner.','Avklar sårårsak, perfusjon og eventuelle risikofaktorer i klinisk sammenheng.','Ved forverring, økende smerter eller mulig infeksjon: løft problemstillingen til ansvarlig helsepersonell.','Planlegg videre vurdering og oppfølging etter lokale prosedyrer; ikke velg bandasje fra illustrasjonen alene.'])ul.append(h('li','',x));
    article.append(ul);
  }else{
    article.append(h('h4','','Fasit og begrunnelse'),h('p','wound13-score',submitted.score+' av '+submitted.max+' riktige'));
    for(const part of D.parts){const f=h('div','wound13-answer');f.append(h('strong','',(submitted.match[part.id]?'✓ ':'○ ')+part.letter+' · '+D.optionLabel(part.id,submitted.truth[part.id])),h('small','','Ditt svar: '+D.optionLabel(part.id,a[part.id])),h('p','',q.why[part.id]));article.append(f)}
  }
  right.append(article);
  const actions=h('div','wound12-actions wound13-actions');
  if(!submitted){
    const submit=b('Lever TIMES-vurdering →','learn12-primary',()=>{
      if(D.parts.some(p=>!(answers[q.id]||{})[p.id])){
       document.getElementById('wound12Status').textContent='Svar på alle fem TIMES-områdene før du leverer.';
       view='analyse';const missing=[...root.querySelectorAll('.wound13-select')].find(x=>!x.value);if(missing){missing.setAttribute('aria-invalid','true');missing.focus()}return;
      }
      grades[q.id]=D.grade(q.id,answers[q.id]);
      if(mode==='test'){if(caseIndex===cases().length-1){finished=true;render()}else{caseIndex++;view='analyse';render()}}
      else{view='fasit';render()}
    });
    actions.append(submit);
  }else{
    actions.append(h('strong','wound12-total',submitted.score+' / '+submitted.max+' riktige'));
    actions.append(b(caseIndex===cases().length-1?'Se oppsummering →':'Neste kasus →','learn12-primary',()=>{
      if(caseIndex===cases().length-1)finished=true;else caseIndex++;
      view='analyse';render();
    }));
  }
  right.append(actions);layout.append(left,right);root.append(layout);
 }
 function summary(){
  header('Fullført · '+(mode==='practice'?'Øv':'Test'),'Resultater og fasit');
  const list=cases(),total=list.reduce((sum,c)=>sum+(grades[c.id]?.score||0),0);
  root.append(h('p','wound12-score',total+' / '+(list.length*D.parts.length)+' riktige observasjonsvalg'));
  root.append(h('p','wound12-intro','Resultatet er pedagogisk tilbakemelding, ikke en kompetansevurdering eller klinisk godkjenning.'));
  list.forEach(q=>{
   const g=grades[q.id],card=h('article','wound12-report');card.append(h('h4','',q.title),h('strong','',g.score+' av 5 riktige'));
   const ul=h('ul');D.parts.forEach(p=>ul.append(h('li','',(g.match[p.id]?'✓ ':'○ ')+p.letter+': '+D.optionLabel(p.id,g.truth[p.id])+' · Ditt svar: '+D.optionLabel(p.id,answers[q.id][p.id])+' – '+q.why[p.id])));
   card.append(ul);root.append(card);
  });
  const actions=h('div','wound12-actions');actions.append(b('Prøv på nytt','learn12-secondary',()=>setMode(mode)),b(mode==='practice'?'Fortsett til test →':'Til oversikten','learn12-primary',()=>setMode(mode==='practice'?'test':'home')));root.append(actions);
 }
 function render(){
  root.replaceChildren();
  if(mode==='home')home();else if(mode==='learn')learn();else if(finished)summary();else caseView();
  const note=h('p','wound12-disclaimer','Medisinske undervisningsillustrasjoner av fiktive kasus – ikke pasientfoto. Infeksjon, sårårsak, fuktmengde og behandlingsbehov kan ikke avgjøres fra bilde alene. Følg lokale prosedyrer og klinisk vurdering.');
  const src=h('a','wound12-source','Les om TIMES hos Sykepleien ↗');src.href='https://sykepleien.no/forskning/2019/02/bruk-verktoyet-times-til-vurdere-sar-strukturert';src.target='_blank';src.rel='noopener noreferrer';
  const status=h('p','wound12-status');status.id='wound12Status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const sources=h('div','wound12-sources');sources.append(src);
  D.sources.forEach(source=>{const link=h('a','wound12-source',source.label+' ↗');link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';sources.append(link)});
  root.append(note,sources,status);
  window.KartleggLearningFlow.mount(root,{course:'TIMES',mode,current:mode==='learn'?lesson+1:caseIndex+1,total:mode==='learn'?D.lessons.length:cases().length,finished,onMode:setMode});
  if(view==='fasit'&&!finished){const feedback=root.querySelector('.wound13-pane');if(feedback)window.KartleggLearningFlow.feedback(feedback)}
 }
 window.KartleggWoundLearningUI=Object.freeze({open,get mode(){return mode},get illustrationStyle(){return 'clinical'},get caseIndex(){return caseIndex}});
})();