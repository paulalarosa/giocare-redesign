(function () {
  try {
    var escolha = localStorage.getItem('gio.side');
    var naConsulta = /(^|\/)consulta(\.html)?$/.test(location.pathname);
    if (escolha ? escolha === 'rail' : naConsulta) {
      document.documentElement.setAttribute('data-side', 'rail');
    }
  } catch (e) {}
})();
