const drop = document.getElementById('drop');
const fileIn = document.getElementById('fileIn');
const dropOut = document.getElementById('dropOut');
const TIPOS = {
  lab: { nome: 'Laboratório', letra: 'B' },
  bio: { nome: 'Bioimpedância', letra: 'C' },
  dexa: { nome: 'Densitometria (DEXA)', letra: 'C' },
  img: { nome: 'Imagem', letra: 'B' },
  outro: { nome: 'Outro', letra: 'B' },
};
const PACIENTES = ['Marina T.', 'Paulo R.', 'Rafael N.', 'Camila D.', 'Bruno A.', 'Letícia S.'];
const LIMITE = 20 * 1048576;

drop.onclick = () => fileIn.click();
['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => { if (e.dataTransfer.files.length) receber([...e.dataTransfer.files]); });
fileIn.addEventListener('change', () => { if (fileIn.files.length) receber([...fileIn.files]); });

function palpite(nome) {
  const n = nome.toLowerCase();
  if (/inbody|bioimped|composic|bia/.test(n)) return 'bio';
  if (/dexa|densitom/.test(n)) return 'dexa';
  if (/ultrass|raio|rx|tomog|resson|ecog/.test(n)) return 'img';
  if (/hemogram|lipid|vitamin|tsh|t4|glic|ferritin|sangue|soro|lab|exame/.test(n)) return 'lab';
  return null;
}

function bonito(nome) {
  const semExt = nome.replace(/\.[a-z0-9]+$/i, '').replace(/[-_.]+/g, ' ').replace(/\s+/g, ' ').trim();
  return semExt ? semExt[0].toUpperCase() + semExt.slice(1) : 'Laudo sem nome';
}

function achaPaciente(nome) {
  const n = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return PACIENTES.find((p) => n.includes(p.split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) || null;
}

let fila = [];

function receber(arquivos) {
  if (fila.length && fila.every((i) => i.estado === 'pronto' || i.estado === 'falhou')) fila = [];
  const inicio = fila.length;
  arquivos.forEach((f) => fila.push({
    file: f, tipo: palpite(f.name), estado: 'espera',
    grande: f.size > LIMITE, paciente: achaPaciente(f.name),
  }));
  desenhar();
  processar(inicio);
}

function desenhar() {
  const prontos = fila.filter((i) => i.estado === 'pronto').length;
  const lendo = fila.findIndex((i) => i.estado === 'lendo');
  dropOut.innerHTML = '<div class="fila">'
    + '<div class="fh"><span class="t">' + fila.length + (fila.length === 1 ? ' laudo' : ' laudos') + ' nesta remessa</span>'
    + '<span class="pg">' + (lendo > -1 ? 'lendo ' + (lendo + 1) + ' de ' + fila.length : prontos + ' de ' + fila.length + ' prontos') + '</span></div>'
    + fila.map(linha).join('')
    + (fila.every((i) => i.estado === 'pronto' || i.estado === 'falhou') ? resumo() : '')
    + '</div>';
  dropOut.querySelectorAll('select').forEach((sel) => {
    sel.onchange = () => {
      if (!sel.value) return;
      const item = fila[+sel.dataset.i];
      const primeiro = !item.tipo;
      item.tipo = sel.value;
      if (item.estado === 'duvida') {
        item.estado = 'pronto';
        inserirNaLista(item);
        window.gioToast(TIPOS[item.tipo].nome + ' registrado. O laudo entrou na lista e alimenta o ' + TIPOS[item.tipo].letra + '.');
      } else if (item.linha && !primeiro) {
        atualizarTipoNaLista(item);
      }
      desenhar();
    };
  });
}

function linha(item, i) {
  const t = TIPOS[item.tipo];
  const mb = (item.file.size / 1048576).toFixed(1).replace('.', ',');
  let sub = mb + ' MB';
  if (item.estado === 'falhou') sub = item.grande ? 'acima de 20 MB: reduza ou envie por página' : 'não consegui ler este arquivo';
  else if (item.estado === 'duvida') sub = 'não reconheci o tipo deste exame: escolha na lista, ou marque Outro';
  else if (item.estado === 'pronto') sub = 'lido · na lista abaixo · alimenta o <b>' + t.letra + '</b> do prontuário';
  else if (item.estado === 'lendo') sub = 'a IA está lendo…';

  const marca = item.estado === 'pronto'
    ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M4 12.5l5 5L20 7"/></svg>'
    : item.estado === 'falhou'
      ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6 6 18"/></svg>'
      : item.estado === 'duvida'
        ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5h.01"/></svg>'
        : '';

  return '<div class="fq" data-st="' + item.estado + '">'
    + '<span class="st">' + marca + '</span>'
    + '<div class="fq-meio"><div class="nm2">' + item.file.name + '</div><div class="mt2">' + sub + '</div></div>'
    + '<select data-i="' + i + '" aria-label="Tipo do exame">'
    + (item.tipo ? '' : '<option value="" selected>escolha o tipo…</option>')
    + Object.keys(TIPOS).map((k) => '<option value="' + k + '"' + (k === item.tipo ? ' selected' : '') + '>' + TIPOS[k].nome + '</option>').join('')
    + '</select>'
    + '<span class="fed2">' + (t ? '→ ' + t.letra : '→ ?') + '</span>'
    + '</div>';
}

function resumo() {
  const ok = fila.filter((i) => i.estado === 'pronto');
  const falhos = fila.filter((i) => i.estado === 'falhou');
  const porLetra = {};
  ok.forEach((i) => { const l = TIPOS[i.tipo].letra; (porLetra[l] = porLetra[l] || []).push(i); });
  const letras = Object.keys(porLetra).sort();
  let h = '<div class="resumo">';
  if (!ok.length) h += 'Nenhum laudo entrou no prontuário.';
  else h += '<b>' + ok.length + (ok.length === 1 ? ' laudo lido' : ' laudos lidos') + '</b> · '
    + letras.map((l) => porLetra[l].length + ' no ' + l).join(' · ')
    + '. Os valores entram no prontuário depois que você confirmar.';
  if (falhos.length) h += '<br />' + falhos.length + (falhos.length === 1 ? ' arquivo ficou de fora.' : ' arquivos ficaram de fora.');
  letras.forEach((l) => {
    if (porLetra[l].length < 2) return;
    h += '<div class="dup"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 9v4M12 17h.01M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>'
      + '<span>' + porLetra[l].length + ' laudos alimentam o <b>' + l + '</b>. Vale o mais recente; os outros ficam no histórico do paciente, sem sumir.</span></div>';
  });
  h += '</div>';
  return h;
}

function processar(i) {
  if (i >= fila.length) { desenhar(); return; }
  const item = fila[i];
  if (item.grande) { item.estado = 'falhou'; desenhar(); return processar(i + 1); }
  item.estado = 'lendo';
  desenhar();
  setTimeout(() => {
    if (item.tipo) {
      item.estado = 'pronto';
      inserirNaLista(item);
    } else {
      item.estado = 'duvida';
    }
    desenhar();
    processar(i + 1);
  }, 1400);
}

const lista = document.querySelector('.plist');
const cabecaLista = lista.querySelector('.head');

const INICIAIS = (nome) => nome.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const DEMO_BIO = [
  ['peso', 118], ['musculo', 96], ['gordura', 168],
];

function atualizarTipoNaLista(item) {
  const t = TIPOS[item.tipo];
  const em = item.linha.querySelector('.who .em');
  em.innerHTML = t.nome + ' · alimenta o <b>' + t.letra + '</b>';
  const chip = item.linha.querySelector('.chip.tipo');
  if (chip) chip.textContent = t.nome.toLowerCase();
  window.gioToast('Tipo corrigido para ' + t.nome.toLowerCase() + '. Passa a alimentar o ' + t.letra + '.');
}

function inserirNaLista(item) {
  const t = TIPOS[item.tipo];
  const nome = bonito(item.file.name);
  const temPac = !!item.paciente;
  const row = document.createElement('div');
  row.className = 'prow nova';
  row.innerHTML = '<div class="av">' + (temPac ? INICIAIS(item.paciente) : '··') + '</div>'
    + '<div class="who"><div class="nm">' + nome + '</div><div class="em">' + t.nome + ' · alimenta o <b>' + t.letra + '</b></div></div>'
    + '<div class="cell">' + (temPac ? item.paciente
      : '<select class="vincula" aria-label="Vincular paciente"><option value="" selected>vincular paciente…</option>'
        + PACIENTES.map((p) => '<option>' + p + '</option>').join('') + '</select>') + '</div>'
    + '<div class="cell faint">21/07</div>'
    + '<div class="acts">' + (t.letra === 'C' ? '<span class="chip tipo">' + t.nome.toLowerCase() + '</span>' : '')
    + '<span class="chip live"><i></i>Novo laudo</span><a href="#" target="_blank" rel="noopener">PDF ↗</a></div>';
  cabecaLista.after(row);
  item.linha = row;

  const vinc = row.querySelector('.vincula');
  if (vinc) vinc.onchange = () => {
    if (!vinc.value) return;
    item.paciente = vinc.value;
    row.querySelector('.av').textContent = INICIAIS(vinc.value);
    vinc.closest('.cell').textContent = vinc.value;
    const ft = row.nextElementSibling;
    if (ft && ft.classList.contains('exam-ana')) {
      const rodape = ft.querySelector('.ft');
      if (rodape) rodape.innerHTML = 'Alimenta o bloco <b>' + t.letra + '</b> · ' + item.paciente + ' · <a href="paciente-ficha.html">ver no prontuário →</a>';
    }
    window.gioToast('Laudo vinculado a ' + item.paciente + '. Alimenta o ' + t.letra + ' do prontuário.');
  };

  if (item.tipo === 'bio' || item.tipo === 'dexa') {
    const ana = document.createElement('div');
    ana.className = 'exam-ana';
    ana.innerHTML = '<div class="hd"><span class="ai-tag"><svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15.5l-1.9-4.6L5.5 9l4.6-1.4z"/></svg>análise da IA</span></div>'
      + '<p>Análise músculo-gordura lida do laudo, nas escalas do próprio aparelho. A letra sai do formato das barras.</p>'
      + '<div class="mg-cap"><span class="k">CID · tipo corporal InBody</span><b data-cid-nome></b></div>'
      + '<div class="mg">'
      + '<span class="faixa" aria-hidden="true"><span>abaixo</span><span>normal</span><span>acima</span></span>'
      + '<span class="grade" aria-hidden="true"></span>'
      + '<span class="rot">Peso</span><span class="val">96,4<small> kg</small></span><span class="tr" data-esc="peso" data-pct="' + DEMO_BIO[0][1] + '"><i></i></span><span class="esc"></span>'
      + '<span class="rot">Massa muscular esquelética</span><span class="val">33,1<small> kg</small></span><span class="tr" data-esc="musculo" data-pct="' + DEMO_BIO[1][1] + '"><i></i></span><span class="esc"></span>'
      + '<span class="rot">Massa de gordura</span><span class="val">24,8<small> kg</small></span><span class="tr" data-esc="gordura" data-pct="' + DEMO_BIO[2][1] + '"><i></i></span><span class="esc"></span>'
      + '<span class="forma" aria-hidden="true"></span>'
      + '<span class="letra" aria-hidden="true"></span>'
      + '</div>'
      + '<div class="ft">Alimenta o bloco <b>C</b> · composição corporal' + (temPac ? ' · ' + item.paciente + ' · <a href="paciente-ficha.html">ver no prontuário →</a>' : ' · vincule o paciente para entrar no prontuário') + '</div>';
    row.after(ana);
    if (window.gioMg) window.gioMg(ana.querySelector('.mg'));
  }

  armarLinha(row);
  row.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function armarLinha(row) {
  const nm = row.querySelector('.who .nm');
  window.gioRenomear(nm, { rotulo: 'Corrigir o nome do exame', campo: 'Nome do exame', aviso: 'Nome do exame corrigido.' });

  const acts = row.querySelector('.acts');
  if (!acts || acts.querySelector('.rm-exame')) return;
  const rm = document.createElement('button');
  rm.type = 'button';
  rm.className = 'rm-exame';
  rm.setAttribute('aria-label', 'Excluir este exame');
  rm.innerHTML = '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13"/><path d="M10 11v5M14 11v5"/></svg>';
  rm.onclick = () => {
    window.gioConfirmar(row, {
      classe: 'prow-conf',
      pergunta: 'Excluir este exame? O laudo sai da lista e do prontuário do paciente.',
      rotulo: 'Excluir',
      aoConfirmar: (conf) => {
        const nome = nm.textContent.trim();
        const ana = row.nextElementSibling && row.nextElementSibling.classList.contains('exam-ana')
          ? row.nextElementSibling : null;
        conf.remove();
        window.gioRemover(row, {
          junto: ana,
          msg: nome + ' saiu da lista e do prontuário do paciente.',
          msgVolta: nome + ' voltou para a lista.',
        });
      },
    });
  };
  acts.appendChild(rm);
}

document.querySelectorAll('.plist .prow').forEach(armarLinha);

const addBtn = document.querySelector('[data-acao="add-exame"]');
if (addBtn) addBtn.onclick = () => { drop.scrollIntoView({ block: 'center', behavior: 'smooth' }); fileIn.click(); };

const vdAna = document.getElementById('vdAna');
vdAna.querySelector('[data-exam-act="retry"]').onclick = () => {
  vdAna.dataset.ai = 'processing';
  setTimeout(() => {
    vdAna.dataset.ai = 'ready';
    const chip = document.getElementById('vdChip');
    chip.className = 'chip done';
    chip.innerHTML = '<i></i>Analisado';
  }, 2200);
};

(function () {
  const lista = document.querySelector('.plist');
  if (!lista) return;
  const sw = document.createElement('div');
  sw.className = 'swap';
  sw.setAttribute('role', 'tablist');
  sw.innerHTML = '<button type="button" role="tab" data-v="todos" aria-selected="true">Todos</button>'
    + '<button type="button" role="tab" data-v="novo" aria-selected="false">Precisam de você</button>'
    + '<button type="button" role="tab" data-v="done" aria-selected="false">Analisados</button>';
  lista.parentElement.insertBefore(sw, lista);
  sw.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    sw.querySelectorAll('button').forEach((o) => o.setAttribute('aria-selected', String(o === b)));
    lista.querySelectorAll('.prow').forEach((row) => {
      const done = !!row.querySelector('.chip.done');
      const ok = b.dataset.v === 'todos' || (b.dataset.v === 'done' ? done : !done);
      row.hidden = !ok;
      const ana = row.nextElementSibling;
      if (ana && ana.classList.contains('exam-ana')) ana.hidden = !ok;
    });
    const visiveis = lista.querySelectorAll('.prow:not([hidden])').length;
    let vz = lista.querySelector('.vazio');
    if (!visiveis) {
      if (!vz) { vz = document.createElement('p'); vz.className = 'vazio'; lista.appendChild(vz); }
      vz.textContent = b.dataset.v === 'done'
        ? 'Nenhum laudo analisado por enquanto.'
        : 'Nenhum laudo esperando por você.';
    } else if (vz) { vz.remove(); }
  });
})();

document.querySelectorAll('.plist .acts a[data-acao="pdf"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const row = a.closest('.prow');
    window.gioBaixar('Laudo · ' + row.querySelector('.nm').textContent.trim());
  });
});
