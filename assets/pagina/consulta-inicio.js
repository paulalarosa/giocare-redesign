const consent = document.getElementById('consent');
const startBtn = document.getElementById('startBtn');
consent.addEventListener('change', () => {
  startBtn.setAttribute('aria-disabled', consent.checked ? 'false' : 'true');
});

let modo = 'presencial';
document.querySelectorAll('.modes button').forEach((b) => {
  b.addEventListener('click', () => {
    modo = b.dataset.mode;
    document.querySelectorAll('.modes button').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    document.getElementById('modeNote').hidden = modo !== 'video';
  });
});

startBtn.addEventListener('click', () => {
  window.gioRec.start({ nome: 'Paulo R.', iniciais: 'PR', modo: modo });
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
document.querySelectorAll('.measure input').forEach((el) => {
  el.addEventListener('blur', () => {
    if (!el.value.trim()) return;
    el.value = fmt(el.dataset.kind, el.value);
    const tag = document.getElementById(el.id + '-saved');
    tag.classList.add('on');
    setTimeout(() => tag.classList.remove('on'), 1800);
  });
});
