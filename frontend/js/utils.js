window.Utils = (function () {
  function qs(selector, scope = document) { return scope.querySelector(selector); }
  function qsa(selector, scope = document) { return Array.from(scope.querySelectorAll(selector)); }
  function setHTML(el, html) { el.innerHTML = html; }
  function navigate(path) { location.hash = path; }

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const HH = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy} ${HH}:${min}`;
    } catch { return iso; }
  }

  function slugify(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD').replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  return { qs, qsa, setHTML, navigate, formatDate, slugify };
})();
