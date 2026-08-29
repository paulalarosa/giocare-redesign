(function () {
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    const dark = theme === 'dark';
    document.querySelectorAll('.lock-light').forEach((el) => { el.hidden = dark; });
    document.querySelectorAll('.lock-dark').forEach((el) => { el.hidden = !dark; });
    const bt = document.getElementById('theme');
    if (bt) bt.setAttribute('aria-label', dark ? 'Mudar para o modo claro' : 'Mudar para o modo escuro');
  }

  let guardado = null;
  try { guardado = localStorage.getItem('gio.tema'); } catch (e) { guardado = null; }
  applyTheme(guardado === 'dark' || guardado === 'light'
    ? guardado
    : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  const toggle = document.getElementById('theme');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const novo = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(novo);
      try { localStorage.setItem('gio.tema', novo); } catch (e) {}
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
    marcarDivisa() {
      const st = read(); if (!st || st.divisa) return;
      st.divisa = true;
      if (!st.paused) { st.paused = true; st.pausedAt = Date.now(); }
      write(st);
      if (!onConsulta) mount();
    },
    retomar() {
      const st = read(); if (!st || !st.paused) return;
      st.pausedMs += Date.now() - st.pausedAt;
      st.paused = false;
      write(st);
    },
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

    const bar = document.createElement(st.vinculada ? 'a' : 'aside');
    bar.className = 'recstrip';
    const eq = '<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
    if (st.vinculada) {
      bar.href = 'consulta.html';
      bar.setAttribute('aria-label', 'Gravação em andamento · voltar para a consulta');
      bar.innerHTML = eq
        + '<span class="rs-tx"><b class="st"></b><span class="who">' + st.nome + '</span></span>'
        + '<span class="tm">00:00</span>'
        + '<button type="button" class="rs-pz" aria-label="Pausar a gravação">' + '<span class="i-off"><svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5v14M15 5v14"/></svg></span>' + '<span class="i-on"><svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5v14l11-7z"/></svg></span>' + '</button>'
        + '<span class="rs-go" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>';
    } else {
      bar.setAttribute('aria-label', 'Gravação em andamento');
      bar.innerHTML = eq
        + '<span class="rs-tx"><b class="st"></b></span>'
        + '<span class="tm">00:00</span>'
        + '<input type="text" placeholder="Nome do paciente…" aria-label="Nome do paciente" />'
        + '<button class="back" type="button">Vincular</button>';
    }
    document.body.appendChild(bar);

    const tm = bar.querySelector('.tm');
    const lbl = bar.querySelector('.st');
    function paint() {
      const cur = read();
      if (!cur) { clearInterval(timer); bar.remove(); return; }
      tm.textContent = elapsed(cur);
      const off = !navigator.onLine;
      if (cur.divisa && cur.paused && !off) {
        bar.dataset.state = 'divisa';
        lbl.textContent = 'Pausada para a análise';
        return;
      }
      bar.dataset.state = off ? 'offline' : (cur.paused ? 'paused' : 'rec');
      lbl.textContent = off ? 'Sem conexão'
        : (cur.paused ? 'Pausada' : (cur.divisa ? 'Gravando a conduta' : 'Gravando'));
      const b = bar.querySelector('.rs-pz');
      if (b) {
        b.setAttribute('aria-pressed', String(!!cur.paused));
        b.setAttribute('aria-label', cur.paused ? 'Retomar a gravação' : 'Pausar a gravação');
      }
    }
    const pz = bar.querySelector('.rs-pz');
    if (pz) pz.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.gioRec.pause();
      paint();
    });
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
  const LAPIS = '<svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
  document.querySelectorAll('.rel').forEach((rel) => {
    const alvo = rel.querySelector('span');
    if (!alvo) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rel-edit';
    btn.setAttribute('aria-label', 'Editar a nota de relacionamento');
    btn.innerHTML = LAPIS;
    const linhas = () => [...alvo.querySelectorAll('.rl')].map((l) => {
      const d = l.querySelector('i');
      return (d ? d.textContent.trim() + '\t' : '\t') + l.lastChild.textContent.trim();
    });
    const hoje = () => {
      const d = new Date();
      return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
    };
    btn.onclick = () => {
      if (rel.querySelector('textarea')) return;
      const campo = document.createElement('textarea');
      campo.value = linhas().map((l) => l.split('\t')[1]).join('\n');
      campo.rows = Math.max(3, linhas().length);
      campo.setAttribute('aria-label', 'Nota de relacionamento, uma lembrança por linha');
      const datas = linhas().map((l) => l.split('\t')[0]);
      alvo.hidden = true;
      rel.insertBefore(campo, btn);
      campo.focus();
      let desistiu = false;
      const fim = () => {
        if (desistiu) { alvo.hidden = false; campo.remove(); return; }
        const novas = campo.value.split('\n').map((t) => t.trim()).filter(Boolean);
        if (novas.length) {
          alvo.innerHTML = novas.map((t, i) =>
            '<span class="rl"><i>' + (datas[i] || hoje()) + '</i>' + t + '</span>').join('');
          window.gioToast(novas.length === 1
            ? 'Nota de relacionamento atualizada.'
            : novas.length + ' lembranças guardadas, cada uma na sua linha.');
        }
        alvo.hidden = false;
        campo.remove();
      };
      campo.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { desistiu = true; campo.blur(); }
      });
      campo.addEventListener('blur', fim);
    };
    rel.appendChild(btn);
  });
})();

