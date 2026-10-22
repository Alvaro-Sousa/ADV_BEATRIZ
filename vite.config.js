import { defineConfig } from 'vite';

export default defineConfig({
  // Vite só expõe ao navegador variáveis com prefixo VITE_. Este site não usa nenhuma,
  // e nenhum segredo deve ser colocado em variáveis VITE_* (elas vão para o JS público).
  envPrefix: 'VITE_',
  build: {
    target: 'es2020',
    sourcemap: false, // não publicar o código-fonte original
    assetsInlineLimit: 0, // nada inline: compatível com CSP estrita
    cssCodeSplit: false,
    chunkSizeWarningLimit: 700,
  },
});
