const { groupTabsIntoSegments } = require('../src/utils');

const groups = [
  { title: 'Work', color: 'blue',  collapsed: false },
  { title: 'Fun',  color: 'green', collapsed: true  },
];

describe('groupTabsIntoSegments', () => {
  it('tabs sem grupo ficam como solo', () => {
    const tabs = [
      { url: 'a', groupIdx: null },
      { url: 'b', groupIdx: null },
    ];
    expect(groupTabsIntoSegments(tabs, groups)).toEqual([
      { type: 'solo', tab: tabs[0], tabIdx: 0 },
      { type: 'solo', tab: tabs[1], tabIdx: 1 },
    ]);
  });

  it('tabs de grupo ficam agrupados num segmento', () => {
    const tabs = [
      { url: 'a', groupIdx: 0 },
      { url: 'b', groupIdx: 0 },
    ];
    const result = groupTabsIntoSegments(tabs, groups);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('group');
    expect(result[0].group).toEqual(groups[0]);
    expect(result[0].tabs).toEqual([{tab: tabs[0], tabIdx: 0}, {tab: tabs[1], tabIdx: 1}]);
  });

  it('mistura de solo e grupos mantém ordem', () => {
    const tabs = [
      { url: 'a', groupIdx: null },
      { url: 'b', groupIdx: 0 },
      { url: 'c', groupIdx: 0 },
      { url: 'd', groupIdx: null },
      { url: 'e', groupIdx: 1 },
    ];
    const result = groupTabsIntoSegments(tabs, groups);
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ type: 'solo', tab: tabs[0], tabIdx: 0 });
    expect(result[1].type).toBe('group');
    expect(result[1].tabs).toHaveLength(2);
    expect(result[2]).toEqual({ type: 'solo', tab: tabs[3], tabIdx: 3 });
    expect(result[3].type).toBe('group');
    expect(result[3].tabs).toHaveLength(1);
  });

  it('grupo sem info usa defaults', () => {
    const tabs = [{ url: 'a', groupIdx: 99 }];
    const result = groupTabsIntoSegments(tabs, groups);
    expect(result[0].group).toEqual({ title: '', color: 'grey', collapsed: false });
  });

  it('devolve [] se tabs vazio ou null', () => {
    expect(groupTabsIntoSegments([], groups)).toEqual([]);
    expect(groupTabsIntoSegments(null, groups)).toEqual([]);
  });
});
