# Gio Care · Redesign (prévia)

Prévia visual do redesign do [giocare.app](https://giocare.app), sistema para médicos nutrólogos.

Direção visual **"Nascente"**: gradiente magenta→coral da marca sobre neutro vinho/amora,
tipografia editorial (Fraunces + Bricolage Grotesque + Space Mono) e o protocolo ABCDEFS
como espectro de cor.

> Showcase estático, publicado só para apresentação. O produto real (Next.js + Supabase + IA)
> roda em servidor; esta prévia é apenas a camada visual da landing e das telas.
> As telas de vitrine usam **dados ilustrativos** — não refletem dados reais do produto.

## Rodar local

```bash
npx serve   # http://localhost:4321
```

Ou qualquer servidor estático apontando para a raiz.

## Estrutura

- `index.html` — landing
- `dashboard.html`, `pacientes.html`, `consulta.html`, … — telas internas (protótipo)
- `vitrine-painel.html`, `vitrine-app-*.html` — telas de vitrine da landing (dados ilustrativos)
- `assets/tokens.css` — tokens "Nascente" (nomes espelham o app para portar direto)
- `assets/landing.css` — estilos da landing
- `assets/app.css` — casca das telas internas (web)
- `assets/vitrine-app.css` — casca mobile das telas de vitrine
- `assets/img/` — marca Gio Care

## Direitos

Conteúdo proprietário. Ver [LICENSE](LICENSE) — todos os direitos reservados.
