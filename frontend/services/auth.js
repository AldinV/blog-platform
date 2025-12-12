(function(){
  const { navigate, parseJwt } = window.Utils;

  function saveToken(token){ try { localStorage.setItem('user_token', token); } catch(e) {} }
  function clearToken(){ try { localStorage.removeItem('user_token'); } catch(e) {} }
  function getToken(){ try { return localStorage.getItem('user_token'); } catch(e) { return null; } }
  function getUser(){ const t = getToken(); const dec = parseJwt(t); return dec && dec.user ? dec.user : null; }
  function isLoggedIn(){ return !!getUser(); }
  function isAdmin(){ const u = getUser(); return !!u && u.role === window.Constants.ADMIN_ROLE; }

  function login(email, password){
    return $.ajax({
      url: window.Constants.PROJECT_BASE_URL + 'auth/login',
      type: 'POST',
      data: JSON.stringify({ email: email, password: password }),
      contentType: 'application/json',
      dataType: 'json'
    }).done(function(result){
      const token = (result && result.token) || (result && result.data && result.data.token);
      if (!token) throw new Error('Missing token in response');
      saveToken(token);
      toastr.success('Logged in successfully');
      if (isAdmin()) navigate('/dashboard'); else navigate('/');
      updateNavbar();
    }).fail(function(xhr){
      const msg = (xhr && xhr.responseJSON && (xhr.responseJSON.error || xhr.responseJSON.message)) || 'Login failed';
      toastr.error(msg);
    });
  }

  function register(entity){
    return $.ajax({
      url: window.Constants.PROJECT_BASE_URL + 'auth/register',
      type: 'POST',
      data: JSON.stringify(entity),
      contentType: 'application/json',
      dataType: 'json'
    }).done(function(result){
      toastr.success('Registered successfully, you can login now');
      navigate('/login');
    }).fail(function(xhr){
      const msg = (xhr && xhr.responseJSON && (xhr.responseJSON.error || xhr.responseJSON.message)) || 'Registration failed';
      toastr.error(msg);
    });
  }

  function logout(){ clearToken(); toastr.info('Logged out'); updateNavbar(); navigate('/'); }

  function updateNavbar(){
    const logged = isLoggedIn();
    const nav = document.getElementById('navbar-root');
    if (!nav) return;
    const show = (sel, cond) => { document.querySelectorAll(`[data-link="${sel}"]`).forEach(a=>a.classList.toggle('d-none', !cond)); };
    show('#/login', !logged);
    show('#/register', !logged);
    show('#/dashboard', isAdmin());
    show('#/profile', logged);
    const lo = document.getElementById('nav-logout'); if (lo) lo.classList.toggle('d-none', !logged);
    const userBadge = document.getElementById('nav-user');
    const userNameEl = document.getElementById('nav-user-name');
    if (userBadge) userBadge.classList.toggle('d-none', !logged);
    if (logged && userNameEl) {
      const u = getUser();
      userNameEl.textContent = (u && (u.name || u.email)) || 'User';
    }
  }

  function bindAuthUI(){
    const btnLogin = document.getElementById('btnLogin');
    if (btnLogin){
      btnLogin.onclick = function(){
        const email = (document.getElementById('loginEmail')||{}).value || '';
        const password = (document.getElementById('loginPassword')||{}).value || '';
        login(email, password);
      };
    }
    const btnRegister = document.getElementById('btnRegister');
    if (btnRegister){
      btnRegister.onclick = function(){
        const name = (document.getElementById('regName')||{}).value || '';
        const email = (document.getElementById('regEmail')||{}).value || '';
        const password = (document.getElementById('regPassword')||{}).value || '';
        register({ name, email, password, role: window.Constants.USER_ROLE });
      };
    }
    const btnLogout = document.getElementById('nav-logout');
    if (btnLogout){ btnLogout.onclick = function(){ logout(); }; }
  }

  window.Auth = { login, register, logout, getToken, getUser, isLoggedIn, isAdmin, updateNavbar, bindAuthUI };
})();
