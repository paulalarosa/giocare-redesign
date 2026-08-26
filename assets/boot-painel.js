(function () {
  try {
    var tema = localStorage.getItem('gio.tema');
    if (tema === 'dark' || tema === 'light') {
      document.documentElement.setAttribute('data-theme', tema);
    }
    var escolha = localStorage.getItem('gio.side');
    var naConsulta = /(^|\/)consulta(\.html)?$/.test(location.pathname);
    if (escolha ? escolha === 'rail' : naConsulta) {
      document.documentElement.setAttribute('data-side', 'rail');
    }
  } catch (e) {}
})();
