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
      title: "Welcome to the Blog Platform",
      content: "This is a static mock post introducing the platform.",
      category_id: 1,
      created_at: "2025-10-05T12:00:00Z"
    },
    {
      id: 2,
      author_id: 1,
      title: "Designing a Minimal Yet Interesting Theme",
      content: "Thoughts on building clean, modern UI with subtle accents.",
      category_id: 2,
      created_at: "2025-10-06T15:30:00Z"
    },
    {
      id: 3,
      author_id: 2,
      title: "How Hash Routing Works",
      content: "A brief overview of SPA hash routing and view rendering.",
      category_id: 2,
      created_at: "2025-10-07T09:45:00Z"
    }
  ];

  const post_tags = [
    { post_id: 1, tag_id: 4 },
    { post_id: 1, tag_id: 5 },
    { post_id: 2, tag_id: 4 },
    { post_id: 2, tag_id: 1 },
    { post_id: 3, tag_id: 1 },
    { post_id: 3, tag_id: 5 }
  ];

  const comments = [
    { id: 1, post_id: 1, user_id: 2, content: "Looks great!", created_at: "2025-10-08T10:00:00Z", status: "visible" },
    { id: 2, post_id: 1, user_id: 2, content: "Excited to see more.", created_at: "2025-10-08T10:10:00Z", status: "visible" },
    { id: 3, post_id: 2, user_id: 1, content: "Agree on the aesthetic.", created_at: "2025-10-08T11:00:00Z", status: "visible" },
    { id: 4, post_id: 3, user_id: 2, content: "Helpful explanation.", created_at: "2025-10-08T12:00:00Z", status: "visible" }
  ];

  function tagsForPost(postId) {
    const ids = post_tags.filter(pt => pt.post_id === postId).map(pt => pt.tag_id);
    return tags.filter(t => ids.includes(t.id));
  }

  function author(userId) { return users.find(u => u.id === userId); }
  function category(catId) { return categories.find(c => c.id === catId); }

  return { categories, tags, users, posts, comments, post_tags, tagsForPost, author, category };
})();
