const KEY = 'io-shield-generator.appearance.v1';
const WORKSPACE_KEY = 'io-shield-generator.workspace.v1';

export const THEMES = [
  { id: 'midnight', name: 'Полночь', hint: 'текущий синий' },
  { id: 'ember', name: 'Эмбер', hint: 'уголь и медь' },
  { id: 'forest', name: 'Тайга', hint: 'хвойный зелёный' },
  { id: 'nebula', name: 'Туманность', hint: 'фиолетовый космос' },
  { id: 'ice', name: 'Лёд', hint: 'холодный циан' },
  { id: 'carbon', name: 'Карбон', hint: 'графит' },
  { id: 'sakura', name: 'Сакура', hint: 'пыльная роза' },
  { id: 'solar', name: 'Солярис', hint: 'янтарный свет' }
];

export const BACKGROUNDS = [
  { id: 'static', name: 'Спокойный', hint: 'без анимации' },
  { id: 'aurora', name: 'Сияние', hint: 'переливающийся градиент' },
  { id: 'orbs', name: 'Сферы', hint: 'мягкие блики' },
  { id: 'grid', name: 'Сетка', hint: 'инженерная сетка' },
  { id: 'stars', name: 'Звёзды', hint: 'медленный дрейф' },
  { id: 'scan', name: 'Скан', hint: 'сканирующая линия' },
  { id: 'waves', name: 'Волны', hint: 'горизонтальный поток' },
  { id: 'pulse', name: 'Пульс', hint: 'дыхание света' }
];

const defaults = () => ({
  theme: 'midnight',
  background: 'aurora',
  intensity: 0.7,
  reducedMotion: false
});

export function loadAppearance() {
  const next = defaults();
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    if (stored && typeof stored === 'object') Object.assign(next, stored);
  } catch { /* keep defaults */ }
  if (!THEMES.some(t => t.id === next.theme)) next.theme = 'midnight';
  if (!BACKGROUNDS.some(b => b.id === next.background)) next.background = 'aurora';
  next.intensity = Math.min(1, Math.max(0.15, Number(next.intensity) || 0.7));
  next.reducedMotion = Boolean(next.reducedMotion);
  return next;
}

export function saveAppearance(appearance) {
  localStorage.setItem(KEY, JSON.stringify(appearance));
}

export function applyAppearance(appearance = loadAppearance()) {
  const root = document.documentElement;
  root.dataset.theme = appearance.theme;
  root.dataset.bg = appearance.background;
  root.dataset.motion = appearance.reducedMotion ? 'reduce' : 'full';
  root.style.setProperty('--bg-intensity', String(appearance.intensity));
  const meta = document.querySelector('meta[name="theme-color"]');
  const accent = getComputedStyle(root).getPropertyValue('--header-bg').trim();
  if (meta && accent) meta.setAttribute('content', accent);
}

export function applyStoredAppearance() {
  applyAppearance(loadAppearance());
}

export function loadWorkspace() {
  const stored = localStorage.getItem(WORKSPACE_KEY);
  return ['project', 'frame', 'shapes', 'ports'].includes(stored) ? stored : 'project';
}

export function saveWorkspace(id) {
  localStorage.setItem(WORKSPACE_KEY, id);
}

