import { initAccordions } from './accordion.js';
import { initWhatsApp } from './whatsapp.js';
import { initReveal, initHeader, initMenu, initMap } from './ui.js';

document.documentElement.classList.add('js');

initHeader();
initMenu();
initReveal();
initAccordions();
initWhatsApp();
initMap();

const year = document.getElementById('ano');
if (year) year.textContent = String(new Date().getFullYear());

// Partículas (three.js) carregadas sob demanda para não bloquear o carregamento inicial.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowEnd = (navigator.hardwareConcurrency || 4) <= 2 || (navigator.deviceMemory || 4) <= 2;
if (!reduce && !lowEnd) {
  const start = () => import('./scene.js').then((m) => m.initScene()).catch(() => {});
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1500 });
  else setTimeout(start, 400);
}
