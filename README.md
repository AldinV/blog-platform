# Blog Platform

Milestones delivered:

- Milestone 1: Fully styled static SPA frontend (tabs, modals, mock data).
- Milestone 2: MySQL schema and PHP PDO DAO layer with test script.
- Milestone 3: REST API with Flight, Swagger docs, and business validations.

## Tech Stack

- Frontend: Bootstrap 5, vanilla JS, hash-based router
- Styling: Custom CSS theme (glassmorphism, gradients, dark theme)
- Icons: Bootstrap Icons
- Fonts: Google Fonts (`Inter`, `Playfair Display`)
- Data (M1): In-memory mock data (`frontend/js/mockData.js`)
- Backend (M2): PHP 8 + PDO (DAOs), MySQL 8, env-based config
- Backend (M3): Flight microframework, swagger-php (OpenAPI 3.0), structured services with validations

## Features

- **SPA routing** via hash: instant navigation without page reloads.
- **Home** with hero, featured CTA, and post cards.
- **Post Detail** with category banner, metadata, tags, and comments list.
- **Auth pages** (`/login`, `/register`) with styled forms (static, non-functional yet).
- **Profile** with consistent layout and fields (static, non-functional yet).
- **Admin Dashboard** (`/dashboard`) with tabs for:
  - Posts, Categories, Tags, Users, Comments
  - Data tables with actions
  - Reusable modals for CRUD operations (in-memory)
- **Consistent design system**: typography, colors, chips, buttons, glass surfaces, tables, forms.

## Routes

- `/` — Home
- `/login` — Login
- `/register` — Register
- `/post/:id` — Post detail
- `/dashboard` — Admin dashboard
- `/profile` — Profile

## Admin Dashboard and CRUD Modals

Admin is implemented as a tabbed interface under `/dashboard`.

- **Posts**: create, edit, delete
- **Categories**: add, rename, delete
- **Tags**: add, rename, delete
- **Users**: invite, change role, disable
- **Comments**: approve, hide, delete

All actions open a Bootstrap modal (`frontend/js/modal.js`). Changes are applied to `window.MockData` arrays and the view re-renders via `Router.render()`. This is front-end only; persistence arrives in later milestones.

## Milestone 2 — Backend (Schema + DAOs)

### Database Schema (MySQL)

Entities (with constraints and indexes):

- `users` (id, name, email UNIQUE, password_hash, role [admin|user], created_at)
- `categories` (id, name UNIQUE, created_at)
- `posts` (id, author_id FK users, title, content, category_id FK categories, created_at)
- `tags` (id, name UNIQUE, created_at)
- `comments` (id, post_id FK posts CASCADE, user_id FK users SET NULL, content, status [visible|hidden], created_at)
- `post_tags` (post_id, tag_id) PK(post_id, tag_id), FKs CASCADE

Import the schema via `backend/database.sql` using phpMyAdmin or CLI:

- phpMyAdmin → Import → select `backend/database.sql`
- or CLI: `mysql -u root -p < backend\database.sql`

### DAO Layer (PHP PDO)

- `backend/dao/BaseDao.php` provides:
  - Shared PDO connection via `.env` (host, port, db, user, pass).
  - Helpers: `query/fetch/fetchAll/execute/lastInsertId`, transactions, pagination.
  - Dynamic builders: `buildInsert` (columns backticked), `buildUpdate`.
- Entity DAOs implement CRUD and specific queries:
  - `UsersDao`: `create/getById/getByEmail/listAll/update/delete`
  - `PostsDao`: `create/getById(list joins)/listAll(joins)/update/delete`
  - `CategoriesDao`: `create/getById/getByName/listAll/update/delete`
  - `TagsDao`: `create/getById/getByName/listAll/update/delete`
  - `CommentsDao`: `create/getById(joins)/listAll(joins)/listByPost/setStatus/update/delete`
  - `PostTagsDao`: `add/remove/getTagsForPost/getPostsForTag/replaceTagsForPost`

### Configure `.env`

Copy `.env.example` to `.env` and adjust:

- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_NAME=blog_platform`
- `DB_USER=root`
- `DB_PASS=` (set if your MySQL has a password)
- `DB_CHARSET=utf8mb4`

### Verify DAOs via CLI

Run the test script (PowerShell from project root):

```
php backend\test_dao.php
```

## Milestone 3 — REST API + Swagger

### Overview

- Implemented REST API using Flight (PHP microframework) and Services layer enforcing business rules.
- Auto-generated OpenAPI 3.0 docs via swagger-php, with a Swagger UI page.
- Error handling returns JSON with HTTP 4xx for validation errors or 404 for not found.

### How to run the backend (XAMPP)

There are two common setups. Choose ONE.

Option A — Place the project inside `htdocs`

1. Move the repo into `xampp\htdocs` (e.g. `C:\xampp\htdocs\blog-platform`).
2. Ensure Apache `mod_rewrite` is enabled:
   - XAMPP Control Panel → Apache → Config → `httpd.conf` → ensure this line is NOT commented:
     - `LoadModule rewrite_module modules/mod_rewrite.so`
3. Start Apache.
4. Open:
   - API base: http://localhost/blog-platform/backend
   - Swagger UI: http://localhost/blog-platform/backend/public/v1/docs/
   - OpenAPI JSON: http://localhost/blog-platform/backend/public/v1/docs/swagger.php

Option B — Keep the project outside `htdocs` using an Apache Alias

1. XAMPP Control Panel → Apache → Config → `httpd.conf`.
2. Ensure `mod_rewrite` is enabled as above.
3. Add an Alias pointing to your repo path:
   ```
   Alias /blog-platform "C:/Users/Korisnik/Desktop/blog-platform"
   <Directory "C:/Users/Korisnik/Desktop/blog-platform">
       Options Indexes FollowSymLinks
       AllowOverride All
       Require all granted
   </Directory>
   ```

   Note: The Alias path should match your project path exactly.
4. Restart Apache.
5. Open the same URLs as in Option A.

### Key endpoints

- Users: `GET /users`, `GET /users/{id}`, `GET /users/by-email`, `POST /users`, `PUT /users/{id}`, `DELETE /users/{id}`
- Categories: `GET /categories`, `GET /categories/{id}`, `GET /categories/by-name`, `POST /categories`, `PUT /categories/{id}`, `DELETE /categories/{id}`
- Tags: `GET /tags`, `GET /tags/{id}`, `GET /tags/by-name`, `POST /tags`, `PUT /tags/{id}`, `DELETE /tags/{id}`
- Posts: `GET /posts`, `GET /posts/{id}`, `POST /posts`, `PUT /posts/{id}`, `DELETE /posts/{id}`, `GET /posts/{id}/tags`, `PUT /posts/{id}/tags`
- Comments: `GET /comments`, `GET /comments/{id}`, `POST /comments`, `PUT /comments/{id}`, `DELETE /comments/{id}`, `GET /posts/{postId}/comments`, `PATCH /comments/{id}/status`

### Business rules & validations

- Users
  - Require `name`, `email`, `password_hash` on create.
  - Email format and uniqueness (create/update).
  - Role is `user` or `admin` (default `user`).
- Categories
  - Require `name`; max length; unique (create/update).
- Tags
  - Require `name`; max length; unique (create/update).
- Posts
  - Require `author_id`, `title`, `content`, `category_id` on create.
  - `author_id` must exist and have role `admin` (admins are authors).
  - `category_id` must exist.
  - Max length checks for `title` and `content`.
  - `tag_ids` accepted in create/update payloads but stored via join table; validated tag existence.
- Comments
  - Require `post_id`, `user_id`, `content` on create.
  - `post_id` and `user_id` must exist.
  - `status` enum: `visible` or `hidden`; default `visible`.
  - Content length capped.

See Swagger UI for full request/response schemas and examples.

## Running Frontend Locally

Open `frontend/index.html` directly in a browser.

## ERD Draft

See `docs/ERD.png` for the Entity-Relationship Diagram.