# TabSync

![MIT License](https://img.shields.io/badge/License-MIT-green.svg)
![Issues](https://img.shields.io/github/issues/pmguerre/tabsync)
![PRs](https://img.shields.io/github/issues-pr/pmguerre/tabsync)
![Last Commit](https://img.shields.io/github/last-commit/pmguerre/tabsync)

Extensão Chrome/Edge para sincronizar, guardar e restaurar sessões de separadores por janela, entre dispositivos/autenticações do mesmo perfil.

## Funcionalidades principais

- Guarda todos os separadores abertos de uma janela como uma “sessão” nomeada
- Lista e gere múltiplas sessões (uma por cada contexto de trabalho)
- Permite restaurar uma sessão (abre separadores dessa janela noutro PC/perfil, por sincronização de conta)
- Permite atualizar uma sessão (sincroniza os separadores atuais da janela ativa)
- Permite remover sessões antigas
- Visualiza lista de separadores/títulos em cada sessão
- Botões rápidos: abrir/restaurar (📂), atualizar (💾), remover (🗑️)
- Restringe atualização a estar na janela original da sessão (protege de mudanças indesejadas)
- Sincroniza automaticamente entre dispositivos via conta Google/Microsoft (chrome.storage.sync)

## Como instalar

1. Abre `chrome://extensions` ou `edge://extensions`, ativa o modo de programador
2. Carrega em "Carregar sem compactação" e seleciona a pasta deste projeto
3. (Opcional) Publica na Chrome Web Store/Microsoft Edge Store

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
- Não sincroniza dados entre diferentes contas/usuários

## Contribuição

1. Forka este repositório
2. Cria uma branch: `git checkout -b feature/nome`
3. Faz as tuas alterações
4. Envia Pull Request

## Licença

MIT

---

© 2026 Pedro Guerreiro. Todos os direitos reservados.