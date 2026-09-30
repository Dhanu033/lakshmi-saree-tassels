app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username !== ADMIN_USER) {
    return res.status(401).json({ error: "USERNAME_MISMATCH" });
  }

  if (password !== ADMIN_PASS) {
    return res.status(401).json({ error: "PASSWORD_MISMATCH" });
  }

  req.session.admin = true;
  return res.json({ ok: true });
});
