import { initAccordions } from './accordion.js';
import { initWhatsApp } from './whatsapp.js';
import { initReveal, initHeader, initMenu, initMap } from './ui.js';
import { initScene } from './scene.js';

document.documentElement.classList.add('js');

initHeader();
initMenu();
initReveal();
initAccordions();
initWhatsApp();
initMap();

const year = document.getElementById('ano');
if (year) year.textContent = String(new Date().getFullYear());

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce) {
  initScene();
}
