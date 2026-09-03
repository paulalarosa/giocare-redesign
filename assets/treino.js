/**
 * A consulta simulada: escolher o caso, perguntar, e ser corrigida no fim.
 *
 * ## Um casamento só para os dois modos
 *
 * A médica pode escolher a pergunta de uma lista ou falar em voz alta, e o
 * reconhecimento é o MESMO: os dois caminhos entregam texto a `acharTurno`,
 * que casa por gatilho. Duas rotas de reconhecimento divergiriam, e a versão
 * por lista existe justamente para nunca falhar na frente de ninguém.
 *
 * ## O que ainda não existe, e como a página se comporta sem
 *
 * O áudio das falas e os avatares em GLB são gerados fora daqui. Enquanto não
 * chegam, a fala aparece escrita e o palco mostra o lugar do avatar dizendo que
 * ele vem. Nada quebra, e a página abre funcionando: era isso ou uma tela que
 * só serve depois de dois arquivos que dependem de terceiros.
 *
 * O three.js entra por importação dinâmica e só quando existe um GLB para
 * carregar. Carregar 175 KB para desenhar nada seria o veto da landing
 * acontecendo de novo, agora sem motivo.
 */
(function () {
  "use strict";

  var CAMINHO = "assets/treino/";
  var dados = null;
  var caso = null;
  var persona = null;
  /** Índices dos turnos já perguntados, na ordem em que foram. */
  var feitos = [];
  var cobertas = {};
  var audio = null;

  var el = {};
  ["casos", "palco", "escolha", "correcao", "fala", "quem", "letras",
   "lista", "voz", "vozTexto", "vozBotao", "encerrar", "avatar", "aranha",
   "faltou", "titulo", "recomecar", "progresso"].forEach(function (id) {
    el[id] = document.getElementById("t-" + id);
  });

  /** Sem acento, sem caixa, sem pontuação: é o que os dois modos comparam. */
  function limpar(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Qual turno a fala da médica quis dizer.
   *
   * Conta quantos gatilhos aparecem no que ela disse, e o mais específico
   * ganha: gatilho de duas palavras vale mais que de uma, senão "hoje" casaria
   * a pergunta de abertura em metade das frases. Turno já feito sai da disputa,
   * porque repetir a mesma pergunta não deveria devolver a mesma resposta como
   * novidade. Devolve `null` quando ninguém passa do piso.
   */
  function acharTurno(texto) {
    var t = limpar(texto);
    if (t.length < 3) return null;
    var melhor = null;
    var melhorPeso = 0;
    caso.turnos.forEach(function (turno, i) {
      if (feitos.indexOf(i) !== -1) return;
      var peso = 0;
      turno.gatilhos.forEach(function (g) {
        var alvo = limpar(g);
        if (!alvo) return;
        if (t.indexOf(alvo) !== -1) peso += alvo.split(" ").length;
      });
      if (peso > melhorPeso) {
        melhorPeso = peso;
        melhor = i;
      }
    });
    return melhorPeso >= 1 ? melhor : null;
  }

  function tocar(pasta, indice, aoTerminar) {
    if (audio) {
      audio.pause();
      audio = null;
    }
    var src = CAMINHO + "falas/" + pasta + "/" + indice + ".mp3";
    var a = new Audio(src);
    audio = a;
    // O áudio pode não existir ainda. `onerror` é o caminho normal por
    // enquanto, não uma falha: a fala escrita já está na tela.
    a.addEventListener("error", function () {
      if (aoTerminar) aoTerminar();
    });
    a.addEventListener("ended", function () {
      window.gioBoca && window.gioBoca.calar();
      if (aoTerminar) aoTerminar();
    });
    a.play().then(function () {
      // A linha do tempo de bocas mora ao lado do mp3, com o mesmo nome.
      fetch(CAMINHO + "falas/" + pasta + "/" + indice + ".json")
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (vis) {
          if (vis && window.gioBoca) window.gioBoca.falar(a, vis);
        })
        .catch(function () {});
    }).catch(function () {
      if (aoTerminar) aoTerminar();
    });
  }

  function dizer(texto, pasta, indice) {
    el.fala.textContent = texto;
    el.fala.classList.remove("t-fala-nova");
    // Reinicia a animação de entrada sem depender de timer.
    void el.fala.offsetWidth;
    el.fala.classList.add("t-fala-nova");
    if (pasta !== undefined) tocar(pasta, indice);
  }

  function pintarLetras() {
    var ordem = Object.keys(dados.letras);
    el.letras.innerHTML = ordem.map(function (l) {
      var tem = cobertas[l];
      var exige = caso.gabarito.indexOf(l) !== -1;
      return '<span class="t-letra' + (tem ? " on" : "") + (exige ? " exige" : "") +
        '" data-abc="' + l.toLowerCase() + '" title="' + dados.letras[l] +
        (exige ? " · este caso exige" : "") + '">' + l + "</span>";
    }).join("");
    el.progresso.textContent = feitos.length + " de " + caso.turnos.length + " perguntas";
  }

  function pintarLista() {
    var restam = caso.turnos.map(function (t, i) { return { t: t, i: i }; })
      .filter(function (o) { return feitos.indexOf(o.i) === -1; });
    if (restam.length === 0) {
      el.lista.innerHTML = '<p class="t-vazio">Você passou por todas. Encerre para ver a correção.</p>';
      return;
    }
    el.lista.innerHTML = restam.map(function (o) {
      return '<button type="button" class="t-pergunta" data-turno="' + o.i + '">' +
        o.t.pergunta + "</button>";
    }).join("");
  }

  function responder(indice) {
    var turno = caso.turnos[indice];
    feitos.push(indice);
    turno.letras.forEach(function (l) { cobertas[l] = true; });
    dizer(turno.resposta, caso.id, indice + 1);
    pintarLetras();
    pintarLista();
  }

  function naoEntendi() {
    var quais = persona.nao_entendi;
    var i = Math.floor(Math.random() * quais.length);
    dizer(quais[i], "_personas/" + persona.id, i);
  }

  function comecar(id) {
    caso = dados.casos.filter(function (c) { return c.id === id; })[0];
    persona = dados.personas.filter(function (p) { return p.id === caso.persona; })[0];
    feitos = [];
    cobertas = {};
    el.titulo.textContent = caso.titulo;
    el.quem.textContent = persona.nome + ", " + persona.idade + " anos";
    el.escolha.hidden = true;
    el.correcao.hidden = true;
    el.palco.hidden = false;
    pintarLetras();
    pintarLista();
    dizer(caso.abertura, caso.id, 0);
    montarAvatar(persona.id);
    el.palco.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /**
   * O avatar, quando existe.
   *
   * Procura o GLB da persona. Sem ele, o palco fica com o lugar reservado e a
   * página segue inteira — e o three não é carregado, porque não haveria o que
   * desenhar.
   */
  function montarAvatar(personaId) {
    var glb = CAMINHO + "avatares/" + personaId + ".glb";
    el.avatar.setAttribute("data-estado", "procurando");
    fetch(glb, { method: "HEAD" }).then(function (r) {
      if (!r.ok) throw new Error("sem glb");
      return import("./treino-avatar.js");
    }).then(function (mod) {
      el.avatar.setAttribute("data-estado", "pronto");
      mod.montar(el.avatar, glb);
    }).catch(function () {
      el.avatar.setAttribute("data-estado", "ausente");
    });
  }

  function corrigir() {
    if (audio) audio.pause();
    var ordem = Object.keys(dados.letras);
    var itens = ordem.map(function (l) {
      var tem = !!cobertas[l];
      var exige = caso.gabarito.indexOf(l) !== -1;
      return {
        letra: l,
        // Cheio quando cobriu; um toco quando não, para o eixo existir no
        // desenho em vez de a área colapsar no centro.
        fracao: tem ? 1 : 0.12,
        baixo: exige && !tem,
        titulo: dados.letras[l] + (tem ? " · conversado" : exige ? " · o caso exigia e não foi perguntado" : " · não conversado"),
      };
    });
    window.gioAranha(el.aranha, itens, {
      alt: "Cobertura do ABCDEFS nesta consulta simulada",
    });

    var faltaram = caso.gabarito.filter(function (l) { return !cobertas[l]; });
    var extras = ordem.filter(function (l) {
      return cobertas[l] && caso.gabarito.indexOf(l) === -1;
    });

    var h = "";
    if (faltaram.length === 0) {
      h += '<p class="t-ok"><b>Você cobriu tudo que este caso exigia.</b> ' +
        "As " + caso.gabarito.length + " letras do gabarito saíram das suas perguntas.</p>";
    } else {
      h += '<p class="t-falta"><b>Ficou de fora:</b> ' + faltaram.map(function (l) {
        return '<span class="t-letra baixo" data-abc="' + l.toLowerCase() + '">' + l + "</span> " + dados.letras[l];
      }).join(", ") + ".</p>";
      h += '<p class="t-porque">Neste caso essas letras mudam a conduta, e o paciente não ia trazê-las sozinho.</p>';
    }
    if (extras.length > 0) {
      h += '<p class="t-extra">Você também cobriu ' + extras.map(function (l) {
        return dados.letras[l];
      }).join(", ") + ", que o gabarito não exigia. Não é erro.</p>";
    }
    h += '<p class="t-quantas">' + feitos.length + " de " + caso.turnos.length +
      " perguntas do roteiro. As que sobraram estão na lista, se quiser ver o que o paciente responderia.</p>";
    el.faltou.innerHTML = h;

    el.palco.hidden = true;
    el.correcao.hidden = false;
    el.correcao.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- voz ---------- */

  var Reco = window.SpeechRecognition || window.webkitSpeechRecognition;
  var reco = null;
  var ouvindo = false;

  function pararDeOuvir() {
    ouvindo = false;
    el.vozBotao.setAttribute("data-ouvindo", "false");
    el.vozBotao.textContent = "Falar com o paciente";
    if (reco) {
      try { reco.stop(); } catch (e) {}
    }
  }

  function ouvir() {
    if (!Reco) return;
    if (ouvindo) { pararDeOuvir(); return; }
    reco = new Reco();
    reco.lang = "pt-BR";
    reco.interimResults = true;
    reco.continuous = false;
    reco.onresult = function (ev) {
      var texto = "";
      for (var i = 0; i < ev.results.length; i++) texto += ev.results[i][0].transcript;
      el.vozTexto.textContent = texto;
      var ultimo = ev.results[ev.results.length - 1];
      if (!ultimo.isFinal) return;
      var achado = acharTurno(texto);
      if (achado === null) naoEntendi();
      else responder(achado);
    };
    reco.onerror = function (ev) {
      el.vozTexto.textContent =
        ev.error === "not-allowed"
          ? "O navegador não deu permissão para o microfone."
          : "Não deu para ouvir. Tente de novo, ou use a lista.";
      pararDeOuvir();
    };
    reco.onend = function () { if (ouvindo) pararDeOuvir(); };
    ouvindo = true;
    el.vozBotao.setAttribute("data-ouvindo", "true");
    el.vozBotao.textContent = "Ouvindo… clique para parar";
    el.vozTexto.textContent = "";
    reco.start();
  }

  /* ---------- ligação ---------- */

  el.casos.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-caso]");
    if (b) comecar(b.getAttribute("data-caso"));
  });

  el.lista.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-turno]");
    if (b) responder(Number(b.getAttribute("data-turno")));
  });

  el.vozBotao.addEventListener("click", ouvir);
  el.encerrar.addEventListener("click", corrigir);
  el.recomecar.addEventListener("click", function () {
    if (audio) audio.pause();
    el.correcao.hidden = true;
    el.palco.hidden = true;
    el.escolha.hidden = false;
    el.escolha.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.querySelectorAll("[data-modo]").forEach(function (b) {
    b.addEventListener("click", function () {
      var modo = b.getAttribute("data-modo");
      document.querySelectorAll("[data-modo]").forEach(function (o) {
        o.setAttribute("aria-selected", String(o === b));
      });
      el.lista.hidden = modo !== "lista";
      el.voz.hidden = modo !== "voz";
      if (modo !== "voz") pararDeOuvir();
    });
  });

  fetch(CAMINHO + "casos.json")
    .then(function (r) { return r.json(); })
    .then(function (d) {
      dados = d;
      el.casos.innerHTML = d.casos.map(function (c) {
        var p = d.personas.filter(function (x) { return x.id === c.persona; })[0];
        return '<button type="button" class="t-caso" data-caso="' + c.id + '">' +
          '<span class="t-caso-quem mono">' + p.nome + " · " + p.idade + " anos</span>" +
          "<strong>" + c.titulo + "</strong>" +
          '<span class="t-caso-abre">' + c.abertura + "</span>" +
          '<span class="t-caso-gab">' + c.gabarito.map(function (l) {
            return '<i data-abc="' + l.toLowerCase() + '">' + l + "</i>";
          }).join("") + "</span>" +
          "</button>";
      }).join("");
      if (!Reco) {
        el.voz.innerHTML =
          '<p class="t-vazio">Este navegador não reconhece fala. No Chrome o modo de voz funciona; a lista funciona em todos.</p>';
      }
    })
    .catch(function () {
      el.casos.innerHTML = '<p class="t-vazio">Não deu para carregar os casos.</p>';
    });
})();
