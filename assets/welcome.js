/* Kartlegg – kort velkomst første gang en innlogget bruker kommer til forsiden.
 * Husker bare at meldingen er lukket, på denne enheten.
 */
'use strict';
(()=>{
 const KEY='kartlegg.welcome.v1',note=document.getElementById('welcomeNote'),gate=window.KartleggGate;
 if(!note||!gate)return;
 let closed=false;
 try{closed=localStorage.getItem(KEY)==='1'}catch(_){}
 const show=()=>{note.hidden=closed||gate.state!=='member'};
 note.querySelector('[data-welcome-close]').addEventListener('click',()=>{closed=true;try{localStorage.setItem(KEY,'1')}catch(_){}show()});
 gate.onChange(show);show();
})();
