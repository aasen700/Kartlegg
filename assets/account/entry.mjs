import {accountEnabled} from './config.mjs';
import {mountAccount} from './ui.mjs?v=home1';
mountAccount({enabled:accountEnabled,loadBackend:()=>import('./firebase.mjs?v=home1').then(m=>m.backend)});
