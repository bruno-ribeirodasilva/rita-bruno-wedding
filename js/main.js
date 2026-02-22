/* ===================================================
   Rita & Bruno — Wedding Website
   Vanilla JS — All interactive features
   =================================================== */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------
     0a. LENIS SMOOTH SCROLL
     ------------------------------------------------- */
  if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
    var lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  /* -------------------------------------------------
     0b. SCROLL PROGRESS BAR
     ------------------------------------------------- */
  var scrollProgress = document.getElementById('scroll-progress');

  function updateScrollProgress() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      scrollProgress.style.transform = 'scaleX(' + (scrollTop / docHeight) + ')';
    }
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  /* -------------------------------------------------
     0c. HERO PARALLAX — CSS custom property
     ------------------------------------------------- */
  function updateParallax() {
    if (!prefersReducedMotion) {
      document.documentElement.style.setProperty('--scroll-y', window.scrollY + 'px');
    }
  }

  window.addEventListener('scroll', updateParallax, { passive: true });

  /* -------------------------------------------------
     0d. CUSTOM CURSOR
     ------------------------------------------------- */
  var cursorEl = document.getElementById('cursor');
  var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (cursorEl && !isTouchDevice) {
    document.addEventListener('mousemove', function (e) {
      cursorEl.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)';
    });

    // Scale ring on interactive elements
    var interactiveSelectors = 'a, button, input, textarea, select, [role="button"], .marquee__img';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(interactiveSelectors)) {
        cursorEl.classList.add('is-hovering');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(interactiveSelectors)) {
        cursorEl.classList.remove('is-hovering');
      }
    });
  } else if (cursorEl) {
    cursorEl.style.display = 'none';
  }

  /* -------------------------------------------------
     1. COUNTDOWN TIMER
     ------------------------------------------------- */
  const WEDDING_DATE = new Date('2026-07-04T14:00:00+01:00');

  function updateCountdown() {
    const now = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      document.getElementById('countdown-days').textContent = '0';
      document.getElementById('countdown-hours').textContent = '0';
      document.getElementById('countdown-minutes').textContent = '0';
      document.getElementById('countdown-seconds').textContent = '0';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('countdown-days').textContent = days;
    document.getElementById('countdown-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('countdown-minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('countdown-seconds').textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* -------------------------------------------------
     2. NAVBAR SCROLL — add is-scrolled class
     ------------------------------------------------- */
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  /* -------------------------------------------------
     3. ACTIVE NAV LINK — Intersection Observer
     ------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__links a');

  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.remove('is-active');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('is-active');
            }
          });
        }
      });
    },
    {
      rootMargin: '-40% 0px -55% 0px',
    }
  );

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  /* -------------------------------------------------
     4. MOBILE MENU — hamburger toggle
     ------------------------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const navLinksEl = document.getElementById('nav-links');

  function toggleMobileMenu() {
    const isOpen = hamburger.classList.toggle('is-open');
    navLinksEl.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', toggleMobileMenu);

  // Close on link click
  navLinksEl.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      if (navLinksEl.classList.contains('is-open')) {
        toggleMobileMenu();
      }
    });
  });

  /* -------------------------------------------------
     5. FADE-IN ANIMATIONS — Intersection Observer
     ------------------------------------------------- */
  const fadeElements = document.querySelectorAll('.fade-in');

  const fadeObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  fadeElements.forEach(function (el) {
    fadeObserver.observe(el);
  });

  /* -------------------------------------------------
     6. MARQUEE DUPLICATION + LIGHTBOX
     ------------------------------------------------- */
  // Clone marquee images for seamless infinite scroll
  var marqueeTrack = document.querySelector('.marquee__track');
  if (marqueeTrack) {
    var imgs = marqueeTrack.querySelectorAll('.marquee__img');
    imgs.forEach(function(img) {
      marqueeTrack.appendChild(img.cloneNode(true));
    });
  }

  // Lightbox
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxClose = document.getElementById('lightbox-close');

  if (lightbox && lightboxImg) {
    document.querySelectorAll('.marquee__img').forEach(function(img) {
      img.addEventListener('click', function() {
        lightboxImg.src = this.src;
        lightbox.hidden = false;
        requestAnimationFrame(function() { lightbox.classList.add('is-visible'); });
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('is-visible');
      setTimeout(function() { lightbox.hidden = true; lightboxImg.src = ''; }, 300);
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
  }

  /* -------------------------------------------------
     7. RSVP FORM — validation + fetch POST
     ------------------------------------------------- */
  // IMPORTANT: Replace this URL with your Google Apps Script deployment URL
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby7l06Q1HB-BkTrJ0GqfmEVeyD5eP18DUdOuAKpEpHUuGLIsSiU2dbuWLBM7FuRu831BQ/exec';

  var rsvpForm = document.getElementById('rsvp-form');
  var submitBtn = document.getElementById('rsvp-submit');
  var submitText = rsvpForm.querySelector('.rsvp-form__submit-text');
  var submitLoading = rsvpForm.querySelector('.rsvp-form__submit-loading');
  var feedback = document.getElementById('rsvp-feedback');

  function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = 'rsvp-form__feedback is-' + type;
    feedback.hidden = false;
  }

  function hideFeedback() {
    feedback.hidden = true;
    feedback.className = 'rsvp-form__feedback';
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitText.hidden = isLoading;
    submitLoading.hidden = !isLoading;
  }

  function validateForm() {
    var isValid = true;

    // Reset
    rsvpForm.querySelectorAll('.is-invalid').forEach(function (el) {
      el.classList.remove('is-invalid');
    });
    hideFeedback();

    // Name (required)
    var name = rsvpForm.querySelector('[name="nome"]');
    if (!name.value.trim()) {
      name.classList.add('is-invalid');
      isValid = false;
    }

    // Email (optional, but validate format if filled)
    var email = rsvpForm.querySelector('[name="email"]');
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value.trim() && !emailPattern.test(email.value.trim())) {
      email.classList.add('is-invalid');
      isValid = false;
    }

    // Attendance (required)
    var attendance = rsvpForm.querySelector('[name="presenca"]:checked');
    if (!attendance) {
      isValid = false;
      showFeedback('Por favor, indica se confirmas a tua presença.', 'error');
    }

    if (!isValid && !feedback.textContent) {
      showFeedback('Por favor, preenche todos os campos obrigatórios.', 'error');
    }

    return isValid;
  }

  rsvpForm.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    var formData = {
      nome: rsvpForm.querySelector('[name="nome"]').value.trim(),
      email: rsvpForm.querySelector('[name="email"]').value.trim(),
      telemovel: rsvpForm.querySelector('[name="telemovel"]').value.trim(),
      criancas: rsvpForm.querySelector('[name="criancas"]').value || '0',
      restricoes: rsvpForm.querySelector('[name="restricoes"]').value.trim(),
      presenca: rsvpForm.querySelector('[name="presenca"]:checked').value,
      mensagem: rsvpForm.querySelector('[name="mensagem"]').value.trim(),
    };

    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(formData),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        setLoading(false);
        if (data.result === 'success') {
          showFeedback(
            'Obrigado! A tua confirmação foi enviada com sucesso.',
            'success'
          );
          rsvpForm.reset();

          // Confetti burst on success
          if (typeof confetti === 'function' && !prefersReducedMotion) {
            var weddingColors = ['#c22656', '#ff6c2b', '#f6dfe2', '#849b6f'];
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.7 },
              colors: weddingColors,
              shapes: ['circle'],
              scalar: 1.2
            });
            // Second burst slightly delayed
            setTimeout(function () {
              confetti({
                particleCount: 60,
                spread: 100,
                origin: { y: 0.6 },
                colors: weddingColors,
                shapes: ['circle'],
                scalar: 0.9
              });
            }, 250);
          }
        } else {
          showFeedback(
            'Ocorreu um erro. Por favor, tenta novamente ou contacta-nos diretamente.',
            'error'
          );
        }
      })
      .catch(function () {
        setLoading(false);
        showFeedback(
          'Ocorreu um erro de ligação. Por favor, tenta novamente.',
          'error'
        );
      });
  });

  /* -------------------------------------------------
     8. IBAN COPY — clipboard API
     ------------------------------------------------- */
  var copyBtn = document.getElementById('copy-iban');
  var ibanEl = document.getElementById('iban-number');
  var toast = document.getElementById('toast');

  if (copyBtn && ibanEl) {
    copyBtn.addEventListener('click', function () {
      var iban = ibanEl.textContent.replace(/\s/g, '');

      navigator.clipboard
        .writeText(iban)
        .then(function () {
          showToast();
        })
        .catch(function () {
          // Fallback for older browsers
          var textArea = document.createElement('textarea');
          textArea.value = iban;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            showToast();
          } catch (err) {
            // Silently fail
          }
          document.body.removeChild(textArea);
        });
    });
  }

  function showToast() {
    toast.hidden = false;
    // Force reflow for transition
    void toast.offsetWidth;
    toast.classList.add('is-visible');

    setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () {
        toast.hidden = true;
      }, 300);
    }, 2000);
  }

  /* -------------------------------------------------
     8b. EMOJI REACTIONS — Google Apps Script backend
     ------------------------------------------------- */
  var reactionsEl = document.getElementById('emoji-reactions');

  if (reactionsEl) {
    // Fetch real counts from backend on page load
    fetch(APPS_SCRIPT_URL + '?type=reactions')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.result === 'success' && data.counts) {
          Object.keys(data.counts).forEach(function (emoji) {
            var countEl = reactionsEl.querySelector('[data-count="' + emoji + '"]');
            if (countEl) countEl.textContent = data.counts[emoji];
          });
        }
      })
      .catch(function () { /* silent fail — counts stay at 0 */ });

    reactionsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.reaction-btn');
      if (!btn) return;

      var emoji = btn.getAttribute('data-emoji');
      var countEl = btn.querySelector('.reaction-btn__count');
      var emojiEl = btn.querySelector('.reaction-btn__emoji');
      var count = parseInt(countEl.textContent) || 0;

      // Always add — spam away!
      count += 1;
      countEl.textContent = count;

      // Animate: pop the emoji
      btn.classList.add('is-animating');
      setTimeout(function () { btn.classList.remove('is-animating'); }, 300);

      // Floating emoji
      var floater = document.createElement('span');
      floater.className = 'reaction-btn__float';
      floater.textContent = emojiEl.textContent;
      btn.appendChild(floater);
      setTimeout(function () { floater.remove(); }, 700);

      // Sync with backend (don't overwrite optimistic count on response)
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ type: 'reaction', emoji: emoji, action: 'add' })
      }).catch(function () { /* silent fail */ });
    });
  }

  /* -------------------------------------------------
     8c. TIMELINE — (horizontal, no JS needed)
     ------------------------------------------------- */

  /* -------------------------------------------------
     8d. EASTER EGG — Triple-click the logo
     ------------------------------------------------- */
  var logoEl = document.querySelector('.navbar__monogram');
  var logoClickCount = 0;
  var logoClickTimer;

  if (logoEl) {
    logoEl.addEventListener('click', function (e) {
      logoClickCount++;
      clearTimeout(logoClickTimer);

      if (logoClickCount >= 3) {
        logoClickCount = 0;
        e.preventDefault();
        triggerEasterEgg();
      }

      logoClickTimer = setTimeout(function () {
        logoClickCount = 0;
      }, 800);
    });
  }

  function triggerEasterEgg() {
    var msg = document.getElementById('easter-egg-msg');
    if (msg) {
      msg.classList.add('is-visible');
      setTimeout(function () { msg.classList.remove('is-visible'); }, 3000);
    }

    if (typeof confetti === 'function' && !prefersReducedMotion) {
      var colors = ['#c22656', '#ff6c2b', '#f6dfe2', '#849b6f', '#32563b'];
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 }, colors: colors, shapes: ['circle'], scalar: 1.5 });
      setTimeout(function () {
        confetti({ particleCount: 150, spread: 140, origin: { y: 0.4 }, colors: colors, shapes: ['circle'], scalar: 1.2 });
      }, 300);
      setTimeout(function () {
        confetti({ particleCount: 100, spread: 160, origin: { y: 0.6 }, colors: colors, shapes: ['circle'], scalar: 1 });
      }, 600);
    }
  }

  /* -------------------------------------------------
     9. DARK MODE TOGGLE
     ------------------------------------------------- */
  var themeToggle = document.getElementById('theme-toggle');
  var savedTheme = localStorage.getItem('ribru-theme');

  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      if (next === 'light') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', next);
      }
      localStorage.setItem('ribru-theme', next);
    });
  }

  /* -------------------------------------------------
     10. PRELOADER — dismiss on page load
     ------------------------------------------------- */
  window.addEventListener('load', function () {
    var preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.classList.add('is-loaded');
    }
  });
})();
