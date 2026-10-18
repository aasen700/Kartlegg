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
 check:'<path d="m5 12 4 4L19 6"/>'
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
const toolIcons=Object.freeze({news2:'heart',qsofa:'brain',gcs:'brain','4at':'brain',nrs:'heart','bmi-bsa':'calculator','resp-timer':'clock',mst:'document',tug:'clock','esas-r':'chart','ortho-bt':'heart',fast:'brain',skuv:'document',times:'wound',palliasjon:'heart',abcde:'assessment',abi:'heart','medication-lab':'calculator'});
const paint=(scope=document)=>{
 scope.querySelectorAll?.(':is(.nav,.mobile-primary-link)[data-page] .ico').forEach(icon=>replace(icon,navIcons[icon.closest('[data-page]').dataset.page]));
 scope.querySelectorAll?.('.section-symbol').forEach(icon=>replace(icon,symbolIcons[icon.textContent.trim()]||'spark'));
 scope.querySelectorAll?.('.score-icon').forEach(icon=>replace(icon,icon.closest('#qCard')?'brain':'chart'));
 scope.querySelectorAll?.('.about-v0993-card-icon').forEach(icon=>replace(icon,icon.textContent.includes('▣')?'document':'info'));
 scope.querySelectorAll?.('[data-icon]').forEach(button=>decorateButton(button,button.dataset.icon));
 scope.querySelectorAll?.('.dialog-close').forEach(button=>decorateButton(button,'close'));
 scope.querySelectorAll?.('.toolbox[data-tool-id] h3').forEach(heading=>{
  if(heading.dataset.uiActionIcon)return;
  heading.textContent=heading.textContent.replace(/^\s*[^\p{L}\p{N}]+\s*/u,'');
  decorateButton(heading,toolIcons[heading.closest('.toolbox').dataset.toolId]||'tools');
 });
 scope.querySelectorAll?.('button:not([data-ui-action-icon])').forEach(button=>{
  const glyph=(button.textContent.trim().match(/^[＋+↻▦▣◷☰×✓←→]/u)||[])[0];
  if(glyph)decorateButton(button,glyphActions[glyph]);
 });
};
paint();
new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{
 if(node.nodeType===1){paint(node);if(node.matches?.('.section-symbol,.score-icon,.about-v0993-card-icon,.dialog-close,[data-icon],button'))paint(node.parentElement)}
}))).observe(document.body,{childList:true,subtree:true});
window.KartleggIconSystem=Object.freeze({names:Object.keys(paths),navigation:Object.keys(navIcons),refresh:paint});
})();
