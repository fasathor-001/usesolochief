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

  // ---------- Homepage hero: rotating role word (typewriter) ----------
  // "Your personal Chief of Staff for [Founders/Operators/Managers/
  // Agency Owners/Executives]." — types each role in character by
  // character, holds it, deletes it character by character, then types
  // the next. The static markup already shows one real word fully
  // typed (progressive enhancement: with JS blocked, the headline just
  // reads "...for Founders." and nothing is missing — the blinking
  // caret is pure CSS and renders regardless). Respects
  // prefers-reduced-motion by not animating at all (both the type/
  // delete cycle here and the caret's CSS blink, via its own
  // reduced-motion rule) — auto-updating content with no user pause
  // control is exactly what that preference exists to avoid. No
  // aria-live region: this is decorative headline motion, not an
  // announcement worth interrupting screen-reader users with on every
  // keystroke.
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

    var TYPE_MS = 70;
    var DELETE_MS = 40;
    var HOLD_MS = 1500;
    var NEXT_MS = 300;

    function typeWord(word, onDone) {
      var i = 0;
      (function step() {
        i++;
        el.textContent = word.slice(0, i);
        if (i < word.length) { setTimeout(step, TYPE_MS); } else { setTimeout(onDone, HOLD_MS); }
      })();
    }

    function deleteWord(word, onDone) {
      var i = word.length;
      (function step() {
        i--;
        el.textContent = word.slice(0, i);
        if (i > 0) { setTimeout(step, DELETE_MS); } else { setTimeout(onDone, NEXT_MS); }
      })();
    }

    function cycle() {
      deleteWord(roles[index], function () {
        index = (index + 1) % roles.length;
        typeWord(roles[index], cycle);
      });
    }

    // Static markup already shows the first role fully typed — hold it
    // for the same duration every later word gets before its own
    // delete begins.
    setTimeout(cycle, HOLD_MS);
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

      var userInteracted = false;

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

      // Deep-link support: /features/#plan, #focus, #follow-up, #review
      // should land on that tab already active, not the default first tab
      // — matched against each tab's data-stage/data-demo attribute
      // (normalizing the URL's hyphenated "follow-up" to the attribute's
      // "followup", since hash fragments can't contain the ID lookup
      // otherwise needs).
      function resolveHashIndex() {
        var hashStage = window.location.hash
          ? window.location.hash.slice(1).toLowerCase().replace(/-/g, '')
          : '';
        if (!hashStage) { return -1; }
        return tabs.findIndex(function (tab) {
          var stage = (tab.getAttribute('data-stage') || tab.getAttribute('data-demo') || '').toLowerCase();
          return stage === hashStage;
        });
      }

      function activateFromHash(index) {
        // The tab is active; the panel now sits in normal flow instead of
        // being hidden, so scrolling to it works (a hidden element can't
        // be scrolled to, which is why this can't just be a plain #plan
        // anchor on the panel itself).
        activate(index, false);
        var targetPanel = panels[index];
        if (targetPanel && targetPanel.scrollIntoView) {
          targetPanel.scrollIntoView();
        }
      }

      var initialIndex = tabs.findIndex(function (tab) {
        return tab.getAttribute('aria-selected') === 'true';
      });

      // Runs before the default activate() call so the matched tab, not
      // tab 0, is what first paints — this is the common case and needs
      // no extra event to fire.
      var hashIndex = resolveHashIndex();
      activate(hashIndex !== -1 ? hashIndex : (initialIndex === -1 ? 0 : initialIndex), false);
      if (hashIndex !== -1) {
        var targetPanel = panels[hashIndex];
        if (targetPanel && targetPanel.scrollIntoView) {
          targetPanel.scrollIntoView();
        }
      }

      // Fallback: on some browsers, a deferred script's top-level code can
      // run before the initial navigation has finished resolving the URL
      // fragment, so window.location.hash reads empty above even though
      // the address bar already shows one — leaving the default tab active
      // instead of the linked one. Re-check once after load. Idempotent:
      // only activates if the hash now resolves to a tab that isn't
      // already active, and never once the user has picked a tab
      // themselves, so it can't clobber an explicit in-page choice.
      window.addEventListener('load', function () {
        if (userInteracted) { return; }
        var loadHashIndex = resolveHashIndex();
        if (loadHashIndex === -1) { return; }
        if (tabs[loadHashIndex].getAttribute('aria-selected') === 'true') { return; }
        activateFromHash(loadHashIndex);
      });

      // A hash change after the page has already loaded — a link to
      // another #stage, or browser back/forward across tab fragments — is
      // itself a deliberate navigation, so it still moves the active tab
      // even after the user has clicked a tab directly.
      window.addEventListener('hashchange', function () {
        var newHashIndex = resolveHashIndex();
        if (newHashIndex === -1) { return; }
        if (tabs[newHashIndex].getAttribute('aria-selected') === 'true') { return; }
        activateFromHash(newHashIndex);
      });

      tabs.forEach(function (tab, index) {
        tab.addEventListener('click', function () { userInteracted = true; activate(index, false); });

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
            userInteracted = true;
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
