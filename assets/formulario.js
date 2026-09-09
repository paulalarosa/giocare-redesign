/**
 * Os formulários da landing.
 *
 * Dois modos, escolhidos pelo `data-envio` do próprio formulário:
 *
 *   data-envio="/api/fundadores"  → manda de verdade, e só diz "recebido"
 *                                   depois de o servidor confirmar.
 *   data-envio="demonstracao"     → não manda nada.
 *
 * 🔴 NESTE REPOSITÓRIO os dois formulários são DEMONSTRATIVOS, e é de
 * propósito: aqui é GitHub Pages, não há servidor para receber, e este repo é
 * público — nome, e-mail, WhatsApp e CRM de médico não podem cair nele. O
 * cadastro de verdade roda no app, em `POST /api/fundadores`, que é quem
 * grava e devolve erro na tela quando recusa.
 *
 * 🔴 A regra que manda aqui: o estado de enviado NÃO aparece antes da
 * resposta. Formulário que diz "recebido" e não gravou é pior que formulário
 * que falha, porque o médico vai embora achando que está na fila.
 */
(function () {
  var DEMO = "demonstracao";

  function acharAviso(form) {
    var aviso = form.querySelector(".ferro");
    if (aviso) return aviso;
    aviso = document.createElement("p");
    aviso.className = "ferro";
    aviso.setAttribute("role", "alert");
    form.appendChild(aviso);
    return aviso;
  }

  function dados(form) {
    var saida = {};
    var campos = form.querySelectorAll("input, textarea, select");
    for (var i = 0; i < campos.length; i += 1) {
      var campo = campos[i];
      if (campo.name) saida[campo.name] = campo.value;
    }
    return saida;
  }

  var formularios = document.querySelectorAll("form[data-envio]");

  for (var i = 0; i < formularios.length; i += 1) {
    (function (form) {
      var destino = form.getAttribute("data-envio");
      var botao = form.querySelector('button[type="submit"]');
      var rotulo = botao ? botao.innerHTML : "";

      form.addEventListener("submit", function (evento) {
        evento.preventDefault();

        if (destino === DEMO) {
          form.classList.add("sent");
          return;
        }

        var aviso = acharAviso(form);
        aviso.textContent = "";
        form.classList.add("enviando");
        if (botao) {
          botao.disabled = true;
          botao.textContent = "Enviando…";
        }

        function liberar() {
          form.classList.remove("enviando");
          if (botao) {
            botao.disabled = false;
            botao.innerHTML = rotulo;
          }
        }

        fetch(destino, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados(form)),
        })
          .then(function (resposta) {
            return resposta
              .json()
              .catch(function () {
                return {};
              })
              .then(function (corpo) {
                return { ok: resposta.ok, corpo: corpo };
              });
          })
          .then(function (r) {
            if (r.ok) {
              /* Só agora. E o campo é limpo: a tela do "recebido" fica por
                 cima do formulário, e recarregar não deve reenviar nada. */
              form.reset();
              form.classList.add("sent");
              return;
            }
            liberar();
            aviso.textContent =
              r.corpo && r.corpo.erro
                ? r.corpo.erro
                : "Não conseguimos registrar agora. Tente de novo em instantes.";
          })
          .catch(function () {
            /* Sem rede, ou o servidor não respondeu. A mensagem diz o que
               fazer, e o que a pessoa escreveu continua na tela. */
            liberar();
            aviso.textContent =
              "Sem conexão com o servidor. Confira a internet e tente de novo.";
          });
      });
    })(formularios[i]);
  }
})();

/**
 * O e-mail que veio do fecho da home.
 *
 * 🔴 Lê e APAGA. Se ficasse guardado, quem voltasse à página dias depois veria
 * o campo preenchido sem ter digitado nada — e num computador compartilhado
 * isso é o endereço de outra pessoa aparecendo na tela.
 */
(function () {
  var campo = document.getElementById("f-email");
  if (!campo || campo.value) return;
  try {
    var email = sessionStorage.getItem("gio.fundador.email");
    if (!email) return;
    sessionStorage.removeItem("gio.fundador.email");
    campo.value = email;
    var nome = document.getElementById("f-nome");
    if (nome) nome.focus();
  } catch (_) {
    /* Armazenamento bloqueado: o campo fica vazio, que é o estado normal. */
  }
})();
