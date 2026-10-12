import { createTimer } from './timer.js';
import { themes } from './themes.js?v=six-worlds';

const timer = createTimer();
const storageKey = 'pompom-time-v1';
const $ = (selector) => document.querySelector(selector);
let theme = 'space';
let sound = true;
let audioContext;
let previousStatus = 'idle';
let displayedTime = '';

try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved && typeof saved === 'object') {
    timer.restore(saved.timer);
    if (Object.hasOwn(themes, saved.theme)) theme = saved.theme;
    if (typeof saved.sound === 'boolean') sound = saved.sound;
    if (typeof saved.intention === 'string') $('#intention').value = saved.intention.slice(0, 70);
  }
} catch { /* Storage can be unavailable in private browsing. */ }

function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ timer: timer.snapshot(), theme, sound, intention: $('#intention').value }));
  } catch { /* The timer also works without browser storage. */ }
}

function setTheme(nextTheme) {
  theme = nextTheme;
  const detail = themes[theme];
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.collection = detail.collection;
  $('meta[name="theme-color"]').content = detail.color;
  $('#scene-art').src = detail.image;
  $('#scene-art').alt = detail.alt;
  $('#scene-label').textContent = detail.title;
  $('#scene-caption').textContent = detail.caption;
  $('#scene-message').innerHTML = detail.message;
  $('#art-source').href = detail.source;
  document.querySelectorAll('[data-theme-choice]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme)));
}

function renderThemeChoices() {
  for (const [id, detail] of Object.entries(themes)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-option';
    button.dataset.themeChoice = id;
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = `<span class="theme-preview ${id}-preview"><img src="${detail.image}" alt="" loading="lazy" decoding="async" width="96" height="96"></span><span class="theme-text"><strong>${detail.name}</strong><small>${detail.shortCaption}</small></span><span class="theme-check"><svg class="icon"><use href="#icon-check"></use></svg></span>`;
    $(`[data-theme-collection="${detail.collection}"]`).append(button);
  }
}

function renderSound() {
  $('#sound-button').setAttribute('aria-pressed', String(sound));
  $('#sound-button').title = `Completion sound ${sound ? 'on' : 'off'}`;
  $('#sound-button use').setAttribute('href', sound ? '#icon-sound' : '#icon-muted');
}

async function prepareSound() {
  if (!sound) return;
  try {
    audioContext ??= new AudioContext();
    await audioContext.resume();
  } catch { /* A visual completion message is always available. */ }
}

function chime() {
  if (!sound || !audioContext || audioContext.state !== 'running') return;
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const at = audioContext.currentTime + index * 0.22;
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.12, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, at + 1.1);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(at);
    oscillator.stop(at + 1.2);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  });
}

function formatTime(remainingMs) {
  const total = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60) % 60;
  const seconds = total % 60;
  const parts = [minutes, seconds].map((part) => String(part).padStart(2, '0'));
  if (hours) parts.unshift(String(hours).padStart(2, '0'));
  return { parts, label: `${hours ? `${hours} hours ` : ''}${minutes} minutes ${seconds} seconds remaining` };
}

