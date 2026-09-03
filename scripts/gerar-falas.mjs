#!/usr/bin/env node
/**
 * Gera o áudio e a linha do tempo de visemas de cada fala do paciente simulado.
 *
 * ## Por que o áudio é gerado uma vez e embarcado
 *
 * O paciente é fixo, então cada fala dele é conhecida de antemão. Gerar aqui e
 * embarcar o resultado dá três coisas de graça: a boca fica EXATA (o tempo de
 * cada letra vem do próprio sintetizador, não é adivinhado do volume), custa
 * zero por execução, e o protótipo público não precisa de chave nenhuma.
 *
 * 🔴 Este script roda na SUA máquina, com a chave no ambiente. Ele nunca grava
 * a chave em lugar nenhum e nunca a imprime. O que vai para o repositório são
 * só os `.mp3` e os `.json` de visemas, que são conteúdo da demonstração.
 *
 * ## Como usar
 *
 *   1. Em `assets/treino/casos.json`, troque cada `voz` das personas pelo id de
 *      uma voz da sua conta ElevenLabs (três vozes diferentes, uma por persona).
 *   2. Com a chave no ambiente da sessão, NUNCA no arquivo:
 *
 *        ELEVENLABS_API_KEY=... node scripts/gerar-falas.mjs
 *
 *      Ou só um caso, para testar:
 *
 *        ELEVENLABS_API_KEY=... node scripts/gerar-falas.mjs pre-diabetes
 *
 *   3. Confira `assets/treino/falas/` e commite.
 *
 * É idempotente: fala que já tem `.mp3` e `.json` no disco é pulada, então
 * rodar de novo só preenche o que falta. Para regenerar uma fala, apague os
 * dois arquivos dela.
 *
 * ## O que sai
 *
 *   assets/treino/falas/<caso>/0.mp3 + 0.json        a abertura
 *   assets/treino/falas/<caso>/<n>.mp3 + <n>.json    o turno n (1-based)
 *   assets/treino/falas/_personas/<persona>/<n>.*    as falas de "não entendi"
 *
 * O `.json` tem `{ duracao, visemas: [{ t, v }] }`, com `t` em segundos desde o
 * início e `v` um de: sil, aa, E, I, O, U, PP, FF, SS, DD. É o conjunto de
 * bocas que o avatar precisa saber fazer; o mapeamento de letra para boca está
 * em `visemaDaLetra`, e é dele que a variedade da boca depende.
 */

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CASOS = path.join(RAIZ, "assets", "treino", "casos.json");
const SAIDA = path.join(RAIZ, "assets", "treino", "falas");

/** Português do Brasil, com a voz seguindo a pontuação. */
const MODELO = "eleven_multilingual_v2";
/** Pausa entre chamadas: a conta gratuita e a inicial têm limite por minuto. */
const PAUSA_MS = 600;

const chave = process.env.ELEVENLABS_API_KEY;
if (!chave) {
  console.error(
    "Falta ELEVENLABS_API_KEY no ambiente. Passe na linha de comando, nunca grave em arquivo.",
  );
  process.exit(2);
}

const soEsteCaso = process.argv[2] ?? null;

/**
 * De letra escrita para boca desenhada, em português.
 *
 * É grafema, não fonema: "casa" tem dois `a` e a boca abre nos dois, mesmo que o
 * segundo seja mais fechado na fala. Para a demonstração isso basta, e é o que
 * o alinhamento por caractere permite sem um fonetizador.
 */
function visemaDaLetra(letra) {
  const l = letra.toLowerCase();
  if ("aáàâã".includes(l)) return "aa";
  if ("eéê".includes(l)) return "E";
  if ("ií".includes(l)) return "I";
  if ("oóôõ".includes(l)) return "O";
  if ("uú".includes(l)) return "U";
  if ("mbp".includes(l)) return "PP";
  if ("fv".includes(l)) return "FF";
  if ("szçxj".includes(l)) return "SS";
  if ("tdnlrkgqh".includes(l)) return "DD";
  return "sil";
}

/**
 * O alinhamento por caractere vira uma sequência de bocas sem repetição.
 *
 * Duas letras seguidas com a mesma boca viram um só trecho, e a boca fechada
 * ("sil") entra explicitamente nos espaços e na pontuação, senão a última vogal
 * ficaria aberta até a fala seguinte.
 */
