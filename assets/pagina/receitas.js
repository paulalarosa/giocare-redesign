document.addEventListener('click', (e) => {
  const el = e.target.closest('a, button');
  if (!el) return;
  if (/^PDF/i.test(el.textContent.trim())) {
    e.preventDefault();
    const nome = el.closest('.prow')?.querySelector('.nm')?.textContent.trim() || 'Receita';
    window.gioBaixar('Receita de ' + nome);
  } else if (/Nova receita/i.test(el.textContent)) {
    location.href = 'consulta.html';
  }
});
