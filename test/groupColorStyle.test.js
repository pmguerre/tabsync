const { groupColorStyle } = require('../src/utils');

describe('groupColorStyle', () => {
  it('devolve cor correta para cada nome conhecido', () => {
    expect(groupColorStyle('grey')).toBe('#9e9e9e');
    expect(groupColorStyle('blue')).toBe('#4a90d9');
    expect(groupColorStyle('red')).toBe('#e53935');
    expect(groupColorStyle('yellow')).toBe('#f9a825');
    expect(groupColorStyle('green')).toBe('#43a047');
    expect(groupColorStyle('pink')).toBe('#e91e8c');
    expect(groupColorStyle('purple')).toBe('#7b1fa2');
    expect(groupColorStyle('cyan')).toBe('#00acc1');
  });

  it('devolve grey como fallback para cor desconhecida', () => {
    expect(groupColorStyle('unknown')).toBe('#9e9e9e');
    expect(groupColorStyle('')).toBe('#9e9e9e');
    expect(groupColorStyle(undefined)).toBe('#9e9e9e');
  });
});
