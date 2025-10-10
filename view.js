// Представление: отрисовка SVG, болидов, лидерборда
export const RaceView = () => {
  const svg = document.getElementById('track-svg');
  const path = document.getElementById('trackPath');
  const carsLayer = document.getElementById('cars-layer');
  const stageMarkers = document.getElementById('stage-markers');
  const leaderboard = document.getElementById('leaderboard');
  const eventLog = document.getElementById('event-log');

  let pathLength = 0;
  function initTrack(model){
    pathLength = path.getTotalLength();
    // 4 контрольные точки — равные доли пути
    stageMarkers.innerHTML = '';
    for(let i=1;i<=model.stageCount;i++){
      const p = path.getPointAtLength((i/model.stageCount) * pathLength);
      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('transform', `translate(${p.x}, ${p.y})`);
      g.innerHTML = `<circle r="10" fill="#fff" stroke="#111827" stroke-width="3" />
                     <text x="0" y="-14" text-anchor="middle" font-size="12" fill="#111827">S${i}</text>`;
      stageMarkers.appendChild(g);
    }
  }

  function spawnCars(model){
    carsLayer.innerHTML = '';
    model.teams.forEach(t=>{
      const car = document.createElementNS('http://www.w3.org/2000/svg','g');
      car.classList.add('car-sprite');
      car.setAttribute('data-team', t.id);
      // Простой векторный болид
      car.innerHTML = `
        <g>
          <rect x="-20" y="-8" width="40" height="16" rx="4" fill="${t.color}" />
          <circle cx="-14" cy="10" r="5" fill="#111827" />
          <circle cx="14" cy="10" r="5" fill="#111827" />
          <circle cx="-14" cy="-10" r="5" fill="#111827" />
          <circle cx="14" cy="-10" r="5" fill="#111827" />
          <text x="0" y="4" font-size="12" text-anchor="middle" fill="#fff" font-weight="700">${t.number}</text>
        </g>`;
      carsLayer.appendChild(car);
    });
  }

  function setCarPosition(teamId, progress, reducedMotion=false){
    // progress in [0..1], интерпретируется как доля длины пути
    const len = Math.min(Math.max(progress,0),1) * pathLength;
    const pt = path.getPointAtLength(len);
    const car = carsLayer.querySelector(`[data-team="${teamId}"]`);
    if(!car) return;
    const angle = computeTangentAngle(path, len);
    const transform = `translate(${pt.x}, ${pt.y}) rotate(${angle})`;
    if(reducedMotion){
      car.style.transition = 'none';
    } else {
      car.style.transition = '';
    }
    car.setAttribute('transform', transform);
  }

  function computeTangentAngle(path, len){
    const delta = 0.5; // px по длине
    const p1 = path.getPointAtLength(Math.max(0, len - delta));
    const p2 = path.getPointAtLength(Math.min(pathLength, len + delta));
    return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
  }

  function renderLeaderboard(model){
    const teamsSorted = [...model.teams].sort((a,b)=> b.points - a.points);
    leaderboard.innerHTML = '';
    teamsSorted.forEach((t, idx)=>{
      const li = document.createElement('li');
      li.className = 'lb-move';
      li.innerHTML = `
        <span>
          <span class="badge" style="background:${t.color}">${idx+1}</span>
          <strong>${t.name}</strong>
        </span>
        <span>${t.points}</span>`;
      leaderboard.appendChild(li);
    });
  }

  function log(msg){
    const t = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.textContent = `[${t}] ${msg}`;
    eventLog.prepend(line);
  }

  function updateTimers(sessionSec, stageIdx, stageTotal){
    const elSession = document.getElementById('session-timer');
    const elStage = document.getElementById('stage-indicator');
    const remain = Math.max(0, (60*60 - Math.floor(sessionSec)));
    const mm = String(Math.floor(remain / 60)).padStart(2,'0');
    const ss = String(remain % 60).padStart(2,'0');
    elSession.textContent = `${mm}:${ss}`;
    elStage.textContent = `${stageIdx} / ${stageTotal}`;
  }

  function pitEffect(teamId){
    const car = carsLayer.querySelector(`[data-team="${teamId}"]`);
    if(!car) return;
    car.classList.remove('pit-service');
    void car.offsetWidth; // restart animation
    car.classList.add('pit-service');
  }

  return { initTrack, spawnCars, setCarPosition, renderLeaderboard, log, updateTimers, pitEffect };
};
