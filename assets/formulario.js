/**
 * Os formulários do protótipo.
 *
 * 🔴 NADA SAI DAQUI. Este é o protótipo: o envio troca o cartão pelo estado de
 * enviado e para. Nenhum dado é guardado, nem no navegador, nem no repositório
 * — que é público.
 *
 * Quando a página de fundadores for ao ar de verdade, o destino do cadastro é
 * ESTA função e mais nada: um `fetch` para o endereço que receber os leads,
 * antes do `classList.add('sent')`, e o erro tem de aparecer na tela em vez de
 * dizer enviado sem ter enviado.
 */
document.querySelectorAll('form[data-envio="demonstracao"]').forEach(function (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    this.classList.add('sent');
  });
});
