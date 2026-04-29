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

module.exports = {
  formatDate,
  diffUrls,
};
