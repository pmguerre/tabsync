const { clampIndex } = require('../src/utils');

describe('clampIndex', () => {
  it('devolve 0 se idx null e há elementos', () => {
    expect(clampIndex(null, 3)).toBe(0);
  });

  it('devolve null se idx null e array vazio', () => {
    expect(clampIndex(null, 0)).toBe(null);
  });

  it('clamps para último elemento se idx >= length', () => {
    expect(clampIndex(5, 3)).toBe(2);
    expect(clampIndex(3, 3)).toBe(2);
  });

  it('devolve idx sem alteração se dentro dos limites', () => {
    expect(clampIndex(0, 3)).toBe(0);
    expect(clampIndex(2, 3)).toBe(2);
  });

  it('devolve null se idx null e length 0', () => {
    expect(clampIndex(null, 0)).toBeNull();
  });
});
