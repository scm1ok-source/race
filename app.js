import { RaceModel } from './model.js';
import { RaceView } from './view.js';
import { RaceController } from './controller.js';
import { initSocket } from './websocket.js';

const model = RaceModel();
const view = RaceView();

window.addEventListener('DOMContentLoaded', ()=>{
  view.initTrack(model);
  view.spawnCars(model);
  view.renderLeaderboard(model);
  view.updateTimers(model.currentTime, model.currentStage, model.stageCount);

  // Контроллер UI
  RaceController(model, view);

  // Реалтайм-канал (заглушка):
  initSocket({
    onUpdate:(msg)=>{
      if(msg.log) view.log(msg.log);
      // В реальной интеграции здесь можно начислять очки в модель
      // и перерисовывать: addPoints(model, msg.teamId, msg.delta);
    }
  });

  // Главный цикл
  let last = performance.now();
  function loop(now){
    const dt = Math.min(1, (now - last) / 1000); // сек
    last = now;

    if(model.isRunning){
      model.currentTime = Math.min(model.duration, model.currentTime + dt);
      if(model.currentTime >= model.duration){
        model.isRunning = false; // стоп по окончанию
      }
    }

    // Обновление позиций болидов по очкам
    const maxP = Math.max(1, ...model.teams.map(t=>t.points), model.maxPoints);
    model.teams.forEach(t=>{
      const progress = (t.points % maxP) / maxP; // круг
      view.setCarPosition(t.id, progress, model.reducedMotion);
    });

    // UI
    view.renderLeaderboard(model);
    view.updateTimers(model.currentTime, model.currentStage, model.stageCount);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
});
