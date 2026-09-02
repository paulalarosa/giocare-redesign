# Giocare · Redesign (prévia)

Prévia visual do redesign do [giocare.app](https://giocare.app), sistema para médicos
nutrólogos, uma iniciativa da **Nutrology Academy**.

**No ar:** https://paulalarosa.github.io/giocare-redesign/

> Showcase estático, publicado só para apresentação. O produto real (Next.js + Supabase + IA)
> roda em servidor; esta prévia é a camada visual da landing e das telas do consultório.
> Todos os dados são **ilustrativos** — nomes, exames e valores não são de pacientes reais.

## Quem manda no design

**O aplicativo é a base. Este repositório vem depois.**

No começo era o contrário: as telas nasciam aqui em HTML e eram traduzidas para React. Desde
setembro de 2026 a ordem inverteu. Mudança de fluxo, de interface ou de conteúdo nasce no
aplicativo, em React, e este protótipo é atualizado depois para refletir o que ficou decidido.

O caminho inverso não vale. Este repositório guarda decisões que o aplicativo já revisou, e
copiar daqui para lá reintroduz o que foi resolvido. Quando as duas telas discordarem, a do
aplicativo está certa.

O que continua nascendo aqui: a landing e as páginas públicas, que o aplicativo importa pelo
`scripts/sync-landing.ts`.

## Direção visual "Nascente"

Ancorada nas cores da marca Nutrology:

- **Vermelho → coral** (`#96325A` → `#DC5050` → `#E6643C`) — o espectro do protocolo ABCDEFS
  e a assinatura da marca (amostrado do logo da Academy; vermelho-tijolo, não rosa).
- **Navy `#122535`** — o fundo escuro das bandas e do modo escuro (cor do brasão Fellowship).
- **Papel quente `#F6F4F1`** — o fundo claro; tinta em carvão quente `#2A2320`.
- Tipografia editorial: **Fraunces** (display) + **Schibsted Grotesk** (texto e rótulos) +
  **Spline Sans Mono**, esta só onde número precisa alinhar em coluna — hora, valor, medida,
  faixa de referência. Rótulo em maiúscula usa a sans em semibold, nunca a mono.

## Rodar local

```bash
npx serve -p 4321
```

Sem build, sem dependências: qualquer servidor estático apontando para a raiz serve.

## Estrutura

Marcação, estilo e comportamento vivem separados. Nenhuma página tem `<style>`, `<script>`
inline ou handler `onclick`.

```
index.html              landing (bandas alternadas, cada seção com estrutura própria, GSAP)
contato · criar-conta · login · transparencia · privacidade · termos · 404
                        páginas públicas, com o esqueleto da landing

dashboard · pacientes · paciente-ficha · novo-paciente · agenda · nova-consulta
consulta-inicio · consulta · horarios · financeiro · exames · receitas
prontuario · perfil     telas do consultório (o "Acessar")

vitrine-painel · vitrine-app-*   telas embutidas na landing como demonstração

assets/tokens.css       tokens "Nascente" (nomes espelham o app real, para portar direto)
assets/landing.css      landing e páginas públicas
assets/app.css          casca das telas do consultório
assets/vitrine-app.css  casca mobile das telas de vitrine
assets/app.js           comportamento comum do painel: tema, gravação, recados, ações da agenda
assets/landing.js       comportamento da landing
assets/boot.js          guard anti-flash, carregado antes da pintura
assets/pagina/<nome>.*  estilo e comportamento de uma página só
```

## A consulta

A tela central do produto. Quatro fases numa barra de ação fixa: **Gravação → Anamnese →
Conduta → Encerramento**, com uma única ação por fase.

- A IA monta o rascunho enquanto a consulta acontece, **aplica os ajustes que encontra e
  diz o que fez** — cada um com desfazer que reverte também o efeito no trilho.
- A anamnese é organizada pelas **sete letras do ABCDEFS** (Alimentação, Biomarcadores,
  Composição corporal, Drogas, Exercícios, Foco, Sono), cada decisão colada ao fato que a
  motivou. O que não foi conversado vira pendência com o motivo concreto.
- O alvo calórico segue o manual clínico da Academy: **gasto do dia menos déficit de 300 a
  500 kcal**, com a taxa metabólica medida pela bioimpedância.
- Encerrar fecha tudo junto: para a gravação, emite os três documentos, lança o pagamento
  no financeiro e assina o prontuário.
- **A IA entra sozinha no rascunho; o prontuário só é assinado quando a médica valida.**
  O uso de IA fica carimbado conforme a Resolução CFM 2.454/2026.

## Notas de implementação

- **Tema claro e escuro.** Os frames de produto (janela do painel, celular) têm cor fixa e
  não seguem o tema, para renderizar certo nos dois.
- **Cores semânticas** com variante clara no escuro para passar contraste sobre o navy —
  os cinco chips de status são distintos em ambos os temas.
- **Telas pequenas têm camada própria** abaixo de 560px: o rail de ícones vira barra
  inferior e a tipografia escala junto. Medido no ar em 375px com toque emulado, em painel,
  agenda, consulta, pacientes, prontuários e financeiro: zero rolagem horizontal e zero alvo
  abaixo de 40px — pacientes tinha 25 antes desta rodada.
- **O piso de toque pergunta pelo ponteiro, não pela largura.** A regra de base vive em
  `@media (pointer: coarse)`, porque um iPad em retrato tem 768px e é dedo. São 40px, e não
  44, porque 44 empurra a linha da agenda e a lista do prontuário para além da dobra.
- **Acessibilidade:** um `<main>` por página, link de pular navegação, rótulo ligado ao
  campo por `for`/`id`, ícone decorativo com `aria-hidden`, movimento respeitando
  `prefers-reduced-motion`.
- **Buscador:** as telas do consultório são `noindex` — demonstração não compete com o
  produto real. `robots.txt` e `sitemap.xml` cobrem só as páginas públicas.
- **Sistema de tokens** com os mesmos nomes do aplicativo, para que a comparação entre os
  dois seja de olhar e não de tradução.

## Direitos

Conteúdo proprietário. Ver [LICENSE](LICENSE) — todos os direitos reservados.