(function () {
  const st = window.gioRec.get();
  if (!st || !st.vinculada || document.body.hasAttribute('data-live-consulta')) return;
  const btn = document.querySelector('.topbar a.btn-primary[href="consulta-inicio.html"]');
  if (btn) {
    btn.href = 'consulta.html';
    btn.classList.add('viva');
    btn.setAttribute('aria-label', 'Voltar para a consulta de ' + st.nome);
    btn.innerHTML = '<span class="rec-dot" aria-hidden="true"></span><span class="rot">Voltar para a consulta</span>';
  }
  const menu = document.querySelector('.side .nav a[href="consulta.html"]');
  if (menu) {
    menu.classList.add('viva');
    menu.insertAdjacentHTML('beforeend', '<span class="viva-dot" aria-hidden="true"></span>');
  }
  document.querySelectorAll('.crow').forEach((row) => {
    const nome = row.querySelector('.nm');
    if (nome && nome.textContent.trim() === st.nome) row.classList.add('viva');
  });
})();

(function () {
  const TOM = {
    ok: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 12.5l5 5L20 7"/></svg>',
    neutro: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
    aviso: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
  };
  function mostrar(msg, op) {
    op = op || {};
    const tom = TOM[op.tom] ? op.tom : 'ok';
    document.querySelector('.toast')?.remove();
    const t = document.createElement('div');
    t.className = 'toast' + (tom === 'ok' ? '' : ' ' + tom);
    t.setAttribute('role', 'status');
    t.innerHTML = TOM[tom] + '<span></span>';
    t.querySelector('span').textContent = msg;
    if (op.acao) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'toast-acao';
      b.textContent = op.acao;
      b.onclick = () => { t.remove(); if (op.aoAgir) op.aoAgir(); };
      t.appendChild(b);
    }
    document.body.appendChild(t);
    const vida = op.acao ? 6500 : 4200;
    setTimeout(() => t.classList.add('out'), vida);
    setTimeout(() => t.remove(), vida + 500);
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
    cancelada: ['late', 'Cancelada'],
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

    let alvo = row.querySelector('.acts, .go, .chips, .rt');
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
      a.textContent = 'Abrir prontuário';
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

(function () {
  const side = document.querySelector('.side');
  if (!side) return;

  const CHAVE = 'gio.side';
  const naConsulta = document.body.hasAttribute('data-live-consulta');
  const escolha = localStorage.getItem(CHAVE);
  const raiz = document.documentElement;

  const aplicar = (rail) => {
    raiz.toggleAttribute('data-side', false);
    if (rail) raiz.setAttribute('data-side', 'rail');
    if (botao) {
      botao.setAttribute('aria-expanded', String(!rail));
      botao.setAttribute('aria-label', rail ? 'Expandir o menu lateral' : 'Recolher o menu lateral');
    }
  };

  const marca = side.querySelector('.brand');
  const rodape = side.querySelector('.user');
  if (marca && rodape && !side.querySelector('.side-meio')) {
    const meio = document.createElement('div');
    meio.className = 'side-meio';
    let no = marca.nextSibling;
    while (no && no !== rodape) {
      const prox = no.nextSibling;
      meio.appendChild(no);
      no = prox;
    }
    marca.after(meio);
  }

  side.querySelectorAll('.nav a').forEach((a) => {
    const rot = a.querySelector('span');
    if (rot) a.setAttribute('data-rotulo', rot.textContent.trim());
    if (a.classList.contains('active')) a.setAttribute('aria-current', 'page');
  });

  const meuPerfil = side.querySelector('.u-link');
  if (meuPerfil) {
    meuPerfil.setAttribute('data-rotulo', 'Meu perfil');
    if (/perfil(\.html)?$/.test(location.pathname)) meuPerfil.setAttribute('aria-current', 'page');
  }

  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'side-toggle';
  botao.innerHTML = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M14 6l-6 6 6 6"/></svg>';
  side.appendChild(botao);

  aplicar(escolha ? escolha === 'rail' : naConsulta);

  botao.addEventListener('click', () => {
    const rail = !raiz.hasAttribute('data-side');
    aplicar(rail);
    localStorage.setItem(CHAVE, rail ? 'rail' : 'aberta');
  });
})();

(function () {
  const ESCALA = {
    peso: { ticks: [55, 70, 85, 100, 115, 130, 145, 160, 175], bom: (p) => p >= 85 && p <= 115 },
    musculo: { ticks: [70, 80, 90, 100, 110, 120, 130, 140, 150], bom: (p) => p >= 90 },
    gordura: { ticks: [40, 60, 80, 100, 160, 220, 280, 340, 400], bom: (p) => p <= 160 },
  };
  const TIPOS = { C: 'Tipo C \u00b7 obesidade', I: 'Tipo I \u00b7 padr\u00e3o', D: 'Tipo D \u00b7 atl\u00e9tico' };

  function posicao(escala, pct) {
    const t = escala.ticks;
    const fim = t.length - 1;
    if (pct <= t[0]) return 0;
    if (pct >= t[fim]) return 1;
    for (let i = 0; i < fim; i++) {
      if (pct <= t[i + 1]) return (i + (pct - t[i]) / (t[i + 1] - t[i])) / fim;
    }
    return 1;
  }

  function classificar(musculo, gordura) {
    const d = (musculo - gordura) * 100;
    if (d > 6) return 'D';
    if (d < -6) return 'C';
    return 'I';
  }

  function montar(mg) {
    const barras = [...mg.querySelectorAll('.tr[data-esc]')];
    if (barras.length !== 3) return null;
    const pos = {};
    barras.forEach((tr) => {
      const escala = ESCALA[tr.dataset.esc];
      const pct = parseFloat(tr.dataset.pct);
      pos[tr.dataset.esc] = posicao(escala, pct);
      tr.querySelector('i').style.setProperty('--p', (pos[tr.dataset.esc] * 100).toFixed(2) + '%');
      tr.classList.toggle('bom', escala.bom(pct));

      const val = tr.previousElementSibling;
      if (val && val.classList.contains('val') && !val.querySelector('.pc')) {
        const pc = document.createElement('span');
        pc.className = 'pc';
        pc.textContent = pct + '%';
        val.appendChild(pc);
      }
      const esc = tr.nextElementSibling;
      if (esc && esc.classList.contains('esc') && !esc.childElementCount) {
        escala.ticks.forEach((valor, i) => {
          const t = document.createElement('span');
          t.style.setProperty('--x', ((i / (escala.ticks.length - 1)) * 100).toFixed(2) + '%');
          t.textContent = valor;
          if (i === 0 || i === 3 || i === escala.ticks.length - 1) t.className = 'forte';
          if (valor === 100) t.classList.add('cem');
          esc.appendChild(t);
        });
      }
    });
    return pos;
  }

  const lona = document.createElement('canvas').getContext('2d');
  function alturaDaTinta(letra) {
    const c = getComputedStyle(letra);
    lona.font = c.fontStyle + ' ' + c.fontWeight + ' 100px ' + c.fontFamily;
    const m = lona.measureText(letra.textContent || 'C');
    return (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) / 100;
  }
  function alinhar(mg) {
    const trilho = mg.querySelector('.tr[data-esc]');
    const forma = mg.querySelector('.forma');
    if (!trilho) return;
    const caixa = mg.getBoundingClientRect();
    const r = trilho.getBoundingClientRect();
    if (!r.width) return;
    const esq = (r.left - caixa.left) + 'px';
    const larg = r.width + 'px';
    mg.querySelectorAll('.faixa, .grade, .forma').forEach((el) => {
      el.style.left = esq;
      el.style.width = larg;
    });
    if (!forma) return;
    const base = forma.getBoundingClientRect();
    const pontos = [...mg.querySelectorAll('.tr[data-esc] i')].map((i) => {
      const q = i.getBoundingClientRect();
      return [q.right - base.left, q.top + q.height / 2 - base.top];
    });
    forma.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">'
      + '<polyline points="' + pontos.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ') + '" />'
      + pontos.map((q) => '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="3.4" />').join('')
      + '</svg>';

    const letra = mg.querySelector('.letra');
    if (!letra) return;
    const trilhos = [...mg.querySelectorAll('.tr[data-esc]')].map((t) => t.getBoundingClientRect());
    const bloco = trilhos[trilhos.length - 1].bottom - trilhos[0].top;
    const tinta = alturaDaTinta(letra);
    if (bloco > 0 && tinta > 0) {
      mg.style.setProperty('--lt-bloco', Math.round(bloco * 0.95 / tinta) + 'px');
    }
  }

  function ligar(mg) {
    const pos = montar(mg);
    if (!pos) return;
    const letra = classificar(pos.musculo, pos.gordura);
    const alvo = mg.querySelector('.letra');
    if (alvo) alvo.textContent = letra;
    const nome = mg.parentElement.querySelector('[data-cid-nome]');
    if (nome) nome.textContent = TIPOS[letra];
    const pintar = () => alinhar(mg);
    pintar();
    if (window.ResizeObserver) new ResizeObserver(pintar).observe(mg);
    else addEventListener('resize', pintar);
  }
  document.querySelectorAll('.mg').forEach(ligar);
  window.gioMg = ligar;
})();

(function () {
  function tabsDe(lista) {
    return [...lista.querySelectorAll('[role="tab"]')].filter((t) => !t.hidden);
  }
  function ajustar(lista) {
    if (!lista) return;
    const tabs = tabsDe(lista);
    const ativo = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
    tabs.forEach((t) => t.setAttribute('tabindex', t === ativo ? '0' : '-1'));
  }
  document.addEventListener('keydown', (e) => {
    const tab = e.target.closest && e.target.closest('[role="tab"]');
    if (!tab) return;
    const lista = tab.closest('[role="tablist"]');
    if (!lista) return;
    const PASSO = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const tabs = tabsDe(lista);
    let idx = -1;
    if (PASSO[e.key]) idx = (tabs.indexOf(tab) + PASSO[e.key] + tabs.length) % tabs.length;
    else if (e.key === 'Home') idx = 0;
    else if (e.key === 'End') idx = tabs.length - 1;
    if (idx < 0) return;
    e.preventDefault();
    tabs[idx].click();
    requestAnimationFrame(() => {
      const novos = tabsDe(lista);
      const foco = novos[idx] || novos[0];
      if (foco) foco.focus();
      ajustar(lista);
    });
  });
  document.addEventListener('click', (e) => {
    const tab = e.target.closest && e.target.closest('[role="tab"]');
    if (tab) requestAnimationFrame(() => ajustar(tab.closest('[role="tablist"]')));
  });
  document.querySelectorAll('[role="tablist"]').forEach(ajustar);
})();

(function () {
  window.gioRenomear = function (el, op) {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', op.rotulo);
    const abrir = () => {
      if (el.querySelector('input')) return;
      const antes = el.textContent.trim();
      el.innerHTML = '<input value="' + antes.replace(/"/g, '&quot;') + '" aria-label="' + op.campo + '" />';
      const inp = el.querySelector('input');
      inp.focus(); inp.select();
      const fim = () => {
        const v = inp.value.trim() || antes;
        el.textContent = v;
        if (v !== antes) window.gioToast(op.aviso);
      };
      inp.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') fim();
        if (ev.key === 'Escape') el.textContent = antes;
        ev.stopPropagation();
      });
      inp.addEventListener('blur', fim);
    };
    el.addEventListener('click', abrir);
    el.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); abrir(); }
    });
  };

  window.gioConfirmar = function (host, op) {
    if (host.querySelector('.' + op.classe)) return;
    const conf = document.createElement('div');
    conf.className = op.classe;
    conf.innerHTML = '<span>' + op.pergunta + '</span>'
      + '<button type="button" class="btn btn-danger btn-sm" data-sim>' + op.rotulo + '</button>'
      + '<button type="button" class="btn btn-soft btn-sm" data-nao>Cancelar</button>';
    conf.querySelector('[data-nao]').onclick = () => conf.remove();
    conf.querySelector('[data-sim]').onclick = () => op.aoConfirmar(conf);
    host.appendChild(conf);
    conf.querySelector('[data-nao]').focus();
  };

  window.gioRemover = function (no, op) {
    const pai = no.parentElement;
    const ancora = no.previousElementSibling;
    if (op.junto) op.junto.remove();
    no.remove();
    window.gioToast(op.msg, {
      tom: 'neutro', acao: 'Desfazer',
      aoAgir: () => {
        if (ancora && ancora.parentElement === pai) ancora.after(no);
        else pai.prepend(no);
        if (op.junto) no.after(op.junto);
        window.gioToast(op.msgVolta);
      },
    });
  };
})();

