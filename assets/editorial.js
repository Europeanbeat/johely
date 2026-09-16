(() => {
  const menu = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  const closeMenu = () => { nav?.classList.remove('open'); menu?.setAttribute('aria-expanded', 'false'); };
  window.matchMedia('(max-width: 1180px)').addEventListener('change', closeMenu);
  nav?.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
  document.querySelector('header .brand')?.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav?.classList.contains('open')) { closeMenu(); menu?.focus(); }
  });
  document.addEventListener('click', (event) => { if (!event.target.closest('header.top')) closeMenu(); });
  document.querySelectorAll('[data-section]').forEach((section) => {
    section.querySelector('.intro .eyebrow')?.setAttribute('data-number', section.dataset.section);
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        nav?.querySelectorAll('a[aria-current]').forEach((a) => a.removeAttribute('aria-current'));
        nav?.querySelector(`a[href="#${entry.target.id}"]`)?.setAttribute('aria-current', 'location');
      }
    }, { rootMargin: '-15% 0px -65% 0px' });
    document.querySelectorAll('main>section[id]').forEach((section) => observer.observe(section));
  }
})();
