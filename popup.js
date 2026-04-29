// popup.js

function renderSessions() {
  const sessionsList = document.getElementById('sessionsList');
  sessionsList.innerHTML = '';
  chrome.storage.local.get('sessions', data => {
    const sessions = data.sessions || [];
    sessions.forEach((sess, idx) => {
      const li = document.createElement('li');
      li.className = 'sessao';
      li.innerHTML = `
        <b>${sess.name}</b> <br>
        <button data-open="${idx}">Restaurar</button>
        <button data-update="${idx}">Atualizar</button>
        <button data-delete="${idx}">Remover</button>
        <small>(${sess.tabs.length} separadores)</small>
      `;
      sessionsList.appendChild(li);
    });
  });
}

document.getElementById('saveBtn').onclick = async () => {
  const name = document.getElementById('sessionName').value.trim();
  if (!name) {
    alert('Dá um nome à sessão!');
    return;
  }
  chrome.windows.getCurrent({populate: true}, win => {
    const tabs = win.tabs.filter(t => !t.pinned && t.url && !t.url.startsWith('chrome'))
      .map(t => ({url: t.url, title: t.title||''}));
    chrome.storage.local.get('sessions', data => {
      const sessions = data.sessions || [];
      sessions.push({ name, windowId: win.id, tabs, timestamp: Date.now() });
      chrome.storage.local.set({sessions}, renderSessions);
    });
  });
};

document.getElementById('sessionsList').onclick = e => {
  if (e.target.dataset.open) {
    const idx = Number(e.target.dataset.open);
    chrome.storage.local.get('sessions', data => {
      const session = (data.sessions || [])[idx];
      if (!session) return;
      chrome.windows.create({url: session.tabs.map(t=>t.url)});
    });
  } else if (e.target.dataset.update) {
    // A ser implementado nos próximos commits
  } else if (e.target.dataset.delete) {
    const idx = Number(e.target.dataset.delete);
    chrome.storage.local.get('sessions', data => {
      let sessions = data.sessions || [];
      sessions.splice(idx, 1);
      chrome.storage.local.set({sessions}, renderSessions);
    });
  }
};

document.addEventListener('DOMContentLoaded', renderSessions);
