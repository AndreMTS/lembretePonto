Bateu Ponto - Extensão Chrome
Extensão para gerenciamento de registros de ponto com lembretes automáticos, que funciona em conjunto com uma aplicação Electron backend.

⚠️ Pré-requisitos
Para que esta extensão funcione corretamente, é necessário:

Ter instalada a aplicação Electron companion que faz o registro real do ponto

A aplicação Electron deve estar em execução localmente

Configurar a mesma porta em ambas as aplicações

🌟 Funcionalidades
Sistema Híbrido
🔌 Extensão Chrome como interface frontend

⚡ Aplicação Electron como backend (Node.js + Express + Puppeteer)

📡 Comunicação via API local

Registro de Pontos
Monitoramento dos 4 períodos diários

Notificações automáticas configuráveis

Interface intuitiva

🚀 Instalação
Instale primeiro a aplicação Electron

Clone este repositório:

bash
Copy
git clone [URL_DO_REPOSITÓRIO_EXTENSÃO]
Configure a mesma porta em ambas as aplicações

⚙️ Configuração da API Local
Inicie a aplicação Electron

Na extensão Chrome:

Acesse Configurações

Ative "Integração com Sistema Local"

Informe:

URL da API (ex: http://localhost:3000/registrar-ponto)

Credenciais necessárias

Salve as configurações

🔧 Arquitetura do Sistema
Copy
Extensão Chrome (Frontend)
       ↓
   Comunicação HTTP
       ↓
Aplicação Electron (Backend)
  ├── Node.js/Express
  └── Puppeteer (automação)
🤝 Contribuição
Contribuições são bem-vindas para ambas as partes do sistema:

Extensão Chrome

Aplicação Electron

Siga o padrão de:

Fork

Branch de feature

Commit

Pull Request

Desenvolvido com ❤️ para facilitar seu registro de ponto