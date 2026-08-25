const MES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const MES_BASE = 6, ANO_BASE = 2026, DIA_BASE = 21;
const COM_EVENTOS = new Set([21,22,23,24,28,29,30]);
const rotuloMes = document.querySelector('.cal .cal-head .mo');
const daysEl = document.getElementById('days');
let mesAtual = MES_BASE, anoAtual = ANO_BASE;

function porExtensoMes(mes, ano) {
  return MES[mes].charAt(0).toUpperCase() + MES[mes].slice(1) + ' de ' + ano;
}

function desenharMes(mes, ano) {
  const base = mes === MES_BASE && ano === ANO_BASE;
  const primeiro = new Date(ano, mes, 1).getDay();
  const total = new Date(ano, mes + 1, 0).getDate();
  rotuloMes.textContent = porExtensoMes(mes, ano);
  daysEl.textContent = '';
  for (let i = 0; i < primeiro; i++) {
    const p = document.createElement('div');
    p.className = 'day pad';
    daysEl.appendChild(p);
  }
  for (let d = 1; d <= total; d++) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'day' + (base && d === DIA_BASE ? ' sel today' : '');
    el.setAttribute('aria-label', d + ' de ' + MES[mes] + ' de ' + ano);
    const marca = base && COM_EVENTOS.has(d) ? '<i></i>' : '';
    el.innerHTML = '<span>' + d + '</span><span class="dots">' + marca + '</span>';
    el.onclick = () => {
      daysEl.querySelectorAll('.day.sel').forEach((x) => x.classList.remove('sel'));
      el.classList.add('sel');
    };
    daysEl.appendChild(el);
  }
}

document.querySelectorAll('[data-mes]').forEach((b) => {
  b.onclick = () => {
    const passo = Number(b.dataset.mes);
    const alvo = new Date(anoAtual, mesAtual + passo, 1);
    mesAtual = alvo.getMonth();
    anoAtual = alvo.getFullYear();
    desenharMes(mesAtual, anoAtual);
    window.gioToast('Agenda de ' + MES[mesAtual] + ' de ' + anoAtual + '.');
  };
});
desenharMes(mesAtual, anoAtual);
document.querySelectorAll('.remind').forEach((b) => {
  b.onclick = () => {
    const nome = b.closest('.crow')?.querySelector('.nm')?.textContent.trim() || 'o paciente';
    b.disabled = true;
    window.gioToast('Lembrete enviado para ' + nome + '.');
  };
});

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
document.getElementById('loadMore').onclick=()=>{ addRows(8); if(shown>=32){ document.getElementById('loadMore').hidden=true; } };

(function () {
  const dia = document.querySelector('.agenda-grid');
  const idx = document.querySelector('.card.idx');
  if (!dia || !idx) return;
  const sw = document.createElement('div');
  sw.className = 'swap';
  sw.setAttribute('role', 'tablist');
  sw.innerHTML = '<button type="button" role="tab" data-v="dia" aria-selected="true">Hoje</button>'
    + '<button type="button" role="tab" data-v="idx" aria-selected="false">Anteriores</button>';
  dia.parentElement.insertBefore(sw, dia);
  idx.hidden = true;
  sw.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    sw.querySelectorAll('button').forEach((o) => o.setAttribute('aria-selected', String(o === b)));
    dia.hidden = b.dataset.v !== 'dia';
    idx.hidden = b.dataset.v !== 'idx';
  });
})();
