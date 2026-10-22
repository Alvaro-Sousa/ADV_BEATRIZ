# Landing page · Beatriz Morais Fernandes (OAB/PB 34.523)

Stack: HTML + CSS + JS (ES modules) + three.js (partículas) · Build: Vite · Deploy: Vercel.

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera dist/
```

## Pontos de atenção
- `index.html`: texto da seção **Sobre** é genérico (marcado com comentário) para revisão.
- `src/js/whatsapp.js`: áreas, situações e mensagem do WhatsApp.
- `vercel.json`: headers de segurança (CSP estrita, HSTS etc.). Se adicionar o Google Maps, o `frame-src` já está liberado.
- Mapa: preencher `data-map-src` em `#mapa` (e remover `hidden`) quando houver o link de incorporação.
- Quando houver domínio: adicionar `canonical`, `og:url` e `sitemap.xml`.
- Logo: `src/assets/logo/logo-mark.svg` (também usada como favicon).