(function () {
  window.gioAranha = function (caixa, itens, op) {
    op = op || {};
    var cx = 150, cy = 128, R = 96, N = itens.length;
    function ponto(i, f) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / N;
      return [cx + Math.cos(ang) * R * f, cy + Math.sin(ang) * R * f];
    }
    function malha(f) {
      return itens.map(function (_, i) {
        return ponto(i, f).map(function (v) { return v.toFixed(1); }).join(',');
      }).join(' ');
    }
    var h = '<svg viewBox="0 0 300 260" role="img" aria-label="' + (op.alt || 'Mapa ABCDEFS') + '">';
    [0.33, 0.66, 1].forEach(function (f) { h += '<polygon class="anel" points="' + malha(f) + '"/>'; });
    itens.forEach(function (_, i) {
      var p = ponto(i, 1);
      h += '<line class="eixo" x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '"/>';
    });
    h += '<polygon class="area" points="' + itens.map(function (it, i) {
      return ponto(i, it.fracao).map(function (v) { return v.toFixed(1); }).join(',');
    }).join(' ') + '"/>';
    itens.forEach(function (it, i) {
      var p = ponto(i, it.fracao);
      h += '<circle class="no' + (it.baixo ? ' baixo' : '') + '" data-abc="' + it.letra.toLowerCase() + '" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (it.baixo ? 4.4 : 3.4) + '"><title>' + (it.titulo || it.letra) + '</title></circle>';
    });
    itens.forEach(function (it, i) {
      var p = ponto(i, 1.16);
      h += '<text class="lt3" data-abc="' + it.letra.toLowerCase() + '" x="' + p[0].toFixed(1) + '" y="' + (p[1] + 4).toFixed(1) + '">' + it.letra + '</text>';
    });
    h += '</svg>';
    if (op.legenda) h += '<p class="legenda">' + op.legenda + '</p>';
    caixa.innerHTML = h;
  };
})();

