// Centro Casa — menu, orari, lightbox e scroll animato (GSAP + ScrollTrigger + Lenis).
const root = document.documentElement;

// Menu mobile
const burger = document.querySelector('.burger');
const nav = document.getElementById('nav');
if (burger && nav) {
  const setMenu = open => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    nav.classList.toggle('open', open);
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
}

document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

// Aperto / chiuso adesso (orari dalla storia Instagram "Orari")
const HOURS = { 0: [], 1: [[16, 0, 20, 0]], 2: [[9, 0, 12, 30], [16, 0, 20, 0]], 3: [[9, 0, 12, 30], [16, 0, 20, 0]], 4: [[9, 0, 12, 30], [16, 0, 20, 0]], 5: [[9, 0, 12, 30], [16, 0, 20, 0]], 6: [[9, 0, 12, 30], [16, 0, 20, 0]] };
(function openStatus() {
  const now = new Date();
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const pad = n => String(n).padStart(2, '0');
  const hhmm = m => `${pad(m / 60 | 0)}:${pad(m % 60)}`;
  const slots = HOURS[day].map(([h1, m1, h2, m2]) => [h1 * 60 + m1, h2 * 60 + m2]);
  const open = slots.find(([a, b]) => mins >= a && mins < b);
  const next = slots.find(([a]) => mins < a);
  let text;
  if (open) text = `Aperto ora · chiude alle ${hhmm(open[1])}`;
  else if (next) text = `Chiuso ora · riapre alle ${hhmm(next[0])}`;
  else if (day === 6 || day === 0) text = 'Chiuso ora · domenica su appuntamento';
  else text = 'Chiuso ora · riapre domani';
  document.querySelectorAll('[data-open-status]').forEach(el => {
    el.textContent = text;
    el.classList.toggle('is-open', Boolean(open));
  });
  document.querySelectorAll('.hours tr[data-days]').forEach(tr => {
    tr.classList.toggle('today', tr.dataset.days.split(',').includes(String(day)));
  });
})();

// Lightbox (pagina categorie)
const dialog = document.querySelector('.lightbox');
if (dialog) {
  const big = dialog.querySelector('img');
  const cap = dialog.querySelector('figcaption');
  document.querySelectorAll('[data-zoom]').forEach(btn => btn.addEventListener('click', () => {
    const img = btn.querySelector('img');
    big.src = btn.dataset.zoom;
    big.alt = img.alt;
    cap.textContent = img.alt;
    dialog.showModal();
  }));
  dialog.addEventListener('click', e => { if (e.target === dialog || e.target.closest('.lb-close')) dialog.close(); });
}

