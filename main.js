/* Qaytu Amigurumi — interacciones (IIFE, sin módulos) */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  // Red de seguridad: la portada arranca sí o sí aunque algo falle
  function markReady() { root.classList.add('is-ready'); }
  setTimeout(markReady, 3200);

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn('[qaytu] ' + name + ' falló:', e); }
  }

  function initNav() {
    var nav = document.querySelector('.nav');
    var burger = document.querySelector('.nav__burger');
    var menu = document.getElementById('mobile-menu');
    var fab = document.querySelector('.fab');

    function onScroll() {
      var y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 10);
      if (fab) fab.classList.toggle('is-visible', y > 500);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function setMenu(open) {
      burger.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
    }
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // Escalonar elementos hermanos (tarjetas, pasos)
        var sibs = Array.prototype.filter.call(entry.target.parentNode.children, function (c) { return c.classList.contains('reveal'); });
        var i = Math.max(sibs.indexOf(entry.target), 0) % 4;
        entry.target.style.transitionDelay = (i * 0.09) + 's';
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });

    // Red de seguridad: nada queda oculto después de 6 s
    setTimeout(function () {
      items.forEach(function (el) { el.classList.add('is-in'); });
    }, 6000);
  }

  function initFilters() {
    var chips = document.querySelectorAll('.chip');
    var tiles = document.querySelectorAll('.tile');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.dataset.filter;
        chips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-selected', String(on));
        });
        tiles.forEach(function (t) {
          var show = f === 'all' || t.dataset.cat === f;
          t.classList.toggle('is-hidden', !show);
          t.classList.remove('is-entering');
          if (show) { void t.offsetWidth; t.classList.add('is-entering'); }
        });
      });
    });
    // Botones externos que activan un filtro (p. ej. el aviso navideño)
    document.querySelectorAll('[data-show]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var chip = document.querySelector('.chip[data-filter="' + btn.dataset.show + '"]');
        if (chip) chip.click();
        document.getElementById('gallery').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function initLightbox() {
    var box = document.getElementById('lightbox');
    var img = box.querySelector('img');
    var cap = box.querySelector('figcaption');
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile'));
    var current = 0;
    var lastFocus = null;

    function visible() { return tiles.filter(function (t) { return !t.classList.contains('is-hidden'); }); }

    function show(tile) {
      var t = tile.querySelector('img');
      img.src = t.src;
      img.alt = t.alt;
      cap.textContent = tile.querySelector('span').textContent;
    }
    function open(tile) {
      lastFocus = document.activeElement;
      current = visible().indexOf(tile);
      show(tile);
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      box.querySelector('.lightbox__close').focus();
    }
    function close() {
      box.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    function step(d) {
      var list = visible();
      current = (current + d + list.length) % list.length;
      show(list[current]);
    }

    tiles.forEach(function (t) { t.addEventListener('click', function () { open(t); }); });
    box.querySelector('.lightbox__close').addEventListener('click', close);
    box.querySelector('.lightbox__prev').addEventListener('click', function () { step(-1); });
    box.querySelector('.lightbox__next').addEventListener('click', function () { step(1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });
  }

  // Arrastrar con el mouse el carril de nacimientos
  function initRail() {
    var rail = document.querySelector('.nativity__rail');
    if (!rail) return;
    var down = false, startX = 0, startScroll = 0;
    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; startX = e.clientX; startScroll = rail.scrollLeft;
      rail.style.scrollSnapType = 'none';
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      rail.scrollLeft = startScroll - (e.clientX - startX);
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      rail.style.scrollSnapType = '';
    });
  }

  // Ligera inclinación de las polaroids del hero siguiendo el mouse
  function initTilt() {
    var collage = document.querySelector('.hero__collage');
    if (!collage || window.matchMedia('(hover: none)').matches) return;
    collage.addEventListener('mousemove', function (e) {
      var r = collage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      collage.style.transform = 'perspective(900px) rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 6) + 'deg)';
    });
    collage.addEventListener('mouseleave', function () { collage.style.transform = ''; });
    collage.style.transition = 'transform .4s ease-out';
  }

  // Bienvenida: se muestra una vez por visita y luego libera la portada
  function initSplash() {
    var splash = document.querySelector('.splash');
    if (!splash) return markReady();
    var seen = false;
    try { seen = sessionStorage.getItem('qaytu-splash') === '1'; sessionStorage.setItem('qaytu-splash', '1'); } catch (e) {}
    if (seen) { splash.remove(); return markReady(); }
    var start = Date.now();
    function hide() {
      var wait = Math.max(0, 1700 - (Date.now() - start));
      setTimeout(function () {
        splash.classList.add('is-done');
        setTimeout(markReady, 250);
        setTimeout(function () { splash.remove(); }, 900);
      }, wait);
    }
    if (document.readyState === 'complete') hide();
    else window.addEventListener('load', hide);
  }

  // Divide los títulos h2 en palabras que suben una por una
  function initSplitHeadings() {
    document.querySelectorAll('.reveal h2').forEach(function (h) {
      var n = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            var frag = document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var w = document.createElement('span');
              w.className = 'w';
              var inner = document.createElement('span');
              inner.textContent = part;
              inner.style.setProperty('--i', n++);
              w.appendChild(inner);
              frag.appendChild(w);
            });
            node.replaceChild(frag, child);
          } else if (child.nodeType === 1) {
            walk(child);
          }
        });
      })(h);
    });
  }

  // Las fotos de la galería y la imagen de la historia entran al hacer scroll
  function initGalleryReveal() {
    document.querySelectorAll('.tile, .story__media').forEach(function (t) { t.classList.add('reveal'); });
  }

  // Elementos que solo necesitan saber cuándo aparecen (línea del proceso)
  function initInview() {
    var els = document.querySelectorAll('[data-inview]');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.05 });
    els.forEach(function (e) { io.observe(e); });
    setTimeout(function () { els.forEach(function (e) { e.classList.add('is-in'); }); }, 6000);
  }

  // Barra de progreso + parallax, en un solo ciclo de animación
  function initScrollFx() {
    // Con scroll-driven animations el CSS hace todo el trabajo; JS solo mide
    // cuánto debe recorrer el carril de nacimientos (cambia con el ancho).
    if (window.CSS && CSS.supports('animation-timeline: view()')) {
      var rail = document.querySelector('.nativity__rail');
      if (!rail) return;
      var measure = function () {
        var box = rail.offsetParent || rail.parentNode;
        var shift = Math.min(0, box.clientWidth - rail.offsetLeft - rail.offsetWidth);
        rail.style.setProperty('--rail-shift', shift + 'px');
      };
      measure();
      window.addEventListener('resize', measure);
      window.addEventListener('load', measure);
      return;
    }

    var bar = document.querySelector('.progress');
    var layers = [];
    function add(sel, speed) {
      document.querySelectorAll(sel).forEach(function (el) { layers.push({ el: el, speed: speed }); });
    }
    add('.hero__collage', -0.12);
    add('.floaters', 0.18);
    add('.occ__img img', 0.08);
    add('.story__media > img:first-child', -0.05);
    add('.nativity__rail img', 0.04);
    var logo = document.querySelector('.story__logo');
    var ticking = false;

    function update() {
      ticking = false;
      var vh = window.innerHeight;
      var max = document.documentElement.scrollHeight - vh;
      if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
      layers.forEach(function (l) {
        var r = l.el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var offset = (r.top + r.height / 2) - vh / 2;
        l.el.style.translate = '0 ' + (offset * l.speed).toFixed(1) + 'px';
      });
      if (logo) logo.style.transform = 'rotate(' + (window.scrollY * 0.08).toFixed(1) + 'deg)';
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // Cursor en forma de anillo que sigue al mouse con suavidad
  function initCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var c = document.querySelector('.cursor');
    if (!c) return;
    var x = -100, y = -100, cx = -100, cy = -100;
    window.addEventListener('mousemove', function (e) {
      x = e.clientX; y = e.clientY;
      c.classList.add('is-on');
      var t = e.target.closest && e.target.closest('a, button, .tile, .nativity__rail');
      c.classList.toggle('is-hover', !!t);
    });
    document.addEventListener('mouseleave', function () { c.classList.remove('is-on'); });
    (function loop() {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      c.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)';
      requestAnimationFrame(loop);
    })();
  }

  // Botones "magnéticos": se acercan un poco al mouse
  function initMagnetic() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    document.querySelectorAll('.btn, .fab').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        b.style.translate = (dx * 0.18).toFixed(1) + 'px ' + (dy * 0.25).toFixed(1) + 'px';
      });
      b.addEventListener('mouseleave', function () { b.style.translate = ''; });
    });
  }

  // Inclinación 3D de las fotos de la galería
  function initTileTilt() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    document.querySelectorAll('.tile').forEach(function (t) {
      t.addEventListener('mousemove', function (e) {
        if (!t.classList.contains('is-in')) return;
        var r = t.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        t.classList.add('is-tilting');
        t.style.transform = 'perspective(700px) rotateY(' + (px * 10).toFixed(2) + 'deg) rotateX(' + (-py * 10).toFixed(2) + 'deg) scale(1.02)';
      });
      t.addEventListener('mouseleave', function () {
        t.classList.remove('is-tilting');
        t.style.transform = '';
      });
    });
  }

  // Corazones que salen al hacer clic en botones
  function initBurst() {
    document.addEventListener('click', function (e) {
      var target = e.target.closest('.btn, .fab, .chip, .cta__phone');
      if (!target) return;
      // Lo navideño suelta copos de nieve y estrellas en vez de corazones
      var xmas = target.matches('.chip--xmas, .btn--xmas');
      var palette = xmas ? ['#2E7D4F', '#B3261E', '#C9A24A'] : ['#B3261E', '#C9A24A'];
      for (var i = 0; i < (xmas ? 12 : 8); i++) {
        var h = document.createElement('span');
        h.className = 'burst';
        h.textContent = xmas ? (i % 3 ? '❄' : '★') : '♥';
        h.style.color = palette[i % palette.length];
        var ang = (Math.PI * 2 * i) / (xmas ? 12 : 8) + Math.random() * 0.5;
        var dist = (xmas ? 50 : 40) + Math.random() * 30;
        h.style.left = e.clientX + 'px';
        h.style.top = e.clientY + 'px';
        h.style.setProperty('--x', (Math.cos(ang) * dist).toFixed(0) + 'px');
        h.style.setProperty('--y', (Math.sin(ang) * dist).toFixed(0) + 'px');
        h.style.setProperty('--r', (Math.random() * 60 - 30).toFixed(0) + 'deg');
        document.body.appendChild(h);
        setTimeout(function (el) { el.remove(); }.bind(null, h), 950);
      }
    });
  }

  // El número de WhatsApp "salta" dígito por dígito al pasar el mouse
  function initPhone() {
    var p = document.querySelector('.cta__phone');
    if (!p || p.children.length > 0) return;
    var txt = p.textContent;
    p.textContent = '';
    p.setAttribute('aria-label', txt);
    txt.split('').forEach(function (ch, i) {
      var s = document.createElement('span');
      s.className = 'd';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i);
      s.textContent = ch === ' ' ? ' ' : ch;
      p.appendChild(s);
    });
  }

  function initYear() {
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  function boot() {
    safe(initSplash, 'bienvenida');
    safe(initNav, 'nav');
    safe(initSplitHeadings, 'títulos');
    safe(initGalleryReveal, 'galería');
    safe(initReveal, 'reveal');
    safe(initInview, 'inview');
    safe(initScrollFx, 'scroll');
    safe(initCursor, 'cursor');
    safe(initMagnetic, 'magnético');
    safe(initTileTilt, 'tilt galería');
    safe(initBurst, 'corazones');
    safe(initPhone, 'teléfono');
    safe(initFilters, 'filtros');
    safe(initLightbox, 'lightbox');
    safe(initRail, 'carril');
    safe(initTilt, 'tilt');
    safe(initYear, 'año');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
