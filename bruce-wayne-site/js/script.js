(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- Theme ---------- */
  var toggle = document.querySelector(".theme-toggle");
  var media = window.matchMedia("(prefers-color-scheme: dark)");

  function storedTheme() {
    try { return localStorage.getItem("theme"); } catch (e) { return null; }
  }

  function saveTheme(value) {
    try { localStorage.setItem("theme", value); } catch (e) { /* storage unavailable */ }
  }

  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return media.matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var isDark = theme === "dark";
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.textContent = isDark ? "Light mode" : "Dark mode";
  }

  var saved = storedTheme();
  if (saved === "dark" || saved === "light") {
    applyTheme(saved);
  } else {
    applyTheme(currentTheme());
    root.removeAttribute("data-theme"); // follow the system until the visitor chooses
    toggle.setAttribute("aria-pressed", String(currentTheme() === "dark"));
  }

  toggle.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    saveTheme(next);
  });

  /* ---------- Copy email ---------- */
  var copyButton = document.getElementById("copy-email");
  var emailLink = document.getElementById("email-link");
  var status = document.getElementById("copy-status");
  var statusTimer;

  function showStatus(message) {
    status.textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function () { status.textContent = ""; }, 2500);
  }

  function fallbackCopy(text) {
    var field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "absolute";
    field.style.left = "-9999px";
    document.body.appendChild(field);
    field.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(field);
    return ok;
  }

  copyButton.addEventListener("click", function () {
    var address = emailLink.textContent.trim();

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(address).then(
        function () { showStatus("Copied"); },
        function () { showStatus(fallbackCopy(address) ? "Copied" : "Copy failed"); }
      );
    } else {
      showStatus(fallbackCopy(address) ? "Copied" : "Copy failed");
    }
  });

  /* ---------- Highlight current section in the nav ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  var sections = links
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          var match = link.getAttribute("href") === "#" + entry.target.id;
          if (match) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
