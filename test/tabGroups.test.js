const { buildSessionData, buildGroupRestoreOps } = require('../src/utils');

describe('buildSessionData', () => {
  const filteredTabs = [
    { url: 'https://a.com', title: 'A', groupId: 10 },
    { url: 'https://b.com', title: 'B', groupId: 10 },
    { url: 'https://c.com', title: 'C', groupId: 20 },
    { url: 'https://d.com', title: 'D', groupId: -1 },
  ];
  const tabGroupsMap = {
    10: { title: 'Work', color: 'blue',  collapsed: false },
    20: { title: 'Fun',  color: 'green', collapsed: true  },
  };

  it('mapeia grupos e tabs corretamente', () => {
    const result = buildSessionData('Sess', 1, filteredTabs, tabGroupsMap, 1000);
    expect(result.name).toBe('Sess');
    expect(result.windowId).toBe(1);
    expect(result.timestamp).toBe(1000);
    expect(result.groups).toEqual([
      { title: 'Work', color: 'blue',  collapsed: false },
      { title: 'Fun',  color: 'green', collapsed: true  },
    ]);
    expect(result.tabs).toEqual([
      { url: 'https://a.com', title: 'A', groupIdx: 0 },
      { url: 'https://b.com', title: 'B', groupIdx: 0 },
      { url: 'https://c.com', title: 'C', groupIdx: 1 },
      { url: 'https://d.com', title: 'D', groupIdx: null },
    ]);
  });

  it('tabs sem grupo têm groupIdx null', () => {
    const tabs = [{ url: 'https://x.com', title: 'X', groupId: -1 }];
    const result = buildSessionData('S', 1, tabs, {}, 0);
    expect(result.tabs[0].groupIdx).toBeNull();
    expect(result.groups).toEqual([]);
  });

  it('group desconhecido usa defaults', () => {
    const tabs = [{ url: 'https://x.com', title: 'X', groupId: 99 }];
    const result = buildSessionData('S', 1, tabs, {}, 0);
    expect(result.groups[0]).toEqual({ title: '', color: 'grey', collapsed: false });
  });
});

describe('buildGroupRestoreOps', () => {
  const sessionGroups = [
    { title: 'Work', color: 'blue',  collapsed: false },
    { title: 'Fun',  color: 'green', collapsed: true  },
  ];
  const sessionTabs = [
    { url: 'https://a.com', groupIdx: 0 },
    { url: 'https://b.com', groupIdx: 0 },
    { url: 'https://c.com', groupIdx: 1 },
    { url: 'https://d.com', groupIdx: null },
  ];
  const windowTabs = [
    { id: 1, url: 'https://a.com' },
    { id: 2, url: 'https://b.com' },
    { id: 3, url: 'https://c.com' },
    { id: 4, url: 'https://d.com' },
  ];

  it('gera operações de grupo corretas', () => {
    const ops = buildGroupRestoreOps(sessionGroups, sessionTabs, windowTabs);
    expect(ops).toEqual([
      { tabIds: [1, 2], groupProps: { title: 'Work', color: 'blue',  collapsed: false } },
      { tabIds: [3],    groupProps: { title: 'Fun',  color: 'green', collapsed: true  } },
    ]);
  });

  it('devolve [] se sem grupos', () => {
    expect(buildGroupRestoreOps([], sessionTabs, windowTabs)).toEqual([]);
    expect(buildGroupRestoreOps(null, sessionTabs, windowTabs)).toEqual([]);
    expect(buildGroupRestoreOps(undefined, sessionTabs, windowTabs)).toEqual([]);
  });

  it('ignora tabs da sessão cujos urls não estão na janela', () => {
    const winTabs = [{ id: 1, url: 'https://a.com' }];
    const ops = buildGroupRestoreOps(sessionGroups, sessionTabs, winTabs);
    expect(ops).toEqual([
      { tabIds: [1], groupProps: { title: 'Work', color: 'blue', collapsed: false } },
    ]);
  });

  it('omite grupos sem tabs correspondentes na janela', () => {
    const winTabs = [{ id: 3, url: 'https://c.com' }];
    const ops = buildGroupRestoreOps(sessionGroups, sessionTabs, winTabs);
    expect(ops).toEqual([
      { tabIds: [3], groupProps: { title: 'Fun', color: 'green', collapsed: true } },
    ]);
  });
});