export function mountAppearance({ onChange } = {}) {
  const appearance = loadAppearance();
  applyAppearance(appearance);
  const host = document.querySelector('#settings-root');
  if (!host) return appearance;

  host.innerHTML = `
    <button class="settings-toggle" id="open-settings" type="button" aria-haspopup="dialog" aria-expanded="false" title="Оформление">
      <span class="settings-gear" aria-hidden="true"></span>
      <span>Оформление</span>
    </button>`;

  document.querySelector('#settings-layer')?.remove();
  const layer = document.createElement('div');
  layer.id = 'settings-layer';
  layer.innerHTML = `
    <div class="settings-backdrop" id="settings-backdrop" hidden></div>
    <aside class="settings-drawer" id="settings-drawer" hidden role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div class="settings-head">
        <div>
          <h2 id="settings-title">Оформление</h2>
          <p>Темы, анимированные фоны и интенсивность</p>
        </div>
        <button type="button" id="close-settings" aria-label="Закрыть">×</button>
      </div>
      <div class="settings-cats" role="tablist">
        <button type="button" class="active" data-settings-cat="themes">Темы</button>
        <button type="button" data-settings-cat="backgrounds">Фоны</button>
        <button type="button" data-settings-cat="effects">Эффекты</button>
      </div>
      <div class="settings-pane active" data-settings-pane="themes">
        <div class="choice-grid">${THEMES.map(theme => `
          <button type="button" class="choice-card ${theme.id === appearance.theme ? 'selected' : ''}" data-theme="${theme.id}">
            <span class="theme-swatch theme-swatch-${theme.id}"></span>
            <strong>${theme.name}</strong>
            <small>${theme.hint}</small>
          </button>`).join('')}
        </div>
      </div>
      <div class="settings-pane" data-settings-pane="backgrounds">
        <div class="choice-grid">${BACKGROUNDS.map(bg => `
          <button type="button" class="choice-card ${bg.id === appearance.background ? 'selected' : ''}" data-bg="${bg.id}">
            <span class="bg-swatch bg-swatch-${bg.id}"></span>
            <strong>${bg.name}</strong>
            <small>${bg.hint}</small>
          </button>`).join('')}
        </div>
      </div>
      <div class="settings-pane" data-settings-pane="effects">
        <label class="intensity-label">Интенсивность фона
          <input id="bg-intensity" type="range" min="15" max="100" value="${Math.round(appearance.intensity * 100)}">
        </label>
        <label class="check-row"><input id="reduce-motion" type="checkbox" ${appearance.reducedMotion ? 'checked' : ''}> Без анимации фона</label>
        <p class="note">Настройка сохраняется в этом браузере и не влияет на STL.</p>
      </div>
    </aside>`;
  document.body.append(layer);

  const drawer = layer.querySelector('#settings-drawer');
  const backdrop = layer.querySelector('#settings-backdrop');
  const toggle = host.querySelector('#open-settings');

  const setOpen = open => {
    drawer.hidden = !open;
    backdrop.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('settings-open', open);
  };

  const commit = patch => {
    Object.assign(appearance, patch);
    saveAppearance(appearance);
    applyAppearance(appearance);
    onChange?.(appearance);
  };

  toggle.addEventListener('click', () => setOpen(drawer.hidden));
  backdrop.addEventListener('click', () => setOpen(false));
  layer.querySelector('#close-settings').addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !drawer.hidden) setOpen(false); });

  layer.querySelectorAll('[data-settings-cat]').forEach(button => button.addEventListener('click', () => {
    layer.querySelectorAll('[data-settings-cat]').forEach(el => el.classList.toggle('active', el === button));
    layer.querySelectorAll('[data-settings-pane]').forEach(pane => pane.classList.toggle('active', pane.dataset.settingsPane === button.dataset.settingsCat));
  }));

  layer.querySelectorAll('[data-theme]').forEach(button => button.addEventListener('click', () => {
    layer.querySelectorAll('[data-theme]').forEach(el => el.classList.toggle('selected', el === button));
    commit({ theme: button.dataset.theme });
  }));

  layer.querySelectorAll('[data-bg]').forEach(button => button.addEventListener('click', () => {
    layer.querySelectorAll('[data-bg]').forEach(el => el.classList.toggle('selected', el === button));
    commit({ background: button.dataset.bg });
  }));

  layer.querySelector('#bg-intensity').addEventListener('input', event => {
    commit({ intensity: Number(event.target.value) / 100 });
  });
  layer.querySelector('#reduce-motion').addEventListener('change', event => {
    commit({ reducedMotion: event.target.checked });
  });

  return appearance;
}

export function bindWorkspace() {
  const buttons = [...document.querySelectorAll('[data-workspace]')];
  const panels = [...document.querySelectorAll('[data-panel]')];
  const activate = id => {
    buttons.forEach(button => button.classList.toggle('active', button.dataset.workspace === id));
    panels.forEach(panel => panel.classList.toggle('active', panel.dataset.panel === id));
    saveWorkspace(id);
  };
  buttons.forEach(button => button.addEventListener('click', () => activate(button.dataset.workspace)));
  activate(loadWorkspace());
}
