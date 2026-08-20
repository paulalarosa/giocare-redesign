document.documentElement.classList.add('js');
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    window.__gsapReady = true;
    root.classList.remove('gsap-pending');

    const hero = document.querySelector('[data-hero]');
    if (hero) {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .set(hero, { autoAlpha: 1 })
        .from(hero.querySelector('h1'), { autoAlpha: 0, y: 24, filter: 'blur(14px)', duration: 1.1 })
        .from(hero.querySelectorAll('.sub, .lead, .cta-row'),
              { autoAlpha: 0, y: 16, duration: .85, stagger: .1 }, 0.25);
    }

    if (window.SplitText) {
      gsap.utils.toArray('[data-split]').forEach((h) => {
        SplitText.create(h, {
          type: 'lines',
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.lines, {
              yPercent: 68, autoAlpha: 0, duration: .9, stagger: .1, ease: 'power3.out',
              scrollTrigger: { trigger: h, start: 'top 86%' },
            });
          },
        });
      });
    }

    gsap.utils.toArray('.anim:not([data-hero])').forEach((el) => {
      gsap.from(el, {
        opacity: 0, y: 56, scale: 0.96, ease: 'power3.out', duration: 1,
        scrollTrigger: { trigger: el, start: 'top 86%' },
      });
    });
    gsap.utils.toArray('[data-stagger]').forEach((grid) => {
      gsap.from(grid.children, {
        opacity: 0, y: 40, scale: 0.96, ease: 'power3.out', duration: .75, stagger: .08,
        scrollTrigger: { trigger: grid, start: 'top 84%' },
      });
    });

    const winCard = document.querySelector('.win-stage .window');
    if (winCard) {
      gsap.set(winCard, { transformPerspective: 1100, transformOrigin: '50% 18%' });
      gsap.from(winCard, {
        rotationX: 13, y: 54, scale: .965, ease: 'none',
        scrollTrigger: { trigger: '.win-stage', start: 'top 94%', end: 'top 38%', scrub: .5 },
      });
    }

    gsap.from('.flow-spine', {
      scaleY: 0, ease: 'none',
      scrollTrigger: { trigger: '.flow', start: 'top 78%', end: 'bottom 55%', scrub: true },
    });

    gsap.utils.toArray('.fstep .node').forEach((n) => {
      gsap.from(n, {
        scale: 0.3, autoAlpha: 0, ease: 'back.out(2.2)', duration: .6,
        scrollTrigger: { trigger: n, start: 'top 82%' },
      });
      ScrollTrigger.create({
        trigger: n, start: 'top 62%',
        onEnter: () => n.classList.add('on'),
        onLeaveBack: () => n.classList.remove('on'),
      });
    });

    gsap.from('.letter', {
      yPercent: 26, opacity: 0, ease: 'power3.out', duration: .8, stagger: .06,
      scrollTrigger: { trigger: '#letters', start: 'top 82%' },
    });

    gsap.to('.hero-mark figure', {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.app-stage .blob-1', {
      yPercent: -22, ease: 'none',
      scrollTrigger: { trigger: '#app', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.to('.app-stage .blob-2', {
      yPercent: 24, ease: 'none',
      scrollTrigger: { trigger: '#app', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    const heroStage = document.getElementById('inicio');
    const smallScreen = matchMedia('(max-width: 820px)').matches;
    const fewCores = (navigator.hardwareConcurrency || 8) <= 4;
    const saveData = !!(navigator.connection && navigator.connection.saveData);
    const hasWebGL = (function () {
      try {
        const c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
      } catch (e) { return false; }
    })();

    let glLayer = null;
    if (heroStage && hasWebGL && !smallScreen && !fewCores && !saveData) {
      import('./hero-gradient.js').then((mod) => {
        glLayer = mod.mount(heroStage);
        if (!glLayer) return;
        gsap.ticker.add(glLayer.tick);
        gsap.to(glLayer.state, {
          progress: 1, ease: 'none',
          scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub: 1 },
        });
      }).catch(function () {});
    }

    const iaStage = document.getElementById('iaStage');
    if (iaStage && hasWebGL && !smallScreen && !fewCores && !saveData) {
      import('./ia-scene.js').then((mod) => {
        const ia = mod.mount(iaStage);
        if (!ia) return;
        const sec = document.getElementById('ia');
        sec.classList.add('ia-live');
        iaStage.hidden = false;
        ia.resize();

        const caps = gsap.utils.toArray('.ia-cap');
        const abc = sec.querySelector('.ia-abc');
        const hint = sec.querySelector('.ia-hint');
        gsap.set(caps.slice(1), { autoAlpha: 0, y: 18 });
        gsap.set(abc, { autoAlpha: 0 });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: sec, start: 'top top', end: '+=260%', pin: true, scrub: .5, anticipatePin: 1,
            onToggle: (self) => {
              if (self.isActive) gsap.ticker.add(ia.tick);
              else gsap.ticker.remove(ia.tick);
            },
          },
        });
        tl.to(ia.state, { progress: 2, duration: 2 }, 0)
          .to(hint, { autoAlpha: 0, duration: .2, ease: 'power1.out' }, .3)
          .to(caps[0], { autoAlpha: 0, y: -18, duration: .16, ease: 'power1.in' }, .55)
          .to(caps[1], { autoAlpha: 1, y: 0, duration: .16, ease: 'power1.out' }, .78)
          .to(abc, { autoAlpha: 1, duration: .18, ease: 'power1.out' }, .85)
          .to(caps[1], { autoAlpha: 0, y: -18, duration: .16, ease: 'power1.in' }, 1.5)
          .to(abc, { autoAlpha: 0, duration: .14, ease: 'power1.in' }, 1.5)
          .to(caps[2], { autoAlpha: 1, y: 0, duration: .16, ease: 'power1.out' }, 1.75)
          .to({}, { duration: .4 }, 1.91);

        if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
          sec.addEventListener('pointermove', (e) => {
            const r = sec.getBoundingClientRect();
            ia.state.mx = (e.clientX - r.left) / r.width;
            ia.state.my = (e.clientY - r.top) / r.height;
          }, { passive: true });
        }

        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      }).catch(function () {});
    }

    const flowHost = document.querySelector('.flow');
    if (flowHost && hasWebGL && !smallScreen && !fewCores && !saveData) {
      import('./flow-glow.js').then((mod) => {
        const glow = mod.mount(flowHost);
        if (!glow) return;
        gsap.ticker.add(glow.tick);
        gsap.to(glow.state, {
          progress: 1, ease: 'none',
          scrollTrigger: { trigger: '.flow', start: 'top 62%', end: 'bottom 62%', scrub: .6 },
        });
      }).catch(function () {});
    }

    const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const clamp = gsap.utils.clamp;

    const tilt = document.querySelector('.hero-mark .tilt');
    if (heroStage && finePointer) {
      let rotY, rotX, haloX, haloY;
      if (tilt) {
        gsap.set(tilt, { transformPerspective: 820 });
        rotY = gsap.quickTo(tilt, 'rotationY', { duration: .55, ease: 'power3.out' });
        rotX = gsap.quickTo(tilt, 'rotationX', { duration: .55, ease: 'power3.out' });
        const halo = document.querySelector('.hero-mark .halo');
        haloX = halo && gsap.quickTo(halo, 'x', { duration: .8, ease: 'power3.out' });
        haloY = halo && gsap.quickTo(halo, 'y', { duration: .8, ease: 'power3.out' });
      }

      heroStage.addEventListener('pointermove', (e) => {
        if (tilt) {
          const r = tilt.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
          const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
          rotY(clamp(-16, 16, dx * 15));
          rotX(clamp(-13, 13, -dy * 11));
          tilt.style.setProperty('--lx', clamp(-30, 130, 50 + dx * 95) + '%');
          tilt.style.setProperty('--ly', clamp(-30, 130, 40 + dy * 95) + '%');
          if (haloX) { haloX(clamp(-20, 20, dx * 26)); haloY(clamp(-16, 16, dy * 20)); }
          heroStage.classList.add('lit');
        }
        if (glLayer) {
          const hr = heroStage.getBoundingClientRect();
          glLayer.state.mx = (e.clientX - hr.left) / hr.width;
          glLayer.state.my = 1 - (e.clientY - hr.top) / hr.height;
        }
      }, { passive: true });

      heroStage.addEventListener('pointerleave', () => {
        if (tilt) {
          rotY(0); rotX(0);
          if (haloX) { haloX(0); haloY(0); }
          heroStage.classList.remove('lit');
        }
        if (glLayer) { glLayer.state.mx = .82; glLayer.state.my = .86; }
      });
    }

    if (finePointer) {
      gsap.utils.toArray('.cta-row .btn, .cta-final .btn, .tier .cta .btn, .fcard .btn, .lostcard .row .btn, .avisar .btn').forEach((btn) => {
        btn.classList.add('magnet');
        btn.addEventListener('pointermove', (e) => {
          const r = btn.getBoundingClientRect();
          btn.style.setProperty('--mgx', clamp(-6, 6, (e.clientX - (r.left + r.width / 2)) * .14) + 'px');
          btn.style.setProperty('--mgy', clamp(-5, 5, (e.clientY - (r.top + r.height / 2)) * .22) + 'px');
        }, { passive: true });
        btn.addEventListener('pointerleave', () => {
          btn.style.setProperty('--mgx', '0px');
          btn.style.setProperty('--mgy', '0px');
        });
      });

      gsap.utils.toArray('[data-glow]').forEach((el) => {
        el.addEventListener('pointermove', (e) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty('--cx', ((e.clientX - r.left) / r.width * 100) + '%');
          el.style.setProperty('--cy', ((e.clientY - r.top) / r.height * 100) + '%');
        }, { passive: true });
      });

      gsap.utils.toArray('[data-tilt]').forEach((card) => {
        gsap.set(card, { transformPerspective: 900 });
        const crx = gsap.quickTo(card, 'rotationX', { duration: .5, ease: 'power3.out' });
        const cry = gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power3.out' });
        card.addEventListener('pointermove', (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          cry(clamp(-4, 4, (px - .5) * 7));
          crx(clamp(-3, 3, -(py - .5) * 5));
          card.style.setProperty('--cx', (px * 100) + '%');
          card.style.setProperty('--cy', (py * 100) + '%');
        }, { passive: true });
        card.addEventListener('pointerleave', () => { crx(0); cry(0); });
      });
    }
  });
} else {
  root.classList.remove('gsap-pending');
}

