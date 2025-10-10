// Модель состояния гонки
export const RaceModel = () => ({
  duration: 60 * 60,          // 60 минут в секундах
  currentTime: 0,             // сек
  stageCount: 4,
  currentStage: 1,
  maxPoints: 100,             // нормировочный максимум для одного круга
  isRunning: false,
  reducedMotion: false,
  teams: [
    { id:1, name:"Team 1", color:"#ef4444", points:0, number:1 },
    { id:2, name:"Team 2", color:"#2563eb", points:0, number:2 },
    { id:3, name:"Team 3", color:"#10b981", points:0, number:3 },
    { id:4, name:"Team 4", color:"#f59e0b", points:0, number:4 },
    { id:5, name:"Team 5", color:"#8b5cf6", points:0, number:5 },
    { id:6, name:"Team 6", color:"#14b8a6", points:0, number:6 },
    { id:7, name:"Team 7", color:"#e11d48", points:0, number:7 }
  ]
});

export function serialize(model){
  return JSON.stringify({
    duration:model.duration,
    currentTime:model.currentTime,
    currentStage:model.currentStage,
    maxPoints:model.maxPoints,
    teams:model.teams
  });
}

export function addPoints(model, teamId, delta){
  const t = model.teams.find(t=>t.id===teamId);
  if(!t) return;
  t.points = Math.max(0, t.points + delta);
}

export function nextStage(model){
  model.currentStage = Math.min(model.stageCount, model.currentStage + 1);
}

export function reset(model){
  model.currentTime = 0; model.currentStage = 1; model.isRunning = false;
  model.teams.forEach(t=>t.points=0);
}
