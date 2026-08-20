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
  if (toggle && toggle.closest('.side')) toggle.removeAttribute('style');
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

(function () {
  const KEY = 'gio.rec';
  const read = () => { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const write = (st) => sessionStorage.setItem(KEY, JSON.stringify(st));

  function elapsed(st) {
    const paused = st.pausedMs + (st.paused ? Date.now() - st.pausedAt : 0);
    const t = Math.max(0, Math.floor((Date.now() - st.since - paused) / 1000));
    return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
  }

  const onConsulta = document.body.hasAttribute('data-live-consulta');

  window.gioRec = {
    start(data) {
      write(Object.assign({ nome: '', iniciais: '', modo: 'presencial', vinculada: true,
        since: Date.now(), paused: false, pausedMs: 0, pausedAt: 0 }, data));
      if (!onConsulta) mount();
    },
    stop() { sessionStorage.removeItem(KEY); document.querySelector('.recstrip')?.remove(); },
    pause() {
      const st = read(); if (!st) return;
      if (st.paused) { st.pausedMs += Date.now() - st.pausedAt; st.paused = false; }
      else { st.paused = true; st.pausedAt = Date.now(); }
      write(st);
    },
    get: read,
    elapsed() { const st = read(); return st ? elapsed(st) : '00:00'; },
  };

  function mount() {
    const st = read();
    if (!st) return;
    document.querySelector('.recstrip')?.remove();

    const bar = document.createElement('aside');
    bar.className = 'recstrip';
    bar.setAttribute('aria-label', 'Gravação em andamento');
    bar.innerHTML = '<span class="rec-dot"></span>'
      + '<span class="st"></span><span class="tm">00:00</span>'
      + (st.vinculada
        ? '<span class="who">' + st.nome + '</span><a class="back" href="consulta.html">Voltar para a consulta →</a>'
        : '<input type="text" placeholder="Nome do paciente…" aria-label="Nome do paciente" />'
          + '<button class="back" type="button">Vincular</button>');
    document.body.appendChild(bar);

    const tm = bar.querySelector('.tm');
    const lbl = bar.querySelector('.st');
    function paint() {
      const cur = read();
      if (!cur) { clearInterval(timer); bar.remove(); return; }
      tm.textContent = elapsed(cur);
      const off = !navigator.onLine;
      bar.dataset.state = off ? 'offline' : (cur.paused ? 'paused' : 'rec');
      lbl.textContent = off ? 'Sem conexão' : (cur.paused ? 'Pausada' : 'Gravando');
    }
    const timer = setInterval(paint, 1000);
    paint();
    addEventListener('online', paint);
    addEventListener('offline', paint);

    const link = bar.querySelector('button.back');
    if (link) link.addEventListener('click', () => {
      const nome = bar.querySelector('input').value.trim();
      if (nome.length < 2) return;
      const cur = read();
      cur.vinculada = true;
      cur.nome = nome;
      cur.iniciais = nome.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
      write(cur);
      clearInterval(timer);
      mount();
    });
  }

  if (!onConsulta) mount();
})();

(function () {
  function mostrar(msg) {
    document.querySelector('.toast')?.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 12.5l5 5L20 7"/></svg><span></span>';
    t.querySelector('span').textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('out'), 4200);
    setTimeout(() => t.remove(), 4700);
  }
  window.gioToast = mostrar;
  window.gioBaixar = (nome) => mostrar(nome + ' foi gerado e baixado.');

  const msg = sessionStorage.getItem('gio.toast');
  if (msg) { sessionStorage.removeItem('gio.toast'); mostrar(msg); }
})();

