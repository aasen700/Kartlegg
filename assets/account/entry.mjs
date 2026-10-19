import {accountEnabled} from './config.mjs';
import {mountAccount} from './ui.mjs?v=profile2';
mountAccount({enabled:accountEnabled,loadBackend:()=>import('./firebase.mjs').then(m=>m.backend)});
