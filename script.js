// ---------- Меню: фон при прокрутке и бургер ----------
const header = document.getElementById('header');
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const toTop = document.getElementById('to-top');

function onScroll() {
  header.classList.toggle('header--scrolled', window.scrollY > 50);
  toTop.classList.toggle('to-top--visible', window.scrollY > window.innerHeight);
}

window.addEventListener('scroll', onScroll);
onScroll();

function setMenu(open) {
  nav.classList.toggle('nav--open', open);
  burger.classList.toggle('burger--open', open);
  burger.setAttribute('aria-expanded', String(open));
}

burger.addEventListener('click', () => setMenu(!nav.classList.contains('nav--open')));

// Закрываем мобильное меню после перехода по пункту
nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ---------- YouTube-видео ----------
// При открытии index.html двойным кликом (file://) YouTube не играет встроенные видео (ошибка 153),
// поэтому в этом режиме по клику открываем ролик на YouTube в новой вкладке.
const isServed = location.protocol === 'http:' || location.protocol === 'https:';

function createIframe(src, title) {
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = title;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.setAttribute('frameborder', '0');
  return iframe;
}

// Показывает превью с кнопкой Play; плеер грузится только по клику — так страница быстрее
function mountVideo(container, id, title) {
  container.innerHTML = '';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'video-preview';
  button.style.backgroundImage = `url("https://i.ytimg.com/vi/${id}/hqdefault.jpg")`;
  button.setAttribute('aria-label', `Смотреть: ${title}`);
  button.innerHTML = `
    <span class="video-preview__play" aria-hidden="true"></span>
    ${isServed ? '' : '<span class="video-preview__note">Откроется на YouTube</span>'}`;

  button.addEventListener('click', () => {
    if (!isServed) {
      window.open(`https://www.youtube.com/watch?v=${id}`, '_blank', 'noopener');
      return;
    }
    container.innerHTML = '';
    container.append(createIframe(`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`, title));
  });

  container.append(button);
}

document.querySelectorAll('.video-frame[data-video-id]').forEach((el) => {
  mountVideo(el, el.dataset.videoId, el.dataset.videoTitle || 'Видео');
});

// Фоновое видео обложки: не крутим его тем, кто отключил анимации в системе
const heroVideo = document.getElementById('hero-video');
if (heroVideo && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  heroVideo.removeAttribute('autoplay');
  heroVideo.pause();
}

// ---------- Плейлист ----------
// Чтобы добавить видео, допишите объект в этот массив: id — код из ссылки youtube.com/watch?v=<id>
const videos = [
  {
    id: 'PoqnoluuWdM',
    title: '«TROICA: TIMELESS LOVE»',
    time: '13:45',
    descr: '«TROICA: TIMELESS LOVE» — 13 минут стрита. Снимали всё лето, в дождь и на разбитых спотах',
  },
  {
    id: 'OU9RhR2C1Us',
    title: 'Скейт-эдит «BLVCK LVMBO» (Street Session)',
    time: '01:07',
    descr: 'Динамичный уличный отчёт со спотов. Максимально близкие ракурсы, сочные звуки щелчков и скольжений. Снят с близким другом Димой Кащеем.',
  },
  {
    id: '7tsdXnUFySk',
    title: 'TROICA VIDEO: скейт-фильм',
    time: '16:21',
    descr: '«TROICA» — это эстетичное погружение в суровый и честный уличный скейтбординг, снятый по всем канонам золотой эры скейт-филминга. Главная особенность проекта — технический подход оператора: Дима принципиально снимал всё видео на легендарную японскую камеру Sony DCR-VX1000 в связке с культовым широкоугольным объективом.',
  },
];

const frame = document.getElementById('playlist-frame');
const titleEl = document.getElementById('playlist-title');
const descrEl = document.getElementById('playlist-descr');
const itemsEl = document.getElementById('playlist-items');

document.getElementById('playlist-count').textContent = `${videos.length} видео`;

videos.forEach((video, index) => {
  const li = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'playlist__item';
  button.innerHTML = `
    <span class="playlist__num">${index + 1}</span>
    <span class="playlist__name"></span>
    <span class="playlist__time">${video.time}</span>`;
  button.querySelector('.playlist__name').textContent = video.title;
  button.addEventListener('click', () => selectVideo(index));
  li.append(button);
  itemsEl.append(li);
});

function selectVideo(index) {
  const video = videos[index];
  mountVideo(frame, video.id, video.title);
  titleEl.textContent = video.title;
  descrEl.textContent = video.descr;
  itemsEl.querySelectorAll('.playlist__item').forEach((item, i) => {
    item.classList.toggle('playlist__item--active', i === index);
  });
}

selectVideo(0);

// ---------- Донат ----------
// Способы поддержки: каждая кнопка — { label, url }. Кнопки с пустой ссылкой не показываются.
const DONATE = {
  // hint: 'СБП — из любого российского банка. DonationAlerts — валюту можно выбрать на странице оплаты.',
  links: [
    // { label: 'СБП', url: 'https://finance.ozon.ru/apps/sbp/ozonbankpay/01a0e379-bd68-73f8-a87e-a21290911f0c' },
    { label: 'Поддержать', url: 'https://www.donationalerts.com/r/Dimzerz' },
  ],
};

const donateLinks = document.getElementById('donate-links');
const activeLinks = DONATE.links.filter((l) => l.url);

document.getElementById('donate-hint').textContent = DONATE.hint;

if (activeLinks.length === 0) {
  donateLinks.innerHTML = '<span class="donate__button donate__button--disabled" aria-disabled="true">Скоро подключим</span>';
}

activeLinks.forEach(({ label, url }) => {
  const a = document.createElement('a');
  a.className = 'donate__button';
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = label;
  donateLinks.append(a);
});
