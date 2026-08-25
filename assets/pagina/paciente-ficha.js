
const qs = new URLSearchParams(location.search).get('p');
if (qs) {
  const alvo = document.querySelector('.pname');
  if (alvo) {
    const idade = alvo.querySelector('.age');
    alvo.textContent = qs + ' ';
    if (idade) alvo.appendChild(idade);
  }
  const av = document.querySelector('.pav');
  if (av) av.textContent = qs.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  document.title = 'Gio Care · ' + qs;
}
const copia = document.querySelector('[data-acao="copia-prontuario"]');
if (copia) copia.onclick = (e) => { e.preventDefault(); window.gioBaixar('Cópia do prontuário'); };
const zap = document.querySelector('[data-acao="whatsapp"]');
if (zap) zap.onclick = (e) => { e.preventDefault(); window.gioToast('Conversa aberta no WhatsApp.'); };
