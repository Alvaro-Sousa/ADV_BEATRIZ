// Accordion acessível (áreas de atuação e FAQ): um item aberto por grupo.
export function initAccordions() {
  const groups = [document.querySelector('.areas'), document.querySelector('.faq')].filter(Boolean);
  groups.forEach((group) => {
    const buttons = [...group.querySelectorAll('.acc__btn')];
    const toggle = (btn, open) => {
      btn.setAttribute('aria-expanded', String(open));
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (panel) panel.classList.toggle('is-open', open);
    };
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const willOpen = btn.getAttribute('aria-expanded') !== 'true';
        buttons.forEach((b) => toggle(b, false));
        toggle(btn, willOpen);
      });
    });
  });
}
