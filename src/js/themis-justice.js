// Animação monumental: Deusa da Justiça (Têmis / Iustitia) em gravura clássica
// Combina a escultura em alto-relevo (/img/themis.webp) com:
// - Halo clássico, arco orbital sutil e feixes de luz volumétrica atrás da cabeça e da balança
// - Varredura de iluminação chiaroscuro em tempo real sobre os traços da gravura
// - Brilho harmônico alternado nos dois pratos da balança e reflexo na espada
// - No mobile: flutuação autônoma suave, iluminação mais evidente e face posicionada acima do CTA

export function createThemisJustice(getWidth, getHeight) {
  const img = new Image();
  let loaded = false;
  img.onload = () => {
    loaded = true;
  };
  img.src = '/img/themis.webp';

  const buffer = document.createElement('canvas');
  const bctx = buffer.getContext('2d');

  // Coordenadas normalizadas (0..1) dos pontos nobres dentro de /img/themis.webp (620x726)
  const LANDMARKS = {
    head: { u: 0.455, v: 0.165 },
    chin: { u: 0.455, v: 0.242 },
    pivot: { u: 0.72, v: 0.235 },
    leftPan: { u: 0.615, v: 0.472 },
    rightPan: { u: 0.825, v: 0.472 },
    swordTop: { u: 0.188, v: 0.685 },
    swordBot: { u: 0.222, v: 0.965 },
  };

  const render = (ctx, time, parX, parY) => {
    const width = getWidth();
    const height = getHeight();
    const isMobile = width <= 960;

    // Respiração e flutuação autônoma (mais perceptível no celular onde não há mouse)
    const breathe = 1 + Math.sin(time * (isMobile ? 0.65 : 0.42)) * (isMobile ? 0.018 : 0.012);
    const autoFloatX = isMobile ? Math.cos(time * 0.55) * 4.5 : 0;
    const autoFloatY = isMobile ? Math.sin(time * 0.75) * 6.5 : 0;

    const drawH = (isMobile ? Math.min(height * 0.76, width * 1.15) : height * 0.94) * breathe;
    const drawW = drawH * (620 / 726);

    const centerX =
      width * (isMobile ? 0.55 : 0.46) +
      (isMobile ? parX * 0.15 + autoFloatX : parX * 0.65);
    const x0 = centerX - drawW * 0.5;

    let y0 = height * 0.54 - drawH * 0.5 + parY * 0.35;
    if (isMobile) {
      const heroEl = document.querySelector('.hero');
      const ctaEl = document.querySelector('.hero__cta');
      if (heroEl && ctaEl) {
        const heroRect = heroEl.getBoundingClientRect();
        const ctaRect = ctaEl.getBoundingClientRect();
        const ctaTop = ctaRect.top - heroRect.top;
        const desiredY0 = ctaTop - 18 - drawH * LANDMARKS.chin.v + autoFloatY;
        y0 = Math.max(64, desiredY0);
      } else {
        y0 = 76 + autoFloatY;
      }
    }

    const headX = x0 + drawW * LANDMARKS.head.u;
    const headY = y0 + drawH * LANDMARKS.head.v;
    const pivotX = x0 + drawW * LANDMARKS.pivot.u;
    const pivotY = y0 + drawH * LANDMARKS.pivot.v;
    const leftPanX = x0 + drawW * LANDMARKS.leftPan.u;
    const leftPanY = y0 + drawH * LANDMARKS.leftPan.v;
    const rightPanX = x0 + drawW * LANDMARKS.rightPan.u;
    const rightPanY = y0 + drawH * LANDMARKS.rightPan.v;

    // 1. Luz volumétrica (feixes radiais emanando detrás de Têmis)
    ctx.save();
    const rayOriginX = (headX + pivotX) * 0.5;
    const rayOriginY = headY;
    const maxRayR = Math.max(width, height) * 0.78;

    const ambientHalo = ctx.createRadialGradient(
      rayOriginX,
      rayOriginY,
      10,
      rayOriginX,
      rayOriginY,
      maxRayR
    );
    const haloPulse = 0.5 + 0.5 * Math.sin(time * (isMobile ? 0.85 : 0.55));
    const haloPeak = isMobile ? 0.14 + haloPulse * 0.06 : 0.11 + haloPulse * 0.045;
    ambientHalo.addColorStop(0, `rgba(245, 239, 232, ${haloPeak.toFixed(3)})`);
    ambientHalo.addColorStop(0.42, `rgba(245, 239, 232, ${(haloPeak * 0.42).toFixed(3)})`);
    ambientHalo.addColorStop(1, 'rgba(245, 239, 232, 0)');
    ctx.fillStyle = ambientHalo;
    ctx.fillRect(0, 0, width, height);

    const rayCount = 8;
    const raySpeed = isMobile ? 0.055 : 0.028;
    ctx.translate(rayOriginX, rayOriginY);
    for (let i = 0; i < rayCount; i++) {
      const baseAngle = (i / rayCount) * Math.PI * 2 + time * raySpeed;
      const spread = 0.11 + 0.035 * Math.sin(time * 0.55 + i);
      const baseRayA = isMobile ? 0.042 : 0.028;
      const rAlpha = (baseRayA + 0.024 * Math.sin(time * 0.7 + i * 1.3)).toFixed(3);

      const rGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, maxRayR * 0.85);
      rGrad.addColorStop(0, `rgba(245, 239, 232, ${rAlpha})`);
      rGrad.addColorStop(0.65, `rgba(245, 239, 232, ${(Number(rAlpha) * 0.35).toFixed(3)})`);
      rGrad.addColorStop(1, 'rgba(245, 239, 232, 0)');

      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, maxRayR * 0.85, baseAngle - spread, baseAngle + spread);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 2. Auréola clássica + anel de luz orbital sutil atrás da cabeça e da balança
    ctx.save();
    const aureoleR = drawW * 0.22;
    const aurGrad = ctx.createRadialGradient(
      headX,
      headY,
      aureoleR * 0.6,
      headX,
      headY,
      aureoleR * 1.2
    );
    aurGrad.addColorStop(0, 'rgba(245, 239, 232, 0)');
    aurGrad.addColorStop(0.5, `rgba(245, 239, 232, ${(0.12 + haloPulse * 0.07).toFixed(3)})`);
    aurGrad.addColorStop(1, 'rgba(245, 239, 232, 0)');
    ctx.fillStyle = aurGrad;
    ctx.beginPath();
    ctx.arc(headX, headY, aureoleR * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Arco orbital fino girando suavemente atrás da cabeça para dar referência visual de movimento
    ctx.translate(headX, headY);
    ctx.rotate(time * (isMobile ? 0.18 : 0.1));
    ctx.strokeStyle = `rgba(245, 239, 232, ${(isMobile ? 0.16 + haloPulse * 0.08 : 0.11 + haloPulse * 0.05).toFixed(3)})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([48, 22, 12, 22]);
    ctx.beginPath();
    ctx.arc(0, 0, aureoleR * 0.94, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 3. Renderização da escultura de Têmis com varredura chiaroscuro viva
    if (loaded && bctx) {
      const bw = Math.max(1, Math.round(drawW));
      const bh = Math.max(1, Math.round(drawH));
      if (buffer.width !== bw || buffer.height !== bh) {
        buffer.width = bw;
        buffer.height = bh;
      }

      bctx.clearRect(0, 0, bw, bh);
      bctx.globalCompositeOperation = 'source-over';
      bctx.drawImage(img, 0, 0, bw, bh);

      bctx.globalCompositeOperation = 'source-in';

      const sweepSpeed = isMobile ? 0.62 : 0.38;
      const sweepX = bw * (0.5 + 0.42 * Math.sin(time * sweepSpeed));
      const sweepY = bh * (0.28 + 0.25 * Math.cos(time * (sweepSpeed * 0.78)));
      const lightGrad = bctx.createRadialGradient(
        sweepX,
        sweepY,
        bw * 0.03,
        bw * 0.5,
        bh * 0.42,
        Math.max(bw, bh) * 0.74
      );
      const peakA = ((isMobile ? 0.62 : 0.52) + haloPulse * 0.14).toFixed(3);
      const midA = ((isMobile ? 0.32 : 0.28) + haloPulse * 0.07).toFixed(3);
      lightGrad.addColorStop(0, `rgba(245, 239, 232, ${peakA})`);
      lightGrad.addColorStop(0.42, `rgba(245, 239, 232, ${midA})`);
      lightGrad.addColorStop(0.85, 'rgba(245, 239, 232, 0.14)');
      lightGrad.addColorStop(1, 'rgba(245, 239, 232, 0.04)');

      bctx.fillStyle = lightGrad;
      bctx.fillRect(0, 0, bw, bh);

      ctx.save();
      ctx.shadowColor = `rgba(245, 239, 232, ${(0.28 + haloPulse * 0.2).toFixed(3)})`;
      ctx.shadowBlur = (isMobile ? 20 : 18) + haloPulse * 16;
      ctx.drawImage(buffer, x0, y0, drawW, drawH);
      ctx.restore();
    }

    // 4. Brilho vivo de equilíbrio nos dois pratos da balança e no fiel
    const balanceWave = Math.sin(time * (isMobile ? 1.05 : 0.75));
    const baseGlow = isMobile ? 0.16 : 0.12;
    const ampGlow = isMobile ? 0.22 : 0.16;
    const leftGlowA = baseGlow + (0.5 + 0.5 * balanceWave) * ampGlow;
    const rightGlowA = baseGlow + (0.5 - 0.5 * balanceWave) * ampGlow;
    const panRadius = drawW * (isMobile ? 0.16 : 0.14);

    const drawSoftGlow = (gx, gy, r, alpha) => {
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
      g.addColorStop(0, `rgba(245, 239, 232, ${alpha.toFixed(3)})`);
      g.addColorStop(0.45, `rgba(245, 239, 232, ${(alpha * 0.4).toFixed(3)})`);
      g.addColorStop(1, 'rgba(245, 239, 232, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(gx, gy, r, 0, Math.PI * 2);
      ctx.fill();
    };

    drawSoftGlow(leftPanX, leftPanY, panRadius, leftGlowA);
    drawSoftGlow(rightPanX, rightPanY, panRadius, rightGlowA);
    drawSoftGlow(pivotX, pivotY, panRadius * 0.9, 0.14 + haloPulse * 0.1);

    // 5. Reflexo luminoso deslizando suavemente pela lâmina da espada
    const swordProg = (time * (isMobile ? 0.32 : 0.22)) % 1;
    const sx =
      x0 +
      drawW * (LANDMARKS.swordTop.u + (LANDMARKS.swordBot.u - LANDMARKS.swordTop.u) * swordProg);
    const sy =
      y0 +
      drawH * (LANDMARKS.swordTop.v + (LANDMARKS.swordBot.v - LANDMARKS.swordTop.v) * swordProg);
    const swordAlpha = Math.sin(swordProg * Math.PI) * (isMobile ? 0.3 : 0.22);
    drawSoftGlow(sx, sy, drawW * 0.1, swordAlpha);
  };

  return { render };
}
