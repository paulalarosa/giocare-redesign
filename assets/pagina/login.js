const form = document.getElementById('formLogin');

function pintarErro(campo, tem) {
  const caixa = campo.closest('.field');
  let hint = caixa.querySelector('.hint.erro');
  if (!tem) {
    campo.removeAttribute('aria-invalid');
    if (hint) hint.remove();
    return;
  }
  campo.setAttribute('aria-invalid', 'true');
  if (!hint) {
    hint = document.createElement('p');
    hint.className = 'hint erro';
    hint.id = campo.id + '-erro';
    caixa.appendChild(hint);
    campo.setAttribute('aria-describedby', hint.id);
  }
  hint.textContent = campo.type === 'email'
    ? (campo.value.trim() ? 'Esse e-mail não parece completo.' : 'Digite o e-mail do consultório.')
    : 'Digite a senha.';
}

if (form) {
  const campos = [...form.querySelectorAll('input[required]')];
  campos.forEach((c) => c.addEventListener('input', () => pintarErro(c, false)));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const errados = campos.filter((c) => !c.checkValidity());
    campos.forEach((c) => pintarErro(c, errados.includes(c)));
    if (errados.length) { errados[0].focus(); return; }
    const b = form.querySelector('button[type=submit]');
    if (b) { b.disabled = true; b.textContent = 'Entrando…'; }
    setTimeout(() => { location.href = 'dashboard.html'; }, 500);
  });
}

document.querySelectorAll('.olho').forEach((b) => {
  b.addEventListener('click', () => {
    const alvo = document.getElementById(b.dataset.olho);
    if (!alvo) return;
    const mostrar = alvo.type === 'password';
    alvo.type = mostrar ? 'text' : 'password';
    b.setAttribute('aria-pressed', String(mostrar));
    b.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
  });
});
