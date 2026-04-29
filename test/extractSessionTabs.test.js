const { extractSessionTabs } = require('../src/utils');

describe('extractSessionTabs', () => {
  it('extrai apenas separadores não-pinned, não chrome, com url', () => {
    const tabs = [
      {pinned:true, url:"https://fixo.com", title:"Fixado"},
      {pinned:false, url:"https://site1", title:"Site 1"},
      {pinned:false, url:"", title:"Sem URL"},
      {pinned:false, url:"chrome://settings", title:"chrome internal"},
      {pinned:false, url:"https://site2", title:""},
      {pinned:false, url:null},
    ];
    expect(extractSessionTabs(tabs)).toEqual([
      {url: 'https://site1', title:'Site 1'},
      {url: 'https://site2', title: ''}
    ]);
  });

  it('title defaulta vazio se falso/undefined', () => {
    expect(extractSessionTabs([{pinned:false, url:"https://x.com"}])).toEqual([
      {url: 'https://x.com', title: ''}
    ]);
  });

  it('devolve [] se tabs null, undefined ou vazio', () => {
    expect(extractSessionTabs()).toEqual([]);
    expect(extractSessionTabs(null)).toEqual([]);
    expect(extractSessionTabs([])).toEqual([]);
  });
});
