document.addEventListener('DOMContentLoaded', () => {
  // Carregar configurações salvas
  chrome.storage.local.get([
    'arrivalStart', 'arrivalEnd',
    'lunchOutStart', 'lunchOutEnd',
    'lunchInStart', 'lunchInEnd',
    'departureStart', 'departureEnd'
  ], (result) => {
    document.getElementById('arrivalStart').value = result.arrivalStart || '08:00';
    document.getElementById('arrivalEnd').value = result.arrivalEnd || '09:00';
    document.getElementById('lunchOutStart').value = result.lunchOutStart || '12:00';
    document.getElementById('lunchOutEnd').value = result.lunchOutEnd || '13:00';
    document.getElementById('lunchInStart').value = result.lunchInStart || '13:00';
    document.getElementById('lunchInEnd').value = result.lunchInEnd || '14:00';
    document.getElementById('departureStart').value = result.departureStart || '17:00';
    document.getElementById('departureEnd').value = result.departureEnd || '18:00';
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

    const settings = {
      arrivalStart: document.getElementById('arrivalStart').value,
      arrivalEnd: document.getElementById('arrivalEnd').value,
      lunchOutStart: document.getElementById('lunchOutStart').value,
      lunchOutEnd: document.getElementById('lunchOutEnd').value,
      lunchInStart: document.getElementById('lunchInStart').value,
      lunchInEnd: document.getElementById('lunchInEnd').value,
      departureStart: document.getElementById('departureStart').value,
      departureEnd: document.getElementById('departureEnd').value
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
}); 