/* One decorative line-icon language for navigation, section headers and score headings. */
'use strict';
(()=>{
const paths=Object.freeze({
 assessment:'<path d="M12 3v18M3 12h18"/><path d="M7 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/>',
 history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
 tools:'<path d="M9 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-4-4h-3"/><path d="M9 3h6v4H9zM8 12h8M8 16h5"/>',
 learn:'<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22Z"/><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22Z"/>',
 simulation:'<path d="M12 3 3.8 7.5 12 12l8.2-4.5Z"/><path d="m3.8 12 8.2 4.5 8.2-4.5M3.8 16.5 12 21l8.2-4.5"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 10v7M12 7h.01"/>',
 profile:'<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
 chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 trend:'<path d="m4 16 5-5 4 3 7-8"/><path d="M15 6h5v5"/>',
 document:'<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
 spark:'<path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z"/>',
 heart:'<path d="M20.8 5.7a5.5 5.5 0 0 0-7.8 0L12 6.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/>',
 brain:'<path d="M9.5 4.5A3 3 0 0 0 4 6a3 3 0 0 0-.2 5.7A3.5 3.5 0 0 0 7 17h2.5ZM14.5 4.5A3 3 0 0 1 20 6a3 3 0 0 1 .2 5.7A3.5 3.5 0 0 1 17 17h-2.5Z"/><path d="M9.5 4.5V20M14.5 4.5V20M7 9h2.5M14.5 12H18"/>',
 wound:'<path d="M12 3c3 4 6 6.7 6 10a6 6 0 0 1-12 0c0-3.3 3-6 6-10Z"/><path d="M9 14c.7 1.3 1.7 2 3 2"/>',
 calculator:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8v3H8zM8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 reset:'<path d="M4 4v6h6"/><path d="M5.5 15a7 7 0 1 0 .8-7.8L4 10"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 arrowRight:'<path d="M5 12h14M14 7l5 5-5 5"/>',
 arrowLeft:'<path d="M19 12H5M10 7l-5 5 5 5"/>',
 close:'<path d="M6 6l12 12M18 6 6 18"/>',
 copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 vitals:'<path d="M2.5 12.5h4l2.4-6.5 4.4 13 2.7-8 1.4 1.5h4.1"/>',
 infection:'<circle cx="12" cy="12" r="4.5"/><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3M6 6l2.1 2.1M15.9 15.9 18 18M6 18l2.1-2.1M15.9 8.1 18 6"/><path d="M10.6 11h.01M13.2 13.2h.01"/>',
 eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
 cognition:'<path d="M9.5 4.5A3 3 0 0 0 4 6a3 3 0 0 0-.2 5.7A3.5 3.5 0 0 0 7 17h2.5ZM14.5 4.5A3 3 0 0 1 20 6a3 3 0 0 1 .2 5.7A3.5 3.5 0 0 1 17 17h-2.5Z"/><path d="M9.5 4.5V20M14.5 4.5V20M7 9h2.5M14.5 12H18"/>',
 gauge:'<path d="M3.5 17.5a8.5 8.5 0 1 1 17 0"/><path d="m12 17.5 4.2-4.8"/><circle cx="12" cy="17.5" r="1.3"/><path d="M6.3 11.8 7.6 13M12 7.5V9M17.7 11.8 16.4 13"/>',
 scale:'<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8 10.5a4 4 0 0 1 8 0"/><path d="m12 10.5 1.6-2.3"/>',
 stopwatch:'<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.5M10 2.5h4M12 2.5V6M18.2 7.3l1.6-1.6"/>',
 nutrition:'<path d="M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3"/><path d="M17.5 21V3c-2.3 1.3-3.6 4-3.6 7.2V13h3.6"/>',
 walk:'<circle cx="13.2" cy="4" r="2"/><path d="m9.3 21.5 2.6-6.6 3 3v3.6"/><path d="m11.9 14.9 1.1-6.7 3.1 3.6 3 1"/><path d="M13 8.2 9 10.3 7.6 14.4"/>',
 sliders:'<path d="M4 6h9.5M18.5 6H20M4 12h3.5M12.5 12H20M4 18h11.5"/><circle cx="16" cy="6" r="2.3"/><circle cx="10" cy="12" r="2.3"/><circle cx="18" cy="18" r="2.3"/>',
 pressure:'<circle cx="9.5" cy="13" r="6.5"/><path d="m9.5 13 2.9-2.9"/><path d="M19.5 4v16M17.2 6.3 19.5 4l2.3 2.3M17.2 17.7l2.3 2.3 2.3-2.3"/>',
 face:'<circle cx="12" cy="12" r="9"/><path d="M9 9.5h.01M15 9.5h.01"/><path d="M8.3 15.2c1.1.9 2.4 1.4 3.7 1.4 1 0 1.9-.3 2.6-.7"/><path d="M16.6 14.6l.9-.9"/>',
 stethoscope:'<path d="M5 3H4v5a5 5 0 0 0 10 0V3h-1"/><path d="M9 13v1.5a5.5 5.5 0 0 0 11 0V12"/><circle cx="20" cy="10" r="2"/>',
 bandage:'<rect x="2.6" y="8.2" width="18.8" height="7.6" rx="3.8" transform="rotate(-45 12 12)"/><path d="M10.6 10.6h.01M13.4 13.4h.01M10.6 13.4h.01M13.4 10.6h.01"/><path d="m8.2 12.3 3.5 3.5M12.3 8.2l3.5 3.5"/>',
 care:'<path d="M12 13.5c-2-1.4-4.5-3-4.5-5.2 0-2.4 3-3.3 4.5-1.3 1.5-2 4.5-1.1 4.5 1.3 0 2.2-2.5 3.8-4.5 5.2Z"/><path d="m3 14.5 3.8 4c.9 1 2.1 1.5 3.4 1.5h3.6c1.3 0 2.5-.5 3.4-1.5l3.8-4"/>',
 checklist:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2.5h6V4"/><path d="m8.5 10 1.5 1.5 3-3M8.5 15.5h7"/>',
 doppler:'<path d="M8 3v10.5c0 1.6-1.2 3-2.6 4-1 .7-.6 2.5.9 2.5H14c1.4 0 2.4-.9 2.4-2.1 0-.9-.5-1.6-1.5-2L12.5 15V3"/><path d="M17.2 6.8a3 3 0 0 1 0 4.2M19.6 4.6a6.2 6.2 0 0 1 0 8.6"/>',
 syringe:'<path d="m17.5 2.5 4 4M19.5 4.5l-3 3"/><path d="M17.5 8.5 8 18l-2-2 9.5-9.5"/><path d="m6 18-3.5 3.5M9.5 12.5l1.5 1.5M12.5 9.5l1.5 1.5"/><path d="m14 5 5 5"/>',
 star:'<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z"/>',
 link:'<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.3 1.3"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.3-1.3"/>'
});
const svg=name=>`<svg class="ui-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]||paths.spark}</svg>`;
const navIcons={vurdering:'assessment',historikk:'history',verktoy:'tools',laer:'learn',simulering:'simulation',om:'info',profil:'profile'};
const symbolIcons={'▤':'tools','▥':'chart','◷':'history','↗':'trend','✦':'learn','◈':'brain','▦':'calculator','✧':'spark','♙':'profile','▣':'document','i':'info'};
const replace=(icon,name)=>{
 if(icon.dataset.uiIcon)return;
 icon.innerHTML=svg(name);icon.dataset.uiIcon=name;icon.setAttribute('aria-hidden','true');
};
const stripLegacy=el=>{
 for(const node of [...el.childNodes]){
  if(node.nodeType!==Node.TEXT_NODE)continue;
  node.textContent=node.textContent.replace(/^\s*[＋+↻▦▣◷☰×✓←→]\s*(?:&nbsp;)?\s*/u,'');
 }
};
const decorateButton=(button,name)=>{
 if(!name||button.dataset.uiActionIcon)return;
 stripLegacy(button);
 button.insertAdjacentHTML('afterbegin',svg(name));
 button.dataset.uiActionIcon=name;
};
const glyphActions=Object.freeze({'＋':'plus','+':'plus','↻':'reset','▦':'calculator','▣':'document','◷':'clock','☰':'menu','×':'close','✓':'check','←':'arrowLeft','→':'arrowRight'});
// Ett eget ikon per verktøy, brukt av verktøykortene (assets/tool-cards.js).
const learnIcons=Object.freeze({gcs:'eye',four:'cognition',news:'vitals',medication:'syringe',times:'bandage'});
const toolIcons=Object.freeze({news2:'vitals',qsofa:'infection',gcs:'eye','4at':'cognition',nrs:'gauge','bmi-bsa':'scale','resp-timer':'stopwatch',mst:'nutrition',tug:'walk','esas-r':'sliders','ortho-bt':'pressure',fast:'face',skuv:'stethoscope',times:'bandage',palliasjon:'care',abcde:'checklist',abi:'doppler','medication-lab':'syringe'});
const paint=(scope=document)=>{
 scope.querySelectorAll?.(':is(.nav,.mobile-primary-link)[data-page] .ico').forEach(icon=>replace(icon,navIcons[icon.closest('[data-page]').dataset.page]));
 scope.querySelectorAll?.('.section-symbol').forEach(icon=>replace(icon,symbolIcons[icon.textContent.trim()]||'spark'));
 scope.querySelectorAll?.('.score-icon').forEach(icon=>replace(icon,icon.closest('#qCard')?'brain':'chart'));
 scope.querySelectorAll?.('.learn12-course-card[data-learn-tool] .learn12-course-symbol').forEach(icon=>replace(icon,learnIcons[icon.closest('[data-learn-tool]').dataset.learnTool]||'learn'));
 scope.querySelectorAll?.('.about-v0993-card-icon').forEach(icon=>replace(icon,icon.textContent.includes('▣')?'document':'info'));
 scope.querySelectorAll?.('[data-icon]').forEach(button=>decorateButton(button,button.dataset.icon));
 scope.querySelectorAll?.('.dialog-close').forEach(button=>decorateButton(button,'close'));
 scope.querySelectorAll?.('button:not([data-ui-action-icon])').forEach(button=>{
  const glyph=(button.textContent.trim().match(/^[＋+↻▦▣◷☰×✓←→]/u)||[])[0];
  if(glyph)decorateButton(button,glyphActions[glyph]);
 });
};
paint();
new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{
 if(node.nodeType===1){paint(node);if(node.matches?.('.learn12-course-symbol,.section-symbol,.score-icon,.about-v0993-card-icon,.dialog-close,[data-icon],button'))paint(node.parentElement)}
}))).observe(document.body,{childList:true,subtree:true});
window.KartleggIconSystem=Object.freeze({names:Object.keys(paths),navigation:Object.keys(navIcons),refresh:paint,svg,toolIcon:id=>toolIcons[id]||'tools'});
})();
