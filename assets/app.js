(function () {
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    const dark = theme === 'dark';
    document.querySelectorAll('.lock-light').forEach((el) => { el.hidden = dark; });
    document.querySelectorAll('.lock-dark').forEach((el) => { el.hidden = !dark; });
  }

  applyTheme(matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  const toggle = document.getElementById('theme');
  if (toggle) {
    toggle.addEventListener('click', () => {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  if (matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const animateCount = (el) => {
      const match = el.innerHTML.match(/^(\D*)([\d.,]+)([\s\S]*)$/);
      if (!match) return;
      const [, prefix, raw, suffix] = match;
      const decimals = (raw.split(',')[1] || '').length;
      const target = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
      if (!isFinite(target)) return;
      const format = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      const duration = 1000;
      let start = null;
      el.innerHTML = prefix + format(0) + suffix;
      const step = (now) => {
        if (start === null) start = now;
        const progress = Math.min((now - start) / duration, 1);
        el.innerHTML = prefix + format(target * easeOut(progress)) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    document.querySelectorAll('.kpi .val').forEach((el) => observer.observe(el));
  }
})();
