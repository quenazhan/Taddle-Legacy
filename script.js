
'use strict';

// ==========================================
// TADDLE LEGACY - JAVASCRIPT
// ==========================================

// SELECT ELEMENTS
const $ = (selector) => document.querySelector(selector);

const bgm = $('#bgm');
const hoverSound = $('#hover-sound');
const clickSound = $('#click-sound');
const musicButton = $('#music-toggle');

const heroVideo = $('.hero-video');
const hero = $('.hero');
const menuButton = $('.menu-toggle');

let musicOn = false;


// ==========================================
// 1. ACTIVE NAVIGATION
// ==========================================

const currentPage = (
  location.pathname.split('/').pop() || 'index.html'
).toLowerCase();

document.querySelectorAll('.main-nav a').forEach(link => {

  const target = new URL(
    link.getAttribute('href'),
    location.href
  ).pathname.split('/').pop().toLowerCase();

  const active = target === currentPage;

  link.classList.toggle('active', active);

  if (active) {
    link.setAttribute('aria-current', 'page');
  } else {
    link.removeAttribute('aria-current');
  }

});


// ==========================================
// 2. MUSIC ON / OFF
// ==========================================

const MUSIC_KEY = 'taddle-music-v2';
function readMusicState() {
  try { return JSON.parse(sessionStorage.getItem(MUSIC_KEY)) || {}; } catch (_) { return {}; }
}
function saveMusicState() {
  if (!bgm) return;
  try { sessionStorage.setItem(MUSIC_KEY, JSON.stringify({
    enabled: musicOn, time: bgm.currentTime || 0, updated: Date.now()
  })); } catch (_) {}
}
const updateMusicButton = () => {
  if (!musicButton) return;
  musicButton.textContent = musicOn ? '♫ MUSIC: ON' : '♫ MUSIC: OFF';
  musicButton.setAttribute('aria-pressed', String(musicOn));
};


// ==========================================
// 3. GAME FEATURES DATA
// ==========================================
// Tukar gambar, title dan description
// untuk setiap feature di sini.

const featureData = [

  // FEATURE 1
  {
    title: 'Strategic Turn-Based Combat',

    image: 'assets/images/feature-detail-1.png',

    description:
      'Experience a strategic turn-based combat system that challenges players to think carefully before making their next move. Choose between Attack, Skill, Item, Guard, and Escape to adapt to different battle situations. Each action plays an important role in overcoming powerful enemies and surviving challenging encounters.'
  },

  // FEATURE 2
  {
    title: 'Four Heroes, One Destiny',

    image: 'assets/images/feature-detail-2.png',

    description:
      'Follow Sora and his three companions as their journeys intertwine. Each hero brings a unique perspective and strength to a shared destiny.'
  },

  // FEATURE 3
  {
    title: 'A World Beyond Memory',

    image: 'assets/images/feature-detail-3.png',

    description:
      'Explore the mysteries of Aetheria, a world shaped by forgotten legends and ancient secrets. Discover what lies beyond memory.'
  },

  // FEATURE 4
  {
    title: 'Shape Your Legacy',

    image: 'assets/images/feature-detail-4.png',

    description:
      'Your journey will define the legacy you leave behind. Uncover the truth, overcome powerful enemies, and change the fate of Aetheria.'
  }

];


// ==========================================
// 4. HOVER AND CLICK SOUND
// ==========================================

function playEffect(audio, volume) {

  if (!audio || !audio.getAttribute('src')) return;

  try {

    audio.pause();
    audio.currentTime = 0;
    audio.volume = volume;

    audio.play().catch(() => {});

  } catch (e) {}

}


// ==========================================
// 5. POPUP OPEN / CLOSE
// ==========================================

function openModal(modal) {

  if (!modal) return;

  modal.hidden = false;

  document.body.classList.add('modal-open');

  modal.querySelector('[data-close]')?.focus();

}

function closeModal(modal) {

  if (!modal) return;

  modal.hidden = true;

  document.body.classList.remove('modal-open');

  if (modal.id === 'trailer-modal') {

    $('#trailer-video')?.pause();
    if (musicOn && bgm && bgm.paused) bgm.play().catch(() => {});

  }

}


// ==========================================
// 6. HERO VIDEO
// ==========================================

