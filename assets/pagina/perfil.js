const foto = [...document.querySelectorAll('button, a')].find((b) => /Trocar foto/i.test(b.textContent));
if (foto) {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*'; inp.hidden = true;
  document.body.appendChild(inp);
  foto.onclick = () => inp.click();
  inp.onchange = () => { if (inp.files.length) window.gioToast('Foto atualizada.'); };
}
const form = document.querySelector('form');
if (form) form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const b = form.querySelector('button[type=submit]');
  if (b) { b.disabled = true; b.textContent = 'Salvando…'; }
  setTimeout(() => {
    if (b) { b.disabled = false; b.textContent = 'Salvar alterações'; }
    window.gioToast('Perfil salvo.');
  }, 600);
});
