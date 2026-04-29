// popup.js, layout colunas sessões + separadores (lado a lado)

let selectedSessionIdx = null;

function renderSessions() {
  const sessionsList = document.getElementById('sessionsList');
  const tabsTitleList = document.getElementById('tabsTitleList');
  sessionsList.innerHTML = '';
  tabsTitleList.innerHTML = '';
  chrome.storage.sync.get('sessions', data => {
    const sessions = data.sessions || [];
    selectedSessionIdx = clampIndex(selectedSessionIdx, sessions.length);
    sessions.forEach((sess, idx) => {
      const isActive = idx === selectedSessionIdx;
      const li = document.createElement('li');
      li.className = 'sessao' + (isActive ? ' active' : '');
      li.innerHTML = `
        <div class='sess-info'>
          <div class='sess-main'>${sess.name}</div>
          <div class="sess-date">Última atualização:</div>
          <div class="sess-date">${formatDate(sess.timestamp)}</div>
          <div class="sess-btns">
            <button data-open="${idx}" title="Abrir/restaurar sessão" aria-label="Abrir/restaurar sessão">📂</button>
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
      (sess.tabs||[]).forEach((tab, tabIdx) => {
        const ti = document.createElement('div');
        ti.className = 'sess-title-item';
        ti.title = tabLabel(tab);
        ti.dataset.tabidx = tabIdx;
        ti.dataset.sessidx = selectedSessionIdx;

        const favicon = document.createElement('img');
        favicon.className = 'tab-favicon';
        favicon.src = `https://www.google.com/s2/favicons?sz=16&domain_url=${encodeURIComponent(tab.url)}`;
        favicon.onerror = () => { favicon.style.visibility = 'hidden'; };

        const info = document.createElement('div');
        info.className = 'tab-info';

        const title = document.createElement('div');
        title.className = 'tab-title';
        title.textContent = truncate(tab.title || 'Sem título', 80);

        const url = document.createElement('div');
        url.className = 'tab-url';
        url.textContent = truncate(tab.url || '', 80);

        info.appendChild(title);
        info.appendChild(url);
        ti.appendChild(favicon);
        ti.appendChild(info);
        tabsTitleList.appendChild(ti);
      });
    }
  });
}

function handleSave() {
  const name = document.getElementById('sessionName').value.trim();
  if (!name) {
    alert('Dá um nome à sessão!');
    return;
  }
  chrome.windows.getCurrent({populate: true}, win => {
    const tabs = extractSessionTabs(win.tabs);
    chrome.storage.sync.get('sessions', data => {
      const sessions = data.sessions || [];
      sessions.push({ name, windowId: win.id, tabs, timestamp: Date.now() });
      selectedSessionIdx = sessions.length - 1;
      chrome.storage.sync.set({sessions}, renderSessions);
    });
  });
}

function handleOpen(idx) {
  chrome.storage.sync.get('sessions', data => {
    const sessions = data.sessions || [];
    const session = sessions[idx];
    if (!session) return;
    chrome.windows.get(session.windowId, {populate: true}, win => {
      if (chrome.runtime.lastError || !win) {
        chrome.windows.create({url: session.tabs.map(t => t.url)}, newWin => {
          session.windowId = newWin.id;
          chrome.storage.sync.set({sessions}, renderSessions);
        });
        return;
      }
      const winUrls = extractSessionTabs(win.tabs).map(t => t.url);
      const sessUrls = session.tabs.map(t => t.url);
      const { extra, missing } = diffUrls(winUrls, sessUrls);
      if (extra.length === 0 && missing.length === 0 && winUrls.length === sessUrls.length) {
        chrome.windows.update(win.id, {focused: true});
        if (win.tabs && win.tabs[0]) chrome.tabs.update(win.tabs[0].id, {active: true});
        return;
      }
      const msg = buildRestoreDiffMessage(extra, missing);
      if (!confirm(msg)) return;
      const tabsToClose = win.tabs.filter(t => extra.includes(t.url)).map(t => t.id);
      if (tabsToClose.length) chrome.tabs.remove(tabsToClose);
      for (let u of missing) chrome.tabs.create({windowId: win.id, url: u});
      chrome.windows.update(win.id, {focused: true});
      if (win.tabs && win.tabs[0]) chrome.tabs.update(win.tabs[0].id, {active: true});
    });
  });
}

function handleUpdate(idx) {
  chrome.storage.sync.get('sessions', data => {
    const sessions = data.sessions || [];
    const sess = sessions[idx];
    if (!sess) return;
    chrome.windows.getCurrent({populate: true}, win => {
      if (sess.windowId !== win.id) {
        const warn = document.getElementById('warn_'+idx);
        if (warn) {
          warn.textContent = ' Têm de estar na janela original para atualizar.';
          setTimeout(() => warn.textContent = '', 4000);
        } else {
          alert('Têm de estar na janela original para atualizar.');
        }
        return;
      }
      sess.tabs = extractSessionTabs(win.tabs);
      sess.timestamp = Date.now();
      chrome.storage.sync.set({sessions}, renderSessions);
    });
  });
}

function handleDelete(idx) {
  chrome.storage.sync.get('sessions', data => {
    let sessions = data.sessions || [];
    sessions.splice(idx, 1);
    chrome.storage.sync.set({sessions}, renderSessions);
  });
}

function handleTabClick(sessidx, tabidx) {
  chrome.storage.sync.get('sessions', data => {
    const session = (data.sessions||[])[sessidx];
    if (!session) return;
    chrome.windows.getCurrent({populate: true}, win => {
      if (win.id !== session.windowId) return;
      const match = win.tabs.find(t => t.url === (session.tabs[tabidx]?.url));
      if (!match) return;
      chrome.tabs.update(match.id, {active: true}, () => {
        chrome.windows.update(win.id, {focused: true});
      });
    });
  });
}

document.getElementById('saveBtn').onclick = handleSave;

document.getElementById('sessionsList').onclick = e => {
  if (e.target.tagName !== 'BUTTON') return;
  const idx = Number(e.target.dataset.open ?? e.target.dataset.update ?? e.target.dataset.delete);
  if (e.target.dataset.open !== undefined) handleOpen(idx);
  else if (e.target.dataset.update !== undefined) handleUpdate(idx);
  else if (e.target.dataset.delete !== undefined) handleDelete(idx);
};

document.getElementById('tabsTitleList').onclick = e => {
  if (!e.target.classList.contains('sess-title-item')) return;
  handleTabClick(Number(e.target.dataset.sessidx), Number(e.target.dataset.tabidx));
};

document.addEventListener('DOMContentLoaded', renderSessions);
