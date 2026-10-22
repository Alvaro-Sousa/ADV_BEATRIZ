// Verificação de segurança pós-build. Falha o build (e portanto o deploy na Vercel)
// se algo sensível ou inseguro for encontrado em dist/ ou na configuração.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const problems = [];
const fail = (m) => problems.push(m);

if (!fs.existsSync(root)) { console.error('dist/ não existe. Rode o build antes.'); process.exit(1); }

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  return e.isDirectory() ? walk(p) : [p];
});
const files = walk(root);

// 1) Arquivos que nunca podem ser publicados
const forbidden = /(^|\/)(\.env.*|\.git.*|.*\.map|.*\.pem|.*\.key|package(-lock)?\.json|vite\.config\.js|.*\.md)$/i;
files.forEach((f) => { const rel = path.relative(root, f); if (forbidden.test(rel)) fail(`Arquivo proibido no dist: ${rel}`); });

// 2) Padrões de segredos em qualquer arquivo de texto
const secretRe = /(api[_-]?key|secret|passwd|password|token|private[_-]?key)\s*[:=]\s*['"][^'"]{8,}['"]|-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}/i;
files.filter((f) => /\.(html|js|css|json|txt|svg)$/.test(f)).forEach((f) => {
  if (secretRe.test(fs.readFileSync(f, 'utf8'))) fail(`Possível segredo em ${path.relative(root, f)}`);
});

// 3) HTML compatível com a CSP: sem script/estilo inline, sem handlers on*
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  const attrs = m[1];
  if (/type=["']application\/ld\+json["']/i.test(attrs)) continue;
  if (!/\ssrc=/.test(attrs) || m[2].trim()) fail('<script> inline detectado (bloqueado pela CSP)');
}
if (/<style\b/i.test(html)) fail('<style> inline detectado');
if (/\sstyle\s*=/i.test(html)) fail('atributo style="" inline detectado');
if (/\son[a-z]+\s*=/i.test(html)) fail('handler on*="" inline detectado');
for (const m of html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)) {
  if (!/rel=["'][^"']*noopener/i.test(m[0])) fail(`target=_blank sem rel=noopener: ${m[0].slice(0, 80)}`);
}
// Recursos externos (exceto links de navegação <a> e data-map-src do Google Maps)
for (const m of html.matchAll(/(?<![\w-])(?:src|href)=["'](https?:)?\/\/[^"']+["']/gi)) {
  if (!/^<a/.test(html.slice(html.lastIndexOf('<', m.index), m.index + 2))) fail(`Recurso externo carregado: ${m[0]}`);
}

// 4) Headers de segurança presentes na vercel.json
const cfg = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const headers = Object.fromEntries((cfg.headers.find((h) => h.source === '/(.*)')?.headers || []).map((h) => [h.key.toLowerCase(), h.value]));
['content-security-policy', 'strict-transport-security', 'x-content-type-options', 'x-frame-options',
  'referrer-policy', 'permissions-policy', 'cross-origin-opener-policy'].forEach((k) => { if (!headers[k]) fail(`Header ausente: ${k}`); });
const csp = headers['content-security-policy'] || '';
if (/unsafe-inline|unsafe-eval|script-src[^;]*\*/.test(csp)) fail('CSP permite unsafe-inline/unsafe-eval/curinga em script-src');

if (problems.length) {
  console.error('\n❌ Verificação de segurança falhou:\n' + problems.map((p) => ' - ' + p).join('\n') + '\n');
  process.exit(1);
}
console.log(`✅ Verificação de segurança OK (${files.length} arquivos em dist/).`);
