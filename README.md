<div align="center">

# 🛡️ I/O Shield Generator

**Design custom PC I/O shields in your browser — no software, no sign-up.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen)](https://aquateaf.github.io/io-shield-generator/)
![Made with Three.js](https://img.shields.io/badge/made%20with-Three.js-black)

**[🇷🇺 Русский](#русский) · [🇬🇧 English](#english)**

**[👉 Open the live tool](https://aquateaf.github.io/io-shield-generator/)**

</div>

---

## Русский

Веб-инструмент для создания кастомных задних панелей ПК (I/O shield) прямо в браузере. Собери шилд под свою материнскую плату из нужных портов и сразу скачай готовую 3D-модель для печати — без установки софта.

Проект полностью бесплатный и открытый, работает как обычный сайт, без сервера и регистрации.

### ✨ Возможности

- 📐 Расстановка портов по координатам от краёв рамки — быстро и точно
- 🔌 Библиотека готовых портов: USB, HDMI, DisplayPort, USB-C, аудио-джеки, DVI, кнопка reset и другие
- 🎨 Загрузка своего 3D-шилда и точное позиционирование портов на нём
- 🛠️ Встроенный редактор портов — рисуй свои формы, если нужного порта нет в библиотеке
- ⚙️ Настраиваемый зазор/допуск вокруг портов (по умолчанию 0.8 мм)
- 📦 Экспорт готового STL — один файл, с уже вырезанными отверстиями и вставленными бортиками портов
- 💻 Всё считается прямо в браузере — не нужен сервер или мощное железо

### 🚀 Как пользоваться

1. Открой [живую версию инструмента](https://aquateaf.github.io/io-shield-generator/)
2. Загрузи свой шилд (или используй пример) и укажи границы рамки
3. Добавь нужные порты из библиотеки и расставь их по координатам
4. Настрой зазоры при необходимости
5. Скачай готовый STL и отправляй в слайсер

### 🖥️ Локальный запуск

```bash
git clone https://github.com/aquateaf/io-shield-generator.git
cd io-shield-generator
# открой index.html в браузере, либо запусти локальный сервер:
npx serve .
```

### 🤝 Contributing

Пул-реквесты, идеи и репорты багов приветствуются — просто открой issue.

### 📄 Лицензия

MIT — делай с проектом что хочешь, но не забудь ссылку на оригинал.

[⬆ К переключателю языков](#-io-shield-generator)

---

## English

A browser-based tool for designing custom PC I/O shields (motherboard back-panel shields). Pick the ports your motherboard needs, position them, and download a ready-to-print 3D model — no software installation required.

Free and open-source, runs as a plain website with no backend and no sign-up.

### ✨ Features

- 📐 Position ports using coordinates measured from the frame edges — fast and precise
- 🔌 Built-in port library: USB, HDMI, DisplayPort, USB-C, round audio jacks, DVI, reset button, and more
- 🎨 Upload your own shield model and align ports precisely on it
- 🛠️ Built-in port editor — sketch custom port shapes when the library doesn't have what you need
- ⚙️ Adjustable clearance/tolerance around ports (default 0.8mm)
- 📦 Exports a single print-ready STL, with holes already cut and port bezels merged in
- 💻 Everything runs client-side in the browser — no server or heavy hardware needed

### 🚀 How to use

1. Open the [live tool](https://aquateaf.github.io/io-shield-generator/)
2. Upload your shield model (or use the sample) and mark the frame boundaries
3. Add the ports you need from the library and position them
4. Adjust clearances if needed
5. Download the final STL and send it to your slicer

### 🖥️ Running locally

```bash
git clone https://github.com/aquateaf/io-shield-generator.git
cd io-shield-generator
# open index.html in your browser, or run a local server:
npx serve .
```

### 🤝 Contributing

Pull requests, ideas, and bug reports are welcome — feel free to open an issue.

### 📄 License

MIT — do whatever you want with it, just credit the original project.

[⬆ Back to language switch](#-io-shield-generator)
