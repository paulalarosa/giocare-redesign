const drop = document.getElementById('drop');
const fileIn = document.getElementById('fileIn');
const dropOut = document.getElementById('dropOut');
const DATA_CONSULTA = new Date(2026, 6, 21);
const TIPOS = {
  lab: { nome: 'Laboratório', letra: 'B' },
  bio: { nome: 'Bioimpedância', letra: 'C' },
  img: { nome: 'Imagem', letra: 'B' },
};
const LIMITE = 20 * 1048576;

drop.onclick = () => fileIn.click();
['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => { if (e.dataTransfer.files.length) receber([...e.dataTransfer.files]); });
fileIn.addEventListener('change', () => { if (fileIn.files.length) receber([...fileIn.files]); });

function palpite(nome) {
  const n = nome.toLowerCase();
  if (/inbody|bioimped|composic|bia/.test(n)) return 'bio';
  if (/ultrass|raio|rx|tomog|resson|densitom|ecog/.test(n)) return 'img';
  return 'lab';
}

let fila = [];

function receber(arquivos) {
  const inicio = fila.length;
  arquivos.forEach((f) => fila.push({
    file: f, tipo: palpite(f.name), estado: 'espera',
    grande: f.size > LIMITE,
    futuro: new Date(f.lastModified) > DATA_CONSULTA,
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
      fila[+sel.dataset.i].tipo = sel.value;
      desenhar();
    };
  });
}

function linha(item, i) {
  const t = TIPOS[item.tipo];
  const mb = (item.file.size / 1048576).toFixed(1).replace('.', ',');
  let sub = mb + ' MB';
  if (item.estado === 'falhou') sub = item.grande ? 'acima de 20 MB: reduza ou envie por página' : 'não consegui ler este arquivo';
  else if (item.estado === 'pronto') sub = 'lido · alimenta o <b>' + t.letra + '</b> do prontuário';
  else if (item.estado === 'lendo') sub = 'a IA está lendo…';
  if (item.futuro && item.estado !== 'falhou') sub += ' · <span style="color:var(--warning-text)">data posterior à consulta</span>';

  const marca = item.estado === 'pronto'
    ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M4 12.5l5 5L20 7"/></svg>'
    : item.estado === 'falhou'
      ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6 6 18"/></svg>'
      : '';

  return '<div class="fq" data-st="' + item.estado + '">'
    + '<span class="st">' + marca + '</span>'
    + '<div style="min-width:0"><div class="nm2">' + item.file.name + '</div><div class="mt2">' + sub + '</div></div>'
    + '<select data-i="' + i + '" aria-label="Tipo do exame">'
    + Object.keys(TIPOS).map((k) => '<option value="' + k + '"' + (k === item.tipo ? ' selected' : '') + '>' + TIPOS[k].nome + '</option>').join('')
    + '</select>'
    + '<span class="fed2">→ ' + t.letra + '</span>'
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
    item.estado = 'pronto';
    desenhar();
    processar(i + 1);
  }, 1400);
}

const addBtn = [...document.querySelectorAll('.topbar button')].find((b) => /Adicionar exame/.test(b.textContent));
if (addBtn) addBtn.onclick = () => { drop.scrollIntoView({ block: 'center', behavior: 'smooth' }); fileIn.click(); };

const vdAna = document.getElementById('vdAna');
vdAna.querySelector('[data-exam-act="retry"]').onclick = () => {
  vdAna.dataset.ai = 'processing';
  setTimeout(() => {
    vdAna.dataset.ai = 'ready';
    const chip = document.getElementById('vdChip');
    chip.className = 'chip done';
    chip.style.fontSize = '12px';
    chip.innerHTML = '<i></i>Analisado';
  }, 2200);
};

(function () {
  const lista = document.querySelector('.plist');
  if (!lista) return;
  const sw = document.createElement('div');
  sw.className = 'swap';
  sw.setAttribute('role', 'tablist');
  sw.style.margin = '0 0 12px';
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
      row.style.display = ok ? '' : 'none';
      const ana = row.nextElementSibling;
      if (ana && ana.classList.contains('exam-ana')) ana.style.display = ok ? '' : 'none';
    });
  });
})();
