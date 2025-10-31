const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://scm1ok-source.github.io", // разрешаем только ваш сайт
    methods: ["GET", "POST"]
  }
});

// Хранилище состояния
let state = {
  teams: [
    { id: 0, name: "Porsche", color: "var(--c1)", pts: 0 },
    { id: 1, name: "Lamborghini", color: "var(--c2)", pts: 0 },
    { id: 2, name: "Williams", color: "var(--c3)", pts: 0 },
    { id: 3, name: "Lotus", color: "var(--c4)", pts: 0 },
    { id: 4, name: "Aston Martin", color: "var(--c5)", pts: 0 },
    { id: 5, name: "McLaren", color: "var(--c6)", pts: 0 },
    { id: 6, name: "Alfa Romeo", color: "var(--c7)", pts: 0 }
  ],
  stage: 0,
  remain: 300,
  history: []
};

const fs = require('fs');
const STORAGE_FILE = 'state.json';

function saveState() {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(state, null, 2));
}

function loadState() {
  try {
    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.log("Нет сохранённого состояния, создаём новое");
    return { teams: [], stage: 0, remain: 300, history: [] };
  }
}

// Загрузка при старте
state = loadState();

// Подключение клиента
io.on('connection', (socket) => {
  console.log('Клиент подключился:', socket.id);

  // Отправляем состояние
  socket.emit('state', state);

  // Приём действий
  socket.on('add', (data) => {
    const { id, delta } = data;
    const team = state.teams.find(t => t.id === id);
    if (team) {
      team.pts += delta;
      state.history.push({
        ts: Date.now(),
        id,
        delta,
        stage: state.stage
      });
      io.emit('state', state);
      saveState();
    }
  });

  socket.on('undo', () => {
    const last = state.history.pop();
    if (last) {
      const team = state.teams.find(t => t.id === last.id);
      if (team) team.pts = Math.max(0, team.pts - last.delta);
      io.emit('state', state);
      saveState();
    }
  });

  socket.on('next', () => {
    if (state.stage < 5) {
      state.stage++;
      state.remain = [300, 600, 900, 1200, 300, 300][state.stage];
      io.emit('state', state);
      saveState();
    }
  });

  socket.on('reset', () => {
    state = { ...loadState() };
    io.emit('state', state);
    saveState();
  });

  socket.on('disconnect', () => {
    console.log('Клиент отключился:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
