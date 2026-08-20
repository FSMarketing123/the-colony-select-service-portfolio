/* ===========================================================================
   The Colony Select-Service Portfolio — interactions
   =========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- sticky top bar + active section ---------------------------------- */
  var topbar = document.querySelector('.topbar');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.topnav a'));

  function onScroll() {
    if (topbar) topbar.classList.toggle('is-solid', window.scrollY > window.innerHeight * 0.72);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (navLinks.length && 'IntersectionObserver' in window) {
    var targets = navLinks
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(function (t) { spy.observe(t); });
  }

  /* --- soft hero parallax ------------------------------------------------ */
  // .hero__bg is 126% tall with -13% offset, so it can drift 13% of the hero
  // height either way without an edge ever showing. FACTOR stays under that.
  var heroBg = document.querySelector('.hero__bg');
  var heroEl = document.querySelector('.hero');
  if (heroBg && heroEl && !reduce) {
    var FACTOR = 0.12;
    var parallaxQueued = false;

    function paintParallax() {
      parallaxQueued = false;
      var y = window.scrollY || window.pageYOffset || 0;
      if (y > heroEl.offsetHeight) return;          // hero is off-screen
      heroBg.style.transform = 'translate3d(0,' + (y * FACTOR).toFixed(2) + 'px,0)';
    }
    function queueParallax() {
      if (!parallaxQueued) {
        parallaxQueued = true;
        requestAnimationFrame(paintParallax);
      }
    }
    paintParallax();
    window.addEventListener('scroll', queueParallax, { passive: true });
    window.addEventListener('resize', queueParallax);
  }

  /* --- reveal on scroll -------------------------------------------------- */
  var revealables = document.querySelectorAll('.rv, .demand, .accolades');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        countUp(e.target);
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add('is-in');
      countUp(el);
    });
  }

  /* --- number count-up --------------------------------------------------- */
  function countUp(scope) {
    var nums = scope.querySelectorAll('[data-count]');
    Array.prototype.forEach.call(nums, function (el) {
      if (el.dataset.counted) return;
      el.dataset.counted = '1';

      var target = parseFloat(el.dataset.count);
      var decimals = parseInt(el.dataset.decimals || '0', 10);
      var prefix = el.dataset.prefix || '';
      var suffix = el.dataset.suffix || '';
      var group = el.dataset.group === '1';

      if (reduce || isNaN(target)) {
        el.textContent = prefix + fmt(target, decimals, group) + suffix;
        return;
      }

      var dur = 1500, t0 = null;
      function fmtStep(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + fmt(target * eased, decimals, group) + suffix;
        if (p < 1) requestAnimationFrame(fmtStep);
        else el.textContent = prefix + fmt(target, decimals, group) + suffix;
      }
      requestAnimationFrame(fmtStep);
    });
  }

  function fmt(v, decimals, group) {
    var n = Number(v).toFixed(decimals);
    return group ? Number(n).toLocaleString('en-US', {
      minimumFractionDigits: decimals, maximumFractionDigits: decimals
    }) : n;
  }

  /* --- glass image band: eased parallax on hover ------------------------- */
  // From the supplied HWE Glass Image Band template. background-size:cover is a
  // discrete keyword and will not tween, so cover is recomputed as a numeric %
  // that can animate; the keyword is handed back once the pointer leaves.
  if (!reduce) {
    Array.prototype.forEach.call(document.querySelectorAll('.imgband'), function (el) {
      var src = getComputedStyle(el).backgroundImage || el.style.backgroundImage || '';
      var m = /url\(["']?(.*?)["']?\)/.exec(src);
      if (!m) return;

      var ratio = 0, probe = new Image();
      probe.onload = function () { ratio = probe.naturalWidth / probe.naturalHeight; };
      probe.src = m[1];

      var EASE = 'cubic-bezier(.16,1,.3,1)', ZOOM = 1.14, base = 0;
      el.style.transition = 'background-size .6s ' + EASE + ', background-position .45s ' + EASE;
      el.style.willChange = 'background-size, background-position';

      function coverPct() {
        var r = el.getBoundingClientRect();
        if (!ratio || !r.width) return 100;
        return 100 * Math.max(1, ratio / (r.width / r.height));
      }
      el.addEventListener('mouseenter', function () {
        base = coverPct();
        el.style.backgroundSize = base + '%';
        requestAnimationFrame(function () { el.style.backgroundSize = (base * ZOOM) + '%'; });
      });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - 0.5;
        var dy = (e.clientY - r.top) / r.height - 0.5;
        el.style.backgroundPosition = (50 - dx * 16) + '% ' + (50 - dy * 16) + '%';
      });
      el.addEventListener('mouseleave', function () {
        el.style.backgroundSize = (base || coverPct()) + '%';
        el.style.backgroundPosition = '50% 50%';
        setTimeout(function () {
          if (!el.matches(':hover')) { el.style.backgroundSize = ''; el.style.backgroundPosition = ''; }
        }, 640);
      });
      // a measured cover-% is only valid at that size, so release it on resize
      window.addEventListener('resize', function () {
        if (!el.matches(':hover')) { el.style.backgroundSize = ''; el.style.backgroundPosition = ''; }
      });
    });
  }

  /* --- annotated aerial: click to zoom, move to pan ---------------------- */
  // transform is `scale(Z) translate(tx%,ty%)`, so translate happens in the
  // element's own space and is then scaled: a shift of tx% moves the image
  // tx% * width * Z on screen. Clamping |tx| to 100*(Z-1)/(2Z) keeps the
  // scaled image covering the frame, so an edge can never be exposed.
  var aerial = document.querySelector('.aerial--zoom');
  if (aerial) {
    var aImg = aerial.querySelector('img');
    var Z = 2.5;
    var LIMIT = 100 * (Z - 1) / (2 * Z);
    var zoomed = false, tx = 0, ty = 0, panTimer = null;

    function paint(scale) {
      aImg.style.transform = 'scale(' + scale + ') translate(' + tx.toFixed(2) + '%,' + ty.toFixed(2) + '%)';
    }
    function clamp(v) { return Math.max(-LIMIT, Math.min(LIMIT, v)); }
    function pointOf(e) {
      var r = aerial.getBoundingClientRect();
      return { nx: (e.clientX - r.left) / r.width, ny: (e.clientY - r.top) / r.height };
    }
    function focusOn(nx, ny) {
      tx = clamp(-(nx - 0.5) * 100);
      ty = clamp(-(ny - 0.5) * 100);
    }
    function zoomIn(nx, ny) {
      zoomed = true;
      aerial.classList.add('is-zoomed');
      aerial.setAttribute('aria-pressed', 'true');
      focusOn(nx, ny);
      paint(Z);
    }
    function zoomOut() {
      zoomed = false;
      aerial.classList.remove('is-zoomed', 'is-panning');
      aerial.setAttribute('aria-pressed', 'false');
      tx = ty = 0;
      paint(1);
    }

    aerial.addEventListener('click', function (e) {
      if (zoomed) return zoomOut();
      // keyboard activation reports no coordinates — zoom to the centre
      if (e.clientX === 0 && e.clientY === 0) zoomIn(0.5, 0.5);
      else { var p = pointOf(e); zoomIn(p.nx, p.ny); }
    });

    aerial.addEventListener('pointermove', function (e) {
      if (!zoomed) return;
      aerial.classList.add('is-panning');
      if (panTimer) clearTimeout(panTimer);
      panTimer = setTimeout(function () { aerial.classList.remove('is-panning'); }, 240);
      var p = pointOf(e);
      focusOn(p.nx, p.ny);
      paint(Z);
    }, { passive: true });

    // leaving the frame or tabbing away returns it, so the page never scrolls
    // on with a half-panned aerial
    aerial.addEventListener('pointerleave', function () { if (zoomed) zoomOut(); });
    aerial.addEventListener('blur', function () { if (zoomed) zoomOut(); });

    aerial.addEventListener('keydown', function (e) {
      if (!zoomed) return;
      var step = 8, moved = true;
      if (e.key === 'ArrowLeft')       tx = clamp(tx + step);
      else if (e.key === 'ArrowRight') tx = clamp(tx - step);
      else if (e.key === 'ArrowUp')    ty = clamp(ty + step);
      else if (e.key === 'ArrowDown')  ty = clamp(ty - step);
      else if (e.key === 'Escape')     return zoomOut();
      else moved = false;
      if (moved) { e.preventDefault(); paint(Z); }
    });
  }

  /* --- lightbox ---------------------------------------------------------- */
  // navigation list excludes the marquee's clone set; clicks on a clone are
  // resolved back to the original by image path
  var figs = Array.prototype.slice.call(document.querySelectorAll('button[data-full]:not([data-clone])'));
  var allTriggers = Array.prototype.slice.call(document.querySelectorAll('button[data-full]'));
  var lb = document.querySelector('.lightbox');

  if (lb && figs.length) {
    var lbImg = lb.querySelector('img');
    var lbFig = lb.querySelector('.lightbox__fig');
    var lbHotel = lb.querySelector('.lightbox__hotel');
    var lbTitle = lb.querySelector('.lightbox__title');
    var lbBlurb = lb.querySelector('.lightbox__blurb');
    var idx = 0;
    var lastFocus = null;

    function show(i) {
      idx = (i + figs.length) % figs.length;
      var f = figs[idx];
      lbImg.src = f.dataset.full;
      lbImg.alt = f.dataset.alt || '';
      lbHotel.textContent = f.dataset.hotel || '';
      lbTitle.textContent = f.dataset.caption || '';
      lbBlurb.textContent = f.dataset.blurb || '';
      // no blurb (the property grids) -> caption-only layout
      lbFig.classList.toggle('lightbox__fig--plain', !f.dataset.blurb);
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lightbox__close').focus();
    }
    function close() {
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    allTriggers.forEach(function (t) {
      t.addEventListener('click', function () {
        var i = figs.indexOf(t);
        if (i < 0) {
          i = figs.findIndex(function (f) { return f.dataset.full === t.dataset.full; });
        }
        open(i < 0 ? 0 : i);
      });
    });
    lb.querySelector('.lightbox__close').addEventListener('click', close);
    lb.querySelector('.lightbox__nav--prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lightbox__nav--next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* --- hero scroll cue (per supplied snippet) ---------------------------- */
  var cue = document.getElementById('scrollNext');
  if (cue) {
    cue.addEventListener('click', function () {
      var current = this.closest('.page-section');
      var next = current && current.nextElementSibling;
      if (next) next.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  }
})();
