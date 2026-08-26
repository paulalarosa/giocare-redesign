
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

(function () {
  const caixa = document.getElementById('aranhaFicha');
  if (!caixa || !window.gioAranha) return;
  const itens = [...document.querySelectorAll('.abc-item[data-mapa]')].map((el) => ({
    letra: el.querySelector('.letter').textContent.trim(),
    fracao: parseFloat(el.dataset.mapa),
    titulo: el.querySelector('.k').firstChild.textContent.trim(),
    baixo: el.dataset.nivel === 'atencao',
  }));
  window.gioAranha(caixa, itens, {
    alt: 'Mapa ABCDEFS de Marina T. na consulta de 28/06',
    legenda: 'Quanto mais perto da borda, melhor a área está indo.',
  });
})();
