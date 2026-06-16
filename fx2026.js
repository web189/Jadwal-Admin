/*!
 * FX 2026 — Particle System & Animation Engine
 * Jadwal Admin Gudang — Dark & Light Mode
 * Zero dependencies · Mobile optimized · 60fps
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────
     UTIL
  ───────────────────────────────────────── */
  var raf = window.requestAnimationFrame;
  var isDark = function () { return !document.body.classList.contains('formal-theme'); };
  var isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function r(min, max) { return min + Math.random() * (max - min); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ─────────────────────────────────────────
     1. FLOATING ORBS (DOM — CSS animated)
  ───────────────────────────────────────── */
  function initOrbs() {
    if (REDUCE) return;
    var wrap = document.createElement('div');
    wrap.id = 'fx-orbs';
    document.body.insertBefore(wrap, document.body.firstChild);

    var darkOrbs = [
      { w:380, h:320, x:'-10%', y:'-8%', c:'rgba(0,245,255,0.07)',  dur:20, tx1:'40px', ty1:'-25px', tx2:'-20px', ty2:'40px', tx3:'20px', ty3:'10px' },
      { w:300, h:280, x:'70%',  y:'5%',  c:'rgba(120,0,255,0.06)',  dur:25, tx1:'-30px', ty1:'20px',  tx2:'25px', ty2:'-30px', tx3:'-10px', ty3:'20px' },
      { w:260, h:240, x:'20%',  y:'60%', c:'rgba(0,200,150,0.05)',  dur:18, tx1:'20px', ty1:'30px',   tx2:'-30px', ty2:'-15px', tx3:'10px', ty3:'25px' },
      { w:200, h:180, x:'80%',  y:'70%', c:'rgba(255,0,200,0.045)', dur:22, tx1:'-15px', ty1:'-20px', tx2:'20px', ty2:'15px',  tx3:'-8px', ty3:'-12px' },
    ];
    var lightOrbs = [
      { w:420, h:360, x:'-5%',  y:'-10%', c:'rgba(100,160,255,0.1)',  dur:22, tx1:'30px', ty1:'-20px', tx2:'-15px', ty2:'30px', tx3:'10px', ty3:'10px' },
      { w:300, h:260, x:'65%',  y:'0%',   c:'rgba(100,220,180,0.07)', dur:28, tx1:'-20px', ty1:'25px', tx2:'20px', ty2:'-20px', tx3:'-8px', ty3:'15px' },
      { w:220, h:200, x:'40%',  y:'65%',  c:'rgba(150,100,255,0.05)', dur:19, tx1:'15px', ty1:'20px',  tx2:'-20px', ty2:'-10px', tx3:'8px', ty3:'15px' },
    ];

    var orbs = isDark() ? darkOrbs : lightOrbs;
    orbs.forEach(function (o) {
      var el = document.createElement('div');
      el.className = 'fx-orb';
      el.style.cssText =
        'width:' + o.w + 'px;height:' + o.h + 'px;' +
        'left:' + o.x + ';top:' + o.y + ';' +
        'background:' + o.c + ';' +
        '--dur:' + o.dur + 's;' +
        '--tx1:' + o.tx1 + ';--ty1:' + o.ty1 + ';' +
        '--tx2:' + o.tx2 + ';--ty2:' + o.ty2 + ';' +
        '--tx3:' + o.tx3 + ';--ty3:' + o.ty3 + ';';
      wrap.appendChild(el);
    });
  }

  /* ─────────────────────────────────────────
     2. SHOOTING STARS (dark only)
  ───────────────────────────────────────── */
  function initStars() {
    if (REDUCE || isMobile) return;
    var wrap = document.createElement('div');
    wrap.id = 'fx-stars';
    document.body.insertBefore(wrap, document.body.firstChild);

    var starDefs = [
      { w:200, top:'8%',  left:'0',   ang:'-10deg', sd:'4s',  delay:'0s'   },
      { w:160, top:'22%', left:'10%', ang:'12deg',  sd:'6s',  delay:'1.5s' },
      { w:280, top:'5%',  left:'30%', ang:'-8deg',  sd:'8s',  delay:'3s'   },
      { w:120, top:'35%', left:'5%',  ang:'15deg',  sd:'5s',  delay:'2s'   },
      { w:200, top:'15%', left:'50%', ang:'-12deg', sd:'7s',  delay:'4s'   },
      { w:180, top:'45%', left:'20%', ang:'10deg',  sd:'9s',  delay:'0.8s' },
    ];

    starDefs.forEach(function (s) {
      var el = document.createElement('div');
      el.className = 'fx-star';
      el.style.cssText =
        'width:' + s.w + 'px;top:' + s.top + ';left:' + s.left + ';' +
        '--ang:' + s.ang + ';--sd:' + s.sd + ';--delay:' + s.delay + ';' +
        'animation-delay:' + s.delay + ';';
      wrap.appendChild(el);
    });
  }

  /* ─────────────────────────────────────────
     3. HEX GRID
  ───────────────────────────────────────── */
  function initHexGrid() {
    var el = document.createElement('div');
    el.id = 'fx-hexgrid';
    document.body.insertBefore(el, document.body.firstChild);
  }

  /* ─────────────────────────────────────────
     4. CANVAS PARTICLE SYSTEM
  ───────────────────────────────────────── */
  function initCanvas() {
    if (REDUCE) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'fx-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);
    var ctx = canvas.getContext('2d');

    var W, H;
    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* Particle constructor */
    function Particle() { this.reset(true); }
    Particle.prototype.reset = function (init) {
      this.x  = r(0, W);
      this.y  = init ? r(0, H) : H + 10;
      this.vx = r(-0.3, 0.3);
      this.vy = r(-0.6, -0.15);
      this.size  = r(1, isMobile ? 1.8 : 2.5);
      this.alpha = r(0.1, 0.45);
      this.life  = 1;
      this.decay = r(0.003, 0.008);
      var darkCols  = ['#00f5ff','#ffffff','#ff00c8','#00ff8c','#a78bfa'];
      var lightCols = ['#1565c0','#7b1fa2','#2e7d32','#0288d1','#9c27b0'];
      this.col = pick(isDark() ? darkCols : lightCols);
      /* Connection dot */
      this.connected = false;
    };
    Particle.prototype.update = function () {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
      if (this.life <= 0 || this.y < -10) this.reset(false);
    };
    Particle.prototype.draw = function () {
      ctx.save();
      ctx.globalAlpha = this.life * this.alpha;
      ctx.fillStyle = this.col;
      ctx.shadowColor = this.col;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    var COUNT = isMobile ? 30 : 60;
    var particles = [];
    for (var i = 0; i < COUNT; i++) particles.push(new Particle());

    /* Connection lines between nearby particles */
    function drawConnections() {
      if (isMobile) return;
      var maxDist = 120;
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            var opacity = (1 - dist / maxDist) * 0.12 * particles[a].life;
            ctx.save();
            ctx.strokeStyle = isDark()
              ? 'rgba(0,245,255,' + opacity + ')'
              : 'rgba(21,101,192,' + opacity + ')';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    var frameCount = 0;
    function loop() {
      raf(loop);
      if (!isDark() && frameCount % 2 !== 0) { frameCount++; return; } // slower in light
      frameCount++;
      ctx.clearRect(0, 0, W, H);
      drawConnections();
      particles.forEach(function (p) { p.update(); p.draw(); });
    }
    loop();

    /* Expose for click burst */
    window._fxParticles = particles;
    window._fxParticleFactory = Particle;
    window._fxCtx = ctx;
  }

  /* ─────────────────────────────────────────
     5. MOUSE TRAIL
  ───────────────────────────────────────── */
  function initMouseTrail() {
    if (REDUCE || isMobile) return;

    var trailColors = isDark()
      ? ['#00f5ff','#ff00c8','#00ff8c','#a78bfa','#ffffff']
      : ['#1565c0','#7b1fa2','#0288d1','#2e7d32','#9c27b0'];

    var lastX = 0, lastY = 0, throttle = 0;

    document.addEventListener('mousemove', function (e) {
      var now = Date.now();
      if (now - throttle < 35) return; // ~28fps trail
      throttle = now;

      var dx = Math.abs(e.clientX - lastX);
      var dy = Math.abs(e.clientY - lastY);
      if (dx < 3 && dy < 3) return;
      lastX = e.clientX; lastY = e.clientY;

      var dot = document.createElement('div');
      dot.className = 'fx-trail';
      var col = trailColors[Math.floor(Math.random() * trailColors.length)];
      var sz  = r(4, 8);
      dot.style.cssText =
        'left:' + (e.clientX - sz / 2) + 'px;' +
        'top:' + (e.clientY - sz / 2) + 'px;' +
        'width:' + sz + 'px;height:' + sz + 'px;' +
        'background:' + col + ';' +
        'box-shadow:0 0 ' + (sz * 2) + 'px ' + col + ';';
      document.body.appendChild(dot);
      dot.addEventListener('animationend', function () { dot.remove(); });
    }, { passive: true });
  }

  /* ─────────────────────────────────────────
     6. CLICK BURST — particles on every click
  ───────────────────────────────────────── */
  function initClickBurst() {
    if (REDUCE) return;

    document.addEventListener('click', function (e) {
      /* Skip if clicking a button or link */
      if (e.target.closest('button, a, select, input, textarea')) {
        /* Still do a small burst on button clicks */
        burstAt(e.clientX, e.clientY, 6, true);
        return;
      }
      burstAt(e.clientX, e.clientY, 12, false);
    });

    function burstAt(x, y, count, small) {
      var wrap = document.createElement('div');
      wrap.className = 'click-burst';
      wrap.style.left = x + 'px';
      wrap.style.top  = y + 'px';
      document.body.appendChild(wrap);

      var cols = isDark()
        ? ['#00f5ff','#ff00c8','#00ff8c','#a78bfa','#ffd740','#ffffff']
        : ['#1565c0','#7b1fa2','#0288d1','#2e7d32','#e65100','#37474f'];

      for (var i = 0; i < count; i++) {
        var dot = document.createElement('div');
        dot.className = 'click-burst-dot';
        var ang = (360 / count) * i + r(-15, 15);
        var d   = small ? r(20, 45) : r(35, 80);
        var col = pick(cols);
        var sz  = small ? r(3, 5) : r(4, 7);
        dot.style.cssText =
          'width:' + sz + 'px;height:' + sz + 'px;' +
          'margin-left:' + (-sz / 2) + 'px;margin-top:' + (-sz / 2) + 'px;' +
          'background:' + col + ';' +
          'box-shadow:0 0 ' + (sz * 3) + 'px ' + col + ';' +
          '--bx:' + (Math.cos(ang * Math.PI / 180) * d) + 'px;' +
          '--by:' + (Math.sin(ang * Math.PI / 180) * d) + 'px;' +
          'animation-duration:' + r(0.5, 0.9) + 's;';
        wrap.appendChild(dot);
      }
      setTimeout(function () { wrap.remove(); }, 1000);
    }
  }

  /* ─────────────────────────────────────────
     7. HOLOGRAPHIC TILT on stat cards
  ───────────────────────────────────────── */
  function initHolographicTilt() {
    if (REDUCE || isMobile) return;

    document.querySelectorAll('.stat-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var cx   = rect.left + rect.width  / 2;
        var cy   = rect.top  + rect.height / 2;
        var dx   = (e.clientX - cx) / (rect.width  / 2);
        var dy   = (e.clientY - cy) / (rect.height / 2);
        card.style.transform =
          'translateY(-8px) scale(1.03) ' +
          'perspective(600px) ' +
          'rotateY(' + (dx * 12) + 'deg) ' +
          'rotateX(' + (-dy * 8) + 'deg)';
        card.style.boxShadow =
          isDark()
          ? '0 16px 48px rgba(0,0,0,0.35), 0 0 30px rgba(0,245,255,0.15)'
          : '0 14px 40px rgba(21,101,192,0.18)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });
  }

  /* ─────────────────────────────────────────
     8. RIPPLE on buttons
  ───────────────────────────────────────── */
  function initRipple() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('button, .cyber-link-btn');
      if (!btn) return;
      var r   = document.createElement('span');
      r.className = 'ripple';
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 2.2;
      r.style.cssText =
        'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + (e.clientX - rect.left - size / 2) + 'px;' +
        'top:' + (e.clientY - rect.top  - size / 2) + 'px;';
      btn.appendChild(r);
      r.addEventListener('animationend', function () { r.remove(); });
    });
  }

  /* ─────────────────────────────────────────
     9. COUNTER ANIMATION on stat values
  ───────────────────────────────────────── */
  function initCounters() {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el  = entry.target;
        var raw = el.textContent.trim();
        var val = parseInt(raw);
        if (isNaN(val) || val === 0) return;
        obs.unobserve(el);
        var start  = 0;
        var dur    = 900;
        var begun  = null;
        function step(ts) {
          if (!begun) begun = ts;
          var prog = Math.min((ts - begun) / dur, 1);
          var ease = 1 - Math.pow(1 - prog, 3); // cubic ease out
          el.textContent = Math.round(ease * val);
          if (prog < 1) raf(step);
          else el.textContent = val;
        }
        raf(step);
      });
    }, { threshold: 0.6 });

    function attachCounters() {
      document.querySelectorAll('.stat-value').forEach(function (el) {
        obs.observe(el);
      });
    }
    attachCounters();
    // re-attach after schedule rerenders (MutationObserver)
    var mo = new MutationObserver(attachCounters);
    var dash = document.getElementById('statsDashboard');
    if (dash) mo.observe(dash, { childList: true, subtree: true });
  }

  /* ─────────────────────────────────────────
     10. SCROLL REVEAL
  ───────────────────────────────────────── */
  function initScrollReveal() {
    if (REDUCE) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    function attachReveal() {
      document.querySelectorAll('.kegiatan-card, .stat-card').forEach(function (el) {
        io.observe(el);
      });
    }
    attachReveal();
  }

  /* ─────────────────────────────────────────
     11. MOBILE NAV ACTIVE TRACKING
  ───────────────────────────────────────── */
  function initMobileNav() {
    var btns     = document.querySelectorAll('.mobile-nav-item');
    var sections = ['header', 'scheduleSection', 'kegiatanSection'];
    function update() {
      var scroll = window.scrollY + window.innerHeight * 0.35;
      sections.forEach(function (id, i) {
        var el = id === 'header' ? document.querySelector('header') : document.getElementById(id);
        if (!el) return;
        if (scroll >= el.offsetTop && scroll < el.offsetTop + el.offsetHeight) {
          btns.forEach(function (b) { b.classList.remove('active'); });
          if (btns[i]) btns[i].classList.add('active');
        }
      });
    }
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ─────────────────────────────────────────
     12. SCROLL TO TOP BUTTON
  ───────────────────────────────────────── */
  function initScrollTop() {
    var btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 250);
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─────────────────────────────────────────
     13. THEME SWITCH FLASH + ORBS REFRESH
  ───────────────────────────────────────── */
  function initThemeSwitch() {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      document.body.classList.add('theme-switching');
      setTimeout(function () {
        document.body.classList.remove('theme-switching');
        /* Refresh orbs colors */
        var orbWrap = document.getElementById('fx-orbs');
        if (orbWrap) { orbWrap.remove(); initOrbs(); }
        var starsWrap = document.getElementById('fx-stars');
        if (starsWrap) { starsWrap.remove(); initStars(); }
      }, 500);
    });
  }

  /* ─────────────────────────────────────────
     14. TABLE ROW HOVER GLOW (dark mode)
  ───────────────────────────────────────── */
  function initTableGlow() {
    var tbl = document.getElementById('scheduleTable');
    if (!tbl) return;
    tbl.addEventListener('mouseover', function (e) {
      var row = e.target.closest('tr');
      if (!row || row.tagName === 'TH') return;
      if (!isDark()) return;
      Array.from(row.cells).forEach(function (cell) {
        cell.style.background = 'rgba(0,245,255,0.04)';
      });
    });
    tbl.addEventListener('mouseout', function (e) {
      var row = e.target.closest('tr');
      if (!row) return;
      Array.from(row.cells).forEach(function (cell) {
        cell.style.background = '';
      });
    });
  }

  /* ─────────────────────────────────────────
     15. DYNAMIC GLOW CURSOR (desktop dark only)
  ───────────────────────────────────────── */
  function initGlowCursor() {
    if (REDUCE || isMobile || !isDark()) return;
    var glow = document.createElement('div');
    glow.id = 'fx-cursor-glow';
    glow.style.cssText =
      'position:fixed;width:300px;height:300px;border-radius:50%;' +
      'pointer-events:none;z-index:-1;' +
      'background:radial-gradient(circle,rgba(0,245,255,0.04) 0%,transparent 70%);' +
      'transform:translate(-50%,-50%);transition:left 0.08s,top 0.08s;';
    document.body.appendChild(glow);
    document.addEventListener('mousemove', function (e) {
      if (!isDark()) { glow.style.display = 'none'; return; }
      glow.style.display = '';
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    }, { passive: true });
  }

  /* ─────────────────────────────────────────
     16. FLOATING CSS DOTS in background
  ───────────────────────────────────────── */
  function initFloatingDots() {
    if (REDUCE || isMobile) return;
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:-1;overflow:hidden;';
    var colors = isDark()
      ? ['rgba(0,245,255,0.25)','rgba(255,0,200,0.2)','rgba(0,255,140,0.2)','rgba(167,139,250,0.2)']
      : ['rgba(21,101,192,0.2)','rgba(123,31,162,0.15)','rgba(46,125,50,0.15)','rgba(2,136,209,0.15)'];

    for (var i = 0; i < (isMobile ? 0 : 12); i++) {
      var dot = document.createElement('div');
      var sz  = r(3, 8);
      var col = pick(colors);
      var duration = r(12, 28);
      var delay    = r(0, 15);
      dot.style.cssText =
        'position:absolute;' +
        'width:' + sz + 'px;height:' + sz + 'px;' +
        'border-radius:50%;' +
        'background:' + col + ';' +
        'box-shadow:0 0 ' + (sz * 3) + 'px ' + col + ';' +
        'left:' + r(5, 95) + '%;top:' + r(5, 95) + '%;' +
        'animation:floatDot ' + duration + 's ease-in-out ' + delay + 's infinite;';
      wrap.appendChild(dot);
    }
    document.body.insertBefore(wrap, document.body.firstChild);
  }

  /* ─────────────────────────────────────────
     INIT — run after DOM ready
  ───────────────────────────────────────── */
  function init() {
    initOrbs();
    initStars();
    initHexGrid();
    initCanvas();
    initMouseTrail();
    initClickBurst();
    initRipple();
    initCounters();
    initScrollReveal();
    initMobileNav();
    initScrollTop();
    initThemeSwitch();
    initTableGlow();
    initGlowCursor();
    initFloatingDots();

    /* Tilt waits for stat cards to exist */
    setTimeout(initHolographicTilt, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());


