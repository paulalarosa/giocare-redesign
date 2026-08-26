document.querySelectorAll('[data-rascunho]').forEach((b) => {
  b.onclick = () => {
    const painel = document.getElementById('ras-' + b.dataset.rascunho);
    const abrir = painel.hidden;
    painel.hidden = !abrir;
    b.setAttribute('aria-expanded', String(abrir));
  };
});

document.querySelectorAll('[data-validar]').forEach((b) => {
  b.onclick = () => {
    const painel = b.closest('.exam-ana');
    const row = painel.previousElementSibling;
    const chip = row.querySelector('.chip');
    chip.className = 'chip done';
    chip.innerHTML = '<i></i>No prontuário';
    row.querySelector('[data-rascunho]').remove();
    painel.hidden = true;
    window.gioToast('Prontuário de ' + b.dataset.validar + ' validado, com o carimbo de apoio de IA.');
  };
});