const nav = document.getElementById('nav');
const progress = document.getElementById('progress');
const logoWhite = document.getElementById('logo-white');
const logoDark = document.getElementById('logo-dark');
function updateNavLogo(scrolled) {
  const useWhite = !scrolled || root.getAttribute('data-theme') === 'dark';
  logoWhite.hidden = !useWhite; logoDark.hidden = useWhite;
}
function onScroll() {
  const y = window.scrollY;
  const scrolled = y > 40;
  nav.classList.toggle('scrolled', scrolled);
  updateNavLogo(scrolled);
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
}
onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

function scaleFrames() {
  document.querySelectorAll('[data-frame]').forEach((vp) => {
    const w = +vp.dataset.w, h = +vp.dataset.h;
    const iframe = vp.querySelector('iframe');
    if (!iframe || !vp.clientWidth) return;
    const scale = vp.clientWidth / w;
    iframe.style.width = w + 'px';
    iframe.style.height = h + 'px';
    iframe.style.transform = 'scale(' + scale + ')';
    vp.style.height = (h * scale) + 'px';
  });
}
scaleFrames();
window.addEventListener('load', scaleFrames);
window.addEventListener('resize', scaleFrames);
setTimeout(scaleFrames, 500);

(function () {
  const demo = document.querySelector('.app-stage');
  if (!demo) return;
  const vps = Array.from(demo.querySelectorAll('.vp'));
  const dots = Array.from(demo.querySelectorAll('.app-dots button'));
  const cap = document.getElementById('appCap');
  const DWELL = 5200;
  let idx = 0, timer = null;

  function render() {
    vps.forEach((v, k) => v.classList.toggle('active', k === idx));
    dots.forEach((d, k) => {
      const on = k === idx;
      d.classList.toggle('active', on);
      d.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (cap) cap.textContent = vps[idx].dataset.cap || '';
  }
  function go(n) { idx = (n + vps.length) % vps.length; render(); }
  function auto() { if (reduce) return; clearInterval(timer); timer = setInterval(() => go(idx + 1), DWELL); }

  dots.forEach((d, k) => d.addEventListener('click', () => { go(k); auto(); }));
  demo.addEventListener('mouseenter', () => clearInterval(timer));
  demo.addEventListener('mouseleave', auto);
  go(0); auto();
})();

(function () {
  const letters = Array.from(document.querySelectorAll('#letters .letter'));
  if (!letters.length) return;
  function openLetter(el) {
    letters.forEach((l) => l.setAttribute('aria-expanded', l === el ? 'true' : 'false'));
  }
  letters.forEach((l) => {
    l.addEventListener('click', () => openLetter(l));
    l.addEventListener('focus', () => openLetter(l));
    l.addEventListener('mouseenter', () => { if (matchMedia('(hover:hover)').matches) openLetter(l); });
  });
})();

function apply(theme) {
  root.setAttribute('data-theme', theme);
  const dark = theme === 'dark';
  document.querySelectorAll('.lock-light').forEach(i => i.hidden = dark);
  document.querySelectorAll('.lock-dark').forEach(i => i.hidden = !dark);
  updateNavLogo(nav.classList.contains('scrolled'));
}
apply('light');

(function () {
  const burger = document.getElementById('burger');
  const navmenu = document.getElementById('navmenu');
  if (!burger || !navmenu) return;
  const setOpen = (open) => {
    nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  burger.addEventListener('click', (e) => { e.stopPropagation(); setOpen(!nav.classList.contains('menu-open')); });
  navmenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('click', (e) => { if (nav.classList.contains('menu-open') && !nav.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
})();
