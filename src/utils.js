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

function diffUrls(current, expected) {
  const extra = current.filter(u => !expected.includes(u));
  const missing = expected.filter(u => !current.includes(u));
  return { extra, missing };
}

function truncate(text, max = 120) {
  if (typeof text !== 'string') return '';
  return text.length > max ? text.substring(0, max) + '...' : text;
}

function extractSessionTabs(tabs) {
  return (tabs||[])
    .filter(t => !t.pinned && t.url && !t.url.startsWith('chrome'))
    .map(t => ({ url: t.url, title: t.title||'' }));
}

/**
 * Gera a mensagem a mostrar na dialog de restauro, a partir das diferenças extra/missing
 * @param {string[]} extra
 * @param {string[]} missing
 * @returns {string}
 */
function buildRestoreDiffMessage(extra, missing) {
  let msg = '';
  if(extra.length > 0)
    msg += 'Os seguintes separadores vão ser FECHADOS nesta janela:\n\n'+extra.join('\n')+'\n\n';
  if(missing.length > 0)
    msg += 'Os seguintes separadores vão ser ABERTOS (faltam nesta janela):\n\n'+missing.join('\n')+'\n\n';
  msg += 'Queres mesmo restaurar esta sessão nesta janela?';
  return msg;
}

/**
 * Ajusta o índice de sessão selecionado para os limites válidos do array.
 * @param {number|null} idx
 * @param {number} length
 * @returns {number|null}
 */
function clampIndex(idx, length) {
  if (idx === null && length > 0) return 0;
  if (idx !== null && idx >= length) return length - 1;
  return idx;
}

/**
 * Devolve o label legível de um separador (título ou url ou string vazia).
 * @param {{title?:string, url?:string}} tab
 * @returns {string}
 */
function tabLabel(tab) {
  return tab.title || tab.url || '';
}

/**
 * Remove um separador de uma sessão pelo índice.
 * @param {Array} sessions
 * @param {number} sessIdx
 * @param {number} tabIdx
 * @returns {Array}
 */
function removeSessionTab(sessions, sessIdx, tabIdx) {
  return sessions.map((s, i) => {
    if (i !== sessIdx) return s;
    return { ...s, tabs: s.tabs.filter((_, ti) => ti !== tabIdx) };
  });
}

/**
 * Calcula as operações de mover separadores para corresponder à ordem da sessão.
 * @param {string[]} sessionUrls - URLs na ordem desejada
 * @param {Array<{id:number, url:string}>} windowTabs - separadores atuais da janela
 * @returns {Array<{id:number, index:number}>}
 */
function buildTabMoveOrder(sessionUrls, windowTabs) {
  const urlToId = {};
  windowTabs.forEach(t => { urlToId[t.url] = t.id; });
  return sessionUrls
    .map((url, idx) => urlToId[url] ? { id: urlToId[url], index: idx } : null)
    .filter(Boolean);
}

/* istanbul ignore next */
if (typeof module !== 'undefined') module.exports = {
  formatDate,
  diffUrls,
  truncate,
  extractSessionTabs,
  buildRestoreDiffMessage,
  clampIndex,
  tabLabel,
  removeSessionTab,
  buildTabMoveOrder,
};
