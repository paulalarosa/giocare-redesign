const SEMANA = {
  'Segunda-feira': [['08:00', '12:00', true], ['14:00', '18:00', true]],
  'Terça-feira':   [['08:00', '12:00', true], ['14:00', '18:00', true]],
  'Quarta-feira':  [['08:00', '13:00', true]],
  'Quinta-feira':  [['08:00', '12:00', true], ['14:00', '18:00', true]],
  'Sexta-feira':   [['08:00', '12:00', true]],
  'Sábado':        [['08:00', '11:00', false]],
};

const wrap = document.getElementById('days');

Object.entries(SEMANA).forEach(([dia, slots]) => {
  const card = document.createElement('section');
  card.className = 'card hcard';
  card.innerHTML = `<h2 class="hcard-dia">${dia}</h2><div class="hslots"></div>`;
  const lista = card.querySelector('.hslots');
  slots.forEach(([ini, fim, ativo]) => {
    const linha = document.createElement('div');
    linha.className = 'hslot' + (ativo ? '' : ' is-off');
    linha.innerHTML = `
      <span class="hh">${ini} às ${fim}</span>
      <div class="acts">
        <span class="chip ${ativo ? 'paid' : 'muted'}"><i></i>${ativo ? 'Ativo' : 'Inativo'}</span>
        <button type="button" class="btn btn-soft btn-mini">${ativo ? 'Desativar' : 'Ativar'}</button>
        <button type="button" class="icon-btn del" aria-label="Remover o horário de ${ini} às ${fim} na ${dia}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
        </button>
      </div>`;
    lista.appendChild(linha);
  });
  wrap.appendChild(card);
});

const modal = document.getElementById('delModal');
let aRemover = null;

wrap.addEventListener('click', (e) => {
  const remover = e.target.closest('.icon-btn.del');
  if (remover) {
    aRemover = remover.closest('.hslot');
    modal.showModal();
    return;
  }
  const alternar = e.target.closest('.btn-mini');
  if (!alternar) return;
  const linha = alternar.closest('.hslot');
  const desligando = !linha.classList.contains('is-off');
  linha.classList.toggle('is-off', desligando);
  alternar.textContent = desligando ? 'Ativar' : 'Desativar';
  const chip = linha.querySelector('.chip');
  chip.className = 'chip ' + (desligando ? 'muted' : 'paid');
  chip.innerHTML = `<i></i>${desligando ? 'Inativo' : 'Ativo'}`;
  window.gioToast(desligando
    ? 'Horário desativado. Some da agenda a partir de amanhã.'
    : 'Horário ativado.');
});

document.getElementById('delCancel').addEventListener('click', () => modal.close());

document.getElementById('delConfirm').addEventListener('click', () => {
  if (aRemover) { aRemover.remove(); aRemover = null; }
  modal.close();
  window.gioToast('Horário removido. A agenda para de oferecer esse intervalo.');
});

modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

document.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b && b.dataset.acao === 'add-horario') {
    window.gioToast('Novo horário criado. Ajuste o início e o fim na linha.');
  }
});
