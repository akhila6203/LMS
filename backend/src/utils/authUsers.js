const toPublicAdmin = (admin) => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
  bio: admin.bio || "",
  avatar: admin.avatar || null,
  role: "admin",
  status: admin.status,
});

module.exports = { toPublicAdmin };
