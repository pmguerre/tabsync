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
      const segments = groupTabsIntoSegments(sess.tabs || [], sess.groups || []);

      function renderTabEl(tab, tabIdx) {
        const ti = document.createElement('div');
        ti.className = 'sess-title-item';
        ti.title = tabLabel(tab);
        ti.dataset.tabidx = tabIdx;
        ti.dataset.sessidx = selectedSessionIdx;
        const faviconWrap = document.createElement('div');
        faviconWrap.className = 'favicon-wrap';
        const favicon = document.createElement('img');
        favicon.className = 'tab-favicon';
        favicon.src = `https://www.google.com/s2/favicons?sz=16&domain_url=${encodeURIComponent(tab.url)}`;
        favicon.onerror = () => { favicon.style.visibility = 'hidden'; };
        const removeBtn = document.createElement('span');
        removeBtn.className = 'tab-remove';
        removeBtn.textContent = '✕';
        removeBtn.dataset.tabidx = tabIdx;
        removeBtn.dataset.sessidx = selectedSessionIdx;
        faviconWrap.appendChild(favicon);
        faviconWrap.appendChild(removeBtn);
        const info = document.createElement('div');
        info.className = 'tab-info';
        const titleEl = document.createElement('div');
        titleEl.className = 'tab-title';
        titleEl.textContent = truncate(tab.title || 'Sem título', 80);
        const urlEl = document.createElement('div');
        urlEl.className = 'tab-url';
        urlEl.textContent = truncate(tab.url || '', 80);
        info.appendChild(titleEl);
        info.appendChild(urlEl);
        ti.appendChild(faviconWrap);
        ti.appendChild(info);
        return ti;
      }

      segments.forEach(segment => {
        if (segment.type === 'solo') {
          tabsTitleList.appendChild(renderTabEl(segment.tab, segment.tabIdx));
        } else {
          const color = groupColorStyle(segment.group.color);
          const container = document.createElement('div');
          container.className = 'group-container';
          container.style.borderColor = color;
          const header = document.createElement('div');
          header.className = 'group-header';
          const dot = document.createElement('span');
          dot.className = 'group-header-dot';
          dot.style.background = color;
          header.appendChild(dot);
          header.appendChild(document.createTextNode(segment.group.title || 'Grupo sem nome'));
          container.appendChild(header);
          segment.tabs.forEach(({tab, tabIdx}) => {
            const tabEl = renderTabEl(tab, tabIdx);
            tabEl.classList.add('tab-grouped');
            container.appendChild(tabEl);
          });
          tabsTitleList.appendChild(container);
        }
      });
    }
  });
}

function fetchTabGroupsMap(filteredTabs) {
  const groupIds = [...new Set(filteredTabs.map(t => t.groupId).filter(id => id !== -1))];
  if (!groupIds.length || !chrome.tabGroups) return Promise.resolve({});
  return Promise.all(
    groupIds.map(id => new Promise(resolve => {
      chrome.tabGroups.get(id, g => {
        void chrome.runtime.lastError;
        resolve([id, g || {}]);
      });
    }))
  ).then(Object.fromEntries);
}

function handleSave() {
  const name = document.getElementById('sessionName').value.trim();
  if (!name) {
    alert('Dá um nome à sessão!');
    return;
  }
  chrome.windows.getCurrent({populate: true}, win => {
    const filteredTabs = extractSessionTabs(win.tabs);
    fetchTabGroupsMap(filteredTabs).then(tabGroupsMap => {
      chrome.storage.sync.get('sessions', data => {
        const sessions = data.sessions || [];
        const session = buildSessionData(name, win.id, filteredTabs, tabGroupsMap, Date.now());
        sessions.push(session);
        selectedSessionIdx = sessions.length - 1;
        chrome.storage.sync.set({sessions}, renderSessions);
      });
    });
  });
}

function restoreGroups(winId, session, orderedTabIds) {
  if (!session.groups || !session.groups.length || !chrome.tabs.group) {
    chrome.windows.update(winId, {focused: true});
    if (orderedTabIds[0]) chrome.tabs.update(orderedTabIds[0], {active: true});
    return;
  }
  const groupPromises = session.groups.map((group, groupIdx) =>
    new Promise(resolve => {
      const tabIds = session.tabs
        .map((t, i) => t.groupIdx === groupIdx ? orderedTabIds[i] : null)
        .filter(Boolean);
      if (!tabIds.length) { resolve(); return; }
      chrome.tabs.group(
        {tabIds, createProperties: {windowId: winId}},
        groupId => {
          void chrome.runtime.lastError;
          if (!groupId || !chrome.tabGroups) { resolve(); return; }
          chrome.tabGroups.update(
            groupId,
            {title: group.title, color: group.color, collapsed: group.collapsed},
            () => { void chrome.runtime.lastError; resolve(); }
          );
        }
      );
    })
  );
  Promise.all(groupPromises).then(() => {
    chrome.windows.update(winId, {focused: true});
    if (orderedTabIds[0]) chrome.tabs.update(orderedTabIds[0], {active: true});
  });
}

