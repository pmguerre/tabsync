const { buildRestoreDiffMessage } = require('../src/utils');

describe('buildRestoreDiffMessage', () => {
  it('generates message for extra and missing', () => {
    const extra = ['url1', 'url2'];
    const missing = ['url3'];
    const msg = buildRestoreDiffMessage(extra, missing);
    expect(msg).toMatch('will be CLOSED');
    expect(msg).toMatch('will be OPENED');
    expect(msg).toMatch('url1');
    expect(msg).toMatch('url2');
    expect(msg).toMatch('url3');
    expect(msg).toMatch('Do you want to restore');
  });

  it('only extra', () => {
    const msg = buildRestoreDiffMessage(['a'], []);
    expect(msg).toMatch('will be CLOSED');
    expect(msg).not.toMatch('will be OPENED');
  });

  it('only missing', () => {
    const msg = buildRestoreDiffMessage([], ['b']);
    expect(msg).not.toMatch('will be CLOSED');
    expect(msg).toMatch('will be OPENED');
  });

  it('neither extra nor missing', () => {
    const msg = buildRestoreDiffMessage([], []);
    expect(msg).toBe('Do you want to restore this session in this window?');
  });
});
