import {accountEnabled} from './config.mjs';
import {mountAccount} from './ui.mjs?v=epost1';
mountAccount({enabled:accountEnabled,loadBackend:()=>import('./firebase.mjs?v=gate1').then(m=>m.backend)});
