document.documentElement.classList.add('js');
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  const mm = gsap.matchMedia();

  /**
   * A seção do método: sete letras conduzidas pela rolagem.
   *
   * Vive no próprio contexto de `matchMedia` porque a largura precisa ser
   * REAVALIADA. Antes era um `matchMedia(...).matches` lido uma vez: quem
   * carregava largo e estreitava a janela (girar um tablet, o modo responsivo
   * do devtools) ficava com o carrossel de desktop desenhado em 375px — o
   * trilho A B C D E F S reaparecia e o texto do cartão caía em cima dele.
   *
   * `prefers-reduced-motion` continua sendo condição: com movimento reduzido a
   * seção fica empilhada, que é a versão sem rolagem conduzida.
   */
  mm.add('(min-width: 821px) and (prefers-reduced-motion: no-preference)', () => {
    const metSec = document.getElementById('metodo');
    if (!metSec) return;
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
        const i = Math.min(6, Math.floor((self.progress / .86) * 7));
        if (i !== letraAtual) mostrar(i);
      },
    });
    mostrar(0);

    const irPara = (k) => {
      const alvo = stMet.start + (stMet.end - stMet.start) * .86 * ((k + .5) / 7);
      window.scrollTo({ top: alvo, behavior: 'smooth' });
    };
    const ouvintes = mrs.map((b, k) => {
      const f = () => irPara(k);
      b.addEventListener('click', f);
      return [b, f];
    });

    // O GSAP reverte o ScrollTrigger sozinho; o resto é nosso.
    return () => {
      ouvintes.forEach(([b, f]) => b.removeEventListener('click', f));
      metSec.classList.remove('met-live');
      [...mbs, ...mis, ...mrs].forEach((el) => el.classList.remove('on'));
    };
  });

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

    gsap.utils.toArray('.anim:not([data-hero]):not(.hero-demo)').forEach((el) => {
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
    gsap.utils.toArray('[data-cascata]').forEach((caixa) => {
      const modo = caixa.dataset.cascata || 'subir';
      const filhos = gsap.utils.toArray(caixa.children);
      const extra = modo === 'lados' ? { x: (i) => (i % 2 ? 44 : -44) }
        : modo === 'esquerda' ? { x: -40 }
        : { y: 48 };
      gsap.from(filhos, Object.assign({
        autoAlpha: 0, duration: .85, ease: 'power3.out', stagger: .12,
        scrollTrigger: { trigger: caixa, start: 'top 84%' },
      }, extra));
    });

    const pan = document.querySelector('.hero-demo .vp .pan');
    if (pan) {
      gsap.to(pan, {
        y: () => -(parseFloat(pan.parentElement.dataset.panDist) || 0), ease: 'none',
        scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub: .8, invalidateOnRefresh: true },
      });
      const deriva = { '.sat-a': -46, '.sat-b': 34, '.sat-c': -30, '.sat-d': 42 };
      Object.keys(deriva).forEach((sel) => {
        gsap.to(sel, { y: deriva[sel], ease: 'none',
          scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub: .6 } });
      });
    }

    const uni = document.getElementById('ctaUni');
    if (uni) {
      gsap.timeline({ scrollTrigger: { trigger: uni, start: 'top 88%' } })
        .fromTo(uni,
          { autoAlpha: 0, '--sep': '15px', '--uw': '372px', '--r': '999px' },
          { autoAlpha: 1, '--sep': '0px', '--uw': '372px', '--r': '999px', duration: .55, ease: 'power2.out' })
        .to(uni, { '--uw': '196px', '--r': '0px', duration: .6, ease: 'power3.inOut' }, '>-0.08');
    }

    const cgLados = [
      { x: -72, y: 26, rotation: -7 },
      { x: 74, y: 22, rotation: 6 },
      { x: -48, y: 62, rotation: 5 },
      { x: 54, y: 66, rotation: -6 },
    ];
    gsap.utils.toArray('.colagem .cg').forEach((cg, i) => {
      const lado = cgLados[i % cgLados.length];
      gsap.from(cg, {
        x: lado.x, y: lado.y, rotation: lado.rotation, autoAlpha: 0, scale: .92,
        duration: .95, delay: i * .13, ease: 'power3.out',
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
      const iaEstado = { progress: 0, mx: .5, my: .5 };
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
      gsap.to(iaEstado, {
        progress: 2, ease: 'none',
        scrollTrigger: { trigger: iaSec, start: 'top 82%', end: 'bottom 18%', scrub: .8 },
      });
      gsap.to(iaStage, {
        y: 54, ease: 'none',
        scrollTrigger: { trigger: iaSec, start: 'top bottom', end: 'bottom top', scrub: .6 },
      });
      iaSec.addEventListener('pointermove', (e) => {
        const r = iaSec.getBoundingClientRect();
        iaEstado.mx = (e.clientX - r.left) / r.width;
        iaEstado.my = (e.clientY - r.top) / r.height;
      }, { passive: true });

      import('./ia-scene.js').then((mod) => {
        cena = mod.mount(iaStage, iaEstado);
        if (!cena) return;
        cena.resize();
        cena.tick(0);
        ligar();
        window.addEventListener('resize', () => { if (cena) cena.resize(); }, { passive: true });
      }).catch(function () {});
    }

    const gira = document.getElementById('giraPal');
    if (gira) {
      (gira.dataset.verbos || '').split('|').filter(Boolean).forEach((v) => {
        const s = document.createElement('span');
        s.className = 'grad-text';
        s.setAttribute('aria-hidden', 'true');
        s.dataset.v = v;
        gira.appendChild(s);
      });
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

    const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const teseCols = document.querySelector('.tese-cols');
    if (teseCols) {
      gsap.timeline({ scrollTrigger: { trigger: teseCols, start: 'top 82%' } })
        .from(teseCols, { scaleX: .3, autoAlpha: 0, duration: .7, ease: 'power3.out', transformOrigin: 'center' })
        .from(teseCols.querySelectorAll('.tese-fio'), { scaleX: 0, duration: .55, stagger: .12, ease: 'power2.out' }, '-=.35')
        .from(teseCols.querySelectorAll('p'), { y: 26, autoAlpha: 0, duration: .7, stagger: .12, ease: 'power3.out' }, '-=.45');
    }

    const teseFim = document.querySelector('.tese-fim');
    if (teseFim) {
      gsap.from(teseFim.children.length ? [teseFim, ...teseFim.children] : teseFim, {
        y: 30, autoAlpha: 0, duration: .8, stagger: .12, ease: 'power3.out',
        scrollTrigger: { trigger: teseFim, start: 'top 88%' },
      });
    }

    const acad = document.getElementById('academia');
    if (acad) {
      const conta = acad.querySelector('[data-conta]');
      const tl = gsap.timeline({ scrollTrigger: { trigger: acad, start: 'top 68%' } });

      tl.from(acad.querySelector('.ac-fio'), { scaleY: 0, duration: 1.1, ease: 'power3.out' })
        .from(acad.querySelector('.ac-pre'), { y: 14, autoAlpha: 0, duration: .5, ease: 'power2.out' }, '-=.92')
        .from(acad.querySelector('.ac-n'), {
          y: 40, autoAlpha: 0, scale: .92, duration: .9, ease: 'power3.out', transformOrigin: 'left bottom',
        }, '-=.28');

      if (conta && !reduzido) {
        const fim = parseInt(conta.dataset.conta, 10);
        const estado = { v: 0 };
        conta.textContent = '0';
        tl.to(estado, {
          v: fim, duration: 1.5, ease: 'power2.out',
          onUpdate() { conta.textContent = Math.round(estado.v); },
          onComplete() { conta.textContent = fim; },
        }, '-=.55');
      }

      tl.from(acad.querySelector('.ac-leg'), { y: 20, autoAlpha: 0, duration: .65, ease: 'power3.out' }, '-=1.1')
        .from(acad.querySelector('.ac-fonte'), { y: 18, autoAlpha: 0, duration: .6, ease: 'power3.out' }, '-=.85')
        .from(acad.querySelectorAll('.ac-texto > *'), {
          y: 28, autoAlpha: 0, duration: .75, stagger: .13, ease: 'power3.out',
        }, '-=1.25');

      const fimAcad = acad.querySelector('.ac-fim');
      if (fimAcad) {
        gsap.from([fimAcad, ...fimAcad.children], {
          y: 26, autoAlpha: 0, duration: .75, stagger: .1, ease: 'power3.out',
          scrollTrigger: { trigger: fimAcad, start: 'top 90%' },
        });
      }
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
  const linhas = Array.from(document.querySelectorAll('.ralin'));
  const conversa = document.querySelector('.ia-conversa');
  if (!linhas.length || !conversa) return;
  const bolhas = Array.from(conversa.querySelectorAll('.bolha'));
  conversa.classList.add('viva');
  let idx = 0, relogio = null, preso = false;
  function acende(k) {
    idx = k;
    const letra = linhas[k].dataset.letra;
    linhas.forEach((l, i) => l.classList.toggle('on', i === k));
    bolhas.forEach((b) => b.classList.toggle('on', b.dataset.fala === letra));
  }
  function roda() {
    clearInterval(relogio);
    if (reduce) return;
    relogio = setInterval(() => { if (!preso) acende((idx + 1) % linhas.length); }, 3400);
  }
  linhas.forEach((l, k) => {
    l.addEventListener('mouseenter', () => { preso = true; acende(k); });
    l.addEventListener('mouseleave', () => { preso = false; });
    l.addEventListener('focus', () => { preso = true; acende(k); });
    l.addEventListener('blur', () => { preso = false; });
    l.addEventListener('click', () => acende(k));
  });
  acende(0);
  roda();
})();

(function () {
  const demo = document.querySelector('.app-stage');
  const abas = Array.from(document.querySelectorAll('.app-feats .af'));
  if (!demo || !abas.length) return;
  const telas = Array.from(demo.querySelectorAll('.vp'));
  const cap = document.getElementById('appCap');
  const DWELL = 5200;
  let idx = 0, relogio = null, pausado = false;

  function pinta() {
    telas.forEach((v, k) => v.classList.toggle('active', k === idx));
    abas.forEach((a, k) => {
      const on = k === idx;
      a.setAttribute('aria-selected', on ? 'true' : 'false');
      a.tabIndex = on ? 0 : -1;
    });
    if (cap) cap.textContent = telas[idx].dataset.cap || '';
  }
  function conta() {
    if (relogio) { relogio.cancel(); relogio = null; }
    if (reduce) return;
    const barra = abas[idx].querySelector('.afp');
    if (!barra || !barra.animate) return;
    relogio = barra.animate(
      [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
      { duration: DWELL, easing: 'linear', fill: 'forwards' });
    relogio.onfinish = () => vai(idx + 1);
    if (pausado) relogio.pause();
  }
  function vai(n) { idx = (n + telas.length) % telas.length; pinta(); conta(); }

  abas.forEach((a, k) => {
    a.addEventListener('click', () => vai(k));
    a.addEventListener('keydown', (e) => {
      const passo = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1
        : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      let alvo = null;
      if (passo) alvo = (idx + passo + abas.length) % abas.length;
      else if (e.key === 'Home') alvo = 0;
      else if (e.key === 'End') alvo = abas.length - 1;
      if (alvo === null) return;
      e.preventDefault();
      vai(alvo);
      abas[alvo].focus();
    });
  });

  const pausar = () => { pausado = true; if (relogio) relogio.pause(); };
  const seguir = () => { pausado = false; if (relogio) relogio.play(); };
  [demo, document.querySelector('.app-feats')].forEach((el) => {
    if (!el) return;
    el.addEventListener('mouseenter', pausar);
    el.addEventListener('mouseleave', seguir);
    el.addEventListener('focusin', pausar);
    el.addEventListener('focusout', seguir);
  });

  vai(0);
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
