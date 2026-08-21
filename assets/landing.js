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
      const tlHero = gsap.timeline({ defaults: { ease: 'power3.out' } })
        .set(hero, { autoAlpha: 1 })
        .from(hero.querySelector('h1'), { autoAlpha: 0, y: 24, filter: 'blur(14px)', duration: 1.1 })
        .from(hero.querySelectorAll('.lead, .cta-row, .hero-fatos'),
              { autoAlpha: 0, y: 16, duration: .85, stagger: .1 }, 0.25);
      const demo = document.getElementById('heroDemo');
      if (demo) {
        tlHero.from(demo, {
          y: 90, autoAlpha: 0, duration: 1.15,
          clipPath: 'inset(0% 0% 62% 0% round 18px)', ease: 'power4.out', clearProps: 'clipPath',
        }, .45)
        .from('.sat', { scale: .82, autoAlpha: 0, duration: .55, stagger: .14, ease: 'back.out(1.7)' }, 1.05);
      }
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

    const pan = document.querySelector('.hero-demo .vp .pan');
    if (pan) {
      gsap.to(pan, {
        y: () => -(parseFloat(pan.parentElement.dataset.panDist) || 0), ease: 'none',
        scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub: .8, invalidateOnRefresh: true },
      });
      gsap.to('.sat-a', { y: -34, ease: 'none',
        scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub: .6 } });
      gsap.to('.sat-b', { y: 30, ease: 'none',
        scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub: .6 } });
    }

    gsap.utils.toArray('.colagem .cg').forEach((cg, i) => {
      gsap.from(cg, {
        clipPath: 'inset(0% 0% 100% 0% round 16px)', y: 34, duration: .85, delay: i * .1,
        ease: 'power4.out', clearProps: 'clipPath',
        scrollTrigger: { trigger: '.colagem', start: 'top 80%' },
      });
    });

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

    const metSec = document.getElementById('metodo');
    if (metSec && !matchMedia('(max-width: 820px)').matches) {
      metSec.classList.add('met-live');
      const mbs = gsap.utils.toArray('.met-big .mb');
      const mis = gsap.utils.toArray('.met-info .mi');
      const mrs = gsap.utils.toArray('.met-rail .mr');
      let letraAtual = 0;
      const mostrar = (i) => {
        letraAtual = i;
        mbs.forEach((el, k) => el.classList.toggle('on', k === i));
        mis.forEach((el, k) => el.classList.toggle('on', k === i));
        mrs.forEach((el, k) => el.classList.toggle('on', k === i));
      };
      const stMet = ScrollTrigger.create({
        trigger: metSec.querySelector('.met-wrap'), start: 'top top', end: 'bottom bottom',
        onUpdate(self) {
          const i = Math.min(6, Math.floor(self.progress * 7));
          if (i !== letraAtual) mostrar(i);
        },
      });
      mostrar(0);
      mrs.forEach((b, k) => b.addEventListener('click', () => {
        const alvo = stMet.start + (stMet.end - stMet.start) * ((k + .5) / 7);
        window.scrollTo({ top: alvo, behavior: 'smooth' });
      }));
    }

    gsap.utils.toArray('.rcl').forEach((c) => {
      ScrollTrigger.create({ trigger: c, start: 'top 78%', once: true,
        onEnter: () => c.classList.add('viva') });
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
    const iaSec = document.getElementById('ia');
    if (iaStage && iaSec && hasWebGL && !smallScreen && !fewCores && !saveData) {
      iaSec.classList.add('ia-live');
      iaStage.hidden = false;

      const iaEstado = { progress: 0, mx: .5, my: .5 };
      const caps = gsap.utils.toArray('.ia-cap');
      const abc = iaSec.querySelector('.ia-abc');
      const letras = gsap.utils.toArray('.ia-abc span');
      const hint = iaSec.querySelector('.ia-hint');
      gsap.set(caps.slice(1), { autoAlpha: 0, y: 34 });
      gsap.set(abc, { autoAlpha: 0 });

      const iaTl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: iaSec.querySelector('.ia-wrap'), start: 'top top', end: 'bottom bottom', scrub: .4,
          onUpdate(self) {
            const pr = self.progress;
            const barra = iaSec.querySelector('.ia-prog i');
            if (barra) barra.style.transform = 'scaleX(' + pr.toFixed(4) + ')';
            const acesas = pr <= .3 ? 0 : pr >= .62 ? 7 : Math.ceil((pr - .3) / .32 * 7);
            letras.forEach((l, k) => l.classList.toggle('on', k < acesas));
          },
        },
      });
      iaTl.to(iaEstado, { progress: 1, duration: .52 }, .3)
        .to(iaEstado, { progress: 2, duration: .52 }, 1.26)
        .to(hint, { autoAlpha: 0, duration: .14, ease: 'power1.out' }, .18)
        .to(caps[0], { autoAlpha: 0, y: -34, duration: .22, ease: 'power1.in' }, .3)
        .to(caps[1], { autoAlpha: 1, y: 0, duration: .24, ease: 'power2.out' }, .38)
        .to(abc, { autoAlpha: 1, duration: .2, ease: 'power1.out' }, .62)
        .to(caps[1], { autoAlpha: 0, y: -34, duration: .22, ease: 'power1.in' }, 1.28)
        .to(abc, { autoAlpha: 0, duration: .18, ease: 'power1.in' }, 1.3)
        .to(caps[2], { autoAlpha: 1, y: 0, duration: .24, ease: 'power2.out' }, 1.36)
        .to({}, { duration: .32 }, 1.78);

      let cena = null, perto = false, tickando = false;
      const ligar = () => {
        if (cena && perto && !tickando) { gsap.ticker.add(cena.tick); tickando = true; }
      };
      const desligar = () => {
        if (cena && tickando) { gsap.ticker.remove(cena.tick); tickando = false; }
      };
      ScrollTrigger.create({
        trigger: iaSec, start: 'top bottom', end: 'bottom top',
        onToggle: (self) => { perto = self.isActive; if (perto) ligar(); else desligar(); },
      });

      const desistir = () => {
        desligar();
        iaTl.scrollTrigger.kill(true);
        iaTl.kill();
        iaSec.classList.remove('ia-live');
        iaStage.hidden = true;
        gsap.set(caps.concat(abc, hint), { clearProps: 'all' });
        ScrollTrigger.refresh();
      };

      import('./ia-scene.js').then((mod) => {
        cena = mod.mount(iaStage, iaEstado);
        if (!cena) { desistir(); return; }
        cena.resize();
        cena.tick(0);
        ligar();
      }).catch(desistir);

      if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
        iaSec.addEventListener('pointermove', (e) => {
          const r = iaSec.getBoundingClientRect();
          iaEstado.mx = (e.clientX - r.left) / r.width;
          iaEstado.my = (e.clientY - r.top) / r.height;
        }, { passive: true });
      }
    }

    const gira = document.getElementById('giraPal');
    if (gira) {
      const palavras = gsap.utils.toArray('#giraPal > span');
      let atual = 0;
      const medir = () => { gira.style.width = palavras[atual].offsetWidth + 'px'; };
      const ajustar = () => {
        const antes = gira.style.transition;
        gira.style.transition = 'none';
        medir();
        requestAnimationFrame(() => { gira.style.transition = antes; });
      };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustar);
      else ajustar();
      window.addEventListener('resize', ajustar, { passive: true });
      setInterval(() => {
        palavras[atual].classList.remove('on');
        atual = (atual + 1) % palavras.length;
        palavras[atual].classList.add('on');
        medir();
      }, 2600);
    }

    const ctaAbrir = document.getElementById('ctaAbrir');
    const ctaCard = document.getElementById('ctaCard');
    if (ctaAbrir && ctaCard) {
      ctaAbrir.addEventListener('click', (e) => {
        e.preventDefault();
        const bw = ctaAbrir.offsetWidth, bh = ctaAbrir.offsetHeight;
        ctaAbrir.hidden = true;
        ctaCard.hidden = false;
        const dentro = ctaCard.querySelectorAll('label, .cta-linha, .cta-nota');
        gsap.set(ctaCard, { overflow: 'hidden' });
        gsap.from(ctaCard, {
          width: bw, height: bh, borderRadius: 999, duration: .55, ease: 'power4.out',
          clearProps: 'width,height,borderRadius,overflow',
        });
        gsap.from(dentro, { autoAlpha: 0, y: 10, duration: .32, delay: .2, stagger: .06 });
        setTimeout(() => ctaCard.querySelector('input').focus(), 380);
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !ctaCard.hidden) { ctaCard.hidden = true; ctaAbrir.hidden = false; ctaAbrir.focus(); }
      });
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

    if (heroStage && finePointer) {
      heroStage.addEventListener('pointermove', (e) => {
        if (glLayer) {
          const hr = heroStage.getBoundingClientRect();
          glLayer.state.mx = (e.clientX - hr.left) / hr.width;
          glLayer.state.my = 1 - (e.clientY - hr.top) / hr.height;
        }
      }, { passive: true });
      heroStage.addEventListener('pointerleave', () => {
        if (glLayer) { glLayer.state.mx = .5; glLayer.state.my = .5; }
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
  let mudou = false;
  document.querySelectorAll('[data-frame]').forEach((vp) => {
    const w = +vp.dataset.w, h = +vp.dataset.h;
    const full = +vp.dataset.full || h;
    const iframe = vp.querySelector('iframe');
    if (!iframe || !vp.clientWidth) return;
    const scale = vp.clientWidth / w;
    const altura = (h * scale) + 'px';
    if (vp.style.height !== altura) mudou = true;
    iframe.style.width = w + 'px';
    iframe.style.height = full + 'px';
    iframe.style.transform = 'scale(' + scale + ')';
    vp.style.height = altura;
    vp.dataset.panDist = ((full - h) * scale).toFixed(2);
  });
  return mudou;
}
function reScaleFrames() {
  if (scaleFrames() && window.ScrollTrigger && window.__gsapReady) ScrollTrigger.refresh();
}
scaleFrames();
window.addEventListener('load', reScaleFrames);
window.addEventListener('resize', scaleFrames);
setTimeout(reScaleFrames, 500);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    if (window.ScrollTrigger && window.__gsapReady) ScrollTrigger.refresh();
  });
}

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
  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.rcl').forEach((c) => c.classList.add('viva'));
  }
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
