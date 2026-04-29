const { tabLabel } = require('../src/utils');

describe('tabLabel', () => {
  it('devolve title se existir', () => {
    expect(tabLabel({title: 'Página', url: 'https://x.com'})).toBe('Página');
  });

  it('devolve url se title vazio/falso', () => {
    expect(tabLabel({title: '', url: 'https://x.com'})).toBe('https://x.com');
    expect(tabLabel({title: null, url: 'https://x.com'})).toBe('https://x.com');
    expect(tabLabel({url: 'https://x.com'})).toBe('https://x.com');
  });

  it('devolve string vazia se ambos falsos', () => {
    expect(tabLabel({title: '', url: ''})).toBe('');
    expect(tabLabel({})).toBe('');
  });
});
