import {accountEnabled} from './config.mjs';
import {mountAccount} from './ui.mjs?v=raskt1';
mountAccount({enabled:accountEnabled,loadBackend:()=>import('./firebase.mjs?v=raskt1').then(m=>m.backend)});
