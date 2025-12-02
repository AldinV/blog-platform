(function () {
  const { formatDate, slugify } = window.Utils;
  const { posts, comments, tagsForPost, author, category } = window.MockData;

  function nextId(arr) { return (arr.reduce((m, x) => Math.max(m, Number(x.id)||0), 0) + 1); }
  function escape(s){
    return String(s||'')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  window.ViewsActions = {
    newPost: function () {
      const cats = window.MockData.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      const users = window.MockData.users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
      const body = `
        <div class="form-floating mb-2"><input id="fTitle" class="form-control" placeholder="Title"><label for="fTitle">Title</label></div>
        <div class="form-floating mb-2"><select id="fCategory" class="form-select">${cats}</select><label for="fCategory">Category</label></div>
        <div class="form-floating mb-2"><select id="fAuthor" class="form-select">${users}</select><label for="fAuthor">Author</label></div>
        <div class="form-floating"><textarea id="fContent" class="form-control" style="height:140px" placeholder="Content"></textarea><label for="fContent">Content</label></div>`;
      Modal.open({
        title: 'New Post',
        body,
        buttons: [
          { label: 'Cancel', class: 'btn btn-secondary', attrs: { 'data-bs-dismiss': 'modal' } },
          { label: 'Create', class: 'btn btn-brand', onClick: function(){
              const p = {
                id: nextId(window.MockData.posts),
                author_id: Number(document.getElementById('fAuthor').value),
                title: document.getElementById('fTitle').value.trim(),
                content: document.getElementById('fContent').value.trim(),
                category_id: Number(document.getElementById('fCategory').value),
                created_at: new Date().toISOString()
              };
              window.MockData.posts.push(p);
              document.querySelector('#app-modal .btn-close').click();
              window.Router.render();
          }}
        ]
      });
    },
    editPost: function (id) {
      const p = window.MockData.posts.find(x => x.id === id);
      if (!p) return;
      const cats = window.MockData.categories.map(c => `<option value="${c.id}" ${c.id===p.category_id?'selected':''}>${c.name}</option>`).join('');
      const users = window.MockData.users.map(u => `<option value="${u.id}" ${u.id===p.author_id?'selected':''}>${u.name}</option>`).join('');
      const body = `
        <div class="form-floating mb-2"><input id="fTitle" class="form-control" value="${p.title.replace(/"/g,'&quot;')}" placeholder="Title"><label for="fTitle">Title</label></div>
        <div class="form-floating mb-2"><select id="fCategory" class="form-select">${cats}</select><label for="fCategory">Category</label></div>
        <div class="form-floating mb-2"><select id="fAuthor" class="form-select">${users}</select><label for="fAuthor">Author</label></div>
        <div class="form-floating"><textarea id="fContent" class="form-control" style="height:140px" placeholder="Content">${p.content.replace(/</g,'&lt;')}</textarea><label for="fContent">Content</label></div>`;
      Modal.open({
        title: 'Edit Post',
        body,
        buttons: [
          { label: 'Cancel', class: 'btn btn-secondary', attrs: { 'data-bs-dismiss': 'modal' } },
          { label: 'Save', class: 'btn btn-brand', onClick: function(){
              p.author_id = Number(document.getElementById('fAuthor').value);
              p.title = document.getElementById('fTitle').value.trim();
              p.content = document.getElementById('fContent').value.trim();
              p.category_id = Number(document.getElementById('fCategory').value);
              document.querySelector('#app-modal .btn-close').click();
              window.Router.render();
          }}
        ]
      });
    },
    deletePost: function (id) {
      Modal.open({
        title: 'Delete Post',
        body: 'Are you sure you want to delete this post?',
        buttons: [
          { label: 'Cancel', class: 'btn btn-secondary', attrs: { 'data-bs-dismiss': 'modal' } },
          { label: 'Delete', class: 'btn btn-outline-danger', onClick: function(){
              const i = window.MockData.posts.findIndex(x => x.id === id);
              if (i>=0) window.MockData.posts.splice(i,1);
              document.querySelector('#app-modal .btn-close').click();
              window.Router.render();
          }}
        ]
      });
    },
    newCategory: function(){
      Modal.open({
        title: 'New Category',
        body: '<div class="form-floating"><input id="cName" class="form-control" placeholder="Name"><label for="cName">Name</label></div>',
        buttons: [
          { label: 'Cancel', class: 'btn btn-secondary', attrs: { 'data-bs-dismiss': 'modal' } },
          { label: 'Create', class: 'btn btn-brand', onClick: function(){
              var name = (document.getElementById('cName')||{}).value || '';
              if (!name.trim()) { toastr.warning('Name is required'); return; }
              CategoriesService.create({ name: name.trim() })
                .done(function(){ toastr.success('Category created'); document.querySelector('#app-modal .btn-close').click(); if (window.ViewsHydrate && window.ViewsHydrate.dashboard) window.ViewsHydrate.dashboard(); })
                .fail(function(xhr){ var msg=(xhr&&xhr.responseJSON&&(xhr.responseJSON.error||xhr.responseJSON.message))||'Create failed'; toastr.error(msg); });
          }}
        ]
      });
    },
    editCategory: function(id){
      CategoriesService.getById(id)
        .done(function(c){
          if (!c) { toastr.error('Category not found'); return; }
          var safeName = String(c.name||'').replace(/"/g,'&quot;');
          Modal.open({
            title: 'Edit Category',
            body: `<div class="form-floating"><input id="cName" class="form-control" value="${safeName}" placeholder="Name"><label for="cName">Name</label></div>`,
            buttons: [
              { label: 'Cancel', class: 'btn btn-secondary', attrs: { 'data-bs-dismiss': 'modal' } },
              { label: 'Save', class: 'btn btn-brand', onClick: function(){
                  var name = (document.getElementById('cName')||{}).value || '';
                  if (!name.trim()) { toastr.warning('Name is required'); return; }
                  CategoriesService.update(id, { name: name.trim() })
                    .done(function(){ toastr.success('Category updated'); document.querySelector('#app-modal .btn-close').click(); if (window.ViewsHydrate && window.ViewsHydrate.dashboard) window.ViewsHydrate.dashboard(); })
                    .fail(function(xhr){ var msg=(xhr&&xhr.responseJSON&&(xhr.responseJSON.error||xhr.responseJSON.message))||'Update failed'; toastr.error(msg); });
              }}
            ]
          });
        })
        .fail(function(xhr){ var msg=(xhr&&xhr.responseJSON&&(xhr.responseJSON.error||xhr.responseJSON.message))||'Load failed'; toastr.error(msg); });
    },
    deleteCategory: function(id){
      Modal.open({
        title: 'Delete Category',
        body: 'Are you sure you want to delete this category?',
        buttons: [
          { label: 'Cancel', class: 'btn btn-secondary', attrs: { 'data-bs-dismiss': 'modal' } },
          { label: 'Delete', class: 'btn btn-outline-danger', onClick: function(){
              CategoriesService.remove(id)
                .done(function(){ toastr.success('Category deleted'); document.querySelector('#app-modal .btn-close').click(); if (window.ViewsHydrate && window.ViewsHydrate.dashboard) window.ViewsHydrate.dashboard(); })
                .fail(function(xhr){
                  var raw = (xhr && xhr.responseJSON && (xhr.responseJSON.message || xhr.responseJSON.error)) || (xhr && xhr.responseText) || '';
                  var s = String(raw || '');
                  var msg = 'Delete failed';
                  if (/foreign key/i.test(s) || /Integrity constraint violation/i.test(s) || /\b1451\b/.test(s)) {
                    msg = 'Cannot delete this category because it has posts. Please reassign or delete those posts first.';
                  } else if (s) {
                    msg = s;
                  }
                  toastr.error(msg);
                });
          }}
        ]
      });
    },
    newTag: function(){
      Modal.open({
        title: 'New Tag',
        body: '<div class="form-floating"><input id="tName" class="form-control" placeholder="tag"><label for="tName">Tag</label></div>',
        buttons: [
          { label: 'Cancel', class: 'btn btn-secondary', attrs: { 'data-bs-dismiss': 'modal' } },
          { label: 'Create', class: 'btn btn-brand', onClick: function(){
              var name = (document.getElementById('tName')||{}).value || '';
              if (!name.trim()) { toastr.warning('Tag is required'); return; }
              TagsService.create({ name: name.trim() })
                .done(function(){ toastr.success('Tag created'); document.querySelector('#app-modal .btn-close').click(); if (window.ViewsHydrate && window.ViewsHydrate.dashboard) window.ViewsHydrate.dashboard(); })
                .fail(function(xhr){ var msg=(xhr&&xhr.responseJSON&&(xhr.responseJSON.error||xhr.responseJSON.message))||'Create failed'; toastr.error(msg); });
          }}
        ]
      });
    },
    editTag: function(id){
      TagsService.getById(id)
        .done(function(t){
          if (!t) { toastr.error('Tag not found'); return; }
          var safeName = String(t.name||'').replace(/"/g,'&quot;');
          Modal.open({
            title: 'Edit Tag',
            body: `<div class="form-floating"><input id="tName" class="form-control" value="${safeName}" placeholder="tag"><label for="tName">Tag</label></div>`,
            buttons: [
              { label: 'Cancel', class: 'btn btn-secondary', attrs: { 'data-bs-dismiss': 'modal' } },
              { label: 'Save', class: 'btn btn-brand', onClick: function(){
                  var name = (document.getElementById('tName')||{}).value || '';
                  if (!name.trim()) { toastr.warning('Tag is required'); return; }
                  TagsService.update(id, { name: name.trim() })
                    .done(function(){ toastr.success('Tag updated'); document.querySelector('#app-modal .btn-close').click(); if (window.ViewsHydrate && window.ViewsHydrate.dashboard) window.ViewsHydrate.dashboard(); })
                    .fail(function(xhr){ var msg=(xhr&&xhr.responseJSON&&(xhr.responseJSON.error||xhr.responseJSON.message))||'Update failed'; toastr.error(msg); });
              }}
            ]
          });
        })
        .fail(function(xhr){ var msg=(xhr&&xhr.responseJSON&&(xhr.responseJSON.error||xhr.responseJSON.message))||'Load failed'; toastr.error(msg); });
    },
    deleteTag: function(id){
      Modal.open({
        title: 'Delete Tag',
        body: 'Are you sure you want to delete this tag?',
        buttons: [
          { label: 'Cancel', class: 'btn btn-secondary', attrs: { 'data-bs-dismiss': 'modal' } },
          { label: 'Delete', class: 'btn btn-outline-danger', onClick: function(){
              TagsService.remove(id)
                .done(function(){ toastr.success('Tag deleted'); document.querySelector('#app-modal .btn-close').click(); if (window.ViewsHydrate && window.ViewsHydrate.dashboard) window.ViewsHydrate.dashboard(); })
                .fail(function(xhr){
                  var raw = (xhr && xhr.responseJSON && (xhr.responseJSON.message || xhr.responseJSON.error)) || (xhr && xhr.responseText) || '';
                  var s = String(raw || '');
                  var msg = 'Delete failed';
                  if (/foreign key/i.test(s) || /Integrity constraint violation/i.test(s) || /\b1451\b/.test(s)) {
                    msg = 'Cannot delete this tag because it is used by posts. Remove it from posts first.';
                  } else if (s) {
                    msg = s;
                  }
                  toastr.error(msg);
                });
          }}
        ]
      });
    },
    changeUserRole: function(id){
      UsersService.getById(id)
        .done(function(u){
          if (!u) { toastr.error('User not found'); return; }
          const body = `<div class=\"form-floating\"><select id=\"uRole\" class=\"form-select\">${['admin','user'].map(r=>`<option value=\"${r}\" ${u.role===r?'selected':''}>${r}</option>`).join('')}</select><label for=\"uRole\">Role</label></div>`;

          Modal.open({
            title: 'Change Role',
            body,
            buttons: [
              { label: 'Cancel', class: 'btn btn-secondary', attrs: { 'data-bs-dismiss': 'modal' } },
              { label: 'Save', class: 'btn btn-brand', onClick: function(){
                  var role = document.getElementById('uRole').value;
                  UsersService.update(id, { role: role })
                    .done(function(){ toastr.success('Role updated'); document.querySelector('#app-modal .btn-close').click(); if (window.ViewsHydrate && window.ViewsHydrate.dashboard) window.ViewsHydrate.dashboard(); })
                    .fail(function(xhr){ var msg=(xhr&&xhr.responseJSON&&(xhr.responseJSON.error||xhr.responseJSON.message))||'Update failed'; toastr.error(msg); });
              }}
            ]
          });
        })
        .fail(function(xhr){ var msg=(xhr&&xhr.responseJSON&&(xhr.responseJSON.error||xhr.responseJSON.message))||'Load failed'; toastr.error(msg); });
    },

    deleteUser: function(id){
      UsersService.getById(id)
        .done(function(u){
          if (!u) { toastr.error('User not found'); return; }
          Modal.open({
            title: 'Delete User',
            body: `Are you sure you want to delete ${u.name || 'this user'}?`,
            buttons: [
              { label: 'Cancel', class: 'btn btn-secondary', attrs: { 'data-bs-dismiss': 'modal' } },
              { label: 'Delete', class: 'btn btn-outline-danger', onClick: function(){
                  UsersService.remove(id)
                    .done(function(){ toastr.success('User deleted'); document.querySelector('#app-modal .btn-close').click(); if (window.ViewsHydrate && window.ViewsHydrate.dashboard) window.ViewsHydrate.dashboard(); })
                    .fail(function(xhr){
                      var raw = (xhr && xhr.responseJSON && (xhr.responseJSON.message || xhr.responseJSON.error)) || (xhr && xhr.responseText) || '';
                      var s = String(raw || '');
                      var msg = 'Delete failed';
                      if (/foreign key/i.test(s) || /Integrity constraint violation/i.test(s) || /\b1451\b/.test(s)) {
                        msg = 'Cannot delete this user because it is referenced by other records.';
                      } else if (s) { msg = s; }
                      toastr.error(msg);
                    });
              }}
            ]
          });
        })
        .fail(function(xhr){ var msg=(xhr&&xhr.responseJSON&&(xhr.responseJSON.error||xhr.responseJSON.message))||'Load failed'; toastr.error(msg); });
    },

    newUser: function(){
      const body = `
        <div class="form-floating mb-2"><input id="uName" class="form-control" placeholder="Full name"><label for="uName">Full name</label></div>
        <div class="form-floating mb-2"><input id="uEmail" class="form-control" placeholder="you@example.com"><label for="uEmail">Email</label></div>
        <div class="form-floating mb-2"><input id="uPassword" type="password" class="form-control" placeholder="Password"><label for="uPassword">Password</label></div>
        <div class="form-floating mb-2"><select id="uRoleNew" class="form-select"><option value="user">user</option><option value="admin">admin</option></select><label for="uRoleNew">Role</label></div>`;
      Modal.open({
        title: 'New User',
        body,
        buttons: [
          { label: 'Cancel', class: 'btn btn-secondary', attrs: { 'data-bs-dismiss': 'modal' } },
          { label: 'Add', class: 'btn btn-brand', onClick: function(){
              var name = (document.getElementById('uName')||{}).value || '';
              var email = (document.getElementById('uEmail')||{}).value || '';
              var password = (document.getElementById('uPassword')||{}).value || '';
              var role = (document.getElementById('uRoleNew')||{}).value || 'user';
              if (!name.trim() || !email.trim() || !password) { toastr.warning('Name, email and password are required'); return; }
              // Create via auth/register so backend hashes the password
              $.ajax({
                url: window.Constants.PROJECT_BASE_URL + 'auth/register',
                type: 'POST',
                data: JSON.stringify({ name: name.trim(), email: email.trim(), password: password, role: window.Constants.USER_ROLE }),
                contentType: 'application/json',
                dataType: 'json'
              }).done(function(){
                // If admin selected, upgrade role after creation
                if (role === 'admin') {
                  RestClient.get('users/by-email?email=' + encodeURIComponent(email.trim()), function(u){
                    if (u && u.id) {
                      UsersService.update(u.id, { role: 'admin' })
                        .always(function(){ toastr.success('User created'); document.querySelector('#app-modal .btn-close').click(); if (window.ViewsHydrate && window.ViewsHydrate.dashboard) window.ViewsHydrate.dashboard(); });
                    } else {
                      toastr.success('User created'); document.querySelector('#app-modal .btn-close').click(); if (window.ViewsHydrate && window.ViewsHydrate.dashboard) window.ViewsHydrate.dashboard();
                    }
                  }, function(){
                    toastr.success('User created'); document.querySelector('#app-modal .btn-close').click(); if (window.ViewsHydrate && window.ViewsHydrate.dashboard) window.ViewsHydrate.dashboard();
                  });
                } else {
                  toastr.success('User created'); document.querySelector('#app-modal .btn-close').click(); if (window.ViewsHydrate && window.ViewsHydrate.dashboard) window.ViewsHydrate.dashboard();
                }
              }).fail(function(xhr){
                var raw = (xhr && xhr.responseJSON && (xhr.responseJSON.message || xhr.responseJSON.error)) || (xhr && xhr.responseText) || '';
                var s = String(raw || '');
                var msg = 'Create failed';
                if (/duplicate/i.test(s) || /unique/i.test(s) || /\b1062\b/.test(s) || /already in use/i.test(s)) { msg = 'A user with this email already exists.'; }
                else if (/required/i.test(s) && /password/i.test(s)) { msg = 'Password is required.'; }
                else if (s) { msg = s; }
                toastr.error(msg);
              });
          }}
        ]
      });
    },

    approveComment: function(id){
      const c = window.MockData.comments.find(x=>x.id===id); if(!c) return;
      c.status = 'visible'; window.Router.render();
    },
    hideComment: function(id){
      const c = window.MockData.comments.find(x=>x.id===id); if(!c) return;
      c.status = 'hidden'; window.Router.render();
    },
    deleteComment: function(id){
      const i = window.MockData.comments.findIndex(x=>x.id===id); if(i<0) return;
      window.MockData.comments.splice(i,1); window.Router.render();
    }
  };

  function layoutPage(title, bodyHtml) {
    return `
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h1 class="h3 m-0">${title}</h1>
      </div>
      ${bodyHtml}
    `;
  }

  function home() {
    const hero = `
      <section class="hero mb-4">
        <div class="row align-items-center g-4">
          <div class="col-lg-7">
            <div class="kicker">Welcome</div>
            <h1 class="h3 mb-2">Stories, guides, and insights for curious minds</h1>
            <p class="subtitle mb-3">This is more than a blog, it's a conversation. Engage with a diverse community and broaden your perspective.</p>
          </div>
          <div class="col-lg-5 d-none d-lg-block">
            <div class="glass p-3">
              <img src="./assets/hero-illustration.png" alt="Hero" class="img-fluid rounded" onerror="this.style.display='none'">
            </div>
          </div>
        </div>
      </section>`;

    if (!window.Auth || !window.Auth.isLoggedIn()) {
      return `
        ${hero}
        <div class="glass p-4">
          <div class="h5 mb-2">Explore the platform</div>
          <div class="meta">Please login or register to view posts and interact with content.</div>
          <div class="mt-3 d-flex gap-2">
            <a class="btn btn-brand" href="#/login">Login</a>
            <a class="btn btn-outline-light" href="#/register">Register</a>
          </div>
        </div>
      `;
    }

    return `
      ${hero}
      <h2 class="h5 mb-3">Latest Posts</h2>
      <div class="row g-3"><div class="meta">Loading posts…</div></div>
    `;
  }

  function postDetail(id) {
    const post = posts.find(p => String(p.id) === String(id));
    if (!post) return notFound();
    const postTags = tagsForPost(post.id).map(t => `<span class="chip me-1"><span class="dot"></span>#${t.name}</span>`).join('');
    const postAuthor = author(post.author_id)?.name || 'Unknown';
    const cat = category(post.category_id)?.name || 'General';
    const catSlug = slugify(cat);
    const banner = `./assets/categories/${catSlug}-banner.jpg`;

    const postComments = comments.filter(c => c.post_id === post.id).map(c => {
      const u = author(c.user_id)?.name || 'User';
      return `<div class="comment p-3 mb-2">
        <div class="small meta mb-1"><i class="bi bi-person-circle me-1"></i>${u} • <i class="bi bi-clock-history ms-2 me-1"></i>${formatDate(c.created_at)}</div>
        <div>${c.content}</div>
      </div>`;
    }).join('');

    return `
      <section class="mb-4">
        <div class="glass overflow-hidden">
          <img src="${banner}" alt="${post.title}" class="w-100" style="max-height:300px;object-fit:cover" onerror="this.style.display='none'">
          <div class="p-4">
            <div class="small meta mb-2">By ${postAuthor} • ${formatDate(post.created_at)}</div>
            <h1 class="h3 mb-2">${post.title}</h1>
            <div class="mb-3">${postTags}</div>
            <div>${post.content}</div>
          </div>
        </div>
      </section>
      <section>
        <h3 class="h5">Comments</h3>
        ${postComments || '<div class="meta">No comments yet.</div>'}
        <div class="mt-3 glass p-3">
          <div class="form-floating mb-2">
            <textarea class="form-control" placeholder="Leave a comment" id="commentText" style="height: 100px"></textarea>
            <label for="commentText">Leave a comment</label>
          </div>
          <button class="btn btn-brand" onclick="alert('To be implemented')">Submit</button>
        </div>
      </section>
    `;
  }

  function login() {
    return `
      <div class="col-md-8 col-lg-6 col-xl-5 mx-auto">
        <div class="glass p-4 p-md-5">
          <div class="text-center mb-4">
            <h2 class="h3">Welcome Back!</h2>
            <p class="meta">Sign in to continue.</p>
          </div>
          <form>
            <div class="form-floating mb-3">
              <input type="email" class="form-control" id="loginEmail" placeholder="name@example.com">
              <label for="loginEmail">Email address</label>
            </div>
            <div class="form-floating mb-2">
              <input type="password" class="form-control" id="loginPassword" placeholder="Password">
              <label for="loginPassword">Password</label>
            </div>
            <button type="button" class="btn btn-brand w-100" id="btnLogin">
              <i class="bi bi-box-arrow-in-right me-2"></i>Login
            </button>
          </form>
          <div class="text-center meta mt-4">
            Don't have an account? <a href="#/register">Create one</a>
          </div>
        </div>
      </div>
    `;
  }

  function register() {
    return `
      <div class="col-md-8 col-lg-6 col-xl-5 mx-auto">
        <div class="glass p-4 p-md-5">
          <div class="text-center mb-4">
            <h2 class="h3">Create Your Account</h2>
            <p class="meta">Join our community of creators and readers.</p>
          </div>
          <form>
            <div class="form-floating mb-3">
              <input type="text" class="form-control" id="regName" placeholder="Jane Doe">
              <label for="regName">Full name</label>
            </div>
            <div class="form-floating mb-3">
              <input type="email" class="form-control" id="regEmail" placeholder="name@example.com">
              <label for="regEmail">Email address</label>
            </div>
            <div class="form-floating mb-3">
              <input type="password" class="form-control" id="regPassword" placeholder="Password">
              <label for="regPassword">Password</label>
            </div>
            <button type="button" class="btn btn-brand w-100" id="btnRegister">
              <i class="bi bi-person-plus-fill me-2"></i>Create Account
            </button>
          </form>
          <div class="text-center meta mt-4">
            Already have an account? <a href="#/login">Sign in</a>
          </div>
        </div>
      </div>
    `;
  }

  function dashboard() {
    const { posts, users, categories, tags, comments } = window.MockData;
    const rowsPosts = posts.map(p => {
      const cat = categories.find(c => c.id === p.category_id)?.name || 'General';
      const au = users.find(u => u.id === p.author_id)?.name || 'Unknown';
      return `<tr>
        <td>${p.id}</td>
        <td>${p.title}</td>
        <td>${cat}</td>
        <td>${au}</td>
        <td>${formatDate(p.created_at)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-light me-2" onclick="ViewsActions.editPost(${p.id})">Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick="ViewsActions.deletePost(${p.id})">Delete</button>
        </td>
      </tr>`;
    }).join('');

    const rowsCategories = '<tr><td colspan="4" class="text-center meta">Loading…</td></tr>';
    const rowsTags = '<tr><td colspan="4" class="text-center meta">Loading…</td></tr>';

    const rowsUsers = '<tr><td colspan="6" class="text-center meta">Loading…</td></tr>';

    const rowsComments = comments.map(c => {
      const p = posts.find(x => x.id === c.post_id);
      const u = users.find(x => x.id === c.user_id);
      const text = escape(c.content);
      const snippet = text.length > 100 ? text.slice(0,100) + '…' : text;
      return `<tr>
        <td>${c.id}</td>
        <td>${p ? p.title : 'Post ' + c.post_id}</td>
        <td>${u ? u.name : 'User ' + c.user_id}</td>
        <td class="small">${snippet}</td>
        <td>${formatDate(c.created_at)}</td>
        <td><span class="badge ${c.status === 'visible' ? 'bg-success' : 'bg-warning'} text-uppercase">${c.status}</span></td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-light me-2" onclick="ViewsActions.approveComment(${c.id})">Approve</button>
          <button class="btn btn-sm btn-outline-warning me-2" onclick="ViewsActions.hideComment(${c.id})">Hide</button>
          <button class="btn btn-sm btn-outline-danger" onclick="ViewsActions.deleteComment(${c.id})">Delete</button>
        </td>
      </tr>`;
    }).join('');

    return layoutPage('Dashboard', `
      <div class="glass p-3 mb-3 d-flex justify-content-between align-items-center">
        <div>
          <div class="kicker">Admin</div>
          <div class="h5 m-0">Content management</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-brand" onclick="ViewsActions.newPost()">New Post</button>
          <button class="btn btn-outline-light" onclick="ViewsActions.newCategory()">New Category</button>
          <button class="btn btn-outline-light" onclick="ViewsActions.newTag()">New Tag</button>
        </div>
      </div>

      <ul class="nav nav-tabs mb-3" role="tablist">
        <li class="nav-item" role="presentation"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-posts" type="button" role="tab">Posts</button></li>
        <li class="nav-item" role="presentation"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-categories" type="button" role="tab">Categories</button></li>
        <li class="nav-item" role="presentation"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-tags" type="button" role="tab">Tags</button></li>
        <li class="nav-item" role="presentation"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-users" type="button" role="tab">Users</button></li>
        <li class="nav-item" role="presentation"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-comments" type="button" role="tab">Comments</button></li>
      </ul>

      <div class="tab-content">
        <div class="tab-pane fade show active" id="tab-posts" role="tabpanel">
          <div class="card">
            <div class="table-responsive">
              <table class="table table-dark table-hover align-middle m-0">
                <thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Author</th><th>Created</th><th class="text-end">Actions</th></tr></thead>
                <tbody>${rowsPosts || '<tr><td colspan="6" class="text-center meta">No posts.</td></tr>'}</tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="tab-pane fade" id="tab-categories" role="tabpanel">
          <div class="d-flex justify-content-end mb-2"><button class="btn btn-brand" onclick="ViewsActions.newCategory()">Add Category</button></div>
          <div class="card">
            <div class="table-responsive">
              <table class="table table-dark table-hover align-middle m-0">
                <thead><tr><th>ID</th><th>Name</th><th>Created</th><th class="text-end">Actions</th></tr></thead>
                <tbody id="tbl-categories-body">${rowsCategories}</tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="tab-pane fade" id="tab-tags" role="tabpanel">
          <div class="d-flex justify-content-end mb-2"><button class="btn btn-brand" onclick="ViewsActions.newTag()">Add Tag</button></div>
          <div class="card">
            <div class="table-responsive">
              <table class="table table-dark table-hover align-middle m-0">
                <thead><tr><th>ID</th><th>Tag</th><th>Created</th><th class="text-end">Actions</th></tr></thead>
                <tbody id="tbl-tags-body">${rowsTags}</tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="tab-pane fade" id="tab-users" role="tabpanel">
          <div class="d-flex justify-content-end mb-2"><button class="btn btn-brand" onclick="ViewsActions.newUser()">New User</button></div>
          <div class="card">
            <div class="table-responsive">
              <table class="table table-dark table-hover align-middle m-0">
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Created</th><th class="text-end">Actions</th></tr></thead>
                <tbody id="tbl-users-body">${rowsUsers}</tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="tab-pane fade" id="tab-comments" role="tabpanel">
          <div class="card">
            <div class="table-responsive">
              <table class="table table-dark table-hover align-middle m-0">
                <thead><tr><th>ID</th><th>Post</th><th>User</th><th>Content</th><th>Created</th><th>Status</th><th class="text-end">Actions</th></tr></thead>
                <tbody>${rowsComments || '<tr><td colspan="7" class="text-center meta">No comments.</td></tr>'}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `);
  }

  function profile() {
    return `
      <div class="col-md-8 col-lg-6 col-xl-5 mx-auto">
        <div class="glass p-4 p-md-5">
          <div class="text-center mb-4">
            <h2 class="h3">Your Profile</h2>
            <p class="meta">Manage your account details.</p>
          </div>
          <form>
            <div class="row g-3">
              <div class="col-md-6">
                <div class="form-floating mb-3 mb-md-0">
                  <input type="text" class="form-control" id="pName" placeholder="Your name" value="Jane Doe">
                  <label for="pName">Full name</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating">
                  <input type="email" class="form-control" id="pEmail" placeholder="you@example.com" value="jane.doe@example.com">
                  <label for="pEmail">Email</label>
                </div>
              </div>
            </div>
            <hr class="my-4">
            <div class="row g-3">
              <div class="col-md-6">
                <div class="form-floating">
                  <input type="password" class="form-control" id="pPassword" placeholder="New password">
                  <label for="pPassword">New Password</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating">
                  <input type="password" class="form-control" id="pConfirmPassword" placeholder="Confirm new password">
                  <label for="pConfirmPassword">Confirm New Password</label>
                </div>
              </div>
            </div>
            <div class="mt-4">
              <button type="button" class="btn btn-brand w-100" onclick="alert('To be implemented')">
                <i class="bi bi-check-circle me-2"></i>Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function notFound() {
    return `
      <div class="text-center py-5">
        <div class="display-6 mb-3">404</div>
        <p class="lead">Page not found</p>
        <a class="btn btn-brand" href="#/">Go Home</a>
      </div>
    `;
  }

  window.Views = { home, postDetail, login, register, dashboard, profile, notFound };

  window.ViewsHydrate = window.ViewsHydrate || {};
  window.ViewsHydrate.home = function(){
    if (!window.PostsService) return;
    if (!window.Auth || !window.Auth.isLoggedIn()) return;
    PostsService.list(12, 0)
      .done(function(list){
        try {
          const { formatDate } = window.Utils;
          const cards = (Array.isArray(list) ? list : []).map(function(p){
            const title = p.title || 'Untitled';
            const content = (p.content || '').substring(0, 120);
            const catName = p.category_name || 'General';
            const catSlug = window.Utils.slugify(catName);
            const imgPath = `./assets/categories/${catSlug}-card.jpg`;
            return `
              <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-hover">
                  <img class="card-img-top" src="${imgPath}" alt="${title}" onerror="this.style.display='none'">
                  <div class="card-body d-flex flex-column">
                    <div class="small meta mb-2">${catName} • ${formatDate(p.created_at || new Date().toISOString())}</div>
                    <h2 class="h5 card-title">${title}</h2>
                    <p class="card-text flex-grow-1">${content}...</p>
                    <a class="btn btn-brand mt-auto" href="#/post/${p.id}">Read more</a>
                  </div>
                </div>
              </div>`;
          }).join('');
          const root = document.getElementById('app-root');
          if (!root) return;
          const grid = root.querySelector('.row.g-3');
          if (grid) grid.innerHTML = cards; else root.innerHTML = `<h2 class="h5 mb-3">Latest Posts</h2><div class="row g-3">${cards}</div>`;
        } catch(e){ console.error(e); }
      })
      .fail(function(){});
  };

  window.ViewsHydrate.dashboard = function(){
    var catBody = document.getElementById('tbl-categories-body');
    if (catBody && window.CategoriesService) {
      catBody.innerHTML = '<tr><td colspan="4" class="text-center meta">Loading…</td></tr>';
      CategoriesService.list(200, 0)
        .done(function(list){
          if (!Array.isArray(list) || list.length === 0) {
            catBody.innerHTML = '<tr><td colspan="4" class="text-center meta">No categories.</td></tr>';
            return;
          }
          var rows = list.map(function(c){
            var created = window.Utils.formatDate(c.created_at || new Date().toISOString());
            return '<tr>'+
              '<td>'+c.id+'</td>'+
              '<td>'+c.name+'</td>'+
              '<td>'+created+'</td>'+
              '<td class="text-end">'+
                '<button class="btn btn-sm btn-outline-light me-2" onclick="ViewsActions.editCategory('+c.id+')">Edit</button>'+
                '<button class="btn btn-sm btn-outline-danger" onclick="ViewsActions.deleteCategory('+c.id+')">Delete</button>'+
              '</td>'+
            '</tr>';
          }).join('');
          catBody.innerHTML = rows;
        })
        .fail(function(){
          catBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Failed to load categories</td></tr>';
        });
    }

    var tagBody = document.getElementById('tbl-tags-body');
    if (tagBody && window.TagsService) {
      tagBody.innerHTML = '<tr><td colspan="4" class="text-center meta">Loading…</td></tr>';
      TagsService.list(200, 0)
        .done(function(list){
          if (!Array.isArray(list) || list.length === 0) {
            tagBody.innerHTML = '<tr><td colspan="4" class="text-center meta">No tags.</td></tr>';
            return;
          }
          var rows = list.map(function(t){
            var created = window.Utils.formatDate(t.created_at || new Date().toISOString());
            return '<tr>'+
              '<td>'+t.id+'</td>'+
              '<td>#'+t.name+'</td>'+
              '<td>'+created+'</td>'+
              '<td class="text-end">'+
                '<button class="btn btn-sm btn-outline-light me-2" onclick="ViewsActions.editTag('+t.id+')">Edit</button>'+
                '<button class="btn btn-sm btn-outline-danger" onclick="ViewsActions.deleteTag('+t.id+')">Delete</button>'+
              '</td>'+
            '</tr>';
          }).join('');
          tagBody.innerHTML = rows;
        })
        .fail(function(){
          tagBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Failed to load tags</td></tr>';
        });
    }

    var userBody = document.getElementById('tbl-users-body');
    if (userBody && window.UsersService) {
      userBody.innerHTML = '<tr><td colspan="6" class="text-center meta">Loading…</td></tr>';
      UsersService.list(200, 0)
        .done(function(list){
          if (!Array.isArray(list) || list.length === 0) {
            userBody.innerHTML = '<tr><td colspan="6" class="text-center meta">No users.</td></tr>';
            return;
          }
          var me = (window.Auth && window.Auth.getUser && window.Auth.getUser()) || null;
          var myId = me && me.id;
          var rows = list.map(function(u){
            var created = window.Utils.formatDate(u.created_at || new Date().toISOString());
            var role = (u.role || 'user');
            var isMe = String(u.id) === String(myId || '');
            var actions = isMe
              ? ''
              : '<button class="btn btn-sm btn-outline-light me-2" onclick="ViewsActions.changeUserRole('+u.id+')">Change role<\/button>'+
                '<button class="btn btn-sm btn-outline-danger" onclick="ViewsActions.deleteUser('+u.id+')">Delete<\/button>';
            return '<tr>'+
              '<td>'+u.id+'</td>'+
              '<td>'+(u.name||'')+'</td>'+
              '<td>'+(u.email||'')+'</td>'+
              '<td><span class="badge bg-secondary text-uppercase">'+role+'</span></td>'+
              '<td>'+created+'</td>'+
              '<td class="text-end">'+ actions +'</td>'+
            '</tr>';
          }).join('');
          userBody.innerHTML = rows;
        })
        .fail(function(){
          userBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Failed to load users</td></tr>';
        });
    }
  };

  window.ViewsHydrate.postDetail = function(id){
    if (!window.PostsService || !id) return;
    $.when(
      PostsService.getById(id),
      PostsService.getTags(id),
      PostsService.getComments(id, 50, 0)
    ).done(function(post, tags, comms){
      try {
        const p = Array.isArray(post) ? post[0] : post;
        const t = Array.isArray(tags) ? tags[0] : tags;
        const c = Array.isArray(comms) ? comms[0] : comms;
        const title = (p && p.title) || 'Untitled';
        const authorName = (p && (p.author_name || (p.author && p.author.name))) || 'Unknown';
        const catName = (p && (p.category_name)) || 'General';
        const catSlug = window.Utils.slugify(catName);
        const banner = `./assets/categories/${catSlug}-banner.jpg`;
        const tagHtml = (Array.isArray(t) ? t : []).map(function(x){ return `<span class="chip me-1"><span class="dot"></span>#${x.name}</span>`; }).join('');
        const commentsHtml = (Array.isArray(c) ? c : []).map(function(cm){
          const u = cm.user_name || `User ${cm.user_id || ''}`;
          return `<div class="comment p-3 mb-2">
            <div class="small meta mb-1"><i class="bi bi-person-circle me-1"></i>${u} • <i class="bi bi-clock-history ms-2 me-1"></i>${window.Utils.formatDate(cm.created_at || new Date().toISOString())}</div>
            <div>${cm.content || ''}</div>
          </div>`;}).join('');
        const html = `
          <section class="mb-4">
            <div class="glass overflow-hidden">
              <img src="${banner}" alt="${title}" class="w-100" style="max-height:300px;object-fit:cover" onerror="this.style.display='none'">
              <div class="p-4">
                <div class="small meta mb-2">By ${authorName} • ${window.Utils.formatDate(p && p.created_at || new Date().toISOString())}</div>
                <h1 class="h3 mb-2">${title}</h1>
                <div class="mb-3">${tagHtml}</div>
                <div>${(p && p.content) || ''}</div>
              </div>
            </div>
          </section>
          <section>
            <h3 class="h5">Comments</h3>
            ${commentsHtml || '<div class="meta">No comments yet.</div>'}
            <div class="mt-3 glass p-3">
              <div class="form-floating mb-2">
                <textarea class="form-control" placeholder="Leave a comment" id="commentText" style="height: 100px"></textarea>
                <label for="commentText">Leave a comment</label>
              </div>
              <button class="btn btn-brand" onclick="toastr.info('Login required to comment')">Submit</button>
            </div>
          </section>`;
        const root = document.getElementById('app-root');
        if (root) root.innerHTML = html;
      } catch(e){ console.error(e); }
    }).fail(function(){});
  };
})();