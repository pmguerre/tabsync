# TabSync

![MIT License](https://img.shields.io/badge/License-MIT-green.svg)
![Issues](https://img.shields.io/github/issues/pmguerre/tabsync)
![PRs](https://img.shields.io/github/issues-pr/pmguerre/tabsync)
![Last Commit](https://img.shields.io/github/last-commit/pmguerre/tabsync)

Extensão Chrome/Edge para sincronizar, guardar e restaurar sessões de separadores por janela, entre dispositivos/autenticações do mesmo perfil.

## Funcionalidades principais

- Guarda todos os separadores abertos de uma janela como uma "sessão" nomeada
- Lista e gere múltiplas sessões (uma por cada contexto de trabalho)
- Permite restaurar uma sessão (abre separadores dessa janela noutro PC/perfil, por sincronização de conta)
- Permite atualizar uma sessão (sincroniza os separadores atuais da janela ativa)
- Permite remover sessões antigas
- Visualiza lista de separadores/títulos em cada sessão
- Botões rápidos: abrir/restaurar (📂), atualizar (💾), remover (🗑️)
- Restringe atualização a estar na janela original da sessão (protege de mudanças indesejadas)
- Sincroniza automaticamente entre dispositivos via conta Google/Microsoft (chrome.storage.sync)

## Estrutura do projeto

```
tabsync/
├── src/               # Código-fonte da extensão
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── utils.js       # Helpers puros e testáveis
│   ├── background.js
│   └── icon.png
├── test/              # Testes unitários (Jest)
│   ├── utils.test.js
│   ├── diffUrls.test.js
│   ├── truncate.test.js
│   ├── extractSessionTabs.test.js
│   ├── buildRestoreDiffMessage.test.js
│   ├── clampIndex.test.js
│   └── tabLabel.test.js
├── dist/              # Build de produção (gerado por npm run build)
├── package.json
├── .gitignore
├── README.md
└── LICENSE
```

## Como instalar (desenvolvimento)

1. Abre `chrome://extensions` ou `edge://extensions`, ativa o modo de programador
2. Carrega em "Carregar sem compactação" e seleciona a pasta `src/`

## Como instalar (produção)

1. Corre `npm run build` para gerar a pasta `dist/`
2. Carrega a pasta `dist/` no browser como extensão não compactada, ou zipa o conteúdo de `dist/` para publicar

## Scripts disponíveis

```sh
npm run build   # Copia src/ para dist/ (pronto para publicar)
npm test        # Corre testes unitários com cobertura (Jest)
```

## Publicação

O mesmo ficheiro ZIP (conteúdo de `dist/`) pode ser submetido a ambas as lojas:

- [Chrome Web Store](https://chromewebstore.google.com/u/0/developer/dashboard)
- [Edge Add-ons](https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview)

## Utilização

- Clica no ícone TabSync na barra de extensões
- Introduz um nome, clica Guardar Sessão para registar os separadores da janela atual
- Usa os botões para restaurar, atualizar ou remover sessões conforme desejado
- Clicando num título de separador navegas diretamente para esse tab (se na janela da sessão)
- Se abrires sessão noutro PC (com conta sincronizada), terás acesso às mesmas sessões/abas salvas

## Limitações

- Apenas sessões do navegador autenticado (Chrome/Edge)
- O sync depende de chrome.storage.sync, sujeito a limites (~100KB)
- Apenas separadores não-pinned e URLs válidos são guardados
- Não sincroniza dados entre diferentes contas/utilizadores

## Contribuição

1. Forka este repositório
2. Cria uma branch: `git checkout -b feature/nome`
3. Faz as tuas alterações e testes: `npm test`
4. Envia Pull Request

## Licença

MIT

---

© 2026 Pedro Guerreiro. Todos os direitos reservados.
