(function () {
  const { formatDate, slugify } = window.Utils;
  const { posts, comments, tagsForPost, author, category } = window.MockData;

  window.handleCatImgError = function(el, type) {
    var src = el.src;
    if (src.indexOf('default-') !== -1) {
      el.onerror = null;
      return;
    }
    
    if (src.indexOf('.jpeg') !== -1) {
      el.onerror = null;
      el.src = './assets/default-' + type + '.png';
    }
  };

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
      var me = window.Auth && window.Auth.getUser && window.Auth.getUser();
      if (!me || !me.id) { toastr.error('Login required'); return; }
      var runId = Date.now();
      window.__postModalRunId = runId;
      var cats = [];
      var tags = [];
      var catReq = (window.CategoriesService && CategoriesService.list) ? CategoriesService.list(500,0) : $.Deferred().resolve([]);
      catReq
        .done(function(catList){ if (window.__postModalRunId !== runId) return; cats = Array.isArray(catList) ? catList : []; })
        .always(function(){
          if (window.__postModalRunId !== runId) return;
          var tagReq = (window.TagsService && TagsService.list) ? TagsService.list(500,0) : $.Deferred().resolve([]);
          tagReq
            .done(function(tagList){ if (window.__postModalRunId !== runId) return; tags = Array.isArray(tagList) ? tagList : []; })
            .always(function(){
              if (window.__postModalRunId !== runId) return;
        var body = `
          <div class="form-floating mb-2"><input id="fTitle" class="form-control" placeholder="Title"><label for="fTitle">Title</label></div>
          <div class="mb-2">
            <label class="form-label small">Category</label>
            <select id="fCategory" class="form-select">
              ${cats.map(function(c){ return `<option value="${c.id}">${c.name}</option>`; }).join('')}
            </select>
          </div>
          <div class="mb-2">
            <label class="form-label small">Tags</label>
            <input id="fTagSearch" class="form-control form-control-sm mb-1" placeholder="Search tags">
            <div id="fTagList" class="rounded p-2" style="max-height:140px;overflow:auto">
              ${tags.map(function(t){ return `<button type="button" class="btn btn-sm btn-outline-light me-1 mb-1" data-id="${t.id}">#${t.name}</button>`; }).join('')}
            </div>
            <div id="fSelectedTags" class="mt-2"></div>
          </div>
          <div class="form-floating"><textarea id="fContent" class="form-control" style="height:140px" placeholder="Content"></textarea><label for="fContent">Content</label></div>`;
        Modal.open({
          title: 'New Post',
          body: body,
          buttons: [
            { label: 'Cancel', class: 'btn btn-secondary', attrs: { 'data-bs-dismiss': 'modal' } },
            { label: 'Create', class: 'btn btn-brand', onClick: function(){
                var title = (document.getElementById('fTitle')||{}).value || '';
                var content = (document.getElementById('fContent')||{}).value || '';
                var category_id = Number((document.getElementById('fCategory')||{}).value);
                if (!title.trim() || !content.trim() || !category_id) { toastr.warning('Title, content and category are required'); return; }
                var selected = Array.prototype.map.call((document.querySelectorAll('#fSelectedTags .chip[data-id]')||[]), function(el){ return Number(el.getAttribute('data-id')); });
                PostsService.create({ title: title.trim(), content: content.trim(), category_id: category_id, author_id: me.id })
                  .done(function(created){
                    var pid = created && (created.id || created.post_id) || null;
                    if (pid && selected.length && PostsService.setTags) {
                      PostsService.setTags(pid, selected).always(function(){ toastr.success('Post created'); document.querySelector('#app-modal .btn-close').click(); if (window.ViewsHydrate && window.ViewsHydrate.dashboard) window.ViewsHydrate.dashboard(); });
                    } else {
                      toastr.success('Post created'); document.querySelector('#app-modal .btn-close').click(); if (window.ViewsHydrate && window.ViewsHydrate.dashboard) window.ViewsHydrate.dashboard();
                    }
                  })
                  .fail(function(xhr){ var msg=(xhr&&xhr.responseJSON&&(xhr.responseJSON.error||xhr.responseJSON.message))||'Create failed'; toastr.error(msg); });
            }}
          ]
        });
        var selectedWrap = document.getElementById('fSelectedTags');
        var tagSearch = document.getElementById('fTagSearch');
        var tagListEl = document.getElementById('fTagList');
        function addChip(id, name){
          if (!selectedWrap.querySelector('[data-id="'+id+'"]')) {
            var chip = document.createElement('span');
            chip.className = 'chip me-1 mb-1';
            chip.setAttribute('data-id', id);
            chip.innerHTML = '<span class="dot"></span>#'+name+' <button type="button" class="btn btn-sm btn-link text-danger p-0 ms-1">&times;</button>';
            chip.querySelector('button').onclick = function(){ chip.remove(); };
            selectedWrap.appendChild(chip);
          }
        }
        if (tagListEl) {
          tagListEl.onclick = function(e){ var btn=e.target.closest('button[data-id]'); if(!btn) return; addChip(btn.getAttribute('data-id'), btn.textContent.replace('#','').trim()); };
        }
        if (tagSearch && tagListEl) {
          tagSearch.addEventListener('input', function(){ var q=this.value.toLowerCase(); Array.prototype.forEach.call(tagListEl.querySelectorAll('button[data-id]'), function(b){ b.classList.toggle('d-none', q && b.textContent.toLowerCase().indexOf(q) === -1); }); });
        }
            });
        })
        .fail(function(){ toastr.error('Failed to load categories/tags'); });
    },

    editPost: function(id){
      var runId = Date.now();
      window.__postModalRunId = runId;
      var post = null, postTags = [], cats = [], tags = [];
      PostsService.getById(id)
        .done(function(p){ if (window.__postModalRunId !== runId) return; post = p; })
        .always(function(){
          if (window.__postModalRunId !== runId) return;
          var ptReq = (PostsService.getTags ? PostsService.getTags(id) : $.Deferred().resolve([]));
          ptReq.done(function(pt){ if (window.__postModalRunId !== runId) return; postTags = Array.isArray(pt) ? pt : []; })
              .always(function(){
                if (window.__postModalRunId !== runId) return;
                var catReq = (window.CategoriesService && CategoriesService.list) ? CategoriesService.list(500,0) : $.Deferred().resolve([]);
                catReq.done(function(cl){ if (window.__postModalRunId !== runId) return; cats = Array.isArray(cl) ? cl : []; })
                     .always(function(){
                       if (window.__postModalRunId !== runId) return;
                       var tagReq = (window.TagsService && TagsService.list) ? TagsService.list(500,0) : $.Deferred().resolve([]);
                       tagReq.done(function(tl){ if (window.__postModalRunId !== runId) return; tags = Array.isArray(tl) ? tl : []; })
                            .always(function(){
                              if (window.__postModalRunId !== runId) return;
        if (!post) { toastr.error('Post not found'); return; }
        var selectedIds = (Array.isArray(postTags)?postTags:[]).map(function(t){ return Number(t.id); });
        var body = `
          <div class="form-floating mb-2"><input id="fTitle" class="form-control" value="${String(post.title||'').replace(/"/g,'&quot;')}" placeholder="Title"><label for="fTitle">Title</label></div>
          <div class="mb-2">
            <label class="form-label small">Category</label>
            <select id="fCategory" class="form-select">
              ${cats.map(function(c){ return `<option value="${c.id}" ${String(c.id)===String(post.category_id)?'selected':''}>${c.name}</option>`; }).join('')}
            </select>
          </div>
          <div class="mb-2">
            <label class="form-label small">Tags</label>
            <input id="fTagSearch" class="form-control form-control-sm mb-1" placeholder="Search tags">
            <div id="fTagList" class="rounded p-2" style="max-height:140px;overflow:auto">
              ${tags.map(function(t){ return `<button type="button" class="btn btn-sm btn-outline-light me-1 mb-1" data-id="${t.id}">#${t.name}</button>`; }).join('')}
            </div>
            <div id="fSelectedTags" class="mt-2">${(Array.isArray(postTags)?postTags:[]).map(function(t){ return `<span class="chip me-1 mb-1" data-id="${t.id}"><span class="dot"></span>#${t.name} <button type="button" class="btn btn-sm btn-link text-danger p-0 ms-1">&times;</button></span>`; }).join('')}</div>
          </div>
          <div class="form-floating"><textarea id="fContent" class="form-control" style="height:140px" placeholder="Content">${String(post.content||'').replace(/</g,'&lt;')}</textarea><label for="fContent">Content</label></div>`;
        Modal.open({
          title: 'Edit Post',
          body: body,
          buttons: [
            { label: 'Cancel', class: 'btn btn-secondary', attrs: { 'data-bs-dismiss': 'modal' } },
            { label: 'Save', class: 'btn btn-brand', onClick: function(){
                var title = (document.getElementById('fTitle')||{}).value || '';
                var content = (document.getElementById('fContent')||{}).value || '';
                var category_id = Number((document.getElementById('fCategory')||{}).value);
                if (!title.trim() || !content.trim() || !category_id) { toastr.warning('Title, content and category are required'); return; }
                var selected = Array.prototype.map.call((document.querySelectorAll('#fSelectedTags .chip[data-id]')||[]), function(el){ return Number(el.getAttribute('data-id')); });
                PostsService.update(id, { title: title.trim(), content: content.trim(), category_id: category_id })
                  .done(function(){
                    if (PostsService.setTags) {
                      PostsService.setTags(id, selected).always(function(){ toastr.success('Post updated'); document.querySelector('#app-modal .btn-close').click(); if (window.ViewsHydrate && window.ViewsHydrate.dashboard) window.ViewsHydrate.dashboard(); });
                    } else {
                      toastr.success('Post updated'); document.querySelector('#app-modal .btn-close').click(); if (window.ViewsHydrate && window.ViewsHydrate.dashboard) window.ViewsHydrate.dashboard();
                    }
                  })
                  .fail(function(xhr){ var msg=(xhr&&xhr.responseJSON&&(xhr.responseJSON.error||xhr.responseJSON.message))||'Update failed'; toastr.error(msg); });
            }}
          ]
        });
        var selectedWrap = document.getElementById('fSelectedTags');
        if (selectedWrap) Array.prototype.forEach.call(selectedWrap.querySelectorAll('button'), function(b){ b.onclick = function(){ b.closest('.chip').remove(); }; });
        var tagSearch = document.getElementById('fTagSearch');
        var tagListEl = document.getElementById('fTagList');
        function addChip(id, name){ if (!selectedWrap.querySelector('[data-id="'+id+'"]')) { var chip=document.createElement('span'); chip.className='chip me-1 mb-1'; chip.setAttribute('data-id', id); chip.innerHTML = '<span class="dot"></span>#'+name+' <button type="button" class="btn btn-sm btn-link text-danger p-0 ms-1">&times;</button>'; chip.querySelector('button').onclick=function(){ chip.remove(); }; selectedWrap.appendChild(chip);} }
        if (tagListEl) { tagListEl.onclick=function(e){ var btn=e.target.closest('button[data-id]'); if(!btn) return; addChip(btn.getAttribute('data-id'), btn.textContent.replace('#','').trim()); }; }
        if (tagSearch && tagListEl) { tagSearch.addEventListener('input', function(){ var q=this.value.toLowerCase(); Array.prototype.forEach.call(tagListEl.querySelectorAll('button[data-id]'), function(b){ b.classList.toggle('d-none', q && b.textContent.toLowerCase().indexOf(q) === -1); }); }); }
                            });
                     });
              });
        })
        .fail(function(){ toastr.error('Failed to load post'); });
    },

    deletePost: function(id){
      Modal.open({
        title: 'Delete Post',
        body: 'Are you sure you want to delete this post?',
        buttons: [
          { label: 'Cancel', class: 'btn btn-secondary', attrs: { 'data-bs-dismiss': 'modal' } },
          { label: 'Delete', class: 'btn btn-outline-danger', onClick: function(){
              PostsService.remove(id)
                .done(function(){ toastr.success('Post deleted'); document.querySelector('#app-modal .btn-close').click(); if (window.ViewsHydrate && window.ViewsHydrate.dashboard) window.ViewsHydrate.dashboard(); })
                .fail(function(xhr){ var msg=(xhr&&xhr.responseJSON&&(xhr.responseJSON.error||xhr.responseJSON.message))||'Delete failed'; toastr.error(msg); });
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
              $.ajax({
                url: window.Constants.PROJECT_BASE_URL + 'auth/register',
                type: 'POST',
                data: JSON.stringify({ name: name.trim(), email: email.trim(), password: password, role: window.Constants.USER_ROLE }),
                contentType: 'application/json',
                dataType: 'json'
              }).done(function(){
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
    setCommentStatus: function(id, nextStatus){
      if (!window.CommentsService) { toastr.error('Service unavailable'); return; }
      CommentsService.setStatus(id, nextStatus)
        .done(function(){ toastr.success('Status updated'); if (window.ViewsHydrate && window.ViewsHydrate.dashboard) window.ViewsHydrate.dashboard(); })
        .fail(function(xhr){ var msg=(xhr&&xhr.responseJSON&&(xhr.responseJSON.error||xhr.responseJSON.message))||'Update failed'; toastr.error(msg); });
    },
    deleteComment: function(id){
      if (!window.CommentsService) { toastr.error('Service unavailable'); return; }
      Modal.open({
        title: 'Delete Comment',
        body: 'Are you sure you want to delete this comment?',
        buttons: [
          { label: 'Cancel', class: 'btn btn-secondary', attrs: { 'data-bs-dismiss': 'modal' } },
          { label: 'Delete', class: 'btn btn-outline-danger', onClick: function(){
              CommentsService.remove(id)
                .done(function(){ toastr.success('Comment deleted'); document.querySelector('#app-modal .btn-close').click(); if (window.ViewsHydrate && window.ViewsHydrate.dashboard) window.ViewsHydrate.dashboard(); })
                .fail(function(xhr){ var msg=(xhr&&xhr.responseJSON&&(xhr.responseJSON.error||xhr.responseJSON.message))||'Delete failed'; toastr.error(msg); });
          }}
        ]
      });
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
    const banner = `./assets/categories/${catSlug}-banner.jpeg`;

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
          <img src="${banner}" alt="${post.title}" class="w-100" style="max-height:300px;object-fit:cover" onerror="window.handleCatImgError(this, 'banner')">
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
          <button class="btn btn-sm btn-outline-light me-2" onclick="ViewsActions.setCommentStatus(${c.id}, '${c.status === 'visible' ? 'hidden' : 'visible'}')">Toggle</button>
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
                <tbody id="tbl-posts-body"><tr><td colspan="6" class="text-center meta">Loading…</td></tr></tbody>
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
                <tbody id="tbl-comments-body"><tr><td colspan="7" class="text-center meta">Loading…</td></tr></tbody>
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
            <p class="meta">Update your basic information.</p>
          </div>
          <form id="profileForm">
            <div class="form-floating mb-3">
              <input type="text" class="form-control" id="profName" placeholder="Your name">
              <label for="profName">Name</label>
            </div>
            <div class="form-floating mb-3">
              <input type="email" class="form-control" id="profEmail" placeholder="you@example.com">
              <label for="profEmail">Email</label>
            </div>
            <button type="button" class="btn btn-brand w-100" id="btnSaveProfile">
              <i class="bi bi-save me-2"></i>Save Changes
            </button>
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
            const imgPath = `./assets/categories/${catSlug}-card.jpeg`;
            return `
              <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-hover">
                  <img class="card-img-top" src="${imgPath}" alt="${title}" onerror="window.handleCatImgError(this, 'card')">
                  <div class="card-body d-flex flex-column">
                    <div class="small meta mb-2">${catName} • ${formatDate(p.created_at || new Date().toISOString())}</div>
                    <div class="mb-2" id="post-tags-${p.id}"><span class="meta">Loading tags…</span></div>
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
          var arr = Array.isArray(list) ? list.slice(0) : [];
          var runId = Date.now();
          window.__homeTagsRunId = runId;
          (function next(i){
            if (window.__homeTagsRunId !== runId) return;
            if (i >= arr.length) return;
            var p = arr[i];
            var holder = document.getElementById('post-tags-' + p.id);
            if (!holder || !window.PostsService || !PostsService.getTags) { return next(i+1); }
            PostsService.getTags(p.id)
              .done(function(tags){
                if (window.__homeTagsRunId !== runId) return;
                try {
                  var html = (Array.isArray(tags) ? tags : []).map(function(t){ return `<span class="chip me-1 mb-1"><span class="dot"></span>#${t.name}</span>`; }).join('');
                  holder.innerHTML = html || '<span class="meta">No tags</span>';
                } catch(e) { holder.innerHTML = '<span class="meta">No tags</span>'; }
              })
              .fail(function(){ if (holder) holder.innerHTML = '<span class="meta">No tags</span>'; })
              .always(function(){ setTimeout(function(){ next(i+1); }, 100); });
          })(0);
        } catch(e){ console.error(e); }
      })
      .fail(function(){});
  };

  window.ViewsHydrate.profile = function(){
    try {
      if (!window.UsersService) return;
      var nameEl = document.getElementById('profName');
      var emailEl = document.getElementById('profEmail');
      if (!nameEl || !emailEl) return;

      UsersService.me()
        .done(function(u){
          try {
            nameEl.value = (u && u.name) || '';
            emailEl.value = (u && u.email) || '';
          } catch(e) {}
        })
        .fail(function(xhr){
          var msg = (xhr && xhr.responseJSON && (xhr.responseJSON.error || xhr.responseJSON.message)) || 'Failed to load profile';
          if (window.toastr) toastr.error(msg);
        });

      var btn = document.getElementById('btnSaveProfile');
      if (btn) {
        btn.onclick = function(){
          var name = (nameEl || {}).value || '';
          var email = (emailEl || {}).value || '';
          if (!name.trim() || !email.trim()) {
            if (window.toastr) toastr.warning('Name and email are required');
            return;
          }
          UsersService.updateMe({ name: name.trim(), email: email.trim() })
            .done(function(updated){
              if (window.toastr) toastr.success('Profile updated');
              var el = document.getElementById('nav-user-name');
              if (el) el.textContent = (updated && (updated.name || updated.email)) || el.textContent;
            })
            .fail(function(xhr){
              var msg = (xhr && xhr.responseJSON && (xhr.responseJSON.error || xhr.responseJSON.message)) || 'Update failed';
              if (window.toastr) toastr.error(msg);
            });
        };
      }
    } catch(e) { console.error(e); }
  };

  window.ViewsHydrate.dashboard = function(){
    function loadPosts(){
      var postBody = document.getElementById('tbl-posts-body');
      if (!(postBody && window.PostsService)) return;
      postBody.innerHTML = '<tr><td colspan="6" class="text-center meta">Loading…</td></tr>';
      PostsService.list(200, 0)
        .done(function(list){
          if (!Array.isArray(list) || list.length === 0) { postBody.innerHTML = '<tr><td colspan="6" class="text-center meta">No posts.</td></tr>'; return; }
          var rows = list.map(function(p){
            var created = window.Utils.formatDate(p.created_at || new Date().toISOString());
            var cat = p.category_name || 'General';
            var author = p.author_name || (p.author && p.author.name) || 'Unknown';
            return '<tr>'+
              '<td>'+p.id+'</td>'+
              '<td>'+(p.title||'')+'</td>'+
              '<td>'+cat+'</td>'+
              '<td>'+author+'</td>'+
              '<td>'+created+'</td>'+
              '<td class="text-end">'+
                '<button class="btn btn-sm btn-outline-light me-2" onclick="ViewsActions.editPost('+p.id+')">Edit</button>'+
                '<button class="btn btn-sm btn-outline-danger" onclick="ViewsActions.deletePost('+p.id+')">Delete</button>'+
              '</td>'+
            '</tr>';
          }).join('');
          postBody.innerHTML = rows;
        })
        .fail(function(){ postBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Failed to load posts</td></tr>'; });
    }
    function loadCategories(){
      var catBody = document.getElementById('tbl-categories-body');
      if (!(catBody && window.CategoriesService)) return;
      catBody.innerHTML = '<tr><td colspan="4" class="text-center meta">Loading…</td></tr>';
      CategoriesService.list(200, 0)
        .done(function(list){
          if (!Array.isArray(list) || list.length === 0) { catBody.innerHTML = '<tr><td colspan="4" class="text-center meta">No categories.</td></tr>'; return; }
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
        .fail(function(){ catBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Failed to load categories</td></tr>'; });
    }
    function loadTags(){
      var tagBody = document.getElementById('tbl-tags-body');
      if (!(tagBody && window.TagsService)) return;
      tagBody.innerHTML = '<tr><td colspan="4" class="text-center meta">Loading…</td></tr>';
      TagsService.list(200, 0)
        .done(function(list){
          if (!Array.isArray(list) || list.length === 0) { tagBody.innerHTML = '<tr><td colspan="4" class="text-center meta">No tags.</td></tr>'; return; }
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
        .fail(function(){ tagBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Failed to load tags</td></tr>'; });
    }
    function loadUsers(){
      var userBody = document.getElementById('tbl-users-body');
      if (!(userBody && window.UsersService)) return;
      userBody.innerHTML = '<tr><td colspan="6" class="text-center meta">Loading…</td></tr>';
      UsersService.list(200, 0)
        .done(function(list){
          if (!Array.isArray(list) || list.length === 0) { userBody.innerHTML = '<tr><td colspan="6" class="text-center meta">No users.</td></tr>'; return; }
          var me = (window.Auth && window.Auth.getUser && window.Auth.getUser()) || null;
          var myId = me && me.id;
          var rows = list.map(function(u){
            var created = window.Utils.formatDate(u.created_at || new Date().toISOString());
            var role = (u.role || 'user');
            var isMe = String(u.id) === String(myId || '');
            var actions = isMe ? '' : '<button class="btn btn-sm btn-outline-light me-2" onclick="ViewsActions.changeUserRole('+u.id+')">Change role<\/button>'+
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
        .fail(function(){ userBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Failed to load users</td></tr>'; });
    }
    function loadComments(){
      var commBody = document.getElementById('tbl-comments-body');
      if (!(commBody && window.CommentsService)) return;
      commBody.innerHTML = '<tr><td colspan="7" class="text-center meta">Loading…</td></tr>';
      CommentsService.list(200, 0)
        .done(function(list){
          if (!Array.isArray(list) || list.length === 0) { commBody.innerHTML = '<tr><td colspan="7" class="text-center meta">No comments.</td></tr>'; return; }
          var rows = list.map(function(c){
            var title = c.post_title || ('Post ' + (c.post_id||''));
            var uname = c.user_name || ('User ' + (c.user_id||''));
            var snippet = String(c.content||'');
            if (snippet.length > 120) snippet = snippet.slice(0,120) + '…';
            var badge = c.status === 'visible' ? 'bg-success' : 'bg-warning';
            return '<tr>'+
              '<td>'+c.id+'</td>'+
              '<td>'+title+'</td>'+
              '<td>'+uname+'</td>'+
              '<td class="small">'+snippet+'</td>'+
              '<td>'+window.Utils.formatDate(c.created_at || new Date().toISOString())+'</td>'+
              '<td><span class="badge '+badge+' text-uppercase">'+c.status+'</span></td>'+
              '<td class="text-end">'+
                '<button class="btn btn-sm btn-outline-warning me-2" onclick="ViewsActions.setCommentStatus('+c.id+', \''+(c.status==='visible'?'hidden':'visible')+'\')">'+(c.status==='visible'?'Hide':'Show')+'</button>'+
                '<button class="btn btn-sm btn-outline-danger" onclick="ViewsActions.deleteComment('+c.id+')">Delete</button>'+
              '</td>'+
            '</tr>';
          }).join('');
          commBody.innerHTML = rows;
        })
        .fail(function(xhr){ var msg=(xhr&&xhr.responseJSON&&(xhr.responseJSON.error||xhr.responseJSON.message))||'Failed to load comments'; commBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">'+ msg +'</td></tr>'; });
    }

    var map = {
      '#tab-posts': loadPosts,
      '#tab-categories': loadCategories,
      '#tab-tags': loadTags,
      '#tab-users': loadUsers,
      '#tab-comments': loadComments
    };
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach(function(btn){
      var target = btn.getAttribute('data-bs-target');
      if (map[target]) {
        btn.addEventListener('shown.bs.tab', function(){ map[target](); });
      }
    });

    var activePane = document.querySelector('.tab-pane.show.active');
    var activeId = activePane && ('#'+activePane.id);
    if (activeId && map[activeId]) { map[activeId](); }
  };

  window.ViewsHydrate.postDetail = function(id){
    if (!window.PostsService || !id) return;
    var runId = Date.now();
    window.__postDetailRunId = runId;

    PostsService.getById(id)
      .done(function(p){
        if (window.__postDetailRunId !== runId) return;
        try {
          var title = (p && p.title) || 'Untitled';
          var authorName = (p && (p.author_name || (p.author && p.author.name))) || 'Unknown';
          var catName = (p && p.category_name) || 'General';
          var catSlug = window.Utils.slugify(catName);
          var banner = `./assets/categories/${catSlug}-banner.jpeg`;
          var html = `
            <section class="mb-4">
              <div class="glass overflow-hidden">
                <img src="${banner}" alt="${title}" class="w-100" style="max-height:300px;object-fit:cover" onerror="window.handleCatImgError(this, 'banner')">
                <div class="p-4">
                  <div class="small meta mb-2">By ${authorName} • ${window.Utils.formatDate(p && p.created_at || new Date().toISOString())} • ${catName}</div>
                  <h1 class="h3 mb-2">${title}</h1>
                  <div class="mb-3" id="post-tags"><span class="meta">Loading tags…</span></div>
                  <div>${(p && p.content) || ''}</div>
                </div>
              </div>
            </section>
            <section>
              <h3 class="h5">Comments</h3>
              <div id="comments-list" class="meta">Loading comments…</div>
              <div class="mt-3 glass p-3">
                <div class="form-floating mb-2">
                  <textarea class="form-control" placeholder="Leave a comment" id="commentText" style="height: 100px"></textarea>
                  <label for="commentText">Leave a comment</label>
                </div>
                <button class="btn btn-brand" id="btnSubmitComment">Submit</button>
              </div>
            </section>`;
          var root = document.getElementById('app-root');
          if (root) root.innerHTML = html;

          try {
            var logged = window.Auth && window.Auth.isLoggedIn && window.Auth.isLoggedIn();
            var ta = document.getElementById('commentText');
            var btn = document.getElementById('btnSubmitComment');
            if (!logged) {
              if (ta) { ta.disabled = true; ta.placeholder = 'Login to comment'; }
              if (btn) { btn.onclick = function(){ toastr.info('Login required to comment'); }; }
            } else if (btn && ta && window.CommentsService) {
              btn.onclick = function(){
                var txt = (ta.value || '').trim();
                if (!txt) { toastr.warning('Comment cannot be empty'); return; }
                var me = window.Auth && window.Auth.getUser && window.Auth.getUser();
                if (!me || !me.id) { toastr.error('Cannot determine current user'); return; }
                btn.disabled = true;
                CommentsService.create({ post_id: (p && p.id) || id, user_id: me.id, content: txt, status: 'visible' })
                  .done(function(){
                    ta.value = '';
                    if (window.__postDetailRunId !== runId) return;
                    PostsService.getComments(((p && p.id) || id), 50, 0).done(function(list){
                      if (window.__postDetailRunId !== runId) return;
                      try {
                        var c = Array.isArray(list) ? list : [];
                        var commentsHtml2 = c.filter(function(cm){ return cm && cm.status === 'visible'; }).map(function(cm){
                          var u = cm.user_name || ('User ' + (cm.user_id || ''));
                          return `<div class="comment p-3 mb-2">
            <div class=\"small meta mb-1\"><i class=\"bi bi-person-circle me-1\"></i>${u} • <i class=\"bi bi-clock-history ms-2 me-1\"></i>${window.Utils.formatDate(cm.created_at || new Date().toISOString())}</div>
            <div>${cm.content || ''}</div>
          </div>`;}).join('');
                        var listEl = document.getElementById('comments-list');
                        if (listEl) listEl.innerHTML = commentsHtml2 || '<div class="meta">No comments yet.</div>';
                      } catch(e){}
                    });
                    toastr.success('Comment added');
                  })
                  .fail(function(xhr){ var msg=(xhr&&xhr.responseJSON&&(xhr.responseJSON.error||xhr.responseJSON.message))||'Create failed'; toastr.error(msg); })
                  .always(function(){ btn.disabled = false; });
              };
            }
          } catch(e) { console.error(e); }

          PostsService.getTags(p.id)
            .done(function(tags){
              if (window.__postDetailRunId !== runId) return;
              try {
                var tagHtml = (Array.isArray(tags) ? tags : []).map(function(x){ return `<span class="chip me-1"><span class="dot"></span>#${x.name}</span>`; }).join('');
                var holder = document.getElementById('post-tags');
                if (holder) holder.innerHTML = tagHtml || '<span class="meta">No tags</span>';
              } catch(e){}
            })
            .always(function(){
              setTimeout(function(){
                if (window.__postDetailRunId !== runId) return;
                PostsService.getComments(p.id, 50, 0)
                  .done(function(list){
                    if (window.__postDetailRunId !== runId) return;
                    try {
                      var c = Array.isArray(list) ? list : [];
                      var commentsHtml = c.filter(function(cm){ return cm && cm.status === 'visible'; }).map(function(cm){
                        var u = cm.user_name || ('User ' + (cm.user_id || ''));
                        return `<div class="comment p-3 mb-2">
            <div class=\"small meta mb-1\"><i class=\"bi bi-person-circle me-1\"></i>${u} • <i class=\"bi bi-clock-history ms-2 me-1\"></i>${window.Utils.formatDate(cm.created_at || new Date().toISOString())}</div>
            <div>${cm.content || ''}</div>
          </div>`;}).join('');
                      var listEl = document.getElementById('comments-list');
                      if (listEl) listEl.innerHTML = commentsHtml || '<div class="meta">No comments yet.</div>';
                    } catch(e){}
                  })
                  .fail(function(){ var listEl = document.getElementById('comments-list'); if (listEl) listEl.innerHTML = '<div class="meta">No comments yet.</div>'; });
              }, 120);
            });
        } catch(e){ console.error(e); }
      })
      .fail(function(){
        if (window.__postDetailRunId !== runId) return;
        var root = document.getElementById('app-root');
        if (root) root.innerHTML = '<div class="meta">Failed to load post.</div>';
      });
  };
})();