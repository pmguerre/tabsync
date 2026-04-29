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
    .map(t => ({ url: t.url, title: t.title||'', groupId: t.groupId ?? -1 }));
}

/**
 * Builds the restore confirmation message from extra/missing URL lists
 * @param {string[]} extra
 * @param {string[]} missing
 * @returns {string}
 */
function buildRestoreDiffMessage(extra, missing) {
  let msg = '';
  if(extra.length > 0)
    msg += 'The following tabs will be CLOSED in this window:\n\n'+extra.join('\n')+'\n\n';
  if(missing.length > 0)
    msg += 'The following tabs will be OPENED (missing from this window):\n\n'+missing.join('\n')+'\n\n';
  msg += 'Do you want to restore this session in this window?';
  return msg;
}

/**
 * Clamps the selected session index to valid array bounds.
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
 * Returns the readable label for a tab (title, url, or empty string).
 * @param {{title?:string, url?:string}} tab
 * @returns {string}
 */
function tabLabel(tab) {
  return tab.title || tab.url || '';
}

/**
 * Removes a tab from a session by index.
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
 * Calculates tab move operations to match the session order.
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

/**
 * Builds the session object with group info from filtered tabs.
 * @param {string} name
 * @param {number} winId
 * @param {Array<{url,title,groupId}>} filteredTabs - output de extractSessionTabs
 * @param {Object} tabGroupsMap - {groupId: {title, color, collapsed}}
 * @param {number} timestamp
 * @returns {Object} session
 */
function buildSessionData(name, winId, filteredTabs, tabGroupsMap, timestamp) {
  const groupIdxMap = {};
  const groups = [];
  filteredTabs.forEach(t => {
    if (t.groupId !== -1 && !(t.groupId in groupIdxMap)) {
      groupIdxMap[t.groupId] = groups.length;
      const g = tabGroupsMap[t.groupId] || {};
      groups.push({ title: g.title || '', color: g.color || 'grey', collapsed: !!g.collapsed });
    }
  });
  const tabs = filteredTabs.map(t => ({
    url: t.url,
    title: t.title,
    groupIdx: t.groupId !== -1 ? groupIdxMap[t.groupId] : null,
  }));
  return { name, windowId: winId, tabs, groups, timestamp };
}

/**
 * Calculates grouping operations to restore session tab groups.
 * @param {Array<{title,color,collapsed}>} sessionGroups
 * @param {Array<{url,groupIdx}>} sessionTabs
 * @param {Array<{id,url}>} windowTabs
 * @returns {Array<{tabIds:number[], groupProps:Object}>}
 */
function buildGroupRestoreOps(sessionGroups, sessionTabs, windowTabs) {
  if (!sessionGroups || sessionGroups.length === 0) return [];
  const urlToId = {};
  windowTabs.forEach(t => { urlToId[t.url] = t.id; });
  return sessionGroups
    .map((group, groupIdx) => ({
      tabIds: sessionTabs
        .filter(t => t.groupIdx === groupIdx)
        .map(t => urlToId[t.url])
        .filter(Boolean),
      groupProps: group,
    }))
    .filter(op => op.tabIds.length > 0);
}

/**
 * Converte o nome de cor de um tab group Chrome para CSS.
 * @param {string} colorName
 * @returns {string}
 */
function groupColorStyle(colorName) {
  const map = {
    grey:   '#9e9e9e',
    blue:   '#4a90d9',
    red:    '#e53935',
    yellow: '#f9a825',
    green:  '#43a047',
    pink:   '#e91e8c',
    purple: '#7b1fa2',
    cyan:   '#00acc1',
  };
  return map[colorName] || '#9e9e9e';
}

/**
 * Agrupa lista de tabs em segmentos ordenados (solo ou grupo).
 * @param {Array<{groupIdx:number|null}>} tabs
 * @param {Array<{title,color,collapsed}>} groups
 * @returns {Array<{type:'solo'|'group', tab?, tabIdx?, group?, tabs?}>}
 */
function groupTabsIntoSegments(tabs, groups) {
  const segments = [];
  let i = 0;
  while (i < (tabs||[]).length) {
    const tab = tabs[i];
    if (tab.groupIdx === null || tab.groupIdx === undefined) {
      segments.push({ type: 'solo', tab, tabIdx: i });
      i++;
    } else {
      const groupIdx = tab.groupIdx;
      const groupTabs = [];
      while (i < tabs.length && tabs[i].groupIdx === groupIdx) {
        groupTabs.push({ tab: tabs[i], tabIdx: i });
        i++;
      }
      segments.push({
        type: 'group',
        group: groups[groupIdx] || { title: '', color: 'grey', collapsed: false },
        tabs: groupTabs,
      });
    }
  }
  return segments;
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
  buildSessionData,
  buildGroupRestoreOps,
  groupColorStyle,
  groupTabsIntoSegments,
};
