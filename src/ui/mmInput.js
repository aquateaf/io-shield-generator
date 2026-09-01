import { t, formatNumber } from '../i18n.js';

const MM_LIVE = /^-?\d*(?:[.,]\d{0,4})?$/;

export function roundMm(value) {
  return Math.round(Number(value) * 10000) / 10000;
}

export function formatMm(value) {
  return formatNumber(value);
}

export function parseMm(raw) {
  const text = String(raw ?? '').trim().replace(/\s/g, '');
  if (text === '') return { empty: true };
  if (!MM_LIVE.test(text) || text === '-' || text === ',' || text === '.' || text === '-,' || text === '-.') {
    return { incomplete: true };
  }
  const normalized = text.replace(',', '.').replace(/[.,]$/, '');
  if (normalized === '' || normalized === '-') return { incomplete: true };
  const value = Number(normalized);
  if (!Number.isFinite(value)) return { incomplete: true };
  return { value: roundMm(value) };
}

export function setFieldError(input, message) {
  const host = input.closest('.mm-wrap') || input.parentElement;
  let error = host.querySelector(':scope > .field-error');
  if (!error) {
    error = document.createElement('span');
    error.className = 'field-error';
    input.insertAdjacentElement('afterend', error);
  }
  input.classList.toggle('invalid', Boolean(message));
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  error.textContent = message || '';
  error.hidden = !message;
}

export function wrapMm(input) {
  if (input.parentElement?.classList.contains('mm-wrap')) return input.parentElement;
  const wrap = document.createElement('span');
  wrap.className = 'mm-wrap';
  input.replaceWith(wrap);
  wrap.append(input);
  const error = document.createElement('span');
  error.className = 'field-error';
  error.hidden = true;
  wrap.append(error);
  return wrap;
}

export function bindMmInput(input, { apply, min, max, optional = false } = {}) {
  wrapMm(input);
  input.setAttribute('inputmode', 'decimal');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('spellcheck', 'false');

  const commit = (fromBlur) => {
    const parsed = parseMm(input.value);
    if (parsed.empty) {
      if (optional) {
        setFieldError(input, '');
        apply(null);
        return true;
      }
      setFieldError(input, t('fieldEmpty'));
      return false;
    }
    if (parsed.incomplete) {
      if (fromBlur) setFieldError(input, t('fieldEmpty'));
      return false;
    }
    let value = parsed.value;
    if (min != null) value = Math.max(min, value);
    if (max != null) value = Math.min(max, value);
    setFieldError(input, '');
    apply(value);
    if (fromBlur) input.value = formatMm(value);
    return true;
  };

  input.addEventListener('beforeinput', event => {
    if (event.inputType?.startsWith('delete') || !event.data) return;
    const next = input.value.slice(0, input.selectionStart) + event.data + input.value.slice(input.selectionEnd);
    if (!MM_LIVE.test(next.trim())) event.preventDefault();
  });
  input.addEventListener('input', () => {
    if (commit(false)) input.dispatchEvent(new CustomEvent('mm-commit', { bubbles: true }));
  });
  input.addEventListener('blur', () => {
    commit(true);
    input.dispatchEvent(new CustomEvent('mm-commit', { bubbles: true }));
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); input.blur(); }
  });
}

export function writeMm(input, value) {
  if (!input || document.activeElement === input) return;
  if (input.classList.contains('invalid') && String(input.value).trim() === '') return;
  const next = formatMm(value);
  if (input.value !== next) input.value = next;
}

export function isEditingInside(selector) {
  const host = document.querySelector(selector);
  const active = document.activeElement;
  if (!host || !active || !host.contains(active)) return false;
  return active.matches('input, textarea, select');
}
