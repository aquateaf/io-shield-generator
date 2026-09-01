import { t } from '../i18n.js';

const KEY = 'io-shield-generator.appearance.v3';
const WORKSPACE_KEY = 'io-shield-generator.workspace.v1';

export const THEMES = [
  { id: 'paper' },
  { id: 'terracotta' },
  { id: 'moss' },
  { id: 'indigo' },
  { id: 'walnut' },
  { id: 'brass' },
  { id: 'ember' },
  { id: 'ink' }
];

function themeNameKey(id) {
  return `theme${id[0].toUpperCase()}${id.slice(1)}`;
}

const defaults = () => ({ theme: 'paper' });

export function loadAppearance() {
  const next = defaults();
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    if (stored && typeof stored === 'object') Object.assign(next, stored);
  } catch { /* keep defaults */ }
  if (!THEMES.some(theme => theme.id === next.theme)) next.theme = 'paper';
  return next;
}

export function saveAppearance(appearance) {
  localStorage.setItem(KEY, JSON.stringify(appearance));
}

export function applyAppearance(appearance = loadAppearance()) {
  const root = document.documentElement;
  root.dataset.theme = appearance.theme;
  delete root.dataset.bg;
  delete root.dataset.motion;
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
    <button class="settings-toggle" id="open-settings" type="button" aria-haspopup="dialog" aria-expanded="false">
      <span data-i18n="appearance">${t('appearance')}</span>
    </button>`;

  document.querySelector('#settings-layer')?.remove();
  const layer = document.createElement('div');
  layer.id = 'settings-layer';
  layer.innerHTML = `
    <div class="settings-backdrop" id="settings-backdrop" hidden></div>
    <aside class="settings-drawer" id="settings-drawer" hidden role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div class="settings-head">
        <div>
          <h2 id="settings-title" data-i18n="appearanceTitle">${t('appearanceTitle')}</h2>
          <p data-i18n="appearanceHint">${t('appearanceHint')}</p>
        </div>
        <button type="button" id="close-settings" data-i18n-aria="close" aria-label="${t('close')}">×</button>
      </div>
      <div class="choice-grid">${THEMES.map(theme => `
          <button type="button" class="choice-card ${theme.id === appearance.theme ? 'selected' : ''}" data-theme="${theme.id}">
            <span class="theme-swatch theme-swatch-${theme.id}"></span>
            <strong data-i18n="${themeNameKey(theme.id)}">${t(themeNameKey(theme.id))}</strong>
            <small data-i18n="${themeNameKey(theme.id)}Hint">${t(`${themeNameKey(theme.id)}Hint`)}</small>
          </button>`).join('')}
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

  layer.querySelectorAll('[data-theme]').forEach(button => button.addEventListener('click', () => {
    layer.querySelectorAll('[data-theme]').forEach(el => el.classList.toggle('selected', el === button));
    commit({ theme: button.dataset.theme });
  }));

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
