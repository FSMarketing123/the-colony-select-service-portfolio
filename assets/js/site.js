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

  /* --- expandable tiles (accolades, metro call-outs, hotspots) ---------- */
  function bindToggle(selector, exclusiveWithin) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), function (btn) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        if (exclusiveWithin) {
          var group = btn.closest(exclusiveWithin);
          if (group) {
            Array.prototype.forEach.call(group.querySelectorAll('[aria-expanded="true"]'), function (o) {
              if (o !== btn) o.setAttribute('aria-expanded', 'false');
            });
          }
        }
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      });
    });
  }
  bindToggle('.accolade', '.accolades');
  bindToggle('.mcall', '.mcalls');
  bindToggle('.hotspot', '.aerial');

  /* --- lightbox ---------------------------------------------------------- */
  var figs = Array.prototype.slice.call(document.querySelectorAll('button.fig[data-full]'));
  var lb = document.querySelector('.lightbox');

  if (lb && figs.length) {
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('.lightbox__cap');
    var idx = 0;
    var lastFocus = null;

    function show(i) {
      idx = (i + figs.length) % figs.length;
      var f = figs[idx];
      lbImg.src = f.dataset.full;
      lbImg.alt = f.dataset.alt || '';
      lbCap.textContent = f.dataset.caption || '';
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

    figs.forEach(function (f, i) {
      f.addEventListener('click', function () { open(i); });
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
