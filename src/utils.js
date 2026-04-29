// utils.js

function formatDate(dt) {
  const d = new Date(dt);
  let zero = n => n.toString().padStart(2, '0');
  return (
    zero(d.getUTCDate()) + '/' +
    zero(d.getUTCMonth() + 1) + '/' +
    d.getUTCFullYear() + ' ' +
    zero(d.getUTCHours()) + ':' +
    zero(d.getUTCMinutes()) + ' UTC'
  );
}

/**
 * Compara duas listas de URLs.
 * @param {string[]} current - URLs atualmente abertos na janela
 * @param {string[]} expected - URLs que deveriam estar (sessao)
 * @returns {{ extra: string[], missing: string[] }}
 */
function diffUrls(current, expected) {
  const extra = current.filter(u => !expected.includes(u));
  const missing = expected.filter(u => !current.includes(u));
  return { extra, missing };
}

/**
 * Trunca texto para um máximo de caracteres, acrescentando ... se necessário.
 * @param {string} text 
 * @param {number} max 
 * @returns {string}
 */
function truncate(text, max = 120) {
  if (typeof text !== 'string') return '';
  return text.length > max ? text.substring(0, max) + '...' : text;
}

/**
 * Recebe uma lista de separadores e extrai apenas os válidos para sessão
 * (não pinned e com url válida não-chrome)
 * @param {Array<{pinned:boolean, url:string, title?:string}>} tabs
 * @returns {Array<{url:string, title:string}>}
 */
function extractSessionTabs(tabs) {
  return (tabs||[])
    .filter(t => !t.pinned && t.url && !t.url.startsWith('chrome'))
    .map(t => ({ url: t.url, title: t.title||'' }));
}

module.exports = {
  formatDate,
  diffUrls,
  truncate,
  extractSessionTabs,
};
