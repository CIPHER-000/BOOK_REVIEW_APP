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
console.log("secret:", secret);

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

app.get('/homepage', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.sendFile(__dirname + '/views/templates/homepage.html');
});

app.get('/static/styles.css', function(req, res) {
    res.set('Content-Type', 'text/css');
    res.sendFile(__dirname + '/views/static/styles.css');
});


app.post('/', passport.authenticate('local', {
    successRedirect: '/homepage',
    failureRedirect: '/',
    failureFlash: true
}));

app.post('/', (req, res) => {
    const sql = 'INSERT INTO user (username, email, password) VALUES (?, ?, ?)';
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const username1 = req.body.username1;
    const password1 = req.body.password1;

    bcrypt.hash(password1, saltRounds, function(err, hash) {
        con.query('INSERT INTO user (username, email, password) VALUES (?, ?, ?)', [username1, email, hash], function(err, result) {
            if (err) throw err;
            console.log('Form inputs inserted into database');
            console.log("Hash:", hash)
            res.redirect('/homepage');
        });
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