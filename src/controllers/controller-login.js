const config = require('../configs/database');
let mysql = require('mysql');
let pool = mysql.createPool(config);

pool.on('error', (err) => {
    console.error(err);
});

module.exports = {
    login(req, res) {
        res.render("login", {
            url: 'http://localhost:5050/',
            colorFlash: req.flash('color'),
            statusFlash: req.flash('status'),
            pesanFlash: req.flash('message'),
        });
    },

    loginAuth(req, res) {
        let email = req.body.email;
        let password = req.body.pass;

        if (email && password) {
            pool.getConnection(function(err, connection) {
                if (err) throw err;

                // Debug log - Input yang diterima
                console.log('=== Debug Info ===');
                console.log('Email:', email);
                console.log('Password:', password);

                // Query untuk admin
                const adminQuery = 'SELECT * FROM admin WHERE email = ? AND password = SHA2(?,512)';
                console.log('Admin Query:', adminQuery); // Debug query

                connection.query(
                    adminQuery,
                    [email, password],
                    function (error, adminResults) {
                        if (error) {
                            console.log('Admin Query Error:', error);
                            throw error;
                        }

                        // Debug log - Hasil query admin
                        console.log('Admin Results:', adminResults);
                        console.log('Admin Results Length:', adminResults.length);

                        if (adminResults && adminResults.length > 0) {
                            console.log('Admin login successful');
                            req.session.loggedin = true;
                            req.session.userid = adminResults[0].id;
                            req.session.username = adminResults[0].nama;
                            req.session.role = 'admin';
                            
                            console.log('Session data:', req.session);
                            res.redirect('/admin/dashboard');
                        } else {
                            console.log('Checking user table...');
                            // Query untuk user biasa
                            connection.query(
                                `SELECT * FROM users WHERE email = ? AND password = SHA2(?,512)`,
                                [email, password],
                                function (error, userResults) {
                                    if (error) {
                                        console.log('User Query Error:', error);
                                        throw error;
                                    }

                                    // Debug log - Hasil query user
                                    console.log('User Results:', userResults);

                                    if (userResults.length > 0) {
                                        console.log('User login successful');
                                        req.session.loggedin = true;
                                        req.session.userid = userResults[0].id;
                                        req.session.username = userResults[0].nama;
                                        req.session.role = 'user';
                                        res.redirect('/');
                                    } else {
                                        console.log('No user found');
                                        req.flash('color', 'danger');
                                        req.flash('status', 'Oops..');
                                        req.flash('message', 'Akun tidak ditemukan');
                                        res.redirect('/login');
                                    }
                                }
                            );
                        }
                    }
                );
                connection.release();
            });
        } else {
            res.redirect('/login');
            res.end();
        }
    },

    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                return console.log(err);
            }
            res.clearCookie('secretname');
            res.redirect('/login');
        });
    }
};