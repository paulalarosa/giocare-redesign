const form = document.getElementById('formLogin');
if (form) form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const b = form.querySelector('button[type=submit]');
  if (b) { b.disabled = true; b.textContent = 'Entrando…'; }
  setTimeout(() => { location.href = 'dashboard.html'; }, 500);
});

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
