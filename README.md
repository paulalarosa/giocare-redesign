# Gio Care · Redesign (prévia)

Prévia visual do redesign do [giocare.app](https://giocare.app), sistema para médicos
nutrólogos, uma iniciativa da **Nutrology Academy**.

Direção visual **"Nascente"**, ancorada nas cores da marca Nutrology:

- **Vermelho → coral** (`#96325A` → `#DC5050` → `#E6643C`) — o espectro do protocolo ABCDEFS
  e a assinatura da marca (amostrado do logo da Academy; vermelho-tijolo, não rosa).
- **Navy `#122535`** — o fundo escuro das bandas e do modo escuro (cor do brasão Fellowship).
- **Papel quente `#F6F4F1`** — o fundo claro; tinta em carvão quente `#2A2320`.
- Tipografia editorial: **Fraunces** (display) + **Schibsted Grotesk** (texto e rótulos) + **Spline Sans Mono**
  (só onde número precisa alinhar em coluna: hora, valor, medida, faixa de referência).

> Showcase estático, publicado só para apresentação. O produto real (Next.js + Supabase + IA)
> roda em servidor; esta prévia é apenas a camada visual da landing e das telas.
> As telas de vitrine usam **dados ilustrativos** — não refletem dados reais do produto.

## Rodar local

```bash
npx serve   # http://localhost:4321
```

Ou qualquer servidor estático apontando para a raiz.

## Estrutura

- `index.html` — landing (bandas alternadas, cada seção com estrutura própria, animações GSAP)
- `dashboard.html`, `pacientes.html`, `consulta.html`, `agenda.html`, `financeiro.html`, … — telas
  internas do protótipo (o "Acessar")
- `vitrine-painel.html`, `vitrine-app-*.html` — telas de vitrine embutidas na landing (dados ilustrativos)
- `assets/tokens.css` — tokens "Nascente" (nomes espelham o app real, para portar direto)
- `assets/landing.css` — estilos da landing
- `assets/app.css` — casca das telas internas (web)
- `assets/vitrine-app.css` — casca mobile das telas de vitrine
- `assets/img/` — marca Gio Care + selo da Nutrology Academy

## Notas de design

- **Tema claro e escuro** (toggle no topo). Os frames de produto (janela do painel, celular)
  têm cor fixa e não seguem o tema, para renderizar certo nos dois.
- **Cores semânticas** com variante clara no escuro para passar contraste sobre o navy
  (chips de status: verde/azul/âmbar/vermelho/cinza, todos distintos em ambos os temas).
- **Sistema de tokens** pensado para portar direto ao app em Next.js.

## Direitos

Conteúdo proprietário. Ver [LICENSE](LICENSE) — todos os direitos reservados.
