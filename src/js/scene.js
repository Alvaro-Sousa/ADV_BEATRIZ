// Partículas sutis (three.js): campo de pontos dourados e merlot em deriva lenta,
// com leve parallax de mouse e rolagem. Canvas único e fixo, atrás do conteúdo.
import {
  WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, Float32BufferAttribute,
  PointsMaterial, Points, CanvasTexture, Color, AdditiveBlending,
} from 'three';

function makeSprite() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,.35)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

export function initScene() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  } catch (e) {
    return; // sem WebGL: o fundo CSS permanece
  }

  const mobile = window.innerWidth < 760;
  const COUNT = mobile ? 180 : 420;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 14;

  const geo = new BufferGeometry();
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const speed = new Float32Array(COUNT);
  const gold = new Color('#d9c29a');
  const wine = new Color('#b04560');
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 34;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
    const c = Math.random() < 0.7 ? gold : wine;
    col.set([c.r, c.g, c.b], i * 3);
    speed[i] = 0.15 + Math.random() * 0.35;
  }
  geo.setAttribute('position', new Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new Float32BufferAttribute(col, 3));

  const sprite = makeSprite();
  const mat = new PointsMaterial({
    size: mobile ? 0.32 : 0.26, map: sprite, vertexColors: true, transparent: true,
    opacity: 0.75, depthWrite: false, blending: AdditiveBlending, sizeAttenuation: true,
  });
  const points = new Points(geo, mat);
  scene.add(points);

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let mx = 0, my = 0, scrollY = 0;
  window.addEventListener('pointermove', (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
  const onScroll = () => {
    scrollY = window.scrollY;
    // Mais presente no topo (hero) e discreta no resto da página
    const fade = Math.max(0.35, 1 - scrollY / (window.innerHeight * 1.1));
    canvas.style.opacity = String(fade);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  let running = true;
  let visible = true;
  let last = performance.now();
  let raf = 0;

  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const arr = geo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] += speed[i] * dt;
      arr[i * 3] += Math.sin(now * 0.0002 + i) * 0.004;
      if (arr[i * 3 + 1] > 11) arr[i * 3 + 1] = -11;
    }
    geo.attributes.position.needsUpdate = true;
    points.rotation.y += (mx * 0.12 - points.rotation.y) * 0.03;
    points.rotation.x += (my * 0.06 - points.rotation.x) * 0.03;
    camera.position.y += (-scrollY * 0.0025 - camera.position.y) * 0.06;
    renderer.render(scene, camera);
  };

  const setRunning = (v) => {
    if (v && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(tick); }
    else if (!v && running) { running = false; cancelAnimationFrame(raf); }
  };

  document.addEventListener('visibilitychange', () => setRunning(!document.hidden && visible));
  if ('IntersectionObserver' in window) {
    // O canvas é fixo, então observa o <main>: pausa se a página sair de vista.
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; setRunning(visible && !document.hidden); })
      .observe(document.querySelector('main'));
  }

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); setRunning(false); });
  raf = requestAnimationFrame(tick);
}
