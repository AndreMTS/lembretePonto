## Bateu Ponto - Extensão Chrome

Extensão para gerenciamento de registros de ponto com lembretes automáticos, que funciona em conjunto com uma aplicação Electron backend.

## ⚠️ Pré-requisitos

Para que esta extensão funcione corretamente, é necessário:

1.  Ter instalada a [aplicação Electron companion](https://github.com/AndreMTS/apiResgistrarPonto) que faz o registro real do ponto pode ser gerado um arquivo portable
2.  A aplicação Electron deve estar em execução localmente
3.  Configurar a mesma porta em ambas as aplicações

## 🌟 Funcionalidades

### Sistema Híbrido

*   🔌 Extensão Chrome como interface frontend
*   ⚡ Aplicação Electron como backend (Node.js + Express + Puppeteer)
*   📡 Comunicação via API local

### Registro de Pontos

*   Monitoramento dos 4 períodos diários
*   Notificações automáticas configuráveis
*   Interface intuitiva

## 🚀 Instalação

1.  Instale primeiro a [aplicação Electron](https://xn--url_do_repositrio_electron-etc/)
2.  Clone este repositório:

bash

Copy

git clone \[URL\_DO\_REPOSITÓRIO\_EXTENSÃO\]

1.  Configure a mesma porta em ambas as aplicações

## ⚙️ Configuração da API Local

1.  Inicie a aplicação Electron
2.  Na extensão Chrome:
    *   Acesse Configurações
    *   Ative "Integração com Sistema Local"
    *   Informe:
        *   URL da API (ex: `http://localhost:3000/registrar-ponto`)
        *   Credenciais necessárias
3.  Salve as configurações

## 🔧 Arquitetura do Sistema

Copy

Extensão Chrome (Frontend)       ↓   Comunicação HTTP       ↓ Aplicação Electron (Backend)  ├── Node.js/Express  └── Puppeteer (automação)

## 🤝 Contribuição

Contribuições são bem-vindas para ambas as partes do sistema:

*   [Extensão Chrome](https://xn--url_do_repositrio_extenso-iec53b/)
*   [Aplicação Electron](https://xn--url_do_repositrio_electron-etc/)

Siga o padrão de:

1.  Fork
2.  Branch de feature
3.  Commit
4.  Pull Request

---

Desenvolvido com ❤️ para facilitar seu registro de ponto
