// popup.js

function renderSessions() {
  const sessionsList = document.getElementById('sessionsList');
  sessionsList.innerHTML = '';
  chrome.storage.local.get('sessions', data => {
    const sessions = data.sessions || [];
    sessions.forEach((sess, idx) => {
      // Títulos para a coluna
      const titlesList = document.createElement('div');
      titlesList.className = 'sess-titles';
      (sess.tabs || []).forEach(tab => {
        let t = tab.title || tab.url || '';
        if(t.length > 55) t = t.substring(0,55)+"...";
        const ti = document.createElement('div');
        ti.className = 'sess-title-item';
        ti.title = tab.title || tab.url || '';
        ti.textContent = t;
        titlesList.appendChild(ti);
      });
      // Nome, info e botões
      const infoDiv = document.createElement('div');
      infoDiv.className = 'sess-info';
      infoDiv.innerHTML = `
        <div class='sess-main'><b>${sess.name}</b></div>
        <button data-open="${idx}" title="Restaurar sessão" aria-label="Restaurar sessão">📄</button>
        <button data-update="${idx}" title="Atualizar sessão" aria-label="Atualizar sessão">💾</button>
        <button data-delete="${idx}" title="Remover sessão" aria-label="Remover sessão">🗑️</button>
        <br><small>${sess.tabs.length} separadores</small>
      `;
      // Container sessão
      const li = document.createElement('li');
      li.className = 'sessao';
      li.appendChild(infoDiv);
      li.appendChild(titlesList);
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
    const idx = Number(e.target.dataset.update);
    chrome.storage.local.get('sessions', data => {
      const sessions = data.sessions || [];
      const sess = sessions[idx];
      if (!sess) return;
      chrome.windows.getCurrent({populate:true}, win => {
        // Só permite atualizar se for a mesma janela
        if (sess.windowId !== win.id) {
          // aviso igual
          return;
        }
        // Atualiza sempre separadores da janela atual!
        const tabsNow = win.tabs.filter(t => !t.pinned && t.url && !t.url.startsWith('chrome'));
        sess.tabs = tabsNow.map(t=>({url:t.url, title:t.title||''}));
        sess.timestamp = Date.now();
        chrome.storage.local.set({sessions}, renderSessions);
      });
    });
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
