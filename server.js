const express = require("express");
const session = require("express-session");
const multer = require("multer");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Login details: set ADMIN_USER and ADMIN_PASS in Railway > Variables.
// .trim() removes accidental spaces at the start or end.
const ADMIN_USER = String(process.env.ADMIN_USER || "admin").trim();
const ADMIN_PASS = String(process.env.ADMIN_PASS || "Lakshmi@123").trim();

// Optional: point these to a Railway Volume so data survives redeploys.
// Example: DATA_DIR=/data/db  and  UPLOAD_DIR=/data/uploads
const dataDir = process.env.DATA_DIR || path.join(__dirname, "data");
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, "public", "uploads");
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadDir, { recursive: true });

const db = new Database(path.join(dataDir, "lakshmi.db"));
db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  image TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

app.set("trust proxy", 1); // Railway runs behind a proxy
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || "change-this-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", maxAge: 1000 * 60 * 60 * 24 * 7 }
}));
app.use("/uploads", express.static(uploadDir));
app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + "-" + Math.random().toString(36).slice(2) + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = /image\/(jpeg|png|webp|jpg)/.test(file.mimetype);
    cb(ok ? null : new Error("Only JPG, PNG and WEBP images are allowed"), ok);
  }
});

function auth(req, res, next) {
  if (req.session.admin) return next();
  res.status(401).json({ error: "Unauthorized" });
}

function removeImage(imagePath) {
  if (!imagePath) return;
  const file = path.join(uploadDir, path.basename(imagePath));
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

app.get("/api/products", (req, res) => {
  res.json(db.prepare("SELECT * FROM products ORDER BY id DESC").all());
});

app.post("/api/login", (req, res) => {
  const username = String((req.body && req.body.username) || "").trim();
  const password = String((req.body && req.body.password) || "").trim();
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.admin = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: "Invalid username or password" });
});

app.get("/api/check", (req, res) => {
  res.json({
    userSet: !!process.env.ADMIN_USER,
    passSet: !!process.env.ADMIN_PASS,
    userLength: ADMIN_USER.length,
    passLength: ADMIN_PASS.length,
    userStart: ADMIN_USER.slice(0, 3)
  });
});

app.post("/api/logout", auth, (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/me", (req, res) => res.json({ admin: !!req.session.admin }));

app.post("/api/products", auth, upload.single("image"), (req, res) => {
  const name = String(req.body.name || "").trim();
  const price = Number(req.body.price);
  if (!name || !Number.isFinite(price) || price < 0)
    return res.status(400).json({ error: "Enter a valid name and price" });
  const image = req.file ? "/uploads/" + req.file.filename : null;
  const info = db.prepare("INSERT INTO products (name,price,image) VALUES (?,?,?)").run(name, price, image);
  res.json(db.prepare("SELECT * FROM products WHERE id=?").get(info.lastInsertRowid));
});

app.put("/api/products/:id", auth, upload.single("image"), (req, res) => {
  const id = Number(req.params.id);
  const old = db.prepare("SELECT * FROM products WHERE id=?").get(id);
  if (!old) return res.status(404).json({ error: "Product not found" });
  const name = String(req.body.name || "").trim();
  const price = Number(req.body.price);
  if (!name || !Number.isFinite(price) || price < 0)
    return res.status(400).json({ error: "Enter a valid name and price" });
  let image = old.image;
  if (req.file) {
    image = "/uploads/" + req.file.filename;
    removeImage(old.image);
  }
  db.prepare("UPDATE products SET name=?,price=?,image=? WHERE id=?").run(name, price, image, id);
  res.json(db.prepare("SELECT * FROM products WHERE id=?").get(id));
});

app.delete("/api/products/:id", auth, (req, res) => {
  const id = Number(req.params.id);
  const old = db.prepare("SELECT * FROM products WHERE id=?").get(id);
  if (!old) return res.status(404).json({ error: "Product not found" });
  removeImage(old.image);
  db.prepare("DELETE FROM products WHERE id=?").run(id);
  res.json({ ok: true });
});

app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "public", "admin.html")));

app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message || "Something went wrong" });
});

app.listen(PORT, () => console.log(`LAKSHMI Saree Tassels running on port ${PORT}`));
