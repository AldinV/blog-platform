(function () {
  const { formatDate, slugify } = window.Utils;
  const { posts, comments, tagsForPost, author, category } = window.MockData;

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
            <h1 class="title mb-2">Stories, guides, and insights for curious minds</h1>
            <p class="subtitle mb-3">Explore a minimal yet vibrant space where ideas meet design. Crafted as a SPA and ready to evolve into a full-featured blog platform.</p>
            <div class="d-flex gap-2">
              <a href="#/post/1" class="btn btn-brand">Read a featured post</a>
              <a href="#/login" class="btn btn-outline-light">Sign in</a>
            </div>
          </div>
          <div class="col-lg-5 d-none d-lg-block">
            <div class="glass p-3">
              <img src="./assets/hero-illustration.png" alt="Hero" class="img-fluid rounded" onerror="this.style.display='none'">
            </div>
          </div>
        </div>
      </section>`;

    const cards = posts.map(p => {
      const tags = tagsForPost(p.id).map(t => `<span class="chip me-1"><span class="dot"></span>#${t.name}</span>`).join('');
      const cat = category(p.category_id)?.name || 'General';
      const catSlug = slugify(cat);
      const imgPath = `./assets/categories/${catSlug}-card.jpg`;
      return `
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-hover">
            <img class="card-img-top" src="${imgPath}" alt="${p.title}" onerror="this.style.display='none'">
            <div class="card-body d-flex flex-column">
              <div class="small meta mb-2"><i class="bi bi-folder2-open me-1"></i>${cat} • <i class="bi bi-clock-history ms-2 me-1"></i>${formatDate(p.created_at)}</div>
              <h2 class="h5 card-title">${p.title}</h2>
              <p class="card-text flex-grow-1">${p.content.substring(0, 120)}...</p>
              <div class="mb-3">${tags}</div>
              <a class="btn btn-brand mt-auto" href="#/post/${p.id}">Read more</a>
            </div>
          </div>
        </div>`;
    }).join('');

    return `
      ${hero}
      <h2 class="h5 mb-3">Latest Posts</h2>
      <div class="row g-3">${cards}</div>
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
            <label for="commentText">Leave a comment (static mock)</label>
          </div>
          <button class="btn btn-brand" onclick="alert('Static mock: comments not submitted.')">Submit</button>
        </div>
      </section>
    `;
  }

  function login() {
    return layoutPage('Login', `
      <div class="col-md-7 col-lg-5 mx-auto glass p-4">
        <form>
          <div class="form-floating mb-3">
            <input type="email" class="form-control" id="loginEmail" placeholder="name@example.com">
            <label for="loginEmail">Email address</label>
          </div>
          <div class="form-floating mb-3">
            <input type="password" class="form-control" id="loginPassword" placeholder="Password">
            <label for="loginPassword">Password</label>
          </div>
          <button type="button" class="btn btn-brand w-100" onclick="alert('Static mock: no auth yet.')">Login</button>
          <div class="text-center mt-2">
            <a href="#/register">Create an account</a>
          </div>
        </form>
      </div>
    `);
  }

  function register() {
    return layoutPage('Register', `
      <div class="col-md-7 col-lg-5 mx-auto glass p-4">
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
          <button type="button" class="btn btn-brand w-100" onclick="alert('Static mock: registration not implemented.')">Create account</button>
        </form>
      </div>
    `);
  }

  function dashboard() {
    return layoutPage('Dashboard', `
      <div class="row g-3">
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h3 class="h6">Manage Posts</h3>
              <p class="small text-secondary">Create, edit, delete posts.</p>
              <button class="btn btn-brand" onclick="alert('Static mock: Posts management')">Open</button>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h3 class="h6">Manage Categories</h3>
              <p class="small text-secondary">Create, edit, delete categories.</p>
              <button class="btn btn-brand" onclick="alert('Static mock: Categories management')">Open</button>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h3 class="h6">Manage Tags</h3>
              <p class="small text-secondary">Create, edit, delete tags.</p>
              <button class="btn btn-brand" onclick="alert('Static mock: Tags management')">Open</button>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h3 class="h6">Manage Users</h3>
              <p class="small text-secondary">Invite, change roles, disable users.</p>
              <button class="btn btn-brand" onclick="alert('Static mock: Users management')">Open</button>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h3 class="h6">Comments Moderation</h3>
              <p class="small text-secondary">Approve, hide, delete comments.</p>
              <button class="btn btn-brand" onclick="alert('Static mock: Comments moderation')">Open</button>
            </div>
          </div>
        </div>
      </div>
    `);
  }

  function profile() {
    return layoutPage('Your Profile', `
      <div class="glass p-4">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="form-floating mb-3">
              <input type="text" class="form-control" id="pName" placeholder="Your name" value="Jane Doe">
              <label for="pName">Full name</label>
            </div>
            <div class="form-floating mb-3">
              <input type="email" class="form-control" id="pEmail" placeholder="you@example.com" value="jane@example.com">
              <label for="pEmail">Email</label>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-floating mb-3">
              <input type="password" class="form-control" id="pPassword" placeholder="New password">
              <label for="pPassword">Change password</label>
            </div>
            <button class="btn btn-brand" onclick="alert('Static mock: profile not saved')">Save changes</button>
          </div>
        </div>
      </div>
    `);
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
})();
