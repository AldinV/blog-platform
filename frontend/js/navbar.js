(function () {
  const { qs, setHTML, navigate } = window.Utils;

  function render() {
    const html = `
    <nav class="navbar navbar-expand-lg navbar-dark border-bottom">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center gap-2" href="#/">
          <i class="bi bi-journal-richtext"></i>
          <span>Blog Platform</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navCollapse" aria-controls="navCollapse" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navCollapse">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item"><a class="nav-link" data-link="#/" href="#/">Home</a></li>
            <li class="nav-item"><a class="nav-link" data-link="#/dashboard" href="#/dashboard">Dashboard</a></li>
          </ul>
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
            <li class="nav-item"><a class="nav-link" data-link="#/login" href="#/login">Login</a></li>
            <li class="nav-item"><a class="nav-link" data-link="#/register" href="#/register">Register</a></li>
            <li class="nav-item"><a class="nav-link" data-link="#/profile" href="#/profile">Profile</a></li>
            <li class="nav-item"><a class="nav-link" data-link="#/logout" href="javascript:void(0)" onclick="alert('Static mock: no auth yet.')">Logout</a></li>
          </ul>
        </div>
      </div>
    </nav>`;
    setHTML(qs('#navbar-root'), html + '<div class="gradient-bar"></div>');
  }

  function setActive(basePath) {
    const links = document.querySelectorAll('[data-link]');
    links.forEach(a => a.classList.remove('active'));
    const active = Array.from(links).find(a => {
      const href = a.getAttribute('data-link');
      if (!basePath) return false;
      return href === `#${basePath}` || href === `#${basePath}/`;
    });
    if (active) active.classList.add('active');
  }

  function init() { render(); }

  window.Components = window.Components || {};
  window.Components.Navbar = { init, setActive };
})();
