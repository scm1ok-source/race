import { addPoints, nextStage, reset } from './model.js';

export const RaceController = (model, view) => {
  // Кеш UI
  const btnStart = document.getElementById('btn-start');
  const btnPause = document.getElementById('btn-pause');
  const btnReset = document.getElementById('btn-reset');
  const btnNext = document.getElementById('btn-next-stage');
  const reducedToggle = document.getElementById('reduced-motion-toggle');

  // Быстрые начисления очков
  document.querySelectorAll('.add-points').forEach(b=>{
    b.addEventListener('click', ()=>{
      const teamId = Number(b.dataset.team);
      addPoints(model, teamId, 5);
      view.log(`+5 очков для Team ${teamId}`);
    });
  });

  // Контролы
  btnStart.addEventListener('click', ()=>{ model.isRunning = true; });
  btnPause.addEventListener('click', ()=>{ model.isRunning = false; });
  btnReset.addEventListener('click', ()=>{ reset(model); view.log('Сброс сессии'); });
  btnNext.addEventListener('click', ()=>{ nextStage(model); view.log(`Переход на этап ${model.currentStage}`); });

  // Reduced motion
  reducedToggle.addEventListener('change', ()=>{ model.reducedMotion = reducedToggle.checked; });

  // Drag-and-Drop лицензий
  const pitZones = document.querySelectorAll('.pit-zone');
  pitZones.forEach(zone=>{
    zone.addEventListener('dragover', e=>{ e.preventDefault(); });
    zone.addEventListener('drop', e=>{
      e.preventDefault();
      const type = e.dataTransfer.getData('text/plain');
      // простая логика наград
      let delta = 0;
      if(type==='tires' || type==='fuel') delta = 10; else if(type==='goldnut') delta = 20;
      // награждаем как демо команду 1
      addPoints(model, 1, delta);
      view.pitEffect(1);
      view.log(`Пит-стоп бонус (${type}): +${delta} очков для Team 1`);
    });
  });

  // Источник DnD: карточки
  document.querySelectorAll('.license').forEach(card=>{
    card.addEventListener('dragstart', e=>{
      e.dataTransfer.setData('text/plain', card.dataset.type);
    });
  });
};