(function () {
  var FRACOES = [[0.5, 'metade do prato'], [1 / 3, 'um terço'], [0.25, 'um quarto'], [1 / 6, 'um sexto'], [2 / 3, 'dois terços'], [0.75, 'três quartos']];
  function nomeFracao(f) {
    var melhor = null;
    FRACOES.forEach(function (par) {
      var d = Math.abs(f - par[0]);
      if (d <= 0.045 && (!melhor || d < melhor.d)) melhor = { d: d, n: par[1] };
    });
    return melhor ? melhor.n : Math.round(f * 100) + '%';
  }

  window.gioPratoRefeicao = function (caixa, prato, op) {
    op = op || {};
    var total = prato.fatias.reduce(function (soma, f) { return soma + f.peso; }, 0);
    var cx = 80, cy = 80, R = 62;
    var svg = '<svg class="pr-svg" viewBox="0 0 160 160" role="img" aria-label="'
      + (op.alt || 'Prato do ' + prato.titulo) + '">';
    svg += '<circle class="pr-aro" cx="80" cy="80" r="74"/>';
    if (prato.fatias.length === 1) {
      svg += '<circle class="pr-fatia g-' + prato.fatias[0].grupo + '" cx="80" cy="80" r="' + R + '"/>';
    } else {
      var ang = -Math.PI / 2;
      prato.fatias.forEach(function (f) {
        var arco = f.peso / total * 2 * Math.PI;
        var x1 = cx + Math.cos(ang) * R, y1 = cy + Math.sin(ang) * R;
        var x2 = cx + Math.cos(ang + arco) * R, y2 = cy + Math.sin(ang + arco) * R;
        svg += '<path class="pr-fatia g-' + f.grupo + '" d="M' + cx + ' ' + cy
          + ' L' + x1.toFixed(1) + ' ' + y1.toFixed(1)
          + ' A' + R + ' ' + R + ' 0 ' + (arco > Math.PI ? 1 : 0) + ' 1 '
          + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' Z"><title>'
          + f.nome + ' · ' + nomeFracao(f.peso / total) + '</title></path>';
        ang += arco;
      });
    }
    svg += '</svg>';

    var leg = prato.fatias.map(function (f, i) {
      return '<li class="g-' + f.grupo + '" data-fatia="' + i + '"><span class="pt-cor"></span>'
        + '<span class="pt-nome">' + f.nome + '</span>'
        + '<span class="pt-fr">' + nomeFracao(f.peso / total) + '</span>'
        + (op.editavel
          ? '<span class="pr-step"><button type="button" data-menos aria-label="Diminuir ' + f.nome + ' no prato">−</button>'
            + '<button type="button" data-mais aria-label="Aumentar ' + f.nome + ' no prato">+</button></span>'
          : '')
        + '</li>';
    }).join('');

    caixa.innerHTML = '<div class="pr-disco">' + svg + '</div>'
      + '<div class="pr-info"><span class="pr-tit">' + prato.titulo + '</span><ul class="pr-leg">' + leg + '</ul></div>';
  };
})();

