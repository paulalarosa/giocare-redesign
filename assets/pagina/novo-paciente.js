const form = document.querySelector('form');
const cpf = document.getElementById('pCpf');
const nasc = document.getElementById('pNasc');
const idadeEl = document.getElementById('pIdade');

cpf.addEventListener('input', () => {
  const d = cpf.value.replace(/\D/g, '').slice(0, 11);
  cpf.value = d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
});
cpf.addEventListener('blur', () => {
  const d = cpf.value.replace(/\D/g, '');
  cpf.setCustomValidity(d.length && d.length !== 11 ? 'O CPF precisa ter 11 dígitos.' : '');
});

function calcIdade() {
  if (!nasc.value) { idadeEl.textContent = ''; return; }
  const n = new Date(nasc.value + 'T00:00:00');
  const hoje = new Date(2026, 6, 21);
  if (n > hoje) { idadeEl.textContent = 'Data de nascimento no futuro.'; idadeEl.style.color = 'var(--danger)'; nasc.setCustomValidity('Data de nascimento no futuro.'); return; }
  nasc.setCustomValidity('');
  idadeEl.style.color = '';
  let a = hoje.getFullYear() - n.getFullYear();
  const m = hoje.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < n.getDate())) a--;
  idadeEl.textContent = a + ' anos hoje.';
}
nasc.addEventListener('change', calcIdade);
calcIdade();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const nome = document.getElementById('pNome').value.trim();
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = true;
  btn.textContent = 'Salvando…';
  setTimeout(() => {
    sessionStorage.setItem('gio.toast', nome + ' foi cadastrado. Primeira consulta ainda não existe: marque na agenda.');
    location.href = 'paciente-ficha.html';
  }, 600);
});
