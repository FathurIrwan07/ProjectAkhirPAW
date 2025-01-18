const config = require("../configs/database");
let mysql = require("mysql");
let pool = mysql.createPool(config);

pool.on("error", (err) => {
  console.error("MySQL Pool Error:", err);
});

module.exports = {
  formRegister(req, res) {
    res.render("register", {
      url: "http://localhost:5050/",
    });
  },

  saveRegister(req, res) {
    const { username, email, pass: password } = req.body;

    if (!username || !email || !password) {
      req.flash("color", "danger");
      req.flash("status", "Oops..");
      req.flash("message", "Semua kolom harus diisi");
      return res.redirect("/register");
    }

    pool.getConnection(function (err, connection) {
      if (err) {
        console.error("Database Connection Error:", err);
        req.flash("color", "danger");
        req.flash("status", "Oops..");
        req.flash("message", "Terjadi kesalahan saat koneksi ke database");
        return res.redirect("/register");
      }

      const emailCheckQuery = "SELECT * FROM users WHERE email = ?";
      connection.query(emailCheckQuery, [email], function (error, results) {
        if (error) {
          console.error("Error in Email Check Query:", error);
          connection.release();
          req.flash("color", "danger");
          req.flash("status", "Oops..");
          req.flash("message", "Terjadi kesalahan saat cek email");
          return res.redirect("/register");
        }

        if (results.length > 0) {
          req.flash("color", "danger");
          req.flash("status", "Oops..");
          req.flash(
            "message",
            "Email sudah terdaftar, silakan gunakan email lain"
          );
          return res.redirect("/register");
        } else {
          const insertQuery =
            "INSERT INTO users (nama, email, password) VALUES (?, ?, SHA2(?, 512))";
          connection.query(
            insertQuery,
            [username, email, password],
            function (error, results) {
              if (error) {
                console.error("Error in Registration Query:", error);
                connection.release();
                req.flash("color", "danger");
                req.flash("status", "Oops..");
                req.flash("message", "Terjadi kesalahan saat registrasi");
                return res.redirect("/register");
              }

              req.flash("color", "success");
              req.flash("status", "Yes..");
              req.flash("message", "Registrasi berhasil. Silakan login");
              res.redirect("/login");
            }
          );
        }
      });

      connection.release(); // Pastikan koneksi dilepaskan setelah query selesai
    });
  },
};
