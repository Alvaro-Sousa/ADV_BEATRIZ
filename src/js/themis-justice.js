// Animação monumental: Deusa da Justiça (Têmis / Iustitia) em gravura clássica
// Combina a escultura em alto-relevo (/img/themis.webp) com:
// - Halo clássico e feixes suaves de luz volumétrica atrás da cabeça e da balança
// - Varredura de iluminação chiaroscuro em tempo real sobre os traços da gravura
// - Brilho harmônico alternado nos dois pratos da balança e reflexo na espada
// - Centralização automática no mobile e paralaxe suave no desktop

export function createThemisJustice(getWidth, getHeight) {
  const img = new Image();
  let loaded = false;
  img.onload = () => {
    loaded = true;
  };
  img.src = '/img/themis.webp';

  // Canvas auxiliar para aplicar iluminação dinâmica (source-atop) apenas sobre os traços da estátua
  const buffer = document.createElement('canvas');
  const bctx = buffer.getContext('2d');

  // Coordenadas normalizadas (0..1) dos pontos nobres dentro de /img/themis.webp (620x726)
  const LANDMARKS = {
    head: { u: 0.455, v: 0.165 },
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

    // Centralizada no meio das telas mobile; posição monumental equilibrada no desktop
    const centerX = width * (isMobile ? 0.5 : 0.46) + (isMobile ? parX * 0.18 : parX * 0.65);
    const centerY = height * (isMobile ? 0.52 : 0.54) + (isMobile ? 0 : parY * 0.35);

    const breathe = 1 + Math.sin(time * 0.38) * 0.012;
    const drawH = (isMobile ? Math.min(height * 0.86, width * 1.18) : height * 0.94) * breathe;
    const drawW = drawH * (620 / 726);
    const x0 = centerX - drawW * 0.5;
    const y0 = centerY - drawH * 0.5;

    const headX = x0 + drawW * LANDMARKS.head.u;
    const headY = y0 + drawH * LANDMARKS.head.v;
    const pivotX = x0 + drawW * LANDMARKS.pivot.u;
    const pivotY = y0 + drawH * LANDMARKS.pivot.v;
    const leftPanX = x0 + drawW * LANDMARKS.leftPan.u;
    const leftPanY = y0 + drawH * LANDMARKS.leftPan.v;
    const rightPanX = x0 + drawW * LANDMARKS.rightPan.u;
    const rightPanY = y0 + drawH * LANDMARKS.rightPan.v;

    // 1. Luz volumétrica (feixes radiais suaves emanando detrás de Têmis)
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
    const haloPulse = 0.5 + 0.5 * Math.sin(time * 0.55);
    ambientHalo.addColorStop(0, `rgba(245, 239, 232, ${(0.11 + haloPulse * 0.045).toFixed(3)})`);
    ambientHalo.addColorStop(0.42, `rgba(245, 239, 232, ${(0.045 + haloPulse * 0.02).toFixed(3)})`);
    ambientHalo.addColorStop(1, 'rgba(245, 239, 232, 0)');
    ctx.fillStyle = ambientHalo;
    ctx.fillRect(0, 0, width, height);

    // Feixes cônicos sutis de glória/luz clássica girando muito lentamente
    const rayCount = 8;
    ctx.translate(rayOriginX, rayOriginY);
    for (let i = 0; i < rayCount; i++) {
      const baseAngle = (i / rayCount) * Math.PI * 2 + time * 0.025;
      const spread = 0.11 + 0.03 * Math.sin(time * 0.4 + i);
      const rAlpha = (0.028 + 0.018 * Math.sin(time * 0.5 + i * 1.3)).toFixed(3);

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

    // 2. Auréola clássica sutil atrás da cabeça e do fiel da balança
    ctx.save();
    const aureoleR = drawW * 0.22;
    const aurGrad = ctx.createRadialGradient(
      headX,
      headY,
      aureoleR * 0.65,
      headX,
      headY,
      aureoleR * 1.15
    );
    aurGrad.addColorStop(0, 'rgba(245, 239, 232, 0)');
    aurGrad.addColorStop(0.5, `rgba(245, 239, 232, ${(0.09 + haloPulse * 0.05).toFixed(3)})`);
    aurGrad.addColorStop(1, 'rgba(245, 239, 232, 0)');
    ctx.fillStyle = aurGrad;
    ctx.beginPath();
    ctx.arc(headX, headY, aureoleR * 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Renderização da escultura de Têmis com iluminação chiaroscuro viva
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

      // Máscara de iluminação móvel: destaca diferentes partes da gravura ao longo do tempo
      bctx.globalCompositeOperation = 'source-in';

      const sweepX = bw * (0.5 + 0.42 * Math.sin(time * 0.35));
      const sweepY = bh * (0.42 + 0.28 * Math.cos(time * 0.27));
      const lightGrad = bctx.createRadialGradient(
        sweepX,
        sweepY,
        bw * 0.04,
        bw * 0.5,
        bh * 0.48,
        Math.max(bw, bh) * 0.78
      );
      const peakA = (0.46 + haloPulse * 0.12).toFixed(3);
      const midA = (0.25 + haloPulse * 0.06).toFixed(3);
      const lowA = '0.13';
      lightGrad.addColorStop(0, `rgba(245, 239, 232, ${peakA})`);
      lightGrad.addColorStop(0.45, `rgba(245, 239, 232, ${midA})`);
      lightGrad.addColorStop(0.85, `rgba(245, 239, 232, ${lowA})`);
      lightGrad.addColorStop(1, 'rgba(245, 239, 232, 0.04)');

      bctx.fillStyle = lightGrad;
      bctx.fillRect(0, 0, bw, bh);

      ctx.save();
      ctx.shadowColor = `rgba(245, 239, 232, ${(0.22 + haloPulse * 0.16).toFixed(3)})`;
      ctx.shadowBlur = 18 + haloPulse * 14;
      ctx.drawImage(buffer, x0, y0, drawW, drawH);
      ctx.restore();
    }

    // 4. Brilho vivo de equilíbrio nos dois pratos da balança e no fiel
    const balanceWave = Math.sin(time * 0.75);
    const leftGlowA = 0.12 + (0.5 + 0.5 * balanceWave) * 0.16;
    const rightGlowA = 0.12 + (0.5 - 0.5 * balanceWave) * 0.16;
    const panRadius = drawW * 0.14;

    const drawSoftGlow = (gx, gy, r, alpha) => {
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
      g.addColorStop(0, `rgba(245, 239, 232, ${alpha.toFixed(3)})`);
      g.addColorStop(0.45, `rgba(245, 239, 232, ${(alpha * 0.38).toFixed(3)})`);
      g.addColorStop(1, 'rgba(245, 239, 232, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(gx, gy, r, 0, Math.PI * 2);
      ctx.fill();
    };

    drawSoftGlow(leftPanX, leftPanY, panRadius, leftGlowA);
    drawSoftGlow(rightPanX, rightPanY, panRadius, rightGlowA);
    drawSoftGlow(pivotX, pivotY, panRadius * 0.85, 0.11 + haloPulse * 0.08);

    // 5. Reflexo luminoso deslizando suavemente pela lâmina da espada
    const swordProg = (time * 0.22) % 1;
    const sx =
      x0 +
      drawW * (LANDMARKS.swordTop.u + (LANDMARKS.swordBot.u - LANDMARKS.swordTop.u) * swordProg);
    const sy =
      y0 +
      drawH * (LANDMARKS.swordTop.v + (LANDMARKS.swordBot.v - LANDMARKS.swordTop.v) * swordProg);
    const swordAlpha = Math.sin(swordProg * Math.PI) * 0.22;
    drawSoftGlow(sx, sy, drawW * 0.09, swordAlpha);
  };

  return { render };
}
