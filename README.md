# Blog Platform

A single‑page blog application. Stack:

- **Backend**: PHP 8, FlightPHP, PDO, MySQL, JWT, Swagger/OpenAPI, PHPUnit  
- **Frontend**: Vanilla JS SPA, jQuery, Bootstrap, AJAX services  
- **Architecture**: DAO → Service (BLL) → Routes (Presentation/API) + Middleware

The app supports:

- User registration, login, and JWT‑based authentication
- Two roles: **admin** and **user**
- CRUD for posts, categories, tags, users, and comments
- Admin dashboard (management of all entities)
- Authenticated SPA frontend (home, login, register, dashboard, profile, post details)
- Swagger‑based API documentation
- PHPUnit tests for backend

---

## 1. Features

- **Authentication & Authorization**
  - Register/login via `/auth/register` and `/auth/login`
  - Passwords hashed with `password_hash`
  - JWT issued with user payload (`id`, `email`, `role`, …), sent in `Authentication` header
  - Middleware verifies token and sets the current user
  - Role checks via `AuthMiddleware` and `Roles` class

- **Roles**
  - **Admin**:
    - Full CRUD on posts, categories, tags, users, comments (via dashboard)
    - Can change user roles and delete users
  - **User**:
    - Can browse posts
    - Can create comments
    - Can edit own profile

- **Entities**
    - `users` (id, name, email UNIQUE, password_hash, role [admin|user], created_at)
    - `categories` (id, name UNIQUE, created_at)
    - `posts` (id, author_id FK users, title, content, category_id FK categories, created_at)
    - `tags` (id, name UNIQUE, created_at)
    - `comments` (id, post_id FK posts CASCADE, user_id FK users SET NULL, content, status [visible|hidden], created_at)
    - `post_tags` (post_id, tag_id) PK(post_id, tag_id), FKs CASCADE

- **Frontend SPA**
  - HTML/CSS/JS + Bootstrap
  - Routing via hash URLs:  
    `/` (home), `/login`, `/register`, `/dashboard`, `/post/:id`, `/profile`
  - AJAX services in `frontend/services/`
  - `rest-client.js` utility for all backend calls with JWT header

- **Documentation & Testing**
  - Swagger/OpenAPI docs under `backend/public/v1/docs`
  - PHPUnit tests for backend `backend/tests`

---

## 2. Backend Implementation

### 2.1. Technologies

- **FlightPHP** as micro‑framework (routes + request/response)
- **PDO** for DB layer
- **DAO layer** (BaseDao + DAOs per entity)
- **Service layer (BLL)** for business rules
- **Routes layer** for HTTP API and Swagger annotations
- **JWT** (firebase/php-jwt)
- **Swagger/OpenAPI** (zircote/swagger-php)
- **PHPUnit** for tests

### 2.2. Configuration (`backend/.env`)

Copy `.env.example` to `.env` and adjust:

- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_NAME=blog_platform`
- `DB_USER=root`
- `DB_PASS=` (set if your MySQL has a password)
- `DB_CHARSET=utf8mb4`
- `JWT_SECRET=e45749e05009f49e9533d90493316730a6546286e06f3c90276c16f5075d59054c84n5y7845ny845y7845n7y458ny7458ny7458ny745`

### 2.3. DAO Layer

Verify DAOs via CLI - run the test script (PowerShell from project root):

```
php backend\test_dao.php
```

---

## 3. Frontend Implementation

### 3.1. Overview

- Vanilla JS SPA
- Navigation and view rendering via:
  - `js/navbar.js`
  - `js/router.js`
  - `js/views.js`
  - `js/viewsHydrate` functions
- Services under `frontend/services`
- Utilities:
  - `utils/constants.js` – base URL and roles
  - `utils/rest-client.js` – AJAX with JWT header
  - `js/utils.js` – helpers (`navigate`, `parseJwt`, etc.)

### 3.2. Configuration (Base URL)

`frontend/utils/constants.js`:

```javascript
window.Constants = {
  PROJECT_BASE_URL: "http://localhost/blog-platform/backend/", // adjust to your path
  USER_ROLE: "user",
  ADMIN_ROLE: "admin"
};
```
---

## 4. Setting Up the Project

### 4.1. Prerequisites

- PHP 8+ (XAMPP)
- Composer
- MySQL (XAMPP)

### 4.2. Database Setup

1. **Create database (phpmyadmin)**:

    -  Database name: blog_platform 
    - Character set: utf8mb4_unicode_ci

2. **Import schema**:

    - `backend/database.sql`

### 4.3. Install Backend Dependencies

```bash
cd backend
composer install
```

This installs:

- FlightPHP
- JWT library
- Swagger-PHP
- PHPUnit (dev)

### 4.4. Run Backend

There are two common setups. Choose ONE.

**Option A — Place the project inside `htdocs`**

1. Move the repo into `xampp\htdocs` (e.g. `C:\xampp\htdocs\blog-platform`).
2. Ensure Apache `mod_rewrite` is enabled:
  - XAMPP Control Panel → Apache → Config → `httpd.conf` → ensure this line is NOT commented:
    - `LoadModule rewrite_module modules/mod_rewrite.so`
3. Start Apache.
4. Open:
  - API base: http://localhost/blog-platform/backend
  - Swagger UI: http://localhost/blog-platform/backend/public/v1/docs/
  - OpenAPI JSON: http://localhost/blog-platform/backend/public/v1/docs/swagger.php

**Option B — Keep the project outside `htdocs` using an Apache Alias**

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
5. Open:
  - API base: http://localhost/blog-platform/backend
  - Swagger UI: http://localhost/blog-platform/backend/public/v1/docs/
  - OpenAPI JSON: http://localhost/blog-platform/backend/public/v1/docs/swagger.php

---

## 5. Running the Frontend

Open `frontend/index.html` directly in a browser.

---

## 6. Tests

From `backend/`:

```bash
./vendor/bin/phpunit
```

---

## 7. Docs

See `docs/ERD.png` for the Entity-Relationship Diagram