import { initAccordions } from './accordion.js';
import { initWhatsApp } from './whatsapp.js';
import { initPreloader, initReveal, initHeader, initMenu, initMap, initCardEffects } from './ui.js';
import { initScene } from './scene.js';

document.documentElement.classList.add('js');

initPreloader();
initHeader();
initMenu();
initReveal();
initCardEffects();
initAccordions();
initWhatsApp();
initMap();

const year = document.getElementById('ano');
if (year) year.textContent = String(new Date().getFullYear());

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce) {
  initScene();
}
