// Laboratório de animações para o Hero — Fase 5 (Zero linhas e zero pontos: volumes, luz de janela e tipografia escultural)
// 1. Dunas de Veludo: camadas preenchidas em relevo (paper-cut / tecido fluido) com luz de crista
// 2. Luz de Janela Clássica: projeção cinematográfica de luz e sombra (efeito cortina/veneziana de gabinete)
// 3. Mural Tipográfico (§): símbolos clássicos do Direito em Cormorant Garamond gigante flutuando em relevo
// 4. Marca-d'água BF (Salva): preservada em ./monogram-bf.js
// 5. Fluxo de Seda (Salvo): preservado em ./silk-flow.js
import { createSilkFlow } from './silk-flow.js';
import { createMonogramBF } from './monogram-bf.js';
import { createThemisJustice } from './themis-justice.js';

export function initScene() {
  const canvas = document.getElementById('hero-canvas');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const MODES = [
    { id: 'themis', label: '1 · Deusa da Justiça (Têmis)' },
    { id: 'monogram', label: '2 · Marca-d’água BF (Salva)' },
    { id: 'silk', label: '3 · Fluxo de Seda (Salvo)' },
    { id: 'dunes', label: '4 · Dunas de Veludo' },
    { id: 'window', label: '5 · Luz de Janela Clássica' },
  ];

  let currentMode = 'themis';
  const showLab = new URLSearchParams(window.location.search).has('lab');
  if (showLab) {
    const saved = localStorage.getItem('hero_scene_mode');
    if (MODES.some((m) => m.id === saved)) currentMode = saved;
  }

  let width = 0;
  let height = 0;
  let dpr = 1;

  const silkFlow = createSilkFlow(() => width, () => height);
  const monogramBF = createMonogramBF(() => width, () => height);
  const themisJustice = createThemisJustice(() => width, () => height);

  let glyphs = [];

  const buildAll = () => {
    silkFlow.init();
    const mobile = width < 760;

    // Símbolos tipográficos clássicos em múltiplas camadas de profundidade (Modo 3)
    const symbols = ['§', 'I', '§', 'II', 'III', '§', 'IV', 'V'];
    glyphs = Array.from({ length: mobile ? 5 : 8 }, (_, i) => ({
      char: symbols[i % symbols.length],
      xRatio: 0.08 + ((i * 0.37) % 0.84),
      yRatio: 0.18 + ((i * 0.29) % 0.72),
      size: (mobile ? 150 : 240) + (i % 3) * (mobile ? 55 : 95),
      depth: 0.35 + (i % 3) * 0.35,
      speedX: (0.18 + (i % 3) * 0.06) * (i % 2 === 0 ? 1 : -1),
      speedY: 0.14 + (i % 4) * 0.05,
      phase: i * 1.4,
      italic: i % 2 === 0,
    }));
  };

  const resize = () => {
    const rect = hero.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildAll();
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });

  let mx = 0;
  let my = 0;
  let smx = 0;
  let smy = 0;
  let scrollY = window.scrollY;
  let sScrollY = scrollY;

  window.addEventListener('pointermove', (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  // ============================================================================
  // MODO 1: DUNAS DE VELUDO (Massas sólidas em camadas fluidas, zero linhas/pontos)
  // ============================================================================
  const renderVelvetDunes = (time, parX, parY) => {
    // Luz atmosférica quente no topo
    const topGlow = ctx.createRadialGradient(
      width * 0.65 + parX * 0.3,
      height * 0.22 + parY * 0.15,
      10,
      width * 0.65,
      height * 0.22,
      Math.max(width, height) * 0.75
    );
    topGlow.addColorStop(0, 'rgba(245, 239, 232, 0.14)');
    topGlow.addColorStop(0.5, 'rgba(138, 38, 20, 0.18)');
    topGlow.addColorStop(1, 'rgba(59, 14, 6, 0)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, width, height);

    // 5 camadas preenchidas que se movem como dobras de veludo/seda iluminadas
    const layers = [
      { yBase: 0.28, amp1: 52, amp2: 28, freq1: 2.2, speed: 0.38, par: 0.25, lightA: 0.11, darkA: 0.25 },
      { yBase: 0.43, amp1: 60, amp2: 32, freq1: 2.6, speed: -0.32, par: 0.45, lightA: 0.13, darkA: 0.34 },
      { yBase: 0.58, amp1: 54, amp2: 30, freq1: 2.0, speed: 0.44, par: 0.65, lightA: 0.15, darkA: 0.42 },
      { yBase: 0.73, amp1: 46, amp2: 24, freq1: 2.9, speed: -0.36, par: 0.85, lightA: 0.16, darkA: 0.52 },
      { yBase: 0.87, amp1: 38, amp2: 20, freq1: 2.4, speed: 0.3, par: 1.05, lightA: 0.14, darkA: 0.65 },
    ];

    const steps = 40;
    layers.forEach((ly, idx) => {
      const baseY = height * ly.yBase + parY * ly.par * 0.4;
      ctx.beginPath();
      for (let s = 0; s <= steps; s++) {
        const u = s / steps;
        const x = u * width;
        const shift = parX * ly.par * 0.015;
        const y =
          baseY +
          Math.sin(u * ly.freq1 + time * ly.speed + idx * 1.1 + shift) * ly.amp1 +
          Math.cos(u * (ly.freq1 * 1.6) - time * (ly.speed * 0.7) + idx) * ly.amp2;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height + 60);
      ctx.lineTo(0, height + 60);
      ctx.closePath();

      // Gradiente volumétrico da crista iluminada em #F5EFE8 até a sombra profunda #3b0e06
      const grad = ctx.createLinearGradient(0, baseY - ly.amp1, 0, height);
      grad.addColorStop(0, `rgba(245, 239, 232, ${ly.lightA})`);
      grad.addColorStop(0.18, `rgba(124, 35, 18, ${(ly.lightA * 1.4).toFixed(3)})`);
      grad.addColorStop(0.65, `rgba(59, 14, 6, ${ly.darkA})`);
      grad.addColorStop(1, `rgba(42, 8, 3, ${(ly.darkA * 1.15).toFixed(3)})`);

      ctx.fillStyle = grad;
      ctx.fill();
    });
  };

  // ============================================================================
  // MODO 2: LUZ DE JANELA CLÁSSICA (Chiaroscuro de persiana/cortina ao vento)
  // ============================================================================
  const renderWindowLight = (time, parX, parY) => {
    ctx.save();

    // Fonte de luz principal vinda do alto à direita/centro
    const sunX = width * 0.78 + Math.sin(time * 0.25) * 40 + parX * 0.4;
    const sunY = height * 0.12 + Math.cos(time * 0.2) * 25 + parY * 0.2;
    const sunR = Math.max(width, height) * 0.9;

    const baseGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
    baseGlow.addColorStop(0, 'rgba(245, 239, 232, 0.20)');
    baseGlow.addColorStop(0.45, 'rgba(245, 239, 232, 0.07)');
    baseGlow.addColorStop(1, 'rgba(59, 14, 6, 0)');
    ctx.fillStyle = baseGlow;
    ctx.fillRect(0, 0, width, height);

    // Projeção de janelas arqueadas / frestas de luz que balançam suavemente como cortina
    const paneCount = width < 760 ? 4 : 6;
    const slant = height * 0.55;

    for (let i = 0; i < paneCount; i++) {
      const ratio = (i + 0.5) / paneCount;
      // Movimento de brisa suave nas faixas de luz
      const breeze =
        Math.sin(time * 0.45 + i * 0.85) * (width * 0.038) +
        Math.cos(time * 0.28 - i * 0.5) * (width * 0.018);

      const topX = ratio * width * 1.15 + breeze + parX * (0.4 + i * 0.08);
      const botX = topX - slant + parY * 0.35;
      const beamW = (width / paneCount) * (0.52 + 0.14 * Math.sin(time * 0.35 + i));

      const grad = ctx.createLinearGradient(topX - beamW * 0.5, 0, topX + beamW * 0.5, height * 0.35);
      const intensity = 0.09 + 0.045 * Math.sin(time * 0.4 + i * 1.1);
      grad.addColorStop(0, 'rgba(245, 239, 232, 0)');
      grad.addColorStop(0.3, `rgba(245, 239, 232, ${(intensity * 0.6).toFixed(3)})`);
      grad.addColorStop(0.5, `rgba(245, 239, 232, ${intensity.toFixed(3)})`);
      grad.addColorStop(0.7, `rgba(245, 239, 232, ${(intensity * 0.6).toFixed(3)})`);
      grad.addColorStop(1, 'rgba(245, 239, 232, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(topX - beamW * 0.45, -30);
      ctx.lineTo(topX + beamW * 0.45, -30);
      ctx.lineTo(botX + beamW * 0.85, height + 30);
      ctx.lineTo(botX - beamW * 0.85, height + 30);
      ctx.closePath();
      ctx.fill();
    }

    // Sombra suave de travessas horizontais da janela (chiaroscuro difuso)
    for (let m = 1; m <= 2; m++) {
      const myPos = height * (m * 0.36) + Math.sin(time * 0.3 + m) * 18 + parY * 0.3;
      const sGrad = ctx.createLinearGradient(0, myPos - 55, 0, myPos + 55);
      sGrad.addColorStop(0, 'rgba(59, 14, 6, 0)');
      sGrad.addColorStop(0.5, 'rgba(42, 8, 3, 0.42)');
      sGrad.addColorStop(1, 'rgba(59, 14, 6, 0)');
      ctx.fillStyle = sGrad;
      ctx.fillRect(0, myPos - 55, width, 110);
    }

    ctx.restore();
  };

  // ============================================================================
  // MODO 3: MURAL TIPOGRÁFICO JURÍDICO (§ e Algarismos Romanos em relevo)
  // ============================================================================
  const renderLegalMural = (time, parX, parY) => {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Halo ambiente central
    const hg = ctx.createRadialGradient(
      width * 0.5 + parX * 0.3,
      height * 0.5 + parY * 0.2,
      0,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.65
    );
    hg.addColorStop(0, 'rgba(245, 239, 232, 0.08)');
    hg.addColorStop(1, 'rgba(245, 239, 232, 0)');
    ctx.fillStyle = hg;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < glyphs.length; i++) {
      const g = glyphs[i];
      const floatX = Math.sin(time * g.speedX + g.phase) * 28;
      const floatY = Math.cos(time * g.speedY + g.phase) * 24;
      const x = g.xRatio * width + floatX + parX * g.depth;
      const y = g.yRatio * height + floatY + parY * g.depth * 0.6;

      ctx.save();
      ctx.translate(x, y);
      const rot = Math.sin(time * 0.18 + g.phase) * 0.05;
      ctx.rotate(rot);

      ctx.font = `${g.italic ? 'italic ' : ''}600 ${g.size}px "Cormorant Garamond", Georgia, serif`;

      // Gradiente de relevo em cada caractere (iluminado no topo, fundindo no vinho na base)
      const pulse = 0.75 + 0.25 * Math.sin(time * 0.5 + g.phase);
      const topA = (0.11 * g.depth * pulse).toFixed(3);
      const midA = (0.045 * g.depth * pulse).toFixed(3);
      const tGrad = ctx.createLinearGradient(-g.size * 0.3, -g.size * 0.45, g.size * 0.3, g.size * 0.45);
      tGrad.addColorStop(0, `rgba(245, 239, 232, ${topA})`);
      tGrad.addColorStop(0.55, `rgba(245, 239, 232, ${midA})`);
      tGrad.addColorStop(1, 'rgba(245, 239, 232, 0.005)');

      ctx.fillStyle = tGrad;
      ctx.fillText(g.char, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  };

  // ============================================================================
  // SELETOR TEMPORÁRIO NA TELA (HERO LAB)
  // ============================================================================
  const mountPicker = () => {
    const existing = document.querySelector('.scene-picker');
    if (existing) existing.remove();

    const wrap = document.createElement('div');
    wrap.className = 'scene-picker';
    wrap.setAttribute('aria-label', 'Testar animação de fundo');

    const title = document.createElement('span');
    title.className = 'scene-picker__label';
    title.textContent = 'Testar fundo (Hero)';
    wrap.appendChild(title);

    const btnRow = document.createElement('div');
    btnRow.className = 'scene-picker__btns';

    MODES.forEach((m) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'scene-picker__btn' + (m.id === currentMode ? ' is-active' : '');
      btn.textContent = m.label;
      btn.addEventListener('click', () => {
        currentMode = m.id;
        try {
          localStorage.setItem('hero_scene_mode', m.id);
        } catch (_) {}
        btnRow.querySelectorAll('.scene-picker__btn').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
      btnRow.appendChild(btn);
    });

    wrap.appendChild(btnRow);
    document.body.appendChild(wrap);
  };

  if (showLab) mountPicker();

  let running = true;
  let visible = true;
  let last = performance.now();
  let raf = 0;

  const tick = (now) => {
    if (!running) return;
    raf = requestAnimationFrame(tick);

    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const time = now * 0.001;

    smx += (mx - smx) * 0.05;
    smy += (my - smy) * 0.05;
    sScrollY += (scrollY - sScrollY) * 0.1;

    const parX = smx * -18;
    const parY = smy * -14 + sScrollY * 0.24;

    ctx.clearRect(0, 0, width, height);

    if (currentMode === 'themis') themisJustice.render(ctx, time, parX, parY);
    else if (currentMode === 'monogram') monogramBF.render(ctx, time, parX, parY);
    else if (currentMode === 'silk') silkFlow.render(ctx, time, dt, parX, parY);
    else if (currentMode === 'dunes') renderVelvetDunes(time, parX, parY);
    else renderWindowLight(time, parX, parY);
  };

  const setRunning = (v) => {
    if (v && !running) {
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    } else if (!v && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  };

  document.addEventListener('visibilitychange', () => setRunning(!document.hidden && visible));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      setRunning(visible && !document.hidden);
    }).observe(hero);
  }

  raf = requestAnimationFrame(tick);
}
