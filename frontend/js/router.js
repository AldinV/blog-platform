(function () {
  const { qs, setHTML } = window.Utils;

  function parseHash() {
    const hash = location.hash.slice(1) || '/';
    const parts = hash.split('/').filter(Boolean);
    return { hash, parts };
  }

  const routes = [
    { path: '/', match: (parts) => parts.length === 0, view: 'home' },
    { path: '/login', match: (parts) => parts[0] === 'login' && parts.length === 1, view: 'login' },
    { path: '/register', match: (parts) => parts[0] === 'register' && parts.length === 1, view: 'register' },
    { path: '/post/:id', match: (parts) => parts[0] === 'post' && parts[1], view: 'postDetail', paramIndex: 1 },
    { path: '/dashboard', match: (parts) => parts[0] === 'dashboard' && parts.length === 1, view: 'dashboard' },
    { path: '/profile', match: (parts) => parts[0] === 'profile' && parts.length === 1, view: 'profile' }
  ];

  function renderRoute() {
    const { parts } = parseHash();
    const route = routes.find(r => r.match(parts));
    const root = qs('#app-root');
    if (!route) {
      setHTML(root, window.Views.notFound());
      window.Components.Navbar.setActive(null);
      return;
    }

    let param = null;
    if (route.paramIndex !== undefined) param = parts[route.paramIndex];

    const viewFn = window.Views[route.view];
    if (typeof viewFn !== 'function') {
      setHTML(root, window.Views.notFound());
    } else {
      setHTML(root, viewFn(param));
    }

    window.Components.Navbar.setActive(route.path.split('/:')[0] || route.path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function init() {
    window.addEventListener('hashchange', renderRoute);
    renderRoute();
  }

  window.Router = { init, render: renderRoute };
})();
