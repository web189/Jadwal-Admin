/* =====================================================================
   OS-STYLE NOTIFICATION (mirip notif Windows/Chrome ala WhatsApp Web)
   =====================================================================
   Ini elemen HTML/CSS custom yang meniru tampilan notifikasi sistem —
   bukan Notification API asli — jadi tampilannya bisa 100% dikontrol
   (nama pengirim/situs, ikon, pesan) dan tetap konsisten di semua browser.

   Dipakai untuk 3 jenis notif, semua pakai header yang sama persis
   (ikon + nama situs + "sekarang" + gear + close), body-nya beda:
     1. kind: "promo"       -> promosi benyoriki.com (dengan tombol CTA)
     2. kind: "chat"        -> pesan grup/chat baru
     3. kind: "serahterima" -> catatan serah terima baru/berubah
   ===================================================================== */
(function () {
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
      cta = null,           // { label, url }
      secondaryLabel = null, // contoh: "Nanti"
      duration = kind === "promo" ? 0 : 6000, // 0 = tidak auto-hilang
      onClick = null,
    } = opts || {};

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
    el.querySelector(".os-notif-gear").addEventListener("click", (e) => e.stopPropagation());

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

  // ================= AUTO PROMO — sekali per sesi, muncul beberapa detik setelah load =================
  document.addEventListener("DOMContentLoaded", () => {
    if (sessionStorage.getItem("benyorikiPromoShown")) return;
    setTimeout(() => {
      if (typeof window.showOSNotification !== "function") return;
      window.showOSNotification({
        kind: "promo",
        title: "Website Bisnis Siap dalam 7 Hari",
        cta: { label: "🎯 Konsultasi Gratis Sekarang →", url: "https://benyoriki.com/" },
        secondaryLabel: "Nanti",
      });
      sessionStorage.setItem("benyorikiPromoShown", "1");
    }, 12000);
  });
})();
