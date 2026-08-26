const consent = document.getElementById('consent');
const startBtn = document.getElementById('startBtn');
const cartao = document.querySelector('.start-card');
const pedirConsent = document.getElementById('consentPedir');
const feitoConsent = document.getElementById('consentFeito');
const dataConsent = document.getElementById('consentData');
const chaveConsent = 'gio:consentimento:' + cartao.dataset.paciente;

function lerConsent() {
  let gravado = null;
  try { gravado = localStorage.getItem(chaveConsent); } catch (e) { gravado = null; }
  if (gravado === null) return cartao.dataset.consentimento || '';
  return gravado === 'retirado' ? '' : gravado;
}

function gravarConsent(valor) {
  try { localStorage.setItem(chaveConsent, valor || 'retirado'); } catch (e) {}
}

function porExtenso(iso) {
  const [ano, mes, dia] = iso.split('-');
  const atual = String(new Date().getFullYear());
  return ano === atual ? dia + '/' + mes : dia + '/' + mes + '/' + ano;
}

function pintarConsent() {
  const quando = lerConsent();
  const tem = !!quando;
  pedirConsent.hidden = tem;
  feitoConsent.hidden = !tem;
  if (tem) dataConsent.textContent = porExtenso(quando);
  else consent.checked = false;
  startBtn.setAttribute('aria-disabled', tem ? 'false' : 'true');
}

consent.addEventListener('change', () => {
  if (!consent.checked) { startBtn.setAttribute('aria-disabled', 'true'); return; }
  gravarConsent(new Date().toISOString().slice(0, 10));
  pintarConsent();
});

pintarConsent();

let modo = 'presencial';
document.querySelectorAll('.modes button').forEach((b) => {
  b.addEventListener('click', () => {
    modo = b.dataset.mode;
    document.querySelectorAll('.modes button').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    document.getElementById('modeNote').hidden = modo !== 'video';
  });
});

startBtn.addEventListener('click', (e) => {
  if (startBtn.getAttribute('aria-disabled') === 'true') {
    e.preventDefault();
    pedirConsent.classList.remove('chama');
    void pedirConsent.offsetWidth;
    pedirConsent.classList.add('chama');
    consent.focus();
    window.gioToast('Falta registrar a autorização do paciente.');
    return;
  }
  window.gioRec.start({ nome: 'Paulo R.', iniciais: 'PR', modo: modo, since: Date.now() - 12 * 60 * 1000 - 4000 });
});

document.getElementById('encaixe').addEventListener('click', () => {
  window.gioRec.start({ vinculada: false, modo: 'presencial' });
});

const resend = document.getElementById('resendLink');
resend.addEventListener('click', () => {
  resend.textContent = 'link reenviado ✓';
  resend.disabled = true;
});

function fmt(kind, raw) {
  const digits = raw.replace(/[^\d,\.]/g, '').replace('.', ',');
  if (!digits) return '';
  if (kind === 'altura') {
    const n = digits.replace(',', '');
    if (n.length >= 3) return n[0] + ',' + n.slice(1, 3);
    return digits;
  }
  if (!digits.includes(',') && digits.length >= 3) {
    const v = digits.slice(0, -1) + ',' + digits.slice(-1);
    if (kind === 'peso' && parseFloat(v.replace(',', '.')) < 25) return digits;
    return v;
  }
  return digits;
}
const notaInicio = document.getElementById('notaInicio');
if (notaInicio) {
  try { notaInicio.value = sessionStorage.getItem('gio.nota') || ''; } catch (e) {}
  notaInicio.addEventListener('blur', () => {
    try { sessionStorage.setItem('gio.nota', notaInicio.value.trim()); } catch (e) {}
    const tag = document.getElementById('notaInicio-saved');
    tag.classList.add('on');
    setTimeout(() => tag.classList.remove('on'), 1800);
  });
}

document.querySelectorAll('.measure input').forEach((el) => {
  el.addEventListener('blur', () => {
    if (!el.value.trim()) return;
    el.value = fmt(el.dataset.kind, el.value);
    const tag = document.getElementById(el.id + '-saved');
    tag.classList.add('on');
    setTimeout(() => tag.classList.remove('on'), 1800);
  });
});
