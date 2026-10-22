# Segurança e disponibilidade

## O que já está no código
| Risco | Proteção |
|---|---|
| Vazamento de `.env` | Site 100% estático: só `dist/` é publicado. `.env*` estão no `.gitignore` e no `.vercelignore`. O `npm run build` roda `scripts/check-security.mjs`, que **falha o deploy** se houver `.env`, `.map`, `.git`, chaves ou padrões de segredo no `dist/`. `sourcemap: false`. |
| XSS / injeção de script | CSP com `default-src 'none'`, scripts e estilos só `'self'` (sem inline, sem eval). O código usa `textContent`/`new Option`, nunca `innerHTML` com entrada do usuário. |
| Clickjacking | `frame-ancestors 'none'` e `X-Frame-Options: DENY` |
| Downgrade e sniffing | HSTS com preload, `X-Content-Type-Options: nosniff`, `upgrade-insecure-requests` |
| Vazamento de dados via browser | `Referrer-Policy`, `Permissions-Policy` (câmera, microfone, geolocalização desligados), COOP/CORP |
| Abuso do formulário | Sem backend: o formulário só monta uma URL `wa.me`. Nome limitado a 60 caracteres e sanitizado. Situações vêm de lista fixa. |
| Cadeia de suprimentos | Versões exatas (`save-exact`), lockfile, `npm audit` limpo, sem CDN de terceiros (fontes e three.js locais) |
| Queda por falha de servidor | Não há servidor próprio nem banco. Tudo é servido pela CDN da Vercel. |

## O que precisa ser feito no painel da Vercel (não dá para fazer pelo código)
1. **Firewall → Bot Protection**: ativar *Bot Protection* (modo Challenge).
2. **Firewall → Rate Limiting** (regra personalizada): por exemplo, limitar a ~100 requisições por minuto por IP em `/*`, com ação *Challenge* ou *Deny*.
3. **Firewall → Attack Challenge Mode**: deixar *desligado* normalmente. Ligar apenas se o site estiver sob ataque.
4. **Settings → Deployment Protection**: manter proteção nos *previews* (Vercel Authentication) para não expor versões de teste.
5. **Settings → Environment Variables**: este site não usa nenhuma. Se um dia usar, nunca use o prefixo `VITE_` para segredos, pois eles viram JS público.
6. **Domínio**: usar o domínio da Vercel com HTTPS automático. Colocar o domínio em https://hstspreload.org depois de confirmar que tudo funciona.
7. **Conta**: ativar 2FA na Vercel e no GitHub, e dar acesso mínimo a quem não precisa de tudo.
8. **Alertas**: ativar notificações de falha de deploy e de uso (Settings → Notifications).

> A mitigação de DDoS das camadas 3 e 4 é automática na Vercel. Os itens acima cobrem a camada 7 (bots e abuso).

## Rotina
- Antes de cada deploy: `npm run build` (já inclui a verificação de segurança).
- Mensal: `npm audit` e conferir atualizações de `three` e `vite`.
- Após o primeiro deploy: testar os headers em https://securityheaders.com e https://observatory.mozilla.org, e confirmar que `/.env`, `/.git/config` e `/package.json` retornam **404**.
