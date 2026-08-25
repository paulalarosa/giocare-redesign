document.addEventListener('click', (e) => {
  const el = e.target.closest('a, button');
  if (!el) return;
  if (el.dataset.acao === 'pdf') {
    e.preventDefault();
    const nome = el.closest('.prow')?.querySelector('.nm')?.textContent.trim() || 'Receita';
    window.gioBaixar('Receita de ' + nome);
  } else if (el.dataset.acao === 'nova-receita') {
    location.href = 'consulta.html';
  }
});