heroVideo?.addEventListener('loadeddata', () => {

  hero.classList.add('video-ready');

});

heroVideo?.addEventListener('error', () => {

  hero.classList.remove('video-ready');

});

if (heroVideo && heroVideo.readyState >= 2) {

  hero.classList.add('video-ready');

}


// ==========================================
// 7. MUSIC BUTTON FUNCTION
// ==========================================

musicButton?.addEventListener('click', async () => {
  if (!bgm) return;
  if (musicOn) {
    bgm.pause(); musicOn = false; saveMusicState(); updateMusicButton();
  } else {
    bgm.volume = .35;
    try { await bgm.play(); musicOn = true; saveMusicState(); }
    catch (_) { musicOn = false; musicButton.title = 'Click to enable music, and check assets/audio/bgm.mp3'; }
    updateMusicButton();
  }
});

// Resume position and preference on every HTML page.
if (bgm) {
  const previous = readMusicState();
  bgm.volume = .35;
  if (Number.isFinite(previous.time) && previous.time > 0) {
    const restore = () => {
      const elapsed = previous.enabled ? Math.min(8, Math.max(0, (Date.now() - (previous.updated || Date.now())) / 1000)) : 0;
      const target = previous.time + elapsed;
      try { bgm.currentTime = Number.isFinite(bgm.duration) && bgm.duration > 0 ? target % bgm.duration : target; } catch (_) {}
    };
    bgm.addEventListener('loadedmetadata', restore, {once:true});
    if (bgm.readyState >= 1) restore();
  }
  if (previous.enabled) {
    musicOn = true;
    updateMusicButton();
    bgm.play().catch(() => {
      // Autoplay may be blocked after navigation; a click resumes playback.
      musicOn = false;
      updateMusicButton();
      const resume = async () => {
        if (!readMusicState().enabled) return;
        try { await bgm.play(); musicOn = true; updateMusicButton(); } catch (_) {}
      };
      document.addEventListener('pointerdown', resume, {once:true});
      document.addEventListener('keydown', resume, {once:true});
    });
  }
  bgm.addEventListener('timeupdate', () => {
    if (musicOn && Math.floor(bgm.currentTime) % 2 === 0) saveMusicState();
  });
  window.addEventListener('pagehide', saveMusicState);
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveMusicState(); });
}


// ==========================================
// 8. MOBILE NAVIGATION
// ==========================================

menuButton?.addEventListener('click', () => {

  const open = $('.main-nav').classList.toggle('open');

  menuButton.setAttribute(
    'aria-expanded',
    String(open)
  );

});


// ==========================================
// 9. GAME FEATURES POPUP
// ==========================================

document.querySelectorAll('[data-feature]').forEach(button => {

  button.addEventListener('click', () => {

    const item = featureData[
      Number(button.dataset.feature)
    ];

    if (!item) return;

    $('#feature-modal-title').textContent =
      item.title;

    $('#feature-modal-img').src =
      item.image;

    $('#feature-modal-img').alt =
      item.title;

    $('#feature-modal-description').textContent =
      item.description;

    openModal($('#feature-modal'));

  });

});


// ==========================================
// 10. WISHLIST BUTTON
// ==========================================

$('#wishlist-open')?.addEventListener('click', () => {

  openModal($('#wishlist-modal'));

});


// ==========================================
// 11. WATCH TRAILER BUTTON
// ==========================================

$('#trailer-open')?.addEventListener('click', () => {

  openModal($('#trailer-modal'));

  if (musicOn && bgm) {

    bgm.pause();

  }

});


// ==========================================
// 12. CLOSE POPUP BUTTONS
// ==========================================

document.querySelectorAll('[data-close]').forEach(el => {

  el.addEventListener('click', () => {

    const modal = el.closest('.modal');

    closeModal(modal);

    if (
      modal.id === 'trailer-modal' &&
      musicOn &&
      bgm
    ) {

      bgm.play().catch(() => {});

    }

  });

});


// ==========================================
// 13. ESC KEY TO CLOSE POPUP
// ==========================================

document.addEventListener('keydown', e => {

  if (e.key === 'Escape') {

    document.querySelectorAll(
      '.modal:not([hidden])'
    ).forEach(closeModal);

  }

});


