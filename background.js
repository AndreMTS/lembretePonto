// Inicializar o alarme com o intervalo padrão ou personalizado
chrome.storage.local.get(['notificationInterval'], function(result) {
  const interval = result.notificationInterval || 5; // 5 minutos por padrão
  createAlarm(interval);
});

// Função para criar ou atualizar o alarme
function createAlarm(intervalMinutes) {
  // Primeiro, remover o alarme existente, se houver
  chrome.alarms.clear('checkTime', function() {
    // Criar um novo alarme com o intervalo especificado
    chrome.alarms.create('checkTime', { periodInMinutes: intervalMinutes });
  });
}

// Listener para mensagens do options.js
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'updateAlarm' && message.interval) {
    createAlarm(message.interval);
  }
});

// Listener para o alarme
chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === 'checkTime') {
    checkTimeRanges();
  }
});

// Listener para cliques em notificações
chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
  if (buttonIndex === 0) { // Botão "Registrar Ponto"
    registerPoint(notificationId);
  }
});

// Verificar intervalos de tempo
function checkTimeRanges() {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
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
    const todayPoints = points.filter(point => point.date === today);
    
    // Verificar cada período
    checkPeriod('arrival', timeRanges.arrival, currentTime, todayPoints);
    checkPeriod('lunchOut', timeRanges.lunchOut, currentTime, todayPoints);
    checkPeriod('lunchIn', timeRanges.lunchIn, currentTime, todayPoints);
    checkPeriod('departure', timeRanges.departure, currentTime, todayPoints);
  });
}

// Verificar período específico
function checkPeriod(period, timeRange, currentTime, todayPoints) {
  const [startHour, startMin] = timeRange.start.split(':').map(Number);
  const [endHour, endMin] = timeRange.end.split(':').map(Number);
  const rangeStart = startHour * 60 + startMin;
  const rangeEnd = endHour * 60 + endMin;
  
  // Verificar se está dentro do intervalo
  if (currentTime >= rangeStart && currentTime <= rangeEnd) {
    const hasPoint = todayPoints.some(point => {
      const [hour, min] = point.time.split(':').map(Number);
      const pointTime = hour * 60 + min;
      return pointTime >= rangeStart && pointTime <= rangeEnd;
    });
    
    if (!hasPoint) {
      showNotification(period);
    }
  }
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
      { title: 'Registrar Ponto' }
    ],
    requireInteraction: true
  });
  
  // Armazenar o período para uso quando o botão for clicado
  chrome.storage.local.set({ [`notification_${notificationId}`]: period });
}

// Registrar ponto
function registerPoint(notificationId) {
  chrome.storage.local.get([`notification_${notificationId}`], function(result) {
    const period = result[`notification_${notificationId}`];
    
    if (period) {
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      const dateString = now.toLocaleDateString();
      
      chrome.storage.local.get(['points', 'tangerinoEnabled', 'tangerinoUrl', 'tangerinoCompanyCode', 'tangerinoPin'], function(result) {
        const points = result.points || [];
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
            registerPointInTangerino(result.tangerinoCompanyCode, result.tangerinoPin, function(success) {
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

// Registrar ponto na API local
function registerPointInTangerino(companyCode, pin, callback) {
  // Primeiro, vamos obter a URL configurada
  debugger
  chrome.storage.local.get(['tangerinoUrl'], function(result) {
    const url = result.tangerinoUrl || 'http://localhost:9999/v1/registrar-ponto';
    
    // Fazer a requisição POST
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
  });
}

// Mostrar notificação de confirmação
function showConfirmationNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/icon128.png',
    title: 'Bateu Ponto',
    message: message
  });
} 