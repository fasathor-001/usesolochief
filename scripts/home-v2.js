/* SoloChief Homepage V2 — motion foundation + hero entrance sequence.
   Handles: mobile menu toggle, hero entrance trigger, scroll-reveal
   (IntersectionObserver only). No sticky-scroll logic here — that is
   CSS `position: sticky` only, and no scroll position is ever read. */

(function () {
  'use strict';

  // Progressive enhancement only: the CSS baseline (no attribute present)
  // already renders the hero fully visible, so if this line never runs
  // (script blocked, JS disabled) nothing is left hidden.
  document.documentElement.setAttribute('data-hv2-hero-motion', 'ready');

  var menuBtn = document.getElementById('hv2MenuBtn');
  var mobileMenu = document.getElementById('hv2MobileMenu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('hv2-menu-open');
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var revealEls = document.querySelectorAll('.hv2-reveal');

  // Assign stagger index once, up front — never inside a scroll/observer callback.
  revealEls.forEach(function (el, index) {
    var raw = el.getAttribute('data-hv2-stagger');
    var withinGroup = raw !== null && raw !== '' && !isNaN(Number(raw)) ? Number(raw) : (index % 3);
    el.style.setProperty('--hv2-stagger-index', withinGroup);
  });

  // ---------- Film section: viewport-driven playback + sound toggle ----------
  (function initFilm() {
    var video = document.getElementById('hv2FilmVideo');
    var soundBtn = document.getElementById('hv2FilmSoundBtn');
    if (!video) { return; }

    function safePlay() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        // Autoplay can be blocked by browser policy or interrupted by a
        // near-simultaneous pause() — either way the poster frame and
        // native controls stay visible, so there is nothing to recover.
        playPromise.catch(function () {});
      }
    }

    var prefersReducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var saveData = !!(navigator.connection && navigator.connection.saveData);
    var autoplayAllowed = !prefersReducedMotion && !saveData && ('IntersectionObserver' in window);

    if (autoplayAllowed) {
      var filmObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.intersectionRatio >= 0.6) {
              safePlay();
            } else if (!entry.isIntersecting) {
              video.pause();
            }
          });
        },
        { threshold: [0, 0.6] }
      );
      filmObserver.observe(video);
    }

    if (soundBtn) {
      soundBtn.addEventListener('click', function () {
        video.muted = !video.muted;
        var isUnmuted = !video.muted;
        if (isUnmuted) { safePlay(); }
        soundBtn.setAttribute('aria-pressed', isUnmuted ? 'true' : 'false');
        soundBtn.setAttribute(
          'aria-label',
          isUnmuted ? 'Mute the SoloChief product film' : 'Watch the SoloChief product film with sound'
        );
        soundBtn.querySelector('.hv2-film-sound-label').textContent = isUnmuted ? 'Mute' : 'Watch with sound';
      });
    }
  })();

  // ---------- FAQ: accessible accordion, one answer open at a time ----------
  (function initFaq() {
    var items = document.querySelectorAll('.hv2-faq-item');
    if (!items.length) { return; }

    items.forEach(function (item) {
      var button = item.querySelector('.hv2-faq-q');
      if (!button) { return; }

      button.addEventListener('click', function () {
        var wasOpen = item.classList.contains('hv2-is-open');

        items.forEach(function (otherItem) {
          otherItem.classList.remove('hv2-is-open');
          var otherButton = otherItem.querySelector('.hv2-faq-q');
          if (otherButton) { otherButton.setAttribute('aria-expanded', 'false'); }
        });

        if (!wasOpen) {
          item.classList.add('hv2-is-open');
          button.setAttribute('aria-expanded', 'true');
        }
      });
    });
  })();

  // ---------- Homepage hero: rotating audience word ----------
  // "Built for [Managers/Operators/Students/Founders/Builders]" — the
  // static markup already shows one real word (progressive enhancement:
  // with JS blocked, the eyebrow just reads "Built for Managers" and
  // nothing is missing). Respects prefers-reduced-motion by not
  // rotating at all — auto-updating content with no user pause control
  // is exactly what that preference exists to avoid.
  (function initHeroRoleRotation() {
    var el = document.getElementById('hv2RoleWord');
    if (!el) { return; }

    var prefersReducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) { return; }

    var roles = (el.getAttribute('data-hv2-roles') || '').split(',')
      .map(function (r) { return r.trim(); })
      .filter(Boolean);
    if (roles.length < 2) { return; }

    var index = roles.indexOf(el.textContent.trim());
    if (index === -1) { index = 0; }

    setInterval(function () {
      el.classList.add('hv2-role-word--fading');
      setTimeout(function () {
        index = (index + 1) % roles.length;
        el.textContent = roles[index];
        el.classList.remove('hv2-role-word--fading');
      }, 220);
    }, 2600);
  })();

  // ---------- Features page: generic tab-group widget ----------
  // Powers the operating-system overview and the interactive product
  // demonstration's scenario switcher. No-op wherever no [role="tablist"]
  // exists (e.g. the homepage). Every panel starts visible in the static
  // markup — with JS blocked or slow, all responsibilities / all
  // scenarios are readable, stacked in document order. Only once this
  // actually runs does it narrow down to the single selected panel (the
  // initial activate() call below, not just the click handlers) —
  // critical content is never opacity:0 or hidden pending JS.
  (function initTabGroups() {
    var tablists = document.querySelectorAll('[role="tablist"]');
    if (!tablists.length) { return; }

    tablists.forEach(function (tablist) {
      var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
      if (!tabs.length) { return; }

      var panels = tabs.map(function (tab) {
        var panelId = tab.getAttribute('aria-controls');
        return panelId ? document.getElementById(panelId) : null;
      });

      function activate(index, moveFocus) {
        tabs.forEach(function (tab, i) {
          var isActive = i === index;
          tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
          tab.setAttribute('tabindex', isActive ? '0' : '-1');
          var panel = panels[i];
          if (panel) { panel.hidden = !isActive; }
        });
        if (moveFocus) { tabs[index].focus(); }
      }

      var initialIndex = tabs.findIndex(function (tab) {
        return tab.getAttribute('aria-selected') === 'true';
      });
      activate(initialIndex === -1 ? 0 : initialIndex, false);

      tabs.forEach(function (tab, index) {
        tab.addEventListener('click', function () { activate(index, false); });

        tab.addEventListener('keydown', function (event) {
          var lastIndex = tabs.length - 1;
          var nextIndex = null;

          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            nextIndex = index === lastIndex ? 0 : index + 1;
          } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            nextIndex = index === 0 ? lastIndex : index - 1;
          } else if (event.key === 'Home') {
            nextIndex = 0;
          } else if (event.key === 'End') {
            nextIndex = lastIndex;
          }

          if (nextIndex !== null) {
            event.preventDefault();
            activate(nextIndex, true);
          }
        });
      });
    });
  })();

  if (!('IntersectionObserver' in window)) {
    // Fail safe: no observer support, just show everything immediately.
    revealEls.forEach(function (el) {
      el.classList.add('hv2-is-visible');
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('hv2-is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
  );

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
})();