// ==========================================
// 14. BACKGROUND MUSIC END
// ==========================================

bgm?.addEventListener('ended', () => {

  musicOn = false;

  updateMusicButton();

});


// ==========================================
// 15. BUTTON HOVER / CLICK EFFECTS
// ==========================================

document.querySelectorAll('a, button').forEach(el => {

  el.addEventListener('mouseenter', () => {

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) playEffect(hoverSound, 0.18);

  });

  el.addEventListener('click', () => {

    playEffect(clickSound, 0.35);

  });

});


// ==========================================
// INITIALIZE MUSIC BUTTON
// ==========================================

updateMusicButton();


// ===== CHARACTERS PAGE (only runs when lineup exists) =====
(() => {
if (!document.querySelector('#lineup-screen')) return;
'use strict';
// EDIT CHARACTER INFORMATION AND IMAGE FILENAMES HERE.
// All images: PNG | sounds: MP3.
const characters = {
  sora: {name:'SORA AMAGI',title:'The Wandering Swordsman',age:'19',className:'Swordsman',weapon:'Raikou (Sword)',story:'A young swordsman haunted by fragments of a forgotten past. Sora embarks on a journey across Aetheria to uncover the truth behind the mysterious Astral Core. Despite the uncertainties ahead, his courage and determination inspire those who fight alongside him.',stats:{HP:70,ATK:65,DEF:50,SPD:90}},
  katsuragi: {name:'KATSURAGI AKABANE',title:'The Granite Guardian',age:'21',className:'Guardian',weapon:'Cragshield',story:'A disciplined warrior who once served as a royal guardian. After failing to protect someone important to him, Katsuragi abandoned his former title and began wandering the kingdom. Determined to redeem his past, he now dedicates his strength to protecting his companions at any cost.',stats:{HP:75,ATK:55,DEF:90,SPD:55}},
  eiko: {name:'EIKO HANAMORI',title:'The Arcane Scholar',age:'19',className:'Mage',weapon:'Ursalunar (Staff)',story:"A talented young mage fascinated by ancient magic and forgotten knowledge. Eiko has spent years studying mysterious relics in search of answers about Aetheria's lost history. Her research eventually leads her to the Astral Core, drawing her into a journey that could change the fate of the world.",stats:{HP:55,ATK:85,DEF:40,SPD:70}},
  rin: {name:'RIN TSUKISHIRO',title:'The Moonlit Healer',age:'18',className:'Healer',weapon:'Sacred Grimore',story:'A gentle healer gifted with the ability to channel sacred light. Rin carries memories of an ancient civilization that she cannot fully understand. As she travels with her companions, she begins to discover a mysterious connection between her forgotten memories and the Astral Core.',stats:{HP:90,ATK:60,DEF:85,SPD:65}}
};
const charFind = selector => document.querySelector(selector);
const charFindAll = selector => [...document.querySelectorAll(selector)];
const imagePath = (key,suffix) => `assets/images/${key}-${suffix}.png`;
function highlight(key){
  charFindAll('.character-choice').forEach(btn=>btn.classList.toggle('selected',btn.dataset.character===key));
  charFindAll('[data-bust]').forEach(img=>img.classList.toggle('highlight',img.dataset.bust===key));
}
function setImage(id,path,alt){const img=charFind(id);img.src=path;img.alt=alt;}
function showBio(key){
  const c=characters[key];if(!c)return;
  charFind('#bio-name').textContent=c.name;charFind('#bio-title').textContent=c.title;
  charFind('#bio-age').textContent=c.age;charFind('#bio-class').textContent=c.className;
  charFind('#bio-weapon').textContent=c.weapon;charFind('#bio-story').textContent=c.story;
  setImage('#splash-art',imagePath(key,'splash-art'),`${c.name} splash art`);
  setImage('#full-body',imagePath(key,'full-body'),`${c.name} full body`);
  setImage('#chibi-icon',imagePath(key,'chibi'),`${c.name} chibi icon`);
  for(const side of ['left','front','right','back'])setImage(`#turn-${side}`,imagePath(key,`turn-${side}`),`${c.name} ${side} view`);
  charFind('#bio-stats').innerHTML=Object.entries(c.stats).map(([stat,value])=>`<div class="stat-row"><span>${stat}</span><div class="stat-track"><div class="stat-fill" data-width="${value}"></div></div><span>${value}</span></div>`).join('');
}
let transitioning=false;
function transitionTo(target,key){
  if(transitioning)return;transitioning=true;
  const overlay=charFind('#panel-transition');overlay.classList.remove('play');void overlay.offsetWidth;overlay.classList.add('play');
  // Switch while panels cover the viewport.
  setTimeout(()=>{
    if(target==='bio'){showBio(key);charFind('#lineup-screen').hidden=true;charFind('#bio-screen').hidden=false;}
    else{charFind('#bio-screen').hidden=true;charFind('#lineup-screen').hidden=false;}
    const heading=target==='bio'?charFind('#bio-screen'):charFind('#lineup-screen');
    heading.scrollIntoView({behavior:'auto',block:'start'});
    requestAnimationFrame(()=>charFindAll('.stat-fill').forEach(bar=>bar.style.width=bar.dataset.width+'%'));
  },530);
  setTimeout(()=>{overlay.classList.remove('play');transitioning=false;},1450);
}
charFindAll('.character-choice').forEach(btn=>{
  btn.addEventListener('mouseenter',()=>highlight(btn.dataset.character));
  btn.addEventListener('focus',()=>highlight(btn.dataset.character));
  btn.addEventListener('click',()=>transitionTo('bio',btn.dataset.character));
});
charFind('#back-button').addEventListener('click',()=>transitionTo('lineup'));
showBio('sora');
highlight('sora');

})();


