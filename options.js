document.addEventListener('DOMContentLoaded', () => {
  // Elementos DOM
  const tangerinoEnabledToggle = document.getElementById('tangerinoEnabled');
  const tangerinoFields = document.getElementById('tangerinoFields');
  const apagarTodosPontos = document.getElementById('deleteAll');

  apagarTodosPontos.addEventListener('click', function () {
    chrome.storage.local.get(['points'], function (result) {
        const points = [];
        chrome.storage.local.set({ points: points }, function () {
            window.location.reload();
        });
    });
});

  // Toggle para mostrar/esconder campos de integração
  tangerinoEnabledToggle.addEventListener('change', function () {
    if (this.checked) {
      tangerinoFields.classList.add('active');
    } else {
      tangerinoFields.classList.remove('active');
    }
  });

  // Carregar configurações salvas
  chrome.storage.local.get([
    'arrivalStart', 'arrivalEnd',
    'lunchOutStart', 'lunchOutEnd',
    'lunchInStart', 'lunchInEnd',
    'departureStart', 'departureEnd',
    'notificationInterval',
    'tangerinoEnabled',
    'tangerinoUrl',
    'tangerinoCompanyCode',
    'tangerinoPin'
  ], (result) => {
    // Horários padrão
    document.getElementById('arrivalStart').value = result.arrivalStart || '08:00';
    document.getElementById('arrivalEnd').value = result.arrivalEnd || '09:00';
    document.getElementById('lunchOutStart').value = result.lunchOutStart || '12:00';
    document.getElementById('lunchOutEnd').value = result.lunchOutEnd || '13:00';
    document.getElementById('lunchInStart').value = result.lunchInStart || '13:00';
    document.getElementById('lunchInEnd').value = result.lunchInEnd || '14:00';
    document.getElementById('departureStart').value = result.departureStart || '17:00';
    document.getElementById('departureEnd').value = result.departureEnd || '18:00';

    // Intervalo de notificação
    document.getElementById('notificationInterval').value = result.notificationInterval || 5;

    // Configurações da API
    if (result.tangerinoEnabled) {
      document.getElementById('tangerinoEnabled').checked = true;
      tangerinoFields.classList.add('active');
    }

    document.getElementById('tangerinoUrl').value = result.tangerinoUrl || 'http://localhost:9999/v1/registrar-ponto';
    document.getElementById('tangerinoCompanyCode').value = result.tangerinoCompanyCode || '';
    document.getElementById('tangerinoPin').value = result.tangerinoPin || '';
  });

  // Função para validar os horários
  function validateTimes() {
    const times = {
      arrival: {
        start: document.getElementById('arrivalStart').value,
        end: document.getElementById('arrivalEnd').value
      },
      lunchOut: {
        start: document.getElementById('lunchOutStart').value,
        end: document.getElementById('lunchOutEnd').value
      },
      lunchIn: {
        start: document.getElementById('lunchInStart').value,
        end: document.getElementById('lunchInEnd').value
      },
      departure: {
        start: document.getElementById('departureStart').value,
        end: document.getElementById('departureEnd').value
      }
    };

    // Converter horários para minutos para facilitar comparação
    const toMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Validar cada período
    for (const period of Object.values(times)) {
      if (toMinutes(period.start) >= toMinutes(period.end)) {
        return false;
      }
    }

    // Validar sequência dos períodos
    if (toMinutes(times.arrival.end) > toMinutes(times.lunchOut.start) ||
      toMinutes(times.lunchOut.end) > toMinutes(times.lunchIn.start) ||
      toMinutes(times.lunchIn.end) > toMinutes(times.departure.start)) {
      return false;
    }

    return true;
  }

  // Função para validar URL
  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Validar configurações da API
  function validateTangerinoSettings() {
    const tangerinoEnabled = document.getElementById('tangerinoEnabled').checked;

    if (!tangerinoEnabled) {
      return true; // Se não estiver habilitado, não precisa validar
    }

    const apiUrl = document.getElementById('tangerinoUrl').value.trim();
    const companyCode = document.getElementById('tangerinoCompanyCode').value.trim();
    const pin = document.getElementById('tangerinoPin').value.trim();

    if (!apiUrl || !isValidUrl(apiUrl) || !companyCode || !pin) {
      return false;
    }

    return true;
  }

  // Função para mostrar mensagem de status
  function showStatus(message, isError = false) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.className = `status ${isError ? 'error' : 'success'}`;
    statusElement.style.display = 'block';

    // Esconder a mensagem após 3 segundos
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 3000);
  }

  // Salvar configurações
  document.getElementById('save').addEventListener('click', () => {
    if (!validateTimes()) {
      showStatus('Por favor, verifique se os horários estão em ordem cronológica e se os intervalos são válidos.', true);
      return;
    }

    if (!validateTangerinoSettings()) {
      showStatus('Por favor, verifique se a URL da API é válida e se todos os campos da integração estão preenchidos corretamente.', true);
      return;
    }

    const notificationInterval = document.getElementById('notificationInterval').value;
    if (notificationInterval < 1 || notificationInterval > 60) {
      showStatus('O intervalo de notificações deve estar entre 1 e 60 minutos.', true);
      return;
    }

    const settings = {
      // Horários
      arrivalStart: document.getElementById('arrivalStart').value,
      arrivalEnd: document.getElementById('arrivalEnd').value,
      lunchOutStart: document.getElementById('lunchOutStart').value,
      lunchOutEnd: document.getElementById('lunchOutEnd').value,
      lunchInStart: document.getElementById('lunchInStart').value,
      lunchInEnd: document.getElementById('lunchInEnd').value,
      departureStart: document.getElementById('departureStart').value,
      departureEnd: document.getElementById('departureEnd').value,

      // Intervalo de notificação
      notificationInterval: parseInt(notificationInterval, 10),

      // Configurações da API
      tangerinoEnabled: document.getElementById('tangerinoEnabled').checked,
      tangerinoUrl: document.getElementById('tangerinoUrl').value.trim(),
      tangerinoCompanyCode: document.getElementById('tangerinoCompanyCode').value.trim(),
      tangerinoPin: document.getElementById('tangerinoPin').value.trim()
    };

    chrome.storage.local.set(settings, () => {
      const saveButton = document.getElementById('save');
      const originalText = saveButton.textContent;

      // Feedback visual no botão
      saveButton.textContent = '✓ Salvo!';
      saveButton.style.backgroundColor = '#28a745';

      setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.style.backgroundColor = '#4285f4';
      }, 2000);

      showStatus('Configurações salvas com sucesso!');

      // Recriar alarme com novo intervalo
      chrome.runtime.sendMessage({ action: 'updateAlarm', interval: parseInt(notificationInterval, 10) });
    });
  });

  // Adicionar validação em tempo real para todos os campos de horário
  const timeInputs = document.querySelectorAll('input[type="time"]');
  timeInputs.forEach(input => {
    input.addEventListener('change', () => {
      if (!validateTimes()) {
        input.style.borderColor = '#dc3545';
      } else {
        input.style.borderColor = '#d0d0d0';
      }
    });
  });

  function getPeriodName(period) {
    const names = {
      arrival: 'Chegada',
      lunchOut: 'Saída para Almoço',
      lunchIn: 'Retorno do Almoço',
      departure: 'Saída'
    };
    return names[period];
  }

  // Função para carregar e exibir os pontos registrados
  function loadRegisteredPoints() {
    chrome.storage.local.get(['points'], function (result) {
      const points = result.points || [];
      const pointsTableBody = document.getElementById('pointsTable').querySelector('tbody');
      pointsTableBody.innerHTML = ''; // Limpar tabela antes de adicionar novos pontos

      points.forEach((point, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${point.date}</td>
          <td>${point.time}</td>
          <td>${getPeriodName(point.period)}</td>
          <td><button class="delete-button" data-index="${index}">Apagar</button></td>
        `;
        pointsTableBody.appendChild(row);
      });

      // Adicionar evento de clique para os botões de apagar
      const deleteButtons = document.querySelectorAll('.delete-button');
      deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
          const index = this.getAttribute('data-index');
          deletePoint(index);
        });
      });
    });
  }

  // Função para apagar um ponto
  function deletePoint(index) {
    chrome.storage.local.get(['points'], function (result) {
      const points = result.points || [];
      points.splice(index, 1); // Remove o ponto do array
      chrome.storage.local.set({ points: points }, function () {
        loadRegisteredPoints(); // Recarregar a tabela
      });
    });
  }

  // Carregar os pontos registrados ao iniciar
  loadRegisteredPoints();
}); 