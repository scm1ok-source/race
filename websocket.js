// Заглушка WebSocket / SSE. Подключите реальный URL и протокол по мере интеграции.
export function initSocket(handlers){
  const h = Object.assign({ onUpdate: ()=>{} }, handlers);

  // Пример имитации входящих событий каждые 5 секунд
  setInterval(()=>{
    const teamId = Math.floor(Math.random()*7)+1;
    const delta = Math.random() < 0.7 ? 3 : 7;
    h.onUpdate({ teamId, delta, log:`Сервер: +${delta} очков для Team ${teamId}` });
    const ev = new CustomEvent('server-points', { detail:{ teamId, delta } });
    window.dispatchEvent(ev);
  }, 5000);
}
