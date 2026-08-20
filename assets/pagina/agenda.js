const cal = document.querySelector('.cal');
const rotulo = document.querySelector('.calhead b, .calhead span, .cal-title');
const MES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
let mesAtual = 6, anoAtual = 2026;
const setas = document.querySelectorAll('[aria-label="Mês anterior"], [aria-label="Próximo mês"]');
setas.forEach((b) => {
  b.onclick = () => {
    mesAtual += b.getAttribute('aria-label') === 'Mês anterior' ? -1 : 1;
    if (mesAtual < 0) { mesAtual = 11; anoAtual--; }
    if (mesAtual > 11) { mesAtual = 0; anoAtual++; }
    const alvo = document.querySelector('.cal-mes, .calhead strong, .calhead b');
    if (alvo) alvo.textContent = MES[mesAtual] + ' ' + anoAtual;
    window.gioToast('Agenda de ' + MES[mesAtual] + ' de ' + anoAtual + '.');
  };
});
document.querySelectorAll('.remind').forEach((b) => {
  b.onclick = () => {
    const nome = b.closest('.crow')?.querySelector('.nm')?.textContent.trim() || 'o paciente';
    b.disabled = true;
    window.gioToast('Lembrete enviado para ' + nome + '.');
  };
});

const daysEl = document.getElementById('days');
const firstDow = 3, totalDays = 31, today = 21, comEventos = new Set([21,22,23,24,28,29,30]);
for (let i=0;i<firstDow;i++){ const p=document.createElement('div'); p.className='day pad'; daysEl.appendChild(p); }
for (let d=1; d<=totalDays; d++){
  const el=document.createElement('button');
  el.className='day'+(d===today?' sel today':'');
  const dots = comEventos.has(d) ? '<span class="dots"><i></i></span>' : '<span class="dots"></span>';
  el.innerHTML = `<span>${d}</span>${dots}`;
  el.onclick = ()=>{ document.querySelectorAll('.cal .day.sel').forEach(x=>x.classList.remove('sel')); el.classList.add('sel'); };
  daysEl.appendChild(el);
}

const nomes=["Marina T.","Paulo R.","Helena M.","Rafael N.","Camila D.","Bruno A.","Letícia S.","André C.","Juliana F.","Gustavo L.","Patrícia R.","Diego F."];
const motivos=["Retorno · acompanhamento","1ª consulta · emagrecimento","Retorno · saúde metabólica","Retorno · sono","1ª consulta · performance","Retorno · composição corporal"];
const meses=["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
const statuses=[["done","Concluída"],["done","Concluída"],["done","Concluída"],["conf","Confirmada"],["late","Cancelada"],["muted","Faltou"]];
const idxBody=document.getElementById('idxBody');
let shown=0;
function addRows(n){
  for(let i=0;i<n;i++){
    const k=shown+i;
    const nm=nomes[k%nomes.length], mt=motivos[k%motivos.length], st=statuses[k%statuses.length];
    const d=new Date(2026,6,21); d.setDate(d.getDate()-k*3);
    const dd=d.getDate(), mm=meses[d.getMonth()], hh=8+(k%9), val=(180+ (k%5)*40);
    const done = st[0]==='done'||st[0]==='late'||st[0]==='muted';
    const row=document.createElement('div'); row.className='irow';
    row.innerHTML=`
      <div class="d"><span class="dd">${String(dd).padStart(2,'0')}</span><span class="mm">${mm}</span></div>
      <div class="who"><div class="nm">${nm}</div><div class="mt">${mt}</div></div>
      <div class="t">${String(hh).padStart(2,'0')}:00 · 40′</div>
      <span class="chip ${st[0]}"><i></i>${st[1]}</span>
      <div class="v">R$ ${val},00</div>
      <div class="go"><a class="acao fraca" href="prontuario.html">Ver prontuário</a></div>`;
    idxBody.appendChild(row);
  }
  shown+=n;
}
addRows(8);
document.getElementById('loadMore').onclick=()=>{ addRows(8); if(shown>=32){ document.getElementById('loadMore').style.display='none'; } };

(function () {
  const dia = document.querySelector('.agenda-grid');
  const idx = document.querySelector('.card.idx');
  if (!dia || !idx) return;
  const sw = document.createElement('div');
  sw.className = 'swap';
  sw.setAttribute('role', 'tablist');
  sw.style.margin = '0 0 16px';
  sw.innerHTML = '<button type="button" role="tab" data-v="dia" aria-selected="true">Hoje</button>'
    + '<button type="button" role="tab" data-v="idx" aria-selected="false">Anteriores</button>';
  dia.parentElement.insertBefore(sw, dia);
  idx.style.display = 'none';
  sw.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    sw.querySelectorAll('button').forEach((o) => o.setAttribute('aria-selected', String(o === b)));
    dia.style.display = b.dataset.v === 'dia' ? '' : 'none';
    idx.style.display = b.dataset.v === 'idx' ? '' : 'none';
  });
})();
