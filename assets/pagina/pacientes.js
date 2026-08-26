const pacientes = [
  { nome:"Marina T.", email:"marina.t@email.com", tel:"(21) 98123-4501", cpf:"123.***.***-04" },
  { nome:"Paulo R.", email:"paulo.r@email.com", tel:"(21) 99420-1188", cpf:"204.***.***-71" },
  { nome:"Helena M.", email:"helena.m@email.com", tel:"(11) 97654-2093", cpf:"318.***.***-55" },
  { nome:"Rafael N.", email:null, tel:"(21) 98800-7712", cpf:"441.***.***-12" },
  { nome:"Camila D.", email:"camila.d@email.com", tel:"(31) 99111-2048", cpf:"552.***.***-38" },
  { nome:"Bruno A.", email:"bruno.a@email.com", tel:"(21) 98345-6600", cpf:"667.***.***-90" },
  { nome:"Letícia S.", email:"leticia.s@email.com", tel:null, cpf:"773.***.***-21", semRetorno:"há 74 dias" },
  { nome:"André C.", email:"andre.c@email.com", tel:"(11) 96789-3345", cpf:"884.***.***-47", semRetorno:"há 51 dias" },
  { nome:"Juliana F.", email:"juliana.f@email.com", tel:"(21) 99002-5567", cpf:"991.***.***-63" },
  { nome:"Gustavo L.", email:"gustavo.l@email.com", tel:"(48) 98456-1120", cpf:"102.***.***-19", semRetorno:"há 96 dias" },
  { nome:"Patrícia R.", email:"patricia.r@email.com", tel:"(21) 98567-8890", cpf:"213.***.***-84" },
];
const initials = n => n.trim().split(/\s+/).filter(Boolean).map((p,i,a)=> (i===0||i===a.length-1)?p[0]:'').join('').toUpperCase();

const listEl = document.getElementById('plist');
const countEl = document.getElementById('count');
function render(items){
  listEl.querySelectorAll('.prow').forEach(e=>e.remove());
  items.forEach(p=>{
    const row=document.createElement('div'); row.className='prow';
    row.innerHTML = `
      <div class="av" aria-hidden="true">${initials(p.nome)}</div>
      <div class="who"><div class="nm">${p.nome}</div><div class="em">${p.email ?? 'sem e-mail'}</div></div>
      <div class="cell">${p.tel ?? '–'}</div>
      <div class="cell faint">${p.cpf}</div>
      <div class="acts">
        ${p.semRetorno ? `<span class="chip late mini"><i></i>Última consulta ${p.semRetorno}</span><a href="nova-consulta.html">Agendar retorno</a>` : ''}
        <a href="paciente-ficha.html?p=${encodeURIComponent(p.nome)}" aria-label="Ver ficha de ${p.nome}">Ver ficha</a>
        <button class="del" data-nome="${p.nome}" aria-label="Excluir ${p.nome}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
        </button>
      </div>`;
    listEl.appendChild(row);
  });
  countEl.textContent = `${items.length} de 125 pacientes`;
}
render(pacientes);

document.getElementById('q').addEventListener('input', e=>{
  const t = e.target.value.toLowerCase().trim();
  const f = pacientes.filter(p => (p.nome+' '+(p.email??'')+' '+p.cpf).toLowerCase().includes(t));
  render(f);
  if(!t) countEl.textContent = '125 pacientes no arquivo';
});

document.querySelectorAll('.seg button').forEach((b,i,arr)=>{
  b.onclick=()=>{ arr.forEach(x=>x.setAttribute('aria-pressed','false')); b.setAttribute('aria-pressed','true');
    if(i===2){ const f=pacientes.filter(p=>p.semRetorno); render(f); countEl.textContent=`${f.length} pacientes sem retorno marcado`; return; }
    const sorted=[...pacientes]; if(i===1) sorted.sort((a,c)=>a.nome.localeCompare(c.nome,'pt'));
    render(sorted); countEl.textContent='125 pacientes no arquivo'; };
});

const modal=document.getElementById('delModal');
listEl.addEventListener('click', e=>{
  const btn=e.target.closest('.del'); if(!btn) return;
  modal.querySelector('#delMsg b').textContent = btn.dataset.nome;
  modal.showModal();
});
document.getElementById('delCancel').onclick=()=>modal.close();
document.getElementById('delConfirm').onclick=()=>{
  const nome = modal.querySelector('#delMsg b').textContent;
  const i = pacientes.findIndex(x=>x.nome===nome);
  if(i>-1) pacientes.splice(i,1);
  render(pacientes);
  modal.close();
  window.gioToast(nome + ' saiu do arquivo de pacientes.');
};
modal.addEventListener('click', e=>{ if(e.target===modal) modal.close(); });
