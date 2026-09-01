const KEY = 'io-shield-generator.locale.v1';

const dictionaries = {
  en: {
    docTitle: 'I/O Shield Generator — PC backplate maker',
    title: 'I/O Shield Generator',
    subtitle: 'Make a custom motherboard backplate and download it as STL.',
    statusEmpty: 'Load an STL blank to start',
    generate: 'Generate preview',
    fileName: 'File name',
    downloadStl: 'Download STL',
    preview: 'Preview',
    topView: 'Top view',
    selectFrame: 'Draw frame',
    autoAtx: 'Fit ATX window',
    resetFrame: 'Frame = whole model',
    navProject: 'Load',
    navFrame: 'Frame',
    navShapes: 'Shapes',
    navPorts: 'Ports',
    projectHeading: 'File and project',
    dropHint: 'Drop an STL here or choose a file',
    modelNone: 'No model loaded',
    tolerance: 'Clearance, mm',
    orientation: 'Blank orientation',
    autoFlat: 'Lay it flat',
    saveProject: 'Download project JSON',
    openProject: 'Open project JSON',
    frameHeading: 'Case opening',
    windowWidth: 'Opening width, mm',
    windowHeight: 'Opening height, mm',
    autoScale: 'Center to size',
    atxNote: 'ATX I/O opening is 158.75 × 44.45 mm.',
    marginLeft: 'Left, mm',
    marginRight: 'Right, mm',
    marginTop: 'Top, mm',
    marginBottom: 'Bottom, mm',
    shapesHeading: 'Shape library',
    newShape: 'New',
    exportLibrary: 'Export library',
    importLibrary: 'Import library',
    sketchHeading: 'Shape sketch',
    portsHeading: 'Placed ports',
    appearance: 'Look',
    appearanceTitle: 'Look',
    appearanceHint: 'Colors for this browser only. Does not change the STL.',
    close: 'Close',
    needStl: 'Need a file with a .stl extension',
    loadStlFirst: 'Load an STL first.',
    frameMatchesModel: 'Frame matches the model bounds.',
    libraryImported: 'Library imported.',
    libraryBad: 'That file does not contain valid shapes.',
    blankLoaded: 'Blank loaded.',
    stlOpenFail: 'Could not open STL: {message}',
    stlEmpty: 'STL has no triangles.',
    orientationUpdated: 'Orientation updated.',
    rotateFail: 'Could not rotate STL: {message}',
    autoOrient: 'Laid flat using the {axis} axis.',
    autoOrientFail: 'Could not auto-orient STL: {message}',
    noFrameYet: 'Load an STL to size the frame.',
    frameSizeOnly: 'Frame: {w} × {h} mm',
    frameSizeFull: 'Model {mw} × {mh} mm · frame {fw} × {fh} mm · L/R {ml} / {mr}, T/B {mt} / {mb}',
    modelTooSmall: 'Model {mw} × {mh} mm is smaller than {w} × {h} mm. Check orientation or pick a smaller opening.',
    frameCentered: 'Frame {w} × {h} mm, centered. L/R {lr} mm, T/B {tb} mm.',
    keepOneContour: 'A shape needs at least one outline.',
    polylineNeed3: 'A polyline needs at least three points.',
    unknownPrimitive: 'Unknown shape primitive.',
    geomNoCoords: 'Geometry has no coordinates.',
    keepOneShape: 'You cannot delete the last shape.',
    shapeName: 'Name',
    bezelHeight: 'Lip height, mm',
    bezelWidth: 'Lip width, mm',
    drawRect: 'Draw rectangle',
    drawCircle: 'Draw circle',
    addPolyline: '+ Polyline',
    deleteShape: 'Delete shape',
    circle: 'Circle {n}',
    rect: 'Rectangle {n}',
    polyline: 'Closed polyline {n}',
    radius: 'Radius',
    width: 'Width',
    height: 'Height',
    round: 'Corner radius',
    points: 'Points “x y; x y; …”',
    remove: 'Remove',
    colShape: 'Shape',
    colLeft: 'From left, mm',
    colRight: 'From right, mm',
    colTop: 'From top, mm',
    colBottom: 'From bottom, mm',
    colTol: 'Clearance',
    duplicate: 'Duplicate',
    deletedShape: 'Missing shape',
    portsEmpty: 'Pick a shape, then click in the top view.',
    outOfFrame: '{name} sits outside the frame.',
    overlap: '{a} overlaps {b}.',
    generateNeedStl: 'Load an STL before generating.',
    loadingCsg: 'Loading CSG…',
    runningCsg: 'Cutting openings…',
    csgPort: 'Cutting openings: port {i} of {total}…',
    generateOk: 'Done: {n} triangles.',
    generateWarn: 'Done, but {n} invalid coordinates were found. Check the model before printing.',
    generateFail: 'CSG failed: {message}',
    newShapeName: 'New shape',
    projectRestored: 'Project restored.',
    projectBad: 'Invalid project file.',
    projectFail: 'Could not open project: {message}',
    projectModel: 'Model from project',
    fieldEmpty: 'Required',
    pickShape: 'Pick a shape from the library first.',
    dragFrame: 'Drag a rectangle on the model — that becomes the shield frame.',
    frameDrawn: 'Frame set. Drag corners or edges to adjust.',
    topEmpty: 'Load an STL to see the top view',
    frameLabel: 'Shield frame  (0, 0)',
    themePaper: 'Sketchbook',
    themePaperHint: 'cream paper and rust ink',
    themeTerracotta: 'Clay shop',
    themeTerracottaHint: 'warm plaster and oxide',
    themeMoss: 'Garden table',
    themeMossHint: 'olive and leaf',
    themeIndigo: 'Ink well',
    themeIndigoHint: 'navy notebook',
    themeWalnut: 'Night desk',
    themeWalnutHint: 'walnut and brass',
    themeBrass: 'Workshop lamp',
    themeBrassHint: 'dark wood, warm gold',
    themeEmber: 'Ember',
    themeEmberHint: 'charcoal and fire',
    themeInk: 'Night ink',
    themeInkHint: 'deep navy'
  },
  ru: {
    docTitle: 'I/O Shield Generator — генератор заглушек ПК',
    title: 'I/O Shield Generator',
    subtitle: 'Соберите заднюю панель материнской платы и скачайте STL.',
    statusEmpty: 'Загрузите STL-заготовку',
    generate: 'Сгенерировать превью',
    fileName: 'Название файла',
    downloadStl: 'Скачать STL',
    preview: 'Превью',
    topView: 'Вид сверху',
    selectFrame: 'Выделить рамку',
    autoAtx: 'Окно ATX',
    resetFrame: 'Рамка = вся модель',
    navProject: 'Загрузка',
    navFrame: 'Рамка',
    navShapes: 'Формы',
    navPorts: 'Порты',
    projectHeading: 'Файл и проект',
    dropHint: 'Перетащите STL сюда или выберите файл',
    modelNone: 'Модель не загружена',
    tolerance: 'Допуск, мм',
    orientation: 'Ориентация заготовки',
    autoFlat: 'Положить плоско',
    saveProject: 'Скачать проект JSON',
    openProject: 'Открыть проект JSON',
    frameHeading: 'Окно корпуса',
    windowWidth: 'Ширина окна, мм',
    windowHeight: 'Высота окна, мм',
    autoScale: 'По центру',
    atxNote: 'Стандарт ATX I/O: 158,75 × 44,45 мм.',
    marginLeft: 'Слева, мм',
    marginRight: 'Справа, мм',
    marginTop: 'Сверху, мм',
    marginBottom: 'Снизу, мм',
    shapesHeading: 'Библиотека форм',
    newShape: 'Новая',
    exportLibrary: 'Экспорт библиотеки',
    importLibrary: 'Импорт библиотеки',
    sketchHeading: 'Скетч формы',
    portsHeading: 'Размещённые порты',
    appearance: 'Вид',
    appearanceTitle: 'Вид',
    appearanceHint: 'Цвета только в этом браузере. На STL не влияет.',
    close: 'Закрыть',
    needStl: 'Нужен файл с расширением .stl',
    loadStlFirst: 'Сначала загрузите STL.',
    frameMatchesModel: 'Рамка совпадает с габаритом модели.',
    libraryImported: 'Библиотека импортирована.',
    libraryBad: 'Файл библиотеки не содержит допустимых форм.',
    blankLoaded: 'Заготовка загружена.',
    stlOpenFail: 'Не удалось открыть STL: {message}',
    stlEmpty: 'STL не содержит треугольников.',
    orientationUpdated: 'Ориентация модели обновлена.',
    rotateFail: 'Не удалось повернуть STL: {message}',
    autoOrient: 'Положено плоско по оси {axis}.',
    autoOrientFail: 'Не удалось авто-ориентировать STL: {message}',
    noFrameYet: 'Загрузите STL для расчёта рамки.',
    frameSizeOnly: 'Размер рамки: {w} × {h} мм',
    frameSizeFull: 'Модель {mw} × {mh} мм · рамка {fw} × {fh} мм · Л/П {ml} / {mr}, В/Н {mt} / {mb}',
    modelTooSmall: 'Модель {mw} × {mh} мм меньше окна {w} × {h} мм. Проверьте ориентацию или уменьшите размер окна.',
    frameCentered: 'Рамка {w} × {h} мм по центру. Слева/справа {lr} мм, сверху/снизу {tb} мм.',
    keepOneContour: 'В форме должен остаться хотя бы один контур.',
    polylineNeed3: 'Полилиния должна иметь хотя бы три точки.',
    unknownPrimitive: 'Неизвестный примитив.',
    geomNoCoords: 'Геометрия без координат.',
    keepOneShape: 'Нельзя удалить последнюю форму.',
    shapeName: 'Название',
    bezelHeight: 'Высота бленды, мм',
    bezelWidth: 'Ширина бленды, мм',
    drawRect: 'Нарисовать прямоугольник',
    drawCircle: 'Нарисовать круг',
    addPolyline: '+ Полилиния',
    deleteShape: 'Удалить форму',
    circle: 'Круг {n}',
    rect: 'Прямоугольник {n}',
    polyline: 'Замкнутая полилиния {n}',
    radius: 'Радиус',
    width: 'Ширина',
    height: 'Высота',
    round: 'Скругление',
    points: 'Точки «x y; x y; …»',
    remove: 'Удалить',
    colShape: 'Форма',
    colLeft: 'От левого, мм',
    colRight: 'От правого, мм',
    colTop: 'От верхнего, мм',
    colBottom: 'От нижнего, мм',
    colTol: 'Допуск',
    duplicate: 'Дублировать',
    deletedShape: 'Удалённая форма',
    portsEmpty: 'Выберите форму и кликните в виде сверху.',
    outOfFrame: '{name}: выходит за границы рамки.',
    overlap: '{a} пересекается с {b}.',
    generateNeedStl: 'Сначала загрузите STL.',
    loadingCsg: 'Загружаю CSG…',
    runningCsg: 'Вырезаю отверстия…',
    csgPort: 'Вырезаю отверстия: порт {i} из {total}…',
    generateOk: 'Готово: {n} треугольников.',
    generateWarn: 'Готово, но найдено невалидных координат: {n}. Проверьте модель перед печатью.',
    generateFail: 'CSG не выполнен: {message}',
    newShapeName: 'Новая форма',
    projectRestored: 'Проект восстановлен.',
    projectBad: 'Неверный формат проекта.',
    projectFail: 'Не удалось открыть проект: {message}',
    projectModel: 'Модель из проекта',
    fieldEmpty: 'Поле не заполнено',
    pickShape: 'Выберите форму из библиотеки.',
    dragFrame: 'Протяните прямоугольник по модели — это будет рамка шилда.',
    frameDrawn: 'Рамка выделена. Углы и стороны можно подвинуть.',
    topEmpty: 'Загрузите STL, чтобы увидеть вид сверху',
    frameLabel: 'Рамка шилда  (0, 0)',
    themePaper: 'Скетчбук',
    themePaperHint: 'кремовая бумага и ржавые чернила',
    themeTerracotta: 'Глиняная',
    themeTerracottaHint: 'штукатурка и оксид',
    themeMoss: 'Садовый стол',
    themeMossHint: 'олива и листва',
    themeIndigo: 'Чернильница',
    themeIndigoHint: 'синяя тетрадь',
    themeWalnut: 'Ночной стол',
    themeWalnutHint: 'орех и латунь',
    themeBrass: 'Лампа в мастерской',
    themeBrassHint: 'тёмное дерево и золото',
    themeEmber: 'Уголь',
    themeEmberHint: 'уголь и жар',
    themeInk: 'Ночные чернила',
    themeInkHint: 'тёмный индиго'
  }
};

let locale = 'en';
const listeners = new Set();

export function getLocale() {
  return locale;
}

export function t(key, vars = {}) {
  const table = dictionaries[locale] || dictionaries.en;
  let text = table[key] ?? dictionaries.en[key] ?? key;
  for (const [name, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}

export function loadLocale() {
  const stored = localStorage.getItem(KEY);
  locale = stored === 'ru' ? 'ru' : 'en';
  return locale;
}

export function setLocale(next) {
  locale = next === 'ru' ? 'ru' : 'en';
  localStorage.setItem(KEY, locale);
  applyLocale();
  listeners.forEach(fn => fn(locale));
}

export function onLocaleChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function applyLocale() {
  const root = document.documentElement;
  root.lang = locale;
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === locale);
  });
}

export function formatNumber(value) {
  if (!Number.isFinite(Number(value))) return '';
  const text = (Math.round(Number(value) * 10000) / 10000).toFixed(4).replace(/\.?0+$/, '');
  const normalized = text === '-0' ? '0' : text;
  return locale === 'ru' ? normalized.replace('.', ',') : normalized;
}
