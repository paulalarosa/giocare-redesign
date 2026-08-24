const crm = document.getElementById('crm');
const uf = document.getElementById('uf');
const nome = document.getElementById('nome');
const box = document.getElementById('cfmBox');
const tx = document.getElementById('cfmTx');
const goBtn = document.getElementById('goBtn');
const form = document.getElementById('signup');
let conferido = false;

const ICO = {
  ok: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 12.5l5 5L20 7"/></svg>',
  bad: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16h.01"/></svg>',
};

function consultarCFM(numero, estado) {
  return new Promise((resolve) => setTimeout(() => {
    if (numero.length < 4) return resolve({ situacao: 'nao_encontrado' });
    if (numero.endsWith('00')) return resolve({ situacao: 'cancelado', nome: 'HELENA PRADO', inscricao: numero + '/' + estado });
    resolve({ situacao: 'ativo', nome: 'HELENA PRADO', inscricao: numero + '/' + estado,
      tipo: 'Principal', especialidades: 'Nutrologia' });
  }, 900));
}

function pintar(estado, html, cls) {
  box.hidden = false;
  box.className = 'cfm ' + cls;
  box.querySelector('.ic').innerHTML = estado === 'load' ? '<span class="spin"></span>' : ICO[estado];
  tx.innerHTML = html;
}

async function conferir() {
  const n = crm.value.replace(/\D/g, '');
  crm.value = n;
  conferido = false;
  travar();
  if (!n || !uf.value) { box.hidden = true; return; }
  pintar('load', 'Conferindo o registro no CFM…', 'load');
  nome.value = '';
  const r = await consultarCFM(n, uf.value);
  if (r.situacao === 'ativo') {
    conferido = true;
    nome.value = r.nome;
    crm.setCustomValidity('');
    pintar('ok', '<b>Registro ativo</b><span>' + r.nome + ' · CRM ' + r.inscricao + ' · ' + r.especialidades + '</span>', 'ok');
  } else if (r.situacao === 'cancelado') {
    crm.setCustomValidity('Este registro não está ativo no CFM.');
    pintar('bad', '<b>Registro não está ativo</b><span>Fale com a gente se houver engano.</span>', 'bad');
  } else {
    crm.setCustomValidity('CRM não encontrado no CFM.');
    pintar('bad', '<b>CRM não encontrado</b><span>Confira o número e a UF do seu registro.</span>', 'bad');
  }
  travar();
}

function travar() {
  goBtn.setAttribute('aria-disabled', conferido ? 'false' : 'true');
}

crm.addEventListener('blur', conferir);
uf.addEventListener('change', conferir);
travar();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!conferido || !form.reportValidity()) return;
  form.hidden = true;
  document.getElementById('feito').hidden = false;
  document.querySelectorAll('.steps i').forEach((i) => i.classList.add('on'));
});

const emailParam = new URLSearchParams(location.search).get('email');
if (emailParam) {
  const campo = document.getElementById('email');
  if (campo && !campo.value) campo.value = emailParam;
}
