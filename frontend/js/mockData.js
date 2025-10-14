window.MockData = (function () {
  const categories = [
    { id: 1, name: "News", created_at: "2025-10-01T10:00:00Z" },
    { id: 2, name: "Tech", created_at: "2025-10-02T11:00:00Z" }
  ];

  const tags = [
    { id: 1, name: "javascript", created_at: "2025-10-01T10:00:00Z" },
    { id: 2, name: "php", created_at: "2025-10-01T10:05:00Z" },
    { id: 3, name: "mysql", created_at: "2025-10-01T10:10:00Z" },
    { id: 4, name: "design", created_at: "2025-10-01T10:15:00Z" },
    { id: 5, name: "tips", created_at: "2025-10-01T10:20:00Z" }
  ];

  const users = [
    { id: 1, name: "Admin", email: "admin@example.com", role: "admin", created_at: "2025-10-01T08:00:00Z" },
    { id: 2, name: "Jane Doe", email: "jane@example.com", role: "user", created_at: "2025-10-02T09:00:00Z" }
  ];

  const posts = [
    {
      id: 1,
      author_id: 1,
      title: "What’s New in Our Blog Platform",
      content: "We’ve kicked off a clean single-page experience focused on speed and clarity. Expect practical guides on building with PHP, Flight, and MySQL, plus UI notes that keep things elegant without the noise.",
      category_id: 1,
      created_at: "2025-10-05T12:00:00Z"
    },
    {
      id: 2,
      author_id: 1,
      title: "Designing Minimal Interfaces That Still Pop",
      content: "Minimal doesn’t mean boring. Thoughtful typography, restrained color, and micro-interactions create calm interfaces that still feel alive. Here’s how we approach hierarchy, spacing, and motion.",
      category_id: 2,
      created_at: "2025-10-06T15:30:00Z"
    },
    {
      id: 3,
      author_id: 2,
      title: "Hash Routing in a Nutshell",
      content: "Hash routing keeps navigation instant by swapping views without a full reload. It’s perfect for small SPAs: simple to implement, no server config, and easy to reason about.",
      category_id: 2,
      created_at: "2025-10-07T09:45:00Z"
    },
    {
      id: 4,
      author_id: 1,
      title: "From Sketch to Layout: A Quick Process",
      content: "Start with content structure, then apply a system of scales for type and spacing. Add one accent color and keep contrast high. The result: readable, confident UI that respects the content.",
      category_id: 2,
      created_at: "2025-10-08T08:20:00Z"
    },
    {
      id: 5,
      author_id: 1,
      title: "Project Roadmap",
      content: "Upcoming features include authentication with JWT, role-based dashboards, and a clean REST API with FlightPHP. We’ll document everything with OpenAPI and wire it into the SPA via AJAX.",
      category_id: 1,
      created_at: "2025-10-09T16:05:00Z"
    },
    {
      id: 6,
      author_id: 2,
      title: "Little Details That Improve Forms",
      content: "Use floating labels sparingly, give inputs breathing room, and keep error states honest and readable. The best forms stay out of the way and support the task at hand.",
      category_id: 2,
      created_at: "2025-10-10T10:10:00Z"
    }
  ];

  const post_tags = [
    { post_id: 1, tag_id: 4 },
    { post_id: 1, tag_id: 5 },
    { post_id: 2, tag_id: 4 },
    { post_id: 2, tag_id: 1 },
    { post_id: 3, tag_id: 1 },
    { post_id: 3, tag_id: 5 },
    { post_id: 4, tag_id: 4 },
    { post_id: 5, tag_id: 2 },
    { post_id: 5, tag_id: 3 },
    { post_id: 6, tag_id: 4 },
    { post_id: 6, tag_id: 5 }
  ];

  const comments = [
    { id: 1, post_id: 1, user_id: 2, content: "Great direction. Looking forward to the API docs!", created_at: "2025-10-08T10:00:00Z", status: "visible" },
    { id: 2, post_id: 1, user_id: 2, content: "Typography feels really nice.", created_at: "2025-10-08T10:10:00Z", status: "visible" },
    { id: 3, post_id: 2, user_id: 1, content: "Motion done right makes all the difference.", created_at: "2025-10-08T11:00:00Z", status: "visible" },
    { id: 4, post_id: 3, user_id: 2, content: "Simple and effective explanation.", created_at: "2025-10-08T12:00:00Z", status: "visible" }
  ];

  function tagsForPost(postId) {
    const ids = post_tags.filter(pt => pt.post_id === postId).map(pt => pt.tag_id);
    return tags.filter(t => ids.includes(t.id));
  }

  function author(userId) { return users.find(u => u.id === userId); }
  function category(catId) { return categories.find(c => c.id === catId); }

  return { categories, tags, users, posts, comments, post_tags, tagsForPost, author, category };
})();
