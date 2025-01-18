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
const adminRoutes = require("./src/routes/router-admin"); // Tambah router admin
const userRoutes = require("./src/routes/router-user"); // Tambah router user

// Konfigurasi library session
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "t@1k0ch3ng",
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
  next();
});

// Configurasi static folder untuk public assets
app.use("/public", express.static(path.join(__dirname, "public")));

// Setting folder views dan view engine
// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

// Gunakan routes yang telah didefinisikan
app.use("/login", loginRoutes);
app.use("/register", registerRoutes);

app.get("/todos", (req, res) => {
  const url = "/"; // Atur URL dasar
  res.render("todos", { url }); // Kirim ke template todos.ejs
});

// Rute untuk halaman team
app.get("/team", (req, res) => {
  const url = "/";
  res.render("team", { url });
});

// Route untuk halaman admin film
app.get("/admin/film", (req, res) => {
  res.render("admin/film"); // Render file src/views/admin/film.ejs
});

// Routes yang memerlukan authentication
const verifyUser = require("./src/configs/verify");

// Admin routes
app.use("/admin", require("./src/routes/router-admin"));

// User routes
app.use("/user", require("./src/routes/router-user"));

// Routes yang bisa diakses setelah login (baik admin maupun user)
app.use("/contact", contactRoutes);
app.use("/todos", verifyUser.isLogin, todosRoutes);

// Route utama
app.use("/", appRoutes);

// Route untuk 404 - Page Not Found

// Middleware untuk penanganan error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", {
    url: "http://localhost:5050/",
    title: "Internal Server Error",
    error: err.message,
  });
});

// Gunakan port server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server Berjalan di Port : ${PORT}`);
});
