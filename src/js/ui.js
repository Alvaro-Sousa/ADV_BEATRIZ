export function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    preloader.classList.add('is-done');
    setTimeout(() => preloader.remove(), 750);
  };
  const minDelay = new Promise((r) => setTimeout(r, 950));
  const pageLoad = new Promise((r) => {
    if (document.readyState === 'complete') r();
    else window.addEventListener('load', r, { once: true });
  });
  Promise.all([minDelay, pageLoad]).then(close);
  setTimeout(close, 2200);
}

export function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

export function initMenu() {
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  if (!burger || !menu) return;
  const set = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle('is-open', open);
  };
  burger.addEventListener('click', () => set(burger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
}

export function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  // Escalona itens irmãos para uma entrada mais elegante
  items.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 5) * 0.09}s`);
    io.observe(el);
  });
}

export function initMap() {
  const slot = document.getElementById('mapa');
  if (!slot) return;
  const src = slot.getAttribute('data-map-src') || '';
  // Valida que a URL é apenas do Google Maps (HTTPS) antes de criar o iframe
  if (!/^https:\/\/(www\.)?google\.com(\.br)?\/maps|^https:\/\/maps\.google\.com/i.test(src)) {
    slot.hidden = true;
    return;
  }
  const mount = () => {
    if (slot.querySelector('iframe')) return;
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = 'Localização do escritório: Dias, Soares e Figueirêdo Advogados em Patos/PB';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.setAttribute('allowfullscreen', '');
    slot.appendChild(iframe);
    slot.hidden = false;
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { mount(); io.disconnect(); }
    }, { rootMargin: '250px' });
    io.observe(slot);
  } else {
    mount();
  }
}

export function initCardEffects() {
  const cards = document.querySelectorAll('.area-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    // Modo compatibilidade / mobile: toque na tela ativa o efeito de pop-up
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      const willActivate = !card.classList.contains('is-active');
      cards.forEach((c) => c.classList.remove('is-active'));
      if (willActivate) {
        card.classList.add('is-active');
      }
    });
  });

  // Tocar fora fecha o pop-up ativo no mobile
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.area-card')) {
      cards.forEach((c) => c.classList.remove('is-active'));
    }
  });
}
