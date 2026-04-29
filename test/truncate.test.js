const { truncate } = require('../src/utils');

describe('truncate', () => {
  it('retorna texto igual se abaixo do limite', () => {
    expect(truncate('abc', 5)).toBe('abc');
    expect(truncate('abc', 3)).toBe('abc');
  });
  it('trunca texto exatamente acima do limite', () => {
    expect(truncate('abcd', 3)).toBe('abc...');
    expect(truncate('testei', 4)).toBe('test...');
  });
  it('usa 120 como valor padrão', () => {
    const s = 'x'.repeat(130);
    expect(truncate(s)).toBe('x'.repeat(120)+'...');
  });
  it('retorna string vazia se input não é string', () => {
    expect(truncate(null, 5)).toBe('');
    expect(truncate(undefined, 5)).toBe('');
    expect(truncate(123, 5)).toBe('');
    expect(truncate([], 5)).toBe('');
  });
  it('funciona com texto exatamente no limite', () => {
    expect(truncate('a'.repeat(8), 8)).toBe('aaaaaaaa');
  });
});
