# Blog Platform

Milestone 1 delivers a fully styled, static Single-Page Application.

## Tech Stack

- Frontend: Bootstrap 5, vanilla JS, hash-based router
- Styling: Custom CSS theme (glassmorphism, gradients, dark theme)
- Icons: Bootstrap Icons
- Fonts: Google Fonts (`Inter`, `Playfair Display`)
- Data: In-memory mock data (`frontend/js/mockData.js`)

## Project Structure

```
blog-platform/
  backend/
    routes/
    services/
    dao/
  frontend/
    index.html
    css/
      styles.css
    js/
      utils.js
      mockData.js
      modal.js
      navbar.js
      views.js
      router.js
      app.js
    assets/
  docs/
    ERD.png
```

## Features (Milestone 1)

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

## Running Locally

Open `frontend/index.html` directly in a browser.

## ERD Draft

See `docs/ERD.png` for the Entity-Relationship Diagram.