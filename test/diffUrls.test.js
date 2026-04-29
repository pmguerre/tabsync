const { diffUrls } = require('../src/utils');

describe('diffUrls', () => {
  it('encontra extra e missing corretamente (cenário típico)', () => {
    const current = ['a', 'b', 'c', 'd'];
    const expected = ['b', 'c', 'e'];
    const {extra, missing} = diffUrls(current, expected);
    expect(extra).toEqual(['a', 'd']);
    expect(missing).toEqual(['e']);
  });

  it('devolve arrays vazios se iguais', () => {
    const arr = ['u','v'];
    expect(diffUrls(arr, arr)).toEqual({extra:[], missing:[]});
  });

  it('tudo extra se expected vazio', () => {
    expect(diffUrls(['a','b'], [])).toEqual({extra:['a','b'], missing:[]});
  });

  it('tudo missing se current vazio', () => {
    expect(diffUrls([], ['x','y'])).toEqual({extra:[], missing:['x','y']});
  });

  it('ignora urls repetidas (testa set unique)', () => {
    // Só a presença, não o número de ocorrências
    expect(diffUrls(['a','a','b'], ['a','b','b'])).toEqual({extra:[], missing:[]});
  });
});
