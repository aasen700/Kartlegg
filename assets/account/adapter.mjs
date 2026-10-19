import {settings} from './model.mjs';
// Explicit existing-owner adapters; there is deliberately no general storage export.
export function readSettings(){return settings({profile:window.KartleggSenderProfile.read(),favorites:window.KartleggToolNavigation.favorites,appearance:window.KartleggThemeLayers.preferences})}
export function applySettings(value){
 const s=settings(value);
 window.KartleggSenderProfile.apply(s.profile);
 window.KartleggPersonalModes?.applyProfile();
 window.KartleggThemeFinale?.applyProfile();
 window.KartleggToolNavigation.applyFavorites(s.favorites);
 window.KartleggThemeLayers.apply(s.appearance);
}
