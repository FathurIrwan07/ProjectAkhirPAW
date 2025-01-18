// Definisi Library yang digunakan
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const flash = require("connect-flash");
const app = express();

// Definisi lokasi file router
const loginRoutes = require("./src/routes/router-login");
const registerRoutes = require("./src/routes/router-register");
const contactRoutes = require("./src/routes/router-contact");
const todosRoutes = require("./src/routes/router-todo");
const appRoutes = require("./src/routes/router-app");
const adminRoutes = require("./src/routes/router-admin");
const userRoutes = require("./src/routes/router-user");

// Konfigurasi library session
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "t@1k0ch3ng", // Ganti dengan secret key yang lebih aman
    name: "secretName",
    cookie: {
      sameSite: true,
      maxAge: 24 * 60 * 60 * 1000, // Set ke 24 jam
    },
  })
);

// Configurasi dan gunakan library
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(flash());

// Set headers untuk menghindari caching
app.use(function (req, res, next) {
  res.setHeader(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  res.setHeader("Pragma", "no-cache");
  next();
});

// Middleware untuk menyediakan data user ke semua views
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.loggedin || false;
  res.locals.username = req.session.username || null;
  res.locals.role = req.session.role || null;
  res.locals.url = "/";
  next();
});

// Configurasi static folder untuk public assets
app.use("/public", express.static(path.join(__dirname, "public")));

// Setting folder views dan view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

// Gunakan routes yang telah didefinisikan
app.use("/login", loginRoutes);
app.use("/register", registerRoutes);

// Rute untuk halaman todos (menampilkan daftar film atau todo)
app.get("/todos", (req, res) => {
  res.render("todos");
});

// Rute untuk halaman team
app.get("/team", (req, res) => {
  res.render("team");
});

// Route untuk halaman admin film
app.get("/admin/film", (req, res) => {
  res.render("admin/film");
});

// Routes yang memerlukan authentication
const verifyUser = require("./src/configs/verify");

// Admin routes
app.use("/admin", verifyUser.isLogin, adminRoutes);

// User routes
app.use("/user", verifyUser.isLogin, userRoutes);

// Routes yang bisa diakses setelah login (baik admin maupun user)
app.use("/contact", contactRoutes);
app.use("/todos", verifyUser.isLogin, todosRoutes);

// Route utama
app.use("/", appRoutes);

// Route untuk 404 - Page Not Found
app.use((req, res) => {
  res.status(404).render("error", {
    url: "http://localhost:5050/",
    title: "Page Not Found",
    error: "Halaman tidak ditemukan",
  });
});

// Middleware untuk penanganan error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", {
    message: "Internal Server Error",
    error: err,
  });
});

// API Endpoint untuk menyimpan tiket
app.post("/tickets", (req, res) => {
  const { code, film, schedule, seats, payment_method } = req.body;

  // Validasi input
  if (!code || !film || !schedule || !seats || !payment_method) {
    return res.status(400).send("All fields are required");
  }

  const query =
    "INSERT INTO tickets (code, film, schedule, seats, payment_method) VALUES (?, ?, ?, ?, ?)";

  db.query(
    query,
    [code, film, schedule, seats, payment_method],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error saving ticket");
      }
      res.status(200).send("Ticket saved successfully");
    }
  );
});

// Gunakan port server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server Berjalan di Port : ${PORT}`);
});