// ========================================================
// GALLERY - TWO INDEPENDENT 3D CAROUSELS
// Drag left/right, mouse wheel, touch swipe, arrow keys.
// Image files: assets/images/visual-01.png ... visual-08.png
//              assets/images/gameplay-01.png ... gameplay-08.png
// Missing PNGs show colored placeholder cards instead.
// ========================================================
(() => {
  const carousels = document.querySelectorAll('[data-gallery-carousel]');
  if (!carousels.length) return;

  const colors = ['#00ed55','#7714ed','#a713ed','#ff7616','#ffc600','#14f063','#0bc5f5','#a6f000','#f62818','#14ecb0','#c90cff','#f4f900'];
  const lightbox = document.querySelector('#gallery-lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  const lightboxCaption = lightbox?.querySelector('p');
  const closeLightbox = () => { if (lightbox) lightbox.hidden = true; document.body.classList.remove('modal-open'); };
  lightbox?.querySelector('.gallery-lightbox-close')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox(); });

  carousels.forEach((carousel, carouselIndex) => {
    const type = carousel.dataset.galleryCarousel;
    const ring = carousel.querySelector('[data-gallery-ring]');
    const count = 8;
    let angle = carouselIndex === 0 ? 0 : -12;
    let velocity = 0;
    let dragging = false;
    let lastX = 0;
    let lastTime = 0;
    let dragDistance = 0;
    let frame = 0;
    let radius = 470;

    function resize() {
      const cardWidth = window.innerWidth <= 720 ? 130 : Math.min(260, Math.max(145, window.innerWidth * .19));
      radius = Math.max(cardWidth * 1.35, Math.min(carousel.clientWidth * .30, 490));
      ring.style.setProperty('--ring-radius', radius + 'px');
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    for (let i = 0; i < count; i++) {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.style.setProperty('--card-angle', `${i * 360 / count}deg`);
      card.style.setProperty('--tile-color', colors[(i + carouselIndex * 2) % colors.length]);
      card.style.setProperty('--tile-tilt', `${i * 21}deg`);
      const fallback = document.createElement('span');
      fallback.className = 'gallery-tile-art';
      const img = document.createElement('img');
      img.alt = `${type === 'visual' ? 'Game Visual' : 'Gameplay'} ${i + 1}`;
      img.draggable = false;
      img.hidden = true;
      img.addEventListener('load', () => { img.hidden = false; });
      img.addEventListener('error', () => { img.hidden = true; });
      img.src = `assets/images/${type}-${String(i + 1).padStart(2, '0')}.png`;
      card.append(fallback, img);
      card.addEventListener('click', () => {
        if (dragDistance > 7 || img.hidden || !lightbox) return;
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;
        lightboxCaption.textContent = img.alt;
        lightbox.hidden = false;
        document.body.classList.add('modal-open');
      });
      ring.append(card);
    }

    const render = () => ring.style.setProperty('--gallery-angle', angle + 'deg');
    render();
    function coast() {
      frame = 0;
      if (dragging || Math.abs(velocity) < .025) return;
      angle += velocity;
      velocity *= .91;
      render();
      frame = requestAnimationFrame(coast);
    }
    function beginCoast() { if (!frame) frame = requestAnimationFrame(coast); }
    carousel.addEventListener('pointerdown', event => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      dragging = true;
      velocity = 0;
      dragDistance = 0;
      lastX = event.clientX;
      lastTime = performance.now();
      cancelAnimationFrame(frame); frame = 0;
      carousel.setPointerCapture(event.pointerId);
    });
    carousel.addEventListener('pointermove', event => {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      const now = performance.now();
      const dt = Math.max(8, now - lastTime);
      dragDistance += Math.abs(dx);
      angle += dx * .24;
      velocity = Math.max(-3.5, Math.min(3.5, dx * .24 * 16 / dt));
      lastX = event.clientX;
      lastTime = now;
      render();
    });
    const endDrag = () => { if (!dragging) return; dragging = false; beginCoast(); };
    carousel.addEventListener('pointerup', endDrag);
    carousel.addEventListener('pointercancel', endDrag);
    carousel.addEventListener('lostpointercapture', endDrag);
    carousel.addEventListener('wheel', event => {
      if (Math.abs(event.deltaY) < 1 && Math.abs(event.deltaX) < 1) return;
      event.preventDefault();
      angle += Math.max(-35, Math.min(35, (event.deltaX || event.deltaY) * .12));
      velocity = 0;
      render();
    }, { passive: false });
    carousel.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      angle += event.key === 'ArrowLeft' ? -15 : 15;
      velocity = 0;
      render();
    });
  });
})();

