// popup.js

let selectedSessionIdx = null;

function renderSessions() {
  const sessionsList = document.getElementById('sessionsList');
  const sessionTabs = document.getElementById('sessionTabs');
  sessionsList.innerHTML = '';
  sessionTabs.innerHTML = '';
  chrome.storage.local.get('sessions', data => {
    const sessions = data.sessions || [];
    // Seleciona sempre uma sessão válida
    if(selectedSessionIdx === null && sessions.length>0) selectedSessionIdx = 0;
    if(selectedSessionIdx !== null && selectedSessionIdx >= sessions.length) selectedSessionIdx = sessions.length-1;
    sessions.forEach((sess, idx) => {
      const isActive = idx === selectedSessionIdx;
      const li = document.createElement('li');
      li.className = 'sessao' + (isActive ? ' active' : '');
      li.innerHTML = `
        <div class='sess-info'>
          <div class='sess-main'>${sess.name}</div>
          <div class="sess-btns">
            <button data-open="${idx}" title="Restaurar sessão" aria-label="Restaurar sessão">📄</button>
            <button data-update="${idx}" title="Atualizar sessão" aria-label="Atualizar sessão">💾</button>
            <button data-delete="${idx}" title="Remover sessão" aria-label="Remover sessão">🗑️</button>
          </div>
          <small>${sess.tabs.length} separadores</small>
        </div>
      `;
      li.onclick = (ev) => {
        if (!ev.target.closest('button')) {
          selectedSessionIdx = idx;
          renderSessions();
        }
      };
      sessionsList.appendChild(li);
    });
    // Mostra separadores só da sessão ativa
    if(selectedSessionIdx !== null && sessions[selectedSessionIdx]) {
      const sess = sessions[selectedSessionIdx];
      let titlesBox = '<div class="sess-titles">';
      (sess.tabs||[]).forEach((tab, tabIdx) => {
        let t = tab.title || tab.url || '';
        if(t.length > 55) t = t.substring(0,55)+"...";
        titlesBox += `<div class='sess-title-item' data-tabidx='${tabIdx}' data-sessidx='${selectedSessionIdx}' title='${tab.title||tab.url||''}'>${t}</div>`;
      });
      titlesBox += '</div>';
      sessionTabs.innerHTML = titlesBox;
    }
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
      selectedSessionIdx = sessions.length - 1;
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
        if (sess.windowId !== win.id) {
          // aviso igual
          return;
        }
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

document.getElementById('sessionTabs').onclick = e => {
  if (e.target.classList.contains('sess-title-item')) {
    const sessidx = Number(e.target.dataset.sessidx);
    const tabidx = Number(e.target.dataset.tabidx);
    chrome.storage.local.get('sessions', data => {
      const session = (data.sessions||[])[sessidx];
      if (!session) return;
      chrome.windows.getCurrent({populate:true}, win => {
        if (win.id !== session.windowId) return;
        const match = win.tabs.find(t => t.url === (session.tabs[tabidx]?.url));
        if (!match) return;
        chrome.tabs.update(match.id, {active:true}, ()=>{
          chrome.windows.update(win.id, {focused:true});
        });
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', renderSessions);
