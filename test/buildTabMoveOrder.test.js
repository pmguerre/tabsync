const { buildTabMoveOrder } = require('../src/utils');

describe('buildTabMoveOrder', () => {
  const windowTabs = [
    { id: 10, url: 'https://a.com' },
    { id: 11, url: 'https://b.com' },
    { id: 12, url: 'https://c.com' },
  ];

  it('devolve operações de move na ordem da sessão', () => {
    const sessionUrls = ['https://c.com', 'https://a.com', 'https://b.com'];
    expect(buildTabMoveOrder(sessionUrls, windowTabs)).toEqual([
      { id: 12, index: 0 },
      { id: 10, index: 1 },
      { id: 11, index: 2 },
    ]);
  });

  it('ignora URLs da sessão que não estão na janela', () => {
    const sessionUrls = ['https://a.com', 'https://z.com', 'https://b.com'];
    expect(buildTabMoveOrder(sessionUrls, windowTabs)).toEqual([
      { id: 10, index: 0 },
      { id: 11, index: 2 },
    ]);
  });

  it('devolve array vazio se janela vazia', () => {
    expect(buildTabMoveOrder(['https://a.com'], [])).toEqual([]);
  });

  it('devolve array vazio se sessão vazia', () => {
    expect(buildTabMoveOrder([], windowTabs)).toEqual([]);
  });

  it('ordem já correta devolve os mesmos índices', () => {
    const sessionUrls = ['https://a.com', 'https://b.com', 'https://c.com'];
    expect(buildTabMoveOrder(sessionUrls, windowTabs)).toEqual([
      { id: 10, index: 0 },
      { id: 11, index: 1 },
      { id: 12, index: 2 },
    ]);
  });
});
