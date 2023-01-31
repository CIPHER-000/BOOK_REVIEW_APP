const express = require('express');
const app = express();
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;

var flash = require('connect-flash');
app.use(flash());

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root_toor",
    database: "review book"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to MySQL");
});

const secret = require('crypto').randomBytes(64).toString('hex');
console.log("Secret key:", secret);

const session = require("express-session");
app.use(session({
    secret,
    resave: false,
    saveUninitialized: false
}));

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function(username, password, done) {
        const checkUser = 'SELECT * FROM user WHERE username = ?';
        con.query(checkUser, [username], function(err, results) {
            if (err) return done(err);
            if (!results.length) {
                return done(null, false, { message: 'Incorrect username' });
            }
            const hashedPassword = results[0].password;
            bcrypt.compare(password, hashedPassword, function(err, isMatch) {
                if (err) return done(err);
                if (!isMatch) {
                    return done(null, false, { message: 'Incorrect password' });
                }
                return done(null, results[0]);
            });
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    const sql = 'SELECT * FROM user WHERE id = ?';
    con.query(sql, [id], function(err, results) {
        if (err) return done(err);
        done(null, results[0]);
    });
});

app.use(passport.initialize());
app.use(passport.session());


app.use(express.static('static'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/templates/layout.html');
});

app.get('/signin', function(req, res) {
    res.sendFile(__dirname + '/views/templates/layout.html');
});

app.get('/signup', function(req, res) {
    res.sendFile(__dirname + '/views/templates/layout.html');
});

app.get('/homepage', function(req, res) {
    res.sendFile(__dirname + '/views/templates/homepage.html');
});

app.get('/static/styles.css', function(req, res) {
    res.set('Content-Type', 'text/css');
    res.sendFile(__dirname + '/views/static/styles.css');
});



const { check, validationResult } = require('express-validator');

app.post('/signup', [
    check('email').isEmail().withMessage('Email is invalid'),
    check('password1').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
], (req, res) => {
    const errors = validationResult(req);
    const sql = 'INSERT INTO user (username, email, password) VALUES (?, ?, ?)';
    const email = req.body.email;
    const username1 = req.body.username1;
    const password1 = req.body.password1;
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(error => error.msg));
        return res.redirect('/homepage');
    }

    bcrypt.hash(password1, saltRounds, function(err, hash) {
        con.query(sql, [username1, email, hash], function(err, result) {
            if (err) throw err;
            console.log('Form inputs inserted into database');
            console.log("Hash:", hash)
            res.redirect('/');
        });
    });
});

app.post('/signin', function(req, res, next) {
    let email = req.body.email;
    let password = req.body.password;

    let sql = "SELECT * FROM user WHERE email = ? AND password = ?";
    con.query(sql, [email, password], (err, result) => {
        if (err) {
            req.flash('error', 'Something went wrong. Please try again later.');
            res.redirect('/');
        }
        if (result.length > 0) {
            req.login(result[0], function(err) {
                if (err) {
                    req.flash('error', 'Something went wrong. Please try again later.');
                    res.redirect('/');
                }
                res.redirect('/homepage');
            });
        } else {
            req.flash('error', 'Invalid email or password');
            res.redirect('/');
        }
    });
});


app.listen(3000, () => {
    console.log('App listening on port 3000');
});





//The code is an Express.js application that creates an API
//for a review book website.It uses the following libraries: express, mysql2, body - parser, crypto, bcrypt, connect - flash, express - session, sequelize, passport, passport - local.

//The app connects to a MySQL database with the connection details host: 'localhost', user: 'root', password: 'root_toor', database: 'review book'.

//The authentication is done using passport and the LocalStrategy strategy.The user inputs are checked against the stored user information in the database.The password is hashed using bcrypt.

//The code serves HTML pages and CSS files to the client.The user can either log in or sign up by submitting a form in the '/'
//endpoint.If the authentication is successful, the user is redirected to the homepage, otherwise the user is redirected back to the login page with a failure flash message.

//When a user signs up, the form inputs are inserted into the MySQL database using an SQL query.The password is hashed and stored in the database.