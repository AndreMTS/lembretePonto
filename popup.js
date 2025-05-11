document.addEventListener('DOMContentLoaded', function() {
  const registerButton = document.getElementById('registerPoint');
  const openOptionsLink = document.getElementById('openOptions');
  
  // Carregar status atual
  updateStatus();
  
  // Registrar ponto
  registerButton.addEventListener('click', function() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    
    // Determinar o período atual
    chrome.storage.local.get([
      'arrivalStart', 'arrivalEnd',
      'lunchOutStart', 'lunchOutEnd',
      'lunchInStart', 'lunchInEnd',
      'departureStart', 'departureEnd',
      'tangerinoEnabled', 'tangerinoUrl', 'tangerinoCompanyCode', 'tangerinoPin'
    ], function(result) {
      // Usar valores padrão se não estiverem definidos
      const timeRanges = {
        arrival: { 
          start: result.arrivalStart || '08:00', 
          end: result.arrivalEnd || '09:00' 
        },
        lunchOut: { 
          start: result.lunchOutStart || '12:00', 
          end: result.lunchOutEnd || '13:00' 
        },
        lunchIn: { 
          start: result.lunchInStart || '13:00', 
          end: result.lunchInEnd || '14:00' 
        },
        departure: { 
          start: result.departureStart || '17:00', 
          end: result.departureEnd || '18:00' 
        }
      };
      
      const currentTime = now.getHours() * 60 + now.getMinutes();
      let currentPeriod = null;
      
      // Verificar em qual período estamos
      for (const [period, range] of Object.entries(timeRanges)) {
        const [startHour, startMin] = range.start.split(':').map(Number);
        const [endHour, endMin] = range.end.split(':').map(Number);
        const rangeStart = startHour * 60 + startMin;
        const rangeEnd = endHour * 60 + endMin;
        
        if (currentTime >= rangeStart && currentTime <= rangeEnd) {
          currentPeriod = period;
          break;
        }
      }
      
      // Registrar o ponto
      chrome.storage.local.get(['points'], function(result) {
        const points = result.points || [];
        points.push({
          date: dateString,
          time: timeString,
          timestamp: now.getTime(),
          period: currentPeriod
        });
        
        chrome.storage.local.set({ points: points }, function() {
          updateStatus();
          
          // Efeito visual de confirmação
          registerButton.textContent = 'Registrado!';
          registerButton.style.backgroundColor = '#28a745';
          
          setTimeout(() => {
            registerButton.textContent = 'Registrar Ponto';
            registerButton.style.backgroundColor = '#4285f4';
          }, 2000);
          
          // Aqui está o problema - precisamos pegar a URL das configurações
          chrome.storage.local.get(['tangerinoEnabled', 'tangerinoUrl', 'tangerinoCompanyCode', 'tangerinoPin'], function(config) {
            if (config.tangerinoEnabled && config.tangerinoCompanyCode && config.tangerinoPin) {
              registerPointInTangerino(config.tangerinoUrl, config.tangerinoCompanyCode, config.tangerinoPin, function(success) {
                if (success) {
                  showNotification('Ponto registrado com sucesso no sistema e na API local!');
                } else {
                  showNotification('Ponto registrado no sistema, mas houve um erro ao registrar na API local.');
                }
              });
            } else {
              showNotification('Ponto registrado com sucesso!');
            }
          });
        });
      });
    });
  });
  
  // Abrir página de configurações
  openOptionsLink.addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
  
  // Atualizar status dos pontos
  function updateStatus() {
    const now = new Date();
    const today = now.toLocaleDateString();
    
    chrome.storage.local.get([
      'arrivalStart', 'arrivalEnd',
      'lunchOutStart', 'lunchOutEnd',
      'lunchInStart', 'lunchInEnd',
      'departureStart', 'departureEnd',
      'points'
    ], function(result) {
      // Usar valores padrão se não estiverem definidos
      const timeRanges = {
        arrival: { 
          start: result.arrivalStart || '08:00', 
          end: result.arrivalEnd || '09:00' 
        },
        lunchOut: { 
          start: result.lunchOutStart || '12:00', 
          end: result.lunchOutEnd || '13:00' 
        },
        lunchIn: { 
          start: result.lunchInStart || '13:00', 
          end: result.lunchInEnd || '14:00' 
        },
        departure: { 
          start: result.departureStart || '17:00', 
          end: result.departureEnd || '18:00' 
        }
      };
      
      const points = result.points || [];
      
      // Filtrar pontos do dia
      const todayPoints = points.filter(point => point.date === today);
      
      // Atualizar status de cada período
      updatePeriodStatus('arrival', todayPoints, timeRanges.arrival);
      updatePeriodStatus('lunchOut', todayPoints, timeRanges.lunchOut);
      updatePeriodStatus('lunchIn', todayPoints, timeRanges.lunchIn);
      updatePeriodStatus('departure', todayPoints, timeRanges.departure);
    });
  }
  
  function updatePeriodStatus(period, points, timeRange) {
    const statusElement = document.getElementById(`${period}Status`);
    const timeElement = document.getElementById(`${period}Time`);
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Converter horários do range para minutos
    const [startHour, startMin] = timeRange.start.split(':').map(Number);
    const [endHour, endMin] = timeRange.end.split(':').map(Number);
    const rangeStart = startHour * 60 + startMin;
    const rangeEnd = endHour * 60 + endMin;
    
    // Encontrar o ponto registrado para este período
    const periodPoint = points.find(point => {
      const [hour, min] = point.time.split(':').map(Number);
      const pointTime = hour * 60 + min;
      return pointTime >= rangeStart && pointTime <= rangeEnd;
    });
    
    // Verificar se está dentro do intervalo
    if (currentTime >= rangeStart && currentTime <= rangeEnd) {
      if (periodPoint) {
        statusElement.textContent = `${getPeriodName(period)}: Registrado`;
        statusElement.className = 'status registered';
        timeElement.textContent = `Registrado às ${periodPoint.time}`;
      } else {
        statusElement.textContent = `${getPeriodName(period)}: Pendente`;
        statusElement.className = 'status pending';
        timeElement.textContent = `Horário: ${timeRange.start} - ${timeRange.end}`;
      }
    } else {
      if (periodPoint) {
        statusElement.textContent = `${getPeriodName(period)}: Registrado`;
        statusElement.className = 'status registered';
        timeElement.textContent = `Registrado às ${periodPoint.time}`;
      } else {
        statusElement.textContent = `${getPeriodName(period)}: Fora do horário`;
        statusElement.className = 'status out-of-time';
        timeElement.textContent = `Horário: ${timeRange.start} - ${timeRange.end}`;
      }
    }
  }
  
  function getPeriodName(period) {
    const names = {
      arrival: 'Chegada',
      lunchOut: 'Saída para Almoço',
      lunchIn: 'Retorno do Almoço',
      departure: 'Saída'
    };
    return names[period];
  }
  
  // Registrar ponto na API local
  function registerPointInTangerino(apiUrl, companyCode, pin, callback) {
    const url = apiUrl || 'http://localhost:9999/v1/registrar-ponto'; // URL default como fallback
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employerCode: companyCode,
        pin: pin
      })
    })
      .then(response => {
        if (response.ok) {
          return response.text();
        }
        throw new Error('Erro na requisição para a API local');
      })
      .then(data => {
        console.log('Resposta da API:', data);
        callback(true);
      })
      .catch(error => {
        console.error('Erro ao registrar ponto:', error);
        callback(false);
      });
  }
  
  // Mostrar notificação
  function showNotification(period) {
    const messages = {
      arrival: 'Não se esqueça de registrar sua chegada!',
      lunchOut: 'Hora do almoço! Não se esqueça de registrar seu ponto de saída.',
      lunchIn: 'Não se esqueça de registrar seu ponto de retorno do almoço!',
      departure: 'Não se esqueça de registrar sua saída!'
    };
    
    const notificationId = `point_${period}_${Date.now()}`;
    
    chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: 'images/icon128.png',
      title: 'Bateu Ponto',
      message: messages[period],
      buttons: [
        { title: 'Registrar Ponto' },
        { title: 'Adiar 10 min' }
      ],
      requireInteraction: true
    });
  }
  
  // Registrar ponto
  function registerPoint(notificationId) {
    chrome.storage.local.get([`notification_${notificationId}`], function(result) {
      const period = result[`notification_${notificationId}`];
      
      if (period) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR'); // Salvar em português
        const dateString = now.toLocaleDateString('pt-BR'); // Salvar em português
        
        chrome.storage.local.get(['points', 'tangerinoEnabled', 'tangerinoUrl', 'tangerinoCompanyCode', 'tangerinoPin'], function(result) {
          const points = result.points || [];
          
          // Registrar o ponto apenas se o usuário clicar no botão
          points.push({
            date: dateString,
            time: timeString,
            timestamp: now.getTime(),
            period: period
          });
          
          chrome.storage.local.set({ points: points }, function() {
            // Remover a notificação e o período armazenado
            chrome.notifications.clear(notificationId);
            chrome.storage.local.remove([`notification_${notificationId}`]);
            
            // Verificar se a integração com Tangerino está ativada
            if (result.tangerinoEnabled && result.tangerinoCompanyCode && result.tangerinoPin) {
              registerPointInTangerino(result.tangerinoUrl, result.tangerinoCompanyCode, result.tangerinoPin, function(success) {
                if (success) {
                  showConfirmationNotification('Ponto registrado com sucesso no sistema e na API local!');
                } else {
                  showConfirmationNotification('Ponto registrado no sistema, mas houve um erro ao registrar na API local.');
                }
              });
            } else {
              // Mostrar confirmação normal
              showConfirmationNotification('Ponto registrado com sucesso!');
            }
          });
        });
      }
    });
  }
}); 