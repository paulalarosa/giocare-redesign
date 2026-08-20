const passos = ['passoEmail', 'passoCodigo', 'passoNova'].map((id) => document.getElementById(id));
const pontos = document.querySelectorAll('.steps i');

function irPara(n) {
  passos.forEach((p, k) => { p.hidden = k !== n; });
  pontos.forEach((i, k) => i.classList.toggle('on', k <= n));
  const foco = passos[n] && passos[n].querySelector('input');
  if (foco) foco.focus();
}

document.getElementById('formEmail').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  if (!form.reportValidity()) return;
  const b = form.querySelector('button[type=submit]');
  b.disabled = true; b.textContent = 'Enviando…';
  setTimeout(() => {
    document.getElementById('emailEco').textContent = document.getElementById('email').value.trim();
    irPara(1);
    b.disabled = false; b.textContent = 'Enviar código';
  }, 600);
});

document.getElementById('reenviar').addEventListener('click', (e) => {
  e.preventDefault();
  const eco = document.getElementById('reenviado');
  eco.hidden = false;
  setTimeout(() => { eco.hidden = true; }, 4000);
});

document.getElementById('formCodigo').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const campo = document.getElementById('codigo');
  const erro = document.getElementById('codigoErro');
  const ok = /^[0-9]{6}$/.test(campo.value.trim());
  campo.setAttribute('aria-invalid', String(!ok));
  erro.hidden = ok;
  if (!ok) { campo.select(); return; }
  irPara(2);
});

document.getElementById('formNova').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  if (!form.reportValidity()) return;
  const nova = document.getElementById('nova');
  const confirma = document.getElementById('confirma');
  const erro = document.getElementById('confirmaErro');
  const ok = nova.value === confirma.value;
  confirma.setAttribute('aria-invalid', String(!ok));
  erro.hidden = ok;
  if (!ok) { confirma.select(); return; }
  const b = form.querySelector('button[type=submit]');
  b.disabled = true; b.textContent = 'Salvando…';
  setTimeout(() => {
    passos.forEach((p) => { p.hidden = true; });
    pontos.forEach((i) => i.classList.add('on'));
    document.getElementById('feito').hidden = false;
  }, 600);
});

document.querySelectorAll('.olho').forEach((b) => {
  b.addEventListener('click', () => {
    const alvo = document.getElementById(b.dataset.olho);
    if (!alvo) return;
    const mostrar = alvo.type === 'password';
    alvo.type = mostrar ? 'text' : 'password';
    b.setAttribute('aria-pressed', String(mostrar));
    b.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
  });
});
