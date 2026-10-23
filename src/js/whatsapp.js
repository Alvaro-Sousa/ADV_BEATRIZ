// Formulário que monta uma mensagem pré-definida e abre o WhatsApp da advogada.
// Sem backend e sem armazenamento de dados. Todo texto vem de dicionário fixo.
const PHONE = '558398007272';

const AREAS = {
  trabalhista: {
    label: 'Direito do Trabalho',
    situacoes: [
      'Verbas rescisórias ou FGTS não pagos',
      'Horas extras e adicionais',
      'Reconhecimento de vínculo (sem carteira assinada)',
      'Assédio moral ou sexual no trabalho',
      'Acidente de trabalho ou doença ocupacional',
      'Outra situação trabalhista',
    ],
  },
  previdenciario: {
    label: 'Direito Previdenciário',
    situacoes: [
      'Aposentadoria (idade, tempo de contribuição, especial ou rural)',
      'Benefício por incapacidade (auxílio-doença ou invalidez)',
      'BPC/LOAS (idoso ou pessoa com deficiência)',
      'Pensão por morte ou salário-maternidade',
      'Benefício negado, cortado ou em atraso no INSS',
      'Outra situação previdenciária',
    ],
  },
  civil: {
    label: 'Direito Civil',
    situacoes: [
      'Contratos e cobranças',
      'Indenização por danos morais ou materiais',
      'Direito do consumidor',
      'Família (divórcio, pensão ou guarda)',
      'Herança e inventário',
      'Outra situação cível',
    ],
  },
};

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

// Remove caracteres de controle e espaços extras; limita o tamanho.
const clean = (v, max) => String(v || '').replace(/[\u0000-\u001F\u007F<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

function buildMessage({ area, situacao, nome, uf }) {
  const a = AREAS[area];
  if (!a || !a.situacoes.includes(situacao)) return null;
  const quem = nome ? `Me chamo ${nome}${uf ? `, sou de ${uf}` : ''}.` : (uf ? `Sou de ${uf}.` : '');
  return `Olá, Dra. Beatriz! ${quem} Gostaria de uma orientação sobre ${a.label}: ${situacao}. Podemos conversar?`.replace(/\s{2,}/g, ' ');
}

export function initWhatsApp() {
  const form = document.getElementById('wform');
  if (!form) return;
  const select = document.getElementById('situacao');
  const setSit = document.getElementById('situacaoSet');
  const nome = document.getElementById('nome');
  const uf = document.getElementById('uf');
  const preview = document.getElementById('preview');
  const error = document.getElementById('formError');

  UFS.forEach((u) => uf.append(new Option(u, u)));

  const state = () => ({
    area: (form.querySelector('input[name="area"]:checked') || {}).value || '',
    situacao: select.value,
    nome: clean(nome.value, 60),
    uf: UFS.includes(uf.value) ? uf.value : '',
  });

  const fillSituacoes = (area) => {
    select.replaceChildren(new Option(area ? 'Selecione a situação' : 'Selecione primeiro a área', ''));
    const a = AREAS[area];
    if (a) a.situacoes.forEach((s) => select.append(new Option(s, s)));
    setSit.disabled = !a;
  };

  const refresh = () => {
    const msg = buildMessage(state());
    preview.textContent = msg || 'Escolha a área e a situação para ver a mensagem.';
    error.hidden = true;
  };

  form.addEventListener('change', (e) => {
    if (e.target.name === 'area') fillSituacoes(e.target.value);
    refresh();
  });
  nome.addEventListener('input', refresh);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = buildMessage(state());
    if (!msg) {
      error.textContent = 'Por favor, escolha a área e a situação antes de enviar.';
      error.hidden = false;
      return;
    }
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
    const w = window.open(url, '_blank', 'noopener,noreferrer');
    if (!w) window.location.href = url;
  });

  // Botões "Falar sobre este caso" nas áreas: pré-seleciona a área no formulário.
  document.querySelectorAll('[data-pick]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const radio = form.querySelector(`input[name="area"][value="${btn.dataset.pick}"]`);
      if (!radio) return;
      radio.checked = true;
      fillSituacoes(radio.value);
      refresh();
    });
  });
}
