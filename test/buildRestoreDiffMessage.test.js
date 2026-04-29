const { buildRestoreDiffMessage } = require('../src/utils');

describe('buildRestoreDiffMessage', () => {
  it('gera mensagem para extra e missing', () => {
    const extra = ['url1', 'url2'];
    const missing = ['url3'];
    const msg = buildRestoreDiffMessage(extra, missing);
    expect(msg).toMatch('vão ser FECHADOS');
    expect(msg).toMatch('vão ser ABERTOS');
    expect(msg).toMatch('url1');
    expect(msg).toMatch('url2');
    expect(msg).toMatch('url3');
    expect(msg).toMatch('Queres mesmo restaurar');
  });

  it('só extra', () => {
    const msg = buildRestoreDiffMessage(['a'], []);
    expect(msg).toMatch('vão ser FECHADOS');
    expect(msg).not.toMatch('vão ser ABERTOS');
  });

  it('só missing', () => {
    const msg = buildRestoreDiffMessage([], ['b']);
    expect(msg).not.toMatch('vão ser FECHADOS');
    expect(msg).toMatch('vão ser ABERTOS');
  });

  it('nem extra nem missing', () => {
    const msg = buildRestoreDiffMessage([], []);
    expect(msg).toBe('Queres mesmo restaurar esta sessão nesta janela?');
  });
});
