
    const EVENT_LINK = 'https://kharkiv.internet-bilet.ua/uk/mozhe-buti-imperiya-angeliv';
    const ASSETS = {
      backgrounds: [
        'assets/images/bg01.jpg',
        'assets/images/bg02.jpg',
        'assets/images/bg03.jpg',
        'assets/images/bg04.jpg',
        'assets/images/bg05.jpg',
        'assets/images/bg06.jpg'
      ],
      poster: 'assets/images/event-cover.jpg',
      collageFrames: [
        'assets/images/frame01.jpg',
        'assets/images/frame02.jpg',
        'assets/images/frame03.jpg',
        'assets/images/frame04.jpg'
      ]
    };

    const OPTIONS = {
      moodStart: [
        { value: 'dreamy', emoji: '🌫️', title: 'Задумчивое', sub: 'Сегодня хочется чего-то мягкого и неспешного.' },
        { value: 'calm', emoji: '🙂', title: 'Спокойное', sub: 'Ровный день, без драм и лишней спешки.' },
        { value: 'playful', emoji: '😏', title: 'Игривое', sub: 'Есть настроение на что-то с намёком.' },
        { value: 'tired', emoji: '🥱', title: 'Сонное', sub: 'Нужен повод выбраться в красивый вечер.' }
      ],
      future: [
        { value: 'yes', emoji: '💌', title: 'Да', sub: '' },
        { value: 'maybe', emoji: '🤍', title: 'Пока не знаю', sub: '' }
      ],
      meetTime: [
        { value: '15:00', emoji: '🕒', title: '15', sub: '' },
        { value: '16:00', emoji: '🕓', title: '16', sub: '' },
        { value: '17:00', emoji: '🕔', title: '17', sub: '' },
        { value: 'theatre', emoji: '🎭', title: 'у театра в 17:50', sub: '' }
      ],
      eat: [
        { value: 'yes', emoji: '🍽️', title: 'Да', sub: '' },
        { value: 'no', emoji: '🚶', title: 'Нет', sub: '' }
      ],
      place: [
        { value: 'mao', emoji: '🥢', title: 'Мао', sub: '' },
        { value: 'true-price', emoji: '🍲', title: 'Тру прайс', sub: '' },
        { value: 'custom', emoji: '✍️', title: 'Свой выбор', sub: '' },
        { value: 'secret', emoji: '🗝️', title: 'Секретное место', sub: '' }
      ],
      clothes: [
        { value: 'formal', emoji: '👗', title: 'Формальная', sub: 'рубашки, платья, блеск, все в обмороке' },
        { value: 'casual', emoji: '🧥', title: 'Повседневная', sub: 'легко и удобно' }
      ],
      gift: [
        { value: 'tasty', emoji: '🍫', title: 'Вкусный', sub: '' },
        { value: 'beautiful', emoji: '🌹', title: 'Красивый', sub: '' },
        { value: 'minimal', emoji: '🎁', title: 'Минималистичный', sub: '' },
        { value: 'favorit', emoji: '🤷', title: '“Ну он же тебя покупает, думай, думай”', sub: '' }
      ],
      moodEnd: [
        { value: 'warm', emoji: '😊', title: 'Теплее', sub: '' },
        { value: 'intrigued', emoji: '😉', title: 'Заинтригованное', sub: '' },
        { value: 'happy', emoji: '😄', title: 'Хорошее', sub: '' },
        { value: 'sparkling', emoji: '✨', title: 'Очень хорошее', sub: '' }
      ]
    };

    const state = {
      moodStart: '',
      future: '',
      meetTime: '',
      eat: '',
      place: '',
      customPlace: '',
      clothes: '',
      palette: '',
      gift: '',
      moodEnd: '',
      note: ''
    };

    const app = document.getElementById('app');
    const bg = document.getElementById('bg');
    const audio = document.getElementById('audio');
    const musicToggle = document.getElementById('musicToggle');
    let currentIndex = 0;
    let toastTimer = 0;

    const STEP_BACKGROUNDS = {
      mood1: 0,
      future: 1,
      event: 2,
      meetTime: 3,
      eat: 4,
      place: 5,
      clothes: 1,
      palette: 2,
      gift: 3,
      mood2: 4,
      message: 5,
      finish: 0
    };

    function steps() {
      const out = ['mood1', 'future', 'event', 'meetTime'];
      if (state.meetTime && state.meetTime !== 'theatre') {
        out.push('eat');
        if (state.eat === 'yes') out.push('place');
      }
      out.push('clothes');
      if (state.clothes === 'formal') out.push('palette');
      out.push('gift', 'mood2', 'message', 'finish');
      return out;
    }

    function currentStep() {
      const visible = steps();
      if (currentIndex > visible.length - 1) currentIndex = visible.length - 1;
      return visible[currentIndex];
    }

    function esc(value) {
      return String(value).replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
    }

    function toast(message) {
      const el = document.getElementById('toast');
      el.textContent = message;
      el.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
    }

    function setBackground() {
      const step = currentStep();
      const index = STEP_BACKGROUNDS[step] ?? 0;
      bg.style.setProperty('--bg-image', `url("${ASSETS.backgrounds[index]}")`);
    }

    function progress() {
      const visible = steps();
      return {
        current: currentIndex + 1,
        total: visible.length,
        percent: ((currentIndex + 1) / visible.length) * 100
      };
    }

    function frame(chip, title, subtitle) {
      const p = progress();
      return `
        <div class="topbar">
          <div>Письмо о далёком будущем</div>
          <div>${p.current} / ${p.total}</div>
        </div>
        <div class="progress"><span style="width:${p.percent}%"></span></div>
        <div class="eyebrow">${chip}</div>
        <div class="question-art" aria-hidden="true">${title.emoji}</div>
        <h1>${title.text}</h1>
        <p class="subtitle">${subtitle}</p>
      `;
    }

    function renderChoiceStep({ id, chip, emoji, title, subtitle, options, nextLabel = 'Дальше' }) {
      const selected = state[id];
      const choices = options.map(option => `
        <button class="choice ${selected === option.value ? 'active' : ''}" type="button" data-value="${esc(option.value)}">
          <span class="emoji">${option.emoji}</span>
          <span>
            <span class="choice-title">${esc(option.title)}</span>
            <span class="choice-sub">${esc(option.sub)}</span>
          </span>
          <span class="check">✓</span>
        </button>
      `).join('');

      app.innerHTML = `
        ${frame(chip, { emoji, text: title }, subtitle)}
        <div class="choices">${choices}</div>
        <div class="nav">
          ${currentIndex > 0 ? '<button class="btn btn-sub btn-back" type="button" id="back">←</button>' : ''}
          <button class="btn btn-main" type="button" id="next" ${selected ? '' : 'disabled'}>${nextLabel}</button>
        </div>
      `;

      app.querySelectorAll('[data-value]').forEach(btn => {
        btn.addEventListener('click', () => {
          state[id] = btn.dataset.value;
          if (id === 'meetTime' && state.meetTime === 'theatre') {
            state.eat = '';
            state.place = '';
            state.customPlace = '';
          }
          if (id === 'meetTime' && state.meetTime !== 'theatre') {
            state.eat = '';
            state.place = '';
            state.customPlace = '';
          }
          if (id === 'eat' && state.eat !== 'yes') {
            state.place = '';
            state.customPlace = '';
          }
          if (id === 'clothes' && state.clothes !== 'formal') state.palette = '';
          render();
        });
      });

      bindNav({ nextLabel });
    }

    function bindNav({ validate } = {}) {
      const back = document.getElementById('back');
      const next = document.getElementById('next');
      if (back) back.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex -= 1;
          render();
        }
      });
      if (next) next.addEventListener('click', () => {
        if (validate && !validate()) return;
        currentIndex += 1;
        render();
      });
    }

    function renderEvent() {
      app.innerHTML = `
        ${frame('Времяпровождение', { emoji: '🎟️', text: 'Небольшой план на 18 ноября' }, 'Мне кажется, я смотрел этот спектакль лет 10 назад и потом хотел пересмотреть. Пойдешь со мной?)')}
        <div class="info-card">
          <h3>«Империя ангелов»</h3>
          <div class="event-meta">
            <div><strong>Дата:</strong> 18 ноября, среда</div>
            <div><strong>Начало:</strong> 18:00</div>
            <div><strong>Место:</strong> Театрально-концертный центр, Харьков</div>
            <div><strong>Коротко:</strong> трагикомическая постановка по мотивам романа Бернара Вербера.</div>
          </div>
          <a class="event-link" href="${EVENT_LINK}" target="_blank" rel="noopener noreferrer">Открыть страницу спектакля</a>
          <div class="poster-line">
            <img class="mini-poster" src="${ASSETS.poster}" alt="Обложка Империя ангелов" />
            <div class="helper">Ссылка остаётся кликабельной, так что при желании можно посмотреть детали события отдельно.</div>
          </div>
        </div>
        <div class="nav">
          <button class="btn btn-sub btn-back" type="button" id="back">←</button>
          <button class="btn btn-main" type="button" id="next">Дальше</button>
        </div>
      `;
      bindNav();
    }

    function renderPlace() {
      const selected = state.place;
      const choices = OPTIONS.place.map(option => `
        <button class="choice ${selected === option.value ? 'active' : ''}" type="button" data-value="${esc(option.value)}">
          <span class="emoji">${option.emoji}</span>
          <span>
            <span class="choice-title">${esc(option.title)}</span>
            <span class="choice-sub">${esc(option.sub)}</span>
          </span>
          <span class="check">✓</span>
        </button>
      `).join('');
      const needsCustom = state.place === 'custom';
      app.innerHTML = `
        ${frame('До спектакля', { emoji: '🍷', text: 'Если да, то место?' }, 'Выбери вариант ниже. Если нужен свой, можно вписать его отдельно.')}
        <div class="choices">${choices}</div>
        ${needsCustom ? `
          <input type="text" id="customPlace" class="field" maxlength="100" placeholder="Напиши своё место" value="${esc(state.customPlace)}" />
        ` : ''}
        <div class="nav">
          <button class="btn btn-sub btn-back" type="button" id="back">←</button>
          <button class="btn btn-main" type="button" id="next" ${!selected || (needsCustom && !state.customPlace.trim()) ? 'disabled' : ''}>Дальше</button>
        </div>
      `;

      app.querySelectorAll('[data-value]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.place = btn.dataset.value;
          if (state.place !== 'custom') state.customPlace = '';
          render();
        });
      });

      const input = document.getElementById('customPlace');
      if (input) {
        input.addEventListener('input', () => {
          state.customPlace = input.value;
          const next = document.getElementById('next');
          if (next) next.disabled = !state.customPlace.trim();
        });
      }
      bindNav({
        validate: () => {
          if (state.place === 'custom' && !state.customPlace.trim()) {
            toast('Нужно вписать своё место.');
            return false;
          }
          return true;
        }
      });
    }

    function renderPalette() {
      app.innerHTML = `
        ${frame('Дресс-код', { emoji: '🎨', text: 'Цветовая гамма' }, 'Если хочется, можно вписать желаемые оттенки. Это поле можно оставить пустым.')}
        <input type="text" id="palette" class="field" maxlength="120" placeholder="Например: чёрный, бордо, тёплые оттенки" value="${esc(state.palette)}" />
        <p class="helper">Поле не обязательное — просто дополнительная подсказка.</p>
        <div class="nav">
          <button class="btn btn-sub btn-back" type="button" id="back">←</button>
          <button class="btn btn-main" type="button" id="next">Дальше</button>
        </div>
      `;
      const input = document.getElementById('palette');
      input.addEventListener('input', () => state.palette = input.value);
      bindNav();
    }

    function renderMessage() {
      app.innerHTML = `
        ${frame('Последний штрих', { emoji: '✍️', text: 'Что-то от себя' }, 'впечатления, пожелания, угрозы?')}
        <textarea id="note" placeholder="Напиши что-нибудь от себя">${esc(state.note)}</textarea>
        <p class="helper">поле необязательное</p>
        <div class="nav">
          <button class="btn btn-sub btn-back" type="button" id="back">←</button>
          <button class="btn btn-main" type="button" id="next">Собрать коллаж</button>
        </div>
      `;
      const area = document.getElementById('note');
      area.addEventListener('input', () => state.note = area.value);
      bindNav();
    }

    function moodLabel(type, value) {
      const found = OPTIONS[type].find(item => item.value === value);
      return found ? found.title : '—';
    }
    function giftLabel() { return moodLabel('gift', state.gift); }
    function placeLabel() {
      if (!state.place) return '—';
      if (state.place === 'custom') return state.customPlace || 'Свой выбор';
      const found = OPTIONS.place.find(item => item.value === state.place);
      return found ? found.title : '—';
    }
    function clothesLabel() { return moodLabel('clothes', state.clothes); }
    function futureLabel() { return moodLabel('future', state.future); }
    function eatLabel() { return state.meetTime === 'theatre' ? 'Сразу у театра' : moodLabel('eat', state.eat); }

    function summaryHTML() {
      return `
        <div class="summary-list">
          <div class="summary-item"><span><strong>Настроение в начале</strong></span><span>${esc(moodLabel('moodStart', state.moodStart))}</span></div>
          <div class="summary-item"><span><strong>Готовность планировать</strong></span><span>${esc(futureLabel())}</span></div>
          <div class="summary-item"><span><strong>Встреча</strong></span><span>${esc(state.meetTime === 'theatre' ? 'У театра в 17:50' : state.meetTime || '—')}</span></div>
          <div class="summary-item"><span><strong>До спектакля</strong></span><span>${esc(eatLabel())}</span></div>
          ${state.eat === 'yes' && state.meetTime !== 'theatre' ? `<div class="summary-item"><span><strong>Место</strong></span><span>${esc(placeLabel())}</span></div>` : ''}
          <div class="summary-item"><span><strong>Одежда</strong></span><span>${esc(clothesLabel())}</span></div>
          ${state.clothes === 'formal' && state.palette.trim() ? `<div class="summary-item"><span><strong>Цветовая гамма</strong></span><span>${esc(state.palette.trim())}</span></div>` : ''}
          <div class="summary-item"><span><strong>Подарок</strong></span><span>${esc(giftLabel())}</span></div>
          <div class="summary-item"><span><strong>Настроение теперь</strong></span><span>${esc(moodLabel('moodEnd', state.moodEnd))}</span></div>
        </div>
      `;
    }

    function renderFinish() {
      app.innerHTML = `
        ${frame('Финал', { emoji: '🖼️', text: 'Готовый коллаж' }, 'Сайт собрал ретро-открытку по выбранным ответам. Её можно скачать или отправить через системное меню «Поделиться».')}
        <div class="summary-card">
          <h3>Краткий итог</h3>
          ${summaryHTML()}
          ${state.note.trim() ? `<div class="info-card" style="margin-top:16px"><strong>Что-то от себя</strong><p style="margin-top:10px; line-height:1.6">${esc(state.note.trim())}</p></div>` : ''}
        </div>
        <div class="canvas-wrap">
          <canvas id="collageCanvas" width="1080" height="1520" aria-label="Финальный коллаж"></canvas>
        </div>
        <div class="actions-grid">
          <button class="btn btn-main" type="button" id="download">Скачать коллаж</button>
          <button class="btn btn-sub" type="button" id="share">Поделиться</button>
          <button class="btn btn-sub" type="button" id="restart">Пройти заново</button>
        </div>
        <div class="nav">
          <button class="btn btn-sub btn-back" type="button" id="back">←</button>
        </div>
      `;
      bindFinishActions();
      requestAnimationFrame(drawCollage);
    }

    function validateCurrent(step) {
      switch (step) {
        case 'mood1': return !!state.moodStart;
        case 'future': return !!state.future;
        case 'event': return true;
        case 'meetTime': return !!state.meetTime;
        case 'eat': return !!state.eat;
        case 'place': return !!state.place && (state.place !== 'custom' || !!state.customPlace.trim());
        case 'clothes': return !!state.clothes;
        case 'palette': return true;
        case 'gift': return !!state.gift;
        case 'mood2': return !!state.moodEnd;
        case 'message': return true;
        case 'finish': return true;
        default: return true;
      }
    }

    function render() {
      setBackground();
      const step = currentStep();
      switch (step) {
        case 'mood1':
          renderChoiceStep({
            id: 'moodStart',
            chip: 'Начнём с настроения',
            emoji: '☁️',
            title: 'Как сегодня настроение?',
            subtitle: 'Выбери один из четырёх вариантов — просто чтобы поймать стартовую точку этого вечера.',
            options: OPTIONS.moodStart
          });
          break;
        case 'future':
          renderChoiceStep({
            id: 'future',
            chip: 'Письмо о далёком будущем',
            emoji: '💌',
            title: 'Письмо о далёком будущем — 18 ноября',
            subtitle: 'Готова запланировать вечер среды 18 ноября? В любом случае читаем дальше.',
            options: OPTIONS.future
          });
          break;
        case 'event':
          renderEvent();
          break;
        case 'meetTime':
          renderChoiceStep({
            id: 'meetTime',
            chip: 'Организация вечера',
            emoji: '🕰️',
            title: 'Во сколько встретиться?',
            subtitle: 'Если встретимся пораньше - успеем больше)',
            options: OPTIONS.meetTime
          });
          break;
        case 'eat':
          renderChoiceStep({
            id: 'eat',
            chip: 'До спектакля',
            emoji: '🍽️',
            title: 'Хочешь зайти покушать до спектакля?',
            subtitle: '',
            options: OPTIONS.eat
          });
          break;
        case 'place':
          renderPlace();
          break;
        case 'clothes':
          renderChoiceStep({
            id: 'clothes',
            chip: 'Дресс-код',
            emoji: '👔',
            title: 'Что по одежде?',
            subtitle: 'будем понтоваться или по простому?)',
            options: OPTIONS.clothes
          });
          { const nav = app.querySelector('.nav'); if (nav) nav.insertAdjacentHTML('beforebegin', '<p class="helper">Ты красивая всегда)</p>'); }
          break;
        case 'palette':
          renderPalette();
          break;
        case 'gift':
          renderChoiceStep({
            id: 'gift',
            chip: 'Подарок от фаворита',
            emoji: '🎁',
            title: 'Какой вариант подарка ближе?',
            subtitle: '',
            options: OPTIONS.gift
          });
          { const nav = app.querySelector('.nav'); if (nav) nav.insertAdjacentHTML('beforebegin', '<p class="helper">Я все равно что-то притащу)</p>'); }
          break;
        case 'mood2':
          renderChoiceStep({
            id: 'moodEnd',
            chip: 'После всего этого',
            emoji: '✨',
            title: 'Настроение теперь?',
            subtitle: 'улучшилось?)',
            options: OPTIONS.moodEnd
          });
          break;
        case 'message':
          renderMessage();
          break;
        case 'finish':
          renderFinish();
          break;
      }
    }

    function roundedRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 5) {
      if (!text) return y;
      const words = text.split(/\s+/);
      let line = '';
      let lineCount = 0;
      for (let i = 0; i < words.length; i++) {
        const test = line ? `${line} ${words[i]}` : words[i];
        if (ctx.measureText(test).width > maxWidth && line) {
          ctx.fillText(line, x, y);
          line = words[i];
          y += lineHeight;
          lineCount += 1;
          if (lineCount >= maxLines - 1) break;
        } else {
          line = test;
        }
      }
      if (lineCount < maxLines) {
        const finalText = lineCount === maxLines - 1 && words.length > 0 ? line : line;
        ctx.fillText(finalText, x, y);
        y += lineHeight;
      }
      return y;
    }

    function loadImage(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    }

    async function drawCollage() {
      const canvas = document.getElementById('collageCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const [bgImg, frame1, frame2, frame3] = await Promise.all([
        loadImage(ASSETS.backgrounds[0]),
        loadImage(ASSETS.collageFrames[0]),
        loadImage(ASSETS.collageFrames[1]),
        loadImage(ASSETS.collageFrames[2])
      ]);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ratio = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
      const bw = bgImg.width * ratio;
      const bh = bgImg.height * ratio;
      const bx = (canvas.width - bw) / 2;
      const by = (canvas.height - bh) / 2;
      ctx.drawImage(bgImg, bx, by, bw, bh);

      const overlay = ctx.createLinearGradient(0, 0, 0, canvas.height);
      overlay.addColorStop(0, 'rgba(30,17,14,0.58)');
      overlay.addColorStop(1, 'rgba(30,17,14,0.72)');
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      roundedRect(ctx, 70, 70, 940, 1380, 44);
      ctx.fillStyle = 'rgba(250, 241, 228, 0.94)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(111,74,62,0.20)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#8e4f5b';
      ctx.font = '28px Georgia';
      ctx.fillText('Письмо о далёком будущем', 120, 140);

      ctx.fillStyle = '#2f1d19';
      ctx.font = 'bold 52px Georgia';
      ctx.fillText('18 ноября', 120, 206);

      ctx.fillStyle = '#5f443b';
      ctx.font = '28px Georgia';
      ctx.fillText('Спектакль «Империя ангелов» · 18:00', 120, 250);

      ctx.strokeStyle = 'rgba(111,74,62,0.18)';
      ctx.beginPath();
      ctx.moveTo(120, 280);
      ctx.lineTo(960, 280);
      ctx.stroke();

      ctx.fillStyle = '#3b241f';
      ctx.font = 'italic 30px Georgia';
      let y = 330;
      y = drawWrappedText(ctx, '«Мне кажется, я смотрел этот спектакль лет 10 назад и потом хотел пересмотреть. Пойдешь со мной?)»', 120, y, 840, 42, 4);

      const cardX = 120;
      const cardW = 840;
      const lines = [
        ['Настроение в начале', moodLabel('moodStart', state.moodStart)],
        ['Готовность планировать', futureLabel()],
        ['Встреча', state.meetTime === 'theatre' ? 'У театра в 17:50' : (state.meetTime || '—')],
        ['До спектакля', eatLabel()],
        ...(state.eat === 'yes' && state.meetTime !== 'theatre' ? [['Место', placeLabel()]] : []),
        ['Одежда', clothesLabel()],
        ...(state.clothes === 'formal' && state.palette.trim() ? [['Цветовая гамма', state.palette.trim()]] : []),
        ['Подарок', giftLabel()],
        ['Настроение теперь', moodLabel('moodEnd', state.moodEnd)]
      ];

      let blockY = 520;
      ctx.font = 'bold 24px Georgia';
      lines.forEach(([label, value]) => {
        ctx.fillStyle = '#6a4a40';
        ctx.fillText(label, cardX, blockY);
        ctx.fillStyle = '#241613';
        ctx.font = '24px Georgia';
        drawWrappedText(ctx, value, cardX + 310, blockY, 500, 30, 2);
        ctx.strokeStyle = 'rgba(111,74,62,0.14)';
        ctx.beginPath();
        ctx.moveTo(cardX, blockY + 16);
        ctx.lineTo(cardX + cardW, blockY + 16);
        ctx.stroke();
        ctx.font = 'bold 24px Georgia';
        blockY += 58;
      });

      if (state.note.trim()) {
        roundedRect(ctx, 120, 1020, 840, 170, 24);
        ctx.fillStyle = 'rgba(255,255,255,0.50)';
        ctx.fill();
        ctx.fillStyle = '#6a4a40';
        ctx.font = 'bold 24px Georgia';
        ctx.fillText('Что-то от себя', 145, 1060);
        ctx.fillStyle = '#2f1d19';
        ctx.font = '22px Georgia';
        drawWrappedText(ctx, state.note.trim(), 145, 1100, 790, 32, 4);
      }

      const frames = [frame1, frame2, frame3];
      const framePos = [
        { x: 105, y: 1188, w: 255, h: 190, rot: -0.08 },
        { x: 410, y: 1162, w: 268, h: 200, rot: 0.04 },
        { x: 715, y: 1192, w: 255, h: 190, rot: 0.09 }
      ];

      framePos.forEach((pos, i) => {
        const img = frames[i];
        ctx.save();
        ctx.translate(pos.x + pos.w / 2, pos.y + pos.h / 2);
        ctx.rotate(pos.rot);
        roundedRect(ctx, -pos.w / 2 - 10, -pos.h / 2 - 10, pos.w + 20, pos.h + 34, 12);
        ctx.fillStyle = 'rgba(252,250,247,.96)';
        ctx.fill();
        ctx.fillStyle = 'rgba(111,74,62,.14)';
        ctx.stroke();
        const ratio = Math.max(pos.w / img.width, pos.h / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        ctx.save();
        roundedRect(ctx, -pos.w / 2, -pos.h / 2, pos.w, pos.h, 8);
        ctx.clip();
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();
        ctx.restore();
      });

    }

    function downloadCanvas() {
      const canvas = document.getElementById('collageCanvas');
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'retro-invite-collage.png';
      link.click();
    }

    async function shareCanvas() {
      const canvas = document.getElementById('collageCanvas');
      if (!canvas) return;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return downloadCanvas();
      const file = new File([blob], 'retro-invite-collage.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        try {
          await navigator.share({
            title: 'Письмо о далёком будущем — 18 ноября',
            text: 'Ретро-открытка со спектаклем и планом вечера.',
            files: [file]
          });
          return;
        } catch (error) {
          if (error?.name === 'AbortError') return;
        }
      }
      downloadCanvas();
      toast('Если меню "Поделиться" недоступно, файл уже можно скачать.');
    }

    function bindFinishActions() {
      document.getElementById('download').addEventListener('click', downloadCanvas);
      document.getElementById('share').addEventListener('click', shareCanvas);
      document.getElementById('restart').addEventListener('click', () => {
        state.moodStart = '';
        state.future = '';
        state.meetTime = '';
        state.eat = '';
        state.place = '';
        state.customPlace = '';
        state.clothes = '';
        state.palette = '';
        state.gift = '';
        state.moodEnd = '';
        state.note = '';
        currentIndex = 0;
        render();
      });
      document.getElementById('back').addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex -= 1;
          render();
        }
      });
    }


    async function tryAutoplay() {
      try {
        audio.volume = 0.65;
        await audio.play();
        musicToggle.textContent = '❚❚ Выключить музыку';
      } catch (error) {
        musicToggle.textContent = '♪ Включить музыку';
      }
    }

    musicToggle.addEventListener('click', async () => {
      try {
        if (audio.paused) {
          await audio.play();
          musicToggle.textContent = '❚❚ Выключить музыку';
        } else {
          audio.pause();
          musicToggle.textContent = '♪ Включить музыку';
        }
      } catch (error) {
        toast('Не удалось включить музыку в этом браузере.');
      }
    });

    render();
    tryAutoplay();
  