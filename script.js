const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-nav');
const header = document.querySelector('.site-header');
const progressBar = document.querySelector('.scroll-progress-bar');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (menuButton && navigation) {
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
    navigation.classList.remove('is-open');
  };

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
    navigation.classList.toggle('is-open', !isOpen);
  });

  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

document.querySelector('#year').textContent = new Date().getFullYear();

if (!reducedMotion && 'IntersectionObserver' in window) {
  const revealTargets = [
    ...document.querySelectorAll('.intro > .eyebrow, .intro-grid h2, .intro-note, .intro-image-wrap'),
    ...document.querySelectorAll('.section-heading, .place-card'),
    ...document.querySelectorAll('.philosophy-image, .philosophy-copy > .eyebrow, .philosophy-copy > h2, .philosophy-copy > p:not(.eyebrow), .philosophy-copy > .text-link'),
    ...document.querySelectorAll('.quote > *, .inquiry-content > *, .site-footer > *'),
  ];

  revealTargets.forEach((element, index) => {
    if (element.matches('.intro-image-wrap, .philosophy-image')) {
      element.dataset.reveal = 'clip';
    } else if (element.matches('.intro-note, .philosophy-copy > *')) {
      element.dataset.reveal = 'right';
    } else {
      element.dataset.reveal = 'up';
    }

    if (element.matches('.place-card')) {
      const cardIndex = [...element.parentElement.children].indexOf(element);
      element.style.setProperty('--reveal-delay', `${cardIndex * 120}ms`);
    } else if (element.matches('.quote > *')) {
      element.style.setProperty('--reveal-delay', `${index * 90}ms`);
    }
  });

  document.documentElement.classList.add('js-motion');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

  revealTargets.forEach((element) => revealObserver.observe(element));
}

let frameRequested = false;
const updateScrollEffects = () => {
  frameRequested = false;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  if (progressBar) progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);

  if (!reducedMotion && window.innerWidth > 600) {
    document.querySelectorAll('[data-parallax]').forEach((image) => {
      const rect = image.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
      const parallax = Math.max(-26, Math.min(26, centerOffset * -0.035));
      image.style.setProperty('--parallax-y', `${parallax.toFixed(1)}px`);
    });
  }
};

const requestScrollEffects = () => {
  if (frameRequested) return;
  frameRequested = true;
  window.requestAnimationFrame(updateScrollEffects);
};
window.addEventListener('scroll', requestScrollEffects, { passive: true });
window.addEventListener('resize', requestScrollEffects, { passive: true });
requestScrollEffects();

if (finePointer && !reducedMotion) {
  document.querySelectorAll('.button').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const bounds = button.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) * 0.035;
      const y = (event.clientY - bounds.top - bounds.height / 2) * 0.07;
      button.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
  });
}

