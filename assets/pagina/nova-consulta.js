const form = document.querySelector('form');
if (form) form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const b = form.querySelector('button[type=submit]');
  if (b) { b.disabled = true; b.textContent = 'Agendando…'; }
  setTimeout(() => {
    sessionStorage.setItem('gio.toast', 'Consulta agendada. O paciente recebe a confirmação.');
    location.href = 'agenda.html';
  }, 600);
});
