// Animação salva: Fluxo Laminar de Seda (versão mais lenta e serena)
// Feixes de curvas paralelas em #F5EFE8 sobre #541509 com filamentos luminosos lentos.

export function createSilkFlow(getWidth, getHeight) {
  let flowRunners = [];

  const init = () => {
    const width = getWidth();
    const mobile = width < 760;
    const ribbonLines = mobile ? 18 : 28;
    flowRunners = Array.from({ length: mobile ? 7 : 12 }, (_, i) => ({
      lineIdx: (i * 2) % ribbonLines,
      t: Math.random(),
      // Velocidade reduzida (~60% mais lenta) para um movimento mais solene e elegante
      speed: 0.052 + (i % 4) * 0.016,
      len: 0.16 + (i % 3) * 0.04,
    }));
  };

  const evalSilkY = (u, idx, total, time, parX, parY, height) => {
    const norm = (idx / (total - 1)) * 2 - 1;
    const baseSlope = (0.68 - u * 0.36) * height;
    // Oscilação harmônica mais lenta (0.14 / 0.24 / 0.16 rad/s)
    const spread = (0.22 + 0.14 * Math.sin(u * Math.PI + time * 0.14)) * height;
    const wave1 = Math.sin(u * 4.2 - time * 0.24 + norm * 1.35) * (height * 0.085);
    const wave2 = Math.cos(u * 2.4 + time * 0.16 - norm * 0.9) * (height * 0.05);
    return (
      baseSlope +
      norm * spread +
      wave1 +
      wave2 +
      parY * (0.4 + 0.3 * Math.abs(norm)) +
      parX * 0.15 * norm
    );
  };

  const drawDiamond = (ctx, x, y, radius) => {
    ctx.moveTo(x, y - radius);
    ctx.lineTo(x + radius, y);
    ctx.lineTo(x, y + radius);
    ctx.lineTo(x - radius, y);
    ctx.closePath();
  };

  const render = (ctx, time, dt, parX, parY) => {
    const width = getWidth();
    const height = getHeight();
    const mobile = width < 760;
    const totalLines = mobile ? 18 : 28;
    const steps = mobile ? 36 : 56;

    // Eixos verticais sutis de referência editorial
    ctx.strokeStyle = 'rgba(245, 239, 232, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i <= 4; i++) {
      const x = (width * i) / 5 + parX * 0.25;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    ctx.stroke();

    // Feixe de curvas laminares contínuas
    for (let i = 0; i < totalLines; i++) {
      const centerProximity = 1 - Math.abs((i / (totalLines - 1)) * 2 - 1);
      const alpha = 0.045 + centerProximity * 0.14;
      ctx.strokeStyle = `rgba(245, 239, 232, ${alpha.toFixed(3)})`;
      ctx.lineWidth = i % 5 === 0 ? 1.25 : 0.85;
      ctx.beginPath();
      for (let s = 0; s <= steps; s++) {
        const u = s / steps;
        const x = u * width;
        const y = evalSilkY(u, i, totalLines, time, parX, parY, height);
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Filamentos luminosos de deslocamento lento e contínuo
    ctx.lineWidth = 1.8;
    for (let r = 0; r < flowRunners.length; r++) {
      const runner = flowRunners[r];
      runner.t += runner.speed * dt;
      if (runner.t > 1 + runner.len) {
        runner.t = -runner.len;
        runner.lineIdx = Math.floor(Math.random() * totalLines);
      }
      const uStart = Math.max(0, runner.t - runner.len);
      const uEnd = Math.min(1, runner.t);
      if (uEnd <= uStart) continue;

      const x0 = uStart * width;
      const y0 = evalSilkY(uStart, runner.lineIdx, totalLines, time, parX, parY, height);
      const x1 = uEnd * width;
      const y1 = evalSilkY(uEnd, runner.lineIdx, totalLines, time, parX, parY, height);

      const fade = Math.sin(Math.min(1, Math.max(0, runner.t)) * Math.PI);
      const grad = ctx.createLinearGradient(x0, y0, x1, y1);
      grad.addColorStop(0, 'rgba(245, 239, 232, 0)');
      grad.addColorStop(1, `rgba(245, 239, 232, ${(0.55 * fade).toFixed(3)})`);
      ctx.strokeStyle = grad;

      const segSteps = 12;
      ctx.beginPath();
      for (let s = 0; s <= segSteps; s++) {
        const u = uStart + ((uEnd - uStart) * s) / segSteps;
        const x = u * width;
        const y = evalSilkY(u, runner.lineIdx, totalLines, time, parX, parY, height);
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = `rgba(245, 239, 232, ${(0.7 * fade).toFixed(3)})`;
      ctx.beginPath();
      drawDiamond(ctx, x1, y1, 2.3);
      ctx.fill();
    }
  };

  return { init, render };
}