// ---- Animazioni di scroll ----
const { gsap, ScrollTrigger, Lenis } = window;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduce && gsap && ScrollTrigger) {
  root.classList.add('motion');
  gsap.registerPlugin(ScrollTrigger);

  let lenis;
  if (Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  // Ancore: con Lenis e con le sezioni bloccate serve lo scroll calcolato da ScrollTrigger
  const head = () => document.querySelector('.header')?.offsetHeight || 0;
  const goTo = (id, smooth = true) => {
    const target = id.length > 1 && document.querySelector(id);
    if (!target) return false;
    const pinned = ScrollTrigger.getAll().find(st => st.pin === target);
    const y = pinned ? pinned.start : (target.dataset.staticTop ? Number(target.dataset.staticTop) : target.getBoundingClientRect().top + scrollY - head());
    if (lenis && smooth) lenis.scrollTo(y);
    else scrollTo({ top: y, behavior: smooth ? 'smooth' : 'instant' });
    return true;
  };
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!goTo(id)) return;
    e.preventDefault();
    history.replaceState(null, '', id);
  }));

  // Divide un titolo in parole mascherate, senza toccare <em> e <br>
  const split = el => {
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const w = document.createElement('span'); w.className = 'w';
          const i = document.createElement('span'); i.textContent = part;
          w.append(i); frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(el);
    return el.querySelectorAll('.w > span');
  };

  const mm = gsap.matchMedia();
  mm.add({ desk: '(min-width: 901px)', mob: '(max-width: 900px)' }, ctx => {
    const { desk } = ctx.conditions;

    // Apertura: la foto dello showroom si allarga da card a tutto schermo
    const opener = document.querySelector('.opener');
    if (opener) {
      gsap.timeline({ scrollTrigger: { trigger: opener, start: 'top top', end: '+=110%', pin: true, scrub: 0.6, refreshPriority: 1 } })
        .fromTo('.opener-frame', { clipPath: desk ? 'inset(4% 24% 10% 24%)' : 'inset(6% 6% 14% 6%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' })
        .fromTo('.opener-frame img', { scale: 1.3 }, { scale: 1, ease: 'none' }, 0)
        .fromTo('.opener-cap', { opacity: 0, y: 50 }, { opacity: 1, y: 0, ease: 'none', duration: 0.4 }, 0.6);
    }

    // Galleria a cascata 3D (HorizonX Rotating Gallery: spin, twist diagonale, offset foto, drift, drag, tap-to-focus, pin)
    const setupCascade = (sec, pinned) => {
      const stage = sec.querySelector('.cascade-stage');
      const cards = gsap.utils.toArray('.c-card', sec);
      if (!stage || !cards.length) return () => {};
      const imgs = cards.map(c => c.querySelector('img'));
      const idxEl = sec.querySelector('[data-c-idx]');
      const capEl = sec.querySelector('[data-c-cap]');
      const linkEl = sec.querySelector('[data-c-link]');
      const N = cards.length;
      const step = desk ? 316 : 238;
      const total = N * step;
      const wrap = gsap.utils.wrap(-total / 2, total / 2);
      const wrapIdx = gsap.utils.wrap(0, N);
      let scrollPos = 0, userPos = 0, curPos = 0, focused = -1, inView = false, dragging = false, moved = false, startY = 0, startUser = 0, activeIdx = -1;

      ScrollTrigger.create({
        trigger: sec,
        start: pinned ? 'top top' : 'top bottom',
        end: pinned ? '+=240%' : 'bottom top',
        pin: pinned,
        scrub: 0.6,
        refreshPriority: 1,
        onToggle: st => { inView = st.isActive; if (!st.isActive) focused = -1; },
        onUpdate: st => {
          scrollPos = st.progress * step * (pinned ? 18 : 8);
          if (focused !== -1 && Math.abs(st.getVelocity()) > 120) focused = -1;
        }
      });

      const syncHud = idx => {
        if (idx === activeIdx) return;
        activeIdx = idx;
        const c = cards[idx];
        const img = imgs[idx];
        const cat = c.querySelector('small')?.textContent || '';
        if (idxEl) idxEl.textContent = String(idx + 1).padStart(2, '0');
        if (capEl && img) capEl.textContent = `${img.alt} · ${cat}`;
        if (linkEl) {
          linkEl.href = c.getAttribute('href');
          linkEl.innerHTML = `Vai a ${cat} <span aria-hidden="true">→</span>`;
        }
      };

      const focusCard = i => {
        focused = i;
        const diff = wrap(i * step - (scrollPos + userPos));
        userPos += diff;
      };

      const onDown = e => {
        if (e.button && e.button !== 0) return;
        dragging = true;
        moved = false;
        startY = e.clientY;
        startUser = userPos;
        stage.classList.add('is-dragging');
      };
      const onMove = e => {
        if (!dragging) return;
        const dy = e.clientY - startY;
        if (Math.abs(dy) > 6) { moved = true; focused = -1; }
        if (moved) userPos = startUser - dy * 1.35;
      };
      const onUp = () => {
        if (!dragging) return;
        dragging = false;
        stage.classList.remove('is-dragging');
      };
      stage.addEventListener('pointerdown', onDown);
      addEventListener('pointermove', onMove, { passive: true });
      addEventListener('pointerup', onUp, { passive: true });
      addEventListener('pointercancel', onUp, { passive: true });

      const clickHandlers = cards.map((card, i) => e => {
        if (moved) { e.preventDefault(); moved = false; return; }
        const d = wrap(i * step - curPos);
        if (focused !== i && Math.abs(d) > step * 0.28) {
          e.preventDefault();
          focusCard(i);
        } else if (focused !== i) {
          e.preventDefault();
          focusCard(i);
        }
      });
      cards.forEach((c, i) => c.addEventListener('click', clickHandlers[i]));

      const stepBtns = gsap.utils.toArray('[data-c-step]', sec);
      const stepHandlers = stepBtns.map(btn => () => {
        focused = -1;
        userPos += Number(btn.dataset.cStep) * step;
      });
      stepBtns.forEach((b, i) => b.addEventListener('click', stepHandlers[i]));

      const tick = (_, dt) => {
        if (inView && !dragging && focused === -1) userPos += (dt / 1000) * 24;
        const target = scrollPos + userPos;
        curPos += (target - curPos) * 0.14;
        const centerIdx = focused !== -1 ? focused : wrapIdx(Math.round(curPos / step));
        syncHud(centerIdx);

        const visRange = step * 3.2;
        const preloadRange = step * 5.5;
        for (let i = 0; i < N; i++) {
          const d = wrap(i * step - curPos);
          const absD = Math.abs(d);
          const card = cards[i];
          if (absD > visRange) {
            if (card.style.visibility !== 'hidden') card.style.visibility = 'hidden';
            if (absD < preloadRange && imgs[i]?.loading === 'lazy') imgs[i].loading = 'eager';
            continue;
          }
          if (card.style.visibility !== 'visible') card.style.visibility = 'visible';
          if (imgs[i]?.loading === 'lazy') imgs[i].loading = 'eager';

          const t = d / (step * 2.5);
          const isFoc = focused === i;
          const damp = isFoc ? 0 : (focused !== -1 ? 1.15 : 1);
          const rotY = isFoc ? 0 : t * 66;
          const rotX = isFoc ? 0 : -t * 18;
          const rotZ = isFoc ? 0 : -t * 11;
          const x = isFoc ? 0 : Math.sin(t * Math.PI * 0.75) * (desk ? 34 : 16);
          const y = isFoc ? d * 0.15 : d * 0.78;
          const z = isFoc ? 95 : -Math.abs(t) * (desk ? 155 : 95) - (focused !== -1 ? 55 : 0);
          const sc = isFoc ? 1.05 : Math.max(0.76, 1 - Math.abs(t) * 0.12);
          const op = isFoc ? 1 : (focused !== -1 ? Math.max(0.18, 0.42 - Math.abs(t) * 0.18) : Math.max(0.15, 1 - Math.pow(Math.abs(t) * 0.78, 2)));

          card.classList.toggle('is-focused', isFoc);
          card.style.zIndex = String(isFoc ? 200 : Math.round(100 - absD * 0.1));
          card.style.opacity = op.toFixed(3);
          card.style.transform = `translate3d(${x.toFixed(1)}px,${(y * damp).toFixed(1)}px,${z.toFixed(1)}px) rotateY(${rotY.toFixed(1)}deg) rotateX(${rotX.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
          if (imgs[i]) imgs[i].style.transform = `translateY(${(-t * 20).toFixed(1)}px) scale(1.14)`;
        }
      };
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        stage.removeEventListener('pointerdown', onDown);
        removeEventListener('pointermove', onMove);
        removeEventListener('pointerup', onUp);
        removeEventListener('pointercancel', onUp);
        cards.forEach((c, i) => {
          c.removeEventListener('click', clickHandlers[i]);
          c.style.cssText = '';
          c.classList.remove('is-focused');
          if (imgs[i]) imgs[i].style.transform = '';
        });
        stepBtns.forEach((b, i) => b.removeEventListener('click', stepHandlers[i]));
      };
    };

    const cleanups = [];
    if (desk) {
      // Sezioni bloccate create in ordine di pagina: ognuna deve conoscere lo spazio dei pin sopra di lei
      document.querySelectorAll('[data-hscroll], [data-cascade], .kitchen').forEach(sec => {
        if (sec.matches('[data-cascade]')) {
          cleanups.push(setupCascade(sec, true));
          return;
        }
        if (sec.matches('[data-hscroll]')) {
          // Dantora Services Rail: binario orizzontale sincronizzato allo scroll + barra avanzamento + parallasse card
          const rail = sec.querySelector('.hrail');
          const track = sec.querySelector('.hrail-track');
          const bar = sec.querySelector('.rail-bar i');
          const railImgs = gsap.utils.toArray('.card img', track);
          const dist = () => Math.max(0, track.scrollWidth - rail.clientWidth + parseFloat(getComputedStyle(rail).paddingLeft));
          gsap.to(track, {
            x: () => -dist(), ease: 'none',
            scrollTrigger: {
              trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true, refreshPriority: 1,
              onUpdate: st => {
                if (bar) gsap.set(bar, { scaleX: st.progress });
                const shift = (st.progress - 0.5) * 18;
                railImgs.forEach(img => { img.style.transform = `scale(1.08) translateX(${shift.toFixed(1)}px)`; });
              }
            }
          });
          gsap.from(track.children, { opacity: 0, x: 90, filter: 'blur(8px)', duration: 0.95, ease: 'power3.out', stagger: 0.06, scrollTrigger: { trigger: sec, start: 'top 75%' } });
          return;
        }
        // Cucine: le foto si scoprono una sopra l'altra
        const cards = gsap.utils.toArray('.kcard', sec);
        const count = sec.querySelector('.kcount');
        if (cards.length < 2) return;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sec, start: 'top top', end: () => '+=' + (cards.length - 1) * 65 + '%', pin: true, scrub: 0.6, refreshPriority: 1,
            onUpdate: st => { if (count) count.textContent = `${String(Math.round(st.progress * (cards.length - 1)) + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`; }
          }
        });
        cards.slice(1).forEach((card, i) => {
          tl.fromTo(card, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' })
            .fromTo(card.querySelector('img'), { scale: 1.25 }, { scale: 1, ease: 'none' }, '<')
            .to(cards[i], { scale: 0.92, filter: 'brightness(.7)', ease: 'none' }, '<');
        });
      });
    } else {
      // Mobile: la barra segue lo scroll orizzontale nativo; la cascata 3D gira senza bloccare la pagina
      document.querySelectorAll('[data-hscroll]').forEach(sec => {
        const rail = sec.querySelector('.hrail');
        const bar = sec.querySelector('.rail-bar i');
        if (!bar || rail.dataset.bound) return;
        rail.dataset.bound = '1';
        const upd = () => gsap.set(bar, { scaleX: rail.scrollLeft / Math.max(1, rail.scrollWidth - rail.clientWidth) });
        rail.addEventListener('scroll', upd, { passive: true });
      });
      document.querySelectorAll('[data-cascade]').forEach(sec => cleanups.push(setupCascade(sec, false)));
    }

    // Dantora StackingBlock Curtains: ogni macro-blocco resta sticky mentre il successivo gli scorre sopra a tendina
    const blocks = gsap.utils.toArray('main > section, main > .cat-sec, main > .pin-spacer > section, main > .pin-spacer > .cat-sec');
    if (blocks[0]) blocks[0].classList.add('is-first-block');
    const getWrap = sec => sec.parentElement?.classList.contains('pin-spacer') ? sec.parentElement : sec;
    const onRefreshInit = () => {
      blocks.forEach(sec => {
        const w = getWrap(sec);
        w.style.position = 'relative';
        w.style.top = '0px';
        if (w !== sec) { sec.style.position = 'relative'; sec.style.top = '0px'; }
      });
      blocks.forEach(sec => {
        const w = getWrap(sec);
        sec.dataset.staticTop = String(Math.round(w.getBoundingClientRect().top + scrollY - head()));
      });
    };
    const onRefresh = () => {
      const vh = window.innerHeight;
      blocks.forEach((sec, i) => {
        const w = getWrap(sec);
        w.style.zIndex = String(10 + i);
        sec.style.zIndex = String(10 + i);
        w.style.position = 'sticky';
        w.style.top = `${Math.min(0, vh - w.offsetHeight)}px`;
      });
    };
    ScrollTrigger.addEventListener('refreshInit', onRefreshInit);
    ScrollTrigger.addEventListener('refresh', onRefresh);
    cleanups.push(() => {
      ScrollTrigger.removeEventListener('refreshInit', onRefreshInit);
      ScrollTrigger.removeEventListener('refresh', onRefresh);
    });

    blocks.forEach((sec, i) => {
      if (i > 0) {
        const prev = blocks[i - 1];
        const isPinned = prev.parentElement?.classList.contains('pin-spacer');
        const innerTarget = prev.matches('.opener')
          ? prev.querySelector('.opener-frame')
          : (isPinned ? Array.from(prev.children) : prev);
        const st = { trigger: sec, start: 'top bottom', end: 'top top', scrub: true };
        gsap.fromTo(prev, { filter: 'brightness(1)' }, { filter: 'brightness(0.86)', ease: 'none', scrollTrigger: st });
        if (innerTarget) {
          gsap.fromTo(innerTarget,
            { scale: 1, y: 0 },
            { scale: 0.95, y: -25, transformOrigin: '50% 0%', ease: 'none', scrollTrigger: { ...st } }
          );
        }
      }
    });

    // Se il layout cambia (desktop <-> mobile) i pin vengono ricreati: vanno ricalcolati prima degli altri trigger
    ScrollTrigger.sort();
    onRefresh();
    return () => cleanups.forEach(fn => fn());
  });

  // Dantora Word Blur-Scrub: titoli e testi che si mettono a fuoco parola per parola con lo scroll
  document.querySelectorAll('[data-split]').forEach(el => {
    const words = split(el);
    const hero = el.dataset.split === 'hero';
    if (hero) {
      gsap.fromTo(words,
        { yPercent: 75, opacity: 0, filter: 'blur(10px)' },
        { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.05, ease: 'power3.out', stagger: 0.055, delay: 0.08 }
      );
    } else {
      gsap.fromTo(words,
        { yPercent: 28, opacity: 0.14, filter: 'blur(8px)' },
        {
          yPercent: 0, opacity: 1, filter: 'blur(0px)', ease: 'power2.out', stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 46%', scrub: 0.5 }
        }
      );
    }
  });

  // Paragrafi lead e citazioni: messa a fuoco progressiva parola per parola stile Dantora
  document.querySelectorAll('.lead:not([data-fade]), .quote').forEach(el => {
    const words = split(el);
    if (!words.length) return;
    gsap.fromTo(words,
      { opacity: 0.22, filter: 'blur(5px)', y: 8 },
      {
        opacity: 1, filter: 'blur(0px)', y: 0, ease: 'none', stagger: 0.03,
        scrollTrigger: { trigger: el, start: 'top 90%', end: 'bottom 62%', scrub: 0.5 }
      }
    );
  });

  gsap.from('[data-fade]', { y: 24, opacity: 0, filter: 'blur(6px)', duration: 0.95, ease: 'power3.out', stagger: 0.1, delay: 0.35 });

  // Offerta: la tendina verde scuro sale sopra la galleria e il prezzo conta
  const offer = document.querySelector('.offer');
  if (offer) {
    gsap.from('.offer-list li', { x: 60, opacity: 0, filter: 'blur(6px)', duration: 0.85, ease: 'power3.out', stagger: 0.09, scrollTrigger: { trigger: '.offer-list', start: 'top 82%' } });
  }
  document.querySelectorAll('[data-count]').forEach(el => {
    const end = Number(el.dataset.count);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end, duration: 1.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
      onUpdate: () => { el.textContent = String(Math.round(obj.v)).replace(/\B(?=(\d{3})+$)/g, '.'); }
    });
  });

  // Stanze: la foto si scopre e la piccola sale in parallax
  gsap.utils.toArray('.room').forEach(room => {
    const main = room.querySelector('.room-main');
    const float = room.querySelector('.room-float');
    gsap.fromTo(main, { clipPath: 'inset(14% 14% 14% 14% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', ease: 'none', scrollTrigger: { trigger: room, start: 'top 85%', end: 'center 55%', scrub: true } });
    gsap.fromTo(main.querySelector('img'), { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: room, start: 'top bottom', end: 'bottom top', scrub: true } });
    if (float) gsap.fromTo(float, { yPercent: 40 }, { yPercent: -25, ease: 'none', scrollTrigger: { trigger: room, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from(room.querySelectorAll('.tags li, .room-copy .actions'), { y: 26, opacity: 0, filter: 'blur(5px)', duration: 0.85, ease: 'power3.out', stagger: 0.06, scrollTrigger: { trigger: room, start: 'top 68%' } });
  });

  // Showroom: parallax a più livelli
  const sr = document.querySelector('.showroom');
  if (sr) {
    const st = { trigger: sr, start: 'top bottom', end: 'bottom top', scrub: true };
    gsap.fromTo('.sr-bg img', { scale: 1.25, yPercent: -6 }, { scale: 1, yPercent: 6, ease: 'none', scrollTrigger: st });
    gsap.fromTo('.sr-c1', { y: 220 }, { y: -160, ease: 'none', scrollTrigger: { ...st } });
    gsap.fromTo('.sr-c2', { y: 360 }, { y: -60, ease: 'none', scrollTrigger: { ...st } });
  }

  // Chi siamo + perks + FAQ
  const about = document.querySelector('.about-photo');
  if (about) {
    gsap.fromTo(about, { clipPath: 'inset(100% 0% 0% 0% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.4, ease: 'power3.inOut', scrollTrigger: { trigger: about, start: 'top 75%' } });
  }
  gsap.utils.toArray('.perks li, .services li, .faq details, .hub .card').forEach((li, i) => {
    gsap.from(li, { y: 30, opacity: 0, filter: 'blur(6px)', duration: 0.8, ease: 'power3.out', delay: (i % 3) * 0.06, scrollTrigger: { trigger: li, start: 'top 90%' } });
  });

  // Recensioni: la card sotto si rimpicciolisce quando arriva la successiva
  const revs = gsap.utils.toArray('.rev');
  revs.slice(0, -1).forEach((card, i) => {
    gsap.to(card, { scale: 0.94, opacity: 0.55, filter: 'blur(2px)', ease: 'none', scrollTrigger: { trigger: revs[i + 1], start: 'top 85%', end: 'top 30%', scrub: true } });
  });

  // Pagina categorie: comparsa morbida con messa a fuoco Dantora
  gsap.utils.toArray('[data-reveal]').forEach(el => {
    gsap.from(el, { y: 44, opacity: 0, filter: 'blur(7px)', duration: 0.95, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
  gsap.utils.toArray('.gal').forEach(g => {
    gsap.from(g.children, { y: 48, opacity: 0, filter: 'blur(7px)', duration: 0.85, ease: 'power3.out', stagger: 0.045, scrollTrigger: { trigger: g, start: 'top 85%' } });
  });

  // Arrivo da un'altra pagina con #ancora: ricalcola dopo i pin
  addEventListener('load', () => { ScrollTrigger.refresh(); if (location.hash) requestAnimationFrame(() => goTo(location.hash, false)); });
}
