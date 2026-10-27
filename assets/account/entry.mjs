import {accountEnabled} from './config.mjs';
import {mountAccount} from './ui.mjs?v=ai1';
mountAccount({enabled:accountEnabled,loadBackend:()=>import('./firebase.mjs?v=ai1').then(m=>m.backend)});