function render() {
  const state = timer.getState();
  const { parts, label } = formatTime(state.remainingMs);
  const time = parts.join(':');
  if (time !== displayedTime) {
    displayedTime = time;
    $('#time-display').innerHTML = parts.join('<span>:</span>');
    $('#time-display').classList.toggle('long-duration', parts.length === 3);
    $('#time-display').setAttribute('aria-label', label);
  }
  document.title = state.status === 'idle' ? 'Pompom Time · a cozy countdown' : `${time} · ${state.status === 'finished' ? 'Time for a little break!' : 'Pompom Time'}`;
  document.body.dataset.status = state.status;
  const statusText = { idle: 'ready when you are', running: 'a little focus, a little magic', paused: 'take your time', finished: 'you did a lovely job' };
  if ($('#timer-status').textContent !== statusText[state.status]) $('#timer-status').textContent = statusText[state.status];
  $('#start-button span').textContent = { idle: 'Start timer', running: 'Pause timer', paused: 'Resume timer', finished: 'Another little moment' }[state.status];
  $('#start-button use').setAttribute('href', state.status === 'running' ? '#icon-pause' : '#icon-play');
  const progress = Math.min(100, Math.max(0, 100 * (1 - state.remainingMs / state.durationMs)));
  const card = $('.timer-card');
  card.style.setProperty('--elapsed', progress / 100);
  card.style.setProperty('--progress-percent', `${progress}%`);
  card.style.setProperty('--progress-angle', `${progress * 3.6}deg`);
  document.querySelectorAll('.world-progress i').forEach((marker, index) => {
    marker.dataset.reached = String(progress >= (index + 1) * 100 / 6);
  });
  $('#progress-fill').style.width = `${progress}%`;
  $('.progress-track').setAttribute('aria-valuenow', String(Math.round(progress)));
  $('#progress-caption').textContent = state.status === 'finished' ? 'a moment well spent' : state.status === 'paused' ? 'a breather is part of the journey' : themes[theme].progressCaption;
  document.querySelectorAll('[data-minutes]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.minutes) * 60000 === state.durationMs)));
  if (state.status === 'finished' && previousStatus !== 'finished') {
    $('#completion').hidden = false;
    $('#announcement').textContent = 'Your timer is finished. A moment well spent. Take a little break!';
    if (previousStatus === 'running') chime();
    persist();
  }
  previousStatus = state.status;
}

function toggleTimer() {
  void prepareSound();
  $('#completion').hidden = true;
  if (timer.getState().status === 'running') timer.pause();
  else timer.start();
  render();
  persist();
}

function resetTimer(durationMs) {
  timer.reset(durationMs);
  $('#completion').hidden = true;
  $('#announcement').textContent = 'Timer reset.';
  render();
  persist();
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { $('#announcement').textContent = 'Fullscreen is not available in this browser.'; }
}

$('#start-button').addEventListener('click', toggleTimer);
$('#reset-button').addEventListener('click', () => resetTimer());
$('#intention').addEventListener('input', persist);
$('#dismiss-completion').addEventListener('click', () => { $('#completion').hidden = true; });
$('#sound-button').addEventListener('click', () => { sound = !sound; renderSound(); void prepareSound(); persist(); });
$('#fullscreen-button').addEventListener('click', toggleFullscreen);
if (!document.fullscreenEnabled) $('#fullscreen-button').hidden = true;
document.addEventListener('fullscreenchange', () => $('#fullscreen-button').setAttribute('aria-label', document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen'));
document.querySelectorAll('[data-minutes]').forEach((button) => button.addEventListener('click', () => resetTimer(Number(button.dataset.minutes) * 60000)));
renderThemeChoices();
document.querySelectorAll('[data-theme-choice]').forEach((button) => button.addEventListener('click', () => { setTheme(button.dataset.themeChoice); render(); persist(); }));

const dialog = $('#custom-dialog');
$('#custom-button').addEventListener('click', () => {
  const total = Math.floor(timer.getState().durationMs / 1000);
  $('#hours').value = Math.floor(total / 3600);
  $('#minutes').value = Math.floor(total / 60) % 60;
  $('#seconds').value = total % 60;
  $('#duration-error').textContent = '';
  dialog.showModal();
});
$('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog && (event.offsetX < 0 || event.offsetX > dialog.offsetWidth || event.offsetY < 0 || event.offsetY > dialog.offsetHeight)) dialog.close(); });
$('#custom-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const duration = (Number($('#hours').value) * 3600 + Number($('#minutes').value) * 60 + Number($('#seconds').value)) * 1000;
  if (!Number.isInteger(duration) || duration < 1000 || duration > 99 * 3600000) {
    $('#duration-error').textContent = 'Choose a time between 1 second and 99 hours.';
    return;
  }
  resetTimer(duration);
  dialog.close();
});

document.addEventListener('keydown', (event) => {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || dialog.open || event.target.closest('input, textarea, button, a, [contenteditable="true"]')) return;
  if (event.code === 'Space') { event.preventDefault(); toggleTimer(); }
  if (event.key.toLowerCase() === 'r') resetTimer();
  if (event.key.toLowerCase() === 'f') void toggleFullscreen();
});
document.addEventListener('visibilitychange', () => { render(); persist(); });
window.addEventListener('pagehide', persist);
setTheme(theme);
renderSound();
render();
setInterval(render, 200);
