/* =====================================================================
   NOTIFIKASI GANDA:
   1) Native Notification API -> notif ASLI dari browser/Windows/Mac,
      muncul di pojok layar (seperti WhatsApp Web) walau tab di-minimize,
      SELAMA browser masih berjalan. Perlu izin user (klik tombol
      "Aktifkan Notifikasi Desktop" di menu, atau prompt otomatis).
   2) Kartu di dalam halaman (in-page) -> tetap tampil sebagai fallback
      kalau user belum kasih izin / browser tidak mendukung, sekaligus
      jadi elemen visual branded yang bisa didesain bebas.
   ===================================================================== */
(function () {
  const ICON_ABS = (function () {
    try { return new URL("favicon.png", document.baseURI).href; } catch (e) { return "favicon.png"; }
  })();
  // Ikon resolusi lebih tinggi khusus notif native, biar tidak pecah/blur
  // saat di-render besar oleh Windows/Chrome (icon-192 sudah ada di project, 0 request tambahan berat).
  const ICON_NATIVE = (function () {
    try { return new URL("icon-192.png", document.baseURI).href; } catch (e) { return ICON_ABS; }
  })();

  // Beberapa variasi copywriting promo, dirotasi tiap kali muncul biar tidak monoton/spam.
  const PROMO_VARIANTS = [
    { title: "Website Bisnis Siap dalam 7 Hari", body: "Desain modern & cepat, SEO-friendly. Konsultasi awal 100% gratis." },
    { title: "Belum Punya Website Profesional?", body: "Naikkan kelas bisnismu ke digital. Ngobrol dulu, gratis tanpa komitmen." },
    { title: "Toko Online Impian, Jadi Nyata", body: "Dari ide sampai online — kami temani dari nol sampai siap jualan." },
    { title: "Website Kekinian 2026 Untukmu", body: "Loading kilat, tampilan modern, gampang diurus sendiri. Yuk tanya-tanya." },
  ];
  let promoVariantIdx = 0;

  // ---------- Native OS/browser notification ----------
  function canUseNative() {
    return "Notification" in window;
  }

  function requestNotifPermission() {
    if (!canUseNative()) return Promise.resolve("unsupported");
    if (Notification.permission === "granted" || Notification.permission === "denied") {
      return Promise.resolve(Notification.permission);
    }
    return Notification.requestPermission();
  }

  function fireNative(title, body, opts) {
    if (!canUseNative() || Notification.permission !== "granted") return null;
    try {
      const n = new Notification(title, {
        body: body,
        icon: (opts && opts.icon) || ICON_NATIVE,
        badge: ICON_ABS,
        tag: (opts && opts.tag) || undefined,
        renotify: !!(opts && opts.tag),
        silent: false,
      });
      n.onclick = () => {
        window.focus();
        if (opts && typeof opts.onClick === "function") opts.onClick();
        n.close();
      };
      setTimeout(() => n.close(), 8000);
      return n;
    } catch (e) {
      return null;
    }
  }

  window.requestNotifPermission = requestNotifPermission;

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("enableNotifBtn");
    if (!btn) return;
    const setLabel = () => {
      if (!canUseNative()) { btn.innerHTML = '<i class="fas fa-bell-slash"></i> Notifikasi Tidak Didukung'; btn.disabled = true; return; }
      if (Notification.permission === "granted") btn.innerHTML = '<i class="fas fa-check"></i> Notifikasi Desktop Aktif';
      else if (Notification.permission === "denied") btn.innerHTML = '<i class="fas fa-bell-slash"></i> Notifikasi Diblokir Browser';
      else btn.innerHTML = '<i class="fas fa-bell"></i> Aktifkan Notifikasi Desktop';
    };
    setLabel();
    btn.addEventListener("click", () => {
      requestNotifPermission().then(() => {
        setLabel();
        if (Notification.permission === "granted") {
          fireNative("BENYORIKI.COM", "Notifikasi desktop aktif ✅", {});
          if (window.showToast) window.showToast("🔔 Notifikasi desktop diaktifkan!");
        }
      });
    });
  });

  // ---------- In-page styled card ----------
  function dismiss(el) {
    if (!el || el.dataset.closing) return;
    el.dataset.closing = "1";
    el.classList.remove("show");
    setTimeout(() => el.remove(), 350);
  }

  window.showOSNotification = function (opts) {
    const {
      kind = "info",
      site = "BENYORIKI.COM",
      icon = "favicon.png",
      title = "",
      lines = [],
      cta = null,
      secondaryLabel = null,
      duration = kind === "promo" ? 0 : 6000,
      onClick = null,
      nativeTag = null,
      nativeBody = null, // teks body khusus utk notif native, biar tidak duplikat sama title
    } = opts || {};

    // 1) Coba tembak notifikasi ASLI (kalau user sudah kasih izin)
    const plainBody = nativeBody
      ? nativeBody
      : lines.length
      ? lines.map((l) => l.replace(/<[^>]+>/g, "")).join(" • ")
      : "";
    fireNative(title || site, plainBody, { tag: nativeTag || kind, onClick });

    // 2) Tetap tampilkan kartu in-page (branding + tombol custom)
    const old = document.getElementById("osNotifPopup");
    if (old) old.remove();

    const shownLines = lines.slice(0, 4);
    const extra = lines.length - shownLines.length;

    const el = document.createElement("div");
    el.id = "osNotifPopup";
    el.className = "os-notif-popup os-notif-" + kind;

    let bodyHtml = "";
    if (kind === "promo") {
      bodyHtml = `
        <span class="os-notif-promo-badge">PROMO</span>
        <div class="os-notif-promo-row">
          <div class="os-notif-promo-icon">🚀</div>
          <div class="os-notif-promo-title">${title}</div>
        </div>
        <div class="os-notif-promo-actions">
          ${cta ? `<button type="button" class="os-notif-cta">${cta.label}</button>` : ""}
          ${secondaryLabel ? `<button type="button" class="os-notif-later">${secondaryLabel}</button>` : ""}
        </div>
      `;
    } else {
      bodyHtml = `
        ${title ? `<div class="os-notif-title">${title}</div>` : ""}
        ${shownLines.map((l) => `<div class="os-notif-line">${l}</div>`).join("")}
        ${extra > 0 ? `<div class="os-notif-more">+${extra} lainnya</div>` : ""}
      `;
    }

    el.innerHTML = `
      <div class="os-notif-head">
        <img src="${icon}" class="os-notif-icon" alt="">
        <span class="os-notif-site">${site}</span>
        <span class="os-notif-time">sekarang</span>
        <div class="os-notif-actions">
          <button type="button" class="os-notif-gear" aria-label="Pengaturan"><i class="fas fa-cog"></i></button>
          <button type="button" class="os-notif-close-btn" aria-label="Tutup">&times;</button>
        </div>
      </div>
      <div class="os-notif-body">${bodyHtml}</div>
    `;

    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));

    let timer = null;
    if (duration > 0) timer = setTimeout(() => dismiss(el), duration);

    el.querySelector(".os-notif-close-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      if (timer) clearTimeout(timer);
      dismiss(el);
    });
    el.querySelector(".os-notif-gear").addEventListener("click", (e) => {
      e.stopPropagation();
      requestNotifPermission();
    });

    const ctaBtn = el.querySelector(".os-notif-cta");
    if (ctaBtn && cta) {
      ctaBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        window.open(cta.url, "_blank", "noopener");
        dismiss(el);
      });
    }
    const laterBtn = el.querySelector(".os-notif-later");
    if (laterBtn) {
      laterBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (timer) clearTimeout(timer);
        dismiss(el);
      });
    }

    el.querySelector(".os-notif-body").addEventListener("click", () => {
      if (timer) clearTimeout(timer);
      dismiss(el);
      if (typeof onClick === "function") onClick();
    });

    return el;
  };

  // ================= AUTO PROMO — tiap 5 menit selama tab terbuka =================
  document.addEventListener("DOMContentLoaded", () => {
    function fireBenyorikiPromo() {
      if (typeof window.showOSNotification !== "function") return;
      const variant = PROMO_VARIANTS[promoVariantIdx % PROMO_VARIANTS.length];
      promoVariantIdx++;
      window.showOSNotification({
        kind: "promo",
        title: variant.title,
        nativeBody: variant.body,
        cta: { label: "🎯 Konsultasi Gratis Sekarang →", url: "https://benyoriki.com/" },
        secondaryLabel: "Nanti",
        nativeTag: "promo-" + Date.now(), // tag unik supaya tiap notif native baru tetap muncul, tidak ke-replace diam2
      });
    }
    const PROMO_INTERVAL_MS = 5 * 60 * 1000; // 5 menit
    setTimeout(fireBenyorikiPromo, 8000);           // notif pertama, 8 detik setelah web dibuka
    setInterval(fireBenyorikiPromo, PROMO_INTERVAL_MS); // lalu berulang tiap 5 menit
  });
})();
