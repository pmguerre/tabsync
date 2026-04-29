// popup.js

let selectedSessionIdx = null;

function formatDate(dt) {
  const d = new Date(dt);
  let zero = n => n.toString().padStart(2, '0');
  return zero(d.getDate()) + '/' + zero(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + zero(d.getHours()) + ':' + zero(d.getMinutes());
}

function renderSessions() {
  const sessionsList = document.getElementById('sessionsList');
  const sessionTabs = document.getElementById('sessionTabs');
  sessionsList.innerHTML = '';
  sessionTabs.innerHTML = '';
  chrome.storage.local.get('sessions', data => {
    const sessions = data.sessions || [];
    if(selectedSessionIdx === null && sessions.length>0) selectedSessionIdx = 0;
    if(selectedSessionIdx !== null && selectedSessionIdx >= sessions.length) selectedSessionIdx = sessions.length-1;
    sessions.forEach((sess, idx) => {
      const isActive = idx === selectedSessionIdx;
      const li = document.createElement('li');
      li.className = 'sessao' + (isActive ? ' active' : '');
      li.innerHTML = `
        <div class='sess-info'>
          <div class='sess-main'>${sess.name}</div>
          <div class="sess-date">Última atualização:</div>
          <div class=\"sess-date\">${formatDate(sess.timestamp)}</div>
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
    // Separadores da sessão ativa
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
// DELEGAÇÃO DE EVENTOS

document.getElementById('sessionsList').onclick = e => {
  if (e.target.tagName === 'BUTTON') {
    if (e.target.dataset.open) {
      const idx = Number(e.target.dataset.open);
      chrome.storage.local.get('sessions', data => {
        const sessions = data.sessions || [];
        const session = sessions[idx];
        if (!session) return;
        // Verifica se o windowId ainda existe
        chrome.windows.get(session.windowId, {populate: true}, win => {
          if (chrome.runtime.lastError || !win) {
            // Não existe janela -> abrir nova
            chrome.windows.create({url: session.tabs.map(t=>t.url)}, newWin => {
              // Atualiza windowId na sessão
              session.windowId = newWin.id;
              chrome.storage.local.set({sessions}, renderSessions);
            });
            return;
          }
          // Janela existe: comparar separadores
          const winUrls = win.tabs.filter(t => !t.pinned && t.url && !t.url.startsWith('chrome')).map(t=>t.url);
          const sessUrls = session.tabs.map(t=>t.url);
          const diffExtra = winUrls.filter(u => !sessUrls.includes(u)); // a mais
          const diffMissing = sessUrls.filter(u => !winUrls.includes(u)); // em falta
          if(diffExtra.length === 0 && diffMissing.length === 0 && winUrls.length === sessUrls.length){
            // São iguais: só focar
            chrome.windows.update(win.id, {focused:true});
            if (win.tabs && win.tabs[0]) chrome.tabs.update(win.tabs[0].id, {active:true});
            return;
          }
          // AVISO: mostrar separadores a fechar
          let msg = '';
          if(diffExtra.length>0){
            msg += 'Os seguintes separadores vão ser FECHADOS nesta janela:\n\n'+diffExtra.join('\n')+'\n\n';
          }
          if(diffMissing.length>0){
            msg += 'Os seguintes separadores vão ser ABERTOS (faltam nesta janela):\n\n'+diffMissing.join('\n')+'\n\n';
          }
          msg += 'Queres mesmo restaurar esta sessão nesta janela?';
          if(!confirm(msg)) return;
          // Fechar separadores extra
          const tabsToClose = win.tabs.filter(t => diffExtra.includes(t.url)).map(t=>t.id);
          if(tabsToClose.length)
            chrome.tabs.remove(tabsToClose);
          // Abrir em falta
          for(let u of diffMissing){
             chrome.tabs.create({windowId:win.id, url: u});
          }
          // Focus janela
          chrome.windows.update(win.id, {focused:true});
          if (win.tabs && win.tabs[0]) chrome.tabs.update(win.tabs[0].id, {active:true});
        });
      });
    } else if (e.target.dataset.update) {
      const idx = Number(e.target.dataset.update);
      chrome.storage.local.get('sessions', data => {
        const sessions = data.sessions || [];
        const sess = sessions[idx];
        if (!sess) return;
        chrome.windows.getCurrent({populate:true}, win => {
          if (sess.windowId !== win.id) {
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
