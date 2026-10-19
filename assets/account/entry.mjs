import {accountEnabled} from './config.mjs';
import {mountAccount} from './ui.mjs';
mountAccount({enabled:accountEnabled,loadBackend:()=>import('./firebase.mjs').then(m=>m.backend)});
