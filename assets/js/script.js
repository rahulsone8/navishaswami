/* ═══════════════════════════════════════════════════════════
   script.js — Shivi's Personal Website
   Typing effect · Countdown · Sparkle cursor · Lightbox
   Note carousel · Scroll progress · Days-old counter
   Touch swipe · Mobile menu scroll-lock
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── CONSTANTS ─────────────────────────────────────────────
  var BIRTH_DATE = new Date('2025-08-04T00:00:00+05:30');
  // Party: 4 Aug 2026, 6:15 PM IST (UTC+5:30 → 12:45 UTC)
  var PARTY_DATE = new Date('2026-08-04T12:45:00Z');
  var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // ── MOBILE VIEWPORT HEIGHT FIX ────────────────────────────
  // On mobile browsers, 100vh includes the URL bar. We set a CSS
  // custom property to the actual visible height.
  function setVH() {
    var vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
  }
  setVH();
  window.addEventListener('resize', setVH);

  // ── TYPING EFFECT ─────────────────────────────────────────
  var typedEl  = document.getElementById('typed-name');
  var cursorEl = document.getElementById('cursor');
  var name     = 'Shivi.';
  var charIndex = 0;

  function typeNext() {
    if (charIndex <= name.length) {
      typedEl.textContent = name.slice(0, charIndex);
      charIndex++;
      setTimeout(typeNext, 160);
    } else {
      setTimeout(function () {
        cursorEl.style.opacity = '0';
      }, 3000);
    }
  }
  setTimeout(typeNext, 600);

  // ── DAYS OLD COUNTER (animated count-up) ──────────────────
  var statDays = document.querySelector('#stat-days .stat__number');
  var daysOld = Math.floor((Date.now() - BIRTH_DATE.getTime()) / (1000 * 60 * 60 * 24));
  if (daysOld < 0) daysOld = 0;

  function animateCount(el, target, duration) {
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - (1 - progress) * (1 - progress);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(step);
  }

  var countTriggered = false;

  // ── COUNTDOWN TIMER ───────────────────────────────────────
  var cdDays    = document.getElementById('cd-days');
  var cdHours   = document.getElementById('cd-hours');
  var cdMinutes = document.getElementById('cd-minutes');
  var cdSeconds = document.getElementById('cd-seconds');

  function updateCountdown() {
    var diff = PARTY_DATE - Date.now();
    if (diff <= 0) {
      cdDays.textContent    = '🎉';
      cdHours.textContent   = '🎉';
      cdMinutes.textContent = '🎉';
      cdSeconds.textContent = '🎉';
      return;
    }
    cdDays.textContent    = String(Math.floor(diff / 864e5)).padStart(2, '0');
    cdHours.textContent   = String(Math.floor((diff / 36e5) % 24)).padStart(2, '0');
    cdMinutes.textContent = String(Math.floor((diff / 6e4) % 60)).padStart(2, '0');
    cdSeconds.textContent = String(Math.floor((diff / 1e3) % 60)).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ── SCROLL REVEAL & HERO INITIALIZATION ─────────────────────
  document.querySelectorAll('.hero .reveal').forEach(function(el) {
    el.classList.add('visible');
  });
  if (statDays && !countTriggered) {
    countTriggered = true;
    animateCount(statDays, daysOld, 2000);
  }

  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    window.revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          window.revealObserver.unobserve(entry.target);

          if (!countTriggered && entry.target.closest('#stat-days')) {
            countTriggered = true;
            animateCount(statDays, daysOld, 2000);
          }
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });

    reveals.forEach(function (el) {
      var parent = el.parentElement;
      var siblings = parent ? parent.querySelectorAll(':scope > .reveal') : [];
      var idx = Array.prototype.indexOf.call(siblings, el);
      el.style.transitionDelay = (idx * 0.08) + 's';
      window.revealObserver.observe(el);
    });

    var statEl = document.getElementById('stat-days');
    if (statEl) window.revealObserver.observe(statEl);
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
    if (statDays) statDays.textContent = daysOld;
  }

  // Expose helper so dynamic content can register into scroll reveal
  window.observeNewRevealEls = function(container) {
    if (!container) return;
    var newEls = container.querySelectorAll('.reveal:not(.visible)');
    newEls.forEach(function(el, idx) {
      el.style.transitionDelay = (idx * 0.1) + 's';
      if (window.revealObserver) {
        window.revealObserver.observe(el);
      } else {
        el.classList.add('visible');
      }
    });
  };

  // ── SCROLL PROGRESS BAR ──────────────────────────────────
  var progressBar = document.getElementById('scroll-progress');

  function updateProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = percent + '%';
  }

  // ── NAV SCROLL EFFECT & SCROLLSPY ──────────────────────
  var nav = document.getElementById('nav');
  var navLinks = document.querySelectorAll('.nav__link');
  var sections = document.querySelectorAll('section[id]');
  var backToTopBtn = document.getElementById('back-to-top');

  function updateNav() {
    var scrollY = window.scrollY;
    if (scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Back to top button visibility
    if (backToTopBtn) {
      if (scrollY > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    // ScrollSpy active link detection
    var currentSectionId = '';
    sections.forEach(function (sec) {
      var top = sec.offsetTop - 120;
      var height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        var id = href.slice(1);
        if (id === currentSectionId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  }

  var isScrollTicking = false;
  window.addEventListener('scroll', function () {
    if (!isScrollTicking) {
      window.requestAnimationFrame(function() {
        updateProgress();
        updateNav();
        isScrollTicking = false;
      });
      isScrollTicking = true;
    }
  }, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── CONFETTI BURST ANIMATION ────────────────────────────
  var confettiCanvas = document.getElementById('confetti-canvas');
  var cctx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  var confettiPieces = [];
  var confettiColors = ['#FFD9E8', '#E3D6F5', '#CFF5EA', '#F0B93D', '#FFB7D5', '#9B6CB0'];

  function resizeConfetti() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  resizeConfetti();
  window.addEventListener('resize', resizeConfetti);

  function launchConfetti(originX, originY) {
    if (!confettiCanvas || !cctx) return;
    var x = originX || window.innerWidth / 2;
    var y = originY || window.innerHeight / 2;

    for (var i = 0; i < 45; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = Math.random() * 8 + 3;
      confettiPieces.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: Math.random() * 8 + 4,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        life: 1,
        decay: Math.random() * 0.015 + 0.01
      });
    }
  }

  function renderConfetti() {
    if (!cctx) return;
    cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for (var i = confettiPieces.length - 1; i >= 0; i--) {
      var p = confettiPieces[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity
      p.rotation += p.rSpeed;
      p.life -= p.decay;

      if (p.life <= 0) {
        confettiPieces.splice(i, 1);
        continue;
      }

      cctx.save();
      cctx.globalAlpha = p.life;
      cctx.translate(p.x, p.y);
      cctx.rotate((p.rotation * Math.PI) / 180);
      cctx.fillStyle = p.color;
      cctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      cctx.restore();
    }
    requestAnimationFrame(renderConfetti);
  }
  if (confettiCanvas) requestAnimationFrame(renderConfetti);

  // Trigger confetti on hero name tap or guestbook button tap
  var heroName = document.querySelector('.hero__name');
  if (heroName) {
    heroName.addEventListener('click', function (e) {
      launchConfetti(e.clientX, e.clientY);
    });
  }

  var birthdayTitle = document.querySelector('.birthday__title');
  if (birthdayTitle) {
    birthdayTitle.addEventListener('click', function (e) {
      launchConfetti(e.clientX, e.clientY);
    });
  }

  // ── MOBILE MENU (with scroll lock) ───────────────────────
  var burger = document.getElementById('nav-burger');
  var mobileMenu = document.getElementById('mobile-menu');
  var scrollPos = 0;

  function lockScroll() {
    scrollPos = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollPos + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
  }

  function unlockScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
    window.scrollTo(0, scrollPos);
  }

  burger.addEventListener('click', function () {
    var isOpen = burger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    if (isOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }
  });

  mobileMenu.querySelectorAll('.mobile-menu__link').forEach(function (link) {
    link.addEventListener('click', function () {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      unlockScroll();
    });
  });

  // ── SWIPE UTILITY ────────────────────────────────────────
  // Returns a setup function for touch-swipe on any element
  function addSwipe(el, onLeft, onRight, options) {
    var startX = 0;
    var startY = 0;
    var threshold = (options && options.threshold) || 50;

    el.addEventListener('touchstart', function (e) {
      startX = e.changedTouches[0].clientX;
      startY = e.changedTouches[0].clientY;
    }, { passive: true });

    el.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      // Only trigger if horizontal swipe is dominant
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
        if (dx < 0) {
          onLeft();
        } else {
          onRight();
        }
      }
    }, { passive: true });
  }

  // ── LIGHTBOX ─────────────────────────────────────────────
  var lightbox  = document.getElementById('lightbox');
  var lbFrame   = document.getElementById('lightbox-frame');
  var polaroids = document.querySelectorAll('.polaroid');
  var lbIndex   = 0;
  var lbTotal   = polaroids.length;

  var gradients = [
    'linear-gradient(135deg, #FFD9E8, #E3D6F5)',
    'linear-gradient(135deg, #E3D6F5, #CFF5EA)',
    'linear-gradient(135deg, #CFF5EA, #FFD9E8)',
    'linear-gradient(135deg, #FFD9E8, rgba(240,185,61,0.25))',
    'linear-gradient(135deg, #E3D6F5, #FFD9E8)',
    'linear-gradient(135deg, #CFF5EA, #E3D6F5)',
  ];

  function openLightbox(i) {
    lbIndex = i;
    updateLbContent();
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function lbNext() {
    if (typeof window.navigatePartyLightbox === 'function') {
      window.navigatePartyLightbox(1);
      return;
    }
    lbIndex = (lbIndex + 1) % lbTotal;
    updateLbContent();
  }

  function lbPrev() {
    if (typeof window.navigatePartyLightbox === 'function') {
      window.navigatePartyLightbox(-1);
      return;
    }
    lbIndex = (lbIndex - 1 + lbTotal) % lbTotal;
    updateLbContent();
  }

  var lbCaption = document.getElementById('lightbox-caption');

  function updateLbContent() {
    var pol   = polaroids[lbIndex];
    var imgEl = pol.querySelector('.polaroid__img img');
    var capEl = pol.querySelector('.polaroid__caption');
    var captionText = capEl ? capEl.textContent : ('Photo ' + (lbIndex + 1));

    if (lbCaption) lbCaption.textContent = captionText;

    if (imgEl) {
      lbFrame.innerHTML = '';
      var img = document.createElement('img');
      img.src = imgEl.src;
      img.alt = imgEl.alt || captionText;
      lbFrame.appendChild(img);
    } else {
      lbFrame.innerHTML = '<span class="polaroid__placeholder">📷</span>';
      lbFrame.style.background = gradients[lbIndex] || gradients[0];
    }
  }

  polaroids.forEach(function (p) {
    p.addEventListener('click', function () {
      openLightbox(parseInt(p.dataset.index, 10));
    });
  });

  document.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
  document.querySelector('.lightbox__prev').addEventListener('click', lbPrev);
  document.querySelector('.lightbox__next').addEventListener('click', lbNext);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  lbPrev();
    if (e.key === 'ArrowRight') lbNext();
  });

  // Touch swipe on lightbox
  addSwipe(lightbox, lbNext, lbPrev);

  // ── NOTES CAROUSEL ───────────────────────────────────────
  var slides   = document.querySelectorAll('.note-slide');
  var dots     = document.querySelectorAll('.notes__dot');
  var curSlide = 0;
  var autoSlideTimer = null;

  function goToSlide(n) {
    slides.forEach(function (s) { s.classList.remove('active'); });
    dots.forEach(function (d)   { d.classList.remove('active'); });
    slides[n].classList.add('active');
    dots[n].classList.add('active');
    curSlide = n;
  }

  function nextSlide() {
    goToSlide((curSlide + 1) % slides.length);
  }

  function prevSlide() {
    goToSlide((curSlide - 1 + slides.length) % slides.length);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      goToSlide(parseInt(dot.dataset.slide, 10));
      resetAutoSlide();
    });
  });

  function autoSlide() {
    autoSlideTimer = setInterval(function () {
      nextSlide();
    }, 5000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    autoSlide();
  }

  autoSlide();

  // Touch swipe on notes carousel
  var notesCarousel = document.getElementById('notes-carousel');
  if (notesCarousel) {
    addSwipe(notesCarousel, function () {
      nextSlide();
      resetAutoSlide();
    }, function () {
      prevSlide();
      resetAutoSlide();
    });
  }

  // ── SPARKLE CURSOR TRAIL ─────────────────────────────────
  var canvas = document.getElementById('sparkle-canvas');
  var ctx    = canvas.getContext('2d');
  var sparkles = [];
  var sparkleColors = ['#FFD9E8', '#E3D6F5', '#CFF5EA', '#F0B93D', '#FFFFFF'];

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  if (!isTouch) {
    document.addEventListener('mousemove', function (e) {
      for (var i = 0; i < 2; i++) {
        sparkles.push({
          x: e.clientX + (Math.random() - 0.5) * 12,
          y: e.clientY + (Math.random() - 0.5) * 12,
          size: Math.random() * 3.5 + 1,
          color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
          life: 1,
          decay: 0.015 + Math.random() * 0.02,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2 - 0.5,
        });
      }
      if (sparkles.length > 80) sparkles.splice(0, sparkles.length - 80);
    });

    function drawSparkles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = sparkles.length - 1; i >= 0; i--) {
        var s = sparkles[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;
        if (s.life <= 0) { sparkles.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = s.life;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        var sz = s.size * s.life;
        ctx.moveTo(s.x, s.y - sz);
        ctx.lineTo(s.x + sz * 0.3, s.y - sz * 0.3);
        ctx.lineTo(s.x + sz, s.y);
        ctx.lineTo(s.x + sz * 0.3, s.y + sz * 0.3);
        ctx.lineTo(s.x, s.y + sz);
        ctx.lineTo(s.x - sz * 0.3, s.y + sz * 0.3);
        ctx.lineTo(s.x - sz, s.y);
        ctx.lineTo(s.x - sz * 0.3, s.y - sz * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(drawSparkles);
    }
    requestAnimationFrame(drawSparkles);
  }

  // ── EMOJI RAIN (works on both hover & touch) ─────────────
  var wishesBox = document.querySelector('.wishes__box');
  var emojiRain = document.getElementById('emoji-rain');
  var emojis    = ['💕', '🦄', '✨', '🎂', '🌟', '🎀', '💝', '🌈', '🎉'];
  var emojiTimer = null;

  function startEmojiRain() {
    if (emojiTimer) return;
    emojiTimer = setInterval(function () {
      var em = document.createElement('span');
      em.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      em.style.cssText =
        'position:absolute;' +
        'left:' + (Math.random() * 100) + '%;' +
        'top:-20px;' +
        'font-size:' + (14 + Math.random() * 14) + 'px;' +
        'opacity:0.7;' +
        'pointer-events:none;' +
        'animation:emojiDrop ' + (1.5 + Math.random() * 1.5) + 's linear forwards;';
      emojiRain.appendChild(em);
      setTimeout(function () { em.remove(); }, 3500);
    }, 200);
  }

  function stopEmojiRain() {
    clearInterval(emojiTimer);
    emojiTimer = null;
  }

  if (wishesBox) {
    // Desktop: hover
    wishesBox.addEventListener('mouseenter', startEmojiRain);
    wishesBox.addEventListener('mouseleave', stopEmojiRain);

    var wishesBtn = wishesBox.querySelector('.wishes__btn');
    if (wishesBtn) {
      wishesBtn.addEventListener('click', function(e) {
        launchConfetti(e.clientX, e.clientY);
      });
    }

    // Mobile: trigger on scroll into view, auto-stop after 3s
    if (isTouch && 'IntersectionObserver' in window) {
      var emojiObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            startEmojiRain();
            setTimeout(stopEmojiRain, 3000);
          } else {
            stopEmojiRain();
          }
        });
      }, { threshold: 0.5 });
      emojiObserver.observe(wishesBox);
    }
  }

  // Inject emoji drop keyframe
  var styleSheet = document.createElement('style');
  styleSheet.textContent = '@keyframes emojiDrop{0%{transform:translateY(0) rotate(0deg);opacity:0.7;}100%{transform:translateY(300px) rotate(20deg);opacity:0;}}';
  document.head.appendChild(styleSheet);

  // ── PARTY PHOTOS — SIMPLE & MINIMAL HUB ────────────────────
  var partyInput = document.getElementById('party-file-input');
  var uploadStatus = document.getElementById('upload-status');
  var partyGrid = document.getElementById('party-grid');

  function renderMinimalPhotoCard(src, title, contributor) {
    if (!partyGrid) return;
    var card = document.createElement('div');
    card.className = 'party-minimal-card reveal visible';
    card.innerHTML =
      '<div class="party-minimal-card__img"><img src="' + src + '" alt="' + title + '" /></div>' +
      '<div class="party-minimal-card__footer">' +
      '  <span class="party-minimal-card__by">' + contributor + '</span>' +
      '  <button class="photo-dl-btn" data-src="' + src + '" data-title="' + title + '">⬇️ Download</button>' +
      '</div>';
    partyGrid.insertBefore(card, partyGrid.firstChild);
  }

  function handleFileSelection(files) {
    if (!files || !files.length) return;
    var filesArray = Array.from(files).filter(function (f) { return f.type.startsWith('image/'); });
    if (!filesArray.length) return;

    var uploaderName = prompt('Enter your name for the photo upload:', 'Guest') || 'Guest';
    var processed = 0;

    filesArray.forEach(function (file) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var src = e.target.result;
        renderMinimalPhotoCard(src, file.name, uploaderName + "'s Photo");
        saveMinimalPhotoToStorage(src, file.name, uploaderName + "'s Photo");

        processed++;
        if (processed === filesArray.length) {
          if (uploadStatus) uploadStatus.textContent = '✨ ' + filesArray.length + ' photo' + (filesArray.length > 1 ? 's' : '') + ' added to Party Memories!';
          if (typeof launchConfetti === 'function') launchConfetti();
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function saveMinimalPhotoToStorage(src, title, contributor) {
    try {
      var existing = JSON.parse(localStorage.getItem('shivi_party_photos') || '[]');
      existing.unshift({ src: src, title: title, contributor: contributor });
      if (existing.length > 12) existing = existing.slice(0, 12);
      localStorage.setItem('shivi_party_photos', JSON.stringify(existing));
    } catch (err) {
      console.warn('Storage save skipped:', err);
    }
  }

  function loadStoredMinimalPhotos() {
    try {
      var stored = JSON.parse(localStorage.getItem('shivi_party_photos') || '[]');
      stored.forEach(function (p) {
        renderMinimalPhotoCard(p.src, p.title, p.contributor);
      });
    } catch (err) {
      console.warn('Storage load skipped:', err);
    }
  }
  loadStoredMinimalPhotos();

  if (partyInput) {
    partyInput.addEventListener('change', function () {
      handleFileSelection(partyInput.files);
    });
  }

  // Photo Download Handler
  document.addEventListener('click', function (e) {
    var photoBtn = e.target.closest('.photo-dl-btn');
    if (photoBtn) {
      var title = photoBtn.getAttribute('data-title') || 'Party Photo';
      var src = photoBtn.getAttribute('data-src');

      if (src) {
        var a = document.createElement('a');
        a.href = src;
        a.download = 'Shivi-Party-' + title.replace(/\s+/g, '-');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert('📷 Downloading photo: "' + title + '"!');
      }
    }
  });

  // ── FLOATING 'MAKE SHIVI HAPPY' LOLLIPOP WIDGET ──────────
  var happyWidget = document.getElementById('happy-widget');
  var happyModal = document.getElementById('happy-modal');
  var happyCloseBtn = document.getElementById('happy-modal-close');
  var happyCloseBg = document.getElementById('happy-modal-close-bg');
  var giveAnotherBtn = document.getElementById('give-another-btn');
  var happySpeech = document.getElementById('happy-speech');
  var happyBaby = document.getElementById('happy-baby');
  var happyLollipop = document.getElementById('happy-lollipop');

  var happyQuotes = [
    '"A Lollipop for me?! Tee-hee! Shivi is superduper happy!" 🍭🥰',
    '"YUMMY! Another sweet treat?! Giggles everywhere!" 🍭🥳✨',
    '"Shivi says: You are the absolute BEST! Thank you for the candy!" 🍭💕',
    '"Woohoo! Lollipop party time with Shivi!" 🍭🎈✨',
    '"Nom nom nom! So sweet & fruity!" 🍭😋'
  ];

  // ── BABY LAUGH & GIGGLE SOUND SYNTHESIZER (Web Audio API) ──
  var audioCtx = null;

  function playBabyGiggleSound() {
    try {
      if (!audioCtx) {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
      }
      if (!audioCtx) return;

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      var now = audioCtx.currentTime;
      // Rising cheerful giggle frequencies (he-he-he-hee!)
      var giggleNotes = [
        { freq: 440, time: 0, dur: 0.08 },
        { freq: 523, time: 0.09, dur: 0.08 },
        { freq: 659, time: 0.18, dur: 0.1 },
        { freq: 784, time: 0.29, dur: 0.12 },
        { freq: 880, time: 0.42, dur: 0.18 },
        { freq: 1046, time: 0.62, dur: 0.22 }
      ];

      giggleNotes.forEach(function (n) {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, now + n.time);
        // Subtle pitch wobble for realistic laugh timbre
        osc.frequency.exponentialRampToValueAtTime(n.freq * 1.15, now + n.time + n.dur);

        gain.gain.setValueAtTime(0, now + n.time);
        gain.gain.linearRampToValueAtTime(0.18, now + n.time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + n.time);
        osc.stop(now + n.time + n.dur);
      });
    } catch (err) {
      console.log('Audio playback info:', err);
    }
  }

  function triggerLollipopFeed() {
    if (happyBaby) {
      happyBaby.classList.remove('fed');
      void happyBaby.offsetWidth; // trigger reflow
      happyBaby.classList.add('fed');
    }

    if (happyLollipop) {
      happyLollipop.classList.add('feeding');
      setTimeout(function () { happyLollipop.classList.remove('feeding'); }, 600);
    }

    var randomQuote = happyQuotes[Math.floor(Math.random() * happyQuotes.length)];
    if (happySpeech) happySpeech.textContent = randomQuote;

    // Play baby giggle sound!
    playBabyGiggleSound();

    if (typeof launchConfetti === 'function') {
      launchConfetti(window.innerWidth / 2, window.innerHeight * 0.4);
    }
  }

  function openHappyModal() {
    if (!happyModal) return;
    happyModal.classList.add('open');
    triggerLollipopFeed();
  }

  function closeHappyModal() {
    if (!happyModal) return;
    happyModal.classList.remove('open');
  }

  if (happyWidget) happyWidget.addEventListener('click', openHappyModal);
  if (happyCloseBtn) happyCloseBtn.addEventListener('click', closeHappyModal);
  if (happyCloseBg) happyCloseBg.addEventListener('click', closeHappyModal);
  if (happyBaby) happyBaby.addEventListener('click', triggerLollipopFeed);

  // ── FAMILY MEMBER DETAIL INLINE BANNER (NO POPUP MODAL) ────
  var ftInlineInfo = document.getElementById('ft-inline-info');
  var ftInfoAvatarBox = document.getElementById('ft-info-avatar-box');
  var ftInfoImg = document.getElementById('ft-info-img');
  var ftInfoName = document.getElementById('ft-info-name');
  var ftInfoRole = document.getElementById('ft-info-role');
  var ftInfoRelation = document.getElementById('ft-info-relation');
  var ftInfoNote = document.getElementById('ft-info-note');

  // Initialize Family Tree Card Images
  document.querySelectorAll('.ft-card').forEach(function (card) {
    var imgSrc = card.getAttribute('data-img');
    var imgBox = card.querySelector('.ft-circle__img-box');
    if (imgSrc && imgBox && !imgBox.querySelector('.ft-circle__real-img')) {
      var name = card.getAttribute('data-name') || 'Family Member';
      imgBox.innerHTML = '<img src="' + imgSrc + '" alt="' + name + '" class="ft-circle__real-img" />';
    }
  });

  // Initialize Memorial Card Images
  document.querySelectorAll('.memorial-card').forEach(function (card) {
    var imgSrc = card.getAttribute('data-img');
    var imgBox = card.querySelector('.memorial-card__img-box');
    if (imgSrc && imgBox && !imgBox.querySelector('.memorial-card__real-img')) {
      var name = card.querySelector('.memorial-card__name')?.textContent || 'In Loving Memory';
      imgBox.innerHTML = '<img src="' + imgSrc + '" alt="' + name + '" class="memorial-card__real-img" />';
    }
  });

  // ── FAMILY TREE SMALL 80/20 CARD ENGINE ─────────────────────
  var activeFtCardNode = null;
  var ftAutoHideTimer = null;

  window.closeFtCard = function() {
    var ftInlineInfo = document.getElementById('ft-inline-info');
    if (ftInlineInfo) {
      ftInlineInfo.style.display = 'none';
      ftInlineInfo.classList.remove('open');
    }
    document.querySelectorAll('.ft-card').forEach(function (c) { c.classList.remove('selected'); });
    activeFtCardNode = null;
    if (ftAutoHideTimer) {
      clearTimeout(ftAutoHideTimer);
      ftAutoHideTimer = null;
    }
  };

  document.querySelectorAll('.ft-card').forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e) e.stopPropagation();

      // IF CLICKING THE SAME NODE AGAIN -> TOGGLE CLOSE!
      if (activeFtCardNode === card) {
        window.closeFtCard();
        return;
      }

      // Clear existing auto-hide timer
      if (ftAutoHideTimer) {
        clearTimeout(ftAutoHideTimer);
        ftAutoHideTimer = null;
      }

      // Unselect all other cards
      document.querySelectorAll('.ft-card').forEach(function (c) { c.classList.remove('selected'); });
      card.classList.add('selected');
      activeFtCardNode = card;

      var name = card.getAttribute('data-name') || 'Family Member';
      var role = card.getAttribute('data-role') || 'Relation';
      var relation = card.getAttribute('data-relation') || role || '';
      var avatarEmoji = card.getAttribute('data-avatar') || '💕';
      var imgSrc = card.getAttribute('data-img');

      var ftInfoName = document.getElementById('ft-info-name');
      var ftInfoRelation = document.getElementById('ft-info-relation');
      var ftInfoAvatarBox = document.getElementById('ft-info-avatar-box');
      var ftInlineInfo = document.getElementById('ft-inline-info');

      if (ftInfoName) ftInfoName.textContent = name;
      if (ftInfoRelation) ftInfoRelation.textContent = relation;

      if (imgSrc && ftInfoAvatarBox) {
        ftInfoAvatarBox.innerHTML = '<img src="' + imgSrc + '" alt="' + name + '" />';
      } else if (ftInfoAvatarBox) {
        ftInfoAvatarBox.innerHTML = '<span>' + avatarEmoji + '</span>';
      }

      if (ftInlineInfo) {
        ftInlineInfo.style.display = 'flex';
        ftInlineInfo.classList.remove('open');
        void ftInlineInfo.offsetWidth;
        ftInlineInfo.classList.add('open');
        ftInlineInfo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      if (typeof launchConfetti === 'function' && role.includes('Shivi')) {
        launchConfetti(window.innerWidth / 2, window.innerHeight * 0.4);
      }

      // AUTO-HIDE AFTER 10 SECONDS
      ftAutoHideTimer = setTimeout(function() {
        window.closeFtCard();
      }, 10000);
    });
  });

  // ── PARTY GALLERY MODAL (Opens only on click!) ───────────
  var partyModal = document.getElementById('party-gallery-modal');
  var partyCloseBtn = document.getElementById('party-gallery-close-btn');
  var partyCloseBg = document.getElementById('party-gallery-close-bg');

  function openPartyModal(e) {
    if (e) e.preventDefault();
    if (partyModal) {
      partyModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (typeof window.renderPartyAlbums === 'function') {
        window.renderPartyAlbums();
      }
    }
  }
  window.openPartyModal = openPartyModal;

  function closePartyModal() {
    if (partyModal) {
      partyModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
  window.closePartyModal = closePartyModal;

  ['nav-gallery-btn', 'nav-party-snaps-btn', 'mobile-gallery-btn', 'mobile-party-snaps-btn'].forEach(function(id) {
    var btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', openPartyModal);
    }
  });

  if (partyCloseBtn) partyCloseBtn.addEventListener('click', closePartyModal);
  if (partyCloseBg) partyCloseBg.addEventListener('click', closePartyModal);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && partyModal && partyModal.classList.contains('active')) {
      closePartyModal();
    }
  });

  // ── WISH MODAL & LIVE WISHES BOARD LOGIC ───────────────────
  var wishModal = document.getElementById('wish-modal');
  var openWishBtn = document.getElementById('open-wish-modal-btn');
  var wishCloseBtn = document.getElementById('wish-modal-close-btn');
  var wishCloseBg = document.getElementById('wish-modal-close-bg');
  var wishForm = document.getElementById('wish-form');
  var wishesGrid = document.getElementById('wishes-board-grid');
  var selectedEmoji = '💖';

  window.openWishModal = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    var modal = document.getElementById('wish-modal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeWishModal = function() {
    var modal = document.getElementById('wish-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (openWishBtn) openWishBtn.addEventListener('click', window.openWishModal);
  if (wishCloseBtn) wishCloseBtn.addEventListener('click', window.closeWishModal);
  if (wishCloseBg) wishCloseBg.addEventListener('click', window.closeWishModal);

  // Global click delegation for all wish buttons
  document.addEventListener('click', function(e) {
    var trigger = e.target.closest('#open-wish-modal-btn, .wishes__btn, a[href="#wishes"]');
    if (trigger) {
      e.preventDefault();
      window.openWishModal(e);
    }
  });

  window.selectedWishEmoji = '💖';

  window.selectWishEmoji = function(btnEl, char) {
    window.selectedWishEmoji = char || '💖';
    document.querySelectorAll('.emoji-btn').forEach(function(b) { b.classList.remove('active'); });
    if (btnEl) btnEl.classList.add('active');
  };

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Load stored wishes from localStorage
  window.loadWishes = function() {
    var grid = document.getElementById('wishes-board-grid');
    if (!grid) return;
    var wishes = JSON.parse(localStorage.getItem('shivi_wishes') || '[]');
    grid.innerHTML = '';

    if (wishes.length === 0) {
      grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--plum); opacity:0.8; font-weight:600; padding:1.5rem;">Be the first to leave a sweet wish for baby Shivi! Type your wish above 💌</p>';
      return;
    }

    wishes.forEach(function(w) {
      var card = document.createElement('div');
      card.className = 'wish-card';
      card.innerHTML = 
        '<div class="wish-card__header">' +
          '<span class="wish-card__sender">' + escapeHtml(w.name) + '</span>' +
        '</div>' +
        '<p class="wish-card__body">"' + escapeHtml(w.message) + '"</p>' +
        '<div class="wish-card__footer">' +
          '<span>' + (w.date || 'Just now') + '</span>' +
          '<span class="wish-card__emoji">' + (w.emoji || '💖') + '</span>' +
        '</div>';
      grid.appendChild(card);
    });
  };

  window.handleWishSubmit = function(e) {
    if (e && e.preventDefault) e.preventDefault();

    var nameEl = document.getElementById('wish-sender-name');
    var messageEl = document.getElementById('wish-message');

    var name = nameEl ? nameEl.value.trim() : '';
    var message = messageEl ? messageEl.value.trim() : '';

    if (!name || !message) return;

    var newWish = {
      name: name,
      message: message,
      emoji: window.selectedWishEmoji || '💖',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    var wishes = JSON.parse(localStorage.getItem('shivi_wishes') || '[]');
    wishes.unshift(newWish);
    localStorage.setItem('shivi_wishes', JSON.stringify(wishes));

    // Reset inputs
    if (nameEl) nameEl.value = '';
    if (messageEl) messageEl.value = '';

    // Show success alert message
    var successMsg = document.getElementById('wish-success-msg');
    if (successMsg) {
      successMsg.style.display = 'block';
      setTimeout(function() { successMsg.style.display = 'none'; }, 6000);
    }

    // Refresh board
    window.loadWishes();

    // Launch celebration confetti
    if (typeof launchConfetti === 'function') {
      launchConfetti(window.innerWidth / 2, window.innerHeight * 0.5);
    }

    // Scroll smoothly to Wishes board grid
    var boardGrid = document.getElementById('wishes-board-grid');
    if (boardGrid) boardGrid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Initial load
  window.loadWishes();

  // ── SMOOTH SCROLL for nav links ──────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#' || href === '#wishes') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var navHeight = nav ? nav.offsetHeight : 0;
        var targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  // ── AUTOMATIC FAMILY TREE IMAGE BINDING ──
  document.querySelectorAll('.ft-card[data-img]').forEach(function(card) {
    var dataImg = card.getAttribute('data-img');
    if (!dataImg) return;

    var imgBox = card.querySelector('.ft-circle__img-box');
    if (!imgBox) return;

    if (imgBox.querySelector('img')) return;

    var img = new Image();
    img.onload = function() {
      imgBox.innerHTML = '<img src="' + dataImg + '" alt="' + (card.getAttribute('data-name') || '') + '" class="ft-circle__real-img" />';
    };
    img.onerror = function() {
      var avatar = card.getAttribute('data-avatar') || '👨🏻';
      imgBox.innerHTML = '<span class="ft-circle__emoji">' + avatar + '</span>';
    };
    img.src = dataImg;
  });

})();

