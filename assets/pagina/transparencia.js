(function () {
  var tabs = document.querySelectorAll('.steps button');
  var panes = document.querySelectorAll('.stage .pane');
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x, k) { x.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      panes.forEach(function (p, k) { p.classList.toggle('on', k === i); });
    });
  });
})();