function openNewWindow(session, sessions) {
  chrome.windows.create({url: session.tabs.map(t => t.url)}, newWin => {
    void chrome.runtime.lastError;
    if (!newWin) return;
    session.windowId = newWin.id;
    chrome.storage.sync.set({sessions}, renderSessions);
    restoreGroups(newWin.id, session, newWin.tabs.map(t => t.id));
  });
}

function handleOpen(idx) {
  chrome.storage.sync.get('sessions', data => {
    const sessions = data.sessions || [];
    const session = sessions[idx];
    if (!session) return;
    chrome.windows.get(session.windowId, {populate: true}, win => {
      if (chrome.runtime.lastError || !win) {
        openNewWindow(session, sessions);
        return;
      }
      const winUrls = extractSessionTabs(win.tabs).map(t => t.url);
      const sessUrls = session.tabs.map(t => t.url);
      const { extra, missing } = diffUrls(winUrls, sessUrls);
      if (extra.length === 0 && missing.length === 0 && winUrls.length === sessUrls.length) {
        chrome.windows.update(win.id, {focused: true});
        if (win.tabs[0]) chrome.tabs.update(win.tabs[0].id, {active: true});
        return;
      }
      const msg = buildRestoreDiffMessage(extra, missing);
      if (!confirm(msg)) return;
      // Remove extra tabs
      const tabsToClose = win.tabs.filter(t => extra.includes(t.url)).map(t => t.id);
      if (tabsToClose.length) chrome.tabs.remove(tabsToClose);
      // Constrói URL→ID para tabs já existentes (exceto as que vão ser removidas)
      const urlToId = {};
      win.tabs
        .filter(t => !t.pinned && t.url && !t.url.startsWith('chrome') && !extra.includes(t.url))
        .forEach(t => { urlToId[t.url] = t.id; });
      // Cria tabs em falta e adiciona ao mapa via callback (URL garantida)
      const createPromises = missing.map(url =>
        new Promise(resolve => chrome.tabs.create({windowId: win.id, url}, tab => {
          void chrome.runtime.lastError;
          if (tab) urlToId[url] = tab.id;
          resolve();
        }))
      );
      Promise.all(createPromises).then(() => {
        // orderedTabIds[i] = ID do tab para session.tabs[i]
        const orderedTabIds = session.tabs.map(t => urlToId[t.url]).filter(Boolean);
        // Move tabs para posição correta (a seguir aos pinned)
        chrome.windows.get(win.id, {populate: true}, currentWin => {
          const pinnedCount = currentWin.tabs.filter(t => t.pinned).length;
          const movePromises = orderedTabIds.map((id, i) =>
            new Promise(resolve => chrome.tabs.move(id, {index: pinnedCount + i}, resolve))
          );
          Promise.all(movePromises).then(() =>
            restoreGroups(win.id, session, orderedTabIds)
          );
        });
      });
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
      const filteredTabs = extractSessionTabs(win.tabs);
      fetchTabGroupsMap(filteredTabs).then(tabGroupsMap => {
        sessions[idx] = buildSessionData(sess.name, win.id, filteredTabs, tabGroupsMap, Date.now());
        chrome.storage.sync.set({sessions}, renderSessions);
      });
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

function handleRemoveTab(sessidx, tabidx) {
  chrome.storage.sync.get('sessions', data => {
    const sessions = removeSessionTab(data.sessions || [], sessidx, tabidx);
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
  if (e.target.classList.contains('tab-remove')) {
    e.stopPropagation();
    handleRemoveTab(Number(e.target.dataset.sessidx), Number(e.target.dataset.tabidx));
    return;
  }
  if (!e.target.classList.contains('sess-title-item')) return;
  handleTabClick(Number(e.target.dataset.sessidx), Number(e.target.dataset.tabidx));
};

document.addEventListener('DOMContentLoaded', renderSessions);
