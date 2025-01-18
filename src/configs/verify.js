module.exports = {
  isLogin(req, res, next) {
    if (req.session.loggedin === true) {
      next();
      return;
    }
    res.redirect("/login");
  },

  isLogout(req, res, next) {
    if (req.session.loggedin !== true) {
      next();
      return;
    }
    res.redirect("/");
  },

  isAdmin(req, res, next) {
    if (req.session.loggedin === true && req.session.role === "admin") {
      next();
      return;
    }
    res.redirect("/login");
  },

  isUser(req, res, next) {
    if (req.session.loggedin === true && req.session.role === "user") {
      next();
      return;
    }
    res.redirect("/login");
  },
};
