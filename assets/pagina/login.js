const form = document.getElementById('formLogin');
if (form) form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const b = form.querySelector('button[type=submit]');
  if (b) { b.disabled = true; b.textContent = 'Entrando…'; }
  setTimeout(() => { location.href = 'dashboard.html'; }, 500);
});