(function () {
  const side = document.querySelector('.side');
  if (!side) return;
  const links = [...side.querySelectorAll('.nav a')];
  if (links.length < 7) return;

  const PRINCIPAIS = ['consulta.html', 'agenda.html', 'pacientes.html', 'exames.html'];
  const alvo = (a) => (a.getAttribute('href') || '').split('/').pop();
  const guardados = links.filter((a) => !PRINCIPAIS.includes(alvo(a)));
  if (!guardados.length) return;

  const folha = document.createElement('div');
  folha.className = 'mais-folha';
  folha.id = 'maisFolha';
  folha.hidden = true;
  folha.innerHTML = '<div class="mf-caixa" role="menu" aria-label="Outras áreas">'
    + guardados.map((a) => '<a role="menuitem" href="' + a.getAttribute('href') + '"'
        + (a.classList.contains('active') ? ' aria-current="page"' : '') + '>'
        + a.querySelector('svg').outerHTML
        + '<span>' + a.querySelector('span').textContent + '</span></a>').join('')
    + '</div>';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'mais-btn';
  btn.id = 'maisBtn';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'maisFolha');
  btn.setAttribute('aria-label', 'Outras áreas');
  btn.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">'
    + '<circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg>';
  if (guardados.some((a) => a.classList.contains('active'))) btn.classList.add('tem-ativo');

  side.appendChild(btn);
  document.body.appendChild(folha);

  const abrir = (sim) => {
    folha.hidden = !sim;
    btn.setAttribute('aria-expanded', String(sim));
    document.body.classList.toggle('mais-aberto', sim);
  };
  btn.addEventListener('click', (e) => { e.stopPropagation(); abrir(folha.hidden); });
  folha.addEventListener('click', (e) => { if (e.target === folha) abrir(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !folha.hidden) abrir(false); });
})();

(function () {
  const raiz = document.documentElement;
  const alvo = () => document.querySelector('.actbar:not([hidden])') || document.querySelector('.recstrip');
  function medir() {
    const el = alvo();
    if (!el) { raiz.style.removeProperty('--piso'); return; }
    const r = el.getBoundingClientRect();
    if (!r.height) { raiz.style.removeProperty('--piso'); return; }
    raiz.style.setProperty('--piso', Math.round(innerHeight - r.top) + 'px');
  }
  medir();
  addEventListener('resize', medir);
  if (window.ResizeObserver) {
    const olho = new ResizeObserver(medir);
    const liga = () => { const el = alvo(); if (el) olho.observe(el); };
    liga();
    new MutationObserver(liga).observe(document.body, { childList: true, subtree: false });
  }
  const antes = window.gioToast;
  if (typeof antes === 'function') {
    window.gioToast = function (msg, op) { medir(); return antes(msg, op); };
  }
})();