// ===== CONTACT PAGE: DOWNLOAD STATUS AND FEEDBACK PREPARATION =====
(() => {
  'use strict';
  const downloadButton = document.getElementById('contact-download-demo');
  if (!downloadButton) return;
  const installButton = document.getElementById('contact-install-now');
  const downloadStatus = document.getElementById('contact-download-status');
  const demoFile = 'assets/downloads/taddle-legacy-demo.zip';

  // No game build was supplied. Do not trigger a fake download or a 404.
  // Once a demo is ready, place it at demoFile and change demoReady to true.
  const demoReady = false;
  downloadButton.addEventListener('click', () => {
    if (!demoReady) {
      downloadStatus.textContent = 'Demo coming soon. Upload the demo ZIP and enable the download in script.js when ready.';
      return;
    }
    const link = document.createElement('a');
    link.href = demoFile;
    link.download = 'taddle-legacy-demo.zip';
    document.body.append(link);
    link.click();
    link.remove();
    downloadStatus.textContent = 'Your demo download should begin shortly.';
  });
  installButton?.addEventListener('click', () => {
    downloadStatus.textContent = demoReady
      ? 'Download the demo ZIP, extract it, then follow the installation instructions included with the game build.'
      : 'Installation is not available yet. The demo build and installation instructions are coming soon.';
  });

  const form = document.getElementById('contact-feedback-form');
  const result = document.getElementById('contact-feedback-result');
  const output = document.getElementById('contact-feedback-output');
  const status = document.getElementById('contact-feedback-status');
  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    output.value = `TADDLE LEGACY — FEEDBACK\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nSubject: ${data.get('subject')}\n\n${data.get('message')}`;
    result.hidden = false;
    status.textContent = 'Your feedback is prepared below. Copy it and send it through your preferred email or messaging app.';
    result.scrollIntoView({behavior:'smooth',block:'nearest'});
  });
  document.getElementById('contact-copy-feedback')?.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(output.value);
      status.textContent = 'Feedback copied. Paste it into your email or messaging app to send.';
    } catch (_) {
      output.focus();
      output.select();
      status.textContent = 'Select and copy the prepared text (Ctrl+C), then send it through your preferred app.';
    }
  });
})();


/* Gallery trailer iframe is maintained directly in gallery.html. */
