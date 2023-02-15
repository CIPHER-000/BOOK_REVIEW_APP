const express = require('express');
const request = require("request");
const app = express();
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const axios = require('axios');
const router = express.Router();
const fetch = require('node-fetch');


app.use(bodyParser.json());


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

app.get('/mybooks', function(req, res) {
    res.sendFile(__dirname + '/views/templates/books.html');
});


app.get('/apology', function(req, res) {
    res.sendFile(__dirname + '/views/templates/apology.html');
});

app.get('/apologypass', function(req, res) {
    res.sendFile(__dirname + '/views/templates/apologypass.html');
});

app.get('/apologyemail', function(req, res) {
    res.sendFile(__dirname + '/views/templates/apologyemail.html');
});



app.get('/static/styles.css', function(req, res) {
    res.set('Content-Type', 'text/css');
    res.sendFile(__dirname + '/views/static/styles.css');
});

app.get('/static/apology.css', function(req, res) {
    res.set('Content-Type', 'text/css');
    res.sendFile(__dirname + '/views/static/apology.css');
});

app.get('/static/homepage.css', function(req, res) {
    res.set('Content-Type', 'text/css');
    res.sendFile(__dirname + '/views/static/homepage.css');
});

app.get('/static/books.css', function(req, res) {
    res.set('Content-Type', 'text/css');
    res.sendFile(__dirname + '/views/static/books.css');
});


const { check, validationResult } = require('express-validator');


app.post('/signup', [
    check('email').isEmail().withMessage('Email is invalid'),
    check('password1').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
], (req, res) => {
    const errors = validationResult(req);
    const email = req.body.email;
    const username1 = req.body.username1;
    const password1 = req.body.password1;


    let sql = "SELECT * FROM user WHERE email = ?";
    con.query(sql, [email], (err, result) => {
        if (err) {
            req.flash('error', 'Something went wrong. Please try again later.');
            return res.redirect('/');
        }
        if (result.length > 0) {
            req.flash('error', 'This email is already taken');
            return res.redirect('/apology');
        } else {
            bcrypt.hash(password1, saltRounds, function(err, hash) {
                if (err) {
                    req.flash('error', 'Something went wrong. Please try again later.');
                    return res.redirect('/');
                }
                let sql = 'INSERT INTO user (username, email, password) VALUES (?, ?, ?)';
                con.query(sql, [username1, email, hash], function(err, result) {
                    if (err) {
                        req.flash('error', 'Something went wrong. Please try again later.');
                        return res.redirect('/');
                    }
                    console.log('Form inputs inserted into database');
                    req.flash('success', 'Your account has been created successfully.');
                    return res.redirect('/homepage');
                });
            });
        }
    });
});



app.post('/signin', function(req, res, next) {
    let email = req.body.email;
    let password = req.body.password;

    let sql = "SELECT * FROM user WHERE email = ?";
    let results = con.query(sql, [email], (err, result) => {
        if (err) {
            req.flash('error', 'Something went wrong. Please try again later.');
            return res.redirect('/');
        }
        if (result.length > 0) {
            bcrypt.compare(password, result[0].password, function(err, passwordMatch) {
                if (err) {
                    req.flash('error', 'Something went wrong. Please try again later.');
                    return res.redirect('/');
                }
                if (passwordMatch) {
                    req.session.user = result[0];
                    return res.redirect('/homepage');
                } else {
                    req.flash('error', 'Invalid password');
                    return res.redirect('/apologypass');
                }
            });
        } else {
            req.flash('error', 'Invalid email');
            return res.redirect('/apologyemail');
        }
    });
});




app.post('/homepage', (req, res) => {
    const { title, author, publication_date, description, reviews, cover_image, genre, bio } = req.body;
    console.log(title)
    console.log(author)
    console.log(publication_date)
    console.log(description)
    console.log(reviews)
    console.log(cover_image)
    console.log(genre)
    console.log(bio)

    const bookSql =
        "INSERT INTO book (title, author, description, publication_date, cover_image, reviews, genre) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const bookValues = [title, author, description, publication_date, cover_image, reviews, genre];

    const authorSql =
        "INSERT INTO author (name, bio) VALUES (?, ?)";
    const authorValues = [author, bio];

    console.log("reaches here!!!");

    con.connect(function(err) {
        if (err) {
            console.error("Error connecting to database: " + err.stack);
            console.log("Error connecting to the database!!!");
            return;
        }
        console.log("Connected to database successfully");

        con.query(authorSql, authorValues, function(error, authorResults, fields) {
            if (error) {
                console.log("Error inserting the author into the database: " + error);
            } else {
                console.log("Author added to the database successfully");


                con.query(bookSql, bookValues, function(error, bookResults, fields) {
                    if (error) {
                        console.log("Error inserting the book into the database: " + error);
                    } else {
                        console.log("Book added to the database successfully");
                        res.redirect("/mybooks"); // redirect to /mybooks page
                    }
                });
            }
        });
    });
});



app.listen(8000, () => {
    console.log('App listening on port 8000');
});







//The code is an Express.js application that creates an API
//for a review book website.It uses the following libraries: express, mysql2, body - parser, crypto, bcrypt, connect - flash, express - session, sequelize, passport, passport - local.

//The app connects to a MySQL database with the connection details host: 'localhost', user: 'root', password: 'root_toor', database: 'review book'.

//The authentication is done using passport and the LocalStrategy strategy.The user inputs are checked against the stored user information in the database.The password is hashed using bcrypt.

//The code serves HTML pages and CSS files to the client.The user can either log in or sign up by submitting a form in the '/'
//endpoint.If the authentication is successful, the user is redirected to the homepage, otherwise the user is redirected back to the login page with a failure flash message.

//When a user signs up, the form inputs are inserted into the MySQL database using an SQL query.The password is hashed and stored in the database.