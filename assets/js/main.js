/* BE list Tour — interaksi halaman
   Semua kontak dibaca dari atribut <body data-wa / data-email / data-ig>
   supaya nomor & alamat cukup diubah di satu tempat. */
(function () {
  "use strict";

  var body = document.body;
  var WA = body.dataset.wa || "6281234567890";
  var EMAIL = body.dataset.email || "halo@belisttour.com";
  var IG = body.dataset.ig || "belisttour";

  function waLink(msg) {
    return "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
  }

  /* ---------------------------------------------------------- kontak */
  var DEFAULT_MSG =
    "Halo BE list Tour, saya ingin bertanya tentang paket tour. " +
    "Boleh dibantu informasi jadwal dan harganya?";

  document.querySelectorAll("[data-wa-link]").forEach(function (a) {
    var msg = a.dataset.waMsg || DEFAULT_MSG;
    a.href = waLink(msg);
    a.target = "_blank";
    a.rel = "noopener";
  });

  document.querySelectorAll("[data-email-link]").forEach(function (a) {
    a.href = "mailto:" + EMAIL;
    if (a.dataset.emailText === "show" && !a.textContent.trim()) a.textContent = EMAIL;
  });

  document.querySelectorAll("[data-ig-link]").forEach(function (a) {
    a.href = "https://instagram.com/" + IG;
    a.target = "_blank";
    a.rel = "noopener";
    if (a.dataset.igText === "show" && !a.textContent.trim()) a.textContent = "@" + IG;
  });

  document.querySelectorAll("[data-wa-number]").forEach(function (el) {
    var d = WA.replace(/^62/, "");
    el.textContent = d.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
  });

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ------------------------------------------------------- header/nav */
  var head = document.querySelector(".site-head");
  var toggle = document.querySelector(".nav-toggle");

  function onScroll() {
    if (!head) return;
    head.classList.toggle("is-stuck", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function closeNav() {
    body.classList.remove("nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) closeNav();
    });
  }

  /* --------------------------------------------------------- current */
  var here = location.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
  if (here === "" || here === "/") here = "/";
  document.querySelectorAll(".nav a").forEach(function (a) {
    var p = new URL(a.href, location.href).pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
    if (p === here && !a.hash) a.setAttribute("aria-current", "page");
  });

  /* ---------------------------------------------------------- reveal */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ------------------------------------------------- buka semua itinerary */
  document.querySelectorAll("[data-expand-all]").forEach(function (btn) {
    var scope = btn.closest("[data-itin]") || document;
    var days = scope.querySelectorAll(".day");
    btn.addEventListener("click", function () {
      var open = btn.dataset.state !== "open";
      days.forEach(function (d) { d.open = open; });
      btn.dataset.state = open ? "open" : "closed";
      btn.textContent = open ? "Tutup semua hari" : "Buka semua hari";
    });
  });

  /* ---------------------------------------------------------- lightbox */
  var gallery = Array.prototype.slice.call(document.querySelectorAll("[data-lb]"));
  if (gallery.length) {
    var lb = document.createElement("div");
    lb.className = "lb";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Galeri foto");
    lb.innerHTML =
      '<button class="lb-close" aria-label="Tutup galeri">' +
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M1 1l14 14M15 1L1 15" stroke="currentColor" stroke-width="1.6"/></svg></button>' +
      '<button class="lb-prev" aria-label="Foto sebelumnya">' +
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 2L4 8l6 6" stroke="currentColor" stroke-width="1.6"/></svg></button>' +
      '<img alt="">' +
      '<button class="lb-next" aria-label="Foto berikutnya">' +
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 2l6 6-6 6" stroke="currentColor" stroke-width="1.6"/></svg></button>' +
      '<p class="lb-cap"></p>';
    document.body.appendChild(lb);

    var img = lb.querySelector("img");
    var cap = lb.querySelector(".lb-cap");
    var idx = 0;
    var lastFocus = null;

    function show(i) {
      idx = (i + gallery.length) % gallery.length;
      var item = gallery[idx];
      img.src = item.dataset.lb;
      img.alt = item.dataset.cap || "";
      cap.textContent = item.dataset.cap || "";
    }
    function openLb(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add("is-open");
      document.body.style.overflow = "hidden";
      lb.querySelector(".lb-close").focus();
    }
    function closeLb() {
      lb.classList.remove("is-open");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }

    gallery.forEach(function (a, i) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        openLb(i);
      });
    });
    lb.querySelector(".lb-close").addEventListener("click", closeLb);
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "Tab") {
        var f = lb.querySelectorAll("button");
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* -------------------------------------------------------------- form */
  var form = document.querySelector("[data-inquiry]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form-status");
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var d = new FormData(form);
      var lines = [
        "Halo BE list Tour, saya ingin konsultasi paket tour.",
        "",
        "Nama: " + (d.get("nama") || "-"),
        "WhatsApp: " + (d.get("kontak") || "-"),
        "Paket: " + (d.get("paket") || "-")
      ];
      var pesan = (d.get("pesan") || "").toString().trim();
      if (pesan) lines.push("Catatan: " + pesan);
      lines.push("", "(Dikirim dari halaman " + location.pathname + ")");

      var url = waLink(lines.join("\n"));
      var win = window.open(url, "_blank", "noopener");
      if (status) {
        status.innerHTML = win
          ? "Membuka WhatsApp… pesan Anda sudah terisi otomatis. Tekan kirim di WhatsApp untuk melanjutkan."
          : 'Popup diblokir browser. <a href="' + url + '" target="_blank" rel="noopener">Buka WhatsApp manual</a>.';
      }
      if (win) form.reset();
    });
  }
})();
