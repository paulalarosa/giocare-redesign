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

(function () {
  const PAGES = [
    ['Dashboard', 'dashboard.html', 'página'],
    ['Pacientes', 'pacientes.html', 'página'],
    ['Agenda', 'agenda.html', 'página'],
    ['Financeiro', 'financeiro.html', 'página'],
    ['Consulta ao vivo', 'consulta.html', 'página'],
    ['Prontuários', 'prontuario.html', 'página'],
    ['Exames', 'exames.html', 'página'],
    ['Receitas', 'receitas.html', 'página'],
    ['Nova consulta', 'nova-consulta.html', 'ação'],
    ['Novo paciente', 'novo-paciente.html', 'ação'],
    ['Horários de atendimento', 'horarios.html', 'página'],
    ['Meu perfil', 'perfil.html', 'página'],
  ];
  const PEOPLE = ['Marina T.', 'Paulo R.', 'Helena M.', 'Rafael N.', 'Camila D.', 'Bruno A.',
    'Letícia S.', 'André C.', 'Juliana F.', 'Gustavo L.', 'Patrícia R.']
    .map((n) => [n, 'paciente-ficha.html', 'paciente']);
  const INDEX = PAGES.concat(PEOPLE);

  const dlg = document.createElement('dialog');
  dlg.className = 'cmdk';
  dlg.innerHTML = '<div class="in">'
    + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>'
    + '<input type="text" placeholder="Ir para página ou paciente…" aria-label="Busca global" />'
    + '</div><ul role="listbox"></ul>';
  document.body.appendChild(dlg);
  const input = dlg.querySelector('input');
  const list = dlg.querySelector('ul');
  let sel = 0;

  const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function render(q) {
    const hits = q ? INDEX.filter(([n]) => norm(n).includes(norm(q))) : INDEX.slice(0, 8);
    sel = 0;
    list.innerHTML = hits.length
      ? hits.map(([n, href, kind], i) =>
          `<li role="option" aria-selected="${i === 0}"><a href="${href}">${n}<span class="k2">${kind}</span></a></li>`).join('')
      : '<li class="none">Nada com esse nome.</li>';
  }
  function move(delta) {
    const items = list.querySelectorAll('li[role="option"]');
    if (!items.length) return;
    sel = (sel + delta + items.length) % items.length;
    items.forEach((li, i) => li.setAttribute('aria-selected', i === sel ? 'true' : 'false'));
    items[sel].scrollIntoView({ block: 'nearest' });
  }
  function open() { render(''); dlg.showModal(); input.value = ''; input.focus(); }

  input.addEventListener('input', () => render(input.value.trim()));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') {
      const a = list.querySelectorAll('li[role="option"]')[sel]?.querySelector('a');
      if (a) location.href = a.href;
    }
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dlg.open ? dlg.close() : open(); }
  });

  document.querySelectorAll('.topbar .search input:not(#q)').forEach((el) => {
    el.addEventListener('focus', () => { el.blur(); open(); });
  });
  document.querySelectorAll('.topbar .search').forEach((el) => {
    const kbd = document.createElement('kbd');
    kbd.textContent = 'Ctrl K';
    el.appendChild(kbd);
  });
})();
