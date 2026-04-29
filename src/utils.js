// utils.js

function formatDate(dt) {
  const d = new Date(dt);
  let zero = n => n.toString().padStart(2, '0');
  return zero(d.getDate()) + '/' + zero(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + zero(d.getHours()) + ':' + zero(d.getMinutes());
}

module.exports = {
  formatDate,
};
