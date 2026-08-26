document.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const nome = b.closest('.prow, .crow')?.querySelector('.nm')?.textContent.trim() || 'o paciente';
  if (b.dataset.acao === 'exportar') {
    window.gioBaixar('Planilha de julho de 2026');
  } else if (b.classList.contains('remind')) {
    b.disabled = true;
    window.gioToast('Cobrança enviada para ' + nome + ' pelo WhatsApp.');
  } else if (b.classList.contains('paybtn')) {
    const linha = b.closest('.prow, .crow');
    const chip = linha?.querySelector('.chip');
    if (chip) { chip.className = 'chip paid'; chip.innerHTML = '<i></i>Pago'; }
    b.remove();
    window.gioToast('Pagamento de ' + nome + ' registrado.');
  }
});

const dados = {
  7: [
    { p:"Marina T.", dc:"03/07", v:220, st:"paid", m:"PIX", dp:"03/07" },
    { p:"Rafael N.", dc:"05/07", v:260, st:"paid", m:"Cartão crédito", dp:"05/07" },
    { p:"Paulo R.", dc:"10/07", v:300, st:"pend", m:"–", dp:"–" },
    { p:"Helena M.", dc:"11/07", v:240, st:"paid", m:"Transferência", dp:"12/07" },
    { p:"Camila D.", dc:"14/07", v:220, st:"pend", m:"–", dp:"–" },
    { p:"Bruno A.", dc:"18/07", v:320, st:"paid", m:"PIX", dp:"18/07" },
    { p:"Letícia S.", dc:"21/07", v:200, st:"pend", m:"–", dp:"–" },
  ],
  6: [
    { p:"André C.", dc:"04/06", v:240, st:"paid", m:"PIX", dp:"04/06" },
    { p:"Juliana F.", dc:"12/06", v:260, st:"paid", m:"Dinheiro", dp:"12/06" },
    { p:"Gustavo L.", dc:"19/06", v:300, st:"paid", m:"Cartão débito", dp:"19/06" },
    { p:"Patrícia R.", dc:"26/06", v:220, st:"pend", m:"–", dp:"–" },
  ],
  5: [
    { p:"Diego F.", dc:"08/05", v:280, st:"paid", m:"PIX", dp:"08/05" },
    { p:"Marina T.", dc:"20/05", v:220, st:"paid", m:"Transferência", dp:"21/05" },
  ],
};
const brl = n => "R$ " + n.toLocaleString("pt-BR") + ",00";
const nomeMes = { 7:"julho", 6:"junho", 5:"maio" };
const fbody = document.getElementById('fbody');

function render(mes, filtroTexto=""){
  const rows = (dados[mes]||[]).filter(r => r.p.toLowerCase().includes(filtroTexto.toLowerCase()));
  fbody.innerHTML = "";
  rows.forEach(r=>{
    const div=document.createElement('div'); div.className='frow';
    const acao = r.st==='pend'
      ? `<span class="fr-acoes"><button class="remind" title="Cobrar no WhatsApp"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 21l2-5.4A8.5 8.5 0 1 1 21 11.5z"/></svg>Cobrar</button><button class="paybtn">Marcar pago</button></span>`
      : `<span class="done-mark">Quitado</span>`;
    div.innerHTML=`
      <div class="pac">${r.p}</div>
      <div class="mono-c dataco">${r.dc}</div>
      <div class="val">${brl(r.v)}</div>
      <span class="chip ${r.st==='paid'?'paid':'pend'}"><i></i>${r.st==='paid'?'Pago':'Pendente'}</span>
      <div class="mono-c metodo">${r.m}</div>
      <div class="mono-c datapg">${r.dp}</div>
      <div class="act">${acao}</div>`;
    fbody.appendChild(div);
  });

  document.getElementById('periodo').textContent = `referente a ${nomeMes[mes]} de 2026`;
}
render(7);

document.getElementById('mes').addEventListener('change', e=> render(e.target.value, document.getElementById('q').value));
document.getElementById('q').addEventListener('input', e=> render(document.getElementById('mes').value, e.target.value));

fbody.addEventListener('click', e=>{
  const b=e.target.closest('.paybtn'); if(!b) return;
  const row=b.closest('.frow');
  row.querySelector('.chip').outerHTML = '<span class="chip paid"><i></i>Pago</span>';
  row.querySelector('.act').innerHTML = '<span class="done-mark">Quitado</span>';
});

(function () {
  const lista = document.getElementById('fbody');
  if (!lista) return;
  const sw = document.createElement('div');
  sw.className = 'swap';
  sw.setAttribute('role', 'tablist');
  sw.innerHTML = '<button type="button" role="tab" data-v="todos" aria-selected="true">Todos</button>'
    + '<button type="button" role="tab" data-v="pend" aria-selected="false">Pendentes</button>'
    + '<button type="button" role="tab" data-v="paid" aria-selected="false">Pagos</button>';
  const card = lista.closest('.card');
  card.parentElement.insertBefore(sw, card);
  sw.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    sw.querySelectorAll('button').forEach((o) => o.setAttribute('aria-selected', String(o === b)));
    lista.querySelectorAll('.frow').forEach((row) => {
      const chip = row.querySelector('.chip');
      const ok = b.dataset.v === 'todos'
        || (b.dataset.v === 'pend' && chip?.classList.contains('pend'))
        || (b.dataset.v === 'paid' && chip?.classList.contains('paid'));
      row.hidden = !ok;
    });
  });
})();
