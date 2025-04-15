# Bateu Ponto - Extensão Chrome

Uma extensão para Chrome que ajuda você a lembrar de registrar seus horários de trabalho.

## Funcionalidades

- Lembretes para registrar os 4 pontos do dia:
  - Chegada ao trabalho
  - Saída para almoço
  - Retorno do almoço
  - Saída do trabalho
- Configuração personalizada dos horários de trabalho
- Interface simples e moderna
- Notificações automáticas quando estiver no horário de registrar o ponto
- Registro de ponto diretamente a partir das notificações
- Armazenamento local dos registros de ponto
- Intervalo de lembretes configurável
- Integração com o sistema Tangerino

## Instalação

1. Clone este repositório ou baixe os arquivos
2. Abra o Chrome e vá para `chrome://extensions/`
3. Ative o "Modo do desenvolvedor" no canto superior direito
4. Clique em "Carregar sem compactação" e selecione a pasta do projeto
5. A extensão será instalada e aparecerá na barra de ferramentas do Chrome

## Como usar

1. Clique no ícone da extensão na barra de ferramentas do Chrome
2. Configure seus horários de trabalho na página de configurações
3. A extensão irá notificar você quando estiver no horário de registrar o ponto
4. Você pode registrar o ponto de duas maneiras:
   - Clicando no botão "Registrar Ponto" no popup da extensão
   - Clicando no botão "Registrar Ponto" na notificação que aparece

## Configuração dos horários

1. Clique no ícone da extensão
2. Clique em "Configurar Horários"
3. Defina os intervalos de tempo para:
   - Horário de Chegada (ex: 08:00 às 09:00)
   - Saída para Almoço (ex: 12:00 às 13:00)
   - Retorno do Almoço (ex: 13:00 às 14:00)
   - Horário de Saída (ex: 17:00 às 18:00)
4. Configure o intervalo de lembretes (em minutos)
5. Clique em "Salvar Configurações"

## Configuração da Integração com Tangerino

1. Acesse a página de configurações
2. Ative a opção "Ativar integração com Tangerino"
3. Preencha:
   - Código da Empresa (ex: U6WR4)
   - PIN do Usuário (ex: 10352)
4. Clique em "Salvar Configurações"
5. Agora, ao registrar um ponto, ele também será enviado automaticamente para o Tangerino

## Desenvolvimento

Para modificar a extensão:

1. Edite os arquivos conforme necessário
2. Recarregue a extensão em `chrome://extensions/`
3. Teste as alterações

## Estrutura do projeto

- `manifest.json`: Configuração da extensão
- `popup.html`: Interface principal
- `popup.js`: Lógica da interface principal
- `options.html`: Página de configurações
- `options.js`: Lógica das configurações
- `background.js`: Serviço em segundo plano
- `images/`: Diretório com os ícones da extensão

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes. 