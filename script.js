(() => {
  const cards = [...document.querySelectorAll('.card')];
  const filterBtns = [...document.querySelectorAll('.filter')];
  const status = document.getElementById('status');

  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCaption = document.getElementById('lb-caption');
  const lbCount = document.getElementById('lb-count');
  const btnClose = lightbox.querySelector('.lb-close');
  const btnPrev = lightbox.querySelector('.lb-prev');
  const btnNext = lightbox.querySelector('.lb-next');

  let current = 0;        
  let opener = null;      

 
  const visibleCards = () =>
    cards.filter(c => !c.hidden && !c.classList.contains('is-out'));

  const labelFor = card => card.querySelector('img').alt;


  cards.forEach(card => {
    const img = card.querySelector('img');
    const markMissing = () => card.classList.add('missing');
    img.addEventListener('error', markMissing);
    if (img.complete && img.naturalWidth === 0) markMissing();
  });

  
  function updateCounts() {
    filterBtns.forEach(btn => {
      const cat = btn.dataset.filter;
      const n = cat === 'all'
        ? cards.length
        : cards.filter(c => c.dataset.category === cat).length;
      btn.querySelector('.count').textContent = n;
    });
  }

  function applyFilter(cat) {
    let shown = 0;
    cards.forEach(card => {
      const match = cat === 'all' || card.dataset.category === cat;
      if (match) {
        shown++;
        card.hidden = false;
        
        requestAnimationFrame(() => card.classList.remove('is-out'));
      } else {
        card.classList.add('is-out');
        setTimeout(() => {
          if (card.classList.contains('is-out')) card.hidden = true;
        }, 300);
      }
    });
    status.textContent = `Showing ${shown} ${shown === 1 ? 'photo' : 'photos'}` +
      (cat === 'all' ? '' : ` in ${cat}`);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.toggle('is-active', b === btn));
      applyFilter(btn.dataset.filter);
    });
  });

 
  function show(index, animate = true) {
    const list = visibleCards();
    if (!list.length) return;
    current = (index + list.length) % list.length;   

    const card = list[current];
    const img = card.querySelector('img');

    const update = () => {
      lbImg.src = img.getAttribute('src');
      lbImg.alt = img.alt;
      lbCaption.textContent = labelFor(card);
      lbCount.textContent = `${current + 1} / ${list.length}`;
      lbImg.classList.remove('swap');
    };

    if (animate) {
      lbImg.classList.add('swap');
      setTimeout(update, 200);
    } else {
      update();
    }

    
    [list[(current + 1) % list.length], list[(current - 1 + list.length) % list.length]]
      .forEach(c => { new Image().src = c.querySelector('img').getAttribute('src'); });
  }

  function openLightbox(card) {
    opener = card;
    lightbox.hidden = false;
    show(visibleCards().indexOf(card), false);
    requestAnimationFrame(() => lightbox.classList.add('open'));
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lightbox.hidden = true; }, 300);
    if (opener) opener.focus();
  }

  const next = () => show(current + 1);
  const prev = () => show(current - 1);

  cards.forEach(card => card.addEventListener('click', () => openLightbox(card)));
  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);
  btnClose.addEventListener('click', closeLightbox);

  
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  
  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'Tab') {
      
      const items = [btnClose, btnPrev, btnNext];
      const i = items.indexOf(document.activeElement);
      e.preventDefault();
      items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
    }
  });

  
  let startX = 0;
  lightbox.addEventListener('touchstart', e => { startX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
  });

  
  updateCounts();
  applyFilter('all');
})();
