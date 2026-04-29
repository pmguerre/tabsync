const { removeSessionTab } = require('../src/utils');

describe('removeSessionTab', () => {
  const sessions = [
    { name: 'A', tabs: [{url:'a1'}, {url:'a2'}, {url:'a3'}] },
    { name: 'B', tabs: [{url:'b1'}, {url:'b2'}] },
  ];

  it('remove o separador correto da sessão correta', () => {
    const result = removeSessionTab(sessions, 0, 1);
    expect(result[0].tabs).toEqual([{url:'a1'}, {url:'a3'}]);
    expect(result[1].tabs).toEqual([{url:'b1'}, {url:'b2'}]);
  });

  it('não altera outras sessões', () => {
    const result = removeSessionTab(sessions, 1, 0);
    expect(result[0].tabs).toEqual([{url:'a1'}, {url:'a2'}, {url:'a3'}]);
    expect(result[1].tabs).toEqual([{url:'b2'}]);
  });

  it('remove o primeiro separador', () => {
    const result = removeSessionTab(sessions, 0, 0);
    expect(result[0].tabs).toEqual([{url:'a2'}, {url:'a3'}]);
  });

  it('remove o último separador', () => {
    const result = removeSessionTab(sessions, 0, 2);
    expect(result[0].tabs).toEqual([{url:'a1'}, {url:'a2'}]);
  });

  it('não mutua o array original', () => {
    const original = [{ name: 'X', tabs: [{url:'x1'}, {url:'x2'}] }];
    removeSessionTab(original, 0, 0);
    expect(original[0].tabs).toHaveLength(2);
  });
});