function linhaDoTempo(alinhamento) {
  const letras = alinhamento.characters;
  const inicios = alinhamento.character_start_times_seconds;
  const fins = alinhamento.character_end_times_seconds;
  const visemas = [];
  let ultimo = null;
  for (let i = 0; i < letras.length; i++) {
    const v = visemaDaLetra(letras[i]);
    if (v === ultimo) continue;
    visemas.push({ t: Math.round(inicios[i] * 1000) / 1000, v });
    ultimo = v;
  }
  const duracao = fins.length ? Math.round(fins[fins.length - 1] * 1000) / 1000 : 0;
  if (ultimo !== "sil") visemas.push({ t: duracao, v: "sil" });
  return { duracao, visemas };
}

async function existe(caminho) {
  try {
    await access(caminho);
    return true;
  } catch {
    return false;
  }
}

async function sintetizar(voz, texto) {
  const resposta = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voz)}/with-timestamps`,
    {
      method: "POST",
      headers: {
        "xi-api-key": chave,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        text: texto,
        model_id: MODELO,
        output_format: "mp3_44100_64",
      }),
    },
  );
  if (!resposta.ok) {
    // O corpo do erro da ElevenLabs não traz a chave, então pode ir para o log.
    const corpo = await resposta.text().catch(() => "");
    throw new Error(`ElevenLabs respondeu ${resposta.status}: ${corpo.slice(0, 300)}`);
  }
  const dados = await resposta.json();
  if (!dados.audio_base64 || !dados.alignment) {
    throw new Error("Resposta sem áudio ou sem alinhamento.");
  }
  return {
    audio: Buffer.from(dados.audio_base64, "base64"),
    visemas: linhaDoTempo(dados.alignment),
  };
}

async function gravarFala(pasta, indice, voz, texto, contagem) {
  const mp3 = path.join(pasta, `${indice}.mp3`);
  const json = path.join(pasta, `${indice}.json`);
  if ((await existe(mp3)) && (await existe(json))) {
    contagem.puladas++;
    return;
  }
  const { audio, visemas } = await sintetizar(voz, texto);
  await mkdir(pasta, { recursive: true });
  await writeFile(mp3, audio);
  await writeFile(json, JSON.stringify(visemas));
  contagem.geradas++;
  contagem.caracteres += texto.length;
  console.log(`  ${path.relative(RAIZ, mp3)}  ${visemas.duracao}s`);
  await new Promise((r) => setTimeout(r, PAUSA_MS));
}

const dados = JSON.parse(await readFile(CASOS, "utf8"));
const personas = new Map(dados.personas.map((p) => [p.id, p]));

for (const persona of dados.personas) {
  if (persona.voz.startsWith("ELEVENLABS_VOICE_ID_")) {
    console.error(
      `A persona "${persona.id}" ainda está com a voz de exemplo em casos.json. Troque pelo id de uma voz da sua conta.`,
    );
    process.exit(2);
  }
}

const contagem = { geradas: 0, puladas: 0, caracteres: 0 };

for (const persona of dados.personas) {
  if (soEsteCaso) break;
  console.log(`persona ${persona.id}`);
  const pasta = path.join(SAIDA, "_personas", persona.id);
  for (let i = 0; i < persona.nao_entendi.length; i++) {
    await gravarFala(pasta, i, persona.voz, persona.nao_entendi[i], contagem);
  }
}

for (const caso of dados.casos) {
  if (soEsteCaso && caso.id !== soEsteCaso) continue;
  const persona = personas.get(caso.persona);
  if (!persona) throw new Error(`Caso ${caso.id} aponta para persona inexistente.`);
  console.log(`caso ${caso.id} (${persona.nome})`);
  const pasta = path.join(SAIDA, caso.id);
  await gravarFala(pasta, 0, persona.voz, caso.abertura, contagem);
  for (let i = 0; i < caso.turnos.length; i++) {
    await gravarFala(pasta, i + 1, persona.voz, caso.turnos[i].resposta, contagem);
  }
}

console.log(
  `\n${contagem.geradas} falas geradas, ${contagem.puladas} já existiam, ${contagem.caracteres} caracteres gastos.`,
);