(function () {
  const KEY = 'gio.consultas';
  const ler = () => { try { return JSON.parse(sessionStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
  window.gioConsultas = {
    ler,
    marcar(paciente, estado) {
      const m = ler();
      m[paciente] = estado;
      sessionStorage.setItem(KEY, JSON.stringify(m));
    },
  };

  const CHIP = {
    done: ['done', 'Concluída'],
    live: ['live', 'Em atendimento'],
    conf: ['conf', 'Confirmada'],
    falta: ['late', 'Faltou'],
  };

  window.gioChip = CHIP;

  const mapa = ler();
  if (!Object.keys(mapa).length) return;
  document.querySelectorAll('.crow').forEach((row) => {
    const nome = row.querySelector('.nm')?.textContent.trim();
    if (!nome || !mapa[nome]) return;
    if (mapa[nome] === 'apagada') { row.remove(); return; }
    const novo = CHIP[mapa[nome]];
    if (!novo) return;
    const chip = row.querySelector('.chip');
    if (chip) { chip.className = 'chip ' + novo[0]; chip.innerHTML = '<i></i>' + novo[1]; }
    row.dataset.estado = mapa[nome];
  });
})();

(function () {
  const linhas = document.querySelectorAll('.panel .crow, .agenda-grid .crow');
  if (!linhas.length) return;

  const ICO = {
    play: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>',
    volta: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 10a6.5 6.5 0 0 0 13 0M12 16.5V21"/></svg>',
    video: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="6" width="12" height="12" rx="2"/><path d="M15 10.5 21 7v10l-6-3.5z"/></svg>',
    casa: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="8" r="3.4"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>',
  };
  const PORVIDEO = ['Camila D.', 'Bruno A.'];

  linhas.forEach((row) => {
    if (row.querySelector('.acao')) return;
    if (!row.querySelector('.time, .hh')) return;
    const nome = row.querySelector('.nm')?.textContent.trim();
    const chip = row.querySelector('.chip');
    if (!nome || !chip) return;
    const rot = chip.textContent.trim().toLowerCase();

    let alvo = row.querySelector('.acts, .go, .chips');
    if (!alvo) {
      alvo = document.createElement('div');
      alvo.className = 'acts';
      chip.parentElement.insertBefore(alvo, chip);
      alvo.appendChild(chip);
    }

    const modo = document.createElement('span');
    modo.className = 'modo';
    const ehVideo = PORVIDEO.includes(nome);
    modo.innerHTML = (ehVideo ? ICO.video : ICO.casa) + (ehVideo ? 'vídeo' : 'presencial');
    alvo.insertBefore(modo, alvo.firstChild);

    const a = document.createElement('a');
    a.className = 'acao';
    if (rot.includes('andamento') || rot.includes('atendimento')) {
      a.classList.add('forte');
      a.href = 'consulta.html';
      a.innerHTML = ICO.volta + 'Voltar para a consulta';
    } else if (rot.includes('confirmada') || rot.includes('agendada')) {
      a.classList.add('forte');
      a.href = 'consulta-inicio.html';
      a.innerHTML = ICO.play + 'Iniciar';
    } else if (rot.includes('concluída')) {
      a.classList.add('fraca');
      a.href = 'prontuario.html';
      a.textContent = 'Ver prontuário';
    } else if (rot.includes('faltou')) {
      a.href = 'nova-consulta.html';
      a.textContent = 'Reagendar';
    } else {
      a.classList.add('fraca');
      a.href = 'paciente-ficha.html?p=' + encodeURIComponent(nome);
      a.textContent = 'Abrir ficha';
    }
    const jaTem = [...alvo.querySelectorAll('a,button')].some((x) => x.textContent.trim() === a.textContent.trim());
    if (!jaTem) alvo.appendChild(a);
  });
})();

(function () {
  const side = document.querySelector('.side');
  const ativo = side && side.querySelector('.nav a.active');
  if (!ativo) return;
  const trazerParaVista = () => {
    if (side.scrollWidth <= side.clientWidth) return;
    const a = ativo.getBoundingClientRect(), s = side.getBoundingClientRect();
    side.scrollLeft += a.left - s.left - (s.width - a.width) / 2;
  };
  trazerParaVista();
  addEventListener('resize', trazerParaVista);
})();

(function () {
  const linhas = document.querySelectorAll('.panel .crow, .agenda-grid .crow');
  if (!linhas.length || !window.gioConsultas) return;

  const ICO = {
    mais: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>',
    falta: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>',
    remarcar: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></svg>',
    apagar: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>',
  };

  const dlg = document.createElement('dialog');
  dlg.className = 'confirm';
  dlg.innerHTML = '<div class="body"><div class="ic">' + ICO.apagar + '</div>'
    + '<h3>Apagar esta consulta?</h3>'
    + '<p id="apagarTx"></p></div>'
    + '<div class="foot"><button class="btn btn-ghost2" type="button" data-fecha>Voltar</button>'
    + '<button class="btn btn-danger" type="button" data-apaga>Apagar</button></div>';
  document.body.appendChild(dlg);
  let alvo = null;

  dlg.querySelector('[data-fecha]').onclick = () => dlg.close();
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.querySelector('[data-apaga]').onclick = () => {
    if (alvo) {
      window.gioConsultas.marcar(alvo.nome, 'apagada');
      alvo.row.remove();
      window.gioToast('Consulta de ' + alvo.nome + ' apagada. O horário volta a ficar livre na agenda.');
      alvo = null;
    }
    dlg.close();
  };

  const fecharMenus = (menos) => document.querySelectorAll('.rowmenu[open]').forEach((m) => { if (m !== menos) m.open = false; });
  document.addEventListener('click', () => fecharMenus(null));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharMenus(null); });

  linhas.forEach((row) => {
    const nome = row.querySelector('.nm')?.textContent.trim();
    const chip = row.querySelector('.chip');
    const alvoActs = row.querySelector('.acts');
    if (!nome || !chip || !alvoActs || row.querySelector('.rowmenu')) return;
    if (!row.querySelector('.time, .hh')) return;

    const menu = document.createElement('details');
    menu.className = 'rowmenu';
    menu.innerHTML = '<summary aria-label="Mais ações para a consulta de ' + nome + '">' + ICO.mais + '</summary>'
      + '<div class="rowmenu-pop" role="menu">'
      + '<button type="button" role="menuitem" data-ato="falta">' + ICO.falta + 'Marcar falta</button>'
      + '<a role="menuitem" href="nova-consulta.html">' + ICO.remarcar + 'Reagendar</a>'
      + '<button type="button" role="menuitem" class="perigo" data-ato="apagar">' + ICO.apagar + 'Apagar consulta</button>'
      + '</div>';
    alvoActs.appendChild(menu);

    menu.addEventListener('toggle', () => { if (menu.open) fecharMenus(menu); });
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
      const b = e.target.closest('[data-ato]');
      if (!b) return;
      menu.open = false;
      if (b.dataset.ato === 'falta') {
        window.gioConsultas.marcar(nome, 'falta');
        const c = window.gioChip.falta;
        chip.className = 'chip ' + c[0];
        chip.innerHTML = '<i></i>' + c[1];
        const acao = row.querySelector('.acao');
        if (acao) { acao.className = 'acao'; acao.href = 'nova-consulta.html'; acao.textContent = 'Reagendar'; }
        window.gioToast(nome + ' não compareceu. A consulta fica no histórico e o horário volta para a agenda.');
      } else {
        alvo = { nome, row };
        const campo = row.querySelector('.time, .hh');
        const hora = campo ? (campo.firstChild?.textContent || campo.textContent).trim() : '';
        dlg.querySelector('#apagarTx').textContent =
          'A consulta de ' + nome + (hora ? ' das ' + hora : '') + ' sai da agenda. O prontuário do paciente não é afetado.';
        dlg.showModal();
      }
    });
  });
})();
