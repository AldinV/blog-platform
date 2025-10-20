(function () {
  function init() {
    window.Components.Navbar.init();
    window.Router.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
